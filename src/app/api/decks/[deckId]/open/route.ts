// app/api/decks/[deckId]/open/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // <- server client ของคุณ (auth ตาม cookie)
import { createClient as createAdminClient } from "@supabase/supabase-js";

// ใช้แค่สำหรับอ่าน decks/profiles ได้สบายใจขึ้นแม้ table ยังไม่ได้เปิด RLS บางตัว
// (ถ้าคุณเปิด RLS และ policy ครบในอนาคต คุณสามารถตัด adminClient ทิ้งได้)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---- business helpers ----

// ผู้ใช้มีสิทธิ์เปิดสำรับ VIP มั้ย (ก่อนเช็คโควต้า)
function canUsePremium(planType: string | null, planStatus: string | null) {
  // ถ้าเป็น FREE หรือค่าว่าง -> ยังไม่มีสิทธิ์ VIP
  if (!planType || planType === "FREE") {
    return { ok: false, reason: "สำรับนี้สำหรับสมาชิกเท่านั้น" };
  }

  // ต้องมีสถานะที่อนุญาตใช้งาน
  const okStatus = ["active", "trialing"]; // คุณอนุญาต past_due ไหม? ถ้าใช่ก็เติมได้
  if (!planStatus || !okStatus.includes(planStatus)) {
    return { ok: false, reason: "Your plan is inactive or expired." };
  }

  // ถ้า plan_type เป็น MONTH หรือ YEAR และสถานะ active/trialing -> ผ่านขั้นต้น
  return { ok: true, reason: null };
}

// ---- main handler ----

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ deckId: string }> }
) {
  try {
    // 1. Next.js 15+ API dynamic params เป็น Promise → ต้อง await ก่อนใช้
    const { deckId } = await ctx.params;
    const deckIdNum = Number(deckId);
    if (!Number.isFinite(deckIdNum)) {
      return new NextResponse("Invalid deck id", { status: 400 });
    }

    // 2. เอา session user ปัจจุบันจาก cookie
    // หมายเหตุ: ฟังก์ชัน createClient() ของคุณใน utils/supabase/server
    // อาจเป็น async หรือ sync; การเขียนแบบ await ข้างล่างมันครอบทั้งสองเคสได้
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = user.id;

    // 3. หา deck
    // ตาราง decks ใน SQL ของคุณ: ไม่มี RLS, คอลัมน์ free:boolean
    // เราสามารถอ่านด้วย supabaseAdmin เพื่อความแน่นอน (กันเคสปรับ RLS ทีหลัง)
    const { data: deckRow, error: deckErr } = await supabaseAdmin
      .from("decks")
      .select("id, free")
      .eq("id", deckIdNum)
      .maybeSingle();

    if (deckErr) {
      console.error("deckErr", deckErr);
      return new NextResponse("Deck query failed", { status: 500 });
    }
    if (!deckRow) {
      return new NextResponse("Deck not found", { status: 404 });
    }

    const isPremiumDeck = deckRow.free === false;

    // 4. deck ฟรี -> อนุญาตเลย ไม่ต้องเช็คสิทธิ์, ไม่ต้องหักโควต้า
    if (!isPremiumDeck) {
      const { data: fullDeck, error: fullDeckErr } = await supabaseAdmin
        .from("decks")
        .select("*")
        .eq("id", deckIdNum)
        .maybeSingle();

      if (fullDeckErr || !fullDeck) {
        console.error("fullDeckErr", fullDeckErr);
        return new NextResponse("Deck not found (full data)", { status: 404 });
      }

      return NextResponse.json({
        ok: true,
        access: "free",
        deck: fullDeck,
        usage: null,
      });
    }

    // 5. deck VIP -> ตรวจ profile ของ user
    // profiles มี policy "public read" อยู่แล้วใน SQL คุณ, แต่เราจะอ่านด้วย supabaseAdmin ให้แน่นอนก็ได้
    const { data: profileRow, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("plan_type, plan_status")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr) {
      console.error("profileErr", profileErr);
      return new NextResponse("Internal error (profile query failed)", {
        status: 500,
      });
    }
    if (!profileRow) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const { plan_type, plan_status } = profileRow;

    // ตรวจสิทธิ์เบื้องต้น (เป็น FREE ไหม? สถานะ active/trialing ไหม?)
    const accessCheck = canUsePremium(plan_type, plan_status);
    if (!accessCheck.ok) {
      return new NextResponse(accessCheck.reason ?? "Forbidden", {
        status: 403,
      });
    }

    // 6. ถ้า MONTH → ต้องเช็คโควต้า / หักสิทธิ์วันนี้
    //    ถ้า YEAR → ไม่มีลิมิต (ฟังก์ชันใน DB ก็ไม่ enforce)
    //    ฟังก์ชัน check_and_log_card_open จะ:
    //       - เช็ค plan_type, plan_status เองอีกที
    //       - enforce 20 ครั้ง/วัน (เฉพาะ MONTH + active|trialing)
    //       - insert log 1 แถว
    //    เราเรียกผ่าน supabase (RLS client) ไม่ใช่ service role,
    //    เพราะฟังก์ชันเป็น security definer
    const { error: rpcErr } = await supabase.rpc("check_and_log_card_open", {
      p_deck_id: deckIdNum,
      p_amount: 1,
    });

    if (rpcErr) {
      // ถ้าโควต้าวันนี้เต็ม ฟังก์ชัน raise exception 'monthly_vip_quota_exceeded'
      // Supabase จะส่ง error.code / error.message มาที่นี่
      // ใน SQL ของคุณมี hint ภาษาไทย: 'สิทธิ์รายวันของคุณเต็มแล้ว ลองใหม่พรุ่งนี้'
      const hintMsg =
        rpcErr.hint ||
        rpcErr.details ||
        rpcErr.message ||
        "ไม่สามารถใช้สิทธิ์ได้ในตอนนี้";

      // ถ้า quota เกิน -> ให้ตอบ 429
      if (
        rpcErr.message?.includes("monthly_vip_quota_exceeded") ||
        rpcErr.hint?.includes("สิทธิ์รายวันของคุณเต็มแล้ว")
      ) {
        return new NextResponse(hintMsg, { status: 429 });
      }

      console.error("rpcErr check_and_log_card_open", rpcErr);
      return new NextResponse(hintMsg, { status: 500 });
    }

    // 7. ผ่านแล้ว (สิทธิ์โอเค + quota ผ่าน + log ถูก insert แล้ว)
    const { data: fullDeck, error: fullDeckErr } = await supabaseAdmin
      .from("decks")
      .select("*")
      .eq("id", deckIdNum)
      .maybeSingle();

    if (fullDeckErr || !fullDeck) {
      console.error("fullDeckErr", fullDeckErr);
      return new NextResponse("Deck not found (full data)", { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      access: "premium",
      deck: fullDeck,
      // เราไม่ต้องส่ง usage ตอนนี้ก็ได้ เพราะฝั่ง client ไม่โชว์
      usage: null,
    });
  } catch (err) {
    console.error("open deck error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
