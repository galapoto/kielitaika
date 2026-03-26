# Implementation Authority Index

Generated: `2026-03-25`  
Mode: `fail-closed`  
Target repo: `/home/vitus/kielitaika`

## 1. System Overview

KieliTaika is not a single-source frontend rebuild. The current system is split across three authority domains:

- New repo: `/home/vitus/kielitaika/`
  - current rebuild target
  - contains current docs, current assets, and card-design inputs
- Old repo: `/home/vitus/Documents/puhis`
  - frozen behavioral reference only
  - must not be copied directly into the new repo
- YKI engine: `/home/vitus/kielitaikka-yki-engine/`
  - authoritative backend/runtime for YKI exam behavior, timing, public runtime payloads, and media pipeline rules

Separation rule:

- new repo defines the rebuild target
- old repo defines frozen legacy behavior that must be preserved, replaced, or explicitly removed
- YKI engine defines runtime truth for YKI, not the old frontend

## 2. Authority Mapping

| System Area | Primary Authority | Secondary References | Notes |
| --- | --- | --- | --- |
| UI Layout System | `/home/vitus/kielitaika/docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md` | `docs/ui_design/new_repo_full_ui_ux_design.md/kieli_taika_full_app_transition_ui_ux_implementation_new_repo.md`; `docs/ui_design/ui_cross_comparison_validation_report.md`; `docs/ui_design/ui_implementation_execution_plan.md` | Use the unified UI doc for layout shells, spacing rules, and behavioral layout constraints. The main new-repo UI spec does not win when it conflicts on layout detail. |
| Pixel Grid System | `/home/vitus/kielitaika/docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md` | `docs/ui_design/ui_cross_comparison_validation_report.md` | The only explicit grid rule found is the 8px grid in the unified UI doc. If a screen mock or old screen deviates, the 8px rule wins. |
| Component Dimensions | `/home/vitus/kielitaika/docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md` | `/home/vitus/kielitaika/frontend/card_design/new_design_text.md`; `/home/vitus/Documents/puhis/frontend/app/components/session/CardSessionView.tsx` | Global dimensions come from the unified UI doc. Card-specific proportions from `frontend/card_design/` are structural reference only; they do not override global color/typography authority. |
| Color System | `/home/vitus/kielitaika/docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md` | `docs/ui_design/new_repo_full_ui_ux_design.md/kieli_taika_full_app_transition_ui_ux_implementation_new_repo.md`; `docs/ui_design/ui_cross_comparison_validation_report.md` | Main-spec palette conflicts are resolved in favor of the unified UI doc. |
| Typography System | `/home/vitus/kielitaika/docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md` | `docs/ui_design/new_repo_full_ui_ux_design.md/kieli_taika_full_app_transition_ui_ux_implementation_new_repo.md`; `docs/ui_design/ui_cross_comparison_validation_report.md` | Main-spec type scale loses where it conflicts with the unified UI doc. |
| Animation System | `/home/vitus/kielitaika/docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md` | `docs/role_play_files/roleplay_engine_specification_kieli_taika.md`; `frontend/card_design/new_design_text.md` | Unified UI doc controls global motion timing and answer/mic transitions. Roleplay/card docs only add local interaction detail. |
| Navigation System | `/home/vitus/kielitaika/docs/old_to_new_feature_matrix.md` | `/home/vitus/Documents/puhis/frontend/app/navigation/AppNavigator.tsx`; `/home/vitus/Documents/puhis/frontend/app/navigation/RootNavigator.tsx`; `docs/ui_design/ui_implementation_execution_plan.md` | The feature matrix decides what routes survive the rebuild. Old navigation files are reference-only unless the matrix preserves the route. |
| Background System | `/home/vitus/kielitaika/docs/old_to_new_feature_matrix.md` | `/home/vitus/Documents/puhis/frontend/app/components/ui/Background.tsx`; `/home/vitus/Documents/puhis/frontend/app/lib/backgroundLoader.ts`; `docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md` | The feature matrix section 4 is the canonical screen-to-background map. The generic five-background mapping in the main new-repo UI spec is not sufficient authority. |
| Asset Usage (logos, sounds, images) | `/home/vitus/kielitaika/frontend/app/assets/` | `/home/vitus/Documents/puhis/frontend/app/assets/`; `docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md` | Reuse assets from the current new-repo asset tree only. Old-repo asset paths are reference for provenance, not implementation source. |
| Microphone Behavior | `/home/vitus/kielitaika/docs/microphone_design/kielitaika_microphone_intelligence_system.md` | `docs/role_play_files/roleplay_engine_specification_kieli_taika.md`; `docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md`; `/home/vitus/Documents/puhis/frontend/app/hooks/useVoiceStreaming.js` | KAIL v2 is the microphone authority. Old hold-to-talk and timed-stop patterns are not globally authoritative; they only survive if the feature matrix preserves a mode-specific exception. |
| Roleplay Behavior | `/home/vitus/kielitaika/docs/role_play_files/roleplay_engine_specification_kieli_taika.md` | `/home/vitus/Documents/puhis/frontend/app/screens/RoleplayScreen.js`; `/home/vitus/Documents/puhis/frontend/app/services/roleplay.ts`; `docs/old_to_new_feature_matrix.md` | Backend-owned roleplay rules, 5-turn closure, transcript model, and setup/session/review split come from the roleplay spec. Old single-screen roleplay is legacy reference only. |
| Card System Logic | `/home/vitus/kielitaika/docs/card_system_docs/updated_card_system_integration_detailed_plan_integration_architect.md` | `docs/card_system_docs/card_material_production_prompt_vocabulary.md`; `docs/card_system_docs/card_material_production_prompt_sentence.md`; `docs/card_system_docs/card_material_production_prompt_grammar.md`; `/home/vitus/Documents/puhis/frontend/app/services/api/cards.ts` | This is the current schema-safe card runtime authority. It controls allowed card types, follow-up variants, schema constraints, and grammar exceptions. |
| Card UI System | `/home/vitus/kielitaika/frontend/card_design/new_design_text.md` | `docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md`; `/home/vitus/Documents/puhis/frontend/app/components/session/CardSessionView.tsx` | Card-specific structure and interaction come from the card design text. Visual harmonization with the global dark shell remains a `CONFLICT`; global tokens still win for global palette/typography. |
| YKI Exam Flow | `/home/vitus/kielitaika/docs/old_to_new_feature_matrix.md` | `/home/vitus/kielitaikka-yki-engine/docs/architecture/yki_exam_engine.md`; `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/*`; `docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md` | The feature matrix decides which old YKI subflows are retained. Once retained, engine flow and runtime contract rules apply. |
| YKI Runtime Rules | `/home/vitus/kielitaikka-yki-engine/docs/architecture/yki_exam_engine.md` | `/home/vitus/kielitaikka-yki-engine/engine/api/exam_api_v3_3.py`; `/home/vitus/kielitaikka-yki-engine/engine/schema/runtime_contract_v1.py`; `/home/vitus/kielitaikka-yki-engine/docs/architecture/evaluation_system.md`; `/home/vitus/kielitaikka-yki-engine/docs/architecture/media_pipeline.md` | Reading/listening/writing/speaking screen sequence, section timing, evaluation timing, and media runtime boundaries are engine-owned. |
| Auth System | `/home/vitus/kielitaika/docs/contracts/auth_contract.md` | `docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md`; `/home/vitus/Documents/puhis/frontend/app/services/authService.js`; `/home/vitus/Documents/puhis/backend/app/routers/auth.py` | `auth_contract.md` is now the only implementation authority for login, logout, token rotation, persistence, and session restoration. Legacy auth files are reference-only. |
| Session System | `/home/vitus/kielitaika/docs/contracts/session_contract.md` | `docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md`; `/home/vitus/Documents/puhis/frontend/app/context/AuthContext.js`; `/home/vitus/Documents/puhis/frontend/app/exam_runtime/state/runtimeSessionPersistence.ts`; `/home/vitus/kielitaikka-yki-engine/engine/runtime/session_manager_v3_3.py` | `session_contract.md` unifies auth, speaking, roleplay, and YKI session lifecycle, storage, and expiration. No implementation may invent alternate session persistence rules. |
| Subscription / Payment System | `/home/vitus/kielitaika/docs/contracts/payment_contract.md` | `docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md`; `/home/vitus/Documents/puhis/frontend/app/screens/SubscriptionScreen.js`; `/home/vitus/Documents/puhis/backend/app/services/subscription_service.py`; `/home/vitus/Documents/puhis/backend/app/routers/payments.py` | `payment_contract.md` freezes tier semantics, entitlement rules, checkout, portal, expiration, and reconciliation. Provider-specific legacy details do not override it. |
| Voice / TTS / STT System | `/home/vitus/kielitaika/docs/contracts/voice_contract.md` | `docs/microphone_design/kielitaika_microphone_intelligence_system.md`; `docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md`; `/home/vitus/Documents/puhis/backend/app/routers/voice.py`; `/home/vitus/Documents/puhis/frontend/app/services/sttService.js`; `/home/vitus/Documents/puhis/frontend/app/services/tts.ts` | KAIL remains the microphone UX authority, but `voice_contract.md` now freezes transport, payloads, and YKI-safe voice rules. |
| API Contracts | `/home/vitus/kielitaika/docs/contracts/api_contract.md` | `docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md`; `/home/vitus/Documents/puhis/frontend/app/services/api/cards.ts`; `docs/role_play_files/roleplay_engine_specification_kieli_taika.md`; `/home/vitus/kielitaikka-yki-engine/engine/api/exam_api_v3_3.py` | `api_contract.md` is the app-facing API authority. Frontend must use `/api/v1/**` only, and YKI engine access stays behind the app adapter boundary. |
| Engine Integration (YKI engine) | `/home/vitus/kielitaikka-yki-engine/engine/api/exam_api_v3_3.py` | `/home/vitus/kielitaikka-yki-engine/engine/schema/runtime_contract_v1.py`; `/home/vitus/kielitaikka-yki-engine/docs/architecture/yki_exam_engine.md`; `docs/rules/kieli_taika_new_app_step_by_step_implementation_plan.md` | Engine integration must be adapter-based. The engine endpoint code is the truth for the current runtime surface; UI docs cannot override it. |

