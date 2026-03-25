# Legacy App Full Reverse Engineering

Agent: `codex`  
Generated: `2026-03-25`  
Legacy repository analyzed: `/home/vitus/Documents/puhis`  
Target rebuild repository: `/home/vitus/kielitaika`

## 1. System Overview

### Purpose

`puhis` is a hybrid language-learning platform that combines:

- onboarding and subscription gating
- general Finnish practice
- professional Finnish practice by workplace field
- guided speaking drills
- live-style AI conversation and roleplay
- a newer YKI exam runtime with reading, listening, writing, and speaking phases
- a large backend content and certification pipeline for YKI task banks and card datasets

The repository is not a single clean application. It is a layered legacy system with a production-facing mobile/web client, a FastAPI backend, an engine bridge for YKI runtime services, a large generated content bank, and multiple partially overlapping legacy UI subsystems.

### Major Modules

- `frontend/`: Expo / React Native client for mobile and web.
- `backend/`: FastAPI API, business services, DB models, card runtime, subscription/payment/auth, YKI relay.
- `engine/`: shared engine runtime and media/audio endpoints used by backend.
- `backend/bank/`, `content/`, `yki_content_bank/`: generated and source content banks, especially YKI.
- `scripts/`, `backend/scripts/`: generation, certification, migration, audit, and operational maintenance.
- `tests/`, `backend/tests/`, `frontend/tests/`, `e2e/`, `runtime_tests/`: verification surfaces.

### System Boundaries

Frontend responsibilities:

- route users through onboarding, auth, plan selection, and main app flows
- render speaking, card, lesson, quiz, roleplay, and YKI runtime experiences
- persist auth, theme, preferences, and exam snapshots in local storage
- record audio locally, upload STT payloads, and play backend-generated TTS audio

Backend responsibilities:

- authenticate users and issue/refresh JWTs
- resolve subscription/access rights
- serve workplace fields and generated lessons
- run roleplay, shadowing, micro-output, pronunciation, and conversation services
- host card runtime APIs
- relay YKI runtime requests to engine endpoints
- persist results and event history in SQLAlchemy models

Engine responsibilities:

- host the deeper YKI engine runtime
- serve audio assets for YKI listening tasks
- support exam orchestration and diagnostics

### Effective Runtime Chain

Backend startup chain:

`/home/vitus/Documents/puhis/backend/app/main.py`  
-> `/home/vitus/Documents/puhis/engine/api/server_v3_3.py`  
-> `/home/vitus/Documents/puhis/engine/runtime.py`  
-> `/home/vitus/Documents/puhis/backend/app/application.py`

This means the backend is partly owned by `backend/` and partly by `engine/`. A rebuild must preserve that the current API surface is a combined system, not a single isolated FastAPI app.

## 2. Directory Structure Analysis

### Top-Level Repository Map

| Path | Purpose | Dependencies | Critical Files / Notes |
| --- | --- | --- | --- |
| `/home/vitus/Documents/puhis/backend` | Main backend application, DB models, routers, services, cards runtime | `engine/`, DB, env settings | `app/application.py`, `app/routers/*`, `app/services/*`, `app/cards/*` |
| `/home/vitus/Documents/puhis/frontend` | Mobile/web client | Expo, React Navigation, backend APIs | `app/App.js`, `app/navigation/*`, `app/screens/*`, `app/exam_runtime/*` |
| `/home/vitus/Documents/puhis/engine` | Shared YKI engine runtime and audio serving | backend relay, content bank | `api/server_v3_3.py`, `api/audio_routes.py` |
| `/home/vitus/Documents/puhis/content` | Content-bank sources and manifests | scripts, backend certification | large structured source material |
| `/home/vitus/Documents/puhis/yki_content_bank` | Older YKI content-bank layout | audit/validation pipeline | generated reports and structured tasks |
| `/home/vitus/Documents/puhis/scripts` | Repo-level automation | local env | migration and audit scripts |
| `/home/vitus/Documents/puhis/backend/scripts` | Backend-focused automation | backend services and banks | generation/certification scripts |
| `/home/vitus/Documents/puhis/runtime_tests` | end-to-end runtime verification for YKI/cards | backend/engine | runtime pipelines and regression checks |
| `/home/vitus/Documents/puhis/e2e` | UI/E2E automation | frontend runtime | limited authored tests |
| `/home/vitus/Documents/puhis/docs` | authored docs, audits, previous forensic notes | none | includes prior component maps |
| `/home/vitus/Documents/puhis/documents` | design/product/supporting docs | none | historical planning material |
| `/home/vitus/Documents/puhis/ui_design` | UI assets/mock references | frontend | visual design references |
| `/home/vitus/Documents/puhis/Ruka Images` | legacy visual assets | frontend/manual design use | `metsä_talvi.png`, `revontuli.png`, `snow_pile.png` |
| `/home/vitus/Documents/puhis/RukaSounds` | legacy sound assets | frontend audio hooks | `ui/*.wav` |
| `/home/vitus/Documents/puhis/logs`, `/reports`, `/errors` | runtime artifacts and investigation outputs | backend/tests | not core source |
| `/home/vitus/Documents/puhis/_archived`, `/_yki_schema_purge_backup` | frozen or backup material | none | do not confuse with active source |
| `/home/vitus/Documents/puhis/.expo`, `/.venv`, `/.venv_audit`, `/.pytest_cache` | generated/vendor/runtime folders | toolchain | not authored app logic |

### Scale Notes

Observed file volumes include generated/runtime/vendor material:

- `backend`: 40k+ files
- `frontend`: 48k+ files
- `engine`: 51 files
- `content`: 6.9k+ files
- `yki_content_bank`: 1.8k+ files

The rebuild should not treat those raw counts as authored complexity. The authored surfaces that matter most are:

- `frontend/app/`
- `backend/app/`
- `engine/api/`
- selected manifest/index files in content banks

### Frontend Directory Breakdown

| Path | Purpose | Critical Files |
| --- | --- | --- |
| `/home/vitus/Documents/puhis/frontend/app/App.js` | top-level provider composition | app bootstrap |
| `/home/vitus/Documents/puhis/frontend/app/navigation` | current navigation truth | `AppNavigator.tsx`, `RootNavigator.tsx`, `routes.ts` |
| `/home/vitus/Documents/puhis/frontend/app/screens` | routed legacy screens | all user-facing non-exam screens |
| `/home/vitus/Documents/puhis/frontend/app/exam_runtime` | current YKI runtime system | `screens/*`, `hooks/useExamSession.ts`, `state/*`, `schema/runtimeExamSchema.ts` |
| `/home/vitus/Documents/puhis/frontend/app/components` | reusable UI and speaking widgets | `MicButton.js`, `ProfileImage.js`, `Background.tsx`, session and exam components |
| `/home/vitus/Documents/puhis/frontend/app/context` | React contexts for auth/theme/preferences/path/speaking | current global state backbone |
| `/home/vitus/Documents/puhis/frontend/app/state` | Zustand stores and session helpers | onboarding and duplicated theme/user state |
| `/home/vitus/Documents/puhis/frontend/app/hooks` | voice/audio/notifications/subscription/search/etc. | `useVoice.ts`, `useVoiceStreaming.js`, `useCardSession.ts` |
| `/home/vitus/Documents/puhis/frontend/app/services` | API adapters and persistence helpers | auth, TTS, STT, roleplay, YKI client |
| `/home/vitus/Documents/puhis/frontend/app/utils` | local business logic and validators | speaking engines, API helpers, YKI runtime assertions |
| `/home/vitus/Documents/puhis/frontend/app/assets` | bundled images, sounds, logos | background images and UI sounds |

### Backend Directory Breakdown

| Path | Purpose | Critical Files |
| --- | --- | --- |
| `/home/vitus/Documents/puhis/backend/app/application.py` | backend router registration and startup | central API composition |
| `/home/vitus/Documents/puhis/backend/app/core` | config, auth/security, logging, resilience | `config.py`, `auth.py` |
| `/home/vitus/Documents/puhis/backend/app/db` | DB session and SQLAlchemy models | `database.py`, `models.py` |
| `/home/vitus/Documents/puhis/backend/app/routers` | HTTP/WS entry points | auth, voice, roleplay, workplace, subscription, payments, yki_engine |
| `/home/vitus/Documents/puhis/backend/app/services` | business logic engines | conversation, workplace, STT/TTS, micro-output, YKI integrity stack |
| `/home/vitus/Documents/puhis/backend/app/cards` | card publication/runtime subsystem | runtime API, repositories, services, mappers |
| `/home/vitus/Documents/puhis/backend/app/audio` | card audio asset delivery and preparation | router, service, repository |
| `/home/vitus/Documents/puhis/backend/app/schemas` | request/response/data contracts | YKI and voice schemas |
| `/home/vitus/Documents/puhis/backend/practice/data/cards` | profession card datasets | nurse/doctor/practical nurse JSON banks |
| `/home/vitus/Documents/puhis/backend/bank` | large YKI bank output and registry structures | generated, not hand-edited app flow |

