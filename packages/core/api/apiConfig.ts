import { Platform } from "react-native";

const LOCALHOST = "127.0.0.1";

export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "android") {
    return `http://${LOCALHOST}:8000`;
  }

  return `http://${LOCALHOST}:8000`;
}
