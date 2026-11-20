# Feature Specification: File Intake

**Feature Branch**: `002-file-intake`

**Created**: 2026-11-12

**Status**: This specification is complete and clarified, and it is ready for
implementation; the implementation itself is pending.

**Input**: Parent roadmap: ROADMAP.md → R2. User description: "R2 — File intake. Parent roadmap: ROADMAP.md → R2."

<!--
  BINDING RULES FOR THIS DOCUMENT (governed by `.specify/memory/constitution.md`; the current version is in its footer and in `.specify/memory/version.json`) - NORMATIVE:
  1. Technology-agnostic (Principle VII): this file MUST NOT name languages,
     frameworks, libraries, databases, products, or architectural patterns.
     Product behaviour only; every technical detail belongs in plan.md.
  2. Identifiers (Principle I): FR-### for functional requirements, AC-### for
     acceptance criteria (assigned in the Acceptance Criteria section and
     nowhere else), SC-### for success criteria. Identifiers are stable for the
     life of the feature: never renumber, never reuse; withdraw an item
     by keeping its identifier and marking it withdrawn.
  3. Every FR MUST be testable and unambiguous; every FR SHOULD be covered by
     at least one AC; every AC MUST be referenced by at least one task.
  4. Test request (Principle III): the Test Coverage Request section MUST
     state explicitly whether unit, integration, and end-to-end test tasks
     are requested. Task generation reads that request from THIS file, not
     from the plan.
  5. Project Context Sources (binding) — read these before writing this
     specification, and keep it consistent with them:
        - `.specify/memory/constitution.md` — principles and governance; the
          Product Scope (pages, roles, product features), the Product Register
          (roles, the twenty-eight pages, the data entities and the cross-entity
          rules), the Usage Limits, and the Glossary that is the naming
          authority.
        - `Core-Project.txt` — the product definition: roles and their
          permissions, the page list, the file-processing sequence, and the
          statements the product already makes as acceptance criteria.
        - `docs/design/slice-map.md` — the slice's entry: its blocks and order,
          its states, its copy, and the open questions this specification must
          answer. Reference, not a source of rules; the binding version is this
          specification.
        - `ROADMAP.md` — the slice's scope, dependencies, and what this slice
          does not do (ADR-134).
        - the decision register — `docs/DECISIONS.md`'s index and the volumes
          under `docs/decisions/` (ADR-001 … ADR-181). A specification that
          contradicts one is a blocking defect.
        - `docs/domain-model.md` — the entities a Key Entities section may name,
          and the invariants such a specification MUST NOT contradict. A
          specification MUST NOT invent an entity, and MUST NOT restate the
          entity's columns: an entity, a relationship, or an invariant is a
          registered product fact changed only by amending the register and
          recording an ADR.
     Read the sections named above; for `docs/DECISIONS.md` read its index and
     the volume that holds the records this feature touches, not the whole
     register (ADR-071, ADR-125, Reading protocol).
     The technical sources (`docs/architecture.md`, `Project-Technologies.txt`)
     are bound in plan-template.md, NOT here: naming their content in this file
     would breach rule 1 (Principle VII).
     A page or a product feature that is not on the constitution's Product
     Scope list MUST NOT be specified without recording the addition in the
     plan.
-->

## Clarifications

### Session 2026-11-12

- Q: When a merchant has already reached the monthly or active limit and uploads a file whose content matches a retained catalog, which outcome applies — the quota refusal or the duplicate outcome? → A: The quota refusal at the start: a merchant already at either limit is refused for that limit before any byte is transferred and never reaches the duplicate check, so a duplicate at a known-exhausted limit is not reported as a duplicate. A duplicate recognized during an upload that began under both limits is still reported as a duplicate and consumes no quota, even if a limit is reached meanwhile (FR-045).
- Q: Does the rule that only one upload may be in flight bind one Upload Catalog page or the merchant's whole account? → A: The page: one open Upload Catalog page (tab) carries one upload at a time, and two devices may upload at the same moment; the atomic quota (FR-014) and duplicate (FR-045) rules resolve that race, and no per-account lock refuses the second device.
- Q: What does the platform do with a file whose name carries a bidirectional override or isolate control character, another control character, or a path separator, given that the name is shown to the merchant and, in the duplicate outcome, the original's name is shown to the caller? → A: It is refused before any transfer with its own cause in Arabic, because a displayed name that can be reordered or that carries a path can misrepresent the file; an accepted name is preserved as uploaded and shown through the existing file-name surface, which is not changed.
- Q: When a non-success outcome offers a retry, does the retry re-send the same file without asking the merchant to choose it again, and which outcomes offer it? → A: The retry re-sends the same file without re-selection for a transfer failure, a storage failure, and a scan that could not run; an infected file, an expansion-cap failure, and a content mismatch offer choosing another file instead, because a retry cannot change their cause; the duplicate outcome offers another upload.
- Q: What does the page show when the quota state cannot be read, and does the upload control remain available? → A: The quota block shows an inline failure with a retry and states that the counts are unavailable; the upload control remains available because the server enforces both limits (FR-013), and the page shows no count it cannot verify.

### Session 2026-11-12 (2)

- Q: Does the no-emoji rule reach a merchant's file name — must a name carrying an emoji be refused before any transfer — or is the name accepted and shown as supplied? → A: The name is accepted and shown as supplied: the rule binds the text the platform writes (its copy, labels, messages, and icons), not a value the merchant supplies, so a file name carrying an emoji or another pictograph is neither refused nor rewritten, and R1's refusal of an emoji in a full name or a shop name stays R1's rule on its own form fields. Narrowing Principle V's wording to that scope, and recording the decision as an ADR, is a condition before Converge (FR-008, FR-021, FR-036).
- Q: What is the outcome for a file the platform cannot open without a password — an encrypted PDF or an encrypted Word/Excel document — is it refused at intake or accepted and left to fail in processing? → A: It is refused at intake with its own cause in Arabic: the platform cannot check the content of a file it cannot open or strip macros it cannot reach, so nothing is kept, no catalog is created, no quota is consumed, and the merchant is offered another file. A retry of the same file is not offered because a retry cannot change the cause, and an encrypted PDF is not accepted to fail later in processing (FR-028, FR-030, FR-049).
- Q: When a file is refused for a cause of its own — too large, empty, an unsupported format, or an invalid name — and the merchant is also at a limit, which refusal is the outcome? → A: The file's own cause is the outcome: the file-level check is decided before the limit's, because it is settled without transferring a byte and names what the merchant can correct, so no quota is consumed and the page shows the file's refusal rather than the quota-exceeded state. The limit's refusal remains the outcome for a file that passes every file-level check (FR-013, FR-021, FR-022, FR-024).
- Q: May the merchant choose a file and start an upload while the quota state is still being read? → A: Yes: the loading state stays inside the quota block and the upload control stays available, because the server enforces both limits, so a merchant on a slow read is never blocked from choosing a file and the page shows no count it cannot verify (FR-013, FR-015).
- Q: When several files are dropped at once, which one is started? → A: The first file in the drop's order (the order the browser reports), and the page states that one file is uploaded per submission; the other files are not started (FR-020).

### Session 2026-11-12 (3)

- Q: How is a file's format read from its name when the extension is upper-case or the name carries more than one suffix? → A: The extension is the name's last suffix, compared without regard to letter case: an upper-case extension is accepted, and a name carrying more than one suffix is judged by its last one, so `كتالوج.XLSX` is accepted for validation and `catalog.pdf.exe` is refused for its format before any transfer (FR-021).

### Session 2026-11-12 (4)

- Q: What is the outcome for a file that matches its declared format but is corrupt or truncated and cannot be opened, and is not password-protected? → A: It is refused with its own cause in Arabic, «ملف تالف لا يمكن فتحه», added to FR-028's cause list: nothing is kept, no catalog is created, no quota is consumed, and no retry of the same file is offered because a retry cannot change the cause; the merchant chooses another file (FR-027, FR-028, FR-030, FR-049).
- Q: When an outcome (success, duplicate, or error) settles while either quota is exhausted — for example, the fiftieth upload of the month — which rule governs the outcome's «another upload» or retry action: FR-017's suppression or the action FR-044, FR-047, and FR-049 require? → A: FR-017 governs: the outcome keeps its content (the file name, the My Files link, the duplicate's original, the error's cause), but the submission action is withheld while the refreshed quota state shows an exhausted limit, and the quota-exceeded state is shown; no control is offered that the server would refuse, and the merchant can still reach My Files (FR-017, FR-044, FR-047, FR-049). (Clarified 2026-11-13 (3): the exhausted content is shown inside the quota block while the outcome stays in the upload area.)
- Q: What happens when a live administrator session reaches `/upload`, and which state does the page show? → A: The session is treated as a guest at the merchant area's door: it is taken to the merchant sign-in page, which refuses an administrator account with R1's uniform refusal, so the intake is never reached, no new state is added to this page, and the administrator's full privileges stay in the administrator application (FR-002, AC-002).
- Q: When a file is refused because its name carries a bidi control, another control character, or a path separator, may the page display that name in the selected-file card or the refusal message? → A: No: the refused name is never rendered; the card and the message carry the neutral label «ملف باسم غير صالح» instead, because the refusal exists to prevent a misleading display and echoing the name would defeat it; the merchant chooses another file (FR-008, FR-021, FR-025). (Superseded 2026-11-13 (2): the error state replaces the card and the neutral label appears in its message alone.)
- Q: How is the quota state refreshed when the page stays open across the start of a new calendar month, or when a deletion or another administrator change releases or exhausts a slot? → A: The page re-reads the quota state when it becomes visible again and when the calendar month changes while it is open, and the quota-exceeded state carries a «تحديث» control that re-reads the counts; a re-read that lands under both limits restores the upload control, one that lands at or above a limit keeps the quota-exceeded state, and the page still shows no count it cannot verify (FR-015, FR-017).

### Session 2026-11-12 (5)

- Q: During an upload that is already transferring, may the merchant cancel it from the page, and what happens to the file and the quota if they do? → A: The progress state carries a single «إلغاء» control that stops the transfer at once without a confirmation and returns the page to its choosing state; no file, no record, and no quota remain, which is the same outcome as navigating away (FR-048, FR-050).
- Q: When a duplicate's original belongs to another merchant, does the duplicate outcome name that original and state its upload date, or does FR-009's bar on showing another merchant's file names forbid it? → A: The duplicate outcome is the one registered exception: FR-009 governs the quota state and the merchant's own file names, and the duplicate outcome names the original, states its upload date, and links to its parts while exposing no other record of that merchant, because the constitution's File Processing Rules require the duplicate message to name the original and state its date (FR-009, FR-042, FR-044, AC-026).
- Q: When a success, duplicate, or error outcome is shown, does the upload control remain on the page, or does the outcome replace it so a new upload starts only through its «رفع آخر» or «اختيار ملف آخر» action? → A: One submission surface at a time: the upload control is the page's choosing state, the selected-file card and the progress state take its place once a file is chosen, and an outcome takes the card's place; the outcome's own action returns the page to the control, so the control is never offered beside an outcome or while a file is in flight (FR-006, FR-017, FR-020, FR-044, FR-047, FR-049). (Clarified 2026-11-13 (3): the card stays visible with the progress state beneath it through the transfer and the screening phase, and the outcome replaces both.)
- Q: When both the monthly limit and the active limit are exhausted, which limit does the refusal name? → A: Both, in one message, the monthly first and then the active, each with how it is released; when only one is exhausted, that one is named (FR-016).
- Q: Does the invalid-name rule also refuse a name carrying an invisible direction mark or a zero-width character, or only the ranges FR-021 lists? → A: It refuses them too: U+061C, U+200B, U+200E, U+200F, U+202A–U+202E, U+2066–U+2069, and U+FEFF join the refused set, because the rule exists to prevent a misleading display; the two joiners U+200C and U+200D stay accepted for that reason, because an Arabic-script name or an emoji sequence may carry them (FR-008, FR-021, AC-005).

### Session 2026-11-12 (6)

- Q: What does the page show while the file is screened after its bytes have been transferred, and does «إلغاء» remain? → A: The progress state carries an indeterminate screening phase labelled «يجري فحص الملف» from the transfer's completion until the outcome replaces it, and «إلغاء» is withdrawn at that point because the transfer it stops has finished; the phase is announced, and no new page state is added (FR-048, FR-050).
- Q: When the antivirus scan does not return a verdict within the platform's time budget, does the upload wait, or does it end? → A: It ends in the scan-unavailable refusal: nothing is kept, no quota is consumed, the merchant is told to try again later, and the retry re-sends the same file without re-selection; the budget is a plan value, and the page never waits without a bound (FR-033, FR-049).
- Q: When the merchant leaves the page after the transfer has completed but before the outcome appears, does the intake finish or is it discarded? → A: It finishes: the platform carries the screening through, creates the catalog when the file is accepted (consuming the quota and making it visible in My Files), and retains nothing when it is refused; leaving after the transfer is not a cancel, and only a departure during the transfer cancels (FR-050).
- Q: When a page state replaces the block that held the focus, where does focus move, and where does it return after an outcome's action? → A: Focus moves to the state now shown — its heading, made focusable programmatically for that purpose, or its first action when it carries no heading — and never remains on a control the previous state carried; an outcome's «رفع آخر» or «اختيار ملف آخر» returns focus to the upload control, following the rule R1 set for its state changes (FR-006, FR-059).
- Q: What does the platform do with a file name longer than the record can preserve? → A: It is refused before any transfer with the invalid-name cause and the neutral label «ملف باسم غير صالح», because the record preserves the name exactly as supplied; 255 characters is the bound and a longer name is not one a browser supplies from a file system, so the plan sizes the record's name field to it (FR-021, FR-036).

### Session 2026-11-12 (7)

- Q: Must the platform re-check a file's name on the server — refusing a name that carries a control character, a path separator, or more than 255 characters even when a crafted client bypasses the page's check — before it retains a byte? → A: Yes: FR-026's server re-check includes the name, refused with the same invalid-name cause and the neutral label «ملف باسم غير صالح», because the name is shown to another merchant in the duplicate outcome and the page's check is not a trust boundary; nothing is retained, no catalog is created, and no quota is consumed (FR-021, FR-026, AC-005).
- Q: Does FR-003 fix the shared sign-in's return mechanism to `/upload` alone, or does it return the guest to the internal merchant-area destination they requested, with R2 registering `/upload` and later slices adding theirs? → A: The requested destination: the sign-in returns the merchant only to the internal destination the guest asked for, after validating it against the registered routes; R2 registers `/upload` as the destination it proves, later slices add theirs without amending this rule, no external or unknown target is accepted, and a target that fails the check lands on `/upload` (FR-003, AC-002, AC-043).
- Q: When the session ends or the account is blocked while an upload is in flight or being screened, which state does the page show, and does the intake finish? → A: The ended-session or blocked state replaces the progress state at once, with no transfer error and no retry, because ADR-100 requires the state a session's end produces rather than an unrelated error; a transfer that had not completed leaves nothing, while a transfer that had completed is carried through — the catalog is created, the quota is consumed, and the record appears in My Files — because completion, not the page, is the point after which the intake belongs to the platform, and a block applies to the next request rather than withdrawing a completed transfer (FR-002, FR-004, FR-049, FR-050, AC-002, AC-010).
- Q: When the duplicate's original is a catalog whose processing failed, does the duplicate outcome keep its fixed content, or does it state the original's status and point the merchant to My Files, where the retry lives? → A: It states the original's status, and when that status is `failed` it adds a link to `/my-files` beside «رفع آخر», because re-sending the same bytes is a duplicate by rule and cannot resolve a failed original; the original's name, its upload date, its parts link, and «رفع آخر» stay, unless the refreshed quota state withholds that action (FR-017, FR-044, AC-021).

### Session 2026-11-12 (8)

