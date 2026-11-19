// The intake's test fixtures: valid, corrupt, encrypted, macro, external-link,
// and expansion documents, built deterministically, so a suite never reads a
// binary blob it cannot explain (T009).
import { zipSync } from 'fflate';
import * as CFB from 'cfb';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { deflateSync } from 'node:zlib';

const encoder = new TextEncoder();

export async function validPdf(text = 'Supplier catalog'): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const page = document.addPage();
  page.drawText(text, { x: 40, y: 700, size: 14 });
  return document.save();
}

export function corruptPdf(): Uint8Array {
  return encoder.encode('%PDF-1.7\nthis is not a document');
}

/** A PDF whose trailer names an /Encrypt dictionary, so a parse needs a password. */
export function encryptedPdf(): Uint8Array {
  return encoder.encode(
    [
      '%PDF-1.7',
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj',
      '4 0 obj << /Filter /Standard /V 2 /R 3 /O <00> /U <00> /P -4 >> endobj',
      'trailer << /Root 1 0 R /Encrypt 4 0 R /Size 5 >>',
      '%%EOF',
    ].join('\n'),
  );
}

/** A PDF carrying JavaScript and an /OpenAction action dictionary. */
export async function pdfWithJavaScript(): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.addPage();
  const context = document.context;
  const script = context.obj({
    Type: 'Action',
    S: 'JavaScript',
    JS: PDFString.of('app.alert("hello")'),
  });
  document.catalog.set(PDFName.of('OpenAction'), context.register(script));
  return document.save();
}

function contentTypes(parts: string[]): Uint8Array {
  return encoder.encode(
    `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">${parts
      .map((part) => `<Override PartName="/${part}" ContentType="application/octet-stream"/>`)
      .join('')}</Types>`,
  );
}

const workbookXml = encoder.encode(
  '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets><sheet name="Sheet1" sheetId="1"/></sheets></workbook>',
);

const documentXml = encoder.encode(
  '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body/></w:document>',
);

export function validXlsx(): Uint8Array {
  return zipSync({
    '[Content_Types].xml': contentTypes(['xl/workbook.xml']),
    'xl/workbook.xml': workbookXml,
  });
}

/**
 * An OOXML workbook whose structure protection forbids the write without its
 * password: it opens as a spreadsheet but cannot be rewritten (FR-032).
 */
export function protectedXlsx(): Uint8Array {
  return zipSync({
    '[Content_Types].xml': contentTypes(['xl/workbook.xml']),
    'xl/workbook.xml': encoder.encode(
      '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><workbookProtection lockStructure="1"/><sheets><sheet name="Sheet1" sheetId="1"/></sheets></workbook>',
    ),
  });
}

export function validDocx(): Uint8Array {
  return zipSync({
    '[Content_Types].xml': contentTypes(['word/document.xml']),
    'word/document.xml': documentXml,
  });
}

/** An OOXML package that holds no document of the declared type. */
export function mismatchedXlsx(): Uint8Array {
  return zipSync({
    '[Content_Types].xml': contentTypes(['xl/workbook.xml']),
    'docProps/core.xml': encoder.encode('<core/>'),
  });
}

/** An OOXML package carrying a VBA project and its relationship. */
export function xlsxWithMacro(): Uint8Array {
  return zipSync({
    '[Content_Types].xml': contentTypes([
      'xl/workbook.xml',
      'xl/vbaProject.bin',
    ]),
    'xl/workbook.xml': workbookXml,
    'xl/vbaProject.bin': encoder.encode('macro bytes'),
    'xl/_rels/workbook.xml.rels': encoder.encode(
      '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" Target="vbaProject.bin"/></Relationships>',
    ),
  });
}

/** An OOXML package carrying an external link part and its relationship. */
export function xlsxWithExternalLink(): Uint8Array {
  return zipSync({
    '[Content_Types].xml': contentTypes([
      'xl/workbook.xml',
      'xl/externalLinks/externalLink1.xml',
    ]),
    'xl/workbook.xml': workbookXml,
    'xl/externalLinks/externalLink1.xml': encoder.encode('<externalLink/>'),
    'xl/_rels/workbook.xml.rels': encoder.encode(
      '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLink" Target="externalLinks/externalLink1.xml"/></Relationships>',
    ),
  });
}

