import { apiRequest } from "./apiClient";
import type { ApiEnvelope } from "../state/types";

export async function startCardsSession(payload: {
  domain: string;
  content_type: string | null;
  profession: string | null;
  level: string | null;
}): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: "/api/v1/cards/session/start",
    auth: true,
    body: payload,
  });
}

export async function startAdaptiveCardsSession(params: {
  domain: string;
  content_type?: string;
  profession?: string;
  level?: string;
  limit?: number;
}): Promise<ApiEnvelope<any>> {
  const query = new URLSearchParams();
  query.set("domain", params.domain);
  if (params.content_type) query.set("content_type", params.content_type);
  if (params.profession) query.set("profession", params.profession);
  if (params.level) query.set("level", params.level);
  if (params.limit) query.set("limit", String(params.limit));
  return apiRequest<any>({
    method: "GET",
    path: `/api/v1/cards/session/adaptive/start?${query.toString()}`,
    auth: true,
  });
}

export async function fetchNextCard(sessionId: string): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "GET",
    path: `/api/v1/cards/session/${sessionId}/next`,
    auth: true,
  });
}

export async function submitCardAnswer(sessionId: string, payload: { user_answer: string }): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: `/api/v1/cards/session/${sessionId}/answer`,
    auth: true,
    body: payload,
  });
}
