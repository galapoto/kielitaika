import type { PropsWithChildren } from "react";

import Card from "../../primitives/Card";

type Props = PropsWithChildren;

export default function Section({ children }: Props) {
  return <Card>{children}</Card>;
}
