# Hall of Artisans — Supabase Backend Architecture

## 0. Locked frontend contract (20 July 2026)

Migration source of truth is `src/domain/workflow.ts` and `src/domain/creation.ts`; approved product decisions and permissions are in `docs/frontend-domain-decisions.md`.

Canonical workflow:

`DRAFT_PREVIEW → SUBMITTED → UNDER_REVIEW → WAITING_FOR_REPLY ↔ UNDER_REVIEW → READY_FOR_APPROVAL → REVISION_REQUESTED → UNDER_REVIEW`  
`READY_FOR_APPROVAL → READY_FOR_CHECKOUT → PAYMENT_PENDING → PAID → IN_PRODUCTION → SHIPPED → COMPLETED`

`CANCELLED` is terminal and preserved. Customers may cancel through `READY_FOR_CHECKOUT`; paid/in-production cancellation is administrative; shipped/completed cannot be cancelled. Actor-checked transitions use `customer`, `reviewer`, `admin`, and `system`. Payment confirmation is never a customer transition.

Preview is local-only and outside the review queue. Submission creates a stable ID and immutable schema-versioned snapshot. Both `artisan_bench` and `described` modes use one snapshot contract. Formula snapshots preserve material ID/name/layer/percentage; narrative snapshots preserve story, preferred/avoided notes, direction, and additional notes.

Orders contain one or more immutable items referencing submissions. One order uses exactly one currency. Each item has production/shipping status. Combined shipment is default; split shipment is represented for future use.

Authentication is verified email/password. Anonymous bench drafts remain local; cloud drafts, submission, My Orders, My Archive, and checkout require authentication. One verified account receives one permanent database-generated Artisan ID without initial manual approval. Reissue/name changes do not change it; suspension preserves history.

Roles are `customer`, `reviewer`, `admin`, `super_admin`. Data is public, customer-private, or internal. Chat is private to owner and authorized staff. Internal notes, costing, assignments, refunds, and admin audit fields never enter customer view models.

Development fixtures live under `src/dev/fixtures`; production startup does not seed them. Developer controls and mock provider confirmation require `import.meta.env.DEV`.

### Changelog

- Added `SUBMITTED`, `REVISION_REQUESTED`, and `PAID`.
- Separated preview from immutable submission.
- Locked actor-based transitions/cancellation and chat availability.
- Unified creation modes under one versioned snapshot.
- Locked multi-item, single-currency orders and item production state.
- Recorded authentication, Artisan ID, permissions, data boundaries, and fixture isolation.

Status: Phase 1 foundation implemented as versioned local migrations; live deployment and RLS integration tests remain pending.  
Scope: Phase 1 implements profiles, roles, Artisan IDs, helpers, trusted RPCs, and RLS. Remaining domain tables stay architectural proposals until later phases.

## Design principles

- `auth.users` is the only authentication identity source. Application-facing personal data lives in `public.profiles`.
- Internal records use UUID primary keys. Human-readable identifiers are database-generated and are never derived from client-side row counts.
- Authentication account, profile, Artisan ID, draft, submission, consultation, order, and archive entry remain separate concepts.
- Drafts are editable. Submission snapshots, order item snapshots, and archive snapshots are immutable historical records.
- Row Level Security (RLS) is enabled on every exposed application table. Frontend visibility is not authorization.
- The browser receives only the publishable key. A Supabase secret/service-role key is confined to trusted server or Edge Function environments because it bypasses RLS.
- Files live in Supabase Storage; database rows contain bucket/path metadata, never generated binary image data.
- Destructive deletion is avoided for transactional/history records. `deleted_at` provides soft deletion where preservation is required.
- Schema changes are delivered later as versioned migrations. SQL in this document is illustrative only.

## 1. Entity relationship overview

```text
auth.users (authentication identity)
    │ 1:1
    ▼
profiles ────────────────< user_roles >──────── roles/permissions (logical)
    │ 1:0..1                    │
    ▼                           └── authorizes admin operations
artisan_ids
    │
    ├── 1:N perfume_drafts ── 1:N perfume_submissions
    │                               │
    │                               ├── 0:N order_items >── N:1 orders
    │                               └── 0:N archive_entries
    │
    ├── 1:N consultations ─── 0:N orders
    └── 1:N orders

orders ── 1:N order_items
orders ── 0:N archive_entries

admin_activity_logs ── N:1 actor profile/auth user
                    └─ polymorphic target by target_table + target_id
```

