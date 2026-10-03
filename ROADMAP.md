# Roadmap — Wafar MVP

Wafar turns supplier parts catalogs (Excel, PDF, Word) into one searchable
catalog for Libyan merchants. This roadmap orders the MVP scope that is already
fixed in `.specify/memory/constitution.md` (Product Scope) and `Core-Project.txt`
into independently specifiable slices. It names and orders them; it does **not**
design them — the design happens when each slice runs through its own
`/speckit.specify`.

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
| Approved technology stack | `Project-Technologies.txt` |
| Design system (tokens, components) | `wafar.single.css` |
| Product definition (roles, pages, acceptance criteria) | `Core-Project.txt` |
| Accepted decisions | `docs/DECISIONS.md` (ADR-001 … ADR-016) |

A slice named "Architecture", "Design System", "Tech Stack", or "Conventions"
would be a classification error: it would tell the agent that a project-wide
rule is a piece of work, so later slices re-invent what already exists and the
rules drift. It MUST NOT be created. See `docs/DECISIONS.md` → ADR-007.

**Status legend**: planned · in-progress · done

## Slices

| ID | Sub-feature | Intent | Scope boundary | Depends on | Status | Sub-spec |
|----|-------------|--------|----------------|-----------|--------|----------|
| R1 | Identity and foundation | A merchant signs up, signs in and out, and recovers a password; sessions, password hashing, and auth rate limits follow the constitution's Identity, Authentication, and Session Policy. This slice also creates the repository workspaces and registers the `auth` and `users` modules. | The merchant's account only. The administrator's separate login belongs to R13. Workspace, design-system extension, and delivery duties are listed under "First obligations" below. | — | planned | — |
| R2 | File intake | A merchant uploads an Excel, PDF, or Word catalog; size and content-type are validated before storage; bytes are stored in object storage; a content hash is computed; a duplicate is rejected by hash; the catalog record's status is recorded. | Validation, storage, hash, duplicate check, and status only. Extraction is R3. | R1 | planned | — |
| R3 | Catalog extraction | The worker pipeline: extract parts from the file's tables, read the supplier name and issue date from the first page, normalise columns, deduplicate by file/page/row, index the parts, set status to `completed` or `failed`, and allow retry without re-uploading bytes. | The pipeline only. The parts read surface is R5. Extraction algorithm and catalog data shape are deferred areas. | R2 | planned | — |
| R4 | My Files | The merchant's page for the files they uploaded: the file table, the upload action, the processing status of each file, deleting a file they uploaded, bookmarking an already-present file, and the retry action for a failed file. | The merchant's own files only. Upload validation and storage are R2; extraction is R3. | R2, R3 | planned | — |
| R5 | Parts search | The public Parts page and the Home page: Arabic root-aware search, filters (part number, brand, car model, catalog file, supplier), a parts table with column sorting, pagination 20/50/100, `?file=<id>` filtering, within the p95 < 1 s budget. Home carries the platform name, the quick search field, and the four statistical cards. | Reading and filtering only. Search ranking beyond the sortable columns is a deferred area. | R3 | planned | — |
| R6 | Catalog files page | The public Catalog page: a table of every uploaded catalog file; a row links to R5 filtered by that file. | Read-only listing. Management actions live in R13. The table lists the supplier named on the first page, extracted by R3. | R2, R3 | planned | — |
| R7 | Profile | A registered user edits account details and changes the password. | The caller's own account only. Account deletion is not permitted. | R1 | planned | — |
| R8 | Cart (bookmarks) | A registered user adds and removes a part in a personal bookmark list, maximum 99 parts, add completing in under 200 ms; the `+` control becomes a red cart icon once saved. | A bookmark list only: no price, no quantity, no checkout (Principle VI). | R5 | planned | — |
| R9 | Notifications | A notification list with a counter and a mark-as-read action, generated by processing outcomes and by administrator messages. | Delivery to the in-app notification list only. Notification retention is decided here and recorded as an ADR. | R3 | planned | — |
| R10 | Messaging | One conversation thread between a merchant and the administrator; the merchant sees a reply after refresh; a notification is delivered on reply. | Merchant to administrator only. User-to-user chat is prohibited (Principle VI). | R1 | planned | — |
| R11 | Support surfaces | Contact form (name, phone, body) that reaches the administrator, plus the FAQ, privacy policy, terms of use, and 404 pages. | Static content and the contact form only. The path by which a contact message reaches the administrator is decided here and recorded as an ADR. | — | planned | — |
| R12 | Delivery and operations | Three environments with staging parity, health checks that verify the dependencies each service uses, the error tracker, secret management with pre-commit and CI scanning, TLS certificate management, the log pipeline, the dependency update process, and the pre-release load test. | Running the platform, not building product behaviour. | R1, R2, R3 | planned | — |
| R13 | Admin application | The administrator's separate application with its own login: dashboard, users, files, suppliers, parts, messages, notifications, settings. Every administrator operation is recorded as it happens. | The administrator's surface. The audit log's read surface is R14; authorization granularity is a deferred area. | R1, R2, R3, R5, R9, R10, R11 | planned | — |
| R14 | Audit log | The administrator-facing page over the append-only record every administrator operation writes. | Reading only. The recording is part of R13. | R13 | planned | — |
| R15 | Retention | Automatic deletion of a catalog 90 days after upload, with the search index lifecycle aligned to the same window. | The deletion job and the index lifecycle only. | R3 | planned | — |

