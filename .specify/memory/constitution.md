<!--
SYNC IMPACT REPORT
==================
Version change: 2.5.0 → 2.6.0

Bump rationale: MINOR. No principle is removed or redefined and no binding
rule is dropped, so the MAJOR condition does not trigger. New binding rules
are added to Principle IV and to Principle IX, and one subsection is added to
Design System Standards. Adding binding rules and a section is MINOR under the
versioning policy.

Added rules (four):
  IX. Design System Fidelity — "Existing components first": a new interface
      MUST be composed from the design system's existing components; a new
      Button, Input, Table, or Modal MUST NOT be created when an existing
      component performs that function; a genuinely missing component is
      added to wafar.single.css as part of the same change, never created
      ad hoc inside a feature.
  IX. Design System Fidelity — "State completeness": every interactive
      surface MUST define and render every applicable state (loading, empty,
      error, success, disabled); responsive behaviour and accessibility are
      required by IX and by IV.
  IX. Design System Fidelity — "RTL by construction": every new surface is
      right-to-left by default and follows Principle V; no component may be
      introduced that assumes left-to-right ordering.
  IV. Accessible User Interfaces — every interactive surface MUST expose its
      state (loading, empty, error, success, disabled) to assistive
      technology, not only its success state.

Added sections (one): Design System Standards gains the "Interface State
Matrix" subsection, which makes the required states binding (loading, empty,
error, success, disabled, responsive, accessibility).

Removed sections: none. Principles removed: none. Principles redefined: none.

Unchanged: the ten principles, the fourteen binding sections, Product Scope,
File Processing Overview, Glossary, References, Governance, and the five
Deferred areas. No existing obligation changes how it is discharged.

Migration or backfill plan: none required. The repository has no commits and
no features in flight; every change adds binding rules without changing an
existing obligation.

Automation points: unchanged, and still absent. The repository has no
continuous integration and no test runner; each rule is discharged by review
until the check it names exists.

Follow-up TODOs:
  - The reference files MUST be committed at the repository root before the
    first feature begins: Core-Project.txt, Project-Technologies.txt,
    wafar.single.css, docs/DECISIONS.md, docs/architecture.md.
  - The three template overrides required by Principle I and by Module
    Discipline and Development Workflow now exist at
    .specify/templates/overrides/ (spec-template, plan-template,
    tasks-template) and resolve as the top layer; keep them current with this
    constitution.
  - The exception register exists at .specify/templates/exception-register.md;
    keep it current once the first exception is granted.
  - This report is scratch material for human review of the amendment, not
    governance content, and is expected to be removed before the amended
    constitution file is committed.
-->

# Wafar Platform Constitution

This project turns parts catalogs supplied as PDF, Excel, or Word files into a
structured, searchable catalog for Libyan merchants who currently catalog them
by hand. A merchant registers, opens an account, uploads supplier catalogs, and
browses, searches, and filters the result. A separate administrator operates
the platform. The platform is a catalog: it does not sell, does not buy, and
does not process payment. A registered user's "cart" is a personal bookmark
list, not a purchase.

This constitution governs engineering practice and product boundaries. It
deliberately does not govern the shape of the product's data model, its
extraction behaviour, or its retrieval interface, because those decisions are
not yet made. It does govern how a schema change is made, and how repository
structure is laid out, regardless of those shapes. See Deferred areas.

## Core Principles

### I. Evident, Traceable Change (NON-NEGOTIABLE)

Every change MUST be traceable from requirement to task to commit.

- Every requirement MUST carry a stable identifier.
- Every task that implements a feature MUST reference at least one requirement
  or acceptance criterion, and every requirement MUST have at least one task.
- Every acceptance criterion MUST carry a stable identifier of the form
  `AC-###`, assigned in the specification. An unnumbered acceptance criterion
  cannot be referenced by a task.
- A task reference MUST be carried in the task description, because the task
  format has no field reserved for it. The description ends with the
  identifiers it satisfies — for example, "... in src/auth/session.ts
  (implements FR-004, AC-002)". A reference that exists only in a reviewer's
  memory, or only in a commit message, does not satisfy this rule.
- Work that implements no requirement — a refactor, a dependency or tooling
  change, a security fix, or a spike — MUST be recorded in the plan's
  Complexity Tracking table with its rationale. It MUST NOT be linked to a
  fabricated requirement.
- Every change MUST reference its spec and task identifiers in the commit or
  pull request description.
- A deviation from the agreed specification MUST be recorded as an amendment
  to the specification, never left implicit in the code.
- Every automated test SHOULD be traceable to a requirement, a business rule,
  or a documented defect.

**Rationale:** The consistency and convergence gates can only reason about
artifacts that reference each other. Without identifiers they produce no
findings, and the process degrades into unverified generation. An untracked
change is not made reviewable by inventing a requirement for it; it is made
reviewable by recording it where a reviewer will read it. A task format that
reserves no field for a reference does not remove the obligation; it moves
the obligation into the description text, where a reviewer and a gate can
both read it.

### II. Strict Type Safety

- TypeScript strict mode MUST be enabled in every TypeScript project in this
  repository, together with the index-access, optional-property, override,
  and unused-symbol checks that plain strict mode does not include.
- The `any` type is prohibited in application code. A value whose type is not
  known MUST be typed as `unknown` and narrowed explicitly with type guards.
- Type-suppression directives and double assertions such as
  `as unknown as T` are prohibited in application code. A double assertion
  satisfies a lint rule while destroying the type guarantee the rule exists
  to provide. A suppression or double assertion in test fixtures, code
  generators, and build tooling MUST carry a comment naming the upstream
  defect it works around, and the count of such occurrences MUST NOT grow
  between releases.
- Validation schemas MUST be shared between the frontend and the backend,
  co-located in the designated shared package, so that the two contracts
  cannot drift.

**Rationale:** Strict mode without a ban on `any` is half a guarantee, and a
ban without a ban on double assertions is satisfied in form while producing a
lie. A prohibition with no permitted exception is a prohibition that gets
worked around silently, which is why the exceptions are narrow, named, and
counted. Shared schemas make the frontend and backend agree by construction
rather than by discipline.

