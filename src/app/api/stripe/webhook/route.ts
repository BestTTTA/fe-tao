import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata ?? {};
        const userId = metadata.user_id; // ✅ ใช้ชื่อ key เดิมจาก checkout
        const priceId = metadata.price_id;
        const packageType = metadata.package_type;
      
        console.log("✅ checkout.session.completed", metadata);
      
        if (userId && priceId) {
          const { error } = await supabase.from("purchase_history").insert({
            user_id: userId,
            price_id: priceId,
            package_type: packageType || "FREE",
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            status: "SUCCESS",
          });
      
          if (error) console.error("❌ Insert failed:", error);
          else console.log("✅ purchase_history inserted");
        } else {
          console.warn("⚠️ Missing metadata:", metadata);
        }
      
        break;
      }


      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription & {
          current_period_start?: number;
          current_period_end?: number;
        };

        const userId = sub.metadata?.user_id;
        const packageType = sub.metadata?.package_type ?? "FREE";
        if (!userId) break;

        await supabase.from("subscriptions").upsert({
          id: sub.id,
          user_id: userId,
          price_id: sub.items.data[0]?.price?.id,
          status: sub.status,
          package_type: packageType,
          current_period_start: sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
        });

        await supabase
          .from("profiles")
          .update({
            plan_type: packageType,
            plan_status: sub.status,
            plan_current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
          })
          .eq("id", userId);

        console.log("✅ subscription updated for user:", userId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (userId) {
          await supabase
            .from("profiles")
            .update({ plan_status: "canceled" })
            .eq("id", userId);
        }
        console.log("⚠️ subscription canceled:", userId);
        break;
      }

      case "invoice_payment.paid":
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("💰 Invoice paid:", invoice.id);
        break;
      }


      case "charge.succeeded":
      case "payment_intent.succeeded":
      case "payment_method.attached":
      case "invoice.created":
      case "invoice.finalized": {
        console.log(`ℹ️ Ignored Stripe event type: ${event.type}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler failed:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
