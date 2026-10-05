# Architecture — Wafar

This document records the repository layout, the API module map, and the data
flow. Its sources of authority are `.specify/memory/constitution.md` (v2.18.9),
whose Technology Standards and Design System Standards are the registers, and
`Project-Technologies.txt`; where this document and the constitution disagree,
the constitution wins. The data model's entities and their owning modules are
stated in `docs/domain-model.md`, which this document does not restate.

**Status**: baseline for a repository where production code does not exist yet.
Directories are created by the first feature that owns them, and every
directory holding production code is registered in that feature's plan under
Project Structure > Ownership Map (Project Structure and Debt Control).

## 1. Repository layout (Monorepo)

```text
wafar/
├── apps/
│   ├── web/              # Public site + merchant's authenticated area (Nuxt 4); layouts: shell vs bare (auth, 404, static, and contact pages); the admin app carries its own independent shell
│   ├── admin/            # Administrator's separate application, separate login (Nuxt 4)
│   ├── api/              # The API server (Hono, Modular Monolith)
│   └── worker/           # File-processing worker (BullMQ processors)
├── packages/
│   ├── shared/           # Validation schemas + types + contracts (Zod) shared by frontend and backend
│   ├── db/               # Database schema + migrations (Drizzle), single migration mechanism
│   ├── search/           # Search client + index mappings (OpenSearch)
│   └── config/           # ESLint + Stylelint + Prettier + TypeScript shared configuration
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

Binding rules that shape this layout:

- **Monorepo tooling**: pnpm with Turborepo (Technology Standards); shared
  configuration lives in `packages/config`, pinned versions with a committed
  lockfile (Dependency Governance).
- **Shared validation schemas**: frontend and backend use the same schemas
  from `packages/shared`, so the two contracts cannot drift (Principle II).
- **Import boundaries**: enforced mechanically, not by review alone; a module
  MUST NOT import from a layer above it or from another feature's private
  directory; a presentation layer MUST NOT import migrations, connection
  strings, or a database client (Project Structure and Debt Control).
- **Promotion rule**: code is promoted into a shared package only after a
  second consumer exists.

## 2. Module map — `apps/api`

`apps/api` is a single deployable server divided into modules (Principle X).
Each module has its own `routes`, `service`, and `repository`. Communication
between modules goes through the shared package — never through a direct
import from one module to another.

| Module | Baseline responsibility | Notes |
|---|---|---|
| `auth` | Sign-up, sign-in/out, password recovery, sessions. | Implemented with the designated proven library with `scim` and `sso` disabled (Identity, Authentication, and Session Policy). Password hashing, session timeout, and auth rate limits are recorded per plan in Constitution Mandated Values. Sign-in, registration, and password-recovery responses never reveal whether an account exists; after five consecutive failed sign-in attempts the account locks for fifteen minutes. Every session is revocable server-side, including a "sign out everywhere" operation, and browser-stored tokens are revocable on password change. Registration and contact forms are protected by a honeypot field, a minimum time-to-submit, and a per-client rate limit; CAPTCHA is never used. The administrator account is created by a seeded CLI command with a forced password change at first sign-in. |
| `users` | Merchant accounts and profile data; account edits. | Only the account's owner edits it; no user may delete an account (roles: see Product Register in `.specify/memory/constitution.md`). |
| `catalogs` | Uploaded supplier files: metadata (supplier name, issue date, upload date, expiry date), processing status, the `first_page_metadata_incomplete` flag, retention, and the pointer to the stored bytes. | Status is exactly one of `uploaded`, `processing`, `completed`, `failed`; `first_page_metadata_incomplete` is a boolean flag and never a fifth status; automatic deletion after 90 days; duplicates rejected by content hash (File Processing Overview). |
| `parts` | Extracted part rows: the six canonical columns the constitution's Glossary fixes for a part (`Glossary` → `Part`), including the price its own catalog printed. The parts table additionally shows the supplier's name, which is read through the `suppliers` module and is not a part column. | A part belongs to exactly one catalog; merchants cannot edit or delete parts, and cannot edit a price — the administrator does (Authorization and Access Control). The price is per catalog, in Libyan Dinar, and every guest-reachable read path projects the part without it. |
| `suppliers` | The supplier named on a catalog's first page, stored in its normalised form, and its associations to catalogs. | One supplier may appear in many catalogs. Normalisation makes two spellings of one name compare equal; it merges nothing, and only the administrator merges (Glossary, File Processing Rules). |
| `bookmarks` | The "cart": a merchant's personal bookmark list of parts. | Carries no price, no quantity, and no checkout state; maximum 99 parts; capacity is enforced server-side (Principle VI, Usage Limits). |
| `notifications` | Processing-completed/failed notices and administrative messages; read state. | Failed processing presents a retry action. |
| `messages` | The single conversation thread between a merchant and the administrator. | Direct user-to-user messaging is prohibited (Principle VI). |
| `support` | Support content and assistance flows: FAQ, privacy policy, terms of use; contact intake that reaches the administrator. | Public pages from Product Scope. |
| `admin` | Administrator operations: users, files (review/delete/reprocess), suppliers, parts (edit/add), message replies, broadcasts, settings, contact messages. | Every administrator operation is recorded in the append-only audit log (Authorization and Access Control). |

Cross-cutting rules for every module:

- Exactly one responsibility per module; business rules MUST NOT be duplicated
  across modules or layers, and circular imports are prohibited.
- Every table is owned by exactly one module; no module outside the owner may
  read or write that table directly.
- Every read and write of merchant-owned data is merchant-scoped at a single
  shared entry point - the same entry point the authorization model will use
  to resolve permissions once ratified (Schema and Migration Control;
  Authorization and Access Control). A tenant is a merchant account: the
  scoping column is `user_id`, there is no separate tenant entity, and
  platform-wide tables carry no such column. The authorization model is a
  deferred area: the first feature that implements it records the missing
  rules and their ratification in its plan.
- A production source file SHOULD NOT exceed 500 non-empty lines; a module
  has one responsibility, and the count does not replace that rule.

## 3. Data flow

The canonical chain is **web → api → PostgreSQL for the system of record; large file bytes go web → SeaweedFS directly (presigned multipart); processing runs api → queue → worker → (PostgreSQL, OpenSearch)**:

```text
┌─────────────────────────────────────────────────────────────┐
│ Surfaces                                                    │
│  apps/web  (public site + merchant area, RTL, dark default) │
│  apps/admin (separate application, separate login)          │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS, schema-validated JSON contracts
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ apps/api — Hono, Modular Monolith                           │
│ auth · users · catalogs · parts · suppliers · bookmarks ·   │
│ notifications · messages · support · admin                  │
└──────┬───────────────────┬─────────────────┬────────────────┘
       │                   │                 │
   system of record     read model        file bytes
       ▼                   ▼                 ▼
 packages/db          packages/search     SeaweedFS
 (PostgreSQL 16+)     (OpenSearch +       (object storage)
       ▲               Arabic analyzer,
       │               ILM 90 days)
       │                   ▲
       │                   │ index writes