### III. Measured Test Coverage

- New and changed production code MUST maintain at least 80% automated test
  coverage, measured as coverage of the changed lines.
- A feature specification MUST request its test tasks explicitly. Task
  generation treats tests as opt-in and reads that request from the
  specification rather than from the plan, so a feature that leaves coverage
  to be inferred yields a task list with no tests, and the coverage rule
  above then has nothing to measure.
- The coverage gate MUST be enforced by continuous integration no later than
  the first feature that introduces the test runner. Until that gate exists
  the requirement is reviewed manually; it is neither waived nor silently
  ignored.
- Unit tests MUST cover business rules, integration tests MUST cover module
  contracts, and end-to-end tests MUST cover user journeys. Generated code,
  migrations, and snapshots are exempt.
- A coverage threshold MUST NOT be satisfied by tests that assert nothing. A
  test that makes no assertion or that asserts only on its own setup MUST NOT
  count toward the threshold.
- A test MUST NOT be skipped, focused, or marked pending in order to make a
  gate pass. A skipped test MUST reference a tracked issue and a review date.

**Rationale:** A percentage with no measurement definition and no enforcement
point is a wish, not a gate.

### IV. Accessible User Interfaces

- All user-facing surfaces MUST meet WCAG 2.2 AA. WCAG 2.1 AA is the floor
  and MUST NOT be treated as the conformance target.
- Every interactive element MUST be reachable and operable by keyboard. No
  interaction may require a dragging movement or a pointer alone.
- A change of state that a sighted user would perceive MUST be announced to
  assistive technology, and focus MUST NOT be left on a removed element.
- Focus indication MUST be provided via `:focus-visible` on every interactive
  element, at the size and colour defined by the design system.
- Touch targets MUST meet the minimum size defined by the design system
  (`--touch-floor`, 44px on mobile).
- Every interactive surface MUST expose its state to assistive technology
  (loading, empty, error, success, disabled), not only its success state.
- Verification MUST include an automated accessibility scan and a manual
  keyboard-only pass.

**Rationale:** Accessibility written as an abstract principle is not
implemented. These are the failure modes that recur most often in practice.

### V. Arabic-First and RTL Interfaces (NON-NEGOTIABLE)

Wafar is an Arabic-language platform for Libyan merchants. Arabic is the only
user-facing language, and the document direction is right-to-left in every
surface.

- All user-facing text MUST be Arabic with a right-to-left-first layout, using
  the document direction attribute and logical CSS properties rather than
  physical left and right properties.
- `<html dir="rtl" lang="ar">` MUST be set on every page, without exception.
- Code identifiers, code comments, and governance documents MUST be English.
  Technical names that do not translate (PDF, Excel, OEM, SKU) MAY appear in
  user-facing text.
- Numerals rendered to the user MUST be Latin (1234567890), not
  Arabic-Indic (٠١٢٣٤٥٦٧٨٩), applied through the designated numeric utility
  with `direction: ltr; unicode-bidi: isolate`.
- Arabic text MUST NOT carry positive `letter-spacing`. Negative tracking is
  permitted only on large headings and only within the design system's scale.
- Search MUST resolve Arabic word roots (طرمبة → طرمبات) through the
  designated Arabic analyzer. A search that matches only surface forms does
  not satisfy this rule.
- Physical direction properties (`margin-left`, `margin-right`,
  `padding-left`, `padding-right`, `left`, `right`) are prohibited in
  application code. Logical equivalents (`margin-inline-start`,
  `margin-inline-end`, `padding-inline`, `inset-inline`,
  `border-inline-end`) are required.

**Rationale:** The audience is Libyan merchants. A broken RTL layout or an
Arabic-Indic numeral in a table is not a cosmetic defect; it is a loss of
trust in the platform, and it is the class of defect that a reviewer who
reads only English will not catch.

### VI. Catalog-Only Scope (NON-NEGOTIABLE)

Wafar is a search-and-display catalog. It does not sell, does not buy, does
not process payment, and does not host direct user-to-user chat.

- Any feature that implements payment, purchase, order placement, request
  for quotation (RFQ), or electronic wallet is prohibited within the current
  scope.
- The "cart" is a personal bookmark list. It MUST NOT carry price,
  quantity, or checkout state. It MUST NOT be described in user-facing text
  as a purchase.
- Messaging is limited to a single conversation thread between a user and
  the administrator. Direct user-to-user messaging is prohibited.
- Sale and purchase are deferred. Enabling them requires an amendment to
  this constitution, as a MAJOR change.

**Rationale:** The product solves one problem — searching supplier catalogs
that are currently searched by hand. Adding commerce expands the legal,
financial, and operational surface before the core problem is validated.

### VII. Specification-First and Documentation Separation (NON-NEGOTIABLE)

Every feature begins with a complete specification that is technology
agnostic, describing what and why before how.

- `spec.md` MUST remain technology agnostic. Frameworks, libraries,
  architectural patterns, and implementation details are prohibited in it.
  User stories, requirements, acceptance criteria, and success criteria
  belong there.
- `plan.md` MUST contain every technical detail: frameworks, libraries,
  architectural patterns, and implementation context.
- A review of `spec.md` MUST confirm the absence of technical detail. A
  technical detail in `spec.md` is a blocking defect, not a stylistic one.
- A deviation from the agreed specification MUST be recorded as an amendment
  to the specification, never left implicit in the code.

**Rationale:** The strict separation keeps business intent reviewable by a
non-implementer, and keeps the specification stable when the technology
changes beneath it.

### VIII. User Story Independence (NON-NEGOTIABLE)

Every user story MUST be independently implementable, testable, and
deliverable as an increment of value.

- Every user story MUST carry a priority (P1, P2, P3, ...).
- Every user story MUST be testable in isolation, without requiring another
  story to be complete.
- Every user story MUST deliver observable value on its own.
- The set of P1 stories MUST constitute a shippable MVP.
- Circular dependencies between stories are prohibited.
- Integration between stories is permitted, but it MUST NOT break the
  testability of any individual story.

**Rationale:** Independence enables incremental delivery, parallel
development, and shipping a partial MVP without waiting for the full scope.

