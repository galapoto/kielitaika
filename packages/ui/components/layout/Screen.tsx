import type { PropsWithChildren } from "react";

import ScreenContainer from "../../primitives/ScreenContainer";

type Props = PropsWithChildren;

export default function Screen({ children }: Props) {
  return <ScreenContainer>{children}</ScreenContainer>;
}
