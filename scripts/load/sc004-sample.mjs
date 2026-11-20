#!/usr/bin/env node
// SC-004's measurement (T112): every duplicate submission in the acceptance
// sample, read from the outcome the merchant sees and from the records.
//
// The sample is the one the specification fixes: a repeat by the same merchant,
// a repeat by another merchant, two identical files at the same moment, two
// files identical except for their macros, and one duplicate for each of the
// four processing statuses the seed's SC-004 block retains (uploaded,
// processing, completed, failed), so the failed original and its «ملفاتي» link
// are in the sample.
//
// Three ratios are recorded, each with its sample, numerator, and denominator:
//   1. duplicate submissions that leave exactly one catalog for that content
//      over the duplicate submissions in the sample;
//   2. outcomes showing the original's name, upload date, Arabic status label,
//      and parts link over the outcomes in the sample;
//   3. duplicates whose captured status is `failed` and that carry the
//      «ملفاتي» link over such duplicates.
//
// Every outcome is read from a real browser: the page renders the duplicate
// panel, so the name, the date, the Arabic label, and the links are the ones
// the merchant sees, not the API payload's fields. Each count of catalogs is a
// statement against `catalogs` for the content hash the platform kept.
//
// It never runs against production and needs the dev API and web up beside the
// seeded database (`pnpm load:seed`).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

if (process.env['NODE_ENV'] === 'production') {
  console.error('The SC-004 measurement never runs against production.');
  process.exit(1);
}

const webRequire = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const { chromium } = webRequire('@playwright/test');
const apiRequire = createRequire(new URL('../../apps/api/package.json', import.meta.url));
const { Client } = apiRequire('pg');
const { PDFDocument } = apiRequire('pdf-lib');
const { zipSync, strToU8 } = apiRequire('fflate');

const webOrigin = new URL(process.env['WEB_ORIGIN'] ?? 'http://127.0.0.1:3000');
const databaseUrl =
  process.env['DATABASE_URL'] ?? 'postgres://wafar:wafar@localhost:5432/wafar';
const reportPath = process.env['SC004_REPORT'] ?? join('reports', 'sc-004-duplicates.json');
const sampleDir = join('reports', 'sc-004');

