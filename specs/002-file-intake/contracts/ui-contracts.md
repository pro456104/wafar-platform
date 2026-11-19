# Contract — Upload Catalog Page (UI)

**Feature**: `002-file-intake` | **Date**: 2026-11-13 | **Plan**: [plan.md](../plan.md) | **API**: [intake-api.md](./intake-api.md)

The page the slice ships: Upload Catalog at `/upload`, inside the shared shell.
This contract fixes its composition, its eleven baseline states, every string it
renders, the components it composes from the Wafar UI layer, and the focus and
announcement rules. The shell's own composition and behaviour are R1's
(`contracts/ui-contracts.md` §8); this page renders them and adds no second
shell, no second message table, and no design value of its own.

A state's **heading** is the element focus moves to: rendered with
`tabindex="-1"` and focused programmatically when the state replaces the block
that held focus. A state with no heading moves focus to its first action. No
state leaves focus on a control the previous state carried (FR-006, FR-059).

## 1. The way in

| Case | Behaviour |
|---|---|
| A signed-in active merchant | The page renders inside the shell |
| A guest opens `/upload`, or activates it from the sidebar, the bottom bar, or the drawer | The item stays present and enabled; the page middleware sends the guest to `/auth/sign-in?redirect=/upload`; after signing in the merchant returns to `/upload` |
| A guest asks the sign-in to return to an external or unknown target | The target is refused against `packages/shared/src/routes.ts`'s registered routes and the merchant lands on `/upload` (FR-003) |
| An administrator session | Treated as a guest at the merchant door: taken to the merchant sign-in page, which refuses the administrator with R1's uniform refusal; the intake is never reached and the page adds no administrator state (FR-002) |
| A blocked account | R1's blocked state inside the shell, plainly stating the account is blocked (FR-004) |
| A session that ends while the page is open | R1's in-shell ended-session state (`WfEndedSession`), with no retry; a transfer that had not completed leaves nothing, a completed one is carried through (FR-004, FR-050) |

The guest's return target is a registered internal route, never a URL the
request supplies. `/upload` is the destination this slice registers; a later
slice registers its own without amending the rule.

## 2. Composition

The blocks, in this order (FR-006):

1. The page header: the heading «رفع كتالوج» and the subtitle.
2. The quota state (`WfQuotaBlock`), including its loading, read-failure, and
   quota-exceeded presentations.
3. The upload area: exactly one of
   - the upload control (`WfUploadControl`) in the choosing state;
   - the selected-file card (`WfSelectedFile`) with the progress surface
     (`WfUploadProgress`) beneath it during the transfer and the screening
     phase;
   - an outcome panel (success, duplicate, or error).
4. The multi-file notice, below the control, when a drop carried more than one
   file. It is not part of the standing composition and is not a state.

The upload control is the choosing state; once a file is chosen the card and
progress take its place; an outcome replaces both. The control is never offered
beside an outcome or while a file is in flight, and the quota-exceeded
presentation withholds it until a re-read lands under both limits (FR-006,
FR-017).

## 3. The eleven presentations

The visual baseline set counts the uploading state's two presentations separately,
so the eight page states the slice map names become eleven measured presentations
and eleven baselines (SC-008; plan → Verification Notes). Each row is a
presentation — what the page shows at one moment — and only the rows the page
actually renders are counted.

