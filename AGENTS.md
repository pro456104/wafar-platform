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
| The data model (entities, relationships, invariants, owning module) | `docs/domain-model.md` |
| Approved technology stack — the register | `.specify/memory/constitution.md` (Technology Standards); `Project-Technologies.txt` mirrors it |
| Design system — the register, and the only source of values | `.specify/memory/constitution.md` (Design System Standards) + `wafar.single.css` (the only permitted source of design values) |
| Product definition (roles, pages, acceptance criteria) | `Core-Project.txt` |
| Accepted decisions | `docs/DECISIONS.md` (ADR-001 … ADR-032; the index table is at the top of that file) |
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
  `docs/domain-model.md`, `wafar.single.css`, and `docs/DECISIONS.md`. The plan
  is the only artifact that carries technical detail, and its Ownership Map must
  match `docs/architecture.md`.
- `/speckit.tasks` → `plan.md`, plus `docs/architecture.md`, `docs/domain-model.md`,
  and `docs/DECISIONS.md`. Every path a task touches must appear in the plan's
  ownership map.
- `/speckit.implement` → `plan.md`, `tasks.md`, and the constitution.

The feature templates in `.specify/templates/overrides/` carry this duty as
binding text. They resolve as the top layer with `strategy: replace`; do not
replace them with the core templates.

## 4. Language and layout

- User-facing text: Arabic, `<html dir="rtl" lang="ar">` on every page.
- Code identifiers, code comments, commits, and governance text: English.
- Numerals rendered to the user: Latin (1234567890), never Arabic-Indic.
- Logical CSS properties only (`margin-inline-start`, not `margin-left`).

## 5. Workflow

The binding cycle, in order: `/speckit.constitution` → `/speckit.specify` →
`/speckit.clarify` → `/speckit.plan` → `/speckit.checklist` →
`/speckit.tasks` → `/speckit.analyze` → `/speckit.implement`, repeating
`/speckit.implement` ↔ `/speckit.converge` until converge reports Converged
(ADR-013).

Installed extensions: `assess` (idea triage before specifying), `bug` (bug
triage), and `git` (mandatory feature branch creation before specification).
Templates resolve from `.specify/templates/overrides/` first, then
presets, then extensions, then core.

**The bundled `speckit` workflow mirrors the binding cycle.**
`.specify/workflows/speckit/workflow.yml` runs `constitution → specify →
clarify → plan → checklist → tasks → analyze → implement → converge` with
human review gates. The `git` extension's `before_specify` hook (`speckit.git.feature`,
optional: false) runs automatically before specification, creating a sequentially
numbered feature branch (`001-feature-name`, matching `feature_numbering: sequential`
in `init-options.json` and ADR-015). Converge remains a separate command by
decision (ADR-013), not a spec-kit engine concern; the workflow file lists it
so the cycle reads as one sequence. Templates and the registry are what a
reader checks, not the engine.

## 6. Known gaps

- **No standalone `/speckit.constitution-check` command.** The constitution check
  gate is carried inside `plan-template.md` (Gates 1–3), evaluated before Phase 0
  and re-evaluated after Phase 1. That satisfies Artifact Workflow and
  Traceability; a separate command is a convenience, not a requirement. Add one
  only with an ADR, and keep the plan-internal gate authoritative.

## 7. Before reporting a change complete

- Every task ends with `(implements FR-###, AC-###)` or, when no requirement
  genuinely applies, `(implements Complexity Tracking: <row>)`.
- Every deviation is recorded in the plan's Complexity Tracking table with an
  owner and a review date.
- Documents affected by the change are updated in the same change.
- Non-trivial decisions are recorded in `docs/DECISIONS.md` as an ADR.