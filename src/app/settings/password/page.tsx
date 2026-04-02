"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import TransparentHeader from "@/components/TransparentHeader";
import AlertModal from "@/components/AlertModal";
import { useLoading } from "@/components/LoadingOverlay";
import { useLanguage } from "@/lib/i18n";

export default function ChangePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showLoading, hideLoading } = useLoading();
  const { t } = useLanguage();

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

    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert(t.changePassword.incomplete, t.changePassword.incompleteSub);
      return;
    }

    if (newPassword.length < 8) {
      showAlert(t.changePassword.tooShort, t.changePassword.tooShortSub);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      showAlert(t.changePassword.weak, t.changePassword.weakSub);
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert(t.changePassword.mismatch, t.changePassword.mismatchSub);
      return;
    }

    try {
      setLoading(true);
      showLoading(t.changePassword.submitting);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        showAlert(t.changePassword.noUser, t.changePassword.noUserSub);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        showAlert(t.changePassword.wrongCurrent, t.changePassword.wrongCurrentSub);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        if (
          updateError.message?.toLowerCase().includes("weak") ||
          updateError.message?.toLowerCase().includes("easy to guess")
        ) {
          showAlert(t.changePassword.weak, t.changePassword.tooCommon);
          return;
        }
        throw updateError;
      }

      showAlert(t.changePassword.success, t.changePassword.successSub, "success");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      showAlert(t.common.error, t.changePassword.errorSub);
    } finally {
      setLoading(false);
      hideLoading();
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
        <h1 className="mb-3 text-2xl font-extrabold">{t.changePassword.title}</h1>

        <div className="overflow-hidden rounded-3xl bg-white/95 p-5 text-slate-900 shadow-lg ring-1 ring-black/5 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-slate-700"
              >
                {t.changePassword.currentPassword}
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder={t.changePassword.currentPasswordPlaceholder}
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700"
              >
                {t.changePassword.newPassword}
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder={t.changePassword.newPasswordPlaceholder}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-500">
                {t.changePassword.newPasswordHint}
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700"
              >
                {t.changePassword.confirmPassword}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder={t.changePassword.confirmPasswordPlaceholder}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-violet-800 disabled:opacity-50"
            >
              {loading ? t.changePassword.submitting : t.changePassword.submit}
            </button>
          </form>
        </div>
      </div>

      <AlertModal
        open={alert.open}
        onClose={() => {
          setAlert({ ...alert, open: false });
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
