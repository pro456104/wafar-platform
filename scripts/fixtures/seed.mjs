// The deterministic load fixture (T117): 10,000 merchant accounts with one
// load-only credential, 300 live sessions for the sign-in ceiling, and the three
// disjoint 200-number blocks the SC-009 profile names. Nothing is random: the
// numbers, identifiers, and tokens are derived from their index, so a rerun
// produces the same rows and the load run measures the same population
// (FR-016, FR-031; SC-009, plan.md -> The SC-009 load profile).
//
// Every block is a listed Libyan mobile range: the seeded accounts sit on 92,
// the measured sign-ups on 93, the warm-up on 94, and the limiter probe on 95.
import { scrypt as scryptCallback } from 'node:crypto';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// `pg` belongs to the data-access package and the scrypt profile belongs to the
// shared limits; resolving both through the API's manifest keeps the script
// runnable from the repository root under pnpm, without a new dependency and
// without restating a value the register fixes once (CMV 2).
const require = createRequire(new URL('../../apps/api/package.json', import.meta.url));
const { Client } = require('pg');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const { AwsClient } = require('aws4fetch');
const { scryptKeyLength, scryptN, scryptP, scryptR, scryptSaltBytes } = await import(
  pathToFileURL(require.resolve('@wafar/shared/limits')).href
);

/** The one credential every seeded account verifies with (plan item 9). */
export const loadCredential = 'load-only credential value';
export const loadCity = 'طرابلس';

/**
 * The profile's number blocks. The two 92-blocks are members of the 10,000
 * seeded accounts; the 93, 94, and 95 blocks have no account before the run.
 */
export const loadProfile = {
  accounts: 10_000,
  liveSessions: 300,
  ceilingSessions: 500,
  /** The seeded accounts the 200 measured sign-ins present. */
  signIn: { prefix: '92', from: 0, count: 200 },
  /** Other seeded accounts the 200 measured recovery requests present. */
  recovery: { prefix: '92', from: 200, count: 200 },
  /** The 200 measured account-creation submissions. */
  signUp: { prefix: '93', from: 0, count: 200 },
  /** The 20 warm-up submissions, one per virtual user, outside the 600. */
  warmUp: { prefix: '94', from: 0, count: 20 },
  /** The limiter probe: 20 accepted submissions, then the 21st refused. */
  probe: { prefix: '95', from: 0, count: 21 },
};

/** The canonical number of the seeded account at `index`. */
export function seededNumber(index) {
  return `+21892${String(index).padStart(7, '0')}`;
}

/** The canonical number of a block member, as the profile states it. */
export function blockNumber(block, index) {
  return `+218${block.prefix}${String(block.from + index).padStart(7, '0')}`;
}

/** The typed national form a person enters for a canonical number. */
export function typedForm(e164) {
  return `0${e164.slice(4)}`;
}

/** Every number a run can leave a pending request under. */
export function fixtureNumbers() {
  const blocks = [
    loadProfile.signUp,
    loadProfile.recovery,
    loadProfile.warmUp,
    loadProfile.probe,
  ];
  const numbers = new Set();
  for (const block of blocks) {
    for (let index = 0; index < block.count; index += 1) {
      numbers.add(blockNumber(block, index));
    }
  }
  return [...numbers];
}

