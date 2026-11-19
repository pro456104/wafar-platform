# Specification Quality Checklist: File Intake

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-11-12
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Items marked incomplete require spec updates before `/speckit.clarify` or `/speckit.plan`
- Validation run 1 (2026-11-12): all items pass. 60 functional requirements,
  46 acceptance criteria, and 12 success criteria, contiguous from `001`; every
  functional requirement is cited by at least one acceptance criterion.
- The slice map's three open questions for R2 are answered in the specification:
  the quota copy (`FR-010`), the duplicate link target `/parts?file=<id>`
  (`FR-044`), and the exact format-and-size line (`FR-005`).
- Open fact #9 is settled in `FR-036` (the kept file's byte count and content
  type). The decision record and the `docs/domain-model.md` amendment are the
  plan's to record, as the Assumptions state; the specification invents no
  entity.
- The uploaded file's name is recorded as a field-level fact in the Assumptions,
  because the duplicate outcome must name the original and My Files must show
  it, while the Glossary's `Catalog` metadata names only the supplier, the issue
  date, the upload date, and the expiry date.
- Three windows are deliberate and named: processing after `uploaded` (R3), the
  duplicate link's page (R5, roadmap defect 20), and the four static pages
  (R11, roadmap defect 19). The Assumptions assign them, and R2's plan records
  each in Complexity Tracking.
- `FR-054` states the person's reduced-motion preference rather than naming the
  technical signal that carries it.
- Validation run 2 (2026-11-13): the refinement pass re-checked every item above
  against `spec.md` and all remain satisfied. The document now carries 62
  functional requirements, 46 acceptance criteria, and 13 success criteria,
  contiguous from `001`; no identifier was renumbered, reused, or withdrawn.
  C5 moved every plan directive and implementation detail out of `FR-009`,
  `FR-029`, `FR-061`, and `FR-062`, and the external-scan assumption, into
  `plan.md` → Specification Detail Owned Here; `FR-009` now states what the
  merchant sees rather than how the original is read. D1 removed the duplicated
  phrasing in the `FR-045`/`FR-046`, `FR-030`/`FR-032`, and `FR-028`/`FR-049`
  pairs, with the clearer identifier of each pair carrying the consolidated
  statement and both identifiers staying live. U2 gives every percentage in the
  Success Criteria a named sample and a measurement method. A1 moved `Status`
  off `Draft` to `Ready for Implementation — plan.md and tasks.md complete`.
- Validation run 3 (2026-11-14): the repair pass re-checked every item above
  against `spec.md` and all remain satisfied. The document now carries 62
  functional requirements, 50 acceptance criteria, and 13 success criteria; no
  identifier was renumbered, reused, or withdrawn. `AC-029` keeps its
  limit-refusal givens — the monthly limit, both limits, the refusal that
  precedes the duplicate check, and the file-level cause that precedes the
  limit's — and the four boundary scenarios it carried moved to `AC-047`
  (the quota-exceeded state on load with no attempt), `AC-048` (the success that
  reaches the limit), `AC-049` (a duplicate or an error outcome at an exhausted
  limit), and `AC-050` (the attempt bound, its wait, and the reload), each with
  its own FR tail; `AC-047`–`AC-050` continue User Story 4 under its own heading
  at the end of the section rather than taking numbers from User Story 5's range,
  and User Story 4's acceptance-scenario pointer names both ranges. `SC-004` now measures the
  original's processing status and the failed original's «ملفاتي» link that
  `FR-044` fixes, as three ratios over one named sample. Every `SC` ends with the
  requirements it measures, as every `AC` does. `SC-008`'s sample is the eleven
  baseline states and states that the shell's ended-session state is R1's and is
  measured separately. `AC-027` renders the counts as the copy fixes them —
  «12 من 50» and «34 من 300». `FR-026`'s server re-check enumerates the causes in
  `FR-028`'s fixed order — the name, the format, the size, then emptiness — and
  adds emptiness to the checks the server repeats.