- Q: When a merchant exceeds the upload-attempt bound for a window — a bound the constitution requires for any operation the plan identifies as resource-intensive, and an upload is one — what does the merchant see, and what happens to the file and the quota? → A: A distinct refusal cause, «محاولات كثيرة», before any byte is transferred: nothing is kept, no catalog is created, no quota is consumed, and the message states the wait; the retry re-sends the same file without re-selection, and an attempt before the wait elapses is refused again with the same cause; the bound and its window are a value the constitution requires the plan to record, so the plan adds it to the constitution's closed list with a decision record. A file's own refusal and a limit refusal count as no attempt (FR-028, FR-049, FR-061, AC-050). (Clarified 2026-11-14 (6): a file-level refusal decided at completion, after the counter was reached when the upload started, counts as one attempt.)
- Q: When a document carries executable content the platform cannot remove — a document macro it cannot strip, or a PDF's embedded executable content — what is the upload's outcome? → A: It is refused at intake with its own cause, «تعذر تأمين الملف»: nothing is kept, no catalog is created, no quota is consumed, and the merchant chooses another file; no retry is offered because a retry cannot change the cause; executable document content includes a document macro and a PDF's embedded executable content, and a file whose executable content cannot be removed is refused rather than accepted to fail later (FR-028, FR-030, FR-032, FR-049, AC-017, AC-020). (Clarified 2026-11-13 (3): a PDF's embedded executable content is removed when it can be; only the unremovable case is refused.) (Clarified 2026-11-13 (7): executable content is the wider set FR-032 now names — a PDF's JavaScript, automatic and launch actions, embedded files, and XFA form scripts, and an Office document macro or embedded object that can execute.) (Clarified 2026-11-14 (2): a file that opens as its declared format but cannot be rewritten — its permissions forbid the write, or its owner protection carries no user password — is refused with the sanitization-failed cause the same way, because it defeats both the removal and the reopen.)
- Q: Where does the page say that one submission carries one file — standing copy in the page's composition, or a message shown when more than one file is dropped? → A: A message shown for that case alone: it states that the first file was started, that one file is uploaded per submission, and that the other files were not started; it is not part of the page's standing composition and adds no state, because the reference carries no such line and the picker is single-file, so only a drop can raise it (FR-020).
- Q: In which unit is the 255 bound on a file's name measured — UTF-16 code units, Unicode code points, or UTF-8 bytes? → A: UTF-16 code units, the unit a browser reports for a file name and the unit both the page's and the server's check use, so a name of 255 units is accepted and one of 256 is refused; the record holds 255 units (FR-021, FR-036, AC-005).
- Q: When the page shows the quota-exceeded state without an upload attempt — on load with a limit exhausted — what does it carry? → A: The same content a limit refusal carries: it names the exhausted limit or both, the monthly first and then the active, states how each is released, carries «تحديث», and does not offer the upload control, while the rest of the page stays usable (FR-015, FR-016, FR-017, AC-047).

### Session 2026-11-13

- Q: When a file is refused before any transfer for a cause of its own — larger than 100 MB, empty, an unsupported format, or an invalid name — which surface shows the refusal: the error state replacing the selected-file card, the card with a message beneath it, or a message above the upload control after the page returns to its choosing state? → A: The error state replaces the selected-file card: it carries the refusal's cause and the single «اختيار ملف آخر» action, which returns the page to the upload control, so every refusal has one surface; a name refused under the invalid-name cause is never rendered and the neutral label «ملف باسم غير صالح» stands in its place (FR-006, FR-021, FR-025, FR-028, FR-049).
- Q: When either limit is exhausted and the page shows the quota-exceeded state, and the «تحديث» re-read fails, does the upload control stay withheld under FR-017 or return under FR-015's failed-read rule? → A: The exhausted content and the withheld control stay; the quota block shows the inline read failure and its retry, and the control returns only after a successful read that lands under both limits, because no verified count has released the limit (FR-015, FR-017). (Clarified 2026-11-13 (3): the used and limit numbers are hidden.)
- Q: Which settlements count toward the upload-attempt bound — every submission that reaches the counter, or only refusals? → A: Every submission that reaches the counter counts as one attempt whatever its outcome — an accepted upload, a duplicate, a safety refusal, a transfer failure, a cancellation, and a retry - while a file-level refusal and a limit refusal count as none (FR-061). (Superseded 2026-11-13 (2): a retry refused for the bound counts as none and does not extend the wait.) (Clarified 2026-11-13 (6): the too-many-attempts refusal replaces the selected-file card as every other outcome does, while the page keeps the file it holds so the retry re-sends that same file without the merchant choosing it again.) (Clarified 2026-11-14 (6): a file-level refusal decided at completion counts as one attempt, because the counter was reached when the upload started; the "none" reading covers the refusal decided before the counter.)
- Q: When a file fails more than one file-level check, which cause is reported? → A: The first in a fixed order used by both the page and the server: the invalid name (a name the platform would not render is settled first), the unsupported format, the size, then emptiness; the page and the server name the same cause for one file (FR-021, FR-022, FR-024, FR-026, FR-028). (Clarified 2026-11-14 (9): an empty name is the name step's first case, and "emptiness" in this order is the file's zero bytes.)

### Session 2026-11-13 (2)

- Q: How is the monthly count kept after a file is deleted, given that a soft-deleted catalog row is filtered out of every read path — a persisted per-merchant monthly counter (or an upload-event record) that survives the deletion, or a monthly count that reads catalog rows including soft-deleted ones? → A: A persisted per-merchant monthly counter, separate from the catalog row and keyed to the calendar month, incremented atomically at acceptance; it survives the deletion and never reads a soft-deleted catalog row, so FR-011 and the constitution's soft-delete rule both hold. The plan records the counter's storage and its month-boundary reset with a decision record and the `docs/domain-model.md` amendment (FR-011, AC-032, SC-012).
- Q: When an upload is refused because a limit is exhausted, which surface shows it — the error state carrying «اختيار ملف آخر» (FR-028), or the quota-exceeded state that withholds the upload control (FR-017, AC-029)? → A: The quota-exceeded state alone: the refusal names the limit or limits and states how each is released, the upload control is withheld and no «اختيار ملف آخر» action is offered until a re-read lands under both limits, and the selected file is not retained. FR-028's "every refusal" is scoped to the causes it lists; a limit refusal is FR-016/FR-017's (FR-013, FR-016, FR-017, FR-028, AC-029, AC-030).
- Q: For a retryable refusal — a transfer failure, a storage failure, a scan that could not run, or an attempt over the bound — does the error state carry the retry alone, or the retry and a way to choose another file? → A: Both: the retry is the primary action and «اختيار ملف آخر» is the secondary, so a persistent failure never traps the merchant and FR-028's "leave the merchant able to choose another file" holds. FR-028's "the other refusals offer choosing another file" is corrected to apply only to a refusal whose cause a retry cannot change (FR-028, FR-040, FR-049, AC-009, AC-018, AC-029).
- Q: For a file refused for its name before any transfer, does the selected-file card appear with the neutral label «ملف باسم غير صالح», or does the error state replace it so the label appears only in the error message? → A: The error state replaces the card; the card is not shown for a refused name, and the neutral label appears in the error state's message alone. AC-005, FR-025, and the matching edge cases are corrected to name the error state and not the card (FR-021, FR-025, FR-028, AC-005).
- Q: When a retry is refused because the attempt-bound wait has not elapsed, does that refused retry count as a new attempt and restart the wait, or is the wait fixed by the attempts already counted? → A: The refused retry does not count and does not restart the wait; the wait is the remaining time until the window has room, restated as it decreases, so the merchant can rely on the stated time. FR-061's "whatever its outcome" is amended to exclude a refusal for the bound itself (FR-049, FR-061, AC-050).

### Session 2026-11-13 (3)

- Q: When a PDF carries embedded executable content, is that content removed and the file accepted after sanitization, or is the file always refused? → A: The content is removed when the platform can remove it and the file is accepted after sanitization; the file is refused with the sanitization-failed cause only when the content cannot be removed, because FR-032 and AC-017 require the kept file to carry no embedded executable content. FR-030's parenthetical is corrected to name only the unremovable case, and the 2026-11-12 (8) answer is read the same way (FR-030, FR-032, AC-017, AC-020).
- Q: When an outcome settles while a limit is exhausted and the quota-exceeded state appears, where is that state shown — inside the quota block while the outcome stays, or in place of the outcome? → A: Inside the quota block: the block names the exhausted limit or limits, states how each is released, and carries «تحديث», while the outcome stays in the upload area with its action withheld. The outcome is not dismissed, and the quota block is the only place the exhausted content appears (FR-006, FR-017, AC-049).
- Q: After a limit is released while an outcome is shown with its «رفع آخر» or retry action withheld, does that action return to the same outcome when a re-read lands under both limits? → A: Yes: the outcome keeps its content and its withheld action returns in place after a successful re-read lands under both limits, without a page reload; when the page is in the choosing state, the same re-read restores the upload control (FR-015, FR-017, FR-044, FR-047, FR-049).
- Q: During the transfer and the screening phase, does the selected-file card stay visible with the progress state beneath it, or does the progress state replace the card? → A: The card stays visible with the progress state beneath it through the transfer and the screening phase, and the outcome replaces both; the card is the file's identity while the progress state reports the work (FR-006, FR-048, AC-003).
- Q: When a re-read of the quota state fails after a successful read, what happens to the used and limit numbers — are they kept, marked stale, or hidden? → A: They are hidden, because the page shows no count it cannot verify; the block keeps the exhausted content (the limit or limits, how each is released, and «تحديث») with the inline failure and its retry, and the upload control stays withheld while the limit is exhausted (FR-015, FR-017, AC-012).

### Session 2026-11-13 (4)

- Q: When an upload is refused for a safety cause — an infected file, executable content that cannot be removed, or a file the scanner could not judge — does anything beyond the merchant's own screen record that attempt? → A: An operational record, and only for the platform's operators: the platform records the outcome of every upload submission — accepted, duplicate, refused for any cause, failed, or cancelled — in a record that carries neither the merchant's identity nor the file's name, so that a scanner that cannot run, a scan that never returns a verdict, and a surge of refusals are detectable. The record is not a page, an entity, or a state the merchant reaches, and no administrator is notified, because the administrator application carries no such surface and the register names none (FR-062, AC-034, SC-013).
- Q: When a file is refused after its bytes have already been transferred — an infected file, a file whose executable content cannot be stripped, or a file the scanner could not judge — what happens to those bytes? → A: They are removed as soon as the refusal is decided: no copy of a refused file remains in storage, in a quarantine area, or with a catalog record, and none is kept for later inspection, because the constitution's rule is that a file failing a safety step is not stored, and the investigation a kept copy would serve is served by the attempt's operational record (FR-062) instead (FR-030, AC-015). (Clarified 2026-11-16 (5): when the storage refuses the removal, the refusal is not reported as decided; the storage failure is shown with its retry and the sweep completes the removal, so the "no copy" guarantee is read once the removal is confirmed.)
- Q: After a successful upload, what does the merchant see when they follow the link to their files, given that the My Files page and the Parts page ship in later slices? → A: The link stays and points at the registered route, and the platform's ordinary not-found answer appears there until the page ships: no placeholder page is added, because the Product Register names none, and the window stays recorded as a roadmap defect. The success outcome's `/my-files` link (R4 ships that page) and the duplicate outcome's `/parts?file=<id>` link (R5 ships its page) both read this way, and omitting the link until the page ships is not chosen, because that would make a later slice edit a page already shipped (FR-044, FR-047, AC-014, AC-021).

### Session 2026-11-13 (5)

- Q: How does the merchant-isolation rule treat the duplicate outcome's read of another merchant's catalog? → A: As the one registered exception: the constitution's isolation rule is amended to name that read, `docs/domain-model.md` is amended, and a decision record carries it, and the read is a bounded projection that carries only what the outcome shows — the original's name, its upload date, its processing status, and the identifier its parts link needs — so the isolation test admits that path as the named exception and no other field of the original and no record of its owner is reachable through it (FR-009, FR-044, AC-026).
- Q: How does the duplicate outcome show the original's processing status in Arabic before the My Files page ships? → A: In an Arabic label fixed here for each of the four status values — `uploaded` reads «تم الرفع», `processing` reads «قيد المعالجة», `completed` reads «اكتمل», and `failed` reads «فشل» — and R4 inherits this vocabulary rather than fixing a second one, because R2 is the first surface that shows a status to a merchant and one vocabulary must exist; the raw registered value is never shown (FR-044, AC-021).
- Q: Where does the upload-attempt counter live, and must the entity register name it? → A: Outside the account row, in the module that owns the quota enforcement, like the monthly counter FR-011 keeps: it is a per-merchant counter that module owns, and the plan records its storage with a decision record and a `docs/domain-model.md` amendment, while the entity register is untouched and the account's registered fields do not change (FR-061).
- Q: What may the upload's operational record carry so the platform's operators can act on it? → A: The outcome, the cause of a refusal, and the time, and nothing else: it is a structured log line kept under the platform's log policy, so it introduces no table and no entity, its retention is the log policy's rather than a window of its own, and a surge of refusals and a scanner that cannot run are detected from the counts by cause; it carries no content hash and no pseudonymous per-merchant reference, so no submission is linked to a file or to an account (FR-062, AC-034, SC-013). (Superseded 2026-11-13 (6): "and nothing else" is read as "and no value that identifies a merchant or a file", so the request's correlation identifier MUST accompany the record, as the constitution's logging rule requires of every log record a request produces.)
- Q: Which calendar do dates take in the merchant's interface, starting with the original's upload date in the duplicate outcome? → A: The Gregorian calendar with Latin digits, everywhere a date is shown to a merchant, and the written pattern (for example `2026-11-12`) is a plan value in one shared date surface, so the duplicate outcome, My Files' table, and the Catalog page's table read one way and two calendars never meet in one product (FR-044, AC-021).

### Session 2026-11-13 (6)

- Q: When a merchant deletes a catalog, does the platform withdraw the stored file's bytes as part of the delete, or does the stored file stay in storage until the retention job removes it — and does a deleted catalog still block a new upload of the same content? → A: The delete marks the catalog and withdraws its parts, its bookmarks, and its search-index entries; the stored file stays in storage and is removed with the row by the retention job, because the constitution's cascade names those three and not the file, and only the retention job and an administrator operation remove a row for good. A deleted catalog is therefore filtered out of the duplicate comparison by its deleted state alone, whatever the state of its stored file, and it does not count toward the active quota for the same reason. FR-046's stated reason is corrected from the absent bytes to the deleted state, FR-042 and FR-045 are read the same way, and the uniqueness the hash carries binds the catalogs that are not deleted; the plan records the decision with a `docs/domain-model.md` amendment beside the content-hash invariant and a decision record, because a plain uniqueness over every row would refuse the re-upload FR-046 accepts (FR-012, FR-042, FR-045, FR-046, AC-024).
- Q: The upload's operational record must carry the outcome, the cause of a refusal, and the time, and nothing else, while the constitution requires every log record a request produces to carry the request's correlation identifier — does the upload's record carry that identifier, or is the constitution's rule read as not reaching it? → A: The record carries the request's correlation identifier alongside the outcome, the cause, and the time. The constitution's logging rule is binding and reaches every log record a request produces, and the correlation identifier identifies a request and identifies neither a merchant nor a file, so it does not link a submission to a file or to an account; it is a request handle and not a merchant reference. FR-062's prohibition is therefore read as it stands — no value that ties a submission to a file or to an account — and its wording is corrected from "nothing else" to "no value that identifies a merchant or a file", so the record's field set is the outcome, the cause, the time, and the correlation identifier; AC-034 and SC-013 are corrected the same way (FR-062, AC-034, SC-013). (Clarified 2026-11-16 (5): the identifier is required, not optional, because the constitution's logging rule is binding, so the three texts read "MUST accompany".)
- Q: When a file is refused because the merchant exceeded the upload-attempt bound, does the selected-file card stay visible above the error state, or does the error state replace it while the page keeps the file it holds so the retry can re-send that same file without the merchant choosing it again? → A: The error state replaces the selected-file card, as every other outcome does, and the page retains the file it holds so the retry re-sends that same file without the merchant choosing it again. FR-006's settled rule — one submission surface at a time, and an outcome replaces the card and the progress state — governs the visible surface, and FR-028's card replacement is read as the refusals it names: FR-021–FR-024's own file-level causes and the too-many-attempts refusal, which is also decided before any transfer. FR-061's requirement that the page keep the merchant's file available is therefore an availability for the retry, not a visible card, and FR-061, FR-028, the matching edge case, and AC-029 are corrected to say so; nothing in the outcome changes the file's bytes, because nothing was transferred (FR-006, FR-028, FR-049, FR-061, AC-050).
- Q: The success state states that processing will begin automatically, but the queue, the worker, and the notification are R3's and R9's, so in the R2-only increment nothing processes the accepted file — does the statement stay, is it reworded, or does this slice create the queue and the notification? → A: The statement stays as it is written, because it describes the product's pipeline as the constitution's File Processing Overview states it, whose queue, worker, status update, and notification are R3's and R9's; this slice creates no queue job, enqueues nothing, and creates no notification, because the entity register names no notification here and the notification surface is R9's. The R2-only increment's record resting at `uploaded` is the window the plan already records with R3 as owner. FR-047 is extended to say the intake neither queues nor notifies, AC-003 asserts it, and an assumption records the reading (FR-037, FR-047, AC-003).
- Q: When a safety refusal is decided, the transport has already written the file's bytes to storage — does the withdrawal delete the whole file, or only the parts of an unfinished upload, and may an orphan of the refused file survive for a later sweep to clean? → A: The withdrawal is complete, and nothing of the refused file survives the refusal — neither a complete file nor an unfinished part of one — because FR-030 says no copy of a refused file is retained in storage and AC-015 says no copy remains in storage once the refusal is decided, and neither text admits a leftover for a later cleanup. FR-030 and AC-015 are extended to say so, and the matching edge case is corrected the same way; the transport's own mechanics and the sweep that removes temporary workspace files stay a plan value under Deployment and Observability's worker-durability rule, and they cannot weaken this outcome (FR-030, AC-015). (Clarified 2026-11-14 (10): the sweep's file-cleanup legs cover only a request abandoned before any refusal; no refused file depends on it.) (Clarified 2026-11-16 (5): the one exception is a storage that refuses the removal itself; the storage failure is shown with its retry and the sweep completes that removal, so the guarantee is read once the removal is confirmed.)

### Session 2026-11-13 (7)

- Q: Where does the plan record the libraries the intake's content checks, storage, and scanning need, and may a capability be used before its record exists? → A: The content-inspection set — content-type validation, container reading, and removal of executable content — is a plan value (the extraction libraries), which R3 extends with extraction; the object-storage client and the scanner client each get a recorded plan entry; each record carries an ADR, a licence-obligation record, a vulnerability scan, and a review date, and no capability is used before its record exists, because the register-gap rule forbids use before the record. The licence prohibition binds code shipped to, or linked into, a merchant's browser or device; a server-side library is outside that clause but still passes the licence check with its obligation recorded, and the plan prefers a permissive licence where the choice is open (FR-027, FR-029, FR-033, FR-040).
- Q: What does it mean for a file's content to match its declared format — must the check tell a Word document from an Excel workbook inside one container family, or is a family-level signature enough? → A: It must tell the document type: the two legacy formats carry one leading signature and the two modern formats carry one archive signature, so the platform opens the container and confirms the document inside is the declared type. A Word document named `.xls`, or an Excel workbook named `.docx`, is a content mismatch and is refused; a container that opens but holds no document of the declared type is a content mismatch rather than corrupt (FR-026, FR-027, AC-006, SC-002).
- Q: Which executable content must be removed before the file is kept — only a document macro and a PDF's JavaScript, or also PDF actions, embedded files, and form scripts, and Office embedded objects? → A: The wider set: in a PDF, its JavaScript, its automatic actions, its launch actions, its embedded files or attachments, and its XFA form scripts; in an Office document, its document macros and any embedded object or attached file that can execute. Every one is removed, and a file whose executable content cannot be removed is refused with the sanitization-failed cause; an embedded object that cannot execute — an embedded chart or an image, for example — is not executable content and is kept (FR-030, FR-032, AC-017).
- Q: After the executable content is removed, must the platform confirm the kept file still opens as its declared format, and refuse it when it does not? → A: Yes: the platform reopens the sanitized file as its declared format before it is kept, and a sanitized file that no longer opens is refused with the sanitization-failed cause, so no accepted catalog is one the pipeline cannot read; nothing is kept, no catalog is created, and no quota is consumed (FR-027, FR-030, FR-032, AC-017).
- Q: Does the decoded-size cap measure a PDF's compressed content too, or only Office archives? → A: Every file the platform inspects, whatever its format: the cap measures the content the file decodes to, including a PDF's compressed streams and an Office archive's members, so a small PDF that expands beyond the cap is refused as an expansion-cap failure exactly as an Office archive is (FR-030, FR-031, AC-016).

### Session 2026-11-14

- Q: At which moment is the original's processing status read for the duplicate outcome — when the duplicate is recognized, or when the outcome is displayed — and does the page re-read it to render it? → A: At the moment the duplicate is recognized, the moment the content hash matches a retained catalog (FR-043, FR-045), and not at the moment of display: the platform captures the status with the duplicate decision and the page renders the captured value without re-reading the original's status, because the outcome reports what was recognized and a status that moves afterwards does not change it; the `failed` rule FR-044 adds is read from that same captured value (FR-044, AC-021).
- Q: Where does the file the page keeps for a retry live, and what does reloading the page do to it and to the attempt counter? → A: In the page's memory only, with nothing persisted: a reload discards it, returns the page to its choosing state, and requires the merchant to choose a file again, while the attempt counter is not reset and the window is not extended, because the bound is the merchant's and outlives the page, so a submission before the wait elapses is refused again with the remaining wait (FR-061, AC-050).
- Q: When an administrator lowers the merchant's quota below current usage while an upload is already in flight, how is that upload decided, and is any file deleted? → A: By the acceptance treatment every acceptance uses: the lowered limit is applied at the upload's acceptance (FR-013, FR-014), so an upload the lowered limit leaves no room for is refused for that limit — the monthly first and then the active when both are exhausted — and shown in the quota-exceeded state (FR-016, FR-017), with nothing retained, no catalog created, and no quota consumed; the lowering deletes no file, withdraws no stored file, and does not withdraw an upload accepted before it takes effect (FR-019, AC-033).

### Session 2026-11-14 (2)

- Q: A file opens as its declared format but cannot be rewritten — its permissions forbid the write, or its owner protection carries no user password — so its executable content cannot be removed and the sanitized file cannot be reopened: what is the outcome? → A: It is refused with the sanitization-failed cause, because neither guarantee FR-032 makes can be kept — the executable content cannot be guaranteed removed from a document that cannot be rewritten, and the sanitized file cannot be guaranteed to reopen when no sanitized copy can be written — so the file is never accepted to fail later; nothing is kept, no catalog is created, no quota is consumed, no retry of the same file is offered because a retry cannot change the cause, and the merchant chooses another file (FR-028, FR-030, FR-032, FR-049, AC-017).
- Q: How is a file's format read from its name when the name ends with a dot and carries no extension, when spaces surround the extension, or when the whole name is an extension? → A: The last suffix is the text after the final dot, compared exactly as it stands and never trimmed: `catalog.` carries an empty last suffix and is refused for its format; `catalog. xlsx` and `catalog.xlsx ` carry a suffix the space leaves unrecognised and are refused for their format; `.xlsx` is a name that is itself an allowed suffix and is accepted for validation. None of the three is the invalid-name refusal, because a trailing dot and a space are not among the characters FR-021 refuses, and all three are decided before any transfer (FR-021, AC-005).
- Q: What do the three observables of «no bytes, no catalog, and no quota» measure, so that every acceptance criterion using the phrase tests the same things? → A: They are defined once at the head of the Acceptance Criteria section and referenced by every criterion that uses the phrase: the storage object list is empty for the file — neither a complete file nor an unfinished part of one — the «سجلات الكتالوج» count is unchanged from its value before the attempt, and the monthly counter's value (FR-011) is unchanged from its value before the attempt; a criterion that uses the phrase asserts these three and no fourth (FR-011, FR-030, AC-010, AC-015).

### Session 2026-11-14 (3)

- Q: FR-011 defines the monthly count twice — as the accepted uploads counted by the catalog's upload timestamp, and as a persisted counter keyed to the calendar month and incremented at acceptance — so which clock supplies the counter's month key, and is the catalog's upload timestamp written from that same clock or left to a second clock reading? → A: «قراءة واحدة للساعة عند القبول تكتب نافذة الشهر وختم الرفع»: the month's window and the upload stamp are written from that one reading at acceptance, so the counter's month and the upload stamp's month are one month even at the boundary and SC-012's month-boundary scenario stays comparable; the month key is never computed from a second reading, because the page's read path derives its month from the same clock and a second reading could fall in a different month at the boundary (FR-011, SC-012).
- Q: SC-004 measures the duplicate outcome's link to «ملفاتي» when the original's captured status is `failed`, but neither FR-044 nor FR-009 fixes that text — it appears only in `contracts/ui-contracts.md` — so is the text fixed in FR-044, or is the word dropped from SC-004 and the route `/my-files` measured alone? → A: The text is fixed in FR-044: the `failed` case's link to `/my-files` is labelled «ملفاتي», so SC-004 measures a requirement the specification states and the contract's line agrees with it; the route alone was not chosen, because a criterion that accepts any label cannot tell the merchant's way to the retry from any other link the outcome carries (FR-044, SC-004).

### Session 2026-11-14 (4)

- Q: How is the text a merchant reads measured — one string at a time, or as one set? (G4) → A: As one set, measured by one acceptance criterion: every string the platform writes and shows is Arabic, carries Latin numerals only, and carries no emoji, and the safety refusal's message is distinguishable from the size refusal's and the format refusal's. The set is the platform's own text — the page's headings and labels, the quota block's lines, the card's detail, the progress and screening labels, the outcomes' bodies, the refusal messages, and the announcements — and not a value the merchant supplies, so a file's name keeps whatever pictograph it carries. Every term in the criterion cites the requirement that fixes it, and the Test Coverage Request answers it (Clarified 2026-11-14 (7): the technical names that do not translate — a format name, an extension, and the unit — are the one exception to the Arabic-only reading, and FR-063 fixes how each reads and in which language an assistive technology voices it) (FR-008, FR-010, FR-021, FR-034, FR-048, FR-063, AC-020, AC-051).
- Q: Is the set of refusal causes that carry an Arabic message closed, how many are in it, and which requirement covers each one? (A1) → A: It is closed at seventeen, and the closed set is the one FR-064 states: twelve of them are the causes FR-028 lists, and the five FR-028 does not list are the two limit refusals — FR-016 and FR-017's quota-exceeded state — the storage failure - FR-040 and FR-030's failed withdrawal, with FR-049's error state - the incomplete transfer — FR-050 with FR-049's error state and FR-026's server re-check — and the invalid request — FR-026's outcome with FR-049's error state. Each of the seventeen carries exactly one Arabic message, and the contract's rule that a cause enters by four edits in one change is what keeps the set closed (FR-028, FR-064, SC-009). (Clarified 2026-11-15 (8): this answer pointed at two refusal tables of the feature by name and section number; that pointing is withdrawn and the reference is behavioural — the closed set is the one FR-064 states — so the answer names no table and no section number, while its seventeen causes, their coverage, and its entry rule stand as answered.)
- Q: Where is the quota-exceeded state named and its content fixed, so that the other places quote one place? (A3) → A: In FR-017 alone: that requirement is the single place where the state is named and its content is fixed — the limit or limits it names, the monthly first and then the active, how each is released, and the «تحديث» control — and every other mention of the state quotes it rather than restating it (FR-015, FR-016, FR-017, FR-019, AC-012, AC-029, AC-047, AC-048, AC-049).
- Q: Which Arabic wording does the success state's statement carry, and how does it stand with the record's status vocabulary? (A4) → A: «تبدأ المعالجة تلقائيا», fixed in FR-047 as the success state's statement, and it belongs to the record's own vocabulary: the record rests at `uploaded` («تم الرفع») and the status the pipeline sets next is `processing` («قيد المعالجة»), the label FR-044 fixes and R4 inherits. One wording for the statement and one for the status, and no second phrasing of either (FR-037, FR-044, FR-047, AC-003).
- Q: Who owns the text of this slice — this specification, the contract, or the plan? (U1) → A: Each piece of text has exactly one owner. This specification owns the product behaviour and the closed sets it fixes: the outcomes, the refusal causes and their count, the four statuses' labels, the Arabic phrases it fixes, and the rule that the platform's own text is Arabic with Latin numerals and no emoji. The feature's UI contract owns the wording of every string the page renders, the page's states, and its focus and announcement rules. The plan owns every technical detail and states the obligations it holds in its own artifact, so that no requirement here restates what the plan owns. A text owned by one of the three is not owned by another (Principle VII, FR-063, FR-064, FR-065, AC-051).
- Q: Where do the four catalog statuses' Arabic labels live, and what happens to the Arabic mirror's own wording of them? (I1) → A: In FR-044 alone: the four labels — «تم الرفع», «قيد المعالجة», «اكتمل», «فشل» — are fixed there once, the contract and R4 quote them, and the Arabic mirror `Core-Project.txt` is subject to this vocabulary rather than to a second wording of it. The amendment that brings the mirror to this vocabulary is a separate manual change outside this slice's artifacts, recorded as a work item of its own, and this specification makes no edit to the mirror (FR-037, FR-044, AC-021, SC-004).
- Q: Which requirement measures Principle V over this slice's texts? (C2) → A: The requirement the text-set answer adds: the rule that the platform's own text is Arabic with Latin numerals and no emoji is the reference that measures Principle V over this slice's texts, the acceptance criterion that measures the merchant-read text as one set cites it, and the contract's copy test measures the same set (FR-063, AC-051).

### Session 2026-11-14 (5)

- Q: Which quota does SC-005 measure at the quota boundary, how many records does it start from, how many concurrent uploads does its sample carry, and what does each of its ratios count? (A2) → A: Both quotas, over ten merchants: each seeded with 299 active catalogs, of which 49 were accepted in the current calendar month — one slot short of each default limit, so the monthly limit of 50 and the active limit of 300 are each one away — with 60 concurrent uploads per merchant and 600 in all — the quota-boundary run, not the stress case, which is the load run's second phase (600/20/20); each merchant's attempts stay at or within the attempt bound without exceeding it (FR-061), so every refusal the run records is a limit refusal and not an attempt-bound refusal. Three ratios are measured over that sample: the merchants whose final monthly count is at or under 50 over the merchants in the sample; the merchants whose final active count is at or under 300 over the merchants in the sample; and the merchants that accepted exactly one of their 60 concurrent uploads over the merchants in the sample, because one free slot admits one acceptance and not two. Every ratio is 100%, and the accepted count and the refusals by cause are recorded beside them (FR-013, FR-014, FR-018, FR-019, FR-061, SC-005). (Clarified 2026-11-14 (10): the 60 uploads are exactly the bound, not below it; the 60th is counted and accepted as an attempt, no attempt-bound refusal appears, and the sample contains no retry or repeated submission.)
- Q: What does the one sentence added to FR-041 define, and does it name the algorithm? (U2) → A: It defines the comparison unit and leaves the algorithm to the plan: the unit is one content hash — a single fingerprint over the whole of the kept bytes — so two files are the same file exactly when their hashes are equal, and the algorithm that produces that hash is a plan value, which keeps the separation of product behaviour from technique (Principle VII, FR-041).
- Q: Which requirement keeps the full text in the FR-016/FR-017 and FR-004/FR-050 pairs, and which becomes a cross-reference to it? (D3) → A: The fuller requirement in each pair keeps the text: FR-017 keeps the whole of the quota-exceeded state's content, and FR-016 names the state and quotes it without restating a word of it, which is what FR-017 already declares of itself; FR-050 keeps the whole of the intake's treatment of a session that ends or an account that is blocked, and FR-004 keeps its own text — the state a session's end produces, R1's rule, and ADR-100's reason — and quotes FR-050 for what the transfer leaves and what it carries through. Both identifiers of each pair stay live, and neither is renumbered nor reused (FR-004, FR-016, FR-017, FR-050).

### Session 2026-11-14 (6)

- Q: When an upload's declared size passes the start-time check but the completed object is empty or larger than 100 MB, so its completion is refused with the empty-file or too-large cause, does that refusal count as an attempt, and how is FR-061 read so that its rule that a file-level refusal counts as no attempt still holds? → A: It counts as one attempt, because the counter was reached when the upload started — after the file-level checks and the limit check — and nothing at completion releases it: a completion that reports an empty file, an over-limit file, or an incomplete transfer is reached by a submission the counter already counted, exactly as a transfer failure is. FR-061's "a file-level refusal counts as no attempt" is narrowed to the file-level refusal decided before the counter, at the upload's start and in FR-028's fixed order; a refusal decided at completion neither releases the count nor restarts the wait, and the error state carries «اختيار ملف آخر» and no retry, because the cause is a file-level one a retry cannot change (FR-026, FR-028, FR-049, FR-061, AC-050).
- Q: When a limit refusal replaces the progress state during an upload, or when the page opens with a limit already exhausted and no upload attempted, what does the upload area show, given that FR-017 puts the exhausted content in the quota block alone? → A: Nothing: the upload area carries no block at all — neither the upload control, the selected-file card, nor the progress state — so the page shows the header and the quota block with the exhausted content and «تحديث», and the area is not a new state and repeats none of the exhausted content; FR-006's list is read as the set of occupants a state may carry, and the quota-exceeded state carries none of them. The control returns to that empty area in place when a re-read lands under both limits. A displayed outcome is the exception FR-017 already states: it stays in the area with its action withheld (FR-006, FR-015, FR-016, FR-017, FR-019, AC-033, AC-047).
- Q: How does the file-name surface show a name that carries no Arabic text at all, such as `catalog.xlsx`, given that FR-008 describes an Arabic stem and a Latin extension? → A: As one left-to-right run, isolated from the surrounding right-to-left text, so the name reads in its own order and its dot and extension are neither reordered nor mirrored; `catalog.xlsx` reads as supplied, and the whole name stays in the markup and as the accessible name (FR-058). The rule that the stem runs right-to-left applies only when the stem carries Arabic, and the extension is not treated as though the stem were Arabic (FR-008, AC-011).
- Q: What sample do SC-006 and SC-007 measure — how many page loads, and how are the 1–4 MB uploads distributed? → A: The load run's 3,600 page loads and 3,600 uploads: 1,200 page loads and 1,200 uploads in the design phase, and 2,400 of each in the stress phase, with one page load before each submission; the uploads are 900 at each of 1 MB, 2 MB, 3 MB, and 4 MB, so the band's lower and upper ends and its two intermediate classes are each represented, and uploads that end in a refusal or a duplicate stay in the sample (FR-010, FR-015, FR-047, FR-048, SC-006, SC-007).
- Q: What does `{wait}` read when the remaining window is zero or less than one second? → A: It never reads zero: the wait is stated in whole seconds rounded up, a remaining wait of less than one second reads «ثانية واحدة», and a submission at or after the window's boundary is judged in the new window rather than refused with a zero wait, so the stated wait stays within 1–900 seconds and the contract's four agreement classes carry the wording (FR-049, FR-061, AC-050).

### Session 2026-11-14 (7)

- Q: When an assistive technology reaches a Latin token inside an Arabic sentence — a format name such as «Excel», an extension such as `xlsx`, or a unit such as «MB» — in which language MUST it read that token? → A: It reads the technical name, the extension, and the unit in English, and the Arabic sentence around them in Arabic, because a technical name is an English word while a count belongs to the Arabic sentence: a numeral and the percentage's sign stay in Arabic while the run that carries them keeps its left-to-right order. This answer completes the reading rule FR-063 now states — the sentence keeps the right-to-left order its string fixes, each run keeps its own left-to-right order, and the two never cross — which covers the format-and-size line, «MB», «Excel» in the selected-file card, and the transfer's percentage (FR-063, AC-051).

### Session 2026-11-14 (8)

- Q: `spec.md` states the intake as one story and one increment, while `tasks.md` ships five stories and the plan accepts Principle VIII for three of them — which reading governs, and what do the words story, phase, and verification increment mean here? → A: Five stories ship. US1 and US3 carry a production increment of their own, and US2, US4, and US5 are verification increments over the engine US1 composes: each has its own test file and its own cases, and none is implementable or testable before US1's engine; the repository owner pins that deviation as `EX-013` (2026-11-16) rather than re-cutting the stories, and the exception register's `EX-013` row records that dependency as a granted exception, which the phases carry as the same decision. A **story** is a unit of user-visible value with its own acceptance criteria and its own increment; a **phase** is the place a story's tasks sit in `tasks.md`'s execution order, a scheduling unit that claims no independence of its own; a **verification increment** is a story whose increment is evidence over an engine another story composes rather than a production surface of its own. The User Scenarios section states this reading and defines the three terms once, and the Acceptance Criteria section groups the criteria by journey segment and names the story that owns each segment; every identifier stays as it is (AC-001 – AC-051).

### Session 2026-11-14 (9)

- Q: When a file's name is empty, which single refusal cause applies, and is an
  empty name reachable from the page or only from a crafted client? → A: The
  invalid-name cause, «سبب الاسم غير الصالح»: emptiness is a property of the name,
  settled first by the name check in FR-028's fixed order, before the last-suffix
  format rule can read a suffix that does not exist, and the neutral label «ملف
  باسم غير صالح» is shown. An empty name is reachable only from a crafted client,
  because the page's picker and drop carry the browser's file name, which is never
  empty; the page never produces one, so the cause reaches it through the server's
  re-check (FR-026) and it renders the same error state. FR-021 gains the empty
  name in its invalid-name set and states that the format rule presumes a name;
  FR-026, FR-028, AC-005, and both contract tables are aligned on that one cause
  and on the fixed order (FR-021, FR-026, FR-028, AC-005).

### Session 2026-11-14 (10)

- Q: When a refused file's transfer has already written some of its bytes or parts, does the immediate withdrawal remove every part of it, including an unfinished part, so that the deferred sweep the plan records serves only an abandoned request that never reached a refusal? → A: Yes: the withdrawal is complete and is part of deciding the refusal — every complete and unfinished part of the refused file is removed at the moment the refusal is decided — so no refused file depends on the sweep, and the sweep's file-cleanup legs cover only a request abandoned before any refusal; the sweep's counter-row removal is not a file-cleanup leg. FR-030 and AC-015 are aligned on that boundary, so AC-015's «nothing of it is left for later cleanup» means nothing of the refused file is left to the sweep, not that a refused file may be left for it (FR-030, AC-015). (Clarified 2026-11-16 (5): the one exception is a storage that refuses the removal itself; the storage failure is shown with its retry, the safety cause stays in the operational record, and the sweep completes that removal, so the "no copy" guarantee is read once the removal is confirmed.)
- Q: In SC-005's sample, are each merchant's 60 uploads exactly the attempt bound or deliberately below it, is the 60th attempt accepted, and what would a retry or a repeated submission do to the sample and to the expected one-acceptance-per-merchant outcome? → A: Exactly the bound, not below it: the 60 uploads are attempts 1–60 of one fixed 15-minute window, the 60th is counted and accepted as an attempt — it is not refused for the bound — and reaches its own outcome, and no attempt-bound refusal appears in the sample. The sample contains no retry and no repeated submission: either would be attempt 61 in that window and would be refused for the bound, so it would fall outside the 60 and could not add a second acceptance — the one-acceptance-per-merchant result would not change — but it would add an attempt-bound refusal and break the sample's condition that every refusal is a limit refusal (FR-061, SC-005).

### Session 2026-11-15

- Q: When the session ends or the account is blocked after the transfer has
completed, does the intake finish or is it cancelled, and which acceptance
criterion measures the difference between a transfer that had not completed
and one that had? (U1) → A: It finishes, and AC-010 now measures it: the
criterion's existing clause covers the session's end or the block during the
transfer, where an incomplete transfer leaves nothing, and a clause is added
inside AC-010 for the case after the transfer has completed, where the
intake is not cancelled — an accepted file's catalog is created, the quota
is consumed, and the record is visible in My Files, while a refused file
leaves nothing (FR-004, FR-047, FR-050). The clause is added inside AC-010,
which keeps its identifier: no criterion is created, no identifier is
renumbered or reused, and FR-004, FR-047, and FR-050 keep their text, the
criterion's one FR tail carrying all three.

### Session 2026-11-15 (2)

- Q: When the original catalog is deleted after the duplicate is recognised but
  before the outcome is shown, what does the duplicate outcome carry, and does the
  upload become an accepted one? (U2) → A: The outcome still names the original
  and carries its parts link, whose parts may be empty by then, and no second
  catalog is created and no quota is consumed: the duplicate decision is captured
  once, at the moment the hash matches a retained catalog, and the outcome reports
  what was captured, so a delete that lands after the capture withdraws neither
  the name, the upload date, the status, nor the parts link the outcome carries,
  and it does not turn the upload into an accepted one. The clause is added inside
  AC-021, which keeps its identifier: no criterion is created, no identifier is
  renumbered or reused, and FR-042, FR-043, and FR-044 keep their text, the
  criterion's one FR tail carrying all three (FR-042, FR-043, FR-044, AC-021).

### Session 2026-11-15 (3)

- Q: What may the specification's status paragraph say about the plan's state, and
  may the specification carry the plan's or the task list's internal identifiers —
  a task identifier, a tracking row, or another slice's number? → A: The status
  paragraph is one neutral sentence about the specification's own state and carries
  no internal identifier, and the specification names no task identifier, no
  tracking row, and no internal bookkeeping of the plan or the task list: the plan
  holds those, and the specification names an artifact — the plan, the task list,
  the exception register — without naming what is inside it. The status content
  moves into the plan, which records it in its own words, and the plan's own
  scan of this document is widened to the two forms that would have caught the
  leak. A roadmap slice's number is not one of those identifiers: the slice that
  owns a window is a product-level fact this specification names in its
  Assumptions, and only the plan's and the task list's own numbering is barred.

### Session 2026-11-15 (4)

- Q: Does the Test Coverage Request name the cases the 2026-11-14 sessions
  added — the last suffix's four names, the file that opens as its declared
  format but cannot be rewritten, the original's processing status captured at
  the moment the duplicate is recognized, and the page's reload after a refusal
  over the attempt bound — so that a reviewer can tell which requested case
  each test task answers? (U3) → A: Yes: the request names all four, each at
  the level that can observe it — the last suffix's four names (`catalog.`,
  `catalog. xlsx`, `catalog.xlsx `, `.xlsx`) and the reload after a refusal over
  the bound in the unit item, and the file that cannot be rewritten and the
  status captured at the duplicate's recognition in the integration item. The
  request names the cases and not the tasks that write them, because the
  specification names no task identifier. The coverage target stays at 80% of
  changed lines, no requirement, criterion, or success criterion is created,
  renumbered, reused, or withdrawn, and no requirement's text changes, because
  each of the four cases is already stated by the requirement that fixes it
  (FR-021, FR-028, FR-030, FR-032, FR-044, FR-061, AC-005, AC-017, AC-021,
  AC-050).

### Session 2026-11-15 (5)

