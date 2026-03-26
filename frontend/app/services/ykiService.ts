import { apiRequest } from "./apiClient";
import type { ApiEnvelope } from "../state/types";

export async function startYkiSession(payload: { level_band: "A1_A2" | "B1_B2" | "C1_C2" }): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: "/api/v1/yki/sessions",
    auth: true,
    body: payload,
  });
}

export async function fetchYkiSession(sessionId: string): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "GET",
    path: `/api/v1/yki/sessions/${sessionId}`,
    auth: true,
  });
}

export async function submitYkiAnswer(sessionId: string, payload: { answer_id: string; answer: string | boolean | number }): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: `/api/v1/yki/sessions/${sessionId}/answers`,
    auth: true,
    body: payload,
  });
}

export async function submitYkiWriting(sessionId: string, payload: { task_id: string; text: string }): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: `/api/v1/yki/sessions/${sessionId}/writing`,
    auth: true,
    body: payload,
  });
}

export async function submitYkiAudio(sessionId: string, payload: { task_id: string; audio_ref: string }): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: `/api/v1/yki/sessions/${sessionId}/audio`,
    auth: true,
    body: payload,
  });
}

export async function startYkiConversation(sessionId: string, payload: { task_id: string }): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: `/api/v1/yki/sessions/${sessionId}/speaking/conversation`,
    auth: true,
    body: payload,
  });
}

export async function submitYkiConversationTurn(
  sessionId: string,
  payload: { task_id: string; turn_id: string; audio_ref: string; transcript_text: string | null },
): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: `/api/v1/yki/sessions/${sessionId}/speaking/turns`,
    auth: true,
    body: payload,
  });
}

export async function requestYkiReply(sessionId: string, payload: { task_id: string }): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: `/api/v1/yki/sessions/${sessionId}/speaking/reply`,
    auth: true,
    body: payload,
  });
}

export async function submitYkiExam(sessionId: string, payload: { confirm_incomplete: boolean }): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: `/api/v1/yki/sessions/${sessionId}/submit`,
    auth: true,
    body: payload,
  });
}

export async function fetchYkiCertificate(sessionId: string): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "GET",
    path: `/api/v1/yki/sessions/${sessionId}/certificate`,
    auth: true,
  });
}