Major relationship rules:

- A user has one profile; a profile may receive one active Artisan ID.
- A draft belongs to one user and optionally records the Artisan ID active at creation. Ownership is always anchored to `owner_user_id`.
- A submission belongs to its submitter and may reference its source draft, but carries an immutable JSON snapshot so later draft edits cannot alter it.
- A consultation belongs to a customer and may later produce an order.
- An order has one customer, zero or one source consultation, and one or more order items.
- An order item may reference a submission, but retains its own commercial/product snapshot.
- An archive entry may reference a submission/order for traceability, while its published content snapshot stands alone.
- Admin activity logs record privileged mutations without becoming the source of truth for the target entity.

## 2. Proposed database tables

All application tables use `created_at timestamptz not null default now()`. Mutable tables also use `updated_at timestamptz not null default now()` maintained by a common `before update` trigger. UUID defaults use `gen_random_uuid()`.

### `profiles`

Purpose: application profile corresponding one-to-one with an authenticated account.

| Column | Type | Null/default | Constraints/notes |
|---|---|---|---|
| `id` | `uuid` | not null | PK; FK `auth.users(id) on delete cascade` |
| `display_name` | `text` | not null | check trimmed length 1–120 |
| `email_contact` | `citext` | null | optional contact copy; auth email remains authoritative for login |
| `phone` | `text` | null | normalized where possible |
| `bio` | `text` | null | check length <= 2,000 |
| `country_code` | `char(2)` | null | uppercase ISO-3166-1 alpha-2 check |
| `portrait_bucket` | `text` | null | normally `artisan-portraits` |
| `portrait_path` | `text` | null | object path, not a public URL |
| `onboarding_status` | `text` | not null/default `incomplete` | check `incomplete, complete, suspended` |
| `created_at`, `updated_at` | `timestamptz` | not null/`now()` | audit timestamps |
| `deleted_at` | `timestamptz` | null | soft deletion/anonymization workflow |

Indexes: partial index on `onboarding_status where deleted_at is null`; optional unique lower-case contact email only if business rules require it. Do not duplicate authorization roles here.

### `artisan_ids`

Purpose: issued public Artisan identity, distinct from account/profile.

| Column | Type | Null/default | Constraints/notes |
|---|---|---|---|
| `id` | `uuid` | not null/UUID | PK |
| `user_id` | `uuid` | not null | FK `profiles(id) on delete restrict` |
| `public_id` | `text` | not null | unique; e.g. `HA-2026-0001` |
| `status` | `text` | not null/default `pending` | check `pending, active, suspended, revoked` |
| `issued_at` | `timestamptz` | null | set when activated |
| `expires_at` | `timestamptz` | null | optional future expiration |
| `card_bucket`, `card_path` | `text` | null | generated card storage reference |
| `profile_snapshot` | `jsonb` | null | issued-card display snapshot |
| `created_at`, `updated_at` | `timestamptz` | not null/`now()` | timestamps |
| `revoked_at` | `timestamptz` | null | historical revocation |

Constraints/indexes: unique `public_id`; partial unique `(user_id) where status in ('pending','active')`; indexes on `(user_id, status)` and `issued_at desc`. Historical revoked rows remain.

### `perfume_drafts`

Purpose: editable cloud draft compatible with local schema version 1.

| Column | Type | Null/default | Constraints/notes |
|---|---|---|---|
| `id` | `uuid` | not null/UUID | PK |
| `owner_user_id` | `uuid` | not null | FK `profiles(id) on delete restrict` |
| `artisan_id_id` | `uuid` | null | FK `artisan_ids(id) on delete set null` |
| `client_draft_id` | `text` | null | local UUID/fallback ID used for sync deduplication |
| `draft_name` | `text` | not null | check trimmed length 1–160 |
| `perfume_name` | `text` | null | check length <= 160 |
| `concentration` | `text` | not null | check against supported stable IDs, initially `edt, edp, extrait` |
| `formula` | `jsonb` | not null/default `'[]'` | formula item snapshots |
| `formula_metadata` | `jsonb` | not null/default `'{}'` | computed totals/profile/warnings |
| `fragrance_brief` | `jsonb` | null | generated brief snapshot |
| `story_card` | `jsonb` | null | serializable render data, not image bytes |
| `schema_version` | `integer` | not null/default `1` | check `> 0` |
| `status` | `text` | not null/default `draft` | check `draft, ready, archived` |
| `content_hash` | `text` | null | server-normalized SHA-256 for sync/conflict support |
| `client_updated_at` | `timestamptz` | null | last known local edit time |
| `created_at`, `updated_at` | `timestamptz` | not null/`now()` | timestamps |
| `deleted_at` | `timestamptz` | null | recoverable deletion |

