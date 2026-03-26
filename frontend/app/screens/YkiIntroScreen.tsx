import { useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { StatusBanner } from "../components/StatusBanner";
import type { SubscriptionStatus } from "../state/types";
import { startYkiSession } from "../services/ykiService";

const LEVEL_OPTIONS = [
  { key: "A1_A2", label: "A1-A2", description: "Perustaso" },
  { key: "B1_B2", label: "B1-B2", description: "Keskitaso" },
  { key: "C1_C2", label: "C1-C2", description: "Ylin taso" },
] as const;

export function YkiIntroScreen(props: {
  restoredRuntime: any | null;
  subscription: SubscriptionStatus | null;
  onResume: () => void;
  onStarted: (runtime: any, levelBand: "A1_A2" | "B1_B2" | "C1_C2") => void;
}) {
  const [levelBand, setLevelBand] = useState<"A1_A2" | "B1_B2" | "C1_C2">("B1_B2");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentLevel = useMemo(
    () => LEVEL_OPTIONS.find((item) => item.key === levelBand) ?? LEVEL_OPTIONS[1],
    [levelBand],
  );

  async function start() {
    setBusy(true);
    setError(null);
    const response = await startYkiSession({ level_band: levelBand });
    if (!response.ok) {
      setError(response.error.message);
      setBusy(false);
      return;
    }
    props.onStarted(response.data.runtime, levelBand);
    setBusy(false);
  }

  return (
    <ScreenScaffold
      className="yki-flow-screen"
      header={
        <div className="screen-heading">
          <span className="eyebrow">YKI Exam</span>
          <h1 className="hero-title">Prepare for your YKI exam</h1>
          <p className="hero-subtitle">Choose your level, review your access, and continue into the next exam stage when you are ready.</p>
        </div>
      }
      actions={
        <div className="actions-row">
          <Button onClick={start} disabled={busy}>
            <Play size={16} aria-hidden="true" />
            {busy ? "Starting..." : "Start exam"}
          </Button>
          {props.restoredRuntime ? (
            <Button tone="secondary" onClick={props.onResume} disabled={busy}>
              <RotateCcw size={16} aria-hidden="true" />
              Continue saved exam
            </Button>
          ) : null}
        </div>
      }
    >
      <Panel className="flow-panel yki-intro-panel primary-card">
        <span className="eyebrow">Exam overview</span>
        <p className="hero-subtitle">
          Move through the exam one stage at a time. You can start fresh or continue from your saved progress.
        </p>

        <div className="meta-grid">
          <div className="meta-item">
            <span className="eyebrow">Access</span>
            <strong>{props.subscription?.features?.yki?.available ? "Enabled" : "Blocked"}</strong>
            <p className="muted">{props.subscription?.features?.yki?.message || "Subscription status not loaded yet."}</p>
          </div>
          <div className="meta-item">
            <span className="eyebrow">Selected level</span>
            <strong>{currentLevel.label}</strong>
            <p className="muted">{currentLevel.description}</p>
          </div>
          <div className="meta-item">
            <span className="eyebrow">Resume</span>
            <strong>{props.restoredRuntime ? "Available" : "None"}</strong>
            <p className="muted">{props.restoredRuntime ? "You can continue from your saved exam." : "No saved exam was found for this account."}</p>
          </div>
        </div>

        <div className="level-selector">
          {LEVEL_OPTIONS.map((option) => {
            const active = option.key === levelBand;
            return (
              <button
                key={option.key}
                type="button"
                className={`level-card ${active ? "active" : ""}`.trim()}
                onClick={() => setLevelBand(option.key)}
                disabled={busy}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            );
          })}
        </div>

        {error ? <StatusBanner tone="error" title="Exam unavailable" message={error} /> : null}
      </Panel>
    </ScreenScaffold>
  );
}
