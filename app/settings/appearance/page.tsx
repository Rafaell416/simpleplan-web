'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { useSettings } from '@/lib/useSettings';
import { THEME_PALETTES, FONT_SIZE_CONFIG, FONT_STYLE_CONFIG, type ThemePalette, type FontSize, type FontStyle } from '@/lib/settingsTypes';
import { Palette, Type, Sun, Moon, Monitor, ArrowLeft } from 'lucide-react';

export default function AppearanceSettingsPage() {
  const { settings, setTheme, setFontSize, setFontStyle, setDarkMode } = useSettings();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header title="Theming & Appearance" />
      <div className="flex-1 flex flex-col pt-24 pb-20 md:pb-32">
        <div className="w-full max-w-2xl mx-auto px-6 py-8 space-y-8">
          {/* Back Button */}
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>

          {/* Theme Palette Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Theme
              </h2>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Choose your preferred color palette
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(THEME_PALETTES).map(([key, palette]) => (
                <label
                  key={key}
                  className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                  style={{
                    borderColor: settings.theme === key ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: settings.theme === key ? 'var(--muted)' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={key}
                    checked={settings.theme === key}
                    onChange={(e) => setTheme(e.target.value as ThemePalette)}
                    className="mt-0.5 w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-900 dark:text-neutral-50">
                      {palette.name}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {palette.description}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <div
                        className="w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700"
                        style={{ backgroundColor: palette.colors.light.primary }}
                        title="Light mode"
                      />
                      <div
                        className="w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700"
                        style={{ backgroundColor: palette.colors.dark.primary }}
                        title="Dark mode"
                      />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Dark Mode Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Appearance
              </h2>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Choose how the app adapts to your system preferences
            </p>
            <div className="space-y-2">
              {[
                { value: 'light' as const, label: 'Light', icon: Sun },
                { value: 'dark' as const, label: 'Dark', icon: Moon },
                { value: 'auto' as const, label: 'Auto (System)', icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50"
                  style={{
                    borderColor: settings.darkMode === value ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: settings.darkMode === value ? 'var(--muted)' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="darkMode"
                    value={value}
                    checked={settings.darkMode === value}
                    onChange={(e) => setDarkMode(e.target.value as 'light' | 'dark' | 'auto')}
                    className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <Icon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Font Size Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Font Size
              </h2>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Adjust the text size for better readability (like iOS)
            </p>
            <div className="space-y-2">
              {Object.entries(FONT_SIZE_CONFIG).map(([key, config]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50"
                  style={{
                    borderColor: settings.fontSize === key ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: settings.fontSize === key ? 'var(--muted)' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="fontSize"
                    value={key}
                    checked={settings.fontSize === key}
                    onChange={(e) => setFontSize(e.target.value as FontSize)}
                    className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-neutral-50">
                      {config.name}
                    </div>
                    <div
                      className="text-neutral-600 dark:text-neutral-400 mt-1"
                      style={{ fontSize: `${config.multiplier * 0.875}rem` }}
                    >
                      Sample text at this size
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Font Style Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Font Style
              </h2>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Choose your preferred font family
            </p>
            <div className="space-y-2">
              {Object.entries(FONT_STYLE_CONFIG).map(([key, config]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50"
                  style={{
                    borderColor: settings.fontStyle === key ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: settings.fontStyle === key ? 'var(--muted)' : 'transparent',
                    fontFamily: config.family,
                  }}
                >
                  <input
                    type="radio"
                    name="fontStyle"
                    value={key}
                    checked={settings.fontStyle === key}
                    onChange={(e) => setFontStyle(e.target.value as FontStyle)}
                    className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-neutral-50">
                      {config.name}
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
                      The quick brown fox jumps over the lazy dog
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

