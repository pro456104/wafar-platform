// The sanitizer: executable content is removed before a kept object is written,
// and the rewritten bytes are reopened as the declared format under the same
// bounds (FR-032; contracts/intake-formats.md §5).
import { zipSync } from 'fflate';
import * as CFB from 'cfb';
import { PDFDocument, PDFName } from 'pdf-lib';
import type { CatalogFormat } from '@wafar/shared';
import { decodedCapBytes } from './cap.ts';
import { inspectFormat, openOle2, openZip, pdfPageTreeWithinBounds } from './format.ts';

export type SanitizeFailure =
  | 'unremovable'
  | 'reopen-failed'
  | 'over-cap'
  | 'timeout';

export type SanitizeVerdict =
  | { kind: 'ok'; bytes: Uint8Array; decodedBytes: number }
  | { kind: 'failed'; reason: SanitizeFailure };

export interface SanitizeInput {
  bytes: Uint8Array;
  format: CatalogFormat;
  budgetMs: number;
  reopenBudgetMs: number;
  /**
   * The first decoded-size read's total (FR-029). A PDF's streams are only
   * removed by the sanitizer, so the first read's confirmed total is the
   * sanitized decode's own bound; OOXML and OLE2 count their written members.
   */
  originalDecodedBytes: number;
}

const executablePackageParts: readonly RegExp[] = [
  /^xl\/vbaProject\.bin$/i,
  /^xl\/vbaData\.xml$/i,
  /^xl\/macrosheets\//i,
  /^xl\/activeX\//i,
  /^xl\/embeddings\//i,
  /^word\/embeddings\//i,
  /^xl\/externalLinks\/externalLink[^/]*\.xml$/i,
];

function isExecutablePart(name: string): boolean {
  return executablePackageParts.some((pattern) => pattern.test(name));
}

/**
 * A package whose permissions forbid the write: Excel's structure protection
 * or Word's enforced document protection. The platform cannot rewrite such a
 * document, so it is refused with the sanitization cause rather than stored
 * with its executable content intact (FR-032; intake-formats.md §4).
 */
function ooxmlIsNonWritable(files: Record<string, Uint8Array>): boolean {
  const workbook = files['xl/workbook.xml'];
  if (
    workbook !== undefined &&
    /<workbookProtection\b[^>]*\blockStructure="(?:1|true)"/i.test(
      new TextDecoder().decode(workbook),
    )
  ) {
    return true;
  }
  const settings = files['word/settings.xml'];
  return (
    settings !== undefined &&
    /<w:documentProtection\b[^>]*\bw:enforcement="(?:1|on|true)"/i.test(
      new TextDecoder().decode(settings),
    )
  );
}

function stripRelationshipTargets(xml: string): string {
  return xml.replace(/<Relationship\b[^>]*?\/>/g, (tag) => {
    const typeMatch = /Type="([^"]*)"/.exec(tag);
    const targetMode = /TargetMode="([^"]*)"/.exec(tag);
    const type = typeMatch?.[1] ?? '';
    if (
      /\/vbaProject$/i.test(type) ||
      /\/activeXControl$/i.test(type) ||
      /\/oleObject$/i.test(type) ||
      /\/package$/i.test(type) ||
      /\/externalLink$/i.test(type) ||
      /\/externalLinkPath$/i.test(type) ||
      targetMode?.[1] === 'External'
    ) {
      return '';
    }
    return tag;
  });
}

function stripOverrides(xml: string): string {
  return xml.replace(/<Override\b[^>]*?\/>/g, (tag) => {
    const partName = /PartName="([^"]*)"/.exec(tag)?.[1] ?? '';
    const cleaned = partName.replace(/^\//, '');
    return isExecutablePart(cleaned) || /\/externalLink[^/]*\.xml$/i.test(cleaned) ? '' : tag;
  });
}

