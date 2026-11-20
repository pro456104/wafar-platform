## ADR-163 — The registered measurement host is a self-hosted 8-vCPU runner

**Status**: Superseded — 2026-11-10 by ADR-164. **Constitution version**: 6.3.2 (unchanged)
**Owning directory**: `.github/workflows/`, `scripts/load/`, `specs/001-identity-foundation/`, `reports/`
**Owning feature**: R1 — the identity foundation (`specs/001-identity-foundation/`).

**Context.** ADR-159 fixed the SC-009 profile and its verdict, and ADR-162 raised
the p50 and work-only bounds to 500 ms after the first registered run
(`42776605743`) measured 249.5 ms against 150 ms. Five registered runs later the
picture is different. Runs `42787877288`, `42793001674`, `42798975303`,
`42807676753`, and the isolated re-run of its `load` job all record the same
verdict on the GitHub-hosted `ubuntu-24.04` class: 600/600 accepted, 0 refused,
the limiter probe refused, and an aggregate p50 between 1658.1 and 1932.3 ms.
The `hostProbe` added in `87ce569` measures the cause: 4 CPUs (AMD EPYC 9V74),
a one-minute load average of 3.9 to 6.4 against those four cores, and 213 ms
per scrypt hash at CMV row 2's cost.

The arithmetic then closes. The profile's 600 requests carry 800 scrypt hashes —
account creation hashes the password and the code, sign-in verifies the
password, recovery hashes the code — so 60 seconds at 10 requests/second demand
13.3 hashes per second, or **2.8 cores of hashing alone** at 213 ms each, before
the API's event loop, PostgreSQL, and the 20-user generator are counted; all of
them share the same four vCPUs. The measured quickest request (253.8–264.5 ms)
shows the queue rather than the service, and the median rises over the window
(p95 3.3–3.9 s, slowest 7.6–13.8 s). Two controls rule out the application:
`unit` and `integration` take 0.8–0.9 and 3.1–4.1 minutes in every run, and
`enumeration` — sequential hashing — passes once the host is not saturated.
Raising libuv's pool to eight threads (`83a5d71`) changed nothing, and re-running
`load` alone, with no other job in flight, changed nothing (1716.3 ms). The
`ubuntu-24.04` class is simply undersized for the profile the plan defines.

**Decision.**
1. The registered measurement host becomes a **self-hosted Linux runner with at
   least 8 vCPUs**, registered to this repository with the labels `self-hosted`,
   `linux`, `x64`, and `wafar-load`, and no workload other than the `load` job
   during a measurement.
2. The `load` job selects it through the repository variable
   `LOAD_RUNNER_LABELS` (a JSON label array). The committed default remains
   `["ubuntu-24.04"]`, so a clone without the variable stays runnable and every
   run there is a **development check**, never the registered verdict.
3. The profile itself does not move: the condition (10 requests/second from 20
   origin keys at 500 concurrent sessions), the 600 requests, the key plan, the
   50 ms acceptance wait, the limiter probe, and the 500/1,000/500 ms bounds
   stay as ADR-159 and ADR-162 fixed them. Only the host that carries the
   verdict changes.
4. The verdict is the passing `sc-009-load` artifact from that host, attached at
   `reports/sc-009-load.json` with the run identifier, host, and environment.

**Alternatives considered.**
- *Raise the bounds again to cover the 4-vCPU class.* Rejected: 1,716 ms would
  need a bound near 2,000 ms with no margin, which measures the queue rather
  than the service and would leave SC-009 meaningless.
- *Lower the scrypt cost to N = 16384 or p = 1.* Rejected earlier by ADR-162
  and rejected again: it weakens credential storage to fit a host that was
  never sized for the profile.
- *Move the generator off the host but keep the 4-vCPU class.* Rejected: the
  hashing alone needs 2.8 cores and PostgreSQL and the API need the rest; the
  generator is a small share of the load.
- *Buy a GitHub larger runner.* Not available: this account has no hosted
  larger runners and no organisation on a paid plan, and the standard class is
  four vCPUs.

**Consequences.** The plan's "one host" rule and its measurement-host paragraph
name the self-hosted class; the load job's `runs-on` reads
`LOAD_RUNNER_LABELS`; the escalation report records the runs that proved the
4-vCPU class inadequate and the runner the verdict needs. SC-009, R1's
acceptance condition 4, and T254/T257/T261/T262/T267/T270/T272 stay open until
a run on the registered host reports `verdict: pass` with
`verdictScope: registered measurement host`. Every live `ADR-001 … ADR-163`
range string moves to ADR-163, and `Project-Technologies.txt`'s header list
gains 163. The constitution stays **6.3.2**: no principle, register entry,
entity, page, feature, module, or Usage Limit changes. Review date: 2026-12-09.

**Annotation (2026-11-10, ADR-164).** This decision is superseded. The
self-hosted 8-vCPU runner it requires is not available to the repository — no
paid plan, no hosted larger runner, and no registered self-hosted runner — and
the owner's instruction is that no paid infrastructure is used. ADR-164 lowers
SC-009's peak condition to 5 authentication requests per second and returns the
registered measurement host to the GitHub-hosted `ubuntu-24.04` class, so the
profile fits the free runner and this record's host change is withdrawn. The
record is kept, not rewritten.

---

## ADR-164 — SC-009's peak rate is 5 authentication requests per second

**Status**: Accepted — 2026-11-10. **Constitution version**: 6.3.2 (unchanged)
**Owning directory**: `.github/workflows/`, `scripts/load/`, `specs/001-identity-foundation/`, `reports/`
**Owning feature**: R1 — the identity foundation (`specs/001-identity-foundation/`).

**Context.** SC-009 measures the three authentication operations at a peak of no
more than 10 authentication requests per second. That figure entered the
specification on 2026-10-11 as an authored measurement ceiling — "a modest,
explicit ceiling" — and was never derived from `docs/capacity-model.md` §3.1.
That section sizes the platform's read envelope at 300 requests per second (600
at the stress ceiling), 3,000–5,000 concurrent sessions, and 10,000 registered
accounts in six months; it names no authentication rate.

Once ADR-159 fixed the profile, the authored figure became the binding
constraint, and the measurement showed what it costs. Ten requests per second
carry 800 scrypt hashes in a 60-second window — account creation hashes the
password and the code, sign-in verifies the password, recovery hashes the
code — so 13.3 hashes per second. The registered four-vCPU `ubuntu-24.04` class
measures 213 ms per hash under the run's own `hostProbe`, so hashing alone needs
**2.8 cores** before the API's event loop, PostgreSQL, and the 20-user generator
share the same four vCPUs. Five registered runs (`42787877288`, `42793001674`,
`42798975303`, `42807676753`, and the isolated re-run of its `load` job) record
the same ceiling: 600/600 accepted, 0 refused, the limiter probe refused,
aggregate p50 between 1658.1 and 1716.3 ms, p95 between 3.3 and 3.9 s. The
thread-pool change (`83a5d71`) and the isolated re-run each moved nothing.

ADR-163 answered by moving the registered host to a self-hosted 8-vCPU runner.
That host is not available to this repository: the account has no paid plan and
no hosted larger runner (the endpoint returns 404), and no self-hosted runner is
registered. The owner's instruction of 2026-11-10 is that no paid infrastructure
is to be used and the work must complete on the free runner. A registered host
that cannot be obtained is not a registered host, so the decision it carried
cannot stand.

**Decision.**
1. SC-009's peak condition becomes **5 authentication requests per second**
   across the three operations. The other figures of the measurement condition
   do not move: 10,000 registered accounts, 500 concurrent sessions, 600
   measured requests (200 per operation), 20 origin keys with one distinct
   number key per request, the 50 ms acceptance wait, the limiter probe, and the
   **500 / 1,000 / 500 ms** bounds ADR-162 fixed. CMV row 2's scrypt profile
   (N = 32768, r = 8, p = 3) does not move either.
2. The profile keeps 20 virtual users and 600 requests, and each user issues one
   request every **4 s**, staggered 100 ms apart, so the aggregate inter-arrival
   is a steady 5 per second and the window is **120 s**.
   `scripts/load/auth-smoke.mjs` follows: `intervalMs = 4_000`, 30 steps per
   virtual user, 10 requests per operation per user.
3. The registered measurement host returns to the **GitHub-hosted `ubuntu-24.04`
   class** in `.github/workflows/ci.yml` — one job, the fixed PostgreSQL 16
   service, the committed seeder, and the script's own API at the declared
   50 ms — and its report again carries `verdictScope: registered measurement
   host`. ADR-163 is superseded; the `LOAD_RUNNER_LABELS` indirection and the
   self-hosted label set are withdrawn, and a run on any other host is a
   development check.
4. The rate is a measurement condition, not a service limit: FR-033's per-key
   budgets still decide each request, and a request above the condition is
   handled exactly as below it (Clarifications 2026-11-05).
5. The next registered run is read against this profile. If the four-vCPU class
   still misses a bound, the shortfall is recorded in a new decision; no bound
   and no limit in the script is lowered to absorb it.

**Alternatives considered.**
- *Keep 10 requests per second and provide the 8-vCPU host.* Rejected by the
  owner's instruction of 2026-11-10: no paid infrastructure, and no such host
  exists in the account. The work must be completable with what the project has.
- *Weaken scrypt to N = 16384 or p = 1 to fit the four-vCPU class at 10 requests
  per second.* Rejected twice before (ADR-162) and rejected again: it trades
  credential resistance for a rate the product does not need.
- *Raise p50 to 2,000 ms.* Rejected: 1,716 ms would pass without margin, and the
  number would measure the host's queue rather than the service.
- *Leave SC-009 open until a host appears.* Rejected: R1's acceptance condition 4
  would stay open indefinitely on a figure the capacity model never required.

