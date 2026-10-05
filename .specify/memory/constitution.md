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
not yet made. It does govern which entities exist, which module owns each, and
which product rules bind across them (Product Register → Data entities); it does
not govern their columns, types, or constraints. It also governs how a schema
change is made, and how repository structure is laid out, regardless of those
shapes. See Deferred areas.

**Contents.**

- Core Principles
- Product Scope
- Product Register
- File Processing Overview
- Single-Reference Sufficiency
- Query Safety and Secrets
- Schema and Migration Control
- Identity, Authentication, and Session Policy
- Authorization and Access Control
- Performance Budgets and Verification
- Dependency Governance
- Module Discipline and Development Workflow
- Project Structure and Debt Control
- Documentation
- Deployment and Observability
- Technology Standards
- Design System Standards
- Glossary
- References
- Artifact Workflow and Traceability
- Product Fact Clarifications
- Governance

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
  user-facing text. Three exceptions are named here so that the rule is read
  with them rather than against them: `wafar.single.css` carries its explanatory
  comments in Arabic, and the two mirrors `Core-Project.txt` and
  `Project-Technologies.txt` are Arabic documents. Their identifiers, tokens,
  rules, and structure are English; the prose a reader reads is Arabic. An
  Arabic string quoted as the subject of a rule — an Arabic-Indic numeral, an
  Arabic search example — is an illustration of that rule, not a violation of
  it.
- Numerals rendered to the user MUST be Latin (1234567890), not
  Arabic-Indic (٠١٢٣٤٥٦٧٨٩), applied through the designated numeric utility
  with `direction: ltr; unicode-bidi: isolate`.
- Emoji MUST NOT appear in any text a person reads inside the platform: a page
  title, a button label, a table cell, an empty-state description, a
  notification body, a message body, a screen in the administrator application,
  and the body of an SMS the platform sends. An icon MUST be an SVG from the
  approved icon source (Technology Standards -> Register gaps); an emoji glyph
  is not an icon and MUST NOT stand in for one. The ban covers every surface a
  user or an administrator reads and nothing else: governance documents, code
  identifiers, and code comments are outside it.
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
- **Displayed price.** A part carries the price printed in its own source
  catalog, so a merchant can see what each supplier charges. It is a catalog
  attribute, not an offer: it carries no quantity, no discount, no currency
  conversion, and no checkout state, and the cart renders none of it. A
  merchant never edits a price; only the administrator does. The price is
  visible to a registered merchant and MUST NOT reach a guest through any
  surface, response, index projection, or export: a guest's read path projects
  the part through its own allowlist without the price column, which is a
  different projection and not a hidden column (Query Safety and Secrets). A
  price is sortable and filterable like any other column, for a registered
  merchant only. It is rendered with a decimal point and exactly three decimal
  places, the dinar's own subdivision, and with no thousands separator, so ten
  dinar reads `10.000` (and fifteen dinar reads `15.000`); the denomination is
  named once in the column header
  rather than repeated in every cell. A part whose catalog prints no price reads
  «بدون سعر» rather than a blank or a zero, and the price filter accepts a
  minimum and a maximum.
- Messaging is limited to a single conversation thread between a user and
  the administrator. Direct user-to-user messaging is prohibited.
- Sale and purchase are deferred. Enabling them requires an amendment to
  this constitution, as a MAJOR change.
- **Cart page name.** The cart's user-facing Arabic name is «سلة المشتريات».
  Despite the purchase-sounding label it is a personal bookmark list only: it
  carries no price, no quantity, and no checkout state (Principle VI).
- **Reports scope.** "Reports" are limited to the statistics and summaries
  the administrator Dashboard shows over entities already in this scope.
  Advanced reporting is out of scope and MUST NOT be built without a
  specification that records the addition.

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
- Deviations from the agreed specification MUST be handled as Principle I
  requires: recorded as an amendment to the specification, never left
  implicit in the code.

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
  technical numerals and part codes. Noto Sans Arabic is permitted only as the
  fallback in the font stack declared by `wafar.single.css`.
- **Tables only** for data display. The exceptions are the statistical cards
  on the home page.
- **Shell scope**: the application shell (header plus sidebar) renders on the
  public pages and the authenticated merchant area. The authentication pages
  (sign-in, sign-up, forgot-password), the 404 page, and the static
  policy/FAQ/contact pages use a bare layout with no header and no sidebar.
  The administrator application carries its own independent shell.
- **Sidebar** (`19rem` / `304px`) is visible on desktop (≥1024px) at all times.
  It does not hide and it does not slide off-screen. The header's collapse
  control narrows it on desktop to an icon rail: the sidebar stays on screen at
  a narrow width, carrying each page's icon without its name, and the control
  restores the full width. On mobile the sidebar is a drawer, and the same
  control opens and closes it.
- **Header** (`4.25rem` / `68px`): the sidebar header carries the platform
  logo; the header carries the account, notifications, and theme-toggle icons
  plus the sidebar collapse control, which is the desktop rail toggle and the
  mobile drawer toggle.
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
- **Motion**: durations are limited to the defined scale (`--duration-instant` /
  `0ms`, `--duration-fast` / `200ms`, `--duration-base` / `300ms`, `--duration-slow`
  / `400ms`, `--duration-slower` / `600ms`, `--duration-deliberate` / `700ms`, the
  last reserved for cinematic transitions). `prefers-reduced-motion` MUST be
  honoured; the reduction is mandatory, not optional.
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
  The line limit is advisory: an exception MUST be recorded in the plan's
  Complexity Tracking table with its rationale and a review date, and a
  SHOULD MUST NOT be reported as a critical finding.
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
page outside this list requires both an amendment to the Product Register
(below) and a specification that records the addition under the plan's
Complexity Tracking table.

### Public Site (Guest Accessible)

| Page | Content |
|---|---|
| Home | Platform name, quick search field, four statistical cards (accounts, files, parts, searches). |
| Parts | A search field covering part number and original number (partial match), multi-select filters (car model, type, catalog file, supplier, in which no selection means every supplier), a price filter taking a minimum and a maximum, a parts table showing every column at all times — part number, name, car model, original number, type, price, the supplier's name, and the cart control — pagination (20/50/100), and column sorting on every column except type. Accepts `?file=<id>` to filter by a catalog. The price column, and any filter or sort over it, are rendered for a registered merchant only; a guest receives the same table and the same filters without them. |
| Catalog | Table of every uploaded catalog file. |
| Contact | Contact information and a form (name, phone, body) that reaches the administrator. |
| Log In | Mobile number and password. |
| Sign Up | Full name, Libyan mobile number (entered without a dial-code selector, always +218), password, city (a searchable fixed dropdown of all Libyan cities, governorates, and areas), and an optional shop name. |
| Forgot Password | Password reset via an OTP sent by SMS to the registered mobile number; a uniform response that does not reveal account existence. |
| 404 | Error page. |
| Privacy Policy | Static content. |
| Terms of Use | Static content. |
| FAQ | Frequently asked questions. |

OTP verification is REQUIRED at sign-up; sign-in of a verified account
requires no OTP.

The platform is Libyan. Every account is a Libyan mobile number on +218:
sign-up offers no dial-code selector, and a number outside +218 MUST be
rejected. The number is still stored in E.164 form. Opening registration to
another country is an amendment to this section, not a configuration change
(Product Fact Clarifications -> Libya-only registration; ADR-041).

### Merchant's Authenticated Area