/** An OOXML part whose XML declares a DOCTYPE, i.e. a parser bound crossed. */
export function xlsxWithDoctype(): Uint8Array {
  return zipSync({
    '[Content_Types].xml': contentTypes(['xl/workbook.xml']),
    'xl/workbook.xml': encoder.encode(
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY a "aaaaaaaaaa"><!ENTITY b "&a;&a;&a;">]><workbook>&b;</workbook>',
    ),
  });
}

/** An XML part nested past the 64-deep bound. */
export function xlsxWithDeepXml(): Uint8Array {
  const open = '<a>'.repeat(65);
  const close = '</a>'.repeat(65);
  return zipSync({
    '[Content_Types].xml': contentTypes(['xl/workbook.xml']),
    'xl/workbook.xml': encoder.encode(`<?xml version="1.0"?>${open}x${close}`),
  });
}

// --- OLE2 workbooks --------------------------------------------------------

const BOF = Buffer.from([0x09, 0x08, 0x10, 0x00, 0x00, 0x06, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const EOF = Buffer.from([0x0a, 0x00, 0x00, 0x00]);

function boundsheet(position: number, type: number): Buffer {
  const record = Buffer.alloc(4 + 8);
  record.writeUInt16LE(0x0085, 0);
  record.writeUInt16LE(8, 2);
  record.writeUInt32LE(position, 4);
  record.writeUInt16LE(0, 8);
  record.writeUInt8(type, 10);
  record.writeUInt8(0, 11);
  return record;
}

/** An `.xls` compound file with one worksheet and, optionally, one macro sheet. */
export function xlsWorkbook(withMacro: boolean): Uint8Array {
  // The first sheet's substream starts right after the BOF; the macro sheet's
  // follows the first sheet's EOF.
  const bofLength = BOF.byteLength;
  const sheet1Start = bofLength + 4 + 8 + 4 + 8;
  const sheet1 = Buffer.concat([BOF, EOF]);
  const macrosStart = sheet1Start + sheet1.byteLength;
  const parts = [BOF, boundsheet(sheet1Start, 0x00)];
  if (withMacro) parts.push(boundsheet(macrosStart, 0x01));
  parts.push(EOF, sheet1);
  if (withMacro) parts.push(BOF, EOF);
  const workbook = Buffer.concat(parts);

  const compound = CFB.utils.cfb_new();
  CFB.utils.cfb_add(compound, '/Workbook', workbook);
  return new Uint8Array(CFB.write(compound, { type: 'buffer' }));
}

const WRITEPROT = Buffer.from([0x86, 0x00, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00]);

/**
 * An OLE2 workbook whose `WRITEPROT` record sets write protection with no user
 * password: it opens as a workbook but cannot be rewritten (FR-032).
 */
export function xlsWithOwnerProtection(): Uint8Array {
  const sheet1 = Buffer.concat([BOF, EOF]);
  const sheet1Start =
    BOF.byteLength + WRITEPROT.byteLength + boundsheet(0, 0).byteLength + EOF.byteLength;
  const workbook = Buffer.concat([
    BOF,
    WRITEPROT,
    boundsheet(sheet1Start, 0x00),
    EOF,
    sheet1,
  ]);
  const compound = CFB.utils.cfb_new();
  CFB.utils.cfb_add(compound, '/Workbook', workbook);
  return new Uint8Array(CFB.write(compound, { type: 'buffer' }));
}

/** A `.doc` compound file carrying a WordDocument stream. */export function docFile(): Uint8Array {
  const compound = CFB.utils.cfb_new();
  CFB.utils.cfb_add(compound, '/WordDocument', Buffer.from('word bytes'));
  return new Uint8Array(CFB.write(compound, { type: 'buffer' }));
}

// --- Expansion fixtures ----------------------------------------------------
//
// A document whose decoded content is far larger than its stored bytes. The
// member is a run of one repeated byte, so it compresses to almost nothing and
// expands to `memberBytes` when inflated. A suite measures it against a small
// cap to prove the refusal happens while the content expands, not after every
// member has been allocated (FR-029, FR-031; AC-016; T009, T054).

/** An OOXML package whose single data member expands to `memberBytes`. */
export function expandingXlsx(memberBytes: number): Uint8Array {
  return zipSync(
    {
      '[Content_Types].xml': contentTypes(['xl/workbook.xml']),
      'xl/workbook.xml': workbookXml,
      'xl/media/expansion.bin': new Uint8Array(memberBytes),
    },
    { level: 9 },
  );
}

/** A PDF whose one FlateDecode stream inflates to `streamBytes`. */
export function expandingPdf(streamBytes: number): Uint8Array {
  const compressed = deflateSync(Buffer.alloc(streamBytes, 0x41), { level: 9 });
  return new Uint8Array(
    Buffer.concat([
      Buffer.from('%PDF-1.7\n1 0 obj << /Length ' + compressed.byteLength + ' /Filter /FlateDecode >>\nstream\n', 'latin1'),
      compressed,
      Buffer.from('\nendstream\nendobj\ntrailer << /Size 2 >>\n%%EOF', 'latin1'),
    ]),
  );
}

// --- Parser-bound fixtures (contracts/intake-formats.md §3.5; T053, T243) -----
//
// One fixture per bound a hostile file can cross. Each is small enough to build
// deterministically, and each answers UPLOAD_CORRUPT in the probe — except the
// same input on the reopen, which answers UPLOAD_SANITIZATION_FAILED.

/** An OOXML package whose central directory declares 65,536 members (65,535 is the bound). */
export function oversizedPackage(): Uint8Array {
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': contentTypes(['xl/workbook.xml']),
    'xl/workbook.xml': workbookXml,
  };
  for (let index = 0; index < 65_536; index += 1) {
    files[`xl/parts/p${index}.xml`] = new Uint8Array(0);
  }
  return zipSync(files, { level: 0 });
}

/** An OLE2 compound file whose directory holds 65,536 entries (65,535 is the bound). */
export function oversizedOle2Directory(): Uint8Array {
  // The directory is built sector by sector: 65,536 entries of 128 bytes over a
  // 4096-byte sector size, chained through the FAT, with the stream entries
  // linked as a balanced tree so the reader enumerates every one.
  const sectorSize = 4096;
  const entryCount = 65_536;
  const dirSectors = (entryCount * 128) / sectorSize; // 2048
  const fatSectors = 3;
  const totalSectors = fatSectors + dirSectors;
  // A version-4 file's first sector starts at offset 4096, after the header.
  const file = Buffer.alloc(sectorSize + totalSectors * sectorSize, 0);
  Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]).copy(file, 0);
  file.writeUInt16LE(0x003e, 24); // minor version
  file.writeUInt16LE(4, 26); // major version 4: 4096-byte sectors
  file.writeUInt16LE(0xfffe, 28); // byte order
  file.writeUInt16LE(12, 30); // sector shift: 4096
  file.writeUInt16LE(6, 32); // mini sector shift
  file.writeUInt32LE(dirSectors, 40); // number of directory sectors
  file.writeUInt32LE(fatSectors, 44);
  file.writeUInt32LE(fatSectors, 48); // first directory sector
  file.writeUInt32LE(0, 52); // transaction signature
  file.writeUInt32LE(0x1000, 56); // mini stream cutoff
  file.writeUInt32LE(0xfffffffe, 60); // first mini FAT sector: none
  file.writeUInt32LE(0, 64); // number of mini FAT sectors
  file.writeUInt32LE(0xfffffffe, 68); // first DIFAT sector: none
  file.writeUInt32LE(0, 72); // number of DIFAT sectors
  for (let index = 0; index < fatSectors; index += 1) {
    file.writeUInt32LE(index, 76 + index * 4);
  }
  for (let index = fatSectors; index < 109; index += 1) {
    file.writeUInt32LE(0xffffffff, 76 + index * 4);
  }
  // The FAT: the first three sectors are FAT sectors, the directory chain runs
  // from sector 3 to the last sector, then ends.
  const fatBase = sectorSize;
  for (let index = 0; index < fatSectors; index += 1) {
    file.writeUInt32LE(0xfffffffd, fatBase + index * 4);
  }
  for (let sector = fatSectors; sector < totalSectors; sector += 1) {
    const next = sector + 1 < totalSectors ? sector + 1 : 0xfffffffe;
    file.writeUInt32LE(next, fatBase + sector * 4);
  }
  for (let sector = totalSectors; sector < fatSectors * (sectorSize / 4); sector += 1) {
    file.writeUInt32LE(0xffffffff, fatBase + sector * 4);
  }
  // The directory entries: entry 0 is the Root Entry; entries 1..65,535 are
  // empty streams linked as a balanced binary tree under the root's child.
  const dirBase = sectorSize + fatSectors * sectorSize;
  const writeEntry = (index: number, name: string, type: number): void => {
    const offset = dirBase + index * 128;
    const nameBuf = Buffer.from(`${name}\0`, 'utf16le');
    nameBuf.copy(file, offset);
    file.writeUInt16LE(nameBuf.byteLength, offset + 64);
    file.writeUInt8(type, offset + 66);
    file.writeUInt8(1, offset + 67); // black
    file.writeUInt32LE(0xffffffff, offset + 68); // left
    file.writeUInt32LE(0xffffffff, offset + 72); // right
    file.writeUInt32LE(0xffffffff, offset + 76); // child
    file.writeUInt32LE(0xfffffffe, offset + 116); // start: end of chain
    file.writeUInt32LE(0, offset + 120); // size
  };
  writeEntry(0, 'Root Entry', 5);
  for (let index = 1; index < entryCount; index += 1) {
    writeEntry(index, `f${index}`, 2);
  }
  const linkTree = (lo: number, hi: number): number => {
    if (lo > hi) return 0xffffffff;
    const mid = Math.floor((lo + hi) / 2);
    const offset = dirBase + mid * 128;
    file.writeUInt32LE(linkTree(lo, mid - 1), offset + 68);
    file.writeUInt32LE(linkTree(mid + 1, hi), offset + 72);
    return mid;
  };
  file.writeUInt32LE(linkTree(1, entryCount - 1), dirBase + 76); // root's child
  return new Uint8Array(file);
}