**Why 5 is still a real ceiling.** Five authentication requests per second is
432,000 requests a day. The six-month plan is 10,000 registered accounts and
50,000–100,000 visits a day, and authentication is a fraction of a visit; the
capacity model's 300 requests per second is the whole platform's read envelope,
not the identity surface's. At 5 per second the profile carries 800 hashes in
120 s — 6.67 per second, about **1.42 cores** at the measured 213 ms — beside
the API, PostgreSQL, and the generator, inside four vCPUs rather than beyond
them.

**Consequences and migration/backfill.** No schema, migration, or data change.
`spec.md` SC-009 and Assumptions state the new peak; `plan.md` → Constraints,
CMV row 6, the Budget check, and **The SC-009 load profile** rows 1–2 follow;
the script's header and interval follow; `.github/workflows/ci.yml` returns the
`load` job to `ubuntu-24.04` and the registered scope; the escalation report
records §10. ADR-159 and ADR-163 each carry an annotation. The live
`ADR-001 … ADR-163` range strings move to `ADR-001 … ADR-165`, and
`Project-Technologies.txt`'s header list gains 164. The constitution stays
**6.3.2**: no principle, register entry, entity, page, feature, module, or Usage
Limit changes. Review date: 2026-12-09.

**Correction (2026-11-10, before the accepted run).** Item 2's stagger is
**200 ms**, not 100 ms: twenty users staggered by the interval divided by the
user count (4 s ÷ 20) produce one request every 200 ms. The 100 ms value was
copied from the 10-per-second profile, where 20 users × 100 ms filled the 2 s
interval exactly; at 4 s it bunched each 20-request batch into 2 s and left the
next 2 s idle, so the stream was a 10-per-second burst rather than the steady 5
the decision requires. The first registered run under this record
(`42824045145`) measures the burst — aggregate p50 458.9 ms and p95 890.8 ms
inside the bounds, but account creation's p50 775.2 ms and the work-only p95
840.8 ms outside them — and the corrected stagger is read on the next run. The
rate, the 600 requests, the 120-second window, and every bound are unchanged.

---

## ADR-165 — The sign-up path hashes the password and the one-time code concurrently

**Status**: Accepted — 2026-11-10. **Constitution version**: 6.3.2 (unchanged)
**Owning directory**: `apps/api/src/modules/auth/routes/`, `apps/api/src/modules/users/service/`, `scripts/load/`, `specs/001-identity-foundation/`, `reports/`
**Owning feature**: R1 — the identity foundation (`specs/001-identity-foundation/`).

**Context.** The first registered run under ADR-164's 5-per-second condition
(`42824045145`) reached the bounds for the first time in aggregate — p50 458.9 ms
against 500, p95 890.8 ms against 1,000, 600/600 accepted, no refusal — and
missed them in two places: `account_creation` p50 775.2 ms and the work-only p95
840.8 ms (recovery 522.8, sign-in 490.7). Two causes are visible in the
measurement.

The first is the arrival shape. The stagger was the 10-per-second profile's
100 ms: twenty users staggered by 100 ms fill 2 s of the 4 s interval, so the
host saw a 10-per-second burst and then 2 s of idle. The plan's own words are
"a steady 5 per second", and at a 200 ms stagger — the interval divided by the
user count — the twenty users interleave into one request every 200 ms. The
burst was also the shape that saturated the four-vCPU class in every earlier
run, so the correction is a fidelity fix, not a concession.

The second is the request's own service cost. Account creation hashes twice:
the pending password and the one-time code. The two hashes are independent —
the code's salt is derived from the request id, not from the password — but the
route ran them one after the other, so the request's hashing cost two scrypts
(about 426 ms at the 213 ms the host probe measures) before any queueing at all.
On that host the 500 ms p50 bound then had 74 ms of headroom over the service
floor alone, and the work-only ceiling had less. The same sequence made the
honeypot's discarded copy perform the same two hashes one after the other.

**Decision.**
1. The sign-up route starts the password's hash and passes the promise to the
   pending-request service; the service starts the one-time code's hash beside
   it and awaits both before it dispatches. The two scrypt calls therefore run
   concurrently and the request's hashing costs one scrypt's latency instead of
   two, while the dispatch still follows the hashing — so the channel's
   acceptance wait stays additive and the measured work-only figure remains the
   work. The values hashed, the cost (CMV row 2), the salt
   derivation, the stored row, the rate-limit spend, and the dispatch's
   acceptance wait are unchanged; only the order of two independent hashes
   changes, and no hash is weakened, skipped, or reused.
2. The honeypot's discarded copy runs its code hash beside the password's hash
   for the same reason, so the silent refusal's duration stays close to the
   accepted path's rather than falling a scrypt behind it (FR-029, AC-031;
   plan record 15). The discarded copy still stores nothing and dispatches
   nothing.
3. The load profile's stagger is the interval divided by the user count —
   **200 ms** at 4 s and 20 users — so the aggregate inter-arrival is the
   steady 5 per second the plan states. This is ADR-164's correction, recorded
   here with the code change it accompanies.
4. No bound moves: p50 ≤ 500 ms, p95 ≤ 1,000 ms, the work-only p95 ≤ 500 ms,
   the 5-per-second rate, the 600 requests, the key plan, and the scrypt profile
   all stand.

**Alternatives considered.**
- *Lower the scrypt cost to fit the four-vCPU class.* Rejected twice before
  (ADR-162) and rejected again: it trades credential resistance for a latency
  the product does not need.
- *Raise the work-only ceiling to 1,000 ms.* Rejected: the ceiling exists so
  that the provider's 750 ms wait stays inside SC-009's 1,000 ms; raising it
  removes that separation.
- *Lower the peak rate below 5 per second.* Rejected: the owner's decision of
  2026-11-10 sets 5, and the arithmetic shows the profile fits the class at 5
  once the stream is steady and the request's own work is halved.

**Consequences and migration/backfill.** No schema, migration, or data change.
`apps/api/src/modules/users/service/pending-request.ts` accepts the password's
hash as a promise and starts the code's hash before the dispatch;
`apps/api/src/modules/auth/routes/sign-up.ts` starts the hash and hands the
promise over, and the honeypot's discarded copy runs beside it. The plan's
profile row 2 states the 200 ms stagger, and the load script derives the
stagger from the interval and the user count so the two cannot drift apart
again. The escalation report records the run and both fixes. The live
`ADR-001 … ADR-165` range strings move to `ADR-001 … ADR-165`, and
`Project-Technologies.txt`'s header list gains 165. The constitution stays
**6.3.2**: no principle, register entry, entity, page, feature, module, or Usage
Limit changes. Review date: 2026-12-09.

---

## ADR-166 — The Catalog record at intake: the stored file name, byte count, and content type

**Status**: Accepted — 2026-11-13. **Constitution version**: 6.3.2 (unchanged; amended to 7.1.0 by ADR-176; the 7.0.0 amendment is ADR-175 — see `specs/002-file-intake/plan.md` → Constitution Check)
**Owning directory**: `packages/db/schema/catalogs.ts`, `packages/db/migrations/`, `apps/api/src/modules/catalogs/`, `specs/002-file-intake/`
**Owning feature**: R2 — file intake (`specs/002-file-intake/`).

**Context.** Open fact #9 records that a catalog's stored byte count and content
type were undecided: the Product Register's one-line meaning says "its
metadata, its status, and its stored bytes" and registers no field identifier, so
the question was left to the slice that enforces validation. R2 enforces it. Two
more facts arrive with the same record: the duplicate outcome must name the
original file (File Processing Rules; FR-044), and My Files must show the
uploaded file (R4). Both need the uploaded file's name, which the Glossary's
`Catalog` metadata list — supplier, issue date, upload date, expiry date — does
not name. The name is shown to another merchant in the duplicate outcome, so its
character set and length are validation rules as much as storage ones.

**Decision.**
1. The `catalogs` table carries `file_name text NOT NULL`: the name exactly as
   the browser supplied it, neither normalised nor rewritten. The service refuses
   a name carrying a bidi control or isolate (U+202A–U+202E, U+2066–U+2069), an
   invisible direction mark (U+061C, U+200E, U+200F), a zero-width or byte-order
   character (U+200B, U+FEFF), another control character (U+0000–U+001F,
   U+007F–U+009F), or a path separator, and a name longer than **255 UTF-16 code
   units** (FR-021). The two joiners U+200C and U+200D stay accepted. The
   column's check is `char_length(file_name) <= 255` as a storage upper bound; it
   never rejects a name the service accepts, because a name of 255 UTF-16 units
   has at most 255 code points. The exact UTF-16-unit rule is the service's, and
   the page and the server apply it to the same unit (the one a browser reports).
2. The table carries `byte_size bigint NOT NULL`, the kept file's byte count,
   with `byte_size > 0` and `byte_size <= 104857600` (100 MB, the Usage Limits
   ceiling), and `content_type text NOT NULL` from the closed set the intake
   keeps: `application/pdf`, `application/vnd.ms-excel`,
   `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
   `application/msword`, and
   `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
   Both are the **kept** file's values after sanitization, not the uploaded
   original's (FR-035, FR-036; AC-017).
3. The table carries `uploaded_at timestamptz NOT NULL`, recorded once when the
   record is created and never updated; it is the point the 90-day retention
   counts from (ADR-131; FR-039).
4. The status check is the registered four-value enum, and intake writes
   `uploaded` alone (FR-037); R3 writes every later value. The supplier, issue
   date, expiry date, and first-page flag are **not** created by this migration:
   R3 adds them, because `expires_at`'s semantics are open fact #3 (R15) and a
   column whose meaning is undecided must not be created early.
5. The name is shown through the Wafar UI layer's `WfFileName` surface, which
   isolates the Latin extension inside the Arabic name (ADR-128 §14); a refused
   name is never rendered and the neutral label «ملف باسم غير صالح» stands in its
   place (FR-025).

**Alternatives considered.**
- *Store the name normalised (trimmed, extension lower-cased).* Rejected: the
  record must preserve the name exactly as supplied (FR-021, FR-036), and a
  normalised name would make the duplicate outcome name a file the merchant did
  not upload.
