# Quickstart — Run and Validate File Intake

**Feature**: `002-file-intake` | **Date**: 2026-11-13 | **Plan**: [plan.md](./plan.md)

A runnable guide to the slice: bring the stack up, upload a catalog, and prove
each contract with the suite that owns it. It contains no implementation code —
the migration, the service, and the suites belong to `tasks.md` and the
implementation phase. Values are referenced, not restated: the plan's
Constitution Mandated Values and plan values, [`contracts/intake-api.md`](./contracts/intake-api.md),
[`contracts/intake-formats.md`](./contracts/intake-formats.md),
[`contracts/ui-contracts.md`](./contracts/ui-contracts.md), and
[`data-model.md`](./data-model.md).

## 1. Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node.js | 22 LTS (`.nvmrc` = `22`, `engines.node` = `>=22 <23`) | ADR-021, CMV row 10 |
| pnpm | 10 through Corepack | The workspace and the committed lockfile |
| Docker Engine | 24 or later with Compose v2 | PostgreSQL 16, PgDog, SeaweedFS, ClamAV |
| PostgreSQL client | 16 (`psql`) | The migration's down check |
| Playwright browsers | Installed by `pnpm exec playwright install` | End-to-end, accessibility, visual |

No cloud account and no network beyond `pnpm install` are needed: object storage
is the local SeaweedFS container, and the scanner is either the local ClamAV
container or the deterministic double. The double is the default in tests and
CI; the container is used for the manual safety scenarios and the end-to-end
suite when `SCANNER=clamd` is set.

## 2. First run

```bash
corepack enable
pnpm install
cp .env.example .env          # Windows: copy .env.example .env
pnpm db:up                    # PostgreSQL 16 and PgDog
docker compose -f compose.dev.yml --profile storage up -d seaweedfs
pnpm storage:init             # creates the development bucket through the S3 gateway
pnpm db:migrate               # the four committed migrations
pnpm dev                      # web :3000, api :3001
```

`pnpm db:up` starts PostgreSQL and PgDog; SeaweedFS starts under the `storage`
profile, and the scanner under the `scanner` profile:

```bash
docker compose -f compose.dev.yml --profile scanner up -d clamav
```

**Expected**: `pnpm db:migrate` applies `0004_file_intake.sql` after R1's three
and creates `catalogs`, `catalog_monthly_uploads`, `catalog_upload_attempts`,
and `catalog_upload_sessions`; the applied-step count is 4. `GET
http://localhost:3001/health` answers
`{"status":"ok","database":"ok","storage":"ok","scanner":"ok"}`. `/upload`
answers 302 to `/auth/sign-in?redirect=/upload` for a guest and renders the page
inside the shell for a signed-in merchant.

