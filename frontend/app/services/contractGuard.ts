import type { ApiEnvelope, PersistedAuthSession, RoleplaySessionCache, YkiRuntimeCache } from "../state/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isMeta(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNonEmptyString(value.request_id) &&
    isNonEmptyString(value.timestamp) &&
    value.api_version === "v1"
  );
}

function isErrorPayload(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNonEmptyString(value.code) &&
    typeof value.message === "string" &&
    typeof value.retryable === "boolean" &&
    "details" in value
  );
}

export function createClientErrorEnvelope(
  code: string,
  message: string,
  retryable: boolean,
  details: unknown = null,
): ApiEnvelope<never> {
  return {
    ok: false,
    data: null,
    error: {
      code,
      message,
      retryable,
      details,
    },
    meta: {
      request_id: "local-contract-guard",
      timestamp: new Date().toISOString(),
      api_version: "v1",
    },
  };
}

export function assertApiEnvelope<T>(value: unknown): ApiEnvelope<T> {
  if (!isRecord(value) || !("ok" in value) || !("data" in value) || !("error" in value) || !("meta" in value)) {
    throw new Error("API envelope is missing ok/data/error/meta.");
  }
  if (!isMeta(value.meta)) {
    throw new Error("API envelope meta is invalid.");
  }
  if (value.ok === true) {
    if (value.error !== null) {
      throw new Error("Successful API envelope must have error=null.");
    }
    if (typeof value.data === "undefined") {
      throw new Error("Successful API envelope is missing data.");
    }
    return value as ApiEnvelope<T>;
  }
  if (value.ok === false) {
    if (value.data !== null) {
      throw new Error("Failed API envelope must have data=null.");
    }
    if (!isErrorPayload(value.error)) {
      throw new Error("Failed API envelope error payload is invalid.");
    }
    return value as ApiEnvelope<T>;
  }
  throw new Error("API envelope ok flag is invalid.");
}

export function isPersistedAuthSession(value: unknown): value is PersistedAuthSession {
  if (!isRecord(value) || value.schema_version !== "1") {
    return false;
  }
  if (
    !isRecord(value.tokens) ||
    !isNonEmptyString(value.tokens.access_token) ||
    !isNonEmptyString(value.tokens.refresh_token) ||
    value.tokens.token_type !== "Bearer" ||
    !isNonEmptyString(value.tokens.access_expires_at) ||
    !isNonEmptyString(value.tokens.refresh_expires_at) ||
    !isNonEmptyString(value.tokens.auth_session_id) ||
    !isNonEmptyString(value.restored_at)
  ) {
    return false;
  }
  if (!isRecord(value.auth_user)) {
    return false;
  }
  return (
    isNonEmptyString(value.auth_user.user_id) &&
    isNonEmptyString(value.auth_user.email) &&
    (value.auth_user.name === null || typeof value.auth_user.name === "string") &&
    isNonEmptyString(value.auth_user.subscription_tier)
  );
}

export function isYkiRuntimeCache(value: unknown): value is YkiRuntimeCache {
  return (
    isRecord(value) &&
    value.schema_version === "1" &&
    isNonEmptyString(value.exam_session_id) &&
    (value.level_band === "A1_A2" || value.level_band === "B1_B2" || value.level_band === "C1_C2") &&
    isNonEmptyString(value.current_screen_key) &&
    isNonEmptyString(value.runtime_contract_version) &&
    isRecord(value.answers) &&
    isNonEmptyString(value.saved_at)
  );
}

export function isRoleplaySessionCache(value: unknown): value is RoleplaySessionCache {
  return (
    isRecord(value) &&
    value.schema_version === "1" &&
    isNonEmptyString(value.roleplay_session_id) &&
    isNonEmptyString(value.speaking_session_id) &&
    (value.state === "created" ||
      value.state === "active" ||
      value.state === "awaiting_ai" ||
      value.state === "completed" ||
      value.state === "expired" ||
      value.state === "abandoned") &&
    typeof value.turn_count === "number" &&
    Number.isInteger(value.turn_count) &&
    value.turn_count >= 0 &&
    value.turn_count <= 5 &&
    isNonEmptyString(value.expires_at) &&
    isNonEmptyString(value.last_synced_at)
  );
}
