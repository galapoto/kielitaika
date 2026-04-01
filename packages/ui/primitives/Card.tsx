import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { colors, componentSizes, radius, spacing } from "../tokens";

type Props = PropsWithChildren<{
  tone?: "surface" | "surfaceMuted";
}>;

export default function Card({ children, tone = "surface" }: Props) {
  return (
    <View style={[styles.base, { backgroundColor: colors[tone] }]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "stretch",
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: componentSizes.card.minHeight,
    padding: componentSizes.card.padding,
    width: componentSizes.card.width,
  },
});
