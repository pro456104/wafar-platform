# Feature Specification: Identity and Foundation

**Feature Branch**: `001-identity-foundation`

**Created**: 2026-10-10

**Status**: Clarified — ready for planning

**Input**: Parent roadmap: ROADMAP.md → R1. User description: "R1 — Identity and foundation. A merchant creates an account with a full name, a Libyan mobile number on +218 entered without any dial-code selector, a password, a city chosen from a fixed searchable list of every Libyan governorate, city, and area, and an optional shop name. The number is confirmed at sign-up by a one-time code sent to it; signing in afterwards needs no code. The merchant can sign in, sign out, sign out of every device at once, and recover a forgotten password through a one-time code sent to the registered number. No sign-in, sign-up, or recovery response ever reveals whether an account exists, and an account is locked for fifteen minutes after five consecutive failed sign-in attempts. A signed-in session can be ended by the platform at any time, and changing the password ends every existing session. The list of Libyan cities is fixed here as the single list the sign-up form offers. The account carries a status: active, or blocked. A blocked account keeps its data and its public contributions but can no longer sign in. No merchant can delete their own account, and no one becomes an administrator through public sign-up: the platform's administrator account is created by the operator and must change its password at first sign-in. This slice also establishes what every later slice needs to exist first — the platform's base project and its first working pages: sign-up, sign-in, and password recovery — inside the product's shared page frame (header, a sidebar that narrows to icons on a wide screen or becomes a drawer on a narrow one, a theme switch, an icon set, and the product's type). That frame appears on the public pages and the merchant's area only, never on the sign-up, sign-in, recovery, error, or static pages, and it carries the product's means of reaching those static pages. Sign-up is protected against automated abuse by a hidden field, a minimum time before submitting, and a limit on how often one client may submit; no CAPTCHA is ever used."

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
       - the decision register — `docs/DECISIONS.md`'s index and the volumes
         under `docs/decisions/` (ADR-001 … ADR-126). A specification that
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
     plan's Complexity Tracking table.
-->

## Clarifications

### Session 2026-10-10

- Q: Does this slice deliver a page that renders the shared frame, or is the frame delivered and verified structurally with its first rendering page arriving later? → A: The frame is delivered and verified structurally; this slice adds no page whose purpose is to render it. The first page that composes the frame arrives with a later slice.
- Q: Does the rate limit cover every authentication operation or only the sign-up form? → A: Every authentication operation — account creation, sign-in, and password recovery — in addition to the sign-up form's hidden field and minimum time-to-submit.
- Q: Does the specification fix the one-time code's behaviour, or leave it to the plan? → A: The specification states the behaviour — the code expires, a new code is requestable subject to a limit, and the code is refused after a bounded number of incorrect entries — while the numeric values are left to the plan's Constitution Mandated Values.
- Q: When the password changes, does the current session end too, or only the other sessions? → A: Every existing session ends, including the one the change was made from; the merchant signs in again with the new password.
- Q: Before the code is verified, does a `User` row exist, or is the account created only after verification? → A: No `User` row is created until the correct code is entered; pending sign-up data is held outside `User`, so `User.status` stays the closed two-value set `active` / `blocked`.
- Q: Must the platform enforce a password policy when a password is set, and what is its nature? → A: Yes — a password policy is enforced at sign-up and on password change: a minimum length plus rejection of common or breached passwords, with the exact numeric values left to the plan's Constitution Mandated Values.
- Q: Is the chosen appearance (dark or light) stored on the account or only in the browser? → A: In the browser only, per device; no appearance preference is stored on the account, so no entity gains a field. The default appearance on a first visit is not fixed by this specification.
- Q: For the pages this slice does not ship (the error page and the four static pages), does this slice verify the frame's absence, or is that deferred? → A: Deferred — AC-023 and SC-005 are narrowed to the pages this slice ships (sign-up, sign-in, password recovery); the error and static pages stay bound and are verified by the slice that ships them, and this slice creates no placeholder page.
- Q: Does this slice deliver the administrator's sign-in surface and the forced password change, or only the provisioning action with the rule enforced without a page? → A: Only the provisioning action and the enforcement — the slice creates the administrator account through an operator-run provisioning action and records the forced-password-change requirement and its state on the account, verified at the behaviour level rather than through a shipped page; the administrator's separate sign-in surface arrives with a later slice, and AC-030 is narrowed to that boundary.
- Q: Does this slice build the frame's controls that later slices own — the account control and its menu, and the means of reaching the static pages? → A: Yes, the frame is delivered whole: its header controls — the logo/home and account controls and the account menu — and its means of reaching the static pages are built and verified structurally, while each destination's behaviour and data are owned by the slice that owns it (the Profile page, the Notifications page); the decision on which surface carries the static-page links is recorded as an ADR by the slice that ships the first page carrying the frame, not here (revised 2026-10-11: this slice chooses and builds that surface and records the decision here — see Session 2026-10-11).
- Q: When the sign-up form is submitted with a number that already has an account, does the flow continue to the code step, and is the submitted password ever applied to the existing account? → A: The flow continues identically and the code is sent to the number whether or not an account exists, so every step's response is the same; when the correct code is entered for a number that already has an account, no second account is created and the submitted password is not applied, and the person is directed to sign in or to recover the password.
- Q: Does this slice introduce a registered entity for the pending sign-up verification state, the one-time codes, and the lock state, or keep them outside the twelve-entity register? → A: No third entity — the pending sign-up data and the one-time codes are transient verification state held in an expiring store outside the entity register; the consecutive-failed-attempt count, the lock, and the forced-password-change requirement are account properties added as fields on `User`, through a Product Register amendment and a decision record in this slice.
- Q: What happens when the one-time code cannot be sent — a messaging-channel failure or an undeliverable number — and does the failed attempt count against the limit on re-requesting a code? → A: The person sees an explicit, retryable failure state; the pending sign-up stays valid until its own expiry; and a failed send does not count against the limit on re-requesting a code.
- Q: After the one-time code is verified at sign-up, is the merchant signed in automatically, or directed to sign in separately? → A: The merchant is signed in automatically — entering the correct code creates the session and the account becomes usable in place, with no separate sign-in step.
- Q: When a merchant resets a forgotten password through the recovery flow, does that end every existing session of the account, the way a password change does? → A: Yes — a reset counts as a password change: every existing session of the account ends, and the merchant signs in with the new password.
- Q: This slice ships no page that carries the shared frame, yet it requires a merchant to be able to sign out, including from every device. Where is that action offered in this slice? → A: Nowhere as a rendered surface in this slice — sign-out and sign-out-of-every-device are delivered as behaviour and verified by the integration tests, and the control arrives as the third item of the account menu, which is part of the frame's composition and is verified structurally here; because no page renders the frame yet, the menu is exercised at runtime by the slice that ships the first page carrying it; the US2 end-to-end journey in the Test Coverage Request is narrowed to sign-in.
- Q: During password recovery, when the submitted number has no account, is the one-time code actually sent to that number as it is at sign-up, or is the response merely uniform with no message dispatched? → A: The code is sent whether or not the number has an account — the same rule sign-up follows — so the response and the behaviour are both indistinguishable, and the dispatch stays bounded by the rate limit on authentication operations.
- Q: Does the appearance a person chose (dark or light) apply to the bare pages this slice ships — sign-up, sign-in, and password recovery — or do those pages always render in the default appearance? → A: It applies to every page, bare pages included, and is applied before the page is painted; the switch itself stays a frame control and is not offered on a bare page. The default appearance on a first visit is not fixed by this specification.
- Q: How should the platform express the fifteen-minute lock after five consecutive failed sign-in attempts, so that a sign-in response still does not reveal whether the number has an account? → A: The refusal stays uniform — an attempt made while the account is locked is refused with the same response text, the same status, and the same response path as any other failed sign-in, and no message, timing difference, or other signal distinguishes a locked account from a wrong password or an unknown number; the lock withholds acceptance only, so FR-008 and SC-004 stay unqualified and no documented exception is recorded.
- Q: Where does a person arrive after the mobile number is verified at sign-up and after signing in, given that this slice ships no page carrying the frame and no page in the merchant's area? → A: Nowhere in this slice — each journey ends at the platform's own response (the session created after verification, or the session created after sign-in), the session's existence is verified at the behaviour level and by the integration tests, and the first page a signed-in merchant lands on arrives with the slice that ships the merchant's area; this slice adds no landing page and AC-023 and SC-005 keep the three bare pages as their only list.
- Q: Does a session end only when it goes unused, or also at an absolute maximum lifetime, however active the merchant is? → A: Both clocks — the session ends when the session timeout elapses with no activity, and it also ends when it reaches its absolute maximum lifetime, however active the merchant is; the two values are stated numerically under Constitution Mandated Values, and AC-015 and the session unit tests cover both.
- Q: When a new one-time code is requested, does the previous code stop being valid, and is the bound on incorrect entries counted per code or over the whole verification? → A: Exactly one code is valid at any moment and the bound is counted over the whole verification - requesting a new code invalidates the previous one once the new message is dispatched and does not reset the count of incorrect entries, so the guessing bound holds across re-requests and is governed only by the limit on requesting new codes. (Revised 2026-10-22: the previous code stops being valid when the replacement is dispatched, so a failed send leaves it valid — see the Session 2026-10-22 bullet on a failed re-request.)
- Q: Does a successful password reset through the recovery flow lift the account's fifteen-minute lock, or does the lock run its full duration? → A: The lock runs its full duration — a successful reset neither lifts the lock nor resets the count of consecutive failed attempts, because the lock is a time bound independent of the password and proving ownership of the number does not waive it; the merchant signs in with the new password once the fifteen minutes have passed.

### Session 2026-10-11