- Validation run 4 (2026-11-14): the count pass re-checked every item above
  against `spec.md` after the (4) clarification session and all remain
  satisfied. The document now carries 65 functional requirements, 51 acceptance
  criteria, and 13 success criteria, contiguous from `001`; no identifier was
  renumbered, reused, or withdrawn. The session added `FR-063` (the text the
  platform writes and shows a merchant — Arabic, Latin numerals, no emoji),
  `FR-064` (the closed set of seventeen refusal causes), and `FR-065` (exactly
  one owner for every piece of text), and `AC-051` (the merchant-read text taken
  as one set, citing `FR-063`, `FR-064`, and `FR-065`); every one of the four is
  cited by at least one acceptance criterion, and the identifier soundness check
  in `governance-drift-check.mjs` reports the specification sound at 65 FR,
  51 AC, and 13 SC. `plan.md` carries the same counts in its Constitution Check,
  and `tasks.md` records that no task names `FR-063`, `FR-065`, or `AC-051` yet.
- Validation run 5 (2026-11-15): the leak-fix pass re-checked every item above
  against `spec.md` and all remain satisfied; no marker changed. The document
  still carries 65 functional requirements, 51 acceptance criteria, and 13
  success criteria; no identifier was renumbered, reused, or withdrawn. The
  `Status` paragraph is reduced to one neutral sentence about the specification's
  own state, and the specification now names no task identifier, no tracking
  row, and no internal bookkeeping of the plan or the task list — it names an
  artifact without naming what is inside it. `plan.md`'s Principle VII scan is
  widened to five forms in the same change (`Wf[A-Z]\w*`, `UPLOAD_[A-Z_]+`, the
  path vocabulary, `T\d{3}`, and `Complexity Tracking row \d+`), and the re-scan
  returns zero matches for each of them.
- Validation run 6 (2026-11-15): the coverage-naming pass re-checked every item
  above against `spec.md` after the (4) clarification session and all remain
  satisfied; no marker changed. The document still carries 65 functional
  requirements, 51 acceptance criteria, and 13 success criteria; no identifier
  was renumbered, reused, or withdrawn. The session named the four cases the
  2026-11-14 sessions added — the last suffix's four names, the file that opens
  as its declared format but cannot be rewritten, the original's status captured
  at the duplicate's recognition, and the page's reload after a refusal over the
  attempt bound — inside the Test Coverage Request's unit and integration
  items, and named no task identifier and no requirement's text, so the
  specification still names no internal bookkeeping of the plan or the task
  list. The coverage target stays at 80% of changed lines.
- Validation run 7 (2026-11-15): the duplication pass re-checked every item
  above against `spec.md` after the (7) clarification session and all remain
  satisfied; no marker changed. The document still carries 65 functional
  requirements, 51 acceptance criteria, and 13 success criteria; no identifier
  was renumbered, reused, or withdrawn. The session closed finding D2 — the
  rule that withholds an outcome's action while a limit is exhausted read in
  FR-044, FR-047, and FR-049 beside FR-017 — by naming those three
  requirements inside FR-017 as quoting it and restating none of its content;
  their own text is unchanged.
- Validation run 8 (2026-11-15): the identifier-preserving fix pass re-checked
  every item above against `spec.md` and all remain satisfied; no marker changed.
  The document still carries 65 functional requirements, 51 acceptance criteria,
  and 13 success criteria; no identifier was renumbered, reused, or withdrawn.
  C2 rewrote the User Scenarios & Testing claim to the narrow one that holds —
  each story's cases live in its own file and name the story that owns them —
  and recorded that `EX-013` covers independence in implementation and in
  testing for the three verification increments; I3 defined `SC-008`'s sample as
  eleven measured presentations and stated that the multi-file notice adds no
  state (`FR-020`), with `AC-051` naming the same set; I4 added `FR-050` to
  `AC-002`'s tail for the transfer that had not completed; G2 added the
  invalid-request refusal to `AC-009` and named `SC-009`'s seventeen-cause
  sample; G3 added the refusal of an override above the 500/1,500 cap to
  `AC-028`; D1 merged `FR-017`'s last two sentences into one; D2 kept `FR-039`'s
  `ADR-131` anchor and referred its recording rule to `FR-011`, with `AC-008`
  naming `FR-011` beside it; D3 replaced
  `FR-063`'s restatement of `FR-034` with a reference, and `FR-028`'s
  description of `FR-064` followed; D4 stated the not-found rule once in
  `AC-014` and made `AC-021` and `AC-025` refer to it; U3 reworded `FR-064` so
  the closed set is fixed by this specification's requirements, with no
  transport-table reference. `governance-drift-check.mjs` reports the
  specification sound at 65 FR, 51 AC, and 13 SC.
