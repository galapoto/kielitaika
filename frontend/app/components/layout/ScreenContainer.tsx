import type { ReactNode } from "react";

import { layout } from "../../theme/tokens";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function ScreenContainer({ children, className }: Props) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        minHeight: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 12px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: `${layout.maxContentWidth}px`,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
