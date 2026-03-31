# SESSION PERSISTENCE + RECOVERY + OFFLINE SAFETY

## 1. Storage system implemented

The runtime now uses versioned persisted envelopes for:

* navigation state
* learning session state
* YKI session state

Files:

* `apps/client/state/sessionPersistence.ts`
* `packages/core/services/storageService.ts`

Implemented:

* deterministic key-sorted serialization
* explicit storage format marker
* explicit storage version
* corrupted vs outdated detection
* clear functions for each persisted runtime slice

## 2. Session restore logic

`AppShell.tsx` now owns restore flow on startup.

Behavior:

* root entry checks authenticated session first
* root entry then checks stored navigation state
* restore target is validated before screen entry
* learning restore revalidates current governed backend state
* YKI restore revalidates backend session and exact step alignment
* invalid restore fails to a controlled error screen instead of silently redirecting

Files:

* `apps/client/state/AppShell.tsx`
* `apps/client/state/networkStore.ts`

## 3. Validation rules

Persisted state is rejected when:

* storage payload is corrupted
* envelope version is outdated
* required fields are missing
* governance version does not match
* policy version does not match
* learning governed state is not revalidated
* YKI session id, completion state, or current task index drift from backend truth

Error surfaces now include:

* `SESSION_INVALID`
* `SESSION_CORRUPTED`
* `SESSION_OUTDATED`

## 4. Recovery handling

Recovery is fail-safe.

Rules implemented:

* no partial restore
* no session guessing
* invalid stored runtime state is discarded
* outdated stored runtime state is discarded
* corrupted stored runtime state is discarded
* restore does not continue without backend revalidation

## 5. Offline behavior

Offline state is now tracked centrally through `networkStore.ts`.

Behavior:

* protected navigation that requires backend validation is blocked while offline
* learning screen becomes read-only while offline
* YKI screen becomes read-only while offline
* YKI submit, advance, refresh, and restore are blocked while offline
* current validated UI can still render safely without reconstructing backend state

Files:

* `apps/client/state/LearningRoute.tsx`
* `apps/client/state/YkiPracticeRoute.tsx`
* `packages/ui/screens/LearningScreen.tsx`
* `packages/ui/screens/YkiPracticeScreen.tsx`
* `packages/ui/screens/ApplicationErrorScreen.tsx`

## 6. YKI recovery enforcement

YKI recovery now restores only when all of the following match backend truth:

* `session_id`
* `current_task_index`
* `isComplete`
* `decisionVersion`
* `policyVersion`
* `governanceVersion`

The session service now persists the validated YKI envelope after:

* session start
* session resume
* task submit
* task advance

File:

* `apps/client/features/yki-practice/services/ykiPracticeService.ts`

## Post-Run Audit

### A. Violations Found

* `MAJOR` previous runtime stored only a raw YKI session id and had no versioned learning or navigation restore state
* `MAJOR` previous root startup path could not validate stored runtime state before re-entry
* `MAJOR` previous offline behavior did not explicitly block unsafe YKI progression actions

### B. Fixes Applied

* added versioned persisted envelopes for navigation, learning, and YKI
* moved restore validation fully into `AppShell`
* added explicit corrupted, outdated, and invalid session handling
* added offline monitoring and read-only screen behavior
* enforced exact-step YKI resume checks against backend state

### C. Remaining Risks

* auth session persistence still uses its existing shape-validation path rather than the new versioned runtime envelope layer because this phase targeted learning, YKI, and navigation runtime state

### D. System State

* `✅ durable recoverable runtime`
