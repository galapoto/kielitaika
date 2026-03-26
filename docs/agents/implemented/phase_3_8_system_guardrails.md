# PHASE 3.8 — SYSTEM HARDENING & GUARDRAILS

## 1. PURPOSE

Prevent regression.

System is now working.
Goal is to ensure it STAYS correct.

---

## 2. GUARDRAIL CATEGORY A — FRONTEND CONTRACT LOCK

### Rule

Frontend MUST NOT:

- reshape API responses
- infer missing fields
- create fallback logic

---

### Enforcement

Create:

frontend/app/services/contractGuard.ts

---

### Behavior

Validate ALL responses:

- must contain ok/data/error/meta
- reject invalid shape

---

## 3. GUARDRAIL CATEGORY B — YKI FLOW LOCK

### Rule

Frontend MUST NOT:

- control navigation
- track local progression

---

### Enforcement

Add runtime assertion:

- if screen changes without backend update → error

---

## 4. GUARDRAIL CATEGORY C — SESSION SAFETY

### Rule

Session restore MUST:

- only use backend-provided fields

---

### Enforcement

- reject incomplete session payloads
- do not cache partial sessions

---

## 5. GUARDRAIL CATEGORY D — ERROR VISIBILITY

### Rule

ALL errors must be visible and structured.

---

### Enforcement

- global error boundary
- no silent failures
- no swallowed exceptions

---

## 6. GUARDRAIL CATEGORY E — API USAGE

### Rule

Components MUST NOT call fetch directly.

---

### Enforcement

- static scan for fetch usage outside services/

---

## 7. TEST GUARDRAILS

Create automated checks for:

- response shape
- session persistence
- YKI sequencing

---

## 8. OUTPUT REQUIREMENTS

Agent must produce:

### 8.1 contractGuard.ts

### 8.2 runtime assertions (YKI)

### 8.3 error boundary

### 8.4 validation scripts

---

## 9. FAILURE RULE

If system allows:

- contract bypass
- silent failure
- frontend-controlled flow

→ SYSTEM REGRESSION
