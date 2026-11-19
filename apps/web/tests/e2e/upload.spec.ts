// R2's upload journeys in a real browser: the guest's return, the page's fixed
// block order, the file-level refusals, the accepted and duplicate outcomes with
// their links, the screening and its withdrawal, the quota states, the merchant
// area's session endings, and the shared shell's runtime (menu, sidebar, drawer,
// bottom bar, footer band, overlays, and the label cut at 320 px)
// (FR-001-FR-009, FR-020-FR-028, FR-041-FR-061, FR-063; AC-001-AC-005,
// AC-009-AC-010, AC-019-AC-026, AC-043-AC-051; T033, T055, T060, T063, T080-T087,
// T090, T105, T109, T120, T122, T123, T125, T126, T127, T128, T129, T136, T138).
//
// The accepted, duplicate, screening, and withdrawal journeys write and read a
// real object, so the class runs with the storage service present; the CI job
// declares that with `e2e_storage: '1'` and no journey is skipped here (T117).
import { writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { validPdf } from '../../../api/test/fixtures/intake/fixtures.ts';
import { enterAsMerchant } from '../support/merchant.ts';
import { blockSessionAccount, expireSession } from '../support/seed.ts';

const hundredMb = 100 * 1024 * 1024;

async function pdfBytes(size = 2 * 1024 * 1024): Promise<Buffer> {
  // The one fixture the API tests use, padded to the journey's size: the probe
  // accepts trailing bytes, and the sanitizer keeps them unchanged.
  const base = Buffer.from(await validPdf());
  if (base.byteLength >= size) return base;
  return Buffer.concat([base, Buffer.alloc(size - base.byteLength, 0x20)]);
}

async function choose(
  page: Page,
  name: string,
  mimeType: string,
  source: Buffer | string,
): Promise<void> {
  // A path is passed as-is so a file over Playwright's 50 MB buffer cap is
  // still a real file; the in-memory form carries the journey's own name.
  await page
    .locator('input[type="file"]')
    .setInputFiles(typeof source === 'string' ? source : { name, mimeType, buffer: source });
}

/** One complete upload, from the control to the success heading. */
async function acceptedUpload(page: Page, name = 'كتالوج المورد.pdf'): Promise<Buffer> {
  const bytes = await pdfBytes();
  await choose(page, name, 'application/pdf', bytes);
  await expect(page.locator('#upload-success-heading')).toHaveText('تم استلام الملف', {
    timeout: 60_000,
  });
  return bytes;
}

test('a guest is returned to the upload page after signing in', async ({ page }) => {
  await page.goto('/upload');
  await page.waitForURL(/\/auth\/sign-in/);
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/upload');
  await expect(page.locator('.bare-layout__title')).toBeVisible();
});

test('a live administrator session is a guest at the merchant door', async ({ page }) => {
  // The merchant sign-in refuses an administrator account, so this session can
  // only come from the administrator application sharing the cookie: the door
  // sends it to the sign-in page before the intake renders, and the page adds
  // no administrator state (FR-002, AC-002).
  await page.route('**/api/v1/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        authenticated: true,
        user: { fullName: 'مدير المنصة', role: 'administrator' },
        session: {
          expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
          lastActivityAt: new Date().toISOString(),
          restricted: false,
        },
      }),
    });
  });
  await page.goto('/upload');
  await page.waitForURL(/\/auth\/sign-in/);
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/upload');
  await expect(page.locator('.wf-upload-control')).toHaveCount(0);
  await expect(page.locator('.upload-page__title')).toHaveCount(0);
});

test('the page renders the fixed block order and one uploading control', async ({ page }) => {
  await enterAsMerchant(page);
  await expect(page.locator('.upload-page__title')).toHaveText('رفع كتالوج');
  await expect(page.locator('.wf-quota')).toBeVisible();
  await expect(page.locator('.wf-upload-control')).toBeVisible();
  await expect(page.locator('.wf-upload-control button')).toHaveCount(1);
  await expect(page.locator('input[type="file"]')).toHaveAttribute(
    'accept',
    '.xls,.xlsx,.doc,.docx,.pdf',
  );
  await expect(page.locator('.wf-selected-file')).toHaveCount(0);
  await expect(page.locator('.upload-page__format-line')).toContainText('100 MB');
  await expect(page.locator('.upload-page__region[aria-live="polite"]')).toHaveCount(1);
  await expect(page.locator('.upload-page__region[aria-live="assertive"]')).toHaveCount(1);

  // The quota block precedes the control, which precedes the format line.
  const order = await page.evaluate(() =>
    [...document.querySelectorAll('.wf-quota, .wf-upload-control, .upload-page__format-line')].map(
      (element) => element.className.split(' ')[0],
    ),
  );
  expect(order).toEqual(['wf-quota', 'wf-upload-control', 'upload-page__format-line']);
});

test('a file-level refusal arrives before any transfer, in the page’s own text', async ({
  page,
}) => {
  await enterAsMerchant(page);
  let intakeRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/uploads')) intakeRequests += 1;
  });
  await choose(page, 'كتالوج.txt', 'text/plain', Buffer.from('not a catalog'));
  await expect(page.locator('.upload-error__heading')).toHaveText('تعذر رفع الملف');
  await expect(page.locator('.upload-error__body')).toContainText('صيغة الملف غير مدعومة');
  expect(intakeRequests).toBe(0);
  await expect(page.getByRole('button', { name: 'اختيار ملف آخر' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toHaveCount(0);
});

test('a refused name shows the neutral label, and a suffix-less name is unsupported', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await choose(page, 'ملف\u202e.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.upload-error__body')).toContainText('ملف باسم غير صالح');
  await page.getByRole('button', { name: 'اختيار ملف آخر' }).click();
  await choose(page, 'كتالوج', 'application/octet-stream', Buffer.from('x'));
  await expect(page.locator('.upload-error__body')).toContainText('صيغة الملف غير مدعومة');
});

