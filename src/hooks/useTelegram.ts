'use client';

import { useEffect, useState, useCallback } from 'react';

// Telegram Web App types
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    start_param?: string; // Referral code
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (shared: boolean) => void) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  sendData: (data: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      // Initialize the app
      tg.ready();

      // Expand to full screen immediately
      tg.expand();

      // Set dark theme colors for seamless experience
      try {
        tg.setHeaderColor('#0f172a'); // slate-900
        tg.setBackgroundColor('#0f172a');
      } catch {
        // Some versions don't support this
      }

      // Enable closing confirmation for important actions
      tg.enableClosingConfirmation();

      // Re-expand after a short delay (iOS fix)
      setTimeout(() => {
        if (!tg.isExpanded) {
          tg.expand();
        }
      }, 100);

      setWebApp(tg);
      setUser(tg.initDataUnsafe.user || null);
      setIsReady(true);
    }
  }, []);

  // Haptic feedback helpers
  const haptic = useCallback(
    (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection') => {
      if (!webApp) return;

      switch (type) {
        case 'light':
        case 'medium':
        case 'heavy':
          webApp.HapticFeedback.impactOccurred(type);
          break;
        case 'success':
        case 'error':
        case 'warning':
          webApp.HapticFeedback.notificationOccurred(type);
          break;
        case 'selection':
          webApp.HapticFeedback.selectionChanged();
          break;
      }
    },
    [webApp]
  );

  // Main button helpers
  const showMainButton = useCallback(
    (text: string, onClick: () => void) => {
      if (!webApp) return;

      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    },
    [webApp]
  );

  const hideMainButton = useCallback(() => {
    if (!webApp) return;
    webApp.MainButton.hide();
  }, [webApp]);

  // Back button helpers
  const showBackButton = useCallback(
    (onClick: () => void) => {
      if (!webApp) return;

      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    },
    [webApp]
  );

  const hideBackButton = useCallback(() => {
    if (!webApp) return;
    webApp.BackButton.hide();
  }, [webApp]);

  // Open payment invoice
  const openInvoice = useCallback(
    (url: string): Promise<string> => {
      return new Promise((resolve) => {
        if (!webApp) {
          resolve('failed');
          return;
        }

        webApp.openInvoice(url, (status) => {
          resolve(status);
        });
      });
    },
    [webApp]
  );

  // Share to Telegram
  const share = useCallback(
    (url: string, text?: string) => {
      if (!webApp) return;

      const shareUrl = text
        ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        : `https://t.me/share/url?url=${encodeURIComponent(url)}`;

      webApp.openTelegramLink(shareUrl);
    },
    [webApp]
  );

  return {
    webApp,
    user,
    isReady,
    isTelegram: !!webApp,
    // Start param (referral code)
    startParam: webApp?.initDataUnsafe.start_param,
    // Init data for server verification
    initData: webApp?.initData,
    // Theme
    colorScheme: webApp?.colorScheme || 'dark',
    themeParams: webApp?.themeParams || {},
    // Helpers
    haptic,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    openInvoice,
    share,
    // Direct access to popups
    showPopup: webApp?.showPopup,
    showAlert: webApp?.showAlert,
    showConfirm: webApp?.showConfirm,
    close: webApp?.close,
  };
}
