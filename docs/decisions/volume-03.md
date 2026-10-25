## ADR-050 — Constitution 2.18.8: audit fix set — the stamp set committed, and the registry claims that failed verification

**Status**: Accepted - 2026-10-05 | **Constitution version**: 2.18.8

**Owning directory**: `.specify/memory/`, `.specify/integrations/`,
`.specify/templates/`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`
**Owning feature**: none - governance decision; ratified by the repository owner

**Context.** ADR-049 was raised to close a repeated defect: the 2.18.x amendment
set went uncommitted, and its stamp sites drifted. A verification pass over the
tree ADR-049 produced found that ADR-049 committed none of that. Six findings,
none of them visible by reading a single file, since each is a disagreement
*between* a register and the artefact it describes:

1. The constitution's own version footer read 2.18.5 while the nine dependent
   stamp sites read 2.18.7. ADR-049's Decision stated the footer stood at 2.18.7
   and its Consequences stated that every stamp in the repository read 2.18.7.
   Both sentences were false of the tree they shipped in.
2. All five override hashes in `.specify/integrations/speckit.manifest.json`
   described the pre-edit override files. ADR-047 had re-recorded hashes for the
   same reason; the practice was not carried forward.
3. The 2.18.6/2.18.7 change set was still uncommitted, which is the exact
   condition ADR-047 recorded and ADR-049 recorded as having recurred.
4. Two edits inside that set — the `workflow.yml` hook-slot note and the
   `AGENTS.md` §5 rewrite — were recorded by no decision item.
5. The Design System Standards' unused-token note claimed the whole shadow
   ladder was "declared, but unused". Nine of the named shadows are
   consumed by `wafar.single.css`, including `--shadow-md` and `--shadow-focus`.
   Single-Reference Sufficiency requires a register row to name a value its
   source actually defines, so the note described a state that does not exist.

   **Correction (2026-10-05, ADR-053).** The count "nine of the twenty named
   shadows" was wrong: `wafar.single.css` declares **fifteen** named shadows
   (`card`, `card-raised`, `cinematic`, `cinematic-hover`, `cinematic-panel`,
   `control`, `focus`, `glass`, `inner`, `none`, `overlay`, `panel`, and the
   `brand-sm`/`brand-md`/`brand-lg` triple), of which nine were consumed at the
   time and twelve were not. ADR-053 completed the enumeration, which had
   omitted `cinematic-hover` and `cinematic-panel`, and the register now reads
   sixteen named shadows after this change added the hairline, navbar, and glow
   steps.
6. `ROADMAP.md` assigned three slices to write values into Constitution Mandated
   Values that the CMV list does not contain, and the list is closed; the
   Register-gaps rule puts a gap's choice in the plan's Complexity Tracking
   table instead.

**Decision.**
1. **The version footer moves to 2.18.8** and every stamp site the Governance
   amendment procedure names moves with it: `docs/architecture.md`,
   `docs/domain-model.md`, `ROADMAP.md`, `Project-Technologies.txt`, the binding
   blocks of the spec, plan, tasks, and checklist overrides, and the scaffold
   footer of the constitution-template override. The 2.18.5/2.18.6/2.18.7 stamp
   drift is closed in the same change that commits it, which is what ADR-047 and
   ADR-049 each intended and neither achieved.
2. **The five override hashes in `speckit.manifest.json` are re-recorded** from
   the files as committed, per ADR-022, ADR-024, ADR-027, ADR-033, and ADR-034.
   The hash set is regenerated as the last step of the change, after every file
   the manifest describes is final, so no hash describes a pre-edit file.
3. **ADR-049 gains a decision item and an Owning directory that match what it
   shipped.** Item 9 records the two undocumented edits, and the Owning
   directory names all eleven paths the change touched. ADR-049's Consequences
   is annotated rather than deleted, because its false claim is the evidence for
   this record.
4. **The unused-token note is rewritten to the state the stylesheet is in.** The
   size ladder through `--shadow-2xl`, plus `--shadow-card`,
   `--shadow-card-raised`, and `--shadow-focus`, are declared and consumed. The
   remaining named shadows and the `brand` triple are declared-but-unused, and
   `--sidebar-width`, `--navbar-height`, `--touch-floor*`, and every `--screen-*`
   token keep the unused status they actually have.
5. **`ROADMAP.md`'s three register-gap obligations name the right artefact.**
   The Redis client, OpenSearch client, and Arabic analyzer rows now say the
   choice is recorded in the plan's Complexity Tracking table with an ADR, which
   is what the Register-gaps rule requires. The extraction-libraries row is
   unchanged: the CMV list does contain that value.
6. **Eleven records gain the ownership stamp they were missing.** ADR-020
   through ADR-030 carried a Status/Date/version header and nothing else, which
   the Documentation rule forbids: it requires the owning directory and the
   owning feature to be named. Each now names both, using the directory that owns
   its decision.
7. **Four records that recorded no alternatives gain an Alternatives section.**
   ADR-039, ADR-047, ADR-048, and ADR-049 were non-trivial decisions written
   without the alternatives the Documentation rule requires. Each section records
   options that were genuinely weighed, and each is marked as added in this
   change. The records' Decisions are not rewritten.
8. **Records are annotated and text is corrected where it was wrong.** ADR-007
   and ADR-027 pointed at `.clinerules/project-context.md`, a
   directory ADR-048 retired; each is annotated, per the rule that a decision
   record is a history. **Corrected 2026-10-06 (ADR-058):** this item originally
   named ADR-026 rather than ADR-027. ADR-026 never named that path — its Owning
   directory is `.specify/`, `docs/`, `.specify/extensions/git/` — so it needed
   no annotation, and the claim that it carried one was false. ADR-037 and
   ADR-038 name the same retired path and were unannotated; ADR-058 annotates
   both, which this item did not cover. ADR-013's Decision claimed converge was kept "outside the
   workflow file" while the file it names as its Owning directory declares
   `converge` as a step, and its "matching upstream v1.0.13 exactly" claim was
   overtaken by ADR-021; its Decision text is corrected. ADR-017's "19rem fixed on
   desktop" is annotated, because ADR-037 narrowed "fixed" to mean always-present
   with a collapse-to-icon-rail. ADR-035's Context quoted its own subject — the
   mojibake it repaired — with two characters of each sequence instead of three;
   it now names the codepoints.
9. **This file's preamble is corrected.** It claimed every record is owned by
   `docs/` and that every record since ADR-007 was a constitutional amendment.
   Neither is true, and the Documentation rule's two requirements were restated
   from the rule rather than asserted about the records.

**Alternatives considered.**
- *Commit the 2.18.6/2.18.7 set first, then raise this record separately.*
  Rejected: the stamp defect is that the set was committed without its stamps
  moving. Two commits reproduces the condition this record closes — the second
  would land with its own stamps already stale.
- *Treat the wrong footer and the stale hashes as a tooling problem and let a
  script own the stamps.* Rejected: a script that maintains the stamps would be a
  second authority over the constitution's version, and the Governance amendment
  procedure already names the stamps as a duty of the amendment.
- *Rewrite ADR-039, ADR-047, ADR-048, and ADR-049 with Alternatives sections
  integrated rather than marked as added.* Rejected: none of the four is
  committed-and-final history in the sense that forbids it, but none of them was
  written with its reasoning captured, so the sections are reconstruction. Marking
  them as reconstruction is more honest than presenting them as contemporaneous.
- *Close the exception-register gap inside this record rather than raising ADR-052.*
  Rejected: a granted exception is an instrument the constitution keeps separate
  from the decision log, and its two rows name review dates that a later audit
  must be able to find by looking in one place.
- *Delete the two ADR rows for the granted exceptions and drop the word
  "exception" from the register instead.* Rejected: the register genuinely grants
  something — ClamAV and Lighthouse CI are named dependencies that the
  Dependency Governance rule would otherwise prohibit. Deleting the word would
  leave an unrecorded exception, which the rule calls a violation.

**What deliberately did not change.** No principle, register row count, entity,
page count, Usage Limit, slice order, or dependency. The shadow ladder's values
and the stylesheet are untouched; only the register's description of them
changed. `wafar.single.css` was not modified. The eight `--screen-*` tokens and
their unused status are unchanged, and no slice is given a new obligation by this
record. (Corrected 2026-10-05 by ADR-053: the count was nine; the stylesheet
declares eight, which ADR-009, ADR-016, and ADR-039 all stated.) The Bootstrap-era ADR-001 through ADR-006 keep their original
`none yet - repository bootstrap` stamps including their ASCII hyphens: this
record did not retro-format ratified history.

**Consequences.** Every stamp site the Governance amendment procedure names
reads 2.18.8, every override hash describes the committed file, and the
2.18.6/2.18.7/2.18.8 set is committed as one change, so the stamp drift class
ADR-047 and ADR-049 each recorded is closed in the same change that raised the
third attempt. Every record in this file names an owning directory and an owning
feature. Four records record their alternatives. The unused-token note now
matches the stylesheet. This entry is the durable record.

---

## ADR-051 — A tenant is a merchant account

**Status**: Accepted - 2026-10-05 | **Constitution version**: 2.18.8

**Owning directory**: `.specify/memory/`, `docs/domain-model.md`, `docs/architecture.md`
**Owning feature**: none - governance decision; ratified by the repository owner. R2 is the first slice to implement merchant scoping.

**Context.** Schema and Migration Control requires that every table holding
tenant-owned data carry a tenant identifier as a foreign key, that every
tenant-scoped index carry it, and that every read and write be tenant-scoped at a
single shared entry point with a test that fails when the invariant breaks. The
same scoping appears in Authorization and Access Control, in Deployment and
Observability's tenant-isolation verification, and in `ROADMAP.md`, which assigns
the query-path test and the shared entry point to R2.

The word "tenant" appeared twelve times and was defined in none of them. No
`Tenant` entity exists in the Product Register's Data entities, and that register
forbids adding one without an amendment. No entity in `docs/domain-model.md`
carries a tenant column. The requirement was therefore an invariant with no
subject: R2 was ordered to implement and test a scope that nothing declared.

**Decision.**
1. **A tenant is a merchant account.** The tenant identifier IS the `User`
   identifier. No `Tenant` entity is introduced, so the Data entities register is
   unchanged and no amendment to it is required.
2. **The scoping column is `user_id`, referencing `User`.** It appears on every
   merchant-owned table — `Catalog`, `Bookmark`, `Notification`, `Conversation`,
   `Message`, `ContactMessage` — and leads every index serving a merchant-scoped
   query.
3. **`Supplier` and `AuditLog` carry no scoping column.** `Supplier` is
   platform-wide, since one company appears in many merchants' catalogs, and
   `AuditLog` records administrator operations, which have no merchant owner.
   Neither is merchant-scoped and the isolation test covers neither.
4. **"Tenant isolation" is renamed "merchant isolation"** wherever it named a
   rule. The obligation is unchanged; only the term that had no referent is
   replaced by the one that does.
5. **R2 implements this.** It adds `user_id` to its schemas, applies scoping at
   the single shared entry point it already owns, and adds the query-path test.
   The test is the proof that the invariant is not merely stated.

**Alternatives considered.**
- *Introduce a `Tenant` entity and treat the marketplace as multi-tenant, with
  each merchant account as a tenant.* Rejected: the platform is one Libyan
  marketplace, and the isolation boundary the rules protect is one merchant's rows
  against another's, which `User.id` already expresses. A `Tenant` row per
  merchant duplicates `User` and adds an entity the Product Register would have to
  carry for no distinction a reader could observe.
- *Declare the platform single-tenant and remove the four MUSTs as inapplicable.*
  Rejected: it would forfeit a real protection. The isolation test is what stops
  one merchant's catalog query from returning another's, and that breach is
  possible in a single-tenant platform. Removing the rule removes the test with it.
- *Leave "tenant" undefined and let R2's plan define it.* Rejected: R2 is the
  first merchant-scoped query surface, so the definition would arrive at the same
  moment as the code that depends on it, with no record to reconcile against. A
  register that mandates a MUST over an undefined term is the defect this record
  closes.
- *Scope the tables by `Catalog` rather than by `User`.* Rejected: `Part`,
  `Bookmark`, and `Notification` are read and written without joining a catalog
  on the request path, so a catalog-scoped column would have to be denormalised
  onto every table and would not be a foreign key to anything.

**What deliberately did not change.** No entity, no page, no Usage Limit, no
slice order, and no row count in the Data entities register. `Supplier` and
`AuditLog` keep their existing shape. The authorization model remains a deferred
area owned by R13, and this record does not anticipate it; it fixes only the
scope those rules already required.

**Consequences.** Four rules that mandated an undefined invariant now name a
defined one, and R2's test has a subject to test. `docs/domain-model.md` carries
the invariant as a merchant-ownership section, so a slice reading the domain
model finds the scoping column and the two unscoped tables without reading the
constitution. This entry is the durable record.

**Annotation (2026-10-05, ADR-053).** Decision item 2 named six tables carrying
`user_id`, `ContactMessage` among them. That entry was wrong against the source
this record amends: `docs/domain-model.md` stated twice, before and after this
record was ratified, that a `ContactMessage` is independent of any account and
carries the submitter's name and phone *instead of* a foreign key, and its
relationship diagram marks it "no user; the submitter may be a guest". The public
contact form is an intake whose only read path is the administrator's, so a
scoping column on it could never be used as a scoping key. The record is
annotated rather than rewritten, because a decision record is a history; ADR-053
carries the correction and the constitution's Schema and Migration Control now
names `ContactMessage` among the tables that carry no tenant identifier.

---

## ADR-052 — The two granted dependency exceptions are recorded in the exception register

**Status**: Accepted - 2026-10-05 | **Constitution version**: 2.18.8

**Owning directory**: `.specify/templates/exception-register.md`, `.specify/memory/`
**Owning feature**: none - governance decision; ratified by the repository owner

**Context.** The Approved Technology Standards register names ClamAV and
Lighthouse CI, and describes each as "registered with an explicit exception — a
scanner, not a runtime dependency" and "a CI gate, not a runtime dependency".
Both are genuine exceptions: Dependency Governance prohibits a dependency absent
from the register, and the register's own rationale for each is that the tool is
not a library the application imports.

The Governance section states that every exception MUST be recorded with the
principle, the exact scope, the rationale, the approver, and a review date, and
that the register MUST NOT be satisfied by a comment in code. The register at
`.specify/templates/exception-register.md` read "No exceptions recorded". Two
exceptions were therefore granted in the Approved register and recorded nowhere
else, which is the condition the rule calls an undocumented violation.

**Decision.**
1. **Two rows are added to the exception register**, `EX-001` for ClamAV and
   `EX-002` for Lighthouse CI. Each names the Dependency Governance principle,
   the exact scope, the rationale, the repository owner as approver, and a review
   date, as the register's own rules require.
2. **The Approved register cites the rows** rather than repeating the word
   "exception" on its own authority. A register row that grants an exception must
   point at the register that records it, or the exception exists in two places
   and neither is authoritative.
3. **Each scope states the condition under which it ends**, which the register's
   usage rules require and which the Approved register's wording did not.

**Alternatives considered.**
- *Delete the word "exception" from both Approved-register rows and treat them as
  ordinary dependencies.* Rejected: it would leave the Dependency Governance rule
  breached without any record of the breach, which is what the exception register
  exists to prevent. ClamAV is not imported by the application and Lighthouse CI
  does not run in the application; recording them as ordinary dependencies would
  misdescribe both.
- *Amend Dependency Governance to carve out non-library tools instead of granting
  per-tool exceptions.* Rejected: the carve-out would be permanent and unfalsifiable.
  A per-tool row with a review date can be closed when the tool changes role, and
  the register's own rules require that a row name an approver and a date for
  exactly that reason.
- *Record the exceptions inside ADR-050 rather than in the register.* Rejected: the
  constitution keeps the exception register and the decision log as separate
  instruments, and a later audit looks for a granted exception in the register. A
  row that exists only in a decision record satisfies the word "exception" and not
  the rule.

**What deliberately did not change.** The Approved register keeps both rows and
their dependencies; no dependency is added or removed, and Dependency Governance
is unchanged. ClamAV and Lighthouse CI remain required by File Processing Rules
and Performance Budgets and Verification respectively.

**Consequences.** Two exceptions are now recorded where the rule says they must
be, each with a review date a later audit can act on. A reader checking whether a
dependency is permitted finds the answer in the exception register rather than
inferring it from the Approved register's prose. This entry is the durable record.

**Annotation (2026-10-08, ADR-074).** The Context above quotes the register as reading "No exceptions recorded". ADR-054 restructured it into its current `Register` and `Closed` tables, so that phrase is no longer in the file, and the register now carries six rows (EX-001 … EX-006: the two this record added, plus four added by ADR-054). The decision is unchanged; only the quoted state of the file is superseded.

---

## ADR-053 — Constitution 2.18.9: the design-system enforcement scope, the motion scale, the scoping contradiction, and the register counts that failed verification

**Status**: Accepted - 2026-10-05 | **Constitution version**: 2.18.9

**Owning directory**: `.specify/memory/`, `wafar.single.css`, `docs/domain-model.md`,
`docs/architecture.md`, `docs/DECISIONS.md`, `Project-Technologies.txt`,
`.specify/templates/`
**Owning feature**: none - governance decision; ratified by the repository owner.
R1 performs the design-system work this record registers.

**Context.** A verification pass over the governance tree - every document, plus a
byte-level check of the stylesheet and both integration manifests - found seven
defects. Five are the class ADR-047 and ADR-050 were raised to close: a register
claiming a state its source does not have. Two are contradictions a single
sentence each would have prevented.

1. **`docs/domain-model.md` contradicted itself about `ContactMessage`.** Line 127
   said the scoping column `user_id` "appears on every merchant-owned table:
   `Catalog`, `Bookmark`, `Notification`, `Conversation`, `Message`, and
   `ContactMessage`"; lines 82, 92, and 112 said a `ContactMessage` is
   "independent of any account", that its diagram row reads "no user; the
   submitter may be a guest", and that it carries the submitter's name and phone
   *instead of* a foreign key. ADR-051 decision item 2 repeated the inclusive list.
   The domain model is the single authority for the logical model (ADR-019), so
   its contradiction was authoritative in two directions at once.
2. **The static-enforcement rule could not be satisfied by any file.** Design
   System Standards required Stylelint and ESLint to "fail the build on ... any
   colour, radius, shadow, duration, or z-index value that does not reference a
   declared token", with no scope. Principle IX's prohibited list permits a
   literal *inside* `wafar.single.css`. Read together, the design system's own
   source failed the gate that governs it: 55 rules in that file carried a raw
   `rgb()`, `#hex`, or millisecond value, and `wafar.single.css` is the only place
   a token is allowed to be defined.
