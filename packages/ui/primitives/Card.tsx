import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { colors, componentSizes, radius, spacing } from "../tokens";

type Props = PropsWithChildren<{
  tone?: "info" | "surface" | "surfaceMuted" | "surfaceRaised" | "warning";
}>;

export default function Card({ children, tone = "surface" }: Props) {
  return <View style={[styles.base, toneStyles[tone]]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "stretch",
    borderRadius: radius.medium,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: componentSizes.card.minHeight,
    padding: componentSizes.card.padding,
    width: componentSizes.card.width,
  },
});

const toneStyles = StyleSheet.create({
  info: {
    backgroundColor: colors.infoBackground,
    borderColor: colors.infoBorder,
  },
  surface: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  surfaceMuted: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  surfaceRaised: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.infoBorder,
  },
  warning: {
    backgroundColor: colors.warningBackground,
    borderColor: colors.warningBorder,
  },
});
