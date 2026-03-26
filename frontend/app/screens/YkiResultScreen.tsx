import { useEffect, useState } from "react";

import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import { fetchYkiCertificate } from "../services/ykiService";

function activeSectionLabel(runtime: any): string {
  const section = runtime?.metadata?.timing?.active_section;
  if (!section) {
    return "Completed";
  }
  return String(section)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function YkiResultScreen(props: {
  runtime: any | null;
  onBackToIntro: () => void;
}) {
  const [certificate, setCertificate] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCertificate(null);
    setError(null);
  }, [props.runtime?.session_id]);

  async function loadCertificate() {
    if (!props.runtime) {
      return;
    }
    setBusy(true);
    setError(null);
    const response = await fetchYkiCertificate(props.runtime.session_id);
    if (response.ok) {
      setCertificate(response.data);
    } else {
      setError(response.error.message);
    }
    setBusy(false);
  }

  return (
    <div className="screen-stack yki-flow-screen">
      <Panel className="flow-panel">
        <span className="eyebrow">YKI Result</span>
        <h1 className="hero-title">Exam flow complete</h1>
        <p className="hero-subtitle">The runtime has moved out of the active screen. Review the result summary here or return to the intro screen.</p>

        {props.runtime ? (
          <div className="meta-grid">
            <div className="meta-item">
              <span className="eyebrow">Session</span>
              <strong>{props.runtime.session_id}</strong>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Section</span>
              <strong>{activeSectionLabel(props.runtime)}</strong>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Runtime schema</span>
              <strong>{props.runtime.runtime_schema_version || "unknown"}</strong>
            </div>
          </div>
        ) : null}

        {error ? <div className="flow-error-card">{error}</div> : null}

        {certificate ? <pre className="json-preview">{JSON.stringify(certificate, null, 2)}</pre> : null}

        <div className="actions-row">
          <Button tone="secondary" onClick={props.onBackToIntro}>
            Back to YKI home
          </Button>
          {props.runtime ? (
            <Button onClick={loadCertificate} disabled={busy}>
              {busy ? "Loading..." : "Load certificate"}
            </Button>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
