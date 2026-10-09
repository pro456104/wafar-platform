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
| Accepted decisions | `docs/DECISIONS.md` (ADR-001 … ADR-086; the index table is at the top of that file) |
| Slice order for the MVP | `ROADMAP.md` |

**Prohibited:** creating a feature numbered after a project-level concern (for
example "020-design-system" or "019-architecture"). That is a classification
error — it makes the agent treat a project-wide rule as work, and later features
re-invent what already exists. See `docs/DECISIONS.md` → ADR-007.

## 3. Load these before writing any feature artifact

Read only the constitution sections this list names; the constitution's own
Reading protocol mirrors this map, and the constitution MUST NOT be read end to
end for a feature command.

- `/speckit.specify` → the constitution (Product Scope, Product Register, Usage
  Limits, Glossary), `Core-Project.txt`, `docs/domain-model.md`, and
  `docs/DECISIONS.md`. **Not** the
  technical sources: a specification stays technology-agnostic (Principle VII).
- `/speckit.plan` → the constitution's registers (Technology Standards, Design
  System Standards, Product Register) plus `docs/architecture.md`,
  `docs/domain-model.md`, `Project-Technologies.txt`, `Core-Project.txt`,
  `wafar.single.css`, and `docs/DECISIONS.md`. The plan is the only artifact
  that carries technical detail, and its Ownership Map must
  match `docs/architecture.md`.
- `/speckit.tasks` → `plan.md`, plus `.specify/memory/constitution.md`,
  `docs/architecture.md`, `docs/domain-model.md`,
  and `docs/DECISIONS.md`. Every path a task touches must appear in the plan's
  ownership map.
- `/speckit.checklist` → the constitution, `Core-Project.txt`,
  `docs/domain-model.md`, and `docs/DECISIONS.md`.
- `/speckit.implement` → `plan.md`, `tasks.md`, and the constitution.
- `/speckit.analyze` → `spec.md`, `plan.md`, `tasks.md`, and the constitution;
  it also reads `docs/DECISIONS.md` and `docs/domain-model.md` for the
  consistency pass, because a conflict with an accepted ADR or a model invariant
  is a blocking finding (Artifact Workflow and Traceability).
- `/speckit.converge` → `spec.md`, `plan.md`, `tasks.md`, and the constitution;
  it appends its convergence tasks to `tasks.md` and reports Converged only when
  the implementation satisfies all three artifacts.

The feature templates in `.specify/templates/overrides/` carry this duty as
binding text. They resolve as the top layer with `strategy: replace`; do not
replace them with the core templates.

## 4. Language and layout

- User-facing text: Arabic, `<html dir="rtl" lang="ar">` on every page.
- Code identifiers, code comments, commits, and governance text: English. The
  only exceptions are `wafar.single.css` comments (Arabic), the two Arabic
  mirrors (`Core-Project.txt`, `Project-Technologies.txt`), and Arabic strings
  quoted as the subject of a rule (for example an Arabic-Indic numeral example).
- Numerals rendered to the user: Latin (1234567890), never Arabic-Indic.
- Logical CSS properties only (`margin-inline-start`, not `margin-left`).
- No emoji in anything a person reads inside the platform: every screen,
  including the administrator application, and the body of every SMS
  (Principle V). An icon is an SVG from the registered open-source icon set,
  and an emoji glyph is not an icon. That set is **not registered yet**: it is an
  open register gap owned by R1, so no slice may name an icon set before R1
  chooses one and records it.
- Registration is Libya only: every account is a +218 number and sign-up offers
  no dial-code selector (ADR-041).

## 5. Workflow

The binding cycle, in order: `/speckit.constitution` → `/speckit.specify` →
`/speckit.clarify` → `/speckit.plan` → `/speckit.checklist` →
`/speckit.tasks` → `/speckit.analyze` → `/speckit.implement`, repeating
`/speckit.implement` ↔ `/speckit.converge` until converge reports Converged
(ADR-013).

Installed extensions: `assess` (idea triage before specifying), `bug` (bug
triage), and `git` (repository initialization and mandatory feature branch
creation). The `git` extension registers a mandatory `before_constitution` hook,
`speckit.git.initialize` (`optional: false`, enabled), which runs before
constitution work, and a mandatory `before_specify` hook,
`speckit.git.feature` (`optional: false`, enabled). The `assess` extension ships
no lifecycle hooks of its own; **this project** registers its optional
`speckit.assess.intake` prompt at `before_specify` in `.specify/extensions.yml` —
prompting to normalize a raw idea into an intake note before specification
(`optional: true`, enabled, `priority: 9` so it precedes the mandatory
`git.feature`). It is a prompt, not a mandatory step of the binding
cycle. Hook states are read from `.specify/extensions.yml`; the `git` commit
hooks are registered but disabled by default.

Two integrations are installed: `codebuddy` (WorkBuddy AI) is the default, and
`opencode` is the second. Each owns a private command directory
(`.codebuddy/commands/`, `.opencode/commands/`) whose files are byte-identical
to each other. Their ten core commands mirror the upstream Spec Kit commands,
while their thirteen extension commands are **derived** from
`.specify/extensions/*/commands/` by placeholder resolution, a provenance
comment, and front-matter normalisation, so they are not byte-identical to that
source (ADR-086). Both read the same
`.specify/` tree (templates, extensions, hooks, scripts, workflow), so either
environment runs the same cycle with the same command spelling (`/speckit.*`).
`.specify/integration.json` lists both and keeps `codebuddy` as the default.

