// app/reading/[spreadId]/page.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";
import { useLanguage } from "@/lib/i18n";

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
  const spreadId = params.spreadId ?? params.spredId ?? "3-card";
  const search = useSearchParams();
  const deckId = search.get("deck") ?? "";
  const [question, setQuestion] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxH = 168;
  const { t } = useLanguage();

  const cardCount = spreadCountFromId(spreadId);

  const go = (mode: "auto" | "manual") => {
    const q = encodeURIComponent(question.trim());
    const d = encodeURIComponent(deckId);

    if (mode === "auto") {
      router.replace(`/reading/${spreadId}/manual?deck=${d}&q=${q}&auto=1`);
    } else {
      router.replace(`/reading/${spreadId}/${mode}?deck=${d}&q=${q}`);
    }
  };

  return (
    <main className="relative min-h-screen text-white flex items-center">
      <TransparentHeader
        title={t.reading.title}
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
          {t.reading.spreadCard} {cardCount} {t.reading.cards}
        </h2>

        <div className="w-full text-left">
          <label className="block text-sm font-semibold text-white/90">{t.reading.questionLabel}</label>
          <textarea
            ref={textareaRef}
            value={question}
            maxLength={100}
            onChange={(e) => {
              setQuestion(e.target.value);
              const el = textareaRef.current;
              if (el) {
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
              }
            }}
            placeholder={t.reading.questionPlaceholder}
            rows={3}
            style={{ maxHeight: maxH }}
            className="mt-2 w-full rounded-lg border border-white/20 bg-white/95 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none overflow-y-auto"
          />
          <div className="mt-1 text-right text-xs text-white/60">
            {question.length}/100
          </div>
        </div>

        <p className="text-sm text-white/80 italic">
          {t.reading.focusHint}
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10">
        <div className="bg-white rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] mx-auto max-w-md px-4 pt-4 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => go("auto")}
              className="rounded-lg border border-slate-800 bg-white px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              {t.reading.autoShuffle}
            </button>
            <button
              onClick={() => go("manual")}
              className="rounded-lg border border-slate-800 bg-white px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              {t.reading.manualShuffle}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
