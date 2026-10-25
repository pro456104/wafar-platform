## ADR-105 — The second audit fix set: the copied ADR lists, the R1 register amendment, and four new check-coverage rules

**Status**: Accepted - 2026-10-21
**Owning directory**: `.specify/memory/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `.githooks/`, `Project-Technologies.txt`, `Core-Project.txt`, `governance-drift-check.mjs`
**Owning feature**: none - governance record ratified by the repository owner; the register amendment in decision 3 is the amendment R1's own clarification of 2026-10-21 promised, and its content is exactly what that clarification named.

**Context.** A second deep audit of the constitution and the governance set,
run against the uncommitted ADR-103/ADR-104 working tree, found the set sound in
substance - no reserved fact asserted anywhere, no identifier gap or dangling
reference in the R1 specification, every structural count correct, and the drift
check clean - and found nine defects of three kinds.

The first kind was **copied enumerations that had drifted**. The list of ADRs
that built and extended the drift check is one fact, and it was written out in
full in four places. Only one of them was right: `ROADMAP.md` named thirteen of
the twenty-one ADRs, and `.githooks/pre-commit` named ten and stopped at
ADR-102, two amendments behind the check it runs. `Project-Technologies.txt`'s
header had been edited from `.../101/102` to `.../101/104`, which ends at the
right number and silently drops ADR-102 and ADR-103.

The second kind was a **promised register amendment that had not been made**.
The R1 specification (lines 1536-1539 and 2307-2309) and its checklist (lines
70-75) both state that the transient verification store and the three
account-level sign-in fields are recorded in `docs/domain-model.md`, and that
the Product Register's `User` row is amended in the same change. ADR-104 was
that change and did neither, so both documents asserted a record that did not
exist - and the checklist marked the item satisfied.

The third kind was **wording and provenance**: a stale `apps/web/layouts` path
in the roadmap, a "binding section below" that contradicted "the sections above"
two sentences earlier, a defect table that claimed all its rows came from auditing
the thirteen-slice order when two had been added against the fifteen-slice order,
and a mitigation review date set to the day it was written.

**Decision.**

1. **The ADR enumeration has one authority: the check's own header.** The check
   gains check **K**, which reads the list from its own header line and requires
   every run of five or more comma-separated ADR numbers in `README.md`,
   `AGENTS.md`, `ROADMAP.md`, the constitution, `.githooks/pre-commit`, and
   itself to equal that list as a set. `ROADMAP.md` and `.githooks/pre-commit`
   stop carrying a copy and point at the header instead, because a pointer
   cannot drift while a copy will. A short inline citation such as `(ADR-040)`
   is untouched, so ordinary citation stays free.
2. **`Project-Technologies.txt`'s header list is made contiguous and checked for
   contiguity.** ADR-102 and ADR-103 are restored, and check **F** now compares
   the whole `040..N` sequence rather than only its last entry, because a list
   that ends correctly and skips two entries is still wrong.
3. **The R1 register amendment is made, and the version moves at MINOR.** The
   Product Register's `User` row now names the three account-level sign-in
   fields - the consecutive failed sign-in attempt count, the sign-in lock's
   expiry, and the requirement to change the password at first sign-in - and
   `docs/domain-model.md` gains the invariants over them plus a **Transient
   verification state** section that records the one-time codes and the pending
   request as non-entity state owned by the `users` module, so the register
   stays at twelve entities. This is the amendment the R1 clarification of
   2026-10-21 promised; it adds no field the clarification did not name, decides
   no reserved fact, and adds no entity. Because it expands a register, the
   constitution moves to **3.7.0** (MINOR), and `version.json` moves with it.
   The R1 specification and its checklist are left as they stand, because the
   record they assert now exists.
4. **Check G11 binds the entity map to the register.** Every entity's owning
   module must agree across the constitution's Data entities table and
   `docs/domain-model.md`'s Entity map, in both directions. The two tables
   agreed by discipline before; nothing compared them, and the drift check does
   not otherwise read the domain model.
5. **Check G10 binds the Constitution Mandated Values count to the template.**
   The constitution's list is closed and the plan template must gain a matching
   row in the same change, but the template states both numbers only in prose.
   The check reads the constitution's list, the template's row count, and the two
   numbers the template's own sentence states, and requires all four to agree.
6. **Four wording and provenance corrections.** `ROADMAP.md`'s structure-
   registers note names `apps/web/app/layouts`, the location the constitution and
   `docs/architecture.md` actually fix, instead of a parallel `apps/web/layouts`
   that no other document carries; the governance paragraph's "binding section
   below" reads "above", matching "the sections above" two sentences earlier and
   the position of every binding section in the document; the defect table states
   which audit each group of defects came from; and R1's declared concentration
   review date moves to **2026-12-01** rather than the date the note was written,
   because a checkpoint that is due on the day it is created is not a checkpoint.
7. **This record is a governance record**, not a technical decision: its subject
   is the constitution's own text, the mirrors, and the governance tooling, which
   is outside the reach of the `Alternatives considered` field (ADR-090), so that
   section is not written for it.

**What deliberately did not change.** Every principle and every binding section
other than the wording in decision 6; the page, feature, role, and usage-limit
registers; the product scope; the technology register and its gaps; the Wafar UI
layer's path and visual foundation; the slice count, order, and identifiers; the
unresolved product facts and their owners; the exception register; the
amendment procedure and the versioning policy as ADR-103 amended them; and every
decision record already ratified. **No slice is added, removed, renumbered, or
reordered**, and no product behaviour changes. The three fields decision 3
registers were already decided by R1's clarification; this record makes the
register say so rather than deciding anything new. Checks A through J and the
earlier checks B through I are untouched in what they verify.

**Consequences and migration/backfill.** `version.json` moves to 3.7.0 and names
this record as the one that moved it. The live `ADR-001 . ADR-104` range strings
become `ADR-001 . ADR-105` in the same change, because the range string's
authority is the index's last row. `Project-Technologies.txt`'s header list
becomes `040..105`, contiguous, and the check now enforces that. `AGENTS.md`,
`README.md`, and the constitution's `References` row gain check K, check G10,
and check G11 to the coverage they describe. No migration or backfill is
required: the register change is one row's prose, the model change is
documentation, and the tooling change reads files it already read.

**Follow-ups.** Three observations from the same audit are recorded here rather
than fixed, because each is a decision about a slice rather than a defect in a
document: R10 exercises the administrator's reply path before R13 owns the audit
log, which leaves an administrator operation unrecorded between the two slices;
`first_page_metadata_incomplete` is a registered product fact that this record's
own change gives an owner, because `ROADMAP.md`'s R3 row names setting it; and
the constitution's Unresolved product facts table cites the Product Register for
a `Message` sender and a `Conversation` administrator reference the register's
one-line meanings do not state, which R10 resolves whichever way it decides.
Review date: 2026-12-15. This entry is the durable record.

**Annotation (2026-10-22, ADR-108).** The first follow-up is closed by ADR-106,
which moves the administrator's reply to R13 and leaves no administrator
operation outside the audit log. The third is closed by ADR-106, which corrects
the Unresolved product facts table's Sources column so it no longer cites the
Product Register for a field the register does not state. The second was false
when this record was written: commit `e410e5b`, which carries this entry, makes
`ROADMAP.md`'s R3 row name setting `first_page_metadata_incomplete`, so the
sentence above is corrected rather than annotated, and no follow-up remains open.


---

## ADR-106 — The third audit fix set: the administrator reply, the citation precision, and the specification identifier check

**Status**: Accepted - 2026-10-22
**Owning directory**: `.specify/memory/`, `docs/`, `ROADMAP.md`, `governance-drift-check.mjs`
**Owning feature**: none - governance record ratified by the repository owner.

**Context.** Three findings from the audit that produced ADR-105 needed a
decision rather than a correction, and the repository owner took all three on
2026-10-22.

The first was an **unrecorded administrator operation**. R10's row said the
administrator's reply was authored through the administrator's surface and that,
before R13 landed, acceptance verified the reply path "via the admin API
directly". The constitution requires every administrator operation to be
recorded in the audit log, and the audit log arrives with R13. Between the two
slices there was therefore a reply that wrote a message and left no record - the
same class of defect the roadmap's own table claims closed at its entry 5.

The second was a **citation that named a register fact the register does not
state**. The Unresolved product facts table cited the Product Register for a
`Message` sender and a `Conversation` administrator reference. The register's
one-line meanings are "One message inside a conversation" and "The single thread
between a merchant and the administrator", and the register's own rule says a
one-line meaning registers a field only where the field's existence is itself a
product decision. The citations asserted more than the rows carry.

The third was a **coverage gap in the drift check**. Principle I requires
stable identifiers that are never renumbered or reused, and the specification
template requires every functional requirement to be cited by at least one
acceptance criterion. R1 satisfied both, verified by hand; nothing verified the
next specification, so the class of silent drift the ADR enumerations suffered
was unguarded in the artefact class that matters most.

**Decision.**

1. **The administrator's reply moves to R13.** R10 ships the merchant's side of
   the thread - sending a message and reading the reply after a refresh - and
   creates the `messages` module. R13 authors the reply and delivers the
   notification for it, because it owns the audit log and no administrator reply
   may exist before it can be recorded. R10's row and R13's row both say so, and
   R10 no longer verifies anything through the admin API. No product behaviour
   changes: the merchant still sends, still sees the reply, and is still notified
   of it; only the slice that delivers the reply moves.
2. **The Unresolved product facts table states what the sources actually say.**
   The two rows no longer cite the Product Register for a field it does not
   register. Row one now reads that no source fixes how a message's sender is
   represented, and row two that no source fixes whether the administrator's side
   of a conversation is a reference, a role, or absent. The owners stay R10, and
   the questions are unchanged; only the citation is corrected. `docs/domain-
   model.md`'s companion paragraph is corrected with it.
3. **The drift check gains check L.** For every `specs/*/spec.md` it verifies
   that each of `FR-###`, `AC-###`, and `SC-###` is contiguous from 001, defined
   once, and never referenced without being defined; and that every functional
   requirement is cited by at least one acceptance criterion. A specification
   with no identifiers at all is skipped, so a freshly scaffolded spec does not
   fail the hook.
4. **Five wording defects are corrected.** R9's scope no longer says the
   notification list carries "a counter", which invited a second surface for a
   count the constitution gives to the header control alone. R2's "only" list now
   names content safety, which it already assigned to intake. R3's "only" list
   now names the `suppliers` module it creates, and its creation is no longer
   conditional, matching the first-obligations table that assigns it
   unconditionally. The broken sentence in `docs/domain-model.md` that read
   "A slice that finds either answer needs a product fact ... must amend" is
   fixed. The constitution's reading protocol now names the Usage Limits table by
   the section it lives in, matching `AGENTS.md` §3, which the protocol says it
   mirrors.
5. **This record is a governance record**, not a technical decision: its subject
   is the constitution's own text, the roadmap, and the governance tooling, which
   is outside the reach of the `Alternatives considered` field (ADR-090), so that
   section is not written for it.

**What deliberately did not change.** Every principle and binding section; the
page, feature, role, entity, and usage-limit registers; the product scope; the
technology register and its gaps; the Wafar UI layer; the slice count, order, and
identifiers; the unresolved product facts and their owners; the exception
register; the amendment procedure; and every decision record already ratified.
No slice is added, removed, renumbered, or reordered, and no product behaviour
changes. Checks A through K and G10/G11 are untouched in what they verify.

**Consequences and migration/backfill.** `version.json` moves to 3.7.1 and names
this record as the one that moved it. The live `ADR-001 . ADR-105` range strings
become `ADR-001 . ADR-106` in the same change, and `Project-Technologies.txt`'s
header list gains 106 contiguously; check K enforces the enumerations and check F
enforces the contiguity, so neither can drift silently again. ADR-031's account of
R10's intent is annotated, because this record supersedes item 5's provision that
pre-R13 acceptance uses the admin API directly; the rest of ADR-031 stands, and
ADR-029's dependency provision is untouched. No migration or backfill is required: the changes are
roadmap prose, two table rows, and one read-only check.

**Follow-ups.** The audit's remaining observation - that R1 carries a checklist
but no plan, because the binding cycle places the plan before the checklist - is
a workflow state rather than a defect in a document: R1 is `in-progress`, its
specification is `Clarified - ready for planning`, and the owner has deferred
planning deliberately. It is recorded here so a later reader does not mistake the
absent plan for an omission.
Review date: 2027-01-15. This entry is the durable record.

---

## ADR-107 — The session activity, the policy messages, the city names, the code step, and the submit guard

**Status**: Accepted - 2026-10-22
**Owning directory**: `specs/001-identity-foundation/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/architecture.md`, `Project-Technologies.txt`, `.specify/templates/overrides/`
**Owning feature**: none - product clarification ratified by the repository owner; R1 binds the rules, and the slice that ships the first page carrying the frame exercises the runtime behaviour.

**Context.** A clarification session on 2026-10-22, after ADR-106, settled five
points the R1 specification still left open: what counts as activity for the
session timeout, whether the person is told what the password policy requires
and whether the reasons a password is refused are told apart, what the fixed
Libyan city list's entries carry and what its search matches, what the
one-time-code step shows and whether the mobile number may be changed there, and
whether the in-progress guard covers the new-password step of the
password-recovery flow. None of them changes a page, an entity, a role, a
register, or a limit; each one removes a phrase a test could not assert.

**Decision.**

1. **Only what the merchant themselves do counts as activity for the session
   timeout.** An action the merchant starts - opening a page, submitting a form
   - resets the inactivity clock, and a request the browser sends on its own,
   such as a background request the frame issues, does not. A background request
   therefore cannot keep a session alive indefinitely, and the timeout keeps its
   meaning.
2. **The password policy is disclosed, and each reason for a refusal has its own
   message.** The form that takes a password states the policy's requirements
   before the password is typed, and a password shorter than the minimum and a
   password that is common or breached each carry their own message, so the
   person knows what to correct. None of these messages reveals whether an
   account exists: the policy applies to every password submitted, and the same
   message is given for the same reason whether or not the number has an
   account, so SC-004's uniformity is untouched.
3. **The fixed Libyan city list carries one Arabic name per entry, and its
   search ignores diacritics.** No Latin alternate name is carried, so the list
   holds no second naming source to keep in step with it, and a person who types
   a city without its diacritics still finds it.
4. **The one-time-code step shows the fields the person filled in for reading,
   and they are not editable there.** The mobile number is among them, so the
   person sees which number the code was sent to. A person who wants a different
   number returns to the page's first step and submits the form again, which
   starts a new pending request for the new number on FR-034's terms, while the
   pending request for the first number stays live until its own expiry.
5. **The in-progress guard covers every submission these three pages make.** The
   new-password step of the password-recovery flow is guarded exactly as the
   password-recovery request is: a repeated submission there neither sets the
   password twice nor ends the account's sessions twice, and a failure on that
   step shows the same inline, explicit, retryable message every failure on
   these pages shows, because the error page arrives with a later slice. The
   account's own change-password action has no surface in this slice, so the
   guard has no page to act on there.

**What deliberately did not change.** No page, entity, role, product feature,
usage limit, security rule, technology, or constitution version changed by this
record; the constitution stays at 3.7.1. ADR-099 through ADR-106 stand, and this
record only completes them. The requirement and criterion counts are unchanged
at 50 FR, 54 AC, and 9 SC; no identifier was renumbered, reused, or withdrawn.
No application code, package, CSS, or font file was created.

**Alternatives considered.**

- *Every request from the session counting as activity.* Rejected: the frame
  issues background requests, so the inactivity timeout would lose its meaning
  and a merchant who leaves a page open would never be asked to sign in again.
- *A single, undetailed refusal for a password that fails the policy.* Rejected:
  the person cannot correct a password they are not told about, and telling the
  reasons apart reveals nothing about account existence because the policy
  applies to every password submitted.
- *A Latin alternate name beside each Arabic name in the city list.* Rejected:
  it makes a second naming source that every later slice and every later
  amendment of the list must keep in step with the first.
- *Leaving the mobile number editable at the code step.* Rejected: it leaves the
  entered code ambiguous between the pending request it belongs to and the one
  the number would start, and the person has no way to tell which code the
  platform will accept.
- *Leaving the new-password step outside the in-progress guard.* Rejected: a
  repeated submission there sets the password again and ends the sessions again,
  and the page has no error page to move a failure to.

**Consequences and migration/backfill.** The R1 specification's FR-005, FR-032,
FR-035, FR-038, FR-040, AC-005, AC-015, AC-037, AC-041, AC-043, the `Session`
entity, the city-list Assumption, the matching edge case, and the Test Coverage
Request carry the rules. The live `ADR-001 . ADR-106` range strings become
`ADR-001 . ADR-107` in the same change, and `Project-Technologies.txt`'s header
list gains 107 contiguously. No migration or backfill is required: the change is
specification prose, one decision record, and the copied range strings.
Review date: 2026-11-20. This entry is the durable record.

---

## ADR-108 — The record corrections: the closed follow-ups and the misnamed annotation

**Status**: Accepted - 2026-10-22
**Owning directory**: `docs/`
**Owning feature**: none - governance record ratified by the repository owner.

**Context.** A fourth audit of the governance set, run on 2026-10-22 against the
ADR-107 working tree, re-examined the twelve findings the third audit had
reported and rejected three of them as misreadings of a cell read without its
surrounding sentence. Four of the nine that stood are defects in records this
repository wrote on 2026-10-21 and 2026-10-22, not defects in the roadmap or the
register, and they are corrected here.

The first was a **follow-up that was false when it was written**. ADR-105's
Follow-ups paragraph said `first_page_metadata_incomplete` had "no slice in
`ROADMAP.md` that names setting it". The commit that carried that paragraph,
`e410e5b`, is the same commit that made R3's row name setting the fact. The
record asserted the absence of a change it shipped.

The second was a **record that named the wrong record**. ADR-106's consequences
said "ADR-029's account of R10's intent is annotated". The provision the record
superseded - that pre-R13 acceptance verifies the reply path through the admin
API directly - is item 5 of ADR-031, and the annotation is placed there, which is
correct. ADR-029's item 2, that R10 depends on R1 and R9, states a dependency
ADR-106 did not change, and it stands.

The third and fourth were **follow-ups closed by a later record without an
annotation**. ADR-105 recorded that R10 exercises the reply path before R13 owns
the audit log, and that the Unresolved product facts table cites the Product
Register for fields the register does not state. ADR-106 closed both. A reader of
ADR-105 met two open items that were closed, because the file's own rule -
annotate a record when a later decision changes what it says - had not been
applied to the record that opened them.

**Decision.**

1. **ADR-105's second follow-up is corrected in place.** Its sentence now states
   that the fact has an owner because this record's own change gives it one,
   rather than asserting that no slice names it.
2. **ADR-105's first and third follow-ups are annotated.** The annotation records
   that ADR-106 closed both, and that the second was corrected rather than
   annotated because it was false when written.
3. **ADR-106's consequences name ADR-031 and its item 5.** The citation is
   corrected, the annotation stays where it is, and ADR-029's dependency
   provision is stated to stand.

**What deliberately did not change.** The constitution and its version, which
stays at 3.7.1; the page, feature, role, entity, and usage-limit registers; the
product scope; the slice count, order, dependencies, and identifiers; every
unresolved product fact and its owner; the exception register; the amendment
procedure; and every other provision of ADR-105 and ADR-106. No check changed
what it verifies.

**Consequences and migration/backfill.** The live `ADR-001 . ADR-107` range
strings become `ADR-001 . ADR-109` in the same change, because ADR-109 is
recorded with this one and the range string's authority is the index's last row.
`Project-Technologies.txt`'s header list gains 108 and 109 contiguously. No
migration or backfill is required: the change is record prose and the copied
range strings.
Review date: 2026-12-20. This entry is the durable record.

---

## ADR-109 — The slice corrections: the delete cascade, the content-safety owner, and the notification source

**Status**: Accepted - 2026-10-22
**Owning directory**: `ROADMAP.md`, `docs/`
**Owning feature**: none - governance record ratified by the repository owner.

**Context.** The same fourth audit found four defects in the slice order and the
module map, each a statement that had drifted from the change that made it true.

The first is an **ordering defect with a data consequence**. `ROADMAP.md`'s
defect table says R8 adds the bookmark leg to the catalog-delete cascade "rather
than a second one", and that R13's admin delete and R15's retention job "reuse
the routine as it stands". R8 and R13 were both in the sixth layer, so they could
be built in parallel, and R13's `Depends on` did not name R8. A build that
reached R13 first would delete a catalog through a routine that had no bookmark
leg, leaving bookmarks pointing at parts that no longer exist.

The second is an **owner split across the wrong boundary**. The first-obligations
table assigned the content-safety pipeline to "R2 (validation), R3
(processing)". The constitution runs content safety at intake, before the queue
and the worker, and R2's own scope names all four steps and closes with "only".
R3 owns the pipeline and the extraction, not the scan.

The third is an **incomplete module description**. `docs/architecture.md`'s
`notifications` row named processing outcomes and administrative messages, and
omitted the administrator's reply that the constitution and
`docs/domain-model.md` both give as a source.

The fourth is an **edge with no data dependency**. R10's row depends on R9, and
after ADR-106 moved the administrator's reply to R13, R10 reads no notification.
The edge would be a false statement about the data if it were read as one.

**Decision.**

1. **R13 depends on R8.** R13's `Depends on` becomes `R1, R2, R3, R4, R5, R8,
   R9, R10, R11`. The consequence is a schedule change, not a formality: R13
   moves from the sixth layer to the seventh, R14 from the seventh to the eighth
   because it depends on R13, and the dependency graph's longest path becomes
   eight slices instead of seven. R15 already depends on R8, so its row does not
   move. The alternative - keeping the parallel window and accepting orphaned
   bookmarks - is not a schedule question but a data-integrity one.
2. **R2 alone owns the content-safety pipeline.** The first-obligations row reads
   "R2 (validation and content safety)". R3's row is unchanged: it owns the
   pipeline and the `parts` and `suppliers` modules.
3. **The `notifications` row names all three sources.** The architecture's row
   gains the administrator's reply, matching the constitution's Glossary and
   `docs/domain-model.md`.
4. **R10's edge to R9 is kept and stated as sequencing.** The roadmap's Notes
   record that the edge orders the thread after the notification list, so the
   merchant's side ships against a list that already exists, and that it is not a
   data dependency. R10's row is otherwise unchanged.

**What deliberately did not change.** The constitution and its version; the page,
feature, role, entity, and usage-limit registers; the product scope; the slice
count and identifiers, and the order of every slice other than the two the graph
moves; R14's and R15's dependency cells; every unresolved product fact; the
exception register; and every check's coverage. No slice is added, removed, or
renumbered.

**Consequences and migration/backfill.** The roadmap's dependency graph gains one
edge, from thirty-eight to thirty-nine, and no document states either count in
prose. R14's and R15's own cells are unchanged; their position moves because the
graph moves, not because a row was edited. `docs/architecture.md` gains one
source in one cell. No migration or backfill is required.
Review date: 2026-12-20. This entry is the durable record.

---

## ADR-110 — The twenty-seventh page: the administrator application's login

**Status**: Accepted - 2026-10-22
**Owning directory**: `.specify/memory/`, `Core-Project.txt`, `.specify/templates/overrides/`, `docs/`, `governance-drift-check.mjs`, `specs/001-identity-foundation/`
**Owning feature**: none - constitution amendment ratified by the repository owner; R13 ships the page.

**Context.** The Product Scope says the administrator operates "the separate
application with its own login", and R13's row names "its own login" as part of
the slice. The Product Register's Pages section is a closed list of twenty-six
pages, and it carries no login row for the administrator application: the public
"Log In" page is the merchant's, and the administrator application is a separate
application with a separate entry. The register's own rule forbids adding a
screen that is not on the list, so R13 could not be planned without either
registering the page or deciding that the login is not a page at all.

A fourth audit of the governance set found the gap on 2026-10-22 and reported it;
the repository owner ratified registering the page rather than reinterpreting the
register, because the public 404 page is registered as a page and a login screen
is at least as much a screen as an error page.

**Decision.**

1. **The administrator application's login is registered as the twenty-seventh
   page.** The Product Scope's Administrator's Application table gains a
   `Log In` row as its first row, carrying "Mobile number and password", the same
   credential model the public Log In page uses, because ADR-041 makes every
   account a +218 number and the administrator is a `User` holding the
   administrator role (ADR-067).
2. **The register's count moves from twenty-six to twenty-seven.** Product
   Register → Pages states the new count in both places it states it, and the
   close of the sentence still forbids a screen outside the list.
3. **The amendment is MINOR.** It expands a register, which the versioning policy
   puts at MINOR; the constitution moves to **3.8.0**, and `version.json` moves
   with it. The product scope's substance does not change: the login was already
   required by the Product Scope's role table and by R13's row, and this record
   makes the register say so.
4. **The copies that restate the count are moved in the same change.**
   `Core-Project.txt` numbers twenty-seven pages and its administrator table
   carries the login as its first row; the plan template and the specification
   template stop saying twenty-six; the R1 specification's four statements stop
   saying twenty-six; and `governance-drift-check.mjs`'s structural count expects
   twenty-seven, so the constitution's prose and its tables cannot drift apart
   again.

**What deliberately did not change.** Every principle; the roles table; the
merchant and public page tables; the product-feature register; the entity, usage
limit, and technology registers; the roles' capabilities; the slice count, order,
and dependencies; and every unresolved product fact. No application code, route,
component, or stylesheet is created. R13's row already names the login and does
not change.

**Consequences and migration/backfill.** The live `ADR-001 . ADR-109` range
strings become `ADR-001 . ADR-110` in the same change, and
`Project-Technologies.txt`'s header list gains 110 contiguously. The drift
check's G8 now counts twenty-seven page rows and compares them to the constant
twenty-seven, so a future page must be added to the constitution, the mirror, and
the check together. G8's coverage is unchanged - it compares the same two-column
shape to the same kind of constant - so this record is not added to the
enumeration of ADRs that built the check. No migration or backfill is required:
the change is register prose, the copies that restate its count, and one constant
in a read-only check.
Review date: 2026-12-20. This entry is the durable record.

---

## ADR-111 — The recovery flow's verified state, and the bare pages' state announcements

**Status**: Accepted - 2026-10-22
**Owning directory**: `specs/001-identity-foundation/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/architecture.md`, `Project-Technologies.txt`, `.specify/templates/overrides/`
**Owning feature**: none - product clarification ratified by the repository owner; R1 binds the rules and verifies them on the three bare pages it ships.

**Context.** A clarification session on 2026-10-22, after ADR-110, settled two
points the R1 specification still left open. The first was the lifecycle of the
one-time code in the password-recovery flow once the correct code is entered: the
specification made the new-password step a step of the same page and made a reload
resume the flow, but it never said whether the code remains usable while the new
password is being set, nor what a reload at that step shows. The gap mattered
because it decided whether one code could authorise a second reset. The second was
whether the in-progress state, the inline failure message, and the in-place
confirmation the three bare pages render are announced to assistive technology,
and where focus goes when one step replaces another; Principle IV requires both,
and SC-006's automated scan and keyboard-only pass do not observe either by
themselves.

**Decision.**

1. **The one-time code stops being usable the moment it is verified.** In the
   password-recovery flow the correct code ends its own validity at once and the
   pending request moves to a verified state that carries the new-password step
   alone. The state lasts no longer than the pending request's own lifetime - the
   value the plan already records under Constitution Mandated Values - and it ends
   when the new password is set, so the same code cannot authorise a second reset
   and no new numeric value is introduced for it.
2. **A reload at the new-password step resumes that step.** While the verified
   state lives, a reload or a close-and-return shows the new-password step again
   rather than the code step, and the person does not need a new code. Once the
   password is set, the page returns to its first step as FR-041 provides, and the
   request has ended.
3. **Every state change on the three bare pages is announced, and focus follows
   the step now shown.** The in-progress state, the inline failure message, and
   the in-place confirmation are announced to assistive technology, and when a
   step replaces another the focus moves to the step now shown - its first field,
   or its heading when it carries no field - and never remains on a control the
   previous step carried. The automated scan and the keyboard-only pass SC-006
   requires assert both on those pages.

**What deliberately did not change.** No page, entity, role, product feature,
usage limit, security rule, technology, or constitution version changed by this
record; the constitution stays at 3.8.0 and the Constitution Mandated Values set
stays closed at its seventeen values. ADR-099 through ADR-110 stand, and this
record only completes them. The requirement and criterion counts are unchanged at
50 FR, 54 AC, and 9 SC; no identifier was renumbered, reused, or withdrawn. No
application code, package, CSS, or font file was created.

**Alternatives considered.**

- *Leaving the code usable until the new password is set.* Rejected: a reload at
  the new-password step would return the person to the code step and make them
  re-enter a code that had already proved ownership, and the code would authorise
  repeated password sets until it expired.
- *Leaving the code usable for the pending request's whole life, including after
  the password is set.* Rejected: one code could reset the password twice, send
  the owner a second notice, and end every session again, with no new proof of
  ownership.
- *Giving the verified state its own numeric lifetime.* Rejected: it adds a value
  to the closed Constitution Mandated Values set for no product gain, because the
  pending request's own expiry already bounds the state.
- *Relying on the automated accessibility scan and the keyboard-only pass alone.*
  Rejected: neither observes a status message being announced or where focus
  landed, and Principle IV requires the announcement and forbids leaving focus on
  a removed element.
- *Moving focus to the page's first control on every state change.* Rejected: it
  loses the person's place and skips the new step's own content; the step now
  shown is where the person is.

**Consequences and migration/backfill.** The R1 specification's FR-014, FR-034,
FR-038, FR-040, AC-036, AC-041, AC-043, SC-006, the key-entities note, US3's
Independent Test, two edge cases, and the Test Coverage Request carry the rules,
and `docs/domain-model.md`'s transient-verification-state section carries the
verified state as an invariant of the store the `users` module owns. The live
`ADR-001 … ADR-110` range strings become `ADR-001 … ADR-111` in the same change,
and `Project-Technologies.txt`'s header list gains 111 contiguously. No migration
or backfill is required: the change is specification prose, one model invariant,
one decision record, and the copied range strings.
Review date: 2026-11-20. This entry is the durable record.

## ADR-112 — The code step's fields, the administrator's first sign-in, the refusal's work, the ending of a pending request, and the coverage target's scope

**Status**: Accepted - 2026-10-22
**Owning directory**: `specs/001-identity-foundation/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/architecture.md`, `Project-Technologies.txt`, `.specify/templates/overrides/`
**Owning feature**: none — product clarification ratified by the repository owner; R1 binds the rules and verifies them.

**Context.** A clarification session on 2026-10-22, after ADR-111, settled five
points the R1 specification still left open, each one a point an implementer
would otherwise have had to guess. The first was what the one-time-code step
shows: FR-038 and AC-041 said "the fields the person filled in" are shown for
reading, and the sign-up form's fields include the password, so a literal
reading mandated echoing a submitted secret back to the browser. The second was
whether the administrator's first sign-in happens at all in this slice: AC-030
asserts that the forced-password-change requirement "is cleared by the change
made at that first sign-in", US6's Independent Test demands that clearing be
confirmed, and FR-027 and FR-014 close every other path to that credential — but
no administrator sign-in surface ships here, so the event AC-030 named could not
occur. The third was whether a blocked, a locked, and an administrator account
are refused before or after the password is verified: FR-017 gave "never reached
a password verification" as its reason, while FR-008 and SC-004 require every
sign-in response to do the same work and take the same time. The fourth was what
happens to the pending request when the sign-up flow reports that the number
already has an account: FR-014 ended the pending request on the recovery flow's
counterpart, and nothing said the same of the sign-up path. The fifth was the
scope of the Test Coverage Request's 80% changed-lines target against the frame,
which this slice builds but whose runtime behaviour it defers.

**Decision.**

1. **The code step never shows the password back.** FR-038 and AC-041 enumerate
   the fields the step shows for reading — the full name, the mobile number, the
   city, and the optional shop name — and state that the password is neither
   re-displayed, nor echoed, nor rendered masked. The set is read-only there, and
   the rule is the same at sign-up and in password recovery.
2. **The administrator's first sign-in is delivered as behaviour, with no page.**
   Exactly as FR-013 delivers the account's own change-password action, this slice
   accepts the first sign-in, restricts the account so that nothing but the
   password change is permitted, and clears the requirement when that change is
   made. Only the administrator's sign-in surface — the page — stays with the
   slice that ships the administrator application, and this slice creates no page
   for it. AC-030, US6's Independent Test, the administrator Assumption, an edge
   case, and the Test Coverage Request carry the bound.
3. **A status or role refusal is refused after the verification work, not before
   it.** A blocked, a locked, and an administrator account each receive a response
   that performs the same work and takes the same time as a wrong password and as
   an unknown number, so FR-008 and SC-004 hold without exception. The
   consecutive-failed-attempt count is still not incremented, because the
   verification performed was not against an active account — the reason FR-009
   already gave, and now the reason FR-017 gives too.
4. **A pending request ends once the platform states an outcome it cannot
   complete.** At sign-up, when the correct code is entered for a number that
   already has an account, the pending request ends and its code stops being valid
   at once — the rule FR-014 already stated for the recovery flow's counterpart.
   No live request and no usable code outlive a reported outcome.
5. **The coverage target names its scope.** The 80% changed-lines target is
   measured over the changed production lines this slice introduces, excepting the
   frame's runtime behaviour it defers to the first frame-carrying slice, which
   that slice covers. The frame's composition and the presence of its controls
   remain covered here by the structural verification.

**What deliberately did not change.** No page, entity, role, product feature,
usage limit, security rule, technology, or constitution version changed by this
record; the constitution stays at 3.8.0 and the Constitution Mandated Values set
stays closed at its seventeen values. ADR-099 through ADR-111 stand, and this
record only completes them. The requirement and criterion counts are unchanged at
50 FR, 54 AC, and 9 SC; no identifier was renumbered, reused, or withdrawn. The
Product Register's twenty-seven pages and twelve entities are untouched. No
application code, package, CSS, or font file was created.

**Alternatives considered.**

- *Showing the submitted password back, masked.* Rejected: it keeps the rule
  ambiguous between "shown" and "not shown", and a submitted secret must never
  return to the browser in any form.
- *Showing only the mobile number at the code step.* Rejected: the person loses
  the context of what they submitted, and the requirement's own purpose — the
  person sees which number the code went to — does not require hiding the rest.
- *Narrowing AC-030 and US6 to the provisioning alone and moving the clearing to
  R13.* Rejected: it leaves the enforced requirement untested in the slice that
  introduces it, while the established precedent — FR-013's change-password
  action — already delivers a surface-less action as behaviour here.
- *Letting the account's own change-password action clear the requirement.*
  Rejected: FR-028, FR-014, and FR-027 all state that no path other than the
  administrator's first sign-in clears it.
- *Short-circuiting a status refusal before the password is verified.* Rejected:
  it makes the blocked, locked, and administrator responses faster than a wrong
  password, which is exactly the signal SC-004's automated enumeration test
  asserts against.
- *Leaving the pending request live after the "already has an account" outcome.*
  Rejected: it leaves a usable code for a number that owns an account, and it
  contradicts the rule FR-014 already applies to the recovery flow.
- *Leaving the coverage target unqualified.* Rejected: the frame's runtime
  behaviour is expressly not exercised here, so an unqualified target would be a
  gate the slice cannot meet without breaking its own deferral.

**Consequences and migration/backfill.** The R1 specification's FR-006, FR-017,
FR-028, FR-034, FR-038, AC-006, AC-009, AC-019, AC-022, AC-029, AC-030, AC-041,
SC-004, the key-entities note, US6's Independent Test, the administrator
Assumption, two edge cases, and the Test Coverage Request carry the rules. AC-022's
clause about the icon set was corrected against FR-020 and ADR-098 in the same
change, because the set is already chosen and this slice records it in the
technology register rather than choosing it. The live `ADR-001 … ADR-111` range
strings become `ADR-001 … ADR-112` in the same change, and
`Project-Technologies.txt`'s header list gains 112 contiguously. No migration or
backfill is required: the change is specification prose, one decision record, one
checklist refresh, and the copied range strings.
Review date: 2026-11-20. This entry is the durable record.

**Annotation (2026-10-22, ADR-113).** Decision 1's field set is bounded to the
fields each flow collected: the four sign-up fields at the sign-up code step,
and the mobile number alone at the password-recovery code step, in its canonical
form with Latin numerals. The recovery form collects nothing else, and showing
an account field there before the code is verified would reveal that the number
has an account, breaching FR-015 and SC-004. The no-password rule is unchanged
and governs both flows. ADR-113 records the bound.

## ADR-113 — The recovery code step's fields, the restricted administrator's sign-out, and the code step's controls

**Status**: Accepted - 2026-10-22
**Owning directory**: `specs/001-identity-foundation/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/architecture.md`, `Project-Technologies.txt`, `.specify/templates/overrides/`
**Owning feature**: none — product clarification ratified by the repository owner; R1 binds the rules and verifies them.

**Context.** A clarification session on 2026-10-22, after ADR-112, settled three
points the R1 specification still left open. The first was what the one-time-code
step shows in password recovery: FR-038 and AC-041, as ADR-112 decision 1 worded
them, required the step to show the full name, the mobile number, the city, and
the optional shop name and said "the rule is the same at sign-up and in password
recovery", but the recovery form collects only a mobile number. Showing an
account's name, city, or shop name at that step would reveal that the number has
an account before the code is verified, breaching FR-015 and SC-004. The second
was the reach of the forced-password-change restriction: FR-028 and AC-030 said
"no action other than the password change is permitted", while FR-050 gives the
administrator application's header a sign-out control, so a restricted
administrator would be unable to end the session. The third was the code step's
controls: FR-038 shows the submitted values for reading, keeps them uneditable
there, and resumes the step on a reload, but the specification named no control
for requesting a new code or for returning to the first step, so the stated
journeys had no surface.

**Decision.**

1. **The code step shows the fields each flow collected.** At sign-up it shows
   the full name, the mobile number, the city, and the optional shop name. In
   password recovery it shows the mobile number alone, in its canonical form with
   Latin numerals, because the recovery form collects nothing else and showing an
   account field there before the code is verified would reveal that the number
   has an account. The password is never shown back in either flow. This bounds
   ADR-112 decision 1 rather than reversing it: the sign-up code step still shows
   the four fields, and the no-password rule is unchanged.
2. **The first-sign-in restriction does not withhold ending the session.** The
   restriction withholds every product action that needs the account's ordinary
   permissions, but the password change itself and ending the session remain
   available: sign-out, the session timeout, and a platform revocation all stand.
   FR-050's sign-out control therefore applies to a restricted administrator, and
   FR-028 and AC-030 are bounded to say so.
3. **The code step carries two controls beside the code field and its submit
   control.** One requests a new one-time code, subject to FR-034's limit on
   re-requesting. The other returns to the page's first step, where the values
   already typed are editable again and retained except the password, which is
   never retained or shown; a fresh submission then starts a new pending request
   on FR-034's terms. A reload still resumes the code step while the pending
   request is live.

**Annotation (2026-10-22, ADR-114).** Decision 3's "never retained or shown"
governs the page: the pending sign-up request holds the password only in the
irreversibly protected form ADR-114 decision 2 states, never in plaintext, and
the page never retains or shows it. The rule this record states is unchanged;
the bound names where the value lives, so no plaintext password is stored.

**What deliberately did not change.** No page, entity, role, product feature,
usage limit, security rule, technology, or constitution version changed by this
record; the constitution stays at 3.8.0 and the Constitution Mandated Values set
stays closed at its seventeen values. ADR-099 through ADR-112 stand, and ADR-112
decision 1 is annotated rather than rewritten. The requirement and criterion
counts are unchanged at 50 FR, 54 AC, and 9 SC; no identifier was renumbered,
reused, or withdrawn. The Product Register's twenty-seven pages and twelve
entities are untouched. No application code, package, CSS, or font file was
created.

**Alternatives considered.**

- *Showing the four fields at the recovery code step too.* Rejected: the recovery
  form collects only a mobile number, so the step has no name, city, or shop name
  to show; fetching them from the account would reveal that the number has an
  account before the code is verified, breaching FR-015 and SC-004.
- *Showing only the mobile number at the sign-up code step as well.* Rejected: it
  removes the context ADR-112 deliberately preserved, and the sign-up form
  collected those fields, so showing them for reading is safe and useful.
- *Making the first-sign-in restriction absolute, with no sign-out.* Rejected: it
  traps the administrator in the restricted session, contradicts FR-050's
  sign-out control, and leaves the session timeout as the only way out.
- *Letting only the session timeout end a restricted session.* Rejected: a person
  must be able to leave a session deliberately, and FR-050 already offers the
  control.
- *Relying on the browser's back button to return to the first step.* Rejected: a
  reload resumes the code step by design, so the platform must carry the return
  control itself; the back button is not a platform surface and behaves
  differently across browsers.
- *Letting the mobile number be edited in place at the code step.* Rejected:
  FR-038 keeps the submitted values read-only there, and changing the number must
  start a new pending request for the new number on FR-034's terms.

**Consequences and migration/backfill.** The R1 specification's FR-028, FR-038,
FR-050, AC-030, AC-041, US6's Independent Test, the administrator Assumption, two
edge cases, the earlier clarification bullets, and the Test Coverage Request
carry the rules. ADR-112 decision 1 is annotated in the same change. The live
`ADR-001 … ADR-112` range strings become `ADR-001 … ADR-113` in the same change,
and `Project-Technologies.txt`'s header list gains 113 contiguously. No migration
or backfill is required: the change is specification prose, one decision record,
one checklist re-validation, and the copied range strings.
Review date: 2026-11-20. This entry is the durable record.

---

## ADR-114 — The forced first change's password, the pending request's password, refusal precedence, and a failed re-request

**Status**: Accepted - 2026-10-22
**Owning directory**: `specs/001-identity-foundation/`, `docs/`
**Owning feature**: none - product clarification ratified by the repository owner; R1 binds the rules and verifies them.

**Context.** A clarification session on 2026-10-22, after ADR-113, settled five
points the R1 specification still left open, each of which changed an observable
rule rather than a wording. The first was the administrator's forced first
change: FR-035 and AC-037 allowed a new password to repeat the one it replaces,
so submitting the initial password at that first change would have cleared the
forced-password-change requirement without changing anything. The second was
the pending sign-up request: FR-038 said the password "is never retained", while
the account cannot be created after verification unless the request holds it -
and the constitution forbids storing a plaintext password. The third was the
order of refusals: the rate limit, the hidden field, the minimum time-to-submit,
the value rules, and the account-existence comparison could all apply to one
submission, and no order was stated, so a criterion could not assert which
refusal a submission receives. The fourth was a failed re-request of a one-time
code: FR-034 invalidated the previous code "at once" on a request and also
promised that a failed send kept the pending request valid, leaving open whether
a moment with no valid code could arise. The fifth was the forced first change
itself: FR-013 enumerated two password-change paths and FR-043's notice
enumeration did not name it, so it was unclear whether that change ends the
account's sessions and sends the security notice.

**Decision.**

1. **The administrator's forced first change must set a different password.**
   The allowance that a new password MAY repeat the one it replaces stays for
   every change made after the person's own password, because no history is
   kept; the forced first change is bounded, and a submission that repeats the
   initial password is refused and clears nothing. A forced change that repeats
   the value would leave the requirement unsatisfied.
2. **The pending sign-up request holds the password only in protected form.**
   The password is irreversibly protected at submission, in the same form a
   stored password has, and the request holds that value rather than the
   plaintext; the account is created from it when the correct code is entered,
   and replacing or ending the request discards it. The page never shows or
   retains it. No plaintext password is stored, logged, or cached while the
   request lives.
3. **Refusals are decided in one fixed order.** The operation's rate limit
   first, then the sign-up form's hidden field, then its minimum time-to-submit,
   then the value rules, then the account-existence comparison. A submission
   refused at a step is decided by that step alone, no later check runs, and no
   earlier refusal is replaced. Within the value step every failing rule may
   carry its own message, but no account-existence comparison runs until every
   value rule has passed. The order is observable and introduces no refusal
   beyond those the specification already names.
4. **A failed re-request leaves the previous code valid.** The replacement takes
   effect only once the messaging channel has accepted the new message; a failed
   send leaves the previous code as the one valid code, the pending request live,
   and the re-request limit untouched. A moment with no valid code never arises.
5. **The forced first change is a password change like any other.** It ends every
   existing session of the account, including the restricted session it was made
   from, and sends the security notice FR-043 requires, exactly as the account's
   own change action does; the administrator signs in again, now unrestricted.

**What deliberately did not change.** No page, entity, role, product feature,
usage limit, security rule, technology, or constitution version changed by this
record; the constitution stays at 3.8.0 and the Constitution Mandated Values set
stays closed at its seventeen values. The Product Register's twenty-seven pages
and twelve entities are untouched. `docs/domain-model.md` is corrected in the
same change where these decisions bind its transient-verification-state and
`User` invariants: the pending request's protected password, the
dispatch-conditioned code replacement, and the forced change's session and
notice are recorded there. The identifier set grows by one functional
requirement and one acceptance criterion - FR-051 and AC-055 - so the counts
become 51 FR, 55 AC, and 9 SC; no identifier is renumbered, reused, or
withdrawn. No application code, package, CSS, or font file was created.

**Alternatives considered.**

- *Letting the forced first change repeat the initial password.* Rejected: the
  requirement would be cleared without a change, so the control would be
  vacuous and the constitution's forced password change would not be delivered.
- *Holding the submitted password as typed until verification.* Rejected: the
  constitution forbids storing a plaintext password, and a transient store is
  still storage; the protected form is available at submission and the account
  can be created from it.
- *Leaving the refusal order to the plan.* Rejected: the order is observable,
  AC-031 through AC-035 and AC-045 assert one refusal each, and two
  implementations could pass their own tests while disagreeing with each other.
- *Invalidating the previous code at the moment of the re-request.* Rejected: a
  failed send would leave the request with no valid code, contradicting the rule
  that exactly one code is valid at any moment and costing the person a code
  they already hold for a failure outside their control.
- *Exempting the forced first change from session revocation and the notice.*
  Rejected: it is a change to a password the account already holds, AC-047
  already sends the notice for the account's own change action, and the session
  that made the change should end exactly as any other password change ends it.

**Consequences and migration/backfill.** The R1 specification's FR-013, FR-028,
FR-034, FR-035, FR-038, FR-043, and the new FR-051 carry the rules; AC-030,
AC-036, AC-037, AC-041, AC-047, and the new AC-055 assert them, together with
US6's Independent Test, two Assumptions, the Key Entities note, two edge cases,
and the Test Coverage Request. `docs/domain-model.md` carries the matching
invariants. The live `ADR-001 . ADR-113` range strings become
`ADR-001 . ADR-114` in the same change, and `Project-Technologies.txt`'s header
list gains 114 contiguously. No migration or backfill is required: the change is
specification prose, one decision record, one checklist re-validation, the model
corrections, and the copied range strings.
Review date: 2026-11-20. This entry is the durable record.
---

## ADR-115 — The ended-session state, the acceptance boundary, the counted code, the replaced verification, and the forced change

**Status**: Accepted - 2026-10-22
**Owning directory**: `specs/001-identity-foundation/`, `docs/`
**Owning feature**: none - product clarification ratified by the repository owner; R1 binds the rules and verifies them.

**Context.** A clarification session on 2026-10-22, after ADR-114, settled five
points the R1 specification still left open, each of which changed an observable
rule rather than a wording. The first was the ended-session state: FR-049
enumerated the inactivity timeout, the absolute maximum lifetime, an explicit
sign-out elsewhere, and a block, and left the other ways a session ends — a
platform revocation (FR-012), a sign-out of every device (FR-011), and a password
change or reset made elsewhere (FR-013) — without a defined surface, so a
merchant whose session ended that way could have been shown an unrelated error.
The second was the messaging boundary: FR-034 promised an explicit failure state
when a code "cannot be sent at all", including a number the channel cannot
deliver to, while also requiring the code step to open only once the channel has
accepted the message; a message the channel accepts and never delivers is outside
the platform's observation, and the specification did not say which of the two it
was. The third was the counted bound: FR-034 counted incorrect entries over the
whole verification, and the edge cases grouped an expired code with an incorrect
one, so a stale code could have incremented the bound and ended a person's
pending request. The fourth was the recovery flow's verified state: one pending
request is live per mobile number and a new request replaces the previous one,
but the specification never said that a replacement reaches the verified state,
so a stale new-password step could have set a password after a new code had
been sent. The fifth was the administrator's forced first change: FR-013
requires the current password for the account's own change action, and FR-028
bound the forced change to a value different from the initial password, but
neither said whether the forced change asks for the current password, so the
rule a taken-over restricted session would meet was unstated.

**Decision.**

1. **Every path that ends a session leads to the one ended-session state.**
   FR-049's state — explicit, inside the frame, stating that the session has
   ended and offering the way to sign in again — covers the inactivity timeout,
   the absolute maximum lifetime, an explicit sign-out elsewhere, a platform
   revocation, a sign-out of every device, a password change or reset, and a
   block. No session-ending path shows an unrelated error, and the blocked
   variant still says the account is blocked.
2. **A send failure is a refusal at acceptance.** A message the messaging
   channel accepts is a successful send from the platform's side even if it is
   never delivered; a later delivery failure is outside the platform's
   observation, produces no failure state, and does not by itself invalidate the
   code, so a person who does not receive an accepted message requests a new
   code subject to the re-request limit. The explicit failure state and the
   retry it offers govern a channel refusal at acceptance alone.
3. **The bound counts only a wrong value for the live code.** An expired code
   and a code a replacement has superseded are refused as expired or superseded
   and do not increment the bound, because neither is a wrong guess of the live
   code; a stale code cannot lock a person out, and the count measures exactly
   the guesses the bound exists to stop.
4. **A replacement reaches the verified state.** A new sign-up or recovery
   request for a number whose pending request is in the recovery flow's verified
   state ends that state at once and withdraws its authority to set a password;
   only the new code step is live, and two authorities never coexist for one
   number.
5. **The forced first change requires the current password.** It is a password
   change like any other for FR-013's rule: a submission without the current
   password, or with a wrong one, is refused, clears nothing, and leaves the
   account restricted, and the failed check is a failed password verification
   under FR-009; the fresh sign-in is not treated as proof for this purpose.

**What deliberately did not change.** No page, entity, role, product feature,
usage limit, security rule, technology, or constitution version changed by this
record; the constitution stays at 3.8.0 and the Constitution Mandated Values set
stays closed at its seventeen values. The Product Register's twenty-seven pages
and twelve entities are untouched. `docs/domain-model.md` is corrected in the
same change where these decisions bind its transient-verification-state and
`User` invariants: the count's scope, the acceptance boundary, the
replacement's reach, and the forced change's current-password check. The
identifier set does not grow: no functional requirement, acceptance criterion,
or success criterion is added, renumbered, reused, or withdrawn, so the counts
stay 51 FR, 55 AC, and 9 SC. No application code, package, CSS, or font file
was created.

**Alternatives considered.**

- *Leaving the ended-session state to the causes FR-049 already named.*
  Rejected: FR-012, FR-011, and FR-013 end sessions by their own rules, and the
  frame's state is the only defined surface for a person who held a valid
  session, so a path that shows an unrelated error is a defect in the product's
  coherence rather than a later slice's work.
- *Treating a message the channel accepts but never delivers as a send
  failure.* Rejected: the platform has no delivery signal, so it could not
  report that failure where the specification promises it, and SC-009 already
  excludes the delivery from the platform's control; the person's recourse is a
  new code under the re-request limit.
- *Counting an expired or superseded code as an incorrect entry.* Rejected:
  neither is a guess of the live code, so counting them would let a stale code
  end a legitimate person's request, and the bound exists to stop guessing
  rather than to punish an outdated code.
- *Keeping the verified state alive across a replacement.* Rejected: two
  authorities for one number would mean a stale new-password step could set a
  password after a new code had been sent, which is exactly what the
  single-live-request rule exists to prevent.
- *Exempting the forced first change from the current-password check.* Rejected:
  the change replaces a password the account already holds, FR-013's rule
  protects every such change, and a restricted session that was taken over
  would otherwise be enough to set a new password.

**Consequences and migration/backfill.** The R1 specification's FR-014, FR-028,
FR-034, and FR-049 carry the rules; AC-030, AC-036, AC-041, and AC-053 assert
them, together with US6's Independent Test, four edge cases, the Key Entities
note, SC-009, the administrator Assumption, and the Test Coverage Request.
`docs/domain-model.md` carries the matching invariants. The live
`ADR-001 … ADR-114` range strings become `ADR-001 … ADR-115` in the same change,
and `Project-Technologies.txt`'s header list gains 115 contiguously. No migration
or backfill is required: the change is specification prose, one decision record,
the model corrections, the copied range strings, and a checklist re-validation in
which every item still passes.
Review date: 2026-11-20. This entry is the durable record.

## ADR-116 — The UI-layer path authority and the register-gap exception

**Status**: Accepted — 2026-10-22
**Owning directory**: `.specify/memory/`, `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context.** A final consistency audit on 2026-10-22 found two contradictions
inside the constitution itself. The first was the Wafar UI layer's path:
Principle IX said R1's plan fixes the path, while Technology Standards said the
path is fixed by ADR-097 and `docs/architecture.md`; `AGENTS.md`, `ROADMAP.md`,
and the plan template already consumed ADR-097. The second was the register-gap
rule: the Technology Standards opening paragraph said a technology absent from
the register MUST NOT be used, while "Register gaps a slice MUST close" allowed
the owning slice's plan to choose a gap technology, record it with an ADR, a
licence-obligation record, and a vulnerability scan, and amend the register no
later than that slice's acceptance. Read literally, the two rules made the gap
process impossible to follow.

**Decision.**

1. **ADR-097 is the path authority.** Principle IX now states that the Wafar UI
   layer is at `packages/ui`, that its path is fixed by ADR-097 and
   `docs/architecture.md`, and that R1 builds it through SpecKit and consumes
   that path. The constitution still does not restate the layer's values and
   still does not create the package.
2. **The gap process is an explicit exception.** The Technology Standards
   opening paragraph now exempts a gap listed under "Register gaps a slice MUST
   close" while that section's process is followed. The gap section now states
   the order: the owning slice's plan records the choice with an ADR, a
   licence-obligation record, and a vulnerability scan; the technology MUST NOT
   be used before that record exists; after it exists the slice may use it; the
   register MUST be amended to add it no later than that slice's acceptance.
   The register remains the approval surface, and the ADR remains the slice's
   authority to proceed.

**What deliberately did not change.** No product scope, page, entity, role,
product feature, usage limit, security rule, technology choice, or slice order
changed by this record. The gap table remains open: the icon set, the SMS
provider, the CI provider, the extraction libraries, and the remaining entries
are still gaps, and R1 still closes the rows the register assigns to it. The
constitution does not create `packages/ui`, does not build it, and does not
choose any gap technology. R1's specification, checklist, and identifier set are
untouched: 51 FR, 55 AC, and 9 SC remain. No application code, package, CSS, or
font file was created.

**Alternatives considered.**

- *Leaving Principle IX as the path authority and repealing ADR-097.* Rejected:
  ADR-097 is the accepted decision, `docs/architecture.md` records the path, and
  `AGENTS.md`, `ROADMAP.md`, the plan template, and the tasks template already
  consume ADR-097; changing the authority would rewrite four accepted artifacts
  to preserve one stale sentence.
- *Keeping the absolute prohibition and requiring a constitutional amendment
  before any gap technology is used.* Rejected: it would make the gap process
  unusable, because the register cannot name the technology before the slice
  chooses it, and the gap section already sets acceptance as the deadline.
- *Allowing a gap technology with no record until acceptance.* Rejected: it
  would let an unvetted library into the slice, contrary to Dependency
  Governance; the ADR, licence record, and vulnerability scan remain the gate
  before use.
- *Treating this as a PATCH.* Rejected: the gap exception changes when a
  technology may be used, which is a rule change, not a wording refinement; the
  versioning policy makes the combined amendment MINOR.

**Consequences and migration/backfill.** The constitution moves to 3.9.0;
`.specify/memory/version.json` carries the same version and names this record;
the index row above records 3.9.0. Every live `ADR-001 … ADR-115` range string
becomes `ADR-001 … ADR-116` in the same change, and `Project-Technologies.txt`'s
header list gains 116 contiguously. No migration or backfill is required: the
change is constitutional prose, one decision record, the copied range strings,
and a drift-check run. Review date: 2026-11-20. This entry is the durable record.

---

## ADR-117 — The capacity envelope and the upload-quota model

**Status**: Accepted — 2026-10-23
**Owning directory**: `docs/`, `.specify/memory/`, `README.md`, `AGENTS.md`,
`ROADMAP.md`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context.** The repository has product limits but no project-level capacity
model. The six-month product target is 10,000 registered accounts; the platform
must also hold 50,000 accounts without a new architectural decision. The product
traffic target is 50,000–100,000 visits per day, with 3,000–5,000 concurrent
online sessions and 300–600 concurrent uploads. A merchant may upload 30–50
files in a month, each a scanned PDF of 80–150 pages, and the average file is
about 7 MB. The ingestion pipeline, not the public read path, is the capacity
constraint. The current Usage Limits still bind 50 uploads per calendar month and
100 files in total per user; the total limit stops a merchant who uploads
30–50 files a month after two or three months. The product also needs an
administrator per-user quota override, which `PlatformSetting` cannot carry
because ADR-067 excludes Usage Limits from that entity. The repository needs one
durable record of the envelope, the target quota model, the deletion semantics,
and the measurements that must replace the assumptions.

**Decision.**

1. **`docs/capacity-model.md` is adopted as the project-level capacity model.**
   It is not a feature, does not take a slice number (ADR-007), and does not
   replace the constitution. It records the six-month envelope, the calculation
   basis, the deployment shape, the bottlenecks, and the verification plan.

2. **The adopted envelope is:**
   - 10,000 registered accounts in the six-month plan; 50,000 accounts as the
     capacity ceiling.
   - 50,000–100,000 visits per day.
   - 3,000–5,000 concurrent online sessions.
   - 300–600 concurrent uploads.
   - 350,000 uploads per month at design and 500,000 at stress.
   - 1,050,000 active stored files at design and 1,500,000 at stress, under the
     90-day retention.
   - 35,000,000 scanned pages per month at design and 50,000,000 at stress,
     assuming 100 pages per file.
   - 840,000,000 active parts at design and 1,200,000,000 at stress, assuming
     10 rows per page and 20% deduplication.
   - about 21 TB of replicated and derived storage at design and about 30 TB at
     stress.

   The numbers are planning figures. The model names its assumptions and its
   re-run triggers; it is not a guarantee measured on production.

3. **The target quota model is 50 uploads per calendar month, 300 active stored
   files, and no lifetime total.** The administrator ceiling is 500 uploads per
   calendar month and 1,500 active stored files, granted per user and audited.
   The 500/1,500 ceiling is an exception path, not a second default; a broad
   grant is a re-sizing event. Monthly deletion does not restore the monthly
   count; a merchant delete, an administrator delete, or the retention job
   releases an active slot. Lowering a quota never deletes a file and only blocks
   new uploads; raising a quota takes effect immediately. Quota checks are
   atomic.

4. **Deletion is one cascade.** The merchant's self-delete, the administrator's
   delete, and the 90-day retention job withdraw the catalog's bytes, parts,
   bookmarks, and search-index entries. The catalog row may remain as a
   soft-deleted record, but the withdrawn state is what the active quota counts.
   Search therefore contains only files from the last 90 days. The trigger point
   of the 90 days remains R15's open fact; the model uses the upload date for
   sizing only.

5. **The administrator quota is a per-user entitlement, not a platform setting.**
   ADR-067 remains correct: `PlatformSetting` never carries a Usage Limit. The
   per-user quota record's owning module, schema, endpoint, bounds, and audit
   fields are decided by the constitutional amendment and the R2/R13
   specifications. The administrator can view, delete, block, and set a quota for
   a specific user; the quota change is audited with the old value, the new
   value, the reason, and the timestamp.

6. **OCR is not selected by this record.** The model treats the scanned
   100-page PDF as the worst case, but it does not name a library, a paid
   provider, or a document-AI service. R3 must choose the extraction technology
   through the Technology Standards gap process, with an ADR, a licence record,
   a vulnerability scan, and a measured proof on real Arabic table pages. The
   model is re-run when that choice is made and measured.

7. **Verification is part of the decision.** Before R3 commits to extraction,
   20–50 real pages are measured for Arabic text accuracy, table structure,
   latency, cost, and data terms. At R12's pre-release load test, the platform is
   measured at 100,000 visits/day, 5,000 concurrent online sessions, 600
   concurrent uploads, and 50,000 registered accounts. The model is re-run when
   average file size, pages per file, rows per page, OCR coverage, uploader
   share, the 500/1,500 exception share, retention, or the Usage Limits change.

**What deliberately did not change.** No constitutional text or Usage Limit is
amended by this record. The current 50-per-month and 100-in-total limits remain
binding until the next constitutional amendment; the target values in this
record are not enforceable before it. No product scope, page, entity count, role,
module, slice order, or dependency edge changes. No R1 `plan.md` or `tasks.md` is
created, and no application code, package, schema, or API is built. The
per-user quota record is not created here, and no OCR technology is chosen.

**Alternatives considered.**

- *Keep the 100-file lifetime total.* Rejected: a merchant uploading 30–50 files
  a month reaches it in two or three months and then cannot upload again; a
  six-month planning horizon is not an account lifetime.
- *Make 300 a lifetime total.* Rejected: the same cliff moves to month six. The
  six-month horizon is a planning horizon, not the life of the account.
- *Make the administrator ceiling unlimited.* Rejected: the capacity model would
  be unbounded, one account could consume the platform's storage and processing,
  and the constitutional limit would lose its meaning.
- *Store the quota in `PlatformSetting`.* Rejected: ADR-067 states that
  `PlatformSetting` never carries a Usage Limit; a per-user entitlement is not a
  platform-wide setting.
- *Size for 100,000 concurrent visitors.* Rejected: 100,000 is the daily visit
  target, not a concurrency target. The concurrency target is 3,000–5,000, and
  conflating the two would build a different, unnecessary platform.
- *Treat this as a numbered feature.* Rejected: it is project-level knowledge,
  and ADR-007 prohibits a feature for a project-level concern.
- *Amend the constitution in the same record.* Rejected for this step: the
  capacity model and the target quota model are recorded first so the wording
  can be reviewed; the constitutional amendment is the next change and moves the
  version, the Usage Limits, the domain model, and the owning specs.

**Consequences and migration/backfill.** `docs/capacity-model.md` is added and
linked from `README.md`, `AGENTS.md`, and `docs/architecture.md`; R12's load-test
scope names it. The live `ADR-001 … ADR-116` range strings move to
`ADR-001 … ADR-117`, and `Project-Technologies.txt`'s header list gains 117
contiguously. The constitution version stays 3.9.0 until the separate amendment.
No migration, backfill, R1 plan, or code is required. Review date: 2026-11-23,
and again at R12's load test. This entry is the durable record.

**Annotation (2026-10-23, ADR-118).** The target quota model in item 3 was
ratified by the constitutional amendment recorded in ADR-118, which moved the
constitution to 4.0.0. The capacity envelope in item 2 and the review date stand.

**Annotation (2026-10-23, ADR-119).** The envelope in item 2 was calibrated by
the first PDF sample. The measured planning baseline is now 2.28 MB average,
80.3 pages per file, and 31.7 rows per page; the 7.8 MB/100-page case is retained
as the scanned-heavy stress scenario. The envelope's targets and the review date
stand.
