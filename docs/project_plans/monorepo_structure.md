# Monorepo Structure

## UI Foundation Layer

- Design tokens system in `packages/ui/theme/tokens.ts`
- Layout primitives: `Screen` and `Center`
- UI primitives: `Text` and `Button`
- Central exports in `packages/ui/components/index.ts`
- Usage constraints: reusable typed components, `StyleSheet.create`, and token-based styling only
- Token enforcement rules: screen layout uses UI primitives instead of raw React Native `View`, `Text`, and `Pressable`

## Screen System

- `packages/ui/components/layout/ScreenWrapper.tsx`
- `packages/ui/screens/BaseScreen.tsx`
- Route to screen mapping: `index.tsx` -> `BaseScreen("Welcome")`, `auth.tsx` -> `BaseScreen("Auth Screen")`, `home.tsx` -> `BaseScreen("Home Screen")`
- Future screen rule: route file -> `BaseScreen` -> UI primitives only

## Feature Architecture

- Feature folders: `apps/client/features/auth`, `apps/client/features/home`, `apps/client/features/yki`, `apps/client/features/practice`
- Screen vs feature separation: screens provide layout only, features provide content only
- Import rules: screens import feature entry files, features import only from `@ui`, and features do not import each other

## State & Orchestration Layer

- Hooks structure: each feature has a local `hooks/` directory for state only
- Services structure: each feature has a local `services/` directory for mock data sources only
- Separation rules: features compose UI, hooks manage local state, services provide mocked data, and no API calls are used

## API Layer

- `packages/core/api/apiClient.ts`
- Services use `apiClient` as the only API entry point
- Hooks call services and manage `data`, `loading`, and `error`
- Response contract: `{ ok, data, error }`

## Backend Connection

- `packages/core/api/apiConfig.ts`
- Base URL rules: all service endpoints stay relative and `apiClient` prepends the configured base URL
- Platform handling: `getApiBaseUrl()` centralizes the mobile and web backend address

## Backend Contract Server

- FastAPI structure: `apps/backend/main.py`
- Endpoints: `/api/v1/auth/status`, `/api/v1/home`, `/api/v1/yki`, `/api/v1/practice`
- Purpose: deterministic mock contract layer for frontend integration on web and mobile

## API Contract

- Response structure: `{ ok, data, error }`
- Endpoint versioning: all contract routes use `/api/v1/...`
- Rules: backend defines the contract, frontend services use only versioned relative paths, `apiClient` does not reshape responses, and hooks consume the contract through `res.ok`, `res.data`, and `res.error`

## YKI Adapter Layer

- Adapter structure: `apps/backend/yki/adapter.py`
- Adapter role: isolate YKI engine communication behind backend-owned functions
- Backend mediation rule: frontend never talks to the engine directly and only consumes backend contract routes
- Separation rule: backend routes act as controllers, adapter owns engine-facing calls, and no exam business logic is implemented yet

## YKI Session Store

- Session store structure: `apps/backend/yki/session_store.py`
- Runtime model: sessions are stored in memory for now and persist only for the current backend process lifetime
- Replacement plan: the in-memory store is a temporary foundation and will later be replaced by Redis or a database-backed store
- Lifecycle rule: backend owns session creation, lookup, and not-found handling for YKI exam state

## YKI Flow Engine

- Section order: `reading -> listening -> writing -> speaking`
- Control rule: backend advances YKI sessions through deterministic transitions stored in the session store
- Persistence rule: each transition updates the same in-memory session instead of creating derived frontend state
- Boundary rule: frontend cannot decide or skip the next section because progression is owned by backend routes and adapter functions

## YKI Task Delivery Layer

- Task model: each section keeps its own `tasks` array and `currentTaskIndex` inside the session store
- Delivery rule: backend generates mock tasks on first section entry and persists them inside the active session
- Control rule: backend exposes the current task and advances task position through routes instead of frontend-managed indexing
- Boundary rule: frontend cannot generate tasks because task creation and progression belong to backend session state

## YKI Answer Layer

