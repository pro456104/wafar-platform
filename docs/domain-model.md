# Domain Model — Wafar

This document is the single authority for Wafar's **logical** data model: the
entities the product reasons about, the relationships between them, their
cardinality, their invariants, and the module that owns each one. It is the
source the constitution's Product Register maps.

Its authority is `.specify/memory/constitution.md` (v2.13.0); where this
document and the constitution disagree, the constitution wins and this document
is corrected. Its amendment procedure is the constitution's: a change here is a
change to a registered product fact and MUST be recorded as an ADR in
`docs/DECISIONS.md`.

## What this document is, and what it is not

The distinction is the whole point of this document, so it is stated first.

| Concern | Lives in | Written by |
|---|---|---|
| **Domain model** — entities, relationships, cardinality, invariants, ownership | **this document** | project level, ratified here |
| **Data model / schema** — tables, columns, types, indexes, constraints | `packages/db/schema/<module>.ts` and `packages/db/migrations/` | the feature that owns the module, in its plan Phase 1 |
| **Feature data model** — the columns one feature introduces, and the API contracts it exposes | `specs/[###-feature]/data-model.md` and `specs/[###-feature]/contracts/` | `/speckit.plan` Phase 1 |
| **Data dictionary** — the meaning, type, and constraint of every column | the feature's `data-model.md`, which is the only place a column is introduced | `/speckit.plan` Phase 1 |

