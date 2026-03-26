import { apiRequest } from "./apiClient";
import type { ApiEnvelope } from "../state/types";

export async function createRoleplaySession(payload: {
  scenario_id: string;
  level: string;
  display_preferences: Record<string, unknown> | null;
}): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: "/api/v1/roleplay/sessions",
    auth: true,
    body: payload,
  });
}

export async function submitRoleplayTurn(sessionId: string, payload: { user_message: string }): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: `/api/v1/roleplay/sessions/${sessionId}/turns`,
    auth: true,
    body: payload,
  });
}

export async function fetchRoleplaySession(sessionId: string): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "GET",
    path: `/api/v1/roleplay/sessions/${sessionId}`,
    auth: true,
  });
}

export async function fetchRoleplayTranscript(sessionId: string): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "GET",
    path: `/api/v1/roleplay/sessions/${sessionId}/transcript`,
    auth: true,
  });
}

export async function fetchRoleplayReview(sessionId: string): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "GET",
    path: `/api/v1/roleplay/sessions/${sessionId}/review`,
    auth: true,
  });
}
