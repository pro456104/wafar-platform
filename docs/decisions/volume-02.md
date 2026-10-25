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

**Annotation (2026-10-24, ADR-120).** The price column now carries one amount
or two, each with the supplier's printed label; the six canonical columns, the
eight displayed columns, and the guest redaction stand. The second amount is
display-only, and the primary amount is the one the parts table sorts and
filters on.

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
