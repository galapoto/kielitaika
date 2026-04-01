import { Pressable, StyleSheet } from "react-native";

import { colors, componentSizes, radius } from "../tokens";
import Text from "./Text";

type Props = {
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  state?: "default" | "loading" | "locked";
  tone?: "primary" | "surface";
};

export default function Button({
  disabled = false,
  label,
  onPress,
  state = "default",
  tone = "primary",
}: Props) {
  const resolvedState = disabled
    ? "disabled"
    : state === "loading"
      ? "loading"
      : state === "locked"
        ? "locked"
        : "default";

  const palette = toneStyles[tone];

  return (
    <Pressable
      disabled={disabled || state === "loading" || state === "locked"}
      onPress={onPress}
      style={(state) => {
        const pressedStyle =
          resolvedState === "default" && state.pressed ? palette.pressed : null;

        return [styles.base, palette[resolvedState], pressedStyle];
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

const toneStyles = {
  primary: StyleSheet.create({
    default: {
      backgroundColor: colors.neutral,
      borderColor: "transparent",
      borderWidth: 0,
    },
    disabled: {
      backgroundColor: colors.disabled,
      borderColor: "transparent",
      borderWidth: 0,
      opacity: 0.92,
    },
    loading: {
      backgroundColor: colors.loading,
      borderColor: "transparent",
      borderWidth: 0,
    },
    locked: {
      backgroundColor: colors.locked,
      borderColor: "transparent",
      borderWidth: 0,
    },
    pressed: {
      backgroundColor: colors.hover,
    },
  }),
  surface: StyleSheet.create({
    default: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderWidth: 1,
    },
    disabled: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderWidth: 1,
      opacity: 0.8,
    },
    loading: {
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.infoBorder,
      borderWidth: 1,
    },
    locked: {
      backgroundColor: colors.surface,
      borderColor: colors.borderStrong,
      borderWidth: 1,
    },
    pressed: {
      backgroundColor: colors.surface,
      borderColor: colors.hover,
    },
  }),
} as const;
