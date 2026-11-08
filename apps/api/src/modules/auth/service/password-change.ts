// The foundation password-change service: the value rules, the current-password
// check, the conditional credential write, the global revocation, the pending
// recovery row's deletion, and the forced-first-change rule (FR-013, FR-028).
import { and, eq, isNull } from 'drizzle-orm';
import type { LockPort, SecurityEventPort } from '@wafar/shared';
import { phoneVerifications, sessions, type Database } from '@wafar/db';
import { createCredentialStore } from './credentials.ts';
import { createUsersRepository } from '../../users/repository/users.ts';
import { createLockRepository } from '../../users/repository/user-lock.ts';
import {
  checkPasswordPolicy,
  hashPassword,
  verifyPassword,
  type PasswordRefusal,
} from './password-policy.ts';

export type ChangeRefusal =
  | PasswordRefusal
  | 'PASSWORD_UNCHANGED'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'SESSION_ENDED'
  | 'ACCOUNT_BLOCKED';

export type ChangeResult =
  | { status: 'changed'; sessionCount: number }
  | { status: 'refused'; code: ChangeRefusal };

export interface ChangeInput {
  userId: string;
  sessionId: string;
  currentPassword: string;
  newPassword: string;
  now: Date;
  requestId: string;
  path: 'change' | 'forced_change';
  events: SecurityEventPort;
  lock?: LockPort;
}

/**
 * The administrator branch's port: the A8 service owns the change, and US6's
 * file applies it only to a restricted administrator account.
 */
export interface AdministratorPasswordChange {
  change(input: Omit<ChangeInput, 'path'>): Promise<ChangeResult>;
}

export function createPasswordChangeService(db: Database) {
  return {
    async change(input: ChangeInput): Promise<ChangeResult> {
      const users = createUsersRepository(db);
      const credentials = createCredentialStore(db);
      const locks = input.lock ?? createLockRepository(db);

      // 1. Value rules.
      const policy = checkPasswordPolicy(input.newPassword);
      if (policy !== null) return { status: 'refused', code: policy };

      const account = await users.findById(input.userId);
      if (account === null) return { status: 'refused', code: 'SESSION_ENDED' };

      const credential = await credentials.read(input.userId);
      if (credential === null) return { status: 'refused', code: 'SESSION_ENDED' };

      // 2. The forced-change difference check, before the lock.
      if (
        account.mustChangePassword &&
        (await verifyPassword(input.newPassword, credential.passwordHash))
      ) {
        return { status: 'refused', code: 'PASSWORD_UNCHANGED' };
      }

      // 3. The lock: one code and one text, no lock hint.
      if (await locks.isLocked(input.userId, input.now)) {
        return { status: 'refused', code: 'AUTH_INVALID_CREDENTIALS' };
      }

      // 4. The current-password check.
      const matches = await verifyPassword(
        input.currentPassword,
        credential.passwordHash,
      );
      if (!matches) {
        const state = await locks.recordFailedAttempt(input.userId, input.now);
        if (state.lockedUntil !== null) {
          input.events.emit({
            event: 'auth.lock.applied',
            outcome: 'success',
            requestId: input.requestId,
            accountId: input.userId,
          });
        }
        input.events.emit({
          event: 'auth.password.current_check_failed',
          outcome: 'failure',
          requestId: input.requestId,
          path: input.path,
          accountId: input.userId,
        });
        return { status: 'refused', code: 'AUTH_INVALID_CREDENTIALS' };
      }

      // 5. The conditional write: the session must still be live in the
      // transaction, so a reset that committed first makes this write nothing.
      const passwordHash = await hashPassword(input.newPassword);
      const outcome = await db.transaction(async (tx) => {
        const live = await tx
          .select({ id: sessions.id })
          .from(sessions)
          .where(and(eq(sessions.id, input.sessionId), isNull(sessions.revokedAt)))
          .limit(1);
        if (live.length === 0) return { status: 'refused' as const, code: 'SESSION_ENDED' as const };

        await createCredentialStore(tx).write(input.userId, passwordHash);
        await createUsersRepository(tx).clearForcedChange(input.userId);
        const revoked = await tx
          .update(sessions)
          .set({
            revokedAt: input.now,
            revokedReason: 'password_change',
            updatedAt: input.now,
          })
          .where(and(eq(sessions.userId, input.userId), isNull(sessions.revokedAt)))
          .returning({ id: sessions.id });
        await tx
          .delete(phoneVerifications)
          .where(eq(phoneVerifications.phoneNumber, account.phoneNumber));
        return { status: 'changed' as const, sessionCount: revoked.length };
      });

      if (outcome.status === 'changed') {
        // A successful change ends the run of counted failures (FR-009, AC-010).
        await locks.recordSuccess(input.userId, input.now);
        // One action, one record: the sessions this change ended belong to it.
        input.events.emit({
          event: 'auth.password.changed',
          outcome: 'success',
          requestId: input.requestId,
          accountId: input.userId,
        });
      }
      return outcome;
    },
  };
}
