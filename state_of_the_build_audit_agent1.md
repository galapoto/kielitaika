# State of the Build — Regression Identification Audit (Agent 1)

Scope: Forensic comparison of current repo state to authoritative intent in `docs/before_regression/`. No fixes, no assumptions beyond documented intent and observable code.

Authoritative sources (ground truth):
- `docs/before_regression/kieli_taika_improved_plan.md`
- `docs/before_regression/Taika_restructuring_1.md`
- `docs/before_regression/Taika_restructuring_2.md`
- `docs/before_regression/Taika Testing Debugging and Fixing 1.md`
- `docs/before_regression/Taika Testing Debugging and Fixing 2.md`
- `docs/before_regression/Taika Testing Debugging and Fixing 3.md`
- `docs/before_regression/Taika Testing Debugging and Fixing 4.md`
- `docs/before_regression/Staging Readiness Verification.md`
- `docs/before_regression/Staging Readiness Verification 1.md`
- `docs/before_regression/roleplay_design_for_nurses.md`
- `docs/before_regression/yki_exam.md`

Document conflict handling:
- Later restructuring documents supersede earlier ones when they conflict.
- Conflicts identified explicitly in relevant sections.

---

## 3.1 Navigation & Information Architecture

### A. Authoritative Intended State
- Sidebar must visually separate YKI, Professional Finnish, and General practice with explicit grouping and iconography (structural requirement, not cosmetic). `docs/before_regression/Taika Testing Debugging and Fixing 1.md:6592-6648`. 
- Navigation must be consolidated (“remove dual stacks + broken screens”). `docs/before_regression/Taika_restructuring_1.md:2427-2430`.

### B. Observed Current State
- Root navigation is a single `createNativeStackNavigator` with all screens registered in one stack; no drawer/sidebar navigation is mounted. `frontend/app/App.js:1-118`.
- There is no sidebar/drawer component in the codebase (`rg "Sidebar"` returns no results). 
- A separate navigation layer (`frontend/app/navigation/MainStack.js` + `TabNavigator.js`) exists but is not used in `App.js`, indicating multiple navigation definitions remain in repo. `frontend/app/navigation/MainStack.js:1-41`, `frontend/app/navigation/TabNavigator.js:1-18`.

### C. Regression Verdict
**REGRESSED** — Severity: **HIGH**

### D. Regression Evidence
- Sidebar-oriented navigation (with category separation and icons) is required by docs but absent from the mounted navigation tree.
- Navigation consolidation requirement conflicts with the presence of multiple navigation stacks (App.js stack + unused MainStack/TabNavigator).

### E. Regression Type
- Navigation regression
- UX flattening
- Mode collapse

---

## 3.2 Product Structure & Mental Model

### A. Authoritative Intended State
- Product shape must be two outcome products: **YKI Pass Plan** and **Work Readiness Plan**; General Finnish is demoted to supporting utilities, not primary navigation. `docs/before_regression/Taika_restructuring_1.md:2167-2204`.

### B. Observed Current State
- Home screen is explicitly structured as three primary sections: General Finnish, Workplace Finnish, and YKI Exam Preparation. `frontend/app/screens/HomeScreen.js:1-8`.
- General Finnish is presented as a full primary section with multiple core activities (grammar, listening, reading, writing, speaking). `frontend/app/screens/HomeScreen.js:36-41`.

### C. Regression Verdict
**REGRESSED** — Severity: **HIGH**

### D. Regression Evidence
- Home screen layout shows General Finnish as a first-class track alongside YKI and Workplace, directly contradicting the “two outcome products” rule.

### E. Regression Type
- Architectural rollback
- Mode collapse
- Professional dilution

---

## 3.3 Professional Finnish (Nursing Benchmark)

### A. Authoritative Intended State
- Profession-specific role-play is explicitly designed around nursing as the benchmark, with TTS-driven setup, mic turn-taking, and realistic workplace dialogue. `docs/before_regression/roleplay_design_for_nurses.md:8-115`.
- Role-play sessions should be realistic workplace interactions, 3–6 turns, with explicit scenario setup and TTS prompts. `docs/before_regression/roleplay_design_for_nurses.md:31-100`.

### B. Observed Current State
- `RoleplayScreen` uses a hardcoded set of generic tasks (e.g., “Shop for coffee”, “Neighbor chat”), not nursing-specific scenarios. `frontend/app/screens/RoleplayScreen.js:25-29`.
- Role-play prompts and goals are locally encoded in the screen (front-end task array and rule map), with no evidence of nursing-specific backend prompt generation. `frontend/app/screens/RoleplayScreen.js:25-59`.

### C. Regression Verdict
**REGRESSED** — Severity: **HIGH**

### D. Regression Evidence
- Professional/nursing scenarios in the authoritative spec are replaced by generic tasks and generic prompts.
- The documented TTS-driven, scenario-specific role-play flow is not present; current flow is a general speaking exercise with fixed tasks.

### E. Regression Type
- Professional dilution
- Feature removal
- UX flattening

---

## 3.4 Spoken & Practice Finnish

