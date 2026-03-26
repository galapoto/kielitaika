import { useEffect, useState } from "react";

import { AppShell } from "./components/AppShell";
import { LoadingScreen } from "./components/LoadingScreen";
import { AuthScreen } from "./screens/AuthScreen";
import { ConversationScreen } from "./screens/ConversationScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { PracticeScreen } from "./screens/PracticeScreen";
import { ProfessionalFinnishScreen } from "./screens/ProfessionalFinnishScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { YkiExamScreen } from "./screens/YkiExamScreen";
import { YkiIntroScreen } from "./screens/YkiIntroScreen";
import { YkiResultScreen } from "./screens/YkiResultScreen";
import { useAppState } from "./state/AppStateProvider";
import type { PracticeSection } from "./state/types";
import { getBackgroundStyle, useResolvedColorScheme, type BackgroundScreen } from "./theme/backgrounds";

export function App() {
  const app = useAppState();
  const colorScheme = useResolvedColorScheme();
  const [ykiRuntime, setYkiRuntime] = useState<any | null>(app.restoredYkiRuntime);
  const [practiceSection, setPracticeSection] = useState<PracticeSection>("vocabulary");
  let backgroundScreen: BackgroundScreen = "dashboard";

  useEffect(() => {
    setYkiRuntime(app.restoredYkiRuntime ?? null);
  }, [app.restoredYkiRuntime]);

  if (!app.bootComplete || app.auth.status === "booting" || app.auth.status === "restoring") {
    backgroundScreen = "auth";
  } else if (app.auth.status !== "authenticated") {
    backgroundScreen = "auth";
  } else if (app.screen === "practice") {
    backgroundScreen = "practice";
  } else if (app.screen === "conversation") {
    backgroundScreen = "conversation";
  } else if (app.screen === "professional") {
    backgroundScreen = "professional";
  } else if (app.screen === "settings") {
    backgroundScreen = "settings";
  } else if (app.screen === "yki_intro" || app.screen === "yki_runtime" || app.screen === "yki_result") {
    backgroundScreen = "exam";
  }

  if (!app.bootComplete || app.auth.status === "booting" || app.auth.status === "restoring") {
    return (
      <div className="app-frame" style={getBackgroundStyle(backgroundScreen, colorScheme)}>
        <div className="route-stage" key="boot">
          <LoadingScreen title="Hydrating runtime" message="Auth restore, entitlement resolution, and session recovery are hard-blocking." />
        </div>
      </div>
    );
  }

  if (app.auth.status !== "authenticated") {
    return (
      <div className="app-frame" style={getBackgroundStyle(backgroundScreen, colorScheme)}>
        <div className="route-stage" key="auth">
          <AuthScreen onLogin={app.login} onGoogleLogin={app.loginWithGoogle} onRegister={app.register} />
        </div>
      </div>
    );
  }

  let screen = <DashboardScreen user={app.auth.session.auth_user} subscription={app.subscription} onScreenChange={app.setScreen} />;

  if (app.screen === "practice") {
    screen = <PracticeScreen section={practiceSection} />;
  } else if (app.screen === "conversation") {
    screen = <ConversationScreen restoredSession={app.restoredRoleplaySession} />;
  } else if (app.screen === "professional") {
    screen = <ProfessionalFinnishScreen />;
  } else if (app.screen === "settings") {
    screen = <SettingsScreen user={app.auth.session.auth_user} subscription={app.subscription} />;
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
    <div className="app-frame" style={getBackgroundStyle(backgroundScreen, colorScheme)}>
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
