import { expect, test } from "@playwright/test";

const smokeRoutes = [
  "/academy",
  "/academy/courses",
  "/my-academy",
  "/library",
  "/hall-archive",
  "/admin"
] as const;

for (const route of smokeRoutes) {
  test(`${route} renders without browser errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator("body")).not.toHaveText("");
    await expect(page.locator(".vite-error-overlay, vite-error-overlay")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
