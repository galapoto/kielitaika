
# KIELITAIKA — PHASE 6 EXECUTION (SPEAKING PRACTICE ENGINE)

You are implementing the Speaking Practice system.

This is NOT a chatbot.
This is NOT free-form AI evaluation.

This is a **controlled speaking evaluation system**.

---

# OBJECTIVE

Create a system that:

- presents spoken prompts
- captures user speech
- evaluates it deterministically (rule-based or constrained)
- gives clear, structured feedback

---

# TARGET AREAS

Frontend:
- packages/ui/screens/SpeakingPracticeScreen.tsx
- apps/client/features/speaking/*

Backend:
- apps/backend/speaking/*

Existing:
- TTS system (deterministic)
- audioManager

---

# IMPLEMENTATION SCOPE

## 1. PROMPT SYSTEM

Each speaking task must include:

- text prompt
- expected response (reference)
- optional variations (controlled)

---

## 2. AUDIO OUTPUT (PROMPT)

Use:

- deterministic TTS (existing pipeline)

Rules:

- prompt audio MUST be pre-generated or cached
- no runtime generation during playback

---

## 3. USER INPUT

Capture:

- recorded speech (audio)
OR
- transcribed text (if STT layer exists)

---

## 4. EVALUATION (STRICT)

Evaluation MUST be:

- deterministic
- rule-based or constrained comparison

Allowed:

- exact match
- normalized comparison (case, minor variation)

NOT allowed:

- free AI scoring
- subjective grading

---

## 5. FEEDBACK

Return:

- correct / incorrect
- expected answer
- difference (if possible)

---

## 6. SESSION MODEL

Track:

- prompts served
- attempts
- correctness
- completion state

---

## 7. UX FLOW

- play prompt
- user responds
- submit
- immediate feedback
- next

Forward-only.

---

# HARD RULES

- NO free-form AI evaluation
- NO randomness
- MUST be deterministic
- MUST use existing audio pipeline
- MUST not bypass contracts

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
3. Speaking system behavior implemented
4. Validation results
5. Errors encountered
6. Success / failure

---

# AUDIT

AUDIT

A. Determinism
- Same input → same evaluation: ✅/❌

B. Evaluation Integrity
- No subjective scoring: ✅/❌
- Rules clearly defined: ✅/❌

C. Audio Integration
- Uses deterministic audio pipeline: ✅/❌

D. UX Flow
- Clear prompt → response → feedback: ✅/❌

E. Violations
- List or "None"

SYSTEM STATE
- Speaking System Quality: Low / Medium / High
