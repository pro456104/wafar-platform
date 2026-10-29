## ADR-139 — The audit repair set: the foundation boundary, the frame, and traceability

**Status**: Accepted — 2026-10-29. **Constitution version**: 6.2.1 (unchanged)
**Owning directory**: `ROADMAP.md`, `docs/`, `docs/decisions/`, `docs/design/`,
`specs/001-identity-foundation/`, `.specify/templates/`, `governance-drift-check.mjs`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context.** A deep read of the slice order and of R1's specification on
2026-10-29 found nineteen defects that the drift check cannot see, because it
verifies structure and not meaning. They fell into six groups. R1's boundary was
named two ways — "the pre-R1 foundation" and "R1's foundation phase" — so the
same work was read as work before R1 and as a phase of R1 (defect 1). The
mandatory security controls of the first browser-facing feature sat in US7 at
P3, while the P1 set ships that feature (defect 2). US5's frame was verified
structurally only, and its Independent Test says so, which strains Principle
VIII (defect 3). The specification named R4 as the first page carrying the
frame, while the Upload Catalog page of R2 is (defect 4). `Session` is a
merchant-scoped table created and read by R1, but the shared scoping entry point
and the isolation test were assigned to R2 (defect 5). The frame's fixed nine
destinations and R2's duplicate link point at pages that ship later, and neither
window was recorded (defects 6 and 7). The rest were traceability defects: R13's
concentration had no declared risk, the notifications control was owned twice,
the open-questions note still listed a point ADR-131 had fixed, the
specification claimed an amendment ADR-105 had already made, its binding block
omitted the slice map and the roadmap, the checklist predated the last
clarification session, the slice-numbering invariant was unenforced, and the
coverage and scale deviations were unrecorded.

**Affected principles and in-flight work.** Principle VIII is met by exception
`EX-007` rather than by a plan row, because it is NON-NEGOTIABLE. Principle III's
coverage rule and the capacity model's envelope are deviated from in two places,
and the deviations are handed to R1's plan as Complexity Tracking rows. Principle
VII's ban on technical detail in a specification is honoured by removing three
storage phrases. No clause of the constitution changes, so the version stays
6.2.1. R1 is the only in-flight feature; its plan is not blocked.

**Decision.**
1. **One name for R1's foundation work.** The phrase "pre-R1 foundation" is
   retired. The work is **R1's foundation phase**: a phase of R1's plan, never a
   slice, never work that precedes R1. It ends at a hard checkpoint — the
   workspace, `packages/ui`, the tooling, and the continuous-integration gate are
   accepted and recorded before the identity work begins — and no identity
   requirement is verified before that checkpoint passes. ADR-015's alternatives
   list is annotated, not rewritten: its first alternative states the risk the
   decision accepted (that folding the foundation into identity makes the
   boundary unreviewable), and the foundation phase with its checkpoint is the
   mitigation.
2. **US7 is P1.** The rate limit, the hidden field, the minimum time-to-submit,
   request-forgery protection, output encoding, and the security headers are the
   control set the constitution requires of the first browser-facing feature, so
   they gate the P1 checkpoint. The story keeps its position and its identifiers;
   priority, not order, is what changed.
3. **R2 is the first page that carries the frame,** and R1's structural-only
   verification of US5 is recorded as `EX-007`, with the repository owner as
   approver and 2026-12-01 as the review date. The exception ends when R2
   verifies the frame's runtime, its accessibility scan, and its keyboard-only
   pass on a rendered page.
4. **The frame's composition stands as ADR-099 and ADR-102 fixed it.** The nine
   sidebar destinations, the five bottom-bar slots, and the four static-page
   links stay fixed in R1, and so do Home's nine destination cards in R5. The
   window in which those links point at pages that do not exist yet is recorded
   as defect 19 in the roadmap, closed by R10, and R2's duplicate link to the
   Parts page is defect 20, closed by R5. The list is not grown slice by slice:
   one composition with one structural assertion is what the shell's decisions
   describe, and a partial list would move the assertion into every later slice.
5. **`Session` is scoped where it is created.** R1 gains FR-053 and AC-056: every
   merchant-scoped read and write passes through the single shared entry point,
   and an automated test fails when the scope is removed. The two roadmap
   obligations that assigned the entry point and the isolation test to R2 move to
   R1, and R13 ratifies the permission model on the same entry point.
