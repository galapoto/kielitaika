const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

if (!API_BASE) {
  throw new Error(
    'EXPO_PUBLIC_API_BASE is not defined. Set it to https://dev.kielitaika.fi'
  );
}

export const HTTP_API_BASE = API_BASE;
export const WS_API_BASE = API_BASE.replace(/^https/, 'wss');
