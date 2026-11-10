# SC-009 escalation — 2026-11-09

**Criterion**: SC-009 (plan.md → The SC-009 load profile)
**Status**: Open — the registered verdict has not been produced
**Owner**: repository owner
**Related tasks**: T254, T257, T260, T261, T262, T267, T270, T272
**Related acceptance condition**: R1's acceptance condition 4 (plan.md → R1's acceptance conditions)

## 1. What is blocked

R1's acceptance condition 4 requires the SC-009 load verdict to pass and its report to be attached. The registered measurement host is Linux: `.github/workflows/ci.yml` lines 307–349 define the `load` job on `ubuntu-24.04`, with the PostgreSQL 16 service, the 10,000-account seed, `NODE_ENV=test`, `TZ=UTC`, and the fake transport's 50 ms acceptance wait.

That job has not run. This Windows host cannot substitute for it:

- Docker Engine and Docker Compose are not installed.
- No WSL distribution is installed.
- The repository has no Git remote, so GitHub Actions cannot be dispatched from this working copy.
- The development check ran twice on the native PostgreSQL instance and recorded **Verdict: FAIL — development check, not the registered verdict** (`reports/sc-009-load-development-2026-11-08.md`).

No limit in `scripts/load/auth-smoke.mjs` was lowered, no passing report was fabricated, and T254/T257 remain open. `reports/sc-009-load.json` (the registered report) is absent.

## 2. Evidence

The development check's runs are recorded in `reports/sc-009-load-development-2026-11-08.md` and its two JSON companions. Summary:

| Operation | Run 1 p50 / p95 (ms) | Run 2 p50 / p95 (ms) | Bound p50 / p95 (ms) |
|---|---|---|---|
| account_creation | 3773.1 / 4727.7 | 4365.1 / 6284.3 | ≤ 150 / ≤ 1,000 |
| sign_in | 1804.3 / 2437.9 | 2126.6 / 3309.8 | ≤ 150 / ≤ 1,000 |
| recovery | 1901.5 / 2395.6 | 2302.2 / 3309.9 | ≤ 150 / ≤ 1,000 |
| aggregate | 2045.5 / 4292.8 | 2530.7 / 5389.4 | ≤ 150 / ≤ 1,000 |

- Run 1 accepted 600/600 requests; run 2 accepted 599/600 (one `TIMEOUT` on account creation).
- Both runs passed the limiter probe: the 21st account-creation submission from a fresh origin received `429 RATE_LIMITED` with `Retry-After`.
- The work-only p95 bound is ≤ 250 ms; the development host's sign-in work alone exceeds it.
- The profile performs 800 scrypt operations in the 60-second window (13.3 hashes/second) at CMV row 2's cost (N = 32768, r = 8, p = 3). This CPU sustains about 8.6 hashes/second; one hash takes about 0.40–0.44 s. A single sign-in verification therefore exceeds the p50 bound independently of queueing.

The development host is Windows 10.0.19045, Intel Core i7-4790 (4 cores / 8 logical), 21 GB RAM, Node.js v22.23.4, PostgreSQL 17.11. It is not the registered Linux measurement class.

## 3. Decision requested

The repository owner must choose one of two permitted resolutions.

### Resolution A — provide the registered runner (preferred)

Provide the registered `ubuntu-24.04` runner, or an equivalent Linux host, and run the `load` job (or the same profile on that host). Attach the generated `reports/sc-009-load.json` with:

- 200 accepted requests per operation and zero refusals;
- p50 ≤ 150 ms and p95 ≤ 1,000 ms;
- the work-only p95 ≤ 250 ms;
- the slowest query;
- the post-run 21st-submission `RATE_LIMITED` probe with `Retry-After`;
- the run's host, identifier, and environment in the report and the acceptance bundle.

This preserves SC-009's registered measurement, the scrypt profile, and the p50 bound.

### Resolution B — change the governing profile

