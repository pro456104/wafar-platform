## ADR-118 — The upload-quota amendment: 50/300, no lifetime total, and the administrator ceiling

**Status**: Accepted — 2026-10-23
**Owning directory**: `.specify/memory/`, `docs/`, `ROADMAP.md`,
`Core-Project.txt`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context.** ADR-117 adopted the capacity envelope and recorded the target quota
model, but the constitution still bound 50 uploads per calendar month and 100
files in total. A merchant uploading 30–50 files a month reaches the 100-file
total in two or three months and then cannot upload again, while the product's
six-month plan assumes monthly uploads continue. The product also needs an
administrator per-user quota override; `PlatformSetting` cannot carry it because
ADR-067 excludes Usage Limits from that entity. The amendment must remove the
lifetime cliff, define the active quota and its deletion semantics, and authorize
the administrator ceiling without turning the Settings page into a second source
of Usage Limits. The repository has no application code, no schema, and no
production data; R1 is in specification, and R2/R13 are planned.

**Decision.** The constitution is amended to **4.0.0** — a MAJOR amendment,
because a binding Usage Limit is removed and another is redefined.

1. **Usage Limits become:**
   - 50 uploads per calendar month per user.
   - 300 active stored files per user.
   - No lifetime upload total.
   - Administrator-granted monthly ceiling: 500 files per calendar month, per
     user, exception only.
   - Administrator-granted active ceiling: 1,500 files per user, exception only.
   - A quota above either ceiling requires a further amendment.
2. **The quota semantics are explicit.** The monthly count counts upload events
   in the calendar month and is not restored by deletion. The active count counts
   files whose bytes, parts, bookmarks, and search-index entries are present; a
   merchant delete, an administrator delete, or the 90-day retention job releases
   an active slot, and a soft-deleted catalog row does not count. Quota checks are
   server-side and atomic. Lowering a quota never deletes a file and only blocks
   new uploads until the account is under the new limit; raising a quota takes
   effect immediately.
3. **The per-user quota is carried by `User`, not by a new entity.** The
   constitution's `User` row gains optional monthly and active overrides, and the
   domain model records the null-means-default rule, the ceilings, the ownership,
   the enforcement point, and the audit. The `users` module owns the fields; the
   `catalogs` module (R2) enforces the effective quota atomically; the `admin`
   module (R13) sets it; the audit log records every change with the old value,
   the new value, the reason, and the timestamp. The register stays at twelve
   entities.
4. **The administrator surface changes.** The Product Scope's administrator
   Users page moves from "View, block, edit." to "View, block, edit, set upload
   quota." The administrator application still has its own login and its own
   shell; the quota control lives on the Users page, not on the Settings page.
5. **The downstream documents move with the amendment.** `docs/domain-model.md`
   records the quota invariant and the `User` fields; `ROADMAP.md` R2, R13, and
   R15 name the new enforcement, the Users-page control, and the active-slot
   release; `Core-Project.txt` mirror carries the Arabic limits, the admin page,
   the `User` fields, and the note that the global limits are not edited from the
   Settings page; `docs/capacity-model.md` records the ratified values.
6. **The capacity model is not reopened.** The envelope in ADR-117 (10,000
   accounts in six months, 50,000 capacity, 50,000–100,000 visits/day,
   3,000–5,000 concurrent online, 300–600 concurrent uploads, 350,000/500,000
   uploads per month) stands. The model is re-run when the assumptions in
   `docs/capacity-model.md` §11.3 change.

**What deliberately did not change.** The 100 MB maximum file size, the 90-day
retention period, the 99-part cart cap, the p95 budgets (search under one second,
cart-add under 200 ms, processing under five minutes), the product scope, the
page count, the module list, the roles, and the slice order are unchanged. No new
entity is introduced. No R1 `plan.md` or `tasks.md` is created, and no application
code, package, schema, API, or migration is built. The 90-day trigger point
remains R15's open fact.

**Alternatives considered.**

- *Keep the 100-file lifetime total and lower the monthly limit.* Rejected: it
  would stop every active merchant sooner, not later, and would contradict the
  capacity envelope.
- *Make 300 a lifetime total.* Rejected: the same cliff moves to month six, and
  the six-month horizon is a planning horizon, not an account lifetime.
- *Create a separate `UserQuota` entity.* Rejected: the override is two nullable
  per-account values with no independent lifecycle, the audit log already records
  changes, and a new entity would add a join and a register count for no product
  fact. Fields on `User` keep one owner and one read path.
- *Put the quota on `PlatformSetting`.* Rejected: ADR-067 forbids a Usage Limit
  in that entity, and the value is per user, not platform-wide.
- *Let the administrator grant unlimited quota.* Rejected: the capacity model
  would be unbounded and the constitutional limit would lose its meaning.
