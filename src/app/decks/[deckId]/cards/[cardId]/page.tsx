// app/decks/[deckId]/cards/[cardId]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import TransparentHeader from "@/components/TransparentHeader";

type Deck = {
  id: number;
  deck_name: string;
  free: boolean;
};

type Card = {
  id: number;
  card_name: string;
  card_url: string | null;
  describe: string | null;
  work_meaning: string | null;
  money_meaning: string | null;
  relation: string | null;
  file_name: string | null;
};

const toPublicUrl = (p?: string | null) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`;
};

// ✅ NOTE: บน Next.js รุ่นใหม่ params ต้องเป็น Promise และต้อง await
export default async function CardDetailPage(props: {
  params: Promise<{ deckId: string; cardId: string }>;
}) {
  const { deckId, cardId } = await props.params; // ⬅️ สำคัญ!
  const supabase = await createClient();

  // โหลดเด็คเพื่อทราบสิทธิ์ (free หรือไม่)
  const { data: deck, error: dErr } = await supabase
    .from("decks")
    .select("id, deck_name, free")
    .eq("id", Number(deckId))
    .maybeSingle<Deck>();

  if (dErr || !deck) return notFound();

  // ตรวจสิทธิ์ผู้ใช้ (VIP?)
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id ?? null;

  let isVip = false;
  if (uid) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type, plan_status")
      .eq("id", uid)
      .maybeSingle();

    isVip =
      !!profile &&
      (profile.plan_type === "MONTH" || profile.plan_type === "YEAR") &&
      (profile.plan_status === "active" || profile.plan_status === "trialing");
  }

  const canSee = deck.free || isVip;
  if (!canSee) {
    redirect("/pricing");
  }

  // ✅ รองรับทั้ง cardId แบบตัวเลข (id) และแบบสลัก (file_name)
  const numericId = Number(cardId);
  const isNumeric = Number.isFinite(numericId) && `${numericId}` === cardId;

  let card: Card | null = null;
  if (isNumeric) {
    const { data, error } = await supabase
      .from("cards")
      .select("id, card_name, card_url, describe, work_meaning, money_meaning, relation, file_name")
      .eq("id", numericId)
      .eq("deck_id", Number(deckId))
      .maybeSingle<Card>();
    if (error) return notFound();
    card = data ?? null;
  } else {
    // ลองหาโดย file_name ก่อน ถ้าไม่มี ค่อย fallback ไป card_name
    const byFile = await supabase
      .from("cards")
      .select("id, card_name, card_url, describe, work_meaning, money_meaning, relation, file_name")
      .eq("deck_id", Number(deckId))
      .eq("file_name", cardId)
      .maybeSingle<Card>();

    if (byFile.data) {
      card = byFile.data;
    } else {
      const byName = await supabase
        .from("cards")
        .select("id, card_name, card_url, describe, work_meaning, money_meaning, relation, file_name")
        .eq("deck_id", Number(deckId))
        .eq("card_name", cardId.replace(/-/g, " ")) // เผื่อใช้ slug จากชื่อ
        .maybeSingle<Card>();
      card = byName.data ?? null;
    }
  }

  if (!card) return notFound();

  // ✅ กันรูปหาย: hero-stars.jpg ควรมีใน /public; ถ้าไม่มี จะยังเห็น BG ขาว
  return (
    <main className="relative min-h-screen text-white">
      <TransparentHeader
        title={card.card_name}
        subtitle=""
        routeRules={{
          // ใช้ wildcard rule ให้ครอบคลุมทุกใบ
          "/decks/*": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: `/decks/${deck.id}`,
          },
        }}
      />

      <section
        className="relative h-[180px] w-full overflow-hidden"
        style={{
          backgroundImage: "url('/hero-stars.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" />
      </section>

      <div className="relative -mt-16 mx-auto max-w-md px-4 pb-28">
        {/* การ์ดใหญ่ */}
        <div className="mx-auto w-[82%] rounded-2xl bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={toPublicUrl(card.card_url) || "/placeholder-card.jpg"}
            alt={card.card_name}
            className="w-full rounded-xl object-cover"
          />
        </div>

        {/* ชื่อการ์ด */}
        <div className="mt-4 text-center">
          <h1 className="text-xl font-extrabold tracking-wide">{card.card_name}</h1>
          {card.describe && (
            <p className="mt-2 text-[13px] leading-6 text-white/85">{card.describe}</p>
          )}
        </div>

        {/* รายละเอียดเชิงความหมาย */}
        <div className="mt-6 space-y-4">
          {card.work_meaning && (
            <section className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur">
              <h2 className="text-sm font-bold">การงาน</h2>
              <p className="mt-1 text-[13px] text-white/90">{card.work_meaning}</p>
            </section>
          )}

          {card.money_meaning && (
            <section className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur">
              <h2 className="text-sm font-bold">การเงิน</h2>
              <p className="mt-1 text-[13px] text-white/90">{card.money_meaning}</p>
            </section>
          )}

          {card.relation && (
            <section className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur">
              <h2 className="text-sm font-bold">ความสัมพันธ์</h2>
              <p className="mt-1 text-[13px] text-white/90">{card.relation}</p>
            </section>
          )}
        </div>

        {/* ลิงก์กลับไปเด็ค */}
        <div className="mt-6">
          <Link
            href={`/decks/${deck.id}`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20"
          >
            กลับไปเด็ค {deck.deck_name}
          </Link>
        </div>
      </div>
    </main>
  );
}
