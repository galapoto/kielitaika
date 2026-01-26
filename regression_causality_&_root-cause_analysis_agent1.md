# Regression Causality & Root-Cause Analysis (Agent 1)

Scope: Forensic causality analysis of regressions identified in `state_of_the_build_audit_agent1.md` and `state_of_the_build_audit_agent2.md`. No fixes, no redesign, no proposals. Evidence-based only.

Inputs (authoritative):
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
- `state_of_the_build_audit_agent1.md`
- `state_of_the_build_audit_agent2.md`

---

## COMPONENT: Sidebar / Drawer Navigation & IA

1. INTENDED STATE (FROM DOCS)
- Sidebar with explicit category separation and icons for YKI, Professional Finnish, and General Practice. `docs/before_regression/Taika Testing Debugging and Fixing 1.md:6592-6648`.
- Sidebar grouping is structural (orientation, not cosmetic). `docs/before_regression/Taika Testing Debugging and Fixing 1.md:6620-6652`.

2. CURRENT STATE (FROM CODE)
- Runtime root navigation is a stack (`createNativeStackNavigator`) mounted in `frontend/app/App.js` with no drawer/sidebar. `frontend/app/App.js:57-118`.
- Drawer/Sidebar components are absent from the mounted tree; `rg "Sidebar"` returns no app-side component.
- Alternative navigation files exist (`frontend/app/navigation/MainStack.js`, `frontend/app/navigation/TabNavigator.js`) but are not mounted in `App.js`.

3. REGRESSION TYPE
- Navigation regression
- UX flattening
- Architectural rollback

4. DIRECT CAUSE (MECHANICAL)
- The only mounted navigator is a stack in `App.js`; no drawer is referenced.
- Sidebar IA was not merged into the active navigation tree; any sidebar implementation remains absent from runtime.
- Multiple navigation implementations exist but only one is mounted, causing the sidebar design to be mechanically bypassed.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- Navigation consolidation mandate was not enforced; multiple navigation files coexist without a single authoritative mount point.
- Documentation of sidebar orientation was treated as advisory rather than binding.
- No enforced navigation invariant (“drawer must exist in production”) prevents stack-only mounting.

6. WHY IT WAS NOT DETECTED
- Build and runtime startup succeed with a stack-only navigator, so CI/build checks pass.
- No UI contract tests verify sidebar grouping or IA structure.
- Prior audits focused on crash-free launch rather than IA conformance.

7. EVIDENCE POINTERS
- `frontend/app/App.js:57-118`
- `frontend/app/navigation/MainStack.js`
- `frontend/app/navigation/TabNavigator.js`
- `docs/before_regression/Taika Testing Debugging and Fixing 1.md:6592-6652`

---

## COMPONENT: Product Shape (Outcome-Based vs General Finnish)

1. INTENDED STATE (FROM DOCS)
- Product must be centered on two outcome tracks: YKI Pass Plan and Work Readiness Plan; General Finnish is demoted to supporting utilities. `docs/before_regression/Taika_restructuring_1.md:2167-2204`.

2. CURRENT STATE (FROM CODE)
- Home screen explicitly defines three co-equal sections: General Finnish, Workplace Finnish, YKI Exam Preparation. `frontend/app/screens/HomeScreen.js:1-8`.
- General Finnish lists full core activities (grammar, listening, reading, writing, speaking). `frontend/app/screens/HomeScreen.js:36-41`.

3. REGRESSION TYPE
- Architectural rollback
- Mode collapse
- Professional dilution

4. DIRECT CAUSE (MECHANICAL)
- Home screen layout preserves three-track structure in code; demotion of General Finnish was not applied to primary IA.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- Product shape decisions documented in restructuring were not treated as implementation constraints.
- No single product-shape authority enforced at navigation/home composition level.

6. WHY IT WAS NOT DETECTED
- Functional UI works; no test asserts “General Finnish must not be a primary track.”
- Prior audits focused on flow stability rather than product-shape conformance.

7. EVIDENCE POINTERS
- `frontend/app/screens/HomeScreen.js:1-41`
- `docs/before_regression/Taika_restructuring_1.md:2167-2204`

---

## COMPONENT: Spoken & Practice Finnish (Speaking Engine)

1. INTENDED STATE (FROM DOCS)
- Single Speaking Session UI Engine across General/YKI/Professional; swipe-card, no-scroll, one paragraph per card; implicit progression. `docs/before_regression/Taika_restructuring_1.md:120-170`, `docs/before_regression/Taika_restructuring_1.md:2427-2450`.

