import { Panel } from "../components/Panel";
import { ScreenScaffold } from "../components/ScreenScaffold";
import type { AuthUser, SubscriptionStatus } from "../state/types";

export function SettingsScreen(props: { user: AuthUser; subscription: SubscriptionStatus | null }) {
  return (
    <ScreenScaffold
      className="settings-screen"
      header={
        <div className="screen-heading">
          <span className="eyebrow">Settings</span>
          <h1 className="hero-title">Account settings</h1>
          <p className="hero-subtitle">Profile and subscription details remain isolated in their own account screen.</p>
        </div>
      }
      actions={
        <Panel className="secondary-card settings-action-card">
          <span className="eyebrow">Navigation</span>
          <p className="muted">Use the shell navigation to move between settings, practice, conversation, and YKI surfaces.</p>
        </Panel>
      }
    >
      <Panel className="primary-card" title="Settings" subtitle="Account-level settings stay isolated in their own screen.">
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
    </ScreenScaffold>
  );
}
