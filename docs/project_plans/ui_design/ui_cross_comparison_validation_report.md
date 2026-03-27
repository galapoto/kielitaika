# UI Cross-Comparison Validation Report

Generated: `2026-03-25`  
Audited old repo: `/home/vitus/Documents/puhis`  
Audited target-spec docs:

- `/home/vitus/kielitaika/docs/ui_design/new_repo_full_ui_ux_design.md/kieli_taika_full_app_transition_ui_ux_implementation_new_repo.md`
- `/home/vitus/kielitaika/docs/ui_design/kieli_taika_unified_ui_ux_system_mobile_web_audio_mic_intelligence.md`
- `/home/vitus/kielitaika/docs/microphone_design/kielitaika_microphone_intelligence_system.md`
- `/home/vitus/kielitaika/docs/role_play_files/roleplay_engine_specification_kieli_taika.md`
- `/home/vitus/kielitaika/docs/rules/production_checklist.md`

Method:

- fail-closed
- no assumptions
- old repo treated as frozen reference state
- new spec treated as target claim, not trusted implementation

## 1. Executive Summary

Overall system state: `FAIL`

Risk level: `CRITICAL`

Primary conclusion:

- The new UI specification is **not internally consistent enough to be treated as a single executable source of truth**.
- The new UI specification is **not lossless relative to the old repo**.
- The new UI specification is **not backend-aligned** with the old system it claims to transition from.
- The new repo currently contains **docs and assets, but almost no implementation structure matching the declared final repo layout**.

Top critical findings:

1. `VIOLATION`: the prompt-named authoritative path `/home/vitus/kielitaika/docs/ui_design/new_repo_full_ui_ux_design.md/` is a directory, not a single markdown file.
2. `VIOLATION`: the main UI spec claims it is "complete and executable" and "single source of truth", but it relies on unresolved `filecite` references and conflicts with adjacent authoritative docs.
3. `MISSING`: the new spec omits major old-repo product areas, especially onboarding, separate conversation practice, fluency, guided turn, shadowing, micro output, notifications/privacy settings, notes, lesson detail, YKI detail/result subflows, and full workplace-module behavior.
4. `CONFLICT`: the new spec says frontend may only use `/roleplay/*`, `/cards/*`, and `/exam/*`, but the old system requires `/auth/*`, `/workplace/*`, `/voice/*`, `/output/*`, `/shadowing/*`, `/subscription/*`, `/payments/*`, `/engagement/*`, and websocket routes.
5. `INCOMPLETE`: the new background system does not preserve the old app’s per-screen background mapping, module split, or exact behavior.

## 2. Compliance Validation

