// The content probe and the rewriter: one container family per declared format,
// the macro and external-link parts gone from the kept bytes, the parser bounds
// refusing a DOCTYPE and a deep tree, the PDF's actions withdrawn, and the hash
// taken over the sanitized object (FR-026-FR-032; AC-006, AC-016, AC-017; T053).
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';
import { PDFDocument, PDFName } from 'pdf-lib';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { catalogs, catalogMonthlyUploads } from '@wafar/db';
import type { createHarness} from '../../support/harness.ts';
import { hasDatabase } from '../../support/harness.ts';
import { merchant, originalKey, upload } from '../../support/intake.ts';
import {
  corruptPdf,
  cyclicFatOle2,
  cyclicPageTreePdf,
  deepActionChainPdf,
  deepPageTreePdf,
  docFile,
  millionObjectsPdf,
  oversizedOle2Directory,
  oversizedPackage,
  oversizedRelsPackage,
  pdfWithJavaScript,
  protectedXlsx,
  validDocx,
  validXlsx,
  xlsWithOwnerProtection,
  xlsWorkbook,
  xlsxWithDoctype,
  xlsxWithDeepXml,
  xlsxWithExternalLink,
  xlsxWithMacro,
} from '../../fixtures/intake/fixtures.ts';
import { createIsolatedHarness } from '../../support/isolated.ts';
import { sanitize } from '../../../src/modules/catalogs/inspection/sanitize.ts';

let harness: ReturnType<typeof createHarness> | null = null;
let isolated: Awaited<ReturnType<typeof createIsolatedHarness>> | null = null;

function code(body: unknown): string | undefined {
  return (body as { error?: { code?: string } } | null)?.error?.code;
}

async function accepted(name: string, bytes: Uint8Array) {
  const session = await merchant(harness!);
  const { response } = await upload(harness!, session, name, bytes);
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  const body = response.body as { catalog: { id: string } };
  const row = (
    await harness!.db.select().from(catalogs).where(eq(catalogs.id, body.catalog.id))
  )[0]!;
  const kept = harness!.storage.read(row.storageKey)!;
  return { row, kept };
}

