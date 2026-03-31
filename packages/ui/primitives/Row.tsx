import type { PropsWithChildren } from "react";
import type { FlexAlignType, ViewStyle } from "react-native";
import { View } from "react-native";

import { spacing } from "../theme/tokens";

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
      style={{
        alignItems: align,
        alignSelf: "stretch",
        flexDirection: "row",
        flexWrap: wrap ? "wrap" : "nowrap",
        gap: gap ? spacing[gap] : undefined,
        justifyContent: justify,
      }}
    >
      {children}
    </View>
  );
}
