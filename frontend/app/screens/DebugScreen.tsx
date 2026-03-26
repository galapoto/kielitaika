import { useEffect, useState } from "react";
import { Bug, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { clearDebugLogs, DEBUG_LOG_EVENT, listDebugLogs, type DebugLogEntry } from "../services/debugLogger";

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function DebugScreen() {
  const [logs, setLogs] = useState<DebugLogEntry[]>(() => listDebugLogs());

  useEffect(() => {
    function refreshLogs() {
      setLogs(listDebugLogs());
    }

    refreshLogs();
    window.addEventListener(DEBUG_LOG_EVENT, refreshLogs);
    window.addEventListener("storage", refreshLogs);
    return () => {
      window.removeEventListener(DEBUG_LOG_EVENT, refreshLogs);
      window.removeEventListener("storage", refreshLogs);
    };
  }, []);

  return (
    <ScreenScaffold
      className="debug-screen"
      header={
        <div className="screen-heading">
          <span className="eyebrow">Debug Logs</span>
          <h1 className="hero-title">Track navigation, errors, and failed requests</h1>
          <p className="hero-subtitle">This screen keeps a local record of console output, route changes, API failures, and runtime issues.</p>
        </div>
      }
      actions={
        <div className="actions-row">
          <Button tone="secondary" onClick={() => setLogs(listDebugLogs())}>
            <RefreshCw size={16} aria-hidden="true" />
            Refresh logs
          </Button>
          <Button
            tone="ghost"
            onClick={() => {
              clearDebugLogs();
              setLogs([]);
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
            Clear logs
          </Button>
        </div>
      }
    >
      <Panel className="primary-card">
        <div className="debug-summary-grid">
          <div className="meta-item">
            <span className="eyebrow">Entries</span>
            <strong>{logs.length}</strong>
            <p className="muted">Persisted in local storage for this browser.</p>
          </div>
          <div className="meta-item">
            <span className="eyebrow">Categories</span>
            <strong>Console / Navigation / API / Runtime</strong>
            <p className="muted">Use this view to confirm failed requests and screen transitions.</p>
          </div>
        </div>
      </Panel>

      <Panel className="secondary-card" title="Event Stream" subtitle="Newest events appear first.">
        {logs.length ? (
          <div className="debug-log-list">
            {logs.map((entry) => (
              <article key={entry.id} className={`debug-log-card debug-log-${entry.level}`.trim()}>
                <div className="debug-log-header">
                  <span className="debug-log-badge">{entry.category}</span>
                  <span className="muted">{formatTime(entry.timestamp)}</span>
                </div>
                <strong>{entry.message}</strong>
                {entry.details ? <pre className="json-preview debug-log-details">{JSON.stringify(entry.details, null, 2)}</pre> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Bug size={20} aria-hidden="true" />
            <p>No logs captured yet.</p>
          </div>
        )}
      </Panel>
    </ScreenScaffold>
  );
}
