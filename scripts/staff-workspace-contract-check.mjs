import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(
  new URL("../supabase/migrations/20260725080000_revise_package_consultation_workflow.sql", import.meta.url),
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
  "result.status='UNDER_REVIEW' and next_status='CONSULTATION'",
  "result.status='CONSULTATION' and next_status='READY_FOR_PAYMENT'"
];

const adminTransitions = [
  "result.status = 'PAYMENT_PENDING' and next_status = 'PAID'",
  "result.status = 'PAID' and next_status = 'IN_PRODUCTION'",
  "result.status = 'IN_PRODUCTION' and next_status = 'SHIPPED'",
  "result.status = 'SHIPPED' and next_status = 'COMPLETED'"
];

for (const transition of reviewerTransitions) assert.ok(migration.replaceAll(" ", "").includes(transition.replaceAll(" ", "")));
for (const transition of adminTransitions) {
  assert.ok(migration.replaceAll(" ", "").includes(`actor_is_admin and ${transition}`.replaceAll(" ", "")), `Admin-only transition must remain protected: ${transition}`);
}

assert.ok(migration.includes("Conversation opens when consultation begins"));
assert.ok(migration.includes("Message must contain 1 to 5000 characters"));

console.log("Staff workspace contract check passed: role guards, RPC security, and workflow boundaries.");
