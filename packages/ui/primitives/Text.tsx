import type { ReactNode } from "react";
import { Text as RNText } from "react-native";

import { colors, typography } from "../theme/tokens";

type Variant = "body" | "bodyStrong" | "button" | "caption" | "title";
type Tone = "default" | "error" | "inverse" | "muted" | "primary" | "success";

type Props = {
  align?: "auto" | "center" | "left" | "right";
  children: ReactNode;
  tone?: Tone;
  variant?: Variant;
};

const variantStyles = {
  body: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.regular,
    lineHeight: typography.lineHeight.body,
  },
  bodyStrong: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.body,
  },
  button: {
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.button,
  },
  caption: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.label,
  },
  title: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.title,
  },
} as const;

const toneStyles = {
  default: colors.textPrimary,
  muted: colors.textSecondary,
  primary: colors.primary,
  inverse: colors.onPrimary,
  error: colors.error,
  success: colors.success,
} as const;

export default function Text({
  align = "left",
  children,
  tone = "default",
  variant = "body",
}: Props) {
  return (
    <RNText
      style={{
        color: toneStyles[tone],
        fontFamily: typography.family.body,
        textAlign: align,
        ...variantStyles[variant],
      }}
    >
      {children}
    </RNText>
  );
}
