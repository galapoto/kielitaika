# Backend Verification Audit — Agent X
Date: 2026-02-04
Scope: Voice pipeline (TTS + STT) backend availability and functionality
Mode: Forensic plan and audit prompt only (no fixes)

## PART A — BACKEND VERIFICATION PLAN (VOICE PIPELINE)

### A.1 Ground rules
- Do not change frontend code during this phase.
- Do not “guess” endpoints.
- Every check must include:
  - expected behavior
  - actual observed behavior
  - pass / fail

### A.2 Known facts from logs
- Backend is running:
  - `Backend OK: {"message":"RUKA backend running"}`
- Auth works.
- Roleplay sessions are created.
- TTS returns hard 404:
  - `TTS API error: 404 {"detail":"Not Found"}`

Interpretation: a 404 means the route does not exist, path mismatch, or service not mounted at runtime. This is not a transient failure.

### A.3 Required backend voice components
The roleplay pipeline requires all of these to exist and respond:

1. **Text-to-Speech (TTS)**
   - Used when:
     - AI speaks opening line
     - AI replies during roleplay
     - AI gives final conclusion (turn 5)
   - Minimum requirements:
     - HTTP endpoint exists
     - Accepts text payload
     - Returns audio (binary or base64)
     - Returns 200, not 404

2. **Speech-to-Text (STT)**
   - Used when:
     - User taps mic
     - Audio is recorded
     - Transcript is produced
   - Minimum requirements:
     - HTTP endpoint exists
     - Accepts audio payload
     - Returns transcript text

3. **Roleplay orchestration**
   - Used when:
     - AI turn is requested
     - Conversation state advances
   - Already confirmed working from logs.

### A.4 Concrete endpoint verification checklist

**Step 1 — List backend routes**
On the backend machine:
```
uvicorn main:app --reload
```
Then inspect routes (one of these, depending on stack):
```
curl http://localhost:8000/openapi.json | jq '.paths | keys'
```
or
```
python -c "from app.main import app; print([r.path for r in app.routes])"
```
Expected:
- A route related to TTS (e.g. `/tts`, `/voice/tts`, `/speech/synthesize`)
- A route related to STT (e.g. `/stt`, `/speech/transcribe`)

Fail condition:
- No TTS/STT routes at all → backend not wired for voice.

**Step 2 — Verify TTS endpoint existence**
Using the exact path used by the frontend (from `tts.ts`):
```
curl -i http://localhost:8000/<tts-path>
```
Expected:
- `405 Method Not Allowed` (if GET) **or** `200` with error body
- Not `404`

Current observed:
- `404 Not Found` → hard failure

**Step 3 — Verify TTS functionality**
If the route exists, test payload:
```
curl -X POST http://localhost:8000/<tts-path> \
  -H "Content-Type: application/json" \
  -d '{"text":"Test sentence"}' \
  -o test.wav
```
Expected:
- HTTP 200
- Audio file written
- Non-zero file size

**Step 4 — Verify STT endpoint existence**
```
curl -i http://localhost:8000/<stt-path>
```
Expected:
- Not `404`

**Step 5 — Verify STT functionality**
```
curl -X POST http://localhost:8000/<stt-path> \
  -H "Content-Type: audio/wav" \
  --data-binary @sample.wav
```
Expected:
- HTTP 200
- JSON with transcript text

### A.5 Interpretation rules
| Result | Meaning |
|---|---|
| TTS 404 | Backend does not expose TTS at runtime |
| STT 404 | Backend does not expose STT at runtime |
| Both missing | Roleplay cannot speak by design |
| Routes exist but error | Misconfiguration (keys, providers, env vars) |
| Routes work | Frontend must be wired or unblocked |

This plan produces facts, not opinions.

---

## PART B — SINGLE AGENT PROMPT (VOICE FORENSIC AUDIT)

### 🔍 Agent Prompt — Voice Backend Forensic Audit

**Role**
You are a forensic audit agent. Your sole responsibility is to determine whether the backend voice pipeline (TTS + STT) required for roleplay is present, reachable, and functional.

You are not allowed to:
- modify frontend code
- add fallback UI
- “assume” services exist
- stop early if one part fails

You must run all checks and report facts.

**Scope**
Audit only backend voice capability, including:
- TTS endpoint existence
- TTS endpoint functionality
- STT endpoint existence
- STT endpoint functionality
- Environment configuration required for voice

**Tasks (must all be completed)**
1. **Identify voice-related routes**
   - Enumerate backend routes
   - List all routes related to:
     - text-to-speech
     - speech-to-text
   - Explicitly state if none exist

2. **Verify TTS endpoint**
   - Call the exact endpoint used by the frontend
   - Record:
     - HTTP status
     - response body
   - If 404 → mark as hard failure

3. **Verify TTS functionality**
   - If endpoint exists, send a test payload
   - Confirm whether audio is returned

4. **Verify STT endpoint**
   - Repeat steps 2–3 for speech-to-text

5. **Verify configuration**
   - Check environment variables:
     - API keys
     - provider flags
     - feature toggles
   - Identify missing or disabled configs

**Output format (mandatory)**
Produce a structured report with:
- Route inventory
- TTS status
- STT status
- Config status
- Final verdict (one of):
  - Voice pipeline operational
  - Voice pipeline partially wired
  - Voice pipeline missing entirely

Include evidence (status codes, responses). No speculation. No fixes.

**Stopping condition**
You may stop only after:
- both TTS and STT are proven working, **or**
- their absence is proven conclusively
