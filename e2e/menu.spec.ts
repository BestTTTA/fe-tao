import { test, expect } from "@playwright/test";

test.describe("Menu Page", () => {
  test("should display menu sections", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.getByText("การใช้งานทั่วไป")).toBeVisible();
    await expect(page.getByText("เกี่ยวกับ Tarot & Oracle")).toBeVisible();
  });

  test("should display general menu items", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.getByText("ข้อมูลส่วนตัว")).toBeVisible();
    await expect(page.getByText("ภาษาของระบบ")).toBeVisible();
    await expect(page.getByText("รหัสผ่าน")).toBeVisible();
  });

  test("should display about menu items", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.getByText("เกี่ยวกับเรา")).toBeVisible();
    await expect(page.getByText("ข้อตกลงในการใช้งาน")).toBeVisible();
    await expect(page.getByText("นโยบายความเป็นส่วนตัว")).toBeVisible();
    await expect(page.getByText("ติดต่อเรา")).toBeVisible();
    await expect(page.getByText("คำขอลบบัญชี")).toBeVisible();
  });

  test("should display logout button", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.getByText("ออกจากระบบ")).toBeVisible();
  });

  test("should open logout confirmation modal", async ({ page }) => {
    await page.goto("/menu");
    await page.getByText("ออกจากระบบ").click();
    await expect(
      page.getByText("ต้องการออกจากระบบใช่หรือไม่?")
    ).toBeVisible();
    await expect(page.getByText("ยกเลิก")).toBeVisible();
  });

  test("should open delete account confirmation modal", async ({ page }) => {
    await page.goto("/menu");
    await page.getByText("คำขอลบบัญชี").click();
    await expect(
      page.getByText("กรุณายืนยันการลบบัญชี")
    ).toBeVisible();
  });
});
