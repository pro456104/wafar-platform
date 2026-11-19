// The decoded-size cap: 1 GiB of decoded content per file, counted streaming
// and stopping at the cap without allocating beyond it, for the original decode
// and for the sanitized one (FR-031; CMV 15; ADR-174).
import { inflateSync, constants as zlibConstants } from 'node:zlib';
import type { CatalogFormat } from '@wafar/shared';
import { openOle2 } from './format.ts';
import { readZip } from './zip.ts';

/** CMV 15: 1 GiB of decoded content. */
export const decodedCapBytes = 1_073_741_824;

export type CapVerdict =
  | { kind: 'within'; decodedBytes: number }
  | { kind: 'over'; decodedBytes: number }
  | { kind: 'timeout' };

export interface CountingSink {
  add(bytes: number): void;
  total(): number;
  crossed(): boolean;
}

/** The counting sink the sanitizer also spends, so one bound reads both passes. */
export function createCountingSink(cap = decodedCapBytes): CountingSink {
  let total = 0;
  return {
    add(bytes) {
      total += bytes;
    },
    total: () => total,
    crossed: () => total > cap,
  };
}

export interface CapInput {
  bytes: Uint8Array;
  format: CatalogFormat;
  budgetMs: number;
  cap?: number;
}

function zipDecoded(
  sink: CountingSink,
  bytes: Uint8Array,
  deadline: number,
  cap: number,
): 'ok' | 'over' | 'timeout' {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // The central directory's own uncompressed sizes are a cheap first bound:
  // an archive that declares more than the cap is refused before any member is
  // inflated.
  const declared = createCountingSink(cap);
  let offset = 0;
  while (offset + 4 <= bytes.byteLength) {
    if (Date.now() > deadline) return 'timeout';
    if (view.getUint32(offset, true) === 0x02014b50) {
      const compressed = view.getUint32(offset + 20, true);
      const uncompressed = view.getUint32(offset + 24, true);
      declared.add(Math.max(compressed, uncompressed));
    }
    offset += 1;
  }
  if (declared.crossed()) return 'over';

  // The streamed read counts what the members actually decode to, so a central
  // directory that understates its members cannot expand past the cap.
  const read = readZip(bytes, { cap, deadline });
  if (read.kind === 'over') return 'over';
  if (read.kind === 'timeout') return 'timeout';
  if (read.kind === 'corrupt') {
    // The probe is what refuses a corrupt package; the cap's read contributes
    // the declared total it could not inflate.
    sink.add(declared.total());
    return 'ok';
  }
  for (const body of Object.values(read.files)) {
    sink.add(body.byteLength);
    if (sink.crossed()) return 'over';
  }
  return 'ok';
}

function oleDecoded(sink: CountingSink, bytes: Uint8Array, deadline: number): boolean {
  const opened = openOle2(bytes);
  if (opened === null) return false;
  for (const raw of opened.compound.FullPaths) {
    if (Date.now() > deadline) return true;
    const entry = opened.compound.FileIndex[opened.compound.FullPaths.indexOf(raw)];
    if (entry?.type === 2 && entry.content !== undefined) {
      sink.add(
        typeof entry.content === 'string'
          ? (entry.content as string).length
          : new Uint8Array(entry.content as Uint8Array).byteLength,
      );
    }
  }
  return false;
}

function pdfDecoded(
  sink: CountingSink,
  bytes: Uint8Array,
  deadline: number,
  cap: number,
): 'ok' | 'over' | 'timeout' {
  const text = new TextDecoder('latin1').decode(bytes);
  for (const match of text.matchAll(/stream\r?\n/g)) {
    if (Date.now() > deadline) return 'timeout';
    const start = (match.index ?? 0) + match[0].length;
    const end = text.indexOf('endstream', start);
    if (end === -1) break;
    const slice = bytes.subarray(start, end);
    const remaining = cap - sink.total();
    if (remaining <= 0) return 'over';
    try {
      // The bound is handed to zlib, so one stream that expands past the cap
      // is stopped where it crosses rather than after it is allocated.
      const inflated = inflateSync(slice, {
        finishFlush: zlibConstants.Z_SYNC_FLUSH,
        maxOutputLength: remaining,
      });
      sink.add(inflated.byteLength);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ERR_BUFFER_TOO_LARGE') {
        return 'over';
      }
      // A stream that will not inflate contributes no decoded content; the
      // format probe is what refuses a corrupt document.
    }
  }
  return 'ok';
}

/** Measures one decode and answers whether it stays inside the cap. */
export function measureDecoded(input: CapInput): CapVerdict {
  const cap = input.cap ?? decodedCapBytes;
  const sink = createCountingSink(cap);
  const started = Date.now();
  const deadline = started + input.budgetMs;
  const timedOut = (): boolean => Date.now() > deadline;

  if (input.format === 'xlsx' || input.format === 'docx') {
    const zip = zipDecoded(sink, input.bytes, deadline, cap);
    if (zip === 'timeout') return { kind: 'timeout' };
    if (zip === 'over') return { kind: 'over', decodedBytes: sink.total() };
    if (timedOut()) return { kind: 'timeout' };
    return { kind: 'within', decodedBytes: sink.total() };
  }

  if (input.format === 'xls' || input.format === 'doc') {
    if (oleDecoded(sink, input.bytes, deadline)) return { kind: 'timeout' };
    if (sink.crossed()) return { kind: 'over', decodedBytes: sink.total() };
    return { kind: 'within', decodedBytes: sink.total() };
  }

  const pdf = pdfDecoded(sink, input.bytes, deadline, cap);
  if (pdf === 'timeout') return { kind: 'timeout' };
  if (pdf === 'over') return { kind: 'over', decodedBytes: sink.total() };
  if (sink.crossed()) return { kind: 'over', decodedBytes: sink.total() };
  return { kind: 'within', decodedBytes: sink.total() };
}
