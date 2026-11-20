// The fail-closed screen: the probe's four verdicts, the scan's infected and
// unavailable answers, the withdrawal that confirms nothing survives, the
// storage failure that answers the retryable code instead of a safety cause, and
// the four-field health body under two dependency failures (FR-029-FR-034,
// FR-040, FR-062; AC-006, AC-016, AC-017, AC-018, AC-035; T054, T059, T060).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { catalogs, catalogMonthlyUploads } from '@wafar/db';
import type { createHarness } from '../../support/harness.ts';
import { hasDatabase } from '../../support/harness.ts';
import { originalKey, upload, type StartedUpload } from '../../support/intake.ts';
import { merchant } from '../../support/intake.ts';
import {
  corruptPdf,
  declaredBombXlsx,
  encryptedPdf,
  expandingPdf,
  expandingXlsx,
  validDocx,
  validPdf,
  validXlsx,
} from '../../fixtures/intake/fixtures.ts';
import { createIsolatedHarness } from '../../support/isolated.ts';
import { safetyCauses } from '../../../src/modules/catalogs/service/safety.ts';
import { measureDecoded, decodedCapBytes } from '../../../src/modules/catalogs/inspection/cap.ts';
import { inspectFormat } from '../../../src/modules/catalogs/inspection/format.ts';
import { sanitize } from '../../../src/modules/catalogs/inspection/sanitize.ts';
import { createClamdScanner } from '../../../src/modules/catalogs/scanner/clamd.ts';
import { createServer, type Socket } from 'node:net';

let harness: ReturnType<typeof createHarness> | null = null;
let isolated: Awaited<ReturnType<typeof createIsolatedHarness>> | null = null;

function code(body: unknown): string | undefined {
  return (body as { error?: { code?: string } } | null)?.error?.code;
}

function retryable(body: unknown): boolean | undefined {
  return (body as { error?: { retryable?: boolean } } | null)?.error?.retryable;
}

/**
 * The three observables spec.md defines once for "no bytes, no catalog, and no
 * quota": the object list and the upload's unfinished parts are empty, the
 * merchant's catalog count is unchanged, and the monthly counter is unchanged
 * (FR-011, FR-029, FR-030; AC-006, AC-015, AC-018, AC-020).
 */
async function expectNothingKept(
  active: NonNullable<typeof harness>,
  uploadId: string,
): Promise<void> {
  expect(active.storage.read(originalKey(uploadId))).toBeNull();
  expect(active.storage.list('intake/')).toHaveLength(0);
  expect(active.storage.list('catalogs/')).toHaveLength(0);
  expect(active.storage.multiparts.size).toBe(0);
  expect(await active.db.select().from(catalogs)).toHaveLength(0);
  expect(await active.db.select().from(catalogMonthlyUploads)).toHaveLength(0);
}

