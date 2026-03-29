import type { ReactNode } from "react";
import { StyleSheet, Text as RNText } from "react-native";

import { colors, typography } from "../../theme/tokens";

type Props = {
  children: ReactNode;
  size?: keyof typeof typography.size;
};

export default function Text({ children, size = "md" }: Props) {
  return <RNText style={[styles.text, styles[size]]}>{children}</RNText>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.text,
  },
  sm: { fontSize: typography.size.sm },
  md: { fontSize: typography.size.md },
  lg: { fontSize: typography.size.lg },
  xl: { fontSize: typography.size.xl },
});
