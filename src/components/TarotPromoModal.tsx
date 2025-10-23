"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export type TarotPromoModalProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCta?: () => void;
  showDontShow?: boolean;
  storageKey?: string;
  promotionId?: number;
  imgClassName?: string;
};

type Profile = {
  id: string;
  plan_type: "FREE" | "MONTH" | "YEAR" | null;
  plan_status:
    | "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "unpaid"
    | null;
};

type Promotion = {
  id: number;
  banner_url: string | null;
  head: string | null;
  detail: string | null;
};

export default function TarotPromoModal({
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  onCta,
  showDontShow = true,
  storageKey = "tarot_promo_hidden",
  promotionId,
  imgClassName = "w-full h-auto object-cover",
}: TarotPromoModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [shouldHideByDB, setShouldHideByDB] = useState(false);

  const updateOpen = useCallback(
    (val: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(val);
      onOpenChange?.(val);
    },
    [controlledOpen, onOpenChange]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      // 1) อ่าน user (แต่อย่า return ออก — เราจะโหลด promotion เสมอ)
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      if (!mounted) return;
      setUserId(uid);

      // 2) ถ้ายังไม่ล็อกอิน ดู localStorage เพื่อซ่อนถ้าเคยกด "ไม่แสดง"
      if (!uid) {
        const seen =
          typeof window !== "undefined" &&
          localStorage.getItem(storageKey) === "1";
        if (seen) {
          updateOpen(false);
        }
        // ไม่ return — ไปโหลด promotion ต่อ
      } else {
        // 3) ล็อกอินแล้ว เช็กสิทธิ์ VIP ถ้าเป็น VIP ก็ไม่ต้องแสดง modal
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, plan_type, plan_status")
          .eq("id", uid)
          .maybeSingle<Profile>();

        const isPaidActive =
          prof &&
          prof.plan_type &&
          prof.plan_type !== "FREE" &&
          (prof.plan_status === "active" || prof.plan_status === "trialing");

        if (isPaidActive) {
          updateOpen(false);
          setLoading(false);
          return;
        }
      }

      // 4) โหลด promotion ล่าสุด (หรือ id ที่ระบุ)
      let promo: Promotion | null = null;
      if (typeof promotionId === "number") {
        const { data } = await supabase
          .from("promotions")
          .select("id, banner_url, head, detail")
          .eq("id", promotionId)
          .limit(1)
          .maybeSingle<Promotion>();
        promo = data ?? null;
      } else {
        const { data } = await supabase
          .from("promotions")
          .select("id, banner_url, head, detail")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle<Promotion>();
        promo = data ?? null;
      }
      if (!mounted) return;
      setPromotion(promo);

      if (!promo || !promo.banner_url) {
        // ไม่มีรูปก็ปิด modal เงียบ ๆ
        updateOpen(false);
        setLoading(false);
        return;
      }

      // 5) ถ้าล็อกอินเท่านั้นค่อยเช็คตาราง interesting
      if (uid) {
        const { data: intr } = await supabase
          .from("interesting")
          .select("show")
          .eq("user_id", uid)
          .eq("promotion_id", promo.id)
          .limit(1)
          .maybeSingle<{ show: boolean }>();

        if (intr && intr.show === false) {
          setShouldHideByDB(true);
          updateOpen(false);
          setLoading(false);
          return;
        }
      } else {
        setShouldHideByDB(false);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotionId, storageKey]);

  const hideForever = useCallback(async () => {
    if (!promotion) {
      updateOpen(false);
      return;
    }
    if (!userId) {
      if (typeof window !== "undefined") localStorage.setItem(storageKey, "1");
      updateOpen(false);
      return;
    }
    await supabase
      .from("interesting")
      .upsert(
        { user_id: userId, promotion_id: promotion.id, show: false },
        { onConflict: "user_id,promotion_id" }
      );
    updateOpen(false);
  }, [promotion, userId, storageKey, supabase, updateOpen]);

  const handleCta = useCallback(() => {
    if (onCta) return onCta();
    router.push("/packages");
  }, [onCta, router]);

  if (!open || loading || shouldHideByDB) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => updateOpen(false)}
      />
      <div role="dialog" className="relative z-10 w-[320px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5">
          <button
            onClick={() => updateOpen(false)}
            aria-label="ปิด"
            className="z-50 inline-flex w-full items-center justify-end p-2 text-black"
          >
            x ปิด
          </button>

          <button onClick={handleCta} className="block w-full px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={promotion?.banner_url ?? ""}
              alt={promotion?.head ?? "promotion"}
              className={imgClassName}
            />
          </button>

          {(promotion?.head || promotion?.detail) && (
            <div className="px-4 pb-4">
              {promotion?.head && (
                <h3 className="text-base font-semibold text-slate-900">
                  {promotion.head}
                </h3>
              )}
              {promotion?.detail && (
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {promotion.detail}
                </p>
              )}
            </div>
          )}

          {showDontShow && (
            <div className="flex flex-col gap-2 p-2">
              <button
                type="button"
                onClick={handleCta}
                className="w-full rounded-xl bg-botton-main px-2 py-2 text-[15px] font-semibold text-white"
              >
                ดูรายละเอียด
              </button>
              <button
                onClick={hideForever}
                className="mx-auto mb-3 block text-center text-[13px] font-semibold text-slate-900 underline underline-offset-4"
              >
                ไม่แสดงหน้านี้อีก
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