2. CURRENT STATE (FROM CODE)
- No shared Speaking Session Engine exists (`rg "SpeakingSessionEngine"` yields none).
- Speaking is implemented in separate screens with list/scroll UI and ad-hoc logic: `GuidedTurnScreen`, `ConversationScreen`, `RoleplayScreen`. `frontend/app/screens/GuidedTurnScreen.js`, `frontend/app/screens/RoleplayScreen.js`.

3. REGRESSION TYPE
- Architectural rollback
- Feature deletion
- UX flattening

4. DIRECT CAUSE (MECHANICAL)
- Unified speaking engine was never introduced or merged; multiple legacy speaking flows remain as separate screens.
- Navigation registers multiple speaking-related screens instead of a single engine. `frontend/app/App.js:90-117`.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- “One engine across tracks” constraint lacked a build-time or review-time enforcement gate.
- Parallel development of speaking screens continued without consolidation requirement checks.

6. WHY IT WAS NOT DETECTED
- Each speaking screen renders and functions independently; integration tests likely pass per-screen.
- No invariant tests verify that speaking uses a unified engine or swipe-card-only UI.

7. EVIDENCE POINTERS
- `frontend/app/App.js:90-117`
- `frontend/app/screens/GuidedTurnScreen.js`
- `frontend/app/screens/RoleplayScreen.js`
- `docs/before_regression/Taika_restructuring_1.md:120-170`
- `docs/before_regression/Taika_restructuring_1.md:2427-2450`

---

## COMPONENT: Professional Finnish (Nursing Benchmark)

1. INTENDED STATE (FROM DOCS)
- Role-play is professional, nursing-grounded, TTS-led, scenario-driven, multi-turn. `docs/before_regression/roleplay_design_for_nurses.md:8-115`.

2. CURRENT STATE (FROM CODE)
- Roleplay uses generic non-professional tasks: “Shop for coffee”, “Neighbor chat”, etc. `frontend/app/screens/RoleplayScreen.js:25-29`.
- Prompts and goal rules are hardcoded locally in `RoleplayScreen`, not scenario-driven by profession. `frontend/app/screens/RoleplayScreen.js:25-59`.

3. REGRESSION TYPE
- Professional dilution
- Feature removal
- UX flattening

4. DIRECT CAUSE (MECHANICAL)
- The roleplay screen is implemented with fixed generic tasks; no profession context injection or nursing scenarios exist in this screen.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- Profession-specific roleplay spec not enforced against screen implementation.
- No backend authority or content pipeline ensures roleplay prompts are profession-specific.

6. WHY IT WAS NOT DETECTED
- Roleplay screen functions and produces responses; correctness is qualitative and requires domain-specific verification.
- No automated content validation to ensure nursing-context prompts.

7. EVIDENCE POINTERS
- `frontend/app/screens/RoleplayScreen.js:25-59`
- `docs/before_regression/roleplay_design_for_nurses.md:8-115`

---

## COMPONENT: YKI Exam Mode (Timing, Locking, Realism)

1. INTENDED STATE (FROM DOCS)
- Official YKI timing rules; system-timed listening/speaking; no back/skip; silence counts. `docs/before_regression/yki_exam.md:1-10`.
- Exam state must be backend-authoritative with immutable section order. `docs/before_regression/Taika Testing Debugging and Fixing 4.md:270-276`.
- YKI exam mode architecture is a missing vertical spine to be merged (centralized timer ownership, lock state). `docs/before_regression/kieli_taika_improved_plan.md:61-77`.

2. CURRENT STATE (FROM CODE)
- Exam “mode” appears as a route param (`ykiMode`) with local behavior toggles. `frontend/app/screens/YKIPracticeListeningScreen.js:27-40`.
- No global exam-mode service or hook in frontend (`rg "ykiExamMode"` yields none).
- Normal back navigation exists in YKI practice screens. `frontend/app/screens/YKIPracticeListeningScreen.js:116-120`.

3. REGRESSION TYPE
- Exam invalidation
- Architectural rollback
- Mode collapse

4. DIRECT CAUSE (MECHANICAL)
- Centralized exam mode controller was not merged; screens implement local logic and navigation without exam-wide lock.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- Vertical exam spine explicitly noted as missing in planning docs; merge did not occur.
- No invariant test suite for YKI exam constraints (e.g., “no back”, “system-timed only”).

