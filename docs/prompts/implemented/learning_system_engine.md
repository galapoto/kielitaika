
# KIELITAIKA — PHASE 5 EXECUTION (LEARNING SYSTEM ENGINE)

You are implementing the Learning System.

This is NOT a content dump.

This is a **structured progression engine**.

---

# OBJECTIVE

Create a system that:

- organizes Finnish learning into structured units
- tracks progression through those units
- builds knowledge incrementally

---

# TARGET AREAS

Frontend:
- packages/ui/screens/LearningScreen.tsx
- apps/client/features/learning/*

Backend:
- apps/backend/learning/*

---

# IMPLEMENTATION SCOPE

## 1. CONTENT STRUCTURE (MANDATORY)

Define hierarchy:

- Level (e.g. A1, A2, B1…)
  → Module (e.g. verbs, cases, word order)
    → Lesson (specific topic)
      → Items (examples, exercises, explanations)

This structure MUST be explicit in code.

---

## 2. LESSON MODEL

Each lesson must include:

- explanation (text)
- examples
- optional exercises (simple, deterministic)

No random generation.

---

## 3. PROGRESSION SYSTEM

Track:

- current lesson
- completed lessons
- progress per module

Must be:

- deterministic
- persisted per user

---

## 4. LEARNING FLOW

User experience:

- selects module
- enters lesson
- reads explanation
- sees examples
- optionally answers small exercises
- marks lesson complete

---

## 5. RELATION TO PRACTICE

Learning system must:

- be source of structured knowledge
- NOT duplicate daily practice logic
- but may reuse evaluation rules

---

## 6. STATE MANAGEMENT

Must NOT:

- create parallel state system

Must integrate with:

- existing persistence approach

---

# HARD RULES

- NO AI-generated lessons
- NO random content
- MUST be structured hierarchy
- MUST be deterministic progression
- MUST use governed UI system

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
3. Learning system behavior implemented
4. Validation results
5. Errors encountered
6. Success / failure

---

# AUDIT

AUDIT

A. Structure
- Hierarchy enforced: ✅/❌
- No flat content: ✅/❌

B. Progression
- Trackable progress: ✅/❌
- Deterministic: ✅/❌

C. Content Integrity
- Lessons structured: ✅/❌
- No randomness: ✅/❌

D. System Integration
- No duplication with practice: ✅/❌

E. Violations
- List or "None"

SYSTEM STATE
- Learning System Quality: Low / Medium / High
