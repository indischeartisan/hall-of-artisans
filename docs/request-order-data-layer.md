# Request and Order Local Data Layer

## Current prototype

`src/features/orders/orderService.ts` owns five versioned local collections: requests, messages, activity, orders, and checkout selection. UI components call service boundaries rather than changing domain collections directly. Malformed JSON falls back safely.

Development fixtures are in `src/dev/fixtures` and seed only when `import.meta.env.DEV` is true. Normal production startup creates empty collections.

## Canonical workflow

`DRAFT_PREVIEW → SUBMITTED → UNDER_REVIEW → WAITING_FOR_REPLY ↔ UNDER_REVIEW → READY_FOR_APPROVAL → REVISION_REQUESTED → UNDER_REVIEW`

`READY_FOR_APPROVAL → READY_FOR_CHECKOUT → PAYMENT_PENDING → PAID → IN_PRODUCTION → SHIPPED → COMPLETED`

The source of truth, actor rules, cancellation, chat, and checkout availability are in `src/domain/workflow.ts`. `CANCELLED` is terminal. Payment confirmation is system/admin-only and production start is admin-only.

## Supabase replacement boundary

Replace service internals with a Supabase repository while preserving typed method behavior. Use submissions, request messages, append-only activity, orders, and order items. Ownership comes from `auth.uid()`, public numbers from database functions, and privileged mutations from permission-checked server operations.

## Immutability and migration

Preview records remain mutable/local. Submission deep-clones `CreationSubmissionSnapshot`; later source-draft edits cannot alter it. Order items copy the approved submission snapshot and stable submission ID, final price, and currency.

Local-to-cloud migration maps local client IDs to server UUIDs, is idempotent, preserves local copies until verified, and never silently deletes unsupported data.
