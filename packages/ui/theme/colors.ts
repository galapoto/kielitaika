import { tokens } from "./tokens";

export const colors = {
  ...tokens.colors,
  accent: tokens.colors.primary,
  accentPressed: tokens.colors.primaryPressed,
  accentText: tokens.colors.onPrimary,
} as const;
