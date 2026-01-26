import { colors as palette } from './colors';

// Ensure palette is defined
const safePalette = palette || {};

export const designTokens = {
  palette: safePalette,

  // Back-compat for older UI components under `frontend/components/*`
  // Prefer `designTokens.typography.*` for new code.
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  fontSize: {
    small: 14,
    medium: 16,
    large: 20,
  },
  // Legacy components compute `lineHeight * fontSize`
  lineHeight: 1.5,

  textColor: {
    primary: safePalette.textPrimary || '#F8F9FA',
    secondary: safePalette.textSecondary || 'rgba(248,249,250,0.8)',
    muted: safePalette.textMuted || 'rgba(248,249,250,0.6)',
    accent: safePalette.accentSecondary || '#1B4EDA',
    placeholder: safePalette.neutralLight || '#CBD5F5',
  },

  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    displayFont: '"Space Grotesk", "Inter", sans-serif',
    scale: {
      hero: { size: 32, lineHeight: 40, weight: '700' },
      h2: { size: 24, lineHeight: 32, weight: '600' },
      h3: { size: 20, lineHeight: 28, weight: '600' },
      h4: { size: 18, lineHeight: 24, weight: '600' },
      cardTitle: { size: 18, lineHeight: 26, weight: '600' },
      body: { size: 16, lineHeight: 24, weight: '400' },
      small: { size: 14, lineHeight: 20, weight: '400' },
      caption: { size: 12, lineHeight: 16, weight: '400' },
      label: { size: 12, lineHeight: 16, weight: '500' },
    },
    letterSpacing: {
      tight: -0.02,
      normal: 0,
      wide: 0.02,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },

  card: {
    elevation: 12,
    border: 1,
    shadowColor: 'rgba(0,0,0,0.25)',
    glow: safePalette.accentPrimary || '#4ECDC4',
    radius: 16,
    padding: 20,
  },

  button: {
    primary: {
      background: ['#4ECDC4', '#2E9E96'],
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 28,
      shadow: '0 6px 14px rgba(78,205,196,0.35)',
      textColor: '#FFFFFF',
    },
    secondary: {
      border: `2px solid ${safePalette.accentSecondary || '#1B4EDA'}`,
      background: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)'],
      textColor: safePalette.accentSecondary || '#1B4EDA',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    tertiary: {
      background: ['transparent', 'transparent'],
      textColor: safePalette.accentSecondary || '#1B4EDA',
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    accent: {
      background: [safePalette.accentSecondary || '#1B4EDA', '#0F3A9E'],
      textColor: '#FFFFFF',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      shadow: '0 4px 10px rgba(27,78,218,0.4)',
    },
    destructive: {
      background: [safePalette.accentError || '#C92A2A', '#8B1C1C'],
      textColor: '#FFFFFF',
    },
    locked: {
      background: ['#2f2f33', '#1c1c1f'],
      textColor: '#9FA3B1',
    },
  },

  icon: {
    size: {
      small: 16,
      medium: 24,
      large: 32,
      xl: 48,
    },
    strokeWidth: 2,
  },

  animation: {
    buttonPress: 100,
    hover: 200,
    progress: 800,
  },
};

export const spacing = designTokens.spacing;
export const typography = designTokens.typography;
export const borderRadius = designTokens.borderRadius;
export const card = designTokens.card;
export const colors = designTokens.palette;
