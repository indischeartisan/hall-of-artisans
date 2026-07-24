import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error"
});

try {
  const workflow = await server.ssrLoadModule("/src/domain/workflow.ts");
  const rooms = await server.ssrLoadModule("/src/features/orders/orderRoom.ts");
  const grouping = await server.ssrLoadModule("/src/features/orders/orderGrouping.ts");

  assert.equal(workflow.WORKFLOW_STATUSES.length, 13, "All workflow statuses must be configured");
  assert.deepEqual(workflow.getAllowedTransitions("DRAFT_PREVIEW", "customer"), ["SUBMITTED", "CANCELLED"]);
  assert.equal(workflow.canTransition("SUBMITTED", "UNDER_REVIEW", "reviewer"), true);
  assert.equal(workflow.canTransition("SUBMITTED", "PAID", "customer"), false);
  assert.equal(workflow.canCustomerCancel("READY_FOR_CHECKOUT"), true);
  assert.equal(workflow.canCustomerCancel("PAYMENT_PENDING"), false);
  assert.equal(workflow.isCheckoutAvailable("READY_FOR_CHECKOUT"), true);
  assert.equal(workflow.isCheckoutAvailable("IN_PRODUCTION"), false);
  assert.equal(workflow.isChatAvailable("UNDER_REVIEW"), true);
  assert.equal(workflow.isChatAvailable("CANCELLED"), false);

  const expectedRooms = {
    DRAFT_PREVIEW: "preparation",
    SUBMITTED: "review",
    UNDER_REVIEW: "review",
    WAITING_FOR_REPLY: "review",
    REVISION_REQUESTED: "review",
    READY_FOR_APPROVAL: "approval",
    READY_FOR_CHECKOUT: "fulfillment",
    PAYMENT_PENDING: "fulfillment",
    PAID: "fulfillment",
    IN_PRODUCTION: "fulfillment",
    SHIPPED: "fulfillment",
    COMPLETED: "fulfillment",
    CANCELLED: "closed"
  };
  for (const status of workflow.WORKFLOW_STATUSES) {
    assert.equal(rooms.getOrderRoom(status), expectedRooms[status], `${status} must open the correct Project Room`);
  }

  const grouped = grouping.groupOrderRequests([
    { id: "active", status: "SUBMITTED" },
    { id: "preview", status: "DRAFT_PREVIEW" },
    { id: "closed", status: "CANCELLED" }
  ]);
  assert.deepEqual(grouped.active.map((item) => item.id), ["active"]);
  assert.deepEqual(grouped.previews.map((item) => item.id), ["preview"]);
  assert.deepEqual(grouped.closed.map((item) => item.id), ["closed"]);

  console.log("Workflow contract check passed: 13 statuses, Project Rooms, and My Orders grouping.");
} finally {
  await server.close();
}
