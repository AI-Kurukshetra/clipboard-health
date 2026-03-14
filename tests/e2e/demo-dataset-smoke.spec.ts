import { expect, test, type Page } from "@playwright/test";

const DEMO = {
  workerEmail: "demo.worker1@clipboardhealth.dev",
  facilityEmail: "demo.facility@clipboardhealth.dev",
  password: "Demo@12345",
  shiftCompletedId: "55555555-5555-4555-8555-555555555551",
  shiftOpenId: "55555555-5555-4555-8555-555555555552",
  assignmentCompletedId: "77777777-7777-4777-8777-777777777771",
  conversationId: "88888888-8888-4888-8888-888888888881",
};

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/.*\/profile/, { timeout: 30_000 });
}

test("seeded worker can access all MVP modules with demo records", async ({ page }) => {
  test.setTimeout(60_000);
  await signIn(page, DEMO.workerEmail, DEMO.password);

  await page.goto("/shifts");
  await expect(page.getByRole("heading", { name: "Browse Shifts" })).toBeVisible();
  await expect(page.getByText("Night Shift - Med Surg")).toBeVisible();
  await expect(page.getByText("Day Shift - ICU")).toBeVisible();

  await page.goto("/applications");
  await expect(page.getByRole("heading", { name: "My Applications" })).toBeVisible();
  await expect(page.getByText(`Shift: ${DEMO.shiftCompletedId}`)).toBeVisible();

  await page.goto("/assignments");
  await expect(page.getByRole("heading", { name: "My Assignments" })).toBeVisible();
  await expect(page.getByText(`Shift: ${DEMO.shiftCompletedId}`)).toBeVisible();
  await expect(page.getByText("Status: completed")).toBeVisible();

  await page.goto("/messages");
  await expect(page.getByRole("heading", { name: "Conversations" })).toBeVisible();
  await page.getByRole("button", { name: DEMO.conversationId }).click();
  await expect(page.getByText("Please report to Med Surg front desk by 7:45 PM.")).toBeVisible();
  await expect(page.getByText("Confirmed. I will arrive 15 minutes early.")).toBeVisible();

  await page.goto("/timesheets");
  await expect(page.getByRole("heading", { name: "My Timesheets" })).toBeVisible();
  await expect(page.getByPlaceholder("Assignment ID").first()).toBeVisible();

  await page.goto("/reviews");
  await expect(page.getByRole("heading", { name: "Review History" })).toBeVisible();
  await expect(page.getByText(`Assignment: ${DEMO.assignmentCompletedId}`).first()).toBeVisible({ timeout: 15_000 });
});

test("seeded facility admin can access management modules", async ({ page }) => {
  test.setTimeout(60_000);
  await signIn(page, DEMO.facilityEmail, DEMO.password);

  await page.goto("/applications");
  await expect(page.getByRole("heading", { name: "Facility Applicant Review" })).toBeVisible();
  await page.getByPlaceholder("Shift ID").last().fill(DEMO.shiftOpenId);
  await expect(page.getByText("Status: applied")).toBeVisible();

  await page.goto("/assignments");
  await expect(page.getByRole("heading", { name: "Manage Assignments" })).toBeVisible();
  await page.getByPlaceholder("Shift ID").last().fill(DEMO.shiftCompletedId);
  await expect(page.getByText("Status: completed")).toBeVisible();

  await page.goto("/timesheets");
  await expect(page.getByRole("heading", { name: "Facility Timesheet Visibility" })).toBeVisible();
  await page.getByPlaceholder("Assignment ID").last().fill(DEMO.assignmentCompletedId);
  await expect(page.getByText(`Assignment: ${DEMO.assignmentCompletedId}`)).toBeVisible();

  await page.goto("/reviews");
  await expect(page.getByRole("heading", { name: "Review History" })).toBeVisible();
});