6. WHY IT WAS NOT DETECTED
- Individual YKI screens render and operate; missing global constraints do not crash builds.
- Timing correctness and lock enforcement require runtime behavioral audits rather than unit tests.

7. EVIDENCE POINTERS
- `frontend/app/screens/YKIPracticeListeningScreen.js:27-40, 116-120`
- `docs/before_regression/kieli_taika_improved_plan.md:61-77`
- `docs/before_regression/yki_exam.md:1-10`
- `docs/before_regression/Taika Testing Debugging and Fixing 4.md:270-276`

---

## COMPONENT: TTS Architecture (Frontend + Backend Contract)

1. INTENDED STATE (FROM DOCS)
- Explicit, deterministic TTS provider selection; no hidden fallbacks; no silent audio failures. `docs/before_regression/Taika_restructuring_2.md:10681-10835`.
- `/tts` contract referenced as the routing mechanism. `docs/before_regression/Taika_restructuring_2.md:10681-10682`.

2. CURRENT STATE (FROM CODE)
- Frontend calls `POST /tts` and expects `audio_base64` and `provider`. `frontend/app/services/tts.ts:1-102`.
- Backend exposes only `/voice/tts-stream` websocket and uses OpenAI TTS; no `/tts` route exists. `backend/app/routers/voice.py:46-60`, `backend/app/services/tts_service.py:1-58`, `backend/app/main.py:1-31`.

3. REGRESSION TYPE
- Audio system regression
- Authority inversion (frontend expects contract not provided by backend)
- Incomplete merge

4. DIRECT CAUSE (MECHANICAL)
- `/tts` HTTP route and provider routing logic are absent in backend; frontend uses a contract that is not implemented.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- Backend TTS routing strategy described in docs was not implemented or was replaced by a different provider (OpenAI) without frontend contract update.
- No contract test verifies `/tts` existence or payload shape.

6. WHY IT WAS NOT DETECTED
- TTS failures can be silent or manifest only in specific flows; general app boot does not test TTS.
- CI/build checks do not validate HTTP endpoints.

7. EVIDENCE POINTERS
- `frontend/app/services/tts.ts:1-102`
- `backend/app/routers/voice.py:46-60`
- `backend/app/services/tts_service.py:1-58`
- `backend/app/main.py:1-31`
- `docs/before_regression/Taika_restructuring_2.md:10681-10835`

---

## COMPONENT: AccessState / Mode Isolation

1. INTENDED STATE (FROM DOCS)
- AccessState is the single authority for feature access; routing (not screens) decides access. `docs/before_regression/Taika_restructuring_1.md:23016-23020`.

2. CURRENT STATE (FROM CODE)
- No AccessState abstraction exists in the frontend codebase (no `AccessState` definition or usage).
- Access gating is implemented ad-hoc in `HomeScreen` using subscription status and local checks. `frontend/app/screens/HomeScreen.js:66-86`.

3. REGRESSION TYPE
- Authority inversion
- Architectural rollback
- Mode collapse

4. DIRECT CAUSE (MECHANICAL)
- Centralized AccessState controller not present; access logic is embedded in screens.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- Access invariants were specified in docs but not enforced by architecture or tests.
- Screen-level gating was allowed to remain after refactors.

6. WHY IT WAS NOT DETECTED
- Access logic works for basic scenarios and does not break builds.
- No invariant tests or routing-level checks verifying centralized access authority.

7. EVIDENCE POINTERS
- `frontend/app/screens/HomeScreen.js:66-86`
- `docs/before_regression/Taika_restructuring_1.md:23016-23020`

---

## COMPONENT: Navigation Consolidation (Multiple Stacks)

1. INTENDED STATE (FROM DOCS)
- Consolidate navigation; remove dual stacks and broken screens. `docs/before_regression/Taika_restructuring_1.md:2427-2444`.

2. CURRENT STATE (FROM CODE)
- `App.js` defines and mounts a stack navigator; separate navigation trees exist in `frontend/app/navigation/*` (MainStack, TabNavigator, AppNavigator) without being mounted. `frontend/app/App.js`, `frontend/app/navigation/MainStack.js`, `frontend/app/navigation/TabNavigator.js`.

3. REGRESSION TYPE
- Parallel-system conflict
- Incomplete merge
- Architectural rollback

