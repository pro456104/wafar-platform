# Decisions — Wafar

This file records design decisions with their alternatives and the reasoning
behind them. The constitution names it in References and in Design System
Standards, and Documentation requires every non-trivial decision to record
what was considered and why the chosen option won.

**Record duties (Documentation rule).** Every record below names the directory
that owns the decision and the feature that owns the work, per the Documentation
rule. Most were made by a constitutional amendment, but not all: ADR-001 to
ADR-007 were made during repository bootstrap on 2026-10-01, ADR-012 to ADR-013
were design-system and workflow decisions, and ADR-015 onward are governance
decisions ratified by the repository owner. The owning feature is one of
"none yet — repository bootstrap (pre-feature record)", "none — governance
decision; ratified by the repository owner", or the identifier of the slice that
first implements the decision. The bootstrap-era records state the reaffirmation
duty explicitly: the first feature whose plan depends on the record MUST name it
in that plan's Constitution Check, and from then on the record has a feature
owner.

A record is annotated when a later decision changes what it says, and corrected
when the record's own claim was wrong. Rewriting a ratified decision's substance
is not done; ADR-015 states that rule and this file follows it.

## Index

| ADR | Subject | Ratified | Constitution version |
|-----|---------|----------|---------------------|
| [ADR-001](#adr-001--monorepo-with-a-modular-monolith-api) | Monorepo with a Modular Monolith API | 2026-10-01 | — |
| [ADR-002](#adr-002--hono-for-the-api-framework) | Hono for the API framework | 2026-10-01 | — |
| [ADR-003](#adr-003--opensearch-for-the-search-engine) | OpenSearch for the search engine | 2026-10-01 | — |
| [ADR-004](#adr-004--better-auth-without-the-scim-and-sso-modules) | better-auth without `scim` and `sso` | 2026-10-01 | — |
| [ADR-005](#adr-005--seaweedfs-for-object-storage) | SeaweedFS for object storage | 2026-10-01 | — |
| [ADR-006](#adr-006--dark-mode-by-default) | Dark mode by default | 2026-10-01 | — |
| [ADR-007](#adr-007--project-level-knowledge-lives-outside-the-feature-sequence) | Project-level knowledge lives outside the feature sequence | 2026-10-01 | — |
| [ADR-008](#adr-008--project-level-registers-live-in-the-constitution-the-detail-stays-in-the-sources) | Registers live in the constitution; the detail stays in the sources | 2026-10-02 | 2.7.0 |
| [ADR-009](#adr-009--the-design-systems-own-decisions-recorded-out-of-its-source-comments) | The design system's own decisions, recorded out of its source comments | 2026-10-02 | 2.7.0 |
| [ADR-010](#adr-010--constitution-271-the-amendments-durable-record-and-the-review-fix-set) | The amendment's durable record, and the review-fix set | 2026-10-02 | 2.7.1 |
| [ADR-011](#adr-011--mirror-files-confirmed-as-valid-utf-8) | Mirror files confirmed as valid UTF-8 | 2026-10-02 | — |
| [ADR-012](#adr-012--design-system-101-font-stack-and-arabic-letter-spacing) | Design system 1.0.1: font stack and Arabic letter-spacing | 2026-10-02 | — |
| [ADR-013](#adr-013--converge-stays-a-separate-command-not-a-workflow-step) | Converge stays a separate command, not a workflow step | 2026-10-02 | — |
| [ADR-014](#adr-014--constitution-280-artifact-traceability-and-product-fact-clarifications) | Artifact traceability and product fact clarifications | 2026-10-02 | 2.8.0 |
| [ADR-015](#adr-015--the-slice-order-becomes-fifteen-slices-and-a-slice-identifier-equals-its-specification-number) | Fifteen slices; a slice identifier equals its specification number | 2026-10-03 | 2.9.0 |
| [ADR-016](#adr-016--the-icon-set-and-the-shell-belong-to-the-foundation-duties-of-r1) | The icon set and the shell belong to R1's foundation duties | 2026-10-03 | 2.9.0 |
| [ADR-017](#adr-017--shell-scope-and-the-sidebar-conflict) | Shell scope and the sidebar conflict | 2026-10-03 | 2.9.2 |
| [ADR-018](#adr-018--structure-registers-closed-the-gaps-left-by-principle-x-and-adr-017) | Structure registers closed the gaps left by Principle X and ADR-017 | 2026-10-03 | 2.9.2 |
| [ADR-019](#adr-019--one-domain-model-one-authority-and-the-register-defect-it-closes) | One domain model, one authority, and the register defect it closes | 2026-10-03 | 2.10.0 |
| [ADR-020](#adr-020--constitution-register-restored-to-its-own-rules) | Constitution register restored to its own rules | 2026-10-03 | 2.10.1 |
| [ADR-021](#adr-021--spec-kit-110-and-node-22-lts-pin) | Spec Kit 1.1.0 and Node 22 LTS pin | 2026-10-03 | 2.10.1 (unchanged) |
| [ADR-022](#adr-022--constitution-2102-audit-fixes) | Constitution 2.10.2 (audit fixes) | 2026-10-03 | 2.10.2 |
| [ADR-023](#adr-023--constitution-2110-security-hardening-anti-spam-static-design-enforcement-ops-controls) | Constitution 2.11.0: security hardening, anti-spam, static design enforcement, ops controls | 2026-10-03 | 2.11.0 |
| [ADR-024](#adr-024--constitution-2111-stylelint-named-in-technology-standards) | Constitution 2.11.1: Stylelint named in Technology Standards | 2026-10-03 | 2.11.1 |
| [ADR-025](#adr-025--the-segoe-ui-fallback-leaves-the-tajawal-font-stack) | The Segoe UI fallback leaves the Tajawal font stack | 2026-10-03 | 2.11.1 (unchanged) |
| [ADR-026](#adr-026--git-branching-workflow-extension-adopted-mandatory-feature-branches) | Git Branching Workflow Extension adopted; mandatory feature branches | 2026-10-03 | 2.11.1 (unchanged) |
| [ADR-027](#adr-027--audit-fix-set-adr-stamps-workflow-version-hook-state-cline-registration-css-token) | Audit fix set: ADR stamps, workflow version, hook state, cline registration, CSS token | 2026-10-03 | 2.11.1 (unchanged) |
| [ADR-028](#adr-028--constitution-2120-quota-window-and-contact-message-path) | Constitution 2.12.0: quota window, contact-message path | 2026-10-03 | 2.12.0 |
| [ADR-029](#adr-029--roadmap-dependency-and-ownership-corrections) | Roadmap dependency and ownership corrections | 2026-10-03 | 2.12.0 |
| [ADR-030](#adr-030--constitution-2130-phone-only-authentication) | Constitution 2.13.0: phone-only authentication | 2026-10-03 | 2.13.0 |
| [ADR-031](#adr-031--roadmap-audit-fix-set) | Roadmap audit fix set | 2026-10-04 | 2.13.0 (unchanged) |
| [ADR-032](#adr-032--roadmap-second-audit-fix-set) | Roadmap second audit fix set | 2026-10-04 | 2.13.0 (unchanged) |
| [ADR-033](#adr-033--audit-fix-set-full-name-cascade-ownership-entry-point-dependency-budget-analyze-wording-mirror-claims-cleanup) | Audit fix set: full name, cascade ownership, entry point, dependency budget, analyze wording, mirror-claims cleanup | 2026-10-04 | 2.14.0 |
| [ADR-034](#adr-034--constitution-2150-metrics-stack-dependency-scanner-staging-anonymiser-and-the-optional-web-server-directory) | Constitution 2.15.0: metrics stack, dependency scanner, staging anonymiser, optional web-server dir | 2026-10-04 | 2.15.0 |
| [ADR-035](#adr-035--constitution-2151-encoding-repair-and-utf-8-verification-note) | Constitution 2.15.1: encoding repair and UTF-8 verification note | 2026-10-04 | 2.15.1 |
| [ADR-036](#adr-036--constitution-2152-audit-fix-set--quota-invariant-breakpoint-table-wording-mirror-omissions-roadmap-fact-rows) | Audit fix set: quota invariant, breakpoint table wording, mirror omissions, roadmap fact rows | 2026-10-04 | 2.15.2 |
| [ADR-037](#adr-037--constitution-2160-design-values-carve-out-p95-budgets-sidebar-icon-rail-two-cmv-rows) | Constitution 2.16.0: design-values carve-out, p95 budgets, sidebar icon rail, two CMV rows | 2026-10-04 | 2.16.0 |
| [ADR-038](#adr-038--constitution-2170-register-gaps-clamavlighthouse-ci-role-split-and-defined-terms) | Constitution 2.17.0: register gaps, ClamAV/Lighthouse CI, role split, reprocess/trade-name/reports/cart-name terms | 2026-10-04 | 2.17.0 |
| [ADR-039](#adr-039--repository-line-ending-and-encoding-policy-recorded-mirror-stops-restating-rules-fallback-templates-labelled) | Repository line-ending and encoding policy recorded; mirror stops restating rules; fallback templates labelled | 2026-10-04 | — (unchanged) |
| [ADR-040](#adr-040--the-canonical-columns-of-a-part-its-price-and-the-original-number) | The canonical columns of a part: its price, and the original number | 2026-10-05 | 2.18.0 |
| [ADR-041](#adr-041--registration-is-libya-only-and-the-dial-code-selector-is-removed) | Registration is Libya only, and the dial-code selector is removed | 2026-10-05 | 2.18.0 |
| [ADR-042](#adr-042--no-emoji-in-user-facing-text-and-an-open-source-svg-icon-set) | No emoji in user-facing text, and an open-source SVG icon set | 2026-10-05 | 2.18.0 |
| [ADR-043](#adr-043--supplier-names-are-normalised-and-never-merged-by-normalisation) | Supplier names are normalised, and never merged by normalisation | 2026-10-05 | 2.18.0 |
| [ADR-044](#adr-044--constitution-2181-part-name-year-ranges-stay-in-the-name) | Constitution 2.18.1: part-name year ranges stay in the name | 2026-10-05 | 2.18.1 |
| [ADR-045](#adr-045--constitution-2182-cart-label-diacritics-unused-token-note-price-shape) | Constitution 2.18.2: cart label, diacritics, unused-token note, price shape | 2026-10-05 | 2.18.2 |
| [ADR-046](#adr-046--constitution-2183-notification-admin-reply-unused-shadow-ladder-note) | Constitution 2.18.3: notification admin-reply, unused shadow ladder note | 2026-10-05 | 2.18.3 |
| [ADR-047](#adr-047--audit-fix-set-commit-state-manifest-hashes-cart-label-filter-set-stamp-sites) | Audit fix set: commit state, manifest hashes, cart label, filter set, stamp sites | 2026-10-05 | 2.18.4 |
| [ADR-048](#adr-048--cline-integration-retired-constitution-2185-bom-repair-mirror-label-completion) | Cline integration retired; Constitution 2.18.5; BOM repair; mirror label completion | 2026-10-05 | 2.18.5 |
| [ADR-049](#adr-049--constitution-2187-consolidate-the-unrecorded-2186-and-2187-amendments-and-repair-the-registry-drift-they-exposed) | Constitution 2.18.7: consolidate the unrecorded 2.18.6 and 2.18.7 amendments, and repair the registry drift they exposed | 2026-10-05 | 2.18.7 |
| [ADR-050](#adr-050--constitution-2188-audit-fix-set--the-stamp-set-committed-and-the-registry-claims-that-failed-verification) | Constitution 2.18.8: audit fix set — the stamp set committed, and the registry claims that failed verification | 2026-10-05 | 2.18.8 |
| [ADR-051](#adr-051--a-tenant-is-a-merchant-account) | A tenant is a merchant account | 2026-10-05 | 2.18.8 |
| [ADR-052](#adr-052--the-two-granted-dependency-exceptions-are-recorded-in-the-exception-register) | The two granted dependency exceptions are recorded in the exception register | 2026-10-05 | 2.18.8 |
| [ADR-053](#adr-053--constitution-2189-the-design-system-enforcement-scope-the-motion-scale-the-scoping-contradiction-and-the-register-counts-that-failed-verification) | Constitution 2.18.9: enforcement scope, motion scale, scoping contradiction, register counts | 2026-10-05 | 2.18.9 |
| [ADR-054](#adr-054--constitution-2190-the-register-names-its-four-gates-and-the-amendment-procedure-names-its-own-stamp-sites) | Constitution 2.19.0: the register names its four gates, and the amendment procedure names its own stamp sites | 2026-10-05 | 2.19.0 |
| [ADR-055](#adr-055--audit-fix-set-range-string-drift-a-stale-template-hash-an-assess-hook-conflict-and-the-mirror-sync-that-was-left-unrecorded) | Audit fix set: range-string drift, a stale template hash, an assess hook conflict, and the mirror sync that was left unrecorded | 2026-10-06 | 2.19.0 |
| [ADR-056](#adr-056--constitution-2191-section-name-references-glossary-terms-and-the-register-gap-classification) | Constitution 2.19.1: section-name references, glossary terms, and the register-gap classification | 2026-10-06 | 2.19.1 |
| [ADR-057](#adr-057--constitution-2192-the-audit-findings-re-verified-and-the-design-systems-token-rule-enforced) | Constitution 2.19.2: the audit findings re-verified, and the design system's token rule enforced | 2026-10-06 | 2.19.2 |
| [ADR-058](#adr-058--constitution-2200-the-writing-direction-rules-value-form-two-register-levels-and-the-decision-records-that-failed-verification) | Constitution 2.20.0: the writing-direction rule's value form, two register levels, and the decision records that failed verification | 2026-10-06 | 2.20.0 |
| [ADR-059](#adr-059--constitution-2210-two-tools-the-rules-already-required-and-the-mirror-claims-that-contradicted-the-register) | Constitution 2.21.0: two tools the rules already required, and the mirror claims that contradicted the register | 2026-10-06 | 2.21.0 |
| [ADR-060](#adr-060--constitution-2220-the-design-systems-register-against-its-own-file-the-files-binding-rules-and-the-citations-that-named-the-wrong-section) | Constitution 2.22.0: the design system's register against its own file, the file's binding rules, and the citations that named the wrong section | 2026-10-06 | 2.22.0 |
| [ADR-061](#adr-061--the-in-flight-clarifications-recorded-and-the-reserved-decision-the-one-phrasing-pre-empted) | The in-flight clarifications recorded, and the reserved decision the one phrasing pre-empted | 2026-10-06 | 2.22.0 (unchanged) |
| [ADR-062](#adr-062--constitution-2221-wording-only-reference-precision-and-stamp-sync) | Constitution 2.22.1: wording-only reference precision and stamp sync | 2026-10-06 | 2.22.1 |
| [ADR-063](#adr-063--constitution-2230-the-form-metrics-register-corrected-against-its-source-and-the-amendment-closed) | Constitution 2.23.0: the form-metrics register corrected against its source, and the amendment closed | 2026-10-07 | 2.23.0 |
| [ADR-064](#adr-064--constitution-2231-and-wafar-single-css-121-the-audit-fix-set) | Constitution 2.23.1 and wafar.single.css 1.2.1: the audit fix set | 2026-10-07 | 2.23.1 |
| [ADR-065](#adr-065--css-header-workflow-hint-and-r2-scope-defect-fix-set) | CSS header, workflow hint, and R2 scope defect fix set | 2026-10-07 | 2.23.1 (unchanged) |
| [ADR-066](#adr-066--constitution-2240-the-version-lives-in-two-sources-and-the-opensearch-client-owner) | Constitution 2.24.0: the version lives in two sources, and the OpenSearch client owner | 2026-10-07 | 2.24.0 |
| [ADR-067](#adr-067--constitution-2250-the-administrator-is-a-role-userstatus-and-two-new-entities) | Constitution 2.25.0: the administrator is a role, `User.status`, and two new entities | 2026-10-07 | 2.25.0 |
| [ADR-068](#adr-068--integration-topology-settled-and-the-constitution-command-aligned-to-upstream) | Integration topology settled, and the constitution command aligned to upstream | 2026-10-07 | 2.25.0 (unchanged) |
| [ADR-069](#adr-069--cross-artifact-consistency-fix-set) | Cross-artifact consistency fix set | 2026-10-08 | 2.25.0 (unchanged) |
| [ADR-070](#adr-070--part-tenancy-and-a-clarification-set) | Part tenancy, and a clarification set | 2026-10-08 | 2.26.0 |

---

## ADR-001 — Monorepo with a Modular Monolith API

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** One product with three surfaces (public site, merchant area,
separate administrator application) plus a file-processing worker; the
frontend and backend must share validation schemas so the two contracts
cannot drift (Principle II). The team is small. A future extraction into
microservices should be mechanical rather than a rewrite (Principle X
rationale).

**Decision.** A single repository, managed with pnpm workspaces and
Turborepo, holding `apps/web`, `apps/admin`, `apps/api`, `apps/worker` and
`packages/shared`, `packages/db`, `packages/search`, `packages/config`. The
API is one deployable server divided into ten modules (`auth`, `users`,
`catalogs`, `parts`, `suppliers`, `bookmarks`, `notifications`, `messages`,
`support`, `admin`), each with its own routes, service, and repository;
communication between modules goes through the shared package only.

**Alternatives considered.**
- *Polyrepo (one repository per app).* Rejected: shared schemas would have to
  be published and versioned across repositories, which reintroduces exactly
  the frontend/backend drift that the shared-schema rule exists to prevent;
  cross-repo coordination also adds process with no scale benefit today.
- *Microservices from day one.* Rejected: independent deployment and scaling
  are not needed at the current scale; the operational surface (service
  discovery, per-service observability, distributed failure modes) is
  unjustified, and a modular monolith keeps extraction available later.

**Consequences.** Import boundaries must be enforced mechanically
(enforcement configuration committed with the codebase); each feature
registers its owned directories in its plan's ownership map; shared code is
promoted only after a second consumer exists. Replacing this architecture
would require a constitutional amendment (Principle X / Technology Standards).

---

## ADR-002 — Hono for the API framework

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** The API is a Modular Monolith that must serve the catalog, the
merchant area, and the administrator application; the API contract must be
documented and must not drift from the code.

**Decision.** Hono (4.13.5 per `Project-Technologies.txt`) as the API
framework, with OpenAPI documentation generated from the same code.

**Rationale.** Hono is lightweight with very high throughput on Node.js
(88,525 requests/second in the 2026 benchmarks recorded in
`Project-Technologies.txt`), first-class TypeScript support, and it keeps the
runtime portable (Node.js, Bun, Deno, and edge runtimes). Generating OpenAPI
from the same code removes the drift between hand-written documentation and
the implementation.

**Alternatives considered.**
- *Express.* Rejected: the largest ecosystem, but slower and with weaker
  built-in typing; OpenAPI support requires add-on layers that add dependency
  surface without adding product value.
- *Fastify.* Rejected: fast and schema-oriented, but the plugin ecosystem and
  third-party OpenAPI bindings broaden the dependency surface; switching
  would also require a constitutional amendment, since Technology Standards
  binds Hono.

**Consequences.** Validation stays in shared Zod schemas rather than in
framework-specific schema objects; the framework boundary is kept thin so the
choice remains replaceable in principle — but only through an amendment.

**Annotation (2026-10-04).** ADR-033 replaced the precise benchmark figure in
`Project-Technologies.txt` with neutral wording, so the "88,525
requests/second" recorded in this decision's Rationale is now historical and
is no longer reproduced in the mirror.

---

## ADR-003 — OpenSearch for the search engine

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** Arabic root-aware search is a core product requirement
(طرمبة → طرمبات — Principle V): a search that matches only surface forms does
not satisfy the rule. The index lifetime must align with the 90-day automatic
deletion rule, and every dependency shipped to merchants must pass the
licence test in Dependency Governance.

**Decision.** OpenSearch with its built-in Arabic analyzer (plus
`icu_analyzer` for normalization) and Index Lifecycle Management, with the
client and index mappings owned by `packages/search`.

**Rationale.** The Arabic analyzer ships with OpenSearch — no external plugin
to maintain; ILM expresses the 90-day index lifecycle natively; and the
licence is Apache 2.0, which imposes no disclosure, licensing, or relicensing
obligation on the merchant's own data or source.

**Alternatives considered.**
- *Elasticsearch.* Rejected: same lineage of technology, but the Elastic
  Licence and SSPL are on the Dependency Governance list that MUST NOT be
  introduced into a module shipped to a merchant.
- *PostgreSQL full-text search alone.* Rejected for the search surface: it
  has no root-aware Arabic analyzer, so it cannot satisfy the root-resolution
  rule without building custom analysis work that OpenSearch already ships.
- *Meilisearch / Typesense.* Rejected: simpler operations, but less control
  over Arabic analysis quality, and neither is part of the defined stack.

**Consequences.** The search index is a projection of the system of record
and is maintained by the worker; PostgreSQL remains authoritative. Search
ranking beyond the sortable columns remains a deferred area (retrieval
interface) whose ratification is recorded by the first feature that needs it.

---

## ADR-004 — better-auth without the `scim` and `sso` modules

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** Authentication MUST use the designated proven library, and
custom authentication code is prohibited. The optional `scim` and `sso`
modules carry tracked advisories: CVE-2026-67330 in `@better-auth/scim`
(authorization bypass) and CVE-2026-80192 in `@better-auth/sso`
(`Project-Technologies.txt`, better-auth 1.6.14). The product's users are
Libyan merchants who sign in with a mobile number and password (email removed by ADR-030); enterprise SSO and
directory provisioning are not product requirements.

**Decision.** better-auth, core modules only. The `scim` and `sso` modules
are NOT enabled — the constitution requires that they MUST NOT be enabled
while the CVEs are tracked.

**Alternatives considered.**
- *Enabling `scim`/`sso` anyway.* Rejected: exploitable authorization
  surface with zero current product need.
- *Custom authentication.* Rejected: prohibited by the constitution, and a
  security-critical surface the project should not own.
- *Deferring the decision.* Rejected: the first feature that exposes an
  authentication endpoint must already enforce rate limits and secure
  sessions, so the library decision precedes the first feature.

**Consequences.** Authentication features record, under Constitution
Mandated Values: the password hashing cost factor (Argon2id, bcrypt, or
scrypt); the authentication rate limits; and the session timeout and token
lifetime. CSRF protection, output encoding, and security-header tests are due
no later than the first browser-facing feature.

---

## ADR-005 — SeaweedFS for object storage

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** Uploaded supplier catalogs must be stored as objects: typically
1–4 MB, large files 10–15 MB, exceptionally up to 20 MB, hard maximum 100 MB,
up to 100 files per user, deleted automatically after 90 days. The store must
pass the Dependency Governance licence test and have an active upstream.

**Decision.** SeaweedFS (v4.48 per `Project-Technologies.txt`), Apache 2.0,
as the object store for catalog files.

**Rationale.** SeaweedFS handles very large numbers of small files
efficiently — exactly the product's workload — carries the Apache 2.0 licence
with no data-disclosure obligation, and remains actively developed. MinIO
development was discontinued in April 2026, and its licence is AGPLv3, which
the Dependency Governance list forbids in a module shipped to a merchant.

**Alternatives considered.**
- *MinIO.* Rejected on both counts: discontinued upstream (April 2026) and
  AGPLv3 — a licence obligation the constitution's list excludes from
  merchant-shipped modules.
- *Plain filesystem volume on the application host.* Rejected: it weakens the
  backup/restore and staging-parity obligations (Deployment and
  Observability) and removes the storage boundary that keeps file bytes out
  of the database path.

**Consequences.** The file-ingestion internals — exact content-type
validation, object-storage layout, and cross-merchant isolation — remain a
deferred area; the first feature that implements ingestion records the
missing rules and their ratification in its plan's Constitution Check.

---

## ADR-006 — Dark mode by default

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** The design system is one file, `wafar.single.css`, composed of
fourteen modules, and it is the only permitted source of design values.
Principle IX fixes the default mode, the palette, and the toggle's location.

**Decision.** Every page renders in dark mode by default; light mode is used
only when the user has explicitly chosen it; the mode toggle sits in the
header, adjacent to the notifications icon. All colours, spacing, motion, and
elevation values come from the design system tokens (`--brand-600`,
`--accent-500`, dark background `#0a0a0a`, surface `#121416`, primary text
`#fafafa`).

**Rationale.** Dark-first is the product's visual identity and is what the
design system's contrast scales were built and verified against; a single
default prevents the two-token drift that appears when both modes are treated
as equal first-class outputs. AA contrast holds in both modes per the design
system's accessibility rules.

**Alternatives considered.**
- *Light mode as default.* Rejected: contradicts Principle IX and the design
  system's dark-first tuning.
- *Following the operating system's preference automatically.* Rejected: the
  rule is an explicit user choice; the system default is dark, not "whatever
  the device prefers".
- *No toggle at all.* Rejected: users must be able to choose light
  explicitly, and the toggle's position is specified in the design
  requirements.

**Consequences.** Every page must default to dark on first render; the
mechanism that remembers the explicit choice is decided by the implementing
feature's plan and must stay inside the design system's rules.

---

## ADR-007 — Project-level knowledge lives outside the feature sequence

**Status**: Accepted — 2026-10-01
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** Spec Kit's core workflow loads only two things into a feature cycle:
the feature specification and `.specify/memory/constitution.md`. The knowledge
that is true for the whole product — repository and module layout, the technology
stack, the design system, the product definition, and the accepted decisions — is
not loaded by the core workflow. In a previous project this knowledge was
classified as an ordinary numbered feature (a design system appearing as feature
020). That classification makes the agent treat a project-wide rule as a piece of
work, so later features re-invent what already exists and the rules drift.

**Decision.** Project-level knowledge is recorded once, outside the feature
sequence, and is referenced by name from every feature artifact:

| Concern | Location |
|---|---|
| Engineering law, product scope, limits | `.specify/memory/constitution.md` |
| Repository and module layout | `docs/architecture.md` |
| Technology stack | `Project-Technologies.txt` |
| Design system (tokens and components) | `wafar.single.css` |
| Product definition (roles, pages, acceptance criteria) | `Core-Project.txt` |
| Accepted decisions | `docs/DECISIONS.md` |
| Slice order for the MVP | `ROADMAP.md` |

No project-level concern receives a feature number. Enforcement uses the layers
Spec Kit actually guarantees, without amending the constitution:

1. `.specify/memory/constitution.md` is loaded by every core command — the core
   workflow reads it in specify, plan, tasks, implement, analyze, clarify,
   checklist, and converge.
2. The three feature templates in `.specify/templates/overrides/` carry the
   binding "Project Context Sources" that name these files. The override stack
   resolves them as the top layer with `strategy: replace`, and the setup scripts
   materialize them into every feature (`create-new-feature.ps1`,
   `setup-plan.ps1`, `setup-tasks.ps1`), so each specification, plan, and task
   list is written against them.
3. `AGENTS.md` states the same duty to the agent outside the feature cycle.

   **Annotation (2026-10-05, ADR-048).** This item originally named
   `.clinerules/project-context.md` alongside `AGENTS.md`. That directory was
   retired with the Cline integration in ADR-048 and no longer exists; the duty
   is carried by `AGENTS.md` alone. The item is annotated rather than rewritten,
   because a decision record is a history.

**Alternatives considered.**
- *Amend the constitution to add a "read these files" MUST.* Rejected: the
  constitution is loaded already, but a rule there would put file-reading
  mechanics into the document that governs principles, and would require an
  amendment for every change to the source list. The override templates are the
  artifact-level layer for exactly this.
- *Register an `optional: false` extension hook per command.* Rejected: a hook
  executes a command; it does not itself load files, and a hook naming a command
  no installed extension provides would be broken. The general hooks in
  `.specify/extensions.yml` are therefore left empty.
- *Restate the stack, architecture, and design rules inside each feature plan.*
  Rejected: this is the repetition the decision exists to remove; it is what
  produced the drift already observed between the artifacts' pinned versions.

**Consequences.** A feature named after a project-level concern is a
classification error and MUST NOT be created. The specification template binds
product-level sources only, because naming technical sources in a specification
would breach Principle VII; the plan template binds every source. When the
constitution is amended, `docs/architecture.md` and the override templates MUST
be updated in the same change — they name its version, and a stale reference is a
drift defect.

---

## ADR-008 — Project-level registers live in the constitution; the detail stays in the sources

**Status**: Accepted — 2026-10-02
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** Spec Kit's plan command loads exactly two documents into a feature
cycle: the feature specification and the constitution. The project's technology
stack, design-system structure, and product facts lived only in files that no
command reads (`Project-Technologies.txt`, `wafar.single.css`, `Core-Project.txt`),
so every plan restated them and the restatements drifted. ADR-007 accepted that
arrangement and explicitly rejected both amending the constitution to add a "read
these files" rule and restating the stack, architecture, and design rules inside
each feature plan.

**Decision.** The constitution carries the *register* of each project-level
concern, and the referenced source keeps the *detail*:

- `Technology Standards` is the register of the approved stack, plus the
  repository topology, the internal layout, the MAJOR/MINOR version rule, the gaps
  a slice MUST close with a named owning slice, and the infrastructure licence
  treatment. `Project-Technologies.txt` becomes its mirror.
- `Design System Standards` is the register of the design system: the fourteen
  module map, the token families, the breakpoints, the component inventory, the
  state map, the components the product needs and the system lacks, the
  invariants, the fonts and framework bridge, the extension procedure, and the
  honoured media states. `wafar.single.css` remains the only source of design
  values, and no value is copied into the constitution.
- `Product Register` (new) carries roles, pages, features, entities, and the
  conflicts found between the sources.
- `Single-Reference Sufficiency` (new) makes the rule explicit: a feature MUST NOT
  need a source outside the constitution for any rule it must obey.

**Alternatives considered.**
- *Copy both source files verbatim into the constitution.* Rejected. Measured: the
  constitution is 57 KB, `wafar.single.css` alone is 128 KB and holds 415 tokens,
  290 class names, and 30 keyframes. The copy would load ~198 KB into every
  command, and every design value would have two sources — the drift this record
  exists to prevent.
- *Edit the command instructions so they load the files.* Rejected as the primary
  mechanism: Spec Kit materializes command files at install time, so a hand-edited
  command is reverted by an upgrade or a preset install. The supported layers for
  that change are a preset (`commands/`) or a project-local override
  (`templates/`), resolved before the core layer.
- *Keep ADR-007's arrangement and rely on `AGENTS.md` and the template
  overrides.* Rejected: `AGENTS.md` is not in any command's load list, and the plan
  command's load list is the specification plus the constitution only. Nothing
  enforced the reading, which is why the repetition occurred.

**Consequences.** A register is a map and MUST NOT become a copy; duplicating a
source into the constitution is a drift defect. A register gap is recorded with a
named owning slice rather than closed by naming an unvetted library. Register
changes require an amendment, which is the intended cost of a single reference.
`.specify/templates/overrides/constitution-template.md` pins this document's
structure so a constitution run cannot collapse it. ADR-007 stands for its
remaining part: a project-level concern never receives a feature number.

**Follow-up (deferred, recorded rather than silent).** Converting the plan and
spec templates' HTML-comment instruction block into a normative Markdown section
is deferred: a comment-scoped instruction block is the upstream idiom (the core
templates use "ACTION REQUIRED" comments for their own instructions), and the
block is now marked NORMATIVE in place.

---

## ADR-009 — The design system's own decisions, recorded out of its source comments

**Status**: Accepted — 2026-10-02
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** The header of `wafar.single.css` says the design system is documented
in `docs/DECISIONS.md`, but its decisive choices live in its own source comments
instead: the neutral ladder decision (not the `gray` ladder), `gray` and `zinc`
re-pointed at that ladder, `accent` defined as the sky ladder, `info` defined as a
synonym of `brand`, the radius ladder aligned to Tailwind with `xl` = 1rem and
`2xl` = 1.5rem, the choice of the lighter shadow values, the z-index decision to
adopt 80..170 and drop the 1000..1080 ladder, and the reduction to six loader
designs. The file also declares eight `--screen-*` tokens that no media query
consumes, and its header points at `specs/001-wafar-design-system/spec.md` and
`node scripts/bundle.mjs`, neither of which exists in this repository.

**Decision.** The decisions above are recorded here, and `Design System Standards`
in the constitution carries the register of the system. The design system keeps a
single implementation file, and it is not re-created as a numbered feature.

**Alternatives considered.**
- *Re-create the design system as a numbered feature.* Rejected: the file is the
  implementation, not a piece of work. Numbering it would make the agent treat a
  project-wide rule as a deliverable, which is the classification error ADR-007
  names.
- *Leave the decisions in the source comments.* Rejected: a decision whose
  rationale appears only in a comment is not recorded, and the file's own header
  already points here for them.

**Consequences.** The header of `wafar.single.css` MUST name this record and MUST
remove the references to the non-existent specification and bundle script, and it
MUST declare the design system's own version. The eight declared-but-unused
`--screen-*` tokens MUST be consumed or removed under Project Structure and Debt
Control before the first surface relies on a breakpoint.

---
## ADR-010 — Constitution 2.7.1: the amendment's durable record, and the review-fix set

**Status**: Accepted — 2026-10-02
**Owning directory**: `docs/`
**Owning feature**: none yet — repository bootstrap (pre-feature record); the first feature whose plan depends on it MUST name this ADR in its Constitution Check

**Context.** Amendment 2.7.0 was reviewed and seven defects were confirmed:

1. The sync impact report block was committed although its own text names it
   scratch material to be removed, and it restated four MUSTs the document
   already states, which the analyze command extracts into the rule set.
2. Product Register called `Core-Project.txt` the product's "full definition"
   while also calling it a mirror and giving the register precedence.
3. References described three files as "complete" while the sections call them
   mirrors, and described `Project-Technologies.txt` as "the complete technology
   stack" after that file had been reduced to a pointer.
4. The Breakpoints paragraph named only `--screen-xs` as unconsumed, when the
   stylesheet contains no `var(--screen-*)` reference at all: the whole
   eight-token ladder is declared and unused.
5. The design-system version was mandated twice, in Constitution Mandated Values
   and in the design-system extension procedure.
6. "flagged" in File Processing had no representation and conflicted with the
   closed four-value status enum.
7. One normative sentence was duplicated verbatim in Principle IX and in the
   design-system state map.

The technology detail (exact versions, per-technology notes, repository trees)
had also become readable only through git history, because the file had been
reduced to a pointer.

**Decision.**
- The sync impact report MUST NOT be committed. The amendment procedure in
  Governance now states this, and the durable record of an amendment is an entry
  in this file. This PATCH therefore records its own clarifications here rather
  than in a comment block.
- `Project-Technologies.txt` is restored as the **detail** of the register:
  exact versions, per-technology notes, and repository trees. It carries no rule;
  the register keeps the gaps, the version-change rule, and the licence
  treatment. Completeness without a second source of rules.
- The seven defects are corrected in place. `wafar.single.css` is untouched: its
  4294 lines, fourteen modules, 415 unique tokens, 290 classes, and 30 keyframes
  are unchanged; only its header changed, in 2.7.0.

**Alternatives considered.**
- *Leave the sync impact report in place.* Rejected: it contradicts its own text
  and injects duplicate MUSTs into the rule set analyze extracts.
- *Keep `Project-Technologies.txt` as a pointer.* Rejected by the requirement
  that the technology detail stay complete and readable in the working tree; a
  pointer preserves recoverability but not readability.
- *Restore the technology detail into the constitution instead of the mirror.*
  Rejected: it would re-inflate the document every command loads (measured: 76 KB
  today against a 128 KB source) and give the version facts two homes.

**Consequences.** A future amendment records itself as an ADR rather than as a
comment block, so the document opens with its title. The mirror's rule is
enforceable by review: it MUST NOT name a technology the register does not name,
and MUST NOT restate a rule. The `--screen-*` ladder now carries a binding
mapping table, and the first surface that wires a token must delete the tokens it
leaves unused.

**Annotation (2026-10-04).** The counts above (4294 lines, 415 unique tokens,
290 classes, 30 keyframes) were measured on design-system v1.0.0. After
ADR-012's v1.0.1 edits the file is 4291 lines and still carries fourteen
modules and 30 keyframes. The historical figures remain here as the v1.0.0
record.

---
## ADR-011 — Mirror files confirmed as valid UTF-8

**Status**: Accepted - 2026-10-02
**Owning directory**: `docs/`
**Owning feature**: none yet - repository bootstrap (pre-feature record)

**Context.** During a constitution audit, the mirror files `Core-Project.txt`
and `Project-Technologies.txt` appeared garbled when inspected through a
Windows console with a non-UTF-8 code page. The suspicion was that they were
mis-encoded.

**Decision.** A byte-level inspection confirmed both files are valid UTF-8
with correct Arabic content (`\u0600-\u06FF` decodable, Arabic substrings
present). No re-encoding was performed. The garbled output was a console
display artifact, not a file defect. Both files, `docs/DECISIONS.md`, and the
constitution itself remain UTF-8; any future tooling that reads them MUST
decode as UTF-8.

**Consequences.** No change to file contents. The mirror-precedence rule
(constitution wins over `Core-Project.txt` and `Project-Technologies.txt`)
is unchanged.

---

## ADR-012 — Design system 1.0.1: font stack and Arabic letter-spacing

**Status**: Accepted - 2026-10-02
**Owning directory**: `wafar.single.css` (root) · register: constitution Principle IX and Design System Standards
**Owning feature**: none yet - repository bootstrap (pre-feature record)

**Context.** The audit found two drifts between `wafar.single.css` and the
constitution: the font stacks carried `Inter`, `Poppins`, and `Fira Code`
as fallbacks (the constitution permits only Tajawal, Noto Sans Arabic, and
JetBrains Mono), and Arabic body text carried positive letter-spacing
(`--text-body-letter-spacing: 0.01em`, `--tracking-wide: 0.01em`, and a
`0.005em` rule on `.dark body`), which Principle V prohibits for Arabic text.

**Decision.** `wafar.single.css` version 1.0.1:
- Font stacks reduced to the permitted families; `Inter`, `Poppins`, and
  `Fira Code` removed from the stacks.
- Body letter-spacing set to `0` for both the token and the dark-mode rule.
- The positive tracking tokens kept only where the comment scopes them to
  Latin/caps labels (`--tracking-caps`, `--tracking-brand`, `--tracking-display`),
  never applied to Arabic text.
- ROADMAP updated: R4 owns the Home four-cards question from the unresolved-facts
  table, so the conflict has an owning slice.

**Consequences.** Any future positive letter-spacing on an Arabic surface is a
Principle V/IX violation, not a preference. The version bump is recorded here as
required by the extension procedure.

**Identifier note.** The slice identifier in the decision above ("R4") is
historical and does not match ADR-015's renumbering table, whose old `R4` row is
the Catalog page (now R6). The question this record assigns — who owns the Home
four-cards decision — is now owned by **R5**, the parts-search slice, as
`ROADMAP.md` → Notes and the constitution's Product Register record. The
decision itself is unchanged; only the identifier moved.

---

## ADR-013 — Converge stays a separate command, not a workflow step

**Status**: Accepted - 2026-10-02
**Owning directory**: `.specify/workflows/`
**Owning feature**: none yet - repository bootstrap (pre-feature record)

**Context.** Spec Kit v1.0.13 ships the SDD workflow
(`workflows/speckit/workflow.yml`) as specify → review gate → plan → review gate →
tasks → implement. The `/speckit.converge` command exists in core and is documented
as a separate, append-only step run after `/speckit.implement`, repeated until it
reports Converged. An audit asked whether converge should be added to
`.specify/workflows/speckit/workflow.yml`.

**Decision.** Converge is a separate command in the binding cycle, never a step
in the engine's fixed list. `/speckit.implement` and `/speckit.converge`
are repeated as a loop (implement ↻ converge ↻ implement ↻ .) until convergence.
Converge is inherently conditional — it needs the current `tasks.md` state, not a
fixed input — so it does not fit a static step list, and encoding a conditional
step as a fixed one would make the workflow file claim to converge when it
cannot.

   **Annotation (2026-10-05, audit follow-up).** This Decision originally read
   "keeps converge outside the workflow file, matching upstream v1.0.13
   exactly". Both halves were inaccurate. The pin moved to v1.1.0 in ADR-021,
   and the workflow file *does* carry converge: `.specify/workflows/speckit/workflow.yml:139-140`
   declares `converge` as a step, annotated at line 145 as repeating with
   `implement`. The separation that was decided still holds — `converge` remains a
   distinct command and a distinct step, not a phase merged into `implement` — but
   "outside the workflow file" was never true of the file this record names as its
   Owning directory. The sentence is corrected rather than annotated, because the
   claim was the defect.

**Annotation (2026-10-03).** The pinned Spec Kit install has since moved to v1.1.0 (ADR-021); "matching upstream v1.0.13 exactly" is historical. The shape this record fixed -- converge as a separate CLI command outside the workflow engine's step list -- is unchanged: `/speckit.converge` remains a separate command, and `.specify/workflows/speckit/workflow.yml` (v1.1.0) lists it in the cycle only so the binding order reads as one sequence.

**Consequences.** Project docs that list the loop (AGENTS.md workflow note,
README) MUST show implement → converge as a repeatable pair. Any future desire
to make converge a workflow step requires a new ADR revisiting this one.

---

## ADR-014 — Constitution 2.8.0: artifact traceability and product fact clarifications

**Status**: Accepted - 2026-10-02
**Owning directory**: `.specify/memory/`
**Owning feature**: none yet - repository bootstrap (pre-feature record)

**Context.** A project audit found workflow rules and product facts present in
templates, roadmap notes, ADRs, and `Core-Project.txt` but not yet bound by the
constitution itself. Those rules were therefore visible to humans but not
reliably enforced by Constitution Check, `/speckit.analyze`, or `/speckit.converge`.

**Decision.** Add binding, additive-only material to
`.specify/memory/constitution.md` as v2.8.0: stable `SC-###` identifiers, the cap
on `NEEDS CLARIFICATION`, test-first when requested, reference tails on tasks,
repeat Constitution Check after Phase 1, the implement/converge loop, ADR
reaffirmation, UTF-8 artifact handling, one index mapping owner, sub-spec
`Input` convention, and product fact clarifications for contact fields, free
merchant use, full-cart notice, messaging visibility, and header controls.

**Consequences.** No existing principle is removed or redefined. Templates,
README, ROADMAP, AGENTS.md, and architecture notes must point to the
constitution as the authoritative source for these rules and carry v2.8.0 /
ADR-001 … ADR-014 references.

---

## ADR-015 — The slice order becomes fifteen slices, and a slice identifier equals its specification number

**Status**: Accepted - 2026-10-03
**Owning directory**: `docs/`
**Owning feature**: none - governance decision; ratified by the repository owner

**Context.** The thirteen-slice roadmap left five things without an owner, and
two ordering rules it did satisfy. The My Files page (`Core-Project.txt:91`) had
no slice: the file-intake slice's scope boundary excluded it explicitly, and the
page carries the open action toward the file-filtered Parts page and the retry action for
a failed file, which the extraction slice creates. The application shell —
header, sidebar, theme toggle, fonts, and the Tailwind-to-token bridge — had no
owner, so every browser-facing slice would have rebuilt it, and two constitution
conflicts were assigned to "the first surface that lays out a page" and "the
first slice that introduces the test runner", which no slice satisfied. Six
register gaps were assigned to "the first deploying slice" and to "the slice that
introduces persistent storage". The administrator slice did not depend on the
extraction slice whose output it administers, and it preceded the audit-log
slice while Authorization and Access Control requires every administrator
operation to be recorded.

The identifiers and the specification directories had never been reconciled: the
roadmap's `Sub-spec` column was empty for all thirteen rows, `specs/` did not
exist, and no feature branch had ever been created, so there was no historical
traceability to protect. Eight lines outside `ROADMAP.md` carried slice
identifiers — seven in the constitution's unresolved-facts and register-gaps
tables, one in ADR-012.

**Decision.** The roadmap becomes fifteen slices, renumbered so that a slice
identifier equals its specification number:

| Was | Now | Slice |
|---|---|---|
| R1 | R1 | Identity — now carries the foundation duties named above |
| — | R2 | File intake |
| R2 | R3 | Catalog extraction |
| — | R4 | My Files |
| R3 | R5 | Parts search |
| R4 | R6 | Catalog page |
| R10 | R7 | Profile |
| R5 | R8 | Cart (bookmarks) |
| R6 | R9 | Notifications |
| R7 | R10 | Messaging |
| R8 | R11 | Support surfaces |
| — | R12 | Delivery and operations |
| R9 | R13 | Admin application |
| R11 | R14 | Audit log |
| R12 | R15 | Retention |

The foundation duties are folded into the identity slice rather than given a
slice of their own: Principle VIII requires every user story to deliver
observable value and the P1 set to be a shippable MVP, a slice whose only story
is a contributor setup story cannot satisfy that, and `docs/architecture.md`
directs that a directory is created by the first feature that owns it, so
`apps/admin` and `apps/worker` are created by their own slices rather than as
empty scaffolding. Recording every administrator operation is part of the
administrator slice itself, not the later audit-log slice. The constitution is
amended to v2.9.0 with the identifier changes above and with each "first slice"
gap given a named owner. `ROADMAP.md` carries a defects table naming, for each of
the sixteen defects found, the slice that closes it.

**Alternatives considered.**
- *Keep the identity slice first and let it absorb the foundation.* Rejected as
  the identity slice's own scope; the foundation duties are large enough that
  hiding them inside authentication makes the slice's boundary unreviewable.
- *A separate foundation slice with contributor stories.* Rejected: a story
  about running the project is not observable product value, and Principle VIII
  makes that a violation rather than a preference.
- *Append slices as R14, R15, R16 and leave the old numbering.* Rejected: every
  reference would then need the `Sub-spec` column to resolve, which is the
  cognitive load the alignment removes.
- *Merge My Files into file intake.* Rejected: the scope boundary excludes the
  page, and the retry action does not exist until extraction lands.
- *Keep the audit-log slice after the administrator slice and record operations
  there.* Rejected: that leaves a window in which administrator operations are
  unrecorded, which Authorization and Access Control does not permit.

**Consequences.** A reference to a slice now resolves without a lookup table.
`constitution.md`, `ROADMAP.md`, and the identifiers in ADR-012 move together;
the ADR-012 text is annotated rather than rewritten, because a decision record is
history. Each slice's specification opens with `**Input**: Parent roadmap:
ROADMAP.md → R#.`, which the binding specification template now carries. A
synonym file such as `SLICE-MAP.md` MUST NOT be created: `ROADMAP.md` is the
slice order, and a second copy is a drift defect.

---

## ADR-016 — The icon set and the shell belong to the foundation duties of R1

**Status**: Accepted - 2026-10-03
**Owning directory**: `wafar.single.css` · register: constitution Principle IX and Design System Standards
**Owning feature**: none - governance decision; ratified by the repository owner

**Context.** Three design-system obligations had no slice able to discharge them.
The icon set was assigned to the parts-search slice, but the header's account,
notifications, and theme-toggle controls are needed by the first surface the
project lays out, so the shell would either ship without icons or violate the
register. The theme toggle is listed among the components the product requires and
the stylesheet does not provide. ADR-009 requires the eight declared-but-
unconsumed `--screen-*` tokens to be consumed or removed before the first surface
relies on a breakpoint, and no slice owned that.

**Decision.** The icon set and the theme toggle are owned by the shell duties in
R1, and the constitution's register-gap row for the icon set names R1.
`wafar.single.css` moves to 1.1.0 in R1's change: the self-hosted Tajawal and
JetBrains Mono delivery, the icon set, the theme toggle, and the disposal of every
`--screen-*` token the new shell does not wire to a media query.

**Alternatives considered.**
- *Leave the icon set with the parts-search slice and ship an iconless shell.*
  Rejected: the header controls are inoperable without it, and the product fact
  clarifications require them on every page header.
- *Wire all eight `--screen-*` tokens in R1.* Rejected: a token is wired only
  where the shell changes at that breakpoint; the remainder are deleted, as
  ADR-009's "consumed or removed" requires.

**Consequences.** Every later slice composes the shell rather than rebuilding it.
A component genuinely missing later is still added to `wafar.single.css` by the
slice that first needs it, and the module map is updated in the same change.


---

## ADR-017 — Shell scope and the sidebar conflict

**Status**: Accepted - 2026-10-03
**Owning directory**: `.specify/memory/constitution.md` (Principle IX, Product Register), `Core-Project.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** Principle IX and the design-system tokens required a sidebar that is fixed and always visible on desktop, and a header that was described differently in Core-Project.txt; Core-Project.txt had no sidebar at all. The product image for the desired shell shows auth-free chrome: the logo in the sidebar header, account/notifications/theme/collapse in the header. Sidebar items outside the product scope (compare, search history, subscriptions, payments) appeared in that image.

**Decision.** The application shell (header plus sidebar) renders on the public pages and the authenticated merchant area only. Auth pages (sign-in, sign-up, forgot-password), 404, static policy/FAQ/contact pages use a bare layout with no header and no sidebar; the administrator application has its own independent shell. The sidebar is 19rem wide on desktop and never hides or slides off-screen; the header's collapse control narrows it to an icon rail on desktop, and on mobile it becomes a drawer that the same control opens and closes. The sidebar header carries the platform logo; the header carries account, notifications, theme toggle, and the sidebar collapse control.

   **Annotation (2026-10-05, audit follow-up).** The Decision originally read "the
   sidebar is 19rem fixed on desktop". ADR-037 later narrowed "fixed" to mean
   "always on screen, never slid away", because Principle IX now requires the
   collapse control to narrow it to an icon rail; the constitution states this at
   its Sidebar decision values. The scoping decision this record made is unchanged:
   which surfaces carry the shell, and that the sidebar is always present on
   desktop rather than collapsible away. Sidebar navigation is limited to the in-scope pages per role; out-of-scope items are removed from the specification. R1 is the visual reference implementation for the shell.

**Consequences.** Every browser-facing slice composes this shell; none rebuilds it, and none places it on auth or admin screens. R1 implements the shell and the auth pages without it.

---

## ADR-018 — Structure registers closed the gaps left by Principle X and ADR-017

**Status**: Accepted - 2026-10-03
**Owning directory**: `docs/architecture.md`, `Project-Technologies.txt`, `.specify/memory/constitution.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** Principle X fixes the API module list, and Technology Standards fixes the internal layout, but the registers did not yet cover: the web layouts that ADR-017 requires (shell vs bare auth), the admin frontend layout, the file-level ownership of `packages/db/schema`, and `packages/search` was missing from the Monorepo row of the mirror. `docs/architecture.md` also labelled its module map "proposed", which invited drift.

**Decision.** Constitution 2.9.2: (a) `apps/web` and `apps/admin` include `layouts`; (b) `apps/admin/{pages,components,composables,stores,layouts}` is the fixed location of the admin frontend; (c) `packages/db/schema/<module>.ts` — one file per module, the table it declares belongs to that module; (d) `docs/architecture.md` module map is binding, not proposed; (e) `Project-Technologies.txt` mirror lists `packages/search` in the Monorepo row.

**Consequences.** Every later slice's plan Ownership Map must match these fixed locations. R1 is the first to create the workspace and must follow them exactly; a documentation-drift check on paths/module names belongs to R1/R2.

---

## ADR-019 — One domain model, one authority, and the register defect it closes

**Status**: Accepted - 2026-10-03
**Owning directory**: `docs/domain-model.md`, `.specify/memory/constitution.md` (Product Register, Single-Reference Sufficiency, Design System Standards), `Core-Project.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A review of the governing layer against the standard set of naming-reference documents found the data model held in three places at once, and the three had already diverged:

1. `.specify/memory/constitution.md` → Product Register → Data entities: ten entities, 51 fields, no types.
2. `Core-Project.txt` §8: ten entities, roughly 66 fields, plus soft deletion, plus the `AuditLog.target` format, plus a polymorphic `Message.sender_id`.
3. `specs/[###-feature]/data-model.md`: the per-feature output of `/speckit.plan` Phase 1, which no slice has produced yet.

Nothing said which was authoritative for the logical model. Seven facts existed only in the Arabic mirror — `User.status`, `Catalog.size`, `Catalog.mime_type`, `Part.page`, `Part.row`, `ContactMessage.status`, `ContactMessage.admin_note` — and by the Product Register's own rule ("a fact absent from this register MUST NOT be built without amending it") they were unbuildable, while R13's "block user" had no field to write. Three conflicts were invisible because nobody compared the copies: how a message's sender is represented when it may be a merchant or an administrator; whether `Conversation` carries an administrator reference when every administrator sees the same thread; and whether an administrator is a role on `User` or a distinct principal that `Conversation` and `AuditLog` refer to.

The same review found the register itself violating its own rule in two further ways. The constitution required a boolean `first_page_metadata_incomplete` on the catalog record in File Processing Overview step 4 and defined it in the Glossary, while the entity list that R3 would implement did not carry it. And Design System Standards named a shadow `brand` among the named shadows, while `wafar.single.css` — the only permitted source of design values — defines no `--shadow-brand`, only the `--shadow-brand-sm/md/lg` tints.

**Alternatives considered.**

- *Keep all three copies and reconcile them field by field.* Rejected: reconciliation is a one-time fix and the copies re-diverge on the next slice that adds a field. Single-Reference Sufficiency already names this failure — "a register that duplicates its source is a drift defect, because the two copies will disagree" — so keeping them would have left a standing violation, not a resolved question.
- *Make the constitution's entity list the single authority and reduce the mirror.* Rejected on the same rule, read from the other side: the constitution already forbids a table definition inside itself, and 51 fields is a table definition. The register that must stay small cannot also be the detail.
- *Write a project-level Data Dictionary with every column's type and constraint.* Rejected: columns are **Catalog data shape**, a deferred area whose ratification belongs to R3. Fixing the columns here would ratify a deferred area before the slice that owns it, which the constitution's Deferred areas clause forbids.
- *Promote one of the existing copies to authority by fiat.* Rejected: the copies disagree on facts, so promoting one would silently decide three product questions that the governance requires a named slice to decide.

**Decision.** Constitution 2.10.0:

1. `docs/domain-model.md` is the source of truth for the **logical** model — entities, relationships, cardinality, invariants, and the owning module of each. It carries no column type and no SQL.
2. The constitution's Data entities section becomes a map: entity, owning module, one-line meaning. It names `docs/domain-model.md` as its source, and states that an entity absent from the map MUST NOT be introduced without amending the register.
3. `first_page_metadata_incomplete` is registered as a binding cross-entity fact on `Catalog`; **soft deletion** for `User` and `Catalog` is registered alongside it; and the `AuditLog` target's `type:id` form is registered, because removing `Core-Project.txt` §8 removed the only place it was written and a format no register names is a format no feature can be held to. All three were previously required by another section or by the product mirror while being absent from the register.
4. The three sender and administrator conflicts are recorded in Unresolved product facts and assigned to R10 (sender representation; the conversation's administrator reference) and R13 (whether an administrator is a distinct entity), rather than decided here.
5. Single-Reference Sufficiency gains the symmetric half of its register rule: a register row MUST name a value its source actually defines, and a row naming a token or field the source lacks is corrected by amending the register, not by inventing the value. This is the clause that would have caught `--shadow-brand`.
6. The shadow register is corrected to the tokens `wafar.single.css` actually defines, and states that a single `brand` shadow does not exist.
7. `docs/domain-model.md` is added to References, and the constitution's preamble now distinguishes what it governs about the data model (which entities exist, which module owns each, which rules bind) from what it defers (columns, types, constraints).
8. `Core-Project.txt` §8 points at `docs/domain-model.md` instead of holding a third field list.

**What deliberately did not change.** No column, type, index, or constraint was written; the seven facts that exist only in the mirror are not added to the register, because each belongs to the slice that must decide it (R1 for `User.status`, R2 for `Catalog.size` and `Catalog.mime_type`, R3 for `Part.page` and `Part.row`, R11 for `ContactMessage.status` and `ContactMessage.admin_note`). Each is carried as a numbered unresolved fact in `docs/domain-model.md`, named by its original identifier so a slice can map its question back to this record. Two further questions were surfaced while writing that document and are recorded the same way rather than answered here: whether the `auth` module owns any stored entity, given that Technology Standards fixes `packages/db/schema/auth.ts` while no registered entity is owned by `auth` (R1); and whether an administrator is a distinct entity or a role on `User` (R13).

The glossary stays inside the constitution: it is already the declared naming authority for `spec-template.md`, and moving it would break that binding reference to buy nothing. Its `Part` and `Catalog` definitions continue to list a part's fields and a catalog's metadata, which is a register holding a partial list rather than a pure map. That is retained deliberately, because the **Catalog data shape** deferred area is defined *relative to* the Glossary's list — "the fields a part carries beyond those listed in the Glossary" — so emptying it would leave that deferred area with nothing to point at. Reducing the glossary to pure pointers is therefore a later amendment, not part of this one.

No exception was granted; the exception register stays empty.

**Corrections made before ratification.** This record was written against constitution 2.10.0, which had not been committed, so its errors were corrected in place rather than by a version bump. Four were found by a second review of the amendment against its own rules: the Context paragraph said "six facts" while listing seven, and the "deliberately did not change" paragraph named only five of them; and `docs/domain-model.md`, while claiming to decide nothing deferred, stated a part's page and row of origin as an invariant and drew `User → AuditLog` in its relationship diagram — the first settling a question this record assigns to R3, the second settling one it assigns to R13. Both were removed, the second by leaving `AuditLog` out of the diagram with a note saying why. The version stays 2.10.0 because 2.10.0 has no committed predecessor to bump from.

**Consequences.** A slice that changes an entity, a relationship, or an invariant now changes a registered product fact and MUST amend the register, record an ADR, and update `docs/domain-model.md` in the same change. A slice that introduces a column owns it in its own `data-model.md` and its migration; the two are no longer confused. R1, R2, R3, R11 and R13 each carry an open data-model question by name, so none of them can pass its Constitution Check by silently choosing.

**Annotation (2026-10-05, audit follow-up).** The Context's statement that seven facts "existed only in the Arabic mirror" is corrected by ADR-034: the field identifiers named there (`User.status`, `Catalog.size`, `Catalog.mime_type`, `Part.page`, `Part.row`, `ContactMessage.status`, `ContactMessage.admin_note`) appeared in earlier drafts of the unresolved-facts table, not in `Core-Project.txt`. The current `docs/domain-model.md` carries rows 7–11 alone and attributes none of the identifiers to the product mirror. The decision this record made is unchanged; only the provenance sentence is superseded.

---

## ADR-020 — Constitution register restored to its own rules

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.10.1.

**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Provenance (2026-10-03).** This record was reconstructed from review material
after the uncommitted working-tree copy of this file was reverted by mistake. The
decision, its date, and its constitution version are unchanged; the wording is a
faithful summary rather than the original text. A reviewer holding the original
copy should replace this record with it.

**Context.** An audit of the 2.10.0 constitution found register rows whose
mandatory values lived in a different section than the constitution rules
naming them, and a few rules that repeated another section verbatim instead of
referencing it.

**Decision.** The constitution's registers were restored to consistency with
the rules that govern them. No rule was removed; overlapping sentences were
relocated or replaced by a reference to the section that owns them. No deferred
area was ratified, and no principle was added, removed, or redefined. The
version bump to 2.10.1 is PATCH: clarifications and non-semantic refinements
only.

**What deliberately did not change.** No principle text, module map, ownership
decision, or usage limit. The sync impact report produced during the amendment
was treated as review material and not committed, as the Governance section
requires.

**Consequences.** The version stamps in `architecture.md`, `domain-model.md`,
and `ROADMAP.md` moved to 2.10.1.

---

## ADR-021 — Spec Kit 1.1.0 and Node 22 LTS pin

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.10.1
(unchanged; this is a tooling pin, not a governance amendment).

**Owning directory**: `.specify/`, `docs/`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Provenance (2026-10-03).** Reconstructed from review material after the
uncommitted working-tree copy of this file was reverted by mistake; the decision
and its version are unchanged, the wording is a faithful summary. A reviewer
holding the original copy should replace this record with it.

**Context.** The local Spec Kit install was `1.0.13`; upstream `v1.1.0` was
available. The install was upgraded, and the pinned runtime was swept for the
CI provider and the Node LTS line.

**Decision.** Pin Spec Kit to `>=1.1.0` and Node to the 22 LTS line. `/speckit.analyze`
is binding only where the cycle is invoked by hand; the bundled engine workflow
does not run it. ADR-013's statement "matching upstream v1.0.13 exactly" still
holds in shape for the pinned engine, and the command surface was re-verified.
Integration manifests and the mirror were regenerated, not hand-edited.

**Consequences.** None for governance content; the register is unchanged.

**Annotation (2026-10-05, ADR-049).** The Decision's statement about
`/speckit.analyze` was true when the record was made and is superseded on one
point only. ADR-033 item 6 amended the constitution's Artifact Workflow wording
to "by the engine workflow or by hand", and the bundled workflow at
`.specify/workflows/speckit/workflow.yml` runs `speckit.analyze` as a numbered
step, as `AGENTS.md` and `README.md` state. `/speckit.analyze` is therefore
binding in both invocation paths. The Spec Kit and Node pins in the same
Decision are unaffected and stand.

---

## ADR-022 — Constitution 2.10.2 (audit fixes)

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.10.2.

**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Provenance (2026-10-03).** Reconstructed from review material after the
uncommitted working-tree copy of this file was reverted by mistake; the decision
and its version are unchanged, the wording is a faithful summary. A reviewer
holding the original copy should replace this record with it.

**Context.** A second audit pass over the amendment material found stale
statements left by the same working session that produced 2.10.1:
references to the old Spec Kit version, an uncommitted Sync Impact Report
reference, and mirror files whose version stamp had not moved.

**Decision.** Constitution 2.10.2 records the audit corrections: version
stamps moved to 2.10.2, the Spec Kit pin re-stated, and the artifact workflow
references brought into line. No rule was removed; the bump is PATCH and
records clarifications only.

**What deliberately did not change.** No principle, module map, or ownership
decision was altered. The bump is PATCH under the versioning policy.

**Consequences.** `architecture.md`, `domain-model.md`, and `ROADMAP.md` move
to 2.10.2. Manifest hashes for the edited override template were re-recorded
in `.specify/integrations/speckit.manifest.json`.

---

## ADR-023 — Constitution 2.11.0 (security hardening, anti-spam, static design enforcement, ops controls)

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.11.0.

**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep review of the constitution found gaps in file-intake
security (uploads are ZIP-based Word/Excel/PDF, un-scanned), account
enumeration, brute-force lockout, unauthenticated anti-spam without CAPTCHA,
worker durability (BullMQ retries, DLQ, temp-file cleanup), large-upload
transport (100 MB buffering), session revocation, tenant-isolation test
obligations, staging data anonymisation, API versioning/deprecation, SBOM and
SAST, supported-browser and Lighthouse budgets, and static enforcement of
RTL/design tokens.

**Decision.** Constitution 2.11.0 records the following binding controls:

1. **Content safety** (File Processing Rules): magic-byte validation, ClamAV,
   a decoded-size cap recorded under Constitution Mandated Values, and macro
   stripping before extraction; rejected files are not stored.
2. **Account enumeration, lockout, and anti-spam** (Identity): uniform
   responses, a five-attempt / fifteen-minute lockout, honeypot
   fields, a minimum time-to-submit, and per-client rate limits; CAPTCHA is
   NOT used. Administrator bootstrap is a seeded CLI command with a forced
   password change.
3. **Upload transport**: presigned multipart uploads stream to object storage;
   the API MUST NOT buffer a 100 MB file in memory.
4. **Worker durability**: bounded retries with exponential backoff, a
   dead-letter queue, a per-worker concurrency cap, and a temp-file sweep;
   exhausted jobs surface `failed` with a retry action that does not
   re-upload bytes.
5. **Session revocation**, **tenant-isolation query-path test**, **staging
   data anonymisation**, **monitoring and alerting** (p95 latency, search
   p95, processing success rate, queue depth), **API versioning and
   deprecation** (`/api/v1`, one-release notice), and **supply-chain
   controls** (per-build SBOM, vulnerability/SAST scan).
6. **Design-token static enforcement**: Stylelint and ESLint fail the build on
   physical direction properties and non-token colour/radius/shadow/duration/
   z-index values.
7. **Performance budget**: a Lighthouse budget (LCP, INP, CLS) enforced by
   Lighthouse CI on at least the public Parts and Home pages.
8. **Product scope clarifications**: PWA and CAPTCHA are explicitly out of
   scope; anti-abuse is honeypot + time-to-submit + rate limit only.

**What deliberately did not change.** No principle, module map, ownership
decision, or usage limit was removed or redefined; CAPTCHA was prohibited and
PWA was not added. The bump is MINOR because new binding guidance was
added without removing or redefining a principle.

**Consequences.** The version stamps in `docs/architecture.md`,
`docs/domain-model.md`, `ROADMAP.md`, and `Project-Technologies.txt`, together
with the binding-block version strings in the `spec-template.md` and
`plan-template.md` overrides and the footer of the `constitution-template.md`
override, move to 2.11.0; `Project-Technologies.txt` and `docs/architecture.md`
also record ClamAV, Stylelint, Semgrep/osv-scanner, Lighthouse CI, pg_anonymize,
BullMQ DLQ/backoff, and presigned SeaweedFS multipart uploads. New product
capabilities (public part detail pages, saved-search alerts, email notification)
are deferred: each requires a separate MAJOR constitution amendment before a
slice may implement it.

---

## ADR-024 — Constitution 2.11.1: Stylelint named in Technology Standards

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.11.1.

**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** An audit found that Design System Standards (Static enforcement)
and ADR-023 already mandated Stylelint as a build gate, but Technology
Standards' Repository topology row for `packages/config` and the Approved
register's Quality row named only ESLint and Prettier. A register must name
the tooling it governs; otherwise the gate has no register owner.

**Decision.** Add Stylelint to the `packages/config` row and to the Quality
row in Technology Standards. The bump is PATCH: a clarification that names
tooling already made binding elsewhere, with no principle, module map,
ownership decision, or usage limit changed.

**What deliberately did not change.** No principle text, no scope, no limits.
The durable record of this amendment being committed is this entry; the
Sync Impact Report produced during `/speckit.constitution` is review material
and is not committed.

**Consequences.** Design System Standards' existing mandate now has a named
owner in Technology Standards. The following move to 2.11.1 in the same change:
the version footer of `.specify/memory/constitution.md`; the binding-block
version strings in the `spec-template.md` and `plan-template.md` overrides and
the footer of the `constitution-template.md` override; the version stamps in
`docs/architecture.md`, `docs/domain-model.md`, and `ROADMAP.md`; and
`Project-Technologies.txt`, which gains a `Constitution 2.11.1 additions`
section. The constitution-template override also records the same-change sync
rule these moves follow. The three integration manifests under
`.specify/integrations/` have the hashes of every edited file re-recorded, as
ADR-022 established for the previous template edits.

---

## ADR-025 — The Segoe UI fallback leaves the Tajawal font stack

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.11.1
(unchanged; this is a design-value correction, not a governance amendment).

**Owning directory**: `wafar.single.css`, `.specify/memory/`, `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** `wafar.single.css` carried `"Segoe UI"` in `--font-sans` and
`--font-display`. Principle IX and Design System Standards' Invariants permit
only Tajawal, Noto Sans Arabic (as the fallback the stylesheet itself declares),
and JetBrains Mono; any other typeface is prohibited without exception. ADR-012
removed `Inter`, `Poppins`, and `Fira Code` from these stacks for the same
reason and did not list Segoe UI, so the name survived that pass. A named
typeface in a font stack is a design value, and an unregistered one is a
Principle IX violation regardless of which font the client actually resolves.

**Decision.** Remove `"Segoe UI"` from `--font-sans` and `--font-display`. The
stacks become `"Tajawal", "Noto Sans Arabic", system-ui, sans-serif` and
`"JetBrains Mono", ui-monospace, monospace`, which is the state ADR-012's
decision describes.

**Version handling.** `wafar.single.css` stays at its declared `1.0.1` for this
correction because ADR-016 reserves `1.0.2` for the font delivery, icon set,
theme toggle, and `--screen-*` disposal that belong to R1's shell change; a
compliance correction that restores the already-decided stack is not a new
extension of the system and must not consume that version.

**Annotation (2026-10-05, audit follow-up).** The reference above to "ADR-016
reserves `1.0.2`" is imprecise: ADR-016 reserves `1.1.0` for R1's shell change,
and `1.0.2` was in fact consumed by ADR-038's removal of the undeclared
`--sidebar-width-collapsed` token. R1's shell change records its own
`wafar.single.css` version under Constitution Mandated Values; the constitution
stays open on the exact number, and neither `1.0.2` nor `1.1.0` is a settled
constant.

**What deliberately did not change.** No module map entry, no token value, no
typeface outside the three permitted families. The generic keywords
`system-ui`, `sans-serif`, `ui-monospace`, and `monospace` are retained: they
name no typeface and are what keeps Arabic text rendering when the self-hosted
webfont has not loaded. ADR-012 fixed the font stacks and named no icon set or
theme toggle; this record does not widen it.

**Consequences.** The declaration now matches the register it is governed by, so
a Stylelint or ESLint gate needs no exception for the stacks. R1 records the
stylesheet's version under Constitution Mandated Values when it performs its
shell change; the number is not `1.0.2` (consumed by ADR-038) and is open, as
the annotation above states.

---

## ADR-026 — Git Branching Workflow Extension adopted; mandatory feature branches

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.11.1
(unchanged; this records an extension adoption, not a governance amendment).

**Owning directory**: `.specify/`, `docs/`, `.specify/extensions/git/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** The bundled Spec Kit extension `git` (v1.0.1, MIT) was installed.
Its `before_specify` hook (`speckit.git.feature`, optional: false) makes
feature branch creation **mandatory and automatic** before every `/speckit.specify`.
The extension is bundled, requires no network install, and operates purely
locally — no credentials or network access are needed. The `auto_commit`
feature is disabled by default in `git-config.yml`; no automatic commits occur.

**Decision.** Adopt the `git` extension as a permanent part of the Wafar
development workflow. The mandatory `before_specify` hook (`speckit.git.feature`)
ensures every feature specification is developed on its own sequentially
numbered branch (`001-feature-name`, matching `feature_numbering: sequential`
in `init-options.json` and ADR-015's `specs/007-<name>` convention). The
`before_constitution` hook (`speckit.git.initialize`, optional: false) is a
no-op on an existing repository. The 15 auto-commit hooks are registered but
remain disabled by default in `git-config.yml` (`auto_commit.default: false`);
no automatic commits occur unless explicitly enabled in `git-config.yml`.

**What deliberately did not change.** No auto-commit behavior is enabled.
The `commit_style: fixed` default would produce commit messages without the
required `FR-###`/`AC-###` references (Principle I); enabling auto-commit
would require `commit_style: conventional` with agent-generated messages that
include the required identifiers, or a custom message template that includes
them. The `git add .` in auto-commit stages all changes; enabling it would
risk committing unrelated changes in a governance repository. No principle,
module map, ownership decision, or usage limit is altered.

**Consequences.** The binding cycle now effectively begins with an automatic
feature branch creation before specification. The following documents are
updated in this change to reflect the new cycle: `AGENTS.md` §5, `README.md`
Development workflow, and
`.specify/workflows/speckit/workflow.yml`. The constitution version remains
2.11.1. The extension is recorded in `.specify/extensions.yml` and
`.specify/extensions/.registry`; its manifest hashes are recorded in the
three integration manifests per ADR-022 practice.

**Annotation (2026-10-06, ADR-060).** This record names `git-config.yml` as
where the `auto_commit` default and the commit-hook states live. No such file
exists in this repository: `.specify/extensions.yml` is the hook-state source,
and every `speckit.git.commit` hook is `enabled: false` there, which is the
state this record describes. The claim about the default was right and the
claim about the file was wrong; the text above is left as it was written,
because a decision record is a history.

---

## ADR-027 — Audit fix set: ADR stamps, workflow version, hook state, cline registration, CSS token

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.11.1
(unchanged; this is a documentation/config consistency fix set, not a
governance amendment).

**Owning directory**: `.specify/`, `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `wafar.single.css`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit (2026-10-03) found register drift that the
constitution's own Single-Reference Sufficiency rule treats as a defect:
four files still stamped `ADR-001 … ADR-024` after ADR-026 landed; the
workflow registry disagreed with the workflow file on the version; ADR-026
described the `git.commit` hooks as disabled while `extensions.yml`
registered them `enabled: true`; the `cline` integration lacked the git
command files and was not registered for `assess`/`bug`/`git` in the
registry; the roadmap added a quota nuance absent from the constitution;
and `wafar.single.css` hardcoded a duration on the `body` transition.

**Decision.**

1. `AGENTS.md`, `README.md`, `ROADMAP.md`, and `docs/architecture.md` are
   restamped to `ADR-001 … ADR-026`.
2. `.specify/workflows/workflow-registry.json` is aligned to the workflow
   file's own version, `1.1.0`.
3. Every `speckit.git.commit` hook in `.specify/extensions.yml` is set to
   `enabled: false`, making the registered state match ADR-026 and
   `git-config.yml` (`auto_commit.default: false`). Re-enabling requires
   editing both files, by design.

    **Annotation (2026-10-06, ADR-060).** No `git-config.yml` exists in this
    repository; `.specify/extensions.yml` is the hook-state source, and this
    item's outcome is exactly as recorded there. The file named in the text
    above never existed here, and "editing both files" therefore reduces to
    editing the one. The text is left unrewritten for the reason ADR-058 set
    out.
4. The `cline` integration gains the git command files under
   `.clinerules/workflows/` (frontmatter `name: speckit-git-*`, mirroring
   the opencode copies), the `cline.manifest.json` is rebuilt to cover all
   registered workflow files, and `.registry` now lists `cline` under the
   `git` extension's `registered_commands`.

   **Annotation (2026-10-05, ADR-048).** The `cline` integration and the
   `.clinerules/` tree were retired by ADR-048. This item records what the
   extension registered at the time; neither path exists today.
5. `ROADMAP.md`'s upload-quota note is aligned to the constitution: the
   limits are `50 files per calendar month, 100 files in total`, with no
   deleted-files exception. Any such exception requires a constitution
   amendment first.
6. The `body` transition in `wafar.single.css` now uses
   `var(--duration-slow)` instead of a hardcoded `400ms`, so the static
   token-enforcement gate has a real target.

**What deliberately did not change.** No constitution text, no module map,
no principle, no ownership decision, no usage limit, and no design token
value. The stagger ladder `.ds-delay-*` (100/200/300/400/500ms) is kept:
it is a defined animation-delay scale, not a motion-duration token.

**Consequences.** The registers agree with their sources again; cline
reproduces the same command surface as opencode; and the next audit pass
should find no stamp drift.

---

## ADR-028 — Constitution 2.12.0: quota window and contact-message path

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.12.0.

**Owning directory**: `.specify/memory/`, `docs/`, `Core-Project.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of `ROADMAP.md` against the constitution found two
facts the constitution underdetermined: the window semantics of the monthly
upload limit ("50 files / month" while ADR-027 recorded "50 files per calendar
month"), and the path by which a `ContactMessage` reaches the administrator
(unresolved product fact #5, deferred to R11, with no administrator surface
registered for it).

**Decision.** Constitution 2.12.0, two changes:

1. **Usage Limits.** The monthly upload limit is stated as "50 files per
   calendar month", aligning the constitution with ADR-027 and `ROADMAP.md`.
2. **Contact-message path.** A `ContactMessage` reaches the administrator
   through a dedicated administrator page, "Contact messages", added to
   Product Scope's Administrator's Application table. The unresolved-facts row
   is removed from the constitution's Product Register and re-recorded as a
   resolved conflict. The page count moves from twenty-five to twenty-six, and
   R13 (which already depends on R11) owns its surface.

**What deliberately did not change.** No principle, module, entity, budget,
limit, or register gap was added, removed, or redefined. The bump is MINOR
because Product Scope gained a page.

**Consequences.** ADR-029 closes roadmap defect #6 and marks open question #5
resolved in `ROADMAP.md` and `docs/domain-model.md`. The constitution's version
stamps in `docs/architecture.md`, `docs/domain-model.md`, `ROADMAP.md`,
`Project-Technologies.txt`, and the template-override binding blocks move to
2.12.0 in the same change. `AGENTS.md` and `README.md` do not carry a
constitution version stamp (the Governance amendment procedure names only the
constitution footer, the template overrides, the constitution-template
scaffold, `docs/architecture.md`, `docs/domain-model.md`, `ROADMAP.md`, and
`Project-Technologies.txt`). `Core-Project.txt` mirrors the new admin page row.

---

## ADR-029 — Roadmap dependency and ownership corrections

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.12.0
(unchanged; governance documents only).

**Owning directory**: `ROADMAP.md`, `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** The same audit found roadmap defects: the `suppliers` module had
no owning slice; R10's "notification on reply" required the notifications
module that R9 introduces; R15's deletion path must withdraw bookmarks (R8);
R5's Home cards depend on R1/R2 counters; the presigned multipart upload
transport was assigned to R3 although the upload endpoint belongs to R2;
`/api/v1` versioning was assigned to R2 although the first HTTP surface is R1;
R2's file-ingestion internals ownership was missing from the deferred-areas
note; and defect #16's phrasing read as a typo.

**Decision.** `ROADMAP.md` is corrected:

1. R3 creates the `suppliers` module during first-page supplier extraction;
   R13 administers it.
2. R10 depends on R1 **and R9**.
3. R15 depends on R3 **and R8**; index lifecycle note unchanged.
4. R5 depends on R1, R2, **and** R3 (Home counters need accounts, files,
   parts, and the search event counter R5 must define).
5. The Home "searches" counter's storage is decided by R5 and recorded as an
   ADR; no entity owns it today.
6. The presigned multipart upload transport belongs to R2 (the upload surface).
7. `/api/v1` versioning belongs to R1 (the first HTTP surface).
8. The deferred-areas note names R2 for file ingestion internals.
9. Defect #16 rephrased to "R10 (مرتين)، R13"; defect #6 closed by ADR-028.
10. Open question #5 is marked resolved; questions #1–#4 and #6–#11 stay open.

**What deliberately did not change.** No slice is added, reordered, or merged;
no scope boundary is widened beyond the ownership corrections above.

**Consequences.** Every slice's `Depends on` now matches the modules and
entities its scope names. The consistency gate can verify ownership without
cross-reading data-model notes.

---

## ADR-030 — Constitution 2.13.0: phone-only authentication

**Status**: Accepted. **Date**: 2026-10-03. **Constitution version**: 2.13.0.

**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `Project-Technologies.txt`, `Core-Project.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** The platform's identity model carried an email address it never
needed: the Log In page read "Email and password", a register gap reserved a
transactional-email provider for password recovery, and the Constitution
Mandated Values named an email transport. The audience is Libyan merchants
whose reachable, verifiable identifier is the mobile number; an email surface
adds a second identifier to verify, a second provider to vet, and a second
channel to secure, for no product gain.

**Decision.** Authentication is phone-only, end to end:

1. **The mobile number is the sole account identifier.** No email address
   exists anywhere in the platform: no sign-up email, no login email, no
   transactional email. The number is stored in E.164 form (+218…), normalized
   before comparison, and unique per account.
2. **Public pages.** Log In is mobile number and password. Sign Up is full
   name, mobile number, password, city, and an optional shop name. Forgot
   Password is an OTP sent by SMS to the registered mobile number, with a
   uniform response that does not reveal account existence. OTP verification
   is required at sign-up; sign-in of a verified account requires no OTP.
3. **International SMS provider.** The register gap is now a transactional SMS
   provider for OTP and password reset, closed by R1: an international
   provider such as Twilio or Vonage, because Libyan carrier coverage for
   application-to-person SMS is unreliable and the sign-up OTP must reach
   numbers on every Arab-country dial code the selector offers. The choice,
   its licence-obligation record, and its vulnerability scan are recorded by
   R1's plan under the register-gap rule.
4. **better-auth phone-number extension.** better-auth stays the designated
   authentication library and MUST be used with its phone-number extension,
   which provides the phone-number sign-in and OTP flows as maintained library
   code; custom authentication code remains prohibited. If the extension proves
   unfit, the alternative MUST be recorded as an ADR before it is used, and the
   `scim`/`sso` prohibition is unchanged.
5. **Sign-up fields.** The dial-code selector is an Arab-country selector
   showing flag, country name, and code, defaulting to Libya +218. The city is
   a searchable fixed dropdown of all Libyan cities, governorates, and areas;
   the fixed list's source is decided by R1 and recorded in its plan, because
   the constitution fixes the control's shape, not its data source.

**Annotation (2026-10-05, audit follow-up).** Points 3 and 5 above are
superseded in part by ADR-041: registration is Libya-only, the dial-code
selector is removed, and a number outside +218 is rejected. The rest of
ADR-030 (phone-only authentication, OTP at sign-up, no OTP at sign-in, no
email anywhere) remains in force.
6. **User register fields.** The Product Register's `User` identity fields are
   the mobile number (E.164, unique), the country code, the city, and the
   optional shop name. `docs/domain-model.md` is updated in the same change. A
   guest's contact message still carries name, phone, and body, and that phone
   stays for contact only — it is never an account identifier.

**Alternatives considered.**

- *Email and password, with email-based recovery.* Rejected: it assumes a
  channel the audience does not reliably hold, doubles the identifier and
  provider surface, and the recovery flow it requires is weaker than an OTP to
  a verified handset.
- *Phone with email as an optional second factor.* Rejected: "no email address
  exists anywhere" is simpler to hold than "email exists but only here"; a
  partial email surface reintroduces the provider and verification surface
  this amendment removes.
- *A Libyan-carrier SMS aggregator.* Rejected for the register gap: coverage
  and delivery guarantees for application OTP traffic favour an international
  provider; R1 may revisit with evidence, under the same register-gap rule.

**What deliberately did not change.** The rest of the authentication policy is
unchanged and was verified, not re-opened: the fifteen-minute lockout after
five consecutive failed sign-in attempts; uniform anti-enumeration responses;
no CAPTCHA; honeypot, minimum time-to-submit, and rate limit on the sign-up
and contact forms; server-side revocable sessions including "sign out
everywhere"; and browser-stored tokens revocable on password change. The
bump is MINOR: new and materially expanded guidance with no principle removed
or redefined.

**Consequences.** The mandated value "email transport" became "transactional
SMS transport" (Module Discipline and Development Workflow, and row 14 of the
plan-template override). The Glossary gains "Mobile number"; no email-based
definition existed to remove. The version footer, the binding-block version
strings in the `spec-template.md` and `plan-template.md` overrides, the footer
of the `constitution-template.md` override, and the stamps in
`docs/architecture.md`, `docs/domain-model.md`, `ROADMAP.md`, and
`Project-Technologies.txt` move to 2.13.0 / ADR-030 in the same change.
`AGENTS.md` and `README.md` carry no constitution version stamp; the Governance
amendment procedure names only the constitution footer, the template overrides,
the constitution-template scaffold, `docs/architecture.md`,
`docs/domain-model.md`, `ROADMAP.md`, and `Project-Technologies.txt`.
`Core-Project.txt`
mirrors the three redefined auth pages. The Sync Impact Report produced during
the amendment is review material and is not committed; this entry is the
durable record.

---

## ADR-031 — Roadmap audit fix set

**Status**: Accepted — 2026-10-04
**Owning directory**: `docs/`, `ROADMAP.md`, `AGENTS.md`, `README.md`, `docs/architecture.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of the fifteen-slice roadmap against the constitution, the domain model, and the architecture surfaced one critical gap, three medium inconsistencies, and a set of clarifications. The constitution requires the transition "My Files → click a file → Parts (filtered by that file)" (MUST), but neither R4's intent nor R5's intent owned it; R6 linked to R5 without declaring the dependency; the constitution fixes the documentation-drift test deadline at the first public interface (R1), while the roadmap assigned it to R2; and R12's intent omitted staging-data anonymisation and the monitoring/alerting set that its First-obligations row already carried.

**Decision.** The roadmap is corrected without changing the slice order or the slice-to-spec-number convention:

1. R4's intent now names the open control on each file row for the My Files → Parts transition; R5's intent wires that control to `?file=<id>` filtering. The transition is owned by the R4 + R5 pair (R5 runs after R4 in the topological order).
2. R6's `Depends on` gains R5 (its scope links to R5).
3. R12's intent names staging data anonymisation and the monitoring and alerting set; the R12 First-obligations row's constitution reference is corrected to Deployment and Observability / Dependency Governance / Performance Budgets and Verification instead of the blanket "Register gaps".
4. The documentation-drift row states explicitly that R1's public surface is covered by OpenAPI generation from the Hono routes (ADR-002), so the first standalone drift test remains R2's.
5. The shell row cites ADR-016 (icon set and theme toggle in R1) alongside ADR-017; a new R1 row adds automated weak-hashing detection and the sign-out-everywhere / token-revocation-on-password-change duty; R10's intent notes the reply is authored through R13 and that pre-R13 acceptance uses the admin API directly; the R5 "searches" counter note adds that a new entity also requires amending the Product Register; Notes gains explicit statements that R1 seeds the administrator under the current admin-role model, that R4/R7/R8 enforce ownership while R13 ratifies the authorization model, and that My Files → Parts is an R4+R5 cross-slice pair.

**Alternatives considered.**

- *Move the My Files → Parts link into R5 as a standalone requirement.* Rejected: the control lives on R4's surface, and assigning the whole transition to R5 leaves R4's page under-specified.
- *Make R4 depend on R5.* Rejected: it breaks the property that slice numbers form a topological order, which ADR-015's renumbering deliberately established.

**Consequences.** No constitution text changes; no slice numbers, counts, or dependency directions change except one declared addition (R6 → R5). `ROADMAP.md`, `AGENTS.md`, `README.md`, `docs/architecture.md`, and `spec-template.md` range strings move to ADR-001 … ADR-031. The constitution version stamp stays 2.13.0.

---

## ADR-032 — Roadmap second audit fix set

**Status**: Accepted — 2026-10-04
**Owning directory**: `docs/`, `ROADMAP.md`, `AGENTS.md`, `README.md`, `docs/architecture.md`, `.specify/templates/overrides/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A second full audit (constitution, architecture, domain-model, ROADMAP, DECISIONS, and the binding templates together) found seven cross-file inconsistencies in inner-column references, plus underspecified slice intents: the contact-form anti-spam duty sat only in First obligations while R11's intent was silent, the My Files → Parts pair carried no declared dependency edge, the data-flow sentence inverted the worker's role, and six facts (mirror count) contradicted ADR-019's seven.

**Decision.**

1. `spec-template.md`: the ADR range string moves to ADR-001 … ADR-032, and the two `**Input**:` lines merge into one binding line (`**Input**: Parent roadmap: ROADMAP.md → R#. User description: "$ARGUMENTS"`).
2. `plan-template.md`: the UTF-8 rule now cites the constitution's Artifact Workflow section instead of the wrong AGENTS.md §4.
3. `ROADMAP.md`: the mirror fact count moves from "six facts" to "seven facts", matching ADR-019's Context and its documented pre-ratification correction.
4. `docs/architecture.md`: the canonical-chain sentence is rewritten as `web → api → (PostgreSQL, SeaweedFS) for persistence, and api → queue → worker → (PostgreSQL, OpenSearch) for processing`, and item 4 of the chain reads `worker → db and search`, removing the implication that OpenSearch drives the worker.
5. `ROADMAP.md`: R5's `Depends on` gains R4, declaring the edge the ADR-031 transition note implies (R5 wires a control rendered on R4's surface). Topological order is preserved because R4 precedes R5.
6. `ROADMAP.md`: R2's scope boundary states that content safety (magic-byte validation, ClamAV scan, decoded-size cap, macro stripping) runs at intake, and its intent records `Catalog.size`/`Catalog.mime_type` (open fact #9). R3's intent records open fact #10 and the ratification of the extraction algorithm and catalog data shape deferred areas. R9's scope states administrator messages feed it once R13 exists. R11's intent carries the contact-form honeypot, minimum time-to-submit, and per-client rate limit. R7's scope states the mobile number is not editable and the account carries no delete control. R1's intent states it fixes the Libyan city list and decides open facts #7 and #8. R5's intent records the "searches" counter decision (ADR + Product Register amendment in the same change) and that the public table's design components come from `wafar.single.css`.
7. Terminology: UI copy for the cart is a bookmark list (Principle VI); any purchase verb is prohibited. Recorded here rather than editing `Core-Project.txt`, whose product wording remains the mirror's.

**Alternatives considered.**

- *Edit accepted ADR-031 in place to absorb this round.* Rejected: ADR-031 is ratified; the second audit is a separate decision.
- *Change the cart's product name in `Core-Project.txt`.* Deferred to the domain team; R8 names it "Cart (bookmarks)" and the UI copy rule above governs.

**Consequences.** One dependency direction is added (R5 → R4). Range strings in `ROADMAP.md`, `AGENTS.md`, `README.md`, `docs/architecture.md`, and `spec-template.md` move from ADR-031 to ADR-032. No constitution text changes; the version stamp stays 2.13.0; slice numbers and counts are unchanged.

---

## ADR-033 — Audit fix set: full name, cascade ownership, entry point, dependency budget, analyze wording, mirror-claims cleanup

**Status**: Accepted — 2026-10-04
**Owning directory**: `.specify/memory/`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`, `.specify/templates/overrides/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A third full audit (all documents, then a hand-run consistency pass) found: the ADR-031/ADR-032 fix set was uncommitted in the working tree; sign-up collects the merchant's full name but no register carries it as a `User` field; the catalog-delete cascade was binding but had no implementing slice (R4 and R13 need it, only R15 named it, and neither consumer depended on R15); the single shared tenant-scoping/permission entry point had no named owner; the dependency budget was mandated but numerically undefined and unowned; the constitution's "analyze runs by hand" text conflicted with the engine workflow's analyze step; `checklist-template.md` was the only feature template with no Project Context Sources binding block; and `Project-Technologies.txt` carried unverifiable figures (a Zod `.validate()` 35x claim against a method that does not exist in the classic API, an exact Hono requests/second figure, a Nuxt 3 EOL date) that an agent would have restated into a plan's Constitution Mandated Values.

**Decision.**

1. ADR-031/ADR-032 changes are committed; the working tree is clean at commit `4b56394` before this ADR's edits.
2. `User` carries a full name: the constitution's register row and `docs/domain-model.md`'s User row are amended, and the version moves to 2.14.0 (MINOR: material expansion of the Product Register).
3. The catalog-delete cascade is implemented once, in the `catalogs` module service, by R4 (parts + search-index withdrawal); R8 adds bookmark withdrawal at the same trigger, R13's admin delete and R15's retention job reuse the routine, and R15 → R4 plus R13 → R4 dependency edges declare it.
4. The single shared entry point for tenant scoping and later permission resolution is introduced by R2 (its first tenant-scoped query surface) and ratified by R13.
5. The numeric dependency budget is set by R1 under Constitution Mandated Values.
6. The constitution's artifact-workflow text now reads that `/speckit.analyze` runs after `/speckit.tasks` and before implementation, by the engine workflow or by hand — the two texts no longer conflict.
7. `.specify/templates/overrides/checklist-template.md` is created with the same normative Project Context Sources binding block the other feature templates carry.
8. `Project-Technologies.txt` loses the unverifiable figures; a mirror records only what it can attribute to a vendor source, and the version bubble gains a 2.14.0 additions section.
9. Range strings and version stamps move to ADR-001 … ADR-033 and constitution 2.14.0 across `ROADMAP.md`, `AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/domain-model.md`, `spec-template.md`, `plan-template.md`, and `constitution-template.md`.

**Alternatives considered.**

- *Resolve the full name by deleting the field from sign-up.* Rejected: the product requires merchants to identify their shop; the omission was in the registers, not the product.
- *Record the name as an unresolved fact instead of registering it.* Rejected: sign-up's shape is decided, so the field belongs in the register; an open question would only defer a settled fact.
- *Have R15 own the cascade implementation.* Rejected: R4 precedes R15 in the topological order, so the first delete would either duplicate the routine or wait on a later slice.
- *Leave the mirror figures.* Rejected: a precise number an agent cannot attribute becomes invented precision in every plan's CMV row.

**Consequences.** No slice is added, reordered, or renumbered; two dependency edges are added (R15 → R4 and R13 → R4). The constitution version moves to 2.14.0; this entry is the durable amendment record. Sync Impact Report from `/speckit.constitution`, when the next run produces it, is review material and is not committed.

---

## ADR-034 — Constitution 2.15.0: metrics stack, dependency scanner, staging anonymiser, and the optional web-server directory

**Status**: Accepted — 2026-10-04
**Owning directory**: `.specify/memory/`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A final cross-document audit found that `Project-Technologies.txt` and `docs/architecture.md` named three tools the constitution's register does not name — Prometheus + Grafana (metrics), osv-scanner (dependency vulnerability scan), and pg_anonymize (staging anonymisation) — which the mirror rule ("the mirror MUST NOT introduce a technology this register does not name") forbids. The same audit found `apps/web/server/` in the mirror's tree but absent from the constitution's Internal layout, and a technically inaccurate claim that BullMQ can use PostgreSQL as its queue backend. Two unresolved-facts rows also attributed field identifiers to `Core-Project.txt` that the mirror does not carry (`User.status`, `Catalog.size`, `Catalog.mime_type`, `Part.page`, `Part.row`, `ContactMessage.status`, `ContactMessage.admin_note`), and an ADR still quoted the benchmark figure ADR-033 had neutralised in the mirror.

**Decision.**

1. The constitution is amended to 2.15.0 (MINOR: material expansion of the registers): Prometheus + Grafana named under Monitoring and alerting; osv-scanner named under Supply-chain controls; pg_anonymize named under Staging data anonymisation; `apps/web/server/` added to Internal layout as an optional, feature-declared location.
2. `Project-Technologies.txt` corrects the BullMQ backend claim (Redis only) and gains a Constitution 2.15.0 additions section.
3. `docs/domain-model.md` and `ROADMAP.md` no longer attribute the working field identifiers to the product mirror; rows 7–11 are carried by the domain model alone.
4. ADR-002 and ADR-010 carry annotations marking their precise figures historical (the mirror having been neutralised in ADR-033).
5. Range strings and version stamps move to ADR-001 … ADR-034 and constitution 2.15.0 across `ROADMAP.md`, `docs/architecture.md`, `docs/domain-model.md`, `spec-template.md`, `plan-template.md`, `checklist-template.md`, and `constitution-template.md`. (`AGENTS.md` and `README.md` carry no constitution version stamp; the Governance amendment procedure does not name them as stamp sites.)

**Alternatives considered.**

- *Remove the names from `Project-Technologies.txt`.* Rejected: the obligation to run each control already exists; deleting the names reintroduces the "review comment as enforcement" failure mode the registers exist to prevent.
- *Leave the identifiers attributed to the mirror.* Rejected: a register row that names a token or field its source does not contain is the same drift defect as a missing decision, read in the other direction.
- *Cite the BullMQ PostgreSQL backend as a plan-time choice.* Rejected: BullMQ requires Redis; the note was inaccurate and stayed until corrected.

**Consequences.** The mirror now carries only names the constitution also carries, and the constitution's Internal layout covers every path in the mirror's tree. No slice is added, reordered, or renumbered; no new runtime dependency is introduced, so no new licence record or vulnerability scan accompanies this amendment. The constitution version moves to 2.15.0; this entry is the durable amendment record. Sync Impact Report from `/speckit.constitution`, when the next run produces it, is review material and is not committed.
---

## ADR-035 — Constitution 2.15.1: encoding repair and UTF-8 verification note

**Status**: Accepted — 2026-10-04
**Owning directory**: .specify/memory/, docs/, ROADMAP.md, AGENTS.md, README.md, docs/architecture.md, docs/domain-model.md, .specify/templates/overrides/
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A final audit found that .specify/memory/constitution.md itself
carried double-encoded UTF-8 (UTF-8 bytes interpreted as Windows-1252 and
re-saved as UTF-8): corrupted em-dashes (U+00E2 U+20AC U+201D, where U+2014, the em dash, was intended), corrupted arrows (U+00E2 U+2020 U+2019, where U+2192 the arrow was intended), and
every Arabic example unreadable (the Principle V root example and the
Arabic-Indic numeral examples among them). The mirror files and the ADRs were
correctly UTF-8; ADR-011's byte-level check verified decodability, not the
legibility of the decoded characters, so the defect passed that check.

**Decision.**

1. Constitution 2.15.1 (PATCH: non-semantic repair plus one clarification):
   every corrupted character is restored to its intended one — em-dash, arrow
   (→), and the Arabic examples — with no rule, number, register row,
   heading, or ADR reference changed.
2. The UTF-8 bullet in Artifact Workflow and Traceability now states that
   decodability does not prove correct characters, that mojibake is a defect
   of the same kind, and that Arabic content MUST be verified legible.
3. The living range strings move to ADR-001 … ADR-036 and the version
   stamps move to 2.15.1 in the same change.

**What deliberately did not change.** No principle text, module map,
ownership decision, usage limit, slice order, or deferral is altered. ADR-011
stands; its check is now read together with the new verification note.

**Consequences.** The constitution's defining Arabic examples are readable
again, and future audits must verify legibility, not only decodability. The
durable record of this amendment is this entry.

---

## ADR-036 — Constitution 2.15.2: audit fix set — quota invariant, breakpoint table wording, mirror omissions, roadmap fact rows

**Status**: Accepted — 2026-10-04
**Owning directory**: `.specify/memory/`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`, `.specify/templates/overrides/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of the governance documents found six defects: (1) `docs/domain-model.md` never recorded the binding 50-files-per-month / 100-files-total upload quotas as a model invariant; (2) row 5 of its Unresolved facts carried no owner while the roadmap mirrored one; (3) ROADMAP slice rows R10, R11, R13, and R15 did not name the open facts each one owns, unlike R1, R2, R3, and R9; (4) the constitution's Breakpoints table headed a column "Consumed by a media query?" with `yes` while the adjacent text and the stylesheet state every `--screen-*` token is declared-but-unused; (5) the Usage Limits table listed "Very large files (exceptional): up to 20 MB" without stating that 100 MB remains the binding ceiling; (6) `Project-Technologies.txt` recommended Playwright as the CI provider although the CI provider remains an open register gap, carried MinIO as a passing predecessor mention, and never stated that the coverage gate and the dependency policy live only in the register.

**Decision.** The constitution is amended to 2.15.2 (PATCH: clarifications only, no rule, number, or deferral changed). `docs/domain-model.md` gains the quota invariant, and row 5 names ADR-028 with R13. ROADMAP rows R10, R11, R13, and R15 now name their open facts (#1/#2, #11, #6, #3). `Project-Technologies.txt` neutralises the CI-provider recommendation, rewords the MinIO note, and names the coverage gate and dependency policy as register-owned. Living range strings move to ADR-001 … ADR-036.

**Consequences.** No slice is added, reordered, or renumbered; no runtime dependency changes. This entry is the durable amendment record.

---

## ADR-037 — Constitution 2.16.0: design-values carve-out, p95 budgets, sidebar icon rail, two CMV rows

**Status**: Accepted — 2026-10-04
**Owning directory**: `.specify/memory/`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`, `.specify/templates/overrides/`, `Core-Project.txt`, `AGENTS.md`, `README.md`, `.clinerules/project-context.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Annotation (2026-10-06, ADR-058).** The Owning directory above names
`.clinerules/project-context.md`, which ADR-048 deleted with the Cline
integration and which does not exist today. The field records where the decision
was applied, so it is annotated rather than rewritten. ADR-050 stated that this
record was annotated for the same reason; it was not, and it is annotated now.

**Context.** A deep audit of the governance set found: (1) the constitution's own rule "a design value MUST NOT appear in this constitution" contradicted the Decision-values subsection and Principle IX, which carry values by design; (2) two values the constitution assigns to Constitution Mandated Values (the decoded-size cap, the supported-browser statement) were missing from the enumerated list; (3) the header's sidebar-collapse control was named while Principle IX said the sidebar never hides or slides — the control's behaviour was undefined; (4) latency MUSTs were stated without the percentile that Usage Limits fixes; (5) `Core-Project.txt`'s sidebar item list named the contact page while Principle IX gives contact a bare shell-less layout; (6) the default table order and the Libyan city list were facts the constitution did not register; (7) `Core-Project.txt` listed the contact page in the sidebar.

**Decision.** The constitution is amended to 2.16.0 (MINOR: two register additions, one permitted behaviour, two rule-scope carve-outs): the design-value carve-out is stated; Performance Budgets and the Usage Limits rows are stated at p95; the sidebar collapse control is defined (desktop: icon rail, never hidden or off-screen; mobile: drawer toggle); the CMV list gains the decoded-size cap and the supported-browser statement; Product Fact Clarifications name the default newest-first order and the city-list record. Contact-page shell scope and the sidebar item list are corrected in the mirror.

**What deliberately did not change.** No principle removed or redefined; the workspace tree, slices, and slices' dependencies are unchanged.

**Consequences.** Living range strings move to ADR-001 … ADR-038; version stamps move to constitution 2.16.0 across `ROADMAP.md`, `AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/domain-model.md`, `spec-template.md`, `plan-template.md`, `checklist-template.md`, and `constitution-template.md`. Template overrides and mirror-tree copies move in the same change (ADR-038 keeps their pointers current). This entry is the durable record.

---

## ADR-038 — Constitution 2.17.0: register gaps, ClamAV/Lighthouse CI, role split, and defined terms

**Status**: Accepted — 2026-10-04
**Owning directory**: `.specify/memory/`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`, `.specify/templates/overrides/`, `AGENTS.md`, `.clinerules/project-context.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Annotation (2026-10-06, ADR-058).** The Owning directory above names
`.clinerules/project-context.md`, which ADR-048 deleted with the Cline
integration and which does not exist today. The field records where the decision
was applied, so it is annotated rather than rewritten. ADR-050 stated that this
record was annotated for the same reason; it was not, and it is annotated now.

**Context.** The audit also found: ClamAV and Lighthouse CI were required by MUSTs while absent from the Approved register; the Arabic analyzer, the Redis client library, the OpenSearch client library, and an automated accessibility checker were required by rules with no owning technology; Nitro was named in the Internal layout without a register row; Nuxt UI, Pinia, and TanStack Query were registered together with no split of responsibilities; "reprocess" and "retry" were both used without definitions; the product name was not registered; the cart page's Arabic name was a purchase metaphor the scope forbids; and "reports" had no stated limit.

**Decision.** The constitution is amended to 2.17.0 (MINOR: four register-gap rows and three register corrections plus one exception-scoped definition, PATCH elsewhere): ClamAV and Lighthouse CI are registered with explicit notes that they are not runtime dependencies; four gap rows (Redis client library → R3, OpenSearch client library → R5, automated accessibility checker → R1, Arabic analyzer configuration and verification → R5); Nitro is named as part of Nuxt 4 in Internal layout and deliberately excluded from the Approved register; the UI components / Pinia stores / TanStack Query server-state split is stated; reprocess vs retry, the trade name Wafar with mandatory diacritics, the cart page's Arabic name «المحفوظات», and the reports limit are defined.

**What deliberately did not change.** No slice is added, reordered, or renumbered; no runtime dependency is introduced; the 10-module list and the topology are unchanged.

**Consequences.** Living ADR range strings move to ADR-001 … ADR-038; version stamps move to constitution 2.17.0 across `ROADMAP.md`, `AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/domain-model.md`, `spec-template.md`, `plan-template.md`, `checklist-template.md`, and `constitution-template.md`. The mirror carries the role-split note and the four gap rows in a Constitution 2.17.0 additions section. This entry is the durable amendment record.

**Annotation (2026-10-04, audit follow-up).** The deep-file audit closed the remaining stamp gaps named by this record: an independent constitution stamp (v2.17.0) now heads `ROADMAP.md` and an explicit v2.17.0 line heads `Project-Technologies.txt`; the `tasks-template.md` override gains the binding-rules block carrying `constitution v2.17.0`; `workflow-registry.json` now names the assess, bug, and git extensions and records the implement ↔ converge repetition (ADR-013), which `workflow.yml` also states; and the cart label «المحفوظات» replaces the stray «السلة» in the PostgreSQL mirror row. Separately, the undeclared `--sidebar-width-collapsed` token was removed from `wafar.single.css` (bumped to 1.0.2), because the constitution reserves the collapsed/rail width for the slice that first needs it.

**Annotation (2026-10-06, ADR-058).** The cart label this record fixes,
«المحفوظات», no longer stands. ADR-045 superseded this clause with «سلة المشتريات» and ADR-049 unified the mirror citation on ADR-045, but this record was left carrying the superseded label with nothing pointing at the change. The label clause is a history and is not rewritten; the superseding name is ADR-045's, and the record is annotated now so that a reader of this section alone is not left with a label the platform does not use.

---

## ADR-039 — Repository line-ending and encoding policy recorded; mirror stops restating rules; fallback templates labelled

**Status**: Accepted — 2026-10-04
**Owning directory**: `.gitattributes`, `docs/`, `Project-Technologies.txt`, `ROADMAP.md`, `.specify/templates/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A full-file audit of the governance set found four defects of the
same class — a rule or a claim living in more than one place, or a pointer that
points at nothing:

1. `.gitattributes` stated the line-ending policy and cited
   `docs/DECISIONS.md` -> ADR-008 as its record. ADR-008 is "Registers live in
   the constitution", so the citation pointed at an unrelated decision, and no
   record anywhere covered line endings at all. The encoding half of the same
   concern was recorded separately (ADR-011, ADR-035), so the policy existed in
   three pieces and one file.
2. `Project-Technologies.txt` restated binding rules in its amendment-mirror
   sections: the lockout numbers, the honeypot and minimum-time-to-submit
   controls, the CAPTCHA prohibition, `/api/v1` and its removal notice, the
   upload quotas, the cart page's Arabic label, the trade name's diacritics, the
   reports limit, the 500-line advisory, and the shared-location prohibition. The
   file's own header states that no rule lives in it (constitution ->
   Single-Reference Sufficiency), so each restatement was a second source that
   could drift from the register.
3. The same mirror contradicted an open register gap: its Arabic-analyzer row
   claimed the analyzer "needs no extra configuration" while the constitution
   lists Arabic analyzer configuration and verification as an open gap owned by
   R5. It also named three Redis client libraries as supported while the Redis
   client library is an open gap owned by R3, and it carried two precise figures
   it could not attribute (a download count, a predecessor's end-of-development
   date) although ADR-033 requires a mirror to carry no unattributable figure.
4. The constitution reserves two design-system duties to "the slice that first
   needs it" — the sidebar icon-rail width token and the sticky table header the
   stylesheet does not yet provide — but `ROADMAP.md`'s First obligations table,
   whose purpose is to give every such duty an owner, named neither.
5. The five installed core templates under `.specify/templates/` differ from
   their project overrides by 24 to 244 lines and carry no Wafar rule. They are
   the last fallback in the resolution stack and are never the file a run
   resolves, but nothing in the files themselves said so, so a reader opening a
   core template directly could take it for the binding one.

**Decision.** (1) The line-ending and encoding policy is recorded once, as this
ADR; `.gitattributes` cites it and states that encoding is the same decision's
other half. No new attribute is introduced, so no file's stored bytes change.
(2) Every rule restated in `Project-Technologies.txt` is replaced by a pointer to
the constitution section that owns it. The mirror keeps what the register
delegates to it — versions, the per-technology note, the repository trees, the
licence facts, and which tool serves which mandate. (3) The analyzer row names
its open gap, the Redis client row names R3 and states that a candidate is not
an approval, and the two unattributable figures are removed. (4) `ROADMAP.md`
names R1 for the rail-width token and R5 for the sticky table header. (5) The
eleven records ADR-020 to ADR-030 carry their header in the same
`**Status**: / **Date**: / **Constitution version**:` form as the rest of the
file; wording and dates are unchanged. (6) Each core template carries a header
banner naming the override that replaces it and stating that it is the fallback
layer; the banner is a comment, so the template's own structure, including the
tasks template's frontmatter, is unchanged and no override content changes.

**Alternatives considered.** *(added 2026-10-05, audit follow-up)*
- **Add `*.md text eol=lf` for every file type explicitly.** Rejected: the file
  already carries an explicit per-type ladder (`*.md`, `*.txt`, `*.json`,
  `*.yml`, `*.yaml`, `*.css`, `*.sh` on LF, `*.ps1` on CRLF) beneath the
  catch-all `* text=auto`, and a second overlapping pattern would add a line a
  reader must reconcile without changing a single stored byte. (Corrected
  2026-10-05 by ADR-053: this paragraph originally claimed a broader Markdown
  pattern already covered the case, which was not what the file contained.)
- **Normalise the encoding of the two mirror files in the same change.** Rejected:
  ADR-035 established that the mirrors decode correctly and that the earlier
  console garbling was a display artifact. Rewriting them would change stored
  bytes to fix a problem that does not exist in the files.
- **Delete the core fallback templates instead of labelling them.** Rejected: they
  are the last layer of the resolution stack. Removing them leaves a failed
  resolution with nothing to fall back to, which is a worse failure than an
  unlabeled fallback that says what it is.
- **Assign the two missing design-system duties to "the slice that first needs
  them",** as the constitution phrases it. Rejected: that is the defect this
  record's fourth decision item exists to close. A duty with no named owner is
  unowned by definition, and `ROADMAP.md`'s First obligations table exists so that
  no duty is left that way.

**What deliberately did not change.** The constitution is not amended and no
version stamp moves: no rule, register, value, limit, slice, or dependency
changed, and every rule the mirror used to restate is already binding in the
constitution. No line-ending attribute changed, so no file is rewritten.
`wafar.single.css` is not touched: its eight `--screen-*` tokens were verified to
be declared once each and never referenced, which is exactly the state the
constitution's Breakpoints table records, and that table already requires the
first surface that wires a token to delete the ones it leaves unused. Deleting
them now would remove a registered ladder that no slice has needed yet. The core
templates stay in place, because the resolution stack's last layer must exist.

**Consequences.** A reader of the mirror now learns which technology serves a
mandate and where the mandate is written, and the register stays the single
source. The constitution's Design System Standards keeps reserving the rail
width and the sticky header to the first slice that needs them; R1 and R5 are
now that named assignment, so neither can be built as if the token and the
component already exist. A core template opened directly now says on its first
line that it is the fallback and names its override; a Spec Kit refresh may
restore the installed default, which is harmless because the override still
resolves first. Living ADR range strings move to ADR-001 … ADR-039.
This entry is the durable record.

---

## ADR-040 — The canonical columns of a part: its price, and the original number

**Status**: Accepted — 2026-10-05
**Owning directory**: `.specify/memory/`, `docs/`, `Core-Project.txt`, `ROADMAP.md`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner. R3 is the first slice to implement the extraction rules it states, R5 the first to render the price column.

**Context.** The constitution was written against a description of supplier
catalogs that named five part fields: part number, name, brand, car model, and
description. Real supplier files carry more. Reading actual files supplied by
Libyan suppliers produced seven findings the constitution did not cover:

1. **No price anywhere.** Not in the Glossary's part fields, not in the
   registers, not in a single line of the constitution. The only mention of
   price was a prohibition: the cart MUST NOT carry one. A merchant's stated
   task is to find the same part across several suppliers' files and compare
   what each charges, and the platform had no column to do it with.
2. **No original (OEM) number.** This is the identifier that tells the platform
   two rows are the same part — `565002W300`, `96018975/NP10`,
   `OK30A-1335ZB`. It was the subject of a deferral, "the treatment of
   supplier-assigned identifiers", but it was never a named field, an
   invariant, or an open fact, so no slice could have implemented it.
3. **One source column carrying three different facts.** "Type/country" holds
   country of origin (Korean, Chinese, Taiwanese), manufacturing grade
   (original, commercial), and brand names (DONGEL, MUP, RIK, MJ, B.G.F) in one
   column. Unsplit, it is neither filterable nor sortable.
4. **Car model and year range printed inside the name.** "Honda Civic air riyo
   2018-2020" arrives as one string, while the constitution separates `name`
   from `car model`.
5. **The same part from two suppliers has no representation.** A part belongs
   to exactly one catalog, which is correct and unchanged; but nothing recorded
   that two parts with equal original numbers are the same part, so nothing
   could show a merchant both prices.
6. **No price-parsing rule.** Suppliers print `123.000` for 123 dinar — the
   period is a decimal separator — while other files print `125`, `123`, `25`
   bare. Nothing said how to read either form, or a price carrying more than
   one separator.
7. **No rule for a value whose column is unclear.** Some files print two
   columns merged, with their contents interleaved. Column Normalisation
   existed as a feature name with no rule behind it.

**Decision.** The constitution is amended to 2.18.0 (MINOR: one deferred area
discharged, two new facts binding across entities, one new open fact, and rules
in Product Scope, Product Register, File Processing Rules, and Principle VI):

- **Canonical columns fixed: six.** A part carries part number, name, car
  model, original number, type, and price. The Glossary is their single source.
  The car model is separated out of the name when a supplier prints it there.
  `type` is one free-text column holding what suppliers print as a single
  type/country column — brand, country of origin, and manufacturing grade
  together — which is why it is not sortable. There is no description column: it
  is neither extracted nor stored. The parts table adds the supplier's name,
  which is read through the `suppliers` module and is not a part column.
- **Every column is always shown, and every one is sortable except `type`.**
  Part number and original number are searched through the search field by
  partial match rather than chosen from a list, because a list of every part
  number in the platform is the size of the table itself; car model, type,
  catalog file, and supplier are multi-select filters in which no selection
  means every supplier; the price takes a minimum and a maximum.
- **The price renders as a decimal point with exactly three decimal places and
  no thousands separator** — ten dinar reads `10.000` — with the denomination
  named once in the column header rather than in every cell. A part whose
  catalog prints no price reads «بدون سعر», never a blank and never a zero. A
  price printed in another currency is neither converted nor stored: the part
  reads «بدون سعر» for it.
- **The price is a catalog attribute, not an offer.** It carries no quantity,
  no discount, no currency conversion, and no checkout state; the cart renders
  none of it; only the administrator edits it; it is sortable and filterable
  like any column.
- **Registered merchants see the price, guests do not.** A guest's read path
  projects the part without it, through its own allowlist, so redaction belongs
  to the projection rather than to a presentation layer hiding a column.
- **The original number is indexed, searchable, and identifies without
  merging.** Two parts with equal original numbers are the same part offered by
  different suppliers; the platform shows them side by side and introduces no
  equivalence entity, withdraws no row, and joins no two catalogs.
- **The supplier filter becomes multi-select**, where no selection means every
  supplier, and the original number is searched through the search field by
  partial match rather than chosen from a list. The filter set stays car model,
  type, catalog file, and supplier, plus the price range; country of origin is
  part of the `type` column and is not a filter of its own (Product Scope →
  Parts; Product Fact Clarifications).
- **Assignment is the pipeline's own work.** Every extracted value goes to its
  canonical column automatically; no manual mapping step sits between upload and
  processing, and a merchant is never asked to map columns. There is no "unassigned" class of value
  and no counter for one. A value that belongs to no canonical column is part of
  no stored column and is not stored. A merged or overlapping source column is a
  case of this rule, not an exception to it.
- **Price denomination fixed, one ambiguity recorded.** Libyan Dinar; the
  period and the comma are decimal separators, so `123.000` is 123 dinar. A
  printed price carrying more than one separator, or a file that separates
  thousands, is a recorded unresolved product fact owned by R3.

**Alternatives considered.**
- *Keep the price out and leave comparison to the merchant.* Rejected: it is the
  problem the product exists to solve, and it was decided by leaving it
  unstated rather than by choosing against it.
- *Add a price to the cart.* Rejected outright: Principle VI forbids it, and a
  cart that carries a price is a purchase metaphor the scope does not permit.
- *Introduce a `PartEquivalence` entity and merge duplicates.* Rejected: it adds
  an eleventh entity, changes the invariant that a part belongs to exactly one
  catalog, and builds a merge the administrator would have to undo. Identifying
  and showing side by side answers the merchant's question without any of that.
- *A manual column-mapping screen where the merchant or the administrator maps
  each supplier's columns.* Rejected as the default: it puts a per-file chore in
  front of every upload, which is the friction the product removes. It stays
  available as a later remedy if R3's accuracy proves insufficient.
- *Split "type/country" into country of origin and brand only, discarding the
  grade.* Rejected: original-versus-commercial is exactly the manufacturing-
  quality difference a merchant compares, and discarding it loses the second
  half of the comparison. The grade is stored as free text, which costs one
  nullable column and no enumeration to maintain.
- *Enumerate the grade against a fixed list.* Rejected: suppliers invent grades,
  and a fixed list would reject real values or need a constant extension path.
- *A maximum page, row, or column count per file.* Rejected: the merchant's real
  files reach 120 pages of tables, and a new cap would reject revenue-bearing
  uploads. The existing 100 MB ceiling and the five-minute processing budget
  already bound the work, and a file that exceeds the budget is visible as
  `failed` with a retry rather than silently truncated.
- *A running counter of values the extraction could not place.* Rejected: the
  canonical columns are complete for a parts table and `type` absorbs the
  variable cells, so the counter would always read zero and read as a defect
  rather than as an answer. A value that belongs to no canonical column is
  simply not stored.
- *Let the pipeline guess a column and record its confidence.* Rejected: a
  wrongly filled column is not recoverable by a later run, while storing nothing
  is.
- *A column-review screen, per file, that a merchant or an administrator
  corrects.* Rejected: showing every column in the table is what lets a merchant
  spot a wrong value without a second surface, and a correction path on the
  merchant side would be a write capability the roles register does not grant.
- *Three stored columns for brand, country of origin, and grade, shown in one
  cell.* Rejected: it buys per-attribute filtering at the cost of a rule for
  packing three values into one cell, and suppliers print them together anyway.
- *A checkbox list of every part number.* Rejected: it is the size of the table
  it filters, and it duplicates the search field the platform already has.
- *A price as a range filter with two sliders.* Not chosen; a minimum and a
  maximum is the form registered, and the control itself is the design system's.
- *A thousands separator, or the currency repeated in every cell.* Rejected: the
  separator would read as a decimal point in a market that writes `123.000` for
  123 dinar, and repeating the unit in every cell crowds a table that already
  carries eight columns.

**What deliberately did not change.** The Principle VI prohibition on price in
the cart is untouched and restated; the status enum stays at four values; no
entity is added, renamed, or removed, so the ten-entity register and the
ten-module map are unchanged; no page is added and the page count stays at
twenty-six; no Usage Limit changes; the deferred area "Retrieval interface" is
untouched, so ranking beyond the sortable columns is still R5's.

**Consequences.** The Glossary's `Part` entry, the `Price` / `Original number` /
`Canonical column` entries, Principle VI, the Product Scope Parts row and the
Sign-Up-adjacent scope, the Roles table, the Data entities register, File
Processing Rules, the icon-set register gap's neighbour rows, and Product Fact
Clarifications all move in this change, together with the four stamps and the
`docs/domain-model.md` Part invariants. The "Catalog data shape" deferral is
discharged at the product level and narrowed to what remains below it — column
types, constraints, indexes, and a part's page and row of origin — so R3's plan
records a smaller gap than it did. `Core-Project.txt` gains the
supplier-column-to-canonical-column table and the price and comparison
acceptance criteria; `Project-Technologies.txt` gains a 2.18.0 additions section
that binds the still-open extraction-library gap without naming a library. This
entry is the durable amendment record.

---

## ADR-041 — Registration is Libya only, and the dial-code selector is removed

**Status**: Accepted — 2026-10-05
**Owning directory**: `.specify/memory/`, `docs/`, `Core-Project.txt`
**Owning feature**: none — governance decision; ratified by the repository owner. R1 implements the change.

**Context.** The constitution described Wafar as "an Arabic-language platform
for Libyan merchants" and gave the Libyan city list, the Libyan default, and
Libyan content throughout — but Sign Up carried an **Arab-country dial-code
selector** showing flag, country name, and code, default Libya +218, introduced
by ADR-030. The product statement is "a project in Libya only". A selector
invites a Tunisian, Egyptian, or Sudanese trader to register against a city
dropdown that lists Libyan cities only, which produces an account whose city is
not in its own country and whose platform is not built for its market.

**Decision.** The constitution is amended to 2.18.0: registration is Libya-only.
Every account is a Libyan mobile number on +218; Sign Up carries no dial-code
selector; a number outside +218 is rejected. The number is still stored in
E.164 form, and the account's city still comes from the Libyan city list. This
supersedes the dial-code selector part of ADR-030 and leaves the rest of it —
phone-only authentication, no email anywhere, OTP at sign-up, no OTP at
sign-in — in force.

**Alternatives considered.**
- *Leave the selector and rely on the Libya default.* Rejected: a default is a
  starting value, not a constraint, and nothing rejected the other values.
- *Keep the selector and restrict the data.* Rejected: it leaves the same
  contradiction visible on the sign-up form, and adds a rule that a Libyan city
  must belong to a Libyan account.
- *Block non-Libyan numbers at the city dropdown.* Rejected: validation at the
  wrong end. The number is the identifier, so the identifier is where the rule
  belongs.

**What deliberately did not change.** No page is added or removed; the Libyan
city list is untouched and stays R1's reference data; the mobile number remains
the sole account identifier in E.164 form; no feature number or slice order
changes.

**Consequences.** The Product Scope Sign Up row drops the selector, the Data
entities `User` row fixes the country code at +218, a scope note states the rule
beside the OTP requirement, and Product Fact Clarifications carries
"Libya-only registration" with the amendment route for opening another country.
`docs/domain-model.md`'s `User` row and `Core-Project.txt`'s sign-up row move in
the same change. Opening registration elsewhere is an amendment to the
constitution, not a configuration change.

---

## ADR-042 — No emoji in user-facing text, and an open-source SVG icon set

**Status**: Accepted — 2026-10-05
**Owning directory**: `.specify/memory/`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner. R1 selects and installs the set.

**Context.** The constitution prohibited Arabic-Indic numerals, positive
letter-spacing on Arabic, physical direction properties, raw Tailwind colours,
non-token design values, and typefaces outside the registered three — and said
nothing about emoji. An emoji in a button label or an empty state is a glyph
from an operating-system font: it renders differently per device, cannot be
recoloured by the design system's tokens, does not honour RTL mirroring, and
cannot be checked by the committed Stylelint and ESLint configuration the way
every other design value is. Separately, the icon set is a registered gap owned
by R1 with no constraint on its source, while Dependency Governance already
forbids GPL-family licences in anything shipped to a merchant.

**Decision.** The constitution is amended to 2.18.0: emoji MUST NOT appear in
any text a person reads inside the platform — every screen of the public site,
the merchant area, and the administrator application, and the body of every SMS
the platform sends — and an icon MUST be an SVG from the approved icon source; an
emoji glyph is not an icon and must not stand in for one. The ban covers every
surface a user or an administrator reads and nothing else: governance documents,
code identifiers, and code comments are outside it. The icon-set register gap gains
its constraints: an open-source set under a permissive licence (MIT, Apache-2.0,
ISC, or BSD), self-hosted as SVG. No library is named, because naming an
unvetted one is exactly what the register-gap rule prohibits.

**Alternatives considered.**
- *Ban emoji everywhere, including governance documents and code comments.*
  Rejected: the two Arabic mirrors already use emoji in their section headings,
  and the ban's purpose is what a person reads. Widening it would rewrite
  documents for no user-visible gain and would put the rule outside the
  Principle V framing that gives it force.
- *Cover the merchant surfaces only.* Rejected: an administrator reads the same
  platform, an OTP arrives by SMS, and a rule with a list of six surfaces is a
  rule a reviewer applies inconsistently. Naming the boundary as "anything a
  person reads inside the platform" states one test instead of six cases.
- *Name an icon library now.* Rejected: the register-gap rule prohibits naming
  an unvetted library, and the licence check and vulnerability scan are R1's to
  run. Naming one here would pre-empt both.
- *Allow emoji as a fallback when an icon is missing.* Rejected: a fallback that
  is permitted becomes the path of least resistance, and it reintroduces the
  un-tokened colour and the per-device rendering.
- *A static check for emoji in user-facing strings.* Deferred, not rejected: the
  committed Stylelint and ESLint configuration already enforces the physical-
  direction and non-token rules, and an emoji check is a reasonable extension
  to it. R1 records it if it adds one.

**What deliberately did not change.** `wafar.single.css` is not touched: it
carries no emoji and no icon glyphs, and the design system's values are
unchanged. The typefaces, colours, spacing, and motion scales are unchanged. No
page, feature, or dependency is added.

**Consequences.** Principle V gains the emoji rule; the icon-set register gap
gains the licence, self-hosting, and no-emoji constraints; Product Fact
Clarifications carries "No emoji in user-facing text" with its scope stated so a
reviewer does not read it wider than it is; `Project-Technologies.txt` records
the constraints on the still-open gap in its 2.18.0 additions section and notes
that no static check is registered for them yet.

---

## ADR-043 — Supplier names are normalised, and never merged by normalisation

**Status**: Accepted — 2026-10-05
**Owning directory**: `.specify/memory/`, `docs/`, `Core-Project.txt`
**Owning feature**: none — governance decision; ratified by the repository owner. R3 implements the normalisation.

**Context.** A supplier's name is read from a catalog's first page, and the
real names are long and unstable: "شركة مسار اول الجديد لبيع قطع السيارات",
"شركة المتميز لبيع قطع الغيار كوري يباني". Two files from one company differ by
a legal-form word, a purpose word, and whitespace. The supplier is a filter on
the parts table and a column in the catalog page, so one company appearing under
three spellings splits its parts across three filter entries — which is the
defect a merchant searching "who has this part" actually feels. Nothing in the
constitution, the domain model, or the roadmap addressed it.

**Decision.** The constitution is amended to 2.18.0: a supplier name read from
a first page is normalised before it is stored or compared — whitespace
collapsed, leading and trailing punctuation dropped, and a legal-form word such
as `شركة` or `مؤسسة`, or a trailing purpose word such as `للبيع`, removed.
Normalisation makes two spellings of one name compare equal. It MUST NOT merge
two suppliers, and only the administrator can merge them. The name is not
case-folded and not transliterated: Arabic orthography is not normalised, so a
name differing only in hamza form stays two names rather than becoming one
wrong name.

**Alternatives considered.**
- *Merge suppliers automatically when normalised names match.* Rejected:
  collapsing two genuinely different companies into one is invisible and
  unrecoverable, and it would merge a supplier's catalogs across merchants. The
  safe half of the idea — making spellings compare equal — is what was taken.
- *Fuzzy matching on the name.* Rejected as an extraction rule: it belongs to
  the Extraction algorithm deferral owned by R3, and it must not silently decide
  that two companies are one.
- *Ask the merchant to confirm the supplier on upload.* Rejected as a default:
  it adds a per-file step to the flow the product exists to remove. It remains
  available to the administrator on the Suppliers page, which R13 already owns.
- *Full Arabic orthographic normalisation (hamza, taa marbuta, alef forms).*
  Rejected: it changes the name a merchant recognises on their own supplier's
  letterhead, and a wrong "equal" name is worse than two filter entries.

**What deliberately did not change.** No entity is added; `Supplier` keeps its
cardinality (one supplier in many catalogs) and its owning module; no filter
changes on the parts table; no page is added, so the Suppliers page remains R13's.

**Consequences.** File Processing Rules carries the normalisation rule and its
prohibition on merging; the Glossary's `Supplier` entry states the normalised
form and that only the administrator merges; `docs/architecture.md`'s `suppliers`
module row and `Core-Project.txt`'s supplier-column row move in the same change.
The administrator's merge operation itself is R13's, and this record names it as
the only path to one supplier holding two spellings' catalogs.

---

## ADR-044 — Constitution 2.18.1: part-name year ranges stay in the name

**Status**: Accepted — 2026-10-05
**Owning directory**: `.specify/memory/constitution.md`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context.** `Core-Project.txt` carried two conflicting statements: L245 implied
a printed year range is separated out of the part name, while L251 said years
stay inside the name. The constitution was silent, so the mirror was its own
contradiction.

**Decision.** The constitution's `Glossary → Part` entry now states that a
printed year range (for example `2018-2020`) that rides inside the name is NOT
extracted into its own column and stays part of the part name, while the car
model itself is still separated out. PATCH 2.18.1.

**Consequences.** `Core-Project.txt` L245 is a later repair; the constitution
wins and now states the rule.

---

## ADR-045 — Constitution 2.18.2: cart label, diacritics, unused-token note, price shape

**Status**: Accepted — 2026-10-05
**Owning directory**: `.specify/memory/constitution.md`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context.** Four clarifications were needed: the cart's user-facing Arabic
label; how the trade-name diacritics apply between the Arabic form and the
Latin word; which design tokens are declared-but-unused; and the price example
shape.

**Decision.** The constitution is amended to 2.18.2 (PATCH):
- The cart's user-facing Arabic name is «سلة المشتريات» in Principle VI, the
  Glossary «Cart» entry, and Product Fact Clarifications. It remains a
  personal bookmark list with no price, quantity, or checkout state. This
  supersedes ADR-038's «المحفوظات» clause for the cart label; dependent
  documents still naming «المحفوظات» are repaired in the follow-up pass.
- «Wafar» (وَفَّر): the mandatory diacritics bind the Arabic form «وَفَّر»;
  the Latin «Wafar» carries none.
- The Breakpoints note now also names `--sidebar-width`, `--navbar-height`,
  and `--touch-floor` as declared-but-unused until a slice consumes them.
- The price shape gains the example `15.000` next to `10.000` wherever the
  three-decimal LA-dinar form is defined.

**Consequences.** Version stamps and cart-label mirrors are repaired in the
same change; dependent documents keep their old label only until the repair
lands.

---

## ADR-046 — Constitution 2.18.3: notification admin-reply, unused shadow ladder note

**Status**: Accepted — 2026-10-05
**Owning directory**: `.specify/memory/constitution.md`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context.** The Glossary «Notification» definition did not list an
administrator's reply to a user's message even though `Core-Project.txt` and
the R10 path require such a notification. Separately, the Breakpoints note
counted only the clearly-unused `--screen-*` ladder and one token, while the
stylesheet also declares but never consumes the navbar/sidebar/touch-floor
tokens and the entire shadow ladder.

**Decision.** The constitution is amended to 2.18.3 (PATCH):
- «Notification» now explicitly covers a processing outcome, an administrative
  message, or an administrator's reply to the user's message.
- The Breakpoints note now records `--sidebar-width`, `--navbar-height`,
  `--touch-floor` (and its siblings), and the full shadow ladder plus its
  named shadows as declared-but-unused until a slice consumes them.

**Consequences.** PATCH only; no product fact, slice, or register changes.

---

## ADR-047 — Audit fix set: commit state, manifest hashes, cart label, filter set, stamp sites

**Status**: Accepted — 2026-10-05
**Owning directory**: `.specify/memory/`, `.specify/integrations/`, `.specify/templates/`, `docs/`, `ROADMAP.md`, `Core-Project.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A full repository audit compared the working tree against `HEAD`
(audit fix sets ADR-031 through ADR-039 committed at `07a5839`, constitution
v2.17.0) and found six defects, one of them structural.

1. **The whole v2.18.x amendment set was uncommitted.** The working tree carried
   constitution v2.18.3 and ADR-040 through ADR-046 (2026-10-05) while `HEAD`
   still read v2.17.0, so Principle I's traceability chain (requirement → task →
   commit) had no commit at the governance level and ADR-033's own operating
   rule — an audit fix set is committed before the next amendment's edits —
   was broken for every record since 2026-10-03.
2. **Integration manifest hashes were not re-recorded.** The five binding
   template overrides under `.specify/templates/overrides/` were edited to the
   v2.18.3 binding block, and `.clinerules/project-context.md` gained the
   emoji/Libya rules, but the hashes in
   `.specify/integrations/speckit.manifest.json` and

   **Annotation (2026-10-05, ADR-048).** `.clinerules/project-context.md` was
   deleted by ADR-048; the five overrides are what the hash defect concerned, and
   ADR-048 and ADR-050 re-recorded them.
   `.specify/integrations/cline.manifest.json` still recorded the pre-v2.18
   files (verified: override hashes MISMATCH; `project-context.md` recorded
   `ec5cb5c3…` against actual `4bb01e55…`). ADR-022/024/027/033/034 require the
   hashes to move in the same change.
3. **A superseded cart label survived in the product mirror.**
   `Core-Project.txt` line 57 read «يضيف للمحفوظات» while ADR-045 fixes the
   cart's user-facing name as «سلة المشتريات» and every other occurrence in the
   mirror already used it.
4. **ADR-040 promised a filter the register does not carry.** Its Decision said
   the filter set gains "the original number and the country of origin", while
   the constitution's Parts scope registers the search field, multi-select over
   car model/type/catalog file/supplier, and a price range, and fixes country of
   origin as part of the free-text `type` column.
5. **ADR-028, ADR-030, and ADR-034 named stamp sites the Governance procedure
   does not.** Their consequence lists said version stamps move in `AGENTS.md`
   and `README.md`; the amendment procedure names only the constitution footer,
   the template overrides, the constitution-template scaffold,
   `docs/architecture.md`, `docs/domain-model.md`, `ROADMAP.md`, and
   `Project-Technologies.txt`. `AGENTS.md` and `README.md` carry no stamp.
6. **Smaller drift.** ADR-025's Consequences still described R1 performing "the
   `1.0.2` change" its own annotation had superseded; ADR-019's Context still
   attributed seven field identifiers to the Arabic mirror that ADR-034 showed
   appeared only in earlier drafts; ROADMAP R9 omitted the administrator-reply
   notification source the Glossary now carries (ADR-046); Product Scope and
   Product Register stated the page-addition route in two different forms; and
   `Core-Project.txt` read "50 ملف/شهر" where the register reads "per calendar
   month".

**Decision.**

1. The v2.18.x working-tree set (ADR-040 through ADR-047) is committed; `HEAD`
   moves to the amended constitution. This record is the durable amendment
   record for the set and for the repairs below.
2. The hashes in `speckit.manifest.json` and `cline.manifest.json` are
   re-recorded for every file edited by the v2.18.x set, per the ADR-022
   practice.
3. `Core-Project.txt` line 57 reads «يضيف إلى سلة المشتريات».
4. ADR-040's filter bullet is corrected in place, before ADR-040 is committed,
   per the "corrections before ratification" practice its own record states: the
   original number is searched through the search field, the filter set stays
   car model, type, catalog file, supplier, and the price range, and country of
   origin remains part of `type`.
5. ADR-028, ADR-030, and ADR-034 name `Project-Technologies.txt` (and drop
   `AGENTS.md`/`README.md`) as stamp sites, and state that the latter two carry
   no constitution version stamp.
6. The clarification to Product Scope in item 1 is PATCH semantics only (the
   page-addition route is clarified; no rule, register, limit, or scope
   changes), so the constitution version moves to **2.18.4** and every stamp
   site named by the Governance amendment procedure moves with it. The living
   ADR range strings move to ADR-001 … ADR-047.
7. ADR-025's Consequences is aligned with its annotation; ADR-019 gains an
   annotation pointing at ADR-034's correction; ROADMAP R9 names the
   administrator-reply source; the page-addition route is stated identically in
   Product Scope and Product Register; and `Core-Project.txt` reads "50 ملف لكل
   شهر ميلادي".

**Alternatives considered.** *(added 2026-10-05, audit follow-up)*
- **Commit the amendment set first, then apply the fixes.** Rejected: that
  produces two commits where the working tree was already a single uncommitted
  set, and the second commit would then be the one a reviewer has to reconstruct
  history for. One fix set, one record, one commit.
- **Commit the tree as-is and record the defects as known debt.** Rejected: the
  defects are stamp drift and stale hashes, the two classes a reader cannot
  detect from the files themselves. Deferring them means the next amendment
  starts from a tree whose stamps are wrong, which is how this defect recurred.
- **Rewrite ADR-040's filter bullet without recording that it was rewritten.**
  Rejected: the record's own Context states the "corrections before ratification"
  practice, which exists so a reader can see that a record's text moved before it
  was committed. Dropping the trail defeats the practice.
- **Re-record the five stale manifest hashes but leave the history alone.**
  Rejected: the hashes describe the pre-fix files, so not re-recording them leaves
  the manifest asserting something untrue about the repository.

**What deliberately did not change.** No principle, module map, entity, page
count, Usage Limit, or slice order changes. The page-addition route is made
consistent by naming both gates, not by removing either. The cart label's
authority stays ADR-045. No dependency is added, so no licence record or
vulnerability scan accompanies this record.

**Consequences.** The governance tree is committed and its traceability chain is
whole again; the integration manifests agree with the templates they describe;
and the product mirror and the governing registers state the same cart label,
filter set, and quota window. This entry is the durable record.

---

## ADR-048 — Cline integration retired; constitution 2.18.5; BOM repair; mirror label completion

**Status**: Accepted — 2026-10-05
**Owning directory**: `.specify/`, `.opencode/`, `docs/`, `Core-Project.txt`, `ROADMAP.md`, `AGENTS.md`, `README.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep review of the governance tree (after ADR-047 committed
`v2.18.x`) found the Cline integration was left half-removed, and uncovered a
handful of defect-classes that had survived the earlier audit because PowerShell
console encoding (Windows-1252 default) masked the Arabic label search and
because `.clinerules/` was still treated as a live tree.

1. **The Cline integration is retired, not merely broken.** The working tree's
   `.clinerules/` directory (24 tracked files) had been deleted, but live
   references to it still existed: `.specify/integration.json` still listed
   `claude`'s sibling `cline` as installed, `.specify/extensions/.registry`
   still registered `cline` under three commands, `.specify/workflows/speckit/
   workflow.yml` still listed `cline` in the compatible integrations hint, the
   constitution's References table pointed at `.clinerules/project-context.md`,
   and `.specify/integrations/cline.manifest.json` still held 24 stale hashes of
   the now-deleted files. The repository now operates on `opencode` only.
2. **`Core-Project.txt` line 157** still wrote the superseded cart label
   «المحفوظات» in the parenthesised add-to-cart column, so the mirror was not
   fully repaired. An escaped-Unicode scan shows every «سلة المشتريات» elsewhere
   and this one remaining «المحفوظات».
3. **`.specify/memory/constitution.md` carried a UTF-8 BOM** (`EF BB BF`),
   present since commit `7070e28` (Constitution 2.13.0). `.gitattributes` and
   ADR-039 fix "UTF-8, no BOM" as the encoding policy, so the constitution
   contradicted its own rule. It was also the only tracked text file with a BOM.
4. **ADR-033 item 9, ADR-037's Consequences, and ADR-038's Consequences still
   named `AGENTS.md` and `README.md` as version-stamp sites** — the same
   over-claim repaired in ADR-028/030/034 by ADR-047. They were left untouched,
   so live statements disagreed with the Governance stamp list.
5. **`.specify/memory/.constitution-template.json` was stale.** It cached a
   hash of the core constitution template from the bootstrap commit that no
   longer matched the template the resolution stack produces.

**Decision.**

1. **Cline is removed from the live surface.** `.clinerules/` is deleted from
   the repository and its deletion is committed; `.specify/integration.json`
   lists `opencode` only (settings without `cline`); the three `cline` blocks
   are removed from `.specify/extensions/.registry`; the `cline` hint is
   removed from `workflow.yml`; `.specify/integrations/cline.manifest.json` is
   deleted; and the constitution's References table drops the
   `.clinerules/project-context.md` row. Cline's command files under
   `.clinerules/workflows/` are likewise deleted.
2. **The constitution moves to 2.18.5** (PATCH: the References row is removed,
   a non-normative correction; no rule, register, limit, page, entity, or slice
   changes). Every stamp site the Governance amendment procedure names moves
   with it: the constitution footer, the binding blocks of the spec/plan/tasks/
   checklist template overrides, the scaffold footer of the
   constitution-template override, and the stamps in `docs/architecture.md`,
   `docs/domain-model.md`, `ROADMAP.md`, and `Project-Technologies.txt`. The
   living ADR range strings move to ADR-001 … ADR-048.
3. **ADR-033/037/038 stamp-site phrasing is corrected by this record**, not by
   rewriting the accepted records: `AGENTS.md` and `README.md` carry no
   constitution version stamp, and any future amendment's stamp set is exactly
   the Governance list recorded above. The earlier ADR-047 correction of
   ADR-028/030/034 stands, and this extends it.
4. **`Core-Project.txt` line 157** now reads «…زر + … (إضافة إلى سلة المشتريات)»,
   completing the ADR-045 mirror repair.
5. **The BOM is removed from `.specify/memory/constitution.md`**, restoring the
   ADR-039 encoding ("UTF-8, no BOM, legible Arabic") for the constitution.
6. **`.specify/memory/.constitution-template.json` is re-recorded** against the
   current core `constitution-template.md` (`ce754954…` → the current
   `3f4b810a…`), so the cache matches what the resolution stack now produces.
7. **`Project-Technologies.txt` gains a Constitution 2.18.5 additions note**
   and its party/header sync marker is advanced (ADR-047 remains listed).

**Alternatives considered.** *(added 2026-10-05, audit follow-up)*
- **Keep Cline installed but unused.** Rejected: the integration registry,
  `integration.json`, and the manifest are the machine-readable surface a future
  `speckit.integrate` reads. Leaving a retired integration registered leaves a
  command a reader can run that the repository no longer supports.
- **Delete the Cline extension from `.specify/extensions/` but keep the command
  files.** Rejected: the command files are the extension's only reason to exist,
  and a command with no extension behind it is the harder state to detect.
- **Re-point the Cline commands at opencode and keep one set of files.**
  Rejected: the two integrations disagree in frontmatter and workflow naming, so
  one file set cannot serve both. ADR-026 already made the git extension
  integration-agnostic; the speckit commands were not.
- **Rewrite the historical Cline statements in ADR-007, ADR-026, and ADR-027.**
  Rejected, and this record extends ADR-049's answer: a decision record is a
  history. The forward reference to a deleted directory is annotated instead, so
  a reader of the old record learns the path is gone rather than silently
  following it.

**What deliberately did not change.** No principle, module, entity, page,
feature, or Usage Limit changes. Earlier ADR records in `docs/DECISIONS.md`
that mention Cline (ADR-007, ADR-026, ADR-027, ADR-037, ADR-038, and the
ADR-047 context paragraph) are kept as history; their cline statements are not
rewritten, because a decision record is a history. The cart's identity stays a
personal bookmark list (Principle VI) under its ADR-045 label. The
greyed-out cline integration on **any** Spec Kit installation is unaffected;
only this repository's registration and manifest entries are removed.

**Consequences.** The repository declares `opencode` as the single installed
integration; no live file references a path that no longer exists; the
constitution agrees with `.gitattributes` on encoding; and the mirror's cart
label is consistent. This entry is the durable record.

---

## ADR-049 — Constitution 2.18.7: consolidate the unrecorded 2.18.6 and 2.18.7 amendments, and repair the registry drift they exposed

**Status**: Accepted — 2026-10-05 | **Constitution version**: 2.18.7

**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`,
`.specify/workflows/`, `docs/`, `ROADMAP.md`, `Project-Technologies.txt`,
`Core-Project.txt`, `AGENTS.md`, `README.md`, `docs/architecture.md`,
`docs/domain-model.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A full audit of the repository's registries (constitution, mirror,
`Project-Technologies.txt`, `Core-Project.txt`, `docs/architecture.md`,
`docs/domain-model.md`, `ROADMAP.md`, `wafar.single.css`, and the template
overrides) found one defect class repeated across files. The constitution's
working tree carried version 2.18.7 while every dependent stamp still read
2.18.5, and no ADR recorded the 2.18.6 or 2.18.7 amendment. This is the exact
failure ADR-047 recorded in its Context and closed for 2.18.4; it recurred.
Three further findings travelled with it: a review-only comment block labelled
"MUST NOT be committed" was committed inside the constitution (against ADR-010
and the Governance amendment procedure); two index anchors in this file did not
resolve to their headings; and the design register named a display exception
("the quick-actions grid") that the Product Register never scheduled.

**Decision.**
1. **The 2.18.6 and 2.18.7 amendments are consolidated here and the constitution
   footer stands at 2.18.7.** 2.18.6 and 2.18.7 were both PATCH: non-semantic
   wording, de-duplication, and registry alignment. No principle, register,
   limit, page, entity, or slice changed across the pair. Every stamp site the
   Governance amendment procedure names moves with it: the constitution footer,
   the binding blocks of the spec/plan/tasks/checklist template overrides, the
   scaffold footer of the constitution-template override, and the stamps in
   `docs/architecture.md`, `docs/domain-model.md`, `ROADMAP.md`, and
   `Project-Technologies.txt`. The living ADR range strings move to
   ADR-001 … ADR-049.
2. **The committed review block is removed from the constitution.** The sync
   impact report produced during an amendment is review material; ADR-010 and
   the Governance section require that it not be committed. Its findings are
   carried by this record instead. The constitution is re-saved as UTF-8 without
   a BOM, and the mojibake inside the removed block goes with it.
3. **The unregistered "quick-actions grid" display exception is struck from the
   design register.** The tables-only rule keeps one exception: the home page's
   statistical cards. The constitution's own Home page row and `Core-Project.txt`
   name that single exception and never schedule a quick-actions grid, so the
   second exception named a component with no page, no owner, and no slice. The
   rule is narrowed to what the Product Register schedules; a future
   quick-actions surface is a feature decision, not a register exception.
4. **Two broken index anchors in this file are repaired** (ADR-045, ADR-046) so
   every index row resolves to its heading.
5. **ADR-021 gains an annotation** on the single point ADR-033 superseded:
   `/speckit.analyze` is binding in the engine workflow as well as by hand.
6. **The cart label's mirror citation is corrected.** `Project-Technologies.txt`
   attributed the cart label to ADR-038 in one place and ADR-045 in another;
   ADR-045 supersedes ADR-038's label clause, so the citation is unified on
   ADR-045. The record is not rewritten.
7. **Two mirror-repair items are completed in `Core-Project.txt`**: the retired
   label «محفوظات» in the guest capability list becomes «سلة المشتريات», and the
   required page-flow transition `Parts → ?file=<id> → Parts`, which the
   constitution lists among the five required transitions and which
   `Core-Project.txt` omitted, is added beside the other four.
8. **`docs/domain-model.md`'s `Notification` row names the administrator-reply
   source** added by ADR-046 and carried by ROADMAP R9, so the domain model no
   longer reads narrower than the register.
9. **Two edits that were part of this change set are recorded here.** Neither
   changes a rule; both correct a note that read as if it governed a hook slot
   that does not exist. `.specify/workflows/speckit/workflow.yml` replaces the
   `after_converge: speckit.git.commit` hook comment with an accurate statement
   that the Spec Kit engine declares no `after_converge` slot, naming
   `after_implement` and `after_taskstoissues` as the nearest ones.
   `AGENTS.md` §5 records `speckit.git.initialize` as a mandatory
   `before_constitution` hook, records `feature_numbering: sequential` as the
   numbering mode, and states that hook states are read from
   `.specify/extensions.yml` rather than assumed. Both were verified against
   `.specify/extensions.yml` before being recorded.

**Alternatives considered.** *(added 2026-10-05, audit follow-up)*
- **Leave the two edits unrecorded** and let them ride as part of the stamp-set
  commit. Rejected: the Governance amendment procedure names an entry in this
  file as the durable record of a change, and an unrecorded change is exactly
  what this record was raised to stop.
- **Record them as a separate amendment.** Rejected: neither edits a principle,
  register, limit, page, entity, or slice, so neither is an amendment; a PATCH
  bump with nothing behind it would be noise in the version history.
- **Correct the two files again to remove the notes entirely.** Rejected: the
  notes are accurate and useful. `after_converge` does not exist, so the old
  comment named a hook slot the engine never had; removing the comment leaves the
  next reader to rediscover that fact from the extension registry.

**What deliberately did not change.** No principle text, module map, ownership
decision, entity, page count, Usage Limit, or slice order. The accepted records
ADR-033, ADR-037, and ADR-038 keep their stamp-site phrasing, which ADR-048
already answered by record rather than by rewriting; this record extends that
answer. The historical `2.18.5` mentions inside ADR-047 and ADR-048 are left as
history. `wafar.single.css` is untouched: the fourteen modules, the Decision
colour values, and the logical-properties rule all verified against it.

**Consequences.** This record established the 2.18.7 stamp set and moved the
living ADR ranges. Its stamp sites hold: ADR-050, which carried the set to
2.18.8, states the current values. The constitution no longer carries review
material, and the registers that mirror it name the same components, the same
cart label, and the same required transitions. This entry is the durable record.

**Annotation (2026-10-05, audit follow-up).** This record originally claimed that
"every version stamp in the repository reads 2.18.7 ... no outstanding debt".
That was not true of the tree this record shipped in: the constitution's own
footer still read 2.18.5, five `speckit.manifest.json` hashes still described the
pre-edit overrides, and the whole 2.18.6/2.18.7 set was uncommitted. Those three
defects are closed by ADR-050, which is why this record's Decision is read
together with it. The sentence above is corrected rather than deleted, because
the claim was the finding, not the intent.

---

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
discharged and one is still open, verified against the working tree rather than
inferred. `docs/architecture.md`'s omission of the nine fixed internal locations
is closed: it now carries an Internal layout table of nine rows at
`docs/architecture.md` §1.1, which ADR-055 recorded. `Core-Project.txt`'s
`created_at` column identifier is closed: the mirror contains no `created_at`
token at all, so ADR-019's fix stands again. The twenty-three ADR fields remain
open, and the mirror's gap coverage remains as ADR-057 left it. This record is
annotated rather than rewritten, so a reader of it alone sees the debt as it was
recorded and can read this paragraph for its present state.

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

---

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
