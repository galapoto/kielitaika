import { useEffect } from "react";
import { useRouter } from "expo-router";

import { setAuthToken } from "@core/api/apiClient";
import {
  clearPracticeSession,
  resumePracticeSession,
  startPracticeSession,
} from "../features/yki-practice/services/ykiPracticeService";
import {
  getLearningDebugState,
  getLearningModules,
} from "../features/learning/services/learningService";
import ApplicationErrorScreen from "@ui/screens/ApplicationErrorScreen";
import Card from "@ui/primitives/Card";
import ScreenContainer from "@ui/primitives/ScreenContainer";
import Stack from "@ui/primitives/Stack";
import Text from "@ui/primitives/Text";

import { useAppFlowStore } from "./appFlowStore";
import AuthRoute from "./AuthRoute";
import HomeRoute from "./HomeRoute";
import LearningRoute from "./LearningRoute";
import type {
  GuardedScreen,
  NavigationErrorState,
  RequestedScreen,
} from "./navigationModel";
import { getPathForScreen } from "./navigationModel";
import YkiPracticeRoute from "./YkiPracticeRoute";
import { useAuthStore } from "./authStore";

type Props = {
  requestedScreen?: RequestedScreen;
};

async function validateLearningGuard() {
  const [modulesResponse, debugResponse] = await Promise.all([
    getLearningModules(),
    getLearningDebugState(),
  ]);

  return Boolean(
    modulesResponse.ok &&
      modulesResponse.data &&
      debugResponse.ok &&
      debugResponse.data &&
      modulesResponse.data.governanceStatus === "governed" &&
      debugResponse.data.governanceStatus === "governed",
  );
}

async function validateExistingYkiSession() {
  const response = await resumePracticeSession();

  if (!response) {
    return {
      ok: false,
      reason: "YKI_SESSION_REQUIRED" as const,
      sessionId: null,
    };
  }

  if (!response.ok || !response.data) {
    await clearPracticeSession();
    return {
      ok: false,
      reason: "YKI_SESSION_INVALID" as const,
      sessionId: null,
    };
  }

  return {
    ok: true,
    reason: null,
    sessionId: response.data.session_id,
  };
}

