import { apiRequest, toPersistedAuthSession } from "./apiClient";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "./storage";
import type { ApiEnvelope, PersistedAuthSession } from "../state/types";

type AuthSuccess = {
  auth_user: PersistedAuthSession["auth_user"];
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    access_expires_at: string;
    refresh_expires_at: string;
    auth_session_id: string;
  };
};

export async function registerWithPassword(payload: { email: string; password: string; name: string }): Promise<ApiEnvelope<AuthSuccess>> {
  const response = await apiRequest<AuthSuccess>({
    method: "POST",
    path: "/api/v1/auth/register/password",
    body: payload,
    auth: false,
  });
  if (response.ok) {
    saveAuthSession(toPersistedAuthSession(loadAuthSession(), response.data));
  }
  return response;
}

export async function loginWithPassword(payload: { email: string; password: string }): Promise<ApiEnvelope<AuthSuccess>> {
  const response = await apiRequest<AuthSuccess>({
    method: "POST",
    path: "/api/v1/auth/login/password",
    body: payload,
    auth: false,
  });
  if (response.ok) {
    saveAuthSession(toPersistedAuthSession(loadAuthSession(), response.data));
  }
  return response;
}

export async function restoreSession(): Promise<ApiEnvelope<{ auth_user: PersistedAuthSession["auth_user"]; auth_session_id: string; available_auth_methods: Array<Record<string, unknown>> }>> {
  return apiRequest({
    method: "GET",
    path: "/api/v1/auth/session",
    auth: true,
  });
}

export function logout(): void {
  clearAuthSession();
}
