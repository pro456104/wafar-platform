# Decisions — Wafar

This file records design decisions with their alternatives and the reasoning
behind them. The constitution names it in References, and Documentation requires
every non-trivial decision to record what was considered and why the chosen
option won.

**Record duties (Documentation rule).** Every record below names the directory
that owns the decision and the feature that owns the work, per the Documentation
rule. Most were made by a constitutional amendment, but not all: ADR-001 to
ADR-007 were made during repository bootstrap on 2026-10-01, ADR-009 and ADR-011
recorded the design system's own decisions and the mirrors' encoding, ADR-012 to
ADR-013 were design-system and workflow decisions, and ADR-015 onward are
governance decisions ratified by the repository owner. The owning feature is one of
"none yet — repository bootstrap (pre-feature record)", "none — governance
decision; ratified by the repository owner", or the identifier of the slice that
first implements the decision. The bootstrap-era records state the reaffirmation
duty explicitly: the first feature whose plan depends on the record MUST name it
in that plan's Constitution Check, and from then on the record has a feature
owner.

A record is annotated when a later decision changes what it says, and corrected
when the record's own claim was wrong. Rewriting a ratified decision's substance
is not done; ADR-015 states that rule and this file follows it.

**Reading protocol (ADR-071).** This file is large and grows with every
amendment, so a reader — a person or an agent — MUST NOT read it end to end.
Read this index, then only the specific ADR records the change in hand touches.
The index's last row is the current ADR number, and it is the single authority
for the live `ADR-001 … ADR-0NN` range string that the governance documents
carry: `governance-drift-check.mjs` compares every live range string against
that last row, so a document whose range disagrees with the index is corrected
from the index rather than edited in its own words.

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
| [ADR-064](#adr-064--constitution-2231-and-wafarsinglecss-121-the-audit-fix-set) | Constitution 2.23.1 and wafar.single.css 1.2.1: the audit fix set | 2026-10-07 | 2.23.1 |
| [ADR-065](#adr-065--css-header-workflow-hint-and-r2-scope-defect-fix-set) | CSS header, workflow hint, and R2 scope defect fix set | 2026-10-07 | 2.23.1 (unchanged) |
| [ADR-066](#adr-066--constitution-2240-the-version-lives-in-two-sources-and-the-opensearch-client-owner) | Constitution 2.24.0: the version lives in two sources, and the OpenSearch client owner | 2026-10-07 | 2.24.0 |
| [ADR-067](#adr-067--constitution-2250-the-administrator-is-a-role-userstatus-and-two-new-entities) | Constitution 2.25.0: the administrator is a role, `User.status`, and two new entities | 2026-10-07 | 2.25.0 |
| [ADR-068](#adr-068--integration-topology-settled-and-the-constitution-command-aligned-to-upstream) | Integration topology settled, and the constitution command aligned to upstream | 2026-10-07 | 2.25.0 (unchanged) |
| [ADR-069](#adr-069--cross-artifact-consistency-fix-set) | Cross-artifact consistency fix set | 2026-10-08 | 2.25.0 (unchanged) |
| [ADR-070](#adr-070--part-tenancy-and-a-clarification-set) | Part tenancy, and a clarification set | 2026-10-08 | 2.26.0 |
| [ADR-071](#adr-071--cross-artifact-consistency-and-tooling-fix-set) | Cross-artifact consistency and tooling fix set | 2026-10-08 | 2.26.0 (unchanged) |
| [ADR-072](#adr-072--workflow-execution-defects-and-css-standard-conformance) | Workflow execution defects and CSS standard conformance | 2026-10-08 | 2.27.0 |
| [ADR-073](#adr-073--duplicate-storage-semantics-slice-component-obligations-and-mirror-precision) | Duplicate-storage semantics, slice component obligations, and mirror precision | 2026-10-08 | 2.27.1 |
| [ADR-074](#adr-074--deep-audit-fix-set-the-exception-registers-classification-the-sticky-headers-owner-module-ownership-and-the-constitutions-own-precision-defects) | Deep-audit fix set: the exception register's classification, the sticky header's owner, module ownership, and the constitution's own precision defects | 2026-10-08 | 2.27.2 |
| [ADR-075](#adr-075--constitution-2280-the-constitutions-reading-protocol-structural-count-checks-and-mirror-hygiene) | Constitution 2.28.0: the constitution's reading protocol, structural-count checks, and mirror hygiene | 2026-10-08 | 2.28.0 |
| [ADR-076](#adr-076--roadmap-module-ownership-counts-corrected) | Roadmap module-ownership counts corrected | 2026-10-08 | 2.28.0 (unchanged) |
| [ADR-077](#adr-077--admin-module-creation-and-the-platformsetting-read-surface) | Admin-module creation and the PlatformSetting read surface | 2026-10-08 | 2.28.0 (unchanged) |
| [ADR-078](#adr-078--superseded-owner-assignments-annotated-and-the-platformsetting-duty-corrected) | Superseded owner assignments annotated, and the PlatformSetting duty corrected | 2026-10-08 | 2.28.0 (unchanged) |
| [ADR-079](#adr-079--constitution-2281-the-drift-checks-four-descriptions-aligned) | Constitution 2.28.1: the drift check's four descriptions aligned | 2026-10-08 | 2.28.1 |
| [ADR-080](#adr-080--the-drift-checks-structural-count-coverage-completed) | The drift check's structural-count coverage completed | 2026-10-08 | 2.28.1 (unchanged) |
| [ADR-081](#adr-081--spec-kit-cli-upgraded-to-112-the-scaffold-pin-annotated) | Spec Kit CLI upgraded to 1.1.2; the scaffold pin annotated | 2026-10-08 | 2.28.1 (unchanged) |
| [ADR-082](#adr-082--the-adr-indexs-anchor-integrity-checked-and-adr-064s-anchor-repaired) | The ADR index's anchor integrity checked, and ADR-064's anchor repaired | 2026-10-08 | 2.28.2 |
| [ADR-083](#adr-083--every-adr-reference-resolved-against-the-index) | Every ADR reference resolved against the index | 2026-10-08 | 2.28.3 |
| [ADR-084](#adr-084--the-drift-checks-adr-citations-unified) | The drift check's ADR citations unified | 2026-10-08 | 2.28.4 |
| [ADR-085](#adr-085--roadmap-slice-description-precision-fix-set) | Roadmap slice-description precision fix set | 2026-10-08 | 2.28.4 (unchanged) |
| [ADR-086](#adr-086--deep-audit-fix-set-licensing-ownership-drift-check-coverage-and-tooling-pins) | Deep-audit fix set: licensing ownership, drift-check coverage, and tooling pins | 2026-10-09 | 2.28.5 |
| [ADR-087](#adr-087--the-projects-licence-proprietary-all-rights-reserved) | The project's licence: proprietary, all rights reserved | 2026-10-09 | 2.28.5 (unchanged) |
| [ADR-088](#adr-088--governance-debt-status-and-the-integration-topology-check) | Governance-debt status, and the integration-topology check | 2026-10-09 | 2.28.6 |
| [ADR-089](#adr-089--roadmap-defect-table-precision-fix-set) | Roadmap defect-table precision fix set | 2026-10-09 | 2.28.6 (unchanged) |
| [ADR-090](#adr-090--the-documentation-rule-reaches-technical-decisions) | The Documentation rule reaches technical decisions | 2026-10-09 | 2.29.0 |
| [ADR-091](#adr-091--the-stamp-site-list-stays-in-the-constitution) | The stamp-site list stays in the constitution | 2026-10-09 | 2.29.0 (unchanged) |
| [ADR-092](#adr-092--the-integration-topology-gate-made-unconditional) | The integration-topology gate made unconditional | 2026-10-10 | 2.29.1 |
| [ADR-093](#adr-093--remove-the-custom-design-system-and-establish-the-ui-foundation) | Remove the custom design system and establish the UI foundation | 2026-10-20 | 3.0.0 |
| [ADR-094](#adr-094--guest-header-controls-and-the-administrator-shell) | Guest header controls and the administrator shell | 2026-10-20 | 3.1.0 |
| [ADR-095](#adr-095--make-opencode-the-default-integration-keep-codebuddy-installed) | Make opencode the default integration; keep codebuddy installed | 2026-10-20 | 3.1.0 (unchanged) |
| [ADR-096](#adr-096--the-r1-pre-planning-fix-set-the-cmv-values-the-shells-link-surface-the-sidebar-list-and-the-spec-scan) | The R1 pre-planning fix set: the CMV values, the shell's link surface, the sidebar list, and the spec scan | 2026-10-20 | 3.2.0 |
| [ADR-097](#adr-097--the-wafar-ui-layer-and-the-nuxt-4-app-layout) | The Wafar UI layer and the Nuxt 4 app layout | 2026-10-21 | 3.3.0 |
| [ADR-098](#adr-098--the-wafar-visual-foundation-iconpark-ibm-plex-sans-arabic-light-default-and-the-marine-palette) | The Wafar visual foundation: IconPark, IBM Plex Sans Arabic, light default, and the marine palette | 2026-10-21 | 3.3.0 |
| [ADR-099](#adr-099--shared-shell-header-and-the-account-menu) | Shared-shell header and the account menu | 2026-10-21 | 3.4.0 |
| [ADR-100](#adr-100--the-account-menus-destinations-and-the-frames-boundaries) | The account menu's destinations and the frame's boundaries | 2026-10-21 | 3.5.0 |
| [ADR-101](#adr-101--the-account-menus-behaviour-and-the-appearances-ownership) | The account menu's behaviour and the appearance's ownership | 2026-10-21 | 3.5.0 (unchanged) |
| [ADR-102](#adr-102--the-headers-theme-switch-and-the-notifications-bell) | The header's theme switch and the notifications bell | 2026-10-21 | 3.6.0 |
| [ADR-103](#adr-103--the-amendment-procedures-version-sources-and-the-index-column-the-check-verifies) | The amendment procedure's version sources, and the index column the check verifies | 2026-10-21 | 3.6.1 |
| [ADR-104](#adr-104--the-audit-fix-set-the-governance-wording-the-mirror-corrections-and-the-r1-concentration) | The audit fix set: the governance wording, the mirror corrections, and the R1 concentration | 2026-10-21 | 3.6.2 |
| [ADR-105](#adr-105--the-second-audit-fix-set-the-copied-adr-lists-the-r1-register-amendment-and-four-new-check-coverage-rules) | The second audit fix set: the copied ADR lists, the R1 register amendment, and four new check-coverage rules | 2026-10-21 | 3.7.0 |
| [ADR-106](#adr-106--the-third-audit-fix-set-the-administrator-reply-the-citation-precision-and-the-specification-identifier-check) | The third audit fix set: the administrator reply, the citation precision, and the specification identifier check | 2026-10-22 | 3.7.1 |
| [ADR-107](#adr-107--the-session-activity-the-policy-messages-the-city-names-the-code-step-and-the-submit-guard) | The session activity, the policy messages, the city names, the code step, and the submit guard | 2026-10-22 | 3.7.1 |
| [ADR-108](#adr-108--the-record-corrections-the-closed-follow-ups-and-the-misnamed-annotation) | The record corrections: the closed follow-ups and the misnamed annotation | 2026-10-22 | 3.7.1 (unchanged) |
| [ADR-109](#adr-109--the-slice-corrections-the-delete-cascade-the-content-safety-owner-and-the-notification-source) | The slice corrections: the delete cascade, the content-safety owner, and the notification source | 2026-10-22 | 3.7.1 (unchanged) |
| [ADR-110](#adr-110--the-twenty-seventh-page-the-administrator-applications-login) | The twenty-seventh page: the administrator application's login | 2026-10-22 | 3.8.0 |
| [ADR-111](#adr-111--the-recovery-flows-verified-state-and-the-bare-pages-state-announcements) | The recovery flow's verified state, and the bare pages' state announcements | 2026-10-22 | 3.8.0 |
| [ADR-112](#adr-112--the-code-steps-fields-the-administrators-first-sign-in-the-refusals-work-the-ending-of-a-pending-request-and-the-coverage-targets-scope) | The code step's fields, the administrator's first sign-in, the refusal's work, the ending of a pending request, and the coverage target's scope | 2026-10-22 | 3.8.0 (unchanged) |
| [ADR-113](#adr-113--the-recovery-code-steps-fields-the-restricted-administrators-sign-out-and-the-code-steps-controls) | The recovery code step's fields, the restricted administrator's sign-out, and the code step's controls | 2026-10-22 | 3.8.0 (unchanged) |
| [ADR-114](#adr-114--the-forced-first-changes-password-the-pending-requests-password-refusal-precedence-and-a-failed-re-request) | The forced first change's password, the pending request's password, refusal precedence, and a failed re-request | 2026-10-22 | 3.8.0 (unchanged) |
| [ADR-115](#adr-115--the-ended-session-state-the-acceptance-boundary-the-counted-code-the-replaced-verification-and-the-forced-change) | The ended-session state, the acceptance boundary, the counted code, the replaced verification, and the forced change | 2026-10-22 | 3.8.0 (unchanged) |
| [ADR-116](#adr-116--the-ui-layer-path-authority-and-the-register-gap-exception) | The UI-layer path authority and the register-gap exception | 2026-10-22 | 3.9.0 |
| [ADR-117](#adr-117--the-capacity-envelope-and-the-upload-quota-model) | The capacity envelope and the upload-quota model | 2026-10-23 | 3.9.0 (unchanged) |

**Design-system note (ADR-093).** Every provision of the removed custom design
system in an earlier record is superseded by ADR-093. Their other provisions,
including the non-visual shell rules and the icon set, remain in force. The
records themselves are not rewritten.

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

**Annotation (2026-10-08, ADR-072 item 9 / ADR-073 item 3).** This record's
Decision and Rationale name "Index Lifecycle Management" as the feature the
index lifetime relies on. Two halves of that naming are superseded. First, the
feature OpenSearch actually ships is Index State Management (ISM); ILM is
Elasticsearch's name for its own policy, and the technology register,
`docs/architecture.md`, and `docs/domain-model.md` name ISM (ADR-072 item 9),
with the technology mirror corrected to match (ADR-073 item 3). Second, the
Rationale's claim that the lifecycle feature "expresses the 90-day index
lifecycle natively" overstates what it does: ISM deletes whole indices by
index age, so the per-catalog 90-day deletion is the retention job's work
(R15), not the index lifecycle's alone. The decision this record made —
OpenSearch with its built-in Arabic analyzer — is unchanged by both; only the
lifecycle feature's name and reach are annotated.

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

**Annotation (2026-10-21, ADR-098 and ADR-102).** Two provisions above are
superseded, and neither is rewritten:

1. **The default is light, not dark.** ADR-098 (2026-10-21) fixed the default
   appearance as light and recorded it as a Wafar UI layer value; the dark-first
   rationale this record gives is not the platform's visual direction, which is
   the marine/sand palette ADR-098 fixed. The mechanism that remembers the
   explicit choice is still the implementing slice's, and the choice is still the
   user's explicit act rather than the device's preference.
2. **The toggle's place is the header, beside the notifications control.**
   ADR-099 (2026-10-21) moved the toggle into the sidebar; ADR-102 (2026-10-21)
   moved it back to the header, immediately beside the notifications control,
   with the crescent glyph of the registered IconPark set. The Decision's
   placement sentence therefore reads as the header's rule again.

The decision this record made — that the appearance is the user's explicit
choice and that both modes exist — is unchanged.

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

**Annotation (2026-10-21, ADR-099).** The theme toggle remains an R1 shell duty,
but its place is the sidebar; the header no longer carries it. The icon-set duty
is unchanged.

**Annotation (2026-10-21, ADR-102).** The theme toggle remains an R1 shell duty,
and its place is the header once more: ADR-102 moved it out of the sidebar and
into the header, immediately beside the notifications control, drawn with the
crescent glyph of the registered IconPark set. The icon-set duty is unchanged.


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

   **Annotation (2026-10-21, ADR-099).** The shell's control composition changed:
   the logo sits in the header, which carries only the logo/home and account
   controls, and the theme switch and the sidebar-collapse control sit in the
   sidebar. The scoping decision — which surfaces carry the shell, and that the
   sidebar is always present on desktop — is unchanged.

   **Annotation (2026-10-21, ADR-102).** The header's control composition
   changed again: it now carries the notifications control and the theme switch
   beside it, in addition to the logo/home control and the account control, so
   the header carries the theme toggle this record's Decision named. The
   sidebar-collapse control stays in the sidebar, where ADR-099 put it and where
   it belongs beside the thing it collapses. The scoping decision — which
   surfaces carry the shell, and that the sidebar is always present on desktop —
   is unchanged.

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

**Annotation (2026-10-08, ADR-074).** Item 4 above and the Consequences paragraph assign three of those facts to slices that no longer decide them: the administrator-representation question (#6) to R13, and `User.status` (#7) and the `auth` module's stored entity (#8) to R1. ADR-067 resolved all three on 2026-10-07 — the administrator is a role on `User`, `User.status` is `active` or `blocked`, and `auth` owns `Session` — so the sentence "R1, R2, R3, R11 and R13 each carry an open data-model question by name" now holds for R2, R3, and R11 only. The decision this record made is unchanged; only its assignment of those three facts is superseded.

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

**Annotation (2026-10-08, ADR-081).** The local Spec Kit install was upgraded
from 1.1.0 to 1.1.2. The pin's floor (`>=1.1.0`) still holds and the Node 22 LTS
line is unaffected, so the Decision stands; only the installed version moved. The
project's scaffold — its `.specify/` templates, scripts, manifests,
`init-options.json`, `integration.json`, and `workflow.yml` — was left at 1.1.0,
the version that created it; re-scaffolding is a separate decision (ADR-081).

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

**Annotation (2026-10-22, ADR-106 item 1).** Item 5's provision that "pre-R13
acceptance uses the admin API directly" is superseded. An administrator reply is
an administrator operation, the constitution requires every administrator
operation to be recorded, and the audit log arrives with R13, so no pre-R13 reply
path may exist: R10 ships the merchant's side of the thread, and R13 authors the
reply and delivers its notification. The rest of this record stands.

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

**Annotation (2026-10-08, ADR-078).** The Decision above assigns the OpenSearch client library to **R5**. ADR-066 moved that owner to **R3**, because R3 is the first slice to need the client (it indexes the parts) and R5 depends on R3. The other three gap rows the Decision names — Redis client library (R3), automated accessibility checker (R1), Arabic analyzer configuration and verification (R5) — are unchanged; only the OpenSearch owner is superseded.

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

**Annotation (2026-10-08, ADR-078).** Decision item 4 above names **R5** for the sticky table header, and the Consequences repeat it. ADR-074 moved that owner to **R4**, because My Files (R4) carries the first table the product renders. The rail-width token's owner (R1) is unchanged; only the sticky header's is superseded.

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

**Annotation (2026-10-08, ADR-074).** The Context above quotes the register as reading "No exceptions recorded". ADR-054 restructured it into its current `Register` and `Closed` tables, so that phrase is no longer in the file, and the register now carries six rows (EX-001 … EX-006: the two this record added, plus four added by ADR-054). The decision is unchanged; only the quoted state of the file is superseded.

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

**Annotation (2026-10-20, ADR-096).** The Context's "the shell has no footer
component" and the rejected "Register a footer component" alternative describe
the state before ADR-096. ADR-096 records the shell's static-page link surface
in Product Scope and leaves the surface to the first shell-building slice; R1
records it as a footer band (FR-024). The reachability decision stands, and the
premise that no rule asks for the surface is superseded.

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
discharged and **two remain open**, verified against the working tree rather than
inferred. `docs/architecture.md`'s omission of the nine fixed internal locations
is closed: it now carries an Internal layout table of nine rows at
`docs/architecture.md` §1.1, which ADR-055 recorded. `Core-Project.txt`'s
`created_at` column identifier is closed: the mirror contains no `created_at`
token at all, so ADR-019's fix stands again. The twenty-three ADR fields remain
open, and the mirror's gap coverage remains as ADR-057 left it. This record is
annotated rather than rewritten, so a reader of it alone sees the debt as it was
recorded and can read this paragraph for its present state.

**Annotation (2026-10-09).** The fourth deferred item above is re-examined against
the working tree, so its three parts are no longer one undifferentiated debt. The
manifest coverage of the exception register is **closed**: the register is
recorded in `speckit.manifest.json` and excluded from the hash comparison by the
project-owned path rule ADR-074 added, which is the deliberate treatment that part
was waiting for. The `.ps1` line endings are **consistent**: `.gitattributes`
declares `*.ps1 text eol=crlf`, and every script is stored as LF and checked out
as CRLF, which is exactly what that attribute means — there is nothing left to
correct. The twenty-three ADR fields **remain open, deliberately**: the records
are amendment records whose reasoning was never captured, and writing the sections
now would be the reconstruction ADR-050 refused to present as contemporaneous. The
debt stays recorded rather than discharged, and it is now also named at the entry
point, in `AGENTS.md` §6, so a reader meets it without reading this file.

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

---

## ADR-074 — Deep-audit fix set: the exception register's classification, the sticky header's owner, module ownership, and the constitution's own precision defects

**Status**: Accepted — 2026-10-08
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `.specify/`, `docs/`, `ROADMAP.md`, `AGENTS.md`, `README.md`, `Project-Technologies.txt`, repository root
**Owning feature**: none — governance and tooling decision; ratified by the repository owner

**Context.** A deep audit read the whole governance set before the first slice (R1)
was specified — the constitution, both mirrors, `ROADMAP.md`, `AGENTS.md`,
`README.md`, `docs/architecture.md`, `docs/domain-model.md`, this log, the five
binding overrides, the extension and integration registries, `.gitattributes`, and
`wafar.single.css` — and then ran the committed drift check and recomputed the
manifest hashes. The check reported **clean at 2.27.1**, so every finding below is
a defect the check cannot see: a classification, an ownership, or a statement that
contradicts another statement. Each was reproduced against the working tree before
it was written here.

1. **F-01 — the roadmap still assigned a resolved question.** `ROADMAP.md`'s
   "Administrator representation" note read "R13 decides the distinct-entity
   question", while ADR-067 had closed it on 2026-10-07 (the administrator is a
   role on `User`) and the same file's own unresolved-facts list already carried it
   struck through. A slice reading the note would have planned to decide a fact
   that is fixed.
2. **F-02 — the drift check enforced a project-authored file.** ADR-071 item 1
   classified `.specify/templates/exception-register.md` as upstream-owned and
   "MUST stay unmodified", and item 3's exclusion covered only the five overrides
   and `.specify/.gitignore`. The register is the project's: Governance requires it
   to be maintained there, and ADR-052 and ADR-054 wrote its six rows into it. Its
   recorded hash matched the project's copy, so check C passed — and would have
   failed the moment a seventh exception was granted, which Governance makes
   mandatory.
3. **F-03 — two decision records were not annotated after ADR-067.** ADR-019 still
   assigned the administrator question to R13 and `User.status` and `auth`'s
   stored entity to R1, and stated that R1 and R13 "each carry an open data-model
   question by name"; ADR-052 still quoted the exception register as reading "No
   exceptions recorded". The file's own rule annotates a record a later decision
   supersedes.
4. **F-04 — a machine-local CLI cache was tracked.**
   `.specify/memory/.constitution-template.json` is the CLI's record of which
   constitution template it scaffolded from — the same class as
   `memory/.resolved-template.json`, which ADR-073 ignored. It was tracked, and it
   recorded `"source": "core"`, which reads as a statement that the core template
   scaffolded this constitution rather than the project's binding override.
5. **F-05 — `AGENTS.md` attributed the assess hook to the extension.** It said
   "The `assess` extension also registers an optional `before_specify` hook",
   while the extension's own README (corrected by ADR-055) states that assess
   ships no lifecycle hooks and that *this repository* registers the prompt in
   `.specify/extensions.yml`.
6. **F-06 — the sticky header had an owner that is not its first consumer.** The
   First obligations table assigned it to R5, "used by the first table that
   requires it", but R4's My Files carries the first table the product renders,
   and Decision values → Table declares the sticky header required.
7. **F-07 — five of the ten modules had no creating slice.** R1, R3, and R11 name
   the modules they create (`auth`/`users`, `suppliers`/`parts`, `support`), but
   `catalogs`, `bookmarks`, `notifications`, `messages`, and `admin` had none,
   while Project Structure and Debt Control requires one owning feature per
   directory holding production code.
8. **F-08 — the register's own paragraph over-generalised.** Technology Standards
   said all six exception rows "close a register gap" for rules that "said 'or an
   equivalent' in Deployment and Observability". Four do; ClamAV's rule is File
   Processing Rules and Lighthouse CI's is Performance Budgets and Verification,
   and both name their tool directly.
9. **F-09 — `governance-drift-check.mjs` was named in neither register.** It is a
   committed governance instrument (ADR-071) and is described in `AGENTS.md` and
   `ROADMAP.md`, but the constitution's References table and `README.md`'s
   documentation map — the two places a reader looks — did not list it.
10. **F-10 — three smaller precision defects.** `docs/architecture.md` described
    the whole filter set as "no selection means every supplier" where the
    constitution's rule is "every value of that filter"; this log's own header
    enumeration skipped ADR-009 and ADR-011; and ADR-052 quoted a phrase the
    register no longer contains (item 3 above).

**Decision.** Constitution **2.27.1 → 2.27.2** (PATCH: two corrections inside
existing text and one References row; no principle, register entry, entity, page,
feature, Usage Limit, module, or slice number changes).

1. **The roadmap note is corrected** to state that ADR-067 fixed the administrator
   as a role on `User`, that no slice decides it, and that R1 seeds the account
   while R13 implements the surface over the same role.
2. **The exception register joins the drift check's project-owned exclusion**, and
   check C's header comment names all three excluded paths. `AGENTS.md` §5 records
   the exclusion.
3. **ADR-019 and ADR-052 gain annotations** naming ADR-067 and ADR-054
   respectively, following the form ADR-034's annotation established: the
   decisions stand, and the superseded assignment or quoted state is marked.
4. **`.specify/memory/.constitution-template.json` is added to
   `.specify/.gitignore` and removed from the index** in the same change, and
   `AGENTS.md` §6 records the gap as closed.
5. **`AGENTS.md` §5 states where the hook lives**: the `assess` extension ships
   none, and this project registers `speckit.assess.intake` at `before_specify` in
   `.specify/extensions.yml` with `priority: 9`.
6. **The sticky table header is R4's**, and R5's component sentence no longer
   claims it. The First obligations row names My Files as the first table the
   product renders.
7. **The module ownership map is completed**: R2 creates `catalogs`, R8
   `bookmarks`, R9 `notifications`, R10 `messages`, and R13 `admin`; a second row
   records the `packages/db/schema/<module>.ts` file each module first writes,
   naming the one overlap — R11 creates `packages/db/schema/admin.ts` for
   `PlatformSetting` while the `admin` module directory is R13's.
8. **The Technology Standards paragraph distinguishes the two groups** of
   exception rows: the four whose rule says "or an equivalent", and ClamAV and
   Lighthouse CI, whose rules name them.
9. **`governance-drift-check.mjs` is named in References and in the README's
   documentation map**, and `README.md` gains a short paragraph naming what it
   verifies.
10. **The three precision defects are corrected**: the architecture filter
    sentence now reads "every value of that filter"; this log's header enumeration
    names ADR-009 and ADR-011; and `wafar.single.css`, `Core-Project.txt`,
    `docs/domain-model.md`, and the exception register's own rows are left
    untouched.
11. **Every live `ADR-001 … ADR-0NN` range string moves to ADR-074** (`AGENTS.md`,
    `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the `spec-template.md`
    and `checklist-template.md` overrides), `Project-Technologies.txt`'s header ADR
    list gains ADR-074, and the two version sources move together.

**What deliberately did not change.** No principle was added, removed, renamed, or
redefined. No entity, page, feature, Usage Limit, module, or slice number changed,
and no slice's `Depends on` edge changed — F-06 and F-07 move an obligation and
name owners, and neither adds a dependency. `wafar.single.css` is untouched, so the
design-system version stays 1.3.0. `Core-Project.txt` is untouched: two of its
statements are recorded below rather than edited. The five binding overrides keep
their structure; only their range string moved. The exception register's six rows
are unchanged. The `.specify/` extension and integration registries are unchanged:
F-05 is a documentation defect, not an installed-manifest one, and editing
`assess/extension.yml` would have fought the install rather than fixed the
statement.

**Recorded, not decided (the two `Core-Project.txt` statements).** Two statements
in the product mirror have no counterpart in the register, and neither is a
reserved fact, so neither is decided here: the duplicate-file message is described
as naming the upload date and carrying "a link to open" the original (File
Processing Rules says only that the message names the original), and the
first-page extraction step is described as also displaying "the issue dates
matching the name" (File Processing Overview step 4 names the supplier's name and
the issue date only). R2 owns the first and R3 the second; each MUST either
implement the mirror's statement and record it as an addition to Product Scope in
its plan, or drop it from the mirror in its own change. Recording them here is what
keeps them from being settled silently.

**Alternatives considered.**
- *Leave the exception register in the enforced set and refresh its hash when a row
  is added.* Rejected: ADR-068 item 10 is the governing decision — re-recording a
  project-owned hash makes the CLI treat the file as unmodified and overwrite it on
  a refresh. The correct action is to exclude it, as the five overrides already are.
- *Fix F-05 by adding a `hooks:` block to
  `.specify/extensions/assess/extension.yml`.* Rejected: the extension is installed
  state whose hash `.specify/extensions/.registry` records, and ADR-055 already
  ratified the opposite reading — assess ships no hooks, the project registers the
  prompt in the registry the commands read. Editing the manifest would also be
  reverted by the next extension refresh.
- *Move the sticky header to R5 and exempt My Files' table.* Rejected: the
  constitution declares the sticky header required and assigns each missing
  component to the slice that first needs it; My Files' table is the first the
  product renders, so R4 is the honest owner.
- *Delete the two unregistered `Core-Project.txt` statements.* Rejected: they are
  product intent, and a governance repair is not the instrument for removing
  product intent. They are recorded with their owning slices instead.
- *Bump to 2.28.0 (MINOR).* Rejected: nothing is added to the guidance — the
  paragraph correction narrows an over-general sentence, the References row is a
  pointer, and the rest is classification, ownership, and annotation.
- *Fix only the findings that block R1 and defer the precision items.* Rejected:
  F-08, F-09, and F-10 are the same class of defect and cost nothing to correct in
  the same pass; deferring them would leave the register stating something its own
  rows contradict.

**Consequences.** The drift check now enforces only files the project does not own
by design, so granting the next exception cannot fail it. The roadmap no longer
sends a slice to decide a fixed fact, and the first table's owner is the slice that
builds it. Five module directories have a named creating slice, so no two slices
can claim one. `AGENTS.md` states where the assess hook actually lives, so a reader
does not look for it in an installed manifest. The two registers a reader starts
from name the drift check. The two `Core-Project.txt` statements are owned by R2
and R3 rather than invisible. The two version sources agree at **2.27.2**, the
drift check reports clean with the index ending at ADR-074, and every live range
string reads `ADR-001 … ADR-074`. This entry is the durable record.

**Annotation (2026-10-08, ADR-077).** Item 7 above records the module ownership map as "R13 `admin`". ADR-077 supersedes that one assignment: the `admin` module's creating slice is R11 (the `PlatformSetting` public read surface), and R13 extends it. The rest of item 7 — the other four modules and the schema-file row — stands.

---

## ADR-075 — Constitution 2.28.0: the constitution's reading protocol, structural-count checks, and mirror hygiene

**Status**: Accepted — 2026-10-08
**Owning directory**: `.specify/memory/`, `docs/`, `.specify/templates/overrides/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, repository root
**Owning feature**: none — governance and tooling decision; ratified by the repository owner

**Context.** A deep, whole-set audit was carried out before the first slice (R1)
was specified. It read the constitution, both Arabic mirrors, `ROADMAP.md`,
`AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/domain-model.md`, this
log, the five binding overrides, the extension and integration registries, and
`wafar.single.css`, and it ran the committed drift check. The check reports
clean, so every finding below is a defect the check could not see — a reading
cost, an unguarded count, or a statement that had drifted. Each was reproduced
against the working tree before it was written here.

1. **The constitution had no reading protocol.** It is 2,133 lines, and
   `docs/DECISIONS.md` carries a Reading protocol (ADR-071) but the constitution
   — the largest source every feature command must read — did not. The command
   files that load it are byte-identical to upstream (ADR-068) and cannot be
   scoped, so the fix belongs in the document itself.
2. **The structural counts the governance text states in prose were unguarded.**
   The drift check verified version strings, ADR-range strings, manifest hashes,
   integration byte-identity, and design tokens, but not one countable fact:
   fifteen slices, six exception rows, ten principles, twelve entities, fourteen
   design-system modules, nineteen binding sections, ten API modules. Each could
   drift silently, and ADR-074 had already recorded that the check cannot see
   this class of defect.
3. **The mirror carried its own changelog.** `Project-Technologies.txt` held
   thirteen "Constitution X additions" blocks (ADR-023 … ADR-060) inline — a
   history of rule restatements in a file whose rule is that a mirror MUST NOT
   restate a rule (Single-Reference Sufficiency) and whose job is the exact
   version of each approved technology.
4. **The mirror's header example had gone stale.** Its "Party/header sync
   markers" note showed the header ADR list ending at `…068` and the date
   `2026-10-07`, while the actual header ended at `…074` and `2026-10-08`. A
   fixed example of a value that moves every amendment is a defect by
   construction.
5. **Two product statements in `Core-Project.txt` had no register counterpart.**
   ADR-074 recorded them rather than deciding them: the duplicate-file message
   names the original's upload date and carries "a link to open" it, and the
   first-page extraction also displays "the issue dates matching the name". They
   were assigned to R2 and R3, and neither slice exists yet.

**Decision.** Constitution **2.27.2 → 2.28.0** (MINOR: item 1 adds a section and
items 5 widen two binding rules; items 2–4 are tooling and hygiene that ride in
the same amendment).

1. **A Reading protocol is added to the constitution**, between its Contents
   list and `## Core Principles`. It states that the document MUST NOT be read
   end to end for a feature command, names the sections each command needs
   (mirroring `AGENTS.md` §3), and reserves a whole-document read to an
   amendment and to a full review. `AGENTS.md` §3 gains the matching pointer.
2. **`governance-drift-check.mjs` gains check G**, a structural-count check. It
   counts seven enumerable lists and compares each to the number the governance
   text states: slices (`ROADMAP.md` R-rows, 15), exception rows
   (`EX-\d{3}`, 6), principles (`### [IVX]+.`, 10), data entities (the
   constitution's Data entities table, 12), design-system modules (the Module map
   table, 14), binding sections (the nineteen names in Governance's Authority
   paragraph), and API modules (`docs/architecture.md`, 10). Lists are sliced by
   heading, never by line number, so a renamed heading fails loudly. The script's
   header comment, `AGENTS.md` §5, the README's drift-check paragraphs, and the
   constitution's References row for the script name the new check.
3. **The mirror's changelog moves to `docs/CHANGELOG-mirror.md`**, a new
   project-owned file, and `Project-Technologies.txt` keeps a one-paragraph
   pointer instead. The new file is registered in the constitution's References
   table and the README's documentation map. It carries no live `ADR-001 … ADR-0NN`
   range string, so check B ignores it.
4. **The stale header example is replaced with pointer wording** that names no
   fixed ADR number and no fixed date, so it cannot go stale again.
5. **The two `Core-Project.txt` statements are elevated into the register as
   binding.** File Processing Rules now requires the duplicate message to state
   the original's upload date and carry a link that opens it; File Processing
   Overview step 4 now requires the issue date, and any additional issue dates
   the first page prints that match the supplier's name, to be displayed with the
   result. `Core-Project.txt` is left untouched, because the mirror now matches
   the register. `docs/domain-model.md`'s Catalog section records both: the
   duplicate bullet gains "(with the original's upload date and a link that opens
   it)", and the first-page bullet notes that more than one matching issue date
   may be displayed. Displaying them stores no field; a slice that later must
   *store* several dates records that as its own open fact.
6. **Every live `ADR-001 … ADR-0NN` range string moves to ADR-075** (`AGENTS.md`,
   `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the `spec-template.md`
   and `checklist-template.md` overrides), `Project-Technologies.txt`'s header ADR
   list gains ADR-075, and the two version sources move together.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined. No entity, page, feature, Usage Limit, module, or slice number
changed, and no slice's `Depends on` edge changed. `wafar.single.css` is
untouched, so the design-system version stays 1.3.0. The six exception rows are
unchanged. `.codebuddy/commands/*` and `.opencode/commands/*` are untouched, so
they stay byte-identical to each other and to their integration manifests. The
five binding overrides keep their structure; only their range string moved.

**Alternatives considered.**
- *Scope the constitution read by editing the command files.* Rejected: the
  commands are kept byte-identical to upstream (ADR-068) and are hash-tracked, so
  the scoping belongs in the constitution and in `AGENTS.md` §3, which the
  commands already defer to.
- *Leave the structural counts to discipline.* Rejected: ADR-074 recorded that
  the check cannot see them, and a count in prose that nothing checks is exactly
  the class of drift the check exists to stop.
- *Compress the mirror changelog in place instead of moving it.* Rejected: the
  blocks restate rules, which a mirror MUST NOT do; moving them out of the mirror
  and into a history file is the correction, not a cosmetic shrink.
- *Delete the two `Core-Project.txt` statements instead of elevating them.*
  Rejected: they are product intent, and ADR-074's own alternatives rejected
  removing product intent; the register is where they belong.
- *Bump to 2.27.3 (PATCH).* Rejected: item 1 adds a section and item 5 widens two
  binding rules, which the versioning policy classifies MINOR.

**Consequences.** A feature command can read the constitution by section and
knows the budget it is held to, so the largest source stops being read end to
end. The seven structural counts can no longer drift silently — a renamed section
or a miscounted list fails the build. The technology mirror is a map again, its
history lives in one place, and its header example can no longer contradict the
header. The two product statements ADR-074 could only record are now binding
rules the owning slices implement, and the domain model states them. The drift
check reports clean at 2.28.0 with the index ending at ADR-075, and every live
range string reads `ADR-001 … ADR-075`. This entry is the durable record.

---

## ADR-076 — Roadmap module-ownership counts corrected

**Status**: Accepted — 2026-10-08
**Owning directory**: `ROADMAP.md`, `docs/`, `AGENTS.md`, `README.md`, `.specify/templates/overrides/`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of the fifteen MVP slices (R1–R15) was carried out
before R1 was specified. It read the constitution's registers, `Core-Project.txt`,
`docs/domain-model.md`, `docs/architecture.md`, and `ROADMAP.md`, and it ran the
committed drift check. The check reports clean, so the two findings below are
defects the check could not see: they are a count and an enumeration in
`ROADMAP.md` → First obligations that no check covers.

1. **The module-creation row undercounted.** `ROADMAP.md` read "The **five** API
   modules R1 does not create … `catalogs` (R2), `bookmarks` (R8),
   `notifications` (R9), `messages` (R10), and `admin` (R13)". R1 creates only
   `auth` and `users`; the remaining **eight** modules are created by other
   slices — `catalogs` (R2), `parts` and `suppliers` (R3), `bookmarks` (R8),
   `notifications` (R9), `messages` (R10), `support` (R11), and `admin` (R13).
   The row omitted `parts`, `suppliers`, and `support`.
2. **The schema-file row omitted R1 and `support.ts`.** The row listed the slices
   that first write each `packages/db/schema/<module>.ts` as "R2, R3, R8, R9,
   R10, R11, R13". R1 creates the `users` and `auth` modules, so it writes
   `users.ts` and `auth.ts` and belongs in the list; and R11's `support` module
   writes `support.ts`, which the row did not name beside the `admin.ts` overlap.

**Decision.** Constitution version **unchanged at 2.28.0** (the fix touches
`ROADMAP.md` only; no constitution text changes, so the versioning policy does
not move it, following the pattern of ADR-031 and ADR-032).

1. `ROADMAP.md` → First obligations reads "The **eight** API modules R1 does not
   create … `catalogs` (R2), `parts` and `suppliers` (R3), `bookmarks` (R8),
   `notifications` (R9), `messages` (R10), `support` (R11), and `admin` (R13)",
   and the owning-slice column reads "R2, R3, R8, R9, R10, R11, R13".
2. `ROADMAP.md` → First obligations enumerates each schema file with its creating
   slice — R1 writes `users.ts` and `auth.ts`, R2 `catalogs.ts`, R3 `parts.ts`
   and `suppliers.ts`, R8 `bookmarks.ts`, R9 `notifications.ts`, R10
   `messages.ts`, R11 `support.ts` and `admin.ts`, and R13 owns the `admin`
   module directory — keeping the one named overlap (`admin.ts` created by R11
   for `PlatformSetting`).
3. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-076** (`AGENTS.md`,
   `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the `spec-template.md`
   and `checklist-template.md` overrides), and `Project-Technologies.txt`'s header
   ADR list gains ADR-076.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined. No entity, page, feature, Usage Limit, module count, or slice number
changed, and no slice's `Depends on` edge changed — the module-ownership map
already assigned every module; only the roadmap's enumeration of it was
corrected. The constitution's footer and `.specify/memory/version.json` stay at
2.28.0. `wafar.single.css` is untouched, so the design-system version is
unchanged. `.codebuddy/commands/*` and `.opencode/commands/*` are untouched, so
they stay byte-identical to each other and to their integration manifests. The
five binding overrides keep their structure; only their range string moved.

**Alternatives considered.**
- *Reword the row without a count.* Rejected: the count is the defect, and stating
  the true count (eight) is the correction; an unstated count would leave the row
  unverifiable again.
- *Leave the schema row as-is.* Rejected: R1 creates two modules and therefore
  writes two schema files; a row that omits the first slice would send R1's
  planner to the wrong owner.
- *Bump to 2.28.1 (PATCH).* Rejected: the change touches no constitution text,
  and the established pattern for a roadmap-only fix (ADR-031, ADR-032) leaves the
  constitution version unchanged.

**Consequences.** The First obligations table now agrees with the
module-ownership map in `docs/architecture.md` and with each slice's own
description, so a planner reading either sees the same owner for every module and
every schema file. The two version sources agree at **2.28.0**, the drift check
reports clean with the index ending at ADR-076, and every live range string reads
`ADR-001 … ADR-076`. This entry is the durable record.

**Annotation (2026-10-08, ADR-077).** Items 1 and 2 above assign `admin` to R13 and keep the schema row's "one named overlap". ADR-077 corrects both: `admin` has one creator, R11 (for the `PlatformSetting` public read surface), and R13 extends it, so the module row now reads "R11 creates its `PlatformSetting` read surface; R13 extends it" and the schema row names two overlaps. The count (eight modules) and the `admin.ts` file's creator (R11) are unchanged; only the module's creating slice and the overlap wording are superseded.

---

## ADR-077 — Admin-module creation and the PlatformSetting read surface

**Status**: Accepted — 2026-10-08
**Owning directory**: `ROADMAP.md`, `docs/`, `AGENTS.md`, `README.md`, `.specify/templates/overrides/`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of the fifteen MVP slices (R1–R15) was carried out before
R1 was specified. It ran the committed drift check, which reported **clean at
2.28.0** with the index ending at ADR-076, and it then tested each recorded overlap
for whether it is a real defect or a cosmetic one. One is real: the roadmap named
the `admin` module's creator twice, and the two namings cannot both hold.

1. **F-01 — the `admin` module had two creating slices, and `PlatformSetting`'s
   public read had no compliant home.** `ROADMAP.md` → R11 assigns this slice "that
   entity — its schema and its **public read projection**", and R11 is the first
   surface that reads it (the public Contact page). `ROADMAP.md` → R13 states "This
   slice also **creates the `admin` module**", and the First obligations table
   states "**R13 owns the `admin` module directory**". The two cannot both hold: a
   *projection* in this repository is a **read path** (`docs/architecture.md`
   describes "a guest's read path projects a part without its price";
   `docs/domain-model.md` has the Contact page read "through a projection of its
   own"), and `docs/architecture.md` §2 requires every read of a table to go through
   the **owning module's service** — "no module outside the owner may read or write
   that table directly". So R11's read of `PlatformSetting` (owned by `admin`) has
   exactly one compliant home — the `admin` module — which R11 is told it may not
   create, and R13 is told it creates. `PlatformSetting` is the **only** entity
   whose creating slice does not own its module: every other entity is created with
   its module (R2 `catalogs`, R3 `parts`/`suppliers`, R8 `bookmarks`, R9
   `notifications`, R10 `messages`, R11 `support`, R13 `AuditLog`). Deferring the
   read to R13 is not available, because R13 already depends on R11 and the edge
   must stay one-way.
2. **F-02 — the "one overlap" wording was scoped too narrowly to be read safely.**
   The schema-file row said "the one overlap named", which reads as "the only
   cross-slice write in the repository"; but R4 extends the `catalogs` module
   service R2 creates, which is the same class of cross-slice write. The wording is
   corrected to name both.
3. **F-03 — the defects table misattributed content-type validation.** The
   roadmap's historical "Defects in the slice order" table listed `R3 (validation,
   …)`, while the register states `R3 (validation: R2)` and R2's own scope row
   reads "Validation, storage, hash, duplicate check, status, and upload quota
   only". Validation is R2's; the row is corrected.

**Decision.** Constitution version **unchanged at 2.28.0** — no constitution text
changes, so the versioning policy does not move it, following the pattern of
ADR-031, ADR-032, and ADR-076.

1. **`ROADMAP.md` → R11** states the read projection is "created inside the
   `admin` module's directory (the read surface only)", and that R13 "extends that
   same module with the administrator's Settings write surface".
2. **`ROADMAP.md` → R13** no longer "creates the `admin` module"; it "extends the
   `admin` module R11 created for the `PlatformSetting` read, adding the
   administrator's write surface and the remaining administrator operations".
3. **`ROADMAP.md` → First obligations** — the module row annotates `admin` as "R11
   creates its `PlatformSetting` read surface; R13 extends it", and the schema-file
   row names both overlaps: `admin.ts` and the `admin` module's read surface
   created by R11 while R13 extends the same module, and R4 extending the
   `catalogs` module R2 creates.
4. **`docs/architecture.md` → Module map, the `admin` row** records that the module
   is created by R11 for the public Contact page's read of `PlatformSetting` and
   extended by R13 with the administrator's write surface.
5. **The precision items F-02 and F-03 are corrected** in the same pass, because
   both sit in rows this change already touches.
6. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-077** (`AGENTS.md`,
   `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the `spec-template.md`
   and `checklist-template.md` overrides), and `Project-Technologies.txt`'s header
   ADR list gains ADR-077.
7. **ADR-074 and ADR-076 gain annotations** naming ADR-077, following the file's
   own annotation rule: their `admin`-ownership claims are marked superseded, and
   the rest of each record stands.

**What deliberately did not change.** No principle was added, removed, renamed, or
redefined. No entity, page, feature, Usage Limit, module count, or slice number
changed, and no slice's `Depends on` edge changed — R13 already depends on R11, and
R11 gains no dependency. The `admin` module is still one of the eight modules R1
does not create, and Principle X's module list is unchanged. The constitution's
footer and `.specify/memory/version.json` stay at 2.28.0. `wafar.single.css` is
untouched. `Core-Project.txt`, `docs/domain-model.md`, and the exception register
are untouched: they describe `PlatformSetting`'s nature and ownership, both
unchanged. `.codebuddy/commands/*` and `.opencode/commands/*` are untouched, so
they stay byte-identical to each other and to their integration manifests. The five
binding overrides keep their structure; only their range string moved.

**Alternatives considered.**
- *Leave the overlap as recorded and let R11's plan resolve it.* Rejected: the
  plan's Constitution Check would then have to choose between violating table
  ownership (a `support` read of an `admin` table) and violating module ownership
  (R11 writing into R13's directory), and both are binding rules — a plan cannot
  lawfully choose either.
- *Keep R13 as the `admin` module's creator and defer the Contact page's read.*
  Rejected: R13 already depends on R11, so R11 cannot depend on R13; the read would
  be a cycle. It would also strip R11's acceptance of the Contact page's contact
  details.
- *Put the read projection in `support` and treat the public read as an exception.*
  Rejected: `docs/architecture.md` states the rule without an exception, and an
  exception is recorded in the exception register with a review date — the honest
  fix is to give the read its compliant home, not to widen the rule.
- *Reword the row without naming a creating slice.* Rejected: the defect is the
  double attribution, and the correction is to name one creator; an unnamed creator
  would leave the row unverifiable again.
- *Bump to 2.28.1 (PATCH).* Rejected: the change touches no constitution text, and
  the established pattern for a roadmap-and-architecture fix (ADR-031, ADR-032,
  ADR-076) leaves the constitution version unchanged.

**Consequences.** The `admin` module has one creator (R11, for the read surface)
and one extender (R13), which is the same shape the roadmap already uses for
`catalogs` (R2 creates, R4 extends), so the "first slice that needs it creates it"
rule holds without an exception. R11's plan no longer has to choose between two
binding rules, and the R11 → R13 edge stays one-way. The "one overlap" wording now
names both cross-slice writes, so a reader does not conclude there is only one. The
defects table names content-type validation against R2, which is where the register
puts it. ADR-074 and ADR-076 carry annotations naming this record, so a reader of
either is not left with the superseded `admin` assignment. The two version sources agree at **2.28.0**, the drift check reports clean
with the index ending at ADR-077, and every live range string reads
`ADR-001 … ADR-077`. This entry is the durable record.

---

## ADR-078 — Superseded owner assignments annotated, and the PlatformSetting duty corrected

**Status**: Accepted — 2026-10-08
**Owning directory**: `docs/`, `ROADMAP.md`, `AGENTS.md`, `README.md`, `.specify/templates/overrides/`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of the whole governance set, and of `ROADMAP.md` in
particular, was carried out before R1 was specified. It ran the committed drift
check (clean at 2.28.0, index ending at ADR-077) and then read every ADR citation
in the roadmap against the record it names, and each of those records against the
decisions that followed it. Three defects of the same class surfaced: a live owner
assignment superseded by a later ADR and left un-annotated, twice, and a roadmap
duty that had not been updated when the read surface it governs was placed.

1. **F-01 — ADR-038 still assigns the OpenSearch client library to R5.** Its
   Decision names four register-gap owners: "Redis client library → R3, OpenSearch
   client library → **R5**, automated accessibility checker → R1, Arabic analyzer
   configuration and verification → R5". ADR-066 moved the OpenSearch owner to
   **R3** — R3 indexes the parts, so it is the first slice to need the client, and
   R5 depends on R3 — and stated the move in its own record but did not annotate
   ADR-038. A reader of ADR-038 alone is left with R5.
2. **F-02 — ADR-039 still assigns the sticky table header to R5.** Its Decision
   item 4 reads "`ROADMAP.md` names R1 for the rail-width token and **R5** for the
   sticky table header", and its Consequences repeat it. ADR-074 moved the sticky
   header to **R4**, because My Files carries the first table the product renders.
   ADR-074 annotated two other records for a supersession in the same change
   (ADR-019 and ADR-052, after ADR-067) but did not annotate ADR-039. A reader of
   ADR-039 alone is left with R5.
3. **F-03 — the `PlatformSetting` duty row did not move with ADR-077.**
   `ROADMAP.md` → First obligations carries a row for the `PlatformSetting` entity
   the Contact page reads; its reference column named ADR-067 and ADR-072 but not
   ADR-077, and its text still described the read projection without the module
   that hosts it. ADR-077 placed the read surface inside the `admin` module's
   directory, so the row is aligned with it.

The file's own rule is the test: "A record is annotated when a later decision
changes what it says." F-01 and F-02 are exactly that — a live assignment a later
decision changed — and the precedent is ADR-074's annotation of ADR-019 and
ADR-052.

**Decision.** Constitution version **unchanged at 2.28.0** — no constitution text
changes, so the versioning policy does not move it, following the pattern of
ADR-031, ADR-032, ADR-076, and ADR-077.

1. **ADR-038 gains an annotation** naming ADR-066: the OpenSearch client library's
   owner is R3, and the other three gap rows the Decision names are unchanged.
2. **ADR-039 gains an annotation** naming ADR-074: the sticky table header's owner
   is R4, and the rail-width token's owner (R1) is unchanged.
3. **`ROADMAP.md` → First obligations** aligns the `PlatformSetting` row with
   ADR-077: the read projection is "created inside the `admin` module's directory
   (the read surface only)", R13 "extends that module", and the reference column
   adds ADR-077.
4. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-078** (`AGENTS.md`,
   `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the `spec-template.md`
   and `checklist-template.md` overrides), and `Project-Technologies.txt`'s header
   ADR list gains ADR-078.

**What deliberately did not change.** No principle was added, removed, renamed, or
redefined. No entity, page, feature, Usage Limit, module, or slice number changed,
and no slice's `Depends on` edge changed — an annotation records a change ADR-066
and ADR-074 already made; it makes none. The constitution's footer and
`.specify/memory/version.json` stay at 2.28.0. `wafar.single.css`,
`Core-Project.txt`, `docs/domain-model.md`, `docs/architecture.md`'s module map,
and the exception register are untouched. `.codebuddy/commands/*` and
`.opencode/commands/*` are untouched, so they stay byte-identical to each other and
to their integration manifests. The five binding overrides keep their structure;
only their range string moved.

**Alternatives considered.**
- *Leave the two records un-annotated, since ADR-066 and ADR-074 each state the
  change in their own record.* Rejected: the file's rule annotates the superseded
  record, and ADR-074 set the precedent by annotating ADR-019 and ADR-052 rather
  than relying on ADR-067's own statement. A reader who opens ADR-038 or ADR-039
  alone must not be left with the superseded owner.
- *Rewrite ADR-038 and ADR-039 in place.* Rejected: a decision record is a
  history; the annotation marks the superseded clause and leaves what was decided
  visible.
- *Fold the correction into ADR-077.* Rejected: ADR-077 is committed, and this is
  a distinct finding of the audit that followed it.
- *Bump to 2.28.1 (PATCH).* Rejected: the change touches no constitution text, and
  the established pattern for a roadmap-and-log fix (ADR-031, ADR-032, ADR-076,
  ADR-077) leaves the constitution version unchanged.

**Consequences.** A reader of ADR-038 or ADR-039 alone now sees the current owner,
with the superseding record named. The `PlatformSetting` duty row and the slice row
that implements it agree on where the read surface lives. The two version sources
agree at **2.28.0**, the drift check reports clean with the index ending at
ADR-078, and every live range string reads `ADR-001 … ADR-078`. This entry is the
durable record.

---

## ADR-079 — Constitution 2.28.1: the drift check's four descriptions aligned

**Status**: Accepted — 2026-10-08
**Owning directory**: `.specify/memory/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `.specify/templates/overrides/`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** The deep audit that produced ADR-077 and ADR-078 also read the four
prose descriptions of `governance-drift-check.mjs` — in `AGENTS.md` §5,
`README.md`, the constitution's References table, and `ROADMAP.md` → First
obligations — against the script itself. The script runs eight checks (A, B, F, C,
D, D2, E, G; nine output lines, because D2 runs once per integration manifest). The
four descriptions did not agree on which of them they named:

- `AGENTS.md` §5 names all eight.
- `README.md` names seven: it omits D2 as a distinct item, folding it into "the two
  integrations' byte-identity".
- The constitution's References row names six: it omits F (the ADR list in
  `Project-Technologies.txt`'s header) and D2.
- `ROADMAP.md`'s First obligations row names four — A, B, C, and E only — omitting
  F, D, D2, and G.

A governance set whose whole purpose is to prevent drift, and which commits a
machine check to enforce it, must not describe that check four different ways: a
reader who takes the sparsest description for the definition believes the check
covers four things when it covers eight.

**Decision.** Constitution **2.28.0 → 2.28.1** (PATCH: a References-row description
is completed and three other descriptions are aligned; no principle, register
entry, entity, page, feature, Usage Limit, module, or slice number changes — the
pattern ADR-048 set for a References-row correction).

1. **The constitution's References row** for `governance-drift-check.mjs` names the
   ADR list in `Project-Technologies.txt`'s header, and states that the two
   integrations' byte-identity covers their command directories and their two
   integration manifests.
2. **`README.md`**'s paragraph states the same coverage for the two integrations'
   byte-identity.
3. **`ROADMAP.md` → First obligations**'s drift-check row names the full set: the
   two version sources, every live range string, the ADR list in
   `Project-Technologies.txt`'s header, the upstream manifest hashes, the two
   integrations' byte-identity (their command directories and their two integration
   manifests), the design-system token register, and the structural counts.
4. `.specify/memory/version.json`'s `constitution_version` moves with the footer,
   and every live `ADR-001 … ADR-0NN` range string moves to **ADR-079**
   (`AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the
   `spec-template.md` and `checklist-template.md` overrides), and
   `Project-Technologies.txt`'s header ADR list gains ADR-079.

**What deliberately did not change.** No principle was added, removed, renamed, or
redefined. No entity, page, feature, Usage Limit, module, or slice number changed,
and no slice's `Depends on` edge changed. `governance-drift-check.mjs` itself is
unchanged: the four descriptions are brought to what the script already does, not
the reverse. `wafar.single.css`, `Core-Project.txt`, `docs/domain-model.md`,
`docs/architecture.md`'s module map, and the exception register are untouched.
`.codebuddy/commands/*` and `.opencode/commands/*` are untouched, so they stay
byte-identical to each other and to their integration manifests. The five binding
overrides keep their structure; only their range string moved.

**Alternatives considered.**
- *Leave the four descriptions at their different granularities.* Rejected: the
  tool is one artifact with one definition, and a reader of the sparsest
  description would believe the check covers four things when it covers eight.
- *Rewrite the script's header to match the roadmap's four.* Rejected: the
  script's header documents what the script does, and the script does more;
  narrowing the description would misdescribe the tool.
- *Fold this into ADR-078.* Rejected: ADR-078 is committed, and this is a distinct
  finding of the same audit.
- *Bump to 2.29.0 (MINOR).* Rejected: nothing is added to the guidance — a
  description is completed and three documents are aligned; ADR-048 set the PATCH
  precedent for a References-row correction.

**Consequences.** The four descriptions of the drift check name the same eight
checks, so a reader of any one of them learns what the committed check verifies.
The two version sources agree at **2.28.1**, the drift check reports clean with the
index ending at ADR-079, and every live range string reads `ADR-001 … ADR-079`.
This entry is the durable record.

---

## ADR-080 — The drift check's structural-count coverage completed

**Status**: Accepted — 2026-10-08
**Owning directory**: `governance-drift-check.mjs`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `.specify/templates/overrides/`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** `governance-drift-check.mjs`'s check G verifies "the structural counts
the governance text states in prose" against the lists that enumerate them. It
carried seven counts — slices, exception rows, principles, data entities,
design-system modules, binding sections, and API modules (ADR-075) — while the
governance text states two more in prose: the constitution's Product Register says
"Twenty-six pages are in scope" and "The sixteen product features are listed in
Product Scope". Neither was machine-checked, so either could drift silently: a page
or a feature added to Product Scope without amending the register would leave the
prose count wrong and the check green. The check's own description was therefore
incomplete in exactly the way ADR-075 exists to prevent.

**Decision.**

1. `governance-drift-check.mjs`'s check G gains two rows:
   - **G8 — pages**: 26, counted from the three page tables in Product Scope (the
     public site, the merchant area, and the administrator application), sliced by
     heading and matched by the two-column row shape, so the three-column Product
     Features table is excluded without a second anchor.
   - **G9 — product features**: 16, counted from the numbered rows of the Product
     Features table.
2. The script's header comment and its check-G inline comment name the two new
   counts, so the tool describes what it does.
3. `AGENTS.md` §5's enumeration of the counts gains "pages" and "product
   features". The other three descriptions of the check (`README.md`, the
   constitution's References table, and `ROADMAP.md` → First obligations) state
   the counts generically and need no change.
4. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-080**
   (`AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/architecture.md`, and the
   `spec-template.md` and `checklist-template.md` overrides), and
   `Project-Technologies.txt`'s header ADR list gains ADR-080.

**What deliberately did not change.** No principle was added, removed, renamed, or
redefined. No entity, page, feature, Usage Limit, module, or slice number changed,
and no slice's `Depends on` edge changed. The constitution's text is untouched —
its References row already describes check G generically — so the version stays
**2.28.1**. `wafar.single.css`, `Core-Project.txt`, `docs/domain-model.md`,
`docs/architecture.md`'s module map, the exception register, and the two
integrations' command directories are untouched.

**Alternatives considered.**
- *Leave the two counts unchecked.* Rejected: the check claims to verify the
  structural counts the governance text states in prose, and a claim that omits two
  of its nine is the defect ADR-075 named.
- *Add the counts by editing the constitution instead of the script.* Rejected: the
  counts are already stated in prose; the gap is in the enforcement, not the text.
- *Bump to 2.29.0 (MINOR) or 2.28.2 (PATCH).* Rejected: the change touches no
  constitution text, and the established pattern for a tooling change that leaves
  the text alone (ADR-071, ADR-078) leaves the version unchanged.
- *Fold this into ADR-079.* Rejected: ADR-079 is committed and aligned the
  descriptions; this adds the enforcement those descriptions then describe.

**Consequences.** Check G now verifies nine counts, so a page or a feature added
to Product Scope without amending the register fails the check instead of drifting
silently. The two version sources agree at **2.28.1**, the drift check reports clean
with the index ending at ADR-080, and every live range string reads
`ADR-001 … ADR-080`. This entry is the durable record.

---

## ADR-081 — Spec Kit CLI upgraded to 1.1.2; the scaffold pin annotated

**Status**: Accepted — 2026-10-08
**Owning directory**: `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `.specify/templates/overrides/`, `Project-Technologies.txt`, `.specify/workflows/speckit/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** ADR-021 pinned Spec Kit to `>=1.1.0`, and both the local install and
the project's scaffold were 1.1.0. `specify self check` reported "Update
available: 1.1.0 → v1.1.2", and the local CLI was upgraded on 2026-10-08 to
v1.1.2 (upstream commit 959e866). The 1.1.1 and 1.1.2 release notes carry no
breaking change to the `.specify/` layout, the command names, or the workflow
schema: they add MCP tools (artifact list, version), workflow and bundler fixes,
and `--json` for `preset info` / `extension info`. The upgrade touches only the
`uv` tool environment; the project's working tree is unchanged by it.

**Decision.**

1. The installed Spec Kit CLI is **1.1.2**. ADR-021's pin floor (`>=1.1.0`) still
   holds and the Node 22 LTS line is unaffected, so ADR-021's Decision stands;
   ADR-021 gains an annotation recording the move.
2. The project's scaffold is **not** re-created. Its `.specify/` templates,
   scripts, manifests, `init-options.json`, `integration.json`, and
   `workflow.yml` remain the 1.1.0 versions that created them, because
   re-scaffolding (`specify init --here --force`) would overwrite the project's
   binding overrides and its customised `workflow.yml` (ADR-072). A scaffold
   refresh, if ever wanted, is a separate decision with its own ADR.
3. `.specify/workflows/speckit/workflow.yml`'s `requires.speckit_version` stays
   `>=1.1.0` — 1.1.2 satisfies it — and its comment now names ADR-081 alongside
   ADR-021.
4. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-081**, and
   `Project-Technologies.txt`'s header ADR list gains ADR-081.

**What deliberately did not change.** No principle, entity, page, feature, Usage
Limit, module, or slice changed, and no slice's `Depends on` edge changed. The
constitution's text is untouched, so the version stays **2.28.1**. No project
file was rewritten to chase the new CLI: a scaffold's recorded version is a fact
about what created it, not a pin to keep in step with the local install.

**Alternatives considered.**
- *Re-scaffold the project to 1.1.2.* Rejected: it would overwrite the binding
  overrides and the customised workflow, and the release carries no change the
  scaffold needs.
- *Leave ADR-021 un-annotated.* Rejected: the record would then read as if the
  install were still 1.1.0 — the class of stale claim ADR-078 closed for
  superseded owner assignments.
- *Bump the constitution to 2.28.2 (PATCH).* Rejected: no constitution text
  changes, and the established pattern for a tooling change that leaves the text
  alone (ADR-071, ADR-078, ADR-080) leaves the version unchanged.

**Consequences.** The installed CLI and the recorded pin are reconciled: the
floor holds, the move is recorded, and the scaffold's own version is left as the
fact it is. The drift check reports clean with the index ending at ADR-081 and
every live range string reading `ADR-001 … ADR-081`. This entry is the durable
record.

---

## ADR-082 — The ADR index's anchor integrity checked, and ADR-064's anchor repaired

**Status**: Accepted — 2026-10-08
**Owning directory**: `governance-drift-check.mjs`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `.specify/templates/overrides/`, `Project-Technologies.txt`, `.specify/memory/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** `docs/DECISIONS.md` is read through its index: every index row links
to an ADR by anchor (`[ADR-0NN](#adr-0nn--…)`), and a reader — a person or an
agent — follows that link rather than scrolling. A verification pass over all 81
index rows against the anchors GitHub generates from their headings found exactly
one that does not resolve: **ADR-064**. Its heading reads "… and
`wafar.single.css` 1.2.1 …", whose slug is `wafarsinglecss` (a period is dropped,
exactly as "1.2.1" → "121" elsewhere), while its index row wrote
`wafar-single-css`. The other eighty rows resolve, the numbering is contiguous
ADR-001…ADR-081, and there are no duplicates. ADR-047 repaired two broken anchors
(ADR-045, ADR-046) by hand; nothing checked the class since, which is why a third
survived.

**Decision.**

1. `docs/DECISIONS.md`'s ADR-064 index row's anchor is corrected to
   `#adr-064--constitution-2231-and-wafarsinglecss-121-the-audit-fix-set`, the
   slug of its heading. The ADR-064 record itself is not touched — only the link
   that points at it.
2. `governance-drift-check.mjs`'s check B gains the anchor verification: every
   `[ADR-0NN](#…)` index row's anchor MUST equal the slug of its `## ADR-0NN — …`
   heading, and every index row MUST have a heading. The slug is computed as
   GitHub computes it — lowercase, drop every character that is not a letter,
   digit, space, or hyphen, then replace each space with a hyphen without
   collapsing, so an em dash between two spaces yields two hyphens.
3. The four descriptions of the check gain the same clause, and the constitution's
   References row names it, which moves the constitution to **2.28.2** (PATCH).
4. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-082**, and
   `Project-Technologies.txt`'s header ADR list gains ADR-082.

**What deliberately did not change.** No principle, entity, page, feature, Usage
Limit, module, or slice changed, and no slice's `Depends on` edge changed. No ADR
record's substance was rewritten: ADR-064's anchor is a link target, not the
record's text. The 2.28.2 bump is PATCH, on ADR-079's precedent for a
description-completing change.

**Alternatives considered.**
- *Repair ADR-064's anchor without adding the check.* Rejected: this is the third
  broken anchor the project has found, and the check that would have caught all
  three costs a few lines.
- *Change ADR-064's heading to `wafar-single-css` so the old anchor resolves.*
  Rejected: the heading is a ratified record's title, and the anchor — not the
  title — is the thing that was wrong.
- *Fold the check into a new letter rather than check B.* Rejected: B already
  parses the index and owns its integrity; a new letter would make the four
  descriptions enumerate a ninth check for no gain.
- *Leave the constitution's References row generic and skip the bump.* Rejected:
  the row names what the check verifies, and B now verifies one more thing.

**Consequences.** A broken index anchor now fails the committed check instead of
surviving until a reader clicks it. The drift check reports clean with the index
ending at ADR-082, every index anchor resolving, and every live range string
reading `ADR-001 … ADR-082`. This entry is the durable record.

---

## ADR-083 — Every ADR reference resolved against the index

**Status**: Accepted — 2026-10-08
**Owning directory**: `governance-drift-check.mjs`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `.specify/templates/overrides/`, `Project-Technologies.txt`, `.specify/memory/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** The governance set cites ADRs by number everywhere — "ADR-040",
"ADR-067", "ADR-082" — and the committed check verified the live range string and,
from ADR-082, the index anchors, but not the individual references. A reference to
an ADR the index does not carry (a typo, or a forward reference to an ADR not yet
written) passed silently. A verification sweep over the fifteen governance files
found 187 distinct references, all of which resolve today: the class was
unchecked, not broken.

**Decision.**

1. `governance-drift-check.mjs`'s check B gains the reference verification: every
   `ADR-NNN` occurrence in the fifteen governance files MUST resolve to an ADR the
   index carries.
2. The four descriptions of the check gain the same clause, and the constitution's
   References row names it, which moves the constitution to **2.28.3** (PATCH).
3. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-083**, and
   `Project-Technologies.txt`'s header ADR list gains ADR-083.

**What deliberately did not change.** No principle, entity, page, feature, Usage
Limit, module, or slice changed, and no slice's `Depends on` edge changed. No
governance file's content changed beyond the descriptions and the range strings:
the sweep found nothing to repair. The 2.28.3 bump is PATCH, on ADR-079's
precedent for a description-completing change.

**Alternatives considered.**
- *Leave the references unchecked.* Rejected: the anchor check (ADR-082) proved
  the class real, and a reference check is the same class one step out.
- *Add the check as a new letter rather than to B.* Rejected: B owns ADR
  integrity — its range strings, its anchors, and now its references.
- *Also assert a fixed reference count.* Rejected: the count moves with every
  ADR; the invariant is that each reference resolves, not how many there are.

**Consequences.** A dangling ADR reference now fails the committed check. The
drift check reports clean with the index ending at ADR-083, every index anchor
resolving, 188 references resolving, and every live range string reading
`ADR-001 … ADR-083`. This entry is the durable record.

---

## ADR-084 — The drift check's ADR citations unified

**Status**: Accepted — 2026-10-08
**Owning directory**: `governance-drift-check.mjs`, `docs/`, `AGENTS.md`, `README.md`, `.specify/memory/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** Five places cite the ADRs that shaped `governance-drift-check.mjs`:
the script's header and its printed banner, `AGENTS.md` §5, `README.md`, and the
constitution's References row. They did not agree. The script said
"(ADR-071, ADR-075)"; the other three said "(ADR-071, ADR-074, ADR-075)". Neither
list matched the history: the file was added in the commit that records ADR-071
and ADR-072, then touched by ADR-073, ADR-074, ADR-075, ADR-080, ADR-082, and
ADR-083, and ADR-071's own record states it created the check. ADR-072 — not
ADR-074 — added checks D2 and F, and the script names ADR-074 in its body while
its header omitted it, so the citation was wrong in both directions. Separately,
ADR-083's Consequences claimed "187 references resolving"; the check reported 188
at that commit.

**Decision.**

1. All five citation sites read the same complete list — **ADR-071, ADR-072,
   ADR-073, ADR-074, ADR-075, ADR-080, ADR-082, ADR-083** — the ADRs that created
   or amended the check, taken from the file's own git history and the records.
2. ADR-083's Consequences "187 references resolving" is corrected to "188
   references resolving", the value the check reported at that commit. The record
   is corrected, not annotated: the claim was wrong, not superseded.
3. The constitution's References row names the list, which moves the constitution
   to **2.28.4** (PATCH).
4. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-084**, and
   `Project-Technologies.txt`'s header ADR list gains ADR-084.

**What deliberately did not change.** No principle, entity, page, feature, Usage
Limit, module, or slice changed, and no slice's `Depends on` edge changed. No
check was added or removed: this change corrects citations, not behaviour. The
2.28.4 bump is PATCH, on ADR-079's precedent for a citation change.

**Alternatives considered.**
- *Align the script to the docs' list (ADR-071, ADR-074, ADR-075).* Rejected: that
  list is itself incomplete — it omits ADR-072, which added two checks.
- *Cite only the creating ADR (ADR-071) and drop the rest.* Rejected: the record
  of what shaped the check is useful, and the file's history makes it exact.
- *Record a fixed reference count in this record.* Rejected for the reason
  ADR-083 already gives: the count moves with every ADR. This record cites none.

**Consequences.** One list, in five places, that matches the file's history. The
drift check reports clean with the index ending at ADR-084 and every live range
string reading `ADR-001 … ADR-084`. This entry is the durable record.

---

## ADR-085 — Roadmap slice-description precision fix set

**Status**: Accepted — 2026-10-08
**Owning directory**: `ROADMAP.md`, `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of the fifteen slices (R1–R15) against the constitution
on 2026-10-08 found no blocking defect — coverage is complete across all eight
registers, the dependency graph is acyclic, and the drift check is clean — but it
found five low-severity precision defects in the slices' own descriptions, of the
class the committed drift check does not cover because none of them is a
countable or a range string:

1. R1's sign-up enumeration omitted the **full name**, which Product Scope → Sign
   Up fixes and which ADR-033 registered as a `User` field.
2. R7's enumeration of the editable non-identifier details named the city and the
   shop name and omitted the **full name**, while Product Scope → Profile reads
   "Edit account details" and `Core-Project.txt` reads "تعديل البيانات"; only the
   mobile number is the non-editable identifier.
3. The handoff of the shell header's **notification control** between R1 and R9
   was unstated: Product Fact Clarifications requires the header to carry a
   notifications control, R1 builds the shell, and the bell with its counter is
   R9's component.
4. R1's **link surface** to the four bare-layout static pages was assigned to R1
   while the four pages are R11's, so the two slices share four routes — a
   coupling that was left implicit.
5. "The first slice with a merchant-scoped query surface" (R2, in
   `docs/domain-model.md` and `ROADMAP.md`) was imprecise: R1 creates `Session`,
   which the constitution's Schema and Migration Control classifies as
   merchant-scoped, so the phrase needed the qualifier the isolation test
   actually turns on.

**Decision.**

1. R1's row names the **full name** in its sign-up enumeration, matching Product
   Scope → Sign Up.
2. R7's row names the **full name** among the non-identifier account details.
3. The notification-bell obligation row states that R1 renders the header's
   notification control from the icon set until R9's bell lands, so the shell is
   complete without that component.
4. The link-surface obligation row states that the four static pages are R11's
   and that the two slices share their four routes.
5. The merchant-isolation statements in `ROADMAP.md` and `docs/domain-model.md`
   are qualified: R2 owns the test as **the first slice whose merchant-scoped
   read surface returns merchant-owned rows**, and R1's `Session` read is keyed
   by the session token, so it cannot return another account's rows and is not
   the surface the test covers.
6. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-085**, and
   `Project-Technologies.txt`'s header ADR list gains ADR-085.

**What deliberately did not change.** No principle, entity, page, feature, Usage
Limit, module, or slice changed; no slice was added, removed, renumbered, or
reordered; no slice's `Depends on` edge changed. The constitution is unchanged
and stays **2.28.4**: no constitutional text is touched, and ADR-076's precedent
keeps a roadmap-only correction at the same version. The audit's sixth
observation — the size of R1 and R3 — is a planning risk, not a defect, and is
recorded rather than acted on: splitting a slice is a scope change and belongs to
its own decision.

**Alternatives considered.**
- *Bump the constitution to 2.28.5.* Rejected: no constitutional rule, register,
  or count changes; a roadmap wording fix is not an amendment, and ADR-076 already
  set the precedent for a roadmap correction at an unchanged version.
- *Split R1 or R3 in this change.* Rejected: the audit found no defect in either,
  and a split would renumber the slices and move every downstream edge — a
  separate decision with its own ADR, not a precision fix.
- *Leave N-05 as a recorded observation.* Rejected: the phrase is checkable, the
  qualifier costs one clause, and a slice reading "first merchant-scoped query
  surface" alone could misplace the entry point.

**Consequences.** The five slice descriptions now name what the registers fix,
and the two cross-slice handoffs (the notification control and the four static
routes) are explicit. The drift check reports clean with the index ending at
ADR-085 and every live range string reading `ADR-001 … ADR-085`. This entry is the
durable record.

---

## ADR-086 — Deep-audit fix set: licensing ownership, drift-check coverage, and tooling pins

**Status**: Accepted — 2026-10-09
**Owning directory**: `docs/`, `ROADMAP.md`, `AGENTS.md`, `README.md`, `.specify/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of the governance set on 2026-10-09 found **no drift**:
the committed check reported clean, every ADR anchor resolved, and every `ADR-NNN`
reference resolved against the index. The audit was looking for the class of
defect the check cannot see, and it found four:

1. **An ownership gap.** No rule and no slice owned the project's own licence.
   `ROADMAP.md` mentioned "licence" once, inside R1's shell duty and only for the
   icon set; `Dependency Governance` governs the licences of *dependencies*; the
   register's "Icon set" row governs the *icon set's* licence. A repository with
   no `LICENSE` grants nothing, and the first slice that self-hosts a
   permissively-licensed icon set and fonts into it would be doing so under an
   undefined grant.
2. **An automation gap.** The check was never executed automatically. It had no
   git hook, no CI configuration, and no root script; it ran when a person
   remembered to run it, while the last ten ADRs were largely repairs to drift
   the check then found.
3. **Coverage gaps in the check itself.** Seven invariants were invisible to it:
   the footer's amended date, the two Arabic mirrors, an index heading with no
   row, an upstream file absent from the manifest, the thirteen extension
   commands that no manifest hashed, a binding section *added* to the
   constitution, and the design system's own header.
4. **An imprecise claim.** `AGENTS.md` stated that both command directories are
   byte-identical "to the upstream Spec Kit commands". Inspection showed that the
   thirteen extension commands are a derived artefact, so the claim is false as
   written for those files.

**Decision.**

1. **Licensing ownership is recorded and the decision is reserved to the owner.**
   `ROADMAP.md` → "First obligations" gains a row assigning the project's own
   `LICENSE` file and the licence it carries to the repository owner (the
   decision) and to R1 (it is committed with the workspace). No `LICENSE` file is
   created by this record: the grant a project makes is the owner's decision, not
   an engineering choice. **Annotated 2026-10-09:** the owner made that decision
   the same day — the project is proprietary, all rights reserved — and **ADR-087**
   creates the file and records the choice.
2. **Tooling pins.** `.nvmrc` pins Node 22 — the LTS ADR-021 already records.
   `.gitignore` gains the planned stack's build, store, cache, and log rules.
   `.gitattributes` gains `*.ts`, `*.tsx`, `*.vue`, `*.js`, `*.cjs`, `*.sql`, and
   `*.svg` as `text eol=lf`, extending ADR-039's rule to the planned stack before
   the workspaces exist so a Windows checkout cannot introduce CRLF into them.
3. **The check runs on commit.** `.githooks/pre-commit` is committed and enabled
   per clone with `git config core.hooksPath .githooks`; it runs the check and
   blocks a drifting commit. It is deliberately bypassable with `--no-verify`,
   and the CI provider R1 wires the check into remains the real enforcement
   point.
4. **Gate A checks the date.** The footer's `**Last Amended**` date is compared
   to `version.json`'s `last_amended`, not the semver alone.
5. **Gate B covers the mirrors and the index in both directions.**
   `Core-Project.txt` and `Project-Technologies.txt` join the scanned set, though
   neither is required to carry a range string; and a `## ADR-NNN — …` heading
   with no index row now fails, the reverse of the check ADR-082 added.
6. **Gate C runs in both directions.** An upstream-owned file present in the tree
   but absent from `speckit.manifest.json` now fails.
7. **Gate D2 covers each integration's whole command directory.** The two
   integration manifests recorded only the ten core commands, so the thirteen
   extension commands were installed, byte-compared against the other
   integration, and never hashed. The manifests now record all twenty-three, and
   D2 fails when a command in the directory has no manifest entry.
8. **Gate G6 derives its set instead of assuming it.** The binding-section set is
   derived from the constitution's own `##` headings, excluding the three
   headings that are deliberately not binding (`Core Principles`, `References`,
   `Governance`); the Authority paragraph must name each derived section; and the
   count the binding template states in words is parsed and compared. A binding
   section added to the constitution now fails instead of passing silently. The
   G section's own comment is corrected in the same change: the other eight
   counts are constants recorded in the check, not values parsed from the prose.
9. **Gate H checks the design system's header.** `wafar.single.css`'s declared
   `الإصدار` and its stated module count are read from its header and checked.
10. **`AGENTS.md`'s byte-identity claim is narrowed** to what holds: the two
    integrations' files are byte-identical to each other, the ten core commands
    mirror upstream, and the thirteen extension commands are derived from
    `.specify/extensions/*/commands/`.
11. **Every live `ADR-001 … ADR-0NN` range string moves to ADR-086**, and
    `Project-Technologies.txt`'s header ADR list gains ADR-086.
12. **The five citation sites that name the ADRs shaping the check gain
    ADR-086** — the script's header and its printed banner, `AGENTS.md` §5,
    `README.md`, and the constitution's References row — so the one list ADR-084
    unified stays one list. Naming it in the constitution's References row moves
    the constitution to **2.28.5** (PATCH), on ADR-084's precedent for a citation
    change.

**What deliberately did not change.** No principle, entity, page, feature, Usage
Limit, module, or slice changed; no slice was added, removed, renumbered, or
reordered; no slice's `Depends on` edge changed. No constitutional rule,
register, or count changes: the only constitutional text this record touches is
the References row's citation list, so the move to **2.28.5** is PATCH, on
ADR-084's precedent for a citation change. The audit's structural observations
are recorded rather than acted on: the size of R1 (N-06) is a planning risk whose
split is a scope change with its own decision; the share of the decision log that
repairs earlier governance is a health metric, not a defect; ADR-020, ADR-021,
and ADR-022 stay marked as reconstructed until an original copy surfaces; and the
six tools that appear both as register rows and as exception rows remain so,
deliberately and cross-referenced.

**Alternatives considered.**
- *Create the `LICENSE` file in this change.* Rejected: the grant a project makes
  is the owner's decision. Recording the ownership gap is a governance act;
  choosing MIT over Apache-2.0 over a proprietary grant is not.
- *Leave the constitution's References row alone, so the version stays 2.28.4.*
  Rejected: ADR-084 made that citation list one list in five places, and a list
  that omits the ADR which amended the check is exactly the drift that record
  closed.
- *Require a live range string in `Core-Project.txt`.* Rejected:
  Single-Reference Sufficiency keeps the mirrors minimal, and scanning a string
  if one appears catches the drift without mandating a new statement in a mirror.
- *Compare the integration commands byte-for-byte against
  `.specify/extensions/*/commands/`.* Rejected after inspection: the installed
  files are a derived artefact — placeholder resolution, a provenance comment,
  and front-matter normalisation — so the comparison would fail on a correct
  tree.
- *Add a root `package.json` to host the check.* Rejected: R1 creates the pnpm
  workspace manifest, and a second one at the root would collide with it.
- *Add a CI configuration now.* Rejected: the continuous-integration provider is
  a register gap R1 owns, and naming one here would be exactly the unvetted
  choice Dependency Governance prohibits.

**Consequences.** The repository has a runtime pin, stack-aware ignore and
line-ending rules, and a check that runs on commit instead of on discipline. The
check covers seven invariants it could not see before and reports clean with the
index ending at ADR-086 and every live range string reading `ADR-001 … ADR-086`.
The licensing gap is visible and owned instead of implicit. This entry is the
durable record.

---

## ADR-087 — The project's licence: proprietary, all rights reserved

**Status**: Accepted — 2026-10-09
**Owning directory**: repository root, `ROADMAP.md`, `docs/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** ADR-086 recorded that no rule and no slice owned the project's own
licence, and reserved the decision to the repository owner. The repository carried
no `LICENSE` file, so it granted nothing: neither a contributor, nor a dependency
auditor, nor the owner's own future workspace could read what the project permits.
The first slice that self-hosts a permissively-licensed icon set and fonts into
the repository would have been doing so under an undefined grant.

**Decision.** Wafar is **proprietary; all rights reserved**. A `LICENSE` file at
the repository root states the grant explicitly: the repository is the copyright
holder's own, no licence is granted by its publication, and no patent, trademark,
or trade-secret licence is granted either. Third-party components stay governed by
their own licences, recorded as Dependency Governance requires, and nothing in the
notice overrides them. The notice names the project as the copyright holder; when
a legal entity is registered it replaces the project name on that line, and that
substitution is a change to this record's subject rather than a new decision.

**What deliberately did not change.** No principle, entity, page, feature, Usage
Limit, module, or slice changed; no slice's `Depends on` edge changed. No
constitutional text is touched, so the constitution stays **2.28.5** and
`version.json` does not move. The `ROADMAP.md` obligation row ADR-086 added stays
in place: it named the owner and the gap, and the gap is now closed by a decision
rather than by the row being removed.

**Alternatives considered.**
- *MIT.* Rejected: the product is a commercial platform built for Libyan
  merchants. A permissive grant would license away rights the owner did not intend
  to give, and it is not required to satisfy the licence of an icon set or a font
  the project bundles.
- *Apache-2.0.* Rejected for the same reason, and because its express patent grant
  answers a risk a proprietary, unpublished repository does not carry.
- *Defer the decision and leave the repository unlicensed.* Rejected: deferral is
  what ADR-086 already did, and it leaves the repository granting nothing while R1
  prepares to vendor third-party assets into it. The gap is closed by deciding,
  not by waiting.
- *Name no copyright holder, or leave a placeholder.* Rejected: a notice carrying
  a placeholder is not a notice. The project name is the only holder identifier the
  repository has; the legal entity replaces it when one exists.

**Consequences.** The repository states its grant, and a contributor or an auditor
can read it. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-087**, and
`Project-Technologies.txt`'s header ADR list gains ADR-087. This entry is the
durable record.

---

## ADR-088 — Governance-debt status, and the integration-topology check

**Status**: Accepted — 2026-10-09
**Owning directory**: `governance-drift-check.mjs`, `docs/`, `AGENTS.md`, `README.md`, `.specify/memory/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A complete inventory of the governance set's open questions on
2026-10-09 found ninety-six of them. Most are owned by a slice and deferred by
decision, and the inventory names them so they are not re-discovered. Fourteen
were recorded as actionable, and two of those turned out to be **record defects
rather than open questions**:

1. **ADR-054's deferred-status annotation miscounted.** ADR-058's annotation on
   ADR-054 read "Two of the four deferred items above are discharged and one is
   still open", and then named two open items — the twenty-three ADR fields and
   the mirror's gap coverage. The count was wrong: two remain open.
2. **ADR-054's fourth item was one undifferentiated debt of three parts**, none of
   which had been re-examined since it was recorded.
3. **Nothing compared the integration topology.** `integration.json`,
   `init-options.json`, the integration directories in the tree, and the bundled
   workflow's nesting all state the same fact, and no gate read any of them. A
   removed integration, a stale default, or a broken `requires.integrations.any`
   nesting would have passed silently.

**Decision.**

1. **ADR-058's annotation on ADR-054 is corrected in place** — "one is still open"
   becomes "two remain open" — on ADR-084's precedent that a record's own wrong
   claim is corrected rather than annotated.
2. **ADR-054's fourth item is reported part by part** in a new annotation. The
   manifest coverage of the exception register is **closed** by ADR-074's
   project-owned path rule. The `.ps1` line endings are **consistent** with
   ADR-039's policy: `*.ps1 text eol=crlf` stores LF and checks out CRLF, which is
   what the attribute means. The twenty-three ADR fields **remain open**, and are
   recorded as deliberately open rather than fixable: writing the missing
   `Alternatives considered` sections now would be the reconstruction ADR-050
   refused to present as contemporaneous.
3. **The two debts that remain open are named at the entry point.** `AGENTS.md` §6
   gains an entry for the twenty-three ADR fields, and one for the Governance
   amendment ADR-064 deferred — moving the eleven stamp-site references out of the
   constitution, which ADR-064 recorded as "a Governance amendment in its own
   right". Neither is closed here; both are made findable.
4. **The drift check gains gate I, the integration topology.** It fails when
   `integration.json` lists an integration with no directory in the tree, when a
   `.‹name›/commands/` directory exists that the registry does not list, when the
   default or `init-options.json`'s integration is not among the installed set,
   when settings exist for an uninstalled integration, or when the bundled
   workflow no longer nests `requires.integrations.any` as ADR-072 fixed it. The
   workflow's list itself is deliberately **not** compared to the registry: its
   own comment states it is an advisory, non-exhaustive compatibility hint and not
   a closed set, so comparing it would fail on a correct tree.
5. **Every live `ADR-001 … ADR-0NN` range string moves to ADR-088**;
   `Project-Technologies.txt`'s header ADR list gains ADR-088; and the five
   citation sites that name the ADRs shaping the check gain ADR-088, which moves
   the constitution to **2.28.6** (PATCH), on ADR-084's and ADR-086's precedent
   for a citation change.

**What deliberately did not change.** No principle, entity, page, feature, Usage
Limit, module, or slice changed; no slice was added, removed, renumbered, or
reordered; no slice's `Depends on` edge changed. No register gap, unresolved
product fact, deferred area, or mandated value is decided here. No
`Alternatives considered` section is written for any record: that is the
reconstruction ADR-050 refused. The constitution's own stamp-site paragraph is not
moved: ADR-064 deferred that to a Governance amendment of its own, and this record
only makes the deferral findable. The README's Setup, Testing, and Deployment
sections stay placeholders, because the first workspace feature owns them.

**Alternatives considered.**
- *Write the missing `Alternatives considered` sections for the twenty-three
  records.* Rejected: ADR-050 already refused to present reconstruction as
  contemporaneous reasoning, and those records' alternatives were never captured.
- *Close the twenty-three-field debt by declaring amendment records exempt from the
  field.* Rejected as out of scope: Documentation's rule binds every non-trivial
  technical decision, and narrowing it is an amendment to a binding rule, not a
  status correction.
- *Move the constitution's stamp-site list out of the constitution in this
  change.* Rejected: ADR-064 deferred it as a Governance amendment in its own
  right, and folding it into a status-and-tooling record is the bundling this
  repository's amendment procedure separates.
- *Compare the workflow's `requires.integrations.any` list to `integration.json`.*
  Rejected after reading it: the list is an advisory compatibility hint by its own
  comment, so the comparison would fail on a correct tree. Only its nesting is
  checked.
- *Leave ADR-058's miscount to stand, since a reader can reconcile it from the
  following sentence.* Rejected: a wrong count in a durable record is the defect
  ADR-084 corrected in ADR-083, and reconciling it is work the record should not
  impose.

**Consequences.** The record of ADR-054's deferral now matches the tree, the two
debts that remain open are findable from the entry point, and four files that state
one fact are compared by a gate instead of by discipline. The check reports clean
with the index ending at ADR-088 and every live range string reading
`ADR-001 … ADR-088`. This entry is the durable record.

---

## ADR-089 — Roadmap defect-table precision fix set

**Status**: Accepted — 2026-10-09
**Owning directory**: `ROADMAP.md`, `docs/`, `Project-Technologies.txt`, `AGENTS.md`, `README.md`, `.specify/templates/overrides/`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of `ROADMAP.md`'s own "Defects in the slice order"
table on 2026-10-09 found three precision defects in the table itself, plus a
stale date in the technology mirror. The defects were found by checking the
table's claims against the sources it cites, not by reading the table:

1. **Defect #2's closure cell over-listed.** The defect names "Six register
   gaps", and the count is correct — the constitution's Register gaps table
   names exactly five rows assigned to "the first deploying slice" (error
   tracker, secret manager, TLS certificate management, log pipeline, load-test
   tool) and one to "the first slice that introduces the test runner" (the
   continuous-integration provider). But the "Closed by" cell enumerated ten
   items and omitted the SMS provider and SBOM generator that R1 owns directly.
2. **Defects #8 and #13 stated the same fact.** Both said the binding template
   did not carry the sub-spec `Input` line.
3. **The icon set appeared in both #2 and #9.**
4. **The mirror's date was stale.** `Project-Technologies.txt` read "last
   amended 2026-10-08" while the constitution's footer and `.specify/memory/version.json`
   both read 2026-10-09.

**Decision.**

1. Defect #2's "Closed by" cell is corrected to name exactly the six register
   gaps that named a phantom owner: the continuous-integration provider (R1) and,
   for R12, the error tracker, secret manager, TLS certificate management, log
   pipeline, and load-test tool. The over-listed items are removed.
2. Defect #8 keeps only "the sub-spec `Input` convention was stated in two
   different forms"; the binding-template statement belongs to #13 alone.
3. The icon set is named only in defect #9; it leaves defect #2's cell.
4. `Project-Technologies.txt`'s "last amended" date is corrected from 2026-10-08
   to 2026-10-09, to agree with the constitution's footer and `version.json`.
5. The ADR-020, ADR-021, and ADR-022 "reconstructed" markers are accurate as
   they stand (ADR-086) and are left unchanged; no original has surfaced.
6. Every live `ADR-001 … ADR-0NN` range string moves to ADR-089, and
   `Project-Technologies.txt`'s header ADR list gains ADR-089.

**What deliberately did not change.** The sixteen-defect count, the slice order,
every slice and its `Depends on` edges, and the First obligations rows are
untouched. No principle, section heading, register row, Product Scope item,
entity, page, feature, Usage Limit, module-map row, or design value changed, so
the constitution is not amended and stays **2.28.6**. No slice was added,
removed, renumbered, or reordered.

**Alternatives considered.**

- *Rewrite defect #2 to enumerate every register gap.* Rejected: the defect's
  subject is the six gaps assigned to phantom owners, not the register's full
  gap set; the constitution's Register gaps table already carries the complete
  list, and repeating it here would be a second source that drifts.
- *Merge defects #8 and #13 into one row.* Rejected: merging would change the
  sixteen-row count the governance text states in prose (gate G), and the two
  rows record two distinct findings.
- *Move the constitution's stamp-site list in this change.* Rejected: ADR-064
  recorded that as a Governance amendment in its own right, so it is a separate
  change and not this record's subject.
- *Leave the mirror's stale date.* Rejected: a date that disagrees with both
  version sources is the class of drift the check exists to catch, even where no
  gate reads this file's date.

**Consequences.** The defect table names exactly what each defect closed, the
two `Input`-line defects are distinct, the mirror's date agrees with the two
version sources, and the check reports clean with the index ending at ADR-089 and
every live range string reading `ADR-001 … ADR-089`. This entry is the durable
record.

---

## ADR-090 — The Documentation rule reaches technical decisions

**Status**: Accepted — 2026-10-09
**Owning directory**: `.specify/memory/`, `docs/`, `AGENTS.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** Twenty-three decision records carry no `Alternatives considered`
section: ADR-011, ADR-012, ADR-013, ADR-014, ADR-017, ADR-018, ADR-020, ADR-021,
ADR-022, ADR-023, ADR-024, ADR-025, ADR-026, ADR-027, ADR-028, ADR-029, ADR-035,
ADR-036, ADR-037, ADR-038, ADR-044, ADR-045, and ADR-046. The Documentation rule
requires the field "for every non-trivial technical decision". Writing the
sections now would be the reconstruction ADR-050 refused to present as
contemporaneous. ADR-088 recorded the debt as deliberately open and named the only
honest closure — narrowing the rule to its own subject — while leaving it to a
separate amendment rather than folding it into a status record.

**Decision.**

1. The Documentation rule is clarified: the `Alternatives considered` field
   reaches a non-trivial **technical** decision — a product or engineering
   choice. A **governance record**, whose subject is this constitution's own
   text, a register, the process, or the governance tooling rather than a product
   or engineering choice, is not a technical decision and is outside the field's
   reach. A section is not written for such a record after the fact, because that
   would be reconstruction rather than a record.
2. The twenty-three records above are governance records under that reading, so
   the field never reached them. The debt is **closed**; no section is
   reconstructed.
3. `AGENTS.md` §6's entry is updated to record the closure.
4. The constitution moves to **2.29.0** (MINOR: the change narrows the reach of a
   binding MUST, a semantic change, not a wording or citation refinement). The
   footer and `.specify/memory/version.json` move together, and `version.json`'s
   `recorded_by` becomes ADR-090.
5. Every live `ADR-001 … ADR-0NN` range string moves to ADR-090, and
   `Project-Technologies.txt`'s header ADR list gains ADR-090.

**What deliberately did not change.** No principle, section heading, register
row, Product Scope item, entity, page, feature, Usage Limit, module-map row,
design value, slice, or slice dependency changed. The twenty-three records
themselves are untouched. The rule's obligation for a technical decision is
unchanged: a product or engineering decision still MUST record its alternatives,
and every bootstrap record that carries the section keeps it.

**Alternatives considered.**

- *Write the twenty-three missing sections.* Rejected: ADR-050 already refused to
  present reconstruction as contemporaneous reasoning, and those alternatives
  were never captured.
- *Grandfather the twenty-three by number and require the field from ADR-090
  onward.* Rejected: a number-based cut-off would leave a future governance
  record in doubt and would not state why the field does not reach it; the
  subject test is the durable rule.
- *Leave the debt open.* Rejected: ADR-088 named narrowing the rule as the only
  honest closure and made the debt findable; this record completes it.
- *Bump PATCH instead of MINOR.* Rejected: the change narrows the reach of a
  binding MUST, which is a semantic change; PATCH is reserved for clarifications
  and citations that leave scope untouched.

**Consequences.** The Documentation rule states its own subject, the
twenty-three-record debt is closed without reconstruction, `AGENTS.md` §6 records
the closure, the constitution moves to 2.29.0, and the check reports clean with
the index ending at ADR-090 and every live range string reading
`ADR-001 … ADR-090`. This entry is the durable record.

**Annotation (2026-10-21, ADR-102).** The count of records this rule leaves
outside its reach is **twenty-four**, not twenty-three: ADR-092, recorded the day
after this record, is a governance record of the same class and carries no
`Alternatives considered` section. Decision 2's reasoning reaches it unchanged,
and the list in the Context stays as written — it is this record's own count at
its own date. `AGENTS.md` §6 states the corrected count.

---

## ADR-091 — The stamp-site list stays in the constitution

**Status**: Accepted — 2026-10-09
**Owning directory**: `docs/`, `AGENTS.md`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** The Governance section's stamp-site paragraph — the numbered list of
the version's two sources and the durable record, at `.specify/memory/constitution.md`
→ Governance — has been recorded since ADR-064 as an amendment "in its own right"
whose relocation was deferred. `AGENTS.md` §6 carried it as an owned, unscheduled
amendment so it would not be lost. No record had decided whether the list should
move or stay.

**Decision.**

1. The stamp-site list stays in the constitution. It is not moved to another
   document.
2. The reason is that the paragraph declares itself "the single authority for
   those sources"; relocating it to a document of lower precedence would place a
   lower-precedence authority over the constitution's own version sources and
   contradict Governance's precedence rule (constitution, then agent instruction
   files, then the readme, then any other guidance). The list is a Governance
   MUST binding this document, so it belongs in this document, and gate A of the
   drift check already enforces the two sources mechanically.
3. `AGENTS.md` §6's entry is updated to record the decision.
4. The debt is **closed** by the decision; no further amendment is owed.
5. Every live `ADR-001 … ADR-0NN` range string moves to ADR-091, and
   `Project-Technologies.txt`'s header ADR list gains ADR-091.

**What deliberately did not change.** The constitution's text is unchanged, so it
stays **2.29.0**. No principle, section heading, register row, Product Scope item,
entity, page, feature, Usage Limit, module-map row, design value, slice, or slice
dependency changed.

**Alternatives considered.**

- *Move the list to a separate governance file.* Rejected: it would create a
  lower-precedence authority over the version sources and contradict Governance's
  precedence rule; the paragraph's own self-declaration as the single authority is
  the reason it stays.
- *Move it into `AGENTS.md`.* Rejected for the same reason: `AGENTS.md` is an
  agent instruction file, below the constitution in precedence.
- *Leave the debt open as an unscheduled amendment.* Rejected: the audit's goal
  is closure; the decision to keep the list is itself the closure, and it costs no
  rule change.
- *Fold this into ADR-090.* Rejected: ADR-090's subject is the Documentation
  rule; bundling a Governance decision with it would misstate what each covers.

**Consequences.** The stamp-site list's home is decided rather than pending,
`AGENTS.md` §6 records the decision, the constitution stays 2.29.0, and the check
reports clean with the index ending at ADR-091 and every live range string reading
`ADR-001 … ADR-091`. This entry is the durable record.

---

## ADR-092 — The integration-topology gate made unconditional

**Status**: Accepted — 2026-10-10
**Owning directory**: `governance-drift-check.mjs`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `.specify/templates/overrides/`, `.specify/memory/`, `Project-Technologies.txt`
**Owning feature**: none — governance decision; ratified by the repository owner

**Context.** A deep audit of the governance set on 2026-10-10 found one
structural defect inside `governance-drift-check.mjs` itself. Gate **I** (the
integration topology, ADR-088) had been written inside the `else` branch that
belongs to gate **H** (the design-system header, ADR-086): the `} else {` opened
for H's version check closed only after gate I's whole block, so I ran only when
H's version check succeeded. Every gate is meant to be independent — the script's
own header lists A, B, F, C, D, D2, E, G, H, and I as separate checks. The defect
was latent rather than active: gate H's version check passes on the current tree,
so gate I ran and the check reported clean. But the two gates were coupled, so
had `wafar.single.css` ever lost its `الإصدار:` header line, gate H would fail and
gate I would be skipped entirely — a missing integration, a stale default, or a
broken `requires.integrations.any` nesting could then have passed unobserved at
the very moment another gate was already failing.

**Decision.**

1. The `}` that closed gate H's `else` branch is moved to sit immediately after
   H's version note, so gate H closes where it opens and gate I (the integration
   topology) runs at the top level as its own check, unconditionally, as ADR-088
   intended. No gate's logic, message, or coverage changes; only the brace
   placement does. The module-count half of gate H is unaffected and continues to
   run unconditionally.
2. Every live `ADR-001 … ADR-0NN` range string moves to **ADR-092**.
3. `Project-Technologies.txt`'s header ADR list gains ADR-092, and its "last
   amended" date moves to 2026-10-10 to agree with the two version sources.
4. The five citation sites that name the ADRs shaping the check gain ADR-092 —
   the script's header comment and its printed banner, `AGENTS.md` §5,
   `README.md`, and the constitution's References row — so the one list ADR-084
   unified stays one list. Naming it in the constitution's References row moves
   the constitution to **2.29.1** (PATCH), on ADR-084's, ADR-086's, and ADR-088's
   precedent for a citation change.

**What deliberately did not change.** No principle, section heading, register
row, Product Scope item, entity, page, feature, Usage Limit, module-map row,
design value, slice, or slice dependency changed. No gate was added, removed, or
re-scoped: the check verifies exactly what its four descriptions already state,
and this record only makes gate I run when gate H fails. The constitution's only
text change is the References row's citation list, so the move to **2.29.1** is
PATCH, on ADR-084's precedent for a citation change.

**Consequences.** Gate H and gate I are now independent, so a failure in one no
longer suppresses the other. The check reports clean with the index ending at
ADR-092 and every live range string reading `ADR-001 … ADR-092`. This entry is
the durable record.

---

## ADR-093 — Remove the custom design system and establish the UI foundation

**Status**: Accepted — 2026-10-20
**Owning directory**: `.specify/memory/constitution.md`, `.specify/templates/overrides/`, `governance-drift-check.mjs`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `Core-Project.txt`, `wafar.single.css` (deleted)
**Owning feature**: none — governance decision; ratified by the repository owner. R1 implements the Wafar UI layer.

**Context.** The project carried a bespoke frontend design system: `wafar.single.css`
(4,459 lines, 480 custom properties, 290 `.ds-*` classes, 14 modules), a
419-line `Design System Standards` register, Principle IX, three drift-check
gates, and references across the governance set. The system duplicated Nuxt UI
v4, required its own component inventory, token families, state matrix, fonts,
motion scale, z-index scale, breakpoints, and shell measurements, and blocked R1
before any application code existed. The repository owner rejected the old
colours and the old frontend design in full.

**Decision.**

1. Delete `wafar.single.css` and remove every old visual value from the binding
   text: the brand/accent palette, the dark-mode default, Tajawal and JetBrains
   Mono, the 19rem sidebar and 68px header, and the spacing, radius, shadow,
   motion, z-index, and breakpoint scales.
2. Remove `Design System Standards` and all twelve subsections. Replace
   Principle IX with `IX. UI Foundation Fidelity`: Nuxt UI v4 is the only UI
   component library; the Wafar UI layer is the only source of project-specific
   values; a second component library, a parallel token file, or a custom
   component CSS library is prohibited. Keep the principle count at ten and
   reduce the binding-section count from nineteen to eighteen.
3. Keep every approved technology. Nuxt 4, Vue 3, TypeScript, Tailwind CSS v4,
   Nuxt UI v4, Pinia, TanStack Query, Hono, OpenAPI, Zod, PostgreSQL, Drizzle,
   PgDog, OpenSearch, SeaweedFS, BullMQ, Redis, better-auth, Vitest, Playwright,
   ESLint, Prettier, Stylelint, Lighthouse CI, Semgrep OSS, osv-scanner, ClamAV,
   Prometheus, Grafana, pnpm, and Turborepo remain registered. Stylelint remains;
   its rule now points at the Wafar UI layer instead of `wafar.single.css`.
4. Preserve the non-visual product rules: the shared shell, its bare-page
   exemptions, the sidebar's full/rail/drawer behaviour, the theme switch, the
   table rule for data views, Arabic-first RTL, Latin numerals, no emoji,
   accessibility, and the 44px touch target.
5. Do not add `packages/ui` or any other package to the constitution. R1's plan
   fixes the Wafar UI layer's path and builds it through SpecKit. The
   constitution names the layer, not its directory.
6. Move the constitution to **3.0.0** (MAJOR): a principle is redefined and a
   binding section is removed. Update `version.json`, the template overrides,
   the drift check, the governance documents, the two Arabic mirrors, and the
   live ADR range strings in the same change.

**What deliberately did not change.** No technology was removed or downgraded.
No entity, page, product feature, role, usage limit, or security rule changed.
The table rule remains in Product Scope. The icon set remains an open register
gap owned by R1. No application code, package, design lab, or website was
created. The old ADR records were not rewritten; their design-system provisions
are superseded by this record and the note in the index.

**Alternatives considered.**

- *Keep and trim the old design system.* Rejected: it duplicates Nuxt UI v4 and
  preserves the maintenance cost the owner rejected.
- *Use Nuxt UI defaults without a project layer.* Rejected: Arabic typography,
  RTL behaviour, the product's identity, and a small set of Wafar patterns still
  need one recorded source.
- *Add `packages/ui` to the constitution now.* Rejected: the owner required
  SpecKit to choose and build the code; the constitution must not pre-empt the
  plan or add a package before the plan exists.
- *Delete the old ADRs.* Rejected: they are the historical record and the index
  and cross-references depend on them. A supersession note preserves
  traceability without rewriting history.

**Consequences and migration/backfill.** The constitution is 3.0.0 with ten
principles and eighteen binding sections. `wafar.single.css` is deleted and no
live file may depend on it as a source of design values. The drift check stops reading the old file, removes
gates G5 and H, turns E into an absence check (the stylesheet and the removed
constitution section must not reappear), and sets the binding-section count to
eighteen. The four template overrides lose their design-system references: the
constitution template loses the removed section; the plan template loses its
register row, CMV row, and Gate 2 row; and the spec and checklist templates lose
the stylesheet source. Feature artifacts written
under 2.x are re-read against Principle IX: any old token, class, font, or shell
measurement is invalid. R1's plan records the Wafar UI layer's path and builds
it; the visual direction remains a separate decision. This entry is the durable
record.

**Annotation (2026-10-21, ADR-097/098).** Decision 5 assigned the Wafar UI
layer's path to R1's plan. ADR-097, recorded ahead of R1 to close the pre-R1
foundation gap, fixes the path as `packages/ui` under Principle IX and leaves it
outside the constitution's topology and Internal layout rows. R1's plan consumes
the path. The icon set that decision 5 left to R1 is fixed by ADR-098; the
constitution's register gap remains the requirement, and R1's plan fills CMV
row 11.

---

## ADR-094 — Guest header controls and the administrator shell

**Status**: Accepted — 2026-10-20
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `Core-Project.txt`, `specs/001-identity-foundation/`
**Owning feature**: none — product correction ratified by the repository owner; R1 builds the frame.

**Context.** The Product Fact Clarifications bullet said a guest sees a login
action "instead of those controls", after naming the account, notifications,
theme-toggle, and sidebar-collapse controls. Read literally, it removed the
theme switch and the sidebar-collapse control from the guest header. The feature
specification for R1 (FR-023 and AC-025) had already decided that the login
action replaces the account and notifications controls only, because the
appearance and the sidebar belong to the frame rather than to an account; on a
narrow screen the collapse control is the only affordance that opens the
sidebar drawer. The same bullet also said that administrator pages "carry no
header", which contradicted Product Scope's statement that the administrator
application carries its own shell. The specification recorded that both texts
had to be corrected in the same change.

**Decision.**

1. A guest sees a login action in place of the account and notifications
   controls only. The theme switch and the sidebar-collapse control remain
   available to the guest.
2. Pages without the product's shared shell — authentication, 404, and static
   pages — carry no header. The administrator application carries its own shell
   and header; it is not covered by the shared-shell exemption.
3. The specification's FR-023 and AC-025 stand unchanged; this record removes
   the contradiction at its source rather than narrowing the feature.
4. The footer question is not decided here. The link surface remains the choice
   of the slice that first builds a shell page; R1's existing FR-024 records the
   footer-band choice, and its plan supplies the decision record.

**Annotation (2026-10-21, ADR-102).** Decision 1's wording reads correctly
again: the header carries a notifications control once more, so a guest's
sign-in action replaces the account and notifications controls, and the guest
keeps the theme switch, which now sits in the header beside them rather than in
the sidebar. The decision this record made is unchanged.

**What deliberately did not change.** The three surfaces remain: the public
site, the merchant area, and the separate administrator application with its own
login. The shared shell remains the public/merchant frame; the administrator
shell remains separate. No page, role, entity, feature, usage limit, security
rule, or technology changed. No footer is added to the constitution by this
record. No application code or package is created.

**Alternatives considered.**

- *Apply "instead of those controls" literally.* Rejected: it removes the only
  sidebar-drawer affordance on a narrow screen and forces a new control that
  the rule did not name.
- *Hide the sidebar from guests.* Rejected: guests need the public navigation,
  and the Product Scope's frame is not role-scoped in that way.
- *Add a separate menu button for guests.* Rejected: it preserves the literal
  wording at the cost of an extra control and a second way to open the same
  drawer.
- *Treat the administrator application as a no-header page.* Rejected: it
  contradicts Product Scope and the separate-shell architecture.

**Consequences and migration/backfill.** The constitution moves to **3.1.0**
(MINOR): the guest's visible header rule changes, so this is not a PATCH.
`version.json`, the ADR ranges, `Project-Technologies.txt`'s header, and the
specification's source block move to ADR-094 in the same change. R1 implements
the frame under FR-023/AC-025 and builds the footer band under FR-024; the
footer's constitutional status is unchanged. This entry is the durable record.

**Annotation (2026-10-21, ADR-099).** The guest rule stands — the sign-in action
replaces the account control only, and the guest keeps the appearance and the
sidebar — but the theme switch and the sidebar-collapse control now sit in the
sidebar, not the header. No notifications control remains in the header for the
guest or for the merchant.

---

## ADR-095 — Make opencode the default integration; keep codebuddy installed

**Status**: Accepted — 2026-10-20
**Owning directory**: `.specify/`, `.specify/templates/overrides/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `specs/001-identity-foundation/`
**Owning feature**: none — governance decision; ratified by the repository owner.

**Context.** The project supports two Spec Kit integrations, `codebuddy`
(WorkBuddy AI) and `opencode`. Both command directories are installed and
byte-identical, and both manifests are committed. The project was initialised
with `codebuddy` as the default, but the repository owner uses `opencode` and
may still use more than one environment. Deleting `codebuddy` would remove a
supported environment and force a broad governance change; leaving `codebuddy`
as the default would keep the working default out of step with actual use.

**Decision.**

1. Keep both integrations installed and keep `.codebuddy/` and `.opencode/`
   with their manifests and byte-identical command sets.
2. Make `opencode` the default in `.specify/integration.json` and
   `.specify/init-options.json`.
3. Keep `codebuddy` available as the second integration; no command file,
   manifest, workflow integration entry, or extension-registry entry is
   removed.
4. Record the default change here; the constitution is not amended and its
   version stays **3.1.0**.

**What deliberately did not change.** No product rule, page, role, entity,
feature, usage limit, security rule, technology, UI foundation rule, or
deployment rule changed. No integration was removed. No application code or
package was created. The workflow's advisory `requires.integrations.any` list
still names both integrations.

**Alternatives considered.**

- *Remove `codebuddy` and keep only `opencode`.* Rejected: the owner may use
  more than one environment, and removal would delete a supported integration
  and its manifest for no product benefit.
- *Keep `codebuddy` as the default.* Rejected: it would keep the default out of
  step with the environment the owner actually uses.
- *Change the default without recording it.* Rejected: integration topology is
  committed state and a non-trivial governance change; the durable record is
  required.

**Consequences and migration/backfill.** `opencode` is the default for a
command that does not name an integration; `codebuddy` remains available and
byte-identical. The constitution stays at 3.1.0 because no constitutional text
changes. `docs/DECISIONS.md` gains this record and its index row; the live ADR
ranges move to ADR-095 and `Project-Technologies.txt`'s header gains ADR-095 in
the same change. The drift check remains clean. This entry is the durable
record.

---

## ADR-096 — The R1 pre-planning fix set: the CMV values, the shell's link surface, the sidebar list, and the spec scan

**Status**: Accepted — 2026-10-20
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `Core-Project.txt`, `Project-Technologies.txt`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `specs/001-identity-foundation/`, `governance-drift-check.mjs`, `.githooks/`
**Owning feature**: R1 (the first feature that needs the three CMV values and builds the shell's link surface); the governance changes are ratified by the repository owner.

**Context.** A pre-planning audit of the constitution, the two Arabic mirrors,
the roadmap, the architecture, the domain model, the binding templates, the
drift check, and `specs/001-identity-foundation/` found three blocking
cross-artifact defects. First, the specification directs three families of
values to `Constitution Mandated Values` — the full-name and shop-name maximum
lengths (FR-001), the password policy parameters (FR-035), and the one-time
code's lifetime, re-request limit, and incorrect-entry bound (FR-034) — but
Module Discipline's list is closed and did not name them, so a plan could
neither omit them nor record them lawfully. Second, `Core-Project.txt` said the
sidebar's item list was "by role", while the specification fixed one list of
eight items shown identically to a guest and to a signed-in merchant in four
places (FR-039, AC-042, the Assumptions, and the Test Coverage Request).
Third, Product Scope defined the shell as "a header and a sidebar", while the
specification's FR-024, AC-022, and AC-026 place the static pages' link surface
in a footer band that is part of the frame. Four consistency defects were found
in the same audit: a stale "token" in Single-Reference Sufficiency after the
token register was removed; `AGENTS.md` §3 claiming to mirror the constitution's
Reading protocol while naming the whole constitution for five commands; no
annotation on ADR-068 after ADR-095 changed its stated default; and the drift
check not scanning feature specifications for the live ADR range string, which
the R1 specification already carries.

**Decision.**

1. The closed `Constitution Mandated Values` list gains three values, appended
   as items 15-17: the password policy parameters (the minimum length and the
   common-or-breached-password source); the one-time-code lifetime, its
   re-request limit, and the incorrect-entry bound; and the profile field
   maximum lengths (the full name and the shop name).
2. Product Scope's shell definition becomes a header, a sidebar, and the surface
   that carries the links to the static pages, with that surface recorded by the
   first slice that builds a shell page. R1 records it as the footer band its
   specification already fixes.
3. `Core-Project.txt`'s sidebar bullet becomes the eight approved pages shown
   identically to a guest and to a signed-in merchant, with no item added,
   removed, or disabled by role. The specification stands unchanged.
4. The drift check scans `specs/**/*.md` for the live `ADR-001 … ADR-0NN` range
   string, alongside the files it already scans. The R1 specification's range
   string is checked from this change on.
5. The consistency defects are corrected: "token" leaves the approval list in
   Single-Reference Sufficiency (tokens are approved by the Wafar UI layer, not
   by a constitutional register); `AGENTS.md` §3 names the same sections as the
   constitution's Reading protocol; ADR-068 gains an annotation for ADR-095;
   and the specification's stale cross-reference and two spacing typos are
   corrected.

**What deliberately did not change.** No principle was added, removed, renamed,
or redefined. No entity, page, product feature, role, usage limit, module, or
slice number changed. The eight sidebar items themselves, the four static pages,
and the three bare pages this slice ships are unchanged; only the role qualifier
on the sidebar list and the shell's link surface are fixed. No technology was
removed or downgraded. The twenty-six pages are untouched.

**Alternatives considered.**

- *Point the three specification values at the plan's Complexity Tracking table
  instead of the closed CMV list.* Rejected: Module Discipline requires a MUST
  that names a value to enter the CMV list first, and a value recorded anywhere
  else does not satisfy the rule that names it.
- *Change the specification's sidebar list to a role-dependent list.* Rejected:
  the specification fixes one composition in four places, and a role-dependent
  list would reopen FR-039, AC-042, the Assumptions, and the Test Coverage
  Request; the product mirror carried the older, ambiguous wording.
- *Record the footer band as a Complexity Tracking deviation instead of amending
  Product Scope.* Rejected: the specification commits to the footer band in
  three places, and a permanent deviation would leave the shell's definition
  inaccurate in the register.
- *Leave feature specifications out of the drift check.* Rejected: the range
  string is live in the specification, so a later ADR would leave it stale with
  no failure; the check exists to catch exactly that.
- *Split this fix set into one ADR per finding.* Rejected: the findings share
  one cause — artifacts written at different times against different states of
  the register — and one record keeps the reconciliation traceable, as ADR-085,
  ADR-086, and ADR-089 did for their fix sets.

**Consequences and migration/backfill.** The constitution moves to **3.2.0**
(MINOR): the closed CMV list gains three values and the shell's definition
gains its link surface. The plan template's CMV table gains rows 17-19 and its
row-number note moves from fourteen values/sixteen rows to seventeen/nineteen.
`Core-Project.txt`, `Project-Technologies.txt`, the templates, the governance
documents, and the specification's live range string move to ADR-096 in the
same change. R1's plan can now record the three value families under
`Constitution Mandated Values` without an exception. The drift check reports
clean with the index ending at ADR-096 and every live range string reading
`ADR-001 … ADR-096`. This entry is the durable record.

**Annotation (2026-10-21, ADR-097/098).** The index now ends at ADR-098, and
every live range string reads `ADR-001 … ADR-098`. The closing paragraph above
records the state at ADR-096's acceptance; the substance of this record is
unchanged.

---

## ADR-097 — The Wafar UI layer and the Nuxt 4 app layout

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `governance-drift-check.mjs`, `.githooks/pre-commit`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `specs/001-identity-foundation/`
**Owning feature**: none — governance decision; ratified by the repository owner. R1's plan consumes the path and builds the shell.

**Context.** The 3.2.0 pre-R1 audit found the UI foundation named in Principle IX
but not fixed in the repository. There was no application code, no `packages/ui`,
and no R1 `plan.md` or `tasks.md`. The constitution's Principle IX says the
Wafar UI layer is built by R1 through SpecKit and that R1's plan fixes its path;
ADR-093 assigned that decision to R1's plan and explicitly forbade adding
`packages/ui` or any other package to the constitution. At the same time, the
constitution's Repository topology rule says a package MUST NOT be added to
`packages/` without an amendment, its Internal layout fixes the frontend
locations in Nuxt 3-style paths, and the tasks template forbids an `app/`
segment. Nuxt 4, however, defaults to `app/`. The R1 specification is Draft and
cannot enter planning while those artifacts disagree. The operator approved the
pre-R1 remediation and the recommended defaults on 2026-10-21, including
`packages/ui` and Nuxt 4 `app/`.

**Decision.**

1. The Wafar UI layer path is `packages/ui`, a private Nuxt 4 layer shared by
   `apps/web` and `apps/admin`. The layer owns design tokens, theme
   configuration, IconPark icons, IBM Plex Sans Arabic, and shared primitives.
   App-specific pages, components, composables, and stores stay in each app; the
   layer is not a second application and holds no product pages.
2. `packages/ui` is not added to the constitution's Repository topology or
   Internal layout as a package row (ADR-093). The 3.3.0 amendment adds one
   narrow exception note to each table: the Wafar UI layer's path is fixed by
   this record and `docs/architecture.md` under Principle IX, it is not a row of
   either table, and no feature may create a parallel UI layer. No other package
   may be added without a constitutional amendment.
3. Nuxt 4's default `app/` layout is fixed for both frontends:
   `apps/web/app/{pages,components,composables,stores,layouts,assets}`,
   `apps/web/app/app.config.ts`, and `apps/web/app/app.vue`, with
   `apps/web/server/`, `apps/web/shared/`, and `apps/web/public/` at the app
   root; the same layout for `apps/admin`. `docs/architecture.md`,
   `Project-Technologies.txt`, and the tasks template are corrected to match.
4. The constitution moves to **3.3.0** (MINOR): the frontend paths and the two
   exception notes are normative. `version.json` records this ADR, and the
   footer date becomes 2026-10-21.
5. R1's plan records `packages/ui` and the `app/` paths in its Ownership Map and
   Gate IX. The R1 specification remains product-level. No numbered UI
   Foundation feature is created (ADR-007).
6. The live range moves to `ADR-001 … ADR-098` because ADR-098 is accepted in
   the same change; the index ends at ADR-098.

**What deliberately did not change.** No principle, product scope item, page,
role, entity, product feature, usage limit, security rule, approved technology,
component library, or visual value changed by this record. No application code,
package, CSS, or app directory was created by this record. The icon set,
typeface, default appearance, and palette are ADR-098; this record fixes only
the layer path and the layout.

**Alternatives considered.**

- *Keep the Nuxt 3-style paths and set `srcDir: '.'`.* Rejected: Nuxt 4 defaults
  to `app/`, no application code exists, and adopting the default now is the
  cheapest point to correct the register; `srcDir: '.'` would preserve a
  compatibility layer that every later task must remember.
- *Use two layers, one per app.* Rejected: it duplicates tokens, icons, fonts,
  and primitives and recreates the drift the one-layer rule exists to prevent.
- *Keep app-local design-system components.* Rejected: it makes each app a
  second design system and contradicts Principle IX.
- *Add `packages/ui` as a constitution topology row.* Rejected: ADR-093's
  decision stands; the constitution names the layer, not its directory, and the
  architecture and this record fix the path.
- *Defer both decisions to R1's plan.* Rejected: the R1 plan cannot start while
  the constitution, architecture, and tasks template disagree with the Nuxt 4
  layout; the pre-R1 gap would block the first slice.

**Consequences and migration/backfill.** The constitution is 3.3.0 with the
Nuxt 4 frontend paths and the two layer-exception notes. `version.json`,
`docs/architecture.md`, `Project-Technologies.txt`, the plan and tasks
templates, `AGENTS.md`, `README.md`, `ROADMAP.md`, the R1 checklist, and the
specification's live range string move in the same change. The drift check must
report clean at 3.3.0 / ADR-098. The pre-R1 foundation scaffolds the layer;
R1's plan records it and builds the shell; this record creates no code. Review
date: 2026-11-20. This
entry is the durable record.

---

## ADR-098 — The Wafar visual foundation: IconPark, IBM Plex Sans Arabic, light default, and the marine palette

**Status**: Accepted — 2026-10-21
**Owning directory**: `docs/`, `.specify/templates/overrides/`, `Project-Technologies.txt`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `specs/001-identity-foundation/`, `packages/ui` (planned by the pre-R1 foundation; R1 consumes it)
**Owning feature**: R1 (the shell and the first icon/typeface/theme consumer); none — visual foundation ratified by the repository owner.

**Context.** The constitution leaves the icon set as an open register gap and
delegates the typeface, default appearance, and visual direction to the Wafar UI
layer. The operator required icons that are colored, beautiful, official, free,
global, open source, strong, and not temporary. The audit compared the active
options. Phosphor Duotone was rejected by the operator after its preview read
gray/2D: the duotone is opacity-based, not true color. Fluent Color is active,
MIT, and official, but has 890 icons and is missing core UI icons (search, cart,
filter, upload, download, delete, menu, chevron, folder, and close), so the main
navigation would be partly monochrome. Streamline Color is active and true
color, but its 2,000 icons are CC BY 4.0, outside the constitution's permissive
list, and would need an exception and attribution. IconPark is the only
complete, true-multicolour, permissive, general-UI set (2,658 colour + 2,658
outline, Apache-2.0, ByteDance), but its upstream repository is archived. The
operator approved IconPark on 2026-10-21 on the condition that the set is
vendored and owned inside the repository. The same approval fixed IBM Plex Sans
Arabic, the light default, and the marine/sand palette.

**Decision.**

1. The icon set is IconPark (multicolor) plus IconPark Outline from the same
   family, Apache-2.0, 2,658 icons each. It is installed through
   `@iconify-json/icon-park` and `@iconify-json/icon-park-outline`, **vendored**
   under `packages/ui/vendor` with the Apache-2.0 licence and NOTICE, pinned by
   SHA-256 and source commit, and loaded locally. No runtime Iconify API and no
   dependency on the archived upstream at build or runtime. The project owns the
   copy; a future missing icon is added by ADR. The CMV row 11 records the set.
2. `WfIcon` is the only icon surface. It uses the colour set by default and the
   outline set for dense tables, micro-icons, and the dark theme where colour
   contrast is weak. The Nuxt UI internal icon keys map to IconPark Outline; no
   second icon family, no direct `i-*` classes in app code, and no emoji.
3. The typeface is IBM Plex Sans Arabic, OFL, self-hosted WOFF2 at weights
   400/500/600/700 with `font-display: swap`, Arabic and Latin subsets, and
   `Noto Sans Arabic` / `Segoe UI` / `Tahoma` fallbacks. No Google Fonts CDN.
   Latin numerals are used for all rendered numbers.
4. The default appearance is light; dark mode remains available through the
   color-mode module with no flash, an accessible toggle, and the dark palette.
5. The visual direction is a deep marine/petrol primary, a warm sand neutral,
   the IconPark blue/cyan accent, and semantic success/warning/error/info
   colours. Tokens are the only raw values; contrast targets WCAG AA; the dark
   theme uses the navy surface set. The palette harmonizes with IconPark's
   blue/cyan palette.
6. The icon set, typeface, default appearance, and palette are Wafar UI layer
   values, not constitutional text; no constitution amendment is made by this
   record. The licence and vulnerability scan, the vendoring, and the icon
   checks are recorded in the plan's Complexity Tracking and executed by R1.

**What deliberately did not change.** No component library, Nuxt UI Pro, second
icon family, product scope, page, role, entity, product feature, usage limit,
security rule, or constitution version changed by this record; ADR-097 moves the
constitution to 3.3.0. The constitution's icon-set register gap remains the
requirement; the R1 plan fills CMV row 11. No application code, package, CSS, or
font file was created by this record.

**Alternatives considered.**

- *Phosphor Duotone.* Rejected by the operator: the preview reads gray/2D
  because the duotone is opacity-based, not true color, although the set is
  active, MIT, and complete.
- *Fluent Color.* Rejected as the primary: active, MIT, and official, but 890
  icons and missing search/cart/filter/upload/download/delete/menu/chevron/
  folder/close; the main navigation would be partly monochrome.
- *Streamline Color.* Rejected: 2,000 true-colour icons but CC BY 4.0, outside
  the constitution's permissive list; it would need an ADR exception and an
  attribution page.
- *Lucide / Tabler / Heroicons / Material Symbols.* Rejected: active, permissive,
  and complete, but monochrome; the operator requires colour.
- *IconPark without vendoring.* Rejected: the upstream is archived; vendoring
  makes the copy permanent and removes the availability risk.
- *A second icon family for the missing pieces.* Rejected: the one-family rule;
  the outline theme supplies the monochrome and dense contexts.

**Consequences and migration/backfill.** The Wafar UI layer later owns the
vendored IconPark JSON, the IBM Plex Sans Arabic font files, the tokens, the
theme, and `WfIcon`. The R1 plan fills CMV row 11, the Ownership Map, Gate IX,
and the Complexity Tracking rows; the icon check verifies every semantic key and
the Nuxt UI mapping. The archive is a maintenance limitation, not an
availability risk: the vendored copy and the Apache-2.0 licence are perpetual.
Review date: 2026-11-20. This entry is the durable record.

---

## ADR-099 — Shared-shell header and the account menu

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `Core-Project.txt`, `specs/001-identity-foundation/`, `governance-drift-check.mjs`, `.githooks/`
**Owning feature**: none — product correction ratified by the repository owner; R1 builds the frame.

**Context.** ADR-017 fixed the shell's composition: a header carrying the
account, notifications, theme-toggle, and sidebar-collapse controls, and a
sidebar whose header carries the platform logo. ADR-094 kept that composition
for a guest and only narrowed the login action to the account and notifications
controls. The operator has since decided the header's real role: it is a brand
and account band, not a control strip. Page navigation already lives in the
sidebar, which carries the eight registered destinations, and the appearance
and the sidebar's own state belong to the sidebar rather than to the header.
Keeping the 2026-10-03 composition would leave the header carrying a
notification bell whose list is a sidebar destination, a theme switch beside the
navigation it belongs to, and a collapse control physically separated from the
thing it collapses.

**Decision.**

1. The header carries only the platform's logo/home control at the inline-start
   edge and the account control at the inline-end edge. It carries no
   page-navigation link, no notifications control, no theme switch, and no
   sidebar-collapse control.
2. The account control opens a menu with three items: «حسابي», which opens the
   Profile page; «إعدادات», which opens the settings section inside the Profile
   page; and «تسجيل الخروج», which shows a yes-or-no confirmation before the
   session ends.
3. A guest sees a sign-in action in place of the account control only; the guest
   has no account menu. The appearance and the sidebar remain available to the
   guest, through the sidebar's own controls.
4. The sidebar carries the eight registered navigation items unchanged, plus the
   theme switch and the sidebar-collapse control. It is full on a wide screen,
   an icon-only rail when collapsed (no names), and a drawer on a narrow screen.
   Its position is stated logically (`inline-start`, the right edge under the RTL
   direction); no physical right or left is written, per Principle V.
5. «إعدادات» is a section inside the Profile page. No page is added and the
   Product Register stays at twenty-six pages. «حسابي» and «إعدادات» point at the
   Profile route already fixed among the eight sidebar destinations, with the
   settings section identified by an anchor; «تسجيل الخروج» adds no route.
6. R1 builds the frame's composition and verifies it structurally, including the
   menu's three items and the confirmation markup, because R1 ships no page that
   renders the frame. The runtime behaviour of the header, the menu, and the
   sidebar lands with R4 (My Files), the first page that carries the frame; the
   menu's destinations land with R7 (Profile).
7. The notification counter moves from the header to the Notifications sidebar
   item (or to its page). No header bell is built.
8. The administrator application keeps its own shell and header; this record does
   not change it.

**What deliberately did not change.** The three surfaces (public site, merchant
area, administrator application); the bare scope (authentication, 404, and the
four static pages); the eight sidebar items and their routes; the footer band and
the four static routes; the twenty-six-page Product Register; every entity,
role, product feature, usage limit, and security rule; the technology register;
the Wafar UI layer path and the visual foundation (ADR-097, ADR-098). No
application code, package, CSS, or font file is created by this record.

**Alternatives considered.**

- *Keep the 2026-10-03 header composition.* Rejected: the operator's product
  decision fixes the header as a brand-and-account band; the notification bell
  duplicates a sidebar destination, and the theme and collapse controls belong
  with the sidebar they act on.
- *Put the account menu in the sidebar.* Rejected: the account belongs to the
  person, not to navigation, and a role-varying sidebar would break the rule that
  the item list is identical for a guest and a signed-in merchant.
- *A standalone merchant Settings page.* Rejected: it would add a page and force
  a Product Register amendment (26 → 27); the Profile page already owns account
  editing and the password change.
- *Write "the sidebar on the right" and "the account on the left".* Rejected:
  Principle V prohibits physical direction; `inline-start` and `inline-end` are
  the binding forms, and the RTL direction resolves them to the right and left
  edges respectively.

**Consequences and migration/backfill.** The constitution moves to **3.4.0**
(MINOR): the shell's header and sidebar composition changes, so this is not a
PATCH. `version.json`, the ADR ranges, `Project-Technologies.txt`'s header, the
R1 specification (FR-020, FR-022 … FR-025, FR-039, FR-047, AC-022, AC-024,
AC-025, AC-027, AC-042, AC-051), the R1 checklist, and the ROADMAP's shell and
notification rows move in the same change. ADR-016, ADR-017, and ADR-094 carry
annotations; their decisions are not rewritten. Review date: 2026-11-20. This
entry is the durable record.

**Annotation (2026-10-21, `/speckit.clarify`).** The clarification session
recorded the two landing points: «حسابي» opens the Profile page at its top, where
the account's identity and status are shown, and «إعدادات» opens that page's
settings section, where the account details are edited and the password is
changed; the two items therefore differ in the section they reach, and they
share the one Profile route the frame's decision record fixes. Decision 5 is
read with that distinction, and ADR-100 records the clarification session's
answers. No other provision of this record changes.

**Annotation (2026-10-21, ADR-102).** Two provisions of this record are
superseded, and neither is rewritten:

1. **Decision 1's header composition.** The header now carries the
   notifications control and the theme switch beside it, in addition to the
   logo/home control and the account control. The header still carries no
   page-navigation link and no sidebar-collapse control, and the account
   control keeps the inline-end edge.
2. **Decision 7's counter.** Decision 7 reads: "The notification counter moves
   from the header to the Notifications sidebar item (or its page). No header
   bell is built." The notifications control returns to the header and carries
   the unread count, and the Notifications sidebar item carries no count, so the
   count has one surface. The decision no longer stands.

Decision 4's placement of the theme switch in the sidebar is likewise
superseded: the switch is in the header, and the sidebar keeps the navigation
item list and the sidebar-collapse control. Decisions 2, 3, 5, 6, and 8 — the
account menu's three items, the guest's sign-in action, «إعدادات» as a section
of the Profile page, the sidebar's widths and position, the administrator
application's own shell, and the counter's not being built here — are unchanged.

---

## ADR-100 — The account menu's destinations and the frame's boundaries

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `Core-Project.txt`, `docs/`, `ROADMAP.md`, `AGENTS.md`, `README.md`, `Project-Technologies.txt`, `specs/001-identity-foundation/`, `governance-drift-check.mjs`, `.githooks/`
**Owning feature**: none — product clarification ratified by the repository owner; R1 binds the rules, and R4, R7, and R13 deliver them.

**Context.** ADR-099 fixed the shared shell's header and the account menu, and
left five points the R1 specification could not answer by itself: what the two
account items open, where the action that ends every session of an account at
once is offered, what a guest sees when they press a sidebar item that names a
merchant-area destination, what a merchant sees when their session ends or their
account is blocked, and what the administrator application's own header carries.
A clarification session on 2026-10-21 answered all five. Two of the answers
name a fact the register did not carry: the Profile page's content, and the
administrator application's header.

**Decision.**

1. «حسابي» opens the Profile page at its top, where the account's identity and
   status are shown. «إعدادات» opens the settings section of that same page,
   where the account details are edited, the password is changed, and the
   action that ends every session of the account at once is offered. Both items
   share the one Profile route the frame's decision record fixes, and the
   settings section is identified by an anchor. No page and no entity is added.
2. The Profile page's content in the Product Scope now carries the action that
   ends every session at once, and the `Core-Project.txt` mirror carries it
   beside the account details and the password change. The constitution moves to
   **3.5.0** (MINOR): a page's content changed, so this is not a PATCH.
3. The account menu keeps its three items. The action that ends every session
   is offered in the Profile page's settings section, delivered by R7.
4. A guest who activates a sidebar item that names a merchant-area destination —
   My Files, Cart, Notifications, Messages, or Profile — is taken to the
   sign-in page, because the register gives a guest no cart, no upload, no
   message, and no merchant area. The item stays present and enabled, because
   the list is not varied by role. The three items that name a public
   destination — Home, Parts, and Catalog — open their own pages. No page, route,
   or stored state is added; whether the merchant returns to the wanted item
   after signing in belongs to the slice that ships the merchant area's pages.
5. A request refused because the session ended or the account was blocked shows
   an explicit state inside the frame, stating that the session has ended and
   offering the way to sign in again, and saying plainly that the account is
   blocked when that is the reason. No unrelated error is shown, and the frame
   stops sending requests for a session that no longer exists. The state is
   shown only to a person who held a valid session, so it is outside the
   enumeration comparison SC-004 bounds.
6. The administrator application keeps its own shell, and its header carries the
   platform's logo at the inline-start edge and an account control whose menu
   offers «تسجيل الخروج» only, because the administrator application has no
   Profile page and no merchant settings page. R13 builds and verifies it.

**What deliberately did not change.** No page was added, no entity was added, no
role changed, no usage limit changed, no security rule changed, and the
technology register is untouched. ADR-099's composition stands, including the
three account-menu items, the sidebar's eight items, and the bare scope. No
application code, package, CSS, or font file was created by this record.

**Alternatives considered.**

- *A standalone merchant Settings page.* Rejected: it would add a page and force
  a Product Register amendment; the Profile page's settings section carries the
  same actions.
- *A fourth account-menu item for signing out everywhere.* Rejected: the action
  belongs with the other account actions, and the menu keeps three items.
- *A settings view for appearance and notification preferences.* Rejected: no
  such preference is registered, and inventing one would extend the product.
- *Showing a guest a merchant-only section in guest form.* Rejected: the
  register gives a guest no cart, no upload, no message, and no merchant area.
- *Redirecting a guest to sign-in and back afterwards.* Deferred to the slice
  that ships the merchant area's pages, because R1 ships no page a guest could
  return to.
- *A generic error page when the session ends.* Rejected: it tells the merchant
  nothing about what to do next.

**Consequences and migration/backfill.** The constitution moves to **3.5.0**;
`version.json`, the ADR ranges, `Project-Technologies.txt`'s header, the drift
check's citation lists, and the R1 specification (FR-047, FR-048, FR-049,
FR-050, AC-051 … AC-054) move in the same change. The R1 checklist's counts move
to 50 FR and 54 AC. ADR-099 carries an annotation for the refinement of its
decision 5. R4 verifies the frame's runtime behaviour, R7 delivers the Profile
page's settings section, and R13 delivers the administrator application's header.
Review date: 2026-11-20. This entry is the durable record.

---

## ADR-101 — The account menu's behaviour and the appearance's ownership

**Status**: Accepted — 2026-10-21
**Owning directory**: `specs/001-identity-foundation/`, `docs/`, `ROADMAP.md`, `AGENTS.md`, `README.md`, `Project-Technologies.txt`, `governance-drift-check.mjs`, `.githooks/`
**Owning feature**: none — product clarification ratified by the repository owner; R1 binds the rules, and R4 and R7 deliver them.

**Context.** A second clarification session on 2026-10-21, after ADR-099 and
ADR-100, settled five points the R1 specification still left open: whether the
background and its colour are a product setting, what closes the account menu,
what «حسابي» shows, what the merchant sees after confirming the sign-out, and
what the account control's accessible name is. None of them changes a page, an
entity, a role, or a limit; each one removes a phrase a test could not assert.

**Decision.**

1. The appearance's surfaces, backgrounds, and colours are Wafar UI layer
   values, not a product setting. Neither a merchant nor the administrator
   chooses a background or a colour, and no such preference is stored on the
   account or in the platform's settings. The Wafar UI layer records the values
   and this slice's plan carries them; no requirement, entity, or slice is
   added.
2. The account menu closes without action when the person presses Escape,
   activates something outside it, or moves the focus out of it, and the focus
   returns to the account control in every case.
3. «حسابي» shows the account's full name, its city, and its status — active or
   blocked — and no other account field. The mobile number and the editable
   account details belong to the settings section, so the item that opens the
   page shows a summary and the item that opens the settings section shows and
   changes the details.
4. After the merchant confirms the sign-out in the account menu, the same
   ended-session state FR-049 requires when a request is refused is shown in
   the page they were on, so both ways a session ends lead to one outcome.
5. The account control's accessible name is «حسابي», and the header shows the
   icon alone with no merchant name in it; the merchant's name is available
   inside the account menu's «حسابي» item.

**What deliberately did not change.** No page, entity, role, product feature,
usage limit, security rule, technology, or constitution version changed by this
record; the constitution stays at 3.5.0. ADR-099's composition and ADR-100's
answers stand, and this record only completes them. No application code,
package, CSS, or font file was created.

**Alternatives considered.**

- *A background or colour a merchant or an administrator chooses.* Rejected: it
  would add a preference, an entity, and a slice, while the appearance's values
  already belong to the Wafar UI layer (ADR-098).
- *Closing the menu with Escape alone.* Rejected: it leaves the pointer path
  undefined and the menu open by accident.
- *Showing the mobile number and the session list in «حسابي».* Rejected: the
  number is the identifier and belongs with the editable details, and the
  sessions list belongs with the action that ends them.
- *A dedicated signed-out page after the sign-out.* Rejected: the ended-session
  state the frame already shows keeps the merchant in place and tells them what
  to do next.

**Consequences and migration/backfill.** The R1 specification's FR-023, FR-025,
FR-047, FR-049, AC-022, AC-025, AC-051, and AC-053 carry the rules, and the ADR
ranges move to ADR-101 in the same change. The requirement and criterion counts
are unchanged at 50 FR and 54 AC. R4 verifies the menu's behaviour at runtime,
and R7 delivers the Profile page's summary and settings section. Review date:
2026-11-20. This entry is the durable record.

---

## ADR-102 — The header's theme switch and the notifications bell

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `.specify/templates/overrides/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `Project-Technologies.txt`, `Core-Project.txt`, `specs/001-identity-foundation/`, `governance-drift-check.mjs`, `.githooks/`
**Owning feature**: none — product correction ratified by the repository owner; R1 builds the frame.

**Context.** ADR-099 (2026-10-21) made the header a brand-and-account band: the
platform's logo/home control at its inline-start edge and the account control at
its inline-end edge, with the theme switch and the sidebar-collapse control in
the sidebar and no notifications control in the header at all — the unread count
moved to the Notifications sidebar item, and the header bell was not built. The
operator has now decided the header carries the appearance control again, beside
a notifications control, drawn with the crescent glyph of the registered icon
set.

Three sources already pointed at that arrangement, and ADR-099 moved past them:

- **ADR-006** (2026-10-01) decided that "the mode toggle sits in the header,
  adjacent to the notifications icon". That placement was never annotated after
  ADR-099 moved the toggle into the sidebar, so the record still reads as the
  header's rule.
- **`Core-Project.txt`** states that the notifications "تظهر في أيقونة الجرس مع
  عداد" — a bell with a counter — while its header section says the header
  carries no notifications icon.
- **`docs/domain-model.md`** states that "the count in the header is the number
  of the user's unread notifications". ADR-099 did not amend that file, so the
  invariant it states was left naming a header count that the header no longer
  carried.

The default appearance is a separate question and is unchanged: ADR-098 fixed
light as the Wafar UI layer's default, and ADR-006's "dark mode by default" was
never annotated as superseded by it. ADR-102 closes that gap as well.

**Decision.**

1. The header carries four controls. At its inline-start edge sits the
   platform's logo/home control. At its inline-end edge, reading from
   inline-start to inline-end, sit the notifications control, the theme switch,
   and the account control — so the theme switch is immediately beside the
   notifications control, and the account control keeps the inline-end edge.
   The header carries no page-navigation link.
2. The theme switch leaves the sidebar. The sidebar carries the platform's
   navigation item list and the sidebar-collapse control, and nothing else
   changes about it — its position at the inline-start edge, its full and
   icon-rail and drawer widths, and the collapse control's behaviour all stand.
3. The notifications control returns to the header and carries the unread count.
   The Notifications sidebar item carries no count, so the count has one source
   and one surface. This reverses ADR-099's seventh decision.
4. The theme switch's icon is the crescent moon of the registered IconPark set,
   drawn through `WfIcon` alone: `icon-park:moon` in the colour set and
   `icon-park-outline:moon` in the outline set. Which of the two the Wafar UI
   layer uses follows ADR-098's rule; there is no emoji and no second icon
   family. The switch's current state is carried by its accessible name and its
   pressed state, not by a second glyph.
5. The default appearance is unchanged: light (ADR-098), remembered in the
   browser the person is using, per device, applied before the page is painted
   so the other appearance never flashes, and never stored on the account.
   ADR-006's dark default is not restored.
6. A guest sees the sign-in action in place of the account control and the
   notifications control — ADR-094's rule, which reads correctly again now that
   the header carries a notifications control — and keeps the theme switch,
   which now sits in the header.
7. R1 builds the header's composition, including the notifications control as a
   link to the route R1's own decision record already fixes for the
   Notifications destination; no route is added. The unread count and the
   Notifications page arrive with R9, which also adds the counter component to
   the Wafar UI layer. No page, route, entity, role, product feature, or usage
   limit is added, and the Product Register stays at twenty-six pages.

**What deliberately did not change.** The three surfaces — the public site, the
merchant area, and the administrator's separate application — and the bare
scope; the administrator application's own shell and header; the sidebar's item
list, its eight destinations, and the collapse control; the account menu's three
items and the sign-out confirmation; the appearance's ownership, which remains
the Wafar UI layer's and not a product setting (ADR-101); the default
appearance's being light (ADR-098); the icon set, the typeface, and the palette
as Wafar UI layer values (ADR-098); the twenty-six pages, the twelve entities,
the three roles, the sixteen product features, and every usage limit; every
technology in the register. No application code, package, CSS, or font file is
created by this record.

**Bookkeeping corrected in the same change.** Three statements had drifted from
the record, and the files that carry them are in this record's owning set.
`AGENTS.md` §6 counted twenty-three decision records without an
`Alternatives considered` section where the true count is twenty-four: ADR-092,
recorded after ADR-090, is the twenty-fourth, and ADR-090 now carries the
annotation that says so. The same section named the pre-R1 foundation as `W1`,
an identifier no file defines and no decision record introduces; it now cites
ADR-097 and ADR-098, the way the roadmap names the foundation. `ROADMAP.md`'s R1 row moves to
`in-progress` with `specs/001-identity-foundation/` in its `Sub-spec` column,
because that sub-spec exists and opens with the required `**Input**:` line; no
other slice row changes.

One promise the drift check made was also unkept: its reference pass resolved
`ADR-NNN` over a fixed list of fifteen files, although `AGENTS.md` §5 and
`README.md` both state that every reference is resolved. The feature
specifications were outside that list. The pass now runs over the same file set
as the range pass, which ADR-096 had already extended to `specs/`, so a
specification's reference is resolved instead of passing unseen. No verdict
changed: every reference the wider pass reaches already resolved.

**Alternatives considered.**

- *Keep the switch in the sidebar and add the bell to the header.* Rejected: two
  controls for one appearance, and the sidebar is the navigation's home, not the
  appearance's.
- *Restore ADR-006's dark default together with the header switch.* Rejected:
  ADR-098 fixed light and the operator did not revisit it; the placement is
  restored, the default is not.
- *Give the header a bell without a count and leave the count on the sidebar
  item.* Rejected: one number shown on two surfaces invites a disagreement
  between them, and the count belongs on the bell the product mirror already
  names.
- *Show the guest an empty bell.* Rejected: a guest has no notifications, and
  ADR-094 already fixes the sign-in action in place of the account and
  notifications controls.
- *Swap the glyph between a moon and a sun to show the current appearance.*
  Rejected: the control's meaning then depends on a second glyph and on the
  direction of the swap; the crescent marks the control and the accessible name
  and the pressed state carry the state.

**Consequences and migration/backfill.** The constitution moves to **3.6.0**
(MINOR): the shared shell's header composition changes, so this is not a PATCH.
Both places the constitution states that composition — the Product Scope
shell paragraph and the Product Fact Clarifications bullet — move together, so
the document states one rule once. `version.json`, the live ADR ranges, `Project-Technologies.txt`'s header ADR
list, the R1 specification (FR-020, FR-023, FR-025, FR-039, AC-022, AC-025,
AC-027, AC-042, and the clarifications they carry), the R1 checklist,
`Core-Project.txt`'s header, sidebar, and Notifications sections,
`docs/domain-model.md`'s
Notification invariant, the ROADMAP's R1, R9, and first-obligations rows, the
drift check's own citation list, and the pre-commit hook's citation line move
in the same change. ADR-006, ADR-016, ADR-017, ADR-090, ADR-094, and ADR-099
carry annotations; their decisions are not rewritten. The drift check's
reference pass now runs over the same file set as its range pass, so an
`ADR-NNN` reference in a feature specification or in one of the two Arabic
mirrors is resolved instead of passing unseen; `AGENTS.md` §5 states that every
reference is checked, and the file set it named was the narrower one. Review
date: 2026-11-20. This entry is the durable record.

---

## ADR-103 — The amendment procedure's version sources, and the index column the check verifies

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `docs/`, `AGENTS.md`, `README.md`, `ROADMAP.md`, `governance-drift-check.mjs`
**Owning feature**: none — governance record ratified by the repository owner; the check it adds is wired into the committed `pre-commit` hook and into R1's continuous integration.

**Context.** A review of the constitution's amendment procedure found two defects
in the same clause. The clause opens "On every amendment the version lives in
exactly two places" and then lists three numbered sources, the third being the
ADR index row and the ADR the amendment records. The count and the list
contradicted each other, and the sentence that follows the list — "reads the
version from one of the two sources above" — pointed at two again. The second
defect sat behind the first: the ADR index's `Constitution version` column
records the version each ADR produced, so the version was in fact written in a
third place, and the drift check compared the constitution's footer with
`.specify/memory/version.json` without ever looking at that column. A version
that moved in the footer while the index column stayed behind was therefore
invisible to the check, and the column could claim a version the constitution
never reached.

**Decision.**

1. The amendment procedure's clause is corrected: the version lives in exactly
   **three** places, and the list says so. The three are the constitution's
   version footer, `.specify/memory/version.json`, and the ADR index row with
   the ADR the amendment records. The ADR index row's constitution-version
   column names the version that ADR produced, and the clause now says so
   explicitly.
2. The sentence that follows the list is corrected with it: a document names
   the constitution and reads the version from one of the **two version
   sources** — the footer and `version.json` — which is what it meant, since
   the third source is the durable record of the amendment rather than a
   source a document reads its version from.
3. The drift check gains a check **J**, which verifies that the ADR index's
   constitution-version column agrees with the footer's version: no cell may
   claim a version the constitution never reached; the column may never move
   backwards down the table, because an ADR ratified later cannot claim a
   version older than the one before it; and the last index row must name the
   footer's version. A cell that is neither a version nor the em dash the
   bootstrap-era records use is a defect.
4. This record is a **governance record**, not a technical decision: its
   subject is the constitution's own text and the governance tooling, which is
   outside the reach of the `Alternatives considered` field (ADR-090), so that
   section is not written for it.
5. The constitution moves to **3.6.1** (PATCH): the clause is a correction of a
   count and a wording, and no principle, section, register, or rule changes
   meaning, so this is not a MINOR. `version.json` moves with it.

**What deliberately did not change.** The amendment procedure's substance: the
requirement that an amendment be explicitly ratified, bump the version, and
record itself durably; the stamp sites; the precedence rule; the exception
register; the review trigger; every principle, binding section, register, page,
feature, entity, role, and usage limit; the technology register; and every
decision record already ratified. The drift check's existing checks A through
I are untouched, and the check remains read-only and dependency-free.

**Consequences and migration/backfill.** `version.json` moves to 3.6.1 and
names this record as the one that moved it. The live `ADR-001 … ADR-102` range
strings become `ADR-001 … ADR-103` in the same change, because the range
string's authority is the index's last row. The drift check's own header, its
report line, and the constitution's `References` row for the check are updated
to name ADR-103 and check J, and `AGENTS.md` §5 and `README.md` state the new
coverage, because those documents enumerate what the check verifies and a
description that omits a check is a description that drifts. No migration or
backfill is required: a PATCH carries no schema, and the column the check reads
was already populated for every index row.

**Follow-ups.** The check reports the column's state but does not write it, so
the column stays a record a human maintains at the moment an ADR is written;
the next amendment that touches a version column should confirm the column
remains the only place the version is written outside the two sources.
Review date: 2026-11-20. This entry is the durable record.

---

## ADR-104 — The audit fix set: the governance wording, the mirror corrections, and the R1 concentration

**Status**: Accepted — 2026-10-21
**Owning directory**: `.specify/memory/`, `docs/`, `AGENTS.md`, `ROADMAP.md`, `Core-Project.txt`, `docs/CHANGELOG-mirror.md`, `specs/001-identity-foundation/`
**Owning feature**: none — governance record ratified by the repository owner; the corrections below are carried by the documents that own them.

**Context.** A deep review of the constitution, the two Arabic mirrors, the
architecture and domain-model documents, the roadmap, and the R1 specification
found the governance set sound in substance and a set of defects in wording,
placement, and internal consistency. The review found no leak of a reserved
fact, no breach of the specification's technology-agnosticism beyond two
residuals, and no defect in the drift check's coverage of the version sources.
The defects it did find fell into three groups: a sentence in the constitution's
Governance section that named the binding sections as if they were the
procedure they share; three documents that carried a claim the register had
already superseded or had never stated; and two roadmap gaps that the slice
order left open between a slice and the slice that owns the half of the work it
triggers. A fourth group was a structural mis-grouping in the R1
specification's acceptance criteria, and a fifth was a concentration of duties
in R1 that the roadmap described in two ways at once.

**Decision.**

1. **The Governance paragraph is reworded, not changed.** The paragraph that
   says every principle and every MUST in the sections above is binding with
   the same force and is "resolved, reviewed, and excepted by exactly the same
   procedure: Query Safety and Secrets, Schema and Migration Control, …" read
   as if those section names were the procedure. They are not: they are the
   sections the procedure applies to. The paragraph now says that the
   procedure is the one every binding section shares and is named in that
   paragraph rather than restated by each section, and it then names the
   sections and the ten principles. No principle, section, register, page,
   feature, entity, role, or usage limit changes, and the binding set is
   identical before and after.
2. **`AGENTS.md` §3 names the section the constitution actually has.** The
   reading protocol for `/speckit.specify` named "Usage Limits" as a section.
   The constitution's Usage Limits is a table inside Performance Budgets and
   Verification, and the constitution's own reading protocol names it the same
   way. The agent instruction file now names the table and the section it
   lives in, so the two protocols agree on what a reader opens.
3. **The product mirror's soft-deletion note no longer reads as if a block
   deleted a user's rows.** `Core-Project.txt` recorded that "deletion is soft
   for files and users" and that blocking a merchant does not delete their
   public files. Read together, the two clauses could be taken to say that a
   block removes a user's rows, which the register forbids: blocking withdraws
   access and removes nothing. The note now says so explicitly, and the
   sentence that tied the mirror's note to the register is preserved.
4. **The product mirror's admin-application page table says why its numbering
   restarts.** The mirror numbers the platform's twenty-six pages 1 to 26 and
   then numbers the administrator application's ten pages 1 to 10, which reads
   as a contradiction in a single document. The administrator table now
   carries a note that the first numbering counts the platform's pages and the
   second counts the administrator application's own, and that the register is
   the authority for the total.
5. **The mirror changelog's dead references are marked as historical.** The
   changelog's 2026-10-03 block names the constitution's "Design System
   Standards" section and the file `wafar.single.css`, both removed by ADR-093.
   The changelog is history, but a reference to a section that no longer exists
   reads as a live pointer, so each affected row now carries the section's
   name as it stood on 2026-10-03 and the record that removed it.
6. **The domain model distinguishes a schema decision from a registered
   product fact.** Two of its unresolved facts — how a message's sender is
   represented, and whether a conversation carries an administrator reference
   — were described beside the others as facts the constitution's register owns.
   They are not: the concepts are already fixed by the register, and only their
   representation is open, so the answer changes no product fact and requires no
   register amendment. The document now says so, names the rows that are
   registered facts instead, and states the consequence for R10 — an ADR and a
   change to the domain model, and a register amendment only if the answer
   turns out to need a product fact the register does not carry.
7. **R1's concentration is declared, with a remedy, instead of being
   restructured.** The roadmap's "First obligations" table assigns R1 more than
   half its rows, because the constitution names a duty by the milestone that
   first triggers it and R1 triggers most of them at once. Moving a duty would
   break the milestone the constitution names, and creating a slice for the
   remainder would be the classification error ADR-007 prohibits — the
   foundation is project-level work, not a feature. The roadmap now records the
   concentration as a declared risk with its procedural mitigation — R1's plan
   sequences the foundation in a foundation phase, records the concentration in
   its Complexity Tracking table, and carries a review date of 2026-10-21 — and
   states that the pre-R1 foundation named in R1's row is that phase, not a
   numbered slice and not a second feature. The remedy if the slice cannot be
   sequenced into reviewable increments is a decision recorded as an ADR.
8. **Two roadmap gaps are recorded as defects with the slice that closes
   them.** The Parts table renders the cart control while the cart action and
   the `bookmarks` module are R8's, so the window between the two slices is
   now defect 17; and the catalog-delete cascade's bookmark leg belongs to a
   module that does not exist when the routine is written, so the two halves of
   one rule live in two slices, now defect 18. R5's and R8's rows name the
   defects they carry.
9. **The R1 specification's acceptance criteria are grouped by the user story
   they actually serve.** Four criteria — the account menu, the guest's
   redirection, the ended-session state, and the administrator application's
   header — sat under the user story that resists automated abuse, because
   three later clarification sessions appended them to the end of the
   specification's last section. They are frame criteria and administrator
   criteria, and they now sit under the stories they serve; the ordinals were
   renumbered in document order, the seven "Acceptance Scenarios" lines were
   rewritten from the actual grouping, and no identifier was renumbered,
   reused, or withdrawn. The specification also states that its requirements
   are grouped by subject rather than by identifier, so a reader does not
   mistake the order for a numbering, and it now describes the session's
   browser-held reference in terms that match the constitution's rule that a
   session is never recoverable from browser storage.
10. **This record is a governance record**, not a technical decision: its
    subject is the constitution's own text, the mirrors, and the process, which
    is outside the reach of the `Alternatives considered` field (ADR-090), so
    that section is not written for it.
11. The constitution moves to **3.6.2** (PATCH): the Governance paragraph is
    reworded, and no rule changes meaning, so this is not a MINOR.
    `version.json` moves with it.

**What deliberately did not change.** Every principle and binding section; every
register — the pages, the features, the entities, the roles, the usage limits,
the product features, and the unresolved product facts; the product scope; the
technology register and its gaps; the Wafar UI layer's path and visual
foundation; the slice count, the slice order, and the slice identifiers; the
exception register; the amendment procedure and the versioning policy as
amended by ADR-103; the drift check's checks A through I; and every decision
record already ratified. **No slice is added, removed, renumbered, or
reordered**, and no product behaviour changes: the corrections are to wording,
to placement, and to the record of a gap.

**Consequences and migration/backfill.** `version.json` moves to 3.6.2 and names
this record as the one that moved it. The live `ADR-001 … ADR-103` range strings
become `ADR-001 … ADR-104` in the same change, because the range string's
authority is the index's last row, and the drift check verifies them. The
specification's corrections carry no identifier change, so no task, criterion,
or requirement reference outside the specification is affected. No migration or
backfill is required: a PATCH carries no schema, and every correction above is
to a document's wording or to a document's own placement.

**Follow-ups.** Two items from the same review were checked and found already
correct, and are recorded here so a later reader does not re-open them: the
technology mirror's PgDog row already binds the AGPL-3.0 licence to the
constitution's licence treatment for infrastructure services, with its fallback
and its review date, and the R1 specification's identifier set was already
contiguous and free of dangling references. The review's one remaining
structural observation — that R1's own specification is a large artifact — is
recorded in that specification's checklist rather than here, because the
constitution's own rules govern it and no rule is broken by its size.
Review date: 2026-11-20. This entry is the durable record.

---

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
