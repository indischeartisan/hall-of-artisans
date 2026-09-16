# Backend inventory — Indische Artisan / The Hall of Artisans

**Audit scope:** static inspection of the application source, generated TypeScript types, and local `supabase/migrations` on 13 September 2026. This report made **no** database request that changes state, migration, data copy, or Auth-user move. The source code is the primary evidence; migrations describe the previous project and are not an instruction to apply them to the new project.

## Executive summary

There is one browser Supabase client (`src/lib/supabase.ts`) shared by Indische and Hall. Indische's current public shell does not query application tables. The Hall, `/admin`, and `/perfumer` do: they use direct PostgREST reads/writes plus RPCs under the end user's JWT. Therefore the new schema must be designed together with RLS and server-side transition functions; recreating tables alone will not make the Hall workflow work.

No current source subscription uses `channel()` / Postgres Changes. A historical Realtime migration exists, but Realtime is not a runtime dependency today.

## REQUIRED — active runtime contract

### Auth, identity, and roles

| Resource | Active columns / behaviour | Consumers |
| --- | --- | --- |
| `auth.users` | Email/password sign-up, sign-in, sign-out, session observation, reset-password and resend confirmation. User metadata: `display_name`, `specialty`, `scent_direction`, `scent_mood`, `artisan_style`. | `src/features/auth/authService.ts`, `src/contexts/AuthContext.tsx` |
| `profiles` | `id`, `display_name`, `preferred_locale`, `certificate_name`; admin also reads `id`, `display_name`. | Auth context, admin dashboard |
| `artisan_ids` | `id`, `user_id`, `public_id`, `display_name_snapshot`, `issued_at`, `status`; active-row semantics use `revoked_at is null`. | Auth context, admin dashboard, Artisan ID flow |
| `user_roles` | `user_id`, `role`, `revoked_at`; source roles are `customer`, `reviewer`, `admin`, `super_admin`. | Auth context, review/staff access guards |

Required RPCs: `complete_profile(new_display_name)` and `issue_artisan_id()`.

### Hall drafts and creation intake

| Resource | Active columns / contract | Consumers |
| --- | --- | --- |
| `creation_drafts` | `id`, `user_id`, `mode`, `schema_version`, `draft_name`, `perfume_name`, `status`, `payload` (JSON), `created_at`, `updated_at`. The JSON is versioned client draft content; it supports `artisan_bench` and `described` modes. | `src/services/draftRepository.ts`; Hall Create/Drafts |
| `review_requests` | Primary commission state. Reads `id`, owner/creation/request identifiers, assignment fields, `status`, fragrance/brief fields, region/currency/pricing/package fields, every workflow timestamp, JSON snapshots (`preview_snapshot`, `submission_snapshot`, `story_card_data`, `package_snapshot`, `artisan_review`), `updated_at`. | Customer project room, staff queue, admin, perfumer |
| `commission_packages` | `id`, `slug`, `name`, `description`, `price`, `currency`, `concentration`, `bottle_size`, `included_items`, `consultations_included`, `estimated_production`, `display_order`, `is_active`. | Package selection and legacy preview recovery |

Required RPCs: `create_review_preview(request_payload)`, `select_review_package(target_request_id, target_package_id)`, `submit_review_request(target_request_id)`, and `customer_transition_review_request(target_request_id, next_status, activity_label)`.

### Review, commission, payment, and correspondence

| Resource | Active columns / contract | Consumers |
| --- | --- | --- |
| `request_messages` | `id`, `request_id`, `sender_role`, `sender_name`, `message`, `created_at`, `read_at`. | Customer, reviewer, admin and perfumer workspaces |
| `request_activity` | `id`, `request_id`, `user_id`, `event_type`, `label`, `created_at`, `metadata` (JSON). | Customer/project and staff activity timelines |
| `customer_orders` | `id`, `user_id`, `order_number`, `amount`, `currency`, `payment_status`, `production_status`, `shipping_status`, `shipping_preference`, `tracking_number`, `checkout_details` (JSON), `created_at`, `updated_at`. | Checkout/project room, admin operations |
| `order_items` | `id`, `order_id`, `user_id`, `review_request_id`, `submission_id`, `submission_snapshot` (JSON), `creation_name`, `amount`, `currency`, `production_status`, `shipping_status`, `tracking_number`, `created_at`. | Project room and admin operations |
| `notifications` | `id`, `request_id`, `recipient_id`, `kind`, `title`, `detail`, `created_at`, `read_at`. | Customer notification panel |

