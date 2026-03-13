"use client";

import { useEffect, useState } from "react";

const CARD_COUNT = 10;
const CARD_W     = 75;
const CARD_H     = 105;
const SPREAD     = 230;   // total px range of spread
const STACK_POS  = -115;  // translateX when stacked → centers the spread on screen
const BOUNCE_OV  = -18;   // overshoot px past stack for TOP card (negative = further left)

const T = {
  spreadMove:    320,  // duration of spread
  spreadStagger:  55,  // stagger per card
  spreadHold:    450,  // hold at spread
  gatherMove:    280,  // duration of gather
  gatherStagger:  45,  // stagger per card
  bounceHold:     70,  // hold at overshoot
  bounceReturn:  240,  // TOP card springs back
  loopPause:     120,  // pause before next loop
} as const;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function ShufflingCard({ backUrl }: { backUrl: string }) {
  const [positions, setPositions] = useState<number[]>(Array(CARD_COUNT).fill(STACK_POS));
  const [durations, setDurations] = useState<number[]>(Array(CARD_COUNT).fill(T.spreadMove));
  const [delays,    setDelays]    = useState<number[]>(Array(CARD_COUNT).fill(0));
  const [easings,   setEasings]   = useState<string[]>(Array(CARD_COUNT).fill("ease-out"));

  useEffect(() => {
    let alive = true;

    const run = async () => {
      while (alive) {
        // ── 1. คลี่ออก symmetric รอบ stack (top card นำ) ──
        setEasings(Array(CARD_COUNT).fill("cubic-bezier(0.22, 1, 0.36, 1)"));
        setDurations(Array(CARD_COUNT).fill(T.spreadMove));
        setDelays(Array.from({ length: CARD_COUNT }, (_, i) => (CARD_COUNT - 1 - i) * T.spreadStagger));
        setPositions(Array.from({ length: CARD_COUNT }, (_, i) =>
          STACK_POS + (i / (CARD_COUNT - 1)) * SPREAD
        ));
        await sleep((CARD_COUNT - 1) * T.spreadStagger + T.spreadMove + T.spreadHold);
        if (!alive) break;

        // ── 2. เก็บกลับ (bottom card ก่อน) TOP card overshoot past stack ──
        const TOP = CARD_COUNT - 1;
        setEasings(Array(CARD_COUNT).fill("cubic-bezier(0.4, 0, 0.2, 1)"));
        setDurations(Array(CARD_COUNT).fill(T.gatherMove));
        setDelays(Array.from({ length: CARD_COUNT }, (_, i) => i * T.gatherStagger));
        const gatherPos = Array(CARD_COUNT).fill(STACK_POS);
        gatherPos[TOP] = STACK_POS + BOUNCE_OV; // TOP ไปเกินซ้ายนิดนึง
        setPositions(gatherPos);
        await sleep((CARD_COUNT - 1) * T.gatherStagger + T.gatherMove + T.bounceHold);
        if (!alive) break;

        // ── 3. TOP card สปริงกลับมาที่ stack ──
        const durReturn = Array(CARD_COUNT).fill(0);
        durReturn[TOP] = T.bounceReturn;
        const easReturn = Array(CARD_COUNT).fill("ease-out");
        easReturn[TOP] = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // spring bounce
        setEasings(easReturn);
        setDurations(durReturn);
        setDelays(Array(CARD_COUNT).fill(0));
        setPositions(Array(CARD_COUNT).fill(STACK_POS));
        await sleep(T.bounceReturn + T.loopPause);
        if (!alive) break;
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
              transition: `transform ${durations[i]}ms ${easings[i]} ${delays[i]}ms`,
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
