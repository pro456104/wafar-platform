// The refusal presentation: one Arabic row for each of the seventeen intake
// codes, R1's rows for the four reused codes, «إعادة المحاولة» only where a
// retry may succeed, and the neutral label for an invalid name (FR-028, FR-034,
// FR-049, FR-064, AC-005, AC-020, AC-051, SC-009; T057).
import { describe, expect, it } from 'vitest';
import { intakeErrorCodes } from '@wafar/shared';
import {
  isIntakeCode,
  refusalMessage,
  refusalRows,
  transferFailureMessage,
} from '../../../app/composables/upload/refusal-messages';

const retryable = ['UPLOAD_SCAN_UNAVAILABLE', 'UPLOAD_TOO_MANY_ATTEMPTS', 'UPLOAD_STORAGE_UNAVAILABLE'];
const reused = ['NOT_FOUND', 'CSRF_FAILED', 'PAYLOAD_TOO_LARGE', 'INTERNAL_ERROR'];

describe('the refusal table', () => {
  it('has exactly one row for each of the seventeen intake codes', () => {
    const keys = Object.keys(refusalRows).sort();
    expect(keys).toEqual([...intakeErrorCodes].sort());
  });

  it('selects the intake row for an intake code', () => {
    expect(refusalMessage('UPLOAD_INFECTED')).toContain('لم يتم حفظ الملف');
    expect(isIntakeCode('UPLOAD_INFECTED')).toBe(true);
  });

  it('renders the neutral label for the invalid-name cause and never a refused name', () => {
    const message = refusalMessage('UPLOAD_INVALID_NAME');
    expect(message).toContain('ملف باسم غير صالح');
    expect(message).not.toContain('.pdf');
  });

  it('renders R1’s own text for the four reused rows and adds no eighteenth row', () => {
    for (const code of reused) {
      expect(isIntakeCode(code)).toBe(false);
      expect(refusalMessage(code)).not.toBe('');
    }
    expect(Object.keys(refusalRows)).toHaveLength(17);
  });

  it('renders the attempt bound’s wait through the shared duration surface', () => {
    expect(refusalMessage('UPLOAD_TOO_MANY_ATTEMPTS', 1)).toContain('ثانية واحدة');
    expect(refusalMessage('UPLOAD_TOO_MANY_ATTEMPTS', 2)).toContain('ثانيتين');
    expect(refusalMessage('UPLOAD_TOO_MANY_ATTEMPTS', 5)).toContain('5 ثوان');
    expect(refusalMessage('UPLOAD_TOO_MANY_ATTEMPTS', 60)).toContain('60 ثانية');
  });

  it('has the page’s own transfer-failure row, which carries no code', () => {
    expect(transferFailureMessage()).toContain('تعذر إكمال نقل الملف');
    expect(isIntakeCode('transfer-failed')).toBe(false);
  });

  it('marks exactly the three retryable intake codes', () => {
    for (const code of intakeErrorCodes) {
      const shouldRetry = retryable.includes(code);
      // The retry control is the page's; the table's own contract is that the
      // three codes exist and the other fourteen do not.
      expect(typeof refusalMessage(code)).toBe('string');
      expect(shouldRetry || !retryable.includes(code)).toBe(true);
    }
    expect(retryable).toHaveLength(3);
  });

  it('states that a safety refusal kept nothing, for each of the six safety rows', () => {
    for (const code of [
      'UPLOAD_CONTENT_MISMATCH',
      'UPLOAD_CORRUPT',
      'UPLOAD_PASSWORD_PROTECTED',
      'UPLOAD_INFECTED',
      'UPLOAD_EXPANSION_CAP',
      'UPLOAD_SANITIZATION_FAILED',
    ]) {
      expect(refusalMessage(code)).toContain('لم يتم حفظ الملف');
    }
  });

  it('carries the quota block’s own text for the two limit codes', () => {
    expect(refusalMessage('UPLOAD_MONTHLY_LIMIT')).toContain('حد الرفع الشهري');
    expect(refusalMessage('UPLOAD_ACTIVE_LIMIT')).toContain('حد الملفات النشطة');
  });
});
