# PDF Sample Analysis — 2026-10-23

**Status**: Preliminary, read-only sample. This is evidence, not a feature, not a
specification, and not a source of product rules. ADR-119 records the capacity
calibration; the constitution wins on every conflict.

**Scope**: 19 PDF files from one local folder, 1,525 pages, 43.4 MB. The files
were inspected locally and were not uploaded to any external service. The sample
is not representative of every merchant: it comes from one folder and contains no
Excel or Word files. This report carries no raw supplier name, price, phone
number, or other merchant data.

**Method**: page count, text layer, image operators, page size, and text
positions were read with a PDF text extractor. Rows were grouped from text
baselines and counted when a line carried at least three cells and a
price-or-part-number pattern. The scanned file was inspected page-by-page as an
image grid, and five pages were measured with the local Windows Arabic OCR
engine. The OCR measurement is a lower-bound benchmark, not a technology choice.

## 1. Aggregate result

| Measure | Result |
|---|---:|
| Files | 19 |
| Total pages | 1,525 |
| Total size | 43.4 MB |
| Average pages per file | 80.3 |
| Median pages per file | 87 |
| Page range | 8–163 |
| Average file size | 2.28 MB |
| Median file size | 1.20 MB |
| 90th-percentile file size | 2.22 MB |
| Largest file | 20.95 MB |
| Text-layer files | 18 (94.7%) |
| Scanned files | 1 (5.3%) |
| Scanned share of bytes | 48.3% |
| Largest three files' share of bytes | 63% |
| Weighted rows per page | 31.7 |
| Median file rows per page | 33 |
| Rows-per-page range | 21–47 |
| Approximate part rows in the sample | 49,900 |

The one scanned file is 52 pages and 20.95 MB. The 18 text files total 22.45 MB
and average 1.25 MB. The largest three files carry 63% of the bytes; storage is
tail-driven, not average-driven.

## 2. Findings

### 2.1 Most files are text, not scans

18 of 19 files carry a full text layer. Most are Microsoft Print to PDF, Excel,
or Word output. The single scan is the heaviest file and carries 48.3% of the
sample's bytes, but only 5.3% of the files.

One text file carries 645 image operators and is still a text PDF. Image count
alone is not a scan signal.

### 2.2 The 6% figure is roughly right; the 7 MB average is not

1 of 19 files (5.3%) is at about 20 MB, close to the 6% assumption. The average
file is 2.28 MB, not 7 MB. The text files average 1.25 MB. A weighted mix of 94%
text at 1.25 MB and 6% scanned at 20.95 MB is about 2.4 MB, consistent with the
sample. The 7.8 MB figure in the pre-sample envelope requires text files near
7 MB, which this sample does not contain.

### 2.3 Rows per page are about three times the pre-sample assumption

The weighted average is 31.7 rows per page; the median is 33; the range is 21–47.
The scanned file's table grid gives 28–33 rows per page. The pre-sample model used
10 rows per page. At 80.3 pages per file and 31.7 rows per page, one file carries
about 2,545 part rows, not 1,000.

### 2.4 Text layers are not automatically reliable

Eight of the 18 text PDFs carry 2.7–15.6% characters outside Arabic, ASCII, or
ordinary punctuation; the extracted text contains phonetic and private-use
glyphs in place of Arabic. Several headers are unreadable from the text layer
even when data rows remain partly readable. Supplying PDF CMaps did not fix the
sample. The likely cause is a missing or incorrect `ToUnicode` map or a
custom-encoded font.

This changes the extraction design: a text layer needs a quality gate. A low
Arabic-ratio or low-confidence extraction must fall back to another extractor or
OCR. "Text PDF" does not mean "no OCR path".

### 2.5 Source schemas vary from three to seven data columns

The sample shows these patterns:

