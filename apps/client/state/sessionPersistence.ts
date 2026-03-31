import { storageService } from "@core/services/storageService";

import type { GuardedScreen, RequestedScreen } from "./navigationModel";

const STORAGE_FORMAT = "kielitaika.runtime.session";
const STORAGE_VERSION = 1;
const NAVIGATION_STATE_KEY = "runtime_navigation_state";
const LEARNING_SESSION_KEY = "runtime_learning_session";
const YKI_SESSION_KEY = "yki_practice_session_id";

type PersistedEnvelopeKind = "learning" | "navigation" | "yki";

type PersistedEnvelopeBase = {
  format: typeof STORAGE_FORMAT;
  savedAt: string;
  version: typeof STORAGE_VERSION;
};

type PersistedNavigationState = PersistedEnvelopeBase & {
  activeScreen: GuardedScreen;
  kind: "navigation";
  navigationStack: GuardedScreen[];
  requestedScreen: RequestedScreen;
  ykiSessionId: string | null;
};

type PersistedLearningSession = PersistedEnvelopeBase & {
  decisionVersion: string;
  governanceStatus: "governed" | "legacy_uncontrolled";
  governanceVersion: string;
  kind: "learning";
  policyVersion: string;
};

type PersistedYkiSession = PersistedEnvelopeBase & {
  currentTaskIndex: number;
  decisionVersion: string;
  governanceVersion: string;
  isComplete: boolean;
  kind: "yki";
  policyVersion: string;
  sessionId: string;
  sessionHash: string;
  taskSequenceHash: string;
};

type PersistedEnvelope = PersistedLearningSession | PersistedNavigationState | PersistedYkiSession;

type PersistedStateResult<T extends PersistedEnvelope> =
  | {
      reason: null;
      status: "missing" | "valid";
      value: T | null;
    }
  | {
      reason: "corrupted" | "outdated";
      status: "invalid";
      value: null;
    };

function createEnvelope<T extends PersistedEnvelopeKind, V extends Record<string, unknown>>(
  kind: T,
  value: V,
): PersistedEnvelopeBase & { kind: T } & V {
  return {
    format: STORAGE_FORMAT,
    kind,
    savedAt: new Date().toISOString(),
    version: STORAGE_VERSION,
    ...value,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isGuardedScreen(value: unknown): value is GuardedScreen {
  return value === "auth" || value === "home" || value === "learning" || value === "yki-practice";
}

function isRequestedScreen(value: unknown): value is RequestedScreen {
  return value === "auth" || value === "learning" || value === "root" || value === "yki-practice";
}

function hasVersionedEnvelope(
  value: unknown,
  kind: PersistedEnvelopeKind,
): value is PersistedEnvelopeBase & { kind: PersistedEnvelopeKind } {
  return (
    isRecord(value) &&
    value.format === STORAGE_FORMAT &&
    value.kind === kind &&
    typeof value.savedAt === "string" &&
    typeof value.version === "number"
  );
}

function isPersistedNavigationState(value: unknown): value is PersistedNavigationState {
  if (!hasVersionedEnvelope(value, "navigation")) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    isGuardedScreen(record.activeScreen) &&
    isRequestedScreen(record.requestedScreen) &&
    Array.isArray(record.navigationStack) &&
    record.navigationStack.every(isGuardedScreen) &&
    (record.ykiSessionId === null || typeof record.ykiSessionId === "string")
  );
}

function isPersistedLearningSession(value: unknown): value is PersistedLearningSession {
  if (!hasVersionedEnvelope(value, "learning")) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.decisionVersion === "string" &&
    typeof record.policyVersion === "string" &&
    typeof record.governanceVersion === "string" &&
    (record.governanceStatus === "governed" || record.governanceStatus === "legacy_uncontrolled")
  );
}

