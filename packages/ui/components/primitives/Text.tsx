import type { ReactNode } from "react";

import PrimitiveText from "../../primitives/Text";

type Props = {
  children: ReactNode;
  variant?: "label" | "body" | "button" | "title";
  tone?: "primary" | "secondary" | "inverse";
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeVariantMap = {
  sm: "caption",
  md: "body",
  lg: "title",
  xl: "title",
} as const;

const toneMap = {
  primary: "default",
  secondary: "muted",
  inverse: "inverse",
} as const;

const variantMap = {
  label: "caption",
  body: "body",
  button: "button",
  title: "title",
} as const;

export default function Text({ children, size, tone = "primary", variant = "body" }: Props) {
  return (
    <PrimitiveText
      tone={toneMap[tone]}
      variant={size ? sizeVariantMap[size] : variantMap[variant]}
    >
      {children}
    </PrimitiveText>
  );
}
