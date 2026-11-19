# Contract — File Intake HTTP API

**Feature**: `002-file-intake` | **Date**: 2026-11-13 | **Plan**: [plan.md](../plan.md) | **Data model**: [data-model.md](../data-model.md)

The public HTTP surface of the `catalogs` module's intake, and the extension of
the readiness probe the slice's two new dependencies require. Every route below
is R2's own under `/api/v1`, except `/health`, which is unversioned. The file's
bytes never pass through the API: the browser writes them to SeaweedFS through
presigned part URLs, and the API reads the completed object server-side
(research R-01, R-02).

Page copy is **not** in this contract. A response carries a stable machine code;
the web maps each code to one Arabic string recorded in
[`ui-contracts.md`](./ui-contracts.md). One code therefore has one text, which is
what makes the same cause receive the same message everywhere.

## 1. Conventions

| Concern | Rule |
|---|---|
| Base path | `/api/v1`; the health probe is `/health`, unversioned |
| Media type | `application/json; charset=utf-8` on every request and response with a body |
| Field naming | `camelCase` in JSON; `snake_case` in the database (data-model §2–§5) |
| Identifiers | Opaque strings; a client never parses one. `uploadId` is the intake session's identifier, never the S3 multipart id |
| Dates | RFC 3339 with milliseconds and `Z` |
| Success body | The resource or the outcome object itself; no wrapper |
| Error body | R1's envelope, `{ "error": { "code", "retryable", "field"?, "reason"?, "retryAfterSeconds"?, "details"? } }` (contracts/auth-api.md §3) |
| Cache | `Cache-Control: no-store` on every `/api/v1` response and on `/health` |
| Correlation | `X-Request-Id` echoed when supplied and generated otherwise; the only identifier a log line and a response share |
| Body size | 16 KB per JSON request; the file's bytes never enter an API request body |
| Unknown route / method | `404 NOT_FOUND` / `405 METHOD_NOT_ALLOWED` (R1's transport answers) |
| Encoding | UTF-8 throughout. A file name is stored and compared **as supplied**: it is never NFC-normalized, trimmed, or rewritten (FR-036); only the extension's ASCII letters are case-folded for the format check |
| Session | Every route requires an active merchant session; an absent or ended session is `401 SESSION_ENDED`, a blocked account `401 ACCOUNT_BLOCKED`, and a session on a merchant-only route whose account is an administrator is answered `401 SESSION_ENDED` — the merchant area's door never reveals an administrator state (FR-002) |
| CSRF | Every state-changing route requires R1's `X-Wafar-CSRF` token and allowlisted `Origin` (§2.1 of R1's contract); a failure is `403 CSRF_FAILED` and reaches no service code |

The Zod schemas live in `packages/shared/src/contracts/catalogs.ts`; the closed
intake code set lives in `packages/shared/src/refusals/intake.ts`; both are
imported by the web client and the API, so a shape has one source (Principle II).

### 1.1 Why the file's bytes are not an API request

`POST /api/v1/uploads` answers with one presigned URL per part. The browser PUTs
each part straight to the S3 gateway with `XMLHttpRequest`, then sends the part
numbers and ETags to the complete route. The API's 16 KB body limit therefore
never sees a file, the API's memory is independent of the file's size, and the
capacity model's in-flight byte envelope holds (research R-01). A presigned URL is
the authorization for exactly one key, one part number, one `Content-Length`, and
the expiry §2.2 records; it carries no cookie, no CSRF token, and no session.

**The transport is `XMLHttpRequest`, and that fixes how a transfer is stopped.**
One request carries one 8 MB part, and the page reads the transfer's percentage
from that request's own progress event — `fetch` reports no upload progress, so
it is not the transport here. A part write in flight is stopped by calling
`abort()` on that part's request object, and the page keeps its in-flight
requests so the cancel control and §2.4's `pagehide` listener can abort each of
them. A part write that reports no progress for the plan's stall bound is stopped
the same way and answered as §2.3's transfer failure, not as a cancel: the
merchant did not cancel and no departure occurred. The only `fetch` the page sends is §2.4's bodyless departure beacon, which
carries `keepalive` so it survives the document that sent it; it carries no file
byte and stops no part.

## 2. Routes

