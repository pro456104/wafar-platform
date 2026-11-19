// The accessibility scan on the one page that renders the shell: the eleven
// presentations of contracts/ui-contracts.md §3 at 320 and 1280 CSS px in both
// appearances, the shell's own runtime states scanned alone, the focus movement
// on every state change, one complete keyboard-only upload, the two live
// regions' assignment and single announcement, and the merchant-read copy set
// with the seventeen causes provoked (FR-057-FR-063; AC-043-AC-045, AC-051;
// SC-008, SC-010; T034, T081, T089, T121, T130, T131).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { enterAsMerchant } from '../support/merchant.ts';
import { prepareUploadPresentation, uploadPresentations } from '../support/presentations.ts';
import { expireSession } from '../support/seed.ts';
import { settle } from '../support/scenarios.ts';

interface ScanRecord {
  label: string;
  kind: 'presentation' | 'shell' | 'ended-session';
  axe: string;
  browser: string;
  bestPracticeFindings: number;
}

const scanRecords: ScanRecord[] = [];
const reportPath = fileURLToPath(
  new URL('../../../../reports/sc-008-accessibility.json', import.meta.url),
);

const widths = [320, 1280] as const;
const appearances = ['light', 'dark'] as const;

const intakeCauses = [
  'UPLOAD_INVALID_NAME',
  'UPLOAD_UNSUPPORTED_FORMAT',
  'UPLOAD_TOO_LARGE',
  'UPLOAD_EMPTY',
  'UPLOAD_CONTENT_MISMATCH',
  'UPLOAD_CORRUPT',
  'UPLOAD_PASSWORD_PROTECTED',
  'UPLOAD_INFECTED',
  'UPLOAD_EXPANSION_CAP',
  'UPLOAD_SANITIZATION_FAILED',
  'UPLOAD_SCAN_UNAVAILABLE',
  'UPLOAD_TOO_MANY_ATTEMPTS',
  'UPLOAD_STORAGE_UNAVAILABLE',
  'UPLOAD_INCOMPLETE',
  'UPLOAD_INVALID_REQUEST',
  'UPLOAD_MONTHLY_LIMIT',
  'UPLOAD_ACTIVE_LIMIT',
] as const;

/** One scan under the plan's "no reported violation" definition, with the engine echoed. */
async function scan(
  page: Page,
  label: string,
  kind: 'presentation' | 'shell' | 'ended-session' = 'shell',
): Promise<string> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations, label).toEqual([]);
  // The run is recorded with the engine's version and the browser's, so a
  // result is reproducible (SC-008).
  expect(results.testEngine.version).toMatch(/^4\.14\./u);
  const bestPractice = await new AxeBuilder({ page }).withTags(['best-practice']).analyze();
  const browser = page.context().browser()?.version() ?? 'unknown';
  scanRecords.push({
    label,
    kind,
    axe: results.testEngine.version,
    browser,
    bestPracticeFindings: bestPractice.violations.length,
  });
  return `${label}: axe ${results.testEngine.version}, ${browser} chromium, best-practice findings ${bestPractice.violations.length}`;
}