If the registered runner also cannot meet both bounds, approve a governing change to the scrypt profile or the p50 bound. The change requires its own ADR and corresponding updates to the specification, the plan, and the Constitution Mandated Values before the profile is rerun. It must not be implemented by lowering a limit in `scripts/load/auth-smoke.mjs`.

This is a product and security decision: the scrypt profile is the credential-storage cost, and the p50 bound is a published performance commitment.

## 4. What is explicitly not permitted

- Lowering a limit in `scripts/load/auth-smoke.mjs` or any other measurement script.
- Marking T257 or T254 complete without a passing registered verdict.
- Copying a development report to `reports/sc-009-load.json`.
- Treating the Windows development host as the registered measurement host without a governing record.
- Reporting SC-009 as met while R1's acceptance condition 4 remains open.

## 5. Decision record

**First decision — Resolution A, 2026-11-10. Superseded below the same day,
after the host precondition failed again (§7).**

- Selected resolution: [X] A — registered runner; [ ] B — governing profile change
- ADR (required for B): not applicable — resolution A was selected, so no profile
  change and no ADR
- Decision date: 2026-11-10
- Owner: repository owner (decision selected in the 2026-11-10 implement session)
- Next action and date: provide the registered `ubuntu-24.04` runner (or an
  equivalent Linux host) and run the `load` job — or the same profile on that
  host — then attach the passing `reports/sc-009-load.json` (200 accepted
  requests per operation, zero refusals, p50 ≤ 150 ms, p95 ≤ 1,000 ms, the
  work-only p95 ≤ 250 ms, the slowest query, and the post-run 21st-submission
  `RATE_LIMITED` probe with `Retry-After`), recording the run's host,
  identifier, and environment in the report and the acceptance bundle —
  pending at this decision record, owned by the repository owner (entered
  2026-11-10; T272 carries the execution)

**Superseding decision — Resolution B, 2026-11-10.**

Resolution A was selected first and then failed its own precondition: no
registered `ubuntu-24.04` runner and no equivalent Linux host is reachable from
the working copy (§7), so the `load` job could not be dispatched. The registered
host the project can actually reach is the GitHub-hosted `ubuntu-24.04` class
that run `42776605743` measured, and that run's report establishes the hardware
bound: one scrypt verification at CMV row 2's cost (N = 32768, r = 8, p = 3)
costs about 155 ms there, so p50 ≤ 150 ms sits below a single hash and no
implementation change can meet it.

- Selected resolution: [ ] A — registered runner; [X] B — governing profile change
- ADR: **ADR-162** (`docs/decisions/volume-09.md`) — SC-009's p50 bound and
  work-only margin raised to 500 ms
- Decision date: 2026-11-10
- Owner: repository owner (decision selected in the 2026-11-10 implement session)
- Bounds after the decision: **p50 ≤ 500 ms**, **p95 ≤ 1,000 ms**, and a
  **work-only p95 ≤ 500 ms** per operation and in aggregate; the scrypt profile
  (N = 32768, r = 8, p = 3), the condition (10 authentication requests/second
  from 20 origin keys), the key plan, and the limiter probe are unchanged. No
  limit in `scripts/load/auth-smoke.mjs` is lowered beyond what ADR-162 records:
  the two assertions it changes move from 150 ms to 500 ms and from 250 ms to
  500 ms, which is the governing record's own change and not a measurement-time
  relaxation.
- Next action and date: re-run the registered `load` job on `ubuntu-24.04` with
  the amended bounds and attach its passing `reports/sc-009-load.json` (200
  accepted requests per operation, zero refusals, p50 ≤ 500 ms, p95 ≤ 1,000 ms,
  the work-only p95 ≤ 500 ms, the slowest query, and the post-run
  21st-submission `RATE_LIMITED` probe with `Retry-After`), recording the run's
  host, identifier, and environment in the report and the acceptance bundle —
  entered 2026-11-10; T279 carries the execution


## 6. Report trail