- Q: AC-003's reference tail cites FR-050, yet the criterion exercises no
  departure and no cancellation: does the tail lose FR-050, or does AC-003 gain
  an explicit «And given» clause for the departure and cancellation case? (I1)
  → A: The tail loses FR-050. FR-050's whole subject — a departure during a
  transfer cancelling it, the progress state's «إلغاء» control doing the same,
  and a departure after the transfer has completed not cancelling the intake —
  is exercised by AC-010, whose own tail carries FR-050 beside FR-047 and
  FR-048, while AC-003 exercises the transfer, the screening phase, and the
  success state and no departure at all, so the citation is removed from AC-003
  alone. AC-003 gains no clause, because a second statement of FR-050's
  treatment inside the accepted path would repeat AC-010; AC-003 keeps its
  text, its identifier, and its other eight citations, FR-050 keeps its text
  and stays cited by AC-010, and no identifier is created, renumbered, reused,
  or withdrawn (FR-050, AC-003, AC-010).

### Session 2026-11-15 (6)

- Q: The Assumptions state that Principle V's scope is narrowed as a condition
  before this slice Converges, but the amendment has already landed — is that
  bullet a promise still to be kept, or a fact to be restated in the past tense?
  (C2) → A: A fact to be restated in the past tense. ADR-175 ratified the
  amendment on 2026-11-13 (constitution 7.0.0), and it narrows the no-emoji rule
  to the text the platform writes and shows and places a value the platform
  receives outside the ban; the amendment and its decision record are recorded.
  The Assumptions bullet is therefore rewritten in the past tense with that
  reference, and the condition it carried is kept as the rule that a Converge
  finding the amendment and its record unrecorded is not Converged. No identifier
  is created, renumbered, reused, or withdrawn, and no requirement's text changes.

### Session 2026-11-15 (7)

- Q: FR-044, FR-047, and FR-049 each carry the clause that withholds the
  outcome's action while a limit is exhausted, so the rule reads in three
  places — does FR-017 alone fix it, and do the three keep their text? (D2)
  → A: FR-017 alone fixes it, and the three keep their text. FR-017 is the
  single place where the quota-exceeded state is named and its content is
  fixed, and one sentence is added inside it that names the three
  requirements whose text mentions the state: each of them quotes this
  requirement and restates none of its content, so the clause each one
  carries reads as a reference to FR-017 and not as a second statement of
  the rule. FR-044, FR-047, and FR-049 keep their text and their identifiers,
  and no identifier is created, renumbered, reused, or withdrawn
  (FR-017, FR-044, FR-047, FR-049).

### Session 2026-11-15 (8)

- Q: Does the closed set of seventeen refusal causes bound every answer a
  merchant can receive on the intake route, or only the causes this slice fixes
  for a file and for an upload request — leaving the four answers the route
  reuses from R1 (the ordinary not-found answer, the failure of the platform's
  request-forgery check, a request body above the platform's request-size bound,
  and the internal error) as R1's answers with R1's own text and retryable value,
  with no eighteenth cause and no new message? → A: Only the causes this slice
  fixes: the set bounds the refusal causes of a file and of an upload request,
  and the four answers stay R1's — the same text and the same retryable value —
  because they are R1's answers reaching this route and not causes this slice
  decides, so no eighteenth cause and no new message are added and the contract
  keeps declaring the reuse; FR-064 states that boundary in its own sentence and
  refers the four answers to the contract, and the 2026-11-14 (4) answer now
  points behaviourally at FR-064 instead of naming two refusal tables by section
  (FR-064, SC-009).

### Session 2026-11-15 (9)

- Q: When a duplicate or an error outcome settles while a limit is exhausted,
  does the page withhold only the submit action or also the way to choose another
  file, and does a failed re-read change that? (I1) → A: It withholds both — the
  «رفع آخر» or retry action and «اختيار ملف آخر» alike — because the choosing
  state itself is suppressed while nothing may be submitted, so an action that
  returns the merchant to an area with no control, or to a submission the server
  would refuse for the limit, is not offered; the withholding holds through a
  failed re-read of the exhausted state, because no successful read has released
  the limit. FR-017 is the single place the rule is fixed, and FR-015, FR-028,
  FR-044, FR-047, and FR-049 quote it: FR-049 keeps its both-actions sentence and
  makes it explicit, FR-028 and AC-020 scope "the merchant can choose another
  file" to the case where no limit is exhausted, AC-049 names both actions, and
  the earlier answers' singular "withheld action" is read through FR-017 as both.
  The feature's UI contract states the same rule for the error panel (FR-015,
  FR-017, FR-028, FR-049, AC-020, AC-049).
- Q: AC-020 requires every one of the six safety refusals to state that the file
  was not kept, while three of the six messages omit the phrase — is the
  criterion narrowed or the three messages extended? (I2) → A: The three messages
  are extended with «لم يتم حفظ الملف»: the statement is true in all six cases,
  because none of the six retains a byte, and a criterion that states the
  guarantee uniformly is not narrowed to match copy. The content-mismatch, corrupt,
  and password-protected rows gain the sentence, the six messages stay
  distinguishable from a size or format refusal, and AC-020 and FR-034 keep their
  text (FR-028, FR-034, AC-020, AC-051).
- Q: Is a transfer the page could not finish the same cause as a completion the
  platform cannot accept, is either one retryable, and is a cancellation a third
  case? (U1) → A: Three distinct outcomes. A transfer failure — no answer
  received — is the page's own cause, offers a retry of the same file and a way
  to choose another file, and is one of FR-049's four retryable causes. A
  completion the platform cannot accept — the session is no longer open, the
  transferred parts do not match, or the stored size differs from the declared
  one — is the platform's own answer, so it carries its own message, offers the
  way to choose another file, and offers no retry, because a retry of the same
  bytes cannot change what the answer reported. A cancellation — «إلغاء» or a
  departure during the transfer — is neither: it returns the page to its choosing
  state with no error state and leaves nothing. FR-049 states the three, FR-061's
  "an incomplete transfer" reads as the incomplete completion, FR-064 names that
  cause by it, and the feature's contract and the task list are aligned on
  the same three (FR-026, FR-049, FR-050, FR-061, FR-064).
- Q: Which cases withhold the upload control, how is FR-015 read after them, and
  does the choice among several files during one upload start a second one? (A1)
  → A: Exactly two cases, and neither contradicts FR-015. The control is
  unavailable while a file is in flight (FR-020), and it is withheld while the
  page holds a verified exhausted state — entered by a successful read at or
  above either limit or by a limit refusal — including through a re-read that
  fails, because no successful read has released the limit (FR-017). FR-015 now
  refers to the second case instead of denying it: its availability rules reach
  the loading state and a read that has not succeeded, and the quota-exceeded
  state is the one exception it names and hands to FR-017. The same pass aligns
  AC-012's month-boundary clause on «both limits» rather than a single one, so
  the criterion reads one way from its first clause to its last, and adds the
  one-file rule to AC-001 — dropping several files starts only the first with the
  transient notice, and no second file is started by a drop or by the picker
  while one is in flight — because FR-020 stated that behaviour and no criterion
  measured it (FR-006, FR-015, FR-017, FR-020, AC-001, AC-012).
- Q: AC-028 requires the refusal of an override above the cap, but this slice
  adds no administrator operation — is the clause asserted by the write that sets
  an override or deferred? (U2) → A: Asserted by the write that sets an override,
  and not deferred: the criterion's second clause is that write, refused above 500
  per calendar month or 1,500 active files with the stored value unchanged, so it
  is checkable with no administrator screen and the guarantee the page reads is
  proved where the value lives. The slice that ships that write owns the refusal
  its administrator sees, and the Assumptions record the split so no reader takes
  AC-028 for an administrator-surface criterion (FR-018, AC-028).

### Session 2026-11-16

- Q: Does the selected-file card's file name stay on one line and get cut when
  the available width cannot hold it, or may it wrap, and where does the whole
  name remain? → A: It stays on one line and is cut at the inline-end with «…»,
  and the whole name remains in the markup and as the accessible name. The rule
  is the one FR-058 fixes for a shell label that does not fit, applied to the
  card's name at any width rather than at 320 CSS px alone, because the card is
  the file's identity and a wrapped name would change the card's height and move
  the progress state beneath it; the cut is visual only, so no part of the name
  is lost to an assistive technology (FR-008, FR-058, AC-011).

- Q: What is the scope of the comparison FR-021 applies without regard to letter
  case — every letter the platform's text handling folds, or a narrower set? →
  A: The ASCII letters `A`–`Z` alone, folded to `a`–`z`; no other character is
  folded; the format contract establishes that comparison («المقارنة التي يثبتها
  عقد الصيغة»), so a suffix written with characters outside that range is
  compared as it stands (FR-021).

- Q: When an administrator lowers the merchant's quota while an upload is already
  in flight, and the upload reaches its acceptance with a file whose content
  matches a retained catalog while the lowered limit leaves no room — which rule
  decides, the duplicate outcome (FR-013) or the limit's refusal (FR-019)? → A:
  The duplicate check first. At the acceptance the file's content hash is compared
  with the retained catalogs before the limits are judged, so the upload receives
  the duplicate outcome, consumes no quota, and is never refused for the lowered
  limit — the lowering does not turn a duplicate into a limit refusal (FR-013,
  FR-019, FR-043, FR-045). Only a file that is not a duplicate is judged against
  the lowered limit, and it is refused for that limit when no room remains (FR-016,
  FR-017). The start-side reading is unchanged: a merchant already at a limit is
  refused before any byte is transferred, and that file is not reported as a
  duplicate (FR-013, FR-045). FR-019 now states the precedence in its own words and
  AC-033 measures it.

- Q: The US4 note names AC-027 – AC-034 as the criteria that close the
  exception, while the story's own acceptance-scenario pointer and the
  Acceptance Criteria section give that story two segments, and the register's
  row names the same two segments: which list closes the exception? (I2) → A:
  US4's full share — AC-027 – AC-034 and AC-047 – AC-050 — because the criteria
  that close the exception are the criteria of both of that story's segments,
  so the note's list is corrected to the full share and the register's row
  carries the same share; no criterion is added, removed, or renumbered (AC-027
  – AC-034 and AC-047 – AC-050).
- Q: An earlier answer here aligned the three outcomes with the feature's contract
  by naming the transport it runs over, while a specification states product
  behaviour and names no transport: is the contract this feature's own or the
  transport's? (A1) → A: The feature's own contract, and the wording is
  corrected to say so — the three outcomes are product behaviour, and a
  transport named here would put an implementation detail in a text that carries
  none; the three outcomes and the requirements the answer cites are unchanged
  (FR-026, FR-049, FR-050, FR-061, FR-064).
- Q: The four story notes each state the criteria that close the exception in
  their own words, and one of them drifted from the register's row: which text
  is the source the notes read? (D1) → A: The exception register's `EX-013` row
  is the single source, and each of the four notes now says so in the same
  words — the list that row names — so the closing criteria are stated once in
  the register and quoted by the notes; the row carries US4's full share and
  every test path a task inside its scope writes, and each note keeps its own
  criteria and its meaning (AC-015 – AC-020, AC-021 – AC-026, AC-027 – AC-034
  and AC-047 – AC-050, AC-035 – AC-046).

### Session 2026-11-16 (2)

- Q: SC-012's Measurement clause reads the page's two numbers and the records'
  two numbers at the same observation for every one of its six quota scenarios,
  but only three of them — the defaults, the month boundary, and a lowered quota
  — are observed on a rendered page; the administrator override, the deletion,
  and the 90-day retention are observed from the quota read alone, where no page
  is rendered and no displayed count exists; how is the criterion measured for
  those three scenarios? → A: Option (B) — the clause is amended so that where a
  rendered-page case exists, the page's two numbers and the records' two numbers
  are read at the same observation, and where the scenario is read from the
  quota read alone, the scenario's two counts are read from the records and the
  displayed pair is not part of that observation. The reason is that a scenario
  with no rendered page has no displayed pair to observe, so a clause that
  demanded one there would not be producible; the criterion's outcome is
  therefore stated as the quota state's counts matching the records, with the
  pair under observation being the page's two displayed numbers where a rendered
  page exists and the quota read's two counts where it does not, so the ratio
  stays a ratio over the six scenarios. No case is added to the rendered-page
  file and no task is added, so the measuring task and the cases it reads are
  unchanged; SC-012 keeps its identifier, its sample, its numerator, and its
  denominator (FR-010, FR-011, FR-012, FR-015, FR-018, FR-019, SC-012).

### Session 2026-11-16 (3)

- Q: The requirements do not all stand inside the one subsection that holds them:
  "The attempt's trace" is a heading of its own beside "Functional Requirements"
  and carries FR-062 under it, and FR-063, FR-064, and FR-065 then stand under a
  bold label with no heading at all, while every other group — "The page and the
  way in", "The quota state", "Choosing and validating a file", "Content
  safety", "Storage and the record", "Duplicate", "The outcomes", "The shell at
  runtime", and "Attempt bounds" — is a bold label inside that subsection; which
  shape do the requirements take? → A: The bold-label shape, and the one group
  that is a heading of its own becomes a bold label where it stands: "The
  attempt's trace" is written as a bold label at the same position and holds
  FR-062 as a member of the "Functional Requirements" subsection, and "The text
  this slice writes and owns" stays the bold label it is, so all 65 requirements
  stand under one heading, in the order FR-001 to FR-065, with no renumbering
  and with not one word of any requirement's text changed. The reason is that a
  reader who meets a requirement outside the subsection that holds the
  requirements cannot tell whether it belongs to it, and each group's own label
  already says what the group is, so the heading carried no reading of its own
  (FR-062, FR-063, FR-064, FR-065).

### Session 2026-11-16 (4)

- Q: SC-005 and the answer that fixes its sample call the run the sample is drawn
  from "the capacity model's stress case", while that name belongs to the load
  run's second phase (600/20/20) and not to a run of its own; which run is it, and
  what is it called? (I1) → A: The quota-boundary run — a separate run of the same
  script at the capacity model's 600-concurrent-upload ceiling, and not a phase of
  the load run. SC-005 and the sample's answer carry that name, and the sample,
  its ratios, and its numbers are unchanged (SC-005).
- Q: This specification names three items inside the plan — "the plan's Principle
  VIII gate", "the plan's Constitution Check", and "Specification Detail Owned
  Here" — while the specification names an artifact without naming what is inside
  it; how do the places that carried them read? (I3) → A: The rule stands and the
  three names are withdrawn. Each place that carried one of them now states the
  rule itself: `EX-013` records the dependency as a granted exception, the
  amendment and its decision record are recorded, and the plan owns every
  technical detail and states the obligations it holds in its own artifact. The
  specification therefore names the plan and the exception register without naming
  a section inside either; the guidance comment at the head of this file is read
  the same way and names the plan and not a table inside it. `EX-013` and `EX-007`
  stay as they are — the exception register's identifiers — and the `EX-013` row is
  the single source of the list the story notes quote (FR-065, AC-051).
- Q: FR-017 and AC-049 withhold "every action" an outcome carries while a limit is
  exhausted, which reaches the «ملفاتي» link FR-044 requires when a duplicate's
  captured status is `failed`; is that link withheld? (A1) → A: No. The withheld
  set is the two actions alone — the submit action («رفع آخر» or the retry) and
  «اختيار ملف آخر» — and the «ملفاتي» link stays available, because it is the
  merchant's way to the retry and not a submission the server would refuse. FR-017
  withholds the two actions and names no third, AC-049 keeps the link in the
  content the outcome retains, and both read as the 2026-11-12 (4) answer already
  reads them, which the 2026-11-13 (3) annotation leaves standing (FR-017, FR-044,
  AC-049).

### Session 2026-11-16 (5)

- Q: When the withdrawal of a refused file's bytes itself fails — the storage
  refuses the removal — what does the merchant see, and how does FR-030's "no
  copy" guarantee remain true? → A: The storage failure with its retry, not the
  safety refusal: the platform cannot confirm the removal, so it MUST NOT report
  the safety refusal as decided or claim that no copy remains while one survives;
  the safety cause stays in the operational record, no catalog is created, and no
  quota is consumed. The guarantee is read at the moment the removal is
  confirmed, and the deferred sweep completes the removal when the request
  cannot, with R3 as its owner and R3's acceptance as its review date. FR-030,
  AC-015, the matching edge case, and the Assumptions say so, and the plan and
  the feature's contracts are corrected in a following change to state the path
  (FR-030, AC-015).

- Q: Is the removal of external links in an Office document required behaviour,
  given that FR-032 names only executable content while the format contract
  removes them?
  → A: Required, and added to FR-032: an external link makes the reader fetch a
  resource outside the document, which can leak data, track the reader, or lead
  them to a hostile destination, so it is a security risk and is removed with the
  relationship that binds it to the document; an Office document whose external
  link cannot be removed is refused with the sanitization-failed cause, and
  AC-017 measures that the kept file carries none. The format contract's rule
  stands (FR-032, AC-017).

- Q: When the content check, the sanitizer, or the reopen exceeds its own time
  budget, what is the outcome, and does a new cause enter the closed set? → A:
  Each stage's budget is a plan value, and exceeding it is decided as that
  stage's cause: the content check's is the corrupt-or-unreadable cause, the
  sanitizer's or the reopen's is the sanitization-failed cause, and the scan's is
  the unavailable-scan cause FR-033 states. No new cause enters the closed set,
  which stays at seventeen (FR-027, FR-029, FR-032, FR-033, FR-064).
  (Clarified 2026-11-17 (2): the decoded-size cap's read is the fourth stage
  budget, and its expiry is the corrupt-or-unreadable cause as well, because a
  file the cap could not read far enough to measure was not read and nothing was
  shown to cross the cap.)

- Q: How are a surge of refusals and a scanner that cannot run measured in
  SC-013 — with a threshold and window fixed in the specification, or delegated?
  → A: The observable is fixed here — a surge is observed from the count of
  refusals of each cause over the window, and a scanner that cannot run from a
  nonzero count of the unavailable-scan cause, both read from the records — and
  the threshold that turns a count into a surge and the window's length are
  R12's, with R12 as their owner and 2026-12-15 as the review date; SC-013's 100%
  is the record coverage and is not weakened by the delegation (FR-062, SC-013).

- Q: When a page's departure beacon is lost and the platform never learns of the
  cancellation, is that submission recorded, and how does SC-013's 100% stay
  measurable? → A: The start request's session is the platform's evidence of the
  submission, so the submission is recorded as a cancellation when the deferred
  sweep closes the abandoned session, with R3 as its owner and R3's acceptance as
  its review date; until then the session stays open and no record claims an
  outcome. SC-013's 100% is measured over the submissions that settle — those
  the platform answers and the abandoned sessions the sweep closes — and its
  sample names the lost-beacon case (FR-062, SC-013).

### Session 2026-11-17

- Q: Does the refused-name set reach the two characters that break a displayed
  name across lines — U+2028 LINE SEPARATOR and U+2029 PARAGRAPH SEPARATOR —
  given that the set names neither and neither is a control character? → A: Both
  join the refused set: each is refused before any transfer with the invalid-name
  cause and the neutral label «ملف باسم غير صالح», because each forces a line
  break inside a displayed name — the selected-file card shows the name on one
  line, and the duplicate outcome names the original — so the platform could no
  longer show one name as one value. Neither is a control character: U+2028 and
  U+2029 are the Unicode line separator and paragraph separator, and they are
  refused for the display break, not by the C0/C1 range. No identifier is added,
  removed, renumbered, or withdrawn, and the format contract's
  refused-and-accepted character table and the task list are aligned with this
  answer in the same change (FR-021, AC-005).

### Session 2026-11-17 (2)

- Q: When the decoded-size cap's own read of a file does not finish inside its
  time budget, which cause decides the upload — the expansion-cap cause, because
  the cap is the step that overran, or the corrupt-or-unreadable cause — and does
  a new cause enter the closed set? → A: The corrupt-or-unreadable cause, because
  the file was not read far enough for the cap to measure it, and never the
  expansion-cap cause, because nothing was shown to exceed the cap: a file whose
  read is cut short is one the platform could not read, while an expansion-cap
  failure is a file that was read and whose decoded content crossed the cap.
  FR-029 names the cap's read beside the content check's, the scan's, the
  sanitizer's, and the reopen's, the budget stays a plan value, and the cause is
  one of the closed set's seventeen, so none is added, removed, or renumbered
  (FR-029, FR-031, FR-064).

### Session 2026-11-17 (3)

- Q: Does FR-032's "document macros" reach a legacy Excel 4.0 macro sheet (XLM)
  that a workbook carries among its own sheets, given that the format contract
  and the task list remove that sheet as a case of its own? → A: Yes, and FR-032
  now names it: a document macro is every macro form the document carries — a
  VBA project macro and a legacy Excel 4.0 macro sheet (XLM) — so a document
  carrying a legacy macro sheet and no macro project at all still carries a
  document macro, and the requirement's scope no longer depends on the contract's
  reading. A macro of either form that cannot be removed is refused with the
  sanitization-failed cause, and the kept file carries neither form. How that
  sheet is held inside the workbook and removed stays the format contract's and
  the task list's, because the requirement names content and not storage; AC-017
  is unchanged, and its "a document macro" is read through this definition. No
  identifier is added, removed, renumbered, or withdrawn (FR-032, AC-017).

### Session 2026-11-17 (4)

- Q: Which embedded items in an Office document are executable content — every
  embedded object or attached file that can carry executable content, an embedded
  package included, or only OLE2 compound embeddings, ActiveX controls, and
  executable `ObjectPool` streams? → A: Every embedded object or attached file
  that can carry executable content: an OLE2 compound embedding, an ActiveX
  control, and an embedded package such as a workbook or an archive are removed,
  because each can carry a macro or an executable payload that runs once the
  merchant opens it, and only what cannot execute — a chart or an image — is
  kept. FR-032 states that wider set for every embedded object or attached file
  that can carry executable content, the format contract's removal tables and the
  task list carry it in the same change, and an item that cannot be removed
  stays the sanitization-failed cause (FR-032, AC-017).
- Q: Does the 100 MB bound reach the kept sanitized file, and what is the outcome
  for a sanitizer output larger than it, given that the 1 GiB cap is measured on
  the sanitized decode while no rule names a sanitizer output above 100 MB? → A:
  The kept file MUST satisfy the same 100 MB bound the upload did: a sanitized
  output larger than that bound is refused with the sanitization-failed cause,
  because the platform keeps only a file its own size bound admits and the
  record's byte count is the kept file's, so nothing is kept, no catalog is
  created, and no quota is consumed, and the merchant chooses another file
  because a retry cannot change the cause. The 1 GiB decoded-size cap stays
  measured on the sanitized decode as the format contract fixes it, and the
  format contract and its boundary table carry the case (FR-032, AC-017).
- Q: The format contract's rule is one fail-closed case for each parser bound a
  fixture can produce, yet two bounds — the OLE2 directory's 65,535 entries and
  the PDF's 1,000,000 indirect objects — carry no case, while two PDF depth cases
  the contract now names are not yet in the task list: how are they closed? → A:
  Both missing cases are added — an OLE2 file whose directory declares 65,536
  entries, and a PDF with 1,000,001 indirect objects — each answering the corrupt
  cause with nothing kept, and the task list's case list catches up with them and
  with the two PDF depth cases the contract already names; the format contract's
  bound table, its boundary table, and the task list are aligned in the same
  change, and no cause enters the closed set (FR-027, FR-029).
- Q: No acceptance criterion fails when FR-029's pipeline order is changed, so is
  the order proved by the format contract's stacked-cause integration test
  alone? → A: The order is proved at the acceptance level as well: AC-006 gains
  the case of a file that is both a content mismatch and infected and is refused
  as a mismatch, AC-020 gains the case of a file that is both infected and past
  the decoded-size cap and is refused as infected, and AC-016 gains the case of
  an archive that is both past the cap and carrying executable content and is
  refused for the cap — one stacked case for each adjacent pair in the order the
  content check, the scan, the cap, and the sanitizer run; AC-020's citation tail
  gains FR-029, and no identifier is created, renumbered, reused, or withdrawn
  (FR-029, AC-006, AC-016, AC-020).

### Session 2026-11-17 (5)

- Q: When the page's own timeout fires after the platform has already accepted
  the file, what does the same-file retry receive — a duplicate, a second
  acceptance that consumes quota, or a cause of its own? (CHK029) → A: A
  duplicate. The page's timeout is FR-049's transfer failure, the page's own
  cause with no refusal code, and it does not undo the platform's completed
  work: the acceptance stands, one catalog is created, the monthly count and the
  active slot are consumed once, and the record is visible in My Files (FR-050).
  The retry re-sends the same bytes as an ordinary submission, and at its
  completion the content hash meets the catalog the timed-out request created,
  so it receives FR-044's duplicate outcome naming that catalog — no second
  catalog and no second quota (FR-043); when that acceptance exhausted a limit,
  FR-013 refuses the retry for the limit before any byte is transferred and the
  quota-exceeded state is shown instead of a duplicate report. No cause joins
  FR-064's closed set, and the transfer-failure text claims nothing about
  whether the file was kept, because no response reached the page (FR-013,
  FR-026, FR-043, FR-044, FR-049, FR-050, FR-064).

### Session 2026-11-17 (6)

- Q: SC-007 promises 95% of 1–4 MB uploads within 1 minute of selection, while
  the capacity model's design client carries 2.28 MB in 30 seconds — about
  76 KB/s — so a 4 MB file spends about 53 seconds in the transfer alone; what
  client condition does the criterion measure, and how does the 4 MB class fit?
  (CHK014, CHK013) → A: The criterion states the condition it measures: a client
  uplink of 76 KB/s, the capacity model's design client, and the load run paces
  each sampled upload's part writes at that rate, so the transfer's share is the
  model's own and not the test host's loopback speed. The arithmetic then holds
  over the sample as one set: a 1 MB file spends about 13 seconds in the
  transfer, a 2 MB file about 26, a 3 MB file about 39, and a 4 MB file about
  53, leaving the minute's remaining seven seconds to the pre-sign check, the
  completion's screening, and the outcome's render; the 4 MB class is a quarter
  of the sample, so the 95% ratio is met when four-fifths of that class meets the
  bound, and the service budgets the plan states — a completion's p95 of 10
  seconds included — are what the run measures against. The browser is the one
  the plan's supported-browser statement names, and no device class is fixed,
  because the rendering share is one frame of a loaded page while the transfer
  at the stated uplink is the interval's dominant share (SC-006, SC-007).

### Session 2026-11-17 (7)

- Q: SC-006 measures from «the page's opening» to the quota state's becoming
  visible, but which moment opens the interval — the navigation's start, the
  response's arrival, or the first paint — and is every load in the sample cold
  or a repeat? (CHK009) → A: The navigation's start: the moment the browser
  begins the request for the page's document, not the response's arrival and not
  the first paint, because that is the moment the merchant's wait begins and the
  only one that includes the server's answer. Every sampled load is a cold load
  — a fresh browser context with an empty cache — so no sampled load is served
  from a cache a previous load warmed, and the sample's loads are the first
  visit's case, which is the sample's own composition: 3,600 loads over 10,000
  accounts. The interval ends at the first frame in which the quota block shows
  its settled presentation — the counts, the exhausted content, or the read
  failure — and not its loading state, so a failed read stays in the sample as
  SC-006 already requires (SC-006, FR-015).

### Session 2026-11-17 (8)

- Q: A part write that neither completes nor errors has no bound: is it detected
  by a bound of its own, or does only the merchant's «إلغاء» end it? (CHK028) →
  A: A bound of its own. A part write that reports no progress for the plan's
  stall bound is stopped and answered as FR-049's transfer failure — the error
  state's retry and «اختيار ملف آخر», with the held file kept for the retry — and
  not as a cancellation, because the merchant did not cancel and no departure
  occurred. The bound is a plan value: 30 seconds without a progress event, a
  third of the 105 seconds an 8 MB part takes at SC-007's stated 76 KB/s uplink;
  at that rate a live part reports progress every second, so 30 seconds of
  silence is a dead connection and not a slow one. «إلغاء» remains the merchant's
  own control and a departure remains FR-050's; no cause joins FR-064's closed
  set, no message is added, and FR-061's attempt count is unchanged — the
  submission already counted one attempt and the retry counts another as every
  retry does (FR-048, FR-049, FR-050, FR-061, FR-064).

### Session 2026-11-17 (9)

- Q: SC-007 lets up to 5% of uploads take longer than a minute, as far as the
  plan's stage budgets allow; what does the page show while such an upload is
  still running — is the screening phase the whole answer, or is a separate
  slow-upload presentation needed? (CHK030) → A: The screening phase is the
  whole answer. The page shows the same two progress presentations it shows
  every other upload — the determinate transfer, then the indeterminate
  «يجري فحص الملف» — for however long the work takes, with no percentage added to
  the screening, no elapsed-time count, no second announcement, and no separate
  slow-upload panel, so the measured-presentation set stays closed at eleven
  (SC-008). The tail always ends in an outcome or in FR-049's error state and
  never in an unanswered screen: a stage that overruns the plan's budget for it
  is answered as that stage's own cause, and a screening the page's own timeout
  abandons is FR-049's transfer failure, whose retry and consequence the
  clarification above fixes (FR-048, FR-049).

### Session 2026-11-17 (10)

- Q: FR-015 shows a loading state and an inline failure «when the read fails»,
  but no interval makes a read a failure, so the block can load without end;
  what bound turns a read that never settles into the failure state? (CHK039) →
  A: Five seconds from the read's dispatch. The page stops the request at that
  bound and shows FR-015's inline failure with its retry — the counts
  unavailable, the upload control still available unless a verified exhausted
  state is held, where the numbers hide while the exhausted content and
  «تحديث» stay (FR-017). The loading state never outlasts the bound, no read is
  retried automatically, and a new read comes only from the retry control or one
  of the invalidation events FR-015 names. The bound is a plan value ten times
  the quota read's p95 of 500 ms, and a load whose read times out settles at the
  failure's first frame, five seconds in, so it counts in the slow tail SC-006's
  two-second bound permits and never leaves the merchant waiting without an
  answer (FR-015, SC-006).

