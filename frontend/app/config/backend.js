import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ENV_API_BASE = process.env.EXPO_PUBLIC_API_BASE;

const inferDevHost = () => {
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest?.hostUri ||
    Constants?.manifest2?.extra?.expoClient?.hostUri;
  const debuggerHost =
    Constants?.manifest?.debuggerHost ||
    Constants?.expoConfig?.debuggerHost ||
    Constants?.debuggerHost;

  const uri = hostUri || debuggerHost;
  if (!uri || typeof uri !== 'string') return null;
  const host = uri.split(':')[0];
  return host || null;
};

const defaultHost = () => (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

// Backend default port must match backend run.sh / app.core.config (8000)
const DEFAULT_PORT = 8000;
const API_BASE = ENV_API_BASE || `http://${inferDevHost() || defaultHost()}:${DEFAULT_PORT}`;

if (!ENV_API_BASE) {
  console.warn(
    `EXPO_PUBLIC_API_BASE is not defined. Falling back to ${API_BASE}`
  );
}

export const HTTP_API_BASE = API_BASE;
export const WS_API_BASE = API_BASE.replace(/^http/, 'ws');
