# Slice map — the Precision contract across the fifteen slices

**Status**: reference map, not a specification. It describes what the external
design lab shows and what the constitution fixes; it does not bind a slice.
**Contract**: ADR-128 (tokens and rendering rules).
**Gate**: ADR-129 (the baseline chain).
**Scope**: fifteen slices and twenty-eight pages. Sixteen non-administrator
pages have a full lab reference; the 404 is a composition reference only; the
eleven administrator pages do not and are composed from the contract.

## Composition

The lab's six models share one composition: the same pages, blocks, order, and
states. What changes between models is colour, type, shape, density, surface,
and the icon language. The product adopts the shared composition and the
Precision tokens; the composition itself is described per slice below. The
lab's own statement is the premise of ADR-128, and the product's specification
owns the binding version of each page.

## Summary

| Slice | Pages | Lab reference | Status |
|---|---|---|---|
| R1 Identity and foundation | Log In, Sign Up, Forgot Password; the frame is built here | yes, three auth pages; the shell is built here but no page here renders it | reference |
| R2 File intake | Upload Catalog | yes | reference |
| R3 Catalog extraction | none | none | no page |
| R4 My Files | My Files | yes | reference |
| R5 Parts search | Home, Parts («بحث وفر») | yes | reference |
| R6 Catalog files page | Catalog | yes | reference |
| R7 Profile | Profile | yes | reference |
| R8 Cart (bookmarks) | Cart | yes | reference |
| R9 Notifications | Notifications | yes | reference |
| R10 Messaging | Messages | yes | reference |
| R11 Support surfaces | Contact, FAQ, Privacy Policy, Terms of Use, 404 | yes; the 404 is composition only | reference |
| R12 Delivery and operations | none | none | no page |
| R13 Admin application | Log In, Dashboard, Users, Files, Suppliers, Parts, Messages, Notifications, Settings, Contact messages | none | composed from the contract |
| R14 Audit log | Audit Log | none | composed from the contract |
| R15 Retention | none | none | no page |

## Lab defects seen in the reference set

The reference images are captured from the lab as it stands. Six lab
behaviours are not the product's contract and are flagged in the manifest:

1. The 404 page renders the previous appearance (teal), not Precision. The
   cause is that `error.vue` renders outside `app.vue` and carries no
   `data-design`, so the layer's root tokens paint it; the product makes
   Precision the layer's root, not an override, and composes the page from
   ADR-128. The image is a composition reference only.
2. The parts table shows page size 10. The product uses 20/50/100, with 20 as
   the default (ADR-137).
3. The notifications list has no explicit empty state. The product adds one.
4. The profile shows a «نشط» badge. The product does not.
5. The contact page shows an email address; the product transfers none of it.
   The privacy page's retention sentence is adopted (90 days from the upload,
   ADR-131); its account-deletion claim is not transferred.
6. When the lab's bottom bar hides, the raised search action's top edge stays
   visible at the viewport edge. The product hides the action with the bar
   (ADR-132).

The footer band is not among them: it is not rendered below 1024px
(`main.css`), and an earlier reading of the 375 capture mistook the statistics
strip for the footer.

## Not transferred

| Kind | Item | Reason |
|---|---|---|
| Lab tool | The model switcher, `?design=`, `?slow=`, the lab bar, `useDesign`, `?role=` | None exists in the product |
| Content | The email address | No email exists in the platform |
| Content | Account deletion through Contact | The merchant cannot delete the account |
| Content | Page size 10 | The product uses 20/50/100 |
| Content | Sample files, parts, cities, notifications, and messages | Replaced by product data |
| Behaviour | One control opens and closes the drawer | «المزيد» opens; the collapse control closes |
| Behaviour | The distinct lockout alert on Sign In | The product shows the uniform failed-sign-in message |
| Accessibility | The «عرض كل النتائج» control is mouse-only | The product handles pointer and keyboard |
| Accessibility | The notifications list has no explicit empty state | R9 adds one |
| Accessibility | The 404 title is fixed | The product branches on the status code |
| Content | The «نشط» badge on the profile | An administrator concept |
| Content | The fixed «آخر تحديث 2026-10-25» line | Removed or made a real date |
| Content | The sample statistics and sample family counts (1248, 316, 48217, 9034; 6210 …) | Placeholder values; ADR-130 forbids an invented count |
| Naming | «رفع ملف» versus «رفع كتالوج» | «رفع ملف» is the short visible action; «رفع كتالوج» is the destination and page name |

