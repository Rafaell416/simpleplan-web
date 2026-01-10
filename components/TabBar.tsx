'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HouseIcon } from '@/components/ui/icons/lucide-house';
import { SettingsIcon } from '@/components/ui/icons/lucide-settings';
import { TrophyIcon } from '@/components/ui/icons/lucide-trophy';

const items = [
  {
    title: 'Home',
    href: '/home',
    icon: HouseIcon,
  },
  {
    title: 'Goals',
    href: '/goals',
    icon: TrophyIcon,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
  },
] as const;

export function TabBar() {
  const pathname = usePathname();

  // Don't show tab bar on landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <div 
      data-tabbar
      className="fixed inset-x-0 bottom-0 z-[100] flex md:hidden pointer-events-none" 
      style={{ 
        position: 'fixed',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      <div className="w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-800 pointer-events-auto" style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-around h-16 px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    isActive
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                />
                <span className="text-xs mt-1 font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

