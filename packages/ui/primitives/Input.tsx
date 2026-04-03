import type { ComponentProps } from "react";
import { StyleSheet, TextInput } from "react-native";

import { colors, componentSizes, radius, typography } from "../tokens";

type Props = Omit<ComponentProps<typeof TextInput>, "placeholderTextColor" | "style"> & {
  testID?: string;
};

export default function Input(props: Props) {
  const editableState = props.editable === false ? "readOnly" : "editable";
  const size = props.multiline ? "multiline" : "singleLine";

  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.placeholder}
      style={[
        styles.base,
        stateStyles[editableState],
        sizeStyles[size],
        props.multiline ? styles.multiline : styles.singleLine,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "stretch",
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    fontFamily: typography.family.sans,
    ...typography.roles.body,
  },
  multiline: {
    textAlignVertical: "top",
  },
  singleLine: {
    textAlignVertical: "center",
  },
});

const stateStyles = StyleSheet.create({
  editable: {
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
  },
  readOnly: {
    backgroundColor: colors.surfaceMuted,
    color: colors.textSecondary,
  },
});

const sizeStyles = StyleSheet.create({
  multiline: {
    height: componentSizes.input.multiline.height,
    paddingHorizontal: componentSizes.input.multiline.paddingHorizontal,
    paddingVertical: componentSizes.input.multiline.paddingVertical,
    width: componentSizes.input.multiline.width,
  },
  singleLine: {
    height: componentSizes.input.singleLine.height,
    paddingHorizontal: componentSizes.input.singleLine.paddingHorizontal,
    paddingVertical: componentSizes.input.singleLine.paddingVertical,
    width: componentSizes.input.singleLine.width,
  },
});
