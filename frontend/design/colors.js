// ============================================================================
// PREMIUM COLOR PALETTE - PUHIS 2026 Edition
// ============================================================================

export const colors = {
  // Primary Palette - Midnight & Royal
  primary: {
    midnight: '#0A0E27',
    midnightDark: '#050813',
    midnightLight: '#151B38',
    royal: '#1B4EDA',
    royalDark: '#0F3A9E',
    royalLight: '#3A6EE8',
  },

  // Accent Colors - Mint & Cyan
  accent: {
    mint: '#00E5B0',
    mintDark: '#00B894',
    mintLight: '#33FFD6',
    cyan: '#00D4FF',
    cyanDark: '#00A8CC',
    cyanLight: '#33E0FF',
  },

  // Glass Colors (with opacity)
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(10, 14, 39, 0.3)',
    blur: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.2)',
  },

  // Semantic Colors
  success: '#00E5B0',
  warning: '#FFC107',
  error: '#FF5252',
  info: '#00D4FF',

  // Neutral Grays
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    inverse: '#0A0E27',
  },

  // Background Colors
  background: {
    primary: '#0A0E27',
    secondary: '#151B38',
    surface: '#1A1F3A',
    elevated: '#23284A',
  },
};

// Light mode overrides (if needed)
export const lightColors = {
  ...colors,
  text: {
    primary: '#0A0E27',
    secondary: 'rgba(10, 14, 39, 0.7)',
    tertiary: 'rgba(10, 14, 39, 0.5)',
    inverse: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    surface: '#FAFAFA',
    elevated: '#FFFFFF',
  },
};


