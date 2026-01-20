'use client';

import { useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { BottomNav } from '@/components/BottomNav';

export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isTelegram, colorScheme, themeParams } = useTelegram();

  // Apply Telegram theme colors as CSS variables
  useEffect(() => {
    if (isTelegram && themeParams) {
      const root = document.documentElement;

      if (themeParams.bg_color) {
        root.style.setProperty('--tg-bg-color', themeParams.bg_color);
      }
      if (themeParams.text_color) {
        root.style.setProperty('--tg-text-color', themeParams.text_color);
      }
      if (themeParams.hint_color) {
        root.style.setProperty('--tg-hint-color', themeParams.hint_color);
      }
      if (themeParams.link_color) {
        root.style.setProperty('--tg-link-color', themeParams.link_color);
      }
      if (themeParams.button_color) {
        root.style.setProperty('--tg-button-color', themeParams.button_color);
      }
      if (themeParams.button_text_color) {
        root.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
      }
      if (themeParams.secondary_bg_color) {
        root.style.setProperty('--tg-secondary-bg-color', themeParams.secondary_bg_color);
      }
    }
  }, [isTelegram, themeParams]);

  return (
    <div
      className={`min-h-screen ${colorScheme === 'dark' ? 'dark' : ''}`}
      style={{
        backgroundColor: themeParams?.bg_color || (colorScheme === 'dark' ? '#1a1a1a' : '#ffffff'),
        color: themeParams?.text_color || (colorScheme === 'dark' ? '#ffffff' : '#000000'),
      }}
    >
      <main className="container mx-auto max-w-lg px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
