/* ---------------------------------------------- */
/* --------- ด้านล่างเป็น Client component ------ */
/* ---------------------------------------------- */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";
import { createClient } from "@/utils/supabase/client";

/* ---------- Types ---------- */
type ResultItem =
  | {
      kind: "card";
      id: number;
      deck_id: number | null;
      title: string;
      deckName?: string;
      describe?: string;
      subtitle?: string;
      image?: string | null;
      locked?: boolean;
    }
  | {
      kind: "deck";
      id: number;
      title: string;
      subtitle?: string;
      image?: string | null;
      free?: boolean;
    };

type CardRow = {
  id: number;
  deck_id: number | null;
  card_name: string;
  card_url: string | null;
  describe: string | null;
  work_meaning: string | null;
  money_meaning: string | null;
  relation: string | null;
  decks?: { id: number; deck_name: string; free: boolean } | null;
};

type SupaCardRow = Omit<CardRow, "decks"> & {
  decks?: { id: number; deck_name: string; free: boolean } | { id: number; deck_name: string; free: boolean }[] | null;
};

type DeckRow = { id: number; deck_name: string; deck_url: string | null; detail: string | null; free: boolean };

const toPublicUrl = (p?: string | null) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`;
};

export default function SearchClient() {
  const router = useRouter();
  const supabase = createClient();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";

  const [q, setQ] = useState(initialQ);
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVip, setIsVip] = useState(false);

  // ดึงสถานะ VIP ของ user
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_type, plan_status")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        const vip =
          (profile.plan_type === "MONTH" || profile.plan_type === "YEAR") &&
          (profile.plan_status === "active" || profile.plan_status === "trialing");
        setIsVip(vip);
      }
    })();
  }, [supabase]);

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
          .select("id, deck_name, deck_url, detail, free")
          .or(`deck_name.ilike.${like},detail.ilike.${like}`)
          .limit(10)
          .returns<DeckRow[]>();

        // ---- ค้นหา CARDS (join decks) ----
        const cardsPromise = supabase
          .from("cards")
          .select(
            "id, deck_id, card_name, card_url, describe, work_meaning, money_meaning, relation, decks(id,deck_name,free)"
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
            image: toPublicUrl(d.deck_url),
            free: d.free,
          }));

        const cardItems: ResultItem[] =
          (cards ?? []).map((c) => {
            const deckRef =
              Array.isArray(c.decks) ? (c.decks[0] ?? null) : c.decks ?? null;
            const deckFree = deckRef?.free ?? true;

            return {
              kind: "card" as const,
              id: c.id,
              deck_id: c.deck_id ?? null,
              title: c.card_name,
              deckName: deckRef?.deck_name ?? undefined,
              describe: c.describe ?? undefined,
              subtitle:
                deckRef?.deck_name ??
                c.describe ??
                c.work_meaning ??
                c.money_meaning ??
                c.relation ??
                undefined,
              image: toPublicUrl(c.card_url),
              locked: !deckFree && !isVip,
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
  }, [q, supabase, isVip]);

  const display = q.trim() ? results : [];

  const go = (item: ResultItem) => {
    if (item.kind === "deck") {
      router.push(`/decks/${item.id}`);
      return;
    }
    // ถ้าไพ่ถูกล็อก → ไปหน้าแพ็กเกจ
    if (item.locked) {
      router.push("/packages");
      return;
    }
    // kind === "card" → ไปหน้ารายละเอียดการ์ด
    if (item.deck_id) {
      router.push(`/decks/${item.deck_id}/cards/${item.id}`);
    } else {
      router.push(`/cards/${item.id}`);
    }
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
                พิมพ์คำค้น เช่น "เดอะซัน", "ความรัก", "Rider Waite"
              </div>
            ) : display.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-600">
                ไม่พบผลลัพธ์สำหรับ "{q}"
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {display.map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <button
                      onClick={() => go(item)}
                      className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-slate-50"
                    >
                      {/* รูปภาพ */}
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt=""
                          className={`flex-none rounded-lg object-cover ${
                            item.kind === "deck" ? "h-16 w-16" : "h-16 w-12"
                          }`}
                        />
                      ) : (
                        <div className={`flex-none rounded-lg bg-slate-200 ${
                          item.kind === "deck" ? "h-16 w-16" : "h-16 w-12"
                        }`} />
                      )}

                      {/* เนื้อหา */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[15px] font-semibold text-slate-900">
                            {item.title}
                          </span>
                          <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {item.kind === "card" ? "ไพ่" : "สำรับ"}
                          </span>
                          {item.kind === "card" && item.locked && (
                            <LockIcon />
                          )}
                          {item.kind === "deck" && item.free === false && (
                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              VIP
                            </span>
                          )}
                        </div>
                        {item.kind === "card" && item.deckName && (
                          <p className="mt-0.5 text-xs text-violet-600">
                            {item.deckName}
                          </p>
                        )}
                        {item.kind === "card" && item.describe ? (
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {item.describe}
                          </p>
                        ) : item.subtitle ? (
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {item.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </button>
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
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
