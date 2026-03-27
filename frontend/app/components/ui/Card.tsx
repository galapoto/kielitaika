import type { ReactNode } from "react";

import { radius, spacing } from "../../theme/tokens";

type Props = {
  children: ReactNode;
};

export default function Card({ children }: Props) {
  return (
    <div
      style={{
        width: "100%",
        padding: spacing.lg,
        borderRadius: radius.lg,
        border: "1px solid rgba(148, 163, 184, 0.12)",
        background: "rgba(8, 14, 28, 0.78)",
        boxShadow: "0 18px 42px rgba(2, 6, 23, 0.22)",
      }}
    >
      {children}
    </div>
  );
}
