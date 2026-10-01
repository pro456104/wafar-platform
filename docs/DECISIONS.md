# Decisions — Wafar

This file records design decisions with their alternatives and the reasoning
behind them. The constitution names it in References and in Design System
Standards, and Documentation requires every non-trivial decision to record
what was considered and why the chosen option won.

**Record duties (Documentation rule).** Each record below is committed under
the directory that owns it (`docs/`, per the References table) and names its
owning feature. The six decisions predate every feature — they were made
during repository bootstrap on 2026-10-01 — so each record names
"none yet — repository bootstrap" as the owning feature and states the
reaffirmation duty of the first feature whose plan depends on it. When that
feature is planned, it MUST name the ADR (e.g., `ADR-003`) in its plan's
Constitution Check; from then on the record has a feature owner.

---

## ADR-001 — Monorepo with a Modular Monolith API

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** One product with three surfaces (public site, merchant area,
separate administrator application) plus a file-processing worker; the
frontend and backend must share validation schemas so the two contracts
cannot drift (Principle II). The team is small. A future extraction into
microservices should be mechanical rather than a rewrite (Principle X
rationale).

**Decision.** A single repository, managed with pnpm workspaces and
Turborepo, holding `apps/web`, `apps/admin`, `apps/api`, `apps/worker` and
`packages/shared`, `packages/db`, `packages/search`, `packages/config`. The
API is one deployable server divided into ten modules (`auth`, `users`,
`catalogs`, `parts`, `suppliers`, `bookmarks`, `notifications`, `messages`,
`support`, `admin`), each with its own routes, service, and repository;
communication between modules goes through the shared package only.

**Alternatives considered.**
- *Polyrepo (one repository per app).* Rejected: shared schemas would have to
  be published and versioned across repositories, which reintroduces exactly
  the frontend/backend drift that the shared-schema rule exists to prevent;
  cross-repo coordination also adds process with no scale benefit today.
- *Microservices from day one.* Rejected: independent deployment and scaling
  are not needed at the current scale; the operational surface (service
  discovery, per-service observability, distributed failure modes) is
  unjustified, and a modular monolith keeps extraction available later.

**Consequences.** Import boundaries must be enforced mechanically
(enforcement configuration committed with the codebase); each feature
registers its owned directories in its plan's ownership map; shared code is
promoted only after a second consumer exists. Replacing this architecture
would require a constitutional amendment (Principle X / Technology Standards).

---

## ADR-002 — Hono for the API framework

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** The API is a Modular Monolith that must serve the catalog, the
merchant area, and the administrator application; the API contract must be
documented and must not drift from the code.

**Decision.** Hono (4.13.5 per `Project-Technologies.txt`) as the API
framework, with OpenAPI documentation generated from the same code.

**Rationale.** Hono is lightweight with very high throughput on Node.js
(88,525 requests/second in the 2026 benchmarks recorded in
`Project-Technologies.txt`), first-class TypeScript support, and it keeps the
runtime portable (Node.js, Bun, Deno, and edge runtimes). Generating OpenAPI
from the same code removes the drift between hand-written documentation and
the implementation.

**Alternatives considered.**
- *Express.* Rejected: the largest ecosystem, but slower and with weaker
  built-in typing; OpenAPI support requires add-on layers that add dependency
  surface without adding product value.
- *Fastify.* Rejected: fast and schema-oriented, but the plugin ecosystem and
  third-party OpenAPI bindings broaden the dependency surface; switching
  would also require a constitutional amendment, since Technology Standards
  binds Hono.

**Consequences.** Validation stays in shared Zod schemas rather than in
framework-specific schema objects; the framework boundary is kept thin so the
choice remains replaceable in principle — but only through an amendment.

---

## ADR-003 — OpenSearch for the search engine

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** Arabic root-aware search is a core product requirement
(طرمبة → طرمبات — Principle V): a search that matches only surface forms does
not satisfy the rule. The index lifetime must align with the 90-day automatic
deletion rule, and every dependency shipped to merchants must pass the
licence test in Dependency Governance.

**Decision.** OpenSearch with its built-in Arabic analyzer (plus
`icu_analyzer` for normalization) and Index Lifecycle Management, with the
client and index mappings owned by `packages/search`.