- *Amend only the total and leave the administrator ceiling out.* Rejected: the
  product requirement names a per-user override, and an unbounded override would
  make the capacity model unenforceable.

**Consequences and migration/backfill.** The constitution moves to 4.0.0; the
footer, `.specify/memory/version.json`, and the ADR index row record the same
version and date. The live `ADR-001 … ADR-117` range strings move to
`ADR-001 … ADR-118`, and `Project-Technologies.txt`'s header list gains 118
contiguously. The migration is documentation-only: there is no production data
and no schema, so no backfill runs; R2 and R13, when specified, read the new
limits, the `User` fields, and the audit rule. The current R1 specification does
not name the upload quota, so its identifiers and acceptance criteria do not
change. Review date: 2026-11-23, and again at R12's load test. This entry is the
durable record.

---

## ADR-119 — The first PDF sample calibration and the two-scenario capacity model

**Status**: Accepted — 2026-10-23
**Owning directory**: `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner.
R3 consumes the evidence; no slice specification is created by this record.

**Context.** ADR-117 adopted the capacity envelope with three pre-sample
assumptions: a 7.8 MB weighted average file, 100 pages per file, and 10 rows per
page. The first real sample (19 PDFs, 1,525 pages, inspected locally on
2026-10-23) measured a different shape: 18 text PDFs and one scan; 2.28 MB
average; 80.3 pages per file; 31.7 rows per page; 5.3% of files scanned; and
48.3% of the bytes in the single scan. Eight of the 18 text PDFs also carry
corrupted characters or unreadable headers, so a text layer is not a guarantee of
clean extraction. The sample is small and comes from one folder, so it cannot
replace the envelope outright; it is enough to calibrate the planning baseline
and preserve the pre-sample envelope as a stress case. The alternative — leaving
the 10-row figure as the only planning number — would understate the parts
projection by about 2.5 times.

**Decision.**

1. **`docs/pdf-sample-analysis.md` is added as preliminary evidence.** It records
   the 19-file sample, its method, its aggregate measurements, its limits, and
   the extraction problems it exposed. It is not a feature, a specification, or a
   source of product rules. It carries no raw merchant data.
2. **The capacity model uses two scenarios.** The measured baseline is 2.28 MB
   average, 80.3 pages per file, 31.7 rows per page, and 5.3% scanned files. The
   scanned-heavy envelope retains 7.8 MB average and 100 pages per file as the
   stress case. Both use 350,000/500,000 uploads per month, 20% deduplication, and
   the 90-day active set.
3. **The measured parts projection is about 2.14 billion active parts at design
   and 3.06 billion at stress**, after 20% deduplication. The scanned-heavy
   envelope is about 2.66 billion at design and 3.80 billion at stress. These are
   planning figures, not a measured production index. PostgreSQL partitioning and
   OpenSearch sharding are the capacity risk.
4. **The measured storage projection is about 6.3 TB at design and 8.9 TB at
   stress**, replicated and including 30% derived data. The scanned-heavy
   envelope remains 21 TB and 30 TB. The measured upload ingress is 11–46 MB/s
   at 300–600 concurrent uploads; the scanned-heavy ingress remains 39–156 MB/s.
5. **The canonical columns do not change.** The six `Part` columns and the
   supplier display remain exactly as ADR-040 and the Glossary fix them. The
   sample does not justify a new column. Four rules remain for R3: which price
   wins when a file prints two; when a row-level company is `type` and when it is
   the supplier; whether a missing original number is null or derived; and how
   the car model and type are separated from a long Arabic name. A new canonical
   column would be a Glossary amendment, not an R3 choice.
6. **Text-layer quality becomes an extraction gate.** R3 must measure whether a
   text PDF's extracted Arabic and header survive extraction, and fall back to
   another extractor or OCR when they do not. The sample's corrupted text layers
   make "text PDF means no OCR" unsafe. No OCR or table-extraction technology is
   selected by this record; the Technology Standards gap process still owns that
   choice.
7. **The sample remains preliminary.** A broader sample of 50–100 files across
   5–10 suppliers, including Excel, Word, text PDF, and scanned PDF, is required
   before the measured baseline is treated as final. The 20% deduplication figure
   is still an assumption. The 90-day trigger remains R15's decision; the
   sample's old issue dates support the upload-date recommendation already
   recorded in the capacity model, but this record does not decide it.

**What deliberately did not change.** No constitutional text, Usage Limit,
canonical column, entity, page, role, module, slice order, or dependency edge
changes. The quota model of ADR-118 stands. No R1 `plan.md` or `tasks.md` is
created, no slice specification is created, and no application code, package,
schema, API, or migration is built. No OCR technology is chosen.

**Alternatives considered.**

- *Keep 7.8 MB and 10 rows per page as the only model.* Rejected: the sample
  contradicts both the file-size and row-count assumptions, and the 10-row figure
  understates active parts by about 2.5 times.
- *Replace the envelope entirely with 2.28 MB and 31.7 rows.* Rejected: 19 files
  from one folder are not a population, and the scanned-heavy case must remain
  visible for merchants who photograph documents.
- *Add separate description, currency, brand, or country columns.* Rejected: the
  sample does not prove the need, and the Glossary fixes the six; a new column is
  a constitutional amendment.
- *Choose an OCR or document-AI vendor now.* Rejected: the register gap belongs
  to R3, and the sample is a five-page lower-bound benchmark, not a product
  selection.
- *Treat the sample as a feature or a slice.* Rejected: it is project-level
  evidence, and ADR-007 prohibits a feature for a project-level concern.

**Consequences and migration/backfill.** `docs/capacity-model.md` now carries the
measured baseline and the scanned-heavy stress case; its old 10-row figure is
retained only as a sensitivity row. The live `ADR-001 … ADR-118` range strings
move to `ADR-001 … ADR-119`, and `Project-Technologies.txt`'s header list gains
119 contiguously. The change is documentation-only: there is no production data,
no schema, and no code, so no backfill runs. R3, when planned, reads the sample
report, the two scenarios, and the open rules. Review date: 2026-11-23, and again
after the broader sample. This entry is the durable record.

**Annotation (2026-10-24, ADR-120).** The first of the four R3 rules in item 5
— which price wins when a file prints two — is decided by ADR-120. The other
three remain R3's.

---

## ADR-120 — The two-price column: one price cell, two printed amounts, and the primary price

**Status**: Accepted — 2026-10-24
**Owning directory**: `.specify/memory/`, `docs/`, `Core-Project.txt`,
`ROADMAP.md`
**Owning feature**: none — governance decision; ratified by the repository
owner. R3 reads the extraction rule; R5 renders the cell.

**Context.** The constitution registered one price per part. The first real
sample (19 PDFs, 1,525 pages, 2026-10-23) contains files that print two price
columns: «نقدي» and «مصرفي», «سعر القطعة» and «سعر الجملة», «سعر البيع», and
«سعر الخاص». The sample report recorded the two-price pattern and left the
precedence rule to R3. Storing one amount would silently drop a printed price
and force a schema migration later. Adding a second canonical column would
break the six-column composition, the eight displayed columns, and the rule
that every column is always shown. Adding a `PartPrice` entity would make
thirteen entities, break the twelve-entity register, and put a join in every
read of the parts table. The product decision is to keep one price column and
let it carry one amount or two.

**Decision.**

1. **The price column carries one amount or two.** A parts table that prints
   two price columns, or one column carrying two labelled amounts, stores both;
   a table that prints one stores one. Each amount carries the column name the
   supplier printed, stored as part of the price cell; the label is not a
   seventh canonical value. The six canonical columns and the eight displayed
   columns are unchanged.
2. **The primary amount is the sort and filter key.** It is the amount the
   parts table sorts and filters on: «نقدي» when the file prints it, otherwise
   «قطعة», otherwise the only printed amount, otherwise the first amount in the
   table's reading order, which is right to left in an RTL table. The second
   amount is displayed only and is neither sortable nor filterable.
3. **Labels.** «نقدي» is payment in cash and «مصرفي» is payment by card; a
   printed «مصرف» is stored as «مصرفي». A label is rendered with its amount
   only when it is Arabic; a label in another script, or no label, leaves the
   amount unlabelled.
4. **Storage cap.** At most two amounts are stored. When a file prints more
   than two, the stored pair is the primary amount and the first of the
   remaining amounts in reading order; a third amount is not stored even though
   it belongs to the price column, and it is not counted or flagged. When two
   printed columns carry the same label, the first in reading order is stored
   and the second is not.
5. **The guest projection excludes both amounts.** A guest's read path projects
   the part without its price column and without either amount, through its own
   allowlist. The administrator edits both amounts; a merchant edits neither.
6. **The other-currency rule is unchanged.** A price in another currency is not
   converted and not stored; when the second amount is in another currency it is
   not stored either, and a part with no storable amount reads «بدون سعر».
7. **The constitution moves to 4.1.0 (MINOR).** The change is a material
   expansion of registered price guidance; nothing is removed or redefined
   incompatibly, and a one-price part remains valid.

**What deliberately did not change.** The six canonical columns, the eight
displayed columns, the twelve entities, the twenty-seven pages, the sixteen
features, the Usage Limits table, the Technology Standards register, the cart's
prohibition on price, and the guest redaction. No entity, canonical column,
displayed column, page, limit, or technology is added. No OCR vendor is named
and no capacity number enters the constitution. R1's specification does not
name the price, so its identifiers and acceptance criteria do not change. R3
and R5 read the amended rule when they are specified.

**Alternatives considered.**

- *Store one amount and drop the second.* Rejected: it silently discards a
  printed price and forces a migration once a merchant asks where the card
  price went.
- *Add a second canonical column.* Rejected: it breaks the six-column
  composition, the eight displayed columns, and the rule that every column is
  always shown; it would be a MAJOR amendment.
- *Introduce a `PartPrice` entity.* Rejected: it makes thirteen entities,
  breaks the twelve-entity register, and adds a join to every read of the parts
  table.
- *Leave the precedence rule to R3.* Rejected: the rule decides what the
  merchant sees first and what the price filter means, so it is a product fact,
  not an extraction detail.
- *A closed label enumeration.* Rejected: the label is the supplier's printed
  column name, and suppliers vary; the two meanings that matter — cash and card
  — are registered, and the rest is stored as printed.

**Consequences and migration/backfill.** The constitution's Principle VI,
Product Scope, Product Register, File Processing Rules, Glossary, and Product
Fact Clarifications move in this change; `docs/domain-model.md`,
`Core-Project.txt`, `docs/architecture.md`, `ROADMAP.md`, and
`docs/pdf-sample-analysis.md` follow in the same commit. ADR-040 and ADR-119
carry annotations. The live `ADR-001 … ADR-119` range strings move to
`ADR-001 … ADR-120`, and `Project-Technologies.txt`'s header list gains 120
contiguously. The change is documentation-only: there is no production data,
no schema, and no code, so no backfill runs. Review date: 2026-11-23, and again
when R3's extraction benchmark lands.

---

## ADR-121 — The accepted parts envelope and the partitioning constraint

**Status**: Accepted — 2026-10-24
**Owning directory**: `docs/`, `.specify/templates/overrides/`
**Owning feature**: none — governance decision; ratified by the repository
owner. R3 and R12 consume it.

**Context.** ADR-119 calibrated the six-month envelope from the first 19-file
sample and left two physical questions open: `docs/capacity-model.md` said
PostgreSQL "needs a partitioning and archival decision before the 2–3 billion
range", and OpenSearch "needs a shard plan sized to the measured index, not to a
guess". The owner accepted the 2–3 billion range as the planning envelope.
Leaving the partition key to R3's plan is not safe: in PostgreSQL a partitioned
table's unique constraint must include the partition key, so the key decides the
part's primary key and every reference to it, including `bookmarks`. Discovering
that in R3 would force a redesign of the module's schema and its read paths. The
plan template's binding block also did not name the capacity model, so a plan
could satisfy its binding sources without reading the envelope. The sample
report repeated the capacity table, creating a second source for numbers that
`docs/capacity-model.md` owns.

**Decision.**

1. **The 2–3 billion range is accepted as the planning envelope.** 2.14 billion
   active parts at design and 3.06 billion at stress, after 20% deduplication,
   from the measured 31.7 rows/page; the scanned-heavy 100-page case reaches
   2.66/3.80 billion. These are planning figures, not a measured production
   index.
2. **`parts` is partitioned by the catalog's upload time.** The 90-day retention
   is a partition drop, not a row-by-row delete. Because PostgreSQL requires
   every unique constraint on a partitioned table to include the partition key,
   the part's identity and every reference to it must accommodate the partition
   key. R3's plan chooses the mechanism; it does not choose whether to
   partition.
3. **OpenSearch uses time-based indices behind an alias.** ISM deletes a whole
   index by age; a per-catalog delete is a delete-by-query on the alias. The
   shard count is derived from the modelled index size.
4. **R12's load test measures the corpus, not only the request rate.** The test
   includes 2–3 billion parts present, so the search p95 is measured at the
   modelled index size.
5. **The two levers are measured, not assumed.** The cross-merchant unique-file
   rate (the content-hash check rejects an identical file before processing) and
   the deduplication rate are the two figures that change the parts projection.
   Both are unmeasured; a change in either is a re-sizing trigger.
6. **The plan template binds the capacity model.** `docs/capacity-model.md` joins
   the binding Project Context Sources, so a plan cannot omit the envelope.
7. **The sample report points to the capacity model.** Its duplicate capacity
   table is removed; `docs/capacity-model.md` is the single source for the
   numbers.

**What deliberately did not change.** No constitutional text, Usage Limit,
entity, canonical column, displayed column, page, role, module, or slice order
changes. The quota model of ADR-118 stands. The six-month horizon stands. No
technology is named, and the OCR choice remains the register gap R3 closes. No
R1 `plan.md` or `tasks.md` is created, no slice specification is created, and no
application code, package, schema, API, or migration is built.

**Alternatives considered.**

- *Leave the partition key to R3.* Rejected: the key determines the primary key
  and every reference, so discovering it in R3 forces a schema and read-path
  redesign.
- *Partition by `catalog_id`.* Rejected: the dominant deletion is the 90-day
  sweep, which is time-based; only a time key makes retention a partition drop.
- *Keep the capacity numbers in both documents.* Rejected: two sources drift, and
  the report is evidence rather than the envelope's owner.
- *Lower the envelope until the levers are measured.* Rejected: the owner
  accepted the range; the correct response is to measure the levers and re-size
  on a trigger, not to plan for a smaller corpus silently.
- *Put the partitioning rule in the constitution.* Rejected: the constitution
  excludes the physical schema, and this is a physical constraint.

**Consequences and migration/backfill.** `docs/capacity-model.md` §8.2, §9, §10,
§11, and §12 carry the accepted envelope and the two constraints;
`docs/architecture.md` §3 and §4 carry the time-based index; `plan-template.md`
binds the capacity model; `docs/pdf-sample-analysis.md` loses its duplicate table
and fixes the daily OCR arithmetic. The live `ADR-001 … ADR-120` range strings
move to `ADR-001 … ADR-121`, and `Project-Technologies.txt`'s header list gains
121 contiguously. The change is documentation-only: there is no production data,
no schema, and no code, so no backfill runs. Review date: 2026-11-23, and again
at R12's load test.

---

## ADR-122 — Local-first OCR and the extraction evidence gap

**Status**: Accepted — 2026-10-24
**Owning directory**: `docs/`
**Owning feature**: none — governance decision; ratified by the repository
owner. R3 consumes it.

**Context.** The sample measured the local Windows Arabic OCR engine at 1.3–2.6
seconds per page on five pages of the scanned file, but the engine returned about
20 text lines for a table of about 30 rows and merged columns and prices. The
Technology Standards register has an open gap for Excel, PDF, and Word
extraction, owned by R3, and naming a library before the gap is closed is
prohibited. The owner's decision is that OCR runs locally first; a cloud
document-AI service is a later option only after the local path proves it cannot
meet the extraction gate, and only with the owner's approval. The reason is not
cost alone: supplier price files are the product's data, and sending them to a
third party adds a data-terms and retention surface the product does not need if
the local path works.

**Decision.**

1. **OCR and table extraction run on the platform's own infrastructure first.**
   The local path is the default: a self-hosted OCR engine and table-structure
   extraction on the worker or a GPU pool the platform operates.
2. **A cloud document-AI service is a later, approved option.** It may be
   evaluated only after the local benchmark fails the extraction gate, and only
   with the owner's explicit approval. No provider is named by this record.
3. **The benchmark is the gate, not the vendor.** R3 measures Arabic accuracy,
   table structure, per-column precision and recall, time per 100 pages, and
   cost per 1,000 pages on 20–50 hand-labelled pages. The local path is measured
   first.
4. **The register gap stays open.** No OCR or table-extraction technology is
   added to the Technology Standards register by this record; R3 closes the gap
   through the gap process, with an ADR, a licence record, and a vulnerability
   scan.
5. **Data terms are recorded before any cloud use.** If a cloud path is later
   approved, its data terms and retention are recorded before the first page is
   sent.

**What deliberately did not change.** No constitutional text, Usage Limit,
entity, column, page, role, module, or slice order changes. No OCR vendor,
library, or service is named. The capacity envelope of ADR-121 stands; the OCR
worker row is a deployment note, not a new sizing decision. No R1 plan or tasks,
no slice specification, and no code are created.

**Alternatives considered.**

- *Choose a cloud document-AI vendor now.* Rejected: the register gap belongs to
  R3, the sample is a five-page lower-bound benchmark, and the data-terms surface
  is avoidable if the local path works.
- *Choose a local library now.* Rejected: naming a library before the gap's ADR,
  licence record, and vulnerability scan would violate the register-gap rule.
- *Leave the choice entirely to R3 with no policy.* Rejected: without a policy, a
  plan could default to a cloud service and add a data-processing surface the
  owner did not approve.
- *Run both paths in parallel now.* Rejected: it doubles the benchmark and the
  cost before the local path has been measured.

**Consequences and migration/backfill.** `docs/capacity-model.md` §9 and §11.1
carry the local-first note and the benchmark order; the register gap remains
R3's. The live `ADR-001 … ADR-121` range strings move to `ADR-001 … ADR-122`, and
`Project-Technologies.txt`'s header list gains 122 contiguously. The change is
documentation-only: there is no production data, no schema, and no code, so no
backfill runs. Review date: 2026-11-23, and again when R3's benchmark lands.

---

## ADR-123 — The 4.2.0 audit fix set: References, the exception register, and four document corrections

**Status**: Accepted — 2026-10-24
**Owning directory**: `.specify/memory/`, `.specify/templates/`, `docs/`, `AGENTS.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of constitution 4.1.0 checked the document against its
own rules rather than against its prose. Two register defects, one stale
rationale, and one inaccurate scope sentence survived, because
`governance-drift-check.mjs` verifies counts, version sources, ADR identifiers,
manifest hashes, and integration topology, but not whether References names every
project-level source, whether the paragraph binding sources to a reserved
decision lists the sources that exist, or whether a scope sentence describes the
point at which its tool runs.

