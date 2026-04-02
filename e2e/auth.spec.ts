import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "เข้าสู่ระบบ" })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/login");
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click show password button
    await page.click('button[aria-label="แสดงรหัสผ่าน"]');
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click hide password button
    await page.click('button[aria-label="ซ่อนรหัสผ่าน"]');
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should have link to register page", async ({ page }) => {
    await page.goto("/login");
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/\/register/);
  });

  test("should have link to forgot password page", async ({ page }) => {
    await page.goto("/login");
    await page.click('a[href="/forgot"]');
    await expect(page).toHaveURL(/\/forgot/);
  });

  test("should require email and password fields", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(passwordInput).toHaveAttribute("required", "");
  });
});

test.describe("Register Page", () => {
  test("should display registration form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirm"]')).toBeVisible();
  });

  test("should have terms of service checkbox", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input#agreeTos')).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/register");
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click show password on first field
    const toggleButtons = page.locator('button[aria-label="แสดงรหัสผ่าน"]');
    await toggleButtons.first().click();
    await expect(passwordInput).toHaveAttribute("type", "text");
  });

  test("should have link back to login page", async ({ page }) => {
    await page.goto("/register");
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Forgot Password Page", () => {
  test("should display reset password form", async ({ page }) => {
    await page.goto("/forgot");
    await expect(page.getByRole("heading", { name: "รีเซ็ตรหัสผ่าน" })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.getByText("ส่งลิงก์รีเซ็ตรหัสผ่าน")).toBeVisible();
  });

  test("should have link back to login", async ({ page }) => {
    await page.goto("/forgot");
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/\/login/);
  });

  test("should show success message when sent=1", async ({ page }) => {
    await page.goto("/forgot?sent=1");
    await expect(
      page.getByText("ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว")
    ).toBeVisible();
  });
});