### IX. Design System Fidelity (NON-NEGOTIABLE)

The design system is defined in a single file: `wafar.single.css`. Every
design value in the project comes from that file. Inventing new values is
prohibited.

- **Single source of truth**: `wafar.single.css`, composed of fourteen
  modules.
- **Default mode is dark.** Every page renders in dark mode unless the user
  has explicitly chosen light. The mode toggle sits in the header, adjacent
  to the notifications icon.
- **Primary colour**: `#2563eb` (`--brand-600`). **Accent colour**:
  `#0ea5e9` (`--accent-500`).
- **Type**: Tajawal (Variable, SIL OFL 1.1) for all text. JetBrains Mono for
  technical numerals and part codes.
- **Tables only** for data display. The exceptions are the statistical cards
  on the home page and the quick-actions grid.
- **Sidebar** (`19rem` / `304px`) is fixed and always visible on desktop
  (≥1024px). It does not hide, does not slide. On mobile it becomes a drawer.
- **Header** (`4.25rem` / `68px`): logo on the right, account, notifications,
  and theme-toggle icons on the left.
- **Existing components first**: a new interface MUST be composed from the
  design system's existing components. A new Button, Input, Table, or Modal
  MUST NOT be created when an existing component performs that function. A
  component that is genuinely missing MUST be added to the design system
  (`wafar.single.css`) as part of the same change, never created ad hoc
  inside a feature.
- **State completeness**: every interactive surface MUST define and render
  every applicable state: loading, empty, error, success, and disabled. A
  component that renders only its success state is incomplete. Responsive
  behaviour and accessibility are required by this principle and by
  Principle IV.
- **RTL by construction**: every new surface is right-to-left by default and
  follows Principle V; no component may be introduced that assumes
  left-to-right ordering.
- **Z-index layers**: every layer takes a value from the defined scale.
  Direct use of `z-10`, `z-20`, or `z-50` is prohibited.
- **Motion**: durations are limited to the defined scale (200 / 300 / 400 /
  600 ms). `prefers-reduced-motion` MUST be honoured; the reduction is
  mandatory, not optional.
- **Prohibited without exception**:
  - Raw Tailwind colours (`bg-blue-500`, `text-gray-700`) in application code.
  - Any `#hex` or `rgb()` outside `wafar.single.css`.
  - `ml-`, `mr-`, `pl-`, `pr-`, `left`, `right`.
  - Direct `z-10`, `z-20`, `z-50`.
  - Arabic-Indic numerals (٠١٢٣).
  - Positive `letter-spacing` on Arabic text.
  - Typefaces other than Tajawal, Noto Sans Arabic, or JetBrains Mono.

**Rationale:** The design system is the visual identity of the product. A
drift is not a stylistic preference; it is a break of consistency that makes
maintenance and visual review impossible at scale.

### X. Modular Monolith Architecture

The API is a single deployable server, divided into independent modules.
Each module has one responsibility and no direct call into another module.

- Each module has its own routes, service, and repository.
- Communication between modules goes through the designated shared package,
  never by a direct import from one module to another.
- The modules are: `auth`, `users`, `catalogs`, `parts`, `suppliers`,
  `bookmarks`, `notifications`, `messages`, `support`, `admin`.
- A production source file SHOULD NOT exceed 500 non-empty lines. The binding
  rule is that a module has exactly one responsibility: a long file holding
  one responsibility is acceptable, and a short file holding several is not.
- Business logic MUST NOT be duplicated across modules or layers. Every
  business rule MUST have exactly one owning module, circular imports are
  prohibited, and a general-purpose utility collection MUST NOT be used to
  avoid deciding an owner.

**Rationale:** Modular Monolith combines the deployment simplicity of a
single server with the isolation of separate modules, making a future
extraction into microservices a mechanical refactor rather than a rewrite.

## Product Scope

Wafar is a single product served by three surfaces: the public site, the
merchant's authenticated area, and the administrator's separate application.
The pages below are the complete set required by the current scope. Adding a
page outside this list requires a specification that records the addition
under the plan's Complexity Tracking table.

### Public Site (Guest Accessible)

| Page | Content |
|---|---|
| Home | Platform name, quick search field, four statistical cards (accounts, files, parts, searches). |
| Parts | Search field, filters (part number, brand, car model, catalog file, supplier), a table of parts, pagination (20/50/100), column sorting. Accepts `?file=<id>` to filter by a catalog. |
| Catalog | Table of every uploaded catalog file. |
| Contact | Contact information and a form (name, phone, body) that reaches the administrator. |
| Log In | Email and password. |
| Sign Up | Merchant and shop details. |
| Forgot Password | Password recovery. |
| 404 | Error page. |
| Privacy Policy | Static content. |
| Terms of Use | Static content. |
| FAQ | Frequently asked questions. |

### Merchant's Authenticated Area

| Page | Content |
|---|---|
| My Files | The merchant's uploaded files, upload action, processing status. |
| Cart | Bookmarked parts, remove action. |
| Notifications | Full list, mark as read. |
| Messages | Single conversation thread with the administrator. |
| Profile | Edit account details, change password. |

### Administrator's Application (Separate Login)

| Page | Content |
|---|---|
| Dashboard | Statistics and reports. |
| Users | View, block, edit. |
| Files | Review, delete, reprocess. |
| Suppliers | Manage. |
| Parts | Edit and add manually. |
| Messages | Reply to users. |
| Notifications | Broadcast. |
| Settings | Platform settings. |
| Audit Log | Every administrator operation. |

### Page Flow

The following transitions are required by the product and MUST be supported:

- Home → search → Parts
- Catalog → click a file → Parts (filtered by that file)
- My Files → click a file → Parts (filtered by that file)
- Parts → `+` button → Cart (bookmark added)
- Parts → `?file=<id>` → Parts (filtered by that file)

### Product Features

The following features are in scope for the current MVP. Each MUST be
implemented through a specification that references this list.

