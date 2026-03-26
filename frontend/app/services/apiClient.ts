import { clearAuthSession, loadAuthSession, saveAuthSession } from "./storage";
import { assertApiEnvelope, createClientErrorEnvelope } from "./contractGuard";
import { logApiFailure } from "./debugLogger";
import type { ApiEnvelope, PersistedAuthSession } from "../state/types";

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "").replace(/\/+$/, "");

function transportErrorEnvelope(message: string): ApiEnvelope<never> {
  return createClientErrorEnvelope("TRANSPORT_ERROR", message, true);
}

type JsonBody = Record<string, unknown> | Array<unknown>;

type RequestOptions = {
  method: string;
  path: string;
  body?: JsonBody;
  headers?: Record<string, string>;
  auth?: boolean;
  formData?: FormData;
  retrying?: boolean;
};

function isAuthExpiredEnvelope(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  const envelope = payload as ApiEnvelope<unknown>;
  return envelope.ok === false && (envelope.error.code === "AUTH_SESSION_EXPIRED" || envelope.error.code === "AUTH_REQUIRED");
}

function toPersistedAuthSession(
  existing: PersistedAuthSession | null,
  payload: {
    auth_user: PersistedAuthSession["auth_user"];
    tokens: PersistedAuthSession["tokens"];
  },
): PersistedAuthSession {
  return {
    schema_version: "1",
    auth_user: payload.auth_user,
    tokens: payload.tokens,
    restored_at: new Date().toISOString(),
  };
}

export async function refreshPersistedSession(): Promise<ApiEnvelope<{ auth_user: PersistedAuthSession["auth_user"]; tokens: PersistedAuthSession["tokens"] } | unknown>> {
  const current = loadAuthSession();
  if (!current) {
    return {
      ok: false,
      data: null,
      error: {
        code: "AUTH_REQUIRED",
        message: "Authentication is required.",
        retryable: false,
        details: null,
      },
      meta: {
        request_id: "local-missing-auth",
        timestamp: new Date().toISOString(),
        api_version: "v1",
      },
    };
  }
  const response = await apiRequest<{
    auth_user: PersistedAuthSession["auth_user"];
    tokens: {
      access_token: string;
      refresh_token: string;
      token_type: string;
      access_expires_at: string;
      refresh_expires_at: string;
      auth_session_id: string;
    };
  }>({
    method: "POST",
    path: "/api/v1/auth/token/refresh",
    body: { refresh_token: current.tokens.refresh_token },
    auth: false,
    retrying: true,
  });
  if (response.ok) {
    saveAuthSession(toPersistedAuthSession(current, response.data));
  } else {
    clearAuthSession();
  }
  return response;
}

export async function apiRequest<T>(options: RequestOptions): Promise<ApiEnvelope<T>> {
  const authSession = loadAuthSession();
  const headers = new Headers(options.headers || {});

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth && authSession) {
    headers.set("Authorization", `Bearer ${authSession.tokens.access_token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${options.path}`, {
      method: options.method,
      headers,
      body: options.formData ? options.formData : options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    logApiFailure(options.path, {
      method: options.method,
      stage: "transport",
      message: "Network request failed.",
    });
    return transportErrorEnvelope("Network request failed.") as ApiEnvelope<T>;
  }

  const rawPayload = await response.json().catch(() => null);
  if (!rawPayload) {
    logApiFailure(options.path, {
      method: options.method,
      stage: "invalid-json",
      status: response.status,
    });
    return createClientErrorEnvelope("CONTRACT_VIOLATION", "Invalid API response.", false) as ApiEnvelope<T>;
  }

  let payload: ApiEnvelope<T>;
  try {
    payload = assertApiEnvelope<T>(rawPayload);
  } catch (error) {
    console.error("API contract violation", { path: options.path, error });
    logApiFailure(options.path, {
      method: options.method,
      stage: "contract-validation",
      status: response.status,
      error,
    });
    return createClientErrorEnvelope("CONTRACT_VIOLATION", "API response failed contract validation.", false, {
      path: options.path,
    }) as ApiEnvelope<T>;
  }

  if (
    options.auth &&
    !options.retrying &&
    response.status === 401 &&
    isAuthExpiredEnvelope(payload) &&
    authSession &&
    !options.path.startsWith("/api/v1/auth/")
  ) {
    const refreshed = await refreshPersistedSession();
    if (refreshed.ok) {
      return apiRequest<T>({ ...options, retrying: true });
    }
    return payload;
  }

  if (!payload.ok) {
    logApiFailure(options.path, {
      method: options.method,
      status: response.status,
      code: payload.error.code,
      message: payload.error.message,
      request_id: payload.meta.request_id,
      retryable: payload.error.retryable,
    });
  }

  return payload;
}

export { toPersistedAuthSession };
