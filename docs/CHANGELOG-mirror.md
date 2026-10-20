# Mirror changelog — Wafar

This file holds the historical "Constitution X additions" blocks that
`Project-Technologies.txt` previously carried inline. It was split out on
2026-10-08 (ADR-075) for two reasons: a mirror MUST NOT restate a rule
(Single-Reference Sufficiency), and the blocks had grown large enough to
dominate a mirror whose job is the exact version of each approved technology.

**Status**: history, not a source of rules. Every statement below records an
amendment at the time it landed; where one of them and the current
`.specify/memory/constitution.md` disagree, the constitution wins and this file
is corrected. The technology register is the constitution's Technology
Standards; its detail is `Project-Technologies.txt`. On 2026-10-20 ADR-093
removed the custom design system: `wafar.single.css` and
`Design System Standards` no longer exist, and the design-system blocks below
are history only.

---

## Constitution 2.11.0 additions (2026-10-03, ADR-023)

Mirrors the binding controls added by ADR-023. This block names the technologies
and points at the section that governs each one. It states no rule: the mandate,
the order, and every numeric value are the constitution's, read there and not here
(Technology Standards → the register; the single-reference rule at Single-Reference
Sufficiency).

| Technology | The section that governs it |
|---|---|
| **ClamAV** | File Processing Rules (content safety); Deployment and Observability (upload transport) |
| **Stylelint** + **ESLint** | Design System Standards → Invariants (static enforcement) |
| **Lighthouse CI** | Performance Budgets and Verification (lightweight budget) |
| **Semgrep OSS** | Deployment and Observability (supply-chain controls) |
| **osv-scanner** | Deployment and Observability (supply-chain controls) |
| **Prometheus** + **Grafana** | Deployment and Observability (monitoring and alerting) |
| **pg_anonymize** | Deployment and Observability (staging data anonymisation) |
| **BullMQ** | Deployment and Observability (worker durability) |
| **SeaweedFS** | Deployment and Observability (upload transport) |
| **API path prefix** `/api/v1` | Deployment and Observability (API versioning and deprecation) |
| **Session store** | Identity, Authentication, and Session Policy; Deployment and Observability (session revocation) |
| **Anti-spam controls** | Identity, Authentication, and Session Policy (account enumeration, lockout, anti-spam) |
| **Merchant-isolation test** | Deployment and Observability (merchant isolation verification); Schema and Migration Control (tenant scoping) |
| **Supported browsers** | Design System Standards → Invariants (supported browsers); recorded under Constitution Mandated Values |
| **Design-system tokens** | `wafar.single.css` holds the values; the constitution's Design System Standards registers them |

Content-safety ordering, the decoded-size cap's rule, the CAPTCHA prohibition,
the account lockout figures, the deprecation notice period, the LCP/INP/CLS
thresholds, and the SBOM obligation are all constitutional. This mirror names the
tool and stops there.

---

## Constitution 2.11.1 additions (2026-10-03, ADR-024)

Mirrors the amendment that named an already-mandated tool in the register.

- **Stylelint** — now named explicitly in Technology Standards' `packages/config` row and in the Quality row. No new technology was introduced, so no new dependency, licence obligation, or vulnerability scan accompanies this amendment; the tool was already required by Design System Standards (Static enforcement) and ADR-023.

---

## Constitution 2.12.0 additions (2026-10-03, ADR-028)

Mirrors the quota-window clarification and the contact-message path. No new
technology was introduced; no new dependency or licence obligation.

- **Quota window** — the per-user upload quotas (calendar-month window and the
  total ceiling) are stated in the constitution's Usage Limits; this mirror
  restates no quota figure.
- **Contact messages** — no technology is involved: the contact form's path to
  the administrator is a product fact recorded in ADR-028 and owned by R11 and
  R13.

---

## Constitution 2.13.0 additions (2026-10-03, ADR-030)

Mirrors phone-only authentication.

- **better-auth phone-number extension** — provides the phone-number sign-in
  and OTP flows. The prohibition on custom authentication code and the
  `scim`/`sso` module state are the register's and Identity, Authentication, and
  Session Policy's, not this mirror's.
- **Transactional SMS provider** — OTP at sign-up and password-reset delivery.
  It is a register gap; the named provider and its licence obligation are the
  owning slice's to record in its plan, and this mirror names no vendor.
- **E.164 mobile number** — the identifier format the phone-number extension
  stores; the choice of identifier itself is the constitution's (Identity,
  Authentication, and Session Policy; ADR-030).

