You are now entering:

PHASE 3 — REACT NATIVE UI SYSTEM FOUNDATION

This phase builds the UI system that will replace the old web/CSS-based UI completely.

---

# 🔒 CONTEXT (MANDATORY)

Current system state:

* Backend: COMPLETE
* Learning + decision + effectiveness: COMPLETE
* Expo runtime: COMPLETE (web verified)
* Routing: WORKING
* @core integration: WORKING

Missing:

* UI system (tokens, primitives, layout)
* All RN screens
* All user-facing flows

---

# 🚫 HARD PROHIBITIONS

You are NOT allowed to:

* Modify backend logic
* Add new features (learning, YKI, etc.)
* Reuse old frontend components
* Use CSS in any form
* Use React DOM components
* Add business logic into UI package
* Introduce inline styling everywhere

---

# 🎯 OBJECTIVE

Create a reusable, deterministic UI system in:

packages/ui

This system must:

* Work in React Native
* Work on web via react-native-web
* Replace CSS completely
* Enforce consistent spacing, layout, and typography

You are NOT building full app screens yet.

You are building the **UI foundation only**.

---

# 🧱 REQUIRED STRUCTURE

Create:

packages/ui/

theme/
colors.ts
spacing.ts
typography.ts

components/
primitives/
Box.tsx
Text.tsx
Button.tsx
Input.tsx

```
layout/
  Screen.tsx
  Center.tsx
  Section.tsx
```

index.ts

---

# 🧠 STEP 1 — DESIGN TOKENS (MANDATORY FIRST)

Create:

theme/colors.ts
theme/spacing.ts
theme/typography.ts

Rules:

* spacing must follow fixed scale (4, 8, 16, 24, 32)
* no random numbers allowed later
* no inline font sizes later

---

# 🧠 STEP 2 — PRIMITIVES

Create:

Box.tsx
Text.tsx
Button.tsx
Input.tsx

Rules:

* MUST use tokens (colors, spacing, typography)
* MUST NOT contain business logic
* MUST NOT import anything from backend or core services
* MUST be reusable

---

# 🧠 STEP 3 — LAYOUT SYSTEM

Create:

Screen.tsx (root container)
Center.tsx
Section.tsx

Rules:

* MUST use flexbox correctly
* MUST avoid height: 100%
* MUST use flex: 1 for root layouts
* MUST not introduce overflow hacks

---

# 🧠 STEP 4 — FIRST REAL SCREEN (UI TEST)

Create:

packages/ui/screens/AuthScreen.tsx

This screen must:

* use ONLY primitives and layout components
* not use raw View/Text directly (except inside primitives)
* not call backend
* not include logic yet

---

# 🧠 STEP 5 — CONNECT TO APP

Replace:

apps/client/app/auth.tsx

With:

import AuthScreen from "@ui/screens/AuthScreen";

export default AuthScreen;

---

# 🧠 STEP 6 — VERIFY RENDER

Run:

npx expo start --web

Verify:

✔ screen renders
✔ layout is stable
✔ no clipping or overflow issues
✔ no CSS usage
✔ primitives are working

---

# ✅ PASS CONDITIONS (STRICT)

You must confirm:

✔ packages/ui fully created
✔ tokens defined and used
✔ primitives working
✔ layout system working
✔ AuthScreen renders via Expo
✔ no CSS or DOM usage anywhere
✔ no business logic inside UI

---

# ❌ FAILURE CONDITIONS

STOP immediately if:

❌ inline styles used everywhere instead of tokens
❌ UI imports backend or core services
❌ raw View/Text used directly in screens
❌ layout breaks between web and RN
❌ any CSS or DOM-specific code appears

---

# 📦 OUTPUT REQUIREMENTS

You must provide:

1. Full packages/ui file tree
2. All token files
3. All primitive component implementations
4. Layout components
5. AuthScreen implementation
6. Updated apps/client/app/auth.tsx
7. Screenshot or confirmation of successful render

---

# 🧠 EXECUTION PRIORITY

Consistency > appearance

Do NOT try to make it “look good”

Do NOT optimize

Do NOT expand scope

This phase is ONLY about building a stable UI system.

---

# 🔁 NEXT PHASE (DO NOT START)

Phase 4 — App shell + auth + state integration

You are NOT allowed to start this yet.

---

# FINAL INSTRUCTION

You are replacing an unstable CSS-based system with a deterministic UI layer.

Do not improvise.
Do not skip tokens.
Do not mix concerns.

Build the foundation correctly.