| Page | Content |
|---|---|
| My Files | The merchant's uploaded files, upload action, processing status. |
| Cart | Bookmarked parts, remove action. No price, no quantity, no checkout: the price lives on the part and the cart shows none of it. |
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
| Contact messages | Review contact-form messages. |
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
| 4 | Column Normalisation | Across sources, including the merged and overlapping source columns some suppliers print. Every extracted value is assigned to the canonical column the Glossary fixes for a part, and the six canonical columns are the whole of a part: no description is extracted or stored. |
| 5 | Deduplication | By file, by page, by row. |
| 6 | Arabic Search | Root-aware (طرمبة → طرمبات). |
| 7 | Multi-Filter Search | Part number and original number through the search field, plus multi-select filters over car model, type, catalog file, and supplier, in which no selection means every supplier, and a price range. |
| 8 | Tables | Every data view. |
| 9 | Pagination | 20 / 50 / 100. |
| 10 | Column Sorting | By clicking the header, on every column of the parts table except `type`, which is free text whose alphabetical order carries no meaning. |
| 11 | Cart | Personal bookmark list. |
| 12 | Notifications | Processing results and administrative messages. |
| 13 | Messaging | Single thread with the administrator. |
| 14 | Admin Application | Full platform management. |
| 15 | Audit Log | Every administrator operation. |
| 16 | Automatic Deletion | After 90 days. |

## Product Register

This section is the register of the product the constitution governs. The
product's detail is `Core-Project.txt`, which mirrors this register; on conflict
this section wins. A page, a role, a feature, or a fact
absent from this register MUST NOT be built without amending it.

### Roles

| Role | Can | Cannot |
|---|---|---|
| Guest | Search, browse, filter, and view the catalog and every extracted part except its price. | Use a cart, upload, message, or see a price. |
| Merchant (registered) | Upload files, delete the files they uploaded, use the cart, see the price of every part, message the administrator, edit their own account. | Edit or delete a part, edit a price; delete the account; reach the administrator application. |
| Administrator | Operate the separate application with its own login and full platform privileges. | Be created through the public registration flow. |

Every administrator operation MUST be recorded in the audit log.

### Pages

Twenty-six pages are in scope, and they are listed in Product Scope. The
transitions in Product Scope are the required navigation. A screen that is not
one of the twenty-six MUST NOT be added without amending this register; Product
Scope names the rest of that route, and both halves are read together.

### Features

The sixteen product features are listed in Product Scope and MUST NOT be
restated here. Each MUST be implemented through a specification that references
that list. The product limits are the Usage Limits table in Performance Budgets
and Verification and MUST NOT be restated here either.

### Data entities

Ten entities are in scope, and `docs/domain-model.md` is their source of truth:
it carries the relationships, the cardinality, the invariants, and the owning
module for each. This section maps them; it does not restate them, because a
field list held here would be a second source that drifts from the one.

| Entity | Owning module | One-line meaning |
|---|---|---|
| `User` | `users` | A registered merchant: full name, Libyan mobile number (E.164, unique, always +218), city, optional shop name, role. |
| `Supplier` | `suppliers` | The company named on a catalog's first page. |
| `Catalog` | `catalogs` | An uploaded supplier file, its metadata, its status, and its stored bytes. |
| `Part` | `parts` | One row extracted from a catalog, representing one car part. |
| `Bookmark` | `bookmarks` | One entry in a merchant's cart. |
| `Notification` | `notifications` | A processing outcome, an administrative message, or an administrator's reply delivered to a user. |
| `Conversation` | `messages` | The single thread between a merchant and the administrator. |
| `Message` | `messages` | One message inside a conversation. |
| `ContactMessage` | `support` | A message from the public contact form; its phone is for contact only, never an account identifier. |
| `AuditLog` | `admin` | The append-only record of every administrator operation. |

An entity absent from this table MUST NOT be introduced without amending this
register, and an entity's shape is changed only through
`docs/domain-model.md` and an ADR.

The facts below bind across entities and are stated here because the feature
map depends on them:

- **`first_page_metadata_incomplete`** is a boolean on `Catalog`, set when the
  file's first page yields neither the supplier's name nor the issue date
  (File Processing Overview, step 4). It is a flag, never a status value.
- **Deletion is soft** for `User` and `Catalog`. A soft-deleted row is retained
  and filtered out of every read path; only the retention job and an
  administrator operation remove a row for good. Soft deletion is not a
  substitute for a cascade: deleting a catalog still withdraws its parts, their
  bookmarks, and their search-index entries. Blocking a merchant does not remove
  their public catalogs or the parts extracted from them, and blocking is not
  deletion.
- **An `AuditLog` target is namespaced** in a `type:id` form, so one target
  column is unambiguous across every module an administrator can act on. The
  `type` is the entity the action was performed on.
- **A part's price is the price of its own catalog.** A part belongs to exactly
  one catalog, so the same part offered by five suppliers is five parts in five
  catalogs, each carrying the price its own file printed. Two parts whose
  original numbers are equal are the same part offered by different suppliers.
  The platform identifies that sameness and shows the parts side by side in one
  table, which is what a merchant comparing suppliers needs. It does not merge
  them: no equivalence entity is introduced, no row is withdrawn, and no two
  catalogs are joined by it (ADR-040).
- **The price is a registered-merchant-only projection.** Every read path a
  guest can reach projects the part without its price, through an allowlist of
  its own (Query Safety and Secrets). Redaction is a property of the
  projection, not a rule the presentation layer applies after the fact.

The entity shape beyond what `docs/domain-model.md` states is a deferred area
(Catalog data shape). Column types, constraints, and the physical schema are not
governed here at all: they are the owning module's
`packages/db/schema/<module>.ts` and the owning feature's `data-model.md`.
Schema and Migration Control governs how any shape changes.

### Unresolved product facts (binding)

The conflicts and ambiguities below were found between the sources, or inside
the sources' own data. They are recorded rather than silently resolved. The
slice named in the last column MUST resolve each one and record the answer in
`docs/DECISIONS.md`; until then a slice MUST NOT decide one on its own:

| Conflict | Sources | Resolve in |
|---|---|---|
| `expires_at` is the retention deadline or the supplier's printed expiry date | Schema and Migration Control, the retention discussion, and `Core-Project.txt` (supplier date) | R15 |
| Notification retention is undetermined | The product statement defers it ("to be determined later") | R9 |
| A message's sender is either a merchant or an administrator, and the register names one sender | Product Register (`Message` carries a single sender); Authorization and Access Control (the administrator is a separate principal with a separate login) | R10 |
| `Conversation` carries an administrator reference, yet every administrator account sees the same single thread | Product Register (`Conversation` carries an administrator); `Core-Project.txt` (one administrator account type, all administrators see the same conversations) | R10 |
| An administrator is a role on `User` in one place and a separate party that `Conversation` and `AuditLog` refer to in another | Product Register (roles); Authorization and Access Control (a separate application with a separate login) | R13 |
| How a printed price that carries more than one separator is read (for example `1.250.000`), and how a file that separates thousands rather than decimals is read | File Processing Rules (price denomination); the price examples in `Core-Project.txt`; the source files themselves | R3 |
| Where the administrator's platform settings are stored, given that no registered entity owns them | Product Scope (Administrator's Application → Settings); the Data entities register (ten entities, none of them settings, and an unregistered entity MUST NOT be introduced) | R13 |

**Resolved conflict (2026-10-03).** The sidebar conflict is resolved: the
sidebar is required on desktop and must not hide or slide (Principle IX);
`Core-Project.txt` now defines the shell including the sidebar; authentication,
404, static, and administrator pages are exempt from the shell. Recorded in
`docs/DECISIONS.md` (ADR-017).

**Resolved conflict (2026-10-03).** Support reaches the administrator through a
dedicated administrator page ("Contact messages"), not through the merchant
conversation thread and not through user-to-user chat. Recorded in
`docs/DECISIONS.md` (ADR-028).

**Resolved conflict (2026-10-03).** Home carries four statistical cards
(accounts, files, parts, searches) across Product Scope and the mirror; R5's
plan records the choice in `docs/DECISIONS.md` when it plans.

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
   value is processed and marked: the catalog record carries a boolean
   `first_page_metadata_incomplete` flag. The flag is not a status value; the
   status enum below stays closed to its four values.
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
- **Content safety.** Every uploaded file MUST pass, in order: magic-byte
  validation against its declared content type; ClamAV antivirus scanning; a
  decoded-size cap recorded under Constitution Mandated Values that rejects
  zip-bomb archives (Office documents are ZIP containers); and macro stripping
  before extraction. A file failing any step MUST be rejected and MUST NOT be
  stored or processed.