Required RPCs: `staff_transition_review_request`, `send_customer_request_message`, `send_staff_request_message`, `mark_staff_request_messages_read`, `mark_notifications_read`, `create_order_checkout`, `admin_transition_order`, `list_active_reviewers`, `claim_review_request`, `assign_review_request`, and `get_assigned_customer_summaries`.

### Library, archive, and editorial operations

| Resource | Active columns / contract | Consumers |
| --- | --- | --- |
| `material_categories` | `id`, `slug`, `name`, `description`, `status`, `display_order`, timestamps and audit user IDs. | Hall Library and admin catalog |
| `materials` | Identity/category/description/status/order, `is_featured`, descriptive arrays/fields (`family`, `material_type`, `layers`, `moods`, `tags`, `best_used_for`, `pairs_well_with`, `avoid_if`), image/legacy IDs, sensory numeric fields, timestamps/audit IDs. | Hall Library and admin catalog |
| `archive_records` | `id`, `archive_number`, `slug`, `title`, `creator`, `moods`, `story`, `image_path`, `image_alt`, `owner_id`, `status`, `display_order`, `is_featured`, timestamps. Public list filters `status = 'active'`. | Hall Archive and admin catalog |
| `cms_entries` | `id`, `content_type`, `slug`, `locale`, `title`, `summary`, `content`, `seo`, `status` (`draft`/`published`/`archived`), timestamps, `created_by`, `updated_by`. | Admin content manager |

Required Storage buckets: `material-images` and `archive-images`; client admin services upload/remove objects and persist paths in the tables. Bucket access needs to be role-restricted, while public delivery depends on the chosen public/signed-URL model.

### Academy

Active Academy source uses full-row selects and nested relations, so the following data model is required if `/hall/academy` remains enabled:

- `academy_courses`, `academy_course_translations`
- `academy_modules`, `academy_module_translations`
- `academy_lessons`, `academy_lesson_translations`
- `academy_lesson_blocks`, `academy_lesson_block_translations`
- `academy_enrollments` (`user_id`, `course_id`, `status`, enrollment timestamps)
- `academy_lesson_progress` (`user_id`, `lesson_id`, `status`, `last_block_position`, `started_at`, `last_opened_at`, `completed_at`, timestamps), with uniqueness on `(user_id, lesson_id)` for upsert.

Required RPCs: `academy_enroll_in_free_course(target_course_slug)` and `academy_resolve_course_access(target_course_slug)`. Published course/module/lesson content is read by guests; enrolment and progress require an authenticated owner.

### Aftercare

| Resource | Active columns / contract | Consumers |
| --- | --- | --- |
| `aftercare_cases` | `id`, `review_request_id`, `user_id`, `assigned_reviewer_id`, `kind`, `status`, `subject`, `body`, `rating`, `linked_review_request_id`, `resolved_at`, timestamps. Kinds: `GRATITUDE`, `REVIEW`, `ISSUE`, `ADJUSTMENT`, `REORDER`; statuses: `OPEN`, `DISCUSSING`, `RESOLVED`. | Customer completed-project panel, perfumer workspace |
| `aftercare_messages` | `id`, `case_id`, `sender_role`, `sender_name`, `message`, `created_at`. | Customer/perfumer aftercare conversation |

Required RPCs: `create_aftercare_case`, `send_aftercare_message`, `resolve_aftercare_case`.

## Workflow status contract (REQUIRED)

The canonical status machine is `src/domain/workflow.ts` and must be enforced by RPCs, not by permitting arbitrary client `update` calls:

`DRAFT_PREVIEW → SUBMITTED → UNDER_REVIEW → CONSULTATION → READY_FOR_APPROVAL → (REVISION_REQUESTED → READY_FOR_APPROVAL | READY_FOR_PAYMENT) → PAYMENT_PENDING → PAID → IN_PRODUCTION → SHIPPED → COMPLETED`.

`CANCELLED` is allowed from preview through payment-ready, with actor restrictions. Customers can submit, approve/revise, start payment, and cancel only where the source state machine permits it; reviewers/admins own review transitions; admin/system own payment confirmation, production, shipment, and completion. Chat is disabled before consultation and after completion/cancellation. The operational groupings are Brief, Review, Consultation, Payment, Crafting, and Delivery.

