import { colors as colorTokens } from "./colors";
import { spacing as spacingTokens } from "./spacing";
import { typography as typographyTokens } from "./typography";

export const colors = {
  background: colorTokens.background,
  surface: colorTokens.surface,
  primary: colorTokens.accent,
  text: colorTokens.textPrimary,
  muted: colorTokens.placeholder,
  error: "#b42318",
  border: colorTokens.border,
} as const;

export const spacing = spacingTokens;

export const typography = {
  family: typographyTokens.family,
  weight: typographyTokens.weight,
  size: {
    sm: typographyTokens.size.label,
    md: typographyTokens.size.body,
    lg: typographyTokens.size.title,
    xl: typographyTokens.size.title,
  },
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;
