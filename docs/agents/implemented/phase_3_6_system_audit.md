
# PHASE 3.6 — FULL SYSTEM INTEGRATION & RUNTIME AUDIT

## 1. PURPOSE

Validate that the ENTIRE system works as a unified platform:

- frontend
- backend
- engine adapter
- websocket layer
- session system

This is NOT a unit test phase.

This is a **real behavior audit**.

---

## 2. REQUIRED RULES

- No mocks
- No stubs
- No simulated responses

Everything must run against:

REAL backend + REAL frontend

---

## 3. TEST CATEGORIES

---

## 3.1 AUTH FLOW

Test:

- login
- token storage
- refresh
- logout

Validate:

- tokens rotate correctly
- session persists after reload

---

## 3.2 CARDS FLOW

Test:

- start session
- answer flow
- session reuse

Validate:

- no duplicate session_id
- answers are consistent

---

## 3.3 ROLEPLAY FLOW

Test:

- create session
- submit multiple turns rapidly
- transcript consistency

Validate:

- no lost turns
- order preserved

---

## 3.4 VOICE FLOW

Test:

- audio recording
- upload
- backend response

Validate:

- correct error handling if unavailable
- no frontend crash

---

## 3.5 YKI EXAM FLOW (CRITICAL)

Test FULL exam:

- start exam
- reading
- listening
- writing
- speaking
- submit

Validate:

- correct section sequencing
- no skipped steps
- answers mapped correctly

---

## 3.6 WEBSOCKET BEHAVIOR

Test:

- connect without token → reject
- connect with token → accept
- error conditions

Validate:

- correct close codes
- structured messages

---

## 3.7 FAILURE SCENARIOS

Test:

- backend down
- engine down
- invalid request

Validate:

- frontend shows correct error
- no crash
- no infinite retry

---

## 3.8 CONCURRENCY (REAL USERS)

Simulate:

- multiple browser tabs
- parallel sessions

Validate:

- no state collision
- no session overwrite

---

## 4. CONTRACT VALIDATION

Verify:

Frontend uses ONLY:

- response.ok
- response.data
- response.error
- response.meta

No custom reshaping allowed.

---

## 5. UI VALIDATION

Check:

- loading states
- error states
- transitions

---

## 6. OUTPUT REQUIREMENTS

Agent must produce:

### 6.1 PASS / FAIL REPORT

Per category.

---

### 6.2 BUG LIST

Format:

- location
- reproduction steps
- expected behavior
- actual behavior

---

### 6.3 CONTRACT VIOLATIONS (if any)

---

## 7. FAILURE RULE

If ANY of these occur:

- frontend logic bypasses contract
- session breaks
- sequencing breaks (YKI)

→ SYSTEM IS INVALID