### Engine Directory Breakdown

| Path | Purpose | Critical Files |
| --- | --- | --- |
| `/home/vitus/Documents/puhis/engine/api/server_v3_3.py` | engine API bootstrap | backend runtime entry |
| `/home/vitus/Documents/puhis/engine/api/audio_routes.py` | audio asset serving for YKI | `/api/audio/{id}.mp3` |
| `/home/vitus/Documents/puhis/engine/*` | exam/media/speech helper logic | consumed indirectly through backend relay |

### Hidden Structure Patterns

- The current product has two UI generations:
  - legacy general/workplace/speaking screens under `frontend/app/screens`
  - newer YKI runtime system under `frontend/app/exam_runtime`
- There are also older exam-oriented components under `frontend/app/components/exam`. These are screen-like components but are not the main current route endpoints.
- Theme/background handling is centralized in `frontend/app/components/ui/Background.tsx` and `frontend/app/lib/backgroundLoader.ts`.
- Subscription and access rights are enforced in both frontend auth state and backend websocket/API checks.
- YKI has a large validation/certification stack in backend services, much broader than the visible UI.

## 3. Engine & Logic Systems

### 3.1 Auth and Access Engine

Purpose:

- register/login/refresh user sessions
- persist tokens locally
- derive entitlement to YKI and workplace modules

Frontend files:

- `/home/vitus/Documents/puhis/frontend/app/context/AuthContext.js`
- `/home/vitus/Documents/puhis/frontend/app/services/authService.js`

Backend files:

- `/home/vitus/Documents/puhis/backend/app/routers/auth.py`
- `/home/vitus/Documents/puhis/backend/app/core/auth.py`

Inputs:

- email/password
- refresh token
- backend `subscription_tier`

Outputs:

- access token
- refresh token
- authenticated user object
- derived access state:
  - `general_premium` or `professional_premium` => YKI access
  - `professional_premium` => workplace access

Important behavior:

- tokens stored under `@ruka_token`, `@ruka_refresh_token`, `@ruka_auth`
- token refresh loop every 25 minutes
- special dev shortcut grants workplace premium to `ruka@ruka.com`

### 3.2 Onboarding and Path Selection Engine

Purpose:

- capture user learning intent, plan, profession, and practice frequency before full app entry

Files:

- `/home/vitus/Documents/puhis/frontend/app/state/useOnboardingSession.js`
- `/home/vitus/Documents/puhis/frontend/app/screens/WelcomeScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/screens/IntentQuizScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/screens/PlanSelectionScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/screens/ProfessionSelectionScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/screens/PracticeFrequencyScreen.js`

Inputs:

- tapped choices only

Outputs:

- in-memory onboarding session:
  - `intent_type`
  - `selected_plan`
  - `profession`

Dependencies:

- auth/register flow
- `updateUserProfile` on practice frequency save

### 3.3 Practice Card Engine

Purpose:

- run spaced-repetition-like card sessions for vocabulary, grammar, and sentence cards in general or professional domain

Frontend files:

- `/home/vitus/Documents/puhis/frontend/app/components/session/CardSessionView.tsx`
- `/home/vitus/Documents/puhis/frontend/app/components/session/cardSessionHelpers.ts`
- `/home/vitus/Documents/puhis/frontend/app/components/session/cardSessionState.ts`
- `/home/vitus/Documents/puhis/frontend/app/hooks/useCardSession.ts`
- `/home/vitus/Documents/puhis/frontend/app/screens/VocabularyScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/services/api/cards.ts`

Backend files:

- `/home/vitus/Documents/puhis/backend/app/cards/runtime/api/router.py`
- `/home/vitus/Documents/puhis/backend/app/cards/runtime/services/*`
- `/home/vitus/Documents/puhis/backend/app/cards/runtime/repositories/*`

Inputs:

- domain: `general` or `professional`
- content type: `vocabulary_card`, `sentence_card`, `grammar_card`
- level band
- profession track
- card answer text or option choice

Outputs:

- session state
- next served card
- correctness and explanation
- adaptive follow-up and recommended next action

Supported follow-up variants:

- `recognition_mcq`
- `typed_recall`
- `fill_in`
- `reverse_recall`
- `context_mcq`
- `grammar_application`

Profession normalization:

- `sairaanhoitaja` => `nurse`
- `lähihoitaja`, `lahioitaja`, `hoiva-avustaja`, `practical nurse` => `practical_nurse`
- `lääkäri`, `laakari`, `doctor` => `doctor`
- otherwise `general_workplace`

### 3.4 Workplace Learning Engine

Purpose:

- list available workplace fields
- generate workplace lesson content
- open profession-specific learning modules

Frontend files:

- `/home/vitus/Documents/puhis/frontend/app/screens/WorkplaceScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/screens/LessonDetailScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/screens/QuizScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/components/professional/professionalModules.js`

Backend files:

- `/home/vitus/Documents/puhis/backend/app/routers/workplace.py`
- `/home/vitus/Documents/puhis/backend/app/services/workplace_engine.py`

Current workplace field IDs observed:

- `sairaanhoitaja`
- `laakari`
- `hoiva-avustaja`
- `ict`
- `sahkoinsinoori`
- `rakennus`
- `siivous`
- `logistiikka`
- `ravintola`
- `myynti`
- `varhaiskasvatus`

Professional card-bank source datasets:

- `/home/vitus/Documents/puhis/backend/practice/data/cards/nurse_cards.json`
- `/home/vitus/Documents/puhis/backend/practice/data/cards/doctor_cards.json`
- `/home/vitus/Documents/puhis/backend/practice/data/cards/lahioitaja_cards.json`

### 3.5 Conversation Engine

Purpose:

- open websocket conversation between learner and assistant
- optionally progressive-disclose or grammar-support replies
- store speaking session transcript locally for review

Frontend files:

- `/home/vitus/Documents/puhis/frontend/app/screens/ConversationScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/hooks/useConversationSocket.js`
- `/home/vitus/Documents/puhis/frontend/app/hooks/useVoice.ts`
- `/home/vitus/Documents/puhis/frontend/app/hooks/useVoiceStreaming.js`
- `/home/vitus/Documents/puhis/frontend/app/utils/speakingAttempts.js`

Backend files:

- `/home/vitus/Documents/puhis/backend/app/routers/conversation_socket.py`
- `/home/vitus/Documents/puhis/backend/app/services/conversation_engine.py`
- `/home/vitus/Documents/puhis/backend/app/services/progressive_disclosure_engine*.py`

Input message shape over websocket:

- `role`
- `text`
- `level`
- `path`
- `profession`
- `enable_progressive_disclosure`

Output message shape:

- `role`
- `text`
- `masked_text`
- `support_level`
- `grammar_info`

### 3.6 Roleplay Engine

Purpose:

- generate workplace roleplay scenario opener
- alternate AI and user turns
- persist completed sessions
- score finished attempt

Frontend files:

- `/home/vitus/Documents/puhis/frontend/app/screens/RoleplayScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/services/roleplay.ts`

Backend files:

- `/home/vitus/Documents/puhis/backend/app/routers/roleplay.py`
- `/home/vitus/Documents/puhis/backend/app/services/workplace_engine.py`
- `/home/vitus/Documents/puhis/backend/app/services/roleplay_scoring.py`

Inputs:

- field / role
- scenario identifier or title
- CEFR level
- transcript turns

Outputs:

- start response: `sessionId`, `turnIndex`, `aiName`, `aiText`
- turn response: `sessionId`, `turnIndex`, `aiName`, `aiText`, `completed`
- score response: overall and sub-scores plus `feedback_fi`

### 3.7 Speaking Drill Engine Family

Purpose:

- power multiple speaking training modes

Screens:

- `FluencyScreen`
- `GuidedTurnScreen`
- `ShadowingScreen`
- `MicroOutputScreen`

Shared frontend dependencies:

- `/home/vitus/Documents/puhis/frontend/app/hooks/useVoice.ts`
- `/home/vitus/Documents/puhis/frontend/app/hooks/useVoiceStreaming.js`
- `/home/vitus/Documents/puhis/frontend/app/utils/feedbackRubric.js`
- `/home/vitus/Documents/puhis/frontend/app/utils/speakingTurnEngine.js`
- `/home/vitus/Documents/puhis/frontend/app/utils/speakingAttempts.js`

Backend dependencies by mode:

- micro output: `/output/micro`, `/output/micro/evaluate`
- shadowing: `/shadowing/line`, `/shadowing/score`
- pronunciation: `/voice/pronunciation/*`
- TTS/STT: `/voice/stt`, `/voice/tts-stream`

### 3.8 Audio / STT / TTS Engine

Purpose:

- record user voice
- transcribe speech
- generate synthesized audio
- stream audio over websocket

Frontend files:

- `/home/vitus/Documents/puhis/frontend/app/services/sttService.js`
- `/home/vitus/Documents/puhis/frontend/app/services/tts.ts`
- `/home/vitus/Documents/puhis/frontend/app/hooks/useVoice.ts`
- `/home/vitus/Documents/puhis/frontend/app/hooks/useVoiceStreaming.js`
- `/home/vitus/Documents/puhis/frontend/app/components/MicButton.js`
- `/home/vitus/Documents/puhis/frontend/app/components/MicRecorder.js`

Backend files:

- `/home/vitus/Documents/puhis/backend/app/routers/voice.py`
- `/home/vitus/Documents/puhis/backend/app/services/stt_service.py`
- `/home/vitus/Documents/puhis/backend/app/services/tts_service.py`
- `/home/vitus/Documents/puhis/backend/app/services/tts_router.py`
- `/home/vitus/Documents/puhis/backend/app/services/pronunciation_engine.py`

Important behavior:

- STT native uses `expo-av`; web uses `MediaRecorder`
- STT uploads multipart to `/voice/stt`
- TTS frontend uses websocket `/voice/tts-stream`
- TTS retries backend up to 2 times
- final TTS failure resolves without speaking rather than crashing
- session voice preference is randomized male/female per speaking session

### 3.9 YKI Exam Runtime Engine

Purpose:

- start full exam sessions by CEFR band
- normalize engine response into trusted runtime screens
- enforce phase transitions and section order
- persist runtime snapshot locally
- submit answers, writing, and audio to backend relay
- render results, certificate, export, and history views

Frontend files:

- `/home/vitus/Documents/puhis/frontend/app/screens/YKIScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/*`
- `/home/vitus/Documents/puhis/frontend/app/exam_runtime/hooks/useExamSession.ts`
- `/home/vitus/Documents/puhis/frontend/app/exam_runtime/schema/runtimeExamSchema.ts`
- `/home/vitus/Documents/puhis/frontend/app/exam_runtime/state/examRuntimeController.ts`
- `/home/vitus/Documents/puhis/frontend/app/exam_runtime/state/examRuntimeStateMachine.ts`
- `/home/vitus/Documents/puhis/frontend/app/exam_runtime/state/runtimeSessionPersistence.ts`
- `/home/vitus/Documents/puhis/frontend/app/services/exam_api_client.ts`

Backend files:

- `/home/vitus/Documents/puhis/backend/app/routers/yki_engine.py`
- `/home/vitus/Documents/puhis/backend/app/services/yki_*`
- `/home/vitus/Documents/puhis/engine/api/server_v3_3.py`
- `/home/vitus/Documents/puhis/engine/api/audio_routes.py`

Key guarantees enforced by frontend:

- session ID format must look valid
- engine session token must exist
- runtime screens must normalize into valid sections
- phase transitions must be legal
- inaccessible task indices are rejected
- submit transition is guarded

### 3.10 Engagement / Recharge / XP Engine

Purpose:

- deliver daily recharge tasks and XP/streak updates

Files:

- `/home/vitus/Documents/puhis/backend/app/routers/recharge.py`
- `/home/vitus/Documents/puhis/backend/app/routers/engagement.py`
- `/home/vitus/Documents/puhis/backend/app/services/daily_recharge_engine.py`
- `/home/vitus/Documents/puhis/frontend/app/utils/api.js`
- `/home/vitus/Documents/puhis/frontend/app/state/useXPStore.js`

### 3.11 Subscription and Payment Engine

Purpose:

- report subscription status
- initiate upgrade/downgrade
- create Stripe checkout and portal sessions

Files:

- `/home/vitus/Documents/puhis/backend/app/routers/subscription.py`
- `/home/vitus/Documents/puhis/backend/app/routers/payments.py`
- `/home/vitus/Documents/puhis/backend/app/services/subscription_service.py`
- `/home/vitus/Documents/puhis/backend/app/services/stripe_service.py`
- `/home/vitus/Documents/puhis/frontend/app/screens/SubscriptionScreen.js`
- `/home/vitus/Documents/puhis/frontend/app/hooks/useSubscriptionStatus.js`

## 4. Screen-by-Screen UI Breakdown

The list below covers every routed screen currently present in the app flow, plus the internal YKI runtime screens that the exam shell transitions through.

### 4.1 WelcomeScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/WelcomeScreen.js`  
Route: `Welcome`

Layout:

- `Background` with `module="login"` and `imageVariant="login"`
- logo via `RukaLogo3D`
- headline copy and CTA

Components:

- `Background`
- `AnimatedCTA`
- `RukaLogo3D`

User actions:

- tap primary CTA
- optional tap navigation affordances if present

State/data:

- no meaningful local state
- no API calls

Transition:

- forwards into `IntentQuiz`

### 4.2 IntentQuizScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/IntentQuizScreen.js`  
Route: `IntentQuiz`

Layout:

- themed background with `module="home"`, `imageVariant="intent"`
- selectable intent cards/options

User actions:

- tap one learning intent option

State/data:

- writes selected intent into `useOnboardingSession`

Transition:

- navigates to `PlanSelection`

### 4.3 PlanSelectionScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/PlanSelectionScreen.js`  
Route: `PlanSelection`

Layout:

- themed background with `imageVariant="PlanSelection"`
- plan choice cards/buttons

User actions:

- tap plan choice

State/data:

- writes `selected_plan` to onboarding store

Transitions:

- if professional plan chosen, continue toward profession selection
- otherwise continue toward auth

### 4.4 ProfessionSelectionScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/ProfessionSelectionScreen.js`  
Route: `ProfessionSelection`

Layout:

- background `module="workplace"`, `imageVariant="workplace"`
- profession choice tiles

User actions:

- tap a profession card

State/data:

- stores profession in onboarding store

Transition:

- moves into auth/register flow

### 4.5 RegisterScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/auth/RegisterScreen.js`  
Route: `Auth`

Layout:

- login-module background
- text inputs for name, email, password, confirm password
- registration CTA

Components:

- `Background`
- `RukaLogo3D`
- text inputs

User actions:

- type name/email/password/confirm
- tap register
- tap navigate to login
- optional Google auth entry point

State:

- `name`, `email`, `password`, `confirmPassword`, `loading`, `googleLoading`

Data/API:

- `register`
- may call `updateUserProfile`
- may call `login` post-registration depending on path

Errors:

- validation mismatch and backend auth errors shown in-screen

Transition:

- successful auth continues to practice frequency or main app depending on flow

### 4.6 LoginScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/auth/LoginScreen.js`  
Route: `Login`

Layout:

- login-module background
- text inputs for email/password
- login CTA and alternate auth links

User actions:

- type credentials
- tap login
- tap register link
- optional Google auth path

State:

- `email`, `password`, `loading`, `googleLoading`, `errorMessage`

Data/API:

- `login`

Transition:

- authenticated user is routed by `AppNavigator` into onboarding completion or main app

### 4.7 PracticeFrequencyScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/PracticeFrequencyScreen.js`  
Route: `PracticeFrequency`

Layout:

- background with `imageVariant="PracticeFrequency"`
- selectable practice frequency choices
- animated CTA

User actions:

- tap frequency chip/card
- tap continue/save

State:

- `selectedFrequency`, `saving`

Data/API:

- `updateUserProfile`

Transitions:

- on success resets or replaces stack into authenticated main app

### 4.8 HomeScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/HomeScreen.js`  
Route: `Home`

Layout:

- home background with `imageVariant="home"`
- drawer/menu entry
- XP/streak and path summary
- gateway cards into YKI/work/workflows

User actions:

- open drawer
- tap feature entry points

State:

- `loading`, `intentType`, `userStreak`, `userXP`

Data/API:

- `getCurrentUser`

Transition:

- replaces or navigates to YKI, workplace, practice, or settings surfaces

### 4.9 PracticeScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/PracticeScreen.tsx`  
Route: hidden drawer route `Practice`

Layout:

- practice background
- landing screen for general card practice modes
- option cards for vocabulary/grammar/sentences

User actions:

- back
- select a content type / practice mode

Data:

- resolves card-session config from route params and selected mode

Transitions:

- into `VocabularyScreen` configured for general practice cards

### 4.10 WorkplaceScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/WorkplaceScreen.js`  
Route: `WorkplaceScreen`

Layout:

- workplace background
- top bar with `HomeButton`, profile image, and a settings icon
- profession title and module cards

Components:

- `Background`
- `HomeButton`
- `ProfileImage`
- `RukaCard`

Interactive elements:

- module cards
- retry button on load failure
- profile image/home button
- visible settings icon currently lacks `onPress`

State:

- `fields`, `isLoading`, `error`

Data/API:

- `listWorkplaceFields`
- writes selected field into `PathContext`

Transitions:

- module-specific navigation through `openProfessionalModule`

### 4.11 VocabularyScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/VocabularyScreen.js`  
Routes:

- work-plan vocabulary/grammar/sentences
- general practice card flows

Layout:

- session container only; delegates almost all UI to `CardSessionView`

Components:

- `CardSessionView`

User actions:

- flip card
- type answer
- choose MCQ option
- fill blank
- submit answer
- continue to next card
- restart or exit session

Data/API:

- card runtime session start / next / answer

### 4.12 QuizScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/QuizScreen.js`  
Route: `QuizScreen`

Layout:

- practice background
- question prompt, answer options, feedback, score area, auto-advance toggle

Components:

- `PremiumEmbossedButton`
- `HomeButton`
- touchable answer rows

Interactive elements:

- answer choice buttons
- confirm answer
- next question
- restart quiz
- auto-advance toggle
- go back

State:

- loading/questions/current index/selected option/show answer/correct count/score/rounds completed/error/autoAdvance

Data/API:

- `fetchLesson`

Errors:

- falls back to built-in questions on load failure

Transitions:

- stays in screen until back or restart

### 4.13 LessonDetailScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/LessonDetailScreen.js`  
Route: `LessonDetailScreen`

Layout:

- workplace background with section tabs
- lesson steps, exercise cards, writing area, recording area, weakness tracking

Components:

- `RukaCard`
- `MicRecorder`
- `HomeButton`

Interactive elements:

- section switches
- step navigation
- exercise answer controls
- writing text input
- microphone/recording
- submit/check actions

State:

- `lesson`, `loading`, `error`, `currentStep`, `isRecording`, `writingText`, `wordCount`, `exerciseState`, `exerciseResults`, `activeSection`, `weaknesses`

Data/API:

- `fetchLesson`
- `fetchWorkplaceLesson`

Errors:

- falls back to generated default lesson if backend content fails

Transitions:

- go back
- may navigate into related practice modes

### 4.14 NotesScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/NotesScreen.js`  
Route: `NotesScreen`

Layout:

- home background
- note input and saved notes list

Interactive elements:

- type note
- save note
- delete/select existing note depending on implementation
- home/back controls

State:

- `draft`, `items`, `loading`

Data:

- local note utility persistence

### 4.15 SettingsScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/SettingsScreen.js`  
Routes:

- `SettingsScreen`
- hidden drawer settings route

Layout:

- home background
- profile area
- toggles, language selector, premium button, profile modal/input

Components:

- `ProfileImage`
- `LanguageSelector`
- `PremiumEmbossedButton`
- `HomeButton`

Interactive elements:

- notifications switch
- language dropdown
- profile image / profile modal open
- profile URL input
- save/update profile
- links to notification/privacy/subscription pages
- back/home

State:

- `notificationsEnabled`, `language`, `profilePictureUrl`, `isUpdatingProfile`, `isProfileModalVisible`, `profileModalUrl`

Dependencies:

- `AuthContext`
- `PreferencesContext`
- `ThemeContext`

### 4.16 NotificationSettingsScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/NotificationSettingsScreen.js`  
Route: `NotificationSettingsScreen`

Layout:

- home background
- four notification switches

Interactive elements:

- `morningEnabled`
- `afternoonEnabled`
- `eveningEnabled`
- `streakEnabled`
- back button

Data:

- `useNotifications`

### 4.17 PrivacySettingsScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/PrivacySettingsScreen.js`  
Route: `PrivacySettingsScreen`

Layout:

- home background
- privacy/analytics/personalization switches

Interactive elements:

- `trackingEnabled`
- `personalizationEnabled`
- `analyticsEnabled`
- back
- possibly navigate to deeper privacy or policy views

### 4.18 SubscriptionScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/SubscriptionScreen.js`  
Route: `SubscriptionScreen`

Layout:

- home background
- subscription tier cards
- current status CTA area

Interactive elements:

- choose tier
- open checkout
- open Stripe customer portal
- back/home

State:

- `status`, `loading`, `error`

Data/API:

- `fetchSubscriptionStatus`
- `createCheckoutSession`
- `createPortalSession`

Fragility:

- rendered tier UI appears to expect `price`, `period`, `trialDays` fields not clearly present in tier source objects

### 4.19 ConversationScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/ConversationScreen.js`  
Routes:

- `ConversationScreen`
- hidden drawer conversation route

Layout:

- conversation background with solid content zone
- transcript area
- review previous/next turn controls
- mic button
- text input + send button
- manual advance button

Components:

- `Background`
- `HomeButton`
- `MicButton`

User actions:

- start/stop recording
- type text message
- send typed message
- manually advance speaking turn
- review previous and next turns

State:

- `reviewTurnIndex`, `inputText`

Data flow:

- user utterance -> local speaking attempt store -> websocket send -> assistant reply -> TTS playback -> local transcript store

Errors:

- socket failures and TTS errors shown in-screen

### 4.20 FluencyScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/FluencyScreen.js`  
Route: `FluencyScreen`

Layout:

- practice background
- topic and duration selectors
- hold-to-talk UI
- timer/status area
- review/history/feedback panel
- debug panel in some modes

Interactive elements:

- select topic
- select duration
- press/hold mic
- expand/collapse feedback
- review history turns

State highlights:

- topicIndex/durationIndex/status/feedback/phase/followUpPrompt/timer/error/lexicalVariety/totalWords/fillerCount/pauseMarkers/paceWpm/history/debug

Behavior:

- computes lexical variety, filler counts, pause markers, pace
- generates AI follow-up via speaking turn engine
- speaks AI response via TTS

### 4.21 GuidedTurnScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/GuidedTurnScreen.js`  
Route: `GuidedTurnScreen`

Layout:

- conversation background
- prompt area
- hold-to-talk mic
- history filters
- feedback and debug panel

Interactive elements:

- press/hold mic
- filter history by level/mode/date/history bucket
- expand feedback
- review turn history

State highlights:

- filters, `needsPractice`, feedback, debug, waveform heights, permission status

Behavior:

- transcribes audio
- evaluates turn with `generateSpeakingTurn`
- stores AI and user transcript by speaking session

### 4.22 ShadowingScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/ShadowingScreen.js`  
Route: `ShadowingScreen`

Layout:

- practice background
- prompt/target line area
- tap mic to repeat
- diff/feedback panel
- history filters and warnings

Interactive elements:

- tap mic
- review feedback
- filter history
- replay target speech if allowed by implementation

State highlights:

- `shadowingDiff`, `lowConfidenceWarning`, `aiPlaying`, `ttsFailure`, `feedbackExpanded`, filters, debug

Behavior:

- compares transcript to expected speech
- computes diff and confidence
- can warn on silence or low-confidence transcription

### 4.23 MicroOutputScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/MicroOutputScreen.js`  
Route: `MicroOutputScreen`

Layout:

- practice background
- micro prompt
- 10-second timer
- start/stop speaking controls
- transcript/feedback/result area

Interactive elements:

- load new task
- start speaking
- stop speaking
- submit transcript
- retry/reset

State:

- `task`, `loading`, `feedback`, `error`, `timeRemaining`, `timerActive`

Data/API:

- `fetchMicroTask`
- `submitMicroTask`

Behavior:

- countdown auto-stops recording when time reaches zero

### 4.24 YKIScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/YKIScreen.js`  
Route: `YKIScreen`

Layout:

- YKI read background
- level-band selector
- primary start button
- info button

Interactive elements:

- select `A1_A2`, `B1_B2`, or `C1_C2`
- start exam
- open YKI info

State:

- `levelBand`, `loading`

Data/API:

- `startExamSession`
- clears persisted runtime before starting

Transition:

- navigates to `ExamRuntimeScreen` with `sessionId`

### 4.25 YKIInfoScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/YKIInfoScreen.js`  
Route: `YKIInfoScreen`

Layout:

- YKI read background
- static information blocks and external-link CTAs

Interactive elements:

- back
- open official YKI URLs via `Linking.openURL`

### 4.26 ExamRuntimeScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/ExamRuntimeScreen.tsx`  
Route: `ExamRuntimeScreen`

Role:

- shell/state machine for the entire current YKI runtime

State:

- `runtimeReady`
- `bootstrapError`
- `runtimeIntegrityError`
- reducer-driven controller state: phase, current screen index, timer, flags, submission status