- Q: How far does the sign-up flow's indistinguishability rule reach — does it cover the code-entry step too, given that the outcome necessarily differs once the correct code is entered (a number with no account creates a session, a number that already has an account does not)? → A: The rule is bounded to the form's response, the following step, and the sending of the code; entering the correct code proves ownership of the number, so the differing outcome past that point is legitimate and the rule stops there — FR-006, AC-006, and SC-004 are bounded to those steps.
- Q: When the holder of a blocked account tries to sign in, does the refusal stay uniform — revealing neither the block nor the account's existence — and does the enumeration criterion cover a blocked account as it covers a locked one? → A: The refusal stays uniform — the same text, the same status, and the same response path as every other failed sign-in — and nothing at any step tells the person the account is blocked or that it exists; SC-004 is extended to cover an attempt against a blocked account as it already covers a locked one, and no exception to FR-008 is recorded.
- Q: When the fifteen minutes elapse, does the count of consecutive failed attempts clear, and do refusals made while the account is locked count as further failed attempts? → A: The lock is a time bound alone — at its expiry the count clears, so a single later failure does not re-lock the account, and an attempt refused while the lock is in force is not counted as a further failed attempt and never extends the lock; AC-010 and SC-007 assert both.
- Q: In the password-recovery flow, is the indistinguishability rule bounded to the request and the code dispatch — as in sign-up — given that a number with no account has nothing to reset? → A: Bounded the same way — after the correct code is entered, ownership of the number is proven and the platform states explicitly that no account exists for it, rather than continuing as though a reset had occurred; FR-015 and AC-017 carry the bound, and SC-004 bounds the recovery flow as it bounds sign-up.
- Q: Is the set of valid Libyan mobile prefixes on +218 fixed in this slice as reference data named in a decision record — as the city list was — or left to the plan? → A: Fixed here, once — recorded as one reference dataset for accounts and named in a decision record alongside the city list; the platform decides whether a +218 number is a mobile number from that dataset rather than from a rule of its own, so FR-003 and AC-003 are testable without judgement.
- Q: Does this slice choose and build the surface that carries the static-page links and record the decision, or deliver the four routes only and defer the surface? → A: This slice chooses the surface, builds it inside the frame, and records the decision as a decision record — revising the earlier deferral, because the frame is delivered whole and ROADMAP assigns the choice and its record to R1; FR-024, AC-026, US5, and the matching Assumptions bullet are revised accordingly.
- Q: At the administrator's first sign-in, is the sign-in accepted and the account then restricted to the password change, or is the sign-in itself refused until the password is changed? → A: The first sign-in is accepted and the account is restricted so that no action other than the password change is permitted until the change is made; the sign-in itself is never refused, so FR-028 and AC-030 are reworded and the earlier "a first sign-in is refused" reading is removed. (Revised 2026-10-22: the restriction withholds every product action that needs the account's ordinary permissions, but not the password change itself or ending the session; see Session 2026-10-22.)
- Q: When the holder of a blocked account resets the password through the recovery flow, does the reset complete while the block stands, or is the request refused because the account is blocked? → A: The reset completes — a new password is set and every existing session ends — but the account's block stands, so no access is granted; the outcome is stated only after ownership of the number is proven, and FR-014 and the matching edge case carry the rule.
- Q: Does this slice deliver the act of blocking an account — the action that sets the status to blocked — or does it deliver the status and everything that follows from it, with the act arriving with the slice that ships the administrator's Users page? → A: The act is not delivered here: this slice delivers the status, the uniform refusal a blocked account receives, and the withdrawal of the sessions the account already held, and its tests reach the blocked state directly; the act of blocking arrives with the administrator's Users page (R13), where the audit record every administrator operation requires also exists, and US4's Independent Test is narrowed to that boundary.
- Q: Does this slice deliver the account's own change-password action — the action that changes the password from inside the account — or does it stay with the profile page (R7) so that session revocation is exercised through the recovery flow alone? → A: The action is delivered here as behaviour, with no page, and is verified by the integration tests; the profile page that offers it arrives with a later slice. Both halves of FR-013 therefore stay testable in this slice — the change made from inside the account and the change made through the recovery flow — and FR-013, US2, and its Independent Test carry the boundary.
- Q: Does the specification bind the body of the one-time-code message — its language, its numerals, and the no-emoji rule — and is that body covered by an acceptance criterion? → A: Yes — the message body is user-facing text and follows the same language, numeral, and no-emoji rules a page follows, even though it carries no icons; FR-026 and SC-008 are extended to cover it, so the criterion's scan of user-facing strings reaches the message templates rather than the screens alone.
- Q: Does the frame's composition include the platform's logo, and is the logo delivered as a wordmark rather than as a new image asset? → A: The logo is part of the frame's composition, and it is delivered as a wordmark set in the product's typography, adding no image asset and no new design value, with the form it takes recorded in the plan; it sits in the header at its inline-start edge, not in the sidebar (revised 2026-10-21, ADR-099); FR-020, AC-022, and US5 name it.
- Q: Must the mobile-number field accept a number typed with Arabic-Indic numerals (for example ٠٩١…) and normalize it to the same canonical form, or is such a number refused as invalid? → A: It is accepted and read as the same digits — the field is tolerant on input while every numeral the platform renders stays Latin — so the number reaches the same normalized form and never becomes a second account; FR-031 and AC-007 are extended to name the form, and the matching edge case carries it.
- Q: When the operator's provisioning action creates the administrator account, is the administrator's mobile number verified by a one-time code the way a merchant's is, or is the account created directly — and does the invariant that an account exists only after the mobile number is verified bind the administrator too? → A: The account is created directly by the provisioning action, with no one-time code and no verification step, because the operator who runs the action already controls the platform and the constitution creates this account outside the public registration flow; the verification invariant is bounded to accounts created through public sign-up, the provisioning action sets the account's identity details (full name, Libyan mobile number, and city) in the same change, and Key Entities, FR-028, AC-030, the administrator Assumption, and the matching edge case carry the bound.
- Q: When a guest opens a page that carries the frame, what does the header show — does the sign-in action replace all the signed-in header's controls, or only some of them? → A: It replaces the account control and the notifications control; the guest keeps the theme switch, which sits in the header beside them, so a guest can still change the appearance, and the sidebar-collapse control stays in the sidebar so the guest can open or close the sidebar (revised 2026-10-21, ADR-099; revised 2026-10-21, ADR-102). FR-023, AC-025, US5, and the matching edge case carry the rule.
- Q: This slice ships no page that renders the frame, yet AC-024 asserts the sidebar's behaviour at two screen widths and US5's Independent Test calls that behaviour verifiable — on what surface is it exercised? → A: Neither is exercised at runtime here: the sidebar's two-width behaviour and the header controls' behaviour are verified by the slice that ships the first page carrying the frame, and this slice verifies the frame's composition, the presence of its controls, and the frame's absence from the three bare pages it ships. US5's Independent Test, AC-024, the end-to-end journey list, and SC-005 are narrowed to that boundary, and no preview route and no placeholder page is added.
- Q: FR-034's send-failure rule speaks of the "pending sign-up" alone — do the expiry, the re-request limit, and the failed-send rule govern a one-time code sent for password recovery the same way? → A: One rule governs both code paths: the pending request — whether it is a sign-up or a password reset — stays valid until its own expiry, and a code that cannot be sent produces the same explicit, retryable failure state and does not count against the limit on requesting a new code. FR-034, AC-036, and the matching edge case are reworded from "the pending sign-up" to "the pending request".
- Q: Two sign-up attempts for the same mobile number, or two entries of its one-time code, can arrive at the same moment — what does the platform guarantee then, and does the one-number-one-account rule still hold? → A: Uniqueness is enforced at the moment the account is created rather than by a check made before it, so two simultaneous attempts for one number produce at most one account and the attempt that does not create it receives the uniform outcome and the same direction FR-006 requires, leaving no partial account and no second session. FR-031, the `User` entity, the matching edge case, and the integration-test request carry the rule.
- Q: How does a visitor reach, and move between, the three bare pages this slice ships — sign-up, sign-in, and password recovery — when no page carrying the shared frame is delivered here? → A: The three bare pages link to one another: sign-in carries the way to sign-up and to password recovery, sign-up carries the way to sign-in, and password recovery carries the way back to sign-in, so every journey this slice ships has a defined entry point and the end-to-end tests start from a page; the links live on the bare pages themselves, because the frame that would otherwise carry them is absent from those pages and arrives with a later slice. FR-036, AC-039, and the end-to-end journey list carry the rule.
- Q: In the sign-up flow, is the password policy applied when the form is submitted, or only when the account is created after the code is entered? → A: Applied when the form is submitted, before any one-time code is sent, so a password that fails the policy is refused at that point; the refusal is the same whether or not the number already has an account, so it adds no signal to the sign-up flow's uniformity. FR-035 and AC-037 carry the rule.
- Q: When a sign-up is started for a number that already has a live pending sign-up, does the new attempt replace the previous one, or do both stay live? → A: One pending request is live per mobile number: starting a new sign-up or a new recovery request for a number that already has a live pending request replaces it, and the previous code stops being valid at once — consistent with the rule that exactly one code is valid at any moment and with uniqueness being keyed on the normalized number. FR-034, AC-036, and the Key Entities note carry the rule.
- Q: Does each authentication operation carry its own rate limit, or do the three share one budget per client? → A: Each operation carries its own limit, so exhausting one operation's budget never blocks another: a client hammering sign-up cannot consume the sign-in budget and deny a legitimate merchant sign-in. FR-033 and AC-035 carry the rule.
- Q: Does this slice record the security-relevant events it produces, or does all recording wait for the log pipeline a later slice owns? → A: This slice emits a structured record for each security-relevant event it produces — a failed sign-in attempt, a lock applied, a password change or a reset, a session revocation, and a one-time-code dispatch failure — carrying no secret, no session token, and no personal data; collection, retention, and alerting remain with the log pipeline the deployment slice (R12) owns, and this slice introduces no pipeline of its own. FR-037 and AC-040 carry the rule.
- Q: When an administrator's mobile number and password are entered on the merchant sign-in page this slice ships, does the platform sign that account in, or refuse the attempt with the same uniform response every other failed sign-in receives? → A: It refuses — an administrator account cannot sign in on the merchant surface, and the attempt receives the identical uniform refusal FR-008 requires, so nothing tells the person the account exists or that it is an administrator account; the administrator signs in only on the administrator's own surface, which arrives with a later slice. FR-027, AC-029, US6, and the matching edge case carry the rule.
- Q: Is the operator's provisioning action repeatable — does the platform hold more than one administrator account — or does it provision exactly one? → A: It is repeatable: each run creates a distinct administrator account, the platform introduces no cap on how many administrator accounts exist (the sources' own wording speaks of every administrator account, and the register states no cap), and uniqueness is enforced on the normalised mobile number exactly as FR-031 requires for any account, so a run for a number that already has an account creates nothing and reports the conflict to the operator. FR-028, AC-030, US6, the administrator Assumption, and the matching edge case carry the rule.
- Q: Do the sign-in and password-recovery pages this slice ships also fix the country to Libya (+218) with no dial-code selector, as the sign-up form does? → A: Yes — the rule is general: every page this slice ships that takes a mobile number offers no dial-code selector and fixes the country to Libya (+218), so FR-002 and AC-002 are restated as a rule over those three pages rather than over the sign-up form alone.
- Q: Does this slice fix and record the icon set — a technology register gap it owns — the way it fixes the city list and the mobile-prefix dataset, or is the icon set left to the plan? → A: It is fixed and recorded here, once: this slice chooses the icon set and records the choice so every later slice reads it rather than choosing its own, with the choice itself recorded in the plan's Constitution Mandated Values together with the register-gap decision record, the licence-obligation record, and the vulnerability scan the technology register requires. FR-020, AC-022, and the icon-set Assumption carry the rule.
- Q: What identifies "one client" for the rate limits on the sign-up form and on the three authentication operations? → A: The client is identified by its network origin — the request's origin — and the limit is applied per operation, so one origin's exhausted budget never blocks another origin and each of the three operations carries its own budget. FR-029, FR-033, AC-033, and AC-035 carry the rule. (Revised 2026-10-21: the client is identified by the request's network origin, and the specification names no transport detail.)
- Q: Does a successful sign-in clear the count of consecutive failed sign-in attempts, or does only the lock's expiry clear it? → A: A successful sign-in clears the count to zero, so the lock counts a run of five failures with no success in between; a success in the middle of a run ends it, exactly as the word "consecutive" requires. FR-009, AC-010, and SC-007 carry the rule.
- Q: When the bound on incorrect entries for a one-time code is reached, does the pending request end, or does it stay live and refuse every further code? → A: The pending request ends when the bound is reached, and the person starts a fresh request — a sign-up or a recovery — which begins a new verification with the count of incorrect entries at zero; the platform leaves no live request that can never be completed, and the fresh request replaces the ended one on the same terms FR-034 already states for a live pending request. FR-034, AC-036, and the matching edge case carry the rule.
- Q: When a client is refused because it has exceeded a rate limit, does the platform show a distinct refusal, or the same uniform refusal every other failed sign-in receives? → A: The refusal is distinct and explicit — it states that the limit was exceeded and that the person may retry later — because the limit protects the client rather than the account and therefore reveals nothing about whether an account exists; SC-004's indistinguishability rule stays bounded to responses that are not rate-limit refusals. FR-029, FR-033, AC-033, AC-035, and SC-004 carry the rule.
- Q: Is the list of security-relevant events FR-037 emits exhaustive, or does it also cover the operator's provisioning action and successful authentication? → A: The list is extended: the operator's provisioning of an administrator account is recorded as a security-relevant event, and so is a successful authentication — the verification that creates an account at sign-up and a successful sign-in — because an unrecorded privileged creation and an unrecorded successful authentication leave the security record one-sided. FR-037, AC-040, and the Test Coverage Request carry the rule.
- Q: Are the refusals produced by the sign-up form's hidden field and its minimum time-to-submit shown to the person, or kept silent? → A: The hidden-field refusal is silent — the platform returns the same response a successful submission receives, so a bot cannot tell it was detected — while the minimum-time refusal is explicit and retryable, because a real person may legitimately submit quickly and needs to be told to try again; no account is created in either case. FR-029, AC-031, and AC-032 carry the rule.
- Q: Does entering the one-time code — at sign-up and in password recovery — open a page or a route of its own, or is it a step of the same page that started the flow? → A: It is a step of the same page: the code entry renders within the sign-up page and within the password-recovery page and adds no page and no route, so this slice still ships exactly the three bare pages it names (sign-up, sign-in, password recovery) and the Product Register's twenty-seven pages are untouched. FR-038, AC-041, and the end-to-end journey note carry the rule. (Revised 2026-10-25 by ADR-126: the register gains the Upload Catalog page and names twenty-eight pages; this bullet's count is superseded.)
- Q: The operator's provisioning action creates the administrator account directly, but what credential does the administrator sign in with the first time — does the action set an initial password, or is the account created with no usable credential? → A: The action sets an initial password the operator supplies, which MUST satisfy the same password policy FR-035 requires, and the account is created with the forced-password-change requirement; the first sign-in accepts that credential and permits nothing but the password change, and the operator learns the credential out of band because the account is created outside the public flow. FR-028, FR-035, AC-030, and the administrator Assumption carry the rule.
- Q: The sign-up form carries a limit of its own (FR-029) and account creation is one of the three rate-limited authentication operations (FR-033) — are those one budget or two? → A: One and the same budget: the sign-up form's limit is the account-creation operation's limit, so one per-origin budget governs account creation and the form carries no second, overlapping budget; the hidden field and the minimum time-to-submit stay form-level protections and are not budgets. FR-033 and AC-035 carry the rule.
- Q: Must the one-time-code field accept a code typed with Arabic-Indic numerals and read it as the same digits, the way the mobile-number field does (FR-031)? → A: Yes — the same tolerance governs the code field: a code typed as Arabic-Indic numerals is read as the same digits and verifies identically, while every numeral the platform renders stays Latin, so FR-026's rule is unchanged and a correct code is neither refused nor silently mis-read. FR-031 and AC-007 carry the rule.
- Q: Does the account's own change-password action — the change made from inside the account, delivered here as behaviour — require the current password, or does a signed-in merchant set a new password without proving the old one? → A: The action requires the current password: a signed-in merchant MUST supply it, and a change submitted without it, or with a wrong one, is refused and ends no session; the recovery flow is the only path that sets a password without the current one, because it proves ownership of the number with the one-time code instead. FR-013, AC-014, and the Test Coverage Request carry the rule.
- Q: The frame is delivered whole, yet the specification never says what the sidebar's navigation list carries — given that none of the pages such a list would reach ships in this slice — so what does the sidebar carry here, and what does its verification assert? → A: The sidebar ships with its navigation item list as part of the frame's composition: each item names a registered destination, an item whose page ships later points at the route that slice provides, and this slice's structural verification asserts the item list alongside the theme switch and the collapse control, so the frame is composed once and a later slice does not extend it. The theme switch is verified in the header, where ADR-102 places it, and the collapse control in the sidebar, where ADR-099 placed it. FR-039, AC-042, US5, and the Test Coverage Request carry the rule. (Revised 2026-10-11: the item list is fixed in this specification and the route each item points at is fixed by this slice's decision record — see the item-list and route bullets that follow in this session.)
- Q: Between the sign-up form's submission and the arrival of the one-time code — and while the code is being verified — what does the person see, and is a repeated submission prevented from starting a second dispatch? → A: The page shows an in-progress state and disables the submit control while a request is in flight, so a repeated submission cannot start a second dispatch or produce a second account; the guard is presentation only, and the server-side uniqueness rule FR-031 stays the authority, exactly as the concurrent-attempt case already requires. FR-040, AC-043, and the matching edge case carry the rule.
- Q: When a signed-in person opens one of the three bare pages this slice ships — sign-up, sign-in, or password recovery — what do they see, given that this slice ships no destination page and the frame is absent from those pages? → A: The page renders exactly as it does for a guest: no redirect and no signed-in-specific surface is introduced, because the pages are public, carry no state, and carry no frame, and a sign-out control on them would contradict the rule that the sign-out control belongs to the frame and not to a bare page — its only control is the account menu's third item, and a bare page carries no menu. FR-041, AC-044, the matching edge case, and the matching Assumption carry the rule. (Revised 2026-10-21: the sign-out control is the frame's, and this slice builds and verifies it structurally.)
- Q: At sign-in and in password recovery, when the submitted value is not a valid Libyan mobile number on +218 at all, is it refused with the uniform refusal FR-008 requires or with a distinct, explicit format refusal — and does the enumeration criterion cover it? → A: A distinct, explicit format refusal states that the value is not a valid Libyan mobile number; it stays outside SC-004's uniformity, because a malformed value can never have an account, so the refusal depends on the value's shape rather than on whether an account exists — exactly as the rate-limit refusal is excluded. FR-042, AC-045, SC-004, and the matching edge case carry the rule.
- Q: SC-004 requires sign-up, sign-in, and password-recovery responses to be indistinguishable and asserts it with an automated enumeration test, yet the specification names "no timing difference" only for the refusal made while an account is locked (FR-009) — does that uniformity also bind how long a response takes, or does it cover response text and status alone? → A: The uniformity binds timing as well as text and status: every authentication response does equivalent work whether or not the account exists — a sign-in attempt against an unknown number performs the same verification work as one against an existing account, so no response's duration signals account existence — and the enumeration test asserts the response's observable shape (text, status, and timing) rather than its text alone. FR-006, FR-008, FR-015, SC-004, and the Test Coverage Request carry the rule.
- Q: The merchant sign-in surface refuses an administrator account's credentials (FR-027), but the password-recovery flow this slice ships is not bounded the same way — what happens when that flow is used for a mobile number whose account holds the administrator role: does it set a new password on that account, or refuse after the code is verified the way it refuses a number with no account? → A: It refuses — after the correct code is entered and ownership of the number is proven, the platform states explicitly that the credential cannot be reset on this surface and sets no password and creates no session, because an administrator's credential belongs to the administrator's own surface, which arrives with a later slice; the request, the following step, and the code dispatch stay indistinguishable, exactly as FR-015 bounds them, so nothing before the code is entered signals the account's role. FR-014, FR-027, AC-016, and the matching edge case carry the rule.
- Q: FR-035 requires the platform to reject common or breached passwords, but the specification never says where that knowledge comes from or what happens when it is unavailable — is the check performed against a source the platform holds, so it never depends on an external service, or against an external breach service whose unavailability the platform must handle? → A: The check is performed against a source the platform holds: this slice introduces no external service for it, so the check is always available, a sign-up or a password change never fails for want of it, and no password material leaves the platform; the source and the way it is kept current are recorded in the plan, and a password that fails the check is refused exactly as AC-037 states. FR-035, AC-037, and the Test Coverage Request carry the rule.
- Q: Every administrator operation must be recorded in the audit log, and FR-019 defers the act of blocking for exactly that reason — yet this slice delivers the operator's provisioning of an administrator account; is that provisioning an administrator operation that must be recorded in the audit log (and therefore owned by the slice that creates that record), or an operation outside the product's role model? → A: It is out of band — the provisioning action is run by the platform's operator outside the product's role model and outside the administrator application, so it is not an administrator operation and writes no audit-log row; the audit log records the operations an administrator performs through the administrator application, which arrives with a later slice, and this slice records the provisioning through the structured security event FR-037 already names. FR-028, FR-037, the administrator Assumption, and AC-030 carry the rule.
- Q: The frame's sidebar is delivered whole and its navigation item list is verified structurally, yet the specification never says which destinations the items name — does this slice fix the item list, or leave it to the plan? → A: This slice fixes the item list in the specification: one item per registered destination a guest or a signed-in merchant can reach on the public site and in the merchant's area — Home, Parts, Catalog, My Files, Cart, Notifications, Messages, and Profile — and it carries no item for the three bare pages this slice ships or for the four bare-layout static pages, because the register states a static page is never a sidebar item; the structural verification asserts that exact list. FR-039, AC-042, and US5 carry the rule. (Revised 2026-10-25 by ADR-126: the list carries nine destinations — Upload Catalog sits between Catalog and My Files and points at `/upload` — and the register is at twenty-eight pages.)
- Q: When the sign-up form is submitted with the hidden field filled, the platform returns the same response a successful submission receives — but does that silent refusal also start a pending request and dispatch a one-time code to the submitted number? → A: No pending request is started and no one-time code is dispatched: the silence is a guarantee about the response, so the form cannot be turned into a way to send SMS to numbers the submitter does not control, and FR-006's timing rule, which binds the account-existence case, is not extended to this refusal. FR-029, AC-031, and the matching edge case carry the rule. (Revised 2026-10-21: the guarantee covers the response alone, and the flow stops at it — the code step is not reached.)
- Q: The frame's links must reach destinations whose pages ship in later slices, and the frame is verified structurally — does this slice fix the route strings those links point at, or does it point at routes a later slice chooses? → A: This slice fixes them: the frame's decision record fixes the route of every destination the frame links to — the eight sidebar destinations, the four static-page routes, and the Profile page's settings section that «إعدادات» opens — so every link has a definite target and a later slice ships its page at the route fixed here rather than choosing one of its own; a later slice therefore cannot move a route the frame already points at. FR-024, FR-039, AC-026, AC-042, and the matching Assumptions bullet carry the rule. (Revised 2026-10-25 by ADR-126: the sidebar destinations are nine, with Upload Catalog at `/upload`.)
- Q: FR-006 requires the platform to direct a person whose number already has an account to sign in or to recover the password — is that direction a message on the code step carrying the two links, or a redirect to another page? → A: It is a message on the code step that names the two options and offers the link to the sign-in page and the link to the password-recovery page, which the bare pages already carry; no redirect is introduced, consistent with the rule that the three bare pages render identically for a signed-in person and for a guest. FR-006, AC-006, and the matching edge case carry the rule.
- Q: Which refusals count toward an account's consecutive failed sign-in attempts — every refusal, or only a refusal produced by a failed password verification? → A: Only a failed password verification against an existing, active account counts: a refusal produced by a rate limit, a refusal of a value that is not a valid Libyan mobile number, and the refusal a blocked account receives MUST NOT increment the count, so the count measures exactly what a consecutive failed sign-in attempt is and the lock cannot be driven by requests that never verified a password. FR-009, FR-017, AC-010, and SC-007 carry the rule.
- Q: What scale are this specification's success criteria and performance budget measured against? → A: A modest, explicit ceiling is stated in Assumptions — up to 10,000 registered accounts, up to 500 concurrent sessions, and a peak of no more than 10 authentication requests per second — and SC-009 and the plan's Scale/Scope are measured against it, rather than the criterion staying load-independent.
- Q: Does this slice fix the routes of the three bare pages it ships and the destination of the frame's guest sign-in action, or leave them to the plan? → A: This slice fixes them, by extending the frame's decision record (FR-024) to cover them as well — the destination of the header's guest sign-in action and the routes of sign-up, sign-in, and password recovery — so every link this slice builds has a definite target rather than the bare pages and the sign-in action being the only links left without one.
- Q: Does an account carry a cap on the number of concurrent sessions, or are they unlimited? → A: Unlimited — signing in creates a new session and ends no session the account already holds, no cap is applied, and a session is removed only by its own end (its timeout, its absolute maximum lifetime, an explicit sign-out, or a revocation); "sign out of every device" is the action an account uses to end them all at once.
- Q: Does this specification impose any constraint on the two free-text fields — the full name and the optional shop name — or leave them unbounded? → A: Both are bounded: the full name is required and must not be empty or spaces alone, each field carries a maximum length stated under Constitution Mandated Values, and within those bounds a value is accepted as typed — letters and numerals alike — with no alphabetic-shape rule imposed, so the requirement is testable and reusable by the profile slice (R7).
- Q: Does this slice define the reverse status transition from blocked back to active, or leave it to the administrator application's slice (R13)? → A: It is recorded explicitly that both directions are administrator operations owned by R13: the status stays a closed two-value set, and setting an account to blocked and returning it to active both arrive with the administrator's Users page; this slice delivers the field and the effects of the blocked value, defines no reverse transition, and ships no action that sets the status.
- Q: When a guest opens a page that carries the frame, does the sidebar's navigation item list differ from the one a signed-in merchant sees, or is it the same list? → A: The list is the frame's single composition and is shown identically to a guest and to a signed-in merchant: all eight items are present in both states, because the frame is composed once and its item list is part of that composition, exactly as its logo, its typography, and its icon set are not varied by role; the frame MUST NOT add, remove, or disable an item by role, and AC-042's structural assertion is made once for that list. FR-039, AC-042, and US5 carry the rule. (Revised 2026-10-25 by ADR-126: the list is nine items in both states.)
- Q: Does the operator-run provisioning action that creates the administrator account apply the same field rules sign-up applies — FR-001's full-name presence and bounds, FR-003's Libyan-mobile-number rule against the fixed prefix dataset, and FR-005's city-from-the-fixed-list rule — or is the action exempt from them? → A: It applies all of them: the account it creates is a `User` like any other, and those are account rules rather than rules of the public sign-up path, so the action MUST refuse a value that fails any of them and MUST report the refusal to the operator, creating no account. Only the one-time-code verification (FR-004) is bounded to public sign-up, exactly as FR-028 and the Key Entities note already state. FR-028, AC-030, the administrator Assumption, and the Test Coverage Request carry the rule.
- Q: FR-040 states the in-progress state and the disabled submit control for the sign-up form's submission and the entry of a one-time code — do they also govern the sign-in submission and the password-recovery request submission? → A: Yes — the guard governs every authentication form this slice ships: the sign-up submission, the sign-in submission, the password-recovery request submission, and the one-time-code entry at sign-up and in recovery. A repeated submission of any of them cannot start a second request or a second dispatch, and the guard is presentation only: the server-side rules (FR-031's uniqueness and FR-034's single live pending request) remain the authority. The state-completeness requirement in Principle IX is satisfied by the guard on each of the three pages. FR-040, AC-043, and the Test Coverage Request carry the rule. (Revised 2026-10-22: the guard governs every submission these three pages make, so the new-password step of the password-recovery flow is guarded as well — a repeated submission there neither sets the password twice nor ends the account's sessions twice — and the account's own change-password action has no surface in this slice, so the guard has no page to act on there; see Session 2026-10-22.)
- Q: When the correct one-time code is entered and verified but the account cannot be created at that moment — a transient failure — what does the person see, and is the same code still usable? → A: The pending request stays valid until its own expiry and the correct code stays usable, because a code is consumed only once the account is actually created; the person sees an explicit, retryable failure state, and that failure counts neither against the bound on incorrect entries (it was not an incorrect entry) nor against the limit on requesting a new code. The rule is distinct from the send-failure rule FR-034 already states, which governs a code that never reached the number, and the one-number-one-account rule is unaffected because no account was created. FR-034, AC-036, and the matching edge case carry the rule.
- Q: Does a sign-in attempt refused for its role — an administrator account's credentials submitted on the merchant sign-in surface (FR-027) — count toward the consecutive-failed-attempt count and drive the lock, or is it excluded as the rate-limit, format, and blocked-account refusals already are? → A: It is excluded: the count measures a failed password verification against an existing, active merchant account, and an administrator account's attempt is refused for its role rather than for a failed password, so it MUST NOT increment the count and MUST NOT drive the lock; it is treated exactly as the refusal a blocked account receives (FR-017). FR-009, AC-010, SC-007, and the Test Coverage Request carry the rule.
- Q: What clears the forced-password-change requirement the operator's provisioning action places on the administrator account, and does the restriction lift when it is cleared? → A: The change made at the first sign-in clears it: performing that change ends the restriction and the account is thereafter unrestricted, and no other path clears it — the merchant recovery flow refuses a mobile number whose account holds the administrator role (FR-014) and the merchant sign-in surface refuses an administrator's credentials (FR-027), so no surface other than the administrator's own reaches that credential. FR-028, AC-030, US6, and the Key Entities note carry the rule.
- Q: Which surface inside the frame carries the links to the four static pages, given that the register forbids a static page from being a sidebar item? → A: A footer band inside the frame, below the page's content: it is shown on every page that carries the frame and is absent from every page that does not, because the footer is part of the frame's composition exactly as the header and the sidebar are. FR-024, FR-021, AC-026, and the matching edge case carry the rule.
- Q: Is each rate limit keyed on the network origin alone, or on the origin and on the submitted mobile number as well, given that a mobile carrier's address is shared by many people at once? → A: Two keys: each budget is keyed on the network origin and on the normalized mobile number the request submits, so exhausting either key refuses further requests on that key alone — every other origin and every other number stays unaffected — and a shared carrier address therefore cannot spend a person's budget; the refusal is the same distinct, explicit limit refusal whichever key produced it, so nothing about it signals whether an account exists. FR-029, FR-033, AC-035, the matching edge case, and the Test Coverage Request carry the rule.
- Q: Does the accessibility criterion (SC-006) cover the shared frame itself, given that no page this slice ships renders it? → A: It covers the frame at the level of its markup: the structural verification this slice performs asserts that every frame control — the logo/home, account, and account-menu items, the notifications control, the theme switch, the sidebar-collapse control, and the footer band's links — carries an accessible name, a role, and keyboard reachability. The automated scan and the keyboard-only pass over the frame's rendered behaviour stay with the slice that ships the first page carrying the frame, exactly as its two-width behaviour does. SC-006, AC-022, and the Test Coverage Request carry the rule.
- Q: When the password changes or every session of an account is ended at once, does the platform send a notice by SMS to the registered number, or is the structured security record the only trace? → A: It sends one in both cases — on a password change and on a sign-out of every device — so the account's owner learns out of band of a change they did not make; the notice is Arabic, right-to-left, with Latin numerals and no emoji, it is dispatched best-effort so a failed send undoes nothing and blocks nothing, and it is recorded as the dispatch failure FR-037 names. No notice is sent on an ordinary sign-in or an ordinary sign-out, so the channel stays bound to those two events. FR-043, FR-037, AC-047, AC-040, and the Test Coverage Request carry the rule.
- Q: After the one-time code is verified at sign-up, and after a successful sign-in, what does the browser show, given that this slice ships no page a signed-in merchant lands on? → A: Option A — a confirmation state rendered in place on the same page: the code step at sign-up, the sign-in form, and the new-password step in password recovery are each replaced in place by a confirmation of the outcome, with no navigation, no new route, and no new page. FR-004, FR-007, FR-014, AC-004, AC-008, AC-016, and the no-landing-page Assumption carry the rule.
- Q: What identifies the subject of a structured security record, given that the constitution forbids personal data in a log? → A: Option A — an internal account identifier, carried only where an account exists: a record produced for a number with no account carries no account reference, and the mobile number never appears in any form. FR-037, AC-040, and the Test Coverage Request carry the rule.
- Q: May a new password be identical to the password it replaces? → A: Option A — yes: the policy stays exactly as FR-035 bounds it, so a new password MAY repeat the one it replaces and no password history is kept. FR-035, AC-037, and the Test Coverage Request carry the rule.
- Q: Must the sign-up form obtain an explicit acceptance of the Terms of Use and the Privacy Policy before the account is created? → A: Option A — no acceptance control: sign-up asks only for the fields FR-001 names, the two pages stay reachable from the frame's footer at the routes FR-024 fixes, and recording consent later is a register amendment rather than a feature edit. FR-001 carries the rule.
- Q: Must the optional shop name be unique across merchant accounts? → A: Option A — no uniqueness rule: the shop name is a label within its length bound and two accounts MAY hold the same value. FR-001, AC-046, and the Test Coverage Request carry the rule.
- Q: When the platform sends a one-time code, does it wait for the messaging channel to accept the message before telling the person to enter it, or does it move them to the code step and let the send finish in the background? → A: Option A — the send is attempted within the request that asks for the code, and the code step is reached only once the channel has accepted the message; a channel refusal therefore produces the explicit, retryable failure state on the submission itself, before the code step, so no failure arrives after the person has moved on, and the placement keeps the failure state FR-034 already promises where the specification already describes it. FR-034, AC-036, SC-009, and the Test Coverage Request carry the rule.
- Q: If a person reloads the sign-up or password-recovery page, or closes it and comes back, while a one-time code is still waiting for them, what does the page show them? → A: Option A — the page shows the code step again while the pending request is still live, so the person can enter the code they already received; the pending request already carries its own expiry and the re-request limit exists to bound abuse, so resuming keeps that code usable instead of spending a new code and a new SMS on an accidental refresh, and a fresh submission still replaces the pending request on FR-034's terms. FR-038, AC-041, AC-036, the matching edge case, and the Test Coverage Request carry the rule.
- Q: When a person signs in with a correct password, or enters the correct one-time code, but the platform unexpectedly fails to create the session, what does the person see — given that the three pages this slice ships are bare and the error page arrives with a later slice? → A: Option A — the page shows its own inline, explicit, retryable failure message, with no navigation and no separate error page, covering any failure that occurs while the page is being used; the three pages this slice ships are bare and cannot leave themselves, and the error page arrives with a later slice, so every failure they can hit must already be described on the page itself and this slice creates no placeholder error page. FR-040, AC-043, SC-005, the matching edge case, and the Test Coverage Request carry the rule.
- Q: How long is a merchant's personal data — their full name, mobile number, and city — kept after they close their account, given that a merchant can never delete their own account? → A: Option A — this slice fixes no retention period; it records that a merchant's data lives as long as the account is registered and is removed only by an administrator action, and that the facts this slice owns are what sign-up collects, that the mobile number is the sole identifier, and that no merchant can delete their own account. A numeric period is not stated here because the register fixes none, and the retention job's scope over account rows is not asserted by any source; the Privacy Policy page's wording belongs to the slice that ships it. FR-018, AC-020, and the matching Assumption carry the rule. (Revised 2026-10-21: the retention job is no longer named as a removal path for account data.)
- Q: If a merchant closes their browser and opens it again later, are they still signed in? → A: Option A — the session survives closing and reopening the browser: the browser retains the reference that proves the session, while the session itself stays on the server and is never recoverable from browser storage, so a merchant who returns before the session's absolute maximum lifetime is still signed in, and only the inactivity timeout or the absolute maximum lifetime ends it. Neither clock is shortened or extended by the browser closing, which is why the specification fixes both values numerically in the first place. FR-032, AC-015, the `Session` entity, and the Test Coverage Request carry the rule. (Revised 2026-10-21: the reference is retained, and the session itself is never recoverable from browser storage.)
- Q: When a guest opens a page that carries the frame, what does the header show — the sign-in action alone as the constitution's Product Fact Clarifications bullet and its `Core-Project.txt` mirror state, or the sign-in action replacing the account and notifications controls while the guest keeps the theme switch and the sidebar collapse control, as FR-023 decides? → A: The specification's rule stands: the sign-in action replaces the account control and the notifications control only, and the guest keeps the theme switch and the sidebar collapse control, because the appearance and the sidebar belong to the frame rather than to an account. The contradiction with the constitution's Product Fact Clarifications bullet and its mirror is resolved by ADR-094 (2026-10-20), which amended both texts to this rule, so no binding source contradicts the guest's header any longer. (Revised 2026-10-21 by ADR-099: the header no longer carried a notifications control, and the theme switch and the collapse control sat in the sidebar; the guest rule itself stands.) (Revised again 2026-10-21 by ADR-102: the header carries a notifications control again and the theme switch sits beside it in the header, so the sign-in action replaces the account and notifications controls and the guest keeps the theme switch.) FR-023, AC-025, US5, and the matching edge case carry the rule.
- Q: Should the three browser-facing security controls the constitution requires of the first browser-facing feature — request-forgery protection, output encoding, and security headers — be stated as functional requirements with acceptance criteria, or left named only in the Test Coverage Request? → A: They are stated as functional requirements and acceptance criteria: FR-044 (every state-changing request issued from a browser session is protected against request forgery), FR-045 (every value a person supplies is encoded for its output context before it is rendered), and FR-046 (every response the browser surface returns carries the security headers the constitution names), with AC-048 … AC-050 asserting each, so the implementation work has a numbered requirement to cite under Principle I instead of arriving with none. FR-044, FR-045, FR-046, AC-048, AC-049, AC-050, US7, and the Test Coverage Request carry the rule.
- Q: When a client has exhausted the limit on requesting a new one-time code for a live pending request, what refusal does it receive — the uniform response or a distinct one — and is that limit one of the three per-operation budgets FR-033 fixes or a bound of its own? → A: The refusal is distinct and explicit: it states that the limit on requesting a new code was exceeded and that the person may retry later, and it is excluded from SC-004's enumeration comparison for the same reason the per-operation rate-limit refusal is, because it depends on the pending request's own history rather than on whether the number has an account — and the pending request exists for a number with no account exactly as it does for one. The bound is its own and sits above FR-033's per-operation budgets: requesting a new code neither consumes nor is bounded by the account-creation or the recovery budget, so a merchant who mistypes a code and asks for a new one cannot spend the operation's budget. FR-034, AC-036, SC-004, and the Test Coverage Request carry the rule.
- Q: When the account's own change-password action succeeds — the current password is correct — after failed attempts have accumulated, does the success clear the consecutive-failed-attempt count the way a successful sign-in does, and does it lift a lock already running? → A: It clears the count: the count measures a run of failures with no successful password verification in between, and the change action's own failures are counted (FR-009), so its successes end the run exactly as a successful sign-in does. It does not lift a lock already running: the lock is a time bound and keeps its full fifteen minutes whatever the password is set to, exactly as a successful reset through the recovery flow does not lift it. FR-009, AC-010, SC-007, and the Test Coverage Request carry the rule.
- Q: FR-004, FR-007, and FR-014 require each page to render a confirmation in place after a successful action, while FR-041 and AC-044 require the same three pages to render identically for a signed-in person and for a guest with no signed-in-specific surface — how do the two rules coexist, and what does a person see if they reload the page after the confirmation? → A: The confirmation is the outcome of an action taken on the page, not a surface the page carries for a signed-in person: FR-041 governs what the page shows when it is opened, so a person who opens the sign-up, sign-in, or password-recovery page sees the page exactly as a guest does whatever their session state, and the confirmation appears only in place of the step the action was taken from. Once the action is complete — the pending request consumed at sign-up, the session created at sign-in, the password set in recovery — reloading or reopening the page returns it to its first step with no confirmation and no redirect, exactly as FR-038 already provides for a reload while the pending request is still live. FR-004, FR-007, FR-014, FR-041, AC-004, AC-008, AC-016, AC-044, and the matching Assumption carry the rule.
- Q: Does the operator's provisioning action, which sets the administrator account's initial password, also send the security notice FR-043 requires on a password change? → A: No — FR-043 governs a change to the password of an account that already holds one, so that its owner learns out of band of a change they did not make; the provisioning action sets the account's first password rather than changing an existing one, and the operator who supplies it is the party the notice would inform. The provisioning stays recorded as the structured security event FR-037 names, so the privileged creation is not silent. FR-028, FR-037, FR-043, AC-030, AC-047, and the Test Coverage Request carry the rule.
- Q: Do submissions refused by the sign-up form's own protections — the hidden field and the minimum time-to-submit — consume the account-creation budget FR-029 and FR-033 share, or are they outside every budget? → A: They consume it: the account-creation budget is applied to every submission that reaches the sign-up form, including one refused by the hidden field or by the minimum time-to-submit, so the honeypot cannot be turned into an unbounded entry point and a client that only fills the hidden field is still bounded; the refusals themselves are unchanged — the hidden field's stays silent and returns the same response a successful submission receives, the minimum-time refusal stays explicit and retryable, and the budget's own refusal stays the distinct, explicit limit refusal outside SC-004. FR-029, FR-033, AC-031, AC-032, AC-033, and the Test Coverage Request carry the rule.

### Session 2026-10-21

- Q: The operator has fixed the shared shell's composition: what does the header carry, where do the theme switch and the sidebar-collapse control live, and what happens when the account control is used? → A: The header carries only the platform's logo/home control at its inline-start edge and the account control at its inline-end edge, with no page-navigation link, no notifications control, no theme switch, and no sidebar-collapse control; the theme switch and the collapse control sit in the sidebar; the account control opens a menu carrying «حسابي»، «إعدادات»، and «تسجيل الخروج»، and the sign-out item asks for a yes-or-no confirmation. A guest sees the sign-in action in place of the account control only. «إعدادات» is a section inside the Profile page, so no page is added and the Product Register stays at twenty-seven pages. The frame's composition and the menu are verified structurally here; the runtime behaviour lands with the first page that carries the frame (R4), and the destinations land with R7. FR-020, FR-022 … FR-025, FR-039, FR-047, AC-022, AC-024, AC-025, AC-027, AC-042, and AC-051 carry the rule; ADR-099 is the decision record. (Revised 2026-10-21 by ADR-102: the header carries the logo/home control at its inline-start edge and, at its inline-end edge, the notifications control, the theme switch, and the account control; the sidebar carries the navigation item list and the collapse control; a guest keeps the theme switch, and the sign-in action replaces the account and notifications controls.) (Revised 2026-10-25 by ADR-126: the register gains the Upload Catalog page and stays at twenty-eight pages, and the item list gains its ninth destination.)
- Q: What does the «إعدادات» item show, and how does it differ from «حسابي»? → A: «حسابي» opens the Profile page at its top, where the account's identity and status are shown, and «إعدادات» opens the settings section of that same page, where the account details are edited and the password is changed; the two items share the one Profile route the frame's decision record fixes, the settings section being identified by an anchor, so no page and no entity is added. FR-047 and AC-051 carry the rule.
- Q: After the account menu settled on three items, where does a merchant trigger the action that ends every session of their account at once? → A: In the settings section of the Profile page, beside the account details and the password change, so the account menu keeps its three items; the action is delivered by the Profile slice (R7), and the Profile page's content in the constitution's Product Scope and its `Core-Project.txt` mirror carry it. FR-047 carries the rule.
- Q: The sidebar's item list is the same for a guest and a signed-in merchant, so a guest can press an item that names a merchant-area destination — what does the platform show then? → A: The sign-in page: the platform takes the guest there, because the register gives a guest no cart, no upload, no message, and no merchant area; the item itself stays present and enabled, since the list is not varied by role, and the three items that name a public destination — Home, Parts, and Catalog — open their own pages as they do for a merchant. The rule adds no page, no route, and no stored state, and whether the merchant returns to the item they wanted after signing in is a decision of the slice that ships the merchant area's pages. FR-048 and AC-052 carry the rule.
- Q: What does a merchant see when their session ends or their account is blocked while they are on a page that carries the frame? → A: An explicit state inside the frame, stating that the session has ended and offering the way to sign in again, and saying plainly that the account is blocked when that is the reason, because the person held a valid session and is no longer an unknown caller; no unrelated error is shown, and the frame stops sending requests for a session that no longer exists. The state adds no page, no route, and no entity, and it is outside the enumeration comparison SC-004 bounds. FR-049 and AC-053 carry the rule.
- Q: What does the administrator application's header carry now that the platform's header design is fixed? → A: The administrator application keeps its own shell, and its header carries the platform's logo at the inline-start edge and an account control whose menu offers «تسجيل الخروج» only, because the administrator application has no Profile page and no merchant settings page, so the merchant menu's destinations do not exist there. This specification binds that composition for R13 and delivers nothing of it. FR-050 and AC-054 carry the rule.
- Q: Is the background and its colour an option a merchant or the administrator chooses, or a fixed design value? → A: A fixed design value: the appearance's surfaces, backgrounds, and colours are recorded as fixed design values in this slice's plan (ADR-098); neither a merchant nor the administrator chooses a background or a colour, and no such preference is stored on the account or in the platform's settings, so no requirement, entity, or slice is added. FR-025 carries the rule.
- Q: What closes the account menu? → A: Three paths, each closing it without action: pressing Escape, activating something outside it, and moving the focus out of it; the focus returns to the account control in every case. FR-047 and AC-051 carry the rule.
- Q: What does «حسابي» show exactly? → A: The account's full name, its city, and its status — active or blocked — and no other account field; the mobile number and the editable account details belong to the settings section, so the item that opens the page shows a summary and the item that opens the settings section shows and changes the details. FR-047 and AC-051 carry the rule.
- Q: What does the merchant see in the page they were on after confirming the sign-out in the account menu? → A: The same ended-session state FR-049 requires when a request is refused: the page stays where it is inside the frame, states that the session has ended, and offers the way to sign in again, so both ways a session ends lead to one outcome. FR-049 and AC-053 carry the rule.
- Q: What is the account control's accessible name in the header, and does the merchant's name appear beside it? → A: The accessible name is «حسابي», and the header shows the icon alone with no merchant name in it; the merchant's name is available inside the account menu's «حسابي» item, so the header stays a brand-and-account band and one Arabic string names the control. FR-023, AC-022, and AC-025 carry the rule.

### Session 2026-10-21 (2)

