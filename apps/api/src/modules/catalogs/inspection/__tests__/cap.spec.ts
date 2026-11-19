// The decoded-size cap's unit contract: a PDF stream and an OOXML package over
// a small cap are refused as expansion-cap failures, the same file under the
// cap is measured, and an expired budget is the timeout cause (FR-029, FR-031,
// AC-016; T054).
import { deflateSync } from 'node:zlib';
import { zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { measureDecoded } from '../cap.ts';
import { inspectFormat } from '../format.ts';
import { sanitize } from '../sanitize.ts';

function pdfWithInflatedStream(size: number): Uint8Array {
  const compressed = deflateSync(Buffer.alloc(size, 0x41));
  return new Uint8Array(
    Buffer.concat([
      Buffer.from('%PDF-1.7\nstream\n', 'latin1'),
      compressed,
      Buffer.from('\nendstream\n', 'latin1'),
    ]),
  );
}

function boundedXlsx(): Uint8Array {
  return zipSync({
    '[Content_Types].xml': new TextEncoder().encode(
      '<Types><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>',
    ),
    'xl/workbook.xml': new Uint8Array(256),
  });
}

describe('the decoded-size cap', () => {
  it('refuses a PDF whose inflated streams cross the cap', () => {
    const verdict = measureDecoded({
      bytes: pdfWithInflatedStream(4096),
      format: 'pdf',
      budgetMs: 1_000,
      cap: 1024,
    });
    expect(verdict.kind).toBe('over');
  });

  it('measures a PDF that stays inside the cap', () => {
    const verdict = measureDecoded({
      bytes: pdfWithInflatedStream(4096),
      format: 'pdf',
      budgetMs: 1_000,
      cap: 8_192,
    });
    expect(verdict).toEqual({ kind: 'within', decodedBytes: 4096 });
  });

  it('refuses an OOXML package whose declared members cross the cap', () => {
    const verdict = measureDecoded({
      bytes: boundedXlsx(),
      format: 'xlsx',
      budgetMs: 1_000,
      cap: 10,
    });
    expect(verdict.kind).toBe('over');
  });

  it('answers an expired budget as the timeout cause', () => {
    const verdict = measureDecoded({
      bytes: boundedXlsx(),
      format: 'xlsx',
      budgetMs: -1,
    });
    expect(verdict.kind).toBe('timeout');
  });

  it('answers an expired probe budget as the corrupt cause', async () => {
    const verdict = await inspectFormat(boundedXlsx(), 'xlsx', -1);
    expect(verdict.kind).toBe('corrupt');
  });

  it('answers an expired sanitizer budget as the sanitization cause', async () => {
    const result = await sanitize({
      bytes: boundedXlsx(),
      format: 'xlsx',
      budgetMs: -1,
      reopenBudgetMs: 1_000,
      originalDecodedBytes: 0,
    });
    expect(result).toEqual({ kind: 'failed', reason: 'unremovable' });
  });

  it('counts the sanitized members it writes instead of taking a second read', async () => {
    const result = await sanitize({
      bytes: boundedXlsx(),
      format: 'xlsx',
      budgetMs: 1_000,
      reopenBudgetMs: 1_000,
      originalDecodedBytes: 0,
    });
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') expect(result.decodedBytes).toBeGreaterThan(0);
  });
});
