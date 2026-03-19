"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Promotion = {
  id: number;
  banner_url: string | null;
  head: string | null;
  detail: string | null;
  // ถ้าภายหลังคุณมีคอลัมน์ route_url ใน promotions
  // route_url?: string | null;
};

type Props = {
  images?: string[]; // 👈 list URL ของรูป (ลำดับคือสไลด์)
  links?: (string | null)[]; // 👈 path สำหรับแต่ละสไลด์ เช่น ['/promo/1','/promo/2',null]
  enableLink?: boolean; // 👈 เปิด/ปิดการกดแล้ว navigate ทั้งหมด (default true)

  autoPlay?: boolean;
  interval?: number;
  className?: string;
  limit?: number; // ใช้ตอน fallback ไปดึง promotions
  height?: number;
  aspectSquare?: boolean; // 👈 แสดงแบบสี่เหลี่ยมจัตุรัส
  showArrows?: boolean; // 👈 แสดง/ซ่อนลูกศรซ้าย-ขวา (default true)
  fitContent?: boolean; // 👈 ให้ขนาดพอดีกับรูป ไม่ fix height
  showShadow?: boolean; // 👈 แสดง/ซ่อน shadow (default true)
  darkDots?: boolean; // 👈 ใช้ dots สีเข้ม (สำหรับพื้นหลังสว่าง)
};

export default function TarotCarousel({
  images,
  links,
  enableLink = true,
  autoPlay = true,
  interval = 4000,
  className = "",
  limit = 5,
  height = 220,
  aspectSquare = false,
  showArrows = true,
  fitContent = false,
  showShadow = true,
  darkDots = false,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  // ภาพที่ใช้จริง (มาจาก props หรือดึงจาก DB)
  const [slides, setSlides] = useState<string[]>([]);
  // เก็บลิงก์ของสไลด์ในรูปแบบอาร์เรย์ index ตรงกับ slides
  const [slideLinks, setSlideLinks] = useState<(string | null)[]>([]);

  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // เตรียม slides จาก props หรือ promotions
  useEffect(() => {
    let mounted = true;

    // ถ้ามี images จาก props → ใช้เลย
    if (images && images.length > 0) {
      const cleanImgs = images.filter(Boolean) as string[];
      setSlides(cleanImgs);

      // map links ตาม index ของ images
      if (links && links.length > 0) {
        // ถ้ามี links ที่ส่งมา เราจะ align ตาม index
        const alignedLinks = cleanImgs.map((_, i) => links[i] ?? null);
        setSlideLinks(alignedLinks);
      } else {
        // ไม่มี links จาก props → ใส่ null หมด (ไม่ navigate)
        setSlideLinks(cleanImgs.map(() => null));
      }

      setIndex(0);
      setLoading(false);
      return;
    }

    // ไม่มี images → ดึง promotions จาก DB เป็น fallback
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("promotions")
        .select("banner_url") // ถ้าอยากมีลิงก์ในอนาคต: เพิ่มคอลัมน์ route_url แล้ว select มาด้วย
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!mounted) return;

      if (!error && data) {
        // ดึงรูป
        const promoSlides = data
          .map((d) => d.banner_url)
          .filter((u): u is string => !!u);

        setSlides(promoSlides);

        // fallback promotions ตอนนี้ยังไม่มี path → ใส่ null
        setSlideLinks(promoSlides.map(() => null));
      } else {
        setSlides([]);
        setSlideLinks([]);
      }

      setIndex(0);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [images, links, limit, supabase]);

  // autoplay
  useEffect(() => {
    if (!autoPlay || loading || slides.length <= 1) return;
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      interval,
    );

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, autoPlay, interval, slides.length, loading]);

  // swipe / drag
  const startX = useRef(0);
  const deltaX = useRef(0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    deltaX.current = 0;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    if (timer.current) clearTimeout(timer.current);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current) {
      deltaX.current = e.clientX - startX.current;
    }
  };

  const onPointerUp = () => {
    const threshold = 60;
    if (deltaX.current > threshold) prev();
    else if (deltaX.current < -threshold) next();
    startX.current = 0;
    deltaX.current = 0;
  };

  const prev = () => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  };
  const next = () => {
    setIndex((i) => (i + 1) % slides.length);
  };

  // click handler ของแต่ละสไลด์
  const handleSlideClick = (slideIdx: number) => {
    // ปิดการนำทางทั้งหมด?
    if (!enableLink) return;

    const href = slideLinks[slideIdx];
    if (!href) return; // สไลด์นี้ไม่มีลิงก์ → ไม่ไปไหน

    router.push(href);
  };

  // render
  if (loading) {
    return (
      <div className={`relative mx-auto w-full ${className}`}>
        <div className="h-[220px] animate-pulse rounded-2xl bg-slate-200/40" />
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className={`relative mx-auto w-full ${className}`}>
      <div
        className={`overflow-hidden rounded-lg ${aspectSquare ? "aspect-square" : ""}`}
        style={aspectSquare || fitContent ? undefined : { height }}
      >
        <div
          className={`flex ${fitContent ? "" : "h-full"} transition-transform duration-500`}
          style={{ transform: `translateX(-${index * 100}%)` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {slides.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className={`relative ${fitContent ? "" : "h-full"} w-full flex-[0_0_100%] ${
                enableLink && slideLinks[i]
                  ? "cursor-pointer"
                  : "cursor-default"
              }`}
              onClick={() => handleSlideClick(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className={fitContent
                  ? "w-full object-contain"
                  : "absolute inset-0 h-full w-full object-contain"
                }
                draggable={false}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          {/* prev / next arrows */}
          {showArrows && (
            <>
              <button
                onClick={prev}
                aria-label="Previous"
                className="absolute left-1 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-black/5 hover:bg-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <button
                onClick={next}
                aria-label="Next"
                className="absolute right-1 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-black/5 hover:bg-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          {/* dots */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? `w-6 ${darkDots ? "bg-gray-700" : "bg-white"}`
                    : `w-2 ${darkDots ? "bg-gray-400" : "bg-white/40"}`
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
