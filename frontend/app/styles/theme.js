import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';

const radius = {
  s: 8,
  m: 14,
  l: 22,
  xl: 32,
};

export const lightTheme = {
  colors: {
    ...colors,
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    border: '#E2E8F0',
  },
  typography,
  spacing,
  shadows,
  radius,
  gradients: {
    hero: ['#0D1B2A', '#1D2D44', '#274060'],
    mintAura: ['#4EC5FF', '#65F7D7'],
  },
};

export const darkTheme = {
  colors: {
    ...colors,
    background: '#0B1220',
    surface: '#0F172A',
    text: '#E2E8F0',
    textSecondary: '#94A3B8',
    border: '#1E293B',
  },
  typography,
  spacing,
  shadows,
  radius,
  gradients: {
    hero: ['#040A11', '#0D1B2A', '#17233A'],
    mintAura: ['#2FBFFF', '#4EC5FF'],
  },
};

export const theme = {
  light: lightTheme,
  dark: darkTheme,
};

export const getTheme = (mode = 'light') => (mode === 'dark' ? darkTheme : lightTheme);