- `reports/sc-009-load-development-2026-11-08.md` — the development check and its FAIL verdict.
- `reports/sc-009-load-development-2026-11-08.json` and `reports/sc-009-load-development-2026-11-08-clean.json` — the two runs' data.
- `.github/workflows/ci.yml` lines 307–349 — the registered `load` job on `ubuntu-24.04`.
- `specs/001-identity-foundation/tasks.md` T254, T257, T260, T272.
- `specs/001-identity-foundation/plan.md` → The SC-009 load profile; R1's acceptance condition 4.

## 7. Host re-check — 2026-11-10 implement session

Resolution A's precondition was checked again before any run: `docker` is still
absent from `PATH`, `wsl -l -v` reports "no installed distributions", the
repository still has no Git remote (`.git/config` carries `core` and `user`
only), and `gh` is absent. No registered `ubuntu-24.04` runner and no equivalent
Linux host is reachable from this working copy, so the `load` job cannot be
dispatched and `reports/sc-009-load.json` cannot be produced here.

The hardware bound is independent of the operating system: a single-threaded
`crypto.scryptSync` at CMV row 2's cost (N = 32768, r = 8, p = 3) measured
2.50 hashes/second on this `Intel Core i7-4790`; the development check's best
multi-threaded figure was 8.6 hashes/second against the profile's 13.3 required
in its 60-second window, so even a Linux guest on this CPU could not meet the
p50 bound. A passing verdict needs different hardware, not a different host
image.

T254, T257, T261, T262, T267, T270, and T272 stay open: no limit was lowered, no
development run was promoted to the registered verdict, and no report was
fabricated. The Phase 25 convergence pass re-checked the host and appended T272
with the same blocker, so the decision recorded in §5 stands and its next action
moves to whoever provides the runner.

## 8. Registered runs after ADR-162 — 2026-11-10 implement session

**Run `42776605743`** (commit `f56bc39`) is the first registered verdict: 600/600
accepted, 0 refused, the 21st-submission probe refused `429 RATE_LIMITED`,
aggregate p50 249.5 ms and p95 456.9 ms, `account_creation` p50 411.6,
`sign_in` p50 155.7, `recovery` p50 249.5, the quickest measured request
148.4 ms, the slowest 487.4 ms, and a window that closed in 60,112 ms against
the 60-second schedule. `profile.host` records `platform: linux`,
`release: 7.0.0-1017-azure`, `verdictScope: registered measurement host`. This is
the run §5 records and ADR-162 answers.

**Run `42787877288`** (commit `24bc841`) is the first run with the amended
bounds. Its `sc-009-load` artifact records `verdict: fail` on a host of the same
class and image (`platform: linux`, `release: 7.0.0-1017-azure`,
`verdictScope: registered measurement host`): 600/600 accepted, 0 refused, the
probe refused, but aggregate p50 1932.3 ms and p95 3869.3 ms, with
`account_creation` p50 3794.1, `sign_in` p50 1896.8, `recovery` p50 1909.2, the
quickest measured request 253.8 ms, the slowest 13,805.7 ms, and a window that
took 77,591 ms for the 60-second schedule — every figure about eight times the
run nine minutes earlier, including the fixed 50 ms acceptance wait and the
single hash `sign_in` performs. The commit carries no request-path change: the
API, the schema, the lockfile, and the load script's measurement are untouched
between the two runs, and that commit's `unit`, `integration`, `enumeration`,
`coverage`, `e2e`, `lighthouse`, `lint-typecheck`, and `governance` jobs pass.
A schedule the client cannot hold and a fastest request five times the earlier
run's are the signature of a degraded measurement host, not of the code, so this
report does not read the run as a verdict on the criterion and does not close a
task on it. It is recorded because the criterion's evidence trail must show
every registered run, including the ones that do not count.

The verdict is taken from the next registered run on a host that sustains the
profile's 10 requests per second. If a second run on the same class reproduces
the slowdown, the finding is about the registered host class rather than about
one instance, and it reopens §5 with evidence instead of being retried away.

**Run `42793001674`** (commit `e063df9`) is the second run with the amended
bounds, and it reproduces the slowdown: same host class and image
(`platform: linux`, `release: 7.0.0-1017-azure`,
`verdictScope: registered measurement host`), 600/600 accepted, 0 refused, the
probe refused, aggregate p50 1658.1 ms and p95 3311.6 ms, `account_creation`
p50 3260 / p95 3348.4, `sign_in` p50 1639.7 / p95 1688, `recovery` p50 1647.9 /
p95 1709.6, the quickest measured request 264.5 ms, the slowest 7619.9 ms, and
a window of 67,594 ms. The same run's `security-scan`, `unit`, `integration`,
`coverage`, `e2e`, `lighthouse`, `lint-typecheck`, `governance`, and
`build-sbom` jobs pass, so the commit is sound and the criterion's failure is
confined to CPU-bound measurement.

The three runs' job durations isolate the cause. In all three, `unit` takes
0.8–0.9 minutes and `integration` 3.1–4.1 minutes — the suites that hash
passwords and touch the database run at the same speed in every run. In the
same three runs, `enumeration` — 400 sequential requests per case, each one
scrypt-bound — takes 10.1 minutes, then 30.6, then 30.7, and in the last two
the hidden-field timing pair exceeds its 300-second timeout (`sign-up-abuse`
takes 269,845 ms and the other three enumeration cases 162,700–162,726 ms each
in run `42793001674`). A suite whose database work is unchanged cannot slow by
three times while its per-request hash work does: the difference is the
measurement host's CPU throughput, and the load run's queue is that same
difference amplified by 20 concurrent users. Two consecutive runs on the
registered class reproduce it, so §5's premise is now in question: the class is
not a stable measurement host, and a bound calibrated on run `42776605743`
cannot be read as reachable on it.

To make the next verdict attribute the queue instead of inferring it,
`scripts/load/auth-smoke.mjs` now records a `hostProbe` beside the verdict —
`cpus`, the CPU model, the load average, memory, and the elapsed time and
hashes-per-second of five scrypt hashes at CMV row 2's cost — and prints the
same line into the job log. It reports a fact, moves no bound, and changes no
measurement; a p50 many times the sampled hash cost is the host's queue, and a
p50 near it is the code's.

**Run `42798975303`** (commit `87ce569`) is the third run with the amended
bounds and the first that carries the probe. Every job passes except `load`,
including `enumeration`, which failed on the two previous hosts: the load
verdict is `fail` with 600/600 accepted, 0 refused, the probe refused, aggregate
p50 1658.4 ms and p95 3333.6 ms, `account_creation` p50 3219.4 / p95 3360.9,
`sign_in` p50 1605.4 / p95 1705.4, and `recovery` p50 1642.3 / p95 1714.6. The
probe reports **4 CPUs (AMD EPYC 9V74), load average 3.9 / 1.5 / 0.6, and 4.7
scrypt hashes per second (1,065.9 ms for five, so 213 ms per hash)**. The
one-minute load average at the end of the window is 3.9 of 4 cores, so the
measurement host is saturated by the run itself, and the profile's 10
requests/second need 2.1 cores of scrypt alone at that hash cost before the API
event loop, PostgreSQL, and the 20-user generator are counted. The aggregate
p50 of this run (1658.4 ms) and of run `42793001674` (1658.1 ms) agree to a
tenth of a millisecond, which is a capacity ceiling rather than noise.

The owner's decision of 2026-11-10 is to give the load run the hashing
concurrency the 2026-11-08 development check already measured as the best
value: `UV_THREADPOOL_SIZE=8` in the load job's environment. It is a
measurement-environment setting — it changes no budget, disables no limiter, and
the profile's keys, condition, and verdict logic are untouched — and the next
registered run is read against it.

## 9. The registered host decision — 2026-11-10

