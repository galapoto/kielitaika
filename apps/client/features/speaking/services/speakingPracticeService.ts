import { apiClient, ContractViolationError } from "@core/api/apiClient";
import { validateSpeakingPracticeSessionPayload } from "@core/api/governedResponseValidation";

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

export type SpeakingPrompt = {
  id: string;
  title: string;
  prompt_text: string;
  response_guidance: string;
  answer_status: "pending" | "answered";
  prompt_audio: {
    asset_id: string;
    url: string;
    duration_ms: number;
    ready: boolean;
  };
};

export type SpeakingResult = {
  prompt_id: string;
  correct: boolean;
  submitted_transcript: string;
  expected_response: string;
  difference: string | null;
  evaluation_mode: string;
  recording_captured: boolean;
  capture_mode: "recording_with_transcript" | "transcript_only";
};

export type SpeakingPracticeSession = {
  session_id: string;
  user_id: string;
  status: "active" | "completed";
  current_prompt_index: number;
  current_prompt: SpeakingPrompt | null;
  latest_result: SpeakingResult | null;
  completion_state: {
    prompts_served: number;
    attempts: number;
    correct_count: number;
    total_count: number;
    accuracy: number;
    session_complete: boolean;
  };
  actions: {
    play_prompt: boolean;
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

async function withSpeakingValidation(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<SpeakingPracticeSession>> {
  let response: ApiResponse<SpeakingPracticeSession>;

  try {
    response = (await apiClient(path, options, {
      validateData: (payload) =>
        validateSpeakingPracticeSessionPayload(
          payload as Record<string, unknown>,
        ) as SpeakingPracticeSession,
    })) as ApiResponse<SpeakingPracticeSession>;
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

export async function startSpeakingPracticeSession() {
  return withSpeakingValidation("/api/v1/speaking/start", {
    method: "POST",
  });
}

export async function fetchSpeakingPracticeSession(sessionId: string) {
  return withSpeakingValidation(`/api/v1/speaking/${sessionId}`);
}

export async function submitSpeakingPracticeResponse(
  sessionId: string,
  transcript: string,
  recordingCaptured: boolean,
) {
  return withSpeakingValidation(`/api/v1/speaking/${sessionId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transcript, recordingCaptured }),
  });
}

export async function advanceSpeakingPracticeSession(sessionId: string) {
  return withSpeakingValidation(`/api/v1/speaking/${sessionId}/next`, {
    method: "POST",
  });
}