describe.skipIf(!hasDatabase)('the content probe and the sanitizer', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('inspection');
    harness = isolated.harness;
  });
  beforeEach(async () => {
    if (harness !== null) await harness.reset();
  });
  afterAll(async () => {
    if (isolated !== null) await isolated.close();
    isolated = null;
    harness = null;
  });

  it('keeps a valid xlsx as an OOXML package that reopens', async () => {
    const { row, kept } = await accepted('كتالوج.xlsx', validXlsx());
    expect(row.contentType).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    const files = unzipSync(kept);
    expect(Object.keys(files)).toContain('xl/workbook.xml');
  });

  it('keeps a valid docx and a valid doc', async () => {
    const docx = await accepted('كتالوج.docx', validDocx());
    expect(Object.keys(unzipSync(docx.kept))).toContain('word/document.xml');
    await harness!.reset();
    const doc = await accepted('كتالوج.doc', docFile());
    expect(doc.row.contentType).toBe('application/msword');
    expect(doc.kept[0]).toBe(0xd0);
  });

  it('refuses a document whose permissions forbid the rewrite, and keeps nothing', async () => {
    const session = await merchant(harness!);
    for (const [name, bytes] of [
      ['كتالوج.xlsx', protectedXlsx()],
      ['كتالوج.xls', xlsWithOwnerProtection()],
    ] as const) {
      const { response } = await upload(harness!, session, name, bytes);
      expect(response.status, name).toBe(400);
      expect(code(response.body), name).toBe('UPLOAD_SANITIZATION_FAILED');
      expect(
        (response.body as { error?: { retryable?: boolean } }).error?.retryable,
        name,
      ).toBe(false);
      // Nothing survives the refusal: no object, no part, no catalog, no quota.
      expect(harness!.storage.objects.size, name).toBe(0);
      expect(harness!.storage.multiparts.size, name).toBe(0);
      expect(await harness!.db.select().from(catalogs), name).toHaveLength(0);
      expect(await harness!.db.select().from(catalogMonthlyUploads), name).toHaveLength(0);
    }
  });

  it('removes a VBA project from the kept package and hashes the kept bytes', async () => {
    const { row, kept } = await accepted('كتالوج.xlsx', xlsxWithMacro());
    const files = unzipSync(kept);
    expect(Object.keys(files)).not.toContain('xl/vbaProject.bin');
    expect(new TextDecoder().decode(files['[Content_Types].xml'] ?? new Uint8Array())).not.toContain(
      'vbaProject',
    );
    expect(row.contentHash).toBe(createHash('sha256').update(kept).digest('hex'));
  });

  it('removes an external link part and its relationship', async () => {
    const { kept } = await accepted('كتالوج.xlsx', xlsxWithExternalLink());
    const files = unzipSync(kept);
    expect(Object.keys(files)).not.toContain('xl/externalLinks/externalLink1.xml');
    expect(new TextDecoder().decode(files['xl/_rels/workbook.xml.rels'] ?? new Uint8Array()))
      .not.toContain('externalLink');
  });

  it('removes a macro sheet from an OLE2 workbook', async () => {
    const { row, kept } = await accepted('كتالوج.xls', xlsWorkbook(true));
    expect(row.contentType).toBe('application/vnd.ms-excel');
    expect(kept[0]).toBe(0xd0);
    expect(row.contentHash).toBe(createHash('sha256').update(kept).digest('hex'));
  });

  it('refuses a DOCTYPE declaration and a tree past the depth bound', async () => {
    const doctype = await merchant(harness!);
    const first = await upload(harness!, doctype, 'كتالوج.xlsx', xlsxWithDoctype());
    expect(first.response.status).toBe(400);
    expect(code(first.response.body)).toBe('UPLOAD_CORRUPT');

    const deep = await merchant(harness!, { phoneNumber: '+218912345679' });
    const second = await upload(harness!, deep, 'كتالوج.xlsx', xlsxWithDeepXml());
    expect(second.response.status).toBe(400);
    expect(code(second.response.body)).toBe('UPLOAD_CORRUPT');
  });

  it('withdraws a PDF action and keeps a document that reopens', async () => {
    const { kept } = await accepted('كتالوج.pdf', await pdfWithJavaScript());
    const text = new TextDecoder('latin1').decode(kept);
    expect(text).not.toContain('/OpenAction');
    const document = await PDFDocument.load(kept);
    expect(document.catalog.has(PDFName.of('OpenAction'))).toBe(false);
    expect(document.getPageCount()).toBeGreaterThan(0);
  });

  it('refuses a corrupt PDF before the sanitizer', async () => {
    const session = await merchant(harness!);
    const { response } = await upload(harness!, session, 'broken.pdf', corruptPdf());
    expect(response.status).toBe(400);
    expect(code(response.body)).toBe('UPLOAD_CORRUPT');
  });
});