Constraints/indexes: partial unique `(owner_user_id, client_draft_id) where client_draft_id is not null`; indexes `(owner_user_id, updated_at desc)`, `(owner_user_id, status)`, and partial active drafts. JSON validation should be performed by a controlled database function/Edge Function and progressively strengthened with JSON checks as the schema stabilizes.

### `perfume_submissions`

Purpose: immutable submission of a perfume brief for review.

| Column | Type | Null/default | Constraints/notes |
|---|---|---|---|
| `id` | `uuid` | not null/UUID | PK |
| `submission_number` | `text` | not null | unique public identifier |
| `owner_user_id` | `uuid` | not null | FK `profiles(id) on delete restrict` |
| `artisan_id_id` | `uuid` | null | FK `artisan_ids(id) on delete set null` |
| `source_draft_id` | `uuid` | null | FK `perfume_drafts(id) on delete set null` |
| `status` | `text` | not null/default `submitted` | controlled check |
| `draft_snapshot` | `jsonb` | not null | complete immutable perfume snapshot |
| `schema_version` | `integer` | not null | snapshot schema version |
| `submitted_at` | `timestamptz` | not null/`now()` | immutable |
| `reviewed_at`, `decided_at` | `timestamptz` | null | workflow timestamps |
| `review_notes` | `text` | null | admin/operator notes; not public by default |
| `created_at`, `updated_at` | `timestamptz` | not null/`now()` | status audit timestamps |
| `withdrawn_at` | `timestamptz` | null | withdrawal, not deletion |

Constraints/indexes: unique `submission_number`; indexes `(owner_user_id, submitted_at desc)`, `(status, submitted_at)`, `source_draft_id`. Block updates to `draft_snapshot`, `schema_version`, `owner_user_id`, and `submitted_at` with a trigger; only workflow fields change.

### `consultations`

Purpose: bespoke consultation requests and scheduling/workflow.

| Column | Type | Null/default | Constraints/notes |
|---|---|---|---|
| `id` | `uuid` | not null/UUID | PK |
| `consultation_number` | `text` | not null | unique database-generated public ID |
| `user_id` | `uuid` | not null | FK `profiles(id) on delete restrict` |
| `artisan_id_id` | `uuid` | null | FK `artisan_ids(id) on delete set null` |
| `status` | `text` | not null/default `requested` | controlled check |
| `requested_service` | `text` | not null | product/service code, not display copy |
| `brief` | `jsonb` | not null/default `'{}'` | intake answers with version field |
| `scheduled_start`, `scheduled_end` | `timestamptz` | null | check end > start |
| `timezone` | `text` | null | IANA timezone used when booking |
| `assigned_admin_user_id` | `uuid` | null | FK `profiles(id) on delete set null` |
| `internal_notes` | `text` | null | admin only |
| `created_at`, `updated_at` | `timestamptz` | not null/`now()` | timestamps |
| `cancelled_at`, `completed_at` | `timestamptz` | null | lifecycle timestamps |

Indexes: unique `consultation_number`; `(user_id, created_at desc)`, `(status, scheduled_start)`, `assigned_admin_user_id`.

### `orders`

Purpose: commercial transaction and fulfillment status container.

| Column | Type | Null/default | Constraints/notes |
|---|---|---|---|
| `id` | `uuid` | not null/UUID | PK |
| `order_number` | `text` | not null | unique database-generated ID |
| `user_id` | `uuid` | not null | FK `profiles(id) on delete restrict` |
| `artisan_id_id` | `uuid` | null | FK `artisan_ids(id) on delete set null` |
| `consultation_id` | `uuid` | null | FK `consultations(id) on delete set null` |
| `status` | `text` | not null/default `pending` | order status check |
| `currency` | `char(3)` | not null | uppercase ISO-4217 check |
| `subtotal_minor`, `discount_minor`, `tax_minor`, `shipping_minor`, `total_minor` | `bigint` | not null/default `0` | checks `>= 0`; minor currency units |
| `customer_snapshot` | `jsonb` | not null | immutable name/contact at order time |
| `billing_snapshot`, `shipping_snapshot` | `jsonb` | null | address snapshots |
| `payment_provider`, `payment_reference` | `text` | null | never card secrets |
| `tracking_number`, `tracking_url` | `text` | null | fulfillment details |
| `placed_at`, `paid_at`, `shipped_at`, `completed_at`, `cancelled_at` | `timestamptz` | null | lifecycle timestamps |
| `created_at`, `updated_at` | `timestamptz` | not null/`now()` | timestamps |

