// The per-format content probe: it classifies a file as matching, mismatched,
// corrupt, or password-protected, under the parser bounds the formats contract
// fixes (FR-027, contracts/intake-formats.md §3.5).
import * as CFB from 'cfb';
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFRef, type PDFObject } from 'pdf-lib';
import type { CatalogFormat } from '@wafar/shared';
import { readZip, type ZipReadOptions } from './zip.ts';

export type FormatVerdict =
  | { kind: 'matches' }
  | { kind: 'mismatch' }
  | { kind: 'corrupt' }
  | { kind: 'password-protected' };

const OLE2_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];

/** The parser bounds contracts/intake-formats.md §3.5 fixes. */
export const parserBounds = {
  xmlDepth: 64,
  packageEntries: 65_535,
  directoryEntries: 65_535,
  pdfIndirectObjects: 1_000_000,
  pdfPageTreeDepth: 64,
  xmlPartBytes: 4 * 1024 * 1024,
  probeBudgetMs: 5_000,
} as const;

function startsWith(bytes: Uint8Array, magic: readonly number[]): boolean {
  return magic.every((byte, index) => bytes[index] === byte);
}

/** One XML part's depth, measured on its element nesting. */
function xmlDepth(text: string): number {
  let depth = 0;
  let deepest = 0;
  for (const match of text.matchAll(/<\/?([A-Za-z_][\w:.-]*)[^>]*?(\/?)>/g)) {
    const closed = match[0].startsWith('</');
    if (closed) depth -= 1;
    else if (match[2] !== '/') {
      depth += 1;
      deepest = Math.max(deepest, depth);
    }
  }
  return deepest;
}

export interface ZipInspection {
  files: Record<string, Uint8Array>;
}

/** Opens one OOXML package and returns its members, or null when it will not open. */
export function openZip(
  bytes: Uint8Array,
  options: ZipReadOptions = {},
): ZipInspection | null {
  const read = readZip(bytes, options);
  if (read.kind !== 'ok') return null;
  if (Object.keys(read.files).length > parserBounds.packageEntries) return null;
  return { files: read.files };
}

/** The package's main part for one declared format, read from [Content_Types].xml. */
export function ooxmlMainPart(
  files: Record<string, Uint8Array>,
  format: 'xlsx' | 'docx',
): string | null {
  if (format === 'xlsx') {
    return files['xl/workbook.xml'] === undefined ? null : 'xl/workbook.xml';
  }
  return files['word/document.xml'] === undefined ? null : 'word/document.xml';
}

export function inspectOoxml(
  bytes: Uint8Array,
  format: 'xlsx' | 'docx',
  deadline: number,
): FormatVerdict {
  const opened = openZip(bytes, { deadline });
  if (opened === null) return { kind: 'corrupt' };
  if (Date.now() > deadline) return { kind: 'corrupt' };

  const contentTypes = opened.files['[Content_Types].xml'];
  if (contentTypes === undefined) return { kind: 'mismatch' };
  const declared = new TextDecoder().decode(contentTypes);
  if (/<!DOCTYPE/i.test(declared)) return { kind: 'corrupt' };
  if (xmlDepth(declared) > parserBounds.xmlDepth) return { kind: 'corrupt' };

  for (const [name, body] of Object.entries(opened.files)) {
    if (Date.now() > deadline) return { kind: 'corrupt' };
    if (
      body.byteLength > parserBounds.xmlPartBytes &&
      (name.endsWith('.xml') || name.endsWith('.rels'))
    ) {
      return { kind: 'corrupt' };
    }
    if (name.endsWith('.xml') || name.endsWith('.rels')) {
      const text = new TextDecoder().decode(body);
      if (/<!DOCTYPE/i.test(text)) return { kind: 'corrupt' };
      if (xmlDepth(text) > parserBounds.xmlDepth) return { kind: 'corrupt' };
    }
  }

  return ooxmlMainPart(opened.files, format) === null
    ? { kind: 'mismatch' }
    : { kind: 'matches' };
}

export interface Ole2Inspection {
  compound: CFB.CFB$Container;
}

/**
 * Walks the directory's sector chain with a visited set before the compound
 * reader runs: a chain that revisits a sector is corrupt, not a loop to follow
 * (contracts/intake-formats.md §3.5). A header this walk cannot read is left to
 * the compound reader, whose own failure answers corrupt.
 */
