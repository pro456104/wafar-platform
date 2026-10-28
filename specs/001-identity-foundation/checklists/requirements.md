# Specification Quality Checklist: Identity and Foundation

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-10
**Refreshed**: 2026-10-22 — after ADR-111 (the recovery flow's verified state, and the bare pages' state announcements), again after the fifth `/speckit.clarify` session of that date (five answers; see Notes), again after the sixth session of that date (five answers; ADR-114), and again after the seventh session of that date (five answers; ADR-115); 2026-10-24 — the Assumptions' scale sentence now names `docs/capacity-model.md` as the planning authority (no requirement, criterion, or count changed); 2026-10-27 — the frame's fourth surface (the bottom bar), the drawer's opener and closer, and the footer's narrow-screen rule; 2026-10-27 (second session) — the footer band's surface authority, FR-052's position and citations, and the locked state's copy; 2026-10-27 (third session) — FR-052 moves after FR-051 and names ADR-127 and ADR-128; 2026-10-27 (correction) — ADR-132 corrects the first-visit appearance to the device preference and reverses the bar's visibility to scroll-hide, and the two stale Clarifications answers were corrected to FR-025 and FR-052 (no identifier or count changed)
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

## Constitutional Compliance

- [x] No requirement asserts an answer the constitution reserves to another
      slice — the five open rows of the constitution's Unresolved product
      facts (`expires_at` → R15, notification retention
      → R9, the message sender and the `Conversation` administrator reference →
      R10, the multi-separator printed price → R3) are untouched
