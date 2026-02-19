import { describe, it, expect, beforeEach, vi } from "vitest";
import { toPublicUrl } from "@/utils/toPublicUrl";

describe("toPublicUrl", () => {
  const MOCK_BASE = "https://abc.supabase.co";

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", MOCK_BASE);
  });

  // ── Null / falsy inputs ──────────────────────────────────────────────────
  it("TC-001: คืน null เมื่อ input เป็น undefined", () => {
    expect(toPublicUrl(undefined)).toBeNull();
  });

  it("TC-002: คืน null เมื่อ input เป็น null", () => {
    expect(toPublicUrl(null)).toBeNull();
  });

  it("TC-003: คืน null เมื่อ input เป็น string ว่าง", () => {
    expect(toPublicUrl("")).toBeNull();
  });

  // ── URL สมบูรณ์ (ไม่แก้ไข) ──────────────────────────────────────────────
  it("TC-004: คืน URL เดิมเมื่อเป็น https URL", () => {
    const url = "https://example.com/image.jpg";
    expect(toPublicUrl(url)).toBe(url);
  });

  it("TC-005: คืน URL เดิมเมื่อเป็น http URL", () => {
    const url = "http://cdn.example.com/img.png";
    expect(toPublicUrl(url)).toBe(url);
  });

  it("TC-006: คืน URL เดิมเมื่อเป็น HTTPS ตัวพิมพ์ใหญ่ (case-insensitive)", () => {
    const url = "HTTPS://example.com/img.webp";
    expect(toPublicUrl(url)).toBe(url);
  });

  // ── Path สัมพัทธ์ → ต่อกับ base URL ────────────────────────────────────
  it("TC-007: ต่อ base URL กับ path ที่ไม่มี /", () => {
    expect(toPublicUrl("storage/v1/object/public/avatars/img.jpg")).toBe(
      `${MOCK_BASE}/storage/v1/object/public/avatars/img.jpg`
    );
  });

  it("TC-008: ตัด / นำหน้า path ออกก่อนต่อ URL", () => {
    expect(toPublicUrl("/storage/v1/object/public/avatars/img.jpg")).toBe(
      `${MOCK_BASE}/storage/v1/object/public/avatars/img.jpg`
    );
  });

  it("TC-009: ตัด / หลาย ตัวนำหน้า path ออก", () => {
    expect(toPublicUrl("///avatars/img.jpg")).toBe(
      `${MOCK_BASE}/avatars/img.jpg`
    );
  });

  it("TC-010: ตัด / ท้าย base URL ออกก่อนต่อ path", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co/");
    expect(toPublicUrl("avatars/img.jpg")).toBe(
      "https://abc.supabase.co/avatars/img.jpg"
    );
  });

  it("TC-011: ใช้ string ว่างเป็น base URL เมื่อไม่มี env variable", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(toPublicUrl("avatars/img.jpg")).toBe("/avatars/img.jpg");
  });
});
