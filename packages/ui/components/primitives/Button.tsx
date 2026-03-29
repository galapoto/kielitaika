import { Pressable, StyleSheet, Text as RNText } from "react-native";

import { colors, radius, spacing } from "../../theme/tokens";

type Props = {
  label: string;
  onPress: () => void;
};

export default function Button({ label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <RNText style={styles.text}>{label}</RNText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  text: {
    color: colors.text,
    fontWeight: "600",
  },
});