4. DIRECT CAUSE (MECHANICAL)
- Legacy navigation files left in repo while a new stack is mounted in `App.js`; consolidation not executed.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- Lack of a single authoritative navigation entry; no enforced deletion of legacy navigation modules.

6. WHY IT WAS NOT DETECTED
- Unused files do not affect runtime; CI/build does not flag redundant navigation trees.

7. EVIDENCE POINTERS
- `frontend/app/App.js:57-118`
- `frontend/app/navigation/MainStack.js`
- `frontend/app/navigation/TabNavigator.js`
- `docs/before_regression/Taika_restructuring_1.md:2427-2444`

---

## COMPONENT: Background & Visual Mode Ownership

1. INTENDED STATE (FROM DOCS)
- Speaking screens must remove background images/textures and use a calm gradient; speaking mode must own its background. `docs/before_regression/Taika_restructuring_1.md:345-399`, `docs/before_regression/Taika_restructuring_1.md:980-989`.

2. CURRENT STATE (FROM CODE)
- Background system uses `ImageBackground` with optional images and layered textures/animations. `frontend/app/components/ui/Background.tsx:12-23, 251-367`.
- Background system is shared and not specific to speaking; speaking contexts inherit the global background logic. `frontend/app/components/ui/Background.tsx:103-112`.

3. REGRESSION TYPE
- UX flattening
- Authority inversion (speaking mode does not own background)

4. DIRECT CAUSE (MECHANICAL)
- Background component continues to render images and textures; speaking mode does not override background ownership.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- Background rules from speaking restructuring were not enforced at component level.
- Visual invariants lacked automated checks or visual regression tests.

6. WHY IT WAS NOT DETECTED
- Visual differences do not break builds; no automated checks for “no background images in speaking.”

7. EVIDENCE POINTERS
- `frontend/app/components/ui/Background.tsx:12-23, 251-367`
- `docs/before_regression/Taika_restructuring_1.md:345-399, 980-989`

---

## COMPONENT: Roleplay Session Lifecycle

1. INTENDED STATE (FROM DOCS)
- Roleplay must have fixed max turns, no retries, turn ownership enforced, AI turn completes before mic unlock. `docs/before_regression/Taika Testing Debugging and Fixing 4.md:262-266`.
- Roleplay session must not be unmounted mid-session; session lock required. `docs/before_regression/roleplay_design_for_nurses.md:3065-3088`.

2. CURRENT STATE (FROM CODE)
- Roleplay is a standard screen in stack navigation with no session lock logic or enforced unmount protection. `frontend/app/App.js:101-116`, `frontend/app/screens/RoleplayScreen.js`.
- Roleplay logic uses local state and does not show explicit turn ownership or max-turn enforcement beyond local task index. `frontend/app/screens/RoleplayScreen.js`.

3. REGRESSION TYPE
- Architectural rollback
- Mode isolation failure

4. DIRECT CAUSE (MECHANICAL)
- Session lock or roleplay FSM enforcement code is absent; RoleplayScreen relies on local state only.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- Roleplay lifecycle invariants documented but not implemented in navigation/session management.

6. WHY IT WAS NOT DETECTED
- Roleplay flows can appear to function for short sessions; unmount/reset issues surface only under auth or navigation churn.
- No automated lifecycle tests enforcing “no unmount mid-session.”

7. EVIDENCE POINTERS
- `frontend/app/App.js:101-116`
- `frontend/app/screens/RoleplayScreen.js`
- `docs/before_regression/Taika Testing Debugging and Fixing 4.md:262-266`
- `docs/before_regression/roleplay_design_for_nurses.md:3065-3088`

---

## COMPONENT: Audio Lifecycle / Deterministic Teardown

1. INTENDED STATE (FROM DOCS)
- Deterministic teardown required; no speculative progression on failure; mic lifecycle is explicit and controlled. `docs/before_regression/Taika Testing Debugging and Fixing 4.md:254-308`.

2. CURRENT STATE (FROM CODE)
- Audio/TTS operations are handled within multiple screens with local state and async effects (`RoleplayScreen`, `GuidedTurnScreen`, `ConversationScreen`). `frontend/app/screens/RoleplayScreen.js`, `frontend/app/screens/GuidedTurnScreen.js`.
- No centralized audio authority or teardown enforcement is evident in the current architecture.

3. REGRESSION TYPE
- Architectural rollback
- Mode isolation failure