`docs/capacity-model.md` and `docs/pdf-sample-analysis.md` are project-level
documents. The first is named by `AGENTS.md`'s source table, is the planning
authority for the load envelope, and is the document a plan's `Scale/Scope`
starts from (`plan-template.md` → Technical Context). The constitution named
neither. Single-Reference Sufficiency states that a feature MUST NOT need a
source outside this constitution, and that "every project-level source is named
in References" — so a plan was obliged to read a document the register did not
carry. The same omission left `docs/capacity-model.md` outside the closed list of
sources bound by an open reserved decision, because that list was written before
the capacity model existed (2026-10-23, ADR-117). The model currently honours the
reservation on its own (§7 and §11.2 leave the 90-day trigger point to R15), so
the gap is latent rather than breached.

The exception register's EX-001 and EX-002 justified their exceptions on the
premise that "the rule prohibits a dependency absent from the Approved register".
Since 2.19.0 both ClamAV and Lighthouse CI are rows of that register, and the
constitution's own note says those six rows "close a register gap rather than
open one". EX-003 to EX-006 already state the operative reason; EX-001 and EX-002
still argued from an absence that no longer holds, so their recorded rationale no
longer described the rule they except; EX-001's scope sentence separately
described a build-time and CI dependency for a scan the intake path runs at
upload time.