| # | Presentation | Trigger | Visible | Focus | Announcement |
|---|---|---|---|---|---|
| 1 | Idle / choosing | The page settles with both limits under their bounds | Header, quota state with counts, the upload control | None on load; the document's reading order starts at the heading | None |
| 2 | Selected | A file passed every file-level check and the pre-sign request is in flight | The card (name, size, format) and the progress surface at 0%, with the determinate transfer | The card's heading «الملف المختار» | «بدأ رفع <name>» — polite region |
| 3 | Uploading — transfer | The part URLs are being written | The card stays; determinate percentage in Latin digits; «إلغاء» | Stays on the card's heading; «إلغاء» is the next stop | The start is announced once in the polite region; no percentage is announced |
| 4 | Uploading — screening | The last part was acknowledged; the complete request is in flight | The card stays; the indeterminate «يجري فحص الملف»; «إلغاء» is withdrawn | Stays on the card's heading | «يجري فحص الملف» — polite region, once |
| 5 | Success | The complete request answered `201 accepted` | The success panel replaces the card and progress | The success heading «تم استلام الملف» | The heading is the focus announcement; the polite region carries the body once and does not repeat the heading |
| 6 | Duplicate | The complete request answered `200 duplicate` | The duplicate panel replaces the card and progress | The duplicate heading «الملف موجود مسبقا» | The heading is the focus announcement; the polite region carries the original's name and date once and does not repeat the heading |
| 7 | Error | A refusal the page shows in the error state, or the page's own transfer failure (no response; `intake-api.md` §2.3) | The error panel replaces the card and progress | The error heading «تعذر رفع الملف» | The heading is the focus announcement; the assertive region carries the cause |
| 8 | Quota exceeded | A limit is exhausted on load, a limit refusal, or a refreshed read at or above a limit | The quota block carries the exhausted content and «تحديث»; the upload control is withheld; the rest of the page stays usable | The block's heading «الحصة» when the state removes the control; no move when it appears on load | The heading is the focus announcement when the control is removed; the assertive region carries the exhausted content once |
| 9 | Quota loading | The quota read is in flight at page load | The quota block's skeleton and «يجري قراءة الحصة…»; the upload control remains available | None; the control is usable | «يجري قراءة الحصة…» — polite region, once |
| 10 | Quota read failure | The read or its retry failed | The block's inline failure, «تعذر قراءة الحصة. الحصص غير متاحة الآن.», «إعادة المحاولة»; the counts are hidden; the upload control remains available | The retry is reachable in place; no move | The failure — assertive region, once |
| 11 | Multi-file notice | A drop carried more than one file | The notice below the control; the first file in the drop's order started | No move | The notice — polite region, once; it leaves the accessibility tree when replaced |

Every announcement in the table belongs to exactly one of the two regions §7
fixes: a row marked *polite* to the polite region, a row marked *assertive* to
the assertive region. A heading that receives focus is the focus announcement of
the state's name; its text is never copied into a region.

**State rules.**

- The screening phase is a phase of the progress state, not a new page state;
  «إلغاء» is withdrawn because the transfer it stops has finished (FR-048).
- The screening phase is the presentation for as long as the screening takes, an
  upload that passes a minute included: it adds no percentage, no elapsed-time
  count, no second announcement, and no separate slow-upload presentation, and
  the outcome or the error state replaces it when the work settles (FR-048,
  FR-049).
- A transfer that ends because the session ended or the account was blocked
  shows R1's state, not the error state, and offers no retry (FR-004).
- A limit refusal is shown in the quota block alone; the error state is not used
  and no «اختيار ملف آخر» is offered while the limit stays exhausted (FR-016,
  FR-017).
- An outcome that settles while a refreshed read shows an exhausted limit keeps
  its content and withholds its «رفع آخر» or retry action; the block carries the
  exhausted content, and the action returns in place when a read lands under both
  limits (FR-017).
- A re-read that fails while the exhausted content is shown hides the used and
  limit numbers, keeps the exhausted content and «تحديث», and keeps the control
  withheld (FR-015).
- The quota loading presentation is bounded: a read that has not settled within
  the plan's five-second bound is stopped and becomes the read-failure
  presentation with its retry, and the page makes no automatic retry (FR-015).
- The multi-file notice is shown for that drop alone: it is replaced by the next
  selection or drop and is not part of the standing composition (FR-020).
- A departure during the transfer is a cancel, and the page makes it one: while
  the progress state is the transfer phase it stops its in-flight part writes and
  sends the bodyless `DELETE` (`intake-api.md` §2.4) from its `pagehide`
  listener, so leaving the page and «إلغاء» produce the same outcome (FR-048,
  FR-050). A departure during the screening phase sends nothing and cancels
  nothing: «إلغاء» is already withdrawn, and the intake belongs to the platform
  from the moment the bytes are complete (FR-050).

## 4. Copy

One string per cause and state. The file's name is **data**, not copy: it is
interpolated as a value, never typed into a template as text. All numerals are
Latin and render through `WfNumeral`; no string carries an Arabic-Indic digit or
an emoji.

### 4.1 The page

