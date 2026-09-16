# Clean migration plan — new Indische Artisan Supabase project

Target: `ydiuhyeoplegifxilcep` (the project at `https://ydiuhyeoplegifxilcep.supabase.co`).

This plan is intentionally **schema only**. It must not copy `auth.users`, profiles, drafts, requests, orders, Artisan IDs, assets, or any other old-project rows. The initial state of all application tables is empty.

## A. Existing migration classification

### A — required structural migrations

Apply their final schema/function intent to the clean baseline, in dependency order:

- `20260720000100_extensions_and_helpers.sql`
- `20260720000200_profiles_and_roles.sql`
- `20260720000300_artisan_ids.sql`
- `20260720000400_rls_and_role_management.sql`
- `20260720090746_harden_phase_1_security.sql`
- `20260722080229_move_role_helpers_to_private_schema.sql`
- `20260722093018_create_private_creation_drafts.sql`
- `20260723091346_limit_creation_drafts_authenticated_privileges.sql`
- `20260723160000_create_order_workflow.sql`
- `20260723170000_delete_draft_previews_atomically.sql`
- `20260724100000_fix_draft_preview_trigger_id_comparison.sql`
- `20260724111629_create_staff_review_workspace.sql`
- `20260724113000_enforce_submitted_draft_retention_and_cleanup_orphans.sql`
- `20260724130000_enforce_one_project_per_creation_draft.sql`
- `20260724134000_create_editorial_cms_foundation.sql`
- `20260724135000_optimize_editorial_cms_policies.sql`
- `20260724150000_create_material_catalog.sql`
- `20260724151000_index_material_category_audit_fks.sql`
- `20260725021936_create_material_image_storage.sql`
- `20260725025122_create_hall_archive_catalog.sql`
- `20260725042308_add_reviewer_assignment.sql`
- `20260725120844_revise_package_consultation_workflow.sql`
- `20260726052141_perfumer_customer_workspace.sql`
- `20260726052458_harden_perfumer_customer_workspace.sql`
- `20260726175222_create_aftercare_and_feedback.sql`
- `20260726182000_harden_aftercare_api.sql`
- `20260727010000_admin_order_fulfillment_actions.sql`
- `20260727020000_create_aftercare_followup_orders.sql`
- `20260727021000_allow_followups_from_preserved_drafts.sql`
- `20260803105729_add_academy_profile_foundation.sql`
- `20260803105730_create_academy_content_tables.sql`
- `20260803105732_create_academy_enrollment_and_progress.sql`
- `20260803105733_add_academy_indexes_and_triggers.sql`
- `20260803105734_secure_academy_and_add_access_functions.sql`
- `20260803110230_optimize_academy_rls_policies.sql`
- `20260810150000_restore_customer_proposal_approval.sql`
- `20260811050000_add_admin_payment_confirmation.sql`
- `20260826090000_add_compact_notifications_and_chat_limits.sql`
- `20260830010000_limit_customer_update_notifications.sql`

### B — legacy but retained for compatibility

- `20260722071755_restrict_admin_rpc_to_service_role.sql`: its restriction belongs in the clean security review, but the exact legacy helper is superseded by private role helpers.
- `20260725125052_backfill_legacy_order_packages.sql`: harmless on empty tables, but no backfill is needed in a fresh project. Retain only any schema constraint it creates after direct review.

### C — obsolete/superseded implementation steps

- `20260724100000_fix_draft_preview_trigger_id_comparison.sql` is a corrective patch, not an independent design. Its corrected trigger logic must appear once in the baseline.
- `20260725120844_revise_package_consultation_workflow.sql`, `20260810150000_restore_customer_proposal_approval.sql`, and `20260811050000_add_admin_payment_confirmation.sql` overwrite earlier workflow functions. Baseline uses the final definitions only.
- `20260724135000_optimize_editorial_cms_policies.sql`, `20260726052458_harden_perfumer_customer_workspace.sql`, `20260726182000_harden_aftercare_api.sql`, and `20260803110230_optimize_academy_rls_policies.sql` replace weaker prior policies. Baseline uses the final policies only.