┌──────┴───────────────────┴──────────────────────────────────┐
│ apps/worker — BullMQ processors                             │
│ extract-parts → normalize → deduplicate → index-parts        │
└───────────────────────▲─────────────────────────────────────┘
                        │ jobs
              queue (BullMQ on Redis)
                        ▲ enqueued after upload
                        └── apps/api (catalogs module)
```

1. **web → api.** Every visitor and merchant action becomes an API request
   with a schema-validated contract; the public site and the admin application
   use the same modules.
2. **api → db.** PostgreSQL is the system of record. All writes and every
   authoritative read go through the owning module's repository, merchant-scoped
   at the single shared entry point.
3. **db → search.** The parts listing is served from the search index, which
   mirrors catalog data derived from the system of record. PostgreSQL remains
   authoritative; the index is a projection. The index uses the Arabic
   analyzer (root-aware search) and Index Lifecycle Management aligned with
   the 90-day auto-deletion rule, and search results follow the p95 < 1 s
   budget (Usage Limits). The projection is not one shape for everyone: a guest's
   read path projects a part without its price, through an allowlist of its own,
   so the price is absent from the response rather than hidden by the
   presentation layer (Principle VI, Query Safety and Secrets).
4. **worker → db and search.** The worker is what keeps the projection current: it
   consumes queued jobs, extracts and normalizes parts, then writes both the
   catalog status in the system of record and the parts in the search index.
   Normalisation assigns every extracted value to the canonical column the
   constitution's Glossary fixes, with no manual mapping step and no question put
   to the merchant. The canonical set is complete for a parts table, so a value
   that belongs to no canonical column is part of no stored column and is not
   stored (File Processing Rules).
   The pipeline's canonical step order is binding as a single sequence (File
   Processing Overview): upload → storage and content hash → duplicate check →
   first-page extraction → queue → worker pipeline → status update →
   notification. Content safety runs in order before a file is processed —
   magic-byte validation, ClamAV scan, decoded-size cap, macro stripping — and
   a file failing any of them is rejected and never stored or processed. The
   transport for a large upload is a presigned multipart stream to object
   storage; the API does not buffer the file in memory.
5. **Back to the user.** Status changes and administrative messages surface as
   notifications; a failed file presents a retry action that does not require
   re-uploading bytes.

Worker durability (Deployment and Observability): BullMQ jobs carry bounded
retries with exponential backoff, a dead-letter queue, a per-worker concurrency
cap, and a periodic sweep that removes temporary workspace files. A job that
exhausts its retries surfaces `failed` to the catalog and to the user, which is
the same retry action item 5 describes.

Read/write notes:

- Filters offered by the parts table: a search field over part number and
  original number (partial match), multi-select filters over car model, type,
  catalog file, and supplier (no selection means every supplier), and a price
  range (minimum and maximum); pagination 20/50/100; column sorting on every
  column except `type`; `?file=<id>` filters by catalog (Product Scope). The
  price column, and any filter or sort over it, are rendered for a registered
  merchant only. Search ranking beyond the sortable columns is a deferred area.
- Sort and projection columns come from the explicit allowlist mapped to real
  columns (Query Safety and Secrets).

## 4. Packages

| Package | Role | Key rules |
|---|---|---|
| `packages/shared` | Validation schemas, types, and contracts shared between frontend and backend. | Single source of the two contracts (Principle II); promoted code only after a second consumer exists. |
| `packages/db` | Database schema and migrations. | One migration tool only; every migration a single reversible step; destructive changes split into expand/backfill/contract (Schema and Migration Control). |
| `packages/search` | Search client and index mappings. | Arabic analyzer; ILM aligned with the 90-day deletion; one mapping owner per index. |
| `packages/config` | ESLint, Stylelint, Prettier, TypeScript configuration shared by all workspaces. | Dependency and tooling changes follow Dependency Governance. Stylelint + ESLint fail the build on physical direction properties and on any colour, radius, shadow, duration, or z-index value that does not reference a declared token in `wafar.single.css` — enforced by the committed configuration, not a review comment (Design System Standards). |

## 5. Environments and operations

- Three environments: development, staging, production. Staging runs the same
  application version, configuration values, and migration state as
  production; scale is the only permitted difference. A migration is applied
  and its rollback exercised on staging before production needs it.
- Every deployed service exposes a health check that verifies the dependencies
  it actually uses; structured logs carry a correlation identifier; logs never
  contain secrets, session tokens, or personal data.
- RTO and RPO are stated numerically per plan in Constitution Mandated Values;
  backups are automated, encrypted, and restored into a clean environment at
  least once per quarter.
- Staging holds no production personal data: seeded or anonymised datasets
  only (pg_anonymize or equivalent).
- Merchant isolation is verified by a query-path test that fails the build if
  any merchant-reachable path can return another merchant's rows.
- Metrics are collected for p95 request latency, search p95, processing
  success rate, and queue depth, with alerts when a budget is breached; the
  correlation identifier runs end to end.
- Public HTTP APIs are versioned in the path (`/api/v1`); a deprecation
  announces removal at least one release ahead and is recorded as an ADR.
- Each build produces an SBOM and runs a vulnerability/SAST scan (Semgrep OSS
  or equivalent) whose failures block release.
- Each web surface carries a Lighthouse budget (LCP, INP, CLS) asserted by
  Lighthouse CI on at least the public Parts and Home pages. The two latest
  major versions of Chrome, Edge, Firefox, and Safari are supported.

## 6. Governance pointers

- Constitution: `.specify/memory/constitution.md` (v2.18.9) — principles I–X and
  the binding sections (including File Processing Overview, Product Scope, and
  Deferred areas).
- Decisions and their rationale: `docs/DECISIONS.md` (ADR-001 … ADR-053; the
  index table is at the top of that file).
- Data model: `docs/domain-model.md` — the entities, their relationships and
  invariants, and the owning module of each. This document names the modules;
  that document explains what each one owns. Neither repeats the other.
- Design system: `wafar.single.css` (single source of truth, fourteen modules).
- Technology stack: `Project-Technologies.txt`; product scope and roles:
  `Core-Project.txt`.
- Deferred areas that touch this architecture: extraction algorithm; file
  ingestion internals; authorization model; retrieval interface. Catalog data
  shape was discharged on 2026-10-05 (ADR-040): the canonical columns are fixed,
  and what remains is the shape below the product, which is the schema file and
  the feature's `data-model.md`. The first feature that implements a deferred
  area MUST record, in its plan's Constitution Check, which rules are still
   missing and when they will be ratified. The open product facts that touch this
   architecture — the message sender's representation, the conversation's
   administrator reference, whether an administrator is a distinct entity,
   `expires_at`, notification retention, where platform settings are stored, and
   how a multi-separator printed price is read — are listed in
   `docs/domain-model.md` → Unresolved facts, each with
   the slice that must decide it. The contact-message path was resolved
   2026-10-03 by ADR-028 (a dedicated "Contact messages" administrator page), and
   ADR-053 settled which tables are merchant-scoped.

