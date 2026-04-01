# YKI Engine Integration Blocker Report

## Summary

The requested cutover cannot be completed safely in the current state without violating the prompt's own hard rules.

The backend can be switched from local YKI session logic to engine HTTP calls only if the external engine can drive the same governed exam contract that the current frontend consumes.

That condition is not met today.

## Current Backend Execution Path

Active YKI route flow:

1. `apps/backend/main.py`
2. `apps/backend/yki/adapter.py`
3. `apps/backend/yki/session_store.py`

Production route coverage still depends on the local adapter functions:

- `start_exam`
- `start_governed_exam`
- `get_exam`
- `get_governed_exam`
- `resume_exam`
- `next_section`
- `advance_governed_exam`
- `get_task`
- `advance_task`
- `answer_task`
- `answer_governed_task`
- `answer_audio`
- `answer_governed_audio`
- `play_current_listening_prompt`
- `play_governed_listening_prompt`
- `get_exam_certificate`
- `get_user_progress_history`

These are all referenced by live routes in `apps/backend/main.py`.

## Frontend Contract Requirement

The current frontend requires the governed YKI session shape validated by `packages/core/api/governedResponseValidation.ts`.

The required payload includes, among other fields:

- `current_view`
- `navigation`
- `timing_manifest`
- `section_progress`
- `certificate`

The critical field is `current_view`, which encodes:

- forward-only screen progression
- explicit passage-first and prompt-first runtime phases
- lock state
- next/play/submit action availability

This is the state the frontend renders and periodically refreshes.

## External Engine Reality

The external engine exposes:

- `POST /exam/start`
- `GET /exam/{session_id}`
- `POST /exam/{session_id}/answer`
- `POST /exam/{session_id}/audio`
- `GET /exam/{session_id}/certificate`

Its public session model is defined in `/home/vitus/kielitaikka-yki-engine/engine/schema/public_exam_runtime_models_v3_3.py`.

That model exposes:

- `sections`
- `responses`
- `progress`
- `engine_session_token`

It does not expose:

- a governed `current_view`
- a backend-owned forward-only screen pointer
- a `next` route
- passage-to-question transition state
- listening prompt play-state compatible with the current app contract

## Why This Blocks A Safe Switch

The current app frontend expects the backend to own view progression.

The external engine currently exposes section content and answer submission, but not the screen-state machine needed to reconstruct the app's governed contract without adding new local runtime logic.

That creates an unavoidable conflict:

1. If the backend stores its own view pointer, local runtime logic still remains in execution path.
2. If the backend does not store its own view pointer, it cannot reproduce the existing governed `current_view` contract.

Under the prompt rules, both outcomes are invalid.

## Additional Validation Risk

The engine debug route at `/home/vitus/kielitaikka-yki-engine/engine/api/debug_routes.py` currently attempts to validate a payload shape that does not match the serialized exam payload returned by `serialize_exam_for_client()`.

A direct invocation currently raises a validation error because the payload lacks `screens` and instead returns `sections`.

This is additional evidence that the engine-side runtime contract needed for a frontend-preserving cutover is not yet aligned.

## Legacy Removal Status

Legacy YKI files are not safe to delete yet.

`apps/backend/yki/session_store.py` is still referenced by:

- `apps/backend/yki/adapter.py`
- `apps/backend/main.py` via `DEFAULT_USER_ID`
- `apps/backend/yki_practice/adapter.py`
- `apps/backend/yki_practice/service.py`
- `apps/backend/yki_practice/generator.py`
- `apps/backend/learning/adapter.py`
- `apps/backend/learning/system_service.py`
- `apps/backend/learning/progress_service.py`
- `apps/backend/learning/graph_service.py`
- `apps/backend/learning/practice_service.py`
- multiple backend tests

Deleting it now would be unsafe and would violate the repo-wide reference rule.

## Safe Verdict

The requested final state is blocked until one of these happens:

1. The external engine exposes the exact governed runtime state the frontend needs, including forward-only `current_view` semantics and `next` progression.
2. The frontend contract is intentionally changed to consume the engine's native public session format.

Without one of those changes, a complete switch would either break the frontend contract or keep local runtime logic alive in the backend.

## Final Verdict

BLOCKED

Reason:

The external engine does not currently expose enough runtime state to replace the internal governed YKI flow without either breaking the frontend contract or preserving local backend runtime behavior.
