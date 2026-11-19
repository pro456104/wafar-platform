// The ordered safety verdicts: every cause that refuses a file after the
// transfer is decided here, fail-closed, and answered only once the staged
// bytes are withdrawn and their absence is confirmed (FR-029-FR-034).
import type { IntakeStorage } from '../../../http/deps.ts';

export const safetyCauses = [
  'UPLOAD_CONTENT_MISMATCH',
  'UPLOAD_CORRUPT',
  'UPLOAD_PASSWORD_PROTECTED',
  'UPLOAD_INFECTED',
  'UPLOAD_SCAN_UNAVAILABLE',
  'UPLOAD_EXPANSION_CAP',
  'UPLOAD_SANITIZATION_FAILED',
] as const;

export type SafetyCause = (typeof safetyCauses)[number];

export function isSafetyCause(code: string): code is SafetyCause {
  return safetyCauses.some((cause) => cause === code);
}

export interface StagedBytes {
  originalKey: string;
  uploadId: string;
  sanitizedKey: string | null;
}

export type WithdrawalResult =
  | { kind: 'confirmed' }
  | { kind: 'refused' };

/**
 * Removes every staged byte and confirms the removal: the object's `HEAD`
 * answers null and the multipart's part list is empty. A storage that refuses
 * either leaves the withdrawal unconfirmed, and the route then answers the
 * retryable storage failure rather than reporting the safety cause as decided.
 */
export async function withdraw(
  storage: IntakeStorage,
  staged: StagedBytes,
): Promise<WithdrawalResult> {
  try {
    await storage.abortMultipart({ key: staged.originalKey, uploadId: staged.uploadId });
    await storage.delete({ key: staged.originalKey });
    if (staged.sanitizedKey !== null) await storage.delete({ key: staged.sanitizedKey });
    const head = await storage.head({ key: staged.originalKey });
    const parts = await storage.listParts({
      key: staged.originalKey,
      uploadId: staged.uploadId,
    });
    if (head !== null || parts.parts.length !== 0) return { kind: 'refused' };
    return { kind: 'confirmed' };
  } catch {
    return { kind: 'refused' };
  }
}

export type SafetyAnswer =
  | { kind: 'refused'; code: SafetyCause; cause: SafetyCause }
  | { kind: 'storage-failed'; cause: SafetyCause };

/**
 * The verdict's act: the refusal and its withdrawal are one act, and the
 * safety cause is kept for the record even when the withdrawal cannot be
 * confirmed (contracts/intake-api.md §2.3, §5).
 */
export async function decideSafety(
  storage: IntakeStorage,
  cause: SafetyCause,
  staged: StagedBytes,
): Promise<SafetyAnswer> {
  const result = await withdraw(storage, staged);
  if (result.kind === 'confirmed') return { kind: 'refused', code: cause, cause };
  return { kind: 'storage-failed', cause };
}
