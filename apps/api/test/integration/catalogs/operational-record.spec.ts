// The operational record: one structured line per submission with the outcome,
// the cause, the correlation identifier, and the time alone — no trader value
// and no file name (FR-062, AC-034, SC-013; T079, T098).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { catalogMonthlyUploads, catalogUploadAttempts, users } from '@wafar/db';
import type { createHarness} from '../../support/harness.ts';
import { call, hasDatabase } from '../../support/harness.ts';
import {
  abort,
  merchant,
  start,
  upload,
  writeParts,
  type StartedUpload,
} from '../../support/intake.ts';
import { validPdf } from '../../fixtures/intake/fixtures.ts';
import { createIsolatedHarness } from '../../support/isolated.ts';

let harness: ReturnType<typeof createHarness> | null = null;
let isolated: Awaited<ReturnType<typeof createIsolatedHarness>> | null = null;

function lines(): Array<Record<string, unknown>> {
  return harness!.recordLines.map((line) => JSON.parse(line) as Record<string, unknown>);
}

describe.skipIf(!hasDatabase)('the operational record', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('record');
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

  it('records an accepted submission with the response’s correlation identifier', async () => {
    const session = await merchant(harness!);
    const { response } = await upload(harness!, session, 'كتالوج.pdf', await validPdf());
    expect(response.status).toBe(201);
    const [line] = lines();
    expect(line).toEqual({
      level: 'info',
      event: 'intake.upload.settled',
      outcome: 'accepted',
      requestId: response.headers.get('x-request-id'),
      timestamp: harness!.clock.now().toISOString(),
    });
    expect(Object.keys(line ?? {}).sort()).toEqual([
      'event',
      'level',
      'outcome',
      'requestId',
      'timestamp',
    ]);
    expect(JSON.stringify(line)).not.toContain('كتالوج');
  });

  it('records a duplicate without a cause', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    await upload(harness!, session, 'first.pdf', bytes);
    const { response } = await upload(harness!, session, 'second.pdf', bytes);
    expect(response.status).toBe(200);
    expect(lines().at(-1)).toMatchObject({
      outcome: 'duplicate',
      event: 'intake.upload.settled',
    });
    expect(lines().at(-1)).not.toHaveProperty('cause');
  });

  it('records a refusal with its cause', async () => {
    const session = await merchant(harness!);
    harness!.scanner.setMode('infected');
    await upload(harness!, session, 'كتالوج.pdf', await validPdf());
    expect(lines().at(-1)).toMatchObject({
      outcome: 'refused',
      cause: 'UPLOAD_INFECTED',
    });
  });

  it('records a failed submission with the storage cause', async () => {
    const session = await merchant(harness!);
    harness!.storage.failReads = true;
    await upload(harness!, session, 'كتالوج.pdf', await validPdf());
    expect(lines().at(-1)).toMatchObject({
      outcome: 'failed',
      cause: 'UPLOAD_STORAGE_UNAVAILABLE',
    });
  });

  it('records a cancellation', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const started = (await start(harness!, session, 'كتالوج.pdf', bytes.byteLength))
      .body as StartedUpload;
    writeParts(harness!, started, bytes);
    await abort(harness!, session, started.uploadId);
    expect(lines().at(-1)).toMatchObject({ outcome: 'cancelled' });
  });

  it('writes exactly one line per submission', async () => {
    const session = await merchant(harness!);
    await upload(harness!, session, 'first.pdf', await validPdf('one'));
    await upload(harness!, session, 'second.pdf', await validPdf('two'));
    expect(lines()).toHaveLength(2);
  });

  it('records the start route’s file-level refusal', async () => {
    const session = await merchant(harness!);
    const response = await start(harness!, session, 'كتالوج.txt', 10);
    expect(response.status).toBe(400);
    expect(lines().at(-1)).toEqual({
      level: 'info',
      event: 'intake.upload.settled',
      outcome: 'refused',
      cause: 'UPLOAD_UNSUPPORTED_FORMAT',
      requestId: response.headers.get('x-request-id'),
      timestamp: harness!.clock.now().toISOString(),
    });
    expect(lines()).toHaveLength(1);
  });

  it('records the start route’s invalid request', async () => {
    const session = await merchant(harness!);
    const response = await call(
      harness!,
      'POST',
      '/api/v1/uploads',
      { fileName: 'كتالوج.pdf', byteSize: -1 },
      { jar: session.jar, csrf: true },
    );
    expect(response.status).toBe(400);
    expect(lines().at(-1)).toMatchObject({
      outcome: 'refused',
      cause: 'UPLOAD_INVALID_REQUEST',
    });
    expect(lines()).toHaveLength(1);
  });

  it('records a monthly-limit refusal at the start', async () => {
    const session = await merchant(harness!);
    await harness!.db
      .update(users)
      .set({ monthlyUploadQuotaOverride: 1 })
      .where(eq(users.id, session.accountId));
    await harness!.db.insert(catalogMonthlyUploads).values({
      userId: session.accountId,
      monthStart: '2026-03-01',
      count: 1,
    });
    const response = await start(harness!, session, 'new.pdf', 1024);
    expect(response.status).toBe(409);
    expect(lines().at(-1)).toMatchObject({
      outcome: 'refused',
      cause: 'UPLOAD_MONTHLY_LIMIT',
    });
  });

  it('records the attempt-bound refusal at the start', async () => {
    const session = await merchant(harness!);
    await harness!.db.insert(catalogUploadAttempts).values({
      userId: session.accountId,
      windowStart: new Date('2026-03-01T10:00:00.000Z'),
      count: 60,
    });
    const response = await start(harness!, session, 'new.pdf', 1024);
    expect(response.status).toBe(429);
    expect(lines().at(-1)).toMatchObject({
      outcome: 'refused',
      cause: 'UPLOAD_TOO_MANY_ATTEMPTS',
    });
  });

  it('records a start-side storage failure', async () => {
    const session = await merchant(harness!);
    harness!.storage.failCreateMultipart = true;
    const response = await start(harness!, session, 'new.pdf', 1024);
    expect(response.status).toBe(503);
    expect(lines().at(-1)).toMatchObject({
      outcome: 'refused',
      cause: 'UPLOAD_STORAGE_UNAVAILABLE',
    });
  });

  it('records the complete route’s incomplete submission', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const started = (await start(harness!, session, 'كتالوج.pdf', bytes.byteLength))
      .body as StartedUpload;
    writeParts(harness!, started, bytes);
    const response = await call(
      harness!,
      'POST',
      `/api/v1/uploads/${started.uploadId}/complete`,
      { parts: [] },
      { jar: session.jar, csrf: true },
    );
    expect(response.status).toBe(409);
    expect(lines().at(-1)).toMatchObject({
      outcome: 'refused',
      cause: 'UPLOAD_INCOMPLETE',
    });
  });
});
