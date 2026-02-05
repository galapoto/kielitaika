# Backend Voice Pipeline — Forensic Verification Audit (Agent Y)

**Document:** `backend_verification_audit_agent-y.md`  
**Scope:** Backend voice capability (TTS + STT) required for roleplay.  
**Type:** Forensic only. No fixes, no frontend changes. Facts and evidence only.

---

## 1. Route inventory (from source code)

**Source:** `backend/app/main.py`, `backend/app/routers/voice.py`.

Voice router is mounted with prefix `/voice`:

```text
app.include_router(voice.router, prefix="/voice", tags=["voice"])
```

**Voice-related routes defined in code:**

| Path | Method / protocol | Handler | Purpose |
|------|-------------------|---------|---------|
| `/voice/stt-stream` | **WebSocket** | `stt_stream` | Streaming STT: receive audio bytes, stream transcript text |
| `/voice/tts-stream` | **WebSocket** | `tts_stream` | Streaming TTS: receive JSON `{ "text": "…" }`, stream audio bytes |
| `/voice/stt` | **POST** (HTTP) | `transcribe_audio_file` | Non-streaming STT: request body = raw audio bytes, response = `{ "transcript": "…" }` |
| `/voice/pronunciation/analyze` | POST | `analyze_pronunciation` | Pronunciation analysis (v1) |
| `/voice/pronunciation/analyze-v2` | POST | `analyze_pronunciation_v2_endpoint` | Pronunciation analysis (v2) |
| `/voice/pronunciation/nudge` | POST | `pronunciation_nudge` | Mini pronunciation nudge |

**Explicit finding:**

- There is **no HTTP GET or POST route** for TTS at `/voice/tts` or `/voice/tts-stream`.
- TTS is exposed **only** as a **WebSocket** at `/voice/tts-stream`.
- STT is exposed as:
  - **WebSocket** `/voice/stt-stream`
  - **HTTP POST** `/voice/stt` (body = raw audio; returns JSON with `transcript`).

---

## 2. TTS status

### 2.1 Path used by the frontend

**Source:** `frontend/app/services/tts.ts`.

- Frontend uses **WebSocket only** for TTS.
- URL built as: `${WS_BASE}/voice/tts-stream`, where `WS_BASE` is `WS_API_BASE` from `frontend/app/config/backend.js` (e.g. `ws://localhost:8000`).
- So the **exact path** the client uses is: **`/voice/tts-stream`** over WebSocket.

### 2.2 Expected vs actual (from plan and logs)

| Check | Expected | Actual (from logs / code) |
|-------|----------|----------------------------|
| Route exists | A TTS route exists at the path the frontend uses | **In code:** Yes. `/voice/tts-stream` is defined as a **WebSocket** route. |
| HTTP GET to same path | If one does HTTP GET to `/voice/tts-stream`, behavior is implementation-dependent | **Not tested in this audit.** Many stacks return **404** for GET when only WebSocket is registered, or **405** Method Not Allowed. |
| Client sees 404 | N/A | **Observed:** "TTS API error: 404 {\"detail\":\"Not Found\"}". |

### 2.3 Interpretation

- The backend **does** define a TTS capability at **`/voice/tts-stream`** (WebSocket).
- The frontend calls **that same path** over WebSocket, not an HTTP TTS URL.
- A **404** therefore implies one or more of:
  1. **Wrong host/port/base URL** — client is hitting a different origin where `/voice/tts-stream` is not mounted.
  2. **Proxy/gateway** — something in front of the app returns 404 for the WebSocket path or for the upgrade request.
  3. **HTTP request to WS path** — if anything (client or tool) does an **HTTP** GET/POST to `/voice/tts-stream`, some setups return 404 because the route is WebSocket-only.

**TTS functionality (when the route is hit):**

- **Source:** `backend/app/routers/voice.py` (tts_stream), `backend/app/services/tts_service.py`.
- Backend uses **OpenAI TTS** (`https://api.openai.com/v1/audio/speech`). It streams audio chunks to the WebSocket client.
- **Config:** If `settings.tts_enabled` is False, provider/voice are not resolved; `stream_tts` is still called and uses `tts_service.stream_tts(text)`, which in turn requires `settings.openai_api_key`; if missing, it yields empty and returns (no audio).
- So for TTS to return real audio: **openai_api_key** must be set and the WebSocket connection must reach the backend.

**Verdict (TTS):**

- **Route existence:** **PASS** in code. `/voice/tts-stream` exists as WebSocket.
- **Route reachability:** **FAIL** in observed behavior. Client reports 404; conclusion: **backend TTS is not reachable at runtime** (wrong URL, proxy, or HTTP-vs-WS mismatch).
- **TTS functionality:** **Conditional.** Depends on WebSocket being used, base URL correct, and `openai_api_key` (and optionally `tts_enabled`) configured.

---

## 3. STT status

### 3.1 Paths used by the frontend

**Source:** `frontend/app/utils/stt.js`.

- If **no** `EXPO_PUBLIC_OPENAI_API_KEY`: frontend falls back to backend STT:
  - **POST** `${API_BASE}/voice/stt`
  - Headers: `Content-Type: audio/<format>`, `X-Audio-Format: <format>`
  - Body: raw audio (blob).
- If OpenAI key is set: frontend calls OpenAI directly; backend STT not used for that path.

### 3.2 Expected vs actual

| Check | Expected | Actual (from code) |
|-------|----------|--------------------|
| HTTP STT route exists | POST endpoint for audio → transcript | **PASS.** POST `/voice/stt` exists. Handler reads `request.body()` and returns `{"transcript": transcript}`. |
| Streaming STT route | Optional | **PASS.** WebSocket `/voice/stt-stream` exists. |

