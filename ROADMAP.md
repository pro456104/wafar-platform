# Roadmap — Wafar MVP

Wafar turns supplier parts catalogs (Excel, PDF, Word) into one searchable
catalog for Libyan merchants. This roadmap orders the MVP scope that is already
fixed in `.specify/memory/constitution.md` (Product Scope) and `Core-Project.txt`
into independently specifiable slices. It names and orders them; it does **not**
design them — the design happens when each slice runs through its own
`/speckit.specify`.

**Constitution**: `.specify/memory/constitution.md` (current version: its footer
or `.specify/memory/version.json`). On any conflict with this file, the
constitution wins.

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
| Accepted decisions | `docs/DECISIONS.md` (ADR-001 … ADR-079) |

A slice named "Architecture", "Design System", "Tech Stack", or "Conventions"
would be a classification error: it would tell the agent that a project-wide
rule is a piece of work, so later slices re-invent what already exists and the
rules drift. It MUST NOT be created. See `docs/DECISIONS.md` → ADR-007.

**Status legend**: planned · in-progress · done

## Slices

| ID | Sub-feature | Intent | Scope boundary | Depends on | Status | Sub-spec |
|----|-------------|--------|----------------|-----------|--------|----------|
| R1 | Identity and foundation | A merchant signs up (OTP-verified Libyan mobile number on +218, with no dial-code selector per ADR-041, password, city, optional shop name per ADR-030), signs in and out, and recovers a password via SMS OTP; sessions, password hashing, and auth rate limits follow the constitution's Identity, Authentication, and Session Policy, and the Libyan city list is fixed here. This slice also creates the repository workspaces and registers the `auth` and `users` modules; the account's `status` value and the `auth` module's `Session` entity are fixed by ADR-067, so this slice implements them rather than deciding them. | The merchant's account only. The administrator's separate login belongs to R13. Workspace, design-system extension, and delivery duties are listed under "First obligations" below. | — | planned | — |
| R2 | File intake | A merchant uploads an Excel, PDF, or Word catalog; size and content-type are validated before storage; bytes are stored in object storage; a content hash is computed; a duplicate is rejected by hash; the catalog record's status is recorded; the per-user upload quotas are enforced server-side (50 files per calendar month, 100 files in total); the catalog's stored byte count and content type are decided here (open fact #9). This slice also creates the `catalogs` module, which owns the uploaded file, its metadata, and its status; R4 extends that module's service with the delete cascade rather than creating it. | Validation, storage, hash, duplicate check, status, and upload quota only. Content safety (magic-byte validation, ClamAV scan, decoded-size cap, macro stripping) runs at intake; extraction is R3. | R1 | planned | — |
| R3 | Catalog extraction | The worker pipeline: extract parts from the file's tables, read the supplier name and issue date from the first page, normalise columns, deduplicate by file/page/row, index the parts, set status to `completed` or `failed`, and allow retry without re-uploading bytes. This slice also creates the `suppliers` module when the first-page extraction names the supplier, stores the supplier name in its normalised form, assigns every extracted value to one of the six canonical columns (including values separated out of a merged or overlapping source column), extracts no description, leaves a price printed in another currency without a stored price (which reads «بدون سعر»), and stores no column the constitution's Glossary does not fix. This slice also creates the `parts` module, which owns the extracted rows and their schema. | The pipeline and the `parts` module only. Reading and searching parts is R5. The extraction algorithm remains a deferred area ratified in this slice's plan; the canonical columns themselves are fixed by the constitution (ADR-040). Open facts #10 (a part's page and row of origin) and #12 (a multi-separator printed price) are decided here. | R2 | planned | — |
| R4 | My Files | The merchant's page for the files they uploaded: the file table, the upload action, the processing status of each file, deleting a file they uploaded, and the retry action for a failed file. Each file row carries the open control of the constitution-required "My Files → Parts (filtered by that file)" transition, wired in R5. The catalog-delete cascade is implemented here in the `catalogs` module service R2 creates: parts and search-index withdrawal now, bookmark withdrawal added by R8 at the same trigger; R13's admin delete and R15's retention job reuse the same routine rather than reimplementing it. This slice also adds the sticky table header the design system does not yet provide, because My Files carries the first table the product renders. | The merchant's own files only. Upload validation and storage are R2; extraction is R3. | R1, R2, R3 | planned | — |
| R5 | Parts search | The public Parts page and the Home page: Arabic root-aware search over part number and original number by partial match, multi-select filters over car model, type, catalog file, and supplier (no selection meaning every value of that filter), a price range filter, a parts table showing every column at all times — part number, name, car model, original number, type, price, the supplier's name, and the cart control — with the price rendered as a decimal point and three decimal places and «بدون سعر» where a catalog prints none, every column sortable except `type`, pagination 20/50/100, and `?file=<id>` filtering, within the p95 < 1 s budget. The price column and its filter and sort are for a registered merchant only: a guest receives the same table through a projection that has no price (ADR-040). Home carries the platform name, the quick search field, and the four statistical cards. R5 also wires the file-row open control from My Files (R4) to `?file=<id>` filtering, and records the "searches" counter decision as an ADR, amending the Product Register in the same change if a new entity is required. The public table's design components (pagination, sort indicator, filter bar, the multi-select control, and the price-range control — the sticky header is R4's, whose table is the first the product renders) come from `wafar.single.css`, and this slice adds the ones the file does not yet provide. | Reading and filtering only. Search ranking beyond the sortable columns is a deferred area. | R1, R2, R3, R4 | planned | — |
| R6 | Catalog files page | The public Catalog page: a table of every uploaded catalog file; a row links to R5 filtered by that file. | Read-only listing. Management actions live in R13. The table lists the supplier named on the first page, extracted by R3. | R1, R2, R3, R5 | planned | — |
| R7 | Profile | A registered user edits the non-identifier account details (city, optional shop name) and changes the password. The mobile number is the identifier and is not editable here; the account carries no delete control. | The caller's own account only. The mobile number is not editable, and account deletion is not permitted. | R1 | planned | — |
| R8 | Cart (bookmarks) | A registered user adds and removes a part in a personal bookmark list, maximum 99 parts, add completing within the p95 < 200 ms budget; the `+` control becomes a red cart icon once saved. This slice also creates the `bookmarks` module. When a catalog is deleted, the bookmarks pointing at its parts are withdrawn through the same catalog-delete trigger R4 implements. | A bookmark list only: no price, no quantity, no checkout (Principle VI). | R1, R4, R5 | planned | — |
| R9 | Notifications | A notification list with a counter and a mark-as-read action, generated by processing outcomes, by administrator messages, and by an administrator's reply to a merchant message (Glossary → Notification, ADR-046). This slice also creates the `notifications` module. The header's notification bell with its counter is a design component `wafar.single.css` does not yet provide, and this slice adds it. | Delivery to the in-app notification list only; administrator messages and replies become a source once R13 exists. Notification retention is decided here and recorded as an ADR. | R1, R3 | planned | — |
| R10 | Messaging | One conversation thread between a merchant and the administrator; the merchant sees a reply after refresh; a notification is delivered on reply. This slice also creates the `messages` module. The reply itself is authored through the administrator's surface (R13); before R13 lands, acceptance of this slice verifies the reply path via the admin API directly. | Merchant to administrator only. User-to-user chat is prohibited (Principle VI). `Conversation`'s administrator reference and the message sender's representation are decided here (open facts #1 and #2). | R1, R9 | planned | — |
| R11 | Support surfaces | Contact form (name, phone, body) that reaches the administrator through the "Contact messages" admin page (ADR-028), plus the FAQ, privacy policy, terms of use, and 404 pages. This slice also creates the `support` module, with the contact form protected by a honeypot field, a minimum time-to-submit, and a per-client rate limit. The Contact page renders the contact details `PlatformSetting` holds (Product Scope → Contact; ADR-072), so this slice also creates that entity — its schema and its public read projection, created inside the `admin` module's directory (the read surface only), seeded with a default — because it is the first surface that reads it; `admin` remains its owning module and R13 extends that same module with the administrator's Settings write surface (ADR-077). | Static content, the contact form, and the Contact page's read of `PlatformSetting` only. The administrator read surface and the Settings write surface are R13. A contact message's status and administrator note are decided here (open fact #11). | R1 | planned | — |
| R12 | Delivery and operations | Three environments with staging parity, health checks that verify the dependencies each service uses, the error tracker, secret management with pre-commit and CI scanning, TLS certificate management, the log pipeline, the dependency update process, and the pre-release load test, plus staging data anonymisation and the monitoring and alerting set. | Running the platform, not building product behaviour. | R1, R2, R3, R5 | planned | — |
| R13 | Admin application | The administrator's separate application with its own login: dashboard, users, files, suppliers, parts, messages, notifications, settings, contact messages. Every administrator operation is recorded as it happens. | The administrator's surface. The audit log's read surface is R14; authorization granularity is a deferred area. The admin file-delete reuses the catalog-delete cascade owned by R4. The administrator is a `User` holding the administrator role (fixed by ADR-067), so this slice implements it rather than deciding it; the Settings page reads and writes `PlatformSetting`, whose entity R11 already created for the Contact page's read, so this slice adds the administrator write surface over it. This slice also extends the `admin` module R11 created for the `PlatformSetting` read, adding the administrator's write surface and the remaining administrator operations (ADR-077). | R1, R2, R3, R4, R5, R9, R10, R11 | planned | — |
| R14 | Audit log | The administrator-facing page over the append-only record every administrator operation writes. | Reading only. The recording is part of R13. | R13 | planned | — |
| R15 | Retention | Automatic deletion of a catalog after 90 days, with the search index lifecycle aligned to the same window. The retention job reuses the catalog-delete cascade owned by R4 rather than duplicating it. | The deletion job and the index lifecycle only; the delete cascades to the catalog's parts, bookmarks, and index entries. `expires_at` semantics are decided here, and so is the point the 90 days are counted from (open fact #3); no source states a trigger, and this slice is what decides it. | R3, R4, R8 | planned | — |

## First obligations

The constitution assigns several duties to "the first slice" that introduces
something. Those assignments are resolved here so that no duty is left without
an owner.

| Duty | Owning slice | Constitution reference |
|---|---|---|
| The workspace, `packages/config`, and the shared tooling | R1 | Technology Standards → repository topology; `docs/architecture.md` |
| The eight API modules R1 does not create, each with its `apps/api/src/modules/<module>/` directory: `catalogs` (R2), `parts` and `suppliers` (R3), `bookmarks` (R8), `notifications` (R9), `messages` (R10), `support` (R11), and `admin` (R11 creates its `PlatformSetting` read surface; R13 extends it) | R2, R3, R8, R9, R10, R11, R13 | Principle X (the module list); Technology Standards → Internal layout; Project Structure and Debt Control (one owning feature per directory) |
| The `packages/db/schema/<module>.ts` file each module first writes — R1 writes `users.ts` and `auth.ts`, R2 `catalogs.ts`, R3 `parts.ts` and `suppliers.ts`, R8 `bookmarks.ts`, R9 `notifications.ts`, R10 `messages.ts`, R11 `support.ts` and `admin.ts`, and R13 extends the `admin` module — with the overlaps named: `packages/db/schema/admin.ts` and the `admin` module's read surface are created by R11 for `PlatformSetting`, while R13 extends the same module with the administrator's write surface (ADR-077), and R4 extends the `catalogs` module R2 creates | R1, R2, R3, R8, R9, R10, R11, R13 | Technology Standards → Internal layout (Database ownership); Schema and Migration Control |
| The test runner and the continuous-integration provider that enforces the 80% coverage gate | R1 | Principle III; Register gaps |
| The transactional SMS provider for OTP sign-up verification and password reset (replaces the previous transactional-email gap) | R1 | Technology Standards → Register gaps (ADR-030) |
| Provisioning of PostgreSQL, Redis, SeaweedFS, and OpenSearch for development | R1 | Technology Standards |
| PgDog deployment with named fallback (PgBouncer) and review date (2027-04-06) | R1 | Technology Standards (PgDog is pre-1.0 and MUST name a fallback and a review date) |
| Enabling Dependabot/Renovate so the update process exists from the first merge; the full dependency-update policy is R12's | R1 (enablement), R12 (policy) | Dependency Governance (before the first public release) |
| Backup and restore tooling, and the RTO/RPO numbers | R1 | Deployment and Observability (R1 introduces persistent storage) |
| The application shell — header, sidebar (full width or an icon rail on desktop, drawer on mobile), drawer, theme toggle, icon set (an open-source set under a permissive licence, self-hosted SVG, no emoji, per ADR-042), fonts, and the framework bridge — scoped to public pages and the merchant area, never on auth/404/static pages; resolved sidebar logo/header placement per ADR-017; icon set and theme toggle per ADR-016 | R1 | Principle IX; Design System Standards; ADR-016, ADR-017 |
| The sidebar icon rail's width token, added to `wafar.single.css` and consumed by the shell's desktop collapsed state; the width itself is R1's to choose | R1 | Design System Standards → Decision values (Sidebar): the rail token is reserved for the first slice that needs it (ADR-039) |
| The link surface that reaches the four bare-layout static pages (Contact, Privacy Policy, Terms of Use, FAQ), chosen and recorded as an ADR; the reachability requirement itself is binding whichever surface R1 picks | R1 | Product Fact Clarifications (the shell's per-page reachability; ADR-053) |
| The sticky table header the design system does not yet provide, added to `wafar.single.css` and used by the first table the product renders (My Files, R4) | R4 | Design System Standards → Decision values (Table) and the missing-components list; Principle IX; ADR-039; ADR-074 |
| The Parts table's remaining design components the system does not yet provide — pagination, the column sort indicator, the filters toolbar, the multi-select control, and the price-range control — added to `wafar.single.css` and used by the Parts page | R5 | Design System Standards → Components the product requires and the design system does not yet provide; Principle IX; ADR-060 |
| The upload-with-progress component and the confirmation overlay (the Modal Principle IX names) the file-delete action needs, added to `wafar.single.css` | R4 | Design System Standards → Components the product requires and the design system does not yet provide; Principle IX |
| The cart add/remove toggle and the toast surface the full-cart notice uses, added to `wafar.single.css` | R8 | Design System Standards → Components the product requires and the design system does not yet provide; Product Fact Clarifications (the 99-part notice); Principle IX |
| The message-thread surface, added to `wafar.single.css` | R10 | Design System Standards → Components the product requires and the design system does not yet provide; Principle IX |
| The notification bell with its counter, added to `wafar.single.css` and used by the shell header when the notification list lands | R9 | Design System Standards → Components the product requires and the design system does not yet provide; Principle IX |
| The `PlatformSetting` entity the Contact page reads — its schema and public read projection, created inside the `admin` module's directory (the read surface only), seeded with a default — created by the first surface that reads it; `admin` remains the owning module and R13 extends that module with the administrator's Settings write surface | R11 | Product Scope → Contact; Product Register → Data entities (`PlatformSetting`); ADR-067; ADR-072; ADR-077 |
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
| OpenSearch client library: choice recorded in the plan's Complexity Tracking table with an ADR (R3 indexes the parts, so R3 is the first slice to need it and makes the choice; R5, which searches, consumes it) | R3 | Technology Standards → Register gaps |
| Arabic analyzer configuration and verification: choice recorded in the plan's Complexity Tracking table with an ADR | R5 | Technology Standards → Register gaps |
| SBOM generator: the tool that produces the per-build SBOM, recorded with an ADR (the scans themselves are already registered) | R1 | Technology Standards → Register gaps; Deployment and Observability (supply-chain controls) |
| Load-test tool: the tool that performs the pre-release load test, recorded with an ADR | R12 | Technology Standards → Register gaps; Performance Budgets and Verification |
| A committed read-only governance drift check that verifies the constitution's version footer against `.specify/memory/version.json`, every live `ADR-001 … ADR-0NN` range string, the ADR list in `Project-Technologies.txt`'s header, the upstream manifest hashes, the two integrations' byte-identity (their command directories and their two integration manifests), the design system's token register against `wafar.single.css`, and the structural counts the governance text states in prose | R1 — **delivered 2026-10-08 by ADR-071** (`governance-drift-check.mjs`); R1 only wires it into CI | Governance (version sources, amendment procedure); Documentation (records that drift after the author moves on); ADR-061 |
| The same check names no external tool: it runs from the repository and adds no dependency, and a slice that wants one records the choice with an ADR | R1 | Technology Standards → Register gaps (naming a library before its ADR is prohibited) |

## Defects in the slice order, and the slice that closes each

These were found by auditing the thirteen-slice order this file previously
carried. Each names the slice that closes it.

| # | Defect | Closed by |
|---|--------|-----------|
| 1 | The My Files page had no owning slice; the file-intake slice's scope boundary excluded it | R4 |
| 2 | Six register gaps were assigned to "the first deploying slice" or "the first slice that introduces the test runner", which no slice satisfied | R1 (test runner, CI, accessibility checker, icon set, backup tooling) · R2 (content-type validation) · R3 (extraction libraries, Redis client library, OpenSearch client library) · R5 (Arabic analyzer) · R12 (the rest: deploying slice) |
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
| 16 | Three product conflicts were invisible because nobody compared the copies: how a message's sender is represented, whether a conversation carries an administrator reference, and whether an administrator is a distinct entity | Recorded as unresolved product facts; the administrator question is closed by ADR-067 (a role on `User`); R10 owns the two sender/reference questions |

## Notes

- **Administrator representation.** The administrator is a role on `User`,
  fixed by ADR-067 on 2026-10-07. The question is closed, not deferred, so no
  slice decides it: R1's seeded CLI creates that account, and R13 implements the
  administrator's separate application over the same role. The register, the
  model, and R1's seed already carry the answer. (ADR-074 corrected this note,
  which still assigned the question to R13 after ADR-067 had answered it.)
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
- **Requirement identifiers.** `FR-###` and `AC-###` are assigned per
  specification during `/speckit.specify` (see
  `.specify/templates/overrides/spec-template.md`); this roadmap orders and
  bounds slices but assigns no requirement identifiers.
- **Structure registers.** R1 creates the workspace; it MUST follow the fixed
  locations in the constitution (current version: its footer) and `docs/architecture.md`, including
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
  glance. Rows 1–4 are also binding in the constitution's Product Register
  (Unresolved product facts), and row 12 joined them there on 2026-10-05 with
  the price column; rows 9–11 are open field-level facts carried by the model
  alone — the mirror carries the concepts, never field identifiers:
  1. Sender representation on a message (R10)
  2. `Conversation`'s administrator reference (R10)
  3. `expires_at`: retention deadline or supplier's printed expiry, and the point the 90 days are counted from (R15)
  4. Notification retention (R9)
  5. ~~Contact message: conversation or its own inbox~~ — resolved 2026-10-03 by ADR-028: a dedicated Contact messages page owned by R13
  6. ~~Administrator: distinct entity or a role on `User`~~ — resolved 2026-10-07 by ADR-067: a role on `User`
  7. ~~The account's status value, and blocked-merchant as state or flag~~ — resolved 2026-10-07 by ADR-067: `User.status` is `active` or `blocked`
  8. ~~Whether the `auth` module owns any stored entity~~ — resolved 2026-10-07 by ADR-067: `auth` owns `Session`
  9. The catalog's stored byte count and content type (R2)
  10. A part's page and row of origin (R3)
  11. A contact message's status and administrator note (R11)
  12. How a printed price carrying more than one separator is read, and how a file that separates thousands is read (R3)
  13. ~~Where the administrator's platform settings are stored~~ — resolved 2026-10-07 by ADR-067: `PlatformSetting`, owned by `admin`

  Each owning slice MUST decide its question, record the decision in
  `docs/DECISIONS.md`, and amend `docs/domain-model.md` in the same change —
  never silently choose it. Row 12 was added 2026-10-05 with the price column;
  rows 6, 7, 8, and 13 were resolved 2026-10-07 by ADR-067.
- **Release gate.** Several rules (load test, Dependabot/Renovate, SBOM and
  scan gate, TLS/secret management, staging anonymisation, monitoring) name "the
  first public release" without a slice. The release gate is R12's acceptance:
  a production deployment with staging parity, the load test against the stated
  budgets, the dependency-update process configured, SBOM and vulnerability/SAST
  scans blocking, TLS certificate management and secret injection, and backups
  restored once. R15 (retention) and the R14 audit-log page are release-blocking
  leaves: a slice no other slice depends on still blocks the gate. R12's
  `Depends on` column lists only the slices it builds on — the gate itself is
  broader than the import graph and covers every slice.

