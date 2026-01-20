# How to View PUHIS Web App

## Quick Start

The PUHIS app is built with React Native (Expo) and works on web, iOS, and Android.

### To View in Web Browser:

1. **Start the development server:**
   ```bash
   cd /home/vitus-idi/Documents/puhis/frontend
   npm run web
   # or
   npx expo start --web
   ```

2. **Open in browser:**
   - The terminal will show: `Web is waiting on http://localhost:8081` (or similar port)
   - Open your browser and go to: `http://localhost:8081`
   - Or press `w` in the Expo terminal to open automatically

3. **If you see "Unable to resolve ../../App":**
   - Make sure you're in the `frontend` directory
   - The entry point is `index.js` which imports `./app/App.js`
   - This should work automatically with Expo

### Alternative: Use the start script

```bash
cd /home/vitus-idi/Documents/puhis
./start_dev_terminal.sh
```

This will:
- Start the backend on port 8000
- Start the frontend on port 8082 (or next available)
- Open the web app automatically

## What You Should See

1. **Home Screen:**
   - "PUHIS" title with "Your Finnish Today" subtitle
   - Theme toggle (dark/light mode) in top right
   - Streak flame and XP badge
   - Menu items:
     - 🔋 Daily Recharge
     - 💬 Start Conversation
     - 🎤 Pronunciation Practice
     - 💼 Workplace Finnish
     - And more...

2. **Dark Mode:**
   - Click the theme toggle to switch between light and dark themes
   - All screens adapt automatically

3. **Navigation:**
   - Tap any menu item to navigate
   - Use browser back button or app navigation

## Troubleshooting

### Port Already in Use
If port 8081 is busy:
- Expo will ask to use 8082
- Or manually: `npx expo start --web --port 8082`

### Module Not Found Errors
```bash
cd frontend
npm install
```

### Backend Not Connected
- Make sure backend is running on port 8000
- Check `EXPO_PUBLIC_API_BASE` in `.env` or environment
- Default is `http://localhost:8000`

### Web Bundle Fails
- Clear cache: `npx expo start --web --clear`
- Or: `rm -rf node_modules/.cache`

## Features to Test

1. **Recharge Screen:**
   - Navigate to "Daily Recharge"
   - See vocabulary cards, grammar bite, mini challenge
   - Test the "Start Conversation" button

2. **Settings:**
   - Navigate to Settings
   - Toggle dark mode
   - Configure notifications
   - Change language (EN/FI)

3. **Progress:**
   - View progress metrics
   - See streak and XP

4. **Theme Switching:**
   - Toggle dark/light mode from any screen
   - All screens should adapt instantly

## Development Tips

- **Hot Reload:** Changes auto-reload in browser
- **React DevTools:** Install browser extension for debugging
- **Console:** Check browser console for errors
- **Network Tab:** Monitor API calls to backend

## Production Build

For production web build:
```bash
cd frontend
npx expo export:web
```

Output will be in `frontend/web-build/`


