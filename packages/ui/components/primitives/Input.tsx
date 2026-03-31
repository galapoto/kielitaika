import type { ComponentProps } from "react";
import { StyleSheet, TextInput } from "react-native";

import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type Props = Omit<ComponentProps<typeof TextInput>, "style" | "placeholderTextColor">;

export default function Input(props: Props) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.placeholder}
      style={[styles.input, !props.editable ? styles.disabled : null]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: typography.family.body,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    minHeight: spacing.xl + spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: "100%",
  },
  disabled: {
    color: colors.textSecondary,
  },
});
