# Agent 2 — Expo Runtime, Cache & Bundle Resolution Forensics

## Runtime Evidence
- Temporary runtime fingerprints must exist in:
  - `frontend/app/App.js`
  - `frontend/app/screens/auth/LoginScreen.js`
- Required example (documented):
  ```js
  console.log("RUNTIME BUILD ID:", __filename, Date.now());
  ```
- Evidence of correct bundle:
  - Both logs appear on web and Android after a reload.
  - The `__filename` values correspond to the files in this repo (not another path).
- Evidence of stale or wrong bundle:
  - One or both logs do not appear after reload.
  - Logs show a different file path or do not update when you change the code.

## Expo Root Verification
- Commands to document and run from the terminal where Expo is started:
  ```bash
  pwd
  ls
  npx expo diagnostics
  ```
- Required answer:
  - State whether Expo was launched from `frontend/`, repo root, or somewhere else.
  - If not `frontend/`, this explains old UI loading because the wrong project root is bundled.

## Cache & Bundle Provenance
- Cache layers that can cause this exact symptom:
  - `.expo/` project cache: can keep an old manifest/bundle reference.
  - Metro cache (`node_modules/.cache`): can reuse old transform results.
  - Android app cache (Expo Go app data): can keep stale JS bundle until app data is cleared.
  - Web cache (service worker or hard reload): browser may keep an old bundle.
- Why this matches the symptom:
  - Old UI + “Welcome to RUKA” persists despite code changes means the running bundle is not rebuilt or not fetched.

## Asset Resolution Trace
- Login background source is controlled by:
  - `frontend/app/screens/auth/LoginScreen.js` -> `SceneBackground` with `sceneKey="forest"`.
  - `frontend/app/components/SceneBackground.js` maps `forest` to `frontend/app/assets/backgrounds/metsä_talvi.png`.
- Required trace commands:
  ```bash
  rg "ImageBackground" frontend/app/screens/auth/LoginScreen.js
  rg "background" frontend/app/screens/auth/LoginScreen.js
  rg "metsä" frontend
  ```
- Verify whether `metsä_talvi.png` exists in multiple locations and which one is actually resolved.

## Findings
- If runtime fingerprints do not appear, Expo is not serving the JS bundle from this repo or is serving a cached bundle.
- If `metsä_talvi.png` resolves from a different location than `frontend/app/assets/backgrounds/`, asset resolution is coming from a different project root or cache.

## Root Cause
- Stale bundle or wrong project root is being served by Expo/Metro, proven by missing or non-updating runtime fingerprints.
- Device cache or web cache can preserve the old UI even when the filesystem has newer code.

## Fix Proposal (Conceptual, Order-Safe)
1. Stop Expo.
2. Clear project cache: delete `.expo/` and `node_modules/.cache`.
3. Clear device cache: remove Expo Go app data (Android settings) or reinstall Expo Go.
4. Clear web cache: hard reload or clear site data for the dev server origin.
5. Start Expo from the correct directory (`frontend/`) with a cold cache and verbose output.
6. Confirm runtime fingerprints and login background source logs update on both web and Android.

Commands (documented, not executed here):
```bash
cd /home/vitus-idi/Documents/puhis/frontend
rm -rf .expo
rm -rf node_modules/.cache
watchman watch-del-all || true
npx expo start -c --clear --dev-client --verbose
```

## Fix Prompt
“You are fixing a runtime resolution error where Expo is loading outdated UI/assets.
Do not touch Git history or branding.
Add runtime fingerprints in `frontend/app/App.js` and `frontend/app/screens/auth/LoginScreen.js`.
Verify Expo is started from `frontend/` using `pwd`, `ls`, and `npx expo diagnostics`.
Clear `.expo/`, Metro cache, Android app data, and browser cache, then restart Expo with `--clear --verbose`.
Confirm runtime fingerprints and `LOGIN BG SOURCE` logs update on web and Android.”