| Element | Text |
|---|---|
| Heading | «رفع كتالوج» |
| Subtitle | «ملف مورد واحد: Excel أو PDF أو Word حتى 100 MB. المعالجة تبدأ تلقائيا.» |
| Upload action (coarse pointer) | «رفع ملف» |
| Drop area (fine pointer) | The control's accessible name is its visible text: «رفع ملف», followed on a fine pointer by the visible hint «اسحب ملفا هنا أو اختر ملفا»; the coarse-pointer action shows «رفع ملف» alone (WCAG 2.2 SC 2.5.3, Label in Name) |
| Format line, under the action | «Excel (xls، xlsx) · PDF · Word (doc، docx) — حتى 100 MB» |

### 4.2 The quota block

| Element | Text |
|---|---|
| Block heading | «الحصة» |
| Caption | «حصة الشهر الميلادي، والحد النشط يشمل الملفات المخزنة غير المحذوفة.» |
| Monthly line | «هذا الشهر: {used} من {limit}» |
| Active line | «الملفات النشطة: {used} من {limit}» |
| Loading | «يجري قراءة الحصة…» |
| Read failure | «تعذر قراءة الحصة. الحصص غير متاحة الآن.» |
| Read retry | «إعادة المحاولة» |
| Refresh | «تحديث» |
| Monthly exhausted, with numbers | «بلغت حد الرفع الشهري ({used} من {limit}). يتجدد في أول الشهر الميلادي القادم.» |
| Monthly exhausted, numbers hidden | «بلغت حد الرفع الشهري. يتجدد في أول الشهر الميلادي القادم.» |
| Active exhausted, with numbers | «بلغت حد الملفات النشطة ({used} من {limit}). يتم تحرير بحذف ملف أو بانتهاء مدة الاحتفاظ (90 يوما).» |
| Active exhausted, numbers hidden | «بلغت حد الملفات النشطة. يتم تحرير بحذف ملف أو بانتهاء مدة الاحتفاظ (90 يوما).» |
| Both exhausted | The monthly text first, then the active text, as one block of two paragraphs |
| After an outcome | A polite status «تم تحديث الحصة.» when the counts change in place |

### 4.3 The card and the progress

| Element | Text |
|---|---|
| Card heading | «الملف المختار» |
| Card detail | «{size} · {format}» — for example «2.3 MB · Excel» |
| Transfer label | «{percent}%» in Latin digits |
| Screening label | «يجري فحص الملف» |
| Cancel | «إلغاء» |
| Start announcement | «بدأ رفع {name}» |
| Cancel announcement | «تم إلغاء الرفع. لم يتم حفظ الملف.» |

### 4.4 The outcomes

| Element | Text |
|---|---|
| Success heading | «تم استلام الملف» |
| Success body | «تم حفظ {name} في ملفاتي. تبدأ المعالجة تلقائيا.» |
| Success link | «الانتقال إلى ملفاتي» → `/my-files` |
| Success action | «رفع آخر» |
| Duplicate heading | «الملف موجود مسبقا» |
| Duplicate body | «هذا الملف مطابق للملف {original name} الذي تم رفعه في {date}.» |
| Duplicate status | «الحالة: {label}» |
| Duplicate parts link | «عرض القطع» → `/parts?file={original id}` |
| Duplicate action | «رفع آخر» |
| Duplicate, failed original | «فشلت معالجة الملف الأصلي. يمكنك إعادة المحاولة من ملفاتي.» and the link «ملفاتي» → `/my-files` |
| Error heading | «تعذر رفع الملف» |
| Error retry (retryable only) | «إعادة المحاولة» |
| Error secondary action | «اختيار ملف آخر» |

The success body carries FR-047's statement **verbatim** — «تبدأ المعالجة
تلقائيا» — as its own sentence, because the specification fixes both that
wording and the criterion that measures it (AC-051). The subtitle's «المعالجة
تبدأ تلقائيا» is FR-005's sentence and is a different string: neither replaces
the other, and no third phrasing of either exists.

The two interpolated names render through `WfFileName`: the Arabic stem
right-to-left and the Latin extension isolated left-to-right, the whole name in
the markup and as the accessible name, visually cut with «…» at the inline end
when it does not fit (FR-008, FR-058). The visually cut run is hidden from
assistive technology, and the whole name is the accessible name once, so a
screen reader never reads the cut text and the name is never voiced twice.

The two labels for `/my-files` name two different surfaces and are not
interchangeable: the success outcome's link reads «الانتقال إلى ملفاتي» and the
duplicate's failed-original link reads «ملفاتي». SC-004 measures the «ملفاتي»
label alone; the success outcome's label is fixed here and enters no
criterion's ratio.

