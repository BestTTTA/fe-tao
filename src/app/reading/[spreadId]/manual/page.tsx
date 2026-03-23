// app/reading/[spreadId]/manual/page.tsx
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";
import ShufflingCard from "@/components/ShufflingCard";
import { createClient } from "@/utils/supabase/client";

/* ---------- helpers ---------- */

/** Fisher-Yates shuffle using crypto.getRandomValues() for better entropy */
function secureShuffle(arr: number[]): number[] {
  const result = [...arr];
  const buf = new Uint32Array(result.length);
  crypto.getRandomValues(buf);
  for (let i = result.length - 1; i > 0; i--) {
    const j = buf[i] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const spreadCountFromId = (id?: string) => {
  if (!id) return 3;
  if (id === "12circle") return 12;
  const m = /^(\d+)-card$/.exec(id);
  return m ? Math.max(1, Math.min(12, parseInt(m[1], 10))) : 3;
};

const toPublicUrl = (p?: string | null) => {
  if (!p) return "";
  if (p.startsWith("/")) return p;
  if (/^https?:\/\//i.test(p)) return p;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`;
};

/* ---------- page ---------- */

export default function ManualShufflePage() {
  const router = useRouter();
  const params = useParams<{ spreadId?: string; spredId?: string }>();
  const spreadId = params?.spreadId ?? params?.spredId ?? "";

  const search = useSearchParams();
  const deckId = search.get("deck") ?? "magician-dark";
  const question = search.get("q") ?? "";
  const isAuto = search.get("auto") === "1";

  const [cardBackUrl, setCardBackUrl] = useState<string>("/card-form/back-card.png");
  const [totalCards, setTotalCards] = useState(0);
  const need = useMemo(() => spreadCountFromId(spreadId), [spreadId]);

  // ดึง deck_back_url + จำนวนไพ่จริงจาก supabase
  useEffect(() => {
    const numericId = Number(deckId);
    if (!deckId || isNaN(numericId)) return;
    const supabase = createClient();

    // ดึง deck back url
    supabase
      .from("decks")
      .select("deck_back_url")
      .eq("id", numericId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.deck_back_url) {
          const base = data.deck_back_url.replace(/\/[^/]+$/, "");
          const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
          const backPath = `${base}/Back.webp`;
          const fullUrl = /^https?:\/\//i.test(backPath)
            ? backPath
            : `${supabaseBase}/${backPath.replace(/^\/+/, "")}`;
          setCardBackUrl(fullUrl);
        }
      });

    // ดึงจำนวนไพ่ทั้งหมดใน deck
    supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .eq("deck_id", numericId)
      .then(({ count }) => {
        setTotalCards(count ?? 0);
      });
  }, [deckId]);

  const [shuffling, setShuffling] = useState(true);
  const [selectedIndexes, setSelected] = useState<number[]>([]);
  const canConfirm = selectedIndexes.length === need;

  // ไม่มี auto-stop แล้ว - ให้สับไปเรื่อยๆ จนกว่าจะกดหยุด
  const stopShuffle = () => {
    setShuffling(false);
  };

  const pickCard = (i: number) => {
    if (shuffling) return;
    setSelected((prev) => {
      if (prev.includes(i) || prev.length >= need) return prev;
      return [...prev, i];
    });
  };

  const resetPick = () => {
    setSelected([]);
  };

  const autoPick = () => {
    const picks = secureShuffle(Array.from({ length: totalCards }, (_, i) => i)).slice(0, need);
    setShuffling(false);
    setSelected(picks);
  };

  const confirm = () => {
    if (!canConfirm) return;
    const pick = selectedIndexes.join(",");
    router.push(
      `/reading/${spreadId || "3-card"}/result?deck=${encodeURIComponent(deckId)}&pick=${encodeURIComponent(pick)}&q=${encodeURIComponent(question)}`
    );
  };

  // Auto mode helpers
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoNavigated = useRef(false);

  const goToResultAuto = () => {
    if (autoNavigated.current || totalCards === 0) return;
    autoNavigated.current = true;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    const picks = secureShuffle(Array.from({ length: totalCards }, (_, i) => i)).slice(0, need);
    router.push(
      `/reading/${spreadId || "3-card"}/result?deck=${encodeURIComponent(deckId)}&pick=${encodeURIComponent(picks.join(","))}&q=${encodeURIComponent(question)}`
    );
  };

  useEffect(() => {
    if (!isAuto || totalCards === 0 || autoNavigated.current) return;
    autoTimerRef.current = setTimeout(goToResultAuto, 3000);
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuto, totalCards]);

  return (
    <main className="relative min-h-screen text-white overflow-x-hidden">
      <TransparentHeader
        title="เปิดไพ่"
        subtitle=""
        routeRules={{
          "/reading/*": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: `/reading?deck=${encodeURIComponent(deckId)}`,
          },
        }}
      />

      {/* BG */}
      <section className="relative h-[100px] sm:h-[120px] w-full overflow-hidden" />

      {/* Content Container */}
      <div
        className="relative flex flex-col min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-120px)]"
        onClick={isAuto ? goToResultAuto : undefined}
      >
        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 pb-32 sm:pb-36">
          {shuffling ? (
            /* ระหว่างสับไพ่: ไพ่ใบเดียวกลางจอพร้อม animation flip */
            <div className="flex flex-col items-center gap-8">
              <div className="h-48 w-48 flex items-center justify-center">
                <ShufflingCard backUrl={cardBackUrl} />
              </div>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs sm:text-sm">
                  {isAuto ? "กำลังสุ่มไพ่... แตะที่หน้าจอเพื่อข้าม" : "กำลังสับไพ่... กดหยุดเมื่อคุณพร้อม"}
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* คำอธิบาย */}
              <div className="mb-3 sm:mb-4 text-center text-white/90 px-2">
                <div className="space-y-1">
                  <div className="text-base sm:text-lg font-medium">
                    เลือกไพ่ {selectedIndexes.length}/{need} ใบ
                  </div>
                  {selectedIndexes.length < need && (
                    <div className="text-xs sm:text-sm text-white/70">แตะที่ไพ่เพื่อเลือก</div>
                  )}
                </div>
              </div>

              {/* กองไพ่ซ้อน */}
              <div className="w-full max-w-md">
                <DeckStrip
                  backSrc={cardBackUrl}
                  total={totalCards}
                  selected={selectedIndexes}
                  onPick={pickCard}
                />
              </div>
            </>
          )}
        </div>

        {/* แถบปุ่มล่าง */}
        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pt-4 pb-safe z-50">
          <div className="mx-auto max-w-md px-3 sm:px-4 pb-2 sm:pb-3">
            {shuffling ? (
              !isAuto && (
                <button
                  onClick={stopShuffle}
                  className="w-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3.5 sm:py-4 text-center text-base sm:text-lg font-semibold text-slate-900 shadow-lg active:scale-95 transition-transform duration-150"
                >
                  หยุดสับไพ่
                </button>
              )
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={autoPick}
                  className="rounded-xl sm:rounded-2xl bg-white px-2 py-3 sm:py-3.5 text-center text-sm sm:text-base font-semibold text-slate-900 shadow-md active:scale-95 transition-transform duration-150"
                >
                  สุ่มอัตโนมัติ
                </button>
                <button
                  onClick={resetPick}
                  className="rounded-xl sm:rounded-2xl bg-white px-2 py-3 sm:py-3.5 text-center text-sm sm:text-base font-semibold text-slate-900 shadow-md active:scale-95 transition-transform duration-150"
                >
                  เลือกใหม่
                </button>
                <button
                  onClick={confirm}
                  disabled={!canConfirm}
                  className={`rounded-xl sm:rounded-2xl px-2 py-3 sm:py-3.5 text-center text-sm sm:text-base font-semibold transition-transform duration-150 ${
                    canConfirm
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg active:scale-95"
                      : "bg-white/40 text-white/70 cursor-not-allowed"
                  }`}
                >
                  ตกลง
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ============== UI: กองไพ่ซ้อน ============== */
function DeckStrip({
  backSrc,
  total,
  selected,
  onPick,
}: {
  backSrc: string;
  total: number;
  selected: number[];
  onPick: (i: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  // วัดความกว้าง container เพื่อคำนวณ overlap ให้เต็มจอ
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerW(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ขนาดการ์ด: w-16 = 64px (mobile), sm:w-24 = 96px (desktop)
  const cardW = typeof window !== "undefined" && window.innerWidth >= 640 ? 96 : 64;

  // แบ่งไพ่เป็นแถว แถวละ 10 ใบ
  const perRow = 10;
  const rows: number[][] = [];
  for (let i = 0; i < total; i += perRow) {
    rows.push(Array.from({ length: Math.min(perRow, total - i) }, (_, j) => i + j));
  }

  // คำนวณ overlap ให้ไพ่ขยายเกือบเต็ม container
  const calcOverlap = (count: number) => {
    if (count <= 1 || !containerW) return 0;
    // totalWidth = cardW + (count-1) * (cardW - overlap) = count*cardW - (count-1)*overlap
    // overlap = (count * cardW - containerW) / (count - 1)
    const needed = (count * cardW - containerW) / (count - 1);
    // จำกัดไม่ให้ overlap มากกว่าความกว้างการ์ด - 8px (เผยอย่างน้อย 8px)
    return Math.max(0, Math.min(needed, cardW - 8));
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-visible">
      <div className="flex flex-col items-center gap-3 overflow-visible">
        {rows.map((row, rowIdx) => {
          const rowOverlap = calcOverlap(row.length);
          return (
          <div key={rowIdx} className="flex items-end justify-center overflow-visible">
            {row.map((i, colIdx) => {
              const chosen = selected.includes(i);

              return (
                <button
                  key={i}
                  onClick={() => onPick(i)}
                  disabled={chosen}
                  className={[
                    "relative h-24 w-16 sm:h-32 sm:w-24 rounded-md sm:rounded-lg overflow-hidden z-10",
                    "transition-all duration-200 ease-out",
                  ].join(" ")}
                  style={{
                    marginLeft: colIdx > 0 ? -rowOverlap : 0,
                    transform: chosen ? "translateY(-6px)" : undefined,
                  }}
                >
                  {/* Card back image */}
                  <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={toPublicUrl(backSrc) || backSrc}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>

                  {/* Ring effect */}
                  <div
                    className="absolute inset-0 rounded-md sm:rounded-lg pointer-events-none ring-1 ring-white/15"
                  />
                </button>
              );
            })}
          </div>
          );
        })}
      </div>

      {/* keyframes */}
      <style jsx global>{`
        /* Safe area สำหรับ iPhone */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe {
            padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
}