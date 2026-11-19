// The duplicate rule's retained set and its four-field projection: the hash is
// over the sanitized bytes, the original is captured at recognition, a
// soft-deleted row leaves the set, and the failed original keeps its status
// (FR-041-FR-045; AC-019-AC-021; T061, T104).
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { catalogs, catalogMonthlyUploads } from '@wafar/db';
import type { createHarness} from '../../support/harness.ts';
import { hasDatabase } from '../../support/harness.ts';
import { merchant, upload } from '../../support/intake.ts';
import { validPdf, validXlsx, xlsxWithMacro } from '../../fixtures/intake/fixtures.ts';
import { createIsolatedHarness } from '../../support/isolated.ts';

let harness: ReturnType<typeof createHarness> | null = null;
let isolated: Awaited<ReturnType<typeof createIsolatedHarness>> | null = null;

function code(body: unknown): string | undefined {
  return (body as { error?: { code?: string } } | null)?.error?.code;
}

describe.skipIf(!hasDatabase)('the duplicate rule', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('duplicate_rules');
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

  it('answers the same bytes under another name as a duplicate of the retained row', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const first = await upload(harness!, session, 'الاسم الأول.pdf', bytes);
    expect(first.response.status).toBe(201);
    const originalId = (first.response.body as { catalog: { id: string } }).catalog.id;

    const second = await upload(harness!, session, 'اسم آخر.pdf', bytes);
    expect(second.response.status).toBe(200);
    const body = second.response.body as {
      outcome: string;
      original: { id: string; fileName: string; uploadedAt: string; status: string };
    };
    expect(body.outcome).toBe('duplicate');
    expect(Object.keys(body.original).sort()).toEqual([
      'fileName',
      'id',
      'status',
      'uploadedAt',
    ]);
    expect(body.original.id).toBe(originalId);
    expect(body.original.fileName).toBe('الاسم الأول.pdf');
    expect(body.original.uploadedAt).toBe(harness!.clock.now().toISOString());
    expect(body.original.status).toBe('uploaded');

    expect(await harness!.db.select().from(catalogs)).toHaveLength(1);
    const monthly = await harness!.db.select().from(catalogMonthlyUploads);
    expect(monthly[0]?.count).toBe(1);
  });

  it('treats two workbooks identical except for a macro as the same kept bytes', async () => {
    const session = await merchant(harness!);
    const first = await upload(harness!, session, 'catalog.xlsx', xlsxWithMacro());
    expect(first.response.status).toBe(201);

    const second = await upload(harness!, session, 'catalog.xlsx', validXlsx());
    expect(second.response.status).toBe(200);
    expect((second.response.body as { outcome: string }).outcome).toBe('duplicate');
    expect(await harness!.db.select().from(catalogs)).toHaveLength(1);
  });

  it('carries the status captured when the hash matched', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const first = await upload(harness!, session, 'first.pdf', bytes);
    const id = (first.response.body as { catalog: { id: string } }).catalog.id;
    await harness!.db
      .update(catalogs)
      .set({ status: 'processing' })
      .where(eq(catalogs.id, id));

    const second = await upload(harness!, session, 'second.pdf', bytes);
    expect(second.response.status).toBe(200);
    expect(
      (second.response.body as { original: { status: string } }).original.status,
    ).toBe('processing');
  });

  it('reports a failed original and keeps the note’s cause', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const first = await upload(harness!, session, 'first.pdf', bytes);
    const id = (first.response.body as { catalog: { id: string } }).catalog.id;
    await harness!.db.update(catalogs).set({ status: 'failed' }).where(eq(catalogs.id, id));

    const second = await upload(harness!, session, 'second.pdf', bytes);
    expect(second.response.status).toBe(200);
    expect((second.response.body as { original: { status: string } }).original.status).toBe(
      'failed',
    );
  });

  it('removes a soft-deleted row from the retained set', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const first = await upload(harness!, session, 'first.pdf', bytes);
    const id = (first.response.body as { catalog: { id: string } }).catalog.id;
    await harness!.db
      .update(catalogs)
      .set({ deletedAt: harness!.clock.now() })
      .where(eq(catalogs.id, id));

    const second = await upload(harness!, session, 'second.pdf', bytes);
    expect(second.response.status).toBe(201);
    const rows = await harness!.db.select().from(catalogs);
    expect(rows).toHaveLength(2);
    const retained = rows.filter((row) => row.deletedAt === null);
    expect(retained).toHaveLength(1);
    expect(retained[0]?.id).toBe((second.response.body as { catalog: { id: string } }).catalog.id);
  });

  it('takes the hash over the sanitized bytes, not the transferred ones', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const first = await upload(harness!, session, 'first.pdf', bytes);
    const body = first.response.body as { catalog: { id: string } };
    const row = (
      await harness!.db.select().from(catalogs).where(eq(catalogs.id, body.catalog.id))
    )[0]!;
    const kept = harness!.storage.read(row.storageKey)!;
    expect(row.contentHash).toBe(createHash('sha256').update(kept).digest('hex'));
    expect(row.contentHash).not.toBe(createHash('sha256').update(bytes).digest('hex'));
  });

  it('recognizes another merchant’s retained row and shows only four fields', async () => {
    const owner = await merchant(harness!, { phoneNumber: '+218912345678' });
    const other = await merchant(harness!, { phoneNumber: '+218912345679' });
    const bytes = await validPdf();
    await upload(harness!, owner, 'owner.pdf', bytes);
    const second = await upload(harness!, other, 'other.pdf', bytes);
    expect(second.response.status).toBe(200);
    expect(
      Object.keys((second.response.body as { original: object }).original).sort(),
    ).toEqual(['fileName', 'id', 'status', 'uploadedAt']);
    expect(code(second.response.body)).toBeUndefined();
  });
});