---

## Constitution 2.14.0 additions (2026-10-04, ADR-033)

Mirrors the audit fix set. No new technology was introduced; no new dependency
or licence obligation.

- **Merchant full name** — a field the sign-up schema collects through
  `packages/shared`; the register entry for it is the constitution's
  (Product Register; ADR-033).
- **`/speckit.analyze` timing** — where the consistency gate sits in the cycle
  is a workflow rule; the workflow file and the constitution (Artifact Workflow
  and Traceability) own it, and this mirror records no ordering of its own.
- **Catalog-delete cascade** — implemented once in the `catalogs` module service
  and reused downstream; which slice owns it is ROADMAP.md's record (R4), not
  this mirror's.
- **Single shared entry point** — the one channel through which merchant scoping
  is applied; the owning slice and the permission model's ratification are
  ROADMAP.md's (R2, then R13).
- **Dependency budget** — the numeric cap on direct runtime dependencies is
  recorded under Constitution Mandated Values; R1 owns setting it.
- **Mirror claims cleanup** — unsourced or unverifiable figures (a Zod
  `.validate()` 35x claim, an exact Hono benchmark number, a Nuxt 3 EOL
  date) were replaced by neutral wording. A precise figure appears here only
  with its vendor source named; this entry records the policy, and the policy
  itself is Single-Reference Sufficiency's to state.

---

## Constitution 2.15.0 additions (2026-10-04, ADR-034)

Mirrors the register additions. No new dependency, licence obligation, or
vulnerability scan burden accompanies them; each tool was already mandated or
named in the sources.

- **Prometheus + Grafana** — the metrics collection stack for p95 request
  latency, search p95, processing success rate, and queue depth, now named in
  the constitution (Deployment and Observability).
- **osv-scanner** — the dependency vulnerability scan alongside Semgrep OSS;
  release-blocking, now named in the constitution.
- **pg_anonymize** (or equivalent) — staging holds no production personal
  data, now named in the constitution.
- **Optional Nitro server routes** — `apps/web/server/` registered as an
  optional fixed location in Internal layout, created only by the feature
  that declares it.
- **BullMQ backend corrected** — BullMQ uses Redis only; the earlier
  "PostgreSQL backend" note was inaccurate and is removed. Redis stays the
  sole queue backend, per Technology Standards.

## Constitution 2.16.0 + 2.17.0 additions (2026-10-04, ADR-037/ADR-038)

- **Cart label** - the cart page's user-facing Arabic label is a product fact
  fixed by the constitution (Product Scope; ADR-045, which supersedes ADR-038). Where this mirror shows
  the cart's path or its table row, it shows that constitution label and states
  no label of its own.
- **Trade name** - the product name and its mandatory diacritics are registered
  in the constitution (Glossary; ADR-038); no technology row depends on them.
- **Reports** - the admin Dashboard's reports are built from in-scope entities;
  the limit itself is the constitution's (Product Scope; ADR-038).
- **Worker re-runs** - retry (merchant) and reprocess (administrator) both
  re-enqueue BullMQ jobs over stored bytes; the two definitions are the
  constitution's Glossary (ADR-038).
- **ClamAV and Lighthouse CI** - registered in the constitution (Technology
  Standards) with explicit notes that they are gates, not runtime dependencies.
- **Nitro** - named as part of Nuxt 4 in Internal layout (`apps/web/server/`);
  deliberately not a row of the Approved register.
- **Role split** - design components come from Nuxt UI v4, module stores from
  Pinia, server-state cache from TanStack Query; validation schemas live in
  `packages/shared`.
- **Open register gaps** (owners in parentheses): Redis client library for
  BullMQ (R3), OpenSearch client library (R3), automated accessibility checker
  (R1), Arabic analyzer configuration and verification (R5), SBOM generator (R1),
  load-test tool (R12). The scans the release gate runs are registered; the
  SBOM's generator and the load-test tool are not, and naming either here is
  prohibited until the owning slice records it with an ADR.
- **Module size** - advisory; the rule and its exception route are the
  constitution's (Module Discipline and Development Workflow).
- **Shared location** - `packages/shared` is the API's only cross-module
  channel; `apps/api/src/shared` is not a location (constitution → Module
  Discipline; ADR-038).

---

## Constitution 2.18.0 additions (2026-10-05, ADR-040/041/042/043)

