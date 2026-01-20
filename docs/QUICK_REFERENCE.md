# PUHIS Quick Reference Guide

## 🚀 Getting Started (5 Minutes)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# Run
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
pnpm install
pnpm start
# Or: pnpm expo start
```

### 3. Get OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Create new key
3. Add to `backend/.env`: `OPENAI_API_KEY=sk-...`

**That's it!** Backend runs on `http://localhost:5000`, frontend on Expo.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Main project overview |
| **SETUP.md** | Detailed setup instructions |
| **EXTERNAL_SERVICES.md** | External services needed |
| **WHAT_IS_BUILT.md** | Complete feature list |
| **QUICK_REFERENCE.md** | This file |
| **v2.0_status.md** | Current v2.0 status |

---

## 🔑 Required External Services

### OpenAI API (REQUIRED)
- **What:** Speech-to-Text, Text-to-Speech, Conversation AI
- **Where:** https://platform.openai.com/api-keys
- **Cost:** ~$0.05-0.15 per user session
- **Config:** Add to `backend/.env`: `OPENAI_API_KEY=sk-...`

### Database (OPTIONAL for MVP)
- **What:** User data, progress tracking
- **Options:** PostgreSQL (production) or SQLite (dev)
- **Config:** Add to `backend/.env`: `DATABASE_URL=...`

### Omorfi (OPTIONAL)
- **What:** Advanced Finnish grammar analysis
- **Status:** Works without it (falls back to rules)
- **Install:** `pip install omorfi`

---

## 📁 Key Files

### Backend Services
- `app/services/stt_service.py` - Speech-to-Text
- `app/services/tts_service.py` - Text-to-Speech
- `app/services/conversation_engine_v4.py` - AI tutor (v4)
- `app/services/grammar_engine_v3.py` - Grammar analysis (v3)
- `app/services/pronunciation_engine_v2.py` - Pronunciation (v2)
- `app/services/workplace_engine.py` - 11 professions
- `app/services/yki_exam_service.py` - YKI exam simulation
- `app/services/personalization_service.py` - Learning plans
- `app/services/professional_reporting_service.py` - B2B analytics

### Frontend Screens
- `screens/HomeScreen.js` - Main menu
- `screens/ConversationScreen.js` - AI conversation
- `screens/WorkplaceScreen.js` - Profession selection
- `screens/YKIScreen.js` - YKI exam
- `screens/AdminDashboardScreen.js` - Admin dashboard
- `screens/TeacherDashboardScreen.js` - Teacher dashboard

---

## 🔌 Key API Endpoints

### Voice
- `POST /voice/stt` - Transcribe audio
- `POST /voice/pronunciation/analyze-v2` - Advanced pronunciation
- `WebSocket /voice/stt/ws` - Streaming STT
- `WebSocket /voice/tts/ws` - Streaming TTS

### Conversation
- `POST /session/send` - Send message (uses v4 engine)

### Workplace
- `GET /workplace/fields` - List 11 professions
- `GET /workplace/lesson/{field}` - Get profession lesson
- `POST /workplace/dialogue` - Get roleplay scenario

### YKI
- `POST /yki/exam/generate` - Generate exam
- `POST /yki/exam/submit` - Submit and evaluate

### Admin
- `GET /admin/cohorts` - List cohorts
- `GET /admin/cohorts/{id}/analytics` - Cohort analytics
- `GET /admin/cohorts/{id}/report?format=csv` - Export report
- `GET /admin/users` - List users (optional `cohort_id`)
- `GET /admin/users/{id}/progress` - User progress

**Full API Docs:** `http://localhost:5000/docs`

---

## ✅ What's Built

### ✅ Complete Features
- 11 workplace professions
- Full YKI exam simulation
- Grammar Engine v3 (Omorfi hybrid)
- Pronunciation Engine v2 (phoneme alignment)
- Conversation Engine v4 (adaptive)
- B2B admin/teacher dashboards
- Subscription system (3 tiers)
- Personalization Engine v2

### 🔄 Remaining (~15%)
- Production monitoring
- GDPR tools
- Marketing pages

**Status:** ~85% complete toward v2.0

---

## 🐛 Common Issues

### Backend won't start
- Check `.env` file exists in `backend/`
- Verify `OPENAI_API_KEY` is set
- Run `pip install -r requirements.txt`

### Frontend can't connect
- Verify backend is running on port 5000
- Check `EXPO_PUBLIC_API_BASE` in frontend
- For physical device, use computer's IP not `localhost`

### "Module not found"
- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

---

## 📊 Project Status

**Current:** v2.0 Ready (~85% complete)
- ✅ All major features implemented
- ✅ Enterprise-ready for B2B
- 🔄 Production infrastructure remaining

**See:** `docs/v2.0_status.md` for details

---

## 🆘 Need Help?

1. **Setup Issues:** See [SETUP.md](./SETUP.md) (this folder)
2. **External Services:** See [EXTERNAL_SERVICES.md](./EXTERNAL_SERVICES.md) (this folder)
3. **What's Built:** See [WHAT_IS_BUILT.md](./WHAT_IS_BUILT.md) (this folder)
4. **API Docs:** `http://localhost:5000/docs`

---

## 🎯 Next Steps

1. **Get OpenAI API key** (required)
2. **Set up `.env` file** in backend
3. **Run backend:** `uvicorn app.main:app --reload`
4. **Run frontend:** `pnpm start` (or `pnpm web` for web UI)
5. **Test conversation** feature first

**You're ready to go!** 🚀
