## ADR-089 — Roadmap defect-table precision fix set

**Status**: Accepted — 2026-10-09
**Owning directory**: `ROADMAP.md`, `docs/`, `Project-Technologies.txt`, `AGENTS.md`, `README.md`, `.specify/templates/overrides/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of `ROADMAP.md`'s own "Defects in the slice order"
table on 2026-10-09 found three precision defects in the table itself, plus a
stale date in the technology mirror. The defects were found by checking the
table's claims against the sources it cites, not by reading the table:

1. **Defect #2's closure cell over-listed.** The defect names "Six register
   gaps", and the count is correct — the constitution's Register gaps table
   names exactly five rows assigned to "the first deploying slice" (error
   tracker, secret manager, TLS certificate management, log pipeline, load-test
   tool) and one to "the first slice that introduces the test runner" (the
   continuous-integration provider). But the "Closed by" cell enumerated ten
   items and omitted the SMS provider and SBOM generator that R1 owns directly.
2. **Defects #8 and #13 stated the same fact.** Both said the binding template
   did not carry the sub-spec `Input` line.
3. **The icon set appeared in both #2 and #9.**
4. **The mirror's date was stale.** `Project-Technologies.txt` read "last
   amended 2026-10-08" while the constitution's footer and `.specify/memory/version.json`
   both read 2026-10-09.

**Decision.**

1. Defect #2's "Closed by" cell is corrected to name exactly the six register
   gaps that named a phantom owner: the continuous-integration provider (R1) and,
   for R12, the error tracker, secret manager, TLS certificate management, log
   pipeline, and load-test tool. The over-listed items are removed.
2. Defect #8 keeps only "the sub-spec `Input` convention was stated in two
   different forms"; the binding-template statement belongs to #13 alone.
3. The icon set is named only in defect #9; it leaves defect #2's cell.
4. `Project-Technologies.txt`'s "last amended" date is corrected from 2026-10-08
   to 2026-10-09, to agree with the constitution's footer and `version.json`.
5. The ADR-020, ADR-021, and ADR-022 "reconstructed" markers are accurate as
   they stand (ADR-086) and are left unchanged; no original has surfaced.
6. Every live `ADR-001 … ADR-0NN` range string moves to ADR-089, and
   `Project-Technologies.txt`'s header ADR list gains ADR-089.

**What deliberately did not change.** The sixteen-defect count, the slice order,
every slice and its `Depends on` edges, and the First obligations rows are
untouched. No principle, section heading, register row, Product Scope item,
entity, page, feature, Usage Limit, module-map row, or design value changed, so
the constitution is not amended and stays **2.28.6**. No slice was added,
removed, renumbered, or reordered.

**Alternatives considered.**

- *Rewrite defect #2 to enumerate every register gap.* Rejected: the defect's
  subject is the six gaps assigned to phantom owners, not the register's full
  gap set; the constitution's Register gaps table already carries the complete
  list, and repeating it here would be a second source that drifts.
- *Merge defects #8 and #13 into one row.* Rejected: merging would change the
  sixteen-row count the governance text states in prose (gate G), and the two
  rows record two distinct findings.
- *Move the constitution's stamp-site list in this change.* Rejected: ADR-064
  recorded that as a Governance amendment in its own right, so it is a separate
  change and not this record's subject.
- *Leave the mirror's stale date.* Rejected: a date that disagrees with both
  version sources is the class of drift the check exists to catch, even where no
  gate reads this file's date.

**Consequences.** The defect table names exactly what each defect closed, the
two `Input`-line defects are distinct, the mirror's date agrees with the two
version sources, and the check reports clean with the index ending at ADR-089 and
every live range string reading `ADR-001 … ADR-089`. This entry is the durable
record.

---

## ADR-090 — The Documentation rule reaches technical decisions

**Status**: Accepted — 2026-10-09
**Owning directory**: `.specify/memory/`, `docs/`, `AGENTS.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** Twenty-three decision records carry no `Alternatives considered`
section: ADR-011, ADR-012, ADR-013, ADR-014, ADR-017, ADR-018, ADR-020, ADR-021,
ADR-022, ADR-023, ADR-024, ADR-025, ADR-026, ADR-027, ADR-028, ADR-029, ADR-035,
ADR-036, ADR-037, ADR-038, ADR-044, ADR-045, and ADR-046. The Documentation rule
requires the field "for every non-trivial technical decision". Writing the
sections now would be the reconstruction ADR-050 refused to present as
contemporaneous. ADR-088 recorded the debt as deliberately open and named the only
honest closure — narrowing the rule to its own subject — while leaving it to a
separate amendment rather than folding it into a status record.

**Decision.**

1. The Documentation rule is clarified: the `Alternatives considered` field
   reaches a non-trivial **technical** decision — a product or engineering
   choice. A **governance record**, whose subject is this constitution's own
   text, a register, the process, or the governance tooling rather than a product
   or engineering choice, is not a technical decision and is outside the field's
   reach. A section is not written for such a record after the fact, because that
   would be reconstruction rather than a record.
2. The twenty-three records above are governance records under that reading, so
   the field never reached them. The debt is **closed**; no section is
   reconstructed.
3. `AGENTS.md` §6's entry is updated to record the closure.
4. The constitution moves to **2.29.0** (MINOR: the change narrows the reach of a
   binding MUST, a semantic change, not a wording or citation refinement). The
   footer and `.specify/memory/version.json` move together, and `version.json`'s
   `recorded_by` becomes ADR-090.
5. Every live `ADR-001 … ADR-0NN` range string moves to ADR-090, and
   `Project-Technologies.txt`'s header ADR list gains ADR-090.

**What deliberately did not change.** No principle, section heading, register
row, Product Scope item, entity, page, feature, Usage Limit, module-map row,
design value, slice, or slice dependency changed. The twenty-three records
themselves are untouched. The rule's obligation for a technical decision is
unchanged: a product or engineering decision still MUST record its alternatives,
and every bootstrap record that carries the section keeps it.

**Alternatives considered.**

- *Write the twenty-three missing sections.* Rejected: ADR-050 already refused to
  present reconstruction as contemporaneous reasoning, and those alternatives
  were never captured.
- *Grandfather the twenty-three by number and require the field from ADR-090
  onward.* Rejected: a number-based cut-off would leave a future governance
  record in doubt and would not state why the field does not reach it; the
  subject test is the durable rule.
- *Leave the debt open.* Rejected: ADR-088 named narrowing the rule as the only
  honest closure and made the debt findable; this record completes it.
- *Bump PATCH instead of MINOR.* Rejected: the change narrows the reach of a
  binding MUST, which is a semantic change; PATCH is reserved for clarifications
  and citations that leave scope untouched.

**Consequences.** The Documentation rule states its own subject, the
twenty-three-record debt is closed without reconstruction, `AGENTS.md` §6 records
the closure, the constitution moves to 2.29.0, and the check reports clean with
the index ending at ADR-090 and every live range string reading
`ADR-001 … ADR-090`. This entry is the durable record.

**Annotation (2026-10-21, ADR-102).** The count of records this rule leaves
outside its reach is **twenty-four**, not twenty-three: ADR-092, recorded the day
after this record, is a governance record of the same class and carries no
`Alternatives considered` section. Decision 2's reasoning reaches it unchanged,
and the list in the Context stays as written — it is this record's own count at
its own date. `AGENTS.md` §6 states the corrected count.

---

## ADR-091 — The stamp-site list stays in the constitution

