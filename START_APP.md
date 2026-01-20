# How to Start PUHIS App Yourself

## Prerequisites Check

First, make sure you have:
- Python 3.10+ installed
- Node.js 18+ and npm installed
- OpenAI API key (in `backend/.env`)

## Step 1: Start the Backend

### Terminal 1 - Backend Server

```bash
# Navigate to backend directory
cd /home/vitus-idi/Documents/puhis/backend

# Activate virtual environment (REQUIRED - already created)
source venv/bin/activate  # Linux/Mac
# On Windows: venv\Scripts\activate

# Dependencies are already installed, but if you need to reinstall:
# pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**What you should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify backend is running:**
- Open browser: http://localhost:8000
- Should see: `{"message":"PUHIS backend running"}`
- API docs: http://localhost:8000/docs

**Keep this terminal open!** The backend must stay running.

---

## Step 2: Start the Frontend

### Terminal 2 - Frontend Server

Open a **new terminal window** (keep backend running in Terminal 1):

```bash
# Navigate to frontend directory
cd /home/vitus-idi/Documents/puhis/frontend

# Install dependencies (REQUIRED - new dependencies were added)
npm install

# Start Expo development server
npx expo start --web
```

**What you should see:**
```
Starting Metro Bundler
Web is waiting on http://localhost:19006
```

**The app will automatically open in your browser!**

If it doesn't open automatically:
- Look for the URL in the terminal (usually `http://localhost:19006`)
- Copy and paste it into your browser

---

## Alternative: Start Frontend for Mobile

If you want to run on a phone or emulator instead of web:

```bash
cd /home/vitus-idi/Documents/puhis/frontend
npx expo start
```

Then:
- Press `w` - Open in web browser
- Press `a` - Open in Android emulator (if installed)
- Press `i` - Open in iOS simulator (if installed)
- Scan QR code - Open in Expo Go app on your phone

---

## Quick Reference

### Backend Commands
```bash
# Start backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Stop backend
Press CTRL+C in the backend terminal
```

### Frontend Commands
```bash
# Start frontend (web)
cd frontend
npx expo start --web

# Start frontend (all platforms)
cd frontend
npx expo start

# Stop frontend
Press CTRL+C in the frontend terminal
```

---

## Troubleshooting

### Backend won't start
- **Port 8000 already in use?**
  ```bash
  # Use a different port
  uvicorn app.main:app --reload --port 8001
  ```
  Then update `frontend/app/utils/api.js` to use port 8001

- **Module not found errors?**
  ```bash
  cd backend
  pip install -r requirements.txt
  ```

- **OpenAI API key missing?**
  Create `backend/.env`:
  ```bash
  OPENAI_API_KEY=sk-your-key-here
  ```

### Frontend won't start
- **Port 19006 already in use?**
  Expo will automatically use the next available port. Check the terminal for the actual URL.

- **Dependencies not installed?**
  ```bash
  cd frontend
  npm install
  ```

- **"Network request failed" in browser?**
  - Make sure backend is running on port 8000
  - Check `frontend/app/utils/api.js` has correct API_BASE URL
  - Verify backend is accessible: `curl http://localhost:8000/`

### Can't connect frontend to backend?
1. Check backend is running: `curl http://localhost:8000/`
2. Check frontend API URL in `frontend/app/utils/api.js`:
   ```javascript
   const API_BASE = 'http://localhost:8000';  // Should match backend port
   ```
3. If backend is on different port, update the API_BASE URL

---

## Summary

### Option 1: Use the Startup Script (Recommended) 🚀

**One command starts everything:**

```bash
./start_dev_terminal.sh
```

This script will:
- ✅ Kill any processes on ports 8000, 8081, 8082 (only PUHIS processes)
- ✅ Clear frontend cache
- ✅ Check/install dependencies
- ✅ Start backend in background
- ✅ Start frontend in foreground

**To stop:** Press `CTRL+C` in the terminal, then:
```bash
pkill -f 'uvicorn app.main:app' && pkill -f 'expo start'
```

### Option 2: Manual Startup (Two Terminals)

1. **Terminal 1 (Backend):**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

2. **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npx expo start --web --port 8081
   ```

Then open http://localhost:8081 (or the URL shown in Terminal 2) in your browser!

---

## Environment Variables

### Backend `.env` file
Create `backend/.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=sqlite:///./puhis.db  # Optional
PORT=8000  # Optional, defaults to 8000
```

### Frontend `.env` file (Optional)
Create `frontend/.env`:
```bash
EXPO_PUBLIC_API_BASE=http://localhost:8000
```

Or the API URL is already configured in `frontend/app/utils/api.js`.