- *Derive the name from the storage key.* Rejected: the key is opaque and
  carries the hash, not the supplied name, and a display name derived from a key
  would be a second source that drifts.
- *Measure the 255 bound in code points.* Rejected: the browser reports UTF-16
  code units, and a code-point bound would accept a name of 256 units whose
  astral characters are two units each; FR-021 fixes the unit.
- *Create the supplier, issue-date, expiry-date, and first-page columns now.*
  Rejected: they are R3's and `expires_at` has no decided meaning (open fact #3,
  R15); an undecided column invites a second interpretation.

**Consequences and migration/backfill.** `packages/db/schema/catalogs.ts` declares
the five fields; `0004_file_intake.sql` creates them and `0004_file_intake.down.sql`
removes them. `docs/domain-model.md` → Catalog gains the field facts and row 9 of
its unresolved-facts table is struck through with this record's number. The
register is unchanged: the Product Register's one-line meaning names no field, so
the field-level record lives in the domain model and here (Product Register's own
reading). No backfill exists — the table is new. Review date: 2026-12-11.

---

## ADR-167 — The monthly upload count is a persisted per-merchant counter

**Status**: Accepted — 2026-11-13. **Constitution version**: 6.3.2 (unchanged; see ADR-166's note)
**Owning directory**: `packages/db/schema/catalogs.ts`, `apps/api/src/modules/catalogs/service/`, `apps/api/src/modules/catalogs/repository/`
**Owning feature**: R2 — file intake.

**Context.** FR-011 fixes the monthly count as the number of accepted uploads in
the current calendar month, keyed to Libya's calendar, and requires it to survive
a deletion. A count read from `catalogs` would fail on two counts: a soft-deleted
row is filtered out of every read path, so deleting a file would restore a slot,
and a refused or duplicate upload writes no row, so the count would be right only
by accident. The constitution's quota semantics say the monthly limit counts
upload events and deletion does not restore it. The count therefore needs its own
storage, beside the record and keyed to the month.

**Decision.**
1. `catalog_monthly_uploads(user_id uuid NOT NULL REFERENCES users(id), month_start date NOT NULL, count integer NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL, PRIMARY KEY (user_id, month_start))` holds the count. `month_start` is the first day of the month in `Africa/Tripoli`, computed by one shared function from the injected clock (`packages/shared/src/format/month.ts`), not from the database's `now()`; the tests advance the clock across the boundary.
2. Acceptance increments the row in the same transaction that inserts the catalog: `INSERT … ON CONFLICT (user_id, month_start) DO UPDATE SET count = count + 1 RETURNING count`. If the returned count exceeds the effective monthly limit, the transaction rolls back, the just-written sanitized object is deleted, and the upload is refused for the monthly limit. A duplicate or a refusal never reaches the increment.
3. The read path is `SELECT count … WHERE user_id = $1 AND month_start = $2`; a missing row reads as **0**. The page's quota read uses the same function.
4. Rows older than the previous month are deleted by the hourly sweep after their month has ended; the current month and the preceding month are retained, so a request that straddles midnight still reads a row. No product read shows a past month.
5. The effective limit is the account's override when present, capped at 500, otherwise 50 (ADR-118); the counter stores the raw count, not the limit.

**Alternatives considered.**
- *Count `catalogs` rows by `uploaded_at` including soft-deleted rows.*
  Rejected: it reads a soft-deleted catalog, which FR-011 forbids, and it makes
  every quota read a scan of the merchant's rows.
- *An append-only `catalog_upload_events` table and a count over it.* Rejected: a
  second record of the same fact, a growing table, and the same count read with
  more I/O; the counter is the product fact, and the catalog row is the record.
- *Count in Redis.* Rejected: Redis is registered for BullMQ (R3), not as a
  system of record, and a counter that disappears with a cache restart would
  restore quota.
- *Keep the counter on `users`.* Rejected: it would make the `users` module the
  writer of a `catalogs` rule, and the account's registered fields do not
  change (FR-061's parallel rule for the attempt counter).

**Consequences and migration/backfill.** The table is created by
`0004_file_intake.sql`; its down drops it. `docs/domain-model.md` → Catalog gains
the counter's invariant. No backfill: the platform has no catalogs before R2.
The counter is not an entity and is not added to the Product Register. Review
date: 2026-12-11.

---

## ADR-168 — The upload-attempt bound and its counter

**Status**: Accepted — 2026-11-13. **Constitution version**: 6.3.2 (unchanged; the value awaits the closed-list amendment — see ADR-166's note)
**Owning directory**: `packages/db/schema/catalogs.ts`, `apps/api/src/modules/catalogs/service/`, `apps/api/src/modules/catalogs/repository/`, `packages/shared/src/contracts/`
**Owning feature**: R2 — file intake.

**Context.** FR-061 requires a bound on how many upload attempts one merchant may
make in a stated window, because a refused attempt consumes no quota and would
otherwise be repeatable without limit. The bound is enforced after the file-level
checks (FR-021–FR-024) and a limit refusal (FR-013), so neither counts as an
attempt, and before any byte is transferred. Each submission that reaches the
check counts as one attempt whatever its outcome — an accepted upload, a
duplicate, a safety refusal, a transfer failure, a cancellation, or a retry —
except a submission refused for the bound itself, which does not count and does
not restart the wait. The counter lives outside the account row, in the module
that owns the quota (FR-061). The value is a plan value under Constitution
Mandated Values; the constitution's list is closed and does not yet carry it.

**Decision.**
1. The bound is **60 attempts per 15-minute fixed window** per merchant. The
   window starts on a 15-minute boundary of UTC (the same boundary shape R1's
   rate-limit windows use), and the refusal's `Retry-After` is the number of
   seconds to the next boundary.
2. `catalog_upload_attempts(user_id uuid NOT NULL REFERENCES users(id), window_start timestamptz NOT NULL, count integer NOT NULL DEFAULT 0, PRIMARY KEY (user_id, window_start))` holds the count. The pre-sign request increments it with `INSERT … ON CONFLICT … DO UPDATE SET count = count + 1 RETURNING count`; a returned count above 60 is the too-many-attempts refusal before any multipart upload is created.
3. The count is incremented **before** the multipart upload is created, because
   a cancellation and a transfer failure count as attempts (FR-061); a file-level
   or limit refusal returns before the increment and counts as none.
4. A retry refused for the bound does not reach the increment, so it neither
   counts nor extends the wait; the wait is the fixed window's remaining time,
   restated as it decreases.
5. Rows are swept one hour after their window ends. The counter is transient
   operational state, not an entity, and the account's registered fields do not
   change.
6. CMV row 20 records the value in `specs/002-file-intake/plan.md`, marked
   pending. The constitution's closed list and the plan template's table gain the
   matching entry by the deferred amendment the plan's Gate 2 records; until it
   lands, the row is not satisfied.

**Alternatives considered.**
- *20 attempts per 15 minutes.* Rejected: a merchant uploading the monthly 50 in
  one sitting would be blocked after 20, although 50 accepted uploads are allowed.
- *120 attempts per hour.* Rejected: the wait a refused merchant reads could be
  nearly an hour, and the fixed 15-minute window is the shape the rest of the
  platform uses.
- *A sliding window.* Rejected: a second window algorithm and a per-attempt row
  history for a rule a fixed window bounds; the fixed window's boundary burst is
  the same exposure R1's limits accept.
- *Count attempts on the catalog row.* Rejected: refused attempts write no row,
  so the count would miss exactly what it exists to bound.

**Consequences and migration/backfill.** The table is created by
`0004_file_intake.sql`; its down drops it. The page's too-many-attempts error
state carries the wait (FR-049, FR-061). `docs/domain-model.md` → Catalog gains
the counter's invariant. Review date: 2026-12-11, or the date the closed-list
amendment lands, whichever is earlier.

---

## ADR-169 — The content hash's uniqueness binds the catalogs that are not deleted

**Status**: Accepted — 2026-11-13. **Constitution version**: 6.3.2 (unchanged; see ADR-166's note)
**Owning directory**: `packages/db/schema/catalogs.ts`, `apps/api/src/modules/catalogs/service/`, `apps/api/src/modules/catalogs/repository/`
**Owning feature**: R2 — file intake.

**Context.** The domain model states that the content hash is unique across
catalogs, and FR-042/FR-045 require the duplicate comparison to run
platform-wide over the catalogs that are not deleted. FR-046 requires a file
whose identical predecessor has been deleted to be accepted as a new upload: a
soft-deleted catalog is filtered out of every read path, and the delete leaves
the stored file in place until the retention job removes the row (R15). A plain
unique constraint over every row would refuse that re-upload; a service-only
check would lose the race between two identical uploads.

**Decision.**
1. `catalogs.content_hash char(64) NOT NULL` holds the lowercase SHA-256 hex of
   the **kept** (sanitized) bytes (FR-041).
2. A **partial unique index** — `CREATE UNIQUE INDEX catalogs_content_hash_retained_uq ON catalogs (content_hash) WHERE deleted_at IS NULL` — is the uniqueness rule. The database, not the service, resolves the race: the second insert waits on the index and then fails with `23505` after the first commits.
3. The duplicate check is the insert itself: the service reads the original only
   after the conflict, through the bounded projection ADR-170 records. A
   service-side pre-check alone is not the rule and is not relied on.
4. A deleted catalog does not occupy the hash, whatever the state of its stored
   file; two deleted catalogs may share a hash, and a deleted and a retained one
   may share it. The retained one is the duplicate target.
5. The duplicate path withdraws the bytes just written, creates no catalog,
   consumes no quota, and queues nothing (FR-043).

**Alternatives considered.**
- *A plain unique constraint over every row.* Rejected: a re-upload after a
  delete would be refused forever, contradicting FR-046.
- *A service-side `SELECT` then `INSERT`.* Rejected: two simultaneous uploads
  both read "no match" and both insert; the index is the atomic decision.
- *Delete the row's hash on soft delete.* Rejected: it rewrites a record the
  soft-delete rule retains with its timestamp, and the row's hash is the
  duplicate evidence for the retention job's audit.
- *Hash the uploaded bytes before sanitization.* Rejected: FR-041 hashes the
  bytes kept, AC-019 compares kept files, and the kept file is the sanitized one.

**Consequences and migration/backfill.** `0004_file_intake.sql` creates the
column and the partial index; the down drops both. `docs/domain-model.md`'s hash
invariant is amended to say "unique across the catalogs that are not deleted".
No backfill: the table is new. Review date: 2026-12-11.

---

## ADR-170 — The duplicate outcome's bounded read of another merchant's catalog

**Status**: Accepted — 2026-11-13. **Constitution version**: 6.3.2 (unchanged; the isolation-rule amendment is pending — see ADR-166's note)
**Owning directory**: `apps/api/src/modules/catalogs/repository/`, `apps/api/test/integration/http/isolation.spec.ts`, `docs/domain-model.md`
**Owning feature**: R2 — file intake.

**Context.** FR-009 forbids the page from exposing another merchant's record, but
FR-044 and the constitution's File Processing Rules require the duplicate outcome
to name the original file, state its upload date, and carry a link to its parts.
A duplicate is platform-wide by content, so the original may belong to another
merchant. The specification requires the read to be registered as the one
exception to the isolation rule — by an amendment to the constitution that names
it, by an amendment to `docs/domain-model.md`, and by a decision record — and to
carry only what the outcome shows. The authorization model is R13's and is not
the frame for this read.

**Decision.**
1. The read is one repository method, `findRetainedDuplicate(hash)`, returning
   exactly four fields: `id`, `file_name`, `uploaded_at`, and `status`. It
   carries no `user_id`, no supplier, no issue or expiry date, no storage key,
   and no other column. It filters `deleted_at IS NULL` and nothing else.
2. The method is reachable only from the duplicate branch of the complete
   request, after a `23505` on the partial unique index. No route, page, or
   projection calls it for any other purpose.
3. The isolation test admits this one path as `DUPLICATE_PROJECTION`: it asserts
   the four fields, asserts the response contains no owner identifier and no
   other catalog field, and fails if the projection widens or if a second
   cross-merchant read appears. The test's allowlist is exhaustive and named.
4. `docs/domain-model.md` → Merchant ownership gains the exception paragraph.
   The constitution's isolation rule is amended by the deferred intent the R2
   plan records (Gate 2 → Schema and Migration Control; Gate 3); this record
   does not amend the constitution.
5. If the original is deleted between the conflict and the read, the outcome
   still names it if the projection finds it; if it does not, the duplicate
   outcome is not shown and the upload is accepted as a new record, because the
   hash is no longer occupied (FR-046). The read never widens to recover a
   deleted row.

**Alternatives considered.**
- *Show "this file already exists" without the original.* Rejected: the
  constitution requires the original's name and date, and FR-044 requires the
  parts link's identifier.
- *Let the parts page resolve the original from the hash.* Rejected: the parts
  page is R5's public surface, and a hash-addressed read would expose a second
  cross-merchant path and a longer-lived identifier.
- *Store a copy of the original's name and date on the duplicate attempt.*
  Rejected: no record exists for a refused duplicate, and a copy would drift from
  the original.
- *File the read under the authorization model (R13).* Rejected: the model
  decides permissions within roles, and this read is a merchant-scoped path's
  named exception; filing it under R13 would defer a rule this slice must obey.

**Consequences and migration/backfill.** No schema change beyond ADR-169's index.
The isolation suite's allowlist gains the one entry; `docs/domain-model.md`'s
scoping invariant gains the exception. The constitution amendment is due before
R2's acceptance (2026-11-27). Review date: 2026-12-11.

---

## ADR-171 — The intake's content-inspection set

**Status**: Accepted — 2026-11-13. **Constitution version**: 6.3.2 (unchanged; see ADR-166's note)
**Owning directory**: `apps/api/src/modules/catalogs/inspection/`, `packages/shared/src/contracts/`, `specs/002-file-intake/contracts/intake-formats.md`
**Owning feature**: R2 — file intake.

**Context.** FR-027 requires the platform to identify the document type inside
its container, FR-031 requires a decoded-size cap over every inspected format,
and FR-032 requires executable content to be removed and the sanitized file
reopened. The Technology Standards register carries no content-inspection
library; the register-gap table names "Excel, PDF, and Word extraction;
content-type validation" as CMV row 12's value, owned by R3 for extraction and by
R2 for validation. The licence rule binds code shipped to or linked into a
merchant's browser or device; a server-side library is outside that clause but
still passes the licence check with its obligation recorded, and the plan
prefers a permissive licence.

**Decision.**
1. **`fflate`** (MIT) reads and rewrites OOXML containers: it lists the central
   directory, measures each member's uncompressed size, inflates members under
   the cap, and writes the sanitized archive. The document-type check reads
   `[Content_Types].xml` and the part names (`word/document.xml`,
   `xl/workbook.xml`) to tell a Word document from an Excel workbook inside the
   same ZIP family (FR-027).
2. **`cfb`** (Apache-2.0) reads and rewrites OLE2 compound files: it identifies
   `.doc` and `.xls` by their stream names (`WordDocument`, `Workbook`), measures
   the streams' sizes, and removes the macro storage and executable embedded
   objects (FR-032).
3. **`pdf-lib`** (MIT) parses the PDF, detects encryption (the parse fails on an
   encrypted document, which is the password-protected refusal), walks the
   catalog to remove JavaScript, automatic and launch actions, embedded files,
   and XFA form scripts, measures each stream's inflated size for the cap, and
   rewrites the sanitized file; the sanitized file is reopened with the same
   library before it is kept (FR-030, FR-032).
4. **Node's built-in `crypto`** computes the SHA-256 over the kept bytes and
   **`zlib`** inflates the streams the measurement reads. No other library joins
   the set.
5. The format table — each format's extension, canonical content type, signature
   or container probe, document-type probe, sanitizer rules, and cap measurement
   — is `contracts/intake-formats.md`, and every row has a unit test. A file
   whose content does not identify as its declared type is a content mismatch; a
   container that opens but holds no document of the declared type is a mismatch,
   not a corrupt file.
6. Each library is pinned by the lockfile, passes `osv-scanner` and `npm audit`,
   and carries its licence obligation in the plan's Complexity Tracking row 17.
   The register is amended to add the set to CMV row 12's entry no later than
   R2's acceptance; R3 extends the row with extraction.

**Alternatives considered.**
- *A single multi-format library.* Rejected: none opens OOXML, OLE2, and PDF with
  the rewrite control the sanitizer needs, and a library that converts formats
  would change the kept file's format.
- *LibreOffice headless as a converter/sanitizer.* Rejected: a second runtime and
  a large attack surface in the intake path, and it rewrites more than the
  executable content.
- *A Python toolchain.* Rejected: a second runtime in the deployment and a second
  dependency ecosystem for four server-side tasks.
- *A commercial content-disarm service.* Rejected: an external dependency in the
  fail-closed path, a data-transfer obligation, and no record in the register.

**Consequences and migration/backfill.** Four direct dependencies in `apps/api`
(CMV row 5 still under budget), the format table's tests, and the sanitizer's
per-format suites. `docs/domain-model.md` is not changed: the set inspects the
file, it does not change the entity. Review date: 2026-12-11.

---

## ADR-172 — The object-storage client

**Status**: Accepted — 2026-11-13. **Constitution version**: 6.3.2 (unchanged; see ADR-166's note)
**Owning directory**: `apps/api/src/modules/catalogs/storage/`, `packages/shared/src/contracts/`
**Owning feature**: R2 — file intake.

**Context.** The Technology Standards register names SeaweedFS, and
`docs/architecture.md` fixes the transport: large file bytes go from the browser
to SeaweedFS directly over a presigned multipart stream, and the API does not
buffer the file. The register names no client library for the S3 gateway. The
API needs five operations: create a multipart upload, presign each part,
complete the multipart, abort it, and head or delete an object. The bucket is
private; no object is public, and no URL is stored.

**Decision.**
1. **`aws4fetch`** (MIT) is the client. It signs SigV4 requests and presigned
   query URLs against SeaweedFS's S3 gateway with the configured endpoint,
   region, access key, and secret key, all injected from the environment.
2. The part size is **8 MB**; a 100 MB file has at most 13 parts. Each part URL
   is signed for its exact `Content-Length` (the last part's remainder included),
   its part number, its upload id, and a **15-minute** expiry, so a part cannot
   exceed the size the declaration implies.
3. The API's own calls — `CreateMultipartUpload`, `CompleteMultipartUpload`,
   `AbortMultipartUpload`, `HeadObject`, `DeleteObject` — are signed the same
   way. The complete call reads the object's size and refuses a file above
   100 MB before any inspection. The API never lists the bucket and never serves
   an object; it streams an object by signing a `GetObject` request and piping
   the response into the workspace.
4. The keys are `intake/{uploadId}/original` and
   `catalogs/{catalogId}/{sha256}.{ext}`. A key carries no merchant identifier;
   access is through the owning module and a signed URL alone (the isolation
   record's object-storage leg).
5. The bucket policy denies public reads and public listings; the gateway is
   reachable only from the API's network. The credentials are the API's, not the
   browser's; the browser receives only a presigned URL for one part of one
   upload.
6. The client and the licence obligation are recorded in Complexity Tracking row
   15; the register is amended to add the client no later than R2's acceptance.

**Alternatives considered.**
- *The AWS SDK v3 (`@aws-sdk/client-s3` plus the presigner).* Rejected: two direct
  dependencies and a large transitive surface for five operations; the SDK's
  version cadence and advisory surface are larger than the need.
- *`minio`.* Rejected: AGPL-3.0, and the server-side library would carry the
  copyleft into the API's distribution.
- *Hand-rolled SigV4.* Rejected: a security-critical signer with its own test
  burden, when a small audited library exists.
- *A server-side upload proxy (the API receives the bytes).* Rejected:
  `docs/architecture.md` fixes the presigned multipart path and the capacity
  model's bytes-in-flight arithmetic assumes the API does not carry them.

**Consequences and migration/backfill.** No schema change. The storage adapter's
suite uses a local SeaweedFS and asserts the signature's scope (a replayed URL, a
changed part number, an expired URL, a wrong key). The object layout and the
lifecycle rules are Gate 3's file-ingestion record. Review date: 2026-12-11.

---

## ADR-173 — The scanner client and the scan budget

**Status**: Accepted — 2026-11-13. **Constitution version**: 6.3.2 (unchanged; see ADR-166's note)
**Owning directory**: `apps/api/src/modules/catalogs/scanner/`, `packages/shared/src/contracts/`
**Owning feature**: R2 — file intake.

**Context.** ClamAV is a row of the Technology Standards register, and `EX-001`
fixes its character: a separate scanning process invoked at upload time, never a
runtime library import and never a bundled binary. FR-033 requires the scan for
every upload, a fail-closed refusal when it cannot run, and a time budget after
which the scan is treated as one that could not run. The register names no
client for the daemon's protocol.

**Decision.**
1. The adapter speaks clamd's **INSTREAM** protocol over `node:net` — a Unix
   socket in the deployment, a TCP socket in development — and reads the
   daemon's `OK`/`FOUND`/`ERROR` answer. It writes no temporary file to the
   daemon and sends no filename; the bytes stream from the workspace. It is
   written in-house, so no client dependency is added and `EX-001`'s boundary is
   exact.
2. The budget is **90 seconds** from the first byte sent to the verdict. A
   timeout, a refused connection, a protocol error, or an `ERROR` answer is the
   scan-unavailable refusal (FR-033); the adapter makes one attempt per request
   and does not retry inside it. The retry is the page's, and it re-sends the
   same file without re-selection (FR-049).
3. The health probe is a clamd `PING`, answered `PONG`; `/health`'s `scanner`
   field reports it (`contracts/intake-api.md` §5).
4. The daemon runs as its own container with a pinned image digest, updated
   through the dependency process; the image is scanned before release. ClamAV's
   GPL-2.0 obligation is discharged by the process boundary — the API neither
   links nor distributes it — and the record is Complexity Tracking row 16.
5. The test double is a local process that speaks the same protocol and fixes a
   150 ms scan; it is the suite's and the load run's scanner, and it is not a
   production path. The daemon's real throughput at the plan's 10
   completions/second is R12's pre-release load test (Complexity Tracking row
   19).

**Alternatives considered.**
- *A third-party clamd client.* Rejected: an extra dependency for a small
  protocol that carries none of the budget's error taxonomy, and a client that
  might bundle a library import `EX-001` prohibits.
- *Scanning with a library binding.* Rejected: `EX-001` and the register approve
  the scanner as a process, and an in-process library would change the
  exception's character.
- *An external scanning service.* Rejected: a data-transfer obligation for every
  file and a second failure domain in the fail-closed path.
- *No budget (wait indefinitely).* Rejected: FR-033 requires a bound and the page
  must never wait without one.

**Consequences and migration/backfill.** No schema change. The degradation suite
asserts the daemon-down case and the health field; the fail-closed suite asserts
the timeout, the infected file, and the clean file. `EX-001` stays active with
its 2027-01-05 review date. Review date: 2026-12-11.

---

## ADR-174 — The decoded-size cap

**Status**: Accepted — 2026-11-13. **Constitution version**: 6.3.2 (unchanged; see ADR-166's note)
**Owning directory**: `apps/api/src/modules/catalogs/inspection/`, `specs/002-file-intake/contracts/intake-formats.md`
**Owning feature**: R2 — file intake.

**Context.** FR-031 requires a cap that rejects a file whose expanded content
exceeds the value recorded under CMV row 15. The cap measures what every
inspected file decodes to, whatever its format: an Office document's members and
a PDF's compressed streams. The cap's purpose is to stop a zip bomb, not to
bound a legitimate file's size, so it must sit above the expansion a real
supplier document produces while staying below the point where the workspace or
the process is exhausted.

**Decision.**
1. The cap is **1 GiB (1,073,741,824 bytes)** of decoded content per file.
2. The measurement is streaming and stops at the cap: OOXML members are measured
   from the central directory and then inflated to verify; OLE2 streams are
   measured from the compound file's directory; PDF streams are inflated through
   `zlib`. The decoded bytes are counted as they are produced and are never held
   whole in memory. A file that reaches the cap is the expansion-cap refusal,
   regardless of its format.
3. The measurement runs before the sanitizer and again on the sanitized file, so
   a sanitizer that expands a stream cannot slip a larger file past the cap. The
   sanitized file's size is the one `catalogs.byte_size` records.
4. The workspace's disk bound is the cap plus the 100 MB ceiling; the sweep
   removes a workspace file after one hour. A file that would exceed the disk
   bound is refused as the expansion-cap failure, not as a storage failure,
   because the cap is the rule it violates.
5. The cap is CMV row 15 and ADR-174 is its record; a change to the value is a
   constitution amendment, not a plan edit.

**Alternatives considered.**
- *500 MB.* Rejected: a legitimate 100 MB OOXML file can decode past 500 MB, and
  the cap would refuse real supplier documents.
- *2 GiB.* Rejected: it doubles the workspace's worst case for a bomb the
  1 GiB cap already stops, and the sample's largest file decodes far below it.
- *Measure the compressed size only.* Rejected: a zip bomb's compressed size is
  small by construction; the rule measures what the file decodes to.
- *Rely on the process's memory limit.* Rejected: the intake streams, so memory
  is not the bound; the decoded byte count is.

**Consequences and migration/backfill.** No schema change. The cap suite covers
an OOXML bomb, a PDF stream bomb, a file just under the cap, and a sanitized file
that would cross it. `contracts/intake-formats.md` states each format's
measurement point. Review date: 2026-12-11.

---

## ADR-175 — The single ratified amendment closing the four deferred governance findings

**Status**: Accepted — 2026-11-13. **Constitution version**: 7.0.0
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`,
`docs/decisions/`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context and rationale.** R2 — file intake recorded four deferred governance
findings (C1 to C4) in its Constitution Check and its Complexity Tracking rows
1–4: the duplicate outcome's bounded read of another merchant's catalog had no
named exception in the isolation rule; the upload-attempt bound was CMV row 20
of that plan while the constitution's closed list and the plan template carried
no such value; Principle V's no-emoji rule had been narrowed in the working tree
to the text the platform writes and shows, but only as an uncommitted draft Sync
Impact Report; and the three version sources disagreed — the footer read 7.0.0 /
2026-11-12, `version.json` read 6.3.2 / 2026-11-04 / ADR-148, and the index's
last row ADR-174 claimed 6.3.2. `governance-drift-check.mjs` reported exactly
three findings: A (the footer against `version.json`) and two J findings (the
index column's last row and its highest version against the footer). The draft
named ADR-166 as its record, but ADR-166 is taken by R2's first field-level
record, so the number was stale and this amendment takes the next free one.
ADR-168 records the attempt bound and ADR-170 records the duplicate projection;
both are recorded as 6.3.2 (unchanged), because the constitution was not amended
when they landed. One explicit ratified amendment closes all four, rather than
four amendments moving the three version sources four times.

**Decision.**

1. **The single named exception.** Schema and Migration Control keeps its
   isolation MUST verbatim and gains one bullet naming the one and only
   cross-merchant read: the duplicate outcome's read of another merchant's
   catalog, a single fixed projection of exactly four fields — the name, the
   upload date, the processing status, and the identifier the parts link needs —
   and no other field. The read is reachable only from that outcome, passes
   through the same single shared entry point, and is asserted by the isolation
   test, which MUST fail on a wider projection or a second cross-merchant read.
   A second exception MUST NOT be introduced without an amendment naming it.
   `docs/domain-model.md` already carries the projection (ADR-170) and is not
   amended again here; FR-009 and FR-044's registration duty is discharged.
2. **The closed list gains one value.** Module Discipline and Development
   Workflow's closed Constitution Mandated Values list gains the upload-attempt
   bound — **60 attempts in a fixed 15-minute window on UTC boundaries** — as
   its eighteenth value. The plan template's table gains the matching row 20 and
   its prose moves from seventeen/nineteen to eighteen/twenty in the same change,
   as the closed-list rule and the drift check's G10 require. The bound is a
   resource-intake value a plan records under CMV: it is not a row of the Usage
   Limits table, not an authentication rate limit, and not a new usage limit.
3. **Principle V is ratified, not drafted.** The narrowed no-emoji rule already
   present in Principle V binds the text the platform writes and shows, and a
   value the platform receives is shown as supplied and is outside the ban. Its
   text is not rewritten. The uncommitted Sync Impact Report is removed from the
   constitution: Governance's amendment procedure makes that report review
   material for the ratifier that MUST NOT be committed, and a ratified
   amendment's durable record is this ADR rather than scratch text. Product
   Fact Clarifications' emoji row points at Principle V and stays as written,
   so the rule is not restated a second time.
4. **The three version sources agree.** The footer, `version.json`, and this
   record's index row and its constitution-version column all read 7.0.0, last
   amended 2026-11-13; `version.json`'s `recorded_by` names ADR-175. Every live
   `ADR-001 … ADR-175` range string moves in the same change and
   `Project-Technologies.txt`'s header list ends at 175, so the index stays the
   single authority for the range (ADR-103, ADR-125).
5. **The amendment is MAJOR.** The Versioning policy makes a principle's
   redefinition MAJOR; Principle V's scope is redefined here, so 6.3.2 moves to
   7.0.0. The other three closes are material expansions of guidance that would
   each be MINOR alone, but this is one amendment and takes the highest
   applicable bump once. No MUST is softened, removed, or reinterpreted: the
   isolation MUST is kept verbatim and the new bullet adds strict bounds around
   the sole exception.
6. **What deliberately did not change.** No entity, page, product feature,
   role, usage-limit row, exception-register row, template heading, API module,
   principle, or `##` section is added or removed; the eighteen binding sections
   are unchanged. No feature specification, plan, tasks file, or checklist is
   rewritten to record a governance violation; only their live ADR range strings
   move as stamp sites. Governance's own MUSTs bind this document, are not
   evaluated by a feature's Constitution Check gate, and an unmet Governance
   MUST is escalated as an amendment, never recorded as a plan violation. R2's
   gate rows stay the honest record of the check as it stood on 2026-11-13.

**Affected principles and sections.** V. Arabic-First and RTL Interfaces
(ratified as written; no text change), Schema and Migration Control (one new
bullet), Module Discipline and Development Workflow (one new closed-list
value), and Governance (its version sources and amendment procedure, whose text
is unchanged). No other principle or section is touched.

**Impact on features already in flight.** R2's four deferred gate rows and its
Complexity Tracking rows 1–4 are discharged by this amendment rather than by an
edit to that plan; its CMV row 20 is no longer pending and the template now
carries the matching row. R1's specification, plan, tasks, contracts, and
checklists keep the checks they performed under 6.3.x. R3 to R17 gain one value
to record under CMV when they touch intake, and one named exception to honour in
isolation tests; no requirement, acceptance criterion, task, or ownership row is
added to any of them here. Compliance review requires in-flight features to be
re-evaluated whenever a MAJOR amendment lands; that re-evaluation belongs to
each feature's own `/speckit.analyze` and `/speckit.converge` cycle, not to this
constitutional change.

**MAJOR migration and backfill plan.** A MAJOR amendment MUST include a
migration or backfill plan for artifacts produced under the previous version.
The 6.3.x artifacts are documents, not data or schema: no migration, data
rewrite, backfill, or code change exists or is required. The plan is this:
(a) the R1 and R2 artifacts stay as the record of the checks performed under
6.3.x and are not rewritten; (b) the plan template's row 20 applies to plans
scaffolded under 7.0.0 onward, and R2's own row 20 already records the value,
so no table backfill is owed; (c) this ADR and its 7.0.0 index row are the
durable bridge from the 6.3.x footer to the 7.0.0 one; (d) the feature-level
re-evaluations named above are the only follow-up work and are owned by the
features' own commands. No feature plan is amended to carry a governance
violation row.

**Alternatives considered.**
- *Four separate amendments (MINOR, MINOR, MAJOR, PATCH).* Rejected: the
  operator asked for one explicit ratified amendment, and four would move the
  three version sources four times against one durable record.
- *Keep 7.0.0 as a draft and only fix `version.json`.* Rejected: the amendment
  procedure requires explicit ratification, a version bump, and a durable
  record; a draft is none of those.
- *Bump to 6.4.0 or 7.0.1.* Rejected: a principle's redefinition is MAJOR, and
  the footer's 7.0.0 was never ratified, so this is the first 7.x amendment.
- *Add the attempt bound as a Usage Limits row.* Rejected: the operator forbade
  a new usage limit, and the bound is a value a plan records under CMV.
- *Record the four findings as violations in R2's plan.* Rejected: Governance's
  own MUSTs are escalated as an amendment, never recorded as a plan violation.
- *Amend `docs/domain-model.md` or the exception register again.* Rejected:
  ADR-170 already registered the projection as the one named exception, and an
  inline named exception follows the rule's existing `Part`, `ContactMessage`,
  and `User` classifications rather than granting a feature exception row.

**Consequences and migration/backfill.** The constitution moves to 7.0.0 with
`version.json`; this row carries 7.0.0 in the constitution-version column; every
live range string moves to `ADR-001 … ADR-175`; and
`Project-Technologies.txt`'s header ends at 175 and names 2026-11-13. The plan
template's CMV table carries twenty rows. The drift check's A and J findings
close and no new finding is introduced. Review date: 2026-12-11. The tripwire is
a second cross-merchant read, a fifth field in the duplicate projection, a
second exception to the isolation rule, or a version source that moves alone;
any of them is a new amendment rather than an annotation of this one.

---

## ADR-176 — The active quota counts a catalog whose file is stored, whatever its processing status

**Status**: Accepted — 2026-11-14. **Constitution version**: 7.1.0
**Owning directory**: `.specify/memory/`, `docs/decisions/`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context and rationale.** Performance Budgets and Verification's Quota semantics
paragraph defined the active limit as the count of files "whose bytes, parts,
bookmarks, and search-index entries are present". Read as written, that is a
conjunction: a catalog occupies an active slot only once all four exist. Every
catalog passes through states in which they do not all exist. At `uploaded` the
file's bytes are stored and nothing has been extracted from them yet; at
`processing` the extraction is still running; at `failed` it will not finish, and
the bytes are stored all the same. A catalog whose extraction yields no part never
satisfies the sentence at all. The conjunction therefore let a merchant hold
stored files the limit did not count, which is the opposite of what a storage
quota is for: the resource the limit protects is the stored byte count, and the
rows derived from a catalog are downstream of it rather than a precondition for
it. The paragraph's release clause was already correct and is unchanged: a
merchant delete, an administrator delete, or the 90-day retention job releases a
slot, and a soft-deleted row does not count.

**Decision.**

1. **The counted object is the catalog, and the condition is its stored file.**
   The active limit counts catalogs whose stored file has not been deleted. A
   catalog is counted from the moment its bytes are stored and stops being counted
   when those bytes are gone, which is the only event that frees the space.
2. **The processing status is not a condition.** `uploaded`, `processing`, and
   `failed` count exactly as `completed` does, because in all four the file's
   bytes are stored. The closed four-value status enum is unchanged; no status is
   added, removed, or redefined.
3. **The derived rows are not a condition.** The presence of parts, bookmarks, or
   search-index entries is not required for a catalog to occupy its slot, and
   their absence does not free it. A catalog that yields no part counts for as
   long as its file is stored.
4. **The release events are unchanged.** A merchant delete, an administrator
   delete, or the 90-day retention job releases an active slot, and a soft-deleted
   catalog row does not count. The monthly limit's semantics, the administrator's
   per-user override, the two ceilings, and the two defaults are untouched.
5. **The amendment is MINOR.** The Versioning policy makes a material expansion of
   guidance MINOR, and this states what the active limit counts and what it does
   not, where the paragraph previously left the answer to a conjunction no catalog
   satisfies at intake. No principle, section, entity, page, product feature,
   usage-limit row, or table value is added, removed, or redefined, and no MUST is
   softened: the same limit binds the same resource, counted from the event that
   actually allocates it.
6. **What deliberately did not change.** The Usage Limits table is untouched: no
   row, value, or ceiling moves, and 50 per month, 300 active, 500, and 1,500 stay
   as they were. No principle is touched. No `##` section is added, renamed, or
   removed, so the eighteen binding sections and the ten principles are unchanged,
   and no entity, page, product feature, role, exception-register row, template
   heading, or API module moves. No feature specification, plan, tasks file, or
   checklist is rewritten; only their live ADR range strings move as stamp sites.

**Affected principles and sections.** Performance Budgets and Verification — its
Quota semantics paragraph only. No other section and no principle is touched.

**Impact on features already in flight.** R2 — file intake enforces the active
limit in its quota service, and this amendment fixes which rows that service
counts: the catalogs whose file is stored, not the catalogs that happen to have
parts, bookmarks, and index entries. R2's specification, plan, tasks, contracts,
and checklists keep the checks they performed under 7.0.0 and are not rewritten;
where an acceptance criterion asserts a count, the count is now the one this
paragraph defines. R3 to R17 are unaffected until a slice reads or enforces the
active limit. Compliance review requires in-flight features to be re-evaluated
only when a MAJOR amendment lands, so no re-evaluation is owed here.

**Alternatives considered.**
- *Count only the catalogs whose parts are present.* Rejected: that is the reading
  being corrected. A failed or empty extraction would hold stored bytes for the
  whole retention window at no cost to the merchant's quota.
- *Count only `completed` catalogs.* Rejected: a catalog stays `processing` for up
  to the processing budget and can stay `failed` until retention deletes it; both
  hold the bytes the limit exists to bound.
- *Count stored bytes rather than catalogs.* Rejected: the Usage Limits table
  fixes a file count, and changing the unit would be a change to that table, which
  this amendment is not permitted to make.
- *Add a Usage Limits row for the in-flight states.* Rejected: the table already
  binds the resource; the defect was in the paragraph that says how to count it,
  not in a missing limit.
- *Leave the paragraph and rely on the implementation.* Rejected: the drift check
  does not read this sentence, and a rule the code contradicts is the drift the
  governance set exists to prevent.

**Consequences and migration/backfill.** The constitution moves to 7.1.0 with
`version.json`; this row carries 7.1.0 in the constitution-version column; every
live range string moves to `ADR-001 … ADR-176`; and `Project-Technologies.txt`'s
header ends at 176 and names 2026-11-14. No data migration or backfill is owed:
the amendment changes no schema, no stored value, and no counter. Review date:
2026-12-12. The tripwire is a catalog whose file is stored and which the limit
does not count, or a released slot whose bytes remain; either is a new amendment
rather than an annotation of this one.

## ADR-177 — The analysis command's scope in this project exceeds the inherited command's

**Status**: Accepted — 2026-11-16. **Constitution version**: 7.1.0 (unchanged)
**Owning directory**: `.specify/`, `specs/`
**Owning feature**: R2 — the file intake (`specs/002-file-intake/`) carries the row; the
decision itself is project-wide and was ratified by the repository owner.

**Context and rationale.** The `/speckit.analyze` command is inherited from Spec Kit, and
its scope is the feature's three artifacts: `spec.md`, `plan.md`, and `tasks.md`. This
project's slice does not fit that scope alone. R2's acceptance turns on a governance
record that lives in no feature artifact — the exception register — and on the numbers a
committed check computes over the governance set. The cross-story dependency that
Principle VIII reads is granted by a row in `.specify/templates/exception-register.md`,
and the counts, the identifier soundness, and the `EX-###` references that the analysis's
findings rest on are decided by `governance-drift-check.mjs`, which reads the
constitution, the mirrors, the decision register, the templates, and the specifications.
An analysis that read only the three inherited files would have answered a different
question from the one the slice asks, and any number it stated that the check does not
print would have been an estimate presented beside a count. Nothing in the tree
explained this: the command file is inherited and says nothing about it, and this
plan's rows recorded the register and the check as inputs to other work without
recording that the analysis itself reads them.

**Decision.**

1. **The analysis's inspection scope in this project is the inherited scope plus the
   governance artifacts.** The analysis reads `spec.md`, `plan.md`, and `tasks.md` as the
   inherited command does, and it also reads `.specify/templates/exception-register.md` and
   `governance-drift-check.mjs`. The register is read because the slice's cross-story
   dependency is granted by a row there, and the check is read because it decides the
   artifact counts, the identifier soundness, and the `EX-###` references.
2. **The report's numbers are computed, not estimated.** Every count and every identifier
   the analysis report states is extracted from the tree, and the counts are the drift
   check's own output, reproducible by running `node governance-drift-check.mjs`. A number
   the check does not print is recorded as an open question, never as a finding.
3. **The inherited command is neither modified nor forked.** The extension is a project
   practice over the upstream command: the command file stays as the upstream owns it, and
   what this project adds is this record and the Complexity Tracking row that carries it.
4. **The register is read, never written, by an analysis.** A row in the exception
   register is written by the governance change that grants it, as this slice's Twelfth
   pass records; an analysis reads the register and reports on it.

**Affected principles and sections.** None. This record states a project practice for a
command: it changes no principle, no section, no entity, no page, no product feature, no
usage-limit value, and no constitution text, so the constitution stays at 7.1.0.

**Consequences.** The slice's analysis report can be reproduced — a reader runs the drift
check and reads the same counts the report states, and a finding that names a number is a
finding that names the check's output. The register row `EX-013` and the drift check's
own checks are named as inputs to the analysis rather than left as an unstated habit, and
one reference now explains the extension where none did. The live `ADR-001 … ADR-0NN`
range strings move to `ADR-001 … ADR-177`, and `Project-Technologies.txt`'s header ends
at 177.

**No `Alternatives considered` section.** This is a governance record — its subject is
the process and the governance tooling rather than a product or engineering choice — so
the Documentation rule's alternatives field does not reach it (ADR-090), and a section is
not written for it after the fact.

Review date: 2026-12-12. The tripwire is an analysis report that states a number the
drift check does not print, or a scope extension recorded in a place this record does not
cover — either is a new record rather than an annotation of this one.

## ADR-178 — The bundled commands carry the rendered front-matter, not upstream's template

**Status**: Accepted — 2026-11-16. **Constitution version**: 7.1.0 (unchanged)
**Owning directory**: `.opencode/commands/`, `.codebuddy/commands/`, `.specify/extensions/`, `AGENTS.md`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context and rationale.** The upstream Spec Kit command templates carry a `scripts:`
front-matter map beside their `description` and `handoffs:` keys:

    scripts:
      sh: scripts/bash/setup-plan.sh --json
      ps: scripts/powershell/setup-plan.ps1 -Json
      py: scripts/python/setup_plan.py --json

and their first outline step reads "Run `{SCRIPT}` from repo root", leaving the harness
to choose the variant it runs. This project's twenty-three command files — the ten core
commands and the thirteen extension commands — carry no `scripts:` key at all: their
front-matter holds `description` and `handoffs:` only, and their first step names the
concrete script (for example `.specify/scripts/powershell/setup-plan.ps1 -Json`), so the
agent runs the prerequisites script itself, by hand, in step 1. Nothing in the tree said
which of the two forms was intended, so a reader comparing the two integrations' files
with the upstream template could not tell a deliberate rendering from a hand edit.

The difference is a rendering consequence, and this record settles it. This project chose
the PowerShell variant at init — `.specify/init-options.json` carries `"script": "ps"` —
and installed only the six PowerShell scripts, which the upstream manifest records and
which are the only scripts in the tree; there is no `scripts/bash/` and no
`scripts/python/` here. Upstream's own installer (v1.3.2) resolves `{SCRIPT}` in the body
from that map against the project's chosen variant and removes the `scripts:` key from
an extension-owned command's front-matter, so the rendered form of a PowerShell project
is the form this repository holds. Reproducing upstream's template verbatim would put
`scripts/bash/setup-plan.sh` and `scripts/python/setup_plan.py` into twenty-three
front-matter blocks, naming two scripts this repository does not have, and it would
contradict the derivation rule the thirteen extension commands already follow. Applying
upstream's rendering rules to upstream's own template reproduces this repository's
`plan` command exactly, line for line, once the project's path rewrite is applied.

**Decision.**

1. **The rendered form is the reference for this project's command files, and upstream's
   template remains the source.** The twenty-three files in `.opencode/commands/` and
   `.codebuddy/commands/` are upstream's templates rendered for this project: the variant
   is resolved against `.specify/init-options.json` (`ps`), the `scripts:` key is dropped,
   the body names the concrete PowerShell script, and the project paths are rewritten to
   `.specify/…`. The two integration directories hold that rendering byte-identically,
   as ADR-086 requires.
2. **The difference is accepted, and it is stated in `AGENTS.md`.** The paragraph that
   records the two integrations now names the rendering rule beside the derivation rule
   it already carries, so a reader who compares the files with the upstream template
   finds the difference explained rather than unexplained.
3. **The behaviour is identical, and the invariant stays where it is.** The setup or
   prerequisites script runs exactly once, in the command's first step, in both forms —
   upstream by the harness reading the map, this project by the agent following that
   step's instruction. No new check is owed: the drift check's D and D2 checks already
   hold the two directories byte-identical and hold each file to its integration
   manifest's hash, which is what pins the rendering.
4. **No regeneration is owed, and the extension sources are not edited.** Re-deriving the
   thirteen extension commands from `.specify/extensions/*/commands/` would reproduce the
   files that are already there; hand-editing the ten core commands to carry the
   upstream template's map would break the manifest hashes the check reads, name two
   scripts this repository does not install, and change no behaviour.

**Affected principles and sections.** None. This record states a project practice over the
tooling: it changes no principle, no section, no entity, no page, no product feature, no
usage-limit value, and no constitution text, so the constitution stays at 7.1.0.

**Consequences.** A reader who opens an upstream template beside this repository's
command file finds one difference and its explanation in `AGENTS.md` and here. The
rendering rule is named where the derivation rule already is, so the next reader does
not have to re-derive it from the diff. The live `ADR-001 … ADR-0NN` range strings move
to `ADR-001 … ADR-178`, and `Project-Technologies.txt`'s header ends at 178.

**No `Alternatives considered` section.** This is a governance record — its subject is
the process and the governance tooling rather than a product or engineering choice — so
the Documentation rule's alternatives field does not reach it (ADR-090), and a section is
not written for it after the fact.

Review date: 2026-12-12. The tripwire is a command file that carries a `scripts:` map
naming a script this repository does not install, or a change to the installed script
variant that the rendering does not follow — either is a new record rather than an
annotation of this one.

## ADR-179 — The tasks template is the single source of the task list's binding rules

**Status**: Accepted — 2026-11-16. **Constitution version**: 7.1.0 (unchanged)
**Owning directory**: `.specify/templates/overrides/`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context and rationale.** `specs/002-file-intake/tasks.md` carries two NORMATIVE binding
rules in its "Format (REQUIRED)" comment that the template it was rendered from does not
carry. Rule 5 is one owner per file: every production file is written by exactly one task,
except the two composition points Path Conventions names — the app's composition root and
the shared barrel — where a second task adds its own line and rewrites nothing; a later
task that needs a behaviour change in an owned file does not rewrite it, the owner's
description carries the complete behaviour, and the later task adds the test that proves
it; a test file is appended per story, each story's cases in its own block, and no story
rewrites another's block. Rule 6 is success-criterion attribution: when a `SC-###` describes
a task's outcome, the tail names it after the `AC-###` the task satisfies.

The template, `.specify/templates/overrides/tasks-template.md`, carries rules 1 to 4 only,
and neither phrase exists anywhere under `.specify/`. The rules reached the rendered
document without a source, and the source that should hold them holds fewer rules than
the document already rendered from it. The consequence is therefore the template's, not
one document's: `/speckit.tasks` regenerates `tasks.md` from that template, so every
feature rendered from it carries the rules and every feature rendered from it before this
decision would have lost them silently. Nothing would have caught that loss:
`governance-drift-check.mjs` excludes `.specify/templates/overrides/*` from its hash check,
because those files are project-owned and edited by design, and it compares no rendered
`tasks.md` against the template it was rendered from. A rule that lives only in a rendered
artifact is a rule the next generation does not inherit, and a task list's binding rules
are the rules every task in the list obeys.

The `[P]` definition carries the same defect in a smaller form. The template's numbered
list item 3 reads "include only when parallelizable (different files, no dependency on an
incomplete task)", while the rendered document's own "Dependencies & Execution Order"
records three tasks whose relation to that rule is an exception: T032, the phase's guard
written after the rows it reads; T035, the baseline generation task; and T112, the
measurement task. The rule as written does not accommodate them, and the place the rule
is stated says nothing about them.

**Decision.**

1. **The template carries the two rules, in the words the rendered document uses.** Rule 5
   (one owner per file) and rule 6 (success-criterion attribution) are added to the
   "Format (REQUIRED)" comment of `.specify/templates/overrides/tasks-template.md`, with
   the rendered document's own scope: NORMATIVE FOR THIS DOCUMENT, the two composition
   points Path Conventions names, the owner-first rule for a behaviour change, and the
   per-story test file.
2. **The template's `[P]` item is amended to name the three recorded exceptions.** The
   numbered list's item 3 keeps its rule and adds the clause: except the three tasks whose
   recorded exceptions are named in Dependencies & Execution Order — T032, a phase's guard
   written after the rows it reads; T035, a baseline generation task; and T112, a
   measurement task.
3. **The rendered document is the evidence of the order, not the source.** This slice's
   rendered task list carried rules 5 and 6 before the template did, and
   `specs/002-file-intake/plan.md`'s Complexity Tracking row 30 records that order and the
   date, so a reader of the template knows when each rule arrived and that it arrived from
   a rendered document.
4. **No comparison between a rendered document and its template is added.** The drift
   check excludes the project-owned overrides from its hash check by design, and this
   record adds no check; what it adds is the source, so the rendered documents carry the
   rules by construction rather than by a comparison that would have to be maintained
   beside the files it compares.

**Affected principles and sections.** Single-Reference Sufficiency, read with the
Governance register's row that names `.specify/templates/overrides/` as the binding
template layer: the rule a task list must obey is stated once, in the template that
renders it, and a reader finds it where the artifact is produced. No principle, no
section, no entity, no page, no product feature, no usage-limit value, and no constitution
text changes, so the constitution stays at 7.1.0.

**Consequences.** A feature's task list rendered from the template carries rules 1 to 6 and
the amended `[P]` clause, so the rule that decides one owner per file and the rule that
decides how a success criterion is attributed are stated in every future task list and in
the place that produces them. The live ADR range strings move to ADR-001 … ADR-179, and
`Project-Technologies.txt`'s header ends at 179.

**No `Alternatives considered` section.** This is a governance record — its subject is
the process and the governance tooling rather than a product or engineering choice — so
the Documentation rule's alternatives field does not reach it (ADR-090), and a section is
not written for it after the fact.

Review date: 2026-12-11. The tripwire is a rendered task list that carries a binding rule
the template does not, or a template that loses a rule a rendered document still carries —
either is a new record rather than an annotation of this one.

---

## ADR-180 — The intake's bounded inspection working set

**Status**: Accepted — 2026-11-19. **Constitution version**: 7.1.0 (unchanged)
**Owning directory**: `apps/api/src/modules/catalogs/service/`, `apps/api/src/modules/catalogs/inspection/`
**Owning feature**: R2 — file intake.

**Context.** `docs/architecture.md` §3 and the plan's Storage paragraph state
that the API does not buffer a file in memory. The transport satisfies the
rule: the browser writes the parts straight to object storage through presigned
URLs, and the API streams the object into a bounded workspace file, the
workspace file into the scanner, and the sanitized file into the kept object.
The content-inspection set ADR-171 records, however, parses the compressed file
as an in-memory byte array: `cfb`'s `CFB.read` and `pdf-lib`'s
`PDFDocument.load` take the whole file, and `fflate`'s rewrite holds the members
it writes. The first implementation additionally built two `Blob` copies — the
scanner's input and the kept object's write — so one request held up to four
times the file's size in memory.

**Decision.**
1. The no-buffer rule is a **transport rule**: no leg of the transfer passes
   through the API's memory as a whole-file buffer. The object-to-workspace,
   workspace-to-scanner, and sanitized-file-to-kept-object legs stream
   (`createReadStream` through `Readable.toWeb`), and the browser's part writes
   never reach the API at all.
2. The inspection steps — the content probe, the decoded-size cap's read, the
   sanitizer, and the reopen — operate on **one bounded working copy** of the
   compressed file, read from the workspace file and capped by the 100 MB
   usage limit. The 1 GiB decoded cap bounds decoded content, not the
   compressed working set; the decoded bytes themselves are counted as they are
   produced and are never held whole (ADR-174).
3. One request's peak memory is therefore at most about twice the accepted
   file's size during the sanitize step — the input working copy beside the
   sanitized output — so at the ceiling, 200 MB; the design condition's 300
   concurrent transfers bound the aggregate by the concurrency, as the
   workspace's disk bound already does (plan: Scale/Scope).
4. The libraries are unchanged: CMV row 12 and ADR-171 fix the set, and
   replacing them to obtain whole-file streaming would be a constitution
   amendment, not a plan edit. No library change is made.
5. `docs/architecture.md` §3 and the plan's Storage paragraph state the bounded
   reading this record fixes, and `service/intake.ts` carries it in the comment
   beside the working copy.

**Alternatives considered.**
- *Whole-file streaming through `cfb` and `pdf-lib`.* Rejected: neither library
  accepts a chunked source, and a streaming rewrite would replace the
  registered inspection set (CMV row 12), re-opening ADR-171's licence and
  vulnerability record for a memory shape the bounded copy already gives.
- *A process memory limit as the bound.* Rejected (ADR-174's own reading): the
  decoded byte count and the per-file ceiling are the bounds; a process limit
  would turn a legitimate large file into an internal error rather than a
  refusal with a cause.
- *Keeping the `Blob` copies.* Rejected: they doubled the working set for no
  behaviour; the two transport legs stream from the workspace files instead.

**Consequences and migration/backfill.** `service/intake.ts` streams the
scanner's input and the kept object's write from the workspace files; the
inspection working copy is one bounded read. No schema change, and the format
and safety suites keep their assertions. Review date: 2026-12-11 (R2's
acceptance); R3's extraction work is the trigger to revisit the reading if a
streaming parser enters the set.

## ADR-181 — The phone field's country cell sits at the inline end, with the flag

**Status**: Accepted — 2026-11-20. **Constitution version**: 7.1.0 (unchanged)
**Owning directory**: `packages/ui/app/components/`, `packages/ui/public/flags/`
**Owning feature**: R1 — identity and foundation.

**Context.** R1's reference set renders the Libyan mobile number as two
segments: a fixed `+218` cell and the number field. The lab drew the cell first
in DOM order, so the RTL flex line placed it at the inline start (the right) and
the number sat to its left. The owner asked for the cell at the inline end (the
left) with a country flag. The old pair also inverted its corner radii: the
input carries `direction: ltr`, so its logical `border-start-start-radius`
resolves to the physical left, and the cell carried `dir="ltr"` for the same
reason, so the group's outer corners were square and its inner corners rounded.
Four pages — sign-up, sign-in, forgot step 1, and contact — carried identical
copies of the markup and its styles. ADR-041 and FR-002/AC-002 forbid a
dial-code selector, so the cell must stay a label: a chevron or a menu would
reintroduce the selector the requirement removes.

**Decision.**
1. The phone control is one group of two segments: the number field at the
   inline start (the right in RTL) and the country cell at the inline end (the
   left). The cell closes the group and owns its outer corners.
2. The cell carries the Libyan flag at its outer edge and the `+218` code next
   to the divider. The flag is decorative (`alt=""`, and the cell is
   `aria-hidden="true"`); the input keeps the label and the accessible name.
   The flag is a vendored SVG (`packages/ui/public/flags/ly.svg`, public
   domain, geometry untouched), not a font glyph and not an emoji.
3. The number is one Latin run: the input is `direction: ltr` with
   `text-align: start`, so the digits begin beside the cell and the group reads
   `+218 91 000 0000`. The placeholder stays `91 000 0000`, and the input
   carries `autocomplete="tel-national"` because the cell, not the field,
   holds the country code — the contract's field rule
   (`specs/001-identity-foundation/contracts/ui-contracts.md` §3.2) already
   states both values.
4. The cell is a label, never a selector: no chevron, no menu, no dial-code
   choice (ADR-041; FR-002, AC-002).
5. The divider is the field's own ring. The cell drops the border on that side
   and uses the ring's tone (`--ui-border-accented`) for its other three
   sides. Outer corners are rounded and inner corners square. Because logical
   radii resolve against each element's own `direction`, each rule names the
   side in that element's own axis: the input (`ltr`) squares its inline-start
   corners, and the cell (`rtl`) rounds its inline-end corners.
6. One component, `WfPhoneField`, replaces the four copies. Each page keeps its
   `UFormField` and passes its model. The read-only displays (forgot step 2 and
   the profile) are not part of the group and do not change.
7. The reference set: the eleven images that show the field — nine R1 and the
   two R11 contact captures — were recaptured on 2026-11-20 with the same
   names, dimensions, URLs, and capture method. The four R1 done captures are
   byte-identical. The pixel diff is confined to the phone group's box in all
   eleven, so no other block moved.

**Alternatives considered.**
- *Keeping the cell at the inline start.* Rejected by the owner: the group then
  reads `91 000 0000 +218`, and the flag would sit between the number and the
  page edge instead of closing the control.
- *A third segment for the flag, outside the cell.* Rejected: it adds a border
  and a second divider for a decoration, and it reads as a second control.
- *A native select or a chevron on the cell.* Rejected: FR-002/AC-002 remove
  the dial-code selector, and a static cell with no affordance is the only
  shape that does not imply one (ADR-041).
- *A flag glyph or an emoji.* Rejected: Principle V forbids emoji, and an icon
  set glyph is not a flag.
- *Hiding the flag below a width.* Rejected: the cell has room at 375 (90.61px
  wide), and the flag is the only country cue in a Libya-only product.

**Consequences and migration/backfill.** The lab carried four copies of the
markup and its styles — sign-up, sign-in, forgot step 1, and contact — and
`WfPhoneField` replaces all four. The product carries three copies today, in
`apps/web/app/components/auth/` (`SignUpForm.vue`, `SignInForm.vue`, and
`RecoveryForm.vue`); all three already set `autocomplete="tel-national"`, and
they take the group's order, flag, and radius rules from the same component when
the product adopts it. No schema, API, or copy change. The reference manifest
marks the eleven recaptured images with `recaptured`; the four done captures
keep their 2026-10-27 date. ADR-041 is annotated by this record, not superseded.
Review date: 2026-12-11 (R2's acceptance), or earlier if the conformance gate's
baseline chain (ADR-129) reports a phone-group difference.