### D — Realtime-only, explicitly skipped

- `20260810170000_enable_request_chat_realtime.sql`.

No current frontend source calls `channel()` or subscribes to Postgres Changes. The new project must not add tables to `supabase_realtime`, alter publications, or enable Realtime as part of this migration.

### E — seed/test/content data, explicitly skipped

- `20260724153000_seed_material_categories.sql`
- `20260724153100` through `20260724154600` material seed files
- `20260803105736_seed_free_academy_structure.sql`
- `20260803130849_publish_academy_limited_beta_lesson.sql`
- `20260806090000_import_academy_lesson_1_what_perfumery_really_is.sql`
- `20260806120000_revise_academy_lesson_1_complete_bilingual.sql`

## B. Clean baseline contents

The baseline must create empty versions of:

- identity/access: `profiles`, `user_roles`, `artisan_ids`;
- Hall creation: `creation_drafts`, `review_requests`, `request_messages`, `request_activity`, `commission_packages`, `customer_orders`, `order_items`, `notifications`;
- content: `cms_entries`, `material_categories`, `materials`, `archive_records`;
- Academy: course/module/lesson/block tables, translation tables, `academy_enrollments`, `academy_lesson_progress`;
- aftercare: `aftercare_cases`, `aftercare_messages`.

It must create only empty buckets `material-images` and `archive-images`, with their admin-only object policies. It must not create `chat-attachments` because no active client feature calls it.

## C. Required runtime RPC surface

- Identity: `complete_profile`, `issue_artisan_id`.
- Review/customer: `create_review_preview`, `select_review_package`, `submit_review_request`, `customer_transition_review_request`, `send_customer_request_message`, `create_order_checkout`, `mark_notifications_read`.
- Staff/admin/perfumer: `staff_transition_review_request`, `send_staff_request_message`, `mark_staff_request_messages_read`, `list_active_reviewers`, `claim_review_request`, `assign_review_request`, `get_assigned_customer_summaries`, `admin_transition_order`.
- Academy: `academy_enroll_in_free_course`, `academy_resolve_course_access`.
- Aftercare: `create_aftercare_case`, `send_aftercare_message`, `resolve_aftercare_case`.

All privileged functions require authenticated callers, an explicit actor/ownership check, safe `search_path`, and restrictive `EXECUTE` grants. Role checks originate in non-revoked `user_roles`—never `user_metadata`.

## D. RLS baseline requirements

- Enable RLS on every `public` application table.
- Owner records use `auth.uid()` against the appropriate `user_id`/`recipient_id` and include both `USING` and `WITH CHECK` on update.
- Staff/admin visibility is derived from `user_roles`; customer records never become generally readable by an authenticated user.
- Published Academy and active Archive reads have purpose-specific public policies. Unpublished/draft content is admin-only.
- Admin mutation of CMS/catalog/archive and Storage objects is role-restricted.
- Workflow mutation is function-owned: clients do not receive permissive direct updates to status, pricing, assignment, or orders.

## E. Application precondition and verification plan

The frontend already points to the new URL, but browser publishable credentials cannot execute DDL. Before applying a baseline, obtain access to the **correct project ref** in the Supabase management connection or an operator-run CLI session linked to `ydiuhyeoplegifxilcep`.

After application, verify with a new account only:

1. Email/OAuth sign-in, then `complete_profile` and `issue_artisan_id`.
2. Create, list, update, reopen, and delete a draft.
3. Create a review preview and select a package; do not create payment/order test data beyond schema validation.
4. Confirm Admin/Perfumer read paths receive authorized empty results rather than missing-table/function errors.
5. Inspect RLS/security advisors, table schema, functions, and bucket policies.
6. Confirm `auth.users`, `profiles`, `creation_drafts`, `review_requests`, and `customer_orders` all start empty.

