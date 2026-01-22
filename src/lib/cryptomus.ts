/**
 * Cryptomus Payment API Client
 * Documentation: https://doc.cryptomus.com/
 */

import crypto from 'crypto';

const CRYPTOMUS_API_URL = 'https://api.cryptomus.com/v1';

interface CryptomusConfig {
  merchantId: string;
  apiKey: string;
}

interface CreatePaymentParams {
  amount: string;
  currency: string;
  orderId: string;
  urlCallback: string;
  urlReturn: string;
  urlSuccess?: string;
  lifetime?: number;
  additionalData?: string;
}

interface CryptomusPayment {
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount: string | null;
  payer_amount: string | null;
  discount_percent: number;
  discount: string;
  payer_currency: string | null;
  currency: string;
  merchant_amount: string | null;
  network: string | null;
  address: string | null;
  from: string | null;
  txid: string | null;
  payment_status: CryptomusPaymentStatus;
  url: string;
  expired_at: number;
  is_final: boolean;
  additional_data: string | null;
  created_at: string;
  updated_at: string;
}

type CryptomusPaymentStatus =
  | 'pending'
  | 'process'
  | 'check'
  | 'paid'
  | 'paid_over'
  | 'fail'
  | 'wrong_amount'
  | 'cancel'
  | 'system_fail'
  | 'refund_process'
  | 'refund_fail'
  | 'refund_paid';

interface WebhookPayload {
  type: 'payment' | 'payout';
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount: string;
  payment_amount_usd: string;
  merchant_amount: string;
  commission: string;
  is_final: boolean;
  status: CryptomusPaymentStatus;
  from: string;
  wallet_address_uuid: string | null;
  network: string;
  currency: string;
  payer_currency: string;
  additional_data: string;
  txid: string;
  sign: string;
}

function getConfig(): CryptomusConfig {
  const merchantId = process.env.CRYPTOMUS_MERCHANT_ID;
  const apiKey = process.env.CRYPTOMUS_API_KEY;

  if (!merchantId || !apiKey) {
    throw new Error('Cryptomus credentials not configured');
  }

  return { merchantId, apiKey };
}

function generateSign(data: object, apiKey: string): string {
  const jsonData = JSON.stringify(data);
  const base64Data = Buffer.from(jsonData).toString('base64');
  return crypto.createHash('md5').update(base64Data + apiKey).digest('hex');
}

export function verifyWebhookSignature(payload: WebhookPayload): boolean {
  const { apiKey } = getConfig();
  const { sign, ...data } = payload;
  const expectedSign = generateSign(data, apiKey);
  return sign === expectedSign;
}

async function makeRequest<T>(
  endpoint: string,
  data: object
): Promise<T> {
  const { merchantId, apiKey } = getConfig();

  const sign = generateSign(data, apiKey);

  const response = await fetch(`${CRYPTOMUS_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': merchantId,
      'sign': sign,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || result.state !== 0) {
    throw new Error(result.message || 'Cryptomus API error');
  }

  return result.result as T;
}

export async function createPayment(
  params: CreatePaymentParams
): Promise<CryptomusPayment> {
  return makeRequest<CryptomusPayment>('/payment', {
    amount: params.amount,
    currency: params.currency,
    order_id: params.orderId,
    url_callback: params.urlCallback,
    url_return: params.urlReturn,
    url_success: params.urlSuccess,
    lifetime: params.lifetime || 3600, // 1 hour default
    additional_data: params.additionalData,
  });
}

export async function getPaymentInfo(
  uuid?: string,
  orderId?: string
): Promise<CryptomusPayment> {
  if (!uuid && !orderId) {
    throw new Error('Either uuid or orderId is required');
  }

  return makeRequest<CryptomusPayment>('/payment/info', {
    ...(uuid && { uuid }),
    ...(orderId && { order_id: orderId }),
  });
}

export function isPaymentSuccessful(status: CryptomusPaymentStatus): boolean {
  return status === 'paid' || status === 'paid_over';
}

export function isPaymentFinal(status: CryptomusPaymentStatus): boolean {
  return ['paid', 'paid_over', 'fail', 'cancel', 'system_fail', 'refund_paid'].includes(status);
}

// Pricing tiers for Emotional Hedging Protocol
// Trader-focused pricing: Paper Hands (free) -> Trader ($49) -> Whale ($99) -> Institutional ($2499)
export const PRICING = {
  paper_hands: {
    amount: '0',
    currency: 'USD',
    name: 'Paper Hands',
    nameRu: 'Paper Hands',
    description: 'For deposits under $1k',
    descriptionRu: 'Для депозитов до $1k',
    sessionsPerMonth: 3,
    tier: 'free' as const,
    features: ['3 demo sessions', 'Generic AI voice', 'Basic scenarios'],
    featuresRu: ['3 демо-сессии', 'Generic AI голос', 'Базовые сценарии'],
  },
  trader: {
    amount: '49',
    currency: 'USD',
    name: 'Trader',
    nameRu: 'Trader',
    description: 'For deposits under $10k',
    descriptionRu: 'Для депозитов до $10k',
    sessionsPerMonth: 30,
    tier: 'basic' as const,
    features: ['30 sessions/month', '5 Premium AI voices', 'All scenarios', 'Telegram access'],
    featuresRu: ['30 сессий/месяц', '5 Premium AI-голосов', 'Все сценарии', 'Telegram доступ'],
  },
  whale: {
    amount: '99',
    currency: 'USD',
    name: 'Whale',
    nameRu: 'Whale',
    description: 'For deposits $10k+',
    descriptionRu: 'Для депозитов $10k+',
    sessionsPerMonth: 90, // 3 per day
    tier: 'pro' as const,
    badge: 'Best Value',
    features: ['Voice Clone 2.0', 'Daily Sync (3/day)', 'Telegram Panic Button', 'Priority support'],
    featuresRu: ['Voice Clone 2.0', 'Daily Sync (3/день)', 'Telegram Panic Button', 'Priority support'],
  },
  institutional: {
    amount: '2499',
    currency: 'USD',
    name: 'Institutional',
    nameRu: 'Institutional',
    description: 'Lifetime',
    descriptionRu: 'Lifetime',
    sessionsPerMonth: -1, // unlimited
    tier: 'lifetime' as const,
    features: ['Lifetime license', 'Personal prompt calibration', 'Private channel', 'USDT/ETH payment'],
    featuresRu: ['Пожизненная лицензия', 'Персональная калибровка', 'Закрытый канал', 'Оплата USDT/ETH'],
  },
} as const;

export type PricingTier = keyof typeof PRICING;

// Legacy aliases for backwards compatibility
export const PRICING_LEGACY = {
  basic: PRICING.trader,
  pro: PRICING.whale,
};