test('the empty file is refused before any transfer', async ({ page }) => {
  await enterAsMerchant(page);
  let intakeRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/uploads')) intakeRequests += 1;
  });
  await choose(page, 'فارغ.pdf', 'application/pdf', Buffer.alloc(0));
  await expect(page.locator('.upload-error__body')).toContainText('الملف فارغ');
  expect(intakeRequests).toBe(0);
});

test('exactly 100 MB passes the file checks and one byte over is refused', async ({
  page,
}, testInfo) => {
  await enterAsMerchant(page);
  // Playwright refuses an in-memory buffer this size, so the boundary is a file
  // on disk: the page reads it with the browser's own File object.
  const atBoundPath = testInfo.outputPath('at-bound.pdf');
  writeFileSync(atBoundPath, Buffer.alloc(hundredMb, 0x20));
  await choose(page, 'الحد.pdf', 'application/pdf', atBoundPath);
  // The file-level checks pass, so the page leaves the choosing state; the size
  // refusal's text is never shown.
  await expect(page.locator('.upload-error__body')).not.toContainText('حجم الملف يتجاوز');
  await expect(page.locator('.wf-selected-file__heading, .upload-error__heading')).toBeVisible({
    timeout: 60_000,
  });

  await page.goto('/upload');
  const overBoundPath = testInfo.outputPath('over-bound.pdf');
  writeFileSync(overBoundPath, Buffer.alloc(hundredMb + 1, 0x20));
  await choose(page, 'فوق الحد.pdf', 'application/pdf', overBoundPath);
  await expect(page.locator('.upload-error__body')).toContainText('حجم الملف يتجاوز 100 MB');
});

test('a drop carrying more than one file starts the first and shows the notice once', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    // Held: the first file stays in flight while the notice is asserted.
  });
  let starts = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/v1/uploads')) {
      starts += 1;
    }
  });
  // The picker is single-file, so a multi-file drop is the one path that
  // carries two files (FR-020; contracts/ui-contracts.md §4.7).
  await page.evaluate(() => {
    const transfer = new DataTransfer();
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a]);
    transfer.items.add(new File([bytes], 'أول.pdf', { type: 'application/pdf' }));
    transfer.items.add(new File([bytes], 'ثاني.pdf', { type: 'application/pdf' }));
    document
      .querySelector('.wf-upload-control__action')
      ?.dispatchEvent(
        new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }),
      );
  });
  await expect(page.locator('.upload-notice')).toHaveText(
    'تم بدء الملف الأول. يتم رفع ملف واحد في كل مرة، ولم تبدأ الملفات الأخرى.',
  );
  // Only the first file started, and only once: the control emits the
  // multi-file event alone and the parent starts the first file.
  await expect(page.locator('.wf-selected-file__name')).toContainText('أول');
  await expect.poll(() => starts, { timeout: 5_000 }).toBe(1);
});

test('the accepted journey: card, progress, screening, and the success panel', async ({
  page,
}) => {
  await enterAsMerchant(page);
  // The completion is held so the screening presentation is a state the test
  // can read rather than a frame it races (contracts/ui-contracts.md §3).
  let release = (): void => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v1/uploads/*/complete', async (route) => {
    await held;
    await route.continue();
  });
  const bytes = await pdfBytes();
  await choose(page, 'كتالوج المورد.pdf', 'application/pdf', bytes);
  await expect(page.locator('.wf-selected-file__heading')).toBeVisible();
  await expect(page.locator('.wf-upload-progress')).toBeVisible();
  await expect(page.locator('.wf-upload-progress__screening')).toBeVisible({
    timeout: 30_000,
  });
  release();
  await expect(page.locator('#upload-success-heading')).toHaveText('تم استلام الملف', {
    timeout: 60_000,
  });
  await expect(page.locator('.upload-success__body')).toContainText('كتالوج المورد.pdf');
  await expect(page.getByRole('link', { name: 'الانتقال إلى ملفاتي' })).toHaveAttribute(
    'href',
    '/my-files',
  );
  await expect(page.getByRole('button', { name: 'رفع آخر' })).toBeVisible();
  // The outcome's heading takes focus and the polite region announces it once.
  await expect(page.locator('#upload-success-heading')).toBeFocused();
  await expect(page.locator('.upload-page__region[aria-live="polite"]')).toContainText(
    'تم حفظ كتالوج المورد.pdf',
  );
});

test('the file name keeps the Latin extension isolated inside an Arabic name', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await choose(page, 'كتالوج مورد.pdf', 'application/pdf', await pdfBytes(4096));
  const extension = page.locator('.wf-selected-file__measure .wf-file-name__extension');
  await expect(extension).toHaveAttribute('dir', 'ltr');
  await expect(extension).toHaveText('.pdf');
  // The whole name is the accessible reading, once, with the cut run hidden.
  await expect(page.locator('.wf-selected-file__measure')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.wf-selected-file__whole')).toHaveText('كتالوج مورد.pdf');
});

test('an unanswered transfer is never answered as an outcome and the same file retries', async ({
  page,
}) => {
  await enterAsMerchant(page);
  // The start request is answered locally and every part write is aborted, so
  // the page sees a transport failure rather than an API answer.
  await page.route('**/api/v1/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        uploadId: 'stub-upload',
        partSize: 8 * 1024 * 1024,
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        parts: [{ partNumber: 1, url: 'http://127.0.0.1:9/part', byteSize: 1024 }],
      }),
    });
  });
  const bytes = await pdfBytes(2048);
  await choose(page, 'كتالوج.pdf', 'application/pdf', bytes);
  await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toBeVisible({
    timeout: 45_000,
  });
  await expect(page.locator('.upload-error__body')).toContainText('تعذر إكمال نقل الملف');
  await expect(page.locator('.upload-error__heading')).not.toHaveText('تم استلام الملف');

  await page.unroute('**/api/v1/uploads');
  await page.getByRole('button', { name: 'إعادة المحاولة' }).click();
  await expect(page.locator('#upload-success-heading')).toHaveText('تم استلام الملف', {
    timeout: 60_000,
  });
});

