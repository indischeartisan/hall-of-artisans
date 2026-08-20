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
  const customerJourney = await server.ssrLoadModule("/src/features/orders/customerJourney.ts");
  const operationalStage = await server.ssrLoadModule("/src/domain/operationalStage.ts");
  const [perfumerSource, customerPageSource, proposalPanelSource, adminSource, staffServiceSource] = await Promise.all([
    readFile(new URL("../src/features/perfumer/PerfumerWorkspacePages.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/orders/OrderDetailPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/orders/components/ProposalDecisionPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/admin/AdminDashboardPages.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/admin/staffService.ts", import.meta.url), "utf8")
  ]);

  assert.equal(workflow.canTransition("CONSULTATION", "READY_FOR_APPROVAL", "reviewer"), true);
  assert.equal(workflow.canTransition("READY_FOR_APPROVAL", "READY_FOR_PAYMENT", "customer"), true);
  assert.equal(workflow.canTransition("READY_FOR_APPROVAL", "REVISION_REQUESTED", "customer"), true);
  assert.equal(workflow.canTransition("REVISION_REQUESTED", "READY_FOR_APPROVAL", "reviewer"), true);

  for (const status of ["CONSULTATION", "READY_FOR_APPROVAL", "REVISION_REQUESTED", "READY_FOR_PAYMENT", "PAYMENT_PENDING"]) {
    assert.equal(
      customerJourney.getCustomerJourneyStage(status),
      "consultation",
      `${status} must remain inside the combined Consultation journey stage`
    );
  }

  assert.ok(perfumerSource.includes('transition(request.id, "READY_FOR_APPROVAL"'), "Perfumer must be able to send a persisted proposal");
  assert.ok(perfumerSource.includes('proposalEditable = ["CONSULTATION", "REVISION_REQUESTED"]'), "Proposal editor must reopen for requested revisions");
  assert.ok(staffServiceSource.includes("proposal"), "Staff transition must persist the proposal payload");

  assert.ok(customerPageSource.includes('request.status==="READY_FOR_APPROVAL"||request.status==="REVISION_REQUESTED"'), "Customer must receive the proposal decision room");
  assert.ok(customerPageSource.includes('updateStatus(request.id,"READY_FOR_PAYMENT"'), "Approval must advance to payment readiness");
  assert.ok(customerPageSource.includes('updateStatus(request.id,"REVISION_REQUESTED"'), "Adjustment request must persist the revision state");
  assert.ok(proposalPanelSource.includes("Complete Proposal"), "Customer proposal must render the complete proposal instead of a summary-only card");
  assert.ok(proposalPanelSource.includes("Approve Creation"));
  assert.ok(proposalPanelSource.includes("Request Adjustment"));

  assert.ok(adminSource.includes("OPERATIONAL_STAGES.map"), "Admin metrics must use the canonical operational-stage registry");
  assert.deepEqual(operationalStage.OPERATIONAL_STAGE_BY_KEY.payment.statuses, ["READY_FOR_PAYMENT", "PAYMENT_PENDING"]);

  console.log("Role handoff contract passed: perfumer proposal, customer decision, revision loop, and admin payment handoff are connected.");
} finally {
  await server.close();
}