function directoryChainIsAcyclic(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 512) return true;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const sectorShift = view.getUint16(30, true);
  if (sectorShift !== 9 && sectorShift !== 12) return true;
  const sectorSize = 1 << sectorShift;
  const base = sectorShift === 12 ? sectorSize : 512;
  const firstDir = view.getInt32(48, true);
  const numFat = view.getUint32(44, true);
  if (firstDir < 0 || numFat === 0 || numFat > 109) return true;
  const totalSectors = Math.floor((bytes.byteLength - base) / sectorSize);
  if (firstDir >= totalSectors) return true;
  const entriesPerFatSector = sectorSize / 4;
  const fat = new Int32Array(numFat * entriesPerFatSector);
  for (let index = 0; index < numFat; index += 1) {
    const fatSector = view.getInt32(76 + index * 4, true);
    if (fatSector < 0 || fatSector >= totalSectors) return true;
    const offset = base + fatSector * sectorSize;
    for (let entry = 0; entry < entriesPerFatSector; entry += 1) {
      fat[index * entriesPerFatSector + entry] = view.getInt32(offset + entry * 4, true);
    }
  }
  const seen = new Set<number>();
  let sector = firstDir;
  while (sector >= 0 && sector < totalSectors) {
    if (seen.has(sector)) return false;
    seen.add(sector);
    if (sector >= fat.length) return true;
    const next = fat[sector] ?? -1;
    // ENDOFCHAIN (-2) and FREESECT (-1) end the chain.
    if (next === -2 || next === -1) return true;
    sector = next;
  }
  return true;
}

/** Opens one OLE2 compound file, or null when it will not open. */
export function openOle2(bytes: Uint8Array): Ole2Inspection | null {
  try {
    if (!directoryChainIsAcyclic(bytes)) return null;
    const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const compound = CFB.read(buffer, { type: 'buffer' });
    if (compound.FullPaths.length > parserBounds.directoryEntries) return null;
    return { compound };
  } catch {
    return null;
  }
}

function ole2Stream(compound: CFB.CFB$Container, name: string): Uint8Array | null {
  const entry = CFB.find(compound, name);
  if (entry === null || entry === undefined || entry.content === undefined) return null;
  const content = entry.content;
  if (typeof content === 'string') return new TextEncoder().encode(content);
  return new Uint8Array(content);
}

export function inspectOle2(
  bytes: Uint8Array,
  format: 'xls' | 'doc',
  deadline: number,
): FormatVerdict {
  const opened = openOle2(bytes);
  if (opened === null) return { kind: 'corrupt' };
  if (Date.now() > deadline) return { kind: 'corrupt' };
  const workbook = ole2Stream(opened.compound, 'Workbook') ?? ole2Stream(opened.compound, 'Book');
  const documentStream = ole2Stream(opened.compound, 'WordDocument');
  if (format === 'xls') {
    if (workbook === null) return { kind: 'mismatch' };
    return { kind: 'matches' };
  }
  if (documentStream === null) return { kind: 'mismatch' };
  return { kind: 'matches' };
}

function pdfLooksEncrypted(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /encrypt/i.test(message);
}

/**
 * The page tree's depth and cycle bound, walked with a visited set before any
 * page traversal the library would do: a tree 65 deep or one that revisits a
 * node is corrupt (contracts/intake-formats.md §3.5). The sanitizer reads it
 * too, before it traverses the pages it rewrites.
 */
export function pdfPageTreeWithinBounds(document: PDFDocument): boolean {
  const seen = new Set<number>();
  const walk = (object: PDFObject | undefined, depth: number): boolean => {
    if (object === undefined) return true;
    if (depth > parserBounds.pdfPageTreeDepth) return false;
    let node = object;
    if (node instanceof PDFRef) {
      if (seen.has(node.objectNumber)) return false;
      seen.add(node.objectNumber);
      const resolved = document.context.lookup(node);
      if (resolved === undefined) return true;
      node = resolved;
    }
    if (!(node instanceof PDFDict)) return true;
    const kids = node.get(PDFName.of('Kids'));
    if (kids instanceof PDFArray) {
      for (let index = 0; index < kids.size(); index += 1) {
        if (!walk(kids.get(index), depth + 1)) return false;
      }
    }
    return true;
  };
  return walk(document.catalog.get(PDFName.of('Pages')), 1);
}