- Q: The Assumptions said sign-out has no surface in this slice, yet FR-041, FR-047, AC-051, and ADR-099's decision 6 say the account menu's third item and its confirmation are built and verified structurally here. Which is true? → A: The frame's composition is true: the control that offers sign-out is the account menu's third item with its yes-or-no confirmation, and this slice builds and verifies it structurally, because no page this slice ships renders the frame (ADR-099). Only its runtime behaviour lands with the slice that ships the first page carrying the frame (R4), and the action that ends every session of the account at once is the profile page's settings action (R7). The stale Assumption is replaced rather than supplemented, and FR-041 and US2's Independent Test are reworded to the same boundary. (Revised 2026-10-21.)
- Q: FR-029's hidden-field refusal says it returns the same response a successful submission receives, starts no pending request, dispatches no code, and that the silence covers the response and the following step. Which of these can hold together? → A: The guarantee is about the response alone, and the flow stops at that response: no pending request is started, no one-time code is dispatched, and the code step is not reached. The absent code is a consequence of the refusal rather than a signal of it, the submission still consumes the account-creation budget, and the form still cannot be turned into a way to send SMS to numbers the submitter does not control. FR-029, AC-031, and the matching edge case are reworded to the same rule. (Revised 2026-10-21.)
- Q: FR-020 said the icon set did not exist yet and that this slice must choose it, but ADR-098 already chose the set. What does this slice still owe? → A: The set is chosen and recorded (ADR-098); what the register still leaves open is the record itself. This slice records the chosen set in the technology register, records it in the plan's Constitution Mandated Values, and executes the register-gap decision record, the licence-obligation record, the vulnerability scan, and the vendoring the register requires. FR-020 and the matching Assumption are reworded to that rule. (Revised 2026-10-21.)
- Q: FR-048, FR-049, AC-027, AC-052, and AC-053 assert runtime behaviour, yet no page in this slice renders the frame. Who verifies them? → A: This slice verifies the frame's composition and the presence of its controls structurally, and the slice that ships the first page carrying the frame verifies the runtime behaviour — the same boundary the neighbouring requirements and criteria already carry. The five are given that clause, so none of them asserts behaviour this slice cannot exercise. (Revised 2026-10-21.)
- Q: FR-024 chooses the footer band as the surface carrying the four static-page links, but the constitution binds the reachability requirement to the slice that chooses the surface, and this slice ships no page that carries the frame. How is the requirement discharged? → A: It is discharged by the slice that ships the first page carrying the frame (R4), because the surface this slice chooses renders on no page of its own. This slice builds the surface, fixes the four routes, and binds the rule; its plan records that deferral in the Complexity Tracking table with an owner and a review date. FR-024, AC-026, and the matching Assumption carry the deferral, and the constitution is left as it is. (Revised 2026-10-21.)
- Q: The specification named two implementation details in a file that must name none — the client's identity was fixed by a transport-specific term, and the output-encoding rule named a platform technology as its default. What replaces them? → A: The client is identified by the request's network origin, which FR-033 already used, and the output-encoding rule is satisfied by a default the platform provides rather than by this requirement, with a test that fails when the encoding is removed. Neither rewrite changes the rule. (Revised 2026-10-21.)
- Q: The pending verification state and the three new account fields are not tracked anywhere a reviewer can read. What records them? → A: The transient verification store is recorded in `docs/domain-model.md` as transient, non-entity state owned by the `users` module, with its invariants, so it is documented without entering the entity register; and the account-level amendment's content is named explicitly as exactly three fields on `User` — the consecutive-failed-attempt count, the lock's expiry, and the requirement to change the password at first sign-in — with the amendment tracked in the plan's Ownership Map and Complexity Tracking. (Revised 2026-10-21.)
- Q: FR-018 and AC-020 named the retention job as a way personal data is removed, while the register fixes no period and R15 owns the retention trigger. What does the specification now say? → A: The account's personal data is removed only by an administrator action; the specification fixes no retention period and asserts no trigger, and the retention job's scope over account rows is not asserted here either. (Revised 2026-10-21.)
- Q: Four acceptance criteria — the account menu, the guest's redirection, the ended-session state, and the administrator application's header — sat under the user story that resists automated abuse, because three later clarification sessions appended them to the end of the specification's last section. Where do they belong? → A: Under the stories they serve: the first three are frame criteria and belong to US5, and the administrator application's header belongs to US6, the only administrator-facing story in this slice. The criteria are moved to their stories, the ordinals are renumbered in document order, and the seven "Acceptance Scenarios" lines are rewritten from the actual grouping. No identifier is renumbered, reused, or withdrawn. (Revised 2026-10-21.)
- Q: The requirements are grouped by subject rather than by identifier, and a reader might mistake the order for a numbering. What says so? → A: A short note at the head of the Functional Requirements section: the identifier is what a task, a criterion, or a reviewer cites, it is stable for the life of the feature, and a requirement a later session revises keeps its identifier and its position. (Revised 2026-10-21.)
- Q: FR-032 said a session "is held by the browser rather than by the page", which reads loosely against the constitution's rule that a session is never persisted in browser storage in recoverable form. What does it say now? → A: The browser retains the reference that proves the session, while the session itself stays on the server and is never recoverable from browser storage. The rule the specification states is unchanged; only its wording moves onto the constitution's own terms. FR-032, the `Session` entity, and the matching clarification carry it. (Revised 2026-10-21.)

### Session 2026-10-22

- Q: FR-032 ends a session when "the session timeout elapsing with no activity", but the specification never says what counts as activity — so does a request the browser sends on its own, such as a background request the frame issues, keep the session alive? → A: Only what the merchant themselves do counts as activity for the session timeout — opening a page, submitting a form, or any other action the merchant starts — and that action MUST reset the inactivity clock; a request the browser sends on its own MUST NOT count as activity, so a background request cannot keep a session alive indefinitely and the timeout keeps its meaning. FR-032, AC-015, the `Session` entity, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: FR-035 requires a password policy with a minimum length and a rejection of common or breached passwords, but the specification never says whether the person is told what the policy requires, and whether the reasons a password is refused are told apart from one another? → A: Both: the form that takes a password states the policy's requirements before the password is typed, so the person can meet the policy without trial and error, and each reason the policy refuses a password carries its own message — shorter than the minimum, and common or breached — so the person knows what to correct. None of these messages reveals whether an account exists: the policy is applied to every password submitted, and the same message is given for the same reason whether or not the number has an account. FR-035, AC-037, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: FR-005 presents the city as "a searchable choice from one fixed list", but the specification never says what a person may type into that search, nor what names the list's entries carry — and the list is fixed once in this slice, so every later slice reads it. → A: Each entry carries one Arabic name and no Latin alternate name, and the search matches those Arabic names while ignoring diacritics, so a person who types a city without its diacritics still finds it, and the list holds no second naming source to keep in step with it. FR-005, AC-005, the city-list Assumption, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: FR-038 makes the one-time-code entry a step of the same page, but the specification never says what that step shows — do the fields the person filled in stay visible and editable, and may the mobile number be changed there? → A: The fields are shown for reading, the mobile number among them, so the person sees which number the code was sent to, and they are not editable there; a person who wants a different number returns to the page's first step and submits the form again, which starts a new pending request for the new number on FR-034's terms, while the pending request for the first number stays live until its own expiry. FR-038, AC-041, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications). (Revised 2026-10-22: the fields the code step shows are enumerated, and the password is excluded from them — see the later bullet in this session.) (Revised again 2026-10-22: the enumeration is bounded to the fields each flow collected — the four at sign-up, the mobile number alone in recovery — and the step carries its re-request and change-number controls; see the later bullets in this session.)
- Q: FR-040 lists the submissions the in-progress state and the disabled submit control govern, but the new-password step of the password-recovery flow is not among them — does the guard cover that step, and what happens there when the request fails? → A: The guard governs every submission these three pages make, so the new-password step is guarded exactly as the password-recovery request is: a repeated submission there neither sets the password twice nor ends the account's sessions twice, and a failure on that step shows the same inline, explicit, retryable message every failure on these pages shows, because the error page arrives with a later slice. The account's own change-password action has no surface in this slice, so the guard has no page to act on there. FR-040, AC-043, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: When the correct one-time code is entered in the password-recovery flow, does the code stop being usable at that moment or stay usable until the new password is set, and what does the page show when the person reloads it at the new-password step? → A: In the password-recovery flow the code stops being usable the moment it is verified: the pending request moves to a verified state that carries the new-password step alone, lasts no longer than the pending request's own lifetime — the value Constitution Mandated Values already fixes — and is single-use, because setting the new password ends it and the pending request, so the same code cannot authorise a second reset. A reload, or a close-and-return, while the verified state lives shows the new-password step again rather than the code step, and once the password is set it returns the page to its first step as FR-041 provides. FR-014, FR-034, FR-038, AC-036, AC-041, the key-entities note, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: Must the in-progress state, the inline failure message, and the in-place confirmation the three bare pages render be announced to assistive technology, and where does focus go when a step that held it is replaced? → A: Every one of those states is announced to assistive technology, and when a step replaces another the focus moves to the step now shown — its first field, or its heading when it carries no field — and never remains on a control the previous step carried; the automated scan and the keyboard-only pass SC-006 requires assert both on the three bare pages. FR-040, AC-043, and SC-006 carry the rule (decided 2026-10-22, Clarifications).
- Q: The code step shows "the fields the person filled in" for reading, and the sign-up form's fields include the password — so does the step show the submitted password back to the browser? → A: No — the code step shows the full name, the mobile number, the city, and the optional shop name for reading, and the password is never shown back: it is not re-displayed, not echoed, and not masked-and-rendered either, so a submitted password never returns to the browser in any form. The mobile number is shown among them, so the person sees which number the code was sent to, and the whole set is read-only there. FR-038, AC-041, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications). (Revised 2026-10-22: this enumeration is the sign-up code step's; in password recovery the step shows the mobile number alone, because the recovery form collects nothing else — see the later bullet in this session.)
- Q: AC-030 asserts that the administrator's forced-password-change requirement "is cleared by the change made at that first sign-in", and US6's Independent Test demands that clearing be confirmed — but this slice ships no administrator sign-in surface, and FR-027 and FR-014 close every other path to that credential, so the event AC-030 names cannot occur here. Does this slice deliver the administrator's first sign-in as behaviour, with no page? → A: Yes — this slice delivers the administrator's first sign-in as behaviour with no page, exactly as FR-013 delivers the account's own change-password action: the first sign-in is accepted, the account is restricted so that nothing but the password change is permitted, and the change made at that first sign-in clears the requirement and lifts the restriction. Only the administrator's sign-in *surface* — the page — arrives with the later slice that ships the administrator application, and this slice creates no page for it. FR-028, AC-030, US6, the administrator Assumption, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications). (Revised 2026-10-22: the restriction withholds every product action that needs the account's ordinary permissions, but not the password change itself or ending the session, so sign-out remains available — see the later bullet in this session.)
- Q: FR-017 refuses a blocked account's sign-in "because it is a status refusal and never reached a password verification", while FR-008 and SC-004 require every sign-in response to do the same work and take the same time whatever the account's state — so does the platform refuse a blocked, a locked, and an administrator account before verifying the password, or after? → A: After — a status or role refusal performs the same verification work as any other sign-in attempt and is refused afterwards on the status or role ground, so its response is indistinguishable in text, status, response path, and duration from a wrong password and from an unknown number, exactly as SC-004 requires. The consecutive-failed-attempt count is still not incremented, because the verification the attempt performed was not against an active account — the reason FR-009 already gives, and the reason FR-017's own wording is brought into line with. FR-008, FR-009, FR-017, AC-009, AC-019, AC-029, SC-004, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: When the correct one-time code is entered at sign-up for a number that already has an account, the platform creates no second account and directs the person to sign in or to recover the password — but what happens to the pending request and its code at that point, given that the recovery flow's counterpart (FR-014) ends the pending request once the outcome is stated? → A: The same rule governs both code paths: the pending request ends once the outcome is stated, and the code stops being valid at once, so no live request and no usable code survive an outcome the platform has already reported. FR-006, FR-034, AC-006, the Key Entities note, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: The Test Coverage Request sets the coverage target at "at least 80% of changed lines" of changed production code, while the frame's runtime behaviour — the account menu's open and confirm behaviour, the sidebar's two-width behaviour, and the header controls' behaviour — is expressly deferred to the slice that ships the first page carrying the frame, and this slice builds that frame. Does the deferred behaviour count against this slice's coverage target? → A: No — the target is stated over the changed production lines this slice introduces, except the frame's runtime behaviour this slice defers to the first frame-carrying slice, and that exclusion is named in the Test Coverage Request so the coverage gate is asserted over a scope the specification can actually meet. The frame's composition and the presence of its controls remain covered here by the structural verification, and the deferred runtime lines are covered in the slice that exercises them. The Test Coverage Request carries the rule (decided 2026-10-22, Clarifications).
- Q: In password recovery the page collects only a mobile number, yet FR-038 and AC-041 require the one-time-code step to show the full name, the mobile number, the city, and the optional shop name — what does that step show in the recovery flow? → A: The mobile number alone — the field the flow collected — in its canonical form with Latin numerals; the four fields remain the sign-up code step's rule, and the no-password rule governs both flows. Showing an account field before the code is verified would reveal that the number has an account, breaching FR-015 and SC-004. FR-038, AC-041, the matching edge cases, and the Test Coverage Request carry the bound (decided 2026-10-22, Clarifications).
- Q: At the administrator's first sign-in the account is restricted so that nothing but the password change is permitted (FR-028, AC-030), yet the administrator application's header offers sign-out (FR-050) — may the restricted administrator end their session before changing the password? → A: Yes — the restriction withholds every product action that needs the account's ordinary permissions, but it does not withhold the password change itself or ending the session: sign-out, the session timeout, and a platform revocation all remain available, so FR-028 and AC-030 are bounded to say so and FR-050's sign-out control stands for a restricted account (decided 2026-10-22, Clarifications).
- Q: The code step shows the submitted values for reading and keeps them from being edited there, and a reload resumes the code step — so how does the person request a new one-time code or return to the first step to change the mobile number? → A: The step carries two controls beside the code field and its submit control: one that requests a new one-time code, subject to FR-034's limit, and one that returns to the page's first step, where the values already typed are editable again and retained except the password, which the page never retains or shows; a reload still resumes the code step while the pending request is live, and a fresh submission replaces the pending request on FR-034's terms. FR-038, AC-041, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: At the administrator's forced first sign-in, may the new password be identical to the initial password the operator supplied, so that submitting the same value clears the requirement without changing anything? → A: No — the change MUST set a value different from the initial password: a submission that repeats it is refused and clears nothing, and the requirement is cleared only by an actual change. The allowance that a new password MAY repeat the one it replaces stays as it is for every change made after the person's own password, because the policy keeps no history; only the forced first change is bounded (decided 2026-10-22, Clarifications).
- Q: When the sign-up form is submitted, does the pending request hold the submitted password until the account is created after verification, and in what form is it held so that no plaintext password is retained? → A: The password is irreversibly protected at submission — in the same protected form a stored password has, computed before the pending request is written — and the pending request holds only that protected value; the account is created from it when the correct code is entered, so no plaintext password is ever stored, logged, or cached while the request lives, and the page never retains or shows it. A request that is replaced or ends discards the value with it (decided 2026-10-22, Clarifications).
- Q: When more than one refusal applies to one submission — an exhausted rate limit, a filled hidden field, a submission before the minimum time, a value that breaks a rule, and a number that already has an account — which refusal does the sender receive first, and in what order are the checks applied? → A: One fixed order, applied identically on every page: the operation's rate limit first, then the sign-up form's hidden field, then its minimum time-to-submit, then the value rules, then the account-existence comparison. A submission refused at a step is decided by that step alone, so no later check runs; within the value step every failing rule may report its own message, but no account-existence comparison runs until every value rule has passed (decided 2026-10-22, Clarifications).
- Q: When a person asks for a new one-time code and the messaging channel does not accept the message, does the previously delivered code stay valid, or is it invalidated at the moment of the request so that the live request carries no valid code until another re-request succeeds? → A: The previous code stays valid until the channel accepts the new message: the replacement takes effect only when the new code is dispatched, a failed send leaves the previous code as the one valid code, the pending request stays live, and the failed attempt consumes no part of the limit on re-requesting. A moment with no valid code therefore never arises, and a channel outage does not cost the person the code they already hold (decided 2026-10-22, Clarifications).
- Q: Is the administrator's forced first change a password change for the two rules that follow one — does it end every existing session (FR-013), and does it send the security notice (FR-043) — or is it a special path exempt from both? → A: Both rules apply: it is a password change like any other, so every existing session of the account ends, including the restricted session the change was made from, and the administrator signs in again with the new password, now unrestricted; the security notice is sent as well, exactly as AC-047 already provides for the account's own change action, because the forced change replaces a password the account already held (decided 2026-10-22, Clarifications).
- Q: When a session ends by a platform revocation (FR-012), by a password change or reset made elsewhere (FR-013), or by a sign-out of every device (FR-011), does the merchant see the same ended-session state FR-049 defines, or do those paths have no defined surface? → A: Every path that ends a session leads to the one state FR-049 defines — the explicit state inside the frame, stating that the session has ended and offering the way to sign in again — so a platform revocation, a password change or reset, and a sign-out of every device join the inactivity timeout, the absolute maximum lifetime, an explicit sign-out elsewhere, and a block; no session-ending path shows an unrelated error, and the blocked variant still says the account is blocked. FR-049 and AC-053 carry the rule (decided 2026-10-22, Clarifications).
- Q: When the messaging channel accepts a one-time-code message but delivery later fails, is that a send failure that must produce the explicit failure state, or is "cannot be sent at all" bounded to a refusal at acceptance? → A: Bounded to a refusal at acceptance: a message the channel accepts is a successful send from the platform's side even if it is never delivered, a later delivery failure is outside the platform's observation and produces no failure state, and a person who does not receive an accepted message can request a new code subject to FR-034's limit; the explicit failure state and the retry it offers govern a channel refusal at acceptance alone. FR-034, AC-036, SC-009, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: Does the bound on incorrect entries count an expired code, or a code that a replacement has superseded, as an incorrect entry, or only a wrong value entered for the code that is currently valid? → A: Only a wrong value entered for the live code counts; an expired code and a superseded code are refused as expired or superseded and MUST NOT increment the bound, because neither is a wrong guess of the live code, so a stale code cannot lock a person out and the count measures exactly the guesses the bound exists to stop. FR-034, AC-036, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: When a new sign-up or recovery request is started for a mobile number whose pending request is in the recovery flow's verified state, does the new request replace that state at once, or can the old verified state still set a password? → A: The new request replaces the pending request in every state, including the verified state: the verified state ends at once, its authority to set a password is withdrawn, and only the new code step is live, so two authorities never coexist for one number and a stale new-password step cannot set a password after a new code has been sent. FR-014, FR-034, AC-036, AC-041, the key-entities note, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).
- Q: Does the administrator's forced first change require the current (initial) password, as FR-013 requires of the account's own change action, or is the fresh sign-in proof enough? → A: It requires the current password: the forced change is a password change like any other for this rule, so a submission without the current password, or with a wrong one, is refused, clears nothing, leaves the account restricted, and counts as a failed password verification under FR-009, while a correct current password with a new value clears the requirement and lifts the restriction. FR-028, AC-030, US6's Independent Test, the administrator Assumption, the matching edge case, and the Test Coverage Request carry the rule (decided 2026-10-22, Clarifications).

### Session 2026-10-24

- Q: When the recovery flow resets the password of a blocked account, what does the in-place confirmation state, given that AC-016 promises a sign-in that a block makes impossible? → A: It states both outcomes — the password was changed and the account is blocked — and says plainly that sign-in stays refused until an administrator returns the account to active; the block is disclosed only after the code is verified, so FR-015's uniformity is untouched, and the confirmation never promises a sign-in that cannot succeed. FR-014, FR-017, AC-016, and the matching edge case carry the rule (decided 2026-10-24, Clarifications).
- Q: When a new one-time code is successfully dispatched for a live pending request, does the pending request's lifetime start over, or does the original expiry still bound the replacement code? → A: It starts over — an accepted dispatch gives the pending request and the replacement code the full period Constitution Mandated Values fixes, so a new code is never delivered with only the remainder of the request it replaced; the limit on requesting a new code bounds repeated extension, and a dispatch the channel refuses changes neither the code nor the expiry. FR-034, AC-036, the Key Entities note, and the matching edge case carry the rule (decided 2026-10-24, Clarifications).
- Q: A password change ends every session of the account by FR-013, while FR-043 requires a notice on a password change and on a sign-out of every device — does one action send one notice or two? → A: One — the session endings are the change's own consequence rather than a second action, so the change sends a single notice that reports it and the sessions it ended; the sign-out-of-every-device notice is sent when the merchant performs that action, not when a password change ends the same sessions. FR-013, FR-043, AC-047, and the matching edge case carry the rule (decided 2026-10-24, Clarifications).
- Q: SC-001 and SC-003 fix a three-minute journey while SMS delivery is outside the platform's control — is the time the code spends in delivery excluded from those criteria, as SC-009 excludes it? → A: Yes — both criteria measure the person's own actions and the platform's responses, and the delivery wait is excluded from the moment the messaging channel accepts the message, so a slow network does not fail a criterion the platform cannot control; SC-009, the Assumptions, and the end-to-end test note draw the same boundary (decided 2026-10-24, Clarifications).

### Session 2026-10-25

- Q: ADR-126 amends the Product Register with the Upload Catalog page as a standalone merchant page — does this slice's structural assertion of the sidebar's item list, and the register counts this specification names, change with it? → A: Yes — the frame's item list carries nine destinations now, with Upload Catalog between Catalog and My Files and pointing at the `/upload` route ADR-126 fixes, and the register is at twenty-eight pages; FR-039, AC-042, and US5 carry the nine-item list, the Assumptions bullet carries the count and the route alongside them, and the parentheticals in earlier entries that name eight destinations or twenty-seven pages are superseded as of this session. The page itself ships with R2, which the roadmap now assigns, and the structural verification is updated in the same change (decided 2026-10-25, Clarifications).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create an account and verify the mobile number (Priority: P1)

A visitor to the platform signs up as a merchant. They enter their full name, a
Libyan mobile number on +218 (the form offers no dial-code selector at all — the
platform is Libyan only), a password, a city picked from one fixed searchable
list of every Libyan governorate, city, and area, and an optional shop name. The
platform sends a one-time code by SMS to the number, and the account becomes
usable only once the visitor enters that code correctly — entering it signs the
visitor in, with no separate sign-in step. This is the door into
the whole product: without a verified account a person cannot upload, bookmark,
or message, so it is the first thing the platform must do.

**Why this priority**: It is the entry point for every other slice and the only
way a person becomes a merchant. Without it nothing else in the product is
reachable.

**Independent Test**: Can be fully tested by completing the sign-up form with a
valid Libyan mobile number and entering the code the platform sends, and
delivers a usable merchant account with the merchant signed in; the number's
Libyan-only shape, the absence of a dial-code selector, the city list, and the
uniform response are each verifiable on their own.

**Acceptance Scenarios**: covered by AC-001 – AC-007, AC-037, AC-041, AC-043, and AC-046 in the Acceptance Criteria section.

---

### User Story 2 - Sign in, sign out, and end every session (Priority: P1)

A verified merchant signs in with their mobile number and password and is not
asked for a code. They can sign out of the current session, or sign out of every
device at once. The platform itself can end a signed-in session at any time, and
changing the password ends every existing session. A session also ends at its own
lifetime — the timeout after no activity, or its absolute maximum lifetime —
after which the merchant signs in again. This is how a
merchant gets back in and how they take control of their access. This slice
delivers sign-out and sign-out-of-every-device as behaviour only: no surface
offers them here, because no page this slice ships carries the frame, and the
control arrives with the slice that owns the account control's destination
(decided 2026-10-10, Clarifications). The account's own change-password action
is delivered the same way — as behaviour, with no page — and the profile page
that offers it arrives with a later slice (decided 2026-10-11, Clarifications).

**Why this priority**: A merchant who cannot sign in or out cannot use the
product; the session lifecycle is part of the same MVP as account creation.

**Independent Test**: Can be fully tested by signing a verified merchant in
without a code, signing out of one session, signing out of every device, ending a
session from the platform side, and changing the password, and delivers control
over the merchant's access. Sign-out, sign-out-of-every-device, the
change-password action, and the other session-ending paths are verified at the
behaviour level, and the sign-out control itself is verified at the structural
level as the account menu's third item with its yes-or-no confirmation, because
no page this slice ships renders the frame (decided
2026-10-10 and 2026-10-11, Clarifications; revised 2026-10-21, Clarifications).

**Acceptance Scenarios**: covered by AC-008 – AC-015, AC-040, AC-045, and AC-047 in the Acceptance Criteria section.

---

### User Story 3 - Recover a forgotten password (Priority: P2)

A merchant who has forgotten their password asks to reset it. The platform sends
a one-time code by SMS to the registered mobile number, and once the code is
entered correctly the merchant sets a new password, which ends every existing
session of the account. The response never reveals whether the number has an
account.

**Why this priority**: Without recovery a merchant locked out of their password
is permanently locked out, since there is no email and no self-deletion; it is
essential but secondary to getting in the first time.

**Independent Test**: Can be fully tested by requesting a reset for a registered
number, entering the code, and setting a new password, and delivers a merchant
back into their account with every session the account already held ended; the
uniform response is verifiable on its own, and so is the code's single use — it
stops being usable once verified, the new-password step survives a reload while
the verified state lives, and it cannot authorise a second reset (decided
2026-10-22, Clarifications).

**Acceptance Scenarios**: covered by AC-016 – AC-017 and AC-038 in the Acceptance Criteria section.

---

### User Story 4 - Account status and control over sessions (Priority: P2)

An account carries a status: active or blocked. A blocked merchant keeps all
their data and their public contributions but can no longer sign in, and any
session they already held stops granting access. A merchant can never delete
their own account; the platform's administrator controls accounts. This slice
delivers the status and what it governs — the uniform refusal at sign-in and the
withdrawal of the sessions the account already held — while the act of blocking
belongs to the administrator's Users page, which arrives with a later slice
(decided 2026-10-11, Clarifications).

**Why this priority**: Blocking is how the platform withdraws access without
destroying data, and it must be defined with the account from the start, but it
is not needed to create the first account.

**Independent Test**: Can be fully tested by reading an account's status, by
setting an account to blocked and confirming both that the merchant is refused
at sign-in and that their data and public contributions remain, and by
confirming no delete control exists; the blocked state is reached directly in
this slice's tests, because the act of blocking arrives with the administrator's
Users page (decided 2026-10-11, Clarifications).

**Acceptance Scenarios**: covered by AC-018 – AC-021 in the Acceptance Criteria section.

---

### User Story 5 - Move around the platform inside the shared page frame (Priority: P2)

Every page of the public site and the merchant's area is presented inside one
shared page frame: a header, a sidebar, the product's icon set, and the
product's typography. The sidebar sits at the inline-start edge — the right
edge under the RTL direction — and carries the platform's navigation item
list — one item per registered destination a guest or a signed-in merchant can
reach (Home, Parts, Catalog, Upload Catalog, My Files, Cart, Notifications,
Messages, and Profile), with the bare pages and the four static pages carrying no item and
with the same list shown to a guest and to a signed-in merchant — no item
added, removed, or disabled by role — together with the sidebar-collapse
control. The sidebar shows in full on a wide screen and narrows to an icon-only
rail when collapsed; on a narrow screen it becomes a drawer that opens and
closes. The header carries the platform's logo/home control at its
inline-start edge and, at its inline-end edge, the notifications control, the
theme switch, and the account control; the account control opens a menu
carrying «حسابي»، «إعدادات»، and «تسجيل الخروج», the last asking for a
yes-or-no confirmation; for a guest a sign-in action replaces the account
control and the notifications control, and the guest keeps the theme switch
(ADR-102). The frame carries the
platform's way of reaching the static pages (Contact, Privacy Policy, Terms of
Use, FAQ). The frame never appears on the sign-up, sign-in, password-recovery,
error, or static pages, which are shown bare. This slice delivers the frame
whole — its header's logo/home, notifications, and theme-switch controls and the
account menu, the sidebar's navigation item list with the collapse control,
its means of reaching the static pages, and the surface that carries those
links — and verifies them structurally; the menu's open and confirm behaviour
and the sidebar's two-width behaviour are exercised at runtime by the slice that
ships the first page carrying the frame, while the data behind the menu's
destinations and the notifications destination arrives with the slice that owns
each destination (decided 2026-10-10, revised 2026-10-11 and 2026-10-21,
Clarifications; revised 2026-10-25, ADR-126).

**Why this priority**: The frame is what every later browser-facing slice
composes instead of rebuilding; it is delivered here so the platform is coherent
from its first page. It is secondary to the account flows, which are usable
without it.

**Independent Test**: Can be fully tested structurally: the frame's composition
— the header's logo/home, notifications, and theme-switch controls and the
account menu, and the sidebar's navigation item list with the collapse
control —
is verified as delivered, and the bare pages this slice ships are verified to
carry no frame, because this slice ships no page that renders the frame. The
sidebar's behaviour at two screen widths and the menu's behaviour are not
exercised at runtime in this slice: they are verified by the slice that ships
the first page carrying the frame, and this slice verifies the controls'
presence in the frame's composition (decided 2026-10-11; revised 2026-10-21,
Clarifications).

**Acceptance Scenarios**: covered by AC-022 – AC-028, AC-039, AC-042, AC-044, AC-051, AC-052, and AC-053 in the Acceptance Criteria section.

---

