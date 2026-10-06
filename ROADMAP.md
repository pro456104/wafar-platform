# Roadmap — Wafar MVP

Wafar turns supplier parts catalogs (Excel, PDF, Word) into one searchable
catalog for Libyan merchants. This roadmap orders the MVP scope that is already
fixed in `.specify/memory/constitution.md` (Product Scope) and `Core-Project.txt`
into independently specifiable slices. It names and orders them; it does **not**
design them — the design happens when each slice runs through its own
`/speckit.specify`.

**Constitution**: `.specify/memory/constitution.md` (v2.19.1, last amended
2026-10-06). On any conflict with this file, the constitution wins.

Convention: the Spec Kit "spec of specs" procedure. A sub-spec opens with
`**Input**: Parent roadmap: ROADMAP.md → R#.` and this table's
`Sub-spec` column is filled in with that slice's directory.

**Slice identifiers equal specification numbers**: slice `R7` is created as
`specs/007-<name>/`, so a reference to a slice resolves without consulting this
table. ADR-015 records the renumbering from the thirteen-slice order this file
previously carried.

## What is NOT on this roadmap

The following is **project-level knowledge**, not work. It never takes a feature
number, is never specified as a feature, and is referenced by name from every
slice through the binding Project Context Sources carried in the feature
templates.

| Project-level concern | Source of truth |
|---|---|
| Engineering law, product scope, limits | `.specify/memory/constitution.md` |
| How the system is built | `docs/architecture.md` |
| The data model — entities, relationships, invariants | `docs/domain-model.md` |
| Approved technology stack | `.specify/memory/constitution.md` (Technology Standards); `Project-Technologies.txt` mirrors it |
| Design system (tokens, components) | `.specify/memory/constitution.md` (Design System Standards); `wafar.single.css` holds the values |
| Product definition (roles, pages, acceptance criteria) | `Core-Project.txt` |
| Accepted decisions | `docs/DECISIONS.md` (ADR-001 … ADR-056) |

A slice named "Architecture", "Design System", "Tech Stack", or "Conventions"
would be a classification error: it would tell the agent that a project-wide
rule is a piece of work, so later slices re-invent what already exists and the
rules drift. It MUST NOT be created. See `docs/DECISIONS.md` → ADR-007.

**Status legend**: planned · in-progress · done

## Slices