**Status**: Accepted — 2026-10-09
**Owning directory**: `docs/`, `AGENTS.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** The Governance section's stamp-site paragraph — the numbered list of
the version's two sources and the durable record, at `.specify/memory/constitution.md`
→ Governance — has been recorded since ADR-064 as an amendment "in its own right"
whose relocation was deferred. `AGENTS.md` §6 carried it as an owned, unscheduled
amendment so it would not be lost. No record had decided whether the list should
move or stay.

**Decision.**

1. The stamp-site list stays in the constitution. It is not moved to another
   document.
2. The reason is that the paragraph declares itself "the single authority for
   those sources"; relocating it to a document of lower precedence would place a
   lower-precedence authority over the constitution's own version sources and
   contradict Governance's precedence rule (constitution, then agent instruction
   files, then the readme, then any other guidance). The list is a Governance
   MUST binding this document, so it belongs in this document, and gate A of the
   drift check already enforces the two sources mechanically.
3. `AGENTS.md` §6's entry is updated to record the decision.
4. The debt is **closed** by the decision; no further amendment is owed.
5. Every live `ADR-001 … ADR-0NN` range string moves to ADR-091, and
   `Project-Technologies.txt`'s header ADR list gains ADR-091.

**What deliberately did not change.** The constitution's text is unchanged, so it
stays **2.29.0**. No principle, section heading, register row, Product Scope item,
entity, page, feature, Usage Limit, module-map row, design value, slice, or slice
dependency changed.

**Alternatives considered.**

- *Move the list to a separate governance file.* Rejected: it would create a
  lower-precedence authority over the version sources and contradict Governance's
  precedence rule; the paragraph's own self-declaration as the single authority is
  the reason it stays.
- *Move it into `AGENTS.md`.* Rejected for the same reason: `AGENTS.md` is an
  agent instruction file, below the constitution in precedence.
- *Leave the debt open as an unscheduled amendment.* Rejected: the audit's goal
  is closure; the decision to keep the list is itself the closure, and it costs no
  rule change.
- *Fold this into ADR-090.* Rejected: ADR-090's subject is the Documentation
  rule; bundling a Governance decision with it would misstate what each covers.

**Consequences.** The stamp-site list's home is decided rather than pending,
`AGENTS.md` §6 records the decision, the constitution stays 2.29.0, and the check
reports clean with the index ending at ADR-091 and every live range string reading
`ADR-001 … ADR-091`. This entry is the durable record.

---

## ADR-092 — The integration-topology gate made unconditional

**Status**: Accepted — 2026-10-10
**Owning directory**: `governance-drift-check.mjs`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `.specify/templates/overrides/`, `.specify/memory/`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of the governance set on 2026-10-10 found one
structural defect inside `governance-drift-check.mjs` itself. Gate **I** (the
integration topology, ADR-088) had been written inside the `else` branch that
belongs to gate **H** (the design-system header, ADR-086): the `} else {` opened
for H's version check closed only after gate I's whole block, so I ran only when
H's version check succeeded. Every gate is meant to be independent — the script's
own header lists A, B, F, C, D, D2, E, G, H, and I as separate checks. The defect
was latent rather than active: gate H's version check passes on the current tree,
so gate I ran and the check reported clean. But the two gates were coupled, so
had `wafar.single.css` ever lost its `الإصدار:` header line, gate H would fail and
gate I would be skipped entirely — a missing integration, a stale default, or a
broken `requires.integrations.any` nesting could then have passed unobserved at
the very moment another gate was already failing.

**Decision.**

1. The `}` that closed gate H's `else` branch is moved to sit immediately after
   H's version note, so gate H closes where it opens and gate I (the integration
   topology) runs at the top level as its own check, unconditionally, as ADR-088
   intended. No gate's logic, message, or coverage changes; only the brace
   placement does. The module-count half of gate H is unaffected and continues to
   run unconditionally.
2. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-092**.
3. `Project-Technologies.txt`'s header ADR list gains ADR-092, and its "last
   amended" date moves to 2026-10-10 to agree with the two version sources.
4. The five citation sites that name the ADRs shaping the check gain ADR-092 —
   the script's header comment and its printed banner, `AGENTS.md` §5,
   `README.md`, and the constitution's References row — so the one list ADR-084
   unified stays one list. Naming it in the constitution's References row moves
   the constitution to **2.29.1** (PATCH), on ADR-084's, ADR-086's, and ADR-088's
   precedent for a citation change.

**What deliberately did not change.** No principle, section heading, register
row, Product Scope item, entity, page, feature, Usage Limit, module-map row,
design value, slice, or slice dependency changed. No gate was added, removed, or
re-scoped: the check verifies exactly what its four descriptions already state,
and this record only makes gate I run when gate H fails. The constitution's only
text change is the References row's citation list, so the move to **2.29.1** is
PATCH, on ADR-084's precedent for a citation change.

**Consequences.** Gate H and gate I are now independent, so a failure in one no
longer suppresses the other. The check reports clean with the index ending at
ADR-092 and every live range string reading `ADR-001 … ADR-092`. This entry is
the durable record.

---

## ADR-093 — Remove the custom design system and establish the UI foundation

**Status**: Accepted — 2026-10-20
**Owning directory**: `.specify/memory/constitution.md`, `.specify/templates/overrides/`, `governance-drift-check.mjs`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `Core-Project.txt`, `wafar.single.css` (deleted)
**Owning feature**: none — governance decision; ratified by the repository owner. R1 implements the Wafar UI layer.

**Context.** The project carried a bespoke frontend design system: `wafar.single.css`
(4,459 lines, 480 custom properties, 290 `.ds-*` classes, 14 modules), a
419-line `Design System Standards` register, Principle IX, three drift-check
gates, and references across the governance set. The system duplicated Nuxt UI
v4, required its own component inventory, token families, state matrix, fonts,
motion scale, z-index scale, breakpoints, and shell measurements, and blocked R1
before any application code existed. The repository owner rejected the old
colours and the old frontend design in full.

**Decision.**

1. Delete `wafar.single.css` and remove every old visual value from the binding
   text: the brand/accent palette, the dark-mode default, Tajawal and JetBrains
   Mono, the 19rem sidebar and 68px header, and the spacing, radius, shadow,
   motion, z-index, and breakpoint scales.
2. Remove `Design System Standards` and all twelve subsections. Replace
   Principle IX with `IX. UI Foundation Fidelity`: Nuxt UI v4 is the only UI
   component library; the Wafar UI layer is the only source of project-specific
   values; a second component library, a parallel token file, or a custom
   component CSS library is prohibited. Keep the principle count at ten and
   reduce the binding-section count from nineteen to eighteen.
3. Keep every approved technology. Nuxt 4, Vue 3, TypeScript, Tailwind CSS v4,
   Nuxt UI v4, Pinia, TanStack Query, Hono, OpenAPI, Zod, PostgreSQL, Drizzle,
   PgDog, OpenSearch, SeaweedFS, BullMQ, Redis, better-auth, Vitest, Playwright,
   ESLint, Prettier, Stylelint, Lighthouse CI, Semgrep OSS, osv-scanner, ClamAV,
   Prometheus, Grafana, pnpm, and Turborepo remain registered. Stylelint remains;
   its rule now points at the Wafar UI layer instead of `wafar.single.css`.
4. Preserve the non-visual product rules: the shared shell, its bare-page
   exemptions, the sidebar's full/rail/drawer behaviour, the theme switch, the
   table rule for data views, Arabic-first RTL, Latin numerals, no emoji,
   accessibility, and the 44px touch target.
5. Do not add `packages/ui` or any other package to the constitution. R1's plan
   fixes the Wafar UI layer's path and builds it through SpecKit. The
   constitution names the layer, not its directory.
6. Move the constitution to **3.0.0** (MAJOR): a principle is redefined and a
   binding section is removed. Update `version.json`, the template overrides,
   the drift check, the governance documents, the two Arabic mirrors, and the
   live ADR range strings in the same change.

**What deliberately did not change.** No technology was removed or downgraded.
No entity, page, product feature, role, usage limit, or security rule changed.
The table rule remains in Product Scope. The icon set remains an open register
gap owned by R1. No application code, package, design lab, or website was
created. The old ADR records were not rewritten; their design-system provisions
are superseded by this record and the note in the index.

**Alternatives considered.**

- *Keep and trim the old design system.* Rejected: it duplicates Nuxt UI v4 and
  preserves the maintenance cost the owner rejected.
- *Use Nuxt UI defaults without a project layer.* Rejected: Arabic typography,
  RTL behaviour, the product's identity, and a small set of Wafar patterns still
  need one recorded source.
- *Add `packages/ui` to the constitution now.* Rejected: the owner required
  SpecKit to choose and build the code; the constitution must not pre-empt the
  plan or add a package before the plan exists.
- *Delete the old ADRs.* Rejected: they are the historical record and the index
  and cross-references depend on them. A supersession note preserves
  traceability without rewriting history.

**Consequences and migration/backfill.** The constitution is 3.0.0 with ten
principles and eighteen binding sections. `wafar.single.css` is deleted and no
live file may depend on it as a source of design values. The drift check stops reading the old file, removes
gates G5 and H, turns E into an absence check (the stylesheet and the removed
constitution section must not reappear), and sets the binding-section count to
eighteen. The four template overrides lose their design-system references: the
constitution template loses the removed section; the plan template loses its
register row, CMV row, and Gate 2 row; and the spec and checklist templates lose
the stylesheet source. Feature artifacts written
under 2.x are re-read against Principle IX: any old token, class, font, or shell
measurement is invalid. R1's plan records the Wafar UI layer's path and builds
it; the visual direction remains a separate decision. This entry is the durable
record.

**Annotation (2026-10-21, ADR-097/098).** Decision 5 assigned the Wafar UI
layer's path to R1's plan. ADR-097, recorded ahead of R1 to close the pre-R1
foundation gap, fixes the path as `packages/ui` under Principle IX and leaves it
outside the constitution's topology and Internal layout rows. R1's plan consumes
the path. The icon set that decision 5 left to R1 is fixed by ADR-098; the
constitution's register gap remains the requirement, and R1's plan fills CMV
row 11.

---

## ADR-094 — Guest header controls and the administrator shell

**Status**: Accepted — 2026-10-20
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `Core-Project.txt`, `specs/001-identity-foundation/`
**Owning feature**: none — product correction ratified by the repository owner; R1 builds the frame.

**Context.** The Product Fact Clarifications bullet said a guest sees a login
action "instead of those controls", after naming the account, notifications,
theme-toggle, and sidebar-collapse controls. Read literally, it removed the
theme switch and the sidebar-collapse control from the guest header. The feature
specification for R1 (FR-023 and AC-025) had already decided that the login
action replaces the account and notifications controls only, because the
appearance and the sidebar belong to the frame rather than to an account; on a
narrow screen the collapse control is the only affordance that opens the
sidebar drawer. The same bullet also said that administrator pages "carry no
header", which contradicted Product Scope's statement that the administrator
application carries its own shell. The specification recorded that both texts
had to be corrected in the same change.

**Decision.**

1. A guest sees a login action in place of the account and notifications
   controls only. The theme switch and the sidebar-collapse control remain
   available to the guest.
2. Pages without the product's shared shell — authentication, 404, and static
   pages — carry no header. The administrator application carries its own shell
   and header; it is not covered by the shared-shell exemption.
3. The specification's FR-023 and AC-025 stand unchanged; this record removes
   the contradiction at its source rather than narrowing the feature.
4. The footer question is not decided here. The link surface remains the choice
   of the slice that first builds a shell page; R1's existing FR-024 records the
   footer-band choice, and its plan supplies the decision record.

**Annotation (2026-10-21, ADR-102).** Decision 1's wording reads correctly
again: the header carries a notifications control once more, so a guest's
sign-in action replaces the account and notifications controls, and the guest
keeps the theme switch, which now sits in the header beside them rather than in
the sidebar. The decision this record made is unchanged.

**What deliberately did not change.** The three surfaces remain: the public
site, the merchant area, and the separate administrator application with its own
login. The shared shell remains the public/merchant frame; the administrator
shell remains separate. No page, role, entity, feature, usage limit, security
rule, or technology changed. No footer is added to the constitution by this
record. No application code or package is created.

**Alternatives considered.**

- *Apply "instead of those controls" literally.* Rejected: it removes the only
  sidebar-drawer affordance on a narrow screen and forces a new control that
  the rule did not name.
- *Hide the sidebar from guests.* Rejected: guests need the public navigation,
  and the Product Scope's frame is not role-scoped in that way.
- *Add a separate menu button for guests.* Rejected: it preserves the literal
  wording at the cost of an extra control and a second way to open the same
  drawer.
- *Treat the administrator application as a no-header page.* Rejected: it
  contradicts Product Scope and the separate-shell architecture.

**Consequences and migration/backfill.** The constitution moves to **3.1.0**
(MINOR): the guest's visible header rule changes, so this is not a PATCH.
`version.json`, the ADR ranges, `Project-Technologies.txt`'s header, and the
specification's source block move to ADR-094 in the same change. R1 implements
the frame under FR-023/AC-025 and builds the footer band under FR-024; the
footer's constitutional status is unchanged. This entry is the durable record.

**Annotation (2026-10-21, ADR-099).** The guest rule stands — the sign-in action
replaces the account control only, and the guest keeps the appearance and the
sidebar — but the theme switch and the sidebar-collapse control now sit in the
sidebar, not the header. No notifications control remains in the header for the
guest or for the merchant.

---

## ADR-095 — Make opencode the default integration; keep codebuddy installed

**Status**: Accepted — 2026-10-20
**Owning directory**: `.specify/`, `.specify/templates/overrides/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `specs/001-identity-foundation/`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context.** The project supports two Spec Kit integrations, `codebuddy`
(WorkBuddy AI) and `opencode`. Both command directories are installed and
byte-identical, and both manifests are committed. The project was initialised
with `codebuddy` as the default, but the repository owner uses `opencode` and
may still use more than one environment. Deleting `codebuddy` would remove a
supported environment and force a broad governance change; leaving `codebuddy`
as the default would keep the working default out of step with actual use.

