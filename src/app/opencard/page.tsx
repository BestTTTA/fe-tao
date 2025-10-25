"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";
import { createClient } from "@/utils/supabase/client";

type DbDeck = {
  id: number;
  deck_name: string;
  deck_url: string | null;
  free: boolean;
};

type DeckVM = {
  id: number;
  name: string;
  image: string | null;
  vipOnly: boolean;
};

type TabKey = "all" | "fav";
type PlanType = "FREE" | "MONTH" | "YEAR";

const toPublicUrl = (p?: string | null) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`;
};

export default function OpenCardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState<DeckVM[]>([]);
  const [favDeckIds, setFavDeckIds] = useState<Set<number>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [planType, setPlanType] = useState<PlanType>("FREE");

  // โหลด decks + user + favorites + plan_type
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      // 1) โหลด deck ทั้งหมด
      const { data: deckRows, error: deckErr } = await supabase
        .from("decks")
        .select("id, deck_name, deck_url, free")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (deckErr) {
        setDecks([]);
      } else {
        const vm = (deckRows ?? []).map<DeckVM>((d: DbDeck) => ({
          id: d.id,
          name: d.deck_name,
          image: toPublicUrl(d.deck_url),
          vipOnly: !d.free,
        }));
        setDecks(vm);
      }

      // 2) ดึง user
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      setUserId(uid);

      // 3) ถ้ามี user → โหลด favorites + plan
      if (uid) {
        const { data: favs } = await supabase
          .from("favorites")
          .select("deck_id")
          .eq("profile_id", uid);

        if (favs) {
          setFavDeckIds(
            new Set(favs.map((f: { deck_id: number }) => f.deck_id)),
          );
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_type")
          .eq("id", uid)
          .single();

        if (profile?.plan_type) {
          setPlanType(profile.plan_type as PlanType);
        } else {
          setPlanType("FREE");
        }
      } else {
        setFavDeckIds(new Set());
        setPlanType("FREE");
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  // toggle favorite
  const toggleFav = useCallback(
    async (deckId: number) => {
      if (!userId) {
        alert("กรุณาเข้าสู่ระบบก่อนบันทึกเป็นรายการโปรด");
        return;
      }

      const isFav = favDeckIds.has(deckId);

      // optimistic update
      setFavDeckIds((prev) => {
        const next = new Set(prev);
        isFav ? next.delete(deckId) : next.add(deckId);
        return next;
      });

      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("profile_id", userId)
          .eq("deck_id", deckId);
        if (error) {
          // rollback
          setFavDeckIds((prev) => new Set(prev).add(deckId));
        }
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ profile_id: userId, deck_id: deckId });
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
    [userId, supabase, favDeckIds],
  );

  const listToShow = useMemo(() => {
    const list = decks.map((d) => ({ ...d, favorite: favDeckIds.has(d.id) }));
    return tab === "fav" ? list.filter((d) => d.favorite) : list;
  }, [tab, decks, favDeckIds]);

  // ✅ ใหม่: handler ตอนกด "ดูดวง"
  // ขั้นตอน:
  // - ถ้า deck VIP แต่ user ยัง FREE -> บล็อกทันที (frontend)
  // - มิฉะนั้นยิง fetch ไปที่ /api/decks/[deckId]/open
  //   ซึ่งจะ:
  //     - verify plan active
  //     - เช็คโควต้า MONTH 20 ครั้ง/วัน
  //     - insert card_draw_logs ถ้า allow
  //     - คืน 200 + deck data ถ้า ok
  // - ถ้า response.ok → ไปหน้า reading
  // - ถ้าไม่ → alert ข้อความ error ที่ API ส่งมา
  const handleReadClick = useCallback(
    async (deckId: number, vipOnly: boolean) => {
      // ยังไม่ล็อกอิน
      if (!userId) {
        alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        return;
      }

      // deck VIP แต่ user ยัง FREE → ไม่ต้องยิง API เลย
      if (vipOnly && planType === "FREE") {
        alert("สำรับนี้สำหรับสมาชิกเท่านั้น");
        return;
      }

      try {
        const res = await fetch(`/api/decks/${deckId}/open`, {
          method: "GET",
        });

        if (res.ok) {
          // ผ่านเช็คทั้งหมด ทั้ง active plan และ quota
          // → เข้าอ่านได้เลย
          // (เรายังใส่ ?deck=... ไว้เหมือนเดิมเพื่อให้หน้า reading โหลดสำรับนั้น)
          router.push(`/reading?deck=${deckId}`);
          return;
        }

        // ถ้า status ไม่ใช่ 2xx:
        // พยายามอ่าน text เพื่อโชว์ message จาก server เช่น:
        // "Your plan is inactive or expired." หรือ
        // "Daily limit reached. You used 20 / 20 today."
        const msg = await res.text();
        alert(msg || "ไม่สามารถเปิดสำรับได้ในขณะนี้");
      } catch (err) {
        console.error("open deck failed", err);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
    },
    [router, userId, planType],
  );

  return (
    <main className="relative min-h-screen">
      <TransparentHeader
        title="เปิดไพ่"
        subtitle=""
        routeRules={{
          "/opencard": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: "/",
          },
        }}
      />

      <section
        className="relative h-[130px] w-full overflow-hidden"

      >
        <div className="absolute inset-0 " />
      </section>

      <div className="relative -mt-14 mx-auto max-w-md px-4 pb-24 text-white">
        <p className="mt-1 text-center text-sm text-white/85">
          เลือกสำรับไพ่ที่ต้องการใช้งาน
        </p>

        {/* Tabs */}
        <div className="mt-4 w-full text-sm font-semibold">
          <div className="flex w-full items-center gap-6">
            <button
              className={`flex-1 pb-2 text-center ${
                tab === "all" ? "text-white" : "text-white/70"
              }`}
              onClick={() => setTab("all")}
            >
              สำหรับทั้งหมด
              {tab === "all" && (
                <span className="mt-1 block h-0.5 rounded bg-white" />
              )}
            </button>
            <button
              className={`flex-1 pb-2 text-center ${
                tab === "fav" ? "text-white" : "text-white/70"
              }`}
              onClick={() => setTab("fav")}
            >
              Favorite
              {tab === "fav" && (
                <span className="mt-1 block h-0.5 rounded bg-white" />
              )}
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/10 p-2 ring-1 ring-white/10"
              >
                <div className="h-32 w-full animate-pulse rounded-xl bg-white/10" />
                <div className="mt-2 h-4 w-24 animate-pulse rounded bg-white/20" />
                <div className="mt-2 flex gap-2">
                  <div className="h-8 w-20 animate-pulse rounded bg-white/10" />
                  <div className="h-8 flex-1 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {listToShow.map((d) => (
              <DeckCard
                key={d.id}
                deck={d}
                isFav={favDeckIds.has(d.id)}
                onToggleFav={() => toggleFav(d.id)}
                onInfo={() => router.push(`/decks/${d.id}`)}
                onRead={() => handleReadClick(d.id, d.vipOnly)}
                planType={planType}
              />
            ))}
            {!listToShow.length && (
              <p className="col-span-2 text-center text-white/80">
                ไม่มีรายการ
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------- Card ---------------- */

function DeckCard({
  deck,
  isFav,
  onToggleFav,
  onRead,
  onInfo,
  planType,
}: {
  deck: DeckVM;
  isFav: boolean;
  onToggleFav: () => void;
  onRead: () => void;
  onInfo: () => void;
  planType: "FREE" | "MONTH" | "YEAR";
}) {
  // disabled เฉพาะเคสพื้นฐาน: user FREE แต่สำรับ VIP
  // สำหรับ MONTH quota เต็ม / plan inactive เราจะปล่อยให้คลิกได้
  // แล้ว backend จะเป็นคนตอบกลับด้วย status 429/403
  const disabled = deck.vipOnly && planType === "FREE";

  const buttonLabel =
    deck.vipOnly && planType === "FREE" ? "VIP Only" : "ดูดวง";

  return (
    <div className="overflow-hidden rounded-2xl bg-white/95 p-2 text-slate-900 shadow ring-1 ring-black/5 backdrop-blur">
      <div className="relative">
        <img
          src={deck.image || "/placeholder-deck.jpg"}
          alt={deck.name}
          className="h-32 w-full rounded-xl object-cover"
        />

        {/* Favorite */}
        <button
          aria-label="favorite"
          onClick={onToggleFav}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center text-slate-700"
        >
          {isFav ? <HeartSolid /> : <Heart />}
        </button>

        {/* badge VIP */}
        {deck.vipOnly && (
          <div className="absolute left-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-semibold text-white shadow">
            VIP
          </div>
        )}
      </div>

      <div className="mt-2">
        <div className="line-clamp-1 text-sm font-semibold">{deck.name}</div>

        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={onInfo}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            ดูข้อมูล
          </button>

          <button
            onClick={onRead}
            disabled={disabled}
            className={`relative inline-flex flex-1 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow ${
              disabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-botton-main hover:bg-violet-800"
            }`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Icons ---------------- */

function Heart() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="white"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-.98-.98a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.76-8.76a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

function HeartSolid() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="#e11d48">
      <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 15.5 4C18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.5L12 21.35Z" />
    </svg>
  );
}
