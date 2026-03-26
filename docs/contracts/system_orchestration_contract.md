# System Orchestration Contract

Status: `frozen`  
Mode: `fail-closed`  
Scope: runtime coordination across UI, app API, auth, session, payment, cards, roleplay, voice, and YKI engine integration

This document does not replace system contracts. It defines runtime order, trigger ownership, dependency direction, and response propagation between already-authoritative systems.

## 3.1 APP LIFECYCLE FLOW

Runtime boot order is fixed:

1. App process starts.
2. UI shell enters `booting`. No feature screen is hydrated yet.
3. Frontend reads `kt.auth.session.v1`.
4. If `kt.auth.session.v1` is absent, auth state becomes `unauthenticated` and the app skips authenticated session restoration.
5. If `kt.auth.session.v1` exists, frontend validates its structure locally.
6. If the auth snapshot is structurally invalid, frontend deletes it and sets auth state to `unauthenticated`.
7. If the auth snapshot is structurally valid, frontend enters auth `restoring`.
8. Frontend calls `GET /api/v1/auth/session` with the persisted access token.
9. If `GET /api/v1/auth/session` succeeds, frontend replaces the cached `auth_user` snapshot with the returned canonical user snapshot.
10. If `GET /api/v1/auth/session` fails with expired access state, frontend performs exactly one `POST /api/v1/auth/token/refresh`.
11. If refresh succeeds, frontend replaces the stored token pair, then retries `GET /api/v1/auth/session`.
12. If refresh fails, frontend clears `kt.auth.session.v1` and enters `unauthenticated`.
13. After auth settles to `authenticated`, frontend fetches `GET /api/v1/subscription/status`.
14. Until `subscription/status` returns, route gating may use `subscription_tier` from the restored auth snapshot only as a temporary boot cache.
15. Once `subscription/status` returns, payment entitlements become the runtime gating source of truth.
16. Only after auth and entitlement state settle may the app attempt restorable feature-session hydration.
17. Frontend scans `kt.session.roleplay.v1::<roleplay_session_id>` entries that belong to the authenticated user context.
18. For each cached roleplay session, frontend validates local structure, checks `expires_at`, and then confirms the session remotely with `GET /api/v1/roleplay/sessions/{session_id}`.
19. Invalid or expired roleplay caches are deleted before UI hydration.
20. Frontend scans `kt.session.yki_runtime.v1::<exam_session_id>` entries.
21. For each cached YKI runtime entry, frontend validates local structure, then confirms it with `GET /api/v1/yki/sessions/{session_id}`.
22. If the adapter or engine rejects the YKI session, frontend deletes the YKI runtime cache.
23. Speaking sessions are never restored from disk. They are recreated only when a new speaking-capable screen is entered.
24. After auth, payment, and restorable session checks complete, root navigation hydrates.
25. UI route selection is based on:
   - authenticated vs unauthenticated state
   - current entitlement state from payment
   - presence of a still-valid restorable roleplay or YKI runtime session
26. Feature screens render only after their owning system state is confirmed.

## 3.2 AUTH + SESSION INTERACTION

Auth and session coordination rules:

1. Auth creation happens only through `POST /api/v1/auth/register/password`, `POST /api/v1/auth/login/password`, `POST /api/v1/auth/login/provider`, or the Google OAuth pair `POST /api/v1/auth/google` + `GET /api/v1/auth/google/callback`.
2. Successful auth returns `auth_user` plus `AuthTokens`.
3. Frontend writes exactly one `kt.auth.session.v1` snapshot.
4. `kt.auth.session.v1` is the boot cache, not the long-term authority.
5. Backend auth endpoints are the source of truth for token validity and the authenticated user snapshot.
6. Session restoration depends on auth restoration first.
7. Roleplay and YKI session restoration are blocked until auth is `authenticated`.
8. Logout clears `kt.auth.session.v1` first in local state reaction terms, then attempts remote logout.
9. If logout API fails, local auth still remains cleared.
10. A valid auth session is required before any backend-owned feature session may be resumed or created.

Source-of-truth split:

| Concern | Source of Truth | Boot Cache |
| --- | --- | --- |
| token validity | app backend auth system | `kt.auth.session.v1` |
| authenticated user snapshot | app backend auth system | `kt.auth.session.v1` |
| subscription entitlements | payment backend | `subscription_tier` inside auth snapshot until `/subscription/status` returns |
| roleplay session validity | roleplay backend | `kt.session.roleplay.v1::<id>` |
| YKI exam session validity | YKI engine through app adapter | `kt.session.yki_runtime.v1::<id>` |