### 4.5 The refusal messages

The page selects the message by the response's code and composes none of its
own (`intake-api.md` §3). The three retryable server codes —
`UPLOAD_SCAN_UNAVAILABLE`, `UPLOAD_TOO_MANY_ATTEMPTS`, and
`UPLOAD_STORAGE_UNAVAILABLE` — carry «إعادة المحاولة» and «اختيار ملف آخر», and
the page's own transfer failure, which has no server code, carries the same two
actions and its own row below. Every other cause carries «اختيار ملف آخر» alone,
except `UPLOAD_MONTHLY_LIMIT` and `UPLOAD_ACTIVE_LIMIT`, which are the quota
block's own text and carry neither an error panel nor the «اختيار ملف آخر»
action; the quota block's «تحديث» control (FR-015, FR-017) belongs to the quota
state and is not one of those actions, so it stays. Both rules bend in the one
case the note under the table states: while the refreshed quota state shows an
exhausted limit, the panel carries neither action.

| Code | Text |
|---|---|
| `UPLOAD_INVALID_NAME` | «ملف باسم غير صالح. اختر ملفا باسم آخر.» |
| `UPLOAD_UNSUPPORTED_FORMAT` | «صيغة الملف غير مدعومة. الصيغ المدعومة: Excel (xls، xlsx)، PDF، Word (doc، docx).» |
| `UPLOAD_TOO_LARGE` | «حجم الملف يتجاوز 100 MB. اختر ملفا أصغر.» |
| `UPLOAD_EMPTY` | «الملف فارغ. اختر ملفا يحتوي محتوى.» |
| `UPLOAD_CONTENT_MISMATCH` | «محتوى الملف لا يطابق امتداده. لم يتم حفظ الملف. تأكد من نوع الملف ثم اختر ملفا آخر.» |
| `UPLOAD_CORRUPT` | «ملف تالف لا يمكن فتحه. لم يتم حفظ الملف. اختر ملفا آخر.» |
| `UPLOAD_PASSWORD_PROTECTED` | «الملف محمي بكلمة مرور. لم يتم حفظ الملف. أزل الحماية ثم اختر ملفا آخر.» |
| `UPLOAD_INFECTED` | «فشل فحص الملف: يحتوي على برمجيات ضارة. لم يتم حفظ الملف. اختر ملفا آخر.» |
| `UPLOAD_EXPANSION_CAP` | «يتجاوز محتوى الملف بعد فك الضغط الحد الآمن. لم يتم حفظ الملف. اختر ملفا آخر.» |
| `UPLOAD_SANITIZATION_FAILED` | «تعذر تأمين الملف: يحتوي على محتوى تنفيذي لا يمكن إزالته. لم يتم حفظ الملف. اختر ملفا آخر.» |
| `UPLOAD_SCAN_UNAVAILABLE` | «تعذر فحص الملف الآن. لم يتم حفظ الملف. أعد المحاولة بعد قليل.» |
| `UPLOAD_TOO_MANY_ATTEMPTS` | «محاولات كثيرة. أعد المحاولة بعد {wait}.» |
| `UPLOAD_STORAGE_UNAVAILABLE` | «تعذر حفظ الملف. أعد المحاولة.» |
| `UPLOAD_INCOMPLETE` | «لم يكتمل نقل الملف. اختر ملفا آخر.» |
| `UPLOAD_INVALID_REQUEST` | «تعذر بدء الرفع. اختر الملف من جديد.» |
| Transfer failure (no server code) | «تعذر إكمال نقل الملف. تحقق من اتصالك ثم أعد المحاولة.» |
| `UPLOAD_MONTHLY_LIMIT` | The quota block's monthly exhausted text (no error panel) |
| `UPLOAD_ACTIVE_LIMIT` | The quota block's active exhausted text (no error panel) |

The transfer-failure row is the page's own cause and not an `intakeErrorCodes`
entry: no response is received, so no code is selected (FR-049). It carries
«إعادة المحاولة» and «اختيار ملف آخر» like the three retryable server codes.
`UPLOAD_INCOMPLETE` is a server answer and is not retryable: its row carries
«اختيار ملف آخر» and no «إعادة المحاولة», and it is neither the page's transfer
failure nor a cancellation — a cancelled or abandoned transfer shows no error
panel at all and returns the page to its choosing state (FR-026, FR-049, FR-050).

