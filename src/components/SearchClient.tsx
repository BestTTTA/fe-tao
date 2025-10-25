/* ---------------------------------------------- */
/* --------- ด้านล่างเป็น Client component ------ */
/* ---------------------------------------------- */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";
import { createClient } from "@/utils/supabase/client";

/* ---------- Types ---------- */
type ResultItem =
  | {
      kind: "card";
      id: number;
      deck_id: number | null;
      title: string; // card_name
      subtitle?: string; // deck_name หรือคำอธิบายอื่น
    }
  | {
      kind: "deck";
      id: number;
      title: string; // deck_name
      subtitle?: string; // detail
    };

type CardRow = {
  id: number;
  deck_id: number | null;
  card_name: string;
  describe: string | null;
  work_meaning: string | null;
  money_meaning: string | null;
  relation: string | null;
  decks?: { id: number; deck_name: string } | null; // <- normalize แล้ว
};

// ชนิด “ดิบ” จาก Supabase (decks อาจเป็น object หรือ array)
type SupaCardRow = Omit<CardRow, "decks"> & {
  decks?: { id: number; deck_name: string } | { id: number; deck_name: string }[] | null;
};

type DeckRow = { id: number; deck_name: string; detail: string | null };

export default function SearchClient() {
  const router = useRouter();
  const supabase = createClient();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";

  const [q, setQ] = useState(initialQ);
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  // filter ฝั่ง client สำหรับผลลัพธ์ที่ดึงมาแล้ว (เผื่อใช้งานภายหลัง)
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return [];
    return results.filter(
      (r) =>
        r.title.toLowerCase().includes(k) ||
        (r.subtitle ? r.subtitle.toLowerCase().includes(k) : false)
    );
  }, [q, results]);

  // sync URL ?q=
  useEffect(() => {
    const usp = new URLSearchParams();
    if (q.trim()) usp.set("q", q.trim());
    router.replace(`/search${usp.toString() ? `?${usp.toString()}` : ""}`, {
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // ค้นหาจาก Supabase (debounce 250ms)
  useEffect(() => {
    const keyword = q.trim();
    if (!keyword) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        setLoading(true);

        // ilike pattern
        const like = `%${keyword}%`;

        // ---- ค้นหา DECKS ----
        const decksPromise = supabase
          .from("decks")
          .select("id, deck_name, detail")
          .or(`deck_name.ilike.${like},detail.ilike.${like}`)
          .limit(10)
          .returns<DeckRow[]>();

        // ---- ค้นหา CARDS (join decks) ----
        const cardsPromise = supabase
          .from("cards")
          .select(
            "id, deck_id, card_name, describe, work_meaning, money_meaning, relation, decks(id,deck_name)"
          )
          .or(
            [
              `card_name.ilike.${like}`,
              `describe.ilike.${like}`,
              `work_meaning.ilike.${like}`,
              `money_meaning.ilike.${like}`,
              `relation.ilike.${like}`,
            ].join(",")
          )
          .limit(10)
          .returns<SupaCardRow[]>();

        const [{ data: decks, error: deckErr }, { data: cards, error: cardErr }] =
          await Promise.all([decksPromise, cardsPromise]);

        if (deckErr) throw deckErr;
        if (cardErr) throw cardErr;

        const deckItems: ResultItem[] =
          (decks ?? []).map((d) => ({
            kind: "deck" as const,
            id: d.id,
            title: d.deck_name,
            subtitle: d.detail ?? undefined,
          }));

        // normalize decks relation: array -> object ตัวแรก, object -> ใช้ตรง ๆ, undefined -> null
        const cardItems: ResultItem[] =
          (cards ?? []).map((c) => {
            const deckRef =
              Array.isArray(c.decks) ? (c.decks[0] ?? null) : c.decks ?? null;

            return {
              kind: "card" as const,
              id: c.id,
              deck_id: c.deck_id ?? null,
              title: c.card_name,
              subtitle:
                deckRef?.deck_name ??
                c.describe ??
                c.work_meaning ??
                c.money_meaning ??
                c.relation ??
                undefined,
            };
          });

        setResults([...cardItems, ...deckItems]);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [q, supabase]);

  const display = q.trim() ? filtered : [];

  const go = (item: ResultItem) => {
    if (item.kind === "deck") {
      router.push(`/decks/${item.id}`);
      return;
    }
    // kind === "card"
    // ไปหน้า card detail หรือ reading ตามที่ต้องการ
    // ตัวอย่างนี้ส่งไปหน้ารายละเอียดการ์ด:
    router.push(`/cards/${item.id}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (display[0]) go(display[0]);
  };

  return (
    <main className="relative min-h-screen">
      {/* Header */}
      <TransparentHeader
        title="TAROT"
        subtitle="& ORACLE"
        routeRules={{
          "/search": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: "/",
          },
        }}
      />

      {/* BG */}
      <section
        className="relative h-[210px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 " />
      </section>

      {/* Content */}
      <div className="relative -mt-16 mx-auto max-w-md px-4 pb-24">
        {/* Search box */}
        <form onSubmit={onSubmit} className="relative">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            placeholder="พิมพ์ชื่อไพ่ ชื่อสำรับ หรือคำสำคัญของความหมายไพ่"
            className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 pr-10 text-[15px] text-slate-900 shadow ring-1 ring-black/5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {!q && (
            <button
              type="submit"
              aria-label="ค้นหา"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <SearchIcon />
            </button>
          )}

          {!!q && (
            <button
              type="button"
              aria-label="ล้างคำค้น"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <CloseIcon />
            </button>
          )}
        </form>

        {/* Results */}
        {(focused || q) && (
          <div className="mt-3 overflow-hidden rounded-2xl bg-white/95 shadow-lg ring-1 ring-black/5 backdrop-blur">
            {loading ? (
              <div className="px-4 py-4 text-sm text-slate-600">กำลังค้นหา...</div>
            ) : !q.trim() ? (
              <div className="px-4 py-4 text-sm text-slate-600">
                พิมพ์คำค้น เช่น “เดอะซัน”, “ความรัก”, “Rider Waite”
              </div>
            ) : display.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-600">
                ไม่พบผลลัพธ์สำหรับ “{q}”
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {display.map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <button
                      onClick={() => go(item)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <span className="text-[15px] text-slate-900">{item.title}</span>
                      <span className="ml-3 shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {item.kind === "card" ? "ไพ่" : "สำรับ"}
                      </span>
                    </button>
                    {item.subtitle && (
                      <div className="px-4 pb-3 -mt-2 text-xs text-slate-500">
                        {item.subtitle}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

/* ------- icons ------- */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-3.8-3.8" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