function isPersistedYkiSession(value: unknown): value is PersistedYkiSession {
  if (!hasVersionedEnvelope(value, "yki")) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.sessionId === "string" &&
    typeof record.decisionVersion === "string" &&
    typeof record.policyVersion === "string" &&
    typeof record.governanceVersion === "string" &&
    typeof record.currentTaskIndex === "number" &&
    typeof record.isComplete === "boolean" &&
    typeof record.sessionHash === "string" &&
    typeof record.taskSequenceHash === "string"
  );
}

async function loadVersionedState<T extends PersistedEnvelope>(
  key: string,
  validator: (value: unknown) => value is T,
  kind: PersistedEnvelopeKind,
): Promise<PersistedStateResult<T>> {
  const inspected = await storageService.inspect(key);

  if (!inspected.ok) {
    return {
      reason: "corrupted",
      status: "invalid",
      value: null,
    };
  }

  if (inspected.value === null) {
    return {
      reason: null,
      status: "missing",
      value: null,
    };
  }

  if (!hasVersionedEnvelope(inspected.value, kind)) {
    return {
      reason: "outdated",
      status: "invalid",
      value: null,
    };
  }

  if (inspected.value.version !== STORAGE_VERSION) {
    return {
      reason: "outdated",
      status: "invalid",
      value: null,
    };
  }

  if (!validator(inspected.value)) {
    return {
      reason: "corrupted",
      status: "invalid",
      value: null,
    };
  }

  return {
    reason: null,
    status: "valid",
    value: inspected.value,
  };
}

export async function persistNavigationState(value: {
  activeScreen: GuardedScreen;
  navigationStack: GuardedScreen[];
  requestedScreen: RequestedScreen;
  ykiSessionId: string | null;
}) {
  await storageService.set(
    NAVIGATION_STATE_KEY,
    createEnvelope("navigation", {
      activeScreen: value.activeScreen,
      navigationStack: value.navigationStack,
      requestedScreen: value.requestedScreen,
      ykiSessionId: value.ykiSessionId,
    }),
  );
}

export async function loadPersistedNavigationState() {
  return loadVersionedState(NAVIGATION_STATE_KEY, isPersistedNavigationState, "navigation");
}

export async function clearPersistedNavigationState() {
  await storageService.remove(NAVIGATION_STATE_KEY);
}

export async function persistLearningSession(value: {
  decisionVersion: string;
  governanceStatus: "governed" | "legacy_uncontrolled";
  governanceVersion: string;
  policyVersion: string;
}) {
  await storageService.set(
    LEARNING_SESSION_KEY,
    createEnvelope("learning", {
      decisionVersion: value.decisionVersion,
      governanceStatus: value.governanceStatus,
      governanceVersion: value.governanceVersion,
      policyVersion: value.policyVersion,
    }),
  );
}

export async function loadPersistedLearningSession() {
  return loadVersionedState(LEARNING_SESSION_KEY, isPersistedLearningSession, "learning");
}

export async function clearPersistedLearningSession() {
  await storageService.remove(LEARNING_SESSION_KEY);
}

export async function persistYkiSession(value: {
  currentTaskIndex: number;
  decisionVersion: string;
  governanceVersion: string;
  isComplete: boolean;
  policyVersion: string;
  sessionId: string;
  sessionHash: string;
  taskSequenceHash: string;
}) {
  await storageService.set(
    YKI_SESSION_KEY,
    createEnvelope("yki", {
      currentTaskIndex: value.currentTaskIndex,
      decisionVersion: value.decisionVersion,
      governanceVersion: value.governanceVersion,
      isComplete: value.isComplete,
      policyVersion: value.policyVersion,
      sessionId: value.sessionId,
      sessionHash: value.sessionHash,
      taskSequenceHash: value.taskSequenceHash,
    }),
  );
}

export async function loadPersistedYkiSession() {
  return loadVersionedState(YKI_SESSION_KEY, isPersistedYkiSession, "yki");
}

export async function clearPersistedYkiSession() {
  await storageService.remove(YKI_SESSION_KEY);
}