- **Canonical column assignment.** Every value the pipeline extracts MUST be
  assigned to the canonical column it belongs to, and the canonical set is the
  one the Glossary fixes for a part. The assignment is made by the extraction
  pipeline itself: no manual column-mapping step sits between the upload and
  the processing, and a merchant is never asked to map columns. The canonical
  set is complete for a parts table: every value in a supplier's parts table
  has its column, and a value that belongs to no canonical column is part of no
  stored column, so it is simply not stored rather than counted or flagged.
  There is no "unassigned" class of value and no counter for one. The free
  text of the `type` column is what absorbs the variety a table prints in a
  type/country cell rather than a gap waiting for a review. A merged or
  overlapping source column is a case of this rule, not an exception to it:
  its values are separated into the columns they belong to.
- **Supplier name normalisation.** A supplier name read from a first page is
  normalised before it is stored or before it is compared with another name:
  whitespace is collapsed, leading and trailing punctuation is dropped, and a
  legal-form word such as `شركة` or `مؤسسة`, or a trailing purpose word such as
  `للبيع`, is removed. Normalisation makes two spellings of one name compare
  equal. It MUST NOT merge two suppliers, and only the administrator can merge
  them.
- **Price denomination.** A part's price is the amount printed in its own
  catalog, denominated in the Libyan Dinar. The period and the comma in a
  printed price are decimal separators, not thousands separators, so `123.000`
  denotes 123 dinar. A printed price carrying more than one separator, or a file
  that separates thousands instead, is a recorded unresolved product fact owned
  by R3; no feature may settle it on its own. A price printed in another currency
  is not converted and not stored: the part reads «بدون سعر» for it, because a
  converted figure the platform cannot stand behind is worse than an honest gap.
- **Retry vs reprocess.** A retry re-enqueues a failed file's processing job
  over its stored bytes, without re-uploading anything. A reprocess is the
  administrator's re-run of the same pipeline over a catalog's stored bytes,
  from the admin Files page; see the Glossary. Both keep the catalog record
  and its extracted parts until the new run settles.
- Processing MUST complete within the budget stated in Performance Budgets
  and Verification.
- A failed file MUST be retryable without re-uploading the bytes.
- The catalog record's status field MUST take exactly one of: `uploaded`,
  `processing`, `completed`, `failed`. Any other value is a defect.

The sections below are binding with the same force as the principles above.
A MUST in them is resolved, reviewed, and excepted by the same procedure.

## Single-Reference Sufficiency

A feature MUST NOT need a source outside this constitution for any rule it must
obey. Every project-level source is named in References, and this constitution
carries the register of each: the repository's structure and the approved stack
in Technology Standards, the design system's structure in Design System
Standards, the product's roles, pages, and facts in Product Scope and Product
Register, and the data model's entities and their ownership in the Data entities
register.

- Detail lives in the referenced sources; the register lives here. A rule that
  cannot be discharged without reading a referenced source MUST name that source
  where the rule is stated.
- A value a referenced source leaves open, or defers, MUST be given a binding
  value under Constitution Mandated Values by the first plan that needs it, and
  the choice MUST be recorded in `docs/DECISIONS.md` as an ADR.
- A technology, token, component, page, feature, role, or entity that is absent
  from the registers above is not approved. Finding it in a referenced source
  does not approve it; the register MUST be amended first.
- A register is a map, not a copy: a design value, a token, a class, a line of
  code, or a table definition MUST NOT be copied into this constitution. A
  register that duplicates its source is a drift defect, because the two copies
  will disagree. The single exception is the design values a rule depends on —
  those in Design System Standards → Decision values and those named in
  Principles IV and IX — which are restatements of `wafar.single.css` and MUST
  move with it.
- A register row MUST name a value its source actually defines. A register that
  names a token, entity, or field the source does not contain is the same
  defect read in the other direction, and it is corrected by amending the
  register rather than by inventing the value.
- The feature templates' binding block MUST stay in step with this constitution:
  a register added here, renamed here, or renumbered here MUST be reflected there
  in the same change, together with the constitution's version.

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
- **A tenant is a merchant account.** A tenant identifier IS the `User` identifier;
  there is no separate tenant entity, and a table that holds merchant-owned data
  MUST carry `user_id` as a foreign key to `User`, and that column MUST be part of
  every index serving a merchant-scoped query. Tables holding platform-wide data
  that belongs to no single merchant — `Supplier`, `AuditLog` — carry no tenant
  identifier, and a query against them is not tenant-scoped. `ContactMessage` is
  in the same category and for the same reason: it is a public intake whose
  submitter may hold no account at all, its only read path is the
  administrator's, and no query reaches it from a merchant session, so a scoping
  column on it could never be used as a scoping key (ADR-053).
- Every read and write of merchant-owned data MUST be merchant-scoped, and the
  scoping MUST be applied at a single shared entry point rather than repeated
  at each call site. A query path reachable from a merchant session MUST NOT
  be able to return rows belonging to another merchant, and that invariant MUST
  be covered by a test that fails when it is broken.

**Rationale:** A tenant scope that is missing is not a defect, it is a breach,
and a rule repeated at every call site is a rule that will be forgotten at one
of them. Destructive changes are the one schema operation that destroys data
rather than merely inconvenience, so they are the one that gets a rollback that
is actually exercised rather than merely written down.

## Identity, Authentication, and Session Policy

This section governs how a user proves who they are and how that proof is held.
It does not govern what a user is permitted to do; see Authorization and Access
Control for the distinct Guest, Merchant, and Administrator capabilities, and
Deferred areas for the permission-resolution mechanism that is not yet
ratified.

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
- **Account enumeration, lockout, and anti-spam.** Sign-in, registration, and
  password-recovery responses MUST NOT reveal whether an account exists. After
  five consecutive failed sign-in attempts the account MUST be locked for
  fifteen minutes. Registration and contact forms MUST be protected by a
  honeypot field, a minimum time-to-submit, and a rate limit per client
  identifier. CAPTCHA MUST NOT be used. The administrator account MUST be
  created by a seeded CLI command with a forced password change at first
  sign-in, never through the public registration flow.
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
  the same one Schema and Migration Control names for merchant scoping. Until
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
- **Lightweight performance budget.** Each web surface MUST carry a Lighthouse
  budget for Largest Contentful Paint, Interaction to Next Paint, and
  Cumulative Layout Shift, asserted by Lighthouse CI on at least the public
  Parts and Home pages.
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
- **Search results MUST return in under one second at p95**, the percentile the
  Usage Limits table fixes.
- **Adding to the cart MUST complete in under 200 milliseconds at p95.**
- **Processing a file (Excel, PDF, or Word, up to 100 MB) MUST complete in
  under five minutes at p95**: 95% of the files a merchant uploads finish
  inside that budget, and the remainder are visible as `processing` until they
  finish or fail.
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
| Very large files in practice (exceptional) | up to 20 MB (the binding ceiling stays 100 MB) |
| Monthly upload limit per user | 50 files per calendar month |
| Total upload limit per user | 100 files |
| Maximum cart size | 99 parts |
| Automatic file deletion | after 90 days |
| Search latency budget | p95 < 1 s |
| Cart-add latency budget | p95 < 200 ms |
| File processing budget | p95 < 5 min |

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

- File size, single-responsibility, no-duplicated-logic, owning-module, and
  no-circular-import rules are defined once by Principle X and apply here
  without repeating.
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
  the maximum query execution time; the Recovery Time Objective and Recovery
  Point Objective; the runtime version; the design-system version; the icon set;
  the extraction libraries; the transactional SMS transport; the
  continuous-integration provider; the decoded-size cap that rejects a
  zip-bomb upload; and the supported-browser statement. A value written in the
  body of the plan but not
  under that heading does not satisfy the rule that names it, and a plan
  with no such heading has not discharged any of them. The list is closed: a
  MUST that names a value adds it here first, in the same change, and the
  plan template's table gains the matching row.
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
- **Upload transport.** Large uploads MUST use presigned multipart uploads
  streamed to object storage; the API MUST NOT buffer a 100 MB file in memory.
