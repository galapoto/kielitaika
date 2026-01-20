### expo-av integration

This project now references `expo-av` for native audio recording/playback.

Install it with npm or pnpm from `frontend/` (use Expo’s install helper to keep versions aligned):

```bash
# npm
npm install expo-av

# pnpm
pnpm add expo-av

# if using Expo CLI, this also ensures native versions match your SDK
expo install expo-av
```

Ensure your Expo SDK version matches the `expo-av` release you install (e.g., Expo SDK 51+ pairs with expo-av 14.x). If you’re on a different SDK, adjust the version accordingly.
