# Phase 0 — Roleplay Execution Trace (Baseline Snapshot)

**No code changes.** Facts only.

---

## Files involved in roleplay

| Area | File(s) |
|------|--------|
| UI | `frontend/app/screens/RoleplayScreen.js` |
| Mic | `frontend/app/components/MicButton.js` |
| Voice hooks | `frontend/app/hooks/useVoiceStreaming.js`, `frontend/app/hooks/useVoice.ts` |
| TTS client | `frontend/app/services/tts.ts` |
| STT client | `frontend/app/utils/stt.js` |
| Backend config | `frontend/app/config/backend.js` (HTTP_API_BASE, WS_API_BASE) |
| Session | `frontend/app/context/SpeakingSessionContext.js`, `frontend/app/utils/speakingAttempts.js` |
| Wrapper | `frontend/app/components/SpeakingScreenWrapper.js` |
| Backend voice | `backend/app/routers/voice.py`, `backend/app/services/tts_service.py`, `backend/app/services/stt_service.py` |

---

## Execution flow (what fires)

### 1. Entering RoleplayScreen

- **Fires:** RootNavigator → WorkStack "Roleplay" → SpeakingScreenWrapper(RoleplayScreen).
- **Fires:** SpeakingScreenWrapper generates `sessionId`, passes `options = { maxTurns: 5, autoStart: true }` → SpeakingSessionProvider → `initSpeakingSession` + `startSpeakingSession` → status `'live'`, one turn (index 0).
- **Fires:** RoleplayScreen mounts, `useEffect` runs: `fetchRoleplay(field, scenarioTitle, level)` → **POST** `${HTTP_API_BASE}/workplace/dialogue` (backend).
- **Observed (from logs):** Roleplay sessions are created; backend responds.

### 2. AI opening attempt

- **Fires:** After fetch succeeds: `setScenario(data)`, `setSpeakingTurnAiTranscript(sessionId, 0, data.roleplay_prompt)`.
- **Fires:** `speak(data.roleplay_prompt, 'professional')` → `useVoice` → `playTTS(text, 'professional')` in `tts.ts`.
- **Fires:** `playTTS` calls `fetchTTSAudioBase64(text)` which:
  - Opens **WebSocket** to `${WS_BASE}/voice/tts-stream` where `WS_BASE = WS_API_BASE` (e.g. `ws://localhost:8000`).
  - On open: `ws.send(JSON.stringify({ text }))`.
  - Expects binary chunks in `onmessage`; merges, base64, then `playAudioFromBase64`.
- **Does not fire (when broken):** If WebSocket fails to connect (e.g. 404 on upgrade, wrong host, proxy):
  - `ws.onerror` or `ws.onclose` runs.
  - No chunks received → `finalize()` rejects with "TTS stream returned no audio" or network error.
  - RoleplayScreen catches: `setAudioUnavailable(true)`, `console.warn('[Roleplay] Initial TTS playback failed:', err)`.
- **Observed (from logs):** TTS API error: **404 {"detail":"Not Found"}** → connection to TTS endpoint fails at runtime. **AI never speaks.**

### 3. Scenario prompt text

- **Fires:** Regardless of TTS, prompt text is set: `activeTurn?.aiSpeech?.transcript || scenario?.roleplay_prompt` is rendered. So **text can show** even when TTS fails.

### 4. Mic press (first tap)

- **Fires:** `handleMicPress()` → `startRecording({ userInitiated: true, userGesture: true })`.
- **Fires:** `useVoiceStreaming.startRecording`: `assertSpeakingSessionActive()` (session is live → passes), `setIsRecording(true)`, `setIsListening(true)`, `setIsProcessing(true)`.
- **Native:** `startNativeRecording()` (expo-av), then returns. No STT request until user taps stop.
- **Web:** MediaRecorder + `connectSTT(WS_API_BASE/voice/stt-stream)`. If STT WS fails, on stop it falls back to `sendToAPI(blob)` → `transcribeAudio({ audioBlob })` → **POST** `${HTTP_API_BASE}/voice/stt` (if no `EXPO_PUBLIC_OPENAI_API_KEY`).
- **Expected UI:** "Kuunnellaan…" (isRecording true). If state updates are correct, **recording indicator should appear**. If nothing happens visually, either state is not updating or component tree blocks it.

### 5. Mic press (second tap) — stop and STT

- **Fires:** `stopRecording()`.
- **Native:** `stopNativeRecording()` → uri → `sendNativeAudio(uri, { callTranscriptComplete: true })` → `transcribeAudio({ fileUri })`. If no OpenAI key: **POST** `${HTTP_API_BASE}/voice/stt` with body = audio. If backend unreachable or 404/5xx → throw → `onTranscriptComplete('', { error })` or no transcript.
- **Result:** Transcript only appears if STT returns non-empty text. If backend STT is unreachable or fails, transcript stays empty, retry UI can show (RoleplayScreen already has sttError + retry).

---

## Where execution stops (summary)

| Step | What fires | What does not / fails |
|------|------------|------------------------|
| Entry | Session init, fetchRoleplay, scenario set | — |
| AI speak | speak() → WebSocket to /voice/tts-stream | **WebSocket fails (404).** No audio. audioUnavailable set. |
| Prompt text | Renders from scenario / activeTurn | Works if scenario loaded. |
| Mic tap 1 | startRecording, isRecording true (intended) | If no visual: either state not reaching UI or mic disabled due to error state. |
| Mic tap 2 | stopRecording, sendNativeAudio or sendToAPI | If backend STT unreachable: no transcript, STT error path. |

---

## Why the roleplay is dead (explicit statement)

**The roleplay is dead because:**

1. **TTS returns 404** — The frontend uses **WebSocket** to `/voice/tts-stream`. The backend exposes TTS **only** as WebSocket at that path. A 404 means the WebSocket upgrade request is either hitting the wrong host/port, is blocked by a proxy, or the server is not mounting the route at runtime. So **AI never speaks**, and the only output is text.

2. **Backend voice is unreachable at runtime** — Same base URL (or proxy) that gives 404 for TTS can make STT (POST /voice/stt or WS /voice/stt-stream) unreachable. So **user speech may never be transcribed** or may fail silently, so no transcript appears and the turn does not advance.

3. **No audible AI + no visible transcript** — Combined effect: no audio on entry, and after mic use either no recording feedback or no transcript. So the experience is "nothing happens" and the voice pipeline is **broken end-to-end**, not just the mic UI. The root cause is **backend reachability + WebSocket wiring + env config**, not a frontend animation bug.

---

**End of Phase 0. No fixes applied.**