| Method | Path | Success | Refusals (besides the session's and `INTERNAL_ERROR`) |
|---|---|---|---|
| `GET` | `/api/v1/catalogs/quota` | `200` quota | none |
| `POST` | `/api/v1/uploads` | `201` upload session | `UPLOAD_INVALID_REQUEST`, `UPLOAD_INVALID_NAME`, `UPLOAD_UNSUPPORTED_FORMAT`, `UPLOAD_TOO_LARGE`, `UPLOAD_EMPTY`, `UPLOAD_MONTHLY_LIMIT`, `UPLOAD_ACTIVE_LIMIT`, `UPLOAD_TOO_MANY_ATTEMPTS`, `UPLOAD_STORAGE_UNAVAILABLE` |
| `POST` | `/api/v1/uploads/{uploadId}/complete` | `201` accepted, `200` duplicate | `NOT_FOUND`, `UPLOAD_INCOMPLETE`, `UPLOAD_EMPTY`, `UPLOAD_TOO_LARGE`, `UPLOAD_CONTENT_MISMATCH`, `UPLOAD_CORRUPT`, `UPLOAD_PASSWORD_PROTECTED`, `UPLOAD_SCAN_UNAVAILABLE`, `UPLOAD_INFECTED`, `UPLOAD_EXPANSION_CAP`, `UPLOAD_SANITIZATION_FAILED`, `UPLOAD_STORAGE_UNAVAILABLE`, `UPLOAD_MONTHLY_LIMIT`, `UPLOAD_ACTIVE_LIMIT` |
| `DELETE` | `/api/v1/uploads/{uploadId}` | `204` | `NOT_FOUND` |
| `GET` | `/health` | `200` healthy | `503` degraded (not an error envelope) |

### 2.1 `GET /api/v1/catalogs/quota`

The page's one read before its first submission (FR-010, FR-015).

- **200**
  ```json
  {
    "monthly": { "used": 12, "limit": 50 },
    "active": { "used": 34, "limit": 300 }
  }
  ```
- `used` is the persisted per-merchant monthly counter for the current
  `Africa/Tripoli` month (ADR-167) and the count of the merchant's non-deleted
  catalogs; both are the caller's alone (FR-009, FR-012).
- `limit` is the merchant's effective limit: the default, or the
  administrator-granted override, never above the ceiling (FR-018, ADR-118).
- `used` may exceed `limit` after a lowered quota; the route does not clamp it and
  does not refuse (FR-019).
- No CSRF (a safe read); the response is `no-store` and carries no count the
  caller cannot see.
- The read is three statements: the month's counter row, the active count, and the
  account's two overrides (data-model §7).

### 2.2 `POST /api/v1/uploads`

Starts one upload: validates the declared file, decides both limits, counts the
attempt, and creates the multipart upload (FR-013, FR-021–FR-026, FR-061).

**Request** — `StartUploadRequest`

```json
{ "fileName": "كتالوج المورد.xlsx", "byteSize": 2411724 }
```

- `fileName` is required and is the name the browser reports. An empty string is
  a present, correctly typed value, so it is refused by the name check, not by
  the request shape (§4.1 steps 2–3).
- `byteSize` is required and is the file's size in bytes, as the browser reports
  it. The server never trusts it as the size of the kept file: the object's head
  is re-checked at §2.3, so a client that reports a size it does not upload is
  refused `UPLOAD_INCOMPLETE` (FR-026).
- No content type is accepted from the client: the format is read from the name's
  last suffix and confirmed from the content (§2.3, FR-027).

**Success — 201**

```json
{
  "uploadId": "6f1c2f4e-…",
  "partSize": 8388608,
  "expiresAt": "2026-11-13T10:15:00.000Z",
  "parts": [
    { "partNumber": 1, "url": "http://storage:8333/wafar/intake/…?X-Amz-…", "byteSize": 8388608 },
    { "partNumber": 2, "url": "…", "byteSize": 8388608 }
  ]
}
```

- `partSize` is 8 MB (8,388,608 bytes); a 100 MB file needs at most 13 parts.
- The number of parts is `ceil(byteSize / partSize)`; every part is `partSize`
  bytes except the last, which is the remainder.
- Each URL is signed for `PUT` on `intake/{uploadId}/original` for that one part
  number, exactly that `byteSize`, `Content-Type: application/octet-stream`, and a
  15-minute expiry; a URL replayed for another key, part, or length fails the
  signature (T16, FR-035).
- The response is `no-store`; the URLs are not logged.

**Order of decisions** (observable, and asserted by stacking two causes): CSRF →
session and role → request shape → the file's name (an empty name included) →
the last-suffix format → the size → the file's emptiness (a zero-byte file) → the monthly limit → the active limit → the attempt bound →
the multipart create (§4). A file-level refusal and a limit refusal create no
session row and do not count as an attempt; an attempt-bound refusal is not
counted and does not restart the wait (FR-061).

**Side effects**: one attempt-counter increment (when the bound was not exceeded),
one `catalog_upload_sessions` row in `open`, one multipart create. No object byte
is written by this route.

### 2.3 `POST /api/v1/uploads/{uploadId}/complete`

Completes the multipart, screens the object, sanitizes it, hashes the kept bytes,
and creates the record or reports the duplicate (FR-027–FR-047).

**Request** — `CompleteUploadRequest`

```json
{ "parts": [ { "partNumber": 1, "etag": "\"9b2cf5…\"" }, { "partNumber": 2, "etag": "\"…\"" } ] }
```

- `parts` is the client's list, in any order; the server requires the parts
  `1 … n` without a gap or a duplicate, and each ETag in the quoted form the
  storage returned.
- The route's session row must belong to the caller, be `open`, and still be
  inside its `url_expires_at` (the part URLs' expiry plus the workspace's grace):
  an unknown, foreign, expired, or aborted identifier is `404 NOT_FOUND`, the same
  answer a row that never existed receives (FR-009, R1's scoping rule). That is
  the backstop §2.4 leans on: a session whose sweep-bound has passed cannot become
  a catalog even though no sweep has run.
- The page never cancels this request: the screening phase withdraws «إلغاء» and a
  departure during it sends no abort (§2.4), so the page's only bound is its
  120-second client timeout, and the server's five timed budgets stay inside it,
  in FR-029's order: the content probe 5 s, the scan 90 s
  (research R-16), the decoded-size cap's read of the original decode 5 s, the
  sanitizer 10 s (which carries the executable content's removal and the
  sanitized decode's measurement), and the reopen 5 s. The five sum to 115 s —
  a sum of budgets, not a sequence of intervals — and leave 5 s of the timeout for the multipart's completion, the kept object's
  write, the acceptance transaction, and the response (`plan.md` → Technical
  Context, the stage budgets; §4.2). **The cap is measured twice**, and the second
  measurement — of the sanitized decode — is taken as the sanitizer writes the
  kept bytes, so it spends the sanitizer's 10 s and adds no read to the path: the
  six steps keep the five budgets and the 115-second sum. A stage that overruns
  its budget is never
  left waiting: it is answered as the cause that stage produces — the probe's and
  the cap's first read's overrun is `UPLOAD_CORRUPT`, the sanitizer's, the
  sanitized decode's measurement's, or the reopen's is
  `UPLOAD_SANITIZATION_FAILED`, and the scan's is `UPLOAD_SCAN_UNAVAILABLE` — and
  no new cause enters the closed set (§3.1, FR-064). A sanitized decode that
  crosses the cap is `UPLOAD_EXPANSION_CAP`, the cap's own answer (§5 of the
  formats contract).
- **A transfer failure is the page's own cause, not a refusal code.** A
  client-side network failure or a timeout is shown in the error state with the
  same-file retry and «اختيار ملف آخر» (FR-049); no server response exists to
  carry a code for it. A part write the page aborts is **not** this cause: the
  page aborts it only on «إلغاء» or on departure (§2.4), and FR-050 returns the
  page to its choosing state with nothing kept. `UPLOAD_INCOMPLETE` is a
  different cause again: the completion request reached the API, and its session,
  its parts list, or the stored object's size does not match, so the server
  answers it and a retry of the same bytes cannot change it (FR-026, FR-050).

**A timeout is that cause even when the platform had already settled the intake.**
The page's bound is its own; it does not withdraw the server's work, because a
completion the platform finished is the platform's (FR-050). The acceptance
stands: one catalog, one monthly count, and one active slot. The same-file retry
is an ordinary submission — `POST /api/v1/uploads`, the parts, then this route —
and this route's acceptance compares the kept hash with the retained catalogs,
so it answers the `200` duplicate against the catalog that request created: no
second catalog, no second quota, and no code added to §3.1 (FR-043, FR-045). A
retry that races a settlement still in flight is resolved by the same
uniqueness — exactly one catalog exists and the other submission answers as the
duplicate (FR-045). When the earlier acceptance exhausted a monthly or active
limit, §2.2's step 7 or 8 refuses the retry before any byte is transferred and
this route is never reached, so the merchant sees the quota-exceeded state and
not a duplicate report (FR-013). The retry is counted as an attempt like every
other submission (FR-061), and the transfer-failure text claims nothing about
whether the file was kept, because no response reached the page. A part write
that reports no progress for the plan's stall bound is the same cause, not a
cancel: the page stops that part and shows this error state with its retry
(FR-049).

**Success — 201 accepted**

```json
{
  "outcome": "accepted",
  "catalog": {
    "id": "0b6d…",
    "fileName": "كتالوج المورد.xlsx",
    "byteSize": 2408112,
    "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "status": "uploaded",
    "uploadedAt": "2026-11-13T10:02:11.000Z"
  }
}
```

- `byteSize`, `contentType`, and the hash are the **kept, sanitized** file's
  (AC-017); the record's status is `uploaded` (FR-037).
- The record is the caller's; no other merchant's field is read or returned.

**Success — 200 duplicate**

```json
{
  "outcome": "duplicate",
  "original": {
    "id": "4d2a…",
    "fileName": "كتالوج المورد.xlsx",
    "uploadedAt": "2026-10-02T08:14:00.000Z",
    "status": "completed"
  }
}
```

- `original` is the four-field projection FR-009 and FR-044 fix — the name, the
  upload date, the processing status, and the identifier the parts link needs —
  and no other field of the original and no record of its owner (ADR-170).
- The status is the raw registered value; the page maps it to the Arabic label
  `ui-contracts.md` §6 fixes.
- No catalog is created, the bytes just kept are withdrawn, no quota is consumed,
  and the file is not queued (FR-043).

**Settling the staging object**: when the intake settles — accepted, duplicate,
or refused — `intake/{uploadId}/original` is deleted before the response, or
left to the sweep when the storage refuses the removal (§2.3; data-model §9);
only the kept sanitized object outlives the request (data-model §10).

**Refusal after the transfer**: the removal is part of deciding the refusal, so
the refusal and its withdrawal are one act. The completed object and every part
the transport left are removed before the intake answers, and the removal is
verified: a `HEAD` on `intake/{uploadId}/original` answers `null` and
`listParts` answers no part (§6.1), so a refusal this request settles leaves no
copy of the file and no unfinished part of it (FR-030, AC-015).

**When the storage refuses the removal**, the withdrawal cannot be confirmed and
the safety refusal is not reported as decided: the route answers
`UPLOAD_STORAGE_UNAVAILABLE` (retryable) with its retry, creates no catalog,
consumes no quota, and claims no removal, while §5's record carries the safety
cause. The session stays `failed` with its `original_key` and `sanitized_key` on
the row, and the deferred sweep deletes both keys and confirms their absence
before it deletes the row (data-model §9; `plan.md` → Complexity Tracking row 23).
The "no copy" guarantee is read at the moment the removal is confirmed — by this
request or by that sweep — and never at the moment the storage answers a delete.

**Quota race**: the acceptance transaction takes the per-merchant advisory lock
and re-reads both limits; an upload that loses the race is refused for the limit
that is now exhausted, with the object withdrawn and no quota consumed (FR-014).
The attempt was already counted when the session started (FR-061).

### 2.4 `DELETE /api/v1/uploads/{uploadId}`

The «إلغاء» control and a departure during the transfer (FR-048, FR-050).

- **204** for an owned session in any state. `open`: the API aborts the
  multipart (S3's `AbortMultipartUpload`, the operation that withdraws the
  unfinished parts — not `DeleteObject`), deletes `intake/{uploadId}/original`
  if it exists (S3's `DeleteObject`, which removes the completed object and
  withdraws no part), and marks the session `aborted`. `completing`, `aborted`,
  `failed`, or `done`: no-op — a transfer whose bytes are complete is the
  platform's work, and neither a cancel control that has already been withdrawn
  nor a departure may cancel it (FR-050).
- **404 NOT_FOUND** for an unknown or foreign identifier.
- **The departure's request.** While the page's progress state is the transfer
  phase, the page sends this route from a `pagehide` listener through
  `fetch(…, { keepalive: true })` — bodyless, so the request survives the document
  that sent it and fits the keepalive budget — with R1's CSRF token, after
  aborting its in-flight part `PUT`s with `abort()` on each part's own
  `XMLHttpRequest` (§1.1). The request is idempotent and losing it is
  not a product outcome, because the backstop is structural: §2.3 accepts only an
  `open` session, and no part byte can be written after the URLs' 15-minute
  expiry.
- The route is idempotent. An abort or delete that the storage refuses — only an
  `open` row reaches one — is logged and reclaimed by the session sweep the
  owning slice runs (data-model §9, `plan.md` → Complexity Tracking row 23); the
  response stays 204 because the merchant's outcome — no catalog, no quota, the
  transfer stopped — is already true, and an abandoned multipart is not a
  retained file.

### 2.5 `GET /health`

R1's two-field body becomes four fields (FR-062; ADR-147's rule that the probe
verifies every dependency the API cannot serve without):

```json
{ "status": "ok", "database": "ok", "storage": "ok", "scanner": "ok" }
```

| Field | Probe | Budget |
|---|---|---|
| `database` | `SELECT 1` | 1 s |
| `storage` | A signed `HeadBucket` on the configured bucket | 1 s |
| `scanner` | A clamd `PING` expecting `PONG` over the socket | 1 s |

- **200** only when all three answer `ok`; **503**
  `{ "status": "degraded", "database": "ok", "storage": "error", "scanner": "ok" }`
  when any does not, with the failing field(s) at `error`. The probes run in
  parallel, so the route's own bound is 1 second.
- A bucket that answers `403` or `404` is `storage: "error"` — a misconfigured
  deployment is not healthy.
- No authentication, no PII, no body beyond the four fields; `no-store`.
- `docs/runbooks/backup-restore.md`'s drill assertion reads this four-field body
  (Complexity Tracking row 22).

## 3. The refusal codes

`intakeErrorCodes` is a second closed set of **17** codes. The platform union is
`refusalCodes = [...authErrorCodes, ...intakeErrorCodes]` (26 + 17 = 43), and
`refusals` in `apps/api/src/http/errors.ts` is a
`Record<RefusalCode, RefusalSpec>`. R1's 26 codes and their rows are unchanged
(research R-11). The union's one-row/one-producer invariant and exact count are
Complexity Tracking row 26's.

### 3.1 Codes

| Code | Status | Retryable | Meaning | Source |
|---|---|---|---|---|
| `UPLOAD_INVALID_REQUEST` | 400 | no | The request body does not describe a start or a completion (malformed JSON, a missing or wrong-typed field, a parts list that is not an array) | FR-026, FR-049 |
| `UPLOAD_INVALID_NAME` | 400 | no | The name is empty (decided first in the name check), over 255 UTF-16 code units, or carries a refused control, bidi, invisible, zero-width, byte-order character, or a path separator | FR-021, FR-026 |
| `UPLOAD_UNSUPPORTED_FORMAT` | 400 | no | The name's last suffix is not `xls`, `xlsx`, `doc`, `docx`, or `pdf`, compared without regard to letter case; an empty name carries no suffix and is `UPLOAD_INVALID_NAME` instead | FR-021 |
| `UPLOAD_TOO_LARGE` | 413 | no | The declared or actual size exceeds 100 MB (104,857,600 bytes) | FR-022, FR-023 |
| `UPLOAD_EMPTY` | 400 | no | The declared or actual size is zero | FR-024 |
| `UPLOAD_CONTENT_MISMATCH` | 400 | no | The container opens but holds no document of the declared type | FR-027 |
| `UPLOAD_CORRUPT` | 400 | no | The file matches its declared format at the byte level but cannot be opened as that format, or crosses a parser bound the format contract fixes (§3.5 there) | FR-027, FR-028 |
| `UPLOAD_PASSWORD_PROTECTED` | 400 | no | The document cannot be opened without a password | FR-028, FR-030 |
| `UPLOAD_INFECTED` | 400 | no | The scan returned a verdict naming the file as infected | FR-033, FR-034 |
| `UPLOAD_EXPANSION_CAP` | 400 | no | The file's decoded content exceeds 1 GiB | FR-031 |
| `UPLOAD_SANITIZATION_FAILED` | 400 | no | Executable content cannot be removed (a document macro, an Excel 4.0 macro sheet, an embedded object or attached file that can carry executable content, or a PDF's JavaScript, action, embedded file, or form script), an Office document's external link cannot be removed with its relationship, the sanitized file no longer opens as its declared format, or the sanitizer or the reopen overruns its budget | FR-030, FR-032 |
| `UPLOAD_SCAN_UNAVAILABLE` | 502 | yes | The scanner is unreachable, answers a protocol error, or misses the 90-second budget | FR-033 |
| `UPLOAD_TOO_MANY_ATTEMPTS` | 429 | yes | The merchant's 60 attempts in the current 15-minute window are spent | FR-061 |
| `UPLOAD_MONTHLY_LIMIT` | 409 | no | The monthly limit is exhausted; it resets at the next `Africa/Tripoli` month | FR-013, FR-016 |
| `UPLOAD_ACTIVE_LIMIT` | 409 | no | The active limit is exhausted; it is released by a delete or the 90-day retention | FR-013, FR-016 |
| `UPLOAD_STORAGE_UNAVAILABLE` | 503 | yes | The object store refused a create, a read, a write, a delete, or its verification — including the removal a refusal depends on | FR-030, FR-040 |
| `UPLOAD_INCOMPLETE` | 409 | no | The upload session cannot be completed: its parts list does not match, the multipart cannot be completed, or the stored object's size does not match the declared size — a file-level cause a retry of the same bytes cannot change | FR-026, FR-028, FR-050 |

**The retryable set is three server codes plus the page's own transfer failure.**
FR-049 names four retryable causes — a transfer failure, a storage failure, a
scan that could not run, and an attempt over the bound. Three are server answers,
and their rows carry `retryable: true`: `UPLOAD_SCAN_UNAVAILABLE`,
`UPLOAD_TOO_MANY_ATTEMPTS`, and `UPLOAD_STORAGE_UNAVAILABLE`. The fourth — a
transfer failure — produces no response at all: a client-side network failure or
a timeout is the page's own cause and has no code (§2.3). `UPLOAD_INCOMPLETE` is **not** it and is not retryable; it is the
server's answer to a completion it cannot accept, which a retry of the same bytes
cannot change (FR-026, FR-049, FR-050).

**Reused R1 codes**: `SESSION_ENDED`, `ACCOUNT_BLOCKED`, `PASSWORD_CHANGE_REQUIRED`,
`CSRF_FAILED`, `PAYLOAD_TOO_LARGE`, `INTERNAL_ERROR`, `NOT_FOUND`,
`METHOD_NOT_ALLOWED`. R2 adds no new auth code.

### 3.2 How a cause enters this table

A cause enters by four edits, all in one change: the code is added to
`intakeErrorCodes` (or `authErrorCodes` when it is an identity cause), its row is
added to the matching contract's code table, one producer suite is named for it
in the refusal catalogue, and the catalogue's exact-count assertion remains the
sum of the two closed sets. The catalogue test reads both contracts, fails on a
code without a row, a row without a code, a code without a producer, a producer
for no code, or a count that is not `authErrorCodes.length +
intakeErrorCodes.length` (Complexity Tracking row 26). The page's message table gains exactly one row for the
new code in the same change; a code with no text fails the copy test.

### 3.3 Envelope rules specific to the intake

- `field` is present on a file-level refusal as `fileName` or `byteSize`, and on
  a single-limit refusal as `monthly` or `active`.
- When both limits are exhausted, `code` is `UPLOAD_MONTHLY_LIMIT` and `details`
  lists both, monthly first, each carrying its `field`; the page renders both in
  the order the array gives (FR-016).
- `retryAfterSeconds` is present on `UPLOAD_TOO_MANY_ATTEMPTS` and equals the
  seconds to the next 15-minute UTC boundary (1–900); the `Retry-After` header
  carries the same value. It is absent on every other intake code: the safety and
  quota codes have no server-imposed interval.
- A request body above 16 KB is R1's `PAYLOAD_TOO_LARGE` (413), not an intake
  code; malformed JSON within the limit is `UPLOAD_INVALID_REQUEST` (400). R2
  reuses R1's row and changes neither its status nor its `retryable` value.
- `retryable` is R1's one property, not a second rule
  (`contracts/auth-api.md` §3.3): true when the response invites another attempt
  that may succeed without correcting a value it reports. **Among the intake
  codes**, only the three retryable server codes carry it —
  `UPLOAD_SCAN_UNAVAILABLE`, `UPLOAD_TOO_MANY_ATTEMPTS`, and
  `UPLOAD_STORAGE_UNAVAILABLE`; the page's own transfer failure is the fourth
  retryable cause and carries no code, and `UPLOAD_INCOMPLETE` is not retryable
  because the server has answered and a retry of the same bytes cannot change the
  parts, the size, or the session state (FR-049, FR-028).
- `reason` is never produced by an intake code.
- A refused file name is never echoed in the body: the response carries the code,
  not the name (FR-021, FR-025).

## 4. Refusal order

The order is observable and asserted by an integration test that stacks two
applicable causes and expects the earlier one.

### 4.1 `POST /api/v1/uploads`

| Step | Check | Code |
|---|---|---|
| 0 | CSRF token and origin | `CSRF_FAILED` |
| 1 | Session, role, account status | `SESSION_ENDED`, `ACCOUNT_BLOCKED` |
| 2 | Request shape | `UPLOAD_INVALID_REQUEST` |
| 3 | The name (empty, length, refused characters, path separators) | `UPLOAD_INVALID_NAME` |
| 4 | The last suffix (a name with at least one character and no allowed suffix) | `UPLOAD_UNSUPPORTED_FORMAT` |
| 5 | The declared size (over 100 MB) | `UPLOAD_TOO_LARGE` |
| 6 | Emptiness | `UPLOAD_EMPTY` |
| 7 | The monthly limit | `UPLOAD_MONTHLY_LIMIT` (+ `UPLOAD_ACTIVE_LIMIT` in `details` when both) |
| 8 | The active limit | `UPLOAD_ACTIVE_LIMIT` |
| 9 | The attempt bound (increment; a refusal is not counted) | `UPLOAD_TOO_MANY_ATTEMPTS` |
| 10 | The multipart create | `UPLOAD_STORAGE_UNAVAILABLE` |

Steps 3–6 run in the one order FR-028 fixes; a file failing more than one is
reported for the first. Step 3's empty name and step 6's zero-byte file are two
different checks: the name's emptiness belongs to step 3, the file's to step 6.
Steps 3–8 write nothing and count no attempt.

### 4.2 `POST /api/v1/uploads/{uploadId}/complete`

| Step | Check | Code |
|---|---|---|
| 0 | CSRF token and origin | `CSRF_FAILED` |
| 1 | Session, role, account status | `SESSION_ENDED`, `ACCOUNT_BLOCKED` |
| 2 | Session row: unknown, foreign, past `url_expires_at`, or not open → `NOT_FOUND`; owned and open → pass | `NOT_FOUND` |
| 3 | Parts list shape | `UPLOAD_INCOMPLETE` |
| 4 | Complete the multipart | `UPLOAD_INCOMPLETE`, `UPLOAD_STORAGE_UNAVAILABLE` |
| 5 | Object head: empty, over 100 MB, size ≠ declared | `UPLOAD_EMPTY`, `UPLOAD_TOO_LARGE`, `UPLOAD_INCOMPLETE` |
| 6 | Content format | `UPLOAD_CONTENT_MISMATCH`, `UPLOAD_CORRUPT`, `UPLOAD_PASSWORD_PROTECTED` |
| 7 | Antivirus scan | `UPLOAD_INFECTED`, `UPLOAD_SCAN_UNAVAILABLE` |
| 8 | Decoded-size cap | `UPLOAD_EXPANSION_CAP` |
| 9 | Sanitize and reopen | `UPLOAD_SANITIZATION_FAILED` |
| 10 | Write the kept object | `UPLOAD_STORAGE_UNAVAILABLE` |
| 11 | Acceptance transaction: lock, re-read limits, insert | `UPLOAD_MONTHLY_LIMIT`, `UPLOAD_ACTIVE_LIMIT`, or the duplicate outcome |

The safety steps run in the order FR-029 fixes. Every path that refuses after
step 4 withdraws what the transport wrote before it answers (§2.3); when the
storage refuses that withdrawal, the answer is `UPLOAD_STORAGE_UNAVAILABLE` and
not the safety cause (§2.3). An unexpected failure after step 4 answers
`INTERNAL_ERROR` only after the same withdrawal; the integration suite asserts
both object counts are zero.

Steps 6, 8, and 9 each run inside the budget §2.3 records, and a step that
overruns it is answered as the cause that step produces: the content probe's and
the decoded-size cap's read overrun is `UPLOAD_CORRUPT`, the sanitizer's or the
reopen's is `UPLOAD_SANITIZATION_FAILED`, and the scan's is
`UPLOAD_SCAN_UNAVAILABLE`.

## 5. The operational record

Every submission leaves one structured log line, emitted at settlement with
`event: "intake.upload.settled"` (FR-062, AC-034, SC-013):

```json
{"level":"info","event":"intake.upload.settled","outcome":"refused","cause":"UPLOAD_INFECTED","requestId":"…","timestamp":"2026-11-13T10:02:11.000Z"}
```

- `outcome` is `accepted`, `duplicate`, `refused`, `failed`, or `cancelled`.
- `cause` is the refusal code for `refused` and absent otherwise, and it is
  always one of §3.1's closed seventeen: never a scanner signature, a storage
  error's text, or any free-form reason, so SC-013's counts by cause count
  causes rather than messages.
- `timestamp` is read **once, at settlement**, from the request's injected clock
  — the one clock R1's container exposes as `now`
  (`apps/api/src/http/deps.ts`), never the database's `now()` — and it is the
  same clock the acceptance reads the catalog's `uploaded_at` from (FR-011,
  `data-model.md` §1–§2). §1's format and zone are unchanged: RFC 3339 with
  milliseconds and `Z`.
- On §2.3's failed-withdrawal path the submission is one `refused` line whose
  `cause` is the safety cause that started the withdrawal — one of the post-transfer
  safety codes: `UPLOAD_INFECTED`, `UPLOAD_SANITIZATION_FAILED`,
  `UPLOAD_SCAN_UNAVAILABLE`, `UPLOAD_CONTENT_MISMATCH`, `UPLOAD_CORRUPT`,
  `UPLOAD_PASSWORD_PROTECTED`, or `UPLOAD_EXPANSION_CAP` — because FR-030
  requires the record to keep it; the merchant's answer is the storage failure,
  which is neither this line's `cause` nor a second line, and no field is added.
- No merchant identifier, file name, content hash, session identifier, object
  key, or IP address appears; `requestId` is the request handle R1's logging rule
  requires, and it identifies neither a merchant nor a file.
- The line is emitted for a file-level refusal and a limit refusal too, which
  FR-061 does not count as attempts.
- The line is the only record: no table, no entity, no administrator
  notification (FR-062).

## 6. Non-HTTP surfaces

### 6.1 The storage adapter

```ts
interface IntakeStorage {
  createMultipart(input: { key: string; contentType: 'application/octet-stream' }): Promise<{ uploadId: string }>;
  presignPart(input: { key: string; uploadId: string; partNumber: number; byteSize: number; expiresInSeconds: number }): Promise<string>;
  completeMultipart(input: { key: string; uploadId: string; parts: { partNumber: number; etag: string }[] }): Promise<void>;
  listParts(input: { key: string; uploadId: string }): Promise<{ parts: { partNumber: number; byteSize: number }[] }>;
  abortMultipart(input: { key: string; uploadId: string }): Promise<void>;
  head(input: { key: string }): Promise<{ byteSize: number } | null>;
  getStream(input: { key: string }): Promise<ReadableStream>;
  putStream(input: { key: string; body: ReadableStream; contentType: string }): Promise<{ byteSize: number; sha256: string }>;
  delete(input: { key: string }): Promise<void>;
  headBucket(): Promise<void>;
}
```

- The adapter signs with `aws4fetch` (ADR-172); the bucket is private; a key
  carries no merchant identifier (data-model §10).
- The signed transfer grant is the adapter's own rule: `presignPart` signs the
  fixed header `content-type: application/octet-stream` — a constant of the
  adapter, not a parameter of the call — beside one key, one part number, one
  exact `byteSize`, and the expiry the route passes; a URL replayed with another
  content type, for another key, another part, or another length fails the
  signature as a changed key, part, or length does (T16, FR-035). The
  storage-adapter suite `T031` writes asserts that rule — a replayed URL, a
  changed content type, a changed part number, and an expired URL all fail.
- `putStream` hashes while it writes, so the kept file's SHA-256 and byte count
  come from the bytes that were stored (FR-041).
- `head` answers `null` for a missing key, so the withdrawal's verification is a
  `null` answer (FR-030).
- `listParts` is the one read of a multipart's parts, and the only proof that an
  aborted transfer left no part behind: it answers the parts the upload still
  holds, each with its part number and the byte size the storage reports. An
  upload the storage no longer holds is S3's `NoSuchUpload`, which the adapter
  maps to `{ parts: [] }` rather than to an error, so the caller asks one
  question and a test asserts one shape — `parts.length === 0`, whether
  `abortMultipart` ran or the transfer never wrote a part. **An unfinished part
  is not an object**, so an object listing cannot answer it (FR-050, AC-010).
- `abortMultipart` is the operation that withdraws a transfer's unfinished parts;
  `delete` (S3's `DeleteObject`) removes a completed object and withdraws no
  part. §2.4's abort therefore calls `abortMultipart` first and `delete` for
  `intake/{uploadId}/original` second, and a proof that reads only the object
  listing passes while the abandoned parts survive.
- The adapter is the only code that names the S3 gateway; no module imports it
  directly (the module's service receives it through the dependency container).

### 6.2 The scanner adapter

```ts
interface Scanner {
  scan(input: { stream: ReadableStream; budgetMs: number }): Promise<
    { verdict: 'clean' } | { verdict: 'infected'; signature: string } | { verdict: 'unavailable' }
  >;
}
```

- The real adapter speaks clamd's `INSTREAM` over `node:net`, sends the stream in
  chunks, terminates with a zero-length chunk, and reads `OK` or `FOUND`; a
  timeout, a connection failure, a protocol error, or `ERROR` is `unavailable`
  (ADR-173, research R-16).
- A signature name is never shown to the merchant and never written to the
  operational record: §5's `cause` is the code `UPLOAD_INFECTED` alone, which is
  the value the counts by cause read, and the verdict alone selects it. The
  signature the daemon returns is not retained by this slice; the merchant sees
  `UPLOAD_INFECTED`'s one text (FR-062, SC-013).
- The test double implements the same interface, answers `clean` after a fixed
  150 ms, and can be told to answer `infected` or `unavailable` (or to delay past
  the budget); the load run uses the same double.

### 6.3 The session state machine

```text
open ──complete──→ completing ──accepted/duplicate──→ done
  │                     │
  │                     ├──refused──→ failed
  │                     └──error────→ failed
  └──cancel────────────→ aborted      (the page's «إلغاء» or its departure)
```

- `open` is the only state in which a completion is accepted; `done`, `failed`,
  and `aborted` are terminal.
- **No departure leaves `completing`.** A `DELETE` on a `completing` row is a 204
  no-op (§2.4): the bytes are complete, the cancel control is withdrawn, and the
  intake is the platform's. The only arrow out of `completing` is the intake's own
  outcome.
- **The expiry transition is not this slice's.** `open → aborted` on expiry is the
  sweep's, and the sweep is deferred (data-model §9, `plan.md` → Complexity
  Tracking row 23): R2 records `url_expires_at` and the two keys and runs no
  sweep, so nothing in this slice's tree takes that transition. An expired `open`
  row is still refused by §2.3, which is why the deferral cannot produce a
  catalog or consume a quota.
- A refusal's `failed` row keeps `original_key` and `sanitized_key` so the sweep
  can finish a withdrawal the request could not verify. The sweep's terminal
  statement deletes both keys, confirms their absence, and only then deletes the
  row, one hour after the terminal time — `completed_at` for a `done` or `failed`
  row, `aborted_at` for an `aborted` one, and `created_at` when neither is set —
  and it never deletes a `done` row's
  `sanitized_key`, which is the accepted catalog's kept object or a duplicate's
  already-withdrawn object (data-model §9). R2 runs no sweep, so it deletes no
  row; the two keys on a `failed` row are exactly what the sweep reads.
- No product read exposes the row.

## 7. The documentation-drift test

§2–§4 are the machine-read surface. `scripts/check/documentation-drift.mjs`
(dependency-free Node, like `governance-drift-check.mjs`) compares three records:
the emitted `apps/api/openapi.json`, the routes the Hono app registers, and this
contract's §2 route table, §3 code table, and §4 order. It fails on a route
without a document entry, a document entry without a route, a documented status
or code the implementation does not produce, a produced code this contract does
not list, or a path or method mismatch. It runs in CI from this slice (ADR-031
item 4; research R-13). §5–§6 explain the surfaces the test does not read.

## 8. What this contract does not carry

- The page's states, copy, focus rules, and formats — `ui-contracts.md`.
- The tables, indexes, checks, and sweeps — `data-model.md`.
- The transport's mechanics, the libraries' choices, and the load condition —
  `research.md` and `plan.md`.
- The 90-day retention job, My Files, Parts, and the administrator application —
  R15, R4, R5, and R13.