- Answer model: submitted answers are stored directly on the current task inside the session store
- Evaluation model: backend attaches a placeholder evaluation object with `score` and `feedback` fields
- Control rule: answer submission is handled by backend routes and adapter functions, not by frontend-managed state
- Responsibility rule: backend owns answer persistence, task status updates, and evaluation placeholders for future scoring

## YKI Guardrail Layer

- Enforcement rule: backend rejects invalid answer, task, and section transitions before state changes are applied
- Integrity rule: tasks must be answered before task advancement and all section tasks must be answered before section advancement
- Safety rule: duplicate answer submission is rejected to preserve task state integrity
- Boundary rule: frontend is not trusted to enforce exam rules because backend owns progression validity

## YKI Timing Engine

- Time authority: backend owns session and section timing and does not rely on client-side timers
- Session timing: each session stores a global `startedAt` and `expiresAt` window for overall exam validity
- Section timing: each section stores its own `startedAt` and `expiresAt` values when the section becomes active
- Enforcement rule: expired sessions return `SESSION_EXPIRED` and expired active sections return `SECTION_EXPIRED` before state-changing actions proceed

## YKI Speaking Pipeline

- Audio model: speaking tasks store an `audio` reference instead of a text `answer`
- Backend linkage rule: audio is attached to the active speaking task inside session state, not stored in frontend state
- Section rule: audio submission is accepted only while the current section is `speaking`
- Evaluation rule: backend records an evaluation placeholder and defers any real audio assessment logic

## YKI Evaluation Engine (Foundation)

- Responsibility rule: backend owns task evaluation output for both text and audio submissions
- Structure rule: evaluations use a shared object with `score`, `maxScore`, `criteria`, and `feedback`
- Scoring model: current evaluation is temporary rule-based logic and serves as the future AI integration point
- Consistency rule: text and audio tasks now return the same evaluation shape so downstream consumers do not branch on format

## YKI Storage Layer

- Abstraction rule: session persistence is accessed through `apps/backend/yki/storage.py` instead of direct session-dict usage in the store logic
- Current implementation: `InMemorySessionStorage` remains the active runtime backend and preserves current behavior
- Replacement path: the storage interface is the future swap point for Redis or database-backed persistence
- Integrity rule: session, task, answer, evaluation, and timing updates all flow through the storage abstraction

## Redis Session Storage

- Durability rule: Redis is the preferred session backend so session state can survive backend process restarts
- Fallback rule: if Redis client setup or connectivity fails, backend falls back to `InMemorySessionStorage`
- Persistence behavior: session JSON is stored by `sessionId` and reloaded through the same storage abstraction
- Recovery rule: Redis-backed sessions can be resumed after backend restart when a Redis server is available

## Session Expiry Model

- Storage enforcement: Redis TTL is derived from `session["timing"]["expiresAt"]` so expired sessions are deleted automatically
- Validation enforcement: backend expiry checks remain active and still reject expired or missing sessions defensively
- Lifetime rule: storage updates recompute TTL from the remaining session lifetime instead of resetting a fresh arbitrary duration
- Defense-in-depth rule: Redis deletion and backend validation must both exist

## Session State Model

- `ACTIVE`: session JSON exists in Redis and can be loaded normally
- `EXPIRED`: session JSON has been deleted by Redis TTL but `session_meta:{session_id}` still exists briefly, so backend returns `SESSION_EXPIRED`
- `NOT_FOUND`: no session key or expiry meta exists for the requested identifier, so backend returns `SESSION_NOT_FOUND`
- Lifecycle rule: expiry meta is lightweight and temporary, and it exists only to distinguish recently expired sessions from IDs that never existed

## Session Resume Contract

- Client responsibility: the client must persist `sessionId` locally if it wants to reconnect to an in-progress exam
- Resume route: `GET /api/v1/yki/resume/{session_id}` returns the stored session pointer state without restarting the exam
- Response shape: resume returns `sessionId`, `currentSection`, `currentTaskId`, `sectionProgress`, and `timing`
- Continuity rule: resume reads stored backend state directly and does not reconstruct progress from derived assumptions

