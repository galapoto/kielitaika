const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || 'https://dev.kielitaika.fi';

if (!process.env.EXPO_PUBLIC_API_BASE) {
  console.warn(
    'EXPO_PUBLIC_API_BASE is not defined. Falling back to https://dev.kielitaika.fi'
  );
}

export const HTTP_API_BASE = API_BASE;
export const WS_API_BASE = API_BASE.replace(/^https/, 'wss');