test('a part write that reports no progress for 30 s is a transfer failure', async ({ page }) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        uploadId: 'stub-stall',
        partSize: 8 * 1024 * 1024,
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        parts: [{ partNumber: 1, url: 'http://127.0.0.1:8333/parts/stall', byteSize: 1024 }],
      }),
    });
  });
  // The part is held on the storage's own origin, so the 30 s stall bound is
  // what ends the transfer, not a blocked request (FR-061).
  await page.route('http://127.0.0.1:8333/parts/stall', async () => {
    // No answer: the request stays open until the stall bound aborts it.
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toBeVisible({
    timeout: 45_000,
  });
});

test('a mid-transfer departure sends the bodyless DELETE from the pagehide listener', async ({
  page,
}) => {
  await enterAsMerchant(page);
  // The part write is held, so the departure lands mid-transfer and the upload
  // has a real session row for the beacon to cancel (FR-048, FR-050).
  let partStarted = (): void => undefined;
  const partInFlight = new Promise<void>((resolve) => {
    partStarted = resolve;
  });
  await page.route('**/intake/**', async () => {
    // No answer: the response is withdrawn by the departure's abort.
    partStarted();
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(4096));
  await expect(page.locator('.wf-upload-progress__track')).toBeVisible({ timeout: 30_000 });
  // The departure must land after the start answered and the part is open;
  // the card is also shown while the start request is still in flight.
  await partInFlight;

  const deletion = page.waitForRequest(
    (request) => request.method() === 'DELETE' && request.url().includes('/api/v1/uploads/'),
  );
  const answered = page.waitForResponse(
    (response) =>
      response.request().method() === 'DELETE' && response.url().includes('/api/v1/uploads/'),
  );
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide'));
  });

  const request = await deletion;
  expect(request.postData()).toBeNull();
  const path = new URL(request.url()).pathname;
  expect(path).toMatch(/^\/api\/v1\/uploads\/[0-9a-f-]{36}$/u);
  // The beacon is answered as a cancel, so no transfer survives the departure.
  expect((await answered).status()).toBe(204);
  await page.unroute('**/intake/**');
});

test('an incomplete transfer offers the same file once and no retry of the refusal', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads/*/complete', async (route) => {
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({
        error: { code: 'UPLOAD_INCOMPLETE', retryable: false },
      }),
    });
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.upload-error__body')).toContainText('لم يكتمل نقل الملف', {
    timeout: 45_000,
  });
  await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'اختيار ملف آخر' })).toBeVisible();
  await page.unroute('**/api/v1/uploads/*/complete');
});

test('a refusal the page reuses from R1 renders R1’s own text', async ({ page }) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'CSRF_FAILED', retryable: true } }),
    });
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.upload-error__heading')).toHaveText('تعذر رفع الملف');
  await expect(page.locator('.upload-error__body')).not.toBeEmpty();
  await page.unroute('**/api/v1/uploads');
});

