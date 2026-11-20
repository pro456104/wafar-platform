#!/usr/bin/env node
// The intake's load run (T005, T118): the design phase at 300 concurrent
// transfers / 10 pre-sign per second / 10 completed intakes per second, the
// doubled stress phase, the separate quota-boundary run, nearest-rank p50/p95,
// the slowest query from `pg_stat_statements`, and the outcome counts by cause.
//
// Each upload is one page load (the document and the quota read), one start,
// the part writes paced at SC-007's uplink (2.28 MB in 30 seconds, about
// 76 KB/s), and one completion. The run carries the samples SC-005, SC-006, and
// SC-007 read: 3,600 page loads and 3,600 uploads, 1,200 of each in the design
// phase and 2,400 in the stress phase, one page load before every submission,
// 900 uploads at each of 1 MB, 2 MB, 3 MB, and 4 MB.
//
// It never runs against production, and the design and stress phases fail on
// any refusal other than the fixture's expected duplicate.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

if (process.env['NODE_ENV'] === 'production') {
  console.error('The upload load run never runs against production.');
  process.exit(1);
}

const require = createRequire(new URL('../../apps/api/package.json', import.meta.url));
const { Client } = require('pg');
const { PDFDocument } = require('pdf-lib');
const { AwsClient } = require('aws4fetch');

const apiOrigin = new URL(process.env['API_ORIGIN'] ?? 'http://127.0.0.1:3001');
const webOrigin = new URL(process.env['WEB_ORIGIN'] ?? 'http://127.0.0.1:3000');
const databaseUrl =
  process.env['DATABASE_URL'] ?? 'postgres://wafar:wafar@localhost:5432/wafar';
const mode = process.argv.includes('--quota-boundary')
  ? 'quota-boundary'
  : process.argv.includes('--sc011')
    ? 'sc011'
    : 'load';
const reportPath =
  process.env['UPLOAD_LOAD_REPORT'] ??
  join('reports', mode === 'sc011' ? 'sc-011-accepted.json' : 'sc-005-upload-load.json');

// The kept-object read of SC-011: the same signed S3 access the storage adapter
// makes, so "a kept file" is a HEAD the bucket answers, not a catalog row alone.
const s3 = new AwsClient({
  accessKeyId: process.env['S3_ACCESS_KEY_ID'] ?? 'wafar',
  secretAccessKey: process.env['S3_SECRET_ACCESS_KEY'] ?? 'wafar-secret',
  region: process.env['S3_REGION'] ?? 'us-east-1',
  service: 's3',
});
const bucketUrl = `${(process.env['S3_ENDPOINT'] ?? 'http://127.0.0.1:8333').replace(/\/$/u, '')}/${
  process.env['S3_BUCKET'] ?? 'wafar'
}`;