**Decision.**

1. Keep both integrations installed and keep `.codebuddy/` and `.opencode/`
   with their manifests and byte-identical command sets.
2. Make `opencode` the default in `.specify/integration.json` and
   `.specify/init-options.json`.
3. Keep `codebuddy` available as the second integration; no command file,
   manifest, workflow integration entry, or extension-registry entry is
   removed.
4. Record the default change here; the constitution is not amended and its
   version stays **3.1.0**.

**What deliberately did not change.** No product rule, page, role, entity,
feature, usage limit, security rule, technology, UI foundation rule, or
deployment rule changed. No integration was removed. No application code or
package was created. The workflow's advisory `requires.integrations.any` list
still names both integrations.

**Alternatives considered.**

- *Remove `codebuddy` and keep only `opencode`.* Rejected: the owner may use
  more than one environment, and removal would delete a supported integration
  and its manifest for no product benefit.
- *Keep `codebuddy` as the default.* Rejected: it would keep the default out of
  step with the environment the owner actually uses.
- *Change the default without recording it.* Rejected: integration topology is
  committed state and a non-trivial governance change; the durable record is
  required.

**Consequences and migration/backfill.** `opencode` is the default for a
command that does not name an integration; `codebuddy` remains available and
byte-identical. The constitution stays at 3.1.0 because no constitutional text
changes. `docs/DECISIONS.md` gains this record and its index row; the live ADR
ranges move to ADR-095 and `Project-Technologies.txt`'s header gains ADR-095 in
the same change. The drift check remains clean. This entry is the durable
record.

---

## ADR-096 — The R1 pre-planning fix set: the CMV values, the shell's link surface, the sidebar list, and the spec scan

