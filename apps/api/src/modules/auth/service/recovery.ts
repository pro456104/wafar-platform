// The recovery service: the verified state and the new-password write, in one
// transaction with the global revocation and the pending row's deletion
// (FR-013, FR-014, FR-035).
import { and, eq, isNull } from 'drizzle-orm';
import type { SecurityEventPort } from '@wafar/shared';
import { phoneVerifications, sessions, type Database } from '@wafar/db';
import { createCredentialStore } from './credentials.ts';
import { createUsersRepository } from '../../users/repository/users.ts';
import { checkPasswordPolicy, hashPassword, type PasswordRefusal } from './password-policy.ts';
import type { PendingRow } from '../../users/repository/phone-verifications.ts';

export type ResetResult =
  | { status: 'reset'; blocked: boolean; sessionCount: number }
  | { status: 'refused'; code: PasswordRefusal | 'RECOVERY_EXPIRED' };

export interface ResetInput {
  row: PendingRow;
  newPassword: string;
  now: Date;
  requestId: string;
  events: SecurityEventPort;
}

export function createRecoveryService(db: Database) {
  return {
    async reset(input: ResetInput): Promise<ResetResult> {
      const policy = checkPasswordPolicy(input.newPassword);
      if (policy !== null) return { status: 'refused', code: policy };

      const account = await createUsersRepository(db).findByPhone(
        input.row.phoneNumber,
      );
      if (account === null) return { status: 'refused', code: 'RECOVERY_EXPIRED' };

      const passwordHash = await hashPassword(input.newPassword);
      const outcome = await db.transaction(async (tx) => {
        const rows = await tx
          .select({ id: phoneVerifications.id, state: phoneVerifications.state })
          .from(phoneVerifications)
          .where(
            and(
              eq(phoneVerifications.id, input.row.id),
              eq(phoneVerifications.state, 'verified'),
            ),
          )
          .limit(1);
        if (rows.length === 0) {
          return { status: 'refused' as const, code: 'RECOVERY_EXPIRED' as const };
        }

        await createCredentialStore(tx).write(account.id, passwordHash);
        const revoked = await tx
          .update(sessions)
          .set({
            revokedAt: input.now,
            revokedReason: 'password_change',
            updatedAt: input.now,
          })
          .where(and(eq(sessions.userId, account.id), isNull(sessions.revokedAt)))
          .returning({ id: sessions.id });
        await tx
          .delete(phoneVerifications)
          .where(eq(phoneVerifications.id, input.row.id));
        return {
          status: 'reset' as const,
          blocked: account.status === 'blocked',
          sessionCount: revoked.length,
        };
      });

      if (outcome.status === 'reset') {
        input.events.emit({
          event: 'auth.password.reset',
          outcome: 'success',
          requestId: input.requestId,
          blocked: outcome.blocked,
          accountId: account.id,
        });
      }
      return outcome;
    },
  };
}
