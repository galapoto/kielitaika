# Fix for npm install error

## Problem
React version mismatch: `react@18.2.0` but `react-dom@19.2.1` requires `react@19.2.1`

## Solution Applied
Updated `package.json` to use compatible versions for Expo 54:
- `react`: `19.1.0` (matches Expo 54)
- `react-dom`: `19.1.0` (matches react)
- `react-native`: `0.81.0` (matches Expo 54)

## Now Install

```bash
cd /home/vitus-idi/Documents/puhis/frontend
npm install
```

If you still get errors, try:
```bash
npm install --legacy-peer-deps
```

## Browser Extension Error

The "Unauthorized request from chrome-extension" error is harmless. You can:
1. **Ignore it** - it won't prevent the app from working
2. **Use incognito mode** - open browser in incognito/private mode
3. **Disable the extension** - temporarily disable browser extensions

The app will still work despite this error.