export default function AppShell({ requestedScreen = "root" }: Props) {
  const router = useRouter();
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const activeScreen = useAppFlowStore((state) => state.activeScreen);
  const error = useAppFlowStore((state) => state.error);
  const navigationStatus = useAppFlowStore((state) => state.navigationStatus);
  const navigationStack = useAppFlowStore((state) => state.navigationStack);
  const beginNavigationCheck = useAppFlowStore((state) => state.beginNavigationCheck);
  const clearNavigationError = useAppFlowStore((state) => state.clearNavigationError);
  const resolveScreen = useAppFlowStore((state) => state.resolveScreen);
  const setNavigationError = useAppFlowStore((state) => state.setNavigationError);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  async function blockNavigation(errorState: NavigationErrorState) {
    setNavigationError(errorState);
  }

  async function resolveRequestedRoute(target: RequestedScreen) {
    beginNavigationCheck(target);

    if (target === "root") {
      if (!user) {
        router.replace(getPathForScreen("auth"));
      }
      resolveScreen(user ? "home" : "auth");
      return;
    }

    if (target === "auth") {
      if (user) {
        router.replace(getPathForScreen("home"));
        resolveScreen("home");
        return;
      }

      resolveScreen("auth");
      return;
    }

    if (!user) {
      await blockNavigation({
        code: "AUTH_REQUIRED",
        message: `Access to ${target} requires an authenticated session.`,
        requestedScreen: target,
      });
      return;
    }

    if (target === "learning") {
      const learningReady = await validateLearningGuard();

      if (!learningReady) {
        await blockNavigation({
          code: "LEARNING_STATE_INVALID",
          message: "Learning navigation is blocked because validated governed learning state is unavailable.",
          requestedScreen: target,
        });
        return;
      }

      resolveScreen("learning");
      return;
    }

    const ykiSession = await validateExistingYkiSession();

    if (!ykiSession.ok) {
      await blockNavigation({
        code: ykiSession.reason ?? "YKI_SESSION_INVALID",
        message:
          ykiSession.reason === "YKI_SESSION_REQUIRED"
            ? "YKI Practice requires an existing validated session before entry."
            : "YKI Practice navigation is blocked because the stored session is invalid.",
        requestedScreen: target,
      });
      return;
    }

    resolveScreen("yki-practice", ykiSession.sessionId);
  }

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    void resolveRequestedRoute(requestedScreen);
  }, [hasHydrated, requestedScreen, user?.id]);

  async function navigateTo(screen: GuardedScreen) {
    beginNavigationCheck(screen);

    if (screen === "auth") {
      router.replace(getPathForScreen("auth"));
      resolveScreen("auth");
      return;
    }

    if (!user) {
      await blockNavigation({
        code: "AUTH_REQUIRED",
        message: `Access to ${screen} requires an authenticated session.`,
        requestedScreen: screen,
      });
      return;
    }

    if (screen === "home") {
      clearNavigationError();
      router.replace(getPathForScreen("home"));
      resolveScreen("home");
      return;
    }

    if (screen === "learning") {
      const learningReady = await validateLearningGuard();

      if (!learningReady) {
        await blockNavigation({
          code: "LEARNING_STATE_INVALID",
          message: "Learning navigation is blocked because validated governed learning state is unavailable.",
          requestedScreen: screen,
        });
        return;
      }

      router.replace(getPathForScreen("learning"));
      resolveScreen("learning");
      return;
    }

    const resumedSession = await validateExistingYkiSession();

    if (resumedSession.ok) {
      router.replace(getPathForScreen("yki-practice"));
      resolveScreen("yki-practice", resumedSession.sessionId);
      return;
    }

    const startedSession = await startPracticeSession();

    if (!startedSession.ok || !startedSession.data) {
      await blockNavigation({
        code: "YKI_SESSION_INVALID",
        message: "YKI Practice navigation is blocked because a validated session could not be established.",
        requestedScreen: screen,
      });
      return;
    }

    router.replace(getPathForScreen("yki-practice"));
    resolveScreen("yki-practice", startedSession.data.session_id);
  }

  async function handleLogout() {
    await logout();
    setAuthToken(null);
    router.replace(getPathForScreen("auth"));
    resolveScreen("auth");
  }

  function navigateBack() {
    const previousScreen =
      navigationStack.length > 1 ? navigationStack[navigationStack.length - 2] : null;

    if (!previousScreen) {
      void navigateTo(user ? "home" : "auth");
      return;
    }

    void navigateTo(previousScreen);
  }

  if (!hasHydrated || navigationStatus === "checking") {
    return (
      <ScreenContainer center>
        <Stack gap="sm">
          <Card>
            <Stack gap="xs">
              <Text variant="title">KieliTaika</Text>
              <Text tone="muted">Validating application flow...</Text>
            </Stack>
          </Card>
        </Stack>
      </ScreenContainer>
    );
  }

  if (activeScreen === "error" && error) {
    return (
      <ApplicationErrorScreen
        code={error.code}
        message={error.message}
        onPrimaryAction={() => {
          void navigateTo(user ? "home" : "auth");
        }}
        onSecondaryAction={
          user
            ? () => {
                void handleLogout();
              }
            : undefined
        }
        primaryLabel={user ? "Return Home" : "Open Auth"}
        secondaryLabel={user ? "Log Out" : undefined}
      />
    );
  }

  if (activeScreen === "auth") {
    return <AuthRoute />;
  }

  if (activeScreen === "learning") {
    return (
      <LearningRoute
        onBack={() => {
          navigateBack();
        }}
      />
    );
  }

  if (activeScreen === "yki-practice") {
    return (
      <YkiPracticeRoute
        onBack={() => {
          navigateBack();
        }}
      />
    );
  }

  return (
    <HomeRoute
      onLogout={() => {
        void handleLogout();
      }}
      onOpenLearning={() => {
        void navigateTo("learning");
      }}
      onOpenYkiPractice={() => {
        void navigateTo("yki-practice");
      }}
    />
  );
}