**Status**: Accepted — 2026-10-20
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `Core-Project.txt`, `Project-Technologies.txt`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `specs/001-identity-foundation/`, `governance-drift-check.mjs`, `.githooks/`
**Owning feature**: R1 (the first feature that needs the three CMV values and builds the shell's link surface); the governance changes are ratified by the repository owner.

**Context.** A pre-planning audit of the constitution, the two Arabic mirrors,
the roadmap, the architecture, the domain model, the binding templates, the
drift check, and `specs/001-identity-foundation/` found three blocking
cross-artifact defects. First, the specification directs three families of
values to `Constitution Mandated Values` — the full-name and shop-name maximum
lengths (FR-001), the password policy parameters (FR-035), and the one-time
code's lifetime, re-request limit, and incorrect-entry bound (FR-034) — but
Module Discipline's list is closed and did not name them, so a plan could
neither omit them nor record them lawfully. Second, `Core-Project.txt` said the
sidebar's item list was "by role", while the specification fixed one list of
eight items shown identically to a guest and to a signed-in merchant in four
places (FR-039, AC-042, the Assumptions, and the Test Coverage Request).
Third, Product Scope defined the shell as "a header and a sidebar", while the
specification's FR-024, AC-022, and AC-026 place the static pages' link surface
in a footer band that is part of the frame. Four consistency defects were found
in the same audit: a stale "token" in Single-Reference Sufficiency after the
token register was removed; `AGENTS.md` §3 claiming to mirror the constitution's
Reading protocol while naming the whole constitution for five commands; no
annotation on ADR-068 after ADR-095 changed its stated default; and the drift
check not scanning feature specifications for the live ADR range string, which
the R1 specification already carries.

**Decision.**

1. The closed `Constitution Mandated Values` list gains three values, appended
   as items 15-17: the password policy parameters (the minimum length and the
   common-or-breached-password source); the one-time-code lifetime, its
   re-request limit, and the incorrect-entry bound; and the profile field
   maximum lengths (the full name and the shop name).
2. Product Scope's shell definition becomes a header, a sidebar, and the surface
   that carries the links to the static pages, with that surface recorded by the
   first slice that builds a shell page. R1 records it as the footer band its
   specification already fixes.
3. `Core-Project.txt`'s sidebar bullet becomes the eight approved pages shown
   identically to a guest and to a signed-in merchant, with no item added,
   removed, or disabled by role. The specification stands unchanged.
4. The drift check scans `specs/**/*.md` for the live `ADR-001 … ADR-0NN` range
   string, alongside the files it already scans. The R1 specification's range
   string is checked from this change on.
5. The consistency defects are corrected: "token" leaves the approval list in
   Single-Reference Sufficiency (tokens are approved by the Wafar UI layer, not
   by a constitutional register); `AGENTS.md` §3 names the same sections as the
   constitution's Reading protocol; ADR-068 gains an annotation for ADR-095;
   and the specification's stale cross-reference and two spacing typos are
   corrected.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined. No entity, page, product feature, role, usage limit, module, or
slice number changed. The eight sidebar items themselves, the four static pages,
and the three bare pages this slice ships are unchanged; only the role qualifier
on the sidebar list and the shell's link surface are fixed. No technology was
removed or downgraded. The twenty-six pages are untouched.

**Alternatives considered.**

- *Point the three specification values at the plan's Complexity Tracking table
  instead of the closed CMV list.* Rejected: Module Discipline requires a MUST
  that names a value to enter the CMV list first, and a value recorded anywhere
  else does not satisfy the rule that names it.
- *Change the specification's sidebar list to a role-dependent list.* Rejected:
  the specification fixes one composition in four places, and a role-dependent
  list would reopen FR-039, AC-042, the Assumptions, and the Test Coverage
  Request; the product mirror carried the older, ambiguous wording.
- *Record the footer band as a Complexity Tracking deviation instead of amending
  Product Scope.* Rejected: the specification commits to the footer band in
  three places, and a permanent deviation would leave the shell's definition
  inaccurate in the register.
- *Leave feature specifications out of the drift check.* Rejected: the range
  string is live in the specification, so a later ADR would leave it stale with
  no failure; the check exists to catch exactly that.
- *Split this fix set into one ADR per finding.* Rejected: the findings share
  one cause — artifacts written at different times against different states of
  the register — and one record keeps the reconciliation traceable, as ADR-085,
  ADR-086, and ADR-089 did for their fix sets.

**Consequences and migration/backfill.** The constitution moves to **3.2.0**
(MINOR): the closed CMV list gains three values and the shell's definition
gains its link surface. The plan template's CMV table gains rows 17-19 and its
row-number note moves from fourteen values/sixteen rows to seventeen/nineteen.
`Core-Project.txt`, `Project-Technologies.txt`, the templates, the governance
documents, and the specification's live range string move to ADR-096 in the
same change. R1's plan can now record the three value families under
`Constitution Mandated Values` without an exception. The drift check reports
clean with the index ending at ADR-096 and every live range string reading
`ADR-001 … ADR-096`. This entry is the durable record.

**Annotation (2026-10-21, ADR-097/098).** The index now ends at ADR-098, and
every live range string reads `ADR-001 … ADR-098`. The closing paragraph above
records the state at ADR-096's acceptance; the substance of this record is
unchanged.

---

## ADR-097 — The Wafar UI layer and the Nuxt 4 app layout

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `governance-drift-check.mjs`, `.githooks/pre-commit`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `specs/001-identity-foundation/`
**Owning feature**: none — governance decision; ratified by the repository owner. R1's plan consumes the path and builds the shell.

**Context.** The 3.2.0 pre-R1 audit found the UI foundation named in Principle IX
but not fixed in the repository. There was no application code, no `packages/ui`,
and no R1 `plan.md` or `tasks.md`. The constitution's Principle IX says the
Wafar UI layer is built by R1 through SpecKit and that R1's plan fixes its path;
ADR-093 assigned that decision to R1's plan and explicitly forbade adding
`packages/ui` or any other package to the constitution. At the same time, the
constitution's Repository topology rule says a package MUST NOT be added to
`packages/` without an amendment, its Internal layout fixes the frontend
locations in Nuxt 3-style paths, and the tasks template forbids an `app/`
segment. Nuxt 4, however, defaults to `app/`. The R1 specification is Draft and
cannot enter planning while those artifacts disagree. The operator approved the
pre-R1 remediation and the recommended defaults on 2026-10-21, including
`packages/ui` and Nuxt 4 `app/`.

**Decision.**

1. The Wafar UI layer path is `packages/ui`, a private Nuxt 4 layer shared by
   `apps/web` and `apps/admin`. The layer owns design tokens, theme
   configuration, IconPark icons, IBM Plex Sans Arabic, and shared primitives.
   App-specific pages, components, composables, and stores stay in each app; the
   layer is not a second application and holds no product pages.
2. `packages/ui` is not added to the constitution's Repository topology or
   Internal layout as a package row (ADR-093). The 3.3.0 amendment adds one
   narrow exception note to each table: the Wafar UI layer's path is fixed by
   this record and `docs/architecture.md` under Principle IX, it is not a row of
   either table, and no feature may create a parallel UI layer. No other package
   may be added without a constitutional amendment.
3. Nuxt 4's default `app/` layout is fixed for both frontends:
   `apps/web/app/{pages,components,composables,stores,layouts,assets}`,
   `apps/web/app/app.config.ts`, and `apps/web/app/app.vue`, with
   `apps/web/server/`, `apps/web/shared/`, and `apps/web/public/` at the app
   root; the same layout for `apps/admin`. `docs/architecture.md`,
   `Project-Technologies.txt`, and the tasks template are corrected to match.
4. The constitution moves to **3.3.0** (MINOR): the frontend paths and the two
   exception notes are normative. `version.json` records this ADR, and the
   footer date becomes 2026-10-21.
5. R1's plan records `packages/ui` and the `app/` paths in its Ownership Map and
   Gate IX. The R1 specification remains product-level. No numbered UI
   Foundation feature is created (ADR-007).
6. The live range moves to `ADR-001 … ADR-098` because ADR-098 is accepted in
   the same change; the index ends at ADR-098.

**What deliberately did not change.** No principle, product scope item, page,
role, entity, product feature, usage limit, security rule, approved technology,
component library, or visual value changed by this record. No application code,
package, CSS, or app directory was created by this record. The icon set,
typeface, default appearance, and palette are ADR-098; this record fixes only
the layer path and the layout.

**Alternatives considered.**

- *Keep the Nuxt 3-style paths and set `srcDir: '.'`.* Rejected: Nuxt 4 defaults
  to `app/`, no application code exists, and adopting the default now is the
  cheapest point to correct the register; `srcDir: '.'` would preserve a
  compatibility layer that every later task must remember.
- *Use two layers, one per app.* Rejected: it duplicates tokens, icons, fonts,
  and primitives and recreates the drift the one-layer rule exists to prevent.
- *Keep app-local design-system components.* Rejected: it makes each app a
  second design system and contradicts Principle IX.
- *Add `packages/ui` as a constitution topology row.* Rejected: ADR-093's
  decision stands; the constitution names the layer, not its directory, and the
  architecture and this record fix the path.
- *Defer both decisions to R1's plan.* Rejected: the R1 plan cannot start while
  the constitution, architecture, and tasks template disagree with the Nuxt 4
  layout; the pre-R1 gap would block the first slice.

**Consequences and migration/backfill.** The constitution is 3.3.0 with the
Nuxt 4 frontend paths and the two layer-exception notes. `version.json`,
`docs/architecture.md`, `Project-Technologies.txt`, the plan and tasks
templates, `AGENTS.md`, `README.md`, `ROADMAP.md`, the R1 checklist, and the
specification's live range string move in the same change. The drift check must
report clean at 3.3.0 / ADR-098. The pre-R1 foundation scaffolds the layer;
R1's plan records it and builds the shell; this record creates no code. Review
date: 2026-11-20. This
entry is the durable record.

---

## ADR-098 — The Wafar visual foundation: IconPark, IBM Plex Sans Arabic, light default, and the marine palette

**Status**: Accepted — 2026-10-21
**Owning directory**: `docs/`, `.specify/templates/overrides/`, `Project-Technologies.txt`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `specs/001-identity-foundation/`, `packages/ui` (planned by the pre-R1 foundation; R1 consumes it)
**Owning feature**: R1 (the shell and the first icon/typeface/theme consumer); none — visual foundation ratified by the repository owner.

**Context.** The constitution leaves the icon set as an open register gap and
delegates the typeface, default appearance, and visual direction to the Wafar UI
layer. The operator required icons that are colored, beautiful, official, free,
global, open source, strong, and not temporary. The audit compared the active
options. Phosphor Duotone was rejected by the operator after its preview read
gray/2D: the duotone is opacity-based, not true color. Fluent Color is active,
MIT, and official, but has 890 icons and is missing core UI icons (search, cart,
filter, upload, download, delete, menu, chevron, folder, and close), so the main
navigation would be partly monochrome. Streamline Color is active and true
color, but its 2,000 icons are CC BY 4.0, outside the constitution's permissive
list, and would need an exception and attribution. IconPark is the only
complete, true-multicolour, permissive, general-UI set (2,658 colour + 2,658
outline, Apache-2.0, ByteDance), but its upstream repository is archived. The
operator approved IconPark on 2026-10-21 on the condition that the set is
vendored and owned inside the repository. The same approval fixed IBM Plex Sans
Arabic, the light default, and the marine/sand palette.

**Decision.**

1. The icon set is IconPark (multicolor) plus IconPark Outline from the same
   family, Apache-2.0, 2,658 icons each. It is installed through
   `@iconify-json/icon-park` and `@iconify-json/icon-park-outline`, **vendored**
   under `packages/ui/vendor` with the Apache-2.0 licence and NOTICE, pinned by
   SHA-256 and source commit, and loaded locally. No runtime Iconify API and no
   dependency on the archived upstream at build or runtime. The project owns the
   copy; a future missing icon is added by ADR. The CMV row 11 records the set.
2. `WfIcon` is the only icon surface. It uses the colour set by default and the
   outline set for dense tables, micro-icons, and the dark theme where colour
   contrast is weak. The Nuxt UI internal icon keys map to IconPark Outline; no
   second icon family, no direct `i-*` classes in app code, and no emoji.
3. The typeface is IBM Plex Sans Arabic, OFL, self-hosted WOFF2 at weights
   400/500/600/700 with `font-display: swap`, Arabic and Latin subsets, and
   `Noto Sans Arabic` / `Segoe UI` / `Tahoma` fallbacks. No Google Fonts CDN.
   Latin numerals are used for all rendered numbers.
4. The default appearance is light; dark mode remains available through the
   color-mode module with no flash, an accessible toggle, and the dark palette.
5. The visual direction is a deep marine/petrol primary, a warm sand neutral,
   the IconPark blue/cyan accent, and semantic success/warning/error/info
   colours. Tokens are the only raw values; contrast targets WCAG AA; the dark
   theme uses the navy surface set. The palette harmonizes with IconPark's
   blue/cyan palette.
6. The icon set, typeface, default appearance, and palette are Wafar UI layer
   values, not constitutional text; no constitution amendment is made by this
   record. The licence and vulnerability scan, the vendoring, and the icon
   checks are recorded in the plan's Complexity Tracking and executed by R1.

**What deliberately did not change.** No component library, Nuxt UI Pro, second
icon family, product scope, page, role, entity, product feature, usage limit,
security rule, or constitution version changed by this record; ADR-097 moves the
constitution to 3.3.0. The constitution's icon-set register gap remains the
requirement; the R1 plan fills CMV row 11. No application code, package, CSS, or
font file was created by this record.

**Alternatives considered.**

- *Phosphor Duotone.* Rejected by the operator: the preview reads gray/2D
  because the duotone is opacity-based, not true color, although the set is
  active, MIT, and complete.
- *Fluent Color.* Rejected as the primary: active, MIT, and official, but 890
  icons and missing search/cart/filter/upload/download/delete/menu/chevron/
  folder/close; the main navigation would be partly monochrome.
- *Streamline Color.* Rejected: 2,000 true-colour icons but CC BY 4.0, outside
  the constitution's permissive list; it would need an ADR exception and an
  attribution page.
- *Lucide / Tabler / Heroicons / Material Symbols.* Rejected: active, permissive,
  and complete, but monochrome; the operator requires colour.
- *IconPark without vendoring.* Rejected: the upstream is archived; vendoring
  makes the copy permanent and removes the availability risk.
- *A second icon family for the missing pieces.* Rejected: the one-family rule;
  the outline theme supplies the monochrome and dense contexts.

**Consequences and migration/backfill.** The Wafar UI layer later owns the
vendored IconPark JSON, the IBM Plex Sans Arabic font files, the tokens, the
theme, and `WfIcon`. The R1 plan fills CMV row 11, the Ownership Map, Gate IX,
and the Complexity Tracking rows; the icon check verifies every semantic key and
the Nuxt UI mapping. The archive is a maintenance limitation, not an
availability risk: the vendored copy and the Apache-2.0 licence are perpetual.
Review date: 2026-11-20. This entry is the durable record.

---

## ADR-099 — Shared-shell header and the account menu

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `Core-Project.txt`, `specs/001-identity-foundation/`, `governance-drift-check.mjs`, `.githooks/`
**Owning feature**: none — product correction ratified by the repository owner; R1 builds the frame.

**Context.** ADR-017 fixed the shell's composition: a header carrying the
account, notifications, theme-toggle, and sidebar-collapse controls, and a
sidebar whose header carries the platform logo. ADR-094 kept that composition
for a guest and only narrowed the login action to the account and notifications
controls. The operator has since decided the header's real role: it is a brand
and account band, not a control strip. Page navigation already lives in the
sidebar, which carries the eight registered destinations, and the appearance
and the sidebar's own state belong to the sidebar rather than to the header.
Keeping the 2026-10-03 composition would leave the header carrying a
notification bell whose list is a sidebar destination, a theme switch beside the
navigation it belongs to, and a collapse control physically separated from the
thing it collapses.

**Decision.**

1. The header carries only the platform's logo/home control at the inline-start
   edge and the account control at the inline-end edge. It carries no
   page-navigation link, no notifications control, no theme switch, and no
   sidebar-collapse control.
2. The account control opens a menu with three items: «حسابي», which opens the
   Profile page; «إعدادات», which opens the settings section inside the Profile
   page; and «تسجيل الخروج», which shows a yes-or-no confirmation before the
   session ends.
3. A guest sees a sign-in action in place of the account control only; the guest
   has no account menu. The appearance and the sidebar remain available to the
   guest, through the sidebar's own controls.
4. The sidebar carries the eight registered navigation items unchanged, plus the
   theme switch and the sidebar-collapse control. It is full on a wide screen,
   an icon-only rail when collapsed (no names), and a drawer on a narrow screen.
   Its position is stated logically (`inline-start`, the right edge under the RTL
   direction); no physical right or left is written, per Principle V.
5. «إعدادات» is a section inside the Profile page. No page is added and the
   Product Register stays at twenty-six pages. «حسابي» and «إعدادات» point at the
   Profile route already fixed among the eight sidebar destinations, with the
   settings section identified by an anchor; «تسجيل الخروج» adds no route.
6. R1 builds the frame's composition and verifies it structurally, including the
   menu's three items and the confirmation markup, because R1 ships no page that
   renders the frame. The runtime behaviour of the header, the menu, and the
   sidebar lands with R4 (My Files), the first page that carries the frame; the
   menu's destinations land with R7 (Profile).
7. The notification counter moves from the header to the Notifications sidebar
   item (or to its page). No header bell is built.
8. The administrator application keeps its own shell and header; this record does
   not change it.

**What deliberately did not change.** The three surfaces (public site, merchant
area, administrator application); the bare scope (authentication, 404, and the
four static pages); the eight sidebar items and their routes; the footer band and
the four static routes; the twenty-six-page Product Register; every entity,
role, product feature, usage limit, and security rule; the technology register;
the Wafar UI layer path and the visual foundation (ADR-097, ADR-098). No
application code, package, CSS, or font file is created by this record.

**Alternatives considered.**

- *Keep the 2026-10-03 header composition.* Rejected: the operator's product
  decision fixes the header as a brand-and-account band; the notification bell
  duplicates a sidebar destination, and the theme and collapse controls belong
  with the sidebar they act on.
- *Put the account menu in the sidebar.* Rejected: the account belongs to the
  person, not to navigation, and a role-varying sidebar would break the rule that
  the item list is identical for a guest and a signed-in merchant.
- *A standalone merchant Settings page.* Rejected: it would add a page and force
  a Product Register amendment (26 → 27); the Profile page already owns account
  editing and the password change.
- *Write "the sidebar on the right" and "the account on the left".* Rejected:
  Principle V prohibits physical direction; `inline-start` and `inline-end` are
  the binding forms, and the RTL direction resolves them to the right and left
  edges respectively.

**Consequences and migration/backfill.** The constitution moves to **3.4.0**
(MINOR): the shell's header and sidebar composition changes, so this is not a
PATCH. `version.json`, the ADR ranges, `Project-Technologies.txt`'s header, the
R1 specification (FR-020, FR-022 … FR-025, FR-039, FR-047, AC-022, AC-024,
AC-025, AC-027, AC-042, AC-051), the R1 checklist, and the ROADMAP's shell and
notification rows move in the same change. ADR-016, ADR-017, and ADR-094 carry
annotations; their decisions are not rewritten. Review date: 2026-11-20. This
entry is the durable record.

**Annotation (2026-10-21, `/speckit.clarify`).** The clarification session
recorded the two landing points: «حسابي» opens the Profile page at its top, where
the account's identity and status are shown, and «إعدادات» opens that page's
settings section, where the account details are edited and the password is
changed; the two items therefore differ in the section they reach, and they
share the one Profile route the frame's decision record fixes. Decision 5 is
read with that distinction, and ADR-100 records the clarification session's
answers. No other provision of this record changes.

**Annotation (2026-10-21, ADR-102).** Two provisions of this record are
superseded, and neither is rewritten:

1. **Decision 1's header composition.** The header now carries the
   notifications control and the theme switch beside it, in addition to the
   logo/home control and the account control. The header still carries no
   page-navigation link and no sidebar-collapse control, and the account
   control keeps the inline-end edge.
2. **Decision 7's counter.** Decision 7 reads: "The notification counter moves
   from the header to the Notifications sidebar item (or its page). No header
   bell is built." The notifications control returns to the header and carries
   the unread count, and the Notifications sidebar item carries no count, so the
   count has one surface. The decision no longer stands.

Decision 4's placement of the theme switch in the sidebar is likewise
superseded: the switch is in the header, and the sidebar keeps the navigation
item list and the sidebar-collapse control. Decisions 2, 3, 5, 6, and 8 — the
account menu's three items, the guest's sign-in action, «إعدادات» as a section
of the Profile page, the sidebar's widths and position, the administrator
application's own shell, and the counter's not being built here — are unchanged.

---

## ADR-100 — The account menu's destinations and the frame's boundaries

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `Core-Project.txt`, `docs/`, `ROADMAP.md`, `AGENTS.md`, `README.md`, `Project-Technologies.txt`, `specs/001-identity-foundation/`, `governance-drift-check.mjs`, `.githooks/`
**Owning feature**: none — product clarification ratified by the repository owner; R1 binds the rules, and R4, R7, and R13 deliver them.

**Context.** ADR-099 fixed the shared shell's header and the account menu, and
left five points the R1 specification could not answer by itself: what the two
account items open, where the action that ends every session of an account at
once is offered, what a guest sees when they press a sidebar item that names a
merchant-area destination, what a merchant sees when their session ends or their
account is blocked, and what the administrator application's own header carries.
A clarification session on 2026-10-21 answered all five. Two of the answers
name a fact the register did not carry: the Profile page's content, and the
administrator application's header.

**Decision.**

1. «حسابي» opens the Profile page at its top, where the account's identity and
   status are shown. «إعدادات» opens the settings section of that same page,
   where the account details are edited, the password is changed, and the
   action that ends every session of the account at once is offered. Both items
   share the one Profile route the frame's decision record fixes, and the
   settings section is identified by an anchor. No page and no entity is added.
2. The Profile page's content in the Product Scope now carries the action that
   ends every session at once, and the `Core-Project.txt` mirror carries it
   beside the account details and the password change. The constitution moves to
   **3.5.0** (MINOR): a page's content changed, so this is not a PATCH.
3. The account menu keeps its three items. The action that ends every session
   is offered in the Profile page's settings section, delivered by R7.
4. A guest who activates a sidebar item that names a merchant-area destination —
   My Files, Cart, Notifications, Messages, or Profile — is taken to the
   sign-in page, because the register gives a guest no cart, no upload, no
   message, and no merchant area. The item stays present and enabled, because
   the list is not varied by role. The three items that name a public
   destination — Home, Parts, and Catalog — open their own pages. No page, route,
   or stored state is added; whether the merchant returns to the wanted item
   after signing in belongs to the slice that ships the merchant area's pages.
5. A request refused because the session ended or the account was blocked shows
   an explicit state inside the frame, stating that the session has ended and
   offering the way to sign in again, and saying plainly that the account is
   blocked when that is the reason. No unrelated error is shown, and the frame
   stops sending requests for a session that no longer exists. The state is
   shown only to a person who held a valid session, so it is outside the
   enumeration comparison SC-004 bounds.
6. The administrator application keeps its own shell, and its header carries the
   platform's logo at the inline-start edge and an account control whose menu
   offers «تسجيل الخروج» only, because the administrator application has no
   Profile page and no merchant settings page. R13 builds and verifies it.

**What deliberately did not change.** No page was added, no entity was added, no
role changed, no usage limit changed, no security rule changed, and the
technology register is untouched. ADR-099's composition stands, including the
three account-menu items, the sidebar's eight items, and the bare scope. No
application code, package, CSS, or font file was created by this record.

**Alternatives considered.**

- *A standalone merchant Settings page.* Rejected: it would add a page and force
  a Product Register amendment; the Profile page's settings section carries the
  same actions.
- *A fourth account-menu item for signing out everywhere.* Rejected: the action
  belongs with the other account actions, and the menu keeps three items.
- *A settings view for appearance and notification preferences.* Rejected: no
  such preference is registered, and inventing one would extend the product.
- *Showing a guest a merchant-only section in guest form.* Rejected: the
  register gives a guest no cart, no upload, no message, and no merchant area.
- *Redirecting a guest to sign-in and back afterwards.* Deferred to the slice
  that ships the merchant area's pages, because R1 ships no page a guest could
  return to.
- *A generic error page when the session ends.* Rejected: it tells the merchant
  nothing about what to do next.

**Consequences and migration/backfill.** The constitution moves to **3.5.0**;
`version.json`, the ADR ranges, `Project-Technologies.txt`'s header, the drift
check's citation lists, and the R1 specification (FR-047, FR-048, FR-049,
FR-050, AC-051 … AC-054) move in the same change. The R1 checklist's counts move
to 50 FR and 54 AC. ADR-099 carries an annotation for the refinement of its
decision 5. R4 verifies the frame's runtime behaviour, R7 delivers the Profile
page's settings section, and R13 delivers the administrator application's header.
Review date: 2026-11-20. This entry is the durable record.

