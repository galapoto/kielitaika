# Voice Contract

Status: `frozen`  
Mode: `fail-closed`  
Scope: STT, TTS, audio transport, pronunciation, and YKI-safe voice behavior

## 4.1 System Overview

The voice system moves audio between frontend and backend, returns transcripts and synthesized audio, and exposes pronunciation analysis. It is transport and processing only. Microphone interaction rules remain owned by KAIL.

The voice system does:

- accept recorded audio uploads for transcription
- optionally provide streaming transcript updates for non-YKI practice contexts
- provide cached or streamed TTS playback
- provide pronunciation analysis and nudges

The voice system does not do:

- own microphone start/stop behavior
- own conversation or roleplay turn logic
- create YKI exam state
- introduce real-time unpredictable TTS or STT into scored YKI answers

System boundaries:

- KAIL owns record start/stop and orchestrator states
- backend voice routes own upload, normalization, transcription, synthesis, and pronunciation
- YKI uses deterministic upload-and-process behavior only

## 4.2 Ownership

Frontend responsibility:

- record audio only through the KAIL orchestrator
- upload completed recordings with session context
- play returned TTS audio
- discard empty or failed transcripts

Backend responsibility:

- validate file size and MIME type
- normalize audio when needed
- transcribe uploaded audio
- synthesize TTS audio
- return pronunciation analysis payloads
- enforce mode-specific restrictions such as YKI batch-only behavior

External services:

- speech-to-text provider, text-to-speech provider, and pronunciation engines may exist behind backend only
- no specific provider is assumed by this contract

## 4.3 Data Structures

### Shared Voice Context

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `session_id` | `string` | yes | non-empty |
| `speaking_session_id` | `string \| null` | no | required for non-YKI speaking contexts |
| `turn_id` | `string \| null` | no | required for roleplay and speaking turns |
| `task_id` | `string \| null` | no | required for YKI speaking tasks |
| `mode` | `"yki_exam" \| "roleplay" \| "conversation" \| "fluency" \| "guided_turn" \| "shadowing" \| "micro_output"` | yes | exact enum |
| `locale` | `string` | yes | BCP-47 tag, default `fi-FI` |

### STT Batch Upload

`POST /api/v1/voice/stt/transcriptions`  
Content type: `multipart/form-data`

Fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `file` | binary | yes | max 25 MB |
| `mime_type` | `string` | yes | one of `audio/m4a`, `audio/mp4`, `audio/webm`, `audio/ogg`, `audio/wav` |
| `duration_ms` | `integer \| null` | no | `>= 0` |
| `session_id` | `string` | yes | non-empty |
| `speaking_session_id` | `string \| null` | no | required when mode is not `yki_exam` |
| `turn_id` | `string \| null` | no | required for turn-based modes |
| `task_id` | `string \| null` | no | required for `yki_exam` speaking uploads |
| `mode` | enum | yes | exact enum from shared context |
| `locale` | `string` | yes | valid BCP-47 tag |

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `ok` | `boolean` | yes | transcription success for this upload |
| `transcript` | `string` | yes | may be empty only when `ok=false` |
| `language` | `string \| null` | yes | detected language |
| `confidence` | `number \| null` | yes | 0.0-1.0 when available |
| `duration_ms` | `integer \| null` | yes | normalized duration |
| `provider` | `string` | yes | backend-selected provider identifier |
| `normalized_format` | `string \| null` | yes | normalized backend format or passthrough marker |
| `audio_ref` | `string` | yes | opaque backend audio reference |
| `warnings` | `array` | yes | zero or more warning codes |

STT rules:

- YKI exam uses this endpoint only; streaming STT is forbidden for YKI
- empty transcript returns `ok=false` with `warnings=["EMPTY_TRANSCRIPT"]`

### STT Streaming

`WS /api/v1/ws/voice/stt-stream`

Allowed modes:

- `conversation`
- `fluency`
- `guided_turn`
- `shadowing`
- `micro_output`

Forbidden mode:

- `yki_exam`

Open message:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `session_id` | `string` | yes | non-empty |
| `speaking_session_id` | `string` | yes | non-empty |
| `mode` | enum | yes | one of allowed streaming modes |
| `locale` | `string` | yes | valid BCP-47 tag |

Server message:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `type` | `"partial_transcript" \| "final_transcript" \| "error"` | yes | exact enum |
| `text` | `string` | conditional | transcript text for transcript events |
| `error_code` | `string` | conditional | required for `error` |
| `message` | `string \| null` | yes | optional explanatory text |

Streaming STT is advisory only. Authoritative turn submission still requires batch STT or explicit typed text, depending on the feature contract.

### TTS Request