This section records what 2.18.0 added. The rules are in
`.specify/memory/constitution.md`; this mirror states none of them.

- **Icon set** — still a registered gap, owned by **R1**. No library is named
  here. 2.18.0 states the constraints the choice must satisfy: an open-source
  set under a permissive licence (MIT, Apache-2.0, ISC, or BSD), self-hosted as
  SVG, with no emoji standing in for an icon. The emoji ban itself is a
  user-facing-text rule (Principle V), not a tooling rule.
- **Extraction libraries** — still a registered gap, owned by **R3**. 2.18.0
  binds what they must do rather than which library does it: every extracted
  value is assigned to the canonical column set the constitution's Glossary
  fixes, with no manual mapping step and no question put to the merchant. The
  canonical set is complete for a parts table, so a value that belongs to no
  canonical column is part of no stored column and is not stored.
- **Price reading** — a catalog's price is read in Libyan Dinar and its
  separator is decimal, so `123.000` is 123 dinar. The multi-separator form is
  an open fact owned by R3 (ADR-040). No currency-conversion library is added:
  the platform performs no conversion.
- **Guest price projection** — the price is a part column in PostgreSQL and in
  the OpenSearch index, and a guest's read path projects it away through its own
  allowlist. No technology changes; redaction is a projection rule (Query Safety
  and Secrets).
- **Sign-up dial-code selector** — removed; every number is `+218`. No library
  is added or removed for it (ADR-041).
- **Icon and text policy in review** — the emoji ban and the icon set's licence
  requirement are reviewable by a reviewer reading a diff; no static check is
  registered for them, unlike the physical-direction and non-token design-value
  checks Stylelint and ESLint already enforce.

## Constitution 2.18.1–2.18.9 additions (2026-10-05, ADR-044/045/046/047/048/049/050/051/052/053)

### Party/header sync markers

The mirror header names the constitution and points at the two sources that hold
its version (the footer and `.specify/memory/version.json`) instead of copying a
version string, and then carries the ADR list of its own, ending at the current
last ADR. The date is the constitution footer's; the ADR list is this mirror's
record of the amendments it mirrored, and the footer does not carry it. Because
the mirror copies no version string, an amendment moves the constitution footer
and `.specify/memory/version.json` and appends its ADR to the header list; the
header's prose changes only in that list and the last-amended date.

### Audit fix set (ADR-047)

ADR-047 records the repairs that follow the 2.18.1–2.18.3 set: the v2.18.x set
is committed, integration manifest hashes are re-recorded, the cart label in
`Core-Project.txt` is repaired, ADR-040's filter bullet is corrected, the
stamp-site claims in ADR-028/030/034 are aligned with the Governance procedure,
and the page-addition route in Product Scope is aligned with the Product
Register. This mirror states none of those rules; they live in the constitution
and `docs/DECISIONS.md`.

### Cline removal (ADR-048)

ADR-048 retires the Cline integration. No live reference to `.clinerules/`, a
`cline.manifest.json`, or a `cline` entry in `integration.json`/`.registry`/
`workflow.yml` remains in this repository. The cart label, BOM repair, and
Core-Project line 157 repair follow in the same record. This mirror states none
of those rules; they live in the constitution and `docs/DECISIONS.md`.

### Cart label

The cart's user-facing Arabic name is now «سلة المشتريات» (ADR-045). Every
occurrence of «المحفوظات» in this mirror was repaired to that label; the cart
remains a bookmark list with no price, quantity, or checkout (Principle VI).

### Name diacritics

«وَفَّر» (Wafar): the mandatory diacritics bind the Arabic form; the Latin
"Wafar" carries none (ADR-045).

### Price rendering

The three-decimal form is now shown with both `10.000` and `15.000` examples
wherever it is defined (ADR-045).

### Notification definition

«Notification» now explicitly includes an administrator's reply to the user's
message (ADR-046).

### Merchant scoping (ADR-051, corrected by ADR-053)

A tenant is a merchant account. The scoping column is `user_id` referencing
`User`; there is no `Tenant` entity, and `Supplier`, `AuditLog`, **and**
`ContactMessage` carry no scoping column — ADR-053 corrects ADR-051's list,
which had named `ContactMessage` against the domain model's own two statements
that a contact message carries the submitter's name and phone instead of a
foreign key. "Tenant isolation" is renamed "merchant isolation" where it
named a rule. The Redis client, OpenSearch client, and Arabic analyzer rows in
`ROADMAP.md` now name the plan's Complexity Tracking table, which is where the
Register-gaps rule puts a gap's choice, rather than Constitution Mandated Values,
whose list is closed and does not contain those three.

