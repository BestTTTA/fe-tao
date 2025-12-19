"use client";

import { useState } from "react";
import TransparentHeader from "@/components/TransparentHeader";
import { updatePassword } from "@/lib/auth-actions";
import { useFormStatus } from "react-dom";

export default function ResetPasswordPage() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordsMatch = password === confirm;
  const passwordValid = password.length >= 8;

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-900 via-violet-900/40 to-slate-950 text-white">
      <TransparentHeader
        title="ตั้งรหัสผ่านใหม่"
        subtitle=""
        routeRules={{
          "/reset-password": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: false,
          },
        }}
      />

      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-40 max-w-2xl bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.45),transparent_60%)] blur-3xl" />

      <div className="mx-auto max-w-md px-4 pt-28 pb-24">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <h1 className="text-center text-2xl font-extrabold tracking-tight">
            ตั้งรหัสผ่านใหม่
          </h1>

          <p className="mt-2 text-center text-white/80">
            กรุณาระบุรหัสผ่านใหม่ของคุณ (ขั้นต่ำ 8 ตัวอักษร)
          </p>

          <form action={updatePassword} className="mt-6 space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-white/90">
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="ระบุรหัสผ่านใหม่"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 hover:bg-slate-100"
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {password && !passwordValid && (
                <p className="mt-1 text-xs text-amber-300">
                  รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="mb-1 block text-sm text-white/90">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="ระบุรหัสผ่านอีกครั้ง"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3 pr-10"
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 hover:bg-slate-100"
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {confirm && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-300">
                  รหัสผ่านไม่ตรงกัน
                </p>
              )}
            </div>

            <SubmitButton disabled={!passwordValid || !passwordsMatch || !password || !confirm} />
          </form>
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40">
        <div className="pointer-events-auto mx-auto h-1 w-24 rounded-full bg-white/30" />
      </div>
    </main>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex w-full items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-[15px] font-semibold text-white shadow hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "กำลังอัพเดทรหัสผ่าน..." : "ตั้งรหัสผ่านใหม่"}
    </button>
  );
}

/* ---------- Local icons for password toggle ---------- */
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a3 3 0 1 0 4.24 4.24" />
      <path d="M16.88 13.12a10.94 10.94 0 0 0 3.12-1.12s-4-7-10-7a10.94 10.94 0 0 0-3.12 1.12" />
      <path d="M6.1 6.1A10.94 10.94 0 0 0 2 12s4 7 10 7a10.94 10.94 0 0 0 5.9-1.9" />
    </svg>
  );
}
