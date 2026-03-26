import { AppShell } from "./components/AppShell";
import { LoadingScreen } from "./components/LoadingScreen";
import { AuthScreen } from "./screens/AuthScreen";
import { CardsScreen } from "./screens/CardsScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { RoleplayScreen } from "./screens/RoleplayScreen";
import { VoiceStudioScreen } from "./screens/VoiceStudioScreen";
import { YkiExamScreen } from "./screens/YkiExamScreen";
import { useAppState } from "./state/AppStateProvider";
import { getBackgroundStyle, useResolvedColorScheme, type BackgroundScreen } from "./theme/backgrounds";

export function App() {
  const app = useAppState();
  const colorScheme = useResolvedColorScheme();
  let backgroundScreen: BackgroundScreen = "dashboard";

  if (!app.bootComplete || app.auth.status === "booting" || app.auth.status === "restoring") {
    backgroundScreen = "auth";
  } else if (app.auth.status !== "authenticated") {
    backgroundScreen = "auth";
  } else if (app.route === "cards") {
    backgroundScreen = "cards";
  } else if (app.route === "roleplay") {
    backgroundScreen = "roleplay";
  } else if (app.route === "voice") {
    backgroundScreen = "voice";
  } else if (app.route === "yki") {
    backgroundScreen = "yki";
  }

  if (!app.bootComplete || app.auth.status === "booting" || app.auth.status === "restoring") {
    return (
      <div className="app-frame" style={getBackgroundStyle(backgroundScreen, colorScheme)}>
        <LoadingScreen title="Hydrating runtime" message="Auth restore, entitlement resolution, and session recovery are hard-blocking." />
      </div>
    );
  }

  if (app.auth.status !== "authenticated") {
    return (
      <div className="app-frame" style={getBackgroundStyle(backgroundScreen, colorScheme)}>
        <AuthScreen onLogin={app.login} onRegister={app.register} />
      </div>
    );
  }

  let screen = (
    <DashboardScreen user={app.auth.session.auth_user} subscription={app.subscription} onRouteChange={app.setRoute} />
  );

  if (app.route === "cards") {
    screen = <CardsScreen />;
  }
  if (app.route === "roleplay") {
    screen = <RoleplayScreen restoredSession={app.restoredRoleplaySession} />;
  }
  if (app.route === "voice") {
    screen = <VoiceStudioScreen />;
  }
  if (app.route === "yki") {
    screen = <YkiExamScreen restoredRuntime={app.restoredYkiRuntime} />;
  }

  return (
    <div className="app-frame" style={getBackgroundStyle(backgroundScreen, colorScheme)}>
      <AppShell
        route={app.route}
        onRouteChange={app.setRoute}
        onLogout={app.logout}
        userName={app.auth.session.auth_user.name || app.auth.session.auth_user.email}
        subscription={app.subscription}
        colorScheme={colorScheme}
      >
        {screen}
      </AppShell>
    </div>
  );
}
