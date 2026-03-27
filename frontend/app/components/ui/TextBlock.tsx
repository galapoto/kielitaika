import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function TextBlock({ children }: Props) {
  return (
    <div
      style={{
        lineHeight: 1.7,
        fontSize: 16,
        color: "var(--text)",
        wordBreak: "break-word",
      }}
    >
      {children}
    </div>
  );
}