function sanitizeOoxml(bytes: Uint8Array, deadline: number): SanitizeVerdict {
  const opened = openZip(bytes, { deadline });
  if (opened === null) return { kind: 'failed', reason: 'unremovable' };
  if (Date.now() > deadline) return { kind: 'failed', reason: 'unremovable' };
  if (ooxmlIsNonWritable(opened.files)) return { kind: 'failed', reason: 'unremovable' };

  const kept: Record<string, Uint8Array> = {};
  for (const [name, body] of Object.entries(opened.files)) {
    if (Date.now() > deadline) return { kind: 'failed', reason: 'unremovable' };
    if (isExecutablePart(name)) continue;
    if (name.endsWith('.rels')) {
      const stripped = stripRelationshipTargets(new TextDecoder().decode(body));
      // A relationships part left empty by the removal is dropped with the
      // part it named, so two documents identical except for their macros keep
      // identical bytes and the second is the duplicate AC-019 fixes.
      if (!/<Relationship\b/u.test(stripped)) continue;
      kept[name] = new TextEncoder().encode(stripped);
      continue;
    }
    if (name === '[Content_Types].xml') {
      kept[name] = new TextEncoder().encode(stripOverrides(new TextDecoder().decode(body)));
      continue;
    }
    kept[name] = body;
  }

  // A relationship that named an executable part is gone with its part, so no
  // kept `.rels` may still point at one.
  for (const [name, body] of Object.entries(kept)) {
    if (!name.endsWith('.rels')) continue;
    const text = new TextDecoder().decode(body);
    if (/\/embeddings\/|\/vbaProject|\/externalLink/i.test(text)) {
      return { kind: 'failed', reason: 'unremovable' };
    }
  }

  try {
    // The members the sanitizer writes are the decoded content it keeps: their
    // uncompressed sizes are counted here, so the second measurement takes no
    // read of its own (FR-029).
    const decodedBytes = Object.values(kept).reduce(
      (sum, body) => sum + body.byteLength,
      0,
    );
    // A fixed timestamp keeps the kept bytes a function of the content alone:
    // two documents identical except for their macros then hash equally
    // (AC-019).
    return {
      kind: 'ok',
      bytes: zipSync(kept, { mtime: new Date('1980-01-02T00:00:00Z') }),
      decodedBytes,
    };
  } catch {
    return { kind: 'failed', reason: 'unremovable' };
  }
}

// --- OLE2 and the BIFF workbook stream -------------------------------------

const BOUNDSHEET = 0x0085;
const BOF = 0x0809;
const EOF = 0x000a;
const NAME = 0x0018;
const WRITEPROT = 0x0086;
const SHEET_MACRO = 0x01;

interface BiffRecord {
  type: number;
  offset: number;
  length: number;
  end: number;
}

function readRecords(bytes: Uint8Array, start = 0, end = bytes.byteLength): BiffRecord[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const records: BiffRecord[] = [];
  let offset = start;
  while (offset + 4 <= end) {
    const type = view.getUint16(offset, true);
    const length = view.getUint16(offset + 2, true);
    const next = offset + 4 + length;
    if (next > end) break;
    records.push({ type, offset, length, end: next });
    offset = next;
  }
  return records;
}

interface SheetEntry {
  record: BiffRecord;
  position: number;
  macro: boolean;
}

function macroSheets(bytes: Uint8Array): SheetEntry[] {
  const records = readRecords(bytes);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const sheets: SheetEntry[] = [];
  for (const record of records) {
    if (record.type !== BOUNDSHEET || record.length < 8) continue;
    const dataOffset = record.offset + 4;
    const position = view.getUint32(dataOffset, true);
    const type = view.getUint8(dataOffset + 5);
    sheets.push({ record, position, macro: type === SHEET_MACRO });
  }
  return sheets;
}

/**
 * A workbook whose write protection carries no user-unlockable password: the
 * BIFF `WRITEPROT` record's flag is set, so the platform cannot rewrite it and
 * refuses it with the sanitization cause (FR-032; intake-formats.md §4.2).
 */
function workbookIsWriteProtected(bytes: Uint8Array): boolean {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (const record of readRecords(bytes)) {
    if (record.type !== WRITEPROT || record.length < 2) continue;
    return view.getUint16(record.offset + 4, true) === 1;
  }
  return false;
}

