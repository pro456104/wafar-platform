# Contract — Intake Formats, Content Checks, and Sanitization

**Feature**: `002-file-intake` | **Date**: 2026-11-13 | **Plan**: [plan.md](../plan.md) | **Data model**: [data-model.md](../data-model.md)

This contract fixes what "the file's content matches its declared format" means
for the five accepted extensions, how each container is opened, what the
decoded-size cap measures, and exactly what the sanitizer removes. It is the
per-format table the file-ingestion deferred area names (plan → Gate 3): the
rules are data a test can assert, not prose a developer interprets. The HTTP
status each refusal carries is [`intake-api.md`](./intake-api.md) §3; the page's
message is [`ui-contracts.md`](./ui-contracts.md) §4.

The set of libraries that implement this contract is CMV row 12 and ADR-171:
`fflate` (OOXML), `cfb` (OLE2), `pdf-lib` (PDF), with Node's `crypto` and
`zlib`.

## 1. The format table

| Extension | Canonical content type | Container | Leading signature | Document probe | Cap measurement |
|---|---|---|---|---|---|
| `.xls` | `application/vnd.ms-excel` | OLE2 compound file | `D0 CF 11 E0 A1 B1 1A E1` | `Workbook` (BIFF8) or `Book` (BIFF5) stream | Sum of the directory's stream sizes |
| `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | ZIP (OOXML) | `PK\x03\x04` | `[Content_Types].xml` names the spreadsheet main part | Sum of the central directory's uncompressed sizes, then the actual inflated bytes |
| `.doc` | `application/msword` | OLE2 compound file | `D0 CF 11 E0 A1 B1 1A E1` | `WordDocument` stream | Sum of the directory's stream sizes |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | ZIP (OOXML) | `PK\x03\x04` | `[Content_Types].xml` names the document main part | Sum of the central directory's uncompressed sizes, then the actual inflated bytes |
| `.pdf` | `application/pdf` | PDF | `%PDF-` inside the first 1024 bytes | A parseable cross-reference table and document catalog | Every stream's decoded bytes, Flate streams inflated |

- The canonical content type is the one the record stores (data-model §2); the
  browser's `File.type` is never stored and never trusted.
- `.xlsm`, `.docm`, and every other extension are **not** accepted: the name's
  last suffix is not one of the five, so they are refused as
  `UPLOAD_UNSUPPORTED_FORMAT` before any byte (FR-021). A macro-enabled file
  renamed to an accepted extension is still screened by §4, and a legacy Excel
  4.0 macro sheet is a macro form of its own that lives in the `Workbook` stream
  rather than in a VBA storage (§4.2).

## 2. The name check (FR-021, FR-026)

The check runs on the name exactly as supplied. The name is never normalized,
trimmed, or rewritten (FR-036).

### 2.1 The extension

- The extension is the text after the name's **last** dot, compared after
  folding only the ASCII letters `A`–`Z` to lower case. The rule presumes a name
  of at least one character.
- An **empty name** is not read for an extension at all: it carries no dot and
  no suffix, and the name check refuses it as `UPLOAD_INVALID_NAME` before this
  rule is reached (FR-021, FR-026).
- `كتالوج.XLSX` → `xlsx`; `catalog.pdf.exe` → `exe` (refused); `catalog.` → an
  empty **suffix** (refused); `catalog` → no dot (refused); `.pdf` → `pdf` (a
  leading dot is the whole name and its last suffix; accepted for validation,
  and the content probe still decides).
- A refused extension is `UPLOAD_UNSUPPORTED_FORMAT`; it is decided after the
  name check — which refuses an empty name first — and before the size check
  (FR-028's fixed order).

### 2.2 The name's length

- The accepted length is **1–255 UTF-16 code units**, the unit a browser reports
  and the unit both the page and the server use: 255 is accepted, 256 is
  refused, and 0 — an empty name — is refused by the same cause
  (`UPLOAD_INVALID_NAME`).
- The stored `file_name` is the same string; the database check is a storage
  bound, not a second rule (data-model §2).

### 2.3 Refused and accepted characters

| Set | Code points | Outcome |
|---|---|---|
| C0 and C1 controls | U+0000–U+001F, U+007F–U+009F | refused |
| Bidirectional controls | U+061C, U+200E, U+200F, U+202A–U+202E, U+2066–U+2069 | refused |
| Zero-width and byte-order | U+200B, U+FEFF | refused |
| Line and paragraph separators | U+2028, U+2029 | refused |
| Path separators | `/` (U+002F), `\` (U+005C) | refused |
| Joiners | U+200C, U+200D | **accepted** |
| Emoji and other pictographs | Everything the emoji predicate matches, all other code points | **accepted** |
| Any other character | — | accepted |

- The refused set is checked per code point (UTF-16 code unit for the controls;
  a surrogate pair is not a control).
- U+2028 and U+2029 are not control characters: they are the Unicode line
  separator and paragraph separator (general categories `Zl` and `Zp`), and each
  is one code point and one UTF-16 code unit. They are refused because each
  forces a line break inside a displayed name — the selected-file card shows the
  name on one line, and the duplicate outcome names the original — not because
  they fall in the C0/C1 ranges (FR-021).
- The two joiners stay accepted because an Arabic-script name or an emoji
  sequence may carry them.
- A pictograph is accepted and preserved exactly: the no-emoji rule binds the
  text the platform writes, not a value the merchant supplies (FR-008, FR-021;
  Clarifications 2026-11-12 (2)).
- A refused name is never rendered and never echoed: the page shows the neutral
  label «ملف باسم غير صالح» and the API returns only the code
  (`intake-api.md` §3.3).

## 3. The content check (FR-027, FR-029)

The probe runs on the object the transfer wrote, before the scan. It answers
one of: **matches**, **mismatch**, **corrupt**, **password-protected**.

### 3.1 OLE2 — `.xls` and `.doc`

1. The first eight bytes must equal the OLE2 signature. Anything else is a
   mismatch: a ZIP named `.xls` opens as a container of the wrong family, and a
   text file is not a container at all (FR-027's "actual content" check; the
   name said OLE2).
2. `cfb` parses the compound file. A parse failure — a truncated header, a bad
   sector chain, a directory that cannot be read — is **corrupt**.
3. The declared document's stream must exist: `Workbook` or `Book` for `.xls`,
   `WordDocument` for `.doc`. The other family's stream present instead is a
   **mismatch**; neither stream present is a **mismatch** (the container opens
   but holds no document of the declared type).
4. Encryption:
   - `.doc`: the `WordDocument` stream's FIB flags at offset `0x0A` carry
     `fEncrypted`; set means **password-protected**.
   - `.xls`: the `Workbook`/`Book` stream carries a `FILEPASS` record (`0x002F`)
     before its `EOF`; present means **password-protected**. The scan reads
     BIFF record headers only and stops at the first `EOF` or at the stream's
     end.
5. A stream that exists but cannot be read to its declared length is **corrupt**.

### 3.2 OOXML — `.xlsx` and `.docx`

1. The first four bytes must be `PK\x03\x04`. `PK\x05\x06` (an empty archive)
   and `PK\x07\x08` (a spanned archive) are **mismatch** and **corrupt**
   respectively; a non-ZIP is a **mismatch**.
2. `fflate` opens the archive and reads `[Content_Types].xml` at the root.
   - The archive cannot be opened, a member fails its CRC, or the central
     directory is truncated → **corrupt**.
   - `[Content_Types].xml` is absent → **mismatch**: the ZIP opens but is not an
     OOXML package.
   - It is present but not well-formed XML → **corrupt**.
3. The content-types document must carry an `Override` whose `ContentType` is
   the declared family's main type:
   - spreadsheet: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml`
   - document: `application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml`
   The `PartName` it names must exist in the archive.
   - The other family's main type instead → **mismatch**.
   - Neither main type → **mismatch**.
   - The declared main part is named but missing → **corrupt**.