## How to read an entry

Each entry carries nine fields: pages, blocks and order, states, copy,
behaviour, what is not transferred, the token reference, the reference
screenshots, and the open questions a specification must answer. The entries
use the constitution's page names and the lab's composition; a normative
statement belongs to the slice's specification, not here.

## R1 — Identity and foundation

**Pages.** Log In, Sign Up, Forgot Password. The shared frame is built in this
slice but no page here renders it.

**Blocks and order.** All three pages use the bare layout: the wordmark, the
page title, one form card, and the links to the other bare pages (sign-in
carries two, to sign-up and password recovery; sign-up and password recovery
each carry one, back to sign-in). Sign Up carries the
full name, the Libyan mobile number with a fixed `+218` and no dial-code
selector, the password, the city combobox, and the optional shop name, then the
one-time-code step and the done state. Sign In carries the mobile number and
the password, with the uniform failed-sign-in message. Forgot Password carries
the mobile number, the code step, the new password, and the done state.

**States.** Form, code, done, error, loading, disabled. The sign-in
response is uniform whether or not the account exists; five consecutive failed
attempts lock the account for fifteen minutes.

**Copy.** The lab's Arabic labels are the reference; the specification fixes the
final strings. The OTP expiry copy is a plan value; there is no lockout copy.

**Behaviour.** OTP at sign-up; no OTP at sign-in; the city list is one fixed
dataset; a successful password change ends every session; the frame's routes are
fixed by the frame's decision record. The frame's bottom bar hides after
downward scroll and returns on the first upward scroll (ADR-132); a first visit
is light and a stored preference wins (ADR-137); the icons are IconPark's
outline cut (ADR-137).

**Not transferred.** The lab's tools (`?role=`, `?state=`, `?slow=`, the lab
bar) and the sample accounts.

**Tokens.** ADR-128; the bare layout's type, focus ring, and touch floor.

**Screenshots.** P0 at 1280 and 375 light; P1 for the done state and the
lab-only locked state; P2 for the dark sign-in. The OTP/code state and the
post-submit uniform-response state are not captured; the slice's plan must
record the gap in its Complexity Tracking table with an owner and a review date
(the rule in `README.md`).

**Resolved 2026-10-27.** The clarification session settled the R1 questions
recorded for it, and the specification now carries the binding answers: FR-024
states that the surface is the constitution's (the footer band under ADR-096,
with ADR-127's narrow-screen placement) and that this slice fixes the routes
alone; FR-052 moved after FR-051 so the functional requirements read in numeric
order, and cites ADR-127 and ADR-128; and the locked state carries no copy of its
own, the uniform failed-sign-in message being the only text shown, so this map's
lockout alert is not carried into the product. The literal copy the
specification leaves open is a plan value, not a map question. The specification
and its Clarifications section are the authority.

## R2 — File intake

**Page.** Upload Catalog.

**Blocks and order.** The page header; the monthly and active quota state; the
drop area on a fine pointer or the single 56px «رفع ملف» action on a coarse
pointer; the selected-file card; the progress state; the duplicate outcome; the
success state; the error state.

**States.** Idle, selected, uploading, success, duplicate, error, quota
exceeded, loading. A duplicate names the original with its upload date and
links to the parts that came from it; no duplicate is stored.

**Copy.** «رفع ملف» is the short visible action; «رفع كتالوج» is the page and
destination name. The format and size line sits under the action.

