import { expect, test } from "@playwright/test";

test("landing page shows title", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Healthcare Workforce Marketplace" })).toBeVisible();
});
