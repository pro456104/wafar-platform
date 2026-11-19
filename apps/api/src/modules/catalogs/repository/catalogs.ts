// The catalog record's repository: one row per accepted file, the retained
// predicate the quota reads, and the active count over it (FR-035-FR-039).
import { and, eq, isNull, sql } from 'drizzle-orm';
import { catalogs, type Database, type Transaction } from '@wafar/db';
import type { CatalogStatus } from '@wafar/shared';

export type Queryable = Database | Transaction;

export interface NewCatalog {
  id: string;
  userId: string;
  fileName: string;
  byteSize: number;
  contentType: string;
  contentHash: string;
  storageKey: string;
  uploadedAt: Date;
}

export interface CatalogRow {
  id: string;
  userId: string;
  fileName: string;
  byteSize: number;
  contentType: string;
  contentHash: string;
  storageKey: string;
  status: CatalogStatus;
  uploadedAt: Date;
}

function toRow(row: typeof catalogs.$inferSelect): CatalogRow {
  const status = row.status;
  return {
    id: row.id,
    userId: row.userId,
    fileName: row.fileName,
    byteSize: Number(row.byteSize),
    contentType: row.contentType,
    contentHash: row.contentHash,
    storageKey: row.storageKey,
    status:
      status === 'processing' || status === 'completed' || status === 'failed'
        ? status
        : 'uploaded',
    uploadedAt: row.uploadedAt,
  };
}

/** The retained predicate every product read filters by: `deleted_at IS NULL`. */
export function retainedPredicate() {
  return isNull(catalogs.deletedAt);
}

export function createCatalogsRepository(db: Queryable) {
  return {
    retainedPredicate,

    async insert(input: NewCatalog): Promise<CatalogRow> {
      const rows = await db
        .insert(catalogs)
        .values({
          id: input.id,
          userId: input.userId,
          fileName: input.fileName,
          byteSize: input.byteSize,
          contentType: input.contentType,
          contentHash: input.contentHash,
          storageKey: input.storageKey,
          status: 'uploaded',
          uploadedAt: input.uploadedAt,
        })
        .returning();
      const row = rows[0];
      if (row === undefined) throw new Error('catalogs insert returned no row');
      return toRow(row);
    },

    async countActive(userId: string): Promise<number> {
      const rows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(catalogs)
        .where(and(eq(catalogs.userId, userId), retainedPredicate()));
      return rows[0]?.count ?? 0;
    },

    async findById(id: string): Promise<CatalogRow | null> {
      const rows = await db
        .select()
        .from(catalogs)
        .where(and(eq(catalogs.id, id), retainedPredicate()))
        .limit(1);
      const row = rows[0];
      return row === undefined ? null : toRow(row);
    },
  };
}

export type CatalogsRepository = ReturnType<typeof createCatalogsRepository>;
