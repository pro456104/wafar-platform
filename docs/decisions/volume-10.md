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
`ADR-001 … ADR-163` range strings move to `ADR-001 … ADR-164`, and
`Project-Technologies.txt`'s header list gains 164. The constitution stays
**6.3.2**: no principle, register entry, entity, page, feature, module, or Usage
Limit changes. Review date: 2026-12-09.
