// ============================================================================
// THEME SYSTEM - PUHIS 2026 Edition
// ============================================================================

import { colors, lightColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { gradients } from './gradients';

export const darkTheme = {
  colors,
  typography,
  spacing,
  shadows,
  gradients,
  mode: 'dark',
};

export const lightTheme = {
  colors: lightColors,
  typography,
  spacing,
  shadows,
  gradients,
  mode: 'light',
};

// Default theme
export const theme = darkTheme;


