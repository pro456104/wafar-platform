# Specification Quality Checklist: Identity and Foundation

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-10
**Refreshed**: 2026-10-21 — after ADR-097, ADR-098, ADR-099, ADR-102, and ADR-105
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
      facts (`expires_at` and the 90-day trigger → R15, notification retention
      → R9, the message sender and the `Conversation` administrator reference →
      R10, the multi-separator printed price → R3) are untouched
- [x] The specification adds nothing outside the four registers — no page
      beyond the twenty-seven, no entity beyond the twelve, no product feature
      beyond the sixteen, and no role beyond the three — and the twenty-seven-page
      register is not amended
- [x] No requirement contradicts an accepted decision record
- [x] Identifiers are contiguous, stable, and never reused — FR-001 … FR-050,
      AC-001 … AC-054, SC-001 … SC-009, with no gap, no renumbering, and no
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
- FR-001 … FR-050 (50 requirements) are each covered by at least one AC;
  AC-001 … AC-054 (54 criteria) are grouped under their user stories and each
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
  raised, and the requirement and criterion counts are unchanged.
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
