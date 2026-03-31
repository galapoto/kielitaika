import type { ApiResponse } from "../models/apiTypes";
import { getApiBaseUrl } from "./apiConfig";

let authToken: string | null = null;
let expectedDecisionVersion: string | null = null;
let expectedYkiPracticeSessionId: string | null = null;
const contractViolations: Array<{
  code: "CONTRACT_VIOLATION";
  details: string;
  message: string;
  path: string;
  recordedAt: string;
}> = [];

class ContractViolationError extends Error {
  path: string;

  constructor(path: string, message: string) {
    super(message);
    this.name = "ContractViolationError";
    this.path = path;
  }
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getApiContractViolations() {
  return [...contractViolations];
}

function recordContractViolation(path: string, message: string) {
  contractViolations.push({
    code: "CONTRACT_VIOLATION",
    details: message,
    message: "CONTRACT_VIOLATION",
    path,
    recordedAt: new Date().toISOString(),
  });

  if (contractViolations.length > 20) {
    contractViolations.splice(0, contractViolations.length - 20);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function extractDecisionVersion(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = extractDecisionVersion(item);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.decisionVersion === "string") {
    return value.decisionVersion;
  }

  if (isRecord(value.sessionTrace) && typeof value.sessionTrace.decision_version === "string") {
    return value.sessionTrace.decision_version;
  }

  if (
    isRecord(value.whyThisWasSelected) &&
    typeof value.whyThisWasSelected.decision_version === "string"
  ) {
    return value.whyThisWasSelected.decision_version;
  }

  for (const nestedValue of Object.values(value)) {
    const nested = extractDecisionVersion(nestedValue);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function extractSessionId(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  return typeof value.session_id === "string" ? value.session_id : null;
}

function extractYkiPracticeSessionIdFromPath(path: string) {
  const match = path.match(/^\/api\/v1\/yki-practice\/([^/]+)/);
  const candidate = match?.[1] ?? null;

  if (!candidate || candidate === "start") {
    return null;
  }

  return candidate;
}

function validateResponseContract(path: string, data: unknown) {
  const responseDecisionVersion = extractDecisionVersion(data);
  if (responseDecisionVersion) {
    if (expectedDecisionVersion && expectedDecisionVersion !== responseDecisionVersion) {
      throw new ContractViolationError(
        path,
        `Decision version drift: expected ${expectedDecisionVersion}, received ${responseDecisionVersion}.`,
      );
    }

    expectedDecisionVersion = responseDecisionVersion;
  }

  const pathSessionId = extractYkiPracticeSessionIdFromPath(path);
  const responseSessionId = extractSessionId(data);

  if (pathSessionId && responseSessionId && pathSessionId !== responseSessionId) {
    throw new ContractViolationError(
      path,
      `Session mismatch: path requested ${pathSessionId}, response returned ${responseSessionId}.`,
    );
  }

  if (path.startsWith("/api/v1/yki-practice/start") && responseSessionId) {
    expectedYkiPracticeSessionId = responseSessionId;
  } else if (responseSessionId && path.startsWith("/api/v1/yki-practice/")) {
    if (expectedYkiPracticeSessionId && expectedYkiPracticeSessionId !== responseSessionId) {
      throw new ContractViolationError(
        path,
        `Session continuity drift: expected ${expectedYkiPracticeSessionId}, received ${responseSessionId}.`,
      );
    }

    expectedYkiPracticeSessionId = responseSessionId;
  }
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers,
    });
    const payload = await res.json();

    if (!payload || typeof payload.ok !== "boolean") {
      return {
        ok: false,
        data: null,
        error: {
          code: res.status === 404 ? "NOT_FOUND" : "API_CONTRACT_ERROR",
          message: res.status === 404 ? "Endpoint not found" : "Invalid API response shape",
          retryable: false,
        },
      };
    }

    if (payload.ok) {
      validateResponseContract(path, payload.data);
    }

    return payload as ApiResponse<T>;
  } catch (error) {
    if (error instanceof ContractViolationError) {
      recordContractViolation(error.path, error.message);
      return {
        ok: false,
        data: null,
        error: {
          code: "CONTRACT_VIOLATION",
          message: error.message,
          retryable: false,
        },
      };
    }

    return {
      ok: false,
      data: null,
      error: {
        code: "NETWORK_ERROR",
        message: "NETWORK_ERROR",
        retryable: true,
      },
    };
  }
}
