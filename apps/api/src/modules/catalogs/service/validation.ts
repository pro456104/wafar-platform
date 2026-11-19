// The file-level validator: the name's safety sets, the 255-UTF-16 bound, the
// last suffix, the 100 MB ceiling, and the file's emptiness, in the fixed order
// FR-028 gives (FR-021-FR-028, AC-004-AC-007).
import { catalogFormats, type CatalogFormat } from '@wafar/shared';

/** The refused character sets, one set per cause the contract names. */
export const refusedCharacters: readonly { name: string; pattern: RegExp }[] = [
  { name: 'BIDI', pattern: /[\u202A-\u202E\u2066-\u2069\u061C\u200E\u200F]/ },
  { name: 'INVISIBLE', pattern: /[\u200B\uFEFF\u2028\u2029]/ },
  // eslint-disable-next-line no-control-regex -- the refused set is the contract's own code points.
  { name: 'CONTROL', pattern: /[\u0000-\u001F\u007F-\u009F]/ },
  { name: 'PATH', pattern: /[/\\]/ },
];

/** The three causes a name may carry, in the order they are decided. */
export type NameRefusal = 'empty' | 'too_long' | 'characters';

export type ValidationResult =
  | { kind: 'ok'; fileName: string; format: CatalogFormat }
  | { kind: 'refused'; code: string; field?: string };

/** 255 UTF-16 code units, counted as a browser reports a name. */
export const fileNameMaxUnits = 255;
/** The 100 MB ceiling: exactly 100 MB is accepted, one byte more is refused. */
export const maxFileBytes = 104_857_600;

export function nameRefusal(fileName: string): NameRefusal | null {
  if (fileName.length === 0) return 'empty';
  if (fileName.length > fileNameMaxUnits) return 'too_long';
  for (const set of refusedCharacters) {
    if (set.pattern.test(fileName)) return 'characters';
  }
  return null;
}

/** The text after the final dot, compared exactly and never trimmed. */
export function lastSuffix(fileName: string): string {
  const index = fileName.lastIndexOf('.');
  return index === -1 ? '' : fileName.slice(index + 1);
}

/** The format a suffix names, folding only ASCII A-Z. */
export function formatOf(suffix: string): CatalogFormat | null {
  let folded = '';
  for (const character of suffix) {
    const code = character.codePointAt(0) ?? 0;
    folded += code >= 0x41 && code <= 0x5a ? String.fromCodePoint(code + 0x20) : character;
  }
  const match = catalogFormats.find((format) => format === folded);
  return match ?? null;
}

/**
 * The fixed order: name (an empty name included) -> format -> size -> the
 * file's own emptiness. No refused name is ever echoed (FR-025).
 */
export function validateFile(input: {
  fileName: string;
  byteSize: number;
}): ValidationResult {
  const refusal = nameRefusal(input.fileName);
  if (refusal !== null) {
    return { kind: 'refused', code: 'UPLOAD_INVALID_NAME', field: 'fileName' };
  }
  const format = formatOf(lastSuffix(input.fileName));
  if (format === null) {
    return { kind: 'refused', code: 'UPLOAD_UNSUPPORTED_FORMAT', field: 'fileName' };
  }
  if (input.byteSize > maxFileBytes) {
    return { kind: 'refused', code: 'UPLOAD_TOO_LARGE', field: 'byteSize' };
  }
  if (input.byteSize === 0) {
    return { kind: 'refused', code: 'UPLOAD_EMPTY', field: 'byteSize' };
  }
  return { kind: 'ok', fileName: input.fileName, format };
}