## 3.3 UI -> API -> SYSTEM FLOW

### Cards

1. UI trigger:
   - user selects a cards domain and optional filters
   - user chooses standard or adaptive cards mode
2. API call:
   - standard mode: `POST /api/v1/cards/session/start`
   - adaptive mode: `GET /api/v1/cards/session/adaptive/start`
   - next card: `GET /api/v1/cards/session/{session_id}/next`
   - answer current card: `POST /api/v1/cards/session/{session_id}/answer`
3. Session usage:
   - requires active auth session
   - returned `session_id` is a cards-runtime session owned by the cards backend
   - cards `session_id` is not part of the persistent restore set defined in `session_contract.md`
4. Response handling:
   - start response hydrates the first card session view
   - answer response updates current card result state
   - if the session remains active, UI requests `next`
   - if the session completes, UI shows the completion/restart state and may start a new session, not resume the old one

### Roleplay

1. UI trigger:
   - user selects scenario, level, and display preferences on the setup screen
   - user taps start
2. API call:
   - create session: `POST /api/v1/roleplay/sessions`
   - submit turn: `POST /api/v1/roleplay/sessions/{session_id}/turns`
   - refresh session state: `GET /api/v1/roleplay/sessions/{session_id}`
   - transcript: `GET /api/v1/roleplay/sessions/{session_id}/transcript`
   - review: `GET /api/v1/roleplay/sessions/{session_id}/review`
3. Session usage:
   - requires active auth session
   - frontend creates an in-memory `speaking_session_id` before live turn input begins
   - backend creates `roleplay_session_id`
   - frontend persists `kt.session.roleplay.v1::<roleplay_session_id>` after successful session creation
4. Response handling:
   - create-session response hydrates the first AI message and progress `0/5`
   - typed or voice-completed user input is submitted only after the user explicitly confirms it
   - each accepted turn appends the user message and AI reply returned by backend
   - when progress reaches `5/5`, backend returns `COMPLETE`, input is disabled, and review becomes available
   - transcript and review are fetched after completion from their dedicated endpoints

### YKI

1. UI trigger:
   - authenticated user selects a level band and starts an exam
2. API call:
   - start exam: `POST /api/v1/yki/sessions`
   - fetch runtime: `GET /api/v1/yki/sessions/{session_id}`
   - objective answer submit: `POST /api/v1/yki/sessions/{session_id}/answers`
   - writing submit: `POST /api/v1/yki/sessions/{session_id}/writing`
   - speaking audio submit: `POST /api/v1/yki/sessions/{session_id}/audio`
   - conversation speaking start: `POST /api/v1/yki/sessions/{session_id}/speaking/conversation`
   - conversation turn submit: `POST /api/v1/yki/sessions/{session_id}/speaking/turns`
   - conversation reply generation: `POST /api/v1/yki/sessions/{session_id}/speaking/reply`
   - exam submit: `POST /api/v1/yki/sessions/{session_id}/submit`
   - certificate: `GET /api/v1/yki/sessions/{session_id}/certificate`
3. Session usage:
   - requires active auth session and valid YKI entitlement
   - app adapter starts the engine session and returns runtime plus `exam_session_id`
   - frontend persists `kt.session.yki_runtime.v1::<exam_session_id>`
   - persisted YKI cache must include `engine_session_token`
4. Response handling:
   - start response hydrates runtime `screens` from `data.runtime`
   - answer and writing responses advance local YKI runtime state only after backend success
   - speaking uploads and conversation-turn submissions advance only after the adapter accepts engine-compatible audio references
   - submit may return warning or submitted state
   - submitted state unlocks certificate retrieval

### Voice

1. UI trigger:
   - user taps mic to start and taps again to stop under KAIL
   - or a screen requests TTS playback
2. API call:
   - batch STT: `POST /api/v1/voice/stt/transcriptions`
   - streaming STT for non-YKI modes only: `WS /api/v1/ws/voice/stt-stream`
   - cached TTS request: `POST /api/v1/voice/tts/requests`
   - streaming TTS for conversation and roleplay only: `WS /api/v1/ws/voice/tts-stream`
   - pronunciation analysis: `POST /api/v1/voice/pronunciation/analyze`
3. Session usage:
   - every voice request carries session context
   - non-YKI speaking flows require `speaking_session_id`
   - turn-based flows require `turn_id`
   - YKI speaking flows require `task_id`
