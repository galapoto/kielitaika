import { apiClient, ContractViolationError } from "@core/api/apiClient";
import { validateDailyPracticeSessionPayload } from "@core/api/governedResponseValidation";

type ApiError = {
  code?: string;
  message: string;
  event_id?: string | null;
  traceReference?: string | null;
  trace_id?: string | null;
};

type ApiResponse<T> = {
  ok: boolean;
  data: T | null;
  error: ApiError | null;
};

export type DailyPracticeExercise = {
  id: string;
  type: "vocabulary_selection" | "sentence_completion" | "grammar_selection";
  title: string;
  prompt: string;
  options: string[];
  input_mode: "choice" | "text";
  answer_status: "pending" | "answered";
};

export type DailyPracticeSession = {
  session_id: string;
  user_id: string;
  status: "active" | "completed";
  current_exercise_index: number;
  current_exercise: DailyPracticeExercise | null;
  latest_result: {
    exercise_id: string;
    type: string;
    correct: boolean;
    submitted_answer: string;
    expected_answer: string;
    explanation: string | null;
  } | null;
  completion_state: {
    completed_count: number;
    total_count: number;
    accuracy: number;
    session_complete: boolean;
  };
  actions: {
    submit: boolean;
    next: boolean;
  };
};

function normalizeError(error: ApiError | null): ApiError {
  if (!error) {
    return { code: "CONTRACT_VIOLATION", message: "CONTRACT_VIOLATION", traceReference: null };
  }

  const traceReference =
    error.trace_id || error.event_id
      ? `Trace ${error.trace_id ?? "none"}${error.event_id ? ` | Event ${error.event_id}` : ""}`
      : null;

  return {
    code: error.code ?? "CONTRACT_VIOLATION",
    event_id: error.event_id ?? null,
    message: error.message || error.code || "CONTRACT_VIOLATION",
    traceReference,
    trace_id: error.trace_id ?? null,
  };
}

async function withDailyPracticeValidation(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<DailyPracticeSession>> {
  let response: ApiResponse<DailyPracticeSession>;

  try {
    response = (await apiClient(path, options, {
      validateData: (payload) =>
        validateDailyPracticeSessionPayload(payload as Record<string, unknown>) as DailyPracticeSession,
    })) as ApiResponse<DailyPracticeSession>;
  } catch (error) {
    if (error instanceof ContractViolationError) {
      return {
        ok: false,
        data: null,
        error: {
          code: error.code,
          message: error.code,
          traceReference: null,
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

export async function startDailyPracticeSession() {
  return withDailyPracticeValidation("/api/v1/daily-practice/start", {
    method: "POST",
  });
}

export async function fetchDailyPracticeSession(sessionId: string) {
  return withDailyPracticeValidation(`/api/v1/daily-practice/${sessionId}`);
}

export async function submitDailyPracticeAnswer(sessionId: string, answer: string) {
  return withDailyPracticeValidation(`/api/v1/daily-practice/${sessionId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answer }),
  });
}

export async function advanceDailyPracticeSession(sessionId: string) {
  return withDailyPracticeValidation(`/api/v1/daily-practice/${sessionId}/next`, {
    method: "POST",
  });
}
