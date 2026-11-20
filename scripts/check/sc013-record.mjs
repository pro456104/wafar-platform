#!/usr/bin/env node
// SC-013's measurement (T098): the operational record over the acceptance run.
//
// The sample is every submission the acceptance run settles, read from the
// `intake.upload.settled` lines the run leaves under the platform's log policy
// (`apps/web/tests/.artifacts/api.log`, which the e2e wrapper mirrors from the
// API's console). The two ratios are:
//   1. the settled submissions that leave exactly one record of their outcome
//      over the settled submissions in the sample;
//   2. those records that carry no value identifying a merchant or a file over
//      the same sample.
// The counts by cause are recorded for the run's window, because a surge of
// refusals and a scanner that cannot run are read from them (FR-062).
//
// The record's closed field set is the structural guarantee the second ratio
// reads: outcome, an optional cause, the request's correlation identifier, and
// the time, and no other field. The five outcomes, the submissions FR-061 does
// not count as attempts, and the exactly-one-line-per-submission case are
// covered by `apps/api/test/integration/catalogs/operational-record.spec.ts`,
// which is cited in the report beside the lines; the abandoned session is a
// negative observation (a session left open with no line while unsettled),
// recorded separately because the sweep that closes it is R3's.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

const logPath = option('--log', join('apps', 'web', 'tests', '.artifacts', 'api.log'));
const reportPath = option('--report', join('reports', 'sc-013-operational-record.json'));
const loadLogPath = option('--load-log', null);

const outcomes = new Set(['accepted', 'duplicate', 'refused', 'failed', 'cancelled']);
const closedFields = ['cause', 'event', 'level', 'outcome', 'requestId', 'timestamp'];
const forbidden = [
  'fileName',
  'file_name',
  'contentHash',
  'content_hash',
  'storageKey',
  'storage_key',
  'userId',
  'user_id',
  'merchant',
  'merchantId',
  'accountId',
  'phone',
  'nationalNumber',
  'fullName',
  'sessionId',
  'uploadId',
];

function readSettledLines(path) {
  if (!existsSync(path)) throw new Error(`no log at ${path}`);
  const lines = [];
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/u)) {
    if (!raw.includes('intake.upload.settled')) continue;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      lines.push({ raw, parseError: true });
      continue;
    }
    if (parsed?.event === 'intake.upload.settled') lines.push(parsed);
  }
  return lines;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;

function checkLine(line, index) {
  const problems = [];
  if (line.parseError) return [`line ${index + 1}: not JSON`];
  const keys = Object.keys(line).sort();
  const required = ['event', 'level', 'outcome', 'requestId', 'timestamp'];
  for (const key of keys) {
    if (!closedFields.includes(key)) {
      problems.push(`line ${index + 1}: field ${key} is outside the closed set`);
    }
  }
  for (const key of required) {
    if (!keys.includes(key)) problems.push(`line ${index + 1}: field ${key} is missing`);
  }
  for (const key of keys) {
    if (forbidden.includes(key)) problems.push(`line ${index + 1}: carries ${key}`);
  }
  if (!outcomes.has(line.outcome)) {
    problems.push(`line ${index + 1}: outcome ${line.outcome} is outside the five`);
  }
  const needsCause = line.outcome === 'refused' || line.outcome === 'failed';
  if (needsCause && typeof line.cause !== 'string') {
    problems.push(`line ${index + 1}: ${line.outcome} carries no cause`);
  }
  if (!needsCause && line.cause !== undefined) {
    problems.push(`line ${index + 1}: ${line.outcome} carries a cause`);
  }
  if (typeof line.requestId !== 'string' || !uuid.test(line.requestId)) {
    problems.push(`line ${index + 1}: requestId is not a correlation identifier`);
  }
  if (typeof line.timestamp !== 'string' || Number.isNaN(Date.parse(line.timestamp))) {
    problems.push(`line ${index + 1}: timestamp is not a time`);
  }
  if (line.level !== 'info') problems.push(`line ${index + 1}: level is not info`);
  return problems;
}

function summarise(lines) {
  const byOutcome = {};
  const byCause = {};
  for (const line of lines) {
    byOutcome[line.outcome] = (byOutcome[line.outcome] ?? 0) + 1;
    if (line.cause !== undefined) {
      byCause[line.cause] = (byCause[line.cause] ?? 0) + 1;
    }
  }
  const timestamps = lines
    .map((line) => line.timestamp)
    .filter((value) => typeof value === 'string' && !Number.isNaN(Date.parse(value)))
    .sort();
  return {
    window: {
      first: timestamps[0] ?? null,
      last: timestamps.at(-1) ?? null,
    },
    byOutcome,
    byCause,
  };
}

const lines = readSettledLines(logPath);
const failures = [];
lines.forEach((line, index) => failures.push(...checkLine(line, index)));

const requestIds = new Set(lines.map((line) => line.requestId));
const unique = requestIds.size === lines.length;
if (!unique) {
  failures.push(
    `the run left ${lines.length} lines for ${requestIds.size} request(s): a submission carries more than one record`,
  );
}
const shaped = lines.filter((line) => checkLine(line, 0).length === 0);
const ratio = (numerator, denominator) => ({
  numerator,
  denominator,
  ratio: denominator === 0 ? null : numerator / denominator,
});

const report = {
  criterion: 'SC-013',
  log: logPath,
  sample: lines.length,
  ratios: {
    oneRecordPerSettledSubmission: ratio(unique ? lines.length : requestIds.size, lines.length),
    recordCarriesNoMerchantOrFile: ratio(shaped.length, lines.length),
  },
  ...summarise(lines),
  supportingEvidence: {
    spec: 'apps/api/test/integration/catalogs/operational-record.spec.ts',
    covers: [
      'the five outcomes: accepted, duplicate, refused, failed, cancelled',
      'the exactly-one-line-per-submission case',
      'the refusals FR-061 does not count as attempts (file-level refusals and invalid requests)',
      'the closed field set and the absence of the file name',
    ],
    abandonedSession:
      'a session left open with no settled line while unsettled; the sweep that closes it is R3\'s (FR-062)',
  },
  failures,
};

if (loadLogPath !== null) {
  const loadLines = readSettledLines(loadLogPath);
  report.loadWindow = {
    log: loadLogPath,
    sample: loadLines.length,
    ...summarise(loadLines),
  };
}

for (const [name, value] of Object.entries(report.ratios)) {
  if (value.ratio !== 1) {
    failures.push(`${name}: ${value.numerator}/${value.denominator}, not 100%`);
  }
}

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Wrote ${reportPath}`);
console.log(
  `SC-013: ${lines.length} settled line(s), ${report.byOutcome.accepted ?? 0} accepted, ` +
    `${report.byOutcome.duplicate ?? 0} duplicate, ${report.byOutcome.refused ?? 0} refused, ` +
    `${report.byOutcome.failed ?? 0} failed, ${report.byOutcome.cancelled ?? 0} cancelled`,
);
for (const failure of failures) console.error(failure);
if (failures.length > 0) process.exitCode = 1;
