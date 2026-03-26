import React from "react";

import { Panel } from "./Panel";
import { StatusBanner } from "./StatusBanner";

type BoundaryState = {
  error: {
    source: string;
    message: string;
    details: string | null;
  } | null;
};

export class GlobalErrorBoundary extends React.Component<React.PropsWithChildren, BoundaryState> {
  state: BoundaryState = { error: null };

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Render error boundary triggered", error, info);
    this.setState({
      error: {
        source: "render",
        message: error.message || "Unhandled render failure.",
        details: info.componentStack || null,
      },
    });
  }

  handleWindowError = (event: ErrorEvent) => {
    console.error("Window error captured", event.error || event.message);
    this.setState({
      error: {
        source: "window",
        message: event.error?.message || event.message || "Unhandled window error.",
        details: event.error?.stack || null,
      },
    });
  };

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason ?? "Unhandled promise rejection."));
    console.error("Unhandled promise rejection captured", reason);
    this.setState({
      error: {
        source: "promise",
        message: reason.message,
        details: reason.stack || null,
      },
    });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="auth-shell">
        <Panel className="auth-card" title="Application Guardrail Triggered" subtitle="Unhandled failures are surfaced instead of being hidden.">
          <StatusBanner tone="error" title={this.state.error.source.toUpperCase()} message={this.state.error.message} />
          {this.state.error.details ? (
            <pre className="json-preview json-preview-wrap">
              {this.state.error.details}
            </pre>
          ) : null}
        </Panel>
      </div>
    );
  }
}