Constraints/indexes: unique `order_number`; optionally unique non-null `(payment_provider, payment_reference)`; checks `total_minor = subtotal_minor - discount_minor + tax_minor + shipping_minor` and discount <= subtotal; indexes `(user_id, created_at desc)`, `(status, updated_at)`, `consultation_id`.

### `order_items`

Purpose: immutable line items and perfume/product snapshots belonging to an order.

| Column | Type | Null/default | Constraints/notes |
|---|---|---|---|
| `id` | `uuid` | not null/UUID | PK |
| `order_id` | `uuid` | not null | FK `orders(id) on delete restrict` |
| `submission_id` | `uuid` | null | FK `perfume_submissions(id) on delete set null` |
| `line_number` | `smallint` | not null | unique per order; check > 0 |
| `item_type` | `text` | not null | check `bespoke_perfume, consultation, sample, other` |
| `title` | `text` | not null | historical display name |
| `quantity` | `integer` | not null/default `1` | check > 0 |
| `unit_price_minor`, `line_total_minor` | `bigint` | not null | checks >= 0 and multiplication consistency |
| `currency` | `char(3)` | not null | must match order currency (trigger) |
| `product_snapshot` | `jsonb` | not null | immutable commercial configuration |
| `perfume_snapshot` | `jsonb` | null | immutable formula/brief where applicable |
| `created_at`, `updated_at` | `timestamptz` | not null/`now()` | updated only for controlled operational metadata |

Constraints/indexes: unique `(order_id, line_number)`; indexes `order_id`, `submission_id`. Prevent changes to snapshot and pricing fields after order placement except through a privileged correction procedure that logs the action.

### `archive_entries`

Purpose: independently preserved, optionally public Hall Archive work.

| Column | Type | Null/default | Constraints/notes |
|---|---|---|---|
| `id` | `uuid` | not null/UUID | PK |
| `archive_number` | `text` | not null | unique public identifier |
| `owner_user_id` | `uuid` | null | FK `profiles(id) on delete set null`; nullable for anonymized/historic works |
| `artisan_id_id` | `uuid` | null | FK `artisan_ids(id) on delete set null` |
| `submission_id` | `uuid` | null | FK `perfume_submissions(id) on delete set null` |
| `order_id` | `uuid` | null | FK `orders(id) on delete set null` |
| `status` | `text` | not null/default `draft` | controlled check |
| `visibility` | `text` | not null/default `private` | check `private, unlisted, public` |
| `title` | `text` | not null | archive display title |
| `work_snapshot` | `jsonb` | not null | immutable historical perfume snapshot |
| `public_story` | `jsonb` | null | curated public-safe content, separate from private brief |
| `image_bucket`, `image_path` | `text` | null | published archive image reference |
| `schema_version` | `integer` | not null | snapshot schema |
| `published_at` | `timestamptz` | null | required when published |
| `created_at`, `updated_at` | `timestamptz` | not null/`now()` | timestamps |
| `retired_at` | `timestamptz` | null | remove from publication without erasing history |

Constraints/indexes: unique `archive_number`; check public/published entries have `published_at`; indexes `(visibility, status, published_at desc)`, `owner_user_id`, `submission_id`, `order_id`. Snapshot changes after approval require a new revision policy or privileged correction with audit log.

### `user_roles`

Purpose: authoritative application role assignments.

| Column | Type | Null/default | Constraints/notes |
|---|---|---|---|
| `id` | `uuid` | not null/UUID | PK |
| `user_id` | `uuid` | not null | FK `auth.users(id) on delete cascade` |
| `role` | `text` | not null | check `artisan, admin, super_admin`; visitor is absence of session/role |
| `assigned_by` | `uuid` | null | FK `auth.users(id) on delete set null`; null for bootstrap migration |
| `reason` | `text` | null | role assignment reason |
| `created_at`, `updated_at` | `timestamptz` | not null/`now()` | timestamps |
| `revoked_at` | `timestamptz` | null | preserves role history |