3. **The motion scale in Principle IX did not match the source.** The rule read
   "durations are limited to the defined scale (200 / 300 / 400 / 600 ms)". The
   file declared and *consumed* `--duration-deliberate: 700ms` (in
   `--transition-cinematic` and `ds-enter-up`) and `--duration-instant: 0ms`,
   neither of which the Token families bullet named. Three further literals were
   outside any scale: `transition-duration: 150ms` in `.ds-press:active` - the
   same defect class ADR-027 item 6 had fixed for the `body` transition -
   `0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)` in `.ds-lift`, and `600ms` in
   `--transition-bounce`.
4. **The unused-shadow enumeration was incomplete.** The Breakpoints note listed
   ten declared-but-unused named shadows; the Token families bullet named twelve.
   `--shadow-cinematic-hover` and `--shadow-cinematic-panel` were in neither list
   of the unused group, so a reader could not tell whether they were in force.
5. **Two counts inside ADR-050 were wrong.** "Nine of the **twenty** named
   shadows are consumed" - the file declared fifteen named shadows at the time.
   "The **nine** `--screen-*` tokens" - the file declares eight, which ADR-009,
   ADR-016, and ADR-039 each state correctly.
6. **`Project-Technologies.txt` broke the rule its own header states.** The file
   says at line 421 that the mirror header tracks the constitution through
   ADR-052; its header at line 4 stopped at ADR-049. It also still said
   "tenant" in two places after ADR-051 renamed the term, and its table headed
   "the complete list" omitted ClamAV and Lighthouse CI - both rows of the
   Approved register.
