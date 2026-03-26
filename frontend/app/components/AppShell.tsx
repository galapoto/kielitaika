import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  House,
  Layers3,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  Settings,
  TerminalSquare,
  Type,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { playTap } from "../services/audioService";
import type { ColorScheme } from "../theme/backgrounds";
import type { AppScreen, PracticeSection, SubscriptionStatus } from "../state/types";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { Button } from "./Button";
import { Logo } from "./Logo";

type NavNode =
  | { kind: "item"; key: AppScreen; label: string; icon: LucideIcon }
  | { kind: "group"; key: "practice"; label: string; icon: LucideIcon; children: Array<{ key: PracticeSection; label: string; icon: LucideIcon }> };

const navTree: NavNode[] = [
  { kind: "item", key: "home", label: "Home", icon: House },
  {
    kind: "group",
    key: "practice",
    label: "Practice",
    icon: BookOpen,
    children: [
      { key: "vocabulary", label: "Vocabulary", icon: Type },
      { key: "grammar", label: "Grammar", icon: Layers3 },
      { key: "phrases", label: "Phrases", icon: MessageSquare },
    ],
  },
  { kind: "item", key: "conversation", label: "Conversation", icon: Mic },
  { kind: "item", key: "yki_intro", label: "YKI Exam", icon: ClipboardCheck },
  { kind: "item", key: "professional", label: "Professional Finnish", icon: BriefcaseBusiness },
  { kind: "item", key: "settings", label: "Settings", icon: Settings },
  { kind: "item", key: "debug", label: "Debug Logs", icon: TerminalSquare },
];

function activeNavKey(screen: AppScreen): AppScreen {
  if (screen === "yki_runtime" || screen === "yki_result") {
    return "yki_intro";
  }
  return screen;
}

function currentTitle(screen: AppScreen, practiceSection: PracticeSection): string {
  if (screen === "practice") {
    if (practiceSection === "grammar") {
      return "Practice / Grammar";
    }
    if (practiceSection === "phrases") {
      return "Practice / Phrases";
    }
    return "Practice / Vocabulary";
  }
  if (screen === "conversation") {
    return "Conversation";
  }
  if (screen === "professional") {
    return "Professional Finnish";
  }
  if (screen === "settings") {
    return "Settings";
  }
  if (screen === "debug") {
    return "Debug Logs";
  }
  if (screen === "yki_runtime") {
    return "YKI Exam";
  }
  if (screen === "yki_result") {
    return "YKI Results";
  }
  if (screen === "yki_intro") {
    return "YKI Exam";
  }
  return "Home";
}

export function AppShell(props: PropsWithChildren<{
  screen: AppScreen;
  practiceSection: PracticeSection;
  onPracticeSectionChange: (section: PracticeSection) => void;
  onScreenChange: (screen: AppScreen) => void;
  onLogout: () => Promise<void>;
  userName: string;
  subscription: SubscriptionStatus | null;
  colorScheme: ColorScheme;
}>) {
  const { isMobile } = useResponsiveLayout();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const currentNav = activeNavKey(props.screen);
  const title = useMemo(() => currentTitle(props.screen, props.practiceSection), [props.practiceSection, props.screen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [isMobile, props.practiceSection, props.screen]);

  function openDrawer() {
    playTap();
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function navigate(screen: AppScreen) {
    playTap();
    props.onScreenChange(screen);
  }

  function navigatePractice(section: PracticeSection) {
    playTap();
    props.onPracticeSectionChange(section);
    props.onScreenChange("practice");
  }

  return (
    <div className="app-shell-frame">
      <div className="app-shell">
        {isMobile ? (
          <>
            <button type="button" className="mobile-nav-toggle" onClick={openDrawer} aria-label="Open navigation menu">
              <Menu size={18} aria-hidden="true" />
            </button>
            <div className="mobile-shell-title">{title}</div>
          </>
        ) : null}

        {isMobile && drawerOpen ? <button type="button" className="drawer-overlay" aria-label="Close navigation menu" onClick={closeDrawer} /> : null}

        <aside className={`sidebar ${isMobile ? "drawer-sidebar" : ""} ${isMobile && drawerOpen ? "is-open" : ""}`.trim()}>
          <div className="brand-lockup">
            <Logo scheme={props.colorScheme} size={58} />
          </div>

          <div className="sidebar-user-card">
            <div className="profile-placeholder" aria-hidden="true">
              <UserRound size={20} aria-hidden="true" />
            </div>
            <div className="profile-copy">
              <span className="eyebrow">Account</span>
              <strong>{props.userName}</strong>
              <small className="muted">{props.subscription?.tier || "free"}</small>
            </div>
          </div>

          <nav className="nav-stack">
            {navTree.map((item) => {
              if (item.kind === "group") {
                return (
                  <div key={item.key} className="nav-group">
                    <button
                      type="button"
                      className={currentNav === "practice" ? "nav-item active" : "nav-item"}
                      onClick={() => navigate("practice")}
                    >
                      <span className="nav-button-copy">
                        <item.icon size={18} aria-hidden="true" />
                        <span>{item.label}</span>
                      </span>
                    </button>
                    <div className="nav-substack">
                      {item.children.map((child) => (
                        <button
                          key={child.key}
                          type="button"
                          className={currentNav === "practice" && props.practiceSection === child.key ? "nav-subitem active" : "nav-subitem"}
                          onClick={() => navigatePractice(child.key)}
                        >
                          <span className="nav-button-copy">
                            <child.icon size={16} aria-hidden="true" />
                            <span>{child.label}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  className={item.key === currentNav ? "nav-item active" : "nav-item"}
                  onClick={() => navigate(item.key)}
                >
                  <span className="nav-button-copy">
                    <item.icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="subscription-chip">
              <span>Subscription</span>
              <strong>{props.subscription?.tier || "free"}</strong>
            </div>
            <button type="button" className="nav-item sidebar-settings-button" onClick={() => navigate("settings")}>
              <span className="nav-button-copy">
                <Settings size={18} aria-hidden="true" />
                <span>Settings</span>
              </span>
            </button>
            <Button tone="ghost" onClick={() => void props.onLogout()}>
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </aside>

        <main className="main-content">{props.children}</main>
      </div>
    </div>
  );
}
