import type { ReactNode } from "react";

import { spacing } from "../../theme/tokens";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function ContentWrapper({ children, className }: Props) {
  return (
    <div
      className={className}
      style={{
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: spacing.lg,
        padding: spacing.lg,
      }}
    >
      {children}
    </div>
  );
}
