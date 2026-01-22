import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature, isPaymentSuccessful, PRICING } from '@/lib/cryptomus';

// Use service role for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log('Cryptomus webhook received:', JSON.stringify(payload, null, 2));

    // Verify signature
    if (!verifyWebhookSignature(payload)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const { order_id, status, is_final, additional_data, payment_amount_usd } = payload;

    // Parse additional data
    let metadata: { tier?: string; telegramId?: number } = {};
    try {
      metadata = JSON.parse(additional_data || '{}');
    } catch {
      console.error('Failed to parse additional_data');
    }

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status,
        paid_at: isPaymentSuccessful(status) ? new Date().toISOString() : null,
        metadata: {
          ...metadata,
          payment_amount_usd,
          is_final,
        },
      })
      .eq('order_id', order_id);

    if (updateError) {
      console.error('Failed to update payment:', updateError);
    }

    // If payment is successful, activate subscription
    if (isPaymentSuccessful(status)) {
      await activateSubscription(order_id, metadata);
    }

    // Cryptomus expects a simple OK response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function activateSubscription(
  orderId: string,
  metadata: { tier?: string; telegramId?: number }
) {
  const { tier, telegramId } = metadata;

  if (!tier || !telegramId) {
    console.error('Missing tier or telegramId in metadata');
    return;
  }

  const pricing = PRICING[tier as keyof typeof PRICING];
  if (!pricing) {
    console.error('Invalid tier:', tier);
    return;
  }

  // Calculate subscription end date (1 month from now)
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  // Find or create profile by telegram_id
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_id', telegramId)
    .single();

  if (existingProfile) {
    // Update existing profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: pricing.tier,
        subscription_expires_at: expiresAt.toISOString(),
        generations_limit: pricing.sessionsPerMonth === -1 ? 999 : pricing.sessionsPerMonth,
      })
      .eq('telegram_id', telegramId);

    if (profileError) {
      console.error('Failed to update profile:', profileError);
      return;
    }

    // Create subscription record
    const { error: subError } = await supabase.from('subscriptions').insert({
      user_id: existingProfile.id,
      provider: 'cryptomus',
      provider_subscription_id: orderId,
      tier: pricing.tier,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: expiresAt.toISOString(),
    });

    if (subError) {
      console.error('Failed to create subscription:', subError);
    }

    console.log(`Subscription activated for telegram_id ${telegramId}: ${pricing.tier}`);
  } else {
    // No profile found - store payment success for later sync
    console.log(`No profile found for telegram_id ${telegramId}, payment stored for later sync`);
  }

  // Send Telegram notification about successful payment
  await sendTelegramNotification(telegramId, pricing.tier, pricing.name);
}

async function sendTelegramNotification(
  telegramId: number,
  tier: string,
  tierName: string
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  const messages: Record<string, string> = {
    basic: `Payment successful! Your Basic subscription is now active. You have 30 sessions per month.`,
    pro: `Payment successful! Your Architect subscription is now active. Enjoy Voice Clone 2.0 and Daily Sync!`,
  };

  const message = messages[tier] || `Payment successful! Your ${tierName} subscription is now active.`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}
