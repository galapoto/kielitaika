export const env = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || "",
  AUDIO_URL: process.env.EXPO_PUBLIC_AUDIO_URL || process.env.EXPO_PUBLIC_API_URL || "",
  AUTO_MOCK_AUTH_ENABLED: process.env.EXPO_PUBLIC_AUTO_MOCK_AUTH === "true",
  MOCK_AUTH_FALLBACK_ENABLED: process.env.EXPO_PUBLIC_ENABLE_MOCK_AUTH !== "false",
  YKI_VALIDATION_MODE:
    process.env.EXPO_PUBLIC_YKI_VALIDATION_MODE === "true" ||
    process.env.YKI_VALIDATION_MODE === "true",
};
