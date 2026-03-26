import { isPersistedAuthSession, isRoleplaySessionCache, isYkiRuntimeCache } from "./contractGuard";
import type { PersistedAuthSession, RoleplaySessionCache, YkiRuntimeCache } from "../state/types";

export const AUTH_STORAGE_KEY = "kt.auth.session.v1";
export const ROLEPLAY_PREFIX = "kt.session.roleplay.v1::";
export const YKI_PREFIX = "kt.session.yki_runtime.v1::";

function hasWindow(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeRead(value: string | null): unknown | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function loadAuthSession(): PersistedAuthSession | null {
  if (!hasWindow()) {
    return null;
  }
  const payload = safeRead(window.localStorage.getItem(AUTH_STORAGE_KEY));
  if (isPersistedAuthSession(payload)) {
    return payload;
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  return null;
}

export function saveAuthSession(session: PersistedAuthSession): void {
  if (!hasWindow()) {
    return;
  }
  if (!isPersistedAuthSession(session)) {
    console.error("Rejected incomplete auth session cache payload.");
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function listRoleplayCaches(): RoleplaySessionCache[] {
  if (!hasWindow()) {
    return [];
  }
  return Object.keys(window.localStorage)
    .filter((key) => key.startsWith(ROLEPLAY_PREFIX))
    .map((key) => ({ key, value: safeRead(window.localStorage.getItem(key)) }))
    .map((entry) => {
      if (isRoleplaySessionCache(entry.value)) {
        return entry.value;
      }
      window.localStorage.removeItem(entry.key);
      return null;
    })
    .filter((value): value is RoleplaySessionCache => Boolean(value));
}

export function saveRoleplayCache(cache: RoleplaySessionCache): void {
  if (!hasWindow()) {
    return;
  }
  if (!isRoleplaySessionCache(cache)) {
    console.error("Rejected incomplete roleplay cache payload.");
    return;
  }
  window.localStorage.setItem(`${ROLEPLAY_PREFIX}${cache.roleplay_session_id}`, JSON.stringify(cache));
}

export function removeRoleplayCache(roleplaySessionId: string): void {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.removeItem(`${ROLEPLAY_PREFIX}${roleplaySessionId}`);
}

export function listYkiCaches(): YkiRuntimeCache[] {
  if (!hasWindow()) {
    return [];
  }
  return Object.keys(window.localStorage)
    .filter((key) => key.startsWith(YKI_PREFIX))
    .map((key) => ({ key, value: safeRead(window.localStorage.getItem(key)) }))
    .map((entry) => {
      if (isYkiRuntimeCache(entry.value)) {
        return entry.value;
      }
      window.localStorage.removeItem(entry.key);
      return null;
    })
    .filter((value): value is YkiRuntimeCache => Boolean(value));
}

export function saveYkiCache(cache: YkiRuntimeCache): void {
  if (!hasWindow()) {
    return;
  }
  if (!isYkiRuntimeCache(cache)) {
    console.error("Rejected incomplete YKI cache payload.");
    return;
  }
  window.localStorage.setItem(`${YKI_PREFIX}${cache.exam_session_id}`, JSON.stringify(cache));
}

export function removeYkiCache(examSessionId: string): void {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.removeItem(`${YKI_PREFIX}${examSessionId}`);
}
