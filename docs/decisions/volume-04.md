## ADR-061 — The in-flight clarifications recorded, and the reserved decision the one phrasing pre-empted

**Status**: Accepted — 2026-10-06
**Owning directory**: `docs/architecture.md`, `docs/domain-model.md`, `ROADMAP.md`, `docs/DECISIONS.md`
**Owning feature**: none — documentation clarification; the constitution version stays 2.22.0

**Context.** Five edits were sitting in the working tree, uncommitted and unrecorded, in the
two documents that describe the modules and the data model. Four of them are consistent with
the constitution and worth keeping; one contradicts a decision the constitution has reserved
to R10, and the whole set needed the record `docs/domain-model.md`'s own header demands.

1. **The merchant-scope list is settled and correctly stated.** `docs/architecture.md` now
   names the merchant-scoped tables exactly: `Catalog`, `Bookmark`, `Notification`,
   `Conversation`, and `Message` carry `user_id`; `Supplier`, `AuditLog`, and
   `ContactMessage` do not. ADR-053 settled that list, and the architecture document
   says so rather than re-deriving it.
2. **Soft deletion is a registered rule, and the new bullet points at the right place.**
   The constitution registers it for `User` and `Catalog`, with the cascade and the
   blocking rule attached. The bullet cites `docs/domain-model.md` — Soft deletion
   rather than restating the rule, which is the form Single-Reference Sufficiency asks for.
3. **The `auth` and settings notes state the questions and name their owners.** The `auth`
   row now says which stored entity, if any, `auth` owns is open fact #8, decided in R1; the
   `admin` row says the Settings page's storage is open fact #13, decided in R13 per ADR-053.
   Each states a reservation rather than answering it, which is what the reserved-decision
   clause permits.
4. **The audit-target note is a consequence of #3, not a new decision.** It records that only
   a module owning a registered entity can be a target type, so an `auth:` type becomes
   meaningful only once fact #8 is decided.
5. **One phrasing pre-empted a reserved decision.** `Conversation` was rewritten in both
   documents from the register's "The single thread between a merchant and the
   administrator" to "At most one thread ... never a single platform-wide thread". The
   reserved-facts table records the open conflict in these words: "`Conversation` carries an
   administrator reference, yet every administrator account sees the same single thread" —
   owned by R10. Negating the shared thread is one half of that conflict answered in a
   document that is not R10, and the clause that governs it says plainly that a source which
   states an answer the table has not given is itself the defect. It also left
   `docs/domain-model.md` contradicting itself: its own unresolved fact #2 rests on "the
   thread is single and shared", which the sentence above it had just denied.

**Decision.** No constitution amendment; the version stays 2.22.0. This record exists for
the four clarifications that were kept and for the one phrasing that was corrected.

1. **Four edits are kept as they stand:** the merchant-scope list (ADR-053), the soft
   deletion pointer, the `auth` and settings reservations with their owning slices, and the
   audit-target consequence of fact #8.
2. **`Conversation` returns to the register's wording in both documents,** with the register's
   cardinality restated (a user has at most one conversation) and the open half named: both
   documents now point at unresolved fact #2 and its owner, R10. Neither document decides
   whether the thread carries an administrator reference or whether every administrator reads
   the same one.
3. **`ROADMAP.md` gains one obligation** (R1): a committed read-only check that verifies the
   eleven version stamps, every live `ADR-001 ... ADR-0NN` range string, the integration
   manifest hashes, and the design system's token register against `wafar.single.css`. It is
   recorded because three audit passes in a row found the same class of defect by hand, and
   because a check that is not committed is a comment. The row names no external tool; a
   choice of one is the owning plan's, with its ADR.

**What deliberately did not change.** No registered product fact changed: `Conversation`'s
description is now the register's own text, and its cardinality was already registered. No
reserved decision was answered. No constitution section, principle, entity, module, slice, or
Usage Limit moved, and the version stamps stay at 2.22.0 because nothing this record fixes is
a governance rule — it is a documentation correction plus an obligation. The design system
is untouched.

**Consequences.** `docs/domain-model.md` no longer contradicts its own unresolved fact, and
R10 receives the question instead of a document that had answered half of it. The four kept
edits become reviewable, because the record now names them and a reviewer can check each
against the authority it cites. R1 inherits a written obligation to detect the drift class
that three manual passes had to find by eye.

**Alternatives considered.**

- *Amend the constitution's `Conversation` row to say "at most one thread per merchant".* Rejected: that answers the administrator-side half of the reserved conflict, which is R10's to decide, and a governance document may not pre-empt a slice by amendment any more than a mirror may.
- *Keep the phrasing and record it as an annotation on the reserved row.* Rejected: an annotation says a source made a claim; it does not remove the claim, and the clause requires the correction to be made in the source.
- *Revert all five edits.* Rejected: four of them are correct, one of them matches ADR-053, and two others state reservations the constitution requires to be stated with their owners. Reverting would discard accurate work to avoid recording it.
- *Record the clarifications inside ADR-060.* Rejected: that record's subject is the design system's register and the citations that named the wrong section; mixing a data-model clarification into it would make both harder to read and would misstate what the amendment covered.
- *Leave the drift check unrecorded and rely on review.* Rejected: Documentation's rule exists because documentation drifts after the author moves on. An uncommitted check is the same as no check.

---

## ADR-062 — Constitution 2.22.1: wording-only reference precision and stamp sync

**Status**: Accepted — 2026-10-06
**Owning directory**: `.specify/memory/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** The 2.22.1 amendment corrected two reference citations and nothing
else, but it was left incomplete: the review scratch stayed at the top of the
constitution file, and every version stamp outside that file still read 2.22.0.
Governance names eleven stamp sites that MUST move in the same change and says
the review report MUST NOT be committed, so a constitution ahead of its stamps
with its scratch still attached is an amendment that never closed.

**Decision.** The constitution is amended to 2.22.1 (PATCH: wording-only
reference precision, no rule change):

1. **Product Scope → Product Features #16** now reserves the 90-day trigger
   point to R15 under Product Register → Unresolved product facts, where the
   binding table lives, instead of the Product Fact Clarifications section,
   which carries no such table.
2. **Product Register → Unresolved product facts, Settings row** now cites the
   subsection by its exact heading, "Administrator's Application (Separate
   Login)".
3. **The review scratch is removed before commit**, per Governance and ADR-010.
4. **All eleven stamp sites move to 2.22.1 in the same change**, and the live
   `ADR-001 … ADR-0NN` range strings name ADR-062.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined. No section was added or removed. No entity, module, slice, Usage
Limit, register gap, or deferred area moved. The design system file is
untouched, and neither mirror restates a rule.

**Consequences.** The amendment is complete: the stamps agree with the footer,
no committed file carries review scratch, and a reviewer can verify the whole
set by reading the footer against the eleven sites Governance names.

**Alternatives considered.**

- *Leave the stamps at 2.22.0 until the next content amendment carries them.*
  Rejected: Governance requires the stamps to move in the same change, and an
  amendment that leaves them behind is incomplete by definition.
- *Raise this to MINOR.* Rejected: nothing was added and no guidance was
  expanded; a version bump must earn its level under the versioning policy.
- *Fold this record into ADR-060.* Rejected: that record's subject is the
  2.22.0 design-system register; mixing a stamp-sync closure into it would
  misstate what that amendment covered.

---

## ADR-063 — Constitution 2.23.0: the form-metrics register corrected against its source, and the amendment closed

**Status**: Accepted — 2026-10-07
**Owning directory**: `.specify/memory/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** Three states of one amendment were open at once. The 2.23.0 body
and footer had been written while ten of the eleven stamp sites still read
2.22.1, the review scratch was still at the top of the constitution file, and no
record of the amendment existed. ADR-062 records the same failure closing for
2.22.1, so the pattern was known rather than surprising.

The amendment also carried a defect of its own, found by checking the register
against `wafar.single.css` rather than by reading it. Design System Standards →
Token families → Form metrics named five control heights and then said "each
with its desktop variant" while naming four, and the file defines no
`--control-height-xs-desktop`; it narrows the `xs` height inside the
`max-width: 359px` block instead. A register row naming a value its source does
not contain is the same defect read in the other direction, and the row also
omitted the field heights entirely although the module map assigns "control and
field heights" to module 11 and the file defines six `--field-height-*` tokens,
three of them with `-desktop` siblings. An unregistered token is not approved
(Single-Reference Sufficiency), so those six were live and unregistered at the
same time.

