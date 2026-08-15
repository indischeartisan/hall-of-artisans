import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  const customerJourney = await server.ssrLoadModule("/src/features/orders/customerJourney.ts");
  const projectRoomPresentation = await server.ssrLoadModule("/src/features/orders/projectRoomPresentation.ts");
  const [appSource, headerSource, preparationSource] = await Promise.all([
    readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/GlobalHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/orders/components/CreationPreparation.tsx", import.meta.url), "utf8")
  ]);

  assert.ok(appSource.includes('path="/my-orders/:requestId"'), "Legacy My Orders bookmarks must remain valid");
  assert.ok(appSource.includes('path="/my-creations/:requestId"'), "My Creations alias must be available");
  assert.ok(headerSource.includes("My Creations"));
  assert.ok(headerSource.includes("/my-creations/latest"));
  assert.ok(preparationSource.includes("Send to Artisan"));
  assert.equal(preparationSource.includes("Send for Review"), false);

  assert.equal(workflow.WORKFLOW_STATUSES.length, 13, "All workflow statuses must be configured");
  assert.deepEqual(workflow.getAllowedTransitions("DRAFT_PREVIEW", "customer"), ["SUBMITTED", "CANCELLED"]);
  assert.equal(workflow.canTransition("SUBMITTED", "UNDER_REVIEW", "reviewer"), true);
  assert.equal(workflow.canTransition("SUBMITTED", "PAID", "customer"), false);
  assert.equal(workflow.canCustomerCancel("READY_FOR_PAYMENT"), true);
  assert.equal(workflow.canCustomerCancel("PAYMENT_PENDING"), false);
  assert.equal(workflow.isCheckoutAvailable("READY_FOR_PAYMENT"), true);
  assert.equal(workflow.canTransition("READY_FOR_PAYMENT", "PAYMENT_PENDING", "customer"), true);
  assert.equal(workflow.canTransition("PAYMENT_PENDING", "PAID", "admin"), true);
  assert.equal(workflow.canTransition("PAYMENT_PENDING", "PAID", "customer"), false);
  assert.equal(customerJourney.getCustomerJourneyStage("READY_FOR_PAYMENT"), "proposal");
  assert.equal(customerJourney.getCustomerJourneyStage("PAYMENT_PENDING"), "proposal");
  assert.equal(customerJourney.getCustomerJourneyStage("PAID"), "crafting");
  assert.equal(workflow.isCheckoutAvailable("IN_PRODUCTION"), false);
  assert.equal(workflow.isChatAvailable("UNDER_REVIEW"), false);
  assert.equal(workflow.isChatAvailable("CONSULTATION"), true);
  assert.equal(workflow.canTransition("READY_FOR_APPROVAL", "READY_FOR_PAYMENT", "customer"), true);
  assert.equal(workflow.canTransition("READY_FOR_APPROVAL", "REVISION_REQUESTED", "customer"), true);
  assert.equal(workflow.canTransition("REVISION_REQUESTED", "READY_FOR_APPROVAL", "reviewer"), true);
  assert.equal(workflow.isChatAvailable("CANCELLED"), false);

  const expectedRooms = {
    DRAFT_PREVIEW: "preparation",
    SUBMITTED: "review",
    UNDER_REVIEW: "review",
    CONSULTATION: "review",
    READY_FOR_APPROVAL: "review",
    REVISION_REQUESTED: "review",
    READY_FOR_PAYMENT: "fulfillment",
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

  assert.deepEqual(customerJourney.CUSTOMER_JOURNEY_STAGES.map((item) => item.key), [
    "brief", "review", "together", "proposal", "crafting", "delivery"
  ]);
  assert.equal(customerJourney.CUSTOMER_JOURNEY_STAGES[2].label, "Consultation");
  const expectedCustomerStages = {
    DRAFT_PREVIEW: "brief",
    SUBMITTED: "brief",
    UNDER_REVIEW: "review",
    CONSULTATION: "together",
    READY_FOR_APPROVAL: "proposal",
    REVISION_REQUESTED: "proposal",
    READY_FOR_PAYMENT: "proposal",
    PAYMENT_PENDING: "proposal",
    PAID: "crafting",
    IN_PRODUCTION: "crafting",
    SHIPPED: "delivery",
    COMPLETED: "delivery",
    CANCELLED: null
  };
  for (const status of workflow.WORKFLOW_STATUSES) {
    assert.equal(
      customerJourney.getCustomerJourneyStage(status),
      expectedCustomerStages[status],
      `${status} must map to the correct customer journey stage`
    );
  }
  assert.equal(customerJourney.getCustomerJourneyStageIndex("DRAFT_PREVIEW"), 0);
  assert.equal(customerJourney.getCustomerJourneyStageIndex("CONSULTATION"), 2);
  assert.equal(customerJourney.getCustomerJourneyStageIndex("COMPLETED"), 5);
  assert.equal(customerJourney.getCustomerJourneyStageIndex("CANCELLED"), -1);

  assert.deepEqual(projectRoomPresentation.SIMPLIFIED_PROJECT_STATUSES, [
    "UNDER_REVIEW", "CONSULTATION", "PAID", "IN_PRODUCTION", "SHIPPED", "COMPLETED"
  ]);
  for (const status of workflow.WORKFLOW_STATUSES) {
    assert.equal(
      projectRoomPresentation.usesSimplifiedProjectState(status),
      projectRoomPresentation.SIMPLIFIED_PROJECT_STATUSES.includes(status),
      `${status} must use the intended Phase 3 presentation`
    );
  }
  assert.equal(projectRoomPresentation.getProjectRoomPresentation("UNDER_REVIEW").primaryAction, null);
  assert.equal(projectRoomPresentation.getProjectRoomPresentation("CONSULTATION").primaryAction, "conversation");
  assert.equal(projectRoomPresentation.getProjectRoomPresentation("IN_PRODUCTION").primaryAction, "order-details");
  assert.equal(projectRoomPresentation.getProjectRoomPresentation("COMPLETED").primaryAction, "create-another");

  const grouped = grouping.groupOrderRequests([
    { id: "active", status: "SUBMITTED" },
    { id: "preview", status: "DRAFT_PREVIEW" },
    { id: "closed", status: "CANCELLED" }
  ]);
  assert.deepEqual(grouped.active.map((item) => item.id), ["active"]);
  assert.deepEqual(grouped.previews.map((item) => item.id), ["preview"]);
  assert.deepEqual(grouped.closed.map((item) => item.id), ["closed"]);

  console.log("Workflow contract check passed: 13 statuses, proposal decisions, Project Rooms, customer journey, and My Orders grouping.");
} finally {
  await server.close();
}
