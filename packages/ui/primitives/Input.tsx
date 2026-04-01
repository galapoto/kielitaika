import type { ComponentProps } from "react";
import { StyleSheet, TextInput } from "react-native";

import { colors, componentSizes, radius, typography } from "../tokens";

type Props = Omit<ComponentProps<typeof TextInput>, "placeholderTextColor" | "style">;

export default function Input(props: Props) {
  const size = props.multiline ? componentSizes.input.multiline : componentSizes.input.singleLine;

  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.placeholder}
      style={[
        styles.base,
        {
          color: props.editable === false ? colors.textSecondary : colors.textPrimary,
          height: size.height,
          paddingHorizontal: size.paddingHorizontal,
          paddingVertical: size.paddingVertical,
          textAlignVertical: props.multiline ? "top" : "center",
          width: size.width,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "stretch",
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    fontFamily: typography.family.sans,
    ...typography.roles.body,
  },
});