6. **R13's concentration is a declared risk, not a design defect.** Its ten
   administrator pages, the write surface, and the audit record cannot be split
   without leaving a window in which an administrator operation is unrecorded, so
   the roadmap records a procedural mitigation with the repository owner and the
   same 2026-12-01 review date.
7. **The account fields are ADR-105's.** The `User` row and `docs/domain-model.md`
   already carry the failed-attempt count, the lock's expiry, and the
   forced-change requirement. R1 implements them and makes no second amendment,
   and its plan cites ADR-105.
8. **Traceability repairs.** The binding block of a feature specification names
   the slice map and the roadmap, as ADR-134's template already does. R1 owns the
   notifications control and R9 the unread counter. The open-questions note drops
   the point ADR-131 fixed. A slice is created in numeric order or with
   `GIT_BRANCH_NAME=<R#>-<slug>`, so the number cannot drift from the roadmap's
   identifier. The two deviations — the frame's runtime coverage exclusion and
   the 10,000/500/10 measurement ceiling against the capacity model's envelope —
   are stated where the specification states them and handed to R1's plan as
   Complexity Tracking rows.

**Alternatives considered.**
- *Leave the foundation boundary as it was.* Rejected: two names for one phase
  are read as two phases, which is the defect, and a checkpoint is the only
  instrument that makes the phase's end reviewable.
- *A pre-feature bootstrap outside the numbering, then a lean R1.* Rejected: it
  supersedes ADR-015's decision, and it would withdraw a dozen acceptance
  criteria from the only specification that carries the frame's contract.
- *Two numbered features, renumbering R2–R15.* Rejected: ADR-007's prohibition
  and ADR-015's identifier alignment both forbid it.
- *Move US5 to R2.* Rejected for the same reason as the bootstrap: the frame's
  composition is decided in R1 and consumed by every later slice, and splitting
  one decision across two specifications leaves neither the owner of the
  composition nor the proof of its runtime.
- *Grow the navigation list as each page ships.* Rejected: it weakens a testable
  assertion to a moving one and makes every later slice edit the frame.
- *Record the coverage and scale deviations only in the plan.* Rejected: the plan
  does not exist yet, and the specification is where a reviewer meets them.

**Consequences and migration/backfill.** `ROADMAP.md` retires the phrase
"pre-R1 foundation", gains defects 19 and 20, R13's declared risk, the
slice-numbering rule, and the query-count note. R1's specification gains FR-053
and AC-056, raises US7 to P1, cites `EX-007`, names R2 as the first frame page,
cites ADR-105 for the account fields, and carries the two deviations. The slice
map names R2 as the first frame page and its handoff is refreshed. The exception
register gains `EX-007`, so the drift check's exception-row count moves from six
to seven. The live range strings move to ADR-139 and `Project-Technologies.txt`'s
header list gains 139. No code, schema, or migration exists, so no backfill is
required. Review date: 2026-12-01.

---

## ADR-140 — The admin slice split: the gate slice, the recorder, and two consumers

**Status**: Accepted — 2026-10-29. **Constitution version**: 6.2.2
**Owning directory**: `ROADMAP.md`, `docs/`, `docs/decisions/`, `docs/design/`, `.specify/memory/`, `specs/001-identity-foundation/`, `governance-drift-check.mjs`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context.** R13 carried ten administrator pages, the administrator's write surface over `PlatformSetting`, the audit record every administrator operation writes, and nine dependencies. ADR-139 recorded the concentration as a declared risk with a review date of 2026-12-01. A deep read of the slice order found that the reason ADR-139 gives for keeping the block whole — that no administrator operation may exist before it can be recorded — constrains the ORDER of the work, not its grouping: the recorder must precede the first write, and every later administrator slice may consume it. The same rule the roadmap already applies to the catalog-delete cascade (defect 18) applies here. The read also found that the block's dependency set was inflated by pages that read or write nothing at the gate: the Users page and the Settings page need `users` and `PlatformSetting` only, so a gate slice can ship on R1 and R11 and unblock the rest of the application early. Three latent conflicts surfaced with it: the slice map asked for a Dashboard of cards while the Product Scope admits a table only; the administrator page table offers a manual part add while the domain model says a part belongs to exactly one catalog; and nothing forbids blocking the single administrator account, which has no recovery path. A fourth finding is structural: `volume-08.md` is 103,451 bytes and passes the volume cap only because it is the register's last volume, so no ninth volume can exist until one of its records moves.