## 3. Conflict Resolution Rules

1. The primary authority named in Section 2 always wins for that system area.
2. If a secondary reference conflicts with the primary authority, the secondary reference loses.
3. If the primary authority for an area is `MISSING`, implementation for that area is blocked. No fallback guessing is allowed.
4. If a primary authority is present but does not answer the implementation question, the unresolved item is `UNDEFINED` and implementation stops until a new contract file is written.
5. If two secondary references conflict and the primary authority does not resolve the conflict, mark the issue `CONFLICT` and block implementation.
6. The old repo never overrides a named primary authority unless that old-repo file or old-repo-derived document is explicitly named as the primary authority for that area.
7. YKI engine code and engine runtime contract files override old frontend behavior for YKI runtime payload shape, timing, and submission rules.
8. `docs/old_to_new_feature_matrix.md` overrides generic screen lists whenever route retention, background fidelity, or preserved/removed flow scope is in question.
9. Unresolved `filecite` markers in the main UI spec have zero authority.

## 4. Forbidden Sources

These sources must not be used directly in implementation:

- direct copy of `/home/vitus/Documents/puhis/frontend/app/**`
- direct copy of `/home/vitus/Documents/puhis/backend/app/**`
- `/home/vitus/Documents/puhis/_archived/**`
- `/home/vitus/Documents/puhis/_yki_schema_purge_backup/**`
- generated/vendor/runtime folders in the old repo such as `.expo`, `.venv*`, `.pytest_cache`, caches, logs, and reports
- unresolved `filecite` references inside `docs/ui_design/new_repo_full_ui_ux_design.md/kieli_taika_full_app_transition_ui_ux_implementation_new_repo.md`
- legacy exam component generation under `/home/vitus/Documents/puhis/frontend/app/components/exam/*` as direct implementation source
- any old screen/control explicitly identified as broken or actionless, including the no-op settings icon in `WorkplaceScreen`

## 5. Implementation Boundaries

What can be reused:

- assets already present in `/home/vitus/kielitaika/frontend/app/assets/`
- documented old behavior translated into clean contracts and adapters
- current YKI engine public runtime/API behavior through a new adapter layer
- current card schema/runtime rules from the card-system docs
- roleplay and microphone rules from their dedicated specs

What must be rewritten:

- all frontend screens, shells, navigation, and state containers in the new repo
- app-facing adapters for auth, payments, voice, roleplay, cards, and engine integration
- background registry and screen mapping inside the new repo
- any feature whose old implementation mixes UI logic and business logic

What must never be copied:

- whole legacy frontend or backend directory trees
- duplicated legacy state ownership patterns
- unused or orphaned legacy UI variants imported “just in case”
- unresolved or conflicting contract behavior promoted into code without a new contract file
- old YKI UI assumptions that contradict the current engine runtime contract
