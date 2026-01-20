'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Sparkles, Library, Settings } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';

const navItems = [
  { href: '/generate', icon: Sparkles, labelKey: 'generate' },
  { href: '/library', icon: Library, labelKey: 'library' },
  { href: '/settings', icon: Settings, labelKey: 'settings' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('app.nav');
  const { haptic } = useTelegram();

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'ru';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-900/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = `/${locale}${item.href}`;
          const isActive = pathname.includes(item.href);

          return (
            <Link
              key={item.href}
              href={href}
              onClick={() => haptic('selection')}
              className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                isActive
                  ? 'text-purple-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'fill-purple-400/20' : ''}`} />
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>

      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-slate-900" />
    </nav>
  );
}
