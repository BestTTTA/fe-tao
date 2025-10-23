'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen bg-gradient-to-b from-slate-900 via-violet-900/40 to-slate-950 text-white">
          <div className="mx-auto max-w-md px-4 pt-28 pb-24">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="mx-auto mb-4 h-6 w-24 animate-pulse rounded bg-white/20" />
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </main>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}

function ErrorContent() {
  const sp = useSearchParams()
  const code = sp.get('code') || ''
  const message = sp.get('message') || ''

  const display = message || 'ขออภัย มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง'

  const isInvalidCred =
    code === 'auth_invalid_credentials' || code === 'auth_user_not_found'

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-900 via-violet-900/40 to-slate-950 text-white">
      {/* Top decoration */}
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-40 max-w-2xl bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.45),transparent_60%)] blur-3xl" />

      {/* Content card */}
      <div className="mx-auto max-w-md px-4 pt-28 pb-24">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-500/20 ring-1 ring-rose-400/30">
            <ErrorIcon />
          </div>
          <h1 className="text-center text-2xl font-extrabold tracking-tight">
            เกิดข้อผิดพลาด
          </h1>

          <p className="mt-2 text-center text-white/80">{display}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-[15px] font-semibold text-white shadow hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <HomeIcon /> กลับหน้าแรก
            </Link>

            {isInvalidCred && (
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-[15px] font-semibold text-white ring-1 ring-white/20 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                ไปที่หน้า Register
              </Link>
            )}
          </div>

          {code && (
            <p className="mt-4 text-center text-xs text-white/50">
              รหัสข้อผิดพลาด: <code>{code}</code>
            </p>
          )}
        </div>
      </div>

      {/* Bottom home indicator */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40">
        <div className="pointer-events-auto mx-auto h-1 w-24 rounded-full bg-white/30" />
      </div>
    </main>
  )
}

/* ---------------- Icons (inline SVG) ---------------- */
function ErrorIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-rose-300"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7" />
      <path d="M9 22V12h6v10" />
    </svg>
  )
}
