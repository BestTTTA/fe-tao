"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import TransparentHeader from "@/components/TransparentHeader";
import AlertModal from "@/components/AlertModal";

export default function ChangePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    title: string;
    body: string;
    type: "warning" | "success";
  }>({ open: false, title: "", body: "", type: "warning" });

  const showAlert = (
    title: string,
    body: string,
    type: "warning" | "success" = "warning"
  ) => {
    setAlert({ open: true, title, body, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (newPassword.length < 8) {
      showAlert("รหัสผ่านสั้นเกินไป", "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      showAlert(
        "รหัสผ่านไม่ปลอดภัย",
        "รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("รหัสผ่านไม่ตรงกัน", "กรุณากรอกยืนยันรหัสผ่านให้ตรงกัน");
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        showAlert("ไม่พบข้อมูลผู้ใช้", "กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        return;
      }

      // Verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        showAlert("รหัสผ่านไม่ถูกต้อง", "รหัสผ่านปัจจุบันไม่ถูกต้อง");
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        // Handle weak password error
        if (
          updateError.message?.toLowerCase().includes("weak") ||
          updateError.message?.toLowerCase().includes("easy to guess")
        ) {
          showAlert(
            "รหัสผ่านไม่ปลอดภัย",
            "รหัสผ่านนี้ถูกใช้บ่อยเกินไป กรุณาเลือกรหัสผ่านที่ซับซ้อนกว่านี้"
          );
          return;
        }
        throw updateError;
      }

      // Success
      showAlert("สำเร็จ", "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว", "success");

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      showAlert("เกิดข้อผิดพลาด", "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen">
      <TransparentHeader
        title="TAROT"
        subtitle="& ORACLE"
        routeRules={{
          "/settings/password": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: "/menu",
          },
        }}
      />

      <section className="relative h-[210px] w-full overflow-hidden" />

      <div className="relative -mt-16 mx-auto max-w-md px-4 pb-24 text-white">
        <h1 className="mb-3 text-2xl font-extrabold">เปลี่ยนรหัสผ่าน</h1>

        <div className="overflow-hidden rounded-3xl bg-white/95 p-5 text-slate-900 shadow-lg ring-1 ring-black/5 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-slate-700"
              >
                รหัสผ่านปัจจุบัน
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="กรอกรหัสผ่านปัจจุบัน"
                disabled={loading}
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700"
              >
                รหัสผ่านใหม่
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="กรอกรหัสผ่านใหม่"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-500">
                ต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700"
              >
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-violet-800 disabled:opacity-50"
            >
              {loading ? "กำลังดำเนินการ..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </form>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        open={alert.open}
        onClose={() => {
          setAlert({ ...alert, open: false });
          // If success, go back to menu
          if (alert.type === "success") {
            router.push("/menu");
          }
        }}
        title={alert.title}
        body={alert.body}
        type={alert.type}
      />
    </main>
  );
}