- Validation run 9 (2026-11-15): the post-fix re-check re-read every item above
  against `spec.md` after the fixes the analysis's `C2`, `I3`, `I4`, `G2`, and
  `G3` findings required, and all remain satisfied; no marker changed. The
  document still carries 65 functional requirements, 51 acceptance criteria, and
  13 success criteria; no identifier was renumbered, reused, or withdrawn. The
  five fixes are present as the earlier run recorded them: the story claim states
  the narrow reading and `EX-013`'s coverage of implementation and testing (`C2`);
  `SC-008`'s sample is the eleven measured presentations, the multi-file notice
  adds no state, and `AC-051` names the same set (`I3`); `AC-002`'s tail carries
  `FR-050` for the transfer that had not completed (`I4`); `AC-009` carries the
  invalid-request refusal and `SC-009` names the seventeen-cause sample (`G2`);
  `AC-028` carries the refusal of an override above the 500/1,500 cap (`G3`). The
  re-check adds the specification's own evidence: each of the seven
  implementation-detail forms returns zero matches — the one unnumbered
  `Complexity Tracking` mention is the HTML comment at line 61, which renders
  nowhere and states no requirement — `[NEEDS CLARIFICATION]` returns zero, all 65
  `FR-###` identifiers appear in at least one acceptance criterion's tail, each of
  the 51 criteria and each of the 13 success criteria ends with the requirements
  it measures, and `node governance-drift-check.mjs` exits 0 and reports the
  specification sound at 65 FR, 51 AC, and 13 SC.
- Validation run 10 (2026-11-15): the boundary re-check re-read the sixteen items
  above against `spec.md` after the (8) clarification session, and all sixteen
  remain `[x]`; no marker changed. The document still carries 65 functional
  requirements, 51 acceptance criteria, and 13 success criteria; no identifier was
  added, renumbered, reused, or withdrawn, and no task was modified — the list
  keeps its 110 tasks and its 59 `[P]` markers. The session adds one sentence
  inside `FR-064` that bounds the closed set to the refusal causes this slice
  decides for a file and for an upload request, and refers the four answers the
  intake reuses from R1 — the ordinary not-found answer, the request-forgery
  check's failure, a request body above the platform's request-size bound, and
  the internal error — to R1 and to the contract, with R1's own text and R1's own
  `retryable` value and no eighteenth cause and no new message; the 2026-11-14 (4)
  answer now points behaviourally at `FR-064` instead of naming two refusal tables
  by section, and its seventeen causes and their entry rule stand.
  `node governance-drift-check.mjs` exits 0 and reports the specification sound at
  65 FR, 51 AC, and 13 SC.