## Frontend Session Model

- Authority rule: backend is the only source of truth for YKI session progress and timing
- Renderer rule: frontend only renders the state returned by `/api/v1/yki/resume/{session_id}`
- Persistence rule: frontend stores only `sessionId` locally so it can request resume after refresh or app restart
- Recovery rule: expired or missing stored sessions are cleared locally before the UI returns to the YKI start state

## Speaking Flow

- Recording rule: frontend starts and stops microphone capture through `expo-av` and keeps only the local recording URI until submission
- Upload rule: frontend submits the recorded audio reference to `POST /api/v1/yki/{session_id}/task/audio` without changing the backend contract
- Persistence rule: backend stores the submitted speaking task as answered inside session state, and resume returns that stored task status
- Recovery rule: when resumed speaking task state is already answered, frontend renders the submitted state and does not show recording controls again

## Audio Validation Strategy

- Real audio path: production speaking flow uses microphone capture and submits through the normal `/task/audio` API contract
- Development injector: development builds expose an `Inject Audio (Dev Only)` button that generates a real audio reference id and submits it through the same `/task/audio` request path
- Validation parity: real recording and development injection both pass through identical backend validation, session mutation, and resume behavior
- Safety rule: no frontend state is injected directly and the development injector is excluded from production builds

## Evaluation Model v1

- Engine rule: backend evaluation is deterministic, rule-based, and criteria-driven rather than placeholder-scored
- Text criteria: `content`, `clarity`, `relevance`, and `language_accuracy` are scored from observable answer structure and length
- Speaking criteria: `content`, `clarity`, `fluency`, `pronunciation`, and `relevance` are scored from structural audio-reference signals, with `evaluation_mode: "structural_audio"`
- Upgrade path: the current rules are traceable and stable, and the evaluation object is ready for a later AI analysis upgrade without contract changes

## Evaluation Model v2

- Base rule: rule-based scoring remains the mandatory baseline and no submission is scored by AI alone
- AI augmentation rule: text evaluation can optionally call an LLM at `temperature: 0` and only merge results after strict JSON validation
- Contract rule: accepted AI output must contain exactly `content`, `clarity`, `relevance`, `language_accuracy`, and `feedback`, with scores limited to integers `0..5`
- Fallback rule: invalid JSON, missing fields, extra fields, out-of-range scores, or provider/network failures all fall back to `rule_based_text_v1`
- Merge rule: hybrid text evaluation uses `round((rule_score + ai_score) / 2)` for the final score and merges each shared criterion by averaging the rule and AI scores
- Speaking prep rule: transcript-based entry points are prepared so future transcription can reuse the same text evaluation pipeline without changing the contract today

## Certification Model v1

- Aggregation rule: each section score is the rounded average of stored task evaluation scores for `reading`, `listening`, `writing`, and `speaking`
- Normalization rule: section scores remain on the same `0..5` scale as the stored task evaluations and the overall score is `round((reading + listening + writing + speaking) / 4)`
- Level mapping: overall scores map deterministically to `A1`, `A2`, `B1`, `B2`, and `C1/C2` through a backend-owned configurable mapping table
- Pass rule: certificate passes only when `overall_score >= targetLevelScore` and no section falls below `targetLevelScore - 1`
- Persistence rule: certificate output is stored on `session["certificate"]` at exam completion and is returned by `GET /api/v1/yki/{session_id}/certificate`

## Results UI Spec

- Data source rule: frontend reads result state from `resume` and the dedicated `GET /api/v1/yki/{session_id}/certificate` endpoint and does not recompute scores locally
- Layout rule: `/yki` renders a results panel with `Overall Result`, `Section Breakdown`, `Evaluation Transparency`, and `Task-Level Feedback`
- Indicator rule: section scores are shown with token-based horizontal score bars on the same `0..5` scale as the backend certificate
- Feedback rule: each task card renders the stored evaluation `score`, `criteria`, and `feedback` directly from `sectionProgress`
- Recovery rule: resumed sessions with a stored certificate show results immediately, while unfinished or corrupted result states show explicit user-facing messages instead of guessed summaries