### 3.3 STT functionality

- **Source:** `backend/app/services/stt_service.py`.
- `transcribe_audio(audio_bytes)` calls OpenAI Whisper (`https://api.openai.com/v1/audio/transcriptions`).
- If `settings.openai_api_key` is missing: stream_stt yields placeholder `"..."`; `_transcribe_audio` is still used by the HTTP endpoint and will fail without a key (or return empty) depending on error handling.
- So for STT to return real transcript: **openai_api_key** must be set.

**Verdict (STT):**

- **Endpoint existence:** **PASS.** POST `/voice/stt` and WebSocket `/voice/stt-stream` exist in code.
- **Functionality:** **Conditional.** Depends on `openai_api_key` and backend being reachable. No 404 was reported for STT in the described logs.

---

## 4. Configuration status

**Source:** `backend/app/core/config.py`, `backend/app/services/tts_service.py`, `backend/app/services/stt_service.py`.

| Variable / setting | Purpose | Default / required |
|--------------------|---------|--------------------|
| `openai_api_key` | Used by TTS (OpenAI Speech) and STT (Whisper) | `None` (optional in schema). **Required** for real TTS/STT output. |
| `tts_enabled` | Resolves TTS provider/voice when True | `False`. If False, tts_stream still runs but provider/voice may not be set; tts_service uses OpenAI when key is present. |
| `tts_default_provider` | Preferred TTS provider name | `"elevenlabs"`. Actual implementation in tts_service is **OpenAI** only. |
| `eleven_api_key`, `eleven_voice_ids`, etc. | ElevenLabs | Not used by current tts_service (which is OpenAI-only). |
| `azure_speech_key`, `azure_speech_region`, etc. | Azure Speech | Not used by current tts_service. |

**Findings:**

- **TTS implementation** in code is **OpenAI only** (`tts_service.py` → `TTS_URL = "https://api.openai.com/v1/audio/speech"`). ElevenLabs/Azure are in config but not used by this service.
- For voice pipeline to work: **openai_api_key** must be set in backend env.
- **tts_enabled** defaults to False; its main effect in the current code is whether provider/voice are resolved for logging; streaming still runs and uses OpenAI when the key exists.

---

## 5. Concrete verification checklist (to run on backend machine)

These steps can be run with the backend up (e.g. `uvicorn app.main:app --reload`).

### Step 1 — List backend routes

```bash
curl -s http://localhost:8000/openapi.json | jq '.paths | keys' | grep -i voice
```

**Expected (from code):** Paths including `/voice/stt`, `/voice/tts-stream` (and other `/voice/*`).  
**Note:** OpenAPI may list WebSocket routes differently; if only HTTP operations are listed, `/voice/tts-stream` might appear only as a path with no GET/POST.

### Step 2 — Verify TTS endpoint (WebSocket path)

- The frontend uses **WebSocket** to `/voice/tts-stream`. There is **no HTTP TTS endpoint**.
- **HTTP GET** to the same path (e.g. `curl -i http://localhost:8000/voice/tts-stream`) may return **404** or **405** because the route is WebSocket-only.
- **Expected:** Not 404 if the app and prefix are mounted correctly; 405 or upgrade failure is possible for GET.
- **Observed in the wild:** 404 — suggests wrong host, wrong port, or proxy not forwarding the path.

### Step 3 — Verify TTS functionality (WebSocket)

- Use a WebSocket client to connect to `ws://localhost:8000/voice/tts-stream`, send `{"text":"Test sentence"}`, and check for binary audio frames.
- **Expected:** 200-style upgrade and audio chunks (or error text if `openai_api_key` missing / invalid).

### Step 4 — Verify STT endpoint existence

```bash
curl -i -X POST http://localhost:8000/voice/stt -H "Content-Type: audio/wav" --data-binary @sample.wav
```

**Expected:** **405** (no body) or **200** (with body) or **422** (validation), but **not 404**.  
**If 404:** STT route not mounted or wrong base URL.

### Step 5 — Verify STT functionality

- Same as above with a small valid audio file.
- **Expected:** 200 and JSON `{"transcript": "…"}` when `openai_api_key` is set and audio is valid.

---

## 6. Final verdict

| Category | Result | Evidence |
|----------|--------|----------|
| **Route inventory** | Voice routes **present in code** | `/voice/stt-stream` (WS), `/voice/tts-stream` (WS), `/voice/stt` (POST), plus pronunciation routes. |
| **TTS status** | **Partially wired; not reachable in practice** | Route exists as WebSocket only. Client sees 404 → backend TTS not reachable at runtime (URL/proxy/WS vs HTTP). |
| **STT status** | **Wired in code** | POST `/voice/stt` and WS `/voice/stt-stream` exist. No STT 404 cited in logs. |
| **Config status** | **Conditional** | Real audio requires `openai_api_key`. TTS uses OpenAI only; ElevenLabs/Azure in config are unused by current tts_service. |

**Verdict:**

- **Voice pipeline is partially wired, not operational end-to-end.**
  - **TTS:** Implemented and path matches frontend (`/voice/tts-stream`), but **404 in production** means the backend TTS endpoint is **not successfully reached** (wrong base URL, proxy, or HTTP request to WebSocket path).
  - **STT:** Routes exist and are correctly defined; operation depends on `openai_api_key` and backend being reachable.
- **Roleplay cannot rely on backend voice (TTS + STT) until:**
  1. The 404 for TTS is resolved (correct base URL, WebSocket upgrade allowed, no proxy stripping path).
  2. Backend has `openai_api_key` set (and any required env) so TTS and STT can call OpenAI.

No speculation beyond the above. No fixes applied. No frontend changes.
