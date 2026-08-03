import { expect, type Page } from "@playwright/test";

export const consoleErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

export async function expectHealthyPage(page: Page, errors: string[]) {
  await expect(page.locator("body")).not.toBeEmpty();
  await expect(page.locator(".vite-error-overlay, [data-nextjs-dialog], #webpack-dev-server-client-overlay")).toHaveCount(0);
  expect(errors).toEqual([]);
}

export async function customerSignIn(page: Page, email: string, password: string) {
  await page.goto("/artisan-login");
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Open My Artisan ID" }).click();
  await expect(page).toHaveURL(/\/my-artisan-id$/);
}

export async function staffSignIn(page: Page, kind: "admin" | "perfumer", email: string, password: string) {
  await page.goto(`/${kind}/login`);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.locator(".staff-login-submit").click();
  await expect(page).toHaveURL(new RegExp(`/${kind}/?$`));
}