4. Response handling:
   - STT success updates transcript candidate state
   - empty transcript does not advance the flow
   - TTS success plays returned audio only; it does not mutate business state
   - pronunciation analysis augments review or feedback state only after a successful voice result exists

## 3.4 YKI FULL FLOW

The YKI runtime flow is fixed by the engine section order and screen contract.

1. Entitlement gate:
   - authenticated UI checks backend YKI entitlement before allowing exam start
2. Session start:
   - UI calls `POST /api/v1/yki/sessions` with `level_band`
   - app adapter calls engine `POST /exam/start`
   - adapter returns engine runtime inside the app envelope
   - frontend stores `exam_session_id`, `engine_session_token`, runtime version, and local answer cache
3. Section order:
   - runtime metadata sections are authoritative
   - current engine order is `reading -> listening -> writing -> speaking`
   - UI must follow engine section order exactly
4. Reading flow:
   - engine exposes `reading_prompt` then `reading_questions`
   - UI renders the passage screen first
   - UI submits objective answers through `POST /api/v1/yki/sessions/{session_id}/answers`
   - successful answer writes update local YKI cache and progress state
5. Listening flow:
   - engine exposes `listening_prompt` then `listening_questions`
   - prompt audio comes from engine-provided audio only
   - UI must not synthesize listening audio through the voice system
   - answers submit through the same objective answer endpoint
6. Writing flow:
   - engine exposes `writing_prompt` then `writing_response`
   - UI may hold local draft text, but engine persistence happens only when `POST /api/v1/yki/sessions/{session_id}/writing` succeeds
   - local cache mirrors only successfully submitted writing answers as authoritative submitted state
7. Speaking flow for recording-response tasks:
   - UI renders `speaking_task` with `ui_variant=speaking_recording`
   - KAIL handles explicit record and stop
   - frontend uploads stopped audio in YKI mode through batch voice handling
   - backend must convert the accepted YKI upload into the engine-managed audio reference required by the adapter
   - adapter submits `task_id` plus managed audio reference through `POST /api/v1/yki/sessions/{session_id}/audio`
8. Speaking flow for conversation tasks:
   - UI calls `POST /api/v1/yki/sessions/{session_id}/speaking/conversation`
   - engine starts conversation state
   - each user turn is recorded with KAIL, uploaded in batch form, then submitted through `POST /api/v1/yki/sessions/{session_id}/speaking/turns`
   - adapter includes the managed audio reference and optional transcript text
   - UI requests `POST /api/v1/yki/sessions/{session_id}/speaking/reply` only after successful turn submission
9. Review and submit:
   - review screen reads local submitted-answer state and runtime metadata only
   - UI calls `POST /api/v1/yki/sessions/{session_id}/submit` with `confirm_incomplete=false`
   - if engine returns `status=warning`, UI shows the warning and does not treat the exam as submitted
   - if user confirms, UI calls the same endpoint with `confirm_incomplete=true`
10. Submission result:
   - submitted response becomes the authoritative results payload
   - frontend marks local YKI session state as `submitted`
   - certificate retrieval becomes legal only after submission
11. Certificate:
   - UI may call `GET /api/v1/yki/sessions/{session_id}/certificate`
   - certificate state is engine-owned and post-submission only

## 3.5 VOICE FLOW

### Non-YKI Voice Flow

1. User taps mic.
2. KAIL transitions `idle -> ready -> recording`.
3. User taps mic again.
4. KAIL transitions `recording -> processing`.
5. Frontend assembles batch upload context with `session_id`, `speaking_session_id`, optional `turn_id`, `mode`, and `locale`.
6. Frontend calls `POST /api/v1/voice/stt/transcriptions`.
7. Backend validates MIME type, file size, and session context.
8. Backend normalizes audio if needed, then transcribes it.
9. Backend returns transcript payload.
10. UI updates transcript candidate state.
11. If the feature is turn-based, UI still requires explicit user submit before business-state mutation.
12. Optional TTS playback may occur afterward through `POST /api/v1/voice/tts/requests` or `WS /api/v1/ws/voice/tts-stream`, depending on the mode.

### YKI Voice Flow

