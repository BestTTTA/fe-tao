"use client";
import { useState } from "react";
import Link from "next/link";
import TransparentHeader from "@/components/TransparentHeader";
import { signup } from "../../lib/auth-actions";
import { useFormStatus } from "react-dom";

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="relative min-h-screen">
      {/* Header: ซ่อน search/menu และมีปุ่ม Back */}
      <TransparentHeader
        title="TAROT"
        subtitle="& ORACLE"
        routeRules={{
          "/register": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: "/",
          },
        }}
      />

      <div className="mx-auto max-w-md px-4 pt-24 pb-[160px] text-white">
        <h1 className="text-2xl font-extrabold">แก้ไขข้อมูลส่วนตัว</h1>

        {/* ✅ ใช้ server action โดยตรง */}
        <form action={signup} className="mt-6 space-y-6">
          {/* ---------------- บัญชีผู้ใช้ (อีเมล/รหัสผ่าน) ---------------- */}
          <section className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-white/90">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                placeholder="กรุณาระบุอีเมล"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-white/90">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="กรุณาระบุรหัสผ่าน"
                  autoComplete="new-password"
                  minLength={8}
                  required
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
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="mb-1 block text-sm text-white/90">
                Password (อีกครั้ง)
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  name="confirm"
                  type={showPass2 ? "text" : "password"}
                  placeholder="กรุณาระบุรหัสผ่าน (อีกครั้ง)"
                  autoComplete="new-password"
                  required
                  onInput={(e) => {
                    const c = e.currentTarget as HTMLInputElement;
                    const p = (document.getElementById("password") as HTMLInputElement)?.value;
                    c.setCustomValidity(c.value && p && c.value !== p ? "รหัสผ่านไม่ตรงกัน" : "");
                    setError(null);
                  }}
                  className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass2 ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  onClick={() => setShowPass2((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 hover:bg-slate-100"
                >
                  {showPass2 ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </section>

          {/* ---------------- ข้อมูลส่วนตัว (ตามภาพตัวอย่าง) ---------------- */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-white/90">ข้อมูลโปรไฟล์ของคุณ</h2>

            {/* ชื่อ */}
            <div>
              <label htmlFor="first-name" className="mb-1 block text-sm text-white/90">
                ชื่อ
              </label>
              <input
                id="first-name"
                name="first-name"
                type="text"
                placeholder="สมชาย"
                autoComplete="given-name"
                required
                className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3"
              />
            </div>

            {/* นามสกุล */}
            <div>
              <label htmlFor="last-name" className="mb-1 block text-sm text-white/90">
                นามสกุล
              </label>
              <input
                id="last-name"
                name="last-name"
                type="text"
                placeholder="สมชาย"
                autoComplete="family-name"
                required
                className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3"
              />
            </div>

            {/* ชื่อเล่น */}
            <div>
              <label htmlFor="nick_name" className="mb-1 block text-sm text-white/90">
                ชื่อเล่น
              </label>
              <input
                id="nick_name"
                name="nick_name"
                type="text"
                placeholder="สมชาย"
                className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3"
              />
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm text-white/90">
                เบอร์โทรศัพท์
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="08xxxxxxxx"
                pattern="^[0-9\s\-+()]{8,20}$"
                autoComplete="tel"
                className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3"
              />
            </div>

            
          </section>

          {/* ---------------- ข้อมูลที่จะแสดงในรูปภาพที่แชร์ ---------------- */}
          

          {/* ---------------- ข้อกำหนด/ความเป็นส่วนตัว + Social ---------------- */}
          <section className="space-y-4 pt-1">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                id="agreeTos"
                name="agreeTos"
                checked={agreeTos}
                onChange={(e) => setAgreeTos(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 text-violet-600 focus:ring-violet-500"
                required
              />
              <span>
                ยอมรับ{" "}
                <Link href="/terms" className="underline">
                  ข้อตกลงในการใช้งาน
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                id="agreePrivacy"
                name="agreePrivacy"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 text-violet-600 focus:ring-violet-500"
              />
              <span>อนุญาตให้แพลตฟอร์มเก็บข้อมูลการใช้งาน</span>
            </label>

            {/* Divider + Social */}
            <div className="my-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-sm text-white/80">หรือ</span>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            <div className="text-center">
              <div className="text-sm text-white/80">เข้าสู่ระบบด้วย Social Network</div>
              <div className="mt-3 flex items-center justify-center gap-4">
                <SocialButton ariaLabel="Login with Facebook">
                  <FbIcon />
                </SocialButton>
                <SocialButton ariaLabel="Login with LINE">
                  <LineIcon />
                </SocialButton>
                <SocialButton ariaLabel="Login with Google">
                  <GoogleIcon />
                </SocialButton>
                <SocialButton ariaLabel="Login with Apple">
                  <AppleIcon />
                </SocialButton>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">{error}</p>
          )}

          {/* แผงล่าง (ปุ่ม submit) */}
          <BottomBar />
        </form>
      </div>
    </main>
  );
}

function BottomBar() {
  const { pending } = useFormStatus();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto mx-auto w-full max-w-md">
        <div className="relative rounded-t-3xl border-t border-slate-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
          <div className="px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)_+_16px)]">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-[15px] font-semibold text-white shadow hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? "กำลังลงทะเบียน…" : "ลงทะเบียน"}
            </button>
            <Link href="/login" className="mt-3 block text-center text-sm font-semibold text-slate-800 hover:underline">
              เข้าสู่ระบบ
            </Link>
            <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-slate-900/70" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small helpers ---------- */
function SocialButton({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="grid h-10 w-10 place-items-center bg-white rounded-full text-slate-900 shadow ring-1 ring-black/5 hover:brightness-95"
    >
      {children}
    </button>
  );
}

/* Icons */
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
function FbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="#1877F2">
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.97h-2.34V22c4.78-.78 8.44-4.93 8.44-9.94Z" />
    </svg>
  );
}
function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="#06C755">
      <path d="M19.5 4h-15C2.57 4 2 4.57 2 5.5v8C2 16.43 2.57 17 3.5 17H7v3.5c0 .46.54.68.85.36L12 17h7.5c.93 0 1.5-.57 1.5-1.5v-8C21 4.57 20.43 4 19.5 4Z" />
      <rect x="6" y="8" width="1.8" height="5" fill="#fff" />
      <rect x="8.6" y="8" width="1.8" height="5" fill="#fff" />
      <rect x="11.2" y="8" width="1.8" height="5" fill="#fff" />
      <rect x="13.8" y="8" width="1.8" height="5" fill="#fff" />
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="#EA4335" d="M12 10.2v3.9h5.45c-.24 1.25-.98 2.31-2.1 3.02l3.4 2.64C20.46 18.3 21.5 15.9 21.5 13c0-.83-.08-1.64-.24-2.4H12Z" />
      <path fill="#34A853" d="M6.53 14.32A6.01 6.01 0 0 0 6 12c0-.8.15-1.56.43-2.26L3 7.02A10 10 0 0 0 2 12c0 1.67.4 3.24 1.1 4.64l3.43-2.32Z" />
      <path fill="#4A90E2" d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.4-2.64c-.94.62-2.13.99-3.21.99-2.46 0-4.53-1.66-5.27-3.91l-3.43 2.32C4.94 19.98 8.2 22 12 22Z" />
      <path fill="#FBBC05" d="M18.61 6.42 15.2 9.06C14.45 8 13.29 7.33 12 7.33c-2.12 0-3.9 1.44-4.57 3.41L3 9.74C4.73 6 8.09 4 12 4c2.07 0 3.94.73 5.39 2.42Z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" className="text-black">
      <path d="M16.36 1.64c-.87.59-1.67 1.59-1.54 2.82 1.15.09 2.33-.58 3.03-1.42.86-.96 1.21-2.2 1.21-2.2s-1.83-.12-2.7.8ZM21 16.36c-.45 1.03-1 2.06-1.76 3.03-.94 1.21-2.1 2.61-3.63 2.61-1.41 0-1.86-.84-3.46-.84s-2.11.82-3.49.84c-1.51.03-2.67-1.31-3.61-2.52C2.2 17.47.97 14.2 2.36 11.5c.96-1.9 2.69-3.11 4.67-3.14 1.47-.03 2.86.92 3.46.92.58 0 2.16-1.13 3.64-1 .62.03 2.37.25 3.48 1.88-2.95 1.6-2.48 5.79.39 7.2Z" />
    </svg>
  );
}
