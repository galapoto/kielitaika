KIELITAIKA REACT NATIVE MIGRATION PLAN
Part 1 — migration decision, target architecture, repo policy, and phase sequencing
1. Migration decision
The project will migrate from the current web-first React/Vite frontend to a React Native source-of-truth frontend using Expo and React Native Web.

This means the final UI architecture will be:

ONE UI SYSTEM
→ React Native components
→ used for Android
→ used for iOS
→ used for Web through react-native-web
The migration will not keep the current web UI as a parallel maintained frontend.

That is now forbidden.

The current web frontend exists only as a temporary source of reusable logic during migration. It is not the future UI.

2. Final architectural principle
At the end of migration, the repo must represent this clean separation:

kielitaika/
  apps/
    client/              ← Expo app, source of truth for mobile + web

  packages/
    core/                ← shared domain logic, API, models, validation
    ui/                  ← shared RN UI components, screens, theme

  backend/               ← app backend
  engine/                ← YKI engine
  docs/                  ← project plans and specs
This is the final state.

There must not be a surviving old frontend/ directory after migration is complete.

There must not be a second web UI.

There must not be legacy React DOM screens coexisting with React Native screens.

3. Repository policy during migration
The GitHub repository remains the same repository.

The migration will happen inside the same repo.

That means:

no second repo

no long-lived parallel app repo

no archive repo

no backup repo

no “old_frontend” folder

no “frontend_legacy” folder

Temporary migration work may coexist only while replacement is incomplete, but only one target structure is allowed to survive.

4. Fresh directory decision
You asked whether to start in a fresh directory.

Yes.

The migration should begin in a fresh application directory:

apps/client/
Do not begin by editing the current frontend/ into React Native.

Do not put the new app in frontend/.

Do not try to “convert” existing CSS layout files into RN styles.

The old frontend is too structurally different and will contaminate the migration if reused as the main working surface.

So the correct plan is:

Step 1:
Create fresh app structure in the same repo

Step 2:
Extract reusable logic from old frontend into packages/core

Step 3:
Build new RN UI in packages/ui and apps/client

Step 4:
Cut over fully

Step 5:
Delete old frontend completely
5. Non-negotiable migration rules
These rules govern the entire migration. They must be repeated in every implementation prompt later.

Rule 1
No dual UI systems may survive.

Rule 2
No CSS-based UI may survive in the final migrated app.

Rule 3
No React DOM-specific layout primitives may survive in the final migrated app.

Rule 4
No old frontend screens may be “temporarily reused” inside the new app.

Rule 5
Only reusable logic may be extracted from the old frontend:

services

API client code

validation

domain types

orchestration logic

state contracts that are platform-neutral

Rule 6
Anything not reused and not needed must be deleted, not archived.

Rule 7
There must be exactly one authoritative mobile/web client after migration:

apps/client
Rule 8
The engine and backend remain authoritative and are not to be re-architected during frontend migration unless strictly required for compatibility.

6. What the migration is not
To avoid agent improvisation later, this section is important.

This migration is not:

a redesign sprint

a store-release sprint

a CSS cleanup

a partial port

a wrapper strategy

Capacitor

Expo for mobile plus old web for browser

React Native plus separate React web

It is specifically:

React Native as source of truth
+
React Native Web for browser
+
single maintained UI codebase
7. Strategic objective of the migration
The migration has four strategic outcomes.

Outcome A — one maintained client
The team maintains one UI system, not two.

Outcome B — native store path
The app becomes truly launchable to:

Google Play

App Store

Web

Outcome C — removal of web-layout debt
The old over-constrained CSS layout system is eliminated completely rather than endlessly patched.

Outcome D — preservation of core product logic
The YKI engine integration, contract validation, speaking/listening logic, and state synchronization survive migration without being reinvented.

8. Current-state truth
The current repo contains a web app whose logic is valuable, but whose UI implementation is not suitable as the long-term source of truth.

The current frontend contains three categories of material:

Category A — must be preserved
Reusable non-UI logic:

API services

validation

models

contract guards

runtime synchronization logic

domain state logic that is not tied to DOM APIs

Category B — may be partially adapted
Interaction hooks and app flow logic that can be rewritten into RN-compatible form, but should not be copied blindly.

Category C — must be deleted after replacement
DOM-based screens, CSS files, layout wrappers, Vite-first UI shell, and browser-specific UI logic.

The migration plan will treat these three categories differently.

9. Migration philosophy
The migration must happen in this order:

extract → rebuild → cut over → delete
Not:

edit in place → patch → coexist → hope
That order is critical.

If the order is not respected, the repo will become a hybrid system that is harder to maintain than either pure React or pure React Native.

10. Final target runtime stack
The final client stack should be:

Expo
React Native
React Native Web
Expo Router
AsyncStorage / SecureStore
Expo AV / appropriate recording layer
shared packages/core
shared packages/ui
The final client should not depend on:

Vite as primary runtime

CSS for layout

React Router

localStorage as storage authority

MediaRecorder as the primary mobile recording layer

11. Store-launch requirement built into migration
The migration is not just about UI portability. It must end in a client that can actually be prepared for stores.

So the final app must support:

Android
Expo/EAS-compatible build path

permissions

icons

splash

microphone support

audio playback support

iOS
same as above, with iOS permission declarations

Web
browser rendering through react-native-web

same core flows

same contract logic

This requirement affects architecture from the start. It is not something added later.

12. High-level phase map
The migration will happen in eight major phases.

This section is only the map. The next parts will expand each phase atomically.

Phase 0 — repository preparation
Create the new structure and lock migration rules.

Phase 1 — logic extraction
Move reusable platform-neutral logic into packages/core.

Phase 2 — Expo app foundation
Create apps/client, configure Expo, add web support, add routing.

Phase 3 — UI foundation
Create packages/ui, tokens, primitives, shared screens.

Phase 4 — shell + auth + home
Rebuild app shell and core non-exam entry flows in RN.

Phase 5 — YKI runtime rebuild
Rebuild reading, listening, writing, and speaking flows in RN.

Phase 6 — platform capability replacement
Replace browser-only APIs with RN-compatible capabilities.

