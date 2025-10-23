import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs"; // ✅ ต้องใช้ nodejs runtime (ไม่ใช่ edge)

// ✅ ใช้ API version ล่าสุดที่เสถียร
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

function assertEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: NextRequest) {
  try {
    // -------- validate env --------
    assertEnv("NEXT_PUBLIC_SUPABASE_URL");
    assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    assertEnv("STRIPE_SECRET_KEY");
    assertEnv("STRIPE_SUCCESS_URL");
    assertEnv("STRIPE_CANCEL_URL");

    // -------- read input --------
    const body = await req.json().catch(() => ({}));
    const priceId = body?.priceId as string | undefined;
    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    // -------- supabase server client --------
    const cookieStore = await cookies(); // ✅ Next.js v15 ต้อง await
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (key: string) => cookieStore.get(key)?.value,
          // ไม่ต้องใช้ set/remove เพราะเราไม่ได้แก้ cookie ที่นี่
          set: () => {},
          remove: () => {},
        },
      }
    );

    // -------- get current user --------
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // -------- load or create stripe customer --------
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("id, email, full_name, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let customerId = profile.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email ?? undefined,
        name: profile.full_name ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // -------- detect mode from Price --------
    const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
    if (!price || !price.type) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const mode: "payment" | "subscription" =
      price.type === "recurring" ? "subscription" : "payment";

    // ✅ ดึงข้อมูล package_type จาก product.metadata
    const product = price.product as Stripe.Product;
    const packageType =
      product?.metadata?.package_type?.toUpperCase() === "YEAR"
        ? "YEAR"
        : "MONTH";

    // -------- create checkout session --------
    const session = await stripe.checkout.sessions.create({
      mode,
      customer: customerId ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.STRIPE_SUCCESS_URL!}?status=success`,
      cancel_url: `${process.env.STRIPE_CANCEL_URL!}?status=cancel`,
      allow_promotion_codes: true,
      client_reference_id: user.id, // ✅ ผูกกับผู้ใช้
      metadata: {
        user_id: user.id,
        price_id: priceId,
        package_type: packageType, // ✅ ระบุ MONTH/YEAR ชัดเจน
      },
      ...(mode === "subscription"
        ? {
            subscription_data: {
              metadata: {
                user_id: user.id,
                package_type: packageType,
              },
            },
          }
        : {}),
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