- Validation run 11 (2026-11-15): the seven-finding repair pass re-checked the
  sixteen items above against `spec.md` and all remain `[x]`; no marker changed.
  The document still carries 65 functional requirements, 51 acceptance criteria,
  and 13 success criteria, contiguous from `001`; no identifier was renumbered,
  reused, withdrawn, or added. (`I1`) The rule that an outcome withholds its
  actions while a limit is exhausted is now one rule: FR-017 withholds the retry
  and «اختيار ملف آخر» together, including through a failed re-read; FR-028 and
  AC-020 scope "the merchant can choose another file" to the case where no limit
  is exhausted; FR-049 states both; AC-049 names both; and the feature's UI
  contract states the same rule for the error panel. (`I2`) The three refusal
  messages that lacked «لم يُحفظ الملف» gained it — content mismatch, corrupt,
  password-protected — so AC-020's uniform guarantee holds for all six causes and
  the contract says so. (`U1`) A transfer failure, a completion the platform
  cannot accept, and a cancellation are three distinct outcomes in FR-049,
  FR-061, and FR-064, and the contract and the two transport tasks carry the same
  three. (`A1`) FR-015 names the one case that withholds the upload control — a
  verified exhausted state, held through a failed re-read — and refers it to
  FR-017 instead of denying it; (`A2`) AC-012's month-boundary clause reads
  «under both limits» like its last clause; (`G1`) AC-001 gained the one-file
  rule — a multi-file drop starts only the first with the transient notice, and
  no second file starts while one is in flight — because FR-020 stated it and no
  criterion measured it; (`U2`) AC-028's cap clause is asserted by the write that
  sets an override, with no administrator screen, and the Assumptions name the
  slice that owns the administrator-facing refusal. No task identifier moved and
  the list keeps its 110 tasks and 59 `[P]` markers; T033, T051, T067, and T077
  carry the two-actions and three-outcomes readings, and T051 names AC-001
  beside FR-020. `node governance-drift-check.mjs` exits 0 and reports the
  specification sound at 65 FR, 51 AC, and 13 SC.
- Validation run 12 (2026-11-16): the precedence pass re-checked the sixteen items
  above against `spec.md` after the 2026-11-16 clarification session and all
  remain `[x]`; no marker changed. The document still carries 65 functional
  requirements, 51 acceptance criteria, and 13 success criteria, contiguous from
  `001`; no identifier was renumbered, reused, or withdrawn. The session closed
  the order in which the duplicate check and the lowered limit's judgment decide
  an upload that was already in flight when an administrator lowered the quota:
  the duplicate check comes first, so a file whose content matches a retained
  catalog receives the duplicate outcome and consumes no quota, and only a file
  that is not a duplicate is refused for the lowered limit. `FR-019` states the
  precedence in its own words, `AC-033` measures it, and the Edge Cases section
  names the case. The start-side reading — a merchant already at a limit is
  refused before any byte is transferred, and that file is not reported as a
  duplicate — is unchanged, and `FR-013`'s acceptance order is unchanged.
  `node governance-drift-check.mjs` exits 0 and reports the specification sound at
  65 FR, 51 AC, and 13 SC.
- Validation run 13 (2026-11-16): the single-source pass re-checked the sixteen
  items above against `spec.md` after the 2026-11-16 clarification session and
  all remain `[x]`; no marker changed. The document still carries 65 functional
  requirements, 51 acceptance criteria, and 13 success criteria, contiguous from
  `001`; no identifier was renumbered, reused, or withdrawn. The US4 note now
  names AC-027 – AC-034 and AC-047 – AC-050 as the criteria that close the
  exception, which is the share the story's own acceptance-scenario pointer, the
  Acceptance Criteria section, the plan's Complexity Tracking row 21, and T111
  carry; the register's `EX-013` row carries the same share and names the
  seventh test path its scope writes, so the four story notes read the closing
  criteria from that row as the one source. The answer that aligned the three
  outcomes with the feature's contract no longer names the transport it runs
  over, so the specification names no transport (Principle VII).
  `node governance-drift-check.mjs` exits 0 and reports the specification sound at
  65 FR, 51 AC, and 13 SC.
