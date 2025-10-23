// app/reading/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";
import { createClient } from "@/utils/supabase/client";

type Spread = {
  id: string;            // "1" | "2" | ... | "12" | "12-circle"
  title: string;
  description: string;
  img: string;           // path PNG ใน /public/card-form
};

const BASE_SPREADS: Spread[] = [
  { id: "1",  title: "วางไพ่แบบ 1 ใบ",  description: "ตอบคำถามเร็ว ๆ เห็นประเด็นชัด",        img: "/card-form/1.png" },
  { id: "2",  title: "วางไพ่แบบ 2 ใบ",  description: "เทียบตัวเลือก / ข้อดี-ข้อเสีย",        img: "/card-form/2.png" },
  { id: "3",  title: "วางไพ่แบบ 3 ใบ",  description: "อดีต / ปัจจุบัน / อนาคต",             img: "/card-form/3.png" },
  { id: "4",  title: "วางไพ่แบบ 4 ใบ",  description: "สถานการณ์ / อุปสรรค / คำแนะนำ / ผลลัพธ์", img: "/card-form/4.png" },
  { id: "5",  title: "วางไพ่แบบ 5 ใบ",  description: "เพิ่มมุมมองชั้นที่ห้า",                 img: "/card-form/5.png" },
  { id: "6",  title: "วางไพ่แบบ 6 ใบ",  description: "ภาพรวมหลายปัจจัย",                     img: "/card-form/6.png" },
  { id: "9",  title: "วางไพ่แบบ 9 ใบ",  description: "ลงรายละเอียด 9 ประเด็น",               img: "/card-form/9.png" },
  { id: "10", title: "วางไพ่แบบ 10 ใบ", description: "สเปรด 10 ใบสำหรับประเด็นซับซ้อน",       img: "/card-form/10.png" },
  { id: "12", title: "วางไพ่แบบ 12 ใบ", description: "ครบ 12 ประเด็น",                        img: "/card-form/12.png" },
  { id: "12-circle", title: "วางไพ่ 12 ใบ (วงกลม)", description: "สเปรด 12 ใบแบบวงกลม",      img: "/card-form/12circle.png" },
];

type Profile = {
  plan_type: "FREE" | "MONTH" | "YEAR" | null;
  plan_status:
    | "active" | "trialing" | "past_due" | "canceled"
    | "incomplete" | "incomplete_expired" | "unpaid" | null;
};

const mapSpreadId = (id: string) => (id === "12-circle" ? "12circle" : `${id}-card`);

export default function ReadingSelectPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen">
          <TransparentHeader
            title="เปิดไพ่"
            subtitle=""
            routeRules={{
              "/reading": {
                showLogo: false, showSearch: false, showMenu: false,
                showBack: true, backPath: "/opencard",
              },
            }}
          />
          <section
            className="relative h-[120px] w-full overflow-hidden"
            style={{ backgroundImage: "url('/hero-stars.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="relative -mt-14 mx-auto max-w-md px-4 pb-24 text-white">
            {/* skeleton ขณะโหลด search params */}
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex w-full items-stretch gap-3 rounded-3xl bg-white/10 p-3 ring-1 ring-white/15">
                  <div className="h-[84px] w-[84px] rounded-2xl bg-white/15 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-40 rounded bg-white/20 animate-pulse" />
                    <div className="mt-2 h-3 w-56 rounded bg-white/10 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      }
    >
      <ReadingContent />
    </Suspense>
  );
}

function ReadingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const deckId = params.get("deck") ?? "";
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);

  // เช็คสิทธิ์ผู้ใช้
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;

      if (!uid) {
        if (mounted) {
          setIsVip(false);
          setLoading(false);
        }
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("plan_type, plan_status")
        .eq("id", uid)
        .maybeSingle<Profile>();

      const vip =
        !!prof &&
        (prof.plan_type === "MONTH" || prof.plan_type === "YEAR") &&
        (prof.plan_status === "active" || prof.plan_status === "trialing");

      if (mounted) {
        setIsVip(vip);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [supabase]);

  // รายการสเปรดตามสิทธิ์
  const spreads = useMemo<Spread[]>(() => {
    if (isVip) return BASE_SPREADS;
    return BASE_SPREADS.filter((s) => ["1", "2", "3"].includes(s.id));
  }, [isVip]);

  const goNext = (spreadId: string, disabled: boolean) => {
    if (disabled) return;
    router.push(`/reading/${mapSpreadId(spreadId)}?deck=${encodeURIComponent(deckId)}`);
  };

  return (
    <main className="relative min-h-screen">
      <TransparentHeader
        title="เปิดไพ่"
        subtitle=""
        routeRules={{
          "/reading": {
            showLogo: false, showSearch: false, showMenu: false,
            showBack: true, backPath: "/opencard",
          },
        }}
      />

      <section
        className="relative h-[120px] w-full overflow-hidden"
        style={{ backgroundImage: "url('/hero-stars.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0" />
      </section>

      <div className="relative -mt-14 mx-auto max-w-md px-4 pb-24 text-white">
        <p className="mt-1 text-center text-sm text-white/85">เลือกรูปแบบไพ่ที่ต้องการดูดวง</p>

        {loading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex w-full items-stretch gap-3 rounded-3xl bg-white/10 p-3 ring-1 ring-white/15">
                <div className="h-[84px] w-[84px] rounded-2xl bg-white/15 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-40 rounded bg-white/20 animate-pulse" />
                  <div className="mt-2 h-3 w-56 rounded bg-white/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {/* 1–3 (เสมอ) */}
            {BASE_SPREADS.filter((s) => ["1", "2", "3"].includes(s.id)).map((s) => (
              <SpreadItem key={s.id} spread={s} onClick={() => goNext(s.id, false)} />
            ))}
            {/* VIP ส่วนที่เหลือ */}
            {BASE_SPREADS.filter((s) => !["1", "2", "3"].includes(s.id)).map((s) => {
              const disabled = !isVip;
              return (
                <SpreadItem
                  key={s.id}
                  spread={s}
                  disabled={disabled}
                  onClick={() => goNext(s.id, disabled)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-2">
        <div className="mx-auto h-1 w-24 rounded-full bg-white/85" />
      </div>
    </main>
  );
}

function SpreadItem({
  spread, disabled = false, onClick,
}: { spread: Spread; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-stretch gap-3 rounded-3xl p-3 text-left ring-1 backdrop-blur
        ${disabled ? "bg-white/5 ring-white/10 opacity-70 cursor-not-allowed"
                   : "bg-white/10 ring-white/15 hover:bg-white/15"}`}
    >
      <div className="grid place-items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spread.img}
          alt={spread.title}
          width={84}
          height={84}
          className="h-[84px] w-[84px] rounded-2xl object-contain bg-white/10 ring-1 ring-white/20"
        />
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-bold flex items-center gap-2">
          {spread.title}
          {disabled && (
            <span className="rounded-full bg-violet-300/90 px-2 py-[2px] text-[10px] font-extrabold text-violet-900">
              VIP
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-3 text-[13px] leading-6 text-white/90">{spread.description}</p>
      </div>
    </button>
  );
}