Behavior:

- validates route params
- bootstraps session through `useExamSession`
- guards phase transitions
- restores persisted snapshot
- runs countdown timer
- routes internal flow to intro/runner/review/submit/processing/results/history/certificate/export
- redirects to YKI home if runtime integrity fails badly

API:

- session bootstrap
- answer/writing/audio submit
- final submit

### 4.27 ExamIntroScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/ExamIntroScreen.tsx`

Interactive elements:

- `Aloita testi`
- optional `Ohita testi`

Purpose:

- pre-exam introduction screen showing chosen level band

### 4.28 ExamRunnerScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/ExamRunnerScreen.tsx`

Layout:

- app header
- timer
- question navigator rail
- current section renderer
- flag button
- skip section / skip exam
- next/continue CTA

Interactive elements:

- select question index
- answer question
- toggle flag
- skip section
- skip exam
- next/continue

Delegates to:

- `ReadingQuestionsScreen`
- `ListeningQuestionsScreen`
- `WritingResponseScreen`
- `SpeakingController`

### 4.29 ReadingSection

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/ReadingSection.tsx`

Interactive elements:

- choose MCQ option
- choose true/false option

Behavior:

- shows passage and question set
- validates task structure

### 4.30 ListeningSection

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/ListeningSection.tsx`

Interactive elements:

- audio playback
- choose MCQ or true/false options

Behavior:

- resolves audio URL or audio asset ID
- validates listening task structure

### 4.31 WritingSection

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/WritingSection.tsx`

Interactive elements:

- type free-text answer

Behavior:

- builds display prompt
- enforces live word count using `WordCounter`
- exposes warning threshold at 60 words

### 4.32 SpeakingSection

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/SpeakingSection.tsx`

Interactive elements:

- record answer
- upload/submit audio

Behavior:

- shows speaking prompt and optional image
- delegates recording/upload to `RecordingPanel`

### 4.33 ReviewAnswersScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/ReviewAnswersScreen.tsx`

Interactive elements:

- select question from navigator
- submit exam

Behavior:

- counts answered screens
- treats prompt-only informational screens as auto-complete

### 4.34 SubmitExamScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/SubmitExamScreen.tsx`

Interactive elements:

- confirm submission

Behavior:

- shows answered vs total count
- disables button while submitting

### 4.35 SubmissionProcessingScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/SubmissionProcessingScreen.tsx`

Interactive elements:

- retry link when processing fails

Behavior:

- auto-advances through staged progress text

### 4.36 ResultsOverviewScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/ResultsOverviewScreen.tsx`

Interactive elements:

- continue to detailed analysis

Behavior:

- renders section score summary cards

### 4.37 DetailedFeedbackScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/DetailedFeedbackScreen.tsx`

Interactive elements:

- choose a question feedback item
- continue to CEFR level

Behavior:

- displays user answer and correct answer when available

### 4.38 CEFRLevelScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/CEFRLevelScreen.tsx`

Interactive elements:

- continue to certificate

Behavior:

- shows derived CEFR level progression

### 4.39 CertificateScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/CertificateScreen.tsx`

Interactive elements:

- continue to export

Behavior:

- renders certificate-style result card

### 4.40 ExportResultsScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/ExportResultsScreen.tsx`

Interactive elements:

- download PDF
- share link
- show test history

### 4.41 ExamHistoryScreen

File: `/home/vitus/Documents/puhis/frontend/app/exam_runtime/screens/ExamHistoryScreen.tsx`

Interactive elements:

- select a previous history item
- close

Behavior:

- shows prior exams with level band and date metadata

### 4.42 YKIExamEndScreen

File: `/home/vitus/Documents/puhis/frontend/app/screens/YKIExamEndScreen.js`  
Route: `YKIExamEndScreen`

Layout:

- YKI read background
- latest result summary
- fallback banners
- previous placement history list

Interactive elements:

- navigate back to YKI home

State:

- `result`, `loading`, `history`

Data:

- `ykiPlacementHistory`
- `ykiSessionStorage`

### 4.43 Legacy Exam Components Still Present

Files under `/home/vitus/Documents/puhis/frontend/app/components/exam`:

- `ListeningPromptScreen.tsx`
- `ListeningQuestionsScreen.tsx`
- `ReadingPromptScreen.tsx`
- `ReadingQuestionsScreen.tsx`
- `SpeakingPromptScreen.tsx`
- `SpeakingRecordScreen.tsx`
- `WritingPromptScreen.tsx`
- `WritingResponseScreen.tsx`

These are componentized prompt/response surfaces for an older exam UI generation. They are not the top-level current route endpoints, but they encode exam behavior patterns that may still be relevant in a rebuild.

## 5. UI Component System

### Core Interactive Components

| Component | Files | Props / Inputs | Behavior |
| --- | --- | --- | --- |
| `Background` | `/home/vitus/Documents/puhis/frontend/app/components/ui/Background.tsx` | `module`, `variant`, `imageVariant`, `modalBlur`, `solidContentZone`, `disableAutoAnimation` | theme-aware gradient/image background, blur, animation layers |
| `MicButton` | `/home/vitus/Documents/puhis/frontend/app/components/MicButton.js` | `onPress`, `onPressIn`, `onPressOut`, `isRecording`, `size`, `holdToTalk` | tap-to-toggle or press/hold recording control |
| `MicRecorder` | `/home/vitus/Documents/puhis/frontend/app/components/MicRecorder.js` | callbacks, locale, minSeconds, holdToTalk | wraps recorder creation, permission, start/stop, transcription handoff |
| `AnimatedCTA` | `/home/vitus/Documents/puhis/frontend/app/components/AnimatedCTA.js` | `label`, `onPress`, `disabled` | animated primary CTA with press and glow effects |
| `PremiumEmbossedButton` | `/home/vitus/Documents/puhis/frontend/app/components/PremiumEmbossedButton.js` | `variant`, `size`, `onPress`, `disabled` | stylized embossed gradient action button |
| `HomeButton` | `/home/vitus/Documents/puhis/frontend/app/components/HomeButton.js` | `navigation`, `homeType` | routes user back to home target |
| `LanguageSelector` | `/home/vitus/Documents/puhis/frontend/app/components/LanguageSelector.js` | `onLanguageChange` | local dropdown/picker persisted to async storage |
| `ProfileImage` | `/home/vitus/Documents/puhis/frontend/app/components/ProfileImage.js` | size/style props | displays user avatar URL or fallback |
| `RukaCard` | `/home/vitus/Documents/puhis/frontend/app/components/ui/RukaCard.js` | accent/style props | generic elevated gradient card wrapper |
| `CardSessionView` | `/home/vitus/Documents/puhis/frontend/app/components/session/CardSessionView.tsx` | `config`, `onExit` | full card learning UI with start, feedback, next, restart, exit |
| `RecordingPanel` | `/home/vitus/Documents/puhis/frontend/app/exam_runtime/components/RecordingPanel.tsx` | `sessionId`, `taskId`, `value`, `onChange`, labels | record/upload/submit exam speaking answers |
| `AudioPlayer` | `/home/vitus/Documents/puhis/frontend/app/exam_runtime/components/AudioPlayer.tsx` | url/id/replay flags | playback UI for listening tasks |
| `QuestionNavigator` | `/home/vitus/Documents/puhis/frontend/app/exam_runtime/components/QuestionNavigator.tsx` | tasks, answers, flags, onSelect | mini-map of question completion/flag status |
| `PrimaryButton` | `/home/vitus/Documents/puhis/frontend/app/exam_runtime/components/PrimaryButton.tsx` | `title`, `onPress`, `secondary`, `disabled` | runtime-wide CTA button |
| `WritingEditor` | `/home/vitus/Documents/puhis/frontend/app/exam_runtime/components/WritingEditor.tsx` | `value`, `onChangeText` | writing input shell |

### Conversation / Transcript Components

- `TranscriptTurnView.js`
- `TurnConversationSection.js`
- `TutorBubble.js`
- `UserBubble.js`
- `ConversationHeader.js`
- `TranscriptionViewer.js`

These render conversation transcripts, turn grouping, and chat-like bubbles. In current screens, some transcript rendering is custom and some is delegated.

### Speaking Diagnostics / Support Components

- `SpeakingScreenWrapper.js`
- `SpeakingDebugPanel.tsx`
- `PronunciationNudge.js`
- `TTSProviderIndicator.tsx`
- `YkiSpeakingWaveform.js`
- `Waveform.js`

`SpeakingScreenWrapper` is architecturally important. It generates stable speaking session IDs based on route params and wraps speaking screens in session context, preventing duplicate session creation during rerenders.

### Professional Module Launcher