- [x] The specification adds nothing outside the four registers — no page
      beyond the twenty-eight, no entity beyond the twelve, no product feature
      beyond the sixteen, and no role beyond the three — and the twenty-eight-page
      register is not amended by this specification (ADR-126 amended it, and the
      item list's ninth destination is carried by FR-039, AC-042, and US5)
- [x] No requirement contradicts an accepted decision record
- [x] Identifiers are contiguous, stable, and never reused — FR-001 … FR-052,
      AC-001 … AC-055, SC-001 … SC-009, with no gap, no renumbering, and no
      dangling reference
- [x] Every user story is independently testable and deliverable — US5's
      independent test is structural, and the strain its deferred runtime
      behaviour places on Principle VIII is recorded here for the plan's
      Constitution Check
- [x] The specification names no framework, library, database, product, or
      architectural pattern

## Notes

- Items marked incomplete require spec updates before `/speckit.clarify` or `/speckit.plan`.
- No `[NEEDS CLARIFICATION]` markers were raised. The three boundary questions
  the feature description left implicit were resolved from the binding sources
  and recorded in Assumptions instead: where the shared frame renders at this
  slice (the frame is delivered for the public and merchant scopes; this slice's
  own pages are all bare), that the static and error pages arrive with a later
  slice while this slice binds the frame's absence from them and provides the
  reachability surface, and that the base project's technical composition is a
  plan matter rather than a specification matter.
- FR-001 … FR-052 (52 requirements) are each covered by at least one AC;
  AC-001 … AC-055 (55 criteria) are grouped under their user stories and each
  cites its functional requirement. SC-001 … SC-009 are numeric and
  technology-agnostic.
- The spec names only entities registered in `docs/domain-model.md` (`User`,
  `Session`). The fixed Libyan city list is treated as reference data, not an
  entity, because no entity is registered for it. The pending verification
  state is recorded in `docs/domain-model.md` as transient, non-entity state
  owned by the `users` module (→ "Transient verification state (not an
  entity)"), and the account-level amendment's content is named explicitly as
  exactly three fields on `User` — in the register's `User` row and in the
  model's `User` invariants, both moved by ADR-105, which is the amendment this
  checklist previously asserted before it existed.
- Refreshed 2026-10-20: ADR-094 aligned the guest header rule, and ADR-096
  added the three Constitution Mandated Values (password policy, one-time-code
  limits, and field lengths) and bound the frame's static-page link surface,
  which this specification records as a footer band (FR-024). The three boundary
  clarifications above remain the only clarifications; no new
  `[NEEDS CLARIFICATION]` marker was raised, and the requirement and criterion
  counts are unchanged.
- Refreshed 2026-10-21: ADR-097 fixed the Wafar UI layer path at `packages/ui`,
  moved the frontend layout to Nuxt 4 `app/`, and amended the constitution to
  3.3.0; ADR-098 recorded IconPark (vendored), IBM Plex Sans Arabic, the light
  default, and the marine/sand palette. The spec remains product-level; the R1
  plan records the technical choices and fills CMV row 11.
- Refreshed 2026-10-21 (second time): ADR-099 fixed the shared shell's header
  and account menu — the header carries only the logo/home and account controls,
  the account control opens the «حسابي / إعدادات / تسجيل الخروج» menu with a
  yes-or-no sign-out confirmation, the theme switch and the sidebar-collapse
  control sit in the sidebar, and «إعدادات» is a section inside the Profile page.
  FR-047 and AC-051 were added; the frame's checks now assert the new
  composition.
- Refreshed 2026-10-21 (fifth time): ADR-102 moved the theme switch out of the
  sidebar and into the header, immediately beside a notifications control that
  carries the unread count, and restored the crescent glyph of the registered
  IconPark set for the switch. FR-020, FR-023, FR-025, FR-039, AC-022, AC-025,
  AC-027, and AC-042 now assert the new header composition; the default
  appearance stays light (ADR-098), and no `[NEEDS CLARIFICATION]` marker was
  raised, and the requirement and criterion counts are unchanged. **Corrected
  2026-10-27:** ADR-132 replaces that default with the device preference
  (`system`); FR-025 carries the current rule.
- Refreshed 2026-10-21 (third time): the `/speckit.clarify` session answered five
  questions and ADR-100 recorded the answers — the two landing points of the
  account items, the sign-out-everywhere action in the Profile page's settings
  section (the constitution moved to 3.5.0), the sign-in redirect a guest gets
  from a merchant-area sidebar item, the explicit state the frame shows when a
  session ends or an account is blocked, and the administrator application's own
  header. FR-048 … FR-050 and AC-052 … AC-054 were added; no
  `[NEEDS CLARIFICATION]` marker was raised, and every requirement is covered by
  at least one criterion.
- Refreshed 2026-10-21 (fourth time): a second `/speckit.clarify` session
  answered five more questions and ADR-101 recorded the answers — the background
  and its colour are a fixed Wafar UI layer value and no product setting; the
  account menu closes on Escape, on an activation outside it, or on a focus loss,
  with the focus returning to the account control; «حسابي» shows the full name,
  the city, and the account status and no other field; the merchant sees the
  ended-session state after confirming the sign-out; and the account control's
  accessible name is «حسابي». FR-023, FR-025, FR-047, FR-049, AC-022, AC-025,
  AC-051, and AC-053 carry the rules. The constitution stays at 3.5.0, the
  requirement and criterion counts are unchanged at 50 FR and 54 AC, and no
  `[NEEDS CLARIFICATION]` marker was raised.
- Refreshed 2026-10-21 (sixth time): a third `/speckit.clarify` session answered
  eight questions and corrected the contradictions four earlier sessions left
  behind. The sign-out control belongs to the frame — the account menu's third
  item and its confirmation are built and verified structurally here, and only
  the runtime behaviour lands with R4 (ADR-099 decision 6) — which replaces the
  stale Assumption, FR-041's wording, and US2's Independent Test. FR-029's
  hidden-field refusal now guarantees the response alone, with the flow stopping
  at it, so the three statements that could not hold together now do. FR-020
  records the icon set ADR-098 already chose instead of choosing it again.
  FR-048, FR-049, AC-027, AC-052, and AC-053 gained the deferral clause their
  neighbours already carried, so none of them asserts runtime behaviour this
  slice cannot exercise. FR-024, AC-026, and the matching Assumption record
  that the static pages' reachability requirement is discharged by R4 and that
  R1's plan records the deferral in its Complexity Tracking table with an owner
  and a review date. FR-018 and AC-020 no longer name the retention job as a
  removal path for account data. The two implementation details the file named
  are gone, and the transient verification store and the three new `User` fields
  are recorded where a reviewer can read them. The requirement and criterion
  counts are unchanged at 50 FR, 54 AC, and 9 SC; no identifier was renumbered
  or reused; no `[NEEDS CLARIFICATION]` marker was raised; and the six
  constitutional checks above were added to cover what the earlier checklist
  omitted.
- Refreshed 2026-10-21 (seventh time): the same session continued. The four
  acceptance criteria that three earlier sessions had appended to the end of the
  specification's last section — the account menu, the guest's redirection, the
  ended-session state, and the administrator application's header — were moved
  to the user stories they serve: the first three to US5, the fourth to US6.
  The ordinals were renumbered in document order and the seven "Acceptance
  Scenarios" lines were rewritten from the actual grouping, so the grouping
  this checklist claims is now the grouping the file carries. The Functional
  Requirements section states that the requirements are grouped by subject
  rather than by identifier and that an identifier is stable for the life of
  the feature, so a reader does not mistake the order for a numbering. FR-032,
  the `Session` entity, and the matching clarification describe the session's
  browser-held reference in the constitution's own terms: the browser retains
  the reference that proves the session, and the session itself is never
  recoverable from browser storage. The requirement and criterion counts are
  unchanged at 50 FR, 54 AC, and 9 SC; no identifier was renumbered or reused;
  and no `[NEEDS CLARIFICATION]` marker was raised.
- Refreshed 2026-10-21 (eighth time): ADR-105 made the sixth refresh's last
  claim true. The transient verification store and the three account-level
  `User` fields are now recorded where a reviewer can read them — the register's
  `User` row names the three fields, and `docs/domain-model.md` carries their
  invariants plus a "Transient verification state (not an entity)" section owned
  by the `users` module, so the register stays at twelve entities. The
  constitution moved to 3.7.0 (MINOR: a register expanded). No requirement,
  criterion, or identifier changed.
- Refreshed 2026-10-22: a `/speckit.clarify` session answered two more questions
  and ADR-111 recorded the answers — the one-time code stops being usable the
  moment it is verified in password recovery, the pending request moves to a
  single-use verified state that carries the new-password step and lasts no
  longer than the request's own lifetime, a reload at that step resumes it, and
  setting the password ends the state so the same code cannot authorise a second
  reset; and the in-progress state, the inline failure message, and the in-place
  confirmation are announced to assistive technology, with focus moving to the
  step now shown rather than remaining on a removed control. FR-014, FR-034,
  FR-038, FR-040, AC-036, AC-041, AC-043, SC-006, the key-entities note, US3's
  Independent Test, two edge cases, the Test Coverage Request, and
  `docs/domain-model.md`'s transient-verification-state section carry the rules.
  The requirement and criterion counts are unchanged at 50 FR, 54 AC, and 9 SC;
  no identifier was renumbered, reused, or withdrawn; no `[NEEDS CLARIFICATION]`
  marker was raised; and every checkbox above stays checked.
- Refreshed 2026-10-22 (second time): the fifth `/speckit.clarify` session of
  that date answered five questions that the earlier sessions had left open, and
  ADR-112 recorded the answers; each answer was applied to the sections that
  carry its rule. The code step no
  longer shows back "the fields the person filled in": FR-038 and AC-041
  enumerate the fields it shows — the full name, the mobile number, the city, and
  the optional shop name — and state that the password is never re-displayed,
  echoed, or rendered masked, so a submitted password cannot return to the
  browser. The administrator's first sign-in is delivered here as behaviour with
  no page, exactly as FR-013's change-password action is, so AC-030's assertion
  that the forced-password-change requirement is cleared by the change made at
  that first sign-in is exercisable in this slice; FR-028, AC-030, US6's
  Independent Test, the administrator Assumption, an edge case, and the Test
  Coverage Request carry the bound, and only the sign-in surface stays with the
  later slice. A status or role refusal now performs the same verification work
  as any other sign-in attempt and is refused afterwards on that ground, which
  brings FR-017 into line with FR-009's wording and with FR-008 and SC-004's
  timing uniformity; AC-009, AC-019, AC-029, SC-004, an edge case, and the Test
  Coverage Request assert it. The pending request now ends once the platform has
  stated an outcome it cannot complete, at sign-up for a number that already has
  an account as well as in the recovery flow, so no live request or usable code
  survives a reported outcome; FR-006, FR-034, AC-006, the key-entities note, an
  edge case, and the Test Coverage Request carry the rule. Finally, the coverage
  target names its scope: 80% of the changed production lines this slice
  introduces, excepting the frame's runtime behaviour it defers to the first
  frame-carrying slice, which that slice covers. AC-022's stale clause about the
  icon set being chosen here was corrected against FR-020 and ADR-098, which
  record that the set is already chosen and that this slice records it in the
  technology register. The requirement and criterion counts are unchanged at 50
  FR, 54 AC, and 9 SC; no identifier was renumbered, reused, or withdrawn; no
  `[NEEDS CLARIFICATION]` marker was raised; all 50 FRs remain cited by at least
  one AC and every AC still cites at least one FR; and every checkbox above
  stays checked.
- Refreshed 2026-10-22 (third time): a sixth `/speckit.clarify` session answered
  five questions and ADR-114 recorded the answers. The administrator's forced
  first change must set a value different from the initial password, so the
  reuse allowance no longer makes the requirement vacuous. The pending sign-up
  request holds the submitted password only in the same irreversibly protected
  form a stored password has, computed at submission, so no plaintext password is
  retained and the account is still created from it after verification. A
  submission's refusals are decided in one fixed order — the rate limit, the
  hidden field, the minimum time, the value rules, then account existence — so
  each criterion asserts one refusal. A failed re-request of a one-time code
  leaves the previous code valid, the request live, and the re-request limit
  untouched. The forced first change ends every session, including the restricted
  one it was made from, and sends the security notice. FR-013, FR-028, FR-034,
  FR-035, FR-038, FR-043, and the new FR-051 carry the rules; AC-030, AC-036,
  AC-037, AC-041, AC-047, and the new AC-055 assert them, with US6's Independent
  Test, two Assumptions, the Key Entities note, two edge cases, and the Test
  Coverage Request. `docs/domain-model.md` is corrected in the same change — the
  transient store's protected password, the dispatch-conditioned code
  replacement, and the forced change's session and notice. The counts become 51
  FR, 55 AC, and 9 SC; no identifier was renumbered, reused, or withdrawn; every
  FR is cited by at least one AC; and all 22 checkboxes above stay checked.
- Refreshed 2026-10-22 (fourth time): a seventh `/speckit.clarify` session
  answered five questions and ADR-115 recorded the answers — the ended-session
  state, the send-failure boundary, the counted code, the replaced verification,
  and the forced change's current-password check. The counts stay 51 FR, 55 AC,
  and 9 SC; no identifier was renumbered, reused, or withdrawn; every FR is cited
  by at least one AC; and all 22 checkboxes above stay checked.
- Refreshed 2026-10-24: the Assumptions' scale sentence now states the
  measurement condition for SC-009 and names `docs/capacity-model.md` as the
  planning authority for the platform envelope, so the plan's `Scale/Scope`
  starts from that model and records this feature's condition and any deviation
  instead of treating 10,000 accounts / 500 sessions / 10 authentication requests
  per second as the platform's sizing ceiling. No requirement, criterion,
  identifier, or count changed.
- Refreshed 2026-10-25: ADR-126 amended the Product Register with the Upload
  Catalog page (the register's twenty-eighth page and the sidebar's ninth
  destination at route `/upload`), so FR-039, AC-042, and US5 carry the
  nine-item list, the page-count claims above read twenty-eight, and the
  checklist item marks the register as amended by ADR-126 rather than by this
  specification. No requirement, criterion, or identifier changed (counts stay
  51 FR, 55 AC, and 9 SC); all 22 checkboxes above stay checked.
- Refreshed 2026-10-27: the `/speckit.clarify` session recorded the frame's
  fourth surface. FR-052 fixes the bottom navigation bar — shown below 1024px,
  absent from 1024px up, with five slots (Home, Upload Catalog, a raised search
  action to the Parts page, My Files, and «المزيد»), one composition shown
  identically to a guest and to a signed-in merchant, and a guest's merchant-area
  slot taking them to sign-in while the slot stays present and enabled. FR-022
  now says «المزيد» opens the drawer and the collapse control closes it; FR-024
  hides the footer band on a narrow screen and puts its four links at the bottom
  of the drawer; FR-021 and AC-023 add the bar to the bare pages' absence;
  AC-022, AC-024, AC-026, AC-042, US5, the edge cases, SC-005, the Test Coverage
  Request, and the frame Assumption carry the rule. The counts become 52 FR,
  55 AC, and 9 SC; no identifier was renumbered, reused, or withdrawn; every FR
  is cited by at least one AC; and all 22 checkboxes above stay checked.
- Refreshed 2026-10-27 (second session): a `/speckit.clarify` session answered
  three questions. The surface that carries the four static-page links is a
  constitutional fact (ADR-096), so FR-024 and AC-026 now state that this slice
  builds the fixed footer band and that its decision record fixes the routes
  alone, rather than claiming that this slice chooses the surface; the
  Assumptions bullet and the two earlier Clarifications bullets that asserted a
  choice carry revision notes. FR-052 then kept its place beside the frame
  requirements it qualified — the section's reading note groups requirements by
  subject, so position was not numbering — and cited ADR-127 for the fourth
  surface and its five slots and ADR-128 for the labels, measurements, and icon
  treatment being fixed design values; the third session of this date supersedes
  that placement and restates the citations. The locked sign-in state carries no
  copy
  of its own: the one uniform failed-sign-in message is the only text shown, no
  alert, banner, field message, or retry-time hint names the lock, and the design
  reference's lockout alert is not carried into the product; FR-009, AC-010, the
  matching edge case, and the Test Coverage Request carry the rule, while the
  message's wording is a design value the plan records. No identifier was added,
  renumbered, reused, or withdrawn; the counts stay 52 FR, 55 AC, and 9 SC; every
  FR is cited by at least one AC; and all 22 checkboxes above stay checked.
- Refreshed 2026-10-27 (third session): FR-052 moves out of the frame group and
  now follows FR-051, so no requirement sits inside another requirement's block;
  it states that the bar is always visible — it does not hide on scroll and the
  page reserves its height, because the design reference's scroll-hide is not
  transferred — and it names ADR-127 for the five slots, the drawer behaviour,
  the always-visible bar, and the reserved height, and ADR-128 for the labels,
  measurements, and icon treatment. **Corrected 2026-10-27:** ADR-132 reverses
  that rule — the bar hides after 32px of cumulative downward scroll, returns on
  the first 16px of upward scroll or within 56px of the top, and the page does
  not reserve its height while the bar is hidden; FR-052 carries the current
  rule. FR-022 and AC-026 keep their references to
  FR-052, the Functional Requirements reading note now describes the placement
  rule instead of naming FR-052 as sitting beside FR-024, and the second session's
  note above carries a revision note. No identifier was added, renumbered,
  reused, or withdrawn; the counts stay 52 FR, 55 AC, and 9 SC; every FR is cited
  by at least one AC; and all 22 checkboxes above stay checked.
- Refreshed 2026-10-27 (correction): ADR-132 supersedes the first-visit
  appearance fixed earlier in this checklist and the bar's always-visible rule.
  The default is the device preference (`system`), with a stored choice winning
  (FR-025), and the bar hides after 32px of cumulative downward scroll and
  returns on the first 16px of upward scroll or within 56px of the top (FR-052).
  The two stale Clarifications answers in `spec.md` were corrected in the same
  change. No identifier was added, renumbered, reused, or withdrawn; the counts
  stay 52 FR, 55 AC, and 9 SC; every FR is cited by at least one AC; and all 22
  checkboxes above stay checked.