- Validation run 14 (2026-11-16): the measurement pass re-checked the sixteen
  items above against `spec.md` after the 2026-11-16 (2) clarification session and
  all remain `[x]`; no marker changed. The document still carries 65 functional
  requirements, 51 acceptance criteria, and 13 success criteria, contiguous from
  `001`; no identifier was renumbered, reused, or withdrawn. The session amended
  `SC-012`'s Measurement clause so that it is producible for all six of its quota
  scenarios: where a rendered-page case exists, the page's two numbers and the
  records' two numbers are read at the same observation, and where the scenario is
  read from the quota read alone, the scenario's two counts are read from the
  records and the displayed pair is not part of that observation. The criterion
  keeps its identifier, its sample, its numerator, and its denominator, and no
  task, no case, and no identifier changed. The specification still names no task
  identifier and no internal bookkeeping of the plan or the task list — the
  criterion's measuring task stays where the task list records it.
  `node governance-drift-check.mjs` exits 0 and reports the specification sound at
  65 FR, 51 AC, and 13 SC.
- Validation run 15 (2026-11-16): the structure pass re-checked the sixteen items
  above against `spec.md` after the 2026-11-16 (3) clarification session and all
  remain `[x]`; no marker changed. The document still carries 65 functional
  requirements, 51 acceptance criteria, and 13 success criteria, contiguous from
  `001`; no identifier was renumbered, reused, or withdrawn. The session moved the
  group "The attempt's trace" from a heading of its own to a bold label at the
  same position, so `FR-062` stands inside the `### Functional Requirements`
  subsection with every other requirement and `FR-063`, `FR-064`, and `FR-065`
  stay under the bold label that already held them; all 65 requirements now stand
  under that one heading, in the order `FR-001` to `FR-065`, and not one word of
  any requirement's text changed. The acceptance criteria, the success criteria,
  and the task list's reference tails are untouched.
  `node governance-drift-check.mjs` exits 0 and reports the specification sound at
  65 FR, 51 AC, and 13 SC.
- Validation run 16 (2026-11-17): the four-decision pass re-checked the sixteen
  items above against `spec.md` after the 2026-11-17 (4) clarification session and
  all remain `[x]`; no marker changed. The document still carries 65 functional
  requirements, 51 acceptance criteria, and 13 success criteria, contiguous from
  `001`; no identifier was renumbered, reused, withdrawn, or added, and no new
  acceptance criterion was created. The session widened `FR-032`'s embedded-object
  set, held the kept sanitized file to the upload's 100 MB bound, named the two
  parser-bound cases in the Test Coverage Request, and gave `AC-006`, `AC-016`,
  and `AC-020` one stacked-cause clause each for `FR-029`'s order; `AC-020`'s
  tail gains `FR-029`. The four changes keep the specification
  technology-agnostic — no language, framework, library, database, or layer
  identifier is named — and `node governance-drift-check.mjs` exits 0 and reports
  the specification sound at 65 FR, 51 AC, and 13 SC.
- Validation run 17 (2026-11-17): the two-decision pass re-checked the sixteen
  items above against `spec.md` after the 2026-11-17 (11) clarification session
  and all remain `[x]`; no marker changed. The document still carries 65
  functional requirements, 51 acceptance criteria, and 13 success criteria,
  contiguous from `001`; no identifier was renumbered, reused, withdrawn, or
  added, and no new acceptance criterion was created. `FR-029` now states that
  the file is scanned exactly once, before the sanitizer, and that the sanitized
  file is not scanned a second time — because the sanitizer only removes content,
  the kept bytes are the scanned bytes minus what was removed, and the reopen
  proves the kept file is a valid document of its format — with the reason that a
  second scan would add up to the 90-second scan budget to the five stages' 115
  seconds inside the page's 120-second timeout; contract §4's head states the
  same rule. `SC-013` now states the product requirement as the per-cause
  counters and the nonzero unavailable-scan count, and leaves the window's length
  and the surge threshold as R12's operational settings recorded before
  2026-12-15, with no new cause and no new counter; its citation tail gains
  `FR-064`. The two changes keep the specification technology-agnostic, and
  `node governance-drift-check.mjs` exits 0 and reports the specification sound
  at 65 FR, 51 AC, and 13 SC.