| Pattern | Example header | Data columns | Main difficulty |
|---|---|---:|---|
| Minimal | `سعر البيع \| البيان \| رقم الصنف` | 3 | name, model, type, and original number are inside `البيان` |
| Standard | `السعر \| الرقم الأصلي \| الشركة \| اسم الصنف \| رقم الصنف \| م` | 6 | `الشركة` is a brand/type, not the supplier; `م` is a row index |
| Merged | `سعر البيع \| الرقم الأصلي \| ع \| الانو \| البيان \| رقم الصنف` | 6 | merged or abbreviated headers; `ع` and `الانو` need decoding |
| Two prices | `مصرف \| نقدي \| الشركة \| المادة \| رقم الصنف` | 5 | bank price and cash price; the model carried one price before ADR-120 |
| Two prices | `سعر القطعة \| سعر الجملة \| رقم القطعة \| اسم الصنف \| رقم الصنف \| م` | 6 | piece and wholesale price; the model carried one price before ADR-120 |
| Compact | `سعر الخاص \| الشركة \\ البلد \| اسم الصنف \| رقم الصنف` | 4 | type and country are merged; company is not the supplier |
| Scanned | OCR header is incomplete | 4–5 | the table grid is visible but OCR merges rows and columns |

The six canonical columns are the target, not the source shape. The source files
do not have a fixed column count.

### 2.6 A row-level company is not always the supplier

Values such as `MOBIS`, `DL`, `LS`, `HIQ`, `KJC`, `MUP`, and `Z-PRO` appear under
a `الشركة` header. They are brands, countries, or quality grades and belong in the
`type` column. The supplier is the company named on the first page. A source
header that explicitly says `المورّد` or `الشركة الموردة` is different, but the
sample does not settle that distinction.

### 2.7 Two price columns need a precedence rule

The model carried one price per part before ADR-120. The sample has files with
`مصرف` and `نقدي`, and files with `سعر القطعة` and `سعر الجملة`. ADR-120 kept the
single canonical column and let it carry one amount or two: the primary amount
is the cash price of one part («نقدي», otherwise «قطعة», otherwise the only
amount, otherwise the first in reading order), and the second amount is
display-only. Adding a second canonical column would have been a Glossary
amendment, not a feature choice.

### 2.8 OCR is fast enough but not table-aware

Five pages of the scanned file measured 1.3–2.6 seconds per page on the local
Windows Arabic OCR engine, or 68–135 seconds for the 52-page file. The engine
returned about 20 text lines for a table with about 30 rows; columns and prices
were merged. OCR alone is not a table extractor.

At the sample's 5.3% scanned share, OCR volume is small: about 18,500 scanned
files and 1.0 million pages per month at 350,000 uploads/month, or about 32,000
pages a day. At 2 seconds per page that is roughly two workers over an
eight-hour daily window, before table structure work. The pre-sample 365–521
worker figure describes an all-files-scanned, 15-minute-per-file sensitivity,
not this sample.

### 2.9 Date and retention

The sample contains files dated 2026-01-27 and 2026-04-16, while the inspection
date is 2026-10-23. If the 90-day clock ran from the supplier's issue date, the
January file would have been deleted before it could be uploaded. The practical
retention trigger is the upload date; the issue date belongs in display,
freshness ranking, and a stale warning. R15 still owns the decision.

## 3. Canonical model check

The project fixes six canonical part columns in the constitution's `Glossary` →
`Part`: part number, name, car model, original number, type, price. The parts
table adds the supplier name and the cart control, for eight displayed columns.
The supplier name is read through the `suppliers` module and is not a part
column. There is no description column. `type` holds brand, country, and
manufacturing grade together.

The sample does not justify a new canonical column. It exposed four rules; the
first was decided by ADR-120, and three remain for R3 without changing the six:

1. Which price wins when a file prints two — decided by ADR-120: the primary
   amount rule.
2. When a row-level company is `type` and when it is the supplier.
3. Whether a missing original number is stored as null or derived from the name.
4. How the car model and type are separated from a long Arabic name.