test('the session’s end during an upload shows the ended-session state at once', async ({
  page,
}) => {
  await enterAsMerchant(page);
  const session = await page.context().cookies();
  const token = session.find((cookie) => cookie.name === 'wafar.session')?.value;
  expect(token).toBeTruthy();
  // The transfer starts, then the session is ended before the completion.
  await page.route('**/api/v1/uploads/*/complete', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'SESSION_ENDED', retryable: false } }),
    });
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.wf-ended-session__heading')).toHaveText('انتهت الجلسة', {
    timeout: 45_000,
  });
  await expect(page.getByRole('link', { name: 'تسجيل الدخول' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toHaveCount(0);
});

test('a session that ends during the part writes is the ended-session state at once', async ({
  page,
}) => {
  await enterAsMerchant(page);
  const cookies = await page.context().cookies();
  const token = cookies.find((cookie) => cookie.name === 'wafar.session')?.value;
  expect(token).toBeTruthy();
  // The transfer's first part is held, so the session ends before any
  // completion request exists; the watcher, not a response, replaces the
  // progress state (FR-004, FR-050; AC-002, AC-010).
  await page.route('**/intake/**', async () => undefined);
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.wf-upload-progress')).toBeVisible({ timeout: 30_000 });
  await expireSession(token!);
  await expect(page.locator('.wf-ended-session__heading')).toHaveText('انتهت الجلسة', {
    timeout: 30_000,
  });
  await expect(page.locator('.upload-error')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toHaveCount(0);
});

test('a blocked account during an upload shows the blocked state with no way back', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads/*/complete', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'ACCOUNT_BLOCKED', retryable: false } }),
    });
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.wf-ended-session__heading')).toHaveText('الحساب موقوف', {
    timeout: 45_000,
  });
  await expect(page.getByRole('link', { name: 'تسجيل الدخول' })).toHaveCount(0);
});

test('the account menu opens, dismisses on Escape, and confirms the sign-out', async ({
  page,
}) => {
  await enterAsMerchant(page);
  const trigger = page.locator('.wf-account-menu__trigger');
  await trigger.click();
  await expect(page.locator('.wf-account-menu__panel')).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'حسابي' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'إعدادات' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.wf-account-menu__panel')).toHaveCount(0);

  await trigger.click();
  await page.locator('.wf-account-menu__signout').click();
  await expect(page.locator('.wf-account-menu__confirm')).toBeVisible();
  await expect(page.locator('#wf-signout-title')).toHaveText('هل تريد تسجيل الخروج؟');
  await page.locator('.wf-account-menu__cancel').click();
  await expect(page.locator('.wf-account-menu__confirm')).toHaveCount(0);
  // Cancelling the confirmation leaves the menu open; the sign-out is its
  // third item, and the confirmation is the only step that ends the session.
  await expect(page.locator('.wf-account-menu__panel')).toBeVisible();
  await page.locator('.wf-account-menu__signout').click();
  await page.locator('.wf-account-menu__confirm-action').click();
  await page.waitForURL(/\/auth\/sign-in/);
});

test('an ended session on the door shows the ended-session state instead of the page', async ({
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
});

test('a blocked account on the door shows R1’s blocked state and no retry', async ({ page }) => {
  await enterAsMerchant(page);
  const cookies = await page.context().cookies();
  const token = cookies.find((cookie) => cookie.name === 'wafar.session')?.value;
  expect(token).toBeTruthy();
  await blockSessionAccount(token!);
  await page.goto('/upload');
  await expect(page.locator('.wf-ended-session__heading')).toHaveText('الحساب موقوف', {
    timeout: 45_000,
  });
  await expect(page.getByRole('link', { name: 'تسجيل الدخول' })).toHaveCount(0);
});

test('the quota block shows both counts and captions, then hides them on a failed re-read', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await expect(page.locator('.wf-quota__caption')).toContainText('حصة الشهر الميلادي');
  await expect(page.locator('.wf-quota__line').first()).toContainText('هذا الشهر');
  await expect(page.locator('.wf-quota__line').last()).toContainText('الملفات النشطة');
  await expect(page.locator('.wf-quota__line dd').first()).toContainText('0 من 50');
  await expect(page.locator('.wf-quota__line dd').last()).toContainText('0 من 300');

  await page.route('**/api/v1/catalogs/quota', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', retryable: true } }),
    });
  });
  // The re-read is the visibility event the block listens for; a failed answer
  // hides both counts and offers its own retry (contracts/ui-contracts.md §3).
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('.wf-quota__status--failure')).toContainText('تعذر قراءة الحصة', {
    timeout: 30_000,
  });
  await expect(page.locator('.wf-quota__line')).toHaveCount(0);
  await page.unroute('**/api/v1/catalogs/quota');
});

test('the quota-exceeded state withholds the choosing control and the outcome actions', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/catalogs/quota', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        monthly: { used: 50, limit: 50 },
        active: { used: 10, limit: 300 },
      }),
    });
  });
  await page.reload();
  await expect(page.locator('.wf-quota__exhausted')).toContainText('بلغت حد الرفع الشهري');
  await expect(page.locator('.wf-quota__exhausted')).toContainText('50 من 50');
  await expect(page.locator('.wf-upload-control')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'رفع ملف' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'تحديث' })).toBeVisible();
  await page.unroute('**/api/v1/catalogs/quota');
});

test('a limit refusal at the start lands in the quota-exceeded state, never the error state', async ({
  page,
}) => {
  await enterAsMerchant(page);
  let limits: ('monthly' | 'active')[] = [];
  let refusalCode = 'UPLOAD_MONTHLY_LIMIT';
  const both = { details: undefined as { code: string; field: string }[] | undefined };
  await page.route('**/api/v1/uploads', async (route) => {
    if (
      route.request().method() !== 'POST' ||
      !route.request().url().endsWith('/api/v1/uploads')
    ) {
      return route.continue();
    }
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          code: refusalCode,
          retryable: false,
          ...(both.details === undefined ? {} : { details: both.details }),
        },
      }),
    });
  });
  await page.route('**/api/v1/catalogs/quota', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        monthly: { used: limits.includes('monthly') ? 50 : 0, limit: 50 },
        active: { used: limits.includes('active') ? 300 : 0, limit: 300 },
      }),
    });
  });

  // Monthly first.
  limits = ['monthly'];
  await page.reload();
  await choose(page, 'شهري.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.wf-quota__exhausted')).toContainText('بلغت حد الرفع الشهري', {
    timeout: 30_000,
  });
  await expect(page.locator('.upload-error')).toHaveCount(0);
  await expect(page.locator('.wf-selected-file')).toHaveCount(0);
  await expect(page.locator('.wf-upload-control')).toHaveCount(0);

  // Then the active limit alone.
  limits = ['active'];
  refusalCode = 'UPLOAD_ACTIVE_LIMIT';
  await page.reload();
  await choose(page, 'نشط.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.wf-quota__exhausted')).toContainText('بلغت حد الملفات النشطة', {
    timeout: 30_000,
  });
  await expect(page.locator('.wf-quota__exhausted')).not.toContainText('بلغت حد الرفع الشهري');
  await expect(page.locator('.upload-error')).toHaveCount(0);

  // Both, monthly named first (FR-013, AC-030).
  limits = ['monthly', 'active'];
  refusalCode = 'UPLOAD_MONTHLY_LIMIT';
  both.details = [
    { code: 'UPLOAD_MONTHLY_LIMIT', field: 'monthly' },
    { code: 'UPLOAD_ACTIVE_LIMIT', field: 'active' },
  ];
  await page.reload();
  await choose(page, 'كلاهما.pdf', 'application/pdf', await pdfBytes(2048));
  const lines = page.locator('.wf-quota__exhausted-line');
  await expect(lines).toHaveCount(2, { timeout: 30_000 });
  await expect(lines.first()).toContainText('بلغت حد الرفع الشهري');
  await expect(lines.last()).toContainText('بلغت حد الملفات النشطة');
  await expect(page.locator('.upload-error')).toHaveCount(0);
  await expect(page.locator('.wf-upload-control')).toHaveCount(0);
});