Constraints/indexes: partial unique `(user_id, role) where revoked_at is null`; indexes `(user_id) where revoked_at is null`, `(role) where revoked_at is null`. Only super admins or tightly scoped trusted functions can insert/revoke admin roles.

### `admin_activity_logs`

Purpose: append-only accountability for privileged actions.

| Column | Type | Null/default | Constraints/notes |
|---|---|---|---|
| `id` | `uuid` | not null/UUID | PK |
| `actor_user_id` | `uuid` | null | FK `auth.users(id) on delete set null`; null for system jobs |
| `actor_role` | `text` | not null | role snapshot at action time |
| `action` | `text` | not null | stable action code, e.g. `order.status_changed` |
| `target_table` | `text` | not null | allowlisted table name |
| `target_id` | `uuid` | null | target UUID where applicable |
| `before_data`, `after_data` | `jsonb` | null | redacted diffs; never tokens/payment secrets |
| `request_id` | `uuid` | null | correlation ID |
| `ip_hash` | `text` | null | optional privacy-preserving hash, subject to policy |
| `created_at` | `timestamptz` | not null/`now()` | no `updated_at`; append-only |

Indexes: `(created_at desc)`, `(actor_user_id, created_at desc)`, `(target_table, target_id, created_at desc)`, `request_id`. Deny browser inserts/updates/deletes; write through trusted functions/triggers. Define retention and redaction policies before production.

## 3. JSON versus relational data

Store fields relationally when they drive ownership, joins, authorization, uniqueness, filtering, sorting, reporting, or workflow: owner IDs, public identifiers, names used in lists, concentration, schema/status, timestamps, totals/prices, visibility, and references.

Use `jsonb` for versioned composite snapshots whose structure follows the perfume engine and must be preserved atomically:

```json
{
  "schemaVersion": 1,
  "perfumeName": "Example",
  "concentration": "edp",
  "formula": [
    { "materialId": "bergamot", "materialName": "Bergamot", "layer": "top", "percentage": 20 }
  ],
  "formulaMetadata": {},
  "fragranceBrief": {},
  "storyCard": {}
}
```

Editable `perfume_drafts.formula` should include `materialId`, `layer`, and `percentage`; adding `materialName` is recommended during sync. Every immutable submission/order/archive snapshot must include both the stable material ID and the material display name used at snapshot time. Historical rendering reads the stored name and computed results, never recomputes them from the current material catalog. A later catalog can rename or retire a material without altering old work.

Do not normalize formula lines into a separate table in phase one: the engine produces and consumes an atomic versioned document, formulas are small, and immutable snapshots matter more than cross-formula material analytics. If future analytics requires material-level aggregation, add a derived `submission_formula_materials` projection maintained from immutable snapshots; do not replace the authoritative snapshot.

## 4. Identifier strategy

- Internal IDs: `uuid default gen_random_uuid()` generated in Postgres. Client UUIDs remain synchronization identifiers, not authoritative server PKs.
- Artisan IDs: `HA-{YYYY}-{sequence padded to 4+}`.
- Archive numbers: `HAR-{YYYY}-{sequence padded to 6}`.
- Order numbers: `HO-{YYYYMM}-{sequence padded to 6}`.
- Submission numbers: `HS-{YYYY}-{sequence padded to 6}`.
- Consultation numbers: `HC-{YYYY}-{sequence padded to 6}`.

Use dedicated PostgreSQL sequences (global or per identifier family) and a `security definer` function with an empty fixed `search_path`. The function obtains `nextval`, formats the server date plus value, inserts the row, and returns the identifier. Sequences are concurrency-safe and guarantee uniqueness, not gaplessness; gaps after rollbacks are acceptable. Do not use `max(...) + 1`, client row counts, or a read-then-write counter. If legal/business policy demands gapless numbers, that is a separate serialized ledger requirement and must be reviewed for throughput and failure semantics.

## 5. Status models

Recommended controlled values:

- Draft: `draft`, `ready`, `archived` (`deleted_at` is separate).
- Submission: `submitted`, `under_review`, `changes_requested`, `accepted`, `rejected`, `withdrawn`.
- Consultation: `requested`, `confirmed`, `scheduled`, `in_progress`, `completed`, `cancelled`, `no_show`.
- Order: `pending`, `awaiting_payment`, `paid`, `reviewing_brief`, `formula_development`, `sample_preparation`, `revision`, `approved`, `production`, `shipped`, `completed`, `cancelled`.
- Archive entry: `draft`, `review`, `approved`, `published`, `retired` plus independent `visibility`.

