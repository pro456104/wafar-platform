// The `auth` module's session service: issuance, the two clocks, the throttled
// activity write, and the tombstone revocations (FR-032, FR-010 … FR-013).
import { and, eq, isNull, sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import {
  sessionAbsoluteSeconds,
  sessionInactivitySeconds,
  sessionTokenBytes,
  type IssuedSession,
  type SessionPort,
  type SessionRevocationReason,
} from '@wafar/shared';
import { sessions, type Database } from '@wafar/db';

export function createSessionService(db: Database): SessionPort {
  return {
    async issue(input): Promise<IssuedSession> {
      const token = randomBytes(sessionTokenBytes).toString('base64url');
      const expiresAt = new Date(
        input.now.getTime() + sessionAbsoluteSeconds * 1000,
      );
      const id = randomBytes(24).toString('base64url').slice(0, 32);
      await db.insert(sessions).values({
        id,
        userId: input.userId,
        token,
        expiresAt,
        lastActivityAt: input.now,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent?.slice(0, 512) ?? null,
      });
      return { sessionId: id, token, expiresAt };
    },

    async resolve(token, now) {
      void now;
      const rows = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);
      const row = rows[0];
      if (row === undefined) return null;
      return {
        sessionId: row.id,
        userId: row.userId,
        expiresAt: row.expiresAt,
        lastActivityAt: row.lastActivityAt,
        revokedAt: row.revokedAt,
        revokedReason: row.revokedReason,
      };
    },

    async touch(sessionId, now) {
      await db
        .update(sessions)
        .set({ lastActivityAt: now, updatedAt: now })
        .where(
          and(
            eq(sessions.id, sessionId),
            isNull(sessions.revokedAt),
            sql`${sessions.lastActivityAt} <= ${new Date(now.getTime() - 60_000)}`,
          ),
        );
    },

    async revoke(sessionId, reason, now) {
      const rows = await db
        .update(sessions)
        .set({ revokedAt: now, revokedReason: reason, updatedAt: now })
        .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt)))
        .returning({ id: sessions.id });
      return rows.length > 0;
    },

    async revokeAll(userId, reason, now) {
      const rows = await db
        .update(sessions)
        .set({ revokedAt: now, revokedReason: reason, updatedAt: now })
        .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
        .returning({ id: sessions.id });
      return rows.length;
    },

    async revokeByToken(token, reason, now) {
      const rows = await db
        .update(sessions)
        .set({ revokedAt: now, revokedReason: reason, updatedAt: now })
        .where(and(eq(sessions.token, token), isNull(sessions.revokedAt)))
        .returning({ id: sessions.id });
      return rows.length > 0;
    },
  };
}

/** True when the inactivity clock has ended the session (FR-032). */
export function isInactive(lastActivityAt: Date, now: Date): boolean {
  return now.getTime() - lastActivityAt.getTime() >= sessionInactivitySeconds * 1000;
}

/** True when the absolute lifetime has ended. */
export function isExpired(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export type { SessionRevocationReason };
