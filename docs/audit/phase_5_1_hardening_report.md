# Phase 5.1 Hardening Report

## Summary

- Status: `PARTIAL`
- Scope executed: material authority, cards randomization, backend contract hardening, auth/session fixes, payment/entitlement routes, YKI runtime isolation, voice fail-closed behavior, verification pass
- Production verdict for this phase alone: improved materially, but not fully closed because upstream malformed source files remain in place outside the workspace and live FastAPI/YKI HTTP validation was not executable in this environment

## Fixes Applied

### Materials and Cards

- Replaced synthetic card seeding in `backend/cards/logic.py` with authoritative selection from `backend/runtime/materials/normalized/cards_authority.json`
- Added deterministic material recovery + normalization loader in `backend/cards/material_bank.py`
- Added internal material inventory at `backend/runtime/materials/material_inventory.json`
- Added `user_content_history` state bucket and backend-owned card selection that:
  - filters by requested level/content/domain
  - excludes previously served content
  - expands difficulty bands when needed
  - reshuffles on subsequent sessions
  - records served content at selection time so abandoned sessions do not repeat immediately

### Auth and Session

- Added backend auth session registry and session termination enforcement in `backend/services/auth_service.py`
- Added missing `POST /api/v1/auth/logout` route in `backend/api/auth_routes.py`
- Invalidated access + refresh tokens across the whole auth session on logout
- Blocked refresh/current-user access for terminated sessions
- Aligned frontend persisted auth cache with the frozen contract:
  - `PersistedAuthSession` now stores `auth_user`, nested `tokens`, and `restored_at`

### Payment and Entitlements

- Fixed expired entitlement enforcement in `backend/services/subscription_service.py`
- Added `GET /api/v1/subscription/check-feature`
- Added `GET /api/v1/payments/status`
- Subscription checks now degrade expired paid users to free-tier access while blocking premium-only features immediately

### Voice

- Converted unavailable STT from soft success to fail-closed error in `backend/services/voice_service.py`
- Added STT input validation for mime type and duration
- Added typed TTS request validation in `backend/api/voice_routes.py`
- Updated frontend voice and YKI speaking flows to stop immediately on invalid STT payloads

### YKI

- Added backend runtime sanitizer in `backend/yki/runtime.py`
- Removed `engine_session_token` and other internal/debug keys from client-facing runtime payloads
- Stopped rendering raw YKI runtime and conversation state blobs in the frontend
- Removed internal engine token persistence from the frontend YKI cache

### Frontend Session Cache

- Aligned `RoleplaySessionCache` with the frozen contract:
  - `speaking_session_id`
  - `state`
  - `turn_count`
  - `last_synced_at`

## Material Report

### Sources Found

- Primary cards authority: `/home/vitus/Asiakirjat/Professional_Finnish_materials/`
- Backend synthetic runtime source: `backend/cards/logic.py`
- YKI authority source: `/home/vitus/kielitaikka-yki-engine/task_banks/task_index_v3_2.json`
- YKI non-authoritative runtime artifacts: `/home/vitus/kielitaikka-yki-engine/exam_sessions/`

### Classification

- `VALID`
  - `fraasit/lähihoitaja_fraasit/lähihoitaja_fraasit.json`
  - `kielioppi/lähihoitaja_kielioppi/lähihoitaja_kielioppi.json`
  - `task_banks/task_index_v3_2.json`
- `NEEDS_CLEANING`
  - `fraasit/lääkäri_fraasit/lääkäri_fraasit.json`
  - `fraasit/sairaanhoitaja_fraasit/sairaanhoitaja_fraasit.json`
  - `kielioppi/lääkäri_kielioppi/lääkäri_kielioppi.json`
  - `kielioppi/sairaanhoitaja_kielioppi/sairaanhoitaja_kielioppi.json`
  - `sanasto/lähihoitaja_sanasto/lähihoitaja_sanasto.json`
  - `sanasto/lääkäri_sanasto/lääkäri_sanasto.json`
  - `sanasto/sairaanhoitaja_sanasto/sairaanhoitaja_sanasto.json`
- `INVALID`
  - `/home/vitus/Asiakirjat/Professional_Finnish_materials/edit_before_move.json`
  - `backend/cards/logic.py` synthetic seed source
  - `/home/vitus/kielitaikka-yki-engine/exam_sessions/` runtime snapshots

### Counts

- Recovered authoritative card records from primary source: `1540`
- Normalized cards kept in runtime authority: `1425`
- Final normalized distribution:
  - path: `general=90`, `professional=1335`
  - content type: `vocabulary=615`, `sentence=566`, `grammar=244`
  - level band: `A1_A2=402`, `B1_B2=940`, `C1_C2=83`
  - profession: `none=90`, `doctor=342`, `nurse=938`, `practical_nurse=55`

### Cleaned and Deleted

- Duplicate cards removed from runtime authority build: `115`
- Invalid staging dump excluded: `1 dataset`
- YKI runtime snapshots excluded from authority use: `156 files`
- Synthetic seeded card source removed from runtime selection: `1 source`
- In-place deletion inside upstream source roots was **not** performed because those roots are outside the writable workspace for this run; they are excluded from the live runtime instead

## Deduplication Report

- Deduplication rule applied across normalized card entries:
  - signature = `content_type + profession + normalized level band + normalized front text + normalized answer`
- Duplicates removed: `115`
- Runtime authority now serves a single retained entry per dedupe signature

## Randomization Validation

- Validation probe:
  - session 1 first card: `card.vocab.general.lääke.0001`
  - session 2 first card: `työntekijä`
  - repeated first card: `false`
- Selection logic now records served content before completion, so exiting a session does not immediately replay the same card set

## Contract Validation

### Violations Fixed

- Backend logout route missing: fixed
- Auth session invalidation missing: fixed
- Persisted auth cache drift: fixed
- Roleplay cache drift: fixed
- Expired premium entitlement still allowed server-side: fixed
- Missing payment status route: fixed
- Missing entitlement check route: fixed
- YKI client exposure of internal engine token: fixed
- Voice STT soft-failure continuation: fixed

### Verification Evidence

- Backend compile:
  - `python3 -m py_compile ...` passed for patched backend files
- Frontend:
  - `npm run build` passed
  - `npm run validate:system-guardrails` passed
- Direct probes:
  - logout invalidated access + refresh tokens
  - expired `professional_premium` user was blocked from `yki`
  - payment status reported `expired`
  - cards reshuffled against user history
  - voice STT returned `VOICE_STT_UNAVAILABLE` error instead of soft-success payload
  - YKI runtime sanitizer removed `engine_session_token`

## Remaining Issues

- Primary source files under `/home/vitus/Asiakirjat/Professional_Finnish_materials/` still contain malformed concatenated JSON fragments upstream; runtime authority is clean, but the upstream files were not rewritten in place during this run
- Live HTTP validation of FastAPI routes was not possible here because local Python does not have `fastapi` installed
- Live end-to-end YKI engine flow was not revalidated against the running engine in this environment
- Voice provider remains unavailable by design in this environment; the system is now fail-closed rather than permissive
- Probe-generated upload artifacts remain under:
  - `backend/runtime/uploads/voice/spk_test/`
  - `backend/runtime/uploads/voice/spk_test_phase51/`