## Adaptive Feedback Model v1

- Source rule: adaptive guidance is derived only from stored task evaluation criteria and never changes scores or re-evaluates submissions
- Aggregation rule: backend averages criteria across all evaluated tasks for `content`, `clarity`, `relevance`, `language_accuracy`, `fluency`, and `pronunciation`
- Interpretation rule: averaged criteria are classified deterministically as weak (`<= 2`), borderline (`== 3`), or strong (`>= 4`)
- Guidance rule: backend maps the top weak or borderline criteria to fixed practice suggestions and stores them on `session["learning_feedback"]`
- UI rule: results display a `How to Improve` section that renders persisted weak areas and suggested practice directly from backend-owned session data

## Exam Realism Model v1

- Timing rule: frontend renders a live countdown from persisted exam and section expiry timestamps, and the timer enters an urgent state near the configured warning threshold
- Locking rule: frontend communicates that navigation is forward-only and backend runtime state exposes section locking and no-back-navigation constraints
- Listening rule: listening tasks persist `playbackCount` and `playbackLimit`, and backend enforces a hard replay limit through a dedicated task-play action
- Writing rule: runtime config exposes minimum-length and recommended-maximum guidance so the writing section can remain constrained without affecting evaluation
- Speaking rule: runtime config exposes a maximum recording duration, frontend shows a visible speaking timer, and recording auto-stops at the section limit
- Resume rule: all realism constraints derive from persisted session/runtime state so refresh or resume continues with the remaining time and used playback counts instead of resetting

## Progress Model v1

- Identity rule: each exam session is tied to a backend-owned `userId`, currently using a deterministic local-user identifier until a real auth layer exists
- Summary rule: completed exams are persisted as session summaries containing `session_id`, `date`, `overall_score`, `level`, `section_scores`, `weak_areas`, and `passed`
- History rule: `GET /api/v1/yki/history` returns the user’s completed session summaries together with aggregated progression metadata
- Trend rule: backend derives score progression, current level, trend direction, recurring weak criteria, and strongest sections deterministically from stored history only
- UI rule: results render a `Your Progress` section that shows past scores, level trend, recurring weaknesses, and recent exam outcomes directly from backend-provided history

## Learning System v1

- Backend structure: `apps/backend/learning/models.py`, `apps/backend/learning/content.py`, `apps/backend/learning/repository.py`, `apps/backend/learning/graph_service.py`, and `apps/backend/learning/adapter.py`
- Content model: deterministic seeded Finnish learning content includes vocabulary, grammar, phrase, and module records with explicit module membership
- Relationship rule: units connect only through backend-owned `relatedUnitIds` and shared module structure, so related learning navigation does not invent graph edges on the client
- Suggestion rule: `GET /api/v1/learning/modules` ranks suggested modules from YKI `current_level` and `weak_patterns` without mixing in YKI exam flow logic
- API surface: `GET /api/v1/learning/modules`, `GET /api/v1/learning/unit/{unit_id}`, and `GET /api/v1/learning/related/{unit_id}`
- Frontend routes: `/learning`, `/learning/module/[id]`, and `/learning/unit/[id]` render `LearningHome`, `ModuleView`, and `UnitView`

## Practice Engine v1

- Backend generator: `apps/backend/learning/practice_service.py` derives exercises from existing vocabulary, grammar, and phrase units without changing the learning content graph
- Exercise rule: vocabulary yields translation drills, grammar yields fill-in and correction drills, and phrase units yield completion and phrase-choice drills
- Determinism rule: practice order, distractor selection, and recommended-module selection are backend-owned and stable for the same stored content and progress history
- API surface: `GET /api/v1/learning/practice/module/{module_id}` and `GET /api/v1/learning/practice/recommended`
- Frontend routes: `/practice` renders recommended practice by default, while learning screens can open `/practice?moduleId=...` for module-scoped drills
- Feedback rule: frontend evaluates submitted answers immediately against backend-provided `correct_answer` and always shows the correct answer after submission