/**
 * A minimal OLE2 file whose directory sector's FAT entry points back at itself:
 * a sector chain that revisits a sector, which the visited-set walk answers
 * corrupt rather than following forever.
 */
export function cyclicFatOle2(): Uint8Array {
  const sectorSize = 512;
  const file = Buffer.alloc(512 + 2 * sectorSize, 0);
  // The header: magic, sector shift 9, one FAT sector, the directory at sector 1.
  Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]).copy(file, 0);
  file.writeUInt16LE(0x003e, 24); // minor version
  file.writeUInt16LE(3, 26); // major version 3: 512-byte sectors
  file.writeUInt16LE(0xfffe, 28); // byte order
  file.writeUInt16LE(9, 30); // sector shift
  file.writeUInt16LE(6, 32); // mini sector shift
  file.writeUInt32LE(0, 40); // number of directory sectors (v3: zero)
  file.writeUInt32LE(1, 44); // number of FAT sectors
  file.writeUInt32LE(1, 48); // first directory sector
  file.writeUInt32LE(0, 52); // transaction signature
  file.writeUInt32LE(0x1000, 56); // mini stream cutoff
  file.writeUInt32LE(0xfffffffe, 60); // first mini FAT sector: end of chain
  file.writeUInt32LE(0, 64); // number of mini FAT sectors
  file.writeUInt32LE(0xfffffffe, 68); // first DIFAT sector: none
  file.writeUInt32LE(0, 72); // number of DIFAT sectors
  file.writeUInt32LE(0, 76); // DIFAT[0]: the FAT lives at sector 0
  for (let index = 1; index < 109; index += 1) {
    file.writeUInt32LE(0xffffffff, 76 + index * 4); // free DIFAT entries
  }
  // The FAT (sector 0): sector 0 is a FAT sector, sector 1 chains to itself.
  const fat = 512;
  file.writeUInt32LE(0xfffffffd, fat + 0); // FATSECT
  file.writeUInt32LE(1, fat + 4); // the directory sector revisits itself
  for (let index = 2; index < sectorSize / 4; index += 1) {
    file.writeUInt32LE(0xffffffff, fat + index * 4);
  }
  // The directory (sector 1): one Root Entry, so the chain is the only structure.
  const dir = 512 + sectorSize;
  const rootName = Buffer.from('Root Entry\0', 'utf16le');
  rootName.copy(file, dir);
  file.writeUInt16LE(rootName.byteLength + 2, dir + 64);
  file.writeUInt8(5, dir + 66); // root storage
  file.writeUInt8(1, dir + 67); // black
  file.writeUInt32LE(0xffffffff, dir + 68); // left sibling
  file.writeUInt32LE(0xffffffff, dir + 72); // right sibling
  file.writeUInt32LE(0xffffffff, dir + 76); // child
  file.writeUInt32LE(0xfffffffe, dir + 116); // start sector: end of chain
  file.writeUInt32LE(0, dir + 120); // size
  return new Uint8Array(file);
}