---

## ADR-101 — The account menu's behaviour and the appearance's ownership

**Status**: Accepted — 2026-10-21
**Owning directory**: `specs/001-identity-foundation/`, `docs/`, `ROADMAP.md`, `AGENTS.md`, `README.md`, `Project-Technologies.txt`, `governance-drift-check.mjs`, `.githooks/`
**Owning feature**: none — product clarification ratified by the repository owner; R1 binds the rules, and R4 and R7 deliver them.

**Context.** A second clarification session on 2026-10-21, after ADR-099 and
ADR-100, settled five points the R1 specification still left open: whether the
background and its colour are a product setting, what closes the account menu,
what «حسابي» shows, what the merchant sees after confirming the sign-out, and
what the account control's accessible name is. None of them changes a page, an
entity, a role, or a limit; each one removes a phrase a test could not assert.

**Decision.**

1. The appearance's surfaces, backgrounds, and colours are Wafar UI layer
   values, not a product setting. Neither a merchant nor the administrator
   chooses a background or a colour, and no such preference is stored on the
   account or in the platform's settings. The Wafar UI layer records the values
   and this slice's plan carries them; no requirement, entity, or slice is
   added.
2. The account menu closes without action when the person presses Escape,
   activates something outside it, or moves the focus out of it, and the focus
   returns to the account control in every case.