### Session 2026-11-17 (11)

- Q: Does the platform scan the sanitized file again, or does the first scan's
  clean verdict cover the bytes kept after the rewrite, and why? (CHK009) → A:
  The first scan covers them, and no second scan runs. The file is scanned once,
  before the sanitizer; the sanitizer only removes content and keeps the rest, so
  the kept bytes are the scanned bytes minus what was removed; and the reopen as
  the declared format (FR-032) is what proves the kept file is a valid document
  of that format. FR-029 states the decision and its reason: a second scan would
  add up to the scan's budget — 90 seconds in the plan's record — to a path whose
  five timed budgets already spend 115 seconds of the page's 120-second timeout,
  so no
  second scan runs. No cause and no identifier are added, and the format
  contract states the same reading (FR-029, FR-032). (Clarified 2026-11-17 (12):
  the path now has six steps and still five timed budgets — the cap's second
  measurement, of the sanitized decode, spends the sanitizer's own budget — so
  the 115 seconds and this reason stand unchanged.)
- Q: SC-013 fixes the readable count per refusal cause but not the length of the
  window or the threshold that turns a count into a surge, so what is the product
  requirement and what is R12's? (CHK026) → A: The product requirement is the
  counters: one readable count of refusals for each cause of the closed set, and
  a readable count of the unavailable-scan cause whose nonzero value is the
  signal that a scanner could not run. The window's length and the threshold that
  turns a count into a surge are operational settings R12 owns and records before
  2026-12-15; they add no cause to the closed set and no counter beside the
  per-cause counts, and SC-013's 100% remains the record coverage (FR-062,
  FR-064, SC-013).

### Session 2026-11-17 (12)

- Q: Does the decoded-size cap measure the file once, before the sanitizer, or
  twice — the original decode before it and the sanitized decode after it — and
  if twice, which budget does the second measurement spend and which cause
  answers its failures? → A: Twice. The kept file is the sanitized one, so the
  original decode's measurement bounds what was inspected while only the second
  measurement establishes that the bytes the platform keeps decode to under the
  cap; the 100 MB bound on the sanitizer's output is a compressed size and does
  not imply the decoded one, and the rewrite of each of the three formats makes
  the output's decoded size a fact of its own rather than an arithmetic
  consequence of the input's. The second measurement is taken as the sanitizer
  writes the kept bytes — the members and streams it writes are what is counted,
  and a retained member's decoded size is the one the first read confirmed — so
  it takes
  no read of its own and spends the sanitizer's 10-second budget: the plan's five
  timed budgets still sum to 115 seconds inside the page's 120-second timeout,
  and the last 5 seconds stay the room the completion, the kept object's write,
  the acceptance transaction, and the response have. A sanitized decode that
  crosses the cap is the expansion-cap cause, because the bytes the platform
  would keep are ones whose decoded content crosses it; a second measurement that
  cannot finish inside the sanitizer's budget is the sanitization-failed cause,
  because the step that produces the kept bytes did not complete. AC-016 measures
  both cases, no cause enters
  the closed seventeen, no budget value changes, and the format contract and the
  plan carry the same arithmetic (FR-029, FR-031, FR-032).

### Session 2026-11-17 (13)

- Q: AC-016's tail cites FR-029, FR-030, and FR-031, but the case the criterion
  was given — the sanitized decode's measurement not finishing inside the
  sanitizer's budget — takes the sanitization-failed cause that FR-032 defines,
  so does the tail cite FR-032 too? → A: Yes, and FR-032 joins the tail alone.
  No sentence of AC-016 changes, no other requirement or criterion changes, and
  no identifier is added: the clause now cites the requirement its cause rests
  on, as AC-017 — which measures the sanitizer's other sanitization-failed cases
  — already does (FR-032, AC-016).

### Session 2026-11-17 (14)

- Q: May the Assumptions' settlement of open fact #9 keep the sentence that the
  owning module's schema and the feature's `data-model.md` state the fields,
  when Principle VII forbids implementation detail in a specification and a
  schema is a storage plan? → A: No. Principle VII forbids any implementation
  detail in `spec.md`, and a schema is a storage plan, so the two sentences
  read "A catalog carries the kept file's byte count and its content type. The
  plan states the fields that carry them." The site names no schema, no column
  name, no type, and no data model artifact, and it refers the fields to the
  plan, which states them. No `FR`, `AC`, or `SC` changes and no identifier is
  renumbered (FR-036).

## User Scenarios & Testing *(mandatory)*

**Five stories, five increments; three are verification increments.** This
specification states the intake as five user stories — US1 to US5, in the
priority order the story headings carry — and `tasks.md` ships them in five
story phases in that order. Three terms carry this reading, and this paragraph
states each of them once:

- A **story** is a unit of user-visible value with its own acceptance criteria
  and its own increment; `US#` names it in this specification, in `plan.md`, and
  in `tasks.md`.
- A **phase** is the place a story's tasks sit in `tasks.md`'s execution order
  (Phase 3 for US1, Phase 4 for US2, and so on). A phase is a scheduling unit,
  not a product unit, and it carries no claim of independence of its own.
- A **verification increment** is a story whose increment is evidence — its own
  test file, its own fixtures, and its own measurements — over an engine another
  story composes, rather than a production surface of its own. US2, US4, and US5
  are verification increments; US1 and US3 each ship a production increment.

**What is claimed, what is not, and the exception that is pinned.** Every story's
cases live in its own file and name the story that owns them. US2, US4, and US5
cannot be implemented before US1's engine exists, and they cannot be tested
without it, so a claim that no story needs another story complete would be
false. The repository owner's decision of 2026-11-16 is to **pin that deviation
as an explicit governance exception — `EX-013` — rather than re-cut the three
stories**, and the decision, the exception's exact scope, its approver, and its
review date are recorded in the exception register as `EX-013`. The scope is
the evidence the four stories write and the one panel US1's page composes, not
the stories as a class: each story keeps its own cases,
its own file, its own fixtures, and its own measurements, and no acceptance
criterion is waived. What the exception waives is one clause of Principle VIII
for those surfaces — that a story be implementable, and testable, without another
story being complete — because the engine a verification increment measures is
US1's, and US1's page composes the duplicate outcome's panel. `tasks.md` may
therefore say that five stories ship and that three of them are verification
increments, provided it claims no more than that: the five story phases, the
three verification increments, and the dependency on US1 are one reading, and
this paragraph is its single statement. The acceptance criteria keep the
segments and identifiers they have always carried (AC-001 – AC-051), and no
requirement or criterion is renumbered.

### User Story 1 - Upload a supplier catalog (Priority: P1)

A signed-in merchant opens the Upload Catalog page and uploads one supplier
catalog. The page shows the merchant's monthly and active quota state and the
control that starts an upload. The merchant chooses one Excel, PDF, or Word file
— by dropping it on the page with a mouse, or through the single upload action
on a touch screen — and the platform names the file, shows its size and format,
reports the transfer's progress, screens the file before it keeps it, and
confirms that the file was accepted and recorded in My Files. A file that fails a
check is refused with a cause of its own, and nothing is kept; a file the
platform already holds receives the duplicate outcome, which names the original,
states its upload date and processing status, and links to the parts that came
from it; an upload that would exceed either quota is refused in the quota state.
The record the platform creates is the merchant's own catalog, and its status is
`uploaded`; the merchant sees the record in My Files, where it lives.

The page renders inside R1's shared shell; the shell's own runtime behaviour is
US5's subject, and this story composes its surfaces unchanged.

**Why this priority**: This is the slice's reason to exist and the engine every
other story runs over. Without an accepted, stored catalog there is nothing for
extraction to read and nothing for search to show, so no later slice can deliver
its value; and a page that kept a file the safety pipeline had not passed would
be unsafe to ship, so the page and the engine that screens, refuses, records, and
counts are one increment. It depends only on R1's account and shell.

**Independent Test**: Can be fully tested by signing in as a merchant, opening
`/upload`, selecting a valid file, and completing the transfer, and delivers a
stored file and exactly one catalog record owned by that merchant with status
`uploaded`, the file's name, its kept size and content type, and its upload
timestamp. The page's file-level boundaries are verifiable from this story's own
criteria: exactly 100 MB accepted and one byte more refused, an empty file, an
unsupported format, a renamed file, a name carrying a bidi override, an
upper-case or multi-part suffix, and the neutral label for a refused name. US2 to
US5 prove the safety verdicts, the duplicate outcome, the quota boundaries, and
the shell's runtime over this page, each from its own file.

**Acceptance Scenarios**: covered by AC-001 – AC-014 and AC-051 in the Acceptance
Criteria section, with AC-050's page side asserted here as well.

---

### User Story 2 - The file is screened before it is kept (Priority: P1)

A merchant's file is inspected before the platform keeps any of it: the content
must match the declared format, the platform scans the file for malware, caps the
size it decodes to, and removes the executable content it carries, and a file
that fails any step is refused with its own cause in Arabic. Nothing is kept, no
catalog is created, and no quota is consumed.

**Why this priority**: P1 with US1, because the pair is the MVP the tasks
support: a page that kept a file the safety pipeline had not passed would not be
safe to ship, and the safety proof is what makes the accepted path trustworthy.

**Independent Test**: With a valid file and the scanner forced to each verdict,
drive one upload per cause and assert the refusal's message, that the file was
not kept, that no catalog exists, and that the quota is unchanged; the scan that
cannot run, the corrupt file, the expansion cap, and each executable item are
each their own case.

**Acceptance Scenarios**: covered by AC-015 – AC-020 in the Acceptance Criteria
section.

**Pinned exception, not a weaker increment**: the verdicts and their fail-closed
order are the engine's, and this story proves them over US1's surface. It runs
after US1 and cannot be implemented before it; `EX-013` records that dependency
as a granted exception rather than a claim of independence, with AC-015 – AC-020
as the criteria that close it — the list the register's `EX-013` row names. What
the story still carries is its own proof:
the causes, the fail-closed order, the refusal's message, and the unchanged
storage, rows, and quota are asserted in this story's own file and nowhere else.

### User Story 3 - A duplicate file is rejected by its content (Priority: P2)

A merchant uploads a file the platform already holds: the platform recognises it
by its content rather than its name, withdraws the bytes it has just kept, and
shows the duplicate outcome, which names the original file, states its upload
date and processing status, and links to the parts that came from it. This story
ships the duplicate outcome's panel the page composes and proves the duplicate
projection the intake already composes.

**Why this priority**: P2 — the intake accepts and refuses correctly without it,
but a second copy of a file the platform holds would split one catalog's parts
across two records, so the product cannot ship without the outcome.

**Independent Test**: Upload one file, then upload its identical bytes under
another name and from another device, and assert one catalog, the duplicate
outcome with the original's name, date, status, and parts link, and no quota
consumed; a duplicate of a `failed` original adds the My Files link, and a
deleted original does not block the re-upload.

**Acceptance Scenarios**: covered by AC-021 – AC-026 in the Acceptance Criteria
section.

**The panel's edge, pinned**: this story ships the duplicate outcome's panel,
which US1's page composes and whose presentation US1's accessibility and baseline
work scan, so the dependency runs back into US1. `EX-013` records that edge as a
granted exception, with AC-021 – AC-026 as the criteria that close it — the list
the register's `EX-013` row names; the panel is this story's own
production file, and its cases are its own.

### User Story 4 - The monthly and active quotas are visible and enforced (Priority: P2)

The page shows the merchant's monthly and active counts and the limits that
apply to them, and the platform enforces both at acceptance — atomically, so one
free slot admits one upload and not two — together with the attempt bound that
refuses a merchant whose attempts exceed it for the window. A merchant at either
limit sees the quota-exceeded state with how each limit is released, and the
actions the page would have offered are withheld.

**Why this priority**: P2 — the page is useful before the boundary is proven, but
a quota that admitted one upload too many would be a correctness defect the
product must not ship.

**Independent Test**: Seed 49 accepted uploads this month and 299 active files,
run two concurrent uploads, and assert at most one acceptance, the count never
exceeding 50, the quota-exceeded state, and the withheld outcome actions; the
attempt bound is driven to its 60th attempt and its 61st.

**Acceptance Scenarios**: covered by AC-027 – AC-034 and AC-047 – AC-050 in the
Acceptance Criteria section.

**Pinned exception, not a weaker increment**: the rules, the counters, and the
acceptance transaction are the engine's, and this story proves them at the
boundary and records the success-criterion measurements. It runs after US1 and
cannot be implemented before it; `EX-013` records that dependency as a granted
exception rather than a claim of independence, with AC-027 – AC-034 and AC-047 –
AC-050 as the criteria that close it — the list the register's `EX-013` row
names. What the story still carries is its own proof: the boundary, the race, the
lowered limit, the attempt bound, and every measurement it records are asserted
in this story's own file and nowhere else.

### User Story 5 - The shared shell comes alive on the first page that renders it (Priority: P2)

R1's shared shell is rendered on a real page for the first time: the account menu
opens, closes, and ends the session through its confirmation; the sidebar is full
on a wide screen and narrows to an icon rail; on a narrow screen «المزيد» opens
the drawer, which contains focus while open and returns it on every dismissal;
the bottom bar hides and returns on scroll; the overlays stack and never open
together; the shell's labels stay readable at the smallest supported width; a
guest who activates a merchant destination is taken to sign-in and returns
afterwards; and the four static-page links sit where the shell puts them.

**Why this priority**: P2 — the shell ships with R1, but its runtime behaviour is
unproven until a page renders it, and this slice is that page.

**Independent Test**: On the rendered `/upload`, open and dismiss the account
menu, collapse the sidebar, exercise the drawer at 900 CSS px, scroll the bottom
bar, and run the automated accessibility scan and a keyboard-only upload; each
`EX-007` behaviour is recorded against its criterion.

**Acceptance Scenarios**: covered by AC-035 – AC-046 in the Acceptance Criteria
section.

**Pinned exception, not a weaker increment**: the page composes R1's surfaces
unchanged, and this story is the rendered proof that ends `EX-007`. It runs
after US1 and cannot be implemented before it; `EX-013` records that dependency
as a granted exception rather than a claim of independence, with AC-035 – AC-046
as the criteria that close it — the list the register's `EX-013` row names. What
the story still carries is its own proof:
each behaviour, on the first page that renders the frame, against its own
criterion.

---

### Edge Cases

- A merchant selects a second file while one upload is in flight: the page carries
  one upload at a time, so the control is unavailable until the first settles and
  the second file is not started (FR-020). The rule is the page's, not the
  account's: another device may upload at the same moment, and the atomic quota
  and duplicate rules resolve that race (FR-014, FR-020, FR-045).
- A merchant activates «إلغاء» during a transfer: the transfer stops at once
  without a confirmation, the page returns to its choosing state, and no file,
  no record, and no quota remain; the outcome is the same as leaving the page
  (FR-048, FR-050).
- A transfer completes while the platform is still screening the file: the
  progress state turns into the indeterminate «يجري فحص الملف» phase, «إلغاء» is
  withdrawn, and the outcome replaces the card and the state when it settles; no
  cancel is offered for work whose transfer has already finished (FR-048,
  FR-050).
- A merchant leaves the page after the transfer has completed but before the
  outcome appears: the intake is not cancelled — the platform finishes the
  screening, creates the catalog when the file is accepted (the quota is
  consumed and the record appears in My Files), and retains nothing when the
  file is refused (FR-050).
- A state replaces the block that held the focus — the upload control, the
  selected-file card, or the progress state: focus moves to the state now
  shown, its heading made focusable programmatically or its first action when it
  carries no heading, and never remains on a removed control; an outcome's «رفع
  آخر» or «اختيار ملف آخر» returns focus to the upload control (FR-006, FR-059).
- A merchant drops several files at once: the page starts the first file in the
  drop's order and shows a message for that drop stating that one file is uploaded
  per submission and the other files were not started; the message is not part of
  the page's standing composition and the other files are not started (FR-020).
- A merchant is at exactly the 100 MB boundary: the file is accepted for
  validation; one byte more is refused (FR-023, AC-004).
- A file's name carries a bidirectional override or isolate control character,
  an invisible direction mark, a zero-width or byte-order character, another
  control character, a line or paragraph separator, or a path separator: it is
  refused before any transfer with
  its own cause, and the refused name is never rendered — the error state's
  message shows «ملف باسم غير صالح» and no selected-file card is shown — because a displayed name that can be
  reordered or hidden or broken across lines or that carries a path can
  misrepresent the file, while an
  accepted name is preserved as uploaded and shown through the existing file-name
  surface; the two joiners stay accepted, because an Arabic-script name or an
  emoji sequence may carry them (FR-008, FR-021, FR-025).
- A file's name carries an emoji or another pictograph: it is accepted and
  shown as supplied, because the no-emoji rule binds the text the platform
  writes and not a value the merchant supplies; the name is neither refused nor
  rewritten (FR-008, FR-021).
- A file's name carries an upper-case extension or more than one suffix: the last
  suffix decides, compared without regard to letter case, so `كتالوج.XLSX` is
  accepted for validation and `catalog.pdf.exe` is refused for its format
  (FR-021).
- A file's name ends with a dot and carries no extension (`catalog.`), a space
  surrounds its suffix (`catalog. xlsx`, `catalog.xlsx `), or the whole name is
  an allowed suffix (`.xlsx`): the suffix is compared exactly as it stands, with
  no trimming, so the first two are refused for their format before any transfer
  and the third is accepted for validation; neither a trailing dot nor a space is
  one of the characters the invalid-name rule refuses (FR-021).
- A file fails more than one file-level check at once — a 200 MB file whose name
  carries a bidi control, or a 200 MB file named `catalog.exe`: the reported cause
  is the first in the fixed order FR-028 states — the invalid name (an empty name
  included), then the
  unsupported format, then the size, then the file's emptiness (a zero-byte
  file) — so the name is settled
  before any message could render it, and the page and the server name the same
  cause for one file (FR-021, FR-022, FR-024, FR-026, FR-028).
- A merchant already at either limit uploads a file whose content matches a
  retained catalog: the limit's refusal is the outcome, because the file is
  refused before the duplicate check and no byte is transferred (FR-013, FR-043).
- An administrator lowers the merchant's quota while an upload is in flight, and
  the file's content matches a retained catalog: the upload receives the duplicate
  outcome at its acceptance and consumes no quota, because the duplicate check
  precedes the limit's judgment there and a duplicate never reaches the limit's
  refusal; the lowered limit refuses only a file that is not a duplicate (FR-013,
  FR-019, FR-043, AC-033).
- A merchant is at both limits at once: the refusal names both, the monthly
  first and then the active, and states how each is released; no byte is
  transferred, no catalog is created, and no quota is consumed; a merchant who
  opens the page at either limit without an attempt sees the quota-exceeded state
  carry the same content and the «تحديث» control (FR-013, FR-015, FR-016,
  FR-017).
- An accepted upload reaches the monthly or active limit as it settles — for
  example, the fiftieth of the month: the success state keeps its file name and
  My Files link but withholds «رفع آخر» while the refreshed quota state shows the
  exhausted limit, and the quota block shows the quota-exceeded content; the same
  rule withholds a duplicate's «رفع آخر» and an error state's retry (FR-017,
  FR-044, FR-047, FR-049).
- A merchant at either limit chooses a file that fails a file-level check — too
  large, empty, an unsupported format, or an invalid name: the file's own cause is
  the outcome, because the file-level check is decided first and transfers no
  byte; the quota-exceeded state returns once a file passes it (FR-013, FR-016,
  FR-017, FR-021, FR-022, FR-024).
- The browser cannot report a file's size: the server's own check still governs,
  and the file is refused if it exceeds the limit (FR-026).
- The session ends — inactivity, absolute lifetime, a sign-out elsewhere, a
  password change — while the page is open: the in-shell ended-session state
  replaces the progress state at once, with no transfer error and no retry; a
  transfer that had not completed leaves nothing, and a transfer that had
  completed is carried through, so the catalog is created, the quota is consumed,
  and the record appears in My Files (FR-004, FR-050, ADR-100).
- The account is blocked while the page is open: the blocked state replaces the
  progress state at once, a transfer that had not completed leaves nothing, a
  transfer that had completed is carried through, and the merchant keeps the
  files they already uploaded (FR-002, FR-004, FR-050).
- A live administrator session reaches `/upload`: it is treated as a guest at the
  merchant sign-in page, which refuses an administrator account with the uniform
  refusal, so the intake is never reached and the page adds no administrator
  state; the administrator's full privileges stay in the administrator
  application (FR-002).
- The same file is uploaded by the same merchant from two devices at once: one
  catalog is created and the other upload receives the duplicate outcome naming
  it, even if a limit is reached meanwhile, because a duplicate consumes no quota
  (FR-043, FR-045, AC-023).
- The original catalog is deleted after the duplicate has been recognised but
  before its outcome is shown: the outcome still names the original and links to
  its parts, which may be empty by then (FR-044, AC-021).
- The duplicate's original is a catalog whose processing failed: the outcome
  states that status as «فشل», adds a link to `/my-files`, where R4's retry
  lives, and
  keeps the original's name, its upload date, its parts link, and «رفع آخر»,
  because re-sending the same bytes is a duplicate by rule and cannot resolve a
  failed original (FR-044, AC-021).
- The merchant follows a link this page carries to a page that has not shipped
  yet — `/my-files` in the success outcome, `/parts?file=<id>` in the duplicate
  outcome: the link points at the registered route and the platform's ordinary
  not-found answer appears there, because no placeholder page is added and the
  window stays recorded as a roadmap defect (FR-044, FR-047, AC-014, AC-021).
- A duplicate's original belongs to another merchant: the outcome names that
  original, states its upload date in the Gregorian calendar with Latin digits
  and its processing status in the Arabic label FR-044 fixes, and links to its
  parts, because the parts are
  public and the constitution's File Processing Rules require the original to be
  named; the outcome carries only the fields FR-009 permits — the name, the
  upload date, the processing status, and the identifier the parts link needs —
  so it exposes no other record of that merchant, and this is the one
  registered exception to FR-009's bar (FR-009, FR-042, FR-044, AC-026).
- A file whose name is very long — up to the 255-unit bound: the visible
  name is cut to the available width, while the whole name stays in the markup
  and as the accessible name (FR-008, FR-058).
- A file's name is 255 UTF-16 code units: it is accepted for validation; a name of
  256 units is refused before any transfer with the invalid-name cause, nothing
  is retained, and the error state's message shows «ملف باسم غير صالح» instead of
  the name; no selected-file card is shown (FR-021, FR-025, FR-036).
- A crafted client sends a name the page would have refused — an empty name, a
  bidi control, a line or paragraph separator, a
  path separator, or a name over 255 UTF-16 code units: the server refuses it before
  retaining any byte with the invalid-name cause and the neutral label, so no
  name the page would not show reaches the duplicate outcome or another merchant
  (FR-021, FR-026, AC-005).
- A merchant holds an override at the ceiling of 500 per month and 1,500 active:
  the page shows and the platform enforces those values, not the defaults
  (FR-018).
- The quota state cannot be read: the block shows an inline failure with a retry
  and says the counts are unavailable, and the upload control stays available
  because the server enforces the limits (FR-015). When the failed read is the
  «تحديث» of the quota-exceeded state, the used and limit numbers are hidden, the
  exhausted content and the withheld control stay, and the control returns only
  after a read lands under both limits (FR-015, FR-017). A read that has not
  settled within the plan's five-second bound is that failure: the page stops the
  request, the loading state ends at the bound, and no read is tried again
  automatically, so the retry control or an invalidation event is the only new
  read (FR-015).
- The page stays open across the start of a new calendar month, or a deletion or
  an administrator's quota change releases or exhausts a slot while it is open:
  the quota state is re-read when the page becomes visible again and at the month
  boundary, and the quota-exceeded state carries a «تحديث» control, so the upload
  control returns without a page reload once the read is under both limits, and
  both of an outcome's withheld actions return in place the same way (FR-015,
  FR-017).
- A file fails content safety after it has been fully transferred: the bytes are
  withdrawn as soon as the refusal is decided, so nothing of the file remains in
  storage, in a quarantine area, or with a catalog record — neither a complete
  file nor an unfinished part of one; no record is created,
  and no quota is consumed (FR-030). When the storage refuses the removal itself,
  the merchant sees the storage failure with its retry rather than the safety
  refusal, the safety cause is recorded, no catalog is created, no quota is
  consumed, and the deferred sweep completes the removal; no copy is reported as
  removed until then (FR-030, FR-040, FR-049).
- An upload is refused for a safety cause — an infected file, executable content
  that cannot be removed, or a file the scanner could not judge: the refusal is
  shown to the merchant in Arabic, and the platform holds an operational record
  of the outcome that carries neither the merchant's identity nor the file's
  name; no administrator is notified, because the administrator application
  carries no such surface (FR-034, FR-062).
- A page's departure never reaches the platform because the document closed
  before the request was sent: the abandoned session stays open and no outcome
  record claims a result until the deferred sweep closes it and records the
  cancellation (R3), because the start request's session is the platform's
  evidence that the submission exists (FR-062, SC-013).
- A file cannot be opened without a password — an encrypted PDF or an encrypted
  Word/Excel document: it is refused with its own cause before anything is kept,
  no quota is consumed, and the merchant can choose another file; it is not
  accepted to fail later in processing (FR-028, FR-030).
- A file matches its declared format at the byte level but is corrupt or
  truncated and cannot be opened: it is refused with its own cause, «ملف تالف لا
  يمكن فتحه», nothing is retained, no catalog is created, and no quota is
  consumed; the merchant chooses another file, and a retry of the same file is
  not offered (FR-027, FR-028, FR-030, FR-049).
- A Word document is renamed with the `.xls` extension, or an Excel workbook with
  the `.docx` extension: it is refused as a content mismatch, because the check
  opens the container and identifies the document inside, not only the container's
  signature (FR-027, AC-006).
- A container opens but holds no document of the declared type: it is refused as a
  content mismatch, not as a corrupt file (FR-027).
- The antivirus scan cannot run: the upload is refused rather than kept unscanned,
  and the refusal offers a retry of the same file without re-selection and a way
  to choose another file; an
  infected file, an expansion-cap failure, or a content mismatch offers choosing
  another file, not a retry (FR-033, FR-049, AC-018, AC-020).
- The antivirus scan does not return a verdict within the platform's time
  budget: it is treated as a scan that could not run, so the upload is refused,
  nothing is kept, no quota is consumed, and the retry re-sends the same file
  without re-selection (FR-033, FR-049).
- The content check, the decoded-size cap's read, the sanitizer, or the reopen
  does not finish within its own time budget: the file is refused as the cause
  that stage produces — the corrupt-or-unreadable cause for the content check and
  for the cap's read, because the file was not read far enough to be measured and
  nothing was shown to cross the cap, the sanitization-failed cause for the
  sanitizer or the reopen — and no new cause enters the closed set (FR-029,
  FR-031, FR-032, FR-064).
- A file's executable content cannot be removed — a document macro the stripper
  cannot remove, a PDF JavaScript, action, embedded file, or form script it cannot
  remove, or an Office embedded object or attached file that can carry executable
  content and cannot be removed: it is refused with the
  sanitization-failed cause, nothing is kept, no catalog is created, no quota is
  consumed, and the merchant chooses another file; a retry of the same file is not
  offered because a retry cannot change the cause (FR-028, FR-030, FR-032, FR-049).
- A sanitized file no longer opens as its declared format after its executable
  content is removed: it is refused with the sanitization-failed cause, so no
  accepted catalog is one the pipeline cannot read (FR-030, FR-032).
- A file opens as its declared format but cannot be rewritten — its permissions
  forbid the write, or its owner protection carries no user password: it is
  refused with the sanitization-failed cause, because the executable content
  cannot be guaranteed removed from a document that cannot be rewritten and the
  sanitized file cannot be guaranteed to reopen; nothing is kept, no catalog is
  created, no quota is consumed, and no retry of the same file is offered
  (FR-030, FR-032, FR-049).
- An Office document carries an embedded object that cannot execute — an embedded
  chart or an image: it is kept, because it is not executable content (FR-032).
- An Office document carries an external link: it is removed with the parts it
  references, because a link that makes the reader fetch a resource from outside
  the document can leak data, track the reader, or lead them to a hostile
  destination; a link that cannot be removed is refused with the
  sanitization-failed cause (FR-032, AC-017).
- A PDF's compressed streams expand beyond the decoded-size cap: it is refused as
  an expansion-cap failure, exactly as an Office archive is, because the cap
  measures what every inspected file decodes to (FR-031).
- A merchant sends more attempts than the platform's bound in its window: the
  attempt is refused before any byte is transferred with its own cause and the
  wait, nothing is retained, no catalog is created, no quota is consumed, and the
  error state replaces the selected-file card; the page keeps the file it holds
  so the retry re-sends that same file once the wait has passed, without the
  merchant choosing it again, and that hold lasts as long as the page does — a
  reload discards the file, returns the page to its choosing state, and requires a
  new selection, while the counter and the window stand (FR-061); a file-level
  refusal decided before the upload starts and a limit refusal decided at the
  pre-sign check are not attempts, while a file-level refusal decided at the
  completion of an upload that started
  is reached by a submission the counter already counted, and a retry refused for
  the bound is not a new attempt and does not extend the wait (FR-028, FR-049,
  FR-061).
