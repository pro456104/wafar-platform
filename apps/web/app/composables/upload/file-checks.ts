// The page's own file-level checks, mirroring the server's rule and order, so
// the choosing state knows a file's cause before any byte is transferred
// (FR-021-FR-028, AC-004-AC-007).
import { catalogFormats, type CatalogFormat } from '@wafar/shared';

export const fileNameMaxUnits = 255;
export const maxFileBytes = 104_857_600;

const refused = [
  /[\u202A-\u202E\u2066-\u2069\u061C\u200E\u200F]/,
  /[\u200B\uFEFF\u2028\u2029]/,
  // eslint-disable-next-line no-control-regex -- the refused set is FR-021's own code points.
  /[\u0000-\u001F\u007F-\u009F]/,
  /[/\\]/,
];

export type ClientRefusal =
  | 'UPLOAD_INVALID_NAME'
  | 'UPLOAD_UNSUPPORTED_FORMAT'
  | 'UPLOAD_TOO_LARGE'
  | 'UPLOAD_EMPTY';

export type ClientCheck =
  | { ok: true; format: CatalogFormat }
  | { ok: false; code: ClientRefusal };

export function lastSuffix(fileName: string): string {
  const index = fileName.lastIndexOf('.');
  return index === -1 ? '' : fileName.slice(index + 1);
}

export function clientFormatOf(fileName: string): CatalogFormat | null {
  const suffix = lastSuffix(fileName);
  let folded = '';
  for (const character of suffix) {
    const code = character.codePointAt(0) ?? 0;
    folded += code >= 0x41 && code <= 0x5a ? String.fromCodePoint(code + 0x20) : character;
  }
  return catalogFormats.find((format) => format === folded) ?? null;
}

/** The fixed order: name (an empty name included) -> format -> size -> emptiness. */
export function checkFile(name: string, byteSize: number): ClientCheck {
  if (name.length === 0 || name.length > fileNameMaxUnits) {
    return { ok: false, code: 'UPLOAD_INVALID_NAME' };
  }
  if (refused.some((pattern) => pattern.test(name))) {
    return { ok: false, code: 'UPLOAD_INVALID_NAME' };
  }
  const format = clientFormatOf(name);
  if (format === null) return { ok: false, code: 'UPLOAD_UNSUPPORTED_FORMAT' };
  if (byteSize > maxFileBytes) return { ok: false, code: 'UPLOAD_TOO_LARGE' };
  if (byteSize === 0) return { ok: false, code: 'UPLOAD_EMPTY' };
  return { ok: true, format };
}

export function formatLabel(format: CatalogFormat): 'Excel' | 'Word' | 'PDF' {
  if (format === 'xls' || format === 'xlsx') return 'Excel';
  if (format === 'doc' || format === 'docx') return 'Word';
  return 'PDF';
}
