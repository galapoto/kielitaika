# Phase 1 — Backend Voice Verification Report

## 1. Runtime route verification

**Method:** Inspected running app (and code). OpenAPI lists HTTP routes only; WebSocket routes do not appear there.

**Voice routes in code (backend/app/routers/voice.py, prefix /voice):**

| Path | Type | Status |
|------|------|--------|
| `/voice/tts-stream` | WebSocket | Present in code |
| `/voice/stt-stream` | WebSocket | Present in code |
| `/voice/stt` | POST | Present in code; curl POST returned 200 (no body → empty transcript) |

**Observed:** GET to `/voice/tts-stream` on running server returned **404**. WebSocket routes in FastAPI/Starlette do not serve plain HTTP GET; only the WebSocket upgrade request is accepted. So 404 on a bare GET is expected. The frontend uses a proper WebSocket connection, not HTTP GET.

## 2. Environment verification

- **OPENAI_API_KEY:** Required for TTS and STT. Backend `tts_service.py` and `stt_service.py` use it. If missing, TTS yields empty chunks; STT yields placeholder or fails. Documented in `README_ENV.md` and `.env.example`.
- **Backend restarted after env changes:** Operator must restart after setting `.env`.

## 3. Port alignment (fix applied)

- **Issue:** Frontend defaults to port **8000** (`config/backend.js`). Backend default was **5000** (`app/core/config.py`, `run.sh`). Mismatch caused requests to hit the wrong port and get 404 or connection errors.
- **Fix:** Backend default port set to **8000** in `app/core/config.py` and `run.sh`. `README_ENV.md` updated to state PORT default 8000.

## 4. TTS verification (WebSocket)

- **Requirement:** Manually connect to `/voice/tts-stream`, send payload, hear audio.
- **Status:** Not run in this audit (no WebSocket client run; OPENAI_API_KEY not available in environment). For TTS to produce audible output, (1) backend must run on the same host/port the frontend uses (now default 8000), (2) OPENAI_API_KEY must be set, (3) client must use WebSocket (frontend does).

## 5. STT verification

- **POST /voice/stt:** Exists; returns 200. With valid audio body and OPENAI_API_KEY, returns `{"transcript": "…"}`.

## Phase 1 exit condition

- **Routes:** Confirmed in code; POST /voice/stt confirmed at runtime.
- **Port:** Aligned to 8000 so frontend and backend match without env.
- **TTS audible:** Blocked on OPENAI_API_KEY and running backend on 8000; no automated proof in this run.
- **STT transcript:** Blocked on OPENAI_API_KEY and audio payload; endpoint present.

**Conclusion:** Backend voice pipeline is wired and port is aligned. Operator must set OPENAI_API_KEY, run backend on port 8000 (default), and use a WebSocket client or the app to prove TTS/STT end-to-end.
