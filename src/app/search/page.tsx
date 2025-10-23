"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";

type SearchItem = {
  id: string | number;
  title: string;
  action: "ดูดวง" | "สำรับไพ่" | "บทความ";
  href: string;
};

const ALL_ITEMS: SearchItem[] = [
  { id: 1, title: "ดูดวงความรัก", action: "ดูดวง", href: "/reading/love" },
  { id: 2, title: "ความรักในงาน", action: "สำรับไพ่", href: "/decks/love-at-work" },
  { id: 3, title: "ผลดวงที่เกี่ยวกับความรัก", action: "บทความ", href: "/articles/love-results" },
  { id: 4, title: "วิธีดูไพ่เกี่ยวกับความรัก", action: "บทความ", href: "/articles/how-to-read-love" },
  // ลองเพิ่มหมวดอื่น ๆ ได้ตามต้องการ
];

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";

  const [q, setQ] = useState(initialQ);
  const [focused, setFocused] = useState(false);

  // filter แบบง่าย (case-insensitive + รวมตัวสะกดไทย)
  const results = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return [];
    return ALL_ITEMS.filter((i) => i.title.toLowerCase().includes(keyword));
  }, [q]);

  // sync URL ?q=
  useEffect(() => {
    const usp = new URLSearchParams();
    if (q.trim()) usp.set("q", q.trim());
    router.replace(`/search${usp.toString() ? `?${usp.toString()}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ถ้าพิมพ์แล้วกด Enter: ไปผลการค้นหาหน้าแรก (หรือใช้ผลแรก)
    if (results[0]) router.push(results[0].href);
  };

  return (
    <main className="relative min-h-screen">
      {/* Header ใช้ตัวเดิม + ปุ่มย้อนกลับ */}
      <TransparentHeader
        title="TAROT"
        subtitle="& ORACLE"
        routeRules={{ "/search": { showLogo: false, showSearch: false, showMenu: false, showBack: true, backPath: "/" } }}
      />

      {/* HERO BG (ถ้าไม่ต้องการพื้นหลัง ลบ section นี้ทิ้งได้) */}
      <section
        className="relative h-[210px] w-full overflow-hidden"
        style={{ backgroundImage: "url('/hero-stars.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 " />
      </section>

      {/* คอนเทนต์ */}
      <div className="relative -mt-16 mx-auto max-w-md px-4 pb-24">
        {/* Search box */}
        <form onSubmit={onSubmit} className="relative">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)} // ให้กดผลลัพธ์ได้ก่อน blur
            placeholder="กรอกสิ่งที่คุณต้องการค้นหา"
            className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 pr-10 text-[15px] text-slate-900 shadow ring-1 ring-black/5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* ปุ่มค้นหา (แว่น) */}
          {!q && (
            <button
              type="submit"
              aria-label="ค้นหา"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <SearchIcon />
            </button>
          )}

          {/* ปุ่มล้างค่า (X) */}
          {!!q && (
            <button
              type="button"
              aria-label="ล้างคำค้น"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <CloseIcon />
            </button>
          )}
        </form>

        {/* Results panel */}
        {(focused || q) && (results.length > 0 || q) && (
          <div className="mt-3 overflow-hidden rounded-2xl bg-white/95 shadow-lg ring-1 ring-black/5 backdrop-blur">
            {results.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-600">ไม่พบผลลัพธ์สำหรับ “{q}”</div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => router.push(item.href)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <span className="text-[15px] text-slate-900">{item.title}</span>
                      <span className="ml-3 shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {item.action}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

/* ------- icons ------- */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-3.8-3.8" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