function sessionOf(index) {
  return {
    id: `load-session-${String(index).padStart(6, '0')}`,
    // The store requires at least 32 characters; this form is 50.
    token: `load-session-token-${String(index).padStart(6, '0')}-${'t'.repeat(24)}`,
    userId: `load-user-${String(index + 1000).padStart(6, '0')}`,
  };
}

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      scryptKeyLength,
      { N: scryptN, r: scryptR, p: scryptP, maxmem: 128 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

/**
 * The one credential row shape the store accepts, computed once. The salt is
 * exactly `scryptSaltBytes` long and the key `scryptKeyLength`, so the store's
 * `parseHash` accepts it rather than refusing every verify.
 */
async function credentialHash() {
  const salt = Buffer.from('wafar-load-salt!', 'utf8');
  if (salt.length !== scryptSaltBytes) {
    throw new Error(`the load salt is ${salt.length} bytes, not ${scryptSaltBytes}`);
  }
  const key = await scrypt(loadCredential, salt);
  return `$wafar$scrypt$${scryptN}$${scryptR}$${scryptP}$${salt.toString('hex')}$${key.toString('hex')}`;
}

function batches(items, size) {
  const out = [];
  for (let index = 0; index < items.length; index += size) {
    out.push(items.slice(index, index + size));
  }
  return out;
}

/**
 * Rewrites the load fixture and returns the live-session count before the run.
 * The rows are the fixture's own (`load-user-*`, `load-account-*`,
 * `load-session-*`), the pending rows its own numbers carry, and the
 * rate-limit keys those numbers and the loopback origins own; no development
 * account is touched.
 */
export async function seedLoadFixture(databaseUrl = process.env['DATABASE_URL']) {
  if (databaseUrl === undefined) {
    throw new Error('DATABASE_URL is not set');
  }
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  await client.query('SET statement_timeout = 0');
  try {
    const password = await credentialHash();
    await client.query('BEGIN');

    await client.query("DELETE FROM sessions WHERE id LIKE 'load-session-%'");
    await client.query(
      'DELETE FROM phone_verifications WHERE phone_number = ANY($1::text[])',
      [fixtureNumbers()],
    );
    // The limiter's fixed windows are ephemeral; the fixture owns them so the
    // run's readback is exactly the rows the run created.
    await client.query('DELETE FROM rate_limit_counters');
    // The four intake tables reference the user, so the fixture's own rows go
    // before the user: a rerun after a measured run must clear the catalogs and
    // the counters the previous run left, not fail on their foreign keys.
    await client.query("DELETE FROM catalogs WHERE user_id LIKE 'load-user-%'");
    await client.query("DELETE FROM catalog_monthly_uploads WHERE user_id LIKE 'load-user-%'");
    await client.query("DELETE FROM catalog_upload_attempts WHERE user_id LIKE 'load-user-%'");
    await client.query("DELETE FROM catalog_upload_sessions WHERE user_id LIKE 'load-user-%'");
    await client.query("DELETE FROM accounts WHERE id LIKE 'load-account-%'");
    await client.query("DELETE FROM users WHERE id LIKE 'load-user-%'");

    const users = [];
    const accounts = [];
    for (let index = 0; index < loadProfile.accounts; index += 1) {
      const suffix = String(index).padStart(6, '0');
      const phone = seededNumber(index);
      users.push({
        id: `load-user-${suffix}`,
        fullName: 'محمد علي',
        email: `${phone.slice(1)}@phone.invalid`,
        phone,
        city: loadCity,
      });
      accounts.push({ id: `load-account-${suffix}`, userId: `load-user-${suffix}` });
    }

    for (const batch of batches(users, 500)) {
      const values = [];
      const params = [];
      batch.forEach((row, offset) => {
        const base = offset * 5;
        values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, true)`);
        params.push(row.id, row.fullName, row.email, row.phone, row.city);
      });
      await client.query(
        `INSERT INTO users (id, full_name, email, phone_number, city, phone_number_verified)
         VALUES ${values.join(', ')}`,
        params,
      );
    }

    for (const batch of batches(accounts, 500)) {
      const values = [];
      const params = [];
      batch.forEach((row, offset) => {
        const base = offset * 3;
        values.push(`($${base + 1}, $${base + 2}, $${base + 2}, 'credential', $${base + 3})`);
        params.push(row.id, row.userId, password);
      });
      await client.query(
        `INSERT INTO accounts (id, user_id, account_id, provider_id, password)
         VALUES ${values.join(', ')}`,
        params,
      );
    }

    // The 300 live sessions the 200 measured sign-ins raise to the 500 ceiling.
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    for (let index = 0; index < loadProfile.liveSessions; index += 1) {
      const session = sessionOf(index);
      await client.query(
        `INSERT INTO sessions (id, user_id, token, expires_at, last_activity_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [session.id, session.userId, session.token, expiresAt.toISOString(), now.toISOString()],
      );
    }

    await client.query('COMMIT');

    const counts = await client.query(
      `SELECT
         (SELECT count(*)::int FROM users WHERE id LIKE 'load-user-%') AS users,
         (SELECT count(*)::int FROM accounts WHERE id LIKE 'load-account-%') AS accounts,
         (SELECT count(*)::int FROM sessions
           WHERE id LIKE 'load-session-%' AND revoked_at IS NULL AND expires_at > now()) AS sessions`,
    );
    return counts.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * The catalog-side fixtures: the load condition's 50,000 catalogs, the
 * quota-boundary sample (ten merchants one slot short of both limits), and the
 * SC-004 sample's four retained originals at the four processing statuses (T006).
 */
export const catalogProfile = {
  /** The load condition's catalogs, spread across the seeded accounts. */
  catalogs: 50_000,
  /** SC-005's ten merchants. */
  quotaMerchants: 10,
  /** Each merchant's retained catalogs: one short of the 300 active limit. */
  quotaActive: 299,
  /** Each merchant's monthly counter: one short of the 50 monthly limit. */
  quotaMonthCount: 49,
  /** SC-004's sample: one original at each of the four statuses. */
  statuses: ['uploaded', 'processing', 'completed', 'failed'],
};

function tripoliMonthStart(now = new Date()) {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Tripoli',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return `${formatted.slice(0, 8)}01`;
}

function catalogHash(index, salt = 'load') {
  // A deterministic 64-hex digest per row, so a rerun writes the same population
  // and no two rows can share a hash: the digest is over the row's own key.
  return createHash('sha256').update(`${salt}-${index}`).digest('hex');
}

/**
 * The SC-004 sample's four originals: one PDF per status, generated
 * deterministically and written to `reports/sc-004/<status>.pdf`, so the
 * measurement re-uploads exactly the bytes whose SHA-256 the seeded row carries
 * (T119). The objects are also written to the bucket when its credentials are
 * present, and their absence is reported rather than assumed.
 *
 * The bytes are the sanitizer's output, not the generator's first write: the
 * intake path hashes what the sanitizer keeps (`sanitizePdf` loads with
 * `updateMetadata: false` and saves with `useObjectStreams: false`), and a raw
 * save would hash differently, so the re-upload would answer as a new file
 * instead of a duplicate. A load-and-save round trip is idempotent, so the
 * bytes below equal what the sanitizer writes for them.
 */
export async function sampleOriginals() {
  const out = [];
  for (const [index, status] of catalogProfile.statuses.entries()) {
    const document = await PDFDocument.create();
    // A fixed timestamp keeps the generated bytes identical across reruns, so a
    // reseed does not change the sample hashes the measurement compares.
    document.setCreationDate(new Date(0));
    document.setModificationDate(new Date(0));
    const font = await document.embedFont(StandardFonts.Helvetica);
    const page = document.addPage();
    page.drawText(`Wafar SC-004 sample ${index + 1}`, { x: 40, y: 700, size: 14, font });
    page.drawText(status, { x: 40, y: 670, size: 12, font });
    const first = await document.save({ useObjectStreams: false });
    const reloaded = await PDFDocument.load(first, { updateMetadata: false });
    const bytes = Buffer.from(await reloaded.save({ useObjectStreams: false }));
    out.push({ status, bytes, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  return out;
}

async function putSampleObject(s3, key, bytes) {
  const endpoint = process.env['S3_ENDPOINT'];
  const bucket = process.env['S3_BUCKET'];
  if (s3 === null || !endpoint || !bucket) return 'skipped';
  const response = await s3.fetch(`${endpoint.replace(/\/$/u, '')}/${bucket}/${key}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/pdf' },
    body: bytes,
  });
  return response.ok ? 'written' : `failed ${response.status}`;
}

function sampleStorageClient() {
  const accessKeyId = process.env['S3_ACCESS_KEY_ID'];
  const secretAccessKey = process.env['S3_SECRET_ACCESS_KEY'];
  if (!accessKeyId || !secretAccessKey) return null;
  return new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: 's3',
    region: process.env['S3_REGION'] ?? 'us-east-1',
  });
}

export async function seedCatalogFixtures(databaseUrl = process.env['DATABASE_URL']) {
  if (databaseUrl === undefined) throw new Error('DATABASE_URL is not set');
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  await client.query('SET statement_timeout = 0');
  const month = tripoliMonthStart();
  const password = await credentialHash();
  const samples = await sampleOriginals();
  const reportDir = join('reports', 'sc-004');
  const s3 = sampleStorageClient();
  try {
    await client.query('BEGIN');
    await client.query("DELETE FROM catalogs WHERE id LIKE 'load-catalog-%'");
    await client.query("DELETE FROM catalogs WHERE id LIKE 'sample-catalog-%'");
    await client.query("DELETE FROM catalogs WHERE id LIKE 'quota-catalog-%'");
    await client.query("DELETE FROM sessions WHERE id LIKE 'quota-session-%'");
    await client.query("DELETE FROM accounts WHERE id LIKE 'quota-account-%'");
    await client.query(
      "DELETE FROM catalog_monthly_uploads WHERE user_id LIKE 'load-user-%'",
    );
    await client.query(
      "DELETE FROM catalog_monthly_uploads WHERE user_id LIKE 'quota-user-%'",
    );

    // The load condition's catalogs, ten per seeded account.
    const rows = [];
    for (let index = 0; index < catalogProfile.catalogs; index += 1) {
      const account = index % loadProfile.accounts;
      rows.push({
        id: `load-catalog-${String(index).padStart(6, '0')}`,
        userId: `load-user-${String(account).padStart(6, '0')}`,
        hash: catalogHash(index),
      });
    }
    for (const batch of batches(rows, 500)) {
      const values = [];
      const params = [];
      batch.forEach((row, offset) => {
        const base = offset * 6;
        values.push(
          `($${base + 1}, $${base + 2}, 'كتالوج المورد.pdf',
            $${base + 3}, 'application/pdf', $${base + 4}, $${base + 5},
            'uploaded', $${base + 6})`,
        );
        params.push(
          row.id,
          row.userId,
          1_048_576 + offset,
          row.hash,
          `catalogs/${row.id}/${row.hash}.pdf`,
          new Date().toISOString(),
        );
      });
      await client.query(
        `INSERT INTO catalogs
           (id, user_id, file_name, byte_size, content_type, content_hash, storage_key, status, uploaded_at)
         VALUES ${values.join(', ')}`,
        params,
      );
    }

    // The quota-boundary sample: ten merchants, 299 retained catalogs, a monthly
    // counter of 49, and the credential and live session each upload presents
    // (T119).
    for (let merchant = 0; merchant < catalogProfile.quotaMerchants; merchant += 1) {
      const suffix = String(merchant).padStart(3, '0');
      const userId = `quota-user-${suffix}`;
      const phone = `+21896${String(merchant).padStart(7, '0')}`;
      await client.query(
        `INSERT INTO users (id, full_name, email, phone_number, city, phone_number_verified)
         VALUES ($1, 'تاجر الحصة', $2, $3, $4, true)
         ON CONFLICT (id) DO NOTHING`,
        [userId, `${userId}@phone.invalid`, phone, loadCity],
      );
      await client.query(
        `INSERT INTO accounts (id, user_id, account_id, provider_id, password)
         VALUES ($1, $2, $2, 'credential', $3)`,
        [`quota-account-${suffix}`, userId, password],
      );
      await client.query(
        `INSERT INTO sessions (id, user_id, token, expires_at, last_activity_at)
         VALUES ($1, $2, $3, now() + interval '12 hours', now())`,
        [
          `quota-session-${suffix}`,
          userId,
          `quota-session-token-${suffix}-${'q'.repeat(28)}`,
        ],
      );
      for (let index = 0; index < catalogProfile.quotaActive; index += 1) {
        const id = `quota-catalog-${merchant}-${String(index).padStart(4, '0')}`;
        const hash = catalogHash(index, `quota-${merchant}`);
        await client.query(
          `INSERT INTO catalogs
             (id, user_id, file_name, byte_size, content_type, content_hash, storage_key, status, uploaded_at)
           VALUES ($1, $2, 'كتالوج.pdf', 1048576, 'application/pdf', $3, $4, 'uploaded', $5)`,
          [id, userId, hash, `catalogs/${id}/${hash}.pdf`, new Date().toISOString()],
        );
      }
      await client.query(
        `INSERT INTO catalog_monthly_uploads (user_id, month_start, count)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, month_start) DO UPDATE SET count = excluded.count`,
        [userId, month, catalogProfile.quotaMonthCount],
      );
    }

    // The SC-004 sample: four retained originals, one at each status, each with
    // a kept object, a content hash equal to the SHA-256 of the bytes the run
    // re-uploads, and those bytes written beside the report (T119).
    mkdirSync(dirname(join(reportDir, 'sample.pdf')), { recursive: true });
    const writes = [];
    for (const sample of samples) {
      const id = `sample-catalog-${sample.status}`;
      const storageKey = `catalogs/${id}/${sample.sha256}.pdf`;
      writeFileSync(join(reportDir, `${sample.status}.pdf`), sample.bytes);
      const written = await putSampleObject(s3, storageKey, sample.bytes);
      writes.push({ status: sample.status, storageKey, written });
      await client.query(
        `INSERT INTO catalogs
           (id, user_id, file_name, byte_size, content_type, content_hash, storage_key, status, uploaded_at)
         VALUES ($1, $2, $3, $4, 'application/pdf', $5, $6, $7, $8)`,
        [
          id,
          'load-user-000000',
          `عينة ${sample.status}.pdf`,
          sample.bytes.byteLength,
          sample.sha256,
          storageKey,
          sample.status,
          new Date().toISOString(),
        ],
      );
    }

    await client.query('COMMIT');
    const counts = await client.query(
      `SELECT
         (SELECT count(*)::int FROM catalogs WHERE id LIKE 'load-catalog-%') AS load_catalogs,
         (SELECT count(*)::int FROM catalogs WHERE id LIKE 'quota-catalog-%') AS quota_catalogs,
         (SELECT count(*)::int FROM catalogs WHERE id LIKE 'sample-catalog-%') AS sample_catalogs,
         (SELECT count(*)::int FROM sessions WHERE id LIKE 'quota-session-%') AS quota_sessions`,
    );
    return { ...counts.rows[0], sampleObjects: writes };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  if (process.env['NODE_ENV'] === 'production') {
    console.error('The fixture seeder never runs against production.');
    process.exit(1);
  }
  const counts = await seedLoadFixture();
  console.log(
    `Load fixture: ${counts.users} accounts, ${counts.accounts} credentials, ${counts.sessions} live sessions.`,
  );
  const catalogCounts = await seedCatalogFixtures();
  console.log(
    `Catalog fixtures: ${catalogCounts.load_catalogs} load catalogs, ${catalogCounts.quota_catalogs} quota-boundary catalogs, ${catalogCounts.sample_catalogs} SC-004 originals, ${catalogCounts.quota_sessions} quota-boundary sessions.`,
  );
  for (const object of catalogCounts.sampleObjects) {
    console.log(`SC-004 ${object.status}: ${object.storageKey} (${object.written})`);
  }
}
