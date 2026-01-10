export type ThemePalette =
  | 'default'
  | 'nude-rose'
  | 'nude-beige'
  | 'sage-green'
  | 'lavender'
  | 'warm-sand'
  | 'ocean-blue'
  | 'soft-peach'
  | 'charcoal'
  | 'midnight';

export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export type FontStyle =
  | 'system'
  | 'sans-serif'
  | 'geist-sans'
  | 'inter'
  | 'sf-pro'
  | 'roboto'
  | 'open-sans';

export interface AppSettings {
  theme: ThemePalette;
  fontSize: FontSize;
  fontStyle: FontStyle;
  darkMode: 'light' | 'dark' | 'auto';
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'default',
  fontSize: 'base',
  fontStyle: 'system',
  darkMode: 'auto',
};

export const THEME_PALETTES: Record<
  ThemePalette,
  { name: string; description: string; colors: { light: ThemeColors; dark: ThemeColors } }
> = {
  default: {
    name: 'Default',
    description: 'Classic blue theme',
    colors: {
      light: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.129 0.042 264.695)',
        primary: 'oklch(0.208 0.042 265.755)',
        primaryForeground: 'oklch(0.984 0.003 247.858)',
        secondary: 'oklch(0.968 0.007 247.896)',
        secondaryForeground: 'oklch(0.208 0.042 265.755)',
        muted: 'oklch(0.968 0.007 247.896)',
        mutedForeground: 'oklch(0.554 0.046 257.417)',
        accent: 'oklch(0.968 0.007 247.896)',
        accentForeground: 'oklch(0.208 0.042 265.755)',
        border: 'oklch(0.929 0.013 255.508)',
        input: 'oklch(0.929 0.013 255.508)',
        ring: 'oklch(0.704 0.04 256.788)',
        card: 'oklch(1 0 0)',
        cardForeground: 'oklch(0.129 0.042 264.695)',
      },
      dark: {
        background: 'oklch(0.129 0.042 264.695)',
        foreground: 'oklch(0.984 0.003 247.858)',
        primary: 'oklch(0.929 0.013 255.508)',
        primaryForeground: 'oklch(0.208 0.042 265.755)',
        secondary: 'oklch(0.279 0.041 260.031)',
        secondaryForeground: 'oklch(0.984 0.003 247.858)',
        muted: 'oklch(0.279 0.041 260.031)',
        mutedForeground: 'oklch(0.704 0.04 256.788)',
        accent: 'oklch(0.279 0.041 260.031)',
        accentForeground: 'oklch(0.984 0.003 247.858)',
        border: 'oklch(1 0 0 / 10%)',
        input: 'oklch(1 0 0 / 15%)',
        ring: 'oklch(0.551 0.027 264.364)',
        card: 'oklch(0.208 0.042 265.755)',
        cardForeground: 'oklch(0.984 0.003 247.858)',
      },
    },
  },
  'nude-rose': {
    name: 'Nude Rose',
    description: 'Soft pink and beige tones',
    colors: {
      light: {
        background: 'oklch(0.98 0.008 45)',
        foreground: 'oklch(0.25 0.03 25)',
        primary: 'oklch(0.55 0.08 25)',
        primaryForeground: 'oklch(0.98 0.005 45)',
        secondary: 'oklch(0.92 0.015 45)',
        secondaryForeground: 'oklch(0.35 0.03 25)',
        muted: 'oklch(0.94 0.012 45)',
        mutedForeground: 'oklch(0.45 0.025 30)',
        accent: 'oklch(0.85 0.05 25)',
        accentForeground: 'oklch(0.3 0.03 25)',
        border: 'oklch(0.88 0.01 45)',
        input: 'oklch(0.88 0.01 45)',
        ring: 'oklch(0.6 0.08 25)',
        card: 'oklch(0.99 0.005 50)',
        cardForeground: 'oklch(0.25 0.03 25)',
      },
      dark: {
        background: 'oklch(0.18 0.015 25)',
        foreground: 'oklch(0.92 0.008 45)',
        primary: 'oklch(0.65 0.08 25)',
        primaryForeground: 'oklch(0.15 0.02 20)',
        secondary: 'oklch(0.25 0.02 25)',
        secondaryForeground: 'oklch(0.92 0.008 45)',
        muted: 'oklch(0.22 0.018 25)',
        mutedForeground: 'oklch(0.68 0.02 30)',
        accent: 'oklch(0.28 0.025 25)',
        accentForeground: 'oklch(0.92 0.008 45)',
        border: 'oklch(0.25 0.02 25)',
        input: 'oklch(0.25 0.02 25)',
        ring: 'oklch(0.65 0.08 25)',
        card: 'oklch(0.22 0.018 25)',
        cardForeground: 'oklch(0.92 0.008 45)',
      },
    },
  },
  'nude-beige': {
    name: 'Nude Beige',
    description: 'Warm beige and cream',
    colors: {
      light: {
        background: 'oklch(0.97 0.005 75)',
        foreground: 'oklch(0.28 0.02 65)',
        primary: 'oklch(0.5 0.06 65)',
        primaryForeground: 'oklch(0.98 0.003 75)',
        secondary: 'oklch(0.93 0.01 75)',
        secondaryForeground: 'oklch(0.32 0.02 65)',
        muted: 'oklch(0.95 0.008 75)',
        mutedForeground: 'oklch(0.48 0.018 70)',
        accent: 'oklch(0.82 0.04 65)',
        accentForeground: 'oklch(0.3 0.02 65)',
        border: 'oklch(0.9 0.008 75)',
        input: 'oklch(0.9 0.008 75)',
        ring: 'oklch(0.55 0.06 65)',
        card: 'oklch(0.99 0.003 80)',
        cardForeground: 'oklch(0.28 0.02 65)',
      },
      dark: {
        background: 'oklch(0.2 0.012 65)',
        foreground: 'oklch(0.93 0.005 75)',
        primary: 'oklch(0.62 0.06 65)',
        primaryForeground: 'oklch(0.18 0.015 60)',
        secondary: 'oklch(0.26 0.018 65)',
        secondaryForeground: 'oklch(0.93 0.005 75)',
        muted: 'oklch(0.24 0.015 65)',
        mutedForeground: 'oklch(0.7 0.015 70)',
        accent: 'oklch(0.28 0.02 65)',
        accentForeground: 'oklch(0.93 0.005 75)',
        border: 'oklch(0.26 0.018 65)',
        input: 'oklch(0.26 0.018 65)',
        ring: 'oklch(0.62 0.06 65)',
        card: 'oklch(0.24 0.015 65)',
        cardForeground: 'oklch(0.93 0.005 75)',
      },
    },
  },
  'sage-green': {
    name: 'Sage Green',
    description: 'Calming sage and mint',
    colors: {
      light: {
        background: 'oklch(0.97 0.008 160)',
        foreground: 'oklch(0.22 0.025 160)',
        primary: 'oklch(0.45 0.06 160)',
        primaryForeground: 'oklch(0.98 0.005 160)',
        secondary: 'oklch(0.92 0.012 160)',
        secondaryForeground: 'oklch(0.28 0.025 160)',
        muted: 'oklch(0.94 0.01 160)',
        mutedForeground: 'oklch(0.5 0.02 160)',
        accent: 'oklch(0.8 0.05 160)',
        accentForeground: 'oklch(0.25 0.025 160)',
        border: 'oklch(0.89 0.01 160)',
        input: 'oklch(0.89 0.01 160)',
        ring: 'oklch(0.5 0.06 160)',
        card: 'oklch(0.99 0.005 165)',
        cardForeground: 'oklch(0.22 0.025 160)',
      },
      dark: {
        background: 'oklch(0.16 0.02 160)',
        foreground: 'oklch(0.94 0.008 160)',
        primary: 'oklch(0.58 0.06 160)',
        primaryForeground: 'oklch(0.14 0.018 155)',
        secondary: 'oklch(0.24 0.022 160)',
        secondaryForeground: 'oklch(0.94 0.008 160)',
        muted: 'oklch(0.2 0.02 160)',
        mutedForeground: 'oklch(0.72 0.018 160)',
        accent: 'oklch(0.26 0.025 160)',
        accentForeground: 'oklch(0.94 0.008 160)',
        border: 'oklch(0.24 0.022 160)',
        input: 'oklch(0.24 0.022 160)',
        ring: 'oklch(0.58 0.06 160)',
        card: 'oklch(0.2 0.02 160)',
        cardForeground: 'oklch(0.94 0.008 160)',
      },
    },
  },
  lavender: {
    name: 'Lavender',
    description: 'Soft purple and lilac',
    colors: {
      light: {
        background: 'oklch(0.98 0.01 280)',
        foreground: 'oklch(0.26 0.03 280)',
        primary: 'oklch(0.52 0.08 280)',
        primaryForeground: 'oklch(0.98 0.005 280)',
        secondary: 'oklch(0.93 0.015 280)',
        secondaryForeground: 'oklch(0.3 0.03 280)',
        muted: 'oklch(0.95 0.012 280)',
        mutedForeground: 'oklch(0.52 0.025 280)',
        accent: 'oklch(0.84 0.06 280)',
        accentForeground: 'oklch(0.28 0.03 280)',
        border: 'oklch(0.9 0.012 280)',
        input: 'oklch(0.9 0.012 280)',
        ring: 'oklch(0.57 0.08 280)',
        card: 'oklch(0.99 0.008 285)',
        cardForeground: 'oklch(0.26 0.03 280)',
      },
      dark: {
        background: 'oklch(0.19 0.02 280)',
        foreground: 'oklch(0.93 0.008 280)',
        primary: 'oklch(0.64 0.08 280)',
        primaryForeground: 'oklch(0.17 0.018 275)',
        secondary: 'oklch(0.26 0.025 280)',
        secondaryForeground: 'oklch(0.93 0.008 280)',
        muted: 'oklch(0.22 0.022 280)',
        mutedForeground: 'oklch(0.7 0.02 280)',
        accent: 'oklch(0.28 0.028 280)',
        accentForeground: 'oklch(0.93 0.008 280)',
        border: 'oklch(0.26 0.025 280)',
        input: 'oklch(0.26 0.025 280)',
        ring: 'oklch(0.64 0.08 280)',
        card: 'oklch(0.22 0.022 280)',
        cardForeground: 'oklch(0.93 0.008 280)',
      },
    },
  },
  'warm-sand': {
    name: 'Warm Sand',
    description: 'Cozy sand and terracotta',
    colors: {
      light: {
        background: 'oklch(0.96 0.006 55)',
        foreground: 'oklch(0.3 0.025 50)',
        primary: 'oklch(0.48 0.07 35)',
        primaryForeground: 'oklch(0.98 0.003 60)',
        secondary: 'oklch(0.91 0.012 55)',
        secondaryForeground: 'oklch(0.35 0.025 50)',
        muted: 'oklch(0.94 0.01 55)',
        mutedForeground: 'oklch(0.52 0.02 50)',
        accent: 'oklch(0.78 0.05 40)',
        accentForeground: 'oklch(0.32 0.025 50)',
        border: 'oklch(0.88 0.01 55)',
        input: 'oklch(0.88 0.01 55)',
        ring: 'oklch(0.53 0.07 35)',
        card: 'oklch(0.99 0.004 60)',
        cardForeground: 'oklch(0.3 0.025 50)',
      },
      dark: {
        background: 'oklch(0.21 0.015 50)',
        foreground: 'oklch(0.92 0.006 55)',
        primary: 'oklch(0.6 0.07 35)',
        primaryForeground: 'oklch(0.19 0.018 45)',
        secondary: 'oklch(0.27 0.02 50)',
        secondaryForeground: 'oklch(0.92 0.006 55)',
        muted: 'oklch(0.24 0.018 50)',
        mutedForeground: 'oklch(0.74 0.018 50)',
        accent: 'oklch(0.29 0.022 50)',
        accentForeground: 'oklch(0.92 0.006 55)',
        border: 'oklch(0.27 0.02 50)',
        input: 'oklch(0.27 0.02 50)',
        ring: 'oklch(0.6 0.07 35)',
        card: 'oklch(0.24 0.018 50)',
        cardForeground: 'oklch(0.92 0.006 55)',
      },
    },
  },
  'ocean-blue': {
    name: 'Ocean Blue',
    description: 'Fresh aqua and teal',
    colors: {
      light: {
        background: 'oklch(0.97 0.01 200)',
        foreground: 'oklch(0.24 0.03 200)',
        primary: 'oklch(0.46 0.08 200)',
        primaryForeground: 'oklch(0.98 0.005 200)',
        secondary: 'oklch(0.92 0.014 200)',
        secondaryForeground: 'oklch(0.28 0.03 200)',
        muted: 'oklch(0.94 0.012 200)',
        mutedForeground: 'oklch(0.5 0.022 200)',
        accent: 'oklch(0.82 0.06 200)',
        accentForeground: 'oklch(0.26 0.03 200)',
        border: 'oklch(0.89 0.012 200)',
        input: 'oklch(0.89 0.012 200)',
        ring: 'oklch(0.51 0.08 200)',
        card: 'oklch(0.99 0.008 205)',
        cardForeground: 'oklch(0.24 0.03 200)',
      },
      dark: {
        background: 'oklch(0.17 0.022 200)',
        foreground: 'oklch(0.94 0.008 200)',
        primary: 'oklch(0.59 0.08 200)',
        primaryForeground: 'oklch(0.15 0.02 195)',
        secondary: 'oklch(0.25 0.026 200)',
        secondaryForeground: 'oklch(0.94 0.008 200)',
        muted: 'oklch(0.21 0.024 200)',
        mutedForeground: 'oklch(0.71 0.02 200)',
        accent: 'oklch(0.27 0.028 200)',
        accentForeground: 'oklch(0.94 0.008 200)',
        border: 'oklch(0.25 0.026 200)',
        input: 'oklch(0.25 0.026 200)',
        ring: 'oklch(0.59 0.08 200)',
        card: 'oklch(0.21 0.024 200)',
        cardForeground: 'oklch(0.94 0.008 200)',
      },
    },
  },
  'soft-peach': {
    name: 'Soft Peach',
    description: 'Gentle peach and coral',
    colors: {
      light: {
        background: 'oklch(0.98 0.008 40)',
        foreground: 'oklch(0.27 0.03 30)',
        primary: 'oklch(0.54 0.08 30)',
        primaryForeground: 'oklch(0.98 0.005 40)',
        secondary: 'oklch(0.93 0.014 40)',
        secondaryForeground: 'oklch(0.32 0.03 30)',
        muted: 'oklch(0.95 0.012 40)',
        mutedForeground: 'oklch(0.51 0.025 35)',
        accent: 'oklch(0.86 0.06 35)',
        accentForeground: 'oklch(0.29 0.03 30)',
        border: 'oklch(0.9 0.012 40)',
        input: 'oklch(0.9 0.012 40)',
        ring: 'oklch(0.59 0.08 30)',
        card: 'oklch(0.99 0.006 45)',
        cardForeground: 'oklch(0.27 0.03 30)',
      },
      dark: {
        background: 'oklch(0.19 0.018 30)',
        foreground: 'oklch(0.93 0.008 40)',
        primary: 'oklch(0.63 0.08 30)',
        primaryForeground: 'oklch(0.17 0.02 25)',
        secondary: 'oklch(0.26 0.024 30)',
        secondaryForeground: 'oklch(0.93 0.008 40)',
        muted: 'oklch(0.23 0.02 30)',
        mutedForeground: 'oklch(0.72 0.02 35)',
        accent: 'oklch(0.29 0.026 30)',
        accentForeground: 'oklch(0.93 0.008 40)',
        border: 'oklch(0.26 0.024 30)',
        input: 'oklch(0.26 0.024 30)',
        ring: 'oklch(0.63 0.08 30)',
        card: 'oklch(0.23 0.02 30)',
        cardForeground: 'oklch(0.93 0.008 40)',
      },
    },
  },
  charcoal: {
    name: 'Charcoal',
    description: 'Sophisticated gray tones',
    colors: {
      light: {
        background: 'oklch(0.96 0.002 270)',
        foreground: 'oklch(0.25 0.01 270)',
        primary: 'oklch(0.4 0.02 270)',
        primaryForeground: 'oklch(0.98 0.001 270)',
        secondary: 'oklch(0.91 0.005 270)',
        secondaryForeground: 'oklch(0.3 0.01 270)',
        muted: 'oklch(0.93 0.004 270)',
        mutedForeground: 'oklch(0.48 0.008 270)',
        accent: 'oklch(0.85 0.01 270)',
        accentForeground: 'oklch(0.28 0.01 270)',
        border: 'oklch(0.87 0.004 270)',
        input: 'oklch(0.87 0.004 270)',
        ring: 'oklch(0.45 0.02 270)',
        card: 'oklch(0.99 0.001 275)',
        cardForeground: 'oklch(0.25 0.01 270)',
      },
      dark: {
        background: 'oklch(0.18 0.008 270)',
        foreground: 'oklch(0.92 0.003 270)',
        primary: 'oklch(0.7 0.015 270)',
        primaryForeground: 'oklch(0.16 0.01 265)',
        secondary: 'oklch(0.24 0.012 270)',
        secondaryForeground: 'oklch(0.92 0.003 270)',
        muted: 'oklch(0.21 0.01 270)',
        mutedForeground: 'oklch(0.68 0.008 270)',
        accent: 'oklch(0.26 0.014 270)',
        accentForeground: 'oklch(0.92 0.003 270)',
        border: 'oklch(0.24 0.012 270)',
        input: 'oklch(0.24 0.012 270)',
        ring: 'oklch(0.7 0.015 270)',
        card: 'oklch(0.21 0.01 270)',
        cardForeground: 'oklch(0.92 0.003 270)',
      },
    },
  },
  midnight: {
    name: 'Midnight',
    description: 'Deep navy and indigo',
    colors: {
      light: {
        background: 'oklch(0.97 0.01 250)',
        foreground: 'oklch(0.23 0.035 250)',
        primary: 'oklch(0.42 0.08 250)',
        primaryForeground: 'oklch(0.98 0.005 250)',
        secondary: 'oklch(0.92 0.014 250)',
        secondaryForeground: 'oklch(0.27 0.035 250)',
        muted: 'oklch(0.94 0.012 250)',
        mutedForeground: 'oklch(0.49 0.025 250)',
        accent: 'oklch(0.81 0.06 250)',
        accentForeground: 'oklch(0.25 0.035 250)',
        border: 'oklch(0.89 0.012 250)',
        input: 'oklch(0.89 0.012 250)',
        ring: 'oklch(0.47 0.08 250)',
        card: 'oklch(0.99 0.008 255)',
        cardForeground: 'oklch(0.23 0.035 250)',
      },
      dark: {
        background: 'oklch(0.15 0.025 250)',
        foreground: 'oklch(0.94 0.008 250)',
        primary: 'oklch(0.56 0.08 250)',
        primaryForeground: 'oklch(0.13 0.022 245)',
        secondary: 'oklch(0.23 0.03 250)',
        secondaryForeground: 'oklch(0.94 0.008 250)',
        muted: 'oklch(0.19 0.027 250)',
        mutedForeground: 'oklch(0.69 0.02 250)',
        accent: 'oklch(0.25 0.032 250)',
        accentForeground: 'oklch(0.94 0.008 250)',
        border: 'oklch(0.23 0.03 250)',
        input: 'oklch(0.23 0.03 250)',
        ring: 'oklch(0.56 0.08 250)',
        card: 'oklch(0.19 0.027 250)',
        cardForeground: 'oklch(0.94 0.008 250)',
      },
    },
  },
};

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
  card: string;
  cardForeground: string;
}

export const FONT_SIZE_CONFIG: Record<FontSize, { name: string; multiplier: number }> = {
  xs: { name: 'Extra Small', multiplier: 0.875 },
  sm: { name: 'Small', multiplier: 0.9375 },
  base: { name: 'Medium', multiplier: 1 },
  lg: { name: 'Large', multiplier: 1.125 },
  xl: { name: 'Extra Large', multiplier: 1.25 },
  '2xl': { name: 'XXL', multiplier: 1.375 },
};

export const FONT_STYLE_CONFIG: Record<FontStyle, { name: string; family: string }> = {
  system: { name: 'System Default', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  'sans-serif': { name: 'Sans Serif', family: 'sans-serif' },
  'geist-sans': { name: 'Geist Sans', family: 'var(--font-geist-sans), sans-serif' },
  inter: { name: 'Inter', family: 'var(--font-inter), -apple-system, sans-serif' },
  'sf-pro': { name: 'SF Pro', family: '-apple-system, "SF Pro Display", "SF Pro Text", sans-serif' },
  roboto: { name: 'Roboto', family: 'var(--font-roboto), sans-serif' },
  'open-sans': { name: 'Open Sans', family: 'var(--font-open-sans), sans-serif' },
};

