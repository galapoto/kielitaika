import type { PropsWithChildren } from "react";
import { View } from "react-native";

import { colors, radius, spacing } from "../theme/tokens";

type Props = PropsWithChildren<{
  tone?: "surface" | "surfaceMuted";
}>;

export default function Card({ children, tone = "surface" }: Props) {
  return (
    <View
      style={{
        alignSelf: "stretch",
        backgroundColor: colors[tone],
        borderColor: colors.border,
        borderRadius: radius.medium,
        borderWidth: 1,
        gap: spacing.xs,
        padding: spacing.sm,
      }}
    >
      {children}
    </View>
  );
}
