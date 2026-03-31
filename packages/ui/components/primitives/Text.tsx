import type { ReactNode } from "react";
import { StyleSheet, Text as RNText } from "react-native";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

type Props = {
  children: ReactNode;
  variant?: "label" | "body" | "button" | "title";
  tone?: "primary" | "secondary" | "inverse";
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeToVariant = {
  sm: "label",
  md: "body",
  lg: "title",
  xl: "title",
} as const;

export default function Text({
  children,
  variant = "body",
  tone = "primary",
  size,
}: Props) {
  const resolvedVariant = size ? sizeToVariant[size] : variant;

  return <RNText style={[styles.base, styles[tone], styles[resolvedVariant]]}>{children}</RNText>;
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
    fontFamily: typography.family.body,
    width: "100%",
  },
  primary: {
    color: colors.textPrimary,
  },
  secondary: {
    color: colors.textSecondary,
  },
  inverse: {
    color: colors.accentText,
    textAlign: "center",
  },
  label: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.label,
  },
  body: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.regular,
    lineHeight: typography.lineHeight.body,
  },
  button: {
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.button,
  },
  title: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.title,
  },
});