**While the refreshed quota state shows an exhausted limit, the error panel
carries neither action.** The retry and «اختيار ملف آخر» are withheld together —
including when the exhausted state's re-read fails — because the choosing state
itself is suppressed and no action is offered that would return the merchant to
an area with no control or to a submission the server would refuse for the limit;
the quota block's exhausted content and its «تحديث» control are the merchant's
only surface, and the panel keeps its heading, its message, and the cause it
states. When a re-read lands under both limits, both actions return to the same
panel in place, without a page reload (FR-015, FR-017, FR-049, AC-020, AC-049).

The invalid-name message carries the neutral label «ملف باسم غير صالح» and never
the refused name; the card is not shown for that refusal (FR-021, FR-025,
FR-028). A safety refusal's message is distinguishable from a size or format
refusal and states that the file was not kept: each of the six rows AC-020 names
carries «لم يتم حفظ الملف», so the criterion's guarantee is read from every one of
them (FR-034, AC-020).

### 4.6 The wait's copy

`{wait}` renders the remaining window in Arabic with the agreement class the
value requires: 1 → «ثانية واحدة», 2 → «ثانيتين», 3–10 → «{n} ثوان»,
11–900 → «{n} ثانية». The seconds are the response's `retryAfterSeconds`,
restated as it decreases; the page never computes the wait from its own clock
(FR-061).

**Only the attempt-bound refusal states a wait.** A transfer failure, a storage
failure, and a scan that could not run offer their retry immediately and state no
interval: R1's envelope sets `retryAfterSeconds` only where the platform owns a
window (`contracts/auth-api.md` §3.3), and the intake's only such window is the
attempt bound (`intake-api.md` §3.3).

### 4.7 The multi-file notice

«تم بدء الملف الأول. يتم رفع ملف واحد في كل مرة، ولم تبدأ الملفات الأخرى.»

## 5. The components

### 5.1 The layer's components

| Component | Responsibility | Contract |
|---|---|---|
| `WfUploadControl` | The choosing state's one control | One control, two presentations: a drop area on a fine pointer, the 56 px action on a coarse pointer; never two in the accessibility tree. Opens the single-file picker (`accept=".xls,.xlsx,.doc,.docx,.pdf"`); Enter and Space open it; a one-file drop emits `select(file)`, and a drop carrying more emits `multi-file(files)` alone so the parent starts the first file and shows the notice once; disabled while a file is in flight and while the quota-exceeded presentation withholds it |
| `WfSelectedFile` | The file's identity during the work | Props `name`, `byteSize`, `format`; renders `WfFileName`, the size surface, and the format label; heading «الملف المختار» is focusable; stays visible through the transfer and the screening phase |
| `WfUploadProgress` | The work's progress | Props `phase: 'transfer' \| 'screening'`, `percent`, `fileName`; emits `cancel`. Transfer: `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow`, the percentage in Latin digits, «إلغاء» present. Screening: indeterminate (no `aria-valuenow`), label «يجري فحص الملف», «إلغاء» absent. Announces the phase changes once, never each percentage |
| `WfQuotaBlock` | The quota's own states | Props `state: 'loading' \| 'ready' \| 'failed'`, `monthly`, `active`, `exhausted: ('monthly' \| 'active')[]`; emits `refresh`. Renders the caption and the two lines; the loading and failure presentations; the exhausted content (numbers hidden when the failure follows it); «تحديث» in the exhausted presentation; hides the counts when it cannot verify them |

### 5.2 The page's components

The outcome panels have one consumer, so they stay in
`apps/web/app/components/upload/` and not in the layer:

| Component | Responsibility |
|---|---|
| `UploadSuccess` | The success panel: heading, body, `/my-files` link, «رفع آخر» (withheld at a limit) |
| `UploadDuplicate` | The duplicate panel: heading, original's name and date, status label, parts link, «رفع آخر» (withheld at a limit), the failed-original note and link |
| `UploadError` | The error panel: heading, the cause's one message, the retry and/or «اختيار ملف آخر» per retryability |
| `UploadNotice` | The multi-file notice |

No page-local component renders a raw colour, spacing, radius, shadow, duration,
or z-index value: every value is a layer token, and a missing token is added to
`packages/ui/app/assets/css/tokens.css` with the component (ADR-128, ADR-129).

