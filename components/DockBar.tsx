'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/shadcn-io/dock';
import { ChartLineIcon } from '@/components/ui/icons/lucide-chart-line';
import { HouseIcon } from '@/components/ui/icons/lucide-house';
import { SettingsIcon } from '@/components/ui/icons/lucide-settings';
import { TrophyIcon } from '@/components/ui/icons/lucide-trophy';

const items = [
  {
    title: 'Home',
    href: '/',
    icon: HouseIcon,
  },
  {
    title: 'Goals',
    href: '/goals',
    icon: TrophyIcon,
  },
  {
    title: 'Progress',
    href: '/progress',
    icon: ChartLineIcon,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
  },
] as const;

export function DockBar() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center">
      <div className="pointer-events-auto">
        <Dock
          magnification={50}
          distance={80}
          panelHeight={64}
          className="items-end gap-6 rounded-[20px] bg-white/90 pb-3"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center justify-center"
              >
                <DockItem className="aspect-square">
                  <DockLabel>{item.title}</DockLabel>
                  <DockIcon>
                    <Icon
                      className={`h-full w-full transition-colors ${
                        isActive
                          ? 'text-slate-500'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    />
                  </DockIcon>
                </DockItem>
              </Link>
            );
          })}
        </Dock>
      </div>
    </div>
  );
}

