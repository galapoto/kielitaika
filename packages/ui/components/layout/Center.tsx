import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  children: ReactNode;
};

export default function Center({ children }: Props) {
  return <View style={styles.center}>{children}</View>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