### Design-system base values (ADR-053)

`wafar.single.css` moves to 1.0.3. Every value inside the file is now a token
definition or a token reference, with three named exemptions: a `mask` image, a
print rule, and a `prefers-color-scheme` rule whose values must not read the mode
class. The gate the constitution mandates (Static enforcement) is scoped to
values outside the file, because a rule that forbade a literal in the token
source would forbid the source from defining anything. New tokens added by this
change: the glass family, `--surface-head`/`--surface-stripe`/`--surface-canvas`,
`--text-on-solid`, `--control-solid`, `--scrim`, the `--ring-*` halos, the
shadow hairline/navbar/glow steps, `--duration-reduced`, the `--motion-loop-*`
periods, the `--motion-stagger-*` ladder, and three loop easings. No value was
removed and no rendered output was changed.

### Granted exceptions (ADR-052)

ClamAV and Lighthouse CI are dependencies named with an explicit exception in the
Approved register. Both are now recorded in `.specify/templates/exception-register.md`
as `EX-001` and `EX-002`, each with an approver and a review date. This mirror
states neither rule; they live in the constitution and in that register.

The register later gained four rows in the same shape — `EX-003` Prometheus +
Grafana, `EX-004` Semgrep OSS, `EX-005` osv-scanner, and `EX-006` pg_anonymize
(2.19.0, ADR-054) — so the register today holds six active exceptions. This
mirror states none of their rules.

---

## Constitution 2.19.2 additions (2026-10-06, ADR-057)

This amendment repairs references and brings `wafar.single.css` fully under its
own token rule. It names no new technology and removes none.

- **`wafar.single.css` moves to 1.0.4.** The remaining non-token values became
  tokens (shimmer, the three glow utilities, vignette, scanlines, the loader
  radar, and the select chevron images), the button's press duration uses the
  recorded motion step, and table headers no longer carry positive tracking
  (Principle V). No family, module, or component changed.
- **The exception register's six rows** (`EX-001` … `EX-006`) are the complete
  set; the Approved register cites each.

---

## Constitution 2.20.0 additions (2026-10-06, ADR-058)

This amendment names no new technology, registers none, and removes none. Its
Design System Standards change is a rule change that `wafar.single.css` then
satisfies, and its two register clarifications remove statements this mirror had
been carrying.

- **`wafar.single.css` moves to 1.1.0** and its physical direction values become
  logical or explicitly angular, under the value form of Principle V's writing-
  direction rule: the select chevron's `background-position` becomes
  `inset-inline-end`, the text gradient and the progress fill become
  `to inline-end` (all three are derived from the writing mode), and the
  symmetric divider gradient becomes an explicit `270deg` (it has no direction).
  No token family, module, component, or rendered value changed.
- **The `apps/worker` row is removed from this mirror's register tables.** It was
  a repository path from Internal layout, not a registered technology, and the
  register admits no technology it does not name. Its four responsibilities
  remain under "بنية المعالجة" below.
- **PgDog is not repeated in the deployment table.** The register files it under
  the database layer; the deployment layer names VPS, Nginx or HAProxy, and
  optional Docker.
- **The retention row no longer states a trigger.** The 90-day period is fixed
  and the point it is counted from is reserved to R15, so this mirror states the
  period and names the owning slice rather than the answer.
- **`TanStack Query`** is named as the register names it; the Vue adapter is
  described in the detail column instead of in the name.

---

## Constitution 2.21.0 additions (2026-10-06, ADR-059)

This amendment registers no new technology and removes none. It names two
register gaps the rules already required, and it corrects four claims this
mirror was carrying: two version rows, one summary table filed under the wrong
layer, and one statement of where the header's own fields come from. No new
dependency, licence obligation, or vulnerability-scan burden is introduced by the
gap rows; each names the slice that chooses the tool and the ADR that records the
choice.

- **SBOM generator** — Deployment and Observability requires an SBOM from every
  build. The register named the two scans (Semgrep OSS, osv-scanner) and no
  generator, so the requirement had no implementation to point at. R1 owns the
  choice; this mirror names no tool.
- **Load-test tool** — Performance Budgets and Verification requires a load test
  before the first public release, and the register named neither a tool nor a
  gap. R12 owns the choice; this mirror names no tool.