4. An **OLE2** container named `.xlsx` or `.docx` is the encrypted-OOXML form
   (Office's password-protected package): its streams are `EncryptionInfo` and
   `EncryptedPackage`. That is **password-protected**. Any other OLE2 container
   under these extensions is a **mismatch**.
5. A `.docx` whose main part is a spreadsheet, or the reverse, is the
   cross-named pair FR-027 names: **mismatch**.

### 3.3 PDF — `.pdf`

1. The bytes `%PDF-` must appear inside the first 1024 bytes (the format allows
   leading junk). Absent → **mismatch**.
2. `pdf-lib` loads the document with encryption errors distinguished:
   - an encrypted document (a trailer `/Encrypt`, or the library's
     `EncryptedPDFError`) → **password-protected**;
   - any other load failure — a broken cross-reference table, a truncated
     object, an unreadable stream directory → **corrupt**.
3. A document that loads is a PDF of the declared type, whatever its page
   count; the document catalog is the proof the library read the structure.
4. A PDF whose header matches but whose catalog is missing or unreadable is
   **corrupt**, not a mismatch: it is the declared type and cannot be opened.

### 3.4 Classification summary

| Condition | Answer |
|---|---|
| Container family differs from the extension | mismatch |
| Container opens, declared document absent | mismatch |
| Container opens, the other family's document present | mismatch |
| Container cannot be opened, truncated, or CRC-fails | corrupt |
| Declared document present but needs a password | password-protected |
| Declared document present and readable | matches |

A container that opens but holds no document of the declared type is a
**mismatch**, never a **corrupt** file (FR-027).

### 3.5 Parser hardening

The probe reads a hostile file, so every parser the five formats need keeps
these bounds, and a file that crosses one is answered **corrupt** — the declared
type cannot be read safely — with nothing kept and no new cause (FR-027, FR-064):

| Bound | Value | What it stops |
|---|---|---|
| XML DTDs and entity expansion | **disabled**: a `DOCTYPE` declaration (internal or external), a reference to an entity the document declares, or an external identifier → corrupt | entity-expansion bombs (a "billion laughs"), external-entity resolution, and any fetch of a resource outside the package |
| XML depth | **64 nested elements** | a recursive parse that overflows the stack |
| OOXML members | **65,535** entries in the central directory, with §5's 1 GiB cap still bounding their bytes | a package of millions of empty members that exhausts handles or memory |
| OLE2 directory and FAT | **65,535 directory entries**, and every sector chain walked with a visited set so a loop is corrupt rather than infinite; a stream's declared length bounds its walk | a cyclic or self-referential FAT chain and a directory that never ends |
| PDF objects and nesting | **1,000,000 indirect objects**, a **64-deep** page tree, `/Next` chain, or action nesting, and every object walk guarded by a visited set | a cyclic object graph, a recursive `/Next` chain, and an object count that exhausts memory |
| XML text size | **4 MiB** for `[Content_Types].xml` and for each `*.rels` part | a part whose text alone expands without bound |

- The XML reader is a non-validating parser with resolution disabled: it never
  fetches a DTD, opens a file, or resolves an external identifier, whatever the
  document declares. OOXML forbids a `DOCTYPE`, so a package that carries one is
  a package the platform cannot read.
- The bounds count the file's own structures, not its decoded bytes: §5's 1 GiB
  cap measures expansion and stops neither a million objects nor a 10,000-deep
  element tree.
- A bound crossed is `UPLOAD_CORRUPT`, the answer a truncated container
  receives, because the declared type cannot be read; it is never
  `UPLOAD_EXPANSION_CAP` (nothing expanded past the cap) and never a cause
  outside the closed seventeen.
- The same parser and the same bounds run on the reopen (§4.4), so a sanitized
  file that would cross one is `UPLOAD_SANITIZATION_FAILED`: the sanitizer wrote
  that file, so its unreadability is the sanitizer's failure and not the
  upload's.
- **The fail-closed cases.** The suite carries one case for each bound a fixture
  can produce, each asserting the refusal, the cause, and that no byte is
  retained: a `[Content_Types].xml` carrying a `DOCTYPE` with a recursive
  entity; a 65-element-deep document (64 is the bound); a package with 65,536
  central-directory entries; an OLE2 file whose FAT chain revisits a sector, and
  one whose directory declares 65,536 entries; a
  PDF with a cyclic page tree, one whose page tree nests 65 deep, one whose
  `/Next` chain is 65 deep, one whose action chain nests 65 action
  dictionaries — the 65th reached through `/Next` from the document's
  `/OpenAction`, because `/Next` is the entry an action dictionary carries its
  successor in — and one with 1,000,001 indirect objects; a `*.rels` part over 4
  MiB. Each answers `UPLOAD_CORRUPT`,
  except the same input on the reopen, which answers
  `UPLOAD_SANITIZATION_FAILED`.

## 4. The sanitizer (FR-030, FR-032)

The sanitizer writes a **new** object; it never edits the original in place
(research R-05). The kept file's byte count and SHA-256 are the sanitized
object's (AC-017, FR-041). The kept object MUST satisfy the same 100 MB bound the
upload did: a sanitized output larger than 104,857,600 bytes is
`UPLOAD_SANITIZATION_FAILED`, because the platform keeps only a file its own size
bound admits (FR-032, AC-017).

**No second scan runs on the rewritten bytes.** The scan precedes this section's
rewrite and covers the object the transfer wrote; the sanitizer only removes
content and keeps the rest, so the kept object is the scanned object minus what
§4.1–§4.3 removed, and §4.4's reopen is what proves the kept object is a valid
document of its declared format (FR-029). A second scan would add up to the
90-second scan budget to the five timed budgets' 115 seconds inside the page's
120-second timeout, and it is not performed.

### 4.1 OOXML

Remove, with their content-type overrides and their relationship entries:

| Removed | Why |
|---|---|
| `**/vbaProject.bin`, `**/vbaData.xml`, `**/macrosheets/**` | document macros |
| `**/activeX/**` | ActiveX controls that can execute |
| `**/embeddings/**` | embedded objects or attached files that can carry executable content: an OLE2 compound embedding, and an embedded package such as a workbook or an archive |
| `**/externalLinks/externalLink*.xml` and every relationship naming one | external links: a reader would fetch a resource outside the document (FR-032) |
| `[Content_Types].xml` `Override`/`Default` entries naming a removed part or the `bin` extension when no kept part uses it | the package must stay consistent |
| Relationship entries (`*.rels`) whose `Target` is a removed part or whose `Type` ends in `/vbaProject`, `/activeX`, `/oleObject`, `/externalLink`, or `/externalLinkPath` | no dangling references |

Keep `xl/charts/**`, `xl/media/**`, `word/media/**`, and every other part: an
embedded chart or an image cannot execute and is not an embedding (FR-032). An
**external link** —
`externalLink*.xml` with the relationships whose `Type` ends in `/externalLink`
or `/externalLinkPath`, and any relationship with `TargetMode="External"` that
names one — is removed with the relationship that binds it to the document:
FR-032 requires it, because a link that makes the reader fetch a resource
outside the document can leak data, track the reader, or lead them to a hostile
destination, and the kept document carries none. If a removed part cannot be
removed cleanly — a relationship that cannot be rewritten, a package whose main
part disappears, or an external link that cannot be detached — the answer is
`UPLOAD_SANITIZATION_FAILED`.

### 4.2 OLE2

Remove, in one rewrite of the compound file:

| Removed | Where it lives | Why |
|---|---|---|
| The `VBA` storage (`_VBA_PROJECT` and the module streams) | a storage of the compound file | VBA project macros |
| Every stream in the `ObjectPool` storage | the `ObjectPool` storage | an embedded object that can carry executable content, compound or package |
| Every Excel 4.0 macro sheet (XLM): its `BOUNDSHEET` record, the sheet substream it names (`BOF … EOF`, whose `BOF` carries the macro-sheet type), and every defined name that refers into that sheet | **inside the `Workbook`/`Book` stream** — not in the `VBA` storage and not in `ObjectPool` | BIFF's own macro form: a legacy macro sheet is a sheet of type macro, and its cells carry the executable commands |

The `Workbook`/`Book` stream is rewritten as BIFF records beside the compound
file: the macro sheets' `BOUNDSHEET` entries, their sheet substreams (whose
`BOF` record carries the macro-sheet type), and the defined names that point
into them are dropped, and the remaining records keep their order with their
offsets — each `BOUNDSHEET`'s stream position included — recomputed. Keep the
document's own storage tree, its non-macro sheets, and every embedded image or
chart the workbook carries in its own streams, because neither can execute
(FR-032).