| # | Feature | Summary |
|---|---|---|
| 1 | File Upload | Excel, PDF, or Word up to 100 MB. |
| 2 | Automated Extraction | From file tables. |
| 3 | Supplier and Date Extraction | From the first page of the file. |
| 4 | Column Normalisation | Across sources. |
| 5 | Deduplication | By file, by page, by row. |
| 6 | Arabic Search | Root-aware (طرمبة → طرمبات). |
| 7 | Multi-Filter Search | Part number, brand, car model, catalog file, supplier. |
| 8 | Tables | Every data view. |
| 9 | Pagination | 20 / 50 / 100. |
| 10 | Column Sorting | By clicking the header. |
| 11 | Cart | Personal bookmark list. |
| 12 | Notifications | Processing results and administrative messages. |
| 13 | Messaging | Single thread with the administrator. |
| 14 | Admin Application | Full platform management. |
| 15 | Audit Log | Every administrator operation. |
| 16 | Automatic Deletion | After 90 days. |

## File Processing Overview

This section governs the shape of the ingestion pipeline. It does not govern
the extraction algorithm; see Deferred areas for the algorithm's open
questions.

Every uploaded file follows the pipeline below. The pipeline MUST be
implemented as a single sequence; a shortcut that skips a step is a defect.

1. **Upload.** The user submits the file from My Files.
2. **Storage.** The file is stored in object storage, and a content hash is
   computed over its bytes.
3. **Duplicate check.** The hash is compared against hashes of files already
   recorded. A match is reported to the user and the file is not processed
   again.
4. **First-page extraction.** The supplier's company name and the file's issue
   date are read from the first page. A file whose first page yields neither
   value is processed but flagged.
5. **Queue.** A job is enqueued for the worker.
6. **Worker pipeline.**
   - Extract parts from the file's tables.
   - Normalise columns to the catalog's canonical columns.
   - Deduplicate within the file: by file, by page, by row.
   - Index the parts in the search engine.
7. **Status update.** The catalog record's status is updated to `completed`
   or `failed`.
8. **Notification.** The user is notified of the outcome. A failed file
   presents a retry action.

### File Processing Rules

- A file MUST be validated against the file size and content-type rules
  before storage. A file that fails validation MUST NOT be stored.
- A duplicate file MUST be rejected with a message naming the original. The
  duplicate MUST NOT be stored, queued, or processed.
- Processing MUST complete within the budget stated in Performance Budgets
  and Verification.
- A failed file MUST be retryable without re-uploading the bytes.
- The catalog record's status field MUST take exactly one of: `uploaded`,
  `processing`, `completed`, `failed`. Any other value is a defect.

The sections below are binding with the same force as the principles above.
A MUST in them is resolved, reviewed, and excepted by the same procedure.

## Query Safety and Secrets

- All queries MUST use parameterized statements. Building a statement by
  concatenating input is prohibited, including for dynamically built filters.
- The columns available for sorting, filtering, projection, and search MUST
  come from an explicit allowlist mapped to real columns, because sort and
  projection clauses cannot be parameterized.
- Every query MUST have a timeout, and any request-supplied limit MUST have a
  server-side maximum that the client cannot exceed.
- Secrets MUST NOT appear in source, logs, error messages, analytics, or
  client bundles. Secrets MUST come from a secret manager or environment
  injection only, and pre-commit plus CI scanning MUST enforce this.
- Performance budgets MUST be stated numerically in each feature's plan under
  Constitution Mandated Values and in spec Success Criteria. A budget left
  unspecified is a defect.

**Rationale:** Sort and projection parameters are the one place where a query
cannot be parameterized, and therefore the one place where injection survives a
careful review. A blank budget produces a slow product that no gate can catch.

## Schema and Migration Control

This section governs how a schema change is made. It does not govern what the
schema should contain; see Deferred areas.

- Every schema change MUST be expressed as a migration written for the single
  migration tool named under Constitution Mandated Values. A second migration
  mechanism MUST NOT be introduced, and migrations MUST NOT be applied by
  hand.
- Every migration MUST be a single reversible step with both directions
  defined, and MUST NOT combine unrelated schema changes. Two migrations that
  must be deployed together are two changes and MUST be two features or two
  plans.
- A migration MUST NOT run outside the migration runner, and the application
  MUST NOT start when its expected schema version is absent.
- A destructive change — dropping or renaming a column, narrowing a type,
  removing a constraint that existing rows rely on, or adding a uniqueness
  rule over data that already contains duplicates — MUST NOT reach
  production. It MUST be split into an expand step, a backfill whose affected
  row count is verified, and a contract step, deployed across at least two
  releases.
- Every foreign key MUST have an index on the referencing column. Every
  column used to filter, sort, or join MUST have an index once the table
  holds more rows than the volume stated in the plan's Scale/Scope.
- Every table MUST carry an immutable creation timestamp, and every table
  whose rows are user-visible MUST also carry an update timestamp.
- Table and column names MUST be lowercase snake_case and plural, MUST NOT
  collide with a reserved word, and MUST NOT be renamed after first
  deployment. A rename is a new table plus a migration of every reference
  to it.
- Uniqueness, referential integrity, and permitted value ranges MUST be
  expressed as schema constraints rather than only in application code,
  because a constraint is enforced identically in every environment and
  reported through one code path. Business rules MUST NOT be implemented as
  database triggers, generated columns, or stored procedures.
- Every table that holds tenant-owned data MUST carry a tenant identifier as
  a foreign key, and that identifier MUST be part of every index serving a
  tenant-scoped query.
- Every read and write of tenant-owned data MUST be tenant-scoped, and the
  scoping MUST be applied at a single shared entry point rather than repeated
  at each call site. A query path reachable from a merchant session MUST NOT
  be able to return rows belonging to another tenant, and that invariant MUST
  be covered by a test that fails when it is broken.

**Rationale:** A tenant scope that is missing is not a defect, it is a breach,
and a rule repeated at every call site is a rule that will be forgotten at one
of them. Destructive changes are the one schema operation that destroys data
rather than merely inconvenience, so they are the one that gets a rollback that
is actually exercised rather than merely written down.

## Identity, Authentication, and Session Policy

This section governs how a user proves who they are and how that proof is held.
It does not govern what a user is permitted to do; see Authorization and Access
Control for the role matrix, and Deferred areas for the permission-resolution
mechanism that is not yet ratified.

