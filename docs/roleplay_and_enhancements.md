# Roleplay & Recent Enhancements

## Overview

This document covers the roleplay functionality and recent enhancements to the PUHIS platform, including improved voice handling, path context management, and HTTP fallback endpoints.

## Roleplay Feature

### Backend Implementation

**Endpoint:** `POST /workplace/dialogue`

Generates a roleplay scenario for a specific profession.

**Request:**
```json
{
  "field": "sairaanhoitaja",
  "scenario_title": "Hoidon aloitus",
  "level": "B1"
}
```

**Response:**
```json
{
  "field": "sairaanhoitaja",
  "level": "B1",
  "title": "Hoidon aloitus",
  "roleplay_prompt": "Kerro kollegalle potilaan tämänhetkinen tila...",
  "key_phrases": ["potilas", "tila", "viime yö", "lääke", "mittaukset"],
  "grammar_tip": "Harjoittele partitiivia potilaan tilan kuvaukseen."
}
```

**Endpoint:** `POST /workplace/evaluate`

Evaluates a user's roleplay response.

**Request:**
```json
{
  "field": "sairaanhoitaja",
  "transcript": "Potilas on nyt paremmassa kunnossa..."
}
```

**Response:**
```json
{
  "field": "sairaanhoitaja",
  "scores": {
    "coverage": 2,
    "clarity": 3,
    "politeness": 1,
    "total": 5
  },
  "missing_phrases": ["lääke", "mittaukset"],
  "feedback": [
    "Lisää avainsanoja: potilas, tila, viime yö",
    "Hyvä! Selkeä vastaus."
  ]
}
```

### Frontend Implementation

**Screen:** `RoleplayScreen.js`

**Features:**
- Loads roleplay scenario from backend
- Displays scenario prompt and key phrases
- Voice input via MicRecorder component
- Text input fallback
- Real-time evaluation
- Detailed scoring (coverage, clarity, politeness)
- Feedback with missing phrases
- "Try Again" functionality

**Navigation:**
```javascript
navigation.navigate('Roleplay', {
  field: 'sairaanhoitaja',
  scenarioTitle: 'Hoidon aloitus',
  level: 'B1'
});
```

## Path Context Management

### Implementation

**Context:** `PathContext.js`

Provides global state management for learning path and profession across the app.

**Usage:**
```javascript
import { usePath } from '../context/PathContext';

function MyComponent() {
  const { path, profession, setPath, setProfession } = usePath();
  
  // Use path and profession
  // Update them as needed
}
```

**Integration:**
- `ConversationScreen` - Uses path context for conversation mode
- `HomeScreen` - Sets path when navigating
- `RoleplayScreen` - Uses profession from context
- `ProfessionDetailScreen` - Sets profession when starting practice

## Enhanced Voice Components

### MicRecorder Enhancements

**File:** `frontend/app/components/MicRecorder.js`

**Improvements:**
- Better WebSocket message handling with callbacks
- HTTP fallback for STT when WebSocket fails
- Transcript state management with refs
- Automatic cleanup on unmount
- Error handling with fallback

**Features:**
- Real-time WebSocket streaming for STT
- HTTP POST fallback to `/voice/stt` endpoint
- Transcript accumulation and display
- Processing state indicators

### AudioPlayer Enhancements

**File:** `frontend/app/components/AudioPlayer.js`

**Improvements:**
- Better WebSocket binary handling
- Chunk accumulation and debounced playback
- Audio element management
- Fallback to browser SpeechSynthesis
- Connection retry logic

**Features:**
- Streaming TTS via WebSocket
- Audio chunk buffering
- Automatic playback when stream completes
- Error handling with fallback

## HTTP Fallback Endpoints

### STT HTTP Endpoint

**Endpoint:** `POST /voice/stt`

Provides non-streaming transcription for clients that can't use WebSockets.

**Request:**
- Multipart form data with `audio` file (webm/opus recommended)

**Response:**
```json
{
  "transcript": "Minä menen kauppaan"
}
```

