import type { PropsWithChildren } from "react";

import Stack from "../../primitives/Stack";

type Props = PropsWithChildren;

export default function Center({ children }: Props) {
  return (
    <Stack align="center" fill justify="center">
      {children}
    </Stack>
  );
}