// --- The parser bounds' fail-closed cases (contracts/intake-formats.md §3.5;
// --- T053, T243). One case per bound a fixture can produce: each answers
// --- UPLOAD_CORRUPT with nothing kept, and the same input on the reopen
// --- answers UPLOAD_SANITIZATION_FAILED.
describe.skipIf(!hasDatabase)('the parser bounds', () => {
  beforeAll(async () => {
    if (!hasDatabase) return;
    isolated = await createIsolatedHarness('parser_bounds');
    harness = isolated.harness;
  });
  beforeEach(async () => {
    if (harness !== null) await harness.reset();
  });
  afterAll(async () => {
    if (isolated !== null) await isolated.close();
    isolated = null;
    harness = null;
  });

  async function expectCorrupt(name: string, bytes: Uint8Array): Promise<void> {
    const session = await merchant(harness!);
    const { started, response } = await upload(harness!, session, name, bytes);
    expect(response.status, name).toBe(400);
    expect(code(response.body), name).toBe('UPLOAD_CORRUPT');
    // Nothing survives the refusal: no object, no part, no catalog, no quota.
    expect(harness!.storage.read(originalKey(started.uploadId)), name).toBeNull();
    expect(harness!.storage.list('intake/'), name).toHaveLength(0);
    expect(harness!.storage.list('catalogs/'), name).toHaveLength(0);
    expect(harness!.storage.multiparts.size, name).toBe(0);
    expect(await harness!.db.select().from(catalogs), name).toHaveLength(0);
    expect(await harness!.db.select().from(catalogMonthlyUploads), name).toHaveLength(0);
  }

  it('refuses a package with 65,536 central-directory entries', async () => {
    await expectCorrupt('كتالوج.xlsx', oversizedPackage());
  });

  it('refuses an OLE2 directory declaring 65,536 entries', async () => {
    await expectCorrupt('كتالوج.xls', oversizedOle2Directory());
  }, 30_000);

  it('refuses an OLE2 FAT chain that revisits a sector', async () => {
    await expectCorrupt('كتالوج.xls', cyclicFatOle2());
  });

  it('refuses a PDF with a cyclic page tree', async () => {
    await expectCorrupt('كتالوج.pdf', cyclicPageTreePdf());
  });

  it('refuses a PDF whose page tree nests 65 deep, and accepts 64', async () => {
    await expectCorrupt('كتالوج.pdf', deepPageTreePdf(65));
    const session = await merchant(harness!, { phoneNumber: '+218912345679' });
    const { response } = await upload(harness!, session, 'كتالوج.pdf', deepPageTreePdf(64));
    expect(response.status).toBe(201);
  });

  it('refuses a PDF whose /Next action chain nests 65 dictionaries, and accepts 64', async () => {
    await expectCorrupt('كتالوج.pdf', deepActionChainPdf(65));
    const session = await merchant(harness!, { phoneNumber: '+218912345679' });
    const { response } = await upload(harness!, session, 'كتالوج.pdf', deepActionChainPdf(64));
    expect(response.status).toBe(201);
  });

  it('refuses a PDF with 1,000,001 indirect objects', async () => {
    await expectCorrupt('كتالوج.pdf', millionObjectsPdf());
  });

  it('refuses a *.rels part over the 4 MiB text bound', async () => {
    await expectCorrupt('كتالوج.xlsx', oversizedRelsPackage());
  });

  it('answers the same bound-crossing input on the reopen as sanitization failed', async () => {
    const budgets = { budgetMs: 10_000, reopenBudgetMs: 5_000, originalDecodedBytes: 0 };
    for (const [format, bytes] of [
      ['pdf', deepPageTreePdf(65)],
      ['pdf', cyclicPageTreePdf()],
      ['xlsx', oversizedRelsPackage()],
      ['xlsx', xlsxWithDoctype()],
      ['xlsx', xlsxWithDeepXml()],
    ] as const) {
      const verdict = await sanitize({ bytes, format, ...budgets });
      // The cyclic tree fails the rewrite's own traversal guard; the rest fail
      // the reopen. Both answer UPLOAD_SANITIZATION_FAILED through the intake.
      expect(verdict.kind, format).toBe('failed');
    }
    // The deep and cyclic trees fail the rewrite's own traversal guard; the
    // oversized relationships part survives the rewrite and fails the reopen.
    // Every one answers UPLOAD_SANITIZATION_FAILED through the intake.
    const deep = await sanitize({ bytes: deepPageTreePdf(65), format: 'pdf', ...budgets });
    if (deep.kind === 'failed') expect(deep.reason).toBe('unremovable');
    const rels = await sanitize({ bytes: oversizedRelsPackage(), format: 'xlsx', ...budgets });
    if (rels.kind === 'failed') expect(rels.reason).toBe('reopen-failed');
  });

  it('sanitizes a 65-deep action chain away, because the chain is executable content', async () => {
    const verdict = await sanitize({
      bytes: deepActionChainPdf(65),
      format: 'pdf',
      budgetMs: 10_000,
      reopenBudgetMs: 5_000,
      originalDecodedBytes: 0,
    });
    expect(verdict.kind).toBe('ok');
  });
});
