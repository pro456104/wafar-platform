// The duplicate resolution: on a hash conflict the just-written object is
// withdrawn, no catalog is created, no quota is consumed, and the captured
// four-field original is answered (FR-041-FR-045; ADR-169).
import type { DuplicatesRepository } from '../repository/duplicates.ts';
import type { IntakeStorage } from '../../../http/deps.ts';
import type { RetainedDuplicate } from '@wafar/shared';

export type DuplicateResolution =
  | { kind: 'duplicate'; original: RetainedDuplicate }
  | { kind: 'not-duplicate' }
  | { kind: 'storage-failed' };

/**
 * The decision is captured once, at recognition: the row read here is the row
 * the outcome shows, and it is never re-read when the outcome is built.
 */
export async function resolveDuplicate(
  duplicates: DuplicatesRepository,
  storage: IntakeStorage,
  input: { contentHash: string; sanitizedKey: string },
): Promise<DuplicateResolution> {
  const original = await duplicates.findRetainedByHash(input.contentHash);
  if (original === null) return { kind: 'not-duplicate' };
  try {
    await storage.delete({ key: input.sanitizedKey });
    const remaining = await storage.head({ key: input.sanitizedKey });
    if (remaining !== null) return { kind: 'storage-failed' };
  } catch {
    return { kind: 'storage-failed' };
  }
  return { kind: 'duplicate', original };
}
