import type { PropsWithChildren } from "react";
import type { FlexAlignType, ViewStyle } from "react-native";
import { View } from "react-native";

import { colors, spacing } from "../theme/tokens";

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
      style={{
        alignItems: align,
        alignSelf: "stretch",
        backgroundColor: background === "transparent" ? "transparent" : colors[background],
        flex: fill ? 1 : undefined,
        gap: gap ? spacing[gap] : undefined,
        justifyContent: justify,
        padding: padding ? spacing[padding] : undefined,
        paddingHorizontal: paddingHorizontal ? spacing[paddingHorizontal] : undefined,
        paddingVertical: paddingVertical ? spacing[paddingVertical] : undefined,
      }}
    >
      {children}
    </View>
  );
}
