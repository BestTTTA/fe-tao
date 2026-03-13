// app/reading/[spreadId]/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";

// Helper to get card count from spreadId
function spreadCountFromId(id?: string): number {
  if (!id) return 3;
  if (id === "12circle") return 12;
  const match = /^(\d+)-card$/.exec(id);
  return match ? Math.max(1, Math.min(12, parseInt(match[1], 10))) : 3;
}

export default function ReadingQuestionPage() {
  const router = useRouter();
  const params = useParams<{ spreadId?: string; spredId?: string }>();
  const spreadId = params.spreadId ?? params.spredId ?? "3-card"; // ✅ กัน undefined
  const search = useSearchParams();
  const deckId = search.get("deck") ?? "";
  const [question, setQuestion] = useState("");

  const cardCount = spreadCountFromId(spreadId);


  const go = (mode: "auto" | "manual") => {
    const q = encodeURIComponent(question.trim());
    const d = encodeURIComponent(deckId);

    if (mode === "auto") {
      // Auto mode: Fisher-Yates shuffle and go straight to result
      const cardCount = spreadCountFromId(spreadId);
      const totalCards = 18;

      // Fisher-Yates shuffle to get random unique indexes
      const allIndexes = Array.from({ length: totalCards }, (_, i) => i);
      for (let i = allIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIndexes[i], allIndexes[j]] = [allIndexes[j], allIndexes[i]];
      }

      // Take first N cards
      const picks = allIndexes.slice(0, cardCount).join(',');
      router.push(`/reading/${spreadId}/result?deck=${d}&pick=${encodeURIComponent(picks)}&q=${q}`);
    } else {
      // Manual mode: go to manual shuffle page
      router.push(`/reading/${spreadId}/${mode}?deck=${d}&q=${q}`);
    }
  };

  return (
    <main className="relative min-h-screen text-white flex items-center">
      <TransparentHeader
        title="เปิดไพ่"
        subtitle=""
        routeRules={{
          "/reading/*": {
            showLogo: false, showSearch: false, showMenu: false,
            showBack: true, backPath: `/reading?deck=${encodeURIComponent(deckId)}`,
          },
        }}
      />

      <section
        className="absolute inset-0 -z-10"
 />

      <div className="mx-auto max-w-md px-4 pt-20 pb-28 w-full flex flex-col items-center text-center gap-4">
        <h2 className="text-2xl font-bold text-white drop-shadow">
          วางไพ่แบบ {cardCount} ใบ
        </h2>

        <div className="w-full text-left">
          <label className="block text-sm font-semibold text-white/90">คำถามหรือเรื่องที่ต้องการดูดวง</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="เว้นไว้หากไม่ต้องการใส่คำถาม"
            rows={3}
            className="mt-2 w-full rounded-lg border border-white/20 bg-white/95 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
          />
        </div>

        <p className="text-sm text-white/80 italic">
          กรุณาตั้งสมาธิแล้วนึกถึงเรื่องที่ต้องการถาม
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10">
        <div className="bg-white rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] mx-auto max-w-md px-4 pt-4 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => go("auto")}
              className="rounded-lg border border-slate-800 bg-white px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              สุ่มอัตโนมัติ
            </button>
            <button
              onClick={() => go("manual")}
              className="rounded-lg border border-slate-800 bg-white px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              สับไพ่เอง
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