**Decision.** The constitution is amended to 2.23.0 (MINOR: material expansion
of the design-system register's content):

1. **Token families → Form metrics** now names the five control heights, the
   three field heights, the seven `-desktop` siblings, and the two select-chevron
   image tokens. It states that `--control-height-xs` is the one height the file
   gives no `-desktop` sibling and that the row therefore names none, and it
   names the `max-width: 359px` re-declaration from `36px` to `32px` so the
   cascade override is checkable against the file.
2. **Token families** replaces prose descriptions with token names across the
   Opacity, Spacing, Radii, Z-index, Glass and gradients, Loaders, and Form
   metrics rows, and **Module map row 11** is corrected. The row names 238
   tokens where it named 76; 162 are newly named by name and none is removed.
3. **The review scratch is removed before commit**, per Governance and ADR-010.
4. **All eleven stamp sites move to 2.23.0 in the same change**, and the live
   `ADR-001 … ADR-0NN` range strings name ADR-063 across `AGENTS.md`, `README.md`,
   `ROADMAP.md`, `docs/architecture.md`, and the specification and checklist
   template overrides.
5. **`.specify/extensions/.cache/` is removed from version control** and added
   to `.specify/.gitignore`. The catalog cache is machine state that the Spec Kit
   CLI rewrites on refresh; tracked, it made every command dirty the working
   tree, and it arrived with CRLF endings while `.gitattributes` reserves `*.json`
   to LF, which is the corruption risk ADR-039 exists to prevent.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined. No Product Scope item, entity, page, feature, Usage Limit, module
map row other than row 11, slice, or slice dependency changed. No technology,
version, licence, or exception changed. `wafar.single.css` is untouched — in
particular no token was invented to satisfy the register. Design System Standards
→ Invariants, Component inventory, Decision values, State map, and Interface
State Matrix are untouched.

**Consequences.** The amendment is complete: the stamps agree with the footer, no
committed file carries review scratch, and every token the register names is a
token the design-system file defines. A slice that wants the missing
`--control-height-xs-desktop` value takes it as a design-system amendment under
Extension procedure and design-system version, moves the design-system version
in the same change, and updates this register row alongside it.

**Deferred, recorded rather than silent.**

- `wafar.single.css` declares `--space-px: 1px` with zero consumers. It is an
  orphan rather than a member of a ladder, so it is removed under the design
  system's own amendment and is deliberately not registered here.
- `wafar.single.css` declares `--control-height-*` and `--field-height-*` in
  module 05 while the module map assigns control and field heights to module 11.
  The map is right and the file is not; module 11 already has a `:root` block and
  no intervening media query redeclares these tokens, so the move is inert. It is
  left to that amendment rather than folded into a governance one.
- Moving the eleven stamp-site references out of the constitution is not done
  here. That list is the paragraph that governs itself, and moving it is a
  Governance amendment in its own right.

**Annotation (2026-10-07, ADR-064).** Both file-level items above were carried
out by ADR-064: `--space-px` is removed, the fifteen height tokens moved into
module 11, and `wafar.single.css` is at 1.2.1. The third item remains open. The
annotation is added rather than the text rewritten, because a decision record is
a history.

**Alternatives considered.**

- *Add `--control-height-xs-desktop` to `wafar.single.css` so the register's
  "each" held.* Rejected: Single-Reference Sufficiency says a register naming a
  value its source does not contain "is corrected by amending the register rather
  than by inventing the value". The direction is fixed by the rule, and no
  consumer exists, so the change would add an unused value to satisfy a clause.
- *Register the orphan tokens the file declares but no surface consumes.*
  Rejected: the Breakpoints section already records that state for the screen
  ladder, the sidebar and navbar heights, and the touch floors, and records it
  for the two shadow groups. Form metrics has no such split because all fifteen
  of its height tokens are consumed by the file today, so a uniform claim would
  be false in the other direction.
- *Commit the scratch and let a later amendment clean it.* Rejected: Governance
  and ADR-010 forbid committing it, and ADR-062 records this same closure for
  2.22.1.
- *Untrack the catalog cache as its own commit.* Rejected: it belongs to the same
  audit set, and one commit closes one amendment.

---

## ADR-064 — Constitution 2.23.1 and wafar.single.css 1.2.1: the audit fix set

**Status**: Accepted — 2026-10-07
**Owning directory**: `.specify/memory/` and `wafar.single.css`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** Two register-to-source defects survived ADR-063, because that record
corrected the Form metrics row and closed the amendment, and both were found by
checking the sources against the registers rather than by reading the registers.

The first was a wrong-direction citation. The Invariants bullet that exempts a
`prefers-color-scheme` rule from the token rule ended "(Invariants below: the mode
is class-based)" while sitting inside the Invariants section, whose first rule is
the one that states it. It is the same defect class ADR-060 closed.

The second was in `wafar.single.css`. The module map assigns "control and field
heights" to module 11, and the file declared all fifteen height tokens in module
05. The file also declared `--space-px: 1px`, an unnumbered one-off inside the
space ladder with zero consumers, which no register pattern resolves.

**Decision.**

1. `wafar.single.css` moves to **1.2.1**. The fifteen `--control-height-*` and
   `--field-height-*` declarations move from module 05's `:root` into module 11's
   existing `:root`, beside the two `--select-chevron` image tokens that module
   already owned, so the file agrees with the module map. `--space-px` is
   removed. The move is inert: every relocated name is unique, no media query
   between the old and new positions redeclares any of them, and the only
   redeclaration — `--control-height-xs` at `32px` inside the
   `max-width: 359px` block — still follows both positions and so still wins.
2. The constitution is amended to **2.23.1** (PATCH: one citation direction, no
   rule, value, or scope change). The exemption bullet now reads "(the first rule
   of this section: the mode is class-based)".
3. All eleven stamp sites move to 2.23.1, and the live `ADR-001 … ADR-0NN` range
   strings name ADR-064. The technology mirror's own ADR list gains ADR-064
   beside the version move its sync markers require.

**What deliberately did not change.** No principle, section heading, register
row, Product Scope item, entity, page, feature, Usage Limit, module-map row,
slice, or slice dependency changed. No design value changed: the fifteen
relocated declarations carry the values they already carried, and
`--control-height-xs` still resolves to `36px` above 359px and `32px` at or
below it. No token was added and no name was renamed. The file's module count
and order were already correct and are untouched.

**Consequences.** Every token the register names is a token the file defines,
every token the file defines is registered or covered by a named pattern, and
the module map's ownership claims are true of the file. The file's inventory is
472 declared custom properties, one fewer than before.

**Alternatives considered.**

- *Keep `--space-px` and register it instead of removing it.* Rejected: the 2.23.0
  review scratch had already recorded the removal as intended, no surface
  consumes it, and registering a dead value would enlarge the register to
  describe a defect rather than remove it. A ladder member the file keeps is
  covered by the `--space-0` … `--space-32` pattern; this one is unnumbered, so
  no pattern covered it.
- *Correct the module map to give the heights to module 05.* Rejected: forms own
  the control and field heights everywhere else — the Form metrics row, the
  component inventory, and the `--select-chevron` tokens module 11 already held —
  so moving the file to the map is the smaller and truer change.
- *Move only the control heights and leave the field heights in module 05.*
  Rejected: the map names both in one phrase, and a half-move leaves the same
  defect with less of it fixed.
- *Fold this record into ADR-063.* Rejected: that record's subject is the Form
  metrics register text and the 2.23.0 closure. A file change and a second
  amendment closed together would misstate what 2.23.0 covered.

---

## ADR-065 — CSS header, workflow hint, and R2 scope defect fix set

