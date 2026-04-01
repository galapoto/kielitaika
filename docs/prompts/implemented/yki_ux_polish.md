
# KIELITAIKA — PHASE 2 EXECUTION (YKI UX POLISH)

You are executing Phase 2 of the YKI system.

This phase is STRICTLY limited to:
→ UX, interaction, and visual clarity

You are NOT allowed to:
- change backend logic
- change API contracts
- introduce new flows
- modify engine behavior

---

# OBJECTIVE

Transform the current correct YKI runtime into an **exam-grade user experience**.

The system is already functionally correct.

Your job is to make it:
- clear
- stable
- readable
- predictable
- stress-free under exam conditions

---

# TARGET FILES

You MUST work ONLY within:

- packages/ui/screens/YkiExamScreen.tsx
- packages/ui/primitives/*
- packages/ui/tokens/*
- apps/client/state/YkiExamRoute.tsx

DO NOT modify:
- backend
- engine
- API layer

---

# IMPLEMENTATION SCOPE

## 1. BUTTON STATE SYSTEM

All primary actions (Next, Submit, Continue):

Must support:
- disabled (no selection / loading)
- loading (submission in progress)
- locked (after submission)

Must be visually distinct using tokens (NOT inline styles)

---

## 2. TRANSITION CLARITY

Between:
- passage → next passage
- passage → questions
- question → next question
- section → section complete

Add:

- subtle transition state (no flicker)
- stable layout (no jump)

---

## 3. READING UX FIX

Ensure:

- passage is visually isolated
- questions are NOT visible until passage complete
- clear “Next” CTA after passage

No mixed layouts allowed.

---

## 4. LISTENING UX FIX

Ensure:

- audio player is dominant element
- user clearly understands:
  → listen first → then answer

Add:

- playback state indicator
- replay control (if allowed by engine)
- loading state before audio ready

---

## 5. ERROR / RETRY UX

Handle:

- network failure
- session fetch failure
- submission failure

UI must show:

- clear message
- retry option
- no silent failure

---

## 6. COMPLETION STATE

After exam completion:

- UI becomes read-only
- clear completion indicator
- no interactive controls remain

---

# HARD RULES

- NO inline styles
- MUST use token system
- MUST preserve ScreenContainer rules
- MUST not introduce new layout patterns
- MUST not break forward-only flow

---

# VALIDATION (MANDATORY)

Run:

- tsc --noEmit
- npm run controlled_ui_contract_validation
- npm run ui_cutover_enforcement
- npm run ui_token_enforcement

---

# OUTPUT FORMAT

Return:

1. Files modified
2. Behaviors implemented
3. Validation results
4. Errors encountered
5. Success / failure

---

# AUDIT (MANDATORY)

AUDIT

A. UX Clarity
- Passage/question separation: ✅/❌
- Listening clarity: ✅/❌
- Navigation clarity: ✅/❌

B. UI Governance
- Tokens respected: ✅/❌
- Inline styles removed: ✅/❌

C. Interaction Stability
- No flicker: ✅/❌
- No layout shift: ✅/❌

D. Regression
- Flow unchanged: ✅/❌

E. Violations
- List or "None"

SYSTEM STATE
- UX Quality: Low / Medium / High / Exam-grade
