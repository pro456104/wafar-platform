# Phase 1 Data Model — File Intake

**Feature**: `002-file-intake` | **Date**: 2026-11-13 | **Plan**: [plan.md](./plan.md)

This file states the shape R2's migration implements. It does not restate the
product rule: `docs/domain-model.md` is the entity's source of truth, and a rule
here is a reading of it. The column types, checks, and indexes are this file's
own, as the constitution's Data entities rule requires.

## 1. Scope and rules

- **One entity.** `Catalog` is the only entity R2 creates. The monthly counter,
  the attempt counter, and the upload session are **not entities**: they are
  per-merchant counter state and transient intake state, recorded here and in the
  owning module, and they add nothing to the Product Register.
- **One owning module.** `catalogs` owns all four tables. No other module reads
  or writes them; `users` is read through its service port for the account's
  status and the two quota overrides.
- **Merchant scoping.** `catalogs`, `catalog_monthly_uploads`,
  `catalog_upload_attempts`, and `catalog_upload_sessions` all carry `user_id`,
  and every read passes the single shared entry point. The one exception is the
  duplicate projection (§6), admitted by the isolation test.
- **Timestamps.** Each table carries the timestamps it uses and no other.
  `catalogs` carries `uploaded_at`, `created_at`, and `updated_at`:
  `uploaded_at` is the product's timestamp and is written once, by the service,
  from the instant the acceptance reads (FR-011) — never by a column default and
  never by the database's `now()`; `created_at` and `updated_at` are the row's
  own storage times. `catalog_upload_sessions` carries `created_at`,
  `completed_at`, and `aborted_at` and has no `updated_at`, because a session is
  read by its `state` and its two terminal times. The two counter tables carry
  `updated_at` alone: a counter row's creation moment is not a value any rule or
  read uses.
- **Currency of the schema.** `0004_file_intake.sql` is the fourth migration and
  its down is its exact inverse. The boot-time schema-version guard (R1) reads
  the new applied-step count, so an instance built for R2 refuses to listen
  against the pre-R2 schema and one built for R1 refuses against the R2 schema.

## 2. `catalogs`

| Column | Type | Null | Default | Check / note |
|---|---|---|---|---|
| `id` | `uuid` | no | `gen_random_uuid()` | primary key |
| `user_id` | `uuid` | no | — | `REFERENCES users(id)`; the uploading merchant |
| `file_name` | `text` | no | — | `char_length(file_name) BETWEEN 1 AND 255` — a storage bound, not a validation bound; the uploaded name exactly as supplied (ADR-166), with the 255-UTF-16-unit limit enforced in the service (§11) |
| `byte_size` | `bigint` | no | — | `> 0 AND <= 104857600`; the kept file's size |
| `content_type` | `text` | no | — | one of the five canonical types in `contracts/intake-formats.md` |
| `content_hash` | `char(64)` | no | — | `~ '^[0-9a-f]{64}$'`; SHA-256 of the kept bytes |
| `storage_key` | `text` | no | — | unique; `catalogs/{id}/{hash}.{ext}` |
| `status` | `text` | no | `'uploaded'` | `IN ('uploaded','processing','completed','failed')` |
| `uploaded_at` | `timestamptz` | no | — | written once by the service from the acceptance's injected instant, never a column default (FR-011); the retention's origin (ADR-131) |
| `deleted_at` | `timestamptz` | yes | `null` | soft delete; every read filters it out |
| `created_at` | `timestamptz` | no | `now()` | — |
| `updated_at` | `timestamptz` | no | `now()` | — |

The `file_name` check is a **storage bound, not a validation bound**: it
guarantees the column can hold what the service admitted and never decides a
refusal. The 255-UTF-16-code-unit limit is enforced in the service before any
byte is transferred (FR-021); because a name of 255 UTF-16 units is at most 255
code points, an admitted name always satisfies the column's check, and a longer
one never reaches the insert.

No column here defaults `uploaded_at` to `now()`. The acceptance reads one
instant from the injected clock, writes `uploaded_at` from it, and derives the
month key from the same value (FR-011), so a storage default — which the
database would read at insert time — can never place the timestamp in a
different month from the counter's. `created_at` and `updated_at` keep their
defaults because they are the row's own storage times and enter no rule.

**Not in this migration**: `supplier_id`, `issue_date`, `expires_at`, and
`first_page_metadata_incomplete`. They are R3's fields; `expires_at`'s meaning is
open fact #3 (R15), and an undecided column must not be created early (ADR-166).