## First obligations

The constitution assigns several duties to "the first slice" that introduces
something. Those assignments are resolved here so that no duty is left without
an owner.

| Duty | Owning slice | Constitution reference |
|---|---|---|
| The workspace, `packages/config`, and the shared tooling | R1 | Technology Standards → repository topology; `docs/architecture.md` |
| The test runner and the continuous-integration provider that enforces the 80% coverage gate | R1 | Principle III; Register gaps |
| Backup and restore tooling, and the RTO/RPO numbers | R1 | Deployment and Observability (R1 introduces persistent storage) |
| The application shell: header, sidebar, drawer, theme toggle, icon set, fonts, and the framework bridge | R1 | Principle IX; Design System Standards |
| CSRF, output-encoding, and security-header tests | R1 | Identity, Authentication, and Session Policy (first browser-facing feature) |
| The resolution of the sidebar conflict | R1 | Product Register → unresolved facts (first surface that lays out a page) |
| Setup, testing, and deployment documentation | R1 | Documentation (first feature that creates the workspace) |
| Staging parity, error tracker, secret management, TLS, log pipeline, dependency update process, load test | R12 | Register gaps ("the first deploying slice") |
| The documentation-drift test for the first public interface, and the first N+1 query-count assertion | R2 | Documentation; Performance Budgets and Verification |

## Defects in the slice order, and the slice that closes each

These were found by auditing the thirteen-slice order this file previously
carried. Each names the slice that closes it.

| # | Defect | Closed by |
|---|--------|-----------|
| 1 | The My Files page had no owning slice; the file-intake slice's scope boundary excluded it | R4 |
| 2 | Six register gaps were assigned to "the first deploying slice" or "the first slice that introduces the test runner", which no slice satisfied | R1 (test runner, backup tooling) · R12 (the rest) |
| 3 | The sidebar conflict was assigned to "the first surface that lays out a page", which no slice satisfied | R1 |
| 4 | The administrator slice did not depend on the extraction slice whose output it administers | R13 |
| 5 | The administrator slice shipped operations before the audit log existed, though every administrator operation must be recorded | R13 records each operation; R14 is the read surface |
| 6 | The contact form reaches the administrator, but no administrator page receives it | R11 decides; a new page is an amendment |
| 7 | The application shell had no owner, so every browser-facing slice would rebuild it | R1 |
| 8 | The sub-spec `Input` convention was stated in two different forms, and the binding template carried neither | Fixed 2026-10-03 in `.specify/templates/overrides/spec-template.md` |
| 9 | The icon set was assigned to the parts-search slice, but the shell needs it first | R1 |
| 10 | The Sync Impact Report was committed into the constitution | Fixed 2026-10-03 |
| 11 | The product mirror listed five catalog status values, and pre-empted two facts the constitution assigns to R9 and R15 | Fixed 2026-10-03 in `Core-Project.txt` |
| 12 | The product mirror carried an unreferenced TODO for a budget the constitution had already fixed | Fixed 2026-10-03 in `Core-Project.txt` |
| 13 | The binding specification template did not carry the sub-spec `Input` line the constitution requires | Fixed 2026-10-03 |

## Notes

- **Home page.** The Home page (platform name, quick search field, four
  statistical cards) needs no slice of its own: its search field is R5 and its
  counters depend on R1, R2, R3, and R5. R5 also owns the four-cards question,
  and the product register's four cards (accounts, files, parts, searches)
  stand; R5's plan records the choice in `docs/DECISIONS.md`.
- **Independent verification.** Each slice is independently testable: R1 alone
  yields a working account on a working shell, R2 alone yields an accepted and
  stored file, R5 alone yields a searchable parts table.
- **Deferred areas.** R3, R5, and R13 are the first slices to implement the
  deferred areas (extraction algorithm; catalog data shape; file ingestion
  internals; retrieval interface; authorization model). Per the constitution's
  Governance section, each MUST record in its plan's Constitution Check which
  rules are still missing and how they will be ratified, no later than that
  slice's acceptance.
