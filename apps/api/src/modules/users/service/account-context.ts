// The account-context port's implementation: one read of the account's status
// and its two upload-quota overrides through the `users` repository, so the
// quota path imports no path under `modules/users` (T113; docs/architecture.md §2).
import { eq } from 'drizzle-orm';
import { users } from '@wafar/db';
import type { AccountContext, AccountContextPort } from '@wafar/shared';
import { createUsersRepository, type Queryable } from '../repository/users.ts';

export function createAccountContext(db: Queryable): AccountContextPort {
  const usersRepository = createUsersRepository(db);
  return {
    async read(userId: string): Promise<AccountContext | null> {
      const account = await usersRepository.findById(userId);
      if (account === null) return null;
      // The overrides are read by their two columns alone, so no password,
      // phone number, or name leaves `users` through this port.
      const rows = await db
        .select({
          monthly: users.monthlyUploadQuotaOverride,
          active: users.activeUploadQuotaOverride,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const row = rows[0];
      return {
        status: account.status,
        monthlyUploadQuotaOverride: row?.monthly ?? null,
        activeUploadQuotaOverride: row?.active ?? null,
      };
    },
  };
}

/** The in-memory port a test composes without a database. */
export function fixedAccountContext(value: AccountContext): AccountContextPort {
  return { read: () => Promise.resolve(value) };
}
