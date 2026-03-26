# Old to New Feature Matrix

Generated: `2026-03-25`  
Mode: `fail-closed`  
Legacy repo: `/home/vitus/Documents/puhis`  
Target repo: `/home/vitus/kielitaika`

## 1. Feature Inventory (Exhaustive)

All feature rows below include the required fields:

- Feature Name
- Old Location
- Description
- Classification
- Reason
- New System Mapping
- Dependencies
- Regression if Removed
- Engine Risk if Replaced
- Missing Dependency

### Authentication

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Welcome entry screen | `frontend/app/screens/WelcomeScreen.js` | Entry CTA into onboarding/auth flow. | `REPLACE` | Old screen composition is legacy UI, but onboarding entry is still in retained flow scope and has no approved removal. | Authentication / entry flow | navigation, onboarding state | `YES` | `NO` | `YES` |
| Intent quiz | `frontend/app/screens/IntentQuizScreen.js` | Captures user learning intent before plan selection. | `REPLACE` | Explicitly omitted from new simplified UI docs; remove-not-approved rule means it must be rebuilt or explicitly removed later. | Authentication / onboarding | onboarding store | `YES` | `NO` | `YES` |
| Plan selection | `frontend/app/screens/PlanSelectionScreen.js` | Captures general vs professional plan choice. | `REPLACE` | Old onboarding UI must be rebuilt cleanly; flow cannot disappear silently. | Authentication / onboarding | onboarding store, routing | `YES` | `NO` | `YES` |
| Profession selection | `frontend/app/screens/ProfessionSelectionScreen.js` | Captures profession before auth for professional path. | `REPLACE` | Old UI replaced, but workplace path selection is still a preserved business capability. | Authentication / onboarding | onboarding store, workplace field list | `YES` | `NO` | `YES` |
| Register screen (email/password) | `frontend/app/screens/auth/RegisterScreen.js` | Email/password registration with optional Google entry. | `REPLACE` | Auth capability is preserved, but the new repo has no frozen auth contract and old screen must not be copied. | `MISSING` | auth API, session persistence | `YES` | `NO` | `YES` |
| Login screen (email/password) | `frontend/app/screens/auth/LoginScreen.js` | Email/password sign-in with alternate register/Google paths. | `REPLACE` | Capability preserved, UI rebuilt; OAuth-only new spec is insufficient authority to remove email/password. | `MISSING` | auth API, session persistence | `YES` | `NO` | `YES` |
| Google auth entry points | `frontend/app/screens/auth/LoginScreen.js`, `frontend/app/screens/auth/RegisterScreen.js` | Optional Google sign-in path in auth UI. | `REPLACE` | New spec keeps Google login but auth contract is not frozen. | `MISSING` | auth provider config, auth API | `YES` | `NO` | `YES` |
| Auth restore, token refresh, `/auth/me` bootstrap | `frontend/app/services/authService.js`, `frontend/app/context/AuthContext.js`, `frontend/app/navigation/AppNavigator.tsx` | Restores auth state, refreshes tokens, checks onboarding completion. | `PRESERVE` | Rules explicitly preserve auth and session handling. | `MISSING` | auth API, async storage, session rules | `YES` | `NO` | `YES` |
| Practice-frequency completion step | `frontend/app/screens/PracticeFrequencyScreen.js` | Final onboarding step that persists practice frequency and completes onboarding. | `REPLACE` | Old screen is legacy UI, but the step remains part of the frozen onboarding reference until explicitly removed. | Authentication / onboarding completion | auth API, profile update path | `YES` | `NO` | `YES` |

### Home / Dashboard

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home dashboard hub | `frontend/app/screens/HomeScreen.js` | Main authenticated landing page with feature gateways. | `REPLACE` | Old home UI is legacy composition; dashboard capability stays. | Dashboard / Home | auth state, navigation, access state | `YES` | `NO` | `YES` |
| XP/streak summary | `frontend/app/screens/HomeScreen.js`, `frontend/app/state/useXPStore.js` | Shows streak and XP summary on home. | `PRESERVE` | New simplified dashboard omits this, but no approved removal exists and engagement engine is still present in old system. | Dashboard engagement section | engagement API, XP store | `YES` | `NO` | `YES` |
| Subscription-gated home/drawer access | `frontend/app/navigation/RootNavigator.tsx` | Gates YKI and workplace routes by subscription tier. | `PRESERVE` | Rules explicitly preserve auth/session/subscription gating. | Navigation + subscription core | auth state, subscription status | `YES` | `NO` | `YES` |
| Hidden drawer practice/conversation/settings routes | `frontend/app/navigation/RootNavigator.tsx` | Hidden internal routes for practice, conversation, and settings. | `REPLACE` | Old navigation shell is explicitly replaced, but hidden routes cannot vanish without matrix decisions. | Navigation system | route map, feature retention matrix | `YES` | `NO` | `YES` |

