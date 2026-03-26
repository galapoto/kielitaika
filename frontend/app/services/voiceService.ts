import { apiRequest } from "./apiClient";
import type { ApiEnvelope } from "../state/types";

export async function uploadVoiceTranscription(payload: {
  blob: Blob;
  fileName: string;
  mimeType: string;
  durationMs: number | null;
  sessionId: string;
  speakingSessionId: string | null;
  turnId: string | null;
  taskId: string | null;
  mode: "yki_exam" | "roleplay" | "conversation" | "fluency" | "guided_turn" | "shadowing" | "micro_output";
  locale: string;
}): Promise<ApiEnvelope<any>> {
  const formData = new FormData();
  formData.append("file", payload.blob, payload.fileName);
  formData.append("mime_type", payload.mimeType);
  if (payload.durationMs !== null) {
    formData.append("duration_ms", String(payload.durationMs));
  }
  formData.append("session_id", payload.sessionId);
  formData.append("mode", payload.mode);
  formData.append("locale", payload.locale);
  if (payload.speakingSessionId) {
    formData.append("speaking_session_id", payload.speakingSessionId);
  }
  if (payload.turnId) {
    formData.append("turn_id", payload.turnId);
  }
  if (payload.taskId) {
    formData.append("task_id", payload.taskId);
  }
  return apiRequest<any>({
    method: "POST",
    path: "/api/v1/voice/stt/transcriptions",
    auth: true,
    formData,
  });
}

export async function requestTts(payload: {
  text: string;
  mode: "system" | "conversation" | "roleplay" | "yki";
  voice_preference: "male" | "female" | "neutral" | null;
  replayable: boolean;
  speed: number | null;
}): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: "/api/v1/voice/tts/requests",
    auth: true,
    body: payload,
  });
}

export async function analyzePronunciation(payload: {
  expected_text: string;
  transcript: string;
  audio_ref: string | null;
}): Promise<ApiEnvelope<any>> {
  return apiRequest<any>({
    method: "POST",
    path: "/api/v1/voice/pronunciation/analyze",
    auth: true,
    body: payload,
  });
}
