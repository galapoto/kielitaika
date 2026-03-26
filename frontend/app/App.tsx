import { useEffect, useState } from "react";

import { AppShell } from "./components/AppShell";
import { LoadingScreen } from "./components/LoadingScreen";
import { logNavigationEvent } from "./services/debugLogger";
import { AuthScreen } from "./screens/AuthScreen";
import { CardsScreen } from "./screens/CardsScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { DebugScreen } from "./screens/DebugScreen";
import { RoleplayScreen } from "./screens/RoleplayScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { VoiceStudioScreen } from "./screens/VoiceStudioScreen";
import { YkiExamScreen } from "./screens/YkiExamScreen";
import { YkiIntroScreen } from "./screens/YkiIntroScreen";
import { YkiResultScreen } from "./screens/YkiResultScreen";
import { useAppState } from "./state/AppStateProvider";
import type { AppScreen, PracticeSection } from "./state/types";
import { getBackgroundClass, useResolvedColorScheme } from "./theme/backgrounds";
import { logoAssets } from "./theme/logoAssets";

function resolveBackgroundScreen(authenticated: boolean, screen: AppScreen): AppScreen | "auth" {
  if (!authenticated) {
    return "auth";
  }
  return screen;
}

function resolvePracticeSectionFromPath(pathname: string): PracticeSection {
  if (pathname.startsWith("/practice/grammar")) {
    return "grammar";
  }
  if (pathname.startsWith("/practice/phrases")) {
    return "phrases";
  }
  return "vocabulary";
}

function resolvePath(screen: AppScreen, practiceSection: PracticeSection): string {
  if (screen === "practice") {
    return `/practice/${practiceSection}`;
  }
  if (screen === "conversation") {
    return "/conversation";
  }
  if (screen === "professional") {
    return "/professional";
  }
  if (screen === "settings") {
    return "/settings";
  }
  if (screen === "debug") {
    return "/debug";
  }
  if (screen === "yki_intro") {
    return "/yki";
  }
  if (screen === "yki_runtime") {
    return "/yki/runtime";
  }
  if (screen === "yki_result") {
    return "/yki/result";
  }
  return "/";
}

export function App() {
  const app = useAppState();
  const colorScheme = useResolvedColorScheme();
  const [ykiRuntime, setYkiRuntime] = useState<any | null>(app.restoredYkiRuntime);
  const [practiceSection, setPracticeSection] = useState<PracticeSection>("vocabulary");
  const backgroundScreen = resolveBackgroundScreen(app.auth.status === "authenticated" && app.bootComplete, app.screen);

  useEffect(() => {
    setYkiRuntime(app.restoredYkiRuntime ?? null);
  }, [app.restoredYkiRuntime]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setPracticeSection(resolvePracticeSectionFromPath(window.location.pathname));
  }, [app.auth.status, app.bootComplete]);

  useEffect(() => {
    if (typeof window === "undefined" || !app.bootComplete || app.auth.status !== "authenticated") {
      return;
    }
    const nextPath = resolvePath(app.screen, practiceSection);
    if (window.location.pathname !== nextPath) {
      window.history.replaceState({}, "", nextPath);
      logNavigationEvent(`Route synchronized to ${nextPath}`, {
        screen: app.screen,
        practiceSection,
      });
    }
  }, [app.auth.status, app.bootComplete, app.screen, practiceSection]);

  if (!app.bootComplete || app.auth.status === "booting" || app.auth.status === "restoring") {
    return (
      <div className={`app-frame ${getBackgroundClass(backgroundScreen, colorScheme)}`}>
        <div className="app-logo-overlay" aria-hidden="true">
          <img src={logoAssets[colorScheme]} alt="" />
        </div>
        <div className="route-stage" key="boot">
          <LoadingScreen title="Preparing KieliTaika" message="Restoring your learning space and saved progress." />
        </div>
      </div>
    );
  }

  if (app.auth.status !== "authenticated") {
    return (
      <div className={`app-frame ${getBackgroundClass(backgroundScreen, colorScheme)}`}>
        <div className="app-logo-overlay" aria-hidden="true">
          <img src={logoAssets[colorScheme]} alt="" />
        </div>
        <div className="route-stage" key="auth">
          <AuthScreen onLogin={app.login} onGoogleLogin={app.loginWithGoogle} onRegister={app.register} />
        </div>
      </div>
    );
  }

  let screen = <DashboardScreen user={app.auth.session.auth_user} subscription={app.subscription} onScreenChange={app.setScreen} />;

  if (app.screen === "practice") {
    screen = <CardsScreen section={practiceSection} />;
  } else if (app.screen === "conversation") {
    screen = <RoleplayScreen restoredSession={app.restoredRoleplaySession} />;
  } else if (app.screen === "professional") {
    screen = (
      <VoiceStudioScreen
        title="Professional Finnish"
        subtitle="Speaking, pronunciation, and transcript tools for workplace-focused Finnish practice."
        modeLabel="Professional session"
      />
    );
  } else if (app.screen === "settings") {
    screen = <SettingsScreen user={app.auth.session.auth_user} subscription={app.subscription} />;
  } else if (app.screen === "debug") {
    screen = <DebugScreen />;
  } else if (app.screen === "yki_intro") {
    screen = (
      <YkiIntroScreen
        restoredRuntime={ykiRuntime}
        subscription={app.subscription}
        onResume={() => app.setScreen("yki_runtime")}
        onStarted={(runtime) => {
          setYkiRuntime(runtime);
          app.setScreen("yki_runtime");
        }}
      />
    );
  } else if (app.screen === "yki_runtime") {
    screen = (
      <YkiExamScreen
        runtime={ykiRuntime}
        onRuntimeChange={setYkiRuntime}
        onBackToIntro={() => app.setScreen("yki_intro")}
        onComplete={() => app.setScreen("yki_result")}
      />
    );
  } else if (app.screen === "yki_result") {
    screen = <YkiResultScreen runtime={ykiRuntime} onBackToIntro={() => app.setScreen("yki_intro")} />;
  }

  return (
    <div className={`app-frame ${getBackgroundClass(backgroundScreen, colorScheme)}`}>
      <div className="app-logo-overlay" aria-hidden="true">
        <img src={logoAssets[colorScheme]} alt="" />
      </div>
      <AppShell
        screen={app.screen}
        practiceSection={practiceSection}
        onPracticeSectionChange={setPracticeSection}
        onScreenChange={app.setScreen}
        onLogout={app.logout}
        userName={app.auth.session.auth_user.name || app.auth.session.auth_user.email}
        subscription={app.subscription}
        colorScheme={colorScheme}
      >
        <div className="route-stage" key={app.screen}>
          {screen}
        </div>
      </AppShell>
    </div>
  );
}
