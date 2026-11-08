// The session routes: sign-in, sign-out, sign-out everywhere, and the session
// read (FR-007, FR-010, FR-011, FR-032, contracts/auth-api.md §5.5–§5.7, §5.12).
import type { Hono } from 'hono';
import { normalizePhone, signInRequestSchema } from '@wafar/shared';
import { refuse } from '../../../http/errors.ts';
import {
  clearedCookie,
  sessionCookie,
} from '../../../http/deps.ts';
import type { AppDependencies, AppEnv } from '../../../http/deps.ts';
import { readCookie } from '../../../http/security.ts';
import { authenticate, SESSION_COOKIE } from '../../../http/context.ts';
import { createSignInService } from '../service/sign-in.ts';
import {
  createSessionService,
  isExpired,
  isInactive,
} from '../service/sessions.ts';
import { createUsersRepository } from '../../users/repository/users.ts';
import { dispatchNotice } from '../service/notices.ts';
import { originFrom, spend } from '../service/rate-limit.ts';
import { peerOf } from './sign-up.ts';

export function registerSessionRoutes(
  app: Hono<AppEnv>,
  dependencies: AppDependencies,
): void {
  const sessions = createSessionService(dependencies.db);
  const production = () => dependencies.env.NODE_ENV === 'production';

  app.post('/api/v1/auth/sign-in', async (c) => {
    const now = dependencies.now();
    let payload: unknown;
    try {
      payload = await c.req.json();
    } catch {
      return refuse(c, 'AUTH_INVALID_CREDENTIALS');
    }
    const parsed = signInRequestSchema.safeParse(payload);
    if (!parsed.success) return refuse(c, 'AUTH_INVALID_CREDENTIALS');

    const normalized = normalizePhone(parsed.data.phone);
    const userAgent = c.req.header('user-agent');
    const origin = originFrom({
      xRealIp: c.req.header('x-real-ip'),
      peer: peerOf(c),
      trustedProxies: dependencies.trustedProxies,
    });

    // Step 1: the sign-in budget, both keys.
    const limit = await spend(
      dependencies.db,
      'sign_in',
      { origin, phoneNumber: normalized?.e164 ?? null },
      now,
    );
    if (!limit.allowed) {
      return refuse(c, 'RATE_LIMITED', {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    // Step 4: the format refusal alone.
    if (normalized === null) return refuse(c, 'INVALID_PHONE', { field: 'phone' });

    const result = await createSignInService(dependencies.db).signIn({
      phoneNumber: normalized.e164,
      password: parsed.data.password,
      now,
      requestId: c.get('requestId'),
      events: dependencies.events,
      ...(userAgent === undefined ? {} : { userAgent }),
    });

    if (result.outcome === 'invalid') {
      return refuse(c, 'AUTH_INVALID_CREDENTIALS');
    }

    c.header('Set-Cookie', sessionCookie(result.token, production()));
    return c.json({ outcome: 'signed_in' }, 200);
  });

  app.post('/api/v1/auth/sign-out', async (c) => {
    const token = readCookie(c.req.header('cookie'), SESSION_COOKIE);
    if (token !== null) {
      await sessions.revokeByToken(token, 'sign_out', dependencies.now());
    }
    c.header('Set-Cookie', clearedCookie(SESSION_COOKIE, production()));
    return c.body(null, 204);
  });

  app.post('/api/v1/auth/sign-out-all', async (c) => {
    const token = readCookie(c.req.header('cookie'), SESSION_COOKIE);
    if (token !== null) {
      const now = dependencies.now();
      const row = await sessions.resolve(token, now);
      // A repeat of the ended session revokes nothing and sends no notice.
      if (
        row !== null &&
        row.revokedAt === null &&
        !isExpired(row.expiresAt, now) &&
        !isInactive(row.lastActivityAt, now)
      ) {
        const count = await sessions.revokeAll(
          row.userId,
          'sign_out_all',
          dependencies.now(),
        );
        dependencies.events.emit({
          event: 'auth.session.revoked',
          outcome: 'success',
          requestId: c.get('requestId'),
          reason: 'sign_out_all',
          sessionCount: count,
          accountId: row.userId,
        });
        const account = await createUsersRepository(dependencies.db).findById(
          row.userId,
        );
        if (account !== null) {
          await dispatchNotice(dependencies.sms, {
            to: account.phoneNumber,
            kind: 'signed_out_all',
            now: dependencies.now(),
            requestId: c.get('requestId'),
            events: dependencies.events,
          });
        }
      }
    }
    c.header('Set-Cookie', clearedCookie(SESSION_COOKIE, production()));
    return c.body(null, 204);
  });

  app.get('/api/v1/auth/session', async (c) => {
    const now = dependencies.now();
    const context = await authenticate(
      dependencies.db,
      {
        token: readCookie(c.req.header('cookie'), SESSION_COOKIE),
        now,
        requiresUnrestricted: false,
        isUserInitiated: c.req.header('x-wafar-activity') === '1',
      },
      sessions,
    );

    if (context.kind === 'refused') return refuse(c, context.code);
    if (context.kind === 'guest') return c.json({ authenticated: false }, 200);

    const account = await createUsersRepository(dependencies.db).findById(
      context.userId,
    );
    return c.json(
      {
        authenticated: true,
        user: { fullName: account?.fullName ?? '' },
        session: {
          expiresAt: context.expiresAt.toISOString(),
          lastActivityAt: context.lastActivityAt.toISOString(),
          restricted: context.restricted,
        },
      },
      200,
    );
  });
}
