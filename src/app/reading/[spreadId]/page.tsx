// app/reading/[spreadId]/page.tsx
"use client";

import { useState, useMemo } from "react";
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

  const canContinue = useMemo(() => question.trim().length > 0, [question]);

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

      <div className="px-4 pt-20 pb-28 w-full">
        <label className="block text-sm font-semibold text-white/90">ระบุเรื่องที่ต้องการดูดวง</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="กรุณาระบุเรื่องที่ต้องการดูดวง"
          className="mt-2 w-full rounded-lg border border-white/20 bg-white/95 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/40"
        />

        <p className="mt-3 text-xs text-white/80">
          สเปรดที่เลือก: <span className="font-semibold">{spreadId}</span>
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-md px-4 pb-4">
          <div className="rounded-2xl bg-white/90 p-3 text-slate-900 shadow-lg backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => go("auto")}
                disabled={!canContinue}
                className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                สับอัตโนมัติ
              </button>
              <button
                onClick={() => go("manual")}
                disabled={!canContinue}
                className="rounded-xl bg-botton-main px-3 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
              >
                สับไพ่เอง
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none mx-auto mt-2 h-1 w-24 rounded-full bg-white/85" />
      </div>
    </main>
  );
}
