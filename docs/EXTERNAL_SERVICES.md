# External Services & Dependencies

This document lists all external services, APIs, and dependencies required for PUHIS to function.

## 🔑 Required Services

### 1. OpenAI API ⭐ REQUIRED

**Purpose:**
- Speech-to-Text (Whisper) - Transcribing user audio input
- Text-to-Speech - Generating Finnish audio responses
- Conversation AI (GPT-4o-mini) - Powering the AI tutor

**Setup:**
1. Sign up at https://platform.openai.com/
2. Navigate to API Keys: https://platform.openai.com/api-keys
3. Create a new secret key
4. Copy the key (format: `sk-...`)

**Configuration:**
Add to `backend/.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

**Cost Estimate:**
- Whisper STT: ~$0.006 per minute
- TTS: ~$0.015 per 1,000 characters
- GPT-4o-mini: ~$0.15 per 1M input tokens
- **Estimated per user session:** $0.05-0.15

**Usage in Code:**
- `backend/app/services/stt_service.py` - Whisper API
- `backend/app/services/tts_service.py` - TTS API
- `backend/app/services/conversation_engine.py` - GPT API
- `backend/app/services/conversation_engine_v4.py` - GPT API

**Fallback Behavior:**
- Without API key, services return stub responses
- App will function but with limited capabilities

---

## 🔧 Optional Services

### 2. Database (PostgreSQL/SQLite)

**Purpose:**
- User data storage
- Conversation history
- Progress tracking
- Subscription management

**Options:**

**PostgreSQL (Production):**
```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database
createdb puhis

# Add to .env
DATABASE_URL=postgresql://user:password@localhost:5432/puhis
```

**SQLite (Development):**
```bash
# No installation needed
# Add to .env
DATABASE_URL=sqlite:///./puhis.db
```

**Current Status:**
- Services use in-memory storage as placeholders
- Database integration is ready but not fully implemented
- Works without database for MVP testing

---

### 3. Omorfi (Finnish Morphological Analyzer)

**Purpose:**
- Advanced Finnish grammar analysis
- Morphological parsing
- Enhanced Grammar Engine v3 accuracy

**Installation:**

**Option 1: Python Library**
```bash
pip install omorfi
```

**Option 2: System Installation**
```bash
# See: https://github.com/flammie/omorfi
# Requires system-level installation
```

**Current Status:**
- Grammar Engine v3 works without Omorfi
- Falls back to rule-based analysis
- Omorfi enhances accuracy but is not required

**Usage:**
- `backend/app/services/grammar_engine_v3.py`
- `backend/app/utils/omorfi_wrapper.py`

---

## 📦 Python Dependencies

All dependencies are listed in `backend/requirements.txt`:

```
fastapi              # Web framework
uvicorn[standard]    # ASGI server
httpx                # HTTP client (for OpenAI API)
python-dotenv        # Environment variables
sqlalchemy           # Database ORM
pydantic             # Data validation
pydantic-settings    # Settings management
openai               # OpenAI SDK (optional, we use httpx directly)
python-multipart     # File uploads
```

**Install:**
```bash
cd backend
pip install -r requirements.txt
```

---

## 📱 Frontend Dependencies

All dependencies are in `frontend/package.json`:

**Key Dependencies:**
- `expo` - React Native framework
- `@react-navigation/native` - Navigation
- `react-native` - Core framework

**Install:**
```bash
cd frontend
pnpm install
```

---

## 🌐 Network Requirements

### Backend
- **Port:** 5000 (default, configurable)
- **Protocols:** HTTP, WebSocket
- **CORS:** Configured for frontend access

### Frontend
- **API Base URL:** Configurable via `EXPO_PUBLIC_API_BASE`
- **Default:** `http://localhost:5000`
- **For physical devices:** Use computer's IP address

---

## 🔐 Security Considerations

### API Keys
- **Never commit `.env` files** to version control
- Use `.env.example` as template
- For production, use environment variables or secret management

### OpenAI API
- Keys have usage limits and costs
- Monitor usage at: https://platform.openai.com/usage
- Set up billing alerts

### Database
- Use strong passwords in production
- Enable SSL for PostgreSQL in production
- Regular backups recommended

---

## 🧪 Testing Without External Services

### Development Mode
The app can run in "stub mode" without OpenAI API:
- Conversation returns placeholder responses
- STT/TTS return empty data
- Grammar analysis uses rule-based fallback

**To test without OpenAI:**
1. Don't set `OPENAI_API_KEY` in `.env`
2. Services will detect missing key and use stubs
3. App will function but with limited AI capabilities

---

## 📊 Service Status Check

### Verify OpenAI API
```bash
# Test from command line
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Verify Backend
```bash
# Health check
curl http://localhost:5000/docs
```

### Verify Frontend
```bash
# Check Expo server
npx expo start
```

---

## 🚀 Production Deployment

### Environment Variables for Production

**Backend (Fly.io example):**
```bash
fly secrets set OPENAI_API_KEY=sk-...
fly secrets set DATABASE_URL=postgresql://...
```

**Frontend (Expo EAS):**
```bash
# Set in EAS dashboard or eas.json
EXPO_PUBLIC_API_BASE=https://your-backend.fly.dev
```

---

## 📝 Summary

**Minimum Required:**
- ✅ OpenAI API key (for full functionality)
- ✅ Python 3.10+ and Node.js 18+ (for development)

**Recommended:**
- ✅ PostgreSQL database (for production)
- ✅ Omorfi (for enhanced grammar analysis)

**Optional:**
- Monitoring services (Sentry, DataDog)
- Analytics (Google Analytics, Mixpanel)
- Payment processing (Stripe, etc.)

---

## 🆘 Troubleshooting

**"OpenAI API key not found":**
- Check `.env` file exists in `backend/` directory
- Verify key format: `sk-...`
- Restart server after adding key

**"Connection refused":**
- Verify backend is running on correct port
- Check firewall settings
- For mobile device, use computer's IP not `localhost`

**"Module not found":**
- Run `pip install -r requirements.txt`
- Activate virtual environment
- Check Python version (3.10+)

---

For detailed setup instructions, see [SETUP.md](./SETUP.md) in this `docs/` folder.
