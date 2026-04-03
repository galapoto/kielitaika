# FINAL SYSTEM UNBLOCKING + FULL ANDROID PROOF EXECUTION PROMPT

You are not exploring the system.

You are not debugging randomly.

You are executing a **clinical, deterministic, full-system proof run**.

Your objective is singular:

> Produce a **PASS-level, end-to-end, Android-validated exam execution** using the real device, the real backend, and the real external YKI engine.

Failure to produce a complete lifecycle = FAIL.

---

# 0. NON-NEGOTIABLE RULES

* The Android device MUST be used for all execution
* The external YKI engine MUST be the only source of truth
* Engine test mode MUST be used to control time
* No mock systems, no shortcuts, no simulated UI
* No partial validation is allowed
* Every step must be logged and auditable

---

# 1. SYSTEM PREPARATION

## 1.1 Enforce Single Engine Authority

* Verify backend does NOT use:

  * local session_store
  * fallback exam generators
  * duplicated session logic

* Confirm:
  backend → adapter → external engine ONLY

If any legacy path exists:
→ REMOVE IT
→ FAIL if removal cannot be guaranteed

---

## 1.2 Activate Engine Test Mode

You MUST configure engine test mode such that:

* Listening opens immediately OR within controlled seconds
* Section transitions are deterministic
* Full exam can complete within minutes

Verify:

* deterministic timestamps
* no real-world waiting constraints
* identical results across repeated runs

FAIL if:

* time gating still blocks progression

---

## 1.3 Android Device Binding

* Ensure Android device is connected and recognized
* Ensure app builds and runs on device
* Ensure API base URL resolves from device

Verify endpoints from device:

* /health
* /engine/health
* /api/v1/yki/sessions/start

FAIL if any endpoint is unreachable from device

---

# 2. CRITICAL FIX ENFORCEMENT (MANDATORY)

Before execution, enforce all known fixes:

## 2.1 Duplicate Session Prevention

* No double hydration
* No repeated start calls

## 2.2 Governed Response Validation

* All API responses pass governed validator
* No unvalidated payloads reach UI

## 2.3 In-Flight Request Deduplication

* /sessions/start must be idempotent

## 2.4 Session Integrity

* session_id must remain stable
* session_hash must remain stable

FAIL if:

* any mismatch, duplication, or mutation occurs

---

# 3. FULL EXAM EXECUTION (ANDROID ONLY)

You must execute the entire exam lifecycle on the Android device.

---

## 3.1 Session Start

* Start a new exam session from Android UI
* Capture:

  * session_id
  * start timestamp
  * engine response payload

Verify:

* session created via external engine
* governed validation passed

---

## 3.2 Reading Section

* Load reading content
* Navigate pages as required (no scroll shortcuts)

Verify:

* UI matches contract
* no mixed content (passage vs questions)
* deterministic navigation

---

## 3.3 Listening Section (CRITICAL)

* Ensure listening unlocks via test mode
* Load audio from backend (NOT generated live)
* Execute full playback

STRICT VALIDATION:

* audio loads once
* no duplicate playback
* play → pause → resume → stop works
* no overlapping sounds
* resources released after playback

Simulate:

* app background → foreground
* screen lock/unlock (if possible)

FAIL if:

* audio leaks
* playback duplicates
* crashes or hangs occur

---

## 3.4 Writing / Remaining Sections

* Complete all remaining sections
* Ensure deterministic progression
* Ensure no UI inconsistencies

---

## 3.5 Exam Completion

* Submit exam from Android device
* Verify certification generation

Capture:

* certification payload
* session completion status

FAIL if:

* submission fails
* certification missing
* session remains incomplete

---

# 4. FORENSIC VALIDATION

After execution, validate system integrity:

## 4.1 Session Trace

* full lifecycle recorded
* no missing transitions

## 4.2 Audit Logs

* append-only
* hash chain intact
* no mutation

## 4.3 Determinism Check

* re-run same session in test mode
* verify identical structure/output

---

# 5. SYSTEM-WIDE FAILURE SCAN

Scan entire system for:

* hidden fallback logic
* silent error handling
* race conditions
* duplicate requests
* media lifecycle leaks
* contract drift

Document ALL findings.

---

# 6. OUTPUT REQUIREMENTS

You MUST produce a report at:

docs/audit/final_full_android_pass_run.md

---

## Report MUST contain:

### 1. Execution Summary

* device used
* session_id
* timestamps

### 2. Step-by-Step Validation

* start → reading → listening → completion

### 3. Media Validation Results

* lifecycle correctness
* resource cleanup

### 4. Determinism Proof

* repeated run comparison

### 5. Failure Scan Results

* all detected risks (if any)

### 6. FINAL VERDICT

Only two allowed outcomes:

* PASS → full system proven
* FAIL → include exact blocking reason

---

# 7. HARD FAILURE CONDITIONS

Immediately FAIL if:

* any legacy system is still active
* listening is not fully executed
* Android device is not used
* exam is not completed end-to-end
* certification is not generated
* any nondeterministic behavior is observed

---

# 8. COMPLETION CRITERIA

The task is COMPLETE only when:

* a full exam is executed on Android
* all sections are validated
* certification is produced
* audit logs are intact
* final report states PASS

Anything less = NOT COMPLETE

---

# END OF INSTRUCTIONS
