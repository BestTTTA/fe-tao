// app/decks/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import TransparentHeader from "@/components/TransparentHeader";
import TarotCarousel from "@/components/TarotCarousel";

type Deck = {
  id: number;
  deck_name: string;
  deck_url: string | null; // อาจเก็บเป็น storage path
  detail: string | null;
  deck_back_url: string | null;
  free: boolean;
};
type Card = {
  id: number;
  card_name: string;
  card_url: string | null; // อาจเก็บเป็น storage path
};

const toPublicUrl = (p?: string | null) => {
  if (!p) return null;
  // ถ้าเป็น URL เต็มอยู่แล้ว ก็ใช้ได้เลย
  if (/^https?:\/\//i.test(p)) return p;
  // ประกอบจาก NEXT_PUBLIC_SUPABASE_URL + relative path
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`;
};

export default async function DeckDetailPage({
  params,
}: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  const supabase = await createClient();

  // อ่านผู้ใช้ + โปรไฟล์ (เพื่อดูสิทธิ์ VIP)
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id ?? null;

  const profile =
    uid
      ? await supabase
          .from("profiles")
          .select("plan_type, plan_status")
          .eq("id", uid)
          .maybeSingle()
      : { data: null };

  const isVip =
    !!profile.data &&
    (profile.data.plan_type === "MONTH" || profile.data.plan_type === "YEAR") &&
    (profile.data.plan_status === "active" ||
      profile.data.plan_status === "trialing");

  // โหลดข้อมูลเด็ค
  const { data: deck, error: dErr } = await supabase
    .from("decks")
    .select("id, deck_name, deck_url, detail, free, deck_back_url")
    .eq("id", Number(deckId))
    .maybeSingle<Deck>();

  if (dErr || !deck) return notFound();

  const canSeeCards = deck.free || isVip;

  let cards: Card[] = [];
  if (canSeeCards) {
    const { data } = await supabase
      .from("cards")
      .select("id, card_name, card_url")
      .eq("deck_id", deck.id)
      .order("card_index", { ascending: true });
    cards = (data ?? []) as Card[];
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-md px-4 pb-24 pt-6">
        {/* Header */}
        <TransparentHeader
          title={deck.deck_name}
          subtitle=""
          routeRules={{
            [`/decks/${deckId}`]: {
              showLogo: false,
              showSearch: false,
              showMenu: false,
              showBack: true,
              backPath: "/",
            },
          }}
        />

        {/* Deck hero */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-white p-3">
          

          <TarotCarousel
            images={[
              `${toPublicUrl(deck.deck_url)}`,
              `${toPublicUrl(deck.deck_back_url)}`,
            ]}
            autoPlay
            interval={4000}
            aspectSquare
          />



          <div className="mt-3">
            <h2 className="text-[20px] font-semibold text-black">{deck.deck_name}</h2>
            {deck.detail && (
              <p className="mt-1 text-thin text-black">{deck.detail}</p>
            )}
          </div>
        </div>

        {/* Content by permission */}
        {!canSeeCards ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 shadow backdrop-blur">
            <p className="text-sm text-white/80">
              เด็คนี้สงวนสิทธิ์สำหรับสมาชิก VIP เท่านั้น
              สมัครเพื่อดูรายละเอียดไพ่ทั้งหมดได้ไม่จำกัด
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-[15px] font-semibold text-white hover:bg-violet-800"
            >
              สมัคร VIP
            </Link>
          </div>
        ) : (
          <section className="mt-4 space-y-3 ">
            {cards.map((c, i) => (
              <Link
                key={c.id}
                href={`/decks/${deck.id}/cards/${c.id}`}
                className="flex gap-3 rounded-2xl bg-white p-2 items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={toPublicUrl(c.card_url) || "/placeholder-card.jpg"}
                  alt={c.card_name}
                  className="h-20 w-14 flex-none rounded-[10px]"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-black">ใบที่ {i + 1}</div>
                  <div className="truncate text-sm font-semibold text-black">
                    {c.card_name}
                  </div>
                </div>
                <div className="grid place-items-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="black" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                </div>
              </Link>
            ))}
            {!cards.length && <p className="text-white/70">ยังไม่มีการ์ดในเด็คนี้</p>}
          </section>
        )}
      </div>
    </main>
  );
}