- Authentication MUST be implemented with the designated proven library.
  Custom authentication code is prohibited. The `scim` and `sso` modules of
  that library MUST NOT be enabled, due to the tracked CVEs.
- Passwords MUST be hashed with Argon2id, bcrypt, or scrypt using a cost
  factor recorded under Constitution Mandated Values. Plaintext passwords
  MUST NOT be stored, logged, cached, or included in an error message.
  Verification MUST be a review checklist item at the constitution check
  gate, and automated detection of weak hashing SHOULD exist no later than
  the first release.
- All data in transit MUST use TLS 1.2 or higher, and TLS 1.3 MUST be used
  for the browser-facing surface. Certificates MUST be managed outside
  application configuration. The transport requirement MUST be verified by
  review until a scanner is configured.
- Rate limiting MUST be applied to authentication endpoints and to any
  operation the plan identifies as resource-intensive. Limits MUST be stated
  numerically under Constitution Mandated Values. The enforcement point MUST
  exist no later than the first feature that exposes an authentication
  endpoint.
- CSRF protection MUST be enabled for every state-changing request issued by
  a browser session. The configuration MUST be covered by an automated test
  no later than the first browser-facing feature.
- All user-supplied content MUST be encoded for its output context before it
  is rendered. A framework default MUST NOT be treated as satisfying this
  rule without a test that fails when the encoding is removed, and that test
  MUST exist no later than the first browser-facing feature.
- Session tokens MUST expire, MUST be revocable server-side, and MUST NOT be
  persisted in browser storage in recoverable form. Session timeout and
  token lifetime MUST be stated numerically under Constitution Mandated
  Values. Revocation MUST NOT be deferred to cache expiry alone.
- Security headers MUST be configured: a Content-Security-Policy that does
  not rely on wildcards for script sources, HSTS, X-Content-Type-Options,
  and a frame-ancestors restriction. Their presence MUST be asserted by an
  automated test no later than the first browser-facing feature.

**Rationale:** Authentication defects are cheapest to prevent before the first
request and most expensive to unwind after the first breach. Each rule names a
control a review can actually observe, because a control nobody can check is the
same as no control.

## Authorization and Access Control

- **Guest**: search, browse, filter, and view the catalog. No cart, no
  upload, no messaging. Sees every file and every extracted part.
- **Registered user (Merchant)**: uploads files, deletes files they uploaded,
  uses the cart, messages the administrator, edits their account. Does NOT
  edit or delete parts; only the administrator does.
- **Administrator**: operates a separate admin application with a separate
  login. No one becomes an administrator through the public registration
  flow. Full platform privileges.
- Every administrator operation MUST be recorded in the audit log.
- Once the authorization model is ratified, every request path MUST resolve
  the caller's permissions from that model at a single shared entry point,
  the same one Schema and Migration Control names for tenant scoping. Until
then, the first feature that implements a deferred area MUST record, per
Deferred areas, which rules in this section are still missing and when they
will be ratified.

## Performance Budgets and Verification

Query Safety and Secrets already requires that budgets be stated numerically,
and the Usage Limits table below fixes the product-level budgets. This section
adds what a stated budget is measured against. It does not repeat that
requirement.

- Every feature plan MUST state its performance budget as a latency
  percentile, not a single figure: p50 and p95 for the request path, plus
  the maximum execution time of any individual database query the feature
  introduces. A budget stated only as an average is not a budget. The budget
  belongs under Constitution Mandated Values, and this MUST be a review
  checklist item at the constitution check gate.
- No database query introduced or modified by a feature SHOULD exceed the
  maximum stated above at p95 under the load named in the plan's Scale/Scope.
  An exception MUST name the query, the measured time, and the reason, and
  MUST be recorded in the plan's Complexity Tracking table.
- N+1 query patterns are prohibited. Every data-fetching path introduced by a
  feature MUST be inspected for N+1 behaviour before acceptance, and the
  inspection MUST be recorded in the plan. A framework or datastore that
  makes the inspection impractical MUST be named in the plan together with
  the substitute evidence that satisfies it; the framework's convenience is
  not itself a justification. The query count of a representative request
  SHOULD be asserted by an automated test no later than the first feature
  that introduces a data-fetching path.
- Search results MUST return in under one second.
- Adding to the cart MUST complete in under 200 milliseconds.
- Processing a file (Excel, PDF, or Word, up to 100 MB) MUST complete in
  under five minutes.
- Filters MUST apply without a page reload.
- Pagination MUST offer 20, 50, and 100 rows per page.
- A read whose result changes less frequently than it is read SHOULD be
  cached, with the TTL and the invalidation trigger stated in the plan. A
  cache without a stated invalidation rule MUST NOT be introduced.
- Load testing MUST be performed before the first public release, and its
  results MUST be compared against the stated budgets. It MUST NOT be
  required for an internal release whose plan states its expected load
  instead.
- A measured regression above 10% against the budget of the version the
  feature branched from is a defect and MUST block release until it is
  explained in the plan's Complexity Tracking table and either fixed or
  accepted with a review date.

### Usage Limits

The following limits are binding. A feature MUST enforce each limit
server-side; a client-side check is not sufficient. Changing a limit requires
an amendment to this constitution.

| Limit | Value |
|---|---|
| Maximum file size | 100 MB |
| Typical file size | 1 – 4 MB |
| Large files (rare) | 10 – 15 MB |
| Very large files (exceptional) | up to 20 MB |
| Monthly upload limit per user | 50 files / month |
| Total upload limit per user | 100 files |
| Maximum cart size | 99 parts |
| Automatic file deletion | after 90 days |
| Search latency budget | p95 < 1 s |
| Cart-add latency budget | < 200 ms |
| File processing budget | < 5 min |

**Rationale:** A budget without a percentile and a measurement point is a number
in a document that nothing checks. These rules exist so that performance is
argued with data at acceptance rather than discovered in production.

## Dependency Governance

Project Structure and Debt Control already sets the dependency budget, and
Module Discipline and Development Workflow already requires a license check and
a vulnerability scan for a new runtime dependency. This section adds only the
update-side rules those sections do not cover.