1. User taps mic under KAIL and stops explicitly.
2. KAIL never auto-stops the recording.
3. Frontend uploads the completed recording in YKI mode with `session_id`, `task_id`, and `mode=yki_exam`.
4. Voice transport remains batch-only.
5. Backend validates and stores the upload, then returns transcript plus `audio_ref`.
6. UI may show the transcript if the YKI speaking subflow allows it, but transcript display does not replace engine submission.
7. Frontend submits the backend-managed YKI audio reference through the YKI adapter.
8. Engine accepts only managed exam audio references.
9. YKI speaking state advances only after the adapter confirms engine acceptance.
10. Streaming STT and streaming TTS are forbidden in YKI answer determination.

## 3.6 PAYMENT FLOW

1. Authenticated app boot or subscription screen entry triggers `GET /api/v1/subscription/status`.
2. Backend returns canonical tier and feature map.
3. UI route gating updates from that response.
4. If user requests an upgrade, UI calls `POST /api/v1/payments/checkout-sessions`.
5. Backend creates a billing-provider checkout session and returns `checkout_url`.
6. UI opens the returned checkout URL.
7. Billing provider completes or cancels checkout outside the app runtime.
8. Backend webhook reconciliation updates the user subscription state.
9. On return to the app, UI refetches `GET /api/v1/subscription/status`.
10. The refetched status becomes the entitlement source of truth.
11. If user requests subscription management, UI calls `POST /api/v1/payments/customer-portal-sessions`.
12. UI gating reacts only to backend subscription status, not to optimistic local assumptions.

## 3.7 FAILURE PROPAGATION

Failure propagation rules are fixed:

| Failure Source | Immediate UI State | Session Impact | Downstream Impact |
| --- | --- | --- | --- |
| auth restore fails | route to unauthenticated shell | clear `kt.auth.session.v1` | block roleplay, cards, payment, voice, and YKI creation |
| subscription status fetch fails | keep last confirmed entitlement view, show non-authoritative state | none | do not broaden access |
| roleplay create fails | remain on setup screen | no roleplay cache created | speaking session may stay local only |
| roleplay turn submit fails | keep current turn pending | roleplay cache remains but is not advanced | no AI reply request allowed |
| cards answer fails | keep current card on screen | cards runtime session unchanged | no `next` request allowed |
| voice STT upload fails | show retry on current screen | no session advancement | roleplay or YKI turn stays unsubmitted |
| YKI adapter returns `warning` on submit | show confirmation state | YKI session remains active, not submitted | certificate remains unavailable |
| YKI adapter returns `410` or expired session | exit active exam flow | delete YKI runtime cache | require fresh exam start |
| payment checkout creation fails | stay on payment screen | no subscription change | gating unchanged |

Propagation direction:

- UI failure alone must not mutate backend or engine state.
- Backend failure may block a feature flow without clearing auth unless the error is auth-related.
- Engine failure impacts only YKI state unless it surfaces as auth expiry at the app adapter layer.
- Voice failure blocks only the dependent turn or task, not the parent auth session.

## 3.8 STATE OWNERSHIP

| State Category | Owner | Examples |
| --- | --- | --- |
| UI-local ephemeral state | UI | loading flags, open drawers, form fields, currently focused screen, pending transcript candidate before explicit submit |
| persisted app session state | session layer in frontend | `kt.auth.session.v1`, `kt.session.roleplay.v1::<id>`, `kt.session.yki_runtime.v1::<id>` |
| in-memory speaking state | session layer in frontend | active `speaking_session_id`, current turn recorder state |
| app backend business state | backend | auth sessions, roleplay sessions, transcripts, reviews, card runtime sessions, subscription status, voice upload refs |
| engine runtime state | YKI engine | exam runtime screens, timing, section availability, speaking runtime, submission status, certificate availability |
| external-provider state | backend-owned integrations | billing checkout state, provider-side speech processing, provider-side auth exchange |

Ownership rules:

1. UI may mirror authoritative state for rendering, but it may not originate backend or engine truth.
2. Session caches exist only to resume or hydrate. They do not override their owning remote systems.
3. Backend owns app business state. Engine owns YKI runtime state.
4. No state category may have two authorities.

## 3.9 FORBIDDEN ORCHESTRATION

These flows must never happen:

- UI calling YKI engine `/exam/*` routes directly
- roleplay turn submission before roleplay session creation
- roleplay review fetch treated as live session state authority
- card answer submission before a cards runtime `session_id` exists
- `next` card request after a cards session is already complete
- subscription gating from stale auth snapshot after fresh `/subscription/status` has returned
- restoring speaking-session recorder state after cold app restart
- YKI speaking using streaming STT or streaming TTS
- submitting raw local audio file paths directly to the YKI engine
- treating TTS playback success as proof of roleplay or YKI state advancement
- UI computing its own roleplay turn count, YKI timing, or YKI section availability instead of reading backend or engine state
- circular dependency where backend waits on UI to define roleplay, cards, payment, or YKI state