describe.skipIf(!hasDatabase)('the safety pipeline', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('safety');
    harness = isolated.harness;
  });
  beforeEach(async () => {
    if (harness !== null) await harness.reset();
  });
  afterAll(async () => {
    if (isolated !== null) await isolated.close();
    isolated = null;
    harness = null;
  });

  it('names the seven ordered causes, the expansion cap among them', () => {
    expect(safetyCauses).toEqual([
      'UPLOAD_CONTENT_MISMATCH',
      'UPLOAD_CORRUPT',
      'UPLOAD_PASSWORD_PROTECTED',
      'UPLOAD_INFECTED',
      'UPLOAD_SCAN_UNAVAILABLE',
      'UPLOAD_EXPANSION_CAP',
      'UPLOAD_SANITIZATION_FAILED',
    ]);
  });

  it('refuses an infected file as UPLOAD_INFECTED and keeps nothing', async () => {
    const session = await merchant(harness!);
    harness!.scanner.setMode('infected');
    const { started, response } = await upload(
      harness!,
      session,
      'كتالوج.pdf',
      await validPdf(),
    );
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_INFECTED');
    const startedUpload = started as StartedUpload;
    expect(harness!.storage.read(originalKey(startedUpload.uploadId))).toBeNull();
    expect(harness!.storage.list('catalogs/')).toHaveLength(0);
    expect(await harness!.db.select().from(catalogs)).toHaveLength(0);
    // The refusal consumes no quota: the monthly counter is written at
    // acceptance alone (FR-041; AC-006, AC-018; T123).
    expect(await harness!.db.select().from(catalogMonthlyUploads)).toHaveLength(0);
  });

  it('answers a scanner that cannot answer with the retryable scan failure and keeps nothing', async () => {
    const session = await merchant(harness!);
    harness!.scanner.setMode('unavailable');
    const { started, response } = await upload(harness!, session, 'كتالوج.pdf', await validPdf());
    expect(response.status).toBe(502);
    expect(code(response.body)).toBe('UPLOAD_SCAN_UNAVAILABLE');
    expect(retryable(response.body)).toBe(true);
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });

  it('refuses content that does not match the declared format and keeps nothing', async () => {
    const session = await merchant(harness!);
    const { started, response } = await upload(harness!, session, 'sheet.xlsx', await validPdf());
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_CONTENT_MISMATCH');
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });

  it('refuses a Word document named as an Excel file (SC-002)', async () => {
    const session = await merchant(harness!);
    const { started, response } = await upload(harness!, session, 'word.xlsx', validDocx());
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_CONTENT_MISMATCH');
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });

  it('refuses an Excel workbook named as a Word file (SC-002)', async () => {
    const session = await merchant(harness!);
    const { started, response } = await upload(harness!, session, 'sheet.docx', validXlsx());
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_CONTENT_MISMATCH');
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });

  it('answers the mismatch before the infection when a file is both', async () => {
    // The probe runs before the scan, so a file that is both a content mismatch
    // and infected is refused for the mismatch, the earlier cause (FR-029's
    // stacked-cause order; AC-016; T054).
    const session = await merchant(harness!);
    harness!.scanner.setMode('infected');
    const { started, response } = await upload(harness!, session, 'sheet.xlsx', await validPdf());
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_CONTENT_MISMATCH');
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });

  it('refuses an expanding archive while it expands, not after it is allocated', () => {
    // The expansion fixture's member inflates far past a small cap; the read
    // stops where it crosses rather than allocating the whole decode (FR-031;
    // AC-016; T009, T054).
    const verdict = measureDecoded({
      bytes: expandingXlsx(2 * 1024 * 1024),
      format: 'xlsx',
      budgetMs: 5_000,
      cap: 64 * 1024,
    });
    expect(verdict.kind).toBe('over');
  });

  it('refuses a PDF whose compressed streams expand past the cap', () => {
    const verdict = measureDecoded({
      bytes: expandingPdf(2 * 1024 * 1024),
      format: 'pdf',
      budgetMs: 5_000,
      cap: 64 * 1024,
    });
    expect(verdict.kind).toBe('over');
  });

  it('refuses a corrupt PDF and keeps nothing', async () => {
    const session = await merchant(harness!);
    const { started, response } = await upload(
      harness!,
      session,
      'broken.pdf',
      corruptPdf(),
    );
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_CORRUPT');
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });

  it('refuses a password-protected PDF, names the cause, and keeps nothing', async () => {
    const session = await merchant(harness!);
    const { started, response } = await upload(
      harness!,
      session,
      'locked.pdf',
      encryptedPdf(),
    );
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_PASSWORD_PROTECTED');
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });

  it('does not report a safety cause when the withdrawal cannot be confirmed', async () => {
    const session = await merchant(harness!);
    harness!.scanner.setMode('infected');
    harness!.storage.failDeletes = true;
    const { response } = await upload(harness!, session, 'كتالوج.pdf', await validPdf());
    expect(response.status).toBe(503);
    expect(code(response.body)).toBe('UPLOAD_STORAGE_UNAVAILABLE');
  });

  it('answers a failed read as the retryable storage failure', async () => {
    const session = await merchant(harness!);
    harness!.storage.failReads = true;
    const { response } = await upload(harness!, session, 'كتالوج.pdf', await validPdf());
    expect(response.status).toBe(503);
    expect(code(response.body)).toBe('UPLOAD_STORAGE_UNAVAILABLE');
  });

  it('reports the four dependencies in the health body and degrades on each', async () => {
    const healthy = await harness!.app.request('/health');
    expect(healthy.status).toBe(200);
    expect(await healthy.json()).toEqual({
      status: 'ok',
      database: 'ok',
      storage: 'ok',
      scanner: 'ok',
    });

    harness!.storage.failBucket = true;
    const storageDown = await harness!.app.request('/health');
    expect(storageDown.status).toBe(503);
    expect(await storageDown.json()).toEqual({
      status: 'degraded',
      database: 'ok',
      storage: 'error',
      scanner: 'ok',
    });
    harness!.storage.failBucket = false;

    harness!.scanner.setMode('unavailable');
    const scannerDown = await harness!.app.request('/health');
    expect(scannerDown.status).toBe(503);
    expect(await scannerDown.json()).toEqual({
      status: 'degraded',
      database: 'ok',
      storage: 'ok',
      scanner: 'error',
    });
  });
});