- Dependency versions MUST be pinned, and the lockfile MUST be committed. A
  lockfile MUST be regenerated only by the dependency update process or by an
  explicit plan, never incidentally by a local install.
- The following licences MUST NOT be introduced into a module shipped to a
  merchant: GPL, AGPL, LGPL, SSPL, BUSL, Elastic Licence, and any licence
  whose terms require the disclosure, licensing, or relicensing of a
  merchant's own data or source. The test is the obligation the licence
  imposes, not the label it carries: a licence absent from that list MUST NOT
  be introduced into such a module unless the plan records the obligation it
  imposes and a reviewer has accepted that obligation. The license check
  required by Module Discipline and Development Workflow MUST report the
  licence name and that obligation, not a general approved flag, so the
  reason for a rejection stays visible.
- A dependency with a known critical or high-severity vulnerability MUST NOT
  be added. A dependency already in use with a critical vulnerability MUST
  be updated, replaced, or explicitly excepted within 30 days of the
  advisory, and the date MUST be recorded in the plan's Complexity Tracking
  table.
- An automated dependency update process — Dependabot, Renovate, or
  equivalent — MUST be configured before the first public release. Until it
  exists, the vulnerability scan in continuous integration is the only
  detection point and MUST run on every merge rather than on a schedule.

**Rationale:** The budget stops a project from growing new dependencies and does
nothing about the ones it already has. Update cadence and the license test are
the two ways a dependency base rots without a decision ever being made.

## Module Discipline and Development Workflow

- A production source file SHOULD NOT exceed 500 non-empty lines. The binding
  rule is that a module has exactly one responsibility: a long file holding
  one responsibility is acceptable, and a short file holding several is not.
- Business logic MUST NOT be duplicated across modules or layers. Every
  business rule MUST have exactly one owning module, circular imports are
  prohibited, and a general-purpose utility collection MUST NOT be used to
  avoid deciding an owner.
- Every schema migration MUST include a rollback plan and MUST be backward
  compatible with the currently deployed application version, as required by
  Schema and Migration Control.
- A new runtime dependency MUST be justified by a demonstrated requirement
  recorded in the spec or plan, MUST pass a license check, and MUST pass a
  dependency vulnerability scan.
- Every MUST that names an automated check MUST state the point at which that
  check MUST exist. A MUST whose automation does not yet exist is reviewed
  manually until its stated automation date.
- Every MUST that names a value the plan MUST record names it in one place:
  the plan's Technical Context, under a `Constitution Mandated Values`
  heading. The values are: the single migration tool; the password hashing
  cost factor; the authentication rate limits; the session timeout and token
  lifetime; the dependency budget; the performance budget percentiles and
  the maximum query execution time; and the Recovery Time Objective and
  Recovery Point Objective. A value written in the body of the plan but not
  under that heading does not satisfy the rule that names it, and a plan
  with no such heading has not discharged any of them.
- The consistency gate MUST report no unresolved critical findings before
  implementation begins, and checklist items MUST be reviewed and marked
  before implementation begins.
- When continuous integration is introduced, it MUST run without network
  access by default. Any test requiring the network MUST be explicitly opted
  in, time-bounded, and isolated.
- Agent-generated code MUST satisfy the same gates as human-written code and
  MUST NOT be accepted on the basis of having been generated.

**Rationale:** Each gate exists because its absence produces a class of defect
that is expensive to detect late. Together they are the minimum that stops an
agent-driven workflow from degrading quality silently between reviews.

## Project Structure and Debt Control

- Every directory containing production code MUST have exactly one owning
  feature named in the plan that created it, and MUST NOT be written by two
  features at once. The ownership map MUST be recorded in the plan's Project
  Structure section.
- Import boundaries MUST be enforced mechanically rather than by review
  alone. The enforcement configuration MUST be committed with the codebase. A
  module MUST NOT import from a layer above it or from another feature's
  private directory.
- A presentation layer MUST NOT import a migration, a connection string, or a
  database client, and no module outside the one owning a table MAY access
  that table directly.
- Shared code MUST be promoted out of a feature only after a second consumer
  exists. Code with one consumer MUST live with that consumer.
- The count of direct runtime dependencies MUST stay at or below the budget
  recorded under Constitution Mandated Values. Exceeding the budget MUST be
  recorded in the plan's Complexity Tracking table with the rationale and the
  date by which the budget will be restored.
- An abstraction MUST NOT be introduced before a second concrete use exists,
  except where the plan names the abstraction as a boundary it is creating.
- Dead code MUST be deleted. A flag, comment, or feature toggle that
  permanently bypasses a rule in this constitution is a violation, not a
  workaround.
- Every TODO, FIXME, suppressed warning, skipped test, and known workaround
  MUST reference a tracked issue. An unreferenced marker MUST NOT be merged.
- A known defect or limitation accepted during implementation MUST be
  recorded in the plan's Complexity Tracking table with an owner and a review
  date before the change is accepted.
- A debt item that reaches its review date unresolved MUST be escalated in
  the plan's Complexity Tracking table. Debt MUST NOT be carried silently
  across more than one release.

**Rationale:** Bloat and debt do not arrive as a decision, they arrive as a
series of individually reasonable additions. The only defence that holds is a
rule that forces the cost to be written down at the moment it is incurred, and a
boundary that fails a build instead of relying on a reviewer to notice.

## Documentation

Principle V already requires Arabic user-facing text and English code and
governance text. This section covers the artifacts that make a change reviewable
after the author has moved on.

- Architecture Decision Records MUST be written for every non-trivial
  technical decision, recording the alternatives considered and why the
  chosen one won. A decision whose rationale lives only in a commit message
  or a conversation is not recorded. The record MUST be committed under the
  directory that owns the decision, and the owning feature MUST be named in
  the record.
- The readme MUST document setup, development, testing, and deployment. A new
  contributor MUST be able to run the project locally and run its full test
  suite from the readme alone, without asking a person. This MUST be verified
  by following the readme on a clean checkout before a release.
