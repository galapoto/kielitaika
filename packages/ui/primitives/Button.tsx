import { Pressable, StyleSheet } from "react-native";

import { colors, componentSizes, radius } from "../tokens";
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
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={(state) => {
        const hovered = Boolean((state as { hovered?: boolean }).hovered);

        return {
          ...styles.base,
          backgroundColor:
            tone === "surface"
              ? hovered || state.pressed
                ? colors.surface
                : colors.surfaceMuted
              : disabled
                ? colors.disabled
                : hovered || state.pressed
                  ? colors.hover
                  : colors.neutral,
          borderColor:
            tone === "surface"
              ? hovered || state.pressed
                ? colors.hover
                : colors.border
              : "transparent",
          borderWidth: tone === "surface" ? 1 : 0,
          opacity: disabled ? 0.9 : 1,
        };
      }}
    >
      <Text
        align="center"
        tone={tone === "surface" ? "default" : "inverse"}
        variant="button"
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: radius.medium,
    height: componentSizes.button.height,
    justifyContent: "center",
    paddingHorizontal: componentSizes.button.paddingHorizontal,
    paddingVertical: componentSizes.button.paddingVertical,
    width: componentSizes.button.width,
  },
});
