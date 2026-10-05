# Wafar — Project Context Rules

Authority: `.specify/memory/constitution.md` supersedes this file. Read
`AGENTS.md` at the repository root for the full operating rules. The essential
ones:

1. **Project-level knowledge is not a feature.** `.specify/memory/constitution.md`,
   `docs/architecture.md`, `docs/domain-model.md`, `Project-Technologies.txt`,
   `wafar.single.css`, `Core-Project.txt`, `docs/DECISIONS.md`, and `ROADMAP.md`
   are read by name. Never create a numbered feature for the architecture, the
   data model, the design system, the technology stack, or conventions (see
   `docs/DECISIONS.md` → ADR-007).

2. **Before any `/speckit.*` feature command, load those sources.** The binding
   cycle is: `constitution → git:feature → specify → clarify → plan → checklist →
   tasks → analyze → implement → converge` (implement ↔ converge until Converged):
   - `constitution` → the constitution itself, and the amendment material when
     changing it.
   - `git:feature` → `speckit.git.feature` (mandatory, creates sequential feature
     branch `001-<name>` per `init-options.json` and ADR-015).
   - `specify` → constitution + `Core-Project.txt` + `docs/DECISIONS.md`
     (no technology in a specification — Principle VII).
   - `clarify` → `spec.md` (resolve its open questions).
   - `plan` → the constitution's registers (Technology Standards, Design System
     Standards, Product Register) plus the project-level sources, including
     `docs/domain-model.md`; its Ownership Map must match `docs/architecture.md`.
   - `checklist` → `spec.md` (requirements-quality checklist).
   - `tasks` → `plan.md` + `docs/architecture.md` + `docs/domain-model.md` +
     `docs/DECISIONS.md`.
   - `analyze` → `spec.md` + `plan.md` + `tasks.md` + constitution (consistency
     gate, run by hand before implementation — AGENTS.md §5).
   - `implement` → `plan.md` + `tasks.md` + constitution.
   - `converge` → `spec.md` + `plan.md` + `tasks.md` + constitution (run after
     implement until it reports Converged — ADR-013, AGENTS.md §5).

3. **The feature templates carry this as binding text** —
   `.specify/templates/overrides/{spec,plan,tasks,checklist,constitution}-template.md` resolve as the
   top layer with `strategy: replace`. Do not replace them with the core
   templates, and keep them in step with the constitution's version.

4. **Language and layout** — Arabic UI with `<html dir="rtl" lang="ar">`, Latin
   numerals only, logical CSS properties only, English code and governance text,
   no emoji in anything a person reads inside the platform — every screen
   including the administrator application, and the body of every SMS — with an
   icon an SVG from the registered open-source icon set, and registration is
   Libya only (+218, no dial-code selector; ADR-041).
   Exceptions that mirror the constitution: `wafar.single.css` comments, the
   two Arabic mirrors (`Core-Project.txt`, `Project-Technologies.txt`), and
   Arabic strings quoted as the subject of a rule.