**No column type, no SQL, and no table definition appears in this document.**
The constitution forbids a table definition inside the constitution
(Single-Reference Sufficiency: "a design value, a token, a class, a line of
code, or a table definition MUST NOT be copied"), and the same reasoning
applies here: a column list copied into a document is a second source that will
disagree with the migration.

A field *name* appears occasionally, and each one is a reference rather than a
definition — it names a value the constitution or the product already fixes, so
that the rule below can be stated in business terms:

- `first_page_metadata_incomplete` and `expires_at` are named in the
  constitution's File Processing Overview and Glossary.
- `name`, `phone`, and `body` are the contact form's fields, fixed by the
  constitution's Product Fact Clarifications.
- The four catalog status values are fixed by the constitution's File Processing
  Rules.

This document introduces no field, and it defines no type, length, nullability,
default, or index. A field that the constitution does not fix is either already
registered in Unresolved facts below with the slice that owns it, or it does not
exist yet.

This is not a workaround for missing work. The shape of a part, the treatment
of supplier-assigned identifiers, and the exact columns are **Catalog data
shape**, a deferred area of the constitution. R3 is the first slice to implement
it, and its plan's Constitution Check MUST record which rules are still missing
and how they will be ratified, no later than R3's acceptance. Writing the
columns here now would ratify a deferred area before the slice that owns it, and
the constitution forbids exactly that.

The entity names, their relationships, and their invariants below are **not**
deferred: the product already fixes them in `Core-Project.txt` and the
constitution's Product Register, and the slice order depends on them — R1
through R15 all read this document before planning.

## Entity map

Ten entities, each owned by exactly one module. Ownership is binding: the
owning module is the only one that may read or write the entity's storage, and
every other module reaches it through that module's service.

| Entity | Owning module | What it represents | Cardinality |
|---|---|---|---|
| `User` | `users` | A registered merchant whose identity is a mobile number (E.164, unique) with its country code, a city, an optional shop name, and the role that separates a merchant from an administrator. No email address exists. | One account has many catalogs, bookmarks, notifications, and at most one conversation. |
| `Supplier` | `suppliers` | The company named on a catalog's first page, from which the parts originate. | One supplier appears in many catalogs. |
| `Catalog` | `catalogs` | An uploaded supplier file with its metadata, its processing status, and a pointer to its stored bytes. | One catalog belongs to one uploading user and to at most one supplier, and contains many parts. |
| `Part` | `parts` | A single row extracted from a catalog, representing one car part. | One part belongs to exactly one catalog. |
| `Bookmark` | `bookmarks` | One entry in a merchant's cart: a link from a user to a part. | One user has at most 99 bookmarks; a bookmark links exactly one user and one part. |
| `Notification` | `notifications` | A message delivered to a user in the notification list, from a processing outcome or from the administrator. | Many per user; no upper bound is fixed. |
| `Conversation` | `messages` | The single thread between a merchant and the administrator. | A user has at most one conversation. |
| `Message` | `messages` | One message inside a conversation. | Many per conversation. |
| `ContactMessage` | `support` | A message from the public contact form: name, phone, body. | Independent of any account; it reaches the administrator without a conversation. The phone is for contact only, never an account identifier. |
| `AuditLog` | `admin` | The append-only record of every administrator operation. | Append-only: never updated, never deleted. The administrator is a party the record names, but *how* it names one is undecided — see Unresolved facts. |

## Relationships

```text
User 1 ──< Catalog >── 1 Supplier
User 1 ──< Bookmark >── 1 Part >── 1 Catalog
User 1 ──< Notification
User 1 ── 1 Conversation 1 ──< Message
ContactMessage                 (no user; the submitter may be a guest)
```

`AuditLog` is deliberately absent from this diagram. The register makes an
administrator a role on `User`, while the conversation and the audit record both
treat an administrator as a party of its own; drawing the relationship either way
would settle a question the register records as open. The same holds for the
administrator side of `Conversation`. Both are named in Unresolved facts and owned
by R13.

A dashed line is not used, because "related but undecided" is not a relationship
the schema can express, and drawing one would read as a decision.

Two relationships carry a rule that the product fixes and that no entity field
expresses:

- **A part is reachable through its catalog, never around it.** Filtering by
  catalog file (`?file=<id>`) and the Catalog page both traverse
  `Part → Catalog → User`. No query path may return a part without resolving its
  catalog.
- **A guest contributes no user row.** A `ContactMessage` is the only entity a
  visitor without an account creates, and it carries the submitter's name and
  phone rather than a foreign key.

## Invariants

Each invariant below is a product rule that the schema, the service layer, and
the tests must all enforce. The constitution's Schema and Migration Control
requires uniqueness, referential integrity, and permitted value ranges to be
expressed as schema constraints rather than only in application code; the
service layer re-checks the ones a constraint cannot express.

### Catalog

- **Status is a closed four-value enum**: `uploaded`, `processing`,
  `completed`, `failed`. Any other value is a defect, not a new state
  (File Processing Rules). The status is not a lifecycle the user drives; the
  pipeline drives it.
- **`first_page_metadata_incomplete` is a boolean flag, never a status value.**
  It is set when the file's first page yields neither the supplier's name nor
  the issue date. It was absent from the constitution's entity register while
  the File Processing Overview required it; the register now carries it.
- **The content hash is unique across catalogs.** A duplicate upload is
  rejected by hash and is neither stored, queued, nor processed. A merchant who
  uploads the same supplier file twice receives a message naming the original,
  not a second catalog.
- **`expires_at` semantics are undecided.** It is either the retention deadline
  or the supplier's printed expiry date. This is a recorded unresolved product
  fact owned by R15; until R15 decides it, no feature may give the field a
  meaning.
- **Retention is 90 days from upload**, enforced by R15 and expressed through
  the same window in the search index's lifecycle.

### Part

- **A part belongs to exactly one catalog.** There is no part without a
  catalog, and no shared part across catalogs.
- **A merchant never edits or deletes a part.** Only the administrator does
  (Authorization and Access Control). The write path exists on the
  administrator application only.
- **Deduplication happens by file, by page, and by row** (File Processing
  Overview, step 6; Product Features #5). That is a rule about what the
  extraction pipeline compares, and it binds the pipeline regardless of what a
  part stores.
- **Whether a part persists its page and row of origin is undecided.** The
  Glossary fixes a part's fields at part number, name, brand, car model, and
  description; a position within the source is beyond that list, so it falls
  under **Catalog data shape** — a deferred area. Until R3 decides it, a feature
  MUST NOT treat page or row as a part field, and MUST NOT depend on either
  being present. This is recorded as an unresolved fact below.

### Bookmark (the cart)

- **The cart is a bookmark list, not a purchase.** It carries no price, no
  quantity, and no checkout state, and it MUST NOT be described in
  user-facing text as a purchase (Principle VI).
- **Maximum 99 parts per user, enforced server-side.** On reaching the cap the
  user is shown a full-cart notice. A client-side check does not satisfy the
  limit.
- **A user and a part pair at most once.** Re-adding a bookmarked part is a
  no-op, not a second entry — which is why the add action is idempotent and the
  `+` control toggles to the cart icon.

### Notification

- **A notification has a read state and an unread count.** The count in the
  header is the number of the user's unread notifications.
- **Retention is undecided** and is recorded as an unresolved product fact
  owned by R9.

### Conversation and Message

- **At most one conversation per user.** A second thread is not created.
- **A conversation has exactly two parties**: one merchant and the
  administrator. There is no user-to-user messaging (Principle VI).
- **The sender of a message is either a merchant or an administrator, never
  both and never neither.** How that is represented is an unresolved product
  fact owned by R10; see below.

### ContactMessage

- **The submitted fields are exactly `name`, `phone`, and `body`** (Product
  Fact Clarifications). A fourth field is a product change.
- **A contact message reaches the administrator on the dedicated "Contact
  messages" administrator page** (ADR-028, 2026-10-03). Whether the
  administrator's response is recorded on it stays an unresolved fact owned
  by R11.

### AuditLog

- **Append-only.** No update, no delete, and no cascade from the entity it
  describes.
- **Every administrator operation writes one record**, at the moment the
  operation happens, naming the administrator, the action, the target, and the
  details.
- **The target is namespaced** in the `type:id` form the Product Register fixes,
  so one target is unambiguous across the ten modules.

### User

- **The mobile number is the sole account identifier.** It is stored in E.164
  form (+218…), normalized before comparison, and unique per account
  (ADR-030). No email address exists anywhere in the platform: no sign-up
  email, no login email, no transactional email.
- **OTP verification is required at sign-up.** Sign-in of a verified account
  requires no OTP (Product Scope; ADR-030).
- **The role is the only authority for what a user may do.** No one becomes an
  administrator through the public registration flow.
- **No user deletes their own account.** The Product Register forbids it and
  the Profile page offers no such control.
- **A user may delete a catalog they uploaded.** The cascade to that catalog's
  parts, to its bookmarks, and to its index entries is part of the delete, not
  a later cleanup.
- **Blocking a merchant does not remove their public contributions.** Their
  catalogs and the parts extracted from them stay visible, because the catalog
  is public and other merchants search it.
- **Deletion is soft** for users and catalogs; see Soft deletion below.

## Soft deletion

`Core-Project.txt` states that deletion is soft for files and users, and that
deleting a file withdraws its parts and its index entries. Three slices depend
on it — R4 (a merchant deletes a file they uploaded), R13 (an administrator
deletes a file or an account), and R15 (automatic deletion after 90 days) — and
none of them could state the rule without it. It was absent from the
constitution's Product Register, which meant the rule existed in the product
mirror and nowhere a feature could be held to. The register now carries it, and
this section is its statement.

Blocking is a separate operation and is **not** deletion. A blocked merchant
keeps every row; blocking only changes the account's state (see Unresolved fact
#7) and withdraws the account's access. Nothing cascades when an account is
blocked, because nothing is removed.

- **A soft-deleted row is retained, not erased.** It carries a deletion
  timestamp, and every read path filters it out.
- **A hard delete is not a merchant capability.** Only the retention job and an
  administrator operation remove rows for good.
- **Soft deletion is not a substitute for a cascade.** Deleting a catalog still
  withdraws its parts, their bookmarks, and their search-index entries; a
  soft-deleted part that remains searchable is a defect.

## Unresolved facts this model does not decide

Recorded rather than silently resolved, per the constitution's Unresolved
product facts rule. Each names the slice that must decide it and record the
answer in `docs/DECISIONS.md`. A slice MUST NOT decide one on its own.

**Read this table before planning.** The first four and row 6 are also carried
in the constitution's Unresolved product facts table, so a slice reading either
document sees the same questions with the same owners. The remaining rows exist
only in this table and in `ROADMAP.md` → Open data-model questions; they are
the facts that reached the product mirror without ever reaching the
constitution's register, which is why they were unbuildable before this
document existed. Row 5 was resolved 2026-10-03 by ADR-028 (a dedicated
administrator "Contact messages" page, owned by R13) and is kept struck-through
for traceability.

| # | Unresolved fact | Why it is not decided here | Decided in |
|---|---|---|---|
| 1 | How a message's sender is represented when the sender may be either a merchant or an administrator. | The register names one sender on a message, but the two roles are different principals and the representation is a schema decision, not a conceptual one. | R10 |
| 2 | Whether `Conversation` carries an administrator reference when every administrator account sees the same thread. | The thread is single and shared; whether the administrator side is a reference, a role, or absent is a schema decision. | R10 |
| 3 | Whether `expires_at` is the retention deadline or the supplier's printed expiry date. | Two product sources disagree; both readings are defensible. | R15 |
| 4 | Notification retention. | The product statement defers it. | R9 |
| 5 | ~~Whether a contact message becomes a conversation or is read in its own inbox.~~ Resolved 2026-10-03 by ADR-028: a dedicated administrator "Contact messages" page. | — | — |
| 6 | Whether an administrator is a distinct entity or a role on `User`. | The register treats administrators as a role on `User`, while the conversation and the audit record refer to an administrator as a party. | R13 |
| 7 | What state an account carries, and whether a blocked merchant is a state or a separate flag. The product mirror's identifier for it is `User.status`. | The Product Register's roles make blocking an administrator power, but no state is registered for it, so `block user` currently has nothing to write. | R1 |
| 8 | Whether the `auth` module owns any stored entity of its own, or whether an account's identity and credential data belong entirely to `users`. | Principle X lists `auth` as a module and Technology Standards fixes `packages/db/schema/auth.ts` as its schema file, yet no registered entity is owned by `auth`. Either the module owns a table that the register does not name, or the schema file is a peer of `users.ts` rather than the owner of one. R1 introduces both modules, so R1 is where this is answered. | R1 |
| 9 | The stored byte count and content type a catalog carries. The product mirror's identifiers for them are `Catalog.size` and `Catalog.mime_type`. | Both were stated only in the product mirror. They are validation facts (File Processing Overview step 1) as much as stored ones, so the slice that enforces validation is the slice that settles them. | R2 |
| 10 | Whether a part stores the page and the row it came from. The product mirror's identifiers for them are `Part.page` and `Part.row`. | Beyond the Glossary's list of a part's fields, so **Catalog data shape**. Deduplication compares file, page, and row whatever a part stores, so nothing in the pipeline forces the answer either way. | R3 |
| 11 | The state a contact message moves through, and whether the administrator's response to one is recorded on it. The product mirror's identifiers for them are `ContactMessage.status` and `ContactMessage.admin_note`. | The contact form is the only way a visitor reaches the administrator, and nothing registers what happens to the message afterwards. | R11 |

Rows 7 through 11 are field-level questions, not conceptual ones: the entity and
its owner are not in doubt, only what the entity carries. Each is decided by the
slice named, recorded as an ADR, and added to this document and the constitution's
register in the same change.

## What this document deliberately does not contain

- Column names, types, lengths, nullability, defaults, or indexes. Those are
  the owning module's schema file and the feature's `data-model.md`.
- API request and response shapes. Those are the feature's `contracts/`.
- Extraction, column-matching, and deduplication algorithms. Those are
  **Extraction algorithm**, a separate deferred area owned by R3.
- Search ranking and result ordering. Those are **Retrieval interface**, owned
  by R5.
- Permission resolution within a role. Those are **Authorization model**, owned
  by the first slice that implements it.
- Naming rules for tables, columns, files, and identifiers. Those are the
  constitution's Schema and Migration Control, and they are restated nowhere
  else.

## Change discipline

- A change to an entity, a relationship, or an invariant is a change to a
  registered product fact: it requires a constitution amendment to the Product
  Register, an ADR in `docs/DECISIONS.md`, and this document updated in the same
  change.
- A change to a column type or a constraint is a feature's business: it is
  recorded in that feature's `data-model.md` and applied by a migration under
  the constitution's Schema and Migration Control.
- The two MUST NOT be confused. The first is governance and is versioned; the
  second is implementation and is reviewed per feature.