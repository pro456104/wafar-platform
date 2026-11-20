// The intake's accepted path and its record: the merchant's file becomes one
// `uploaded` catalog, the quota is consumed once, no R3 field or queue job
// appears, and the server refuses what a crafted client sends. The cancel, the
// departure, the ended session, the blocked account, the storage failure's
// rollback, the incomplete transfer, and the same-file retry are the same
// route's other answers (FR-001-FR-009, FR-020-FR-028, FR-048-FR-050;
// AC-001-AC-005, AC-050; T031, T102, T109).
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { catalogs, catalogMonthlyUploads, catalogUploadSessions, sessions, users } from '@wafar/db';
import { call, createHarness, hasDatabase, type Harness } from '../../support/harness.ts';
import { createFault } from '../../support/fault.ts';
import {
  abort,
  complete,
  merchant,
  originalKey,
  start,
  upload,
  writeParts,
  type MerchantSession,
  type StartedUpload,
} from '../../support/intake.ts';
import { validPdf } from '../../fixtures/intake/fixtures.ts';
import { createIsolatedHarness } from '../../support/isolated.ts';

let harness: ReturnType<typeof createHarness> | null = null;
let isolated: Awaited<ReturnType<typeof createIsolatedHarness>> | null = null;

function errorCode(body: unknown): string | undefined {
  return (body as { error?: { code?: string } } | null)?.error?.code;
}

async function accepted(harness: Harness, session: MerchantSession, name = 'كتالوج.pdf') {
  const bytes = await validPdf();
  const { started, response } = await upload(harness, session, name, bytes);
  expect(response.status).toBe(201);
  const body = response.body as {
    outcome: string;
    catalog: {
      id: string;
      fileName: string;
      byteSize: number;
      contentType: string;
      status: string;
      uploadedAt: string;
    };
  };
  return { started, response, body, bytes };
}