### User Story 6 - The operator creates the administrator account (Priority: P3)

No one becomes an administrator through the public sign-up flow. The platform's
administrator account is created by the operator, and the administrator must
change the password at first sign-in. This keeps the platform's privileged
surface out of the public registration path, and the merchant sign-in surface
refuses an administrator's credentials with the same uniform refusal any failed
sign-in receives, so the administrator signs in only on the administrator's own
surface. This slice delivers the
provisioning action and the requirement it places on the account, not the
administrator's sign-in surface, which arrives with a later slice (decided
2026-10-10 and 2026-10-11, Clarifications).

**Why this priority**: It protects the platform's privileged surface and is
required from the start, but it concerns the operator rather than the merchant,
so it is lower priority than the merchant's own flows.

**Independent Test**: Can be fully tested by completing the public sign-up flow
and confirming the result is always a merchant, by confirming that the
administrator's credentials are refused on the merchant sign-in surface with the
same uniform refusal any failed sign-in receives, by running the provisioning
action twice and confirming each run yields a distinct administrator account
while a run for a number that already has an account creates nothing and reports
the conflict, and by confirming that the provisioned account carries the
forced-password-change requirement, so that any further product action is refused
until the password is changed while ending the session remains available, and by
confirming that the password change made at that
first sign-in clears the requirement and lifts the restriction while no other
path clears it, and that a submission repeating the initial password is refused
and clears nothing, that the change requires the current password and a
submission without it or with a wrong one is refused and leaves the account
restricted, that the change ends every existing session of the account,
and that it sends the security notice — the first sign-in and the change made at it are exercised at
the behaviour level here, with no page, and only the sign-in surface itself
arrives with a later slice.

**Acceptance Scenarios**: covered by AC-029 – AC-030 and AC-054 in the Acceptance Criteria section.

---

### User Story 7 - Sign-up resists automated abuse without a CAPTCHA (Priority: P3)

The sign-up form is protected against automated submission by a hidden field a
person leaves empty, a minimum time between the form being shown and being
submitted, and a limit on how often one client may submit. The rate limit covers
every authentication operation — account creation, sign-in, and password
recovery — so one client cannot submit any of them without bound. No CAPTCHA is
ever used anywhere in the platform. The whole browser surface this slice ships is
protected by the three controls the constitution requires of the first
browser-facing feature: every state-changing request is protected against
request forgery, every value a person supplies is encoded for its output context,
and every response carries the security headers the constitution names (decided
2026-10-11, Clarifications).

**Why this priority**: It is a protection layer over sign-up rather than a
merchant journey of its own, but it must exist with the form it protects.

**Independent Test**: Can be fully tested by submitting the form with the hidden
field filled, before the minimum time has passed, and more often than the limit,
by confirming no CAPTCHA challenge is ever presented, and by confirming that a
request the person did not make is refused, that a value typed as markup or
script is shown as text, and that every response carries the required security
headers.

**Acceptance Scenarios**: covered by AC-031 – AC-036, AC-048 – AC-050, and AC-055 in the
Acceptance Criteria section.
---

### Edge Cases

- A visitor signs up with a number already registered, written differently
  (spaces, a leading zero, without the +218 prefix, or with the digits typed as
  Arabic-Indic numerals). It is the same number and must not become a second
  account, and the response must not reveal that the number is taken (see
  AC-007, AC-006).
- Two sign-up attempts for the same number, or two entries of its one-time code,
  arrive at the same moment. Uniqueness is enforced when the account is created,
  so at most one account exists; the attempt that does not create it is refused
  with the same uniform response and the same direction to sign in or to recover
  the password, and no partial account and no second session is left behind
  (AC-006).
- A person submits the sign-up form, or a one-time code, and the request is
  still in flight when they submit again. The page shows an in-progress state
  and the submit control is disabled, so no second dispatch is started; if a
  duplicate still reaches the platform, the server-side uniqueness rule handles
  it as the concurrent case above, so no second account and no second code
  dispatch results (AC-043).
- A visitor completes sign-up with a number that already has an account and
  enters the code correctly. No second account is created and the password they
  typed is not applied to the existing account; they are directed to sign in or
  to recover the password by a message on the code step that names both options
  and offers the link to the sign-in page and the link to the password-recovery
  page, with no redirect (AC-006).
- A person asks to reset the password of a number that has no account and enters
  the delivered code correctly. Ownership of the number is proven, no password is
  set, and the platform states explicitly that no account exists for that number;
  the request's response, the following step, and the code dispatch were already
  indistinguishable from those for a number that has an account (AC-017).
- A one-time code is entered incorrectly several times, after it has expired, or
  after a replacement has superseded it. The platform refuses it and lets the
  person request another — which replaces
  the previous code when the new message is accepted and otherwise leaves it
  valid, restarts the pending request's own expiry at that accepted dispatch so
  the new code carries a full period, and does not reset the bound on incorrect
  entries,
  because that bound is counted over the whole verification — without revealing
  whether the number has an account. Only a wrong value entered for the live code
  increments the bound: an expired code, and a code a replacement has superseded,
  are refused as expired or superseded and do not increment it, so a stale code
  cannot lock the person out. When the bound on incorrect entries is
  reached the pending request ends, so the person starts a fresh request — a
  sign-up or a recovery — which begins a new verification with the count at zero
  (AC-036).
- The messaging channel refuses a one-time code at acceptance — the channel
  fails, or the number is one the channel will not accept because it cannot
  deliver to it. The person sees an explicit failure and can
  retry, the pending request — a sign-up or a password reset — stays valid until
  it expires, and the failed send does not consume the limit on requesting a new
  code (AC-036). The failure is shown on the submission that asked for the code
  and the code step is never reached, because the send is attempted inside that
  request and the step opens only once the channel has accepted the message
  (AC-036).
- The messaging channel accepts a one-time code but the message never reaches the
  number. The platform has no delivery signal, so it shows no failure state and
  the code step remains; the code expires on its own, and the person can request
  a new code subject to the limit on requesting a new code, because a later
  delivery failure is outside the platform's observation (AC-036).
- A one-time code is entered correctly but the account cannot be created at that
  moment — a transient failure. The pending request stays valid until its own
  expiry and the same code remains usable, because a code is consumed only once
  the account is created; the person sees an explicit, retryable failure, and
  the failure counts neither as an incorrect entry nor against the limit on
  requesting a new code (AC-036).
- A visitor abandons sign-up after the code is requested; no usable account is
  left behind.
- A failure occurs while a person is using one of the three bare pages this
  slice ships, and it is not one the specification names — a session that cannot
  be created after a correct password or a correct code, or any other unexpected
  failure. The page shows an inline, explicit, retryable failure message, the
  person stays on the page, no navigation happens, and no error page is shipped
  or reached (AC-043).
- A person reloads the sign-up or password-recovery page, or closes it and comes
  back, while a one-time code is still waiting for them. While the pending
  request is still live and its code has not yet been verified the page shows the
  code step again, so the code already sent stays usable and no new code is
  requested; once the code has been verified in password recovery, the same
  reload shows the new-password step while the verified state lives; once the
  pending request has ended or expired, the page returns to the form's first step
  and a fresh submission begins a new verification on FR-034's terms (AC-041,
  AC-036).
- A person at the sign-up code step wants to use a different mobile number. The
  full name, the mobile number, the city, and the optional shop name are shown
  at that step for reading and are not editable there; the step carries a
  control that returns to the page's first step, where those values are editable
  again and retained except the password, which the page never retains or shows, so
  the person changes the number and submits the form again; the fresh
  submission starts a new pending request for the new number on FR-034's terms,
  while the pending request for the first number stays live until its own
  expiry, because only one pending request is live per number (AC-041,
  AC-036).
- A person reaches the sign-up code step. The password they submitted is not
  shown back to them in any form — neither re-displayed, nor echoed, nor
  rendered masked — so the step carries the full name, the mobile number, the
  city, and the optional shop name for reading, and the password never returns
  to the browser (AC-041). In the password-recovery flow, the code step carries
  the mobile number alone, because that is the only field the recovery form
  collected; no account field is shown there before the code is verified
  (AC-041, FR-015).
- A person enters the correct one-time code at sign-up for a number that already
  has an account. The platform states that no second account was created and
  directs the person to sign in or to recover the password, and the pending
  request ends at that point: its code stops being valid at once, so no live
  request and no usable code survive an outcome the platform has already
  reported, and the same rule governs the password-recovery flow's counterpart
  (AC-006, AC-036).
- A person enters the correct code in password recovery and reloads the page,
  or closes it and comes back, before setting a new password. The new-password
  step is shown again while the verified state lives, no new code is requested,
  and the code already used is not offered again; if a new request for the same
  number replaces the pending request, the verified state ends at once and the
  new code step is the only live step; once the password is set, a reload returns
  the page to its first step (AC-036, AC-041, FR-014).
- A person who has just set a new password tries to use the same one-time code
  again. The pending request has ended, so the code is refused and a fresh
  request is needed (AC-036, FR-034).
- A +218 number that is not a mobile number (for example a landline) is
  submitted. It is refused, because the account identifier is a Libyan *mobile*
  number (AC-003).
- The operator runs the provisioning action for the administrator account: the
  account is created directly, with no one-time code and no verification step,
  and the mobile-number verification rule is not applied to it (AC-030).
- The administrator's forced first change is submitted without the current
  password, or with a wrong one. It is refused, clears nothing, and leaves the
  account restricted; a correct current password with a new value clears the
  requirement and lifts the restriction (AC-030, FR-028).
- A merchant is blocked while signed in on more than one device: every session
  they hold stops granting access (AC-021).
- A merchant asks to reset the password of a blocked account and enters the
  correct code: the reset completes — a new password is set and every existing
  session ends — but the account stays blocked, so no access is granted; the
  request's response stayed uniform, and the outcome is stated only after
  ownership of the number is proven, and the confirmation states plainly that
  the account is blocked, so it does not promise a sign-in that cannot succeed
  (AC-016, AC-038, AC-019).
- A person asks to reset the password of a mobile number whose account holds the
  administrator role and enters the delivered code correctly: ownership of the
  number is proven, no password is set, no session is created, and the platform
  states explicitly that the credential cannot be reset on this surface; the
  request, the following step, and the code dispatch were already
  indistinguishable from those for a number with no account (AC-016).
- An account is locked and the merchant submits the correct password before the
  fifteen minutes elapse: the attempt is refused exactly like any other failed
  sign-in, and nothing distinguishes that refusal from a wrong password or from
  an unknown number (AC-010, AC-009).
- An account is locked and the merchant resets the password through the recovery
  flow before the fifteen minutes elapse: the reset succeeds, but the lock keeps
  running its full fifteen minutes and the count of consecutive failed attempts
  is not reset, so the merchant signs in with the new password once the lock
  lifts (AC-010).
- The city field finds no match for what the person typed; they can still only
  choose a value from the fixed list (AC-005).
- A guest opens a page that carries the frame: the header shows a sign-in action
  in place of the account control and the notifications control, with no
  account menu, while the theme switch remains available in the header and the
  sidebar collapse control remains available in the sidebar, so a guest can
  still change the appearance and open or close the sidebar (AC-025).
- A guest presses a sidebar item that needs an account, such as «سلة المشتريات»
  or «الملف الشخصي»: the sign-in page is shown, and the item itself stays
  present and enabled because the list is not varied by role (AC-052).
- A merchant's session ends, or their account is blocked, while they are on a
  page that carries the frame: an explicit state inside the frame states that
  the session has ended and offers the way to sign in again, and says plainly
  that the account is blocked when that is the reason (AC-053).
- A signed-in merchant opens the account menu and chooses «تسجيل الخروج»: a
  yes-or-no confirmation appears; cancelling it leaves the session untouched,
  and confirming it ends the session (AC-051).
- A signed-in merchant opens the account menu and dismisses it without choosing
  an item: the menu closes and nothing changes (AC-051).
- A person who has signed in moves between pages: the appearance they chose
  (dark or light) holds, and is applied before the page is painted so it does not
  flash the other appearance (AC-027).
- A signed-in person opens one of the three bare pages this slice ships. The
  page renders exactly as it does for a guest, with no redirect and no
  signed-in-specific surface; no sign-out control is offered there, because
  the sign-out control belongs to the frame — its only control is the
  account menu's third item, and the page carries no menu because it carries no
  frame (AC-044, AC-051).
- A screen narrower than the smallest supported width still renders the frame
  without breaking the sidebar or the header (AC-024).
- One of the three bare pages this slice ships is opened: it carries no footer,
  because the footer is part of the frame and the frame is absent from those
  pages, so the way to the four static pages is not offered there (AC-026,
  FR-021).
- An administrator's mobile number and password are submitted on the merchant
  sign-in surface: the attempt is refused with the same uniform refusal any
  failed sign-in receives, and nothing distinguishes it from a wrong password or
  from an unknown number (AC-029).
- The operator runs the provisioning action for a mobile number that already has
  an account: uniqueness is enforced exactly as for any account, so no second
  account is created for that number and the conflict is reported to the
  operator, who is running the action out of band (AC-030).
- A person types a mobile number on the sign-in or password-recovery page: the
  page offers no dial-code selector and the country is fixed to Libya (+218), as
  at sign-up (AC-002).
- A person submits, on the sign-in or password-recovery page, a value that is
  not a valid Libyan mobile number on +218 at all. It is refused with a distinct,
  explicit format refusal, which is not the uniform refusal a failed sign-in
  receives and is excluded from SC-004's enumeration comparison, because such a
  value can never have an account (AC-045).
- The sign-up form is submitted with the hidden field filled, or before the
  minimum time has passed since it was shown. In the first case the platform
  returns the same response a successful submission receives, so nothing in the
  response tells the sender it was detected, and it does nothing further — no
  pending request is started, no one-time code is dispatched, and the code step
  is not reached, so the form cannot be used to send SMS to numbers the
  submitter does not control; in the second it returns an explicit,
  retryable refusal. No account is created in either case (AC-031, AC-032).
- A person is refused by a rate limit — on the sign-up form or on one of the
  three authentication operations. The refusal is distinct and explicit, states
  that the limit was exceeded and that they may retry later, and is not the
  uniform refusal a failed sign-in receives, because it depends on the client's
  own request history and reveals nothing about whether an account exists
  (AC-033, AC-035).
- A merchant changes their password, or ends every session of the account at
  once, and the notice cannot be sent — the messaging channel fails. The change
  and the ending of the sessions stand, the failure is recorded as the dispatch
  failure FR-037 names, and no action the person asked for is undone (AC-047).
  A password change that ends every session of the account sends one notice for
  the change, not a second one for the sessions it ended (AC-047, FR-043).
- Several people share one network address — as a mobile carrier's address is
  shared — and one of them exhausts the address's budget for an authentication
  operation. The refusal is the same distinct, explicit limit refusal, and the
  per-number key is spent only by submissions for that number, so a person's
  budget is not consumed by another's requests (AC-035).
- A person requests a new one-time code for a live pending request beyond the
  limit on requesting new codes. The request is refused with a distinct,
  explicit refusal stating that the limit was exceeded and that they may retry
  later; the refusal reveals nothing about whether the number has an account,
  because the pending request exists for a number with no account exactly as it
  does for one, so it is excluded from SC-004's enumeration comparison, and the
  code already delivered stays valid while the operation's own rate-limit budget
  is untouched (AC-036, SC-004).
- A signed-in merchant whose account is locked — five consecutive failed
  current-password checks inside the account's own change-password action —
  completes that change successfully. The change stands, the count of
  consecutive failed attempts clears to zero, and the lock keeps running its
  full fifteen minutes: it refuses sign-in only, so it neither blocks the action
  nor ends the session the change was attempted from, and the merchant signs in
  with the new password once the lock lifts (AC-010).
- A person completes an action on one of the three bare pages — verifies the
  code at sign-up, signs in, or sets a new password in recovery — and the page
  renders its confirmation in place. Reloading the page, or closing it and
  returning, shows the page's first step again with no confirmation and no
  redirect: the confirmation was the outcome of the action rather than a state
  the page carries, so the page still renders for that person exactly as it does
  for a guest (AC-044, AC-041).

## Requirements *(mandatory)*

### Functional Requirements

**Reading the list.** The requirements below are grouped by the subject they
govern, not by identifier, because a later clarification session inserted a
requirement beside the one it qualifies rather than at the end of the list. The
identifier is what a task, a criterion, or a reviewer cites, and it is stable
for the life of the feature: an identifier is never renumbered, never reused,
and never withdrawn, and a requirement that a later session revises keeps its
identifier and its position. The Acceptance Criteria section groups every
criterion under the user story it serves, and each criterion names the
requirements it asserts (decided 2026-10-21, Clarifications).

**Creating an account**

- **FR-001**: System MUST let a person create a merchant account by providing a
  full name, a Libyan mobile number, a password, a city chosen from the fixed
  Libyan city list, and an optional shop name. The full name MUST be present and
  MUST NOT be empty or made of spaces alone, and both the full name and the
  optional shop name MUST be bounded by a maximum length; within those bounds a
  value MUST be accepted as typed — letters and numerals alike — with no
  alphabetic-shape rule imposed, so the rule is testable here and reusable by the
  profile slice. The maximum lengths are stated numerically under Constitution
  Mandated Values (decided 2026-10-11, Clarifications). The form MUST ask for no
  acceptance of the platform's terms or of its privacy policy: the Product
  Register fixes the fields sign-up collects, so no consent control is added and
  the account records no acceptance, and the two pages stay reachable from the
  frame's footer at the routes FR-024 fixes (decided 2026-10-11, Clarifications).
  The shop name carries no uniqueness rule: it is a label within its bound and
  two accounts MAY hold the same value, because the register names no uniqueness
  invariant for it (decided 2026-10-11, Clarifications).
- **FR-002**: Every page this slice ships that takes a mobile number — the
  sign-up, sign-in, and password-recovery pages — MUST offer no dial-code
  selector; the country is fixed to Libya (+218) and no other country or dial
  code is presented (decided 2026-10-11, Clarifications).
- **FR-003**: System MUST reject a number that is not a Libyan mobile number on
  +218, and MUST create no account for it. The set of valid Libyan mobile
  prefixes is fixed here, once, as one reference dataset for accounts and named
  in a decision record alongside the city list; the platform
  MUST decide whether a +218 number is a mobile number against that dataset
  rather than against a rule of its own, and a later slice reads the dataset
  instead of writing one. The refusal for such a value on the sign-up form is
  the same distinct, explicit format refusal FR-042 names, and it is excluded
  from SC-004's enumeration comparison for the same reason, because a value
  that is not a valid Libyan mobile number can never have an account (decided
  2026-10-21, Clarifications).
- **FR-004**: System MUST confirm the mobile number at sign-up by sending a
  one-time code by SMS to that number; the account MUST become usable only after
  the correct code is entered, and entering the correct code MUST sign the
  merchant in — the account becomes usable in place, with no separate sign-in
  step. The confirmation that follows MUST be rendered in place on the sign-up
  page — the code step is replaced by a confirmation that the account is ready
  and that the merchant is signed in — with no navigation, no new route, and no
  new page, because this slice ships no destination page (decided 2026-10-11,
  Clarifications).
- **FR-005**: System MUST present the city as a searchable choice from one fixed
  list covering every Libyan governorate, city, and area, and MUST accept only a
  value drawn from that list. The list is a single list whose entries are the
  governorates, the cities, and the areas themselves; each entry MUST carry one
  Arabic name and no Latin alternate name, and the search MUST match those
  Arabic names while ignoring diacritics, so a person who types a city without
  its diacritics still finds it and no second naming source has to be kept in
  step with the list (decided 2026-10-22, Clarifications).
- **FR-006**: System MUST NOT reveal, in any sign-up response, whether the
  submitted mobile number already has an account. The sign-up flow MUST pass
  through the code step in the same way, and MUST send the code to the number,
  whether or not an account exists, so that the form's response, the following
  step, and the sending of the code are indistinguishable; the rule is bounded to
  those steps, because entering the correct code proves ownership of the number
  and the outcome past that point differs legitimately. When the correct code is
  entered for a number that already has an account, the platform MUST create no
  second account and MUST NOT apply the submitted password, and MUST direct the
  person to sign in or to recover the password — the direction is a message on
  the code step that names both options and offers the link to the sign-in page
  and the link to the password-recovery page, with no redirect introduced,
  because the three bare pages render identically for a signed-in person and for
  a guest (decided 2026-10-11, Clarifications). The indistinguishability MUST
  also cover how long each of those steps takes: the form's response, the
  following step, and the sending of the code MUST do the same work whether or
  not the number has an account, so no step's duration signals it (decided
  2026-10-11, Clarifications). When the correct code is entered for a number that
  already has an account, the pending request MUST end once the outcome is
  stated, and its code MUST stop being valid at once, so no live request and no
  usable code survive an outcome the platform has already reported — the same
  rule FR-014 states for the recovery flow (decided 2026-10-22, Clarifications).
- **FR-031**: System MUST treat the mobile number as the account's unique
  identifier, comparing it in a normalized form so that two spellings of the same
  number are one account. The normalized form MUST also be reached from digits
  typed as Arabic-Indic numerals (for example `٠٩١…`): the field is tolerant on
  input and reads them as the same digits, so such a number is neither refused as
  invalid nor allowed to become a second account for the same person; the rule
  governs what is typed, never what is rendered, so FR-026's Latin-numeral rule
  stands unchanged (decided 2026-10-11, Clarifications). The same tolerance
  governs the one-time-code field: a code typed as Arabic-Indic numerals is read
  as the same digits and verifies identically, while every numeral the platform
  renders stays Latin (decided 2026-10-11, Clarifications). Uniqueness MUST be
  enforced at the moment the account is created rather than by a check made
  before it, so that two attempts arriving together for one number still produce
  at most one account and the attempt that does not create it receives the
  uniform outcome FR-006 requires (decided 2026-10-11, Clarifications).
- **FR-035**: System MUST enforce a password policy whenever a password is set —
  at sign-up, on password change, and when the operator's provisioning action
  sets an administrator's initial password — requiring a minimum length and
  rejecting
  common or breached passwords; the exact numeric values are left to the plan's
  Constitution Mandated Values. In the sign-up flow the policy MUST be applied
  when the form is submitted, before any one-time code is sent, and the refusal
  MUST be the same whether or not the number already has an account, so it adds
  no signal to FR-006's uniformity (decided 2026-10-11, Clarifications). The
  form that takes a password MUST state the policy's requirements before the
  password is typed, so that a person can meet the policy without trial and
  error, and each reason the policy refuses a password MUST carry its own
  message — a password shorter than the minimum, and a password that is common
  or breached — so that the person knows what to correct. None of these messages
  reveals whether an account exists: the policy is applied to every password
  that is submitted, and the same message is given for the same reason whether
  or not the number has an account (decided 2026-10-22, Clarifications). The
  common-or-breached check MUST be performed against a source the platform
  itself holds: this slice introduces no external service for it, so the check
  is always available, a sign-up or a password change MUST NOT fail for want of
  it, and no password material leaves the platform; the source and the way it is
  kept current are recorded in the plan (decided 2026-10-11, Clarifications).
  The policy sets no rule that a new password differ from the one it replaces: a
  password MAY be set to the value it already has, and no password history is
  kept, because the register provides no entity for one and this slice
  introduces no third entity (decided 2026-10-11, Clarifications; revised
  2026-10-22, Clarifications). That allowance is bounded by FR-028's forced
  first change: the administrator's first change MUST set a value different
  from the initial password the operator supplied, because a change that
  repeats it would leave the forced-password-change requirement unsatisfied,
  and the allowance therefore governs every later change alone (decided
  2026-10-22, Clarifications).
- **FR-040**: While a request is in flight — the sign-up form's submission, the
  sign-in form's submission, the password-recovery request's submission, the
  entry of a one-time code at sign-up or in password recovery, and the
  submission of the new password in password recovery — the page
  MUST show an in-progress state and MUST disable the submit control, so that a
  repeated submission cannot start a second dispatch or produce a second
  account. The guard governs every authentication form this slice ships, so a
  repeated submission of the sign-in form or of the password-recovery request is
  prevented exactly as one of the sign-up form, and no second request is started
  (decided 2026-10-11, Clarifications). It governs the new-password step of the
  password-recovery flow as well, so a repeated submission there neither sets
  the password twice nor ends the account's sessions twice, and it is the same
  guard on every submission these three pages make (decided 2026-10-22,
  Clarifications). The account's own change-password action has no surface in
  this slice, so the guard has no page to act on there (decided 2026-10-22,
  Clarifications). The guard is presentation only: the
  server-side uniqueness rule
  FR-031 remains the authority, so a duplicate that still reaches the platform
  is handled exactly as the concurrent-attempt case (decided 2026-10-11,
  Clarifications). The same rule governs failure: whenever a failure occurs while
  one of these three pages is being used — including a failure this
  specification does not name, such as a session that cannot be created after a
  correct password or a correct code — the page MUST show an inline, explicit,
  retryable failure message and MUST NOT navigate away from itself, because the
  error page arrives with a later slice and a bare page has no frame to navigate
  through; no placeholder error page is created here (decided 2026-10-11,
  Clarifications). Every state these pages render — the in-progress state, the
  inline failure message, and the in-place confirmation FR-004, FR-007, and
  FR-014 require — MUST be announced to assistive technology, and when a step
  replaces another the focus MUST move to the step now shown — its first field,
  or its heading when it carries no field — and MUST NOT remain on a control the
  previous step carried (decided 2026-10-22, Clarifications).

**Signing in and out**

- **FR-007**: System MUST let a verified merchant sign in with their mobile
  number and password, without a one-time code. Signing in MUST create a new
  session and MUST NOT end any session the account already holds: an account MAY
  hold an unlimited number of concurrent sessions, this feature applies no cap,
  and only a session's own end — its timeout, its absolute maximum lifetime, an
  explicit sign-out, or a revocation — removes it (decided 2026-10-11,
  Clarifications). A successful sign-in MUST render its confirmation in place on
  the sign-in page — the form is replaced by a confirmation that the merchant is
  signed in — with no navigation, no new route, and no new page, because this
  slice ships no destination page (decided 2026-10-11, Clarifications).
- **FR-008**: System MUST NOT reveal, in any sign-in response, whether the
  submitted mobile number has an account, including when that account is locked
  (FR-009) or blocked (FR-017). The uniformity MUST cover the response's whole
  observable shape — the same text, the same status, the same response path, and
  the same work: a sign-in attempt against an unknown number MUST perform the
  same verification work as one against an existing account, so how long a
  response takes MUST NOT signal whether the account exists (decided 2026-10-11,
  Clarifications).
- **FR-042**: At sign-in and in password recovery, when the submitted value is
  not a valid Libyan mobile number on +218, System MUST refuse it with a
  distinct, explicit refusal that states the value is not a valid Libyan mobile
  number. That refusal is not the uniform refusal FR-008 requires and is
  excluded from SC-004's enumeration comparison, because a value that is not a
  valid Libyan mobile number can never have an account, so the refusal depends
  on the value's shape rather than on whether an account exists — the same
  reasoning that excludes a rate-limit refusal (decided 2026-10-11,
  Clarifications).
- **FR-009**: System MUST lock an account for fifteen minutes after five
  consecutive failed sign-in attempts, and MUST express that lock as the same
  uniform refusal FR-008 requires: an attempt made while the account is locked is
  refused with the identical response — the same text, the same status, and the
  same response path as every other failed sign-in — and no message, timing
  difference, or other signal tells the person that the account is locked or that
  it exists. A successful password reset through the recovery flow MUST NOT lift
  the lock or reset the count of consecutive failed attempts: the lock runs its
  full fifteen minutes whatever the password is set to in the meantime. The lock
  is a time bound alone: when the fifteen minutes elapse the count of consecutive
  failed attempts MUST clear, and an attempt refused while the account is locked
  MUST NOT count as a further failed attempt, so the lock is never extended by
  attempts made during it. A successful sign-in MUST clear the count of
  consecutive failed attempts to zero: the lock counts a run of five failures
  with no success in between, so a success ends the run and the next failure
  starts a new count of one (decided 2026-10-11, Clarifications). The count
  measures a failed password verification alone: a refusal produced by a rate
  limit (FR-033), a refusal of a value that is not a valid Libyan mobile number
  (FR-042), the refusal a blocked account receives (FR-017), and the refusal an
  administrator account receives on the merchant sign-in surface (FR-027) MUST
  NOT
  increment it, because none of them reached a password verification against an
  active account, so the lock cannot be driven by requests that never verified a
  password (decided 2026-10-11, Clarifications). A status or role refusal still
  performs the same verification work as any other attempt and is refused
  afterwards on that ground, so its response's duration is indistinguishable —
  the verification it performs is simply not one against an active account
  (FR-017, FR-008; decided 2026-10-22, Clarifications). A current-password check that
  fails inside the account's own change-password action is a failed password
  verification against an existing, active account and is counted exactly as a
  failed sign-in is: five consecutive such failures lock the account for the same
  fifteen minutes, and the lock refuses sign-in only, so it neither blocks the
  change-password action itself nor ends the session the change was attempted
  from. A change made through that action that succeeds — the current password
  is correct — MUST clear the count of consecutive failed attempts to zero
  exactly as a successful sign-in does, because it is a successful password
  verification against an existing, active account and the run it ends had no
  success in between; it MUST NOT lift a lock already running, which keeps its
  full fifteen minutes whatever the password is set to, exactly as a successful
  reset through the recovery flow does not lift it (decided 2026-10-11,
  Clarifications).
