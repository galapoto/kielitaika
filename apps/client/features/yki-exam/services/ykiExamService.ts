import { apiClient, ContractViolationError } from "@core/api/apiClient";
import { validateYkiExamSessionPayload } from "@core/api/governedResponseValidation";
import {
  clearPersistedYkiExamSession,
  loadPersistedYkiExamSession,
  persistYkiExamSession,
} from "../../../state/sessionPersistence";

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

export type YkiExamAction = {
  enabled: boolean;
  kind: string;
  label: string;
};

export type YkiExamSession = {
  session_id: string;
  user_id: string;
  status: string;
  state_source: {
    mode: string;
    path: string;
  };
  section_order: string[];
  current_section: string | null;
  current_view: {
    view_key: string;
    kind: string;
    title: string;
    prompt: string;
    input_mode: "audio" | "choice" | "none" | "text";
    instructions: string[];
    answer_status: string;
    response_locked: boolean;
    section: string | null;
    options: string[];
    actions: {
      next: YkiExamAction | null;
      play_prompt: YkiExamAction | null;
      submit: YkiExamAction | null;
    };
    passage?: string | null;
    playback?: {
      count: number;
      limit: number;
      remaining: number;
    } | null;
    question?: string | null;
    recording?: {
      max_duration_seconds: number;
    } | null;
    submitted_answer?: string | null;
    submitted_audio?: string | null;
  };
  navigation: {
    back_allowed: boolean;
    can_next: boolean;
    forward_only: boolean;
    interaction_locked: boolean;
    next_label: string | null;
    read_only: boolean;
    skip_allowed: boolean;
    state_locked: boolean;
  };
  timing_manifest: {
    server_now: string;
    exam_started_at: string;
    exam_expires_at: string;
    exam_remaining_seconds: number;
    current_section_started_at: string | null;
    current_section_expires_at: string | null;
    current_section_remaining_seconds: number;
    warning_threshold_seconds: number;
    sections: Record<
      string,
      {
        duration_minutes: number;
        expires_at: string | null;
        started_at: string | null;
        remaining_seconds: number;
      }
    >;
  };
  completion_state: {
    completed_section_count: number;
    completed_step_count: number;
    status: string;
    total_section_count: number;
    total_step_count: number;
  };
  section_progress: Array<{
    section: string;
    status: string;
    current_step_index: number;
    total_steps: number;
    completed_step_count: number;
    started_at: string | null;
    expires_at: string | null;
  }>;
  certificate: {
    overall_score: number;
    level: string;
    passed: boolean;
    section_scores: Record<string, number>;
    evaluation_mode: string | null;
  } | null;
  learning_feedback: {
    weak_areas: string[];
    suggestions: string[];
  } | null;
  progress_history: {
    sessions: Record<string, unknown>[];
    progression: number[];
    current_level: string | null;
    trend: string;
    weak_patterns: string[];
    strong_patterns: string[];
  };
  runtime: Record<string, unknown>;
};

type PersistedExamFailure = {
  ok: false;
  reason: "corrupted" | "outdated";
  sessionId: null;
};

