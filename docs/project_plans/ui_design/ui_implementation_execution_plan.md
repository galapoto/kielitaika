# UI Implementation Execution Plan

Generated: `2026-03-25`  
Mode: `fail-closed`  
Target repo: `/home/vitus/kielitaika`

Execution rule:

- No implementation phase may begin unless its validation criteria pass.
- Any unresolved contradiction from the target docs is a blocker.
- If a file path below does not exist yet in `/home/vitus/kielitaika`, that file is a planned target file, not evidence of existing implementation.

Authoritative inputs for planning:

- `/home/vitus/kielitaika/docs/ui_design/new_repo_full_ui_ux_design.md/kieli_taika_full_app_transition_ui_ux_implementation_new_repo.md`
- `/home/vitus/kielitaika/docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md`
- `/home/vitus/kielitaika/docs/microphone_design/kielitaika_microphone_intelligence_system.md`
- `/home/vitus/kielitaika/docs/role_play_files/roleplay_engine_specification_kieli_taika.md`
- `/home/vitus/kielitaika/docs/rules/production_checklist.md`
- `/home/vitus/kielitaika/docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md`

## Phase 0 — Pre-Validation

### What to build

- nothing in application code
- create a single canonical implementation contract
- resolve all contradictions between the main UI spec, unified UI spec, microphone spec, roleplay spec, and old-app reconstruction doc
- define preserved vs removed legacy flows explicitly

### Files involved

Source authority files:

- `/home/vitus/kielitaika/docs/ui_design/new_repo_full_ui_ux_design.md/kieli_taika_full_app_transition_ui_ux_implementation_new_repo.md`
- `/home/vitus/kielitaika/docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md`
- `/home/vitus/kielitaika/docs/microphone_design/kielitaika_microphone_intelligence_system.md`
- `/home/vitus/kielitaika/docs/role_play_files/roleplay_engine_specification_kieli_taika.md`
- `/home/vitus/kielitaika/docs/rules/production_checklist.md`
- `/home/vitus/kielitaika/docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md`

Target canonical outputs required before Phase 1:

- `/home/vitus/kielitaika/docs/ui_design/ui_cross_comparison_validation_report.md`
- `/home/vitus/kielitaika/docs/ui_design/ui_implementation_execution_plan.md`
- `UNDEFINED`: one canonical spec file or index document
- `UNDEFINED`: one canonical API contract file
- `UNDEFINED`: one canonical screen inventory file

### Dependencies

- validation report accepted
- owner decisions on preserved old flows
- owner decisions on removed old flows

### Validation criteria

- one authoritative spec path exists and is a file, not a directory
- typography, color, grid, and navigation values are no longer contradictory
- microphone states are canonicalized
- roleplay API contract is canonicalized
- exact old-to-new screen retention matrix exists
- exact old-to-new background mapping exists

### Blockers

- current authoritative path issue
- unresolved `filecite` references
- endpoint-family contradiction
- screen-list incompleteness

## Phase 1 — Core Layout System

### What to build

- root responsive layout system
- mobile vs web container structure
- safe-area handling
- spacing scale
- typography tokens
- color tokens
- card/surface tokens

### Files involved

Planned target files:

- `/home/vitus/kielitaika/frontend/app/theme/tokens.ts`
- `/home/vitus/kielitaika/frontend/app/theme/colors.ts`
- `/home/vitus/kielitaika/frontend/app/theme/spacing.ts`
- `/home/vitus/kielitaika/frontend/app/theme/typography.ts`
- `/home/vitus/kielitaika/frontend/app/theme/radius.ts`
- `/home/vitus/kielitaika/frontend/app/theme/shadows.ts`
- `/home/vitus/kielitaika/frontend/app/components/layout/AppShell.tsx`
- `/home/vitus/kielitaika/frontend/app/components/layout/MobileScaffold.tsx`
- `/home/vitus/kielitaika/frontend/app/components/layout/WebScaffold.tsx`

Reference inputs:

- main UI spec sections 2, 3, 4
- unified UI spec sections 1, 2, 6, 11

### Dependencies

- Phase 0 complete
- resolved design-token contradictions

### Validation criteria

