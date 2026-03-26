const DEBUG_LOG_STORAGE_KEY = "kt.debug.logs.v1";
const DEBUG_LOG_EVENT = "kt-debug-log-update";
const MAX_DEBUG_LOGS = 250;

export type DebugLogLevel = "log" | "info" | "warn" | "error";
export type DebugLogCategory = "console" | "navigation" | "api" | "runtime";

export type DebugLogEntry = {
  id: string;
  timestamp: string;
  level: DebugLogLevel;
  category: DebugLogCategory;
  message: string;
  details: unknown;
};

let loggingInstalled = false;

function hasWindow(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function toSerializable(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack || null,
    };
  }
  if (value === undefined) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

function readLogs(): DebugLogEntry[] {
  if (!hasWindow()) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(DEBUG_LOG_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((entry): entry is DebugLogEntry => {
      return Boolean(
        entry &&
          typeof entry === "object" &&
          typeof entry.id === "string" &&
          typeof entry.timestamp === "string" &&
          typeof entry.level === "string" &&
          typeof entry.category === "string" &&
          typeof entry.message === "string",
      );
    });
  } catch {
    return [];
  }
}

function writeLogs(entries: DebugLogEntry[]): void {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.setItem(DEBUG_LOG_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_DEBUG_LOGS)));
  window.dispatchEvent(new CustomEvent(DEBUG_LOG_EVENT));
}

function appendLog(entry: Omit<DebugLogEntry, "id" | "timestamp">): void {
  const logs = readLogs();
  logs.unshift({
    ...entry,
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
  });
  writeLogs(logs);
}

function formatConsoleArgs(args: unknown[]): { message: string; details: unknown } {
  const message = args
    .map((arg) => {
      if (typeof arg === "string") {
        return arg;
      }
      if (arg instanceof Error) {
        return arg.message;
      }
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(" ")
    .trim();

  return {
    message: message || "Console event",
    details: args.map((arg) => toSerializable(arg)),
  };
}

export function listDebugLogs(): DebugLogEntry[] {
  return readLogs();
}

export function clearDebugLogs(): void {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.removeItem(DEBUG_LOG_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(DEBUG_LOG_EVENT));
}

export function logDebugEvent(level: DebugLogLevel, category: DebugLogCategory, message: string, details?: unknown): void {
  appendLog({
    level,
    category,
    message,
    details: toSerializable(details),
  });
}

export function logNavigationEvent(message: string, details?: unknown): void {
  logDebugEvent("info", "navigation", message, details);
}

export function logApiFailure(path: string, details?: unknown): void {
  logDebugEvent("error", "api", `API request failed for ${path}`, details);
}

export function installDebugLogging(): void {
  if (loggingInstalled || !hasWindow()) {
    return;
  }
  loggingInstalled = true;

  const originalConsole = {
    log: window.console.log.bind(window.console),
    info: window.console.info.bind(window.console),
    warn: window.console.warn.bind(window.console),
    error: window.console.error.bind(window.console),
  };

  const methods: DebugLogLevel[] = ["log", "info", "warn", "error"];
  for (const method of methods) {
    window.console[method] = (...args: unknown[]) => {
      const formatted = formatConsoleArgs(args);
      appendLog({
        level: method,
        category: "console",
        message: formatted.message,
        details: formatted.details,
      });
      originalConsole[method](...args);
    };
  }

  window.addEventListener("error", (event) => {
    appendLog({
      level: "error",
      category: "runtime",
      message: event.message || "Unhandled runtime error",
      details: {
        filename: event.filename || null,
        line: event.lineno || null,
        column: event.colno || null,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    appendLog({
      level: "error",
      category: "runtime",
      message: "Unhandled promise rejection",
      details: toSerializable(event.reason),
    });
  });
}

export { DEBUG_LOG_EVENT };
