// ============================================================================
// TYPOGRAPHY SYSTEM - PUHIS 2026 Edition
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'SF Rounded, "SF Pro Rounded", -apple-system, sans-serif',
    mono: 'SF Mono, Menlo, Monaco, monospace',
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 64,
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },

  // Text Styles (predefined combinations)
  styles: {
    h1: {
      fontSize: 48,
      fontWeight: '700',
      lineHeight: 1.2,
      letterSpacing: -0.5,
      fontFamily: 'SF Rounded, "SF Pro Rounded", -apple-system, sans-serif',
    },
    h2: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.2,
      letterSpacing: -0.25,
      fontFamily: 'SF Rounded, "SF Pro Rounded", -apple-system, sans-serif',
    },
    h3: {
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 1.3,
      letterSpacing: -0.25,
    },
    h4: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: 0.1,
    },
    small: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: 0.2,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1,
      letterSpacing: 0.25,
    },
  },
};


