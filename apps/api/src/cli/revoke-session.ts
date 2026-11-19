// The `revoke-session` CLI: the platform's explicit end of one session or of
// every live session of one account, with the `platform_revocation` reason and
// stable exit codes. The revocation itself is the `auth` engine's (FR-012, §7.3;
// ADR-151).
import { normalizePhone } from '@wafar/shared';
import { environment } from '../env.ts';
import { createDatabase } from '@wafar/db';
import { createAuthEngine } from '../modules/auth/engine.ts';
import { createUsersRepository } from '../modules/users/repository/users.ts';
import { processLogger } from '../observability/logger.ts';

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

const sessionId = argument('session');
const userNumber = argument('user');
if (sessionId === undefined && userNumber === undefined) {
  console.error('usage: revoke-session --session <id> | --user <+218…>');
  process.exit(2);
}

async function main(): Promise<void> {
  const env = environment();
  if (env.DATABASE_URL === undefined) {
    console.error('DATABASE_URL is not set');
    process.exitCode = 1;
    return;
  }

  const { db, pool } = createDatabase(env.DATABASE_URL);
  const auth = createAuthEngine({
    db,
    secret: env.BETTER_AUTH_SECRET,
    baseUrl: env.BETTER_AUTH_URL,
  });
  const users = createUsersRepository(db);
  const now = new Date();

  try {
    if (userNumber !== undefined) {
      const normalized = normalizePhone(userNumber);
      if (normalized === null) {
        console.error('Refused: the number is not a listed Libyan mobile number.');
        process.exitCode = 1;
        return;
      }
      const account = await users.findByPhone(normalized.e164);
      const count =
        account === null
          ? 0
          : await auth.revokeAll(account.id, 'platform_revocation', now);
      if (account === null || count === 0) {
        console.error('No live session matched.');
        process.exitCode = 1;
        return;
      }
      processLogger.emit({
        event: 'auth.session.revoked',
        outcome: 'success',
        requestId: `cli-${process.pid}`,
        reason: 'platform_revocation',
        sessionCount: count,
        accountId: account.id,
      });
      console.log(`Sessions revoked: ${count}`);
      return;
    }

    // The row is resolved before it is ended, so the record names the account
    // when a live session changed and stays silent about one that did not
    // (FR-037, AC-040).
    const row = await auth.resolveById(sessionId ?? '');
    const revoked =
      row === null || row.revokedAt !== null
        ? false
        : await auth.revokeById(sessionId ?? '', 'platform_revocation', now);
    if (!revoked) {
      console.error('No live session matched.');
      process.exitCode = 1;
      return;
    }
    processLogger.emit({
      event: 'auth.session.revoked',
      outcome: 'success',
      requestId: `cli-${process.pid}`,
      reason: 'platform_revocation',
      sessionCount: 1,
      ...(row === null ? {} : { accountId: row.userId }),
    });
    console.log('Session revoked.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Revocation failed:', (error as Error).message);
  process.exitCode = 2;
});
