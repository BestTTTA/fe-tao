// app/decks/[deckId]/cards/[cardId]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import TransparentHeader from "@/components/TransparentHeader";
import { getUserTier, hasPremiumAccess } from "@/lib/user-tier";

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

  let canSee = deck.free;
  if (!canSee && uid) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type, plan_status, plan_current_period_end")
      .eq("id", uid)
      .maybeSingle();
    canSee = hasPremiumAccess(getUserTier(profile));
  }
  if (!canSee) {
    redirect("/packages");
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
          },
        }}
      />

      <section
        className="relative h-[180px] w-full overflow-hidden"
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

        {/* ชื่อการ์ด + คำอธิบาย */}
        <div className="mt-4 text-center px-2">
          <h1 className="text-2xl font-extrabold tracking-wide uppercase">
            {card.card_name}
          </h1>
          {card.describe && (
            <p className="mt-3 text-[14px] leading-7 text-white/85">
              {card.describe}
            </p>
          )}
        </div>

        {/* เส้นคั่น */}
        <div className="mx-auto mt-6 h-[1px] w-3/4 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        {/* รายละเอียดเชิงความหมาย */}
        <div className="mt-6 space-y-6 px-2">
          {card.work_meaning && (
            <section>
              <h2 className="text-lg font-bold">การงาน:</h2>
              <ul className="mt-2 list-disc list-outside pl-5 space-y-1">
                <li className="text-[14px] leading-7 text-white/90">
                  {card.work_meaning}
                </li>
              </ul>
            </section>
          )}

          {card.money_meaning && (
            <section>
              <h2 className="text-lg font-bold">การเงิน:</h2>
              <ul className="mt-2 list-disc list-outside pl-5 space-y-1">
                <li className="text-[14px] leading-7 text-white/90">
                  {card.money_meaning}
                </li>
              </ul>
            </section>
          )}

          {card.relation && (
            <section>
              <h2 className="text-lg font-bold">ความสัมพันธ์:</h2>
              <ul className="mt-2 list-disc list-outside pl-5 space-y-1">
                <li className="text-[14px] leading-7 text-white/90">
                  {card.relation}
                </li>
              </ul>
            </section>
          )}
        </div>

      
      </div>
    </main>
  );
}