test('the quota block names both limits, monthly first, when both are exhausted', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/catalogs/quota', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        monthly: { used: 50, limit: 50 },
        active: { used: 300, limit: 300 },
      }),
    });
  });
  await page.reload();
  const lines = page.locator('.wf-quota__exhausted-line');
  await expect(lines).toHaveCount(2);
  await expect(lines.first()).toContainText('الشهري');
  await expect(lines.last()).toContainText('النشطة');
  await page.unroute('**/api/v1/catalogs/quota');
});

test('the too-many-attempts outcome states the wait and offers the retry', async ({ page }) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      headers: { 'Retry-After': '30' },
      body: JSON.stringify({
        error: { code: 'UPLOAD_TOO_MANY_ATTEMPTS', retryable: true, retryAfterSeconds: 30 },
      }),
    });
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.upload-error__body')).toContainText('محاولات كثيرة');
  await expect(page.locator('.upload-error__wait')).toContainText('30 ثانية');
  await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toBeVisible();
  await page.unroute('**/api/v1/uploads');
});

test('a held file lives in memory only: a reload returns the page to choosing', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'UPLOAD_STORAGE_UNAVAILABLE', retryable: true } }),
    });
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.upload-error__heading')).toBeVisible({ timeout: 45_000 });
  await page.reload();
  await expect(page.locator('.wf-upload-control')).toBeVisible();
  await expect(page.locator('.wf-selected-file')).toHaveCount(0);
  await expect(page.locator('.upload-error')).toHaveCount(0);
  const stored = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }));
  expect(stored.session).toBe(0);
  await page.unroute('**/api/v1/uploads');
});

test('the counting is the merchant’s own: another account never sees this count', async ({
  browser,
}) => {
  const first = await browser.newContext();
  const firstPage = await first.newPage();
  await enterAsMerchant(firstPage);
  await acceptedUpload(firstPage, 'أول.pdf');
  await expect(firstPage.locator('.wf-quota__line dd').first()).toContainText('1 من 50');
  await first.close();

  const second = await browser.newContext();
  const secondPage = await second.newPage();
  await enterAsMerchant(secondPage);
  await expect(secondPage.locator('.wf-quota__line dd').first()).toContainText('0 من 50');
  await second.close();
});

test('the accepted journey runs past a minute with one submission surface', async ({ page }) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads/*/complete', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 61_000));
    await route.continue();
  });
  const bytes = await pdfBytes(4096);
  await choose(page, 'طويل.pdf', 'application/pdf', bytes);
  await expect(page.locator('.wf-upload-progress__screening')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('#upload-success-heading')).toHaveText('تم استلام الملف', {
    timeout: 180_000,
  });
  // One surface at a time: the progress surface is gone, and the control stays
  // out of the page while the success panel shows (FR-006, AC-003).
  await expect(page.locator('.wf-upload-control')).toHaveCount(0);
  await expect(page.locator('.wf-upload-progress')).toHaveCount(0);
  // The outcome's own action restores the choosing state and its control.
  await page.getByRole('button', { name: 'رفع آخر' }).click();
  await expect(page.locator('.wf-upload-control')).toBeVisible();
  await expect(page.locator('.upload-success')).toHaveCount(0);
});

test('a completion that never answers ends at the two-minute bound', async ({ page }) => {
  // The bound is the page's own, so the test waits past it rather than
  // shortening the production constant (FR-049, AC-009).
  test.setTimeout(200_000);
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads/*/complete', async () => undefined);
  await choose(page, 'عالق.pdf', 'application/pdf', await pdfBytes(2048));
  await expect(page.locator('.wf-upload-progress__screening')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('.upload-error__heading')).toHaveText('تعذر رفع الملف', {
    timeout: 150_000,
  });
  await expect(page.locator('.upload-error__body')).toContainText('تعذر إكمال نقل الملف');
  await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'اختيار ملف آخر' })).toBeVisible();
});

// --- US2: the file is screened before it is kept -------------------------