**Status**: Accepted — 2026-10-07
**Owning directory**: `ROADMAP.md`, `wafar.single.css`, `.specify/workflows/speckit/`, `AGENTS.md`, `README.md`, `docs/architecture.md`, `.specify/templates/overrides/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** An audit of the governance set against its sources found three
artifact-level defects — of the same class the earlier audit fix sets closed
(ADR-047, ADR-049, ADR-055, ADR-059) — and one register-level defect that no
artifact-level change can fix.

1. **`wafar.single.css`'s header omitted ADR-064.** The header's citation list
   stopped at ADR-060 while its version line reads `1.2.1` — the version ADR-064
   set by moving the fifteen `--control-height-*` / `--field-height-*`
   declarations into module 11 and removing `--space-px`. The header's own second
   line already named ADR-064, so the file disagreed with itself.
2. **R3 indexes parts, but the OpenSearch client library is assigned to R5 —
   and this one is register-level.** R3's scope is "index the parts" and the
   pipeline's step 6 is "Index the parts in the search engine", so R3 is the
   first slice that needs the client; yet the constitution's Technology Standards
   → Register gaps assigns the choice to R5, and `Project-Technologies.txt` and
   `ROADMAP.md`'s own defects table both repeat R5. R5 depends on R3, so R3
   cannot depend on R5 and would use a library no dependency provides.
3. **R2's scope asserted open fact #9's answer.** It named the fields
   `Catalog.size` and `Catalog.mime_type` as recorded. Neither field is
   registered anywhere, and the Product Register's reserved-decision clause
   forbids a bound source asserting an answer the table has not given.
4. **`workflow.yml`'s advisory `integrations.any` list named `opencode` but
   neither `agy` nor `codebuddy`**, the two integrations
   `.specify/integration.json` lists as installed.

**Decision.**

1. `wafar.single.css`'s header ADR list gains **ADR-064** — and deliberately
   **not ADR-063**, which states the file was untouched. No design value changes;
   the file's version stays `1.2.1`.
2. R2's scope no longer names `Catalog.size` or `Catalog.mime_type`; it states
   that the catalog's stored byte count and content type are decided in R2
   (open fact #9).
3. `.specify/workflows/speckit/workflow.yml`'s advisory `any` list gains `agy`
   and `codebuddy`.
4. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-001 … ADR-065**:
   `AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/architecture.md`,
   `.specify/templates/overrides/spec-template.md`, and
   `.specify/templates/overrides/checklist-template.md`.
5. **The OpenSearch client-library owner is left unchanged (R5)** and recorded
   as a defect for a constitution amendment: the Register gaps row moves
   `R5 → R3`, together with `Project-Technologies.txt` and `ROADMAP.md` (its
   First obligations row and its defects-table row). Until that amendment lands,
   no artifact may re-point the owner on its own.

**What deliberately did not change.** The constitution is not amended and its
version stays 2.23.1: no principle, register, value, entity, page, feature, Usage
Limit, module, or slice number changed, and no slice's `Depends on` edge changed.
`wafar.single.css`'s token set and rendered values are untouched. The OpenSearch
client owner stays R5, because moving it is a register change this record cannot
make.

**Alternatives considered.**
- *Add ADR-063 to the CSS header beside ADR-064.* Rejected: ADR-063 states the
  file was untouched, so citing it would create the very defect the fix removes.
- *Re-point the OpenSearch client owner to R3 in `ROADMAP.md` alone.* Rejected
  after checking the register: the constitution's Register gaps row and the
  mirror both name R5, so the change would have traded one drift for a
  register-level contradiction. The owner moves only with the amendment.
- *Keep R2's fields and register `Catalog.size` / `Catalog.mime_type`.* Rejected:
  registering a field to justify a premature assertion inverts the rule that the
  register is amended first.

**Consequences.** R2's scope no longer pre-empts its own open fact; the design
system's header names the record that set its version; the workflow hint names
the integrations the repository actually runs; and the OpenSearch client owner is
recorded as an open defect with its exact fix, rather than silently re-pointed
against the register. This entry is the durable record.

---

## ADR-066 — Constitution 2.24.0: the version lives in two sources, and the OpenSearch client owner

**Status**: Accepted — 2026-10-07
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** Two defects, both found by auditing the governance set against its
own sources.

1. **The amendment procedure was fragile by design.** It named eleven
   version-stamp sites that MUST all move in the same change. The procedure
   failed three times in a row: ADR-062, ADR-063, and ADR-064 each exist in part
   to close an amendment whose stamps had been left behind. A rule that eleven
   copies of one value must stay equal is a rule that will be broken, and each
   break costs a further amendment to repair.
2. **The OpenSearch client library's owner made R3 impossible.** R3's scope is
   "index the parts" and the pipeline's step 6 is "Index the parts in the search
   engine", so R3 is the first slice that needs an OpenSearch client. But
   Technology Standards → Register gaps assigned the client's choice to R5, and
   R5 depends on R3 — so R3 would have used a library no dependency provides, and
   could not depend on the slice that owned the choice. ADR-065 recorded this
   defect and deliberately left the register unchanged, because a register row is
   changed by an amendment, not by a roadmap edit.

**Decision.** The constitution is amended to 2.24.0 (MINOR: the amendment
procedure's version mechanism changes, and a register row changes).

1. **The version now lives in two sources, which MUST agree:** the constitution's
   version footer (human-readable) and `.specify/memory/version.json`
   (machine-readable, `constitution_version`). The amendment is recorded once, as
   an ADR in `docs/DECISIONS.md`. The feature templates' binding blocks,
   `docs/architecture.md`, `docs/domain-model.md`, `ROADMAP.md`, and
   `Project-Technologies.txt` now carry a **pointer** instead of a copied version
   string, because a copied version is a second source that drifts from the
   first. Single-Reference Sufficiency's bullet that required the templates to
   carry "the constitution's version" is amended to require the pointer.
2. **Technology Standards → Register gaps** moves the OpenSearch client library's
   owner from **R5 to R3**, because R3 is the first slice to need it; the row now
   names the worker's index-write path as the reason. `Project-Technologies.txt`
   (its owner list), `ROADMAP.md` (its First obligations row and its defects-table
   row) move with it.
3. **`ROADMAP.md`'s drift-check obligation** no longer says "the eleven version
   stamps"; it verifies the constitution's footer against
   `.specify/memory/version.json`, alongside the range strings, the manifest
   hashes, and the design-system token register.
4. **Every live `ADR-001 … ADR-0NN` range string moves to ADR-001 … ADR-066.**

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined. No entity, page, feature, Usage Limit, module, or slice number
changed, and no slice's `Depends on` edge changed. `wafar.single.css` is
untouched. The design-system version mechanism (the file declares its own
version; the plan records it under Constitution Mandated Values) is unchanged.

**Alternatives considered.**
- *Keep eleven stamp sites and only add the drift check.* Rejected: the check
  cannot run until R1 exists (there is no code), so the fragility would remain
  live for the whole pre-implementation period, and the three prior failures show
  it does not hold on discipline alone.
- *Keep the copied version in the five templates and collapse only the four
  documents.* Rejected: it would leave five of the eleven sites in place for a
  smaller gain, and the templates are the artifacts an agent reads most often — a
  pointer serves them at least as well as a copy.
- *Let ADR-065 re-point the OpenSearch owner in `ROADMAP.md` alone.* Rejected
  there and again here: the register is the authority, so the owner moves only
  with the amendment that changes the register row.
- *Assign the OpenSearch client to both R3 and R5.* Rejected: the register names
  one owner per gap; R3 makes the choice and R5 consumes it, which the row now
  states.

**Consequences.** A future amendment moves two version sources and one ADR
instead of eleven files, so the failure mode that produced ADR-062/063/064 can no
longer occur. A reader who needs the version reads the footer or `version.json`;
a document that copies a version string is now the defect, not the norm. R3's
plan can name the OpenSearch client without depending on a later slice. The
mirror's header no longer reproduces a version string, so its "party/header sync
markers" note describes the pointer scheme. This entry is the durable record.

---

## ADR-067 — Constitution 2.25.0: the administrator is a role, `User.status`, and two new entities

**Status**: Accepted — 2026-10-07
**Owning directory**: `.specify/memory/`, `docs/`, `ROADMAP.md`
**Owning feature**: none — governance decision; ratified by the repository owner. R1 implements `User.status` and `Session`; R13 implements the administrator-role surface and `PlatformSetting`.

**Context.** Four open product facts were resolved together, because each is a
register decision that must land before the slices that implement it (R1, R13)
plan. Each was decided from the sources rather than by preference.

1. **#6 — is an administrator a distinct entity or a role on `User`?** The
   Product Register's roles table and the `User` entity both treat the
   administrator as a role on `User`, and `docs/architecture.md`'s `auth` and
   `admin` rows do the same. The product mirror states one administrator account
   type and that all administrators see the same conversations. The role reading
   is therefore the one the sources already carry.
2. **#7 — what state does an account carry, and is a blocked merchant a state or
   a separate flag?** `docs/domain-model.md` (Soft deletion) states that blocking
   "only changes the account's state" and that "nothing cascades", and the
   Product Register gives the administrator a `block` power with no field to
   write. The account therefore needs a state, not a second flag.
3. **#8 — does the `auth` module own any stored entity?** Principle X lists
   `auth`, and Technology Standards fixes `packages/db/schema/auth.ts` as its
   schema file under the Internal-layout rule that "the table it declares belongs
   to that module". The Identity policy requires sessions that are revocable
   server-side, and `Project-Technologies.txt` names a session store. `auth`
   therefore owns storage, and the register must name the entity it owns.
4. **#13 — where do the administrator's platform settings live?** The Settings
   page is registered in Product Scope with no entity behind it, and the register
   forbids introducing an entity it does not name. The choice is between a new
   entity and a column on an existing one.

**Decision.** The constitution is amended to 2.25.0 (MINOR: the Data entities
register grows by two entities and one field, and two unresolved facts close).

1. **The administrator is a role on `User`.** No administrator entity exists;
   `Conversation` and `AuditLog` name an administrator as a `User` holding the
   administrator role.
2. **`User` carries `status`, a closed two-value set: `active` or `blocked`.** It
   is a state, not a separate flag. Blocking sets it and withdraws access;
   nothing cascades, and it is not deletion (which stays soft, by timestamp).
3. **`auth` owns `Session`** — the server-side, revocable session store. The
   account's identity and profile belong to `users`. `Session` is merchant-scoped
   and carries `user_id`.
4. **`admin` owns `PlatformSetting`** — the administrator-editable platform
   settings the Settings page reads and writes, starting with the contact
   details shown on the Contact page. It is platform-wide and carries no
   `user_id`, and it never carries a Usage Limit (those are constitutional).
5. The Data entities register moves from **ten to twelve** entities; the
   merchant-scoped list gains `Session`, and the platform-wide list gains
   `PlatformSetting`. `docs/domain-model.md`, `docs/architecture.md`, and
   `ROADMAP.md` move with it, and the four facts are struck from both
   unresolved-fact tables with ADR-067 as their resolver.
6. The constitution moves to **2.25.0**: its footer and
   `.specify/memory/version.json`, and the live `ADR-001 … ADR-0NN` range strings
   move with it.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined. No page, feature, Usage Limit, module, or slice number changed, and
no slice's `Depends on` edge changed. `wafar.single.css` is untouched. Facts #1
and #2 (the message sender's representation and `Conversation`'s administrator
reference) stay open and stay with R10: they are schema decisions about the
`messages` module, and resolving #6 removes the conceptual doubt without deciding
their representation.

**Alternatives considered.**
- *Make the administrator a distinct entity.* Rejected: the Product Register,
  the `User` entity, and both module rows already treat it as a role; a distinct
  entity would contradict four sources and add a register entity for no product
  need.
- *Model blocking as a boolean flag beside the role.* Rejected: the domain model
  says blocking changes "the account's state", and a state and a flag would both
  describe the same thing; one closed enum is the smaller and truer shape.
- *Leave `auth` owning no entity and call `auth.ts` a peer of `users.ts`.*
  Rejected: the Internal-layout rule says the table a module's schema file
  declares belongs to that module, and the register forbids an entity it does not
  name, so `auth`'s session store must be registered rather than left unnamed.
- *Store the platform settings as a column on an existing entity.* Rejected: no
  registered entity is platform-wide and admin-editable at once, and a settings
  column on `User` or `AuditLog` would put platform data where a merchant row
  belongs.
- *Resolve facts #1 and #2 here too.* Rejected: they are R10's schema decisions
  about message representation, not consequences of the administrator being a
  role; pre-empting them would be the reserved-decision defect.

**Consequences.** R1 can build the account with a `status` and the `auth`
module's session store without deciding a reserved fact; R13 can build the
administrator surface and the Settings page against `PlatformSetting`. The
register now names twelve entities, so a slice that needs a thirteenth must amend
it as this record did. Both unresolved-fact tables carry four fewer open rows and
a struck-through record of each answer. This entry is the durable record.

---

## ADR-068 — Integration topology settled, and the constitution command aligned to upstream

**Status**: Accepted — 2026-10-07
**Owning directory**: `.specify/`, `.opencode/`, `.codebuddy/`, `.gitignore`, `AGENTS.md`, `Core-Project.txt`, `Project-Technologies.txt`
**Owning feature**: none — governance/tooling decision; ratified by the repository owner

**Context.** Three defects, found by auditing the installed Spec Kit environments
against upstream and against the governance set.

1. **The installed-integration registry and the environment on disk disagreed.**
   `.specify/integration.json` listed `agy` and `codebuddy` while `.opencode/`
   existed and was version-controlled, so `opencode` was unmanaged by the CLI and
   `agy` (Antigravity) was installed although the Spec Kit catalogue does not
   declare it multi-install safe — it shares `.agents/skills/` with Codex and Zed.
2. **The constitution command carried a stale scope-guard exception.** Both
   `.opencode/commands/speckit.constitution.md` and
   `.codebuddy/commands/speckit.constitution.md` carried an "amendment stamp
   sites" block asserting that the amendment procedure "requires eleven version
   stamps to move". ADR-066 (2.24.0) replaced that mechanism: the version now
   lives in exactly two sources (the constitution footer and
   `.specify/memory/version.json`) plus one ADR, and Governance states that the
   command "edits only this document". The block therefore contradicted the
   constitution it was meant to serve, and it restated a version mechanism that
   Single-Reference Sufficiency forbids another document from restating.
3. **`integrations/.cache/` was not ignored.** `.specify/.gitignore` ignored
   `extensions/.cache/` only, so the CLI's refreshed catalogue files dirtied the
   working tree on every check — the same defect ADR-063 closed for the
   extension cache.

**Decision.**

1. **The installed integrations are `codebuddy` (default) and `opencode`.**
   `agy` is retired and its `.agents/` tree removed. `.specify/integration.json`
   lists both installed integrations with their settings, `integration` and
   `default_integration` stay `codebuddy`, and `.specify/extensions/.registry`
   carries no `agy` entry.
2. **The constitution command is aligned to upstream in both environments.** The
   stale "eleven version stamps" block is removed and the three sentences it had
   modified are restored to the upstream wording, so
   `.opencode/commands/speckit.constitution.md` and
   `.codebuddy/commands/speckit.constitution.md` are byte-identical to the
   official command. Governance's precedence rule ("where a command's scope
   guard and this paragraph conflict, this paragraph wins") already covers the
   case the block tried to pre-empt.
3. **Both integration manifests record the aligned hash** for
   `speckit.constitution.md` (`c172c743…`).
4. **`integrations/.cache/` is added to `.specify/.gitignore`**, on the same
   reasoning as `extensions/.cache/` (ADR-063).
5. **`Core-Project.txt` §8 is corrected to twelve entities.** Its summary table
   still read "the ten entities" and omitted `Session` and `PlatformSetting`,
   which ADR-067 registered; a bound mirror that contradicts the register is
   corrected to it.
6. **The live `ADR-001 … ADR-0NN` range strings move to ADR-068**, and
   `Project-Technologies.txt`'s header ADR list gains ADR-067 and ADR-068.
7. **`.workbuddy-ai/` is added to the root `.gitignore`.** It is the agent's
   working-tool state for this project (its memory and its audit notes), not
   Spec Kit and not governance content, so it stays out of the repository. It is
   distinct from `.codebuddy/`, which is the Spec Kit integration's command
   directory and is tracked.
8. **`.specify/integrations/.cache/` is untracked** (`git rm --cached`),
   completing item 4's ignore rule: a file that is both tracked and ignored
   still surfaces as modified, so the ignore alone does not stop the tree from
   dirtying.
9. **`workflow.yml` drops the retired `agy` entry** from its advisory
   `integrations.any` list; `codebuddy` and `opencode` stay.
10. **`speckit.manifest.json` is restored to its committed state, and its
    remaining drift is left visible rather than re-recorded.** The manifest is
    the CLI's pristine baseline: re-recording the hashes of files the project
    deliberately customized (the five binding overrides and `.specify/.gitignore`)
    would make the CLI treat them as unmodified and overwrite them on a refresh.
    The drift is the truthful signal that they are customized.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined; the constitution stays 2.25.0 and `wafar.single.css` is untouched.
No entity, page, feature, Usage Limit, module, or slice number changed. The
binding cycle, the extensions (`assess`, `bug`, `git`), the hooks, and the
templates are unchanged.

**Alternatives considered.**
- *Keep `agy` installed alongside the others.* Rejected: the Spec Kit catalogue
  does not declare it multi-install safe, and the two remaining integrations each
  own a private command directory, so neither collides with the other.
- *Keep the exception block and correct "eleven" to "two".* Rejected: the
  constitution is the single authority for the version sources and forbids
  another document from restating them, so the block is removed rather than
  re-worded.
- *Align only the codebuddy copy.* Rejected: the two environments must behave
  identically, so both files are aligned and both manifests re-hashed.
- *Correct `Core-Project.txt` in a separate change.* Rejected: it is the same
  mirror-sync defect ADR-067 left behind, and one record closes it.

**Consequences.** Both installed environments are first-class: the CLI manages
`.codebuddy/commands/` and `.opencode/commands/`, which are byte-identical to
each other and to upstream, and either can be used with the same command
spelling (`/speckit.*`). A `specify` refresh no longer leaves an unmanaged
environment behind, and `Core-Project.txt` agrees with the register again. This
entry is the durable record.

**Annotation (2026-10-20, ADR-095).** Decision item 1 above says the installed
integrations are "`codebuddy` (default) and `opencode`", and that `integration`
and `default_integration` stay `codebuddy`. ADR-095 made `opencode` the default
in both fields and kept `codebuddy` installed, so the parenthetical and the
two-field sentence are superseded; the rest of the item — both integrations
installed, `agy` retired, and the registry carrying no `agy` entry — stands.

---

## ADR-069 — Cross-artifact consistency fix set

**Status**: Accepted — 2026-10-08
**Owning directory**: `docs/`, `AGENTS.md`, `ROADMAP.md`, `README.md`, `Project-Technologies.txt`, `.specify/templates/overrides/`
**Owning feature**: none — documentation-consistency decision; ratified by the repository owner

**Context.** A deep cross-artifact audit of the governance set — the constitution,
the two mirrors, the roadmap, the domain model, the binding templates, and the
installed integration state — found three consistency defects. None changes a
binding rule; each is a document disagreeing with another document, or with the
repository's actual state.

1. **The domain model named the wrong owner for two open facts.**
   `docs/domain-model.md`'s Relationships note said the conversation's
   administrator side and the audit record's administrator party were "owned by
   R13". The same document's Unresolved facts table (rows 1–2), `ROADMAP.md`
   (R10), `docs/architecture.md` (the `messages` row), and the constitution's
   Unresolved product facts table all name **R10**. The audit record's
   administrator party carries no unresolved fact at all: ADR-067 settled it by
   making the administrator a role on `User`.
2. **`AGENTS.md` §6 reported a closed gap as open.** Its "Known gaps" list said
   `.codebuddy/`, `.specify/integrations/codebuddy.manifest.json`, and
   `.specify/memory/version.json` were untracked and "MUST be tracked in the next
   commit (ADR-068)". Commit `26df272` had already tracked all three, so the
   entry was stale and would be re-reported on every read. It also put
   `AGENTS.md` in direct conflict with ADR-068 item 7, which states `.codebuddy/`
   "is tracked".
3. **Two binding templates drifted from their own sources.**
   `tasks-template.md` numbered its example tasks `T001`, `T002`, then `T004` —
   a skipped `T003` — while the override's own rule requires IDs "in execution
   order". `plan-template.md`'s Gate 3 still listed **Catalog data shape** among
   live deferred areas, although the constitution discharged it in 2.18.0
   (ADR-040).

**Decision.**

1. `docs/domain-model.md`'s Relationships note now names **R10** as the owner of
   the conversation's administrator-reference fact, and states that the audit
   record's administrator party carries no separate open fact because ADR-067
   settled it.
2. `AGENTS.md` §6's integration-state entry is marked **closed (2026-10-08)**,
   with the verifying commit named, and is kept marked closed rather than deleted
   so it is not re-reported.
3. `.specify/templates/overrides/tasks-template.md`'s Foundational example tasks
   are renumbered `T003`/`T004`, making the Setup-and-Foundational example range
   contiguous from `T001`; a comment records that story phases begin at `T010` by
   the core template's convention.
4. `.specify/templates/overrides/plan-template.md`'s Gate 3 marks **Catalog data
   shape** as discharged in 2.18.0 (ADR-040).
5. **Every live `ADR-001 … ADR-0NN` range string moves to ADR-001 … ADR-069**:
   `AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the
   `spec-template.md` and `checklist-template.md` overrides.
   `Project-Technologies.txt`'s header ADR list gains ADR-069.
