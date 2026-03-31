# PHASE 3C — FULL UI SYSTEM CONVERGENCE (WITH POST-RUN AUDIT)

You are continuing from a system that already has:

* governed backend
* enforced UI contract layer
* RN-first UI primitives
* partial screen migration complete

Your task is NOT to add features.

Your task is to:

> **eliminate all legacy UI paths and enforce a single UI system across the entire repository**

---

# PRIMARY OBJECTIVE

Move from:

> partially structured UI (dual systems)

TO:

> **fully unified UI system (single primitive-based architecture)**

---

# NON-NEGOTIABLE RULES

1. NO direct use of React Native primitives in feature screens
2. NO StyleSheet usage in feature screens
3. NO duplicate layout systems
4. NO fallback to legacy components
5. ALL UI must use primitives from packages/ui/primitives

Violation = architecture failure

---

# PHASE TASKS (STRICT ORDER)

---

## 1. IDENTIFY ALL LEGACY UI FILES

You MUST scan:

```id="c1"
apps/client/features/
```

---

### Identify files using:

* View
* Text
* StyleSheet
* custom layout logic

---

---

## 2. MIGRATE OR REMOVE EACH FILE

### Target files (minimum from audit):

* LearningHome.tsx
* ModuleView.tsx
* UnitView.tsx
* PracticeView.tsx
* YkiFeature.tsx
* YkiPracticeFeature.tsx

---

### For EACH file:

EITHER:

* fully migrate to primitives

OR

* remove if no longer used

---

---

## 3. REPLACE ALL LAYOUT WITH PRIMITIVES

---

### Replace:

* View → Stack / Row / Card
* Text → Text (primitive)
* Input → Input (primitive)
* Button → Button (primitive)

---

---

## 4. REMOVE STYLESHEET USAGE

---

### MUST:

* delete StyleSheet blocks
* replace with token-based styling

---

---

## 5. ENFORCE TOKEN USAGE

---

### Validate:

* spacing only from tokens
* typography only from tokens
* no inline arbitrary values

---

---

## 6. REMOVE DEAD UI PATHS

---

### Remove:

* unused components
* unused feature screens
* duplicated layouts

---

---

## 7. ENSURE CONTRACT FLOW IS PRESERVED

---

### MUST remain:

```id="c2"
Backend → Validation → State → UI (primitives)
```

---

### UI must:

* not mutate data
* not compute decisions
* not bypass validation

---

---

## 8. GLOBAL ENFORCEMENT CHECK

After migration:

There must be:

* ZERO raw RN usage in feature screens
* ZERO StyleSheet in feature screens
* ZERO legacy layout system

---

---

# OUTPUT FORMAT

---

### 1. Files migrated

### 2. Files removed

### 3. Legacy patterns eliminated

### 4. Primitive usage coverage

### 5. Token usage verification

### 6. Data flow verification

---

---

# POST-RUN AUDIT (MANDATORY)

---

## AUDIT OBJECTIVE

Verify:

> UI system is fully unified and no legacy paths remain

---

## AUDIT CHECKS

---

### 1. LEGACY UI DETECTION

* any View/Text usage in feature screens → VIOLATION
* any StyleSheet usage → VIOLATION

---

---

### 2. PRIMITIVE ENFORCEMENT

* all layout via Stack/Row/Card
* no custom layout logic

---

---

### 3. TOKEN ENFORCEMENT

* spacing only from tokens
* no arbitrary values

---

---

### 4. CONTRACT SAFETY

* validation layer still enforced
* no UI-side logic

---

---

### 5. CONSISTENCY

* same layout patterns across all screens
* no duplicated structures

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

* ❌ fragmented UI
* ⚠️ partially unified
* ✅ fully unified UI system

---

# FINAL RULE

You are not improving visuals.

You are eliminating:

> **all architectural inconsistency in the UI layer**

At the end of this phase:

> there must be only ONE way to build UI in this system

---

Proceed with migration, then run the audit immediately.
