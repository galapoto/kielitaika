import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  condition: boolean;
  fallback?: ReactNode;
};

export default function RuntimeGuard({ children, condition, fallback = null }: Props) {
  if (!condition) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
