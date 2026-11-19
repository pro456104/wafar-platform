// FR-021's suffix reading: the last dot, the untrimmed comparison, and the
// empty name that never reaches the suffix reader (AC-005; T102, T029).
import { describe, expect, it } from 'vitest';
import { checkFile, clientFormatOf, lastSuffix } from '../../../app/composables/upload/file-checks';

describe('the last-suffix rule', () => {
  it('treats `catalog.` as an empty last suffix and refuses it for its format', () => {
    expect(lastSuffix('catalog.')).toBe('');
    expect(clientFormatOf('catalog.')).toBeNull();
    expect(checkFile('catalog.', 1024)).toEqual({
      ok: false,
      code: 'UPLOAD_UNSUPPORTED_FORMAT',
    });
  });

  it('does not trim a space the name carries', () => {
    expect(lastSuffix('catalog. xlsx')).toBe(' xlsx');
    expect(clientFormatOf('catalog. xlsx')).toBeNull();
    expect(checkFile('catalog. xlsx', 1024)).toEqual({
      ok: false,
      code: 'UPLOAD_UNSUPPORTED_FORMAT',
    });
    expect(checkFile('catalog.xlsx ', 1024)).toEqual({
      ok: false,
      code: 'UPLOAD_UNSUPPORTED_FORMAT',
    });
  });

  it('treats `.xlsx` as itself an allowed suffix', () => {
    expect(lastSuffix('.xlsx')).toBe('xlsx');
    expect(checkFile('.xlsx', 1024).ok).toBe(true);
  });

  it('refuses the empty name before the suffix reader, as the invalid-name cause', () => {
    expect(checkFile('', 1024)).toEqual({ ok: false, code: 'UPLOAD_INVALID_NAME' });
    expect(lastSuffix('')).toBe('');
  });

  it('decides every case before any byte is transferred', () => {
    // The check is pure: it takes the browser's reported name and size only.
    const result = checkFile('catalog.xlsx', 1024);
    expect(result).toEqual({ ok: true, format: 'xlsx' });
  });
});
