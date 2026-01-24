'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  ThemePalette,
  FontSize,
  FontStyle,
  THEME_PALETTES,
  FONT_STYLE_CONFIG,
} from './settingsTypes';
import { supabase } from './supabase/client';

const SETTINGS_STORAGE_KEY = 'simpleplan-settings';

function applyThemeColors(theme: ThemePalette, isDark: boolean) {
  const root = document.documentElement;
  const palette = THEME_PALETTES[theme];
  const colors = isDark ? palette.colors.dark : palette.colors.light;

  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.foreground);
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-foreground', colors.primaryForeground);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--muted', colors.muted);
  root.style.setProperty('--muted-foreground', colors.mutedForeground);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-foreground', colors.accentForeground);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--input', colors.input);
  root.style.setProperty('--ring', colors.ring);
  root.style.setProperty('--card', colors.card);
  root.style.setProperty('--card-foreground', colors.cardForeground);
}

interface SettingsContextType {
  settings: AppSettings;
  isLoaded: boolean;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setTheme: (theme: ThemePalette) => void;
  setFontSize: (fontSize: FontSize) => void;
  setFontStyle: (fontStyle: FontStyle) => void;
  setDarkMode: (darkMode: 'light' | 'dark' | 'auto') => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

function useSettingsInternal() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);

  // Load settings from Supabase or localStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured, using localStorage');
        setUseSupabase(false);
        // Load from localStorage
        try {
          const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setSettings({ ...DEFAULT_SETTINGS, ...parsed });
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
        } finally {
          setIsLoaded(true);
        }
        return;
      }

      // Check if user is authenticated before trying to load from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        // Not authenticated, use localStorage only
        setUseSupabase(false);
        try {
          const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setSettings({ ...DEFAULT_SETTINGS, ...parsed });
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
        } finally {
          setIsLoaded(true);
        }
        return;
      }

      setUseSupabase(true);

      // Load settings from Supabase
      try {
        const userId = session.user.id;
        const { data: dbSettings, error } = await supabase
          .from('settings')
          .select('theme, font_size, font_style, dark_mode')
          .eq('user_id', userId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading settings from Supabase:', error);
        }

        if (dbSettings) {
          setSettings({ 
            ...DEFAULT_SETTINGS, 
            theme: dbSettings.theme as ThemePalette,
            fontSize: dbSettings.font_size as FontSize,
            fontStyle: dbSettings.font_style as FontStyle,
            darkMode: dbSettings.dark_mode as 'light' | 'dark' | 'auto',
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to Supabase or localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    const saveSettings = async () => {
      if (useSupabase) {
        // Verify user is still authenticated before saving
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          // Not authenticated, save to localStorage instead
          try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
          } catch (error) {
            console.error('Failed to save settings:', error);
          }
          return;
        }

        try {
          const userId = session.user.id;
          const { error } = await supabase
            .from('settings')
            .upsert({
              user_id: userId,
              theme: settings.theme,
              font_size: settings.fontSize,
              font_style: settings.fontStyle,
              dark_mode: settings.darkMode,
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            });

          if (error) {
            console.error('Error saving settings to Supabase:', error);
          }
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      } else {
        // Fallback to localStorage
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
          console.error('Failed to save settings:', error);
        }
      }
    };

    saveSettings();
  }, [settings, isLoaded, useSupabase]);

  // Apply settings to document
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // Apply font size
    const fontSizeConfig: Record<FontSize, string> = {
      xs: '0.875rem',
      sm: '0.9375rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.375rem',
    };
    root.style.fontSize = fontSizeConfig[settings.fontSize];

    // Apply font family
    body.style.fontFamily = FONT_STYLE_CONFIG[settings.fontStyle].family;

    // Determine if dark mode should be active
    let isDark = false;
    if (settings.darkMode === 'dark') {
      isDark = true;
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.darkMode === 'light') {
      isDark = false;
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // Auto mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDark = prefersDark;
      root.classList.remove('dark', 'light');
      if (prefersDark) {
        root.classList.add('dark');
      }
    }

    // Apply theme colors
    applyThemeColors(settings.theme, isDark);

    // Listen for system theme changes in auto mode
    if (settings.darkMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newIsDark = e.matches;
        root.classList.remove('dark', 'light');
        if (newIsDark) {
          root.classList.add('dark');
        }
        applyThemeColors(settings.theme, newIsDark);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings, isLoaded]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const setTheme = useCallback((theme: ThemePalette) => {
    updateSettings({ theme });
  }, [updateSettings]);

  const setFontSize = useCallback((fontSize: FontSize) => {
    updateSettings({ fontSize });
  }, [updateSettings]);

  const setFontStyle = useCallback((fontStyle: FontStyle) => {
    updateSettings({ fontStyle });
  }, [updateSettings]);

  const setDarkMode = useCallback((darkMode: 'light' | 'dark' | 'auto') => {
    updateSettings({ darkMode });
  }, [updateSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    isLoaded,
    updateSettings,
    setTheme,
    setFontSize,
    setFontStyle,
    setDarkMode,
    resetSettings,
  };
}

export { SettingsContext, useSettingsInternal };

