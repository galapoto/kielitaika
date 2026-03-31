# APPLICATION SHELL + NAVIGATION + STATE ORCHESTRATION

## 1. Navigation system implemented

The client runtime now uses a single shell-owned navigation model.

Files:

* `apps/client/state/navigationModel.ts`
* `apps/client/state/appFlowStore.ts`
* `apps/client/state/AppShell.tsx`

Implemented:

* screen registry for `auth`, `home`, `learning`, and `yki-practice`
* canonical route mapping for each screen
* stack-shaped navigation state managed in Zustand
* shell-owned screen resolution from requested route entrypoints

Route entry files now pass requested intent into the shell instead of rendering route modules directly:

* `apps/client/app/index.tsx`
* `apps/client/app/auth.tsx`
* `apps/client/app/learning.tsx`
* `apps/client/app/yki-practice.tsx`

## 2. AppShell orchestration changes

`AppShell.tsx` is now the only source file that uses `expo-router`.

It now owns:

* session hydration
* route intent resolution
* guarded navigation decisions
* logout transition handling
* stack-aware back navigation
* controlled error rendering

The shell validates required governed state before entering protected flows and never allows route-level silent fallback.

## 3. Route guards added

Guards are enforced for:

* authentication
* governed learning state readiness
* YKI session integrity

Behavior:

* unauthenticated access to protected routes blocks with `AUTH_REQUIRED`
* invalid learning state blocks with `LEARNING_STATE_INVALID`
* missing or invalid YKI sessions block with `YKI_SESSION_REQUIRED` or `YKI_SESSION_INVALID`

Controlled error rendering is provided by:

* `packages/ui/screens/ApplicationErrorScreen.tsx`

## 4. YKI session enforcement

YKI entry is now shell-gated.

Rules enforced:

* direct `/yki-practice` access requires an existing validated session
* home-to-YKI transition may establish a governed session through the shell only
* invalid stored session is cleared and blocked
* screen-level session creation path was removed
* playback navigation remains backend-driven through current task state and advance actions only

## 5. State authority model

Authority is now explicit:

* backend: source of truth for learning state, governance state, and YKI session progression
* service validation layer: contract enforcement
* route state: controlled rendering state only
* UI screens: presentation only

The UI no longer decides protected transitions or creates new navigation paths independently.

## 6. Invalid transition handling

Invalid transitions now resolve to a controlled shell-owned error screen instead of silent redirection inside route modules.

Handled cases:

* protected route without auth
* learning route without governed validated state
* YKI route with missing or invalid session state
* invalid stored YKI session reset before replay

## Post-Run Audit

### A. Violations Found

* `MAJOR` `apps/client/app/yki-practice.tsx`: route entry still bypassed `AppShell`
* `MAJOR` `apps/client/state/HomeRoute.tsx`: logout transition was still locally owned instead of shell-owned
* `MAJOR` `packages/ui/screens/YkiPracticeScreen.tsx`: screen still exposed a direct session-start action outside shell orchestration

### B. Fixes Applied

* moved every app route entry through `AppShell` requested-screen resolution
* moved logout transition control into `AppShell`
* removed `expo-router` usage from route modules other than `AppShell`
* added central guard error UI
* removed screen-level YKI session start path
* added explicit navigation registry and canonical stack state

### C. Remaining Risks

* the stack model is intentionally minimal and canonical rather than a full general-purpose navigator history
* built web artifacts under `apps/client/dist-web-prod` still contain compiled router code, but source-level routing ownership is centralized in `AppShell`

### D. System State

* `✅ controlled navigation shell`
