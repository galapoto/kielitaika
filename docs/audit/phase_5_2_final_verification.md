# Phase 5.2 Final Verification

## 12.1 System Status

- Status: `FAIL`

Phase 5.2 completed the source-material finalization and the live verification pass, but the system does not qualify as `VALID` yet because two production blockers remain:

- live voice STT is still unavailable and returns `VOICE_STT_UNAVAILABLE` in the real HTTP flow
- a full YKI end-to-end exam cannot be completed through the public backend flow in a normal probe window because section timing gates later sections, and speaking remains blocked by unavailable STT

## 12.2 Material Consistency

### Source vs Normalized

- Source root rewritten in place: `/home/vitus/Asiakirjat/Professional_Finnish_materials/`
- Final source files: `9`
- Source cards: `1425`
- Normalized authority cards: `1425`
- Runtime rebuild from finalized source: `1425`
- Missing IDs: `0`
- Extra IDs: `0`
- Mismatched IDs: `0`

### Final Counts

- Content types:
  - `vocabulary_card`: `615`
  - `sentence_card`: `566`
  - `grammar_card`: `244`
- Paths:
  - `general`: `90`
  - `professional`: `1335`
- Level bands:
  - `A1_A2`: `402`
  - `B1_B2`: `940`
  - `C1_C2`: `83`

### Duplicates Removed

- Final deduplication after source rewrite: `0` duplicates remain in the rebuilt authority
- Phase 5.1 normalization had removed `115` duplicates from the recovered raw source pool before Phase 5.2 finalized the source files

## 12.3 Live Test Results

| Component | Status | Notes |
|----------|--------|------|
| Auth | PASS | Register, session restore, refresh, logout all worked live; post-logout session fetch returned `401 AUTH_REQUIRED`, refresh returned `401 AUTH_REFRESH_INVALID`. |
| Payment | PASS | Expired `professional_premium` user returned `allowed=false` for `feature=yki`; live `POST /api/v1/yki/sessions` returned `403 ENTITLEMENT_REQUIRED`. |
| Cards | PASS | Three live sessions for the same user returned three different first-card IDs. |
| Roleplay | PASS | Session creation, two turns, restore fetch, and transcript fetch all remained consistent. |
| Voice | FAIL | Real STT upload returned `503 VOICE_STT_UNAVAILABLE`; fail-closed behavior is correct, but normal live transcription is still unavailable. |
| YKI | FAIL | Start worked, no internal fields leaked, and backend controlled progression; however the exam could not be completed end-to-end in live verification because later sections are time-gated and speaking depends on unavailable STT. |

### Auth

- `GET /api/v1/auth/session`: `200`
- `POST /api/v1/auth/token/refresh`: `200`
- `POST /api/v1/auth/logout`: `200`
- Post-logout session check: `401 AUTH_REQUIRED`
- Post-logout refresh: `401 AUTH_REFRESH_INVALID`

### Payment / Entitlement

- `GET /api/v1/subscription/check-feature?feature=yki`: `200`, `allowed=false`
- Expired entitlement live YKI start: `403 ENTITLEMENT_REQUIRED`

### Cards

- Live first-card IDs across three sessions:
  - `card.vocab.general.työntekijä.0001`
  - `card.vocab.general.korko.0001`
  - `card.vocab.general.hoito.0001`
- Unique first-card count: `3`
- Returned levels across the three sessions:
  - `A1_A2`
  - `B1_B2`
  - `A1_A2`

The level expansion observed in one session is consistent with the backend’s controlled-randomness fallback policy after unseen pool exhaustion/expansion logic, not a frontend-side reshuffle.

### Roleplay

- Live session status after two turns: `active`
- Session message count: `5`
- Transcript turn count: `5`

### Voice

- Live STT upload result: `503`
- Error code: `VOICE_STT_UNAVAILABLE`
- Flow stopped correctly; the system did not continue after failure

### YKI

- Start exam: `200`
- Runtime internal-field exposure: none detected
- Screen task references: `22`
- Unique task count: `12`
- Unexpected duplicate task IDs: `[]`
- Incomplete submit without confirmation returned backend warning payload, not silent submission
- Progressed screens before gate: `4`
- Backend progression gate encountered: `400 YKI_REQUEST_REJECTED` with message `Section listening has not started yet`

This confirms backend authority over section progression. It also means a full end-to-end probe through all sections is not achievable in a short live verification run without waiting for the engine’s timed section transitions or using non-public shortcuts.

## 12.4 Randomization Proof

- Cards no-repeat proof:
  - same user
  - three separate live sessions
  - three distinct first-card IDs
- YKI task reuse proof within a generated exam:
  - `12` unique logical task IDs
  - `0` unexpected duplicate task IDs

## 12.5 Contract Validation

- Source equals normalized equals runtime authority for cards: confirmed
- Logout invalidates the auth session live: confirmed
- Expired premium is blocked by backend authority live: confirmed
- YKI runtime sent to client has no `engine_session_token` or debug/internal fields: confirmed
- Voice failure is visible and fail-closed: confirmed
- No frontend-only reshaping was required for the verified backend envelopes: confirmed

## 12.6 Final Decision

- System is **not production ready yet**

### Exact Remaining Blockers

- `VOICE`: no live STT provider is available, so normal real transcription still fails at runtime
- `YKI`: full end-to-end live completion was not achievable through the public backend flow because:
  - later exam sections are time-gated by the engine
  - speaking depends on the unavailable STT path

### Completed in This Phase

- Source material bank rewritten in place to match normalized authority exactly
- Source/runtime drift removed for cards
- Probe artifacts removed from:
  - `backend/runtime/uploads/voice/phase52_voice`
  - `/home/vitus/kielitaikka-yki-engine/exam_sessions/*.json` created by the Phase 5.2 probes
  - `/home/vitus/kielitaikka-yki-engine/exam_sessions/events/*.log` created by the Phase 5.2 probes
- Seeded Phase 5.2 probe user removed from `backend/runtime/state.json`

Until live STT is available and a full public YKI run can be completed and submitted end-to-end, Phase 5.2 cannot be certified as `VALID`.
