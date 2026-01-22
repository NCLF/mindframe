'use client';

import { useState, useEffect } from 'react';
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
  User,
  Check,
  Volume2,
  Zap,
  Moon,
  GraduationCap,
  Dumbbell,
  Wind,
  Activity,
} from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { localeNames, type Locale } from '@/i18n/config';
import {
  VOICE_OPTIONS,
  getVoicesByGender,
  BEAUTIFICATION_PROFILES,
  type VoiceGender,
  type VoiceOption,
  type VoiceProfile,
} from '@/lib/elevenlabs';
import {
  getPreferences,
  savePreferences,
  initPreferencesFromTelegram,
  type UserPreferences,
} from '@/lib/userPreferences';

export default function SettingsPage() {
  const t = useTranslations('app.settings');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { user, haptic } = useTelegram();

  // User preferences state
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);

  // Initialize preferences
  useEffect(() => {
    let prefs = getPreferences();

    // Try to detect gender from Telegram user
    if (user && !prefs.userGender) {
      prefs = initPreferencesFromTelegram(user);
    }

    setPreferences(prefs);
    setAvailableVoices(getVoicesByGender(prefs.voiceGender));
  }, [user]);

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

  // Voice gender selection
  const handleGenderChange = (gender: VoiceGender) => {
    haptic('selection');
    const voices = getVoicesByGender(gender);
    setAvailableVoices(voices);

    // Update preferences and select first voice of new gender
    const updated = savePreferences({
      voiceGender: gender,
      selectedVoiceId: voices[0]?.id,
    });
    setPreferences(updated);
  };

  // Voice selection
  const handleVoiceSelect = (voiceId: string) => {
    haptic('selection');
    const updated = savePreferences({ selectedVoiceId: voiceId });
    setPreferences(updated);
  };

  // Voice profile selection
  const handleProfileSelect = (profile: VoiceProfile) => {
    haptic('selection');
    const updated = savePreferences({ voiceProfile: profile });
    setPreferences(updated);
  };

  // Get icon component for profile
  const getProfileIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Zap': <Zap className="h-5 w-5" />,
      'Moon': <Moon className="h-5 w-5" />,
      'GraduationCap': <GraduationCap className="h-5 w-5" />,
      'Dumbbell': <Dumbbell className="h-5 w-5" />,
      'Wind': <Wind className="h-5 w-5" />,
    };
    return icons[iconName] || <Sparkles className="h-5 w-5" />;
  };

  const handleVoiceClone = () => {
    haptic('medium');
    // TODO: Navigate to voice clone page or open modal
    alert('Voice clone feature coming soon!');
  };

  const handleUpgrade = () => {
    haptic('medium');
    router.push(`/${locale}/upgrade`);
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

      {/* Voice Selection */}
      {preferences && (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Volume2 className="h-5 w-5 text-emerald-400" />
              {locale === 'ru' ? 'Голос озвучки' : 'Voice'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gender selection */}
            <div>
              <p className="mb-2 text-sm text-slate-400">
                {locale === 'ru' ? 'Гендер голоса' : 'Voice gender'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={preferences.voiceGender === 'female' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleGenderChange('female')}
                  className={
                    preferences.voiceGender === 'female'
                      ? 'bg-pink-600 hover:bg-pink-500'
                      : 'border-slate-700'
                  }
                >
                  <User className="mr-1 h-4 w-4" />
                  {locale === 'ru' ? 'Женский' : 'Female'}
                </Button>
                <Button
                  variant={preferences.voiceGender === 'male' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleGenderChange('male')}
                  className={
                    preferences.voiceGender === 'male'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'border-slate-700'
                  }
                >
                  <User className="mr-1 h-4 w-4" />
                  {locale === 'ru' ? 'Мужской' : 'Male'}
                </Button>
              </div>
            </div>

            {/* Voice list */}
            <div>
              <p className="mb-2 text-sm text-slate-400">
                {locale === 'ru' ? 'Выбери голос' : 'Select voice'}
              </p>
              <div className="space-y-2">
                {availableVoices.map((voice) => {
                  const isSelected = preferences.selectedVoiceId === voice.id ||
                    (!preferences.selectedVoiceId && voice === availableVoices[0]);

                  return (
                    <button
                      key={voice.id}
                      onClick={() => handleVoiceSelect(voice.id)}
                      className={`relative flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          isSelected ? 'bg-purple-500/20' : 'bg-slate-700/50'
                        }`}
                      >
                        <Volume2 className={`h-5 w-5 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {locale === 'ru' ? voice.nameRu : voice.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {locale === 'ru' ? voice.descriptionRu : voice.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="shrink-0">
                          <div className="rounded-full bg-purple-500 p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Profile (Beautification) */}
      {preferences && (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-purple-400" />
              {t('voiceProfile')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-400">
              {t('voiceProfileDescription')}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BEAUTIFICATION_PROFILES.map((profile) => {
                const isSelected = preferences.voiceProfile === profile.id;

                return (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileSelect(profile.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-400'
                      }`}
                    >
                      {getProfileIcon(profile.icon)}
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {locale === 'ru' ? profile.nameRu : profile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {locale === 'ru' ? profile.descriptionRu.split('.')[0] : profile.description.split('.')[0]}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute -right-1 -top-1">
                        <div className="rounded-full bg-purple-500 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