| System Area | Result | Evidence | Notes |
| --- | --- | --- | --- |
| Spec path integrity | `FAIL` | authoritative path is a directory, not a single file | structural documentation error |
| Single source of truth claim | `FAIL` | main spec conflicts with unified UI, microphone, and roleplay docs | cannot fail-open |
| Layout rules | `PARTIAL FAIL` | main spec defines 12-col/mobile single-col, but no pixel-lock screen-by-screen grid | not enough for exact rebuild |
| Pixel grid discipline | `FAIL` | 8px system exists in unified UI doc, but main spec does not govern it fully | conflicting authority |
| Typography | `FAIL` | main spec: Title 24–32, Section 18–22, Body 14–16; unified doc: Title 28–34, Section 20–24, Body 15–17 | internal contradiction |
| Color system | `FAIL` | main spec primary `#4FD1FF`, accent `#9F7AEA`; unified doc primary `#3ABEFF`, cyan glow `#22D3EE` | internal contradiction |
| Card system | `FAIL` | main spec radius 24 and blur-card style; unified/card design doc uses multiple radius values and light card system artifacts | unresolved design authority |
| Navigation system | `FAIL` | main spec desktop sections: Dashboard, Practice, YKI Exam, Roleplay, Workplace, Settings; unified web doc says Home, Practice, Roleplay, YKI, Profile + right mic panel | internal contradiction |
| Login/auth | `FAIL` | main spec only defines Google login/OAuth; old repo has register + email/password + optional Google | missing flow coverage |
| Practice/card flow | `FAIL` | new spec only defines Vocabulary/Grammar/Sentence modules at high level | omits adaptive cards and several old answer variants |
| YKI flow | `PARTIAL FAIL` | text-first reading and audio-first listening are defined; result/review/export/history subflows are not | incomplete |
| Microphone system | `FAIL` | main spec state list differs from microphone spec and unified UI doc | contradictory state model |
| Roleplay system | `PARTIAL FAIL` | fixed 5-turn rule matches old frontend cap, but target API and screen structure diverge from old system and omit old standalone conversation mode | incomplete transition spec |
| Background system | `FAIL` | only five generic backgrounds listed; old app has more modules and variants | not exact |
| Payments/subscription | `FAIL` | new spec says "Subscription only" and "Pricing screen/Upgrade modal" | omits current subscription status, Stripe portal, tier gating detail |
| Settings | `FAIL` | new spec has Account/Audio/Language/Theme only | omits notifications, privacy, profile image flow, subscription entry |
| API contract discipline | `FAIL` | "No custom endpoints" conflicts with actual required endpoints | unsupported assumption |
| Implementability | `FAIL` | repo mostly lacks implementation files promised by spec | plan blocked until pre-validation resolves contradictions |

## 3. Missing Components

This section lists old-repo components or behaviors that exist in `/home/vitus/Documents/puhis` but are not fully defined in the new target spec.

