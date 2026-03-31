import { Pressable, View } from "react-native";

import { colors, radius, spacing } from "../theme/tokens";
import Text from "./Text";

type Props = {
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  tone?: "primary" | "surface";
};

export default function Button({
  disabled = false,
  label,
  onPress,
  tone = "primary",
}: Props) {
  return (
    <Pressable disabled={disabled} onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            alignItems: "center",
            alignSelf: "stretch",
            backgroundColor:
              tone === "surface"
                ? colors.surfaceMuted
                : disabled
                  ? colors.disabled
                  : pressed
                    ? colors.primaryPressed
                    : colors.primary,
            borderColor: tone === "surface" ? colors.border : "transparent",
            borderRadius: radius.medium,
            borderWidth: tone === "surface" ? 1 : 0,
            justifyContent: "center",
            minHeight: spacing.xxl,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
          }}
        >
          <Text
            align="center"
            tone={tone === "surface" ? "default" : "inverse"}
            variant="button"
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