- Every public interface MUST be documented from the same source as its
  implementation, by generation or by a test that fails when the two diverge.
  Documentation written separately from the code MUST NOT be the only record
  of a public interface. That generation or drift test MUST exist no later
  than the first feature that exposes a public interface.
- Every production module MUST carry a header naming its single
  responsibility. The owning feature is not repeated in that header: Project
  Structure and Debt Control already records it once, in the plan's ownership
  map, and a header that restates it is a second place for the same fact to
  go stale.

**Rationale:** The failure mode is not missing documentation, it is
documentation that drifts from the code while still reading as authoritative.
Each rule ties the document to something that fails when it goes stale.

## Deployment and Observability

- The project MUST have three environments: development, staging, and
  production. Staging MUST run the same application version, the same
  configuration values, and the same migration state as production. Scale is
  the only dimension on which staging is permitted to differ: dataset size,
  instance count, and provisioned throughput MAY be reduced, and no other
  difference is permitted. A configuration value or a migration state present
  in production and absent in staging is a staging-parity defect and MUST be
  recorded in the plan's Complexity Tracking table.
- No change MUST reach production without passing through staging first. A
  production change with no staging run MUST be recorded in the plan's
  Complexity Tracking table with the reason and a review date.
- A migration MUST be applied to staging and its rollback exercised there
  before the migration is needed in production, not merely written down.
- Every deployed service MUST expose a health check that verifies the
  dependencies the service actually uses, and a health check MUST NOT report
  healthy while a required dependency is unreachable.
- Logging MUST be structured, and every request MUST carry a correlation
  identifier through the log records it produces. Logs MUST NOT contain
  secrets, session tokens, or personal data, consistent with Query Safety and
  Secrets.
- Unhandled errors MUST be captured by an error tracker with enough context
  to reproduce them, before the first public release. The tracker MUST NOT be
  fed raw user input that is not already sanitized.
- Backups MUST be automated, encrypted, and restored into a clean environment
  at least once per quarter to verify they restore. A backup that has never
  been restored is untested.
- Every plan MUST state a Recovery Time Objective and a Recovery Point
  Objective numerically under Constitution Mandated Values. A plan that
  introduces persistent storage MUST state them before acceptance; a plan
  that does not is exempt.

**Rationale:** Deployment rules are the only ones with no feedback loop until
something fails, which is why they are written as staging gates and restore
exercises rather than as intentions. The RTO and RPO requirement is what turns
"we would restore" into a number a team can be held to.

## Technology Standards

The full stack is defined in `Project-Technologies.txt`. The binding
selection below is the minimum the project MUST use; any substitution
requires an amendment to this constitution.

- **Repository**: Monorepo (pnpm + Turborepo).
- **Frontend**: Nuxt 4, Vue 3, TypeScript, Tailwind CSS v4, Nuxt UI v4,
  Pinia, TanStack Query.
- **Backend**: Hono (Modular Monolith), OpenAPI.
- **Validation**: Zod, shared between frontend and backend.
- **Database**: PostgreSQL 16+, Drizzle ORM, PgDog.
- **Search**: OpenSearch with the Arabic analyzer and Index Lifecycle
  Management.
- **Files**: SeaweedFS, BullMQ, Redis.
- **Auth**: better-auth (with `scim` and `sso` disabled).
- **Testing**: Vitest, Playwright.
- **Quality**: ESLint, Prettier.
- **Deployment**: VPS (Hetzner or equivalent), Nginx or HAProxy, Docker
  (optional).

## Design System Standards

The full design system is defined in `wafar.single.css` and documented in
`docs/DECISIONS.md`.

- **Dark mode (default)**: background `#0a0a0a`, surface `#121416`, primary
  text `#fafafa`.
- **Light mode (opt-in)**: background `#fafafa`, surface `#ffffff`, primary
  text `#0a0a0a`.
- **Card**: `--radius-card` (1.5rem), `--shadow-card`, border
  `--border-slate-subtle`.
- **Table**: striped rows (`nth-child(even)`), sticky header, hover. Density
  classes: `compact`, `normal`, `comfortable`.
- **Motion**: `--duration-fast` (200ms) for micro-interactions,
  `--duration-base` (300ms) for transitions, `--duration-slow` (400ms) for
  theme toggle.
- **Sidebar**: `--sidebar-width` (19rem / 304px), fixed on desktop, drawer
  on mobile.
- **Header**: `--navbar-height` (4.25rem / 68px).
- **Accessibility**: `:focus-visible` (2px `--brand-500`), touch targets
  ≥44px on mobile, contrast at least AA.

### Interface State Matrix

Every new surface MUST handle each applicable state below. A state that does
not apply MUST be justified in the feature's plan, not silently omitted.

| State | Requirement |
|---|---|
| loading | A visible, non-blocking loading state for any asynchronous data. |
| empty | A meaningful empty state when there is no data to display. |
| error | A user-facing error state with a recovery action where one exists. |
| success | The normal rendered state, verified against the design system. |
| disabled | A disabled state for every control that can be unavailable. |
| responsive | Layout at the design system's breakpoints (sidebar fixed on desktop, drawer on mobile). |
| accessibility | WCAG 2.2 AA, keyboard operable, `:focus-visible`, touch targets ≥ --touch-floor (Principle IV). |

## Glossary

| Term | Definition |
|---|---|
| **Catalog** | An uploaded supplier file, together with its extracted parts, its processing status, and its metadata (supplier name, issue date, upload date, expiry date). A catalog is owned by the merchant who uploaded it. |
| **Part** | A single row extracted from a catalog, representing one car part. Fields: part number, name, brand, car model, description. A part belongs to exactly one catalog. |
| **Supplier** | The company named on the first page of an uploaded catalog, from which the parts originate. A supplier may appear in many catalogs. |
| **Cart** | A merchant's personal bookmark list of parts. It is not a purchase order. It carries no price and no quantity. See Principle VI. |
| **Bookmark** | A single entry in the cart, linking a user to a part. |
| **Notification** | A message delivered to a user in the notification list, either because a processing job completed or failed, or because the administrator sent an administrative message. |
| **Conversation** | The single thread between a merchant and the administrator. A user has at most one conversation. |
| **Audit Log** | The append-only record of every administrator operation. |
| **Processing** | The automated pipeline that turns an uploaded file into extracted, indexed parts. See File Processing Overview. |
| **Deduplication** | The removal of identical parts within the same file (by file, page, row), or the rejection of a file whose content hash matches a file already uploaded. |
| **Arabic Analyzer** | The search-engine component that resolves Arabic word roots and strips stop words. |
| **Guest** | A visitor who has not signed in. See Authorization and Access Control. |
| **Merchant** | A registered user who uploads catalogs. |
| **Administrator** | The operator of the platform, who uses a separate application with a separate login. |
| **Deferred Area** | A decision area explicitly not governed by a principle yet. See Governance. |

