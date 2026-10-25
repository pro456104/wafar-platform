# Wafar (وَفَّر)

An Arabic-first (RTL) platform that turns supplier parts catalogs (Excel, PDF,
Word) into one searchable catalog for Libyan merchants. It is a catalog: it does
not sell, buy, process payment, or host user-to-user chat.

**Status**: repository bootstrap. No application code exists yet.

## Documentation map

| Document | Purpose |
|---|---|
| `.specify/memory/constitution.md` | Engineering law, product scope, and limits. Supersedes every other document. |
| `Core-Project.txt` | Product definition: roles, permissions, pages, file processing, acceptance criteria. |
| `Project-Technologies.txt` | Mirror of the approved technology register. The register itself is `.specify/memory/constitution.md` → Technology Standards. |
| `docs/CHANGELOG-mirror.md` | The mirror's historical amendment blocks, split out of `Project-Technologies.txt` (ADR-075). History, not a source of rules. |
| `docs/architecture.md` | Repository layout, API module map, data flow. |
| `docs/domain-model.md` | The data model: entities, relationships, cardinality, invariants, and the module that owns each. |
| `docs/capacity-model.md` | The six-month load and ingestion envelope, the quota model, the deployment shape, and the verification plan (ADR-117, ADR-119, ADR-121, ADR-122). Planning authority; the constitution wins on every conflict. |
| `docs/pdf-sample-analysis.md` | The preliminary 19-file PDF sample evidence: size, pages, text-layer quality, rows per page, OCR benchmark, and extraction problems (ADR-119). Evidence, not a source of rules. |
| `docs/DECISIONS.md` | The decision register's index and reading protocol (ADR-001 … ADR-126); the records with their alternatives and rationale live in `docs/decisions/volume-NN.md`. |
| `ROADMAP.md` | The MVP slice order. Names and orders slices; does not design them. |
| `AGENTS.md` | Operating instructions for agent assistants. |
| `governance-drift-check.mjs` | The committed read-only drift check: the two version sources, every live ADR range string, the decision-register volumes and their caps, the upstream manifest hashes, the two integrations, the structural counts the governance text states in prose, the ADR index's constitution-version column, and the absence of the removed stylesheet and its constitution section. Runs on commit via `.githooks/pre-commit`; run it directly with `node governance-drift-check.mjs`. |

## Prerequisites

- Node.js — the version `.nvmrc` pins (Node 22 LTS) — and pnpm (the monorepo is
  pnpm workspaces + Turborepo).
- The Spec Kit CLI (`specify`), which drives the specification workflow.
- Docker is optional and used only for staging parity.

## Development workflow

This repository is driven by Spec Kit. With `.specify/` present and the
`specify` CLI installed:

1. `/speckit.constitution` — amend or ratify the project constitution.
2. **Automatic: `/speckit.git.feature`** — the `git` extension's mandatory
   `before_specify` hook creates a sequentially numbered feature branch
   (`001-feature-name`, matching `feature_numbering: sequential` in
   `init-options.json` at `.specify/init-options.json` and ADR-015) and switches
   to it before specification.
   **Optional:** `speckit.assess.intake` (the `assess` extension) may prompt
   before specification to normalize a raw idea into an intake note.
3. `/speckit.specify` — write the feature specification (technology-agnostic).
4. `/speckit.clarify` — resolve ambiguities in the specification.
5. `/speckit.plan` — produce the technical plan, research, data model, and contracts.
6. `/speckit.checklist` — review the feature's requirements checklist.
7. `/speckit.tasks` — generate the ordered task list.
8. `/speckit.analyze` — run the cross-artifact consistency check.
9. `/speckit.implement` — execute the tasks.
10. `/speckit.converge` — verify the implementation against the artifacts;
    repeat steps 9–10 until it reports Converged (see ADR-013).

Templates resolve from `.specify/templates/overrides/` first; those overrides are
the project's binding templates and must not be replaced with the core ones.

**Governance drift check.** `node governance-drift-check.mjs` (repository root)
verifies the invariants the governance set cannot verify by discipline: the two
version sources including the amended date, every live `ADR-001 … ADR-126` range
string (in the required files, in the top-level `docs/` files, in the two Arabic
mirrors, in the template overrides, and in the feature specifications), every ADR
index row's anchor against its heading in the volume that holds it and every
heading against the index, every volume's ADR continuity and the volume and index
size caps, every `ADR-NNN` reference against the index, the ADR list in
`Project-Technologies.txt`'s header, the upstream manifest hashes in both
directions, the two integrations' byte-identity (their command directories, and
each integration manifest against the tree it records and that integration's whole
command directory), the absence of the removed stylesheet and its constitution
section, the integration topology across `integration.json`, `init-options.json`, the
integration directories and the bundled workflow, the
structural counts the governance text states in prose, the ADR index's
constitution-version column against the footer's version, every ADR enumeration
against the one the check's own header carries, the contiguity of
`Project-Technologies.txt`'s header list, the Constitution Mandated Values count,
every entity's owning module across the register and the domain model, and every
specification's `FR-###` / `AC-###` / `SC-###` integrity. It is read-only, adds no
dependency, and exits non-zero on
drift (ADR-071, ADR-072, ADR-073, ADR-074, ADR-075, ADR-080, ADR-082, ADR-083, ADR-086, ADR-088, ADR-092, ADR-093, ADR-096, ADR-097, ADR-098, ADR-099, ADR-100, ADR-101, ADR-102, ADR-103, ADR-104, ADR-105, ADR-106, ADR-125).
It runs on commit through the committed `.githooks/pre-commit` hook; enable it per
clone with `git config core.hooksPath .githooks`.

**Project-level knowledge is not a feature.** The constitution, the
architecture, the data model, the technology stack, the UI foundation rule, the
product definition, and the accepted decisions live outside the feature
sequence and never take a feature number. See `AGENTS.md` §2 and
`docs/DECISIONS.md` → ADR-007.

**The data model has one authority.** `docs/domain-model.md` holds the logical
model — entities, relationships, invariants, owning module. The constitution's
Product Register maps it. Column types and the physical schema are not in
either: they are the owning module's `packages/db/schema/<module>.ts` and the
owning feature's `specs/[###-feature]/data-model.md`. A feature that adds an
entity, a relationship, or an invariant amends the register and records an ADR;
a feature that adds a column owns it in its own data model and migration.

## Setup, testing, and deployment

**Not yet applicable — no application code exists.** The `apps/` and `packages/`
workspaces defined in `docs/architecture.md` are created by the first feature
that owns them, and that feature's plan records the ownership map.

By the constitution's Documentation rule, the first feature that creates the
workspace MUST fill the three sections below, from this file alone, so that a new
contributor can run the project locally and run its full test suite without
asking a person:

- **Setup** — install command, required environment variables, and local services.
- **Testing** — how to run unit, integration, and end-to-end tests.
- **Deployment** — how development, staging, and production are built and shipped.

Until then, the entry point for contributors is the development workflow above.