`cfb` rewrites the compound file and the BIFF rewrite runs in the same pass, so
one sanitizer produces one output object. If the `VBA` storage, an embedded
object, or a macro sheet cannot be removed, if the rewritten `Workbook` stream
cannot be parsed as BIFF again, or if the rewritten container cannot be parsed
again, the answer is `UPLOAD_SANITIZATION_FAILED`.

**The legacy macro form is not the VBA one.** A `.xls` may carry a VBA project
in its `VBA` storage, an Excel 4.0 macro sheet in its `Workbook` stream, or both;
FR-032's "document macros" names the executable content rather than a storage,
so every row above is removed, and a macro of any form that cannot be removed is
refused (Clarifications 2026-11-16 (5)).

### 4.3 PDF

Remove:

| Removed | Location |
|---|---|
| JavaScript | `/Names /JavaScript`, and every `/JavaScript` action dictionary reachable from a page, an annotation, or an outline item |
| Automatic actions | `/OpenAction` when it is an action dictionary (it carries `/S`), and the whole `/AA` additional-actions dictionary wherever it appears |
| Launch actions | every action dictionary whose `/S` is `/Launch`, including those reached through `/Next` chains |
| Embedded files | `/Names /EmbeddedFiles`, `/AF`, and the file-specification objects and streams they name |
| XFA form scripts | `/AcroForm /XFA`, and the XFA packet streams it names |

