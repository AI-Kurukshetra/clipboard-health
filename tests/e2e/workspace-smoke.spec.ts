import { expect, test } from "@playwright/test";

test("workspace pages render section titles", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
});
