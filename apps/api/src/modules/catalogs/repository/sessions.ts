// The upload session's repository: the `open -> completing -> done | failed`
// and `open -> aborted` machine, the owner check, and the two recorded keys the
// deferred sweep reads (FR-050, data-model.md §5).
import { and, eq, sql } from 'drizzle-orm';
import { catalogUploadSessions, type Database, type Transaction } from '@wafar/db';

export type Queryable = Database | Transaction;
export type SessionState = 'open' | 'completing' | 'done' | 'aborted' | 'failed';

export interface UploadSession {
  id: string;
  userId: string;
  uploadId: string;
  originalKey: string;
  sanitizedKey: string | null;
  fileName: string;
  declaredBytes: number;
  format: 'xls' | 'xlsx' | 'doc' | 'docx' | 'pdf';
  contentHash: string | null;
  state: SessionState;
  urlExpiresAt: Date;
  completedAt: Date | null;
  abortedAt: Date | null;
}

function toSession(row: typeof catalogUploadSessions.$inferSelect): UploadSession {
  const state = row.state;
  return {
    id: row.id,
    userId: row.userId,
    uploadId: row.uploadId,
    originalKey: row.originalKey,
    sanitizedKey: row.sanitizedKey,
    fileName: row.fileName,
    declaredBytes: Number(row.declaredBytes),
    format:
      row.format === 'xlsx' || row.format === 'doc' || row.format === 'docx' || row.format === 'pdf'
        ? row.format
        : 'xls',
    contentHash: row.contentHash,
    state:
      state === 'completing' || state === 'done' || state === 'aborted' || state === 'failed'
        ? state
        : 'open',
    urlExpiresAt: row.urlExpiresAt,
    completedAt: row.completedAt,
    abortedAt: row.abortedAt,
  };
}

export function createSessionsRepository(db: Queryable) {
  return {
    async create(input: {
      id: string;
      userId: string;
      uploadId: string;
      originalKey: string;
      fileName: string;
      declaredBytes: number;
      format: UploadSession['format'];
      urlExpiresAt: Date;
    }): Promise<UploadSession> {
      const rows = await db
        .insert(catalogUploadSessions)
        .values({
          id: input.id,
          userId: input.userId,
          uploadId: input.uploadId,
          originalKey: input.originalKey,
          fileName: input.fileName,
          declaredBytes: input.declaredBytes,
          format: input.format,
          urlExpiresAt: input.urlExpiresAt,
        })
        .returning();
      const row = rows[0];
      if (row === undefined) throw new Error('session insert returned no row');
      return toSession(row);
    },

    async findOwned(userId: string, uploadId: string): Promise<UploadSession | null> {
      const rows = await db
        .select()
        .from(catalogUploadSessions)
        .where(
          and(
            eq(catalogUploadSessions.id, uploadId),
            eq(catalogUploadSessions.userId, userId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row === undefined ? null : toSession(row);
    },

    /** `open -> completing`; only an open row moves, so a second complete is safe. */
    async beginCompleting(uploadId: string): Promise<boolean> {
      const rows = await db
        .update(catalogUploadSessions)
        .set({ state: 'completing' })
        .where(
          and(
            eq(catalogUploadSessions.id, uploadId),
            eq(catalogUploadSessions.state, 'open'),
          ),
        )
        .returning({ id: catalogUploadSessions.id });
      return rows.length === 1;
    },

    async settle(
      uploadId: string,
      input: {
        state: 'completing' | 'done' | 'failed';
        at: Date;
        sanitizedKey?: string | null;
        contentHash?: string | null;
      },
    ): Promise<void> {
      await db
        .update(catalogUploadSessions)
        .set({
          state: input.state,
          completedAt: input.at,
          ...(input.sanitizedKey === undefined ? {} : { sanitizedKey: input.sanitizedKey }),
          ...(input.contentHash === undefined ? {} : { contentHash: input.contentHash }),
        })
        .where(eq(catalogUploadSessions.id, uploadId));
    },

    /** `open -> aborted`, stamped with the abort's own time. */
    async abort(uploadId: string, at: Date): Promise<void> {
      await db
        .update(catalogUploadSessions)
        .set({ state: 'aborted', abortedAt: at })
        .where(
          and(
            eq(catalogUploadSessions.id, uploadId),
            eq(catalogUploadSessions.state, 'open'),
          ),
        );
    },

    async complete(
      uploadId: string,
      input: { at: Date; sanitizedKey?: string | null; contentHash?: string | null },
    ): Promise<void> {
      await db
        .update(catalogUploadSessions)
        .set({
          state: 'done',
          completedAt: input.at,
          ...(input.sanitizedKey === undefined ? {} : { sanitizedKey: input.sanitizedKey }),
          ...(input.contentHash === undefined ? {} : { contentHash: input.contentHash }),
        })
        .where(eq(catalogUploadSessions.id, uploadId));
    },

    async count(): Promise<number> {
      const rows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(catalogUploadSessions);
      return rows[0]?.count ?? 0;
    },
  };
}

export type SessionsRepository = ReturnType<typeof createSessionsRepository>;
