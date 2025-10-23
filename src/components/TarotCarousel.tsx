"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Promotion = {
  id: number;
  banner_url: string | null;
  head: string | null;
  detail: string | null;
};

type Props = {
  images?: string[]; // 👈 รองรับ list URL
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  limit?: number; // ใช้ตอน fallback ไปดึง promotions
  height?: number;
};

export default function TarotCarousel({
  images,
  autoPlay = true,
  interval = 4000,
  className = "",
  limit = 5,
  height = 220,
}: Props) {
  const supabase = createClient();

  // ภาพที่ใช้จริง (มาจาก props หรือดึงจาก DB)
  const [slides, setSlides] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // เตรียม slides
  useEffect(() => {
    let mounted = true;

    // ถ้ามี images ที่ส่งเข้ามา ให้ใช้ทันที
    if (images && images.length > 0) {
      setSlides(images.filter(Boolean));
      setIndex(0);
      setLoading(false);
      return;
    }

    // ไม่ได้ส่ง images → ดึง promotions
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("promotions")
        .select("banner_url")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!mounted) return;

      if (!error && data) {
        setSlides(
          data.map((d) => d.banner_url).filter((u): u is string => !!u),
        );
      } else {
        setSlides([]);
      }
      setIndex(0);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [images, limit, supabase]);

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
    if (startX.current) deltaX.current = e.clientX - startX.current;
  };
  const onPointerUp = () => {
    const threshold = 60;
    if (deltaX.current > threshold) prev();
    else if (deltaX.current < -threshold) next();
    startX.current = 0;
    deltaX.current = 0;
  };

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  if (loading) {
    return (
      <div className={`relative mx-auto w-[310px] sm:w-[360px] ${className}`}>
        <div className="h-[220px] animate-pulse rounded-2xl bg-slate-200/40" />
      </div>
    );
  }
  if (slides.length === 0) return null;

  return (
    <div className={`relative mx-auto w-full ${className}`}>
      <div
        className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur"
        style={{ height }}
      >
        <div
          className="flex h-full transition-transform duration-500"
          style={{ transform: `translateX(-${index * 100}%)` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {slides.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-full w-full flex-[0_0_100%]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full rounded-2xl object-cover"
                draggable={false}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
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
          <div className="mt-2 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
