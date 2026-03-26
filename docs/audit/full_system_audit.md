# FULL SYSTEM IMPLEMENTATION AUDIT

## 5.1 Executive Summary

System status: `PARTIAL`  
Production readiness: `NO`

What was verified today:

- frontend builds successfully with `npm run build`
- frontend guardrails pass with `npm run validate:system-guardrails`
- backend source compiles with `python3 -m py_compile`
- service-level auth, cards, roleplay, and voice probes execute successfully without HTTP routing
- Phase 4.3 targeted UX fixes are now present in the frontend

What blocks a `VALID / YES` assessment:

- auth, session, voice, and payment contract drift
- expired paid entitlements are still accepted server-side
- logout is not implemented as a backend contract route
- failed STT is not handled fail-closed in the frontend
- YKI runtime debug rendering exposes raw backend state, including engine session metadata
- full HTTP-level and live-engine end-to-end verification could not be completed in this environment because the local Python runtime does not have `fastapi` installed and the YKI engine was not verifiably reachable for a clean live probe

## 5.2 Pass / Fail Table

| Area | Status | Notes |
| --- | --- | --- |
| Architecture validation | PARTIAL | Backend and frontend layering are clean overall, but payment routes are missing and raw debug panels are still shipped in the main UI. |
| Contract validation | FAIL | Auth persistence, roleplay cache persistence, voice handling, and payment surface do not fully match frozen contracts. |
| State & session validation | FAIL | Auth/logout lifecycle is incomplete, roleplay cache shape drifts from contract, and YKI engine token is exposed in UI state dumps. |
| Flow validation | PARTIAL | Auth/cards/roleplay/voice service paths were exercised; full HTTP auth flow and live-engine YKI flow were not fully executable here. |
| UX validation | PARTIAL | Phase 4.3 fixes are implemented, but debug-state rendering and failed-STT handling still create poor production UX. |
| Performance validation | PARTIAL | Repo evidence shows strong post-4.2 session-engine numbers, but no fresh full-stack load rerun was possible in this environment. |
| Guardrails validation | PASS | No direct fetch outside `apiClient`; guardrail scripts pass. |
| Code quality & consistency | PARTIAL | Structure is coherent, but there is contract drift, unchecked `any` payload use, and debug/runtime UI left in production screens. |
| Failure scenarios | PARTIAL | Error envelopes and retryable transport handling exist, but engine-down and backend-down paths were not fully rerun end-to-end today. |

## 5.3 Detailed Findings

### 1. Missing backend logout route and token revocation flow

Severity: `Critical`

Location:

- [backend/api/auth_routes.py#L21](/home/vitus/kielitaika/backend/api/auth_routes.py#L21)
- [docs/contracts/auth_contract.md#L176](/home/vitus/kielitaika/docs/contracts/auth_contract.md#L176)
- [frontend/app/state/AppStateProvider.tsx#L180](/home/vitus/kielitaika/frontend/app/state/AppStateProvider.tsx#L180)

Description:

- The frozen auth contract defines `POST /api/v1/auth/logout`, but the backend exposes no logout route.
- Frontend logout only clears local state and never asks the backend to revoke the active refresh token/auth session.

Reproduction:

1. Compare the auth router implementation to the frozen auth contract.
2. Trigger logout from the frontend state layer.

Expected behavior:

- Backend exposes `/api/v1/auth/logout`.
- Frontend submits the active `refresh_token` and `auth_session_id`.
- Backend revokes the device session and returns `logged_out: true`.

Actual behavior:

- No logout route exists.
- Logout is local-only.
- Persisted tokens can remain valid on the backend after UI logout.

### 2. Payment contract routes are not implemented

Severity: `Critical`

Location:

- [backend/api/__init__.py#L5](/home/vitus/kielitaika/backend/api/__init__.py#L5)
- [docs/contracts/payment_contract.md#L70](/home/vitus/kielitaika/docs/contracts/payment_contract.md#L70)

Description:

- The frozen payment contract defines `/api/v1/subscription/check-feature` and `/api/v1/payments/*` routes.
- There is no payment router in the backend and no implementation for checkout, portal, or webhook flows.

Reproduction:

1. Compare the backend router registry to the payment contract.
2. Inspect `backend/api/` for payment routes.

Expected behavior:

- Payment and entitlement-check routes exist and follow the frozen contract.

Actual behavior:

- Only `/subscription/status` exists.
- Contract-defined payment flows are absent.

### 3. Expired premium subscriptions still pass server-side feature gating

Severity: `Critical`

Location:

- [backend/services/subscription_service.py#L28](/home/vitus/kielitaika/backend/services/subscription_service.py#L28)
- [backend/services/subscription_service.py#L42](/home/vitus/kielitaika/backend/services/subscription_service.py#L42)
- [docs/contracts/payment_contract.md#L153](/home/vitus/kielitaika/docs/contracts/payment_contract.md#L153)

Description:

- `subscription_status()` computes `is_active`, but `require_feature()` ignores it and only checks the static feature map for the user’s tier.
- A directly executed service probe today confirmed that an expired `professional_premium` user still passes `require_feature(user, "yki")`.

Reproduction:

1. Create a user payload with `subscription_tier="professional_premium"` and an expired `subscription_expires_at`.
2. Call `subscription_status(user)` and `require_feature(user, "yki")`.

Expected behavior:

- Expired paid access falls back to free-tier gating or is rejected outright.

Actual behavior:

- `is_active` becomes `False`.
- `require_feature()` still allows YKI access.

### 4. Persisted auth and roleplay cache schemas drift from the frozen contracts

Severity: `High`

Location:

- [frontend/app/state/types.ts#L39](/home/vitus/kielitaika/frontend/app/state/types.ts#L39)
- [frontend/app/services/apiClient.ts#L31](/home/vitus/kielitaika/frontend/app/services/apiClient.ts#L31)
- [frontend/app/state/types.ts#L68](/home/vitus/kielitaika/frontend/app/state/types.ts#L68)
- [frontend/app/services/storage.ts#L53](/home/vitus/kielitaika/frontend/app/services/storage.ts#L53)
- [docs/contracts/auth_contract.md#L82](/home/vitus/kielitaika/docs/contracts/auth_contract.md#L82)
- [docs/contracts/session_contract.md#L98](/home/vitus/kielitaika/docs/contracts/session_contract.md#L98)

Description:

- `PersistedAuthSession` is stored as flat token fields plus `stored_at`.
- The auth contract requires `auth_user`, nested `tokens`, and `restored_at`.
- `RoleplaySessionCache` stores only `roleplay_session_id`, `created_at`, `expires_at`, `status`, and `saved_at`.
- The session contract requires `speaking_session_id`, `state`, `turn_count`, and `last_synced_at`.

Reproduction:

1. Compare frontend types/storage guards to the frozen auth and session contracts.
2. Inspect saved cache writers in `apiClient` and `storage`.

Expected behavior:

- Local persistence exactly matches the frozen schemas.

Actual behavior:

- Frontend persistence is internally consistent, but contract-incompatible.

### 5. Failed STT is not handled fail-closed in the frontend, and YKI can continue after `data.ok=false`

Severity: `High`

Location:

- [backend/services/voice_service.py#L21](/home/vitus/kielitaika/backend/services/voice_service.py#L21)
- [frontend/app/screens/VoiceStudioScreen.tsx#L43](/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx#L43)
- [frontend/app/screens/VoiceStudioScreen.tsx#L70](/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx#L70)
- [frontend/app/screens/YkiExamScreen.tsx#L292](/home/vitus/kielitaika/frontend/app/screens/YkiExamScreen.tsx#L292)
- [docs/contracts/voice_contract.md#L33](/home/vitus/kielitaika/docs/contracts/voice_contract.md#L33)
- [docs/contracts/voice_contract.md#L100](/home/vitus/kielitaika/docs/contracts/voice_contract.md#L100)

Description:

- The backend currently returns STT data with `data.ok=false`, empty transcript, and `STT_UNAVAILABLE`.
- Voice Studio stores that payload as a usable transcription anyway and enables pronunciation analysis.
- YKI speaking checks only the outer app envelope and can continue the speaking flow after failed STT data.

Reproduction:

1. Upload audio through the current voice backend path.
2. Observe that the HTTP envelope is successful while `data.ok` is `false`.
3. Inspect `VoiceStudioScreen.upload()` and `YkiExamScreen.submitSpeakingTask()`.

Expected behavior:

- Failed or empty transcripts are discarded by the frontend.
- YKI speaking does not continue as if STT succeeded when `data.ok=false`.

Actual behavior:

- Failed transcripts are retained in state.
- Follow-up actions remain possible.

### 6. Voice contract validation is incomplete on the backend

Severity: `High`

Location:

- [backend/api/voice_routes.py#L17](/home/vitus/kielitaika/backend/api/voice_routes.py#L17)
- [backend/api/voice_routes.py#L47](/home/vitus/kielitaika/backend/api/voice_routes.py#L47)
- [backend/services/voice_service.py#L21](/home/vitus/kielitaika/backend/services/voice_service.py#L21)
- [docs/contracts/voice_contract.md#L40](/home/vitus/kielitaika/docs/contracts/voice_contract.md#L40)
- [docs/contracts/voice_contract.md#L74](/home/vitus/kielitaika/docs/contracts/voice_contract.md#L74)
- [docs/contracts/voice_contract.md#L145](/home/vitus/kielitaika/docs/contracts/voice_contract.md#L145)

Description:

- The backend does not validate MIME type against the frozen allowlist.
- There is no file-size enforcement.
- TTS requests accept raw `dict[str, Any]` instead of a validated request model.

Reproduction:

1. Inspect the voice route signatures and service validation.
2. Compare to the frozen voice contract.

Expected behavior:

- Voice routes validate request shape, MIME type, and file size at the backend boundary.

Actual behavior:

- Validation is partial and contract-incomplete.

### 7. YKI runtime debug rendering exposes raw backend state, including engine session metadata

Severity: `High`

Location:

- [frontend/app/components/JsonPreview.tsx#L1](/home/vitus/kielitaika/frontend/app/components/JsonPreview.tsx#L1)
- [frontend/app/screens/YkiExamScreen.tsx#L195](/home/vitus/kielitaika/frontend/app/screens/YkiExamScreen.tsx#L195)
- [frontend/app/screens/YkiExamScreen.tsx#L567](/home/vitus/kielitaika/frontend/app/screens/YkiExamScreen.tsx#L567)
- [docs/contracts/session_contract.md#L211](/home/vitus/kielitaika/docs/contracts/session_contract.md#L211)

Description:

- The YKI screen saves `engine_session_token` into local cache as intended.
- It also renders full raw runtime and conversation state directly to the UI using `JsonPreview`.
- Because the runtime object includes metadata, this exposes engine-owned session details outside the adapter/local-cache boundary.

Reproduction:

1. Start or restore a YKI runtime.
2. Scroll to the “Runtime snapshot” panel.

Expected behavior:

- Engine session token remains internal to the adapter and local cache.

Actual behavior:

- Raw backend runtime is dumped in the visible UI.

### 8. Full end-to-end HTTP and live-engine verification is still incomplete

Severity: `Medium`

Location:

- [backend/core/config.py#L8](/home/vitus/kielitaika/backend/core/config.py#L8)

Description:

- The current environment allowed source compilation and service-level probes, but not full HTTP route execution through FastAPI.
- A direct runtime probe reported `ModuleNotFoundError: No module named 'fastapi'`.
- A live YKI engine start probe could not be cleanly completed as a verified end-to-end pass in this environment.

Reproduction:

1. Attempt to import `fastapi` and `TestClient` locally.
2. Attempt a live YKI start against the configured local engine boundary.

Expected behavior:

- Audit environment can execute HTTP-level route probes and live YKI flow probes.

Actual behavior:

- Verification is partially blocked by missing local runtime dependencies / engine availability.

## 5.4 Contract Violations

- Auth contract violation: `POST /api/v1/auth/logout` is defined but not implemented.
- Auth contract violation: persisted auth snapshot shape does not match `PersistedAuthSession`.
- Session contract violation: roleplay cache shape does not match `RoleplaySessionCache`.
- Session contract violation: YKI engine session token is exposed in visible runtime debug UI.
- Voice contract violation: frontend does not discard failed transcripts.
- Voice contract violation: backend does not fully validate MIME type / file size / TTS request schema.
- Payment contract violation: `/api/v1/subscription/check-feature` and `/api/v1/payments/*` routes are missing.
- Payment contract violation: expired paid entitlement is still allowed by `require_feature()`.

## 5.5 UX Deficiencies

- Raw `JsonPreview` panels on YKI and Voice screens expose internal payloads and create a debug-tool feel instead of production UX.
- Voice Studio presents an STT failure payload as if it were a usable transcript flow.
- App bootstrap restores auth, subscription, roleplay cache, and YKI cache sequentially, which is acceptable today but still creates a sluggishness risk as cache volume grows.

## 5.6 Performance Summary

Current-turn verification:

- Frontend build: `PASS`
- Frontend guardrails: `PASS`
- Backend source compile: `PASS`
- Service probes: auth/cards/roleplay/voice `PASS`
- Fresh full-stack HTTP load rerun: `NOT EXECUTED`

Measured repo evidence:

- Latest state-engine artifact shows a 50-user pure session run total elapsed of `151.50ms`, with cards start `24.79ms avg` and roleplay turn `28.10ms avg` in [phase_4_2_state_engine.md#L49](/home/vitus/kielitaika/docs/agents/implemented/phase_4_2_state_engine.md#L49).
- Earlier broader performance artifact still marked the system `NOT PRODUCTION READY`, with a 50-user mixed run total elapsed of `9049.39ms` and backend RSS retaining `+4320 KB` after idle in [phase_4_0_performance.md#L55](/home/vitus/kielitaika/docs/agents/implemented/phase_4_0_performance.md#L55) and [phase_4_0_performance.md#L93](/home/vitus/kielitaika/docs/agents/implemented/phase_4_0_performance.md#L93).

Assessment:

- Session-engine performance improved materially after Phase 4.2.
- There is not enough fresh end-to-end load evidence in the current environment to declare production readiness.
- Entitlement, contract, and missing-route issues block production before raw latency does.

## 5.7 Prioritized Fix List

### Critical

- Implement `POST /api/v1/auth/logout` and revoke the active refresh/auth session pair.
- Implement the missing payment contract routes or downgrade the contract to match the actual supported surface.
- Fix entitlement enforcement so expired paid users fall back to free-tier access before `require_feature()` decisions.
- Make STT handling fail-closed in the frontend: if `data.ok=false`, do not retain transcript state and do not continue YKI speaking submission as a successful path.

### High

- Align persisted auth/session cache schemas with the frozen auth and session contracts.
- Remove raw YKI runtime and conversation debug previews from the production screen, or redact engine-owned metadata before rendering.
- Add strict request models and MIME/file-size validation for voice routes, including TTS request validation.

### Medium

- Add executable HTTP-level automated tests for auth, cards, roleplay, voice, and YKI adapter routes.
- Add a committed audit/validation script for environment readiness so missing runtime dependencies are detected before audit execution.
- Parallelize bootstrap restore checks once correctness issues are fixed.

### Low

- Reduce unchecked `any` usage in frontend runtime screens and service payload handling.
- Remove or gate leftover debug-oriented UI surfaces that are useful for development but noisy in the main application flow.

## Verification Basis

Commands executed during this audit:

- `npm run build`
- `npm run validate:system-guardrails`
- `python3 -m py_compile backend/main.py backend/api/*.py backend/services/*.py backend/core/*.py backend/cards/*.py backend/roleplay/*.py backend/voice/*.py backend/yki/*.py backend/adapters/*.py`
- direct Python service probes for auth/cards/roleplay/voice

Environment limitations during this audit:

- `fastapi` was not importable in the local Python runtime, so HTTP route probing with `TestClient` was not available.
- A live YKI engine pass could not be claimed as verified from this environment.
