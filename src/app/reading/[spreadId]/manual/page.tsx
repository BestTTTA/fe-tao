// app/reading/[spreadId]/manual/page.tsx
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";

/* ---------- helpers ---------- */

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

  const backImg = "/card-form/back-card.png";
  const need = useMemo(() => spreadCountFromId(spreadId), [spreadId]);

  const [shuffling, setShuffling] = useState(true);
  const totalCards = 18;
  const [selectedIndexes, setSelected] = useState<number[]>([]);
  const [touchedIndex, setTouchedIndex] = useState<number | null>(null);
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
    setTouchedIndex(null);
  };

  const autoPick = () => {
    const all = Array.from({ length: totalCards }, (_, i) => i);
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    setShuffling(false);
    setSelected(all.slice(0, need));
  };

  const confirm = () => {
    if (!canConfirm) return;
    const pick = selectedIndexes.join(",");
    router.push(
      `/reading/${spreadId || "3-card"}/result?deck=${encodeURIComponent(
        deckId
      )}&pick=${encodeURIComponent(pick)}`
    );
  };

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
      <section
        className="relative h-[100px] sm:h-[120px] w-full overflow-hidden"
      />

      {/* Content Container - ใช้ flex เพื่อจัดกลางจอ */}
      <div className="relative flex flex-col min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-120px)]">
        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 pb-32 sm:pb-36">
          {/* กองไพ่ */}
          <div className="w-full max-w-md">
            <DeckStrip
              backSrc={backImg}
              total={totalCards}
              shuffling={shuffling}
              selected={selectedIndexes}
              touched={touchedIndex}
              onPick={pickCard}
              onTouch={setTouchedIndex}
            />
          </div>

          {/* คำอธิบาย */}
          <div className="mt-6 sm:mt-8 text-center text-sm sm:text-base text-white/90 px-2">
            {shuffling ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs sm:text-sm">กำลังสับไพ่... กดหยุดเมื่อคุณพร้อม</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-base sm:text-lg font-medium">
                  เลือกไพ่ {selectedIndexes.length}/{need} ใบ
                </div>
                {selectedIndexes.length < need && (
                  <div className="text-xs sm:text-sm text-white/70">
                    แตะที่ไพ่เพื่อเลือก
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* แถบปุ่มล่าง - Fixed ที่ด้านล่าง */}
        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pt-4 pb-safe z-50">
          <div className="mx-auto max-w-md px-3 sm:px-4 pb-2 sm:pb-3">
            {shuffling ? (
              <button
                onClick={stopShuffle}
                className="w-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3.5 sm:py-4 text-center text-base sm:text-lg font-semibold text-slate-900 shadow-lg active:scale-95 transition-transform duration-150"
              >
                หยุดสับไพ่
              </button>
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

/* ============== UI: กองไพ่ซ้อน + อนิเมชันสับไพ่ ============== */
function DeckStrip({
  backSrc,
  total,
  shuffling,
  selected,
  touched,
  onPick,
  onTouch,
}: {
  backSrc: string;
  total: number;
  shuffling: boolean;
  selected: number[];
  touched: number | null;
  onPick: (i: number) => void;
  onTouch: (i: number | null) => void;
}) {
  const glowRef = useRef<HTMLDivElement>(null);
  const [glowPosition, setGlowPosition] = useState(0);

  // อนิเมชัน glow เคลื่อนที่ - วนลูปไปเรื่อยๆ
  useEffect(() => {
    if (!shuffling) return;
    
    let frame = 0;
    const animate = () => {
      frame++;
      setGlowPosition((frame * 2) % 100);
      requestAnimationFrame(animate);
    };
    
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [shuffling]);

  // ระยะเหลื่อมที่เหมาะกับมือถือ - ซ้อนมากขึ้น
  const overlap = 50;

  const handleTouchStart = (i: number) => {
    if (!shuffling && !selected.includes(i)) {
      onTouch(i);
    }
  };

  const handleTouchEnd = () => {
    onTouch(null);
  };

  return (
    <div className="relative w-full max-w-full overflow-visible">
      {/* glow effect ตอนสับ */}
      {shuffling && (
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 z-30"
        >
          <div 
            className="h-0.5 sm:h-1 w-full overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.8) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              backgroundPosition: `${glowPosition}% 0`,
            }}
          />
          <div 
            className="mx-auto mt-[-6px] sm:mt-[-8px] h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-amber-400 blur-sm"
            style={{
              boxShadow: '0 0 15px rgba(251,191,36,0.9), 0 0 30px rgba(251,191,36,0.6)',
              marginLeft: `${glowPosition}%`,
              transition: 'margin-left 0.05s linear',
            }}
          />
        </div>
      )}

      {/* กองไพ่แบบซ้อน - Responsive */}
      <div className="flex justify-center overflow-visible">
        <div className="relative">
          <div className="flex items-end justify-center">
            {Array.from({ length: total }).map((_, i) => {
              const chosen = selected.includes(i);
              const isTouched = touched === i && !shuffling && !chosen;
              const selectionOrder = selected.indexOf(i);
              
              return (
                <button
                  key={i}
                  onClick={() => onPick(i)}
                  onTouchStart={() => handleTouchStart(i)}
                  onTouchEnd={handleTouchEnd}
                  disabled={shuffling || chosen}
                  className={[
                    // ขนาดการ์ดปรับตามหน้าจอ
                    "relative h-24 w-16 xs:h-28 xs:w-20 sm:h-32 sm:w-24 rounded-md sm:rounded-lg overflow-hidden",
                    shuffling ? "shuffle-card" : "",
                    chosen ? "z-20 selected-card" : isTouched ? "z-20 touch-card" : "z-10",
                    "transition-all duration-200 ease-out",
                    !shuffling && !chosen ? "active:scale-95" : "",
                  ].join(" ")}
                  style={{
                    marginLeft: i > 0 ? -overlap : 0,
                    animationDelay: shuffling ? `${i * 60}ms` : undefined,
                    // เปลี่ยนจาก scale และ rotate เป็นแค่เลื่อนขึ้นเล็กน้อย
                    transform: chosen 
                      ? 'translateY(-8px)'
                      : isTouched 
                      ? 'translateY(-6px) scale(1.04)' 
                      : 'translateY(0) scale(1)',
                  }}
                >
                  {/* Card image */}
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
                    className={[
                      "absolute inset-0 rounded-md sm:rounded-lg pointer-events-none transition-all duration-200",
                      chosen 
                        ? "ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]" 
                        : isTouched 
                        ? "ring-2 ring-white/60 shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                        : "ring-1 ring-white/15"
                    ].join(" ")}
                  />

                  {/* Selection number badge - ขนาดเล็กลงสำหรับมือถือ */}
                  {chosen && (
                    <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 z-40 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-900 shadow-lg animate-scale-in">
                      {selectionOrder + 1}
                    </div>
                  )}

                  {/* Touch feedback overlay */}
                  {isTouched && (
                    <div className="absolute inset-0 bg-white/15 rounded-md sm:rounded-lg pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* keyframes - ปรับให้เหมาะกับมือถือ */}
      <style jsx global>{`
        @keyframes tarot-shuffle {
          0%   { transform: translateY(0) rotate(0deg) scale(1); }
          20%  { transform: translateY(-6px) rotate(-0.8deg) scale(1.015); }
          40%  { transform: translateY(-3px) rotate(0.6deg) scale(1.01); }
          60%  { transform: translateY(-5px) rotate(-0.5deg) scale(1.015); }
          80%  { transform: translateY(-2px) rotate(0.3deg) scale(1.01); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }
        
        .shuffle-card {
          animation: tarot-shuffle 1000ms ease-in-out infinite;
        }

        .selected-card {
          animation: card-select-subtle 250ms ease-out forwards;
        }

        @keyframes card-select-subtle {
          0% { 
            transform: translateY(0);
          }
          50% { 
            transform: translateY(-12px);
          }
          100% { 
            transform: translateY(-8px);
          }
        }

        .touch-card {
          animation: card-touch 150ms ease-out forwards;
        }

        @keyframes card-touch {
          0% { 
            transform: translateY(0) scale(1);
          }
          100% { 
            transform: translateY(-6px) scale(1.04);
          }
        }

        @keyframes scale-in {
          0% { 
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.15) rotate(0deg);
          }
          100% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Safe area สำหรับ iPhone */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe {
            padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
          }
        }

        /* ปรับ breakpoint สำหรับหน้าจอเล็ก */
        @media (max-width: 374px) {
          .shuffle-card,
          .selected-card,
          .touch-card {
            animation-duration: 2000ms;
          }
        }
      `}</style>
    </div>
  );
}