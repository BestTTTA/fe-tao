"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type Deck = {
  id: number;
  deck_name: string;
  deck_url: string | null;
  free: boolean;
};

type FavoriteRow = { deck_id: number }; // ← ตรงกับ select("deck_id")

export default function FreeDecksSection({
  title = "ไพ่ฟรีเฉพาะสมาชิก",
  limit = 20,
  className = "",
}: {
  title?: string;
  limit?: number;
  className?: string;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [favDeckIds, setFavDeckIds] = useState<Set<number>>(new Set());
  const [profileId, setProfileId] = useState<string | null>(null);

  // โหลด decks + favorites
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);

      const [{ data: auth }, decksRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("decks")
          .select("id, deck_name, deck_url, free")
          .eq("free", true)
          .order("created_at", { ascending: false })
          .limit(limit)
          .returns<Deck[]>(),
      ]);

      if (!mounted) return;

      const uid = auth.user?.id ?? null;
      setProfileId(uid);

      if (decksRes.error || !decksRes.data) {
        setDecks([]);
        setLoading(false);
        return;
      }

      setDecks(decksRes.data);

      // ถ้าล็อกอินแล้ว โหลดรายการ favorite
      if (uid) {
        const { data: favs } = await supabase
          .from("favorites")
          .select("deck_id")
          .eq("profile_id", uid)
          .returns<FavoriteRow[]>();

        if (mounted && favs) {
          setFavDeckIds(new Set(favs.map((f) => f.deck_id)));
        }
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const toggleFavorite = useCallback(
    async (deckId: number) => {
      if (!profileId) {
        alert("กรุณาเข้าสู่ระบบก่อนบันทึกเป็นรายการโปรด");
        return;
      }

      const isFavNow = favDeckIds.has(deckId);

      // optimistic UI
      setFavDeckIds((prev) => {
        const next = new Set(prev);
        isFavNow ? next.delete(deckId) : next.add(deckId);
        return next;
      });

      if (isFavNow) {
        // ลบ
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("profile_id", profileId)
          .eq("deck_id", deckId);

        if (error) {
          // rollback
          setFavDeckIds((prev) => new Set(prev).add(deckId));
        }
      } else {
        // เพิ่ม
        const { error } = await supabase.from("favorites").insert({
          profile_id: profileId,
          deck_id: deckId,
        });

        if (error) {
          // rollback
          setFavDeckIds((prev) => {
            const next = new Set(prev);
            next.delete(deckId);
            return next;
          });
        }
      }
    },
    [profileId, favDeckIds, supabase]
  );

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-2">
              <div className="h-36 w-full animate-pulse rounded-xl bg-white/10" />
              <div className="mt-3 h-4 w-24 animate-pulse rounded bg-white/20" />
              <div className="mt-3 flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-white/10" />
                <div className="h-8 w-20 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!decks.length) {
      return <p className="text-white/80">ยังไม่มีเด็คฟรีในขณะนี้</p>;
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {decks.map((d) => (
          <DeckCard
            key={d.id}
            deck={d}
            isFav={favDeckIds.has(d.id)}
            onToggleFav={() => toggleFavorite(d.id)}
          />
        ))}
      </div>
    );
  }, [loading, decks, favDeckIds, toggleFavorite]);

  return (
    <section className={className}>
      <h2 className="mb-3 text-lg font-bold text-white">{title}</h2>
      {content}
    </section>
  );
}

function DeckCard({
  deck,
  isFav,
  onToggleFav,
}: {
  deck: Deck;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  return (
    <div className="relative rounded-2xl border bg-white p-2">

      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={deck.deck_url || "/placeholder-deck.jpg"}
          alt={deck.deck_name}
          className="h-36 w-full rounded-2xl object-cover bg-gradient-to-br from-slate-50 to-slate-100"
          draggable={false}
          loading="lazy"
        />

        <button
          onClick={onToggleFav}
          aria-label={isFav ? "นำออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full  text-slate-800"
        >
          {isFav ? <HeartSolid /> : <Heart />}
        </button>
      </div>

      <div className="mt-2 line-clamp-1 text-[13px] font-semibold text-black px-2">
        {deck.deck_name}
      </div>

      <div className="mt-2 flex gap-2">
        <Link
          href={`/decks/${deck.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-[13px] font-semibold text-black ring-1 ring-black hover:bg-white/20"
        >
          ดูข้อมูล
        </Link>
        <Link
          href={`/reading?deck=${deck.id}`} 
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-botton-main px-3 py-2 text-[13px] font-semibold text-white"
        >
          ดูดวง
        </Link>

      </div>
    </div>
  );
}

/* ------------ Icons ------------ */
function Heart() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="4">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}
function HeartSolid() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="red">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}
