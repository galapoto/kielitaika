# PHASE 5 — SESSION PERSISTENCE + RECOVERY + OFFLINE SAFETY (WITH POST-RUN AUDIT)

You are continuing from a system that is:

* governed
* deterministic
* auditable
* contract-enforced
* UI-unified
* navigation-controlled

Your task is NOT to add features.

Your task is to:

> **make the system durable across interruptions without breaking determinism or governance**

---

# PRIMARY OBJECTIVE

Move from:

> controlled runtime system

TO:

> **durable, recoverable, interruption-safe system**

---

# NON-NEGOTIABLE RULES

1. Persisted state MUST be validated before use
2. UI MUST NOT reconstruct state independently
3. Backend remains source of truth
4. No silent recovery or correction
5. No partial session continuation

Violation = system inconsistency risk

---

# PHASE TASKS (STRICT ORDER)

---

## 1. SESSION STORAGE LAYER

### Create:

* persistent storage for:

  * learning session
  * YKI session
  * navigation state

---

### REQUIREMENTS:

* deterministic serialization
* versioned state format

---

---

## 2. SESSION RESTORE FLOW

On app start:

* check for stored session
* validate against backend
* restore only if valid

---

---

## 3. VALIDATION BEFORE RESTORE

---

### MUST CHECK:

* governance_version
* policy_version
* session integrity

---

### If invalid:

* discard session
* show controlled error

---

---

## 4. RECOVERY RULES

Define strict handling:

---

### Cases:

* missing data
* corrupted session
* outdated version

---

### BEHAVIOR:

* no guessing
* no partial restore
* fail safely

---

---

## 5. YKI SESSION RECOVERY (CRITICAL)

---

### MUST:

* restore exact step
* restore exact sequence
* maintain determinism

---

### MUST NOT:

* skip forward
* replay incorrectly
* re-generate plan

---

---

## 6. OFFLINE HANDLING

---

### Implement:

* detection of offline state
* block unsafe actions
* allow safe read-only rendering

---

---

## 7. STATE CONSISTENCY CHECK

After restore:

* compare with backend
* ensure alignment

---

---

## 8. ERROR SURFACES

---

### Define:

* session_invalid
* session_corrupted
* session_outdated

---

### UI must:

* show controlled error
* not auto-recover

---

---

# OUTPUT FORMAT

---

### 1. Storage system implemented

### 2. Session restore logic

### 3. Validation rules

### 4. Recovery handling

### 5. Offline behavior

### 6. YKI recovery enforcement

---

---

# POST-RUN AUDIT (MANDATORY)

---

## AUDIT OBJECTIVE

Verify:

> system remains deterministic and consistent across interruptions

---

## AUDIT CHECKS

---

### 1. PERSISTENCE VALIDATION

* stored data validated before use
* no direct usage of raw stored state

---

---

### 2. RESTORE SAFETY

* invalid sessions rejected
* no partial restore

---

---

### 3. BACKEND ALIGNMENT

* restored state matches backend

---

---

### 4. YKI DETERMINISM

* session resumes at exact step
* no duplication or skipping

---

---

### 5. OFFLINE SAFETY

* unsafe actions blocked
* UI does not proceed blindly

---

---

### 6. CONTRACT PRESERVATION

* validation layer still enforced
* no bypass during restore

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

* ❌ unsafe persistence
* ⚠️ partially durable
* ✅ fully durable system

---

# FINAL RULE

You are not adding persistence.

You are enforcing:

> **safe continuity of a governed system across time and interruption**

Every restored state must be:

* valid
* governed
* consistent

---

Proceed with implementation, then run the audit immediately.

