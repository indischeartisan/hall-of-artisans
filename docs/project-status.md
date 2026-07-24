# Project status

Last reviewed: 24 July 2026

## Stable customer foundation

- Supabase authentication, profile, Artisan ID, roles, and row-level security
- Shared draft storage for Artisan Bench and Describe Your Creation
- One draft maps to at most one creation preview in My Orders
- Submitted snapshots remain independent from later draft deletion or editing
- Unified customer Project Room for preparation, review, approval, checkout, production, delivery, completion, and closed records
- My Orders grouped into active projects, creation previews, and closed projects
- Workflow transition rules centralized in `src/domain/workflow.ts`
- Automated workflow contract check available through `pnpm test`

## Intentional limitations

- There is no production payment gateway yet; checkout is a development flow.
- Reviewer and administrator actions do not yet have a dedicated protected interface.
- Academy and Library retain legacy browser scripts.
- Email notifications, production operations, shipping integrations, and analytics are not yet implemented.

## Admin Portal foundation

The protected operational dashboard now begins at `/admin` and provides:

1. Role-gated access for reviewer, admin, and super-admin roles.
2. Review queue grouped by submission, artisan review, customer decision, operations, and closed records.
3. Project detail with immutable submission snapshot, customer conversation, artisan proposal, final price, and validated status actions.
4. Admin-only operations for payment confirmation, production, shipping, and completion.
5. Activity history recording staff workflow changes.

No customer account is promoted automatically. A super administrator must explicitly grant the reviewer or administrator role before the workspace can expose customer projects.

After these operations are exercised with real staff accounts, add CMS modules inside the same Admin Portal for page copy, Academy lessons, Library entries, Hall Archive records, and reusable media. Operational workflow data and editorial CMS content should remain separate in both permissions and database tables.

## Editorial CMS foundation

- `cms_entries` stores version-ready editorial records for pages, Academy lessons, Library entries, and Hall Archive records.
- `cms_media` stores reusable media metadata while binary assets remain in Supabase Storage.
- Published content is publicly readable; drafts, archived records, and all editorial mutations are restricted to administrators.
- CMS content and operational order data remain separated by table and permission boundary.
- The `/admin` Content Manager supports creating, editing, publishing, and archiving editorial records.
- Reviewers remain restricted to Order Operations; only administrators can open Content Manager.
- The next CMS step is the reusable media library and connecting published records to public pages.

## Release gate for the Admin Portal

- [x] Create an administrator test account and verify protected access.
- [x] Verify staff read policies and RPC authorization boundaries.
- [x] Add an automated staff workspace contract check through `pnpm test`.
- Add browser tests for customer-to-reviewer handoff and reviewer-to-customer approval.
- Decide the first real payment and notification providers before enabling production checkout.