- **Worker durability.** File-processing jobs MUST have bounded retries with
  exponential backoff, a dead-letter queue, a per-worker concurrency cap, and
  a periodic sweep that removes temporary workspace files. A job that
  exhausts retries MUST surface `failed` to the catalog and to the user with a
  retry action that does not re-upload bytes.
- **Session revocation.** Every authenticated session MUST be revocable
  server-side, including a "sign out everywhere" operation, and browser-stored
  tokens MUST be revocable on password change.
- **Anti-spam enforcement.** The honeypot, time-to-submit, and rate-limit
  controls named in Identity, Authentication, and Session Policy MUST be
  verified by automated tests. CAPTCHA MUST NOT be introduced.
- **Merchant isolation verification.** A query-path test MUST fail the build if
  any merchant-reachable path can return another merchant's rows.
- **Staging data anonymisation.** Staging MUST NOT contain production personal
  data; seeded or anonymised datasets only (pg_anonymize or an equivalent tool).
- **Monitoring and alerting.** Metrics MUST be collected for p95 request
  latency, search p95, processing success rate, and queue depth, with alerts
  when a budget is breached, using Prometheus + Grafana or an equivalent
  metrics collection stack. Structured logs MUST carry a correlation
  identifier end to end.
- **API versioning and deprecation.** Public HTTP APIs MUST be versioned in
  the path (`/api/v1`); a deprecation MUST announce removal at least one
  release ahead and MUST be recorded as an ADR.
- **Supply-chain controls.** Each build MUST produce an SBOM and run a
  vulnerability/SAST scan (Semgrep OSS or equivalent) plus a dependency
  vulnerability scan (osv-scanner or equivalent) whose failures block
  release; results are review material, not secrets.

**Rationale:** Deployment rules are the only ones with no feedback loop until
something fails, which is why they are written as staging gates and restore
exercises rather than as intentions. The RTO and RPO requirement is what turns
"we would restore" into a number a team can be held to.

## Technology Standards

This section is the register of the approved stack and the map of the
repository. `Project-Technologies.txt` is a readable mirror of this register;
where the two disagree, this section wins. The mirror carries the exact version
of each technology, the per-technology notes, and the repository trees at file
granularity; it MUST NOT introduce a technology this register does not name, and
MUST NOT restate a rule. A technology absent from this
register MUST NOT be used, and a technology named here MUST NOT be substituted
without an amendment to this constitution.

### Repository topology

| Path | What it is |
|---|---|
| `apps/web` | Public site and the merchant's authenticated area. |
| `apps/admin` | The administrator's separate application, with a separate login. |
| `apps/api` | The API server (Modular Monolith). |
| `apps/worker` | The file-processing worker. The only writer of the search projection. |
| `packages/shared` | Validation schemas, types, and contracts shared by frontend and backend. |
| `packages/db` | Database schema and migrations — the single migration mechanism. |
| `packages/search` | Search client and index mappings. |
| `packages/config` | ESLint, Prettier, Stylelint, and TypeScript configuration shared by every workspace. |
| `pnpm-workspace.yaml`, `turbo.json`, `package.json` | Workspace definition and task graph; versions pinned, lockfile committed. |

`docs/architecture.md` is the source of truth for layout, the API module map,
and data flow, and a plan's Ownership Map MUST match it. An application MUST NOT
be added to `apps/`, and a package MUST NOT be added to `packages/`, without an
amendment to this section.

### Internal layout

| Concern | Fixed location |
|---|---|
| API module | `apps/api/src/modules/<module>/{routes,service,repository}` — one directory per module named in Principle X. |
| Worker | `apps/worker/src/processors/{extract-parts,normalize,deduplicate,index-parts}.ts`, `apps/worker/src/queues/file-processing.ts`. |
| Database | `packages/db/schema/<module>.ts`, `packages/db/migrations/`. |
| Search | `packages/search/client.ts`, `packages/search/mappings/`. |
| Frontend | `apps/web/{pages,components,composables,stores,layouts}`. |
| Web server routes | `apps/web/server/` — optional Nitro server routes (Nitro is part of Nuxt 4; it is named here in Internal layout and is deliberately not a row of the Approved register); created only by the feature that declares them in its Ownership Map. |
| Administrator frontend | `apps/admin/{pages,components,composables,stores,layouts}`. |
| Validation | `packages/shared` only; a second local schema MUST NOT be created. |
| Database ownership | `packages/db/schema/<module>.ts` — one file per module named in Principle X; the table it declares belongs to that module. |

A feature MUST NOT create a parallel location for an artifact whose location is
fixed above.

### Approved register

| Layer | Technology | Version floor or note |
|---|---|---|
| Repository | Monorepo, pnpm (with Catalogs), Turborepo | Turborepo v2; lockfile committed |
| Runtime | Node.js | pinned under Constitution Mandated Values, with an ADR recording the choice |
| Frontend | Nuxt 4, Vue 3, TypeScript, Tailwind CSS v4, Nuxt UI v4, Pinia, TanStack Query | TypeScript strict mode is mandatory (Principle II) |
| Backend | Hono, OpenAPI, Modular Monolith | the module list is Principle X |
| Validation | Zod | one schema set, shared by frontend and backend |
| Database | PostgreSQL 16+, Drizzle ORM, PgDog | PgDog is pre-1.0: a plan using it MUST name a fallback and a review date |
| Search | OpenSearch, the Arabic analyzer, Index Lifecycle Management | the index lifecycle is aligned with the 90-day deletion |
| Files | SeaweedFS, BullMQ, Redis | Redis >= 5.0.0 (the BullMQ requirement) |
| Auth | better-auth | `scim` and `sso` MUST stay disabled (CVE-2026-67330, CVE-2026-80192); better-auth MUST be used with its phone-number extension, or an ADR-recorded alternative |
| Testing | Vitest, Playwright | unit and integration in Vitest, end-to-end in Playwright |
| Quality | ESLint, Prettier, Stylelint | `any` and double assertions are rejected |
| Delivery | VPS (Hetzner or equivalent), Nginx or HAProxy, Docker (optional) | Docker is used only for staging parity |
| Security | ClamAV | File-upload antivirus scan (File Processing Rules); a scanner, not a runtime dependency — exception `EX-001` in `.specify/templates/exception-register.md` |
| Quality | Lighthouse CI | LCP/INP/CLS budget assertion (Performance Budgets and Verification); a CI gate, not a runtime dependency — exception `EX-002` in `.specify/templates/exception-register.md` |

The frontend row's libraries split their roles and MUST NOT overlap: Nuxt UI
v4 provides the UI components; Pinia holds client-side stores; TanStack Query
owns server-state fetching, caching, and invalidation. Server state copied
into a Pinia store, or a UI component built around a query, is a defect.

### Version-change rule

A change to the MAJOR version of a technology in this register is a substitution
and requires an amendment to this constitution. A MINOR or patch upgrade follows
Dependency Governance and MUST be recorded in the plan that performs it, even
when the automated update process performs it.

### Register gaps a slice MUST close

No technology is approved yet for the following, and each is required by a rule
or by Product Scope. The named slice MUST record its choice in the plan's
Complexity Tracking table, together with an ADR, a licence-obligation record,
and a vulnerability scan, and this register MUST be amended to add it no later
than that slice's acceptance. Until then the choice is open, and naming a
specific library in this register is prohibited, because an unvetted name would
fail Dependency Governance:

| Gap | Required by | Owning slice |
|---|---|---|
| Excel, PDF, and Word extraction; content-type validation | File Processing Overview; Usage Limits | R3 (validation: R2) |
| Transactional SMS provider for OTP and password reset | Product Scope: Sign Up, Forgot Password | R1 (international provider such as Twilio/Vonage) |
| Continuous-integration provider | Principle III coverage gate; Dependency Governance | R1 (the slice that introduces the test runner) |
| Error tracker | Deployment and Observability | R12 (the first deploying slice) |
| Secret manager, plus pre-commit and CI secret scanning | Query Safety and Secrets | R12 (the first deploying slice) |
| TLS certificate management | Identity, Authentication, and Session Policy | R12 (the first deploying slice) |
| Backup and restore tooling | Deployment and Observability | R1 (the slice that introduces persistent storage) |
| Log pipeline | Deployment and Observability | R12 (the first deploying slice) |
| Icon set used by the interface: an open-source set under a permissive licence (MIT, Apache-2.0, ISC, or BSD), self-hosted as SVG, with no emoji standing in for an icon | Product Scope; Design System Standards; Principle V | R1 |
| Redis client library | Files register row (BullMQ, Redis); Deployment's worker-durability rules | R3 |
| OpenSearch client library | Search register row; `packages/search` | R5 |
| Automated accessibility checker | Principle IV's verification MUST | R1 |
| Arabic analyzer configuration and verification | Principle V's root-aware search; Search register row | R5 |

### Licence treatment for infrastructure services

Dependency Governance's licence prohibition applies to code shipped to, or
linked into, a merchant's browser or device. A network service consumed over a
connection (Redis, PgDog) is not shipped code; a plan using one MUST
nevertheless record the obligation its licence imposes, the operational coupling
it creates, and a review date.

## Design System Standards

The full design system is implemented in `wafar.single.css`, which is the only
permitted source of design values. This section is its register: what the file
contains, and the rules that keep it single. A value, family, class, or component
absent from this register is not part of the design system and MUST NOT be used.
A design value MUST NOT appear in this constitution — the register maps, the CSS
holds the values, and a copy here would be a second source that drifts. The one
exception is the set of values a rule in this constitution depends on: the
Decision values below, and the values Principles IV and IX name. Those are the
register's reading of `wafar.single.css` rather than a second copy of it, which
is why the file stays the source and a change to it MUST move them in the same
change. No other value belongs here: not a token step, not a class, not a
spacing or colour rung.

### Module map

The file is composed of fourteen modules, in this order. A value or component is
added to the module that owns its concern, and this map is updated in the same
change.

| # | Module | Owns | # | Module | Owns |
|---|---|---|---|---|---|
| 01 | core | reset, RTL root, accessibility baseline, numeral handling | 08 | motion | durations, easings, transitions, keyframes |
| 02 | colors | eleven colour families and the semantic aliases | 09 | zindex | the z-index layer scale |
| 03 | typography | families, sizes, leading, tracking, weights | 10 | glass | glass, gradients, tints, glow |
| 04 | opacity | opacity and alpha steps | 11 | forms | buttons, fields, badges, dots, progress |
| 05 | spacing | space scale, gutters, containers, screens, touch floors, navbar and sidebar | 12 | components | semantic layers: shell, page, card, table, empty |
| 06 | radii | the radius ladder and the named radii | 13 | loaders | the six loader designs and their tokens |
| 07 | shadows | the shadow ladder and the named shadows | 14 | modes | media queries and responsive utilities |

### Token families

- Colour families, each 50-950: `brand`, `accent`, `primary`, `neutral`, `gray`,
  `zinc`, `surface`, `success`, `warning`, `error`, `info`, plus the semantic
  aliases (`--background-*`, `--text-*`, `--border-*`, `--surface-*`,
  `--ring-*`, `--scrim`, `--control-solid`). `--ring-*` holds the focus and
  validation halos, `--scrim` the backdrop dimmer, and `--control-solid` the
  fill of a control that stays the same colour in both modes.
  `gray` and `zinc` are re-pointed at the neutral ladder, and `info` is a synonym
  of `brand`; both are deliberate decisions, recorded in `docs/DECISIONS.md`.
- Typography: `--text-4xs` … `--text-6xl`, the matching `--leading-*`, the
  `--tracking-*` set, the `--font-weight-*` set, and `--font-sans`,
  `--font-display`, `--font-mono`.
- Opacity and alpha: the opacity steps and the named alpha and tint values.
- Spacing: `--space-0` … `--space-32`, the gutters, the container widths, the
  screen widths, the touch floors, `--navbar-height`, `--sidebar-width`, the
  bottom-navigation tokens, and the safe-area tokens.
- Radii: the radius ladder plus the named radii `shell`, `canvas`, `sheet`,
  `overlay`, `media`, `control`, `pill`, and `card`.
- Shadows: the size ladder (`--shadow-xs`, `--shadow-sm`, `--shadow-md`,
  `--shadow-lg`, `--shadow-xl`, `--shadow-2xl`) plus the named shadows `card`,
  `card-raised`, `cinematic`, `cinematic-hover`, `cinematic-panel`, `control`,
  `focus`, `glass`, `hairline`, `hairline-soft`, `inner`, `navbar`, `none`,
  `overlay`, `panel`, and `glow-brand`, plus the brand tints `brand-sm`,
  `brand-md`, and `brand-lg`. The brand tints are a
  three-step sub-ladder and not a single `brand` shadow; a `brand` shadow does
  not exist and MUST NOT be used.
- Motion: the duration steps — `--duration-instant` (0ms), `--duration-fast`
  (200ms), `--duration-base` (300ms), `--duration-slow` (400ms), `--duration-slower`
  (600ms), `--duration-deliberate` (700ms, reserved for cinematic transitions) —
  plus one duration outside that scale, `--duration-reduced` (120ms), which the
  `prefers-reduced-motion` block uses and nothing else. `instant` and
  `deliberate` are the two ends of the ladder and are named here because
  Principle IX's motion rule states the scale; every other transition duration a
  rule names is one of these six. The file carries two further duration families
  that are periods rather than transition durations and are therefore not on the
  scale: the infinite-loop periods `--motion-loop-{pulse,spin,slow,float,badge,gradient,shimmer}`,
  and the stagger ladder `--motion-stagger-1` … `--motion-stagger-5`
  (100–500 ms) behind `.ds-delay-1` … `.ds-delay-5`. Easings are
  `--ease-standard`, `--ease-smooth`, `--ease-bounce`, `--ease-cinematic`,
  `--ease-linear`, `--ease-default`, `--ease-loop`, and `--ease-pulse`.
- Z-index: the defined layer scale. Every layer takes a value from it.
- Glass and gradients: the glass surfaces, the gradient utilities, the tints, and
  the glow utilities.
- Form metrics: the control and field heights, in their desktop variants.
- Loaders: the loader size, stroke, gap, speed, and colour tokens.

### Breakpoints

The media queries use 640, 768, 1024, 1280, 1536, and 1920 px as minimum widths,
plus the `max-width` cases at 359, 639, and 1023 px and the 768–1023 px tablet
band. The token ladder names them, and the mapping below is binding:

| Token | Value | Mirrored by a hardcoded media-query value? |
|---|---|---|
| `--screen-tiny` | 360px | yes, as `max-width: 359px` |
| `--screen-xs` | 480px | no |
| `--screen-sm` | 640px | yes |
| `--screen-md` | 768px | yes |
| `--screen-lg` | 1024px | yes |
| `--screen-xl` | 1280px | yes |
| `--screen-2xl` | 1536px | yes |
| `--screen-3xl` | 1920px | yes |

The stylesheet contains no `var(--screen-*)` reference: every token in the ladder
is declared-but-unused, so none of them MAY be relied on until the module that
owns it wires it to a media query. The same holds for `--sidebar-width`,
`--navbar-height`, and `--touch-floor` (and its `-sm`/`-lg`/`-xs` siblings).

