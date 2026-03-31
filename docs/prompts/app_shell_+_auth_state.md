You are now entering:

PHASE 4 — APPLICATION SHELL + AUTH + STATE INTEGRATION

This is the first phase where the app becomes functional.

---

# 🔒 CONTEXT (MANDATORY)

System state:

* Backend: COMPLETE
* Learning + decision + effectiveness: COMPLETE
* Expo runtime: COMPLETE (web verified)
* UI system: COMPLETE (tokens + primitives + layout)
* Screens: minimal (Auth screen exists)

Missing:

* real authentication flow
* global app state
* backend integration from RN
* navigation driven by state

---

# 🚫 HARD PROHIBITIONS

You are NOT allowed to:

* Modify backend logic
* Add new learning features
* Modify decision system
* Add YKI flows
* Put business logic inside UI components
* Call fetch or API directly inside screens

All backend interaction MUST go through @core services.

---

# 🎯 OBJECTIVE

Implement:

1. Global auth state (single source of truth)
2. Login flow using backend API
3. Token injection into API client
4. Navigation controlled by auth state
5. Basic home screen after login

This is NOT feature expansion.

This is **system wiring**.

---

# 🧱 STEP 1 — GLOBAL AUTH STATE

Create:

apps/client/state/authStore.ts

Use Zustand.

State must include:

* user
* token
* setAuth(user, token)
* logout()

Rules:

* This is the ONLY source of auth truth in UI
* No duplicate auth state anywhere else

---

# 🧱 STEP 2 — CONNECT API CLIENT TO AUTH

In:

packages/core/api/apiClient.ts

Add:

* setAuthToken(token)
* attach token to Authorization header

Rules:

* API client must remain platform-neutral
* No RN-specific code here

---

# 🧱 STEP 3 — LOGIN FLOW (REAL)

Update:

packages/ui/screens/AuthScreen.tsx

Add:

* local state (email, password)
* call authService (from @core)
* on success:

  * setAuth(user, token)
  * call setAuthToken(token)

Rules:

* UI handles input only
* API logic stays in core
* No direct fetch

---

# 🧱 STEP 4 — APP ROUTING CONTROL (CRITICAL)

Implement auth-based routing:

If user is NOT logged in:
→ show Auth screen

If user IS logged in:
→ show Home screen

Use expo-router layout or conditional routing.

Rules:

* Navigation must be derived from state
* No manual redirects scattered across screens

---

# 🧱 STEP 5 — CREATE HOME SCREEN

Create:

packages/ui/screens/HomeScreen.tsx

Must:

* use primitives + layout only
* display basic user info (from authStore)
* no learning logic yet

---

# 🧱 STEP 6 — CONNECT HOME ROUTE

apps/client/app/index.tsx must:

* read auth state
* render:

  * AuthScreen OR HomeScreen

---

# 🧱 STEP 7 — BASIC SESSION PERSISTENCE

Use:

* AsyncStorage (or abstraction)

Persist:

* token
* user

On app start:

* restore session
* rehydrate authStore

---

# ✅ PASS CONDITIONS (STRICT)

You must confirm:

✔ user can log in via UI
✔ token stored in authStore
✔ API client receives token
✔ navigation switches after login
✔ session persists after reload
✔ no direct API calls in UI
✔ no backend logic in UI

---

# ❌ FAILURE CONDITIONS

STOP if:

❌ multiple sources of auth state
❌ token not injected into API client
❌ UI directly calling fetch
❌ navigation controlled manually in multiple places
❌ business logic inside UI components

---

# 📦 OUTPUT REQUIREMENTS

Provide:

1. authStore.ts implementation
2. updated apiClient.ts (token handling)
3. updated AuthScreen.tsx (login flow)
4. HomeScreen.tsx
5. routing logic (index.tsx or layout)
6. confirmation of working login flow
7. confirmation of session persistence

---

# 🧠 EXECUTION PRIORITY

Correct state flow > UI appearance

Do NOT style extensively

Do NOT add features

Do NOT touch learning system yet

---

# 🔁 NEXT PHASE (DO NOT START)

Phase 5 — Learning + practice + YKI flows

---

# FINAL INSTRUCTION

You are connecting a deterministic backend to a UI.

UI must not make decisions.

State must be centralized.

All behavior must remain traceable.