**Rationale.** The Arabic analyzer ships with OpenSearch — no external plugin
to maintain; ILM expresses the 90-day index lifecycle natively; and the
licence is Apache 2.0, which imposes no disclosure, licensing, or relicensing
obligation on the merchant's own data or source.

**Alternatives considered.**
- *Elasticsearch.* Rejected: same lineage of technology, but the Elastic
  Licence and SSPL are on the Dependency Governance list that MUST NOT be
  introduced into a module shipped to a merchant.
- *PostgreSQL full-text search alone.* Rejected for the search surface: it
  has no root-aware Arabic analyzer, so it cannot satisfy the root-resolution
  rule without building custom analysis work that OpenSearch already ships.
- *Meilisearch / Typesense.* Rejected: simpler operations, but less control
  over Arabic analysis quality, and neither is part of the defined stack.

**Consequences.** The search index is a projection of the system of record
and is maintained by the worker; PostgreSQL remains authoritative. Search
ranking beyond the sortable columns remains a deferred area (retrieval
interface) whose ratification is recorded by the first feature that needs it.

---

## ADR-004 — better-auth without the `scim` and `sso` modules

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** Authentication MUST use the designated proven library, and
custom authentication code is prohibited. The optional `scim` and `sso`
modules carry tracked advisories: CVE-2026-67330 in `@better-auth/scim`
(authorization bypass) and CVE-2026-80192 in `@better-auth/sso`
(`Project-Technologies.txt`, better-auth 1.6.14). The product's users are
Libyan merchants who sign in with email and password; enterprise SSO and
directory provisioning are not product requirements.

**Decision.** better-auth, core modules only. The `scim` and `sso` modules
are NOT enabled — the constitution requires that they MUST NOT be enabled
while the CVEs are tracked.

**Alternatives considered.**
- *Enabling `scim`/`sso` anyway.* Rejected: exploitable authorization
  surface with zero current product need.
- *Custom authentication.* Rejected: prohibited by the constitution, and a
  security-critical surface the project should not own.
- *Deferring the decision.* Rejected: the first feature that exposes an
  authentication endpoint must already enforce rate limits and secure
  sessions, so the library decision precedes the first feature.

**Consequences.** Authentication features record, under Constitution
Mandated Values: the password hashing cost factor (Argon2id, bcrypt, or
scrypt); the authentication rate limits; and the session timeout and token
lifetime. CSRF protection, output encoding, and security-header tests are due
no later than the first browser-facing feature.

---

## ADR-005 — SeaweedFS for object storage

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** Uploaded supplier catalogs must be stored as objects: typically
1–4 MB, large files 10–15 MB, exceptionally up to 20 MB, hard maximum 100 MB,
up to 100 files per user, deleted automatically after 90 days. The store must
pass the Dependency Governance licence test and have an active upstream.

**Decision.** SeaweedFS (v4.48 per `Project-Technologies.txt`), Apache 2.0,
as the object store for catalog files.

**Rationale.** SeaweedFS handles very large numbers of small files
efficiently — exactly the product's workload — carries the Apache 2.0 licence
with no data-disclosure obligation, and remains actively developed. MinIO
development was discontinued in April 2026, and its licence is AGPLv3, which
the Dependency Governance list forbids in a module shipped to a merchant.

**Alternatives considered.**
- *MinIO.* Rejected on both counts: discontinued upstream (April 2026) and
  AGPLv3 — a licence obligation the constitution's list excludes from
  merchant-shipped modules.
- *Plain filesystem volume on the application host.* Rejected: it weakens the
  backup/restore and staging-parity obligations (Deployment and
  Observability) and removes the storage boundary that keeps file bytes out
  of the database path.

**Consequences.** The file-ingestion internals — exact content-type
validation, object-storage layout, and cross-merchant isolation — remain a
deferred area; the first feature that implements ingestion records the
missing rules and their ratification in its plan's Constitution Check.

---

## ADR-006 — Dark mode by default

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** The design system is one file, `wafar.single.css`, composed of
fourteen modules, and it is the only permitted source of design values.
Principle IX fixes the default mode, the palette, and the toggle's location.

