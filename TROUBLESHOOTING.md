# Troubleshooting Guide

## Frontend Not Starting / Port Issues

### Problem: "Port 8081 is running this app in another window"

**Solution:** The script now:
1. Aggressively kills ALL processes on ports 8081 and 8082
2. Kills all Expo/Metro/Node processes
3. Double-checks ports are free before starting

**If it still happens:**
```bash
# Manually kill all Expo processes
pkill -9 -f "expo"
pkill -9 -f "metro"
pkill -9 -f "@expo/cli"

# Kill processes on ports
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:8082 | xargs kill -9 2>/dev/null || true

# Then run the script again
./start_dev_terminal.sh
```

### Problem: "Input is required, but 'npx expo' is in non-interactive mode"

**Solution:** The script now sets:
- `CI=true` - Makes Expo non-interactive
- `EXPO_NO_DOTENV=1` - Prevents questions
- `EXPO_NO_TELEMETRY=1` - Disables telemetry prompts
- Uses `--yes` flag with npx to auto-accept prompts

### Problem: Frontend shows "ERR_CONNECTION_REFUSED"

**Check:**
1. Is the backend running? Check `backend.log` or look for `[BACKEND]` logs
2. Is the frontend actually starting? Look for `[FRONTEND]` logs
3. Are ports 8081/8082 free? Run: `lsof -i:8081 -i:8082`

**Solution:**
```bash
# Stop everything
pkill -9 -f "expo"
pkill -9 -f "uvicorn"

# Clear cache
cd frontend
rm -rf .expo node_modules/.cache

# Start again
cd ..
./start_dev_terminal.sh
```

## Backend Issues

### Problem: Backend won't start

**Check:**
1. Is virtual environment activated? Look for "✅ Virtual environment activated"
2. Are dependencies installed? The script installs them automatically
3. Is port 8000 in use? Script will use 8001 automatically

**Solution:**
```bash
cd backend
source venv/bin/activate  # or source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## General Issues

### Problem: Script exits immediately

**Check:** Look for error messages in the output. The script uses `set -e` which exits on any error.

**Solution:** Run with bash -x to see what's failing:
```bash
bash -x ./start_dev_terminal.sh
```

### Problem: Logs not appearing

**Check:**
1. Backend logs should appear with `[BACKEND]` prefix
2. Frontend logs should appear with `[FRONTEND]` prefix
3. Both should appear in the same terminal

**Solution:** If logs aren't appearing:
- Check if `stdbuf` is installed: `which stdbuf`
- Check if `tail` is working: `tail -f backend.log`

### Problem: Can't copy logs

**Solution:** All logs are in the terminal output and can be selected/copied normally. They're prefixed with `[BACKEND]` or `[FRONTEND]` for easy identification.


