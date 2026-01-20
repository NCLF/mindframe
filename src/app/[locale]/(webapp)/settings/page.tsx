'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Mic,
  CreditCard,
  ChevronRight,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { localeNames, type Locale } from '@/i18n/config';

export default function SettingsPage() {
  const t = useTranslations('app.settings');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { user, haptic } = useTelegram();

  // Mock subscription data
  const subscription = {
    tier: 'free' as const,
    generationsUsed: 2,
    generationsLimit: 3,
  };

  const handleLanguageChange = (newLocale: Locale) => {
    haptic('selection');
    // Replace locale in pathname
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const handleVoiceClone = () => {
    haptic('medium');
    // TODO: Navigate to voice clone page or open modal
    alert('Voice clone feature coming soon!');
  };

  const handleUpgrade = () => {
    haptic('medium');
    // TODO: Open payment flow
    alert('Upgrade feature coming soon!');
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* User info (if in Telegram) */}
      {user && (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-bold text-white">
              {user.first_name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-white">
                {user.first_name} {user.last_name || ''}
              </p>
              {user.username && (
                <p className="text-sm text-slate-400">@{user.username}</p>
              )}
            </div>
            {user.is_premium && (
              <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500">
                <Crown className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-purple-400" />
            {t('subscription')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t('currentPlan')}</span>
            <Badge
              className={
                subscription.tier === 'free'
                  ? 'bg-slate-600'
                  : subscription.tier === 'basic'
                  ? 'bg-blue-600'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600'
              }
            >
              {subscription.tier.toUpperCase()}
            </Badge>
          </div>

          {/* Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Generations</span>
              <span className="text-white">
                {subscription.generationsUsed} / {subscription.generationsLimit}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                style={{
                  width: `${
                    (subscription.generationsUsed / subscription.generationsLimit) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {subscription.tier === 'free' && (
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t('upgrade')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-5 w-5 text-blue-400" />
            {t('language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(Object.entries(localeNames) as [Locale, string][]).map(
              ([loc, name]) => (
                <Button
                  key={loc}
                  variant={locale === loc ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLanguageChange(loc)}
                  className={
                    locale === loc ? 'bg-purple-600' : 'border-slate-700'
                  }
                >
                  {name}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Clone */}
      <Card
        className="cursor-pointer border-slate-700 bg-slate-800/50 transition-all hover:border-slate-600"
        onClick={handleVoiceClone}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
            <Mic className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">{t('voiceClone')}</p>
            <p className="text-sm text-slate-400">
              {t('voiceCloneDescription')}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </CardContent>
      </Card>

      {/* Version info */}
      <p className="text-center text-xs text-slate-500">
        MindFrame v1.0.0 • mindframe.space
      </p>
    </div>
  );
}