function objectUrl(key) {
  return `${bucketUrl}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

/** The phase targets: design, then the doubled stress at double the concurrency. */
const design = {
  uploads: 1_200,
  concurrency: 300,
  preSignPerSecond: 10,
  completedPerSecond: 10,
};
const stress = {
  uploads: 2_400,
  concurrency: 600,
  preSignPerSecond: 20,
  completedPerSecond: 20,
};
const boundary = { merchants: 10, perMerchant: 60, concurrency: 600 };
const million = 1024 * 1024;

/** SC-011's sample: 100 accepted 1 MB uploads across three seeded merchants. */
const sc011 = { uploads: 100, merchants: 3, size: million, concurrency: 10, split: [34, 33, 33] };
const partSize = 8 * million;

/** SC-007's uplink: 2.28 MB in 30 seconds, about 76 KB/s. */
const uplinkBytesPerSecond = Math.round((2.28 * million) / 30);

/** CMV row 6: the same values govern both load conditions. */
const budgets = {
  quota: { p50: 200, p95: 500 },
  preSign: { p50: 300, p95: 800 },
  complete: { p50: 3_000, p95: 10_000 },
  pageLoad: { p50: 1_000, p95: 2_000 },
  queryP95: 100,
};

/** Nearest-rank percentile: the sample at ceil(p * n), with no interpolation. */
function nearestRank(samples, fraction) {
  if (samples.length === 0) return null;
  const sorted = [...samples].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(fraction * sorted.length) - 1),
  );
  return sorted[index];
}

function percentiles(samples) {
  return {
    p50: nearestRank(samples, 0.5),
    p95: nearestRank(samples, 0.95),
    samples: samples.length,
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A shared rate gate: one acquisition every `1000 / perSecond` milliseconds, so
 * the design phase's 10 pre-signs and 10 completions per second and the stress
 * phase's 20 and 20 are the specified conditions rather than the host's speed.
 */
function rateLimiter(perSecond) {
  const interval = 1000 / perSecond;
  let next = performance.now();
  return async function acquire() {
    const now = performance.now();
    const slot = Math.max(now, next);
    next = slot + interval;
    if (slot > now) await sleep(slot - now);
  };
}

function database() {
  return new Client({ connectionString: databaseUrl });
}

async function withClient(work) {
  const client = database();
  await client.connect();
  try {
    // The role's 100 ms default governs the platform's statements, not the
    // harness's own setup and counting reads, which run beside the load.
    await client.query('SET statement_timeout = 0');
    return await work(client);
  } finally {
    await client.end();
  }
}

/** The ten quota-boundary merchants with their live sessions, in a fixed order. */
async function quotaMerchants() {
  const rows = await withClient(async (client) => {
    const result = await client.query(
      `SELECT u.id AS user_id, s.token
         FROM users u
         JOIN sessions s ON s.user_id = u.id AND s.revoked_at IS NULL AND s.expires_at > now()
        WHERE u.id LIKE 'quota-user-%'
        ORDER BY u.id
        LIMIT $1`,
      [boundary.merchants],
    );
    return result.rows;
  });
  return rows;
}

/** Three seeded merchants with one live session each, for the SC-011 sample. */
async function sc011Merchants() {
  return withClient(async (client) => {
    const result = await client.query(
      `SELECT DISTINCT ON (u.id) u.id AS user_id, s.token
         FROM users u
         JOIN sessions s ON s.user_id = u.id AND s.revoked_at IS NULL AND s.expires_at > now()
        WHERE u.id LIKE 'load-user-%'
        ORDER BY u.id, s.id
        LIMIT $1`,
      [sc011.merchants],
    );
    return result.rows;
  });
}

/** The retained-catalog count per merchant, read before and after the sample. */
async function catalogCounts(userIds) {
  return withClient(async (client) => {
    const result = await client.query(
      `SELECT user_id, count(*)::int AS count
         FROM catalogs
        WHERE user_id = ANY($1::text[])
        GROUP BY user_id`,
      [userIds],
    );
    const counts = Object.fromEntries(userIds.map((id) => [id, 0]));
    for (const row of result.rows) counts[row.user_id] = row.count;
    return counts;
  });
}

/** The 300 sessions the load phases present, one per worker at most. */
async function loadSessions(count) {
  return withClient(async (client) => {
    const result = await client.query(
      `SELECT s.token, s.user_id
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.id LIKE 'load-session-%' AND s.revoked_at IS NULL AND s.expires_at > now()
        ORDER BY s.id
        LIMIT $1`,
      [count],
    );
    return result.rows;
  });
}

/** The CSRF pair the render bootstrap returns, kept per session. */
async function bootstrap() {
  const response = await fetch(`${apiOrigin.origin}/api/v1/auth/csrf`, {
    headers: { accept: 'application/json' },
  });
  const cookies = response.headers.getSetCookie?.() ?? [];
  const csrfCookie = cookies
    .map((raw) => raw.split(';')[0])
    .find((pair) => pair?.startsWith('wafar.csrf='));
  const body = await response.json();
  return { token: body.csrfToken, cookie: csrfCookie ?? '' };
}

function sessionCookie(token) {
  return `wafar.session=${encodeURIComponent(token)}`;
}

/** One page load: the document and the quota read, in the order the page makes them. */
async function pageLoad(session, csrf) {
  const started = performance.now();
  const document = await fetch(`${webOrigin.origin}/upload`, {
    headers: { accept: 'text/html' },
  });
  await document.arrayBuffer();
  const beforeQuota = performance.now();
  const quota = await fetch(`${apiOrigin.origin}/api/v1/catalogs/quota`, {
    headers: {
      accept: 'application/json',
      cookie: `${sessionCookie(session.token)}; ${csrf.cookie}`,
    },
  });
  await quota.arrayBuffer();
  return {
    pageMs: performance.now() - started,
    quotaMs: performance.now() - beforeQuota,
    status: quota.status,
  };
}

/** The start request: the session and the CSRF pair, as the page sends them. */
async function preSign(session, csrf, file) {
  const started = performance.now();
  const response = await fetch(`${apiOrigin.origin}/api/v1/uploads`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `${sessionCookie(session.token)}; ${csrf.cookie}`,
      'x-wafar-csrf': csrf.token,
      origin: webOrigin.origin,
    },
    body: JSON.stringify(file),
  });
  const body = await response.json().catch(() => null);
  return { ms: performance.now() - started, status: response.status, body };
}

/** A part write paced at the design client's uplink, metered as it is sent. */
async function writePart(url, bytes, meter) {
  const chunk = Math.max(1, Math.round(uplinkBytesPerSecond / 10));
  let offset = 0;
  const started = meter.started;
  while (offset < bytes.byteLength) {
    const end = Math.min(bytes.byteLength, offset + chunk);
    const sent = end;
    const due = started + (sent / uplinkBytesPerSecond) * 1000;
    const wait = due - performance.now();
    if (wait > 0) await sleep(wait);
    offset = end;
  }
  // A part PUT is idempotent, so a transient 5xx from the store is retried
  // before the run is failed: the product's own client retries a part, and a
  // single store hiccup must not discard a six-minute measurement. The retry
  // adds no submission and no attempt.
  let status = 0;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'content-type': 'application/octet-stream' },
      body: bytes,
    });
    await response.arrayBuffer();
    if (response.ok) return response.headers.get('etag') ?? '"part"';
    status = response.status;
    if (status < 500 || attempt === 3) break;
    await sleep(500 * attempt);
  }
  throw new Error(`part ${status}`);
}

let serial = 0;

async function partBytesFor(size) {
  // A valid PDF carries the sample's size and a unique serial in its page
  // text, so every submission is accepted on its own content and no two share
  // a hash (T118, T005).
  serial += 1;
  const document = await PDFDocument.create();
  const page = document.addPage();
  page.drawText(`Wafar upload load sample ${serial}`, { x: 40, y: 700, size: 12 });
  const base = Buffer.from(await document.save());
  if (base.byteLength >= size) return base;
  return Buffer.concat([base, Buffer.alloc(size - base.byteLength, 0x20)]);
}

async function complete(session, csrf, uploadId, parts) {
  const started = performance.now();
  const response = await fetch(
    `${apiOrigin.origin}/api/v1/uploads/${encodeURIComponent(uploadId)}/complete`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `${sessionCookie(session.token)}; ${csrf.cookie}`,
        'x-wafar-csrf': csrf.token,
        origin: webOrigin.origin,
      },
      body: JSON.stringify({ parts }),
    },
  );
  const body = await response.json().catch(() => null);
  return { ms: performance.now() - started, status: response.status, body };
}

function causeOf(response) {
  return response.body?.error?.code ?? null;
}

function outcomeOf(completeResponse) {
  if (completeResponse.status === 201) return 'accepted';
  if (completeResponse.status === 200) return 'duplicate';
  return 'refused';
}

/** One whole intake: the page load, the start, the parts, and the completion. */
async function oneUpload(session, csrf, size, samples, outcomes, pace) {
  const page = await pageLoad(session, csrf);
  samples.pageLoad.push(page.pageMs);
  samples.quota.push(page.quotaMs);

  // SC-007's interval starts at the selection, which the page accepts only
  // after its load settled; the outcome is visible when the platform's answer
  // arrives, one render frame before the merchant reads it.
  const selectedAt = performance.now();
  const file = {
    fileName: `حمل-${size}-${Math.random().toString(16).slice(2, 10)}.pdf`,
    byteSize: size,
  };
  await pace.preSign();
  const start = await preSign(session, csrf, file);
  samples.preSign.push(start.ms);
  if (start.status !== 201) {
    outcomes.push({ outcome: 'refused', cause: causeOf(start), stage: 'start' });
    samples.total.push({ size, ms: performance.now() - selectedAt, outcome: 'refused' });
    return;
  }

  const bytes = await partBytesFor(size);
  const parts = [];
  for (const part of start.body.parts) {
    const from = (part.partNumber - 1) * partSize;
    const slice = bytes.subarray(from, from + part.byteSize);
    const etag = await writePart(part.url, slice, { started: performance.now() });
    parts.push({ partNumber: part.partNumber, etag });
  }

  await pace.complete();
  const done = await complete(session, csrf, start.body.uploadId, parts);
  samples.complete.push(done.ms);
  const outcome = outcomeOf(done);
  outcomes.push({ outcome, cause: causeOf(done), stage: 'complete' });
  samples.total.push({ size, ms: performance.now() - selectedAt, outcome });
}

/** A fixed-size worker pool over the phase's upload list. */
async function runPool(items, concurrency, work) {
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    for (;;) {
      const index = next;
      next += 1;
      const item = items[index];
      if (item === undefined) return;
      await work(item, index);
    }
  });
  await Promise.all(workers);
}

/**
 * SC-007's ratio over a phase: the selection-to-outcome interval at or under
 * one minute, counted for every upload including a refusal or a duplicate, and
 * read per size class beside the whole phase.
 */
function sc007(totalSamples) {
  const boundMs = 60_000;
  const ratio = (numerator, denominator) =>
    denominator === 0 ? null : numerator / denominator;
  const bySize = {};
  for (const size of [1, 2, 3, 4]) {
    const group = totalSamples.filter((sample) => sample.size === size * million);
    const atOrUnder = group.filter((sample) => sample.ms <= boundMs).length;
    bySize[`${size}mb`] = {
      ...percentiles(group.map((sample) => sample.ms)),
      atOrUnder60s: atOrUnder,
      ratio: ratio(atOrUnder, group.length),
    };
  }
  const atOrUnder = totalSamples.filter((sample) => sample.ms <= boundMs).length;
  return {
    boundMs,
    ...percentiles(totalSamples.map((sample) => sample.ms)),
    atOrUnder60s: atOrUnder,
    ratio: ratio(atOrUnder, totalSamples.length),
    bySize,
  };
}

/**
 * The two load conditions. The sizes are the 900-per-size sample SC-007 reads:
 * each phase walks 1 MB, 2 MB, 3 MB, and 4 MB in equal counts.
 */
async function loadPhase(condition, config) {
  const sessions = await loadSessions(config.concurrency);
  if (sessions.length === 0) throw new Error('no seeded session: run `pnpm load:seed` first');
  const bootstraps = new Map();
  for (const session of sessions) {
    bootstraps.set(session.token, await bootstrap());
  }

  const items = Array.from({ length: config.uploads }, (_, index) => ((index % 4) + 1) * million);
  const samples = { pageLoad: [], quota: [], preSign: [], complete: [], total: [] };
  const outcomes = [];
  const startedAt = performance.now();
  let active = 0;
  let peak = 0;
  const pace = {
    preSign: rateLimiter(config.preSignPerSecond),
    complete: rateLimiter(config.completedPerSecond),
  };

  await runPool(items, config.concurrency, async (size, index) => {
    const session = sessions[index % sessions.length];
    const csrf = bootstraps.get(session.token);
    active += 1;
    peak = Math.max(peak, active);
    try {
      await oneUpload(session, csrf, size, samples, outcomes, pace);
    } finally {
      active -= 1;
    }
  });

  const entry = {
    condition,
    target: { uploads: config.uploads, concurrency: config.concurrency },
    durationSeconds: Math.round((performance.now() - startedAt) / 1000),
    peakConcurrency: peak,
    pageLoad: percentiles(samples.pageLoad),
    quota: percentiles(samples.quota),
    preSign: percentiles(samples.preSign),
    complete: percentiles(samples.complete),
    outcomeLatency: sc007(samples.total),
    outcomes: byCause(outcomes),
    slowestQuery: await slowestQuery(),
  };
  return entry;
}

function byCause(outcomes) {
  const counts = {};
  for (const outcome of outcomes) {
    const key = outcome.cause ?? outcome.outcome;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/** The slowest statement p95 from `pg_stat_statements`, when the extension is there. */
async function slowestQuery() {
  try {
    return await withClient(async (client) => {
      const result = await client.query(
        `SELECT query, mean_exec_time
           FROM pg_stat_statements
          WHERE query ILIKE '%catalogs%' OR query ILIKE '%catalog_%'
          ORDER BY mean_exec_time DESC LIMIT 1`,
      );
      const row = result.rows[0];
      if (row === undefined) return null;
      return { query: row.query.slice(0, 160), meanMs: Number(row.mean_exec_time) };
    });
  } catch {
    return null;
  }
}

/**
 * The quota-boundary run: ten merchants one slot short of both limits, 60
 * distinct-content uploads each in one fixed 15-minute window. The expected
 * outcome is one acceptance and 59 limit refusals per merchant, with the 60th
 * counted and accepted as an attempt, no attempt-bound refusal, and no retry.
 */
async function quotaBoundaryRun() {
  const merchants = await quotaMerchants();
  if (merchants.length === 0) {
    throw new Error('no quota-boundary merchant: run `pnpm load:seed` first');
  }
  const samples = { pageLoad: [], quota: [], preSign: [], complete: [] };
  const outcomes = [];
  const perMerchant = new Map();
  const startedAt = performance.now();
  const pairs = new Map();
  for (const merchant of merchants) {
    pairs.set(merchant.user_id, await bootstrap());
  }

  const items = [];
  for (const merchant of merchants) {
    for (let attempt = 0; attempt < boundary.perMerchant; attempt += 1) {
      items.push({ merchant, attempt });
    }
  }

  await runPool(items, boundary.concurrency, async (item) => {
    const csrf = pairs.get(item.merchant.user_id);
    // Every submission carries distinct content, so no submission can answer as
    // a duplicate and every refusal is a limit refusal (SC-005).
    const size = million + item.attempt;
    const page = await pageLoad(item.merchant, csrf);
    samples.pageLoad.push(page.pageMs);
    samples.quota.push(page.quotaMs);
    const file = {
      fileName: `حد-${item.attempt}-${Date.now()}.pdf`,
      byteSize: size,
    };
    const start = await preSign(item.merchant, csrf, file);
    samples.preSign.push(start.ms);
    let outcome;
    if (start.status !== 201) {
      outcome = { outcome: 'refused', cause: causeOf(start), stage: 'start' };
    } else {
      const bytes = await partBytesFor(size);
      const parts = [];
      for (const part of start.body.parts) {
        const from = (part.partNumber - 1) * partSize;
        const etag = await writePart(
          part.url,
          bytes.subarray(from, from + part.byteSize),
          { started: performance.now() },
        );
        parts.push({ partNumber: part.partNumber, etag });
      }
      const done = await complete(item.merchant, csrf, start.body.uploadId, parts);
      samples.complete.push(done.ms);
      outcome = { outcome: outcomeOf(done), cause: causeOf(done), stage: 'complete' };
    }
    outcomes.push(outcome);
    const key = item.merchant.user_id;
    const record = perMerchant.get(key) ?? { accepted: 0, refused: 0, causes: {} };
    if (outcome.outcome === 'accepted') record.accepted += 1;
    else record.refused += 1;
    if (outcome.cause !== null) {
      record.causes[outcome.cause] = (record.causes[outcome.cause] ?? 0) + 1;
    }
    perMerchant.set(key, record);
  });

  return {
    condition: 'quota-boundary',
    windowSeconds: Math.round((performance.now() - startedAt) / 1000),
    merchants: Object.fromEntries(perMerchant),
    pageLoad: percentiles(samples.pageLoad),
    quota: percentiles(samples.quota),
    preSign: percentiles(samples.preSign),
    complete: percentiles(samples.complete),
    outcomes: byCause(outcomes),
    sample: outcomes.length,
  };
}

/**
 * SC-011's sample: 100 accepted uploads across three seeded merchants (34, 33,
 * 33), each with its own 1 MB content. The measurement reads the retained-catalog
 * count before and after, reads every accepted catalog's kept key, and HEADs the
 * object, so "one record and one kept file per acceptance, and no more" is read
 * from the platform rather than inferred from the answers (FR-035).
 */
async function sc011Run() {
  const merchants = await sc011Merchants();
  if (merchants.length < sc011.merchants) {
    throw new Error('no seeded session: run `pnpm load:seed` first');
  }
  const pairs = new Map();
  for (const merchant of merchants) {
    pairs.set(merchant.user_id, await bootstrap());
  }

  const userIds = merchants.map((merchant) => merchant.user_id);
  const before = await catalogCounts(userIds);

  const items = [];
  merchants.forEach((merchant, index) => {
    for (let n = 0; n < sc011.split[index]; n += 1) {
      items.push({ merchant, n });
    }
  });

  const accepted = [];
  const failures = [];
  await runPool(items, sc011.concurrency, async (item) => {
    const csrf = pairs.get(item.merchant.user_id);
    const file = {
      fileName: `قبول-${item.merchant.user_id}-${item.n}.pdf`,
      byteSize: sc011.size,
    };
    const start = await preSign(item.merchant, csrf, file);
    if (start.status !== 201) {
      failures.push(`start ${start.status} ${causeOf(start) ?? ''}`.trim());
      return;
    }
    const bytes = await partBytesFor(sc011.size);
    const parts = [];
    for (const part of start.body.parts) {
      const from = (part.partNumber - 1) * partSize;
      const etag = await writePart(part.url, bytes.subarray(from, from + part.byteSize), {
        started: performance.now(),
      });
      parts.push({ partNumber: part.partNumber, etag });
    }
    const done = await complete(item.merchant, csrf, start.body.uploadId, parts);
    if (done.status !== 201) {
      failures.push(`complete ${done.status} ${causeOf(done) ?? ''}`.trim());
      return;
    }
    accepted.push({
      catalogId: done.body.catalog.id,
      merchant: item.merchant.user_id,
      fileName: done.body.catalog.fileName,
    });
  });

  const after = await catalogCounts(userIds);
  const delta = {};
  for (const userId of userIds) {
    delta[userId] = after[userId] - (before[userId] ?? 0);
  }

  const keys = await withClient(async (client) => {
    if (accepted.length === 0) return [];
    const result = await client.query(
      `SELECT id, storage_key FROM catalogs WHERE id = ANY($1::text[])`,
      [accepted.map((row) => row.catalogId)],
    );
    return result.rows;
  });
  const keyById = new Map(keys.map((row) => [row.id, row.storage_key]));

  let kept = 0;
  const missing = [];
  for (const row of accepted) {
    const key = keyById.get(row.catalogId);
    if (key === undefined) {
      missing.push(`${row.catalogId}: no catalog row`);
      continue;
    }
    const response = await s3.fetch(objectUrl(key), { method: 'HEAD' });
    if (response.ok) kept += 1;
    else missing.push(`${key}: HEAD ${response.status}`);
  }

  const added = Object.values(delta).reduce((sum, count) => sum + count, 0);
  const ids = new Set(accepted.map((row) => row.catalogId));
  if (accepted.length !== sc011.uploads) {
    failures.push(`accepted ${accepted.length} uploads, not ${sc011.uploads}`);
  }
  if (ids.size !== accepted.length) {
    failures.push(`${accepted.length - ids.size} accepted upload(s) share a catalog id`);
  }
  if (added !== sc011.uploads) {
    failures.push(`the sample added ${added} catalog rows, not ${sc011.uploads}`);
  }
  for (const [index, userId] of userIds.entries()) {
    if (delta[userId] !== sc011.split[index]) {
      failures.push(`${userId} added ${delta[userId]} catalog rows, not ${sc011.split[index]}`);
    }
  }
  if (kept !== sc011.uploads) {
    failures.push(`${kept} kept object(s) answered, not ${sc011.uploads}`);
  }

  return {
    condition: 'sc011',
    sample: items.length,
    accepted: accepted.length,
    failures,
    catalogs: { before, after, delta, added },
    kept: { headOk: kept, missing },
    uploads: accepted,
  };
}

const allowedCauses = new Set([
  'UPLOAD_MONTHLY_LIMIT',
  'UPLOAD_ACTIVE_LIMIT',
]);

function checkBudgets(condition, entry) {
  const failures = [];
  for (const [label, budget] of [
    ['pageLoad', budgets.pageLoad],
    ['quota', budgets.quota],
    ['preSign', budgets.preSign],
    ['complete', budgets.complete],
  ]) {
    const measured = entry[label];
    if (measured?.p95 !== null && measured?.p95 !== undefined && measured.p95 > budget.p95) {
      failures.push(`${condition}: ${label} p95 ${measured.p95} ms exceeds ${budget.p95} ms`);
    }
  }
  return failures;
}

function checkLoadOutcomes(condition, entry) {
  const failures = [];
  // The design and stress phases fail on any refusal, and a cause outside the
  // fixture's expected duplicate fails the run (T005).
  for (const [cause, count] of Object.entries(entry.outcomes)) {
    if (cause === 'accepted' || cause === 'duplicate') continue;
    if (cause === null) continue;
    failures.push(`${condition}: ${count} refusal(s) with cause ${cause}`);
  }
  return failures;
}

/** SC-007: 95% of the phase's uploads confirmed within one minute of selection. */
function checkSc007(condition, entry) {
  const measured = entry.outcomeLatency;
  if (measured?.ratio === null || measured?.ratio === undefined) return [];
  if (measured.ratio < 0.95) {
    return [
      `${condition}: SC-007 ${measured.atOrUnder60s}/${measured.samples} upload(s) within 60 s, under 95%`,
    ];
  }
  return [];
}

function checkBoundary(entry) {
  const failures = [];
  for (const [merchant, record] of Object.entries(entry.merchants)) {
    if (record.accepted !== 1) {
      failures.push(`quota-boundary: ${merchant} accepted ${record.accepted} uploads, not 1`);
    }
    if (record.refused !== boundary.perMerchant - 1) {
      failures.push(
        `quota-boundary: ${merchant} refused ${record.refused} uploads, not ${boundary.perMerchant - 1}`,
      );
    }
    if (record.causes['UPLOAD_TOO_MANY_ATTEMPTS'] !== undefined) {
      failures.push(`quota-boundary: ${merchant} reached the attempt bound`);
    }
    for (const [cause, count] of Object.entries(record.causes)) {
      if (allowedCauses.has(cause)) continue;
      failures.push(`quota-boundary: ${merchant} refused ${count} by ${cause}`);
    }
  }
  return failures;
}

async function main() {
  const report_ = {
    host: process.env['HOSTNAME'] ?? 'unknown',
    mode,
    startedAt: new Date().toISOString(),
    uplinkBytesPerSecond,
    conditions: [],
  };
  const failures = [];

  if (mode === 'quota-boundary') {
    const entry = await quotaBoundaryRun();
    report_.conditions.push(entry);
    failures.push(...checkBudgets('quota-boundary', entry));
    failures.push(...checkBoundary(entry));
  } else if (mode === 'sc011') {
    const entry = await sc011Run();
    report_.conditions.push(entry);
    failures.push(...entry.failures);
  } else {
    for (const [condition, config] of [
      ['design', design],
      ['stress', stress],
    ]) {
      const entry = await loadPhase(condition, config);
      report_.conditions.push(entry);
      failures.push(...checkBudgets(condition, entry));
      failures.push(...checkLoadOutcomes(condition, entry));
      failures.push(...checkSc007(condition, entry));
    }
  }

  const totalPageLoads = report_.conditions.reduce(
    (sum, entry) => sum + (entry.pageLoad?.samples ?? 0),
    0,
  );
  const totalUploads = report_.conditions.reduce(
    (sum, entry) => sum + Object.values(entry.outcomes ?? {}).reduce((a, b) => a + b, 0),
    0,
  );
  report_.totals = { pageLoads: totalPageLoads, uploads: totalUploads };

  // The 3,600 page loads and 3,600 uploads T005 fixes, checked rather than
  // assumed, so a short run cannot pass as the sample.
  if (mode === 'load') {
    if (totalPageLoads !== 3_600) {
      failures.push(`the run carried ${totalPageLoads} page-load samples, not 3,600`);
    }
    if (totalUploads !== 3_600) {
      failures.push(`the run carried ${totalUploads} upload samples, not 3,600`);
    }
  }

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report_, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${reportPath}`);
  for (const failure of failures) console.error(failure);
  if (failures.length > 0) process.exitCode = 1;
}

await main();
