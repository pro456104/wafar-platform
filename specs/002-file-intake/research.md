# Phase 0 Research — File Intake

**Feature**: `002-file-intake` | **Date**: 2026-11-13 | **Plan**: [plan.md](./plan.md)

The specification's Clarifications section is the authority for product
behaviour; this file decides the technical shape. Every unknown in the Technical
Context is resolved here, and every value the plan records under Constitution
Mandated Values has its rationale below.

## R-01 — The transport: presigned multipart straight to object storage

**Decision**: the page asks the API for an upload session; the API validates the
declared file, enforces the quota and the attempt bound, creates an S3 multipart
upload on SeaweedFS, and returns the upload's identifier and one presigned URL per
part. The browser PUTs each 8 MB part directly to SeaweedFS with `XMLHttpRequest`
(it reports upload progress; `fetch` does not), then sends the part numbers and
ETags to the API's complete endpoint. The API completes the multipart, screens
the object, and writes the kept file.

**Rationale**: `docs/architecture.md` §3 fixes the presigned multipart stream and
the rule that the API does not buffer a file (ADR-180 records the bounded
reading: the transport legs stream, and the inspection steps read one bounded
working copy of the compressed file, at most the 100 MB ceiling). The capacity model's 0.68–1.37 GB
of bytes in flight at 300–600 concurrent uploads assumes the API is not carrying
them. A single presigned PUT would not give progress or a bounded part size; a
proxy through the API would double the ingress and put a 100 MB body in the
request path.

**Alternatives considered**: a single presigned PUT (no progress, no part-level
retry); an API-proxied upload (the architecture and the capacity model both
reject it); a third-party upload service (no register row, a second failure
domain).

## R-02 — The intake's lifecycle: one synchronous complete request

**Decision**: `POST /api/v1/uploads/{id}/complete` completes the multipart,
streams the object through the content checks, writes the sanitized file, hashes
it, and creates the record — all inside the request. It answers the outcome
(201 created, 200 duplicate, or a refusal). The handler does not bind its work to
the request's abort signal after the transfer: a page that navigates away during
the screening phase does not cancel it, and the record still appears in My Files
(FR-050). The page shows the indeterminate «جارٍ فحص الملف» phase while the
request is in flight.

**Rationale**: no queue exists before R3, and the specification forbids R2 from
creating one; a background in-process task would have no durable state and no
restart story. The synchronous request's duration is bounded by the scan budget
(90 s) plus the sanitizer's work, and the response is the outcome the page needs.
A client that disconnects does not stop a Node handler that has already read its
request; the work continues and the response write fails harmlessly.

**Alternatives considered**: a 202 + polling endpoint backed by the session row
(a second state machine and a restart story for work that is already bounded);
enqueuing a BullMQ job (R3 owns the queue and the register names no queue here); a
web worker in the page (the screening is server-side).

## R-03 — The content-inspection set and the format table

**Decision**: `fflate` (OOXML), `cfb` (OLE2), and `pdf-lib` (PDF), with Node's
`crypto` and `zlib`. Each format has a row in `contracts/intake-formats.md`:
extension, canonical content type, signature or container probe, document-type
probe, sanitizer rules, and cap measurement. The document-type probe reads the
container, not only its signature: OOXML's `[Content_Types].xml` and part names,
OLE2's stream names, and the PDF's document catalog.

**Rationale**: FR-027 requires the document type inside the container; a
family-level signature cannot tell a Word document named `.xls` from an Excel
workbook. The three libraries are permissive, small, and each is the narrowest
tool for its container. The set is CMV row 12 and ADR-171; the licence and scan
records are in the plan's Complexity Tracking.

**Alternatives considered**: a single multi-format library (none has the rewrite
control); a LibreOffice converter (a second runtime and a broad attack surface);
a Python toolchain (a second runtime); a commercial disarm service (an external
dependency in the fail-closed path).

## R-04 — The decoded-size cap and its measurement

