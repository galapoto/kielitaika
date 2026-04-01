# 🔒 KieliTaika — Phase 6 MASTER PROMPT (Architecture + System Hardening)

---

## ROLE

You are a **migration enforcement and system hardening agent**.

You are NOT allowed to:

* add new features
* redesign UI
* modify backend or engine behavior
* introduce unnecessary abstractions

You are ONLY allowed to:

* enforce architecture
* remove violations
* stabilize runtime behavior
* guarantee system integrity

You must behave as a **fail-closed system**.

If something is unclear → mark as **UNDEFINED**
If something violates rules → mark as **VIOLATION**

---

# 🎯 OBJECTIVE

Bring the system to:

### ✅ Phase 6 COMPLETE (TRUE COMPLETION)

Meaning:

* architecture is clean and enforced
* runtime is stable under stress
* system is deterministic
* no hidden failure points remain
* safe for Phase 7 (cutover)

---

# 🚫 HARD CONSTRAINTS

DO NOT:

* change backend speaking logic
* change evaluation rules
* modify YKI engine
* introduce STT
* redesign UI

DO:

* move files
* fix imports
* enforce boundaries
* audit entire system (not just speaking)

---

# 🧩 PART A — ARCHITECTURE NORMALIZATION

---

## 1. REMOVE FEATURE-LEVEL VIOLATIONS

### ❌ FORBIDDEN

```
apps/client/features/
```

### ✅ TARGET STRUCTURE

```
packages/ui/
  screens/
  hooks/

packages/core/
  services/
  audio/
  storage/
  config/
```

---

## 2. MOVE SPEAKING SYSTEM FILES

Move:

```
apps/client/features/speaking/components/SpeakingPracticeExperience.tsx
→ packages/ui/screens/speaking/

apps/client/features/speaking/hooks/useSpeakingPractice.ts
→ packages/ui/hooks/

apps/client/features/speaking/services/speakingPracticeService.ts
→ packages/core/services/
```

---

## 3. UPDATE IMPORTS

* Use ONLY:

  * `@core/...`
  * `@ui/...`

* ❌ No cross-package relative imports

---

## 4. DELETE OLD DIRECTORY

```
apps/client/features/speaking/
```

No backup. No archive.

---

## 5. ENFORCE CORE PURITY

Inspect:

```
packages/core/services/*
```

### MUST NOT CONTAIN:

* React
* hooks
* JSX
* navigation
* expo APIs

If found → FIX

---

# 🧩 PART B — SYSTEM-WIDE HARDENING (CRITICAL)

---

## 6. FULL CODEBASE AUDIT

Search for:

* setTimeout / setInterval
* window / document
* localStorage
* direct fetch (outside apiClient)
* Audio.Sound usage outside audioManager

Classify ALL:

* SAFE
* VIOLATION

Fix ALL violations.

---

## 7. TIMER SAFETY (GLOBAL)

### RULE:

NO raw timers allowed

### REQUIRED:

Use:

```
packages/core/utils/timerSafe.ts
```

OR enforce cleanup:

```
useEffect(() => {
  const t = setInterval(...);
  return () => clearInterval(t);
}, []);
```

---

## 8. LIFECYCLE STANDARDIZATION

Apply to ALL screens:

* Speaking
* YKI
* Roleplay
* Practice

### REQUIRED:

* useFocusEffect where needed
* cleanup on blur/unmount
* no duplicated effects

---

## 9. AUDIO SAFETY SYSTEM

### RULE:

ALL audio must go through:

```
packages/core/audio/audioManager.ts
```

### REQUIRED:

* prevent overlapping playback
* stop audio on screen exit
* deterministic playback

### TEST:

* rapid navigation
* repeated play taps

---

## 10. STORAGE STANDARDIZATION

### FORBIDDEN:

* localStorage
* direct AsyncStorage

### REQUIRED:

```
packages/core/storage/storageService.ts
```

---

## 11. ERROR BOUNDARY SYSTEM

### REQUIRED FILE:

```
packages/ui/system/ErrorBoundary.tsx
```

### MUST:

Wrap entire app:

```
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### CLASSIFY ERRORS:

* CONTRACT_ERROR
* TRANSPORT_ERROR
* RUNTIME_ERROR

---

## 12. ENV CONFIG CENTRALIZATION

Create if missing:

```
packages/core/config/env.ts
```

### NO HARDCODED:

* API URLs
* audio endpoints

Use:

```
env.API_URL
```

---

## 13. NAVIGATION CONSISTENCY

Ensure:

* no stale screen state
* no manual overrides of session logic
* navigation driven by state

---

# 🧩 PART C — SYSTEM-LEVEL DETERMINISM

---

## 14. API CONTRACT ENFORCEMENT

Verify ALL services:

* use apiClient
* pass through governedResponseValidation

### REQUIRED:

* NO direct fetch
* NO unvalidated responses

---

## 15. GLOBAL SYSTEM AUDIT (ALL MODULES)

Audit ALL:

* Speaking
* YKI
* Cards
* Roleplay
* Auth
* Payments

Check:

* lifecycle safety
* API correctness
* state consistency

---

## 16. STRESS TESTING (MANDATORY)

Simulate:

* rapid navigation
* repeated button clicks
* session interruptions
* audio overlap
* screen switching mid-process

System MUST NOT:

* crash
* leak
* duplicate effects

---

# 🧩 PART D — PLATFORM SAFETY

---

## 17. PLATFORM AUDIT

Search entire repo:

* window
* document
* localStorage
* navigator

### RESULT MUST BE:

```
0 occurrences
```

---

## 18. TEST MATRIX

### WEB:

* navigation
* speaking
* audio
* session flow

### ANDROID:

* recording works
* playback works
* navigation stable

---

## 19. VALIDATION COMMANDS

Run:

```
python3 -m unittest discover -s apps/backend/tests
tsc --noEmit
npm run controlled_ui_contract_validation
```

---

# 🧾 OUTPUT FORMAT (STRICT)

Return EXACTLY:

1. Files moved
2. Files modified
3. Files deleted
4. Violations found and fixed
5. Validation results
6. Stress test results
7. Remaining risks (if any)
8. Final system state

---

# ✅ SUCCESS CRITERIA (ALL MUST PASS)

### Architecture

✔ no feature-level folders
✔ clean separation (core vs ui)

### Runtime

✔ speaking works unchanged
✔ no crashes
✔ no memory leaks

### System Integrity

✔ lifecycle safe
✔ timer safe
✔ audio safe
✔ navigation safe
✔ error safe

### Determinism

✔ API responses validated
✔ no silent failures

### Platform

✔ web works
✔ android works
✔ zero browser APIs

---

# ❌ FAILURE CONDITIONS (STOP IMMEDIATELY)

* speaking system breaks
* imports unresolved
* core contains UI logic
* audio unstable
* navigation inconsistent
* any unvalidated API usage

---

# 🔒 FINAL RULE

If ANY condition is not met:

DO NOT PROCEED TO NEXT PHASE

---

# END OF MASTER PROMPT
