// Utility to access Skia safely without crashing when the native module
// is not installed. Falls back to `null` so callers can render a safe
// placeholder instead of failing at import time.
let cachedSkia;
let attempted = false;

export function getSkia() {
  if (attempted) return cachedSkia;
  attempted = true;
  try {
    // Disable Skia on web to avoid CanvasKit errors when not bundled
    const { Platform } = require('react-native');
    if (Platform?.OS === 'web') {
      cachedSkia = null;
      console.warn('[Skia] Disabled on web to avoid CanvasKit load issues. Using fallbacks.');
      return cachedSkia;
    }

    cachedSkia = require('@shopify/react-native-skia');
  } catch (error) {
    console.warn(
      '[Skia] @shopify/react-native-skia not available. Rendered a static fallback instead.',
      error?.message || error
    );
    cachedSkia = null;
  }
  return cachedSkia;
}

export function hasSkia() {
  return !!getSkia();
}
