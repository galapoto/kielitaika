# How to View the Web UI

PUHIS supports web! Here's how to view it in your browser.

## 🚀 Quick Start

### Step 1: Make sure backend is running

Your backend should be running on port 5000:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

You should see: `{"message":"PUHIS backend running"}` when you visit `http://localhost:5000`

### Step 2: Start the frontend

```bash
cd frontend
pnpm install  # If you haven't already
pnpm expo start
```

### Step 3: Open Web UI

When Expo starts, you'll see a menu. **Press `w`** to open in web browser.

Or you can directly run:
```bash
npx expo start --web
```

The web UI will open automatically at: `http://localhost:8081` (or similar)

## 🌐 Accessing the Web UI

### Option 1: Via Expo CLI (Recommended)
```bash
cd frontend
pnpm expo start --web
```

This will:
- Start the Expo development server
- Open your browser automatically
- Show the web version of the app

### Option 2: Manual Browser Access
1. Start Expo: `npx expo start`
2. Press `w` when the menu appears
3. Or manually visit the URL shown in the terminal (usually `http://localhost:8081`)

## 🔧 Configuration

### API Base URL

Make sure your frontend is configured to connect to the backend on port 5000.

**Option 1: Environment Variable**
Create `frontend/.env`:
```bash
EXPO_PUBLIC_API_BASE=http://localhost:5000
```

**Option 2: Already configured**
The default in `frontend/app/utils/api.js` is already set to `http://localhost:5000`

## 📱 What You'll See

The web UI includes:
- ✅ Home screen with navigation
- ✅ Conversation screen (AI tutor)
- ✅ Pronunciation practice
- ✅ Workplace Finnish (11 professions)
- ✅ YKI exam practice
- ✅ Vocabulary learning
- ✅ Admin dashboard
- ✅ Teacher dashboard

## 🐛 Troubleshooting

### "Network request failed"
- Make sure backend is running on port 5000
- Check `EXPO_PUBLIC_API_BASE` matches your backend URL
- For web, use `http://localhost:5000` (not your IP address)

### "Expo web not starting"
```bash
# Install web dependencies (REQUIRED for web support)
cd frontend
pnpm add react-dom react-native-web @expo/metro-runtime
# Or use expo install to get compatible versions:
pnpm expo install react-dom react-native-web
```

### "Port 8081 already in use"
```bash
# Use a different port
pnpm expo start --web --port 8082
```

### WebSocket issues
- WebSockets work in web browsers
- Make sure backend CORS is configured (it should be)
- Check browser console for WebSocket connection errors

## 🎯 Quick Commands

```bash
# Start backend
cd backend
uvicorn app.main:app --reload --port 5000

# In another terminal, start frontend web
cd frontend
pnpm web
# Or: pnpm expo start --web
```

## 📝 Notes

- The web version uses the same React Native code
- Some mobile-specific features may have web fallbacks
- Audio recording works in modern browsers (Chrome, Firefox, Edge)
- WebSocket streaming works for STT/TTS

---

**Your web UI will be available at the URL shown when you run `pnpm web` or `pnpm expo start --web`**