**Behaviour.** Validate size and content type before storage; compute the
content hash; enforce the monthly and active quotas; show progress; keep the
catalog record in My Files.

**Not transferred.** The lab's sample files and its `?state=` tools.

**Tokens.** ADR-128; the upload action, progress, and error surfaces.

**Screenshots.** P0 at 1280 and 375 light; P1 for selected, progress, duplicate,
success, and error.

**Open questions.** The quota copy; the duplicate link target; the exact
format-and-size line.

## R3 — Catalog extraction

**Pages.** None. The pipeline has no page; its outcomes appear in My Files and
Notifications.

**Blocks and order.** Not applicable.

**States.** The processing, completed, and failed outcomes are surfaces in R4
and R9, not a page here.

**Copy.** The status vocabulary is fixed by the specification that ships the
surfaces.

**Behaviour.** The worker pipeline; no visual surface.

**Not transferred.** Nothing; there is no lab page.

**Tokens.** Not applicable.

**Screenshots.** None.

**Open questions.** The status vocabulary and the failure copy.

## R4 — My Files

**Page.** My Files.

**Blocks and order.** The page header; the way to Upload Catalog; the file
table with its status, date, size, and actions; the empty state; the loading
state; the delete dialog; the retry action for a failed file.

**States.** Loaded, loading, empty, failed with retry, delete dialog, warning.
The table's pagination is 20/50/100.

**Copy.** The table headers and the status labels are the lab's reference; the
specification fixes the final strings. The delete confirmation names the file
and the consequence.

**Behaviour.** A row opens Parts filtered by that file; delete runs the cascade;
retry re-queues without a new upload; the upload action links to R2's page.

**Not transferred.** The lab's sample files, the page size 10, and the lab's
tools.

**Tokens.** ADR-128; the table geometry, the sticky header, the skeleton, and
the confirmation overlay.

**Screenshots.** P0 at 1280 and 375 light; P1 for loading, empty, delete dialog,
failed/retry, and warning.

**Open questions.** The status vocabulary; the delete copy; the warning copy.

## R5 — Parts search

**Pages.** Home and Parts («بحث وفر»).

**Blocks and order.** Home carries the platform name, the quick search field
with suggestions over part name, part number, and original number, the four
statistical cards, the nine destination cards, six part-family cards with real
counts that open Parts filtered by family (ADR-130), and the three most recently
updated catalog files with a «كل الملفات» action. Parts carries the search
field, the collapsed filter button, the in-page filter panel (rows on a narrow
screen, a labelled grid from 768px), the active-filter chips, the result count,
the parts table, and the pagination.

**States.** Loaded, guest, loading, refetch, empty, filter panel open and
closed, active chips, price error, `?file=<id>`, `?q`. The guest receives the
same table and filters without the price column, its filter, and its sort.

**Copy.** «السعر (د.ل)», «من», «إلى», «فلترة», «عرض N قطعة», «اسحب الجدول
أفقياً», «بدون سعر», «كل الملفات».

**Behaviour.** Root-aware Arabic search over the three fields by partial match;
multi-select filters over car model, type, catalog file, and supplier; a price
range over the primary amount; sorting on every column except type; pagination
20/50/100; `?file=<id>` filters by one catalog; the filter panel opens inside
the page, not as a modal; the table geometry is fixed and no column is pinned
horizontally.

**Not transferred.** Page size 10, the lab's sample rows, and the lab's tools.

**Tokens.** ADR-128; the table, filter, chip, price, card, and loading rules.

**Screenshots.** P0 for Home and Parts at 1280 and 375 light; P1 for guest,
loading, refetch, empty, filter panel, chips, price error, `?file`, `?q`, and the
scrolled Home at 375.

**Open questions.** The suggestion behaviour; the live-count number format; the
price-error copy; the exact empty-state copy.

## R6 — Catalog files page

**Page.** Catalog.