type PersistedExamSuccess = {
  ok: true;
  reason: null;
  sessionId: string;
  status: string;
  viewKey: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

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

function readSessionReference(data: unknown) {
  if (!isRecord(data) || typeof data.session_id !== "string") {
    throw new ContractViolationError(
      "/api/v1/yki/sessions/start",
      "CONTRACT_VIOLATION",
      "CONTRACT_VIOLATION",
    );
  }

  return data.session_id;
}

async function withExamSessionValidation(
  path: string,
  options?: RequestInit,
  sessionId?: string | null,
): Promise<ApiResponse<YkiExamSession>> {
  let response: ApiResponse<YkiExamSession>;

  try {
    response = (await apiClient(path, options, {
      sessionId,
      validateData: (payload) =>
        validateYkiExamSessionPayload(payload as Record<string, unknown>) as YkiExamSession,
    })) as ApiResponse<YkiExamSession>;
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

async function persistSessionFromResponse(data: YkiExamSession) {
  await persistYkiExamSession({
    sessionId: data.session_id,
    status: data.status,
    viewKey: data.current_view.view_key,
  });
}

async function runMutationAndRefresh(
  path: string,
  sessionId: string,
  options?: RequestInit,
): Promise<ApiResponse<YkiExamSession>> {
  let mutationResponse: ApiResponse<Record<string, unknown>>;

  try {
    mutationResponse = (await apiClient(path, options, {
      sessionId,
    })) as ApiResponse<Record<string, unknown>>;
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

  if (!mutationResponse.ok || !mutationResponse.data) {
    return {
      ok: false,
      data: null,
      error: normalizeError(mutationResponse.error),
    };
  }

  const returnedSessionId = readSessionReference(mutationResponse.data);
  if (returnedSessionId !== sessionId) {
    return {
      ok: false,
      data: null,
      error: {
        code: "CONTRACT_VIOLATION",
        message: "CONTRACT_VIOLATION",
        traceReference: null,
      },
    };
  }

  return fetchExamSession(sessionId);
}

export async function getStoredExamSessionState(): Promise<
  PersistedExamFailure | PersistedExamSuccess | null
> {
  const persisted = await loadPersistedYkiExamSession();

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
    sessionId: persisted.value.sessionId,
    status: persisted.value.status,
    viewKey: persisted.value.viewKey,
  };
}

export async function clearExamSession() {
  await clearPersistedYkiExamSession();
}

export async function fetchExamSession(sessionId: string) {
  const response = await withExamSessionValidation(`/api/v1/yki/sessions/${sessionId}`, {}, sessionId);

  if (response.ok && response.data) {
    await persistSessionFromResponse(response.data);
  }

  return response;
}

export async function startExamSession() {
  let response: ApiResponse<Record<string, unknown>>;

  try {
    response = (await apiClient("/api/v1/yki/sessions/start", { method: "POST" })) as ApiResponse<
      Record<string, unknown>
    >;
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
      } satisfies ApiResponse<YkiExamSession>;
    }

    throw error;
  }

  if (!response.ok || !response.data) {
    return {
      ok: false,
      data: null,
      error: normalizeError(response.error),
    } satisfies ApiResponse<YkiExamSession>;
  }

  const sessionId = readSessionReference(response.data);
  return fetchExamSession(sessionId);
}

export async function resumeExamSession() {
  const persisted = await getStoredExamSessionState();

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
        traceReference: null,
      },
    } satisfies ApiResponse<YkiExamSession>;
  }

  const response = await fetchExamSession(persisted.sessionId);

  if (!response.ok && response.error?.code !== "TRANSPORT_ERROR") {
    await clearExamSession();
  }

  return response;
}

export async function advanceExamSession() {
  const persisted = await getStoredExamSessionState();

  if (!persisted?.ok) {
    return {
      ok: false,
      data: null,
      error: {
        code: "SESSION_INVALID",
        message: "SESSION_INVALID",
        traceReference: null,
      },
    } satisfies ApiResponse<YkiExamSession>;
  }

  return runMutationAndRefresh(`/api/v1/yki/sessions/${persisted.sessionId}/next`, persisted.sessionId, {
    method: "POST",
  });
}

export async function submitExamAnswer(answer: string) {
  const persisted = await getStoredExamSessionState();

  if (!persisted?.ok) {
    return {
      ok: false,
      data: null,
      error: {
        code: "SESSION_INVALID",
        message: "SESSION_INVALID",
        traceReference: null,
      },
    } satisfies ApiResponse<YkiExamSession>;
  }

  return runMutationAndRefresh(
    `/api/v1/yki/sessions/${persisted.sessionId}/answer`,
    persisted.sessionId,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer }),
    },
  );
}

export async function submitExamAudio(audio: string) {
  const persisted = await getStoredExamSessionState();

  if (!persisted?.ok) {
    return {
      ok: false,
      data: null,
      error: {
        code: "SESSION_INVALID",
        message: "SESSION_INVALID",
        traceReference: null,
      },
    } satisfies ApiResponse<YkiExamSession>;
  }

  return runMutationAndRefresh(
    `/api/v1/yki/sessions/${persisted.sessionId}/audio`,
    persisted.sessionId,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio }),
    },
  );
}

export async function playExamPrompt() {
  const persisted = await getStoredExamSessionState();

  if (!persisted?.ok) {
    return {
      ok: false,
      data: null,
      error: {
        code: "SESSION_INVALID",
        message: "SESSION_INVALID",
        traceReference: null,
      },
    } satisfies ApiResponse<YkiExamSession>;
  }

  return runMutationAndRefresh(`/api/v1/yki/sessions/${persisted.sessionId}/play`, persisted.sessionId, {
    method: "POST",
  });
}
