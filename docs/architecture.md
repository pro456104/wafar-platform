# Architecture — Wafar

This document records the repository layout, the API module map, and the data
flow. Its sources of authority are `.specify/memory/constitution.md` (v2.6.0)
and `Project-Technologies.txt`; where this document and those disagree, those
win.

**Status**: baseline for a repository where production code does not exist yet.
Directories are created by the first feature that owns them, and every
directory holding production code is registered in that feature's plan under
Project Structure > Ownership Map (Project Structure and Debt Control).

## 1. Repository layout (Monorepo)

```text
wafar/
├── apps/
│   ├── web/              # Public site + merchant's authenticated area (Nuxt 4)
│   ├── admin/            # Administrator's separate application, separate login (Nuxt 4)
│   ├── api/              # The API server (Hono, Modular Monolith)
│   └── worker/           # File-processing worker (BullMQ processors)
├── packages/
│   ├── shared/           # Validation schemas + types + contracts (Zod) shared by frontend and backend
│   ├── db/               # Database schema + migrations (Drizzle), single migration mechanism
│   ├── search/           # Search client + index mappings (OpenSearch)
│   └── config/           # ESLint + Prettier + TypeScript shared configuration
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

| Module | Baseline responsibility (proposed) | Notes |
|---|---|---|
| `auth` | Sign-up, sign-in/out, password recovery, sessions. | Implemented with the designated proven library with `scim` and `sso` disabled (Identity, Authentication, and Session Policy). Password hashing, session timeout, and auth rate limits are recorded per plan in Constitution Mandated Values. |
| `users` | Merchant accounts and profile data; account edits. | Only the account's owner edits it; no user may delete an account (role matrix). |
| `catalogs` | Uploaded supplier files: metadata (supplier name, issue date, upload date, expiry date), processing status, retention, file bytes pointer. | Status is exactly one of `uploaded`, `processing`, `completed`, `failed`; automatic deletion after 90 days; duplicates rejected by content hash (File Processing Overview). |
| `parts` | Extracted part rows: part number, name, brand, car model, description. | A part belongs to exactly one catalog; merchants cannot edit or delete parts — the administrator does (Authorization and Access Control). |
| `suppliers` | The supplier named on a catalog's first page, and its associations to catalogs. | One supplier may appear in many catalogs (Glossary). |
| `bookmarks` | The "cart": a merchant's personal bookmark list of parts. | Carries no price and no quantity; maximum 99 parts; capacity is enforced server-side (Principle VI, Usage Limits). |
| `notifications` | Processing-completed/failed notices and administrative messages; read state. | Failed processing presents a retry action. |
| `messages` | The single conversation thread between a merchant and the administrator. | Direct user-to-user messaging is prohibited (Principle VI). |
| `support` | Support content and assistance flows: FAQ, privacy policy, terms of use; contact intake that reaches the administrator. | Public pages from Product Scope. |
| `admin` | Administrator operations: users, files (review/delete/reprocess), suppliers, parts (edit/add), message replies, broadcasts, settings. | Every administrator operation is recorded in the append-only audit log (Authorization and Access Control). |

Cross-cutting rules for every module:

- Exactly one responsibility per module; business rules MUST NOT be duplicated
  across modules or layers, and circular imports are prohibited.
- Every table is owned by exactly one module; no module outside the owner may
  read or write that table directly.
- Every read and write of tenant-owned data is tenant-scoped at a single
  shared entry point — the same entry point the authorization model will use
  to resolve permissions once ratified (Schema and Migration Control;
  Authorization and Access Control). The authorization model is a deferred
  area: the first feature that implements it records the missing rules and
  their ratification in its plan.
- A production source file SHOULD NOT exceed 500 non-empty lines; a module
  has one responsibility, and the count does not replace that rule.

## 3. Data flow

The canonical chain is **web → api → db → search → worker**:

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
│ extract → normalize → deduplicate → index                   │
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
   authoritative read go through the owning module's repository, tenant-scoped
   at the single shared entry point.
3. **db → search.** The parts listing is served from the search index, which
   mirrors catalog data derived from the system of record. PostgreSQL remains
   authoritative; the index is a projection. The index uses the Arabic
   analyzer (root-aware search) and Index Lifecycle Management aligned with
   the 90-day auto-deletion rule, and search results follow the p95 < 1 s
   budget (Usage Limits).
4. **search → worker.** The worker is what keeps the projection current: it
   consumes queued jobs, extracts and normalizes parts, then writes both the
   catalog status in the system of record and the parts in the search index.
   The file-processing sequence (upload → storage + hash → duplicate check →
   first-page extraction → queue → worker pipeline → status update →
   notification) is binding as a single sequence (File Processing Overview).
5. **Back to the user.** Status changes and administrative messages surface as
   notifications; a failed file presents a retry action that does not require
   re-uploading bytes.

Read/write notes:

- Filters offered by the parts table: part number, brand, car model, catalog
  file, supplier; pagination 20/50/100; column sorting; `?file=<id>` filters
  by catalog (Product Scope). Search ranking beyond the sortable columns is a
  deferred area.
- Sort and projection columns come from the explicit allowlist mapped to real
  columns (Query Safety and Secrets).

## 4. Packages

| Package | Role | Key rules |
|---|---|---|
| `packages/shared` | Validation schemas, types, and contracts shared between frontend and backend. | Single source of the two contracts (Principle II); promoted code only after a second consumer exists. |
| `packages/db` | Database schema and migrations. | One migration tool only; every migration a single reversible step; destructive changes split into expand/backfill/contract (Schema and Migration Control). |
| `packages/search` | Search client and index mappings. | Arabic analyzer; ILM aligned with the 90-day deletion; one mapping owner per index. |
| `packages/config` | ESLint, Prettier, TypeScript configuration shared by all workspaces. | Dependency and tooling changes follow Dependency Governance. |

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

## 6. Governance pointers

- Constitution: `.specify/memory/constitution.md` (v2.6.0) — principles I–X and
  the binding sections (including File Processing Overview, Product Scope, and
  Deferred areas).
- Decisions and their rationale: `docs/DECISIONS.md`.
- Design system: `wafar.single.css` (single source of truth, fourteen modules).
- Technology stack: `Project-Technologies.txt`; product scope and roles:
  `Core-Project.txt`.
- Deferred areas that touch this architecture: extraction algorithm; catalog
  data shape; file ingestion internals; authorization model; retrieval
  interface. The first feature that implements one MUST record, in its plan's
  Constitution Check, which rules are still missing and when they will be
  ratified.
