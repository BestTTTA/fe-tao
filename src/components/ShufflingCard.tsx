"use client";

import { useEffect, useState } from "react";

/**
 * ShufflingCard — JS-sequenced animation
 * กองซ้อน → คลี่ขวา (stagger) → ค้าง → เก็บกลับ+TOP card overshoot ซ้าย → top card คืน → คลี่ทันที
 * - TOP card = ใบบนสุด (z-index สูงสุด = i = CARD_COUNT-1)
 */

const CARD_COUNT = 10;
const CARD_W     = 75;
const CARD_H     = 105;
const SPREAD     = 230; // px รวม
const BOUNCE_L   = -12; // px เด้งซ้ายของ anchor

// timing (ms)
const T = {
  spreadMove:    200,  // ความเร็วคลี่
  spreadStagger:  70,  // offset ระหว่างใบตอนคลี่
  spreadHold:    200,  // ค้างที่กาง
  gatherMove:    200,  // ความเร็วเก็บ
  gatherStagger:  55,  // offset ระหว่างใบตอนเก็บ
  gatherHold:    200,  // รอหลังใบสุดท้ายกลับ (ทุกใบกลับครบก่อน)
  bounceOut:     50,  // เด้งซ้าย
  bounceHold:     50,  // ค้างที่เด้ง
  bounceReturn:  160,  // กลับจากเด้ง
  loopPause:     200,  // พักก่อน loop ใหม่
} as const;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function ShufflingCard({ backUrl }: { backUrl: string }) {
  const [positions,  setPositions]  = useState<number[]>(Array(CARD_COUNT).fill(0));
  const [durations,  setDurations]  = useState<number[]>(Array(CARD_COUNT).fill(T.spreadMove));
  const [delays,     setDelays]     = useState<number[]>(Array(CARD_COUNT).fill(0));

  useEffect(() => {
    let alive = true;

    const run = async () => {
      while (alive) {
        // ── 1. คลี่ขวา (card 0 อยู่กับที่) ──
        setDurations(Array(CARD_COUNT).fill(T.spreadMove));
        // top card (i = CARD_COUNT-1) นำออกก่อน → delay ย้อนกลับ
        setDelays(Array.from({ length: CARD_COUNT }, (_, i) => (CARD_COUNT - 1 - i) * T.spreadStagger));
        setPositions(Array.from({ length: CARD_COUNT }, (_, i) =>
          (i / (CARD_COUNT - 1)) * SPREAD
        ));
        await sleep((CARD_COUNT - 1) * T.spreadStagger + T.spreadMove + T.spreadHold);
        if (!alive) break;

        // ── 2. เก็บกลับ — cards 0..8 → 0, TOP card (i=9) → BOUNCE_L (overshoot ซ้าย) ──
        const TOP = CARD_COUNT - 1;
        setDurations(Array(CARD_COUNT).fill(T.gatherMove));
        setDelays(Array.from({ length: CARD_COUNT }, (_, i) => i * T.gatherStagger));
        const gatherPos = Array(CARD_COUNT).fill(0);
        gatherPos[TOP] = BOUNCE_L; // top card overshoot ซ้าย พร้อมกับที่กลับมา
        setPositions(gatherPos);
        // รอให้ top card (delay ยาวสุด) ถึง BOUNCE_L + ค้างนิดนึง
        await sleep((CARD_COUNT - 1) * T.gatherStagger + T.gatherMove + T.bounceHold);
        if (!alive) break;

        // ── 3. top card คืนจาก BOUNCE_L → 0 ──
        const durReturn = Array(CARD_COUNT).fill(0);
        durReturn[TOP] = T.bounceReturn;
        setDurations(durReturn);
        setDelays(Array(CARD_COUNT).fill(0));
        setPositions(Array(CARD_COUNT).fill(0));
        await sleep(T.bounceReturn);
        if (!alive) break;
        // ── ไม่มี loopPause — คลี่ออกทันที ──
      }
    };

    run();
    return () => { alive = false; };
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative overflow-visible" style={{ width: SPREAD + CARD_W, height: CARD_H }}>
        {Array.from({ length: CARD_COUNT }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: `calc(50% - ${CARD_W / 2}px)`,
              zIndex: i,
              transform: `translateX(${positions[i]}px)`,
              transition: `transform ${durations[i]}ms ease-in-out ${delays[i]}ms`,
              willChange: "transform",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backUrl}
              alt=""
              draggable={false}
              className="block rounded-lg object-cover select-none shadow-lg"
              style={{ width: CARD_W, height: CARD_H }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