/** Assembles a PDF from raw object bodies, one indirect object per body. */
function pdfFromObjects(objects: string[]): Uint8Array {
  const parts = ['%PDF-1.7'];
  objects.forEach((body, index) => {
    parts.push(`${index + 1} 0 obj\n${body}\nendobj`);
  });
  parts.push(`trailer << /Root 1 0 R /Size ${objects.length + 1} >>`, '%%EOF');
  return encoder.encode(parts.join('\n'));
}

/** A PDF whose page tree is cyclic: the /Pages node names itself among its /Kids. */
export function cyclicPageTreePdf(): Uint8Array {
  return pdfFromObjects([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [2 0 R] /Count 1 >>',
  ]);
}

/** A PDF whose page tree nests `depth` levels (64 is the bound; the leaf counts). */
export function deepPageTreePdf(depth: number): Uint8Array {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>'];
  for (let level = 2; level < depth + 1; level += 1) {
    objects.push(`<< /Type /Pages /Kids [${level + 1} 0 R] /Count 1 >>`);
  }
  objects.push(
    `<< /Type /Page /Parent ${depth} 0 R /MediaBox [0 0 612 792] >>`,
  );
  return pdfFromObjects(objects);
}

/**
 * A PDF whose /OpenAction reaches `count` action dictionaries through /Next
 * (64 is the bound): the /Next chain and the action nesting are one walk.
 */
