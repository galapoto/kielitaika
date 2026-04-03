# Final Production Proof Run

Date: 2026-04-03
Repository: `/home/vitus/kielitaika-app`
Prompt: `docs/prompts/final_production_proof_run.md`

## 1. Engine proof

Live engine and backend were started for this run:

- engine: `http://0.0.0.0:8181`
- backend: `http://0.0.0.0:8002`

Host-side endpoint proof:

- `GET /health` returned `{"status":"ok"}`
- `GET /engine/health` returned `{"status":"OK", ...}`
- `POST /api/v1/yki/sessions/start` returned a governed session id

Real Android-started governed exam session:

- session id: `76f2e173-65d8-4ca9-93e5-7bdcf5681c27`
- backend log origin: `192.168.100.36`
- first successful device start request: `POST /api/v1/yki/sessions/start` -> `200 OK`
- successful device session loads followed immediately after start:
  - `GET /api/v1/yki/sessions/76f2e173-65d8-4ca9-93e5-7bdcf5681c27` -> `200 OK`

Live session state captured during this run:

- current section: `reading`
- current view kind: `reading_passage`
- reading window start: `2026-04-03T16:43:49.075461+00:00`
- listening window start: `2026-04-03T17:43:49.075461+00:00`
- reading remaining at capture time: `3471` seconds

Captured proof lines:

- backend log: `192.168.100.36:47188 - "POST /api/v1/yki/sessions/start HTTP/1.1" 200 OK`
- backend log: `192.168.100.36:47188 - "GET /api/v1/yki/sessions/76f2e173-65d8-4ca9-93e5-7bdcf5681c27 HTTP/1.1" 200 OK`
- governed session payload confirmed:
  - `current_view.kind = reading_passage`
  - `listening.started_at = 2026-04-03T17:43:49.075461+00:00`

Important result:

- the governed exam now starts and loads successfully on Android against the real engine-backed backend
- listening submission success and progression to the next section were **not** proven in this pass because the listening window had not opened yet

## 2. Android proof

Connected real device:

- `SM02E4060333233`

Observed Android runtime behavior after the fixes in this pass:

- Expo app launched on-device without crash
- no redbox was observed after the final start-flow fix
- Metro logs showed:
  - `Screen transition resolved` to `yki-exam`
  - `YKI exam session start completed`
  - `YKI exam session load completed`
  - `YKI exam session snapshot persisted`
  - repeated successful `YKI_EXAM_SESSION_LOAD` requests

Direct blocker fixed during this run:

1. Duplicate exam start requests from the client

- cause: the exam flow could start more than once during development remounts
- fix applied in:
  - `apps/client/features/yki-exam/hooks/useYkiExam.ts`
  - `apps/client/features/yki-exam/services/ykiExamService.ts`

2. Start response contract rejection

- exact failure before the fix:
  - `/api/v1/yki/sessions/start.data is missing a governed validator.`
- fix applied in:
  - `apps/client/features/yki-exam/services/ykiExamService.ts`
- result after the fix:
  - Android session start completed
  - Android session load completed
  - session snapshots persisted successfully

## 3. Media proof

Playback:

- not completed end-to-end in this pass
- reason: the session remained in `reading`; the listening window had not opened yet

Recording:

- not completed end-to-end in this pass
- speaking section was not reached

Permission handling:

- not proven in this pass

Background behavior:

- not proven in this pass

## 4. Transport proof

Actual device-originated HTTP success was proven in backend logs from `192.168.100.36`.

Device HTTP success captured:

- `GET /health` -> `200 OK`
- `GET /engine/health` -> `200 OK`
- `POST /api/v1/yki/sessions/start` -> `200 OK`
- repeated `GET /api/v1/yki/sessions/{session_id}` -> `200 OK`

Exact device-originated backend log lines captured:

- `192.168.100.36:52788 - "GET /health HTTP/1.1" 200 OK`
- `192.168.100.36:55234 - "GET /engine/health HTTP/1.1" 200 OK`
- `192.168.100.36:47188 - "POST /api/v1/yki/sessions/start HTTP/1.1" 200 OK`
- `192.168.100.36:47188 - "GET /api/v1/yki/sessions/76f2e173-65d8-4ca9-93e5-7bdcf5681c27 HTTP/1.1" 200 OK`

This is materially different from the earlier blocked state:

- Android no longer fails at exam start with a transport error
- the device now reaches the governed backend over real HTTP, not just TCP reachability

## 5. Remaining issues

1. Full real listening proof is still incomplete.

- The real listening window for the Android-started governed session begins at:
  - `2026-04-03T17:43:49.075461+00:00`
- This pass did not wait through the full real reading window and then complete listening on-device.

2. Media lifecycle proof is still incomplete.

- listening playback
- audio stop on navigation
- microphone permission prompt
- recording creation
- recording upload
- background cleanup

3. Full Android end-to-end exam completion is still incomplete.

- Android exam start is now fixed and proven
- Android loading/polling is now fixed and proven
- Android completion through listening, writing, and speaking was not completed in this pass

## Final verdict

BLOCKED

Exact blocker state:

- the direct Android transport/start failure is fixed
- the direct client contract/start failure is fixed
- PASS cannot be claimed because the proof requirements were not fully completed:
  - listening was not completed under the real engine time window
  - Android media lifecycle was not exercised end-to-end
  - full Android exam completion was not demonstrated
