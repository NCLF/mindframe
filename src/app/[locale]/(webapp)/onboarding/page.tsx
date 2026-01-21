'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  ChevronRight,
  Check,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import {
  getPreferences,
  savePreferences,
} from '@/lib/userPreferences';

type OnboardingStep = 'welcome' | 'voice' | 'complete';

export default function OnboardingPage() {
  const t = useTranslations('app.onboarding');
  const locale = useLocale();
  const router = useRouter();
  const { haptic, user } = useTelegram();

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if already completed onboarding
  useEffect(() => {
    const prefs = getPreferences();
    if (prefs.hasCompletedOnboarding) {
      router.replace(`/${locale}/generate`);
      return;
    }

    // Try to detect gender from Telegram name
    if (user?.first_name) {
      const name = user.first_name.toLowerCase();
      // Russian female name endings
      const femaleEndings = ['а', 'я', 'ия', 'ья'];
      const isFemale = femaleEndings.some(ending => name.endsWith(ending));
      setVoiceGender(isFemale ? 'female' : 'male');
    }
  }, [locale, router, user]);

  const getStepProgress = () => {
    switch (step) {
      case 'welcome': return 0;
      case 'voice': return 50;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getSampleAudioUrl = () => {
    // Morning = male voice, Evening = female voice
    // Play sample matching selected gender
    const scenario = voiceGender === 'male' ? 'morning' : 'evening';
    return `/audio/samples/${scenario}_${locale}.mp3`;
  };

  const handlePlaySample = () => {
    haptic('light');

    if (!audioRef.current) {
      audioRef.current = new Audio(getSampleAudioUrl());
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        console.warn('Sample audio not found, skipping preview');
        setIsPlaying(false);
      };
    } else {
      audioRef.current.src = getSampleAudioUrl();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        console.warn('Could not play sample audio');
      });
      setIsPlaying(true);
    }
  };

  const handleGenderSelect = (gender: 'male' | 'female') => {
    haptic('selection');
    setVoiceGender(gender);

    // Stop and reset audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleComplete = () => {
    haptic('success');

    // Save preferences
    savePreferences({
      hasCompletedOnboarding: true,
      voiceGender: voiceGender,
      voiceProfile: 'confidence', // Default profile
    });

    setStep('complete');

    // Redirect to generate after animation
    setTimeout(() => {
      router.replace(`/${locale}/generate`);
    }, 1000);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col">
      {/* Progress bar */}
      <div className="mb-6">
        <Progress value={getStepProgress()} className="h-1" />
      </div>

      {/* Welcome Step */}
      {step === 'welcome' && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse">
            <Brain className="h-12 w-12 text-white" />
          </div>

          <h1 className="mb-4 text-3xl font-bold text-white">
            {locale === 'ru' ? 'Настрой свой Mental Utility' : 'Set Up Your Mental Utility'}
          </h1>

          <p className="mb-8 max-w-sm text-lg text-slate-400">
            {locale === 'ru'
              ? 'Выбери голос и создай первую нейро-сессию за 30 секунд'
              : 'Choose your voice and create your first neuro-session in 30 seconds'}
          </p>

          <Button
            size="lg"
            onClick={() => {
              haptic('medium');
              setStep('voice');
            }}
            className="group bg-gradient-to-r from-purple-600 to-blue-600 px-8 text-lg hover:from-purple-500 hover:to-blue-500"
          >
            {locale === 'ru' ? 'Начать' : 'Start'}
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      )}

      {/* Voice Selection Step */}
      {step === 'voice' && (
        <div className="flex flex-1 flex-col px-4">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">
              {locale === 'ru' ? 'Выбери голос' : 'Choose Your Voice'}
            </h2>
            <p className="text-slate-400">
              {locale === 'ru'
                ? 'Этот голос будет озвучивать твои нейро-сессии'
                : 'This voice will narrate your neuro-sessions'}
            </p>
          </div>

          {/* Gender Selection */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {/* Female Voice */}
            <button
              onClick={() => handleGenderSelect('female')}
              className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
                voiceGender === 'female'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
              }`}
            >
              <div className="text-5xl">👩</div>
              <div className="text-center">
                <p className={`text-lg font-medium ${voiceGender === 'female' ? 'text-white' : 'text-slate-300'}`}>
                  {locale === 'ru' ? 'Женский' : 'Female'}
                </p>
                <p className="text-xs text-slate-500">
                  {locale === 'ru' ? 'Тёплый, мягкий' : 'Warm, soft'}
                </p>
              </div>
              {voiceGender === 'female' && (
                <div className="absolute -right-1 -top-1">
                  <div className="rounded-full bg-purple-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </button>

            {/* Male Voice */}
            <button
              onClick={() => handleGenderSelect('male')}
              className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
                voiceGender === 'male'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
              }`}
            >
              <div className="text-5xl">👨</div>
              <div className="text-center">
                <p className={`text-lg font-medium ${voiceGender === 'male' ? 'text-white' : 'text-slate-300'}`}>
                  {locale === 'ru' ? 'Мужской' : 'Male'}
                </p>
                <p className="text-xs text-slate-500">
                  {locale === 'ru' ? 'Глубокий, уверенный' : 'Deep, confident'}
                </p>
              </div>
              {voiceGender === 'male' && (
                <div className="absolute -right-1 -top-1">
                  <div className="rounded-full bg-purple-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Audio Preview */}
          <div className="mb-6">
            <button
              onClick={handlePlaySample}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-800/50 p-4 transition-colors hover:bg-slate-800"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isPlaying ? 'bg-purple-500' : 'bg-slate-700'}`}>
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="ml-1 h-6 w-6 text-white" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-white">
                  {locale === 'ru' ? 'Послушать пример' : 'Listen to sample'}
                </p>
                <p className="text-sm text-slate-400">
                  {locale === 'ru' ? '15 сек нейро-сессии' : '15 sec neuro-session'}
                </p>
              </div>
              <Volume2 className="ml-auto h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Info card */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 border border-purple-500/20">
            <p className="text-sm text-slate-300">
              {locale === 'ru'
                ? '💡 Позже ты сможешь клонировать свой голос в настройках для максимального эффекта'
                : '💡 Later you can clone your own voice in settings for maximum effect'}
            </p>
          </div>

          {/* Complete button */}
          <div className="mt-auto pb-6">
            <Button
              size="lg"
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-lg hover:from-purple-500 hover:to-blue-500"
            >
              {locale === 'ru' ? 'Создать первую сессию' : 'Create First Session'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 animate-bounce">
            <Check className="h-10 w-10 text-green-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">
            {locale === 'ru' ? 'Готово!' : 'Ready!'}
          </h1>

          <p className="text-lg text-slate-400">
            {locale === 'ru' ? 'Создаём твою первую сессию...' : 'Creating your first session...'}
          </p>
        </div>
      )}
    </div>
  );
}
