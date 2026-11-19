// A private database for one integration suite: the committed migrations
// applied to a scratch database, so the suite's own truncations never reach the
// shared fixture and two files never observe each other's rows (T009, T030).
import { createHarness, type Harness } from './harness.ts';
import { createScratchDatabase, migrateScratch, type Scratch } from './scratch.ts';

export interface IsolatedHarness {
  harness: Harness;
  scratch: Scratch;
  close(): Promise<void>;
}

export async function createIsolatedHarness(label: string): Promise<IsolatedHarness> {
  const scratch = await createScratchDatabase(label);
  await migrateScratch(scratch);
  const harness = createHarness({ connectionString: scratch.url });
  return {
    harness,
    scratch,
    async close() {
      await harness.close();
      await scratch.drop();
    },
  };
}