6. **`Core-Project.txt` §8's twelve-entity summary was reviewed and retained.**
   It is the product mirror's map of the register — which the register itself
   permits a mirror to carry — and it already defers to `docs/domain-model.md` as
   the sole data-model authority. Replacing it with a pointer would remove a
   reader's map without removing a second source of *rules*. No change.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined. No entity, page, feature, Usage Limit, module, or slice number
changed, and no slice's `Depends on` edge changed. `wafar.single.css` is
untouched. The constitution stays **2.25.0**: this record changes no
constitutional text, so neither its footer nor `.specify/memory/version.json`
moves, and the two version sources remain in agreement — the property this record
exists to protect.

**Alternatives considered.**
- *Change ADR-068's "is tracked" wording to match `AGENTS.md`.* Rejected: ADR-068's
  claim was **correct** and `AGENTS.md` was stale (verified with `git ls-files`);
  a ratified record is not rewritten to match a stale statement, which is the
  rewriting ADR-015 forbids.
- *Delete the `AGENTS.md` gap entry entirely.* Rejected: keeping it marked closed
  preserves the trace and stops the same gap being re-reported as new.
- *Renumber the whole tasks template contiguously, including the story phases.*
  Rejected: the story phases deliberately begin at `T010` to match the core
  template's convention and to leave room for a feature's own Foundational tasks;
  only the actual skip (`T003`) was the defect.