- The page's own timeout fires after the platform has accepted the file: the
  acceptance stands — one catalog is created, the monthly count and the active
  slot are consumed once, and the record is visible in My Files — and the retry
  the error state offers re-sends the same file, whose hash meets that catalog,
  so it receives the duplicate outcome naming it, with no second catalog and no
  quota consumed; when that acceptance exhausted a limit, the retry is refused
  for that limit before any byte is transferred and the quota-exceeded state is
  shown instead (FR-013, FR-043, FR-049, FR-050, AC-021).
- A part write reports no progress for the plan's stall bound: the page stops
  that part's request and shows the transfer-failure error state with its retry
  and «اختيار ملف آخر», while the held file stays for the retry; nothing is
  recorded as a cancel, and «إلغاء» and a departure remain the merchant's own
  controls (FR-048, FR-049, FR-050).
- An upload's screening runs past a minute: the page keeps the same two progress
  presentations — the determinate transfer and then the indeterminate «يجري فحص
  الملف» — with no percentage, no elapsed-time count, no second announcement, and
  no separate slow-upload panel, and the outcome or FR-049's error state replaces
  the phase when the work settles; a stage over its budget is answered as that
  stage's own cause (FR-048, FR-049).

## Requirements *(mandatory)*

The requirements below are the intake slice's whole product behaviour. This slice
uploads and keeps one supplier catalog: it validates the file, screens it, keeps
it, computes its content hash, rejects a duplicate, records the catalog's status,
enforces the merchant's upload quotas, and ships the Upload Catalog page. It does
not extract parts, list or delete files, retry a failed processing job, or manage
a supplier; those belong to R3, R4, and R16. The page it ships is the registered
twenty-eighth page, and the entity it creates is the registered `Catalog`.

### Functional Requirements

**The page and the way in**

- **FR-001**: The platform MUST provide the Upload Catalog page at the route
  `/upload`, registered as the product's twenty-eighth page, and MUST present it
  inside the shared shell (ADR-126).
- **FR-002**: The page MUST be available only to a signed-in merchant whose
  account is active. No guest, blocked account, or administrator session MUST
  reach the intake through it. An administrator session MUST be treated as a guest
  at the merchant area's door: it is taken to the merchant sign-in page, whose
  uniform refusal refuses an administrator account (R1's rule), so no
  administrator state is added to this page and the administrator's full
  privileges stay in the administrator application.
- **FR-003**: A guest who opens `/upload`, or who activates Upload Catalog from
  the sidebar's item, the bottom bar's slot, or the drawer, MUST be taken to the
  sign-in page, with the item present and enabled (ADR-100). After signing in,
  the merchant MUST arrive at `/upload`. The sign-in MUST return the merchant
  only to the internal destination the guest asked for, after validating it
  against the registered routes; the slice "registers" `/upload` by proving that
  internal return target — the requested destination is validated against the
  registered routes and the merchant is returned to it — not by adding a route
  to the shared route map, which already carries `/upload` (R1 registered it)
  and which this slice reads without editing; a later slice proves its own
  destination the same way without amending this rule, and no external or
  unknown target MUST be accepted as a return target — a target that fails the
  check lands on `/upload`.
- **FR-004**: When the session has ended, the page MUST show the in-shell
  ended-session state with the way to sign in again; when the account is blocked,
  the state MUST plainly say so (R1's rule). The state MUST replace whatever the
  page was showing, including a transfer in progress, and MUST offer no retry,
  because ADR-100 requires the state a session's end produces rather than an
  unrelated error. What the transfer leaves and what is carried through are
  FR-050's, and this requirement restates neither of them
  (Clarifications 2026-11-14 (5)).
- **FR-005**: The page MUST carry the heading «رفع كتالوج» and the subtitle «ملف
  مورد واحد: Excel أو PDF أو Word حتى 100 MB. المعالجة تبدأ تلقائيا.» The
  format-and-size line MUST sit under the upload action and read «Excel (xls،
  xlsx) · PDF · Word (doc، docx) — حتى 100 MB».
- **FR-006**: The page MUST compose its blocks in this order: the page header; the
  quota state; the upload control; the selected-file card; the progress state;
  the duplicate outcome; the success state; the error state. The upload control
  MUST be a drop area on a fine pointer and the single 56 px action «رفع ملف» on a
  coarse pointer; both MUST open the file picker and MUST be operable from the
  keyboard. The quota-exceeded and loading states are presentations of the quota
  block, and the upload area carries one of the upload control, the selected-file
  card with the progress state, an outcome, or — while a limit is exhausted and
  no outcome is displayed — no block at all (FR-017), at a time; every state
  MUST replace its block in place without navigating away from the page. When a
  state replaces the block that held focus, focus MUST move to the
  state now shown — its heading, made focusable programmatically for that
  purpose, or its first action when it carries no heading — and MUST NOT remain
  on a control the previous state carried; an outcome's «رفع آخر» or «اختيار
  ملف آخر» MUST return focus to the upload control. The upload control is the
  page's choosing state: once a file is chosen, the selected-file card and the
  progress state take its place, with the card staying visible and the progress
  state beneath it through the transfer and the screening phase, and an outcome
  replaces both; the outcome's own «رفع آخر» or «اختيار ملف آخر» action is what
  returns the page to the control, so the control MUST NOT be offered
  beside an outcome or while a file is in flight, and the quota-exceeded state
  withholds it until a re-read lands under both limits (FR-017).
- **FR-007**: The page MUST be the destination of the shell's Upload Catalog item,
  MUST be the page My Files' way to the intake links to, and the catalog record
  it creates MUST live in My Files.
- **FR-008**: Every file name the page shows MUST read as one continuous name
  whose Arabic text runs right-to-left and whose Latin extension runs left-to-
  right, through the page's file-name surface, with no reordered punctuation and
  no mirrored extension. A name that carries no Arabic text MUST be shown as one
  left-to-right run, isolated from the surrounding right-to-left text, so it reads
  in its own order and its dot and extension are neither reordered nor mirrored:
  `catalog.xlsx` reads as supplied. The rule that the stem runs right-to-left
  applies only when the stem carries Arabic, and the whole name stays in the
  markup and as the accessible name (FR-058).
- **FR-009**: The page MUST show only the calling merchant's quota state and the
  names of the calling merchant's own files; it MUST NOT expose another
  merchant's record. The one exception is the original a duplicate outcome
  names under FR-044: that outcome MUST show the original's name, its upload
  date, its processing status, and the identifier its parts link needs, and
  MUST expose no other field of the original and no other record of its owner.
  That read is the one registered exception to the platform's merchant-isolation
  rule, and no other read of another merchant's record is permitted
  (Clarifications 2026-11-13 (5)).

**The quota state**

- **FR-010**: The page MUST show the merchant's monthly usage and its limit, and
  the active usage and its limit, each as a used value and a limit in Latin
  digits (FR-063), with the limits taken from the merchant's effective limits. The block's
  caption MUST read «حصة الشهر الميلادي، والحد النشط يشمل الملفات المخزنة غير
  المحذوفة.»
- **FR-011**: The monthly count MUST be the number of accepted uploads in the
  current calendar month in the platform's local time (Libya), and MUST be kept
  in a persisted per-merchant counter that is separate from the catalog row and
  keyed to the calendar month, incremented atomically at acceptance. The
  catalog's upload timestamp and the counter's month key MUST come from one
  instant, read once at that acceptance: the timestamp is written from that
  instant rather than left to a storage default, and the month key is derived
  from the same value, so the month the counter increments and the month the
  timestamp falls in are never two different months and no second clock reading
  can separate them. Deleting a file, a duplicate, a refused upload, or a failed
  transfer MUST NOT change it, and a soft-deleted catalog MUST NOT be read to
  compute it (Clarifications 2026-11-13 (2), 2026-11-14 (3)).
- **FR-012**: The active count MUST be the number of catalogs whose kept file is
  retained and that are not deleted, including files still processing and failed
  files, because their bytes are retained. A duplicate, a refused upload, a
  failed transfer, and a soft-deleted catalog MUST NOT count. A deleted catalog
  does not count whatever the state of its stored file, because the delete
  leaves that file in place until the retention job removes the row for good
  (FR-046).
- **FR-013**: The platform MUST enforce both limits on the server for every
  upload; a client-side check alone MUST NOT be sufficient. An upload that would
  exceed either limit MUST be refused for that limit, before any byte is
  transferred when the excess is known at the start, and MUST NOT be reported as
  a duplicate in that case. At acceptance, a file whose hash matches a retained
  catalog receives the duplicate outcome and consumes no quota (FR-043, FR-045);
  otherwise the atomic quota check decides, and an upload that loses a race is
  refused for the limit (FR-014). A file-level refusal (FR-021–FR-024) is decided
  before the limit's, so a file that fails one is refused for its own cause even
  when a limit is exhausted, and consumes no quota.
- **FR-014**: The quota checks MUST be atomic. When a merchant has one slot left
  and two uploads in flight, at most one MUST be accepted.
- **FR-015**: The quota state MUST show a loading state while it is being read and
  MUST refresh after every outcome without a page reload. It MUST also be re-read
  when the page becomes visible again and when the calendar month changes while
  the page is open; the quota-exceeded state MUST carry a «تحديث» control that
  re-reads the counts. A re-read that lands under both limits restores the upload
  control when the page is in the choosing state and restores an outcome's
  withheld actions when an outcome is shown, and one that lands at or above a
  limit keeps the quota-exceeded state.
  One case alone withholds the upload control while the page is in its choosing
  state, and it is not this requirement's: a verified exhausted state — entered by
  a successful read at or
  above either limit or by a limit refusal — withholds it, and it stays withheld
  through a re-read that fails, because no successful read has released the
  limit; FR-017 fixes that state and this requirement refers to it rather than
  denying it.
  While the state is being
  read, the loading state MUST stay inside the quota block and the upload control
  MUST stay available, because the server enforces both limits (FR-013), unless
  the page holds that verified exhausted state (FR-017). When the
  read fails, the block MUST show an inline failure with a retry of the read, MUST
  state that the counts are unavailable, and MUST NOT show a count it cannot
  verify; the upload control stays available for the same reason, subject to the
  same exception (FR-017). A read that has not settled within the plan's bound —
  five seconds from its dispatch — MUST count as a failed read: the page stops
  the request and shows that same inline failure and retry, so the loading state
  never outlasts the bound, and the page MUST make no automatic retry, so a read
  is tried again only by the retry control or by one of the invalidation events
  this requirement names. A timed-out re-read in the quota-exceeded state is that
  state's failed re-read: the numbers hide and the exhausted content and the
  retry stay (FR-017). In the
  quota-exceeded state, a failed re-read MUST hide the used and limit numbers,
  because the page shows no count it cannot verify, and MUST show the inline
  failure and its retry. Everything else about that state — the exhausted
  content (the limit or limits, how each is released, and «تحديث»), the withheld
  upload control, and what restores it — is FR-017's, and this requirement
  restates none of it (FR-017).
- **FR-016**: A refusal caused by a limit MUST be shown in the quota-exceeded
  state (FR-017), not in the error state. The state's name and its content are
  FR-017's alone, and this requirement quotes them without restating either.
  The selected file is not retained, and the merchant chooses again after a
  re-read lands under both limits (FR-017) (Clarifications 2026-11-14 (5)).
- **FR-017**: While either limit is exhausted, the page MUST NOT offer a way to
  submit a file; it MUST show the quota-exceeded state and keep the rest of the
  page usable. When no outcome is displayed — on load with a limit exhausted, or
  when a limit refusal replaces the progress state — the upload area MUST carry no
  block at all: neither the upload control, the selected-file card, nor the
  progress state, because nothing may be submitted and the exhausted content is
  the quota block's alone; the control returns to that empty area in place when a
  re-read lands under both limits (FR-006, FR-015). A limit refusal is shown in
  this state alone, and no «اختيار ملف آخر» action is offered while the limit
  stays exhausted (FR-016); an outcome shown beside this state keeps its content
  and withholds that action too, by the rule below (FR-049). This
  requirement is the single place where the quota-exceeded state is named and its
  content is fixed: it MUST name the exhausted limit or limits — the monthly
  first and then the active — state how each is released (the monthly limit
  resets at the start of the next calendar month, and the active limit is
  released by deleting a file or by the 90-day retention), name only the one
  that is exhausted when only one is, and carry the «تحديث» control (FR-015),
  including when the page shows it on load with no upload attempted. The
  quota-exceeded content is shown inside the quota block; when an outcome is
  displayed, the outcome stays in the upload area with its content and the quota
  block carries the exhausted content, so the outcome is not dismissed and the
  exhausted content is not repeated elsewhere (FR-006). The rule
  binds every outcome state: a success, duplicate, or error
  outcome MUST keep its content but MUST withhold its two actions — the submit
  action («رفع آخر» or the retry) and the «اختيار ملف آخر» action — and MUST NOT
  withhold any other link it carries, the «ملفاتي» link a duplicate outcome shows
  for a `failed` original included (FR-044), while
  the refreshed quota state shows an exhausted limit, including when that
  state's re-read fails, because no successful read has released the limit
  (FR-044, FR-047, FR-049, FR-015); when a re-read lands under both limits, both
  withheld actions return to that outcome in place, without a page reload, and
  the page does not return to the choosing state until the merchant activates
  one of them (FR-015). Every
  other place — requirement or criterion — that mentions the quota-exceeded state
  quotes this requirement and restates none of its content (FR-015, FR-016,
  FR-019, FR-028, FR-044, FR-047, FR-049, AC-012, AC-020, AC-029, AC-047,
  AC-048, AC-049).
- **FR-018**: The effective limits MUST be the platform defaults — 50 per calendar
  month and 300 active files — unless the merchant holds an administrator-granted
  override, which MUST NOT exceed 500 per calendar month and 1,500 active files
  (ADR-118). The page MUST display the effective limits, not the defaults.
- **FR-019**: A quota lowered below the merchant's current usage MUST block new
  uploads until usage is under the limit and MUST NOT delete a file. The lowering
  reaches forward only: it deletes no file, withdraws no stored file, and does not
  withdraw an upload accepted before it takes effect, so a merchant whose usage
  the lowered limit no longer covers keeps every catalog they hold and is blocked
  from the next one. An upload already in flight when the lowering takes effect
  MUST be judged by the acceptance treatment every acceptance uses (FR-013,
  FR-014), because it is decided at its acceptance and not at its start. **The
  duplicate check comes before the limit's judgment at that acceptance**: a file
  whose content hash matches a retained catalog receives the duplicate outcome and
  consumes no quota, and the lowered limit is never judged against it — the
  lowering does not turn a duplicate into a limit refusal (FR-043, FR-045). Only a
  file that is not a duplicate is judged against the lowered limit: when the
  lowered limit leaves no room, it MUST be refused for that limit — the monthly
  first and then the active when both are exhausted — and shown in the
  quota-exceeded state (FR-016, FR-017), not the error state, because the file
  passed every check of its own and the limit is what refused it, with nothing
  retained, no catalog created, and no quota consumed; the progress state the page
  was showing is replaced, because the refusal is shown in the quota block alone
  (FR-017); when room remains, the ordinary acceptance rules decide (FR-014)
  (Clarifications 2026-11-14, Clarifications 2026-11-16).

**Choosing and validating a file**

- **FR-020**: One upload MUST carry exactly one file, and one open Upload Catalog
  page (tab) MUST carry one upload at a time; the page MUST NOT offer a multi-file
  selection, and the upload control MUST be unavailable while a file is in flight.
  When several files are dropped at once, the first file in the drop's order MUST
  be the one started, and the page MUST state in a message shown for that drop
  alone — not in the page's standing composition — that one file is uploaded per
  submission and the other files were not started.
  The rule is the page's, not the account's: two devices MAY upload at the same
  moment, and the atomic quota (FR-014) and duplicate (FR-045) rules resolve that
  race; no per-account lock MAY refuse the second device.
- **FR-021**: The allowed formats MUST be Excel (`.xls`, `.xlsx`), PDF (`.pdf`),
  and Word (`.doc`, `.docx`). A file whose name carries no allowed extension MUST
  be refused before any transfer, with a message naming the supported formats.
  An empty name is not this refusal: there is no name whose last suffix could be
  read, so the invalid-name rule below settles it first (FR-026, FR-028).
  The extension is the name's last suffix — the text after its final dot — and
  MUST be compared without regard to letter case, with only the ASCII letters
  `A`–`Z` folded to `a`–`z` and no other character folded: an upper-case
  extension is accepted, and a name carrying more than one suffix is judged by
  its last one, so `catalog.pdf.exe` is refused for its format. The suffix is compared exactly
  as it stands and MUST NOT be trimmed: a name whose last suffix is empty
  because it ends with a dot (`catalog.`) carries no allowed extension and MUST
  be refused for its format; a name whose suffix a space surrounds
  (`catalog. xlsx`, `catalog.xlsx `) carries a suffix that matches no allowed
  extension and MUST be refused for its format; and a name that is itself an
  allowed suffix (`.xlsx`) MUST be accepted for validation. None of these is the
  invalid-name refusal below, because a trailing dot and a space are not among
  the characters this requirement refuses. A file whose name is empty MUST be
  refused before any transfer with the invalid-name cause, because the platform
  has no name to read, preserve, or show; only a crafted client can send one,
  because the page's picker and drop carry the browser's file name, which is
  never empty, so the page's own name check never meets it and the cause reaches
  the page through the server's re-check (FR-026). A file whose name carries a
  bidirectional override or isolate control character (U+202A–U+202E,
  U+2066–U+2069), an invisible direction mark (U+061C, U+200E, U+200F), a
  zero-width or byte-order character (U+200B, U+FEFF), another control character
  (U+0000–U+001F, U+007F–U+009F), a line or paragraph separator (U+2028,
  U+2029), or a path separator (a slash or a backslash)
  MUST be refused before any transfer
  with its own message, because an accepted name is shown to the merchant and, in
  duplicate outcome, the original's name is shown to the
  caller: a name that can be reordered, hidden, or broken across lines can
  misrepresent the file. The two separators are not control characters — they
  are the Unicode line separator and the paragraph separator — and are refused
  because each forces a line break inside a name the platform displays, in the
  selected-file card whose name stays on one line and in the duplicate outcome
  that names the original. A file whose name is longer than 255 UTF-16 code units MUST be refused
  before any transfer with the same invalid-name cause, because the record
  preserves the name exactly as supplied (FR-036) and a longer name is not one a
  browser supplies from a file system; the unit is the one a browser reports for a
  file name and the one both the page's and the server's name check use, so a name
  of 255 units is accepted and one of 256 is refused. A name carrying an emoji or
  another pictograph
  MUST NOT be refused for that reason, and MUST be preserved exactly as supplied,
  because the no-emoji rule binds the text the platform writes (FR-063) and not a
  value the merchant supplies (FR-008). The two joiners (U+200C, U+200D) MUST NOT be refused
  for that reason either, because an Arabic-script name or an emoji sequence may
  carry them. A name refused under this rule MUST NOT be rendered in the
  error state's message; the neutral label «ملف
  باسم غير صالح» is shown instead, and no selected-file card is shown for the
  refusal. The rule MUST be enforced on the server as well as in
  the page, so a name that bypasses the page's check is refused with the same
  cause before any byte is retained (FR-026).
- **FR-022**: The maximum file size MUST be 100 MB; a file larger MUST be refused
  before any transfer.
- **FR-023**: A file of exactly 100 MB MUST be accepted for validation, and a file
  one byte larger MUST be refused.
- **FR-024**: An empty file MUST be refused.
- **FR-025**: Choosing a file — by the file picker or by dropping it on the page —
  MUST begin its validation and upload without a second confirmation. The
  selected-file card MUST show the file's name, its size, and its format. A file
  refused under FR-021 does not reach the selected-file card: the error state
  replaces the card and its message shows the neutral label «ملف باسم غير صالح»,
  not the name (FR-028).
- **FR-026**: The platform MUST re-check the file's name (an empty name
  included), its format, its size, and the file's own emptiness (a zero-byte
  file) on the server before retaining any byte, in the fixed order
  of causes FR-028 states — the invalid name, the unsupported format, the size,
  then the file's emptiness — so a crafted client that bypasses the page's checks
  is refused with the same cause and the same neutral label. A
  refusal MUST retain nothing, create no catalog, and consume no quota.
  A request the platform cannot read as an upload — one that does not describe a
  start or a completion, that misses a field or carries one of the wrong kind, or
  whose completion is not a usable list of transferred parts — MUST be refused as
  an invalid request before any byte is retained and before the file-level checks
  above: nothing is retained, no catalog is created, and no quota is consumed,
  and FR-049's error state shows it. The invalid request is one of the five
  causes FR-064 counts beyond FR-028's list, not one of the file-level causes
  FR-028 fixes.
- **FR-027**: The platform MUST check the file's actual content against the
  declared format and MUST refuse a file whose content does not match, even when
  its name carries an allowed extension. The check MUST identify the document
  type the file actually is, not only the family of container it uses: the two
  legacy formats carry one leading signature and the two modern formats carry one
  archive signature, so the platform MUST open the container and confirm that the
  document inside is the declared type. A Word document named `.xls`, or an Excel
  workbook named `.docx`, is a content mismatch and MUST be refused; a container
  that opens but holds no document of the declared type is a content mismatch,
  not a corrupt file. A file whose signature matches the
  declared format but that cannot be opened as a document of that format because
  it is corrupt or truncated MUST be refused with its own cause (FR-028); it is
  not accepted to fail later in processing
  (Clarifications 2026-11-13 (7)).
- **FR-028**: Every refusal in the causes this requirement lists MUST state its
  own cause in Arabic — too large, empty,
  unsupported format, content mismatch, corrupt or unreadable, infected, expansion
  cap, sanitization failed, scan unavailable, password-protected, invalid name, or
  too many attempts — MUST keep the page usable, and MUST leave the merchant able
  to choose another file — unless the refreshed quota state shows an exhausted
  limit, in which case the quota-exceeded state withholds those actions — the
  retry where the cause offers one, and the way to choose another file — because
  the choosing state itself is suppressed
  while nothing may be submitted (FR-017, FR-049). A limit refusal is not one of these causes: it is shown
  in the quota-exceeded state (FR-016, FR-017), which withholds the upload control
  rather than offering another file until a re-read lands under both limits. A
  refusal decided before any transfer (FR-021–FR-024)
  MUST be shown in the same error state the post-transfer refusals use (FR-049),
  which replaces the selected-file card (FR-006) and carries the single
  «اختيار ملف آخر» action that returns the page to the upload control; a name
  refused for the invalid-name cause MUST NOT be rendered there, and the neutral
  label «ملف باسم غير صالح» is shown instead (FR-021). The too-many-attempts
  refusal is decided before any transfer as well and replaces the card the same
  way, but it is not one of FR-021–FR-024: the page keeps the file it holds for
  the retry, and the retry re-sends it without the merchant choosing it again
  (FR-061). When a file fails more than
  one file-level check, the reported cause MUST be the first in this fixed order —
  the invalid name (an empty name included), the unsupported format, the size,
  then the file's emptiness (a zero-byte file) — and the
  server MUST use the same order (FR-026), so the page and the server name one
  cause for one file. The error state's actions are FR-049's,
  which is the single statement of them for a scan-unavailable refusal, a
  too-many-attempts refusal, a transfer failure, and a storage failure (FR-061);
  this requirement fixes the causes, their order, and the surface the refusals
  share. These twelve causes are inside the closed set of causes that carry an
  Arabic message (FR-064), which fixes the set's count, the requirement that fixes
  each cause, and the coverage of the five causes this requirement does not list.

**Content safety**

- **FR-029**: Before any byte is retained, every file MUST pass, in this order:
  the content-format check (FR-027), an antivirus scan, the decoded-size cap's
  read of the original decode, macro stripping, the decoded-size cap's
  measurement of the sanitized decode, and the reopen FR-032 adds; a file that
  does not pass every step MUST NOT be kept (Clarifications 2026-11-13 (7)). The
  cap is measured twice — the original decode before the sanitizer and the
  sanitized decode after it — because the kept file is the sanitized one: the
  first read bounds what the platform inspected, and only the second measurement
  establishes that the bytes it keeps decode to under the cap, since the rewrite
  makes the output's decoded size a fact of its own and the 100 MB bound on that
  output is a compressed size that does not imply the decoded one
  (Clarifications 2026-11-17 (12)). Every step of this pipeline — each of the
  cap's two measurements and the reopen included — MUST finish within a time
  budget the
  plan records, and a step that exceeds its budget MUST NOT be left waiting: it
  is decided as the cause that step produces — the content-format check's budget
  exceeded and the first read's budget exceeded are the corrupt-or-unreadable
  cause (FR-027, FR-028, FR-031), because a file the check could not open, or one
  the cap could not read far enough to measure, is a file the platform could not
  read, while an expansion-cap failure is a file that was read and whose decoded
  content crossed the cap, the sanitizer's is the sanitization-failed cause
  (FR-032), and the scan's is the unavailable-scan cause FR-033 states — so no
  new cause enters the closed set FR-064 states and each budget stays a plan
  value (Clarifications 2026-11-17 (2)). The sanitized decode is measured as the
  sanitizer writes the kept bytes: the members and streams it writes are what is
  counted, and a retained member's decoded size is the one the first read
  confirmed, so the second measurement takes no read of its own and spends the
  sanitizer's budget: the plan's five timed budgets still sum to 115 seconds of
  the page's 120-second timeout, and the last 5 seconds are the room the
  completion, the
  kept object's write, the acceptance transaction, and the response have. A
  sanitized decode that crosses the cap is the expansion-cap cause, because the
  bytes the platform would keep are ones whose decoded content crosses it, and a
  second measurement that cannot finish inside the sanitizer's budget is the
  sanitization-failed cause, because the step that produces the kept bytes did
  not complete. The file MUST be
  scanned exactly once, before the sanitizer, and the sanitized file MUST NOT be
  scanned a second time: the sanitizer only removes content and keeps the rest,
  so the kept bytes are the scanned bytes minus what it removed, and the reopen
  as the declared format is what proves the kept file is a valid document of that
  format (FR-032). A second scan would add up to the scan's budget — 90 seconds in
  the plan's record — to a path whose stages already spend 115 seconds of
  the page's 120-second timeout (Clarifications 2026-11-17 (11)).
- **FR-030**: A file that fails any safety step MUST be refused; its bytes MUST
  NOT be retained, no catalog MUST be created, and no quota MUST be consumed.
  The removal happens as soon as the refusal is decided: the bytes written
  during the transfer are withdrawn at that point, no copy of a refused file is
  retained — in storage, in a quarantine area, or with a catalog record — and
  none is kept for later inspection, because the platform's own operational
  record (FR-062) serves the investigation a kept copy would serve. The
  withdrawal is complete and is part of deciding the refusal: whatever the
  transport has written for the refused file — every complete part and every
  unfinished part — is removed at the moment the refusal is decided, and nothing
  of it is left in storage — not a complete file and not a part of an unfinished
  one — so no orphan of the refused file survives the refusal (AC-015). The one
  case the withdrawal cannot settle is the storage's own refusal to remove a
  copy: the removal cannot then be confirmed, so the platform MUST show the
  storage failure with its retry (FR-049) and MUST NOT show the safety refusal,
  MUST keep the safety cause in the operational record (FR-062), MUST create no
  catalog and consume no quota, and MUST NOT claim that no copy remains while one
  survives; the safety refusal is reported as decided only once the removal is
  confirmed, and the deferred sweep completes the removal when the request
  cannot, with R3 as its owner and R3's acceptance as its review date. No refused
  file depends on a deferred cleanup for its ordinary path: the periodic sweep
  serves a request abandoned before any refusal and that one failed withdrawal,
  and neither a complete refused file nor any part of one is left to it
  otherwise. The plan and the feature's contracts are corrected in a following
  change to state that path.
  The same refusal applies to a file the platform cannot open without a password,
  because its content cannot be checked and its executable content cannot be
  removed. The sanitization step's own refusals — executable content that cannot
  be removed, a sanitized file that no longer opens, and a file that opens but
  cannot be rewritten — and the case of executable content that can be removed,
  are FR-032's.
- **FR-031**: The decoded-size cap MUST reject a file whose expanded content
  exceeds the cap the constitution fixes. It measures the
  content every inspected file decodes to, whatever its format: an Office
  document is an archive whose members are measured, and a PDF's compressed
  streams are measured the same way, so a small PDF that expands beyond the cap is
  refused as an expansion-cap failure exactly as an Office archive is
  (Clarifications 2026-11-13 (7)).
- **FR-032**: Macro stripping MUST remove every executable item from the document
  before the file is kept: in a PDF, its JavaScript, its automatic actions, its
  launch actions, its embedded files or attachments, and its XFA form scripts; in
  an Office document, its document macros and every embedded object or attached
  file that can carry executable content — an OLE2 compound embedding, an ActiveX
  control, or an embedded package such as a workbook or an archive. A document
  macro is every macro form the document
  carries — a VBA project macro and a legacy Excel 4.0 macro sheet (XLM) — so a
  document that carries a legacy macro sheet and no macro project at all still
  carries a document macro (Clarifications 2026-11-17 (3)). An Office document's
  external links MUST be removed
  together with the relationship that binds each of them to the document: a link
  that makes the reader fetch a resource from outside the document can leak data,
  track the reader, or lead them to a hostile destination, so it is a security
  risk even though it is not executable content, and the kept document carries
  none. An embedded object that cannot execute — an
  embedded chart or an image, for example — is not executable content and MUST be
  kept.
  The platform MUST keep only the sanitized file and MUST reopen it as its
  declared format before it is kept: the sanitized file MUST satisfy the same
  100 MB bound the upload did, so a sanitizer output larger than that bound is
  refused with the sanitization-failed cause and nothing is kept, because the
  platform keeps only a file its own size bound admits; a sanitized file that no
  longer opens as that
  format is refused with the sanitization-failed cause (FR-030), and a file whose
  executable content cannot be removed — a document macro, a PDF's JavaScript,
  action, embedded file, or form script, or an Office embedded object or attached
  file that can carry executable content — is refused the same way; so is an
  Office document whose external link cannot be removed. A file that opens as its
  declared format but cannot be rewritten — its permissions forbid the write, or
  its owner protection carries no user password — is refused with the
  sanitization-failed cause as well, because
  neither guarantee this requirement makes can be kept: the executable content
  cannot be guaranteed removed from a document that cannot be rewritten, and the
  sanitized file cannot be guaranteed to reopen when no sanitized copy can be
  written. A file whose executable content — and, in an Office document, whose
  external links — can be removed, including a PDF carrying embedded executable
  content, is sanitized and accepted; only a case that defeats the removal or the
  reopen is refused
  (FR-030, AC-017, Clarifications 2026-11-13 (7)).