| Old Repo Surface | Old Evidence | New Spec Status | Classification | Notes |
| --- | --- | --- | --- | --- |
| Welcome screen | `frontend/app/screens/WelcomeScreen.js` | not present in screen list; replaced by `Splash` + `Login` only | `MISSING` | onboarding entry flow lost |
| Intent quiz | `frontend/app/screens/IntentQuizScreen.js` | absent | `MISSING` | onboarding intent capture missing |
| Plan selection | `frontend/app/screens/PlanSelectionScreen.js` | absent | `MISSING` | onboarding plan choice missing |
| Profession selection | `frontend/app/screens/ProfessionSelectionScreen.js` | absent | `MISSING` | professional path selection missing |
| Practice frequency | `frontend/app/screens/PracticeFrequencyScreen.js` | absent | `MISSING` | onboarding completion behavior missing |
| Register screen | `frontend/app/screens/auth/RegisterScreen.js` | absent | `MISSING` | new spec only defines login/OAuth |
| Email/password login | `frontend/app/screens/auth/LoginScreen.js` | absent | `MISSING` | new spec only defines Google login |
| Home dashboard state | `frontend/app/screens/HomeScreen.js` | reduced to generic dashboard | `CHANGED` | old repo includes XP/streak/access-aware home behavior |
| Hidden general practice route | `frontend/app/screens/PracticeScreen.tsx` | reduced to generic Practice Hub | `CHANGED` | old route behavior and entry semantics undefined |
| Workplace landing screen | `frontend/app/screens/WorkplaceScreen.js` | only "Workplace" nav label exists | `MISSING` | profession field list and module launcher missing |
| Lesson detail screen | `frontend/app/screens/LessonDetailScreen.js` | absent | `MISSING` | structured workplace lesson flow missing |
| Quiz screen | `frontend/app/screens/QuizScreen.js` | absent as dedicated screen | `MISSING` | old quiz behavior not specified |
| Notes screen | `frontend/app/screens/NotesScreen.js` | absent | `MISSING` | local notes flow missing |
| Conversation screen | `frontend/app/screens/ConversationScreen.js` | absent | `MISSING` | standalone free conversation removed |
| Fluency screen | `frontend/app/screens/FluencyScreen.js` | absent | `MISSING` | old fluency drill lost |
| Guided turn screen | `frontend/app/screens/GuidedTurnScreen.js` | absent | `MISSING` | old guided-turn drill lost |
| Shadowing screen | `frontend/app/screens/ShadowingScreen.js` | absent | `MISSING` | old shadowing drill lost |
| Micro output screen | `frontend/app/screens/MicroOutputScreen.js` | absent | `MISSING` | old timed speaking drill lost |
| YKI info screen | `frontend/app/screens/YKIInfoScreen.js` | absent | `MISSING` | official YKI info and links missing |
| YKI exam end screen | `frontend/app/screens/YKIExamEndScreen.js` | absent | `MISSING` | post-exam history/fallback state missing |
| YKI review answers screen | `frontend/app/exam_runtime/screens/ReviewAnswersScreen.tsx` | absent | `MISSING` | review-before-submit lost |
| YKI submit screen | `frontend/app/exam_runtime/screens/SubmitExamScreen.tsx` | absent | `MISSING` | explicit submit confirmation lost |
| YKI processing screen | `frontend/app/exam_runtime/screens/SubmissionProcessingScreen.tsx` | absent | `MISSING` | processing feedback and retry missing |
| YKI detailed feedback | `frontend/app/exam_runtime/screens/DetailedFeedbackScreen.tsx` | absent | `MISSING` | detailed post-exam feedback missing |
| YKI CEFR level screen | `frontend/app/exam_runtime/screens/CEFRLevelScreen.tsx` | absent | `MISSING` | level summary missing |
| YKI certificate screen | `frontend/app/exam_runtime/screens/CertificateScreen.tsx` | absent | `MISSING` | certificate flow missing |
| YKI export results screen | `frontend/app/exam_runtime/screens/ExportResultsScreen.tsx` | absent | `MISSING` | export/share behavior missing |
| YKI exam history screen | `frontend/app/exam_runtime/screens/ExamHistoryScreen.tsx` | absent | `MISSING` | history flow missing |
| Notification settings | `frontend/app/screens/NotificationSettingsScreen.js` | absent | `MISSING` | old screen has four switches |
| Privacy settings | `frontend/app/screens/PrivacySettingsScreen.js` | absent | `MISSING` | old screen has analytics/tracking toggles |
| Subscription status screen | `frontend/app/screens/SubscriptionScreen.js` | reduced to "Payments" | `CHANGED` | old status/portal/upgrade flow not preserved |
| Roleplay setup screen | old repo uses route params into single `RoleplayScreen` | new spec introduces separate setup | `UNTRACKED CHANGE` | not sourced from old behavior |
| Roleplay review screen | old repo uses in-screen result state, not dedicated route | new spec introduces separate review route | `UNTRACKED CHANGE` | not lossless |
| Card answer variant `reverse_recall` | `cardSessionHelpers.ts` | absent | `MISSING` | unsupported in new spec |
| Card answer variant `context_mcq` | `cardSessionHelpers.ts` | absent | `MISSING` | unsupported in new spec |
| Card answer variant `grammar_application` | `cardSessionHelpers.ts` | absent | `MISSING` | unsupported in new spec |
| Adaptive card session | `useCardSession.ts`, adaptive runtime route | absent | `MISSING` | no adaptive flow in target spec |
| Speech speed preference | `PreferencesContext.js`, settings | only broadly mentioned in unified settings | `INCOMPLETE` | no exact behavior in main spec |
| Theme/background preference toggles | `PreferencesContext.js` | absent | `MISSING` | old toggles not preserved |
| Access gating surfaces | locked YKI/work screens in `RootNavigator.tsx` | absent | `MISSING` | premium gating UX not defined |
| Drawer conversation/settings hidden entries | `RootNavigator.tsx` | absent | `MISSING` | navigation parity lost |
| Workplace field IDs | `workplace_engine.py` | absent | `MISSING` | no authoritative profession list in new spec |
| Profile image flow | `SettingsScreen.js`, `ProfileImage.js` | absent | `MISSING` | not specified |
| External YKI links | `YKIInfoScreen.js` | absent | `MISSING` | user-support flow missing |

