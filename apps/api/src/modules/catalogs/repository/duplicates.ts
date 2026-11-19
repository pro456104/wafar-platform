// The one read that can see another merchant's row: the retained duplicate's
// four-field projection, and nothing else (FR-009, FR-044; ADR-170).
import { and, eq, isNull } from 'drizzle-orm';
import { catalogs, type Database, type Transaction } from '@wafar/db';
import type { RetainedDuplicate } from '@wafar/shared';

export type Queryable = Database | Transaction;

export function createDuplicatesRepository(db: Queryable) {
  return {
    async findRetainedByHash(contentHash: string): Promise<RetainedDuplicate | null> {
      const rows = await db
        .select({
          id: catalogs.id,
          fileName: catalogs.fileName,
          uploadedAt: catalogs.uploadedAt,
          status: catalogs.status,
        })
        .from(catalogs)
        .where(and(eq(catalogs.contentHash, contentHash), isNull(catalogs.deletedAt)))
        .limit(1);
      const row = rows[0];
      if (row === undefined) return null;
      const status = row.status;
      return {
        id: row.id,
        fileName: row.fileName,
        uploadedAt: row.uploadedAt.toISOString(),
        status:
          status === 'processing' || status === 'completed' || status === 'failed'
            ? status
            : 'uploaded',
      };
    },
  };
}

export type DuplicatesRepository = ReturnType<typeof createDuplicatesRepository>;
