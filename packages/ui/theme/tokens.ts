export const tokens = {
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
  typography: {
    family: {
      body: "System",
    },
    size: {
      label: 14,
      body: 16,
      button: 16,
      title: 24,
      display: 32,
    },
    weight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      label: 20,
      body: 24,
      button: 24,
      title: 32,
      display: 40,
    },
  },
  colors: {
    background: "#f4f7fb",
    surface: "#ffffff",
    surfaceMuted: "#e9eef5",
    border: "#cfd7e3",
    textPrimary: "#162033",
    textSecondary: "#5b667a",
    text: "#162033",
    muted: "#5b667a",
    primary: "#2457c5",
    primaryPressed: "#1d469c",
    onPrimary: "#ffffff",
    inputBackground: "#ffffff",
    placeholder: "#7b879a",
    disabled: "#aab4c3",
    error: "#b42318",
    success: "#027a48",
  },
  radius: {
    small: 8,
    medium: 16,
    large: 24,
    sm: 8,
    md: 16,
    lg: 24,
  },
} as const;

export const spacing = tokens.spacing;
export const typography = tokens.typography;
export const colors = tokens.colors;
export const radius = tokens.radius;