## 4. Background System Audit

### 4.1 Old Repo Canonical Background Reality

Canonical implementation files:

- `/home/vitus/Documents/puhis/frontend/app/components/ui/Background.tsx`
- `/home/vitus/Documents/puhis/frontend/app/lib/backgroundLoader.ts`

Old behavior actually observed:

- image background fills full screen via `ImageBackground` + `StyleSheet.absoluteFill`
- image uses `cover`
- image opacity controlled via `styles.imageBackground` and theme overlay blending
- gradient overlay is always present when image is present
- blur is **not** universal; it is mainly applied for `yki_read`, `yki_write`, and modal blur cases
- `solidContentZone` disables image backgrounds entirely for several practice/exam content screens

Exact old module-to-asset mapping:

- `login` -> `login_dark.png` / `login_light.png`
- `home` -> `home_dark.png` / `home_light.png`
- `conversation` -> `convo_dark.png` / `convo_light.png`
- `practice` -> `practice_dark.png` / `practice_light.png`
- `workplace` -> `workplace_light.png` in both light and dark mapping, with dark filename inconsistency
- `yki_read` -> `yki_read_dark.png` / `yki_read_light.png`
- `yki_write` -> `yki_write_dark.png` / `yki_write_light.png`
- `yki_listen` -> `yki_listen_dark.png` / `yki_listen_light.png`
- `yki_speak` -> `yki_speak_dark.png` / `yki_speak_light.png`

New spec background claim:

- `login -> login_bg.png`
- `dashboard -> home_bg.png`
- `practice -> practice_bg.png`
- `roleplay -> roleplay_bg.png`
- `exam -> exam_bg.png`

Result: `FAIL`

Reason:

- new spec compresses the old module system into five generic names
- new spec does not define light/dark variants
- new spec does not define exact per-screen mapping
- new spec does not define exact placement, opacity, overlay percentages, or blur exceptions
- new spec introduces `roleplay_bg.png`, but old routed `RoleplayScreen` does not use the canonical `Background` system at all

### 4.2 Per-Screen Mapping Audit

| Screen / Surface | Old Repo Background Reality | New Spec Coverage | Result |
| --- | --- | --- | --- |
| Welcome | `login` background, blue variant, login image variant | only generic login background | `INCOMPLETE` |
| Login | `login` module, brown variant | generic login background | `INCOMPLETE` |
| Register | `login` module, brown variant | not listed separately | `MISSING` |
| Home | `home` module, brown variant, `imageVariant=home` | dashboard/home bg | `INCOMPLETE` |
| Intent quiz | `home` module, blue variant, `imageVariant=intent` | absent | `MISSING` |
| Plan selection | `home` module, blue variant, `imageVariant=PlanSelection` | absent | `MISSING` |
| Practice frequency | `home` module, blue variant, `imageVariant=PracticeFrequency` | absent | `MISSING` |
| Settings | `home` module, brown variant | settings screen exists but no bg mapping | `INCOMPLETE` |
| Notification settings | `home` module, brown variant | absent | `MISSING` |
| Privacy settings | `home` module, brown variant | absent | `MISSING` |
| Subscription | `home` module, brown variant | payments exists but no exact bg mapping | `INCOMPLETE` |
| Practice hub | `practice` module, brown variant | generic practice bg | `INCOMPLETE` |
| Quiz | `practice` module, blue variant, solid content zone | not defined | `MISSING` |
| Micro output | `practice` module, blue variant, solid content zone | not defined | `MISSING` |
| Fluency | `practice` module, brown variant, solid content zone | not defined | `MISSING` |
| Shadowing | `practice` module, brown variant, solid content zone | not defined | `MISSING` |
| Conversation | `conversation` module, blue variant, solid content zone | not defined | `MISSING` |
| Guided turn | `conversation` module, blue variant, solid content zone | not defined | `MISSING` |
| Profession selection | `workplace` module, blue variant, `imageVariant=workplace` | absent | `MISSING` |
| Workplace | `workplace` module, brown variant | generic workplace not mapped in main bg list | `MISSING` |
| Lesson detail | `workplace` module, blue variant, solid content zone | absent | `MISSING` |
| Roleplay | no canonical `Background` usage observed in current screen | spec invents `roleplay_bg.png` | `UNTRACKED CHANGE` |
| YKI home/info/end | `yki_read` module, blue variant | generic `exam_bg.png` | `INCOMPLETE` |
| YKI read/write/listen/speak module split | four distinct old YKI background modules exist | collapsed to single exam bg | `MISSING` |

