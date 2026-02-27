'use client'

import Link from 'next/link'

export default function SessionConflictPage() {
  return (
    <main className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-indigo-950 via-violet-950 to-slate-900">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        {/* Warning icon */}
        <div className="mb-3 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-8 w-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-lg font-bold text-slate-900">
          ไม่สามารถเข้าสู่ระบบได้
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-500">
          เนื่องจากบัญชีนี้กำลังถูกใช้งานอยู่ในอุปกรณ์อื่น
        </p>

        <Link
          href="/login"
          className="block w-full rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800 active:bg-violet-900 transition-colors"
        >
          ปิด
        </Link>
      </div>
    </main>
  )
}