Phase 7 — cutover and deletion
Switch all client entry to the new app and delete the old frontend.

Phase 8 — release hardening
Prepare for web deployment, Android, iOS, and store compliance.

13. Phase gate policy
No phase may begin until the previous phase has a pass condition.

This is extremely important for later agent prompts.

Every phase must define:

allowed files

forbidden files

success condition

deletion condition

tests to run

This prevents the agent from spilling across boundaries.

14. Deletion policy
You insisted on this, so it is now explicit policy.

Deletion is mandatory when all three conditions are true:

Condition 1
The replacement path is implemented and verified.

Condition 2
A file, folder, or code path is proven unused by reference search and runtime path verification.

Condition 3
It is not an authoritative source for docs, contracts, or implementation.

If all three are true:

DELETE IT
No archiving.
No commenting out.
No “legacy” folder.

If one of the three is not true, do not delete yet.

15. Documentation policy during migration
Because this is a large migration, the documentation location matters.

I recommend you save the full migration plan in:

/home/vitus/kielitaika/docs/project_plans/react_native_migration_master_plan.md
That is the correct place if you are still using the current repo as the final repo.

Do not save it inside a hypothetical new repo, because there will not be a new repo.

The fresh directory is inside this repo, not outside it.

16. Directory creation plan
The first structural creation step in the repo will be this:

kielitaika/
  apps/
    client/
  packages/
    core/
    ui/
At the start, the old frontend/ still remains temporarily.

So transitional structure becomes:

kielitaika/
  apps/
    client/
  packages/
    core/
    ui/
  frontend/        ← temporary, scheduled for deletion later
  backend/
  engine/
  docs/
This is the only allowed temporary overlap.

No second temporary directories are allowed.

17. Definition of “core” package
packages/core will contain only platform-neutral logic.

Allowed inside packages/core:

API clients

service wrappers

contract guards

runtime validators

shared models/types

pure helpers

pure state logic that does not use DOM or RN APIs directly

Forbidden inside packages/core:

React components

CSS

React DOM references

browser globals

localStorage direct usage

navigation components

audio recording device code

screen components

This boundary must stay hard.

18. Definition of “ui” package
packages/ui will contain only React Native UI.

Allowed inside packages/ui:

React Native components

screens

tokens

theme primitives

shared RN hooks that are purely UI-facing

platform style variants if needed

Forbidden inside packages/ui:

API clients

engine orchestration

backend knowledge beyond typed contracts

direct business logic

old CSS files

React DOM-only components

19. Definition of apps/client
apps/client is the executable app.

It owns:

Expo config

app router

native entry points

asset registration

platform bootstrapping

wiring shared packages into a real app

It should remain thin.

apps/client should not become a dumping ground for services or business logic.

20. Migration success definition
The migration is complete only when all of the following are true:

Client structure
apps/client exists and is the only client app

packages/core exists and is used

packages/ui exists and is used

Old frontend
old frontend/ has been fully deleted

Runtime behavior
auth works

home works

YKI reading works

YKI listening works

YKI writing works

YKI speaking works

session resume works

state remains server-authoritative

Platform behavior
web works through RN Web

Android works

iOS works

Cleanup
no unused frontend legacy files remain

no CSS layout system remains

no browser-only client assumptions remain except where explicitly web-only and wrapped


KIELITAIKA REACT NATIVE MIGRATION PLAN
Part 2 — Phase 0 and Phase 1 (atomic execution)
🔥 PHASE 0 — REPOSITORY PREPARATION
This phase sets the ground rules physically in the repo.

Nothing functional is built yet.

If Phase 0 is wrong, everything after becomes messy.

🎯 OBJECTIVE
Create the new architecture without touching existing functionality yet.

At the end of Phase 0:

✔ new folders exist
✔ repo structure reflects future architecture
✔ nothing is broken
✔ frontend still runs (for now)
✅ STEP 0.1 — CREATE DIRECTORIES
From repo root:

mkdir -p apps/client
mkdir -p packages/core
mkdir -p packages/ui
✅ STEP 0.2 — ADD ROOT PACKAGE MANAGEMENT (MONOREPO SETUP)
You need a unified dependency system.

At repo root, create or update:

package.json
Minimal example:

{
  "name": "kielitaika",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
✅ STEP 0.3 — INSTALL WORKSPACE TOOLING
Choose one:

👉 Recommended: pnpm

npm install -g pnpm
pnpm install
✅ STEP 0.4 — CREATE EMPTY PACKAGE DEFINITIONS
Create:

packages/core/package.json
packages/ui/package.json
apps/client/package.json
Example for core:

{
  "name": "@core",
  "version": "1.0.0",
  "main": "index.ts"
}
Example for ui:

{
  "name": "@ui",
  "version": "1.0.0",
  "main": "index.ts"
}
✅ STEP 0.5 — CONFIGURE PATH ALIASES
At root (tsconfig.json):

{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["packages/core/*"],
      "@ui/*": ["packages/ui/*"]
    }
  }
}
✅ STEP 0.6 — DO NOT TOUCH FRONTEND YET
At this stage:

frontend/ must remain untouched
No edits. No deletions.

✅ PHASE 0 PASS CONDITION
✔ apps/client exists
✔ packages/core exists
✔ packages/ui exists
✔ workspace installs successfully
✔ frontend still runs unchanged
🔥 PHASE 1 — LOGIC EXTRACTION
This is the most important phase of the entire migration.

If done correctly:

→ migration becomes mechanical
If done wrongly:

→ everything becomes guesswork later

🎯 OBJECTIVE
Move ALL reusable, platform-neutral logic into packages/core

WITHOUT:

breaking frontend

introducing React Native yet

modifying logic behavior

🧠 STEP 1.1 — FULL INVENTORY (MANDATORY)
Before moving anything, you must identify everything that qualifies as reusable logic.

Inside:

frontend/app/
You will classify files into:

CATEGORY A — MUST MOVE (pure logic)
Examples:

services/
api/
utils/
types/
contractGuard/
Typical files:

apiClient.ts
authService.ts
ykiService.ts
subscriptionService.ts
contractGuard.ts
models/*
CATEGORY B — CONDITIONAL (needs inspection)
Examples:

hooks/
state logic
form validation
These may contain:

UI dependencies ❌

or pure logic ✔

You must inspect before moving.

CATEGORY C — DO NOT MOVE
Examples:

components/
screens/
theme/
css/
These are UI and must NOT enter core.

🧠 STEP 1.2 — CREATE CORE STRUCTURE
Inside:

packages/core/
Create:

services/
api/
models/
utils/
validation/
🧠 STEP 1.3 — MOVE FILES (CONTROLLED)
Move only CATEGORY A files.

Example:

mv frontend/app/services/* packages/core/services/
mv frontend/app/api/* packages/core/api/
mv frontend/app/types/* packages/core/models/
⚠️ IMPORTANT
Do NOT delete originals yet.

Temporarily:

✔ move
✔ then fix imports
✔ then verify
✔ THEN delete old copy
🧠 STEP 1.4 — FIX IMPORT PATHS
In moved files:

Replace:

../../services/apiClient
with:

@core/services/apiClient
🧠 STEP 1.5 — REMOVE UI DEPENDENCIES FROM CORE
Inside moved files, REMOVE:

window
document
localStorage
DOM events
Replace temporarily:
localStorage → abstract storage interface
Example:

export interface StorageAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
}
🧠 STEP 1.6 — CONNECT FRONTEND TO CORE
Now update frontend imports to use core.

Example:

import { authService } from "@core/services/authService"
🧠 STEP 1.7 — VERIFY FRONTEND STILL WORKS
Run:

cd frontend
npm run dev
You must confirm:

✔ app still loads
✔ auth still works
✔ API calls still work
If broken:

→ fix BEFORE proceeding

🧠 STEP 1.8 — DELETE DUPLICATES
Once confirmed working:

Delete old copies:

rm -rf frontend/app/services
rm -rf frontend/app/api
rm -rf frontend/app/types
🔴 DO NOT DELETE ANYTHING ELSE YET
Only delete what has been:

✔ moved
✔ replaced
✔ verified
🧠 STEP 1.9 — HARD CLEAN CORE
Inside packages/core:

Search for:

React
useState
useEffect
JSX
If found:

→ remove or refactor

Core must be:

pure logic ONLY
🧠 STEP 1.10 — ADD INDEX EXPORTS
Create:

packages/core/index.ts
Export everything:

export * from "./services/authService"
export * from "./services/ykiService"
✅ PHASE 1 PASS CONDITION
✔ ALL services live in packages/core
✔ frontend uses @core imports
✔ no duplicate service code remains in frontend
✔ frontend still works
✔ core contains NO UI code
✔ core contains NO DOM usage
❌ PHASE 1 FAILURE CONDITIONS
If any of these happen, STOP:

❌ frontend breaks
❌ duplicate services exist
❌ UI code enters core
❌ core still uses localStorage directly
❌ missing imports / circular deps
🧠 WHAT YOU HAVE AFTER PHASE 1
This is your real milestone:

✔ logic extracted
✔ frontend UI still intact (temporary)
✔ clean boundary established
Now migration becomes predictable.

KIELITAIKA REACT NATIVE MIGRATION PLAN
Part 3 — Phase 2 (Expo app creation, routing, web support, first execution)
🔥 PHASE 2 — CLIENT APP FOUNDATION
This phase creates the new source-of-truth app.

Nothing from the old UI is reused.

At the end of this phase:

✔ Expo app runs
✔ Runs on mobile (simulator/device)
✔ Runs on web
✔ Uses shared @core logic
✔ Has working navigation
✔ Has first visible screen
🎯 OBJECTIVE
Create a clean, working React Native app that:

lives in apps/client

can run on:

Android

iOS

Web

can import from @core

🧠 STEP 2.1 — INITIALIZE EXPO APP
From repo root:

cd apps
npx create-expo-app client
When prompted:

choose blank (TypeScript)

RESULT
apps/client/
  App.tsx
  package.json
  tsconfig.json
🧠 STEP 2.2 — CLEAN DEFAULT EXPO TEMPLATE
Delete or simplify:

App.tsx → replace completely
assets → keep only if needed
Replace App.tsx with:

import { Text, View } from "react-native";

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>KieliTaika RN App Booted</Text>
    </View>
  );
}
🧠 STEP 2.3 — INSTALL CORE DEPENDENCIES
Inside apps/client:

pnpm install
Then:

npx expo install react-native-web react-dom expo-router
🧠 STEP 2.4 — ENABLE WEB SUPPORT
Expo supports web automatically, but ensure:

In package.json:

"scripts": {
  "start": "expo start",
  "web": "expo start --web"
}
🧠 STEP 2.5 — CONFIGURE ROUTING (EXPO ROUTER)
Create:

apps/client/app/
Inside:

app/index.tsx
index.tsx
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Screen</Text>
    </View>
  );
}
REMOVE App.tsx
Expo Router replaces it.

🧠 STEP 2.6 — CONFIGURE EXPO ROUTER ENTRY
Edit:

apps/client/package.json
Add:

"main": "expo-router/entry"
🧠 STEP 2.7 — CONNECT MONOREPO (CRITICAL)
Expo must resolve @core.

EDIT apps/client/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "strict": true
  }
}
EDIT apps/client/babel.config.js
Add:

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@core": "../../packages/core",
            "@ui": "../../packages/ui"
          }
        }
      ]
    ]
  };
};
Install resolver:

pnpm add -D babel-plugin-module-resolver
🧠 STEP 2.8 — VERIFY CORE IMPORT WORKS
Test:

import { apiClient } from "@core/api/apiClient";
If this fails:

→ STOP and fix path resolution

🧠 STEP 2.9 — RUN THE APP
From apps/client:

pnpm start
Test:

✔ web
✔ Android (emulator or device)
✔ iOS (if available)
🧠 STEP 2.10 — ADD BASIC SCREEN STRUCTURE
Create:

apps/client/app/auth.tsx
apps/client/app/home.tsx
auth.tsx
import { Text, View } from "react-native";

export default function AuthScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Auth Screen</Text>
    </View>
  );
}
home.tsx
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Screen</Text>
    </View>
  );
}
🧠 STEP 2.11 — NAVIGATION TEST
In index.tsx:

import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Link href="/auth">Go to Auth</Link>
    </View>
  );
}
🧠 STEP 2.12 — VERIFY NAVIGATION
Check:

✔ navigation works on web
✔ navigation works on mobile
✔ screens render
🧠 STEP 2.13 — INITIAL PROJECT CLEANUP
Remove unused Expo files:

unused example components
unused styles
unused assets
Keep only:

app/
assets/
package.json
babel.config.js
✅ PHASE 2 PASS CONDITION
✔ Expo app runs on web + mobile
✔ routing works
✔ @core imports resolve
✔ no dependency errors
✔ no frontend/ code used here
❌ PHASE 2 FAILURE CONDITIONS
❌ cannot import @core
❌ navigation broken
❌ only works on web but not mobile
❌ Expo config inconsistent
❌ mixing old frontend code into new app
🧠 WHAT YOU NOW HAVE
This is your new foundation:

✔ RN app exists
✔ monorepo connected
✔ routing system in place
✔ core logic accessible
This is the turning point.

From here forward:

👉 all UI work happens in RN
👉 old frontend becomes temporary reference only



KIELITAIKA REACT NATIVE MIGRATION PLAN
Part 4 — Phase 3 (UI system creation: tokens, primitives, layout system)
🔥 PHASE 3 — UI SYSTEM FOUNDATION
🎯 OBJECTIVE
Build a React Native UI system from zero that replaces:

❌ CSS
❌ global.css
❌ ScreenScaffold
❌ layout hacks
❌ overflow fixes
❌ 100vh stacking issues
And introduces:

✔ predictable layout
✔ controlled spacing system
✔ reusable components
✔ cross-platform rendering (mobile + web)
✔ no layout clipping issues
🧠 CORE PRINCIPLE
React Native layout is:

Flexbox ONLY
There is:

❌ no CSS cascade
❌ no global styles
❌ no overflow hacks (by default)
❌ no vh / % stacking tricks
So you must think in:

containers → flex → children
🧱 UI ARCHITECTURE (FINAL FORM)
packages/ui/

  theme/
    colors.ts
    spacing.ts
    typography.ts
    layout.ts

  components/
    primitives/
      Box.tsx
      Text.tsx
      Button.tsx
      Input.tsx

    layout/
      Screen.tsx
      Section.tsx
      Center.tsx

  screens/
    AuthScreen.tsx
    HomeScreen.tsx
🔥 STEP 3.1 — DESIGN TOKENS (MANDATORY FIRST)
📁 CREATE
packages/ui/theme/
🎨 colors.ts
export const colors = {
  background: "#0b1c2c",
  surface: "#132f4c",
  primary: "#1e3a5f",
  accent: "#4da6ff",
  text: "#ffffff",
  textMuted: "#9fb3c8",
  border: "#2a4d6e",
  danger: "#ff4d4f",
  success: "#4caf50"
};
📏 spacing.ts (8px SYSTEM — NON-NEGOTIABLE)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40
};
No random spacing allowed later.

🔤 typography.ts
export const typography = {
  heading: {
    fontSize: 24,
    fontWeight: "600"
  },
  body: {
    fontSize: 16
  },
  small: {
    fontSize: 14
  }
};
🔥 STEP 3.2 — BASE PRIMITIVE COMPONENTS
These replace raw RN components.

📁 CREATE
packages/ui/components/primitives/
🧱 Box.tsx (core layout unit)
import { View } from "react-native";

export default function Box({ children, style }) {
  return <View style={style}>{children}</View>;
}
🧱 Text.tsx (centralized text control)
import { Text as RNText } from "react-native";
import { colors, typography } from "../../theme";

export default function Text({ children, style }) {
  return (
    <RNText style={[{ color: colors.text }, typography.body, style]}>
      {children}
    </RNText>
  );
}
🧱 Button.tsx
import { Pressable, Text } from "react-native";
import { colors, spacing } from "../../theme";

export default function Button({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: 8,
        alignItems: "center"
      }}
    >
      <Text style={{ color: "#fff" }}>{label}</Text>
    </Pressable>
  );
}
🧱 Input.tsx
import { TextInput } from "react-native";
import { colors, spacing } from "../../theme";

export default function Input(props) {
  return (
    <TextInput
      {...props}
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        borderRadius: 6,
        color: colors.text
      }}
    />
  );
}
🔥 STEP 3.3 — LAYOUT SYSTEM (REPLACES ScreenScaffold)
This is CRITICAL.

Your old system failed because of:

100vh stacking
overflow hidden
height conflicts
We eliminate that completely.

📁 CREATE
packages/ui/components/layout/
🧱 Screen.tsx (ROOT LAYOUT — MUST BE CORRECT)
import { SafeAreaView, View } from "react-native";
import { colors } from "../../theme";

export default function Screen({ children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
🧱 Center.tsx
import { View } from "react-native";

export default function Center({ children }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {children}
    </View>
  );
}
🧱 Section.tsx
import { View } from "react-native";
import { spacing } from "../../theme";

export default function Section({ children }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {children}
    </View>
  );
}
🔥 STEP 3.4 — BUILD FIRST REAL SCREEN
📁 CREATE
packages/ui/screens/AuthScreen.tsx
AuthScreen.tsx
import Screen from "../components/layout/Screen";
import Center from "../components/layout/Center";
import Input from "../components/primitives/Input";
import Button from "../components/primitives/Button";
import Text from "../components/primitives/Text";
import { spacing } from "../theme";
import { View } from "react-native";

export default function AuthScreen() {
  return (
    <Screen>
      <Center>
        <View style={{ width: "80%" }}>
          <Text style={{ marginBottom: spacing.md }}>Login</Text>

          <Input placeholder="Email" />
          <View style={{ height: spacing.md }} />

          <Input placeholder="Password" secureTextEntry />
          <View style={{ height: spacing.lg }} />

          <Button label="Sign In" onPress={() => {}} />
        </View>
      </Center>
    </Screen>
  );
}
🔥 STEP 3.5 — CONNECT SCREEN TO APP
In:

apps/client/app/auth.tsx
Replace with:

import AuthScreen from "@ui/screens/AuthScreen";

export default AuthScreen;
🔥 STEP 3.6 — VERIFY RENDER
Run:

pnpm start
Check:

✔ screen renders on web
✔ screen renders on mobile
✔ no layout clipping
✔ no scroll bugs
✔ no invisible content
🧠 LAYOUT RULES (ABSOLUTE — NO EXCEPTIONS)
RULE 1
Never use height: 100%
Use:

flex: 1
RULE 2
Never stack full-height containers inside each other
RULE 3
Scrolling must be explicit (ScrollView), not accidental
RULE 4
No overflow: hidden hacks
RULE 5
All spacing must use spacing tokens
✅ PHASE 3 PASS CONDITION
✔ UI renders on mobile + web
✔ Screen layout stable
✔ No CSS used
✔ No layout bugs
✔ primitives reusable
✔ Auth screen exists
❌ FAILURE CONDITIONS
❌ layout breaks on one platform
❌ reintroducing CSS thinking
❌ hardcoded spacing everywhere
❌ Screen not using flex:1
🧠 WHAT YOU NOW HAVE
This is major:

✔ working RN UI system
✔ layout system fixed permanently
✔ reusable components
✔ no dependency on old frontend UI


KIELITAIKA REACT NATIVE MIGRATION PLAN
Part 5 — Phase 4 (App shell, auth integration, global state, home flow)
🔥 PHASE 4 — APPLICATION SHELL + AUTH + HOME
🎯 OBJECTIVE
At the end of this phase:

✔ app knows if user is logged in
✔ auth screen works (real API)
✔ home screen loads after login
✔ session persists (basic)
✔ navigation controlled by state
✔ no dependency on old frontend
🧠 CORE IDEA OF THIS PHASE
Right now:

UI = static
After this phase:

UI = driven by real state + backend
🧠 STEP 4.1 — GLOBAL APP STATE (AUTH STATE)
We need a single source of truth for auth.

📁 CREATE
apps/client/state/
  authStore.ts
authStore.ts (simple version)
import { create } from "zustand";

type AuthState = {
  user: any | null;
  token: string | null;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null })
}));
INSTALL
pnpm add zustand
🧠 STEP 4.2 — CONNECT API CLIENT TO AUTH
Inside:

packages/core/api/apiClient.ts
Add token injection.

Example:

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

export async function apiClient(url: string, options: any = {}) {
  const headers = {
    ...(options.headers || {}),
    Authorization: authToken ? `Bearer ${authToken}` : ""
  };

  return fetch(url, { ...options, headers });
}
🧠 STEP 4.3 — LOGIN FLOW (REAL)
📁 UPDATE
packages/ui/screens/AuthScreen.tsx
Replace static UI with logic:
import { useState } from "react";
import { View } from "react-native";
import Screen from "../components/layout/Screen";
import Center from "../components/layout/Center";
import Input from "../components/primitives/Input";
import Button from "../components/primitives/Button";
import Text from "../components/primitives/Text";
import { spacing } from "../theme";

import { useAuthStore } from "../../../apps/client/state/authStore";
import { authService } from "@core/services/authService";
import { setAuthToken } from "@core/api/apiClient";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    const result = await authService.login(email, password);

    const { user, token } = result;

    setAuth(user, token);
    setAuthToken(token);
  };

  return (
    <Screen>
      <Center>
        <View style={{ width: "80%" }}>
          <Text style={{ marginBottom: spacing.md }}>Login</Text>

          <Input placeholder="Email" onChangeText={setEmail} />
          <View style={{ height: spacing.md }} />

          <Input
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
          />
          <View style={{ height: spacing.lg }} />

          <Button label="Sign In" onPress={handleLogin} />
        </View>
      </Center>
    </Screen>
  );
}
🧠 STEP 4.4 — CREATE HOME SCREEN
📁 CREATE
packages/ui/screens/HomeScreen.tsx
HomeScreen.tsx
import Screen from "../components/layout/Screen";
import Center from "../components/layout/Center";
import Button from "../components/primitives/Button";
import Text from "../components/primitives/Text";

import { useAuthStore } from "../../../apps/client/state/authStore";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <Screen>
      <Center>
        <Text>Welcome {user?.name || "User"}</Text>
        <Button label="Logout" onPress={logout} />
      </Center>
    </Screen>
  );
}
🧠 STEP 4.5 — CONTROL NAVIGATION BY AUTH STATE
📁 EDIT
apps/client/app/index.tsx
Replace with:
import { useAuthStore } from "../state/authStore";
import AuthScreen from "@ui/screens/AuthScreen";
import HomeScreen from "@ui/screens/HomeScreen";

export default function Index() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <AuthScreen />;
  }

  return <HomeScreen />;
}
🧠 STEP 4.6 — VERIFY LOGIN FLOW
Test:

✔ enter credentials
✔ login triggers API
✔ state updates
✔ screen switches to home
✔ logout returns to auth
🧠 STEP 4.7 — ADD BASIC PERSISTENCE (TEMPORARY)
We need session survival.

INSTALL
npx expo install @react-native-async-storage/async-storage
UPDATE authStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
Persist token:

setAuth: async (user, token) => {
  await AsyncStorage.setItem("token", token);
  set({ user, token });
}
🧠 STEP 4.8 — LOAD SESSION ON START
📁 CREATE
apps/client/app/_layout.tsx
_layout.tsx
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../state/authStore";
import { setAuthToken } from "@core/api/apiClient";

export default function RootLayout({ children }) {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const load = async () => {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        setAuth({}, token);
        setAuthToken(token);
      }
    };

    load();
  }, []);

  return children;
}
🧠 STEP 4.9 — CLEANUP FRONTEND DEPENDENCY
At this point:

✔ no UI dependency on frontend/
✔ logic already in core
✔ new UI fully functional
✅ PHASE 4 PASS CONDITION
✔ login works
✔ logout works
✔ session persists
✔ home screen loads
✔ API connected
✔ no frontend UI used
❌ FAILURE CONDITIONS
❌ login breaks
❌ token not passed to API
❌ navigation incorrect
❌ session lost on refresh
🧠 WHAT YOU NOW HAVE
This is the first real milestone:

✔ functioning app
✔ backend connected
✔ state managed
✔ login flow complete
You now have a real application, not a skeleton.


KIELITAIKA REACT NATIVE MIGRATION PLAN
Part 6 — Phase 5 (YKI exam system rebuild: reading, listening, writing, speaking)
🔥 PHASE 5 — YKI EXAM SYSTEM (FULL REBUILD ON RN)
🎯 OBJECTIVE
Rebuild the entire YKI exam experience in React Native while preserving:

✔ deterministic flow (engine-driven)
✔ no back navigation
✔ strict section order
✔ correct separation of prompt vs questions
✔ engine state authority
✔ exam timing compatibility
At the end:

✔ full exam can be completed on mobile + web
✔ state always matches engine
✔ no UI-driven logic drift
🧠 CORE PRINCIPLE (NON-NEGOTIABLE)
UI DOES NOT CONTROL THE EXAM

ENGINE CONTROLS THE EXAM
That means:

UI renders what engine says

UI does not infer next step

UI does not store exam state independently

🧠 YKI SYSTEM STRUCTURE
We split into layers:

packages/core/
  ykiService.ts      → API communication
  runtime models     → engine contract

packages/ui/
  screens/yki/
    YkiEntryScreen.tsx
    YkiSectionScreen.tsx
    YkiTaskScreen.tsx

apps/client/
  app/yki/*
🔥 STEP 5.1 — CREATE YKI ROUTES
📁 CREATE
apps/client/app/yki/
  index.tsx
  session.tsx
index.tsx (entry)
import YkiEntryScreen from "@ui/screens/yki/YkiEntryScreen";

export default YkiEntryScreen;
session.tsx
import YkiSessionScreen from "@ui/screens/yki/YkiSessionScreen";

export default YkiSessionScreen;
🔥 STEP 5.2 — YKI ENTRY SCREEN
📁 CREATE
packages/ui/screens/yki/YkiEntryScreen.tsx
Purpose
start exam session

call engine /exam/start

navigate to session screen

Implementation
import Screen from "../../components/layout/Screen";
import Center from "../../components/layout/Center";
import Button from "../../components/primitives/Button";
import { useRouter } from "expo-router";
import { ykiService } from "@core/services/ykiService";

export default function YkiEntryScreen() {
  const router = useRouter();

  const startExam = async () => {
    const session = await ykiService.startExam();

    router.push({
      pathname: "/yki/session",
      params: { sessionId: session.id }
    });
  };

  return (
    <Screen>
      <Center>
        <Button label="Start YKI Exam" onPress={startExam} />
      </Center>
    </Screen>
  );
}
🔥 STEP 5.3 — SESSION SCREEN (CORE ENGINE SYNC)
📁 CREATE
packages/ui/screens/yki/YkiSessionScreen.tsx
RESPONSIBILITY
✔ fetch engine state
✔ render correct section
✔ enforce forward-only flow
✔ no local navigation logic
Implementation
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ykiService } from "@core/services/ykiService";

import YkiSectionRenderer from "./YkiSectionRenderer";

export default function YkiSessionScreen() {
  const { sessionId } = useLocalSearchParams();
  const [state, setState] = useState(null);

  const loadState = async () => {
    const data = await ykiService.getSession(sessionId);
    setState(data);
  };

  useEffect(() => {
    loadState();
  }, []);

  if (!state) return null;

  return <YkiSectionRenderer state={state} refresh={loadState} />;
}
🔥 STEP 5.4 — SECTION RENDERER
📁 CREATE
packages/ui/screens/yki/YkiSectionRenderer.tsx
RESPONSIBILITY
Map engine state → correct UI

import ReadingSection from "./sections/ReadingSection";
import ListeningSection from "./sections/ListeningSection";
import WritingSection from "./sections/WritingSection";
import SpeakingSection from "./sections/SpeakingSection";

export default function YkiSectionRenderer({ state, refresh }) {
  switch (state.section) {
    case "reading":
      return <ReadingSection state={state} refresh={refresh} />;

    case "listening":
      return <ListeningSection state={state} refresh={refresh} />;

    case "writing":
      return <WritingSection state={state} refresh={refresh} />;

    case "speaking":
      return <SpeakingSection state={state} refresh={refresh} />;

    default:
      return null;
  }
}
🔥 STEP 5.5 — READING SECTION (STRICT FLOW)
📁 CREATE
packages/ui/screens/yki/sections/ReadingSection.tsx
RULES
✔ passage first
✔ no questions shown yet
✔ Next → questions
✔ no back button
Implementation
import Screen from "../../../components/layout/Screen";
import Button from "../../../components/primitives/Button";
import Text from "../../../components/primitives/Text";

export default function ReadingSection({ state, refresh }) {
  if (state.stage === "passage") {
    return (
      <Screen>
        <Text>{state.passage}</Text>
        <Button label="Next" onPress={state.next} />
      </Screen>
    );
  }

  if (state.stage === "questions") {
    return (
      <Screen>
        {state.questions.map((q) => (
          <Text key={q.id}>{q.text}</Text>
        ))}
        <Button label="Submit" onPress={state.submit} />
      </Screen>
    );
  }

  return null;
}
🔥 STEP 5.6 — LISTENING SECTION
RULES
✔ audio first
✔ user listens
✔ Next → questions
✔ deterministic playback
Implementation (simplified)
import { Audio } from "expo-av";
import Button from "../../../components/primitives/Button";
import Screen from "../../../components/layout/Screen";

export default function ListeningSection({ state, refresh }) {
  const playAudio = async () => {
    const { sound } = await Audio.Sound.createAsync({
      uri: state.audioUrl
    });
    await sound.playAsync();
  };

  return (
    <Screen>
      <Button label="Play Audio" onPress={playAudio} />
      <Button label="Next" onPress={state.next} />
    </Screen>
  );
}
🔥 STEP 5.7 — WRITING SECTION
RULES
✔ prompt shown
✔ user writes
✔ submit once
Implementation
import { useState } from "react";
import Screen from "../../../components/layout/Screen";
import Input from "../../../components/primitives/Input";
import Button from "../../../components/primitives/Button";

export default function WritingSection({ state }) {
  const [text, setText] = useState("");

  return (
    <Screen>
      <Input multiline value={text} onChangeText={setText} />
      <Button label="Submit" onPress={() => state.submit(text)} />
    </Screen>
  );
}
🔥 STEP 5.8 — SPEAKING SECTION (CRITICAL)
RULES
✔ record audio
✔ stop
✔ upload
✔ no re-record unless allowed
INSTALL
npx expo install expo-av
Implementation
import { Audio } from "expo-av";
import { useState } from "react";
import Button from "../../../components/primitives/Button";
import Screen from "../../../components/layout/Screen";

export default function SpeakingSection({ state }) {
  const [recording, setRecording] = useState(null);

  const start = async () => {
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
  };

  const stop = async () => {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    await state.submit(uri);
  };

  return (
    <Screen>
      <Button label="Start" onPress={start} />
      <Button label="Stop" onPress={stop} />
    </Screen>
  );
}
🔴 CRITICAL RULES FOR YKI FLOW
RULE 1
No back navigation allowed
RULE 2
UI must always fetch fresh state after actions
RULE 3
Engine is single source of truth
RULE 4
No local progress tracking
✅ PHASE 5 PASS CONDITION
✔ full exam runs
✔ all sections work
✔ engine state always matches UI
✔ no back navigation possible
✔ audio works
✔ submission works
❌ FAILURE CONDITIONS
❌ UI controls flow instead of engine
❌ desync between UI and backend
❌ audio fails on device
❌ navigation allows skipping rules
🧠 WHAT YOU NOW HAVE
This is the core of your product:

✔ fully working YKI system
✔ platform-independent
✔ deterministic
✔ mobile-ready


KIELITAIKA REACT NATIVE MIGRATION PLAN
Part 7 — Phase 6 (Platform replacement + system cleanup)
🔥 PHASE 6 — PLATFORM ADAPTATION & CLEANUP
🎯 OBJECTIVE
Make the system fully platform-agnostic:

✔ no browser-only APIs
✔ no DOM assumptions
✔ no localStorage
✔ no window/document usage
✔ stable audio on mobile
✔ stable navigation lifecycle
At the end:

✔ app runs identically on web + Android + iOS
✔ no hidden runtime crashes
✔ no environment-specific bugs
🧠 CORE PRINCIPLE
ANYTHING THAT ONLY WORKS IN A BROWSER IS A BUG
🔍 STEP 6.1 — GLOBAL SEARCH & DESTROY (BROWSER APIs)
🔎 SEARCH ENTIRE CODEBASE FOR:
window
document
localStorage
sessionStorage
navigator
addEventListener
removeEventListener
🚫 THESE MUST NOT EXIST
If found → replace or delete.

✅ REPLACEMENTS
Browser API	Replacement
localStorage	AsyncStorage
window events	hooks / RN lifecycle
DOM refs	React refs
document.query	remove (invalid in RN)
🔥 STEP 6.2 — STORAGE LAYER (CRITICAL)
📦 INSTALL
npx expo install @react-native-async-storage/async-storage
📁 CREATE
packages/core/storage/storageService.ts
IMPLEMENTATION
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storageService = {
  async set(key: string, value: any) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async get(key: string) {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  }
};
🔁 MIGRATE ALL STORAGE USAGE
Replace:

localStorage.getItem
localStorage.setItem
→ with storageService

🔥 STEP 6.3 — AUDIO SYSTEM HARDENING
You already partially implemented this earlier.

Now we make it production-safe.

🧠 PROBLEMS TO FIX
❌ audio overlapping
❌ audio not unloading
❌ memory leaks
❌ inconsistent playback on Android
📁 CREATE
packages/core/audio/audioManager.ts
IMPLEMENTATION
import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;

export const audioManager = {
  async play(uri: string) {
    if (currentSound) {
      await currentSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync({ uri });
    currentSound = sound;

    await sound.playAsync();
  },

  async stop() {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  }
};
🔁 REPLACE ALL AUDIO USAGE
Do NOT use raw Audio.Sound.createAsync directly anymore.

Always use audioManager.

🔥 STEP 6.4 — NAVIGATION EDGE CASES
⚠️ PROBLEM
RN navigation behaves differently:

❌ screens remain mounted
❌ state persists unexpectedly
❌ effects may not rerun
✅ FIX
Use focus-based lifecycle.

📦 INSTALL
npx expo install @react-navigation/native
USE
import { useFocusEffect } from "@react-navigation/native";

useFocusEffect(() => {
  loadData();
});
🔁 APPLY TO:
✔ YKI session screen
✔ roleplay screen
✔ practice screens
🔥 STEP 6.5 — TIMER / INTERVAL CLEANUP
🔎 SEARCH FOR:
setInterval
setTimeout
⚠️ PROBLEM
Timers continue running after navigation.

✅ FIX PATTERN
useEffect(() => {
  const interval = setInterval(() => {
    // logic
  }, 1000);

  return () => clearInterval(interval);
}, []);
🔥 STEP 6.6 — ERROR BOUNDARY (RN SAFE)
📁 CREATE
packages/ui/system/ErrorBoundary.tsx
IMPLEMENTATION
import React from "react";
import { Text } from "react-native";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <Text>Something went wrong</Text>;
    }

    return this.props.children;
  }
}
APPLY AT ROOT
<ErrorBoundary>
  <App />
</ErrorBoundary>
🔥 STEP 6.7 — ENVIRONMENT VARIABLES
📁 CREATE
packages/core/config/env.ts
IMPLEMENTATION
export const env = {
  API_URL: process.env.EXPO_PUBLIC_API_URL
};
⚠️ RULE
NO HARD-CODED URLs ANYWHERE
🔥 STEP 6.8 — REMOVE UNUSED WEB-ONLY CODE
🔎 DELETE:
❌ CSS files
❌ DOM-based helpers
❌ web-specific layout hacks
❌ unused components
🧠 RULE
IF IT DOES NOT RUN IN RN → REMOVE IT
🔥 STEP 6.9 — PERFORMANCE PASS
CHECK:
✔ no unnecessary re-renders
✔ memoization where needed
✔ FlatList for long lists
✔ no heavy inline objects
EXAMPLE
const memoized = useMemo(() => compute(data), [data]);
🔥 STEP 6.10 — TEST MATRIX
TEST ON:
✔ Web (Expo web)
✔ Android emulator
✔ real Android device
✔ iOS simulator (if available)
VERIFY:
✔ navigation works
✔ audio works
✔ API works
✔ no crashes
✔ no layout breaking
✅ PHASE 6 PASS CONDITION
✔ no browser APIs left
✔ storage unified
✔ audio stable
✔ navigation stable
✔ no hidden crashes
❌ FAILURE CONDITIONS
❌ app crashes on mobile
❌ audio breaks randomly
❌ stale state issues
❌ leftover localStorage
🧠 WHAT YOU NOW HAVE
At this point:

✔ full RN-compatible system
✔ stable runtime
✔ no hidden platform bugs
This is the moment where the system becomes truly portable.


KIELITAIKA REACT NATIVE MIGRATION PLAN
Part 8 — Phase 7 (Final cutover & frontend decommission)
🔥 PHASE 7 — FINAL CUTOVER
🎯 OBJECTIVE
Replace the old system completely:

✔ React Native app becomes primary system
✔ old frontend is frozen → then deleted
✔ all routes point to new system
✔ deployment pipeline updated
✔ system ready for production scaling
🧠 CORE PRINCIPLE
NO PARTIAL SWITCH

CUTOVER IS BINARY:
OLD → OFF
NEW → ON
⚠️ BEFORE YOU BEGIN (MANDATORY CHECKPOINT)
You must confirm:

✔ Phase 1–6 fully passed
✔ YKI exam works end-to-end
✔ roleplay works
✔ audio stable
✔ no browser APIs remain
✔ app runs on:
   - web
   - Android
   - (iOS if available)
If ANY of these fail → DO NOT proceed.

🔒 STEP 7.1 — FREEZE OLD FRONTEND
📁 LOCATION
/home/vitus/kielitaika/frontend/
ACTION
git checkout -b freeze/frontend-final
PURPOSE
✔ preserve last working state
✔ allow rollback if needed
✔ prevent accidental edits
🔒 ADD PROTECTION FILE
frontend/DO_NOT_EDIT.md
⚠️ THIS FRONTEND IS FROZEN

Do not modify.

The system has migrated to React Native.

All new development happens in apps/client/.
🔥 STEP 7.2 — FINAL PARITY VERIFICATION
🧠 YOU MUST VERIFY FEATURE-BY-FEATURE
CHECKLIST
AUTH
✔ login works
✔ session persists

PRACTICE
✔ cards load
✔ answers work

ROLEPLAY
✔ start session
✔ conversation works
✔ audio works

TTS
✔ playback works
✔ no delays

YKI
✔ full exam works
✔ all sections pass

UI
✔ no layout breaks
✔ consistent design
🔴 RULE
IF ANY FEATURE IS MISSING → STOP CUTOVER
🔥 STEP 7.3 — ROUTING SWITCH
CURRENT STATE
Old system handles web:

frontend/
NEW STATE
React Native handles everything:

apps/client/
ACTION OPTIONS
OPTION A (RECOMMENDED)
Use Expo Web:

npx expo start --web
OPTION B (PRODUCTION)
Build static export:

npx expo export:web
RESULT
dist/
Deploy this instead of old frontend build.

🔥 STEP 7.4 — DEPLOYMENT UPDATE
IF USING VERCEL
OLD
root: frontend/
build: npm run build
NEW
root: apps/client/
build: expo export:web
output: dist/
IF USING DOCKER
Update Dockerfile:

FROM node:18

WORKDIR /app

COPY . .

RUN npm install
RUN npx expo export:web

CMD ["npx", "serve", "dist"]
🔥 STEP 7.5 — ENVIRONMENT VALIDATION
VERIFY
✔ API URL correct
✔ WebSocket works
✔ auth cookies / tokens working
✔ audio endpoints accessible
🔴 COMMON FAILURE
❌ wrong API URL
❌ CORS mismatch
❌ audio path mismatch
🔥 STEP 7.6 — DELETE OLD FRONTEND (CONTROLLED)
⚠️ DO NOT DELETE IMMEDIATELY
Wait until:

✔ production runs stable for 3–5 days
✔ no critical bug reports
✔ logs are clean
THEN:
git rm -r frontend/
git commit -m "Remove legacy frontend after RN migration"
🔥 STEP 7.7 — CLEAN PROJECT ROOT
FINAL STRUCTURE
kielitaika/
  apps/
    client/        ← PRIMARY APP
  packages/
    core/
    ui/
  backend/
  docs/
REMOVE:
❌ duplicated assets
❌ old UI components
❌ unused services
🔥 STEP 7.8 — MONITORING & LOGGING
ADD LOGGING IF NOT PRESENT
✔ API errors
✔ audio failures
✔ session issues
✔ crash logs
OPTIONAL (BUT STRONGLY ADVISED)
Sentry / LogRocket equivalent
🔥 STEP 7.9 — POST-CUTOVER HARDENING
WATCH FOR:
✔ memory leaks
✔ audio edge cases
✔ navigation glitches
✔ performance drops
FIX IMMEDIATELY
Do not accumulate bugs post-cutover.

🔥 STEP 7.10 — FINAL VALIDATION
YOU SHOULD NOW HAVE:
✔ single frontend system (RN)
✔ unified UI layer
✔ engine-driven logic intact
✔ mobile + web parity
✔ no legacy dependencies
❌ FAILURE CONDITIONS
❌ both frontends active
❌ inconsistent behavior between platforms
❌ hidden dependency on old frontend
❌ broken routes after deployment
🧠 FINAL STATE OF SYSTEM
ARCHITECTURE:

apps/client/      → UI layer (RN)
packages/ui/      → components
packages/core/    → logic/services
backend/          → API
engine/           → YKI engine

FLOW:

User → RN UI → core services → backend → engine → response → UI
🧠 WHAT YOU HAVE ACHIEVED
✔ full migration from web → cross-platform
✔ deterministic exam system preserved
✔ scalable architecture
✔ enterprise-grade foundation







































