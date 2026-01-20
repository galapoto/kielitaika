# RUKA - Finnish Language Learning Platform

> **Professional Finnish for Immigrants** - An AI-powered platform for learning Finnish with workplace-specific training and YKI exam preparation.

## 🎯 Status: v2.0 Ready (~85% Complete)

RUKA is an enterprise-ready Finnish language learning platform with:
- ✅ 11 workplace professions
- ✅ Full YKI exam simulation
- ✅ Advanced AI teaching engines
- ✅ B2B admin/teacher dashboards
- ✅ Subscription system

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file (see .env.example)
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run backend
uvicorn app.main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend
pnpm install

# Configure API URL in .env or app/utils/api.js
# EXPO_PUBLIC_API_BASE=http://localhost:5000

# Run frontend
pnpm start        # For mobile
pnpm web         # For web UI
# Or: pnpm expo start --web
```

### 3. Required External Services

**OpenAI API (REQUIRED):**
- Get key: https://platform.openai.com/api-keys
- Used for: STT, TTS, Conversation AI
- Add to `backend/.env`: `OPENAI_API_KEY=sk-...`

**Database (OPTIONAL for MVP):**
- PostgreSQL recommended for production
- SQLite fine for development

See [docs/SETUP.md](./docs/SETUP.md) for detailed instructions.

## 📋 Features

### Core Learning
- **Conversation Practice** - AI tutor with adaptive difficulty
- **Pronunciation Analysis** - Phoneme-level feedback
- **Grammar Correction** - Advanced error detection with Omorfi
- **Progressive Disclosure** - Adaptive text scaffolding

### Learning Paths
- **General Finnish** - A1 to B1 levels
- **Workplace Finnish** - 11 professions with roleplay scenarios
- **YKI Preparation** - Full exam simulation with evaluation

### B2B Features
- **Admin Dashboard** - Cohort analytics and reporting
- **Teacher Dashboard** - Student progress tracking
- **Report Export** - CSV/JSON exports

### Subscription Tiers
- **Free** - Limited access
- **General Premium** - Unlimited general Finnish
- **Professional Premium** - Full access + workplace + YKI

## 📁 Project Structure

```
puhis/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── core/     # Configuration
│   │   ├── routers/  # API endpoints
│   │   ├── services/ # Business logic
│   │   └── utils/    # Utilities
│   └── requirements.txt
│
├── frontend/         # React Native (Expo)
│   ├── app/
│   │   ├── screens/  # App screens
│   │   ├── components/
│   │   └── utils/    # API utilities
│   └── package.json
│
└── docs/             # Documentation
```

## 🔌 API Endpoints

**Voice:**
- `POST /voice/stt` - Transcribe audio
- `POST /voice/pronunciation/analyze-v2` - Advanced pronunciation
- `WebSocket /voice/stt/ws` - Streaming STT
- `WebSocket /voice/tts/ws` - Streaming TTS

**Conversation:**
- `POST /session/send` - Send message (v4 engine)

**Workplace:**
- `GET /workplace/fields` - List 11 professions
- `GET /workplace/lesson/{field}` - Get profession lesson
- `POST /workplace/dialogue` - Get roleplay scenario

**YKI:**
- `POST /yki/exam/generate` - Generate full exam
- `POST /yki/exam/submit` - Submit and evaluate

**Admin:**
- `GET /admin/cohorts/{id}/analytics` - Cohort analytics
- `GET /admin/cohorts/{id}/report?format=csv` - Export report

**Full API Docs:** `http://localhost:5000/docs` (when backend is running)

## 🛠️ Technology Stack

**Backend:**
- FastAPI
- OpenAI API (Whisper, TTS, GPT-4o-mini)
- WebSockets
- Pydantic

**Frontend:**
- React Native (Expo)
- React Navigation
- WebSocket client

## 📚 Documentation

All documentation is in the [`docs/`](./docs/) folder:

- **[docs/SETUP.md](./docs/SETUP.md)** - Detailed setup guide
- **[docs/EXTERNAL_SERVICES.md](./docs/EXTERNAL_SERVICES.md)** - External services needed
- **[docs/WHAT_IS_BUILT.md](./docs/WHAT_IS_BUILT.md)** - Complete feature list
- **[docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)** - Quick reference guide
- **[docs/v2.0_status.md](./docs/v2.0_status.md)** - Current v2.0 status
- **[docs/v2.0_progress.md](./docs/v2.0_progress.md)** - Progress tracking
- **API Docs:** `http://localhost:5000/docs` (when backend is running)

## 🎓 What's Been Built

### ✅ Completed (v2.0 Level)

1. **Advanced Engines**
   - Grammar Engine v3 (Omorfi hybrid)
   - Pronunciation Engine v2 (phoneme alignment)
   - Conversation Engine v4 (adaptive difficulty)
   - Progressive Disclosure Engine v3
   - Personalization Engine v2

2. **Learning Content**
   - 11 workplace professions
   - Full YKI exam simulation
   - Vocabulary learning system
   - Roleplay scenarios

3. **B2B Platform**
   - Admin dashboard with analytics
   - Teacher dashboard
   - Cohort management
   - Report export

4. **Infrastructure**
   - Subscription system
   - Feature enforcement
   - Progress tracking

### 🔄 Remaining (~15%)

- Production monitoring
- GDPR compliance tools
- Marketing pages
- Final polish

## 🚀 Deployment

### Backend (Fly.io)
```bash
fly launch --name=puhis-backend
fly secrets set OPENAI_API_KEY=sk-...
fly deploy
```

### Frontend (Expo EAS)
```bash
eas build:configure
eas build -p android --profile production
```

## 📝 License

[Your License Here]

## 🤝 Contributing

[Contributing Guidelines]

## 📧 vitus.idi@gmail.com

[Your Contact Info]

---

**Built with ❤️ for Finnish language learners**
