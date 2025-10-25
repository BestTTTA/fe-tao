"use client";

import { useEffect, useState } from "react";
import TransparentHeader from "@/components/TransparentHeader";
import { createClient } from "@/utils/supabase/client";
import StatusModal from "@/components/StatusModal";

type PlanKey = "monthly" | "yearly";
type PlanType = "FREE" | "MONTH" | "YEAR";

interface PriceInfo {
  key: PlanKey;
  id: string;
  label: string;
  amount: number;
  currency: string;
  features: string[];
  recommended?: boolean;
}

export default function VipPackagesPage() {
  const supabase = createClient();
  const [selected, setSelected] = useState<PlanKey>("yearly");
  const [prices, setPrices] = useState<PriceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [purchasedPlan, setPurchasedPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [planExpire, setPlanExpire] = useState<string | null>(null);

  // ✅ โหลดข้อมูลแผนปัจจุบันของผู้ใช้
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
    }
    fetchCurrentPlan();
  }, [supabase]);

  // ✅ โหลดราคาแพ็กเกจจาก Stripe
  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/stripe/prices");
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted: PriceInfo[] = data.map((p) => ({
            key: p.recurring?.interval === "year" ? "yearly" : "monthly",
            id: p.id,
            label:
              p.recurring?.interval === "year"
                ? "VIP แบบรายปี"
                : "VIP แบบรายเดือน",
            amount: p.unit_amount,
            currency: p.currency,
            features:
              p.recurring?.interval === "year"
                ? ["ดูดวงได้ไม่จำกัด", "อ่านบทความพรีเมียมไม่จำกัด"]
                : ["ดูดวงได้วันละ 20 ครั้ง", "อ่านบทความพรีเมียม"],
            recommended: p.recurring?.interval === "year",
          }));
          setPrices(formatted);
        }
      } catch (e) {
        console.error("Load prices failed:", e);
      }
    }
    fetchPrices();
  }, []);

  // ✅ อ่าน query param ?status=... แล้วลบออกหลังใช้งาน
  useEffect(() => {
    const url = new URL(window.location.href);
    const st = url.searchParams.get("status");

    if (!st) return;

    setStatus(st);

    if (st === "success") {
      savePurchase();

      // ลบ query ออกจาก URL เพื่อป้องกันซ้ำ
      url.searchParams.delete("status");
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  // ✅ บันทึกข้อมูลการซื้อใน Supabase
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

  // ✅ เรียก Stripe Checkout
  const onPay = async (k: PlanKey) => {
    const price = prices.find((p) => p.key === k);
    if (!price) return alert("ไม่พบราคา");

    setLoading(true);
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
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount?: number, currency?: string) =>
    amount
      ? new Intl.NumberFormat("th-TH", {
          style: "currency",
          currency: currency || "THB",
          minimumFractionDigits: 0,
        }).format(amount / 100)
      : "";

  return (
    <main className="relative min-h-screen">
      <TransparentHeader
        title="สมัคร VIP"
        subtitle=""
        
        routeRules={{
          "/packages": {
            rightAction: "share",
            showBack: true,
            showSearch: false,
            backPath: "/",
          },
        }}
      />

      {/* ✅ Status Modal */}
      <StatusModal status={status} purchasedPlan={purchasedPlan} />

      {/* พื้นหลัง */}
      <section
        className="relative h-[220px] w-full overflow-hidden"

      />

      {/* เนื้อหา */}
      <div className="relative -mt-16 mx-auto max-w-md px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-white/95 p-4 text-slate-900 shadow-xl ring-1 ring-black/5 backdrop-blur">
          <h1 className="mb-2 text-xl font-extrabold text-slate-900">
            สมัคร VIP
          </h1>

          {currentPlan && (
            <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              คุณเป็นสมาชิก{" "}
              <strong>
                {currentPlan === "YEAR"
                  ? "VIP รายปี"
                  : currentPlan === "MONTH"
                  ? "VIP รายเดือน"
                  : "ฟรี"}
              </strong>
              {planExpire && (
                <div className="text-xs text-emerald-600">
                  ถึงวันที่ {new Date(planExpire).toLocaleDateString("th-TH")}
                </div>
              )}
            </div>
          )}

          <p className="mb-4 text-[13px] leading-6 text-slate-600">
            เข้าร่วมเป็น{" "}
            <span className="font-bold text-amber-600">VIP</span> เพื่อปลดล็อก
            การดูดวงและบทความสุดพิเศษไม่จำกัด
          </p>

          <div className="space-y-3">
            {prices.map((plan) => (
              <PlanCard
                key={plan.key}
                title={plan.label}
                priceText={`${formatPrice(plan.amount, plan.currency)}`}
                features={plan.features}
                selected={selected === plan.key}
                onSelect={() => setSelected(plan.key)}
                onPay={() => onPay(plan.key)}
                recommended={plan.recommended}
                disabled={loading}
                isCurrent={
                  (plan.key === "yearly" && currentPlan === "YEAR") ||
                  (plan.key === "monthly" && currentPlan === "MONTH")
                }
                expireDate={planExpire}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Components ---------------- */
function PlanCard({
  title,
  priceText,
  features,
  selected,
  onSelect,
  onPay,
  recommended = false,
  disabled = false,
  isCurrent = false,
  expireDate,
}: {
  title: string;
  priceText: string;
  features: string[];
  selected?: boolean;
  onSelect: () => void;
  onPay: () => void;
  recommended?: boolean;
  disabled?: boolean;
  isCurrent?: boolean;
  expireDate?: string | null;
}) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition ${
        selected
          ? "border-violet-400 bg-violet-50/60"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        {recommended && (
          <span className="rounded-md bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-900">
            แนะนำ
          </span>
        )}
        <h3 className="text-[15px] font-extrabold text-slate-900">{title}</h3>
      </div>

      <ul className="mb-3 space-y-1.5 text-[13px] text-slate-700">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-[3px] inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200">
              <CheckIcon />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-center text-[14px] font-semibold text-emerald-700">
          VIP ปัจจุบัน
          {expireDate && (
            <div className="mt-1 text-[12px] font-normal text-emerald-600">
              (ถึงวันที่ {new Date(expireDate).toLocaleDateString("th-TH")})
            </div>
          )}
        </div>
      ) : (
        <button
          disabled={disabled}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPay();
          }}
          className={`relative inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-[15px] font-semibold text-white shadow transition ${
            disabled
              ? "bg-violet-400 opacity-60"
              : "bg-violet-700 hover:bg-violet-800 focus-visible:ring-violet-500"
          }`}
        >
          {disabled ? "กำลังเชื่อมต่อ..." : priceText}
        </button>
      )}
    </div>
  );
}

/* ---------------- Icons ---------------- */
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m20 6-11 11L4 12" />
    </svg>
  );
}