- **FR-033**: The antivirus scan MUST be available for every upload. When it
  cannot run, the upload MUST be refused and the merchant MUST be told to try
  again later; an unscanned file MUST never be kept. A scan that does not return
  a verdict within the platform's time budget MUST be treated as a scan that
  could not run: the upload is refused, nothing is kept, no quota is consumed,
  and the retry of the same file is offered (FR-049). The budget is a plan
  value.
- **FR-034**: A safety refusal MUST be distinguishable in its message from a size
  or format refusal, and it MUST state that the file was not kept; the rule binds
  the platform's own text and is measured with the rest of it (FR-063).

**Storage and the record**

- **FR-035**: On an accepted upload, the platform MUST keep the sanitized file's
  bytes and create exactly one catalog record owned by the uploading merchant.
- **FR-036**: The catalog record MUST preserve the uploaded file's name, the kept
  file's byte count, the kept file's content type, and the upload timestamp. The
  byte count and the content type settle open fact #9; the name is the field the
  duplicate outcome and My Files require.
- **FR-037**: The catalog record's status MUST be set to `uploaded` by the intake
  and MUST take exactly one of `uploaded`, `processing`, `completed`, `failed`;
  every value after `uploaded` is the processing pipeline's (R3).
- **FR-038**: The intake MUST NOT set the supplier, the issue date, the expiry
  date, or the first-page metadata flag; those are R3's.
- **FR-039**: The upload timestamp is the point the 90-day retention counts from
  (ADR-131). Its recording — once, when the catalog is created, from the same
  instant the monthly counter's month key is derived from — is FR-011's, and this
  requirement restates none of it.
- **FR-040**: If keeping the file or creating the record fails after the safety
  checks, the platform MUST retain nothing, create no record, consume no quota,
  and offer a retry.

**Duplicate**

- **FR-041**: The platform MUST compute a content hash over the bytes it keeps.
  The comparison unit is one content hash — a single fingerprint over the whole
  of the kept bytes — so two files are the same file exactly when their hashes
  are equal, and the algorithm that produces that hash is a plan value
  (Clarifications 2026-11-14 (5)).
- **FR-042**: The platform MUST compare that hash with the hashes of the catalogs
  that are not deleted, platform-wide, not only within the merchant's own files.
  A catalog that is deleted is filtered out of the comparison whatever the state
  of its stored file, because a delete withdraws the parts, the bookmarks, and
  the search-index entries and leaves the stored file to the retention job
  (FR-046).
- **FR-043**: A match MUST be reported as a duplicate unless the upload is
  refused for a limit before the duplicate check (FR-013); it MUST create no
  catalog, MUST withdraw the bytes just kept, MUST NOT queue or process the file,
  and MUST NOT consume the monthly count or an active slot.
- **FR-044**: The duplicate outcome MUST name the original file, state its upload
  date, state the original's processing status, and carry a link to the parts
  that came from it at `/parts?file=<original id>`. The route is fixed here and
  R5 ships its page. The processing status MUST be shown in an Arabic label
  fixed here for each of the four status values — `uploaded` reads «تم الرفع»,
  `processing` reads «قيد المعالجة», `completed` reads «اكتمل», and `failed`
  reads «فشل» — and the raw registered value MUST NOT be shown to a merchant;
  this requirement is the single place those four labels are fixed, and every
  other place that shows a status quotes it: the contract carries them, and R4
  inherits this vocabulary rather than fixing a second one, because R2 is
  the first surface that shows a status to a merchant. The label fixed above
  for `processing` is the adopted term in the record's vocabulary, and no second
  phrasing of it exists. The Arabic mirror `Core-Project.txt` is subject to this
  vocabulary rather than to a second wording of it, and the amendment that brings
  the mirror to this wording is a separate manual change outside this slice's
  artifacts, which this specification makes no part of
  (Clarifications 2026-11-14 (4)). The status MUST be the
  original's value at the moment the duplicate is recognized — the moment the
  content hash matches a retained catalog (FR-043, FR-045) — and MUST NOT be a
  value read when the outcome is displayed: the platform captures it with the
  duplicate decision, and the page MUST render the captured value without
  re-reading the original's status, because the outcome reports what was
  recognized and a status that moves afterwards does not change it
  (Clarifications 2026-11-14). The upload date MUST be
  rendered in the Gregorian calendar with Latin digits, and the written pattern
  is a plan value in one shared date surface, so that every date the product
  shows a merchant reads one way. The outcome MUST also offer another upload,
  except where FR-017 withholds it. When the
  captured status is `failed`, the outcome MUST add a link to `/my-files`
  labelled «ملفاتي», where the retry lives, because re-sending the same bytes is
  a duplicate by rule and cannot resolve a failed original (R4 ships that
  page). The outcome
  MUST carry only the fields FR-009 permits, so that it exposes no other field
  of the original and no record of its owner. A link this
  outcome carries to a page that has not shipped yet MUST point at the
  registered route, and the platform's ordinary not-found answer appears there
  until the page ships; no placeholder page is added, because the register names
  none, and the window stays recorded as a roadmap defect
  (Clarifications 2026-11-13 (5)).
- **FR-045**: At most one catalog that is not deleted MUST exist for one content
  hash, including when two identical files are uploaded at the same time and both
  pass the quota check at the start (FR-013); the platform MUST resolve the race
  so one is accepted and the other receives the duplicate outcome naming the
  accepted original. The re-upload of a deleted predecessor is FR-046's.
- **FR-046**: A file whose identical predecessor has been deleted MUST be accepted
  as a new upload, because a deleted catalog is filtered out of the duplicate
  comparison whatever the state of its stored file (FR-042, FR-045). The delete
  withdraws the parts, the bookmarks, and the search-index entries; the stored
  file itself is removed with the row by the retention job, and its removal is
  R15's, not this slice's.

**The outcomes**

- **FR-047**: The success state MUST name the file, state that its record is in
  My Files, link to `/my-files`, and state that processing will begin
  automatically — its statement reads «تبدأ المعالجة تلقائيا», the wording this
  requirement fixes and the one the contract carries, and it names the record's
  own status vocabulary: the record rests at `uploaded` and the status the
  pipeline sets next is `processing`, whose label FR-044 fixes; the page MUST
  offer another upload after it, except where FR-017 withholds it. The link MUST
  point at the registered route, and the platform's ordinary not-found answer
  appears there until the page ships; no placeholder page is added, because the register names
  none, and the window stays recorded as a roadmap defect. The statement that
  processing will begin automatically describes the product's pipeline as the
  constitution's File Processing Overview states it, whose queue and worker are
  R3's; this slice creates no queue, enqueues nothing, and creates no
  notification, because the queue and the notification surface are R3's and R9's
  and the entity register names no notification here. In the R2-only increment the
  record rests at `uploaded`, and the plan records that window with R3 as its
  owner and a review date.
- **FR-048**: The progress state MUST show determinate progress during the
  transfer in Latin digits (FR-063), MUST carry a single «إلغاء» control that stops the
  transfer at once without a confirmation and returns the page to its choosing
  state, and MUST announce the start, the cancellation, and the outcome, not
  every percentage change. Once the transfer completes, the same state MUST show
  an indeterminate screening phase labelled «يجري فحص الملف» until the outcome
  replaces it, MUST announce that phase's start, and MUST withdraw «إلغاء» at
  that point, because the transfer it stops has finished and the bytes are
  complete (FR-050). That phase is the presentation for as long as the screening
  takes, an upload that passes a minute included: it MUST add no percentage, no
  elapsed-time count, no second announcement, and no separate slow-upload
  presentation, so the measured-presentation set stays closed at eleven (SC-008).
  A stage that overruns the plan's budget for it MUST be answered as that stage's
  own cause, and a screening the page's own timeout abandons MUST become
  FR-049's transfer failure, so the phase always ends in an outcome or an error
  state and never rests unanswered (FR-049).
- **FR-049**: A transfer failure, a storage failure, a scan that could not run, an
  attempt over the attempt bound (FR-061), or an invalid request (FR-026) MUST
  show an error state that states the cause and leaves nothing partial; for an
  attempt-bound refusal the state MUST also state the wait. For the four
  retryable causes — a transfer failure, a storage failure, a scan that could not
  run, and an attempt over the bound — that state MUST offer a retry that
  re-sends the same file without asking the merchant to choose it again, and MUST
  also offer a way to choose another file. FR-017's withholding rule applies to
  this state (FR-015, FR-017, AC-020, AC-049). An invalid request offers the
  way to choose a file again and no retry of the same file, because the platform
  never held one. A completion the platform cannot accept — the session is no
  longer open, the transferred parts do not match, or the stored size differs
  from the declared one — is its own cause and not a transfer failure: the
  platform answered, so the error state offers the way to choose another file and
  no retry of the same bytes, because a retry cannot change what the answer
  reported (FR-026, FR-050). The page's own timeout is this cause and not a
  completion the platform cannot accept: when the page gives up on work the
  platform had already settled, that settlement stands — the catalog is created,
  the monthly count and the active slot are consumed once, and the record is
  visible in My Files (FR-050) — and the retry this requirement offers is an
  ordinary submission of the same bytes, whose completion meets the hash of that
  catalog and receives FR-044's duplicate outcome, creating no second catalog
  and consuming no quota (FR-043); when that settlement exhausted a limit, FR-013
  refuses the retry for the limit before any byte is transferred, so the
  quota-exceeded state is shown instead of a duplicate report. No cause joins
  FR-064's set for the timeout, and the error state's text claims nothing about
  whether the file was kept, because no response reached the page. A part write
  that reports no progress for the plan's stall bound is the same cause and not a
  cancellation: the page stops that part's request and shows the error state with
  its retry, while «إلغاء» remains the merchant's own control and a departure
  remains FR-050's. A transfer
  the page cancelled or abandoned is
  neither of the two: it returns the page to its choosing state with no error
  state (FR-050). A safety refusal whose cause a retry cannot
  change — an infected file, a password-protected file, a corrupt file, an
  expansion-cap failure, a content mismatch, or a sanitization failure — MUST NOT
  offer a retry of the same file; it offers choosing another file (FR-028). A
  transfer that ends because the session
  ended or the account was blocked is not a transfer failure under this
  requirement: the ended-session or blocked state is shown instead (FR-004).
- **FR-050**: Navigating away during a transfer MUST cancel it, and the progress
  state's «إلغاء» control MUST do the same: no record, no quota, and no kept
  bytes remain, and the page returns to its choosing state. Once the transfer
  has completed, navigating away MUST NOT cancel the intake: the platform MUST
  carry the screening through, create the catalog when the file is accepted —
  consuming the quota and making the record visible in My Files — and retain
  nothing when the file is refused (FR-033, FR-043, FR-047). A session that ends,
  or an account that is blocked, is not a departure under this requirement: the
  ended-session or blocked state replaces the progress state at once (FR-004), a
  transfer that had not completed leaves nothing, and a transfer that had
  completed is carried through (Clarifications 2026-11-14 (5)).

**The shell at runtime**

- **FR-051**: The account menu MUST open at runtime, MUST dismiss on Escape and on
  an activation outside it, and MUST present «حسابي»، «إعدادات»، «تسجيل الخروج».
  Its sign-out confirmation MUST leave the session untouched on cancel and MUST
  end it on confirm.
- **FR-052**: Confirming sign-out MUST end the session and show the in-shell
  ended-session state with the way to sign in again.
- **FR-053**: The sidebar MUST be full at wide widths, MUST collapse to the icon
  rail and back, and below 1024 CSS px MUST be the drawer that only «المزيد»
  opens. The drawer MUST close on the collapse control, Escape, or an activation
  outside it, MUST return focus to «المزيد» on those three dismissals, and MUST
  close as part of an item's activation, with focus landing on the destination
  page's heading.
- **FR-054**: The bottom bar MUST hide after 32 CSS px of cumulative downward
  scroll and return on the first 16 CSS px upward or within 56 CSS px of the top;
  the transition MUST be 220 ms; a person's reduced-motion preference MUST keep
  it visible; scrolling inside the drawer MUST NOT count; the page MUST NOT
  reserve its height while it is hidden; and the raised search action MUST travel
  with the bar and leave the focus order and the accessibility tree while the bar
  is hidden (ADR-132).
- **FR-055**: The overlays MUST stack so that the open drawer is the topmost
  surface with its scrim over the header and the bar, the open account menu is the
  topmost surface, and the bar sits above the page's content and below either
  overlay. The drawer and the account menu MUST never be open together.
- **FR-056**: An activation outside an open overlay MUST close it and MUST perform
  nothing beneath it.
- **FR-057**: The drawer MUST move focus to its first focusable control when it
  opens and MUST contain focus within it until it closes.
- **FR-058**: At 320 CSS px, a shell label that does not fit MUST stay on one
  line, be cut at the inline-end with «…», and keep its whole text in the markup
  and as its accessible name; no shell surface and no part of this page MUST cause
  horizontal page scroll. The selected-file card's file name MUST follow the same
  rule whenever it does not fit, at any width: it MUST stay on one line, MUST be
  cut at the inline-end with «…», and MUST keep its whole text in the markup and
  as its accessible name, so the card's height does not change with the name's
  length and the whole name remains available to an assistive technology.
- **FR-059**: The page and its shell MUST pass an automated accessibility scan and
  a keyboard-only pass, including a complete upload without a pointer.
- **FR-060**: The shell MUST render the four static-page links — Contact, Privacy
  Policy, Terms of Use, FAQ — at the routes R1 fixed, in the footer band at the
  wide width and, below 1024 CSS px, at the bottom of the drawer; the static pages
  themselves are R11's.

**Attempt bounds**

- **FR-061**: The platform MUST bound how many upload attempts one merchant may
  make in a stated window, because a refused attempt consumes no quota and would
  otherwise be repeatable without limit. The bound MUST be enforced on the server
  before any byte is transferred, after the file-level checks (FR-021–FR-024) and
  a limit refusal (FR-013) decided at the pre-sign check, so a file the page
  refuses for its own cause and a merchant already at a limit are not reported as
  too many attempts and count as no attempt; a submission that reached the counter
  and was later refused for a limit at acceptance was already counted, and that
  count stands. The bound is inclusive: a submission that brings the merchant's
  count in the window to the bound is accepted as an attempt and reaches its own
  outcome, and only a submission that would exceed the bound in the same window is
  refused for the bound.
  Each submission that reaches this check counts as one attempt
  whatever its outcome — an accepted upload, a duplicate, a safety refusal, a
  transfer failure, a cancellation, or a retry — except a submission refused for
  the bound itself or for a limit at acceptance: one refused for the bound itself
  is refused without being counted and does not restart the wait, because the
  bound limits how often the merchant submits, not only how often a submission is
  refused, and one refused for a limit at acceptance was already counted and is
  not counted again. A file-level refusal decided at the completion of an upload
  does not release the attempt that upload counted: only a file-level refusal
  decided before the counter — at the upload's start, in FR-028's fixed order —
  counts as no attempt, and a completion the platform refuses for its own cause
  — an empty file, an over-limit file, or an incomplete completion — counts as
  one attempt exactly as a
  transfer failure does. An attempt over the bound MUST be refused with its own cause in
  Arabic that states the wait before another attempt is accepted; nothing MUST be
  retained, no catalog MUST be created, no quota MUST be consumed, and the page
  MUST keep the merchant's file available for the retry: the error state replaces
  the selected-file card as every outcome does (FR-006), and the page retains the
  file it holds so the retry re-sends that same file without the merchant choosing
  it again — "available" means available for the retry, not visible on the page.
  The retention is the page's memory and nothing more: the file is not persisted
  anywhere, so reloading the page discards it, returns the page to its choosing
  state, and requires the merchant to choose a file again; the reload MUST NOT
  reset the attempt counter and MUST NOT extend the window, because the bound is
  the merchant's and outlives the page (Clarifications 2026-11-14).
  The refusal MUST offer a retry that
  re-sends the same file without asking the merchant to choose it again (FR-049);
  a retry made before the wait elapses is refused again with the same cause and
  the remaining wait, which does not grow; the refused retry counts as no
  attempt (Clarifications 2026-11-13 (5), Clarifications 2026-11-13 (6)).
  The wait MUST be stated in whole seconds, rounded up, and MUST never be stated
  as zero: a remaining wait of less than one second is stated as one second, so a
  submission at or after the window's boundary is judged in the new window and is
  not refused with a zero wait.

**The attempt's trace**

- **FR-062**: The platform MUST record the outcome of every upload submission —
  an accepted upload, a duplicate, a refusal of any cause, a failed transfer, or
  a cancellation — in an operational record that carries neither the merchant's
  identity nor the file's name, so that a scanner that cannot run, a scan that
  never returns a verdict, and a surge of refusals are detectable by the
  platform's operators. The submissions FR-061 does not count as attempts are
  recorded too. A submission settles when the platform answers it; a submission
  whose page closed before its cancellation reached the platform is still a
  submission the platform knows of, because the upload session its start request
  created is the evidence of it, so the platform MUST record it as a cancellation
  when the deferred sweep closes its abandoned session, and until then the
  session stays open and no record claims an outcome it has not settled — the
  sweep's leg is R3's, with R3's acceptance as its review date. The record MUST
  carry the outcome, the cause of a refusal, and
  the time, and no value that identifies a merchant or a file: it MUST NOT carry
  the file's content hash, a
  pseudonymous per-merchant reference, or any other value that would link a
  submission to a file or to an account. The request's
  correlation identifier MUST accompany the record, as the constitution's logging
  rule requires of every log record a request produces, because it identifies a
  request and identifies neither a merchant nor a file: it is a request handle
  and not a merchant reference, and the prohibition above stands. A surge of
  refusals and a scanner that cannot run MUST be detectable from the counts by
  cause. The record MUST NOT be a page, an entity, or a state the
  merchant reaches, and no administrator MUST be notified of a refusal, because
  the administrator application carries no such surface and the Product Register
  names none (Clarifications 2026-11-13 (5), Clarifications 2026-11-13 (6)).

**The text this slice writes and owns**

- **FR-063**: Every text the platform writes and shows a merchant MUST be Arabic,
  MUST carry Latin numerals only, and MUST carry no emoji; a technical name that
  does not translate MAY appear inside it — `Excel`, `Word`, `PDF`, the
  extensions `xls`, `xlsx`, `doc`, and `docx`, and the unit `MB` — because
  Principle V permits it; an icon MUST be an SVG from the approved icon source,
  and an emoji glyph MUST NOT stand in for one (Principle V). The rule binds the
  text the platform writes — the page's headings and labels, the quota block's
  lines, the selected-file card's detail, the progress and screening labels, the
  outcomes' bodies, the refusal messages, and the announcements — and not a value
  the merchant supplies, so a file's name keeps the emoji or pictograph it
  carries (FR-021). **The reading rule for a Latin run.** A technical name, an
  extension, a unit, and the percentage the transfer shows MUST read as a run of
  their own inside the Arabic sentence, and not merely as a side effect of how
  the page is built, and three things MUST hold together. The sentence keeps the
  order its own string fixes, read from its start edge — the right — so the
  format-and-size line begins, at the right, with «Excel» and ends, at the left,
  with «حتى 100 MB». The run keeps its own order, read left to right, so a size
  reads «2.3 MB» with its unit after its number, a percentage reads «42%» with
  its sign after its digits, and an extension group reads «(xls، xlsx)» with
  neither bracket nor item moved. And the two orders never cross: no Latin
  letter, digit, sign, or bracket moves to the other side of a word, a separator,
  a bracket, or the dash that the Arabic sentence places around it. An assistive
  technology MUST read the Arabic in Arabic and the run in its own language, in
  the string's order: the format name, the extension, and the unit are voiced in
  English, while a numeral and the percentage's sign stay in Arabic, because a
  count belongs to the Arabic sentence and a technical name does not. The rule
  covers at least the format-and-size line (FR-005), the selected-file card's
  size, unit, and format label (FR-025), and the transfer's percentage (FR-048);
  a name the merchant supplies stays governed by FR-008 alone
  (Clarifications 2026-11-14 (7)). The safety refusals' distinctness from the size
  and format refusals is FR-034's, and this requirement restates none of it. This
  requirement is the reference that measures Principle V over this slice's texts:
  the acceptance criterion that measures the merchant-read text as one set cites
  it, and the contract's copy test measures the same set
  (Clarifications 2026-11-14 (4)).
- **FR-064**: The refusal causes that carry an Arabic message MUST form a closed
  set of seventeen, and every one of the seventeen MUST be fixed by a requirement
  this specification states: every cause in the set MUST carry exactly one Arabic
  message, and no cause this slice decides outside the set may reach a merchant
  as a refusal of a file or of a request. The set's twelve causes are the ones
  FR-028 lists — the invalid name (FR-021), the unsupported
  format (FR-021), the too-large file (FR-022, FR-023), the empty file
  (FR-024), the content mismatch (FR-027), the corrupt or unreadable file
  (FR-027), the infected file (FR-029, FR-030), the expansion-cap failure
  (FR-031), the sanitization failure (FR-030, FR-032), the unavailable scan
  (FR-033), the password-protected file (FR-030), and the too-many-attempts
  refusal (FR-061) —
  and the five causes FR-028 does not list are covered as follows: the monthly
  limit and the active limit by FR-016 and FR-017's quota-exceeded state, which
  names the limit and states how it is released; the storage failure by FR-040,
  which retains nothing and offers a retry, and by FR-030's failed withdrawal,
  which offers the same retry and leaves the removal to the sweep FR-030 names,
  with FR-049's error state; the
  incomplete completion — a completion the platform cannot accept because the
  session is no longer open, the parts do not match, or the stored size differs
  from the declared one — by FR-026's server re-check and FR-050's rule that a
  cancelled or abandoned transfer leaves nothing, with FR-049's error state,
  which offers another file and no retry of the same bytes; and the invalid
  request by FR-026's request-shape refusal,
  which retains nothing, creates no catalog, and consumes no quota, with FR-049's
  error state.
  Outside the set are the four answers the intake reuses from R1 — the
  ordinary not-found answer, the answer to a request that fails the platform's
  request-forgery check, the answer to a request body above the platform's
  request-size bound, and the platform's internal-error answer — which stay
  R1's, reach the merchant with R1's own text and R1's own retryable value as
  the contract records them, and add neither an eighteenth cause nor a new
  message (Clarifications 2026-11-15 (8)).
  The set stays closed because a cause enters it only by an amendment to this
  requirement and to the requirement that fixes the cause, made in one change
  (Clarifications 2026-11-14 (4)).
- **FR-065**: The text of this slice MUST have exactly one owner for every piece
  of it. This specification owns the product behaviour and the closed sets it
  fixes: the outcomes, the refusal causes and their count (FR-064), the four
  statuses' labels (FR-044), the Arabic phrases it fixes (FR-005, FR-047), and
  the rule that the platform's own text is Arabic with Latin numerals and no
  emoji (FR-063). The feature's UI contract owns the wording of every string the
  page renders, the page's states, and its focus and announcement rules. The plan
  owns every technical detail and states the obligations it holds in its own
  artifact, so that no requirement here restates what the plan owns. A piece of
  text owned by one of the three MUST NOT be owned by another, and a change to it
  is made in its owner's artifact alone
  (Principle VII, Clarifications 2026-11-14 (4)).

### Test Coverage Request *(mandatory)*

- **Unit tests (business rules)**: Requested — the quota rule's counting set
  (monthly window, active set, overrides, a lowered quota), the size and format
  boundaries and the extension's reading (an upper-case suffix, a name with more
  than one suffix, and the last suffix read exactly as it stands and never
  trimmed — `catalog.` carries an empty last suffix and is refused for its
  format, `catalog. xlsx` and `catalog.xlsx ` carry a suffix a space leaves
  unrecognised and are refused for their format, `.xlsx` is itself an allowed
  suffix and is accepted for validation, and none of the four is the
  invalid-name refusal), the fixed order of file-level causes (an empty name in the
  name's step, then format, size, and the file's own emptiness), the name-safety
  rule that refuses a bidi control or invisible
  direction mark, a zero-width character, another control character, a line or
  paragraph separator, or a path
  separator while accepting the joiners, the 255-unit name bound (255
  accepted, 256 refused), the rule that a supplied name keeps an emoji exactly as
  uploaded, the duplicate rule's retained-catalog set, the content check that
  tells a Word document from an Excel workbook inside one container family, the
  sanitized-file hashing rule and its re-open, the cap's measurement of a PDF's
  decoded streams, the intake's record fields, including the request's correlation
  identifier, the stage budgets' outcomes — the content check, the cap's read, the
  sanitizer, and the reopen each decided as its own cause when its budget is
  exceeded — and the
  attempt bound's counting
  set as FR-061 fixes it, the
  page's reload after a refusal over the attempt bound (the file the page holds
  lives in the page's memory with nothing persisted, so a reload discards it and
  returns the page to its choosing state and requires a new selection, while the
  attempt counter and its window stand and a submission before the wait elapses
  is refused again with the remaining wait), and the closed refusal-cause set's
  count and the one Arabic message each of its causes carries (FR-064).