- **Zod's version claim** — this mirror wrote that the constitution fixes the v4
  series. The constitution's Validation row names Zod and no version, so the
  claim attributed to it a decision it never made. The mirror now says what the
  Hono row already said: the version is a mirror reference and the exact number
  is pinned by the package's plan.
- **Pinia's version claim** — the row carried two versions and named neither as
  the adopted one. It now names v4.0 as adopted and v3.0.4 as its predecessor, so
  a reader of this mirror can install what the project uses.
- **The summary table is re-layered to the register's layers.** Its delivery row
  had listed Prometheus + Grafana, Semgrep OSS, osv-scanner, and pg_anonymize
  beside VPS and Nginx or HAProxy. The register files Prometheus + Grafana under
  Observability and the other three under Quality, and this mirror's own note
  thirty lines above already said the deployment layer names VPS, Nginx or
  HAProxy, and optional Docker only. Quality now carries the three gates,
  Observability is its own row, and delivery carries only what it claims.
- **The header sync marker no longer claims a footer that carries no ADR list.**
  The version and the last-amended date are the constitution footer's; the ADR
  list is this mirror's record of the amendments it mirrored.

---

## Constitution 2.22.0 additions (2026-10-06, ADR-060)

This amendment names no technology, registers none, and removes none. It closes a
gap between the design system's register and the file it registers, corrects the
file against three of its own binding rules, names two components the product
requires and the file does not provide, and corrects five citation and instruction
defects outside the design system. One design value changed — the field
placeholder's colour — and no rendered value was added or removed.

- **`wafar.single.css` moves to 1.2.0.** The field placeholder drops its 0.7
  opacity: composited, that colour measured about 2.4:1 in light mode and 3.4:1
  in dark, under the 4.5:1 that "Accessibility" requires, while the token alone
  reaches 4.74:1 and 7.11:1 on the same backgrounds. Scroll locking moves out of
  its `max-width: 1023px` block so the state is honoured at every width, the
  loaders' second `prefers-reduced-motion` block is merged into the single motion
  query the file's own closing note requires, and two Arabic comments record
  what the file's rules already implied: that the two uppercase label classes are
  for Latin strings (positive tracking is prohibited on Arabic text), and which
  token each chevron image's colour matches.
- **The design-system register now names the families the file already carried**:
  the body and heading line-height and letter-spacing aliases and the line-wrap
  set in Typography; the transition shorthands and the four transform tokens in
  Motion; the vertical rhythm pair in Spacing; the select chevron's two image
  tokens in Form metrics. Twenty-two tokens were declared and used while absent
  from the register, and the register's own rule says an unregistered value is not
  part of the design system and must not be used.
- **The component inventory is scoped to components.** Utility classes stay named
  only in the file, because a register is a map and not a copy; the module map
  assigns their ownership.
- **The embedded data URI joins the token rule's exemptions**, on the condition
  that the rule declaring it names the token its colour matches — the select
  chevron is the file's only such asset, and CSS cannot read a variable inside a
  `url()`.
- **Two components join the missing list**: the multi-select control and the
  price-range control. Both are registered requirements of the Parts page and
  neither exists in the file, which provides a single-select field and a
  dropdown only.
- **The `expires_at` conflict row no longer cites `Core-Project.txt`.** That
  mirror states no expiry date at all, so the citation named a source that
  cannot be checked. The row's real conflict is between Usage Limits, Product
  Features #16, and the Glossary.
- **`Core-Project.txt` no longer promises a notification at upload.** Its upload
  acceptance criterion fired a notification carrying "uploaded / processing",
  while the register's Notification definition closes the causes to a completed or
  failed job, an administrative message, and an administrator's reply.
- **The exception register's six rows now name the rule they except**:
  `Technology Standards`, which is where "a technology absent from this register
  MUST NOT be used" is written, rather than `Dependency Governance`, which states
  the licence, pinning, vulnerability, and update rules and not that one.
- **`AGENTS.md`'s reading list matches the four templates it summarises.** It
  omitted `docs/domain-model.md` from specify, `Project-Technologies.txt` and
  `Core-Project.txt` from plan, the constitution from tasks, and the whole
  `/speckit.checklist` entry.
- **The spec template's entity placeholder no longer asks for attributes** it
  forbids two lines above, and the workflow file's hook comment names
  `.specify/extensions.yml`, where the hook states actually live, instead of a
  `git-config.yml` that does not exist.