4. DIRECT CAUSE (MECHANICAL)
- Shared, centralized audio lifecycle management does not exist; each screen manages its own audio behavior.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- Cross-screen audio invariants were not enforced at architectural level.
- Screen-local behavior changes were allowed without lifecycle guardrails.

6. WHY IT WAS NOT DETECTED
- Audio lifecycle regressions are runtime behavioral issues; not captured by unit tests or build checks.

7. EVIDENCE POINTERS
- `frontend/app/screens/RoleplayScreen.js`
- `frontend/app/screens/GuidedTurnScreen.js`
- `docs/before_regression/Taika Testing Debugging and Fixing 4.md:254-308`

---

## COMPONENT: Legacy vs “Premium 2026” Screen Coexistence

1. INTENDED STATE (FROM DOCS)
- Navigation consolidation and single product spine; removal of dual stacks and broken screens. `docs/before_regression/Taika_restructuring_1.md:2427-2444`.

2. CURRENT STATE (FROM CODE)
- `App.js` explicitly lists “Premium 2026 Screens” and “Legacy screens (kept for backward compatibility)”. `frontend/app/App.js:8-117`.
- Both categories are registered in the same root stack, implying simultaneous coexistence.

3. REGRESSION TYPE
- Parallel-system conflict
- Legacy overwrite risk

4. DIRECT CAUSE (MECHANICAL)
- Legacy screens were retained and mounted rather than removed or consolidated.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- No enforced removal of legacy routes; backward compatibility allowed to persist without consolidation.

6. WHY IT WAS NOT DETECTED
- Legacy screens do not necessarily break runtime; coexistence appears functional.

7. EVIDENCE POINTERS
- `frontend/app/App.js:8-117`
- `docs/before_regression/Taika_restructuring_1.md:2427-2444`

---

## COMPONENT: Dev/Debug Artifacts Leaking into Production

1. INTENDED STATE (FROM DOCS)
- Stabilization and staging documents emphasize production readiness and elimination of unstable or debug-only behavior. `docs/before_regression/Staging Readiness Verification 1.md`.

2. CURRENT STATE (FROM CODE)
- Debug panels are imported and used in speaking-related screens: `SpeakingDebugPanel` in `RoleplayScreen` and `GuidedTurnScreen`. `frontend/app/screens/RoleplayScreen.js:12`, `frontend/app/screens/GuidedTurnScreen.js:4`.

3. REGRESSION TYPE
- Process failure
- Dev artifact leakage

4. DIRECT CAUSE (MECHANICAL)
- Debug components remain in production screen code without gating or removal.

5. SYSTEMIC CAUSE (PROCESS / ORGANIZATIONAL)
- No enforcement of “debug-only code” removal prior to stabilization milestones.

6. WHY IT WAS NOT DETECTED
- Debug panels do not necessarily break functionality; they are visible only when interacted with.

7. EVIDENCE POINTERS
- `frontend/app/screens/RoleplayScreen.js:12`
- `frontend/app/screens/GuidedTurnScreen.js:4`
- `docs/before_regression/Staging Readiness Verification 1.md`

---

# ROOT CAUSE SYNTHESIS

Primary root causes (max 5):
1. **Incomplete merge of vertical spines**: documented in `kieli_taika_improved_plan.md` as missing exam mode and entry/auth discipline; evidence is absence of centralized YKI exam mode and AccessState in current code.
2. **Parallel-system conflict**: multiple navigation trees and legacy/premium screen coexistence indicate overlapping architectures left in place.
3. **Authority inversion**: screen-level logic decides access and behavior where routing/services were intended to be authoritative (AccessState absence, per-screen YKI modes).
4. **Documentation not enforced as binding constraints**: structural requirements (sidebar IA, speaking engine, professional roleplay) exist in docs but are not implemented in runtime.
5. **Lack of invariant tests**: no automated checks for navigation structure, exam mode constraints, or speaking engine invariants.

Secondary contributing factors:
- Mixed-era code in the same runtime (legacy + premium).
- UI-driven changes without a consolidated architecture review gate.
- Debug/staging artifacts retained in production screens.

Regression pattern:
- Incomplete merge + authority drift + parallel-system coexistence.

Most dangerous blind spot:
- Behaviorally correct-looking screens without architectural invariants (e.g., YKI screens render but lack centralized timing/lock enforcement).

Single sentence diagnosis:
- The project regressed because documented architectural spines were never merged into the active runtime, leaving legacy parallel systems and screen-level authority to override the intended centralized model.

Regression causality analysis complete.
Await further instruction.