- one 8px-based spacing scale defined
- one authoritative color palette defined
- one authoritative typography scale defined
- one desktop shell and one mobile shell exist
- max-width and padding rules are explicit and testable
- no screen-specific ad hoc spacing introduced before approval

## Phase 2 — Component System

### What to build

- shared button system
- shared input system
- shared card/surface system
- answer row system
- question navigator primitives
- transcript/message bubbles
- microphone button visual primitive

### Files involved

Planned target files:

- `/home/vitus/kielitaika/frontend/app/components/ui/PrimaryButton.tsx`
- `/home/vitus/kielitaika/frontend/app/components/ui/SecondaryButton.tsx`
- `/home/vitus/kielitaika/frontend/app/components/ui/DangerButton.tsx`
- `/home/vitus/kielitaika/frontend/app/components/ui/TextInputField.tsx`
- `/home/vitus/kielitaika/frontend/app/components/ui/SurfaceCard.tsx`
- `/home/vitus/kielitaika/frontend/app/components/ui/AnswerRow.tsx`
- `/home/vitus/kielitaika/frontend/app/components/ui/ProgressPill.tsx`
- `/home/vitus/kielitaika/frontend/app/components/ui/NotificationToast.tsx`
- `/home/vitus/kielitaika/frontend/app/components/mic/MicButton.tsx`
- `/home/vitus/kielitaika/frontend/app/components/mic/Waveform.tsx`
- `/home/vitus/kielitaika/frontend/app/components/roleplay/MessageBubble.tsx`
- `/home/vitus/kielitaika/frontend/app/components/roleplay/TurnProgressDots.tsx`

Reference inputs:

- unified UI spec sections 3, 4, 8, 9, 11, 12
- old repo components:
  - `frontend/app/components/MicButton.js`
  - `frontend/app/components/PremiumEmbossedButton.js`
  - `frontend/app/components/session/CardSessionView.tsx`
  - `frontend/app/exam_runtime/components/*`

### Dependencies

- Phase 1 tokens finalized
- answer-row color-state logic canonicalized
- card-radius contradiction resolved

### Validation criteria

- all component states map to named tokens
- answer rows support unselected, selected, correct, wrong, reveal
- mic component states map to canonical microphone state machine
- buttons and inputs satisfy 44px minimum tap targets
- no business logic embedded in presentational components

## Phase 3 — Navigation & Routing

### What to build

- final route map
- mobile bottom navigation
- web sidebar
- hidden/internal routes if retained
- screen ownership boundaries

### Files involved

Planned target files:

- `/home/vitus/kielitaika/frontend/app/navigation/routes.ts`
- `/home/vitus/kielitaika/frontend/app/navigation/AppNavigator.tsx`
- `/home/vitus/kielitaika/frontend/app/navigation/RootNavigator.tsx`
- `/home/vitus/kielitaika/frontend/app/navigation/types.ts`
- `/home/vitus/kielitaika/frontend/app/components/navigation/Sidebar.tsx`
- `/home/vitus/kielitaika/frontend/app/components/navigation/BottomNav.tsx`

Reference inputs:

- old repo:
  - `frontend/app/navigation/routes.ts`
  - `frontend/app/navigation/AppNavigator.tsx`
  - `frontend/app/navigation/RootNavigator.tsx`
- new spec sections 4, 17

### Dependencies

- Phase 0 screen-retention matrix complete
- explicit decision on onboarding preservation
- explicit decision on hidden drawer equivalents

### Validation criteria

- every routed screen has an owner stack
- removed old screens are explicitly marked removed, not silently dropped
- mobile and web navigation items are fully enumerated
- back behavior is defined for mobile on every leaf screen
- route params and deep-link expectations are documented

## Phase 4 — YKI Exam System

### What to build

- YKI intro and entry flow
- instructions/rules decision
- reading flow
- listening flow
- writing flow
- speaking flow
- answer review
- submit confirmation
- processing state
- results, detailed feedback, CEFR, certificate, export, history if preserved

### Files involved

Planned target files:

- `/home/vitus/kielitaika/frontend/app/exam/ExamRuntimeScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/exam/ExamIntroScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/exam/ReadingPassageScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/exam/ReadingQuestionsScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/exam/ListeningPromptScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/exam/ListeningQuestionsScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/exam/WritingScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/exam/SpeakingScreen.tsx`
- `UNDEFINED`: review / submit / processing / results sub-screen files unless retained explicitly
- `/home/vitus/kielitaika/frontend/app/services/examApi.ts`
- `/home/vitus/kielitaika/frontend/app/state/examStore.ts`

Reference inputs:

- old runtime:
  - `/home/vitus/Documents/puhis/frontend/app/exam_runtime/*`
  - `/home/vitus/Documents/puhis/frontend/app/services/exam_api_client.ts`
- new spec:
  - main UI spec section 9
  - unified UI spec section 12.2

### Dependencies

- Phase 0 decision on preserved old YKI result subflows
- canonical `/exam/*` API contract
- canonical timer and reading-pagination behavior

### Validation criteria

- reading passage and questions are strictly separated if retained
- answer storage model is defined
- timer rules are explicit and consistent
- submit/review/results flow is fully enumerated
- audio upload contract for speaking is defined
- no step in old required flow is silently removed

## Phase 5 — Microphone Integration

### What to build

- microphone state machine
- capture orchestration
- UI synchronization
- AI-response lock state
- waveform and sound triggers
- accessibility alternative interaction

### Files involved

Planned target files:

- `/home/vitus/kielitaika/frontend/audio/orchestrator/audio_session_orchestrator.ts`
- `/home/vitus/kielitaika/frontend/app/mic/micStateMachine.ts`
- `/home/vitus/kielitaika/frontend/app/mic/micTypes.ts`
- `/home/vitus/kielitaika/frontend/app/mic/useMicController.ts`
- `/home/vitus/kielitaika/frontend/app/components/mic/MicButton.tsx`
- `/home/vitus/kielitaika/frontend/app/components/mic/Waveform.tsx`
- `/home/vitus/kielitaika/frontend/app/services/sttApi.ts`
- `/home/vitus/kielitaika/frontend/app/services/ttsApi.ts`

Reference inputs:

- `/home/vitus/kielitaika/docs/microphone_design/kielitaika_microphone_intelligence_system.md`
- old repo:
  - `frontend/app/hooks/useVoiceStreaming.js`
  - `frontend/app/hooks/useVoice.ts`
  - `frontend/app/components/MicButton.js`
  - `frontend/app/components/MicRecorder.js`

### Dependencies

- Phase 0 mic-state contradiction resolved
- sound asset naming resolved (`mic_on.wav` vs `mic_start.wav`, `mic_off.wav` vs `mic_stop.wav`)
- backend speech endpoint contract finalized

### Validation criteria

- one canonical state machine exists
- no screen directly controls recorder internals
- tap start/stop behavior is deterministic
- AI response lock behavior is explicit
- long-press alternative is either retained or explicitly rejected
- any timed auto-stop behavior is explicitly approved or removed

## Phase 6 — Roleplay System

### What to build

- setup UI
- session UI
- review UI
- roleplay API adapter
- transcript rendering
- turn progress display
- roleplay state store

### Files involved

Planned target files from roleplay spec:

- `/home/vitus/kielitaika/frontend/app/screens/RoleplaySetupScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/screens/RoleplaySessionScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/screens/RoleplayReviewScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/components/roleplay/ScenarioCard.tsx`
- `/home/vitus/kielitaika/frontend/app/components/roleplay/LevelSelector.tsx`
- `/home/vitus/kielitaika/frontend/app/components/roleplay/RoleplayHeader.tsx`
- `/home/vitus/kielitaika/frontend/app/components/roleplay/TurnProgressDots.tsx`
- `/home/vitus/kielitaika/frontend/app/components/roleplay/MessageBubble.tsx`
- `/home/vitus/kielitaika/frontend/app/components/roleplay/ThinkingIndicator.tsx`
- `/home/vitus/kielitaika/frontend/app/components/roleplay/TranscriptPanel.tsx`
- `/home/vitus/kielitaika/frontend/app/components/roleplay/SessionSummaryCard.tsx`
- `/home/vitus/kielitaika/frontend/app/services/roleplayApi.ts`
- `/home/vitus/kielitaika/frontend/app/state/roleplayStore.ts`
- `/home/vitus/kielitaika/frontend/app/models/roleplay.ts`

