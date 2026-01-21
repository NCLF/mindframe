'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Mic,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
  Moon,
  GraduationCap,
  Dumbbell,
  Wind,
} from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import {
  PSYCHOTYPE_QUIZ,
  calculatePsychotype,
  PSYCHOTYPE_PROFILES,
  type Psychotype,
  type QuizResult,
} from '@/lib/psychotype';
import {
  BEAUTIFICATION_PROFILES,
  type VoiceProfile,
} from '@/lib/elevenlabs';
import {
  getPreferences,
  savePreferences,
} from '@/lib/userPreferences';

type OnboardingStep = 'welcome' | 'quiz' | 'result' | 'profile' | 'complete';

export default function OnboardingPage() {
  const t = useTranslations('app.onboarding');
  const locale = useLocale();
  const router = useRouter();
  const { haptic } = useTelegram();

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<VoiceProfile>('confidence');

  // Check if already completed onboarding
  useEffect(() => {
    const prefs = getPreferences();
    if (prefs.hasCompletedOnboarding) {
      router.replace(`/${locale}/generate`);
    }
  }, [locale, router]);

  const totalQuestions = PSYCHOTYPE_QUIZ.length;
  const currentQuestion = PSYCHOTYPE_QUIZ[currentQuestionIndex];

  const getStepProgress = () => {
    switch (step) {
      case 'welcome': return 0;
      case 'quiz': return 20 + (currentQuestionIndex / totalQuestions) * 40;
      case 'result': return 65;
      case 'profile': return 85;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const handleAnswer = (optionId: string) => {
    haptic('selection');
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    // Auto-advance to next question or results
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Calculate result
        const result = calculatePsychotype(newAnswers);
        setQuizResult(result);
        setSelectedProfile(result.profile.defaultVoiceProfile);
        setStep('result');
      }
    }, 300);
  };

  const handleProfileSelect = (profile: VoiceProfile) => {
    haptic('selection');
    setSelectedProfile(profile);
  };

  const handleComplete = () => {
    haptic('success');

    // Save preferences
    savePreferences({
      hasCompletedOnboarding: true,
      psychotype: quizResult?.psychotype,
      voiceProfile: selectedProfile,
    });

    setStep('complete');

    // Redirect to generate after animation
    setTimeout(() => {
      router.replace(`/${locale}/generate`);
    }, 1500);
  };

  const getProfileIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Zap': <Zap className="h-6 w-6" />,
      'Moon': <Moon className="h-6 w-6" />,
      'GraduationCap': <GraduationCap className="h-6 w-6" />,
      'Dumbbell': <Dumbbell className="h-6 w-6" />,
      'Wind': <Wind className="h-6 w-6" />,
    };
    return icons[iconName] || <Sparkles className="h-6 w-6" />;
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col">
      {/* Progress bar */}
      <div className="mb-6">
        <Progress value={getStepProgress()} className="h-1" />
      </div>

      {/* Welcome Step */}
      {step === 'welcome' && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
            <Brain className="h-12 w-12 text-white" />
          </div>

          <h1 className="mb-4 text-3xl font-bold text-white">
            {t('welcome.title')}
          </h1>

          <p className="mb-8 max-w-sm text-lg text-slate-400">
            {t('welcome.subtitle')}
          </p>

          <Button
            size="lg"
            onClick={() => {
              haptic('medium');
              setStep('quiz');
            }}
            className="group bg-gradient-to-r from-purple-600 to-blue-600 px-8 text-lg hover:from-purple-500 hover:to-blue-500"
          >
            {t('welcome.cta')}
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      )}

      {/* Quiz Step */}
      {step === 'quiz' && currentQuestion && (
        <div className="flex flex-1 flex-col px-4">
          {/* Question counter */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                haptic('light');
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(prev => prev - 1);
                } else {
                  setStep('welcome');
                }
              }}
              className="text-slate-400"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {locale === 'ru' ? 'Назад' : 'Back'}
            </Button>
            <span className="text-sm text-slate-500">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* Question */}
          <h2 className="mb-6 text-xl font-semibold text-white">
            {locale === 'ru' ? currentQuestion.questionRu : currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <span className={isSelected ? 'text-white' : 'text-slate-300'}>
                    {locale === 'ru' ? option.textRu : option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && quizResult && (
        <div className="flex flex-1 flex-col items-center px-4 text-center">
          <div className="mb-6 text-6xl">{quizResult.profile.emoji}</div>

          <h2 className="mb-2 text-2xl font-bold text-white">
            {locale === 'ru' ? 'Твой профиль:' : 'Your profile:'}
          </h2>

          <h1 className="mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-3xl font-bold text-transparent">
            {locale === 'ru' ? quizResult.profile.nameRu : quizResult.profile.name}
          </h1>

          <p className="mb-6 max-w-sm text-slate-400">
            {locale === 'ru' ? quizResult.profile.descriptionRu : quizResult.profile.description}
          </p>

          {/* Traits */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {(locale === 'ru' ? quizResult.profile.traitsRu : quizResult.profile.traits).map((trait, i) => (
              <span
                key={i}
                className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
              >
                {trait}
              </span>
            ))}
          </div>

          <Button
            size="lg"
            onClick={() => {
              haptic('medium');
              setStep('profile');
            }}
            className="group bg-gradient-to-r from-purple-600 to-blue-600 px-8 text-lg hover:from-purple-500 hover:to-blue-500"
          >
            {locale === 'ru' ? 'Продолжить' : 'Continue'}
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      )}

      {/* Profile Selection Step */}
      {step === 'profile' && (
        <div className="flex flex-1 flex-col px-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Mic className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t('profileSelect.title')}
              </h2>
              <p className="text-sm text-slate-400">
                {t('profileSelect.subtitle')}
              </p>
            </div>
          </div>

          {/* Voice Profiles Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {BEAUTIFICATION_PROFILES.map((profile) => {
              const isSelected = selectedProfile === profile.id;

              return (
                <button
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile.id)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {getProfileIcon(profile.icon)}
                  </div>
                  <div className="text-center">
                    <p className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {locale === 'ru' ? profile.nameRu : profile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {locale === 'ru'
                        ? profile.descriptionRu.split('.')[0]
                        : profile.description.split('.')[0]}
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

          {/* Complete button */}
          <div className="mt-auto pb-6 pt-6">
            <Button
              size="lg"
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-lg hover:from-purple-500 hover:to-blue-500"
            >
              {t('complete.cta')}
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <Check className="h-10 w-10 text-green-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">
            {t('complete.title')}
          </h1>

          <p className="text-lg text-slate-400">
            {t('complete.subtitle')}
          </p>
        </div>
      )}
    </div>
  );
}
