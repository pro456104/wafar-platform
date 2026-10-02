# Wafar — Project Context Rules

Authority: `.specify/memory/constitution.md` supersedes this file. Read
`AGENTS.md` at the repository root for the full operating rules. The essential
ones:

1. **Project-level knowledge is not a feature.** `.specify/memory/constitution.md`,
   `docs/architecture.md`, `Project-Technologies.txt`, `wafar.single.css`,
   `Core-Project.txt`, `docs/DECISIONS.md`, and `ROADMAP.md` are read by name.
   Never create a numbered feature for the architecture, the design system, the
   technology stack, or conventions (see `docs/DECISIONS.md` → ADR-007).

2. **Before any `/speckit.*` feature command, load those sources:**
   - `specify` → constitution + `Core-Project.txt` + `docs/DECISIONS.md`
     (no technology in a specification — Principle VII).
   - `plan` → the constitution's registers (Technology Standards, Design System
     Standards, Product Register) plus the project-level sources; its Ownership Map
     must match `docs/architecture.md`.
   - `tasks` → `plan.md` + `docs/architecture.md` + `docs/DECISIONS.md`.
   - `implement` → `plan.md` + `tasks.md` + constitution.

3. **The feature templates carry this as binding text** —
   `.specify/templates/overrides/{spec,plan,tasks}-template.md` resolve as the
   top layer with `strategy: replace`. Do not replace them with the core
   templates, and keep them in step with the constitution's version.

4. **Language and layout** — Arabic UI with `<html dir="rtl" lang="ar">`, Latin
   numerals only, logical CSS properties only, English code and governance text.