**Decision**: 1 GiB of decoded content per file, measured by streaming decode
and stopped at the cap. OOXML members are measured from the central directory
and then inflated; OLE2 streams from the compound-file directory; PDF streams
through `zlib`. The measurement runs before and after sanitization. The cap is
enforced during the streaming read, not by allocating the decoded size.

**Rationale**: a zip bomb's compressed size is small by construction; the rule
measures what a file decodes to. 1 GiB sits above the expansion of a legitimate
100 MB OOXML file and below the workspace's practical bound. Streaming keeps the
process's memory independent of the file's expansion.

**Alternatives considered**: 500 MB (too low for a legitimate 100 MB file);
2 GiB (doubles the worst case for no product gain); compressed-size-only (does
not measure the bomb); a memory limit (the intake streams, so memory is not the
bound).

## R-05 — The sanitizer's rewrite and the re-open

**Decision**: the sanitizer writes a new object rather than editing in place:
OOXML's archive is rewritten without the macro part and its relationships and
content-type overrides, and without executable embedded objects; OLE2's compound
file is rewritten without the macro storage and executable objects; the PDF is
rewritten without JavaScript, automatic and launch actions, embedded files, and
XFA. The sanitized object is reopened as its declared format before the record is
created; a file that no longer opens is the sanitization-failed refusal.

**Rationale**: FR-032 requires the kept file to carry no executable content and
to reopen; an in-place edit of a ZIP or a PDF risks a half-written object, and a
new object makes the withdrawal path a delete of the original. The re-open is the
proof that the kept file is readable.