The shadow ladder is **not** in that state, and this paragraph does not claim it
is. The size ladder `--shadow-xs` through `--shadow-2xl` and the named shadows
`--shadow-card`, `--shadow-card-raised`, `--shadow-focus`, `--shadow-hairline`,
`--shadow-hairline-soft`, `--shadow-navbar`, and `--shadow-glow-brand` are
declared **and already consumed** by `wafar.single.css`; they are in force. The
remaining nine named shadows — `--shadow-cinematic`, `--shadow-cinematic-hover`,
`--shadow-cinematic-panel`, `--shadow-control`, `--shadow-glass`,
`--shadow-inner`, `--shadow-none`, `--shadow-overlay`, and `--shadow-panel` —
and the `brand-sm`, `brand-md`, `brand-lg` triple are declared-but-unused, and
no slice MAY rely on one until the surface that needs it consumes it. The two
groups account for the whole file: twenty-five shadow tokens, being the six-step
size ladder, sixteen named shadows (seven consumed, nine not), and the brand
triple. A register row naming a value MUST match what the source actually does
(Single-Reference Sufficiency); this paragraph distinguishes the two states
because the two groups are not uniform.

A responsive change MUST name the breakpoint it changes at, and the first
surface that wires a token MUST delete the tokens it leaves unused (Project
Structure and Debt Control).

### Component inventory

Button; field; select; checkbox; radio; switch; card; table, with its density
classes and column-width scale; badge; avatar; dot; progress; skeleton;
shimmer; empty; divider; dropdown; popover; tooltip; backdrop; drawer; overlay
container; the glass, gradient, tint, and glow utilities; shell; page; panel;
grid; stack; container; the six loaders; and the animation utilities.

### Decision values (binding)

The values below are decisions of the system, not of the ladder, and the listed
rule depends on each one.

- **Dark mode (default)**: background `#0a0a0a`, surface `#121416`, primary
  text `#fafafa`.
- **Light mode (opt-in)**: background `#fafafa`, surface `#ffffff`, primary
  text `#0a0a0a`.
- **Card**: `--radius-card` (1.5rem), `--shadow-card`, border
  `--border-slate-subtle`.
- **Table**: striped rows (`nth-child(even)`), hover. Density classes:
  `ds-table-density-compact`, `ds-table-density-normal`,
  `ds-table-density-comfortable`. A sticky header is required but the design
  system does not yet provide it (see the missing-components list below).
- **Motion**: `--duration-fast` (200ms) for micro-interactions,
  `--duration-base` (300ms) for transitions, `--duration-slow` (400ms) for
  the theme toggle, `--duration-slower` (600ms) for long transitions,
  `--duration-deliberate` (700ms) for cinematic transitions, and
  `--duration-instant` (0ms) where a transition must not animate.
- **Sidebar**: `--sidebar-width` (19rem / 304px), full width or icon rail on
  desktop, drawer on mobile. The rail's width is not fixed here; it is a token
  the slice that first needs it MUST add to `wafar.single.css`.
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
| responsive | Layout at the design system's breakpoints (sidebar at full width or as an icon rail on desktop, drawer on mobile). |
| accessibility | WCAG 2.2 AA, keyboard operable, `:focus-visible`, touch targets ≥ --touch-floor (Principle IV). |

### State map

| State | Class or attribute that renders it |
|---|---|
| loading | `ds-loader-arc`, `ds-loader-dots`, `ds-loader-dual-ring`, `ds-loader-bars`, `ds-loader-orbit`, `ds-loader-radar`; `ds-skeleton`, `ds-shimmer`, `ds-progress-*` |
| empty | `ds-empty`, `ds-empty-icon`, `ds-empty-title`, `ds-empty-description`, `ds-empty-action` |
| error | `ds-field-error`, `ds-hint-error`, `ds-badge-error`, `ds-dot-error` |
| success | `ds-field-success`, `ds-badge-success`, `ds-dot-success` |
| disabled | `:disabled` and `[aria-disabled="true"]` on the control |

A control that has no disabled state MUST NOT be shipped. The completeness rule
for a surface is Principle IX's (State completeness); this table only maps the
states to the classes that render them.

### Components the product requires and the design system does not yet provide

The product's pages and features require the following, and `wafar.single.css`
does not provide them today: pagination (numbered buttons plus the 20/50/100
page-size selector); a column sort indicator; the filters toolbar; file upload
with progress; a confirmation overlay (the overlay Principle IX names "Modal" —
the system has `ds-overlay-root`, `ds-backdrop`, and `ds-drawer-panel`, but no
modal); a toast; the message-thread surface; the cart add/remove toggle; the
notification bell with its counter; the theme toggle; the icon set; the
collapsed sidebar rail (its width token, and the rail's rendering beside the
full sidebar); and the sticky table header (the system ships `ds-sticky-top`,
but `.ds-table thead` does not use it).

Each MUST be added to `wafar.single.css`, in the module that owns its concern,
by the slice that first needs it, in that slice's change. It MUST NOT be created
ad hoc inside a feature, and it MUST NOT be defined in this constitution.

### Invariants

- Dark mode is the default and is class-based: the `dark` class on `<html>`,
  together with `color-scheme`. `prefers-color-scheme` MUST NOT choose the mode;
  it serves only elements that do not read the class. The chosen mode MUST be
  applied before first paint, and the toggle sits in the header.
- Tables are the only data-display form. The exceptions are the home page's
  statistical cards.
- RTL by construction: `<html dir="rtl" lang="ar">` on every page, logical CSS
  properties only, and Latin numerals only (`ds-numeric`, `ds-tabular`).
- Prohibited: raw Tailwind colours; any `#hex` or `rgb()` outside
  `wafar.single.css`; `ml-`, `mr-`, `pl-`, `pr-`, `left`, `right`; direct
  `z-10`, `z-20`, `z-50`; Arabic-Indic numerals; positive `letter-spacing` on
  Arabic text; and any typeface other than Tajawal, Noto Sans Arabic, or
  JetBrains Mono.
- **Supported browsers.** The two latest major versions of Chrome, Edge,
  Firefox, and Safari MUST be supported; no browser may be dropped without an
  ADR. Support MUST be stated in the plan's Constitution Mandated Values.
- Every z-index value comes from the defined layer scale, and every duration
  comes from the defined motion scale.
- A design value MUST NOT appear anywhere but `wafar.single.css`: not in a second
  stylesheet, not in a Vue SFC colour, not in an inline style value, and not as a
  Tailwind colour utility.
- **Static enforcement.** Stylelint and ESLint MUST fail the build on physical
  direction properties, and on any colour, radius, shadow, duration, or z-index
  value **outside `wafar.single.css`** that does not reference a declared token.
  Enforcement MUST be a committed configuration, not a review comment. The scope
  is named because it is the only reading under which the rule is satisfiable:
  `wafar.single.css` is the source of the tokens, so a rule that forbade a
  literal there would forbid the file from defining anything.
- **Inside the design system file.** A colour, radius, shadow, duration, or
  z-index in `wafar.single.css` MUST be either a token definition or a reference
  to one, and the same rule applies to a shadow's own parts — a `box-shadow` that
  combines a token with a literal offset or alpha is a token reference and a
  literal, and it is the literal half that is the defect. Three cases are exempt
  because the value is not a rendered design value: a `mask` or `-webkit-mask`
  image, whose luminance mask must be literal to mask at all; the print rules,
  whose job is to override user-agent styling that the tokens do not control; and
  a `prefers-color-scheme` rule, whose values must deliberately differ from the
  mode class because it exists only to serve elements that do not read the class
  (Invariants below: the mode is class-based). A raw value anywhere else in the
  file is a defect, and a slice that edits the rule containing it converts it in
  the same change rather than reading around it.

### Fonts and the framework bridge

- The system declares no `@font-face`. Delivering the fonts is the application's
  duty: Tajawal Variable (weights 300-800) and JetBrains Mono, self-hosted,
  Arabic-subset, with `font-display` stated and a recorded metrics fallback.
- Tailwind's default palette MUST be disabled, `@theme` MUST resolve every
  utility to a design token, and Nuxt UI's theme MUST be mapped onto these
  tokens. A utility or component colour that is not a token is a Principle IX
  violation. No bridge exists yet; it MUST exist before the first surface that
  uses a Tailwind or Nuxt UI colour.

