export const spacingValues = [4, 8, 16, 24, 32, 40, 48] as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;
