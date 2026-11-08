// Account creation at verification: one transaction for the account, its
// credential, its session, and the pending row's deletion (FR-004, FR-034).
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import {
  sessionAbsoluteSeconds,
  sessionTokenBytes,
  type SecurityEventPort,
} from '@wafar/shared';
import { phoneVerifications, sessions, type Database } from '@wafar/db';
import { createCredentialStore } from './credentials.ts';
import { createUsersRepository } from '../../users/repository/users.ts';
import type { PendingRow } from '../../users/repository/phone-verifications.ts';

export type CreationOutcome =
  | { outcome: 'created'; userId: string; token: string; expiresAt: Date }
  | { outcome: 'existing_account' }
  | { outcome: 'blocked_account' }
  | { outcome: 'administrator_account' };

export interface CreationInput {
  row: PendingRow;
  now: Date;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
  events?: SecurityEventPort;
}

export async function createAccount(
  db: Database,
  input: CreationInput,
): Promise<CreationOutcome> {
  const { row, now } = input;
  try {
    return await db.transaction(async (tx) => {
      const users = createUsersRepository(tx);
      const credentials = createCredentialStore(tx);

      const account = await users.create({
        fullName: row.fullName ?? '',
        phoneNumber: row.phoneNumber,
        city: row.city ?? '',
        shopName: row.shopName,
        role: 'merchant',
      });

      await credentials.create(account.id, row.passwordHash ?? '');
      const token = randomBytes(sessionTokenBytes).toString('base64url');
      const expiresAt = new Date(now.getTime() + sessionAbsoluteSeconds * 1000);
      await tx.insert(sessions).values({
        id: randomBytes(24).toString('base64url').slice(0, 32),
        userId: account.id,
        token,
        expiresAt,
        lastActivityAt: now,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent?.slice(0, 512) ?? null,
      });
      await tx.delete(phoneVerifications).where(eq(phoneVerifications.id, row.id));
      return { outcome: 'created' as const, userId: account.id, token, expiresAt };
    }).then((result) => {
      input.events?.emit({
        event: 'auth.sign_up.verified',
        outcome: 'success',
        requestId: input.requestId,
        accountId: result.userId,
      });
      return result;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const existing = await createUsersRepository(db).findByPhone(row.phoneNumber);
      if (existing !== null) {
        await db
          .delete(phoneVerifications)
          .where(eq(phoneVerifications.id, row.id));
        if (existing.role === 'administrator') return { outcome: 'administrator_account' };
        if (existing.status === 'blocked') return { outcome: 'blocked_account' };
        return { outcome: 'existing_account' };
      }
    }
    throw error;
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as { code?: string; cause?: unknown };
  if (candidate.code === '23505') return true;
  return isUniqueViolation(candidate.cause);
}