**Alternatives considered**: editing in place (a crash leaves a corrupt kept
file); keeping the original and a manifest of removed items (the original's
executable content is still stored, which FR-030 forbids); stripping only macros
(FR-032's wider set).

## R-06 — The hash and the duplicate conflict

**Decision**: SHA-256 over the sanitized bytes, computed while the object is
written. The uniqueness is a partial unique index over `deleted_at IS NULL`; the
insert is the duplicate check. On `23505`, the service reads the original through
the four-field projection, deletes the just-written object, and returns the
duplicate outcome.

**Rationale**: FR-041 hashes the kept bytes; FR-045's race needs a database
decision, not a service pre-check; FR-046's re-upload after a delete needs the
partial predicate. The conflict is the only place the cross-merchant projection
is reachable (ADR-170).

**Alternatives considered**: a service pre-check (loses the race); a plain unique
constraint (refuses the FR-046 re-upload); hashing the uploaded bytes (the kept
file is the sanitized one).

## R-07 — The monthly counter and Libya's calendar month

**Decision**: `catalog_monthly_uploads` keyed by `(user_id, month_start)`, where
`month_start` is the first day of the month in `Africa/Tripoli`, computed from
the injected clock by `packages/shared/src/format/month.ts`. Acceptance
increments it in the record's transaction; a missing row reads 0; rows older than
the previous month are swept.

**Rationale**: FR-011 forbids reading a soft-deleted catalog and requires the
count to survive a deletion; a persisted counter is the only storage that does
both. Computing the month from the injected clock keeps the boundary testable and
matches R1's clock discipline; `Africa/Tripoli` is the product's local time.

**Alternatives considered**: counting catalog rows including deleted ones
(forbidden by FR-011); an append-only event table (a second record, more I/O);
Redis (not a system of record); a column on `users` (the account's registered
fields do not change).

## R-08 — The atomic quota and the per-merchant lock

**Decision**: the acceptance transaction takes
`pg_advisory_xact_lock(hashtextextended($userId, 0))`, re-reads the monthly
counter and the active count, inserts the record, and increments the counter. A
merchant's intake acceptances therefore serialize, and the active count cannot be
raced by two uploads that each saw a free slot. The lock is released at the
transaction's end; a collision between two merchants only serializes unrelated
work.

**Rationale**: FR-014 requires atomicity; the active count is a `COUNT` over
rows, which a row lock cannot protect, and a unique constraint cannot express
"at most N rows". The advisory lock is per merchant and cheap.

**Alternatives considered**: `SELECT … FOR UPDATE` on the counter row (does not
cover a month boundary, where two uploads lock different rows); a serializable
isolation level (a retry loop on every acceptance); a per-merchant lock table (a
row to create and clean, and the advisory lock needs no storage).

## R-09 — The attempt window

**Decision**: 60 attempts per fixed 15-minute UTC window, counted in
`catalog_upload_attempts`, incremented at pre-sign after the file-level checks
and the quota read, before the multipart upload is created. The refusal's
`Retry-After` is the seconds to the next boundary.

**Rationale**: FR-061 requires a bound that does not count file-level or limit
refusals and does not extend its own wait; a fixed window is the shape R1's
rate-limit store uses, and 60 covers a merchant uploading the monthly 50 in one
sitting plus retries. The counter is per merchant and outside the account row, as
FR-061 requires.

**Alternatives considered**: 20/15 min (blocks a legitimate 50-file sitting);
120/hour (a wait of nearly an hour); a sliding window (a second algorithm and a
per-attempt history).

## R-10 — The duplicate projection and the isolation test

**Decision**: `findRetainedDuplicate(hash)` returns `id`, `file_name`,
`uploaded_at`, and `status` only; it is called only after the `23505`; the
isolation suite admits it as `DUPLICATE_PROJECTION` and fails on a wider
projection or a second cross-merchant path.

**Rationale**: FR-009 and FR-044 require the original's name, date, status, and
parts identifier, and nothing else; the test's allowlist makes the exception a
checkable boundary rather than a comment. The authorization model is R13's, so
the exception is recorded under the isolation rule, not the permission model.

**Alternatives considered**: a generic "duplicate exists" message (violates the
constitution's File Processing Rules); resolving the original on the parts page
(a second cross-merchant path); copying the original's fields onto the attempt (a
second source that drifts).

## R-11 — The refusal union and the catalogue test

**Decision**: a second closed set, `intakeErrorCodes`, in
`packages/shared/src/refusals/intake.ts`; a platform union
`refusalCodes = [...authErrorCodes, ...intakeErrorCodes]` and
`RefusalCode = AuthErrorCode | IntakeErrorCode`; `refusals` in
`apps/api/src/http/errors.ts` becomes a `Record<RefusalCode, RefusalSpec>`. The
catalogue test reads both contracts, asserts one producer per code, one row per
code, and no code outside the union, and its exact-count assertion becomes the
sum of the two closed sets (26 + 17 = 43: the seventeen `UPLOAD_*` codes
`contracts/intake-api.md` §3.1 lists, plus R1's 26 auth codes, four of which an
intake route's page renders — `NOT_FOUND`, `CSRF_FAILED`, `PAYLOAD_TOO_LARGE`,
and `INTERNAL_ERROR` — and which add no eighteenth intake code). R1's 26 codes
and their rows are unchanged. The union invariant is Complexity Tracking row
26's, because no requirement owns the 43-code count.

**Rationale**: the union must stay closed and the catalogue must fail on a code
without a producer. A second set keeps R1's identifiers stable and lets the
catalogue name each set's contract. Renaming `AuthErrorCode` would touch every R1
import for no product gain.

**Alternatives considered**: widening `authErrorCodes` in place (the name would
lie and the R1 contract's section number would move); a separate error envelope
for intake (the page would carry two error shapes).

## R-12 — The health probe and the runbook

**Decision**: `/health` answers `{status, database, storage, scanner}`: `SELECT 1`
on PostgreSQL, a signed `HeadBucket` on the configured SeaweedFS bucket, and a
clamd `PING`/`PONG`, each bounded at 1 s; 200 `ok` only when all three answer;
503 `degraded` with the failing field when one does not. The degradation suite
stops each dependency and asserts the body and the status. `docs/runbooks/
backup-restore.md`'s drill assertion moves to the four-field body.

**Rationale**: the constitution requires a health check per used dependency; the
intake cannot serve without either service, and the probe is the operator's
signal. The drill's assertion must read the new body or the drill fails against a
healthy API.

**Alternatives considered**: a 200 with `degraded` for a non-database dependency
(contradicts R1's 503 semantics and hides the outage from a readiness probe); a
separate `/health/ready` endpoint (a second interface with no consumer before
R12); no storage/scanner probe (the constitution's rule).

## R-13 — The first standalone documentation-drift test

**Decision**: `scripts/check/documentation-drift.mjs` (dependency-free Node, like
`governance-drift-check.mjs`) compares three records: the emitted
`apps/api/openapi.json`, the routes the Hono app registers, and
`contracts/intake-api.md` §2–§4. It fails on a route without a document entry, a
document entry without a route, a documented status or refusal code the
implementation does not produce, or a path/method mismatch. It runs in CI from
this slice (ADR-031 item 4).

**Rationale**: ADR-031 names the first feature after the public interface as the
owner of the standalone test; R1's generation covers R1's own surface, and R2's
routes are the first added after it. The test reads the contract's tables rather
than a second hand-written list.

**Alternatives considered**: extending the OpenAPI generator's own test (that is
generation, not drift); a schema-diff tool (a dependency for a comparison the
contract's tables already express); leaving it to R12 (ADR-031 names the first
feature).

## R-14 — The UI layer's components and the state machine

**Decision**: the layer gains `WfUploadControl` (drop area on a fine pointer, one
56 px action on a coarse pointer), `WfSelectedFile` (the card, using
`WfFileName`), `WfUploadProgress` (determinate transfer and indeterminate
screening, with the single cancel control), and `WfQuotaBlock` (used/limit,
loading, read failure, exhausted content). The page owns the state machine
(`idle → selected → uploading → screening → success | duplicate | error |
quota-exceeded`), the outcome panels, and the copy. The components consume the
layer's tokens; a missing token is added to `tokens.css` with the component.

**Rationale**: the roadmap's first-obligations row assigns the upload-with-
progress surface to the layer, and the page must not build a parallel control.
The state machine is page-specific (the same components serve R4's table later).

**Alternatives considered**: one mega-component for the whole page (the
page-specific outcomes would enter the layer); page-local copies (a parallel
control); a headless state machine package (a new package and a second consumer
that does not exist).

## R-15 — The load condition and the measurement

**Decision**: 300 concurrent transfers, 10 pre-sign requests/second, 10
completed intakes/second for 120 s, with 10,000 accounts and 50,000 catalogs
seeded; the second phase doubles them (600 / 20 / 20). The scanner is the
deterministic double at 150 ms; the storage is a local SeaweedFS. The run reports
p50/p95 per path, the slowest query, and the outcome counts; the design and
stress phases fail on any refusal other than the fixture's expected duplicate,
and the run fails on a query above 100 ms p95 or on a percentile above CMV row 6
at either condition, the row's values being the same at both conditions.
The quota-boundary run is a separate run of the same script, not a phase of the
load run: it expects one acceptance and 59 limit refusals per merchant and
records the counts by cause against SC-005.

**Rationale**: 300 concurrency × a 30-second average transfer is 10
completions/second, which matches the capacity model's design envelope and its
stress case at the doubled figures. The rate is a burst the monthly envelope
admits: the 350,000 monthly uploads average about 0.14/second, and the run's
1,200 intakes are 0.34% of the month. The double makes the run reproducible; the
real daemon's throughput is R12's deployment measurement.

**Alternatives considered**: the monthly average (0.135 uploads/second — too low
to measure a peak); a single-request latency test (no concurrency); the real
scanner (a shared, stateful daemon and a non-deterministic scan time).

## R-16 — The scan budget

**Decision**: 90 seconds from the first byte sent to the verdict; one attempt per
request; a timeout, connection failure, protocol error, or `ERROR` is the
scan-unavailable refusal.

**Rationale**: a 100 MB file at ClamAV's typical throughput is tens of seconds on
a loaded host; 90 s bounds the complete request while leaving the daemon room. A
scan that exceeds it is treated as one that could not run, as FR-033 requires,
and the page's retry is the same-file retry.

**Alternatives considered**: 30 s (too tight for a 100 MB file under load); no
budget (the page would wait without a bound); a per-attempt retry inside the
request (the spec's retry is the page's, and a second attempt doubles the
latency).
