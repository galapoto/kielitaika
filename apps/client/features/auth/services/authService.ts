import { apiClient } from "@core/api/apiClient";

export async function getAuthStatus() {
  return await apiClient("/api/v1/auth/status");
}