### Practice System

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| General practice landing | `frontend/app/screens/PracticeScreen.tsx` | Hidden drawer landing for general vocabulary/grammar/sentence practice. | `REPLACE` | Old landing shell is replaced, but practice-hub capability remains. | Practice Hub | navigation, cards module | `YES` | `NO` | `NO` |
| Workplace landing screen | `frontend/app/screens/WorkplaceScreen.js` | Lists workplace fields and profession modules. | `REPLACE` | Old workplace surface is legacy UI, but workplace capability and field IDs are preserved. | Workplace module | workplace API, path context, subscription gating | `YES` | `NO` | `YES` |
| Workplace field ID inventory | `backend/app/services/workplace_engine.py` | Canonical workplace field identifiers such as `sairaanhoitaja`, `laakari`, `ict`, and `varhaiskasvatus`. | `PRESERVE` | Reverse doc explicitly lists field IDs as reconstruction data that must survive the rebuild. | Workplace domain registry | workplace API, cards/roleplay/workplace modules | `YES` | `NO` | `YES` |
| Professional module launcher | `frontend/app/components/professional/professionalModules.js` | Maps workplace modules to lesson, roleplay, quiz, vocabulary, grammar, and sentence flows. | `PRESERVE` | This is routing/business mapping, not just UI styling. | Workplace module registry | workplace fields, navigation, cards, roleplay | `YES` | `NO` | `YES` |
| Lesson detail screen | `frontend/app/screens/LessonDetailScreen.js` | Structured lesson flow with steps, writing, exercises, and recording. | `REPLACE` | Listed as candidate flow needing explicit keep/remove decision; no removal approval exists. | `MISSING` | workplace API, mic, content, background system | `YES` | `NO` | `YES` |
| Quiz screen | `frontend/app/screens/QuizScreen.js` | Lesson quiz with answer options, score, restart, and auto-advance. | `REPLACE` | Candidate keep/remove feature; old screen is legacy but current capability is still present. | `MISSING` | workplace lesson API, local fallback content | `YES` | `NO` | `YES` |
| Notes screen | `frontend/app/screens/NotesScreen.js` | Local note-taking surface tied to practice/workplace flow. | `REPLACE` | Candidate keep/remove feature with no approved removal. | `MISSING` | local persistence, navigation | `YES` | `NO` | `YES` |

### Card System

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vocabulary / grammar / sentence card session surface | `frontend/app/screens/VocabularyScreen.js`, `frontend/app/components/session/CardSessionView.tsx` | Card learning UI for all three card families. | `REPLACE` | Rules explicitly rebuild old screen composition and card UI cleanly. | Cards vertical slice | cards API, card UI, session state | `YES` | `NO` | `NO` |
| Card runtime session contract | `frontend/app/services/api/cards.ts`, `backend/app/cards/runtime/api/router.py` | Start, next-card, answer, completion session lifecycle. | `PRESERVE` | Rules explicitly preserve card runtime logic. | Cards API adapter | cards runtime API | `YES` | `NO` | `NO` |
| Supported follow-up variants | `frontend/app/components/session/cardSessionHelpers.ts` | Supports `recognition_mcq`, `typed_recall`, `fill_in`, `reverse_recall`, `context_mcq`, `grammar_application`. | `PRESERVE` | Reverse-engineering doc marks these as required supported variants. | Card system logic | cards API, schema rules | `YES` | `NO` | `NO` |
| Adaptive card sessions | `frontend/app/hooks/useCardSession.ts`, `frontend/app/services/api/cards.ts` | Adaptive selection and review-queue session mode. | `PRESERVE` | New simplified card spec omits it, but no approved removal exists and old runtime supports it. | `MISSING` | cards API, adaptive selection logic | `YES` | `NO` | `YES` |
| Profession normalization for card track selection | `frontend/app/components/session/cardSessionHelpers.ts` | Maps field names to profession tracks such as nurse/doctor/practical nurse. | `PRESERVE` | Reverse doc explicitly lists normalization behavior that existing flows rely on. | Cards adapter / workplace integration | workplace field IDs, cards API | `YES` | `NO` | `NO` |
| Session completion / restart flow | `frontend/app/components/session/SessionCompletionView.tsx` | Restart or end completed card sessions. | `PRESERVE` | Completion behavior is part of current card UX and is not marked for removal. | Cards vertical slice | cards session state | `YES` | `NO` | `NO` |