**Constraints and indexes**:

- `catalogs_content_hash_retained_uq` — `UNIQUE (content_hash) WHERE deleted_at IS NULL`,
  **platform-wide**: the table holds at most one live catalog per hash across all
  merchants, which is FR-042's comparison scope ("platform-wide, not only within
  the merchant's own files") and FR-045's "at most one catalog that is not
  deleted" for one hash. FR-013 decides only that a match at acceptance is the
  duplicate outcome and consumes no quota; the comparison's scope is FR-042's, so
  the constraint carries no `user_id`. The predicate is FR-046's re-upload rule,
  and the conflict is the duplicate rule's atomic decision (ADR-169). Two
  merchants uploading the same bytes at the same time therefore serialize on this
  index: one commits, the other receives `23505` and reads the committed row
  through §6 — the one cross-merchant read the constitution names (ADR-170).
- `catalogs_storage_key_uq` — `UNIQUE (storage_key)`, platform-wide; a key already
  carries its catalog's own identifier (§10), so the constraint guards the key
  rather than deciding a policy.
- `catalogs_user_id_uploaded_at_idx` — `(user_id, uploaded_at DESC)` for My Files
  (R4) and the merchant's own record reads.
- `catalogs_user_id_retained_idx` — `(user_id) WHERE deleted_at IS NULL` for the
  active count.
- **The scoping invariant reaches the two merchant-scoped indexes.** Both lead
  with `user_id`, as `docs/domain-model.md` requires of an index that serves a
  merchant-scoped query. `catalogs_content_hash_retained_uq` leads with
  `content_hash` because its subject is platform-wide (FR-042); it serves no
  merchant-scoped query, so the scoping rule does not reach it and no merchant
  read uses it as an access path. A per-merchant index over
  `(user_id, content_hash)` was rejected: it would let two merchants hold the same
  file, which FR-042, FR-045, and the domain model's hash rule forbid.

**Soft delete's effect on the constraints and the indexes.** A delete sets
`deleted_at`; the row, its key, and its hash stay in the table, so each object
above answers one question about it:

| Object | A soft-deleted row | Why |
|---|---|---|
| `catalogs_content_hash_retained_uq` | **excluded** — the hash is released | FR-046: a file whose identical predecessor was deleted is a new upload, so a second row with the same hash is admitted (ADR-169). |
| `catalogs_storage_key_uq` | **included** — the key stays reserved | The stored object stays until the row is removed for good (FR-046, ADR-131), and a key carries its own row's identifier, so a new catalog never asks for the deleted row's key; R15 removes the row and its object together. |
| `catalogs_user_id_uploaded_at_idx` | **included** — the row stays in the index | The index serves My Files (R4) and the merchant's own record reads, and each of those reads carries `deleted_at IS NULL`; the filter is applied to the rows the index returns, and the index still serves a read that must see a deleted row. |
| `catalogs_user_id_retained_idx` | **excluded** | The active count's predicate is `deleted_at IS NULL` (FR-012), so the index and the count carry the same predicate. |
| the primary key, the checks, and the foreign keys | **unchanged** | A soft-deleted row keeps its `id`, a valid status, name, size, and hash, and its `user_id` still references the account; a delete writes `deleted_at` and rewrites no checked column. |

**The soft-deleted row is not hidden from the retention job.** The predicates
above filter product reads; they do not move the row out of the table, so R15
reads it by its `id`, removes its object, and removes the row. The monthly
counter is a separate table and is not recomputed from catalogs (FR-011), so a
soft delete changes the active count alone among the two quota reads.

## 3. `catalog_monthly_uploads`

| Column | Type | Null | Default | Check / note |
|---|---|---|---|---|
| `user_id` | `uuid` | no | — | `REFERENCES users(id)` |
| `month_start` | `date` | no | — | the first day of the month in `Africa/Tripoli` |
| `count` | `integer` | no | `0` | `>= 0` |
| `updated_at` | `timestamptz` | no | `now()` | — |

Primary key `(user_id, month_start)`. Index `catalog_monthly_uploads_month_start_idx (month_start)` for the sweep the owning slice runs (§9; `plan.md` row 23). The count is incremented only by
acceptance (ADR-167); a missing row reads 0.

## 4. `catalog_upload_attempts`

| Column | Type | Null | Default | Check / note |
|---|---|---|---|---|
| `user_id` | `uuid` | no | — | `REFERENCES users(id)` |
| `window_start` | `timestamptz` | no | — | a 15-minute UTC boundary |
| `count` | `integer` | no | `0` | `>= 0` |
| `updated_at` | `timestamptz` | no | `now()` | — |

