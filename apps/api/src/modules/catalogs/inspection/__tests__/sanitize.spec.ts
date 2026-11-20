// The sanitizer's own branches: the executable content it removes, the
// documents it refuses to rewrite, and the reopen verdict it answers
// (FR-032; contracts/intake-formats.md §5). The fixtures are the intake's
// shared ones, so the bytes the probe refuses are the bytes the sanitizer
// refuses too.
import { describe, expect, it } from 'vitest';
import { zipSync } from 'fflate';
import { PDFDocument, PDFName } from 'pdf-lib';
import { sanitize } from '../sanitize.ts';
import { inspectFormat } from '../format.ts';
import { decodedCapBytes } from '../cap.ts';
import {
  protectedXlsx,
  validXlsx,
  xlsWithOwnerProtection,
  xlsWorkbook,
  xlsxWithExternalLink,
  xlsxWithMacro,
} from '../../../../../test/fixtures/intake/fixtures.ts';

const encoder = new TextEncoder();

const contentTypes = encoder.encode(
  '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>',
);

const pdf = async (build: (document: PDFDocument) => void): Promise<Uint8Array> => {
  const document = await PDFDocument.create();
  document.addPage([200, 200]);
  build(document);
  return document.save({ useObjectStreams: false });
};

const budgets = { budgetMs: 10_000, reopenBudgetMs: 5_000 };

describe('the OOXML sanitizer', () => {
  it('keeps a clean workbook and reopens it as the declared format', async () => {
    const bytes = validXlsx();
    const verdict = await sanitize({
      bytes,
      format: 'xlsx',
      originalDecodedBytes: 0,
      ...budgets,
    });

    expect(verdict.kind).toBe('ok');
    if (verdict.kind !== 'ok') return;
    expect(verdict.decodedBytes).toBeGreaterThan(0);
    await expect(inspectFormat(verdict.bytes, 'xlsx', 5_000)).resolves.toEqual({
      kind: 'matches',
    });
  });

  it('removes the VBA part and the relationship that named it', async () => {
    const verdict = await sanitize({
      bytes: xlsxWithMacro(),
      format: 'xlsx',
      originalDecodedBytes: 0,
      ...budgets,
    });

    expect(verdict.kind).toBe('ok');
    if (verdict.kind !== 'ok') return;
    const text = Buffer.from(verdict.bytes).toString('latin1');
    expect(text).not.toContain('vbaProject');
    expect(text).not.toContain('macro bytes');
    await expect(inspectFormat(verdict.bytes, 'xlsx', 5_000)).resolves.toEqual({
      kind: 'matches',
    });
  });

  it('removes an external link part and its override', async () => {
    const verdict = await sanitize({
      bytes: xlsxWithExternalLink(),
      format: 'xlsx',
      originalDecodedBytes: 0,
      ...budgets,
    });

    expect(verdict.kind).toBe('ok');
    if (verdict.kind !== 'ok') return;
    const text = Buffer.from(verdict.bytes).toString('latin1');
    expect(text).not.toContain('externalLink');
    await expect(inspectFormat(verdict.bytes, 'xlsx', 5_000)).resolves.toEqual({
      kind: 'matches',
    });
  });

  it('refuses a workbook whose structure protection forbids the write', async () => {
    await expect(
      sanitize({
        bytes: protectedXlsx(),
        format: 'xlsx',
        originalDecodedBytes: 0,
        ...budgets,
      }),
    ).resolves.toEqual({ kind: 'failed', reason: 'unremovable' });
  });

  it('refuses a package the probe cannot reopen', async () => {
    await expect(
      sanitize({
        bytes: encoder.encode('not a package'),
        format: 'docx',
        originalDecodedBytes: 0,
        ...budgets,
      }),
    ).resolves.toEqual({ kind: 'failed', reason: 'reopen-failed' });
  });

  it('fails the reopen when the rewrite leaves no main part', async () => {
    const bytes = zipSync({
      '[Content_Types].xml': contentTypes,
      'xl/vbaProject.bin': encoder.encode('macro bytes'),
    });
    await expect(
      sanitize({ bytes, format: 'xlsx', originalDecodedBytes: 0, ...budgets }),
    ).resolves.toEqual({ kind: 'failed', reason: 'reopen-failed' });
  });

  it('refuses a package past the rewrite budget', async () => {
    await expect(
      sanitize({
        bytes: validXlsx(),
        format: 'xlsx',
        originalDecodedBytes: 0,
        budgetMs: -1,
        reopenBudgetMs: 5_000,
      }),
    ).resolves.toEqual({ kind: 'failed', reason: 'unremovable' });
  });
});

