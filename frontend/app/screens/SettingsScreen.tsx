import { Panel } from "../components/Panel";
import type { AuthUser, SubscriptionStatus } from "../state/types";

export function SettingsScreen(props: { user: AuthUser; subscription: SubscriptionStatus | null }) {
  return (
    <div className="screen-stack">
      <Panel title="Settings" subtitle="Account-level settings stay isolated in their own screen.">
        <div className="meta-grid">
          <div className="meta-item">
            <span className="eyebrow">Name</span>
            <strong>{props.user.name || "Not set"}</strong>
          </div>
          <div className="meta-item">
            <span className="eyebrow">Email</span>
            <strong>{props.user.email}</strong>
          </div>
          <div className="meta-item">
            <span className="eyebrow">Subscription</span>
            <strong>{props.subscription?.tier || props.user.subscription_tier}</strong>
          </div>
        </div>
      </Panel>
    </div>
  );
}
