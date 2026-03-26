import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import type { AuthUser, SubscriptionStatus, RouteKey } from "../state/types";

const features: Array<{ route: RouteKey; title: string; description: string }> = [
  { route: "cards", title: "Cards", description: "Contract-bound card sessions with session isolation and answer validation." },
  { route: "roleplay", title: "Roleplay", description: "Fixed-turn roleplay driven by backend progress and review endpoints." },
  { route: "voice", title: "Voice", description: "User-controlled microphone capture, STT upload, and pronunciation feedback." },
  { route: "yki", title: "YKI Exam", description: "Runtime-sequenced exam screens rendered directly from adapter payloads." },
];

export function DashboardScreen(props: {
  user: AuthUser;
  subscription: SubscriptionStatus | null;
  onRouteChange: (route: RouteKey) => void;
}) {
  const ykiFeature = props.subscription?.features?.yki;

  return (
    <div className="screen-stack">
      <div className="hero-grid">
        <Panel className="hero-banner">
          <span className="eyebrow">Authenticated shell</span>
          <h1 className="hero-title">Welcome back, {props.user.name || props.user.email}.</h1>
          <p className="hero-subtitle">
            The frontend is rendering backend-owned state only. Protected navigation stays blocked until auth and subscription are both resolved.
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
          <Panel key={feature.route} className="feature-card">
            <strong>{feature.title}</strong>
            <p className="muted">{feature.description}</p>
            <Button onClick={() => props.onRouteChange(feature.route)}>Open {feature.title}</Button>
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
