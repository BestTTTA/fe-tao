// app/reading/[spreadId]/result/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import TransparentHeader from "@/components/TransparentHeader";
import { toPublicUrl } from "@/utils/toPublicUrl";
import { motion, AnimatePresence } from "framer-motion";
import { generateShareImage, type ShareSocialItem } from "@/utils/generateShareImage";

type UserProfile = {
  full_name: string | null;
  avatar_url: string | null;
  share_profile_name: boolean;
  share_profile_image: boolean;
  facebook_handle: string;
  instagram_handle: string;
  tiktok_handle: string;
  line_handle: string;
  youtube_handle: string;
};

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
  const question = search.get("q") ?? "";

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  // Animation states
  const [showIntro, setShowIntro] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

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

  // Fetch user profile for share image
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, share_profile_name, share_profile_image, facebook_handle, instagram_handle, tiktok_handle, line_handle, youtube_handle")
        .eq("id", user.id)
        .single();
      if (data) setUserProfile(data as UserProfile);
    })();
  }, [supabase]);

  const chosenCards: Card[] = useMemo(() => {
    if (!cards.length || pickedIndexes.length === 0) return [];
    return pickedIndexes.map((i) => cards[i % cards.length]!);
  }, [cards, pickedIndexes]);

  // Preload images before animation
  useEffect(() => {
    if (chosenCards.length === 0 || loading) return;

    const imageUrls = chosenCards
      .map((c) => toPublicUrl(c.card_url))
      .filter((url): url is string => !!url);

    if (imageUrls.length === 0) {
      setImagesLoaded(true);
      return;
    }

    const preloadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // ถ้าโหลดไม่ได้ก็ข้ามไป
        img.src = url;
      });
    };

    Promise.all(imageUrls.map(preloadImage))
      .then(() => {
        setImagesLoaded(true);
      })
      .catch(() => {
        setImagesLoaded(true); // ถ้า error ก็ให้เริ่ม animation ได้
      });
  }, [chosenCards, loading]);

  // Animation control logic
  useEffect(() => {
    if (!showIntro || chosenCards.length === 0 || loading || !imagesLoaded) return;

    if (currentCardIndex >= chosenCards.length) {
      const timer = setTimeout(() => {
        setShowIntro(false);
        setAnimationComplete(true);
      }, 600);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrentCardIndex((prev) => prev + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentCardIndex, showIntro, chosenCards.length, loading, imagesLoaded]);

  // Handle skip to next card
  const handleSkipToNext = () => {
    if (currentCardIndex < chosenCards.length) {
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const buildShareImageOpts = () => {
    const cardUrls = chosenCards
      .map((c) => toPublicUrl(c.card_url))
      .filter((u): u is string => !!u);

    const socials: ShareSocialItem[] = [
      { iconUrl: "/icons/facebook.png",  handle: userProfile?.facebook_handle  ?? "" },
      { iconUrl: "/icons/instagram.png", handle: userProfile?.instagram_handle ?? "" },
      { iconUrl: "/icons/tiktok.png",    handle: userProfile?.tiktok_handle    ?? "" },
      { iconUrl: "/icons/line.png",      handle: userProfile?.line_handle      ?? "" },
      { iconUrl: "/icons/youtube.png",   handle: userProfile?.youtube_handle   ?? "" },
    ].filter((s) => s.handle.trim() !== "");

    return {
      question,
      deckName: deck?.deck_name ?? "",
      cardUrls,
      profileName: userProfile?.full_name ?? "",
      showName: userProfile?.share_profile_name ?? false,
      avatarUrl: userProfile?.avatar_url ?? null,
      showAvatar: userProfile?.share_profile_image ?? false,
      socials,
    };
  };

  const handleSaveImage = async () => {
    setShowMenu(false);
    try {
      setGeneratingImage(true);
      const blob = await generateShareImage(buildShareImageOpts());
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tarot-share.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating image:", err);
      alert("ไม่สามารถสร้างภาพได้");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleShare = async () => {
    setShowMenu(false);
    try {
      setGeneratingImage(true);
      const blob = await generateShareImage(buildShareImageOpts());
      const file = new File([blob], "tarot-share.jpg", { type: "image/jpeg" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "ไพ่ของคุณ - TAROT & ORACLE" });
      } else {
        // fallback: download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "tarot-share.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    } finally {
      setGeneratingImage(false);
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

  // Show intro animation with cards popping up one by one
  if (showIntro && !loading && chosenCards.length > 0) {
    // Show loading indicator while images are loading
    if (!imagesLoaded) {
      return (
        <main className="relative min-h-screen text-white">
          <TransparentHeader
            title="ไพ่ของคุณ"
            subtitle=""
            routeRules={{
              "/reading/*": {
                showLogo: false, showSearch: false, showMenu: false,
                showBack: false,
              },
            }}
          />
          <section className="relative h-[140px] w-full overflow-hidden" />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
              <p className="mt-4 text-white/70">กำลังเตรียมการ์ด...</p>
            </div>
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
              showLogo: false, showSearch: false, showMenu: false,
              showBack: false,
            },
          }}
        />

        <section className="relative h-[140px] w-full overflow-hidden" />

        {/* Card intro animation overlay */}
        <AnimatePresence mode="wait">
          {currentCardIndex < chosenCards.length && (
            <motion.div
              key={currentCardIndex}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleSkipToNext}
            >
              <motion.div
                className="relative w-64 rounded-2xl bg-white/10 p-4 ring-2 ring-white/20 backdrop-blur-xl"
                initial={{ scale: 0, rotate: -10, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 1],
                  rotate: 0,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.8,
                  opacity: 0,
                  y: -50,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.34, 1.56, 0.64, 1], // Custom easing ที่ให้ bounce effect
                }}
              >
                <img
                  src={toPublicUrl(chosenCards[currentCardIndex].card_url) || "/placeholder-card.jpg"}
                  alt={chosenCards[currentCardIndex].card_name}
                  className="w-full rounded-xl object-cover shadow-2xl"
                />
                <div className="mt-3 text-center">
                  <div className="text-sm text-white/70">
                    ไพ่ใบที่ {currentCardIndex + 1}
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">
                    {chosenCards[currentCardIndex].card_name}
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-4 flex justify-center gap-2">
                  {chosenCards.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full transition-all ${
                        i === currentCardIndex
                          ? "bg-amber-400 scale-125"
                          : i < currentCardIndex
                          ? "bg-white/60"
                          : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>

                {/* Skip hint */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-white/50 animate-pulse">
                    แตะเพื่อข้ามไปใบถัดไป
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
        {/* แสดงรูปไพ่ตาม layout ของ spread */}
        <SpreadCardLayout
          spreadId={spreadId}
          cards={chosenCards}
          animationComplete={animationComplete}
          toPublicUrl={toPublicUrl}
        />

        {/* รายการรายละเอียด */}
        <motion.section
          initial={animationComplete ? { opacity: 0, y: 50 } : false}
          animate={animationComplete ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, staggerChildren: 0.1 }}
          className="mt-4 space-y-3"
        >
          {chosenCards.map((c, idx) => (
            <motion.article
              key={c.id}
              initial={animationComplete ? { opacity: 0, x: -20 } : false}
              animate={animationComplete ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
              className="flex gap-3 rounded-2xl bg-white p-3 text-slate-900"
            >
              <img
                src={toPublicUrl(c.card_url) || "/placeholder-card.jpg"}  // ✅ ใช้ toPublicUrl
                alt={c.card_name}
                className="h-full w-16 flex-none rounded-lg object-cover"
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
                    className="inline-flex items-center rounded-lg border border-slate-800 px-2 py-1 text-[12px] font-semibold hover:bg-slate-50"
                  >
                    ดูรายละเอียดการ์ด
                    <svg viewBox="0 0 24 24" width="14" height="14" className="ml-1" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.section>

        {/* ปุ่มล่าง */}
        <div className="fixed inset-x-0 bottom-0">
          <div className="mx-auto max-w-md px-4 pb-6 pt-3 bg-white rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/reading?deck=${deck.id}`} className="rounded-lg  bg-white border border-slate-800 px-3 py-3 text-center text-sm font-semibold text-slate-900">
                สุ่มใหม่
              </Link>
              <Link href={`/reading/${spreadId}/manual?deck=${deck.id}`} className="rounded-lg bg-white border border-slate-800 px-3 py-3 text-center text-sm font-semibold text-slate-900">
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

      {/* Generating image overlay */}
      {generatingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white" />
            <p className="text-white text-sm">กำลังสร้างภาพ...</p>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── layout ของแต่ละ spread ── */
// แต่ละ array = จำนวนไพ่ต่อแถว เช่น [3,2] = แถวบน 3 ใบ แถวล่าง 2 ใบ
const SPREAD_ROWS: Record<string, number[] | "circle"> = {
  "1-card":    [1],
  "2-card":    [2],
  "3-card":    [3],
  "4-card":    [2, 2],
  "5-card":    [3, 2],
  "6-card":    [3, 3],
  "9-card":    [3, 3, 3],
  "10-card":   [4, 3, 3],
  "12-card":   [6, 6],
  "12circle":  "circle",
};

const colClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

function SpreadCardLayout({
  spreadId,
  cards,
  animationComplete,
  toPublicUrl,
}: {
  spreadId: string;
  cards: Card[];
  animationComplete: boolean;
  toPublicUrl: (p?: string | null) => string | null;
}) {
  const layout = SPREAD_ROWS[spreadId];

  const cardImg = (c: Card) => (
    <div key={c.id} className="w-full rounded-md bg-white/10 ring-1 ring-white/15 backdrop-blur">
      <img
        src={toPublicUrl(c.card_url) || "/placeholder-card.jpg"}
        alt={c.card_name}
        className="w-full rounded-md object-cover"
      />
    </div>
  );

  // วงกลม 12 ใบ
  if (layout === "circle" || layout === undefined) {
    return (
      <motion.div
        initial={animationComplete ? { opacity: 0, scale: 0.8 } : false}
        animate={animationComplete ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative mx-auto"
        style={{ width: 320, height: 320 }}
      >
        {cards.slice(0, 12).map((c, i) => {
          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
          const r = 130;
          const x = 160 + r * Math.cos(angle);
          const y = 160 + r * Math.sin(angle);
          return (
            <div
              key={c.id}
              className="absolute rounded-md bg-white/10 ring-1 ring-white/15 backdrop-blur overflow-hidden"
              style={{ width: 44, height: 66, left: x - 22, top: y - 33 }}
            >
              <img
                src={toPublicUrl(c.card_url) || "/placeholder-card.jpg"}
                alt={c.card_name}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </motion.div>
    );
  }

  // layout แบบแถว
  const rows = Array.isArray(layout) ? layout : [Math.min(cards.length, 3)];
  let idx = 0;

  return (
    <motion.div
      initial={animationComplete ? { opacity: 0, scale: 0.8, y: -100 } : false}
      animate={animationComplete ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="flex flex-col gap-3"
    >
      {rows.map((count, rowIdx) => {
        const rowCards = cards.slice(idx, idx + count);
        idx += count;
        return (
          <div
            key={rowIdx}
            className={`grid gap-3 justify-items-center ${colClass[count] ?? "grid-cols-3"} ${
              count === 1 ? "max-w-[140px] mx-auto w-full" : "w-full"
            }`}
          >
            {rowCards.map((c) => cardImg(c))}
          </div>
        );
      })}
    </motion.div>
  );
}