The same audit found four document defects: `docs/domain-model.md` lists rows 9
through 11 as registered facts although the constitution's Data entities rule
puts a field outside the register; `AGENTS.md` still describes the icon set as
unchosen and unregistered although ADR-098 chose it; `docs/pdf-sample-analysis.md`
still counts four undecided rules after ADR-120 decided one; and
`docs/capacity-model.md` states a storage figure drawn from the scanned-heavy
average without naming that average. None of the four changes a rule; each is
corrected so a reader meets the governing text.

**Decision.**

1. `References` gains two rows: `docs/capacity-model.md` as the planning
   authority for the load envelope, and `docs/pdf-sample-analysis.md` as the
   measured evidence behind its baseline, explicitly not a source of rules.
2. The reserved-decision paragraph's closed list of bound sources gains
   `docs/capacity-model.md`, so a future revision of the model cannot assert an
   answer a row below still reserves.
3. EX-001 and EX-002 are reworded to state the character of their Approved
   register rows rather than their absence from the register, and EX-001's scope
   sentence is corrected from a build-time and CI dependency to the separate
   scanning process the intake path invokes at upload time. The scope's boundary,
   approver, and review date are unchanged.
4. Four documents are corrected so each agrees with the authority it cites:
   `docs/domain-model.md`'s two statements that a field on a registered entity is
   a register fact (rows 9 through 11 are field-level, and the register is amended
   only where a field's existence is itself a product decision);
   `AGENTS.md` §4's description of the icon set as unchosen and unregistered
   (ADR-098 chose IconPark, while the register row stays open for R1);
   `docs/pdf-sample-analysis.md`'s count of four undecided rules (ADR-120 decided
   one, three remain); and `docs/capacity-model.md`'s 117 TB figure, which now
   names the 7.8 MB scanned-heavy average it is computed from.