/**
 * The action chains' depth and cycle bound: every /Next chain reached from the
 * catalog's /OpenAction or /AA, a page's /AA, or an annotation's /Action stays
 * within the same 64-deep bound, each walk guarded by its own visited set.
 */
function actionChainsWithinBounds(document: PDFDocument): boolean {
  const walk = (
    object: PDFObject | undefined,
    depth: number,
    seen: Set<number>,
  ): boolean => {
    if (object === undefined) return true;
    if (depth > parserBounds.pdfPageTreeDepth) return false;
    let node = object;
    if (node instanceof PDFRef) {
      if (seen.has(node.objectNumber)) return false;
      seen.add(node.objectNumber);
      const resolved = document.context.lookup(node);
      if (resolved === undefined) return true;
      node = resolved;
    }
    if (!(node instanceof PDFDict)) return true;
    return walk(node.get(PDFName.of('Next')), depth + 1, seen);
  };
  const starts: (PDFObject | undefined)[] = [
    document.catalog.get(PDFName.of('OpenAction')),
  ];
  const additional = document.catalog.get(PDFName.of('AA'));
  if (additional instanceof PDFDict) {
    for (const key of additional.keys()) starts.push(additional.get(key));
  }
  // The page tree is within bounds here, so the library's traversal is safe.
  for (const page of document.getPages()) {
    const pageAdditional = page.node.get(PDFName.of('AA'));
    if (pageAdditional instanceof PDFDict) {
      for (const key of pageAdditional.keys()) starts.push(pageAdditional.get(key));
    }
    const annots = page.node.get(PDFName.of('Annots'));
    if (annots instanceof PDFArray) {
      for (let index = 0; index < annots.size(); index += 1) {
        const entry = annots.get(index);
        const annot = entry instanceof PDFRef ? document.context.lookup(entry) : entry;
        if (annot instanceof PDFDict) starts.push(annot.get(PDFName.of('A')));
      }
    }
  }
  return starts.every((start) => walk(start, 1, new Set<number>()));
}

/** The PDF probe: the header inside 1024 bytes and one parse under the bounds. */
export async function inspectPdf(
  bytes: Uint8Array,
  deadline: number,
): Promise<FormatVerdict> {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 1024));
  if (!head.includes('%PDF-')) return { kind: 'mismatch' };

  const indirectObjects = (head.match(/\d+\s+\d+\s+obj/g) ?? []).length;
  const allObjects = new TextDecoder('latin1').decode(bytes).match(/\d+\s+\d+\s+obj/g) ?? [];
  if (allObjects.length > parserBounds.pdfIndirectObjects) return { kind: 'corrupt' };
  if (indirectObjects > parserBounds.pdfIndirectObjects) return { kind: 'corrupt' };
  if (Date.now() > deadline) return { kind: 'corrupt' };

  try {
    const document = await PDFDocument.load(bytes, { updateMetadata: false });
    if (Date.now() > deadline) return { kind: 'corrupt' };
    if (!pdfPageTreeWithinBounds(document)) return { kind: 'corrupt' };
    if (!actionChainsWithinBounds(document)) return { kind: 'corrupt' };
    if (document.getPageCount() === 0) return { kind: 'mismatch' };
    return { kind: 'matches' };
  } catch (error) {
    if (pdfLooksEncrypted(error)) return { kind: 'password-protected' };
    return { kind: 'corrupt' };
  }
}

/** The probe's single entry point: the declared format and the file's bytes. */
export async function inspectFormat(
  bytes: Uint8Array,
  format: CatalogFormat,
  budgetMs: number = parserBounds.probeBudgetMs,
): Promise<FormatVerdict> {
  const deadline = Date.now() + budgetMs;
  if (Date.now() > deadline) return { kind: 'corrupt' };
  if (format === 'pdf') {
    if (!new TextDecoder('latin1').decode(bytes.subarray(0, 1024)).includes('%PDF-')) {
      return { kind: 'mismatch' };
    }
    return inspectPdf(bytes, deadline);
  }
  if (format === 'xls' || format === 'doc') {
    if (!startsWith(bytes, OLE2_MAGIC)) return { kind: 'mismatch' };
    return inspectOle2(bytes, format, deadline);
  }
  if (!startsWith(bytes, ZIP_MAGIC)) return { kind: 'mismatch' };
  return inspectOoxml(bytes, format, deadline);
}

export { ole2Stream, startsWith, ZIP_MAGIC, OLE2_MAGIC };
