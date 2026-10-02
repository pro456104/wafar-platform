# Wafar (وفّر)

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
| `docs/architecture.md` | Repository layout, API module map, data flow. |
| `docs/DECISIONS.md` | Accepted decisions with alternatives and rationale (ADR-001 … ADR-009). |
| `wafar.single.css` | The design system's values — the only permitted source of design values. Its register is `.specify/memory/constitution.md` → Design System Standards. |
| `ROADMAP.md` | The MVP slice order. Names and orders slices; does not design them. |
| `AGENTS.md` | Operating instructions for agent assistants. |

## Prerequisites

- Node.js and pnpm (the monorepo is pnpm workspaces + Turborepo).
- The Spec Kit CLI (`specify`), which drives the specification workflow.
- Docker is optional and used only for staging parity.

## Development workflow

This repository is driven by Spec Kit. With `.specify/` present and the
`specify` CLI installed:

1. `/speckit.specify` — write the feature specification (technology-agnostic).
2. `/speckit.plan` — produce the technical plan, research, data model, and contracts.
3. `/speckit.tasks` — generate the ordered task list.
4. `/speckit.analyze` — run the cross-artifact consistency check.
5. `/speckit.implement` — execute the tasks.

Templates resolve from `.specify/templates/overrides/` first; those overrides are
the project's binding templates and must not be replaced with the core ones.

**Project-level knowledge is not a feature.** The constitution, the architecture,
the technology stack, the design system, the product definition, and the accepted
decisions live outside the feature sequence and never take a feature number. See
`AGENTS.md` §2 and `docs/DECISIONS.md` → ADR-007.

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