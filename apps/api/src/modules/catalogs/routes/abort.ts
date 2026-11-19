// The abort route: `DELETE /api/v1/uploads/{uploadId}` cancels an open
// transfer idempotently. Only an `open` session cancels; every terminal state
// is a 204 no-op, and a foreign or unknown identifier is `404 NOT_FOUND`
// (FR-048, FR-050; contract §2.4).
import type { Hono } from 'hono';
import type { AppDependencies, AppEnv } from '../../../http/deps.ts';
import { refuse } from '../../../http/errors.ts';
import { readCookie } from '../../../http/security.ts';
import { resolveMerchant, SESSION_COOKIE } from '../../../http/context.ts';
import { createSessionsRepository } from '../repository/sessions.ts';
import { createRecord } from '../service/record.ts';

export function registerAbortRoute(app: Hono<AppEnv>, dependencies: AppDependencies): void {
  app.delete('/api/v1/uploads/:uploadId', async (c) => {
    const now = dependencies.now();
    const merchant = await resolveMerchant(dependencies.db, dependencies.auth, {
      token: readCookie(c.req.header('cookie'), SESSION_COOKIE),
      now,
      requiresUnrestricted: true,
      isUserInitiated: true,
    });
    if (merchant.kind === 'refused') return refuse(c, merchant.code);
    if (merchant.kind !== 'merchant') return refuse(c, 'SESSION_ENDED');

    const sessions = createSessionsRepository(dependencies.db);
    const session = await sessions.findOwned(merchant.userId, c.req.param('uploadId'));
    if (session === null) return refuse(c, 'NOT_FOUND');

    // `completing`, `done`, `failed`, and `aborted` are no-ops: the transfer's
    // bytes are the platform's work and a beacon cannot cancel it.
    if (session.state !== 'open') return c.body(null, 204);

    try {
      await dependencies.storage.abortMultipart({
        key: session.originalKey,
        uploadId: session.uploadId,
      });
      await dependencies.storage.delete({ key: session.originalKey });
    } catch {
      // A storage that refuses the withdrawal is reclaimed by the deferred
      // sweep; the merchant's outcome is already true (contract §2.4).
    }
    await sessions.abort(session.id, now);
    createRecord(dependencies.recordSink).settled({
      outcome: 'cancelled',
      requestId: c.get('requestId'),
      timestamp: now,
    });
    return c.body(null, 204);
  });
}
