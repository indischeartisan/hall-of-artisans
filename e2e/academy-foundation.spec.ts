import { expect, test } from "@playwright/test";

const publicRoutes = [
  ["/academy", "The Academy"],
  ["/academy/courses", "Courses"],
  ["/academy/courses/introduction-to-the-world-of-perfumery", "Introduction To The World Of Perfumery"],
  ["/academy/courses/introduction-to-the-world-of-perfumery/lessons/welcome-to-perfumery", "Welcome To Perfumery"]
] as const;

for (const [path, heading] of publicRoutes) {
  test(`${path} loads its Academy placeholder`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.locator(".vite-error-overlay, vite-error-overlay")).toHaveCount(0);
  });
}

test("My Academy preserves its return path for signed-out visitors", async ({ page }) => {
  await page.goto("/my-academy");
  await expect(page).toHaveURL(/\/artisan-login\?returnTo=%2Fmy-academy$/);
  await expect(page.getByRole("heading", { level: 1, name: "I Already Have an ID" })).toBeVisible();
});

test("Academy desktop navigation opens the canonical course route", async ({ page }) => {
  await page.goto("/academy");
  await page.getByRole("link", { name: "View courses" }).click();
  await expect(page).toHaveURL(/\/academy\/courses$/);
  await page.getByRole("link", { name: "Course Preview" }).click();
  await expect(page).toHaveURL(/\/academy\/courses\/introduction-to-the-world-of-perfumery$/);
});

test("Academy remains readable at Pixel 7 dimensions", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto("/academy/courses");
  await expect(page.locator(".academy-course-list")).toHaveCSS("grid-template-columns", "388px");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});

test("Academy does not load its retired global runtime", async ({ page }) => {
  await page.goto("/academy");
  const retiredAssets = await page.locator([
    'script[src*="academy-data.js"]',
    'script[src$="/academy.js"]',
    'link[href*="/assets/css/academy.css"]'
  ].join(",")).count();
  expect(retiredAssets).toBe(0);
  expect(await page.evaluate(() => "ACADEMY_DATA" in window)).toBe(false);
});