Backend target files from roleplay spec:

- `/home/vitus/kielitaika/backend/api/roleplay_routes.py`
- `/home/vitus/kielitaika/backend/roleplay/orchestrator.py`
- `/home/vitus/kielitaika/backend/roleplay/state_machine.py`
- `/home/vitus/kielitaika/backend/roleplay/public_models.py`

Reference inputs:

- `/home/vitus/kielitaika/docs/role_play_files/roleplay_engine_specification_kieli_taika.md`
- old repo:
  - `frontend/app/screens/RoleplayScreen.js`
  - `frontend/app/services/roleplay.ts`
  - `backend/app/routers/roleplay.py`

### Dependencies

- Phase 0 decision on whether old free conversation remains a separate feature
- Phase 5 mic integration contract
- canonical roleplay public API contract

### Validation criteria

- user can respond exactly five times if roleplay remains fixed-turn
- backend, not frontend, owns final turn state
- transcript model is canonical and persisted
- setup/session/review route ownership is explicit
- scoring and completion flows are explicit
- if old single-screen roleplay is not preserved, the migration decision is documented

## Phase 7 — Card System Integration

### What to build

- practice hub integration
- vocabulary card flow
- grammar card flow
- sentence card flow
- answer input modes
- adaptive session handling if retained

### Files involved

Planned target files:

- `/home/vitus/kielitaika/frontend/app/cards/CardSessionScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/cards/CardFront.tsx`
- `/home/vitus/kielitaika/frontend/app/cards/CardBack.tsx`
- `/home/vitus/kielitaika/frontend/app/cards/AnswerInput.tsx`
- `/home/vitus/kielitaika/frontend/app/cards/FeedbackPanel.tsx`
- `/home/vitus/kielitaika/frontend/app/services/cardsApi.ts`
- `/home/vitus/kielitaika/frontend/app/state/cardSessionStore.ts`
- `/home/vitus/kielitaika/backend/cards/*`
- `/home/vitus/kielitaika/engine/card_pipeline/*`

Reference inputs:

- old repo:
  - `frontend/app/components/session/*`
  - `frontend/app/services/api/cards.ts`
  - `backend/app/cards/runtime/*`
- design inputs:
  - `/home/vitus/kielitaika/frontend/card_design/new_design_text.md`
  - `/home/vitus/kielitaika/docs/card_system_docs/*`

### Dependencies

- Phase 0 decision on retained old card variants
- canonical cards API contract
- card visual design authority resolved

### Validation criteria

- supported answer variants are explicitly listed
- unsupported old variants are explicitly deprecated, not silently omitted
- feedback panel states are defined
- card flip and next interactions are defined
- adaptive vs non-adaptive behavior is explicit

## Phase 8 — Background System

### What to build

- background asset registry
- screen-to-background mapping
- light/dark strategy
- overlay behavior
- blur behavior
- solid content zone behavior

### Files involved

Planned target files:

- `/home/vitus/kielitaika/frontend/app/theme/backgrounds/backgroundRegistry.ts`
- `/home/vitus/kielitaika/frontend/app/theme/backgrounds/backgroundMap.ts`
- `/home/vitus/kielitaika/frontend/app/components/ui/Background.tsx`
- `/home/vitus/kielitaika/frontend/app/assets/backgrounds/*`

Reference inputs:

- old repo:
  - `frontend/app/components/ui/Background.tsx`
  - `frontend/app/lib/backgroundLoader.ts`
  - old asset files under `frontend/app/assets/images/backgrounds`
- validation report section 4

### Dependencies

- Phase 0 exact screen-retention matrix
- exact asset-preservation decision
- exact overlay/blur decision

### Validation criteria

- every retained screen has one explicit background assignment
- any removed old background asset is documented
- light/dark variants are explicit
- overlay opacity and blur rules are explicit
- screens using solid content zones are explicit
- no generic filename alias is accepted without source asset resolution

## Phase 9 — Feedback & Sound System

### What to build

- answer feedback sound mapping
- navigation sound mapping
- mic sound mapping
- session-completion sound mapping
- toast/notification system

### Files involved

Planned target files:

- `/home/vitus/kielitaika/frontend/app/services/soundService.ts`
- `/home/vitus/kielitaika/frontend/app/theme/sounds.ts`
- `/home/vitus/kielitaika/frontend/app/components/ui/NotificationToast.tsx`
- `/home/vitus/kielitaika/frontend/app/assets/sounds/*`

Reference inputs:

- unified UI spec section 4 and 12
- old repo sound usage:
  - `frontend/app/hooks/useSound.js`
  - `frontend/app/services/tts.ts`
  - bundled UI sound assets

### Dependencies

- Phase 2 component system
- Phase 5 mic state model
- resolved asset naming differences

### Validation criteria

- every defined action has explicit sound or explicit silence
- start/stop/send mic sounds are canonicalized
- answer success/error sounds align with answer state logic
- notification types and placement are defined for web and mobile

## Phase 10 — Settings & Accessibility

### What to build

- settings route structure
- account/profile section
- language section
- audio & speech section
- appearance section
- accessibility primitives
- notification/privacy decision if retained

### Files involved

Planned target files:

- `/home/vitus/kielitaika/frontend/app/screens/SettingsScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/screens/NotificationSettingsScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/screens/PrivacySettingsScreen.tsx`
- `/home/vitus/kielitaika/frontend/app/components/settings/LanguageSelector.tsx`
- `/home/vitus/kielitaika/frontend/app/components/settings/SpeechSpeedSlider.tsx`
- `/home/vitus/kielitaika/frontend/app/components/settings/ProfileSection.tsx`
- `/home/vitus/kielitaika/frontend/app/services/preferencesStore.ts`

Reference inputs:

- old repo:
  - `frontend/app/screens/SettingsScreen.js`
  - `frontend/app/screens/NotificationSettingsScreen.js`
  - `frontend/app/screens/PrivacySettingsScreen.js`
  - `frontend/app/context/PreferencesContext.js`
- unified UI spec sections 11.14 and 12.7

### Dependencies

- Phase 0 decision on preserved notification/privacy flows
- Phase 1 token system
- Phase 9 sound triggers

### Validation criteria

- all retained settings sections are explicit
- speech speed range is explicit if retained
- accessibility minimums are testable
- immediate-save vs explicit-save behavior is defined
- retained old settings are not silently dropped

## Phase 11 — Final Validation Layer

### What to build

- rule enforcement checklist
- screen parity checklist
- API contract checklist
- background fidelity checklist
- regression test matrix

### Files involved

Planned target files:

- `/home/vitus/kielitaika/docs/ui_design/final_ui_validation_matrix.md`
- `/home/vitus/kielitaika/docs/ui_design/screen_parity_matrix.md`
- `/home/vitus/kielitaika/docs/ui_design/api_contract_matrix.md`
- `/home/vitus/kielitaika/docs/ui_design/background_fidelity_matrix.md`
- `UNDEFINED`: CI validation script paths until repo toolchain is defined

Reference inputs:

- `/home/vitus/kielitaika/docs/rules/production_checklist.md`
- `/home/vitus/kielitaika/docs/ui_design/ui_cross_comparison_validation_report.md`
- `/home/vitus/kielitaika/docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md`

### Dependencies

- all previous phases complete
- implementation repository structure exists
- canonical API contract exists

### Validation criteria

- every retained old screen is implemented or explicitly deprecated
- every retained backend flow has matching frontend contract usage
- microphone behavior matches canonical state machine
- background mappings match approved fidelity matrix
- production checklist release gate is passed or deviations are approved explicitly

## Global Execution Gates

### Gate A — No Work Starts Without Canonical Docs

Blocked until:

- one canonical spec path exists
- contradiction log resolved

### Gate B — No Screen Starts Without Parity Decision

Blocked until:

- each old screen is marked `retain`, `replace`, or `remove`

### Gate C — No Backend Wiring Starts Without Contract Matrix

Blocked until:

- endpoint inventory is canonical
- request/response schemas are explicit

### Gate D — No UI Finish Is Accepted Without Background Audit

Blocked until:

- every retained screen has approved background, overlay, and blur behavior

## Final Implementation Rule

This plan is executable only if Phase 0 passes.

If Phase 0 does not pass:

- implementation must stop
- unresolved items remain `UNDEFINED`
- any build started from contradictory docs is invalid by design