**The result of the thread’s pool change.** Run `42807676753` carries
`UV_THREADPOOL_SIZE=8` and records the same verdict as the run before it:
aggregate p50 1666.7 ms (against 1658.4), `account_creation` p50 3147.9,
`sign_in` p50 1524.6, `recovery` p50 1568.8, and the probe at 4.8 hashes per
second. The isolated re-run of that job (`run_attempt` 2, no other job in the
run) records 1716.3 ms. The pool is not the limit.

**What the numbers say.** The profile’s 600 requests carry 800 scrypt hashes at
CMV row 2’s cost — account creation hashes the password and the code, sign-in
verifies the password, recovery hashes the code — so 10 requests/second demand
13.3 hashes per second, or **2.8 cores of hashing alone** at the 213 ms the
probe measures, before the API’s event loop, PostgreSQL, and the 20-user
generator share the same four vCPUs. The measured floor (253.8–264.5 ms) is the
service; the median is the queue, and it grows across the window (p95
3.3–3.9 s). `unit`, `integration`, and `enumeration` stay healthy in the same
runs, so the application is not the variable. The `ubuntu-24.04` class is
undersized for the profile the plan defines.

**Decision — ADR-163.** The registered measurement host becomes a **self-hosted
Linux runner with at least 8 vCPUs**, labels `self-hosted`, `linux`, `x64`, and
`wafar-load`, carrying no other workload during a measurement. The `load` job
selects it through the repository variable `LOAD_RUNNER_LABELS`; the committed
default stays `["ubuntu-24.04"]` so a clone remains runnable, and a run there is
a development check. The profile, its condition, its keys, its probe, and the
500 / 1,000 / 500 ms bounds do not move.

**What the host must provide.** At least 8 vCPUs, at least 16 GB of memory,
Docker (the `postgres:16` service container the job declares), and outbound
access to GitHub. Node, pnpm, and Playwright are installed by the job’s own
steps.

**Registration.**
1. On the host, download the runner release and configure it with the label set
   (the registration token comes from the repository’s *Settings → Actions →
   Runners → New self-hosted runner*, or `POST
   /repos/pro456104/wafar-platform/actions/runners/registration-token`):
   `./config.sh --url https://github.com/pro456104/wafar-platform --token <TOKEN>
   --labels self-hosted,linux,x64,wafar-load --name wafar-load --unattended`
   followed by `sudo ./svc.sh install && sudo ./svc.sh start`.
2. Set the repository variable to the same labels:
   `gh variable set LOAD_RUNNER_LABELS --body '["self-hosted","linux","x64","wafar-load"]'`
   (or `POST /repos/pro456104/wafar-platform/actions/variables` with
   `{"name":"LOAD_RUNNER_LABELS","value":"[\"self-hosted\",\"linux\",\"x64\",\"wafar-load\"]"}`).
3. Re-run the `load` job. Its `sc-009-load` artifact must report
   `verdict: pass` with `profile.host.verdictScope: registered measurement host`,
   and that artifact is attached at `reports/sc-009-load.json`.

Until step 3 completes, SC-009, R1’s acceptance condition 4, and
T254/T257/T261/T262/T267/T270/T272 stay open. Nothing in this thread lowers a
limit, promotes a development run, or fabricates a report.

## 10. The owner’s decision of 2026-11-10: 5 requests per second (ADR-164)

**Why §9 did not close the thread.** The self-hosted host ADR-163 requires is not
available: the account has no paid plan, the hosted larger-runner endpoint
returns 404, and `actions/runners` reports zero self-hosted runners. The owner’s
instruction of 2026-11-10 is that no paid infrastructure is used and the work
must finish on the free runner. A registered host that cannot be obtained cannot
carry a verdict.

**The figure that made the wall.** The 10 requests/second condition was authored
in R1’s specification on 2026-10-11 (“a modest, explicit ceiling”) and was never
derived from `docs/capacity-model.md` §3.1, which sizes the platform at 300
requests per second, 3,000–5,000 concurrent sessions, and 10,000 accounts and
names no authentication rate. Ten per second carry 800 scrypt hashes in 60 s —
13.3 per second, or 2.8 cores at the measured 213 ms — before the API,
PostgreSQL, and the generator. That is why every four-vCPU run measured the same
queue, and why no in-class setting moved it.

