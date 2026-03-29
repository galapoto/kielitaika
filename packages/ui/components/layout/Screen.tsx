import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors, spacing } from "../../theme/tokens";

type Props = {
  children: ReactNode;
};

export default function Screen({ children }: Props) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
});