`POST /api/v1/voice/tts/requests`

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `text` | `string` | yes | 1-4000 chars after trim |
| `mode` | `"system" \| "conversation" \| "roleplay" \| "yki"` | yes | exact enum |
| `voice_preference` | `"male" \| "female" \| "neutral" \| null` | no | optional preference only |
| `replayable` | `boolean` | yes | exact value |
| `speed` | `number \| null` | no | `0.75-1.25` when provided |

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `audio_url` | `string` | yes | absolute or app-relative retrievable URL |
| `duration_seconds` | `number` | yes | `> 0` |
| `provider` | `string` | yes | backend-selected provider identifier |
| `voice_profile` | `string` | yes | backend-selected voice profile id |
| `cache_key` | `string` | yes | opaque non-empty cache key |
| `cached` | `boolean` | yes | exact value |
| `replayable` | `boolean` | yes | exact value |

### TTS Streaming

`WS /api/v1/ws/voice/tts-stream`

Allowed modes:

- `conversation`
- `roleplay`

Forbidden modes:

- `yki`
- `yki_exam`

Open message:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `text` | `string` | yes | 1-4000 chars |
| `voice_preference` | `"male" \| "female" \| "neutral" \| null` | no | optional |
| `mode` | `"conversation" \| "roleplay"` | yes | exact enum |

Server messages:

- `{"type":"tts_start","format":"mp3","provider":"<id>"}`
- binary audio chunks
- `{"type":"tts_end"}`
- `{"type":"error","source":"tts","reason":"<code>","message":"<text>"}`

### Pronunciation Analysis

`POST /api/v1/voice/pronunciation/analyze`

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `expected_text` | `string` | yes | non-empty |
| `transcript` | `string` | yes | non-empty |
| `audio_ref` | `string \| null` | no | backend audio reference if available |

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `score` | `number` | yes | 0-4 inclusive |
| `feedback` | `string` | yes | non-empty |
| `details` | `object` | yes | structured analysis payload |

## 4.4 State Model

Shared upload state:

- `idle -> recording -> uploading -> transcribing -> completed`
- `idle -> recording -> uploading -> failed`

Roleplay extension:

- `completed -> awaiting_ai -> ready`

TTS state:

- `idle -> requesting -> buffering -> playing -> completed`
- `requesting/buffering/playing -> failed`

Invalid states:

- `recording -> completed` without upload
- `yki_exam` using `tts-stream`
- transcript accepted as final after streaming-only STT without the mode allowing it

## 4.5 Failure Modes

What can fail:

- microphone file missing
- invalid MIME type
- upload too large
- normalization failure
- STT provider failure
- TTS provider failure
- empty transcript
- websocket interruption

System response:

- backend returns structured error envelope for HTTP failures
- websocket returns structured `error` message before close when possible
- empty transcript is not treated as a successful user answer
- TTS playback failure never mutates session or answer state

UI should do:

- show upload/transcription failure and allow retry
- keep the original recording until upload result is known
- never auto-advance YKI or roleplay on TTS failure alone

## 4.6 Edge Cases

- Network failure: upload or stream fails; UI keeps the turn pending and allows retry.
- Partial data: transcript without `audio_ref` or provider metadata is invalid and rejected.
- Repeated actions: duplicate upload submissions for the same `turn_id` are rejected by backend with a stable duplicate error.
- Invalid input: unsupported audio MIME type, oversized file, missing `task_id` for YKI, or missing `turn_id` for roleplay are rejected.
- Empty transcript: treated as non-completed voice result; user must retry or type when the feature allows typing.
- Session mismatch: backend rejects audio context that does not belong to the authenticated user or active session.

## 4.7 Forbidden Behavior

- no automatic microphone stop; KAIL start/stop rule is mandatory
- YKI must never use streaming STT or streaming TTS to determine a scored answer
- backend must never accept an upload without validated session context
- frontend must never submit a transcript the user did not explicitly confirm in modes that allow correction
- provider-specific assumptions must never leak into frontend behavior

## 4.8 Integration Points

UI:

- KAIL orchestrator triggers batch upload after explicit stop
- roleplay and conversation playback use TTS responses

YKI engine:

- YKI speaking answers use batch upload only
- YKI listening playback uses engine-served audio assets, not this TTS transport, unless an explicit future contract revision says otherwise

Other systems:

- session contract supplies session ids and expiry rules
- api contract supplies envelope and websocket namespace
- roleplay contract supplies turn and AI-wait states

## 4.9 Future Extension Rules

Safe extensions:

- add new pronunciation detail fields
- add new non-YKI voice modes
- add cached audio metadata fields

Must not change:

- YKI remains batch-only for scored voice handling
- KAIL remains owner of mic interaction behavior
- voice providers remain backend-selected and frontend-opaque
