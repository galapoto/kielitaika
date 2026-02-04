# ROLEPLAY FORENSIC AUDIT — AGENT X
Date: 2026-02-04
Scope: Roleplay system runtime state, wiring, and failure points vs approved restructuring
Method: Static code trace of current repo state (no fixes performed during audit)

## Observed Runtime Behavior
Based on current code paths:
- Entrypoint: `Roleplay` route mounts `RoleplayScreen` via `SpeakingScreenWrapper`, which creates a speaking session with `maxTurns = 5` and `autoStart = true`. Evidence in `frontend/app/navigation/RootNavigator.tsx` and `frontend/app/components/SpeakingScreenWrapper.js`.
- Initialization: `RoleplayScreen` loads a scenario via `fetchRoleplay` and sets the initial AI transcript on turn 0. It attempts to play TTS for the initial prompt. Evidence in `frontend/app/screens/RoleplayScreen.js` and `frontend/app/utils/api.js`.
- Turn progression: User speech is captured with `useVoiceStreaming`. A completed transcript triggers `handleTranscriptComplete`, which saves the user transcript, advances the turn, inserts the next AI prompt, and attempts TTS. Evidence in `frontend/app/screens/RoleplayScreen.js` and `frontend/app/hooks/useVoiceStreaming.js`.
- Finalization: On the final turn, `evaluateRoleplay` is called, and `completeSpeakingSession` is invoked in a `finally` block. Evidence in `frontend/app/screens/RoleplayScreen.js` and `frontend/app/utils/speakingAttempts.js`.
- UI state feedback: Loading, error, evaluating, and mic status are rendered explicitly. Mic is disabled while processing or after completion. Evidence in `frontend/app/screens/RoleplayScreen.js`.
- Visuals: Roleplay uses `Background` with `solidContentZone` and no image variant. Evidence in `frontend/app/screens/RoleplayScreen.js` and `frontend/app/components/ui/Background.js`.

## Expected Behavior (from restructuring)
- Fixed 5-turn conversation.
- AI starts first.
- Tap once to start recording; tap once to stop (no press-and-hold).
- Deterministic end after turn 5.
- TTS plays AI turns automatically.
- Deep blue React design with no background image during roleplay.
- Explicit, consistent state transitions.

## Mismatch Table (Expected vs Actual)
| Expected | Actual (current code) | Status |
|---|---|---|
| 5 turns total | `maxTurns` is 5 and used in roleplay flow | Matches |
| AI starts first | Initial AI prompt is fetched, stored, and spoken on mount | Matches |
| Tap-once mic toggle | Roleplay uses `MicButton` `onPress` toggling start/stop | Matches for Roleplay |
| No press-and-hold | Roleplay does not use press-and-hold; `MicButton` still supports it for other screens | Matches for Roleplay |
| Deterministic end after turn 5 | End occurs after a transcript completes and `completeSpeakingSession` succeeds | Conditional |
| TTS auto-plays AI turns | TTS is invoked for initial and follow-up prompts; failures are logged and do not block | Conditional |
| No background image | Roleplay uses `solidContentZone` | Matches |

## Broken or Missing Execution Paths
1. **Completion depends on transcript existence**
If STT does not return a transcript, the turn does not advance, and the session never completes. This blocks the deterministic end rule at runtime. Evidence in `frontend/app/screens/RoleplayScreen.js` and `frontend/app/hooks/useVoiceStreaming.js`.

2. **Session completion strictness**
`completeSpeakingSession` requires AI and user transcripts for all turns. If any turn is missing data, it throws, and the session may remain incomplete. Evidence in `frontend/app/utils/speakingAttempts.js`.

3. **Roleplay evaluation uses only the last user reply**
`evaluateRoleplay` is called with just the final user transcript, not the full dialogue history. This may be intentional, but the backend is not explicitly informed about full turn context. Evidence in `frontend/app/utils/api.js` and `frontend/app/screens/RoleplayScreen.js`.

## TTS Failure Root Cause Analysis
- Roleplay TTS is handled by `useVoice → playTTS`. Evidence in `frontend/app/hooks/useVoice.js` and `frontend/app/services/tts.ts`.
- The current TTS client opens a WebSocket to `WS_API_BASE/voice/tts-stream`. Evidence in `frontend/app/services/tts.ts`.
- Backend exposes the `voice/tts-stream` WebSocket route. Evidence in `backend/app/routers/voice.py`.

A 404 in runtime indicates one of the following conditions:
- `WS_API_BASE` points to a host that does not run the backend.
- The backend process running is not the one exposing `/voice/tts-stream`.

There is no HTTP `/tts` endpoint in the backend, so HTTP 404s on `/tts` would be expected and indicate a contract mismatch in the running environment. Evidence in `backend/app/routers/voice.py`.

## Microphone Behavior Compliance Check
- Roleplay uses `MicButton` with `onPress` to toggle recording on tap. Evidence in `frontend/app/screens/RoleplayScreen.js` and `frontend/app/components/MicButton.js`.
- No press-and-hold logic is wired into the roleplay screen. The mic state is surfaced in the UI with explicit status text. Evidence in `frontend/app/screens/RoleplayScreen.js`.

Result: The roleplay screen conforms to tap-toggle semantics, while the shared `MicButton` still supports press-and-hold for other screens.

## Turn System Integrity Assessment
- A turn counter exists in the speaking session context (`currentTurnIndex`) and is advanced via `advanceSpeakingTurn`. Evidence in `frontend/app/context/SpeakingSessionContext.js` and `frontend/app/utils/speakingAttempts.js`.
- The system can reach turn 5 if each transcript completes and `completeSpeakingSession` does not throw. Evidence in `frontend/app/screens/RoleplayScreen.js`.
- Final turn handling is distinct: evaluation is executed and the session is completed. Evidence in `frontend/app/screens/RoleplayScreen.js`.

## Conclusion: Why Roleplay Is Currently Dead
Roleplay becomes non-functional when either of the following occurs at runtime:
- TTS requests are routed to a backend that does not expose the WebSocket `/voice/tts-stream`, producing 404s and leaving AI prompts silent.
- STT fails to return a transcript, preventing turn advancement and blocking the deterministic end condition.

The current code expects both a valid TTS WebSocket endpoint and successful STT callbacks. If either is missing, the roleplay loop stalls or becomes silent, which matches the observed “dead” behavior reported in logs.