7. **Two registered pages had no owning surface.** The administrator's Settings
   page is in Product Scope while no registered entity owns stored settings and
   no open fact covered it, so R13 would have had to invent an entity the register
   forbids. Privacy Policy, Terms of Use, and FAQ are in scope with a bare layout,
   are not sidebar items, and the shell has no footer component, so nothing named
   a way to reach them.

**Decision.** The constitution is amended to **2.18.9** (MINOR: three rules changed
in scope, one register gap closed, one restatement corrected; no principle
added, removed, or redefined).

1. **`ContactMessage` carries no tenant identifier.** Schema and Migration
   Control's tenant bullet now names it beside `Supplier` and `AuditLog`, with
   the reason: a public intake whose submitter may hold no account, whose only
   read path is the administrator's, so a scoping column on it could never be
   used as a scoping key. `docs/domain-model.md` is corrected to match, and
   ADR-051 gains an annotation rather than a rewrite.
2. **The enforcement rule is scoped, and the file is brought under it.** The gate
   applies to values outside `wafar.single.css`, because a rule forbidding a
   literal in the token source forbids the source from defining anything. A
   second rule governs the file itself: every value in it is a token definition or
   a token reference, including the literal half of a composed `box-shadow`, with
   three named exemptions - a `mask` image, a print rule, and a
   `prefers-color-scheme` rule whose values must not read the mode class.
   `wafar.single.css` moves to **1.0.3**: the glass family, the table head and
   stripe surfaces, the focus and validation halos, the on-solid text and control
   fills, the scrim, the shadow hairline/navbar/glow steps, the reduced-motion
   duration, the loop periods, the stagger ladder, and three loop easings all
   become tokens. No value was removed and no rendered output changed.
3. **The motion scale is corrected to the source, not the reverse.** Principle IX,
   the Token families bullet, and Decision values now state the six-step scale
   plus `--duration-reduced`, and name the two families that are periods rather
   than transition durations - `--motion-loop-*` and `--motion-stagger-*` - so
   the file's own Arabic header comment, the rules, and the tokens agree.
4. **The unused-shadow enumeration is complete**: twelve declared-but-unused
   named shadows against the sixteen the register names, with the four newly
   consumed steps counted.
5. **Two gaps are recorded rather than decided.** The Settings page's storage is
   unresolved product fact #13 owned by R13, because a register amendment is R13's
   call and not a governance one. The four bare-layout static pages are bound to
   be reachable by a direct link or by an action on a page that carries one, the
   same rule Contact already had, with the link surface left to the slice that
   first builds a shell page and recorded as an ADR.
6. **The mirrors and the records are repaired**: the mirror header through
   ADR-053, "tenant" removed from the two surviving places, ClamAV and Lighthouse
   CI added to the mirror's complete-list table, ADR-050's two counts corrected in
   place, ADR-039's `.gitattributes` alternative corrected, and the fallback
   specification template's email/SSO/OAuth examples replaced with
   registration-neutral ones.

**Alternatives considered.**
- *Leave the `ContactMessage` contradiction open and let R2 discover it.* Rejected:
  R2 is the first merchant-scoped query surface, and it would have implemented a
  scoping column the domain model forbids, or dropped one its own text requires.
- *Scope the enforcement rule and stop there.* Rejected: scoping alone leaves the
  design system's source carrying 55 literals that a reviewer cannot check, which
  is the drift class the rule exists to stop. The file was brought under the rule
  in the same change.
- *Delete `--duration-deliberate` and `--duration-instant` to match the four-value
  scale.* Rejected: both are consumed by real transitions, and deleting them
  changes rendered behaviour. The register's restatement was the thing that was
  wrong - Single-Reference Sufficiency says a restatement of a value a rule
  depends on must move with its file.
- *Add `--duration-press: 150ms` for `.ds-press:active` instead of using the
  ladder.* Rejected: the ladder already has a step for micro-interactions, and
  200ms against 150ms on a press scale is not a difference a user can name. Fewer
  tokens beat a faithful-but-pointless one.
- *Introduce a `Setting` entity now.* Rejected: the Data entities register holds
  ten and forbids an eleventh without amending itself; that amendment is R13's to
  propose, and a governance record should not make it by implication.
- *Register a footer component so the three static pages have a named home.*
  Rejected as an invention: no rule or decision asks for a footer, and the shell
  is R1's. Binding the reachability requirement and naming the slice that decides
  the surface closes the gap without designing a component.
- *Rewrite ADR-050's counts as a silent edit.* Rejected: the file's own preamble
  says a record is corrected when its claim was wrong, and ADR-047's rejected
  alternative explains why the trail matters - the false claim is the evidence
  that the verification failed.

**What deliberately did not change.** No principle was added, removed, or
redefined; no principle's NON-NEGOTIABLE status changed; no entity, page count,
feature count, Usage Limit, slice order, module map, or dependency changed; no
technology was added to or removed from the Approved register. The eight
`--screen-*` tokens, `--sidebar-width`, `--navbar-height`, and `--touch-floor*`
keep their declared-but-unused status. No design value was deleted, and no
rendered output changed: every CSS edit replaced a literal with a token holding
the same value.

**Consequences.** The design system's source is now checkable against its own
rule, the motion rules and the file's header comment agree, the logical model's
single authority no longer contradicts itself, and the two gaps a slice would have
had to invent an answer for are now named questions with owners. The stamp set
moves to 2.18.9 across every site the Governance amendment procedure names, and
the manifest hashes are regenerated as the last step. This entry is the durable
record.

**Annotation (2026-10-20, ADR-096).** The Context's "the shell has no footer
component" and the rejected "Register a footer component" alternative describe
the state before ADR-096. ADR-096 records the shell's static-page link surface
in Product Scope and leaves the surface to the first shell-building slice; R1
records it as a footer band (FR-024). The reachability decision stands, and the
premise that no rule asks for the surface is superseded.

---

## ADR-054 — Constitution 2.19.0: the register names its four gates, and the amendment procedure names its own stamp sites