**Blocks and order.** The page header; the table of every uploaded catalog
file; the empty state; the loading state.

**States.** Loaded, loading, empty, error.

**Copy.** The table headers and the empty-state sentence are the lab's
reference.

**Behaviour.** A row opens Parts filtered by that file.

**Not transferred.** The lab's sample files and tools.

**Tokens.** ADR-128; the table and skeleton rules.

**Screenshots.** P0 at 1280 and 375 light; P1 for loading and empty.

**Open questions.** The columns; the file open control; the empty copy.

## R7 — Profile

**Page.** Profile.

**Blocks and order.** The page header; the account-details form (full name,
city, optional shop name); the password change; the sessions list with the
end-every-session action; the save states.

**States.** Loaded, saving, success, error, session dialog.

**Copy.** «حسابي», «إعدادات», «تسجيل الخروج», «إنهاء كل الجلسات». The lab's
«نشط» badge is an administrator concept and is not transferred.

**Behaviour.** Edit the non-identifier details; change the password (which ends
every session); end every session at once; the settings section is the target of
the account menu's «إعدادات».

**Not transferred.** The «نشط» badge and the lab's sample account.

**Tokens.** ADR-128; the form, focus, and confirmation rules.

**Screenshots.** P0 at 1280 and 375 light; P1 for saving, success, error, and
the session dialog.

**Open questions.** The settings anchor; the status badge's absence; the
session-list copy.

## R8 — Cart (bookmarks)

**Page.** Cart.

**Blocks and order.** The page header; the count `N / 99`; the bookmarked-parts
table or list; the remove action; the empty state; the full notice.

**States.** Loaded, empty, full, remove.

**Copy.** «سلة المشتريات ممتلئة» for the full notice; `N / 99` for the count.
The cart carries no price, no quantity, and no checkout.

**Behaviour.** Add and remove a part; the maximum is 99; the full notice appears
at the ceiling; the cart is a personal bookmark list.

**Not transferred.** The lab's sample parts and tools.

**Tokens.** ADR-128; the table, empty, and notice rules.

**Screenshots.** P0 at 1280 and 375 light; P1 for loaded, empty, full, and
remove.

**Open questions.** The full-notice trigger; the empty copy.

## R9 — Notifications

**Page.** Notifications.

**Blocks and order.** The page header; the notification list; the unread marker;
the mark-one and mark-all actions; the empty state; the loading state.

**States.** Loaded, unread, mark all, loading, empty. The lab has no explicit
empty state; the product adds one. The unread count lives in the header only.

**Copy.** The lab's notification copy is the reference; the empty state's
sentence is fixed by the specification.

**Behaviour.** Mark one or all as read; the three notification kinds
(processing, administrative, reply); the header's count is the only count.

**Not transferred.** The lab's sample notifications; the missing empty state is
a defect the product corrects, not a behaviour to copy.

**Tokens.** ADR-128; the list, empty, and loading rules.

**Screenshots.** P0 at 1280 and 375 light; P1 for unread, mark all, loading, and
empty.

**Open questions.** The empty copy; the kind labels.

## R10 — Messaging

**Page.** Messages.

**Blocks and order.** The page header; the single thread; the composer; the sent
state; the refresh notice.

**States.** Thread, sent, empty, loading.

**Copy.** The refresh notice tells the merchant that the administrator's reply
appears after a refresh. The composer's placeholder is the lab's reference.

**Behaviour.** One thread between the merchant and the administrator; a sent
message is visible immediately; the reply appears after a refresh unless a
live-update mechanism is specified; the composer is sticky; Enter sends at
1024px and up, and Shift+Enter adds a line.

**Not transferred.** The lab's sample messages and tools.

**Tokens.** ADR-128; the thread, composer, and focus rules.

**Screenshots.** P0 at 1280 and 375 light; P1 for the sent state.

**Open questions.** The empty-thread copy; the refresh-notice wording.

## R11 — Support surfaces

