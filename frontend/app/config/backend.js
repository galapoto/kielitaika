const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

if (!process.env.EXPO_PUBLIC_API_BASE) {
  console.warn(
    'EXPO_PUBLIC_API_BASE is not defined. Falling back to http://localhost:8000'
  );
}

export const HTTP_API_BASE = API_BASE;
export const WS_API_BASE = API_BASE.replace(/^http/, 'ws');
