import type { ReactNode } from "react";
import { Component } from "react";

import { logger } from "@core/logging/logger";
import ApplicationErrorScreen from "@ui/screens/ApplicationErrorScreen";

type ErrorKind = "CONTRACT_ERROR" | "RUNTIME_ERROR" | "TRANSPORT_ERROR";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
  errorKind: ErrorKind | null;
  timestamp: string | null;
};

function classifyError(error: Error): ErrorKind {
  const message = `${error.name} ${error.message}`.toUpperCase();

  if (
    message.includes("CONTRACT_VIOLATION") ||
    message.includes("GOVERNANCE_MISSING") ||
    message.includes("CONTRACTVIOLATIONERROR") ||
    message.includes("CONTROLLEDUIVALIDATIONERROR")
  ) {
    return "CONTRACT_ERROR";
  }

  if (message.includes("TRANSPORT_ERROR")) {
    return "TRANSPORT_ERROR";
  }

  return "RUNTIME_ERROR";
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
    errorKind: null,
    timestamp: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      error,
      errorKind: classifyError(error),
      timestamp: new Date().toISOString(),
    };
  }

  componentDidCatch(error: Error) {
    logger.critical("Unhandled runtime error reached the app boundary.", {
      actionType: "ERROR_BOUNDARY",
      currentScreen: logger.getCurrentScreen(),
      lastUserAction: logger.getLastUserAction(),
    });
    logger.setLastUserAction(`boundary:${error.name}`);
  }

  handleRetry = () => {
    this.setState({
      error: null,
      errorKind: null,
    });
  };

  render() {
    if (this.state.error && this.state.errorKind) {
      return (
        <ApplicationErrorScreen
          code={this.state.errorKind}
          message={this.state.error.message || "Unhandled runtime failure."}
          onPrimaryAction={this.handleRetry}
          primaryLabel="Retry App"
          traceReference={[
            `Screen: ${logger.getCurrentScreen() ?? "unknown"}`,
            `Timestamp: ${this.state.timestamp ?? "unknown"}`,
            `Last action: ${logger.getLastUserAction() ?? "unknown"}`,
          ].join("\n")}
        />
      );
    }

    return this.props.children;
  }
}
