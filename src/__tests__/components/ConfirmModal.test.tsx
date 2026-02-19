import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "@/components/ConfirmModal";

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  body: "คุณแน่ใจหรือไม่?",
};

describe("ConfirmModal", () => {
  // ── Visibility ───────────────────────────────────────────────────────────
  it("TC-046: ไม่แสดง modal เมื่อ open=false", () => {
    render(<ConfirmModal {...defaultProps} open={false} />);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("TC-047: แสดง modal เมื่อ open=true", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  // ── Content ──────────────────────────────────────────────────────────────
  it("TC-048: แสดง body ถูกต้อง", () => {
    render(<ConfirmModal {...defaultProps} body="ต้องการลบข้อมูลนี้?" />);
    expect(screen.getByText("ต้องการลบข้อมูลนี้?")).toBeInTheDocument();
  });

  it("TC-049: แสดง title เมื่อมี prop title", () => {
    render(<ConfirmModal {...defaultProps} title="ยืนยันการลบ" />);
    expect(screen.getByText("ยืนยันการลบ")).toBeInTheDocument();
  });

  it("TC-050: ไม่แสดง title element เมื่อไม่ได้ส่ง prop title", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("TC-051: ปุ่มยกเลิก default ข้อความ 'ยกเลิก'", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "ยกเลิก" })).toBeInTheDocument();
  });

  it("TC-052: ปุ่มยืนยัน default ข้อความ 'ยืนยัน'", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "ยืนยัน" })).toBeInTheDocument();
  });

  it("TC-053: ใช้ cancelText custom ได้", () => {
    render(<ConfirmModal {...defaultProps} cancelText="ไม่ใช่" />);
    expect(screen.getByRole("button", { name: "ไม่ใช่" })).toBeInTheDocument();
  });

  it("TC-054: ใช้ confirmText custom ได้", () => {
    render(<ConfirmModal {...defaultProps} confirmText="ลบเลย" />);
    expect(screen.getByRole("button", { name: "ลบเลย" })).toBeInTheDocument();
  });

  // ── Interactions ─────────────────────────────────────────────────────────
  it("TC-055: เรียก onClose เมื่อกดปุ่มยกเลิก", () => {
    const onClose = vi.fn();
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("TC-056: เรียก onConfirm เมื่อกดปุ่มยืนยัน", () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "ยืนยัน" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("TC-057: เรียก onClose เมื่อคลิก backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(
      <ConfirmModal {...defaultProps} onClose={onClose} />
    );
    const backdrop = container.querySelector('[aria-hidden="true"]');
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("TC-058: กดยืนยันไม่เรียก onClose", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmModal {...defaultProps} onClose={onClose} onConfirm={onConfirm} />
    );
    fireEvent.click(screen.getByRole("button", { name: "ยืนยัน" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  // ── Accessibility ────────────────────────────────────────────────────────
  it("TC-059: dialog มี role=alertdialog", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "role",
      "alertdialog"
    );
  });

  it("TC-060: dialog มี aria-modal=true", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "aria-modal",
      "true"
    );
  });

  it("TC-061: มี aria-labelledby เมื่อมี title", () => {
    render(<ConfirmModal {...defaultProps} title="ยืนยัน" />);
    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "aria-labelledby",
      "confirm-title"
    );
  });

  it("TC-062: ไม่มี aria-labelledby เมื่อไม่มี title", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(
      screen.getByRole("alertdialog").hasAttribute("aria-labelledby")
    ).toBe(false);
  });

  it("TC-063: มี aria-describedby=confirm-body", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "aria-describedby",
      "confirm-body"
    );
  });
});
