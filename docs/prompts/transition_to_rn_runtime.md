You are now transitioning the project from backend/intelligence expansion to frontend runtime construction.

This is a PHASE CHANGE.

You must stop all backend feature work immediately.

---

# 🔒 CONTEXT (MANDATORY)

The system state is:

* Core layer: COMPLETE and stable
* Learning system: COMPLETE
* Decision system: COMPLETE
* Effectiveness tracking: COMPLETE (just implemented)
* Debug systems: COMPLETE

Frontend (React Native):

* NOT IMPLEMENTED
* This is now the PRIMARY BLOCKER

You are now entering:

PHASE 2 — EXPO RUNTIME FOUNDATION

---

# 🚫 HARD PROHIBITIONS

You are NOT allowed to:

* Modify backend logic
* Modify decision weights
* Add new learning features
* Extend effectiveness tracking
* Refactor existing backend systems
* Touch YKI engine logic

If you encounter backend issues:

→ document them
→ DO NOT fix them unless blocking runtime execution

---

# 🎯 OBJECTIVE

Create a fully working Expo-based React Native app in:

apps/client

This app must:

* Run on Android
* Run on Web (react-native-web)
* Resolve imports from @core
* Support routing (expo-router)
* Render at least one working screen

This is NOT UI design phase.

This is runtime foundation only.

---

# 🧱 PHASE 2 — REQUIRED STEPS (EXECUTE IN ORDER)

## STEP 1 — INITIALIZE EXPO APP

Inside repo root:

cd apps/client

If not already initialized properly:

npx create-expo-app@latest .

Choose:

* TypeScript
* blank template

If already initialized:

→ VERIFY structure is clean and minimal

---

## STEP 2 — CLEAN TEMPLATE

Ensure:

* No demo components
* No unused assets
* Minimal entry point

You must use expo-router, so:

* REMOVE App.tsx
* DO NOT use legacy entry

---

## STEP 3 — INSTALL REQUIRED DEPENDENCIES

Install:

* react-native-web
* react-dom
* expo-router
* babel-plugin-module-resolver

---

## STEP 4 — CONFIGURE ROUTER

Create:

apps/client/app/
_layout.tsx
index.tsx

Set:

package.json:
"main": "expo-router/entry"

---

## STEP 5 — MONOREPO INTEGRATION (CRITICAL)

You MUST make this work:

import { storageService } from "@core/services/storageService"

Tasks:

* configure tsconfig paths (extend root)
* configure babel module resolver
* ensure Metro resolves packages

If this fails:

STOP and fix before continuing

---

## STEP 6 — CREATE MINIMAL SCREEN

index.tsx must render:

* View
* Text

No styling system yet.

Example structure:

<View>
  <Text>KieliTaika RN App</Text>
</View>

---

## STEP 7 — VERIFY RUNTIME

You MUST run:

* Web: npx expo start --web
* Android: emulator or device

Verify:

* App renders
* No runtime errors
* Navigation works (basic route load)

---

## STEP 8 — ADD SECOND ROUTE

Create:

app/auth.tsx

Add simple navigation from index → auth using expo-router

Verify navigation works on:

* Web
* Android

---

# ✅ PASS CONDITIONS (STRICT)

You must confirm ALL:

✔ Expo app runs on web
✔ Expo app runs on Android
✔ expo-router navigation works
✔ @core imports resolve correctly
✔ No dependency or bundler errors
✔ No usage of old frontend code

---

# ❌ FAILURE CONDITIONS (STOP IMMEDIATELY)

If any occur, STOP and report:

❌ Cannot import from @core
❌ App runs only on web but not Android
❌ Metro resolution issues unresolved
❌ Using code from old frontend/
❌ Introducing UI system prematurely

---

# 📦 OUTPUT REQUIREMENTS

You must provide:

1. Exact file tree of apps/client
2. All modified config files:

   * package.json
   * tsconfig.json
   * babel.config.js
3. Confirmation of:

   * web runtime success
   * android runtime success
4. Example of successful @core import
5. Screens implemented (index + auth)

---

# 🧠 EXECUTION PRIORITY

Correctness > completeness

Do NOT proceed to UI system (Phase 3)

Do NOT implement styling

Do NOT build real features

This phase is COMPLETE only when runtime is stable.

---

# 🔁 NEXT PHASE (DO NOT START)

Phase 3 — UI System (tokens, primitives, layout)

You are NOT allowed to start this yet.

---

# FINAL INSTRUCTION

You are building the execution surface of a deterministic system.

Do not improvise.
Do not expand scope.
Do not optimize.

Follow steps exactly.
