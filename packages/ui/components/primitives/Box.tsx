import type { PropsWithChildren } from "react";
import type { FlexAlignType, StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type SpacingKey = keyof typeof spacing;
type BackgroundTone = "transparent" | "surface" | "surfaceMuted" | "background";
type BorderTone = "none" | "default";

type Props = PropsWithChildren<{
  padding?: SpacingKey;
  paddingHorizontal?: SpacingKey;
  paddingVertical?: SpacingKey;
  gap?: SpacingKey;
  background?: BackgroundTone;
  border?: BorderTone;
  radius?: SpacingKey;
  flex?: number;
  direction?: ViewStyle["flexDirection"];
  alignItems?: FlexAlignType;
  justifyContent?: ViewStyle["justifyContent"];
  style?: StyleProp<ViewStyle>;
}>;

const backgroundStyles = StyleSheet.create({
  transparent: {
    backgroundColor: "transparent",
  },
  surface: {
    backgroundColor: colors.surface,
  },
  surfaceMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  background: {
    backgroundColor: colors.background,
  },
});

const borderStyles = StyleSheet.create({
  none: {
    borderWidth: 0,
  },
  default: {
    borderColor: colors.border,
    borderWidth: 1,
  },
});

export default function Box({
  children,
  padding,
  paddingHorizontal,
  paddingVertical,
  gap,
  background = "transparent",
  border = "none",
  radius,
  flex,
  direction,
  alignItems,
  justifyContent,
  style,
}: Props) {
  return (
    <View
      style={[
        backgroundStyles[background],
        borderStyles[border],
        {
          alignItems,
          borderRadius: radius ? spacing[radius] : undefined,
          flex,
          flexDirection: direction,
          gap: gap ? spacing[gap] : undefined,
          justifyContent,
          padding: padding ? spacing[padding] : undefined,
          paddingHorizontal: paddingHorizontal ? spacing[paddingHorizontal] : undefined,
          paddingVertical: paddingVertical ? spacing[paddingVertical] : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