### A. Authoritative Intended State
- Speaking must use a single, card-based session engine with one-paragraph cards, no scroll, swipe/auto-advance, and identical interaction model across General, YKI, and Professional tracks. `docs/before_regression/Taika_restructuring_1.md:120-170`.
- A single “Speaking Session UI Engine” must be reused across tracks; swipe cards, no-scroll enforcement, mic always. `docs/before_regression/Taika_restructuring_1.md:2427-2450`.

### B. Observed Current State
- No `SpeakingSessionEngine` (or equivalent) exists in the codebase (`rg "SpeakingSessionEngine"` returns no results).
- General speaking (`GuidedTurnScreen`) is a list/filters-based UI with multiple prompts, filters, and history, implying scrolling and multi-paragraph layouts rather than a single-card flow. `frontend/app/screens/GuidedTurnScreen.js:2-116`.
- Roleplay and speaking are implemented as separate screens with distinct, ad-hoc logic rather than a shared session engine. `frontend/app/screens/RoleplayScreen.js`, `frontend/app/screens/GuidedTurnScreen.js`.

### C. Regression Verdict
**REGRESSED** — Severity: **HIGH**

### D. Regression Evidence
- The shared speaking engine and no-scroll card flow are absent; instead, track-specific and screen-specific implementations exist.

### E. Regression Type
- Architectural rollback
- UX flattening
- Feature removal

---

## 3.5 YKI System (CRITICAL)

### A. Authoritative Intended State
- YKI exam rules: system-timed listening/speaking, candidate-timed reading/writing, no back in listening/speaking, silence counts, official section order immutable. `docs/before_regression/yki_exam.md:1-10`, `docs/before_regression/Taika Testing Debugging and Fixing 4.md:270-276`.
- Timing must be backend-authoritative; no UI-only exam progression. `docs/before_regression/Taika Testing Debugging and Fixing 4.md:270-276`.

### B. Observed Current State
- YKI “exam mode” is a per-screen route param (`ykiMode`) with local behavior toggles (e.g., replay limits). `frontend/app/screens/YKIPracticeListeningScreen.js:27-40`.
- No centralized YKI exam-mode service (`ykiExamModeService`, `useYKIExamMode`) exists in the frontend codebase (`rg` finds none).
- Navigation is not locked by exam mode (YKI practice screen uses a normal back button). `frontend/app/screens/YKIPracticeListeningScreen.js:116-120`.

### C. Regression Verdict
**REGRESSED** — Severity: **CRITICAL**

### D. Regression Evidence
- Centralized exam-mode architecture and backend-authoritative timing are not present in the current frontend; exam behavior is handled by isolated screen parameters.
- Normal navigation affordances remain available during YKI practice/exam screens, conflicting with “no back/skip/retry.”

### E. Regression Type
- Exam invalidation
- Architectural rollback
- Mode collapse

---

## 3.6 TTS & Audio Architecture

### A. Authoritative Intended State
- `/tts` must route explicitly and deterministically, with no hidden fallbacks; TTS must fail loudly (no silent audio). `docs/before_regression/Taika_restructuring_2.md:10681-10835`.
- YKI listening should be explicit about TTS vs recorded audio; infrastructure must not redefine pedagogy. `docs/before_regression/Taika_restructuring_2.md:10697-10833`.

### B. Observed Current State
- Frontend TTS client expects a `/tts` HTTP endpoint and provider routing by mode. `frontend/app/services/tts.ts:1-86`.
- Backend exposes only `/voice/tts-stream` (WebSocket) and uses OpenAI TTS directly, not ElevenLabs/Azure routing. `backend/app/routers/voice.py:46-60`, `backend/app/services/tts_service.py:1-58`.
- Backend router list has no `/tts` HTTP route. `backend/app/main.py:1-31`.

### C. Regression Verdict
**REGRESSED** — Severity: **HIGH**

### D. Regression Evidence
- Documented `/tts` contract and explicit provider routing are not present in backend implementation; frontend expects `/tts`, backend does not supply it.
- Provider routing (ElevenLabs/Azure) is absent in backend logic; current implementation uses OpenAI TTS only.

### E. Regression Type
- Audio system regression
- Architectural rollback

Conflict note:
- `Taika_restructuring_2.md` discusses multiple options (fallback vs explicit provider selection) but explicitly rejects hidden fallbacks (lines 10704-10805). This establishes the required behavior: explicit provider choice, no silent fallback. The current code does not implement either explicit provider selection or a `/tts` contract.

---

## 3.7 Visual System & Backgrounds

### A. Authoritative Intended State
- Speaking screens must use a calm gradient background, remove background images, and avoid text embedded in backgrounds; backgrounds must be owned by speaking mode, not inherited from lesson layouts. `docs/before_regression/Taika_restructuring_1.md:120-129`, `docs/before_regression/Taika_restructuring_1.md:345-399`, `docs/before_regression/Taika_restructuring_1.md:980-989`.

