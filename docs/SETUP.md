# PUHIS Setup Guide

## 🚀 Quick Start

This guide will help you set up PUHIS to run locally and understand what external services are needed.

## 📋 Prerequisites

- Python 3.10+ (for backend)
- Node.js 18+ and npm (for frontend)
- OpenAI API key (required for STT, TTS, and conversation)
- PostgreSQL (optional, for production)

## 🔑 External Services Required

### 1. OpenAI API (REQUIRED)
**What it's used for:**
- Speech-to-Text (Whisper) - Transcribing user audio
- Text-to-Speech - Generating Finnish audio responses
- Conversation AI (GPT-4o-mini) - Powering the tutor conversations

**How to get it:**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys: https://platform.openai.com/api-keys
4. Create a new secret key
5. Copy the key (starts with `sk-...`)

**Cost estimate:**
- Whisper: ~$0.006 per minute
- TTS: ~$0.015 per 1000 characters
- GPT-4o-mini: ~$0.15 per 1M input tokens
- **Estimated cost per user session:** $0.05-0.15

**Add to `.env`:**
```bash
OPENAI_API_KEY=sk-your-key-here
```

### 2. Database (OPTIONAL for MVP, REQUIRED for production)
**What it's used for:**
- User data storage
- Conversation history
- Progress tracking
- Subscription management

**Options:**
- **PostgreSQL** (recommended for production)
- **SQLite** (fine for development/testing)

**Add to `.env`:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/puhis
# OR for SQLite:
DATABASE_URL=sqlite:///./puhis.db
```

### 3. Omorfi (OPTIONAL - for Grammar Engine v3)
**What it's used for:**
- Advanced morphological analysis
- Finnish grammar parsing

**Installation:**
```bash
# Option 1: Install Omorfi Python library
pip install omorfi

# Option 2: Install system-wide Omorfi
# See: https://github.com/flammie/omorfi
```

**Note:** Grammar Engine v3 works without Omorfi (falls back to rule-based), but Omorfi enhances accuracy.

## 📁 Project Structure

```
puhis/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── core/        # Configuration
│   │   ├── routers/      # API endpoints
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   ├── requirements.txt
│   └── .env             # Environment variables (create this)
│
├── frontend/             # React Native (Expo) app
│   ├── app/
│   │   ├── screens/     # App screens
│   │   ├── components/  # Reusable components
│   │   ├── utils/       # API utilities
│   │   └── context/     # React context
│   └── package.json
│
└── docs/                # Documentation
```

## 🔧 Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Create `.env` File

Create `backend/.env`:

```bash
# Required: OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Database (for production)
DATABASE_URL=postgresql://user:password@localhost:5432/puhis

# Optional: Server settings
HOST=0.0.0.0
PORT=5000
```

### Step 3: Run Backend

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

# Or production mode
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

Backend will be available at: `http://localhost:5000`
API docs at: `http://localhost:5000/docs`

## 📱 Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure API Base URL

Create `frontend/.env` or update `app/utils/api.js`:

```javascript
// In app/utils/api.js, update:
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:5000';
```

Or create `frontend/.env`:
```bash
EXPO_PUBLIC_API_BASE=http://localhost:5000
```

### Step 3: Run Frontend

```bash
# Start Expo development server
pnpm start
# Or: pnpm expo start

# Then:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Scan QR code with Expo Go app on your phone
```

## ✅ Verification

### Test Backend

1. **Health Check:**
   ```bash
   curl http://localhost:5000/docs
   ```

2. **Test STT (Speech-to-Text):**
   ```bash
   curl -X POST http://localhost:5000/voice/stt \
     -F "audio=@test_audio.webm"
   ```

3. **Test Conversation:**
   ```bash
   curl -X POST http://localhost:5000/session/send \
     -H "Content-Type: application/json" \
     -d '{"text": "Hei", "level": "A1", "path": "general"}'
   ```

### Test Frontend

1. Open the app in Expo
2. Navigate to "Start Conversation"
3. Try speaking or typing a message
4. Verify AI responds

## 🎯 What's Been Built

### ✅ Core Features (v1.0 - v2.0)

1. **Voice Pipeline**
   - ✅ Speech-to-Text (Whisper API)
   - ✅ Text-to-Speech (OpenAI TTS)
   - ✅ WebSocket streaming
   - ✅ HTTP fallback