Use `text` columns with named check constraints initially. This allows controlled additions through ordinary migrations without PostgreSQL enum removal/renaming friction. Enums give stronger reuse and compact semantics but status vocabularies are still product decisions and likely to evolve. Regardless of type, expose allowed transitions through database functions or trusted server logic; membership checks alone do not prevent an invalid transition such as `completed → paid`. Maintain transition tests and log privileged status changes.

## 6. Authentication and roles

- Visitor: unauthenticated `anon`; can read only explicitly public archive content.
- Artisan: authenticated account with a profile; may own drafts, submissions, consultations, and orders. Issued Artisan ID status is separate from role.
- Admin: operational access to assigned workflows according to explicit policies.
- Super admin: can assign/revoke roles and perform narrowly controlled security administration.

`user_roles` is authoritative. Do not store authorization in editable profile columns or user-controlled `raw_user_meta_data`. A Custom Access Token Auth Hook may project the effective role/permissions into JWT claims for efficient RLS checks. Policies must account for JWT staleness after role changes: use short-lived tokens/session refresh for ordinary access and a database lookup for highly sensitive actions such as role assignment. Role assignment happens only through a protected database function/Edge Function; users never insert their own `user_roles` rows.

## 7. Row Level Security plan

Enable and force RLS on all public application tables, revoke broad defaults, then grant only required operations to `anon`/`authenticated`. Index columns referenced by policies. Examples below are illustrative and require migration review.

```sql
-- Own profile
create policy profiles_select_own on public.profiles
for select to authenticated using (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Own active/history Artisan IDs (read-only to user)
create policy artisan_ids_select_own on public.artisan_ids
for select to authenticated using (user_id = (select auth.uid()));

-- Own drafts
create policy drafts_select_own on public.perfume_drafts
for select to authenticated using (owner_user_id = (select auth.uid()) and deleted_at is null);

create policy drafts_insert_own on public.perfume_drafts
for insert to authenticated with check (owner_user_id = (select auth.uid()));

create policy drafts_update_own on public.perfume_drafts
for update to authenticated
using (owner_user_id = (select auth.uid()) and deleted_at is null)
with check (owner_user_id = (select auth.uid()));

-- Public archive: return only a public-safe view in preference to the base row
create policy archive_public_read on public.archive_entries
for select to anon, authenticated
using (status = 'published' and visibility = 'public' and retired_at is null);
```

Policy intent by resource:

- Profiles: users read/update their row, excluding role/security fields because none exist there. Profile creation is via signup trigger or trusted function.
- Artisan IDs: owners read; only authorized staff issue, change status, or regenerate cards.
- Drafts: owners create/read/update/soft-delete. No cross-user access. Admins do not automatically see private drafts; access requires a documented support/review purpose, an explicit permission, and audit logging.
- Submissions: owners insert through a function that validates draft ownership and creates the immutable snapshot; owners read their submissions and may only perform allowed actions such as withdrawal. Admins review.
- Consultations/orders/order items: owners read their records. Customer writes are limited to intake or explicitly allowed fields/states. Prices, payment states, assignments, and fulfillment are server/admin controlled.
- Archive: public users read only public, published, non-retired entries—ideally via a `public_archive_entries` view exposing no private fields. Owners may read their private entries. Authorized admins curate.
- User roles: users may read their effective role if needed but cannot insert/update/delete. Only super admins use a protected role-management function. That function forbids self-elevation and records an admin activity log.
- Admin logs: admins may read only within policy; browser clients never write or alter logs.

An illustrative admin predicate can use a stable `security definer` function that validates an allowlisted permission from `user_roles`, with `search_path = ''`. A Custom Access Token claim may optimize lower-risk checks, but role-changing operations should verify current database state.

Service/secret-key operations run only in Edge Functions, backend jobs, CI migrations, or another trusted server. They must validate the caller, limit the operation, and write audit logs. Never expose the key in Vite environment variables (anything shipped to the browser is public).

## 8. Storage buckets