**Deliberately not changed.** No principle, product scope, register count, usage
limit, entity, page, feature, module, or technology moved. The four open deferred
areas (extraction algorithm, file ingestion internals, authorization model,
retrieval interface) are untouched, and Catalog data shape stays discharged
(ADR-040). The icon-set register gap stays open and is not pre-empted here; R1
closes it through the gap process. No constitution rule was reworded to fit the
finding.

**Alternatives considered.**

- *Leave `docs/capacity-model.md` out of References and cite it only from the
  plan template.* Rejected: Single-Reference Sufficiency makes References the
  register of project-level sources, and a template is not a register. The rule
  would then be discharged by a document the constitution never names.
- *Treat the capacity model as detail of Technology Standards.* Rejected: it is
  a planning envelope, not a technology, and the register does not own load.
- *Delete EX-001 and EX-002 now that the register names both tools.* Rejected:
  each exception still carries an obligation — that the row is a scanner or a CI
  gate and never a runtime import — and deleting it would drop the record the
  reader needs. Governance requires an exception to carry its rationale; the
  rationale is corrected, not removed.
- *Do nothing because the drift check is green.* Rejected: a green check means
  the checked invariants hold. These fell outside its coverage, which is why
  the amendment records them here.

**Consequences and migration/backfill.** Constitution 4.2.0 (MINOR: the
references register gained two rows and a closed list of bound sources gained
one — materially expanded guidance rather than wording). The footer,
`.specify/memory/version.json`, and this index row agree at 4.2.0 / 2026-10-24.
Every live `ADR-001 … ADR-122` range string moves to `ADR-001 … ADR-123`, and
`Project-Technologies.txt`'s header list gains 123 contiguously. No principle is
affected, so no in-flight feature is re-evaluated against a changed principle;
`specs/001-identity-foundation/spec.md` changes only in the ADR range string its
references block carries. The four corrections in item 4 change no register,
count, identifier, or version source. The change is documentation-only: no
production data, no schema, and no code, so no backfill runs. The constitution's
sync impact report is review material and is not committed (Governance →
amendment procedure). Review date: 2026-11-24.

