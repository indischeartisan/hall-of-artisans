import { expect, test } from "@playwright/test";
import { consoleErrors, expectHealthyPage } from "./helpers";

test("development Project Room renders the payment and delivery phase", async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto("/my-orders/morning-tea-garden-demo?dev=1");
  await expect(page.getByRole("heading", { level: 1, name: /ready to begin production/i })).toBeVisible();
  await expect(page.getByText("Morning Tea Garden").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue to Payment/i })).toBeVisible();
  await expect(page.getByText("Project Activity")).toBeVisible();
  await expectHealthyPage(page, errors);
});

test("anonymous visitors cannot enter the Admin Workspace", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Sign in to enter the Admin Workspace." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Admin Sign In" })).toBeVisible();
});

test("anonymous visitors cannot enter the Perfumer Workspace", async ({ page }) => {
  await page.goto("/perfumer");
  await expect(page.getByRole("heading", { name: "Perfumer access is required." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Perfumer Sign In" })).toBeVisible();
});

test.fixme("proposal approval and revision are persisted before checkout", async () => {
  // ApprovalRoom exists, but READY_FOR_PAYMENT currently renders FulfillmentRoom.
  // Enable this test after a persisted proposal/approval state is added to the workflow.
});
