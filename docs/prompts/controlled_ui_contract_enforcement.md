# PHASE 3A — CONTROLLED UI CONTRACT ENFORCEMENT AGENT PROMPT

You are working on a system that is already:

* deterministic
* policy-controlled
* governed (approval-based changes)
* auditable (replayable)
* tamper-proof (hash-linked audit chain)

Your task is NOT to add features.
Your task is to ensure that the **frontend cannot violate backend truth**.

---

# PRIMARY OBJECTIVE

Transform the frontend into a **strict rendering layer of governed backend state**.

The UI must:

* not compute
* not infer
* not guess
* not override

It must only:

> **render validated, governed, deterministic backend outputs**

---

# NON-NEGOTIABLE RULES

1. UI MUST NOT contain learning logic
2. UI MUST NOT decide next steps
3. UI MUST NOT mutate policy-related behavior
4. UI MUST NOT render unvalidated responses
5. UI MUST FAIL FAST on invalid data

Any violation is a **system integrity risk**

---

# PHASE TASKS (STRICT ORDER)

---

## 1. RESPONSE VALIDATION LAYER

### Target files:

* apps/client/features/learning/services/learningService.ts
* apps/client/features/yki-practice/services/ykiPracticeService.ts

---

### REQUIREMENT

Every backend response MUST be validated before use.

---

### Validation MUST include:

* required fields present
* no unexpected fields (strict schema)
* governance metadata exists:

  * governance_version
  * policy_version
* decision metadata exists (if applicable)

---

### BEHAVIOR

If validation fails:

* throw CONTRACT_VIOLATION
* do NOT render
* do NOT fallback

---

---

## 2. REMOVE ALL UI-DERIVED LOGIC

### Audit ALL frontend files:

* apps/client/state/
* packages/ui/screens/
* features/ services

---

### REMOVE:

* inferred next steps
* fallback recommendations
* “if missing → generate default” logic
* any local ranking or ordering logic

---

### Replace with:

* direct usage of backend-provided values only

---

---

## 3. GOVERNANCE VISIBILITY LAYER

### Update UI screens:

* LearningScreen
* YkiPracticeScreen

---

### MUST DISPLAY (dev mode at minimum):

* governance_version
* policy_version
* change_reference (if present)

---

### PURPOSE

UI must allow traceability:

> “Which governed version produced this state?”

---

---

## 4. YKI PRACTICE HARD LOCK

### Target:

* packages/ui/screens/YkiPracticeScreen.tsx
* apps/client/state/YkiPracticeRoute.tsx

---

### REQUIREMENTS

* UI must follow backend-provided plan exactly
* no reordering
* no skipping logic
* no recomputation of flow

---

### Treat YKI runtime as:

> **precomputed deterministic playback**

---

---

## 5. UNTRUSTED STATE DETECTION

### Add logic in:

* route state layers
* service response handlers

---

### Conditions for UNTRUSTED:

* missing governance metadata
* response validation failure
* mismatch between expected and received structure

---

### BEHAVIOR

* mark state as invalid
* block rendering
* surface error clearly

---

---

## 6. STRICT DATA FLOW ENFORCEMENT

### Enforce pattern:

Backend → Service → Validation → State → UI

---

### Forbidden patterns:

* UI calling backend directly
* UI mutating response objects
* UI computing derived decisions

---

---

## 7. ERROR HANDLING STANDARDIZATION

### All failures must be categorized:

* CONTRACT_VIOLATION
* TRANSPORT_ERROR
* GOVERNANCE_MISSING

---

### UI must:

* show controlled error state
* not silently recover

---

---

## 8. BACKWARD COMPATIBILITY

### Handle legacy responses:

* mark as:
  → governance_status = "legacy_uncontrolled"

---

### Behavior:

* allowed in dev mode
* flagged clearly
* not treated as fully trusted

---

---

## 9. VALIDATION TESTS (MANDATORY)

You MUST ensure:

---

### Contract Violation Test

* remove governance field → UI must fail

---

### Unknown Field Test

* inject extra field → UI must reject

---

### YKI Determinism Test

* UI renders identical sequence for same backend plan

---

### Untrusted State Test

* simulate mismatch → UI blocks rendering

---

---

# OUTPUT FORMAT

You MUST report:

---

### 1. Files modified

### 2. Validation layer implementation details

### 3. UI logic removed (list of removed behaviors)

### 4. Governance metadata exposure

### 5. YKI lock enforcement behavior

### 6. Untrusted state handling

### 7. Error handling structure

### 8. Edge cases handled

### 9. Verification results

### 10. System state:

* ❌ UI unsafe
* ⚠️ partially controlled
* ✅ UI fully aligned with governed backend

---

# FINAL RULE

You are not improving UI.

You are enforcing:

> **system truth integrity across the frontend boundary**

The frontend must become:

> **incapable of violating backend determinism, governance, or auditability**

No exceptions.

---

Proceed.
