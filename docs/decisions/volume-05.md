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
