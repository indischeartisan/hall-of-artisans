import { expect, test } from "@playwright/test";
import { customerSignIn, staffSignIn } from "./helpers";

const live = {
  customerEmail: process.env.E2E_CUSTOMER_EMAIL,
  customerPassword: process.env.E2E_CUSTOMER_PASSWORD,
  requestId: process.env.E2E_CUSTOMER_REQUEST_ID,
  requestNumber: process.env.E2E_REQUEST_NUMBER,
  perfumerEmail: process.env.E2E_PERFUMER_EMAIL,
  perfumerPassword: process.env.E2E_PERFUMER_PASSWORD,
  adminEmail: process.env.E2E_ADMIN_EMAIL,
  adminPassword: process.env.E2E_ADMIN_PASSWORD
};

const configured = Object.values(live).every(Boolean);

test.describe("live customer-perfumer-admin handoff", () => {
  test.skip(!configured, "Provide the E2E role credentials and seeded request variables to run the live handoff suite.");

  test("the same seeded project is visible to the customer", async ({ page }) => {
    await customerSignIn(page, live.customerEmail!, live.customerPassword!);
    await page.goto(`/my-orders/${live.requestId}`);
    await expect(page.getByText(live.requestNumber!).first()).toBeVisible();
  });

  test("the assigned project is visible to the perfumer", async ({ page }) => {
    await staffSignIn(page, "perfumer", live.perfumerEmail!, live.perfumerPassword!);
    await page.goto("/perfumer/creations");
    await expect(page.getByText(live.requestNumber!).first()).toBeVisible();
  });

  test("the project is visible to operations", async ({ page }) => {
    await staffSignIn(page, "admin", live.adminEmail!, live.adminPassword!);
    await page.goto("/admin/creations");
    await expect(page.getByText(live.requestNumber!).first()).toBeVisible();
  });
});
