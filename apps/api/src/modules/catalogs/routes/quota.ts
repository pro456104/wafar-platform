// The quota route: `GET /api/v1/catalogs/quota` answers the page's one read
// before its first submission, as the two counter statements plus the one
// account read (FR-009-FR-018; contracts/intake-api.md §2.1; data-model.md §7).
import type { Hono } from 'hono';
import { monthStart } from '@wafar/shared';
import type { AppDependencies, AppEnv } from '../../../http/deps.ts';
import { refuse } from '../../../http/errors.ts';
import { readCookie } from '../../../http/security.ts';
import { resolveMerchant, SESSION_COOKIE } from '../../../http/context.ts';
import { createCountersRepository } from '../repository/counters.ts';
import { effectiveLimits } from '../service/quota.ts';

export function registerQuotaRoute(app: Hono<AppEnv>, dependencies: AppDependencies): void {
  app.get('/api/v1/catalogs/quota', async (c) => {
    const now = dependencies.now();
    const merchant = await resolveMerchant(dependencies.db, dependencies.auth, {
      token: readCookie(c.req.header('cookie'), SESSION_COOKIE),
      now,
      requiresUnrestricted: true,
      isUserInitiated: true,
    });
    if (merchant.kind === 'refused') return refuse(c, merchant.code);
    if (merchant.kind !== 'merchant') return refuse(c, 'SESSION_ENDED');

    const account = await dependencies.accountContext.read(merchant.userId);
    if (account === null) return refuse(c, 'SESSION_ENDED');

    const counters = createCountersRepository(dependencies.db, {
      readAccount: (userId) => dependencies.accountContext.read(userId),
    });
    const limits = effectiveLimits(account);
    const monthlyUsed = await counters.monthlyUsed(merchant.userId, monthStart(now));
    const activeUsed = await counters.activeUsed(merchant.userId);

    // A lowered quota is not clamped: `used` may exceed `limit` (FR-019).
    return c.json(
      {
        monthly: { used: monthlyUsed, limit: limits.monthly },
        active: { used: activeUsed, limit: limits.active },
      },
      200,
    );
  });
}
