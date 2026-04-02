"use client";

import { useEffect, useState } from "react";
import TransparentHeader from "@/components/TransparentHeader";
import { createClient } from "@/utils/supabase/client";
import StatusModal from "@/components/StatusModal";
import { useLoading } from "@/components/LoadingOverlay";
import { getUserTier, type ProfilePlan } from "@/lib/user-tier";
import { useLanguage } from "@/lib/i18n";

type PlanKey = "monthly" | "yearly";
type PlanType = "FREE" | "MONTH" | "YEAR";

interface PriceInfo {
  key: PlanKey;
  id: string;
  amount: number;
  currency: string;
}

export default function VipPackagesPage() {
  const supabase = createClient();
  const { showLoading, hideLoading } = useLoading();
  const { t } = useLanguage();
  const [prices, setPrices] = useState<PriceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [purchasedPlan, setPurchasedPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [planExpire, setPlanExpire] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>("basic");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [selected, setSelected] = useState<PlanKey>("yearly");

  useEffect(() => {
    async function fetchCurrentPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("plan_type, plan_status, plan_current_period_end")
        .eq("id", user.id)
        .single();

      if (data?.plan_type) {
        setCurrentPlan(data.plan_type as PlanType);
        setPlanExpire(data.plan_current_period_end);
      }

      const tier = getUserTier(data as ProfilePlan | null);
      setUserTier(tier);

      if (data?.plan_current_period_end) {
        const end = new Date(data.plan_current_period_end).getTime();
        const now = Date.now();
        const days = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
        setDaysLeft(days);
      }
    }
    fetchCurrentPlan();
  }, [supabase]);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/stripe/prices");
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted: PriceInfo[] = data.map((p) => ({
            key: p.recurring?.interval === "year" ? "yearly" : "monthly",
            id: p.id,
            amount: p.unit_amount,
            currency: p.currency,
          }));
          setPrices(formatted);
        }
      } catch (e) {
        console.error("Load prices failed:", e);
      }
    }
    fetchPrices();
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const st = url.searchParams.get("status");
    if (!st) return;
    setStatus(st);
    if (st === "success") {
      savePurchase();
      url.searchParams.delete("status");
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  async function savePurchase() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const planType = selected === "yearly" ? "YEAR" : "MONTH";
      setPurchasedPlan(planType);

      await supabase
        .from("profiles")
        .update({
          plan_type: planType,
          plan_status: "active",
          plan_current_period_end: new Date(
            selected === "yearly"
              ? Date.now() + 365 * 24 * 60 * 60 * 1000
              : Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq("id", user.id);

      setCurrentPlan(planType);
    } catch (err) {
      console.error("Save purchase failed:", err);
    }
  }

  const onPay = async (k: PlanKey) => {
    const price = prices.find((p) => p.key === k);
    if (!price) return alert(t.packages.priceNotFound);

    setLoading(true);
    showLoading("กำลังเชื่อมต่อ...");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: price.id,
          packageType: k === "yearly" ? "YEAR" : "MONTH",
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert(t.common.tryAgain);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const formatPrice = (amount?: number, currency?: string) =>
    amount
      ? new Intl.NumberFormat("th-TH", {
          style: "currency",
          currency: currency || "THB",
          minimumFractionDigits: 2,
        }).format(amount / 100)
      : "";

  const monthlyPrice = prices.find((p) => p.key === "monthly");
  const yearlyPrice = prices.find((p) => p.key === "yearly");

  return (
    <main className="relative min-h-screen">
      <TransparentHeader
        title={t.packages.title}
        subtitle=""
        routeRules={{
          "/packages": {
            rightAction: "share",
            showBack: true,
            showSearch: false,
          },
        }}
      />

      <StatusModal status={status} purchasedPlan={purchasedPlan} />

      {/* Dark gradient overlay on top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 " />

      <section className="relative h-[90px] w-full" />

      <div className="relative mx-auto max-w-md px-4 pb-24">
        {/* White content wrapper */}
        <div className="rounded-3xl bg-white/95 p-5 text-slate-900 shadow-xl ring-1 ring-black/5 backdrop-blur">
          {/* Trial banner */}
          {userTier === "trial" && daysLeft !== null && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="grid h-8 w-8 flex-none place-items-center rounded-full border-2 border-[#361B62] bg-[#361B62] shadow-sm">
                <CheckIconWhite size={16} />
              </div>
              <div>
                <div className="text-[15px] font-bold text-[#361B62]">
                  {t.packages.trialBanner}
                </div>
                <div className="text-[13px] text-slate-400">
                  {t.packages.daysLeft} {daysLeft} {t.packages.days}
                </div>
              </div>
            </div>
          )}

          {/* VIP banner */}
          {userTier === "vip" && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
              <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-amber-500 shadow-sm">
                <CrownIcon />
              </div>
              <div>
                <div className="text-[15px] font-bold text-amber-900">
                  {t.packages.vipMember}{" "}
                  {currentPlan === "YEAR" ? t.packages.vipYearly : t.packages.vipMonthly}
                </div>
                {planExpire && (
                  <div className="text-[13px] text-amber-700">
                    {t.packages.until}{" "}
                    {new Date(planExpire).toLocaleDateString("th-TH")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hero */}
          <h1 className="text-[22px] font-extrabold leading-tight text-slate-900">
            {t.packages.heroTitle}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
            {t.packages.heroDesc}
          </p>

          {/* Benefits */}
          <div className="mt-5">
            <h2 className="text-base font-bold text-slate-900">
              {t.packages.benefitsTitle}
            </h2>
            <ul className="mt-3 space-y-3">
              <BenefitItem
                title={t.packages.benefit1Title}
                desc={t.packages.benefit1Desc}
              />
              <BenefitItem
                title={t.packages.benefit2Title}
                desc={t.packages.benefit2Desc}
              />
              <BenefitItem
                title={t.packages.benefit3Title}
                desc={t.packages.benefit3Desc}
              />
              <BenefitItem
                title={t.packages.benefit4Title}
                desc={t.packages.benefit4Desc}
              />
            </ul>
          </div>

          {/* Plan cards */}
          <div className="mt-6 space-y-4">
          {/* Monthly */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-lg">
            <h3 className="text-lg font-extrabold">{t.packages.monthlyTitle}</h3>
            <ul className="mt-3 space-y-2">
              <FeatureItem text={t.packages.monthlyPrice} />
              <FeatureItem text={t.packages.monthlyAvg} />
            </ul>
            {currentPlan === "MONTH" ? (
              <CurrentBadge expireDate={planExpire} />
            ) : (
              <button
                disabled={loading}
                type="button"
                onClick={() => onPay("monthly")}
                className={`mt-4 w-full rounded-xl py-3.5 text-center text-base font-bold text-white shadow-lg transition ${
                  loading
                    ? "bg-violet-400 opacity-60"
                    : "bg-[#361B62] hover:bg-[#2a1550] active:scale-[0.98]"
                }`}
              >
                {loading
                  ? t.packages.connecting
                  : monthlyPrice
                  ? formatPrice(monthlyPrice.amount, monthlyPrice.currency)
                  : "..."}
              </button>
            )}
          </div>

          {/* Yearly */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-lg">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-md bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold text-amber-900 shadow-sm">
                {t.common.recommended}
              </span>
              <h3 className="text-lg font-extrabold">{t.packages.yearlyTitle}</h3>
            </div>
            <ul className="mt-3 space-y-2">
              <FeatureItem text={t.packages.yearlyPrice} />
              <FeatureItem text={t.packages.yearlyAvg} />
              <FeatureItem text={t.packages.yearlyBonus} />
            </ul>
            {currentPlan === "YEAR" ? (
              <CurrentBadge expireDate={planExpire} />
            ) : (
              <button
                disabled={loading}
                type="button"
                onClick={() => onPay("yearly")}
                className={`mt-4 w-full rounded-xl py-3.5 text-center text-base font-bold text-white shadow-lg transition ${
                  loading
                    ? "bg-violet-400 opacity-60"
                    : "bg-[#361B62] hover:bg-[#2a1550] active:scale-[0.98]"
                }`}
              >
                {loading
                  ? t.packages.connecting
                  : yearlyPrice
                  ? formatPrice(yearlyPrice.amount, yearlyPrice.currency)
                  : "..."}
              </button>
            )}
          </div>
        </div>

          {/* Restore purchase */}
          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-sm font-medium text-slate-400 underline underline-offset-4 hover:text-slate-600"
            >
              {t.packages.restorePurchase}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------- UI Components ---------- */

function BenefitItem({ title, desc }: { title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-[#361B62] shadow-sm">
        <CheckIconWhite size={14} />
      </span>
      <span className="text-[15px] leading-snug text-slate-700">
        <strong className="font-bold text-slate-900">{title}</strong> {desc}
      </span>
    </li>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-emerald-500 shadow-sm">
        <CheckIconWhite size={12} />
      </span>
      <span className="text-[14px] leading-snug text-slate-700">{text}</span>
    </li>
  );
}

function CurrentBadge({ expireDate }: { expireDate?: string | null }) {
  return (
    <div className="mt-4 w-full rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-center text-[14px] font-semibold text-emerald-700">
      VIP ปัจจุบัน
      {expireDate && (
        <div className="mt-1 text-[12px] font-normal text-emerald-600">
          (ถึงวันที่ {new Date(expireDate).toLocaleDateString("th-TH")})
        </div>
      )}
    </div>
  );
}

/* ---------- Icons ---------- */

function CheckIconWhite({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="white"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m20 6-11 11L4 12" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="white" stroke="none">
      <path d="M2.5 18.5h19v2h-19zM12 2l3.5 7 6.5-2-4 9H6L2 7l6.5 2z" />
    </svg>
  );
}
