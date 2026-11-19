// The counter repository: the month's counter, the active count over the
// retained predicate, and the attempt window's read and increment, all scoped
// to the caller (FR-011-FR-013, FR-061; data-model.md §3-§4).
import { and, eq, sql } from 'drizzle-orm';
import { catalogMonthlyUploads, catalogUploadAttempts } from '@wafar/db';
import type { AccountContext } from '@wafar/shared';
import { createCatalogsRepository, type Queryable } from './catalogs.ts';

export interface CounterSource {
  /** The account's intake-relevant state, read through the shared port (T113). */
  readAccount(userId: string): Promise<AccountContext | null>;
}

/** The 15-minute fixed window's start, on a UTC boundary (CMV 20). */
export function attemptWindowStart(now: Date): Date {
  const start = new Date(now.getTime());
  start.setUTCSeconds(0, 0);
  start.setUTCMinutes(start.getUTCMinutes() - (start.getUTCMinutes() % 15));
  return start;
}

/** The seconds to the next boundary, 1-900. */
export function secondsToNextWindow(now: Date): number {
  const start = attemptWindowStart(now).getTime();
  return Math.max(1, Math.min(900, Math.ceil((start + 900_000 - now.getTime()) / 1000)));
}

export interface AttemptState {
  count: number;
  remaining: number;
}

export const attemptsPerWindow = 60;

export function createCountersRepository(db: Queryable, accounts: CounterSource) {
  const catalogs = createCatalogsRepository(db);

  return {
    /** One read of the month's counter row; a missing row reads 0. */
    async monthlyUsed(userId: string, monthStart: string): Promise<number> {
      const rows = await db
        .select({ count: catalogMonthlyUploads.count })
        .from(catalogMonthlyUploads)
        .where(
          and(
            eq(catalogMonthlyUploads.userId, userId),
            eq(catalogMonthlyUploads.monthStart, monthStart),
          ),
        )
        .limit(1);
      return rows[0]?.count ?? 0;
    },

    /** One aggregate over the partial retained index (FR-012). */
    async activeUsed(userId: string): Promise<number> {
      return catalogs.countActive(userId);
    },

    /** The account's status and its two overrides, through the shared contract. */
    async account(userId: string): Promise<AccountContext | null> {
      return accounts.readAccount(userId);
    },

    /** The acceptance's atomic increment, keyed to the injected clock's month. */
    async incrementMonthly(userId: string, monthStart: string, now: Date): Promise<number> {
      const rows = await db
        .insert(catalogMonthlyUploads)
        .values({ userId, monthStart, count: 1, updatedAt: now })
        .onConflictDoUpdate({
          target: [catalogMonthlyUploads.userId, catalogMonthlyUploads.monthStart],
          set: {
            count: sql`${catalogMonthlyUploads.count} + 1`,
            updatedAt: now,
          },
        })
        .returning({ count: catalogMonthlyUploads.count });
      return rows[0]?.count ?? 1;
    },

    async attemptState(userId: string, now: Date): Promise<AttemptState> {
      const windowStart = attemptWindowStart(now);
      const rows = await db
        .select({ count: catalogUploadAttempts.count })
        .from(catalogUploadAttempts)
        .where(
          and(
            eq(catalogUploadAttempts.userId, userId),
            eq(catalogUploadAttempts.windowStart, windowStart),
          ),
        )
        .limit(1);
      const count = rows[0]?.count ?? 0;
      return { count, remaining: Math.max(0, attemptsPerWindow - count) };
    },

    /** Counts one submission that reached the bound, unless the bound is spent. */
    async incrementAttempt(userId: string, now: Date): Promise<AttemptState> {
      const windowStart = attemptWindowStart(now);
      const rows = await db
        .insert(catalogUploadAttempts)
        .values({ userId, windowStart, count: 1, updatedAt: now })
        .onConflictDoUpdate({
          target: [catalogUploadAttempts.userId, catalogUploadAttempts.windowStart],
          set: {
            count: sql`${catalogUploadAttempts.count} + 1`,
            updatedAt: now,
          },
          setWhere: sql`${catalogUploadAttempts.count} < ${attemptsPerWindow}`,
        })
        .returning({ count: catalogUploadAttempts.count });
      const count = rows[0]?.count ?? attemptsPerWindow;
      return { count, remaining: Math.max(0, attemptsPerWindow - count) };
    },
  };
}

export type CountersRepository = ReturnType<typeof createCountersRepository>;
