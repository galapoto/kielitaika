# PHASE 3.5 — FRONTEND SYSTEM IMPLEMENTATION (STRICT CONTRACT CLIENT)

## 1. PURPOSE

Build the frontend as a **strict consumer of backend contracts**.

The frontend MUST:

- NOT infer behavior
- NOT reshape API data
- NOT bypass contracts

---

## 2. REQUIRED RULES

Must read BEFORE execution:

- docs/rules/system_structure_rule.md
- docs/contracts/api_contract.md
- docs/contracts/session_contract.md
- docs/contracts/voice_contract.md
- docs/contracts/system_orchestration_contract.md

---

## 3. FRONTEND STRUCTURE (MANDATORY)


frontend/
app/
screens/
components/
hooks/
services/
state/
theme/
assets/


---

## 4. CORE PRINCIPLE

Frontend is:

> A rendering engine for backend state

NOT:

- a logic engine
- a decision engine

---

## 5. API INTEGRATION RULE

ALL API calls must go through:


frontend/app/services/


No direct fetch/axios inside components.

---

## 6. RESPONSE HANDLING (STRICT)

Frontend MUST use:


response.ok
response.data
response.error
response.meta


No transformation allowed.

---

## 7. SESSION HANDLING

Frontend must:

- store access_token
- store refresh_token
- auto-refresh on expiration
- preserve session_id

---

## 8. FEATURE IMPLEMENTATION ORDER

### 8.1 AUTH

- login
- register
- session restore

---

### 8.2 DASHBOARD

- user state
- navigation entry points

---

### 8.3 CARDS

- start session
- next card
- answer

---

### 8.4 ROLEPLAY

- create session
- submit turn
- transcript
- review

---

### 8.5 VOICE

- audio recording
- upload
- pronunciation feedback

---

### 8.6 YKI EXAM

CRITICAL:

Must follow backend runtime exactly.

NO UI shortcuts.

---

## 9. YKI FLOW REQUIREMENTS

Frontend MUST:

- display prompt BEFORE questions
- separate reading/listening pages
- enforce exam sequence
- use runtime payload directly

---

## 10. ERROR HANDLING

Frontend must:

- display error.message
- respect error.retryable
- never hide backend errors

---

## 11. FORBIDDEN ACTIONS

- No mock data
- No fallback logic
- No “temporary UI”
- No contract guessing

---

## 12. OUTPUT REQUIREMENTS

Agent must produce:

### 12.1 FULL FILE STRUCTURE

---

### 12.2 FULL CODE

- no placeholders
- no pseudo-code

---

### 12.3 API MAPPING

| Endpoint | Frontend Usage |
|----------|---------------|

---

### 12.4 VALIDATION

- UI loads
- API calls succeed
- flows work end-to-end

---

## 13. FAILURE RULE

If frontend:

- reshapes data
- breaks contract
- bypasses services layer

→ INVALID
