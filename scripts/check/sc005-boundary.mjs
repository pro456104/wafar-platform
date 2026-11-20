#!/usr/bin/env node
// SC-005's measurement (T096), read after the quota-boundary run: the three
// ratios the criterion fixes, over the ten seeded merchants.
//
//   1. merchants whose final monthly count is at or under 50 over the ten;
//   2. merchants whose final active count is at or under 300 over the ten;
//   3. merchants that accepted exactly one of their 60 concurrent uploads over
//      the ten — one free slot admits one acceptance and not two.
//
// The accepted count and the refusals by cause come from the run's own report
// (`scripts/load/upload-smoke.mjs --quota-boundary`); the final monthly and
// active counts are read here from the records, in the injected clock's month
// in Africa/Tripoli, and never inferred from the run's answers.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const apiRequire = createRequire(new URL('../../apps/api/package.json', import.meta.url));
const { Client } = apiRequire('pg');

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

const runPath = option('--report', join('reports', 'sc-005-quota-boundary.json'));
const outPath = option('--out', join('reports', 'sc-005-boundary-measure.json'));
const databaseUrl =
  process.env['DATABASE_URL'] ?? 'postgres://wafar:wafar@localhost:5432/wafar';
const monthlyLimit = 50;
const activeLimit = 300;
const merchantsExpected = 10;

if (!existsSync(runPath)) {
  console.error(`no boundary run report at ${runPath}: run \`pnpm load:upload -- --quota-boundary\` first`);
  process.exit(1);
}

const run = JSON.parse(readFileSync(runPath, 'utf8'));
const condition = (run.conditions ?? []).find((entry) => entry.condition === 'quota-boundary');
if (condition === undefined) {
  console.error(`${runPath} carries no quota-boundary condition`);
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });
await client.connect();
const { rows } = await client.query(
  `SELECT u.id AS user_id,
          (SELECT count(*)::int FROM catalogs c
            WHERE c.user_id = u.id AND c.deleted_at IS NULL) AS active,
          COALESCE((SELECT m.count FROM catalog_monthly_uploads m
            WHERE m.user_id = u.id
              AND m.month_start = date_trunc('month', (now() AT TIME ZONE 'Africa/Tripoli'))::date), 0) AS monthly
     FROM users u
    WHERE u.id LIKE 'quota-user-%'
    ORDER BY u.id`,
);
await client.end();

const byMerchant = rows.map((row) => {
  const runRecord = condition.merchants[row.user_id] ?? { accepted: 0, refused: 0, causes: {} };
  return {
    userId: row.user_id,
    monthly: row.monthly,
    active: row.active,
    accepted: runRecord.accepted,
    refused: runRecord.refused,
    causes: runRecord.causes,
  };
});

const ratio = (numerator, denominator) => ({
  numerator,
  denominator,
  ratio: denominator === 0 ? null : numerator / denominator,
});

const underMonthly = byMerchant.filter((row) => row.monthly <= monthlyLimit);
const underActive = byMerchant.filter((row) => row.active <= activeLimit);
const oneAcceptance = byMerchant.filter((row) => row.accepted === 1);

const report = {
  criterion: 'SC-005',
  run: runPath,
  windowSeconds: condition.windowSeconds,
  sample: byMerchant.length,
  ratios: {
    monthlyAtOrUnderLimit: ratio(underMonthly.length, byMerchant.length),
    activeAtOrUnderLimit: ratio(underActive.length, byMerchant.length),
    exactlyOneAcceptance: ratio(oneAcceptance.length, byMerchant.length),
  },
  accepted: byMerchant.reduce((sum, row) => sum + row.accepted, 0),
  refusedByCause: condition.outcomes,
  merchants: byMerchant,
  failures: [],
};

const failures = report.failures;
if (byMerchant.length !== merchantsExpected) {
  failures.push(`the sample carries ${byMerchant.length} merchant(s), not ${merchantsExpected}`);
}
for (const [name, value] of Object.entries(report.ratios)) {
  if (value.ratio !== 1) {
    failures.push(`${name}: ${value.numerator}/${value.denominator}, not 100%`);
  }
}
for (const row of byMerchant) {
  if (row.monthly > monthlyLimit) {
    failures.push(`${row.userId}: monthly count ${row.monthly} exceeds ${monthlyLimit}`);
  }
  if (row.active > activeLimit) {
    failures.push(`${row.userId}: active count ${row.active} exceeds ${activeLimit}`);
  }
  if (row.accepted !== 1) {
    failures.push(`${row.userId}: accepted ${row.accepted} uploads, not 1`);
  }
  if ((row.causes['UPLOAD_TOO_MANY_ATTEMPTS'] ?? 0) !== 0) {
    failures.push(`${row.userId}: reached the attempt bound`);
  }
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outPath}`);
console.log(
  `SC-005: ${underMonthly.length}/${byMerchant.length} monthly, ` +
    `${underActive.length}/${byMerchant.length} active, ` +
    `${oneAcceptance.length}/${byMerchant.length} one acceptance`,
);
for (const failure of failures) console.error(failure);
if (failures.length > 0) process.exitCode = 1;