- **FR-010**: System MUST let a signed-in merchant end the current session by
  signing out.
- **FR-011**: System MUST let a signed-in merchant end every session of their
  account at once ("sign out of every device").
- **FR-012**: System MUST allow the platform to end any signed-in session at any
  time, after which that session no longer grants access.
- **FR-013**: System MUST end every existing session of an account when its
  password changes, whether the password is changed from the account's own change
  action or set through the recovery flow; after a reset the merchant MUST sign
  in with the new password, except that a blocked account's block stands and
  grants no access, as FR-014 provides. The administrator's forced first change is a password
  change for this rule: it ends every existing session of that account too,
  including the restricted session it was made from, and the administrator signs
  in again with the new password, now unrestricted (decided 2026-10-22,
  Clarifications). The account's own change action MUST require the
  current password: a change submitted without it, or with a wrong one, is
  refused and ends no session, and the recovery flow is the only path that sets a
  password without the current one, because it proves ownership of the number
  with the one-time code (decided 2026-10-11, Clarifications). The account's own
  change action is delivered in this
  slice as behaviour and verified by the integration tests, with no page
  offering it: the profile page that offers it arrives with a later slice, so
  both halves of this requirement are exercised here at the behaviour level
  (decided 2026-10-11, Clarifications).
- **FR-032**: System MUST end a session on either of two clocks: the session
  timeout elapsing with no activity, and the session reaching its absolute
  maximum lifetime, which ends it however active the merchant is; on either end
  the merchant MUST sign in again. Only what the merchant themselves do counts
  as activity for the session timeout — opening a page, submitting a form, or
  any other action the merchant starts — and that action MUST reset the
  inactivity clock; a request the browser sends on its own, such as a background
  request the frame issues, MUST NOT count as activity, so a background request
  cannot keep a session alive indefinitely and the timeout keeps its meaning.
  Both values are stated numerically under
  Constitution Mandated Values. A session survives the browser being closed and
  reopened: the browser retains the reference that proves the session, while the
  session itself stays on the server and is never recoverable from browser
  storage, so a merchant who
  returns before the session's absolute maximum lifetime is still signed in, and
  only the session timeout or the absolute maximum lifetime ends it; closing the
  browser neither shortens nor extends either clock (decided 2026-10-11,
  Clarifications; revised 2026-10-21, Clarifications; revised 2026-10-22,
  Clarifications).
- **FR-037**: System MUST emit a structured record for each security-relevant
  event this slice produces — a failed sign-in attempt, a successful sign-in,
  the verification that creates an account at sign-up, a lock applied, a
  password change or a reset, a session revocation, a one-time-code dispatch
  failure, a security-notice dispatch failure, and the operator's provisioning
  of an administrator account —
  carrying no secret, no session token, and no personal data beyond
  what the constitution permits in a log. Collection, retention, and alerting
  remain with the log pipeline the deployment slice (R12) owns; this slice
  introduces no pipeline and no separate audit store of its own (decided
  2026-10-11, Clarifications). A record MUST identify its subject by an internal
  account identifier, MUST carry it only where an account exists — a record
  produced for a number with no account carries no account reference — and MUST
  NOT carry the mobile number in any form, because the constitution forbids
  personal data in a log (decided 2026-10-11, Clarifications).
- **FR-043**: System MUST send a notice by SMS to the account's registered
  mobile number when the account's password changes and when every session of the
  account is ended at once ("sign out of every device"), so that the account's
  owner learns out of band of a change they did not make. The notice MUST follow
  the language, numeral, and no-emoji rules FR-026 states for the body of every
  SMS, and it MUST be dispatched best-effort: a send that fails MUST NOT undo the
  change or the ending of the sessions, MUST NOT block either, and is recorded as
  the dispatch failure FR-037 names (decided 2026-10-11, Clarifications). No
  notice is sent on an ordinary sign-in or an ordinary sign-out, so the channel
  stays bound to those two security-relevant events alone. One action produces
  one notice: a password change ends every session of the account by FR-013, and
  that consequence is part of the change rather than a second sign-out of every
  device, so the change sends a single notice that reports it and the sessions it
  ended; the notice for a sign-out of every device is sent when the merchant
  performs that action, not when a password change ends the same sessions
  (decided 2026-10-24, Clarifications). No notice is sent when
  the operator's provisioning action sets the administrator account's initial
  password: that action sets an account's first password rather than changing one
  it already holds, and the operator who supplies it is the party the notice
  would inform, so the notice has no owner to inform; the provisioning stays
  recorded as the structured security event FR-037 names, so the privileged
  creation is not silent (decided 2026-10-11, Clarifications). The change made
  at the administrator's forced first sign-in changes a password the account
  already holds, so the notice is sent for it as well, exactly as it is for the
  account's own change action (decided 2026-10-22, Clarifications).

**Recovering a password**

- **FR-014**: System MUST let a merchant who has forgotten the password reset it
  by entering a one-time code sent by SMS to the registered mobile number and
  then setting a new password. The one-time code MUST stop being usable the
  moment it is entered correctly: the pending request MUST move to a verified
  state that carries the new-password step alone, lasts no longer than the
  pending request's own lifetime — the value Constitution Mandated Values
  already fixes — and ends when the new password is set, or when a new request
  replaces the pending request (FR-034), so the same code cannot authorise a
  second reset and a replaced request leaves no verified state behind. A person
  who reloads, or closes and reopens,
  the page while that verified state lives MUST be shown the new-password step
  again rather than the code step, and once the password is set the page MUST
  return to its first step as FR-041 provides (decided 2026-10-22,
  Clarifications). A reset requested for a blocked account completes
  — a new password is set and every existing session ends — but the account's
  block stands, so no access is granted and the outcome is stated only after
  ownership of the number is proven. The confirmation that follows MUST state
  both outcomes — that the password was changed and that the account is blocked
  — and MUST say plainly that sign-in stays refused until an administrator
  returns the account to active, so the page never sends the merchant to a
  sign-in that cannot succeed; before the code is verified the flow's uniformity
  (FR-015) still binds, so nothing about the block is disclosed earlier (decided
  2026-10-24, Clarifications). A reset requested for a mobile number whose
  account holds the administrator role MUST be refused after the code is
  verified: no password is set, no session is created, and the platform states
  explicitly that the credential cannot be reset on this surface, because an
  administrator's credential belongs to the administrator's own surface
  (decided 2026-10-11, Clarifications). Where the reset cannot proceed — because
  the number has no account, or because its account holds the administrator
  role — the pending request MUST end once the outcome is stated, so no verified
  state outlives the step it would have carried (decided 2026-10-22,
  Clarifications). Setting the new password MUST render its
  confirmation in place on the password-recovery page — the step is replaced by a
  confirmation that the password was changed and, for an account that is not
  blocked, that the merchant must sign in with it, while a blocked account's
  confirmation states the block as the preceding paragraph requires — with no
  navigation, no new route, and no new page (decided
  2026-10-11, Clarifications; revised 2026-10-24, Clarifications).
- **FR-015**: System MUST NOT reveal, in any password-recovery response, whether
  the submitted mobile number has an account. The one-time code MUST be sent to
  the submitted number whether or not it has an account, so that the request's
  response, the following step, and the sending of the code are indistinguishable;
  the rule is bounded to those steps, because entering the correct code proves
  ownership of the number, and the platform MUST then state explicitly that no
  account exists for that number rather than continue as though a reset had
  occurred. The dispatch stays bounded by the rate limit on authentication
  operations, and a dispatch that fails outright is handled by the same explicit,
  retryable failure state FR-034 states for a code that cannot be sent (decided
  2026-10-11, Clarifications). The indistinguishability MUST also cover how long
  each of those steps takes: the request's response, the following step, and the
  sending of the code MUST do the same work whether or not the number has an
  account, so no step's duration signals it (decided 2026-10-11,
  Clarifications).

**Account status and sessions**

- **FR-016**: The account MUST carry a status that is exactly one of active or
  blocked. The status is a closed two-value set, and this slice performs neither
  transition: setting an account to blocked and returning it to active are both
  administrator operations owned by the slice that ships the administrator's
  Users page (R13). This slice delivers the field and the effects of the blocked
  value — the tests reach the blocked state directly — and it defines no reverse
  transition and ships no action that sets the status (decided 2026-10-11,
  Clarifications).
- **FR-017**: A blocked account MUST keep all of its data and its public
  contributions, and MUST NOT be able to sign in. The refusal MUST be the same
  uniform refusal FR-008 requires — the same text, the same status, and the same
  response path as every other failed sign-in — so that no signal, at any step,
  tells the person the account is blocked or that it exists. A status refusal
  MUST perform the same verification work as any other sign-in attempt and be
  refused afterwards on
  the status ground, so its response's duration signals nothing, exactly as
  FR-008 and SC-004 require (decided 2026-10-22, Clarifications). That refusal
  MUST NOT increment the account's consecutive-failed-attempt count, because the
  verification the attempt performed was not against an active account
  (FR-009; decided 2026-10-11 and 2026-10-22, Clarifications).
- **FR-018**: A merchant MUST NOT be able to delete their own account, and no
  such control MUST be offered. The account's personal data lives as long as the
  account is registered and is removed only by an administrator action, since
  the register states no retention period and the retention job's scope over
  account rows is not fixed by any source; this slice therefore fixes no
  retention period and asserts no trigger for one, and the wording of the
  Privacy Policy page belongs to the slice that ships it (decided 2026-10-11,
  Clarifications; revised 2026-10-21, Clarifications).
- **FR-019**: When an account is blocked, every existing session of it MUST stop
  granting access. This slice delivers the status and everything that follows
  from it, not either act that changes it: no operator action sets or clears the
  status here, so neither blocking nor returning an account to active is
  performed by this slice, and both arrive with the slice that ships the
  administrator's Users page, where the audit record every administrator
  operation requires also exists (decided 2026-10-11, Clarifications).

**The shared page frame**

- **FR-020**: System MUST present the product's shared page frame — a header, a
  sidebar, the product's icon set, and the product's typography — on the public
  pages and in the merchant's area only. The sidebar sits at the inline-start
  edge, which the RTL direction resolves to the right edge of the page, and
  carries the platform's navigation item list and the sidebar-collapse control.
  The header carries the platform's logo/home control at its inline-start edge
  and, at its inline-end edge, the notifications control, the theme switch, and
  the account control; it carries no page-navigation link. The notifications
  control carries the unread count, and no other surface carries it; the count
  itself and the Notifications page arrive with R9 (ADR-102). The logo is
  delivered as a wordmark set in the product's typography: it adds no image
  asset and no new design value, and the form it takes is recorded in the plan
  (decided 2026-10-11; revised 2026-10-21, Clarifications; revised
  2026-10-21, ADR-102).
  The technology register still leaves the icon set an open gap owned by this
  slice, although the set itself is already chosen and recorded (ADR-098), so
  every later slice reads that record rather than choosing a set of its own;
  this slice therefore records the chosen set in the technology register, records
  it in the plan's Constitution Mandated Values, and executes the
  register-gap decision record, the licence-obligation record, the
  vulnerability scan, and the vendoring the register requires (decided
  2026-10-11, Clarifications; revised 2026-10-21, Clarifications, ADR-098).
- **FR-021**: The frame MUST NOT appear on the sign-up, sign-in,
  password-recovery, error, and static pages; those pages MUST be shown bare,
  with no header, no sidebar, and no footer (decided 2026-10-11,
  Clarifications).
- **FR-036**: The three bare pages this slice ships — sign-up, sign-in, and
  password recovery — MUST link to one another: sign-in MUST offer the way to
  sign-up and to password recovery, sign-up MUST offer the way to sign-in, and
  password recovery MUST offer the way back to sign-in. The links live on the
  bare pages themselves, because the frame that would otherwise carry them is
  absent from those pages and arrives with a later slice, and every journey this
  slice ships therefore has a defined entry point (decided 2026-10-11,
  Clarifications). The route of each of the three pages is fixed by the frame's
  decision record (FR-024), so each of those links points at a definite target
  (decided 2026-10-11, Clarifications).
- **FR-038**: The one-time-code entry — at sign-up and in password recovery —
  MUST be a step of the same page that begins the flow, not a page and not a
  route of its own. The code step adds no page and no route, so this slice ships
  exactly the three bare pages it names — sign-up, sign-in, and password
  recovery — and the Product Register's twenty-seven pages are not amended
  (decided 2026-10-11, Clarifications). The code step MUST show, for reading and
  without editing them, the fields the flow collected: at sign-up, the full name,
  the mobile number, the city, and the optional shop name; in password recovery,
  the mobile number alone, because the recovery form collects nothing else and
  showing an account's name, city, or shop name before the code is verified would
  reveal that the number has an account, breaching FR-015 and SC-004. The mobile
  number is shown in its canonical form with Latin numerals, so that the person
  sees which number the code was sent to. The password MUST NOT be shown back in
  any form: it is neither re-displayed, nor echoed, nor rendered masked, so a
  submitted password never returns to the browser in any form, and that rule is
  the same at sign-up and in password recovery (decided 2026-10-22,
  Clarifications). The prohibition governs the page: the pending request still
  carries the submitted password, so that the account can be created when the
  correct code is entered, and it carries it only in the same irreversibly
  protected form a stored password has, computed at submission, so no plaintext
  password is stored, logged, or cached while the request lives; a request that
  is replaced or that ends discards the value with it (decided 2026-10-22,
  Clarifications). The step MUST carry, beside the code field and its submit
  control, a control that requests a new one-time code subject to FR-034's limit
  on re-requesting, and a control that returns to the page's first step; the
  first step then shows the values the person already typed for editing again,
  except the password, which the page never retains or shows, and submitting it starts
  a new pending request for the new number on FR-034's terms (decided
  2026-10-22, Clarifications). A person who
  reloads that page, or who closes it and comes back, MUST be shown the code
  step again while the pending request is still live and its code has not yet
  been verified, so the code already sent to them stays usable rather than being
  spent by an accidental refresh; once the code has been verified in the
  password-recovery flow, the same reload MUST show the new-password step
  instead, as FR-014 provides. The resumption adds no page and no
  route, and a fresh submission still replaces the pending request on FR-034's
  terms (decided 2026-10-11, Clarifications; revised 2026-10-22,
  Clarifications).
- **FR-041**: The three bare pages this slice ships — sign-up, sign-in, and
  password recovery — MUST render identically for a signed-in person and for a
  guest: no redirect is introduced and no signed-in-specific surface is shown on
  them, because the pages are public and carry no frame, and offering a sign-out
  control there would contradict the rule that the sign-out control belongs to
  the frame and not to a bare page — its only control is the account menu's
  third item, which the frame carries and which a bare page does not. The rule
  governs what each page shows when it is opened: the in-place
  confirmation FR-004, FR-007, and FR-014 require is the outcome of an action
  taken on the page and is not a signed-in-specific surface, so a person who
  opens one of the three pages sees it exactly as a guest does whatever their
  session state, and once the action is complete — the pending request consumed
  at sign-up, the session created at sign-in, the password set in recovery — a
  reload or a fresh opening returns the page to its first step, with no
  confirmation re-shown and no redirect (decided 2026-10-11, Clarifications).
- **FR-022**: The frame's sidebar MUST show in full on a wide screen and narrow
  to an icon-only rail when collapsed; on a narrow screen it MUST become a drawer
  that the same control opens and closes. The collapse control sits in the
  sidebar itself, beside the navigation item list (decided 2026-10-21,
  Clarifications). The rail's width is a fixed design value this slice
  records, and the shell's desktop collapsed state consumes it (decided
  2026-10-21, Clarifications).
- **FR-039**: The frame MUST carry the sidebar's navigation item list as part of
  its composition, so the frame is composed once and a later slice composes it
  rather than extending it. The list is fixed here as one item per registered
  destination a guest or a signed-in merchant can reach on the public site and in
  the merchant's area — Home, Parts, Catalog, Upload Catalog, My Files, Cart,
  Notifications, Messages, and Profile — and it carries no item for the three
  bare pages this slice ships (sign-up, sign-in, password recovery) or for the
  four bare-layout static pages (Contact, Privacy Policy, Terms of Use, FAQ),
  because the register states a static page is never a sidebar item. The list is
  the frame's single composition and MUST be shown identically to a guest and to
  a signed-in merchant: all nine items are present in both states, and the frame
  MUST NOT add, remove, or disable an item by role, exactly as its logo, its
  typography, and its icon set are not varied by role (decided 2026-10-11,
  Clarifications; revised 2026-10-25, ADR-126).
  Each item MUST name a registered
  destination, and the route each item points at is fixed by this slice's
  decision record (FR-024), so an
  item whose destination page ships in a later slice points at the route fixed
  here and that slice ships its page at that route rather than choosing one of
  its own (decided 2026-10-11, Clarifications); this slice MUST verify the item
  list structurally, alongside the sidebar's collapse control, because no page
  here renders the frame; the logo, the notifications control, and the theme
  switch are verified in the header, where FR-020 places them (decided
  2026-10-11; revised 2026-10-21, Clarifications; revised 2026-10-21,
  ADR-102).
- **FR-023**: The frame's header MUST carry the platform's logo/home control at
  its inline-start edge and, at its inline-end edge, the notifications control,
  the theme switch, and the account control for a signed-in merchant, and MUST
  carry no page-navigation link and no sidebar-collapse control. The account
  control MUST carry the accessible name
  «حسابي» and MUST show the icon alone, with no merchant name in the header;
  the merchant's name is available inside the account menu's «حسابي» item.
  The account control MUST open a menu carrying
  «حسابي»، «إعدادات»، and «تسجيل الخروج»; the sign-out item MUST ask for a
  yes-or-no confirmation before the existing sign-out behaviour runs (decided
  2026-10-21, Clarifications; ADR-099). For a guest the header MUST show a
  sign-in action in place of the account control and the notifications control;
  the guest has no account menu, and the theme switch remains available because
  it sits in the header, while the sidebar-collapse control remains available
  in the sidebar. The constitution's Product
  Fact Clarifications bullet and its mirror in `Core-Project.txt` state this
  rule as amended by ADR-099 and ADR-102 on 2026-10-21, so no binding source
  contradicts the header. This slice delivers the header's controls and the menu as part of
  the frame and verifies them structurally; the data behind the menu's
  destinations belongs to the slice that owns each destination, while the
  menu's own open and confirm behaviour is exercised at runtime by the slice
  that ships the first page carrying the frame. The sign-in action MUST point
  at the sign-in page at the route the frame's decision record fixes (FR-024),
  so the frame carries no link without a definite target (decided 2026-10-11;
  revised 2026-10-21, Clarifications; revised 2026-10-21, ADR-102).
- **FR-047**: The account control MUST open a menu carrying exactly three
  items — «حسابي»، «إعدادات»، and «تسجيل الخروج» — and MUST close without action
  when the person dismisses it: by pressing Escape, by activating something
  outside it, or by moving the focus out of it. The focus MUST return to the
  account control in each of those cases. «حسابي» MUST open the Profile page at
  its top, where the account's full name, city, and status — active or blocked —
  are shown, and where no other account field is shown; the mobile number and
  the editable account details belong to the settings section. «إعدادات» MUST open the
  settings section of that same page, where the account details are edited, the
  password is changed, and the action that ends every session of the account at
  once is offered; the two items share the one Profile route the frame's
  decision record fixes, and the settings section is identified by an anchor, so
  no page and no entity is added. «تسجيل الخروج»
  MUST ask for a yes-or-no confirmation and MUST end the session only when the
  person confirms, leaving it untouched when they cancel. The menu is part of
  the frame's composition and is verified structurally in this slice, because
  no page here renders the frame; its runtime behaviour is verified by the
  slice that ships the first page carrying the frame, and the data behind
  «حسابي» and «إعدادات» belongs to the Profile slice (R7), which also delivers
  the settings section's own actions. The menu MUST be
  reachable by keyboard, and each item MUST carry an accessible name and a role
  (decided 2026-10-21, Clarifications; ADR-099, ADR-100).
- **FR-048**: When a guest activates a sidebar item that names a merchant-area
  destination — My Files, Cart, Notifications, Messages, or Profile — the
  platform MUST take the guest to the sign-in page, because the register gives a
  guest no cart, no upload, no message, and no merchant area; the item itself
  stays present and enabled, because the frame's item list is not varied by role
  (FR-039). The three items that name a public destination — Home, Parts, and
  Catalog — open their own pages for a guest exactly as they do for a merchant.
  The sign-in page is a bare page and the frame is absent from it, and this rule
  adds no page, no route, and no stored state; whether the merchant returns to
  the item they wanted after signing in is a decision of the slice that ships
  the merchant area's pages. The cart control the Parts table shows follows the
  same rule (decided 2026-10-21, Clarifications; ADR-100). Because no page this
  slice ships renders the frame, this rule is verified structurally here and
  its runtime behaviour is verified by the slice that ships the first page
  carrying the frame (decided 2026-10-21, Clarifications).
- **FR-049**: When a request issued from a page that carries the frame is refused
  because the session has ended — by the inactivity timeout, by the absolute
  maximum lifetime, by an explicit sign-out elsewhere, by a platform revocation
  (FR-012), by a sign-out of every device (FR-011), or by a password change or
  reset made elsewhere (FR-013) — or because the
  account is blocked, the platform MUST show an explicit state inside the frame,
  stating that the session has ended and offering the way to sign in again; when
  the account is blocked, that state MUST say so plainly, because the person
  held a valid session and is no longer an unknown caller. Every path that ends
  a session leads to that one state, so no session-ending path shows an
  unrelated error, and the frame MUST NOT keep sending requests for a
  session that no longer exists. The same state is shown after a merchant signs
  out deliberately from the account menu, so that both ways a session ends lead
  to one outcome. This state is shown only to a person who held a
  valid session, so it is outside the enumeration comparison SC-004 bounds, and
  it introduces no page, no route, and no entity. Because no page this slice
  ships renders the frame, this state is verified structurally here and its
  runtime behaviour is verified by the slice that ships the first page carrying
  the frame (decided 2026-10-21,
  Clarifications; ADR-100; revised 2026-10-22, Clarifications).
- **FR-050**: The administrator application keeps its own shell, and its header
  MUST carry the platform's logo at the inline-start edge and an account control
  whose menu offers «تسجيل الخروج» only, because the administrator application
  has no Profile page and no merchant settings page, so the merchant menu's
  destinations do not exist there. The sign-out control remains available while
  the account is restricted by the forced-password-change requirement, as FR-028
  provides. This slice binds that composition for the
  slice that ships the administrator application (R13) and delivers nothing of it
  here, exactly as it binds the shared frame without rendering it (decided
  2026-10-21, Clarifications; ADR-100; revised 2026-10-22, Clarifications).
- **FR-024**: The frame MUST carry the product's means of reaching the static
  pages (Contact, Privacy Policy, Terms of Use, FAQ). The surface that carries
  them is a footer band inside the frame, below the page's content, shown on
  every page that carries the frame and absent from every page that does not,
  because the footer is part of the frame's composition exactly as the header and
  the sidebar are (decided 2026-10-11, Clarifications). This slice chooses the
  surface that carries them, builds it inside the frame, and records the choice
  as a decision record; that decision record also fixes the route of every
  destination the frame links to — the nine sidebar destinations, the four
  static-page routes, the destination of the header's guest sign-in action, the
  Home destination of the header's logo/home control (already one of the nine),
  and the account menu's destinations, with «حسابي» pointing at the Profile
  route and «إعدادات» at the Profile page's settings section (no route is added
  for «تسجيل الخروج») — and the routes of the three bare pages this slice ships
  (sign-up, sign-in, and password recovery), so every link this slice builds has
  a definite target and the slice that ships the static pages ships them at the
  four routes fixed here rather than choosing routes of its own (decided
  2026-10-11; revised 2026-10-21, Clarifications; revised 2026-10-25,
  ADR-126). The reachability requirement
  itself — that an in-scope static page no in-scope page links to is a defect —
  is discharged by the slice that ships the first page carrying the frame (R4),
  because this slice ships no page that carries the frame and the surface it
  chooses therefore renders on no page of its own; this slice builds the surface,
  fixes the four routes, and binds the rule, and its plan records that deferral
  in its Complexity Tracking table with an owner and a review date (decided
  2026-10-21, Clarifications).
- **FR-025**: The frame MUST honour two appearances — dark and light — with a
  control that switches between them, and the chosen appearance MUST hold as a
  person moves between pages. The default appearance on a first visit is not
  fixed by this specification; it is a fixed design value, recorded by
  ADR-098. The chosen appearance MUST apply to
  every page, including the bare pages that carry no frame, and MUST be applied
  before the page is painted so the other appearance never flashes; the switch
  itself remains a frame control, sits in the header immediately beside the
  notifications control, and is not offered on a
  bare page. The choice
  MUST be remembered in the browser the person is using (per device) and MUST
  NOT be stored on the account, so no entity gains an appearance field. The
  appearance's surfaces, backgrounds, and colours are fixed design values, not
  a product setting: neither a merchant nor the administrator chooses a
  background or a colour, and no such preference is stored on the account or in
  the platform's settings (decided 2026-10-21, Clarifications; ADR-098;
  revised 2026-10-21, ADR-102).
- **FR-026**: Every page MUST be presented in Arabic and right-to-left, with
  Latin numerals, and every icon MUST come from the product's icon set and MUST
  NOT be an emoji. The body of every message the platform sends by SMS MUST
  follow the same language, numeral, and no-emoji rules, because it is
  user-facing text; it carries no icon, so the icon rule does not apply to it
  (decided 2026-10-11, Clarifications).

**The administrator account**

- **FR-027**: System MUST NOT let anyone become an administrator through the
  public sign-up flow, and MUST NOT let an administrator account sign in on the
  merchant sign-in surface: such an attempt MUST receive the same uniform
  refusal FR-008 requires — the same text, the same status, and the same
  response path as every other failed sign-in — so that nothing tells the person
  the account exists or that it is an administrator account. The administrator
  signs in only on the administrator's own surface, which arrives with a later
  slice (decided 2026-10-11, Clarifications). The same boundary governs password
  recovery: the merchant recovery flow MUST NOT set a new password on an
  administrator account, and MUST refuse after the code is verified as FR-014
  states (decided 2026-10-11, Clarifications).
