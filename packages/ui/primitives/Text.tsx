import type { ReactNode } from "react";
import { StyleSheet, Text as RNText } from "react-native";

import { colors, typography } from "../tokens";

type Variant = "body" | "bodyStrong" | "button" | "caption" | "title";
type Tone = "default" | "error" | "inverse" | "muted" | "primary" | "success";

type Props = {
  align?: "auto" | "center" | "left" | "right";
  children: ReactNode;
  tone?: Tone;
  variant?: Variant;
};

export default function Text({
  align = "left",
  children,
  tone = "default",
  variant = "body",
}: Props) {
  return (
    <RNText
      style={[styles.base, variantStyles[variant], toneStyles[tone], alignStyles[align]]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.family.sans,
  },
});

const variantStyles = StyleSheet.create({
  body: typography.roles.body,
  bodyStrong: typography.roles.bodyStrong,
  button: typography.roles.button,
  caption: typography.roles.label,
  title: typography.roles.title,
});

const toneStyles = StyleSheet.create({
  default: {
    color: colors.textPrimary,
  },
  error: {
    color: colors.wrong,
  },
  inverse: {
    color: colors.onNeutral,
  },
  muted: {
    color: colors.textSecondary,
  },
  primary: {
    color: colors.neutral,
  },
  success: {
    color: colors.correct,
  },
});

const alignStyles = StyleSheet.create({
  auto: {
    textAlign: "auto",
  },
  center: {
    textAlign: "center",
  },
  left: {
    textAlign: "left",
  },
  right: {
    textAlign: "right",
  },
});