Keep a `/OpenAction` that is a destination (a page reference), a `/GoTo`
action, a `/URI` link, annotations, form fields without XFA, and every other
object: none executes. A removal that cannot be completed — an action dictionary
the rewriter cannot reach, an XFA packet that cannot be detached — is
`UPLOAD_SANITIZATION_FAILED`.

### 4.4 The re-open

After the rewrite and before the object is kept, the sanitized bytes are opened
by the same probe (§3), under the same parser bounds (§3.5) and its own
5-second budget, and must answer **matches** for the declared extension. A
sanitized file that no longer opens — a broken package, a missing main part, a
corrupt cross-reference table — a sanitized file that crosses a parser bound, or
a reopen that does not finish inside its budget is `UPLOAD_SANITIZATION_FAILED`
(FR-029, FR-032), and nothing is kept.

## 5. The decoded-size cap (FR-031, CMV row 15)

The cap is **1 GiB = 1,073,741,824 bytes of decoded content per file**. It is
enforced by a counting sink that stops the read at the cap and refuses
(`UPLOAD_EXPANSION_CAP`); no decoded content is held in memory beyond the
streaming window (research R-04). Every inspected format is measured, and the
measurement runs on the original decode and again on the sanitized decode. The
**first** read is bounded by the **5-second** budget the plan records; a read that
does not finish inside it is `UPLOAD_CORRUPT` — the file cannot be read — and not
an expansion-cap failure, because nothing crossed the cap (FR-027, FR-029). **The
second measurement is taken as the sanitizer writes the kept bytes**: the members
and streams it writes are the bytes counted, and the retained members' inflated
sizes are the ones the first read confirmed, so it takes no read of its own and
spends the sanitizer's **10-second** budget — the path's six steps therefore keep
the plan's five timed budgets and their 115-second sum inside the page's
120-second timeout. A sanitized decode that crosses the cap is
`UPLOAD_EXPANSION_CAP`, because the bytes the platform would keep are ones whose
decoded content crosses it; a measurement that cannot finish inside the
sanitizer's budget is `UPLOAD_SANITIZATION_FAILED`, because the step that
produces the kept bytes did not complete (FR-029, FR-032).