**Status**: Accepted — 2026-10-05
**Owning directory**: `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of every governing document found six contradictions of a
kind the registers exist to prevent.

1. **The technology mirror named four technologies the register did not.**
   `Project-Technologies.txt` carries a table headed "summary of the complete list"
   that names Prometheus + Grafana, Semgrep OSS, osv-scanner, and pg_anonymize. The
   Approved register had no row for any of them; each appeared only in a rule body as
   "X or an equivalent". The constitution forbids the mirror from introducing a
   technology the register does not name, so the mirror's own summary violated the
   mirror's charter. The mirror already recorded the distinction for ClamAV and
   Lighthouse CI, which carry register rows and exceptions; these four had neither.

2. **The mirror restated binding rules.** Roughly fifteen places in the mirror
   restate a constitutional MUST — static enforcement, worker durability, upload
   transport, the CAPTCHA prohibition, merchant isolation — while its own charter
   says any rule exists only in the register.

3. **Three different stamp lists existed.** The amendment procedure named three
   template overrides; the constitution scaffold named two; four templates actually
   carried a stamp. `tasks-template.md` would have gone stale at the next amendment.
   `docs/DECISIONS.md` was not a site at all.

4. **The amendment procedure and the constitution command contradicted each other.**
   The procedure requires eleven stamps to move in the same change; the command's
   scope guard said to write only the constitution and not modify template sources
   or unrelated artifacts. Ten sites were unreachable, and the scaffold itself called
   a constitution-only amendment incomplete. Every prior audit fix set in this file
   (ADR-047, ADR-049, ADR-050, ADR-053) had to be applied outside the command to
   work around this.

5. **Four register gaps were told to record their choice in two tables.** The register
   gaps rule said Complexity Tracking; the closed Constitution Mandated Values list
   said Constitution Mandated Values for four of the thirteen. ADR-053 had already
   resolved exactly this conflict for three other gaps, which is what proved it was a
   defect rather than a reading.

6. **Three design-system descriptions contradicted `wafar.single.css`.** `--ring-*`
   was described as holding the focus halo and holds only validation halos;
   `--screen-tiny` sits in module 14 while the module map gives screens to module 05;
   and `--motion-stagger-step` exists in the file, is referenced nowhere, and was
   named nowhere.

**Decision.** Constitution 2.19.0 (MINOR — a register grew and two binding
instructions changed):

1. The Approved register gains four rows — Prometheus + Grafana (Observability),
   Semgrep OSS, osv-scanner, pg_anonymize — each described as a CI, operations, or
   staging gate and not a runtime dependency, each carrying an exception
   (`EX-003` … `EX-006`) in the same shape as `EX-001` and `EX-002`. Register data
   rows: 14 → 18. The "or an equivalent" clause in each rule body survives, so
   substituting a different tool remains an amendment rather than a local choice.
2. The amendment procedure's prose stamp list is replaced by a numbered list of
   eleven sites, declared the single authority, with the `tasks-template.md` and
   `docs/DECISIONS.md` omissions corrected, a rule added for a site that does not
   exist yet, and an explicit statement that the remaining ten sites are moved by
   the amendment's change rather than by the command — with precedence resolving the
   conflict.
3. The constitution command's scope guard gains the matching exception, names the
   eleven-site list as its authority, and restates the final instruction so it no
   longer contradicts the procedure.
4. The constitution scaffold's duplicate stamp list is replaced by a pointer to the
   procedure, so the list exists once.
5. The register gaps rule now decides the destination by test — Constitution
   Mandated Values when the value is in the closed list, Complexity Tracking
   otherwise — and a table states which of the thirteen gaps fall on each side.
6. The design-system register is corrected on all three points.

**Alternatives considered.**
- *Strike the four names from the mirror instead of registering them.* Rejected:
  the rules require a metrics stack, a SAST scan, a dependency scan, and staging
  anonymisation, so deleting the names leaves the register describing a platform
  whose release gate names no approved tool — the same class of drift this record
  exists to close, in the opposite direction.
- *Register the four without exceptions, as descriptive rows only.* Rejected: it
  makes them indistinguishable from a runtime library at review, which is the
  ambiguity `EX-001` and `EX-002` were created to remove.
- *Split this into a PATCH and a MINOR.* Rejected: item 4 changes the amendment
  procedure itself, and the procedure requires the stamps to move in one change.
  Splitting moves the stamp set twice and leaves the repository unamendable between
  the two.
- *Leave the constitution command untouched and rely on precedence at every run.*
  Rejected: it leaves the contradiction documented in a file every operator reads,
  and depends on the agent noticing a two-document conflict on each amendment.
- *Rewrite the ratified ADRs that lack an alternatives record.* Deliberately
  deferred, not rejected: the 23 ADRs without an alternatives section are mostly
  amendment records, for which that field is not the right shape. The six genuine
  technical choices among them are listed as deferred items below.

**What deliberately did not change.**
- No principle. All ten (I–X) are unchanged in wording and in force.
- No entity, page, feature, role, usage limit, or product fact. The Product Register
  is untouched.
- `wafar.single.css`. No design value was added, removed, or renumbered; this
  amendment corrects only the constitution's description of the file. The file's own
  version stays 1.0.3.
- `docs/domain-model.md` beyond its version stamp: no entity, relationship, or
  invariant changed.
- The "or an equivalent" clause in the four rule bodies that named these tools.
- The licence prohibition's list, and Dependency Governance's substance.
- ADR-001 through ADR-053, including ADR-002's rationale, whose stale benchmark
  citation is already annotated at its own record and is corrected there rather
  than by rewriting a ratified decision.
- The exception register's existence and field set; only rows and dates were added.

**Deferred, named and owned.**
- The mirror's fifteen rule restatements, its incomplete gap coverage, its missing
  Node.js row, its dropped lockfile note, and its twelve unattributed figures.
- `docs/architecture.md`'s omission of the nine fixed internal locations.
- `Core-Project.txt`'s `created_at` column identifier, which no registered source
  defines — a regression of ADR-019's fix.
- The twenty-three ADR fields, the manifest coverage of the exception register, and
  the `.ps1` line endings, all collected into one follow-up amendment.

**Consequences.** The register names every technology the platform is required to
run, so the mirror's summary is now a summary and not an assertion. The amendment
procedure's stamp list exists once and is authoritative, and the command that
performs amendments no longer contradicts it. The register gaps rule has one
destination per gap. The design-system register describes the file that exists.
This entry is the durable record.

**Annotation (2026-10-06, ADR-058).** Two of the four deferred items above are
discharged and **two remain open**, verified against the working tree rather than
inferred. `docs/architecture.md`'s omission of the nine fixed internal locations
is closed: it now carries an Internal layout table of nine rows at
`docs/architecture.md` §1.1, which ADR-055 recorded. `Core-Project.txt`'s
`created_at` column identifier is closed: the mirror contains no `created_at`
token at all, so ADR-019's fix stands again. The twenty-three ADR fields remain
open, and the mirror's gap coverage remains as ADR-057 left it. This record is
annotated rather than rewritten, so a reader of it alone sees the debt as it was
recorded and can read this paragraph for its present state.

**Annotation (2026-10-09).** The fourth deferred item above is re-examined against
the working tree, so its three parts are no longer one undifferentiated debt. The
manifest coverage of the exception register is **closed**: the register is
recorded in `speckit.manifest.json` and excluded from the hash comparison by the
project-owned path rule ADR-074 added, which is the deliberate treatment that part
was waiting for. The `.ps1` line endings are **consistent**: `.gitattributes`
declares `*.ps1 text eol=crlf`, and every script is stored as LF and checked out
as CRLF, which is exactly what that attribute means — there is nothing left to
correct. The twenty-three ADR fields **remain open, deliberately**: the records
are amendment records whose reasoning was never captured, and writing the sections
now would be the reconstruction ADR-050 refused to present as contemporaneous. The
debt stays recorded rather than discharged, and it is now also named at the entry
point, in `AGENTS.md` §6, so a reader meets it without reading this file.

---

## ADR-055 — Audit fix set: range-string drift, a stale template hash, an assess hook conflict, and the mirror sync that was left unrecorded

**Status**: Accepted — 2026-10-06
**Owning directory**: `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A full audit of the repository found four drifts of the kind the
registers exist to prevent, plus one change set that was made but never
recorded.

1. **Four files still cited ADR-053 as the register's last entry.** ADR-054
   (Constitution 2.19.0) shipped on 2026-10-05 and `Project-Technologies.txt`
   was updated with it, but `AGENTS.md`, `README.md`, `ROADMAP.md`, and
   `docs/architecture.md` still read "ADR-001 … ADR-053".
2. **`speckit.manifest.json` recorded a stale template hash.** The recorded
   hash for `.specify/templates/overrides/plan-template.md` did not match the
   working file, the `spec-template.md` and `checklist-template.md` overrides
   were edited without re-recording, and the manifest had lost its trailing
   newline.
3. **The assess extension's README contradicted the registered hook.** The
   README states assess "registers no lifecycle hooks", yet
   `.specify/extensions.yml` enables `speckit.assess.intake` before
   `speckit.specify`, and AGENTS.md documents that hook. The relative order of
   the optional assess prompt and the mandatory `git.feature` hook inside
   `before_specify` was also file-order dependent, because only the git hook
   carried a `priority`.
