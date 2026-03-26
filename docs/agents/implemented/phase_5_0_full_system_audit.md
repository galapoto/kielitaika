# PHASE 5.0 — FULL SYSTEM IMPLEMENTATION AUDIT

## 1. PURPOSE

Perform a complete, end-to-end audit of the entire KieliTaika system.

This is NOT a feature phase.

This is a **verification phase** to confirm that:

- the system is correct
- the system is consistent
- the system is complete
- the system is production-capable (or clearly identify what blocks it)

---

## 2. SCOPE

The audit MUST cover:

### Backend
- API routes
- services
- adapters
- state engine
- session lifecycle

### Frontend
- screens
- components
- services
- state management
- guardrails

### Integration
- frontend ↔ backend
- websocket layer
- session restore
- runtime flows

### UX
- interactions
- transitions
- feedback (audio + visual)

### Performance
- concurrency behavior
- latency
- memory usage

---

## 3. CORE AUDIT PRINCIPLES

- No assumptions
- No skipping
- No “it looks fine”

Everything must be:

> **verified, not assumed**

---

## 4. AUDIT SECTIONS

---

# 4.1 ARCHITECTURE VALIDATION

Check:

- correct folder structure
- no leftover legacy files
- no duplicated logic across layers

Validate:

- backend layering (api → services → core/adapters)
- frontend layering (services → state → UI)

---

# 4.2 CONTRACT VALIDATION

Verify:

- ALL API responses follow:
  - ok
  - data
  - error
  - meta

Check:

- no frontend reshaping
- contractGuard is enforced everywhere

---

# 4.3 STATE & SESSION VALIDATION

Check:

- session creation
- session persistence
- session restore
- session expiration

Verify:

- roleplay lifecycle (created_at, expires_at, status)
- auth lifecycle (token + refresh)
- no stale or invalid sessions reused

---

# 4.4 FLOW VALIDATION (CRITICAL)

Test FULL flows:

### Auth
- register
- login
- refresh
- logout

### Cards
- start session
- answer flow
- session reuse

### Roleplay
- create
- multiple turns
- transcript consistency
- restore after reload

### Voice
- mic start/stop
- upload
- error handling

### YKI EXAM (STRICT)

- start exam
- reading → questions
- listening → questions
- writing
- speaking
- submit

Validate:

- no skipping
- no frontend-controlled progression
- backend is sole authority

---

# 4.5 UX VALIDATION

Check:

### Cards
- flip interaction exists
- smooth transition
- no layout jump

### YKI
- text-first layout
- transcript clarity
- screen transitions animate correctly

### Microphone
- responsive
- correct visual states
- consistent error display

### Errors
- visible
- non-intrusive
- consistent across app

### Audio
- tap sounds
- mic sounds
- error/success sounds
- no overlap spam

### Backgrounds
- correct per screen
- no flicker
- no performance impact

---

# 4.6 PERFORMANCE VALIDATION

Re-check:

- latency under load
- concurrency stability
- memory usage

Confirm:

- state engine improvements hold
- no regression from UX additions

---

# 4.7 GUARDRAILS VALIDATION

Verify:

- no direct fetch outside apiClient
- contractGuard active
- invalid responses rejected
- no silent failures

---

# 4.8 CODE QUALITY & CONSISTENCY

Check:

- no dead code
- no unused services
- no duplicated logic
- consistent naming and structure

---

# 4.9 FAILURE SCENARIOS

Test:

- backend down
- engine down
- invalid requests
- expired sessions

Verify:

- correct error display
- no UI freeze
- no crash

---

# 5. OUTPUT REQUIREMENTS

The agent MUST produce a document:
/home/vitus/kielitaika/docs/audit/full_system_audit.md


---

## The document MUST include:

### 5.1 EXECUTIVE SUMMARY

- system status: VALID / PARTIAL / INVALID
- production readiness: YES / NO

---

### 5.2 PASS / FAIL TABLE

For each section:

| Area | Status | Notes |

---

### 5.3 DETAILED FINDINGS

For EACH issue:

- location (file + line if possible)
- description
- reproduction steps
- expected behavior
- actual behavior

---

### 5.4 CONTRACT VIOLATIONS (if any)

Explicit list.

---

### 5.5 UX DEFICIENCIES

Not bugs—experience issues.

---

### 5.6 PERFORMANCE SUMMARY

- latency numbers
- concurrency results
- memory observations

---

### 5.7 PRIORITIZED FIX LIST

Categorized:

- Critical (blocks production)
- High
- Medium
- Low

---

## 6. FAILURE RULE

If audit:

- skips any section
- assumes correctness without testing
- omits reproduction steps

→ INVALID AUDIT

---

## 7. FINAL GOAL

After this audit, there must be:

> **zero ambiguity about system readiness**

The result must clearly answer:

- Is the system production ready?
- If not, exactly why?
- What must be fixed, in order?
