
# KIELITAIKA — PHASE 4 EXECUTION (DAILY PRACTICE ENGINE)

You are implementing the Daily Practice system.

This is NOT a UI task.

This is a **deterministic exercise engine**.

---

# OBJECTIVE

Create a system that:

- generates structured exercises
- evaluates answers deterministically
- provides clear feedback
- tracks session progress

---

# TARGET AREAS

Frontend:
- packages/ui/screens/DailyPracticeScreen.tsx
- apps/client/features/daily-practice/*

Backend:
- apps/backend/practice/*
- apps/backend/api/*

---

# IMPLEMENTATION SCOPE

## 1. EXERCISE TYPES (MINIMUM SET)

Implement:

- vocabulary selection (word → meaning)
- sentence completion
- basic grammar selection

Each must have:

- clearly defined input
- expected answer
- deterministic evaluation

---

## 2. DETERMINISTIC EVALUATION

Rules:

- same input → same result
- no AI/random scoring
- strict correctness check

Return:

- correct / incorrect
- expected answer
- explanation (if available)

---

## 3. SESSION MODEL

Each practice session must track:

- exercises served
- answers submitted
- correctness
- completion state

---

## 4. FEEDBACK SYSTEM

After each answer:

- immediate result (correct / incorrect)
- correct answer shown
- optional explanation

---

## 5. PROGRESSION TRACKING (BASIC)

Track:

- number of exercises completed
- accuracy
- session completion

Do NOT implement long-term analytics yet (Phase 9)

---

## 6. UI BEHAVIOR

- one exercise at a time
- forward-only flow
- no backtracking (same philosophy as YKI)

---

# HARD RULES

- NO random exercise logic
- NO AI-generated evaluation
- MUST be deterministic
- MUST use governed UI system
- MUST not introduce parallel state systems

---

# VALIDATION

Run:

- backend tests
- tsc --noEmit
- npm run controlled_ui_contract_validation

---

# OUTPUT FORMAT

1. Files created
2. Files modified
3. Engine behavior implemented
4. Validation results
5. Errors encountered
6. Success / failure

---

# AUDIT

AUDIT

A. Determinism
- Same input → same evaluation: ✅/❌

B. Exercise Integrity
- Exercises clearly defined: ✅/❌
- No ambiguity: ✅/❌

C. UX Flow
- One-at-a-time flow: ✅/❌
- Clear feedback: ✅/❌

D. State Tracking
- Session state consistent: ✅/❌

E. Violations
- List or "None"

SYSTEM STATE
- Practice Engine Quality: Low / Medium / High
