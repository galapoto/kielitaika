import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";

import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import Box from "../primitives/Box";

type Props = PropsWithChildren;

export default function Screen({ children }: Props) {
  return (
    <Box background="background" flex={1} padding="md" style={styles.container}>
      {children}
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
});
