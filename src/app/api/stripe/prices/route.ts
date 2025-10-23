// app/api/stripe/prices/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
      limit: 20,
    });

    // ✅ กรอง recurring และ product ที่ยัง active อยู่ (ไม่ถูกลบ)
    const activePrices = prices.data.filter((p) => {
      const product = p.product as Stripe.Product | Stripe.DeletedProduct;

      // ตรวจว่า product ไม่ถูกลบ
      if ("deleted" in product && product.deleted) return false;

      // ถ้าไม่ถูกลบ → เช็คว่า product.active === true
      return (
        p.type === "recurring" &&
        (product as Stripe.Product).active === true
      );
    });

    return NextResponse.json(activePrices);
  } catch (err) {
    console.error("Stripe price error:", err);
    return NextResponse.json(
      { error: "Failed to load Stripe prices" },
      { status: 500 }
    );
  }
}