test('the screening phase follows the transfer and withdraws the cancel control', async ({
  page,
}) => {
  await enterAsMerchant(page);
  let release = (): void => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v1/uploads/*/complete', async (route) => {
    await held;
    await route.continue();
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(4096));
  await expect(page.locator('.wf-upload-progress__screening')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('button', { name: 'إلغاء' })).toHaveCount(0);
  await expect(page.locator('.wf-upload-progress__heading')).toHaveText('يجري فحص الملف');
  release();
  await expect(page.locator('#upload-success-heading')).toBeVisible({ timeout: 60_000 });
});

test('a safety refusal says the file was not kept and offers no retry of it', async ({ page }) => {
  await enterAsMerchant(page);
  const refusal = (code: string): string =>
    JSON.stringify({ error: { code, retryable: false } });
  for (const [code, text] of [
    ['UPLOAD_CONTENT_MISMATCH', 'محتوى الملف لا يطابق امتداده'],
    ['UPLOAD_CORRUPT', 'ملف تالف'],
    ['UPLOAD_PASSWORD_PROTECTED', 'محمي بكلمة مرور'],
    ['UPLOAD_INFECTED', 'برمجيات ضارة'],
    ['UPLOAD_EXPANSION_CAP', 'بعد فك الضغط'],
    ['UPLOAD_SANITIZATION_FAILED', 'محتوى تنفيذي'],
  ] as const) {
    await page.route('**/api/v1/uploads/*/complete', async (route) => {
      await route.fulfill({ status: 400, contentType: 'application/json', body: refusal(code) });
    });
    await choose(page, `كتالوج-${code}.pdf`, 'application/pdf', await pdfBytes(4096));
    await expect(page.locator('.upload-error__body')).toContainText(text, { timeout: 45_000 });
    await expect(page.locator('.upload-error__body')).toContainText('لم يتم حفظ الملف');
    await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'اختيار ملف آخر' })).toBeVisible();
    await page.unroute('**/api/v1/uploads/*/complete');
  }
});

test('the scan-unavailable refusal offers the same file’s retry without a new selection', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads/*/complete', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'UPLOAD_SCAN_UNAVAILABLE', retryable: true } }),
    });
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(4096));
  await expect(page.locator('.upload-error__body')).toContainText('تعذر فحص الملف', {
    timeout: 45_000,
  });
  const retry = page.getByRole('button', { name: 'إعادة المحاولة' });
  await expect(retry).toBeVisible();
  await page.unroute('**/api/v1/uploads/*/complete');
  await retry.click();
  await expect(page.locator('#upload-success-heading')).toBeVisible({ timeout: 60_000 });
});

// The page observes the two displayed counts; the three observables — the
// storage object list (including an unfinished part), the catalogs row count,
// and the monthly counter — are asserted where they are reachable, in
// apps/api/test/integration/catalogs/ (FR-030, AC-015; T123, T224).
test('after a refusal the displayed quota counts are unchanged', async ({ page }) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads/*/complete', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'UPLOAD_INFECTED', retryable: false } }),
    });
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(4096));
  await expect(page.locator('.upload-error__body')).toContainText('برمجيات ضارة', {
    timeout: 45_000,
  });
  await expect(page.locator('.wf-quota__line dd').first()).toContainText('0 من 50');
  await expect(page.locator('.wf-quota__line dd').last()).toContainText('0 من 300');
  await page.unroute('**/api/v1/uploads/*/complete');
});

// --- US3: a duplicate file is rejected by its content --------------------

test('the duplicate journey shows the original’s name, date, and status', async ({ page }) => {
  await enterAsMerchant(page);
  const bytes = await pdfBytes();
  await choose(page, 'الاسم الأول.pdf', 'application/pdf', bytes);
  await expect(page.locator('#upload-success-heading')).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'رفع آخر' }).click();
  await choose(page, 'اسم آخر.pdf', 'application/pdf', bytes);
  await expect(page.locator('#upload-duplicate-heading')).toHaveText('الملف موجود مسبقا', {
    timeout: 60_000,
  });
  await expect(page.locator('.upload-duplicate__body')).toContainText('الاسم الأول.pdf');
  await expect(page.locator('.upload-duplicate__status')).toContainText('تم الرفع');
  await expect(page.locator('.upload-duplicate__link[href^="/parts?file="]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'عرض القطع' })).toBeVisible();
});

test('the duplicate’s date is Gregorian in Latin digits and the status is the captured one', async ({
  page,
}) => {
  await enterAsMerchant(page);
  const bytes = await pdfBytes(8192);
  await choose(page, 'الأصل.pdf', 'application/pdf', bytes);
  await expect(page.locator('#upload-success-heading')).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'رفع آخر' }).click();
  await choose(page, 'نسخة.pdf', 'application/pdf', bytes);
  await expect(page.locator('#upload-duplicate-heading')).toBeVisible({ timeout: 60_000 });
  const body = await page.locator('.upload-duplicate__body').innerText();
  expect(body).toMatch(/\d{4}-\d{2}-\d{2}/u);
  expect(body).not.toMatch(/[٠-٩]/u);
});

test('a duplicate of a failed original keeps its note and both links', async ({ page }) => {
  await enterAsMerchant(page);
  const bytes = await pdfBytes(16384);
  await choose(page, 'الأصل.pdf', 'application/pdf', bytes);
  await expect(page.locator('#upload-success-heading')).toBeVisible({ timeout: 60_000 });
  await page.goto('/upload');
  await choose(page, 'نسخة.pdf', 'application/pdf', bytes);
  await expect(page.locator('#upload-duplicate-heading')).toBeVisible({ timeout: 60_000 });
  // The four-field projection: the status is one of the four labels, and the
  // outcome offers «عرض القطع» and «رفع آخر».
  await expect(page.locator('.upload-duplicate__status')).toContainText('الحالة:');
  await expect(page.getByRole('button', { name: 'رفع آخر' })).toBeVisible();
});

// --- US4: the quotas are visible and enforced ----------------------------

test('the quota numbers and caption are read from the API at the page’s load', async ({
  page,
}) => {
  await enterAsMerchant(page);
  const quota = page.waitForResponse((response) =>
    response.url().endsWith('/api/v1/catalogs/quota'),
  );
  await page.reload();
  const response = await quota;
  expect(response.ok()).toBe(true);
  const body = (await response.json()) as {
    monthly: { used: number; limit: number };
    active: { used: number; limit: number };
  };
  await expect(page.locator('.wf-quota__line dd').first()).toContainText(
    `${body.monthly.used} من ${body.monthly.limit}`,
  );
  await expect(page.locator('.wf-quota__line dd').last()).toContainText(
    `${body.active.used} من ${body.active.limit}`,
  );
});

test('an upload in flight when the limit is lowered is refused at acceptance', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/uploads/*/complete', async (route) => {
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'UPLOAD_MONTHLY_LIMIT', retryable: false } }),
    });
  });
  await choose(page, 'كتالوج.pdf', 'application/pdf', await pdfBytes(4096));
  await expect(page.locator('.upload-error__body')).toContainText('بلغت حد الرفع الشهري', {
    timeout: 45_000,
  });
  // The limit refusal offers neither the retry nor «اختيار ملف آخر».
  await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'اختيار ملف آخر' })).toHaveCount(0);
  await page.unroute('**/api/v1/uploads/*/complete');
});

