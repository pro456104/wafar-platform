// The credential row's access: the `accounts` table belongs to the `auth`
// module, and this file is its only writer (data-model.md §6).
import { eq } from 'drizzle-orm';
import { accounts, type Database, type Transaction } from '@wafar/db';
import { newId } from '../../users/repository/users.ts';

export type Queryable = Database | Transaction;

export interface CredentialRow {
  userId: string;
  passwordHash: string;
}

export function createCredentialStore(db: Queryable) {
  return {
    async create(userId: string, passwordHash: string): Promise<void> {
      await db.insert(accounts).values({
        id: newId(),
        userId,
        accountId: userId,
        providerId: 'credential',
        password: passwordHash,
      });
    },

    async read(userId: string): Promise<CredentialRow | null> {
      const rows = await db
        .select({ userId: accounts.userId, password: accounts.password })
        .from(accounts)
        .where(eq(accounts.userId, userId))
        .limit(1);
      const row = rows[0];
      if (row === undefined || row.password === null) return null;
      return { userId: row.userId, passwordHash: row.password };
    },

    async write(userId: string, passwordHash: string): Promise<void> {
      await db
        .update(accounts)
        .set({ password: passwordHash, updatedAt: new Date() })
        .where(eq(accounts.userId, userId));
    },
  };
}
