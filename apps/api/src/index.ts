// The listener's boot sequence: the schema-version guard gates the listener, so
// no instance serves traffic against an unmigrated database (T126).
import { serve } from '@hono/node-server';
import { createDatabase } from '@wafar/db';
import { startSweepScheduler } from '@wafar/db/sweeps';
import { environment, trustedProxiesFrom } from './env.ts';
import { createApp } from './app.ts';
import { createAuthEngine } from './modules/auth/engine.ts';
import { assertSchemaVersion } from './http/schema-guard.ts';
import { createLogger } from './observability/logger.ts';
import { createSecurityEvents } from './modules/auth/service/events.ts';
import { loadBreachedDigests } from './modules/auth/service/password-policy.ts';
import {
  createSmsTransport,
} from './modules/auth/sms/index.ts';
import { createAccountContext } from './modules/users/service/account-context.ts';
import { createStorage } from './modules/catalogs/storage/adapter.ts';
import { createClamdScanner } from './modules/catalogs/scanner/clamd.ts';
import { createScannerDouble } from './modules/catalogs/scanner/double.ts';

const env = environment();
if (env.DATABASE_URL === undefined) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

// The vendored breached-password list is verified before any listener opens, so
// a missing, truncated, or altered file stops startup (FR-035).
try {
  loadBreachedDigests();
} catch (error) {
  console.error('Refusing to start:', (error as Error).message);
  process.exit(1);
}

const { db, pool } = createDatabase(env.DATABASE_URL);
const logger = createLogger();
const events = createSecurityEvents({ emit: (event) => logger.emit(event) });

async function main(): Promise<void> {
  try {
    await assertSchemaVersion(db);
  } catch (error) {
    console.error('Refusing to start:', (error as Error).message);
    await pool.end();
    process.exit(1);
  }

  const app = createApp({
    db,
    auth: createAuthEngine({
      db,
      secret: env.BETTER_AUTH_SECRET,
      baseUrl: env.BETTER_AUTH_URL,
    }),
    env,
    sms: createSmsTransport(env),
    logger,
    events,
    now: () => new Date(),
    trustedProxies: trustedProxiesFrom(env.TRUSTED_PROXIES),
    accountContext: createAccountContext(db),
    storage: createStorage({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      bucket: env.S3_BUCKET,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    }),
    scanner:
      env.SCANNER === 'clamd'
        ? createClamdScanner({ host: env.CLAMD_HOST, port: env.CLAMD_PORT })
        : createScannerDouble(),
    recordSink: {
      write: (line) => process.stdout.write(`${line}\n`),
    },
  });

  const server = serve({ fetch: app.fetch, port: 3001 }, (info) => {
    console.log(`Wafar API listening on http://localhost:${info.port}`);
  });

  // The operational rows are bounded by the hourly sweep, which runs from this
  // process at the top of each hour (data-model.md §14; T208).
  const stopSweeps = startSweepScheduler(db, {
    onError: (error) => {
      console.error('Hourly sweep failed:', error);
    },
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`${signal} received, closing`);
    stopSweeps();
    server.close();
    await pool.end();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void main();