## RLS and security assumptions to carry into the new design

1. The public browser holds only a publishable key and calls tables/RPCs directly. Every table above therefore needs RLS; no service-role key may enter the client bundle.
2. A customer may only read/write their own drafts, identity, enrolments/progress, requests, orders, messages, notifications, and aftercare cases. Ownership is consistently based on `auth.uid()` matching `user_id`/`recipient_id`.
3. `review_requests`, messages, activity, orders, aftercare, and staff dashboards need participant-or-staff visibility. Staff access must derive from non-revoked `user_roles`, not mutable client metadata.
4. Assignment, role-sensitive queue access, transitions, checkout creation, message send/read operations, and notification generation are business rules. Keep them in narrowly scoped, authenticated `security definer` RPCs with explicit actor and ownership checks, safe `search_path`, and least-privilege grants.
5. Admin catalog/CMS mutations and Storage object writes/deletes require `admin`/`super_admin`. Public archive and published Academy reads need deliberately separate read policies; drafts must never leak.
6. `artisan_ids` and `user_roles` are identity/access data: users may read their own active record, but role issuance/revocation and public-ID issuance should be server-controlled.

## LEGACY / UNUSED — do not port by default

- `docs/supabase-architecture.md` proposes names such as `perfume_drafts`, `perfume_submissions`, `consultations`, `orders`, and `archive_entries`. They are not the live source contract (which uses `creation_drafts`, `review_requests`, `customer_orders`, and `archive_records`). Treat this document as historical planning material only.
- The historical migration `enable_request_chat_realtime` is not backed by any current `channel()`/Postgres Changes code. Do not enable Realtime solely because that migration exists.
- `chat-attachments` bucket plus attachment-specific RPC migration are not called by current TypeScript source. Keep out of a first new schema unless attachment UI is deliberately reintroduced.
- Local draft fallback (`localStorage`) is a signed-out compatibility behavior, not a Supabase resource and not a server migration requirement.

## NEEDS REVIEW — decide before schema design

1. **Indische commerce:** `/shop`, `/cart`, `/checkout`, `/account` are currently presentation/placeholder routes. There is no active product, cart, payment, inventory, or customer-commerce table contract. Design those separately; do not infer a commerce schema from Hall `customer_orders`.
2. **CMS scope:** `cms_entries` is actively used by the admin UI, but no public Indische/Hall page currently consumes it. Confirm whether it belongs in the initial new backend.
3. **Academy publishing and paid access:** the source needs public/published content and enrolment/progress, but pricing/entitlement/payment ownership needs a product decision before recreating all policies.
4. **Notifications and aftercare:** both are active source dependencies but are absent from the older generated database type inventory. Confirm their intended launch scope and regenerate types from the new schema once decided.
5. **Payment implementation:** code expects `create_order_checkout`, `customer_orders.checkout_details`, and admin confirmation, but no payment-provider integration should be assumed. Decide provider, webhook boundary, idempotency strategy, currencies/tax, and whether checkout remains a Hall commission step.
6. **Data retention/audit:** JSON snapshots preserve submitted briefs/proposals; confirm legal retention, deletion, moderation, and audit-log requirements before porting the fields unchanged.
7. **Storage delivery:** decide whether archive/material images are public or signed, file limits, allowed MIME types, and path convention. Current source persists arbitrary table paths but does not establish a new-project policy.
8. **Supabase project linkage:** local `supabase/config.toml` still describes the prior local project identity. It is not evidence that the new project has schema, policies, buckets, or generated types applied.

## Evidence index

- Client: `src/lib/supabase.ts`; identity: `src/contexts/AuthContext.tsx`, `src/features/auth/authService.ts`.
- Hall data services: `src/services/draftRepository.ts`, `src/features/orders/orderService.ts`, `src/features/reviews/reviewWorkflowService.ts`, `src/features/aftercare/aftercareService.ts`.
- Staff/admin: `src/features/admin/*.ts`, `src/features/perfumer/perfumerService.ts`.
- Editorial and Academy: `src/features/archive`, `src/features/library`, `src/features/academy/services`.
- Previous implementation history only: `supabase/migrations/*.sql`, `src/types/database.types.ts`.