### Extension procedure and design-system version

- A new value or component MUST be added to `wafar.single.css` in the module that
  owns its concern, and the module map above MUST be updated in the same change.
  The module count and order MUST stay in step with the file.
- `wafar.single.css` MUST declare its own version in its header. The plan records
  that version under Constitution Mandated Values, which is the single place a
  value the plan must record is named (Module Discipline and Development
  Workflow). A second stylesheet MUST NOT be introduced.

### Honoured media and capability states

Print (`ds-print-hide`, `ds-print-only`, `ds-print-block`, `ds-print-link`),
reduced motion (all animation MUST stop), high contrast, short landscape,
pointer and hover capability (`ds-touch-optimized`), screens below 360px
(`ds-tiny-hide`, `ds-text-shrink`), safe-area insets, and scroll locking
(`ds-scroll-locked`) MUST be honoured. This is a MUST, not an option.

## Glossary

| Term | Definition |
|---|---|
| **Catalog** | An uploaded supplier file, together with its extracted parts, its processing status, and its metadata (supplier name, issue date, upload date, expiry date). A catalog is owned by the merchant who uploaded it. |
| **Part** | A single row extracted from a catalog, representing one car part. Its six canonical columns are the whole of it: part number, name, car model, original number, type, price. The car model is separated out of the name when a supplier prints it inside the name; a printed year range (for example `2018-2020`) that rides inside the name is NOT extracted into its own column and stays part of the part name, while the car model itself is still separated out; `type` is one free-text column carrying what suppliers print as a single type/country column — brand, country of origin, and manufacturing grade together — and is therefore not sortable; the price is the amount printed in the part's own catalog. A part has no description column: it is neither extracted nor stored. A part belongs to exactly one catalog. |
| **Original number** | The supplier-independent identifier a manufacturer prints for a part, which is what tells the platform that the same part appears in two suppliers' files. It is a canonical column, is indexed, and is searched by partial match; it carries no uniqueness constraint, because suppliers repeat a number within their own file and rival suppliers print the same one. It identifies a part across catalogs and merges nothing. |
| **Canonical column** | One of the fixed columns a part is made of (see **Part**). Extraction assigns each value to a canonical column and never invents one. |
| **Price** | The amount a supplier's own file prints for a part, in Libyan Dinar, shown so a merchant can compare suppliers. It belongs to the part and its catalog; it is not an offer, and the cart carries none. It renders with a decimal point and three decimal places and no thousands separator, so ten dinar reads `10.000` and fifteen dinar reads `15.000`; a part with no price reads «بدون سعر». |
| **Supplier** | The company named on the first page of an uploaded catalog, from which the parts originate, stored in its normalised form. A supplier may appear in many catalogs. Normalisation makes two spellings of one name compare equal; it does not merge two suppliers, and only the administrator merges. |
| **Cart** | A merchant's personal bookmark list of parts. It is not a purchase order. It carries no price and no quantity: the price lives on the part, and the cart shows none of it. See Principle VI. Its user-facing Arabic name is «سلة المشتريات». |
| **Bookmark** | A single entry in the cart, linking a user to a part. |
| **Notification** | A message delivered to a user in the notification list, either because a processing job completed or failed, an administrator sent an administrative message, or an administrator replied to the user's message. |
| **Conversation** | The single thread between a merchant and the administrator. A user has at most one conversation. |
| **Audit Log** | The append-only record of every administrator operation. |
| **Processing** | The automated pipeline that turns an uploaded file into extracted, indexed parts. See File Processing Overview. |
| **Deduplication** | The removal of identical parts within the same file (by file, page, row), or the rejection of a file whose content hash matches a file already uploaded. |
| **First-page metadata flag** | A boolean on a catalog record (`first_page_metadata_incomplete`), set when the file's first page yields neither the supplier's name nor the issue date. It is not a status value: the status enum stays `uploaded`, `processing`, `completed`, `failed`. |
| **Arabic Analyzer** | The search-engine component that resolves Arabic word roots and strips stop words. |
| **Guest** | A visitor who has not signed in. See Authorization and Access Control. |
| **Merchant** | A registered user who uploads catalogs. |
| **Administrator** | The operator of the platform, who uses a separate application with a separate login. |
| **User** | A registered merchant account: identity and shop details. See the Data entities register. |
| **Mobile number** | The account identifier, stored in E.164 form (+218…), normalized before comparison. |
| **Message** | One message inside a `Conversation`. See `docs/domain-model.md`. |
| **ContactMessage** | A message from the public contact form. See `docs/domain-model.md`. |
| **Deferred Area** | A decision area explicitly not governed by a principle yet. See Governance. |
| **ClamAV** | An open-source antivirus scanner used on uploaded files. |
| **ZIP bomb** | A small archive that expands to disproportionate bytes on decompression; rejected by the decoded-size cap. |
| **Macro stripping** | Removing executable document macros before extraction. |
| **DLQ** | Dead-letter queue for jobs that exhaust retries. |
| **Reprocess** | The administrator's re-run of the file-processing pipeline over a catalog's stored bytes, from the admin Files page (for example after an extraction fix). Distinct from a retry, which the merchant triggers for a failed job. |
| **Retry** | The merchant's re-enqueue of a failed file's processing job, without re-uploading the bytes. |
| **Wafar** | The platform's trade name, written «Wafar» (وَفَّر). The mandatory diacritics bind the Arabic form «وَفَّر»; the Latin «Wafar» carries no diacritics. |
| **SBOM** | Software Bill of Materials produced per build. |
| **Presigned multipart upload** | Direct-to-object-storage upload in parts, avoiding buffering through the API. |
| **Merchant isolation** | A tenant is a merchant account. A merchant-reachable query path MUST NOT return another merchant's rows. |

## References

| Document | Purpose | Location |
|---|---|---|
| `Project-Technologies.txt` | The technology register's detail: exact versions, per-technology notes, and the repository trees. Mirrors Technology Standards, which wins on conflict. | Repository root. |
| `Core-Project.txt` | The product's detail: pages, roles, and the acceptance criteria the product already states. Mirrors Product Register and Product Scope, which win on conflict. | Repository root. |
| `docs/domain-model.md` | The data model's source of truth: entities, relationships, cardinality, invariants, and the owning module of each. Mirrors the Data entities register, which holds the map. | `docs/`. |
| `wafar.single.css` | The design system's values — the only permitted source of design values, composed of fourteen modules. Mirrors Design System Standards, which holds the register. | Repository root. |
| `docs/DECISIONS.md` | The record of design decisions and the reasoning behind them. | `docs/`. |
| `docs/architecture.md` | The repository layout, module map, and data-flow descriptions. | `docs/`. |
| `.specify/templates/exception-register.md` | The exception register required by Governance. | `.specify/templates/`. |
| `.specify/templates/overrides/` | Template overrides required by Single-Reference Sufficiency and by Governance. | `.specify/templates/overrides/`. |
| `.specify/memory/constitution.md` | This document. | `.specify/memory/`. |
| `ROADMAP.md` | The MVP slice order. Names and orders slices; does not design them. | Repository root. |
| `AGENTS.md` | Operating instructions for agent assistants. | Repository root. |
| `.specify/extensions.yml` | The installed extensions and the hook registry every Spec Kit command reads before and after it runs. | `.specify/`. |
| `.specify/workflows/speckit/workflow.yml` | The bundled workflow that runs the binding cycle in order, with its human review gates. | `.specify/workflows/speckit/`. |
| `README.md` | The contributor entry point: documentation map, workflow, and prerequisites. | Repository root. |

## Artifact Workflow and Traceability

These rules govern the shape of the Spec Kit artifacts. They are binding with
the same force as the principles above.

- Every specification MUST use stable identifiers: `FR-###`, `AC-###`, and
  `SC-###`. Identifiers MUST NOT be renumbered or reused; an item is withdrawn
  only by keeping its identifier and marking it withdrawn.
- A specification MUST carry at most three unresolved `NEEDS CLARIFICATION`
  items. More than three means the feature is not ready for planning.
