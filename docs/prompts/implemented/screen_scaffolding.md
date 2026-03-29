AGENT ROLE
You are a Screen Scaffolding Agent.

Your task is to create a controlled screen system using the UI foundation.

You are NOT allowed to:

add business logic

connect APIs

implement real features

bypass UI primitives

CONTEXT
Project root:

/home/vitus/kielitaika-app
UI package:

/packages/ui
Client app:

/apps/client/app
OBJECTIVE
Create a strict screen structure system:

✔ Screen wrapper pattern
✔ Screen registry
✔ Navigation consistency
✔ Placeholder screens
✔ Enforced UI usage

HARD RULES
ALL screens must use <Screen> layout

ALL content must use UI primitives

NO raw React Native components (except temporary debug)

NO inline styling

NO business logic

Screens must be minimal and predictable

STEP 1 — CREATE SCREEN WRAPPER
CREATE FILE
packages/ui/components/layout/ScreenWrapper.tsx
IMPLEMENT
import { StyleSheet } from "react-native";
import Screen from "./Screen";

type Props = {
  children: React.ReactNode;
};

export default function ScreenWrapper({ children }: Props) {
  return <Screen>{children}</Screen>;
}
STEP 2 — CREATE SCREEN TEMPLATE
CREATE FILE
packages/ui/screens/BaseScreen.tsx
IMPLEMENT
import ScreenWrapper from "../components/layout/ScreenWrapper";
import Center from "../components/layout/Center";
import Text from "../components/primitives/Text";

type Props = {
  title: string;
};

export default function BaseScreen({ title }: Props) {
  return (
    <ScreenWrapper>
      <Center>
        <Text size="lg">{title}</Text>
      </Center>
    </ScreenWrapper>
  );
}
STEP 3 — DEFINE APP SCREENS
MODIFY / CREATE
apps/client/app/index.tsx
apps/client/app/auth.tsx
apps/client/app/home.tsx
IMPLEMENT
index.tsx
import BaseScreen from "@ui/screens/BaseScreen";

export default function Index() {
  return <BaseScreen title="Welcome" />;
}
auth.tsx
import BaseScreen from "@ui/screens/BaseScreen";

export default function Auth() {
  return <BaseScreen title="Auth Screen" />;
}
home.tsx
import BaseScreen from "@ui/screens/BaseScreen";

export default function Home() {
  return <BaseScreen title="Home Screen" />;
}
STEP 4 — ENFORCE STRUCTURE
RULE
All screens must follow:

Route → Screen file → UI BaseScreen → UI primitives
STEP 5 — VALIDATION
Run:

npx expo start
CONFIRM
✔ All routes render
✔ No crashes
✔ Layout consistent across screens
✔ No raw RN components used

STEP 6 — ENFORCEMENT CHECK
Search project for:

<View
<Text
<Pressable
REQUIREMENT
Only allowed inside UI package

NOT allowed in app screens

STEP 7 — DOCUMENTATION
UPDATE:

docs/project_plans/monorepo_structure.md
ADD SECTION
Screen System

Include:

BaseScreen pattern

ScreenWrapper usage

Route → Screen mapping

Rules for future screens

VALIDATION CHECKLIST
✔ BaseScreen exists
✔ All screens use BaseScreen
✔ No raw RN components in screens
✔ Routes working
✔ UI consistent

OUTPUT FORMAT
Files created

Folder structure (screens)

Validation results

Errors encountered

Success/failure

NO explanation.

FAILURE CONDITIONS
Screens bypass BaseScreen

Raw RN components used

Inconsistent layout

App crashes

SUCCESS CONDITION
A controlled, predictable screen system ready for feature expansion.

END OF AGENT TASK