Templates resolve from `.specify/templates/overrides/` first, then
presets, then extensions, then core. The `speckit.taskstoissues` command is a
reserved optional surface: no product requirement names it today, and adopting
it later requires recording the owner and the requirement it serves.

**The bundled `speckit` workflow mirrors the binding cycle.**
`.specify/workflows/speckit/workflow.yml` runs `constitution → specify →
clarify → plan → checklist → tasks → analyze → implement → converge` with
human review gates. The `git` extension's `before_specify` hook (`speckit.git.feature`,
optional: false) runs automatically before specification, creating a sequentially
numbered feature branch (`001-feature-name`, matching `feature_numbering: sequential`
in `.specify/init-options.json` and ADR-015). Converge remains a separate command by
decision (ADR-013), not a spec-kit engine concern; the workflow file lists it
so the cycle reads as one sequence. Templates and the registry are what a
reader checks, not the engine. `.specify/workflows/speckit/workflow.yml` is a
**project-customised** copy of the bundled workflow (it adds the constitution,
clarify, checklist, analyze, and converge steps and the `codebuddy` integration
key), so a `specify` upgrade may replace it; the project copy is the one to keep,
and its `requires.integrations.any` list must stay correctly nested under
`integrations:` (ADR-072).

**The governance drift check is committed (ADR-071, ADR-072, ADR-073, ADR-074, ADR-075, ADR-080, ADR-082, ADR-083, ADR-086).** `governance-drift-check.mjs`
in the repository root is a read-only, dependency-free Node script that verifies
the invariants the governance set cannot verify by discipline: the constitution
footer's version and amended date against `.specify/memory/version.json`; every
live `ADR-001 … ADR-086` range string — in the required files, under `docs/`, in
the two Arabic mirrors, and in the template overrides — against the last row of
`docs/DECISIONS.md`'s index; every ADR index row's anchor against its heading, and
every heading against the index; every `ADR-NNN` reference against the index; the
ADR list in `Project-Technologies.txt`'s header against the same row; every
`speckit.manifest.json` hash for an upstream-owned file against the working tree,
and every upstream-owned file in the tree against the manifest (the project-owned
`templates/overrides/*` files, `.specify/.gitignore`, and
`.specify/templates/exception-register.md` are excluded, because the project
edits them by design); the byte-identity of `.codebuddy/commands/` and
`.opencode/commands/`; each integration manifest against the tree it records and
against that integration's whole command directory; every design token the
constitution's Design System Standards names against `wafar.single.css`; the
structural counts the governance text states in prose — slices, exception rows,
principles, data entities, design-system modules, binding sections, API modules,
pages, and product features — against the lists that enumerate them, with the
binding-section set derived from the constitution's own headings; and
`wafar.single.css`'s own declared version and module count. Run it with
`node governance-drift-check.mjs`; it exits non-zero on drift. It is wired into a
committed `pre-commit` hook (`.githooks/`, enabled per clone with
`git config core.hooksPath .githooks`), and the slice that introduces the test
runner (R1) wires it into continuous integration.

## 6. Known gaps

- **No standalone `/speckit.constitution-check` command.** The constitution check
  gate is carried inside `plan-template.md` (Gates 1–3), evaluated before Phase 0
  and re-evaluated after Phase 1. That satisfies Artifact Workflow and
  Traceability; a separate command is a convenience, not a requirement. Add one
  only with an ADR, and keep the plan-internal gate authoritative.

- **`.opencode/package.json` is not version-controlled.** It is ignored by
  `.opencode/.gitignore`, so a fresh clone relies on opencode regenerating it.
  The pin is `@opencode-ai/plugin` **1.1.21**; it is recorded here (ADR-071) so a
  fresh clone knows the value, and stays machine-local rather than
  repo-enforced.

- **`.specify/memory/.constitution-template.json` is ignored and untracked (gap
  closed 2026-10-08, ADR-074).** It is the CLI's record of which constitution
  template it scaffolded from — machine state of the same class as
  `memory/.resolved-template.json`, `extensions/.cache/`, and
  `integrations/.cache/`. It was tracked until 2026-10-08, so it was removed from
  the index and added to `.specify/.gitignore` in the same change. Its `source`
  field is not a governance statement: the binding template layer is
  `.specify/templates/overrides/`.

- **Integration state is committed (gap closed 2026-10-08, ADR-069).**
  `.codebuddy/`, `.specify/integrations/codebuddy.manifest.json`, and
  `.specify/memory/version.json` were listed here as untracked while ADR-068 was
  drafted. Commit `26df272` tracked all three, so a fresh clone carries the
  default environment and both version sources. The gap is closed and the entry
  is kept, marked closed, so it is not re-reported as an open gap.

- **`create-new-feature.ps1` is an installed but uncalled script — intentional
  (ADR-071).** Feature numbering and directory creation run inside the specify
  command, so the script in `.specify/scripts/powershell/` is kept for parity
  with upstream rather than used. It is a deliberate parity artifact, not a gap
  to close.

- **`speckit.taskstoissues` is a reserved optional surface (ADR-071).** It ships
  with the integration, but no product requirement names it; adopting it later
  requires recording the owner and the requirement it serves. It is reserved,
  not an open gap.

## 7. Before reporting a change complete

- Every task ends with `(implements FR-###, AC-###)` or, when no requirement
  genuinely applies, `(implements Complexity Tracking: <row>)`.
- Every deviation is recorded in the plan's Complexity Tracking table with an
  owner and a review date.
- Documents affected by the change are updated in the same change.
- Non-trivial decisions are recorded in `docs/DECISIONS.md` as an ADR.
