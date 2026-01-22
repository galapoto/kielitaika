import { colors as palette } from './colors';

// Ensure palette is defined, use empty object as fallback
const safePalette = palette || {};

export const PREMIUM_BROWN = {
  darkest: '#07090E',
  dark: safePalette.backgroundPrimary || '#0A1F2E',
  medium: safePalette.backgroundSecondary || '#2D2418',
  light: safePalette.backgroundTertiary || '#F8F9FA',
  white: safePalette.textPrimary || '#F8F9FA',
  accent: safePalette.accentSecondary || '#1B4EDA',
  highlight: 'rgba(255, 255, 255, 0.15)',
  shadow: 'rgba(0, 0, 0, 0.4)',
};

// Final safety check - ensure medium is always a string
// Check PREMIUM_BROWN first to avoid accessing .medium on undefined
if (!PREMIUM_BROWN) {
  console.error('[premiumPalette] PREMIUM_BROWN is undefined! This should not happen.');
} else if (typeof PREMIUM_BROWN.medium !== 'string') {
  PREMIUM_BROWN.medium = '#2D2418';
  console.warn('[premiumPalette] PREMIUM_BROWN.medium was not a string, using fallback');
}
