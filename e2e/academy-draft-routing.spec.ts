import { expect, test } from "@playwright/test";

const draftUrl = "/academy/courses/introduction-to-the-world-of-perfumery/lessons/what-perfumery-really-is";

test("public draft URL stays exact and never falls back to a published lesson", async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}`));

  await page.goto(draftUrl);
  await expect(page).toHaveURL(new RegExp(`${draftUrl}$`));
  await expect(page.getByRole("heading", { name: /lesson is unavailable|lesson ini belum tersedia/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How to Smell a Perfume" })).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
