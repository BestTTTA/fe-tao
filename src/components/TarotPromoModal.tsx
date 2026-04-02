"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getUserTier, hasPremiumAccess, type ProfilePlan } from "@/lib/user-tier";
import { useLanguage } from "@/lib/i18n";

export type TarotPromoModalProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCta?: () => void;
  showDontShow?: boolean;
  storageKey?: string;
  configKey?: string; // key in configs table (default: 'popup_home')
  imgClassName?: string;
};

export default function TarotPromoModal({
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  onCta,
  showDontShow = true,
  storageKey = "tarot_promo_hidden",
  configKey = "popup_home",
  imgClassName = "w-full h-auto object-cover",
}: TarotPromoModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [popupImageUrl, setPopupImageUrl] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

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

      // 1) อ่าน user
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
          setLoading(false);
          return;
        }
      } else {
        // 3) ล็อกอินแล้ว เช็กสิทธิ์ VIP ถ้าเป็น VIP ก็ไม่ต้องแสดง modal
        const { data: prof } = await supabase
          .from("profiles")
          .select("plan_type, plan_status, plan_current_period_end")
          .eq("id", uid)
          .maybeSingle();

        const tier = getUserTier(prof as ProfilePlan | null);
        if (hasPremiumAccess(tier)) {
          updateOpen(false);
          setLoading(false);
          return;
        }
      }

      // 4) โหลด popup image + html_content จาก configs table
      const { data: configRow } = await supabase
        .from("configs")
        .select("value, html_content")
        .eq("key", configKey)
        .maybeSingle();

      if (!mounted) return;

      const imageUrl = configRow?.value ?? null;
      setPopupImageUrl(imageUrl);
      setHtmlContent(configRow?.html_content ?? null);

      if (!imageUrl) {
        updateOpen(false);
        setLoading(false);
        return;
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, storageKey]);

  const hideForever = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "1");
    }
    updateOpen(false);
  }, [storageKey, updateOpen]);

  const handleCta = useCallback(() => {
    if (onCta) return onCta();
    router.push("/packages");
  }, [onCta, router]);

  if (!open || loading || !popupImageUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => updateOpen(false)}
      />
      <div role="dialog" className="relative z-10 w-[320px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 px-4">
          <button
            onClick={() => updateOpen(false)}
            aria-label="ปิด"
            className="z-50 inline-flex w-full items-center justify-end p-2 text-black"
          >
            x {t.common.close}
          </button>

          <button onClick={handleCta} className="block w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={popupImageUrl}
              alt="promotion"
              className={imgClassName}
            />
          </button>

          {htmlContent && (
            <div
              className="px-4 pt-3 pb-1 html-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}

          {showDontShow && (
            <div className="flex flex-col gap-2 p-2">
              <button
                type="button"
                onClick={handleCta}
                className="w-full rounded-xl bg-botton-main px-2 py-2 text-[15px] font-semibold text-white"
              >
                {t.promo.viewDetails}
              </button>
              <button
                onClick={hideForever}
                className="mx-auto mb-3 block text-center text-[13px] font-semibold text-slate-900 underline underline-offset-4"
              >
                {t.promo.dontShowAgain}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
