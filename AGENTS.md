# AGENTS.md — Wafar

Operating instructions for agent assistants working in this repository.

**Authority.** `.specify/memory/constitution.md` supersedes this file. Where the
two conflict, the constitution wins and you MUST report the conflict instead of
following this file. Precedence, from the constitution's Governance section:
constitution → agent instruction files (this file) → README → any other guidance.

## 1. What this repository is

Wafar is an Arabic-first (RTL) parts-catalog platform for Libyan merchants. It is
a search-and-display catalog: no selling, no buying, no payment, and no
user-to-user chat. A merchant's "cart" is a personal bookmark list. The product
scope is fixed by the constitution's Product Scope section; do not extend it.

## 2. Project-level knowledge is not a feature

This knowledge is read **by name**. It is never re-created as a numbered feature,
and a feature artifact references it rather than restating it.

| Concern | Source of truth |
|---|---|
| Engineering law, product scope, limits | `.specify/memory/constitution.md` |
| How the system is built (layout, module map, data flow) | `docs/architecture.md` |
| Approved technology stack — the register | `.specify/memory/constitution.md` (Technology Standards); `Project-Technologies.txt` mirrors it |
| Design system — the register, and the only source of values | `.specify/memory/constitution.md` (Design System Standards) + `wafar.single.css` (the only permitted source of design values) |
| Product definition (roles, pages, acceptance criteria) | `Core-Project.txt` |
| Accepted decisions | `docs/DECISIONS.md` (ADR-001 … ADR-016) |
| Slice order for the MVP | `ROADMAP.md` |

**Prohibited:** creating a feature numbered after a project-level concern (for
example "020-design-system" or "019-architecture"). That is a classification
error — it makes the agent treat a project-wide rule as work, and later features
re-invent what already exists. See `docs/DECISIONS.md` → ADR-007.

## 3. Load these before writing any feature artifact

- `/speckit.specify` → the constitution (Product Scope, Product Register, Usage
  Limits, Glossary), `Core-Project.txt`, and `docs/DECISIONS.md`. **Not** the
  technical sources: a specification stays technology-agnostic (Principle VII).
- `/speckit.plan` → the constitution's registers (Technology Standards, Design
  System Standards, Product Register) plus `docs/architecture.md`,
  `wafar.single.css`, and `docs/DECISIONS.md`. The plan is the only artifact
  that carries technical detail, and its Ownership Map must match
  `docs/architecture.md`.
- `/speckit.tasks` → `plan.md`, plus `docs/architecture.md` and
  `docs/DECISIONS.md`. Every path a task touches must appear in the plan's
  ownership map.
- `/speckit.implement` → `plan.md`, `tasks.md`, and the constitution.

The three feature templates in `.specify/templates/overrides/` carry this duty as
binding text. They resolve as the top layer with `strategy: replace`; do not
replace them with the core templates.

## 4. Language and layout

- User-facing text: Arabic, `<html dir="rtl" lang="ar">` on every page.
- Code identifiers, code comments, commits, and governance text: English.
- Numerals rendered to the user: Latin (1234567890), never Arabic-Indic.
- Logical CSS properties only (`margin-inline-start`, not `margin-left`).

## 5. Workflow

`/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.analyze` →
`/speckit.implement`, repeating `/speckit.implement` ↔ `/speckit.converge`
until converge reports Converged (ADR-013).

Installed extensions: `assess` (idea triage before specifying) and `bug` (bug
triage). Templates resolve from `.specify/templates/overrides/` first, then
presets, then extensions, then core.

## 6. Before reporting a change complete

- Every task ends with `(implements FR-###, AC-###)` or, when no requirement
  genuinely applies, `(implements Complexity Tracking: <row>)`.
- Every deviation is recorded in the plan's Complexity Tracking table with an
  owner and a review date.
- Documents affected by the change are updated in the same change.
- Non-trivial decisions are recorded in `docs/DECISIONS.md` as an ADR.