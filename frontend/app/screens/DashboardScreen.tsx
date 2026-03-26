import { ArrowRight, Compass, Sparkles } from "lucide-react";

import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import { ScreenScaffold } from "../components/ScreenScaffold";
import type { AppScreen, AuthUser, SubscriptionStatus } from "../state/types";

export function DashboardScreen(props: {
  user: AuthUser;
  subscription: SubscriptionStatus | null;
  onScreenChange: (screen: AppScreen) => void;
}) {
  return (
    <ScreenScaffold
      className="dashboard-screen"
      header={
        <div className="screen-heading">
          <span className="eyebrow">Home</span>
          <h1 className="hero-title">Welcome to KieliTaika</h1>
          <p className="hero-subtitle">Master Finnish through focused practice, guided conversation, and exam preparation inside one clear learning path at a time.</p>
        </div>
      }
      actions={
        <div className="actions-row">
          <Button onClick={() => props.onScreenChange("practice")}>
            <ArrowRight size={16} aria-hidden="true" />
            Start learning
          </Button>
        </div>
      }
    >
      <Panel className="dashboard-surface">
        <div className="dashboard-hero-block">
          <div className="feature-card">
            <span className="eyebrow">Your learning space</span>
            <h2>{props.user.name || props.user.email}</h2>
            <p className="hero-subtitle">Use the sidebar to choose one destination, then keep moving forward inside that focused screen.</p>
          </div>
          <div className="dashboard-meta-grid">
            <div className="meta-item">
              <span className="eyebrow">Focus</span>
              <strong>
                <Sparkles size={16} aria-hidden="true" /> One purpose
              </strong>
              <p className="muted">Each screen keeps one clear task in front of you.</p>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Navigation</span>
              <strong>
                <Compass size={16} aria-hidden="true" /> Sidebar only
              </strong>
              <p className="muted">Move between practice, conversation, YKI, and settings from the left menu.</p>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Direction</span>
              <strong>
                <ArrowRight size={16} aria-hidden="true" /> Keep moving
              </strong>
              <p className="muted">Start with practice, then use the sidebar whenever you want to switch to a different learning path.</p>
            </div>
          </div>
        </div>
      </Panel>
    </ScreenScaffold>
  );
}
