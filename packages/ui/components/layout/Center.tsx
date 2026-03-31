import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";

import Box from "../primitives/Box";

type Props = PropsWithChildren;

export default function Center({ children }: Props) {
  return (
    <Box alignItems="center" flex={1} justifyContent="center" style={styles.center}>
      {children}
    </Box>
  );
}

const styles = StyleSheet.create({
  center: {
    width: "100%",
  },
});