## ADR-124 — The blocked recovery confirmation, the replacement code's full period, the single security notice, and the journey criteria's delivery boundary

**Status**: Accepted - 2026-10-24
**Owning directory**: `specs/001-identity-foundation/`, `docs/`
**Owning feature**: none - product clarification ratified by the repository owner; R1 binds the rules and verifies them.

**Context.** A clarification session on 2026-10-24, after ADR-123, settled four
points the R1 specification still left open, each of which changed an observable
rule rather than a wording. The first was the recovery flow's confirmation for a
blocked account: FR-014 let the reset complete while the block stood, and
AC-016's confirmation told the merchant to sign in with the new password — a
sign-in the block makes impossible. The second was the pending request's
lifetime: FR-034 made a replacement take effect only when the messaging channel
accepted the new message, but never said whether that accepted dispatch restarts
the request's expiry, so a code requested near the end of a request's life could
be delivered already dead. The third was the notice count: FR-013 ends every
session when the password changes, and FR-043 requires a notice on a password
change and on a sign-out of every device, so one action appeared to produce two
SMS. The fourth was the journey criteria: SC-001 and SC-003 fix a three-minute
journey while the Assumptions exclude SMS delivery from "the response-time
criteria", leaving it unstated whether the wait for a code counts.

**Decision.**

