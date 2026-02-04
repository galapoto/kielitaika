# Environment Variables Setup

## Quick Setup

1. **Create `.env` file** in the `backend/` directory:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Add your OpenAI API key** to `.env`:
   ```bash
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **That's it!** The backend will automatically load these variables.

## Required Variables

### `OPENAI_API_KEY` (REQUIRED)
- **What:** OpenAI API key for STT, TTS, and Conversation AI
- **Where to get:** https://platform.openai.com/api-keys
- **Format:** `sk-...`
- **Example:** `OPENAI_API_KEY=sk-proj-abc123...`

## Optional Variables

### `PORT` (OPTIONAL)
- **Default:** `8000` (must match frontend `config/backend.js` so TTS/STT work)
- **Example:** `PORT=8000`

### `DATABASE_URL` (OPTIONAL)
- **What:** Database connection string
- **PostgreSQL:** `postgresql://user:password@localhost:5432/puhis`
- **SQLite:** `sqlite:///./puhis.db`
- **Leave empty:** Uses in-memory storage (for testing)

## File Location

The `.env` file should be in:
```
backend/
└── .env          ← Create this file here
```

## Security Note

⚠️ **Never commit `.env` to version control!**
- The `.env` file is in `.gitignore`
- Use `.env.example` as a template
- Keep your API keys secret

## Verification

After creating `.env`, verify it's loaded:
```bash
cd backend
python -c "from app.core.config import get_settings; s = get_settings(); print('API Key set:', bool(s.openai_api_key))"
```

If it prints `API Key set: True`, you're good to go!