Primary key `(user_id, window_start)`. Index `catalog_upload_attempts_window_start_idx (window_start)` for the sweep the owning slice runs (§9). The increment happens at pre-sign
(ADR-168).

## 5. `catalog_upload_sessions` (transient state, not an entity)

| Column | Type | Null | Default | Check / note |
|---|---|---|---|---|
| `id` | `uuid` | no | `gen_random_uuid()` | primary key; the upload's identifier |
| `user_id` | `uuid` | no | — | `REFERENCES users(id)`; the caller |
| `upload_id` | `text` | no | — | the S3 multipart upload's id |
| `original_key` | `text` | no | — | `intake/{uploadId}/original`, where `uploadId` is this row's `id` and not the S3 multipart `upload_id`; unique |
| `sanitized_key` | `text` | yes | `null` | `catalogs/{catalogId}/{hash}.{ext}`, recorded before the write so a crash is cleanable; `catalogId` is the UUID the service generates for the record before the object is written |
| `file_name` | `text` | no | — | the validated name |
| `declared_bytes` | `bigint` | no | — | `> 0 AND <= 104857600` |
| `format` | `text` | no | — | `IN ('xls','xlsx','doc','docx','pdf')` |
| `content_hash` | `char(64)` | yes | `null` | written after the sanitizer, before the object write |
| `state` | `text` | no | `'open'` | `IN ('open','completing','done','aborted','failed')` |
| `created_at` | `timestamptz` | no | `now()` | — |
| `url_expires_at` | `timestamptz` | no | — | the part URLs' expiry plus the workspace's grace; the session's own bound, not the catalog's `expires_at`, which is open fact #3 and is not created (§2) |
| `completed_at` | `timestamptz` | yes | `null` | written when the completion request settles, whether the row becomes `done` or `failed` |
| `aborted_at` | `timestamptz` | yes | `null` | written when the row becomes `aborted` (§9's terminal time) |

Unique `original_key`; index `(user_id, state)` and `(state, url_expires_at)` for the
sweep §9 defers. The row is the intake's only durable transient state; the sweep
the owning slice runs (§9) deletes it, with the keys §9's terminal statement
names, one hour after a terminal state, and no product read exposes it. R2 runs
no sweep and deletes no row: the staging object is deleted by the refusal, the
duplicate, or the cancellation that settles the session (FR-030, FR-043, FR-050),
and a removal the storage refuses is exactly what the sweep's terminal statement
settles.

## 6. The duplicate projection

One repository method returns exactly:

```ts
type RetainedDuplicate = {
  id: string;
  fileName: string;
  uploadedAt: Date;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
};
```

It reads `id, file_name, uploaded_at, status` from `catalogs` where
`content_hash = $1 AND deleted_at IS NULL`, and it has no `user_id` predicate by
design. It is called only after the partial unique index reports `23505`
(ADR-170). A soft-deleted catalog is never the row the conflict names: the
partial index excludes it, so it cannot be the row an insert conflicts with, and
the predicate filters it in any case. The isolation test names it
`DUPLICATE_PROJECTION` and fails if a fifth field appears or if a second
cross-merchant query is added.

## 7. Indexes, queries, and the query budget

| Path | Statements | Index used | Budget |
|---|---|---|---|
| `GET /api/v1/catalogs/quota` | session (R1), monthly counter, active count, account overrides | `catalog_monthly_uploads` PK; `catalogs_user_id_retained_idx`; `users` PK | p95 ≤ 500 ms for the request; each statement ≤ 100 ms p95 |
| `POST /api/v1/uploads` | session, file checks (no query), monthly counter, active count, overrides, attempt upsert, session insert | the same, plus `catalog_upload_attempts` PK | p95 ≤ 800 ms |
| `POST /api/v1/uploads/{id}/complete` | session, session row, object head, workspace work, advisory lock, counter + active reads, catalog insert, counter upsert, duplicate projection on conflict | PKs and the two merchant indexes; the partial unique index on conflict | p95 ≤ 10 s for a 1–4 MB file; the scan's 90 s is the refusal threshold, so a completion whose scan runs near it is one of the at most 5% above 10 s the percentile permits, and the path fails when more than 5% exceed 10 s; the SQL stays ≤ 100 ms p95 per statement |
| `DELETE /api/v1/uploads/{id}` | session, session row, abort, delete, state update | PK | p95 ≤ 800 ms |

No query loops per row. The active count is one aggregate over the partial index.
The complete path's transaction is short: the screening happens before it opens
and the object is written before it begins.

## 8. The migration and its rollback

`0004_file_intake.sql` creates the four tables in the order `catalogs`,
`catalog_monthly_uploads`, `catalog_upload_attempts`, `catalog_upload_sessions`,
with their checks, foreign keys, unique constraints, and indexes.
`0004_file_intake.down.sql` drops them in the reverse order (sessions, attempts,
monthly, catalogs), so the applied-step count returns to 3. The down is the exact
inverse and is exercised in CI and staging before production: the integration
suite applies the up, seeds a record and its counters, applies the down, asserts
the four tables are gone and the applied count is 3, and re-applies the up.

The migration is backward compatible with the currently deployed application
(R1): R1 never reads or writes the four tables, so an R1 instance can run against
the migrated schema while the R2 instance is rolled out. The boot guard refuses
an R1-built instance against the R2 schema and an R2-built instance against the
pre-R2 schema, so the rollback is run with the service stopped or before the new
instance listens.

## 9. The sweeps this slice does not run

No sweep runs in R2. The removal of a workspace file whose request died, the
abort and deletion of an expired session with its staging object, and the removal
of the counter rows past their window are one deferred obligation, recorded in
`plan.md` → Complexity Tracking row 23 with its owner (R3) and its review date;
no task in `tasks.md` runs one. What this section states is the contract that
sweep implements, and the state this slice records so that it has something to
read.

| Target | Predicate | Action | What R2 records |
|---|---|---|---|
| `catalog_upload_sessions` | `state IN ('open','completing') AND url_expires_at < now()` | abort the multipart (best effort), delete `original_key` and `sanitized_key` if present, set `state = 'aborted'`, `aborted_at = now()` | `state`, `url_expires_at`, `original_key`, `sanitized_key` |
| `catalog_upload_sessions` | `state IN ('done','failed','aborted') AND COALESCE(completed_at, aborted_at, created_at) < now() - interval '1 hour'` | delete `original_key`; delete `sanitized_key` when the state is `failed` or `aborted`; confirm each key's absence with a `HEAD`; then delete the row | `state`, `original_key`, `sanitized_key`, `completed_at`, `aborted_at` |
| `catalog_upload_attempts` | `window_start < now() - interval '1 hour'` | delete | `window_start` |
| `catalog_monthly_uploads` | `month_start < (date_trunc('month', now() AT TIME ZONE 'Africa/Tripoli') - interval '1 month')::date` | delete | `month_start` |
| the workspace | a file older than one hour | delete | the file's name `WORKSPACE_DIR/{uploadId}.{stage}` and its modification time |

When the owning slice implements it, the sweep is one idempotent pass under
`pg_try_advisory_lock` — run from the API process or from the worker, whichever
that slice chooses, so two instances never double-run; it aborts a session before
it deletes its row, so a crash between the two leaves the row for the next run;
the keys are on the row, so no bucket listing is needed; and it runs once at
boot, so a session abandoned before a restart is cleared without waiting for the
hour. The predicates need no column these tables do not carry, both counter
tables are indexed on their window column, `catalog_upload_sessions` is indexed
on `(state, url_expires_at)`, and a workspace file is named after its session's
`id` rather than an opaque temporary name.

**The terminal row is where a failed session's keys are deleted, not only its
row.** §5 keeps `original_key` and `sanitized_key` on a refusal whose withdrawal
the request could not confirm, and the terminal statement is what settles it: it
deletes both keys, confirms their absence, and only then removes the row, so a
key is never dropped while its object survives — which would leave the refused
file's bytes both unreachable and unswept. A `done` row's `sanitized_key` is
**not** this statement's to delete: for an accepted upload it is the catalog's
kept object (§10, and R15 removes it with the row), and for a duplicate it names
an object the duplicate path already withdrew (FR-043); only `failed` and
`aborted` rows carry a sanitized key that is nobody's kept file. The terminal
time is `aborted_at` for an `aborted` row and `completed_at` for a `done` or
`failed` one, because a `failed` row is a completion request that settled
without an acceptance and `completed_at` is when it did; a row that carries
neither (a crash between the state write and its time) falls back to
`created_at`, so no terminal row is left unswept.

**What R2 does instead.** Two bounds are enforced without a sweep. Every part URL
expires fifteen minutes after it is signed, so an abandoned multipart can receive
no further byte (`contracts/intake-api.md` §2.2), and the complete route accepts
only the caller's `open` session, so an expired or aborted session can never
become a catalog (§2.3 and §6.3 of that contract). The staging object is private
and reachable by no product read (§10). What the deferred sweep reclaims is
therefore storage — the bytes of an abandoned multipart and its staging object,
and the counter rows no rule reads again — not a product outcome; until it runs,
the two counter tables grow by at most one row per merchant per month and one per
merchant per active 15-minute window. `research.md` R-07's "rows older than the
previous month are swept" is read as this same obligation, not as a second
sweep.

## 10. Object storage and the workspace

| Object | Key | Lifetime |
|---|---|---|
| The multipart original | `intake/{uploadId}/original` | deleted when the intake settles; an abandoned session's object is reclaimed by the sweep the owning slice runs (§9), and no route can write to it after the part URLs expire |
| The kept sanitized file | `catalogs/{catalogId}/{sha256}.{ext}` | lives with the catalog row; R15 removes it with the row |
| The workspace file | `WORKSPACE_DIR/{uploadId}.{stage}` | deleted before the response; a file whose request died is left for the sweep the owning slice runs (§9, row 23), because R2 runs none |

The bucket is private. A key carries no merchant identifier; access is through
the owning module and a short-lived signed URL (ADR-172). The kept object's
content type is the catalog's `content_type`; its byte count is `byte_size`.
The catalog's identifier is generated by the service before the sanitized object
is written, so the key exists before the row and a failed write leaves nothing
the insert can point at; the insert uses the same identifier.

## 11. Invariant → constraint map

| Invariant (source) | Constraint or mechanism |
|---|---|
| A catalog belongs to one merchant (domain model) | `catalogs.user_id NOT NULL REFERENCES users(id)` and the scoping entry point |
| Status is the closed four-value enum (File Processing Rules) | `catalogs_status_check` |
| The hash is unique platform-wide over non-deleted catalogs (FR-042, FR-045; ADR-169) | `catalogs_content_hash_retained_uq` partial unique index, whose predicate releases a soft-deleted row's hash (FR-046) |
| The monthly count survives a deletion (FR-011, ADR-167) | the counter row, incremented in the acceptance transaction, never read from `catalogs` |
| The monthly and active limits are atomic (FR-014; research R-08) | `pg_advisory_xact_lock(hashtextextended(user_id, 0))` in the acceptance transaction |
| The attempt bound counts every submission that reaches it (FR-061) | the pre-sign upsert, before the multipart create |
| The name is preserved exactly as supplied (FR-036) | `file_name` stored unmodified; the column's check is a storage bound, and the 255-UTF-16-unit limit is the service's (FR-021) |
| The kept size and type are the sanitized file's (AC-017) | written after the sanitizer; the original's values are never stored |
| A refused file's bytes do not survive (FR-030) | the refusal path deletes the original and the sanitized key and verifies their absence before it answers, or answers the storage failure and leaves both keys on the `failed` row for the terminal sweep (§9), which deletes them and confirms their absence before it deletes the row |
| A catalog's bytes exist before its row (FR-040) | the object write precedes the insert; a failed insert deletes the object |

## 12. What is not stored

- The upload's attempt outcomes are a structured log line, not a table: the
  outcome, the cause, the time, and the request's correlation identifier
  (FR-062). The cause is the refusal code and nothing else — a scanner's
  signature is neither the cause nor a second field. The time is the injected
  clock's instant, read once at settlement — the same clock §1–§2 give
  `uploaded_at` — and never the database's `now()`; its format and zone are
  `contracts/intake-api.md` §1's. No entity, no relation, no retention window of
  its own.
- The duplicate outcome stores nothing on the refused upload: the original's
  four fields are read at the moment the duplicate is recognized — when the
  partial unique index reports `23505`, in that request (§6) — and are not
  re-read when the outcome is rendered.
- The page's progress is client state; the server stores no percentage.
- No file content is stored in PostgreSQL; the bytes are in object storage and
  the row carries the key, the size, and the hash.

## 13. Retention

A catalog row and its object live until a merchant delete (R4), an administrator
delete (R16), or the 90-day retention job (R15) removes them; R2 implements no
deletion. A soft-deleted row is retained with `deleted_at` and filtered from every
read path; its object stays until the row is removed for good (the spec's
Clarification of 2026-11-13 (6)). The counters are swept on their own bounds; the
session rows are transient and carry no product history.
