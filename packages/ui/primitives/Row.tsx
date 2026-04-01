import type { PropsWithChildren } from "react";
import type { FlexAlignType, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { spacing } from "../tokens";

type SpaceKey = keyof typeof spacing;

type Props = PropsWithChildren<{
  align?: FlexAlignType;
  gap?: SpaceKey;
  justify?: ViewStyle["justifyContent"];
  wrap?: boolean;
}>;

export default function Row({
  align,
  children,
  gap,
  justify,
  wrap = false,
}: Props) {
  return (
    <View
      style={[
        styles.base,
        align ? alignStyles[align] : null,
        gap ? gapStyles[gap] : null,
        justify ? justifyStyles[justify] : null,
        wrap ? styles.wrap : null,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "stretch",
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  wrap: {
    flexWrap: "wrap",
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

const gapStyles = StyleSheet.create(
  Object.fromEntries(
    Object.entries(spacing).map(([key, value]) => [key, { gap: value }]),
  ) as Record<SpaceKey, ViewStyle>,
);