| Bucket | Access | Path convention | Types | Limit | Access rules |
|---|---|---|---|---:|---|
| `artisan-portraits` | private by default | `{user_uuid}/{portrait_uuid}.{ext}` | JPEG, PNG, WebP | 5 MB | owner read/write own prefix; admin access only for defined support/review; serve signed URLs. Decide later if portraits become public. |
| `artisan-id-cards` | private | `{user_uuid}/{artisan_id_uuid}/card-{version}.webp` | PNG, WebP, PDF | 10 MB | owner read; generation service/admin write; no arbitrary browser overwrite. |
| `story-cards` | private | `{user_uuid}/{draft_or_submission_uuid}/{asset_uuid}.png` | PNG, WebP | 15 MB | owner read/write for draft assets; submission assets become immutable; signed sharing URLs if needed. |
| `archive-images` | public for published assets | `{archive_uuid}/{asset_uuid}.{ext}` | JPEG, PNG, WebP | 15 MB | public download; admin/service write/delete only; never place private source assets here. |
| `case-attachments` | private | `{user_uuid}/{consultation_or_order_uuid}/{asset_uuid}.{ext}` | JPEG, PNG, WebP, PDF | 25 MB | owner access only when the referenced case belongs to them; assigned authorized staff access; signed URLs. Malware scanning/quarantine required before staff download. |

Bucket-level MIME and size restrictions complement, not replace, RLS on `storage.objects`. Policies validate bucket plus first path segment against `auth.uid()` and, for case files, validate referenced record ownership. Avoid relying on `owner_id` alone when a service creates files because service-created objects may have no end-user owner. File operations go through the Storage API; do not mutate the `storage` schema directly.

## 9. Local draft migration and synchronization

Source: `localStorage['hallOfArtisans.perfumeDrafts.v1']`, schema version 1.

1. Anonymous use continues locally. Each local draft keeps its current ID, timestamps, schema version, and a normalized content hash.
2. On first authenticated session, show a non-destructive migration offer with draft count; do not upload automatically without product/privacy approval.
3. Parse defensively. Preserve invalid/incompatible entries locally and report them; never silently delete them.
4. Convert each supported schema version through explicit pure migration steps (`v1 → v2`, etc.) before upload. Retain original data until confirmation.
5. Upsert through a sync endpoint/function using unique `(owner_user_id, client_draft_id)`. This prevents retry duplicates. Also compare normalized content hashes to suggest likely duplicates with different client IDs, but never auto-merge them.
6. Maintain a local mapping `{ clientDraftId, serverDraftId, lastSyncedHash, lastSyncedAt, serverUpdatedAt }` in a separate namespaced key.
7. Conflict detection compares local current hash, last-synced hash, and current server hash/version. If both local and server changed, create a user-visible conflict; default to preserving both copies until the user chooses.
8. Offline edits continue locally and are marked pending. Retry idempotently after connectivity/session recovery. Use optimistic concurrency (`expected updated_at` or revision number) so last-write-wins does not silently overwrite.
9. After successful synchronization, keep local drafts as an offline cache by default. Mark them synced; do not erase automatically.
10. Offer cleanup only after verifying server round-trip and only with explicit confirmation. Explain that cleanup removes device-local copies, not cloud drafts.

Add `revision integer not null default 1` to `perfume_drafts` if the implementation team prefers integer optimistic concurrency over timestamp comparison; this is recommended before sync implementation.

## 10. Admin dashboard data requirements

- Overview metrics: aggregate counts by date/status for profiles, issued Artisan IDs, submissions, consultations, orders, revenue minor units/currency, and published archive entries. Prefer secured aggregate views/materialized views; never query Auth secrets.
- Users and Artisan IDs: profile ID/display/contact status, onboarding state, Artisan public ID/status/issued date, and role summary. Separate PII permission from ordinary operations.
- Draft inspection: default metrics only (count/status/age), not formula/brief contents. Full draft access requires an explicit support/review permission, recorded reason, audit event, and product decision.
- Submissions: immutable snapshot, status, review assignment/notes, timestamps, source references.
- Consultations: customer, intake version, schedule/timezone, assignment, status, attachments, internal notes.
- Orders: totals/currency, payment reference/status, current fulfillment status, items/snapshots, shipping/tracking, and timestamps. Payment secrets remain at the payment provider.
- Hall Archive: curated title/story, visibility, publication state/date, source traceability, and image references.
- Status updates: allowed-transition lists, actor, reason, timestamp, and optimistic concurrency guard.
- Activity logging: actor, action, target, redacted before/after, request correlation, and export/retention controls.