2. **Teaching Engines**
   - ✅ Grammar Engine v3 (Omorfi hybrid)
   - ✅ Pronunciation Engine v2 (phoneme alignment)
   - ✅ Conversation Engine v4 (adaptive)
   - ✅ Progressive Disclosure Engine v3
   - ✅ Personalization Engine v2

3. **Learning Paths**
   - ✅ General Finnish (A1-B1)
   - ✅ Workplace Finnish (11 professions)
   - ✅ YKI Exam Preparation (full simulation)

4. **B2B Platform**
   - ✅ Admin Dashboard
   - ✅ Teacher Dashboard
   - ✅ Cohort Analytics
   - ✅ Report Export (CSV/JSON)

5. **Subscription System**
   - ✅ Three tiers (Free, General Premium, Professional Premium)
   - ✅ Feature enforcement
   - ✅ Trial support

### 📊 API Endpoints

**Voice:**
- `POST /voice/stt` - Transcribe audio
- `POST /voice/pronunciation/analyze` - Analyze pronunciation
- `POST /voice/pronunciation/analyze-v2` - Advanced pronunciation
- `WebSocket /voice/stt/ws` - Streaming STT
- `WebSocket /voice/tts/ws` - Streaming TTS

**Conversation:**
- `POST /session/send` - Send message (uses v4 engine)

**Workplace:**
- `GET /workplace/fields` - List professions
- `GET /workplace/lesson/{field}` - Get lesson
- `POST /workplace/dialogue` - Get roleplay scenario
- `POST /workplace/evaluate` - Evaluate roleplay

**YKI:**
- `POST /yki/exam/generate` - Generate exam
- `POST /yki/exam/submit` - Submit and evaluate

**Admin:**
- `GET /admin/cohorts` - List cohorts
- `GET /admin/cohorts/{id}/analytics` - Cohort analytics
- `GET /admin/cohorts/{id}/report` - Export report
- `GET /admin/users` - List users (optional `cohort_id`)
- `GET /admin/users/{id}/progress` - User progress

**Personalization:**
- `POST /personalization/learning-plan` - Generate plan
- `POST /personalization/track` - Track progress

## 🐛 Troubleshooting

### Backend Issues

**"Module not found" errors:**
```bash
# Make sure you're in the virtual environment
source venv/bin/activate
pip install -r requirements.txt
```

**"OpenAI API key not found":**
- Check `.env` file exists in `backend/` directory
- Verify key starts with `sk-`
- Restart the server after adding `.env`

**Port already in use:**
```bash
# Use a different port
uvicorn app.main:app --port 8001
```

### Frontend Issues

**"Network request failed":**
- Check backend is running
- Verify `EXPO_PUBLIC_API_BASE` matches backend URL
- For physical device, use your computer's IP: `http://192.168.1.X:5000`

**"Expo Go not connecting":**
- Make sure phone and computer are on same WiFi
- Try tunnel mode: `pnpm expo start --tunnel`

## 🚀 Production Deployment

### Backend (Fly.io recommended)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create app
fly launch --name=puhis-backend --region=ams

# Set secrets
fly secrets set OPENAI_API_KEY=sk-your-key
fly secrets set DATABASE_URL=postgresql://...

# Deploy
fly deploy
```

### Frontend Mobile (Expo EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build -p android --profile production
eas build -p ios --profile production
```

## 📚 Documentation

- **Architecture:** `docs/architecture.md`
- **v2.0 Status:** `docs/v2.0_status.md`
- **v2.0 Progress:** `docs/v2.0_progress.md`
- **API Docs:** `http://localhost:5000/docs` (when backend is running)

## 🆘 Need Help?

1. Check API documentation at `/docs` endpoint
2. Review service files in `backend/app/services/`
3. Check frontend API calls in `frontend/app/utils/api.js`

## 🎉 You're Ready!

Once you've:
1. ✅ Set up `.env` with OpenAI API key
2. ✅ Installed backend dependencies
3. ✅ Installed frontend dependencies
4. ✅ Started backend server
5. ✅ Started frontend with Expo

You can start using PUHIS! Try the conversation feature first to verify everything works.
