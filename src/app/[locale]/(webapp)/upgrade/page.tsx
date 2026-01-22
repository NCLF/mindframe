'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useTelegram } from '@/hooks/useTelegram';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Loader2,
  ChevronLeft,
  Bitcoin,
  TrendingUp,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type PricingTier = 'trader' | 'whale' | 'institutional';

interface PricingPlan {
  id: PricingTier;
  name: string;
  price: string;
  priceLabel: string;
  description: string;
  features: string[];
  icon: typeof Zap;
  gradient: string;
  badge?: string;
  isContact?: boolean;
}

export default function UpgradePage() {
  const t = useTranslations('app');
  const tLanding = useTranslations('landing');
  const locale = useLocale();
  const { user, haptic } = useTelegram();
  const router = useRouter();

  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get features from translations or use fallback
  const getFeatures = (tier: 'basic' | 'pro' | 'enterprise'): string[] => {
    try {
      const features = tLanding.raw(`pricing.${tier}.features`);
      if (Array.isArray(features)) return features;
      return [];
    } catch {
      return [];
    }
  };

  const plans: PricingPlan[] = [
    {
      id: 'trader',
      name: tLanding('pricing.basic.name'),
      price: '$49',
      priceLabel: '/month',
      description: tLanding('pricing.basic.description'),
      features: getFeatures('basic'),
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'whale',
      name: tLanding('pricing.pro.name'),
      price: '$99',
      priceLabel: '/month',
      description: tLanding('pricing.pro.description'),
      features: getFeatures('pro'),
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      badge: 'Best Value',
    },
    {
      id: 'institutional',
      name: tLanding('pricing.enterprise.name'),
      price: '$2,499',
      priceLabel: ' lifetime',
      description: tLanding('pricing.enterprise.description'),
      features: getFeatures('enterprise'),
      icon: Building2,
      gradient: 'from-amber-500 to-orange-500',
      isContact: true,
    },
  ];

  const handleSelectPlan = (tier: PricingTier) => {
    haptic('selection');
    setSelectedTier(tier);
  };

  const handlePayment = async () => {
    if (!selectedTier) return;

    const plan = plans.find(p => p.id === selectedTier);

    // Institutional tier - open contact form or Telegram
    if (plan?.isContact) {
      haptic('medium');
      // Open Telegram contact
      window.open('https://t.me/mindframe_support', '_blank');
      return;
    }

    haptic('medium');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          telegramId: user?.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment failed');
      }

      // Open Cryptomus payment page
      if (data.data.paymentUrl) {
        window.open(data.data.paymentUrl, '_blank');
      }

      haptic('success');
    } catch (err) {
      haptic('error');
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-3 flex items-center gap-1 text-slate-400 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">{t('settings.title')}</span>
        </button>
        <h1 className="text-2xl font-bold text-white">{tLanding('pricing.title')}</h1>
        <p className="mt-2 text-sm text-slate-400">{tLanding('pricing.anchor')}</p>
      </div>

      {/* ROI Anchor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{tLanding('pricing.roi')}</p>
        </div>
      </motion.div>

      {/* Crypto Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 py-3 px-4"
      >
        <Bitcoin className="h-5 w-5 text-amber-400" />
        <span className="text-sm font-medium text-amber-300">
          {locale === 'ru' ? 'Оплата криптой через Cryptomus' : 'Crypto payments via Cryptomus'}
        </span>
      </motion.div>

      {/* Pricing Cards */}
      <div className="space-y-4 mb-6">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const isSelected = selectedTier === plan.id;

          return (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              onClick={() => handleSelectPlan(plan.id)}
              className={`relative w-full rounded-2xl border-2 p-5 text-left transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl bg-gradient-to-br ${plan.gradient} p-2.5`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400">{plan.description}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-white">{plan.price}</span>
                      <span className="text-sm text-slate-400">{plan.priceLabel}</span>
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="rounded-full bg-purple-500 p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className={`h-4 w-4 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span className={isSelected ? 'text-white' : 'text-slate-300'}>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.isContact && (
                <p className="mt-3 text-xs text-slate-500">
                  {locale === 'ru' ? 'Свяжитесь для обсуждения' : 'Contact for discussion'}
                </p>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Payment Button */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#0f172a] pb-4 pt-2">
        <Button
          size="lg"
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-base font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 disabled:opacity-50"
          onClick={handlePayment}
          disabled={!selectedTier || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : selectedTier === 'institutional' ? (
            <>
              <Building2 className="mr-2 h-5 w-5" />
              {locale === 'ru' ? 'Связаться' : 'Contact Us'}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              {locale === 'ru' ? 'Оплатить криптой' : 'Pay with Crypto'}
            </>
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-slate-500">
          BTC, ETH, USDT, and 20+ cryptocurrencies accepted
        </p>
      </div>
    </div>
  );
}
