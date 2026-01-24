'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Palette, User, Mail, ChevronRight } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';

const settingsCategories = [
  {
    id: 'appearance',
    title: 'Theming & Appearance',
    description: 'Customize theme colors, font size, and font style',
    icon: Palette,
    href: '/settings/appearance',
  },
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your account settings and preferences',
    icon: User,
    href: '/settings/profile',
  },
  {
    id: 'contact',
    title: 'Contact Us',
    description: 'Get in touch with our support team',
    icon: Mail,
    href: '/settings/contact',
  },
];

export default function SettingsPage() {
  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header title="Settings" />
        <div className="flex-1 flex flex-col pt-24 pb-20 md:pb-32">
          <div className="w-full max-w-2xl mx-auto px-6 py-8">
            <div className="space-y-3">
              {settingsCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-6 h-6 text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
