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
  whyWrong: string;
  ruleApplies: string | null;
  relatedLearningUnitId: string;
  linkedLearningUnit: {
    id: string;
    title: string;
    kind: string;
    difficultyLevel: "easy" | "medium" | "hard";
  } | null;
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
  whyWrong: string;
  ruleApplies: string | null;
  relatedLearningUnitId: string;
  linkedLearningUnit: {
    id: string;
    title: string;
    kind: string;
    difficultyLevel: "easy" | "medium" | "hard";
  } | null;
  learningProgress?: {
    unitProgress: {
      mastery_level: string;
      review_interval_days: number;
      regression_detected: boolean;
      stagnated: boolean;
    };
  } | null;
  learningSignal?: {
    signal_source: string;
    task_type: string | null;
    task_section: string | null;
    difficulty_level: string | null;
    improvement_delta: number;
    effectiveness_score: number;
    stagnated: boolean;
    impact_label: string;
  } | null;
};

export type YkiPracticeSessionSummary = {
  strengths: string[];
  weaknesses: string[];
  improvement_trend: string;
  recommended_focus: string[];
  averageScore: number;
};

export type YkiPracticeSession = {
  session_id: string;
  user_id: string;
  level: string;
  focus_areas: string[];
  examMode?: boolean;
  policyVersion?: string;
  decisionVersion?: string;
  precomputedPlan?: {
    task_ids: string[];
    decision_version: string;
    policy_version: string;
    decision_policy_version: string;
    exam_mode: boolean;
    deterministic_seed: string;
  };
  tasks: YkiPracticeTask[];
  current_task_index: number;
  results: YkiPracticeResult[];
  currentTask: YkiPracticeTask | null;
  completedTaskCount: number;
  isComplete: boolean;
  sessionSummary: YkiPracticeSessionSummary;
  sessionTrace?: {
    decision_version: string;
    policy_version?: string;
    decision_policy_version?: string;
    exam_mode?: boolean;
    adaptiveContext: Record<string, unknown>;
    tasks: Array<{
      taskId: string;
      section: string;
      relatedLearningUnitId: string;
      task_selection_reason: string;
      difficulty_level: string;
      user_performance: {
        score: number;
        maxScore: number;
        isCorrect: boolean;
      } | null;
      feedback_generated: {
        explanation: string;
        whyWrong: string;
        ruleApplies: string | null;
        linkedLearningUnitId: string;
      } | null;
      learning_influence: {
        signal_source: string;
        task_type: string | null;
        task_section: string | null;
        difficulty_level: string | null;
        improvement_delta: number;
        effectiveness_score: number;
        stagnated: boolean;
        impact_label: string;
      } | null;
    }>;
  };
  auditTimeline?: Array<{
    event_id: string;
    timestamp: string;
    event_type: string;
    decision_version: string;
    policy_version: string;
    previous_event_hash: string | null;
    event_hash: string | null;
    input_snapshot: Record<string, unknown>;
    output_snapshot: Record<string, unknown>;
    constraint_metadata: Record<string, unknown>;
  }>;
  auditReplay?: {
    orderedEventIds: string[];
    eventCounts: Record<string, number>;
    ykiTaskFlow: Array<Record<string, unknown>>;
    trusted: boolean;
    integrity: {
      ok: boolean;
      integrityStatus: string;
      chainLength: number;
      failureIndex: number | null;
      failureEventId: string | null;
      failureReason: string | null;
      legacyEventCount: number;
      streamKey: string | null;
    };
  };
  auditVerification?: {
    ok: boolean;
    issues: string[];
    trusted: boolean;
    integrity: {
      ok: boolean;
      integrityStatus: string;
      chainLength: number;
      failureIndex: number | null;
      failureEventId: string | null;
      failureReason: string | null;
      legacyEventCount: number;
      streamKey: string | null;
    };
  };
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