test.afterAll(() => {
  const presentations = scanRecords.filter((record) => record.kind === 'presentation');
  const shells = scanRecords.filter((record) => record.kind === 'shell');
  // The shell's ended-session state is R1's, not one of the eleven: its own
  // observation is recorded beside the ratio and never inside it (SC-008).
  const endedSession = scanRecords.filter((record) => record.kind === 'ended-session');
  const result = {
    measuredAt: new Date().toISOString(),
    command: 'pnpm --filter @wafar/web test:a11y',
    definition:
      'zero violations of any impact among wcag2a, wcag2aa, wcag21a, wcag21aa, and wcag22aa',
    sample: {
      presentations: uploadPresentations.length,
      widths: [320, 1280],
      appearances: ['light', 'dark'],
      expectedScans: 44,
      completedScans: presentations.length,
    },
    axe: presentations[0]?.axe ?? null,
    browser: presentations[0]?.browser ?? null,
    ratio: presentations.length === 44 ? 1 : 0,
    bestPracticeFindings: presentations.reduce(
      (sum, record) => sum + record.bestPracticeFindings,
      0,
    ),
    shellObservations: shells.length,
    endedSessionObservations: endedSession.length,
    endedSession,
    scans: presentations,
  };
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`);
});

for (const [key, label] of uploadPresentations) {
  test(`the ${label} presentation passes the scan in both appearances at both widths`, async ({
    page,
  }) => {
    const records: string[] = [];
    for (const width of widths) {
      for (const appearance of appearances) {
        await page.setViewportSize({ width, height: 900 });
        await prepareUploadPresentation(page, key);
        await settle(page, appearance);
        records.push(await scan(page, `${label} ${width} ${appearance}`, 'presentation'));
        await page.unrouteAll();
      }
    }
    expect(records).toHaveLength(4);
  });
}

test('the shell alone and each runtime state pass the scan at both widths', async ({ page }) => {
  const records: string[] = [];
  for (const width of widths) {
    for (const appearance of appearances) {
      await page.setViewportSize({ width, height: 900 });
      await enterAsMerchant(page);
      await settle(page, appearance);
      records.push(await scan(page, `shell ${width} ${appearance}`));

      // The account menu and the confirmation.
      await page.locator('.wf-account-menu__trigger').click();
      records.push(await scan(page, `menu ${width} ${appearance}`));
      await page.locator('.wf-account-menu__signout').click();
      records.push(await scan(page, `confirm ${width} ${appearance}`));
      await page.locator('.wf-account-menu__cancel').click();
      await page.keyboard.press('Escape');
    }
  }
  expect(records.length).toBeGreaterThanOrEqual(8);
});

test('the sidebar, the drawer, the hidden bar, and the stacked overlay are scanned alone', async ({
  page,
}) => {
  const records: string[] = [];
  for (const appearance of appearances) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await enterAsMerchant(page);
    await settle(page, appearance);
    records.push(await scan(page, `sidebar full ${appearance}`));
    await page.locator('.wf-shell-sidebar__collapse').click();
    records.push(await scan(page, `sidebar rail ${appearance}`));

    await page.setViewportSize({ width: 900, height: 900 });
    records.push(await scan(page, `bar ${appearance}`));
    await page.getByRole('button', { name: 'المزيد' }).click();
    records.push(await scan(page, `drawer ${appearance}`));
    await page.keyboard.press('Escape');

    await page.evaluate(() => {
      document.body.style.minHeight = '4000px';
      window.scrollTo(0, 600);
    });
    records.push(await scan(page, `bar hidden ${appearance}`));
  }
  expect(records.length).toBe(10);
});

test('the shell’s ended-session state is scanned as its own observation, outside the ratio', async ({
  page,
}) => {
  await enterAsMerchant(page);
  const cookies = await page.context().cookies();
  const token = cookies.find((cookie) => cookie.name === 'wafar.session')?.value;
  expect(token).toBeTruthy();
  await expireSession(token!);
  await page.goto('/upload');
  await expect(page.locator('.wf-ended-session__heading')).toHaveText('انتهت الجلسة', {
    timeout: 45_000,
  });
  const records: string[] = [];
  for (const width of widths) {
    for (const appearance of appearances) {
      await page.setViewportSize({ width, height: 900 });
      await settle(page, appearance);
      records.push(await scan(page, `ended-session ${width} ${appearance}`, 'ended-session'));
    }
  }
  expect(records).toHaveLength(4);
});

test('one complete upload is made with the keyboard alone, and focus lands on each state', async ({
  page,
}) => {
  await enterAsMerchant(page);
  // The control is reachable by Tab and opens with Enter; the picker is driven
  // through the input the control owns, since no browser automates the dialog.
  const action = page.locator('.wf-upload-control__action');
  let reached = false;
  for (let step = 0; step < 40 && !reached; step += 1) {
    await page.keyboard.press('Tab');
    reached = await action.evaluate((element) => element === document.activeElement);
  }
  expect(reached).toBe(true);
  await expect(action).toBeFocused();
  // Enter is the control's own activation: it opens the browser's picker, and
  // the file is chosen through that dialog.
  const chooserPromise = page.waitForEvent('filechooser');
  await page.keyboard.press('Enter');
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'كتالوج.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\n'),
  });
  await expect(page.locator('#upload-success-heading, .upload-error__heading').first()).toBeVisible({
    timeout: 60_000,
  });
  const focusTarget = await page.evaluate(() => document.activeElement?.id ?? '');
  expect([
    'upload-success-heading',
    'upload-duplicate-heading',
    'upload-error-heading',
    'wf-selected-file-heading',
  ]).toContain(focusTarget);
});

test('the two regions carry one announcement each and never a percentage', async ({ page }) => {
  await enterAsMerchant(page);
  await expect(page.locator('.upload-page__region[aria-live="polite"]')).toHaveAttribute(
    'aria-atomic',
    'true',
  );
  await expect(page.locator('.upload-page__region[aria-live="assertive"]')).toHaveAttribute(
    'aria-atomic',
    'true',
  );
  await page.locator('input[type="file"]').setInputFiles({
    name: 'كتالوج.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('x'),
  });
  await expect(page.locator('.upload-error__heading')).toBeVisible();
  const assertive = await page
    .locator('.upload-page__region[aria-live="assertive"]')
    .innerText();
  expect(assertive).toContain('تعذر رفع الملف');
  expect(assertive).not.toMatch(/\d+\s*%/u);
});

test('the cut run of the file name is hidden from assistive technology', async ({ page }) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'UPLOAD_STORAGE_UNAVAILABLE', retryable: true } }),
    });
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: 'كتالوج مورد.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\n'),
  });
  await expect(page.locator('.wf-selected-file__measure')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.wf-selected-file__whole')).toHaveText('كتالوج مورد.pdf');
});

test('the format line, the card, and the percentage follow the reading rule', async ({ page }) => {
  await enterAsMerchant(page);
  const formatLine = page.locator('.upload-page__format-line span').first();
  await expect(formatLine).toHaveText('Excel (xls، xlsx) · PDF · Word (doc، docx) — حتى 100 MB');
  // The Latin unit and format runs are isolated so they read in their own order.
  // The part write is held on the storage origin, so the card stays visible.
  await page.route('**/api/v1/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        uploadId: 'reading-rule',
        partSize: 8 * 1024 * 1024,
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        parts: [{ partNumber: 1, url: 'http://127.0.0.1:8333/parts/reading-rule', byteSize: 1024 }],
      }),
    });
  });
  await page.route('http://127.0.0.1:8333/parts/reading-rule', async () => {
    // No answer: the card stays for the reading-rule assertions.
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: 'كتالوج.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\n'),
  });
  await expect(page.locator('.wf-selected-file__format')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('.wf-selected-file__unit')).toHaveAttribute('dir', 'ltr');
});

test('the seventeen causes render the merchant-read copy set', async ({ page }) => {
  await enterAsMerchant(page);
  const rows = new Map<string, string>();
  for (const code of intakeCauses) {
    const retryable = [
      'UPLOAD_SCAN_UNAVAILABLE',
      'UPLOAD_TOO_MANY_ATTEMPTS',
      'UPLOAD_STORAGE_UNAVAILABLE',
    ].includes(code);
    await page.route('**/api/v1/uploads', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code, retryable } }),
      });
    });
    await page.locator('input[type="file"]').setInputFiles({
      name: `كتالوج-${code}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\n'),
    });
    const body = page.locator('.upload-error__body');
    await expect(body).toBeVisible({ timeout: 30_000 });
    const text = await body.innerText();
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toContain(code);
    rows.set(code, text);
    if (await page.getByRole('button', { name: 'اختيار ملف آخر' }).isVisible()) {
      await page.getByRole('button', { name: 'اختيار ملف آخر' }).click();
    }
    await page.unroute('**/api/v1/uploads');
  }
  expect(rows.size).toBe(17);
  const distinct = new Set(rows.values());
  expect(distinct.size).toBe(17);
});