3. «حسابي» shows the account's full name, its city, and its status — active or
   blocked — and no other account field. The mobile number and the editable
   account details belong to the settings section, so the item that opens the
   page shows a summary and the item that opens the settings section shows and
   changes the details.
4. After the merchant confirms the sign-out in the account menu, the same
   ended-session state FR-049 requires when a request is refused is shown in
   the page they were on, so both ways a session ends lead to one outcome.
5. The account control's accessible name is «حسابي», and the header shows the
   icon alone with no merchant name in it; the merchant's name is available
   inside the account menu's «حسابي» item.

**What deliberately did not change.** No page, entity, role, product feature,
usage limit, security rule, technology, or constitution version changed by this
record; the constitution stays at 3.5.0. ADR-099's composition and ADR-100's
answers stand, and this record only completes them. No application code,
package, CSS, or font file was created.

**Alternatives considered.**

- *A background or colour a merchant or an administrator chooses.* Rejected: it
  would add a preference, an entity, and a slice, while the appearance's values
  already belong to the Wafar UI layer (ADR-098).
- *Closing the menu with Escape alone.* Rejected: it leaves the pointer path
  undefined and the menu open by accident.
- *Showing the mobile number and the session list in «حسابي».* Rejected: the
  number is the identifier and belongs with the editable details, and the
  sessions list belongs with the action that ends them.
- *A dedicated signed-out page after the sign-out.* Rejected: the ended-session
  state the frame already shows keeps the merchant in place and tells them what
  to do next.

**Consequences and migration/backfill.** The R1 specification's FR-023, FR-025,
FR-047, FR-049, AC-022, AC-025, AC-051, and AC-053 carry the rules, and the ADR
ranges move to ADR-101 in the same change. The requirement and criterion counts
are unchanged at 50 FR and 54 AC. R4 verifies the menu's behaviour at runtime,
and R7 delivers the Profile page's summary and settings section. Review date:
2026-11-20. This entry is the durable record.

---

## ADR-102 — The header's theme switch and the notifications bell

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `Core-Project.txt`, `specs/001-identity-foundation/`, `governance-drift-check.mjs`, `.githooks/`
**Owning feature**: none — product correction ratified by the repository owner; R1 builds the frame.

**Context.** ADR-099 (2026-10-21) made the header a brand-and-account band: the
platform's logo/home control at its inline-start edge and the account control at
its inline-end edge, with the theme switch and the sidebar-collapse control in
the sidebar and no notifications control in the header at all — the unread count
moved to the Notifications sidebar item, and the header bell was not built. The
operator has now decided the header carries the appearance control again, beside
a notifications control, drawn with the crescent glyph of the registered icon
set.

Three sources already pointed at that arrangement, and ADR-099 moved past them:

- **ADR-006** (2026-10-01) decided that "the mode toggle sits in the header,
  adjacent to the notifications icon". That placement was never annotated after
  ADR-099 moved the toggle into the sidebar, so the record still reads as the
  header's rule.
- **`Core-Project.txt`** states that the notifications "تظهر في أيقونة الجرس مع
  عداد" — a bell with a counter — while its header section says the header
  carries no notifications icon.
- **`docs/domain-model.md`** states that "the count in the header is the number
  of the user's unread notifications". ADR-099 did not amend that file, so the
  invariant it states was left naming a header count that the header no longer
  carried.

