# Exception Register

This register is the record required by the **Exception register** clause of
`.specify/memory/constitution.md`. It exists so that a granted exception is
visible to a reviewer instead of living in a commit message or a code comment.

A row without a review date is not an exception. It is an undocumented
violation, and it MUST be resolved before the change is accepted.

## How to use

1. Add one row per exception, at the time the exception is granted, not later.
2. Name the constitution section exactly as it is written in the constitution,
   not as a paraphrase.
3. **Exact scope** MUST be narrow enough that a reviewer can check it: the
   module, path, or endpoint, and the condition under which it stops applying.
   "All code" and "for now" are not scopes.
4. An exception is granted by the approver named in the constitution's
   Exception register clause, and by no one else, unless an amendment names
   another approver.
5. When the review date arrives, resolve the row: close it, renew it with a new
   date and rationale, or escalate it as debt. An unresolved row past its review
   date MUST be escalated in the owning plan's Complexity Tracking table.

## Register

| ID | Principle / Section | Exact Scope | Rationale | Approver | Review Date | Status |
|----|--------------------|-------------|-----------|----------|-------------|--------|
| EX-001 | Dependency Governance | ClamAV, a file-upload antivirus scanner, as a **build-time and CI dependency of the intake path only** — never a runtime library import, never a bundled binary in the API or worker image. Scope ends if a streaming scan replaces the upload-time scan. | The rule prohibits a dependency absent from the Approved register. ClamAV is required by File Processing Rules but is not an application library: it runs as a separate process against the uploaded bytes, so importing it would add an unvetted library to the runtime image rather than satisfy the rule. | Repository owner (ADR-052) | 2026-10-05 | Active |
| EX-002 | Dependency Governance | Lighthouse CI as a **CI-only quality gate**, invoked by the pipeline against the deployed staging URL; never a runtime dependency and never installed into the application image. Scope ends when the pipeline is replaced. | The rule prohibits a dependency absent from the Approved register. Lighthouse CI asserts the Performance Budgets (LCP/INP/CLS) against rendered pages, which cannot run inside the application process; treating it as a runtime dependency would misdescribe what it does and would pull it into every image. | Repository owner (ADR-052) | 2026-10-05 | Active |

## Closed

Rows move here when the exception no longer applies, with the date it was
closed and what ended it.

| ID | Principle / Section | Closed On | How It Ended |
|----|--------------------|-----------|--------------|
| — | — | — | — |