1. **The blocked recovery confirmation states both outcomes.** When the
   recovery flow resets the password of a blocked account, the in-place
   confirmation states that the password was changed and that the account is
   blocked, and says plainly that sign-in stays refused until an administrator
   returns the account to active. The block is disclosed only after the code is
   verified, so FR-015's uniformity is untouched, and the page never promises a
   sign-in that cannot succeed.
2. **An accepted dispatch restarts the pending request's lifetime.** The
   request and the replacement code get the full period Constitution Mandated
   Values fixes, so a new code is never delivered with only the remainder of the
   request it replaced. The limit on requesting a new code bounds repeated
   extension, and a dispatch the channel refuses changes neither the code nor the
   expiry.
3. **One action produces one notice.** A password change sends a single notice
   that reports the change and the sessions it ended; those session endings are
   the change's own consequence rather than a second sign-out of every device,
   and the sign-out-of-every-device notice is sent when the merchant performs
   that action.
4. **SC-001 and SC-003 exclude the code's delivery after acceptance.** Both
   criteria measure the person's own actions and the platform's responses; the
   time a code spends in delivery after the messaging channel accepts it is
   excluded, the same boundary SC-009 already draws between the request and the
   delivery.

**What deliberately did not change.** No page, entity, role, product feature,
usage limit, security rule, technology, module, or constitution version changed
by this record; the constitution stays at 4.2.0 and the Constitution Mandated
Values set stays closed at its seventeen values. The Product Register's
twenty-seven pages, twelve entities, sixteen product features, and three roles
are untouched. The identifier set does not grow: no functional requirement,
acceptance criterion, or success criterion is added, renumbered, reused, or
withdrawn, so the counts stay 51 FR, 55 AC, and 9 SC. `docs/domain-model.md` is
corrected in the same change where decision 2 binds its
transient-verification-state expiry invariant. No application code, package,
CSS, or font file was created.

**Alternatives considered.**

- *Leaving the blocked account's confirmation generic.* Rejected: it would
  instruct the merchant to sign in with a password the block refuses, so the
  page would promise an outcome the platform cannot deliver; the person has
  proved ownership of the number and is no longer an unknown caller, exactly as
  FR-049 already treats a session holder.
- *Disclosing the block before the code is verified.* Rejected: it would reveal
  that the number has an account, breaching FR-015 and SC-004 for a person who
  has proved nothing yet.
