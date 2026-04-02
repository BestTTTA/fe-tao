import { test, expect } from "@playwright/test";

test.describe("Responsive - Mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("home page should fit mobile viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Home" })).toBeVisible();
    // Content should not overflow horizontally
    const body = page.locator("body");
    const box = await body.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(390);
  });

  test("login page should be usable on mobile", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Fill in form fields
    await emailInput.fill("test@example.com");
    await passwordInput.fill("TestPassword123!");
    await expect(emailInput).toHaveValue("test@example.com");
    await expect(passwordInput).toHaveValue("TestPassword123!");
  });

  test("register page should be scrollable on mobile", async ({ page }) => {
    await page.goto("/register");
    // All form fields should be accessible by scrolling
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await page.locator('input[name="confirm"]').scrollIntoViewIfNeeded();
    await expect(page.locator('input[name="confirm"]')).toBeVisible();
  });
});

test.describe("Responsive - Desktop", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("home page should render on desktop", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Home" })).toBeVisible();
  });

  test("login page should be centered on desktop", async ({ page }) => {
    await page.goto("/login");
    const container = page.locator(".max-w-md").first();
    await expect(container).toBeVisible();
  });
});
