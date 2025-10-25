import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

// ใช้ service role เพราะ webhook ต้อง bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ helper: คำนวณวันหมดอายุ end_at สำหรับแพ็กเกจซื้อครั้งเดียว
function getEndAtFromPackageType(packageType?: string | null) {
  if (!packageType) return null;

  const now = new Date();

  if (packageType.toUpperCase() === "MONTH") {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString();
  }

  if (packageType.toUpperCase() === "YEAR") {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString();
  }

  // FREE หรืออย่างอื่น: ไม่มีวันหมดอายุ
  return null;
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  // -------- verify stripe signature --------
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("⚠️ Webhook signature failed:", err);
    return new NextResponse(`Webhook Error: ${err}`, { status: 400 });
  }

  // -------- main handler --------
  try {
    switch (event.type) {
      /* ===========================================================
       * 1) ONE-TIME CHECKOUT / PACKAGE PURCHASE (MONTH, YEAR)
       *    -> บันทึกลง purchase_history พร้อม end_at
       *    -> อัปเดต profiles (plan_type, plan_status, plan_current_period_end)
       * ===========================================================
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const metadata = session.metadata ?? {};
        const userId = metadata.user_id;
        const priceId = metadata.price_id;
        const packageType = metadata.package_type; // เช่น "MONTH" | "YEAR" | "FREE"

        console.log("✅ checkout.session.completed", metadata);

        if (!userId || !priceId) {
          console.warn("⚠️ Missing metadata (userId / priceId):", metadata);
          break;
        }

        // คำนวณ end_at = วันหมดอายุของสิทธิ์ (MONTH=+1เดือน, YEAR=+1ปี)
        const endAt = getEndAtFromPackageType(packageType);

        // 1. บันทึกประวัติการซื้อ (purchase_history)
        {
          const { error: insertError } = await supabase
            .from("purchase_history")
            .insert({
              user_id: userId,
              price_id: priceId,
              package_type: packageType || "FREE",
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent,
              status: "SUCCESS",

              // ✅ ใหม่ / ยืนยัน: เก็บวันหมดอายุลง purchase_history.end_at
              end_at: endAt ?? null,
            });

          if (insertError) {
            console.error("❌ Insert into purchase_history failed:", insertError);
          } else {
            console.log("✅ purchase_history inserted with end_at:", endAt);
          }
        }

        // 2. อัปเดตสถานะปัจจุบันใน profiles (cache state ปัจจุบันของ user)
        {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              plan_type: packageType || "FREE",     // MONTH / YEAR / FREE
              plan_status: "active",               // ซื้อสำเร็จ -> active
              plan_current_period_end: endAt ?? null, // ไว้เช็คใน UI ถ้าคุณยังอยากโชว์วันหมดอายุ
            })
            .eq("id", userId);

          if (profileError) {
            console.error("❌ profiles update failed:", profileError);
          } else {
            console.log(
              "✅ profiles updated for user:",
              userId,
              {
                plan_type: packageType || "FREE",
                plan_status: "active",
                plan_current_period_end: endAt ?? null,
              }
            );
          }
        }

        break;
      }

      /* ===========================================================
       * 2) RECURRING SUBSCRIPTION EVENTS
       *    (Stripe Subscriptions / Billing Portal)
       *    customer.subscription.created / updated
       * ===========================================================
       */
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription & {
          current_period_start?: number;
          current_period_end?: number;
        };

        const userId = sub.metadata?.user_id;
        const packageType = sub.metadata?.package_type ?? "FREE";
        if (!userId) break;

        // Stripe จะให้รอบบิลอยู่แล้วใน current_period_start / current_period_end (Unix ts)
        const currentPeriodStartIso = sub.current_period_start
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null;

        const currentPeriodEndIso = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        // 2.1 sync ลงตาราง subscriptions (optional cache / audit)
        {
          const { error: upsertError } = await supabase
            .from("subscriptions")
            .upsert({
              id: sub.id,
              user_id: userId,
              price_id: sub.items.data[0]?.price?.id,
              status: sub.status, // 'active', 'trialing', 'past_due', ...
              package_type: packageType,
              current_period_start: currentPeriodStartIso,
              current_period_end: currentPeriodEndIso,
            });

          if (upsertError) {
            console.error("❌ subscriptions upsert failed:", upsertError);
          } else {
            console.log("✅ subscriptions upserted for:", userId, sub.id);
          }
        }

        // 2.2 update profiles -> ให้ user ใช้สิทธิ์ได้ในระบบ
        {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              plan_type: packageType,               // เช่น MONTH / YEAR ตามเมตาดาต้า
              plan_status: sub.status,              // active / trialing / past_due ...
              plan_current_period_end: currentPeriodEndIso, // Stripe billing period end
            })
            .eq("id", userId);

          if (profileError) {
            console.error("❌ profiles update for subscription failed:", profileError);
          } else {
            console.log("✅ subscription profile synced for user:", userId);
          }
        }

        break;
      }

      /* ===========================================================
       * 3) SUBSCRIPTION CANCELED
       * ===========================================================
       */
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;

        if (userId) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              plan_status: "canceled",
              // หมายเหตุ: คุณอาจอยากเก็บ plan_type เดิมไว้
              // หรือจะสลับกลับเป็น FREE ก็ได้ ขึ้นกับธุรกิจ
              // plan_type: "FREE",
            })
            .eq("id", userId);

          if (profileError) {
            console.error("❌ profiles cancel update failed:", profileError);
          } else {
            console.log("⚠️ subscription canceled:", userId);
          }
        } else {
          console.warn("⚠️ subscription.deleted but userId missing in metadata");
        }

        break;
      }

      /* ===========================================================
       * 4) INVOICE / PAYMENT SIGNALS
       * ===========================================================
       */
      case "invoice_payment.paid":
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("💰 Invoice paid:", invoice.id);
        break;
      }

      /* ===========================================================
       * 5) NO-OP EVENTS
       * ===========================================================
       */
      case "charge.succeeded":
      case "payment_intent.succeeded":
      case "payment_method.attached":
      case "invoice.created":
      case "invoice.finalized": {
        console.log(`ℹ️ Ignored Stripe event type: ${event.type}`);
        break;
      }

      /* ===========================================================
       * 6) FALLBACK
       * ===========================================================
       */
      default:
        console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler failed:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
