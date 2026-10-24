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
| EX-001 | Technology Standards | ClamAV, a file-upload antivirus scanner, invoked by the intake path as a **separate scanning process at upload time** — never a runtime library import and never a bundled binary in the API or worker image. Scope ends if a streaming scan replaces the upload-time scan. | The rule prohibits a dependency absent from the Approved register. ClamAV is a row of the Approved register since 2.19.0, and this exception records the character of that row rather than its absence: the intake path invokes ClamAV as a separate process against the uploaded bytes and never imports it as a library. Importing it would add a runtime library the register does not approve and would misdescribe what the pipeline does. | Repository owner (ADR-052) | 2027-01-05 | Active |
| EX-002 | Technology Standards | Lighthouse CI as a **CI-only quality gate**, invoked by the pipeline against the deployed staging URL; never a runtime dependency and never installed into the application image. Scope ends when the pipeline is replaced. | The rule prohibits a dependency absent from the Approved register. Lighthouse CI is a row of the Approved register since 2.19.0, and this exception records the character of that row rather than its absence: it is a CI-only quality gate that measures rendered pages from outside the application process, which no runtime dependency can do. Treating it as a runtime dependency would misdescribe what it does and would pull it into every image. | Repository owner (ADR-052) | 2027-01-05 | Active |
| EX-003 | Technology Standards | Prometheus + Grafana as an **operations metrics service**, scraped over the network and never imported as a library or bundled into an application image. Scope ends if a managed metrics service replaces it. | The rule prohibits a dependency absent from the Approved register. The monitoring rule in Deployment and Observability already required a metrics stack; 2.19.0 names this one as the approved implementation, and an exception records that the obligation it carries is operational rather than shipped-code. | Repository owner (ADR-054) | 2027-01-05 | Active |
| EX-004 | Technology Standards | Semgrep OSS as a **CI-only SAST gate**, invoked by the pipeline against the source tree; never a runtime dependency and never installed into an application image. Scope ends if the pipeline's SAST step is replaced. | The rule prohibits a dependency absent from the Approved register. The supply-chain rule already required a SAST scan whose failures block release; that scan is a build-time judgement over source, not application code, so naming it in the register without this note would invite a runtime import it does not support. | Repository owner (ADR-054) | 2027-01-05 | Active |
| EX-005 | Technology Standards | osv-scanner as a **CI-only dependency-scanning gate**, invoked by the pipeline against the lockfile; never a runtime dependency and never installed into an application image. Scope ends if the pipeline's dependency-scan step is replaced. | The rule prohibits a dependency absent from the Approved register. The supply-chain rule already required a dependency vulnerability scan whose failures block release; it reads the lockfile and reports advisories, which is a build-time concern and not something an application links against. | Repository owner (ADR-054) | 2027-01-05 | Active |
| EX-006 | Technology Standards | pg_anonymize as a **staging-only data tool**, run against the staging dataset before it is seeded; never a runtime dependency, never installed into an application image, and never run against production. Scope ends if a managed anonymisation service replaces it. | The rule prohibits a dependency absent from the Approved register. The staging-parity rule already forbade production personal data in staging and named this tool as an implementation; it operates on a dataset between environments and has no place inside a running service. | Repository owner (ADR-054) | 2027-01-05 | Active |

## Closed

Rows move here when the exception no longer applies, with the date it was
closed and what ended it.

| ID | Principle / Section | Closed On | How It Ended |
|----|--------------------|-----------|--------------|
| — | — | — | — |