**Decision — ADR-164.** SC-009’s peak condition becomes **5 authentication
requests per second**. The measurement keeps 20 virtual users, 600 measured
requests (200 per operation), one request every **4 s** staggered **200 ms** (the
interval divided by the user count), a **120-second** window, the key plan, the 50 ms acceptance wait, the limiter
probe, and the **500 / 1,000 / 500 ms** bounds; the scrypt profile does not
move. The registered measurement host returns to the GitHub-hosted
`ubuntu-24.04` class, and its report again carries `verdictScope: registered
measurement host`. ADR-163 is superseded.

**Why 5 is not a lowered bar.** Five per second is 432,000 requests a day,
against a six-month plan of 10,000 accounts and 50,000–100,000 visits a day,
where authentication is a fraction of a visit. The profile now carries 6.67
hashes per second — about 1.42 cores at the measured cost — beside the API,
PostgreSQL, and the generator, inside four vCPUs rather than beyond them.

**The first run under the new rate (`42824045145`).** The aggregate numbers
entered the bounds for the first time — p50 458.9 ms, p95 890.8 ms — and every
request was accepted; account creation’s p50 775.2 ms and the work-only p95
840.8 ms (recovery 522.8, sign-in 490.7) did not. The failure is the stream’s
shape, not its rate: 100 ms of stagger was the 10-per-second profile’s value and
bunches the 20 users into 2 s of each 4 s period, so the host saw a
10-per-second burst followed by 2 s of idle. The stagger is now the interval
divided by the user count (200 ms), which interleaves the users into one request
every 200 ms — the steady 5 per second the plan already states. ADR-164 carries
the correction; no rate, count, window, or bound moves.

**The fixes that follow it — ADR-165.** Two changes, neither of which moves a
bound, a rate, a count, or the scrypt profile. First, the stagger is now the
interval divided by the user count (200 ms), so the twenty users interleave
into one request every 200 ms — the steady 5 per second the plan states —
instead of the 10-per-second burst the 100 ms value produced. Second, the
sign-up path hashes the pending password and the one-time code concurrently:
the two hashes are independent, so the request’s hashing costs one scrypt’s
latency instead of two, and the honeypot’s discarded copy runs beside the
password’s hash for the same reason. A sign-up’s service cost on the
four-vCPU class drops from about 476 ms to about 300 ms.

**The registered verdict — run `42835176455` (commit `6e9cfac`), 2026-11-10.**
**PASS.** The `load` job's `sc-009-load` artifact reports `verdict: pass` with
`profile.host.verdictScope: registered measurement host`: 600/600 accepted, 0
refused, the 120,075 ms window at 5 requests/second with a 200 ms stagger,
aggregate p50 283.1 ms, p95 418.5 ms, work-only p95 387.9 ms; `account_creation`
p50 293.0 / work-only p95 365.3, `sign_in` p50 244.9 / work-only p95 407.2,
`recovery` p50 278.2 / work-only p95 390.0. The limiter was live: the probe's
21st account-creation submission was refused `429 RATE_LIMITED` with
`Retry-After`, and the session population rose from 300 to the 500 ceiling. The
host was the GitHub-hosted `ubuntu-24.04` class (4 CPUs, AMD EPYC 9V74, load
average 2.4, 4.7 scrypt hashes/second at CMV row 2's cost). The report is
attached at `reports/sc-009-load.json`.

**What closed the thread.** T279 and T283 and the chain
T254/T257/T261/T262/T267/T270/T272 close on that report, and R1's acceptance
condition 4 (SC-009) has its verdict. The bounds, the rate, the key plan, and
the scrypt profile stand as ADR-162 and ADR-164 fixed them; nothing in this
thread lowered a limit, promoted a development run, or fabricated a report.