## 3.10 Runtime Blocking Guarantees

The following operations are hard blocking and must complete before UI progression:

1. Auth restore must complete before:
   - any authenticated route renders
   - any API call requiring auth is made
   - any roleplay, cards, payment, voice, or YKI feature session is created or resumed
2. Subscription status must complete before:
   - any feature gating decision is finalized
   - YKI start availability is shown as enabled
   - workplace and premium route availability is finalized
3. Session restore validation must complete before:
   - resuming roleplay
   - resuming YKI
   - navigating directly into a cached in-progress feature session
4. UI must remain in a controlled loading state until:
   - auth state is resolved
   - subscription state is resolved
   - restorable session validation is resolved for any session the app intends to resume immediately
5. YKI runtime hydration must block on adapter confirmation:
   - cached YKI screens must not render as active exam state until `GET /api/v1/yki/sessions/{session_id}` confirms the session
6. Roleplay runtime hydration must block on backend confirmation:
   - cached roleplay transcript or live session state must not render as resumable until `GET /api/v1/roleplay/sessions/{session_id}` confirms the session

Forbidden:

- partial hydration of protected routes
- early rendering of feature screens before entitlement resolution
- rendering cached roleplay or YKI progress as active truth before remote validation
- calling protected feature APIs while auth is still unresolved

## 3.11 Concurrency and In-Flight Rules

1. Only one active mutation request is allowed per feature flow instance:
   - cards: one session mutation at a time
   - roleplay: one turn submission at a time
   - YKI: one submission per task at a time
   - payment: one checkout request at a time from the same payment surface
2. UI must block duplicate triggers while a mutation request is in flight.
3. Cards:
   - `next` must not overlap with `answer`
   - a new cards session must not start while the current start request is still pending
4. Roleplay:
   - a second turn submission must not start until the prior turn submission completes
   - review fetch may occur only after backend completion and must not overlap with a live turn mutation for the same session
5. Voice:
   - mic must not start while a previous recording is processing
   - upload must not start twice for the same recording
   - one `turn_id` maps to one upload attempt chain at a time
6. YKI:
   - no parallel submission of answers for the same task
   - no concurrent speaking turn submissions
   - no conversation reply request before the prior speaking turn submission succeeds
   - no exam submit request while any task submission for that exam session is still in flight
7. Retry behavior:
   - retries must reuse the same session context
   - retries must reuse the same `session_id`, `turn_id`, or `task_id` context as applicable
   - retries must not create new sessions unless the owning backend or engine explicitly rejected the old session as invalid or expired
8. Request overlap resolution:
   - later duplicate triggers for the same mutation must be ignored or blocked in UI
   - responses from superseded non-mutating fetches must not overwrite newer confirmed state

Forbidden:

- parallel mutations on the same session
- duplicate submissions
- overlapping mic sessions
- starting a replacement feature session while the current session-creation request is still unresolved

## 3.12 Data Consistency Rules

1. UI must update authoritative state only after backend or engine confirmation.
2. Local optimistic updates:
   - are allowed only for visual feedback such as loading, disabled controls, waveform animation, or pending indicators
   - must be reverted immediately on failure
   - must never be written into persistent session cache
3. Session cache:
   - must reflect only confirmed backend or engine state
   - must never store speculative state
   - must be overwritten by the latest confirmed remote state after each successful mutation or resume validation
4. Cards:
   - local answer-selection UI is provisional until the answer API succeeds
   - session completion UI is not authoritative until the cards runtime response marks the session complete or inactive
5. Roleplay:
   - user input draft is not authoritative session state
   - appended transcript entries are authoritative only when returned by the roleplay backend response
   - local progress dots must match backend `user_turns_completed`, not locally inferred counts
6. YKI:
   - local answers are not authoritative until accepted by the adapter
   - writing submission state must match adapter confirmation only
   - speaking submission state must match engine-facing adapter confirmation only
   - final submission state must match engine response only
7. Voice:
   - transcript is provisional until the user confirms it or the dependent system accepts it as part of a confirmed submission path
   - TTS playback completion is not business-state confirmation
8. Conflict resolution:
   - if local state and backend or engine state disagree, the remote authoritative state wins
   - stale local cache must be replaced or deleted, never preserved as co-authority

Forbidden:

- treating local state as final truth
- persisting unconfirmed actions
- marking a cards, roleplay, voice, or YKI mutation as complete before backend or engine confirmation
- allowing stale cache to override confirmed remote state

## 3.13 Navigation Authority Rules

1. Navigation decisions must be based only on:
   - auth state
   - session state
   - backend or engine responses
   - validated entitlement state from the payment system
2. UI must not:
   - skip required steps
   - assume completion of flows
   - navigate into protected routes before blocking prerequisites are resolved
3. YKI navigation:
   - must follow engine-defined screen order only
   - cannot jump sections
   - cannot enter results or certificate views before engine submission state permits them
4. Roleplay:
   - cannot skip turns
   - cannot access review before completion
   - cannot reopen input after backend marks the session complete
5. Cards:
   - cannot navigate to completion until the cards runtime marks the session complete or inactive
   - cannot bypass session start and request `next` or `answer` without a valid cards session
6. Payment:
   - upgrade success routes must trigger subscription refetch before protected-feature availability is expanded
7. Restore navigation:
   - if remote validation fails for a cached roleplay or YKI session, navigation must fall back to the safe parent entry screen, not the cached live screen

Forbidden:

- UI-driven flow shortcuts
- manual route overrides without state validation
- navigation based on guessed completion
- section jumps inside YKI that are not backed by engine runtime state

## 3.14 Error Authority and Retry Rules

1. Error classification must be explicit.

   Errors must be categorized as:

   - `retryable`
     - network failure
     - timeout
     - temporary backend failure
     - temporary engine unavailability
     - temporary provider failure
   - `non_retryable`
     - validation error
     - auth failure
     - entitlement failure
     - malformed request
     - forbidden action
   - `terminal`
     - session expired
     - exam ended
     - invalid state
     - completed flow that cannot accept further mutation

2. Retry authority:

   - UI must not decide retry policy
   - retry policy must follow backend or API response classification
   - app envelope `error.retryable` is authoritative for app API retry behavior
   - engine adapter responses that represent expired or ended YKI state are terminal even if transport to the adapter succeeded

3. Retry behavior:

   - retries must reuse the same session context
   - retries must not create new sessions or duplicate actions
   - retries must respect concurrency rules
   - only one retry attempt chain may exist per failed mutation at a time
   - retries after session-expiry or terminal-state errors are forbidden; the flow must reset or exit instead

4. UI behavior:

   - `retryable` -> show retry option or execute the contract-approved automatic retry path
   - `non_retryable` -> show error and do not offer mutation retry for the same invalid action
   - `terminal` -> force exit, reset, or safe fallback route for the flow
   - all retry actions must be visible to the user as explicit retry UI or explicit loading-state retry behavior

5. Voice-specific:

   - failed upload -> retry allowed with the same recorded audio and the same session context
   - failed transcription -> retry allowed with the same uploaded audio reference or same raw recording if upload had not completed
   - confirmed submission failure -> no duplicate downstream submission is allowed for the same confirmed voice result
   - empty transcript is not terminal by itself; it is retryable under the same voice context unless the owning feature contract says otherwise

6. YKI-specific:

   - answer, writing, audio, and speaking-turn submission failure is retryable only if the adapter has not confirmed engine acceptance
   - once the engine has accepted a YKI submission, retry for that same action is forbidden
   - submit-exam retry is allowed only while the engine has not returned accepted submitted state
   - after engine `status=submitted`, duplicate submit retry is terminal and forbidden
   - engine `410`, ended exam state, or completed-submission state is terminal

7. Cards-specific:

   - cards answer retry is allowed only if the cards runtime did not confirm the answer mutation
   - once a cards answer response succeeds, retry of that same answer mutation is forbidden
   - `next` retry is allowed only if the prior `next` request did not produce a confirmed card transition

8. Roleplay-specific:

   - turn submission retry is allowed only if the backend did not confirm appended messages for that turn
   - once the backend confirms the turn append, duplicate retry is forbidden
   - review fetch retry is allowed because it is read-only and does not mutate session state

9. Payment-specific:

   - checkout-session creation retry is allowed only while no valid newer checkout session has replaced the failed one
   - subscription status fetch retry is allowed because it is read-only
   - webhook reconciliation retry is backend-owned only; UI never retries webhook logic

Forbidden:

- UI deciding retry logic
- silent retries without user or system awareness
- creating new sessions during retry
- duplicate submissions due to retry
- treating a terminal error as retryable because transport itself succeeded
