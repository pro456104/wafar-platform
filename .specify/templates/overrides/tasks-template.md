---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Project Context Sources (binding)**: task generation reads `plan.md` for the
technical detail and the ownership map, and it MUST agree with the project-level
sources the plan was written against — `.specify/memory/constitution.md`,
`docs/architecture.md`, `docs/domain-model.md`, and `docs/DECISIONS.md`. Every
path a task touches MUST appear in the plan's ownership map, that map MUST match
`docs/architecture.md`, an entity a task touches MUST exist in
`docs/domain-model.md`, and a task that contradicts an accepted decision in
`docs/DECISIONS.md` MUST NOT be generated.

**Tests**: Test tasks are generated only when the spec's **Test Coverage Request** section requests them (constitution Principle III reads the request from the specification, not from the plan). If requested, include unit, integration, and end-to-end tasks as requested; if not requested, say so here explicitly rather than omitting silently.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format (REQUIRED)

<!--
  BINDING RULES FOR THIS DOCUMENT (constitution v2.18.9) - NORMATIVE:
  1. Every task MUST end with `(implements FR-###, AC-###)`, or
     `(implements Complexity Tracking: <row>)` when no requirement genuinely
     applies (Principle I).
  2. Every path a task touches MUST appear in plan.md's ownership map, and that
     map MUST match `docs/architecture.md`.
  3. Test tasks are generated only when spec.md's Test Coverage Request asks
     for them (Principle III).
  4. Commits and pull requests MUST reference the spec, plan, and task
     identifiers (Principle I).
-->

Every task MUST strictly follow this format:

```text
- [ ] T### [P?] [US#?] <action> with exact file path (implements FR-###, AC-###)
```

1. **Checkbox**: always `- [ ]`.
2. **Task ID**: `T001`, `T002`, ... in execution order.
3. **[P]**: include only when parallelizable (different files, no dependency on an incomplete task).
4. **[US#]**: required for user-story-phase tasks (`[US1]`, `[US2]`, ...); omit in Setup, Foundational, and Polish phases.
5. **Description**: the action with the exact file path.
6. **Reference tail — constitution Principle I, mandatory**: every task description MUST end with `(implements FR-###, AC-###)`, naming every requirement and acceptance criterion the task satisfies. Examples:
   - `- [ ] T012 [P] [US1] Build the parts table component in apps/web/components/PartsTable.vue (implements FR-004, AC-002)`
   - `- [ ] T014 [US1] Wire the pagination states in apps/web/components/parts/Pagination.vue (implements FR-006, FR-007, AC-004)`
7. **Reference rule for work that implements no requirement**: use a direct FR/AC reference whenever the task's outcome is genuinely described by a requirement (for example, a migration whose table a story requires). When no requirement genuinely applies — an infrastructure scaffold, a refactor, a dependency or tooling change, a security fix, a spike — the tail is `(implements Complexity Tracking: <row>)`, and the named row MUST already exist in plan.md's Complexity Tracking table. Never cite an FR/AC the task does not implement.
8. **Coverage check when generating tasks**: every FR-### and every AC-### in spec.md is referenced by at least one task; when tests are requested, every AC is exercised by at least one test task.

## Path Conventions

Paths come from plan.md's Project Structure (this repository is a Monorepo: apps/, packages/). Every task carries the exact path it touches, and touched paths MUST appear in the plan's ownership map.

The frontend locations are fixed by the constitution's Technology Standards → Internal layout and MUST NOT be re-derived: `apps/web/{pages,components,composables,stores,layouts}` and `apps/admin/{pages,components,composables,stores,layouts}`. There is no `app/` segment — the examples in this template use the fixed paths, and a path that adds one contradicts the register. If a frontend framework defaults to a different source directory, the deciding slice records that in an ADR and amends the register; until then the fixed path above is what a task uses.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

<!-- The two tasks below follow rule 7: scaffolding implements no spec
     requirement, so each references a Complexity Tracking row that MUST
     already exist in plan.md before tasks are generated. -->

- [ ] T001 Create the workspace structure listed in plan.md's ownership map (implements Complexity Tracking: feature scaffolding)
- [ ] T002 [P] Configure lint and formatting for the touched packages (implements Complexity Tracking: tooling bootstrap)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [Foundational task that a requirement genuinely covers] in [exact path] (implements FR-###, AC-###)
- [ ] T005 [P] [Foundational task that a requirement genuinely covers] in [exact path] (implements FR-###, AC-###)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [What this story delivers]

**Independent Test**: [How to verify this story on its own]

### Tests for User Story 1 (only when requested in the spec's Test Coverage Request) ⚠️

> **NOTE: Write these tests FIRST; ensure they FAIL before implementation.**

- [ ] T010 [P] [US1] Unit test for [business rule] in tests/unit/[name].test.ts (implements FR-###, AC-###)
- [ ] T011 [P] [US1] Integration test for [module contract] in tests/integration/[name].test.ts (implements FR-###, AC-###)

### Implementation for User Story 1

- [ ] T012 [P] [US1] [Model/repository task] in [exact path] (implements FR-###, AC-###)
- [ ] T013 [US1] [Service task] in [exact path] (implements FR-###, AC-###)
- [ ] T014 [US1] [Endpoint/UI task] in [exact path] (implements FR-###, AC-###)

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

[Same structure as Phase 3: goal, independent test, tests if requested, implementation tasks with reference tails]

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

[Same structure as Phase 3]

---

[Add phases for further stories, in priority order]

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] TXXX [P] Update [touched doc] to match the delivered change (implements Complexity Tracking: <row> when no requirement applies)
- [ ] TXXX Accessibility verification: automated scan + manual keyboard-only pass (implements FR-###, AC-###)
- [ ] TXXX Run quickstart.md validation (implements FR-###, AC-###)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — starts immediately
- **Foundational (Phase 2)**: depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: start after Foundational; then run in parallel (if staffed) or in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: depends on the targeted stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: starts after Foundational; no dependency on other stories
- **User Story 2 (P2)**: starts after Foundational; may integrate with US1 but stays independently testable
- **User Story 3 (P3)**: starts after Foundational; may integrate with US1/US2 but stays independently testable

### Within Each User Story

- Tests (if requested) MUST be written and FAIL before implementation
- Models before services; services before endpoints; core before integration; the story is complete before the next priority

### Parallel Opportunities

- Tasks marked [P] within a phase run in parallel (different files, no incomplete dependencies)
- Different stories may proceed in parallel by different team members after Foundational

---

## Parallel Example: User Story 1

```bash
# Launch the requested tests for User Story 1 together:
Task: "Unit test for [business rule] in tests/unit/[name].test.ts (implements FR-###, AC-###)"
Task: "Integration test for [module contract] in tests/integration/[name].test.ts (implements FR-###, AC-###)"

# Launch independent implementation tasks together:
Task: "[Task A] in [path A] (implements FR-###, AC-###)"
Task: "[Task B] in [path B] (implements FR-###, AC-###)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocking)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: test User Story 1 independently
5. Deploy or demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add each story → test independently → deploy/demo
3. Each story adds value without breaking earlier stories

---

## Notes

- [P] = different files, no dependencies
- [US#] maps tasks to stories for traceability
- Every task ends with `(implements FR-###, AC-###)` — or `(implements Complexity Tracking: <row>)` when no requirement genuinely applies (Principle I, rule 7 above)
- Commits and pull requests MUST reference spec and task identifiers (Principle I)
- Verify tests fail before implementing; commit after each task (or when a task genuinely cannot be split, commit each logical group, naming every task it covers). Each commit MUST reference the spec, plan, and task identifiers.
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence
