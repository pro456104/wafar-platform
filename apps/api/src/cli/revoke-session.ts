// The `revoke-session` CLI: the platform's explicit end of one session, with the
// `platform_revocation` reason and stable exit codes (FR-012, Â§7.3).
import { environment } from '../env.ts';
import { createDatabase } from '@wafar/db';
import { createSessionService } from '../modules/auth/service/sessions.ts';
import { processLogger } from '../observability/logger.ts';

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

const sessionId = argument('session-id');
const token = argument('token');
if (sessionId === undefined && token === undefined) {
  console.error('usage: revoke-session --session-id <id> | --token <token>');
  process.exit(2);
}

const env = environment();
if (env.DATABASE_URL === undefined) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const { db, pool } = createDatabase(env.DATABASE_URL);
const sessions = createSessionService(db);
const now = new Date();

try {
  const revoked =
    token !== undefined
      ? await sessions.revokeByToken(token, 'platform_revocation', now)
      : await sessions.revoke(sessionId ?? '', 'platform_revocation', now);

  if (!revoked) {
    console.error('No live session matched.');
    process.exitCode = 1;
  } else {
    processLogger.emit({
      event: 'auth.session.revoked',
      outcome: 'success',
      requestId: `cli-${process.pid}`,
      reason: 'platform_revocation',
      sessionCount: 1,
    });
    console.log('Session revoked.');
  }
} finally {
  await pool.end();
}
