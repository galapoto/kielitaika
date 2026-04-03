# FINAL ANDROID AUTOMATED EXECUTION + FORENSIC INSTRUMENTATION PROMPT

You are executing the **final production proof run**.

This is NOT a manual test.

This is a **fully automated, instrumented, deterministic Android execution** using a real device.

Your objective:

> Produce a **PASS-level full exam completion with certification**, or identify the exact failure point with forensic precision.

---

# 0. NON-NEGOTIABLE RULES

* MUST use Android device (no emulator-only proof)
* MUST use automation framework:

  * Detox (preferred) OR
  * Appium OR
  * React Native Testing Library (with device bridge) OR
  * Robot Framework (mobile)
* MUST execute entire exam lifecycle without human delay
* MUST log every step transition and timing

---

# 1. AUTOMATION SETUP

## 1.1 Select Framework

Preferred order:

1. Detox (React Native native control)
2. Appium (fallback)
3. Robot Framework (if already integrated)

---

## 1.2 Device Binding

* Confirm device connected via ADB
* Confirm app installed and launchable
* Confirm backend + engine reachable from device

---

## 1.3 Instrumentation Hooks (MANDATORY)

You MUST instrument:

### Client-side

* step transitions
* timestamps
* UI state (current section, current step)

### Backend

* session progression
* next_allowed_action
* timing remaining

### Engine

* section transitions
* expiry triggers

---

# 2. EXECUTION MODE CONFIGURATION

## 2.1 Force Test Mode

* mode = "test"
* ensure reduced exam graph active
* ensure timing = ~70 seconds total

---

## 2.2 Execution Speed Mode

* NO delays between actions
* immediate interaction after UI render
* auto-trigger "Next" as soon as allowed

---

## 2.3 Seed Control

Run TWO modes:

### Run A (fixed seed)

* ensures deterministic reproducibility

### Run B (random seed)

* ensures rotation works in execution

---

# 3. FULL AUTOMATED FLOW

---

## 3.1 Launch + Auth

* open app
* complete login automatically
* assert Home reached

---

## 3.2 Start Exam

* trigger YKI exam start
* capture:

  * session_id
  * start timestamp

---

## 3.3 Reading Section

Loop:

* detect passage screen
* trigger "Next"
* answer questions (use dummy valid inputs)
* advance immediately

Log:

* step_id
* timestamp
* duration spent

---

## 3.4 Listening Section (CRITICAL)

* wait for audio load
* trigger playback
* simulate:

  * play
  * pause
  * resume
* complete listening questions

Verify:

* no duplicate playback
* no overlap
* playback completes

---

## 3.5 Writing Section

* input valid text automatically
* submit immediately

---

## 3.6 Speaking Section

* simulate recording start
* simulate recording stop
* submit response

---

## 3.7 Completion

* submit exam
* wait for certification

Verify:

* certification payload returned
* session marked complete

---

# 4. REAL-TIME INSTRUMENTATION

For EVERY step, record:

* section
* step index
* UI state
* backend response
* remaining time
* latency

---

# 5. FAILURE DETECTION

You MUST detect:

## 5.1 Timing Drift

* expected vs actual remaining time

## 5.2 Stalled Transitions

* UI not advancing
* backend not updating state

## 5.3 Premature Expiry

* SECTION_EXPIRED before completion

## 5.4 Media Failures

* audio not playing
* audio overlapping
* recording not starting/stopping

---

# 6. RETRY LOGIC

If run fails:

* automatically rerun ONCE
* compare failure point

If failure repeats at same step → deterministic bug

---

# 7. OUTPUT REPORT

Save to:

docs/audit/final_automated_android_execution_report.md

---

## Report MUST include:

### 1. Execution Timeline

* full step-by-step trace

### 2. Section Completion Status

* reading: PASS/FAIL
* listening: PASS/FAIL
* writing: PASS/FAIL
* speaking: PASS/FAIL

### 3. Media Lifecycle Report

* playback correctness
* recording correctness

### 4. Timing Analysis

* expected vs actual durations
* drift detection

### 5. Failure Point (if any)

* exact step_id
* exact timestamp
* root cause hypothesis

### 6. Determinism Check

* fixed seed vs random seed comparison

### 7. FINAL VERDICT

ONLY:

* PASS → full lifecycle completed + certification generated
* FAIL → include exact blocking step

---

# 8. HARD FAILURE CONDITIONS

FAIL immediately if:

* exam not completed end-to-end
* certification not generated
* automation cannot progress steps
* timing expires before completion
* Android device not used

---

# 9. COMPLETION CRITERIA

Task is COMPLETE only when:

* full automated run succeeds
* certification is produced
* logs confirm no hidden failures
* verdict = PASS

---

# END OF INSTRUCTIONS