- *Keeping the original expiry when a replacement is dispatched.* Rejected: a
  code sent late in a request's life would carry only the remainder of that
  life, so a legitimate person could receive a code that is already dead; the
  replacement is a new send and must carry a full period.
- *Capping the extension with an absolute maximum for the pending request.*
  Rejected: it adds an eighteenth value to a closed Constitution Mandated Values
  set, and the limit on requesting a new code already bounds how often the
  lifetime can be extended.
- *Sending two notices when a password change ends every session.* Rejected:
  two SMS for one action, and a consequence counted as a second event; the
  owner learns the same fact from one notice.
- *Counting SMS delivery inside SC-001 and SC-003.* Rejected: delivery is
  outside the platform's control, so the criterion would fail through no fault
  of the platform and could not be verified objectively; SC-009 already excludes
  it and the journey criteria now use the same boundary.

**Consequences and migration/backfill.** The R1 specification's FR-014, FR-034,
FR-043, SC-001, SC-003, the Key Entities note, the Assumptions, and the Test
Coverage Request carry the rules; AC-016, AC-036, and AC-047 assert them,
together with the edge cases the four answers touch. `docs/domain-model.md`
carries the expiry-restart invariant. The live `ADR-001 … ADR-123` range strings
become `ADR-001 … ADR-124` in the same change, and `Project-Technologies.txt`'s
header list gains 124 contiguously. The specification checklist is re-validated
and all twenty-two items still pass. No migration or backfill is required: the
change is specification prose, one decision record, one model correction, the
copied range strings, and a checklist re-validation. Review date: 2026-11-21.
This entry is the durable record.

---

## ADR-125 — The decision register split into an index and eight volumes

**Status**: Accepted — 2026-10-24. **Constitution version**: 5.0.0

**Owning directory**: `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** The decision register had grown to 663,427 bytes, 9,862 lines, and
124 records — about 166,000 tokens. No reader could load it in one pass, and the
reading protocol that told readers not to (ADR-071) was not enforced by anything
the repository runs. A manual count found that slightly less than half of the
volume was meta-governance: 31 constitution-amendment records and 24 audit/fix
rounds, against 69 product and engineering decisions. The register's own growth
rule was "append one record per amendment", so the file grew with the governance
process rather than with the product.

**Decision.** The register is the index and reading protocol in
`docs/DECISIONS.md` plus eight chronological volumes under `docs/decisions/`,
`volume-01.md` to `volume-08.md`, holding ADR-001 to ADR-124 as contiguous
ranges. Records are byte-identical to their previous text; only the file that
holds them changed. A new record is appended to the last volume; when it would
push that volume past the byte cap the drift check carries, the next volume is
opened in the same change, and the index row points to the volume that holds the
record. `governance-drift-check.mjs` gains section M: volume continuity, one
record per ADR number, index hrefs that resolve to the volume holding the
heading, a volume cap, and an index cap. The numbers live only in the check.

**Alternatives considered.**
- *Keep one file.* Rejected: unbounded, and already unreadable by any model in
  one pass; the protocol was discipline, not enforcement.
- *Index plus four volumes (~162 KB each).* Rejected: still above a comfortable
  single read, and the largest would keep growing.
- *One file per ADR (125 files).* Rejected: best atomicity, worst browsing,
  review, and diff noise for a register this size.
- *Split by kind (governance versus product).* Rejected: every amendment needs a
  classification decision, and the governance half grows fastest.
- *Generate `docs/DECISIONS.md` from the volumes.* Rejected: it preserves the
  648 KB artifact as the read target and adds a build step before R1 owns a test
  runner.

**Consequences.** A reader loads the index (about 29 KB) and one volume (at most
100 KB). The index is capped at 120 KB; passing it fails the check and forces a
second-level index decision instead of silent re-inflation. No live link outside
the index pointed at an `#adr-` anchor (measured: zero), so no external
reference broke. The original history stays reachable through `docs/DECISIONS.md`
and `git log -S`; `--follow` on a volume does not cross the split, because the
records were copied into new files while the index kept its own path. The churn
that filled the register is unchanged; reducing it is a separate decision.

**Migration (MAJOR).** The move is byte-preserving: every record was hashed
before and after with SHA-256, 124 of 124 matched. The hash comparison was a
one-time migration check; the committed drift check verifies structure, not
record text. The drift check's B, J, and reference passes were updated in the
same change; M was added. Acceptance tests
covered continuity, caps, href targets, and six negative mutations; rollback is
a revert of this commit and restores the single file with no manual
reconstruction. R1's specification carries
the live range string `ADR-001 … ADR-125`; no `FR`, `AC`, or `SC` identifier
changed, so R1's Constitution Check is unaffected.
