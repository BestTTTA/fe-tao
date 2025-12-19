/**
 * Script to sync Stripe prices to stripe_prices table
 * Run: npx tsx scripts/sync-stripe-prices.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncPrices() {
  console.log('🔄 Syncing Stripe prices...');

  // Get all active prices from Stripe
  const prices = await stripe.prices.list({
    active: true,
    limit: 100,
  });

  console.log(`Found ${prices.data.length} active prices`);

  for (const price of prices.data) {
    const { error } = await supabase
      .from('stripe_prices')
      .upsert({
        id: price.id,
        product_id: typeof price.product === 'string' ? price.product : price.product.id,
        active: price.active,
        currency: price.currency,
        unit_amount: price.unit_amount,
        type: price.type,
        recurring_interval: price.recurring?.interval || null,
        recurring_interval_count: price.recurring?.interval_count || null,
      });

    if (error) {
      console.error(`❌ Failed to sync price ${price.id}:`, error);
    } else {
      console.log(`✅ Synced price ${price.id}`);
    }
  }

  console.log('✅ Sync completed!');
}

syncPrices().catch(console.error);