### Roleplay System

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Single-screen roleplay runtime | `frontend/app/screens/RoleplayScreen.js` | Starts roleplay, records/transcribes turns, shows transcript, and final result in one screen. | `REPLACE` | Rules explicitly replace old roleplay single-screen UI with setup/session/review split. | `RoleplaySetupScreen` + `RoleplaySessionScreen` + `RoleplayReviewScreen` | roleplay API, mic, TTS, speaking session state | `YES` | `NO` | `NO` |
| Roleplay start/turn API lifecycle | `frontend/app/services/roleplay.ts`, `backend/app/routers/roleplay.py` | Start session and advance turns against backend session authority. | `PRESERVE` | Roleplay capability is explicitly preserved. | Roleplay API adapter | roleplay backend/API | `YES` | `NO` | `NO` |
| Roleplay completion + grouped transcript sync | `frontend/app/screens/RoleplayScreen.js`, `POST /roleplay/complete` | Persists grouped transcript only after completion. | `PRESERVE` | Reverse doc marks completion persistence as part of current lifecycle. | Roleplay completion flow | roleplay API, transcript model | `YES` | `NO` | `NO` |
| Roleplay scoring result panel | `frontend/app/screens/RoleplayScreen.js`, `POST /roleplay/score` | Fetches post-session score and `feedback_fi`. | `PRESERVE` | Current roleplay lifecycle includes scoring; no approved removal. | Roleplay review | roleplay API, review model | `YES` | `NO` | `NO` |
| Fixed 5-turn cap | `frontend/app/screens/RoleplayScreen.js` (`MAX_TURNS = 5`) | Current frontend enforces five user turns. | `PRESERVE` | New roleplay spec also keeps exact five-user-turn behavior. | Roleplay orchestrator/state machine | roleplay backend state machine | `YES` | `NO` | `NO` |

### Conversation / Fluency

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Standalone conversation screen | `frontend/app/screens/ConversationScreen.js` | Websocket conversation mode with transcript review, typed input, mic input, and TTS playback. | `REPLACE` | Candidate keep/remove feature with no approved removal; old UI shell is replaced. | `MISSING` | websocket conversation backend, mic, TTS, speaking session state | `YES` | `NO` | `YES` |
| Dual typed + spoken input in conversation | `frontend/app/screens/ConversationScreen.js` | Allows either typed text or transcribed microphone input per turn. | `PRESERVE` | This is current behavior, and no source authorizes removing either input mode. | `MISSING` | mic, STT, websocket conversation backend | `YES` | `NO` | `YES` |
| Stable speaking session wrapper | `frontend/app/components/SpeakingScreenWrapper.js`, `frontend/app/navigation/RootNavigator.tsx` | Generates stable speaking session IDs and wraps all speaking screens. | `PRESERVE` | Reverse doc lists this as reconstruction requirement that must be preserved exactly. | Shared speaking/session layer | speaking session state, navigation | `YES` | `NO` | `YES` |
| Fluency drill | `frontend/app/screens/FluencyScreen.js` | Topic/duration-based fluency drill with lexical, filler, pause, and pace metrics. | `REPLACE` | Candidate keep/remove feature with no approved removal. | `MISSING` | mic, TTS, speaking evaluation loop | `YES` | `NO` | `YES` |
| Guided turn drill | `frontend/app/screens/GuidedTurnScreen.js` | Prompted speaking drill with feedback, filters, and attempt history. | `REPLACE` | Candidate keep/remove feature with no approved removal. | `MISSING` | mic, STT, speaking turn engine | `YES` | `NO` | `YES` |
| Shadowing drill | `frontend/app/screens/ShadowingScreen.js` | Repeat-after-audio drill with diffing and confidence feedback. | `REPLACE` | Candidate keep/remove feature with no approved removal. | `MISSING` | TTS/audio target, mic, diff/feedback engine | `YES` | `NO` | `YES` |
| Micro output drill | `frontend/app/screens/MicroOutputScreen.js` | Timed 10-second speaking drill with auto-stop on countdown end. | `REPLACE` | Candidate keep/remove feature with no approved removal; also conflicts with new global mic doctrine and therefore needs explicit mode exception if retained. | `MISSING` | mic, STT, micro-output API | `YES` | `NO` | `YES` |

