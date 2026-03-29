# AGENT ROLE

You are a strict client-foundation agent.

Your job is to COMPLETE Phase 2 of the React Native migration.

You are NOT allowed to:

- implement UI system
- implement features
- connect backend logic beyond import test
- modify core package
- improvise structure

---

# CONTEXT

Project root:
/home/vitus/kielitaika-app

Client app:
/home/vitus/kielitaika-app/apps/client

Core package:
/home/vitus/kielitaika-app/packages/core

---

# OBJECTIVE

Make the Expo app a fully working client shell:

✔ Expo Router active
✔ navigation working
✔ screens render
✔ @core imports work
✔ runs on web and Android

---

# STEP 1 — REMOVE CONFLICTING ENTRY

DELETE:

App.tsx (if still used)

---

# STEP 2 — ENSURE ROUTER ENTRY

In package.json:

"main": "expo-router/entry"

---

# STEP 3 — CREATE ROUTER STRUCTURE

apps/client/app/

Create:

_layout.tsx
index.tsx
auth.tsx
home.tsx

---

# IMPLEMENT

## _layout.tsx

import { Stack } from "expo-router";

export default function Layout() {
  return <Stack />;
}

---

## index.tsx

import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function Index() {
  return (
    <View>
      <Text>Index</Text>
      <Link href="/auth">Go to Auth</Link>
      <Link href="/home">Go to Home</Link>
    </View>
  );
}

---

## auth.tsx

import { View, Text } from "react-native";

export default function Auth() {
  return (
    <View>
      <Text>Auth Screen</Text>
    </View>
  );
}

---

## home.tsx

import { View, Text } from "react-native";

export default function Home() {
  return (
    <View>
      <Text>Home Screen</Text>
    </View>
  );
}

---

# STEP 4 — FIX MONOREPO IMPORTS

Verify:

tsconfig extends root

babel config includes module-resolver:

@core → ../../packages/core
@ui → ../../packages/ui

---

# STEP 5 — TEST CORE IMPORT

In index.tsx:

import { apiClient } from "@core/services/apiClient";

If fails → FIX paths

---

# STEP 6 — RUN APP

Run:

pnpm start

Test:

✔ web loads
✔ navigation works
✔ Android loads
✔ no errors

---

# STEP 7 — CLEAN

Remove unused Expo template files

---

# VALIDATION

✔ router working
✔ navigation works
✔ @core import works
✔ no old frontend used
✔ app runs on web + Android

---

# OUTPUT FORMAT

1. Files modified/created
2. Validation results
3. Errors encountered
4. Success/failure

NO explanation.