### B. Observed Current State
- Background system still uses image-based backgrounds and layered animations (ImageBackground + gradients + textures + wave animation). `frontend/app/components/ui/Background.tsx:12-23`, `frontend/app/components/ui/Background.tsx:251-367`.
- Backgrounds are enabled by default via preferences and apply to all modules (including speaking contexts like `conversation` and `workplace`). `frontend/app/components/ui/Background.tsx:103-112`, `frontend/app/components/ui/Background.tsx:351-379`.

### C. Regression Verdict
**REGRESSED** — Severity: **MEDIUM**

### D. Regression Evidence
- Explicit instruction to remove background images is not reflected in the current background system, which still conditionally renders ImageBackgrounds and layered effects.

### E. Regression Type
- UX flattening
- Feature rollback

---

## 3.8 State Management & Mode Isolation

### A. Authoritative Intended State
- AccessState must be the single source of truth for access to speaking/YKI/profession features; routing should enforce access, not screens. `docs/before_regression/Taika_restructuring_1.md:23016-23020`.
- Session engines must have deterministic lifecycle control; role-play must not be unmounted mid-session. `docs/before_regression/roleplay_design_for_nurses.md:3065-3088`.

### B. Observed Current State
- No AccessState abstraction exists in the current frontend codebase (no `AccessState` definitions or usage found).
- Roleplay is a normal screen without any session-lock or auth/navigation guard preventing unmount during an active session (no session lock constructs found in code; RoleplayScreen is a standard stack screen). `frontend/app/App.js:101-116`, `frontend/app/screens/RoleplayScreen.js`.

### C. Regression Verdict
**PARTIALLY REGRESSED** — Severity: **HIGH**

### D. Regression Evidence
- Access control is performed ad-hoc in screens (e.g., HomeScreen uses subscription checks), not via a centralized AccessState that gates routing. `frontend/app/screens/HomeScreen.js:66-86`.
- No session lock or AccessState model is present despite being an explicit requirement in the authoritative restructuring doc.

### E. Regression Type
- Architectural rollback
- Mode collapse

---

## 3.9 Development Process Signals

### A. Authoritative Intended State
- Navigation should be consolidated, with dead routes removed. `docs/before_regression/Taika_restructuring_1.md:2427-2444`.
- Speaking should use a single shared engine across tracks. `docs/before_regression/Taika_restructuring_1.md:2427-2450`.

### B. Observed Current State
- Multiple navigation definitions coexist (App.js stack vs `navigation/MainStack.js` + `TabNavigator.js`), indicating incomplete consolidation. `frontend/app/App.js:57-118`, `frontend/app/navigation/MainStack.js:1-41`, `frontend/app/navigation/TabNavigator.js:1-18`.
- Speaking logic exists in separate, divergent screens (`GuidedTurnScreen`, `RoleplayScreen`, and YKI practice screens), not a single shared engine. `frontend/app/screens/GuidedTurnScreen.js`, `frontend/app/screens/RoleplayScreen.js`.

### C. Regression Verdict
**REGRESSED** — Severity: **MEDIUM**

### D. Regression Evidence
- Coexistence of multiple navigation structures and multiple speaking flows indicates partial merges and older structures still present.

### E. Regression Type
- Architectural rollback
- UX flattening

---

# Meta-Analysis (Required)

## How far back does the app appear to have regressed conceptually?
- The app appears to have regressed to a pre-consolidation state where multiple navigation systems, multiple speaking flows, and generic role-play tasks coexist, rather than the unified, track-centric, speaking-first architecture described in the restructuring documents.

## Which regressions are cosmetic vs structural vs core-value breaking?
- Cosmetic: Background system still uses image layers and textures instead of the mandated speaking-mode gradient-only background (visual mismatch but not core logic).
- Structural: Missing AccessState gating, lack of a shared Speaking Session UI Engine, duplicated navigation structures.
- Core-value breaking: YKI exam mode lacks centralized timing/lock behavior; professional nursing role-play is replaced with generic tasks; product shape remains three co-equal tracks instead of two outcome products.

## Which regressions could not be detected by build success or unit tests?
- Navigation consolidation (unused MainStack/TabNavigator) is a structural regression not detected by build success.
- Missing speaking session engine and roleplay nursing grounding are functional/product regressions that would not surface in unit tests without explicit UX contract tests.
- Absence of AccessState gating would pass unit tests unless explicitly tested against routing guarantees.

## Regression pattern suggests:
- **Incomplete merge**: multiple navigation systems and multiple speaking flows indicate partial integration of newer architecture without removing older paths.
- **Branch confusion**: presence of unused navigation modules and inconsistent roleplay content suggests older worktrees/features coexisting with newer changes.
- **Loss of authoritative reference**: the current code does not embody the explicit architectural rules in the restructuring docs, suggesting drift from the documented ground truth.

## Do dump/worktrees likely contain a more correct future state than main?
- Based on the mismatch between documented intent and current implementation (missing unified speaking engine, missing access gating, missing YKI exam spine), it is likely that some intended future-state components exist outside the main integration path. This aligns with the restructuring plan’s claim that “vertical spines” were not merged into the repo.