describe('the OLE2 sanitizer', () => {
  it('rewrites a workbook with a macro sheet and reopens it', async () => {
    const verdict = await sanitize({
      bytes: xlsWorkbook(true),
      format: 'xls',
      originalDecodedBytes: 0,
      ...budgets,
    });

    expect(verdict.kind).toBe('ok');
    if (verdict.kind !== 'ok') return;
    expect(verdict.decodedBytes).toBeGreaterThan(0);
    await expect(inspectFormat(verdict.bytes, 'xls', 5_000)).resolves.toEqual({
      kind: 'matches',
    });
  });

  it('keeps a workbook with no macro sheet byte-for-byte as the reader sees it', async () => {
    const verdict = await sanitize({
      bytes: xlsWorkbook(false),
      format: 'xls',
      originalDecodedBytes: 0,
      ...budgets,
    });

    expect(verdict.kind).toBe('ok');
    if (verdict.kind !== 'ok') return;
    await expect(inspectFormat(verdict.bytes, 'xls', 5_000)).resolves.toEqual({
      kind: 'matches',
    });
  });

  it('refuses an owner-protected workbook', async () => {
    await expect(
      sanitize({
        bytes: xlsWithOwnerProtection(),
        format: 'xls',
        originalDecodedBytes: 0,
        ...budgets,
      }),
    ).resolves.toEqual({ kind: 'failed', reason: 'unremovable' });
  });

  it('refuses bytes that do not open as a compound file', async () => {
    await expect(
      sanitize({
        bytes: encoder.encode('not a compound file'),
        format: 'doc',
        originalDecodedBytes: 0,
        ...budgets,
      }),
    ).resolves.toEqual({ kind: 'failed', reason: 'unremovable' });
  });
});

describe('the PDF sanitizer', () => {
  it('withdraws the catalog actions and every page annotation action', async () => {
    const bytes = await pdf((document) => {
      document.catalog.set(PDFName.of('OpenAction'), PDFName.of('JavaScript'));
      document.catalog.set(PDFName.of('AcroForm'), PDFName.of('JavaScript'));
      document.catalog.set(PDFName.of('Names'), PDFName.of('JavaScript'));
      const action = document.context.obj({ S: 'JavaScript' });
      const annot = document.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [0, 0, 10, 10],
        A: action,
      });
      document.getPages()[0]?.node.set(
        PDFName.of('Annots'),
        document.context.obj([annot]),
      );
      document.getPages()[0]?.node.set(PDFName.of('AA'), action);
    });

    const verdict = await sanitize({
      bytes,
      format: 'pdf',
      originalDecodedBytes: 123,
      ...budgets,
    });

    expect(verdict.kind).toBe('ok');
    if (verdict.kind !== 'ok') return;
    expect(verdict.decodedBytes).toBe(123);

    const reopened = await PDFDocument.load(verdict.bytes);
    for (const name of ['OpenAction', 'AcroForm', 'Names', 'AA', 'JavaScript', 'Launch']) {
      expect(reopened.catalog.has(PDFName.of(name))).toBe(false);
    }
    const page = reopened.getPages()[0];
    expect(page?.node.has(PDFName.of('AA'))).toBe(false);
    const annots = page?.node.lookup(PDFName.of('Annots')) as unknown as
      | { size(): number }
      | undefined;
    expect(annots?.size() ?? 0).toBe(0);

    await expect(inspectFormat(verdict.bytes, 'pdf', 5_000)).resolves.toEqual({
      kind: 'matches',
    });
  });

  it('refuses bytes that do not open as a PDF', async () => {
    await expect(
      sanitize({
        bytes: encoder.encode('not a pdf'),
        format: 'pdf',
        originalDecodedBytes: 0,
        ...budgets,
      }),
    ).resolves.toEqual({ kind: 'failed', reason: 'unremovable' });
  });

  it('refuses a sanitized decode past the cap', async () => {
    await expect(
      sanitize({
        bytes: await pdf(() => {}),
        format: 'pdf',
        originalDecodedBytes: decodedCapBytes + 1,
        ...budgets,
      }),
    ).resolves.toEqual({ kind: 'failed', reason: 'over-cap' });
  });
});