// --- The five timed budgets and the stacked-cause order (FR-029; plan: Budget
// --- check; AC-016, AC-020; T054, T243). Each budget is stalled past its bound
// --- and answers its own stage's cause; the stacked cases prove the order.
describe.skipIf(!hasDatabase)('the stage budgets and the stacked causes', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('safety_budgets');
    harness = isolated.harness;
  });
  beforeEach(async () => {
    if (harness !== null) await harness.reset();
  });
  afterAll(async () => {
    if (isolated !== null) await isolated.close();
    isolated = null;
    harness = null;
  });

  it('answers the content probe’s expired budget as corrupt', async () => {
    const verdict = await inspectFormat(validXlsx(), 'xlsx', -1);
    expect(verdict.kind).toBe('corrupt');
  });

  it('answers the cap’s first read’s expired budget as corrupt, never as the cap', async () => {
    const verdict = measureDecoded({ bytes: validXlsx(), format: 'xlsx', budgetMs: -1 });
    expect(verdict.kind).toBe('timeout');
  });

  it('answers the scan’s expired budget as unavailable, over the real protocol', async () => {
    // A clamd that accepts the connection and never answers: the client's own
    // budget, not the server, ends the scan (contracts/intake-api.md §6.2).
    const sockets = new Set<Socket>();
    const server = createServer((socket) => {
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    const port = typeof address === 'object' && address !== null ? address.port : 0;
    try {
      const scanner = createClamdScanner({ host: '127.0.0.1', port });
      const verdict = await scanner.scan({
        stream: new Blob([Uint8Array.of(0x41)]).stream(),
        budgetMs: 50,
      });
      expect(verdict.verdict).toBe('unavailable');
    } finally {
      // The silent server's sockets are half-open after the client's budget
      // destroy: close them so the server's own close can settle.
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('answers the scan-unavailable refusal through the intake with nothing kept', async () => {
    const session = await merchant(harness!);
    harness!.scanner.setMode('over-budget');
    const { started, response } = await upload(harness!, session, 'كتالوج.pdf', await validPdf());
    expect(response.status).toBe(502);
    expect(code(response.body)).toBe('UPLOAD_SCAN_UNAVAILABLE');
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });

  it('answers the sanitizer’s expired budget as sanitization failed', async () => {
    const verdict = await sanitize({
      bytes: validXlsx(),
      format: 'xlsx',
      budgetMs: -1,
      reopenBudgetMs: 5_000,
      originalDecodedBytes: 0,
    });
    expect(verdict.kind).toBe('failed');
  });

  it('answers the reopen’s expired budget as sanitization failed', async () => {
    const verdict = await sanitize({
      bytes: validXlsx(),
      format: 'xlsx',
      budgetMs: 10_000,
      reopenBudgetMs: -1,
      originalDecodedBytes: 0,
    });
    expect(verdict.kind).toBe('failed');
    if (verdict.kind === 'failed') expect(verdict.reason).toBe('reopen-failed');
  });

  it('answers a sanitized decode that would cross the cap as the expansion cap', async () => {
    // The second measurement spends the sanitizer's budget and counts the bytes
    // it keeps: a kept decode past the cap is the expansion-cap cause (FR-029).
    const verdict = await sanitize({
      bytes: await validPdf(),
      format: 'pdf',
      budgetMs: 10_000,
      reopenBudgetMs: 5_000,
      originalDecodedBytes: decodedCapBytes + 1,
    });
    expect(verdict.kind).toBe('failed');
    if (verdict.kind === 'failed') expect(verdict.reason).toBe('over-cap');
  });

  it('refuses a declared bomb through the intake as the expansion cap, nothing kept', async () => {
    const session = await merchant(harness!);
    const { started, response } = await upload(harness!, session, 'كتالوج.xlsx', declaredBombXlsx());
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_EXPANSION_CAP');
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });

  it('refuses a file both infected and past the cap as infected: the scan precedes the cap', async () => {
    const session = await merchant(harness!);
    harness!.scanner.setMode('infected');
    const { started, response } = await upload(harness!, session, 'كتالوج.xlsx', declaredBombXlsx());
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_INFECTED');
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });

  it('refuses a file both past the cap and carrying executable content for the cap', async () => {
    const session = await merchant(harness!);
    const { started, response } = await upload(
      harness!,
      session,
      'كتالوج.xlsx',
      declaredBombXlsx(true),
    );
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_EXPANSION_CAP');
    await expectNothingKept(harness!, (started as StartedUpload).uploadId);
  });
});