4. **A mirror sync and a template clarification landed with no decision
   record.** `docs/architecture.md` gained its Internal layout table,
   `Project-Technologies.txt` was neutralised (PgDog wording, the ADR-023
   table, better-auth and SMS phrasing, the lockfile rows), the plan template
   gained the fifteen-values-versus-seventeen-rows note, and `Core-Project.txt`
   gained an English fragment ("taken from the record's immutable creation
   timestamp") inside an Arabic rule. None of it was recorded.

**Decision.** No constitution amendment (version stays 2.19.0):

1. Every "ADR-001 … ADR-053" range string now reads "ADR-001 … ADR-054"
   (`AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the
   two override templates that carry the same string).
2. The manifest's three override hashes were re-recorded from the actual
   files, and the trailing newline restored.
3. The assess README's claim is corrected to state that the project registers
   the optional `speckit.assess.intake` hook at `before_specify`, and the hook
   gains `priority: 9` so it runs before `git.feature` (`priority: 10`).
4. This entry records the mirror sync and the template note that previously
   landed unrecorded. The English fragment in the sort rule is replaced by
   Arabic, and `ROADMAP.md`'s unresolved-facts note now names rows 12 and 13
   together.

**Alternatives considered.**

- Drop the assess hook and let assess remain a deliberately standalone
  pipeline: rejected because AGENTS.md and the workflow registry both document
  the hook, and the repository owner chose to keep the prompt.
- Amend the constitution for the internal-layout mirror and the lockfile
  wording: rejected; both already match the constitutional register, so only
  this record was missing.

**Consequences.** Every ADR-range string, every recorded template hash, the
assess hook's documentation, and the mirror sync are now consistent with the
register and each other. Future amendments must move the range strings in the
same change, or the drift this entry closes returns.

---

## ADR-056 — Constitution 2.19.1: section-name references, glossary terms, and the register-gap classification

**Status**: Accepted — 2026-10-06
**Owning directory**: `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep read-only audit of `.specify/memory/constitution.md` found naming and classification drift: several references used a label that does not match the referenced heading (Data entities, Register gaps a slice MUST close, Decision values (binding), Deployment and Observability, Module Discipline and Development Workflow); the register-gap classification table named four fewer gaps than the owning-slice table; glossary terms used in planning templates were undefined; and an English parenthetical survived in the Arabic price rule of Core-Project.txt.

**Decision.** Constitution 2.19.1 (PATCH — clarifications, wording, no rule change):

1. Every internal cross-reference now names its target heading.
2. The register-gap classification table lists all thirteen gaps, destination by the Mandated Values / Complexity Tracking test.
3. Glossary adds Technical Context, Complexity Tracking, Ownership Map, Constitution Mandated Values, Success Criteria, Scale/Scope, and Test Coverage Request.
4. Core-Project.txt's price rule is Arabic prose again.

**Consequences.** The constitution's index of references is exact, the mirror register stays closed at thirteen gaps, and planners still see the same bindings; the version footer and all ten external stamp sites move to 2.19.1 in the same change.

**Alternatives considered.**

- Leave the drift and rely on convention: rejected — future drift audits would keep finding it.
- MAJOR restatement: rejected — no principle is redefined.

**This entry is the durable record.**

---

## ADR-057 — Constitution 2.19.2: the audit findings re-verified, and the design system's token rule enforced

**Status**: Accepted — 2026-10-06
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `wafar.single.css`, `.opencode/commands/`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`, `.specify/integrations/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A read-only audit (2026-10-06) reported ten candidate defects across the
governing layer. Each was re-checked against its source before any edit, because an
audit finding is itself a claim that can be wrong. Seven repairs were confirmed; two
candidates were dismissed as false positives; one was accepted history and not
touched. A second pass on the same day, run while this amendment was still
uncommitted in the working tree, added one further candidate — the Approved register's
exception-row count, item 8 below — so eight repairs are confirmed here.

Confirmed and repaired here:

1. **The Glossary's `Test Coverage Request` called itself a per-plan note.** Principle
   III, Artifact Workflow, and both binding templates read the request from the
   specification, so task generation would have looked in the wrong artifact.
2. **A cross-reference named a section under the wrong parent.** Artifact Workflow
   sent the reader to "Governance → Module Discipline and Development Workflow",
   while that section is a peer of Governance; ADR-056's own claim was that internal
   references name their target heading.
3. **The `expires_at` fact named sources that do not carry it.** The constitution's
   unresolved-facts row cited Schema and Migration Control, which never names the
   field or retention; `docs/domain-model.md` said the identifier was named in the
   File Processing Overview and Glossary, while the identifier appears only in the
   unresolved-facts table and the Glossary names the catalog's printed expiry date.
4. **`wafar.single.css` still carried non-token values** outside the three exemptions
   its own rule names (Design System Standards → Invariants → Inside the design system
   file): `.ds-shimmer`, `.ds-glow-brand`/`-accent`/`-violet`, `.ds-vignette`,
   `.ds-scanlines`, `.ds-loader-radar::before`, the `.ds-select` chevron data URIs,
   and a raw `150ms` in `.ds-btn`. ADR-053 claimed every value was a token definition
   or reference.
5. **`.ds-table th` applied `--tracking-caps` (0.08em) to every header cell.** The
   mandated Arabic table headers therefore carried positive letter-spacing, which
   Principle V and Principle IX prohibit and which ADR-012 said these tokens never did.
6. **The constitution command contradicted the amendment procedure.** It instructed
   writing the ten external stamp sites and forbade editing template source files,
   while its own scope guard and Governance say the command edits only the
   constitution and the amendment's change moves the rest. ADR-054 recorded this
   exact contradiction as closed.
7. **`Project-Technologies.txt` documented only `EX-001`/`EX-002`** after the exception
   register had grown to six rows, and carried no 2.19.x additions note.
8. **The Approved register's closing paragraph counted four exception rows.** It read
   "These four rows are the named implementations of rules that Deployment and
   Observability already required" and "the technology mirror named these four
   anyway", while the table immediately above it carries six rows, `EX-001` through
   `EX-006`. Both counts now read six, and the taxonomy names the CI gate alongside
   the scanner, the metrics service, and the staging tool. The 2026-10-06 audit
   found this one while 2.19.2 was still uncommitted, so it is folded into this
   amendment rather than issued as a new version; a sweep of the same family across
   the constitution (principle and binding-section counts, register-gap count,
   design-system module, family, loader, duration, and shadow counts, page,
   feature, entity, and canonical-column counts, the three English-text
   exceptions, the four bare-layout static pages, every ADR citation, the component
   inventory against `wafar.single.css`, and every path in References) found no
   second stale count or citation.

Examined and dismissed (no change made):

- **`--z-boot: 9999`** is a declared-but-unused token. The constitution's register does
  not fix z-index values and the file defines its own scale; ADR-009's "80..170"
  sentence describes the ladder decision of its date, not a live rule.
- **`background-position: left`** in `.ds-select` is a keyword value. The prohibition
  is on physical direction *properties*, and CSS Logical Properties defines no logical
  `background-position`; the value is forced by the RTL chevron placement.

**Decision.** Constitution 2.19.2 (PATCH — wording, citations, and one scoping
correction; no rule, register, entity, page, limit, or slice changed):

1. The Glossary's `Test Coverage Request` entry reads per-spec: "The per-spec section
   declaring which tests the feature requests and the coverage target the coverage
   gate asserts."
2. The Artifact Workflow reference reads "see Module Discipline and Development
   Workflow".
3. The `expires_at` row's sources read "Usage Limits and Product Features #16 (the
   90-day retention) against `Core-Project.txt` and the Glossary (the supplier's
   printed expiry date)"; `docs/domain-model.md` states the same provenance.
4. `wafar.single.css` moves to **1.0.4**: `--shimmer-edge`/`--shimmer-ink`, the
   `--glow-*` pairs, `--vignette-ink`, `--scanline-ink`, `--loader-radar-ink`, and
   `--select-chevron`/`--select-chevron-dark` (a `url()` held by a custom property)
   are added and consumed; `.ds-btn`'s transform duration uses `--duration-fast`; and
   `.ds-table th` uses `--tracking-normal`. No token is removed, and the only rendered
   changes are the two compliance corrections the principles require.
5. `.opencode/commands/speckit.constitution.md` states that the command writes the
   constitution and its footer, and that the amendment's change — not the command —
   moves the ten external stamp sites; the template-layer guard is scoped to the
   resolved layers (core, presets, extensions).
6. `Project-Technologies.txt` records the six exception rows and a 2.19.2 additions
   note, and its stamps move with the amendment.
7. Every stamp site the Governance amendment procedure names moves to 2.19.2, and the
   manifest hashes for the edited override templates and the constitution command are
   re-recorded. The amendment set is committed as one change, so those hashes
   describe the tree as committed.
8. The Approved register's closing paragraph counts six exception rows instead of
   four, names the CI gate in the taxonomy, and leaves every rule, register row, and
   exception unchanged.

**Alternatives considered.**

- *Exempt data-URI images and glow gradients from the token rule instead of
  tokenizing them.* Rejected: a custom property may hold a `url()` value, so the
  chevrons fit the existing rule as token definitions, and the glow gradients are
  plain colour values that tokenize with no pixel change.
- *Keep `--tracking-caps` on `.ds-table th` and rely on the comment scoping the token
  to Latin labels.* Rejected: a comment does not scope a selector; every Arabic header
  cell would carry the tracking the principle prohibits.
- *Leave the constitution command as written and rely on the precedence clause.*
  Rejected: a command that instructs what the procedure forbids reproduces the
  contradiction on every run, which is what ADR-054 claimed to have ended.
- *Remove `--z-boot` as dead code.* Rejected: it is unused, not dead in the Project
  Structure sense — declared tokens may await the surface that consumes them, as the
  unused screen and shadow tokens do — and no rule requires its removal.
- *Correct ADR-009's range sentence.* Rejected: a decision record is history; the file
  is the value source and the register maps it.

**What deliberately did not change.** No principle, register row, entity, page,
feature, Usage Limit, module map, or slice. No technology was added or removed. The
motion scale, the colour ladders, the shadow ladder, and the module order are
unchanged. ADR-054's accepted text and its deferral list stay as history.

**Consequences.** The Glossary and the templates now locate the Test Coverage Request
in the same artifact; the design system's source obeys the rule the constitution
states for it; Arabic table headers no longer carry positive tracking; the register's
closing paragraph counts the six exception rows it closes over; and the amendment
command and the Governance procedure tell one story. The stamp sites read
2.19.2, `wafar.single.css` reads 1.0.4, and the manifest hashes describe the files as
committed in this one change. This entry is the durable record.

---

## ADR-058 — Constitution 2.20.0: the writing-direction rule's value form, two register levels, and the decision records that failed verification

**Status**: Accepted — 2026-10-06
**Owning directory**: `.specify/memory/`, `docs/`, `ROADMAP.md`, `docs/architecture.md`, `docs/domain-model.md`, `Project-Technologies.txt`, `Core-Project.txt`, `.specify/templates/overrides/`, `AGENTS.md`, `wafar.single.css`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A verification pass over every governance file, run to confirm a previous
audit rather than to look for new work, found that three of the defects it reported
were defects in the constitution itself and that three decision records stated things
that were false.

1. **Principle V's physical-direction rule named only the property form.** It
   prohibited `margin-left`, `left`, `right` and their Tailwind utilities, and
   Static enforcement required Stylelint and ESLint to fail on "physical direction
   properties". Nothing named the *value* form — a physical direction keyword
   inside a property that has a logical equivalent — and `wafar.single.css`, the
   file the constitution owns as the single source of design values, carried six
   such values: `background-position: left` in `.ds-select`, and `to left` in the
   text gradient (twice), the divider (twice), and the progress fill. The rule the
   constitution wrote for its own design system was not one the design system
   could satisfy and not one its linter could enforce, and nothing noticed.
2. **The Usage Limits 90-day row fixed a period but not a trigger, and three
   sources supplied one.** Usage Limits said "after 90 days" and Product Features
   #16 said the same; the unresolved-facts table reserved only `expires_at`'s
   meaning to R15. Meanwhile `Core-Project.txt`, `ROADMAP.md`, and
   `docs/domain-model.md` each stated that the 90 days run from upload. Three
   documents asserted an answer the owning slice had not given, and the
   constitution gave them no rule that forbade it.
3. **Two registers described the same entities at two unstated levels.** The
   Product Register's Data entities table describes a catalog as "its metadata,
   its status, and its stored bytes", while the Glossary names its metadata
   fields (supplier name, issue date, upload date, expiry date) and a part's six
   canonical columns. Neither section said whether prose or a named field is a
   registered field, so `docs/domain-model.md`'s open fact #9 ("no fields are
   registered for them today", for a catalog's byte count and content type) and
   the Data entities row could not be compared. This is what produced open fact
   #3: a catalog's printed expiry date is registered metadata, and whether
   `expires_at` serves that date or the retention deadline was left unstated.
4. **Three decision records failed verification.** ADR-050 item 8 claimed that
   "ADR-007 and ADR-026 pointed at `.clinerules/project-context.md` … they are
   annotated". ADR-026 never named that path — its Owning directory is
   `.specify/`, `docs/`, `.specify/extensions/git/` — and carries no annotation;
   the annotation for the retired Cline tree is in ADR-027. ADR-050 therefore
   named the wrong record and claimed a remedy that does not exist. ADR-037 and
   ADR-038 both name that retired path in their Owning directory with nothing
   pointing at its deletion. ADR-038 fixes the cart page's Arabic name as
   «المحفوظات», ADR-045 supersedes that clause with «سلة المشتريات», and ADR-049
   unified the mirror citation — but ADR-038 itself was never annotated, so a
   reader of that section alone is left with a label the platform does not use.
   ADR-054's deferral list names two items that are already closed and does not
   say so.

**Decision.** The constitution is amended to 2.20.0 (MINOR: one rule materially
expanded, two register levels stated, one cross-source rule added).

1. **Principle V states both forms of the physical-direction rule and the test
   that separates them.** The property form and the value form are named
   together, and the test is whether a direction is *derived from the writing
   mode* rather than whether the property has a logical equivalent. A direction
   that is the writing mode — a caret, a select chevron, a progress or loading
   fill, an arrow, a text-direction indicator — must be logical. A direction that
   is not — a sheen, a vignette, a scanline, a surface highlight, a decorative
   wash — must state an explicit angle in degrees, must not be flipped, and must
   not be read as an indicator. The rule went into Principle V rather than into a
   section because Principle V is the authority and is itself NON-NEGOTIABLE: a
   permitted case introduced only in a section would contradict the principle's
   absolute phrasing, and Single-Reference Sufficiency forbids the second copy.
2. **Design System Standards → Invariants points at Principle V instead of
   restating it**, and adds only what is specific to the design system's file: a
   directional value there MUST record which kind it is, because the principle's
   test cannot be applied to a bare declaration whose purpose is not otherwise
   visible. Static enforcement covers both forms. A physical direction keyword
   inside `wafar.single.css` is a defect on the same footing as a raw colour.
3. **A reserved decision is reserved in every source.** Unresolved product facts
   gains the rule: a source that states an answer the table has not given is
   itself the defect, and the fix is a correction to that source. `Core-Project.txt`,
   `ROADMAP.md`, `docs/domain-model.md`, and `Project-Technologies.txt` are named
   as bound while a row is open. A source may state the question, name the owning
   slice, and restate the constraint that bounds the answer; that is not an
   assertion of the answer.
4. **The 90-day row names what it does not fix.** Usage Limits and Product
   Features #16 both say the period is fixed and the point it is counted from is
   not, and the unresolved-facts row is widened from `expires_at`'s meaning alone
   to that meaning and the trigger. The three sources that asserted a trigger are
   corrected to state the period and the reservation instead.
5. **Both registers state their level.** The Data entities table reads at the
   level it is written — a named field is registered, prose is not a field list —
   and the Glossary gains a preamble saying the same for its definitions, so the
   two statements are consistent and a catalog's byte count and content type
   register nowhere while its named metadata does.

**Corrections to dependent documents, in this same change.**

- `wafar.single.css` moves to 1.1.0 and satisfies the new rule: the select
  chevron's `background-position` becomes `inset-inline-end`, the text gradient
  and progress fill become `to inline-end`, and the symmetric divider becomes an
  explicit `270deg`. Each rule's comment now records which kind its direction is,
  in Arabic, as the file's comments are. No rendered value changes: the three
  logical forms reproduce the RTL rendering the physical ones produced, and the
  divider is symmetric, so `270deg` is exactly what `to left` meant.
- The mirror drops the `apps/worker` row from its register tables — a repository
  path from Internal layout, not a registered technology — keeps its
  responsibilities under the processing-structure section, stops repeating PgDog
  under deployment, and names TanStack Query as the register names it.
- `ROADMAP.md` gains the full constitution path where it used a shorthand, and
  the cart budget keeps its `p95` qualifier, which Usage Limits fixes and which
  the same table states for the search budget.
- `AGENTS.md` no longer describes the icon set as registered. It is an open
  register gap owned by R1 and the file said so nowhere.

**Annotations to records that failed verification.** ADR-050 item 8 is corrected
in place, because it is a false statement of fact rather than a superseded
position, and the correction names the record it misattributed to and the two it
did not cover. ADR-037 and ADR-038 gain an annotation on their Owning directory
that the Cline tree named there no longer exists, and ADR-038 gains a second one
recording that ADR-045 superseded its cart-label clause. ADR-054 gains an
annotation stating which of its deferred items are closed — verified against the
working tree, not inferred — and which remain open. None of these records' text is
rewritten; each is annotated, because a decision record is a history.

**What deliberately did not change.** No principle was added, removed, or
redefined, and no principle title changed; Principle IX's prohibited list is
untouched and stays consistent, because it names the `left` and `right` tokens,
which the expanded rule also prohibits, and an explicit degree angle is not among
them. No section was added or removed, so the scaffold's section order is
unchanged. No register row, entity, page, feature, Usage Limit value, module
map, slice, or slice dependency changed. No technology was added or removed from
the Approved register, and no exception was created or closed. The 90-day period
itself is unchanged.

**Consequences.** `wafar.single.css` can now satisfy the rule the constitution
writes for it, and a linter can enforce it. A reserved decision cannot be answered
by accident in a mirror, which is what let three documents pre-empt R15. The two
registers no longer need a reader to guess whether prose is a field. Four decision
records that asserted something untrue about themselves or about each other now
carry a correction. The stamp sites read 2.20.0, `wafar.single.css` reads 1.1.0,
and the index table carries ADR-058, so every live `ADR-001 … ADR-0NN` range
string in the repository is corrected in this one change. This entry is the
durable record.

**Alternatives considered.**

- *Write the value form into Design System Standards → Invariants instead of Principle V.* Rejected: Principle V is the authority for the rule and is NON-NEGOTIABLE, so a permitted case stated only in a section contradicts the principle's absolute phrasing, and Single-Reference Sufficiency forbids the rule existing in two places. Writing it there first and correcting it was the sequence actually taken, and it is the mistake this record's existence explains.
- *Ban physical direction values outright, with no permitted angle.* Rejected: it would force a decorative sheen or a scanline to be expressed logically, which mirrors a fixed design and is a defect of its own — the ban would have produced the mistake it was written to prevent. The writing-mode test is what separates the two cases.
- *Move the writing-mode test into the Glossary and leave Principle V alone.* Rejected: the Glossary is a register of terms and the test binds every surface, not only terms.
- *Have R15 decide the trigger silently and let the mirrors keep their wording.* Rejected: that is the pre-emption this record exists to stop, and it would make the mirrors a second source for a reserved decision.
- *Rewrite ADR-038's cart-label clause to the current name.* Rejected: a decision record is a history, and ADR-049 already established that the superseding name lives in ADR-045 with the mirror citation unified on it. An annotation reaches the same reader without erasing what was decided and why.
- *Annotate ADR-050 rather than correct its text.* Considered and rejected for this one item: the others are annotations because a later decision changed what they say, while item 8 is a claim about what was already done, and it is false. The correction states the truth and names what it missed.
- *Treat `to left` as harmless because the platform is permanently RTL.* Rejected: the rule exists so a surface reads correctly by construction rather than by coincidence, and an RTL-only platform is exactly the assumption that would let a physical direction survive into a reused component.
- *Extend the value-form rule to transform functions such as `translateX`.* Rejected as out of scope: `wafar.single.css` animates slide-in with `translateX`, which is a physical axis rather than a direction keyword, and the rule as written reaches direction keywords and gradient directions only. It is recorded here as a known uncovered case rather than silently widened, because widening it in this amendment would have changed motion behaviour without a design decision behind it.

---

## ADR-059 — Constitution 2.21.0: two tools the rules already required, and the mirror claims that contradicted the register

**Status**: Accepted — 2026-10-06
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`, `AGENTS.md`, `README.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A cross-read of the architecture documents against the technology
register and the mirror, asked to name what is missing, found eight defects and
withdrew two candidates. Two are requirements the constitution imposes and no
register row implements; the rest are mirror claims, one unresolvable file
reference, and one duplicated title.

1. **Two MUSTs had no technology behind them and no gap row either.** The
   supply-chain controls require each build to produce an SBOM. The Approved
   register names the two scans — Semgrep OSS and osv-scanner — and names no
   generator, so the requirement had no implementation to point at. The
   performance rule requires a load test before the first public release and
   names no tool. Neither appeared in `### Register gaps a slice MUST close`,
   whose table is the mechanism that gives an unnamed implementation an owning
   slice. The consequence is not that a tool is missing from a table: it is that
   the slice which must choose one has no instruction to choose it and no ADR to
   file, and the gap-table clause's own promise — that a choice lands before the
   slice's acceptance — has no row to apply to.
2. **`Project-Technologies.txt` attributed a Zod version to the constitution.**
   Its Zod row read "من سلسلة v4 (الدستور يثبّت v4 بلا رقم منفرد)". The
   constitution's Validation row is `Zod` with no version at all, so the mirror
   asserted a decision the register never made, and a reader checking the source
   would find nothing. The same file's Hono row had already been corrected on
   this exact point during the ADR-045 audit, which is why one row was right and
   its neighbour was not.
3. **`Project-Technologies.txt` named two Pinia versions and adopted neither.**
   The row read "الإصدار v3.0.4 (يناير 2026)، وv4.0 (يوليو 2026)". The register
   names Pinia with no version; the mirror's own job is to carry an exact one, and
   a row that offers two without saying which one the workspace installs does not
   discharge that job.
4. **`Project-Technologies.txt` named PgBouncer as the approved PgDog fallback.**
   Checked and withdrawn: the register requires the plan to name a fallback and a
   review date, `ROADMAP.md` records R1 as naming PgBouncer with 2027-04-06, and the
   mirror repeats what the roadmap already decided. Not a defect.
5. **The constitution opened with its H1 twice**, on consecutive lines, at HEAD.
   A duplicate title is not a governance question, but it is a signal that the
   document's opening is unverified, and the previous pass had traced a long list
   of substantive findings without reading the first two lines.
6. **The mirror's summary table filed four registered tools under the wrong
   layer.** Its delivery row listed Prometheus + Grafana, Semgrep OSS,
   osv-scanner, and pg_anonymize beside VPS and Nginx or HAProxy, while the
   register files Prometheus + Grafana under Observability and the other three
   under Quality (`constitution.md:1250-1253`). The mirror therefore contradicted
   both the register and its own deployment note thirty lines above, which states
   that the deployment layer names VPS, Nginx or HAProxy, and optional Docker only.
   The misfiling survived because a summary table reads as a list rather than as a
   register, and nothing checks a mirror against a layer column.
7. **The mirror claimed to reproduce a footer that carries no ADR list.** Its
   sync-marker block reads "The mirror headers now track the constitution footer"
   and then reproduces a header carrying an ADR list. The footer's three fields are
   version, ratified date, and last-amended date; the constitution cites ADR numbers
   in no stamp, and its stamp list defines that site as "the version footer" alone.
   The values were right and the provenance claim was false, which is the harder
   kind of error to notice later, because a reader checking it finds a correct
   version number.
8. **`AGENTS.md` and `README.md` cited `init-options.json` without its directory.**
   The file is `.specify/init-options.json`; both documents gave the bare filename
   in the sentence that describes the feature-numbering rule, so the reference could
   not be resolved by a reader without already knowing where the file lives.

**Decision.** The constitution is amended to 2.21.0 (MINOR: two gap rows added,
no rule expanded).

1. **The two gaps are registered, unchosen.** `SBOM generator` and `Load-test
   tool` are added to both gap tables: each is recorded in the plan's Complexity
   Tracking table with its ADR, licence-obligation record, and vulnerability scan,
   and each is owned by a slice — R1, which establishes the release build, and
   R12, which owns delivery and operations. No tool is named, because the
   register-gaps clause prohibits naming one before the choice is recorded.
2. **The mirror's two version claims are corrected to state what the register
   says.** Zod is worded like the Hono row beside it: the v4 series is a mirror
   reference and the exact number is pinned by the package's plan. Pinia names
   v4.0 as adopted and v3.0.4 as its predecessor, so the row answers "what does
   the workspace install" instead of presenting two options.
3. **The duplicated H1 is removed.** One title, one document.
4. **The summary table is re-layered to the register's own layers.** Quality now
   carries ESLint, Prettier, Stylelint, Lighthouse CI, Semgrep OSS, osv-scanner,
   and pg_anonymize; Observability carries Prometheus + Grafana as its own row;
   Delivery returns to VPS, Nginx or HAProxy, and optional Docker. The mirror's
   row labels are now the register's layer names.
5. **The sync marker states what each part of the header is.** The block names the
   version and last-amended date as the footer's and the ADR list as the mirror's
   own record of the amendments it mirrored, so a future pass is not asked to
   reconcile a list the constitution never carried.
6. **Both bare file references are qualified** with the `.specify/` directory that
   holds them.

**What deliberately did not change.** No technology was added to or removed from
the Approved register; the two rows are gap rows, which by construction name no
technology, and the summary table's re-layering moves four names between rows of
the same mirror without changing what the mirror names. No exception was created
or closed, so the register stays at `EX-001` … `EX-006`. No principle, Product
Scope item, entity, page, feature, Usage Limit value, module map, slice, or slice
dependency changed. No design value changed: `wafar.single.css` stays at 1.1.0,
and this amendment asks nothing of it. The load test's own rule is untouched —
only the absence of a named implementation is corrected, and the rule still permits
an internal release that states its expected load instead. The dependency-update
automation is not added: the constitution already names Dependabot or Renovate
inside the update rule, so it is a named implementation rather than an unnamed
one, and inventing a gap for it would have misreported the register. The mirror's
own header values are unchanged: the version, the date, and the ADR list are the
same three things it carried before, and only the claim about where they come from
is corrected.

**Consequences.** The two requirements now have owners, a recording duty, and a
deadline, so R1 and R12 are instructed rather than merely permitted. The mirror
can no longer be caught claiming a register decision that does not exist, filed
under a layer the register does not use, or credited with a footer field the
constitution never carried, and its Pinia row is installable. A reader following
either `init-options.json` reference now lands on the file. The stamp sites read
2.21.0 and the index table carries ADR-059, so every live `ADR-001 … ADR-0NN` range
string in the repository is corrected in this one change. The two rejected findings
are recorded so a later pass does not re-raise them.

**Alternatives considered.**

- *Name the SBOM generator and the load-test tool in the register now.* Rejected: the register-gaps clause prohibits naming a specific library before the choice is recorded with its ADR and licence obligation, and an unvetted name fails Dependency Governance. The gap row is the mechanism; filling it early would defeat it.
- *Treat the SBOM generator as covered by osv-scanner.* Rejected: a dependency vulnerability scanner is not the component that emits an SBOM, and the register admits no technology it does not name. If a later slice shows one tool does both, that slice records it and the row closes.
- *Add the dependency-update automation as a third gap.* Rejected: the update rule already names Dependabot or Renovate, so the requirement has implementations to choose from and the gap clause does not apply.
- *Leave the mirror's summary table as one row per broad concern.* Rejected: that row is where a reader looks first, and it contradicted the mirror's own note. A summary is not exempt from the register's layer column because it is shorter.
- *Delete the ADR list from the mirror's header instead of explaining it.* Rejected: the list is this mirror's record of which amendments it mirrored, and dropping it would remove real provenance to fix a wording problem.
- *Fix the two mirror rows without amending anything.* Rejected: the version-stamp discipline exists so a correction cannot land in one file and leave the others reading the old number, and this change moves eleven stamp sites for that reason. A mirror-only fix would also have left the two unnamed requirements unnamed, which is the finding that actually blocks work.
- *Leave the duplicated H1 and fix it in a later pass.* Rejected: it is one line, and an amendment that leaves a known defect in the document it amends is not finished.
- *Delete the SBOM requirement as out of scope for a pre-release platform.* Rejected: it is an existing MUST in Deployment and Observability; whether the platform needs it is not a mirror question, and removing it would be a governance decision with its own consequences, not a documentation fix.

---

## ADR-060 — Constitution 2.22.0: the design system's register against its own file, the file's binding rules, and the citations that named the wrong section

**Status**: Accepted — 2026-10-06
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `.specify/templates/exception-register.md`, `.specify/workflows/speckit/workflow.yml`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`, `Core-Project.txt`, `AGENTS.md`, `README.md`, `wafar.single.css`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A full audit of every governance file against every other one — the design
system's register against `wafar.single.css`, `Core-Project.txt` against the Product
Register, `ROADMAP.md` and `docs/domain-model.md` against the constitution and the
decisions, and the four override templates against `AGENTS.md` and `workflow.yml` — found
eleven defects and withdrew six candidates. Three are violations of the design system's
own binding rules, measured rather than assumed; two are the register failing to map the
file it registers; five are citations or instructions that named the wrong section, the
wrong file, or a source that cannot be checked.

1. **The field placeholder violated the binding contrast value.** Decision values
   require "contrast at least AA", and the Interface State Matrix requires WCAG 2.2 AA.
   `.ds-field::placeholder` set `color: var(--text-tertiary)` with `opacity: 0.7`. The
   opacity composites rather than replaces: the effective colour measured about
   2.42:1 against `--surface-50` (`#ffffff`) in light mode and about 3.4:1 against
   `--surface-200` (`#171717`) in dark, where AA needs 4.5:1 for body text. The token
   alone measures 4.74:1 and 7.11:1 on the same two backgrounds, so the defect was the
   opacity and nothing else.
2. **Scroll locking was breakpoint-scoped while the register states it unqualified.**
   "Honoured media and capability states" requires scroll locking, naming
   `ds-scroll-locked`, as a MUST. The file defined it only inside
   `@media (max-width: 1023px)`, where its comment scopes it to the drawer. A
   confirmation overlay on a desktop viewport — which Principle IX names "Modal" and the
   missing-components list requires — therefore had no scroll lock at all, and the
   register made no distinction a reader could find.
3. **The file repeated the motion query it forbids repeating.** The closing note states
   "the rule: everything about motion in one file", and the motion module holds the
   single `prefers-reduced-motion` block. The loaders module held a second one. The
   second carried rules the first did not, which is why duplication survived: it looked
   like a module-specific addition rather than a repeat.
4. **Twenty-two tokens were declared and used while absent from the register.** The
   register opens with "a value, family, class, or component absent from this register is
   not part of the design system and MUST NOT be used", and its motion row goes out of its
   way to say the file's inventory is complete. The Typography row omitted the body and
   heading line-height and letter-spacing aliases and the three line-wrap tokens; Motion
   omitted the seven transition shorthands and the four transform tokens used as motion
   values; Spacing omitted the vertical rhythm pair; Form metrics omitted the select
   chevron's two image tokens. The module map's own "Owns" column had claimed
   transitions and typography, so the map and the families row disagreed about what was
   registered.
5. **The token rule had no exemption the file could satisfy for its only image asset.**
   The select chevron's stroke is a literal colour inside a `url()`. The rule exempts
   masks, print rules, and `prefers-color-scheme`, none of which applies: CSS cannot read
   a variable inside a data URI, so the colour cannot become a reference at all. Either
   the rule needed a fourth case, or the file needed a chevron drawn some other way —
   and no drawing of a chevron on a replaced element avoids a data URI.
6. **The missing-components list was incomplete.** The register requires multi-select
   filters and a price range on the Parts page, and the file provides a single-select
   field and a dropdown only. The list named "the filters toolbar" and not the two
   controls the toolbar needs, so the slice that builds the Parts page would have read
   the list, found the toolbar, and shipped a toolbar of single selects.
7. **The component inventory could not be read literally.** Its opening rule makes any
   class absent from the register unusable, while the file carries roughly forty utility
   classes — `ds-sr-only`, the truncation helpers, the sticky and fixed helpers, the
   float scale, the surface helpers — that no row names and that no register may name,
   because a register is a map and not a copy. The rule and the file could not both hold.
8. **Six exception rows named a section that does not contain the rule they except.**
   Every row named `Dependency Governance`, and every rationale began "The rule prohibits
   a dependency absent from the Approved register". That rule is written in Technology
   Standards. Dependency Governance states the pinning, licence, vulnerability, and update
   rules, and the register's own use rule says an exception MUST name its section exactly
   as written.
9. **`AGENTS.md` did not match the templates it summarises.** It omitted
   `docs/domain-model.md` from the specify list, `Project-Technologies.txt` and
   `Core-Project.txt` from the plan list, the constitution from the tasks list, and had no
   `/speckit.checklist` entry at all — while stating that the templates carry this duty
   as binding text. A reader following `AGENTS.md` would not have loaded the sources the
   template it is about to use binds.
10. **`Core-Project.txt` promised a notification the register does not register.** Its
    upload acceptance criterion fired a notification carrying "uploaded, processing being
    handled". The Glossary's Notification definition closes the causes to a processing job
    that completed or failed, an administrative message, and an administrator's reply, and
    the pipeline's notification is step eight, after the status update.
11. **Two smaller defects of the same kind.** The `expires_at` conflict row cited
    `Core-Project.txt` as a source asserting the printed expiry date; that file contains no
    expiry date, so the citation named a source that cannot be checked. The spec
    template's entity placeholder asked for "key attributes in business terms" two lines
    below a comment forbidding columns and field names, and `workflow.yml` pointed at a
    `git-config.yml` that does not exist for the hook states that live in
    `.specify/extensions.yml`.

**Withdrawn after checking.** Six candidates were investigated and are not defects, and
they are recorded so a later pass does not re-raise them. Font delivery is the
application's duty, and the register says so — the CSS is not required to record it.
The safe-area tokens use `env()` names that are physical in spelling only, and the gutter
that consumes them is symmetric. The absence of `@layer` is an ordering choice no rule
requires. Dark mode is class-based by rule, the file carries a full `.dark` palette, and
the mode is the page shell's duty. The font stack's fallback to Noto Sans Arabic is
registered. `PgBouncer` as the PgDog fallback is recorded by `ROADMAP.md` for R1 with a
review date, which is what the register asks a plan to do.

**Decision.** The constitution is amended to 2.22.0 (MINOR: the design-system register is
completed, one value-form rule gains a case, one inventory is scoped, two components join
the missing list, and one false citation is corrected).

1. **The placeholder's opacity is removed.** `wafar.single.css` moves to 1.2.0. One design
   value changed, and it changed toward the binding contrast the register already
   required; nothing was added to the rendered surface.
2. **Scroll locking applies at every width.** The class leaves the tablet-and-below block
   and stands on its own, because the state belongs to an open layer rather than to a
   viewport width. It still has no effect until a surface adds it.
3. **The loaders' motion rules join the single motion query.** The duplicated block is
   deleted and its rules appended to the block the closing note points at, so the file has
   one `prefers-reduced-motion` query and the note is true again.
4. **The register names the twenty-two tokens, and names the six one-offs in
   full.** Typography gains the four size-role aliases and the line-wrap set;
   Motion gains the transition shorthands and the four transform tokens, with the
   sentence that a slice may not add to the row without the amendment that names
   it; Spacing gains the vertical rhythm pair; Form metrics gains the chevron image
   tokens. Six of the twenty-two follow no step pattern, so a row that described
   them in prose would have left a checker nothing to resolve — the rows write
   them out, and the Typography row now says that a one-off token MUST be written
   in full. No value is copied into the constitution — only family membership and
   the names themselves, which is what a map does.
5. **The embedded data URI is the token rule's fourth exempt case,** conditional on the
   declaring rule naming the token its colour matches. The select chevron's declaration
   now names it, in the file's own Arabic comment style.
6. **The component inventory is scoped to components and component parts,** and says why
   utility classes stay out of it: a register is a map, and the module map owns their
   assignment.
7. **The multi-select control and the price-range control join the missing list,** phrased
   as the requirements they satisfy so a slice can recognise them.
8. **The `expires_at` row's false citation is removed,** leaving the conflict it actually
   has: Usage Limits and Product Features #16 against the Glossary.
9. **The exception register's six rows name `Technology Standards`,** the section that
   writes the rule, in the register's own exact-wording form.
10. **`AGENTS.md`'s four reading lists match the templates,** and the checklist command
    has its entry.
11. **`Core-Project.txt`'s upload criterion states the registered behaviour,** the
    notification following the outcome rather than preceding it.
12. **The two smaller defects are corrected:** the spec template's entity placeholder asks
    for what its comment permits, and the workflow comment names the file that exists.
13. **ADR-026 and ADR-027 are annotated, not rewritten.** Both name `git-config.yml` as the
    place the commit-hook states live, and no such file exists here;
    `.specify/extensions.yml` holds them, `enabled: false`, which is the state both records
    describe. The annotation follows the precedent ADR-058 set: a decision record is a
    history, so the reader is corrected where the claim is read, and the text stands.

**What deliberately did not change.** No technology was added to, removed from, or
substituted in the Approved register, and no exception was created or closed. No
requirement, entity, page, feature, Usage Limit value, module, slice, or gap owner
changed. No rendered value was added or removed from the design system, and no component
class was renamed: the only value change is the placeholder's opacity, and it moved toward
AA rather than away. No Principle was added, removed, or redefined. The FAQ page did not
join the missing list: the register requires FAQ content but names no disclosure or
accordion, and adding one would have been a product decision this amendment is not.
`wafar.single.css` keeps its fourteen modules in order, so the module map needed no change.
The dependency-update automation did not join the gap table again, and the scan tools keep
their exception rows; what changed there is only the section each row names.

**Consequences.** The file now satisfies the three binding rules it was breaking, and the
register maps the file it registers instead of describing a smaller one. A slice building
the Parts page reads two controls in the missing list instead of one toolbar and
discovers the gap at acceptance time. A reviewer comparing the exception register with the
constitution finds the rule where the register says it is. `AGENTS.md` and the templates
now send an agent to the same sources. The stamp sites read 2.22.0, `wafar.single.css`
reads 1.2.0, and the index table carries ADR-060, so every live `ADR-001 … ADR-0NN` range
string in the repository is corrected in this one change. The withdrawn findings are
recorded so they are not re-raised.

**Alternatives considered.**

- *Raise the placeholder's colour token instead of removing the opacity.* Rejected: it would have moved a semantic token to serve one rule and left `--text-tertiary` too dark everywhere else. The token already passes on both field backgrounds.
- *Keep scroll locking inside the breakpoint and qualify the register row instead.* Rejected: the state belongs to an open layer, and the register's list of honoured states is a promise about behaviour rather than about viewports. Qualifying the row would have made the promise true by narrowing it.
- *Leave the loaders' motion block and treat the closing note as an aspiration.* Rejected: the note is a rule the file states about itself, and the block's rules had to live somewhere. Merging them keeps one query and loses nothing.
- *Delete the select chevron tokens and draw the chevron as a rotated border.* Rejected: a rotated border on a replaced element's background is not a supported technique, and a mask cannot colour a select's own background without cutting the field's. The exemption, conditional on naming the token, keeps the checkable requirement instead of weakening the component.
- *Copy the twenty-two token names into the constitution as values.* Rejected: Single-Reference Sufficiency forbids a design value in the constitution, and the register's job is membership, not values.
- *Name the utility classes in the inventory to make the opening rule literally true.* Rejected for the same reason, and because the module map already assigns ownership. The scoping sentence fixes the contradiction without a copy.
- *Treat the FAQ page as requiring a disclosure, and add it to the missing list.* Rejected: the register names static FAQ content and no control for it. Adding a requirement here would have been scope creep disguised as an audit finding.
- *Amend the register to register `PgBouncer` and the font stack's fallbacks.* Rejected: the roadmap already records the fallback choice for R1, and the constitution already names Noto Sans Arabic as a permitted face.
- *Fix the templates and `AGENTS.md` without an amendment.* Rejected: they are part of the same governance set the amendment corrects, and leaving them for a later pass would have left the source lists disagreeing after the version moved.
