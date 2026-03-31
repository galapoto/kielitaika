import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";

import { colors, spacing } from "../theme/tokens";

type Props = PropsWithChildren<{
  center?: boolean;
  scroll?: boolean;
}>;

export default function ScreenContainer({
  center = false,
  children,
  scroll = true,
}: Props) {
  if (!scroll) {
    return (
      <View
        style={{
          backgroundColor: colors.background,
          flex: 1,
          justifyContent: center ? "center" : undefined,
          padding: spacing.sm,
        }}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: center ? "center" : undefined,
        padding: spacing.sm,
      }}
      style={{
        backgroundColor: colors.background,
        flex: 1,
      }}
    >
      {children}
    </ScrollView>
  );
}
