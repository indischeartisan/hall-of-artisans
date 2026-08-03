import { expect, test } from "@playwright/test";
import { consoleErrors, expectHealthyPage } from "./helpers";

test("Bespoke Atelier sends visitors to both active creation methods", async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto("/bespoke-atelier");

  await expect(page.getByRole("heading", { level: 1, name: "Bespoke Atelier" })).toBeVisible();
  await expect(page.locator(".bespoke-method-card")).toHaveCount(2);
  await expect(page.getByRole("link", { name: /Describe My Creation/ })).toHaveAttribute("href", "/describe-your-creation");
  await expect(page.getByRole("link", { name: /Open Artisan Bench/ })).toHaveAttribute("href", "/artisan-bench");
  await expect(page.locator(".bespoke-timeline li")).toHaveCount(4);
  await expect(page.locator("body")).not.toContainText("atelier@hallofartisans.example");
  await expect(page.locator("body")).not.toContainText("Story Mode");
  await expectHealthyPage(page, errors);
});

test("Chamber of Creation opens Describe Your Creation", async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto("/chamber-of-creation");
  await page.getByRole("link", { name: "Describe Your Creation" }).click();
  await expect(page).toHaveURL(/\/describe-your-creation$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Describe Your Creation/i);
  await expectHealthyPage(page, errors);
});

test("Chamber of Creation opens Artisan Bench", async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto("/chamber-of-creation");
  await page.getByRole("link", { name: "Make Your Perfume" }).click();
  await expect(page).toHaveURL(/\/artisan-bench$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectHealthyPage(page, errors);
});

test("public creation pages do not overflow the viewport", async ({ page }) => {
  for (const path of ["/bespoke-atelier", "/chamber-of-creation", "/describe-your-creation", "/artisan-bench"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, `${path} should not overflow horizontally`).toBe(false);
  }
});
