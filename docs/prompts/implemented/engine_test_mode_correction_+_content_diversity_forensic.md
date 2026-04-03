# ENGINE TEST MODE CORRECTION + CONTENT DIVERSITY FORENSIC AUDIT PROMPT

You are executing a **critical system correction and forensic validation**.

Your goal is not partial success.

Your goal is to:

1. FIX the engine test-mode contract so full Android completion becomes possible
2. VERIFY that the system actually contains real, diverse exam and learning content
3. PROVE that content rotation works correctly and is not degenerate

If any of these fail → FINAL VERDICT = FAIL

---

# 0. NON-NEGOTIABLE RULES

* External engine remains the ONLY authority
* Android device must be used for final execution
* No mocks, no shortcuts, no bypassing rules
* All findings must be proven with evidence
* No assumptions about content size — you must measure it

---

# 1. ENGINE TEST MODE FIX (MANDATORY)

## 1.1 Detect Current Violation

Confirm:

* full exam graph ≈ 55 steps
* test mode timing ≈ 10s per section
* full completion impossible

This is a CONTRACT FAILURE and must be corrected.

---

## 1.2 Implement Test-Mode Graph Reduction

When:

```json
"mode": "test"
```

Engine MUST:

* generate a REDUCED exam graph
* preserve schema validity
* preserve section ordering

Required structure:

| Section   | Steps |
| --------- | ----- |
| Reading   | 2–3   |
| Listening | 2–3   |
| Writing   | 1     |
| Speaking  | 1     |

Total steps ≤ 8

---

## 1.3 Align Timing With Graph

* total exam duration: 30–90 seconds
* section durations proportional to steps
* NO premature expiry

---

## 1.4 Determinism Rules

* same seed → same test exam
* different session → different exam (unless seed fixed intentionally)

FAIL if:

* graph still full-sized
* expiry still prevents completion

---

# 2. CONTENT BANK FORENSIC AUDIT (CRITICAL)

You must verify whether the system actually contains real content diversity.

---

## 2.1 Measure Actual Task Bank Size

For each section:

* count total available tasks
* group by:

  * passage_id
  * task_id
  * source

Produce:

* total unique passages
* total unique tasks

---

## 2.2 Detect Degeneracy

Check:

* how many unique passages are actually selectable
* whether filtering reduces pool to 1–2 items

FAIL if:

* effective pool size < 5 for any section
* or same passage appears >80% of runs

---

## 2.3 Rotation Verification

Run:

* ≥ 10 consecutive session generations

Record for each:

* selected passages
* selected tasks

Verify:

* variation across runs
* no fixed repetition

FAIL if:

* same exam repeats
* same passages dominate
* no variation observed

---

## 2.4 Randomness / Selection Audit

Inspect selection logic:

* is randomness seeded?
* is seed constant?
* is selection deterministic without variation input?

Check:

* sorting bias
* first-item selection bugs
* filtering order bias

---

## 2.5 Content Availability Truth Check

You must answer with proof:

* Does the system actually have enough content?
* Or is the claimed “bank” not real?

Possible outcomes:

1. Large bank exists but selection is broken
2. Bank is small → rotation impossible
3. Filtering logic collapses diversity

---

# 3. CARD SYSTEM DIVERSITY AUDIT

Apply same audit to:

* vocabulary cards
* phrases
* learning system

Check:

* total card count
* uniqueness
* repetition rate

FAIL if:

* same cards repeatedly shown
* effective pool is too small
* selection logic biased

---

# 4. FIX CONTENT ROTATION (IF BROKEN)

If rotation is broken, you MUST implement:

### 4.1 Proper Selection Strategy

* shuffle pool before selection OR
* random sampling without replacement

### 4.2 Anti-Repetition Mechanism

* avoid last-used items
* enforce diversity window

### 4.3 Seed Handling

* session-based randomness
* not globally fixed seed

---

# 5. FULL ANDROID PROOF RUN (AFTER FIXES)

You MUST:

1. Start session on Android
2. Complete full exam (test mode)
3. Execute:

   * reading
   * listening (full audio lifecycle)
   * writing
   * speaking
4. Submit exam
5. Generate certification

---

# 6. VALIDATION REQUIREMENTS

## 6.1 Media

* audio plays once
* no overlap
* proper cleanup

## 6.2 Session Integrity

* no duplication
* no mutation
* consistent session state

## 6.3 Determinism

* test mode reproducible when needed
* variation across sessions when not seeded

---

# 7. OUTPUT REPORT

Save to:

docs/audit/final_engine_fix_and_content_audit.md

---

## Report MUST include:

### 1. Engine Fix Summary

* old vs new behavior
* graph size before/after

### 2. Content Bank Metrics

* number of passages
* number of tasks
* per-section counts

### 3. Rotation Evidence

* 10-run comparison table

### 4. Card System Audit

* counts
* repetition analysis

### 5. Identified Issues

* exact root causes

### 6. Fixes Applied

* selection logic
* randomness
* anti-repetition

### 7. Android Full Execution Proof

* session_id
* completion proof
* certification proof

### 8. FINAL VERDICT

Only allowed:

* PASS → system fully validated
* FAIL → include exact blocking cause

---

# 8. HARD FAILURE CONDITIONS

FAIL immediately if:

* test mode still cannot complete exam
* content bank is too small
* same passage repeats across runs
* card system lacks diversity
* Android full exam not completed

---

# END OF INSTRUCTIONS