- **FR-028**: System MUST create the administrator account only by an
  operator-run provisioning action, and MUST require the administrator to change
  the password at first sign-in: the first sign-in is accepted, and the account
  is then restricted so that no product action other than the password change is
  permitted until the change is made. The restriction withholds every action that
  needs the account's ordinary permissions, but it MUST NOT withhold the password
  change itself or ending the session: sign-out, the session timeout, and a
  platform revocation all remain available, so the administrator application's
  sign-out control (FR-050) stands for a restricted account (decided 2026-10-22,
  Clarifications). That requirement is cleared by the change
  performed while the account is restricted — the change made at that first
  sign-in — and it is cleared by no other path: the restriction lifts at that
  point and the account is thereafter unrestricted, because an administrator's
  credential is reachable only on the administrator's own surface, the recovery
  flow refusing it (FR-014) and the merchant sign-in surface refusing it
  (FR-027) (decided 2026-10-11, Clarifications). The value that first change
  sets MUST differ from the initial password the operator supplied: a
  submission that repeats it MUST be refused and MUST NOT clear the
  requirement, because a forced change that sets the same value would leave the
  requirement unsatisfied (decided 2026-10-22, Clarifications). The forced change
  MUST also require the current password — the initial password the operator
  supplied — exactly as FR-013 requires of the account's own change action: a
  submission without the current password, or with a wrong one, MUST be refused,
  MUST clear nothing, and MUST leave the account restricted, and a failed check is
  a failed password verification under FR-009; the fresh sign-in is not treated as
  proof for this purpose, so a restricted session that is taken over cannot set a
  new password without the current password (decided 2026-10-22,
  Clarifications). The provisioning action MUST create the
  account directly: it sets the account's full name, Libyan mobile number, city,
  and an initial password the operator supplies — which MUST satisfy the same
  password policy FR-035 requires, because a password is being set — and it sends
  no one-time code and performs no verification step, because
  the mobile-number verification rule governs the public sign-up flow alone
  (decided 2026-10-11, Clarifications). The values it sets MUST satisfy the same
  account field rules sign-up applies — the full name present and within its
  bounds (FR-001), the mobile number a Libyan mobile number on +218 decided
  against the fixed prefix dataset (FR-003), and the city drawn from the fixed
  list (FR-005) — because those are account rules rather than rules of the public
  path; only the one-time-code verification (FR-004) is bounded to public
  sign-up, and a value that fails any rule MUST be refused, with the refusal
  reported to the operator and no account created (decided 2026-10-11,
  Clarifications). The action is repeatable: each run
  creates a distinct administrator account, and the platform MUST introduce no
  cap on how many administrator accounts exist, because the register states
  none. Uniqueness is enforced on the normalised mobile number exactly as FR-031
  requires for any account, so a run for a number that already has an account
  MUST create nothing and MUST report the conflict to the operator, who is
  running the action out of band (decided 2026-10-11, Clarifications). This
  slice delivers the provisioning action, and it delivers the administrator's
  first sign-in as behaviour with no page, exactly as FR-013 delivers the
  account's own change-password action: the first sign-in is accepted, the
  account is restricted so that nothing but the password change is permitted
  among the product actions that need its ordinary permissions, while ending the
  session remains available, and the change made at that first sign-in clears the requirement and lifts
  the restriction, so the rule is exercised here rather than asserted of a path
  that does not exist; only the administrator's sign-in surface — the page — is
  delivered by a later slice, and this slice creates no page for it (decided
  2026-10-22, Clarifications). The provisioning action is out of band:
  it is run by the platform's operator outside the product's role model and
  outside the administrator application, so it is not an administrator operation
  and writes no audit-log row — the audit log records the operations an
  administrator performs through the administrator application, which arrives
  with a later slice — and this slice records the provisioning through the
  structured security record FR-037 names (decided 2026-10-11, Clarifications).

**Resisting automated abuse**

- **FR-029**: System MUST protect the sign-up form against automated submission
  by a hidden field a person leaves empty, a minimum time between the form being
  shown and being submitted, and a limit on how often one client may submit. The
  client is identified by its network origin — the request's origin — and
  the limit is applied per operation (decided 2026-10-11, Clarifications; revised
  2026-10-21, Clarifications). That
  budget is keyed both on the network origin and on the normalized mobile number
  the form submits, so one shared address does not spend another person's budget
  and repeated submissions for one number are bounded on their own (decided
  2026-10-11, Clarifications). A
  submission refused by the hidden field MUST be refused silently: the platform
  returns the same response a successful submission receives, so nothing in the
  response tells the sender it was detected, and no account is created. That
  refusal MUST do nothing further: it MUST NOT start a pending request, MUST
  NOT dispatch a one-time code to the submitted number, and MUST NOT reach the
  code step, so the form cannot be turned into a way to send SMS to numbers the
  submitter does not control; the silence is a guarantee about the response
  alone, and the flow stops at that response, so the absent code is a
  consequence of the refusal rather than a signal of it. The timing rule FR-006
  states for the account-existence case is not extended to it. A submission refused by the
  hidden field or by the minimum time-to-submit MUST still consume the
  account-creation budget FR-033 keys, because that budget is applied to every
  submission that reaches the sign-up form; the honeypot therefore cannot be
  turned into an unbounded entry point, while the refusals themselves are
  unchanged and the budget's own refusal stays the distinct, explicit limit
  refusal (decided 2026-10-11, Clarifications). A submission refused by
  the minimum time-to-submit MUST receive an explicit, retryable refusal, because
  a real person may legitimately submit quickly; no account is created in either
  case. A submission refused by the rate limit MUST receive a distinct, explicit
  refusal stating that the limit was exceeded and that the person may retry
  later, which reveals nothing about whether an account exists, because the limit
  protects the client rather than the account (decided 2026-10-11,
  Clarifications).
- **FR-030**: System MUST NOT use CAPTCHA anywhere in the platform.
- **FR-033**: System MUST apply a rate limit to every authentication operation —
  account creation, sign-in, and password recovery — so that one client cannot
  submit any of them without bound. Each of the three operations MUST carry its
  own limit, so exhausting one operation's budget MUST NOT block another and a
  client cannot deny a legitimate merchant sign-in by exhausting the sign-up
  budget (decided 2026-10-11, Clarifications). The sign-up form's own limit
  (FR-029) is the account-creation operation's limit: one per-origin budget
  governs account creation, and the form carries no second, overlapping budget:
  that budget counts every submission that reaches the form, including one the
  form's own hidden field or minimum time-to-submit refuses, so the honeypot is
  not an unbounded entry point (decided 2026-10-11, Clarifications). The client is identified the same
  way FR-029 fixes — by the request's network origin — and each budget is
  additionally keyed on the normalized mobile number the request submits, so each
  origin carries its own budget for each of the three operations and each
  submitted number carries one as well: exhausting either key refuses further
  requests on that key alone, while every other origin and every other number
  stays unaffected, and the refusal is the same distinct, explicit limit refusal
  whichever key produced it (decided 2026-10-11, Clarifications). A refusal produced by one of these limits MUST be distinct and
  explicit — it states that the limit was exceeded and that the person may retry
  later — and it is not the uniform refusal FR-008 requires, because the limit
  protects the client rather than the account and reveals nothing about whether
  an account exists (decided 2026-10-11, Clarifications).
- **FR-034**: A one-time code — sent at sign-up or for password recovery — MUST
  expire after a period, MUST be re-requestable subject to a limit on how often a
  new code may be requested, and MUST be refused after a bounded number of
  incorrect entries. A request refused by the limit on requesting a new code MUST
  receive a distinct, explicit refusal stating that the limit was exceeded and
  that the person may retry later; that refusal is excluded from SC-004's
  enumeration comparison for the same reason the per-operation rate-limit refusal
  is, because it depends on the pending request's own history rather than on
  whether the number has an account, and the pending request exists for a number
  with no account exactly as it does for one. The bound on requesting a new code
  is its own and sits above FR-033's per-operation budgets: requesting a new code
  neither consumes nor is bounded by the account-creation or the recovery budget,
  so a merchant who mistypes a code and asks for a new one cannot spend the
  operation's budget (decided 2026-10-11, Clarifications). Exactly one code is
  valid for a verification at any moment: a request for a new code MUST take
  effect only once the messaging channel has accepted the new message, and at
  that moment it MUST invalidate the previous code at once; a request the channel
  refuses at acceptance MUST leave the previous code as the one valid code, the pending request
  live, and the limit on re-requesting untouched, so a moment with no valid code
  never arises and a channel outage does not cost the person the code they
  already hold (decided 2026-10-22, Clarifications). The accepted dispatch MUST
  also start the pending request's lifetime afresh: the request and the
  replacement code get the full period Constitution Mandated Values fixes, so a
  new code is never delivered with only the remainder of the request it
  replaced, and the limit on requesting a new code is what bounds repeated
  extension; a dispatch the channel refuses changes neither the code nor that
  expiry (decided 2026-10-24, Clarifications). The bound on
  incorrect entries MUST be counted over the whole verification, not per code, so
  that a new code does not reset it, and it MUST count only a wrong value entered
  for the code that is currently valid: an expired code, and a code that a
  replacement has superseded, MUST be refused as expired or superseded and MUST
  NOT increment the bound, because neither is a wrong guess of the live code, so
  a stale code cannot lock a person out and the count measures exactly the
  guesses the bound exists to stop (decided 2026-10-22, Clarifications). Exactly
  one pending request MUST also be
  live per mobile number: a new sign-up or recovery request for a number that
  already has a live pending request MUST replace the previous one and
  invalidate its code at once (decided 2026-10-11, Clarifications). The
  replacement reaches every state of the pending request, including the recovery
  flow's verified state: a new request for a number whose pending request is in
  that state MUST end the verified state at once and withdraw its authority to
  set a password, so only the new code step is live and two authorities never
  coexist for one number (decided 2026-10-22, Clarifications). When the messaging
  channel refuses a code at acceptance — a failure at the channel, or a number the
  channel refuses because it cannot deliver to it — the platform MUST show an
  explicit failure state that allows a retry, MUST keep the pending request valid
  until its own expiry, MUST leave the code already delivered valid — the
  replacement takes effect only once the channel accepts the new message — and
  MUST NOT count the failed send against the limit on requesting a new code. A
  message the channel accepts is a successful send from the platform's side even
  if it is never delivered: a later delivery failure is outside the platform's
  observation, MUST NOT produce that failure state, and does not by itself
  invalidate the code, so a person who does not receive an accepted message can
  request a new code subject to the limit on re-requesting (decided 2026-10-22,
  Clarifications). One rule governs both code paths — the code sent at sign-up
  and the code sent for password recovery — so the pending request, whether it is
  a sign-up or a password reset, expires on the same terms and behaves identically
  when a send is refused at acceptance (decided 2026-10-11, Clarifications).
  The send is attempted inside the request that asks for the code, and the code
  step is reached only once the messaging channel has accepted the message: a
  refusal at acceptance therefore produces that explicit, retryable failure on the
  submission itself rather than on the code step, so no failure reaches a person
  who has already moved past the step, and the failure state stays the one this
  requirement already describes rather than one the code step would have to gain
  (decided 2026-10-11, Clarifications).
  When the bound on incorrect entries is reached the pending request MUST end,
  and the person MUST start a fresh request — a sign-up or a recovery — which
  begins a new verification and counts incorrect entries from zero; the platform
  MUST NOT leave a live request that can never be completed, and the fresh
  request replaces the ended one on the terms the preceding sentence states
  (decided 2026-10-11, Clarifications). When the correct code is entered but the
  account cannot be created at that moment — a transient failure — the pending
  request MUST stay valid until its own expiry and the correct code MUST stay
  usable, because at sign-up a code is consumed only once the account is
  actually created;
  the person MUST see an explicit, retryable failure state, and that failure MUST
  NOT count against the bound on incorrect entries (it was not an incorrect
   entry) nor against the limit on requesting a new code. This rule is distinct
   from the send-failure rule above, which governs a code the channel refused at
   acceptance; a message the channel accepted but did not deliver is not that
   failure, as the rule above states (decided 2026-10-11, Clarifications). In the
   password-recovery flow the
  correct code MUST end its own validity at once, and the pending request MUST
  end when the new password is set or when a new request replaces it, so a
  verified code cannot authorise a second reset (decided 2026-10-22,
  Clarifications). The same rule governs the sign-up
  path's own outcome: when the correct code is entered for a number that already
  has an account, the pending request MUST end once the outcome is stated, so no
  live request survives an outcome the platform has already reported
  (decided 2026-10-22, Clarifications).
- **FR-051**: When more than one refusal applies to a submission, System MUST
  decide them in one fixed order, applied identically on every page this slice
  ships: (1) the operation's rate limit, refused with the distinct, explicit
  limit refusal (FR-033); (2) at sign-up only, the form's hidden field, refused
  with the silent response whose flow stops at it (FR-029); (3) at sign-up only,
  the minimum time-to-submit, refused with the explicit, retryable refusal
  (FR-029); (4) the value rules — the mobile-number format (FR-042, FR-003), the
  full-name and shop-name bounds (FR-001), the city-list rule (FR-005), and the
  password policy (FR-035); and (5) the account-existence comparison, refused
  with the uniform response (FR-006, FR-008, FR-015). A submission refused at a
  step MUST be decided by that step alone: no later check runs and no earlier
  refusal is replaced. Within step (4) every failing value rule MAY carry its
  own message and several MAY be reported together, but no account-existence
  comparison runs until every value rule has passed. The order is observable
  and MUST be asserted, because a client's refusal depends on it; it narrows no
  response's uniformity: a value-rule refusal is the same whether or not the
  number has an account, so SC-004 still compares it, while the limit, format,
  and re-request refusals stay outside that comparison exactly as their own
  requirements provide. The order introduces no
  refusal beyond those this specification already names (decided 2026-10-22,
  Clarifications).

**Securing the browser surface**

- **FR-044**: Every state-changing request issued from a browser session MUST be
  protected against request forgery, so that a request the person did not make is
  refused. The protection MUST cover every action this slice ships that changes
  state — the sign-up submission, the sign-in submission, the password-recovery
  request, the entry of a one-time code, and the account's own change-password
  action — and the constitution requires its configuration to be covered by an
  automated test, because this slice is the first browser-facing feature it names
  (decided 2026-10-11, Clarifications).
- **FR-045**: Every value a person supplies that the platform holds and shows —
  the full name, the shop name, and any further value a later slice adds — MUST be
  encoded for its output context before it is rendered, so that a value typed as
  markup or script is shown as the text it is and never executed. The rule MUST
  NOT be treated as satisfied by a default the platform provides rather than by
  this requirement, without a test that fails
  when the encoding is removed (decided 2026-10-11, Clarifications; revised
  2026-10-21, Clarifications).
- **FR-046**: Every response the browser surface returns MUST carry the security
  headers the constitution's Identity, Authentication, and Session Policy names: a
  content-security policy whose script sources carry no wildcard, a
  transport-security declaration that binds future requests to the protected
  transport, a declaration that the browser MUST NOT guess a response's content
  type, and a restriction naming which frames may embed the page. Their presence
  MUST be asserted by an automated test, because this slice is the first
  browser-facing feature the policy names (decided 2026-10-11, Clarifications).

### Test Coverage Request *(mandatory)*

- **Unit tests (business rules)**: Requested — the mobile-number shape and
  normalization, the sign-up field rules (including the full-name and
  shop-name constraints: present, bounded length, no alphabetic-shape rule, and
  no uniqueness rule, so two accounts MAY hold the same shop name (decided
  2026-10-11, Clarifications)),
  the password policy — including the
  common-or-breached check performed against a source the platform holds rather
  than an external service, so the check never depends on a third party's
  availability (decided 2026-10-11, Clarifications), and the rule that a new
  password MAY repeat the one it replaces, because no password history is kept
  (decided 2026-10-11, Clarifications) — bounded by the rule that the
  administrator's forced first change must set a value different from the
  initial password, so a submission that repeats it is refused and clears
  nothing (decided 2026-10-22, Clarifications), and the rule that the form states the
  policy's requirements before the password is typed and that each reason the
  policy refuses a password carries its own message, none of which reveals
  whether the number has an account (decided 2026-10-22, Clarifications) — and
  the rule that a stored password is
  never held in a recoverable form and is verified through the form the
  platform stores it in, so that a weakened or unrecognised storage form is
  detected rather than accepted (decided 2026-10-21, Clarifications), and the
  rule that a pending sign-up request holds the submitted password only in that
  same protected form, so no plaintext password is held while the request lives
  and the value is discarded when the request is replaced or ends (decided
  2026-10-22, Clarifications) — the city-list
  rule — every entry carrying one Arabic name and no Latin alternate name, the
  search matching the Arabic names while ignoring diacritics, and a value
  outside the list not being accepted (decided 2026-10-22, Clarifications) — the
  consecutive
  failed-attempt count and the fifteen-minute lock — including the rule that
  only a failed password verification against an existing, active account
  increments the count, so a rate-limit refusal, a format refusal, the refusal a
  blocked account receives, and the refusal an administrator account receives on
   the merchant sign-in surface do not (decided 2026-10-11, Clarifications)
   — and including the rule that a failed current-password check inside the
   account's own change-password action is a failed password verification against
   an existing, active account and therefore counts toward the lock, while the
   lock refuses sign-in only and neither blocks that action nor ends the session
   it was attempted from (decided 2026-10-11, Clarifications)
   — and including the other side of that rule, that a change made through the
   account's own change-password action which succeeds clears the count exactly as
   a successful sign-in does, while a lock already running is not lifted by it
   (decided 2026-10-11, Clarifications)
   — the per-operation rate
  limits with the client identified by the request's network origin and keyed
  additionally on the normalized mobile number submitted (one origin's exhausted
  budget leaving another origin's budget for the same operation untouched, and
  one number's exhausted budget leaving another number's untouched), the
  account-creation budget counting every submission that reaches the sign-up
  form, including one the form's hidden field or minimum time-to-submit refuses
  (decided 2026-10-11, Clarifications), the replacement of a live pending request
  for a number, the dispatch-conditioned replacement of a one-time code — a
  failed send leaves the previous code valid, the request live, and the
  re-request limit untouched, and the previous code stops being valid at the
  moment the new message is accepted (decided 2026-10-22, Clarifications), and
  that accepted dispatch restarts the pending request's expiry so the new code
  carries a full period while a refused dispatch changes neither (decided
  2026-10-24, Clarifications) — the
  ending of a pending request when the bound on incorrect
  entries is reached, the bound counting only a wrong value for the live code, so
  an expired or superseded code is refused without incrementing it, the verified
  state that carries the recovery flow's
  new-password step — the code stops being usable at verification, the state
  lasts no longer than the pending request's own lifetime, it survives a
  reload, and setting the new password ends it — or a new request replaces the
  pending request, which ends the verified state at once — so the same code
  cannot authorise a second reset (decided 2026-10-22, Clarifications) — the uniform
  responses that
  conceal account existence — including the refusal made while the account is
  locked, the refusal of a blocked account, and the refusal of an administrator
  account on the merchant sign-in surface — each asserted over the response's
  whole observable shape, its text, its status, and its timing, so a response
  that does less work for a number with no account fails the test (decided
  2026-10-11, Clarifications) — the distinct, explicit refusal a
  rate limit produces, the distinct, explicit format refusal a submitted
  value that is not a valid Libyan mobile number receives (FR-042), and the
  distinct, explicit refusal the limit on requesting a new one-time code produces
  (FR-034), all
  deliberately outside that uniformity — the fixed order in which a
  submission's refusals are decided, so an over-budget submission receives the
  limit refusal whatever else is wrong with it and a value failure is decided
  before any account-existence comparison (FR-051) — the
  repeatability of the operator's
  provisioning action and the uniqueness conflict it reports for a number that
  already has an account, the initial password it sets and the password policy
  that governs it, the forced first change's requirement of the current password —
  a submission without it or with a wrong one is refused, clears nothing, and
  leaves the account restricted — the account field rules it applies — the full-name bounds, the
  Libyan-mobile-number rule against the fixed prefix dataset, and the city-list
  rule, each refusing and reporting to the operator — the structured security record emitted for each event
  FR-037 names (including the operator's provisioning action, a successful
  sign-in, and the verification that creates an account), each identifying its
  subject by an internal account identifier and never by the mobile number
  (decided 2026-10-11, Clarifications), and session revocation on
  password change — including the administrator's forced first change, which
  ends the restricted session it was made from — on
  blocking, on the session timeout, and at the session's absolute maximum
  lifetime. A session outlives the page and the browser that created it, so
  closing the browser ends nothing and resets neither clock (decided 2026-10-11,
  Clarifications) — and the rule that only what the merchant themselves do counts
  as activity for the session timeout, so that an action the merchant starts
  resets the inactivity clock while a request the browser sends on its own does
  not, and a background request therefore cannot keep a session alive
  indefinitely (decided 2026-10-22, Clarifications). The security notice FR-043 requires is asserted here too — sent on a
  password change and on a sign-out of every device, Arabic with Latin numerals
  and no emoji, best-effort so a failed send undoes nothing and blocks nothing,
  and sent on no other event, with one action producing one notice — a password
  change that ends every session sends the change's notice alone rather than a
  second one for the sessions it ended (decided 2026-10-24, Clarifications) — in
  particular not when the operator's provisioning
  action sets the administrator's initial password, which sets a first password
  rather than changing one already held, while the administrator's forced first
  change does send it because it changes a password the account already held
  (decided 2026-10-11 and 2026-10-22, Clarifications).
  The state changes the three bare pages render are asserted here as well — the
  in-progress state, the inline failure message, and the in-place confirmation
  are announced to assistive technology, and focus lands on the step now shown
  rather than on a control the previous step carried (decided 2026-10-22,
  Clarifications).
- **Integration tests (module contracts)**: Requested — the account area
  and the authentication surface together: account creation and the
  one-time-code verification, sign-in and sign-out, the recovery flow —
  including the refusal of a reset for a mobile number whose account holds the
  administrator role, which this slice delivers with no administrator surface
  (decided 2026-10-11, Clarifications) — and the
  session store's revocation paths — including the withdrawal that follows an
  account's block, with the blocked state set directly because this slice
  carries no act of blocking, and including the account's own change-password
  action — with the current-password check it requires — which this slice
  delivers as behaviour because the page that offers it arrives later (decided
  2026-10-11, Clarifications), and including the
  concurrent case, where two attempts for one number arrive together and at most
  one account is created (decided 2026-10-11, Clarifications), and including the
  ending of a pending request once the platform has stated an outcome it cannot
  complete — at sign-up for a number that already has an account, and in recovery
  for a number with no account or one holding the administrator role — so no live
  request and no usable code outlive that step (decided 2026-10-22, Clarifications).
  The administrator's first sign-in is exercised here as behaviour with no page —
  the sign-in is accepted, the account is restricted to the password change, the
  change made at that first sign-in clears the requirement and lifts the
  restriction, ends every session of the account, and sends the security notice,
  and ending the session remains available to the restricted
  account — together with the rule that a status or role refusal performs the
  same verification work as any other attempt and is refused afterwards on that
  ground, so the enumeration test compares a blocked, a locked, and an
  administrator account against a wrong password and an unknown number over the
  response's whole shape (decided 2026-10-22, Clarifications). The
  unlimited-concurrency rule is asserted here too: a sign-in leaves every session
  the account already holds intact, so only an explicit end removes a session
  (decided 2026-10-11, Clarifications). The ended-session state FR-049 defines is
  asserted over every path that ends a session — the inactivity timeout, the
  absolute maximum lifetime, an explicit sign-out, a sign-out of every device, a
  platform revocation, a password change or reset, and a block — so no path shows
  an unrelated error (decided 2026-10-22, Clarifications). The access
  controls the constitution
  requires of the first browser-facing feature (request-forgery protection,
  output encoding, and security headers, FR-044 … FR-046) are exercised here. The frame's
  composition is also asserted structurally here — the header's logo/home,
  notifications, and theme-switch controls and the account menu (its three
  items and the sign-out confirmation), the sidebar's navigation item list
  (each item naming a registered destination, and the list shown identically to
  a guest and to a signed-in merchant), and the sidebar collapse control —
  because no page in this slice renders the frame (decided 2026-10-11; revised
  2026-10-21, Clarifications). The
  frame's accessibility is asserted at the same structural level — an accessible
  name, a role, and keyboard reachability for each of its controls — while its
runtime scan and keyboard-only pass belong to the slice that ships the first
   page carrying the frame (decided 2026-10-11, Clarifications). The messaging
   channel's contract is asserted here too: the send is attempted inside the
   request that asks for the code, the code step opens only once the channel has
   accepted the message, and a channel refusal is reported as the explicit,
   retryable failure on the submission rather than on the code step, so no
   failure reaches a person who has already moved on; only a refusal at
   acceptance is that failure, and a message the channel accepts but does not
   deliver is outside the platform's observation and is not a failure the request
   reports, so the person requests a new code subject to the limit (decided
   2026-10-11 and 2026-10-22, Clarifications).
- **End-to-end tests (user journeys)**: Requested — journeys covered: US1
  (sign-up and verification), US2 (sign-in), US3 (password recovery), and US5 as
  far as the frame's scoping — the absence of the frame from the three bare
  pages this slice ships. The sidebar's two-width behaviour and the header
  controls' behaviour are not exercised here: they are verified by the slice that
  ships the first page carrying the frame, because no page in this slice renders
  it (decided 2026-10-11, Clarifications). Each journey starts from one of the three bare pages, which link to one another (decided 2026-10-11, Clarifications), runs through the one-time-code step as a step of the same page — no route of its own (FR-038), with the fields the flow collected shown for reading — at sign-up the full name, the mobile number, the city, and the optional shop name; in recovery the mobile number alone — the mobile number shown in its canonical Latin-numeral form and not editable there, the password not shown back in any form, and the step carrying both the re-request control and the control that returns to the first step (decided 2026-10-22, Clarifications) — and ends at the platform's own response —
  the session created by verification or by sign-in — because this slice ships no
  landing page (decided 2026-10-10, Clarifications); that response is a
  confirmation rendered in place on the page that began the journey, so each
  journey ends at a visible outcome (decided 2026-10-11, Clarifications). The in-progress state and
  the disabled submit control (FR-040) are exercised on the sign-up submission,
  on the sign-in submission, on the password-recovery request, on the
  code-entry step, and on the new-password step of the recovery flow
  (decided 2026-10-22, Clarifications). A journey that reloads part-way resumes at the code step while
  its pending request is live and its code has not yet been verified, and the code already sent is entered rather than a
  new one requested (decided 2026-10-11, Clarifications), while a journey that
  reloads at the new-password step resumes there for as long as the verified
  state lives and returns to the page's first step once the password is set
  (decided 2026-10-22, Clarifications). Each of the three bare
  pages is exercised showing an inline, retryable failure message without
  navigating away when a failure occurs, since this slice ships no error page to
  navigate to (decided 2026-10-11, Clarifications). US2's sign-out,
  sign-out-of-every-device, and
  other session-ending paths — which no surface offers in this slice — together
  with US4, US6, and US7, are covered by the unit and integration tests named
  above. The journeys are measured on SC-001's and SC-003's terms, excluding the
  time a code spends in delivery after the messaging channel accepts it
  (decided 2026-10-24, Clarifications).
- **Coverage target for changed production code**: at least 80% of changed
  lines, measured over the changed production lines this slice introduces and
  excepting the frame's runtime behaviour this slice defers to the first
  frame-carrying slice — the account menu's open and confirm behaviour, the
  sidebar's two-width behaviour, and the header controls' behaviour — which are
  excluded from this slice's target and covered by the slice that exercises
  them, while the frame's composition and the presence of its controls remain
  covered here by the structural verification (decided 2026-10-22,
  Clarifications).

### Key Entities *(include if the feature involves data)*

- **User**: a registered merchant account. It represents a person's identity and
  shop details, and it carries the role that separates a merchant from an
  administrator and the status (active or blocked). This feature creates it and
  relies on the invariants that the mobile number is its sole, unique identifier
  (enforced when the account is created, so two attempts arriving together for
  one number cannot produce two accounts),
  that no email address exists, that no merchant can delete it, and that an
  account created through public sign-up exists only after the mobile number is
  verified (decided 2026-10-10, Clarifications — no `User` row is created before
  the code is entered). That verification invariant is bounded to the public
  sign-up flow: the operator-provisioned administrator account is created
  directly, with no one-time code and no verification step (decided 2026-10-11,
  Clarifications). Its
  relationship to this feature is one account to many sessions.
- **Session**: one server-side session for an account. It represents the proof
  that a merchant is signed in, and it is revocable on its own or all at once
  ("sign out of every device"). This feature creates it and relies on the
  invariants that a session belongs to exactly one account, that it is revoked
  when the account's password changes or the account is blocked, and that it ends
  at its own lifetime — after the session timeout with no activity, or at its
  absolute maximum lifetime (decided 2026-10-10, Clarifications). Only what the
  merchant themselves do counts as activity for the session timeout — an action
  the merchant starts resets the inactivity clock, and a request the browser
  sends on its own does not, so a background request cannot keep a session alive
  indefinitely (decided 2026-10-22, Clarifications). An account MAY
  hold an unlimited number of concurrent sessions: this feature applies no cap,
  signing in never revokes an existing session, and "sign out of every device"
  is the action an account uses to end them all at once (decided 2026-10-11,
  Clarifications). A session outlives the page and the browser that created it:
  the browser retains the reference that proves it while the session itself stays
  on the server and is never recoverable from browser storage, and it ends only
  when the session timeout elapses with no
  activity or when it reaches its absolute maximum lifetime, so closing the
  browser neither ends it nor resets either clock (decided 2026-10-11,
  Clarifications; revised 2026-10-21, Clarifications).

The fixed Libyan city list is reference data this feature fixes once, not an
entity: the constitution names it as one dataset held for accounts, and every
later slice reads it rather than writing its own.

