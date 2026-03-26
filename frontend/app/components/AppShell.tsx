import type { PropsWithChildren } from "react";

import { playTap } from "../services/audioService";
import type { ColorScheme } from "../theme/backgrounds";
import type { RouteKey, SubscriptionStatus } from "../state/types";
import { Button } from "./Button";
import { Logo } from "./Logo";

const navItems: Array<{ key: RouteKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "cards", label: "Cards" },
  { key: "roleplay", label: "Roleplay" },
  { key: "voice", label: "Voice" },
  { key: "yki", label: "YKI Exam" },
];

export function AppShell(props: PropsWithChildren<{
  route: RouteKey;
  onRouteChange: (route: RouteKey) => void;
  onLogout: () => void;
  userName: string;
  subscription: SubscriptionStatus | null;
  colorScheme: ColorScheme;
}>) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <Logo scheme={props.colorScheme} size={58} />
        </div>
        <nav className="nav-stack">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === props.route ? "nav-item active" : "nav-item"}
              onClick={() => {
                playTap();
                props.onRouteChange(item.key);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="subscription-chip">
            <span>{props.userName}</span>
            <strong>{props.subscription?.tier || "free"}</strong>
          </div>
          <Button tone="ghost" onClick={props.onLogout}>
            Sign out
          </Button>
        </div>
      </aside>
      <main className="main-content">{props.children}</main>
    </div>
  );
}
