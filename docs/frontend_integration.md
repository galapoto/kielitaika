# Frontend Integration Guide

## New Features Implemented

### 1. Conversation Screen ✅
**File:** `frontend/app/screens/ConversationScreen.js`

Features:
- Full conversation interface with message bubbles
- Progressive disclosure toggle (ON/OFF)
- Support level indicators
- Grammar correction display
- Voice input via microphone
- Text input fallback

**Usage:**
```javascript
navigation.navigate('Conversation', {
  level: 'A1',
  path: 'general',
  profession: null
});
```

### 2. Enhanced TutorBubble Component ✅
**File:** `frontend/app/components/TutorBubble.js`

Features:
- Displays masked text when progressive disclosure is enabled
- Shows support level badge
- Toggle between masked and full text
- Grammar correction display
- Visual feedback for different support levels

**Props:**
- `message` - Full AI reply text
- `maskedMessage` - Masked version (with endings/verbs hidden)
- `supportLevel` - Current support level (0-3)
- `grammar` - Grammar analysis object
- `showMasked` - Whether to show masked version

### 3. Pronunciation Screen ✅
**File:** `frontend/app/screens/PronunciationScreen.js`

Features:
- Pronunciation practice interface
- Score visualization (0-4 scale)
- Vowel length error detection display
- Consonant length error detection display
- Rhythm assessment
- Voice recording integration

**API Integration:**
- Uses `analyzePronunciation()` from `api.js`
- Connects to `/voice/pronunciation/analyze` endpoint

### 4. Enhanced MicRecorder Component ✅
**File:** `frontend/app/components/MicRecorder.js`

Features:
- WebSocket integration for real-time STT
- MediaRecorder API for audio capture
- Transcript display
- Processing indicators

**Props:**
- `onTranscript` - Callback when transcript is received

**WebSocket:**
- Connects to `ws://localhost:5000/voice/stt-stream`
- Sends audio chunks in real-time
- Receives transcript segments

### 5. Enhanced AudioPlayer Component ✅
**File:** `frontend/app/components/AudioPlayer.js`

Features:
- WebSocket integration for TTS streaming
- Fallback to browser SpeechSynthesis API
- Play/Stop controls
- Loading states

**Props:**
- `text` - Text to speak
- `autoPlay` - Whether to auto-play on mount

**WebSocket:**
- Connects to `ws://localhost:5000/voice/tts-stream`
- Receives audio chunks
- Plays audio as it streams

### 6. Enhanced WebSocket Hook ✅
**File:** `frontend/app/hooks/useWebSocket.js`

Features:
- Message handling (text and binary)
- Connection state management
- Error handling
- Cleanup on unmount

**Usage:**
```javascript
const { connect, send, close, isConnected, lastMessage } = useWebSocket(
  (message) => {
    // Handle incoming message
  },
  (error) => {
    // Handle error
  }
);
```

### 7. Updated API Utilities ✅
**File:** `frontend/app/utils/api.js`

New functions:
- `analyzePronunciation(expectedText, transcript, audioBytes)`
- `computeSupportLevel(history, hesitation, accuracy)`
- `maskText(text, level)`

### 8. Updated Home Screen ✅
**File:** `frontend/app/screens/HomeScreen.js`

Features:
- Modern menu interface
- Quick access to all features
- Navigation to Conversation and Pronunciation screens

## Navigation Structure

```
Home
├── Conversation (with progressive disclosure)
├── Pronunciation Practice
├── Lessons
├── YKI Practice
└── Progress
```

## API Endpoints Used

### REST Endpoints
- `POST /session/send` - Send conversation message
- `POST /voice/pronunciation/analyze` - Analyze pronunciation
- `POST /progressive-disclosure/compute-level` - Calculate support level
- `POST /progressive-disclosure/mask-text` - Mask text

### WebSocket Endpoints
- `ws://host/voice/stt-stream` - Speech-to-text streaming
- `ws://host/voice/tts-stream` - Text-to-speech streaming

## Progressive Disclosure Flow

1. User sends message
2. Backend calculates support level based on accuracy
3. Backend returns both `reply` and `masked_reply`
4. Frontend displays masked version if enabled
5. User can toggle to see full text
6. Support level badge shows current scaffolding level

## Pronunciation Analysis Flow

1. User records audio or types expected text
2. Audio is transcribed via STT
3. Frontend calls `/voice/pronunciation/analyze`
4. Backend compares expected vs transcript
5. Frontend displays:
   - Score (0-4)
   - Vowel issues
   - Consonant issues
   - Rhythm feedback
   - Overall feedback message

## Styling

All components use consistent styling:
- Primary color: `#0A3D62` (Deep Blue)
- Accent color: `#24CBA4` (Aurora Green)
- Background: `#F8FAFC` (Snow White)
- Error: `#FF6B6B` (Salmon Red)

## Environment Variables

Set in `.env` or environment:
```
EXPO_PUBLIC_API_BASE=http://localhost:5000
```

## Next Steps for Production

1. **Error Handling**
   - Add retry logic for failed API calls
   - Better error messages for users
   - Offline mode handling

2. **Performance**
   - Optimize WebSocket reconnection
   - Cache pronunciation analyses
   - Lazy load screens

3. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode

4. **Testing**
   - Unit tests for components
   - Integration tests for API calls
   - E2E tests for user flows

5. **Mobile Optimization**
   - Native audio recording (React Native)
   - Better mobile UI/UX
   - Push notifications

## Known Limitations

1. **WebSocket STT/TTS**
   - Currently uses browser MediaRecorder API
   - For React Native, need native audio recording
   - TTS fallback uses browser SpeechSynthesis

2. **Pronunciation Analysis**
   - Text-based analysis (not phoneme alignment)
   - Can be enhanced with audio analysis

3. **Progressive Disclosure**
   - Support level calculation is basic
   - Can be enhanced with ML-based difficulty prediction

