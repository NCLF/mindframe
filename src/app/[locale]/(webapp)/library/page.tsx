'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTelegram } from '@/hooks/useTelegram';
import {
  Play,
  Heart,
  Clock,
  Sparkles,
  Music2,
  Trash2,
} from 'lucide-react';

interface LibraryItem {
  id: string;
  text: string;
  audioBase64: string;
  scenario: string | null;
  tags: string[];
  createdAt: string;
  isFavorite?: boolean;
}

type FilterType = 'all' | 'favorites';

export default function LibraryPage() {
  const t = useTranslations('app');
  const router = useRouter();
  const { haptic } = useTelegram();
  const [filter, setFilter] = useState<FilterType>('all');
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  // Load library from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mindframe_library');
    if (saved) {
      try {
        setLibrary(JSON.parse(saved));
      } catch {
        setLibrary([]);
      }
    }
  }, []);

  // Save library to localStorage
  const saveLibrary = (items: LibraryItem[]) => {
    localStorage.setItem('mindframe_library', JSON.stringify(items));
    setLibrary(items);
  };

  const filteredItems = library.filter((item) =>
    filter === 'favorites' ? item.isFavorite : true
  );

  const toggleFavorite = (id: string) => {
    haptic('selection');
    const updated = library.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    saveLibrary(updated);
  };

  const deleteItem = (id: string) => {
    haptic('medium');
    const updated = library.filter((item) => item.id !== id);
    saveLibrary(updated);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const getScenarioColor = (scenario: string | null) => {
    const colors: Record<string, string> = {
      morning: 'from-amber-500 to-orange-500',
      evening: 'from-indigo-500 to-purple-500',
      focus: 'from-blue-500 to-cyan-500',
      sport: 'from-red-500 to-pink-500',
    };
    return colors[scenario || ''] || 'from-purple-500 to-blue-500';
  };

  const getScenarioName = (scenario: string | null) => {
    const names: Record<string, string> = {
      morning: 'Утро',
      evening: 'Вечер',
      focus: 'Фокус',
      sport: 'Спорт',
    };
    return names[scenario || ''] || 'Аффирмация';
  };

  // If item is selected, show player
  if (selectedItem) {
    const { AudioPlayer } = require('@/components/AudioPlayer');
    return (
      <div className="space-y-6 pb-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedItem(null)}
        >
          ← Назад
        </Button>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <p className="line-clamp-4 text-sm text-slate-300">{selectedItem.text}</p>
          </CardContent>
        </Card>

        <AudioPlayer
          base64Audio={selectedItem.audioBase64}
          title={getScenarioName(selectedItem.scenario)}
          subtitle={selectedItem.tags.join(', ')}
          isSaved={true}
          onSave={() => toggleFavorite(selectedItem.id)}
        />
      </div>
    );
  }

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
              onClick={() => router.push('/ru/generate')}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t('nav.generate')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="border-slate-700 bg-slate-800/50 transition-all hover:border-slate-600"
            >
              <CardContent className="flex items-center gap-4 p-4">
                {/* Play button with gradient */}
                <div
                  onClick={() => {
                    haptic('medium');
                    setSelectedItem(item);
                  }}
                  className={`flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br ${getScenarioColor(
                    item.scenario
                  )}`}
                >
                  <Play className="h-5 w-5 text-white" />
                </div>

                {/* Info */}
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => {
                    haptic('medium');
                    setSelectedItem(item);
                  }}
                >
                  <h3 className="truncate font-medium text-white">
                    {getScenarioName(item.scenario)}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
                    <span>{item.tags.slice(0, 2).join(', ')}</span>
                    <span>•</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Favorite toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className="shrink-0 p-2"
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      item.isFavorite
                        ? 'fill-red-400 text-red-400'
                        : 'text-slate-500 hover:text-red-400'
                    }`}
                  />
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Удалить?')) {
                      deleteItem(item.id);
                    }
                  }}
                  className="shrink-0 p-2"
                >
                  <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-400" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
