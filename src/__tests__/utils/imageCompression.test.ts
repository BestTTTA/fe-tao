import { describe, it, expect } from "vitest";
import { isValidImageType, isValidFileSize } from "@/utils/imageCompression";

/** Helper: สร้าง File mock แบบง่าย */
function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

// ────────────────────────────────────────────────────────────────────────────
// isValidImageType
// ────────────────────────────────────────────────────────────────────────────
describe("isValidImageType", () => {
  // ── valid types ──────────────────────────────────────────────────────────
  it("TC-012: ยอมรับ image/jpeg", () => {
    expect(isValidImageType(makeFile("a.jpg", "image/jpeg", 100))).toBe(true);
  });

  it("TC-013: ยอมรับ image/jpg", () => {
    expect(isValidImageType(makeFile("a.jpg", "image/jpg", 100))).toBe(true);
  });

  it("TC-014: ยอมรับ image/png", () => {
    expect(isValidImageType(makeFile("a.png", "image/png", 100))).toBe(true);
  });

  it("TC-015: ยอมรับ image/gif", () => {
    expect(isValidImageType(makeFile("a.gif", "image/gif", 100))).toBe(true);
  });

  it("TC-016: ยอมรับ image/webp", () => {
    expect(isValidImageType(makeFile("a.webp", "image/webp", 100))).toBe(true);
  });

  it("TC-017: ยอมรับ image/bmp", () => {
    expect(isValidImageType(makeFile("a.bmp", "image/bmp", 100))).toBe(true);
  });

  it("TC-018: ยอมรับ image/svg+xml", () => {
    expect(isValidImageType(makeFile("a.svg", "image/svg+xml", 100))).toBe(
      true
    );
  });

  // ── invalid types ────────────────────────────────────────────────────────
  it("TC-019: ปฏิเสธ application/pdf", () => {
    expect(isValidImageType(makeFile("a.pdf", "application/pdf", 100))).toBe(
      false
    );
  });

  it("TC-020: ปฏิเสธ video/mp4", () => {
    expect(isValidImageType(makeFile("a.mp4", "video/mp4", 100))).toBe(false);
  });

  it("TC-021: ปฏิเสธ text/plain", () => {
    expect(isValidImageType(makeFile("a.txt", "text/plain", 100))).toBe(false);
  });

  it("TC-022: ปฏิเสธ type ว่าง", () => {
    expect(isValidImageType(makeFile("a", "", 100))).toBe(false);
  });

  it("TC-023: ปฏิเสธ application/octet-stream", () => {
    expect(
      isValidImageType(makeFile("a.bin", "application/octet-stream", 100))
    ).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// isValidFileSize
// ────────────────────────────────────────────────────────────────────────────
describe("isValidFileSize", () => {
  const MB = 1024 * 1024;

  it("TC-024: ยอมรับไฟล์ที่เล็กกว่า maxSizeMB", () => {
    const file = makeFile("a.jpg", "image/jpeg", 0.5 * MB); // 0.5 MB
    expect(isValidFileSize(file, 1)).toBe(true);
  });

  it("TC-025: ยอมรับไฟล์ที่ขนาดเท่ากับ maxSizeMB พอดี (boundary)", () => {
    const file = makeFile("a.jpg", "image/jpeg", 1 * MB); // 1 MB
    expect(isValidFileSize(file, 1)).toBe(true);
  });

  it("TC-026: ปฏิเสธไฟล์ที่ใหญ่กว่า maxSizeMB เพียง 1 byte", () => {
    const file = makeFile("a.jpg", "image/jpeg", 1 * MB + 1); // 1 MB + 1 byte
    expect(isValidFileSize(file, 1)).toBe(false);
  });

  it("TC-027: ยอมรับไฟล์เล็กมาก (1 byte) กับ limit 5 MB", () => {
    const file = makeFile("tiny.jpg", "image/jpeg", 1);
    expect(isValidFileSize(file, 5)).toBe(true);
  });

  it("TC-028: ปฏิเสธไฟล์ 10 MB เมื่อ limit คือ 5 MB", () => {
    const file = makeFile("big.jpg", "image/jpeg", 10 * MB);
    expect(isValidFileSize(file, 5)).toBe(false);
  });

  it("TC-029: ยอมรับไฟล์ 4 MB กับ limit 5 MB", () => {
    const file = makeFile("a.jpg", "image/jpeg", 4 * MB);
    expect(isValidFileSize(file, 5)).toBe(true);
  });

  it("TC-030: limit 0 MB → ปฏิเสธทุกไฟล์ที่มีขนาด > 0", () => {
    const file = makeFile("a.jpg", "image/jpeg", 1);
    expect(isValidFileSize(file, 0)).toBe(false);
  });

  it("TC-031: ไฟล์ขนาด 0 byte ผ่าน limit ทุกค่า (รวม 0)", () => {
    const file = makeFile("empty.jpg", "image/jpeg", 0);
    expect(isValidFileSize(file, 0)).toBe(true);
  });
});