The dashboard should use permission-scoped server operations. Sensitive list views should select explicit columns rather than `select *`.

## 11. Recommended implementation phases

1. **Supabase project and environment configuration**  
   Acceptance: separate development/staging/production projects; browser publishable URL/key documented; secret keys stored only in server secret managers; redirect origins and backup expectations reviewed.
2. **Database migrations**  
   Acceptance: versioned, repeatable migrations create tables/constraints/indexes/triggers; clean database deploy succeeds; rollback/forward-fix process documented; seed data contains no production PII.
3. **RLS and role security**  
   Acceptance: RLS enabled on all exposed tables; automated tests cover anon, owner, other user, admin, and super admin; self-admin escalation and cross-user draft access fail; secret-key boundaries documented.
4. **Authentication**  
   Acceptance: chosen sign-in methods work in staging; profile creation is idempotent; session/logout/recovery tested; no role is accepted from user metadata.
5. **Profile and Artisan ID**  
   Acceptance: owner profile CRUD respects column restrictions; public ID generation is concurrent-safe; card/portrait storage policies pass owner/other-user tests; issuance is audited.
6. **Draft cloud persistence**  
   Acceptance: typed v1 drafts round-trip without changing formula results; owner-only CRUD works; optimistic revision strategy selected; malformed payloads fail safely.
7. **Local-to-cloud synchronization**  
   Acceptance: migration is opt-in/non-destructive; retries do not duplicate; conflict scenarios preserve both versions; unsupported drafts remain local; cleanup requires confirmation.
8. **Submission**  
   Acceptance: submission snapshot is complete and immutable; source draft edits do not alter it; public number is generated server-side; owner/admin policies and transitions pass tests.
9. **Consultation and orders**  
   Acceptance: intake, scheduling, order creation, immutable line snapshots, money arithmetic, payment webhook idempotency, status transitions, attachment security, and owner visibility are tested.
10. **Hall Archive**  
    Acceptance: archive survives source deletion/anonymization policy; only curated public fields are anonymous-readable; retirement removes publication without deleting history; media rules work.
11. **Admin dashboard**  
    Acceptance: permission matrix is implemented server-side; sensitive draft access follows approved policy; every privileged mutation is audited; metrics reconcile with source tables; security review passes.

## 12. Risks and open product decisions

1. Is an Artisan ID issued automatically after profile completion, manually approved, or paid? Can one user have historical/reissued IDs?
2. Are profile portraits and Artisan ID cards public, unlisted, or always private?
3. Which draft fields, if any, may admins inspect, under what business purpose, and must owner consent be recorded?
4. Does submission lock the source draft, clone it, or allow continued editing? This design allows editing because the submission snapshot is immutable.
5. Can submissions be revised in place, or should each revision create a linked new submission/version?
6. What constitutes archive approval, who owns publication rights, and can an owner request unpublication/anonymization?
7. Does an order contain one bespoke perfume or multiple items? The proposed model supports multiple items.
8. Which currencies, taxes, discounts, deposits, refunds, and partial payments are required? A payment/refund transaction table may be justified later.
9. Are shipping addresses retained indefinitely, redacted after fulfillment, or governed by jurisdiction-specific retention?
10. Which consultation provider/calendar and timezone rules apply? Are rescheduling and no-show fees required?
11. Which attachments are permitted, how are they scanned, and what retention/deletion SLA applies?
12. Should local-to-cloud migration require explicit consent on every device or only first account login? Can multiple accounts use one browser profile?
13. What conflict UX is acceptable for offline edits, and is device-to-device real-time collaboration in scope?
14. Are public identifiers year/month scoped for presentation only, and are gaps acceptable? This design assumes gaps are acceptable.
15. What admin permission granularity is needed beyond `admin`/`super_admin` (reviewer, fulfillment, archive curator, support, finance)? Add permissions before dashboard implementation rather than expanding broad admin access.
16. Required audit-log retention, PII redaction, IP processing, export, and deletion policies need legal/privacy review.
17. Account deletion behavior must reconcile privacy obligations with order, submission, audit, and archive preservation; anonymization may be more appropriate than cascaded deletion.

## References

- [Supabase user-data guidance](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase RLS and RBAC custom claims](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase private and public bucket behavior](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase Storage ownership](https://supabase.com/docs/guides/storage/security/ownership)
- [Supabase Storage schema guidance](https://supabase.com/docs/guides/storage/schema/design)