**Pages.** Contact, FAQ, Privacy Policy, Terms of Use, 404.

**Blocks and order.** Contact carries the contact information (phone and
address; no email) and the name, phone, and body form with the honeypot, the
minimum time-to-submit, and the rate limit. FAQ carries the ten questions in an
accordion. Privacy Policy and Terms of Use carry static sections. 404 carries
the title, the message, and the way home; it branches on the status code.

**States.** Form, success, error, open FAQ item, 404.

**Copy.** The lab's static copy is the reference. No email address and no
account-deletion claim are transferred. The privacy policy's retention sentence
states 90 days from the catalog file's upload (ADR-131).

**Behaviour.** The form reaches the administrator; no CAPTCHA; the four static
pages are reached from the footer band or the drawer's bottom links; the 404
page is bare.

**Not transferred.** The email, the account-deletion claim, and the lab's sample
contact data.

**Tokens.** ADR-128; the bare layout, form, accordion, and 404 rules.

**Screenshots.** P0 for all five at 1280 and 375 light; P1 for form success,
form error, and an open FAQ item. The 404 image is a composition reference
only: the lab renders it in the previous appearance, not Precision.

**Open questions.** The final legal copy; the contact-information source; the
404 copy for non-404 statuses.

## R12 — Delivery and operations

**Pages.** None. The environments, health checks, and operations surfaces are
not product pages.

**Blocks and order.** Not applicable.

**States.** Not applicable.

**Copy.** Not applicable.

**Behaviour.** Not applicable.

**Not transferred.** Nothing; there is no lab page.

**Tokens.** Not applicable.

**Screenshots.** None.

**Open questions.** None for the visual map.

## R13 — Admin application

**Pages.** Log In, Dashboard, Users, Files, Suppliers, Parts, Messages,
Notifications, Settings, Contact messages. Eleven administrator pages in total
with R14's Audit Log.

**Blocks and order.** The administrator application carries its own shell and
header: the platform's logo and an account control whose menu offers sign-out
only, because there is no administrator profile or merchant settings page. The
pages are table-first, with forms and dialogs where an action needs them; the
Dashboard carries the statistics and reports.

**States.** Loading, empty, error, success, disabled, and the confirmation
dialog for destructive actions.

**Copy.** The page titles and actions are the register's; the final strings are
fixed by the administrator slice's specification.

**Behaviour.** Separate login; full platform management; every administrator
operation writes the audit log; a blocked user keeps the data and loses
sign-in.

**Not transferred.** There is no lab reference; nothing is copied. The
composition comes from the contract and the register.

**Tokens.** ADR-128; the table, form, dialog, and shell rules.

**Screenshots.** None from the lab. Baselines are generated in the project when
the administrator slice ships.

**Open questions.** The administrator shell's composition; the Dashboard cards;
each table's columns; the permission boundaries.

## R14 — Audit log

**Page.** Audit Log.

**Blocks and order.** The administrator shell; the read-only table of every
administrator operation.

**States.** Loading, empty, error.

**Copy.** The column names and the empty-state sentence are fixed by the
administrator slice's specification.

**Behaviour.** Append-only; read-only; every administrator operation writes a
row.

**Not transferred.** There is no lab reference.

**Tokens.** ADR-128; the table and skeleton rules.

**Screenshots.** None from the lab; generated in the project.

**Open questions.** The columns; the filters; whether an export exists.

## R15 — Retention

**Pages.** None. The privacy copy is R11's; the 90-day period is reserved here.

**Blocks and order.** Not applicable.

**States.** Not applicable.

**Copy.** The lab's «90 يوماً من الرفع» is adopted: the period is counted from
the catalog file's upload (ADR-131).

**Behaviour.** Automatic deletion of a catalog 90 days after its upload, with the
search index aligned to the same window.

**Not transferred.** The account-deletion claim.

**Tokens.** Not applicable.

**Screenshots.** None.

