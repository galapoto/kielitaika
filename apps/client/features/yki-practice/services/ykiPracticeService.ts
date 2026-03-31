import { apiClient, ContractViolationError } from "@core/api/apiClient";
import {
  validateYkiPracticeSessionPayload,
} from "@core/api/governedResponseValidation";
import {
  clearPersistedYkiSession,
  loadPersistedYkiSession,
  persistYkiSession,
} from "../../../state/sessionPersistence";

type ApiError = {
  code?: string;
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
  examMode: boolean;
  next_allowed_action: "advance" | "complete" | "submit_only";
  completion_state: {
    completed_task_count: number;
    status: "active" | "awaiting_advance" | "completed";
    total_task_count: number;
  };
  session_hash: string;
  task_sequence_hash: string;
  policyVersion: string;
  decisionVersion: string;
  governanceVersion: string;
  changeReference: string | null;
  governanceStatus: "governed" | "legacy_uncontrolled";
  precomputedPlan?: {
    task_ids: string[];
    decision_version: string;
    policy_version: string;
    decision_policy_version: string;
    governance_version: string;
    change_reference: string | null;
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
    policy_version: string;
    decision_policy_version: string;
    governance_version: string;
    change_reference: string | null;
    exam_mode: boolean;
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
    governance_version: string;
    change_reference: string | null;
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

type PersistedSessionFailure = {
  ok: false;
  reason: "corrupted" | "outdated";
  sessionId: null;
};

type PersistedSessionSuccess = {
  ok: true;
  reason: null;
  sessionHash: string;
  sessionId: string;
  taskSequenceHash: string;
};

function normalizeError(error: ApiError | null): ApiError {
  if (!error) {
    return { code: "CONTRACT_VIOLATION", message: "CONTRACT_VIOLATION" };
  }

  return {
    code: error.code ?? "CONTRACT_VIOLATION",
    message: error.message || error.code || "CONTRACT_VIOLATION",
  };
}

async function withSessionValidation(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<YkiPracticeSession>> {
  let response: ApiResponse<YkiPracticeSession>;

  try {
    response = (await apiClient(path, options, {
      sessionId: await getStoredPracticeSessionId(),
      validateData: (payload) =>
        validateYkiPracticeSessionPayload(
          payload as Record<string, unknown> & {
            precomputedPlan: Record<string, unknown>;
            sessionTrace: Record<string, unknown>;
          },
        ) as YkiPracticeSession,
    })) as ApiResponse<YkiPracticeSession>;
  } catch (error) {
    if (error instanceof ContractViolationError) {
      return {
        ok: false,
        data: null,
        error: {
          code: error.code,
          message: error.code,
        },
      };
    }

    throw error;
  }

  if (!response.ok || !response.data) {
    return {
      ok: false,
      data: null,
      error: normalizeError(response.error),
    };
  }

  return {
    ok: true,
    data: response.data,
    error: null,
  };
}

async function persistSessionFromResponse(data: YkiPracticeSession) {
  await persistYkiSession({
    currentTaskIndex: data.current_task_index,
    decisionVersion: data.decisionVersion,
    governanceVersion: data.governanceVersion,
    isComplete: data.isComplete,
    policyVersion: data.policyVersion,
    sessionId: data.session_id,
    sessionHash: data.session_hash,
    taskSequenceHash: data.task_sequence_hash,
  });
}

function validateRuntimeTransition(
  previous: YkiPracticeSession | null,
  next: YkiPracticeSession,
  action: "advance" | "resume" | "start" | "submit_only",
) {
  if (!previous) {
    return;
  }

  if (previous.session_id !== next.session_id) {
    throw new ContractViolationError(
      `/api/v1/yki-practice/${next.session_id}`,
      "CONTRACT_VIOLATION",
      "SESSION_CORRUPTED",
    );
  }

  if (previous.task_sequence_hash !== next.task_sequence_hash) {
    throw new ContractViolationError(
      `/api/v1/yki-practice/${next.session_id}`,
      "CONTRACT_VIOLATION",
      "SESSION_CORRUPTED",
    );
  }

  if (action === "submit_only") {
    if (previous.next_allowed_action !== "submit_only") {
      throw new ContractViolationError(
        `/api/v1/yki-practice/${next.session_id}`,
        "CONTRACT_VIOLATION",
        "SESSION_CORRUPTED",
      );
    }

    if (next.current_task_index !== previous.current_task_index) {
      throw new ContractViolationError(
        `/api/v1/yki-practice/${next.session_id}`,
        "CONTRACT_VIOLATION",
        "SESSION_CORRUPTED",
      );
    }
  }

  if (action === "advance") {
    if (previous.next_allowed_action !== "advance") {
      throw new ContractViolationError(
        `/api/v1/yki-practice/${next.session_id}`,
        "CONTRACT_VIOLATION",
        "SESSION_CORRUPTED",
      );
    }

    if (next.current_task_index !== previous.current_task_index + 1) {
      throw new ContractViolationError(
        `/api/v1/yki-practice/${next.session_id}`,
        "CONTRACT_VIOLATION",
        "SESSION_CORRUPTED",
      );
    }
  }

  if (action === "resume" && next.current_task_index < previous.current_task_index) {
    throw new ContractViolationError(
      `/api/v1/yki-practice/${next.session_id}`,
      "CONTRACT_VIOLATION",
      "SESSION_CORRUPTED",
    );
  }

  if (next.current_task_index > previous.current_task_index + 1) {
    throw new ContractViolationError(
      `/api/v1/yki-practice/${next.session_id}`,
      "CONTRACT_VIOLATION",
      "SESSION_CORRUPTED",
    );
  }
}

export async function getStoredPracticeSessionState(): Promise<
  PersistedSessionFailure | PersistedSessionSuccess | null
> {
  const persisted = await loadPersistedYkiSession();

  if (persisted.status === "invalid") {
    return {
      ok: false,
      reason: persisted.reason,
      sessionId: null,
    };
  }

  if (persisted.status === "missing" || !persisted.value) {
    return null;
  }

  return {
    ok: true,
    reason: null,
    sessionHash: persisted.value.sessionHash,
    sessionId: persisted.value.sessionId,
    taskSequenceHash: persisted.value.taskSequenceHash,
  };
}

export async function getStoredPracticeSessionId() {
  const persisted = await getStoredPracticeSessionState();
  return persisted?.ok ? persisted.sessionId : null;
}

export async function clearPracticeSession() {
  await clearPersistedYkiSession();
}

export async function startPracticeSession() {
  const res = await withSessionValidation("/api/v1/yki-practice/start", {
    method: "POST",
  });

  if (res.ok && res.data?.session_id) {
    validateRuntimeTransition(null, res.data, "start");
    await persistSessionFromResponse(res.data);
  }

  return res;
}

export async function resumePracticeSession() {
  const persisted = await getStoredPracticeSessionState();

  if (!persisted) {
    return null;
  }

  if (!persisted.ok) {
    return {
      ok: false,
      data: null,
      error: {
        code: persisted.reason === "corrupted" ? "SESSION_CORRUPTED" : "SESSION_OUTDATED",
        message: persisted.reason === "corrupted" ? "SESSION_CORRUPTED" : "SESSION_OUTDATED",
      },
    } satisfies ApiResponse<YkiPracticeSession>;
  }

  const response = await withSessionValidation(`/api/v1/yki-practice/${persisted.sessionId}`);

  if (response.ok && response.data) {
    if (
      response.data.session_hash !== persisted.sessionHash ||
      response.data.task_sequence_hash !== persisted.taskSequenceHash
    ) {
      await clearPracticeSession();
      return {
        ok: false,
        data: null,
        error: {
          code: "SESSION_CORRUPTED",
          message: "SESSION_CORRUPTED",
        },
      } satisfies ApiResponse<YkiPracticeSession>;
    }

    await persistSessionFromResponse(response.data);
  }

  return response;
}

export async function submitPracticeTask(
  action: "submit_only" | "advance",
  answer?: string,
) {
  const sessionId = await getStoredPracticeSessionId();

  if (!sessionId) {
    return {
      ok: false,
      data: null,
      error: { code: "CONTRACT_VIOLATION", message: "CONTRACT_VIOLATION" },
    } satisfies ApiResponse<null>;
  }

  const previousSessionResponse = await withSessionValidation(`/api/v1/yki-practice/${sessionId}`);
  if (!previousSessionResponse.ok || !previousSessionResponse.data) {
    return previousSessionResponse;
  }

  const previousSession = previousSessionResponse.data;

  const response = await withSessionValidation(`/api/v1/yki-practice/${sessionId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      answer,
    }),
  });

  if (response.ok && response.data) {
    validateRuntimeTransition(
      previousSession,
      response.data,
      action === "advance" ? "advance" : "submit_only",
    );
    await persistSessionFromResponse(response.data);
  }

  return response;
}
