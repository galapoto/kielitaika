export const env = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000",
  AUTO_MOCK_AUTH_ENABLED: process.env.EXPO_PUBLIC_AUTO_MOCK_AUTH === "true",
  MOCK_AUTH_FALLBACK_ENABLED: process.env.EXPO_PUBLIC_ENABLE_MOCK_AUTH !== "false",
};