- **Integration tests (module contracts)**: Requested — the intake path through
  validation, content safety, storage, hashing, the duplicate check, the record,
  and both quota checks; the atomic quota checks under concurrent uploads; the
  quota check before the duplicate check; the combined refusal when both limits
  are exhausted; the quota read failure; the server-side name refusal that a
  crafted client bypasses, an empty name among them; the fail-closed scan; the
  scan budget's expiry; the content check's budget expiry; the cap's read budget
  expiry; the corrupt-file refusal; one fail-closed case for each parser bound the
  format contract fixes — a package's central-directory entry count, the OLE2
  directory's entry count, the PDF's indirect-object count and its page-tree,
  `/Next`, and action depth, and an XML part's size — each answering the corrupt
  cause with nothing kept; the storage-failure rollback; the failed
  withdrawal of a refused file's bytes, which shows the
  storage failure and leaves the removal to the sweep; the retry's same-file
  resend, including the one that follows the page's own timeout, where the
  earlier acceptance stands and the second submission of the same bytes answers
  as the duplicate against the catalog that request created, with one catalog
  and one quota consumption; the session-end and blocked-account outcome for an intake that had
  completed its transfer; the cancel's abort; the abandoned session whose
  cancellation never reached the platform, which leaves no outcome record until
  the sweep closes it; the duplicate against a failed
  original; the duplicate race; the deletion of the original between the
  duplicate's recognition and its display; the original's processing status
  captured at the moment the duplicate is recognized and never re-read when the
  outcome is displayed (the outcome renders the captured value after the
  original's status has moved, and the page issues no second read of it); the
  attempt bound's refusal and the retry after
  the wait; the content check that tells a Word document from an Excel workbook
  inside one container family; the cap's measurement of a PDF's compressed
  streams; and the sanitization failure, including each executable item the
  clarification names — a PDF's JavaScript, action, embedded file, and form
  script, and an Office embedded object or attached file that can carry executable
  content — one that is removed,
  one that cannot be removed, an Office external link that is removed and one
  that cannot be removed, and a sanitized file that no longer opens as its
  declared format, and a file that opens as its declared format but cannot be
  rewritten — its permissions forbid the write, or its owner protection carries
  no user password — which is refused with the sanitization-failed cause, keeps
  nothing, and offers no retry of the same file; the attempt's
  operational record, which carries neither the merchant's identity nor the
  file's name; the removal of a refused file's bytes as soon as the refusal is
  decided.
- **End-to-end tests (user journeys)**: Requested — the five stories' journeys,
  in the segments their criteria keep: the accepted path, the safety
  refusals, the duplicate outcome, the quota boundaries, and the shell's
  runtime, including the automated accessibility scan, the
  keyboard-only pass on the rendered page, the focus movement where a state
  replaces the block holding the focus, the retry paths, the cancel path, the
  screening phase that follows the
  transfer, the departure after the transfer, the ended-session state in place of
  a transfer error, the failed-original duplicate outcome that points to My
  Files, the outcome that settles at the limit, the neutral label for a refused
  name, the quota read failure, the too-many-attempts outcome and its retry, and
  the quota re-read across the month boundary
  and on visibility; the link to a page that has not shipped yet, which reaches
  the registered route and the platform's ordinary not-found answer; and the
  merchant-read text as one set — every string the page's states render is
  Arabic apart from the technical names FR-063 permits, carries Latin numerals
  only, and carries no emoji, every Latin run reads by FR-063's reading rule —
  the sentence right-to-left, each run left-to-right, and the language an
  assistive technology uses for each — and the safety
  refusals' messages are distinguishable from the size and format refusals'
  messages (FR-063, FR-034, AC-020, AC-051).
- **Coverage target for changed production code**: at least 80% of changed lines.

### Key Entities *(include if the feature involves data)*

- **`Catalog`**: An uploaded supplier file as the merchant sees it — the record
  this slice creates, owned by the merchant who uploaded it, carrying its
  processing status and pointing at the file the platform keeps. Its supplier,
  issue-date, expiry-date, and first-page metadata are filled by R3, not here.
  This slice settles what the record carries at intake: the uploaded file's name,
  the kept file's byte count and content type (open fact #9), and the upload
  timestamp. It relates to exactly one uploading merchant and, after R3, to at
  most one supplier; it contains many parts, which this slice does not touch.
- **`User`**: The uploading merchant's account. This slice reads the account's
  status, which must be active, and its optional per-user upload-quota overrides
  (monthly and active), which raise the limits up to the ceiling; it writes none
  of the account's fields.
- **`Part`**: Named only as the destination of the duplicate outcome's link. This
  slice neither reads nor writes a part; R5 ships the Parts page the link opens.

## Acceptance Criteria *(mandatory)*

**The three observables of «no bytes, no catalog, and no quota».** A criterion
in this section that states that no bytes, no catalog, and no quota remain
asserts exactly these three observables, defined here once and referenced by
every criterion that uses the phrase: **no bytes** — the storage object list is
empty for the file, holding neither a complete file nor an unfinished part of
one, and the check covers both the object list and the list of the upload's
unfinished parts; **no catalog** — the «سجلات الكتالوج» count is unchanged from
its value before the attempt; **no quota** — the monthly counter's value
(FR-011) is unchanged from its value before the attempt.

A withdrawal the page could not deliver — the departure's request lost with the
document — is not a retained byte: no part of it can become a catalog, its
transfer grant expires, and the platform's periodic cleanup reclaims it. A
criterion therefore asserts the three observables for a withdrawal the platform
received, and the delivery is the sample's condition, not an assumption.

### The five stories' acceptance criteria

The criteria below are the five stories', grouped by the segment of the journey
each measures rather than by story, because one journey's segment can serve more
than one story. The segments are not stories. Every criterion keeps the number it
has always carried, no number is renumbered or reused, and each segment names the
story that owns its criteria: the accepted path (AC-001 – AC-014) and the text
the merchant reads (AC-051) are US1's; the screening segment (AC-015 – AC-020) is
US2's; the duplicate segment (AC-021 – AC-026) is US3's; the quota segments
(AC-027 – AC-034 and AC-047 – AC-050) are US4's, with AC-050's page side asserted
again in US1's journey; and the shell segment (AC-035 – AC-046) is US5's.

#### The accepted path (AC-001 – AC-014)

1. **AC-001**: **Given** a signed-in merchant with an active account opens
   `/upload`, **When** the page settles, **Then** it shows «رفع كتالوج» and its
   subtitle inside the shell, with the quota state, the upload control, and the
   remaining blocks in the order FR-006 fixes; the upload control is a drop area
   on a fine pointer and the single «رفع ملف» action on a coarse pointer;
   **And given** the merchant drops several files at once, **Then** only the first
   file in the drop's order is started and a transient notice states that one
   file is uploaded per submission and that the other files were not started,
   and the notice is no part of the page's standing composition; **And given** a
   file is in flight, **Then** the upload control is unavailable and no second
   file is started by a drop or by the picker, whose selection carries one file
   *(FR-001, FR-005, FR-006, FR-010, FR-020)*
2. **AC-002**: **Given** a guest opens `/upload` directly, **When** the page is
   requested, **Then** they are taken to the sign-in page and, after signing in,
   arrive at `/upload`; **And given** the sign-in is asked to return the merchant
   to an external or unknown target, **Then** that target is refused and the
   merchant lands on `/upload`; **And given** the session has ended, **Then** the
   in-shell ended-session state offers the way to sign in again, replaces a
   transfer in progress with no transfer error or retry; **And given** the
   account is blocked, **Then** the state plainly says the account is blocked;
   **And given** a live administrator session opens `/upload`, **Then** it is
   taken to the merchant sign-in page and the intake is not reached, with no
   administrator state shown on the page *(FR-002, FR-003, FR-004, FR-050)*
3. **AC-003**: **Given** a merchant chooses a valid 2 MB Excel file, **When** the
   upload begins and settles, **Then** the selected-file card shows its name,
   size, and format and stays visible with the progress state beneath it during
   the transfer and the screening phase; determinate progress in Latin digits
   shows during the transfer; when the transfer completes, the indeterminate
   «يجري فحص الملف» phase appears with «إلغاء» withdrawn until the outcome
   replaces both; the success state names the file, states that the record is
   in My Files, links to `/my-files`, and states that processing will begin
   automatically, with the upload control not offered beside it until «رفع آخر»
   returns the page to that control; and exactly one catalog exists, owned by the
   merchant, with status `uploaded`, the file's name, the kept file's byte count
   and content type, and the upload timestamp; **And** no queue job and no
   notification are created by the intake, because the queue and the
   notification surface are R3's and R9's; **And given** the work outlasts a
   minute, **Then** the page keeps the same two progress presentations — the
   determinate transfer and then the indeterminate «يجري فحص الملف» — with no
   percentage added to the screening, no elapsed-time count, no second
   announcement, and no separate slow-upload presentation, and the outcome or
   FR-049's error state replaces the phase when the work settles
   *(FR-006, FR-020, FR-025, FR-035,
   FR-036, FR-037, FR-047, FR-048)*
4. **AC-004**: **Given** a file of exactly 100 MB, **When** it is chosen,
   **Then** it is accepted for validation; **And given** a file one byte larger,
   **When** it is chosen, **Then** it is refused before any transfer with its own
   message, nothing is retained, no catalog is created, and no quota is consumed
   *(FR-022, FR-023, FR-026, FR-028)*
5. **AC-005**: **Given** a text file or a file whose name carries at least one
   character but no allowed
   extension, **When** it is chosen, **Then** the error state replaces the
   selected-file card with a message naming the supported formats, «اختيار ملف
   آخر» returns the page to the upload control, and the merchant can choose
   another file; **And given** a file named with an allowed extension whose name
   carries an invisible direction mark, a bidirectional override, a zero-width
   character, or a line or paragraph separator, **When** it is chosen, **Then** it
   is refused before any transfer with its own message, nothing is retained, and
   the page does not render the refused name: the error state's message shows
   «ملف باسم غير صالح» and no selected-file card is shown;
   **And given** a valid file whose name carries an emoji, **When** it is chosen,
   **Then** it is accepted and its record carries the name exactly as supplied,
   with the pictograph neither removed nor replaced; **And given** a file named
   `كتالوج.XLSX`, **Then** it is accepted for validation; **And given** a file
   named `catalog.pdf.exe`, **Then** it is refused for its format before any
   transfer; **And given** a file whose name is exactly 255 UTF-16 code units,
   **Then** it is accepted for validation; **And given** a name of 256 code
   units,
   **Then** it is refused before any transfer with the invalid-name message, and
   the error state's message shows «ملف باسم غير صالح»; no selected-file card is
   shown; **And given** a crafted client sends an empty name, **Then** the server
   refuses it with the same invalid-name cause before retaining any byte, the
   error state's message shows «ملف باسم غير صالح», no selected-file card is
   shown, and nothing is retained; **And given** a crafted
   client sends a name with a bidi control, a path separator, or more than 255
   code units, **Then** the server refuses it with the same invalid-name cause
   before retaining any byte, and nothing is retained *(FR-021, FR-026, FR-028,
   FR-036)*
6. **AC-006**: **Given** a PDF renamed with the `.xlsx` extension, **When** the
   platform checks its content, **Then** it is refused as a content mismatch,
   nothing is retained, no catalog is created, and no quota is consumed; **And
   given** a Word document renamed with the `.xls` extension, or an Excel workbook
   renamed with the `.docx` extension, **Then** it is refused as a content
   mismatch as well, because the check identifies the document inside the
   container and not only the container's signature; **And given** an archive
   that opens but holds no document of the declared type, **Then** it is refused
   as a content mismatch, not as a corrupt file; **And given** a file that is both
   a content mismatch and infected, **Then** the refusal is the content mismatch,
   because the content check precedes the scan in the order FR-029 fixes; **And
   given** the content check
   does not finish within its time budget, **Then** the file is refused with the
   corrupt-or-unreadable cause, because the platform could not read it within its
   bound *(FR-026, FR-027, FR-029, FR-030)*
7. **AC-007**: **Given** an empty file, **When** it is chosen, **Then** it is
   refused with its own message and nothing is retained *(FR-024, FR-028)*
8. **AC-008**: **Given** an accepted file, **When** its catalog is created,
   **Then** its status is `uploaded`, its supplier, issue date, expiry date, and
   first-page flag are unset, and the upload timestamp is recorded once
   *(FR-011, FR-037, FR-038, FR-039)*
9. **AC-009**: **Given** the transfer or the record's creation fails after the
   safety checks, **When** it settles, **Then** the error state names the cause
   and offers a retry that re-sends the same file without asking the merchant to
   choose it again, plus a way to choose another file, and nothing is retained,
   no catalog is created, and no quota is consumed; **And given** a part write
   reports no progress for the plan's stall bound, **Then** the page stops that
   part's request and the error state names the transfer failure with the retry
   and the way to choose another file, while the held file stays for the retry
   and the page does not return to its choosing state as a cancellation does
   (FR-048); **And given** a crafted client sends a request the platform
   cannot read as an upload — one that does not describe a start or a completion,
   misses a field, carries one of the wrong kind, or whose completion is not a
   usable list of transferred parts — **Then** it is refused as an invalid request
   before any byte is retained: nothing is retained, no catalog is created, and no
   quota is consumed; the error state offers the way to choose a file again and no
   retry of the same file, and its submission is the invalid-request case in
   SC-009's sample of seventeen causes *(FR-026, FR-040, FR-048, FR-049)*
10. **AC-010**: **Given** the merchant leaves the page during a transfer,
    **When** the transfer is interrupted, **Then** no bytes, no catalog, and no
    quota remain; **And given** the merchant activates «إلغاء» in the progress
    state, **Then** the transfer stops at once without a confirmation, the page
    returns to its choosing state, and no bytes, no catalog, and no quota remain
    *(the three observables, defined at the head of this section)*;
    **And given** the merchant leaves the page after the transfer has completed
    but before the outcome appears, **Then** the intake is not cancelled: an
    accepted file's catalog is created, the quota is consumed, and the record is
    visible in My Files, while a refused file leaves nothing; **And given** the
    session ends or the account is blocked during the transfer, **Then** the
    ended-session or blocked state replaces the progress state at once, with no
    transfer error and no retry, and nothing partial is retained; **And given**
    the session ends or the account is blocked after the transfer has completed,
    **Then** the intake is not cancelled: an accepted file's catalog is created,
    the quota is consumed, and the record is visible in My Files, while a refused
    file leaves nothing
    *(FR-004, FR-047, FR-048, FR-050)*
11. **AC-011**: **Given** a file whose name mixes Arabic and a Latin extension,
    **When** the name is shown in the card and in every message, **Then** it
    reads as one continuous name with the Arabic right-to-left and the extension
    isolated left-to-right, with no reordered punctuation; **And given** a name
    too long for the card's available width, **Then** it stays on one line, is
    cut at the inline-end with «…», keeps its whole text in the markup and as the
    accessible name, and the card's height does not change with the name's length
    *(FR-008, FR-058)*
12. **AC-012**: **Given** the quota state is still being read, **When** the page
    opens, **Then** a loading state appears inside the quota block without
    blocking the page or the upload control, and the quota state replaces it in
    place; **And given** the quota read fails,
    **Then** the quota block shows an inline failure with a retry and states that
    the counts are unavailable, while the upload control stays available and the
    server remains the authority; **And given** the read has not settled within
    the plan's five-second bound, **Then** the page stops it and shows that same
    inline failure and retry, the loading state ends at the bound, and no read is
    tried again automatically; **And given** the page stays open across the
    start of a calendar month, **Then** the quota state is re-read and the upload
    control returns only when that read lands under both limits; **And given** the
    quota-exceeded state, **Then** it carries a «تحديث» control that re-reads the
    counts, and a failed re-read hides the used and limit numbers, keeps the
    exhausted content and the withheld control, and shows the inline failure and
    its retry, with the control returning only after a read lands under both
    limits *(FR-013, FR-015, FR-017)*
13. **AC-013**: **Given** the merchant's own files and another merchant's files
    exist, **When** the page shows the quota state, **Then** only the caller's
    counts appear *(FR-009)*
14. **AC-014**: **Given** the shell's Upload Catalog item is activated, **When**
    it opens the page, **Then** the page is at `/upload`; **And given** an
    accepted upload, **Then** the success state's link points at `/my-files`,
    where the record lives (the page ships in R4); **And given** a link this page
    carries to a page that has not shipped yet, **Then** the link still points at
    the registered route, the platform's ordinary not-found answer appears there,
    and no placeholder page is shown — the not-found rule, stated here once,
    which every other criterion that names such a link follows
    *(FR-007, FR-047)*

#### The file is screened before it is kept (AC-015 – AC-020)

15. **AC-015**: **Given** a file carrying malware, **When** it is screened,
    **Then** it is refused with its own message, and once the withdrawal is
    confirmed no bytes, no catalog, and no quota remain *(the three observables,
    defined at the head of this section)*, and the merchant is told the file was
    not kept; **And** once the removal is confirmed no copy of the file remains in
    storage — neither a complete file nor an unfinished part of one — and nothing
    of it is left for later cleanup, because the deferred sweep serves only a
    request abandoned before any refusal and the storage-refused withdrawal the
    next clause names; **And given** the storage refuses the removal, **Then** the
    merchant sees the storage
    failure with its retry rather than the safety refusal, the safety cause is
    recorded, and no copy is reported as removed until the deferred sweep
    completes the removal
    *(FR-029, FR-030, FR-034, FR-040, FR-049)*
16. **AC-016**: **Given** an archive whose expanded content exceeds the
    decoded-size cap, **When** it is screened, **Then** it is refused as an
    expansion-cap failure and nothing is retained; **And given** a PDF whose
    compressed content expands beyond the cap, **Then** it is refused the same
    way, because the cap measures what every inspected file decodes to; **And
    given** an archive that is both past the decoded-size cap and carrying
    executable content, **Then** the refusal is the expansion-cap one, because the
    cap precedes the sanitizer in the order FR-029 fixes; **And given** a
    sanitized file whose decoded content would cross the cap, **Then** it is
    refused as an expansion-cap failure and nothing is kept, because the bytes the
    platform would keep are the ones measured; **And given** the sanitizer cannot
    finish that measurement inside its budget, **Then** the file is refused with
    the sanitization-failed cause, because the step that produces the kept bytes
    did not complete; **And
    given** the cap's read does not finish within its time budget, **Then** the
    file is refused with the corrupt-or-unreadable cause, because it was not read
    far enough to be measured and nothing was shown to cross the cap
    *(FR-029, FR-030, FR-031, FR-032)*
17. **AC-017**: **Given** a document carrying executable content — a document
    macro, a PDF's JavaScript, automatic action, launch action, embedded file, or
    XFA form script, or an Office embedded object or attached file that can
    execute — **When** it is accepted, **Then** the file the platform keeps carries
    none of it, the sanitized file still opens as its declared format, and the byte
    count and content hash are those of the kept file; **And given** an Office
    document carrying an external link, **When** it is accepted, **Then** the kept
    file carries no external link and none of the relationships that bind such a
    link to the document;
    **And given** an embedded
    object that cannot execute, **Then** it is kept, because it is not executable
    content; **And given** executable content that cannot be removed, an Office
    document whose external link cannot be removed, or a sanitized file that no
    longer opens as its declared format, **Then** the
    upload is refused with the sanitization-failed cause and nothing is kept;
    **And given** a sanitizer output larger than 100 MB, **Then** the upload is
    refused with the sanitization-failed cause and nothing is kept, because the
    platform keeps only a file its own size bound admits;
    **And given** the sanitizer or the reopen does not finish within its time
    budget, **Then** the upload is refused with the sanitization-failed cause the
    same way;
    **And given** a file that opens as its declared format but cannot be
    rewritten — its permissions forbid the write, or its owner protection
    carries no user password — **Then** it is refused with the
    sanitization-failed cause as well, because neither the removal nor the
    reopen can be guaranteed *(FR-029, FR-030, FR-032, FR-035, FR-036,
    FR-041)*
18. **AC-018**: **Given** the antivirus scan cannot run, **When** a file is
    chosen, **Then** the upload is refused, nothing is kept, and the merchant is
    told to try again later with a retry that re-sends the same file without
    re-selection, and with a way to choose another file; **And given** the scan does not return a verdict within the
    platform's time budget, **Then** it is treated the same way, no quota is
    consumed, and the same retry is offered; no unscanned file is kept
    *(FR-028, FR-030, FR-033, FR-049)*
19. **AC-019**: **Given** two files identical except for their macros, **When**
    both are uploaded, **Then** the second receives the duplicate outcome because
    the kept files are identical *(FR-032, FR-041, FR-042, FR-043)*
20. **AC-020**: **Given** a safety refusal that a retry cannot change — infected,
    password-protected, corrupt, expansion-cap, content mismatch, or
    sanitization-failed — **When** it
    settles, **Then** its
    message is distinguishable from a size or format refusal, states that the
    file was not kept, the merchant can choose another file, and no retry of the
    same file is offered; **And given** a file that is both infected and past the
    decoded-size cap, **Then** the refusal is the infected one, because the scan
    precedes the cap in the order FR-029 fixes; **And given** the refreshed quota
    state shows an
    exhausted limit, **Then** the outcome keeps its cause and offers neither the
    way to choose another file nor any other action, and the quota block is the
    merchant's only surface
    *(FR-017, FR-027, FR-028, FR-029, FR-030, FR-034, FR-049, FR-063,
    FR-064)*

#### A duplicate file is rejected by its content (AC-021 – AC-026)

21. **AC-021**: **Given** the same file is uploaded again while the merchant is
    under both limits, **When** its hash matches a retained catalog, **Then** the
    duplicate outcome names the original file, states its upload date in the
    Gregorian calendar with Latin digits and its
    processing status in the Arabic label FR-044 fixes — «تم الرفع»,
    «قيد المعالجة», «اكتمل», or «فشل» — never the raw registered value, links to
    its parts at `/parts?file=<original id>`, and
    offers another upload; no second catalog is created; the bytes just kept are
    withdrawn; and the file is not queued or processed; **And given** the
    original's status changes between the moment the duplicate is recognized and
    the moment the outcome is displayed, **Then** the outcome shows the status
    captured at the recognition and the page does not re-read the original's
    status to render it; **And given** the captured
    status is `failed`, **Then** the outcome states that status and
    adds a link to `/my-files` beside «رفع آخر», while the name, the upload date,
    and the parts link remain; **And given** the original catalog is deleted after
    the duplicate is recognised but before the outcome is shown, **Then** the
    outcome still names the original and carries its parts link, whose parts may be
    empty by then, and no second catalog is created and no quota is consumed
    (FR-042, FR-043, FR-044); **And given** the page's own timeout fires after
    the platform has accepted the file, **Then** that acceptance stands — one
    catalog, one monthly count, and one active slot — and the retry re-sends the
    same file as an ordinary submission whose hash meets that catalog, so it
    receives the duplicate outcome naming it, with no second catalog and no quota
    consumed; **And given** that acceptance exhausted a limit, **Then** the retry
    is refused for the limit before any byte is transferred and the quota-exceeded
    state is shown instead of a duplicate report (FR-013, FR-043); **And given**
    the parts page or My Files has not
    shipped yet, **Then** the links still point at the registered routes and the
    not-found rule AC-014 states applies to them — the platform's ordinary
    not-found answer and no placeholder page
    *(FR-041, FR-042, FR-043, FR-044, FR-049, FR-050)*
22. **AC-022**: **Given** a duplicate outcome, **When** it settles, **Then** the
    monthly count and the active count are unchanged *(FR-011, FR-012, FR-043)*
23. **AC-023**: **Given** two identical files are uploaded at the same moment by
    different merchants, **When** both settle, **Then** exactly one catalog
    exists and the other upload receives the duplicate outcome naming the
    accepted original *(FR-042, FR-045)*
24. **AC-024**: **Given** the original catalog has been deleted, **When** the
    same file is uploaded again, **Then** it is accepted as a new catalog,
    because a deleted catalog is filtered out of the duplicate comparison
    whatever the state of its stored file
    *(FR-012, FR-042, FR-045, FR-046)*
25. **AC-025**: **Given** a duplicate outcome whose original has not finished
    processing, **When** its parts link is followed in R2, **Then** the link
    points at the registered route `/parts?file=<original id>` and the not-found
    rule AC-014 states applies there, because R5 ships the parts page; R2 opens no
    parts, and the original's parts — possibly empty until its processing
    completes — open there only from R5's increment
    *(FR-044)*
26. **AC-026**: **Given** a duplicate of a file another merchant uploaded,
    **When** the outcome is shown, **Then** it names that original and links to
    its parts, and shows no other record of that merchant; **And given** the
    isolation test runs, **Then** the read of that original is the registered
    exception FR-009 names and is admitted as one, because it reads only the
    name, the upload date, the processing status, and the identifier the parts
    link needs, and the read is made once, at the moment the duplicate is
    recognized, so the status it carries is the one the outcome shows
    *(FR-009, FR-042, FR-044)*

#### The monthly and active quotas (AC-027 – AC-034)

27. **AC-027**: **Given** a merchant has 12 accepted uploads this calendar month
    and 34 active files, **When** the page loads, **Then** it shows «12 من 50» and
    «34 من 300» in Latin digits with the caption «حصة الشهر الميلادي، والحد النشط
    يشمل الملفات المخزنة غير المحذوفة.»; **And** the active count includes a
    file still processing and a failed file *(FR-010, FR-011, FR-012, FR-018)*
28. **AC-028**: **Given** the merchant holds an administrator override of 400 per
    month and 800 active, **When** the page loads, **Then** it shows 400 and 800,
    not the defaults; **And given** an override above the cap — more than 500 per
    calendar month or more than 1,500 active files — **Then** no such value is
    stored and the merchant's effective limits stay as they were, because
    FR-018's cap is not one an override may cross; that second clause is asserted
    by the write that sets an override alone, with no administrator screen,
    because this slice adds no administrator operation and the page only reads the
    effective limits, while the refusal an administrator would see belongs to the
    slice that ships that write *(FR-018)*
29. **AC-029**: **Given** 50 accepted uploads this calendar month, **When** the
    merchant tries another, **Then** the platform refuses it on the server, names
    the monthly limit, states that it resets at the start of the next calendar
    month, creates no catalog, and the page shows the quota-exceeded state — not
    the error state; the selected file is not retained, and no «اختيار ملف آخر»
    action is offered until a re-read lands under both limits;
    **And given** both limits are exhausted, **Then** the refusal names both, the
    monthly first and then the active, and states how each is released;
    **And given** the file is one the platform already holds, **Then** the refusal
    is the monthly-limit one, not the duplicate outcome, because the file is
    refused before the duplicate check; **And given** the file also fails a
    file-level check, **Then** the refusal names the file's own cause and consumes
    no quota
    *(FR-013, FR-016, FR-017, FR-021, FR-022, FR-024, FR-028)*
30. **AC-030**: **Given** 300 active files, **When** the merchant tries another,
    **Then** the platform refuses it on the server, names the active limit,
    states that deleting a file or the 90-day retention releases a slot, and
    creates no catalog; **And given** the file is one the platform already holds,
    **Then** the refusal is the active-limit one, not the duplicate outcome,
    because the file is refused before the duplicate check
    *(FR-013, FR-016, FR-017, FR-043)*
31. **AC-031**: **Given** 49 accepted uploads this month and two uploads in
    flight from two devices, **When** both settle, **Then** at most one is
    accepted and the count never exceeds 50 *(FR-013, FR-014, FR-020)*
32. **AC-032**: **Given** a merchant deletes a file, or the 90-day retention
    removes one, **When** the deletion settles, **Then** an active slot is
    released and the monthly count is unchanged; **And** a soft-deleted catalog
    does not count as active *(FR-011, FR-012)*
33. **AC-033**: **Given** an administrator lowers the merchant's quota below
    current usage, **When** the merchant tries to upload, **Then** new uploads
    are refused until usage is under the limit, and no file is deleted;
    **And given** an upload was already in flight when the lowering took effect,
    **Then** it is judged at its acceptance, and the duplicate check comes before
    the limit's judgment there: **And given** its file's content matches a
    retained catalog, **Then** it receives the duplicate outcome and consumes no
    quota, and the lowered limit is not judged against it; **And given** it is not
    a duplicate and the lowered limit leaves no room, **Then** it is refused for
    that limit — the monthly first and then the active when both are exhausted —
    and shown in the quota-exceeded state, with nothing retained, no catalog
    created, and no quota consumed, and the progress state the page was showing is
    replaced with no error state; **And given** the upload was accepted before the
    lowering took effect, **Then** it is not withdrawn and no stored file is
    removed, because the lowering blocks the next upload and does not reach back
    *(FR-013, FR-016, FR-017, FR-019, FR-043)*
34. **AC-034**: **Given** an upload settles as accepted, duplicate, refused, or
    failed, **When** the outcome is shown, **Then** the quota state on the page
    reflects the new counts without a page reload; **And** the platform holds an
    operational record of that outcome that carries neither the merchant's
    identity nor the file's name, and holds no value that identifies a merchant
    or a file: no content hash, no
    pseudonymous per-merchant reference, and no table or entity of its own, so
    the record is a log line kept under the platform's log policy; **And** the
    request's correlation identifier MUST accompany it, because it identifies a
    request and neither a merchant nor a file; **And given** a page's departure
    never reaches the platform, **Then** the abandoned session stays open and
    leaves no outcome record while it is unsettled, and the deferred sweep
    records the cancellation when it closes the session (R3); **And** no
    administrator is notified of a refusal
    *(FR-015, FR-062)*

#### The shared shell at runtime (AC-035 – AC-046)

35. **AC-035**: **Given** the merchant opens the account menu, **When** it opens,
    **Then** «حسابي»، «إعدادات»، «تسجيل الخروج» appear; **When** Escape or an
    activation outside it occurs, **Then** it closes and the session is untouched
    *(FR-051)*
36. **AC-036**: **Given** the sign-out confirmation, **When** it is cancelled,
    **Then** the session remains; **When** it is confirmed, **Then** the session
    ends and the in-shell ended-session state offers the way to sign in again
    *(FR-004, FR-051, FR-052)*
37. **AC-037**: **Given** a wide screen, **When** the collapse control is used,
    **Then** the sidebar narrows to the icon rail and returns to full; **Given**
    below 1024 CSS px, **Then** only «المزيد» opens the drawer, and the collapse
    control, Escape, or an activation outside it closes it with focus returning
    to «المزيد» *(FR-053)*
38. **AC-038**: **Given** the drawer is open, **When** an item is activated,
    **Then** the drawer closes as part of the navigation and focus lands on the
    destination page's heading *(FR-053)*
39. **AC-039**: **Given** the page scrolls 32 CSS px down, **When** the threshold
    is crossed, **Then** the bottom bar hides; **When** the page scrolls 16 CSS px
    up or returns within 56 CSS px of the top, **Then** it returns; with reduced
    motion it stays visible; scrolling inside the drawer does not hide it; no
    height is reserved while it is hidden; and the raised search action travels
    with it and leaves the focus order and the accessibility tree while hidden
    *(FR-054)*
40. **AC-040**: **Given** the drawer and the account menu, **When** either is
    open, **Then** the open drawer is the topmost surface with its scrim over the
    header and the bar, the open account menu is the topmost surface, the bar
    sits above the content and below either overlay, and the two are never open
    together *(FR-055)*
41. **AC-041**: **Given** an overlay is open, **When** something outside it is
    activated, **Then** the overlay closes and nothing beneath it is activated
    *(FR-056)*
42. **AC-042**: **Given** the drawer opens, **When** focus moves, **Then** it
    lands on the drawer's first focusable control and stays within the drawer
    until it closes *(FR-057)*
43. **AC-043**: **Given** a guest on the page, **When** they activate Upload
    Catalog from the sidebar's item, the bottom bar's slot, or the drawer,
    **Then** they are taken to the sign-in page with the item present and
    enabled, and after signing in they arrive at `/upload` *(FR-003)*
44. **AC-044**: **Given** a 320 CSS px width, **When** a shell label does not
    fit, **Then** it stays on one line, is cut at the inline-end with «…», and
    keeps its whole text in the markup and as its accessible name; and the page
    has no horizontal scroll *(FR-058)*
45. **AC-045**: **Given** the page and its shell, **When** the automated
    accessibility scan runs and a keyboard-only merchant completes an upload,
    **Then** the scan passes, the upload completes without a pointer, every state
    that replaces the block holding the focus moves focus to the state now shown
    — its heading or its first action — and never leaves it on a removed control,
    and the outcome's action returns it to the upload control; a state change
    that replaces no such block is outside this criterion's measurement
    *(FR-006, FR-048, FR-059)*
46. **AC-046**: **Given** the page at 1024 CSS px or wider, **Then** the four
    static-page links appear in the footer band at R1's routes; **Given** below
    1024 CSS px, **Then** the footer band is absent and the same four links sit
    at the bottom of the drawer *(FR-060)*

#### The limit boundary and the attempt bound (AC-047 – AC-050)

47. **AC-047**: **Given** a merchant opens the page while a limit is exhausted and
    attempts no upload, **When** the page settles, **Then** the quota-exceeded
    state names the limit or limits the same way a limit refusal does — the
    monthly first and then the active — states how each is released, carries
    «تحديث», and does not offer the upload control, while the rest of the page
    stays usable *(FR-015, FR-016, FR-017)*
48. **AC-048**: **Given** the accepted upload that reaches the limit settles as
    the fiftieth of the month, **When** the success state is shown, **Then** it
    keeps the content FR-047 fixes in the upload area and withholds «رفع آخر»,
    while the quota block shows the quota-exceeded content, because no submission
    is offered at the limit; **And** the success state is not dismissed and the
    exhausted content appears in the quota block alone
    *(FR-015, FR-016, FR-017, FR-047)*
49. **AC-049**: **Given** a duplicate or an error outcome settles while the
    refreshed quota state shows an exhausted limit, **When** the outcome is shown,
    **Then** it keeps its content — the duplicate's original, its date, its
    status, its parts link, and, when the captured status is `failed`, its
    «ملفاتي» link (FR-044), or the error's cause (FR-049) — and
    withholds its two actions, the «رفع آخر» or retry action and the
    «اختيار ملف آخر» action, while the «ملفاتي» link it carries is kept, including
    when that exhausted state's re-read fails (FR-015), and the quota block shows
    the exhausted content; **And** the outcome is not dismissed and the exhausted
    content appears in no other place on the page
    *(FR-015, FR-016, FR-017, FR-044, FR-049)*
50. **AC-050**: **Given** the merchant sends more attempts than the platform's
    bound in its window, **When** the attempt is made, **Then** it is refused
    before any byte is transferred with its own cause and the wait, nothing is
    retained, no catalog is created, and no quota is consumed, and the error state
    replaces the selected-file card while the page keeps the file it holds, so the
    retry re-sends that same file without the merchant choosing it again; **And
    given** the attempt brings the merchant's count in the window to the bound,
    **Then** it is counted, reaches its own outcome, and is not refused for the
    bound; **And** a file-level refusal and a limit refusal are not reported as
    too many attempts;
    **And** the counting set is FR-061's and is not restated here: a submission
    FR-061 counts as one attempt counts as one whatever its outcome, the
    completion-time file-level refusal included, and a submission FR-061 does not
    count is counted as no attempt, so a retry refused for the bound counts as none
    and does not extend the wait; **And given** the page is reloaded after the
    refusal, **Then** the file
    the page held is discarded, the page returns to its choosing state and requires
    a new selection, and the counter and the window are unchanged, so a submission
    before the wait elapses is refused again with the remaining wait
    *(FR-006, FR-028, FR-049, FR-061)*

#### The text the merchant reads (AC-051)

The one criterion below measures the text the merchant reads as one set rather
than string by string, so it spans the page's states and every cause in the
closed set. It keeps the identifier AC-051, the next free one when it was added,
because an identifier is never renumbered and never reused.

51. **AC-051**: **Given** the eleven measured presentations SC-008 samples are
    rendered and each cause in the closed set is provoked, **When** the text the
    merchant reads is taken as one set, **Then** every string in that set is
    Arabic — apart
    from the technical names FR-063 permits — carries Latin numerals only, and
    carries no emoji; every Latin run in those strings reads by FR-063's reading
    rule, so the sentence keeps its right-to-left order while «2.3 MB», «42%»,
    and «(xls، xlsx)» each keep their own left-to-right order and no run crosses
    its neighbouring word, separator, bracket, or dash; and an assistive
    technology voices the format name, the extension, and the unit in English
    while a numeral and the percent sign stay in Arabic; the safety refusals'
    distinctness from the size and format refusals is AC-020's condition under
    FR-034; each of the seventeen causes carries
    exactly one Arabic message, and the twelve FR-028 lists and the five it does
    not are both inside the set; and the phrases this specification fixes — the
    quota caption, the format-and-size line, the four status labels, and the
    automatic-processing statement — appear exactly as this specification fixes
    them, so that no text is owned twice
    *(FR-005, FR-010, FR-021, FR-025, FR-034, FR-044, FR-047, FR-063, FR-064, FR-065)*

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Measurement basis.** Every percentage below is a ratio over the sample its own
criterion names: the numerator is the number of sampled observations that meet
the stated outcome, the denominator is every observation in that sample, and
each observation is counted once with none dropped. A sample is a documented set
of observations drawn from the acceptance run, or from the load run the plan
names where the criterion says so; the sample's size, its boundary cases, its
numerator, and its denominator are recorded with the result, so a percentage is
not claimed without the count behind it. Where a criterion names a closed set —
the causes, the states, or the quota scenarios — the sample is that whole set.

- **SC-001**: 100% of files over 100 MB are refused before any byte is retained;
  a file of exactly 100 MB is accepted and a file one byte larger is refused.
  **Sample**: the three boundary sizes this criterion names (exactly 100 MB,
  100 MB + 1 byte, and a larger file) and every other over-limit file in the
  acceptance run. **Measurement**: for each submission, observe whether the
  refusal is shown before any byte is retained, and confirm that no file, no
  catalog, and no quota change remain; the percentage is the number of
  over-limit submissions so refused over the number of over-limit submissions
  in the sample. The exactly-100 MB case is measured separately for acceptance.
  *(FR-022, FR-023)*
- **SC-002**: 100% of files whose content does not match their declared format —
  including a Word document named as an Excel file and an Excel workbook named as
  a Word file — are refused before anything is kept, and 100% of accepted files
  still open as their declared format after sanitization.
  **Sample**: the mismatch cases this criterion names, a container that opens
  but holds no document of the declared type, and every file accepted in the
  same acceptance run. **Measurement**: two ratios over two disjoint sets — the
  number of mismatched files refused before anything is kept over the number of
  mismatched files in the sample, and the number of accepted files that reopen
  as their declared format after sanitization over the number of accepted files
  in the sample. A refusal is observed from the outcome shown to the merchant
  and the absence of a kept file; a reopening is observed from the kept file.
  *(FR-027, FR-032, FR-035)*
- **SC-003**: No file is kept or processed without a completed antivirus scan:
  100% of uploads made while the scan is unavailable are refused.
  **Sample**: every submission made while the scan cannot run, every submission
  whose scan returns no verdict within the platform's time budget, and every
  infected submission in the acceptance run, alongside a clean submission with
  the scan available as a control. **Measurement**: the number of
  unavailable-scan submissions whose outcome is the scan-unavailable refusal
  over the number of unavailable-scan submissions in the sample; a case counts
  only when no file, no catalog, and no quota change remain. The control is
  measured separately for acceptance.
  *(FR-029, FR-030, FR-033)*
- **SC-004**: 100% of duplicate uploads produce no second catalog, and every
  duplicate outcome names the original file, states its upload date, states its
  processing status in the Arabic label FR-044 fixes for that value, and carries
  a link to its parts; and every duplicate whose original's captured status is
  `failed` also carries the link to «ملفاتي», where the retry lives.
  **Sample**: every duplicate submission in the acceptance run — a repeat by
  the same merchant, a repeat by another merchant, two identical files at the
  same moment, and two files identical except for their macros — together with
  one duplicate for each of the four processing statuses, so the `failed`
  original and its «ملفاتي» link are in the sample.
  **Measurement**: three ratios over that sample — the number of duplicate
  submissions that leave exactly one catalog for that content over the number of
  duplicate submissions; the number of outcomes that show the original's name, its
  upload date, its status in the Arabic label of the captured value, and its parts
  link over the number of outcomes in the sample; and the number of duplicates
  whose captured status is `failed` that carry the «ملفاتي» link over the number of
  such duplicates. Every count is read from the records and the outcome shown to
  the merchant, and the status is read against the value captured when the
  duplicate was recognized, not the original's value at display.
  *(FR-009, FR-042, FR-043, FR-044, FR-045)*
- **SC-005**: Zero accepted uploads exceed either quota, measured on a run of 600
  concurrent uploads at a quota boundary (the quota-boundary run — a separate run
  of the same script at the capacity model's 600-concurrent-upload ceiling, not a
  phase of the load run).
  **Sample**: the whole set of ten merchants the run uses, each seeded with 299
  active catalogs, of which 49 were accepted in the current calendar month —
  one slot short of each default limit, so the monthly limit of 50 and the
  active limit of 300 are each one away — with exactly 60 concurrent uploads per
  merchant and 600 in all, which is exactly the attempt bound of 60 per fixed
  15-minute window and not deliberately below it: all 60 fall in one window and
  are attempts 1–60, the 60th is counted and accepted as an attempt and is not
  refused for the bound, and no attempt-bound refusal appears in the sample. The
  sample contains no retry and no repeated submission; either would be attempt
  61 in that window and would be refused for the bound, so it would fall outside
  the 60 and could not add a second acceptance — the one-acceptance-per-merchant
  result would not change — but it would add an attempt-bound refusal and break
  the sample's condition that every refusal is a limit refusal (FR-061). The 60
  uploads each carry distinct content, so no submission can answer as a
  duplicate and every refusal in the run is a limit refusal; a repeated content
  would leave one acceptance, one duplicate, and 58 limit refusals, and the
  third ratio could not be read.
  **Measurement**: three
  ratios over that sample — the number of merchants whose final monthly count
  is at or under 50 over the number of merchants in the sample; the number of
  merchants whose final active count is at or under 300 over the number of
  merchants in the sample; and the number of merchants that accepted exactly one
  of their 60 concurrent uploads over the number of merchants in the sample,
  because one free slot admits one acceptance and not two. Every ratio is 100%,
  and the accepted count and the refusals by cause are recorded beside them.
  *(FR-013, FR-014, FR-018, FR-019, FR-061)*
- **SC-006**: 95% of Upload Catalog page loads show the merchant's quota state
  within 2 seconds under the load the plan names.
  **Sample**: the 3,600 page loads of the load run the plan names — 1,200 in the
  design phase and 2,400 in the stress phase, one page load before each
  submission and each a cold load in a fresh browser context with an empty
  cache — counted across the whole run including its first and last minute.
  **Measurement**: for each load,
  record the time from the navigation's start — the moment the browser begins
  the request for the page's document, not the response's arrival and not the
  first paint — to the first frame in which the quota block shows its settled
  presentation — the used and limit counts, the exhausted content, or the read
  failure, and not its loading state; the percentage is the number of loads at
  or under 2 seconds
  over the number of loads in the sample, with loads whose quota read fails
  excluded from neither the numerator nor the denominator.
  *(FR-010, FR-015)*
- **SC-007**: 95% of typical uploads (1–4 MB) are confirmed within 1 minute of
  the file's selection, under the load the plan names and over a client uplink of
  76 KB/s — the capacity model's design client, which carries its 2.28 MB average
  in 30 seconds.
  **Sample**: the 3,600 uploads of 1–4 MB in the same load run — 1,200 in the
  design phase and 2,400 in the stress phase, 900 at each of 1 MB, 2 MB, 3 MB,
  and 4 MB — counted across the whole run, including uploads that end in a
  refusal or a duplicate.
  **Measurement**: for each upload, record the time from the file's selection to
  the outcome's becoming visible to the merchant, with the load run pacing that
  upload's part writes at the stated uplink; the percentage is the number
  of uploads at or under 1 minute over the number of uploads in the sample. The
  stated uplink is the condition that makes the bound measurable: a 1 MB file
  spends about 13 seconds in the transfer, a 2 MB file about 26, a 3 MB file
  about 39, and a 4 MB file about 53, leaving the minute's remaining seven
  seconds to the pre-sign check, the completion's screening, and the outcome's
  render; because the 4 MB class is a quarter of the sample, the ratio is met
  when four-fifths of that class meets the bound, and the service budgets the
  plan states bound the platform's share the run measures. The browser is the
  one the plan's supported-browser statement names, and no device class is a
  condition of the criterion, because the rendering share is one frame of a
  loaded page while the transfer at the stated uplink is the interval's dominant
  share.
  *(FR-047, FR-048)*
- **SC-008**: 100% of the page's required presentations pass the automated
  accessibility scan, and a keyboard-only merchant completes an upload without a
  pointer.
  **Sample**: the eleven measured presentations — idle and
  choosing, selected, uploading in its transfer presentation, uploading in its
  screening presentation, success, duplicate, error, quota exceeded, quota
  loading, quota read failure, and the multi-file notice — at each width and
  appearance the plan names. Each one is a presentation — what the page shows at
  one moment — and not a state: the multi-file notice is a transient message of
  the choosing state that adds no state (FR-020), so it is measured here without
  being counted as one of the page's states. The eleven are the slice map's eight
  page states with the uploading state's two presentations counted separately and
  the quota read failure and the multi-file notice added, so the eight stand as
  the slice map states them and the three are counted beside them. The set is
  closed at eleven: a presentation the page renders is in the sample, and none it
  does not render is. The shell's
  ended-session state is not one of the eleven, because it is R1's and not this
  page's: it is measured separately, as its own observation, and its result is
  recorded beside this criterion's and never inside its ratio.
  **Measurement**: the number of sampled presentations with no reported violation
  over the number of presentations in the sample; the keyboard-only pass is a
  separate observation of one complete upload made without a pointer.
  *(FR-006, FR-020, FR-059)*
- **SC-009**: 100% of refusals state their cause in Arabic and leave no catalog,
  no kept bytes, and no quota consumed.
  **Sample**: one submission for each of the seventeen causes in the closed set
  FR-064 fixes — the twelve FR-028 lists and the five it does not — in the
  acceptance run. **Measurement**: the number of sampled
  refusals whose message names that cause in Arabic and whose submission leaves
  no catalog, no kept bytes, and no quota change over the number of refusals in
  the sample; a limit refusal is read against the quota-exceeded state FR-016
  and FR-017 name rather than the error state.
  *(FR-028, FR-030, FR-034, FR-064)*
- **SC-010**: The page renders without horizontal scroll at 320 CSS px, and every
  shell label stays on one line with its whole text available as its accessible
  name.
  *(FR-058)*
- **SC-011**: 100 accepted uploads produce exactly 100 catalog records and 100
  kept files — one per accepted upload and no more.
  *(FR-035)*
- **SC-012**: The quota state's monthly and active counts match the records in
  100% of the quota scenarios this specification names: the defaults, an
  override, a deletion, the 90-day retention, the month boundary, and a lowered
  quota; the pair under observation is the page's two displayed numbers where a
  rendered page exists, and the quota read's two counts where the scenario is
  read from the quota read alone.
  **Sample**: the whole set of six quota scenarios named above, with the
  month-boundary scenario accepting its upload at the month's last second and
  reading the counter's month and the catalog's timestamp as one month.
  **Measurement**: the number of scenarios whose two observed counts equal the
  counts the records hold at that moment over the six scenarios; where a
  rendered-page case exists, the page's two numbers and the records' two numbers
  are read at the same observation; where the scenario is read from the quota
  read alone, the scenario's two counts are read from the records and the
  displayed pair is not part of that observation.
  *(FR-010, FR-011, FR-012, FR-015, FR-018, FR-019)*
- **SC-013**: 100% of settled upload submissions leave an operational record of
  their outcome, and no such record carries a merchant's identity, a file's name,
  a file's content hash, or any other value that links a submission to a file or
  to an account; the request's correlation identifier MUST accompany the record,
  because it identifies a request and neither a merchant nor a file. A submission
  settles when the platform answers it or, for a session its page abandoned
  without a cancellation reaching the platform, when the deferred sweep closes
  that session (FR-062). The product requirement here is the counters alone: one
  readable count of refusals for each cause of the closed set, and a readable
  count of the unavailable-scan cause whose nonzero value is the signal that a
  scanner could not run; a surge of refusals is observed from the count of
  refusals of each cause over a named window. The window's length and the
  threshold that turns a count into a surge are operational settings R12 owns and
  records before 2026-12-15, and they add no cause to the closed set and no
  counter beside the per-cause counts (Clarifications 2026-11-17 (11)).
  **Sample**: every submission in the acceptance run, including one for each
  outcome FR-062 names, those FR-061 does not count as attempts, and one
  abandoned session whose cancellation never reached the platform — the last
  observed as a session that stays open and leaves no outcome record while it is
  unsettled, and whose record the sweep (R3) writes when it closes the session.
  **Measurement**: the number of settled submissions that leave exactly one
  record of their outcome over the number of settled submissions in the sample,
  and, over the same sample, the number of those records that carry no value
  identifying a merchant or a file; both ratios are read from the records by the
  platform's operators, and the counts by cause are read for the run's window.
  *(FR-061, FR-062, FR-064)*

## Assumptions

- R1 is accepted and its foundation is in place: the shared shell, the fixed
  route map, sign-in and sessions, the account status, the single merchant-scope
  entry point, the platform's shared UI primitives (ADR-097, ADR-098, ADR-128,
  ADR-137), and the bidirectional file-name surface. This slice consumes them
  and builds no second shell, layer, or route map.