File: `/home/vitus/Documents/puhis/frontend/app/components/professional/professionalModules.js`

Current module IDs:

- `Lesson`
- `Roleplay`
- `Sentences`
- `Grammar`
- `Quiz`
- `Vocabulary`

Navigation behavior:

- `Roleplay` -> `RoleplayScreen`
- `Vocabulary`, `Grammar`, `Sentences` -> `VocabularyScreen` with different content/session config
- `Quiz` -> `QuizScreen`
- everything else -> `LessonDetailScreen`

## 6. Card System

### Card Content Types

- `vocabulary_card`
- `sentence_card`
- `grammar_card`

### Card Domains

- `general`
- `professional`

### Session Lifecycle

1. Screen resolves a `ResolvedCardSessionConfig`.
2. `useCardSession` starts normal or adaptive session.
3. Backend returns `session` and `current_card`.
4. User flips card, sees prompt/front/back.
5. User answers using variant-specific UI.
6. Answer submitted to `/cards/runtime/session/{session_id}/answer`.
7. UI shows correctness, explanation, accepted variants, correct answer, recommended next action.
8. User continues to queued next card or session-complete screen.

### Variant Input Models

- options mode: recognition/context MCQ
- text mode: typed recall or reverse recall
- fill-in mode with blank template
- grammar mode with stimulus text

### Feedback Behavior

Feedback state stores:

- `correct`
- `isCorrect`
- `expectedVariantType`
- `evaluationMode`
- `submittedAnswerNormalized`
- `correctAnswer`
- `acceptedVariants`
- `explanation`
- `nextRecommendedAction`
- `sessionCompleted`
- `adaptiveUpdate`

### Completion Behavior

When session finishes, `SessionCompletionView` offers:

- restart session
- end session

## 7. Roleplay & Conversation System

### ConversationScreen Flow

1. Screen gets `level`, `path`, `field`, `type` from route params.
2. `SpeakingScreenWrapper` provides stable session ID.
3. User speaks or types.
4. `useVoiceStreaming` records audio and produces transcript.
5. Transcript is stored in speaking-attempt session.
6. `useConversationSocket` sends user utterance to websocket backend.
7. Backend returns assistant reply.
8. Reply is stored locally and spoken with TTS.
9. User can review turn history or manually advance speaking turn.

Important interaction surfaces:

- mic start/stop
- typed input field
- send button
- previous/next turn review buttons
- advance button

### RoleplayScreen Flow

1. Screen starts backend session with field/scenario/level.
2. Backend returns first AI line and AI name.
3. AI line is spoken with TTS and stored as turn 0.
4. User records or types reply.
5. `advanceRoleplayTurn` sends transcript to backend.
6. Backend returns next AI turn and completion flag.
7. Completed grouped transcript is POSTed to `/roleplay/complete`.
8. Screen requests `/roleplay/score`.
9. Result panel displays score or sync error.

Persisted session rules:

- backend only persists completed roleplay sessions
- invalid timing or empty transcripts are rejected
- idempotency is based on `client_session_id + user`

### GuidedTurn / Fluency / Shadowing

All three use a local speaking-evaluation loop:

- record
- transcribe
- compute or request feedback
- optionally generate AI follow-up
- store speaking attempt transcript locally
- speak AI response if applicable

Distinctive behavior:

- `FluencyScreen`: lexical variety, filler count, pause markers, words-per-minute
- `GuidedTurnScreen`: prompt-set practice with filterable attempt history
- `ShadowingScreen`: expected-vs-transcribed diff and low-confidence warning

## 8. Audio / TTS System

### Audio Sources

- user-recorded microphone input
- backend-generated TTS streams
- YKI listening audio assets
- bundled UI sounds

### Frontend Playback Logic

UI sounds:

- `/home/vitus/Documents/puhis/frontend/app/assets/sounds/ui/mic_on.wav`
- `/home/vitus/Documents/puhis/frontend/app/assets/sounds/ui/mic_off.wav`
- `/home/vitus/Documents/puhis/frontend/app/assets/sounds/ui/send1.wav`
- `/home/vitus/Documents/puhis/frontend/app/assets/sounds/ui/pop_light.wav`
- `/home/vitus/Documents/puhis/frontend/app/assets/sounds/ui/success_chime.wav`
- `/home/vitus/Documents/puhis/frontend/app/assets/sounds/ui/tap_soft.wav`
- `/home/vitus/Documents/puhis/frontend/app/assets/sounds/ui/error.wav`

TTS flow:

1. `useVoice.speak()` calls `playTTS()`.
2. TTS opens websocket to `/voice/tts-stream`.
3. Backend streams `tts_start`, binary audio chunks, `tts_end`.
4. Frontend buffers chunks, writes cache file under Expo file cache, plays audio.
5. On failure, retries twice.
6. On final failure, resolves without throwing hard UI failure.

STT flow:

1. frontend recorder captures audio
2. `stopRecordingService` uploads audio to `/voice/stt`
3. backend transcribes via faster-whisper or OpenAI audio transcription
4. transcript returned to screen hooks

YKI listening flow:

- engine serves `/api/audio/{audio_asset_id}.mp3`
- frontend runtime schema can extract `audio_asset_id` from URL or explicit field

### Caching and Retry

- TTS audio cached in file-system cache directory
- TTS provider retries: 2 frontend retries
- backend provider-health and provider-resolution logic exist
- exam speaking upload has local submit lock to prevent duplicate submission

## 9. Background Images & Visual Assets

### Canonical Background System

Primary files:

- `/home/vitus/Documents/puhis/frontend/app/components/ui/Background.tsx`
- `/home/vitus/Documents/puhis/frontend/app/lib/backgroundLoader.ts`

Behavior:

- theme-aware image selection (`light` vs `dark`)
- module-specific gradients
- optional blur overlay
- optional animated layers
- image opacity around `0.72`
- `LESSON_EXAM_BG = "#0A0E27"` for solid lesson/exam zones

### Canonical Background Image Mapping

Dark theme:

- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/dark/login/login_dark.png` -> login/welcome family
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/dark/home/home_dark.png` -> home/settings/onboarding home-family screens
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/dark/conversation/convo_dark.png` -> conversation screens
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/dark/practice/practice_dark.png` -> practice speaking and quiz screens
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/dark/workplace/workplace_light.png` -> workplace module screens in dark mode mapping
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/dark/yki/yki_read_dark.png` -> YKI reading/home/info/end screens
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/dark/yki/yki_write_dark.png` -> YKI write module background source
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/dark/yki/yki_listen_dark.png` -> YKI listen module background source
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/dark/yki/yki_speak_dark.png` -> YKI speak module background source

Light theme:

- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/light/login/login_light.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/light/home/home_light.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/light/conversation/convo_light.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/light/practice/practice_light.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/light/workplace/workplace_light.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/light/yki/yki_read_light.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/light/yki/yki_write_light.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/light/yki/yki_listen_light.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/backgrounds/light/yki/yki_speak_light.png`

### Screen to Background Mapping

- `WelcomeScreen` -> `module=login`, `variant=blue`, `imageVariant=login`
- `LoginScreen` -> `module=login`, `variant=brown`
- `RegisterScreen` -> `module=login`, `variant=brown`
- `HomeScreen` -> `module=home`, `variant=brown`, `imageVariant=home`
- `IntentQuizScreen` -> `module=home`, `variant=blue`, `imageVariant=intent`
- `PlanSelectionScreen` -> `module=home`, `variant=blue`, `imageVariant=PlanSelection`
- `PracticeFrequencyScreen` -> `module=home`, `variant=blue`, `imageVariant=PracticeFrequency`
- `NotesScreen` -> `module=home`, `variant=brown`
- `SettingsScreen` -> `module=home`, `variant=brown`
- `NotificationSettingsScreen` -> `module=home`, `variant=brown`
- `PrivacySettingsScreen` -> `module=home`, `variant=brown`
- `SubscriptionScreen` -> `module=home`, `variant=brown`
- `ConversationScreen` -> `module=conversation`, `variant=blue`, solid content zone
- `GuidedTurnScreen` -> `module=conversation`, `variant=blue`, solid content zone
- `PracticeScreen` -> `module=practice`, `variant=brown`
- `FluencyScreen` -> `module=practice`, `variant=brown`, solid content zone
- `MicroOutputScreen` -> `module=practice`, `variant=blue`, solid content zone
- `QuizScreen` -> `module=practice`, `variant=blue`, solid content zone
- `ShadowingScreen` -> `module=practice`, `variant=brown`, solid content zone
- `ProfessionSelectionScreen` -> `module=workplace`, `variant=blue`, `imageVariant=workplace`
- `WorkplaceScreen` -> `module=workplace`, `variant=brown`
- `LessonDetailScreen` -> `module=workplace`, `variant=blue`, solid content zone
- `YKIScreen` -> `module=yki_read`, `variant=blue`
- `YKIInfoScreen` -> `module=yki_read`, `variant=blue`
- `YKIExamEndScreen` -> `module=yki_read`, `variant=blue`