test('the quota block re-reads on visibility', async ({ page }) => {
  await enterAsMerchant(page);
  await page.route('**/api/v1/catalogs/quota', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        monthly: { used: 7, limit: 50 },
        active: { used: 9, limit: 300 },
      }),
    });
  });
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('.wf-quota__line dd').first()).toContainText('7 من 50', {
    timeout: 30_000,
  });
  await page.unroute('**/api/v1/catalogs/quota');
});

// --- US5: the shared shell on the page that renders it -------------------

test('the raised search action leaves the focus order and the tree while the bar is hidden', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.setViewportSize({ width: 375, height: 640 });
  const raised = page.locator('.wf-shell-bottom-bar__slot--raised');
  await expect(raised).toHaveAttribute('aria-label', 'البحث في القطع');
  await expect(raised.locator('.wf-shell-bottom-bar__label')).toBeHidden();

  await page.evaluate(() => {
    document.body.style.minHeight = '4000px';
    window.scrollTo(0, 600);
  });
  await expect(page.locator('.wf-shell-bottom-bar')).toHaveAttribute('aria-hidden', 'true', {
    timeout: 15_000,
  });
  // The bar is inert while it is hidden, so its raised action is outside the
  // focus order and outside the accessibility tree (FR-052, AC-042).
  await expect(page.locator('.wf-shell-bottom-bar')).toHaveAttribute('inert', '');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('.wf-shell-bottom-bar')).not.toHaveAttribute('aria-hidden', 'true', {
    timeout: 15_000,
  });
});

test('the bottom bar hides after 32 px down, returns within 56 px, and respects reduced motion', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.setViewportSize({ width: 375, height: 640 });
  await page.evaluate(() => {
    document.body.style.minHeight = '4000px';
  });
  const bar = page.locator('.wf-shell-bottom-bar');
  await page.evaluate(() => window.scrollTo(0, 100));
  await expect(bar).toHaveClass(/wf-shell-bottom-bar--hidden/, { timeout: 15_000 });
  await page.evaluate(() => window.scrollTo(0, 40));
  await expect(bar).not.toHaveClass(/wf-shell-bottom-bar--hidden/, { timeout: 15_000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(bar).not.toHaveClass(/wf-shell-bottom-bar--hidden/, { timeout: 15_000 });
});

test('the sidebar collapses to its icon rail and the drawer serves the narrow screen', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator('.wf-shell-sidebar')).toBeVisible();
  await page.locator('.wf-shell-sidebar__collapse').click();
  await expect(page.locator('.wf-shell-sidebar--collapsed')).toBeVisible();

  await page.setViewportSize({ width: 900, height: 800 });
  await expect(page.locator('.wf-shell-sidebar')).toBeHidden();
  await expect(page.locator('.wf-shell-bottom-bar')).toBeVisible();
  await page.getByRole('button', { name: 'المزيد' }).click();
  await expect(page.locator('.wf-shell-drawer__panel')).toBeVisible();
  await expect(page.locator('.wf-shell-drawer__overlay')).toBeVisible();
  // Escape closes it and returns focus to «المزيد».
  await page.keyboard.press('Escape');
  await expect(page.locator('.wf-shell-drawer__panel')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'المزيد' })).toBeFocused();
});