describe.skipIf(!hasDatabase)('the intake route', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('intake');
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

  it('accepts one PDF, records it at `uploaded`, and consumes the quota once', async () => {
    const session = await merchant(harness!);
    const { body } = await accepted(harness!, session);

    expect(body.outcome).toBe('accepted');
    expect(body.catalog.fileName).toBe('كتالوج.pdf');
    expect(body.catalog.status).toBe('uploaded');
    expect(body.catalog.contentType).toBe('application/pdf');
    expect(body.catalog.byteSize).toBeGreaterThan(0);
    expect(body.catalog.uploadedAt).toBe(harness!.clock.now().toISOString());
    expect(Object.keys(body.catalog).sort()).toEqual([
      'byteSize',
      'contentType',
      'fileName',
      'id',
      'status',
      'uploadedAt',
    ]);

    const row = (
      await harness!.db.select().from(catalogs).where(eq(catalogs.id, body.catalog.id))
    )[0];
    expect(row?.status).toBe('uploaded');
    expect(row?.contentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(row?.storageKey).toBe(`catalogs/${body.catalog.id}/${row?.contentHash}.pdf`);
    expect(row?.uploadedAt.toISOString()).toBe(harness!.clock.now().toISOString());

    const monthly = await harness!.db.select().from(catalogMonthlyUploads);
    expect(monthly).toHaveLength(1);
    expect(monthly[0]?.count).toBe(1);

    const quota = await harness!.app.request('/api/v1/catalogs/quota', {
      headers: { cookie: `wafar.session=${session.token}` },
    });
    expect(await quota.json()).toEqual({
      monthly: { used: 1, limit: 50 },
      active: { used: 1, limit: 300 },
    });
  });

  it('writes no object for the staging key and one kept object', async () => {
    const session = await merchant(harness!);
    const { started, body } = await accepted(harness!, session);
    expect(harness!.storage.read(originalKey(started.uploadId))).toBeNull();
    expect(harness!.storage.list(`catalogs/${body.catalog.id}/`)).toHaveLength(1);
  });

  it('refuses a crafted client at every file-level check, in the fixed order', async () => {
    const session = await merchant(harness!);
    const cases: Array<[string, number, string]> = [
      ['', 1024, 'UPLOAD_INVALID_NAME'],
      ['ملف\u202e.pdf', 1024, 'UPLOAD_INVALID_NAME'],
      ['كتالوج.txt', 1024, 'UPLOAD_UNSUPPORTED_FORMAT'],
      ['كتالوج.', 1024, 'UPLOAD_UNSUPPORTED_FORMAT'],
      ['كتالوج.pdf', 104_857_601, 'UPLOAD_TOO_LARGE'],
      ['كتالوج.pdf', 209_715_200, 'UPLOAD_TOO_LARGE'],
      ['كتالوج.pdf', 0, 'UPLOAD_EMPTY'],
    ];
    for (const [name, size, code] of cases) {
      const response = await start(harness!, session, name, size);
      expect(response.status, `${name}:${size}`).toBeGreaterThanOrEqual(400);
      expect(errorCode(response.body), `${name}:${size}`).toBe(code);
    }
  });

  it('refuses a malformed start body as UPLOAD_INVALID_REQUEST', async () => {
    const session = await merchant(harness!);
    const response = await call(
      harness!,
      'POST',
      '/api/v1/uploads',
      { fileName: 42, byteSize: 'x' },
      { jar: session.jar, csrf: true },
    );
    expect(response.status).toBe(400);
    expect(errorCode(response.body)).toBe('UPLOAD_INVALID_REQUEST');
  });

  it('refuses the start at step 0 without the CSRF pair', async () => {
    const session = await merchant(harness!);
    const response = await harness!.app.request('/api/v1/uploads', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        cookie: `wafar.session=${session.token}`,
      },
      body: JSON.stringify({ fileName: 'a.pdf', byteSize: 1024 }),
    });
    expect(response.status).toBe(403);
    expect(errorCode(await response.json())).toBe('CSRF_FAILED');
  });

  it('cancels an open transfer: the parts and the object are gone, and no catalog or quota exists', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const startedResponse = await start(harness!, session, 'كتالوج.pdf', bytes.byteLength);
    const started = startedResponse.body as StartedUpload;
    writeParts(harness!, started, bytes);

    const cancelled = await abort(harness!, session, started.uploadId);
    expect(cancelled.status).toBe(204);
    expect(harness!.storage.partCount(originalKey(started.uploadId), 'upload-1')).toBe(0);
    expect(harness!.storage.read(originalKey(started.uploadId))).toBeNull();

    const sessionRow = (
      await harness!.db
        .select()
        .from(catalogUploadSessions)
        .where(eq(catalogUploadSessions.id, started.uploadId))
    )[0];
    expect(sessionRow?.state).toBe('aborted');

    const after = await complete(harness!, session, started.uploadId, []);
    expect(after.status).toBe(404);
    expect(await harness!.db.select().from(catalogs)).toHaveLength(0);
    // The three observables of "no bytes, no catalog, and no quota": the
    // monthly counter is written at acceptance alone (FR-011; AC-010).
    expect(await harness!.db.select().from(catalogMonthlyUploads)).toHaveLength(0);
  });

  it('answers a second abort and an abort after completion as one 204 no-op', async () => {
    const session = await merchant(harness!);
    const { started, body } = await accepted(harness!, session);
    expect((await abort(harness!, session, started.uploadId)).status).toBe(204);
    expect((await abort(harness!, session, started.uploadId)).status).toBe(204);
    const rows = await harness!.db.select().from(catalogs);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(body.catalog.id);
  });

  it('answers an unknown or foreign identifier as NOT_FOUND', async () => {
    const owner = await merchant(harness!, { phoneNumber: '+218912345678' });
    const other = await merchant(harness!, { phoneNumber: '+218912345679' });
    const bytes = await validPdf();
    const startedResponse = await start(harness!, owner, 'كتالوج.pdf', bytes.byteLength);
    const started = startedResponse.body as StartedUpload;
    writeParts(harness!, started, bytes);

    const foreign = await complete(harness!, other, started.uploadId, [
      { partNumber: 1, etag: 'x' },
    ]);
    expect(foreign.status).toBe(404);
    expect(errorCode(foreign.body)).toBe('NOT_FOUND');
  });

  it('refuses an expired session before completing, and keeps nothing', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const startedResponse = await start(harness!, session, 'كتالوج.pdf', bytes.byteLength);
    const started = startedResponse.body as StartedUpload;
    const parts = writeParts(harness!, started, bytes);

    await harness!.db
      .update(catalogUploadSessions)
      .set({ urlExpiresAt: new Date(harness!.clock.now().getTime() - 1000) })
      .where(eq(catalogUploadSessions.id, started.uploadId));

    const response = await complete(harness!, session, started.uploadId, parts);
    expect(response.status).toBe(404);
    expect(errorCode(response.body)).toBe('NOT_FOUND');
    expect(await harness!.db.select().from(catalogs)).toHaveLength(0);
  });

  it('refuses a session that ended and an account that was blocked', async () => {
    const ending = await merchant(harness!, { phoneNumber: '+218912345678' });
    const endingBytes = await validPdf();
    const endingStart = await start(harness!, ending, 'a.pdf', endingBytes.byteLength);
    const endingUpload = endingStart.body as StartedUpload;
    const endingParts = writeParts(harness!, endingUpload, endingBytes);
    await harness!.db
      .update(sessions)
      .set({ expiresAt: new Date(harness!.clock.now().getTime() - 1000) })
      .where(eq(sessions.token, ending.token));
    const ended = await complete(harness!, ending, endingUpload.uploadId, endingParts);
    expect(ended.status).toBe(401);
    expect(errorCode(ended.body)).toBe('SESSION_ENDED');

    const blocked = await merchant(harness!, { phoneNumber: '+218912345679' });
    const blockedBytes = await validPdf();
    const blockedStart = await start(harness!, blocked, 'b.pdf', blockedBytes.byteLength);
    const blockedUpload = blockedStart.body as StartedUpload;
    const blockedParts = writeParts(harness!, blockedUpload, blockedBytes);
    await harness!.db
      .update(users)
      .set({ status: 'blocked' })
      .where(eq(users.id, blocked.accountId));
    const refused = await complete(harness!, blocked, blockedUpload.uploadId, blockedParts);
    expect(refused.status).toBe(401);
    expect(errorCode(refused.body)).toBe('ACCOUNT_BLOCKED');
    expect(await harness!.db.select().from(catalogs)).toHaveLength(0);
  });

  it('carries a completed intake through a later session end', async () => {
    const session = await merchant(harness!);
    const { body } = await accepted(harness!, session);
    await harness!.db
      .update(sessions)
      .set({ expiresAt: new Date(harness!.clock.now().getTime() - 1000) })
      .where(eq(sessions.token, session.token));
    const quota = await harness!.app.request('/api/v1/catalogs/quota', {
      headers: { cookie: `wafar.session=${session.token}` },
    });
    expect(quota.status).toBe(401);
    const rows = await harness!.db.select().from(catalogs);
    expect(rows.map((row) => row.id)).toEqual([body.catalog.id]);
  });

  it('refuses an incomplete transfer as UPLOAD_INCOMPLETE and keeps nothing', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const startedResponse = await start(harness!, session, 'كتالوج.pdf', bytes.byteLength);
    const started = startedResponse.body as StartedUpload;

    const missing = await complete(harness!, session, started.uploadId, [
      { partNumber: 1, etag: '"missing"' },
    ]);
    expect(missing.status).toBe(409);
    expect(errorCode(missing.body)).toBe('UPLOAD_INCOMPLETE');
    expect(await harness!.db.select().from(catalogs)).toHaveLength(0);
  });

  it('refuses a declared size the kept object does not have', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const startedResponse = await start(harness!, session, 'كتالوج.pdf', bytes.byteLength + 10);
    const started = startedResponse.body as StartedUpload;
    const parts = writeParts(harness!, started, bytes);
    const response = await complete(harness!, session, started.uploadId, parts);
    expect(response.status).toBe(409);
    expect(errorCode(response.body)).toBe('UPLOAD_INCOMPLETE');
  });

  it('rolls the record back when the staging withdrawal is refused', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const startedResponse = await start(harness!, session, 'كتالوج.pdf', bytes.byteLength);
    const started = startedResponse.body as StartedUpload;
    const parts = writeParts(harness!, started, bytes);
    harness!.storage.failDeletes = true;

    const response = await complete(harness!, session, started.uploadId, parts);
    expect(response.status).toBe(503);
    expect(errorCode(response.body)).toBe('UPLOAD_STORAGE_UNAVAILABLE');
    expect(await harness!.db.select().from(catalogs)).toHaveLength(0);
    const monthly = await harness!.db.select().from(catalogMonthlyUploads);
    expect(monthly.every((row) => row.count === 0)).toBe(true);
  });

  it('accepts the same file after a refusal: the retry is a new upload', async () => {
    const session = await merchant(harness!);
    harness!.scanner.setMode('infected');
    const bytes = await validPdf();
    const first = await upload(harness!, session, 'كتالوج.pdf', bytes);
    expect(first.response.status).toBe(400);
    expect(errorCode(first.response.body)).toBe('UPLOAD_INFECTED');
    expect(await harness!.db.select().from(catalogs)).toHaveLength(0);

    harness!.scanner.setMode('clean');
    const second = await upload(harness!, session, 'كتالوج.pdf', bytes);
    expect(second.response.status).toBe(201);
    expect(await harness!.db.select().from(catalogs)).toHaveLength(1);
  });

  it('accepts a body at 16,384 bytes and refuses 16,385 as PAYLOAD_TOO_LARGE', async () => {
    const session = await merchant(harness!);
    const encode = (length: number): string => {
      const empty = JSON.stringify({
        fileName: 'كتالوج.pdf',
        byteSize: 1024,
        note: '',
      });
      const pad = length - Buffer.byteLength(empty, 'utf8');
      return JSON.stringify({
        fileName: 'كتالوج.pdf',
        byteSize: 1024,
        note: 'x'.repeat(pad),
      });
    };

    const atBound = encode(16_384);
    expect(Buffer.byteLength(atBound, 'utf8')).toBe(16_384);
    const accepted = await call(
      harness!,
      'POST',
      '/api/v1/uploads',
      JSON.parse(atBound) as unknown,
      { jar: session.jar, csrf: true },
    );
    expect(accepted.status).toBe(201);

    const overBound = encode(16_385);
    expect(Buffer.byteLength(overBound, 'utf8')).toBe(16_385);
    const refused = await call(
      harness!,
      'POST',
      '/api/v1/uploads',
      JSON.parse(overBound) as unknown,
      { jar: session.jar, csrf: true },
    );
    expect(refused.status).toBe(413);
    expect(errorCode(refused.body)).toBe('PAYLOAD_TOO_LARGE');
  });

  it('refuses malformed JSON within the limit as UPLOAD_INVALID_REQUEST', async () => {
    const session = await merchant(harness!);
    const response = await harness!.app.request(
      '/api/v1/uploads',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3000',
          cookie: `wafar.session=${session.token}; wafar.csrf=${session.jar['wafar.csrf'] ?? ''}`,
          'x-wafar-csrf': session.jar['wafar.csrf'] ?? '',
        },
        body: '{"fileName": "كتالوج.pdf",',
      },
      { incoming: { socket: { remoteAddress: harness!.peer } } },
    );
    expect(response.status).toBe(400);
    expect(errorCode(await response.json())).toBe('UPLOAD_INVALID_REQUEST');
  });

  it('answers INTERNAL_ERROR only after every staged byte is withdrawn', async () => {
    const fault = createFault({ table: 'catalogs', verb: 'insert' });
    const faulted = createHarness({
      connectionString: isolated!.scratch.url,
      fault,
    });
    try {
      await faulted.reset();
      const session = await merchant(faulted);
      const bytes = await validPdf();
      const startedResponse = await start(faulted, session, 'كتالوج.pdf', bytes.byteLength);
      const started = startedResponse.body as StartedUpload;
      const parts = writeParts(faulted, started, bytes);

      const response = await complete(faulted, session, started.uploadId, parts);
      expect(response.status).toBe(500);
      expect(errorCode(response.body)).toBe('INTERNAL_ERROR');

      // The withdrawal is the answer's precondition: no object, no part, no row.
      expect(faulted.storage.objects.size).toBe(0);
      expect(faulted.storage.multiparts.size).toBe(0);
      expect(await faulted.db.select().from(catalogs)).toHaveLength(0);
      expect(await faulted.db.select().from(catalogMonthlyUploads)).toHaveLength(0);
      const sessionRow = (
        await faulted.db
          .select()
          .from(catalogUploadSessions)
          .where(eq(catalogUploadSessions.id, started.uploadId))
      )[0];
      expect(sessionRow?.state).toBe('failed');
    } finally {
      await faulted.close();
    }
  });

  it('answers the abort gate: 204 for a completing or failed session, 404 otherwise', async () => {
    const owner = await merchant(harness!);
    const other = await merchant(harness!, { phoneNumber: '+218912345679' });
    const bytes = await validPdf();
    const startedResponse = await start(harness!, owner, 'كتالوج.pdf', bytes.byteLength);
    const started = startedResponse.body as StartedUpload;

    for (const state of ['completing', 'failed'] as const) {
      await harness!.db
        .update(catalogUploadSessions)
        .set({ state })
        .where(eq(catalogUploadSessions.id, started.uploadId));
      const answer = await abort(harness!, owner, started.uploadId);
      expect(answer.status, state).toBe(204);
    }

    expect((await abort(harness!, other, started.uploadId)).status).toBe(404);
    expect((await abort(harness!, owner, 'no-such-upload')).status).toBe(404);
  });
});
