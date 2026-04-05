// app/reading/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { useLoading } from "@/components/LoadingOverlay";
import type { Dictionary } from "@/lib/i18n/th";

type Spread = {
  id: string;
  titleKey: string;
  descKey: keyof Dictionary["reading"];
  img: string;
};

const BASE_SPREADS: Spread[] = [
  { id: "1",  titleKey: "1",  descKey: "spread1Desc",        img: "/card-form/1.png" },
  { id: "2",  titleKey: "2",  descKey: "spread2Desc",        img: "/card-form/2.png" },
  { id: "3",  titleKey: "3",  descKey: "spread3Desc",        img: "/card-form/3.png" },
  { id: "4",  titleKey: "4",  descKey: "spread4Desc",        img: "/card-form/4.png" },
  { id: "5",  titleKey: "5",  descKey: "spread5Desc",        img: "/card-form/5.png" },
  { id: "6",  titleKey: "6",  descKey: "spread6Desc",        img: "/card-form/6.png" },
  { id: "9",  titleKey: "9",  descKey: "spread9Desc",        img: "/card-form/9.png" },
  { id: "10", titleKey: "10", descKey: "spread10Desc",       img: "/card-form/10.png" },
  { id: "12", titleKey: "12", descKey: "spread12Desc",       img: "/card-form/12.png" },
  { id: "12-circle", titleKey: "12circle", descKey: "spread12CircleDesc", img: "/card-form/12circle.png" },
];

import { getUserTier, hasPremiumAccess, type ProfilePlan } from "@/lib/user-tier";

const mapSpreadId = (id: string) => (id === "12-circle" ? "12circle" : `${id}-card`);

const VIP_SPREADS  = ["1", "2", "3", "6", "10", "12"];
const FREE_SPREADS = ["1", "2", "3"];

export default function ReadingSelectPage() {
  const { t } = useLanguage();
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
                showBack: true,
              },
            }}
          />
          <section className="relative h-[120px] w-full overflow-hidden" />
          <div className="relative -mt-14 mx-auto max-w-md px-4 pb-24 text-white">
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
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const { showLoading } = useLoading();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;

      if (!uid) {
        if (mounted) { setIsVip(false); setLoading(false); }
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("plan_type, plan_status, plan_current_period_end")
        .eq("id", uid)
        .maybeSingle();

      const tier = getUserTier(prof as ProfilePlan | null);
      if (mounted) { setIsVip(hasPremiumAccess(tier)); setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [supabase]);

  const visibleSpreads = useMemo(
    () => BASE_SPREADS.filter((s) => VIP_SPREADS.includes(s.id)),
    []
  );

  const getSpreadTitle = (s: Spread) => {
    if (s.id === "12-circle") return t.reading.circleSpread;
    return `${t.reading.spreadCard} ${s.titleKey} ${t.reading.cards}`;
  };

  const goNext = (spreadId: string) => {
    if (navigating) return;
    if (isVip) {
      setNavigating(true);
      showLoading();
      router.push(`/reading/${mapSpreadId(spreadId)}?deck=${encodeURIComponent(deckId)}`);
    } else if (FREE_SPREADS.includes(spreadId)) {
      setNavigating(true);
      showLoading();
      router.push(`/reading/${mapSpreadId(spreadId)}?deck=${encodeURIComponent(deckId)}`);
    } else {
      router.push("/packages");
    }
  };

  return (
    <main className="relative min-h-screen">
      
      <TransparentHeader
        title={t.reading.title}
        subtitle=""
        routeRules={{
          "/reading": {
            showLogo: false, showSearch: false, showMenu: false,
            showBack: true,
            showTextTitle: true,
          },
        }}
      />

      <section className="relative h-[120px] w-full overflow-hidden">
        <div className="absolute inset-0" />
      </section>

      <div className="relative -mt-14 mx-auto max-w-md px-4 pb-24 text-white">
        <p className="mt-1 text-center text-sm text-white/85">{t.reading.selectSpread}</p>

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
                  title={getSpreadTitle(s)}
                  description={t.reading[s.descKey]}
                  img={s.img}
                  showVipTag={showVipTag}
                  vipLabel={t.reading.subscribeVip}
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
  title, description, img, showVipTag = false, vipLabel, onClick,
}: { title: string; description: string; img: string; showVipTag?: boolean; vipLabel: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-disabled={showVipTag}
      className={`flex w-full items-stretch gap-3 rounded-3xl p-3 text-left ring-1 bg-white/4 ring-white/15 transition-transform ${
        showVipTag
          ? "opacity-40"
          : "hover:bg-white/15 active:scale-[0.98]"
      }`}
    >
      <div className="grid place-items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={title}
          width={84}
          height={84}
          className="h-[84px] w-[84px] rounded-2xl object-contain "
        />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[15px] font-bold flex items-center gap-2">
          {title}
          {showVipTag && (
            <span className="rounded-full bg-amber-400 px-2 py-[2px] text-[10px] font-extrabold text-amber-900">
              VIP
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-3 text-[13px] leading-6 text-white/90">{description}</p>
        {showVipTag && (
          <p className="mt-1 text-[11px] text-amber-300">{vipLabel}</p>
        )}
      </div>
    </button>
  );
}
