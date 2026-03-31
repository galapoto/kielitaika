# PHASE 3B — RN-FIRST UI SYSTEM FOUNDATION AGENT PROMPT (WITH POST-RUN AUDIT)

You are continuing a system that is already:

* deterministic
* policy-controlled
* governed (approval enforced)
* auditable + replayable
* tamper-proof
* frontend contract-enforced (validated, no UI logic)

Your task is NOT to change behavior.

Your task is to **rebuild the UI system structurally** so it is:

> consistent, RN-first, platform-safe, and incapable of breaking system guarantees

---

# PRIMARY OBJECTIVE

Move from:

> controlled UI (behavior-safe)

TO:

> **structured UI system (behavior-safe + architecture-safe + platform-ready)**

---

# NON-NEGOTIABLE RULES

1. DO NOT bypass validation layer
2. DO NOT introduce UI-side logic
3. DO NOT alter data flow
4. DO NOT introduce implicit layout behavior
5. DO NOT mix web/CSS assumptions into RN

If violated → system integrity risk

---

# TARGET STRUCTURE

All UI must be rebuilt under:

```id="s1"
packages/ui/
```

Using **React Native primitives only**

---

# PHASE TASKS (STRICT ORDER)

---

## 1. DEFINE DESIGN TOKENS (GLOBAL, LOCKED)

### Create:

```id="s2"
packages/ui/theme/tokens.ts
```

---

### MUST INCLUDE:

* spacing scale (STRICT):

  * 4, 8, 16, 24, 32, 40, 48

* typography:

  * font sizes
  * weights
  * line heights

* colors:

  * background
  * surface
  * primary
  * error
  * success

* radius:

  * small, medium, large

---

### RULE:

NO inline styling outside tokens

---

---

## 2. CREATE CORE UI PRIMITIVES

### Create:

```id="s3"
packages/ui/primitives/
```

---

### REQUIRED COMPONENTS:

* ScreenContainer
* Text
* Button
* Card
* Input
* Stack (vertical layout)
* Row (horizontal layout)

---

### RULES:

* no business logic
* no API calls
* no decision-making
* pure visual + layout

---

---

## 3. LAYOUT SYSTEM (STRICT)

### Implement inside primitives:

* spacing ONLY from tokens
* no arbitrary margins/padding
* no percentage-based hacks

---

### ALL layouts must use:

* Stack (vertical)
* Row (horizontal)

---

---

## 4. REBUILD SCREENS USING PRIMITIVES

### Target files:

* packages/ui/screens/LearningScreen.tsx
* packages/ui/screens/YkiPracticeScreen.tsx

---

### REQUIREMENTS:

* remove custom layout logic
* compose only from primitives
* consume validated state only

---

### DO NOT:

* compute next step
* reorder data
* transform backend meaning

---

---

## 5. REMOVE LEGACY UI PATTERNS

### Audit and remove:

* inline styles
* duplicated layout code
* CSS remnants
* browser-specific assumptions

---

---

## 6. RN COMPATIBILITY GUARANTEE

Ensure:

* no DOM APIs
* no window/document usage
* no CSS imports

---

---

## 7. STRICT DATA FLOW PRESERVATION

MUST remain:

```id="s4"
Backend → Validation → State → UI
```

---

### UI MUST:

* render only validated data
* not mutate state
* not infer missing values

---

---

## 8. INTERACTION STANDARDIZATION

All interactions must:

* go through state layer
* trigger backend calls via services
* not mutate UI state directly

---

---

## 9. NO VISUAL GUESSING

UI must not:

* assume missing values
* display placeholders unless explicitly provided
* fabricate content

---

---

# OUTPUT FORMAT (MANDATORY)

After execution, you MUST report:

---

### 1. Files created

### 2. Files modified

### 3. Token system structure

### 4. Primitive components created

### 5. Screens refactored

### 6. Legacy patterns removed

### 7. RN compatibility status

### 8. Data flow verification

---

---

# POST-RUN AUDIT (MANDATORY — RUN AFTER IMPLEMENTATION)

You MUST execute a full audit immediately after implementation.

---

## AUDIT OBJECTIVE

Verify that:

> UI system is structurally correct AND does not violate controlled contract layer

---

## AUDIT CHECKS

---

### 1. TOKEN ENFORCEMENT

* no inline spacing values
* all spacing from token scale
* typography uses token definitions

---

### 2. PRIMITIVE USAGE

* no direct View/Text usage in screens
* all layouts use Stack/Row
* no duplicated layout logic

---

---

### 3. NO UI LOGIC

* no condition-based learning decisions
* no fallback logic
* no derived recommendations

---

---

### 4. VALIDATION INTEGRITY

* UI uses only validated responses
* no bypass of governedResponseValidation

---

---

### 5. YKI DETERMINISM

* UI follows backend plan exactly
* no reordering
* no skipping logic

---

---

### 6. RN PURITY

* no DOM APIs
* no CSS
* no browser assumptions

---

---

### 7. CONSISTENCY

* spacing consistent across screens
* typography consistent
* component reuse enforced

---

---

## AUDIT OUTPUT FORMAT

You MUST report:

---

### A. Violations Found (if any)

* file path
* exact issue
* severity:

  * CRITICAL (breaks system integrity)
  * MAJOR (breaks architecture)
  * MINOR (style inconsistency)

---

### B. Fixes Applied (if auto-fixed)

---

### C. Remaining Risks

---

### D. System State

* ❌ UI unsafe
* ⚠️ partially structured
* ✅ UI system structured + contract-safe

---

# FINAL RULE

You are not designing UI.

You are building:

> **a controlled, deterministic, platform-safe rendering system**

Every visual element must obey:

* structure
* consistency
* backend truth

---

Proceed with implementation, then run the audit immediately.