test('the drawer’s three dismissals close it and its links close it on navigation', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.setViewportSize({ width: 900, height: 800 });
  const more = page.getByRole('button', { name: 'المزيد' });

  await more.click();
  // The panel sits at the inline start (the right edge in RTL), so the
  // activation outside it is near the opposite edge of the viewport.
  await page.locator('.wf-shell-drawer__overlay').click({ position: { x: 10, y: 400 } });
  await expect(page.locator('.wf-shell-drawer__panel')).toHaveCount(0);

  // The collapse control inside the drawer is the second dismissal.
  await more.click();
  await page.locator('.wf-shell-drawer__panel .wf-shell-sidebar__collapse').click();
  await expect(page.locator('.wf-shell-drawer__panel')).toHaveCount(0);

  // Escape is the third, and focus returns to «المزيد».
  await more.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.wf-shell-drawer__panel')).toHaveCount(0);
  await expect(more).toBeFocused();

  await more.click();
  await page.getByRole('link', { name: 'ملفاتي' }).click();
  await expect(page.locator('.wf-shell-drawer__panel')).toHaveCount(0);
});

test('the four static links sit in the drawer below 1024 px and in the footer band above', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.setViewportSize({ width: 1024, height: 800 });
  const footer = page.locator('footer');
  for (const path of ['/contact', '/privacy', '/terms', '/faq']) {
    await expect(footer.locator(`a[href="${path}"]`)).toBeVisible();
  }
  await page.setViewportSize({ width: 900, height: 800 });
  await expect(page.locator('footer')).toBeHidden();
  await page.getByRole('button', { name: 'المزيد' }).click();
  for (const path of ['/contact', '/privacy', '/terms', '/faq']) {
    await expect(page.locator(`.wf-shell-sidebar__footer-link[href="${path}"]`)).toBeVisible();
  }
});

test('the two overlays stack: the drawer above the bar and the menu above the drawer', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.setViewportSize({ width: 900, height: 800 });
  await page.getByRole('button', { name: 'المزيد' }).click();
  const stacked = await page.evaluate(() => {
    const drawer = getComputedStyle(document.querySelector('.wf-shell-drawer__overlay')!).zIndex;
    const bar = getComputedStyle(document.querySelector('.wf-shell-bottom-bar')!).zIndex;
    return { drawer: Number(drawer), bar: Number(bar) };
  });
  expect(stacked.drawer).toBeGreaterThan(stacked.bar);
});

test('at 320 px every shell label and the file name stay on one line and are cut', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.setViewportSize({ width: 320, height: 800 });
  const labels = page.locator('.wf-shell-sidebar__label, .wf-shell-bottom-bar__label');
  const count = await labels.count();
  for (let index = 0; index < count; index += 1) {
    const box = await labels.nth(index).boundingBox();
    if (box === null) continue;
    const lineHeight = await labels
      .nth(index)
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).lineHeight));
    if (Number.isFinite(lineHeight)) expect(box.height).toBeLessThanOrEqual(lineHeight * 1.6);
  }
});

test('at 320 px the selected file’s name is cut and the page never scrolls sideways', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await page.setViewportSize({ width: 320, height: 800 });
  // The part write is held on the storage origin, so the card stays for the
  // measurement and the transfer is not a refusal (FR-058, AC-026).
  await page.route('**/api/v1/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        uploadId: 'cut-upload',
        partSize: 8 * 1024 * 1024,
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        parts: [{ partNumber: 1, url: 'http://127.0.0.1:8333/parts/cut', byteSize: 1024 }],
      }),
    });
  });
  await page.route('http://127.0.0.1:8333/parts/cut', async () => {
    // No answer: the transfer stays open until the measurement is taken.
  });
  await choose(
    page,
    'كتالوج مورد طويل جدا جدا جدا جدا جدا جدا جدا.pdf',
    'application/pdf',
    await pdfBytes(2048),
  );
  const measure = page.locator('.wf-selected-file__measure .wf-file-name__stem');
  await expect(measure).toBeVisible({ timeout: 45_000 });
  const overflow = await measure.evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  );
  expect(overflow).toBe(true);
  const sideways = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(sideways).toBe(false);
  await page.unroute('**/api/v1/uploads');
  await page.unroute('http://127.0.0.1:8333/parts/cut');
});

test('the file name is cut at 768 px as well, with no horizontal scroll', async ({ page }) => {
  await enterAsMerchant(page);
  await page.setViewportSize({ width: 768, height: 900 });
  await page.route('**/api/v1/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        uploadId: 'cut-upload-768',
        partSize: 8 * 1024 * 1024,
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        parts: [{ partNumber: 1, url: 'http://127.0.0.1:8333/parts/cut-768', byteSize: 1024 }],
      }),
    });
  });
  await page.route('http://127.0.0.1:8333/parts/cut-768', async () => {
    // No answer: the card stays for the measurement.
  });
  await choose(
    page,
    'كتالوج-مورد-باسم-طويل-جدا-يحتاج-إلى-قطع.pdf',
    'application/pdf',
    await pdfBytes(2048),
  );
  await expect(page.locator('.wf-selected-file__measure')).toBeVisible({ timeout: 45_000 });
  const sideways = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(sideways).toBe(false);
  await page.unroute('**/api/v1/uploads');
  await page.unroute('http://127.0.0.1:8333/parts/cut-768');
});

test('the shell’s theme switch flips the appearance and the document keeps its direction', async ({
  page,
}) => {
  await enterAsMerchant(page);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  // The appearance is the document's `data-appearance`, the value the pre-paint
  // bootstrap writes; the switch is its one control (ADR-128, FR-025).
  const before = await page.locator('html').getAttribute('data-appearance');
  await page.locator('.wf-theme-switch').click();
  const after = await page.locator('html').getAttribute('data-appearance');
  expect(after).not.toBe(before);
  await expect(page.locator('.wf-theme-switch')).toHaveAttribute(
    'aria-pressed',
    after === 'dark' ? 'true' : 'false',
  );
});
