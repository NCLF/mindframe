import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPayment, PRICING, type PricingTier } from '@/lib/cryptomus';
import { randomUUID } from 'crypto';

// Use service role for payment operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, telegramId } = body as { tier: PricingTier; telegramId?: number };

    // Validate tier
    if (!tier || !PRICING[tier]) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier' },
        { status: 400 }
      );
    }

    const pricing = PRICING[tier];
    const orderId = `mf_${tier}_${Date.now()}_${randomUUID().slice(0, 8)}`;

    // Get app URL for callbacks
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindframe.space';

    // Create payment in Cryptomus
    const payment = await createPayment({
      amount: pricing.amount,
      currency: pricing.currency,
      orderId,
      urlCallback: `${appUrl}/api/payments/webhook`,
      urlReturn: `${appUrl}/ru/settings`,
      urlSuccess: `${appUrl}/ru/settings?payment=success`,
      lifetime: 3600, // 1 hour
      additionalData: JSON.stringify({
        tier,
        telegramId,
      }),
    });

    // Store payment in database
    const { error: dbError } = await supabase.from('payments').insert({
      telegram_id: telegramId || null,
      provider: 'cryptomus',
      provider_payment_id: payment.uuid,
      order_id: orderId,
      tier,
      amount: parseFloat(pricing.amount),
      currency: pricing.currency,
      status: payment.payment_status,
      payment_url: payment.url,
      metadata: {
        cryptomus_uuid: payment.uuid,
        expired_at: payment.expired_at,
      },
    });

    if (dbError) {
      console.error('Failed to store payment:', dbError);
      // Continue anyway - payment was created in Cryptomus
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentUrl: payment.url,
        orderId,
        expiresAt: payment.expired_at,
      },
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      },
      { status: 500 }
    );
  }
}