### YKI Exam System

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| YKI entry screen | `frontend/app/screens/YKIScreen.js` | Selects CEFR band and starts engine-backed exam session. | `REPLACE` | Old UI shell is replaced, but YKI entry capability is preserved. | YKI entry screen | engine exam start API, runtime persistence | `YES` | `YES` | `NO` |
| YKI info screen | `frontend/app/screens/YKIInfoScreen.js` | Shows YKI information and external official links. | `REPLACE` | Old screen is omitted from simplified UI docs, but no approved removal exists. | `MISSING` | static content, external links | `YES` | `NO` | `YES` |
| Exam runtime shell / state machine | `frontend/app/exam_runtime/screens/ExamRuntimeScreen.tsx` | Boots, validates, persists, and routes the entire YKI flow. | `PRESERVE` | Reverse doc explicitly says guarded transitions and runtime shell must be preserved exactly. | Exam runtime module | engine bridge, runtime contract, local snapshot persistence | `YES` | `YES` | `YES` |
| Exam intro screen | `frontend/app/exam_runtime/screens/ExamIntroScreen.tsx` | Pre-exam introduction screen showing chosen level band and start action. | `REPLACE` | It is a concrete routed screen in the current runtime and is not approved for silent removal. | `MISSING` | exam runtime shell, engine bridge | `YES` | `YES` | `YES` |
| Exam runner screen | `frontend/app/exam_runtime/screens/ExamRunnerScreen.tsx` | Main in-exam runner with timer, navigator, flagging, section progression, and delegates to skill screens. | `PRESERVE` | This is the visible control surface for the preserved runtime state machine. | Exam runtime module | engine bridge, runtime contract, timer/state machine | `YES` | `YES` | `YES` |
| Reading flow (passage then questions) | `frontend/app/exam_runtime/screens/ReadingSection.tsx` | Separates reading passage and questions. | `PRESERVE` | Unified UI doc and engine architecture both preserve this separation. | Reading passage screen + reading questions screen | engine runtime contract | `YES` | `YES` | `NO` |
| Listening flow | `frontend/app/exam_runtime/screens/ListeningSection.tsx` | Audio-first listening screens with question answering. | `PRESERVE` | Engine runtime contract and old runtime both require listening prompt/questions behavior. | Listening prompt screen + listening questions screen | engine runtime contract, audio routes | `YES` | `YES` | `NO` |
| Writing flow | `frontend/app/exam_runtime/screens/WritingSection.tsx` | Free-text writing responses with word count. | `PRESERVE` | Writing capability is core YKI runtime behavior. | Writing screen | engine runtime contract, writing submit API | `YES` | `YES` | `NO` |
| Speaking flow | `frontend/app/exam_runtime/screens/SpeakingSection.tsx` | Prompt plus recording/upload for speaking tasks. | `PRESERVE` | Speaking runtime is a core preserved YKI behavior and engine contract. | Speaking screen | engine runtime contract, upload/audio APIs | `YES` | `YES` | `NO` |
| Review answers screen | `frontend/app/exam_runtime/screens/ReviewAnswersScreen.tsx` | Review answers before final submission. | `PRESERVE` | Explicitly listed by rules as preserved unless removed later. | `MISSING` | engine bridge, runtime state | `YES` | `YES` | `YES` |
| Submit confirmation screen | `frontend/app/exam_runtime/screens/SubmitExamScreen.tsx` | Confirmation step before exam submit. | `PRESERVE` | Old runtime includes warning/confirm flow and engine audits still verify it. | `MISSING` | engine submit contract | `YES` | `YES` | `YES` |
| Submission processing screen | `frontend/app/exam_runtime/screens/SubmissionProcessingScreen.tsx` | Processing/progress screen with retry on failure. | `PRESERVE` | Old runtime includes it and new simplified spec does not explicitly remove it. | `MISSING` | engine submit/result lifecycle | `YES` | `YES` | `YES` |

### Review / Results / History

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Results overview | `frontend/app/exam_runtime/screens/ResultsOverviewScreen.tsx` | Section score summary after submit. | `PRESERVE` | Part of old YKI results stack with no approved removal. | Results stack | engine results payload | `YES` | `YES` | `YES` |
| Detailed feedback | `frontend/app/exam_runtime/screens/DetailedFeedbackScreen.tsx` | Detailed answer-by-answer feedback. | `PRESERVE` | Explicit old feature; no approved removal. | Results stack | engine feedback payload | `YES` | `YES` | `YES` |
| CEFR level screen | `frontend/app/exam_runtime/screens/CEFRLevelScreen.tsx` | Shows derived CEFR progression/estimate. | `PRESERVE` | Explicit old results flow with no approved removal. | Results stack | engine evaluation payload | `YES` | `YES` | `YES` |
| Certificate screen | `frontend/app/exam_runtime/screens/CertificateScreen.tsx` | Certificate-style results surface. | `PRESERVE` | Old runtime supports certificate generation and rules list certificate flow as preserved unless removed. | Results stack / certificate | engine certificate endpoint | `YES` | `YES` | `YES` |
| Export results screen | `frontend/app/exam_runtime/screens/ExportResultsScreen.tsx` | Download/share/export surface. | `PRESERVE` | Explicit old feature with no approved removal. | `MISSING` | engine results/certificate/history payloads | `YES` | `YES` | `YES` |
| Exam history screen | `frontend/app/exam_runtime/screens/ExamHistoryScreen.tsx` | Shows previous exam attempts. | `PRESERVE` | Rules explicitly call out history flows as preserve/remove decisions; none approved for removal. | `MISSING` | engine result history, local placement history | `YES` | `YES` | `YES` |
| YKI exam end / placement history screen | `frontend/app/screens/YKIExamEndScreen.js` | Summary and placement history surface outside the runtime shell. | `REPLACE` | Old screen UI replaced, but history/result continuity still matters. | `MISSING` | `ykiPlacementHistory`, runtime storage | `YES` | `YES` | `YES` |

