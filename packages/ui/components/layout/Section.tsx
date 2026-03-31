import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import Box from "../primitives/Box";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export default function Section({ children, style }: Props) {
  return (
    <Box
      background="surface"
      border="default"
      gap="sm"
      padding="md"
      radius="md"
      style={style}
    >
      {children}
    </Box>
  );
}
