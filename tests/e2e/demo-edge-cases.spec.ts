import { expect, test, type Page } from "@playwright/test";

const DEMO = {
  workerEmail: "demo.worker2@clipboardhealth.dev",
  facilityEmail: "demo.facility@clipboardhealth.dev",
  password: "Demo@12345",
  shiftOpenId: "55555555-5555-4555-8555-555555555552",
  assignmentCompletedId: "77777777-7777-4777-8777-777777777771",
};

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(DEMO.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/.*\/profile/, { timeout: 30_000 });
}

test("worker edge cases show safe errors", async ({ page }) => {
  await signIn(page, DEMO.workerEmail);

  await page.goto("/applications");
  await page.getByPlaceholder("Shift ID").first().fill(DEMO.shiftOpenId);
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("Unable to apply for shift.")).toBeVisible();

  await page.goto("/reviews");
  await page.getByPlaceholder("Assignment ID").fill(DEMO.shiftOpenId);
  await page.getByPlaceholder("Reviewee User ID").fill("00000000-0000-0000-0000-000000000000");
  await page.getByRole("button", { name: "Submit Review" }).click();
  await expect(page.getByText("Unable to submit review.")).toBeVisible();
});

test("facility admin edge case clock action handles invalid assignment", async ({ page }) => {
  await signIn(page, DEMO.facilityEmail);

  await page.goto("/timesheets");
  await page.getByPlaceholder("Assignment ID").first().fill("00000000-0000-0000-0000-000000000000");
  await page.getByRole("button", { name: "Clock Out" }).click();
  await expect(page.getByText("Clock action failed.")).toBeVisible();

  await page.getByPlaceholder("Assignment ID").last().fill(DEMO.assignmentCompletedId);
  await expect(page.getByText(`Assignment: ${DEMO.assignmentCompletedId}`)).toBeVisible();
});
