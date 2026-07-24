import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(
  new URL("../supabase/migrations/20260724111629_create_staff_review_workspace.sql", import.meta.url),
  "utf8"
);

const requiredGuards = [
  "not private.is_reviewer_or_admin()",
  "actor_is_admin boolean := private.is_admin()",
  "security definer",
  "set search_path = ''",
  "revoke all on function public.staff_transition_review_request",
  "revoke all on function public.send_staff_request_message"
];

for (const guard of requiredGuards) {
  assert.ok(migration.includes(guard), `Staff migration must retain guard: ${guard}`);
}

const reviewerTransitions = [
  "result.status = 'SUBMITTED' and next_status = 'UNDER_REVIEW'",
  "result.status = 'UNDER_REVIEW' and next_status in ('WAITING_FOR_REPLY', 'READY_FOR_APPROVAL')",
  "result.status = 'REVISION_REQUESTED' and next_status = 'UNDER_REVIEW'"
];

const adminTransitions = [
  "result.status = 'PAYMENT_PENDING' and next_status = 'PAID'",
  "result.status = 'PAID' and next_status = 'IN_PRODUCTION'",
  "result.status = 'IN_PRODUCTION' and next_status = 'SHIPPED'",
  "result.status = 'SHIPPED' and next_status = 'COMPLETED'"
];

for (const transition of reviewerTransitions) assert.ok(migration.includes(transition));
for (const transition of adminTransitions) {
  assert.ok(migration.includes(`actor_is_admin and ${transition}`), `Admin-only transition must remain protected: ${transition}`);
}

assert.ok(migration.includes("A structured artisan proposal is required"));
assert.ok(migration.includes("Message must contain 1 to 5000 characters"));

console.log("Staff workspace contract check passed: role guards, RPC security, and workflow boundaries.");
