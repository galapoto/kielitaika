✅ UI FOUNDATION AGENT PROMPT (APPROVED VERSION)
AGENT ROLE
You are a UI Foundation Agent.

Your task is to build the core UI system layer.

You are NOT allowed to:

implement feature screens

connect to backend

introduce business logic

create custom styling outside the system

CONTEXT
Project root:

/home/vitus/kielitaika-app
UI package:

/home/vitus/kielitaika-app/packages/ui
Client app:

/home/vitus/kielitaika-app/apps/client
OBJECTIVE
Create a controlled UI foundation layer:

✔ Design tokens
✔ Layout primitives
✔ Core UI primitives
✔ Central export system
✔ Enforced usage rules

HARD RULES
ALL UI must use tokens

NO arbitrary values (no 12, 18, etc.)

NO inline layout styling in final components

Avoid raw React Native components in screens
(allowed temporarily for debugging only)

ALL components must be reusable and typed

Styling must use StyleSheet.create

No business logic inside UI components

STEP 1 — DESIGN TOKENS
CREATE FILE
packages/ui/theme/tokens.ts
IMPLEMENT
export const colors = {
  background: "#0b1c2c",
  surface: "#102a43",
  primary: "#2bb0ed",
  text: "#ffffff",
  muted: "#a0aec0",
  error: "#ff4d4f"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16
};

export const typography = {
  size: {
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24
  }
};
STEP 2 — SCREEN LAYOUT
CREATE FILE
packages/ui/components/layout/Screen.tsx
IMPLEMENT
import { View, StyleSheet } from "react-native";
import { colors, spacing } from "../../theme/tokens";

type Props = {
  children: React.ReactNode;
};

export default function Screen({ children }: Props) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md
  }
});
STEP 3 — CENTER LAYOUT
CREATE FILE
packages/ui/components/layout/Center.tsx
IMPLEMENT
import { View, StyleSheet } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function Center({ children }: Props) {
  return <View style={styles.center}>{children}</View>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
STEP 4 — TEXT PRIMITIVE
CREATE FILE
packages/ui/components/primitives/Text.tsx
IMPLEMENT
import { Text as RNText, StyleSheet } from "react-native";
import { colors, typography } from "../../theme/tokens";

type Props = {
  children: React.ReactNode;
  size?: keyof typeof typography.size;
};

export default function Text({ children, size = "md" }: Props) {
  return <RNText style={[styles.text, styles[size]]}>{children}</RNText>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.text
  },
  sm: { fontSize: typography.size.sm },
  md: { fontSize: typography.size.md },
  lg: { fontSize: typography.size.lg },
  xl: { fontSize: typography.size.xl }
});
STEP 5 — BUTTON PRIMITIVE
CREATE FILE
packages/ui/components/primitives/Button.tsx
IMPLEMENT
import { Pressable, Text as RNText, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../theme/tokens";

type Props = {
  label: string;
  onPress: () => void;
};

export default function Button({ label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <RNText style={styles.text}>{label}</RNText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center"
  },
  text: {
    color: colors.text,
    fontWeight: "600"
  }
});
STEP 6 — EXPORT INDEX
CREATE FILE
packages/ui/components/index.ts
IMPLEMENT
export { default as Screen } from "./layout/Screen";
export { default as Center } from "./layout/Center";
export { default as Text } from "./primitives/Text";
export { default as Button } from "./primitives/Button";
STEP 7 — TEST IN CLIENT
MODIFY
apps/client/app/index.tsx
IMPLEMENT
import { Screen, Center, Button, Text } from "@ui/components";

export default function Home() {
  return (
    <Screen>
      <Center>
        <Text size="lg">KieliTaika</Text>
        <Button label="Test Button" onPress={() => {}} />
      </Center>
    </Screen>
  );
}
STEP 8 — VERIFY
Run:

npx expo start
CONFIRM
✔ App renders
✔ Background applied
✔ Text visible
✔ Button clickable
✔ No crashes
✔ Works on Android + Web

STEP 9 — ENFORCEMENT CHECK
SEARCH PROJECT FOR:
import { View
import { Text
import { Pressable
RULE
Allowed ONLY inside UI primitives

NOT allowed inside screens (except temporary debugging)

STEP 10 — DOCUMENTATION
UPDATE
docs/project_plans/monorepo_structure.md
ADD SECTION
UI Foundation Layer

Include:

Design tokens system

Layout primitives (Screen, Center)

UI primitives (Text, Button)

Usage constraints

Token enforcement rules

VALIDATION CHECKLIST
✔ tokens exist
✔ Screen works
✔ Center works
✔ Text works
✔ Button works
✔ StyleSheet used everywhere
✔ No arbitrary spacing values
✔ App renders correctly

OUTPUT FORMAT (STRICT)
Files created

UI folder structure

Validation results

Errors encountered

Success/failure

NO explanation.

FAILURE CONDITIONS
Inline styling used instead of StyleSheet

Arbitrary spacing values used

Missing tokens

UI crashes

Raw RN components used incorrectly

SUCCESS CONDITION
A strict, reusable UI system that all future screens must depend on.

END OF AGENT TASK

