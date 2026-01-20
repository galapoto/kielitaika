# Quick Start Guide

## 🚀 Fastest Way to Start

**Just run one command:**

```bash
./start_dev_terminal.sh
```

This will:
- Kill **all** processes on ports 8081 and 8082 (aggressive cleanup for frontend)
- **Skip port 8000** (used by other apps - backend will use 8001 if 8000 is busy)
- Clear frontend cache
- Start backend (port 8000 or 8001)
- Start frontend on **port 8082** (permanent)
- Open browser automatically

**Access the app:** http://localhost:8082

**Note:** If backend uses port 8001, update `frontend/app/utils/api.js`:
```javascript
const API_BASE = 'http://localhost:8001';  // Change from 8000 to 8001
```

---

## What the Script Does

1. **Port Cleanup**: Kills only PUHIS-related processes (uvicorn, expo, node) on ports 8000, 8081, 8082
2. **Cache Clear**: Removes `.expo`, `.expo-shared`, and `node_modules/.cache`
3. **Backend**: Starts in background, logs to `backend.log`
4. **Frontend**: Starts in foreground (you'll see Expo output)

---

## Stop the Servers

**Option 1:** Press `CTRL+C` in the terminal running the script

**Option 2:** Run:
```bash
pkill -f 'uvicorn app.main:app' && pkill -f 'expo start'
```

---

## View Backend Logs

```bash
tail -f backend.log
```

---

## Troubleshooting

### Port Already in Use
The script automatically kills PUHIS processes on frontend ports (8081, 8082).
**Port 8000 is NOT touched** - it's used by other apps.

If backend can't start because 8000 is busy, it will automatically use port 8001.
Make sure to update `frontend/app/utils/api.js` if backend uses 8001:
```javascript
const API_BASE = 'http://localhost:8001';  // Update if backend uses 8001
```

### Frontend Won't Start
```bash
cd frontend
rm -rf node_modules .expo
npm install --legacy-peer-deps
```

### Backend Won't Start
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### App.js Not Found Error
This is fixed! The script creates `frontend/index.js` that properly imports `app/App.js`.

---

## Manual Startup (Alternative)

If you prefer to start manually, see `START_APP.md` for detailed instructions.


