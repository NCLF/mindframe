'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTelegram } from '@/hooks/useTelegram';
import {
  Sun,
  Moon,
  Target,
  Dumbbell,
  Sparkles,
  Play,
  Loader2,
} from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';

// Available tags
const TAGS = [
  { id: 'concentration', icon: Target },
  { id: 'calm', icon: Moon },
  { id: 'energy', icon: Sparkles },
  { id: 'confidence', icon: Sparkles },
  { id: 'creativity', icon: Sparkles },
  { id: 'sleep', icon: Moon },
  { id: 'motivation', icon: Sparkles },
] as const;

// Available scenarios
const SCENARIOS = [
  { id: 'morning', icon: Sun, gradient: 'from-amber-500 to-orange-500' },
  { id: 'evening', icon: Moon, gradient: 'from-indigo-500 to-purple-500' },
  { id: 'focus', icon: Target, gradient: 'from-blue-500 to-cyan-500' },
  { id: 'sport', icon: Dumbbell, gradient: 'from-red-500 to-pink-500' },
] as const;

type GenerationStep = 'tags' | 'scenario' | 'generating' | 'result';

export default function GeneratePage() {
  const t = useTranslations('app');
  const { haptic, isTelegram } = useTelegram();

  const [step, setStep] = useState<GenerationStep>('tags');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  const handleTagToggle = (tagId: string) => {
    haptic('selection');
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
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

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      // TODO: Call actual API
      // const response = await fetch('/api/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     tags: selectedTags,
      //     scenario: selectedScenario,
      //   }),
      // });
      // const data = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setProgress(100);

      // Mock response
      setGeneratedText(
        'Я просыпаюсь с благодарностью за новый день. Моё тело наполнено энергией. Мой разум ясен и сфокусирован. Сегодня я создаю свою лучшую версию...'
      );

      haptic('success');
      setStep('result');
    } catch {
      haptic('error');
      clearInterval(progressInterval);
      setStep('tags');
    }
  };

  const handleNewGeneration = () => {
    setStep('tags');
    setSelectedTags([]);
    setSelectedScenario(null);
    setGeneratedText(null);
    setProgress(0);
  };

  // Step: Select Tags
  if (step === 'tags') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('generate.title')}</h1>

        <div>
          <h2 className="mb-4 text-lg font-medium text-slate-400">
            {t('generate.selectTags')}
          </h2>

          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                  selectedTags.includes(tag.id)
                    ? 'bg-purple-600 hover:bg-purple-500'
                    : 'border-slate-700 hover:border-purple-500'
                }`}
                onClick={() => handleTagToggle(tag.id)}
              >
                {t(`tags.${tag.id}`)}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-purple-600 hover:bg-purple-500"
          onClick={() => setStep('scenario')}
          disabled={selectedTags.length === 0}
        >
          {t('common.continue')}
        </Button>
      </div>
    );
  }

  // Step: Select Scenario
  if (step === 'scenario') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('tags')}
          >
            {t('common.back')}
          </Button>
          <h1 className="text-2xl font-bold">{t('generate.selectScenario')}</h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            const isSelected = selectedScenario === scenario.id;

            return (
              <Card
                key={scenario.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-500'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => handleScenarioSelect(scenario.id)}
              >
                <CardHeader className="pb-2">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${scenario.gradient}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base">
                    {t(`tags.${scenario.id === 'focus' ? 'concentration' : scenario.id === 'sport' ? 'motivation' : scenario.id === 'evening' ? 'sleep' : 'energy'}`)}
                  </CardTitle>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          size="lg"
          className="w-full bg-purple-600 hover:bg-purple-500"
          onClick={handleGenerate}
          disabled={!selectedScenario}
        >
          <Play className="mr-2 h-4 w-4" />
          {t('generate.generateButton')}
        </Button>
      </div>
    );
  }

  // Step: Generating
  if (step === 'generating') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <p className="text-lg text-slate-400">{t('generate.generating')}</p>
        <Progress value={progress} className="w-full max-w-xs" />
      </div>
    );
  }

  // Step: Result
  if (step === 'result' && generatedText) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('player.play')}</h1>

        {/* Generated text preview */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <p className="line-clamp-4 text-sm text-slate-300">{generatedText}</p>
          </CardContent>
        </Card>

        {/* Audio Player */}
        <AudioPlayer
          title={selectedScenario ? t(`tags.${selectedScenario === 'focus' ? 'concentration' : selectedScenario === 'sport' ? 'motivation' : selectedScenario === 'evening' ? 'sleep' : 'energy'}`) : 'Affirmation'}
          subtitle={selectedTags.map(tag => t(`tags.${tag}`)).join(', ')}
          onSave={() => {
            haptic('success');
            // TODO: Save to library
          }}
          onShare={() => {
            haptic('medium');
            // TODO: Share functionality
          }}
        />

        <Button
          variant="outline"
          className="w-full border-slate-700"
          onClick={handleNewGeneration}
        >
          {t('player.newGeneration')}
        </Button>
      </div>
    );
  }

  return null;
}