**Decision.**
1. **The administrator block is four slices.** R13 is the gate: the separate application, its shell, the administrator's login, the `AuditLog` recorder, the `AuditLog` table in the `admin` module, the Settings write surface and the Users operations (view, block and unblock, soft-delete, per-user quota override). R14 remains the read page over the record. R16 is the catalog domain (Files, Suppliers, Parts). R17 is communication and oversight (Messages, Notifications, Contact messages, Dashboard). R15 is untouched.
2. **Dependencies.** R13 depends on R1 and R11 only; R14 on R13; R16 on R13, R2, R3 and R4; R17 on R13, R9, R10, R11, R2, R3 and R5.
3. **The recorder is written once.** R13 creates it; R16 and R17 reuse it and each proves every write with a recorded row in its acceptance criteria.
4. **Ownership.** The `admin` module and `packages/db/schema/admin.ts` are created by R11 for the `PlatformSetting` read and extended sequentially by R13, R16 and R17; the roadmap's ownership rows name all four.
5. **The administrator cannot lock the platform out.** R13 forbids blocking or soft-deleting the account holding the administrator role, and adds no way to create a second administrator. No page, entity, feature or role is added: the rule forbids an operation the register never grants.
6. **The Dashboard is a table.** Every data view is a table and only Home composes cards; the slice map's "Dashboard cards" is corrected.
7. **The manual part add names an existing catalog.** A part is never stored without one.
8. **Consumers implement reserved decisions.** R16 and R17 implement R10's sender representation and administrator reference, R9's notification retention, and R11's contact-message status and note; they decide no reserved fact.
9. **The register's ninth volume opens with ADR-139.** `volume-08.md` is 103,451 bytes and passes only as the last volume; adding a volume makes it non-last and over the 100,000-byte cap. ADR-139 moves verbatim into `volume-09.md`, its index href moves with it, and ADR-140 follows it. No record is rewritten.
10. **Constitution 6.2.2 (PATCH).** One References row names seventeen slices instead of fifteen. No principle, section, register, page, feature, entity, role or usage limit changes.
11. **Alternatives are recorded** because the slice order is a structural decision, although this record's subject is the process.

**Alternatives considered.**
- *Keep R13 whole and phase it inside one plan.* Rejected: the specification would still carry ten pages and roughly two hundred requirements, its `/speckit.clarify` cost is paid once and in full, and the concentration ADR-139 declared would be managed rather than removed.
- *Renumber R14 and R15 to make the block contiguous.* Rejected: it touches about twenty live references in eight files and forces annotations on historical records; ADR-139 already rejected renumbering.
- *Move the Users page to R16 to keep R13 minimal.* Rejected: eight passages of R1's in-flight specification bind the blocking act and the status transition to R13's Users page, and `Core-Project.txt` names R13 as the slice that grants the quota exception.
- *Keep the Dashboard cards and amend the Product Scope.* Rejected: the table rule is a product-wide constraint, and a card Dashboard sets a second composition precedent for one page.
- *Give R17 no dependency on R5.* Rejected: the Dashboard's fourth statistic has no entity until R5 decides where the counter is stored; the dependency makes the condition explicit instead of leaving a hole.

**Consequences and migration/backfill.** The roadmap gains two rows and loses none; R13, R14 and R11's scope text change; defects 4, 6 and 18 name their new closers; the release gate names four leaves. The slice map carries seventeen slices and twenty-eight pages, with the eleven administrator pages across four entries. The constitution moves to 6.2.2 and `version.json` with it. `docs/domain-model.md` and `docs/capacity-model.md` update their slice references. R1's specification changes one traceability sentence and its range string. The decision register opens `volume-09.md`; `volume-08.md` falls to 95,305 bytes. Every live range string moves to ADR-140, `Project-Technologies.txt`'s header gains 140, and the check's slice constant becomes 17. No code, schema, migration or data exists, so no backfill is required. Review date: 2026-12-01, and the tripwire is R17 above sixty functional requirements, which splits it into R17 and R18 with no renumbering.

**Annotation.** ADR-033 and ADR-109 name "R13's admin delete" as a consumer of the catalog-delete cascade; the consumer is R16, and the rule each states is unchanged. ADR-077 names R13 as the extender of the `admin` module; R13, R16 and R17 extend it, in that order. ADR-106 moves the administrator's reply to R13; the reply is R17's, and the rule that no administrator operation exists before it can be recorded is unchanged and is the reason R13 ships the recorder. ADR-139 decision 6 declares R13's concentration; the block is four slices and the declared risk is discharged by this split, with the same review date.
