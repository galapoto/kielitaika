#!/bin/bash
# PUHIS Development Startup Script
# Kills processes on ports 8081 and 8082 (frontend ports - aggressive cleanup)
# Frontend always uses port 8082 (permanent)
# Backend uses port 8000 (or 8001 if 8000 is in use by other apps)
# Clears cache, starts both backend and frontend

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting PUHIS Development Environment${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Function to kill process on port (aggressive for frontend ports)
kill_port() {
    local port=$1
    local aggressive=$2  # If set to "aggressive", kill all processes on that port
    
    # Try lsof first (Linux/Mac)
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    
    # If lsof not available, try fuser (Linux)
    if [ -z "$pids" ]; then
        pids=$(fuser $port/tcp 2>/dev/null | awk '{print $1}' || true)
    fi
    
    # If still no pids, try ss (Linux)
    if [ -z "$pids" ]; then
        pids=$(ss -lptn "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' || true)
    fi
    
    if [ ! -z "$pids" ]; then
        for pid in $pids; do
            # Get full command line to check for expo/node processes
            local cmd=$(ps -p $pid -o comm= 2>/dev/null || true)
            local cmdline=$(ps -p $pid -o cmd= 2>/dev/null || true)
            
            # For aggressive mode (frontend ports), kill all processes
            if [ "$aggressive" = "aggressive" ]; then
                echo -e "${YELLOW}⚠️  Killing process on port $port (PID: $pid)${NC}"
                kill -9 $pid 2>/dev/null || true
            # For backend ports, only kill PUHIS-related processes
            elif [[ "$cmd" == *"uvicorn"* ]] || [[ "$cmd" == *"expo"* ]] || [[ "$cmd" == *"node"* ]] || \
                 [[ "$cmdline" == *"expo"* ]] || [[ "$cmdline" == *"node"* ]] || \
                 [[ "$cmdline" == *"metro"* ]] || [[ "$cmdline" == *"react-native"* ]]; then
                echo -e "${YELLOW}⚠️  Killing PUHIS process on port $port (PID: $pid, CMD: $cmd)${NC}"
                kill -9 $pid 2>/dev/null || true
            else
                echo -e "${YELLOW}⚠️  Port $port is in use by non-PUHIS process (PID: $pid, CMD: $cmd) - skipping${NC}"
            fi
        done
        sleep 1
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
    fi
}

# Kill processes on ports (aggressive for frontend ports - backend port 8000 is used by other apps)
echo -e "${YELLOW}Cleaning up frontend ports...${NC}"
kill_port 8081 aggressive  # Frontend Metro bundler - kill all processes
kill_port 8082 aggressive  # Frontend port - kill all processes

# Also kill any expo/metro/node processes that might be running (kill process tree)
echo -e "${YELLOW}Killing any remaining Expo/Metro/Node processes...${NC}"
pkill -9 -f "expo start" 2>/dev/null || true
pkill -9 -f "expo.*start" 2>/dev/null || true
pkill -9 -f "metro" 2>/dev/null || true
pkill -9 -f "@expo/cli" 2>/dev/null || true
# Kill any node processes in the frontend directory
pkill -9 -f "node.*puhis.*frontend" 2>/dev/null || true
sleep 2  # Give processes time to die

# Double-check ports are free
kill_port 8081 aggressive
kill_port 8082 aggressive

echo -e "${GREEN}✅ Skipping port 8000 (used by other apps)${NC}"
echo ""

# Clear frontend cache
echo -e "${YELLOW}Clearing frontend cache...${NC}"
cd "$FRONTEND_DIR"
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf .expo-shared 2>/dev/null || true
echo -e "${GREEN}✅ Cache cleared${NC}"
echo ""

# Check if virtual environment exists (try both venv and .venv)
VENV_PATH=""
if [ -d "$BACKEND_DIR/.venv" ]; then
    VENV_PATH="$BACKEND_DIR/.venv"
    echo -e "${GREEN}✅ Found .venv${NC}"
elif [ -d "$BACKEND_DIR/venv" ]; then
    VENV_PATH="$BACKEND_DIR/venv"
    echo -e "${GREEN}✅ Found venv${NC}"
else
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating .venv...${NC}"
    cd "$BACKEND_DIR"
    python3 -m venv .venv
    VENV_PATH="$BACKEND_DIR/.venv"
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Start backend in background
echo -e "${GREEN}📦 Starting Backend...${NC}"
cd "$BACKEND_DIR"
source "$VENV_PATH/bin/activate"
echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Installing backend dependencies...${NC}"
    pip install -q -r requirements.txt
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
fi

# Check if port 8000 is available
if lsof -ti:8000 >/dev/null 2>&1 || fuser 8000/tcp >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use by another app${NC}"
    echo -e "${YELLOW}   Using port 8001 for backend instead${NC}"
    BACKEND_PORT=8001
else
    BACKEND_PORT=8000
fi

# Start backend (use project-specific log file to avoid conflicts)
LOG_FILE="$SCRIPT_DIR/backend.log"
# Ensure venv is activated (in case we're in a subshell)
cd "$BACKEND_DIR"
source "$VENV_PATH/bin/activate"
uvicorn app.main:app --reload --host 0.0.0.0 --port $BACKEND_PORT > "$LOG_FILE" 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID) on http://localhost:$BACKEND_PORT${NC}"
if [ "$BACKEND_PORT" != "8000" ]; then
    echo -e "${YELLOW}   ⚠️  Note: Backend using port $BACKEND_PORT. Update frontend/app/utils/api.js if needed${NC}"
fi
echo ""

# Wait a moment for backend to start and create log file
sleep 2

# Start tailing backend logs in background with prefix (unbuffered for real-time output)
# Use stdbuf if available for unbuffered output, otherwise use regular tail
if command -v stdbuf >/dev/null 2>&1; then
    tail -f -n +0 "$LOG_FILE" 2>/dev/null | stdbuf -oL -eL sed 's/^/[BACKEND] /' &
else
    tail -f -n +0 "$LOG_FILE" 2>/dev/null | sed 's/^/[BACKEND] /' &
fi
TAIL_PID=$!

# Start frontend
echo -e "${GREEN}📱 Starting Frontend...${NC}"
cd "$FRONTEND_DIR"

# Check if node_modules exists and if key dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/react-native-reanimated" ] || [ ! -d "node_modules/zustand" ] || [ ! -d "node_modules/expo-notifications" ]; then
    echo -e "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
    cd "$FRONTEND_DIR"
    npm install --legacy-peer-deps
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

# Start frontend
echo -e "${GREEN}✅ Starting Expo...${NC}"
echo ""
echo -e "${YELLOW}📝 Backend running on port: $BACKEND_PORT${NC}"
echo -e "${YELLOW}📝 To stop both servers: Press CTRL+C${NC}"
echo ""
echo -e "${GREEN}🎉 Development servers starting!${NC}"
echo -e "${GREEN}📋 Logs from both backend and frontend will appear below:${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $TAIL_PID 2>/dev/null || true
    pkill -f 'expo start' 2>/dev/null || true
    pkill -f 'tail -f' 2>/dev/null || true
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Trap CTRL+C
trap cleanup INT TERM

# Double-check dependencies are installed before starting Expo
cd "$FRONTEND_DIR"
if [ ! -d "node_modules/react-native-reanimated" ]; then
    echo -e "${YELLOW}⚠️  react-native-reanimated missing, installing...${NC}"
    npm install react-native-reanimated --legacy-peer-deps
fi

# Start Expo with prefix for logs (unbuffered for real-time output)
# This runs in foreground, so logs appear immediately
# Always use port 8082 (permanent) - set environment variables to prevent interactive prompts
export CI=true  # Make Expo non-interactive
export EXPO_NO_DOTENV=1  # Prevent Expo from asking questions
export EXPO_NO_TELEMETRY=1  # Disable telemetry prompts

# Force port 8082 - use --yes to auto-accept any prompts
# Use stdbuf if available for unbuffered output, otherwise use regular pipe
if command -v stdbuf >/dev/null 2>&1; then
    stdbuf -oL -eL npx --yes expo start --web --port 8082 2>&1 | stdbuf -oL -eL sed 's/^/[FRONTEND] /'
else
    npx --yes expo start --web --port 8082 2>&1 | sed 's/^/[FRONTEND] /'
fi


