import type { ComponentProps } from "react";
import { TextInput } from "react-native";

import { colors, radius, spacing, typography } from "../theme/tokens";

type Props = Omit<ComponentProps<typeof TextInput>, "placeholderTextColor" | "style">;

export default function Input(props: Props) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.placeholder}
      style={{
        alignSelf: "stretch",
        backgroundColor: colors.inputBackground,
        borderColor: colors.border,
        borderRadius: radius.medium,
        borderWidth: 1,
        color: props.editable === false ? colors.textSecondary : colors.textPrimary,
        fontFamily: typography.family.body,
        fontSize: typography.size.body,
        lineHeight: typography.lineHeight.body,
        minHeight: spacing.xxl,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        textAlignVertical: props.multiline ? "top" : "center",
      }}
    />
  );
}
