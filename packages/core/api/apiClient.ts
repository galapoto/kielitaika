import type { ApiResponse } from "../models/apiTypes";
import { getApiBaseUrl } from "./apiConfig";
import {
  ControlledUiValidationError,
  REQUIRED_BACKEND_VERSION,
  REQUIRED_CONTRACT_VERSION,
  validateApiEnvelope,
} from "./governedResponseValidation";

type ContractValidator<T> = (payload: Record<string, unknown>) => T;

type ApiClientContractOptions<T> = {
  allowNullData?: boolean;
  sessionId?: string | null;
  validateData?: ContractValidator<T>;
};

type ContractViolationCode = "CONTRACT_VIOLATION" | "GOVERNANCE_MISSING";

type AuditTrailEntry = {
  actionType: string;
  path: string;
  requestPayloadHash: string;
  responsePayloadHash: string;
  sessionId: string | null;
  timestamp: string;
};

let authToken: string | null = null;
let expectedDecisionVersion: string | null = null;
let expectedYkiPracticeSessionId: string | null = null;

const contractViolations: Array<{
  code: ContractViolationCode;
  details: string;
  message: string;
  path: string;
  recordedAt: string;
}> = [];

const contractAuditTrail: AuditTrailEntry[] = [];

export class ContractViolationError extends Error {
  code: ContractViolationCode;
  path: string;

  constructor(path: string, code: ContractViolationCode, message: string) {
    super(message);
    this.code = code;
    this.name = "ContractViolationError";
    this.path = path;
  }
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.keys(value as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((result, key) => {
      result[key] = stableValue((value as Record<string, unknown>)[key]);
      return result;
    }, {});
}

async function hashValue(value: unknown) {
  const serialized = JSON.stringify(stableValue(value));

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoded = new TextEncoder().encode(serialized);
    const digest = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest))
      .map((part) => part.toString(16).padStart(2, "0"))
      .join("");
  }

  let hash = 0;
  for (let index = 0; index < serialized.length; index += 1) {
    hash = (hash * 31 + serialized.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16);
}

function inferActionType(path: string, method: string) {
  if (path === "/api/v1/yki-practice/start" && method === "POST") {
    return "YKI_SESSION_START";
  }

  if (/^\/api\/v1\/yki-practice\/[^/]+$/.test(path) && method === "GET") {
    return "YKI_SESSION_RESUME";
  }

  if (/^\/api\/v1\/yki-practice\/[^/]+\/submit$/.test(path) && method === "POST") {
    return "YKI_SESSION_SUBMIT";
  }

  return null;
}

async function recordContractAuditEntry(
  path: string,
  options: RequestInit,
  responsePayload: unknown,
  sessionId: string | null,
) {
  const actionType = inferActionType(path, options.method ?? "GET");

  if (!actionType) {
    return;
  }

  contractAuditTrail.push({
    actionType,
    path,
    requestPayloadHash: await hashValue(options.body ?? null),
    responsePayloadHash: await hashValue(responsePayload),
    sessionId,
    timestamp: new Date().toISOString(),
  });

  if (contractAuditTrail.length > 30) {
    contractAuditTrail.splice(0, contractAuditTrail.length - 30);
  }
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function resetRuntimeContractState() {
  expectedDecisionVersion = null;
  expectedYkiPracticeSessionId = null;
}

export function getApiContractViolations() {
  return [...contractViolations];
}

export function getContractAuditTrail() {
  return [...contractAuditTrail];
}

export function recordApiContractIssue(
  path: string,
  code: ContractViolationCode,
  message: string,
) {
  contractViolations.push({
    code,
    details: message,
    message: code,
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

function validateResponseContract(path: string, data: unknown, sessionId?: string | null) {
  const responseDecisionVersion = extractDecisionVersion(data);
  if (responseDecisionVersion) {
    if (expectedDecisionVersion && expectedDecisionVersion !== responseDecisionVersion) {
      throw new ContractViolationError(
        path,
        "CONTRACT_VIOLATION",
        `Decision version drift: expected ${expectedDecisionVersion}, received ${responseDecisionVersion}.`,
      );
    }

    expectedDecisionVersion = responseDecisionVersion;
  }

  const pathSessionId = extractYkiPracticeSessionIdFromPath(path);
  const responseSessionId = extractSessionId(data);
  const expectedSessionId = sessionId ?? expectedYkiPracticeSessionId;

  if (pathSessionId && responseSessionId && pathSessionId !== responseSessionId) {
    throw new ContractViolationError(
      path,
      "CONTRACT_VIOLATION",
      `Session mismatch: path requested ${pathSessionId}, response returned ${responseSessionId}.`,
    );
  }

  if (path.startsWith("/api/v1/yki-practice/start") && responseSessionId) {
    expectedYkiPracticeSessionId = responseSessionId;
  } else if (responseSessionId && path.startsWith("/api/v1/yki-practice/")) {
    if (expectedSessionId && expectedSessionId !== responseSessionId) {
      throw new ContractViolationError(
        path,
        "CONTRACT_VIOLATION",
        `Session continuity drift: expected ${expectedSessionId}, received ${responseSessionId}.`,
      );
    }

    expectedYkiPracticeSessionId = responseSessionId;
  }
}

function normalizeContractError(error: unknown, path: string): ContractViolationError {
  if (error instanceof ContractViolationError) {
    return error;
  }

  if (error instanceof ControlledUiValidationError) {
    return new ContractViolationError(path, error.code, error.message);
  }

  return new ContractViolationError(path, "CONTRACT_VIOLATION", "CONTRACT_VIOLATION");
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
  contract: ApiClientContractOptions<T> = {},
): Promise<ApiResponse<T>> {
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
    const rawPayload = await res.json();
    const payload = validateApiEnvelope(rawPayload, path, {
      allowNullData: contract.allowNullData,
      validateData: contract.validateData,
    });

    if (payload.meta.version !== REQUIRED_BACKEND_VERSION) {
      throw new ContractViolationError(
        path,
        "CONTRACT_VIOLATION",
        `Backend version drift: expected ${REQUIRED_BACKEND_VERSION}, received ${payload.meta.version}.`,
      );
    }

    if (payload.meta.contract_version !== REQUIRED_CONTRACT_VERSION) {
      throw new ContractViolationError(
        path,
        "CONTRACT_VIOLATION",
        `Contract version drift: expected ${REQUIRED_CONTRACT_VERSION}, received ${payload.meta.contract_version}.`,
      );
    }

    if (payload.ok) {
      validateResponseContract(path, payload.data, contract.sessionId);
      await recordContractAuditEntry(path, options, payload.data, contract.sessionId ?? null);
    }

    return payload as ApiResponse<T>;
  } catch (error) {
    if (error instanceof ContractViolationError || error instanceof ControlledUiValidationError) {
      const contractError = normalizeContractError(error, path);
      recordApiContractIssue(contractError.path, contractError.code, contractError.message);
      throw contractError;
    }

    return {
      ok: false,
      data: null,
      error: {
        code: "TRANSPORT_ERROR",
        message: "TRANSPORT_ERROR",
        retryable: true,
      },
      meta: {
        version: REQUIRED_BACKEND_VERSION,
        contract_version: REQUIRED_CONTRACT_VERSION,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