The default appearance is a separate question and is unchanged: ADR-098 fixed
light as the Wafar UI layer's default, and ADR-006's "dark mode by default" was
never annotated as superseded by it. ADR-102 closes that gap as well.

**Decision.**

1. The header carries four controls. At its inline-start edge sits the
   platform's logo/home control. At its inline-end edge, reading from
   inline-start to inline-end, sit the notifications control, the theme switch,
   and the account control — so the theme switch is immediately beside the
   notifications control, and the account control keeps the inline-end edge.
   The header carries no page-navigation link.
2. The theme switch leaves the sidebar. The sidebar carries the platform's
   navigation item list and the sidebar-collapse control, and nothing else
   changes about it — its position at the inline-start edge, its full and
   icon-rail and drawer widths, and the collapse control's behaviour all stand.
3. The notifications control returns to the header and carries the unread count.
   The Notifications sidebar item carries no count, so the count has one source
   and one surface. This reverses ADR-099's seventh decision.
4. The theme switch's icon is the crescent moon of the registered IconPark set,
   drawn through `WfIcon` alone: `icon-park:moon` in the colour set and
   `icon-park-outline:moon` in the outline set. Which of the two the Wafar UI
   layer uses follows ADR-098's rule; there is no emoji and no second icon
   family. The switch's current state is carried by its accessible name and its
   pressed state, not by a second glyph.
5. The default appearance is unchanged: light (ADR-098), remembered in the
   browser the person is using, per device, applied before the page is painted
   so the other appearance never flashes, and never stored on the account.
   ADR-006's dark default is not restored.
6. A guest sees the sign-in action in place of the account control and the
   notifications control — ADR-094's rule, which reads correctly again now that
   the header carries a notifications control — and keeps the theme switch,
   which now sits in the header.
7. R1 builds the header's composition, including the notifications control as a
   link to the route R1's own decision record already fixes for the
   Notifications destination; no route is added. The unread count and the
   Notifications page arrive with R9, which also adds the counter component to
   the Wafar UI layer. No page, route, entity, role, product feature, or usage
   limit is added, and the Product Register stays at twenty-six pages.

**What deliberately did not change.** The three surfaces — the public site, the
merchant area, and the administrator's separate application — and the bare
scope; the administrator application's own shell and header; the sidebar's item
list, its eight destinations, and the collapse control; the account menu's three
items and the sign-out confirmation; the appearance's ownership, which remains
the Wafar UI layer's and not a product setting (ADR-101); the default
appearance's being light (ADR-098); the icon set, the typeface, and the palette
as Wafar UI layer values (ADR-098); the twenty-six pages, the twelve entities,
the three roles, the sixteen product features, and every usage limit; every
technology in the register. No application code, package, CSS, or font file is
created by this record.

**Bookkeeping corrected in the same change.** Three statements had drifted from
the record, and the files that carry them are in this record's owning set.
`AGENTS.md` §6 counted twenty-three decision records without an
`Alternatives considered` section where the true count is twenty-four: ADR-092,
recorded after ADR-090, is the twenty-fourth, and ADR-090 now carries the
annotation that says so. The same section named the pre-R1 foundation as `W1`,
an identifier no file defines and no decision record introduces; it now cites
ADR-097 and ADR-098, the way the roadmap names the foundation. `ROADMAP.md`'s R1 row moves to
`in-progress` with `specs/001-identity-foundation/` in its `Sub-spec` column,
because that sub-spec exists and opens with the required `**Input**:` line; no
other slice row changes.

One promise the drift check made was also unkept: its reference pass resolved
`ADR-NNN` over a fixed list of fifteen files, although `AGENTS.md` §5 and
`README.md` both state that every reference is resolved. The feature
specifications were outside that list. The pass now runs over the same file set
as the range pass, which ADR-096 had already extended to `specs/`, so a
specification's reference is resolved instead of passing unseen. No verdict
changed: every reference the wider pass reaches already resolved.

**Alternatives considered.**

- *Keep the switch in the sidebar and add the bell to the header.* Rejected: two
  controls for one appearance, and the sidebar is the navigation's home, not the
  appearance's.
- *Restore ADR-006's dark default together with the header switch.* Rejected:
  ADR-098 fixed light and the operator did not revisit it; the placement is
  restored, the default is not.
- *Give the header a bell without a count and leave the count on the sidebar
  item.* Rejected: one number shown on two surfaces invites a disagreement
  between them, and the count belongs on the bell the product mirror already
  names.
- *Show the guest an empty bell.* Rejected: a guest has no notifications, and
  ADR-094 already fixes the sign-in action in place of the account and
  notifications controls.
- *Swap the glyph between a moon and a sun to show the current appearance.*
  Rejected: the control's meaning then depends on a second glyph and on the
  direction of the swap; the crescent marks the control and the accessible name
  and the pressed state carry the state.

**Consequences and migration/backfill.** The constitution moves to **3.6.0**
(MINOR): the shared shell's header composition changes, so this is not a PATCH.
Both places the constitution states that composition — the Product Scope
shell paragraph and the Product Fact Clarifications bullet — move together, so
the document states one rule once. `version.json`, the live ADR ranges, `Project-Technologies.txt`'s header ADR
list, the R1 specification (FR-020, FR-023, FR-025, FR-039, AC-022, AC-025,
AC-027, AC-042, and the clarifications they carry), the R1 checklist,
`Core-Project.txt`'s header, sidebar, and Notifications sections,
`docs/domain-model.md`'s
Notification invariant, the ROADMAP's R1, R9, and first-obligations rows, the
drift check's own citation list, and the pre-commit hook's citation line move
in the same change. ADR-006, ADR-016, ADR-017, ADR-090, ADR-094, and ADR-099
carry annotations; their decisions are not rewritten. The drift check's
reference pass now runs over the same file set as its range pass, so an
`ADR-NNN` reference in a feature specification or in one of the two Arabic
mirrors is resolved instead of passing unseen; `AGENTS.md` §5 states that every
reference is checked, and the file set it named was the narrower one. Review
date: 2026-11-20. This entry is the durable record.

---

## ADR-103 — The amendment procedure's version sources, and the index column the check verifies

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `governance-drift-check.mjs`
**Owning feature**: none — governance record ratified by the repository owner; the check it adds is wired into the committed `pre-commit` hook and into R1's continuous integration.

**Context.** A review of the constitution's amendment procedure found two defects
in the same clause. The clause opens "On every amendment the version lives in
exactly two places" and then lists three numbered sources, the third being the
ADR index row and the ADR the amendment records. The count and the list
contradicted each other, and the sentence that follows the list — "reads the
version from one of the two sources above" — pointed at two again. The second
defect sat behind the first: the ADR index's `Constitution version` column
records the version each ADR produced, so the version was in fact written in a
third place, and the drift check compared the constitution's footer with
`.specify/memory/version.json` without ever looking at that column. A version
that moved in the footer while the index column stayed behind was therefore
invisible to the check, and the column could claim a version the constitution
never reached.

**Decision.**

1. The amendment procedure's clause is corrected: the version lives in exactly
   **three** places, and the list says so. The three are the constitution's
   version footer, `.specify/memory/version.json`, and the ADR index row with
   the ADR the amendment records. The ADR index row's constitution-version
   column names the version that ADR produced, and the clause now says so
   explicitly.
2. The sentence that follows the list is corrected with it: a document names
   the constitution and reads the version from one of the **two version
   sources** — the footer and `version.json` — which is what it meant, since
   the third source is the durable record of the amendment rather than a
   source a document reads its version from.
3. The drift check gains a check **J**, which verifies that the ADR index's
   constitution-version column agrees with the footer's version: no cell may
   claim a version the constitution never reached; the column may never move
   backwards down the table, because an ADR ratified later cannot claim a
   version older than the one before it; and the last index row must name the
   footer's version. A cell that is neither a version nor the em dash the
   bootstrap-era records use is a defect.
4. This record is a **governance record**, not a technical decision: its
   subject is the constitution's own text and the governance tooling, which is
   outside the reach of the `Alternatives considered` field (ADR-090), so that
   section is not written for it.
5. The constitution moves to **3.6.1** (PATCH): the clause is a correction of a
   count and a wording, and no principle, section, register, or rule changes
   meaning, so this is not a MINOR. `version.json` moves with it.

**What deliberately did not change.** The amendment procedure's substance: the
requirement that an amendment be explicitly ratified, bump the version, and
record itself durably; the stamp sites; the precedence rule; the exception
register; the review trigger; every principle, binding section, register, page,
feature, entity, role, and usage limit; the technology register; and every
decision record already ratified. The drift check's existing checks A through
I are untouched, and the check remains read-only and dependency-free.

