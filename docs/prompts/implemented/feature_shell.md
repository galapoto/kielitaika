🧱 FEATURE SHELL AGENT PROMPT
AGENT ROLE
You are a Feature Architecture Agent.

Your task is to create a feature-based project structure.

You are NOT allowed to:

implement business logic

call APIs

add state management

modify UI primitives

CONTEXT
Project root:

/home/vitus/kielitaika-app
Client app:

/apps/client
UI package:

/packages/ui
OBJECTIVE
Create a feature module system:

✔ Feature folder structure
✔ Screen → Feature separation
✔ Placeholder feature components
✔ Clean import boundaries

HARD RULES
Screens must NOT contain feature logic

Features must NOT contain UI primitives directly

UI must only come from @ui

Features must be isolated modules

No cross-feature imports

STEP 1 — CREATE FEATURE STRUCTURE
CREATE FOLDERS
apps/client/features/
├── auth/
├── home/
├── yki/
└── practice/
STEP 2 — CREATE FEATURE ENTRY FILES
FOR EACH FEATURE CREATE
Example:

apps/client/features/auth/AuthFeature.tsx
IMPLEMENT
import Text from "@ui/components/primitives/Text";
import Center from "@ui/components/layout/Center";

export default function AuthFeature() {
  return (
    <Center>
      <Text size="lg">Auth Feature</Text>
    </Center>
  );
}
Repeat for:

HomeFeature

YkiFeature

PracticeFeature

STEP 3 — CONNECT FEATURES TO SCREENS
MODIFY SCREENS
index.tsx
import BaseScreen from "@ui/screens/BaseScreen";
import HomeFeature from "../features/home/HomeFeature";

export default function Index() {
  return (
    <BaseScreen title="Welcome">
      <HomeFeature />
    </BaseScreen>
  );
}
auth.tsx
import BaseScreen from "@ui/screens/BaseScreen";
import AuthFeature from "../features/auth/AuthFeature";

export default function Auth() {
  return (
    <BaseScreen title="Auth">
      <AuthFeature />
    </BaseScreen>
  );
}
home.tsx
import BaseScreen from "@ui/screens/BaseScreen";
import HomeFeature from "../features/home/HomeFeature";

export default function Home() {
  return (
    <BaseScreen title="Home">
      <HomeFeature />
    </BaseScreen>
  );
}
STEP 4 — UPDATE BASESCREEN
MODIFY
packages/ui/screens/BaseScreen.tsx
IMPLEMENT
type Props = {
  title: string;
  children?: React.ReactNode;
};

export default function BaseScreen({ title, children }: Props) {
  return (
    <ScreenWrapper>
      <Center>
        <Text size="lg">{title}</Text>
        {children}
      </Center>
    </ScreenWrapper>
  );
}
STEP 5 — VALIDATION
Run:

npx expo start
CONFIRM
✔ All screens render
✔ Features render inside screens
✔ No crashes
✔ UI consistent

STEP 6 — ENFORCEMENT RULES
RULES
Screens = layout only

Features = content only

UI package = rendering only

STEP 7 — DOCUMENTATION
UPDATE:

docs/project_plans/monorepo_structure.md
ADD SECTION
Feature Architecture

Include:

feature folder structure

screen vs feature separation

import rules

VALIDATION CHECKLIST
✔ features folder exists
✔ features connected to screens
✔ BaseScreen accepts children
✔ no logic in screens
✔ no UI primitives outside UI package

OUTPUT FORMAT
Files created

Feature folder structure

Validation results

Errors encountered

Success/failure

NO explanation.

FAILURE CONDITIONS
Features placed inside screens

UI primitives used outside UI package

Screens contain logic

App crashes

SUCCESS CONDITION
A clean feature-based architecture ready for real implementation.

END OF AGENT TASK
