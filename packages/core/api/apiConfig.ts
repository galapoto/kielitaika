import { env } from "@core/config/env";

export function getApiBaseUrl() {
  return env.API_URL;
}

export function getAudioBaseUrl() {
  return env.AUDIO_URL;
}