- The page is merchant-only. The guest's return to `/upload` after signing in is
  decided here, because R1 deferred that decision to the slice that ships the
  merchant area's pages (ADR-100); it adds no page, no route, and no stored
  state, and it accepts no return target other than the internal destination the
  guest requested. FR-003's "registers `/upload`" names the proof of that
  internal return target — the guest's request is validated against the shared
  route map and the merchant is returned only to it — not a route added to the
  map: «خريطة المسارات المشتركة» is read-only for this slice, R1 already
  registered `/upload` and every route this slice links to, and no task adds an
  entry or rewrites one. A later slice proves its own destination the same way
  without amending the rule, and a target that is not a registered route lands
  on `/upload` (FR-003).
- **A session that ends, or an account that is blocked, after the transfer has
  completed does not cancel the intake.** The platform carries the screening
  through, because completion — not the page — is the point after which the
  intake is the platform's; the page shows the ended-session or blocked state
  instead of a transfer error, and a transfer that had not completed leaves
  nothing (FR-004, FR-050).
- **The administrator's full platform privileges are exercised in the
  administrator application, not in the merchant area.** A live administrator
  session at `/upload` is treated as a guest at the merchant sign-in, so the page
  adds no administrator state and the merchant area stays merchant-only (FR-002,
  AC-002).
- **The override's cap is enforced where the value is stored; the
  administrator-facing refusal belongs to the slice that ships the write.** This
  slice reads the account's two overrides and adds no administrator operation, so
  AC-028's cap clause is asserted by the write that sets an override alone — a
  value above 500 per calendar month or 1,500 active files cannot be stored, and
  the stored value is unchanged — while R13, which ships the operation that sets
  an override, owns the refusal its administrator sees (FR-018, AC-028).
- **The file's name is a field-level fact this slice records.** The duplicate
  outcome must name the original and My Files must show the uploaded file, yet
  the Glossary's `Catalog` metadata names only the supplier, issue date, upload
  date, and expiry date. The plan records the addition with a decision record and
  a `docs/domain-model.md` amendment beside open fact #9, and the register is
  amended only if the field's existence is itself a product decision the
  entity's one-line meaning must name.
- The record's name bound is 255 UTF-16 code units — the unit a browser reports
  for a file name and the unit both the page's and the server's check use: a
  longer name is refused with the invalid-name cause (FR-021), and the plan sizes
  the field to hold 255 units and records the bound beside it (FR-036). It is a
  validation bound on a supplied value, not a usage limit under the
  constitution's table. An empty name is refused the same way, and it is
  likewise not one the page supplies: only a crafted client can send it, so its
  check lives on the server (FR-021, FR-026).
- **The no-emoji rule binds the platform's own text, not a value the merchant
  supplies.** A file's name carrying an emoji or another pictograph is accepted,
  preserved as uploaded, and shown as supplied; it is neither refused nor
  rewritten (Clarifications 2026-11-12 (2)). R1's refusal of an emoji in a full
  name or a shop name remains R1's rule on its own form fields and is not
  restated here.
- **Executable document content is the wider set the clarification fixes.** In a
  PDF it is the file's JavaScript, its automatic and launch actions, its embedded
  files or attachments, and its XFA form scripts; in an Office document it is its
  document macros and every embedded object or attached file that can carry
  executable content — an OLE2 compound embedding, an ActiveX control, or an
  embedded package such as a workbook or an archive. An embedded object that
  cannot execute — an embedded chart or an image — is not executable content and
  is kept. Macro stripping removes the set, and a file
  whose executable content cannot be removed is refused with the
  sanitization-failed cause, not accepted to fail later in processing; the
  sanitized file is reopened as its declared format before it is kept, and one
  that no longer opens is refused the same way (FR-030, FR-032, AC-017).
- **The capabilities the intake needs are register gaps, and none is used before
  its record exists.** The content-inspection set — content-type validation,
  container reading, and removal of executable content — is a cross-slice value
  the constitution's closed list carries (the extraction libraries), which R3
  extends with extraction, and the object-storage client and the scanner client
  are recorded the same way (FR-027, FR-029, FR-033, FR-040).
- **The multi-file notice is a transient message of the choosing state.** It is
  not a page block and not a new state, because the reference composition carries
  no such line and the page's picker is single-file, so only a drop can raise it;
  the plan records its copy and the design conformance baseline for it (FR-020).
- **The upload-attempt bound is a value the constitution fixes.** The
  constitution's 7.0.0 text carries the value (ADR-175): 60 attempts in a fixed
  15-minute window per merchant, on UTC boundaries, enforced after the file-level
  checks and a limit refusal. The plan restates it in the same words; the bound is
  not a Usage Limit and adds no quota (FR-061).
- **Principle V's scope was narrowed to the platform's own text by ADR-175
  (constitution 7.0.0, 2026-11-13); the amendment and its decision record are
  recorded.** A Converge that finds them unrecorded is not Converged.
- **Open fact #9 is settled here:** A catalog carries the kept file's byte count
  and its content type. The plan states the fields that carry them.
- **The active count includes processing and failed files**, because their bytes
  are retained, and a soft-deleted row is filtered out of every read path, so it
  does not count. The monthly count is not read from catalog rows either: a
  persisted per-merchant counter, keyed to the calendar month and incremented
  atomically at acceptance, keeps it after a deletion (FR-011). The reference
  screenshot's quota caption — that a file is
  counted after processing completes — is superseded by the binding caption
  FR-010 fixes, because counting only completed files would leave in-flight files
  uncounted and let the limit be exceeded.
- **The content hash's uniqueness is read over the catalogs that are not
  deleted.** A soft-deleted catalog is filtered out of every read path, so the
  same file uploaded after its predecessor is deleted is a new upload rather than
  a permanent duplicate — and the delete leaves the stored file in place until
  the retention job removes the row for good, so the exclusion follows the
  deleted state and not the absence of the file. A plain uniqueness over every
  row would refuse that re-upload, so the plan records the decision with a
  `docs/domain-model.md` amendment beside the content-hash invariant and a
  decision record (FR-012, FR-042, FR-045, FR-046).
- The calendar month is the platform's local time (Libya); the month's boundary
  is that time's midnight on the first day.
- 100 MB is 100 × 1024 × 1024 bytes; it is a Usage Limits value (the maximum
  file size), not a value the constitution's closed list carries, and the plan
  restates it from that table. The decoded-size cap is a value the constitution
  fixes; this specification fixes only that a cap exists, is enforced, and
  measures what every inspected file decodes to — a PDF's compressed streams
  included (FR-031).
- The platform keeps only the sanitized file; its byte count and content hash are
  those of the kept file, and the original upload is not retained.
- **The withdrawal of a refused file's bytes is complete.** Nothing of a refused
  file survives a confirmed refusal in storage — neither a complete file nor an
  unfinished part of one — because the refusal's outcome is that nothing of the
  file is kept, not that most of it is kept and a sweep will finish the job; the
  transport's mechanics and the periodic sweep that removes temporary
  workspace files stay a plan value under Deployment and Observability's
  worker-durability rule. The sweep's file-cleanup legs serve a request
  abandoned before any refusal and the one case where the storage refuses the
  withdrawal, so no refused file depends on them otherwise and they cannot
  weaken this outcome: the guarantee is read at the moment the removal is
  confirmed, and a failed withdrawal is shown as the storage failure with its
  retry, with the safety cause recorded (FR-030, AC-015).
- **The attempt's operational record is an operational trace, not a domain
  record.** It carries no entity, no relation, and no invariant, so it adds
  nothing to the domain model and nothing to the register; it is a structured log
  line that carries the outcome, the cause, and the time, and the request's
  correlation identifier — no
  content hash and no pseudonymous per-merchant reference — so it introduces no
  table, its retention is the platform's log policy rather than a window of its
  own, and no product surface exposes it; the plan records the decision and the
  log policy it follows (FR-062).
- Processing begins automatically as the product's pipeline states; the pipeline,
  the queue, and every status after `uploaded` are R3's. In the R2-only increment
  the record rests at `uploaded`, and the plan records that window with R3 as its
  owner and a review date.
- **The success state's statement that processing will begin automatically describes
  the pipeline R3 builds, and this slice neither queues nor notifies.** The
  constitution's File Processing Overview places the queue, the worker, the status
  update, and the notification after the intake, and the roadmap gives the queue to
  R3 and the notification surface to R9; so the statement stays as it is written,
  this slice creates no queue job and no notification, the entity register names no
  notification here, and the R2-only increment's resting record at `uploaded` is the
  window the plan records with R3 as its owner (FR-037, FR-047,
  AC-003).
- The links this page carries to pages that have not shipped yet are fixed here
  and point at the registered routes: `/my-files` in the success outcome (R4
  ships that page) and `/parts?file=<id>` in the duplicate outcome (R5 ships its
  page); the duplicate link's window is roadmap defect 20, and the four
  static-page links' window is roadmap defect 19, which the roadmap closes at
  R10 with the last destination and whose pages R11 ships. Until each page
  ships, the platform's ordinary not-found answer appears at the route and no
  placeholder page is added. The plan records each window (ADR-139).
- The transport that carries a large file to the platform is a plan decision
  (the roadmap's large-file upload transport duty); this specification fixes the
  product outcome — visible progress and a complete, intact file — not the
  transport.
- The screening phase is a phase of the progress state, not a new page state:
  the slice map's eight states stand, and the plan records its copy and the
  progress surface's indeterminate appearance (FR-048).
- Each stage's time budget — the content check's, the cap's read, the scan's, the
  sanitizer's, and the reopen's — is a plan value; a stage that exceeds its
  budget is decided as the cause that stage produces (FR-029), so the scan's is a
  scan that could not run under FR-033 and the cap's read is the
  corrupt-or-unreadable cause, because a file not read far enough to be measured
  never crossed the cap, and no new refusal cause enters the set (FR-031, FR-049,
  FR-064).
- Once the transfer completes, the intake is completed by the platform and is
  not tied to the page staying open: a departure after the transfer does not
  cancel it, and an accepted file's record appears in My Files (FR-050).
- The platform's shared UI primitives provide the page's building blocks; the
  upload-with-progress surface is added to that shared set by this slice (the
  roadmap's First obligations row), and the page composes it rather than building
  a parallel control.
- The plan records the design conformance baselines for the page's states
  (Principle IX; ADR-129), the automated accessibility scan and keyboard-only
  pass, and the first standalone documentation-drift test for the public
  interface (ADR-031 item 4).
- No page, entity, product feature, role, or usage limit is added: the page is
  the registered twenty-eighth, the entity is the registered `Catalog`, and the
  limits are ADR-118's.
- The page's copy beyond the strings this specification fixes is owned by the UI
  contract, which fixes the wording of every string the page renders; the shared
  message table carries one message per refusal cause, as R1's pages do
  (FR-065).
- **The duplicate outcome's read of another merchant's catalog is the one
  registered exception to the merchant-isolation rule.** The rule's text is
  amended in the constitution to name that read, `docs/domain-model.md` carries
  it, and a decision record records it, before the isolation test admits the
  path; the read is bounded to the fields the outcome shows, so no other field
  of the original and no record of its owner is reachable through it. The
  constitution's File Processing Rules require the duplicate message to name the
  original, and this registration is what reconciles that requirement with the
  isolation rule (FR-009, FR-044, AC-026).
- **The status vocabulary the duplicate outcome shows is fixed here.** R2 is the
  first surface that shows a processing status to a merchant, so the four Arabic
  labels are fixed here and R4 inherits them rather than fixing a second set;
  the raw registered value is never shown to a merchant (FR-044, AC-021).
- **The upload-attempt counter lives outside the account row.** It is a
  per-merchant counter the module that owns the quota enforcement keeps, like
  the monthly counter FR-011 keeps; the plan records its storage with a decision
  record and a `docs/domain-model.md` amendment, and the entity register and the
  account's registered fields do not change (FR-061).
- **Every date the product shows a merchant is rendered in the Gregorian
  calendar with Latin digits.** The constitution fixes the numerals but not the
  calendar; the written pattern is a plan value in one shared date surface, so
  the duplicate outcome, My Files' table, and the Catalog page's table read one
  way and two calendars never meet in one product (FR-044, AC-021).
- **The Arabic mirror is amended by a separate manual change, and this slice
  makes no edit to it.** `Core-Project.txt` carries its own Arabic wording for
  the four catalog statuses; this specification fixes the vocabulary the product
  uses (FR-044), the mirror is subject to that vocabulary rather than to a
  second wording of it, and the amendment that brings the mirror to the same
  wording is a separate manual work item outside this slice's artifacts — no
  file of this slice edits the mirror. The plan records that work item with its
  owner and a review date (Clarifications 2026-11-14 (4)).
- **The text of this slice has one owner per piece, and the plan's own record of
  the obligations it holds is the plan's half of that rule.** This specification
  owns the product behaviour and the closed sets it fixes; the feature's UI
  contract owns the wording of every string the page renders; the plan owns every
  technical detail and states the obligations it holds in its own artifact, so
  that no requirement here restates what the plan owns. A piece of text is owned
  by one of the three and never by two (Principle VII, FR-065).
