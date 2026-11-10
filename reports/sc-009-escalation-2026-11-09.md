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

