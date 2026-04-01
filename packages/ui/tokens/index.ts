import { animation } from "./animation";
import { colors } from "./colors";
import { componentSizes, radius } from "./sizes";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const tokens = {
  animation,
  colors,
  componentSizes,
  radius,
  spacing,
  typography,
} as const;

export { animation, colors, componentSizes, radius, spacing, typography };
