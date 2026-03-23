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

import { getUserTier, hasPremiumAccess, type ProfilePlan } from "@/lib/user-tier";

const mapSpreadId = (id: string) => (id === "12-circle" ? "12circle" : `${id}-card`);

// spreads ที่ VIP เข้าถึงได้
const VIP_SPREADS  = ["1", "2", "3", "6", "10", "12"];
// spreads ที่ใช้ได้ฟรี
const FREE_SPREADS = ["1", "2", "3"];

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
        .select("plan_type, plan_status, plan_current_period_end")
        .eq("id", uid)
        .maybeSingle();

      const tier = getUserTier(prof as ProfilePlan | null);
      if (mounted) {
        setIsVip(hasPremiumAccess(tier));
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [supabase]);

  // VIP: เห็นแค่ VIP_SPREADS | Non-VIP: เห็นทั้งหมด
  const visibleSpreads = useMemo<Spread[]>(() => {
    if (isVip) return BASE_SPREADS.filter((s) => VIP_SPREADS.includes(s.id));
    return BASE_SPREADS;
  }, [isVip]);

  const goNext = (spreadId: string) => {
    if (isVip) {
      // VIP เข้าถึงได้ทุก spread ใน VIP_SPREADS (list ถูก filter แล้ว)
      router.push(`/reading/${mapSpreadId(spreadId)}?deck=${encodeURIComponent(deckId)}`);
    } else if (FREE_SPREADS.includes(spreadId)) {
      // Non-VIP เลือก free spread ได้เลย
      router.push(`/reading/${mapSpreadId(spreadId)}?deck=${encodeURIComponent(deckId)}`);
    } else {
      // Non-VIP กด VIP spread → ไปหน้าสมัคร
      router.push("/packages");
    }
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
            {visibleSpreads.map((s) => {
              const needsVip = !FREE_SPREADS.includes(s.id);
              const showVipTag = !isVip && needsVip;
              return (
                <SpreadItem
                  key={s.id}
                  spread={s}
                  showVipTag={showVipTag}
                  onClick={() => goNext(s.id)}
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
  spread, showVipTag = false, onClick,
}: { spread: Spread; showVipTag?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-stretch gap-3 rounded-3xl p-3 text-left ring-1 backdrop-blur bg-white/10 ring-white/15 hover:bg-white/15 active:scale-[0.98] transition-transform"
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
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[15px] font-bold flex items-center gap-2">
          {spread.title}
          {showVipTag && (
            <span className="rounded-full bg-amber-400 px-2 py-[2px] text-[10px] font-extrabold text-amber-900">
              VIP
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-3 text-[13px] leading-6 text-white/90">{spread.description}</p>
        {showVipTag && (
          <p className="mt-1 text-[11px] text-amber-300">กดเพื่อสมัคร VIP</p>
        )}
      </div>
    </button>
  );
}