## References

| Document | Purpose | Location |
|---|---|---|
| `Project-Technologies.txt` | The complete technology stack. | Repository root. |
| `Core-Project.txt` | The complete product scope, pages, roles, and acceptance criteria. | Repository root. |
| `wafar.single.css` | The complete design system, composed of fourteen modules. | Repository root. |
| `docs/DECISIONS.md` | The record of design decisions and the reasoning behind them. | `docs/`. |
| `docs/architecture.md` | The repository layout, module map, and data-flow descriptions. | `docs/`. |
| `.specify/templates/exception-register.md` | The exception register required by Governance. | `.specify/templates/`. |
| `.specify/templates/overrides/` | Template overrides required by Principle I and by Module Discipline and Development Workflow. | `.specify/templates/overrides/`. |
| `.specify/memory/constitution.md` | This document. | `.specify/memory/`. |

## Governance

**Authority.** This constitution supersedes ad-hoc convention and any other
written project instruction where they conflict. Precedence is: this
constitution, then agent instruction files, then the readme, then any other
guidance. Every principle and every MUST in the sections above is binding
with the same force and is resolved, reviewed, and excepted by exactly the
same procedure: Query Safety and Secrets, Schema and Migration Control,
Identity, Authentication, and Session Policy, Authorization and Access Control,
Performance Budgets and Verification, Dependency Governance, Module Discipline
and Development Workflow, Project Structure and Debt Control, Documentation,
Deployment and Observability, Technology Standards, Design System Standards,
Product Scope, and File Processing Overview. A SHOULD is advisory and MUST NOT
be reported as a critical
finding; an unmet SHOULD MUST still be recorded in the plan's Complexity
Tracking table with its reason.

Binding status is a statement about the cost of a deviation, not about when
its automation exists: a rule that names an automated check the repository
does not yet have remains binding and is reviewed manually until the
milestone it states, as Module Discipline and Development Workflow requires.

Governance's own MUSTs — the amendment procedure, the versioning policy, the
exception register, and the review trigger — bind this document rather than a
feature. A plan cannot comply with or breach them by changing its own
content, so they are not evaluated by a feature's Constitution Check gate.
They are discharged by the amendment process and by the review trigger below,
and an unmet Governance MUST is escalated as an amendment, never recorded as
a plan violation.

The planning phase MUST evaluate its constitution check gate against every
binding rule above other than Governance's own, and MUST record justified
violations in the plan's Complexity Tracking table. The consistency gate
treats a conflict with a binding rule as critical; violations are resolved by
changing the specification, plan, or tasks, never by diluting or
reinterpreting a rule. A rule that must change is amended here first, as a
separate and explicit change.

**Amendment procedure.** An amendment requires a written proposal stating the
rationale, the affected principles, and the impact on features already in
flight. The amendment MUST be explicitly ratified, MUST bump the version per
the policy below, and MUST carry a sync impact report. A MAJOR amendment MUST
additionally include a migration or backfill plan for artifacts produced
under the previous version.

**Versioning policy.** MAJOR for a backward-incompatible governance change or
the removal or redefinition of a principle. MINOR for a new principle or
section, or a material expansion of guidance. PATCH for clarifications,
wording, and non-semantic refinements.

**Compliance review.** Every review MUST verify compliance with these
principles. Every deviation MUST be justified within the change itself, and
MUST be recorded in the plan's Complexity Tracking table when the deviation
belongs to a plan. An unjustified violation MUST be resolved before the
change is accepted. Compliance of in-flight features MUST be re-evaluated
whenever a MAJOR amendment lands.

**Exception register.** Every exception MUST be recorded with the principle,
the exact scope, the rationale, the approver, and a review date. An exception
without a review date is an undocumented violation, not an exception. The
register MUST NOT be satisfied by a comment in code. The register is
maintained at `.specify/templates/exception-register.md`. Unless an amendment
names another, the approver is the repository owner.

**Review trigger.** This constitution MUST be reviewed whenever a project-wide
engineering principle changes, at minimum once per quarter while the project
is in active development, and whenever a new subsystem reaches implementation.

**Deferred areas.** The following aspects are deliberately not governed by
principles specific to them, because those decisions are not yet made. A
deferred aspect remains governed by every principle above that does not name
the deferred decision, in particular by Query Safety and Secrets and by
Schema and Migration Control:

- **Extraction algorithm**: how parts are identified within supplier document
  tables, how columns are matched across sources, and how extraction
  correctness is verified.
- **Catalog data shape**: the fields a part carries beyond those listed in
  the Glossary, and the treatment of supplier-assigned identifiers.
- **File ingestion internals**: the exact rules for content-type validation,
  the object-storage layout, and the isolation between one merchant's files
  and another's.
- **Authorization model**: the granularity of permissions within each role,
  the session policy beyond the rules in Identity, Authentication, and
  Session Policy, and the mechanism by which permissions are resolved.
- **Retrieval interface**: the exact search ranking, the ordering of results
  beyond the sortable columns, and the presentation of parts in the table
  beyond the columns listed in Product Scope.

The first feature that implements a deferred area MUST record, in its plan's
Constitution Check, which principles are still missing for that area and how
they will be ratified. That ratification MUST land no later than the feature's
acceptance, and never after the area is in production. A feature is not
blocked by the absence of those principles, and it MUST NOT invent principles
in place of them or leave the gap unrecorded.

---

**Version**: 2.6.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-01