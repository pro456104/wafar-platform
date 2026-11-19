// The duplicate rule's concurrent and boundary answers: two simultaneous
// uploads of one content produce one accepted and one duplicate, and the
// duplicate never consumes a second monthly count or active slot
// (FR-013, FR-016, FR-041-FR-045; AC-019, AC-020; T062).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { catalogs, catalogMonthlyUploads } from '@wafar/db';
import type { createHarness} from '../../support/harness.ts';
import { hasDatabase } from '../../support/harness.ts';
import { merchant, start, writeParts, type StartedUpload } from '../../support/intake.ts';
import { validPdf } from '../../fixtures/intake/fixtures.ts';
import { call } from '../../support/harness.ts';
import { createIsolatedHarness } from '../../support/isolated.ts';

let harness: ReturnType<typeof createHarness> | null = null;
let isolated: Awaited<ReturnType<typeof createIsolatedHarness>> | null = null;

describe.skipIf(!hasDatabase)('the duplicate contract', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('duplicate_contracts');
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

  it('settles two simultaneous uploads of one content as one accepted and one duplicate', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();

    const begin = async () => {
      const started = (await start(harness!, session, 'same.pdf', bytes.byteLength))
        .body as StartedUpload;
      const parts = writeParts(harness!, started, bytes);
      return { started, parts };
    };

    const [first, second] = await Promise.all([begin(), begin()]);
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

    expect(responses.map((response) => response.status).sort()).toEqual([200, 201]);
    const outcomes = responses.map(
      (response) => (response.body as { outcome: string }).outcome,
    );
    expect(outcomes.sort()).toEqual(['accepted', 'duplicate']);
    expect(await harness!.db.select().from(catalogs)).toHaveLength(1);

    const monthly = await harness!.db.select().from(catalogMonthlyUploads);
    expect(monthly).toHaveLength(1);
    expect(monthly[0]?.count).toBe(1);
    // The duplicate's kept copy was withdrawn: one catalog object survives, and
    // no staged byte or unfinished part does (FR-041, AC-021).
    expect(harness!.storage.list('catalogs/')).toHaveLength(1);
    expect(harness!.storage.list('intake/')).toHaveLength(0);
    expect(harness!.storage.multiparts.size).toBe(0);
  });

  it('accepts a duplicate once the retained original is gone', async () => {
    const session = await merchant(harness!);
    const bytes = await validPdf();
    const first = await start(harness!, session, 'first.pdf', bytes.byteLength);
    const firstUpload = first.body as StartedUpload;
    const firstParts = writeParts(harness!, firstUpload, bytes);
    await call(
      harness!,
      'POST',
      `/api/v1/uploads/${firstUpload.uploadId}/complete`,
      { parts: firstParts },
      { jar: session.jar, csrf: true },
    );

    // The deletion is simulated: R2 implements no delete route, so the row is
    // marked in the database and the rule's retained predicate is what changes.
    await harness!.db.update(catalogs).set({ deletedAt: harness!.clock.now() });

    const second = await start(harness!, session, 'second.pdf', bytes.byteLength);
    const secondUpload = second.body as StartedUpload;
    const secondParts = writeParts(harness!, secondUpload, bytes);
    const response = await call(
      harness!,
      'POST',
      `/api/v1/uploads/${secondUpload.uploadId}/complete`,
      { parts: secondParts },
      { jar: session.jar, csrf: true },
    );
    expect(response.status).toBe(201);
    expect((response.body as { outcome: string }).outcome).toBe('accepted');
    // Both retained originals keep their own object, and the two transfers left
    // no staged byte and no open multipart (FR-043, AC-023).
    expect(harness!.storage.list('catalogs/')).toHaveLength(2);
    expect(harness!.storage.list('intake/')).toHaveLength(0);
    expect(harness!.storage.multiparts.size).toBe(0);
  });
});