A separate description, currency, brand, country, or grade column is not
supported by the sample and would require a Glossary amendment.

## 4. Problems that need solutions

| Problem | Impact | Direction |
|---|---|---|
| Corrupted text layer | wrong Arabic, unusable header | quality gate; alternate extractor or OCR |
| Merged or multi-row headers | wrong column assignment | structural header detection |
| Three-to-seven source columns | per-file mapping | automatic assignment to the six |
| Two price columns | wrong price | decided by ADR-120: primary amount rule |
| Row-level company | supplier/type confusion | header and context rule |
| Description or `البيان` | forbidden stored description | map to name; store no description |
| Model and type inside name | missing columns | model list and separation rules |
| Missing original number | incomplete search | null or derive; R3 decision |
| Price formats | wrong amount | column-aware parser |
| RTL and reversed order | columns reversed | x/y reconstruction and normalization |
| Repeated headers and footers | false rows | ignore page frame |
| Scanned tables | failed extraction | table-aware OCR and grid handling |
| Excel and Word absent | unknown risk | separate sample before R3 |

## 5. Capacity implications

The measured sample gives a planning scenario distinct from the pre-sample
envelope. The authoritative table is `docs/capacity-model.md` §3.1 (measured
baseline) and §3.2 (scanned-heavy stress); this report does not repeat it.
ADR-119 records the calibration, and ADR-121 accepts the resulting 2–3 billion
parts range and fixes the partitioning constraint.

In short: the measured scenario reduces storage and OCR pressure but raises the
parts projection by roughly 2.5 times the pre-sample 840 million/1.2 billion
figure. PostgreSQL partitioning and OpenSearch sharding are therefore the larger
risk. The 20% deduplication rate and the cross-merchant unique-file rate remain
assumptions.

## 6. What this sample does not settle

- It is 19 files from one source, not a representative population.
- It contains no Excel or Word files.
- The row count is heuristic and has not been checked by hand on every page.
- The OCR benchmark covers five pages on one local engine, not production.
- Cross-supplier deduplication is not measured.
- The scanned share may rise with merchants who photograph documents.
- The six canonical columns are not proven sufficient until the four rules in
  section 3 are decided.

## 7. Next step

The next step is a broader sample and a per-column extraction benchmark before R3,
not a new feature or a new canonical column. The benchmark measures precision and
recall for each of the six columns, plus the supplier and the price, on 20–50
hand-labelled pages. The sample should include Excel, Word, text PDF, and scanned
PDF. The detailed extraction rules belong to R3's plan, not to this report.

## Appendix: anonymous file summary

| ID | Pages | Size (MB) | Kind | Rows/page |
|---|---:|---:|---|---:|
| F01 | 87 | 1.38 | text | 24.7 |
| F02 | 129 | 0.85 | text | 26.8 |
| F03 | 104 | 0.98 | text | 41.6 |
| F04 | 88 | 2.22 | text | 46.9 |
| F05 | 163 | 1.37 | text | 27.8 |
| F06 | 52 | 20.95 | scanned | grid 28–33 |
| F07 | 38 | 0.58 | text | 43.3 |
| F08 | 17 | 0.40 | text | 21.8 |
| F09 | 19 | 0.39 | text | 20.7 |
| F10 | 63 | 0.74 | text | 43.1 |
| F11 | 100 | 1.35 | text | 32.9 |
| F12 | 98 | 4.01 | text | 29.0 |
| F13 | 37 | 0.67 | text | 32.2 |
| F14 | 145 | 1.84 | text | 32.8 |
| F15 | 141 | 1.79 | text | 32.8 |
| F16 | 45 | 0.82 | text | 32.5 |
| F17 | 86 | 1.20 | text | 32.8 |
| F18 | 105 | 1.49 | text | 32.6 |
| F19 | 8 | 0.38 | text | 29.1 |
