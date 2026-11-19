// The page's file-level checks: the refused name sets, the 255 UTF-16 bound and
// the empty name, the last-suffix fold, the fixed cause order, the exactly-100 MB
// boundary, and the four format surfaces (FR-008, FR-021-FR-025, AC-004, AC-005,
// AC-007, AC-011; T029).
import { describe, expect, it } from 'vitest';
import { formatSize, formatDate, formatDuration, formatStatus } from '@wafar/shared';
import {
  checkFile,
  clientFormatOf,
  lastSuffix,
  maxFileBytes,
} from '../../../app/composables/upload/file-checks';

describe('the refused name sets', () => {
  const refused = [
    ['U+202A', '\u202a'],
    ['U+202E', '\u202e'],
    ['U+2066', '\u2066'],
    ['U+2069', '\u2069'],
    ['U+061C', '\u061c'],
    ['U+200E', '\u200e'],
    ['U+200F', '\u200f'],
    ['U+200B', '\u200b'],
    ['U+FEFF', '\ufeff'],
    ['U+2028', '\u2028'],
    ['U+2029', '\u2029'],
    ['U+0000', '\u0000'],
    ['U+001F', '\u001f'],
    ['U+007F', '\u007f'],
    ['U+009F', '\u009f'],
    ['slash', '/'],
    ['backslash', '\\'],
  ];

  for (const [label, character] of refused) {
    it(`refuses ${label} in a name`, () => {
      const result = checkFile(`ملف${character}.pdf`, 1024);
      expect(result).toEqual({ ok: false, code: 'UPLOAD_INVALID_NAME' });
    });
  }

  it('accepts U+200C, U+200D, and emoji in a name', () => {
    expect(checkFile('ملف\u200c\u200d.pdf', 1024).ok).toBe(true);
    expect(checkFile('ملف 😀.pdf', 1024).ok).toBe(true);
  });
});

describe('the 255 UTF-16 bound and the empty name', () => {
  it('accepts 255 code units and refuses 256', () => {
    const stem = 'a'.repeat(255 - 4);
    expect(checkFile(`${stem}.pdf`, 1).ok).toBe(true);
    const longer = 'a'.repeat(256 - 4);
    expect(checkFile(`${longer}.pdf`, 1)).toEqual({
      ok: false,
      code: 'UPLOAD_INVALID_NAME',
    });
  });

  it('refuses the empty name as the invalid-name cause', () => {
    expect(checkFile('', 1)).toEqual({ ok: false, code: 'UPLOAD_INVALID_NAME' });
  });
});

describe('the last suffix', () => {
  it('folds only ASCII letters', () => {
    expect(clientFormatOf('catalog.XLSX')).toBe('xlsx');
    expect(clientFormatOf('catalog.PdF')).toBe('pdf');
    expect(clientFormatOf('catalog.xlS')).toBe('xls');
  });

  it('reads the text after the final dot and never trims it', () => {
    expect(lastSuffix('catalog.')).toBe('');
    expect(lastSuffix('catalog. xlsx')).toBe(' xlsx');
    expect(lastSuffix('.xlsx')).toBe('xlsx');
  });
});

describe('the fixed cause order', () => {
  it('reports the name first, then format, then size, then emptiness', () => {
    expect(checkFile('', 0)).toEqual({ ok: false, code: 'UPLOAD_INVALID_NAME' });
    expect(checkFile('name.txt', 0)).toEqual({
      ok: false,
      code: 'UPLOAD_UNSUPPORTED_FORMAT',
    });
    expect(checkFile('name.pdf', maxFileBytes + 1)).toEqual({
      ok: false,
      code: 'UPLOAD_TOO_LARGE',
    });
    expect(checkFile('name.pdf', 0)).toEqual({ ok: false, code: 'UPLOAD_EMPTY' });
  });
});

describe('the exactly-100 MB boundary', () => {
  it('accepts exactly 100 MB and refuses one byte more', () => {
    expect(checkFile('name.pdf', maxFileBytes).ok).toBe(true);
    expect(checkFile('name.pdf', maxFileBytes + 1)).toEqual({
      ok: false,
      code: 'UPLOAD_TOO_LARGE',
    });
  });
});

describe('the four shared surfaces', () => {
  it('renders the date in Tripoli, Gregorian, with Latin digits', () => {
    expect(formatDate('2026-11-13T10:02:11.000Z')).toBe('2026-11-13');
  });

  it('renders integer KB under 1 MB and one MB decimal at and over it', () => {
    expect(formatSize(1)).toBe('1 KB');
    expect(formatSize(1024 * 1024 - 1)).toBe('1024 KB');
    expect(formatSize(2_411_724)).toBe('2.3 MB');
  });

  it('renders the duration’s four agreement classes', () => {
    expect(formatDuration(1)).toBe('ثانية واحدة');
    expect(formatDuration(2)).toBe('ثانيتين');
    expect(formatDuration(5)).toBe('5 ثوان');
    expect(formatDuration(60)).toBe('60 ثانية');
  });

  it('renders the four status labels and no raw value', () => {
    expect(formatStatus('uploaded')).toBe('تم الرفع');
    expect(formatStatus('processing')).toBe('قيد المعالجة');
    expect(formatStatus('completed')).toBe('اكتمل');
    expect(formatStatus('failed')).toBe('فشل');
  });
});