export function deepActionChainPdf(count: number): Uint8Array {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R /OpenAction 4 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>',
  ];
  for (let index = 0; index < count; index += 1) {
    const next = index + 1 < count ? ` /Next ${index + 5} 0 R` : '';
    objects.push(`<< /S /JavaScript /JS (x)${next} >>`);
  }
  return pdfFromObjects(objects);
}

/** A PDF declaring 1,000,001 indirect objects (1,000,000 is the bound). */
export function millionObjectsPdf(): Uint8Array {
  const parts = ['%PDF-1.7'];
  for (let index = 0; index < 1_000_001; index += 1) {
    parts.push(`${index + 1} 0 obj\n<<>>\nendobj`);
  }
  parts.push('trailer << /Root 1 0 R /Size 1000002 >>', '%%EOF');
  return encoder.encode(parts.join('\n'));
}

/** An OOXML package whose `*.rels` part alone exceeds the 4 MiB text bound. */
export function oversizedRelsPackage(): Uint8Array {
  const padding = 'x'.repeat(4 * 1024 * 1024 + 1);
  return zipSync({
    '[Content_Types].xml': contentTypes(['xl/workbook.xml']),
    'xl/workbook.xml': workbookXml,
    'xl/worksheets/sheet1.xml': encoder.encode('<worksheet/>'),
    // The relationship keeps the part through the sanitizer's rewrite, so the
    // reopen reads the same oversized text the probe refused.
    'xl/_rels/workbook.xml.rels': encoder.encode(
      `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><!--${padding}--></Relationships>`,
    ),
  });
}

/**
 * A package whose central directory declares a member larger than the 1 GiB
 * decoded cap while the stored bytes stay small: the declared-size pre-scan
 * refuses it before any member is inflated (FR-031; AC-016).
 */
export function declaredBombXlsx(withMacro = false): Uint8Array {
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': contentTypes(
      withMacro ? ['xl/workbook.xml', 'xl/vbaProject.bin'] : ['xl/workbook.xml'],
    ),
    'xl/workbook.xml': workbookXml,
    'xl/media/expansion.bin': new Uint8Array(1024),
  };
  if (withMacro) files['xl/vbaProject.bin'] = encoder.encode('macro bytes');
  const bytes = zipSync(files, { level: 9 });
  // Patch every central-directory entry's uncompressed size to 1 GiB + 1, so
  // the declared total crosses the cap without inflating a byte.
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = 0; offset + 4 <= bytes.byteLength; offset += 1) {
    if (view.getUint32(offset, true) === 0x02014b50) {
      view.setUint32(offset + 24, 0x40000001, true);
    }
  }
  return bytes;
}