- Tests, when requested by the specification's Test Coverage Request, MUST be
  written before implementation and MUST fail before implementation changes.
- Every task MUST end with `(implements FR-###, AC-###)`, or, when no
  requirement genuinely applies, `(implements Complexity Tracking: <row>)`.
- Every task MUST end in a commit; commits MUST reference the spec, plan, and
  task identifiers.
- `plan.md` Constitution Check MUST be evaluated before Phase 0 and
  re-evaluated after Phase 1 design.
- `/speckit.analyze` runs the consistency gate after `/speckit.tasks` and before implementation begins — by the engine workflow or by hand; its findings MUST be resolved before
  `/speckit.implement` starts (see Governance → Module Discipline).
- `/speckit.implement` and `/speckit.converge` MUST repeat until Converged; a
  feature reports Converged only when converge reports Converged.
- The binding cycle runs in full order: specify → clarify → plan → checklist
  → tasks → analyze → implement → converge, repeated (implement ↔ converge)
  until converge reports Converged.
- Every ADR first named by a plan MUST be reaffirmed in that plan's
  Constitution Check.
- All artifacts and tools that read or write them MUST use UTF-8. A file that merely decodes as UTF-8 but was written after a UTF-8-as-Windows-1252 mis-encoding (mojibake) is a defect of the same kind: decodability does not prove the characters are correct, and Arabic content MUST be visually verified legible.
- Every search index MUST have exactly one mapping owner.
- Every sub-spec MUST begin with `**Input**: Parent roadmap: ROADMAP.md → R#`.

## Product Fact Clarifications

- Contact form fields are exactly `name`, `phone`, and `body`.
- The platform's trade name is «Wafar» (وَفَّر); the mandatory diacritics
  bind the Arabic form «وَفَّر», and the Latin «Wafar» carries none.
- "Reports" means the statistics and summaries the administrator Dashboard
  shows over entities already in scope. Advanced reports
  (تقارير متقدمة) are out of scope until specified.
- The cart page's Arabic name is «سلة المشتريات». It is a personal bookmark
  list only: it carries no price, no quantity, and no checkout state, even
  though the label is a purchase metaphor the product scope does not honour.
- **No emoji in anything a person reads.** See Principle V. Every screen of the
  public site, the merchant area, and the administrator application, and the
  body of every SMS the platform sends. Governance documents, code identifiers,
  and code comments are not covered.
- **Libya-only registration.** Every account is a Libyan mobile number on +218.
  Sign-up carries no dial-code selector, and a number outside +218 is rejected.
  The number is stored in E.164 form, and the account's city comes from the
  Libyan city list.
- **The price is in Libyan Dinar, and its separator is decimal.** `123.000` is
  123 dinar, not 123,000. The price is the amount printed in the part's own
  catalog, shown for comparison; it is not an offer, and it never enters the
  cart.
- **Registered merchants see the price; guests do not.** The price column and
  any filter or sort over it are rendered for a registered merchant only, and a
  guest's read path projects the part without them. A part with no price reads
  «بدون سعر»; a price in another currency is never converted and never stored.
- **The parts table shows every column, and hides none.** Part number, name, car
  model, original number, type, price, the supplier's name, and the cart
  control. Every column is sortable except `type`. Part number and original
  number are searched through the search field rather than chosen from a list,
  because a list of every part number in the platform is the size of the table
  itself; every other filter is a multi-select over its distinct values.
- No email address exists anywhere in the platform: no sign-up email, no
  login email, no transactional email. The mobile number in E.164 form is
  the sole account identifier.
- The platform is free to merchants: uploading and searching MUST NOT charge
  the merchant.
- When the cart reaches 99 parts, the user MUST be shown a full-cart notice.
- A message sent by a merchant is visible to the sender immediately; the
  administrator's reply is visible after a page refresh unless a live-update
  mechanism has been specified.
- CAPTCHA MUST NOT be introduced; anti-abuse for every public form is
  honeypot fields, a minimum time-to-submit, and a rate limit.
- A PWA (installable app, service worker, offline surface) MUST NOT be
  shipped. The platform is a browser catalog only.
- Every page header in the shell MUST carry the account, notifications,
  theme-toggle, and sidebar-collapse controls for an authenticated user. The
  sidebar-collapse control narrows the sidebar to its icon rail on desktop and
  opens and closes the drawer on mobile. A guest MUST see a login action instead
  of those controls. The platform logo
  sits in the sidebar header, and the quick search field lives on the Home
  page (see Product Scope). Pages without the shell — authentication, 404,
  static, and administrator pages — carry no header. The four bare-layout static
  pages — Contact, Privacy Policy, Terms of Use, and FAQ — are reached the same
  way: by a direct link or by an action on a page that carries one, and none of
  them is a sidebar item. The shell has no footer component today, so the surface
  that carries those links is a decision of the slice that first builds a shell
  page, recorded as an ADR; the reachability requirement is binding whichever
  surface that slice chooses, and an in-scope static page that no in-scope page
  links to is a defect.
- Every data table's default order is newest first, taken from the record's
  immutable creation timestamp (Schema and Migration Control). Any other order
  beyond the table's own sortable columns is a deferred area (Retrieval
  interface), owned by R5.
- The Libyan city list is one dataset, named once. Sign Up selects from it:
  every Libyan governorate, city, and area, searchable, with Libya (+218) as
  the default country. R1 records the list once as reference data of the
  `users` module and names the record in `docs/DECISIONS.md`; every later
  slice reads that record instead of writing a list of its own, and changing
  the list is an amendment to that record rather than an edit made inside a
  feature.

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
Product Scope, Product Register, Single-Reference Sufficiency, File
Processing Overview, Artifact Workflow and Traceability, and Product Fact
Clarifications. This adjudication spans all ten principles — I. Evident,
Traceable Change; II. Strict Type Safety; III. Measured Test Coverage; IV.
Accessible User Interfaces; V. Arabic-First and RTL Interfaces; VI.
Catalog-Only Scope; VII. Specification-First and Documentation Separation;
VIII. User Story Independence; IX. Design System Fidelity; X. Modular
Monolith Architecture — and every binding section named above. A SHOULD is
advisory and MUST NOT
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
the policy below, and MUST record the change durably. The sync impact report the
constitution command produces is review material for the person ratifying the
amendment: it MUST NOT be committed, because it describes the document rather
than governing it, and it restates MUSTs the document already states. The
durable record of an amendment is an entry in `docs/DECISIONS.md` naming the
version, what changed, and what deliberately did not. On every amendment,
the version stamps MUST move in the same change: the constitution's version
footer; the binding-block `constitution vX.Y.Z` strings in the spec, plan,
and checklist template overrides; the constitution-template scaffold's own
version footer; and the version stamps in `docs/architecture.md`,
`docs/domain-model.md`, `ROADMAP.md`, and `Project-Technologies.txt`. A MAJOR amendment MUST
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

### Deferred areas

The following aspects are deliberately not governed by
principles specific to them, because those decisions are not yet made. A
deferred aspect remains governed by every principle above that does not name
the deferred decision, in particular by Query Safety and Secrets and by
Schema and Migration Control:

- **Extraction algorithm**: how parts are identified within supplier document
  tables, how a source column is recognised as one canonical column, and how
  extraction correctness is verified. The canonical columns themselves are fixed
  by the Glossary, so the algorithm chooses among fixed targets rather than
  inventing them, and File Processing Rules binds what it may do with a value it
  cannot place.
- **Catalog data shape**: discharged in 2.18.0. The Glossary now fixes a part's
  canonical columns and the role of the original number, and `docs/domain-model.md`
  states the invariants over them. What remains is not deferred product scope but
  the shape below the product: column types, lengths, nullability, defaults, and
  indexes, which are the owning module's schema file and the owning feature's
  `data-model.md`, plus whether a part persists the page and row it came from,
  which is a recorded unresolved fact owned by R3.
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

**Version**: 2.18.9 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-05