### 4.3 Placement / Overlay / Blur Audit

| Requirement | Old Repo | New Spec | Result |
| --- | --- | --- | --- |
| Full-screen placement | defined by code | not numerically specified | `INCOMPLETE` |
| `cover` behavior | defined by code comment and implementation | not specified | `MISSING` |
| Overlay always applied | partially true via gradient overlay | stated as strict rule | `PARTIAL ALIGNMENT` |
| Blur always applied | false in old repo; blur is conditional | stated as strict rule | `VIOLATION` against old fidelity |
| Text never on raw image | old repo still renders content directly over image+gradient, not always through carded readability layer | stated as strict | `INCOMPLETE` |

## 5. Backend Conflicts

| Area | New Spec Claim | Old Backend / Frontend Reality | Result |
| --- | --- | --- | --- |
| Allowed endpoints | frontend may only use `/roleplay/*`, `/cards/*`, `/exam/*` | old product also requires `/auth/*`, `/workplace/*`, `/voice/*`, `/output/*`, `/shadowing/*`, `/subscription/*`, `/payments/*`, `/engagement/*`, websocket routes | `CONFLICT` |
| Auth flow | Google OAuth login only | old repo has register, email/password login, token refresh, `/auth/me` | `CONFLICT` |
| Roleplay API | new roleplay spec uses `POST /roleplay/sessions` and `POST /roleplay/sessions/{session_id}/turns` | old backend uses `/roleplay/session/start`, `/roleplay/session/{id}/turn`, `/roleplay/complete`, `/roleplay/score` | `CONFLICT` |
| Frontend roleplay ownership | backend-only turn authority | old frontend still enforces `MAX_TURNS = 5` in `RoleplayScreen.js` | `PARTIAL CONFLICT` |
| Microphone controller | central orchestrator file `frontend/audio/orchestrator/audio_session_orchestrator.ts` | old repo uses `useVoiceStreaming`, `MicButton`, `MicRecorder`, `sttService`, screen-level event wiring | `UNSUPPORTED UI ASSUMPTION` |
| YKI screen list | Intro, Instructions, Rules, reading/listening/writing/speaking, results | old backend/frontend runtime also supports review, submit, processing, detailed feedback, CEFR, certificate, export, history | `INCOMPLETE` |
| Workplace flow | generic workplace nav only | old backend exposes `/workplace/fields` and `/workplace/lesson`; frontend depends on them | `CONFLICT` if "no custom endpoints" is literal |
| Subscription/payments | pricing screen + upgrade modal | old frontend/backend rely on status endpoint, upgrade/downgrade, checkout, portal, webhook, access derivation | `INCOMPLETE` |
| Conversation free practice | not defined in new main spec | old backend exposes websocket conversation system | `MISSING` |
| Micro output / shadowing | not defined in new main spec | old backend exposes `/output/*` and `/shadowing/*` | `MISSING` |

## 6. Regression Risks

### Critical

1. `Exam flow regression risk`
   Old YKI runtime has a guarded state machine with intro, runner, review, submit, processing, results, detailed feedback, CEFR, certificate, export, and history. The new spec collapses this into a simplified flow. Review, processing, and export behaviors are at risk.

