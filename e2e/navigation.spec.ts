import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate between login and register", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "เข้าสู่ระบบ" })).toBeVisible();

    // Go to register
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/\/register/);

    // Go back to login
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/\/login/);
  });

  test("should navigate from login to forgot password and back", async ({
    page,
  }) => {
    await page.goto("/login");

    // Go to forgot password
    await page.click('a[href="/forgot"]');
    await expect(page).toHaveURL(/\/forgot/);
    await expect(page.getByRole("heading", { name: "รีเซ็ตรหัสผ่าน" })).toBeVisible();

    // Go back to login
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/\/login/);
  });

  test("should load packages page", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.getByText("VIP แบบรายเดือน")).toBeVisible();
    await expect(page.getByText("VIP แบบรายปี")).toBeVisible();
  });
});