/** The Arabic status labels FR-044 fixes, as the page renders them. */
const statusLabels = {
  uploaded: 'تم الرفع',
  processing: 'قيد المعالجة',
  completed: 'اكتمل',
  failed: 'فشل',
};

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Tripoli',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** The page's own date surface: `YYYY-MM-DD` in Africa/Tripoli. */
function formatDate(value) {
  const parts = dateFormatter.formatToParts(new Date(value));
  const pick = (type) => parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

const client = new Client({ connectionString: databaseUrl });

async function query(text, values = []) {
  const result = await client.query(text, values);
  return result.rows;
}

async function sessionToken(userId) {
  const rows = await query(
    `SELECT token FROM sessions
      WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > now()
      ORDER BY id LIMIT 1`,
    [userId],
  );
  if (rows.length > 0) return rows[0].token;
  // The seeded original's owner has no load session of its own (the seed's 300
  // sessions belong to load-user-001000 and up), so the measurement gives it
  // one: the same merchant must make the same-merchant repeat.
  const id = `sc004-session-${userId}`;
  const token = `sc004-session-token-${userId}-${'s'.repeat(24)}`;
  await query(
    `INSERT INTO sessions (id, user_id, token, expires_at, last_activity_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (id) DO UPDATE
       SET token = excluded.token,
           expires_at = excluded.expires_at,
           last_activity_at = now(),
           revoked_at = NULL,
           revoked_reason = NULL`,
    [id, userId, token, new Date(Date.now() + 12 * 60 * 60 * 1000)],
  );
  return token;
}

/** The four seeded originals, one at each processing status. */
async function seededOriginals() {
  const rows = await query(
    `SELECT id, file_name, uploaded_at, status, content_hash
       FROM catalogs
      WHERE id LIKE 'sample-catalog-%' AND deleted_at IS NULL
      ORDER BY id`,
  );
  const byStatus = new Map(rows.map((row) => [row.status, row]));
  for (const status of Object.keys(statusLabels)) {
    if (!byStatus.has(status)) {
      throw new Error(`the seed carries no original at ${status}: run \`pnpm load:seed\``);
    }
  }
  return byStatus;
}

/** The retained catalogs a content hash has, which must be exactly one. */
async function catalogsForHash(hash) {
  const rows = await query(
    `SELECT id FROM catalogs WHERE content_hash = $1 AND deleted_at IS NULL`,
    [hash],
  );
  return rows.map((row) => row.id);
}

async function catalogByName(fileName) {
  const rows = await query(
    `SELECT id, content_hash FROM catalogs
      WHERE file_name = $1 AND deleted_at IS NULL
      ORDER BY uploaded_at DESC LIMIT 1`,
    [fileName],
  );
  return rows[0] ?? null;
}

/** One PDF whose bytes carry a serial, so a run's content is its own. */
async function uniquePdf(serial) {
  const document = await PDFDocument.create();
  const page = document.addPage();
  page.drawText(`Wafar SC-004 simultaneous ${serial}`, { x: 40, y: 700, size: 12 });
  return Buffer.from(await document.save());
}

const encoder = new TextEncoder();

function contentTypes(parts) {
  return encoder.encode(
    `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">${parts
      .map((part) => `<Override PartName="/${part}" ContentType="application/octet-stream"/>`)
      .join('')}</Types>`,
  );
}

const workbookXml = encoder.encode(
  '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets><sheet name="Sheet1" sheetId="1"/></sheets></workbook>',
);

/** The plain workbook the macro workbook's kept bytes equal after stripping. */
function validXlsx() {
  return Buffer.from(
    zipSync({
      '[Content_Types].xml': contentTypes(['xl/workbook.xml']),
      'xl/workbook.xml': workbookXml,
    }),
  );
}

/** The same workbook carrying a VBA project and its relationship. */
function xlsxWithMacro() {
  return Buffer.from(
    zipSync({
      '[Content_Types].xml': contentTypes(['xl/workbook.xml', 'xl/vbaProject.bin']),
      'xl/workbook.xml': workbookXml,
      'xl/vbaProject.bin': strToU8('macro bytes'),
      'xl/_rels/workbook.xml.rels': strToU8(
        '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" Target="vbaProject.bin"/></Relationships>',
      ),
    }),
  );
}

async function contextFor(browser, userId) {
  const token = await sessionToken(userId);
  const context = await browser.newContext();
  await context.addCookies([{ name: 'wafar.session', value: token, url: webOrigin.origin }]);
  return context;
}

async function openUpload(page) {
  const quota = page.waitForResponse(
    (response) => response.url().endsWith('/api/v1/catalogs/quota'),
    { timeout: 60_000 },
  );
  await page.goto(`${webOrigin.origin}/upload`);
  await quota.catch(() => undefined);
  await page.locator('.wf-upload-control').waitFor({ state: 'visible', timeout: 60_000 });
  // The control's listener is bound only after Nuxt mounts; a selection made
  // against the server-rendered markup would be dropped.
  await page.waitForFunction(
    () => {
      const root = document.querySelector('#__nuxt');
      return root !== null && root.__vue_app__ !== undefined;
    },
    { timeout: 60_000 },
  );
}

async function choose(page, name, mimeType, buffer) {
  await page.locator('input[type="file"]').setInputFiles({ name, mimeType, buffer });
}

/** The duplicate outcome as the merchant sees it. */
async function readDuplicate(page) {
  try {
    await page
      .locator('#upload-duplicate-heading')
      .waitFor({ state: 'visible', timeout: 120_000 });
  } catch {
    const snapshot = await page.evaluate(() => ({
      url: location.href,
      text: (document.body.innerText || '').replace(/\s+/gu, ' ').trim().slice(0, 800),
    }));
    throw new Error(`no duplicate panel at ${snapshot.url}: ${snapshot.text}`);
  }
  const panel = page.locator('.upload-duplicate');
  // The name is read from its own surface's `textContent`: the surface is an
  // inline-flex run of two isolated bdi elements (ADR-128 §14), and `innerText`
  // inserts a boundary space between them that the merchant never sees.
  const name = ((await panel.locator('.wf-file-name').textContent()) ?? '').trim();
  const body = (await panel.locator('.upload-duplicate__body').innerText())
    .replace(/\s+/gu, ' ')
    .trim();
  const statusLine = (await panel.locator('.upload-duplicate__status').innerText())
    .replace(/\s+/gu, ' ')
    .trim();
  const links = await panel.locator('a').evaluateAll((nodes) =>
    nodes.map((node) => ({
      href: node.getAttribute('href') ?? '',
      text: (node.textContent ?? '').replace(/\s+/gu, ' ').trim(),
    })),
  );
  return { name, body, statusLine, links };
}

async function waitForSuccess(page) {
  await page.locator('#upload-success-heading').waitFor({ state: 'visible', timeout: 120_000 });
}

/**
 * Checks one duplicate outcome against the original's captured record: the
 * name, the date, the Arabic label of the captured status, and the parts link.
 */
function checkOutcome(member, original, seen) {
  const problems = [];
  if (seen.name !== original.file_name) {
    problems.push(`the name surface reads «${seen.name}», not «${original.file_name}»`);
  }
  const expectedDate = formatDate(original.uploaded_at);
  if (!seen.body.includes(expectedDate)) {
    problems.push(`the body does not show the upload date ${expectedDate}`);
  }
  const expectedStatus = `الحالة: ${statusLabels[original.status]}`;
  if (seen.statusLine !== expectedStatus) {
    problems.push(`the status line is «${seen.statusLine}», not «${expectedStatus}»`);
  }
  const partsHref = `/parts?file=${original.id}`;
  if (!seen.links.some((link) => link.href === partsHref)) {
    problems.push(`no parts link to ${partsHref}`);
  }
  if (original.status === 'failed') {
    if (!seen.links.some((link) => link.href === '/my-files')) {
      problems.push('the failed original carries no «ملفاتي» link');
    }
  }
  return problems.map((problem) => `${member}: ${problem}`);
}

async function main() {
  const report = {
    criterion: 'SC-004',
    host: process.env['HOSTNAME'] ?? 'unknown',
    startedAt: new Date().toISOString(),
    sample: [],
    ratios: {},
    failures: [],
  };
  const failures = report.failures;

  await client.connect();
  await client.query('SET statement_timeout = 0');
  const originals = await seededOriginals();
  const serial = Date.now();
  const browser = await chromium.launch();

  try {
    const sameContext = await contextFor(browser, 'load-user-000000');
    const otherContext = await contextFor(browser, 'load-user-000001');

    /** One duplicate by re-uploading a seeded original's identical bytes. */
    async function repeatOriginal(context, status, member, merchant) {
      const original = originals.get(status);
      const bytes = readFileSync(join(sampleDir, `${status}.pdf`));
      const page = await context.newPage();
      try {
        await openUpload(page);
        await choose(page, `نسخة-${status}-${serial}.pdf`, 'application/pdf', bytes);
        const seen = await readDuplicate(page);
        const entry = {
          member,
          merchant,
          original: {
            id: original.id,
            fileName: original.file_name,
            uploadedAt: original.uploaded_at,
            status: original.status,
          },
          outcome: seen,
          catalogs: await catalogsForHash(original.content_hash),
        };
        report.sample.push(entry);
        failures.push(...checkOutcome(member, original, seen));
      } finally {
        await page.close();
      }
    }

    for (const status of ['uploaded', 'processing', 'completed', 'failed']) {
      await repeatOriginal(sameContext, status, `same-merchant:${status}`, 'load-user-000000');
    }
    await repeatOriginal(
      otherContext,
      'uploaded',
      'another-merchant:uploaded',
      'load-user-000001',
    );

    // Two identical files at the same moment: one acceptance, one duplicate.
    // Each submission comes from its own merchant in its own browser context:
    // R1's render bootstrap rotates the CSRF token and invalidates the previous
    // one (T019), so two tabs sharing a cookie jar would refuse one submission
    // at step 0 before intake ever sees it. Two independent jars keep the race
    // on the content hash itself, which is the case the criterion measures.
    {
      const bytes = await uniquePdf(serial);
      const name = `متزامن-${serial}.pdf`;
      const first = await sameContext.newPage();
      const second = await otherContext.newPage();
      try {
        await openUpload(first);
        await openUpload(second);
        const firstOutcome = first
          .locator('#upload-success-heading, #upload-duplicate-heading')
          .first()
          .waitFor({ state: 'visible', timeout: 120_000 });
        const secondOutcome = second
          .locator('#upload-success-heading, #upload-duplicate-heading')
          .first()
          .waitFor({ state: 'visible', timeout: 120_000 });
        await Promise.all([
          choose(first, name, 'application/pdf', bytes),
          choose(second, name, 'application/pdf', bytes),
        ]);
        await Promise.all([firstOutcome, secondOutcome]);

        const acceptedOnFirst = (await first.locator('#upload-success-heading').count()) > 0;
        const duplicatePage = acceptedOnFirst ? second : first;
        const acceptedPage = acceptedOnFirst ? first : second;
        const seen = await readDuplicate(duplicatePage);
        await acceptedPage.locator('#upload-success-heading').waitFor({ state: 'visible' });
        const acceptedRow = await catalogByName(name);
        if (acceptedRow === null) {
          failures.push('simultaneous: no catalog row carries the accepted file name');
        } else {
          const original = {
            id: acceptedRow.id,
            file_name: name,
            uploaded_at: new Date().toISOString(),
            status: 'uploaded',
            content_hash: acceptedRow.content_hash,
          };
          // The duplicate's original is the accepted row; its date is the row's.
          const rows = await query(
            `SELECT uploaded_at FROM catalogs WHERE id = $1 AND deleted_at IS NULL`,
            [acceptedRow.id],
          );
          if (rows.length > 0) original.uploaded_at = rows[0].uploaded_at;
          const entry = {
            member: 'simultaneous',
            merchant: acceptedOnFirst ? 'load-user-000001' : 'load-user-000000',
            original: {
              id: original.id,
              fileName: original.file_name,
              uploadedAt: original.uploaded_at,
              status: original.status,
            },
            outcome: seen,
            catalogs: await catalogsForHash(acceptedRow.content_hash),
          };
          report.sample.push(entry);
          failures.push(...checkOutcome('simultaneous', original, seen));
        }
      } finally {
        await first.close();
        await second.close();
      }
    }

    // Two files identical except for their macros: the kept bytes are the same.
    {
      const macroName = `كتالوج-ماكرو-${serial}.xlsx`;
      const plainName = `كتالوج-عادي-${serial}.xlsx`;
      const macroPage = await sameContext.newPage();
      let acceptedRow = null;
      try {
        await openUpload(macroPage);
        await choose(
          macroPage,
          macroName,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          xlsxWithMacro(),
        );
        await waitForSuccess(macroPage);
        acceptedRow = await catalogByName(macroName);
        if (acceptedRow === null) {
          failures.push('macros: no catalog row carries the accepted macro workbook');
        }
      } finally {
        await macroPage.close();
      }

      const plainPage = await sameContext.newPage();
      try {
        await openUpload(plainPage);
        await choose(
          plainPage,
          plainName,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          validXlsx(),
        );
        const seen = await readDuplicate(plainPage);
        if (acceptedRow !== null) {
          const rows = await query(
            `SELECT uploaded_at FROM catalogs WHERE id = $1 AND deleted_at IS NULL`,
            [acceptedRow.id],
          );
          const original = {
            id: acceptedRow.id,
            file_name: macroName,
            uploaded_at: rows[0]?.uploaded_at ?? new Date().toISOString(),
            status: 'uploaded',
            content_hash: acceptedRow.content_hash,
          };
          const entry = {
            member: 'macros',
            merchant: 'load-user-000000',
            original: {
              id: original.id,
              fileName: original.file_name,
              uploadedAt: original.uploaded_at,
              status: original.status,
            },
            outcome: seen,
            catalogs: await catalogsForHash(acceptedRow.content_hash),
          };
          report.sample.push(entry);
          failures.push(...checkOutcome('macros', original, seen));
        }
      } finally {
        await plainPage.close();
      }
    }
  } finally {
    await browser.close();
    await client.end();
  }

  // Ratio 1: exactly one catalog per duplicate submission's content.
  const oneCatalog = report.sample.filter((entry) => entry.catalogs.length === 1);
  // Ratio 2: the outcome shows the four fields; ratio 3: the failed original's
  // «ملفاتي» link. Both are counted from the outcome checks above.
  const failed = report.sample.filter((entry) => entry.original.status === 'failed');
  const failedWithLink = failed.filter((entry) =>
    entry.outcome.links.some((link) => link.href === '/my-files'),
  );
  const shown = report.sample.filter((entry) => {
    const problems = checkOutcome('', {
      id: entry.original.id,
      file_name: entry.original.fileName,
      uploaded_at: entry.original.uploadedAt,
      status: entry.original.status,
    }, entry.outcome);
    return problems.length === 0;
  });

  const ratio = (numerator, denominator) => ({
    numerator,
    denominator,
    ratio: denominator === 0 ? null : numerator / denominator,
  });
  report.ratios = {
    oneCatalogPerContent: ratio(oneCatalog.length, report.sample.length),
    outcomeFields: ratio(shown.length, report.sample.length),
    failedCarriesMyFiles: ratio(failedWithLink.length, failed.length),
  };

  for (const [name, value] of Object.entries(report.ratios)) {
    if (value.ratio !== 1) {
      failures.push(`${name}: ${value.numerator}/${value.denominator}, not 100%`);
    }
  }

  report.finishedAt = new Date().toISOString();
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${reportPath}`);
  console.log(
    `SC-004: ${oneCatalog.length}/${report.sample.length} one catalog, ` +
      `${shown.length}/${report.sample.length} four fields, ` +
      `${failedWithLink.length}/${failed.length} failed carries «ملفاتي»`,
  );
  for (const failure of failures) console.error(failure);
  if (failures.length > 0) process.exitCode = 1;
}

await main();
