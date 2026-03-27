import { useEffect, useState } from "react";
import { Award, CircleCheckBig, RefreshCw, RotateCcw } from "lucide-react";

import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { StatusBanner } from "../components/StatusBanner";
import { fetchYkiCertificate } from "../services/ykiService";

function activeSectionLabel(runtime: any): string {
  const sections = Array.isArray(runtime?.sections) ? runtime.sections : [];
  const section = sections.length ? sections[sections.length - 1]?.section_type : null;
  if (!section || typeof section !== "string") {
    return "Completed";
  }
  return String(section)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summarizeCertificate(certificate: any): Array<{ label: string; value: string }> {
  if (!certificate || typeof certificate !== "object") {
    return [];
  }
  const candidates: Array<{ label: string; value: unknown }> = [
    { label: "Overall result", value: certificate.result || certificate.overall_result || certificate.summary },
    { label: "Level", value: certificate.level || certificate.level_band || certificate.assessed_level },
    { label: "Listening", value: certificate.listening || certificate.listening_result },
    { label: "Reading", value: certificate.reading || certificate.reading_result },
    { label: "Writing", value: certificate.writing || certificate.writing_result },
    { label: "Speaking", value: certificate.speaking || certificate.speaking_result },
  ];
  return candidates
    .filter((item) => typeof item.value === "string" && item.value.trim().length > 0)
    .map((item) => ({ label: item.label, value: String(item.value) }));
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
    <ScreenScaffold
      className="yki-flow-screen"
      header={
        <div className="screen-heading">
          <span className="eyebrow">YKI Results</span>
          <h1 className="hero-title">Your exam is complete</h1>
          <p className="hero-subtitle">Review your result summary here, then start another exam whenever you are ready.</p>
        </div>
      }
      actions={
        <div className="actions-row">
          <Button tone="secondary" onClick={props.onBackToIntro}>
            <RotateCcw size={16} aria-hidden="true" />
            Start another exam
          </Button>
          {props.runtime ? (
            <Button onClick={loadCertificate} disabled={busy}>
              <RefreshCw size={16} aria-hidden="true" />
              {busy ? "Loading..." : "Load results"}
            </Button>
          ) : null}
        </div>
      }
    >
      <Panel className="flow-panel primary-card">
        <span className="eyebrow">Result summary</span>
        <p className="hero-subtitle">This screen gives you the final overview after the exam flow ends.</p>

        {props.runtime ? (
          <div className="meta-grid">
            <div className="meta-item">
              <span className="eyebrow">Exam status</span>
              <strong>
                <CircleCheckBig size={16} aria-hidden="true" /> Complete
              </strong>
              <p className="muted">Your exam session has finished successfully.</p>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Last section</span>
              <strong>
                <Award size={16} aria-hidden="true" /> {activeSectionLabel(props.runtime)}
              </strong>
              <p className="muted">This was the final stage shown before your result summary.</p>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Next step</span>
              <strong>
                <RefreshCw size={16} aria-hidden="true" /> Review and restart
              </strong>
              <p className="muted">Load your result summary below or return to the exam home screen.</p>
            </div>
          </div>
        ) : null}

        {error ? <StatusBanner tone="error" title="Result error" message={error} /> : null}

        {certificate ? (
          <div className="debug-summary-grid">
            {summarizeCertificate(certificate).length ? (
              summarizeCertificate(certificate).map((item) => (
                <div className="meta-item" key={item.label}>
                  <span className="eyebrow">{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))
            ) : (
              <div className="meta-item">
                <span className="eyebrow">Result ready</span>
                <strong>
                  <Award size={16} aria-hidden="true" /> Summary loaded
                </strong>
                <p className="muted">Your result information is available for this completed exam.</p>
              </div>
            )}
          </div>
        ) : null}
      </Panel>
    </ScreenScaffold>
  );
}
