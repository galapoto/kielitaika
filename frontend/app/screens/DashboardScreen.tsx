import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import type { AppScreen, AuthUser, SubscriptionStatus } from "../state/types";

const features: Array<{ screen: AppScreen; title: string; description: string }> = [
  { screen: "practice", title: "Practice", description: "Vocabulary, grammar, and phrase practice now live under one isolated screen." },
  { screen: "conversation", title: "Conversation", description: "Fixed-turn conversation runtime driven by backend progress and review endpoints." },
  { screen: "yki_intro", title: "YKI Exam", description: "Entry screen -> runtime -> result. Only one YKI screen stays active at a time." },
  { screen: "professional", title: "Professional Finnish", description: "Work-oriented speaking, pronunciation, and transcript tools." },
  { screen: "settings", title: "Settings", description: "Profile and subscription details in a dedicated settings screen." },
];

export function DashboardScreen(props: {
  user: AuthUser;
  subscription: SubscriptionStatus | null;
  onScreenChange: (screen: AppScreen) => void;
}) {
  const ykiFeature = props.subscription?.features?.yki;

  return (
    <div className="screen-stack">
      <div className="hero-grid">
        <Panel className="hero-banner">
          <span className="eyebrow">Active screen shell</span>
          <h1 className="hero-title">Welcome back, {props.user.name || props.user.email}.</h1>
          <p className="hero-subtitle">
            The app now routes through one active screen at a time. Start YKI from its intro screen, continue in runtime, and finish on the result screen.
          </p>
        </Panel>
        <Panel>
          <div className="screen-hero">
            <div>
              <span className="eyebrow">Tier</span>
              <h2>{props.subscription?.tier || props.user.subscription_tier}</h2>
              <p className="muted">{ykiFeature?.message || "Subscription status not loaded yet."}</p>
            </div>
            <div className="progress-ring">
              <div>
                <strong>{props.subscription?.is_active ? "ON" : "OFF"}</strong>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="dashboard-grid">
        {features.map((feature) => (
          <Panel key={feature.screen} className="feature-card">
            <strong>{feature.title}</strong>
            <p className="muted">{feature.description}</p>
            <Button onClick={() => props.onScreenChange(feature.screen)}>Open {feature.title}</Button>
          </Panel>
        ))}
      </div>

      <Panel title="Entitlements" subtitle="Direct rendering of /subscription/status feature map.">
        <div className="meta-grid">
          {Object.entries(props.subscription?.features || {}).map(([key, value]) => (
            <div className="meta-item" key={key}>
              <span className="eyebrow">{key}</span>
              <strong>{value.available ? "Available" : "Locked"}</strong>
              <p className="muted">
                {value.message} ({value.limit} {value.unit})
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