/** Removes one macro sheet's BOF..EOF substream from the workbook stream. */
function rewriteWorkbookStream(bytes: Uint8Array): Uint8Array {
  const sheets = macroSheets(bytes);
  const macros = sheets.filter((sheet) => sheet.macro);
  if (macros.length === 0) return bytes;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const removed: { start: number; end: number }[] = [];
  for (const sheet of macros) {
    let end = bytes.byteLength;
    let depth = 0;
    for (const record of readRecords(bytes, sheet.position)) {
      if (record.type === BOF) depth += 1;
      if (record.type === EOF) {
        depth -= 1;
        if (depth === 0) {
          end = record.end;
          break;
        }
      }
    }
    removed.push({ start: sheet.position, end });
  }
  removed.sort((left, right) => left.start - right.start);

  const removedMacroRecords = new Set(macros.map((sheet) => sheet.record.offset));
  const macroIndexes = new Set(
    sheets.filter((sheet) => sheet.macro).map((sheet) => sheets.indexOf(sheet)),
  );

  // Every remaining sheet's stream position moves back by the removed ranges
  // before it, and every defined name's sheet index is renumbered.
  const shift = (position: number): number => {
    let delta = 0;
    for (const range of removed) {
      if (range.end <= position) delta += range.end - range.start;
    }
    return position - delta;
  };
  const keptSheets = sheets.filter((sheet) => !sheet.macro);
  const sheetIndexOf = new Map<SheetEntry, number>();
  keptSheets.forEach((sheet, index) => sheetIndexOf.set(sheet, index));
  const originalIndex = new Map<SheetEntry, number>();
  sheets.forEach((sheet, index) => originalIndex.set(sheet, index));
  const renumber = (index: number): number => {
    let result = index;
    for (const macroIndex of macroIndexes) {
      if (macroIndex < index) result -= 1;
    }
    return result;
  };

  const parts: Uint8Array[] = [];
  const records = readRecords(bytes);
  let cursor = 0;
  for (const record of records) {
    if (record.offset < cursor) continue;
    const inRemoved = removed.some(
      (range) => record.offset >= range.start && record.offset < range.end,
    );
    if (inRemoved || removedMacroRecords.has(record.offset)) {
      cursor = record.end;
      continue;
    }
    const header = bytes.subarray(record.offset, record.offset + 4);
    let body = bytes.subarray(record.offset + 4, record.end);
    if (record.type === BOUNDSHEET && body.byteLength >= 8) {
      const copy = new Uint8Array(body);
      const copyView = new DataView(copy.buffer);
      const position = copyView.getUint32(0, true);
      copyView.setUint32(0, shift(position) < 0 ? 0 : shift(position), true);
      body = copy;
    }
    if (record.type === NAME && body.byteLength >= 14) {
      const copy = new Uint8Array(body);
      const copyView = new DataView(copy.buffer);
      const itab = copyView.getUint16(12, true);
      if (macroIndexes.has(itab)) {
        cursor = record.end;
        continue;
      }
      copyView.setUint16(12, renumber(itab), true);
      body = copy;
    }
    parts.push(new Uint8Array(header));
    parts.push(new Uint8Array(body));
    cursor = record.end;
  }

  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  void view;
  void sheetIndexOf;
  void originalIndex;
  return out;
}

function sanitizeOle2(bytes: Uint8Array, deadline: number): SanitizeVerdict {
  const opened = openOle2(bytes);
  if (opened === null) return { kind: 'failed', reason: 'unremovable' };
  if (Date.now() > deadline) return { kind: 'failed', reason: 'unremovable' };
  const compound = opened.compound;

  const removedPaths = ['VBA', 'ObjectPool', '_VBA_PROJECT', 'PROJECT', 'PROJECTwm'];
  for (const path of removedPaths) {
    for (const candidate of ['/Root Entry/' + path, path]) {
      const del = (CFB as unknown as { utils: { cfb_del: (c: unknown, p: string) => void } })
        .utils?.cfb_del;
      if (typeof del === 'function') {
        try {
          del(compound, candidate);
        } catch {
          // A part that is absent needs no removal.
        }
      }
    }
  }

  const workbookEntry =
    CFB.find(compound, 'Workbook') ?? CFB.find(compound, 'Book');
  if (workbookEntry !== null && workbookEntry !== undefined && workbookEntry.content !== undefined) {
    const original =
      typeof workbookEntry.content === 'string'
        ? new TextEncoder().encode(workbookEntry.content)
        : new Uint8Array(workbookEntry.content);
    if (workbookIsWriteProtected(original)) return { kind: 'failed', reason: 'unremovable' };
    const rewritten = rewriteWorkbookStream(original);
    workbookEntry.content = Buffer.from(rewritten);
  }

  let out: Uint8Array;
  let decodedBytes = 0;
  try {
    const written = CFB.write(compound, { type: 'buffer' }) as Uint8Array;
    out = new Uint8Array(written);
    // The written compound's streams are the sanitized decode: count their
    // uncompressed content instead of inflating the output a second time
    // (FR-029).
    compound.FullPaths.forEach((_path, index) => {
      const entry = compound.FileIndex[index];
      if (entry?.type !== 2 || entry.content === undefined) return;
      const content: Uint8Array | string = entry.content as Uint8Array | string;
      decodedBytes +=
        typeof content === 'string' ? content.length : content.byteLength;
    });
  } catch {
    return { kind: 'failed', reason: 'unremovable' };
  }
  return { kind: 'ok', bytes: out, decodedBytes };
}

