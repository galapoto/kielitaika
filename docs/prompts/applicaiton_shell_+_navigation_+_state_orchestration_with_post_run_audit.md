# PHASE 4 — APPLICATION SHELL + NAVIGATION + STATE ORCHESTRATION (WITH POST-RUN AUDIT)

You are continuing from a system that is:

* governed
* deterministic
* auditable
* contract-enforced
* UI-structurally unified

Your task is NOT to add features.

Your task is to:

> **build a safe navigation and state orchestration system that cannot violate backend truth**

---

# PRIMARY OBJECTIVE

Move from:

> static controlled UI

TO:

> **controlled application flow system**

---

# NON-NEGOTIABLE RULES

1. Navigation MUST NOT bypass validation
2. Navigation MUST NOT introduce logic
3. UI MUST NOT control state transitions independently
4. All transitions MUST be state-driven
5. No arbitrary screen jumps allowed

Violation = system integrity failure

---

# PHASE TASKS (STRICT ORDER)

---

## 1. DEFINE NAVIGATION MODEL

### Implement RN navigation layer:

* stack-based navigation
* screen registry

---

### REQUIRED SCREENS:

* Auth
* Home
* Learning
* YKI Practice

---

---

## 2. CENTRALIZE ROUTING IN APP SHELL

### Target:

```id="n1"
apps/client/state/AppShell.tsx
```

---

### MUST:

* control all navigation
* receive validated state only
* decide allowed transitions

---

---

## 3. STATE-DRIVEN NAVIGATION

---

### Navigation must depend on:

* validated backend state
* session state (if present)

---

### Example:

* no active YKI session → cannot enter YKI screen
* incomplete data → block navigation

---

---

## 4. ROUTE GUARDS

---

### Implement guards for:

* authentication
* learning state
* YKI session integrity

---

### Behavior:

* invalid access → block + error
* do not auto-correct silently

---

---

## 5. YKI SESSION LOCK

---

### REQUIREMENTS:

* no skipping
* no jumping forward/backward
* no reordering

---

### Navigation must follow:

> backend session progression ONLY

---

---

## 6. REMOVE DIRECT NAVIGATION CALLS

---

### Disallow:

* screen-level navigation logic
* manual route pushes

---

### All navigation must go through:

> AppShell orchestration layer

---

---

## 7. STATE AUTHORITY MODEL

---

### Define clearly:

* backend = source of truth
* UI state = rendering only

---

### UI MUST NOT:

* store critical progression state
* override backend

---

---

## 8. ERROR STATE HANDLING

---

### Define:

* invalid navigation → controlled error screen
* session mismatch → reset or block

---

---

# OUTPUT FORMAT

---

### 1. Navigation system implemented

### 2. AppShell orchestration changes

### 3. Route guards added

### 4. YKI session enforcement

### 5. State authority model

### 6. Invalid transition handling

---

---

# POST-RUN AUDIT (MANDATORY)

---

## AUDIT OBJECTIVE

Verify:

> navigation cannot break determinism, governance, or contract integrity

---

## AUDIT CHECKS

---

### 1. NAVIGATION CONTROL

* no direct navigation from screens
* all routes controlled by AppShell

---

---

### 2. STATE-DRIVEN FLOW

* navigation depends only on validated state
* no UI-derived transitions

---

---

### 3. ROUTE GUARD VALIDATION

* invalid access blocked
* no silent fallbacks

---

---

### 4. YKI SESSION INTEGRITY

* no skipping
* no reordering
* no manual navigation override

---

---

### 5. CONTRACT PRESERVATION

* validation layer still enforced
* no bypass in navigation

---

---

### 6. STATE AUTHORITY

* backend remains source of truth
* UI does not store critical logic

---

---

## AUDIT OUTPUT FORMAT

---

### A. Violations Found

* file
* issue
* severity:

  * CRITICAL
  * MAJOR
  * MINOR

---

### B. Fixes Applied

---

### C. Remaining Risks

---

### D. System State

* ❌ unsafe navigation
* ⚠️ partially controlled flow
* ✅ fully controlled application flow

---

# FINAL RULE

You are not building navigation.

You are enforcing:

> **safe movement through a governed system**

Every transition must be:

* valid
* controlled
* traceable

---

Proceed with implementation, then run the audit immediately.
