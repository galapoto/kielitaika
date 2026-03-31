import { apiClient } from "@core/api/apiClient";
import { storageService } from "@core/services/storageService";

const YKI_PRACTICE_SESSION_STORAGE_KEY = "yki_practice_session_id";

type ApiError = {
  message: string;
};

type ApiResponse<T> = {
  ok: boolean;
  data: T | null;
  error: ApiError | null;
};

export type YkiPracticeEvaluation = {
  score: number;
  maxScore: number;
  isCorrect: boolean;
  explanation: string;
  relatedLearningUnitId: string;
};

export type YkiPracticeTask = {
  id: string;
  section: "reading" | "listening" | "writing" | "speaking";
  type: string;
  title: string;
  prompt: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  guidance?: string;
  keywords?: string[];
  ttsPrompt?: string;
  timeLimitSeconds: number;
  relatedLearningUnitId: string;
  relatedModuleId: string;
  submittedAnswer?: string | null;
  evaluation?: YkiPracticeEvaluation | null;
};

export type YkiPracticeResult = {
  taskId: string;
  section: string;
  score: number;
  explanation: string;
  relatedLearningUnitId: string;
  learningProgress?: {
    unitProgress: {
      mastery_level: string;
      review_interval_days: number;
    };
  } | null;
};

export type YkiPracticeSession = {
  session_id: string;
  user_id: string;
  level: string;
  focus_areas: string[];
  tasks: YkiPracticeTask[];
  current_task_index: number;
  results: YkiPracticeResult[];
  currentTask: YkiPracticeTask | null;
  completedTaskCount: number;
  isComplete: boolean;
};

export async function getStoredPracticeSessionId() {
  return storageService.get(YKI_PRACTICE_SESSION_STORAGE_KEY);
}

export async function clearPracticeSession() {
  await storageService.remove(YKI_PRACTICE_SESSION_STORAGE_KEY);
}

export async function startPracticeSession() {
  const res = (await apiClient("/api/v1/yki-practice/start", {
    method: "POST",
  })) as ApiResponse<YkiPracticeSession>;

  if (res.ok && res.data?.session_id) {
    await storageService.set(YKI_PRACTICE_SESSION_STORAGE_KEY, res.data.session_id);
  }

  return res;
}

export async function resumePracticeSession() {
  const sessionId = await getStoredPracticeSessionId();

  if (!sessionId) {
    return null;
  }

  return (await apiClient(
    `/api/v1/yki-practice/${sessionId}`,
  )) as ApiResponse<YkiPracticeSession>;
}

export async function submitPracticeTask(
  action: "submit_only" | "advance" | "retry_task" | "retry_section" | "submit_and_next",
  answer?: string,
) {
  const sessionId = await getStoredPracticeSessionId();

  if (!sessionId) {
    return {
      ok: false,
      data: null,
      error: { message: "SESSION_NOT_FOUND" },
    } satisfies ApiResponse<null>;
  }

  return (await apiClient(`/api/v1/yki-practice/${sessionId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      answer,
    }),
  })) as ApiResponse<YkiPracticeSession>;
}
