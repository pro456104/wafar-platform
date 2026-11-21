# Implementation Plan: File Intake

**Branch**: `002-file-intake` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-file-intake/spec.md`

## Summary

R2 delivers the merchant's Upload Catalog page and the intake behind it: one
Excel, PDF, or Word file is chosen, validated, transferred, screened, sanitized,
hashed, deduplicated, and recorded as the merchant's `Catalog` with status
`uploaded`. The page is the product's twenty-eighth page and the first page that
renders the shared shell, so the shell's runtime behaviour is exercised here and
exception `EX-007` ends at this slice's acceptance.

The technical approach: the `catalogs` module owns the record, the quota, and the
intake; bytes travel from the browser to SeaweedFS over presigned multipart URLs
and are never buffered in the API's memory; the API completes the multipart,
streams the object through the content checks, writes the sanitized file back to
object storage, computes the SHA-256 over the kept bytes, and creates the record
in one transaction that holds a per-merchant advisory lock. A persisted
per-merchant monthly counter and a per-merchant attempt counter live beside the
record; the content hash's uniqueness is one platform-wide partial unique index
over the catalogs that are not deleted. The page is composed from the Wafar UI
layer, which gains the upload control, the selected-file card, the progress
surface (with its screening phase), and the quota block.

**Status**: The specification is complete and clarified, and this plan and the
task list beside it are complete; the implementation is pending. The plan's gate
is PASS on every row: Principle VIII's deviation is accepted and registered in
the exception register on the repository owner's final acceptance, dated
2026-11-16 — widened by the twentieth pass to US3's duplicate panel and the
three US1 tasks that consume it — and Deployment and Observability is
PASS subject to the closing work its owner carries — the platform's health probe and the backup
drill's assertion are this slice's own work rather than an evidence gap, and the
file-bytes leg of the recovery objectives is the one recovery-evidence gap that
remains, accepted with its owner and its review date recorded against it; the
sample-evidence gap (PDF only) is recorded beside it in the tracking table. The
identifiers behind these statements — the tasks that close each item, the
tracking rows that carry them, and the later slices that own the deferred work —
live in this plan's gate, in its tracking table, and in the task list; the
specification carries none of them.

## Technical Context

**Reading rule for numbers.** Every number in this section is either a value a
Constitution Mandated Values row states, a plan value recorded in the section
itself, or a value carried by `Project-Technologies.txt` or by the committed
lockfile; a restatement names its source and is never a second authority.

**Language/Version**: TypeScript 5.x with strict mode mandatory (Principle II) —
every workspace enables `strict`, `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnusedLocals`, and
`noUnusedParameters`. Runtime: Node.js 22 LTS (`.nvmrc` = `22`, ADR-021).

**Primary Dependencies**: The constitution's Technology Standards register, whose
current version is read from `.specify/memory/version.json` and never restated
here (Governance), carries the bounds rather than exact versions: Nuxt 4, Vue 3,
Nuxt UI v4, Tailwind CSS v4, TanStack Query, Zod, Hono, better-auth, Drizzle ORM,
PostgreSQL 16+, SeaweedFS, ClamAV, PgDog, and Lighthouse CI. Every exact version
R2 consumes is a value `Project-Technologies.txt` carries for a technology the
register names, and a value the committed lockfile records for a package the
register does not: the four libraries below are register gaps this slice records
in Complexity Tracking rows 15–17 and that `Project-Technologies.txt` does not
name, so the committed lockfile alone carries their exact versions and the
register amendment that adds them is due at R2's acceptance. R2 adds four direct
runtime dependencies to `apps/api`, each recorded with its licence obligation,
vulnerability scan, and review date in Complexity Tracking: **`aws4fetch`**
(MIT) signs the S3 requests and presigned URLs against
SeaweedFS's S3 gateway; **`fflate`** (MIT) reads and rewrites OOXML containers;
**`cfb`** (Apache-2.0) reads and rewrites OLE2 compound files; **`pdf-lib`**
(MIT) parses, inspects, and rewrites PDFs. No client library is added for the
scanner: the `catalogs` module speaks clamd's INSTREAM protocol over Node's
`net` module, so ClamAV stays the separate process `EX-001` fixes. The scanner
client and the storage client are the two register gaps this slice records
(ADR-172, ADR-173); the content-inspection set is CMV row 12 and ADR-171. No
capability is used before its record exists. TanStack Query owns the page's
quota state; Pinia is not introduced because the page has no client store beyond
the upload's own state.

**Storage**: PostgreSQL 16+ through `packages/db` for `catalogs`,
`catalog_monthly_uploads`, `catalog_upload_attempts`, and the transient
`catalog_upload_sessions` (see `data-model.md`); SeaweedFS through its S3 gateway
for the original upload's parts and the kept sanitized file. The object layout is
`intake/{uploadId}/original` for the multipart object and
`catalogs/{catalogId}/{sha256}.{ext}` for the kept file. The API never buffers
the transfer in memory: the transport legs stream between the object, the
bounded workspace file, the scanner, and the kept object, and the inspection
steps read one bounded working copy of the compressed file, at most the 100 MB
ceiling (ADR-180). The workspace directory is process-local, and **its bound is
per file, not for the directory's total**: one working copy of an incoming file
is at most the 100 MB ceiling — the accepted file size, byte for byte — and the
sanitized copy the sanitizer writes beside it is **not** counted inside that
100 MB; it is a file of its own with the same per-file ceiling, so one request's
peak workspace footprint is at most twice the accepted file's size, and the
directory's total is bounded by the concurrency the environment is sized for
(Scale/Scope), not by the 100 MB ceiling. **The workspace file is deleted before
the intake answers, on both outcomes**: the local working copy of the incoming
file and the sanitized copy the sanitizer wrote beside it are removed when the
intake completes and when it is refused, so neither a completed nor a refused
request leaves a workspace file behind; the per-file ceiling stays the 100 MB
above — the accepted file size, byte for byte — and the directory's total stays
bound to the concurrency the environment is sized for (Scale/Scope), never to the
file ceiling. **No sweep runs in this slice**: the
periodic work — the removal of a workspace file whose request died, the abort
and deletion of an expired session and its staging object, and the removal of
the counter rows past their window — is one deferred obligation, recorded as
Complexity Tracking row 23 with its owner and
its review date — no task in `tasks.md` runs any of them — and `data-model.md`
§9 states each statement's predicate as the contract the owning slice implements
rather than a sweep this slice performs. What R2 hands that sweep is the state
it reads: the session's `state` and `url_expires_at` (T010), the recorded
`original_key` and `sanitized_key` (T038), and the two counter tables' window
columns. **A departure during the transfer (FR-050)** is answered without a
sweep, on both sides: the page's transport stops its in-flight part writes by
calling `abort()` on each part's own `XMLHttpRequest` — the transport is
`XMLHttpRequest`, one request per 8 MB part, because it reports the upload
progress the page's percentage is drawn from and `fetch` does not, so the request
object's own `abort()` is what stops a part write in flight — and, while the
progress state is the transfer phase, sends
`DELETE /api/v1/uploads/{uploadId}` from a `pagehide` listener through
`fetch(…, { keepalive: true })` — a bodyless, beacon-sized request carrying R1's
CSRF token — so leaving the page does what «إلغاء» does; and the server aborts
only an `open` session, a `completing`, `done`, `failed`, or `aborted` row being
a no-op, because a transfer whose bytes are complete belongs to the platform and
not to the page. **What the abort does to the bytes is two operations, not one**:
`abortMultipart` is the operation that withdraws the transfer's unfinished parts
— an unfinished part is not an object — and `delete` (S3's `DeleteObject`)
removes only the completed staging object, so the route calls the abort for the
upload and then the delete for `intake/{uploadId}/original` when the object
exists. The proof that nothing survives reads both surfaces: the parts list is
`ListParts` on that key, which answers `NoSuchUpload` once the abort has run and
which the adapter's `listParts` presents as an empty list, so the assertion is
one shape — `parts.length === 0` — and the object listing is asserted beside it.
If that request never arrives, the backstop is structural rather than a timer: the
complete route accepts only the caller's `open` session, every part URL expires
15 minutes after it is signed so no further byte can be written, the staging
object is private and reachable by no product read, and nothing is recorded or
counted before the complete request accepts.
OpenSearch is not read or written by R2.

**Testing**: Vitest for unit and integration, including the unit specs under
`apps/web/tests/unit` (jsdom + `@vue/test-utils`), Playwright for end-to-end and
the visual baseline, `@axe-core/playwright` for the automated accessibility scan,
and Lighthouse CI for the pages the preview server can render without a session.
The public HTTP contract is generated from the Zod schemas in
`packages/shared/src/contracts/**` and the route table by
`apps/api/src/http/openapi.ts`, emitted to `apps/api/openapi.json`; the **first
standalone documentation-drift test** (ADR-031 item 4) compares that document,
the routes the app registers, and `contracts/intake-api.md` §2–§4, and runs in
CI from this slice. The scanner is replaced by a deterministic local test double
that speaks the clamd protocol and fixes a 150 ms scan; the storage is a local
SeaweedFS container. The load run uses the same double.

**Target Platform**: Linux VPS (deployment, the three environments with staging
parity, and the monitoring and alerting set are R12's); modern browsers — the two
latest major versions of Chrome, Edge, Firefox, and Safari, desktop and their
mobile variants. The page is merchant-only and renders in the shared shell.

**Project Type**: Monorepo — `apps/` (web, api; admin and worker belong to later
slices) + `packages/` (shared, db, ui, config; search belongs to R3). See
`docs/architecture.md`.

**Performance Goals**: At the load condition below, the quota read (the page's
`GET /api/v1/catalogs/quota`) is p50 ≤ 200 ms and p95 ≤ 500 ms; the pre-sign
request (`POST /api/v1/uploads`) is p50 ≤ 300 ms and p95 ≤ 800 ms; the complete
request for a 1–4 MB file, including the scan and the sanitizer, is p50 ≤ 3 s and
p95 ≤ 10 s. No query R2 introduces exceeds 100 ms at p95. The page shows the
quota state within 2 s for 95% of loads (SC-006), and 95% of typical uploads are
confirmed within 1 minute of selection (SC-007); the rendering budget (LCP ≤
2.5 s, INP ≤ 200 ms, CLS ≤ 0.1) is asserted for the pages the preview server can
render, and `/upload` is not in that set for the reason Complexity Tracking
records.

**Constraints**: (readings of the Usage Limits table and CMV rows 12, 15, and 20;
a value changes there first) Maximum file size **100 MB** (100 × 1024 × 1024
bytes); a file of exactly 100 MB is accepted for validation and one byte more is
refused; an empty file is refused. Monthly limit **50** per calendar month
(Libya local time), active limit **300** stored non-deleted files; administrator
override up to **500** / **1,500** (ADR-118). The decoded-size cap is **1 GiB**
of decoded content; the scan budget is **90 seconds**; the upload-attempt bound
is **60 attempts per 15-minute fixed window** per merchant, the window's
boundaries being UTC's (CMV row 20). The pipeline has **six steps and five timed
budgets**, because the decoded-size cap is measured twice: the original decode
before the sanitizer, in the cap's own read, and the sanitized decode after it,
counted as the sanitizer writes the kept bytes, so the second measurement takes
no read of its own and spends the sanitizer's budget. The five stage budgets are
this plan's own values, recorded below rather than read from the Usage Limits
table, **in FR-029's order**: the content probe **5 s**, the scan **90 s**, the
decoded-size cap's read of the original decode **5 s**, the sanitizer **10 s**
(which carries the executable content's removal and the sanitized decode's
measurement), and the reopen **5 s** — **115 s** in all, the **sum of five
budgets, not a sequence of intervals**: each bounds its own step, and the total
sits inside the page's 120-second client timeout, with the last 5 s the room the
completion, the kept object's write, the acceptance transaction, and the
response have. Every stage
that overruns its budget is answered as the cause that stage produces and is
never left waiting. The workspace sweep's **bound** — every
five minutes, and files older than one hour — and the counter rows' windows are
recorded here for the sweep that owns them; every sweep is outside this slice
(Complexity Tracking row 23, owner R3). The transport's part size is 8 MB, with
at most 13 parts for a 100 MB file. The 90-day retention
is counted from the upload timestamp (ADR-131); no R2 path deletes a catalog.

**Scale/Scope**: The starting point is `docs/capacity-model.md` → §3.1: 350,000
uploads/month at design and 500,000 at stress; 300 concurrent uploads at design
and 600 at stress; 300 API requests/second at design and 600 at stress; 2.28 MB
average file size, 80.3 pages per file, 31.7 rows per page, 5.3% scanned; 2.4 TB
raw 90-day file storage at design and 3.4 TB at stress. R2's own measurement
condition is **300 concurrent transfers, 10 pre-sign requests/second, and 10
completed intakes/second** (300 concurrency × a 30-second average transfer ≈ 10
completions/second), with 10,000 accounts and 50,000 catalogs seeded. SC-007
states the client condition that average implies — 2.28 MB in 30 seconds, about
76 KB/s per stream — and the run paces each sampled upload's part writes at it,
so the transfer's share is the model's own. The stress
condition doubles the concurrency and the rates (600 / 20 / 20). The deviation
from the capacity model is none at design; the stress case is the capacity
model's own and is exercised by the load run's second phase.

**The 10/s rate is a burst, not the envelope's rate.** The model's 350,000
uploads a month average about 0.14/s, while 10/s is the completion rate the
model's own design concurrency produces at its 30-second transfer (300 ÷ 30), and
the run's 1,200 completed intakes in 120 seconds are 0.34% of the monthly
envelope. The condition is therefore a burst the envelope admits — the capacity
model sizes the upload path by concurrency (§3.1), not by an instantaneous rate —
and not a sustained rate the envelope promises. **The workspace's aggregate
disk** is the figure Technical Context's per-file bound needs: at the per-request
ceiling, 300 concurrent transfers × 200 MB = **60 GB** at the design condition
and 600 × 200 MB = **120 GB** at the stress condition, so the environment sizes
the workspace for 120 GB; the typical case is far smaller — 300 × 4.56 MB ≈
1.4 GB — because 200 MB is the ceiling, not the average.

**Plan values that are not Constitution Mandated Values** (recorded here because
the constitution's closed list does not enumerate them, and referenced by the
tests that assert them):

- **The date pattern**: every date the product shows a merchant is the Gregorian
  calendar with Latin digits in the pattern `YYYY-MM-DD` (for example
  `2026-11-12`), rendered by one shared surface in `packages/shared/src/format/`
  and consumed by the duplicate outcome, R4's My Files table, and R6's Catalog
  table. The calendar month is `Africa/Tripoli`'s, and its boundary is that
  timezone's midnight on the first day, computed from the injected clock rather
  than the database's `now()`. The operational record's `timestamp` reads that
  same injected clock, once at settlement, and never the database's `now()`; its
  format and zone are `contracts/intake-api.md` §1's.
- **The size display**: a file smaller than 1 MB reads in KB with no decimal; a
  file of 1 MB or more reads in MB with one decimal (for example `2.3 MB`); the
  numeral component renders the digits in Latin form.
- **The wait's display**: the attempt-bound refusal states the remaining seconds
  in Arabic with the agreement class the value requires — 1 «ثانية واحدة», 2
  «ثانيتين», 3–10 «N ثوان», 11–900 «N ثانية» — through one shared duration
  surface in `packages/shared/src/format/duration.ts`, so no message composes a
  numeral and a counted noun by hand.
- **The status vocabulary**: `uploaded` reads «تم الرفع», `processing` reads
  «قيد المعالجة», `completed` reads «اكتمل», and `failed` reads «فشل» (FR-044);
  the raw registered value is never shown. The Arabic mirror
  `Core-Project.txt` carries a second wording of two of these labels, which a
  separate manual change amends outside this slice's artifacts (Complexity
  Tracking row 24).
- **The screening phase** is a phase of the progress state, not a new page state:
  the determinate transfer becomes the indeterminate «يجري فحص الملف» phase when
  the last part is acknowledged, and «إلغاء» is withdrawn at that point.
- **The transfer's stall bound**: **30 seconds** without a progress event on a
  part write. At SC-007's stated uplink an 8 MB part takes about 105 seconds and
  reports progress every second, so 30 seconds of silence is a dead connection
  and not a slow one; the page stops that part's request and answers FR-049's
  transfer failure — its retry and «اختيار ملف آخر», the held file kept for the
  retry — never a cancel. «إلغاء» remains the merchant's control and a departure
  remains FR-050's, and no cause joins FR-064's seventeen.
- **The intake's stage budgets, in FR-029's order**: the content probe **5 s**,
  the scan **90 s**, the cap's read of the original decode **5 s**, the sanitizer
  **10 s** (the executable content's removal and the sanitized decode's
  measurement), and the reopen **5 s**. They are a **sum of five budgets, not a
  sequence of intervals**, and **the cap is measured a second time, on the
  sanitized decode, as the sanitizer writes the kept bytes** — the members and
  streams it writes are what is counted, and a retained member's decoded size is
  the one the first read confirmed — so that measurement takes no read of its own and
  spends the sanitizer's 10 s, and the path's six steps keep five budgets. The
  five sum to **115 s**, inside the page's 120-second client
  timeout; the remaining 5 s are the room the complete request has for the
  multipart's completion, the kept object's write, the acceptance transaction,
  and the response. A stage that overruns its budget is answered as the cause
  that stage produces and never left waiting: the probe's or the cap's first
  read's
  overrun is `UPLOAD_CORRUPT` (a file that cannot be read, not one that crossed
  the cap), the sanitizer's, the sanitized decode's measurement's, or the
  reopen's is `UPLOAD_SANITIZATION_FAILED`, and the scan's is
  `UPLOAD_SCAN_UNAVAILABLE`; a sanitized decode that crosses the cap is
  `UPLOAD_EXPANSION_CAP`; no cause is added to FR-064's closed
  seventeen. The screening phase is the presentation for the whole of that time,
  an upload that passes a minute included: it adds no percentage, no elapsed-time
  count, no second announcement, and no separate slow-upload presentation, so
  SC-007's slow tail is measured over the same eleven presentations as every
  other upload (SC-008).
- **The parsers' bounds**: the XML reader resolves no DTD and no entity beyond
  the five built-ins and numeric references, and a `DOCTYPE` is
  `UPLOAD_CORRUPT`; XML nests at most **64** elements; an OOXML package holds at
  most **65,535** central-directory entries; an OLE2 directory holds at most
  **65,535** entries and every FAT chain is walked with a visited set; a PDF
  holds at most **1,000,000** indirect objects and its page tree, `/Next`
  chains, and action nesting run at most **64** deep; `[Content_Types].xml` and
  each `*.rels` part are at most **4 MiB** of text. The bounds count the file's
  own structures, not its decoded bytes — the 1 GiB cap measures expansion and
  stops neither a million objects nor a 10,000-deep tree — and a bound crossed
  is `UPLOAD_CORRUPT`, because the declared type cannot be read
  (`contracts/intake-formats.md` §3.5). The same bounds run on the reopen, where
  crossing one is `UPLOAD_SANITIZATION_FAILED`.

### Constitution Mandated Values

| # | Value | This plan records |
|---|-------|-------------------|
| 1 | Migration tool (the single one) | **Drizzle Kit** (`drizzle-kit`) generating SQL migrations from `packages/db/schema/`, applied by `drizzle-orm`'s migrator. The tree already carries R1's three steps — `0001_identity_foundation`, `0002_identity_foundation_previous_code`, and `0003_phone_verifications_payload_checks` with its `.down.sql` — so the pre-R2 applied-step count is **3**. R2 adds `packages/db/migrations/0004_file_intake.sql` and its paired `0004_file_intake.down.sql` (the four tables, the partial unique index, the checks, and the foreign keys) as one reversible step; the down is the exact inverse and the applied-step count returns from 4 to 3 when it runs. |
| 2 | Password hashing cost factor | **Not introduced — no authentication surface.** Every route consumes R1's session through the shared entry point; no password is read, written, or hashed. |
| 3 | Authentication rate limits | **Not introduced — no authentication endpoint.** The upload-attempt bound is a resource-intake limit, not an authentication rate limit, and is CMV row 20. |
| 4 | Session timeout and token lifetime | **Not introduced — no session surface.** The page consumes R1's cookie and the shared entry point's 30-minute inactivity and 12-hour absolute clocks unchanged. |
| 5 | Dependency budget (direct runtime dependencies) | **≤ 30 per workspace and ≤ 60 repository-wide**, counting a workspace's `dependencies` only: a `workspace:*` entry is the repository's own code rather than a third-party dependency, and `devDependencies` are outside the count. **R1's basis**: `apps/api` carries **7** external direct runtime dependencies — its nine `dependencies` entries less the two workspace packages `@wafar/db` and `@wafar/shared` — and the five `devDependencies` are not counted; **R2 adds four** (`aws4fetch`, `fflate`, `cfb`, `pdf-lib`), so the estimate is **`apps/api` 11 of 30** (7 + 4). `apps/web`, `packages/ui`, `packages/shared`, and `packages/db` are unchanged. |
| 6 | Performance budget percentiles (p50 / p95) | **Quota read p50 ≤ 200 ms / p95 ≤ 500 ms; pre-sign p50 ≤ 300 ms / p95 ≤ 800 ms; complete (1–4 MB, scan and sanitizer included) p50 ≤ 3 s / p95 ≤ 10 s**, at 300 concurrent transfers, 10 pre-sign requests/second, and 10 completed intakes/second, under Scale/Scope. **The same values govern both load conditions**: the design condition (300 / 10 / 10) and the stress condition (600 / 20 / 20), so the stress phase is read against this row and not against a second set of values. **The scan's 90-second budget is a refusal threshold, not a target inside the p95**: a completion whose scan runs near its ceiling is one of the at most 5% above 10 seconds the percentile permits, and the row fails when more than 5% of a phase's completions exceed 10 seconds. SC-006's 2-second quota visibility and SC-007's 1-minute confirmation are the product bounds; this row restates the service bounds the load run measures. |
| 7 | Maximum query execution time | **100 ms at p95** for any single query R2 introduces; connection `statement_timeout` = 2 s as the hard ceiling. |
| 8 | Recovery Time Objective (RTO) | **4 hours** for the intake's persistent state — the PostgreSQL restore plus the object-storage restore plus the API's start — the same platform target R1 records (ADR-142). The object-storage leg has no runbook or drill yet; Complexity Tracking records that gap with R12 as owner and a review date, and no success criterion in this slice measures the number. |
| 9 | Recovery Point Objective (RPO) | **15 minutes**, through PostgreSQL's continuous WAL archiving (archive interval ≤ 60 s) plus a nightly base backup, and SeaweedFS's replication for the kept files. The file store's off-host backup is the same recorded gap: replication is not a backup, and the row is not claimed as evidenced until R12's runbook and drill exist. A write inside the window may be absent at the restored point and is read as absent. |
| 10 | Runtime version | **Node.js 22 LTS** (unchanged): `.nvmrc` = `22`, `engines.node` = `>=22 <23`, the CI image fixes the exact 22.x patch, and the lockfile records every package version. ADR-021. |
| 11 | Icon set | **IconPark**, Apache-2.0, **outline cut consumed** at 20px; the colour cut is vendored and not consumed; both cuts are vendored under `packages/ui/vendor` and pinned by SHA-256; no emoji. R2 adds no icon outside the vendored set; an icon the page needs that the set lacks is added by ADR, per ADR-098. The upload control, the progress surface, and the outcome actions consume the layer's `WfIcon`. |
| 12 | Extraction libraries | **The intake's content-inspection set**: `fflate` (MIT) for OOXML container reading, member measurement, and rewrite; `cfb` (Apache-2.0) for OLE2 compound files; `pdf-lib` (MIT) for PDF parsing, encryption detection, executable-content removal, and the re-open; Node's built-in `crypto` for SHA-256 and `zlib` for stream inflation. R3 extends this row with extraction libraries. Register-gap closure: ADR-171 records the three libraries, their licences, and the vulnerability scan; the row states the set, the Complexity Tracking row records the obligations. |
| 13 | Transactional SMS transport | **Not introduced — no SMS surface.** |
| 14 | Continuous-integration provider | **GitHub Actions** (unchanged). The new `intake` job runs offline against a local SeaweedFS container and a local ClamAV container (or the deterministic scanner double); the dependency-install step remains the only networked step, and every action stays SHA-pinned (ADR-143). |
| 15 | Decoded-size cap that rejects a zip-bomb upload | **1 GiB (1,073,741,824 bytes) of decoded content per file**, measured by streaming decode for every inspected format: an OOXML/zip member's uncompressed size and a PDF stream's inflated size both count. The measurement stops at the cap and refuses; no decoded content is held in memory beyond the streaming window. ADR-174. |
| 16 | Supported-browser statement | The **two latest major versions of Chrome, Edge, Firefox, and Safari**, desktop and their mobile variants; the visual baseline is generated with the Playwright-pinned Chromium. |
| 17 | Password policy parameters (minimum length and the common-or-breached-password source) | **Not introduced — no password field.** |
| 18 | One-time-code lifetime, re-request limit, and incorrect-entry bound | **Not introduced — no one-time-code surface.** |
| 19 | Profile field maximum lengths (full name, shop name) | **Not introduced — no profile field.** |
| 20 | Upload-attempt bound and its window | **60 attempts per 15-minute fixed window per merchant, on UTC boundaries** — the window starts at a UTC minute that is a multiple of 15 and is never moved by a request, so the same merchant's 61st attempt inside one window is refused whatever its spacing. Enforced on the server after the file-level checks (FR-021–FR-024) and a limit refusal decided at the pre-sign check (FR-013), so neither counts as an attempt; a submission that reached the counter and was later refused for a limit at acceptance was already counted. The value is recorded here because the constitution's closed list carries it (7.0.0, ADR-175) and the plan template's row 20 states it in the same words; the counter itself is ADR-168 and `data-model.md`'s `catalog_upload_attempts`. |

### Verification Notes *(required where applicable)*

- **N+1 inspection**: Every path R2 introduces is a bounded set of point reads or
  one aggregate. The quota read is three statements: the month's counter row and
  the active count in `catalogs/repository/counters.ts`, and the account's
  status and two overrides through the account-context port, whose contract is
  `packages/shared/src/contracts/account-context.ts` and whose implementation is
  `users`' own service, injected by `apps/api/src/http/deps.ts` — `catalogs`
  imports no path under `modules/users`, neither its service nor its
  repository; the pre-sign request is the
  session read, the counter and active reads, one counter upsert, and one
  multipart-create call; the complete request is the session read, the object's
  head, the screening work, one advisory lock, the quota reads, one insert, one
  counter upsert, and one duplicate projection when the insert conflicts. No path
  loops a query per row. **The statement set is the design's bound and the load
  run is what measures it**: `scripts/load/upload-smoke.mjs` reports the slowest
  query from `pg_stat_statements` and fails the run on any statement above the
  100 ms p95 budget (CMV row 7), so a path that adds a per-row query surfaces as
  a statement over its budget or as a percentile above its CMV row. **No test
  asserts a statement count**: the integration and quota suites assert the
  outcomes those statements produce — the quota's counts, the record, the
  duplicate, and each refusal — and this plan claims no count assertion.
- **Caching**: No server-side cache is introduced. The page's quota state is
  server state and is owned by TanStack Query, keyed by the authenticated
  account; its invalidation rule is stated and is the only one: it is invalidated
  after every intake outcome, when the page becomes visible again, and at the
  calendar month's boundary while the page is open. There is no TTL — the
  invalidation events are the rule, and a failed read renders the inline failure
  rather than a stale count. The read carries a **5-second** client bound from its
  dispatch, ten times the CMV row's quota-read p95 of 500 ms: at the bound the
  page stops the request and renders the inline failure and its retry, the
  loading state ends there, and the query makes no automatic retry, so a new read
  comes only from the retry control or an invalidation event.
- **Departure and its backstop (FR-050)**: three observations, one per leg. The
  e2e case leaves the page mid-transfer and asserts that the page's last request
  is the bodyless `DELETE` sent with `keepalive`, that the session row reads
  `aborted`, that no object remains under `intake/{uploadId}/`, and that the
  catalog count and the monthly counter are unchanged. **The empty-storage
  assertion reads the multipart's part list as well as its objects**: the case
  calls the adapter's `listParts` on `intake/{uploadId}/original` — S3's
  `ListParts`, which answers `NoSuchUpload` once the abort has run and which the
  adapter presents as an empty list — and requires the aborted upload's part list
  to be empty, because an unfinished part of a multipart upload is not an object
  and an object listing alone would pass while the parts of the abandoned
  transfer survived; the object listing is asserted beside it. The API
  integration case sends the same `DELETE` against a `completing` session and
  asserts a `204` no-op: the catalog is created, the quota is consumed, and the
  record is visible, so a beacon that fires as the screening starts cannot cancel
  the intake (AC-010). The backstop's third leg is asserted without the beacon at
  all: the complete route answers `404` for a session that is `aborted`,
  `failed`, or not the caller's, and a part URL that outlives its 15-minute
  expiry fails the signature, so a departure whose request never arrived leaves
  no catalog, no quota, and no writable URL.
- **Accessibility verification — the automated scan.** "No reported violation"
  means zero violations of any impact — `minor`, `moderate`, `serious`, and
  `critical` alike — among the five WCAG tags the run selects: `wcag2a`,
  `wcag2aa`, `wcag21a`, `wcag21aa`, and `wcag22aa`. The tool is
  `@axe-core/playwright` resolving `axe-core` **4.14.0** through the committed
  lockfile, in the Playwright-pinned Chromium; a `best-practice` finding is not a
  violation of SC-008's ruleset and is recorded beside the result, and a run whose
  report does not echo the `axe-core` version, the browser version, and the five
  tags is void. The scan runs over every page presentation at 320 and 1280 CSS px
  in both appearances — the **44 accessibility presentations** (11 × 2 × 2) — and
  **the 44 set is unchanged by this pass**: no shell runtime state enters it, and
  a later clarify decision that adds one must name the new count explicitly (six
  shell states × two widths × two appearances would add 24, for 68) rather than
  leave it implicit. The 375 px width the Design conformance note's baselines use
  is the visual set and does not enter the ratio.
- **Accessibility verification — the manual keyboard-only pass.** The pass is
  manual, per Principle IV: the observer's name and role, the date, the browser
  and its version, the assistive technology and its version, the route and every
  control and outcome the pass walked, and the result are recorded in the pull
  request's accessibility record. The instrument is NVDA, the latest stable
  release, with the Arabic voice on Windows 11, in the latest supported Chrome;
  both versions are named in the record rather than left to the run. The pass
  completes an upload without a pointer at 320 and 1280 CSS px and walks the file
  picker, the
  drop area's keyboard operation, the cancel control, the retry, the outcome's
  actions, and the focus movement FR-006 fixes: focus moves to the state now
  shown (its programmatically focusable heading or its first action), never
  remains on a removed control, and returns to the upload control from an
  outcome's action. It asserts that each state change is announced once through
  the channel the contract's §7 names, never twice and never per percentage. The
  pass is the separate observation SC-008 names and is not part of the 44 ratio.
- **R1's accessibility floors are inherited, not rebuilt.** The touch floor, the
  `:focus-visible` ring, `prefers-reduced-motion`, and the document's
  `dir="rtl" lang="ar"` are fixed by R1's contract §2 and §3.4
  (`specs/001-identity-foundation/contracts/ui-contracts.md`) and by the layer's
  token contract; this slice consumes them and adds no second rule. The evidence
  is `packages/ui/app/assets/css/tokens.css:55-57,73` — the focus trio, the focus
  colour, and `--wf-touch-floor: 44px` — and
  `packages/ui/tests/tokens.spec.ts`, which asserts the 2 px focus width, the
  2 px offset, the focus colour's 3:1 contrast on the light and dark surfaces,
  and the 44 px touch floor; the design conformance gate (ADR-129) guards the
  rendered result. `packages/ui/tests/shell/accessibility.spec.ts:67-76`
  gate (ADR-129) is what guards it. `packages/ui/tests/shell/accessibility.spec.ts:67-76`
  asserts that no shell component sets a direction or language of its own, and
  `apps/web/app/app.vue` sets the document's `lang` and `dir` once. The reduced
  motion rule is in the components that animate —
  `packages/ui/app/components/shell/WfShellBottomBar.vue:37,172`,
  `packages/ui/app/components/WfLoadingBar.vue:77`, and
  `packages/ui/app/components/WfContentSkeleton.vue:60` — and the motion tokens
  are pinned by the same token test. R2's components consume the tokens and set
  no base language or direction; a page or layer that restates a floor fails the
  token contract or the baseline, not a second R2 test.
- **Announcements and assistive-technology state exposure.** The contract's §7
  carries exactly two live regions — one polite and one assertive — and never one
  region with two politenesses; every announcement in §3 is assigned to one of
  them. The state heading's own text is the focus announcement and is not copied
  into a region: when a change moves focus to a heading, focus is authoritative
  for the state's name and the region carries only the part the heading does not
  — the body or the cause — so no sentence is spoken twice. The quota block
  exposes loading, exhausted, and read-failure states to assistive technology,
  not only to the eye; the quota update is announced once per settled read whose
  counts differ from the previous settled read; the multi-file notice leaves the
  accessibility tree when the next selection or drop replaces it; and
  `WfFileName` hides the visually cut run from assistive technology while keeping
  the whole name as the accessible name once.
- **Design conformance**: The page ships the eleven presentations of the UI
  contract's §3 set, each baselined by its own name: idle/choosing, selected,
  uploading — transfer, uploading — screening, success, duplicate, error, quota
  exceeded, quota loading, quota read failure, and the multi-file notice; the
  multi-file notice is a presentation of the choosing state and adds no state
  (SC-008, FR-020). The visual baseline set is
  **11 presentations × 2 widths (1280 and 375) × 2 appearances = 44 visual
  baselines**, generated in CI with the Playwright-pinned Chromium and the
  self-hosted fonts. The reference set captures the idle state alone: the five
  states the slice map lists for P1 — selected, uploading, success, duplicate,
  and error — have no reference image, and the three quota presentations and the
  multi-file notice are composed from the contract; the gap is Complexity
  Tracking row 5. The **44 visual baselines** are a different sample from the 44
  accessibility presentations above: these are measured at 1280 and 375 CSS px,
  and the 320 CSS px width of the accessibility set enters no baseline.
  The contract test asserts the layer's recorded values (ADR-128) and the
  components consume the layer's tokens; the gate is ADR-129.
- **Budget check**: `scripts/load/upload-smoke.mjs` drives 300 concurrent
  transfers with 10 pre-sign requests/second and 10 completed intakes/second for
  120 seconds against a seeded database (10,000 accounts, 50,000 catalogs), a
  local SeaweedFS, and the deterministic scanner double at its 150 ms scan. It
  reports p50 and p95 for the quota read, the pre-sign, and the complete path as
  **nearest-rank percentiles**: the samples are sorted ascending, p50 is the
  sample at ⌈0.50 × n⌉ and p95 the sample at ⌈0.95 × n⌉ — the smallest measured
  sample at or above which the stated share lies — with no interpolation, so
  every reported percentile is a sample the run measured. It also reports the
  slowest query from `pg_stat_statements` and the accepted, duplicate, and
  refused counts by cause. The design and stress phases fail on any refusal other
  than the fixture's expected duplicate. Each sampled page load is a cold load in
  a fresh browser context with an empty cache, measured from the navigation's
  start to the first frame in which the quota block shows its settled
  presentation — the counts, the exhausted content, or the read failure — so
  SC-006 never reads a cache a previous load warmed. Each sampled upload's part
  writes are paced at SC-007's stated uplink — 2.28 MB in 30 seconds, about
  76 KB/s — so the transfer's share is the capacity model's design client's and
  not the host's loopback speed, and each phase's started uploads settle after
  its window, the drain being part of the measurement. The run fails on a
  measured query above 100 ms p95 or on a percentile above its CMV row at either
  condition, the row's values being the same at the design and the stress phase.
  A measured regression above 10%
  against the branching version blocks release. The run's second phase repeats at
  600 / 20 / 20 for 120 seconds and is the capacity model's stress case: 600
  concurrent transfers, 20 pre-sign requests per second, and 20 completed intakes
  per second. The quota-boundary run is a SEPARATE run of the same script, with
  its own sample and its own report: 600 uploads across 10 merchants, each
  merchant running 60 uploads in one fixed 15-minute window, expecting one
  acceptance and 59 limit refusals per merchant and recording the counts by cause
  against SC-005. It is not a phase of the 3,600-load run, and SC-005's sample is
  that run's 600 uploads while SC-006's and SC-007's samples are the design and
  stress phases' 3,600 page loads and 3,600 uploads only. The five timed budgets
  are asserted apart from the load run: T054's safety suite stalls the work at
  each of them — the sanitized decode's measurement inside the sanitizer's
  budget — and asserts the cause that overrun answers, so a budget
  that is not enforced fails a named case and never waits for the client timeout.
- **Principle V's measurement**: the three measures the principle fixes —
  Arabic text, Latin numerals, and no emoji — are measured by the one scan the
  platform already has, extended and never replaced: R1's copy scan
  `apps/web/tests/unit/user-facing-strings.spec.ts` keeps its place, its closed
  fail predicate (an `Extended_Pictographic` code point, U+FE0F, or U+20E3; an
  Arabic-Indic digit; a combining mark in U+064B–U+0652 or U+0670; or a Latin
  letter run other than the token `SMS`), and its two recorded exceptions (a
  supplied value and the fixed city list), and its directory list gains
  `packages/ui/app/components/upload/` — the new layer components — and
  `apps/web/app/composables/upload/` — the page's refusal-message table. The
  file stays **owned by R1 and extended by R2**: the Ownership Map records it
  as «R2 extends it», never as a new owner, and R2 writes no second scanner.
  The extension's one amendment is the scan's third exception: R1's Latin-letters
  limb was written for R1's own three pages, while Principle V itself permits
  the technical names that do not translate (PDF, Excel, OEM, SKU) in
  user-facing text, and R2's format line (FR-005) and the unsupported-format
  refusal both carry «Excel (xls، xlsx) · PDF · Word (doc، docx)»; the
  extension admits those names beside the supplied value and the city list, and
  R2's Arabic copy, its Latin numerals, and its absence of emoji are then
  measured by the same predicate R1's pages are measured by.

**Amended 2026-11-17 — the announcement contract and the verification verdict.**
The UI contract's §3 and §7 now carry exactly two live regions — one polite and
one assertive — and assign every announcement to one of them; focus is
authoritative for a state's name and the region carries only the body or cause,
so no sentence is spoken twice; the quota update is announced once per changed
settled read; the multi-file notice leaves the accessibility tree when replaced;
`WfFileName` hides its cut run while keeping the whole name as the accessible
name; the quota block's loading, exhausted, and read-failure states are exposed;
and the inherited floors refer to R1's contract §2 and §3.4 instead of restating
them. This section's verification notes define "no reported violation", record
the manual pass's observer, browser, assistive technology, route, date, and
result, cite the evidence for the inherited floors, and keep the 44 accessibility
presentations unchanged; row 32 records forced-colors mode and a user stylesheet
as an accepted gap. No FR, AC, or SC changes.

## Constitution Check

*GATE: evaluated before Phase 0 research; re-evaluated after Phase 1 design. An
unjustified violation is an ERROR; a justified one is a Complexity Tracking row.*

**The gate is reported against the amended constitution: 7.1.0 / Last Amended
2026-11-14 / recorded by ADR-176.** Two amendments stand behind it. **ADR-175
(7.0.0, 2026-11-13)** closed the four governance findings this slice carried:
Principle V's no-emoji rule is narrowed to the text the platform writes and
shows, with a value the platform receives — a merchant's file name among them —
shown as supplied and outside the ban; the duplicate outcome's read of another
merchant's catalog is registered as the one and only named exception to the
isolation rule; the upload-attempt bound enters the closed Constitution
Mandated Values list (60 attempts in a fixed 15-minute window on UTC
boundaries); and the three version places are aligned in the same change, which
is what makes the first three durable. **ADR-176 (7.1.0, 2026-11-14)** amends
one paragraph — Performance Budgets and Verification's Quota semantics — so the
active limit counts the catalogs whose stored file has not been deleted and
treats neither the processing status nor the rows derived from it as a
condition; that is the reading the Usage Limits and Quota Semantics row below
already states, and it moves no gate outcome. The version places now agree: the
footer and
`.specify/memory/version.json` both read **7.1.0 / 2026-11-14 / ADR-176**, and
the decision register's last index row is **ADR-179 (7.1.0)**, with **ADR-174
(6.3.2)** the last of this change's own field-level records and **ADR-175
(7.0.0)** the first of the two amendments. `governance-drift-check.mjs`
therefore reports **clean**: `A` (the footer and `version.json` agree at 7.1.0,
last amended 2026-11-14), `B` (the index ends at ADR-179; 179 rows, one per
record, in ascending order, every anchor resolved), and `J` (the index's last
row and highest version match the footer, highest 7.1.0) all pass. This plan
amends nothing in the constitution and moves nothing in `version.json`; it
reads the amendments and marks no gate row satisfied on a promise. No row below
rests on a deferred amendment any more. **The governance change this plan's Twelfth
pass records keeps that clean state**: it opens `EX-013` in the exception
register's Active table and raises `governance-drift-check.mjs`'s G2
expected exception-row count from twelve to thirteen, so the rows and the count
move together, and it **leaves `EX-007` in the Active table**: the rendered
evidence `T082`–`T087` and `T099` exists only when this slice's implementation
runs, so the row is closed at acceptance by **T111**, which writes the closure
rather than verifying one written in advance (the Forty-fifth pass). Where a gate row depends on
work this slice has not run yet, its status says so — Gate 2 → Deployment and
Observability reads **PASS subject to R12** — rather than claiming an
unconditional PASS the tree does not support. Gate 1 → VIII reads **PASS on the
repository owner's final acceptance of `EX-013` as the approved exception
(2026-11-16)**: the acceptance is a register row the drift check resolves, and
this plan's story text, gate, and phases name that one row instead of each
carrying its own reading of the deviation; the owner rejected the alternative of
restructuring US2, US4, and US5 into independently implementable stories, because
that restructuring would separate the safety engine from US1 and make US1
unsafe (the Twenty-fifth pass).

### Gate 1 — Core Principles (I–X)

| Principle | Status | Evidence / notes |
|---|---|---|
| I. Evident, Traceable Change *(NON-NEGOTIABLE)* | PASS | FR-001 … FR-065 and AC-001 … AC-051 drive the plan; every task ends with `(implements FR-###, AC-###)` or, where no requirement applies, `(implements Complexity Tracking: row N)`; 23 tasks carry the second form; commits reference spec, plan, and task identifiers. The slice's own no-requirement work - the first documentation-drift test (ADR-031 item 4), the shell runtime verification `EX-007` closes, the register-gap records, and the platform refusal catalogue's 43-code closed-set invariant (row 26) - is recorded in Complexity Tracking rather than linked to a fabricated requirement. |
| II. Strict Type Safety | PASS | The workspace's strict flags apply unchanged; `any` and double assertions are rejected by the committed ESLint configuration; the intake's request, response, outcome, quota, and refusal shapes are Zod schemas in `packages/shared`, imported by the page and the API. |
| III. Measured Test Coverage | PASS | The spec's Test Coverage Request is answered: unit, integration, and end-to-end are all requested. The CI coverage job's ≥ 80% changed-line rule applies unchanged; the intake's branches (each refusal cause, the duplicate, the quota race, the cancel, the scan failure) are the changed lines the suites cover. |
| IV. Accessible User Interfaces | PASS | WCAG 2.2 AA; the axe scan over every presentation in both appearances at 320 and 1280; the keyboard-only pass completes an upload without a pointer; every state change is announced and moves focus to the state now shown; `:focus-visible` and the touch floor come from R1's contract §2 and the layer's tokens; the progress surface announces its start, the screening phase, and the outcome rather than every percentage. The direction check is **T030's current text in `tasks.md`**: its component spec in `packages/ui/tests/upload/` reads the source of each of the four new files in `packages/ui/app/components/upload/` and demands the logical direction property's presence — every inset uses `inset-inline-start`/`inset-inline-end`, every outer spacing uses `margin-inline-*`, every inner spacing uses `padding-inline-*` — while demanding the absence of the physical property form (`left`, `right`, `margin-left`, `margin-right`, `padding-left`, `padding-right`), so FR-058's inline-end cut and AC-044's no-horizontal-scroll hold in either writing direction. The four files the check reads are the ones T044, T045, T046, and T047 write, and the row rests on the task's wording as it stands. The R1 precedent is `packages/ui/tests/shell/sidebar.spec.ts`, which reads a component's source and demands `inset-inline-start: calc(100%`. **Re-evaluated 2026-11-17: PASS.** The contract now carries exactly two live regions — one polite and one assertive — and assigns every §3 announcement to one of them; focus is authoritative for a state's name and the region carries only the body or cause, so no sentence is spoken twice; the quota update is once per changed settled read; the multi-file notice leaves the accessibility tree when replaced; `WfFileName` hides the cut run while keeping the whole name as the accessible name; and the quota block's loading, exhausted, and read-failure states are exposed. The plan's Verification Notes define "no reported violation", record the manual pass's instrument and result shape, cite the evidence for R1's inherited floors, and keep the 44 accessibility presentations unchanged; row 32 records forced-colors and a user stylesheet as an accepted verification gap. |
| V. Arabic-First and RTL Interfaces *(NON-NEGOTIABLE)* | PASS | `<html dir="rtl" lang="ar">`, logical CSS, Latin numerals, and the layer's bidirectional file-name surface are R1's and are consumed unchanged; the file name is shown through `WfFileName`, so the Arabic stem runs RTL and the Latin extension LTR. The amended principle bans emoji in "the text the platform writes and shows" and states that a value the platform receives — a file's name among them — is shown as supplied and is outside the ban; that is exactly what FR-021 requires, so no requirement and no rule collide any more. The page's own text carries no emoji, is Arabic, and renders Latin digits; the page's Latin runs — the format line's names and extensions, the card's unit and format label, and the transfer's percentage — follow FR-063's reading rule, so the sentence keeps its right-to-left order, each run its own left-to-right order, and an assistive technology voices the format name, the extension, and the unit in English while a numeral and the percent sign stay in Arabic; the narrowing landed in 7.0.0 (ADR-175), so this row rests on the document in the tree rather than on a promise. |
| VI. Catalog-Only Scope *(NON-NEGOTIABLE)* | PASS | The page uploads, screens, and records a supplier catalog; it has no price, cart, order, payment, RFQ, wallet, or user-to-user surface. The "cart" is not touched. |
| VII. Specification-First and Documentation Separation *(NON-NEGOTIABLE)* | PASS, with the scan widened to seven forms, the mandated-values form read with or without a row number, across a line break, and in the singular, its result stated, and its two product names recorded | `spec.md` names no language, framework, library, database, or pattern. The scan is **widened** in this pass to seven forms: the layer's component and identifier form (`Wf[A-Z]\w*`), the refusal-code form (`UPLOAD_[A-Z_]+`), the path vocabulary (`apps/`, `packages/`), the task-identifier form (`T\d{3}`), and the three plan-bookkeeping forms the earlier scans did not look for — `Constitution Mandated Values` read with a row number or with none, across a line break, and in the singular, `CMV row \d+`, and `Complexity Tracking row` read with a row number or with none — because a reference without a number carries the same bookkeeping a numbered one does, and a break or a singular form is the same leakage in fewer words. The three row forms carry the plan's own bookkeeping: an identifier of this slice's internal numbering is the plan's business, and the specification is the product's statement, so a mandated-values row or a tracking row in it is the same kind of defect as a library name, and a task identifier is barred for the same reason. Re-scanned with the widened form, **each of the seven forms returns zero matches**: `Wf[A-Z]\w*` finds no layer component or identifier, `UPLOAD_[A-Z_]+` finds no refusal code, the path vocabulary finds no `apps/` or `packages/` reference, `T\d{3}` finds no task identifier, `Constitution Mandated Values` finds no mandated-values reference in any of those shapes, `CMV row \d+` finds no abbreviated mandated-values row, and `Complexity Tracking row` finds no tracking-row reference with a number or without one. **The widened form's first run found six references, and all are fixed rather than waived**: FR-031's `the cap recorded under Constitution Mandated Values` now reads `the cap the constitution fixes`; the 2026-11-12 (8) clarification's `a plan value under Constitution Mandated Values` now states the value the constitution requires the plan to record; and the Assumptions' four references — the content-inspection set's and the upload-attempt bound's singular `Constitution Mandated Value`, and the 100 MB and decoded-size cap sentences that named the list — now state the same facts without the term; the cap stays 1 GiB, no identifier moves, and no gate changes status. **The slice's number is deliberately not a form**: a roadmap slice is a product-level fact the specification may name — its Assumptions name the slices that own three windows — while the plan's and the task list's own numbering are barred; the scan looks for the second class and not the first. The refusal-code form's zero is the honest result: the 2026-11-14 (2) clarification names the sanitization refusal by its product name, and the cause's registered code — the name AC-051's closed seventeen-cause set needs in order to require one message per cause — is carried by `contracts/intake-api.md` and `contracts/ui-contracts.md`, not by this specification. **Two product names remain, and this row records both rather than claiming an empty file**: FR-008's «the page's file-name surface», which is the layer's `WfFileName` under the name the product uses for it, and FR-032's «the sanitization-failed cause». Neither is a layer identifier, a refusal code, or a path, so neither is a match of any of the seven forms; both are the product vocabulary a merchant-facing requirement needs, and their implementations appear in `contracts/` and this plan only. The file's other surface names — the upload control, the selected-file card, the progress state, the quota block, the ended-session state — are FR-006's and the slice map's product vocabulary for what the merchant sees, not layer identifiers; their implementations (`WfUploadControl`, `WfSelectedFile`, `WfUploadProgress`, `WfQuotaBlock`, `WfEndedSession`) appear in `contracts/` and this plan only. **What `spec.md` carries, restated in the tenth pass (2026-11-15) as the row's precise claim, and completed by this pass**: no `Wf` identifier, no `UPLOAD_*` code, no source path (`apps/`, `packages/`), no task identifier, no tracking row, and no library, framework, database, or pattern name. The earlier sentence — "No `Wf` identifier, no path, and no library name appears in `spec.md`" — is **replaced** by that claim, because its word "path" said too much and too little at once — it was true of the product's source tree and false of the governance sources the document is required to name — and its single word "library" had to stand for four kinds (a language, a framework, a database, and a pattern) while the refusal-code form went unmentioned. **One permit, and only this one**: the two governance paths in the binding-rules comment — `.specify/memory/constitution.md` and `.specify/memory/version.json` — which name the document's governing sources rather than a place in the product's tree. The task and row forms permit nothing, because they match nothing in the file. **FR-064 stopped being a permitted item on 2026-11-15, and the row records why**: the requirement now carries its own boundary — the closed set of seventeen bounds the refusal causes this slice decides for a file and for an upload request, while the four answers the intake reuses from R1 stay R1's, with R1's own text and R1's own retryable value, adding neither an eighteenth cause nor a new message (`Clarifications 2026-11-15 (8)`) — so the requirement names no table, no contract section, and no artifact path, and there is nothing left for this row to permit; the causes and their single Arabic messages are fixed by FR-028, FR-016, FR-017, FR-040, FR-050, and FR-026 and restated in the interface contract with their codes. FR-064 still names no technology — no library, no framework, no database, and no pattern — and no `Wf` identifier, no `UPLOAD_*` code, no source path, no task identifier, no mandated-values row, and no tracking row. The transport, the scanner, the storage layout, and every library live in this plan, `research.md`, `data-model.md`, and `contracts/`; the 2026-11-13 refinement moved the four plan directives out of FR-009, FR-029, FR-061, and FR-062, and this plan owns them in "Specification Detail Owned Here". **Re-evaluated after the ninth pass (2026-11-15), and the row keeps PASS**: that pass adds four storage names — `ListParts`, `NoSuchUpload`, `abortMultipart`, and `DeleteObject` — and each enters `plan.md`'s Technical Context and `contracts/intake-api.md` §6.1 and §2.4 alone; `spec.md` gains no byte, so every form the scan then carried still returns **zero matches** there, and the two product names stand as recorded above. None of the four is a layer identifier, a refusal code, or a path, so none is a match of a form the scan looks for; the scan's subject is `spec.md`, and this pass reads the same file the eighth pass read. **The widened scan's first run found a violation, and this row records it rather than a clean result.** On the first run of the two new forms, `T\d{3}` matched the status paragraph's two task identifiers and `Complexity Tracking row \d+` matched eight references — one in that same paragraph and seven in the recorded clarifications and the user stories — so the specification carried this slice's internal numbering, which Principle VII forbids as firmly as a library name: a task identifier and a tracking row are the plan's and the task list's bookkeeping, and the specification is the product's statement. The violation is a defect, and it is fixed in the same change rather than waived: the status paragraph is reduced to one neutral sentence about the specification's own state, the seven references the clarifications and the user stories carried are reduced to the statements they make without the row numbers, and the status paragraph's content moves into this plan's Summary. **The state this row records is zero for all seven forms**: `spec.md` returns no match for any of them, and the two product names stand as recorded above. **The widening this pass adds found the last two references the five-form scan could not see, and the row records them the same way.** `Constitution Mandated Values row \d+` matched one reference in the recorded clarifications; `CMV row \d+` and `Complexity Tracking row` read with a number or with none matched none. The same reading found one unnumbered mention of the tracking vocabulary that no form can match because it names the table without the word `row` — «records in Complexity Tracking» — and the two are removed for the same reason: both were the specification carrying the plan's bookkeeping, the same defect as the task identifier and the numbered tracking row. They are fixed in this change rather than waived: the clarification states the value without the row number, and the prose names the window without the table's name, so the three row forms return **zero** and the file carries no plan row. **The eighteenth pass's reading of the unnumbered mention was incomplete, and the nineteenth pass completes it.** Two mentions the same reading was blind to remained in `spec.md`, each broken across a line break — the vocabulary's two words split between two lines, one inside FR-047 and one in the Assumptions — because the reading matched the phrase on a single line. The nineteenth pass (2026-11-15) removes both, so the file states each requirement and each assumption without the vocabulary, and it widens the reading itself to tolerate the break (`Complexity\s+Tracking`) rather than treating the break as an exemption; **the widened reading is not an eighth form** — the form count stays seven, and the tolerant pattern is how the unnumbered mention is read, not a new subject for the scan. Re-read with it, the file returns **one** mention — the binding-rules comment at line 61, «the plan's Complexity Tracking table» — and nothing else, while the seven forms still return **zero**. **The one surviving mention is writer guidance, not product text**: it is an HTML comment addressed to the specification's author about where a product addition is recorded; it renders nowhere, states no requirement, and is not the product's statement, so it is outside Principle VII's subject and is recorded here rather than edited away. |
| VIII. User Story Independence *(NON-NEGOTIABLE)* | PASS, on the repository owner's final acceptance of `EX-013` as the approved exception (2026-11-16; Complexity Tracking row 21), and `EX-007` closing at this slice's acceptance | **US1 ships the engine, the routes, and the page, and US3 ships the duplicate outcome's panel (T066) and proves the projection Phase 2 composes (T064, T065)** — the projection stays in Phase 2 because T039's intake sequence calls T065 on a hash conflict, so US1 cannot run without it; **US2, US3, US4, and US5's test increments depend on US1, and US1's page depends on US3's panel, so no story after the pair is independently implementable in the strict sense**: US2 adds the safety verdicts' tests, US4 the quota boundaries' measurements, and US5 the shell's rendered verification, each over the engine US1 composes and with no production file of its own; US3 adds the duplicate panel (T066) and its tests, and that panel is the one production file US1's composition consumes (row 21); T066 is pulled forward and executes before T052, while US3's tests still follow US1's engine. A verification increment cannot run before the code it verifies, so the earlier draft's claim that "none needs another story complete" is **withdrawn** and the dependency is stated instead. What each of the four still carries is its own increment in its own test file or its own surface — US2's verdict suite, US3's duplicate suite and panel, US4's boundary suite, and US5's rendered-page suite are separate files with their own fixtures, so a failure names its story and none is a second implementation. **What is accepted is test coverage and one component, not implementation only**: the exception covers the tests the four stories write and the one component US3 ships, and it waives no test and no criterion. **The acceptance is final (approved 2026-11-16).** Principle VIII is NON-NEGOTIABLE, so the deviation is not argued away and not left to a PASS the register's existence would confer: the repository owner approves it as the granted exception — `EX-013` — and **rejects** restructuring US2, US4, and US5 into independently implementable stories, because that restructuring would separate the safety engine from US1 and make US1 unsafe: the content check, the scan, the decoded-size cap, the sanitizer, and the refusals that keep an unsafe file out are the engine US1's page composes, and a page that kept a file the safety pipeline had not passed would be unsafe to ship. The principle, the exact scope (the four stories' test surfaces, US3's `UploadDuplicate.vue`, US1's three dependent tasks T052/T034/T035, and the test paths their tasks write), the rationale, the approver (repository owner), the approval date (2026-11-16), and the review date (2026-12-11, R2's acceptance) are recorded in Complexity Tracking row 21, and the register entry the acceptance corresponds to is **`EX-013`** — appended to `.specify/templates/exception-register.md` in the governance change this plan's Twelfth pass records and recorded there with the same 2026-11-16 approval, which the Twenty-fourth and Twenty-fifth passes record, with the repository owner as approver and 2026-12-11 as its review date, and `governance-drift-check.mjs`'s G2 exception-row count raised from twelve to thirteen in the same change, because the count is a structural count the drift check enforces and the change that grants the exception is the one that moves it. The same change **leaves `EX-007` in the register's Active table**: the rendered evidence `T082`–`T087` and `T099` exists only when the page and its tests run, so the row stays open until this slice's acceptance, when **T111 writes its closure** — because Complexity Tracking row 10 requires the register to record each behaviour against the criterion beside it, and the register's rule 5 forbids closing a row before its evidence exists. The row is therefore **PASS on the approved exception**: the acceptance is recorded here and in the register's own `EX-013` row, and the drift check resolves that row and every reference to it, so the acceptance is visible to a reviewer rather than promised by a task this plan has not run. US5's shell runtime is separately the deferred half of R1's story: R1's plan records the deferral and the register carries `EX-007` for R1's SC-005 and SC-006 halves, so US5 is a registered exception as well as a verification increment, and it closes here through the rendered page's tests (row 10). The P1 set — US1 and US2 — is the shippable MVP in the only sense the tasks support: US1 ships the page and the engine, and US2 proves the safety verdicts on that surface; US2 still follows US1, and the MVP is the pair, not either story alone. The R2-only increment's record resting at `uploaded` is the window R3 owns (row 11), and the links to R4's My Files page (roadmap defect 1), R5's Parts page (defect 20), and the shell's four static-page links (defect 19) are rows 12–14. |
| IX. UI Foundation Fidelity *(NON-NEGOTIABLE)* | PASS with the reference gap recorded | Nuxt UI v4 is the only component library; the Wafar UI layer is `packages/ui` (ADR-097). R2 adds the upload control, the selected-file card, the progress surface (transfer and screening), and the quota block to the layer, each with its own unit test; the page composes them and builds no parallel control. No raw colour, spacing, radius, shadow, duration, or z-index value sits outside the layer; no second design system; no emoji; every state is rendered. The conformance gate is ADR-128/ADR-129: a contract test and the 44 visual baselines of the Verification Notes. The reference set captures the idle state alone, so the five P1 states are baselined from the contract and recorded in Complexity Tracking row 5. |
| X. Modular Monolith Architecture | PASS, re-evaluated 2026-11-17 | One owning module: `catalogs` owns the record, the quota, the counters, the intake session, the storage adapter, the scanner adapter, and the inspection set. `users` is read through the account-context port: its **contract** — the port's type and the shape it returns — is `packages/shared/src/contracts/account-context.ts`, its **implementation** is `apps/api/src/modules/users/service/account-context.ts`, and the container `apps/api/src/http/deps.ts` injects it, so `catalogs` imports no path under `modules/users` — neither the service file nor the repository — and the communication goes through the shared package, which is Principle X's and `docs/architecture.md` §2's sentence. **The row's earlier reading was a violation of that same sentence**: it said `catalogs` imported the `users` service file directly, which is a direct import from one module to another, so it is **withdrawn rather than waived** — the design moves the contract to `shared` and the wiring to the container, and no exception is registered and no decision record is opened, because the rule already governs (this plan's Forty-third pass). `shared` also carries the refusal union. The API's routes live in `apps/api/src/modules/catalogs/routes/`, the rules in `service/`, and the writes in `repository/`; no module imports another's repository, its service, or its routes. |

### Gate 2 — Binding Sections

| Binding section | Status | Evidence / notes |
|---|---|---|
| Query Safety and Secrets | PASS | Drizzle parameterized statements only; the quota and duplicate projections are fixed columns, not a client-supplied sort or filter; every query carries the 2 s `statement_timeout` and the 100 ms p95 budget; the presigned URLs and the SeaweedFS credentials are signed server-side from environment-injected secrets, never logged and never sent to the page; the scan's bytes never appear in a log; the operational record carries the outcome, the cause, the time, and the request's correlation identifier, and no merchant or file identifier, and its `cause` is the refusal code alone — never a scanner signature. |
| Schema and Migration Control | PASS | One migration tool (Drizzle Kit); `0004_file_intake.sql` and its `.down.sql` are one reversible step; the new tables carry `user_id` where they are merchant-owned, every FK has an index, the hash uniqueness is one platform-wide partial unique index over `deleted_at IS NULL` (FR-042's comparison scope, not one hash per merchant) that releases a soft-deleted row's hash for the FR-046 re-upload, and the quota's atomicity is a per-merchant `pg_advisory_xact_lock` inside the acceptance transaction. The duplicate outcome's read of another merchant's `Catalog` is the constitution's **single named exception** (7.0.0, ADR-175): one fixed projection of four fields — the original's name, its upload date, its processing status, and the identifier the parts link needs — reachable only from the duplicate outcome, through the same shared entry point, never reused by another outcome, page, or query path. `docs/domain-model.md` carries it and ADR-170 records it. The isolation test admits that path as the one named exception, asserts the projection's four fields, and fails on any other field or on any second cross-merchant read. |
| Identity, Authentication, and Session Policy | PASS | No authentication surface is added: every intake route resolves R1's session through `authenticate` in `apps/api/src/http/context.ts`, requires a merchant role and an active account, and refuses a guest, a blocked account, or an administrator session on the merchant surface with R1's rules. TLS, CSRF, output encoding, and the security headers are R1's; the page's mutations carry R1's CSRF token and the allowlisted origin. |
| Authorization and Access Control | PASS | The role matrix is respected: the intake is merchant-only, the administrator application has no intake surface, and no administrator operation or audit-log write is added. The shared entry point resolves the role and the account status; R13's permission model stays deferred in Gate 3 and this slice does not decide it. The cross-merchant duplicate read is **not** an authorization question and is not filed here; it is the isolation exception in Schema and Migration Control. |
| Performance Budgets and Verification | PASS | CMV rows 6–7; N+1 inspected (none) — every path's statement set is bounded and `data-model.md` §7 lists it, and the load run reports the slowest `pg_stat_statements` query and fails on any statement above the 100 ms p95 budget, while no suite asserts a statement count; no cache beyond TanStack Query's invalidation rule; a >10% regression against the branching version blocks release; the load script's first phase is the design condition and its second phase is the capacity model's stress condition; every percentile is measured at both stated conditions, and CMV row 6's values are the same at the design and the stress condition. |
| Usage Limits and Quota Semantics | PASS with the AC-028 second clause's window owned by R13 (Complexity Tracking row 27) | FR-012 counts the catalogs whose kept file is retained and that are not deleted — `uploaded`, `processing`, and `failed` count exactly as `completed` does, because in all four the file's bytes are stored — and FR-011 keeps the monthly count in the persisted counter that a deletion does not restore. The active count filters `deleted_at IS NULL`, and the presence of parts, bookmarks, or search-index entries is not a condition; the quota suite asserts the counting set's four statuses, the 50th, the 300th, a lowered quota, and one slot left with two uploads. The constitution's Quota semantics paragraph states the same in its amended words (7.1.0, ADR-176), and `docs/domain-model.md`'s Upload quotas paragraph carries them. **AC-028's second clause is R13's to assert** (Complexity Tracking row 27): the cap above 500 per calendar month and 1,500 active files is refused by the write that sets an override, which R13 ships with its Users page; this slice adds no administrator operation and only reads the effective limits, so no task here can observe that refusal, and the clause stays in the criterion unchanged. |
| Dependency Governance | PASS with the register-gap rows recorded | Versions pinned; the lockfile is committed and regenerated only by the update process; every new dependency carries its licence and obligation, a vulnerability scan (`osv-scanner` plus `npm audit`), and a review date (Complexity Tracking rows 15–17): `aws4fetch` MIT, `fflate` MIT, `cfb` Apache-2.0, `pdf-lib` MIT, and ClamAV's GPL-2.0 obligation discharged by the separate-process boundary `EX-001` fixes. The four declarations are owned by one task (T095) against the two paths the Ownership Map now carries — `apps/api/package.json` and `pnpm-lock.yaml` — so no adapter task edits a manifest and no dependency is declared twice. The dependency budget (CMV row 5) is respected: `apps/api` 11 of 30. |
| Module Discipline and Development Workflow | PASS | One owning module per rule; no duplicated logic; **cross-module communication goes through the shared package**: the account-context port's contract is `packages/shared/src/contracts/account-context.ts`, its implementation is `users`' own service, and `apps/api/src/http/deps.ts` injects it, so no file in `catalogs` imports anything under `modules/users`, and the workspace's `no-restricted-imports` rule enforces the boundary: it bans every import matching `**/modules/*/repository/*` or `**/modules/*/service/*` outside the composition root — `apps/api/src/http/**` is the one place the rule is off, because the container is what wires implementations together, so `deps.ts` may import `users`' implementation, while a `catalogs` file that imported the `users` service or repository fails the lint and its routes are barred by the architecture rule this row states; the CMV heading is present with rows 1–20 and no row is marked pending; migrations carry a rollback; CI runs offline with local services. Row 20 is the upload-attempt bound the amended constitution's closed list now carries in the same words (60 attempts in a fixed 15-minute window on UTC boundaries, 7.0.0 / ADR-175), so the value is recorded where the rule that names it requires it, and the plan template's row 20 matches. |
| Project Structure and Debt Control | PASS | The Ownership Map below names every production path; import boundaries are enforced by ESLint (`no-restricted-imports` and the workspace rules); shared code is promoted only after a second consumer; no abstraction before a second use; every TODO, skip, or workaround carries an issue and a date. |
| Documentation | PASS | Every non-trivial decision is recorded: ADR-166 … ADR-174 are appended to `docs/decisions/volume-10.md` with their index rows, and `docs/domain-model.md` is amended for open fact #9, the stored file name, the monthly counter, the attempt counter, the hash's uniqueness, the duplicate projection, and the upload session's transient state. The first standalone documentation-drift test is delivered and wired into CI (ADR-031 item 4). The version-source disagreement that an earlier draft of this plan filed here is **not** a Documentation finding: the Documentation section places a governance record — this constitution's own text, a register, the process, or the governance tooling rather than a product or engineering choice — outside the ADR field (ADR-090), so a disagreement between the footer, `version.json`, and the register's index is a governance defect escalated as an amendment, not a missing or drifted record, and no ADR can discharge it. It was escalated and closed that way: ADR-175 amends the constitution to 7.0.0 / 2026-11-13 and `version.json` moves with it, and `governance-drift-check.mjs` is clean; ADR-176 (7.1.0, 2026-11-14) is the constitution's own stamp and does not move; the register's last row is ADR-179 now, and the gate header above reads the same three places. **The exception register is the one governance record this slice writes**: `EX-013` — Gate 1 → VIII's approved exception (2026-11-16), Complexity Tracking row 21 — is opened in the Active table of `.specify/templates/exception-register.md` with the repository owner as approver, its exact scope and its rationale, and 2026-12-11 as its review date, and `governance-drift-check.mjs`'s exception-row count (check G2) moves from twelve to thirteen in the same change, and the same change leaves `EX-007` in the register's Active table, open until this slice's acceptance, when **T111** writes its closure with the rendered evidence `T082`–`T087` and `T099`; the change is this plan's own governance change, recorded in its Twelfth pass and recorded again with the final acceptance of 2026-11-16 in its Twenty-fourth and Twenty-fifth passes, and no other file writes either path, so the register's counted rows are a governance change this slice makes rather than one it leaves for another — **T111** verifies that state (the row's presence, the closure, and the count) and writes neither file. Gate 1 → VIII cites the row, Complexity Tracking row 21 carries the deviation, and both paths are in the Ownership Map below. |
| Deployment and Observability | PASS subject to R12, with one evidence gap explicitly accepted (Complexity Tracking row 7, whose closing work R12 owns) and the second gap closed by this slice's own tasks (row 22) | `GET /health` is extended from `{status, database}` to `{status, database, storage, scanner}`: PostgreSQL with `SELECT 1`, SeaweedFS with a signed `HeadBucket` on the configured bucket, and ClamAV with a clamd `PING`/`PONG` over the socket, each bounded at 1 s, 200 `ok` only when all three answer, 503 `degraded` with the failing field when one does not; the degradation suite asserts each dependency's failure. Structured logs carry the correlation identifier; RTO/RPO are in CMV rows 8–9. **The two gaps an earlier draft left open are settled differently because they are different in kind.** The four-field probe and the backup drill's assertion are R2's own work rather than evidence it lacks: T021 extends the route and T088 moves `docs/runbooks/backup-restore.md` step 4 to the four-field body in the same change, so the drill and the platform serve one shape at this slice's acceptance and row 22 records a task, not a waiver. The object-storage leg of RTO/RPO is the one gap this slice cannot close — replication is not a backup, and no runbook or drill restores file bytes — and it is **explicitly accepted**: approver the repository owner, closing work owned by R12, review 2026-12-15, accepted scope the file-bytes leg of CMV rows 8–9 only (the PostgreSQL leg's evidence is R1's). The numbers are therefore recorded as targets the platform aims at and are not claimed as evidenced, no success criterion in this slice measures either, and row 7 carries the acceptance. The isolation exception an earlier draft filed here is the constitution's named exception (7.0.0 / ADR-175) and no longer bears on this row. **The row is PASS subject to R12**, because the evidence it accepts does not exist until R12's runbook and drill land: row 7's owner (the R12 owner) and its 2026-12-15 review date are what close it, and neither this slice nor T111's governance change supplies the file-bytes leg. No second exception row is opened for it — row 7 already carries the acceptance, and a register row here would move the G2 count past the thirteen T111 sets. |
| Technology Standards | PASS with the register-gap rows recorded | The stack is the register's; the paths match `docs/architecture.md` and the internal layout; `packages/ui` is the ADR-097 exception, not a new package row. The two register gaps are recorded with their ADRs, licences, vulnerability scans, and review dates, and the register is amended no later than R2's acceptance: the object-storage client (ADR-172) and the scanner client (ADR-173), with the content-inspection set under CMV row 12 (ADR-171). The technologies are used only after these records exist, which is the register-gap process's rule. |
| Glossary | PASS | Every term is the Glossary's: `Catalog`, `User`, merchant, administrator, upload, processing, status, My Files, Parts. `Catalog` is the entity this slice implements; the stored file name, byte count, and content type are field-level facts recorded in `docs/domain-model.md` and ADR-166, not new entities. The page is the registered Upload Catalog page; no page, feature, role, or entity is invented. |
| Product Scope | PASS | The twenty-eighth page only — Upload Catalog at `/upload` — inside the shared shell; no product feature, role, page, or Usage Limit is added. The page's link to My Files is R4's page (roadmap **defect 1**: My Files had no owning slice before R4) and the duplicate's link to Parts is R5's (defect 20), both fixed here and recorded in rows 12–13; the shell's four static-page links are the frame's, and roadmap **defect 19** records them — its destination half closes at R10, the pages ship at R11, row 14. No other page is added by this slice, and no route is registered that the Product Register does not name. |
| File Processing Overview | PASS | The canonical sequence is preserved: upload → storage and content hash → duplicate check → (R3's first-page extraction and queue). Content safety runs in order before the file is retained — the declared format and size before any byte, then the actual content-format check, the ClamAV scan, the decoded-size cap, and the sanitizer — and a file failing any step is refused and not retained; the cap is measured on the original decode before the sanitizer and again on the sanitized decode, counted as the sanitizer writes the kept bytes (FR-029), so the kept file is the file whose decoded content is under the cap. The duplicate is rejected with a message naming the original, stating its date, and carrying its parts link, and the bytes just kept are withdrawn. The staging object is the transport's write, which the File Processing Rules' duplicate clause defines as "not retained"; the kept file is written only after every check passes. |
| Product Register | PASS | Roles: guest, merchant, administrator (a role on `User`); 28 pages; 16 features untouched. **`Catalog` is the entity this slice implements**: its owning module is `catalogs`, its status is the registered four-value enum, and its field-level facts — the stored byte count and content type (open fact #9), the uploaded file's name, the monthly counter, the attempt counter, and the hash's uniqueness over non-deleted catalogs — are recorded in ADR-166 … ADR-169 and `docs/domain-model.md`. No entity is added: the monthly counter and the attempt counter are transient counter state recorded in `data-model.md` as non-entities, and the upload session is `docs/domain-model.md`'s **Transient intake state (not an entity)** — its columns and states are `data-model.md` §5's, its sweeps §9's, no product read exposes it, and it is never a catalog. The register's twelve entities stay twelve. |
| Single-Reference Sufficiency | PASS | Every value a rule names is under CMV (rows 1–20) or is a plan value recorded in Technical Context (the date pattern, the size display, the wait's display, the sweeps' bounds, the scan budget, the other four stage budgets, the parser bounds, the part size); no rule is discharged from an unregistered source; no register is copied; no design token or UI value is copied into this plan — the page references the layer's components and tokens. The decoded-size cap and the attempt bound are CMV row 15 and row 20; the libraries are CMV row 12 and the two register-gap rows. |
| Artifact Workflow and Traceability | PASS | Stable `FR-###`/`AC-###`/`SC-###` identifiers (65 FR, 51 AC, 13 SC, contiguous and cross-referenced); zero `NEEDS CLARIFICATION`; the Test Coverage Request is answered; every ADR first named here is reaffirmed below; zero unresolved clarifications remain before tasks. |
| Product Fact Clarifications | PASS | The contact form's fields are untouched; the platform stays free to merchants; the 99-part cart is untouched; no CAPTCHA and no PWA; the shell's per-page controls are ADR-099/ADR-102/ADR-127's; registration is Libya-only; no email channel; no emoji in the platform's own text. |

### Gate 2 — Threat and Control Map (FR-001–FR-065)

**Reading.** The table pairs each abuse the intake answers with its control and
the test that fails when the control is removed, and it adds no rule: each
control restates the requirement it cites. **The map is not a coverage
instrument**: it names **31 of the specification's 65 requirements** — the 28
in the Requirements column (beside the one acceptance criterion that column
cites, `AC-015`), `FR-020` in the note after the table, and the two endpoints
of the range its own heading carries (`FR-001` and `FR-065`) — while the check
that accounts for all 65 is `tasks.md` § Requirement Coverage, which is where
requirement coverage lives; restating every requirement is not this map's
subject. The two entries that are deliberately not controls are named as they
are — the multi-file notice (`FR-020`) and the status vocabulary (`FR-044`) —
and are noted after the table.

| # | Threat (what the abuse achieves) | Control (what this slice does) | Requirements | Verification (what fails when the control is removed) |
|---|---|---|---|---|
| T01 | A merchant reads another merchant's catalog through the duplicate outcome | The duplicate read is one projection of four fields — the original's name, upload date, processing status, and identifier — reached only after a hash conflict, with no owner field and no other column; the isolation test admits this path as the one named exception and asserts the projection and the absence of any second cross-merchant read | FR-009; FR-042; FR-044 | the isolation suite's duplicate case (the four fields present, every other field absent); the projection test |
| T02 | A crafted client uploads a file the page would have refused | The server re-checks the name (control characters, invisible marks, path separators, 255 UTF-16 units), the last-suffix format, the size, and emptiness before any byte is retained; a name refused for its own cause is never echoed into a message | FR-021; FR-026; FR-028 | the server-side refusal suite (each cause, the crafted client, the neutral label) |
| T03 | A renamed file passes the format check | The content check opens the container and identifies the document inside: OOXML's content types and part names, OLE2's stream names, and a PDF's header and document catalog; a Word document named `.xls` or an Excel workbook named `.docx` is a mismatch | FR-027 | the content-format suite (each cross-named pair, the empty container, the corrupt file) |
| T04 | Malware is kept because the scanner did not answer | The ClamAV scan is mandatory; an unreachable daemon, a protocol error, or a verdict that misses the 90-second budget is the scan-unavailable refusal; nothing is kept and the retry re-sends the same file | FR-033; FR-049 | the fail-closed suite (daemon down, timeout, infected, clean) |
| T05 | A zip bomb exhausts memory or disk | The decoded-size cap streams every inspected file's decoded content — OOXML members and PDF streams — and stops at 1 GiB; the workspace is bounded by the 100 MB ceiling, the workspace file is deleted before the answer (T039), and the workspace file of a request that died is swept by the deferred sweep (Complexity Tracking row 23) | FR-031 | the cap suite (an OOXML bomb, a PDF stream bomb, a file just under the cap) |
| T06 | Executable content survives into the kept file | The sanitizer removes PDF JavaScript, automatic and launch actions, embedded files, and XFA scripts, and, in an Office document, its document macros — the VBA project and a legacy Excel 4.0 macro sheet inside the `Workbook` stream — every embedded object or attachment that can carry executable content — an embedded package included — and its external links with the relationships that bind them; the sanitized file is reopened as its declared format before it is kept; an unremovable item is the sanitization-failed refusal | FR-030; FR-032 | the sanitizer suite (each item removed, each unremovable item, the re-open failure) |
| T07 | A duplicate is stored twice, or a race creates two catalogs | The hash is SHA-256 over the kept bytes; a partial unique index over `deleted_at IS NULL` resolves the race; the conflict is the duplicate outcome, the just-written bytes are withdrawn, and no quota is consumed | FR-041; FR-042; FR-043; FR-045 | the duplicate suite (same merchant, two merchants at once, a deleted predecessor, a failed original) |
| T08 | The quota is exceeded by a race or by a deletion | The acceptance transaction takes a per-merchant advisory lock, re-reads the monthly counter and the active count, inserts the record, and increments the month's counter in one transaction; a deletion does not restore the monthly count; the active count filters `deleted_at IS NULL` | FR-011; FR-012; FR-013; FR-014 | the quota suite (one slot left and two uploads, the 50th, the 300th, a lowered quota) |
| T09 | A refused attempt is repeated without limit | The attempt counter is a per-merchant fixed 15-minute window, incremented after the file-level and limit checks and before any byte; 60 attempts per window; a refusal for the bound states the remaining wait and does not count or extend it | FR-061 | the attempt-bound suite (the 60th, the 61st, the retry after the wait) |
| T10 | A refused file's bytes survive in storage | Every refusal path decides the refusal together with its withdrawal: it aborts the multipart, deletes the staging object, confirms the object's absence with a `HEAD` and the parts' with `listParts`, and keeps no copy for inspection — the operational record is the investigation's evidence. When the storage refuses the removal, the platform does not report the safety refusal as decided and does not claim the copy is gone: it answers the retryable storage failure, keeps the safety cause in the record, leaves both keys on the `failed` row, and the deferred sweep deletes them and confirms their absence before it deletes the row (Complexity Tracking row 23); the "no copy" guarantee is read once the removal is confirmed. The workspace file of a request that died is removed by the same sweep | FR-030; AC-015 | the withdrawal suite (the object list after each refusal, the aborted multipart, and the storage-refused case with its keys on the `failed` row) |
| T11 | The page shows another merchant's counts or file names | The quota read is scoped by the session's account; the page carries no other merchant's count; the duplicate projection is the one exception | FR-009; FR-010 | the isolation suite's quota case (the caller's counts only) |
| T12 | A session ends or an account is blocked mid-intake and the page keeps retrying | The complete request resolves the session and the account status at its start; the page's session watcher replaces the progress state with R1's ended-session or blocked state, with no retry; a transfer that had not completed leaves nothing and a completed one is carried through | FR-004; FR-050 | the ended-session and blocked e2e cases |
| T13 | A storage or record failure leaves a catalog pointing at missing bytes | The sanitized object is written before the record's transaction; a failed write deletes the session and answers the retryable storage refusal; a failed transaction deletes the just-written object; the record is never inserted before its bytes exist | FR-040 | the storage-failure suite (the object and the record counts) |
| T14 | The scanner's or storage's outage takes the intake silently | `/health` probes both; the page's refusals are explicit and retryable; the operational record makes a scanner that cannot run and a surge of refusals countable | FR-033; FR-062 | the degradation suite (each dependency down, the health body) |
| T15 | A merchant's file name is reordered or hidden, or carries a path | The name check refuses bidi controls, isolates, invisible marks, zero-width and byte-order characters, other controls, path separators, and names over 255 UTF-16 units; a refused name is never rendered and the neutral label stands in its place; an accepted name renders through the layer's isolated file-name surface | FR-008; FR-021; FR-025 | the name suite (each refused character, the joiners accepted, the 255/256 boundary, the emoji accepted) |
| T16 | A forged presigned URL writes outside the upload's key | Every part URL is signed for one key, one part number, one exact `Content-Length`, and a 15-minute expiry; the complete call reads the caller's session and the upload session's owner; a URL for another upload's key fails the signature | FR-026 (the crafted client is refused before any byte is retained); FR-035 | the storage-adapter suite T031 writes (a replayed URL, a changed part number, an expired URL) |
| T17 | A hostile parser input exhausts the process — an entity-expansion bomb, a 10,000-deep element tree, a million-member package, or a cyclic object graph | Every reader keeps the bounds `contracts/intake-formats.md` §3.5 fixes: no DTD and no entity resolution (a `DOCTYPE` is refused), 64-deep XML, 65,535 package and OLE2 directory entries, a visited-set FAT and object walk, 1,000,000 PDF objects and 64-deep nesting, and 4 MiB per XML part; a bound crossed is `UPLOAD_CORRUPT` and nothing is kept | FR-027; FR-031 | the parser-bounds suite (each bound's fail-closed case, the sanitized-file case) |

**Two entries that are not controls.** The multi-file notice (FR-020) is a
message about a drop, not a security control; the single-file picker and the
one-upload-at-a-time rule are the control. The status vocabulary (FR-044) is a
display rule, not a control; the status's closed enum is the control and is
asserted by the record's check constraint.

### Gate 3 — Deferred Areas Touched

| Deferred area | What this feature decides | Rules still missing | Ratification plan (owner, deadline ≤ feature acceptance) |
|---|---|---|---|
| File ingestion internals | This slice is the first to implement the area, and it fixes three of its parts: the content-type validation rules per format (the OOXML content types and part names, the OLE2 stream names, and the PDF header and document catalog); the object-storage layout (`intake/{uploadId}/original`, `catalogs/{catalogId}/{sha256}.{ext}`, the part size, the URL expiry); and the isolation between merchants' files (a key carries no merchant identifier and is reachable only through a signed URL or the owning module's projection, and the one cross-merchant read is the bounded duplicate projection). | The complete per-format signature and container tables as data (the first three are in `contracts/intake-formats.md`); the storage lifecycle rules (the abandoned-multipart abort, the orphan reconciliation, the bucket policy); the scanner protocol's full error taxonomy; and the sanitizer's per-format rule set. The isolation rule is no longer missing: the constitution names the duplicate projection as its single exception (7.0.0, ADR-175). | Repository owner; ADR-166 … ADR-174, `docs/domain-model.md`, and `contracts/` land with this plan; the constitution amendments (the isolation exception; CMV row 20; Principle V's scope) **landed on 2026-11-13 as 7.0.0, recorded by ADR-175** — inside the 2026-11-27 deadline, before R2's acceptance. |
| Extraction algorithm | Not touched — R3 owns it. No extraction surface is built. | The extraction rules remain open. | Not applicable to R2 (R3). |
| Catalog data shape | Closed by ADR-040; not touched. The `Catalog`'s field-level facts are not this area — they are the entity's record and are settled below. | — | Not applicable to R2. |
| Authorization model | Not touched — R13 owns it. R2 consumes the single shared entry point and adds no permission rule. | The permission matrix remains open. | Not applicable to R2 (R13). |
| Retrieval interface | Not touched — R5 owns it. The duplicate's parts link is a route, not a ranking rule. | Ranking and ordering remain open. | Not applicable to R2 (R5). |

| Unresolved product fact (from `docs/domain-model.md`) | Touched by this feature? | How it is resolved here | ADR + domain-model.md amendment recorded? |
|---|---|---|---|
| #1 the message sender's representation | No | Not touched — R10 owns it. | Not applicable |
| #2 `Conversation`'s administrator reference | No | Not touched — R10 owns it. | Not applicable |
| #3 whether `expires_at` is the retention deadline or the printed expiry date | No | Not touched — R15 owns it; R2 records the upload timestamp and neither reads nor writes `catalogs.expires_at`. | Not applicable |
| #4 notification retention | No | Not touched — R9 owns it; R2 creates no notification. | Not applicable |
| **#9 a catalog's stored byte count and content type** | **Yes** | **Settled**: the record carries the kept file's byte count and its content type, plus the uploaded file's name. The fields are `catalogs.byte_size`, `catalogs.content_type`, and `catalogs.file_name`. | **ADR-166**; `docs/domain-model.md` row 9 struck through and the `Catalog` invariants amended |
| #10 whether a part stores its page and row | No | Not touched — R3 owns it. | Not applicable |
| #11 a contact message's state | No | Not touched — R11 owns it. | Not applicable |
| #12 a multi-separator printed price | No | Not touched — R3 owns it. | Not applicable |

### Post-Phase 1 re-evaluation (2026-11-13, against constitution 7.0.0; re-checked 2026-11-14 against 7.1.0)

**Status: every gate row is PASS, or PASS subject to a named closing task** —
as the fifth pass records, Deployment and
Observability moved to PASS with one explicitly accepted evidence gap
(Complexity Tracking rows 7 and 22); the sixth pass (below) makes that row
**PASS subject to R12** and Gate 1 → VIII **PASS subject to T111**, which the
twelfth pass (below) settles at **PASS** when it registers the acceptance in
`EX-013` and leaves `EX-007` open until acceptance, and whose scope the twentieth pass widens to US3
and the three US1 tasks that consume T066. The
design artifacts were generated (`research.md`, `data-model.md`,
`contracts/intake-api.md`, `contracts/intake-formats.md`,
`contracts/ui-contracts.md`, `quickstart.md`) and introduced no new gate
violation:

- The **Ownership Map** gained the paths the design proves are touched
  (`apps/api/src/{app,env}.ts`, `http/deps.ts`, `openapi.json`, the test harness
  and fixtures, the shared barrels and `routes.ts` (read only — R1 registered
  every route this slice links to), the page middleware and R1's
  sign-in page and session composable, `compose.dev.yml`, `.env.example`,
  `package.json`, the CI workflow, the seeder, and `scripts/storage/init-bucket.mjs`)
  and corrected one entry the pre-design draft had wrong: `packages/shared/src/refusals/`
  is **new to R2**, not an R1-owned union R2 extends, because R1 keeps
  `authErrorCodes` in `contracts/auth.ts` and no `refusals/` directory exists in
  the tree. The union is created here and R1's 26 codes are unchanged.
- The **refusal set** is **17** intake codes, not the 16 the research draft
  counted: `contracts/intake-api.md` §3.1 lists seventeen `UPLOAD_*` codes — the
  name's and the size's, the three content answers, the two scan answers, the
  expansion cap, the sanitization, the three limits, the storage failure, and the
  two protocol answers `UPLOAD_INVALID_REQUEST` and `UPLOAD_INCOMPLETE` — and the
  four R1 rows an intake route reuses (`NOT_FOUND`, `CSRF_FAILED`,
  `PAYLOAD_TOO_LARGE`, and `INTERNAL_ERROR`) are R1's own, adding no eighteenth
  intake row. The catalogue's exact count is
  `authErrorCodes.length + intakeErrorCodes.length` = 43, its one-row and
  one-producer invariant is Complexity Tracking row 26's, and
  `contracts/intake-api.md` §3.2 states how a cause enters.
- The **format contract** answers the deferred area's first three parts with a
  per-format table (signature, document probe, sanitizer rules, cap measurement),
  including the OLE2/encrypted-OOXML distinction and the `.xlsm`/`.docm` refusal.
- The **UI contract** fixes the eleven baseline states, every string, the focus
  and announcement rules, the four format surfaces (date, size, duration,
  status), and the 44 visual baselines. No design value was copied out of
  `packages/ui`; the contract names the layer's components and tokens.
- The **Complexity Tracking reference chain is closed**: the table carried rows
  1–22 at that re-check, carries rows 1–23 after the third pass, carries rows
  1–24 after the fourth pass, carries rows 1–25 after the reviewer's copy pass,
  and carries rows 1–26 after the closed-set pass, and every
  citation across `plan.md`, `tasks.md`, `contracts/`,
  `quickstart.md`, and `checklists/` names the row that owns its subject. The
  four-field health probe and the backup drill's assertion are row 22; row 9
  remains the `EX-001` ClamAV exception and owns nothing else; row 24 is the
  Arabic mirror's second wording of the status labels and row 25 the mirror's
  quoted duplicate message, and no task cites either, because no file of this
  slice edits the mirror; row 26 is the platform refusal catalogue's closed-set
  invariant — the 43-code union and one contract row and producer per code — and
  T032 is the task that cites it, while T013 and T019 cite FR-064 for the
  seventeen intake causes rather than AC-020, which measures only the safety
  refusals' presentation. No artifact
  cites a row that does not exist, and none cites row 9 for the health body.
- The **version disagreement is closed, not carried**: ADR-175 amended the
  constitution to 7.0.0 / 2026-11-13 with `version.json` moving with it, and
  ADR-176 amended it to 7.1.0 / 2026-11-14 (the Quota semantics paragraph only);
  the register's last row is ADR-179, with ADR-174 the last of this change's own
  records, and `governance-drift-check.mjs` reports clean on `A`, `B`, and `J`.
  On that evidence Gate 1 → V and Gate 2 → Schema and Migration Control, Module
  Discipline, and Documentation moved from NOT SATISFIED to PASS, and the four
  Complexity Tracking rows that recorded them (rows 1–4) are closed.
- The **dependency declaration is owned**: `apps/api/package.json` and
  `pnpm-lock.yaml` are in the Ownership Map and one task (T095) declares the
  four libraries, so no adapter task edits a manifest and no path the tasks
  touch is unowned.

### Second design pass (2026-11-14)

`/speckit.analyze` found eleven inconsistencies across the three artifacts.
This pass carries the two that belong to Phase 1 into the design artifacts that
own them, and re-affirms the plan's own rows.

- The **UI contract** resolves the limit codes' actions: `UPLOAD_MONTHLY_LIMIT`
  and `UPLOAD_ACTIVE_LIMIT` carry neither an error panel nor the «اختيار ملف
  آخر» action, while the quota block's «تحديث» control (FR-015, FR-017)
  belongs to the quota state and stays (FR-016, FR-017).
- The **UI contract** fixes the two labels for `/my-files` and their scopes:
  «الانتقال إلى ملفاتي» on the success outcome, «ملفاتي» on the duplicate's
  failed original, and SC-004 measures «ملفاتي» alone.
- The **HTTP contract** names the suite that proves the signed transfer grant:
  the storage-adapter suite `T031` writes — a replayed URL, a changed part
  number, and an expired URL all fail (T16, FR-035).
- The **plan** names the two forty-four sets apart: the 44 accessibility
  presentations at 320 and 1280 CSS px, and the 44 visual baselines at 1280 and
  375 CSS px. Neither set enters the other's measurement, and SC-008's ratio is
  the accessibility pair alone.

**No gate row moves in this pass.** Every row is PASS except Deployment and
Observability, which the fifth pass (below) settles at PASS with one explicitly
accepted evidence gap (rows 7 and 22).

### Third pass (2026-11-14, after the two clarification sessions)

This pass re-runs the plan over the clarified specification and closes the four
findings the review raised against it. It changes `plan.md` alone: the
specification, the research, the data model, the contracts, the quickstart, and
the tasks are untouched, no requirement identifier moves, no Constitution
Mandated Values row is renumbered, and no Complexity Tracking row is renumbered
— the table now carries rows 1–23, and row 23 is the one this pass adds.

- **C2 — Principle V's measurement.** The Verification Notes now name the one
  scan that measures the Arabic text, the Latin numerals, and the absence of
  emoji: R1's `apps/web/tests/unit/user-facing-strings.spec.ts`, extended with
  `packages/ui/app/components/upload/` and `apps/web/app/composables/upload/`.
  The file stays R1's, and the Ownership Map records it as «R2 extends it» —
  the one row this pass adds to that map.
- **C3 — the direction check.** Gate 1 → IV now names the check that reads the
  new layer files and demands the logical direction property's presence, and the
  task responsible for it: **T030**'s component spec in
  `packages/ui/tests/upload/`.
- **G2 — the workspace sweep.** The sweep is not implemented by this slice, so
  the plan no longer describes it as one: the Technical Context says so, the
  Constraints state its bound, the threat map names it as deferred, and
  Complexity Tracking row 23 records the obligation with its owner and its
  review date. The fields T010 and T038 write are what that sweep reads.
- **U3 — the workspace bound.** The Technical Context states that the 100 MB
  ceiling is a per-file bound and that the sanitized copy is not counted inside
  it.

**No gate row moves in this pass.** Every row is PASS except Deployment and
Observability, which the fifth pass (below) settles at PASS with one explicitly
accepted evidence gap (rows 7 and 22).

### Fourth pass (2026-11-14, after Clarifications 2026-11-14 (4))

This pass records the one work item the specification's clarification (I1) hands
to the plan. It changes `plan.md` alone: the specification, the research, the
data model, the contracts, the quickstart, and the tasks are untouched, no
requirement identifier moves, no Constitution Mandated Values row is
renumbered, and no Complexity Tracking row is renumbered — the table now
carries rows 1–24, and row 24 is the one this pass adds.

- **I1 — the Arabic mirror's second wording of the status labels.** The
  specification fixes the four Arabic labels in FR-044 alone and states that
  `Core-Project.txt` is subject to that vocabulary rather than to a second
  wording of it, and that the amendment that brings the mirror to the same
  wording is a separate manual change outside this slice's artifacts. This plan
  records that work item as **Complexity Tracking row 24**, with the repository
  owner and R4's acceptance as its review date, and points at it from the
  Technical Context's status-vocabulary value. No task in `tasks.md` edits the
  mirror, and the Ownership Map gains no path for it: the mirror is outside
  this slice's artifacts.

**No gate row moves in this pass.** Every row is PASS except Deployment and
Observability, which the fifth pass (below) settles at PASS with one explicitly
accepted evidence gap (rows 7 and 22).

### Fifth pass (2026-11-14, the design-consistency review)

This pass answers the review's design findings without restructuring the slice:
it changes `plan.md`, `data-model.md`, and `contracts/`, adds no Complexity
Tracking row (the table still ends at row 24), adds no requirement identifier,
moves no Constitution Mandated Values row, and edits no task — `tasks.md` is
untouched and no task identifier moves. The periodic sweeps of the slice's
transient state are now one recorded obligation rather than a design the plan
denied while the design artifacts assumed it (row 23), and the two gate rows an
earlier draft left short of PASS are settled.

- **The statement the success outcome carries (INC-01).**
  `contracts/ui-contracts.md` §4.4's success body now carries FR-047's statement
  verbatim — «تبدأ المعالجة تلقائيا» — as its own sentence, and the contract says
  that the subtitle's «المعالجة تبدأ تلقائيا» is FR-005's sentence and a
  different string. No requirement changed and no identifier moved.
- **The sweeps (INC-04).** The workspace file whose request died, the expired
  session and its staging object, the attempt rows, and the monthly counter rows
  are one deferred obligation (row 23, owner R3). `data-model.md` §9 states each
  predicate as the contract the owning slice implements and no longer describes a
  sweep that runs; `contracts/intake-api.md` §6.3 marks the expiry transition as
  not taken by R2 and states that no departure leaves `completing`.
- **The catalog's clock (INC-07).** `data-model.md` §2 no longer gives
  `uploaded_at` a `now()` default: the service writes it once from the instant
  the acceptance reads (FR-011), so the timestamp and the month key are that one
  value and no second clock reading can separate them. §1 states which timestamp
  each of the four tables actually carries.
- **The duplicate's read (INC-09).** `data-model.md` §12 says the original's four
  fields are read when the duplicate is recognized — the partial unique index's
  `23505`, in the same request — and not when the outcome is rendered.
- **The departure (COV-02أ).** FR-050's mechanics are designed on both sides: the
  page's `pagehide` beacon with `keepalive` and its `XMLHttpRequest` part
  transport's `abort()`, and the server's `open`-only abort with a structural
  backstop (Technical Context,
  Verification Notes, "Specification Detail Owned Here" → FR-050, and
  `contracts/intake-api.md` §2.4 and §6.3).
- **Gate 1 → VIII (CON-01ب).** The row withdraws the claim that US1–US4 need no
  other story, states that US2, US4, and US5 depend on US1, and records the
  explicit acceptance of Principle VIII with the clause's five fields in row 21;
  the register identifier that acceptance carries is `EX-013`.
- **Gate 1 → VII (CON-03ب).** The row records the widened scan and its two
  product names — FR-008's «the page's file-name surface» and FR-032's
  «the sanitization-failed cause» — as the specification's product vocabulary,
  and no longer claims an empty scan; the refusal-code form returns nothing,
  because the cause's registered code is carried by the contracts alone.
- **Gate 2 → Deployment and Observability (CON-02).** The row is PASS: the
  four-field health probe and the drill's assertion are this slice's own tasks
  (T021 and T088), and the file-bytes RTO/RPO evidence is explicitly accepted
  with R12 as the owner of the closing work and 2026-12-15 as the review date.
- **The defect references (INC-12ب).** The `/my-files` link cites roadmap
  defect 1 (My Files had no owning slice before R4) in Gate 1 → VIII, Gate 2 →
  Product Scope, row 12, and `contracts/ui-contracts.md` §9; defect 19 stays with
  the frame's four static-page links, and defect 20 with the Parts link.
- **The small corrections.** The format line's requirement reference is FR-005
  (LOW-02); ADR-090 joins the reaffirmed records (LOW-04); `data-model.md` §1's
  timestamp sentence matches the four tables (LOW-05); and the Project Structure
  tree now carries every path the Ownership Map names (LOW-01).

**One gate row moves.** Deployment and Observability moves from NOT SATISFIED to
PASS on that explicit acceptance; no other row changes status, no row is added,
and the Complexity Tracking table still ends at row 24.

### Sixth pass (2026-11-14, the ownership and gate-status correction)

This pass answers five review findings against the plan's governance posture.
It changes `plan.md` alone: the specification, the research, the data model, the
contracts, the quickstart, and the tasks are untouched, no functional
requirement, acceptance criterion, or success criterion moves, no Constitution
Mandated Values row is renumbered, no Complexity Tracking row is renumbered (the
table still ends at row 25), and no task identifier is renumbered — **T111** is
appended after T110.

- **The two governance files enter the Ownership Map (1).**
  `.specify/templates/exception-register.md` and `governance-drift-check.mjs`
  are rows of the map, each with `002-file-intake` as the writing feature,
  `yes` in the written column, and `no — project-owned governance` in the
  exclusive column: the register is the one file every granted exception is
  appended to, and the check enforces the repository's structural counts.
  **T111** writes both, so no path a task touches is unowned, and the Project
  Structure tree names both paths.
- **Gate 1 → VIII names the register row and the count it moves (2, 3).** The
  row records that `EX-013` is appended to the register with the repository
  owner as approver and 2026-12-11 as its review date, and that
  `governance-drift-check.mjs`'s G2 exception-row count moves from twelve to
  thirteen, on the pattern R1's plan set when it appended `EX-008` … `EX-012`.
  Its status is **PASS subject to T111**: the acceptance is recorded here, and
  the governance change that makes it visible to the drift check is a task this
  slice runs rather than a promise the plan makes. The sentence that called the
  count "a governance change this plan does not make" is replaced accordingly,
  in the gate row and in the Complexity Tracking note below the table.
- **Gate 2 → Documentation carries the same record (2).** It names the register,
  the row, its approver and review date, the G2 count's move from twelve to
  thirteen, and T111 as the single writer of both files.
- **Row 21's exact scope gains the two test paths (4).**
  `apps/web/tests/unit/upload/` and `apps/api/test/fixtures/intake/` join the
  scope, because US4's and US5's unit suites and US2's fixtures are increments
  the three stories write over US1's engine; the scope now names every test path
  their tasks write.
- **Gate 2 → Deployment and Observability is PASS subject to R12 (5).** The
  file-bytes leg of CMV rows 8–9 has no evidence until R12's runbook and drill
  exist, so the row says so in its status instead of carrying an unqualified
  PASS; the accepted gap stays Complexity Tracking row 7, whose owner (the R12
  owner) and 2026-12-15 review date are unchanged. No second exception row is
  opened for it, because row 7 already carries the acceptance and a register row
  here would move G2 past the thirteen T111 sets.

**Two gate rows change status in this pass** — Gate 1 → VIII and Gate 2 →
Deployment and Observability, each to PASS subject to the task or slice that
closes it. No row is added, and the Complexity Tracking table still ends at
row 25.

### Seventh pass (2026-11-14, the refusal catalogue's closed-set invariant)

A reviewer found that T032 asserts the platform catalogue's closed-set
invariant — one contract row and one producer per code, with the exact count
`authErrorCodes.length + intakeErrorCodes.length` = 43 — while no FR or AC owns
that union: FR-064 closes the seventeen intake causes, AC-020 covers only the
safety refusals' presentation, and T013, T019, and T032 were borrowing AC-020. This
pass records the invariant where the plan owns technical detail and corrects the
three tails in `plan.md`, `tasks.md`, `research.md`, and
`contracts/intake-api.md`; the specification is untouched and no requirement,
acceptance criterion, or success criterion moves.

- **Row 26 is added.** It owns the 43-code union, the one-row/one-producer rule,
  and the exact-count assertion, with the repository owner and R2's acceptance
  (2026-12-11) as its review date. `contracts/intake-api.md` §3 cites it as the
  row that owns the invariant.
- **T013 and T019 cite FR-064 instead of AC-020.** Both build the
  seventeen-code set and its rows, which FR-064 owns; AC-020 measures the safety
  refusals' messages, not the set. T013's union and T019's record remain row 26's
  production, and T032 proves the invariant.
- **T032 cites row 26 alone.** Its outcome is the catalogue invariant, not a
  product behaviour: it asserts the union, the one-row/one-producer rule, and
  the count, so its tail is `(implements Complexity Tracking: row 26, ...)` and
  it leaves FR-064 to T057's message-table test.
- **No identifier moves.** The specification stays at 65 requirements, 51
  acceptance criteria, and 13 success criteria; the Complexity Tracking table
  ends at row 26; no task is renumbered.

### Eighth pass (2026-11-14, the precision corrections after C1)

This pass answers six precision findings against statements the earlier passes
wrote. It changes `plan.md` alone: the specification, the research, the data
model, the contracts, the quickstart, and the tasks are untouched; no functional
requirement, acceptance criterion, or success criterion moves; no Constitution
Mandated Values row is renumbered; no Complexity Tracking row is renumbered (the
table still ends at row 26); and no task identifier moves.

- **E1 — Gate 1 → VII records the scan's actual result.** The three widened
  forms — `Wf[A-Z]\w*`, `UPLOAD_[A-Z_]+`, and the path vocabulary `apps/` /
  `packages/` — each return **zero matches** in `spec.md`; the two product names
  the file keeps, FR-008's «the page's file-name surface» and FR-032's
  «the sanitization-failed cause», are product vocabulary rather than scan
  matches, and the row states that instead of calling them matches.
- **I3 — Gate 1 → IV states the direction check as T030's current wording.** The
  check is required of the four new layer files, and **T030**'s component spec in
  `packages/ui/tests/upload/` carries it now: it reads the source of each of the
  four files and demands the logical direction property's presence — every inset
  uses `inset-inline-start`/`inset-inline-end`, every outer spacing uses
  `margin-inline-*`, every inner spacing uses `padding-inline-*` — and the
  physical property form's absence (`left`, `right`, `margin-left`,
  `margin-right`, `padding-left`, `padding-right`); the row rests on the task's
  wording as it stands, and the tasks amendment that adds the check to T030 has
  landed.
- **A2 — CMV row 5 restates R1's basis.** The number 11 is **7** external direct
  runtime dependencies (nine `dependencies` entries less the two `workspace:*`
  packages) plus R2's four; `devDependencies` are outside the count.
- **M1 — two read-only rows enter the Ownership Map.**
  `apps/web/app/layouts/shell.vue` (T080–T087) and `lighthouserc.json` (T094)
  are recorded as read by this slice and written by none of its tasks, so the
  map covers every path the tasks touch and not only the ones they write.
- **G1 — the exception-register row names the right five identifiers.**
  `AC-024`, `AC-042`, `AC-051`, `SC-005`, and `SC-006` are the five identifiers
  `EX-007` names that this slice's specification also defines, so they are the
  five T111 qualifies with the `001-identity-foundation` prefix; `AC-052` and
  `AC-053` are R1-only and are not in the list.
- **H1 — the departure test reads the parts list.** The e2e assertion calls
  `ListParts` and requires the aborted multipart to be gone, not only the object
  listing to be empty, because a part of a multipart upload is not an object.
  The **ninth pass settles the mechanism H1 leaves open**: the read is the
  adapter's `listParts` (`contracts/intake-api.md` §6.1), which maps S3's
  `NoSuchUpload` to `{ parts: [] }` so the assertion is `parts.length === 0` and
  not a caught error, and the withdrawal is `abortMultipart` — not
  `DeleteObject`, which removes the completed object and withdraws no part.

**No gate row changes status in this pass.** Gate 1 → VII's evidence is restated
with the scan's real result and Gate 1 → IV's is restated as T030's current
description of the direction check; every other row keeps the status the seventh
pass left it with, and no row is added.

### Ninth pass (2026-11-15, the departure proof's storage operations)

This pass answers the one question the eighth pass's H1 note left open: **how the
departure cases read a multipart's parts list at all.** It changes `plan.md` and
`contracts/intake-api.md` alone; the specification, the research, the data model,
the other two contracts, the quickstart, and the tasks are untouched, **no
`FR-###`, `AC-###`, or `SC-###` identifier moves**, no Constitution Mandated
Values row is renumbered, no Complexity Tracking row is renumbered, and no task
identifier moves.

- **The adapter gains `listParts`** (`contracts/intake-api.md` §6.1):
  `listParts({ key, uploadId })` answers `{ parts: { partNumber, byteSize }[] }`
  and maps S3's `NoSuchUpload` to `{ parts: [] }`, so the empty-parts assertion is
  one shape — `parts.length === 0` — whether the abort has run or the transfer
  never wrote a part. No task needs an amendment: **T024**'s scope is already the
  whole interface §6.1 fixes, and **T031** and **T109** already assert that the
  upload's parts list is empty after the abort.
- **The two operations are named apart** in the Technical Context, in H1's note,
  and in §2.4: `abortMultipart` is the operation that withdraws a transfer's
  unfinished parts, and `delete` (S3's `DeleteObject`) removes the completed
  staging object and withdraws no part — so the abort route calls the abort first
  and the delete second, and the proof reads both surfaces because an unfinished
  part is not an object. Complexity Tracking row 15's operation list gains
  `ListParts`, the one S3 call this pass adds to the client that row records, and
  its rejected alternative's count moves from five operations to six.
- **Gate 1 → VII is the one row re-evaluated, and it keeps PASS**: the four names
  this pass adds are storage vocabulary and enter `plan.md` and the contract
  alone; `spec.md` gains no byte, so the three widened forms still return zero
  matches there and the row's evidence records that result.

**No gate row changes status in this pass**, and no row is added.

### Tenth pass (2026-11-15, the specification-first row's precise claim)

This pass answers one precision finding against Gate 1 → VII's wording. It changes
`plan.md` alone: the specification, the research, the data model, the contracts, the
quickstart, and the tasks are untouched; no functional requirement, acceptance
criterion, or success criterion moves; no Constitution Mandated Values row and no
Complexity Tracking row is renumbered (the table still ends at row 26); and no task
identifier moves.

- **The row states its claim in the forms the scan looks for, and names the one
  permit it records.** The earlier sentence — "No `Wf` identifier, no path, and
  no library name appears in `spec.md`" — is **replaced**: the row now says that
  `spec.md` carries no `Wf` identifier, no `UPLOAD_*` code, no source path (`apps/`,
  `packages/`), and no library, framework, database, or pattern name, and that one
  permit is recorded — the two governance paths the binding-rules comment opens
  with (`.specify/memory/constitution.md` and `.specify/memory/version.json`).
  FR-064 was the second permitted item at that pass and is not one now: on
  2026-11-15 the requirement took its boundary into itself and names no table, so
  the Twenty-second pass records the correction and the row permits the two paths
  alone. The wider word "path" was the defect: it was true of the product's
  source tree and false of the governance sources the document must name, and the row
  now says which paths it means.
- **FR-064 was recorded as the second permitted item, and as neither a form nor a
  technology.** The row stated that the requirement refers the closed seventeen-cause
  set to the interface contract — §3's refusal codes and §4.5's refusal messages —
  and that it names no `Wf` identifier, no `UPLOAD_*` code, no source path, and no
  library, framework, database, or pattern. **Superseded (2026-11-15, the
  Twenty-second pass):** FR-064 no longer refers the set to any table — it carries
  the boundary itself and refers only the four answers the intake reuses from R1 to
  the contract — so this bullet records what the row said at that pass, and Gate 1 →
  VII now permits the two governance paths alone.

**No gate row changes status in this pass.** Gate 1 → VII keeps **PASS**; the scan's
result is unchanged — the three widened forms still return zero matches in `spec.md`
— and only the sentence that states the claim is replaced.

### Eleventh pass (2026-11-15, the exception register's closure of `EX-007`)

This pass answers one gap between the register and the plan's own row 10. It
changes `plan.md` and `tasks.md`: the specification, the research, the data
model, the contracts, and the quickstart are untouched; no functional
requirement, acceptance criterion, or success criterion moves; no Constitution
Mandated Values row and no Complexity Tracking row is renumbered (the table
still ends at row 26); and no task identifier moves — **T111** keeps its number
and its place at the end of Polish.

- **The gap.** Row 10 says R2 "renders them and records each behaviour against
  the criterion beside it in the exception register", and the register's own row
  `EX-007` ends at R2's acceptance — but no task said that the row's closure is
  written down. Opening `EX-013` alone would leave `EX-007` sitting in the
  Active table with a review date its own scope calls a trigger, and the
  register would never carry the record the row requires.
- **`T111` closes the row in the same change.** It opens `EX-013` in the Active
  table and moves `EX-007` into the Closed table — the first row of it, before
  `EX-008` — with `Closed On` 2026-12-11 and a `How It Ended` cell that records
  each behaviour the row named against the criterion beside it, naming the
  evidence that proves it (`T082`–`T087` and `T099`). The five identifiers
  `EX-007` names that this slice's specification also defines — `AC-024`,
  `AC-042`, `AC-051`, `SC-005`, and `SC-006` — are qualified with their
  `001-identity-foundation` prefix wherever the Closed row names them, and
  `AC-052` and `AC-053` stay unprefixed because they are R1's alone.
- **The count stays the count.** G2's expected count moves from twelve to
  thirteen, and thirteen is the register's row count after the move and the
  addition: seven Active rows (`EX-001` … `EX-006`, `EX-013`) and six Closed
  ones (`EX-007` … `EX-012`). The move changes the table a row sits in, not the
  total, so the count follows the addition alone. The check T111 adds — every
  `EX-###` reference resolves to a register row — resolves against both tables,
  so a reference to the closed `EX-007` still resolves.
- **No second row is opened, and no other task writes the register.** `T082`
  records the behaviours in `apps/web/tests/e2e/upload.spec.ts` and writes no
  register row; the register's own record is `T111`'s alone, in the same commit
  as the opening of `EX-013` and the count's move.

**No gate row changes status in this pass.** Gate 1 → VIII stays **PASS subject
to T111** and Gate 2 → Documentation stays **PASS**; both rows now name the
closure of `EX-007` beside the opening of `EX-013`.

### Twelfth pass (2026-11-15, the exception register's acceptance of Principle VIII)

This pass answers one critical finding against this plan: the acceptance of
Principle VIII was recorded in Complexity Tracking row 21 but **not in the
exception register itself**, so the register — the one place a granted
exception is visible to a reviewer — did not carry it. It changes
`.specify/templates/exception-register.md`, `governance-drift-check.mjs`,
`plan.md`, and `tasks.md`: the specification, the research, the data model, the
contracts, and the quickstart are untouched; no functional requirement,
acceptance criterion, or success criterion moves; no Constitution Mandated
Values row and no Complexity Tracking row is renumbered (the table still ends at
row 26); and no task identifier moves — **T111** keeps its number and its place
at the end of Polish.

- **The acceptance is registered.** `EX-013` is opened in the register's Active
  table, in the row `EX-007` held, with its six fields complete: the principle
  `VIII. User Story Independence`; the exact scope — US2, US4, and US5 with
  every test path their tasks write (`apps/web/tests/unit/upload/`,
  `apps/api/test/fixtures/intake/`, `apps/api/test/integration/catalogs/`,
  `apps/api/test/integration/http/degradation.spec.ts`,
  `apps/web/tests/e2e/upload.spec.ts`, and `apps/web/tests/a11y/upload.spec.ts`)
  — carried by the scope cell's opening clause **Closes on:** US2's AC-015 –
  AC-020, US4's AC-027 – AC-034, and US5's AC-035 – AC-046; the rationale; the
  approver, the repository owner; and the review date 2026-12-11. **The
  Twentieth pass widens the scope to US3, its `UploadDuplicate.vue`, and the
  three US1 tasks that consume it, and adds US3's AC-021 – AC-026 to the
  `Closes on:` clause. **The Twenty-ninth pass adds US4's AC-047 – AC-050 to the
  same clause and names the seventh test path —
  `apps/web/tests/e2e/__screenshots__/upload/`, which T035 writes — in the
  scope's path list.**
- **`EX-007` closes in the same change.** Its row leaves the Active table and
  becomes the Closed table's first row, before `EX-008`, with `Closed On`
  2026-12-11 and a `How It Ended` cell that records every behaviour the row
  named against the criterion beside it — the guest's redirection of a
  merchant-area destination, the focus landing on the destination page's heading
  and the drawer's focus containment, the overlays' stacking order and the
  consumption of an activation outside an open overlay, the account menu's live
  open and the sign-out confirmation's result, the bottom bar's scroll-hide, and
  the label cut at the inline end — and names the evidence that proves it,
  `T082`–`T087` and `T099`. The five identifiers the row names that this
  slice's specification also defines — `AC-024`, `AC-042`, `AC-051`,
  `SC-005`, and `SC-006` — are qualified with their `001-identity-foundation`
  prefix wherever the Closed row names them, and `AC-052` and `AC-053` stay
  unprefixed because they are R1's alone.
- **The count moves, and a check joins it.**
  `governance-drift-check.mjs`'s G2 expected exception-row count moves from
  twelve to thirteen — seven Active rows (`EX-001` … `EX-006`, `EX-013`) and
  six Closed ones (`EX-007` … `EX-012`) — and a new check, **G12**, resolves
  every `EX-###` reference in the governance set against the union of the two
  tables and holds each table to its own row count, so a reference to a row the
  register does not carry fails instead of naming an exception nobody granted.
- **`T111` verifies, it does not create.** The task keeps its number and its
  place at the end of Polish, but its text now verifies what the governance
  change wrote — the presence of `EX-013` in the Active table, the closure of
  `EX-007` in the Closed table, and the G2 count — instead of opening, moving,
  and counting. No task writes the register any more, and no second exception
  row is opened.
- **No decision record is added.** This change is a governance record — the
  register and the governance tooling — and the Documentation section of the
  constitution places such a record outside the ADR field (ADR-090), so this
  pass is the record and the decision register is untouched.

**Gate 1 → VIII moves to PASS in this pass**, from **PASS subject to T111**:
the acceptance is no longer a promise this plan makes but a row the register
carries and the drift check resolves. Gate 2 → Documentation stays **PASS** and
Gate 2 → Deployment and Observability stays **PASS subject to R12**.

### Thirteenth pass (2026-11-15, the status vocabulary's single owner)

This pass answers one review finding against the UI contract (the traceability
review's `CHK014`): the contract's §6 closed with "The status vocabulary is
fixed here", while FR-044 names itself the single place the four labels are
fixed and FR-065 assigns the labels to the specification — so one text had two
owners. It changes `contracts/ui-contracts.md` and `plan.md`: the
specification, the research, the data model, the quickstart, the tasks, and the
checklists are untouched; the four labels themselves, §4.4, and §4.5 (the
refusal-message table) are untouched; no functional requirement, acceptance
criterion, or success criterion moves; no identifier is created; and no
Constitution Mandated Values row and no Complexity Tracking row is renumbered
(the table still ends at row 26).

- **The contract quotes the vocabulary instead of claiming it.** §6's closing
  sentence now reads: "The status vocabulary is FR-044's: the four labels are
  fixed there alone, this table carries them, and R4 inherits them rather than
  fixing a second set (FR-044, FR-065)." The table above it carries the four
  labels unchanged — «تم الرفع», «قيد المعالجة», «اكتمل», «فشل» — and the
  sentence now names the owner instead of asserting a second one, so the
  contract, R4, and the specification read one vocabulary (FR-044, FR-065).
- **AC-051 remains valid.** The change removes the contract's second claim over
  the four labels and adds no string, no rule, and no requirement, so the
  criterion's measured set and its wording are untouched: AC-051 remains valid,
  so that no text is owned twice (FR-063, FR-065).

**No gate row changes status in this pass**: Gate 1 → VII
(Specification-First and Documentation Separation) stays **PASS**, because the
contract now conforms to FR-065's single-owner rule rather than holding a
second claim, and Gate 2 → Documentation stays **PASS**. No Complexity Tracking
row is added: the change removes a conflict between two artifacts rather than
accepting a deviation.

### Fourteenth pass (2026-11-15, the workspace file's deletion owner)

This pass answers one review finding against this plan's storage commitment (the
review's `A1`): the Technical Context committed the intake to delete its
workspace file before it answered, and no task in `tasks.md` performed that
deletion — the plan promised a withdrawal that no owner implemented. It changes
`plan.md` and `tasks.md`: the Technical Context's Storage paragraph now states
the deletion's moment, the two files it covers, and the two bounds it leaves
untouched, and `T039`'s description now carries the deletion; the specification,
the research, the data model, the contracts, the quickstart, and the checklists
are untouched; no functional requirement, acceptance criterion, or success
criterion moves; no identifier is created; and no Constitution Mandated Values
row and no Complexity Tracking row is renumbered (the table still ends at row 26).

- **The moment and the two files are named once.** The Storage paragraph's
  sentence now reads: "**The workspace file is deleted before the intake answers,
  on both outcomes**: the local working copy of the incoming file and the
  sanitized copy the sanitizer wrote beside it are removed when the intake
  completes and when it is refused, so neither a completed nor a refused request
  leaves a workspace file behind; the per-file ceiling stays the 100 MB above —
  the accepted file size, byte for byte — and the directory's total stays bound
  to the concurrency the environment is sized for (Scale/Scope), never to the file
  ceiling." The sentence therefore leaves no reader to infer whether the deletion
  changes a bound: the per-file ceiling stays 100 MB, and the directory's total
  stays the environment's concurrency rather than the file ceiling — the two
  values the earlier paragraph fixes.
- **The commitment has an owner.** `T039` — the owner of
  `apps/api/src/modules/catalogs/service/intake.ts`, the file that writes the
  workspace files — now deletes the workspace file before answering, whether the
  intake was accepted or refused, so the file that writes them is the file that
  removes them. The task keeps its number, its phase, and its `(implements ...)`
  tail; no second task is created, no path is added to the Ownership Map, and no
  other task's identifier moves.

**No gate row changes status in this pass**: Gate 2 → Threat and Control Map row
T10 stays **PASS**, because its text — every refusal path withdraws the multipart
upload and the staging object, and the workspace file of a request that died
belongs to the deferred sweep — is untouched and remains true, and the deletion
this pass adds is the refusal path's own withdrawal of the workspace file beside
those two operations; Gate 1 → VII stays **PASS**, because the specification is
untouched. No Complexity Tracking row is added: the change gives an existing
commitment an owner rather than accepting a deviation.

### Fifteenth pass (2026-11-15, the part-write cancellation's one mechanism)

This pass answers one review finding against this plan's transport (the review's
`A2`): the plan's prose, the contract, and the task named two different
mechanisms for stopping the in-flight part writes, and the two cannot both be
true — the transport is `XMLHttpRequest` (research R-01), and a request's own
`abort()` is what stops its write. It changes `plan.md`,
`contracts/intake-api.md`, and `tasks.md`: the specification, the research, the
data model, the other two contracts, the quickstart, and the checklists are
untouched; no functional requirement, acceptance criterion, or success criterion
moves; no identifier is created; no task identifier and no task path moves; and
no Constitution Mandated Values row and no Complexity Tracking row is renumbered.

- **One mechanism, stated once.** The transport is `XMLHttpRequest`, one request
  per 8 MB part, because it reports the upload progress the page's percentage is
  drawn from and `fetch` does not; a part write in flight is stopped by calling
  `abort()` on that part's request object, and the page keeps its in-flight
  requests so the cancel control and the `pagehide` listener can abort each of
  them. The `fetch` that remains is §2.4's bodyless departure beacon with
  `keepalive`, and it carries no file byte and stops no part.
- **The four places that state it now agree.** The Technical Context's Storage
  paragraph, "Specification Detail Owned Here" → FR-050,
  `contracts/intake-api.md` §1.1, and `T051` carry that one mechanism; the
  plan's earlier departure note and the contract's §2.4 point at it.
- **Nothing else names a second mechanism.** The mention of a cancellation
  signal that is not the request object's own `abort()` is removed from the
  three places that carried it, and the `keepalive` beacon keeps its own `fetch`.

**No gate row changes status in this pass**: Gate 1 → VII stays **PASS**,
because the specification is untouched and gains no byte, and no gate row named
the mechanism this pass replaces. No Complexity Tracking row is added: the change
corrects an internal inconsistency between two artifacts of this slice, so it
accepts no deviation from a Constitution Mandated Value.

### Sixteenth pass (2026-11-15, the specification's leak of the plan's identifiers)

This pass answers one review finding against this plan's own gate: the Principle
VII scan read `spec.md` for technology and passed over the identifiers this
slice's plan and task list carry, so a status paragraph naming two task
identifiers, two tracking rows, and another slice's number passed the scan. It
changes `plan.md` and `spec.md`, and adds a note to the requirements checklist:
the research, the data model, the contracts, the quickstart, and the tasks are
untouched; no functional requirement, acceptance criterion, or success criterion
moves; no identifier is created; and no Constitution Mandated Values row and no
Complexity Tracking row is renumbered (the table still ends at row 26).

- **The scan is widened to five forms at that pass.** Gate 1 → VII then read `spec.md` for
  the two identifier forms the earlier scan did not look for — `T\d{3}` and
  `Complexity Tracking row \d+` — beside the three it already read
  (`Wf[A-Z]\w*`, `UPLOAD_[A-Z_]+`, and the path vocabulary). The slice's own
  number is deliberately not a form: a roadmap slice is a product-level fact the
  specification may name — its Assumptions name the slices that own three
  windows — while the plan's and the task list's own numbering are the plan's.
- **The first run found the violation, and the row records it rather than a
  clean result.** `T\d{3}` matched the status paragraph's two task identifiers
  and the tracking-row form matched eight references — one in that same
  paragraph and seven in the recorded clarifications and the user stories. The
  row states the match count, the fix, and the re-scan.
- **The specification is cleaned.** The status paragraph is now one neutral
  sentence about the specification's own state, and the seven references are
  reduced to the statements they make without the row numbers: each keeps its
  claim, and none loses it. The clarification that does this is recorded in the
  specification's `### Session 2026-11-15 (3)`, and the requirements checklist's
  validation note records the re-validation.
- **The status content moves here.** This plan's Summary now carries a
  **Status** item holding the paragraph's content in the plan's own words — the
  gate's PASS, the accepted deviation registered in the exception register, the
  row that passes subject to its closing work, and the one accepted evidence
  gap — and it carries none of the identifiers the paragraph carried: no task
  identifier, no tracking row, and no other slice's number. Those identifiers
  stay where they belong, in this plan's gate rows, in its tracking table, and
  in the task list.
- **No decision record is added.** The change is a defect fix and a widening of
  this plan's own scan, not a new decision; the Documentation section places a
  governance record outside the ADR field (ADR-090), and the constitution's
  Product Scope, the Product Register, and the technology register are untouched.

**No gate row changes status in this pass**: Gate 1 → VII stays **PASS**,
because the widened scan's re-run returned zero matches for all five of them, and
Gate 2 → Documentation stays **PASS**. No Complexity Tracking row is added: the
change fixes a defect rather than accepting a deviation.

### Seventeenth pass (2026-11-15, the threat map's recorded reading)

This pass answers one review finding against this plan's Gate 2 — the finding
the traceability checklist records as **CHK039**: the threat and control map's
reading was nowhere recorded, so the map could be read as a coverage instrument
and counted against the specification's 65 requirements. It changes `plan.md` and
adds a note to the traceability checklist: the specification, the research, the
data model, the contracts, the quickstart, and the tasks are untouched; no
functional requirement, acceptance criterion, or success criterion moves; no
identifier is created; no Constitution Mandated Values row and no Complexity
Tracking row is renumbered (the table still ends at row 26); and no task
identifier moves.

- **I2 — the reading is recorded once, in the section that owns it.** The Gate 2
  threat and control map now opens with one paragraph that states what the map
  is: it pairs each abuse with its control and the test that fails when the
  control is removed; it names **31 of the specification's 65 requirements** —
  the 28 in the Requirements column, `FR-020` in the note after the table, and
  the two endpoints of the range its own heading carries (`FR-001` and
  `FR-065`); the check that accounts for all 65 is `tasks.md` § Requirement
  Coverage, and restating every requirement is not the map's subject; and the
  two entries that are not controls — the multi-file notice (`FR-020`) and the
  status vocabulary (`FR-044`) — are named as they are.
- **The map itself is untouched.** No row is added, no control is modified, no
  identifier is renamed or renumbered, and the two deliberate non-controls are
  still named after the table in the same words.
- **No decision record is added.** The change records how a map the plan already
  holds is read; it introduces no rule, no product decision, and no technology,
  so the ADR field does not reach it.

**No gate row changes status in this pass**: the map's sixteen rows, their
controls, and their cited requirements are untouched — the added paragraph
records how the map is read, not what it does — and Gate 2 → Binding Sections
keeps every row it had. No Complexity Tracking row is added: the change records
a reading rather than accepting a deviation.

### Eighteenth pass (2026-11-15, the tracking-row scan's last two blind spots and the review's remaining findings)

This pass answers the review's findings: one against Gate 1 → VII, whose scan
carried five forms, so a mandated-values row (`Constitution Mandated Values row
\d+` or `CMV row \d+`) and an unnumbered mention of the tracking vocabulary
(`Complexity Tracking` with no row at all) could sit in `spec.md` while the row
still claimed a clean result; and five against the plan's own statements — the
projection's place in Phase 2 (F1), the sample-evidence gap beside row 7 (F4),
the load run's per-phase failure criterion (F6), the pre-sign limit refusal's
counting (F2), and Gate 1 → I's account of the task tails (D2). It changes
`plan.md`, `spec.md`, `contracts/ui-contracts.md` §7, the copy checklist's
CHK012 note, `research.md`, `quickstart.md`, and `tasks.md`: no functional
requirement, acceptance criterion, or success criterion moves; no identifier is
created; no Constitution Mandated Values row and no Complexity Tracking row is
renumbered (the table still ends at row 26); and no task identifier moves.

- **The scan is widened to seven forms.** Gate 1 → VII adds
  `Constitution Mandated Values row \d+`, `CMV row \d+`, and
  `Complexity Tracking row` read with a row number or with none, beside the five
  it already carried. The row reference without a number is a form because it
  carries the same bookkeeping a numbered one does; the abbreviation is a form
  because a row named `CMV` is the same leak in fewer letters. A bare mention
  that drops the word `row` is outside the three forms, which is why this pass
  also reads for it and records the one it found.
- **The first run found the last two references, and they are fixed rather than
  waived.** `Constitution Mandated Values row \d+` matched the 2026-11-13 (7)
  clarification; `CMV row \d+` and `Complexity Tracking row` read with a number
  or with none matched none; and the same reading found the 2026-11-13 (6)
  clarification's unnumbered mention, which names the table without the word
  `row` and that no form can match. The clarification now states the value
  without the row number, and the prose names the window without the table's
  name. The re-scan returns zero for all seven forms, and the file carries no
  plan row.
- **The surviving mention is writer guidance.** The only place the vocabulary
  still appears in `spec.md` is the binding-rules comment at line 61 — «the
  plan's Complexity Tracking table» — and it is an HTML comment addressed to the
  specification's author about where a product addition is recorded: it renders
  nowhere, states no requirement, and is not the product's statement, so
  Gate 1 → VII records it instead of editing it away. **The count that sentence
  carries is this pass's own reading, and the nineteenth pass records its
  correction**: the reading matched the phrase on one line, so two mentions
  broken across a line break — one inside FR-047 and one in the Assumptions —
  survived it; the nineteenth pass removes them and re-reads the file with a
  break-tolerant pattern.
- **B1 — the format name is named as such.** The accessibility contract's
  reading-order rule now says «format name» where it means the format's name, and
  states that the file name the merchant supplies is a separate run, read as
  supplied and not as a format name, and stays governed by FR-008; Gate 1 → V
  and the copy checklist's CHK012 note carry the same word. The change is
  terminological: no rule, requirement, or acceptance criterion changes.
- **F1 — US3's sentence says what it ships and what it proves, and why the
  projection stays in Phase 2.** Gate 1 → VIII's first clause reads that US3
  ships the duplicate outcome's panel (T066) and proves the projection Phase 2
  composes (T064, T065), instead of the earlier clause that could be read as US3
  writing the projection itself; the same clause now carries the reason T064 and
  T065 sit in Phase 2 — T039's intake sequence calls T065 on a hash conflict, so
  US1 cannot run without it. Row 21's scope stayed US2, US4, and US5 alone in that
  pass, because US3 was read as a production increment; **the Twentieth pass
  supersedes that reading** and widens the row and `EX-013` to US3, its
  `UploadDuplicate.vue`, and the three US1 tasks that consume it, because US1's
  page and its state evidence cannot be completed without T066. The accepted
  deviation's kind, approver, and review date are unchanged.
- **F4 — row 7 is the only recovery-evidence gap, and row 6 is named beside it.**
  The Complexity Tracking note reads that row 7 is the only recovery-evidence gap
  that remains and that row 6's sample-evidence gap (PDF only) is recorded beside
  it, and the Summary's Status paragraph states the same qualification, so no
  sentence claims the sample gap is closed or absent. Row 6's owner and its
  2027-01-15 review date are unchanged.
- **F6 — the load run's failure criterion is per phase.** The Verification
  Notes' Budget check, `research.md`'s load decision, `quickstart.md`'s expected
  result, and tasks T005 and T091 now state that the design and stress phases
  fail on any refusal other than the fixture's expected duplicate, that the
  limit-boundary phase expects one acceptance and 59 limit refusals per merchant
  and records the counts by cause against SC-005, and that the run still fails on
  a measured query above 100 ms p95, a percentile above CMV row 6, or a
  regression above 10%. The limit-boundary sample's expected outcome is
  unchanged: ten merchants, 60 uploads each, the 60th counted, no attempt-bound
  refusal, no retry, and no repeated submission.
- **F2 — a limit refusal counts as an attempt only where it is decided.** CMV
  row 20 now reads that the bound is enforced on the server after the file-level
  checks (FR-021–FR-024) and that a limit refusal is decided at the pre-sign check
  (FR-013), so neither counts as an attempt; it adds that a submission which
  reached the counter and was later refused for a limit at acceptance was already
  counted. The bound, its UTC window, and its enforcement point are otherwise
  unchanged.
- **D2 — Gate 1 → I states both task tails, with the count.** The row now reads
  that every task ends with `(implements FR-###, AC-###)` or, where no requirement
  applies, `(implements Complexity Tracking: row N)`, and that 23 tasks carry the
  second form — the count `tasks.md` carries today (T001–T009, T016, T017, T020,
  T021, T032, T035, T082, T088, T091–T094, T095, and T111). The earlier sentence's
  future tense («will end with») is replaced by the present, because the task list
  is complete and the tails are written.
- **No decision record is added.** The change fixes a scan's blind spot, a word
  in two artifacts, and five statements in the plan and the task list; it
  introduces no product decision, and the Documentation section places a
  governance record outside the ADR field (ADR-090).

**No gate row changes status in this pass**: Gate 1 → VII stays **PASS**, with
its result now stated over seven forms, and Gate 1 → I, Gate 1 → V, and
Gate 1 → VIII stay **PASS**. No Complexity Tracking row is added.

### Nineteenth pass (2026-11-15, the tracking vocabulary's last two mentions)

This pass answers one finding against the eighteenth pass's reading of
`spec.md`: that pass read the unnumbered mention of the tracking vocabulary on a
single line, so the mentions a line break split were invisible to it, and its
statement that the binding-rules comment at line 61 was the only surviving
mention was short by two. It changes `plan.md` only, recording `spec.md`'s two
removals: no functional requirement, acceptance criterion, or success criterion
moves; no identifier is created; no Constitution Mandated Values row and no
Complexity Tracking row is renumbered (the table still ends at row 26); no task
identifier moves; and no technical detail is copied into `spec.md`.

- **The reading was incomplete, and the two mentions it missed are the proof.**
  The eighteenth pass re-read `spec.md` for a mention that names the table
  without the word `row` and found one — the 2026-11-13 (6) clarification's
  «records in Complexity Tracking» — which it removed. Two further mentions of
  the same vocabulary were broken across a line break, `Complexity` ending one
  line and `Tracking` beginning the next: one inside FR-047 and one in the
  Assumptions. A reading that matches the phrase on one line cannot see either,
  so the two survived a pass that recorded the file clean.
- **Both are removed, and the requirement and the assumption keep their
  meaning.** FR-047 and the Assumptions now state what they require and assume
  without naming the plan's table; no requirement, acceptance criterion, or
  assumption changes its subject, and the file gains no other edit.
- **The reading is widened to tolerate the break, and it is not a form.** The
  unnumbered mention is now read with `Complexity\s+Tracking`, so a break
  between the two words no longer hides a mention. The pattern reads the same
  subject the seven forms already cover — an unnumbered mention of the plan's
  bookkeeping — so it is **not an eighth form**: the form count stays seven.
- **Re-read, the file returns one mention.** With the tolerant reading,
  `spec.md` returns exactly one mention — the binding-rules comment at line 61,
  «the plan's Complexity Tracking table» — and nothing else; the seven forms
  still return **zero**, and the file carries no plan row. The surviving mention
  stays for the reason the eighteenth pass gives: it is an HTML comment
  addressed to the specification's author, renders nowhere, states no
  requirement, and is not the product's statement.

**No gate row changes status in this pass**: Gate 1 → VII stays **PASS**, with
its result now stated over seven forms and the tolerant reading recorded beside
them, and no other row is touched. No Complexity Tracking row is added: the
change fixes a reading and the two mentions it missed, not a deviation.

### Twentieth pass (2026-11-15, the duplicate panel's cross-story edge, the retryable set, and the presentation term)

This pass answers the analysis's `C1`, `C2`, and `I6` findings and the review's
contract-alignment findings. `C1` found that Phase 3's `T052`, `T034`, and
`T035` render the duplicate presentation, whose panel `T066` is Phase 5's. The
pass chooses the least-impacting of the three candidate answers — **widen
`EX-013` to US3 and the new dependency** — rather than moving `T066` across
phases (which would make US3 a test-only story or rewrite the story model) or
moving `T034`/`T035` after `T066` (which would leave `T052`'s composition
dependent and US1's state evidence in a later phase). No task identifier, phase,
`[P]` marker, path, or count moves; `T066` is pulled forward in execution order
and keeps its Phase 5 place. `C2` adds the acceptance's subject: the exception
covers the test coverage the four stories write, not implementation only. `I6`
corrects `contracts/intake-api.md` §2.3's scan-budget citation from a
mandated-values row to the plan value the `Technical Context` and `research.md`
R-16 record. The contracts are aligned with the specification's transfer-failure
definition and retryable set (FR-049): a transfer failure is the page's own cause and has
no server code; `UPLOAD_INCOMPLETE` is a server answer and is not retryable; the
three retryable server codes are `UPLOAD_SCAN_UNAVAILABLE`,
`UPLOAD_TOO_MANY_ATTEMPTS`, and `UPLOAD_STORAGE_UNAVAILABLE`. `SC-008`'s
measured set is called **presentations**, not states, in the Verification Notes
and the Design conformance note, and the tasks that cite it use the same term.

- **`C1` — one dependency, both directions, recorded in one acceptance.** The
  gate row, Complexity Tracking row 21, and the register's `EX-013` row now name
  US3's `UploadDuplicate.vue` (T066), the three US1 tasks that consume it (T052,
  T034, T035), and the execution order (T066 before T052). The choice and its
  rejected alternatives are recorded in the row's Why-needed and
  Simpler-alternative columns, so a reviewer reads why no task moved.
- **`C2` — the acceptance is test coverage, not implementation only.**
  `EX-013`'s rationale and row 21's Why-needed column state that the four
  stories' increment is their tests and fixtures (and US3's one component) and
  that no test and no criterion is waived; `T111` verifies that statement.
- **`I6` — the scan budget is a plan value.** `contracts/intake-api.md` §2.3 no
  longer calls 90 seconds a mandated row's sibling; it cites the plan's
  `Technical Context` and `research.md` R-16, the sources that record it.
- **The retryable set is corrected in the contracts.** `intake-api.md` §3.1's
  `UPLOAD_INCOMPLETE` row is `retryable: no`; §3.3 states R1's one property and
  names the three server codes plus the page's transfer failure;
  `ui-contracts.md` §4.5 adds the transfer-failure row (no code) and gives
  `UPLOAD_INCOMPLETE` the choose-another-file message; §4.6 states that only the
  attempt-bound refusal carries a wait. `tasks.md` T019, T049, and T057 carry the
  same three-code set, and the quickstart's `UPLOAD_INCOMPLETE` row no longer
  promises a retry.
- **`SC-008`'s term is presentations.** The Verification Notes and the Design
  conformance note now count eleven presentations and 44 accessibility
  presentations; the UI contract's §3 heading, table, and note use the same term,
  and the multi-file notice is a presentation of the choosing state and not a
  state. `T034` and `T099` use the same term. No baseline count changes:
  11 × 2 × 2 remains 44.

**No gate row changes status in this pass**: Gate 1 → VIII stays **PASS**, with
its evidence widened and its acceptance unchanged in kind; Gate 1 → IX, Gate 2 →
Documentation, and every other row keep their status. No Complexity Tracking row
is added and none is renumbered: the table still ends at row 26, and row 21's
identifier and review date are unchanged.

### Twenty-first pass (2026-11-15, the refusal table's last transport source and the state diagram's pictographic arrow)

This pass answers a contract-alignment finding against `contracts/intake-api.md`.
It changes that contract in two places and records both here: §3.1's Source cell
for `UPLOAD_INVALID_REQUEST` and §6.3's diagram glyph. **The specification was
amended earlier the same day by `Clarifications 2026-11-15 (8)`** — FR-064 took
its closed set's boundary into itself and referred the four answers the intake
reuses from R1 to this contract — so the Source cell corrected here is that
amendment's counterpart, and this pass changes the specification not at all. The
research, the data model, the other two contracts, the quickstart, the tasks, and
the checklists are untouched; no functional requirement, acceptance criterion, or
success criterion moves; no identifier is created; no Constitution Mandated
Values row and no Complexity Tracking row is renumbered (the table still ends at
row 26); no task identifier and no task path moves, so the task list keeps its
110 tasks and its 59 `[P]` markers.

- **The Source cell names requirements, because FR-064 requires it.** FR-064
  closes the seventeen only when every cause is "fixed by a requirement this
  specification states", and `transport` is not a requirement. It was the residue
  of the transport-table reference the 2026-11-15 clarification withdrew from
  FR-064 itself — the withdrawal `checklists/requirements.md` records as `U3` —
  and it survived in this table after the requirement it came from was corrected.
  The cell now reads `FR-026, FR-049`: FR-026 fixes the invalid request — a
  request that does not describe a start or a completion, that misses a field or
  carries one of the wrong kind, or whose completion is not a usable list of
  transferred parts, refused before any byte is retained, with nothing retained,
  no catalog created, and no quota consumed — and FR-049's error state shows it,
  states its cause, leaves nothing partial, and offers the way to choose a file
  again and no retry of the same file. The row's status, retryable value, and
  meaning are unchanged, no cause and no code is added, and the section's two
  counts stand: `intakeErrorCodes` at **17**, `refusalCodes` at **43** (26 + 17).
- **The diagram loses its only pictographic code point.** U+25B6 is an
  `Extended_Pictographic` code point — the class T108's copy scan refuses — so a
  text a scanned source is written from must not carry it. The five occurrences
  stood in §6.3 (two on line 517 and one on each of lines 519, 520, and 521); all
  five are U+2192 `→` now, the arrow the same file's prose already uses
  (lines 137–139 and 530). The diagram's remaining glyphs — U+2500, U+2502,
  U+251C, and U+2514 — are box-drawing, not `Extended_Pictographic`, so the
  diagram keeps its shape and the file carries no U+25B6.

**No gate row changes status in this pass**: Gate 1 → VII stays **PASS**, because
this pass leaves the specification as the same day's clarification left it and the
scan's result is unchanged, and every other row keeps its status. No
Complexity Tracking row is added: the change corrects a citation and a glyph, so
it accepts no deviation, and no Constitution Mandated Values row is touched —
neither a value nor a number moves.

### Twenty-second pass (2026-11-15, the specification's own set boundary and the gate row it frees)

This pass answers the analysis's `F1` finding: the 2026-11-15 clarification that
gave FR-064 its set boundary left two sentences here describing a permitted item
the requirement no longer carries. It changes `plan.md` alone — the specification,
the research, the data model, the contracts, the quickstart, the tasks, and the
checklists are untouched; no functional requirement, acceptance criterion, or
success criterion moves; no identifier is created; no Constitution Mandated
Values row and no Complexity Tracking row is renumbered (the table still ends at
row 26); and the task list keeps its 110 tasks and its 59 `[P]` markers.

- **Gate 1 → VII permits one item, and its evidence matches the specification.**
  The row read "Two items, and only these two, are permitted" and named FR-064's
  reference to the interface contract's refusal-code and refusal-message tables as
  the second. FR-064 no longer carries that reference: `Clarifications 2026-11-15
  (8)` gives the requirement its own boundary — the seventeen causes it decides
  for a file and for an upload request — and refers only the four answers the
  intake reuses from R1 to the contract, by role and without a section number. The
  row now names the two governance paths as its one permit, records that FR-064
  stopped being a permitted item and why, and keeps its claim: `spec.md` carries no
  `Wf` identifier, no `UPLOAD_*` code, no source path, no task identifier, no
  tracking row, and no library, framework, database, or pattern name. **The scan's
  result is unchanged: each of the seven forms returns zero matches** —
  `Wf[A-Z]\w*`, `UPLOAD_[A-Z_]+`, the path vocabulary, `T\d{3}`,
  `Constitution Mandated Values row \d+`, `CMV row \d+`, and
  `Complexity Tracking row` — and the specification itself carries no `§` and no
  `API`, so the row has nothing left to permit beyond the two governance paths.
- **The Tenth pass records the correction instead of the stale claim.** Its bullet
  on the row's forms said the row permits two items, and its bullet on FR-064
  described the requirement as referring the set to §3's codes and §4.5's
  messages. Both now state what the row said at that pass and mark the reading
  superseded on 2026-11-15, so the history keeps its facts and a reader is not
  sent to a table FR-064 no longer names.
- **The Twenty-first pass records the amendment it answers.** Its opening said the
  specification was untouched; it now records that `Clarifications 2026-11-15 (8)`
  amended FR-064 earlier the same day, that the Source cell it corrects is that
  amendment's counterpart, and that the pass itself changes the specification not
  at all. Its closing row note carries the same reading: Gate 1 → VII stays PASS
  on a specification the pass leaves as the clarification left it.

**No gate row changes status in this pass**: Gate 1 → VII stays **PASS**, now on
evidence that matches the specification — one permit, the seven forms at zero, and
FR-064's own boundary — and every other row keeps its status. No Complexity
Tracking row is added: the correction accepts no deviation, so there is nothing to
track and nothing to review.

### Twenty-third pass (2026-11-15, the query-count claim, the refusal set's count, and the hash index's scope)

This pass answers three findings. It changes `plan.md`, `research.md`,
`data-model.md`, and `tasks.md` (T005's failure condition and the note that
records it): the specification, the contracts, the quickstart, and the checklists
are untouched; no functional requirement, acceptance criterion, or success
criterion moves; no Constitution Mandated Values row and no Complexity Tracking
row is renumbered (the table still ends at row 26); and the task list keeps its
110 tasks (`T001`–`T112`, `T068` retired and `T015` merged) and its 59 `[P]`
markers.

- **G2 — the query-count claim is narrowed to what the tasks do, and no
  statement-counting task is added.** The Verification Notes claimed that the
  integration suite asserts the statement count of a quota read and of a complete
  request. No task does: the integration and quota suites assert outcomes, and the
  one instrument that measures a statement is the load run's `pg_stat_statements`
  reading. The claim now states the statement set as the design's bound
  (`data-model.md` §7), names the load run as the measurement, and says plainly
  that no test asserts a count. **The decision is one, not two**: a task that
  counted statements was rejected because it would add a test hook around the
  ORM's internal statement count for a number no requirement owns, duplicate the
  budget the load run already measures, and move the task list's count and every
  count that reads it. The alternative — keeping the claim and adding the task —
  is the one the finding also allowed; this pass takes the narrower one. **The
  task edit is the same finding's other half**: `T005` now carries the Budget
  check's failure condition — the script exits non-zero on a measured query above
  100 ms p95 or a percentile above its CMV row — so the instrument the narrowed
  claim names is implemented by a task instead of by plan prose alone. That is
  not a second answer: it adds no statement count and no task identifier.
- **A3 — the refusal set's count matches the contract's list.** The sentence
  decomposed the seventeen codes as "the twelve document causes, the two limits,
  the storage failure, and two protocol answers", which counted the attempt bound
  as a document cause and counted three limits as two. It now names the seventeen
  `UPLOAD_*` codes `contracts/intake-api.md` §3.1 lists and the four R1 rows an
  intake route reuses, with no decomposition invented here. `research.md` R-11's
  count sentence is corrected in the same change, because it carried the same
  decomposition. No code, table row, or identifier is renumbered.
- **D1 — the hash index's scope is stated as platform-wide.** `data-model.md` §2
  now says `catalogs_content_hash_retained_uq` is one platform-wide unique index
  — FR-042's comparison is platform-wide and FR-045 admits at most one non-deleted
  catalog per hash — and replaces the overbroad sentence "No index leads with a
  non-scoping column" with the domain model's actual rule: the two
  merchant-scoped indexes lead with `user_id`, while the hash index leads with
  `content_hash` because it serves no merchant-scoped query. A per-merchant index
  is recorded as rejected, because it would let two merchants hold the same file.
  The scope enters the plan's Summary and Gate 2 → Schema and Migration Control,
  and the two-merchant race is stated beside the index: the loser receives
  `23505` and reads the committed winner through the one registered
  cross-merchant projection (ADR-170).
- **D2 — soft delete's effect on every constraint and index is stated.** A new
  table in `data-model.md` §2 answers, for each object, whether a soft-deleted row
  is inside or outside it: the hash index excludes it and releases the hash
  (FR-046), the storage key's unique constraint includes it and keeps the key
  reserved until R15 removes the row with its object (FR-046, ADR-131), the My
  Files index includes it and every read carries the predicate, the active count's
  partial index excludes it because its predicate is the count's own (FR-012), and
  the primary key, the checks, and the foreign keys are unchanged. §6 states that
  a soft-deleted catalog cannot be the row a new insert conflicts with, and §11's
  invariant row carries the platform-wide scope. **Nothing deviates from
  `docs/domain-model.md`**: its index rule is stated for an index that serves a
  merchant-scoped query, and its hash rule is already platform-wide; the data
  model now reads both rules together instead of overstating the first, so no
  Complexity Tracking row is added and no decision record is needed for a
  correction that changes no decision.

**No gate row changes status in this pass.** Gate 2 → Performance Budgets and
Verification keeps **PASS** and now names the load run as its N+1 measurement;
Gate 2 → Schema and Migration Control keeps **PASS** and now states the index's
scope; every other row keeps its status. No row is added, and the Complexity
Tracking table still ends at row 26.

### Twenty-fourth pass (2026-11-16, Principle VIII's pinned exception)

This pass answers the analysis's `C1` finding: the stories, the Principle VIII
gate, and the phases each carried their own reading of the same deviation, and
none stated the owner's decision. The repository owner's decision is to **pin
`EX-013` as an explicit governance exception** rather than re-cut US2, US4, and
US5 into independently implementable stories, and this pass makes the three
places say that one thing:

- **The stories state the exception, not a claim of independence.** `spec.md`'s
  User Scenarios & Testing preamble records the decision and what the exception
  does and does not waive, and each of US2, US3, US4, and US5 carries the note
  that names its own closing criteria — AC-015 – AC-020, AC-021 – AC-026,
  AC-027 – AC-034 and AC-047 – AC-050, and AC-035 – AC-046. **The Twenty-ninth
  pass corrects US4's share, as the specification's Acceptance Criteria section
  gives that story two segments.**
- **The gate reads PASS on the pinned exception.** Gate 1 → VIII's status cell,
  its dependency sentence, and its acceptance paragraph now name the pinned
  exception, the two edges it covers, and the fact that it waives nothing but
  one clause; Complexity Tracking row 21 carries the same decision and date.
- **The phases say it once.** `tasks.md`'s Organization preamble, the Phase 3,
  4, 5, 6, and 7 checkpoints, the Phase Dependencies bullet, the User Story
  Dependencies paragraph, and the note that records the reading now name
  `EX-013` as the pinned exception.
- **The register row is pinned.** `EX-013`'s scope cell adds the pinning sentence
  and the one clause the row waives, so the row reads as a boundary a reviewer
  can check rather than a class of behaviour a later slice is trusted to honour.

No functional requirement, acceptance criterion, or success criterion is added,
removed, or renumbered; no task identifier moves; no `[P]` marker changes; no
Complexity Tracking row is added or renumbered (the table still ends at row 26);
the register still carries thirteen rows; and `governance-drift-check.mjs` stays
clean.

**No decision record is added.** This is a governance record — the stories'
statement, the gate, the phases, and the register — and ADR-090 places such a
record outside the ADR field, as the Twelfth pass recorded.

**Gate 1 → VIII stays PASS**, now on the pinned exception rather than on the
register row's existence alone; **the Twenty-fifth pass records the owner's final
acceptance of 2026-11-16 and the rejected restructuring**.

### Twenty-fifth pass (2026-11-16, Principle VIII's final acceptance and the rejected restructuring)

This pass records the repository owner's final decision on the one deviation this
plan carries. **`EX-013` is the final governance exception, approved on
2026-11-16**, and Gate 1 → VIII reads **PASS on that basis**: the acceptance is
final, not a provisional pin awaiting a later review of the story model. The
owner **rejected** the alternative of restructuring US2, US4, and US5 into
independently implementable stories, because that restructuring would **separate
the safety engine from US1 and make US1 unsafe**: the content check, the scan,
the decoded-size cap, the sanitizer, and the refusals that keep an unsafe file
out are the engine US1's page composes, and a page that kept a file the safety
pipeline had not passed would be unsafe to ship. The safety proof and the page
stay one increment — US1 and US2 are the P1 pair — and the four later stories'
dependency is the exception the owner approves, not a defect the plan defers.

- **The gate states the basis.** Gate 1 → VIII's status cell, its acceptance
  paragraph, and the gate's opening paragraph name the owner's final acceptance
  of 2026-11-16, the approved exception `EX-013`, and the rejected
  restructuring, with the reason: the safety engine cannot be separated from US1
  without making US1 unsafe.
- **Complexity Tracking row 21 carries the same decision.** Its title, its
  Why-needed column, its Rejected-alternative column, and the note beneath the
  table record the final acceptance of 2026-11-16 and the rejected
  restructuring. The review date 2026-12-11 stays the register's escalation
  trigger, never a condition of the acceptance.
- **The register row already carries the same decision.** `EX-013`'s
  2026-11-16 pinning sentence records the same decision, beside the exact
  scope, the repository owner as approver, and the 2026-12-11 review date; this
  pass opens no row, writes no register file, and leaves `T111` the verifier.
- **No FR, AC, or SC moves.** The specification keeps its 65 functional
  requirements, 51 acceptance criteria, and 13 success criteria; the task list
  keeps its 110 tasks (`T001`–`T112`, `T068` retired and `T015` merged) and its
  59 `[P]` markers; no Complexity Tracking row is added or renumbered (the table
  still ends at row 26); and the register still carries thirteen rows.

**No decision record is added.** This is a governance record — the gate, the
tracking row, and the review of the exception — and ADR-090 places such a record
outside the ADR field, as the Twelfth and Twenty-fourth passes recorded.

### Twenty-sixth pass (2026-11-16, the users service port and T075's read boundary)

This pass answers the analysis's `A1` finding: `T075` read the `users` table
inside the `catalogs` module — the quota read's third statement selected the
account's two overrides directly — so `catalogs` read a table its module does
not own, against the module map's rule that a module outside the owner reads the
owner's service and never its table or its repository. The fix is one `users`
service port, consumed by `T075`, and it changes no requirement.

- **The port.** `apps/api/src/modules/users/service/account-context.ts` is the
  `users` module's service port: one read, through the `users` repository (its
  own module's), returns the account's status and its two upload-quota
  overrides — the monthly and active values, `null` meaning the constitutional
  default — and no other profile field. `catalogs` imports the port; no file
  outside `users` imports `modules/users/repository/`.
- **The Ownership Map and the tree carry the file.** The map records
  `apps/api/src/modules/users/service/account-context.ts` as
  `001-identity-foundation`'s path — R1 owns the `users` module and R2 adds the
  port — written by this feature and not exclusive to it, and the Project
  Structure tree names the same path.
- **`T113` writes it, and `T075` consumes it.** The task is appended after
  `T112` and placed in Phase 2 immediately before `T075`, so its identifier is
  out of numeric order for the same reason `T066`'s is; `T075` now reads the
  account status and the two overrides through the port and carries no
  statement against the `users` table. The task list carries **111** tasks
  (`T001`–`T113`, `T068` retired and `T015` merged) and its 59 `[P]` markers;
  the Twenty-fifth pass's 110 is the count before `T113`.
- **The gate and the N+1 note name the boundary.** Gate 1 → X's evidence names
  the port and the repository it replaces, and the Verification Notes' N+1
  inspection says the quota read's third statement is the port's read, so the
  statement set stays three and its owner is the `users` module.
- **No FR, AC, or SC moves.** The specification keeps its 65 functional
  requirements, 51 acceptance criteria, and 13 success criteria; `T113`'s tail
  cites FR-010, FR-011, FR-012, and FR-013 and AC-027, AC-028, and AC-029, the
  requirements the port's values serve, and the Requirement Coverage appendix
  adds `T113` to those rows; no requirement, criterion, or
  `FR-###`/`AC-###`/`SC-###` identifier is added, removed, or renumbered — the
  only new identifier is the task `T113` — and no Complexity Tracking row is
  added or renumbered (the table still ends at row 26).

**No decision record is added.** The module boundary is `docs/architecture.md`'s
existing rule, and the port is the implementation that satisfies it; the pass
accepts no deviation and decides no new rule.

**Corrected in the Forty-third pass (2026-11-17):** this pass's port was consumed
by a direct import of the `users` service file, and that import is the
cross-module import Principle X and `docs/architecture.md` §2 forbid. The port's
contract now lives in `packages/shared/src/contracts/account-context.ts` and the
container injects it, so the boundary this pass states holds; the implementation,
the file, and the two task identifiers stay as recorded here.

### Twenty-seventh pass (2026-11-16, the copy pass, the specification's last two leaks, and the baseline set's term)

This pass carries the copy repair the clarify session of 2026-11-16 opened: every
copy this plan and the UI contract restate is written without a combining mark,
the specification's last two identifier leaks are closed, and the baseline set's
counting term agrees with the presentation vocabulary the contract's §3 already
uses. It adds no requirement, criterion, task, Complexity Tracking row, mandated
value, or decision record, and no count the earlier passes state moves.

- **The contract's copy carries no combining mark.** The thirty-eight lines of
  `contracts/ui-contracts.md` that carried one — §3's eleven presentations,
  §4.1–§4.7, and the `WfUploadProgress` row in §5.1 — were rewritten, fifty-nine
  marks in all, so that every string now stands in its mark-free form: «تعذر»
  in the refusal headings and messages, «المخزنة» in the quota caption, «مورد»
  in the subtitle, «يتم حفظ» / «تم حفظ» / «لم يتم حفظ» for the passive forms
  the outcomes and the safety messages state, «تم رفع» for the duplicate's
  date, «يتم تحرير» for the active limit's release, and «تلقائيا», «مسبقا»,
  «ملفا», «يوما», and «ثوان» where a tanween stood. Three labels take the verb
  form their grammar requires rather than a bare mark removal: «يجري فحص
  الملف» and «يجري قراءة الحصة…» for the progress and quota states, and «تجري
  المعالجة» for the mirror's `processing` wording row 24 quotes, where the
  subject «المعالجة» carries the feminine verb. No string's meaning changes.
- **The plan's own copies follow.** The six lines that carried a mark in this
  plan now read: the wait's display, 3–10 «N ثوان»; the screening phase, «يجري
  فحص الملف»; the INC-01 bullet's verbatim quote and FR-005's subtitle sentence,
  both «تلقائيا»; row 24's status wording, «تجري المعالجة»; and row 25's
  duplicate quote, «تم رفعه بتاريخ كذا». Each string is the one the contract
  and the specification now carry, and no requirement is quoted differently
  from the text that fixes it.
- **The baseline set counts presentations.** The contract's §8 multiplication
  line reads *Eleven presentations* × two widths (1280 and 375 CSS px) × two
  appearances (light and dark) = **44 visual baselines**, and its table's first
  column reads *Presentation*. The eleven, the two widths, the two appearances,
  and the 44 baselines are unchanged: the multiplication yields the same set,
  and the term is the one §3's heading and the Twentieth pass already use.
- **D1 is closed in the specification.** In `spec.md`, the letter-case answer in
  the Clarifications names the comparison the format contract establishes
  rather than the task that once implemented it, and the Assumptions'
  route-map sentence names the shared route map rather than the file that holds
  it. With those two gone, **Gate 1 → VII's seven-form scan returns zero
  matches on `spec.md` for all seven forms** — the layer's identifier form, the
  refusal-code form, the path vocabulary, the task-identifier form, and the
  three bookkeeping forms — the result the clarify repair leaves and the gate
  row already states. The removed identifiers are recorded nowhere in `spec.md`.
- **The drift check stays clean.** `node governance-drift-check.mjs` exits 0 and
  reports no drift after the repair: its identifier-integrity check still
  reports this specification sound at 65 FR, 51 AC, and 13 SC, its register,
  index, and manifest checks are unmoved, and no hash changes.

**No gate row changes status in this pass.** Every gate row keeps the status the
Twenty-sixth pass left it with, and the repair alters no requirement, criterion,
task, or count. **No decision record is added**: the repair restores the copy
each requirement already fixes and removes two bookkeeping references, so it
decides no new rule and amends no existing one.

### Twenty-eighth pass (2026-11-16, the five analysis fixes: FR-061's counting set, AC-028's R13 clause, EX-007's references, T052's format-and-size line, and T043's three statements)

This pass carries the five repairs the analysis's D1, G1, T1, I1, and A1 findings
name, each made in place without regenerating a file: the attempt bound's counting
is stated once, AC-028's second clause is recorded as a window R13 owns, and three
references are corrected.

- **FR-061 is the single statement of the attempt bound's counting set.** In
  `spec.md`, AC-050's clause that restated the set now says the counting set is
  FR-061's and is not restated in the criterion; the Test Coverage Request's
  parenthetical and `tasks.md`'s T069 likewise read "the attempt bound's counting
  set as FR-061 fixes it". The requirement itself is untouched, no identifier is
  removed, and no numbering moves, so the criterion, the coverage statement, and
  the test task cite one authority instead of carrying three copies.
- **AC-028's second clause is Complexity Tracking row 27.** The clause that states
  the 500-per-month and 1,500-active cap an override may not exceed is R13's to
  assert: R13 ships the write that stores an override, while R2 adds no
  administrator operation and only reads the effective limits, so no R2 task can
  observe the refusal. The row records the owner, the review date, and both
  rejected alternatives; the criterion keeps the clause. **The gate row for
  Usage Limits and Quota Semantics reads PASS with that window — R13's to own,
  reviewed at R13's acceptance — and the Complexity Tracking summary below the
  table describes row 27 in the same terms.**
- **The three references are repaired.** In the exception register's `EX-007` row,
  `AC-052` and `AC-053` now carry the `001-identity-foundation` prefix beside
  `AC-051`; in `tasks.md`, T052 places the format-and-size line under the upload
  action as FR-005 fixes it, above the selected-file card, and T043 reads T075's
  two statements plus T113's one account read — the three statements the plan's
  N+1 note counts — scoped to the caller.
- **No artifact grows.** The pass adds no requirement, criterion, task, mandated
  value, or decision record, removes no identifier, and renumbers nothing; the
  only new identifier is Complexity Tracking row 27, and `node
  governance-drift-check.mjs` exits 0 and reports no drift after the five
  repairs. The Complexity Tracking table now ends at row 27.

### Twenty-ninth pass (2026-11-16, the exception's closing criteria and its seventh test path)

This pass carries two corrections to the plan's own record of `EX-013`, both found
by comparing Complexity Tracking row 21 against the register's row and against the
specification's story notes. It changes `plan.md` alone: the specification, the
task list, the contracts, the research, the data model, and the quickstart are
untouched; no functional requirement, acceptance criterion, or success criterion is
added, removed, or renumbered; no task identifier moves; and no Complexity
Tracking row other than row 21 is touched, added, or renumbered — the table still
ends at row 27.

- **The closing criteria name US4's whole set.** The register's scope cell opens
  with a **Closes on:** clause, and US4's share of it read "AC-027 – AC-034"
  only, while the specification gives US4 two segments — the quota segment
  (AC-027 – AC-034) and the limit boundary and the attempt bound (AC-047 –
  AC-050) — so four criteria that close the exception were missing from the
  clause. Row 21 now carries the clause in the register's shape, and US4's share
  reads **AC-027 – AC-034 and AC-047 – AC-050**. The Twenty-fourth pass's list of
  the per-story notes carries the same correction, and the Twelfth pass's
  statement of the clause as it was opened is annotated rather than rewritten, in
  the same way that pass annotates the Twentieth pass's widening.
- **The scope names the seventh test path.** The scope lists the test paths the
  four stories' tasks write, and it named six; **T035** writes the 44 visual
  baselines in `apps/web/tests/e2e/__screenshots__/upload/`, and T035 is one of
  the three US1 tasks the row already names (T052, T034, and T035). The path is
  already in this plan's Project Structure tree and in its Ownership Map, and the
  Sixth pass's claim that "the scope now names every test path their tasks
  write" was therefore incomplete. Row 21's exact scope names the path beside
  `apps/web/tests/e2e/upload.spec.ts`, so the scope names every path a task
  inside it writes.
- **The register row is the owner's to amend.** The register is the one
  governance record a slice appends to rather than owning, and its `EX-013` row
  still reads "AC-027 – AC-034" for US4 and counts "those six paths" in the
  scope's last sentence; the repository owner amends it by hand in the same
  change, and that count moves from six paths to seven with it. This pass
  changes no register file. The specification's own US4 note — which names
  "AC-027 – AC-034 as the criteria that close it" — is the specification's text
  and is likewise outside this pass; it is recorded here so the residual is
  visible rather than silent. **The owner's amendment of 2026-11-16 closes both
  residuals**: the register's row now carries US4's full share — "AC-027 – AC-034
  and AC-047 – AC-050" — and the seventh test path, so its scope counts seven
  paths; and the specification's four story notes now read the closing criteria
  from that row as the one source, and the US4 note names the full share.
- **No gate row changes status.** Gate 1 → VIII stays **PASS** on the owner's
  final acceptance of 2026-11-16; the exception's principle, its two edges, its
  approver, its approval date, and its 2026-12-11 review date are unchanged, and
  only the clause's completeness and the scope's path list are repaired. **No
  decision record is added**: this is a governance record — the plan's own
  statement of a register row — and ADR-090 places such a record outside the ADR
  field, as the Twelfth, Twenty-fourth, and Twenty-fifth passes recorded.

### Thirtieth pass (2026-11-16, the analysis command's scope in this project)

This pass records one decision the slice's analysis rested on without a reference of
its own: the analysis command's scope in this project is wider than the inherited
command's, and the numbers its report states are computed rather than estimated. It
changes `plan.md` and the decision register: the specification, the task list, the
contracts, the research, the data model, and the quickstart are untouched; no
functional requirement, acceptance criterion, or success criterion is added, removed, or
renumbered; no task identifier moves; and no Complexity Tracking row other than row 28
is touched, added, or renumbered — the table now ends at row 28.

- **The scope is the inherited scope plus the governance artifacts.** `/speckit.analyze`
  reads `spec.md`, `plan.md`, and `tasks.md`; in this project it also reads
  `.specify/templates/exception-register.md` and `governance-drift-check.mjs`, because
  the slice's cross-story dependency is granted by a register row (`EX-013`) and the
  drift check is what decides the artifact counts, the identifier soundness, and the
  `EX-###` references the analysis reads.
- **The report's numbers are computed, not estimated.** Every count the analysis states
  is the drift check's own output, reproducible by running `node
  governance-drift-check.mjs`; a number the check does not print is recorded as an open
  question rather than as a finding.
- **The command is not modified and not forked.** The upstream command is inherited
  unchanged, and what this project adds is the decision register's record and the row
  that carries it.
- **One reference now explains the extension.** The decision, its owner, and its review
  date are recorded in ADR-177, and Complexity Tracking row 28 carries the same decision
  in this plan; before this pass no single reference explained the extension.

**The record is a governance record.** Its subject is the process and the governance
tooling rather than a product or engineering choice, so the Documentation rule's
`Alternatives considered` field does not reach it (ADR-090); the record carries the
decision, its owner, and its review date, and no section is written for it after the
fact.

**No gate row changes status.** Gate 1 → VIII stays **PASS** on the owner's final
acceptance of 2026-11-16, and every other gate keeps the status it carried; the record
changes no principle, no section, no entity, no page, no product feature, and no
constitution text, so the constitution stays at 7.1.0.

### Thirty-first pass (2026-11-16, the load run's two runs named apart)

This pass amends one sentence of the Verification Notes' budget check and records the
decision behind it: the load script runs two different runs — the 3,600-upload load run
with its design and stress phases, and the 600-upload quota-boundary run — and the
earlier draft gave one label to both, so a reader could not tell which run SC-005
measures. It changes `plan.md` alone: the specification, the task list, the contracts,
the research, the data model, and the quickstart are untouched; no functional
requirement, acceptance criterion, or success criterion is added, removed, or renumbered;
no task identifier moves and no task's `(implements ...)` tail changes; no gate row's
outcome changes and no principle's verdict changes; the exception register's `EX-013` and
`EX-007` rows are untouched; and the Ownership Map's existing rows are untouched.
Complexity Tracking row 29 is the only row added, and no row other than row 29 is
touched, added, or renumbered — the table now ends at row 29.

- **The budget check names the two runs.** The run's second phase repeats at 600 / 20 /
  20 for 120 seconds and is the capacity model's stress case: 600 concurrent transfers,
  20 pre-sign requests per second, and 20 completed intakes per second. The
  quota-boundary run is a SEPARATE run of the same script, with its own sample and its
  own report: 600 uploads across 10 merchants, each merchant running 60 uploads in one
  fixed 15-minute window. It is not a phase of the 3,600-load run, and SC-005's sample
  is that run's 600 uploads while SC-006's and SC-007's samples are the design and
  stress phases' 3,600 page loads and 3,600 uploads only.
- **The decision is carried by one row.** Complexity Tracking row 29 records it with its
  owner, the repository owner, and its review date, 2026-12-11, and the reason the two
  runs are named apart: the earlier draft gave one label to two runs, and a criterion
  whose sample cannot be identified cannot be measured.
- **The Ownership Map gains one row and loses none.** `specs/002-file-intake/contracts/`
  is added after the copy-scan row, with the API contract, the formats contract, and the
  UI contract this slice owns; every row the map carried before this pass stands.
- **No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added,
  removed, or renumbered, no task identifier moves, no task is added or removed, and no
  task's `(implements ...)` tail changes.

**The other two artifacts still carry the earlier label.** This pass names the two runs
apart in the plan only. The specification's `SC-005` still reads its run in parentheses
as "the capacity model's stress case", and the task list's `T005`, `T091`, and `T096`
still carry the earlier naming, so the matching correction in those two artifacts is a
separate change, to be made where those artifacts are owned; this pass touches neither.
The sentence above the amended one in the same budget check still calls the
quota-boundary run "the limit-boundary phase", and it stands as the earlier draft left
it; this pass replaces only the sentence it names.

**The correction this pass deferred has landed (2026-11-16).** The paragraph above
records the state the Thirty-first pass left; it stands as written, and this note records
what has changed since. The specification's `SC-005` and the task list's `T091` now carry
the two runs' names, and `T005` and `T096` had already named them — `T005` calls the
quota-boundary pattern a separate run of the script with its own sample and its own
report, not a phase of the 3,600-load run, and `T096` measures `SC-005` at that run — so
Complexity Tracking row 29's claim, that the specification, the plan, and the tasks name
the two runs separately, is correct. The sentence the Thirty-first pass left in the
budget check, which still called the quota-boundary run "the limit-boundary phase", is
removed, and its expectation — one acceptance and 59 limit refusals per merchant, the
counts by cause recorded against `SC-005` — is stated in the quota-boundary paragraph
beside that run's own sample. The research and the quickstart carry the same name and the
same separation.

### Thirty-second pass (2026-11-16, the tasks template's two binding rules promoted)

This pass records one governance decision and the amendment it carries: the two NORMATIVE
binding rules this slice's rendered task list carries — one owner per file, and
success-criterion attribution — have no source under `.specify/`, because the template that
renders a task list carries rules 1 to 4 only, and `/speckit.tasks` regenerates `tasks.md`
from that template. The decision promotes both rules into
`.specify/templates/overrides/tasks-template.md` and amends the template's `[P]` item to
name the three exceptions this slice's own "Dependencies & Execution Order" records, so the
rules and their exceptions are stated where the artifact is produced. It changes
`.specify/templates/overrides/tasks-template.md`, the decision register, and this plan: the
specification, the task list, the contracts, the research, the data model, and the
quickstart are untouched; no functional requirement, acceptance criterion, or success
criterion is added, removed, or renumbered; no task identifier moves and no task's
`(implements ...)` tail changes; no gate row's outcome changes and no principle's verdict
changes; the exception register is untouched; and the Ownership Map's rows are untouched.
Complexity Tracking row 30 is the only row added, and no row other than row 30 is touched,
added, or renumbered — the table now ends at row 30.

- **The two rules move into the template.** Rule 5 (one owner per file) and rule 6
  (success-criterion attribution) are added to the template's "Format (REQUIRED)" comment in
  the words the rendered document uses, with the rendered document's own scope: NORMATIVE FOR
  THIS DOCUMENT, the two composition points Path Conventions names, the owner-first rule for
  a behaviour change, and the per-story test file.
- **The `[P]` item is amended.** The template's numbered list item 3 keeps its rule and adds
  the three recorded exceptions: T032, a phase's guard written after the rows it reads; T035,
  a baseline generation task; and T112, a measurement task.
- **The decision is recorded in the register.** ADR-179 carries the principle
  (Single-Reference Sufficiency, read with the Governance register's row that names the
  template layer), the exact scope, the rationale, the approver (the repository owner), and
  the review date 2026-12-11; its index row makes it the register's last row, and the live
  ADR range strings and `Project-Technologies.txt`'s header move with it.
- **The order is recorded here.** This slice's rendered task list carried the two rules
  before the template did; Complexity Tracking row 30 states that order and the date, so a
  reader of the template knows when each rule arrived and that it arrived from a rendered
  document.

**No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added, removed, or
renumbered, no task identifier moves, no task is added or removed, and no task's
`(implements ...)` tail changes.

### Thirty-third pass (2026-11-16, the two runs named apart in every artifact)

This pass carries the correction the Thirty-first pass deferred: the two runs the load
script drives are now named apart in the specification, the task list, the research, the
quickstart, and this plan's budget check, so no live text gives the quota-boundary run the
load run's label. It changes `research.md`, `quickstart.md`, and one sentence of this
plan's budget check, and it corrects the one sentence of `tasks.md`'s `T091` that still
carried the earlier label; `spec.md`'s `SC-005` had already been corrected. No functional
requirement, acceptance criterion, or success criterion is added, removed, or renumbered;
no task identifier is added, removed, or moved and no task's `(implements ...)` tail
changes; no gate row's outcome changes and no principle's verdict changes; the exception
register's `EX-013` and `EX-007` rows are untouched; and the Ownership Map's rows are
untouched. Complexity Tracking keeps its 30 rows: the table still ends at row 30, no row is
added, removed, or renumbered, and row 29 is the row that records this naming.

- **The budget check states the expectation with the run.** The sentence that gave the
  limit-boundary label to an expectation inside the budget check is removed, and the
  expectation it carried — one acceptance and 59 limit refusals per merchant, the counts
  by cause recorded against `SC-005` — is stated in the quota-boundary paragraph, beside
  that run's own sample and after the words that separate it from the load run.
- **The research and the quickstart read the same way.** `research.md`'s R-15 names the
  quota-boundary run as a separate run of the same script, not a phase of the load run,
  and keeps its expectation and its counts by cause against `SC-005`; `quickstart.md`'s
  checklist item reads the quota-boundary report as its own report, so a reader of either
  artifact meets two runs and not one label.
- **The record keeps the deferral and states its end.** The paragraph the Thirty-first
  pass left keeps its text, and the note beside it records what has changed since:
  `SC-005` and `T091` now carry the two runs' names, `T005` and `T096` had already named
  them, and row 29's claim is therefore correct rather than pending.

**No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added, removed, or
renumbered, no task identifier moves, no task is added or removed, and no task's
`(implements ...)` tail changes.

### Thirty-fourth pass (2026-11-16, the seven corrections after Clarifications 2026-11-16 (5))

This pass applies the specification's last clarification session to the design
artifacts and closes the seven defects a review of them found. It changes
`plan.md`, `contracts/intake-api.md`, `contracts/intake-formats.md`,
`data-model.md`, and the task descriptions the corrected contracts are
implemented and proved by (T026, T027, T028, T039, T041, T053, T054, T056,
T058). The specification, the research, the quickstart, the checklists, the
constitution, and the decision register are untouched: no `FR-###`, `AC-###`,
or `SC-###` identifier is added, renumbered, or withdrawn, no Constitution
Mandated Values row moves, no Complexity Tracking row is renumbered, no gate row
changes its outcome, and no ADR is opened — every change either applies an
answer the specification already records or writes a plan value the plan owns.

- **The withdrawal's failure (FR-030, AC-015).** `intake-api.md` §2.3 now states
  the refusal and its withdrawal as one act, and a storage that refuses the
  removal as the one case where the safety refusal is not reported as decided:
  the merchant sees `UPLOAD_STORAGE_UNAVAILABLE` with its retry, the safety cause
  stays in the record, both keys stay on the `failed` row, and the sweep deletes
  them and confirms their absence before the row. The contradiction the old
  sentence carried — "the refusal is not reported as decided while a copy
  survives" against FR-030's "the removal happens as soon as the refusal is
  decided" — is gone; T039, T041, T054, and T056 carry the same exception, and
  threat map T10 states it.
- **The terminal sweep's keys (FR-030).** `data-model.md` §9's terminal row now
  deletes `original_key` and, for a `failed` or `aborted` row, `sanitized_key`,
  confirms each absence, and only then deletes the row, so a failed session's
  keys cannot outlive their row. A `done` row's `sanitized_key` is excluded
  because it is the accepted catalog's kept object or a duplicate's
  already-withdrawn object; `intake-api.md` §6.3 states the same.
- **The legacy macro form (FR-032).** `intake-formats.md` §4.2 now removes the
  Excel 4.0 macro sheet (XLM) inside the `Workbook`/`Book` stream — and T028
  says so — beside the `VBA` storage and the executable `ObjectPool` streams,
  because FR-032's "document macros" names no storage and admits no exception.
- **The external link (FR-032).** The clarification requires its removal, so
  `intake-formats.md` §4.1's removal table now carries
  `**/externalLinks/externalLink*.xml` with the relationships that name it, T028
  removes it, and the boundary table carries both the accepted and the refused
  case.
- **The record's cause (FR-062).** `intake-api.md` §5 fixes `cause` to the
  refusal code alone and §6.2 no longer uses the scanner's signature as the
  record's cause: the signature is neither shown nor retained, and the counts by
  cause read one vocabulary. T058 says so.
- **The stage budgets (FR-029, FR-033).** The plan records five values — the
  content probe 5 s, the cap's read of the original decode 5 s, the scan 90 s,
  the sanitizer 10 s, and
  the reopen 5 s — that sum to 115 s inside the page's 120-second timeout; the
  cap's second measurement, of the sanitized decode, is taken as the sanitizer
  writes the kept bytes and spends the sanitizer's budget, so the six steps keep
  five budgets and the 115-second sum holds; each
  overrun answers the cause that stage produces and adds no cause to FR-064's
  seventeen. `intake-api.md` §2.3's "the sanitizer's work" is replaced by the
  five values, T026–T028 implement them, and T054 proves them.
- **The parsers' bounds (FR-027, FR-031).** `intake-formats.md` gains §3.5: no
  DTD and no entity resolution, 64-deep XML, 65,535 package and directory
  entries, a visited-set walk, 1,000,000 PDF objects and 64-deep nesting, 4 MiB
  per XML part, each bound crossed answering `UPLOAD_CORRUPT`; the same bounds
  run on the reopen, whose crossing is `UPLOAD_SANITIZATION_FAILED`; and one
  fail-closed case per bound is named, which T026's implementation and T053's
  suite carry.

**One task's tail changes, and no identifier moves.** T054's description gains
the four stage budgets beside the scan's and its `(implements ...)` tail gains
`FR-029`, the requirement whose budget rule it now measures; the requirement
coverage row for `FR-029` gains T054 in the same change. No task identifier is
added, removed, or renumbered, no task is added or removed, and no other task's
tail changes. Complexity Tracking still ends at row 30.

### Thirty-fifth pass (2026-11-17, the action-nesting bound's fail-closed case)

This pass closes one finding of the formats contract's review: §3.5's bound table
states a **64-deep** action nesting beside the page tree and the `/Next` chain,
while the fail-closed list below it names a case for the page tree, the `/Next`
chain, and every other bound but none for action nesting — so a bound the table
declares had no case that fails when its guard is removed, against the same
section's rule that the suite carries one case for each bound a fixture can
produce. It changes `contracts/intake-formats.md` §3.5 and §6 and this plan, and
nothing else.

- **The action-nesting case.** §3.5's fail-closed list now names a PDF whose
  action chain nests **65 action dictionaries**, the 65th reached through
  `/Next` from the document's `/OpenAction`, because `/Next` is the entry an
  action dictionary carries its successor in and the bound is the depth of that
  walk. The case asserts the refusal, the cause, and that no byte is retained,
  like every other case in the list; the action chain the sanitizer's launch
  removal already has to reach (§4.3) is the same chain, so the probe's refusal
  is also the proof that the sanitizer never meets an unbounded one.
- **The page tree's depth case.** The same list now names a PDF whose page tree
  nests 65 deep, beside the cyclic page tree it already named. The two fixtures
  exercise the two guards the bound table states separately — the depth counter
  and the visited set — and a cyclic fixture alone would still pass with the
  depth counter removed. It is the same defect's second instance, closed in the
  same place rather than left for a later pass to file.
- **No cause is added.** Both fixtures answer `UPLOAD_CORRUPT` on the probe and
  `UPLOAD_SANITIZATION_FAILED` on the reopen (§3.5's last bullet, §4.4), so
  FR-064's closed seventeen keeps its count, FR-028's message set is unchanged,
  and the page shows the message the corrupt refusal already carries. §6's
  boundary table gains both depths in the one row that already carried the
  cyclic page tree, so the table the suite is read against names the case the
  suite runs.
- **Nothing else moves in the contract.** No bound value changes and no bound is
  added: the 1,000,000 indirect objects, the 65,535-entry package and OLE2
  directory, the 4 MiB XML part, the 64-deep XML bound with its 65-element
  fixture, and the entity-resolution ban keep their cases word for word. The
  specification stays technology-agnostic and is untouched: it requires a file
  the check could not open to be refused with the corrupt cause (FR-027) and
  names no parser, no structure, and no depth.
- **The task list is the one artifact this pass does not edit.** T026's
  implementation clause and T053's case list are where the bound and its case
  are implemented and proved, and both sentences were written before this case
  existed; the operator carries their update in `/speckit.tasks`, and this plan
  records that rather than claiming the task text already names the action
  chain. Until that pass lands, `contracts/intake-formats.md` §3.5 is the
  authority the task text is read against, and no artifact claims the suite
  carries the case. *(Closed in the thirty-sixth pass: the task text now names
  the action chain.)*

**No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added,
renumbered, or withdrawn; no Constitution Mandated Values row moves; no
Complexity Tracking row is added or renumbered; no gate row changes its outcome;
and no constitution text, version, or decision record changes — the bound is a
plan value the plan owns and its case is the contract's, so no ADR is opened and
the governance drift check's structural counts are untouched.

### Thirty-sixth pass (2026-11-17, the formats and security checklists' four decisions)

This pass records the four answers of Clarifications 2026-11-17 (4), each closing
one finding of the formats and security checklists, and the artifacts they move:
the formats contract, the task list, and the specification. It adds no rule the
specification does not state, changes no bound value, and opens no decision
record, because each answer reads a requirement's existing words or fixes an
acceptance case over a rule already recorded.

- **The embedded-object set.** FR-032's "any embedded object or attached file
  that can execute" is read as every embedded object or attachment that can carry
  executable content — an OLE2 compound embedding, an ActiveX control, and an
  embedded package such as a workbook or an archive — so
  `contracts/intake-formats.md` §4.1 removes `**/embeddings/**` rather than the
  compound `.bin` files alone, §4.2 removes every `ObjectPool` stream rather than
  the compound ones, and §4.1's and §4.2's kept set is the media that cannot
  execute. T028 and T053 carry the same set. The reopen and the
  sanitization-failed cause are unchanged.
- **The kept file's size bound.** The sanitized object MUST satisfy the same
  100 MB bound the upload did: `contracts/intake-formats.md` §4 answers a larger
  output with `UPLOAD_SANITIZATION_FAILED`, §6 gains the row, and FR-032 and
  AC-017 state it. The 1 GiB cap stays measured on the sanitized decode (§5).
- **The two parser cases.** §3.5's fail-closed list gains an OLE2 file whose
  directory declares 65,536 entries and a PDF with 1,000,001 indirect objects,
  and §6's boundary table carries both; T026's bound list gains action nesting
  and T053's case list gains those two cases beside the two PDF depth cases the
  thirty-fifth pass added. The suite now names a case for every bound the table
  fixes.
- **The order at the acceptance level.** AC-006, AC-016, and AC-020 each gain one
  stacked-cause clause — the content check before the scan, the scan before the
  cap, and the cap before the sanitizer — so a removed ordering check fails an
  acceptance criterion as well as the contract's stacked integration test, which
  T054 now carries. AC-020's citation tail gains FR-029. No criterion is created,
  renumbered, reused, or withdrawn.

**No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added,
renumbered, or withdrawn; no Constitution Mandated Values row moves; no
Complexity Tracking row is added or renumbered; no gate row changes its outcome;
and no constitution text, version, or decision record changes — the four answers
are clarifications of rules the specification and the contract already carry, so
no ADR is opened and the governance drift check's structural counts are untouched.

### Thirty-seventh pass (2026-11-17, the two measurement conditions and the timeout's retry)

This pass records Clarifications 2026-11-17 (5)–(7), each closing one finding of
the performance checklist, and the artifacts they move: the specification, the
intake contract, and the task list. It adds no cause, no entity, and no bound
value.

- **The timeout's retry (CHK029).** FR-049 states the page's timeout as its own
  cause and fixes its consequence: the platform's settlement stands — one
  catalog, one monthly count, one active slot, the record in My Files — and the
  same-file retry answers as the duplicate against the catalog that request
  created, with no second catalog and no quota; a limit the settlement exhausted
  refuses the retry first (FR-013), a retry racing the settlement resolves by the
  same uniqueness (FR-045), and no cause joins FR-064's seventeen.
  `contracts/intake-api.md` §2.3 states the same for the route, AC-021 carries
  the clause, and T062 carries the case.
- **SC-007's client condition (CHK014, CHK013).** The criterion states the
  uplink it measures — 76 KB/s, the capacity model's design client at 2.28 MB in
  30 seconds — and the run paces each sampled upload's part writes at it. The
  arithmetic the criterion carries admits the sample: 13, 26, 39, and 53 seconds
  of transfer for the four size classes, the 4 MB class's four-fifths meeting the
  minute at the sample's 95%, and the service budgets bounding the platform's
  share. The browser is the plan's supported-browser statement's, and no device
  class is a condition because the transfer dominates the interval. T005's
  script carries the pacing and T101 measures the ratio over it.
- **SC-006's two markers (CHK009).** The interval opens at the navigation's
  start — the browser's request for the document, not the response and not the
  first paint — and every sampled load is a cold load in a fresh context with an
  empty cache, so no load reads a cache a previous load warmed. It closes at the
  first frame of the quota block's settled presentation — the counts, the
  exhausted content, or the read failure — and not the loading state. T100
  carries the mechanism.

**No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added,
renumbered, reused, or withdrawn; no Constitution Mandated Values row moves; no
Complexity Tracking row is added or renumbered; no gate row changes its outcome;
and no constitution text, version, or decision record changes — each answer reads
a requirement's existing words or fixes a measurement condition over a rule
already recorded, so no ADR is opened and the governance drift check's structural
counts are untouched.

### Thirty-eighth pass (2026-11-17, the transfer's stall bound)

This pass records Clarifications 2026-11-17 (8): a part write that neither
completes nor errors. It adds no cause — the stall is FR-049's transfer failure —
and records the bound that detects it.

- **The bound (FR-049).** A part write that reports no progress for **30 seconds**
  is stopped and answered as FR-049's transfer failure: the page aborts that
  part's request, the error state carries the retry and «اختيار ملف آخر», the held
  file stays for the retry, and «إلغاء» remains the merchant's own control while a
  departure remains FR-050's. At SC-007's 76 KB/s an 8 MB part takes about 105
  seconds and reports progress every second, so the bound detects a dead
  connection and not a slow one. `contracts/intake-api.md` §1.1 and §2.3 state the
  mechanism, AC-009 carries the clause, T051 implements it, and T033's journey
  carries the case.
- **No cause, no message, no counter.** The stall adds no code to §3.1, no row to
  the message table, and no rule to FR-061: the submission already counted one
  attempt when it started, and the retry counts another as every retry does.

**No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added,
renumbered, reused, or withdrawn; no Constitution Mandated Values row moves; no
Complexity Tracking row is added or renumbered; no gate row changes its outcome;
and no constitution text, version, or decision record changes — the bound is a
plan value over FR-049's existing cause, so no ADR is opened and the governance
drift check's structural counts are untouched.

### Thirty-ninth pass (2026-11-17, the slow tail's presentation)

This pass records Clarifications 2026-11-17 (9): what the page shows while an
upload outlasts a minute. It adds no presentation, no state, and no bound value.

- **The screening phase is the whole answer.** The page holds the same two
  progress presentations — the determinate transfer, then the indeterminate
  «يجري فحص الملف» — for as long as the work takes, with no percentage on the
  screening, no elapsed-time count, no second announcement, and no separate
  slow-upload panel, so the measured set stays closed at eleven and SC-008's
  sample is unchanged (SC-008). FR-048 and AC-003 carry the clause,
  `contracts/ui-contracts.md` §3 states the rule, and T046 and T033 carry it.
- **The tail always ends in an answer.** A stage that overruns its budget is
  answered as that stage's own cause, and the stage budgets' **115 s** sit inside
  the page's 120-second client timeout, so an upload in SC-007's 5% tail ends in
  an outcome or in FR-049's error state and never in a screen that rests
  unanswered. The tail's slowest case is a stage answered at its ceiling, not a
  presentation the page adds.

**No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added,
renumbered, reused, or withdrawn; no Constitution Mandated Values row moves; no
Complexity Tracking row is added or renumbered; no gate row changes its outcome;
and no constitution text, version, or decision record changes — the answer reads
FR-048's existing phase and the plan's budgets, so no ADR is opened and the
governance drift check's structural counts are untouched.

### Fortieth pass (2026-11-17, the quota read's bound)

This pass records Clarifications 2026-11-17 (10): a quota read that never settles.
It adds no state and no cause — the bound produces FR-015's own inline failure —
and records the interval that turns an unsettled read into it.

- **The bound (FR-015).** The read carries a **5-second** client bound from its
  dispatch, ten times the CMV row's quota-read p95 of 500 ms. At the bound the
  page stops the request and renders the inline failure with its retry, the
  counts unavailable, the upload control still available unless a verified
  exhausted state is held — where the numbers hide and the exhausted content and
  «تحديث» stay (FR-017). The loading state never outlasts the bound, the query
  makes no automatic retry, and a new read comes only from the retry control or
  one of the invalidation events. AC-012 carries the clause,
  `contracts/ui-contracts.md` §3 states the rule, and T051 and T077 carry it.
- **No new answer is measured.** A load whose read times out settles at the
  failure's first frame, five seconds in, so it is a failed read in SC-006's
  sample and counts in the slow tail the criterion's 95% permits.

**No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added,
renumbered, reused, or withdrawn; no Constitution Mandated Values row moves; no
Complexity Tracking row is added or renumbered; no gate row changes its outcome;
and no constitution text, version, or decision record changes — the answer reads
FR-015's existing failure state and the plan's CMV row, so no ADR is opened and
the governance drift check's structural counts are untouched.

### Forty-first pass (2026-11-17, the six performance-checklist findings)

This pass closes the six findings the performance checklist left open — CHK006,
CHK010, CHK017, CHK018, CHK020, and CHK023 — without moving an identifier,
adding a gate row, or changing a bound value. The specification is untouched;
the plan, `data-model.md` §7, the task list, and the checklist carry the answers.

- **The stress condition's budget (CHK018).** CMV row 6 states that its
  percentiles govern both load conditions — the design condition (300 / 10 / 10)
  and the stress condition (600 / 20 / 20) — so the stress phase is read against
  the row rather than against unstated values; the Budget check fails a
  percentile above the row at either condition.
- **The scan's ceiling and the p95 (CHK006).** CMV row 6 and `data-model.md` §7
  state the 90-second scan budget as the refusal threshold, not a target inside
  the percentile: a completion whose scan runs near it is one of the at most 5%
  above 10 seconds the p95 permits, and the row fails when more than 5% of a
  phase's completions exceed 10 seconds.
- **The workspace's aggregate disk (CHK020).** Scale/Scope records **60 GB** at
  the design condition and **120 GB** at the stress condition (300 or 600
  concurrent transfers × the 200 MB per-request ceiling), which is the figure
  Technical Context's per-file bound refers to; the typical case is about 1.4 GB
  because 200 MB is the ceiling and not the average.
- **The 10/s rate against the monthly envelope (CHK017).** Scale/Scope states that
  10/s is a burst, not the envelope's rate: the 350,000 monthly uploads average
  about 0.14/s, 10/s is the completion rate the model's design concurrency
  produces at its 30-second transfer, and the run's 1,200 intakes are 0.34% of
  the monthly envelope; the capacity model sizes the upload path by concurrency,
  not by an instantaneous rate.
- **The percentile estimator (CHK010).** The Budget check fixes nearest-rank: p50
  and p95 are the samples at ⌈0.50 × n⌉ and ⌈0.95 × n⌉, with no interpolation, so
  every reported percentile is a sample the run measured.
- **The soak (CHK023).** Complexity Tracking row 31 records the absent sustained
  run with R12 as owner and 2026-12-15 as the review date: the sweep is deferred
  (row 23), so a long run would measure a path whose cleanup is absent, and the
  sustained run belongs to R12's pre-release test (row 19).

**No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added,
renumbered, reused, or withdrawn; no Constitution Mandated Values row moves; no
gate row changes its outcome; the added Complexity Tracking row is numbered 31
and renumbers none; and no constitution text, version, or decision record
changes — each finding is answered by a statement over a value the plan already
carries, so no ADR is opened and the governance drift check's structural counts
are untouched. The performance checklist's six remaining items are marked `[x]`
with their evidence in the same change, closing it at 47 of 47.

### Forty-second pass (2026-11-17, the boundary table's three rows and the record's clock)

This pass closes the two review findings the formats and security checklists left
open — CHK025 (OQ-B) and CHK029 (OQ-D) — on their own terms: the formats
contract's boundary table gains the three rows the item asks for, and the HTTP
contract's operational record names the clock its `timestamp` reads and the one
reading it takes. It changes `contracts/intake-formats.md` §6,
`contracts/intake-api.md` §5, `data-model.md` §12, `quickstart.md`'s validation
scenarios, the two checklists' marks and audit entries, and this plan's plan
values, and nothing else.

- **The `.doc` mismatch (CHK025).** §6 gains the row "An Excel workbook named
  `.doc`" → `UPLOAD_CONTENT_MISMATCH`, the reverse of the `.xls` row beside it.
  The answer is §3.1 step 3's already: an OLE2 container whose `Workbook` or
  `Book` stream is present while the declared `WordDocument` stream is absent is
  a mismatch, so the row proves a rule that exists and adds none.
- **The macro-enabled `.docx` (CHK025).** §6 gains "A macro-enabled Word document
  named `.docx` (a package carrying `word/vbaProject.bin`)" → accepted, and the
  kept file carries no `vbaProject.bin`. The verdict is §3.2 step 3's main-type
  rule, which reads the package as the declared family whatever macros it
  carries, and the kept-content fact is §4.1's removal of `**/vbaProject.bin`,
  `**/vbaData.xml`, and `**/macrosheets/**` with their overrides and
  relationships.
- **The `.doc` whose macro cannot be removed (CHK025).** §6 gains that case →
  `UPLOAD_SANITIZATION_FAILED`, beside the macro-sheet and external-link refusal
  it already carried. §4.2 already removes the OLE2 `VBA` storage and answers
  `UPLOAD_SANITIZATION_FAILED` when it cannot, so the row makes the Word
  container's case explicit without adding a rule.
- **The record's clock (CHK029).** `contracts/intake-api.md` §5 gains one bullet:
  `timestamp` is read once, at settlement, from the request's injected clock —
  the one clock R1's container exposes as `now` — and never the database's
  `now()`; it is the same clock the acceptance reads the catalog's `uploaded_at`
  from (FR-011). §1's format and zone — RFC 3339 with milliseconds and `Z` — do
  not move. `data-model.md` §12 points at that sentence rather than stating a
  second rule, and the plan values' date-pattern bullet records the same clock
  for the record beside the month boundary it already recorded. The task list is
  untouched: T058 already carries the line's field set, and §5 is the authority
  its `timestamp` is read against, so a `/speckit.tasks` pass may name the clock
  there without moving a task identifier. `quickstart.md`'s Scenario 4 runs the
  `.doc` mismatch and Scenario 5 the two macro cases, and its refusal check reads
  the settled line's `timestamp` against §5 rather than against the host's clock.

**No identifier moves.** No `FR-###`, `AC-###`, or `SC-###` identifier is added,
renumbered, reused, or withdrawn; no Constitution Mandated Values row moves; no
Complexity Tracking row is added or renumbered; no gate row changes its outcome;
and no constitution text, version, or decision record changes — each row reads a
rule §§3–4 already carry and each clock sentence names a clock the plan already
injected, so no ADR is opened and the governance drift check's structural counts
are untouched. The two items are marked `[x]` in the same change, each with the
row or the sentence that answers it: `checklists/formats.md`'s OQ-B required the
closure to come from the contract's change and not from a reworded criterion, so
the mark records the contract's change and the open-question entries are kept,
marked closed. No requirement, acceptance criterion, task, cause, or criterion
wording moves.

### Forty-third pass (2026-11-17, the shared port contract, the cap's second measurement, the register's last row, and six read-only paths)

This pass answers four findings against this plan and the artifacts it governs:
the account-context port's cross-module import (A1), the decoded-size cap's
second measurement (H1), the decision register's last row (M2), and six paths
`T115` reads with no map row (M3). It changes `plan.md`, the two port tasks and
the four cap tasks in
`tasks.md`, `spec.md`'s FR-029, its AC-016, and its 2026-11-17 (12) answer,
`contracts/intake-formats.md` §5 and its boundary table, and
`contracts/intake-api.md` §2.3. It adds no `FR-###`, `AC-###`, `SC-###`, or
`ADR-###` identifier, moves no Constitution Mandated Values row, adds no
Complexity Tracking row, and opens no decision record.

- **A1 — the port's contract moves to `shared`, and the container injects it.**
  The `users` port was consumed by a direct import of
  `apps/api/src/modules/users/service/account-context.ts`, which is a direct
  import from one module to another: Principle X and `docs/architecture.md` §2
  both say communication between modules goes through the designated shared
  package, never by a direct import, so the gate row's PASS rested on a reading
  the rule does not admit. **The design is corrected, not excused**: the port's
  contract — its type and the shape it returns — is
  `packages/shared/src/contracts/account-context.ts`, its implementation stays
  `apps/api/src/modules/users/service/account-context.ts` (one read, through the
  `users` repository, of the account's status and its two quota overrides), and
  `apps/api/src/http/deps.ts` injects it, so no file in `catalogs` imports any
  path under `modules/users` — not its service, not its routes, not its
  repository. Gate 1 → X's evidence is rewritten and its status re-dated, Gate 2
  → Module Discipline names the same boundary and the ESLint rule that enforces
  it — the ban on `**/modules/*/repository/*` and `**/modules/*/service/*`, with
  `apps/api/src/http/**` the composition root the rule exempts — the Verification
  Notes' N+1 inspection names the contract and the
  container rather than an import, and the Ownership Map gains the contract's
  row and updates the three rows the wiring touches. **No exception is
  registered and no ADR is opened**: `docs/architecture.md` governs the case
  already, and a record would be a second authority for a rule that exists. The
  two tasks follow the design: `T113` writes the contract and the implementation
  and registers the port in the container, and `T075` receives the port from the
  container and names no `users` file (the task identifiers do not move). The
  registration is the task template's composition-point exemption, not a second
  owner: `apps/api/src/http/deps.ts` is the app's composition root and
  `packages/shared/src/contracts/index.ts` is the shared barrel, and `T113` adds
  one line to each and rewrites nothing.
- **H1 — the cap is measured twice, and the second measurement spends the
  sanitizer's budget.** The specification fixes that the cap is measured on the
  original decode and again on the sanitized decode, while FR-029's five timed
  stages counted one read. FR-029 now names the six steps in order — the content
  check, the scan, the cap's read of the original decode, macro stripping, the
  cap's measurement of the sanitized decode, and the reopen — and states that the
  second measurement is taken as the sanitizer writes the kept bytes, so it
  spends the sanitizer's own 10-second budget and adds no second read: the plan's
  five timed budgets still sum to **115 s** inside the page's 120-second client
  timeout, and the last 5 s stay the completion's, the kept object's write's, the
  acceptance transaction's, and the response's. A sanitized decode that crosses
  the cap is the expansion-cap cause, because the bytes the platform would keep
  are ones whose decoded content crosses it, while a measurement that cannot
  finish inside the sanitizer's budget is the sanitization-failed cause, because
  the step that produces the kept bytes did not complete; no cause enters
  FR-064's closed seventeen, and AC-016 measures both cases at the acceptance
  level. `contracts/intake-formats.md` §5, its boundary
  table, `contracts/intake-api.md` §2.3, and the plan values' two budget
  sentences carry the same arithmetic.
- **M2 — the register ends at ADR-179, not ADR-176.** Three places stated the
  register's last row as ADR-176 and its index as 176 rows; `docs/DECISIONS.md`
  ends at ADR-179 and `governance-drift-check.mjs` reports 179 records and 179
  index rows clean. The three places now read ADR-179 and 179 rows, and the
  version and date they sit beside stay **7.1.0 / 2026-11-14**, because those
  are the constitution's and do not move with the register's growth. No gate
  outcome, no Complexity Tracking row, and no version source changes.
- **M3 — six read-only paths enter the Ownership Map.** `T115` reads
  `apps/web/app/app.vue`, `packages/ui/tests/tokens.spec.ts`,
  `packages/ui/tests/shell/accessibility.spec.ts`,
  `packages/ui/app/components/shell/WfShellBottomBar.vue`,
  `packages/ui/app/components/WfLoadingBar.vue`, and
  `packages/ui/app/components/WfContentSkeleton.vue` to prove R1's inherited
  accessibility floors, and no map row named them. Each gains a read-only row on
  `packages/shared/src/routes.ts`'s pattern — owning feature
  `001-identity-foundation`, written by this feature **no**, exclusive **no** —
  with the read's reason (the inherited-floor evidence `T115` records) and no
  write from this slice.

**The task list's current count is fixed here, and every earlier count is a
dated snapshot.** `tasks.md` carries **113** tasks (`T001`–`T115`, with `T068`
retired and `T015` merged into `T023`) and **60** `[P]` markers; `T114` and
`T115` are the two tasks appended after the Twenty-sixth pass, and no count line
stood between that pass and this one. Every count an earlier pass states — 110
tasks and 59 `[P]` markers at the Twenty-first, Twenty-second, Twenty-third, and
Twenty-fifth passes, and 111 and 59 at the Twenty-sixth — is a dated snapshot of
the list as that pass found it, not a current claim, so each stays as written and
no earlier pass is rewritten. Nothing else moves: no task line, `[P]` marker,
task path, gate row, Complexity Tracking row, register row, or identifier
changes.

**No identifier moves and no gate outcome changes.** No `FR-###`, `AC-###`,
`SC-###`, `EX-###`, or `ADR-###` identifier is added, removed, renumbered, or
withdrawn; Gate 1 → X keeps **PASS** with corrected evidence and a re-evaluation
date; Gate 2 → Module Discipline keeps **PASS** with the boundary and its
enforcement named; no Constitution Mandated Values row, Complexity Tracking row,
task identifier, or decision record moves.

### Forty-fourth pass (2026-11-17, the sample's term and the transient session's record)

This pass answers two findings against the plan and the project-level model, and
it changes `plan.md` and `docs/domain-model.md` alone. It adds no `FR-###`,
`AC-###`, `SC-###`, or `ADR-###` identifier, moves no Constitution Mandated
Values row, adds no Complexity Tracking row, changes no count, and edits no task.

- **The term the sample measures (Gate 1 → IV).** The row read "the axe scan over
  every state in both appearances at 320 and 1280", while SC-008 fixes the sample
  as the **eleven measured presentations** and states in its own words that a
  presentation is what the page shows at one moment and not a state — the
  multi-file notice is measured without being counted as one of the page's eight
  states. T034, T099, and T114 already scan the eleven presentations, so the row's
  "state" was the one place where the word named a set of eight while the tasks
  that render and measure the scan read eleven. The row now reads "every
  presentation"; the pair of widths, the two appearances, the "no reported
  violation" definition, the keyboard-only pass, and every count stay as they
  are, and the row keeps **PASS**.
- **The session's record where a project-level reader looks for it (Gate 2 →
  Product Register).** `tasks.md` states the counters and the upload session as
  non-entities, `data-model.md` §5 carries the session's columns, its states, and
  its terminal removal, and §9 carries the sweeps, while `docs/domain-model.md`
  carried the counters, the hash's uniqueness, and the projection but not the
  session. The document now carries **Transient intake state (not an entity)**:
  the session is the `catalogs` module's durable transient state, deleted rather
  than soft-deleted, never a product read and never a catalog, with its columns
  and states referred to `data-model.md` §5 and its sweeps to §9 and no column,
  predicate, or value copied; the section follows the pattern of R1's Transient
  verification state. The Product Register row now names that section, and the
  Documentation row adds the session to the list of `docs/domain-model.md`'s
  amendments. **No entity, no field, and no ADR**: the paragraph records a fact
  the feature's data model already fixes, so no constitution amendment and no
  decision record is opened, and the register's twelve entities stay twelve.

**No identifier moves and no gate outcome changes.** No `FR-###`, `AC-###`,
`SC-###`, `EX-###`, or `ADR-###` identifier is added, removed, renumbered, or
withdrawn; Gate 1 → IV keeps **PASS** with the sample's own term; Gate 2 →
Product Register and Gate 2 → Documentation keep **PASS** with the new section
named; no Constitution Mandated Values row, Complexity Tracking row, task
identifier, count, or decision record moves.

### Forty-fifth pass (2026-11-17, the exception's evidence and the budgets' order)

This pass answers two findings against the plan and the register it writes, and
it changes `plan.md`, `tasks.md`, `contracts/intake-api.md`,
`.specify/templates/exception-register.md`, and `governance-drift-check.mjs`
alone. It adds no `FR-###`, `AC-###`, `SC-###`, or
`ADR-###` identifier, moves no Constitution Mandated Values row, adds no
Complexity Tracking row, changes no task identifier, and moves neither the
constitution's version nor `.specify/memory/version.json`.

- **`EX-007` is open until its evidence exists (rules 5 and 6).** The register
  carried the row in its Closed table with the closing date 2026-12-11 and a
  `How It Ended` cell written in the past tense — the frame's runtime lines "are
  exercised" and their criteria "are met" — while this slice has not started:
  `tasks.md` marks none of its 113 tasks done, and neither
  `packages/ui/app/components/upload/` nor `apps/web/app/pages/upload.vue`
  exists. Rule 5 forbids closing a row before its evidence exists, and rule 6
  says the review date is an escalation trigger and never a closing condition, so
  the pre-written closure is **withdrawn**: the row returns to the **Active**
  table with its scope, its criteria — `001-identity-foundation` AC-024, AC-042,
  AC-051, AC-052, and AC-053, R2's half of SC-005, and the frame half of SC-006 —
  its evidence (`T082`–`T087` and `T099`), and the condition under which it stops
  applying: R2's acceptance, when that evidence exists. **`T111` becomes the
  writer of the closure**: at acceptance it moves the row into the Closed table
  with the closing date and records each behaviour against the criterion beside
  it, and it verifies `EX-013`'s row and the count; the earlier reading, in which
  the plan wrote the closure and `T111` verified it, is withdrawn rather than
  excused.
- **The split moves with the row, and the total does not.** The register still
  holds **thirteen** rows — eight Active (`EX-001`–`EX-007`, `EX-013`) and five
  Closed (`EX-008`–`EX-012`) — so G2's count stays at thirteen, and G12's
  expected split moves from seven-and-six to **eight-and-five** with the row it
  describes, because a check that kept the old split would fail on the correct
  register; `T111` moves the split back to seven-and-six in the same change that
  closes the row at acceptance, so the check tracks the register at every commit.
  The five identifiers the row carries keep their
  `001-identity-foundation` prefix, no row is added or removed, and no other check
  changes.
- **The five budgets are listed in FR-029's order.** The Technical Context and
  the Verification Notes listed "the cap's read of the original decode" before
  "the scan", and `contracts/intake-api.md` §2.3 carried the same order, which
  read as a sequence against FR-029's order — the content
  check, the scan, the cap's read of the original decode, the executable
  content's removal, the sanitized decode's measurement, and the reopen. All
  three now state the five budgets in that order — the content probe 5 s, the
  scan 90 s, the cap's read 5 s, the sanitizer 10 s (which carries the removal and
  the second measurement), and the reopen 5 s — and say explicitly that **115 s
  is the sum of five budgets, not a sequence of intervals**: each bounds its own
  step, and the total sits inside the page's 120-second client timeout. The
  total, the six steps, the five budgets, and the cause each overrun produces are
  unchanged; no budget value moves.

**No identifier moves and no gate outcome changes.** No `FR-###`, `AC-###`,
`SC-###`, `EX-###`, or `ADR-###` identifier is added, removed, renumbered, or
withdrawn; Gate 1 → VIII keeps **PASS** on the approved `EX-013` and the open
`EX-007`; Gate 2 → Documentation keeps **PASS**; no Constitution Mandated Values
row, Complexity Tracking row, task identifier, or decision record moves.

### Reaffirmed decision records

- **ADR-021** — Node.js 22 LTS is the runtime; CMV row 10 restates the pinned
  value and the plan adds no second runtime.
- **ADR-031** — the documentation-drift test is owed by the first feature after
  the public interface exists; this plan delivers it (item 4) and reaffirms the
  rule.
- **ADR-040** — the catalog data shape is closed by that record; R2 adds the
  `Catalog` record's own fields and reopens no shape decision (Gate 3).
- **ADR-051 / ADR-053** — merchant scoping at the single shared entry point; R2
  extends the same entry point and the same isolation test rather than writing a
  second one.
- **ADR-070** — the merchant-scoped table set and the parts read path; `Catalog`
  is merchant-scoped and carries `user_id`.
- **ADR-090** — the Documentation rule's `Alternatives considered` field does not
  reach a governance record: a governance record is one whose subject is this
  constitution's own text, a register, the process, or the governance tooling, so
  this plan's Documentation row reads the earlier version-source disagreement as
  a governance defect escalated as an amendment, files no ADR for it, and
  reconstructs no missing section. The row rests on that record's reading.
- **ADR-097** — `packages/ui` is the Wafar UI layer; the upload surfaces are
  added there, not in a page-local copy.
- **ADR-098 / ADR-137** — IconPark (outline cut consumed), no emoji, the light
  default; the page consumes the layer's icons and tokens.
- **ADR-099 / ADR-102 / ADR-127** — the shell's per-page controls; the page
  consumes them unchanged and adds no shell control or page action of its own.
- **ADR-118** — the 50/300 limits and the 500/1,500 ceilings; the plan enforces
  the effective limits, never the defaults.
- **ADR-126** — the twenty-eighth page is Upload Catalog, inside the shell.
- **ADR-128 / ADR-129** — the Precision token and rendering contract, and the
  conformance gate (contract test plus generated baselines).
- **ADR-131** — the 90-day retention is counted from the upload timestamp; R2
  records it once and implements no deletion.
- **ADR-139** — the frame's runtime verification lands with the first page that
  renders it; `EX-007` closes here.
- **ADR-142** — the platform's RTO/RPO targets; CMV rows 8–9 restate them and
  the file leg's missing evidence is Complexity Tracking row 7, not a new target.
- **ADR-143** — every continuous-integration action stays SHA-pinned; the new
  `intake` job follows the same rule and the dependency install is its only
  networked step.
- **ADR-148** — the shared shell's name; the plan uses **shell** and keeps
  **frame** only where the exception register quotes it.
- **ADR-165** — the register's last row before this change's records (6.3.2); it
  is named only as the baseline this change's records follow, and no rule of it
  is implemented here. It is no longer the register's last row: ADR-174 closes
  this change's field-level records and ADR-175 is the amendment's own record.
- **ADR-166, ADR-167, ADR-168, ADR-169, ADR-170, ADR-171, ADR-172, ADR-173,
  and ADR-174** — this plan's own records, appended with this change and
  reaffirmed by the rows above.
- **ADR-175** — the single ratified amendment closing the four deferred
  governance findings (Principle V's narrowed scope, the isolation exception,
  CMV row 20, and the version alignment). The plan was evaluated against the
  constitution that record produced — 7.0.0 / 2026-11-13 — and every gate row
  that cited a deferred amendment cites this one instead.
- **ADR-176** — the 7.1.0 amendment (2026-11-14): the active limit counts a
  catalog whose stored file is not deleted, whatever its processing status. The
  Usage Limits and Quota Semantics row and the quota suite already assert that
  reading; the amendment moves no gate outcome and adds no obligation here.
- **ADR-177** — the analysis command's scope in this project exceeds the
  inherited command's (2026-11-16): this plan reopens no part of that decision.
- **ADR-179** — the tasks template is the single source of the task list's
  binding rules (2026-11-16): this plan reopens no part of that decision.

## Project Structure

### Documentation (this feature)

```text
specs/002-file-intake/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── intake-api.md
│   ├── intake-formats.md
│   └── ui-contracts.md
├── checklists/          # /speckit.checklist output, when generated
└── tasks.md             # Phase 2 output — NOT created here
```

### Source Code (repository root)

```text
apps/
├── api/
│   ├── src/
│   │   ├── app.ts                         # R1's app (extended: intake routes, four-field /health)
│   │   ├── env.ts                         # R1's environment schema (extended: storage, scanner, workspace)
│   │   └── http/
│   │       ├── context.ts                 # R1's shared entry point (read, extended)
│   │       ├── deps.ts                    # R1's container (extended: the account-context, storage, and scanner ports)
│   │       ├── errors.ts                  # the refusal record (extended)
│   │       └── openapi.ts                 # the generated document (extended)
│   ├── openapi.json                       # the emitted document the drift test reads
│   ├── modules/
│   │   ├── users/
│   │   │   └── service/account-context.ts  # the users port's implementation: account status and the two quota overrides
│   │   └── catalogs/
│   │       ├── routes/                    # upload, complete, abort, quota
│   │       ├── service/                   # quota, attempt window, hash, duplicate, intake
│   │       ├── repository/                # catalogs, counters, upload sessions
│   │       ├── storage/                   # SeaweedFS S3 adapter (presign, put, head, delete)
│   │       ├── scanner/                   # clamd INSTREAM adapter over node:net
│   │       └── inspection/                # format check, decoded cap, sanitizer
│   ├── test/
│   │   ├── support/harness.ts             # R1's harness (extended: the storage and scanner doubles)
│   │   ├── fixtures/intake/               # format, corrupt, encrypted, macro, and expansion fixtures
│   │   └── integration/
│   │       ├── catalogs/                  # intake, quota, duplicate, rollback, storage adapter
│   │       └── http/                      # R1's refusal catalogue, isolation, degradation (extended)
│   └── package.json                       # R1's manifest (extended: the four libraries, one task)
├── web/
│   ├── app/
│   │   ├── layouts/shell.vue              # R1's shell (read: EX-007's runtime evidence)
│   │   ├── pages/upload.vue
│   │   ├── pages/auth/sign-in.vue          # R1's page (extended: the validated return target)
│   │   ├── middleware/merchant.ts          # the merchant-area door and the guest's return target
│   │   ├── components/upload/             # page-specific outcome panels
│   │   └── composables/
│   │       ├── auth/useSession.ts          # R1's composable (extended: the return target survives)
│   │       └── upload/                    # the page's state machine and transport
│   └── tests/
│       ├── e2e/upload.spec.ts
│       ├── e2e/__screenshots__/upload/    # the 44 visual baselines
│       ├── a11y/upload.spec.ts
│       └── unit/
│           ├── upload/
│           └── user-facing-strings.spec.ts # R1's copy scan (extended: the two directories)
└── worker/                                # not touched (R3)
packages/
├── shared/
│   └── src/
│       ├── index.ts                       # R1's barrel (extended)
│       ├── routes.ts                      # R1's route map (read only)
│       ├── contracts/                     # Zod request/response/outcome schemas and the account-context port's contract (+ its barrel)
│       ├── refusals/                      # the intake codes and the platform union
│       └── format/                        # the date, size, duration, and status surfaces
├── db/
│   ├── schema/catalogs.ts                 # R2's four tables
│   ├── schema/index.ts                    # R1's barrel (extended)
│   └── migrations/
│       ├── 0004_file_intake.sql (+ .down.sql)
│       └── meta/                          # the journal (extended)
├── ui/
│   ├── app/components/upload/             # WfUploadControl, WfSelectedFile, WfUploadProgress, WfQuotaBlock
│   ├── app/assets/css/tokens.css          # the layer's tokens (extended only if a token is missing)
│   └── tests/upload/                      # the layer specs and the logical-direction check
├── search/                                # not touched (R3)
└── config/                                # the shared ESLint/Stylelint/TS configuration (unchanged)
scripts/
├── load/upload-smoke.mjs
├── storage/init-bucket.mjs               # the development bucket through the S3 gateway
├── fixtures/seed.mjs                     # R1's seeder (extended: the load condition)
└── check/documentation-drift.mjs          # the first standalone documentation-drift test
.github/workflows/ci.yml                   # R1's workflow (extended: the intake job and the drift step)
compose.dev.yml                            # R1's composition (extended: scanner, bucket init)
.env.example                               # R1's example (extended: storage, scanner, workspace)
package.json                               # R1's manifest (extended: load:upload, storage:init)
pnpm-lock.yaml                             # regenerated by the single update process (T095)
docs/runbooks/backup-restore.md            # R1's runbook (extended: the four-field health assertion)
lighthouserc.json                          # read by T094; unchanged
governance-drift-check.mjs                 # run by T092; its G2 exception-row count is raised by the governance change
.specify/templates/exception-register.md   # the one register; the governance change opens EX-013 in it and leaves EX-007 open until T111 closes it at acceptance
```

### Ownership Map (required)

| Path (directory or file) | Owning feature | Written by this feature? | Exclusive to it? |
|---|---|---|---|
| `apps/api/src/modules/catalogs/` | 002-file-intake | yes | yes |
| `apps/api/src/modules/catalogs/storage/` | 002-file-intake | yes | yes |
| `apps/api/src/modules/catalogs/scanner/` | 002-file-intake | yes | yes |
| `apps/api/src/modules/catalogs/inspection/` | 002-file-intake | yes | yes |
| `apps/api/src/modules/users/service/account-context.ts` | 001-identity-foundation | yes (R2 adds the port's implementation — one read, through the `users` repository, returning the account's status and its two quota overrides — against the contract in `packages/shared/src/contracts/account-context.ts`) | no — R1 owns the users module; R2 adds the implementation its quota path consumes through the container |
| `apps/api/src/app.ts` | 001-identity-foundation | yes (mounts the intake routes and the extended health probe) | no — R1 owns the app; R2 extends it |
| `apps/api/src/env.ts` | 001-identity-foundation | yes (validates the storage, scanner, and workspace values) | no — R1 owns the environment schema; R2 extends it |
| `apps/api/src/http/context.ts` | 001-identity-foundation | yes (R2 adds the intake's role and status checks through it) | no — R1 owns the entry point; R2 extends it |
| `apps/api/src/http/deps.ts` | 001-identity-foundation | yes (the dependency container gains the account-context port — the contract is shared, the implementation is `users`' — and the storage and scanner ports) | no — R1 owns the container; R2 extends it |
| `apps/api/src/http/errors.ts` | 001-identity-foundation | yes (the refusal record gains the intake codes) | no — R1 owns the envelope; R2 extends it |
| `apps/api/src/http/openapi.ts` | 001-identity-foundation | yes (the intake's routes enter the generated document) | no — R1 owns the generator; R2 extends it |
| `apps/api/openapi.json` | 001-identity-foundation | yes (regenerated with the intake routes) | no — regenerated whenever a route lands |
| `apps/api/test/support/harness.ts` | 001-identity-foundation | yes (the harness wires the storage and scanner doubles) | no — R1 owns the harness; R2 extends it |
| `apps/api/test/integration/catalogs/` | 002-file-intake | yes | yes |
| `apps/api/test/support/` | 002-file-intake | yes (the intake test support: `intake.ts` for the merchant, the start, the parts, and the completion; `storage.ts` for the in-memory store; `isolated.ts` and `scratch.ts` for a private database per suite; and `fault.ts` for the one failed collaborator call) | yes (these files are this slice's own) |
| `apps/api/test/fixtures/intake/` | 002-file-intake | yes (the format, corrupt, encrypted, macro, and expansion fixtures) | yes |
| `apps/api/test/integration/http/refusal-catalogue.spec.ts` | 001-identity-foundation | yes (the catalogue gains the intake's codes and producers; the 43-code union invariant is Complexity Tracking row 26's) | no — R1 owns the test; R2 extends it |
| `apps/api/test/integration/http/isolation.spec.ts` | 001-identity-foundation | yes (the duplicate projection is the one admitted exception) | no — R1 owns the test; R2 extends it |
| `apps/api/test/integration/http/degradation.spec.ts` | 001-identity-foundation | yes (the health probe gains storage and scanner) | no — R1 owns the suite; R2 extends it |
| `packages/db/schema/catalogs.ts` | 002-file-intake | yes | yes |
| `packages/db/schema/index.ts` | 001-identity-foundation | yes (exports `catalogs.ts`) | no — R1 owns the barrel; R2 extends it |
| `packages/db/migrations/0003_phone_verifications_payload_checks.sql` (+ `.down.sql`) | 001-identity-foundation | no (R1's third migration, present in the tree and applied before R2's step; R2 neither writes nor rewrites it) | no — R1 owns the migration; R2 applies it before its own |
| `packages/db/migrations/0004_file_intake.sql` (+ `.down.sql`) | 002-file-intake | yes | yes |
| `packages/db/migrations/meta/` | 001-identity-foundation | yes (the journal gains the new step) | no — the migrator owns it |
| `packages/shared/src/contracts/catalogs.ts` | 002-file-intake | yes | yes |
| `packages/shared/src/contracts/account-context.ts` | 001-identity-foundation | yes (R2 adds the account-context port's contract — the port's type and the shape it returns — so `catalogs` consumes a `shared` contract and `users` implements it, and neither module imports the other) | no — R1 owns the `users` module and this contract is its surface; a later slice extends the contract rather than writing a second one |
| `packages/shared/src/contracts/index.ts` | 001-identity-foundation | yes (exports the catalogs contract and the account-context contract) | no — R1 owns the barrel; R2 extends it |
| `packages/shared/src/refusals/` | 002-file-intake | yes | yes (the intake's closed set and the platform union; R1's `authErrorCodes` stays where it is) |
| `packages/shared/src/format/` | 002-file-intake | yes | yes (the date, size, duration, and status surfaces; R4 and R6 consume them) |
| `packages/shared/src/index.ts` | 001-identity-foundation | yes (exports the refusals and format surfaces) | no — R1 owns the barrel; R2 extends it |
| `packages/shared/src/routes.ts` | 001-identity-foundation | yes (the guest's return target is validated against this one map and no route entry is added or rewritten, but R2 exports the four types the shell consumes — `SidebarDestination`, `FooterLink`, `BottomBarSlot`, and `AccountMenuTargets`) | no - R1 owns the route map; R2 extends it with the exported types |
| `packages/ui/app/components/upload/` | 002-file-intake | yes | yes (new layer files; later slices consume, not edit) |
| `packages/ui/app/components/shell/` | 001-identity-foundation | yes (the frame's runtime for the first rendered page: the header, sidebar, drawer, footer, nav list, account menu, ended-session panel, and bottom bar take the shared route lists and the session through props — the bottom bar's `items` prop and the ended-session panel's `signInPath` among them; T115 also reads the bottom bar's `prefers-reduced-motion` rules as inherited-floor evidence) | no — R1 owns the shell; R2 extends it |
| `packages/ui/app/components/WfLoadingBar.vue` | 001-identity-foundation | no (read only — T115 reads its `prefers-reduced-motion` rule as inherited-floor evidence; no line is edited) | no — R1 owns the component; R2 reads it |
| `packages/ui/app/components/WfContentSkeleton.vue` | 001-identity-foundation | yes (T115 reads its `prefers-reduced-motion` rule as inherited-floor evidence, and the skeleton's markup is reflowed with no behaviour change) | no — R1 owns the component; R2 extends it (formatting only) |
| `packages/ui/tests/upload/` | 002-file-intake | yes | yes |
| `apps/api/src/http/__tests__/openapi.spec.ts` | 001-identity-foundation | yes (the generator's unit contract gains the intake route table and the four-field health body) | no — R1 owns the generator's test; R2 extends it |
| `apps/api/test/support/cli.ts` | 001-identity-foundation | yes (the CLI support reads the session role the administrator door needs) | no — R1 owns the support file; R2 extends it |
| `apps/api/test/integration/auth/`, `apps/api/test/integration/db/`, and `apps/api/test/integration/users/` (R1 suites) | 001-identity-foundation | yes (R1's auth, migration-release, and no-self-deletion suites are updated for the session role, the third migration, and the intake health body) | no — R1 owns those suites; R2 extends them |
| `apps/web/tests/e2e/bare-layout.spec.ts` | 001-identity-foundation | yes (the wordmark's accessible name is read by the bare-layout test) | no — R1 owns the test; R2 extends it |
| `apps/web/tests/unit/` (R1 suites) | 001-identity-foundation | yes (auth-pages, code-step-resending, session-resource, shell-layout, and user-facing-strings gain the guarded redirect read, the session role, the query provider, and the copy scan's R2 directories) | no — R1 owns those tests; R2 extends them |
| `packages/ui/tests/tokens.spec.ts` | 001-identity-foundation | yes (T150 adds the focus-offset and focus-colour assertions — the 3:1 contrast on both appearances' surface — that the inherited-floor proof reads; the token values are R1's and none is edited) | no - R1 owns the token contract's test; R2 extends it (Complexity Tracking row 34) |
| `packages/ui/tests/shell/` | 001-identity-foundation | yes (T115 reads the accessibility suite's no-`dir`/`lang` assertion as inherited-floor evidence, and the shell's unit contracts gain the props and the new `fixtures.ts` the first rendered page supplies) | no — R1 owns the shell's tests; R2 extends them |
| `packages/ui/app/assets/css/tokens.css` | 001-identity-foundation | yes (a missing upload token is added here with its component) | no — the layer owns the token file |
| `apps/web/app/pages/upload.vue` | 002-file-intake | yes | yes |
| `apps/web/app/layouts/shell.vue` | 001-identity-foundation | yes (the frame takes its data from the shared route map - `accountMenu`, `sidebarDestinations`, `footerLinks`, and `bottomBarSlots` - and reads the session, so the header carries the merchant's account control, the notifications control, and the menu's sign-out; the frame's runtime behaviour is US5's evidence and `EX-007` closes on it) | no - R1 owns the shell; R2 extends it (Complexity Tracking row 33) |
| `apps/web/app/app.vue` | 001-identity-foundation | no (read only — T115 asserts its one document-level `dir="rtl" lang="ar"` as the evidence that the direction floor is R1's and is inherited rather than rebuilt; no line is edited) | no — R1 owns the document; R2 reads it |
| `apps/web/app/middleware/merchant.ts` | 002-file-intake | yes (the merchant-area door: a guest's return target, an administrator's guest treatment) | yes |
| `apps/web/nuxt.config.ts` | 001-identity-foundation | yes (the merchant route renders on the client: the session, quota, and upload resources are provided by the layer's client plugin, so the route rule keeps the server out of a page it cannot render) | no - R1 owns the configuration; R2 extends it |
| `apps/web/app/pages/auth/sign-in.vue` | 001-identity-foundation | yes (accepts and validates the internal return target) | no — R1 owns the page; R2 extends it |
| `packages/ui/app/components/WfFileName.vue` | 001-identity-foundation | yes (the cut is taken inside the Arabic stem, so the Latin extension keeps its order and the ellipsis lands on the name) | no - R1 owns the component; R2 extends it (Complexity Tracking row 33) |
| `packages/ui/app/components/WfWordmark.vue` | 001-identity-foundation | yes (the non-interactive mark carries `role="img"` and its accessible name, the form R1`s own bare-layout test reads) | no - R1 owns the component; R2 restores it (Complexity Tracking row 33) |
| `packages/ui/app/components/shell/WfAccountMenu.vue` | 001-identity-foundation | yes (Escape dismisses the confirmation then the menu and returns focus, and an activation outside closes the menu) | no - R1 owns the component; R2 extends it (Complexity Tracking row 33) |
| `apps/web/server/plugins/csp.ts` | 001-identity-foundation | yes (`connect-src` names the object store`s origin, so the page`s part PUT reaches its presigned URL) | no - R1 owns the plugin; R2 extends it (Complexity Tracking row 33) |
| `apps/web/tests/playwright.config.ts` | 001-identity-foundation | yes (both servers receive the object store`s origin, so the class is self-consistent) | no - R1 owns the configuration; R2 extends it |
| `apps/web/tests/unit/shell-layout.spec.ts` | 001-identity-foundation | yes (the mount installs the query provider the frame`s session read needs) | no - R1 owns the test; R2 extends it |
| `.gitignore` | 001-identity-foundation | yes (the load run`s and the fixture seeder`s measured output under `reports/`) | no - R1 owns the file; R2 extends it |
| `apps/web/app/composables/auth/useSession.ts` | 001-identity-foundation | yes (the return target survives the sign-in) | no — R1 owns the session composable; R2 extends it |
| `apps/web/app/components/upload/` | 002-file-intake | yes | yes |
| `apps/web/app/composables/upload/` | 002-file-intake | yes | yes |
| `apps/web/tests/e2e/upload.spec.ts` | 002-file-intake | yes | yes |
| `apps/web/tests/a11y/upload.spec.ts` | 002-file-intake | yes | yes |
| `apps/web/tests/visual/upload.spec.ts` | 002-file-intake | yes (the eleven presentations of `contracts/ui-contracts.md` §8 at 1280 and 375 CSS px in both appearances — T156's suite, capturing into the registered screenshot directory) | yes (T156 writes it; the set it captures is this slice's) |
| `apps/web/tests/unit/upload/` | 002-file-intake | yes | yes |
| `apps/web/app/utils/` | 002-file-intake | yes (`return-target.ts`: the internal return target's validation against the route map) | yes |
| `apps/web/tests/support/` | 002-file-intake | yes (`merchant.ts`: the signed-in merchant the journeys enter as; `hydration.ts`: the boundary the same helper waits for, so a listener the page adds is bound before a journey activates it; `presentations.ts`: the eleven presentations' one driver, shared by the accessibility scan and the visual suite; and `seed.ts`'s session-end and block helpers) | no - R1 owns `seed.ts`; R2 extends it |
| `apps/web/tests/unit/user-facing-strings.spec.ts` | 001-identity-foundation | yes (the copy scan's directory list gains `packages/ui/app/components/upload/` and `apps/web/app/composables/upload/`, and the technical names that do not translate join its exceptions) | no — R1 owns the file; R2 extends it |
| `specs/002-file-intake/contracts/` | 002-file-intake | yes (the API contract, the formats contract, and the UI contract this slice owns; a later slice extends them and rewrites none) | yes (these three documents are this slice's own) |
| `apps/web/tests/e2e/__screenshots__/` | 001-identity-foundation | yes (R2's baselines land in the directory the visual project's `pathTemplate` names — `{testDir}/e2e/__screenshots__/{arg}{ext}` — beside R1's; the upload set is this slice's, and R1's files are not edited) | no — the directory holds R1's and R2's baselines; each slice writes its own files |
| `scripts/load/upload-smoke.mjs` | 002-file-intake | yes | yes |
| `scripts/check/documentation-drift.mjs` | 002-file-intake | yes | yes |
| `scripts/storage/init-bucket.mjs` | 002-file-intake | yes (creates the development bucket through the S3 gateway) | yes |
| `scripts/fixtures/seed.mjs` | 001-identity-foundation | yes (seeds the load condition's 10,000 accounts and 50,000 catalogs) | no — R1 owns the seeder; R2 extends it |
| `package.json` | 001-identity-foundation | yes (adds the `load:upload` and `storage:init` scripts) | no — R1 owns the manifest; R2 extends it |
| `apps/api/package.json` | 001-identity-foundation | yes (declares the four intake runtime dependencies — `aws4fetch`, `fflate`, `cfb`, `pdf-lib` — in one task, T095) | no — R1 owns the manifest; R2 extends it |
| `pnpm-lock.yaml` | 001-identity-foundation | yes (regenerated through the single update process when T095 declares the four dependencies) | no — the lockfile is repository-wide; only the update process writes it |
| `.github/workflows/ci.yml` | 001-identity-foundation | yes (the intake job and the documentation-drift step) | no — R1 owns the workflow; R2 extends it |
| `compose.dev.yml` | 001-identity-foundation | yes (adds the scanner service and the storage profile's bucket init) | no — R1 owns the composition; R2 extends it |
| `.env.example` | 001-identity-foundation | yes (adds the storage, scanner, and workspace keys) | no — R1 owns the file; R2 extends it |
| `docs/runbooks/backup-restore.md` | 001-identity-foundation | yes (the drill's health assertion gains the two fields) | no — R1 owns the runbook; R12 extends the procedure |
| `lighthouserc.json` | 001-identity-foundation | no (read only — T094 confirms the file still asserts R1's three public routes and that `/upload` stays out of the preview set; no assertion is edited) | no — R1 owns the configuration; R2 reads it |
| `.specify/templates/exception-register.md` | 002-file-intake | yes (the governance change this plan's Twelfth pass records opens `EX-013` — Principle VIII's approved exception (2026-11-16), Complexity Tracking row 21 — with its exact scope, its approver, and its 2026-12-11 review date, leaves `EX-007` in the Active table as an open row whose closure `T111` writes at acceptance with the rendered evidence `T082`–`T087` and `T099` (Complexity Tracking row 10), and qualifies the five identifiers `EX-007` names that this slice's specification also defines — `AC-024`, `AC-042`, `AC-051`, `SC-005`, and `SC-006` — with their `001-identity-foundation` prefix; the Twentieth pass widens the row's scope to US3, its `UploadDuplicate.vue`, the three US1 tasks that consume it, and the test-coverage statement; the Twenty-fourth pass pins the row with its 2026-11-16 decision sentence and the one clause it waives, and the Twenty-fifth pass records the owner's final acceptance of 2026-11-16 and the rejected restructuring; no task writes the register except `T111`, which writes `EX-007`'s closure at acceptance and verifies `EX-013`'s row, the widened scope, the approval, and the count at thirteen) | no — project-owned governance; one register holds every slice's exceptions, and a slice appends to it rather than owning it |
| `governance-drift-check.mjs` | 002-file-intake | yes (the same governance change raises the G2 exception-row count from twelve to thirteen — the register's row count after the addition, **eight Active rows and five Closed ones**, because `EX-007` stays Active — and adds the check (G12) that every `EX-###` reference resolves to a register row in either table; the Forty-fifth pass moves the split that check expects — seven-and-six then, **eight-and-five** now — with the row rather than leaving the check to fail, and `T111` moves it back to seven-and-six when it closes the row at acceptance and verifies the count; no other check changes) | no — project-owned governance; the structural counts it enforces are the repository's, and every slice's counts pass through the one check |

**The dependency declaration is one task.** `apps/api/package.json` and
`pnpm-lock.yaml` are written by **T095** and by nothing else: it adds
`aws4fetch`, `fflate`, `cfb`, and `pdf-lib` to `apps/api`'s `dependencies` and
regenerates the lockfile through the single update process, and it runs before
T024, T026, T027, and T028, which import those libraries and declare none of
them. Rows 15–17 of Complexity Tracking remain the records that authorise the
libraries; this task is the mechanical step that makes the authorisation true of
the tree.

**Structure Decision**: The intake is one owning module, `catalogs`, at
`apps/api/src/modules/catalogs/`, with the `{routes,service,repository}` layout
`docs/architecture.md` §1.1 fixes and three adapters beside them (`storage/`,
`scanner/`, `inspection/`) that exist only because the register-gap records
require them to be separable and testable. The schema is
`packages/db/schema/catalogs.ts` (one file per module) and one reversible
migration. The page is `apps/web/app/pages/upload.vue`; its door is
`apps/web/app/middleware/merchant.ts`, which carries the guest's registered
return target and treats an administrator session as a guest; the reusable
surfaces are in `packages/ui/app/components/upload/`; the page-specific outcome
panels stay in `apps/web/app/components/upload/` because they have one consumer.
The shared contracts and the format surfaces are in `packages/shared`. The
scanner and the storage adapters are the two register-gap boundaries; the
inspection set is the third. No worker, queue, search, or admin path is touched.

## Complexity Tracking

| Item | Type | Why needed | Simpler alternative rejected because | Owner | Review / restore-by date |
|---|---|---|---|---|---|
| 1. The constitution's version sources disagreed: the footer read 7.0.0 / 2026-11-12, `version.json` read 6.3.2 / 2026-11-04 / ADR-148, and the decision register's last row was ADR-165 (6.3.2). **Closed 2026-11-13**: ADR-175 amends the constitution to 7.0.0 / 2026-11-13, `version.json` moves with it, the register's last row was ADR-175 then, and `governance-drift-check.mjs` was clean. | Closed (governance) | A plan is evaluated against the document in the tree, so the disagreement had to be reported rather than amended from here; it was escalated as an amendment and closed by one. | Recording the amendment inside the plan — rejected: `/speckit.plan` does not amend the constitution, and the amendment must be ratified on its own. | repository owner | closed 2026-11-13 |
| 2. The duplicate outcome reads another merchant's catalog (FR-009). **Closed 2026-11-13**: the constitution's Schema and Migration Control now names it the single exception to the isolation rule — four fields, reachable only from that outcome, through the shared entry point — and ADR-170 and `docs/domain-model.md` carry it. | Closed (binding rule) | The File Processing Rules require the duplicate message to name the original; the read is bounded to four fields and is the one named exception. | Refusing the read and showing only "duplicate" — rejected: the constitution requires the original's name and date, and FR-044 requires the parts link. | repository owner | closed 2026-11-13 |
| 3. The upload-attempt bound (60 per 15-minute window) is CMV row 20. **Closed 2026-11-13**: the constitution's closed list now carries it in the same words — 60 attempts in a fixed 15-minute window on UTC boundaries — the plan template's row 20 matches, and this plan records it with no pending marker. | Closed (binding rule) | FR-061 requires a bound and requires the plan to record it under CMV with a decision record (ADR-168); the closed list is the only place a value may be written. | Enforcing a bound without recording it — rejected: the closed-list rule forbids a value written outside CMV. | repository owner | closed 2026-11-13 |
| 4. Principle V's no-emoji rule bound "any text a person reads", while FR-021 requires a merchant's file name carrying an emoji to be accepted and shown as supplied. **Closed 2026-11-13**: the principle bans emoji in the text the platform writes and shows, and places a value the platform receives outside the ban. | Closed (core principle) | The specification's Assumptions made the narrowing a condition before Converge; the page's own text carries no emoji. | Refusing an emoji in a file name — rejected: FR-021 and Clarifications 2026-11-12 (2) require acceptance, and the rule's subject is the platform's own text. | repository owner | closed 2026-11-13 |
| 5. The reference set captures the idle state only; the five states the slice map lists for P1 — selected, uploading (transfer and screening), success, duplicate, and error — have no reference image. | Unmet SHOULD (design evidence) | ADR-129 requires a baseline for every page state; the baselines are generated from the contract, and the reference is evidence of composition only. | Waiting for the lab to capture the states — rejected: the lab is frozen and the product's baseline is generated in the project (ADR-129). | repository owner | 2026-12-11 |
| 6. The sample evidence is PDF only: 19 PDFs, 2.28 MB average, 80.3 pages, 31.7 rows/page, 5.3% scanned; no Excel or Word sample exists. | Unmet SHOULD (evidence) | The content checks for `.xls`, `.xlsx`, `.doc`, and `.docx` are specified from the formats' signatures and containers, not from samples; R3's extraction sample must include Excel and Word (capacity model §11.1). | Claiming the sample covers the formats — rejected: the analysis records PDF only. | repository owner | 2027-01-15 (R3's sample) |
| 7. Object-storage backup and restore are not covered by any runbook; the file store has replication but no off-host backup or drill. | Unmet SHOULD (recovery evidence) | The slice introduces persistent file storage, so CMV rows 8–9 state numeric targets; the file leg is not evidenced until R12's runbook and drill exist. | Declaring the PostgreSQL runbook sufficient — rejected: it restores no file bytes. | R12 owner | 2026-12-15 |
| 8. `lighthouserc.json` asserts only `/auth/sign-up`, `/auth/sign-in`, and `/auth/forgot-password`; `/upload` is not in the set. | Unmet SHOULD (performance evidence) | The page is merchant-only and the Lighthouse preview server has no session; the page's rendering is covered by the Playwright baselines and its service bounds by the load run. | Adding `/upload` to the preview server — rejected until R12's environment provides a seeded session; the preview server is R1's and has no API. | repository owner | 2026-12-01 |
| 9. `EX-001`'s scope is reaffirmed: ClamAV is invoked as a separate scanning process over its socket, never imported as a library or bundled into the API image. | Violation (registered exception) | The scanner client is a protocol adapter over `node:net`; the ClamAV daemon runs as its own container with a pinned image digest. | Importing a ClamAV binding — rejected: the register approves the scanner as a process, and `EX-001` records that character. | repository owner | 2027-01-05 (the register's review date) |
| 10. `EX-007` closes at this slice's acceptance: the shell's runtime behaviour is verified on the first rendered page — the menu, the sidebar's two widths, the drawer's three dismissals and focus return, the bottom bar's scroll-hide, the overlay stacking, the guest redirect, the 320 px label cut, the axe scan, and the keyboard-only pass. | Unmapped work (exception closure) | R1 could not exercise the runtime lines without a page; R2 renders them and records each behaviour against the criterion beside it in the exception register. **The register's row stays Active until this slice's acceptance**: the governance change that opens `EX-013` leaves `EX-007` open, because the evidence it needs — `T082`–`T087` and `T099` — does not exist until the page and its tests run, and the register's rule 5 forbids closing a row before its evidence exists; **T111 writes the closure at acceptance** — moving the row into the Closed table with the closing date and recording, in its `How It Ended` cell, each behaviour against the criterion beside it and the evidence that proves it — rather than verifying a closure written in advance (the Forty-fifth pass). | Closing `EX-007` without the rendered evidence — rejected: the exception's scope names the behaviours and their criteria. | repository owner | 2026-12-11 |
| 11. The R2-only increment records the catalog at `uploaded`; no queue job is created and no processing status advances. | Unmet SHOULD (window) | The queue, the worker, and every status after `uploaded` are R3's (FR-047, AC-003); R2 creates no notification (R9). | Building a queue job in R2 — rejected: it would duplicate R3's pipeline and the register names no queue here. | R3 owner | 2027-01-15 |
| 12. The success outcome's `/my-files` link points at a page R4 ships; until then the platform's ordinary not-found answer appears there (roadmap **defect 1**: My Files had no owning slice before R4, which ships it). | Unmet SHOULD (window) | The route is registered in R1's route map and the link is required by FR-047; no placeholder page is added. | Omitting the link until R4 — rejected: a later slice would edit a shipped page. | R4 owner | 2027-02-01 |
| 13. The duplicate outcome's `/parts?file=<id>` link points at a page R5 ships; until then the platform's ordinary not-found answer appears there (roadmap defect 20). | Unmet SHOULD (window) | FR-044 fixes the route and the link; R5 ships the parts page with `?file=<id>` filtering. | Omitting the link until R5 — rejected: the outcome's contract requires it and the route is fixed now. | R5 owner | 2027-02-15 |
| 14. The shell's four static-page links (`/contact`, `/privacy`, `/terms`, `/faq`) point at pages R11 ships; until then the ordinary not-found answer appears there (roadmap defect 19 — its destination half closes at R10, and the four pages ship at R11). | Unmet SHOULD (window) | FR-060 requires the links at R1's routes; R11 ships the static pages. | Hiding the links until R11 — rejected: the shell's composition and FR-060 require them. | R11 owner | 2027-04-01 |
| 15. The object-storage client: `aws4fetch` (MIT), signing presigned multipart URLs and the API's `ListParts`, `HeadObject`, `CompleteMultipartUpload`, `AbortMultipartUpload`, and `DeleteObject` calls against SeaweedFS's S3 gateway. | Unmet SHOULD (register gap) | The register names SeaweedFS but no client library; the plan records the choice, the licence obligation, and the vulnerability scan before use (ADR-172), and the register amendment is due at R2's acceptance. | The AWS SDK v3 — rejected: heavier surface for six operations and a larger vulnerability base; `minio` — rejected: AGPL-3.0. | repository owner | 2026-12-11 |
| 16. The scanner client: the clamd INSTREAM protocol over `node:net`, with the 90-second budget and the fail-closed refusal. | Unmet SHOULD (register gap) | The register names ClamAV as a process but no client; the adapter is written in-house to keep `EX-001`'s boundary exact (ADR-173). ClamAV's GPL-2.0 obligation is discharged by the separate-process boundary; the daemon's image digest is pinned and scanned. | A third-party clamd client — rejected: an extra dependency for a small protocol, and no library carries the budget's error taxonomy. | repository owner | 2026-12-11 |
| 17. The content-inspection set: `fflate` (MIT), `cfb` (Apache-2.0), and `pdf-lib` (MIT). | Unmet SHOULD (register gap) | CMV row 12 requires the set; the plan records the three, their licences, and the scan before use (ADR-171), and the register amendment is due at R2's acceptance. | One all-format library — rejected: no single permissive library opens OOXML, OLE2, and PDF with the required rewrite control; Python tooling — rejected: a second runtime. | repository owner | 2026-12-11 |
| 18. The first standalone documentation-drift test is delivered here (ADR-031 item 4): it compares `apps/api/openapi.json`, the routes the app registers, and `contracts/intake-api.md` §2–§4, and runs in CI from this slice. | Unmapped work (ADR-031 item 4) | R1's generation covered its own surface; the standalone test is owed by the first feature after it, which is R2. | Leaving the test to R12 — rejected: ADR-031 names the first feature after the public interface, and R12 is not a feature surface. | repository owner | 2026-12-11 |
| 19. The load run's scanner is the deterministic double (150 ms) and the storage is a local SeaweedFS; the real daemon's throughput at 10 completions/second is measured by R12's pre-release load test. | Unmet SHOULD (verification scope) | The API's work is what the plan's budget measures; the double keeps the run deterministic and the daemon's capacity is the deployment's. | Blocking R2 on the real daemon's throughput — rejected: the capacity model's stress test is R12's, and the daemon's sizing is a deployment parameter. | R12 owner | 2026-12-15 |
| 20. The stored file is removed with the catalog row by R15's retention job; R2 implements no deletion, and a soft-deleted catalog keeps its object until the row is removed for good (FR-046). | Unmet SHOULD (window) | FR-046 states that the delete withdraws the parts, the bookmarks, and the search-index entries, and that the stored file itself is removed with the row by the retention job; the removal is R15's, so R2 records the boundary and implements no deletion. | Deleting the stored file in R2 — rejected: R2 implements no deletion (ADR-131), and the row's removal is R15's by FR-046. | R15 owner | 2027-06-01 |
| 21. **The approved exception to Principle VIII for this slice's story dependencies (final acceptance 2026-11-16).** US2, US4, and US5 are verification increments: US2 adds the safety verdicts' tests, US4 the quota boundaries' measurements, and US5 the shell's rendered verification, and none adds a production file of its own — the verdicts are T056's, the refusal presentation is T049's, the quota rules are T072–T075's, and US5 consumes R1's surfaces. US3 ships one production file, `UploadDuplicate.vue` (T066), and its tests. **The dependency runs in two directions**: the four stories' tests run over the engine US1 composes, and US1's T052 composes the duplicate block while T034 and T035 scan and baseline its presentation, so those three tasks consume T066. T066 is pulled forward and executes before T052; US3's tests still follow US1's engine. **The dependency is stated, not denied — and the two edges are the exception's whole subject**: no story after the pair is independently implementable in the strict sense, and US1's page is complete only when T066 lands; no other cross-story edge exists, and no criterion and no test is waived. **Exact scope**: the scope cell's opening clause **Closes on:** US2's AC-015 – AC-020, US3's AC-021 – AC-026, US4's AC-027 – AC-034 and AC-047 – AC-050, and US5's AC-035 – AC-046. US2, US3, US4, and US5, US3's one production file `apps/web/app/components/upload/UploadDuplicate.vue`, the three US1 tasks that depend on it — T052, T034, and T035 — and the test paths their tasks write — `apps/api/test/integration/catalogs/`, `apps/api/test/integration/http/degradation.spec.ts`, `apps/api/test/fixtures/intake/`, `apps/web/tests/unit/upload/`, `apps/web/tests/e2e/upload.spec.ts`, `apps/web/tests/e2e/__screenshots__/upload/`, and `apps/web/tests/a11y/upload.spec.ts` — over US1's engine; the acceptance ends at R2's acceptance (2026-12-11), when the evidence each story names exists. **The acceptance is final (approved 2026-11-16)**: Principle VIII is NON-NEGOTIABLE, so the deviation is not argued away and not left to a PASS the register's existence would confer: the repository owner approves it as the granted exception — `EX-013` — and rejects restructuring US2, US4, and US5 into independently implementable stories, because that restructuring would separate the safety engine from US1 and make US1 unsafe; the review date stated here (2026-12-11) is the register's escalation trigger, not a condition of the acceptance; the register entry the acceptance corresponds to is `EX-013`, appended to `.specify/templates/exception-register.md` in the governance change this plan's Twelfth pass records — the same change that closes `EX-007` by moving its row into the register's Closed table (Complexity Tracking row 10), and that raises `governance-drift-check.mjs`'s G2 exception-row count from twelve to thirteen — so the acceptance is **registered in the register now** and visible to the drift check, not promised to a later change; **T111** verifies the row, its widened scope, the closure, and the count instead of writing them. | Story dependency (accepted deviation) | Principle VIII requires each story to carry its own increment; for US2, US4, and US5 the increment is evidence over the engine US1 composes, and for US3 it is the duplicate panel plus its tests. Each is testable in its own file and delivers its value without a second implementation — but the four run over US1's engine and US1's composition consumes US3's panel, so the row states both edges rather than claiming independence. **The acceptance is test coverage, not implementation only**: the exception covers the tests the four stories write and the one component US3 ships, and it waives no test and no criterion. | Restructuring US2, US4, and US5 into independently implementable stories — rejected by the repository owner on 2026-11-16: it would separate the safety engine from US1 and make US1 unsafe, because the page and the engine that screens, refuses, records, and counts are one increment; Building a second implementation per story — rejected: it would duplicate the engine and break the single-owner rule; moving T066's task into Phase 3 — taken in the Twentieth pass, because US1's page composes the panel and the document's physical order must be its execution order; leaving T066 in US3's phase and naming the edge only in the register — rejected: US1's page would depend on a task its phase does not carry; claiming a production increment the tasks do not build — rejected: the gate row must state what `tasks.md` actually delivers; leaving either edge unstated — rejected: that is the claim Gate 1 → VIII withdrew. | repository owner | 2026-12-11 (R2's acceptance) |
| 22. The four-field health probe — `GET /health` answering `{status, database, storage, scanner}` — and the backup/restore drill's health assertion, which still reads the two-field body and must read the four-field body the platform serves. | Unmet SHOULD (evidence) | The intake adds two operational dependencies, so the health body names them; the drill's assertion must read the same body or the drill verifies a shape the platform no longer serves. | Leaving the drill on the two-field body — rejected: the drill would assert a body the platform stopped serving. | repository owner | 2026-12-11 |
| 23. **The intake's periodic sweeps are not implemented by this slice**: the removal of a workspace file whose request died (every five minutes, files older than one hour), the abort and deletion of an expired session and its staging object, the deletion of a failed session's `original_key` and `sanitized_key` before its row, and the removal of the counter rows past their window. No task in `tasks.md` runs any of them, so `data-model.md` §9 states each statement's predicate as the contract the owning slice implements, `intake-api.md` §6.3 marks the expiry transition as not taken by R2, and this plan records the state the sweep reads — the session's `state` and `url_expires_at` (T010), the recorded `original_key` and `sanitized_key` (T038), and the two counter tables' window columns. R2's own backstop is structural and needs no timer: the complete route accepts only an `open` session, every part URL expires 15 minutes after it is signed, the staging object is private and reachable by no product read, and nothing is recorded or counted before the complete request accepts. **The sweep's file-cleanup legs cover only a request abandoned before any refusal, and the one withdrawal the storage refused**: a refused file — complete or unfinished — is removed by the refusal itself before the intake answers, or, when the storage refuses the removal, by the terminal row that deletes the two keys and confirms their absence before it deletes the row, so no refused file is left to the sweep on the ordinary path; the counter rows' removal is not a file-cleanup leg. | Unmet SHOULD (deferred obligation) | The constitution's Worker durability rule names a periodic sweep of temporary workspace files; the file-processing jobs that rule speaks of are R3's, so the sweep surface belongs to the slice that owns the worker, and this slice records the contract and the state rather than claiming a sweep no task runs. | Implementing the sweeps in R2 — rejected: no task implements one and this plan adds none, so a present with no task is the defect this row removes; leaving the predicates unwritten — rejected: the owning slice would have nothing to implement against; running a sweep-on-request instead — rejected: it would add a statement and a storage call to the pre-sign path whose budget row 6 measures, and no task builds it. | R3 owner | 2027-01-15 (R3's acceptance) |
| 24. The Arabic mirror `Core-Project.txt` carries a second wording of the four catalog statuses — «تجري المعالجة» for `processing` and «مكتمل» for `completed` — against FR-044's «قيد المعالجة» and «اكتمل». The mirror is amended by a separate manual change outside this slice's artifacts; no file of R2 edits it, and the obligation is registered here with its owner so it is not lost between slices. | Unmet SHOULD (documentation debt) | The constitution's Glossary fixes the four status values and FR-044 fixes their four Arabic labels as the product's single vocabulary, and `Core-Project.txt` mirrors the register and yields to it on conflict; a second wording is the drift the mirror rule exists to prevent. | Editing the mirror from this slice — rejected: the specification makes no part of it and no file of R2 owns any part of the mirror. | repository owner | 2027-02-01 (R4's acceptance, which inherits the vocabulary) |
| 25. The Arabic mirror `Core-Project.txt` quotes a second wording of the duplicate outcome — «هذا الملف موجود في المنصة، تم رفعه بتاريخ كذا» — which names no original, states no processing status, and carries an unnamed link, against FR-044's copy, which names the original file, states its upload date and processing status, and links to its parts at `/parts?file=<original id>`. The mirror is amended by a separate manual change outside this slice's artifacts; no file of R2 edits it, and the obligation is registered here with its owner so it is not lost between slices. | Unmet SHOULD (documentation debt) | The constitution's File Processing Rules require the duplicate outcome to name the original and its upload date, and FR-044 fixes the copy, the four status labels, and the parts link; `Core-Project.txt` mirrors the register and yields to it on conflict, so a second wording is the drift the mirror rule exists to prevent. | Editing the mirror from this slice — rejected: the specification makes no part of it and no file of R2 owns any part of the mirror. | repository owner | 2027-02-15 (R5's acceptance, which ships the parts link) |
| 26. **The platform refusal catalogue's closed-set invariant**: `refusalCodes = [...authErrorCodes, ...intakeErrorCodes]` is closed at **43** (26 R1 auth codes + 17 intake codes), and the catalogue asserts one contract row and one producer per code with the exact count `authErrorCodes.length + intakeErrorCodes.length`. No requirement owns the union: FR-064 closes the **seventeen** intake causes, and AC-020 covers only the safety refusals' presentation. T013 creates the union, T019 seeds its rows, and T032 proves the invariant. | Unmapped work (closed-set invariant) | The catalogue spans two slices, so a union code without a contract row or a producer, a duplicated row, or a count other than 43 is a regression no requirement measures; `contracts/intake-api.md` §3.2 states the four-edit rule, and the union is the platform's only list that joins R1's codes to this slice's. | Asserting only the seventeen — rejected: R1's 26 codes would lose their regression guard and a stale auth row would pass; folding the union into FR-064 — rejected: FR-064's subject is the seventeen causes that carry an Arabic message in this slice, and the auth codes are R1's; opening a new FR or AC — rejected: the invariant has no merchant-visible behaviour, so the plan owns it. | repository owner | 2026-12-11 (R2's acceptance) |
| 27. **AC-028's second clause is R13's to assert**: the cap above 500 per calendar month and 1,500 active files is refused by the write that sets an override, which R13 ships with its Users page; this slice adds no administrator operation and only reads the effective limits, so no task here can observe that no such value is stored. | Unmet MUST (window) | AC-028 states the cap FR-018 fixes, and FR-018 is a binding rule, so the clause stays in the criterion; the write that can refuse an override above the cap is R13's and no R2 task owns it. | Asserting the storage refusal in R2 — rejected: R2 ships no write that stores an override, so the assertion would have no observable; narrowing AC-028 to its first clause — rejected: it would drop a rule FR-018 fixes from the criterion that states it. | R13 owner | R13's acceptance (the roadmap fixes no date for R13) |
| 28. **The analysis command in this project reads the governance artifacts beside the feature's three**: `/speckit.analyze` examines `.specify/templates/exception-register.md` and `governance-drift-check.mjs` as well as `spec.md`, `plan.md`, and `tasks.md`, and the numbers its report states are computed from the tree rather than estimated. | Scope extension (governance record) | The inherited command's scope is the feature's three artifacts, and this slice's analysis cannot be decided from them alone: the Principle VIII dependency is granted by a row in the exception register, and the artifact counts, the identifier soundness, and the `EX-###` references are decided by the drift check, so a report that read only the three files would answer a different question, and any number the check does not print would be the analyst's estimate rather than a count a reader can reproduce. | Reading the three artifacts alone — rejected: the register's `EX-013` row and the drift check's own output are the evidence the analysis rests on, and the inherited scope omits both. Estimating the counts by hand — rejected: the check prints every count the report states, so a number it does not print is recorded as an open question rather than as a finding. Forking the inherited command — rejected: the command is upstream-owned and the extension is a project practice over it, recorded here and in the decision register rather than in a copy of the command. | Repository owner | 2026-12-12 |
| 29. **The capacity model's stress case and the quota-boundary run are two distinct runs of `scripts/load/upload-smoke.mjs` and are named separately in the specification, the plan, and the tasks**, because the earlier draft gave one label to two runs and a reader could not tell which run SC-005 measures. | Plan correction (verification scope) | SC-005 measures the quota-boundary run's 600 uploads and SC-006 and SC-007 measure the load run's 3,600 page loads and 3,600 uploads; one label for two runs left a criterion's sample unidentifiable, and a criterion whose sample cannot be identified cannot be measured. | Keeping one label for both runs — rejected: the quota-boundary run is 600 uploads across 10 merchants in one fixed 15-minute window with its own sample and its own report, and the load run is 3,600 uploads over its design and stress phases, so one label covers two different samples. A second script for the quota-boundary run — rejected: both runs share one script, one seeded database, and one report format, so a second script would duplicate the harness rather than name the two runs. | repository owner | 2026-12-11 |
| 30. **The two binding rules this slice's rendered task list carries reached the template after the rendered document, not before it**: the "one owner per file" rule and the "success-criterion attribution" rule are written into `specs/002-file-intake/tasks.md`'s "Format (REQUIRED)" comment while the template that renders it, `.specify/templates/overrides/tasks-template.md`, carries rules 1 to 4 only; the template now carries both on 2026-11-16 (ADR-179), together with the three exceptions this slice's own "Dependencies & Execution Order" records — T032, a phase's guard written after the rows it reads; T035, a baseline generation task; and T112, a measurement task. | Unmapped work (governance debt) | The two rules bound every task in the list and had no source under `.specify/`; the drift check excludes the project-owned overrides from its hash check and compares no rendered `tasks.md` against the template it was rendered from, so the loss was silent and would have been repeated in every later slice. | Leaving the rules in the rendered document — rejected: `/speckit.tasks` regenerates `tasks.md` from the template, so the next feature would render rules 1 to 4 and lose both rules with nothing to catch it. Amending the rendered document and not the template — rejected: the same loss recurs with the next generation. Adding a check that compares a rendered `tasks.md` with its template — rejected: the template is the source and the rendered document is its per-feature rendering, so the source fixes the loss at its origin where a comparison would only report it afterwards. | repository owner | 2026-12-11 |
| 31. **No soak or sustained-duration run is executed in R2**: the load run's design and stress phases are 120 seconds each, and a sustained run at the design condition is R12's pre-release load test (row 19), which runs where the real scanner and the environment exist. | Unmet SHOULD (verification scope) | The intake's periodic work — a dead request's workspace file, an expired session's abort, and the counter rows past their window — is the sweep this slice does not run (row 23), so a long run would measure a path whose cleanup is absent; the sustained run belongs after the sweep and with the real daemon. | Extending R2's run to 30 minutes — rejected: without the sweep (row 23) it accumulates dead sessions and measures an incomplete system, and its scanner is the 150 ms double rather than the daemon a sustained run is meant to stress. | R12 owner | 2026-12-15 |
| 32. **Forced-colors mode and a user stylesheet are not in this slice's verification sample**: the scan and the manual pass run in the two shipped appearances, and no case forces the system's high-contrast palette or applies a user stylesheet, so the page's behaviour under either is unobserved. The gap is recorded, not claimed as covered; the page's colours come from the layer's tokens alone, and no second palette or user-style hook exists in the page. | Accepted gap (verification scope) | WCAG 2.2 AA is measured in the light and dark appearances the product ships (SC-008); a forced-colors palette or a user stylesheet is a user-agent mode outside the appearance contract, and neither is part of the constitution's required scan-and-keyboard verification. | Adding a forced-colors run to this slice — rejected: the constitution's verification obligation is the automated scan and the manual keyboard pass, the appearance contract is R1's (ADR-128), and a forced-colors case would test the user agent's palette rather than this page's composition; changing the token contract — rejected: the layer's colour authority is ADR-128 and a page does not amend it. | R1 owner (the layer's appearance contract), with R2's accessibility pass as the observation point | 2026-12-11 (R2's acceptance) |
| 33. The frame is extended by R2 although M1 records it read-only: the frame's data comes from the shared route map, and it reads the session so the header shows the merchant's account control and the menu can sign out. No runtime behaviour of the frame is rewritten, and US5's evidence is taken over the extended frame. | Unmapped work (plan amendment) | The frame's components take their data as props and R1 shipped no page that rendered it, so the first page that renders the frame must supply the session and the shared lists. | A second header on the page - rejected: it would duplicate the frame and put two account controls in one document. | repository owner | 2026-12-11 |
| 34. The token contract's test is extended by R2 although the forty-third pass records it read-only: T150 adds the focus offset and the focus colour's 3:1 contrast on both appearances' surface to `packages/ui/tests/tokens.spec.ts`, the assertions the inherited-floor proof reads. No token value is edited; the test now asserts the values the plan documents. | Unmapped work (plan amendment) | The plan's inherited-floors section names the test as the evidence for the focus trio and the touch floor, and the file asserted only the width and the touch floor, so the proof cited an assertion that did not exist. | Recording the values in prose only - rejected: a recorded value that no test asserts drifts the moment a token changes, and the token test is the layer's one guard for every recorded token. Editing the tokens - rejected: ADR-128 fixes them and the contrast passes on both shipped surfaces. | repository owner | 2026-12-11 |
| 35. **The acceptance evidence that needs the target platform and a human observer is not produced on the development host**, so five groups of tasks stay open: the **44 visual baselines** at 1280 and 375 CSS px in both appearances, which the plan generates in CI with the Playwright-pinned Chromium and the self-hosted fonts (T035, T135, T157, T172, T182, T192, T205, T217, T228, T240); the **manual keyboard-only pass** with NVDA on Windows 11 at 320 and 1280 CSS px, which Principle IV makes manual (T114, T116, T163, T179, T181, T191, T204, T216, T227, T239); the **14-scenario quickstart run**, whose Scenario 11 is that pass and whose Scenario 14 is the load run (T090, T134, T160, T176, T187, T201, T213, T223, T236, T248); the **load and quota-boundary measurement records** (T091, T096, T100, T101, T140, T143, T144, T146, T161, T177, T185, T186, T199, T200, T212, T222, T235, T247); and the **two accessibility gates** that close on the pass (T089, T132). The host is Windows and carries no Linux distribution (WSL holds none), no container runtime, and no observer with NVDA. **Executed on 2026-11-20 and recorded under `reports/`**: the quota-boundary run meets SC-005's three ratios at 100% (`sc-005-quota-boundary.json`, `sc-005-boundary-measure.json`), though its refusal-cause leg does not, so `T096` and `T140` stay open; the acceptance sample meets SC-004, SC-011, and SC-012 (`sc-004-duplicates.json`, `sc-011-accepted.json`, `sc-012-quota-agreement.md`) and measures SC-013's two ratios at 100% (`sc-013-operational-record.json`) with all five outcomes FR-062 names, the `failed` outcome included, so `T098` and `T142` close; the changed-line gate measures 86.45% of 1,683 changed lines against its 80% floor (`coverage/changed-lines.json`); and the automated accessibility suite passes all 44 scans with zero violations, including one complete keyboard-only upload and the two live regions' single announcement (`sc-008-accessibility.json`). **The load run was executed, its numbers are recorded, and they do not satisfy the criteria**: `sc-005-upload-load.json` reports 1,200 design page loads at p95 11,832 ms and 2,400 stress page loads at p95 31,020 ms against SC-006's 2,000 ms, quota reads at p95 11,802 ms and 30,970 ms against CMV row 6's 500 ms, pre-sign requests at p95 16,403 ms and 25,803 ms against 800 ms, and completions at p95 36,171 ms and 111,267 ms against 10,000 ms; the host is one Windows machine carrying PostgreSQL, SeaweedFS, the API, the web server, and 300-600 concurrent clients, not the Linux VPS the plan names, so the numbers measure the host's ceiling and no ratio is claimed for SC-006 or SC-007. **The harness now records both criteria in the browser**: SC-006's first-frame-in-a-fresh-browser-context instrument and SC-007's selection-to-outcome interval are implemented in `scripts/load/upload-smoke.mjs` (T249, T250), with the probes in `scripts/load/page-load-probe.mjs`, so both criteria can be read against the run once it executes at the plan's conditions on the Linux target platform; the run executed on this host still measures the host's ceiling, and no ratio is claimed for either. | Unmet MUST (verification environment) | SC-006, SC-007, and SC-008 name samples and instruments this host cannot produce - a Linux renderer for the baselines, a human NVDA observation for the pass, and the target platform's capacity plus a browser-rendered load for the two service criteria - and the records that exist are committed beside the criteria rather than replaced by a claim. | Marking the tasks complete on the development host - rejected: no committed baseline, no observer's record, and no passing load record would exist, which is the defect the criteria exist to catch; generating the 44 baselines on Windows - rejected: the plan generates them in CI with the pinned Chromium, and a set rendered on another platform would diff against the CI renderer on every run; claiming the load run at the plan's condition - rejected: its page-load p95 is nearly six times SC-006's bound in the design phase and more than fifteen times that bound in the stress phase, so a PASS would hide the host's ceiling; narrowing SC-006 or SC-007 to the HTTP intervals the harness measures - rejected: the criteria fix the browser render and the selection-to-outcome interval, and a criterion rewritten to match its instrument measures nothing the merchant sees. | repository owner | 2026-12-11 (R2's acceptance; the evidence is produced on CI and on the Linux target platform before it) |

**Rows 1–4 are closed by the 7.0.0 amendment (ADR-175) and are kept in place,
marked closed, so the identifiers the gate rows and `tasks.md` cite do not move.
Rows 5–21 are recorded windows, register-gap records, and verification
increments; none is a newly accepted product limitation beyond the
specification's own Assumptions. Row 20 joins rows 11–14 as a window row: it
records a boundary another slice owns, not a limitation this slice accepts. Row
21 is the **one accepted deviation from a NON-NEGOTIABLE principle**: US2, US4,
and US5 deliver their increment as evidence over US1's engine, with no
production file of their own; US3 ships the duplicate panel US1's page
composes; and the acceptance — the principle, the exact scope, the rationale,
the approver, the approval date 2026-11-16, the review date, and the register identifier `EX-013` — is
recorded there; the repository owner rejected the alternative of restructuring US2,
US4, and US5 because it would separate the safety engine from US1 and make US1
unsafe. The governance change this plan's Twelfth pass records opens
`EX-013` in the Active table of `.specify/templates/exception-register.md`,
**leaves `EX-007` in the Active table** — open until this slice's acceptance,
when `T111` writes its closure with the rendered evidence `T082`–`T087` and
`T099` (row 10) — raises
`governance-drift-check.mjs`'s G2 exception-row count from twelve to thirteen —
the register's row count after the addition, eight Active and five Closed — adds
the check (G12)
that every `EX-###` reference resolves to a register row in either table, with
that same eight-and-five split as its expectation, and
qualifies the five identifiers `EX-007` names that this slice's specification
also defines — `AC-024`, `AC-042`, `AC-051`, `SC-005`, and `SC-006` — with
their `001-identity-foundation` prefix. **The Twentieth pass widens the row and
the register entry to US3, to the three US1 tasks that consume T066 (T052, T034,
T035), and to the execution order (T066 before T052), and records that the
acceptance is test coverage and one component, not implementation only.**
**T111** now writes that one closure at acceptance — it moves `EX-007` into the
Closed table, records each behaviour against its criterion beside the evidence,
and verifies `EX-013`'s presence in the Active table, its widened scope, the
approval, and the G2 count at thirteen — which is why Gate 1 → VIII reads PASS on the owner's final acceptance
of 2026-11-16. **The Twenty-ninth pass adds the row's `Closes on:` clause, with
US4's full set — AC-027 – AC-034 and AC-047 – AC-050 — and the seventh test path,
`apps/web/tests/e2e/__screenshots__/upload/`, which T035 writes; the register's
row is amended by the repository owner in the same change.**
Row 22 records the four-field
health probe and the backup drill's assertion: both are this slice's own tasks
(T021 and T088), so the row records work rather than an evidence gap. Row 7 is
the only recovery-evidence gap that remains; row 6's sample-evidence gap (PDF
only) is recorded beside it, and row 7 is **explicitly accepted** with R12
as the owner of the closing work and 2026-12-15 as its review date. Row 23
records the intake's periodic sweeps: no task in this slice runs one, so the
Technical Context, the Constraints, `data-model.md` §9, `intake-api.md` §6.3,
and the threat map state them as deferred and point at this row rather than
describing a present that no task builds. Row 24 records the Arabic mirror's
second wording of the four status labels — the mirror is amended by a separate
manual change outside this slice's artifacts, so no task in `tasks.md` edits it,
and the obligation is registered here with its owner and its review date so it
is not lost between slices. Row 25 records the mirror's quoted duplicate
message, registered the same way: FR-044's copy names the original, its upload
date and processing status, and the parts link, while the mirror's sentence
names no original, states no processing status, and carries an unnamed link; the
mirror is amended by the same separate manual change, and the row carries the
owner and the review date. Row 26 records the platform refusal catalogue's
closed-set invariant: the union is closed at 43 (26 + 17) and the catalogue
asserts one contract row and one producer per code, while FR-064 closes only
the seventeen intake causes and AC-020 only the safety refusals' presentation, so
the union has no requirement and the plan owns it. T013 and T019 cite FR-064 for
the seventeen-code set, and T032 cites this row rather than AC-020. Row 27
records AC-028's second clause: the cap above 500 per calendar month and 1,500
active files is refused by the write that sets an override, which R13 ships
with its Users page, so no task in this slice can observe that refusal and the
clause stays in the criterion unchanged; the owner is the R13 owner and the
review is at R13's acceptance.** Row 28 records the analysis command's scope in
this project: `/speckit.analyze` reads `.specify/templates/exception-register.md`
and `governance-drift-check.mjs` beside the feature's three artifacts, and the
numbers its report states are computed rather than estimated; the decision, its
owner, and its review date are recorded in ADR-177, so one reference explains the
extension where none did before. Row 29 separates the capacity model's stress case
from the quota-boundary run; row 30 records the task-template governance debt;
row 31 records the absent soak run; and row 32 records forced-colors mode and a
user stylesheet as an accepted verification gap, with R1's appearance contract
as the owner and R2's acceptance as the review date.

## Specification Detail Owned Here (Principle VII, 2026-11-13)

The 2026-11-13 refinement of `spec.md` removed every plan directive and
implementation detail from `FR-009`, `FR-029`, `FR-061`, and `FR-062`, and moved
the assumption that the antivirus scan is an external process here. Nothing was
dropped: each requirement keeps its identifier and its product behaviour, and
the detail below is owned by this plan, where Principle VII places it. The
closed values, decision records, and register-gap rows these notes name are the
ones recorded above in Constitution Mandated Values and Complexity Tracking;
this section states each obligation in one place so no step is built on a
capability whose record does not exist.

- **FR-029 — the screening pipeline's capabilities.** The technology register
  names none of the capabilities the pipeline needs. The content-inspection set
  is closed under Constitution Mandated Values row 12 (`fflate`, `cfb`,
  `pdf-lib`, with ADR-171); the object-storage client and the scanner client are
  closed in Complexity Tracking rows 15 and 16 (ADR-172, ADR-173). Each record
  carries an ADR, a licence-obligation record, a vulnerability scan, and a
  review date, and no step is built on a capability whose record does not yet
  exist. The specification keeps only the ordered checks and the outcome that a
  file which does not pass every step is not kept.
- **FR-061 — the attempt counter's storage.** The counter lives outside the
  account row, in the module that owns quota enforcement, beside the monthly
  counter (`catalog_upload_attempts` in `data-model.md`). This plan records its
  storage with a decision record and a `docs/domain-model.md` amendment, and the
  entity register and the account's registered fields do not change. The bound
  and its window are CMV row 20 (60 attempts per 15-minute fixed window, on UTC
  boundaries), and the constitution's closed list and the plan template's table
  carry the same entry — the amendment that added it landed on 2026-11-13 as
  7.0.0 (ADR-175), with ADR-168 recording the counter.
- **FR-062 — the operational record's realization.** The record is a structured
  log line kept under the platform's log policy: no table and no entity is
  introduced for it, its retention is the log policy's rather than a window of
  its own, and a surge of refusals and a scanner that cannot run are detected
  from its counts by cause. This plan records the decision and the log policy it
  follows. The specification keeps the record's field set, its prohibition on
  identifying values, the detectability of those conditions, and the absence of
  any merchant-facing surface.
- **FR-050 — the departure's mechanics and its backstop.** What the merchant
  observes is FR-050's; the two mechanisms are this plan's. The client stops its
  in-flight part writes by calling `abort()` on each part's own
  `XMLHttpRequest` — the transport is `XMLHttpRequest` because it reports the
  upload progress the page's percentage is drawn from and `fetch` does not, so
  the request object's own `abort()` is the one mechanism — and while the
  progress state is the transfer phase a `pagehide` listener sends
  `DELETE /api/v1/uploads/{uploadId}` with `keepalive` and R1's CSRF token —
  bodyless, so the request survives the document that sent it. The server answers
  it by aborting an `open` session only; `completing`, `done`, `failed`, and
  `aborted` are a `204` no-op, because a finished transfer is the platform's work
  and a beacon that races it must not undo it. When the request never arrives the
  backstop is structural: `contracts/intake-api.md` §2.3 accepts only the caller's
  `open` session, every part URL expires 15 minutes after it is signed, the
  staging object is private and reachable by no product read, and nothing is
  recorded or counted before acceptance. The sweep that would reclaim an
  abandoned multipart is **not** this slice's (row 23); what this slice
  guarantees is that the abandoned object can never become a catalog, a quota
  entry, or a page's content.
- **FR-009 — the duplicate outcome's bounded read.** The one exception to the
  merchant-isolation rule is realized as a bounded projection over exactly four
  fields — the original's name, its upload date, its processing status, and the
  identifier the parts link needs — so no other field of the original and no
  record of its owner is reachable. The exception is registered in the three
  places the specification requires: the constitution's isolation rule names it
  the single exception (7.0.0, ADR-175), `docs/domain-model.md` carries it, and
  ADR-170 records it; the Constitution Check's Gate 2 states the same. The
  specification states only what the merchant may see.
- **The antivirus scan is an external process** invoked at upload time, not a
  library imported into the API (`EX-001`, Complexity Tracking row 9). Its
  unavailability is a fail-closed refusal (FR-033), and this plan records the
  operational dependency and the capability check that proves it: the clamd
  INSTREAM adapter over `node:net`, the separate daemon with its pinned image
  digest, the 90-second budget, and the `/health` probe and degradation suite
  named in Verification Notes and the threat map.
