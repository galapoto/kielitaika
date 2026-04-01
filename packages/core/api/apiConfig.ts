import { env } from "@core/config/env";

export function getApiBaseUrl() {
  return env.API_URL;
}