## 6. Formats and vocabulary

| Concern | Rule | Surface |
|---|---|---|
| Date | Gregorian, Latin digits, `YYYY-MM-DD` (for example `2026-11-12`), in `Africa/Tripoli` | `packages/shared/src/format/date.ts` |
| Size | Under 1 MB: integer KB (a 1-byte file reads `1 KB`); 1 MB and over: MB with one decimal (for example `2.3 MB`); the decimal point is `.` and the numeral is Latin | `packages/shared/src/format/size.ts` |
| Duration | The four agreement classes of §4.6 | `packages/shared/src/format/duration.ts` |
| Status | `uploaded` → «تم الرفع», `processing` → «قيد المعالجة», `completed` → «اكتمل», `failed` → «فشل»; the raw value is never shown | `packages/shared/src/format/status.ts` |
| Format label | `.xls`/`.xlsx` → «Excel», `.doc`/`.docx` → «Word», `.pdf` → «PDF» | the card's detail line |
| Numerals | Latin digits everywhere, through `WfNumeral`; no Arabic-Indic digit and no grouping the design does not fix | the layer |

The status vocabulary is FR-044's: the four labels are fixed there alone, this
table carries them, and R4 inherits them rather than fixing a second set
(FR-044, FR-065).

## 7. Accessibility

- **Focus.** The rules of §3 are the contract: a state that replaces the block
  holding focus moves focus to its heading (or its first action when it has
  none); an outcome's «رفع آخر» or «اختيار ملف آخر» returns focus to the upload
  control; a removed control never keeps focus (FR-006, FR-059).
- **Two live regions.** The page carries exactly two: a polite region and an
  assertive region, both present and empty at load. A message is written whole
  to one region, replaces that region's previous text, and carries one
  politeness; no region carries two. Every announcement in §3, and the
  cancellation §4.3 states, belongs to exactly one of them — the polite region
  carries the start, the screening phase, the success body, the duplicate body,
  the cancellation, the quota loading state, the quota update, and the
  multi-file notice; the assertive region carries the error's cause, the
  quota-exceeded content, and the quota read failure — and a percentage change
  is never announced (FR-048).
- **The authority of focus and the region.** When a state change moves focus to
  its heading, the heading is the authoritative announcement of the state's name
  and the live region MUST NOT repeat that text; the region carries only the part
  the heading does not — the success body, the duplicate's original, or the
  error's cause — so one change is never spoken twice. When the change moves no
  focus, the region is the whole announcement. The same sentence MUST NOT be
  written to both channels for one change, and a region's text is replaced, not
  appended, on the next change (FR-006, FR-048).
- **Once per change.** A region is written once per change: the quota update is
  announced once per settled read whose counts differ from the previous settled
  read, and a read that returns the same counts is not a change and is not
  announced; the multi-file notice is announced once and is removed from the
  accessibility tree when the next selection or drop replaces it, so the
  replaced notice is neither read nor reachable; a percentage change is never
  announced (FR-015, FR-020, FR-048).
- **The quota block's state.** Loading, exhausted, and read-failure are exposed
  to assistive technology, not only to the eye: the loading presentation's
  accessible state is busy and names the read; the exhausted presentation's
  accessible state names the limit or limits and its «تحديث» control; the
  read-failure presentation's accessible state names the failure and its retry,
  and exposes no count the page cannot verify (FR-015, FR-017).
- **The truncated name.** `WfFileName` hides its visually cut run from assistive
  technology, and the whole name remains the element's accessible name once — the
  cut text is never what a screen reader reads (FR-008, FR-058).