| ID | Sub-feature | Intent | Scope boundary | Depends on | Status | Sub-spec |
|----|-------------|--------|----------------|-----------|--------|----------|
| R1 | Identity and foundation | A merchant signs up (OTP-verified Libyan mobile number on +218, with no dial-code selector per ADR-041, password, city, optional shop name per ADR-030), signs in and out, and recovers a password via SMS OTP; sessions, password hashing, and auth rate limits follow the constitution's Identity, Authentication, and Session Policy, and the Libyan city list is fixed here. This slice also creates the repository workspaces and registers the `auth` and `users` modules, and decides open facts #7 (the account's status value) and #8 (whether the `auth` module owns a stored entity). | The merchant's account only. The administrator's separate login belongs to R13. Workspace, design-system extension, and delivery duties are listed under "First obligations" below. | — | planned | — |
| R2 | File intake | A merchant uploads an Excel, PDF, or Word catalog; size and content-type are validated before storage; bytes are stored in object storage; a content hash is computed; a duplicate is rejected by hash; the catalog record's status is recorded; the per-user upload quotas are enforced server-side (50 files per calendar month, 100 files in total); the stored byte count (`Catalog.size`) and content type (`Catalog.mime_type`) are recorded (open fact #9). | Validation, storage, hash, duplicate check, status, and upload quota only. Content safety (magic-byte validation, ClamAV scan, decoded-size cap, macro stripping) runs at intake; extraction is R3. | R1 | planned | — |
| R3 | Catalog extraction | The worker pipeline: extract parts from the file's tables, read the supplier name and issue date from the first page, normalise columns, deduplicate by file/page/row, index the parts, set status to `completed` or `failed`, and allow retry without re-uploading bytes. This slice also creates the `suppliers` module when the first-page extraction names the supplier, stores the supplier name in its normalised form, assigns every extracted value to one of the six canonical columns (including values separated out of a merged or overlapping source column), extracts no description, leaves a price printed in another currency without a stored price (which reads «بدون سعر»), and stores no column the constitution's Glossary does not fix. | The pipeline only. The parts read surface is R5. The extraction algorithm remains a deferred area ratified in this slice's plan; the canonical columns themselves are fixed by the constitution (ADR-040). Open facts #10 (a part's page and row of origin) and #12 (a multi-separator printed price) are decided here. | R2 | planned | — |
| R4 | My Files | The merchant's page for the files they uploaded: the file table, the upload action, the processing status of each file, deleting a file they uploaded, and the retry action for a failed file. Each file row carries the open control of the constitution-required "My Files → Parts (filtered by that file)" transition, wired in R5. The catalog-delete cascade is implemented here in the `catalogs` module service: parts and search-index withdrawal now, bookmark withdrawal added by R8 at the same trigger; R13's admin delete and R15's retention job reuse the same routine rather than reimplementing it. | The merchant's own files only. Upload validation and storage are R2; extraction is R3. | R1, R2, R3 | planned | — |
| R5 | Parts search | The public Parts page and the Home page: Arabic root-aware search over part number and original number by partial match, multi-select filters over car model, type, catalog file, and supplier (no selection meaning every supplier), a price range filter, a parts table showing every column at all times — part number, name, car model, original number, type, price, the supplier's name, and the cart control — with the price rendered as a decimal point and three decimal places and «بدون سعر» where a catalog prints none, every column sortable except `type`, pagination 20/50/100, and `?file=<id>` filtering, within the p95 < 1 s budget. The price column and its filter and sort are for a registered merchant only: a guest receives the same table through a projection that has no price (ADR-040). Home carries the platform name, the quick search field, and the four statistical cards. R5 also wires the file-row open control from My Files (R4) to `?file=<id>` filtering, and records the "searches" counter decision as an ADR, amending the Product Register in the same change if a new entity is required. The public table's design components (pagination, sort indicator, filter bar, sticky header) come from `wafar.single.css`. | Reading and filtering only. Search ranking beyond the sortable columns is a deferred area. | R1, R2, R3, R4 | planned | — |
| R6 | Catalog files page | The public Catalog page: a table of every uploaded catalog file; a row links to R5 filtered by that file. | Read-only listing. Management actions live in R13. The table lists the supplier named on the first page, extracted by R3. | R1, R2, R3, R5 | planned | — |
| R7 | Profile | A registered user edits the non-identifier account details (city, optional shop name) and changes the password. The mobile number is the identifier and is not editable here; the account carries no delete control. | The caller's own account only. The mobile number is not editable, and account deletion is not permitted. | R1 | planned | — |
| R8 | Cart (bookmarks) | A registered user adds and removes a part in a personal bookmark list, maximum 99 parts, add completing in under 200 ms; the `+` control becomes a red cart icon once saved. When a catalog is deleted, the bookmarks pointing at its parts are withdrawn through the same catalog-delete trigger R4 implements. | A bookmark list only: no price, no quantity, no checkout (Principle VI). | R1, R4, R5 | planned | — |
| R9 | Notifications | A notification list with a counter and a mark-as-read action, generated by processing outcomes, by administrator messages, and by an administrator's reply to a merchant message (Glossary → Notification, ADR-046). | Delivery to the in-app notification list only; administrator messages and replies become a source once R13 exists. Notification retention is decided here and recorded as an ADR. | R1, R3 | planned | — |
| R10 | Messaging | One conversation thread between a merchant and the administrator; the merchant sees a reply after refresh; a notification is delivered on reply. The reply itself is authored through the administrator's surface (R13); before R13 lands, acceptance of this slice verifies the reply path via the admin API directly. | Merchant to administrator only. User-to-user chat is prohibited (Principle VI). `Conversation`'s administrator reference and the message sender's representation are decided here (open facts #1 and #2). | R1, R9 | planned | — |
| R11 | Support surfaces | Contact form (name, phone, body) that reaches the administrator through the "Contact messages" admin page (ADR-028), plus the FAQ, privacy policy, terms of use, and 404 pages. This slice also creates the `support` module, with the contact form protected by a honeypot field, a minimum time-to-submit, and a per-client rate limit. | Static content and the contact form only. The administrator read surface is R13. A contact message's status and administrator note are decided here (open fact #11). | R1 | planned | — |
| R12 | Delivery and operations | Three environments with staging parity, health checks that verify the dependencies each service uses, the error tracker, secret management with pre-commit and CI scanning, TLS certificate management, the log pipeline, the dependency update process, and the pre-release load test, plus staging data anonymisation and the monitoring and alerting set. | Running the platform, not building product behaviour. | R1, R2, R3, R5 | planned | — |
| R13 | Admin application | The administrator's separate application with its own login: dashboard, users, files, suppliers, parts, messages, notifications, settings, contact messages. Every administrator operation is recorded as it happens. | The administrator's surface. The audit log's read surface is R14; authorization granularity is a deferred area. The admin file-delete reuses the catalog-delete cascade owned by R4. Whether the administrator is a distinct entity or a role on `User` is decided here (open fact #6), and so is where the Settings page's values are stored (open fact #13, recorded by ADR-053). | R1, R2, R3, R4, R5, R9, R10, R11 | planned | — |
| R14 | Audit log | The administrator-facing page over the append-only record every administrator operation writes. | Reading only. The recording is part of R13. | R13 | planned | — |
| R15 | Retention | Automatic deletion of a catalog 90 days after upload, with the search index lifecycle aligned to the same window. The retention job reuses the catalog-delete cascade owned by R4 rather than duplicating it. | The deletion job and the index lifecycle only; the delete cascades to the catalog's parts, bookmarks, and index entries. `expires_at` semantics are decided here (open fact #3). | R3, R4, R8 | planned | — |

## First obligations

The constitution assigns several duties to "the first slice" that introduces
something. Those assignments are resolved here so that no duty is left without
an owner.

| Duty | Owning slice | Constitution reference |
|---|---|---|
| The workspace, `packages/config`, and the shared tooling | R1 | Technology Standards → repository topology; `docs/architecture.md` |
| The test runner and the continuous-integration provider that enforces the 80% coverage gate | R1 | Principle III; Register gaps |
| The transactional SMS provider for OTP sign-up verification and password reset (replaces the previous transactional-email gap) | R1 | Technology Standards → Register gaps (ADR-030) |
| Provisioning of PostgreSQL, Redis, SeaweedFS, and OpenSearch for development, plus the PgDog fallback and its review date | R1 | Technology Standards (PgDog is pre-1.0 and MUST name a fallback and a review date) |
| Enabling Dependabot/Renovate so the update process exists from the first merge; the full dependency-update policy is R12's | R1 (enablement), R12 (policy) | Dependency Governance (before the first public release) |
| Backup and restore tooling, and the RTO/RPO numbers | R1 | Deployment and Observability (R1 introduces persistent storage) |
| The application shell — header, sidebar (full width or an icon rail on desktop, drawer on mobile), drawer, theme toggle, icon set (an open-source set under a permissive licence, self-hosted SVG, no emoji, per ADR-042), fonts, and the framework bridge — scoped to public pages and the merchant area, never on auth/404/static pages; resolved sidebar logo/header placement per ADR-017; icon set and theme toggle per ADR-016 | R1 | Principle IX; Design System Standards; ADR-016, ADR-017 |
| The sidebar icon rail's width token, added to `wafar.single.css` and consumed by the shell's desktop collapsed state; the width itself is R1's to choose | R1 | Design System Standards → Decision values (Sidebar): the rail token is reserved for the first slice that needs it (ADR-039) |
| The link surface that reaches the four bare-layout static pages (Contact, Privacy Policy, Terms of Use, FAQ), chosen and recorded as an ADR; the reachability requirement itself is binding whichever surface R1 picks | R1 | Product Fact Clarifications (the shell's per-page reachability; ADR-053) |
| The sticky table header the design system does not yet provide, added to `wafar.single.css` and used by the first table that requires it | R5 | Design System Standards → Decision values (Table) and the missing-components list; Principle IX; ADR-039 |
| CSRF, output-encoding, and security-header tests | R1 | Identity, Authentication, and Session Policy (first browser-facing feature) |
| The automated accessibility scan and the manual keyboard-only pass | R1 | Principle IV (interface verification) |
| The resolution of the sidebar conflict | Resolved 2026-10-03 in ADR-017: sidebar required fixed on desktop; auth/404/static pages bare; `Core-Project.txt` now defines the shell | Closed by ADR-017 |
| Setup, testing, and deployment documentation | R1 | Documentation (first feature that creates the workspace) |
| Staging parity, error tracker, secret management, TLS, log pipeline, dependency update process, load test | R12 | Deployment and Observability ("the first deploying slice"); Dependency Governance (dependency update process); Performance Budgets and Verification (load test) |
| The documentation-drift test for the first public interface, and the first N+1 query-count assertion | R2 | Documentation; Performance Budgets and Verification. R1's public surface is covered by OpenAPI generation from the Hono routes (ADR-002), so the first standalone drift test appears in R2. |
| The committed Stylelint + ESLint configuration that fails the build on physical direction properties and non-token design values | R1 | Design System Standards (Static enforcement) |
| The seeded CLI command that creates the administrator account, the forced password change, and the anti-enumeration/lockout responses | R1 | Identity, Authentication, and Session Policy |
| Automated detection of weak password hashing, and the "sign out everywhere" / browser-token revocation on password change | R1 | Identity, Authentication, and Session Policy |
| Honeypot field, minimum time-to-submit, and rate-limit protection on registration and contact forms, with automated tests | R1 (registration) and R11 (contact form) | Identity, Authentication, and Session Policy (anti-spam enforcement) |
| The merchant-isolation query-path test that fails the build when a merchant-reachable path returns another merchant's rows | R2 | Deployment and Observability (first merchant-scoped query surface) |
| The single shared entry point through which merchant scoping and (later) permission resolution are applied | R2 | Schema and Migration Control; Authorization and Access Control (R13 ratifies the permission model on the same entry point) |
| The dependency budget — the numeric cap on direct runtime dependencies, recorded under Constitution Mandated Values | R1 | Project Structure and Debt Control (the CMV list mandates the value but no slice owned it before ADR-033) |
| The content-safety pipeline: magic-byte validation, ClamAV scan, decoded-size cap, and macro stripping before extraction | R2 (validation), R3 (processing) | File Processing Rules; File Processing Overview |
| Presigned multipart upload transport for large files | R2 | Deployment and Observability (Upload transport) |
| Worker durability: bounded retries with exponential backoff, dead-letter queue, per-worker concurrency cap, and temporary-file sweep | R3 | Deployment and Observability (Worker durability) |
| The Lighthouse budget (LCP, INP, CLS) asserted by Lighthouse CI on the public Parts and Home pages | R5 (first public pages) | Performance Budgets and Verification |
| Stating the supported browsers (two latest major versions of Chrome, Edge, Firefox, Safari) in the plan's Constitution Mandated Values | R1 | Design System Standards (Supported browsers) |
| Staging data anonymisation (seeded or anonymised datasets only) | R12 | Deployment and Observability |
| The monitoring and alerting set: p95 request latency, search p95, processing success rate, queue depth, and budget-breach alerts | R12 | Deployment and Observability |
| Public API versioning (`/api/v1`) and the deprecation rule (one release of notice, recorded as an ADR) | R1 | Deployment and Observability |
| Per-build SBOM and the vulnerability/SAST scan (Semgrep OSS or equivalent) that blocks release | R1 | Dependency Governance; Deployment and Observability |
| Extraction libraries named in Constitution Mandated Values | R3 | Technology Standards → Register gaps |
| Redis client library: choice recorded in the plan's Complexity Tracking table with an ADR | R3 | Technology Standards → Register gaps |
| OpenSearch client library: choice recorded in the plan's Complexity Tracking table with an ADR | R5 | Technology Standards → Register gaps |
| Arabic analyzer configuration and verification: choice recorded in the plan's Complexity Tracking table with an ADR | R5 | Technology Standards → Register gaps |

## Defects in the slice order, and the slice that closes each

These were found by auditing the thirteen-slice order this file previously
carried. Each names the slice that closes it.

| # | Defect | Closed by |
|---|--------|-----------|
| 1 | The My Files page had no owning slice; the file-intake slice's scope boundary excluded it | R4 |
| 2 | Six register gaps were assigned to "the first deploying slice" or "the first slice that introduces the test runner", which no slice satisfied | R1 (test runner, CI, accessibility checker, icon set, backup tooling) · R3 (validation, Redis client library) · R5 (parts-search OpenSearch client library, Arabic analyzer) · R12 (the rest: deploying slice) |
| 3 | The sidebar conflict was assigned to "the first surface that lays out a page", which no slice satisfied | Closed by ADR-017 (2026-10-03); no slice owns it |
| 4 | The administrator slice did not depend on the extraction slice whose output it administers | R13 |
| 5 | The administrator slice shipped operations before the audit log existed, though every administrator operation must be recorded | R13 records each operation; R14 is the read surface |
| 6 | The contact form reaches the administrator, but no administrator page receives it | Closed 2026-10-03 by ADR-028: a dedicated Contact messages page (owned by R13, decided in ADR-028) |
| 7 | The application shell had no owner, so every browser-facing slice would rebuild it | R1 |
| 8 | The sub-spec `Input` convention was stated in two different forms, and the binding template carried neither | Fixed 2026-10-03 in `.specify/templates/overrides/spec-template.md` |
| 9 | The icon set was assigned to the parts-search slice, but the shell needs it first | R1 |
| 10 | The Sync Impact Report was committed into the constitution | Fixed 2026-10-03 |
| 11 | The product mirror listed five catalog status values, and pre-empted two facts the constitution assigns to R9 and R15 | Fixed 2026-10-03 in `Core-Project.txt` |
| 12 | The product mirror carried an unreferenced TODO for a budget the constitution had already fixed | Fixed 2026-10-03 in `Core-Project.txt` |
| 13 | The binding specification template did not carry the sub-spec `Input` line the constitution requires | Fixed 2026-10-03 |
| 14 | The per-user upload quotas (50 files per calendar month, 100 files in total) were binding limits that no slice's scope named, so nothing would have implemented them | Fixed 2026-10-03: R2 |
| 15 | The data model existed in three copies that had already diverged, and seven facts were carried by field identifiers that no registered source defined — so they were unbuildable under the Product Register's own rule. The identifiers did not come from the product mirror; they were present in earlier drafts of the unresolved-facts table, as ADR-019's annotation records | Fixed 2026-10-03 by ADR-019: `docs/domain-model.md` is the single authority |
| 16 | Three product conflicts were invisible because nobody compared the copies: how a message's sender is represented, whether a conversation carries an administrator reference, and whether an administrator is a distinct entity | Recorded as unresolved product facts; R10 (twice), R13 |

## Notes

- **Administrator representation.** R1's seeded CLI creates the administrator
  account under the current model, where the administrator is a role on `User`
  (`constitution.md` → Product Register; row 6 of Unresolved facts). R13 decides the distinct-entity
  question; if ratified, that decision amends the model and R1's seed in the
  same change.
- **Authorization model.** R4, R7, and R8 enforce ownership and merchant scope in
  their own scopes; the ratified permission granularity remains deferred to
  R13 (the deferred "authorization model" area; see `docs/domain-model.md`).
- **My Files → Parts transition (ADR-031).** R4 renders each file row's open
  control; R5 wires it to `?file=<id>` filtering. The constitution's required
  transition is satisfied across the R4 + R5 pair, not by either slice alone;
  R5's `Depends on` includes R4, so the edge is explicit.
- **Home page.** The Home page (platform name, quick search field, four
  statistical cards) needs no slice of its own: its search field is R5 and its
  counters depend on R1, R2, R3, and R5. R5 also owns the four-cards question,
  and the product register's four cards (accounts, files, parts, searches)
  stand; R5's plan records the choice in `docs/DECISIONS.md`. The "searches"
  counter (including guest searches) has no entity today; R5 decides where it
  is stored, records the choice as an ADR, and amends the Product Register in
  the same change if a new entity is required.
- **Independent verification.** Each slice is independently testable: R1 alone
  yields a working account on a working shell, R2 alone yields an accepted and
  stored file, R5 alone yields a searchable parts table.
- **Structure registers.** R1 creates the workspace; it MUST follow the fixed
  locations in the constitution (v2.19.1) and `docs/architecture.md`, including
  `apps/web/layouts` and `apps/admin`, and records the documentation-drift
  check for collection in R2 (R1's public surface is covered by OpenAPI
  generation from the Hono routes; ADR-002).
- **Deferred areas.** R2, R3, R5, and R13 are the first slices to implement the
  deferred areas (file ingestion internals; extraction algorithm; retrieval
  interface; authorization model). Catalog data shape was discharged 2026-10-05
  by ADR-040: the canonical columns are fixed in the constitution's Glossary, and
  the shape below the product is the schema file and the feature's
  `data-model.md`. Per the constitution's
  Governance section, each MUST record in its plan's Constitution Check which
  rules are still missing and how they will be ratified, no later than that
  slice's acceptance.
- **Open data-model questions.** `docs/domain-model.md` → Unresolved facts is
  the full list; this note mirrors it so the owning slice is visible at a
  glance. Rows 1–4 and 6 are also binding in the constitution's Product Register
  (Unresolved product facts), and rows 12 and 13 joined them there on 2026-10-05
  with the price and settings rows; rows 7–11 are open field-level facts carried by the model alone —
  the mirror carries the concepts, never field identifiers:
  1. Sender representation on a message (R10)
  2. `Conversation`'s administrator reference (R10)
  3. `expires_at`: retention deadline or supplier's printed expiry (R15)
  4. Notification retention (R9)
  5. ~~Contact message: conversation or its own inbox~~ — resolved 2026-10-03 by ADR-028: a dedicated Contact messages page owned by R13
  6. Administrator: distinct entity or a role on `User` (R13)
  7. The account's status value, and blocked-merchant as state or flag (R1)
  8. Whether the `auth` module owns any stored entity (R1)
  9. The catalog's stored byte count and content type (R2)
  10. A part's page and row of origin (R3)
  11. A contact message's status and administrator note (R11)
  12. How a printed price carrying more than one separator is read, and how a file that separates thousands is read (R3)
  13. Where the administrator's platform settings are stored: a new entity or a column on an existing one (R13)

  Each owning slice MUST decide its question, record the decision in
  `docs/DECISIONS.md`, and amend `docs/domain-model.md` in the same change —
  never silently choose it. Row 12 was added 2026-10-05 with the price column
  and row 13 with the Settings page (ADR-053); the rest of the list is unchanged.
- **Release gate.** Several rules (load test, Dependabot/Renovate, SBOM and
  scan gate, TLS/secret management, staging anonymisation, monitoring) name "the
  first public release" without a slice. The release gate is R12's acceptance:
  a production deployment with staging parity, the load test against the stated
  budgets, the dependency-update process configured, SBOM and vulnerability/SAST
  scans blocking, TLS certificate management and secret injection, and backups
  restored once. R15 (retention) and the R14 audit-log page are release-blocking
  leaves: a slice no other slice depends on still blocks the gate.