### Settings

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Settings screen surface | `frontend/app/screens/SettingsScreen.js` | Main settings UI with profile, toggles, language, and links out. | `REPLACE` | Old screen composition is replaced, but settings capability is explicitly preserved. | Settings screen | preferences store, auth state, navigation | `YES` | `NO` | `NO` |
| Theme/background/animation preferences | `frontend/app/screens/SettingsScreen.js`, `frontend/app/context/PreferencesContext.js` | Toggles dark mode, background visibility, and animations. | `PRESERVE` | Old preferences exist and new rules preserve settings capability. | Settings / appearance | preferences store, theme state | `YES` | `NO` | `NO` |
| Language selection | `frontend/app/screens/SettingsScreen.js`, `frontend/app/components/LanguageSelector.js` | Persists app language selection. | `PRESERVE` | Explicit old setting; new simplified settings spec still references language. | Settings / language | language selector, persistence | `YES` | `NO` | `NO` |
| Speech speed preference | `frontend/app/screens/SettingsScreen.js`, `PreferencesContext` | Persists slow/normal/fast speech rate. | `PRESERVE` | Unified UI doc explicitly keeps audio & speech settings. | Settings / audio & speech | preferences store, TTS | `YES` | `NO` | `NO` |
| Profile image edit/update | `frontend/app/screens/SettingsScreen.js`, `frontend/app/components/ProfileImage.js` | Lets user pick or set profile picture URL. | `PRESERVE` | Old feature exists and no approved removal exists. | `MISSING` | auth/profile API, image picker | `YES` | `NO` | `YES` |
| Sign out / logout | `frontend/app/screens/SettingsScreen.js`, `AuthContext.js` | Explicit sign-out action from settings. | `PRESERVE` | Core auth/session behavior. | Settings / account | auth state, token clearing | `YES` | `NO` | `YES` |

### Subscription / Payments

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Subscription screen surface | `frontend/app/screens/SubscriptionScreen.js` | Current subscription status, plan cards, upgrade/manage CTAs. | `REPLACE` | Old UI is replaced, but subscription/payments capability is explicitly preserved. | Payments screen / upgrade modal | subscription API, payment API | `YES` | `NO` | `YES` |
| Subscription status fetch | `frontend/app/screens/SubscriptionScreen.js`, `frontend/app/hooks/useSubscriptionStatus.js` | Loads current tier and feature availability. | `PRESERVE` | Rules explicitly preserve subscription gating. | Subscription core | `/subscription/status` | `YES` | `NO` | `YES` |
| Checkout / upgrade flow | `frontend/app/screens/SubscriptionScreen.js` | Opens checkout session or direct upgrade path. | `PRESERVE` | Core payment capability is retained. | Payments contract | `/payments/create-checkout`, `/subscription/upgrade` | `YES` | `NO` | `YES` |
| Portal / manage subscription flow | `frontend/app/screens/SubscriptionScreen.js` | Opens Stripe customer portal for active subscribers. | `PRESERVE` | Old feature is live in current app and no approved removal exists. | Payments contract | `/payments/create-portal` | `YES` | `NO` | `YES` |
| Tier-based feature map | `frontend/app/hooks/useSubscriptionStatus.js`, `frontend/app/navigation/RootNavigator.tsx` | Maps free/general/professional tiers to general/workplace/YKI access. | `PRESERVE` | Gating semantics are part of core access behavior. | Subscription core | subscription status, auth state, navigation | `YES` | `NO` | `YES` |

### Notifications / Privacy

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Notification settings screen | `frontend/app/screens/NotificationSettingsScreen.js` | Surface for daily reminder settings. | `REPLACE` | Candidate keep/remove feature; no approved removal exists. | `MISSING` | notification preference hooks | `YES` | `NO` | `YES` |
| Morning / afternoon / evening / streak notification toggles | `frontend/app/screens/NotificationSettingsScreen.js` | Four reminder toggles. | `PRESERVE` | Concrete current behavior; not removed by any source. | `MISSING` | notification hooks, local scheduling | `YES` | `NO` | `YES` |
| Privacy settings screen | `frontend/app/screens/PrivacySettingsScreen.js` | Surface for tracking/personalization/analytics preferences. | `REPLACE` | Candidate keep/remove feature; no approved removal exists. | `MISSING` | privacy/preferences state | `YES` | `NO` | `YES` |
| Tracking / personalization / analytics toggles | `frontend/app/screens/PrivacySettingsScreen.js` | Privacy preference toggles. | `PRESERVE` | Concrete old behavior; no approved removal exists. | `MISSING` | privacy/preferences state | `YES` | `NO` | `YES` |

### Background System

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Background component + loader | `frontend/app/components/ui/Background.tsx`, `frontend/app/lib/backgroundLoader.ts` | Centralized theme-aware background rendering. | `PRESERVE` | Reconstruction requirements explicitly preserve background-image mapping and behavior. | Background registry + background component | assets, theme, preferences | `YES` | `NO` | `NO` |
| Module-to-asset background mapping | `frontend/app/lib/backgroundLoader.ts` | Maps `login`, `home`, `conversation`, `practice`, `workplace`, `yki_*` modules to light/dark assets. | `PRESERVE` | Current module mapping is specific and must not be collapsed into generic aliases. | Background registry | assets | `YES` | `NO` | `NO` |
| Screen-to-background mapping | `docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md`, screen files | Binds individual screens to specific module/variant/imageVariant choices. | `PRESERVE` | Rules explicitly require exact screen-to-background mapping to be frozen before UI work. | `docs/ui_design/background_screen_matrix.md` (planned) / Section 4 below | assets, background registry | `YES` | `NO` | `YES` |
| Solid content zone behavior | `frontend/app/components/ui/Background.tsx`, conversation/practice screens | Disables image backgrounds for several text-heavy practice/exam surfaces. | `PRESERVE` | Validation report identifies this as old behavior that new generic blur/card rules do not preserve. | Background registry + screen layout | background component | `YES` | `NO` | `NO` |
| Conditional blur and overlay behavior | `frontend/app/components/ui/Background.tsx` | Uses gradient overlay generally, blur only selectively. | `PRESERVE` | New spec incorrectly says blur is always applied; old behavior is the preserved reference. | Background registry | background component | `YES` | `NO` | `NO` |