2. `Audio interaction regression risk`
   The old app has mixed tap-toggle, hold-to-talk, timed-stop, and speaking-session wrappers. The new spec imposes one microphone model without preserving old per-feature differences. Micro output already auto-stops on countdown end in the old app; the new microphone doctrine forbids auto-stop.

3. `API regression risk`
   If the new frontend literally obeys "only `/roleplay/*`, `/cards/*`, `/exam/*`", login, workplace, voice, payments, and settings-related features cannot function.

4. `Background fidelity regression risk`
   Old screen-to-module mapping is more granular than the new spec. Rebuilding from new spec alone will not reproduce old backgrounds correctly.

### High

5. `Navigation regression risk`
   The old app has onboarding and hidden drawer routes. The new spec screen list omits them, so route parity will be lost unless separately preserved.

6. `Session-handling regression risk`
   Old speaking screens depend on `SpeakingScreenWrapper` to create stable session IDs. The new spec does not mention this pattern.

7. `Entitlement regression risk`
   Old app derives YKI/work access from subscription tier and locks drawer modules accordingly. The new spec does not define this server/client access contract.

8. `Roleplay transcript regression risk`
   Old roleplay completion and scoring happen after grouped transcript persistence. New spec changes API and screen structure; transcript lifecycle can diverge.

### Medium

9. `Settings/accessibility regression risk`
   The old app exposes language, profile image, notification, privacy, and speech-rate settings. New spec only partially covers settings.

10. `Legacy drill regression risk`
    Fluency, guided turn, shadowing, and micro output will disappear unless explicitly reintroduced.

## 7. Unclear / Ambiguous Areas

1. `UNDEFINED`: the prompt-specified authoritative file path is not a file.
2. `UNDEFINED`: `filecite` references in the main spec are not filesystem references and cannot serve as implementation authority on their own.
3. `UNDEFINED`: which document wins when the main UI spec conflicts with the unified UI doc, microphone doc, or roleplay doc.
4. `UNDEFINED`: whether old onboarding is intentionally removed or accidentally omitted.
5. `UNDEFINED`: whether old standalone conversation mode is intentionally removed or accidentally omitted.
6. `UNDEFINED`: whether old fluency/guided-turn/shadowing/micro-output screens are intentionally removed or omitted.
7. `UNDEFINED`: whether email/password auth remains supported.
8. `UNDEFINED`: whether workplace lesson and quiz systems remain part of the target product.
9. `UNDEFINED`: whether YKI detailed result/history/certificate/export flows remain required.
10. `UNDEFINED`: exact background placement, crop, opacity, and blur rules per screen.
11. `UNDEFINED`: exact source asset filenames for `login_bg.png`, `home_bg.png`, `practice_bg.png`, `roleplay_bg.png`, `exam_bg.png`.
12. `UNDEFINED`: whether new roleplay setup/review screens are additive UX changes or required one-to-one replacements of old behavior.
13. `UNDEFINED`: how settings, privacy, notifications, and subscription status are routed if only 4 mobile bottom-nav icons are allowed.
14. `UNDEFINED`: whether the microphone orchestrator supersedes all screen-specific mic logic or only future screens.
15. `UNDEFINED`: exact public request/response schemas for the new `/roleplay/sessions` API family.

## 8. Non-Implementable Items

These items cannot be implemented exactly as defined without first resolving specification gaps or contradictions.

1. `NON-IMPLEMENTABLE`: "single source of truth" execution from the main UI spec alone.
   Reason: conflicts with adjacent target docs and unresolved `filecite` references.

2. `NON-IMPLEMENTABLE`: exact old-background preservation from new spec alone.
   Reason: old spec requires old placement parity, but new spec does not define exact old placement or full module mapping.

3. `NON-IMPLEMENTABLE`: full product rebuild using only `/roleplay/*`, `/cards/*`, `/exam/*`.
   Reason: login, workplace, voice, payments, subscription status, engagement, and settings features need additional endpoints.

