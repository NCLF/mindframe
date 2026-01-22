'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTelegram } from '@/hooks/useTelegram';
import { BottomNav } from '@/components/BottomNav';
import { getPreferences } from '@/lib/userPreferences';

export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isTelegram, colorScheme, themeParams } = useTelegram();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isChecking, setIsChecking] = useState(true);

  // Check onboarding status and redirect if needed
  useEffect(() => {
    const isOnboardingPage = pathname.includes('/onboarding');

    if (!isOnboardingPage) {
      const prefs = getPreferences();
      if (!prefs.hasCompletedOnboarding) {
        router.replace(`/${locale}/onboarding`);
        return;
      }
    }

    setIsChecking(false);
  }, [pathname, locale, router]);

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

  const isOnboardingPage = pathname.includes('/onboarding');

  // Show loading while checking onboarding status
  if (isChecking && !isOnboardingPage) {
    return (
      <div
        className="min-h-screen dark"
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
        }}
      >
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen dark"
      style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
      }}
    >
      <main className="container mx-auto max-w-lg px-4 pb-24 pt-6">
        {children}
      </main>
      {!isOnboardingPage && <BottomNav />}
    </div>
  );
}