**Decision.** Every page renders in dark mode by default; light mode is used
only when the user has explicitly chosen it; the mode toggle sits in the
header, adjacent to the notifications icon. All colours, spacing, motion, and
elevation values come from the design system tokens (`--brand-600`,
`--accent-500`, dark background `#0a0a0a`, surface `#121416`, primary text
`#fafafa`).

**Rationale.** Dark-first is the product's visual identity and is what the
design system's contrast scales were built and verified against; a single
default prevents the two-token drift that appears when both modes are treated
as equal first-class outputs. AA contrast holds in both modes per the design
system's accessibility rules.

**Alternatives considered.**
- *Light mode as default.* Rejected: contradicts Principle IX and the design
  system's dark-first tuning.
- *Following the operating system's preference automatically.* Rejected: the
  rule is an explicit user choice; the system default is dark, not "whatever
  the device prefers".
- *No toggle at all.* Rejected: users must be able to choose light
  explicitly, and the toggle's position is specified in the design
  requirements.

**Consequences.** Every page must default to dark on first render; the
mechanism that remembers the explicit choice is decided by the implementing
feature's plan and must stay inside the design system's rules.

---

## ADR-007 — Project-level knowledge lives outside the feature sequence

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** Spec Kit's core workflow loads only two things into a feature cycle:
the feature specification and `.specify/memory/constitution.md`. The knowledge
that is true for the whole product — repository and module layout, the technology
stack, the design system, the product definition, and the accepted decisions — is
not loaded by the core workflow. In a previous project this knowledge was
classified as an ordinary numbered feature (a design system appearing as feature
020). That classification makes the agent treat a project-wide rule as a piece of
work, so later features re-invent what already exists and the rules drift.

**Decision.** Project-level knowledge is recorded once, outside the feature
sequence, and is referenced by name from every feature artifact:

| Concern | Location |
|---|---|
| Engineering law, product scope, limits | `.specify/memory/constitution.md` |
| Repository and module layout | `docs/architecture.md` |
| Technology stack | `Project-Technologies.txt` |
| Design system (tokens and components) | `wafar.single.css` |
| Product definition (roles, pages, acceptance criteria) | `Core-Project.txt` |
| Accepted decisions | `docs/DECISIONS.md` |
| Slice order for the MVP | `ROADMAP.md` |

No project-level concern receives a feature number. Enforcement uses the layers
Spec Kit actually guarantees, without amending the constitution:

1. `.specify/memory/constitution.md` is loaded by every core command — the core
   workflow reads it in specify, plan, tasks, implement, analyze, clarify,
   checklist, and converge.
2. The three feature templates in `.specify/templates/overrides/` carry the
   binding "Project Context Sources" that name these files. The override stack
   resolves them as the top layer with `strategy: replace`, and the setup scripts
   materialize them into every feature (`create-new-feature.ps1`,
   `setup-plan.ps1`, `setup-tasks.ps1`), so each specification, plan, and task
   list is written against them.
3. `AGENTS.md` and `.clinerules/project-context.md` state the same duty to the
   agent outside the feature cycle.

**Alternatives considered.**
- *Amend the constitution to add a "read these files" MUST.* Rejected: the
  constitution is loaded already, but a rule there would put file-reading
  mechanics into the document that governs principles, and would require an
  amendment for every change to the source list. The override templates are the
  artifact-level layer for exactly this.
- *Register an `optional: false` extension hook per command.* Rejected: a hook
  executes a command; it does not itself load files, and a hook naming a command
  no installed extension provides would be broken. The general hooks in
  `.specify/extensions.yml` are therefore left empty.
- *Restate the stack, architecture, and design rules inside each feature plan.*
  Rejected: this is the repetition the decision exists to remove; it is what
  produced the drift already observed between the artifacts' pinned versions.

**Consequences.** A feature named after a project-level concern is a
classification error and MUST NOT be created. The specification template binds
product-level sources only, because naming technical sources in a specification
would breach Principle VII; the plan template binds every source. When the
constitution is amended, `docs/architecture.md` and the override templates MUST
be updated in the same change — they name its version, and a stale reference is a
drift defect.
