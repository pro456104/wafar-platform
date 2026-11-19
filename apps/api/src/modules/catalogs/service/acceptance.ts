// The acceptance transaction: the per-merchant advisory lock, the re-read of
// both limits, the insert, and the counter upsert in one transaction, with the
// duplicate decided first (FR-011, FR-013, FR-014, FR-016, FR-019).
import { and, eq, sql } from 'drizzle-orm';
import { catalogs, catalogMonthlyUploads, type Database, type Transaction } from '@wafar/db';
import type { AccountContext, RetainedDuplicate } from '@wafar/shared';
import { createCatalogsRepository } from '../repository/catalogs.ts';
import { createCountersRepository } from '../repository/counters.ts';
import { createDuplicatesRepository } from '../repository/duplicates.ts';
import { decideLimits, effectiveLimits, monthKey } from './quota.ts';

export interface AcceptanceInput {
  userId: string;
  catalogId: string;
  fileName: string;
  byteSize: number;
  contentType: string;
  contentHash: string;
  storageKey: string;
  now: Date;
  account: AccountContext;
}

export type AcceptanceResult =
  | { kind: 'accepted'; catalogId: string; uploadedAt: Date }
  | { kind: 'duplicate'; original: RetainedDuplicate }
  | { kind: 'limit'; code: 'UPLOAD_MONTHLY_LIMIT' | 'UPLOAD_ACTIVE_LIMIT'; fields: ('monthly' | 'active')[] };

/** A unique-violation on the retained hash is the duplicate rule's signal. */
function isRetainedHashConflict(error: unknown): boolean {
  const value = error as {
    code?: string;
    constraint?: string;
    message?: string;
    cause?: { code?: string; constraint?: string; message?: string };
  };
  const code = value.code ?? value.cause?.code;
  const constraint = value.constraint ?? value.cause?.constraint;
  const message = value.message ?? value.cause?.message ?? '';
  return (
    code === '23505' &&
    (constraint === 'catalogs_content_hash_retained_uq' ||
      message.includes('catalogs_content_hash_retained_uq'))
  );
}

export function createAcceptance(db: Database) {
  return {
    async accept(input: AcceptanceInput): Promise<AcceptanceResult> {
      try {
        return await db.transaction(async (tx: Transaction) => {
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(hashtextextended(${input.userId}, 0))`,
          );

          const counters = createCountersRepository(tx, {
            readAccount: () => Promise.resolve(input.account),
          });
          const catalogs = createCatalogsRepository(tx);
          const now = input.now;
          const month = monthKey(now);

          // The duplicate is decided first: the insert's conflict on the
          // retained hash rolls the transaction back, and the outer catch reads
          // the original outside it (a failed statement aborts the transaction).
          await catalogs.insert({
            id: input.catalogId,
            userId: input.userId,
            fileName: input.fileName,
            byteSize: input.byteSize,
            contentType: input.contentType,
            contentHash: input.contentHash,
            storageKey: input.storageKey,
            uploadedAt: now,
          });

          const limits = effectiveLimits(input.account);
          // The monthly counter is written only by acceptance, so it still
          // reads the pre-acceptance count; the active count includes the row
          // this transaction just inserted, so one is taken back off it.
          const monthlyUsed = await counters.monthlyUsed(input.userId, month);
          const activeUsed = (await counters.activeUsed(input.userId)) - 1;
          const before = decideLimits({ monthlyUsed, activeUsed, limits });

          if (!before.allowed) {
            // The transaction rolls back, so the inserted row and its effect on
            // the active count do not survive the refusal.
            throw new LimitReached(before.code, before.reasons.map((reason) => reason.field));
          }

          await counters.incrementMonthly(input.userId, month, now);
          return { kind: 'accepted' as const, catalogId: input.catalogId, uploadedAt: now };
        });
      } catch (error) {
        if (error instanceof LimitReached) {
          return { kind: 'limit', code: error.code, fields: error.fields };
        }
        if (isRetainedHashConflict(error)) {
          const original = await createDuplicatesRepository(db).findRetainedByHash(
            input.contentHash,
          );
          if (original !== null) return { kind: 'duplicate', original };
        }
        throw error;
      }
    },

    /**
     * The compensating action a failed withdrawal needs: the record's row and
     * its monthly count leave together, so the merchant is not charged for a
     * catalog the response refused (FR-039, AC-009).
     */
    async rollback(input: { catalogId: string; userId: string; now: Date }): Promise<void> {
      const month = monthKey(input.now);
      await db.transaction(async (tx: Transaction) => {
        await tx
          .delete(catalogs)
          .where(and(eq(catalogs.id, input.catalogId), eq(catalogs.userId, input.userId)));
        await tx
          .update(catalogMonthlyUploads)
          .set({ count: sql`GREATEST(${catalogMonthlyUploads.count} - 1, 0)` })
          .where(
            and(
              eq(catalogMonthlyUploads.userId, input.userId),
              eq(catalogMonthlyUploads.monthStart, month),
            ),
          );
      });
    },
  };
}

class LimitReached extends Error {
  constructor(
    readonly code: 'UPLOAD_MONTHLY_LIMIT' | 'UPLOAD_ACTIVE_LIMIT',
    readonly fields: ('monthly' | 'active')[],
  ) {
    super(code);
  }
}

export type Acceptance = ReturnType<typeof createAcceptance>;
