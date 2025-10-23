'use client';

import { useState } from 'react';
import Link from 'next/link';
import TransparentHeader from '@/components/TransparentHeader';
import { login, signInWithGoogle } from '@/lib/auth-actions'; // ✅ นำเข้า action Google
import { useFormStatus } from 'react-dom';
import SocialLogin from '@/components/SocialLogin'; // ✅ คอมโพเนนต์ที่แยกออกมา

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);

  return (
    <main className="relative min-h-screen">
      <TransparentHeader
        title="TAROT"
        subtitle="& ORACLE"
        routeRules={{
          '/login': {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: '/',
          },
        }}
      />

      <div className="mx-auto max-w-md px-4 pt-24 pb-[160px] text-white">
        <h1 className="text-2xl font-extrabold">เข้าสู่ระบบ</h1>

        <form action={login} className="mt-6 space-y-4">
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
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm text-white/90">
                Password
              </label>
              <Link href="/forgot" className="text-sm font-semibold text-white hover:underline">
                รีเซ็ตรหัสผ่านใหม่
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="กรุณาระบุรหัสผ่าน"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3 pr-10"
              />
              <button
                type="button"
                aria-label={showPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 hover:bg-slate-100"
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-sm text-white/80">หรือ</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>

          {/* Social login (คอมโพเนนต์ใหม่) */}
          <SocialLogin/>

          {/* ฟอร์มซ่อน เรียก server action สำหรับ Google */}
          <form action={signInWithGoogle} id="google-oauth-form" />

          {/* Bottom submit bar */}
          <BottomBar />
        </form>
      </div>
    </main>
  );
}

function BottomBar() {
  const { pending } = useFormStatus();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 ">
      <div className="pointer-events-auto mx-auto max-w-md w-full">
        <div className="relative rounded-t-3xl border-t border-slate-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
          <div className="px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)_+_16px)]">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-[15px] font-semibold text-white shadow hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? 'กำลังล็อกอิน…' : 'เข้าสู่ระบบ'}
            </button>

            <Link
              href="/register"
              className="mt-3 block text-center text-sm font-semibold text-slate-800 hover:underline"
            >
              ลงทะเบียน
            </Link>

            <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-slate-900/70" />
          </div>
        </div>
      </div>
    </div>
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