No third entity is introduced (decided 2026-10-10, Clarifications). The pending
sign-up data and the one-time codes are transient verification state, held in an
expiring store outside the entity register rather than as an entity; because the
store carries a per-number identity, an expiry, a replacement rule, and a bound
on incorrect entries that counts only a wrong value for the live code — an
expired or superseded code is refused without incrementing it — `docs/domain-model.md`
records it as transient,
non-entity state owned by the `users` module, with those invariants, in the same
change that records the decision — so the store is documented without entering
the entity register (decided 2026-10-21 and 2026-10-22, Clarifications). The pending sign-up
request carries the details the form collected, so that the account can be
created when the correct code is entered; the password among them is held only
in the same irreversibly protected form a stored password has, never in
plaintext, and it is discarded when the request is replaced or ends (decided
2026-10-22, Clarifications). Exactly one
pending request is live per mobile number: a new sign-up or recovery request for
a number that already has a live pending request replaces it and invalidates its
code at once in every state, including the recovery flow's verified state, which
ends at once and can no longer set a password (decided 2026-10-11 and
2026-10-22, Clarifications). A dispatch the messaging channel accepts restarts
the pending request's lifetime, so the replacement code carries a full period
rather than the remainder of the request it replaced, and a dispatch the
channel refuses changes neither the code nor the expiry (decided 2026-10-24,
Clarifications). In the password-recovery flow,
entering the correct code moves the pending request to a verified state that
carries the new-password step alone, lasts no longer than the pending request's
own lifetime, survives a reload, and ends when the new password is set or when a
new request replaces the pending request — so the
same code cannot authorise a second reset and a replaced request leaves no
verified state behind (decided 2026-10-22, Clarifications).
A pending request also ends once the platform has stated an outcome it cannot
complete — at sign-up, when the number already has an account, and in recovery,
when the number has no account or holds the administrator role — so no live
request and no usable code outlive the step that would have carried them
(decided 2026-10-22, Clarifications). The state
the account itself carries — the consecutive-failed-attempt count, the lock, and
the requirement to change the password at first sign-in, which the change made
at that first sign-in clears and no other path clears — is an account
property: the shape that carries it is a field-level change recorded through
`docs/domain-model.md` and a decision record, with the register's `User` row
amended in the same change rather than extended silently. That amendment's
content is exactly three fields on `User` — the consecutive-failed-attempt
count, the lock's expiry, and the requirement to change the password at first
sign-in — and the amendment is this slice's, recorded in its plan's Ownership
Map and Complexity Tracking so it is not left to be inferred (decided 2026-10-21,
Clarifications).

## Acceptance Criteria *(mandatory)*

### User Story 1 — Create an account and verify the mobile number (P1)

1. **AC-001**: **Given** a visitor on the sign-up page, **When** they provide a
   full name, a Libyan mobile number, a password, a city from the fixed list, and
   an optional shop name, **Then** the platform accepts the details and begins
   confirming the number *(FR-001)*
2. **AC-002**: **Given** any page this slice ships that takes a mobile number —
   the sign-up, sign-in, and password-recovery pages — **When** it is shown,
   **Then** it offers no dial-code selector and the country is fixed to Libya
   (+218) *(FR-002)*
3. **AC-003**: **Given** a visitor enters a number that is not a Libyan mobile
   number on +218 — including a Libyan landline number — **When** they submit,
   **Then** the platform refuses it against the fixed mobile-prefix dataset and
   creates no account *(FR-003)*
4. **AC-004**: **Given** valid details are submitted, **When** the platform sends
   a one-time code to the number and the visitor enters it correctly, **Then**
   the account becomes usable and the merchant is signed in, with no separate
   sign-in step; **And given** the code is entered incorrectly, **Then** the
   account does not become usable and no session is created *(FR-004)*;
   **And given** the correct code has been entered, **Then** the page renders a
   confirmation in place — no navigation, no new route, and no new page — stating
   that the account is ready and that the merchant is signed in *(FR-004)*
5. **AC-005**: **Given** a visitor is choosing a city, **When** they type into
   the city field, **Then** it searches one fixed list of every Libyan
   governorate, city, and area, and a value outside that list is not accepted
   *(FR-005)*; **And given** the visitor types a city's Arabic name without its
   diacritics, **Then** the search finds that entry, and every entry in the list
   carries one Arabic name and no Latin alternate name *(FR-005)*
6. **AC-006**: **Given** a mobile number already has an account, **When** the
   sign-up form is submitted with it, **Then** the form's response, the following
   step, and the sending of the code are indistinguishable from those for a
   number with no account, and that indistinguishability is bounded to those
   steps; **And when** the correct code is entered, **Then** ownership of the
   number is proven, no second account is created, the submitted password is not
   applied, and the person is directed to sign in or to recover the password by
   a message on the code step naming both options with the link to the sign-in
   page and the link to the password-recovery page, and with no redirect; **And
   then** the pending request ends at that point and its code stops being valid
   at once, so no live request survives the outcome *(FR-006, FR-034)*; **And
   given** two sign-up attempts for the same number arrive at
   the same moment, **Then** at most one account is created, the attempt that
   does not create it receives the same uniform outcome and direction, and no
   partial account and no second session is left behind *(FR-006, FR-031)*
7. **AC-007**: **Given** an account exists for a mobile number, **When** the
   sign-up form is submitted with the same number written differently (spaces, a
   leading zero, without the +218 prefix, or with the digits typed as
   Arabic-Indic numerals), **Then** it is treated as the same number and no
   second account is created *(FR-031, FR-006)*; **And given** the one-time
   code is typed as Arabic-Indic numerals, **Then** it is read as the same digits
   and verifies identically *(FR-031)*
8. **AC-037**: **Given** a person sets a password — at sign-up or on password
   change — **When** the password fails the policy (shorter than the minimum, or
   a common or breached password), **Then** the platform refuses it and no
   password is set *(FR-035)*; **And given** the sign-up form, **When** it is
   submitted with a password that fails the policy, **Then** it is refused at
   that point, before any one-time code is sent, and the refusal is the same
   whether or not the number already has an account *(FR-035, FR-006)*;
   **And given** the common-or-breached check, **Then** it is performed against
   a source the platform holds — no external service is called, so the refusal
   depends on the password alone and never on a third party's availability
   *(FR-035)*; **And given** a new password identical to the one it replaces on a change
   other than the administrator's forced first change, **Then** it is accepted,
   because the policy applies no rule against reuse and no password history is
   kept *(FR-035)*; **And given** the administrator's forced first change,
   **Then** a value identical to the initial password the operator supplied is
   refused and clears nothing, so only an actual change lifts the restriction
   *(FR-035, FR-028)*; **And given** the form that takes a
   password, **When** it is shown, **Then** it states the policy's requirements
   before the password is typed, and each reason the policy refuses a password
   carries its own message — shorter than the minimum, or common or breached —
   none of which reveals whether the number has an account *(FR-035)*

9. **AC-041**: **Given** the one-time-code step at sign-up or in password
   recovery, **When** it is reached, **Then** it renders as a step of the same
   page that began the flow — no page and no route of its own — so this slice
   still ships exactly the three bare pages: sign-up, sign-in, and password
   recovery *(FR-038)*; **And given** the code step is reached, **Then** it
   shows the fields the flow collected, for reading and without editing them:
   at sign-up, the full name, the mobile number, the city, and the optional shop
   name; in password recovery, the mobile number alone, shown in its canonical
   form with Latin numerals, because the recovery form collects nothing else and
   showing an account field there before the code is verified would reveal that
   the number has an account; the password is not shown back in any form —
   neither re-displayed, nor echoed, nor rendered masked — so a submitted
   password never returns to the browser, and the pending request holds it only
   in the same irreversibly protected form a stored password has, so no
   plaintext password is held while the request lives *(FR-038)*; **And given**
   the code step, **Then**
   it carries a control that requests a new one-time code, subject to the limit
   on re-requesting, and a control that returns to the page's first step, where
   the values already typed are editable again and retained except the password,
   which the page never retains or shows, and a fresh submission starts a new pending
   request for the new number *(FR-038, FR-034)*;
   **And given** the page is reloaded, or reopened, while a
   one-time code is still waiting, its pending request is still live, and its
   code has not yet been verified, **Then**
   the code step is shown again and the code already sent stays usable, with no
   new code requested and no new pending request started *(FR-038, FR-034)*;
   **And given** the code has been verified in the password-recovery flow and
   the page is reloaded, or reopened, while the verified state lives, **Then**
   the new-password step is shown again rather than the code step, and once the
   password is set the page returns to its first step *(FR-014, FR-038)*;
   **And given** a new request replaces the pending request while the verified
   state lives, **Then** the verified state ends at once, its authority to set a
   password is withdrawn, and the new code step is shown *(FR-014, FR-034,
   FR-038)*

10. **AC-043**: **Given** any authentication form this slice ships has been
    submitted — the sign-up form, the sign-in form, or the password-recovery
    request — or a one-time
    code is being verified, or the new password is being set in password
    recovery, **When** the request is in flight, **Then** the page
    shows an in-progress state and the submit control is disabled; **And given**
    the same submission is sent twice, **Then** no second account and no second
    code dispatch results, because the server-side uniqueness rule remains the
   authority *(FR-040)*; **And given** the new password is submitted twice in
   password recovery, **Then** the password is set once and the account's
   sessions are ended once *(FR-040)*; **And given** a failure occurs while one
   of these three
   pages is being used, **Then** the page shows an inline, explicit, retryable
   failure message and does not navigate away, including when the failure is one
   this specification does not name — such as a session that cannot be created
   after a correct password or a correct code — and no error page is shipped or
   reached *(FR-040)*;
    **And given** any of those states — the in-progress state, the inline failure
    message, or the in-place confirmation — **Then** it is announced to assistive
    technology, and when a step replaces another the focus moves to the step now
    shown — its first field, or its heading when it carries no field — and does
    not remain on a control the previous step carried *(FR-040)*

11. **AC-046**: **Given** the sign-up form, **When** the full name is left empty
   or contains only spaces, **Then** the details are refused and no account is
   begun *(FR-001)*; **And given** a full name or an optional shop name longer
   than the stated maximum length, **Then** the details are refused *(FR-001)*;
   **And given** a full name or shop name within the limit, **Then** it is
   accepted exactly as typed — letters and numerals alike — with no
   alphabetic-shape rule applied *(FR-001)*; **And given** a shop name another
   account already holds, **Then** it is accepted, because no uniqueness rule
   applies to it *(FR-001)*

### User Story 2 — Sign in, sign out, and end every session (P1)

12. **AC-008**: **Given** a verified merchant, **When** they submit their mobile
   number and password, **Then** they are signed in and are not asked for a
   one-time code *(FR-007)*; **And given** the sign-in succeeds, **Then** the page
   renders a confirmation in place — no navigation, no new route, and no new page
   — stating that the merchant is signed in *(FR-007)*
13. **AC-009**: **Given** a sign-in attempt, **When** the number is unknown or the
   password is wrong, **Then** the response does not reveal whether an account
   exists, and it does the same work and takes the same time as an attempt
   against a blocked, a locked, or an administrator account *(FR-008, FR-017)*
14. **AC-010**: **Given** an account has five consecutive failed sign-in
    attempts, **When** a sign-in is attempted within the next fifteen minutes,
    **Then** it is refused with the same uniform response as any other failed
    sign-in, and nothing in that response tells the person the account is locked
    or that it exists *(FR-009, FR-008)*; **And given** the merchant completes a
    password reset through the recovery flow while the account is locked, **Then**
    the lock still runs its full fifteen minutes and the count of consecutive
    failed attempts is not reset *(FR-009)*; **And given** attempts are made while
    the account is locked, **Then** they are not counted as further failed
    attempts and do not extend the lock *(FR-009)*; **And given** a successful
    sign-in occurs before five failures have accumulated, **Then** the count of
    consecutive failed attempts is cleared to zero and the next failure starts a
    new count of one *(FR-009)*; **And given** a refusal that never reached a
    password verification against an active account — a refusal produced by a
    rate limit, a refusal of a value that is not a valid Libyan mobile number,
    the refusal a blocked account receives, or the refusal an administrator
    account receives on the merchant sign-in surface — **Then** the count of
    consecutive failed attempts is not incremented and the lock is not driven by
    it *(FR-009, FR-017, FR-027, FR-033, FR-042)*; **And given** fifteen minutes
     have passed, **Then** a correct sign-in is accepted again and the count of
     consecutive failed attempts has cleared, so a single later failure does not
     re-lock the account *(FR-009)*; **And given** the account's own
    change-password action succeeds with the correct current password after
    failures have accumulated, **Then** the count of consecutive failed attempts
    is cleared to zero exactly as a successful sign-in clears it, while a lock
    already running is not lifted and keeps its full fifteen minutes *(FR-009)*; **And given** the account's own
     change-password action is submitted with a missing or wrong current password,
     **Then** the refusal counts toward the count of consecutive failed attempts,
     and five consecutive such refusals lock the account for the same fifteen
     minutes, while the lock refuses sign-in only and neither blocks that action
     nor ends the session it was attempted from *(FR-009, FR-013)*
15. **AC-011**: **Given** a signed-in merchant, **When** they sign out, **Then**
    the current session ends *(FR-010)*
16. **AC-012**: **Given** a signed-in merchant, **When** they sign out of every
    device, **Then** every session of their account ends *(FR-011)*
17. **AC-013**: **Given** a signed-in merchant, **When** the platform ends their
    session, **Then** their next action that requires a session is refused and
    they must sign in again *(FR-012)*
18. **AC-014**: **Given** a merchant changes their password, **When** the change
    completes, **Then** every existing session of the account ends, including the
    one the change was made from, and the merchant must sign in again with the
    new password *(FR-013)*; **And given** the merchant uses the account's own
    change action, **Then** the current password is required, and a change
    submitted without it or with a wrong one is refused and ends no session
    *(FR-013)*
19. **AC-015**: **Given** a signed-in merchant has been inactive beyond the
    session timeout, **When** they next act, **Then** the session has ended
    and they must sign in again *(FR-032)*; **And given** the merchant's browser
    sends a request on its own while the merchant does nothing, **Then** that
    request does not count as activity, the inactivity clock is not reset by it,
    and the session still ends when the timeout elapses *(FR-032)*; **And given**
    the merchant opens a page or submits a form, **Then** that action counts as
    activity and resets the inactivity clock *(FR-032)*; **And given** a session reaches its
    absolute maximum lifetime while the merchant keeps using it, **Then** it
    ends at that point too, however active they are *(FR-032)*; **And given** the
    merchant closes the browser and reopens it, **Then** the session is still
    held and the merchant is still signed in, because the session outlives the
    page and the browser that created it and only the two clocks end it
    *(FR-032)*
20. **AC-040**: **Given** a security-relevant event this slice produces — a
    failed sign-in attempt, a successful sign-in, the verification that creates
    an account at sign-up, a lock applied, a password change or a reset, a
    session revocation, a one-time-code or security-notice dispatch failure, or
    the operator's provisioning of an administrator account — **When** it
    occurs, **Then** a structured record is emitted for it, and that record
    carries no secret, no session token, and no personal data beyond what the
    constitution permits in a log *(FR-037)*; **And given** the
    record's subject, **Then** it is identified by an internal account identifier
    where an account exists and by no account reference where none does, and no
    record carries the mobile number *(FR-037)*
21. **AC-045**: **Given** the sign-in page or the password-recovery page,
    **When** the submitted value is not a valid Libyan mobile number on +218,
    **Then** it is refused with a distinct, explicit refusal stating that the
    value is not a valid Libyan mobile number, and that refusal is not the
    uniform refusal FR-008 requires and is excluded from SC-004's enumeration
    comparison *(FR-042)*
22. **AC-047**: **Given** an account's password changes — through the recovery
    flow, through the account's own change action, or through the
    administrator's forced first change — **When** the change
    completes, **Then** a notice is sent by SMS to the registered mobile number,
    whose body is Arabic and right-to-left with Latin numerals and no emoji
    *(FR-043, FR-026)*; **And given** every session of an account is ended at
    once, **Then** the same notice is sent *(FR-043)*; **And given** a password
    change, which ends every session of the account by FR-013, **Then** it sends
    one notice that reports the change and the sessions it ended, not a second
    notice for those sessions, because they are the change's own consequence
    rather than a second action *(FR-043, FR-013)*; **And given** an ordinary
    sign-in or an ordinary sign-out, **Then** no notice is sent *(FR-043)*;
    **And given** the notice cannot be sent, **Then** the change and the ending of
    the sessions still stand and are not blocked, and the failed send is recorded
    as the dispatch failure FR-037 names *(FR-043, FR-037)*; **And given** the
    operator's provisioning action sets the administrator account's initial
    password, **Then** no notice is sent, because the action sets an account's
    first password rather than changing one the account already holds, and the
    provisioning stays recorded as the structured security event FR-037 names
    *(FR-043, FR-028)*

### User Story 3 — Recover a forgotten password (P2)

23. **AC-016**: **Given** a merchant has forgotten the password, **When** they
    ask to reset it with their registered mobile number, **Then** a one-time code
    is sent by SMS to that number and, once the code is entered correctly, they
    can set a new password *(FR-014)*; **And given** the number's account holds
    the administrator role, **Then** the reset is refused after the code is
    verified — no password is set, no session is created, and the platform states
    explicitly that the credential cannot be reset on this surface, while the
    request, the following step, and the code dispatch stayed indistinguishable
    *(FR-014, FR-027)*; **And given** the new password is set for an account that
    is not blocked, **Then** the page
    renders a confirmation in place — no navigation, no new route, and no new page
    — stating that the password was changed and that the merchant must sign in with
    it *(FR-014)*; **And given** the account whose password is reset is blocked,
    **Then** the confirmation states both that the password was changed and that
    the account is blocked, so sign-in stays refused until an administrator
    returns the account to active, and nothing about the block is disclosed
    before the code is verified *(FR-014, FR-017)*
24. **AC-017**: **Given** a password-recovery request, **When** the number has no
    account, **Then** the request's response, the following step, and the sending
    of the code do not reveal whether an account exists and match those for a
    number that has an account, and that indistinguishability is bounded to those
    steps; **And when** the correct code is entered, **Then** ownership of the
    number is proven and the platform states explicitly that no account exists
    for that number, so no password is set *(FR-015)*
25. **AC-038**: **Given** a merchant completes a password reset through the
    recovery flow, **When** the new password is set, **Then** every existing
    session of the account ends, and, for an account that is not blocked, the
    merchant must sign in with the new password, while a blocked account's block
    stands and its confirmation says so as AC-016 provides *(FR-013, FR-014,
    FR-017)*

### User Story 4 — Account status and control over sessions (P2)

26. **AC-018**: **Given** an account, **When** its status is read, **Then** it is
    exactly one of active or blocked *(FR-016)*
27. **AC-019**: **Given** a merchant is blocked, **When** they try to sign in,
    **Then** the attempt is refused with the same uniform response as any other
    failed sign-in and nothing in that response tells the person the account is
    blocked or that it exists, the response doing the same work and taking the
    same time as any other failed sign-in, and their data and public
    contributions remain in place *(FR-017, FR-008)*
28. **AC-020**: **Given** a signed-in merchant, **When** they look for a way to
    delete their account, **Then** no such control is offered and any such
    request is refused *(FR-018)*; **And given** an account that is no longer
    registered, **Then** its personal data is removed only by an administrator
    action, with no retention period fixed by this specification and no trigger
    asserted for one *(FR-018)*
29. **AC-021**: **Given** an account is blocked, **When** a session it already
    held is used, **Then** access is refused *(FR-019)*

### User Story 5 — Move around the platform inside the shared page frame (P2)

30. **AC-022**: **Given** the shared frame as delivered, **When** it is applied
    to a page on the public site or in the merchant's area, **Then** the frame —
    a header carrying the logo/home control at its inline-start edge and, at its
    inline-end edge, the notifications control, the theme switch, and the
    account control, a sidebar at the inline-start edge
    carrying the navigation item list and the collapse
    control, the product's icon set, and the product's typography — is present;
    in this slice the scoping is verified structurally, because no public or
    merchant content page ships until a later slice; and the icon set is the one
    already chosen and recorded (ADR-098), which this slice records in the
    technology register through the register-gap record, the licence-obligation
    record, the vulnerability scan, and the vendoring the register requires
    *(FR-020)*; **And given** the frame as delivered, **When** its controls are
    inspected, **Then** each of them — the logo/home, account, the account
    menu's three items, the notifications control, the theme switch, the
    sidebar-collapse control, and the
    footer band's links — carries an accessible name, a role, and keyboard
    reachability, asserted structurally here, while the runtime scan and
    keyboard pass wait for the slice that ships the first page carrying the
    frame *(SC-006)*
31. **AC-023**: **Given** any of the pages this slice ships — sign-up, sign-in,
    and password-recovery — **When** it renders, **Then** the frame is absent,
    with no header and no sidebar, while the chosen appearance still applies
    (AC-027); the error page and the four static pages stay bound by the same
    rule but are verified by the slice that ships them *(FR-021)*
32. **AC-024**: **Given** a wide screen, **When** the sidebar collapse control —
    carried in the sidebar — is used, **Then** the sidebar narrows to an
    icon-only rail and can be restored; **And given** a narrow screen, **When**
    the same control is used, **Then** the sidebar opens and closes as a drawer;
    in this slice the control is verified as part of the frame's composition,
    and the behaviour itself is verified by the slice that ships the first page
    carrying the frame, because no page here renders it *(FR-022)*
33. **AC-025**: **Given** the frame as delivered, **When** its header is
    inspected, **Then** it carries the logo/home control at its inline-start
    edge and, at its inline-end edge, the notifications control, the theme
    switch, and the account control for a signed-in merchant, and no
    page-navigation link or sidebar-collapse control; the account control
    carries the accessible name «حسابي» and shows the icon alone, with no
    merchant name in the header;
    the account control opens a menu carrying «حسابي»، «إعدادات»، and
    «تسجيل الخروج»، with the
    sign-out item asking for a yes-or-no confirmation; for a guest the header
    carries the sign-in action in place of the account control and the
    notifications control, with no account menu, and the guest keeps the theme
    switch, while the collapse control is found in the sidebar; the controls
    are verified structurally, and the data behind the
    menu's destinations arrives with the slice that owns each destination
    *(FR-023, FR-047)*
34. **AC-026**: **Given** the frame as delivered, **When** a person needs the
    static pages, **Then** the frame gives them a way to reach Contact, Privacy
    Policy, Terms of Use, and FAQ, verified structurally, and the surface that
    carries those links is chosen and built in this slice — the frame's footer
    band, present on every page that carries the frame and absent from every bare
    page — and recorded as a
    decision record that also fixes the four routes, which the slice that ships
    the static pages adopts, and that record additionally fixes the destination
    of the header's guest sign-in action and the routes of the three bare pages
    this slice ships, so no link this slice builds is left without a target; the
    reachability requirement itself is discharged by the slice that ships the
    first page carrying the frame, and this slice's plan records that deferral
    in its Complexity Tracking table with an owner and a review date
    *(FR-024)*
35. **AC-027**: **Given** the frame is present, **When** the theme switch — a
    header control, beside the notifications control — is used, **Then** the
    interface moves between dark and
    light, the
    chosen appearance holds as the person moves between pages — including to a
    bare page, where it is applied before the page is painted and no switch is
    offered — and it is remembered for that browser without being stored on the
    account; the switch's presence and its position in the header are verified
    structurally in this slice, and its runtime behaviour is verified by the
    slice that ships the first page carrying the frame *(FR-025)*
36. **AC-028**: **Given** any screen, **When** it renders, **Then** its text is
    Arabic and right-to-left with Latin numerals, and every icon is from the
    product's icon set and never an emoji *(FR-026)*
37. **AC-039**: **Given** the three bare pages this slice ships — sign-up,
    sign-in, and password recovery — **When** any of them renders, **Then** it
    offers the way to the other two: sign-in offers the way to sign-up and to
    password recovery, sign-up offers the way to sign-in, and password recovery
    offers the way back to sign-in, so each journey has a defined entry point
    even though no page renders the frame *(FR-036)*
38. **AC-042**: **Given** the frame as delivered, **When** its sidebar is
    inspected, **Then** it carries its navigation item list — one item per
    registered destination a guest or a signed-in merchant can reach on the
    public site and in the merchant's area (Home, Parts, Catalog, Upload
    Catalog, My Files, Cart, Notifications, Messages, Profile), with no item
    for the three bare pages this slice ships and no item for the four static
    pages, each item
    naming a registered destination and pointing at the route this slice's
    decision record fixes, which the slice that ships that page adopts, and the
    same list is shown to a guest and to a signed-in merchant, with no item
    added, removed, or disabled by role — alongside the sidebar collapse
    control, and the item list is verified structurally in this
    slice; the logo, the notifications control, and the theme switch are
    verified in the header, where FR-020 places them
    *(FR-039)*
39. **AC-044**: **Given** a signed-in person, **When** they open one of the three
    bare pages this slice ships — sign-up, sign-in, or password recovery —
    **Then** the page renders exactly as it does for a guest, with no redirect
    and no signed-in-specific surface *(FR-041)*; **And given** an action taken
    on one of those pages completes and its confirmation is rendered in place,
    **Then** that confirmation is the outcome of the action rather than a
    signed-in-specific surface, and reloading or freshly opening the page returns
    it to its first step with no confirmation re-shown and no redirect *(FR-041,
    FR-004, FR-007, FR-014)*

40. **AC-051**: **Given** the frame as delivered, **When** the account control is
     activated, **Then** a menu carrying exactly «حسابي»، «إعدادات»، and
     «تسجيل الخروج» opens, each item carries an accessible name and a role, and
     the menu is keyboard-reachable; «حسابي» opens the Profile page and
     «إعدادات» opens that page's settings section, both on the one Profile route
     the frame's decision record fixes, and no further page is reached; the
     account's full name, city, and status are shown at the top of the Profile
     page, and no other account field is shown there;
     **And given** the menu is open, **When** the person presses Escape, activates
     something outside it, or moves the focus out of it, **Then** the menu closes
     without action and the focus returns to the account control;
     **And given** the «تسجيل الخروج» item is
     activated, **Then** a yes-or-no confirmation is shown, cancelling it leaves
     the session untouched, and confirming it ends the session; the composition
     and the confirmation markup are verified structurally in this slice, while
     the runtime pass waits for the slice that ships the first page carrying the
     frame *(FR-047)*

41. **AC-052**: **Given** a guest on a page that carries the frame, **When** the
     guest activates a sidebar item that names a merchant-area destination — My
     Files, Cart, Notifications, Messages, or Profile — **Then** the sign-in page
     is shown, while the three items that name a public destination — Home,
     Parts, and Catalog — open their own pages; the item list itself is
     unchanged, with no item added, removed, or disabled by role; the rule adds
     no page and no route, and the return to the wanted item after signing in
     belongs to the slice that ships the merchant area's pages; the item list
     and the rule are verified structurally in this slice, and the guest's
     redirection is verified by the slice that ships the first page carrying the
     frame *(FR-048, FR-039)*
42. **AC-053**: **Given** a signed-in merchant on a page that carries the frame,
     **When** a request is refused because the session has ended — whether by
     the inactivity timeout, the absolute maximum lifetime, an explicit sign-out
     elsewhere, a platform revocation, a sign-out of every device, or a password
     change or reset made elsewhere — or because the account
     is blocked, **Then** an explicit state inside the frame states that the
     session has ended and offers the way to sign in again, and says plainly
     that the account is blocked when that is the reason; no unrelated error is
     shown, the frame sends no further requests for a session that no longer
     exists, and the state adds no page and no route; **And given** the merchant
     confirms the sign-out in the account menu, **Then** that same state is shown
     in the page they were on; the state is verified structurally in this slice,
     and its runtime behaviour is verified by the slice that ships the first
     page carrying the frame *(FR-019, FR-049, FR-011, FR-012, FR-013)*
### User Story 6 — The operator creates the administrator account (P3)

43. **AC-029**: **Given** the public sign-up flow, **When** a person completes
    it, **Then** they become a merchant and never an administrator *(FR-027)*;
    **And given** an administrator account's mobile number and password are
    submitted on the merchant sign-in surface, **Then** the attempt is refused
    with the same uniform response as any other failed sign-in and nothing in
    that response tells the person the account exists or that it is an
    administrator account, and the response does the same work and takes the
    same time as any other failed sign-in *(FR-027, FR-008)*