- **Reading order and language of a Latin run.** The format line's names and
  extensions, the card's format label and unit, and the percentage the transfer
  shows are runs of their own: the sentence keeps its right-to-left order, each
  run keeps its own left-to-right order, and no run crosses its neighbouring
  word, separator, bracket, or dash, so «2.3 MB · Excel», «42%», and «(xls،
  xlsx)» read as supplied (FR-063). Each run that carries letters carries its own
  language declaration — English — and is read in English, while the Arabic
  sentence and every numeral, the percent sign included, keep Arabic as their
  language, so no format name is voiced with Arabic letter names and no count
  is voiced in English (AC-051). The file name the merchant supplies is a separate
  run: it is read as supplied, not as a format name, and it carries no language
  mark because a supplied value stands as typed (R1's contract §3.4; FR-008).
- **Keyboard.** The file picker, the drop area's Enter/Space activation, the
  cancel, the retry, the outcome actions, «تحديث», and the links are all
  reachable and operable without a pointer; the manual keyboard-only pass at 320
  and 1280 CSS px completes an upload and is recorded as the plan's Verification
  Notes state (FR-059).
- **Inherited floors.** The touch floor, the focus ring,
  `prefers-reduced-motion`, and the document's language and direction are R1's
  contract §2 and §3.4 and the layer's token contract; this page consumes them
  and restates none. The coarse pointer's 56 px action is FR-006's own value
  (ADR-128 decision 12).
- **Width.** At 320 CSS px the page has no horizontal scroll, the shell's labels
  stay on one line and cut with «…» while keeping their whole text, and the
  card's name follows the same rule (FR-058, FR-060).
- **Scan.** `@axe-core/playwright` passes on every state at 320 and 1280 CSS px
  in both appearances under the plan's definition of "no reported violation"
  (SC-008, AC-045).

The shell's own runtime behaviours — the account menu, the sidebar's two widths,
the drawer's three dismissals and focus return, the bottom bar's scroll-hide, the
overlay stacking, the guest redirect, the footer band's four links at 1024 CSS
px and their drawer copy below it — are verified on this rendered page and are
R1's contract §8, not restated here (FR-051–FR-060, `EX-007`).

## 8. The visual baseline set

Eleven presentations × two widths (1280 and 375 CSS px) × two appearances (light and
dark) = **44 visual baselines**, generated in CI by the Playwright-pinned Chromium with
the self-hosted fonts (ADR-129).

| Presentation | Reference image |
|---|---|
| Idle | `upload--default--1280--light.png`, `upload--default--375--light.png` |
| Selected, transfer, screening, success, duplicate, error | No reference image; composed from this contract (Complexity Tracking row 5) |
| Quota exceeded, loading, read failure, multi-file notice | No reference image; composed from this contract (Complexity Tracking row 5) |

The reference set captures the idle state alone; the five P1 states the slice map
lists and the three quota presentations plus the notice are baselined from the
contract, and the gap is recorded with its owner and review date. The appearance
default is light (ADR-137); the baseline is generated after the appearance is
applied before paint.

## 9. What the page does not render

- `/my-files` (R4), `/parts?file=` (R5), and the four static pages (R11): the
  links point at the registered routes, the platform's ordinary not-found answer
  appears there until each ships, and no placeholder page is added — roadmap
  **defect 1** records the My Files page's missing owner before R4 and defect 20
  the Parts page, while **defect 19** covers the frame's four static-page links
  (its destination half closes at R10, the pages ship at R11).
- The queue, the worker, the processing status after `uploaded`, and every
  notification: R3 and R9. The success text describes the pipeline; the slice
  creates no job and no notification (FR-047).
- Any administrator surface, any price, cart, order, or payment surface, and any
  user-to-user surface: outside the product scope (Principles VI, and the Product
  Register).
- A second shell, a second component library, and any design value outside
  `packages/ui` (Principle IX, ADR-097).

## 10. What the tests assert

- Every string in §4 is rendered exactly once for its state or cause, and no
  other string is; a cause without a message fails the copy test.
- No platform string carries an emoji, an Arabic-Indic digit, or a typed numeral
  where a value belongs; every numeral is Latin.
- The neutral label appears for the invalid-name cause and the refused name
  appears nowhere.
- An outcome shown while the refreshed quota state displays an exhausted limit
  renders neither «إعادة المحاولة» nor «اختيار ملف آخر» — the failed re-read
  included — and both return in place once a read lands under both limits
  (FR-017, FR-049, AC-049).
- The status vocabulary is the four labels and no raw value.
- The date, size, and duration surfaces produce the forms §6 fixes.
- The focus and announcement rules of §3 and §7 hold on every state change.
- A departure during the transfer issues the bodyless `DELETE` once, and the
  page never shows its `204` as an error; a departure during the screening phase
  issues nothing (FR-050).
- The 44 visual baselines exist and match; the idle pair matches its reference images.
  They are a different sample from the 44 accessibility presentations the plan's
  Verification Notes fix at 320 and 1280 CSS px: the visual set is measured at
  1280 and 375 CSS px, and neither set enters the other's measurement.
