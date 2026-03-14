import { expect, test } from "@playwright/test";

test("worker can sign up, sign out, and log in", async ({ page, context }) => {
  const id = Date.now();
  const email = `worker.${id}@gmail.com`;
  const password = `SecurePass!${id}`;

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByLabel("Account role").selectOption("healthcare_worker");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/.*\/profile/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Worker Profile" })).toBeVisible();

  await context.clearCookies();
  await page.goto("/profile");
  await expect(page).toHaveURL(/.*\/login/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/.*\/profile/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Worker Profile" })).toBeVisible();
});



