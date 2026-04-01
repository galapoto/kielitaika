import type { ReactNode } from "react";
import { Text as RNText } from "react-native";

import { colors, typography } from "../tokens";

type Variant = "body" | "bodyStrong" | "button" | "caption" | "title";
type Tone = "default" | "error" | "inverse" | "muted" | "primary" | "success";

type Props = {
  align?: "auto" | "center" | "left" | "right";
  children: ReactNode;
  tone?: Tone;
  variant?: Variant;
};

const variantStyles = {
  body: typography.roles.body,
  bodyStrong: typography.roles.bodyStrong,
  button: typography.roles.button,
  caption: typography.roles.label,
  title: typography.roles.title,
} as const;

const toneStyles = {
  default: colors.textPrimary,
  muted: colors.textSecondary,
  primary: colors.neutral,
  inverse: colors.onNeutral,
  error: colors.wrong,
  success: colors.correct,
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
        fontFamily: typography.family.sans,
        textAlign: align,
        ...variantStyles[variant],
      }}
    >
      {children}
    </RNText>
  );
}
