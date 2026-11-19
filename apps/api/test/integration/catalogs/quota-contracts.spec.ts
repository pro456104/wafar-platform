// The quota's contract answers: both exhausted limits named monthly first, the
// pre-sign check ahead of the duplicate, the attempt bound's retryable 429 and
// its 15-minute reset, and the one winner under two simultaneous completions
// (FR-011-FR-018, FR-061; AC-029, AC-030, AC-050; T070, T106).
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  catalogs,
  catalogMonthlyUploads,
  catalogUploadAttempts,
  users,
} from '@wafar/db';
import { monthStart } from '@wafar/shared';
import type { createHarness} from '../../support/harness.ts';
import { call, hasDatabase } from '../../support/harness.ts';
import { abort, complete, merchant, start, upload, writeParts, type StartedUpload } from '../../support/intake.ts';
import { validPdf } from '../../fixtures/intake/fixtures.ts';
import { createIsolatedHarness } from '../../support/isolated.ts';

let harness: ReturnType<typeof createHarness> | null = null;
let isolated: Awaited<ReturnType<typeof createIsolatedHarness>> | null = null;

function code(body: unknown): string | undefined {
  return (body as { error?: { code?: string } } | null)?.error?.code;
}

describe.skipIf(!hasDatabase)('the quota contract', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('quota_contracts');
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

  it('names both exhausted limits monthly first in one 409', async () => {
    const session = await merchant(harness!);
    await harness!.db
      .update(users)
      .set({ monthlyUploadQuotaOverride: 1, activeUploadQuotaOverride: 1 })
      .where(eq(users.id, session.accountId));
    await harness!.db.insert(catalogMonthlyUploads).values({
      userId: session.accountId,
      monthStart: '2026-03-01',
      count: 1,
    });
    await harness!.db.insert(catalogs).values({
      id: 'seed-active',
      userId: session.accountId,
      fileName: 'ملف.pdf',
      byteSize: 1024,
      contentType: 'application/pdf',
      contentHash: 'b'.repeat(64),
      storageKey: 'catalogs/seed-active/kept',
      status: 'uploaded',
      uploadedAt: harness!.clock.now(),
    });

    const response = await start(harness!, session, 'new.pdf', 1024);
    expect(response.status).toBe(409);
    expect(code(response.body)).toBe('UPLOAD_MONTHLY_LIMIT');
    const error = (response.body as {
      error: { retryable: boolean; field: string; details: { code: string; field: string }[] };
    }).error;
    expect(error.retryable).toBe(false);
    expect(error.field).toBe('monthly');
    expect(error.details.map((row) => row.code)).toEqual([
      'UPLOAD_MONTHLY_LIMIT',
      'UPLOAD_ACTIVE_LIMIT',
    ]);
    // The three observables: a refused start writes no byte, so no staged
    // object and no multipart exist (FR-011, AC-029).
    expect(harness!.storage.list('intake/')).toHaveLength(0);
    expect(harness!.storage.multiparts.size).toBe(0);
  });

  it('refuses the attempt bound with a retryable 429, a wait, and Retry-After', async () => {
    const session = await merchant(harness!);
    await harness!.db.insert(catalogUploadAttempts).values({
      userId: session.accountId,
      windowStart: new Date('2026-03-01T10:00:00.000Z'),
      count: 60,
    });
    const response = await start(harness!, session, 'new.pdf', 1024);
    expect(response.status).toBe(429);
    expect(code(response.body)).toBe('UPLOAD_TOO_MANY_ATTEMPTS');
    const error = (response.body as { error: { retryable: boolean; retryAfterSeconds: number } })
      .error;
    expect(error.retryable).toBe(true);
    expect(error.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(error.retryAfterSeconds).toBeLessThanOrEqual(900);
    expect(response.headers.get('retry-after')).toBe(String(error.retryAfterSeconds));
    // The bound is refused before any byte is staged (FR-061, AC-050).
    expect(harness!.storage.list('intake/')).toHaveLength(0);
    expect(harness!.storage.multiparts.size).toBe(0);

    harness!.clock.advance(15 * 60 * 1000);
    const next = await start(harness!, session, 'new.pdf', 1024);
    expect(next.status).toBe(201);
  });

  it('checks the limits before the duplicate, so an exhausted merchant is refused', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const first = await upload(harness!, session, 'first.pdf', bytes);
    expect(first.response.status).toBe(201);
    await harness!.db
      .update(users)
      .set({ monthlyUploadQuotaOverride: 1 })
      .where(eq(users.id, session.accountId));

    const second = await start(harness!, session, 'first.pdf', bytes.byteLength);
    expect(second.status).toBe(409);
    expect(code(second.body)).toBe('UPLOAD_MONTHLY_LIMIT');
    // The refused start staged no byte: the accepted original's kept object is
    // the only catalog object, and no multipart is left open (AC-030).
    expect(harness!.storage.list('intake/')).toHaveLength(0);
    expect(harness!.storage.list('catalogs/')).toHaveLength(1);
    expect(harness!.storage.multiparts.size).toBe(0);
  });

  it('settles two simultaneous completions under a one-upload limit as one accepted', async () => {
    const session = await merchant(harness!);
    await harness!.db
      .update(users)
      .set({ monthlyUploadQuotaOverride: 1 })
      .where(eq(users.id, session.accountId));

    const firstBytes = await validPdf('first document');
    const secondBytes = await validPdf('second document');
    const begin = async (name: string, bytes: Uint8Array) => {
      const started = (await start(harness!, session, name, bytes.byteLength))
        .body as StartedUpload;
      const parts = writeParts(harness!, started, bytes);
      return { started, parts };
    };
    const [first, second] = await Promise.all([
      begin('first.pdf', firstBytes),
      begin('second.pdf', secondBytes),
    ]);
    const responses = await Promise.all([
      call(
        harness!,
        'POST',
        `/api/v1/uploads/${first.started.uploadId}/complete`,
        { parts: first.parts },
        { jar: session.jar, csrf: true },
      ),
      call(
        harness!,
        'POST',
        `/api/v1/uploads/${second.started.uploadId}/complete`,
        { parts: second.parts },
        { jar: session.jar, csrf: true },
      ),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(await harness!.db.select().from(catalogs)).toHaveLength(1);
    const refused = responses.find((response) => response.status === 409);
    expect(code(refused?.body)).toBe('UPLOAD_MONTHLY_LIMIT');
    const monthly = await harness!.db.select().from(catalogMonthlyUploads);
    expect(monthly[0]?.count).toBe(1);
    // The losing completion withdrawn its sanitized copy and its staging: one
    // catalog object survives, and no part or staged object does (AC-031).
    expect(harness!.storage.list('catalogs/')).toHaveLength(1);
    expect(harness!.storage.list('intake/')).toHaveLength(0);
    expect(harness!.storage.multiparts.size).toBe(0);
  });

  it('refuses a second start after an in-flight acceptance lowered the quota', async () => {
    const session = await merchant(harness!);
    await upload(harness!, session, 'first.pdf', await validPdf());
    await harness!.db
      .update(users)
      .set({ activeUploadQuotaOverride: 1 })
      .where(eq(users.id, session.accountId));
    const refused = await start(harness!, session, 'second.pdf', 1024);
    expect(refused.status).toBe(409);
    expect(code(refused.body)).toBe('UPLOAD_ACTIVE_LIMIT');
    // The accepted original keeps its one object; the refused start stages
    // nothing and leaves no multipart (AC-033).
    expect(harness!.storage.list('catalogs/')).toHaveLength(1);
    expect(harness!.storage.list('intake/')).toHaveLength(0);
    expect(harness!.storage.multiparts.size).toBe(0);
  });
});

// --- The attempt bound's counting set (FR-061; AC-050; T069, T070, T244).
// --- Every submission that reaches the counter counts one whatever its
// --- outcome; the refusals decided before it count none, and the bound's own
// --- refusal neither counts nor extends the wait.
describe.skipIf(!hasDatabase)('the attempt bound’s counting set', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('attempt_counting');
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

  async function attemptCount(userId: string): Promise<number> {
    const rows = await harness!.db
      .select({ count: catalogUploadAttempts.count })
      .from(catalogUploadAttempts)
      .where(eq(catalogUploadAttempts.userId, userId));
    return rows[0]?.count ?? 0;
  }

  it('counts the 60th submission and refuses the 61st in the same window', async () => {
    const session = await merchant(harness!);
    let last: StartedUpload | null = null;
    for (let index = 0; index < 60; index += 1) {
      const response = await start(harness!, session, `كتالوج-${index}.pdf`, 1024);
      expect(response.status, `start ${index + 1}`).toBe(201);
      last = response.body as StartedUpload;
    }
    expect(await attemptCount(session.accountId)).toBe(60);
    const refused = await start(harness!, session, 'كتالوج-61.pdf', 1024);
    expect(refused.status).toBe(429);
    expect(code(refused.body)).toBe('UPLOAD_TOO_MANY_ATTEMPTS');
    expect(await attemptCount(session.accountId)).toBe(60);
    // The 60th submission reaches its own outcome: the acceptance does not add
    // a second count (the bound counts submissions, not outcomes).
    const parts = writeParts(harness!, last!, new Uint8Array(1024));
    const settled = await complete(harness!, session, last!.uploadId, parts);
    expect(settled.status).toBe(400);
    expect(code(settled.body)).toBe('UPLOAD_CONTENT_MISMATCH');
    expect(await attemptCount(session.accountId)).toBe(60);
  }, 30_000);

  it('does not count a retry refused for the bound and does not extend the wait', async () => {
    const session = await merchant(harness!);
    await harness!.db.insert(catalogUploadAttempts).values({
      userId: session.accountId,
      windowStart: new Date('2026-03-01T10:00:00.000Z'),
      count: 60,
    });
    const first = await start(harness!, session, 'كتالوج.pdf', 1024);
    expect(first.status).toBe(429);
    const firstWait = (first.body as { error: { retryAfterSeconds: number } }).error
      .retryAfterSeconds;
    harness!.clock.advance(1_000);
    const second = await start(harness!, session, 'كتالوج.pdf', 1024);
    expect(second.status).toBe(429);
    const secondWait = (second.body as { error: { retryAfterSeconds: number } }).error
      .retryAfterSeconds;
    expect(secondWait).toBe(firstWait - 1);
    expect(await attemptCount(session.accountId)).toBe(60);
  });

  it('counts no attempt for a file-level refusal or a pre-sign limit refusal', async () => {
    const session = await merchant(harness!);
    const invalid = await start(harness!, session, 'ملف\u202e.pdf', 1024);
    expect(invalid.status).toBe(400);
    expect(code(invalid.body)).toBe('UPLOAD_INVALID_NAME');
    expect(await attemptCount(session.accountId)).toBe(0);

    await harness!.db.insert(catalogMonthlyUploads).values({
      userId: session.accountId,
      monthStart: monthStart(harness!.clock.now()),
      count: 50,
    });
    const limited = await start(harness!, session, 'كتالوج.pdf', 1024);
    expect(limited.status).toBe(409);
    expect(code(limited.body)).toBe('UPLOAD_MONTHLY_LIMIT');
    expect(await attemptCount(session.accountId)).toBe(0);
  });

  it('counts an acceptance-time limit refusal once, already counted at the start', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const response = await start(harness!, session, 'كتالوج.pdf', bytes.byteLength);
    expect(response.status).toBe(201);
    const started = response.body as StartedUpload;
    expect(await attemptCount(session.accountId)).toBe(1);
    // The limit falls below the usage between the start and the acceptance.
    await harness!.db
      .update(users)
      .set({ monthlyUploadQuotaOverride: 1 })
      .where(eq(users.id, session.accountId));
    await harness!.db.insert(catalogMonthlyUploads).values({
      userId: session.accountId,
      monthStart: monthStart(harness!.clock.now()),
      count: 1,
    });
    const parts = writeParts(harness!, started, bytes);
    const settled = await complete(harness!, session, started.uploadId, parts);
    expect(settled.status).toBe(409);
    expect(code(settled.body)).toBe('UPLOAD_MONTHLY_LIMIT');
    expect(await attemptCount(session.accountId)).toBe(1);
  });

  it('keeps the counted attempt when the completion refuses a file-level cause', async () => {
    const session = await merchant(harness!);
    const response = await start(harness!, session, 'كتالوج.pdf', 1024);
    expect(response.status).toBe(201);
    const started = response.body as StartedUpload;
    // The transferred object is empty: the completion's own file-level refusal.
    const parts = writeParts(harness!, started, new Uint8Array(0));
    const settled = await complete(harness!, session, started.uploadId, parts);
    expect(settled.status).toBe(400);
    expect(code(settled.body)).toBe('UPLOAD_EMPTY');
    expect(await attemptCount(session.accountId)).toBe(1);
  });

  it('counts one attempt each for an acceptance, a duplicate, a safety refusal, and a cancel', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const accepted = await upload(harness!, session, 'الأصل.pdf', bytes);
    expect(accepted.response.status).toBe(201);
    expect(await attemptCount(session.accountId)).toBe(1);

    const duplicate = await upload(harness!, session, 'نسخة.pdf', bytes);
    expect(duplicate.response.status).toBe(200);
    expect(await attemptCount(session.accountId)).toBe(2);

    harness!.scanner.setMode('infected');
    const infected = await upload(harness!, session, 'ثالث.pdf', await validPdf('third document'));
    expect(infected.response.status).toBe(400);
    expect(code(infected.response.body)).toBe('UPLOAD_INFECTED');
    expect(await attemptCount(session.accountId)).toBe(3);
    harness!.scanner.setMode('clean');

    const cancelled = await start(harness!, session, 'رابع.pdf', 1024);
    expect(cancelled.status).toBe(201);
    const aborted = await abort(
      harness!,
      session,
      (cancelled.body as StartedUpload).uploadId,
    );
    expect(aborted.status).toBe(204);
    expect(await attemptCount(session.accountId)).toBe(4);
  });
});
