// app/reading/[spreadId]/result/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import TransparentHeader from "@/components/TransparentHeader";
import { toPublicUrl } from "@/utils/toPublicUrl";

type Deck = {
  id: number;
  deck_name: string;
  free: boolean;
};

type Card = {
  id: number;
  deck_id: number;
  card_name: string;
  card_url: string | null;     // storage path หรือ URL เต็ม
  describe: string | null;
  work_meaning: string | null;
  money_meaning: string | null;
  relation: string | null;
};


export default function ReadingResultPage() {
  const supabase = createClient();
  const params = useParams<{ spreadId: string }>();
  const search = useSearchParams();

  const spreadId = params.spreadId ?? "3-card";
  const deckId = Number(search.get("deck") ?? "0");
  const picksRaw = (search.get("pick") ?? "").trim();

  const pickedIndexes = useMemo(
    () =>
      picksRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n >= 0),
    [picksRaw]
  );

  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showCardSelector, setShowCardSelector] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!deckId || pickedIndexes.length === 0) {
          setError("พารามิเตอร์ไม่ครบถ้วน");
          setLoading(false);
          return;
        }

        const [{ data: deckData, error: deckErr }, { data: cardData, error: cardErr }] =
          await Promise.all([
            supabase
              .from("decks")
              .select("id, deck_name, free")
              .eq("id", deckId)
              .maybeSingle<Deck>(),
            supabase
              .from("cards")
              .select(
                "id, deck_id, card_name, card_url, describe, work_meaning, money_meaning, relation"
              )
              .eq("deck_id", deckId)
              .order("id", { ascending: true })
              .returns<Card[]>(),
          ]);

        if (!mounted) return;

        if (deckErr || !deckData) {
          setError("ไม่พบเด็คนี้");
          setLoading(false);
          return;
        }
        if (cardErr || !cardData || cardData.length === 0) {
          setError("ไม่พบการ์ดในเด็คนี้");
          setLoading(false);
          return;
        }

        setDeck(deckData);
        setCards(cardData);
        setLoading(false);
      } catch {
        if (!mounted) return;
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [supabase, deckId, pickedIndexes.length]);

  const chosenCards: Card[] = useMemo(() => {
    if (!cards.length || pickedIndexes.length === 0) return [];
    return pickedIndexes.map((i) => cards[i % cards.length]!);
  }, [cards, pickedIndexes]);

  const handleSaveImage = async () => {
    setShowMenu(false);

    // ถ้ามีมากกว่า 1 การ์ด ให้เลือกก่อน
    if (chosenCards.length > 1) {
      setShowCardSelector(true);
    } else if (chosenCards.length === 1) {
      // บันทึกการ์ดเดียวเลย
      downloadCardImage(chosenCards[0]!);
    }
  };

  const downloadCardImage = async (card: Card) => {
    try {
      const imageUrl = toPublicUrl(card.card_url);
      if (!imageUrl) {
        alert("ไม่พบรูปภาพการ์ด");
        return;
      }

      // ดาวน์โหลดรูปภาพ
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${card.card_name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowCardSelector(false);
    } catch (error) {
      console.error("Error saving image:", error);
      alert("ไม่สามารถบันทึกภาพได้");
    }
  };

  const handleShare = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      const shareData = {
        title: "ไพ่ของคุณ - TAROT & ORACLE",
        text: `ดูผลการทำนายไพ่ยิปซีของฉัน`,
        url,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        alert("คัดลอกลิงก์แล้ว");
      } else {
        alert(url || "ไม่พบ URL สำหรับแชร์");
      }
      setShowMenu(false);
    } catch (error) {
      // ผู้ใช้ยกเลิก หรือเกิดข้อผิดพลาด
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen text-white">
        <TransparentHeader
          title="ไพ่ของคุณ"
          subtitle=""
          routeRules={{
            "/reading/*": {
              showLogo: false, showSearch: false, showMenu: false,
              showBack: true, backPath: `/reading?deck=${deckId || ""}`,
            },
          }}
        />
        <section
          className="relative h-[140px] w-full overflow-hidden"
/>
        <div className="relative -mt-14 mx-auto max-w-md px-4 pb-28">
          <div className="flex gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-56 flex-1 rounded-2xl bg-white/10 p-2 ring-1 ring-white/15 backdrop-blur animate-pulse" />
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !deck || chosenCards.length === 0) {
    return (
      <main className="relative min-h-screen text-white grid place-items-center">
        <div className="text-center">
          <p className="mb-4">{error ?? "ไม่พบผลลัพธ์"}</p>
          <Link href={`/reading?deck=${deckId || ""}`} className="rounded-xl bg-white px-4 py-2 font-semibold text-slate-900">
            กลับไปเลือกสเปรด
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-white">
      <TransparentHeader
        title="ไพ่ของคุณ"
        subtitle=""
        routeRules={{
          "/reading/*": {
            showLogo: false, showSearch: false, showMenu: true,
            showBack: true, backPath: `/reading/${spreadId}/manual?deck=${deck.id}`,
            rightAction: "dots-menu",
            onRightClick: () => setShowMenu(true),
          },
        }}
      />

      <section
        className="relative h-[140px] w-full overflow-hidden"
  />

      <div className="relative -mt-14 mx-auto max-w-md px-4 pb-28">
        {/* รูปใหญ่ 2 ใบแรก */}
        <div className="flex items-start justify-center gap-3">
          {chosenCards.slice(0, 2).map((c) => (
            <div key={c.id} className="w-36 rounded-xl bg-white/10 p-2 ring-1 ring-white/15 backdrop-blur">
              {/* ✅ ใช้ toPublicUrl */}
              <img
                src={toPublicUrl(c.card_url) || "/placeholder-card.jpg"}
                alt={c.card_name}
                className="w-full rounded-lg object-cover"
              />
            </div>
          ))}
        </div>

        {/* รายการรายละเอียด */}
        <section className="mt-4 space-y-3">
          {chosenCards.map((c, idx) => (
            <article key={c.id} className="flex gap-3 rounded-2xl bg-white p-3 text-slate-900">
              <img
                src={toPublicUrl(c.card_url) || "/placeholder-card.jpg"}  // ✅ ใช้ toPublicUrl
                alt={c.card_name}
                className="h-20 w-16 flex-none rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-slate-500">ไพ่ใบที่ {idx + 1}</div>
                <div className="truncate text-sm font-semibold">{c.card_name}</div>
                {c.describe && (
                  <p className="mt-1 line-clamp-2 text-[12px] text-slate-700">{c.describe}</p>
                )}
                <div className="mt-2">
                  <Link
                    href={`/decks/${deck.id}/cards/${c.id}`}
                    className="inline-flex items-center rounded-lg border border-slate-300 px-2 py-1 text-[12px] font-semibold hover:bg-slate-50"
                  >
                    ดูรายละเอียดการ์ด
                    <svg viewBox="0 0 24 24" width="14" height="14" className="ml-1" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* ปุ่มล่าง */}
        <div className="fixed inset-x-0 bottom-2">
          <div className="mx-auto max-w-md px-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/reading?deck=${deck.id}`} className="rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold text-slate-900">
                สุ่มใหม่
              </Link>
              <Link href={`/reading/${spreadId}/manual?deck=${deck.id}`} className="rounded-xl border border-white/30 px-3 py-3 text-center text-sm font-semibold text-white">
                สับเองใหม่
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* เมนูด้านล่าง */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />

          {/* เมนู */}
          <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md px-4 pb-4">
            <div className="rounded-2xl bg-white p-2 shadow-2xl">
              <button
                onClick={handleSaveImage}
                className="w-full rounded-xl px-4 py-4 text-left text-base font-semibold text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-3"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                บันทึกภาพ
              </button>

              <button
                onClick={handleShare}
                className="w-full rounded-xl px-4 py-4 text-left text-base font-semibold text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-3"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5" />
                </svg>
                ส่งต่อให้เพื่อน
              </button>

            </div>
          </div>
        </>
      )}

      {/* เลือกการ์ดที่จะบันทึก */}
      {showCardSelector && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCardSelector(false)}
          />

          {/* Card Selector */}
          <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md px-4 pb-4">
            <div className="rounded-2xl bg-white p-4 shadow-2xl">
              <h3 className="mb-4 text-center text-lg font-semibold text-slate-900">
                เลือกการ์ดที่ต้องการบันทึก
              </h3>

              <div className="max-h-96 space-y-2 overflow-y-auto">
                {chosenCards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => downloadCardImage(card)}
                    className="w-full rounded-xl p-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 border border-slate-200"
                  >
                    <img
                      src={toPublicUrl(card.card_url) || "/placeholder-card.jpg"}
                      alt={card.card_name}
                      className="h-16 w-12 flex-none rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-500">ไพ่ใบที่ {idx + 1}</div>
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {card.card_name}
                      </div>
                    </div>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-slate-400">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowCardSelector(false)}
                className="mt-4 w-full rounded-xl bg-slate-100 px-4 py-3 text-center text-base font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