**Open questions.** The deletion notice.

## Screenshot matrix

| Priority | Coverage |
|---|---|
| P0 | Every non-administrator surface at 1280 and 375, light: 17 surfaces, 34 images |
| P1 | The states named in each entry: code, done, selected, progress, duplicate, success, error, loading, refetch, empty, filter panel, chips, price error, delete dialog, session dialog, full, unread, sent, open FAQ item, scrolled |
| P2 | The dark appearance where the lab supports it |

The naming convention is
`<slice>/<page>--<state>--<width>--<theme>.png`. The manifest at
`screenshots/manifest.json` carries `kind: reference`, the source, the capture
date, and one entry per image. No image is named `baseline`.

### Capture status (2026-10-27)

Captured: P0 for all seventeen non-administrator surfaces at 1280 and 375 light
(34 images), the URL-driven states — locked, done (sign-up and forgot), guest,
loading (Home, Parts, My Files, Notifications), refetch, full cart — at both
widths (20), the filter panel at both widths (2), the dark appearance for Home,
Parts, and Sign In (3), and the Home page scrolled at 375 with the bottom bar
hidden (1). Total: 60 images, 2.21 MB.

Both rules the contract fixes have a lab reference: the outline icon cut and the
light default are what every capture renders. The baseline is still generated in
the project, never copied from the lab (ADR-129); the gate captures both
appearances and does not read `prefers-color-scheme` (ADR-137).

Not yet captured: the interaction-driven states named in the entries — R1's
OTP/code step and its post-submit uniform-response state; upload
selected, progress, duplicate, success, and error; the delete dialog; the
session dialog; notification unread, mark-all, and empty; the sent message; the
contact form's success and error; the open FAQ item; and the parts empty, chips,
price-error, `?file`, and `?q` states. A later capture pass completes them; the
entries name them so the gap is visible.

### Screenshot index

| Slice | Directory |
|---|---|
| R1 | `screenshots/R1/` |
| R2 | `screenshots/R2/` |
| R4 | `screenshots/R4/` |
| R5 | `screenshots/R5/` |
| R6 | `screenshots/R6/` |
| R7 | `screenshots/R7/` |
| R8 | `screenshots/R8/` |
| R9 | `screenshots/R9/` |
| R10 | `screenshots/R10/` |
| R11 | `screenshots/R11/` |

R3, R12, R13, R14, and R15 have no reference image: the first two have no page,
and the administrator pages are composed from the contract.

## Open questions index

The entries above name the questions a specification must answer. They are
collected here so a slice's specification can find them without reading the
whole map.

| Slice | Questions |
|---|---|
| R1 | None open; resolved 2026-10-27: the lockout copy, FR-024's surface sentence, FR-052's order and citations |
| R2 | Quota copy; duplicate link target; format-and-size line |
| R3 | Status vocabulary; failure copy |
| R4 | Status vocabulary; delete copy; warning copy |
| R5 | Suggestion behaviour; live-count format; price-error copy; empty copy |
| R6 | Columns; file open control; empty copy |
| R7 | Settings anchor; status badge's absence; session-list copy |
| R8 | Full-notice trigger; empty copy |
| R9 | Empty copy; kind labels |
| R10 | Empty-thread copy; refresh-notice wording |
| R11 | Final legal copy; contact-information source; non-404 status copy |
| R13 | Administrator shell; Dashboard cards; table columns; permissions |
| R14 | Columns; filters; export |
| R15 | The deletion notice |

## Handoff

The map is ready for R1's plan. `/speckit.clarify` was applied to R1 on
2026-10-27, and ADR-130, ADR-131, and ADR-132 landed the same day. ADR-133
registered `docs/design` in References and ADR-134 made this map reach the
commands that read it. The next step is `/speckit.plan` for R1. The plan consumes
ADR-128 and this map, and records the conformance gate ADR-129. No specification
text is edited here; the clarification session recorded the corrections in the
specification itself.