### Audio / TTS / STT

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MicButton / MicRecorder capture surface | `frontend/app/components/MicButton.js`, `frontend/app/components/MicRecorder.js` | Frontend capture controls for voice flows. | `REPLACE` | Rules explicitly replace old mixed microphone handling with one shared mic core. | Shared mic core | microphone state machine, voice APIs | `YES` | `NO` | `YES` |
| STT upload/transcription | `frontend/app/services/sttService.js`, `/voice/stt` | Uploads audio and receives transcript text. | `PRESERVE` | Voice/STT capability is preserved. | `MISSING` | voice contract, backend speech service | `YES` | `NO` | `YES` |
| TTS websocket streaming, retry, and cache | `frontend/app/services/tts.ts`, `WS /voice/tts-stream` | Streams TTS audio, caches playback, retries twice. | `PRESERVE` | Old app relies on TTS across conversation and roleplay flows. | `MISSING` | voice contract, websocket service, cache | `YES` | `NO` | `YES` |
| Pronunciation analysis endpoints | `backend/app/routers/voice.py`, pronunciation engine | Supports pronunciation analysis and nudges. | `PRESERVE` | Old speaking family depends on it; no approved removal exists. | `MISSING` | voice contract, pronunciation backend | `YES` | `NO` | `YES` |
| UI sound cues | `frontend/app/assets/sounds/ui/*`, `useSound.js` | Mic on/off, send, success, error, tap sounds. | `PRESERVE` | Unified UI doc also expects mapped UI sounds. | Sound registry | asset registry, sound service | `YES` | `NO` | `NO` |
| YKI listening audio playback | `frontend/app/exam_runtime/components/AudioPlayer.tsx`, engine audio routes | Plays engine-served listening audio assets. | `PRESERVE` | Engine runtime explicitly relies on cache-only audio URLs. | Exam runtime audio layer | YKI engine audio routes | `YES` | `YES` | `NO` |
| Per-session randomized voice preference | `docs/old_app_detail/legacy_app_full_reverse_engineering_codex.md`, `useVoice.ts` | Randomizes male/female TTS voice per speaking session. | `PRESERVE` | Current behavior exists; no source explicitly removes it. | `MISSING` | TTS contract, preferences | `YES` | `NO` | `YES` |

### Misc Screens

| Feature Name | Old Location | Description | Classification | Reason | New System Mapping | Dependencies | Regression if Removed | Engine Risk if Replaced | Missing Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Legacy exam component generation | `frontend/app/components/exam/*` | Older exam prompt/response component surfaces that are not current routed screens. | `REMOVE` | Reverse doc says these are not the active top-level runtime endpoints. Anti-contamination rules prohibit importing unused legacy UI generations. | no replacement; behavior covered by current exam runtime | none | `NO` | `NO` | `NO` |
| No-op workplace settings icon | `frontend/app/screens/WorkplaceScreen.js` | Visible settings icon without an `onPress` handler. | `REMOVE` | Reconstruction requirements explicitly forbid carrying over actionless controls. | no replacement | none | `NO` | `NO` | `NO` |
| Duplicated state containers | `frontend/app/context/ThemeContext.js`, `frontend/app/state/useThemeStore.js`, `frontend/app/state/useUserStore.js` | Multiple owners for the same theme/user concerns. | `REMOVE` | Reconstruction requirements explicitly say duplicate state containers must not be carried over uncritically. | single-owner state layer in new repo | frontend state architecture | `NO` | `NO` | `NO` |

## 2. Classification

Classification rules used in Section 1:

- `PRESERVE`
  - keep the capability
  - re-implement cleanly if needed
  - do not silently drop it
- `REPLACE`
  - keep the business capability or route presence
  - replace the old UI shell, composition, or architecture
- `REMOVE`
  - only used where a source explicitly supports removal, or where the old item is broken, unused, or forbidden by anti-contamination rules

Fail-closed application:

- If a feature is present in the old app and no source explicitly approves removal, it is not classified `REMOVE`.
- If a retained feature has no frozen new contract or screen mapping, the feature stays classified but its `New System Mapping` or `Missing Dependency` is marked accordingly.

## 3. Required Fields Per Feature

Section 1 tables already include all required fields.

Canonical field set:

- `Feature Name`
- `Old Location`
- `Description`
- `Classification`
- `Reason`
- `New System Mapping`
- `Dependencies`

Additional fail-closed fields included for control:

- `Regression if Removed`
- `Engine Risk if Replaced`
- `Missing Dependency`

## 4. Background Mapping (Critical)

Global old-background facts:

- positioning: full-screen `ImageBackground` via absolute fill
- image mode: `cover`
- gradient overlay: present when image background is active
- blur: conditional, not universal
- image opacity: approximately `0.72`
- solid content zone: disables background image for selected text-heavy screens

| Screen Name | Background Image Used | Positioning | Overlay Behavior | New Design Accounts For It |
| --- | --- | --- | --- | --- |
| WelcomeScreen | `login_dark.png` / `login_light.png` | full-screen `cover` | gradient overlay; no explicit solid zone | `INCOMPLETE` |
| LoginScreen | `login_dark.png` / `login_light.png` | full-screen `cover` | gradient overlay | `INCOMPLETE` |
| RegisterScreen | `login_dark.png` / `login_light.png` | full-screen `cover` | gradient overlay | `MISSING` |
| IntentQuizScreen | `home_dark.png` / `home_light.png` with `imageVariant=intent` | full-screen `cover` | gradient overlay | `MISSING` |
| PlanSelectionScreen | `home_dark.png` / `home_light.png` with `imageVariant=PlanSelection` | full-screen `cover` | gradient overlay | `MISSING` |
| PracticeFrequencyScreen | `home_dark.png` / `home_light.png` with `imageVariant=PracticeFrequency` | full-screen `cover` | gradient overlay | `MISSING` |
| HomeScreen | `home_dark.png` / `home_light.png` with `imageVariant=home` | full-screen `cover` | gradient overlay | `INCOMPLETE` |
| PracticeScreen | `practice_dark.png` / `practice_light.png` | full-screen `cover` | gradient overlay | `INCOMPLETE` |
| WorkplaceScreen | `workplace_light.png` in both dark and light mappings | full-screen `cover` | gradient overlay | `MISSING` |
| ProfessionSelectionScreen | `workplace_light.png` with `imageVariant=workplace` | full-screen `cover` | gradient overlay | `MISSING` |
| LessonDetailScreen | `workplace_light.png` | full-screen base; content on solid zone | solid content zone; image disabled in content zone | `MISSING` |
| VocabularyScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| QuizScreen | `practice_dark.png` / `practice_light.png` | full-screen base; content on solid zone | solid content zone | `MISSING` |
| NotesScreen | `home_dark.png` / `home_light.png` | full-screen `cover` | gradient overlay | `MISSING` |
| SettingsScreen | `home_dark.png` / `home_light.png` | full-screen `cover` | gradient overlay | `INCOMPLETE` |
| NotificationSettingsScreen | `home_dark.png` / `home_light.png` | full-screen `cover` | gradient overlay | `MISSING` |
| PrivacySettingsScreen | `home_dark.png` / `home_light.png` | full-screen `cover` | gradient overlay | `MISSING` |
| SubscriptionScreen | `home_dark.png` / `home_light.png` | full-screen `cover` | gradient overlay | `INCOMPLETE` |
| ConversationScreen | `convo_dark.png` / `convo_light.png` | full-screen base; content on solid zone | solid content zone | `MISSING` |
| FluencyScreen | `practice_dark.png` / `practice_light.png` | full-screen base; content on solid zone | solid content zone | `MISSING` |
| GuidedTurnScreen | `convo_dark.png` / `convo_light.png` | full-screen base; content on solid zone | solid content zone | `MISSING` |
| ShadowingScreen | `practice_dark.png` / `practice_light.png` | full-screen base; content on solid zone | solid content zone | `MISSING` |
| MicroOutputScreen | `practice_dark.png` / `practice_light.png` | full-screen base; content on solid zone | solid content zone | `MISSING` |
| RoleplayScreen | `MISSING` | `MISSING` | `MISSING` | `UNTRACKED CHANGE` |
| YKIScreen | `yki_read_dark.png` / `yki_read_light.png` | full-screen `cover` | gradient overlay | `INCOMPLETE` |
| YKIInfoScreen | `yki_read_dark.png` / `yki_read_light.png` | full-screen `cover` | gradient overlay | `MISSING` |
| YKIExamEndScreen | `yki_read_dark.png` / `yki_read_light.png` | full-screen `cover` | gradient overlay | `MISSING` |
| ExamRuntimeScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| ExamIntroScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| ExamRunnerScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| ReadingSection | `MISSING` | `MISSING` | `MISSING` | `INCOMPLETE` |
| ListeningSection | `MISSING` | `MISSING` | `MISSING` | `INCOMPLETE` |
| WritingSection | `MISSING` | `MISSING` | `MISSING` | `INCOMPLETE` |
| SpeakingSection | `MISSING` | `MISSING` | `MISSING` | `INCOMPLETE` |
| ReviewAnswersScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| SubmitExamScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| SubmissionProcessingScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| ResultsOverviewScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| DetailedFeedbackScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| CEFRLevelScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| CertificateScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| ExportResultsScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| ExamHistoryScreen | `MISSING` | `MISSING` | `MISSING` | `MISSING` |