### Other Visual Assets

Logos:

- `/home/vitus/Documents/puhis/frontend/app/assets/logo/taika_logo_1.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/logo/taika_logo_2.png`

Legacy image assets:

- `/home/vitus/Documents/puhis/Ruka Images/metsä_talvi.png`
- `/home/vitus/Documents/puhis/Ruka Images/revontuli.png`
- `/home/vitus/Documents/puhis/Ruka Images/snow_pile.png`

Misc bundled images present in repo:

- `/home/vitus/Documents/puhis/frontend/app/assets/images/04a899af3be3d0156152fc82ca6ad992.jpg`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/Same transcription.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/speaking_and saving_session.png`
- `/home/vitus/Documents/puhis/frontend/app/assets/images/turn_conversation_section.png`

Additional background art exists under light/dark subfolders for admin, certificate, fluency, guided-turn, misc, and selection screens. Some of these appear to be legacy or unused, so the rebuild should preserve files but only recreate currently referenced mappings first.

## 10. State Management System

### React Contexts

Files:

- `/home/vitus/Documents/puhis/frontend/app/context/AuthContext.js`
- `/home/vitus/Documents/puhis/frontend/app/context/PathContext.js`
- `/home/vitus/Documents/puhis/frontend/app/context/PreferencesContext.js`
- `/home/vitus/Documents/puhis/frontend/app/context/ThemeContext.js`
- `/home/vitus/Documents/puhis/frontend/app/context/SpeakingSessionContext.js`

Responsibilities:

- auth and token state
- selected path/profession
- animations/backgrounds/speech rate preferences
- theme choice
- stable speaking session state for speaking drills

### Zustand / Local Stores

Files:

- `/home/vitus/Documents/puhis/frontend/app/state/useOnboardingSession.js`
- `/home/vitus/Documents/puhis/frontend/app/state/useConversationStore.js`
- `/home/vitus/Documents/puhis/frontend/app/state/useRukaStore.ts`
- `/home/vitus/Documents/puhis/frontend/app/state/useThemeStore.js`
- `/home/vitus/Documents/puhis/frontend/app/state/useUserStore.js`
- `/home/vitus/Documents/puhis/frontend/app/state/useXPStore.js`

Responsibilities:

- onboarding selections
- conversation message/topic state
- orb amplitude/mood
- duplicate theme state
- duplicate user state
- XP and streak state

### Persistence Keys

- `@ruka_auth`
- `@ruka_token`
- `@ruka_refresh_token`
- `theme`
- `preferences_animations`
- `preferences_backgrounds`
- `preferences_speech_rate`
- `@ruka_app_language`
- `@kielitaika/exam_runtime_session`
- `yki_exam_session::<userId>::<examType>::<levelBand>::schemaV2`
- `yki_placement_history::<userId>`

### Mutation Pattern

- auth mutations happen through `AuthContext`
- onboarding mutations happen through Zustand store
- speaking attempt mutations happen through utilities/context
- exam runtime mutations happen through reducer + snapshot persistence

## 11. API & Backend Interaction

### Auth

- `POST /register`
  - request: `{ email, password, name? }`
  - response: `{ access_token, refresh_token, token_type, user_id, email, subscription_tier }`
- `POST /login`
  - request: `{ email, password }`
- `POST /refresh`
  - request: `{ refresh_token }`
- `GET /me`

### Workplace

- `GET /workplace/fields`
  - response: `{ fields: [...] }`
- `POST /workplace/lesson`
  - request: `{ field, level, user_id }`
  - response: `{ lesson: ... }`

### Roleplay

- `POST /roleplay/session/start`
  - request: `{ role_or_field, scenario_identifier?, difficulty_optional?, user_id? }`
  - response: `{ sessionId, turnIndex, aiName, aiText }`
- `POST /roleplay/session/{session_id}/turn`
  - request: `{ profession_field, scenario_title?, cefr_level?, turn_index, user_transcript }`
  - response: `{ sessionId, turnIndex, aiName, aiText, completed }`
- `POST /roleplay/complete`
- `POST /roleplay/score`
- `GET /roleplay/{attempt_id}`

### Conversation WebSocket

- `WS /ws/conversation/{user_id}`
  - inbound: `{ role, text, level, path, profession, enable_progressive_disclosure }`
  - outbound: `{ role, text, masked_text, support_level, grammar_info }`

### Voice / Audio

- `WS /voice/stt-stream`
- `GET /voice/tts/health`
- `POST /voice/tts/generate`
- `GET /voice/tts/audio/{cache_key}.{file_extension}`
- `HEAD /voice/tts/audio/{cache_key}.{file_extension}`
- `WS /voice/tts-stream`
- `POST /voice/pronunciation/analyze`
- `POST /voice/pronunciation/analyze-v2`
- `POST /voice/pronunciation/nudge`
- `POST /voice/stt`

### Micro Output / Shadowing / Recharge / Engagement

- `GET /output/micro`
- `POST /output/micro/evaluate`
- `GET /shadowing/line`
- `POST /shadowing/score`
- `GET /recharge/today`
- `POST /recharge/update`
- `POST /recharge/complete`
- `GET /engagement/notifications`
- `GET /engagement/state`
- `GET /engagement/micro-challenge`
- `POST /engagement/xp`

### Subscription / Payments

- `GET /subscription/status`
- `POST /subscription/upgrade`
- `POST /subscription/downgrade`
- `POST /subscription/check-feature`
- `POST /payments/create-checkout`
- `POST /payments/create-portal`
- `POST /payments/webhook`

### Cards Runtime

- `POST /cards/runtime/session/start`
- `GET /cards/runtime/session/adaptive/start`
- `GET /cards/runtime/session/{session_id}/next`
- `POST /cards/runtime/session/{session_id}/answer`
- `GET /cards/runtime/deck`
- `GET /cards/runtime/runtime`
- `GET /cards/runtime/admin/publication`
- `POST /cards/runtime/admin/publish`

### YKI Runtime Relay

- `GET /health`
- `GET /engine/health`
- `GET /engine/status`
- `GET /engine/metrics`
- `GET /engine/session/{session_id}/diagnostics`
- `POST /exam/start`
- `GET /exam/{session_id}`
- `GET /exam/{session_id}/time`
- `GET /exam/{session_id}/progress`
- `POST /exam/{session_id}/answer`
- `POST /exam/{session_id}/writing`
- `POST /exam/{session_id}/audio`
- `POST /exam/speaking/start_conversation`
- `POST /exam/speaking/submit_turn`
- `POST /exam/speaking/generate_reply`
- `POST /exam/{session_id}/submit`
- `GET /exam/{session_id}/certificate`
- `GET /exam/{session_id}/audio-assets/{task_id}`
- `POST /upload/audio`

## 12. Data Structures & Schemas

### Auth Token Response

- `access_token`
- `refresh_token`
- `token_type`
- `user_id`
- `email`
- `subscription_tier`

### Card Runtime Types

Important frontend types from `/home/vitus/Documents/puhis/frontend/app/services/api/cards.ts`:

- `CardVariantType`
- `CardContentType`
- `CardDomain`
- `ProfessionTrack`
- `LevelBand`
- `CardLearningState`
- `ServedFollowUpResponse`
- `CardPreviewResponse`
- `SessionStateResponse`
- `AnswerResponse`
- `StartCardSessionInput`

Important card response fields:

- `session_id`
- `current_card_index`
- `total_cards`
- `answered_count`
- `served_follow_up.variant_type`
- `correct_answer`
- `accepted_variants`
- `next_recommended_action`

### YKI Exam Schema

Important backend schema files:

- `/home/vitus/Documents/puhis/backend/app/schemas/yki_exam_v2.py`
- `/home/vitus/Documents/puhis/backend/app/schemas/yki_submissions.py`

Important concepts:

- exam -> sections -> task sets -> tasks
- timers:
  - prep seconds
  - answer seconds
  - total section / exam timers
- submissions:
  - MCQ: `answers: list[int]`
  - writing: `text`
  - speaking: `user_text`

### Runtime Exam Screen Shape

Normalized by `/home/vitus/Documents/puhis/frontend/app/exam_runtime/schema/runtimeExamSchema.ts`

Important fields:

- `task_id`
- `answer_id`
- `screen_type`
- `skill`
- `title`
- `instruction`
- `response_items`
- `audio`
- `audio_url`
- `prompt_audio_url`
- `content`

### Voice Schema

From `/home/vitus/Documents/puhis/backend/app/schemas/voice.py`:

- STT response includes transcript/warnings/errors style fields
- pronunciation analysis returns feedback, transcript, score-oriented data

### Persistent DB Models

Important SQLAlchemy models in `/home/vitus/Documents/puhis/backend/app/db/models.py`:

- `User`
- `GrammarLog`
- `PronunciationLog`
- `UsageLog`
- `DailyRecharge`
- `UserDailyState`
- `RechargeHistory`
- `RoleplayAttempt`
- `RoleplayTurn`
- `RoleplayScore`
- `YKISession`
- `YKIExamEvent`
- `YKIExamSnapshot`
- `YKIAssemblyAuditLog`
- `YKIExamAssemblyAuditLog`
- `YKISessionResult`
- `YKIEvaluation`
- `YKIPlacement`
- `YKISessionAttempt`

## 13. Navigation System

### Root Structure

Files:

- `/home/vitus/Documents/puhis/frontend/app/navigation/routes.ts`
- `/home/vitus/Documents/puhis/frontend/app/navigation/RootNavigator.tsx`
- `/home/vitus/Documents/puhis/frontend/app/navigation/AppNavigator.tsx`

Behavior:

- `AppNavigator` decides unauthenticated flow, onboarding completion, or authenticated drawer app
- authenticated main app is drawer + nested stacks

### Unauthenticated Stack

- `Welcome`
- `IntentQuiz`
- `PlanSelection`
- `ProfessionSelection`
- `Auth`
- `Login`
- `PracticeFrequency`

### Main Drawer

- `Home`
- `YKIPlan`
- `WorkPlan`
- hidden `Practice`
- hidden `DrawerConversation`
- hidden `DrawerSettings`

### YKI Stack

- `YKIScreen`
- `YKIInfoScreen`
- `ExamRuntimeScreen`
- `YKIExamEndScreen`
- `ConversationScreen`
- `FluencyScreen`
- `GuidedTurnScreen`
- `ShadowingScreen`
- `MicroOutputScreen`
- `SettingsScreen`
- `NotificationSettingsScreen`
- `PrivacySettingsScreen`
- `SubscriptionScreen`

### Work Stack

- `WorkplaceScreen`
- `RoleplayScreen`
- `VocabularyScreen`
- `QuizScreen`
- `LessonDetailScreen`
- `NotesScreen`
- same speaking/settings/subscription screens reused

### Speaking Session Wrapping

The following routes are wrapped in `SpeakingScreenWrapper`:

- `ConversationScreen`
- `FluencyScreen`
- `GuidedTurnScreen`
- `ShadowingScreen`
- `MicroOutputScreen`
- `RoleplayScreen`

This wrapper is a real part of navigation semantics because it generates stable per-route speaking session IDs.

## 14. Error Handling & Recovery

### Frontend Recovery Patterns

- auth screens surface inline error messages
- workplace/quiz/lesson screens fall back to retry or generated default content
- `CardSessionView` shows retry button on session-start failure
- exam runtime catches bootstrap and integrity failures, then redirects to YKI home
- submission-processing screen offers retry
- TTS failures degrade silently after retries
- voice recording stop/start failures surface user-visible errors

### Backend Recovery Patterns

- roleplay completion rejects incomplete sessions instead of storing broken data
- TTS route reports structured websocket errors
- STT returns empty string on failure paths instead of crashing
- YKI relay returns relayed status/payload from engine

### Silent Failure Zones

- some frontend API helpers call endpoints not confirmed in backend router inventory
- some background assets exist without clear active references
- some optional UI links/settings icons do not do anything

## 15. Known Fragilities

1. `/home/vitus/Documents/puhis/frontend/app/utils/api.js` appears to call `PATCH /user/profile`, but no matching backend router was confirmed in the current router inventory.
2. `/home/vitus/Documents/puhis/frontend/app/utils/api.js` appears to call `/analytics/event`, but no matching backend router was confirmed either.
3. `/home/vitus/Documents/puhis/frontend/app/screens/WorkplaceScreen.js` renders a visible settings icon with no `onPress`.
4. `/home/vitus/Documents/puhis/frontend/app/screens/SubscriptionScreen.js` appears to render tier fields such as price/period/trialDays that are not clearly present in the tier definitions.
5. `/home/vitus/Documents/puhis/frontend/app/lib/backgroundLoader.ts` maps dark workplace background to a file named `workplace_light.png`; this is likely naming drift or asset mismatch.
6. State ownership is duplicated:
   - `ThemeContext` and `useThemeStore`
   - auth/user context and `useUserStore`
7. The repo contains overlapping UI generations:
   - legacy screens
   - current exam runtime
   - older exam component screens
8. Large generated content-bank and audit surfaces make it easy to rebuild too much of the repo instead of the actual app behavior.
9. Conversation, speaking, and roleplay features depend on both local speaking session state and backend responses; missing either side will produce subtle behavior regressions.

## 16. Reconstruction Requirements

### Must Be Preserved Exactly

- route structure and user journey order
- auth token persistence and subscription-derived access gates
- speaking session identity model from `SpeakingScreenWrapper`
- card runtime contract and supported follow-up variants
- workplace field IDs and profession mapping rules
- roleplay start/turn/complete/score lifecycle
- YKI runtime state machine, guarded transitions, and section ordering
- current background-image mapping by module/screen
- local persistence keys where user continuity matters

### Can Be Improved Later

- visual cleanup and duplicated UI generations
- store/context duplication
- naming inconsistencies in assets and modules
- code organization and dead component removal
- fallback handling and telemetry consistency

### Must Not Be Carried Over Uncritically

- orphaned or unused background variants
- duplicate state containers without a single owner
- silent endpoint mismatches
- any UI control with no action handler unless intentionally preserved as frozen legacy behavior

## 17. Full System Rebuild Checklist

- [ ] Welcome screen implemented
- [ ] Intent quiz implemented
- [ ] Plan selection implemented
- [ ] Profession selection implemented
- [ ] Register screen implemented
- [ ] Login screen implemented
- [ ] Practice frequency screen implemented
- [ ] Home screen implemented
- [ ] General practice landing implemented
- [ ] Workplace landing implemented
- [ ] Vocabulary card session implemented
- [ ] Grammar card session implemented
- [ ] Sentence card session implemented
- [ ] Quiz screen implemented
- [ ] Lesson detail screen implemented
- [ ] Notes screen implemented
- [ ] Settings screen implemented
- [ ] Notification settings screen implemented
- [ ] Privacy settings screen implemented
- [ ] Subscription screen implemented
- [ ] Conversation screen implemented
- [ ] Fluency screen implemented
- [ ] Guided turn screen implemented
- [ ] Shadowing screen implemented
- [ ] Micro output screen implemented
- [ ] Roleplay screen implemented
- [ ] YKI home screen implemented
- [ ] YKI info screen implemented
- [ ] YKI runtime shell implemented
- [ ] Exam intro screen implemented
- [ ] Exam runner screen implemented
- [ ] Reading section implemented
- [ ] Listening section implemented
- [ ] Writing section implemented
- [ ] Speaking section implemented
- [ ] Review answers screen implemented
- [ ] Submit exam screen implemented
- [ ] Submission processing screen implemented
- [ ] Results overview screen implemented
- [ ] Detailed feedback screen implemented
- [ ] CEFR level screen implemented
- [ ] Certificate screen implemented
- [ ] Export results screen implemented
- [ ] Exam history screen implemented
- [ ] YKI exam end screen implemented
- [ ] Auth/token persistence preserved
- [ ] Theme/preferences persistence preserved
- [ ] Speaking session persistence preserved
- [ ] YKI runtime snapshot persistence preserved
- [ ] YKI placement history preserved
- [ ] Workplace field engine preserved
- [ ] Roleplay scoring preserved
- [ ] Card runtime API contract preserved
- [ ] TTS streaming preserved
- [ ] STT upload/transcription preserved
- [ ] Pronunciation analysis preserved
- [ ] Subscription/payment integration preserved
- [ ] Background image mapping preserved
- [ ] UI sound mapping preserved
- [ ] DB models mapped to replacement persistence layer
- [ ] Engine relay contract preserved
- [ ] Legacy/unreferenced exam components reviewed before deletion

## End Verification

This document covers:

- every currently routed screen in the legacy app
- every internal YKI runtime screen in the current exam flow
- the main reusable interactive component system
- the card, conversation, roleplay, workplace, audio, subscription, and YKI engines
- current asset-to-screen background mapping
- state, API, persistence, and fragility details needed for a rebuild

Recommended rebuild interpretation:

- treat this repo as a frozen behavioral reference
- rebuild the current routed product first
- then selectively port validated legacy subcomponents and content-bank logic