44. **AC-030**: **Given** the operator creates the administrator account,
    **When** it is provisioned, **Then** it carries the requirement to change
    the password at first sign-in, so that the first sign-in is accepted and no
    product action other than the password change is permitted until the change
    is made, while ending the session — sign-out, the session timeout, and a
    platform revocation — remains available,
    and that requirement is cleared by the change made at that first sign-in,
    which lifts the restriction and MUST set a value different from the initial
    password the operator supplied — a submission repeating the initial
    password is refused and clears nothing, and a submission without the current
    password or with a wrong one is refused, clears nothing, leaves the account
    restricted, and counts as a failed password verification under FR-009 — and
    by no other path, the change
    also ends every existing session of the account, including the restricted
    session it was made from, and sends the security notice FR-043 requires, the whole
    rule being verified at the behaviour level with no page because the
    administrator's first sign-in is delivered here as behaviour *(FR-028,
    FR-035, FR-009, FR-013, FR-043)*;
    **And given** the provisioning action runs, **Then** it creates the account
    directly with no one-time code and no verification step, and the account
    carries the identity details the register requires, including an initial
    password the operator supplied that satisfies the password policy *(FR-028,
    FR-035)*; **And given** a value the action is given fails an account field
    rule — a full name outside its bounds, a number that is not a Libyan mobile
    number on +218 against the fixed dataset, or a city not on the fixed list —
    **Then** the action refuses it, reports the refusal to the operator, and
    creates no account *(FR-028, FR-001, FR-003, FR-005)*; **And given**
    the provisioning action is run twice with two distinct mobile numbers,
    **Then** each run yields a distinct administrator account and no cap on the
    number of administrator accounts is applied *(FR-028)*; **And given** the
    action is run for a mobile number that already has an account, **Then** no
    second account is created for that number and the conflict is reported to
    the operator *(FR-028, FR-031)*; the sign-in
    surface — the page — is verified by the slice that ships it *(FR-028)*; **And given** the
    provisioning action runs, **Then** it is out of band — run by the operator
    outside the administrator application — so it writes no audit-log row, and
    the provisioning is recorded as the structured security event FR-037 names
    *(FR-028, FR-037)*

45. **AC-054**: **Given** the administrator application, **When** its header is
     inspected, **Then** it carries the platform's logo at the inline-start edge
     and an account control whose menu offers «تسجيل الخروج» only; this slice
     binds that composition and delivers nothing of it, and the slice that
     ships the administrator application builds and verifies it *(FR-050)*

### User Story 7 — Sign-up resists automated abuse without a CAPTCHA (P3)

46. **AC-031**: **Given** the sign-up form, **When** it is submitted with the
    hidden field filled in, **Then** no account is created and the response is
    the same as the one a successful submission receives, so nothing in the
    response tells the sender it was detected; **And given** that refusal,
    **Then** no pending request is started, no one-time code is dispatched to
    the submitted number, and the code step is not reached *(FR-029)*
47. **AC-032**: **Given** the sign-up form, **When** it is submitted before the
    minimum time has passed since it was shown, **Then** no account is created
    and the person receives an explicit, retryable refusal *(FR-029)*
48. **AC-033**: **Given** one client — identified by the request's network
    origin — submits the sign-up form more often than the
    allowed rate, **When** the next submission arrives, **Then** it is refused
    with a distinct, explicit refusal stating that the limit was exceeded and
    that the person may retry later *(FR-029)*; **And given** a submission the
    form's own hidden field or minimum time-to-submit refuses, **Then** it still
    counts against that same account-creation budget, so a client that only fills
    the hidden field is bounded too *(FR-029, FR-033)*
49. **AC-034**: **Given** any public form, **When** it is shown, **Then** no
    CAPTCHA challenge is ever presented *(FR-030)*
50. **AC-035**: **Given** one client — identified by the request's network
    origin — submits an authentication operation
    (account creation, sign-in, or password recovery — account creation being the
    sign-up form's own submission, whose limit is that same budget, FR-029) more
    often than the allowed rate, **When** the next submission arrives, **Then** it is refused with the
    same distinct, explicit limit refusal, which states that the limit was
    exceeded and that the person may retry later *(FR-033)*;
    **And given** a client exhausts the limit of one of the three operations,
    **Then** the other two remain available, because each operation carries its
    own budget *(FR-033)*; **And given** one network origin exhausts an
    operation's budget, **Then** another origin's budget for the same operation
    is unaffected *(FR-033)*; **And given** one submitted mobile number exhausts
    its own budget for an operation, **Then** another number's budget for that
    operation is unaffected, so a network address shared by several people does
    not spend one person's budget on another's behalf *(FR-033)*
51. **AC-036**: **Given** a one-time code, **When** it has expired, or a new code
    is requested beyond the allowed limit, or it is entered incorrectly more than
    the allowed number of times, **Then** the platform refuses it and grants no
    access; **And given** a new code is requested, **Then** the replacement takes
    effect only when the messaging channel accepts the new message, the previous
    code stops being valid at that moment, and the count of incorrect entries is
    not reset, so
    the bound holds over the whole verification *(FR-034)*; **And given** that
    accepted replacement, **Then** the pending request and the new code get a
    full period from that moment, so the new code is never delivered with only
    the remainder of the request it replaced, while the re-request limit bounds
    repeated extension and a refused dispatch changes neither the code nor the
    expiry *(FR-034)*; **And given** the
    code entered is expired, or a code a replacement has superseded, **Then** it
    is refused as expired or superseded and does not increment the bound on
    incorrect entries, while a wrong value for the live code does *(FR-034)*;
    **And given** a new
    code is requested beyond the allowed limit, **Then** the request is refused
    with a distinct, explicit refusal stating that the limit was exceeded and that
    the person may retry later, and that refusal is excluded from SC-004's
    enumeration comparison because it depends on the pending request's own history
    rather than on whether the number has an account *(FR-034)*; **And given** the
    messaging channel refuses the code at acceptance, **Then** an explicit
    failure state allows a retry, the pending request — a sign-up or a password
    reset — stays valid until it expires, the code already delivered stays
    valid because the replacement takes effect only once the channel accepts the
    new message, and the failed send does not count
    against the re-request limit; the failure is shown on the submission that
    asked for the code and the code step is never reached, because the send is
    attempted inside that request and the step opens only once the channel has
    accepted the message, so no failure reaches a person who has already moved
    on *(FR-034)*; **And given** the messaging channel
    accepts the message but delivery later fails, **Then** no failure state is
    shown, the code stays valid until it expires, and the person can request a
    new code subject to the re-request limit, because a later delivery failure
    is outside the platform's observation *(FR-034)*; **And given** a new sign-up or
    recovery request is started for a number that already has a live pending
    request, **Then** the previous pending request and its code are replaced and
    stop being valid at once, including a pending request in the recovery flow's
    verified state, whose authority to set a password ends at once
    *(FR-014, FR-034)*; **And given** the bound on incorrect
    entries is reached, **Then** the pending request ends, no further code for it
    is accepted, and a fresh request begins a new verification with the count of
    incorrect entries at zero *(FR-034)*; **And given** the correct code is
    entered but the account cannot be created at that moment, **Then** the
    pending request stays valid and the same code remains usable, an explicit
    retryable failure is shown, and the failure counts neither as an incorrect
     entry nor against the limit on requesting a new code *(FR-034)*;
    **And given** the correct code is entered in the password-recovery flow,
    **Then** it stops being usable at once, the pending request carries the
    new-password step as a verified state that lasts no longer than the pending
    request's own lifetime, and setting the new password ends both — or a new
    request replaces the pending request, which ends the verified state at once
    — so the same code cannot authorise a second reset *(FR-014, FR-034)*; **And given** the
    reset cannot proceed because the number has no account or because the account
    holds the administrator role, **Then** the pending request ends once the
    outcome is stated and no verified state remains *(FR-014, FR-034, FR-015)*
52. **AC-048**: **Given** any action this slice ships that changes state — the
     sign-up submission, the sign-in submission, the password-recovery request,
     the entry of a one-time code, or the account's own change-password action —
     **When** its request is issued from a browser session, **Then** it is
     protected against request forgery, so a request the person did not make is
     refused *(FR-044)*
53. **AC-049**: **Given** a person has supplied a value the platform holds and
     shows — the full name or the shop name — **When** it is rendered back,
     **Then** it is encoded for its output context, so a value typed as markup or
     script is shown as the text it is and never executed, and a test fails when
     the encoding is removed *(FR-045)*
54. **AC-050**: **Given** any response the browser surface returns, **When** it is
     inspected, **Then** it carries the security headers the constitution names —
     a content-security policy whose script sources carry no wildcard, a
     transport-security declaration, a declaration that the browser MUST NOT guess
     a response's content type, and a frame-ancestors restriction — asserted by an
     automated test *(FR-046)*
55. **AC-055**: **Given** a submission to which more than one refusal applies,
     **When** it is decided, **Then** the refusals are applied in the one fixed
     order — the operation's rate limit first, then the sign-up form's hidden
     field, then its minimum time-to-submit, then the value rules, then the
     account-existence comparison — so an over-budget submission receives the
     distinct limit refusal whatever else is wrong with it, a submission that
     fills the hidden field receives the silent response even when another rule
     would also refuse it, a submission before the minimum time receives the
     explicit, retryable time refusal even when a field is invalid, and a
     submission whose value rules fail is refused for those rules before any
     account-existence comparison runs *(FR-051, FR-029, FR-033, FR-042)*;
     **And given** several value rules fail at once, **Then** each failing rule
     carries its own message and no account-existence comparison runs until every
     value rule has passed *(FR-051, FR-001, FR-005, FR-035)*; **And given** a
     submission refused at one step, **Then** no later check runs and no earlier
     refusal is replaced *(FR-051)*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can complete sign-up, including confirming the number,
  in under 3 minutes. The time the code spends in delivery after the messaging
  channel accepts it is excluded: the criterion measures the person's own
  actions and the platform's responses, the same boundary SC-009 draws (decided
  2026-10-24, Clarifications).
- **SC-002**: A returning verified merchant signs in in under 30 seconds, without
  a one-time code.
- **SC-003**: A merchant can reset a forgotten password in under 3 minutes. As
  SC-001 provides, the time the code spends in delivery after the messaging
  channel accepts it is excluded (decided 2026-10-24, Clarifications).
- **SC-004**: 100% of sign-up, sign-in, and password-recovery responses are
  indistinguishable between a number that has an account and one that does not,
  including an attempt made while the account is locked, an attempt against a
  blocked account, and an attempt against an administrator account on the
  merchant sign-in surface (asserted by an automated enumeration test); the
  criterion covers the response's whole observable shape — its text, its status,
  and how long it takes — so the test asserts the response's duration alongside
  its content, and a response MUST NOT do less work for a number that has no
  account than for one that has (decided 2026-10-11, Clarifications). In the sign-up and
  password-recovery flows the criterion is bounded to the request's response, the
  following step, and the sending of the code, because entering the correct code
  proves ownership of the number and the outcome past that point differs by
  design. The criterion is also bounded to responses that are not rate-limit
  refusals: a refusal produced by a rate limit is deliberately distinct and
  explicit (FR-029, FR-033), and it is excluded from the enumeration comparison
  because it depends on the client's own request history rather than on whether
  the number has an account. The criterion is bounded the same way to responses
  that are not format refusals: a submitted value that is not a valid Libyan
  mobile number on +218 is refused distinctly and explicitly (FR-042) and is
  excluded from the enumeration comparison, because such a value can never have
  an account. The criterion is bounded the same way to a refusal produced by the
  limit on requesting a new one-time code (FR-034): that refusal is distinct and
  explicit, and it is excluded from the enumeration comparison because it depends
  on the pending request's own history rather than on whether the number has an
  account, and the pending request exists for a number with no account exactly as
  it does for one (decided 2026-10-11, Clarifications). The criterion is
  unweakened for a status or role refusal: a blocked, a locked, and an
  administrator account each receive a response that does the same work and
  takes the same time as a wrong password and as an unknown number, so the
  enumeration test asserts them alongside those cases rather than exempting them
  (decided 2026-10-22, Clarifications).
- **SC-005**: 100% of the frame's target scopes render the frame and 100% of the
  bare scopes this slice ships (sign-up, sign-in, recovery) do not (asserted by
  an automated check); in this slice the frame's own scoping is verified
  structurally, the sidebar's two-width behaviour and the header controls'
  behaviour are verified by the slice that ships the first page carrying the
  frame, and the error and static scopes are verified by the slice that
  ships them.
- **SC-006**: Every delivered page passes an automated accessibility scan and a
  keyboard-only pass at WCAG 2.2 AA. The frame this slice delivers is covered by
  the criterion at the level of its markup: its structural verification asserts
  that every frame control carries an accessible name, a role, and keyboard
  reachability, while the automated scan and the keyboard-only pass over the
  frame's rendered behaviour belong to the slice that ships the first page
  carrying it — the same boundary its two-width behaviour already observes
  (decided 2026-10-11, Clarifications). On the three bare pages this slice
  ships, the scan and the keyboard-only pass also assert that each state change
  is announced and that focus lands on the step now shown rather than on a
  control the previous step carried (decided 2026-10-22, Clarifications).
- **SC-007**: The lock triggers on the fifth consecutive failed sign-in attempt,
  lifts after fifteen minutes, and clears the consecutive-failed-attempt count at
  that point — with attempts made during the lock neither counted nor extending
  it — in 100% of tested cases; a successful sign-in made before the fifth
  failure also clears the count to zero, so the run that follows starts afresh,
  in 100% of tested cases; a change made through the account's own
  change-password action clears the count the same way when the current password
  is correct, while a lock already running is not lifted by it, in 100% of
  tested cases; and only a failed password verification against an
  existing, active account increments the count, so a refusal produced by a rate
  limit, a refusal of a value that is not a valid Libyan mobile number, the
  refusal a blocked account receives, and the refusal an administrator account
   receives on the merchant sign-in surface never drive the lock, in 100% of
   tested cases (decided 2026-10-11, Clarifications); and a failed
   current-password check inside the account's own change-password action is a
   failed password verification against an existing, active account and therefore
   drives the lock exactly as a failed sign-in does, in 100% of tested cases
   (decided 2026-10-11, Clarifications).
- **SC-008**: 100% of user-facing text — every screen this slice delivers and
  the body of every message it sends by SMS — presents Arabic right-to-left
  text with Latin numerals and no emoji (asserted by a scan of user-facing
  strings, which reaches the message templates and not the screens alone;
  decided 2026-10-11, Clarifications).
- **SC-009**: Every sign-up, sign-in, and password-recovery step completes in
  under 1 second at p95, measured under the scale stated in Assumptions (up to
  10,000 registered accounts, up to 500 concurrent sessions, and a peak of no
  more than 10 authentication requests per second), excluding the time the SMS
  takes to arrive. The time a request spends waiting for the messaging channel to
  accept a message is inside that budget and is not excluded: the send is
  attempted inside the request that asks for the code, so only the delivery
  after acceptance lies outside the platform's control; a delivery that fails
  after acceptance is outside the platform's observation and does not turn the
  request into a failure (decided 2026-10-11 and 2026-10-22, Clarifications).

## Assumptions

- **This slice implements none of the sixteen product features, and says so
  against the register (decided 2026-10-21, Clarifications).** The constitution's
  Product Scope lists sixteen product features, each of which MUST be
  implemented through a specification that references that list. This
  specification references it and implements none of the sixteen: it delivers
  the identity surfaces the Product Scope names — the sign-up, sign-in, and
  password-recovery pages, the account's status, the session lifecycle, and the
  shared page frame the later slices' pages are composed from — and the
  features themselves belong to the slices that own them (File Upload and
  Automated Extraction to R2 and R3, Arabic Search and Multi-Filter Search to
  R5, the Cart to R8, Notifications to R9, Messaging to R10, the Admin
  Application to R13, the Audit Log to R13 and R14, and Automatic Deletion to
  R15).
- **The pages this slice delivers are bare, and no page renders the frame here
  (decided 2026-10-10, Clarifications).** The sign-up, sign-in, and
  password-recovery pages are the only pages this slice delivers, and all three
  are shown without the frame. The shared frame is delivered here for the public
  site and the merchant's area, whose first content pages arrive with later
  slices; this slice adds no page whose purpose is to render the frame, and its
  acceptance verifies the frame's composition and its scoping structurally
  rather than through a shipped content page.
- **The frame is delivered whole, and its controls are verified structurally
  (decided 2026-10-10, revised 2026-10-11 and 2026-10-21, Clarifications;
  revised 2026-10-21, ADR-102; revised 2026-10-25, ADR-126).** The
  header's logo/home, notifications, and theme-switch controls and the account
  menu, the sidebar's
  navigation item list with its collapse control, and the
  frame's means of reaching the four static pages are built in this slice and
  verified as composition and as scoping, because no page here renders the
  frame. The navigation item list is fixed here — one item per registered
  destination a guest or a signed-in merchant can reach (Home, Parts, Catalog,
  Upload Catalog, My Files, Cart, Notifications, Messages, and Profile), with no item for the
  bare pages or the four static pages, and shown identically to a guest and to a
  signed-in merchant — no item added, removed, or disabled by role — and each
  item points at the route this slice's decision record fixes, which the slice
  that ships that page adopts, so the frame is composed once rather than
  extended by a later slice (decided 2026-10-11, Clarifications). The data
  behind the account menu's destinations and the notifications item belongs to
  the slices that own them, while the menu's own open and confirm behaviour is
  exercised by the slice that ships the first page carrying the frame; the
  surface that carries the static-page links is chosen and built in this slice
  and recorded as a decision record, and that record fixes the route of every
  destination the frame links to — the nine sidebar destinations, the four
  static-page routes, the destination of the header's guest sign-in action, the
  Home destination of the logo/home control, and the account menu's
  destinations (the Profile route and its settings section; no route for
  sign-out) — together with the routes of the three bare pages this slice
  ships, so a later slice ships its page at the route fixed here rather than
  choosing one of its own (decided 2026-10-11; revised 2026-10-21,
  Clarifications). The sidebar's two-width behaviour and the header's and menu's
  behaviour are not exercised at runtime here — no page renders the frame — and
  are verified by the slice that ships the first page carrying the frame, while
  this slice verifies the frame's composition and the presence of its controls
  (decided 2026-10-11; revised 2026-10-21, Clarifications).
- **The platform's logo is a wordmark, and it belongs to the frame (decided
  2026-10-11; revised 2026-10-21, Clarifications).** The header carries the
  platform's name at its inline-start edge, set in the product's typography. The
  slice adds no image asset and no new design value for it, and the form the
  logo takes is recorded in the plan; because the logo is part of the frame's
  composition, FR-020, FR-023, and AC-022 list it alongside the account control,
  the notifications control, the theme switch, the sidebar, the icon set, and the
  typography.
- **The static and error pages arrive later.** Contact, Privacy Policy, Terms of
  Use, FAQ, and the error page are delivered by a later slice. This slice binds
  the frame's absence from them and provides the frame's means of reaching the
  four static pages; the two slices share those four routes. Verifying the
  frame's absence from those pages belongs to the slice that ships them (decided
  2026-10-10, Clarifications); this slice verifies its own bare pages and the
  frame's scoping structurally, and creates no placeholder page. The
  reachability requirement — that an in-scope static page no in-scope page links
  to is a defect — is therefore discharged by the slice that ships the first
  page carrying the frame, and this slice's plan records that deferral in its
  Complexity Tracking table with an owner and a review date (decided 2026-10-21,
  Clarifications).
- **The icon set is fixed here, once (decided 2026-10-11, Clarifications;
  revised 2026-10-21, Clarifications, ADR-098).** The set itself is already
  chosen and recorded (ADR-098), and the technology register still leaves the
  gap open; this slice therefore records the chosen set in the register, so
  every later slice reads the register rather than choosing a set of its own,
  and changing the set is an amendment to that record rather than an edit made
  inside a feature. The choice is recorded in the plan's Constitution Mandated
  Values, with the register-gap decision record, the licence-obligation record,
  and the vulnerability scan the register requires, and the vendoring the
  register-gap rule requires; this specification names no set, because naming a
  library in this file would breach Principle VII.
- **The Libyan city list is fixed here, once.** It is recorded as one reference
  list for accounts and named in a decision record; every later slice reads it
  rather than writing a list of its own, and changing the list is an amendment
  to that record rather than an edit made inside a feature. Each entry carries
  one Arabic name and no Latin alternate name, and the search matches those
  Arabic names while ignoring diacritics, so the list holds no second naming
  source to keep in step with it (decided 2026-10-22, Clarifications).
- **The Libyan mobile-prefix set is fixed here, once.** It is recorded as one
  reference dataset for accounts and named in a decision record alongside the
  city list; the platform decides whether a +218 number is a mobile number from
  that dataset rather than from a rule of its own, and changing the dataset is an
  amendment to that record rather than an edit made inside a feature.
- **The administrator account is created out of band.** The operator provisions
  it outside the public flow, and the account is a user holding the
  administrator role rather than a separate kind of account. The provisioning
  action creates the account directly, with no one-time code and no verification
  step: the verification rule FR-004 states governs accounts created through
  public sign-up, and the operator who runs the action already controls the
  platform. The action also sets an initial password the operator supplies, which
  MUST satisfy the password policy FR-035 requires, so the administrator can sign
  in and is then held to the forced password change; that forced change must set
  a value different from the initial password, so the requirement is cleared
  only by an actual change, and it requires the current password exactly as the
  account's own change action does, so a submission without it or with a wrong
  one is refused and clears nothing (decided 2026-10-11 and 2026-10-22,
  Clarifications). The values the action sets are bound by the same account
  field rules sign-up applies — the full name present and within its bounds
  (FR-001), the number a Libyan mobile number on +218 (FR-003), and the city
  drawn from the fixed list (FR-005) — because those rules govern the account
  rather than the public path; a value that fails one is refused and the refusal
  is reported to the operator, with no account created (decided 2026-10-11,
  Clarifications). The change made at the forced first sign-in ends every
  existing session of the account, including the restricted session it was made
  from, and sends the security notice, because it is a password change like any
  other (decided 2026-10-22, Clarifications). The action is repeatable and the
  platform holds no cap on the number of administrator accounts, because the
  register states none and the sources speak of every administrator account;
  uniqueness is enforced on the normalised mobile number as for any account
  (decided 2026-10-11, Clarifications). Because the action is out of band it is
  not an administrator operation: it writes no audit-log row, its recording is
  the structured security event FR-037 names, and this slice therefore creates
  no audit-log table and needs none (decided 2026-10-11, Clarifications).
- **The administrator's first sign-in is delivered as behaviour, and its
  surface arrives later (decided 2026-10-10 and 2026-10-11; revised 2026-10-22,
  Clarifications).** This slice ships no administrator sign-in page: it
  delivers the first sign-in as behaviour with no page — the sign-in is
  accepted, the account is restricted to the password change, and the change
  made at that first sign-in clears the requirement and lifts the restriction —
  and it creates
  the administrator account through an operator-run provisioning action and
  records the forced-password-change requirement and its state on the account,
  and its acceptance verifies that requirement at the behaviour level. The
  requirement means the first sign-in is accepted and the account is restricted
  to the password change until it is made — the sign-in itself is not refused —
  while ending the session remains available to a restricted account, so the
  administrator application's sign-out control stands (decided 2026-10-11;
  revised 2026-10-22, Clarifications). Because the administrator's sign-in is
  separate, the merchant sign-in surface this slice ships refuses an
  administrator account's credentials with the same uniform refusal any failed
  sign-in receives, so nothing tells the person the account exists or is an
  administrator account (decided 2026-10-11, Clarifications). The administrator's separate login
  surface — the page — belongs to the slice that ships the administrator
  application.
- **The base project is established by this slice.** The repository workspaces,
  the shared configuration, the test runner, the account and authentication
  capabilities, and the supporting infrastructure the rules require
  (including the SMS channel that carries the one-time codes) are created here;
  their technical composition is fixed in the plan, not in this specification.
- **SMS delivery time is outside the platform's control** and is excluded from
  the timing criteria: SC-001 and SC-003 measure the person's own actions and the
  platform's responses, excluding the time a code spends in delivery after the
  messaging channel accepts it, and SC-009 already draws the same boundary
  between the request and the delivery (decided 2026-10-24, Clarifications). A
  send that fails outright is handled as an
  explicit, retryable failure and does not consume the limit on requesting a new
  code (decided 2026-10-10, Clarifications).
- **The product is a browser catalog only.** No installable application, no
  offline surface, and no service worker are shipped.
- **No email address exists anywhere**, at any point in this feature: the mobile
  number is the sole account identifier.
- **A merchant's data lives as long as the account is registered (decided
  2026-10-11, Clarifications; revised 2026-10-21, Clarifications).** No merchant can delete their own account, so no
  self-service removal path exists, and the account's personal data — its full
  name, mobile number, and city — is removed only by an administrator action,
  which arrives with a later slice. This slice fixes
  no retention period: the Product Register states none, and stating one here
  would bind a product fact the register does not own and pre-empt the slice that
  owns the retention job; the retention job's scope over account rows is not
  asserted here either. What this slice does own is the set of facts the Privacy
  Policy page will state — what sign-up collects, that the mobile number is the
  sole identifier, and that no merchant can delete their own account — while the
  page's wording belongs to the slice that ships it.
- **No third entity, and the account-level state is an amendment (decided
  2026-10-10, Clarifications; revised 2026-10-21, Clarifications).** The pending sign-up data and the one-time codes
  are transient verification state held in an expiring store outside the entity
  register, so this feature names no entity beyond `User` and `Session`; the
  store is recorded in `docs/domain-model.md` as transient, non-entity state
  owned by the `users` module, with its invariants, so it is documented without
  entering the entity register. The
  failed-attempt count, the lock, and the forced-password-change requirement are
  account properties: this feature adds them through a field-level change
  recorded in `docs/domain-model.md` and a decision record, with the register's
  `User` row amended in the same change rather than left implicit; the
  amendment's content is exactly those three fields, and the amendment is
  tracked in this slice's plan's Ownership Map and Complexity Tracking.
- **The sign-out control is the frame's, and no page here renders it (decided
  2026-10-10, Clarifications; revised 2026-10-21, Clarifications).** Sign-out
  and sign-out-of-every-device are delivered as behaviour and verified by the
  integration tests, and the control that offers sign-out is the account menu's
  third item with its yes-or-no confirmation — a part of the frame's
  composition, which this slice builds and verifies structurally here, because
  no page this slice ships renders the frame (ADR-099). Its runtime behaviour
  lands with the slice that ships the first page carrying the frame (R4), and
  the action that ends every session of the account at once is the profile
  page's settings action (R7); the US2 end-to-end journey is correspondingly
  narrowed to sign-in.
- **The three bare pages render the same for a signed-in person and for a guest
  (decided 2026-10-11, Clarifications).** No redirect is introduced and no
  signed-in-specific surface appears on the sign-up, sign-in, or
  password-recovery page, because those pages are public and carry no frame;
  offering a sign-out control there would contradict the rule above that
  the sign-out control belongs to the frame and not to a bare page, and this slice ships no destination page
  for a redirect to reach. The in-place confirmation each of those pages renders
  after a successful action is the outcome of that action rather than a
  signed-in-specific surface, and once the action is complete a reload or a fresh
  opening returns the page to its first step with no confirmation re-shown
  (decided 2026-10-11, Clarifications).
- **Blocking has no act in this slice (decided 2026-10-11, Clarifications).**
  The account's status and everything that follows from it — the uniform refusal
  at sign-in and the withdrawal of the sessions the account already held — are
  delivered here, and the tests reach the blocked state directly. The acts that
  change the status — setting an account to blocked and returning it to active —
  are administrator operations, and every administrator operation must
  be recorded in the audit log, whose record is delivered by the
  administrator application's slice; both acts therefore arrive with the
  administrator's Users page, and US4's Independent Test is narrowed to that
  boundary. This slice defines no reverse transition of its own (decided
  2026-10-11, Clarifications).
- **The account's own change-password action has no surface in this slice
  (decided 2026-10-11, Clarifications).** The action is delivered as behaviour
  and verified by the integration tests, so both halves of FR-013 — the change
  made from inside the account and the change made through the recovery flow —
  are exercised here; the profile page that offers the action arrives with the
  slice that owns it. No page this slice ships carries the frame, so no control
  offers it here, exactly as sign-out is treated.
- **No landing page exists in this slice (decided 2026-10-10, Clarifications).**
  The journeys end at the platform's own response: verifying the code creates the
  session, and signing in creates the session. No page this slice ships is the
  destination of either, the session is asserted at the behaviour level and by
  the integration tests, and the first page a signed-in merchant lands on arrives
  with the slice that ships the merchant's area. Each of those journeys ends at a
  confirmation rendered in place on the page that began it — the sign-up page's
  code step, the sign-in page's form, and the password-recovery page's
  new-password step — which states the outcome, adds no route, and adds no page
  (decided 2026-10-11, Clarifications). The three bare pages stay the
  only pages this slice delivers.
- **A modest measurement ceiling is assumed, and the success criteria are
  measured against it (decided 2026-10-11, Clarifications).** SC-009 is measured
  under up to 10,000 registered accounts, up to 500 concurrent sessions, and a
  peak of no more than 10 authentication requests per second across the three
  authentication operations. The plan's Scale/Scope starts from
  `docs/capacity-model.md`, records this measurement condition, and states any
  deviation from that model; the ceiling is an operational fact, not a design
  value, so it adds no field and no entity.
