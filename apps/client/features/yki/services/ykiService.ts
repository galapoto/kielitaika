import { apiClient } from "@core/api/apiClient";
import { storageService } from "@core/services/storageService";

const YKI_SESSION_STORAGE_KEY = "yki_session_id";

type ApiError = {
  message: string;
};

type ApiResponse<T> = {
  ok: boolean;
  data: T | null;
  error: ApiError | null;
};

export type YkiTask = {
  id: string;
  type: string;
  status: string;
  audio?: string | null;
  answer?: string | null;
  playbackCount?: number;
  playbackLimit?: number;
  maxDurationSeconds?: number;
  evaluation?: YkiTaskEvaluation | null;
};

export type YkiSectionProgress = {
  tasks: YkiTask[];
  currentTaskIndex: number;
  startedAt: string | null;
  expiresAt: string | null;
};

export type YkiTaskCriterion = {
  name: string;
  score: number | null;
};

export type YkiTaskEvaluation = {
  score: number | null;
  maxScore: number;
  criteria: YkiTaskCriterion[];
  feedback: string | null;
  evaluation_mode?: string | null;
};

export type YkiCertificate = {
  overall_score: number;
  level: string;
  passed: boolean;
  section_scores: Record<string, number>;
  evaluation_mode: string | null;
};

export type YkiLearningFeedback = {
  weak_areas: string[];
  suggestions: string[];
};

export type YkiSessionSummary = {
  session_id: string;
  date: string;
  overall_score: number;
  level: string;
  section_scores: Record<string, number>;
  weak_areas: string[];
  passed: boolean;
};

export type YkiProgressHistory = {
  sessions: YkiSessionSummary[];
  progression: number[];
  current_level: string | null;
  trend: string;
  weak_patterns: string[];
  strong_patterns: string[];
};

export type YkiRuntime = {
  navigationLocked: boolean;
  sectionLocking: boolean;
  warningThresholdSeconds: number;
  listening: {
    playbackLimit: number;
  };
  writing: {
    minimumWords: number;
    recommendedMaxWords: number;
  };
  speaking: {
    maxRecordingSeconds: number;
  };
};

export type YkiResumeData = {
  sessionId: string;
  currentSection: string | null;
  currentTaskId: string | null;
  sectionProgress: Record<string, YkiSectionProgress>;
  timing: {
    startedAt: string;
    expiresAt: string;
  };
  certificate?: YkiCertificate | null;
  learning_feedback?: YkiLearningFeedback | null;
  runtime?: YkiRuntime | null;
  progressHistory?: YkiProgressHistory | null;
};

export async function getStoredSessionId() {
  return storageService.get(YKI_SESSION_STORAGE_KEY);
}

export async function clearSession() {
  await storageService.remove(YKI_SESSION_STORAGE_KEY);
}

export async function startSession() {
  const res = (await apiClient("/api/v1/yki/start", {
    method: "POST",
  })) as ApiResponse<{ sessionId: string }>;

  if (res.ok && res.data?.sessionId) {
    await storageService.set(YKI_SESSION_STORAGE_KEY, res.data.sessionId);
  }

  return res;
}

export async function advanceSession() {
  const sessionId = await getStoredSessionId();

  if (!sessionId) {
    return {
      ok: false,
      data: null,
      error: { message: "SESSION_NOT_FOUND" },
    } satisfies ApiResponse<null>;
  }

  return (await apiClient(`/api/v1/yki/${sessionId}/next`, {
    method: "POST",
  })) as ApiResponse<unknown>;
}

export async function resumeSession() {
  const sessionId = await getStoredSessionId();

  if (!sessionId) {
    return null;
  }

  return (await apiClient(
    `/api/v1/yki/resume/${sessionId}`,
  )) as ApiResponse<YkiResumeData>;
}

export async function getCertificate(sessionId?: string) {
  const resolvedSessionId = sessionId ?? (await getStoredSessionId());

  if (!resolvedSessionId) {
    return {
      ok: false,
      data: null,
      error: { message: "SESSION_NOT_FOUND" },
    } satisfies ApiResponse<null>;
  }

  return (await apiClient(
    `/api/v1/yki/${resolvedSessionId}/certificate`,
  )) as ApiResponse<YkiCertificate>;
}

export async function submitAudio(audioRef: string) {
  const sessionId = await getStoredSessionId();

  if (!sessionId) {
    return {
      ok: false,
      data: null,
      error: { message: "SESSION_NOT_FOUND" },
    } satisfies ApiResponse<null>;
  }

  return (await apiClient(`/api/v1/yki/${sessionId}/task/audio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ audio: audioRef }),
  })) as ApiResponse<YkiTask>;
}

export async function playListeningPrompt() {
  const sessionId = await getStoredSessionId();

  if (!sessionId) {
    return {
      ok: false,
      data: null,
      error: { message: "SESSION_NOT_FOUND" },
    } satisfies ApiResponse<null>;
  }

  return (await apiClient(`/api/v1/yki/${sessionId}/task/play`, {
    method: "POST",
  })) as ApiResponse<YkiTask>;
}

export async function getHistory() {
  return (await apiClient("/api/v1/yki/history")) as ApiResponse<YkiProgressHistory>;
}
