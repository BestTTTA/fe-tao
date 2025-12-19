"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import TransparentHeader from "@/components/TransparentHeader";
import { requestPasswordReset } from "@/lib/auth-actions";

function ForgotPasswordForm() {
  const sp = useSearchParams();
  const sent = sp.get("sent") === "1";
  const [email, setEmail] = useState("");

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-900 via-violet-900/40 to-slate-950 text-white">
      <TransparentHeader
        title="รีเซ็ตรหัสผ่าน"
        subtitle=""
        routeRules={{
          "/forgot": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: "/login",
          },
        }}
      />

      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-40 max-w-2xl bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.45),transparent_60%)] blur-3xl" />

      <div className="mx-auto max-w-md px-4 pt-28 pb-24">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <h1 className="text-center text-2xl font-extrabold tracking-tight">
            รีเซ็ตรหัสผ่าน
          </h1>

          <p className="mt-2 text-center text-white/80">
            กรุณากรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้คุณ
          </p>

          {sent && (
            <p className="mt-3 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
              ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว โปรดเช็คกล่องจดหมาย/สแปม
            </p>
          )}

          <div className="mt-6">
            <form action={requestPasswordReset} className="space-y-3">
              <label className="block text-sm text-white/90">อีเมล</label>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-[15px] font-semibold text-white shadow hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                ส่งลิงก์รีเซ็ตรหัสผ่าน
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-white/70">
            เคล็ดลับ: ค้นหาอีเมลจาก &ldquo;Supabase&rdquo; หรือเช็คโฟลเดอร์สแปมด้วยนะ
          </p>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-white/80 underline hover:text-white">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40">
        <div className="pointer-events-auto mx-auto h-1 w-24 rounded-full bg-white/30" />
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-slate-900 via-violet-900/40 to-slate-950" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