4. `NON-IMPLEMENTABLE`: exact auth parity.
   Reason: new spec defines OAuth-only login while old system contains email/password register/login/refresh semantics.

5. `NON-IMPLEMENTABLE`: exact microphone implementation from current docs.
   Reason: main spec, unified UI doc, and microphone doc define incompatible mic state vocabularies.

6. `NON-IMPLEMENTABLE`: exact roleplay transition from old repo to new spec without a migration contract.
   Reason: old roleplay API and new roleplay API families differ materially.

7. `NON-IMPLEMENTABLE`: exact screen-complete rebuild of the old app from the new spec.
   Reason: large portions of old UI surface are missing from the new screen list.

## 9. Lean Checklist Violations

Mapped against `/home/vitus/kielitaika/docs/rules/production_checklist.md`.

| Checklist Area | Old Repo Status | New Spec Status | Result |
| --- | --- | --- | --- |
| Product scope and boundaries | `PARTIAL` | `FAIL` | old repo has practical boundaries in code, new spec omits many retained/removed boundaries |
| Functional requirements | `PARTIAL` | `FAIL` | old flows exist but are fragmented; new spec omits major flows |
| Non-functional requirements | `FAIL` | `FAIL` | no concrete latency/uptime/recovery targets in audited target docs |
| Architecture and separation of concerns | `FAIL` | `PARTIAL FAIL` | old repo duplicates logic; new docs state clean architecture but conflict internally |
| Contracts and schema discipline | `FAIL` | `FAIL` | old repo has endpoint mismatches; new spec lacks exact schemas for many flows |
| Codebase cleanliness | `FAIL` | `UNDEFINED` | old repo has overlap/duplication; new repo has little code to validate |
| Authentication and identity | `PARTIAL FAIL` | `FAIL` | old repo lacks visible password reset flow; new spec lacks full auth lifecycle |
| Authorization and access control | `PARTIAL` | `FAIL` | old repo has subscription gating; new spec underspecifies server enforcement |
| Audio, speech, media handling | `PARTIAL` | `PARTIAL FAIL` | old repo has working flows with mixed rules; new spec clearer in places but not backend-aligned |
| Payments and subscriptions | `PARTIAL` | `FAIL` | old repo has status/checkout/portal/webhook; new spec far too shallow |
| Error handling and resilience | `PARTIAL` | `FAIL` | old repo has many fallback behaviors; new spec does not define enough failure handling |
| Testing strategy | `PARTIAL` | `FAIL` | old repo contains tests; new spec does not define test coverage gates per system |
| Observability and operations | `PARTIAL` | `FAIL` | old repo has health/metrics routes; new spec lacks observability requirements |
| Documentation | `PARTIAL` | `PARTIAL FAIL` | docs exist, but target docs are contradictory and path-invalid |
| Accessibility and usability | `PARTIAL` | `PARTIAL` | both mention some accessibility, but neither provides complete acceptance criteria |
| Mobile and cross-platform reliability | `PARTIAL` | `FAIL` | old repo is cross-platform in practice; new spec lacks environment/test matrix |
| AI-assisted features | `PARTIAL` | `FAIL` | old repo has bounded AI surfaces; new spec lacks failure/cost/abuse detail outside roleplay doc |

### Overall Lean Checklist Conclusion

- Old repo: `PARTIAL PASS / PARTIAL FAIL`
  - many real flows exist
  - discipline and cleanliness are inconsistent
  - backend capabilities are broader than documentation quality

- New target spec set: `FAIL`
  - clearer visual intent
  - insufficient as a sole production implementation contract
  - contradictory across documents
  - not lossless against old repo

## Final Validation Disposition

Release decision from documentation alone: `REJECT`

Required before implementation can be considered valid:

1. canonicalize a single authoritative spec path
2. resolve cross-document contradictions
3. explicitly decide which old repo flows are preserved, removed, or replaced
4. restore full endpoint contract coverage
5. define exact background fidelity rules screen by screen
