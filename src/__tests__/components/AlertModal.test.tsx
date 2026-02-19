import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AlertModal from "@/components/AlertModal";

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  title: "ชื่อหัวข้อ",
  body: "รายละเอียดข้อความ",
};

describe("AlertModal", () => {
  // ── Visibility ───────────────────────────────────────────────────────────
  it("TC-032: ไม่แสดง modal เมื่อ open=false", () => {
    render(<AlertModal {...defaultProps} open={false} />);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("TC-033: แสดง modal เมื่อ open=true", () => {
    render(<AlertModal {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  // ── Content ──────────────────────────────────────────────────────────────
  it("TC-034: แสดง title ถูกต้อง", () => {
    render(<AlertModal {...defaultProps} title="ข้อผิดพลาด" />);
    expect(screen.getByText("ข้อผิดพลาด")).toBeInTheDocument();
  });

  it("TC-035: แสดง body ถูกต้อง", () => {
    render(<AlertModal {...defaultProps} body="กรุณาลองใหม่อีกครั้ง" />);
    expect(screen.getByText("กรุณาลองใหม่อีกครั้ง")).toBeInTheDocument();
  });

  it("TC-036: แสดงปุ่มตกลง", () => {
    render(<AlertModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "ตกลง" })).toBeInTheDocument();
  });

  // ── Icon / Type ──────────────────────────────────────────────────────────
  it("TC-037: ใช้ type=warning เป็นค่า default (ไม่มี bg-green-100)", () => {
    const { container } = render(<AlertModal {...defaultProps} />);
    expect(container.querySelector(".bg-amber-100")).toBeInTheDocument();
    expect(container.querySelector(".bg-green-100")).toBeNull();
  });

  it("TC-038: แสดง bg-green-100 เมื่อ type=success", () => {
    const { container } = render(
      <AlertModal {...defaultProps} type="success" />
    );
    expect(container.querySelector(".bg-green-100")).toBeInTheDocument();
    expect(container.querySelector(".bg-amber-100")).toBeNull();
  });

  it("TC-039: แสดง bg-amber-100 เมื่อ type=warning", () => {
    const { container } = render(
      <AlertModal {...defaultProps} type="warning" />
    );
    expect(container.querySelector(".bg-amber-100")).toBeInTheDocument();
  });

  // ── Interactions ─────────────────────────────────────────────────────────
  it("TC-040: เรียก onClose เมื่อกดปุ่มตกลง", () => {
    const onClose = vi.fn();
    render(<AlertModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "ตกลง" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("TC-041: เรียก onClose เมื่อคลิก backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(
      <AlertModal {...defaultProps} onClose={onClose} />
    );
    const backdrop = container.querySelector('[aria-hidden="true"]');
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Accessibility ────────────────────────────────────────────────────────
  it("TC-042: dialog มี role=alertdialog", () => {
    render(<AlertModal {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "role",
      "alertdialog"
    );
  });

  it("TC-043: dialog มี aria-modal=true", () => {
    render(<AlertModal {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "aria-modal",
      "true"
    );
  });

  it("TC-044: dialog มี aria-labelledby=alert-title", () => {
    render(<AlertModal {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "aria-labelledby",
      "alert-title"
    );
  });

  it("TC-045: dialog มี aria-describedby=alert-body", () => {
    render(<AlertModal {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "aria-describedby",
      "alert-body"
    );
  });
});