function sanitizePdf(
  bytes: Uint8Array,
  originalDecodedBytes: number,
): Promise<SanitizeVerdict> {
  return (async () => {
    let document: PDFDocument;
    try {
      document = await PDFDocument.load(bytes, { updateMetadata: false });
    } catch {
      return { kind: 'failed', reason: 'unremovable' };
    }

    // A page tree the probe's bounds refuse cannot be traversed for the
    // rewrite: the sanitizer fails closed rather than walking a cycle.
    if (!pdfPageTreeWithinBounds(document)) {
      return { kind: 'failed', reason: 'unremovable' };
    }

    const catalog = document.catalog;
    for (const name of [
      'OpenAction',
      'AA',
      'Names',
      'AF',
      'AcroForm',
      'JavaScript',
      'Launch',
    ]) {
      if (catalog.has(PDFName.of(name))) catalog.delete(PDFName.of(name));
    }

    // Every action dictionary a page carries is withdrawn beside the catalog's.
    for (const page of document.getPages()) {
      const node = page.node;
      for (const name of ['AA', 'JavaScript', 'Launch']) {
        if (node.has(PDFName.of(name))) node.delete(PDFName.of(name));
      }
      if (node.has(PDFName.of('Annots'))) {
        const annots = node.lookup(PDFName.of('Annots')) as unknown as
          | {
              size(): number;
              lookup(index: number): unknown;
              remove(index: number): void;
            }
          | undefined;
        if (annots !== undefined && typeof annots.size === 'function') {
          for (let index = annots.size() - 1; index >= 0; index -= 1) {
            const entry = annots.lookup(index) as
              | { get?: (key: PDFName) => unknown }
              | null
              | undefined;
            const action = entry?.get?.(PDFName.of('A'));
            if (action !== undefined) annots.remove(index);
          }
        }
      }
    }

    try {
      const out = await document.save({ useObjectStreams: false });
      // Sanitizing a PDF only removes content, so the first read's confirmed
      // stream total is the sanitized decode's bound; no second inflate is
      // taken (FR-029).
      return { kind: 'ok', bytes: out, decodedBytes: originalDecodedBytes };
    } catch {
      return { kind: 'failed', reason: 'unremovable' };
    }
  })();
}

/** The sanitizer's entry point; it also counts the bytes it keeps. */
export async function sanitize(input: SanitizeInput): Promise<SanitizeVerdict> {
  const started = Date.now();
  const deadline = started + input.budgetMs;
  let result: SanitizeVerdict;
  if (input.format === 'pdf') {
    result = await sanitizePdf(input.bytes, input.originalDecodedBytes);
  } else if (input.format === 'xls' || input.format === 'doc') {
    result = sanitizeOle2(input.bytes, deadline);
  } else {
    result = sanitizeOoxml(input.bytes, deadline);
  }

  // A document whose permissions forbid the write, or whose owner protection
  // carries no user password, cannot be rewritten at all.
  if (result.kind === 'ok') {
    // The sanitizer's own budget is the rewrite's, and the sanitized decode is
    // counted from the members it wrote rather than re-inflated (FR-029).
    if (Date.now() - started > input.budgetMs) {
      return { kind: 'failed', reason: 'unremovable' };
    }
    if (result.decodedBytes > decodedCapBytes) {
      return { kind: 'failed', reason: 'over-cap' };
    }
    if (result.bytes.byteLength > 100 * 1024 * 1024) {
      return { kind: 'failed', reason: 'unremovable' };
    }

    const reopenStarted = Date.now();
    const reopened = await inspectFormat(result.bytes, input.format, input.reopenBudgetMs);
    if (reopened.kind !== 'matches') {
      return { kind: 'failed', reason: 'reopen-failed' };
    }
    if (Date.now() - reopenStarted > input.reopenBudgetMs) {
      return { kind: 'failed', reason: 'unremovable' };
    }
  }
  return result;
}
