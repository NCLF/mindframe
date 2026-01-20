'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Heart,
  Clock,
  Sparkles,
  Music2,
} from 'lucide-react';

// Mock data - will be replaced with Supabase query
const mockLibrary = [
  {
    id: '1',
    title: 'Утренний заряд',
    scenario: 'morning',
    duration: 180,
    createdAt: new Date('2025-01-19'),
    isFavorite: true,
    playCount: 5,
  },
  {
    id: '2',
    title: 'Вечернее расслабление',
    scenario: 'evening',
    duration: 240,
    createdAt: new Date('2025-01-18'),
    isFavorite: false,
    playCount: 3,
  },
  {
    id: '3',
    title: 'Концентрация перед презентацией',
    scenario: 'focus',
    duration: 150,
    createdAt: new Date('2025-01-17'),
    isFavorite: true,
    playCount: 8,
  },
];

type FilterType = 'all' | 'favorites';

export default function LibraryPage() {
  const t = useTranslations('app');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredItems = mockLibrary.filter((item) =>
    filter === 'favorites' ? item.isFavorite : true
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const getScenarioColor = (scenario: string) => {
    const colors: Record<string, string> = {
      morning: 'from-amber-500 to-orange-500',
      evening: 'from-indigo-500 to-purple-500',
      focus: 'from-blue-500 to-cyan-500',
      sport: 'from-red-500 to-pink-500',
    };
    return colors[scenario] || 'from-slate-500 to-slate-600';
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold">{t('library.title')}</h1>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-purple-600' : 'border-slate-700'}
        >
          <Clock className="mr-2 h-4 w-4" />
          {t('library.recent')}
        </Button>
        <Button
          variant={filter === 'favorites' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('favorites')}
          className={filter === 'favorites' ? 'bg-purple-600' : 'border-slate-700'}
        >
          <Heart className="mr-2 h-4 w-4" />
          {t('library.favorites')}
        </Button>
      </div>

      {/* Library items */}
      {filteredItems.length === 0 ? (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Music2 className="mb-4 h-12 w-12 text-slate-500" />
            <p className="text-slate-400">{t('library.empty')}</p>
            <Button
              className="mt-4 bg-purple-600 hover:bg-purple-500"
              asChild
            >
              <a href="/generate">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('nav.generate')}
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer border-slate-700 bg-slate-800/50 transition-all hover:border-slate-600"
            >
              <CardContent className="flex items-center gap-4 p-4">
                {/* Play button with gradient */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getScenarioColor(
                    item.scenario
                  )}`}
                >
                  <Play className="h-5 w-5 text-white" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-white">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
                    <span>{formatDuration(item.duration)}</span>
                    <span>•</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Favorite indicator */}
                {item.isFavorite && (
                  <Heart className="h-5 w-5 shrink-0 fill-red-400 text-red-400" />
                )}

                {/* Play count badge */}
                <Badge variant="secondary" className="shrink-0 bg-slate-700">
                  {item.playCount}×
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
