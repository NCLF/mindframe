'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTelegram } from '@/hooks/useTelegram';
import {
  Sun,
  Moon,
  Target,
  Dumbbell,
  Sparkles,
  Brain,
  Zap,
  Heart,
  Palette,
  BedDouble,
  Flame,
  Play,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ShareModal } from '@/components/ShareModal';
import { getPreferences, initPreferencesFromTelegram, savePreferences, type UserPreferences } from '@/lib/userPreferences';

// Available tags with icons
const TAGS = [
  { id: 'concentration', icon: Target, color: 'text-blue-400' },
  { id: 'calm', icon: Heart, color: 'text-pink-400' },
  { id: 'energy', icon: Zap, color: 'text-yellow-400' },
  { id: 'confidence', icon: Flame, color: 'text-orange-400' },
  { id: 'creativity', icon: Palette, color: 'text-purple-400' },
  { id: 'sleep', icon: BedDouble, color: 'text-indigo-400' },
  { id: 'motivation', icon: Sparkles, color: 'text-emerald-400' },
] as const;

type GenerationStep = 'tags' | 'scenario' | 'generating' | 'result' | 'error';

interface GenerationResult {
  text: string;
  audioBase64: string;
}

// Strip ElevenLabs v3 pause tags from display text
const stripPauseTags = (text: string): string => {
  return text
    .replace(/\[short pause\]/gi, '')
    .replace(/\[pause\]/gi, '')
    .replace(/\[long pause\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export default function GeneratePage() {
  const t = useTranslations('app');
  const tCommon = useTranslations('common');
  const { haptic, webApp, user } = useTelegram();

  const [step, setStep] = useState<GenerationStep>('tags');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Load user preferences on mount
  useEffect(() => {
    let prefs = getPreferences();

    // Try to detect gender from Telegram user
    if (user && !prefs.userGender) {
      prefs = initPreferencesFromTelegram(user);
    }

    setPreferences(prefs);
  }, [user]);

  // Save to localStorage
  const handleSave = () => {
    if (!result) return;
    haptic('success');

    const savedItems = JSON.parse(localStorage.getItem('mindframe_library') || '[]');
    const newItem = {
      id: Date.now().toString(),
      text: stripPauseTags(result.text),
      audioBase64: result.audioBase64,
      scenario: selectedScenario,
      tags: selectedTags,
      createdAt: new Date().toISOString(),
    };
    savedItems.unshift(newItem);
    localStorage.setItem('mindframe_library', JSON.stringify(savedItems.slice(0, 50)));
    setIsSaved(true);
  };

  // Share functionality - always show custom modal
  const handleShare = () => {
    if (!result) return;
    haptic('medium');
    setIsShareModalOpen(true);
  };

  const handleTagToggle = (tagId: string) => {
    haptic('selection');
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleVoiceGenderChange = (gender: 'male' | 'female') => {
    haptic('selection');
    const newPrefs = { ...preferences, voiceGender: gender };
    setPreferences(newPrefs as UserPreferences);
    savePreferences({ voiceGender: gender });
  };

  const handleScenarioSelect = (scenarioId: string) => {
    haptic('medium');
    setSelectedScenario(scenarioId);
  };

  const handleGenerate = async () => {
    if (!selectedScenario) return;

    haptic('medium');
    setStep('generating');
    setProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 5));
    }, 500);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: selectedTags,
          scenario: selectedScenario,
          language: 'ru',
          voiceId: preferences?.clonedVoiceId || preferences?.selectedVoiceId,
          voiceGender: preferences?.voiceGender,
          voiceProfile: preferences?.voiceProfile,
        }),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setProgress(100);
      setResult({
        text: data.data.text,
        audioBase64: data.data.audio.data,
      });

      haptic('success');
      setStep('result');
    } catch (err) {
      clearInterval(progressInterval);
      haptic('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
    }
  };

  const handleNewGeneration = () => {
    setStep('tags');
    setSelectedTags([]);
    setSelectedScenario(null);
    setResult(null);
    setProgress(0);
    setError(null);
    setIsSaved(false);
    setIsShareModalOpen(false);
  };

  // ============ STEP 1: Select Tags ============
  if (step === 'tags') {
    return (
      <div className="pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{t('generate.title')}</h1>
          <p className="mt-2 text-slate-400">{t('generate.selectTags')}</p>
        </div>

        {/* Voice Gender Selection */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-slate-400">{t('generate.voiceGender')}</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleVoiceGenderChange('female')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 transition-all ${
                preferences?.voiceGender === 'female'
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="text-xl">👩</span>
              <span className="font-medium">{t('generate.female')}</span>
              {preferences?.voiceGender === 'female' && (
                <Check className="h-4 w-4 text-purple-400" />
              )}
            </button>
            <button
              onClick={() => handleVoiceGenderChange('male')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 transition-all ${
                preferences?.voiceGender === 'male'
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="text-xl">👨</span>
              <span className="font-medium">{t('generate.male')}</span>
              {preferences?.voiceGender === 'male' && (
                <Check className="h-4 w-4 text-purple-400" />
              )}
            </button>
          </div>
        </div>

        {/* Tags Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {TAGS.map((tag) => {
              const Icon = tag.icon;
              const isSelected = selectedTags.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className={`rounded-xl p-2 ${isSelected ? 'bg-purple-500/20' : 'bg-slate-700/50'}`}>
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-purple-400' : tag.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {t(`tags.${tag.id}`)}
                  </span>
                  {isSelected && (
                    <div className="absolute right-3 top-3">
                      <Check className="h-4 w-4 text-purple-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue Button - sticky */}
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 pb-4 pt-2">
          <Button
            size="lg"
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-base font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 disabled:opacity-50"
            onClick={() => setStep('scenario')}
            disabled={selectedTags.length === 0}
          >
            {tCommon('continue')}
          </Button>
        </div>
      </div>
    );
  }

  // ============ STEP 2: Select Scenario ============
  if (step === 'scenario') {
    const scenarioData = [
      { id: 'morning', icon: Sun, label: 'Утром', desc: 'После пробуждения', time: '5-10 мин', gradient: 'from-amber-500 to-orange-500' },
      { id: 'evening', icon: Moon, label: 'Вечером', desc: 'Перед сном', time: '10-15 мин', gradient: 'from-indigo-500 to-purple-500' },
      { id: 'focus', icon: Brain, label: 'Перед работой', desc: 'Вход в поток', time: '5-7 мин', gradient: 'from-cyan-500 to-blue-500' },
      { id: 'sport', icon: Dumbbell, label: 'Тренировка', desc: 'Перед нагрузкой', time: '3-5 мин', gradient: 'from-rose-500 to-red-500' },
    ];

    return (
      <div className="flex flex-col">
        {/* Header with back button */}
        <div className="mb-4">
          <button
            onClick={() => setStep('tags')}
            className="mb-3 flex items-center gap-1 text-slate-400 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">{tCommon('back')}</span>
          </button>
          <h1 className="text-xl font-bold text-white">Когда слушать?</h1>
        </div>

        {/* Scenarios List - compact */}
        <div className="mb-4 space-y-2">
          {scenarioData.map((scenario) => {
            const Icon = scenario.icon;
            const isSelected = selectedScenario === scenario.id;

            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioSelect(scenario.id)}
                className={`relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.99] ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${scenario.gradient}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <span className="block font-semibold text-white">{scenario.label}</span>
                  <span className="text-sm text-slate-400">{scenario.desc}</span>
                </div>
                <span className="text-xs text-slate-500">{scenario.time}</span>
                {isSelected && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="rounded-full bg-purple-500 p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Generate Button - always visible */}
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 pb-4 pt-2">
          <Button
            size="lg"
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-base font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 disabled:opacity-50"
            onClick={handleGenerate}
            disabled={!selectedScenario}
          >
            <Play className="mr-2 h-5 w-5" />
            {t('generate.generateButton')}
          </Button>
        </div>
      </div>
    );
  }

  // ============ STEP 3: Generating ============
  if (step === 'generating') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
          <div className="relative rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-6">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        </div>

        <h2 className="mb-2 text-xl font-semibold text-white">
          {t('generate.generating')}
        </h2>

        <p className="mb-8 text-center text-slate-400">
          {progress < 30 && 'Создаём текст аффирмации...'}
          {progress >= 30 && progress < 70 && 'Генерируем голос...'}
          {progress >= 70 && 'Финальная обработка...'}
        </p>

        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="mt-2 text-center text-sm text-slate-500">{progress}%</p>
        </div>
      </div>
    );
  }

  // ============ STEP 4: Error ============
  if (step === 'error') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="mb-6 rounded-full bg-red-500/10 p-6">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>

        <h2 className="mb-2 text-xl font-semibold text-white">
          Что-то пошло не так
        </h2>

        <p className="mb-8 max-w-xs text-center text-slate-400">
          {error || 'Попробуй ещё раз'}
        </p>

        <Button
          size="lg"
          variant="outline"
          className="h-12 rounded-2xl border-slate-700 px-8"
          onClick={handleNewGeneration}
        >
          {tCommon('retry')}
        </Button>
      </div>
    );
  }

  // ============ STEP 5: Result ============
  if (step === 'result' && result) {
    const scenarioLabels: Record<string, string> = {
      morning: 'Утренняя',
      evening: 'Вечерняя',
      focus: 'Для работы',
      sport: 'Спортивная',
    };

    return (
      <div className="pb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">{t('player.play')}</h1>
          <p className="mt-1 text-slate-400">
            {selectedScenario ? scenarioLabels[selectedScenario] : ''} аффирмация
          </p>
        </div>

        {/* Text Preview */}
        <Card className="mb-6 border-slate-700/50 bg-slate-800/30">
          <CardContent className="p-4">
            <p className="line-clamp-4 text-sm leading-relaxed text-slate-300">
              {stripPauseTags(result.text)}
            </p>
          </CardContent>
        </Card>

        {/* Audio Player */}
        <div className="mb-4">
          <AudioPlayer
            base64Audio={result.audioBase64}
            title={selectedScenario ? scenarioLabels[selectedScenario] : 'Аффирмация'}
            subtitle={selectedTags.map(tag => t(`tags.${tag}`)).join(', ')}
            onSave={handleSave}
            onShare={handleShare}
            isSaved={isSaved}
          />
        </div>

        {/* New Generation Button */}
        <div>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-2xl border-slate-700"
            onClick={handleNewGeneration}
          >
            {t('player.newGeneration')}
          </Button>
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          text={stripPauseTags(result.text)}
          audioBase64={result.audioBase64}
        />
      </div>
    );
  }

  return null;
}