- *Bump the constitution to 2.25.1 for the template edits.* Rejected: the
  templates' binding blocks are unchanged and no register moved; the versioning
  policy reserves PATCH for changes to the constitution itself, and a consistency
  fix that leaves its text intact keeps the version.
- *Edit `Project-Technologies.txt`'s header to drop its ADR list.* Rejected: the
  list is the mirror's own record of the amendments it mirrored (ADR-066), and it
  is appended to, not restated.

**Consequences.** The governance set no longer contradicts itself on the
message-owner question, the reported integration gap matches the repository's
real state, and the two binding templates read cleanly against their own rules
and against the constitution. ADR-068's byte-identity claim is independently
confirmed: `.codebuddy/commands/` and `.opencode/commands/` are byte-identical
(`diff` clean), and `speckit.specify.md` matches its manifest hash. This entry is
the durable record.

---

## ADR-070 — Part tenancy, and a clarification set

**Status**: Accepted — 2026-10-08
**Owning directory**: `.specify/memory/`, `docs/`, `ROADMAP.md`, `Core-Project.txt`, `Project-Technologies.txt`, `AGENTS.md`, `README.md`, `.specify/templates/overrides/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of `.specify/memory/constitution.md` (2.25.0) against
`wafar.single.css` and the four other governing documents — carried out
mechanically as well as by reading — found one substantive gap and five
clarifications. The mechanical pass was clean on the things a register can be
checked for: all 258 tokens the constitution names exist in the stylesheet, all
42 `ds-*` classes it names exist, all nine components it reports as missing are
absent, the shadow ladder's consumed/unconsumed split matches, and every live
ADR range string and `Register gaps` owner agrees across the set. The
findings below are what the pass did not cover.

1. **`Part`'s tenancy was unclassified.** Schema and Migration Control names the
   merchant-scoped column and lists the platform-wide tables that carry none —
   `Supplier`, `AuditLog`, `PlatformSetting`, and `ContactMessage` — but `Part`,
   the twelfth entity, appeared in neither list. `docs/architecture.md` sharpened
   the omission into a contradiction: "The merchant-scoped tables are **exactly**
   `Catalog`, `Bookmark`, `Notification`, `Conversation`, `Message`, and
   `Session`". The ambiguity is consequential, not cosmetic: the public Parts
   table shows every part to every merchant and to a guest, so a reader who
   classified `Part` as merchant-owned would make the product's own read path
   violate the isolation invariant that follows in the same section. `User` was
   the only other entity in neither list; its place is self-evident and already
   stated — the rule opens by declaring that a tenant identifier *is* the `User`
   identifier — so it is the tenant root rather than scoped data, and the record
   names it so the classification is a complete partition of the twelve entities.
2. **Governance's enumeration of binding sections omitted `Glossary`**, although
   `Glossary` states a MUST ("a feature MUST use a term as defined rather than a
   synonym for it"). The section was binding through the paragraph above it; the
   list simply did not name it.
3. **Principle V carried an invalid CSS example.** A fixed-angle direction was
   written `to 90deg`; an angle is written `90deg` and `to` takes a side-or-corner
   keyword, so the example could not be executed as written inside a
   NON-NEGOTIABLE principle.
4. **The multi-select filter's "no selection" semantics was stated two ways.**
   Product Scope and Product Features #7 said "no selection means every
   **supplier**"; Design System Standards said "no selection meaning every
   **value**". The filters span four dimensions, so only the general wording is
   true of all four.
5. **Breakpoints read as forbidding tokens that Decision values binds.** It said
   the screen ladder, `--sidebar-width`, `--navbar-height`, and `--touch-floor`
   "MAY not be relied on" while Decision values fixes two of those values and
   Principle IX requires them.
6. **`--text-2xs-tight` sat outside the Typography register.** The row resolves
   sizes with the range `--text-4xs` … `--text-6xl`, which yields the ladder
   steps and not a `-tight` variant, and the row's own rule requires a one-off
   token to be written out in full.

**Decision.**

1. **`Part` is classified as platform-wide-readable.** Schema and Migration
   Control now states that a part is read by every merchant and by a guest
   through the public Parts table, so a merchant-scoped `parts` read would
   contradict Product Scope; `Part` carries no `user_id`, the merchant scope of a
   part is carried by the `Catalog` it belongs to, and the isolation rule does not
   treat the parts read path as a merchant-scoped path. `docs/domain-model.md`'s
   merchant-ownership note adds `Part` to the tables that carry no `user_id`, and
   `docs/architecture.md`'s cross-cutting bullet does the same, so all three
   documents state one classification. The same three documents also name
   **`User` as the tenant root** — the row a `user_id` references, scoped by its
   own identifier rather than by a foreign key to itself — so the classification
   now covers all twelve entities: six merchant-scoped, five platform-wide, and
   the tenant root.
2. `Glossary` is added to Governance's list of binding sections.
3. Principle V's example is corrected to `` `90deg` ``.
4. Product Scope's Parts row and Product Features #7 now read "no selection means
   every value of that filter"; the two mirrors carry the same wording
   (`Core-Project.txt` §5 page 2 and §12 feature 7; `ROADMAP.md` R5).
5. Breakpoints now forbids relying on a token **as a wired value** until its
   module wires it to a media query, and states that `--sidebar-width`,
   `--navbar-height`, and `--touch-floor` keep the values Decision values and
   Principle IX fix.
6. `--text-2xs-tight` is named in the Typography row, beside the four aliases the
   row already names for the same reason.
7. **The constitution moves 2.25.0 → 2.26.0.** The footer and
   `.specify/memory/version.json` move together, this record is the durable
   record, and every live `ADR-001 … ADR-0NN` range string moves to
   **ADR-001 … ADR-070** (`AGENTS.md`, `README.md`, `ROADMAP.md`,
   `docs/architecture.md`, and the `spec-template.md` and `checklist-template.md`
   overrides). `Project-Technologies.txt`'s header ADR list gains ADR-070.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined; item 1 expands the Schema section's guidance and does not move a
principle. No entity, page, feature, Usage Limit, module, or slice number
changed, and no slice's `Depends on` edge changed. `wafar.single.css` is
untouched: the six findings are defects of the register, and the stylesheet
already behaves as the corrected text describes. **The two Unresolved-facts
tables were not merged.** The constitution's five rows and
`docs/domain-model.md`'s thirteen are deliberately on two levels — a product fact
binding in the register, and a field-level fact carried by the model and mirrored
in `ROADMAP.md` → Open data-model questions — and `domain-model.md` records the
split; the audit that produced this record briefly read the difference as a gap
and retracted that reading on finding the split documented.

**Alternatives considered.**
- *Classify `Part` as merchant-scoped (carry `user_id`).* Rejected: the public
  Parts table is read by every merchant and by a guest, so a merchant-scoped
  `parts` read would contradict Product Scope and break the product's core read
  path. The catalog already carries the merchant scope the part inherits.
- *Leave `User` implicit.* Rejected: the rule reads as a partition of the twelve
  entities, and naming the tenant root costs one clause while removing the last
  entity that appears in neither list.
- *Leave `Part` unclassified and let `docs/domain-model.md` decide.* Rejected:
  the constitution requires a feature to be able to discharge every rule it must
  obey from the constitution itself (Single-Reference Sufficiency), and the
  classification decides whether the isolation test covers the parts read path —
  a security-relevant question cannot be left to inference.
- *Move the model's rows 9–11 into the constitution's Unresolved product facts
  table.* Rejected: the two-level split is deliberate and documented; merging it
  would create the second source the split exists to avoid.
- *Keep "every supplier" and correct the design-system sentence instead.*
  Rejected: the filters span car model, type, catalog file, and supplier, so
  "every supplier" is false for three of the four; the general wording is the one
  that is true everywhere.
- *Delete the unused tokens from `wafar.single.css` instead of clarifying the
  Breakpoints sentence.* Rejected: the tokens' values are binding decisions that
  Principle IX and Decision values depend on; only the phrasing that made them
  unusable was wrong.
- *Bump to 2.25.1 (PATCH).* Rejected: item 1 is a material expansion of binding
  guidance, which the versioning policy classifies MINOR; items 2–6 are
  clarifications that ride in the same amendment.

**Consequences.** A feature planning R5 or R2 can now discharge the tenancy of
`Part` from the constitution alone, and the isolation test's scope is stated
rather than inferred. The three documents that describe the data model agree on
one classification of the twelfth entity. `Glossary` is named where the binding
procedure is enumerated, the one unexecutable example is fixed, the filter
semantics reads one way across the constitution and both mirrors, the design
system's binding values are no longer in apparent conflict with the paragraph
that reports their wiring state, and the stylesheet's full text-token inventory
is registered. All twelve entities are now classified — six merchant-scoped,
five platform-wide, and the tenant root — so the isolation test's scope is
decidable from the constitution alone. The two version sources agree at
**2.26.0**. This entry is the durable record.

---

## ADR-071 — Cross-artifact consistency and tooling fix set

**Status**: Accepted — 2026-10-08
**Owning directory**: repository root, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `.specify/templates/overrides/`, `.specify/integrations/`
**Owning feature**: none — documentation-consistency and tooling decision; ratified by the repository owner

**Context.** The repository was audited against upstream Spec Kit (1.1.0) and
against its own governance set. The audit read the `.specify/` tree, the
constitution, the two mirrors, the roadmap, the domain model, the four binding
templates, the integration state, and the two installed command directories, and
it verified the installed-file integrity **mechanically** rather than by reading:
every SHA-256 hash `speckit.manifest.json` records was recomputed against the
working tree. The findings are these.

1. **The integration manifest had drifted on the files the project owns.** Of
   the manifest's eighteen entries, **twelve match** — the six PowerShell
   scripts, the five core templates, and `exception-register.md`, which are
   upstream-owned and MUST stay unmodified — and **six are stale**: the five
   `templates/overrides/*` files and `.specify/.gitignore`. All six are files the
   project deliberately edits (the overrides are the binding layer; the
   `.gitignore` gained the `extensions/.cache/` and `integrations/.cache/` rules
   of ADR-063/ADR-068). The drift is therefore expected, but it made the manifest
   read as an integrity failure when it is not one, and no check distinguished
   the two cases.
2. **The live `ADR-001 … ADR-0NN` range strings drift by hand.** Six documents
   carry the range literally — `AGENTS.md`, `README.md`, `docs/architecture.md`,
   `ROADMAP.md`, and the `spec-template.md` and `checklist-template.md`
   overrides — and every amendment must move all six in step with the index.
   `ROADMAP.md` → First obligations already assigned a committed read-only
   governance drift check to R1 to catch a miss, but the check did not exist yet.
3. **`docs/DECISIONS.md` had grown to ~0.3 MB across 71 records.** The binding
   templates' Project Context Sources blocks told a reader to read the file, and
   a whole-file read is both the most expensive load in the set and the least
   targeted.
4. **The binding templates asked for whole-file reads of the largest sources.**
   The four overrides' Project Context Sources blocks named the constitution and
   `docs/DECISIONS.md` without narrowing to the sections or records a feature
   actually needs.
5. **`AGENTS.md` §6 carried three gaps of unequal standing.** `.opencode/package.json`
   is untracked and its `@opencode-ai/plugin` pin is machine-local;
   `create-new-feature.ps1` is installed but uncalled (kept for upstream parity);
   and `speckit.taskstoissues` is a reserved surface with no owner.
6. **The two-integration byte-identity invariant was asserted, not checked.**
   ADR-068 states `.codebuddy/commands/` and `.opencode/commands/` are
   byte-identical and their manifests match; nothing verified it mechanically.

**Decision.**

1. **A committed, dependency-free governance drift check is added** at
   `governance-drift-check.mjs` in the repository root — a root-level governance
   tool, like `README.md` and `AGENTS.md`, not a product workspace, so the
   constitution's Repository topology table is unaffected. It runs on the pinned
   Node runtime and adds no dependency, as `ROADMAP.md` → First obligations
   requires, and it verifies four invariants:
   (a) the constitution footer equals `constitution_version` in
   `.specify/memory/version.json`;
   (b) every live `ADR-001 … ADR-0NN` range string equals the last ADR row in
   `docs/DECISIONS.md`'s index;
   (c) every `speckit.manifest.json` hash for an **upstream-owned** file matches
   the working tree — the project-owned files are excluded by a documented rule
   (any path under `.specify/templates/overrides/`, plus the explicit
   `.specify/.gitignore`);
   (d) `.codebuddy/commands/*` and `.opencode/commands/*` are byte-identical and
   match their manifest hashes.
2. **The live range strings stay literal and move to `ADR-001 … ADR-071`** in the
   six documents that carry them, and the check in item 1(b) is what keeps them
   from drifting. A literal range is kept rather than replaced by a pointer so a
   reader still sees the range at a glance; the check, not discipline, is the
   guarantee.
3. **The manifest's integrity check covers upstream-owned files only, and the
   project-owned hashes stay at the CLI baseline.** ADR-068 item 10 is the
   governing decision: re-recording the hashes of the five overrides and
   `.specify/.gitignore` would make the CLI treat them as unmodified and
   overwrite them on a refresh, so the drift is left visible and the path rule in
   item 1(c) excludes those files from enforcement. *(Amended 2026-10-08 by
   ADR-072: an earlier draft of this item said the six hashes are "refreshed once
   so the file is truthful at commit time"; that was reverted, because it
   contradicted ADR-068 item 10.)*
4. **`docs/DECISIONS.md` gains a Reading protocol** near its head: read the index,
   then only the records the change touches; the index's last row is the single
   authority for the live range string. The four binding templates' Project
   Context Sources blocks are narrowed the same way — they name the sections and
   records to read instead of the whole file — so the guidance is targeted even
   when the context window is not the constraint.
5. **`AGENTS.md` §6 is corrected**: the `@opencode-ai/plugin` pin is recorded in
   the file so a fresh clone knows it; `create-new-feature.ps1` is marked
   intentional upstream parity; `speckit.taskstoissues` stays reserved.
6. **`ROADMAP.md` → First obligations' drift-check row is marked delivered** by
   this record (pre-R1), so the duty is not owned twice.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined. No entity, page, feature, Usage Limit, module, or slice number
changed, and no slice's `Depends on` edge changed. `wafar.single.css`,
`Core-Project.txt`, and `Project-Technologies.txt` are untouched. The
constitution stays **2.26.0**: this record changes no constitutional text, so
neither its footer nor `.specify/memory/version.json` moves, and the two version
sources remain in agreement. The upstream-owned files — the six scripts and the
five core templates — are not modified; their hashes already match and the fix
leaves them alone.

**Alternatives considered.**
- *Replace the literal range strings with a pointer to the index.* Rejected: the
  range is useful at a glance in `AGENTS.md` and `README.md`, and the automated
  check removes the drift the pointer would avoid; the project keeps the literal
  form and gains a guarantee instead of losing a convenience.
- *Refresh every manifest hash and enforce all eighteen.* Rejected: the five
  overrides and `.gitignore` are edited on purpose, so an all-eighteen check
  fails on every legitimate edit and trains the reader to ignore it; enforcing
  only the upstream-owned files keeps the check meaningful.
- *Split `docs/DECISIONS.md` into several files.* Rejected: the file is the
  single authority the constitution names in References, and a reading protocol
  plus a compact index removes the cost without fragmenting that authority.
- *Place the drift check under `.specify/scripts/`.* Rejected: that directory is
  upstream-owned and hash-tracked, and a project script there blurs the parity
  the manifest exists to protect; a root-level governance tool is the honest
  location.
- *Bump the constitution to 2.26.1 (PATCH).* Rejected: no constitutional text
  changes; the versioning policy reserves PATCH for changes to the constitution
  itself, and a consistency-and-tooling fix that leaves its text intact keeps the
  version, as ADR-069 established.

**Consequences.** The installed-file integrity check is now meaningful: it passes
on a clean tree and fails on a real upstream modification, while tolerating the
project's own edits. The live range strings can no longer drift silently — the
check compares them to the index, which is their authority. The largest document
in the set is read by index and record rather than end to end, in the templates
as well as by hand. The two-integration byte-identity claim is verified rather
than asserted. The two version sources remain in agreement at **2.26.0**. This
entry is the durable record.

**Annotation (2026-10-08, ADR-074).** Item 1 above classifies `.specify/templates/exception-register.md` as an upstream-owned file that "MUST stay unmodified", and item 3 keeps the project-owned exclusion to the five `templates/overrides/*` files and `.specify/.gitignore`. The register is not upstream-owned: Governance requires the project to maintain it, and ADR-052 and ADR-054 wrote its six rows into it. Its recorded hash happens to match the project's copy, so check C enforced a project-authored file — and would have failed on the next exception granted. ADR-074 adds it to the exclusion rule, so the three project-owned paths are the five overrides, `.specify/.gitignore`, and the exception register.

---

## ADR-072 — Workflow execution defects and CSS standard conformance

**Status**: Accepted — 2026-10-08
**Owning directory**: `.specify/workflows/`, `.specify/integrations/`, `.specify/templates/overrides/`, `.specify/memory/`, `docs/`, `wafar.single.css`, `AGENTS.md`, `Project-Technologies.txt`, repository root
**Owning feature**: none — governance, tooling, and design-system decision; ratified by the repository owner

**Context.** A deep audit compared the repository against upstream Spec Kit 1.1.0
(its `engine.py`, `presets.md`, and bundled workflow) and against the CSS and
HTML standards, reading every command, script, template, mirror, and the
stylesheet. It confirmed defects that earlier consistency passes did not reach,
because those passes checked cross-references rather than executability and
standard conformance.

1. **`workflow.yml` was structurally invalid.** Its `requires.integrations.any`
   list had been re-indented to the same level as `speckit_version`, so `any`
   became an unknown sibling key inside `requires`. The engine's
   `_RECOGNIZED_REQUIRES_KEYS` accepts only `speckit_version` and `integrations`
   and rejects the rest, so `specify workflow run speckit` fails validation
   before any step runs.
2. **ADR-071 contradicted ADR-068 item 10.** ADR-071 said the six project-owned
   manifest hashes are "refreshed once"; ADR-068 had already decided the opposite
   — re-recording them makes the CLI treat the customised overrides as unmodified
   and overwrite them on a refresh. The refresh was reverted.
3. **Gate 2 of the plan template was one row out of step with Governance.**
   ADR-070 added `Glossary` to Governance's binding enumeration, and the
   constitution requires the templates to move with it, but
   `overrides/plan-template.md` Gate 2 still listed eighteen of the nineteen
   sections.
4. **Two CSS values were not valid CSS.** `linear-gradient(to inline-end, …)` and
   `background-position: inset-inline-end …` are not defined by any CSS
   specification, so both declarations were dropped — the gradient text rendered
   invisible (`color: transparent` with no background) and the select chevron
   fell to the wrong corner. Principle V itself named `to inline-start`/`to
   inline-end` gradient directions and `inset-inline-*` "functions", none of
   which exist.
5. **`prefers-contrast: high` is not a valid media-feature value** (the values are
   `no-preference`, `more`, `less`, `custom`), so the constitution's
   high-contrast MUST was silently unimplemented.
6. **`PlatformSetting`'s invariant forbade a read the product requires.** The
   model said "No merchant-reachable path reads or writes it" while the same
   entity's meaning, and Product Scope, require the public Contact page to render
   the contact details it holds.
7. **Convergence tasks could not satisfy the traceability rule.** The
   constitution and the tasks template require every task to end with
   `(implements FR-###, AC-###)`, but `/speckit.converge` (byte-identical to
   upstream) appends tasks ending with `per <source-ref> (<gap-type>)`.
8. **The binding File Processing Overview omitted the validation and
   content-safety steps** that File Processing Rules require "before storage", so
   the single binding sequence, read alone, permitted storing an unvalidated
   file.
9. **The register named the wrong OpenSearch feature and the wrong retention
   granularity.** OpenSearch's lifecycle feature is Index State Management (ISM),
   not Index Lifecycle Management (ILM, which is Elasticsearch's), and ISM
   deletes whole indices by index age — it cannot expire each catalog 90 days
   after its own trigger, which is the product's rule.
10. **`Project-Technologies.txt`'s header ADR list omitted ADR-071**, though the
    mirror's own sync marker requires each amendment to append its ADR.
11. **`AGENTS.md` §3 omitted `analyze` and `converge`**, and the drift check
    enforced only half of ADR-071's item 1(d): it compared the two command
    directories to each other but never against their integration manifests.

**Decision.**

1. **`workflow.yml`'s `requires.integrations.any` list is re-indented under
   `integrations:`**, matching upstream's shape, so the workflow validates and
   runs. `AGENTS.md` §5 records that the file is a project-customised copy that a
   `specify` upgrade may replace.
2. **`speckit.manifest.json` is restored to its committed baseline**, and
   ADR-071 item 3 is amended to cite ADR-068 item 10. The drift check continues to
   exclude the project-owned files from hash enforcement.
3. **Gate 2 gains a `Glossary` row**, restoring the template to Governance's
   nineteen-section enumeration.
4. **Principle V's value-form sentence is corrected**: the logical forms are the
   `start`/`end` keywords, the `inline-start`/`inline-end`/`block-start`/
   `block-end` **position keywords**, and the `inset-inline-start`/
   `inset-inline-end` **properties**; CSS defines no logical gradient direction,
   so a writing-mode-derived gradient states the explicit angle the document's
   single direction fixes (`dir="rtl"`, line end at the left edge, `270deg`) and
   MUST NOT use a `to <side>` keyword. `wafar.single.css` moves to **1.3.0**:
   the three gradients use `270deg`, the chevron uses
   `inline-end var(--space-2) block-start 50%`, and the two literal radii use
   `--radius-full` / `--radius-lg` / `--radius-xl`.
5. **`prefers-contrast: high` becomes `more`**, so the high-contrast block
   actually matches.
6. **`PlatformSetting`'s invariant becomes "Admin-writable only; publicly
   readable where the product requires it"**, naming the Contact page's
   projection.
7. **Artifact Workflow and the tasks template accept the converge tail**:
   `per <source-ref> (<gap-type>)` satisfies the traceability rule for a task that
   repairs an existing obligation.
8. **The File Processing Overview's steps 1 and 2 are rewritten** to carry
   validation and content safety in the binding sequence, keeping the eight-step
   numbering so existing "step 1/4/6" references stay valid.
9. **The Search register row, `docs/architecture.md`, and `docs/domain-model.md`
   name Index State Management (ISM) and state that per-catalog 90-day deletion
   is the retention job's work** (R15), not the index lifecycle's.
10. **`Project-Technologies.txt`'s header ADR list gains ADR-071 and ADR-072.**
11. **`AGENTS.md` §3 gains `analyze` and `converge` entries, and
    `governance-drift-check.mjs` is extended**: check B scans every markdown file
    under `docs/` and the overrides (not only the six required files); a new check
    D2 verifies each integration manifest against the tree it records, completing
    ADR-071's item 1(d); and a new check F verifies that the
    `Project-Technologies.txt` header ADR list ends at the index's last ADR. The
    Reading protocol's own range reference is made range-agnostic (`ADR-0NN`), so
    the one live range string in `docs/DECISIONS.md` cannot go stale behind the
    check's exclusion of that file.
12. **The constitution moves 2.26.0 → 2.27.0** (MINOR: the File Processing
    Overview and Artifact Workflow expansions are material guidance additions;
    the Principle V and register corrections ride with them). The footer and
    `.specify/memory/version.json` move together, and every live
    `ADR-001 … ADR-0NN` range string moves to **ADR-001 … ADR-072** (`AGENTS.md`,
    `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the `spec-template.md`
    and `checklist-template.md` overrides).
13. **The two remaining token-rule defects are fixed in the same amendment.**
    The literal `box-shadow` offsets on the field focus rings become three tokens
    (`--shadow-ring-error`, `--shadow-ring-error-strong`, `--shadow-ring-success`)
    and the off-scale `z-index: calc(… + 10)` values on the floating-layer
    classes become five tokens (`--z-float-1`, `--z-float-2`, `--z-float-3`,
    `--z-float-modal`, `--z-float-drawer`). Every one is a token definition, so no
    class rule in `wafar.single.css` now carries a raw shadow offset or a raw
    `z-index`. The register's Shadows and Z-index rows, and the Breakpoints shadow
    count, move with them (twenty-five → twenty-eight shadow tokens; sixteen →
    nineteen named shadows, seven → ten consumed).

**What deliberately did not change.** No principle was added, removed, or
renamed; item 4 corrects a value-form sentence inside Principle V without moving
the principle. No entity, page, feature, Usage Limit, module, or slice number
changed, and no slice's `Depends on` edge changed. `Core-Project.txt` is
untouched. The five binding overrides keep their structure; only Gate 2 and the
tasks template's rule 1 changed.

**No defect the audit found is left open by this amendment.** The two remaining
classes of the design system's own "Inside the design system file" rule — raw
shadow offsets in class rules and off-scale `z-index` values — are fixed in item
13, so the rule now holds for every class rule in `wafar.single.css`, not only for
its token definitions.

**Alternatives considered.**
- *Leave `workflow.yml` and document the engine as unused.* Rejected: the file
  claims to run the binding cycle, and a file that fails validation is worse than
  no file.
- *Keep ADR-071's hash refresh and add an ADR-068 annotation.* Rejected: ADR-068's
  rationale is a live risk (a refresh overwriting the binding overrides), so the
  correct action is to revert the refresh, not to annotate around it.
- *Express the logical gradient direction with `to left`.* Rejected: that is the
  physical keyword Principle V prohibits, and under the fixed `dir="rtl"` document
  the explicit angle `270deg` is equivalent and permitted.
- *Keep `prefers-contrast: high` and treat it as a browser extension.* Rejected:
  no browser defines it; the block never matched.
- *Renumber the File Processing Overview steps to insert validation.* Rejected:
  three documents cite steps 1, 4, and 6 by number, so the steps were widened in
  place instead.
- *Bump to 2.26.1 (PATCH).* Rejected: the Overview and Artifact Workflow changes
  are material expansions of binding guidance, which the versioning policy
  classifies MINOR.

**Consequences.** The bundled workflow validates and runs; the manifest matches
ADR-068's decision and the binding overrides are protected from a refresh
overwrite; the plan template's Gate 2 is back in step with Governance; the
stylesheet's gradient text, chevron, and high-contrast block render as intended
and the values are standard CSS; the Contact page's read of `PlatformSetting` is
no longer contradicted by the model; convergence tasks are traceable under the
rule as written; the ingestion sequence carries validation and content safety;
and the search register names the feature OpenSearch actually has, with the
retention mechanism stated correctly for R15. The drift check is stronger: it
scans every governance markdown file for a stale range string and verifies both
integration manifests. The two version sources agree at **2.27.0**. This entry is
the durable record.

## ADR-073 — Duplicate-storage semantics, slice component obligations, and mirror precision

**Status**: Accepted — 2026-10-08
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `.specify/`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`, repository root
**Owning feature**: none — governance and documentation decision; ratified by the repository owner

**Context.** A deep audit read the whole governance set — the constitution, both
Arabic mirrors, `docs/architecture.md`, `docs/domain-model.md`, `ROADMAP.md`, this
log, the bundled workflow, the extension registry, and the design-system register —
and then checked the fifteen slices' order and ownership against the artifacts. It
confirmed a residue that the cross-reference passes of ADR-070 through ADR-072 did
not reach: one rule whose own words contradicted the pipeline it governs, and a set
of obligations and mirror statements that had drifted one step behind the decisions
that fixed their neighbours. Every finding below was reproduced against the working
tree before it was written here; where an earlier draft of this log cited a line
number, the record is cited by content instead, because position drifts.

1. **F-01 — the duplicate rule contradicted the pipeline it governs.** File
   Processing Overview step 2 stores the bytes in object storage and computes the
   content hash; step 3 is the duplicate check, and it necessarily runs *after*
   storage, because there is no hash to compare before the bytes exist. But File
   Processing Rules said a duplicate "MUST NOT be stored", which reads as "never
   written". The two other "MUST NOT be stored" sentences in the same section are
   sound — validation and content safety both run *before* storage, so for them the
   phrase means exactly what it says — but the duplicate sentence sat at the one
   point in the sequence where storage has already happened. The rule is corrected
   to say what the pipeline does: no catalog is created, the bytes step 2 stored are
   withdrawn so that no duplicate is retained, and the file is not queued or
   processed. Step 3 carries the same correction, so the sequence and the rules
   agree.
2. **N-01 — the Contact page's `PlatformSetting` read had no creating slice.** The
   entity is `admin`-owned (ADR-067) and the Settings page reads and writes it, but
   the *first* surface that reads it is the public Contact page, which R11 owns. R11's
   scope boundary said "Static content and the contact form only", and the Settings
   write surface is R13's — while R13's `Depends on` already includes R11. Read
   together with ADR-072 item 6, which made the entity publicly readable, this left
   R11 with a read it could not satisfy and no owner for the schema. The assignment
   follows the rule the constitution already states — the slice that first needs a
   thing creates it — so **R11 creates `PlatformSetting`'s schema and its public read
   projection, seeded with a default**, `admin` remains its owning module, and R13
   adds the administrator's write surface over it. The edge stays one-way
   (R11 → R13); no dependency cycle exists.
3. **N-02 — the technology mirror still named ILM.** ADR-072 item 9 corrected the
   Search register row, `docs/architecture.md`, and `docs/domain-model.md` to Index
   State Management (ISM), the feature OpenSearch actually has, and stated that the
   per-catalog 90-day deletion is the retention job's work (R15). The mirror is
   corrected from the register, which is its source: both occurrences now read ISM,
   and the row states why ILM is not the name (it is Elasticsearch's feature) and why
   the index lifecycle alone cannot enforce the window.
4. **N-03 — the worker's write path was unregistered.** `docs/architecture.md`
   forbids reading or writing a table from outside the module that owns it, and the
   constitution's Project Structure and Debt Control repeats the rule — but the data
   flow diagram drew `apps/worker` writing `packages/db` directly, and the worker
   writes `catalogs` and `parts`, both owned by `apps/api` modules. R3 would have had
   to invent the channel. It is now stated: the worker reaches the system of record
   through the owning module's service (`catalogs` for the status, `parts` for the
   extracted rows), exposed via the shared package, and the diagram's arrow into
   `packages/db` is that service path rather than a direct table access. The worker
   writes the search index directly, because it is the projection's only writer.
5. **N-04 — six of the fifteen missing design components had no named owner.** The
   constitution's "Components the product requires and the design system does not
   yet provide" list carries fifteen items, and each MUST be added to
   `wafar.single.css` by the slice that first needs it. The First obligations table
   named owners for the shell's items and the sticky header, but pagination, the
   column sort indicator, the filters toolbar, the multi-select control, and the
   price-range control were unassigned, and the notification bell with its counter
   had no owner at all. All six now have a row: the five Parts-table components to
   R5, and the notification bell to R9, which is the slice that first needs it. Every
   one of the fifteen now has a named owning slice.
6. **N-05 — R5's scope did not name two of its own components.** R5's row listed
   pagination, the sort indicator, the filter bar, and the sticky header as coming
   from `wafar.single.css`, but the multi-select control and the price-range control
   are required by the same slice's filters and were missing from the sentence. Both
   are named, and the row now states that the slice adds the ones the file does not
   yet provide.
7. **F-02 — the constitution template said "eighteen binding sections".** Governance
   enumerates nineteen: the eighteen it already listed plus `Glossary`, which ADR-070
   added. ADR-072 item 3 corrected the plan template's Gate 2 for the same reason but
   left the constitution override's own header text at the old count. It now reads
   nineteen and points at Governance as the count's authority.
8. **F-03 — the drift check's header did not document its own checks.** ADR-072
   added check F and check D2 to `governance-drift-check.mjs`; the header comment
   still described only A, B, C, D, and E. The header now lists every check, so the
   file documents the invariants it enforces.
9. **A stale CLI cache sat untracked and unignored.** `.specify/memory/.resolved-template.json`
   is machine-local resolved-template state the Specify CLI writes, and a fresh clone
   regenerates it — the same class as `extensions/.cache/` and `integrations/.cache/`,
   which `.specify/.gitignore` already excludes for the reasons ADR-063 and ADR-068
   record. It was not ignored, so a `git add -A` would have committed a stale copy of
   the constitution scaffold (it still read "eighteen binding sections"). It is added
   to `.specify/.gitignore` and is not tracked.

**What deliberately did not change.** No principle was added, removed, or renamed.
No entity, page, feature, Usage Limit, module, or slice number changed, and no
slice's `Depends on` edge changed — R11 gains no dependency, because the rule that
the first reader creates the entity is what the roadmap already applies elsewhere.
`Core-Project.txt` is untouched, and so are `docs/domain-model.md` and the
constitution's Product Register: they describe `PlatformSetting`'s nature and
ownership, both of which are unchanged, and the creating slice is a roadmap concern.
`wafar.single.css` is untouched — this amendment assigns owners for components the
stylesheet does not yet contain; it does not add them. The six binding overrides
keep their structure.

**Alternatives considered.**
- *Say the duplicate is "never stored" and move the duplicate check before storage.*
  Rejected: the check compares hashes, and a hash needs the bytes; moving the check
  before storage would mean hashing a stream the platform has not yet accepted, and
  it would break the presigned-multipart transport the register names. The honest
  fix is to say what the sequence does.
- *Leave R11's read and let R13 create the entity, reversing the edge.* Rejected:
  that is the cycle the audit found — R13 already depends on R11, so R11 cannot
  depend on R13.
- *Assign the notification bell to R1, since it lives in the shell header.*
  Rejected: the constitution assigns each component to the slice that first *needs*
  it, and R1's shell has no notification source; R9 is the first slice whose product
  requires the bell, and R1's shell row already fixes the header it sits in.
- *Record the mirror and architecture fixes without an ADR, as errata.* Rejected:
  the mirror is corrected *from* the register, and the worker's write path is a
  binding architectural statement; both are governance text, and Governance requires
  a recorded amendment for any change to it.
- *Bump to 2.28.0 (MINOR).* Rejected: item 1 clarifies a rule whose meaning was
  already fixed by the pipeline it governs, and the remaining items assign existing
  obligations and correct text that had fallen behind ADR-070 and ADR-072. Nothing
  is added to the guidance, so the versioning policy classifies this PATCH.

**Consequences.** The File Processing Rules and the pipeline they govern now say the
same thing about a duplicate, and the presigned-multipart transport stays valid. R11
has an owner for `PlatformSetting`'s schema and public projection, so its plan no
longer depends on a table R13 has not yet built, and the R11 → R13 edge stays
one-way. The worker's write path is registered, so R3 chooses a service call rather
than inventing an exception. Every one of the fifteen missing design components now
has a named owning slice, so no slice can ship a screen whose control the design
system still lacks without the gap being visible in the roadmap. The technology
mirror names the feature the register names. The constitution moves 2.27.0 →
**2.27.1** (PATCH), and its footer and `.specify/memory/version.json` move together;
every live `ADR-001 … ADR-0NN` range string moves to **ADR-001 … ADR-073**
(`AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the
`spec-template.md` and `checklist-template.md` overrides), and
`Project-Technologies.txt`'s header ADR list gains ADR-073. The drift check reports
clean at 2.27.1 with the index ending at ADR-073. This entry is the durable record.
