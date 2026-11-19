// The eleven presentations of contracts/ui-contracts.md §3, driven through the
// local API and the database: idle, selected, the two uploading phases, the
// three outcomes, the three quota presentations, and the multi-file notice. One
// named presentation has one definition, so the accessibility scan and the
// visual baseline set read the same state (T099, T131, T156; SC-008, §8).
import { expect, type Page } from '@playwright/test';
import { enterAsMerchant } from './merchant.ts';

export type UploadPresentation =
  | 'idle'
  | 'selected'
  | 'uploading'
  | 'screening'
  | 'success'
  | 'duplicate'
  | 'error'
  | 'quota-exceeded'
  | 'quota-loading'
  | 'quota-read-failure'
  | 'multi-file-notice';

/** The presentation's key and the name the contract gives it. */
export const uploadPresentations: readonly (readonly [UploadPresentation, string])[] = [
  ['idle', 'idle / choosing'],
  ['selected', 'selected'],
  ['uploading', 'uploading — transfer'],
  ['screening', 'uploading — screening'],
  ['success', 'success'],
  ['duplicate', 'duplicate'],
  ['error', 'error'],
  ['quota-exceeded', 'quota exceeded'],
  ['quota-loading', 'quota loading'],
  ['quota-read-failure', 'quota read failure'],
  ['multi-file-notice', 'multi-file notice'],
] as const;

/**
 * Enters as a merchant and drives the page to the named presentation. Every
 * path is the page's own: the start, part, and complete requests are the ones
 * the browser would make, answered or held so the state stands still.
 */
export async function prepareUploadPresentation(
  page: Page,
  presentation: UploadPresentation,
): Promise<void> {
  await enterAsMerchant(page);

  if (presentation === 'idle') return;

  if (presentation === 'quota-loading') {
    await page.route('**/api/v1/catalogs/quota', async () => {
      // Held rather than continued: the load is the presentation, and the
      // reload below aborts the request this handler is holding.
    });
    await page.reload();
    return;
  }

  if (presentation === 'quota-read-failure') {
    await page.route('**/api/v1/catalogs/quota', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', retryable: true } }),
      });
    });
    await page.reload();
    await expect(page.locator('.wf-quota__status--failure')).toBeVisible();
    return;
  }

  if (presentation === 'quota-exceeded') {
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
    await expect(page.locator('.wf-quota__exhausted')).toBeVisible();
    return;
  }

  if (presentation === 'multi-file-notice') {
    await page.route('**/api/v1/uploads', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'UPLOAD_STORAGE_UNAVAILABLE', retryable: true } }),
      });
    });
    // A drop is the only path that carries more than one file: the picker is
    // single-file, so the notice is driven by a real DataTransfer drop (FR-020).
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
    await expect(page.locator('.upload-notice')).toBeVisible();
    return;
  }

  if (presentation === 'selected') {
    await page.route('**/api/v1/uploads', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      // Held rather than continued: the card and the 0% progress are the
      // presentation, and the start request needs no answer for it.
    });
    await page.locator('input[type="file"]').setInputFiles({
      name: 'كتالوج.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\n'),
    });
    await expect(page.locator('.wf-selected-file__heading')).toBeVisible();
    return;
  }

  if (presentation === 'uploading') {
    await page.route('**/api/v1/uploads', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          uploadId: 'scan-upload',
          partSize: 8 * 1024 * 1024,
          expiresAt: new Date(Date.now() + 900_000).toISOString(),
          parts: [{ partNumber: 1, url: 'http://127.0.0.1:8333/scan-part', byteSize: 1024 }],
        }),
      });
    });
    await page.route('http://127.0.0.1:8333/scan-part', async () => {
      // The part is never answered, so the transfer presentation holds.
    });
    await page.locator('input[type="file"]').setInputFiles({
      name: 'كتالوج.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\n'),
    });
    await expect(page.locator('.wf-upload-progress__track')).toBeVisible();
    return;
  }

  if (presentation === 'screening') {
    await page.route('**/api/v1/uploads', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          uploadId: 'scan-screening',
          partSize: 8 * 1024 * 1024,
          expiresAt: new Date(Date.now() + 900_000).toISOString(),
          parts: [{ partNumber: 1, url: 'http://127.0.0.1:8333/scan-part', byteSize: 1024 }],
        }),
      });
    });
    await page.route('http://127.0.0.1:8333/scan-part', async (route) => {
      await route.fulfill({ status: 200, headers: { etag: '"part-1"' } });
    });
    await page.route('**/api/v1/uploads/*/complete', async () => {
      // The completion is never answered, so the screening presentation holds.
    });
    await page.locator('input[type="file"]').setInputFiles({
      name: 'كتالوج.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\n'),
    });
    await expect(page.locator('.wf-upload-progress__screening')).toBeVisible();
    return;
  }

  if (presentation === 'success' || presentation === 'duplicate') {
    await page.route('**/api/v1/uploads', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          uploadId: `scan-${presentation}`,
          partSize: 8 * 1024 * 1024,
          expiresAt: new Date(Date.now() + 900_000).toISOString(),
          parts: [{ partNumber: 1, url: 'http://127.0.0.1:8333/scan-part', byteSize: 1024 }],
        }),
      });
    });
    await page.route('http://127.0.0.1:8333/scan-part', async (route) => {
      await route.fulfill({ status: 200, headers: { etag: '"part-1"' } });
    });
    await page.route('**/api/v1/uploads/*/complete', async (route) => {
      const body =
        presentation === 'success'
          ? JSON.stringify({
              outcome: 'accepted',
              catalog: {
                id: '00000000-0000-4000-8000-000000000000',
                fileName: 'كتالوج.pdf',
                byteSize: 2048,
                contentType: 'application/pdf',
                status: 'uploaded',
                uploadedAt: '2026-03-01T10:00:00.000Z',
              },
            })
          : JSON.stringify({
              outcome: 'duplicate',
              original: {
                id: '00000000-0000-4000-8000-000000000000',
                fileName: 'كتالوج الأصل.pdf',
                uploadedAt: '2026-03-01T10:00:00.000Z',
                status: 'uploaded',
              },
            });
      await route.fulfill({
        status: presentation === 'success' ? 201 : 200,
        contentType: 'application/json',
        body,
      });
    });
    await page.locator('input[type="file"]').setInputFiles({
      name: 'كتالوج.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\n'),
    });
    await expect(
      page.locator(
        presentation === 'success' ? '#upload-success-heading' : '#upload-duplicate-heading',
      ),
    ).toBeVisible({ timeout: 30_000 });
    return;
  }

  // The error presentation: the page's own file-level refusal, before any
  // transfer, in the page's own text (contracts/ui-contracts.md §3 row 7).
  await page.locator('input[type="file"]').setInputFiles({
    name: 'كتالوج.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('x'),
  });
  await expect(page.locator('.upload-error__heading')).toBeVisible();
}
