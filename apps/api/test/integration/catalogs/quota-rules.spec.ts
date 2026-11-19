// The quota's own rules: the two defaults, the administrator override inside its
// cap, the Tripoli month from the injected clock, the retained set's exclusion
// of a soft-deleted row, and a lowered quota read without clamping
// (FR-010-FR-019; AC-027-AC-030; T069, T110).
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { catalogs, catalogMonthlyUploads, users } from '@wafar/db';
import type { createHarness} from '../../support/harness.ts';
import { hasDatabase } from '../../support/harness.ts';
import { merchant, start, upload } from '../../support/intake.ts';
import { validPdf } from '../../fixtures/intake/fixtures.ts';
import { createIsolatedHarness } from '../../support/isolated.ts';

let harness: ReturnType<typeof createHarness> | null = null;
let isolated: Awaited<ReturnType<typeof createIsolatedHarness>> | null = null;

function code(body: unknown): string | undefined {
  return (body as { error?: { code?: string } } | null)?.error?.code;
}

async function quota(session: { token: string }): Promise<unknown> {
  const response = await harness!.app.request('/api/v1/catalogs/quota', {
    headers: { cookie: `wafar.session=${session.token}` },
  });
  return response.json();
}

async function seedCatalog(
  userId: string,
  index: number,
  options: { deleted?: boolean; status?: string } = {},
): Promise<string> {
  const id = `seed-${index}`;
  const hash = `${index}`.padStart(64, 'a').slice(-64);
  await harness!.db.insert(catalogs).values({
    id,
    userId,
    fileName: `ملف ${index}.pdf`,
    byteSize: 1024,
    contentType: 'application/pdf',
    contentHash: hash,
    storageKey: `catalogs/${id}/kept`,
    status: options.status ?? 'uploaded',
    uploadedAt: harness!.clock.now(),
    ...(options.deleted === true ? { deletedAt: harness!.clock.now() } : {}),
  });
  return id;
}

describe.skipIf(!hasDatabase)('the quota rules', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('quota_rules');
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

  it('reads the two defaults for a fresh merchant', async () => {
    const session = await merchant(harness!);
    expect(await quota(session)).toEqual({
      monthly: { used: 0, limit: 50 },
      active: { used: 0, limit: 300 },
    });
  });

  it('applies an administrator override and refuses each exhausted limit', async () => {
    const session = await merchant(harness!);
    await harness!.db
      .update(users)
      .set({ monthlyUploadQuotaOverride: 1, activeUploadQuotaOverride: 1 })
      .where(eq(users.id, session.accountId));
    expect(await quota(session)).toEqual({
      monthly: { used: 0, limit: 1 },
      active: { used: 0, limit: 1 },
    });

    const first = await upload(harness!, session, 'first.pdf', await validPdf());
    expect(first.response.status).toBe(201);
    expect(await quota(session)).toEqual({
      monthly: { used: 1, limit: 1 },
      active: { used: 1, limit: 1 },
    });

    const refused = await start(harness!, session, 'second.pdf', 1024);
    expect(refused.status).toBe(409);
    expect(code(refused.body)).toBe('UPLOAD_MONTHLY_LIMIT');
    expect((refused.body as { error: { details?: unknown[] } }).error.details).toHaveLength(2);
  });

  it('counts the month in Africa/Tripoli, so a March instant is April’s first', async () => {
    harness!.clock.set(new Date('2026-03-31T22:30:00.000Z'));
    const session = await merchant(harness!);
    await harness!.db.insert(catalogMonthlyUploads).values({
      userId: session.accountId,
      monthStart: '2026-03-01',
      count: 50,
    });

    const { response } = await upload(harness!, session, 'april.pdf', await validPdf());
    expect(response.status).toBe(201);
    const rows = await harness!.db.select().from(catalogMonthlyUploads);
    const april = rows.find((row) => row.monthStart === '2026-04-01');
    const march = rows.find((row) => row.monthStart === '2026-03-01');
    expect(april?.count).toBe(1);
    expect(march?.count).toBe(50);

    expect(await quota(session)).toEqual({
      monthly: { used: 1, limit: 50 },
      active: { used: 1, limit: 300 },
    });
    const catalog = (await harness!.db.select().from(catalogs))[0]!;
    expect(catalog.uploadedAt.toISOString()).toBe('2026-03-31T22:30:00.000Z');
  });

  it('excludes a soft-deleted row from the active count and keeps the monthly count', async () => {
    const session = await merchant(harness!);
    await seedCatalog(session.accountId, 1, { deleted: true });
    await seedCatalog(session.accountId, 2);
    await harness!.db.insert(catalogMonthlyUploads).values({
      userId: session.accountId,
      monthStart: '2026-03-01',
      count: 2,
    });
    expect(await quota(session)).toEqual({
      monthly: { used: 2, limit: 50 },
      active: { used: 1, limit: 300 },
    });
  });

  it('reads a lowered quota without clamping used to the new limit', async () => {
    const session = await merchant(harness!);
    for (let index = 0; index < 5; index += 1) {
      await seedCatalog(session.accountId, index);
    }
    await harness!.db
      .update(users)
      .set({ activeUploadQuotaOverride: 1 })
      .where(eq(users.id, session.accountId));
    expect(await quota(session)).toEqual({
      monthly: { used: 0, limit: 50 },
      active: { used: 5, limit: 1 },
    });

    const refused = await start(harness!, session, 'another.pdf', 1024);
    expect(refused.status).toBe(409);
    expect(code(refused.body)).toBe('UPLOAD_ACTIVE_LIMIT');
    expect((refused.body as { error: { retryable: boolean } }).error.retryable).toBe(false);
  });

  it('counts only the retained rows at each of the four statuses', async () => {
    const session = await merchant(harness!);
    for (const [index, status] of ['uploaded', 'processing', 'completed', 'failed'].entries()) {
      await seedCatalog(session.accountId, index, { status });
    }
    expect(await quota(session)).toMatchObject({ active: { used: 4, limit: 300 } });
  });
});
