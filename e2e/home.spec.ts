import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load and display header", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Tarot Oracle/);
    await expect(page.getByRole("button", { name: "Home" })).toBeVisible();
  });

  test("should display bottom tab footer with navigation", async ({ page }) => {
    await page.goto("/");
    // Bottom tab should have home and profile buttons
    await expect(page.getByText("หน้าแรก")).toBeVisible();
    await expect(page.getByText("โปรไฟล์")).toBeVisible();
  });

  test("should navigate to open card page via FAB button", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "เปิดไพ่" }).click();
    await expect(page).toHaveURL(/\/opencard/);
  });
});