**Environment** (`.env.example` lists every key; no secret is committed):
R1's keys unchanged, plus `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`,
`S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `SCANNER` (`double` or `clamd`),
`CLAMD_HOST`, `CLAMD_PORT`, and `WORKSPACE_DIR`. The storage credentials are the
local SeaweedFS configuration's placeholders, never production values; R12's
secret store holds production values.

### 2.1 Reading the development bucket

```bash
docker compose -f compose.dev.yml exec seaweedfs weed shell -c "s3.bucket.list"
```

The bucket is private. The two keys the slice writes are
`intake/{uploadId}/original` (deleted when the intake settles) and
`catalogs/{catalogId}/{sha256}.{ext}` (lives with the record); a key carries no
merchant identifier (data-model §10).

### 2.2 Resetting a development database and its objects

```bash
pnpm db:reset
pnpm db:seed -- --accounts 10 --sessions 5
pnpm storage:init -- --reset
```

`pnpm db:seed -- --accounts 10000 --catalogs 50000` produces the load
condition's base (plan → Scale/Scope); the seeder refuses to run when
`NODE_ENV=production`.

## 3. Walk the page

### Scenario 1 — An accepted upload (FR-001 … FR-008, FR-035 … FR-039)

1. Sign in as a merchant and open `/upload`. **Expect** «رفع كتالوج», the
   subtitle, the quota block with `12 / 50` and `34 / 300`, the drop area on a
   fine pointer (or the 56 px «رفع ملف» action on a touch screen), and the
   format line under the action.
2. Choose a valid 2 MB `.xlsx`. **Expect** the card with the name, `2.3 MB`,
   `Excel`, and the progress surface beneath it; the percentage in Latin digits;
   when the last part is acknowledged, «جارٍ فحص الملف» with «إلغاء» withdrawn;
   then the success panel naming the file, stating the record is in My Files,
   linking to `/my-files`, and stating that processing begins automatically.
3. **Check**:

   ```sql
   SELECT count(*) FROM catalogs;                         -- 1
   SELECT status, file_name, byte_size, content_type FROM catalogs;
   SELECT count(*) FROM catalog_monthly_uploads;           -- 1
   SELECT count(*) FROM catalog_upload_sessions WHERE state = 'done'; -- 1
   ```

   The object exists at `catalogs/{catalogId}/{sha256}.{ext}`, and
   `sha256sum` of the object equals the row's `content_hash`. The status is
   `uploaded`; the supplier, issue date, expiry date, and first-page flag are
   null (AC-008).

### Scenario 2 — The duplicate (FR-041 … FR-046)

Upload the same file again while under both limits. **Expect** «الملف موجود
مسبقاً», the original's name, its date as `YYYY-MM-DD`, its status in the Arabic
label, «عرض القطع» → `/parts?file=<id>`, and «رفع آخر». **Check**: one catalog
row, the monthly and active counts unchanged, and no `intake/{uploadId}/original`
object left. When the original's status is `failed`, the outcome adds
«فشلت معالجة الملف الأصلي…» and the link «ملفاتي» → `/my-files`.

Upload the same file from a second merchant's account. **Expect** the same
outcome naming the first merchant's original and no other field of that
merchant's record; the isolation suite asserts the four-field projection.

### Scenario 3 — File-level refusals (FR-021 … FR-028)

Each case is refused before any byte is transferred, shows the error panel with
its one cause and «اختيار ملف آخر», retains nothing, creates no row, and
consumes no quota:

- a 101 MB file → `UPLOAD_TOO_LARGE`; a file of exactly 100 MB is accepted for
  validation; one byte more is refused;
- an empty file → `UPLOAD_EMPTY`;
- `catalog.exe` and `catalog.pdf.exe` → `UPLOAD_UNSUPPORTED_FORMAT`;
- `كتالوج.XLSX` → accepted for validation;
- a name of 255 UTF-16 code units → accepted; 256 → `UPLOAD_INVALID_NAME`;
- a name carrying U+202E, U+200B, U+FEFF, U+061C, U+2028, U+2029, or `/` →
  `UPLOAD_INVALID_NAME`, the message «ملف باسم غير صالح…», no card, and the name
  nowhere on the page;
- a name carrying U+200C, U+200D, or an emoji → accepted, the name preserved
  exactly.

A crafted client (curl) sending a refused name gets the same code and stores
nothing: the page's check is not the trust boundary (FR-026).

### Scenario 4 — Content refusals (FR-027, FR-029)

- A PDF renamed `.xlsx`, a Word document renamed `.xls`, an Excel workbook
  renamed `.docx`, and an Excel workbook renamed `.doc` →
  `UPLOAD_CONTENT_MISMATCH`.
- A ZIP renamed `.xlsx` with no `[Content_Types].xml` → `UPLOAD_CONTENT_MISMATCH`
  (not corrupt).
- A truncated OLE2 and a truncated ZIP → `UPLOAD_CORRUPT`.
- An encrypted PDF and an encrypted OOXML package (an OLE2 container carrying
  `EncryptionInfo` and `EncryptedPackage`) → `UPLOAD_PASSWORD_PROTECTED`, with
  no retry offered.

### Scenario 5 — The sanitizer and the scan (FR-030 … FR-034)

- Upload a macro-enabled workbook renamed `.xlsx`. **Expect** acceptance, and
  the kept object unzipped carries no `vbaProject.bin`, no `activeX` part, and
  no executable embedding; an embedded chart or image is kept.
- Upload a macro-enabled Word document named `.docx` (a package carrying
  `word/vbaProject.bin`). **Expect** acceptance, and the kept package carries no
  `vbaProject.bin` and no `vbaData.xml`.
- Upload a PDF carrying JavaScript, an open action with an action dictionary,
  an embedded file, and XFA. **Expect** acceptance, and the kept PDF's objects
  carry none of them; the document still opens.
- Upload a document whose executable content cannot be removed — a `.doc` whose
  macro cannot be removed, and the fixture directory's other unremovable case —
  and a sanitized file that no longer opens → `UPLOAD_SANITIZATION_FAILED`.
- With `SCANNER=clamd`, upload the EICAR test file → `UPLOAD_INFECTED`, «لم
  يُحفظ الملف», no retry. Stop the ClamAV container and upload a valid file →
  `UPLOAD_SCAN_UNAVAILABLE`, retry offered. Set the double's delay past the
  budget (the integration suite's injected clock) → the same cause.
- Upload an OOXML zip bomb and a PDF whose Flate streams expand past 1 GiB →
  `UPLOAD_EXPANSION_CAP`.
- **Check** after every refusal:

  ```bash
  docker compose -f compose.dev.yml exec seaweedfs weed shell -c "s3.bucket.list -limit 100"
  ```

  No object of the refused file remains, complete or partial; the session row is
  `failed` only when the sweep must finish a withdrawal, and the operational log
  line carries the cause and no merchant or file identity (FR-062), its
  `timestamp` reading the injected clock once, at settlement, in RFC 3339 with
  milliseconds and `Z` (`contracts/intake-api.md` §1 and §5).

### Scenario 6 — The quota (FR-010 … FR-019)

- Seed 49 accepted uploads this month and upload one more: the success panel
  withholds «رفع آخر» and the quota block shows the monthly exhausted text; the
  next attempt is refused `UPLOAD_MONTHLY_LIMIT`, with no error panel.
- Seed 300 active files: the next attempt is `UPLOAD_ACTIVE_LIMIT`, stating the
  delete and the 90-day retention.
- Exhaust both: the block names both, monthly first, each with its release, and
  `details` carries both codes.
- Open the page at a limit: the same content appears without an attempt, the
  upload control is withheld, and «تحديث» re-reads the counts.
- Give the merchant an override of 400/800: the block shows 400 and 800. Lower
  the quota below usage: uploads are refused until usage is under the limit and
  no file is deleted.
- Fail the quota read (stop the database or return the harness's failure):
  the block shows the inline failure and its retry, the counts are hidden, and
  the upload control remains available; the server still refuses at the limit.
- Seed 49 and start two uploads from two devices: at most one is accepted and
  the count never exceeds 50.

### Scenario 7 — The attempt bound (FR-061)

Send 60 attempts in one 15-minute window (the integration suite's injected
clock). **Expect** the 61st to answer `UPLOAD_TOO_MANY_ATTEMPTS` with
`retryAfterSeconds` and `Retry-After`, the error panel with the wait in Arabic,
«إعادة المحاولة» and «اختيار ملف آخر», nothing retained, and no quota consumed.
A file-level refusal and a limit refusal do not count; an accepted upload, a
duplicate, a retry, and a cancellation each count; a retry refused for the bound
counts as none and does not extend the wait.

### Scenario 8 — Cancel and departure (FR-048, FR-050)

- Activate «إلغاء» during a transfer. **Expect** the transfer to stop at once
  without a confirmation, the page back at the choosing state, no catalog, no
  quota, and no completed object; the multipart is aborted, and a session the
  abort could not clean is swept.
- Navigate away during a transfer: the same outcome.
- Navigate away after the transfer completed: the intake finishes, the record
  appears in My Files, and the quota is consumed.

### Scenario 9 — Sessions and blocks (FR-002 … FR-004)

- End the session while a transfer is in progress (sign out in another tab, or
  move the session's clock past its lifetime in the integration suite).
  **Expect** R1's ended-session state in place of the progress state, no
  transfer error, no retry, and nothing left.
- Block the account while a transfer is in progress: the blocked state, the
  same rule.
- Let the transfer complete, then end the session: the record is created and the
  page shows the ended-session state.
- Open `/upload` with an administrator session: the merchant sign-in page with
  R1's uniform refusal; the intake is never reached.

### Scenario 10 — Health and degradation (FR-062)

| Action | Expected `/health` |
|---|---|
| All services up | `200` with four `ok` fields |
| Stop SeaweedFS | `503` with `storage: "error"`, `database` and `scanner` `ok` |
| Stop ClamAV | `503` with `scanner: "error"` |
| Stop both | `503` with both `error` |
| Restore each | `200` again |

The backup/restore drill's assertion reads the four-field body
(`docs/runbooks/backup-restore.md`); the file store's own backup and restore are
R12's and are recorded as Complexity Tracking row 7.

### Scenario 11 — The shell at runtime (`EX-007`)

On `/upload`: the account menu opens, closes on Escape and on an outside
activation, and its sign-out confirmation ends the session; the sidebar collapses
to the icon rail and back; below 1024 CSS px «المزيد» opens the drawer, which
closes on the collapse control, Escape, or an outside activation with focus
returning to «المزيد», contains focus while open, and closes as part of a
destination's navigation; the bottom bar hides after 32 CSS px down and returns on
16 CSS px up or within 56 CSS px of the top, stays visible with reduced motion,
and its raised search action leaves the focus order while hidden; the overlays
stack as R1 fixes and never open together; the labels cut with «…» at 320 CSS px
without horizontal scroll; the four static-page links are in the footer band at
1024 CSS px and in the drawer below it; the axe scan and the keyboard-only upload
pass. This is the evidence that ends `EX-007`.

### Scenario 12 — The migration's rollback (data-model §8)

With the API stopped:

```bash
psql "$DATABASE_URL" -f packages/db/migrations/0004_file_intake.down.sql
psql "$DATABASE_URL" -c "\dt"          # the four tables are gone
```

**Expect** the applied-step count to return to 3, then re-apply `pnpm db:migrate`
and the count to return to 4. The integration suite runs the same up → seed →
down → up cycle.

### Scenario 13 — Documentation drift (ADR-031 item 4)

```bash
pnpm --filter @wafar/api openapi:emit     # regenerates apps/api/openapi.json
node scripts/check/documentation-drift.mjs
```

**Expect** zero drift: every route in §2 of the API contract is registered and
documented, every documented status and code is produced, every produced code is
documented, and no path or method mismatches. The script exits non-zero on the
first difference and runs in CI from this slice.

### Scenario 14 — The load run (CMV rows 6–7, SC-005 … SC-007)

```bash
pnpm load:seed -- --accounts 10000 --catalogs 50000
SCANNER=double pnpm load:upload
```

The first phase runs 300 concurrent transfers, 10 pre-sign requests/second, and
10 completed intakes/second for 120 seconds; the second phase doubles them
(600 / 20 / 20). The report prints p50 and p95 for the quota read, the pre-sign,
and the complete path, the slowest `pg_stat_statements` query, and the accepted,
duplicate, and refused counts by cause. It fails on a refusal other than the
fixture's expected duplicate, on a measured query above 100 ms p95, on a
percentile above its CMV row at either condition, or on a regression above 10% against the branching
version. Attach the report to the pull request.

## 4. The suites

| Command | Runs | Owns |
|---|---|---|
| `pnpm test` | Vitest unit and component tests | The name rules, the extension reading, the fixed cause order, the size and cap boundaries, the date/size/duration/status surfaces, the page's state machine |
| `pnpm test:integration` | Vitest against migrated PostgreSQL, local SeaweedFS, and the scanner double | Every route, the atomic quota, the duplicate race and the projection, the fail-closed scan, the scan budget, the rollback, the sweeps, the isolation allowlist, the refusal catalogue, the degradation suite, the operational record, the format probes, the sanitizer's per-item rules, the quota counting set, the attempt counting |
| `pnpm test:e2e` | Playwright against `pnpm dev` | The five user stories, the eleven presentations, focus and announcements, the cancel and departure, the links to unshipped pages, the shell's runtime, the guest return |
| `pnpm test:a11y` | `@axe-core/playwright` | Every state at 320 and 1280 CSS px in both appearances, plus the keyboard-only pass |
| `pnpm test:visual` | Playwright screenshots | The 44 visual baselines of `ui-contracts.md` §8 |
| `pnpm load:upload` | `scripts/load/upload-smoke.mjs` | The design and stress conditions, the percentiles, the query budget |
| `node scripts/check/documentation-drift.mjs` | The standalone drift test | The three-record comparison of `intake-api.md` §2–§4 |
| `node governance-drift-check.mjs` | The committed governance check | Zero drift; run it before every commit |

**Coverage**: `pnpm test:coverage` enforces ≥ 80% of changed production lines
(V8 provider).

## 5. Continuous integration

`.github/workflows/ci.yml` adds the `intake` job: migrations, the local
SeaweedFS service, the scanner double (or the ClamAV container), `pnpm test`,
`pnpm test:integration`, the documentation-drift step, and the a11y/visual jobs
the existing workflow already runs against `pnpm dev`. Every test runs offline;
the dependency-install step is the only networked step, and every action stays
SHA-pinned (ADR-143). A red gate blocks merge.

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `pnpm db:migrate` says the schema is newer than the build | The boot guard met a different applied-step count | Run the migration the build expects; the guard refuses a mismatch by design |
| `/health` answers `503` with `storage: "error"` | SeaweedFS is not up, the bucket is missing, or the credentials are wrong | Start the `storage` profile, run `pnpm storage:init`, check the `S3_*` keys |
| `/health` answers `503` with `scanner: "error"` | ClamAV is not up or `SCANNER=clamd` points at the wrong host | Start the `scanner` profile or set `SCANNER=double` |
| An upload fails with `UPLOAD_STORAGE_UNAVAILABLE` | The bucket or the gateway is unreachable | Check the container and the bucket; the retry re-sends the same file |
| A large upload fails at the last part | The presigned URL expired (15 minutes) | Start a new upload; the page's retry re-sends the file |
| `UPLOAD_INCOMPLETE` on complete | The parts list is missing a part or the ETags do not match | Choose the file again; a tampered part list cannot complete, and the same bytes are not re-sent |
| Visual diffs on the first run | Baselines are generated, not taken from the lab | `pnpm test:visual -- --update-snapshots`, review, commit |
| `documentation-drift` fails after a route change | The contract and the route table disagree | Update §2–§4 or the route; the test names the difference |

## 7. Done when

- [ ] Scenarios 1–14 pass; the SQL checks of Scenario 1 hold.
- [ ] The exactly-100 MB boundary is accepted and one byte more is refused.
- [ ] A duplicate names the original, its date, and its parts link; no second
      row exists; the bytes are withdrawn.
- [ ] A file refused for any cause leaves no object, no row, and no quota, and
      its message is the one `ui-contracts.md` §4.5 records.
- [ ] The 44 visual baselines exist; the idle pair matches its reference images.
- [ ] The axe scan and the keyboard-only upload pass at 320 and 1280 CSS px in
      both appearances.
- [ ] `pnpm test`, `pnpm test:integration`, `pnpm test:e2e`, `pnpm test:a11y`,
      `pnpm test:visual`, `pnpm load:upload`,
      `node scripts/check/documentation-drift.mjs`, and
      `node governance-drift-check.mjs` pass.
- [ ] The load report shows the design and stress conditions' percentiles within
      CMV rows 6–7, the stress phase's counts, and no refusal other than the fixture's
      expected duplicate in the design and stress phases; the quota-boundary
      report — a separate run of the same script, not a phase of the load run —
      shows its one acceptance and 59 limit refusals per merchant, recorded by
      cause against SC-005.
- [ ] The migration's down returns the applied count to 3 and the up restores 4.
- [ ] `/health`'s four-field body is asserted by the degradation suite and read
      by the backup/restore drill.

## 8. Not covered here

- Extraction and the queue (R3), My Files (R4), Parts (R5), the Catalog page
  (R6), notifications (R9), the static pages (R11), deployment and the object
  store's backup (R12), the administrator application (R13), and retention
  (R15).
- The file store's off-host backup and restore: no runbook or drill exists yet;
  the gap is Complexity Tracking row 7 with R12 as owner.
- Processing any uploaded file: in the R2-only increment the record rests at
  `uploaded`; R3 advances it.
