# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link to spec.md]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

<!--
  BINDING RULES FOR THIS DOCUMENT (governed by `.specify/memory/constitution.md`; the current version is in its footer and in `.specify/memory/version.json`) - NORMATIVE:
  - This file carries every technical detail; spec.md stays technology-agnostic.
  - The Technical Context MUST contain the Constitution Mandated Values heading;
    a value named by a rule but written elsewhere does not discharge that rule,
    and a plan without the heading has discharged none of them.
  - The Constitution Check gate is evaluated BEFORE Phase 0 research and
    re-evaluated AFTER Phase 1 design; an unjustified violation is an ERROR.
  - Every accepted deviation, unmet SHOULD, no-requirement work item, and
    budget exception belongs in Complexity Tracking with an owner and a date.
  - Project Context Sources (binding): this plan is the only artifact carrying
    technical detail, so it MUST be written against the project-level sources
    rather than from the feature spec alone — `.specify/memory/constitution.md`,
    `docs/architecture.md` (the layout), `docs/capacity-model.md` (the six-month
    load envelope and the physical constraints it fixes), the constitution's
    registers (Technology Standards, Product Register),
    `docs/domain-model.md` (the entities, their relationships, and their
    invariants, which the plan's Phase 1 `data-model.md` MUST NOT contradict),
    `docs/design/` (the slice's map entry and its reference images: the
    composition, the states, the copy, and the open questions this plan must
    answer; reference evidence, not a visual baseline, ADR-128, ADR-129,
    ADR-133), `ROADMAP.md` (the slice's scope, dependencies, and the items this
    slice does not do, ADR-134),
    `Project-Technologies.txt` (a mirror),
    `Core-Project.txt`, `docs/DECISIONS.md`. Read the sections named; for
    `docs/DECISIONS.md` read its index and the volume that holds the records
    this feature touches, not the whole register (ADR-071, ADR-125, Reading
    protocol). A plan that contradicts an
    accepted ADR (the decision register) or the Technology Standards is an
    ERROR, not a preference. The Ownership Map MUST record paths that match
    `docs/architecture.md`, and a project-level concern (architecture, data
    model, UI foundation, technology stack, conventions) MUST NOT be turned into
    a feature.
  - A plan that resolves an entity, a relationship, an invariant, or an open
    product fact MUST amend `docs/domain-model.md` and record an ADR in the same
    change, and MUST name the entity it resolved under Gate 2 → Product Register.
    A column, a type, and an index belong to this plan's `data-model.md` and to a
    migration; they do not belong to the constitution or to the domain model.
  - Every ADR first named by this plan MUST be reaffirmed in this plan's
    Constitution Check gate.
  - All artifacts and tools that read or write them MUST be UTF-8, with a
    UTF-8 reader on the tooling path (constitution § Artifact Workflow).
-->

## Summary

[Primary requirement from the spec + technical approach from research, in a few sentences.]

## Technical Context

**Language/Version**: TypeScript with strict mode mandatory (Principle II) — [runtime and version]
**Primary Dependencies**: [The minimum stack defined by the constitution's Technology Standards register (`Project-Technologies.txt` mirrors it); any addition MUST clear Dependency Governance: justification, licence obligation recorded, vulnerability scan]
**Storage**: [PostgreSQL through packages/db / OpenSearch through packages/search / SeaweedFS object storage — as applicable to this feature]
**Testing**: [Per the spec's Test Coverage Request — Vitest for unit/integration, Playwright for end-to-end]
**Target Platform**: [e.g., Linux VPS, modern browsers per the supported-browser statement]
**Project Type**: Monorepo — apps/ (web, admin, api, worker) + packages/ (shared, db, search, ui, config); see docs/architecture.md
**Performance Goals**: [p50 and p95 for the request path, under the load condition named below]
**Constraints**: [numeric budgets and product limits from the Usage Limits table: max file size, upload counts, cart cap, search p95 < 1 s, cart-add < 200 ms, file processing < 5 min — those that apply]
**Scale/Scope**: [the volume and load this plan's budgets are measured against; start from `docs/capacity-model.md` and state any deviation]

### Constitution Mandated Values

<!--
  Module Discipline and Development Workflow requires every value below to be
  recorded here, in the plan's Technical Context. A row is never deleted:
  either state the value, or state explicitly that this feature does not
  introduce it, with the reason. RTO/RPO may be "not introduced" only when
  the feature adds no persistent storage. Performance budgets MUST be stated
  as percentiles (p50 + p95), not averages, and the same numbers MUST appear
  in the spec's Success Criteria (Query Safety and Secrets).

  Row numbering and the constitution's closed list: the constitution enumerates
  seventeen values, and this table has nineteen rows because two of its items are
  split so each half can be answered on its own. Rows 6 and 7 are the two halves
  of constitution item 6 (the performance budget percentiles AND the maximum
  query execution time); rows 8 and 9 are the two halves of constitution item 7
  (the RTO AND the RPO). Rows 1-5 and 10-16 map one-to-one onto constitution
  items 1-5 and 8-14; rows 17-19 map one-to-one onto constitution items 15-17.
  The constitution's list is closed: a MUST that names a new value adds it there
  first, and the matching row is added here in the same change.
-->

| # | Value | This plan records |
|---|-------|-------------------|
| 1 | Migration tool (the single one) | [name the one tool, or "not introduced — no schema change"] |
| 2 | Password hashing cost factor | [algorithm + cost factor, or "not introduced — no authentication surface"] |
| 3 | Authentication rate limits | [numeric limits + window, or "not introduced — no authentication endpoint"] |
| 4 | Session timeout and token lifetime | [numbers, or "not introduced — no session surface"] |
| 5 | Dependency budget (direct runtime dependencies) | [the budget this feature must stay within] |
| 6 | Performance budget percentiles (p50 / p95) | [numbers + the load condition] |
| 7 | Maximum query execution time | [number] |
| 8 | Recovery Time Objective (RTO) | [number, or "not introduced — no persistent storage"] |
| 9 | Recovery Point Objective (RPO) | [number, or "not introduced — no persistent storage"] |
| 10 | Runtime version | [pinned version, or "not introduced — no runtime surface"] |
| 11 | Icon set | [IconPark (colour cut consumed; the outline cut is withdrawn; both cuts vendored under `packages/ui/vendor` and pinned), Apache-2.0, no emoji, licence and vulnerability scan (ADR-098 annotated by ADR-128 and ADR-132); or "not introduced — no icon surface"] |
| 12 | Extraction libraries | [the approved libraries, or "not introduced — no extraction surface"] |
| 13 | Transactional SMS transport | [the approved transport, or "not introduced — no SMS surface"] |
| 14 | Continuous-integration provider | [the approved provider, or "not introduced — CI unchanged"] |
| 15 | Decoded-size cap that rejects a zip-bomb upload | [the recorded cap, or "not introduced — no upload surface"] |
| 16 | Supported-browser statement | [the stated browser set, or "not introduced — no UI change"] |
| 17 | Password policy parameters (minimum length and the common-or-breached-password source) | [the minimum length and the source the platform holds, or "not introduced — no password surface"] |
| 18 | One-time-code lifetime, re-request limit, and incorrect-entry bound | [numbers, or "not introduced — no one-time-code surface"] |
| 19 | Profile field maximum lengths (full name, shop name) | [numbers, or "not introduced — no profile field"] |

### Verification Notes *(required where applicable)*

<!--
  Performance Budgets and Verification requires these recorded in the plan,
  not discovered at review. "Where applicable" means: N+1 for every feature
  that adds a data-fetching path; the cache block only if a cache is
  introduced; accessibility for every user-facing surface.
-->

- **N+1 inspection**: [Every data-fetching path this feature introduces — inspected: yes; result: none found / findings and fix]
- **Caching**: [If a cache is introduced: what is cached, the TTL, and the invalidation trigger — a cache without a stated invalidation rule MUST NOT be introduced]
- **Accessibility verification**: [automated scan tool + manual keyboard-only pass — WCAG 2.2 AA]
- **Design conformance**: [the page states this slice ships; the baseline set it generates in CI with the product's browser and fonts; the gate (ADR-129); any state the reference set does not capture, recorded in Complexity Tracking]
- **Budget check**: [the measurement point for the p50/p95 and max-query numbers above; a measured regression above 10% against the branching version blocks release]

## Constitution Check

*GATE: evaluated before Phase 0 research; re-evaluated after Phase 1 design. An unjustified violation is an ERROR; a justified one is a Complexity Tracking row.*

### Gate 1 — Core Principles (I–X)

| Principle | Status | Evidence / notes |
|---|---|---|
| I. Evident, Traceable Change *(NON-NEGOTIABLE)* | | [FR/AC identifiers assigned in spec.md; every task will end with `(implements FR-###, AC-###)`; commits and PRs will reference spec + task identifiers] |
| II. Strict Type Safety | | [strict mode flags; no `any`; no double assertions; validation schemas shared in packages/shared] |
| III. Measured Test Coverage | | [spec Test Coverage Request answered; 80% of changed lines; the enforcement point for the coverage gate] |
| IV. Accessible User Interfaces | | [WCAG 2.2 AA; keyboard operable; state changes announced; `:focus-visible`; touch targets ≥ 44px] |
| V. Arabic-First and RTL Interfaces *(NON-NEGOTIABLE)* | | [`<html dir="rtl" lang="ar">`; logical CSS properties only; Latin numerals; Arabic root-aware search through the designated analyzer] |
| VI. Catalog-Only Scope *(NON-NEGOTIABLE)* | | [no payment/purchase/RFQ/wallet; cart is a bookmark list carrying no price or quantity; single admin conversation thread only] |
| VII. Specification-First and Documentation Separation *(NON-NEGOTIABLE)* | | [spec.md reviewed for absence of technical detail; this plan holds the technical detail] |
| VIII. User Story Independence *(NON-NEGOTIABLE)* | | [priorities assigned; the P1 set forms the shippable MVP; no circular story dependencies] |
| IX. UI Foundation Fidelity *(NON-NEGOTIABLE)* | | [Nuxt UI v4 is the only component library; the Wafar UI layer is `packages/ui`; project values, IconPark (colour cut consumed, outline cut withdrawn), IBM Plex Sans Arabic, and tokens live there; no second component library, no parallel design system, no raw values or direct z-index values; no emoji; every state rendered; the apps' `app/` paths appear in the Ownership Map; the conformance gate (ADR-128/ADR-129): a contract test and a visual baseline for every page state this slice ships] |
| X. Modular Monolith Architecture | | [owning module named per change; one responsibility per module; no direct cross-module imports — communication through the shared package] |

*Every row is filled. A principle that does not apply is marked "not applicable" with a reason; never left blank.*

### Gate 2 — Binding Sections

<!-- Governance: "The planning phase MUST evaluate its constitution check gate
     against every binding rule above other than Governance's own, and MUST
     record justified violations in the plan's Complexity Tracking table."
     The sections below are the binding enumeration from Governance. -->

| Binding section | Status | Evidence / notes |
|---|---|---|
| Query Safety and Secrets | | [parameterized statements; sortable/filterable columns from the explicit allowlist; query timeouts; server-side maximum limits; no secrets in source/logs/client] |
| Schema and Migration Control | | [single migration tool; one reversible step per migration; expand/backfill/contract for destructive changes; FK indexes; timestamps; tenant scoping at the single shared entry point] |
| Identity, Authentication, and Session Policy | | [designated library; scim/sso disabled; hashing; TLS; auth rate limits; CSRF; output encoding; revocable sessions; security headers] |
| Authorization and Access Control | | [role matrix respected; audit log for every admin operation; permission resolution at the single shared entry point — or a Gate 3 record if the model is still deferred] |
| Performance Budgets and Verification | | [p50/p95 + max query time in CMV; N+1 inspected; cache TTL/invalidation; >10% regression blocks release] |
| Dependency Governance | | [versions pinned; lockfile untouched outside the update process; licence name + obligation recorded for every new dependency; vulnerability scan; budget respected] |
| Module Discipline and Development Workflow | | [one owning module per business rule; no duplicated logic; CMV heading present; CI network rule when CI is introduced] |
| Project Structure and Debt Control | | [ownership map below; import boundaries mechanically enforced; shared code promoted only after a second consumer exists] |
| Documentation | | [ADR for every non-trivial decision (alternatives + rationale); affected docs updated in the same change; every ADR first named by this plan reaffirmed here] |
| Deployment and Observability | | [dev/staging/production; staging parity; health checks per used dependency; structured logs + correlation id; error tracker; backups; RTO/RPO in CMV] |
| Technology Standards | | [stack unchanged from the constitution's Technology Standards register; the paths match the repository topology and the internal layout, with the Wafar UI layer path fixed by ADR-097 outside the constitution's package rows; no unregistered technology outside the "Register gaps a slice MUST close" process; a MAJOR substitution would require a constitutional amendment] |
| Glossary | | [every term the feature uses is the Glossary's term, not a synonym; no entity, field, or column name is invented outside the register] |
| Product Scope | | [pages and features stay inside the defined list; an addition is recorded in Complexity Tracking] |
| File Processing Overview | | [single pipeline sequence; status enum exactly uploaded/processing/completed/failed; validation before storage; duplicate rejected] |
| Product Register | | [roles respected; no page outside the twenty-eight; no feature outside the sixteen; every unresolved product fact handled or recorded — the register's open facts are listed in `docs/domain-model.md` → Unresolved facts, and the slice named MUST resolve the ones this feature touches] |
| Single-Reference Sufficiency | | [no rule discharged from an unregistered source; every open value recorded under Constitution Mandated Values and as an ADR; no register copied into this plan; no column, entity field, or UI value copied out of its source into this plan instead of referenced] |
| Artifact Workflow and Traceability | | [stable `FR-###`/`AC-###`/`SC-###` identifiers, never renumbered or reused; at most three unresolved `NEEDS CLARIFICATION` items in spec.md; the spec's Test Coverage Request answered; every ADR first named here reaffirmed; at most three unresolved clarifications remaining before tasks] |
| Product Fact Clarifications | | [the product facts this feature touches are stated as requirements, not restated: contact-form fields exactly name/phone/body; the platform stays free to merchants; the 99-part cart notice; no CAPTCHA; no PWA; the shell's per-page controls] |

### Gate 3 — Deferred Areas Touched

<!--
  Governance, Deferred areas: the first feature that implements a deferred
  area MUST record here which rules are still missing for that area and how
  they will be ratified — no later than the feature's acceptance, and never
  after the area is in production. The five deferred areas: extraction
  algorithm; catalog data shape (discharged in 2.18.0 by ADR-040 — a plan
  touches this row only to record that it is already closed); file ingestion
  internals; authorization model; retrieval interface.

  `docs/domain-model.md` → Unresolved facts is a second, related list: the open
  *product* questions the register carries, each already assigned to a slice.
  A feature that touches one MUST fill the matching row below too, or state that
  it does not touch it. The two lists are not the same — a deferred area is a
  class of decision, an unresolved fact is a specific question.
-->

| Deferred area | What this feature decides | Rules still missing | Ratification plan (owner, deadline ≤ feature acceptance) |
|---|---|---|---|
| [e.g., Retrieval interface] | [ranking / order beyond the sortable columns / table presentation beyond Product Scope columns] | [list] | [owner; deadline] |

| Unresolved product fact (from `docs/domain-model.md`) | Touched by this feature? | How it is resolved here | ADR + domain-model.md amendment recorded? |
|---|---|---|---|
| [e.g., #1 the message sender's representation] | [yes / no] | [the decision, or "not touched — R10 owns it"] | [ADR-###, or "not applicable"] |

*If none: "None — no deferred area is implemented by this feature."*

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── checklists/          # /speckit.checklist output, when generated
└── tasks.md             # Phase 2 output (/speckit.tasks command — NOT created by /speckit.plan)
```

### Source Code (repository root)

<!-- Replace with the concrete paths for this feature and delete the rest.
     This repository is a Monorepo: apps/ (web, admin, api, worker) and
     packages/ (shared, db, search, ui, config). -->

```text
apps/
├── web/
│   └── app/
├── admin/
│   └── app/
├── api/
│   └── src/modules/[owning-module]/
└── worker/
packages/
├── shared/
├── db/
├── search/
├── ui/
└── config/
```

### Ownership Map (required)

<!--
  Project Structure and Debt Control: every directory holding production code
  MUST have exactly one owning feature named here, and MUST NOT be written by
  two features at once. Shared code is promoted out of a feature only after a
  second consumer exists. The Wafar UI layer is `packages/ui` (ADR-097); every
  plan MUST record it, and app-specific code stays under `apps/*/app/`.
-->

| Path (directory or file) | Owning feature | Written by this feature? | Exclusive to it? |
|---|---|---|---|
| [apps/... or packages/...] | [###-feature-name] | [yes / no] | [yes = no other feature may touch it] |
| [packages/ui/... when the layer is touched] | [###-feature-name] | [yes / no] | [yes = no other feature may touch it] |

**Structure Decision**: [The real paths selected for this feature and why; reference the ownership table above.]

## Complexity Tracking

<!--
  Fill for: every justified violation of a binding rule; every unmet SHOULD;
  every work item that implements no requirement (refactor, dependency or
  tooling change, security fix, spike — Principle I); dependency-budget
  exceedance with the restore-by date; staging-parity defects; production
  changes without a staging run; query-budget exceptions (query, measured
  time, reason); measured regressions above 10%. Rows stay until closed.
  Include the Wafar UI layer path (`packages/ui`), the IconPark vendoring and
  archive risk, the IBM Plex Sans Arabic licence, and the light/dark default
  when this feature touches them.
-->

| Item | Type | Why needed | Simpler alternative rejected because | Owner | Review / restore-by date |
|---|---|---|---|---|---|
| [item] | [Violation / Unmet SHOULD / Unmapped work / Budget / Parity / Perf] | [current need] | [why the simple path is insufficient] | [name] | [date] |