## 5. YKI System Mapping

| Old YKI Flow | Old Evidence | New YKI Design Mapping | Status | Notes |
| --- | --- | --- | --- | --- |
| Reading | `ReadingSection.tsx`; reverse doc section 4.29 | new UI docs define passage first, questions second; engine contract defines `reading_prompt` then `reading_questions` | `PRESERVED` | This is the strongest aligned area across old app, unified UI doc, and engine. |
| Listening | `ListeningSection.tsx`; reverse doc section 4.30 | new UI docs define prompt first, questions second; engine contract defines `listening_prompt` then `listening_questions` | `PRESERVED` | Runtime audio comes from engine `audio_url` only. |
| Writing | `WritingSection.tsx`; reverse doc section 4.31 | new UI docs define writing screen; engine accepts writing text | `PRESERVED` | Old live word-count behavior is not fully frozen in new docs and should be preserved unless explicitly changed later. |
| Speaking | `SpeakingSection.tsx`; reverse doc section 4.32 | new UI docs define prompt + mic; engine defines `speaking_prompt` then `speaking_recording` and speaking upload flow | `PRESERVED` | Must stay adapter-based to engine runtime; UI cannot redefine submission rules. |
| Review | `ReviewAnswersScreen.tsx`; reverse doc section 4.33 | omitted from simplified main UI spec | `MISSING` | Rules explicitly say review flows must be preserved or explicitly removed; no removal approval exists. |
| Submit confirmation | `SubmitExamScreen.tsx`; reverse doc section 4.34 | omitted from simplified main UI spec | `MISSING` | Old engine/runtime path still supports warning + confirm. |
| Processing | `SubmissionProcessingScreen.tsx`; reverse doc section 4.35 | omitted from simplified main UI spec | `MISSING` | Retry/progress handling is currently unspecified in the new docs. |
| Results overview | `ResultsOverviewScreen.tsx`; reverse doc section 4.36 | simplified new spec only says `Results` | `CHANGED` | Capability exists, but exact old subflow is not fully mapped. |
| Detailed feedback | `DetailedFeedbackScreen.tsx`; reverse doc section 4.37 | absent | `MISSING` | Old result depth not mapped. |
| CEFR summary | `CEFRLevelScreen.tsx`; reverse doc section 4.38 | absent | `MISSING` | Old level summary not mapped. |
| Certificate | `CertificateScreen.tsx`; reverse doc section 4.39 | absent from simplified new spec; engine still exposes certificate endpoint | `MISSING` | Old certificate flow remains a required preserve/remove decision. |
| Export | `ExportResultsScreen.tsx`; reverse doc section 4.40 | absent | `MISSING` | No new export contract exists. |
| History | `ExamHistoryScreen.tsx`, `YKIExamEndScreen.js`; reverse doc sections 4.41-4.42 | absent | `MISSING` | History/placement continuity not frozen in new docs. |

## 6. Risk Flags

Feature-level risk flags are embedded in Section 1. Highest-risk items are summarized here.

| Feature / Area | Removing Causes Regression | Replacing Risks Engine Connection | Missing Dependency Exists | Why It Is High Risk |
| --- | --- | --- | --- | --- |
| Auth restore, token refresh, `/auth/me` bootstrap | `YES` | `NO` | `YES` | Entry/auth cannot be rebuilt safely without a frozen auth contract. |
| Subscription-gated home/drawer access | `YES` | `NO` | `YES` | Incorrect gating breaks YKI/workplace access semantics immediately. |
| Adaptive card sessions | `YES` | `NO` | `YES` | Omitted in new docs, but supported by current runtime. |
| Standalone conversation mode | `YES` | `NO` | `YES` | New specs do not decide whether it survives. |
| Fluency / guided turn / shadowing / micro output | `YES` | `NO` | `YES` | All are currently live features with no approved removal; micro output also conflicts with new mic doctrine. |
| Exam runtime shell / state machine | `YES` | `YES` | `YES` | It is the critical bridge between new frontend and authoritative engine behavior. |
| Review / submit / processing YKI subflows | `YES` | `YES` | `YES` | Old runtime includes them, simplified new docs omit them, and engine lifecycle still depends on equivalent transitions. |
| Results / detailed feedback / CEFR / certificate / history | `YES` | `YES` | `YES` | Omission here creates direct product regression against the old exam result stack. |
| Profile image update | `YES` | `NO` | `YES` | Current capability exists but no new profile contract is frozen. |
| Subscription status / checkout / portal | `YES` | `NO` | `YES` | Payment flow is preserved but underspecified for rebuild. |
| Notification and privacy settings | `YES` | `NO` | `YES` | Old app exposes them; new docs do not freeze their continued routing or storage contract. |
| Screen-to-background mapping | `YES` | `NO` | `YES` | New generic background design is not lossless against old per-screen mapping. |
| STT / TTS / pronunciation contracts | `YES` | `NO` | `YES` | Voice capability is preserved, but no new voice contract exists yet. |
