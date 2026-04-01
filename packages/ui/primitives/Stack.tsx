import type { PropsWithChildren } from "react";
import type { FlexAlignType, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { colors, spacing } from "../tokens";

type SpaceKey = keyof typeof spacing;

type Props = PropsWithChildren<{
  align?: FlexAlignType;
  background?: "background" | "surface" | "surfaceMuted" | "transparent";
  fill?: boolean;
  gap?: SpaceKey;
  justify?: ViewStyle["justifyContent"];
  padding?: SpaceKey;
  paddingHorizontal?: SpaceKey;
  paddingVertical?: SpaceKey;
}>;

export default function Stack({
  align,
  background = "transparent",
  children,
  fill = false,
  gap,
  justify,
  padding,
  paddingHorizontal,
  paddingVertical,
}: Props) {
  return (
    <View
      style={[
        styles.base,
        align ? alignStyles[align] : null,
        backgroundStyles[background],
        fill ? styles.fill : null,
        gap ? gapStyles[gap] : null,
        justify ? justifyStyles[justify] : null,
        padding ? paddingStyles[padding] : null,
        paddingHorizontal ? paddingHorizontalStyles[paddingHorizontal] : null,
        paddingVertical ? paddingVerticalStyles[paddingVertical] : null,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "stretch",
  },
  fill: {
    flex: 1,
  },
});

const alignStyles = StyleSheet.create({
  baseline: {
    alignItems: "baseline",
  },
  center: {
    alignItems: "center",
  },
  "flex-end": {
    alignItems: "flex-end",
  },
  "flex-start": {
    alignItems: "flex-start",
  },
  stretch: {
    alignItems: "stretch",
  },
});

const justifyStyles = StyleSheet.create({
  center: {
    justifyContent: "center",
  },
  "flex-end": {
    justifyContent: "flex-end",
  },
  "flex-start": {
    justifyContent: "flex-start",
  },
  "space-around": {
    justifyContent: "space-around",
  },
  "space-between": {
    justifyContent: "space-between",
  },
  "space-evenly": {
    justifyContent: "space-evenly",
  },
});

const backgroundStyles = StyleSheet.create({
  background: {
    backgroundColor: colors.background,
  },
  surface: {
    backgroundColor: colors.surface,
  },
  surfaceMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  transparent: {
    backgroundColor: "transparent",
  },
});

const gapStyles = StyleSheet.create(
  Object.fromEntries(
    Object.entries(spacing).map(([key, value]) => [key, { gap: value }]),
  ) as Record<SpaceKey, ViewStyle>,
);

const paddingStyles = StyleSheet.create(
  Object.fromEntries(
    Object.entries(spacing).map(([key, value]) => [key, { padding: value }]),
  ) as Record<SpaceKey, ViewStyle>,
);

const paddingHorizontalStyles = StyleSheet.create(
  Object.fromEntries(
    Object.entries(spacing).map(([key, value]) => [key, { paddingHorizontal: value }]),
  ) as Record<SpaceKey, ViewStyle>,
);

const paddingVerticalStyles = StyleSheet.create(
  Object.fromEntries(
    Object.entries(spacing).map(([key, value]) => [key, { paddingVertical: value }]),
  ) as Record<SpaceKey, ViewStyle>,
);
