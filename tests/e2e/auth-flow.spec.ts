import { expect, test } from "@playwright/test";

function uniqueCredentials(prefix: string) {
  const id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  return {
    email: `${prefix}.${id}@gmail.com`,
    password: `SecurePass!${Date.now()}`,
  };
}

test("worker can sign up, save profile, logout, and sign in again", async ({ page }) => {
  test.setTimeout(60_000);
  const creds = uniqueCredentials("worker");

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByLabel("Account role").selectOption("healthcare_worker");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/.*\/profile/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Worker Profile" })).toBeVisible();

  const workerSection = page.locator("section", {
    has: page.getByRole("heading", { name: "Worker Profile" }),
  });

  await workerSection.getByPlaceholder("Full name").fill("Worker Test");
  await workerSection.getByPlaceholder("Phone").fill("1234567890");
  await workerSection.getByPlaceholder("Location").fill("Ahmedabad");
  await workerSection.getByPlaceholder("Specialty").fill("CNA");
  await workerSection.getByPlaceholder("Years of experience").fill("3");
  await workerSection.getByPlaceholder("Bio").fill("Reliable worker profile");
  await workerSection.getByRole("button", { name: "Save Worker Profile" }).click();

  await expect(page).toHaveURL(/.*\/shifts/, { timeout: 30_000 });

  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/.*\/login/, { timeout: 30_000 });

  await page.goto("/profile");
  await expect(page).toHaveURL(/.*\/login/);

  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/.*\/profile/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Worker Profile" })).toBeVisible();
});

test("facility admin can sign up, save profile, and redirect to applications", async ({ page }) => {
  test.setTimeout(60_000);
  const creds = uniqueCredentials("facility");

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByLabel("Account role").selectOption("facility_admin");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/.*\/profile/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Facility Profile" })).toBeVisible();

  const facilitySection = page.locator("section", {
    has: page.getByRole("heading", { name: "Facility Profile" }),
  });

  await facilitySection.getByPlaceholder("Contact name").fill("Facility Admin");
  await facilitySection.getByPlaceholder("Phone").fill("1234567890");
  await facilitySection.getByPlaceholder("Organization name").fill("Care Center");
  await facilitySection.getByRole("button", { name: "Save Facility Profile" }).click();

  await expect(page).toHaveURL(/.*\/applications/, { timeout: 30_000 });
});