**Implementation:**
```python
@router.post("/stt")
async def transcribe_audio_file(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    transcript = await stt_service.transcribe_audio(audio_bytes)
    return {"transcript": transcript}
```

**Usage in Frontend:**
```javascript
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm');

const response = await fetch(`${API_BASE}/voice/stt`, {
  method: 'POST',
  body: formData,
});

const result = await response.json();
const transcript = result.transcript;
```

## New API Functions

### Roleplay Functions

**File:** `frontend/app/utils/api.js`

```javascript
// Fetch roleplay scenario
export async function fetchRoleplay(field, scenarioTitle, level) {
  const res = await fetch(`${API_BASE}/workplace/dialogue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, scenario_title: scenarioTitle, level }),
  });
  return res.json();
}

// Evaluate roleplay response
export async function evaluateRoleplay(field, transcript) {
  const res = await fetch(`${API_BASE}/workplace/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, transcript }),
  });
  return res.json();
}
```

### Spaced Repetition Function

```javascript
// Fetch spaced repetition queue
export async function fetchSrsQueue(errors = [], field = null, limit = 10) {
  const res = await fetch(`${API_BASE}/vocab/srs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ errors, field, limit }),
  });
  return res.json();
}
```

## Integration Flow

### Roleplay Flow

```
ProfessionDetailScreen
  ↓ (User clicks "Start Roleplay Scenario")
RoleplayScreen
  ↓ (Loads scenario)
Display scenario prompt + key phrases
  ↓ (User responds via voice/text)
Evaluate response
  ↓
Display scores + feedback
  ↓ (User clicks "Try Again")
Reset and repeat
```

### Path Context Flow

```
HomeScreen
  ↓ (User selects path)
setPath('general') / setPath('workplace')
  ↓
ConversationScreen
  ↓ (Uses path from context)
Conversation with appropriate persona
```

## Scoring System

### Roleplay Evaluation

**Coverage (0-3):**
- 0: No key phrases used
- 1: 1 key phrase used
- 2: 2-3 key phrases used
- 3: 4+ key phrases used

**Clarity (1-3):**
- 1: < 15 words
- 2: 15-40 words
- 3: > 40 words

**Politeness (0-1):**
- 0: No politeness markers
- 1: Contains "kiitos" or "ole hyvä"

**Total Score (0-5):**
- Sum of coverage + clarity + politeness

## Error Handling

### WebSocket Fallbacks

1. **STT WebSocket fails:**
   - Automatically falls back to HTTP POST
   - Uses `/voice/stt` endpoint
   - Returns full transcript

2. **TTS WebSocket fails:**
   - Falls back to browser SpeechSynthesis
   - Uses Finnish voice (fi-FI)
   - Continues playback

### API Error Handling

- All API calls have try-catch blocks
- User-friendly error messages
- Retry buttons on error screens
- Loading states during requests

## Dependencies Added

**Backend:**
- `python-multipart` - For file upload handling
- `pydantic-settings` - For settings management

## Testing Recommendations

1. **Roleplay:**
   - Test scenario loading
   - Test voice input
   - Test text input
   - Test evaluation
   - Test "Try Again" flow

2. **Voice Components:**
   - Test WebSocket connection
   - Test HTTP fallback
   - Test error handling
   - Test cleanup on unmount

3. **Path Context:**
   - Test path persistence
   - Test profession setting
   - Test context updates

## Future Enhancements

1. **Roleplay:**
   - Multiple scenarios per profession
   - Scenario difficulty levels
   - Progress tracking
   - Leaderboards

2. **Voice:**
   - Better audio quality
   - Noise cancellation
   - Real-time transcription display
   - Audio waveform visualization

3. **Path Context:**
   - Persist to local storage
   - Sync across devices
   - User preferences

## Notes

- All roleplay scenarios are profession-specific
- Evaluation is based on key phrase coverage
- WebSocket is preferred, HTTP is fallback
- Path context is in-memory (not persisted)
- All components handle errors gracefully
