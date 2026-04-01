export type LogLevel = "CRITICAL" | "ERROR" | "INFO" | "WARN";

type LogContext = {
  actionType?: string | null;
  currentScreen?: string | null;
  endpoint?: string | null;
  lastUserAction?: string | null;
  retryable?: boolean | null;
  statusCode?: number | null;
};

type LogEntry = {
  context: LogContext;
  level: LogLevel;
  message: string;
  timestamp: string;
};

const MAX_LOG_ENTRIES = 100;

let currentScreen: string | null = null;
let lastUserAction: string | null = null;
const entries: LogEntry[] = [];

function writeConsole(level: LogLevel, payload: LogEntry) {
  if (level === "CRITICAL" || level === "ERROR") {
    console.error(payload.message, payload.context);
    return;
  }

  if (level === "WARN") {
    console.warn(payload.message, payload.context);
    return;
  }

  console.info(payload.message, payload.context);
}

function push(level: LogLevel, message: string, context: LogContext = {}) {
  const entry: LogEntry = {
    context: {
      currentScreen,
      lastUserAction,
      ...context,
    },
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  entries.push(entry);
  if (entries.length > MAX_LOG_ENTRIES) {
    entries.splice(0, entries.length - MAX_LOG_ENTRIES);
  }

  writeConsole(level, entry);
  return entry;
}

export const logger = {
  critical(message: string, context?: LogContext) {
    return push("CRITICAL", message, context);
  },
  error(message: string, context?: LogContext) {
    return push("ERROR", message, context);
  },
  info(message: string, context?: LogContext) {
    return push("INFO", message, context);
  },
  warn(message: string, context?: LogContext) {
    return push("WARN", message, context);
  },
  setCurrentScreen(screen: string | null) {
    currentScreen = screen;
  },
  getCurrentScreen() {
    return currentScreen;
  },
  setLastUserAction(action: string | null) {
    lastUserAction = action;
  },
  getLastUserAction() {
    return lastUserAction;
  },
  getRecentEntries() {
    return [...entries];
  },
};