| Format | What counts |
|---|---|
| OOXML | Every member's uncompressed size from the central directory, and then every member's actual inflated bytes; a header that understates the size is caught by the actual count |
| OLE2 | Every stream's size from the compound-file directory (the container does not compress, so the directory's sizes are the decoded sizes) |
| PDF | Every stream's decoded bytes: a `/FlateDecode` stream is inflated through `zlib`; an uncompressed stream counts its `/Length`; object streams (`/Type /ObjStm`) count their decoded content |

A reader that would cross the cap stops at the boundary and refuses; it does not
allocate the remaining size. A member that fails to inflate before the cap is
**corrupt** (the container cannot be opened), not an expansion-cap failure.

## 6. The boundary table

| Case | Expected |
|---|---|
| Exactly 100 MB (104,857,600 bytes) | accepted for validation |
| 100 MB + 1 byte | `UPLOAD_TOO_LARGE` |
| 0 bytes | `UPLOAD_EMPTY` |
| 255 UTF-16 code units | accepted for validation |
| 256 UTF-16 code units | `UPLOAD_INVALID_NAME` |
| An empty name (`""`) | `UPLOAD_INVALID_NAME`, neutral label |
| `كتالوج.XLSX` | accepted for validation |
| `catalog.pdf.exe` | `UPLOAD_UNSUPPORTED_FORMAT` |
| A name carrying U+202E, U+200B, U+FEFF, U+061C, U+2028, or `/` | `UPLOAD_INVALID_NAME`, neutral label |
| A name carrying U+200C, U+200D, or an emoji | accepted, name preserved |
| A Word document named `.xls` | `UPLOAD_CONTENT_MISMATCH` |
| An Excel workbook named `.docx` | `UPLOAD_CONTENT_MISMATCH` |
| An Excel workbook named `.doc` | `UPLOAD_CONTENT_MISMATCH` |
| A ZIP named `.xlsx` with no `[Content_Types].xml` | `UPLOAD_CONTENT_MISMATCH` |
| A file whose bytes carry no `%PDF-` inside the first 1024 bytes | `UPLOAD_CONTENT_MISMATCH` |
| A truncated OLE2 or ZIP | `UPLOAD_CORRUPT` |
| An encrypted PDF, an encrypted OOXML package, or an encrypted `.xls` or `.doc` | `UPLOAD_PASSWORD_PROTECTED` |
| An OOXML member that inflates past 1 GiB | `UPLOAD_EXPANSION_CAP` |
| A PDF whose Flate streams inflate past 1 GiB | `UPLOAD_EXPANSION_CAP` |
| The sanitized decode crosses 1 GiB | `UPLOAD_EXPANSION_CAP` — the kept bytes would be ones whose decoded content crosses the cap |
| A macro workbook | accepted; the kept file carries no `vbaProject.bin` |
| A macro-enabled Word document named `.docx` (a package carrying `word/vbaProject.bin`) | accepted; the kept file carries no `vbaProject.bin` |
| A `.xls` carrying an Excel 4.0 macro sheet in its `Workbook` stream | accepted; the kept file carries no macro sheet |
| An embedded object or attached file that can carry executable content | accepted; the kept file carries none |
| A macro sheet or an external link that cannot be removed | `UPLOAD_SANITIZATION_FAILED` |
| A `.doc` whose macro cannot be removed | `UPLOAD_SANITIZATION_FAILED` |
| A workbook carrying an external link | accepted; the kept file carries no `externalLink*.xml` and no relationship naming one |
| A `[Content_Types].xml` or `*.rels` carrying a `DOCTYPE` or a recursive entity | `UPLOAD_CORRUPT` |
| An XML part nested 65 elements deep | `UPLOAD_CORRUPT` |
| A package with 65,536 central-directory entries | `UPLOAD_CORRUPT` |
| An OLE2 directory declaring 65,536 entries, or a FAT chain that revisits a sector | `UPLOAD_CORRUPT` |
| A PDF with a cyclic page tree, a page tree 65 deep, a `/Next` chain 65 deep, an action chain 65 action dictionaries deep, or 1,000,001 indirect objects | `UPLOAD_CORRUPT` |
| A stage that does not finish inside its budget | that stage's cause: `UPLOAD_CORRUPT` for the probe and the cap's read of the original decode, `UPLOAD_SANITIZATION_FAILED` for the sanitizer, the cap's measurement of the sanitized decode, and the reopen, `UPLOAD_SCAN_UNAVAILABLE` for the scan |
| A PDF with JavaScript, an open action, an embedded file, or XFA | accepted; the kept file carries none of them |
| A document whose executable content cannot be removed | `UPLOAD_SANITIZATION_FAILED` |
| A sanitized file that no longer opens | `UPLOAD_SANITIZATION_FAILED` |
| A sanitizer output larger than 100 MB | `UPLOAD_SANITIZATION_FAILED` |
| An embedded chart or image | kept |

## 7. What this contract does not carry

- The page's format-and-size line and the neutral label's rendering —
  `ui-contracts.md` §4.
- The size and date display formats — `ui-contracts.md` §6.
- The transport's part size and the object keys — `intake-api.md` §2.2 and
  `data-model.md` §10.
- The scan's protocol and budget, and the other four stage budgets —
  `intake-api.md` §2.3 and §6.2 and research R-16.
- The extraction R3 performs on the kept file — R3.
