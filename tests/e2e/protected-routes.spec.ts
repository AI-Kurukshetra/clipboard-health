import { expect, test } from "@playwright/test";

test("protected dashboard-group routes redirect unauthenticated users", async ({ page }) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/.*\/login/);

  await page.goto("/shifts");
  await expect(page).toHaveURL(/.*\/login/);
});