**Consequences and migration/backfill.** `version.json` moves to 3.6.1 and
names this record as the one that moved it. The live `ADR-001 … ADR-102` range
strings become `ADR-001 … ADR-103` in the same change, because the range
string's authority is the index's last row. The drift check's own header, its
report line, and the constitution's `References` row for the check are updated
to name ADR-103 and check J, and `AGENTS.md` §5 and `README.md` state the new
coverage, because those documents enumerate what the check verifies and a
description that omits a check is a description that drifts. No migration or
backfill is required: a PATCH carries no schema, and the column the check reads
was already populated for every index row.

**Follow-ups.** The check reports the column's state but does not write it, so
the column stays a record a human maintains at the moment an ADR is written;
the next amendment that touches a version column should confirm the column
remains the only place the version is written outside the two sources.
Review date: 2026-11-20. This entry is the durable record.

---

## ADR-104 — The audit fix set: the governance wording, the mirror corrections, and the R1 concentration

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `docs/`, `AGENTS.md`, `ROADMAP.md`, `Core-Project.txt`, `docs/CHANGELOG-mirror.md`, `specs/001-identity-foundation/`
**Owning feature**: none — governance record ratified by the repository owner; the corrections below are carried by the documents that own them.

**Context.** A deep review of the constitution, the two Arabic mirrors, the
architecture and domain-model documents, the roadmap, and the R1 specification
found the governance set sound in substance and a set of defects in wording,
placement, and internal consistency. The review found no leak of a reserved
fact, no breach of the specification's technology-agnosticism beyond two
residuals, and no defect in the drift check's coverage of the version sources.
The defects it did find fell into three groups: a sentence in the constitution's
Governance section that named the binding sections as if they were the
procedure they share; three documents that carried a claim the register had
already superseded or had never stated; and two roadmap gaps that the slice
order left open between a slice and the slice that owns the half of the work it
triggers. A fourth group was a structural mis-grouping in the R1
specification's acceptance criteria, and a fifth was a concentration of duties
in R1 that the roadmap described in two ways at once.

**Decision.**

1. **The Governance paragraph is reworded, not changed.** The paragraph that
   says every principle and every MUST in the sections above is binding with
   the same force and is "resolved, reviewed, and excepted by exactly the same
   procedure: Query Safety and Secrets, Schema and Migration Control, …" read
   as if those section names were the procedure. They are not: they are the
   sections the procedure applies to. The paragraph now says that the
   procedure is the one every binding section shares and is named in that
   paragraph rather than restated by each section, and it then names the
   sections and the ten principles. No principle, section, register, page,
   feature, entity, role, or usage limit changes, and the binding set is
   identical before and after.
2. **`AGENTS.md` §3 names the section the constitution actually has.** The
   reading protocol for `/speckit.specify` named "Usage Limits" as a section.
   The constitution's Usage Limits is a table inside Performance Budgets and
   Verification, and the constitution's own reading protocol names it the same
   way. The agent instruction file now names the table and the section it
   lives in, so the two protocols agree on what a reader opens.
3. **The product mirror's soft-deletion note no longer reads as if a block
   deleted a user's rows.** `Core-Project.txt` recorded that "deletion is soft
   for files and users" and that blocking a merchant does not delete their
   public files. Read together, the two clauses could be taken to say that a
   block removes a user's rows, which the register forbids: blocking withdraws
   access and removes nothing. The note now says so explicitly, and the
   sentence that tied the mirror's note to the register is preserved.
4. **The product mirror's admin-application page table says why its numbering
   restarts.** The mirror numbers the platform's twenty-six pages 1 to 26 and
   then numbers the administrator application's ten pages 1 to 10, which reads
   as a contradiction in a single document. The administrator table now
   carries a note that the first numbering counts the platform's pages and the
   second counts the administrator application's own, and that the register is
   the authority for the total.
5. **The mirror changelog's dead references are marked as historical.** The
   changelog's 2026-10-03 block names the constitution's "Design System
   Standards" section and the file `wafar.single.css`, both removed by ADR-093.
   The changelog is history, but a reference to a section that no longer exists
   reads as a live pointer, so each affected row now carries the section's
   name as it stood on 2026-10-03 and the record that removed it.
6. **The domain model distinguishes a schema decision from a registered
   product fact.** Two of its unresolved facts — how a message's sender is
   represented, and whether a conversation carries an administrator reference
   — were described beside the others as facts the constitution's register owns.
   They are not: the concepts are already fixed by the register, and only their
   representation is open, so the answer changes no product fact and requires no
   register amendment. The document now says so, names the rows that are
   registered facts instead, and states the consequence for R10 — an ADR and a
   change to the domain model, and a register amendment only if the answer
   turns out to need a product fact the register does not carry.
7. **R1's concentration is declared, with a remedy, instead of being
   restructured.** The roadmap's "First obligations" table assigns R1 more than
   half its rows, because the constitution names a duty by the milestone that
   first triggers it and R1 triggers most of them at once. Moving a duty would
   break the milestone the constitution names, and creating a slice for the
   remainder would be the classification error ADR-007 prohibits — the
   foundation is project-level work, not a feature. The roadmap now records the
   concentration as a declared risk with its procedural mitigation — R1's plan
   sequences the foundation in a foundation phase, records the concentration in
   its Complexity Tracking table, and carries a review date of 2026-10-21 — and
   states that the pre-R1 foundation named in R1's row is that phase, not a
   numbered slice and not a second feature. The remedy if the slice cannot be
   sequenced into reviewable increments is a decision recorded as an ADR.
8. **Two roadmap gaps are recorded as defects with the slice that closes
   them.** The Parts table renders the cart control while the cart action and
   the `bookmarks` module are R8's, so the window between the two slices is
   now defect 17; and the catalog-delete cascade's bookmark leg belongs to a
   module that does not exist when the routine is written, so the two halves of
   one rule live in two slices, now defect 18. R5's and R8's rows name the
   defects they carry.
9. **The R1 specification's acceptance criteria are grouped by the user story
   they actually serve.** Four criteria — the account menu, the guest's
   redirection, the ended-session state, and the administrator application's
   header — sat under the user story that resists automated abuse, because
   three later clarification sessions appended them to the end of the
   specification's last section. They are frame criteria and administrator
   criteria, and they now sit under the stories they serve; the ordinals were
   renumbered in document order, the seven "Acceptance Scenarios" lines were
   rewritten from the actual grouping, and no identifier was renumbered,
   reused, or withdrawn. The specification also states that its requirements
   are grouped by subject rather than by identifier, so a reader does not
   mistake the order for a numbering, and it now describes the session's
   browser-held reference in terms that match the constitution's rule that a
   session is never recoverable from browser storage.
10. **This record is a governance record**, not a technical decision: its
    subject is the constitution's own text, the mirrors, and the process, which
    is outside the reach of the `Alternatives considered` field (ADR-090), so
    that section is not written for it.
11. The constitution moves to **3.6.2** (PATCH): the Governance paragraph is
    reworded, and no rule changes meaning, so this is not a MINOR.
    `version.json` moves with it.

**What deliberately did not change.** Every principle and binding section; every
register — the pages, the features, the entities, the roles, the usage limits,
the product features, and the unresolved product facts; the product scope; the
technology register and its gaps; the Wafar UI layer's path and visual
foundation; the slice count, the slice order, and the slice identifiers; the
exception register; the amendment procedure and the versioning policy as
amended by ADR-103; the drift check's checks A through I; and every decision
record already ratified. **No slice is added, removed, renumbered, or
reordered**, and no product behaviour changes: the corrections are to wording,
to placement, and to the record of a gap.

**Consequences and migration/backfill.** `version.json` moves to 3.6.2 and names
this record as the one that moved it. The live `ADR-001 … ADR-103` range strings
become `ADR-001 … ADR-104` in the same change, because the range string's
authority is the index's last row, and the drift check verifies them. The
specification's corrections carry no identifier change, so no task, criterion,
or requirement reference outside the specification is affected. No migration or
backfill is required: a PATCH carries no schema, and every correction above is
to a document's wording or to a document's own placement.

**Follow-ups.** Two items from the same review were checked and found already
correct, and are recorded here so a later reader does not re-open them: the
technology mirror's PgDog row already binds the AGPL-3.0 licence to the
constitution's licence treatment for infrastructure services, with its fallback
and its review date, and the R1 specification's identifier set was already
contiguous and free of dangling references. The review's one remaining
structural observation — that R1's own specification is a large artifact — is
recorded in that specification's checklist rather than here, because the
constitution's own rules govern it and no rule is broken by its size.
Review date: 2026-11-20. This entry is the durable record.

**Annotation (2026-10-24, ADR-123).** Item 6's account of which rows are
registered facts is corrected: rows 9 through 11 are field-level facts on
registered entities, not register facts. The constitution's Data entities rule
changes an entity's shape only through `docs/domain-model.md` and an ADR, and
`Catalog`'s one-line meaning registers neither a byte count nor a content type.
Item 6's own caveat — a register amendment only where the answer needs a product
fact the register does not carry — states the governing rule.
