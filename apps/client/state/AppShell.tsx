import { useEffect } from "react";
import { useRouter } from "expo-router";

import { setAuthToken } from "@core/api/apiClient";
import { logger } from "@core/logging/logger";
import {
  clearPracticeSession,
  resumePracticeSession,
  startPracticeSession,
  type YkiPracticeSession,
} from "../features/yki-practice/services/ykiPracticeService";
import { clearExamSession } from "../features/yki-exam/services/ykiExamService";
import {
  getLearningSystem,
} from "../features/learning/services/learningService";
import ApplicationErrorScreen from "@ui/screens/ApplicationErrorScreen";
import Card from "@ui/primitives/Card";
import ScreenContainer from "@ui/primitives/ScreenContainer";
import Stack from "@ui/primitives/Stack";
import Text from "@ui/primitives/Text";

import { useAppFlowStore } from "./appFlowStore";
import AuthRoute from "./AuthRoute";
import FeatureEntryRoute from "./FeatureEntryRoute";
import HomeRoute from "./HomeRoute";
import LearningRoute from "./LearningRoute";
import { useNetworkStore } from "./networkStore";
import type {
  GuardedScreen,
  NavigationErrorCode,
  NavigationErrorState,
  RequestedScreen,
} from "./navigationModel";
import { getPathForScreen, getStackForScreen } from "./navigationModel";
import {
  clearPersistedLearningSession,
  clearPersistedNavigationState,
  loadPersistedLearningSession,
  loadPersistedNavigationState,
  loadPersistedYkiSession,
  persistNavigationState,
} from "./sessionPersistence";
import YkiPracticeRoute from "./YkiPracticeRoute";
import YkiExamRoute from "./YkiExamRoute";
import { useAuthStore } from "./authStore";

type Props = {
  requestedScreen?: RequestedScreen;
};

type LearningGuardResult =
  | {
      decisionVersion: string;
      governanceStatus: "governed" | "legacy_uncontrolled";
      governanceVersion: string;
      ok: true;
      policyVersion: string;
    }
  | {
      code: string;
      ok: false;
    };

type YkiSessionValidationResult =
  | {
      data: YkiPracticeSession;
      ok: true;
    }
  | {
      code: NavigationErrorCode;
      message: string;
      ok: false;
    };

function isTransportError(code?: string) {
  return code === "TRANSPORT_ERROR";
}

function toRequestedScreen(screen: GuardedScreen | RequestedScreen): RequestedScreen {
  return screen === "home" ? "root" : screen;
}

function isFeatureEntryScreen(
  screen: GuardedScreen | RequestedScreen,
): screen is "daily-practice" | "professional-finnish" | "speaking-practice" {
  return (
    screen === "daily-practice" ||
    screen === "professional-finnish" ||
    screen === "speaking-practice"
  );
}

async function validateLearningGuard(): Promise<LearningGuardResult> {
  const learningResponse = await getLearningSystem();

  if (!learningResponse.ok || !learningResponse.data) {
    return {
      code: learningResponse.error?.code ?? "CONTRACT_VIOLATION",
      ok: false,
    };
  }

  return {
    decisionVersion: learningResponse.data.decisionVersion,
    governanceStatus: learningResponse.data.governanceStatus,
    governanceVersion: learningResponse.data.governanceVersion,
    ok: true,
    policyVersion: learningResponse.data.policyVersion,
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
  const isOffline = useNetworkStore((state) => state.isOffline);
  const startMonitoring = useNetworkStore((state) => state.startMonitoring);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  useEffect(() => startMonitoring(), [startMonitoring]);

  useEffect(() => {
    logger.setCurrentScreen(activeScreen);
    logger.info("Screen transition resolved.", {
      actionType: "SCREEN_TRANSITION",
      currentScreen: activeScreen,
    });
  }, [activeScreen]);

  async function clearRuntimePersistence() {
    await Promise.all([
      clearPersistedLearningSession(),
      clearPersistedNavigationState(),
      clearExamSession(),
      clearPracticeSession(),
    ]);
  }

  async function resolveAndPersist(
    screen: GuardedScreen,
    requested: GuardedScreen | RequestedScreen,
    ykiSessionId: string | null = null,
  ) {
    logger.setLastUserAction(`navigate:${screen}`);
    resolveScreen(screen, ykiSessionId);
    await persistNavigationState({
      activeScreen: screen,
      navigationStack: getStackForScreen(screen),
      requestedScreen: toRequestedScreen(requested),
      ykiSessionId,
    });
  }

  async function blockNavigation(errorState: NavigationErrorState, clearStoredState = false) {
    if (clearStoredState) {
      await clearRuntimePersistence();
    }

    logger.warn("Navigation was blocked by runtime validation.", {
      actionType: "NAVIGATION_BLOCKED",
      currentScreen: errorState.requestedScreen,
    });
    setNavigationError(errorState);
  }

  async function validateExistingYkiSession(): Promise<YkiSessionValidationResult> {
    const persistedSession = await loadPersistedYkiSession();

    if (persistedSession.status === "invalid") {
      await clearPracticeSession();
      return {
        code: persistedSession.reason === "corrupted" ? "SESSION_CORRUPTED" : "SESSION_OUTDATED",
        message:
          persistedSession.reason === "corrupted"
            ? "Stored YKI session state is corrupted and cannot be trusted."
            : "Stored YKI session state uses an outdated format and cannot be restored.",
        ok: false,
      };
    }

    if (persistedSession.status === "missing" || !persistedSession.value) {
      return {
        code: "YKI_SESSION_REQUIRED",
        message: "YKI Practice requires an existing validated session before entry.",
        ok: false,
      };
    }

    const response = await resumePracticeSession();

    if (!response || !response.ok || !response.data) {
      if (response?.error?.code === "SESSION_CORRUPTED") {
        await clearPracticeSession();
        return {
          code: "SESSION_CORRUPTED",
          message: "Stored YKI session state is corrupted and cannot be trusted.",
          ok: false,
        };
      }

      if (response?.error?.code === "SESSION_OUTDATED") {
        await clearPracticeSession();
        return {
          code: "SESSION_OUTDATED",
          message: "Stored YKI session state is outdated and cannot be restored.",
          ok: false,
        };
      }

      if (isTransportError(response?.error?.code)) {
        return {
          code: "NAVIGATION_BLOCKED",
          message: "YKI session validation requires a live backend connection.",
          ok: false,
        };
      }

      await clearPracticeSession();
      return {
        code: "YKI_SESSION_INVALID",
        message: "YKI Practice navigation is blocked because the stored session is invalid.",
        ok: false,
      };
    }

    return {
      data: response.data,
      ok: true,
    };
  }

  async function restoreLearningSession() {
    const persistedLearning = await loadPersistedLearningSession();

    if (persistedLearning.status === "invalid") {
      await blockNavigation(
        {
          code: persistedLearning.reason === "corrupted" ? "SESSION_CORRUPTED" : "SESSION_OUTDATED",
          message:
            persistedLearning.reason === "corrupted"
              ? "Stored learning session state is corrupted and cannot be trusted."
              : "Stored learning session state is outdated and cannot be restored.",
          requestedScreen: "learning",
        },
        true,
      );
      return;
    }

    if (persistedLearning.status === "missing" || !persistedLearning.value) {
      await blockNavigation(
        {
          code: "SESSION_INVALID",
          message: "Learning restore is blocked because no validated stored learning session exists.",
          requestedScreen: "learning",
        },
        true,
      );
      return;
    }

    if (isOffline) {
      await blockNavigation({
        code: "NAVIGATION_BLOCKED",
        message: "Learning restore requires backend revalidation and is blocked while offline.",
        requestedScreen: "learning",
      });
      return;
    }

    const learningGuard = await validateLearningGuard();

    if (!learningGuard.ok) {
      await blockNavigation(
        {
          code: isTransportError(learningGuard.code) ? "NAVIGATION_BLOCKED" : "SESSION_INVALID",
          message: isTransportError(learningGuard.code)
            ? "Learning restore requires backend revalidation and is currently unavailable."
            : "Learning restore is blocked because the current backend state does not validate.",
          requestedScreen: "learning",
        },
        !isTransportError(learningGuard.code),
      );
      return;
    }

    if (
      persistedLearning.value.decisionVersion !== learningGuard.decisionVersion ||
      persistedLearning.value.policyVersion !== learningGuard.policyVersion ||
      persistedLearning.value.governanceVersion !== learningGuard.governanceVersion ||
      persistedLearning.value.governanceStatus !== learningGuard.governanceStatus
    ) {
      await blockNavigation(
        {
          code: "SESSION_OUTDATED",
          message: "Learning restore was rejected because stored governed versions no longer match the backend.",
          requestedScreen: "learning",
        },
        true,
      );
      return;
    }

    router.replace(getPathForScreen("learning"));
    await resolveAndPersist("learning", "learning");
  }

  async function restoreYkiSession() {
    const persistedYki = await loadPersistedYkiSession();

    if (persistedYki.status === "invalid") {
      await blockNavigation(
        {
          code: persistedYki.reason === "corrupted" ? "SESSION_CORRUPTED" : "SESSION_OUTDATED",
          message:
            persistedYki.reason === "corrupted"
              ? "Stored YKI session state is corrupted and cannot be trusted."
              : "Stored YKI session state is outdated and cannot be restored.",
          requestedScreen: "yki-practice",
        },
        true,
      );
      return;
    }

    if (persistedYki.status === "missing" || !persistedYki.value) {
      await blockNavigation(
        {
          code: "SESSION_INVALID",
          message: "YKI restore is blocked because no validated stored session exists.",
          requestedScreen: "yki-practice",
        },
        true,
      );
      return;
    }

    if (isOffline) {
      await blockNavigation({
        code: "NAVIGATION_BLOCKED",
        message: "YKI restore requires backend revalidation and is blocked while offline.",
        requestedScreen: "yki-practice",
      });
      return;
    }

    const ykiSession = await validateExistingYkiSession();

    if (!ykiSession.ok) {
      await blockNavigation(
        {
          code: ykiSession.code,
          message: ykiSession.message,
          requestedScreen: "yki-practice",
        },
        ykiSession.code !== "NAVIGATION_BLOCKED",
      );
      return;
    }

    if (
      ykiSession.data.session_id !== persistedYki.value.sessionId ||
      ykiSession.data.current_task_index !== persistedYki.value.currentTaskIndex ||
      ykiSession.data.isComplete !== persistedYki.value.isComplete ||
      ykiSession.data.session_hash !== persistedYki.value.sessionHash ||
      ykiSession.data.task_sequence_hash !== persistedYki.value.taskSequenceHash
    ) {
      await blockNavigation(
        {
          code: "SESSION_INVALID",
          message:
            "YKI restore was rejected because the stored step does not exactly match the backend session state.",
          requestedScreen: "yki-practice",
        },
        true,
      );
      return;
    }

    if (
      ykiSession.data.decisionVersion !== persistedYki.value.decisionVersion ||
      ykiSession.data.policyVersion !== persistedYki.value.policyVersion ||
      ykiSession.data.governanceVersion !== persistedYki.value.governanceVersion
    ) {
      await blockNavigation(
        {
          code: "SESSION_OUTDATED",
          message: "YKI restore was rejected because stored governed versions no longer match the backend.",
          requestedScreen: "yki-practice",
        },
        true,
      );
      return;
    }

    router.replace(getPathForScreen("yki-practice"));
    await resolveAndPersist("yki-practice", "yki-practice", ykiSession.data.session_id);
  }

  async function restoreFromNavigationState() {
    const persistedNavigation = await loadPersistedNavigationState();

    if (persistedNavigation.status === "invalid") {
      await blockNavigation(
        {
          code:
            persistedNavigation.reason === "corrupted" ? "SESSION_CORRUPTED" : "SESSION_OUTDATED",
          message:
            persistedNavigation.reason === "corrupted"
              ? "Stored navigation state is corrupted and cannot be trusted."
              : "Stored navigation state is outdated and cannot be restored.",
          requestedScreen: "root",
        },
        true,
      );
      return;
    }

    if (persistedNavigation.status === "missing" || !persistedNavigation.value) {
      await resolveAndPersist("home", "root");
      return;
    }

    if (persistedNavigation.value.activeScreen === "home") {
      router.replace(getPathForScreen("home"));
      await resolveAndPersist("home", persistedNavigation.value.requestedScreen);
      return;
    }

    if (persistedNavigation.value.activeScreen === "learning") {
      await restoreLearningSession();
      return;
    }

    if (persistedNavigation.value.activeScreen === "yki-exam") {
      router.replace(getPathForScreen("yki-exam"));
      await resolveAndPersist("yki-exam", persistedNavigation.value.requestedScreen);
      return;
    }

    if (isFeatureEntryScreen(persistedNavigation.value.activeScreen)) {
      router.replace(getPathForScreen(persistedNavigation.value.activeScreen));
      await resolveAndPersist(
        persistedNavigation.value.activeScreen,
        persistedNavigation.value.requestedScreen,
      );
      return;
    }

    if (persistedNavigation.value.activeScreen === "yki-practice") {
      await restoreYkiSession();
      return;
    }

    router.replace(getPathForScreen("home"));
    await resolveAndPersist("home", "root");
  }

  async function resolveRequestedRoute(target: RequestedScreen) {
    beginNavigationCheck(target);

    if (!user) {
      if (target === "auth" || target === "root") {
        router.replace(getPathForScreen("auth"));
        await clearRuntimePersistence();
        await resolveAndPersist("auth", "auth");
        return;
      }

      await blockNavigation({
        code: "AUTH_REQUIRED",
        message: `Access to ${target} requires an authenticated session.`,
        requestedScreen: target,
      });
      return;
    }

    if (target === "root") {
      await restoreFromNavigationState();
      return;
    }

    if (target === "auth") {
      router.replace(getPathForScreen("home"));
      await resolveAndPersist("home", "root");
      return;
    }

    if (target === "learning") {
      if (isOffline) {
        await blockNavigation({
          code: "NAVIGATION_BLOCKED",
          message: "Learning navigation requires backend validation and is blocked while offline.",
          requestedScreen: target,
        });
        return;
      }

      const learningReady = await validateLearningGuard();

      if (!learningReady.ok) {
        await blockNavigation({
          code: "LEARNING_STATE_INVALID",
          message: "Learning navigation is blocked because validated governed learning state is unavailable.",
          requestedScreen: target,
        });
        return;
      }

      await resolveAndPersist("learning", target);
      return;
    }

    if (target === "yki-exam") {
      router.replace(getPathForScreen("yki-exam"));
      await resolveAndPersist("yki-exam", target);
      return;
    }

    if (isFeatureEntryScreen(target)) {
      router.replace(getPathForScreen(target));
      await resolveAndPersist(target, target);
      return;
    }

    if (isOffline) {
      await blockNavigation({
        code: "NAVIGATION_BLOCKED",
        message: "YKI navigation requires backend validation and is blocked while offline.",
        requestedScreen: target,
      });
      return;
    }

    const ykiSession = await validateExistingYkiSession();

    if (!ykiSession.ok) {
      await blockNavigation(
        {
          code: ykiSession.code,
          message: ykiSession.message,
          requestedScreen: target,
        },
        ykiSession.code !== "NAVIGATION_BLOCKED",
      );
      return;
    }

    await resolveAndPersist("yki-practice", target, ykiSession.data.session_id);
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
      await resolveAndPersist("auth", "auth");
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
      await resolveAndPersist("home", "root");
      return;
    }

    if (screen === "learning") {
      if (isOffline) {
        await blockNavigation({
          code: "NAVIGATION_BLOCKED",
          message: "Learning navigation requires backend validation and is blocked while offline.",
          requestedScreen: screen,
        });
        return;
      }

      const learningReady = await validateLearningGuard();

      if (!learningReady.ok) {
        await blockNavigation({
          code: "LEARNING_STATE_INVALID",
          message: "Learning navigation is blocked because validated governed learning state is unavailable.",
          requestedScreen: screen,
        });
        return;
      }

      router.replace(getPathForScreen("learning"));
      await resolveAndPersist("learning", screen);
      return;
    }

    if (screen === "yki-exam") {
      clearNavigationError();
      router.replace(getPathForScreen("yki-exam"));
      await resolveAndPersist("yki-exam", screen);
      return;
    }

    if (isFeatureEntryScreen(screen)) {
      clearNavigationError();
      router.replace(getPathForScreen(screen));
      await resolveAndPersist(screen, screen);
      return;
    }

    if (isOffline) {
      await blockNavigation({
        code: "NAVIGATION_BLOCKED",
        message: "YKI navigation requires backend validation and is blocked while offline.",
        requestedScreen: screen,
      });
      return;
    }

    const resumedSession = await validateExistingYkiSession();

    if (resumedSession.ok) {
      router.replace(getPathForScreen("yki-practice"));
      await resolveAndPersist("yki-practice", screen, resumedSession.data.session_id);
      return;
    }

    if (
      resumedSession.code !== "YKI_SESSION_REQUIRED" &&
      resumedSession.code !== "YKI_SESSION_INVALID"
    ) {
      await blockNavigation(
        {
          code: resumedSession.code,
          message: resumedSession.message,
          requestedScreen: screen,
        },
        resumedSession.code !== "NAVIGATION_BLOCKED",
      );
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
    await resolveAndPersist("yki-practice", screen, startedSession.data.session_id);
  }

  async function handleLogout() {
    await logout();
    await clearRuntimePersistence();
    setAuthToken(null);
    router.replace(getPathForScreen("auth"));
    await resolveAndPersist("auth", "auth");
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

  if (activeScreen !== "error" && isFeatureEntryScreen(activeScreen)) {
    return (
      <FeatureEntryRoute
        screen={activeScreen}
        onBack={() => {
          navigateBack();
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

  if (activeScreen === "yki-exam") {
    return (
      <YkiExamRoute
        onExit={() => {
          void navigateTo("home");
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
      onOpenDailyPractice={() => {
        void navigateTo("daily-practice");
      }}
      onOpenProfessionalFinnish={() => {
        void navigateTo("professional-finnish");
      }}
      onOpenSpeakingPractice={() => {
        void navigateTo("speaking-practice");
      }}
      onLogout={() => {
        void handleLogout();
      }}
      onOpenLearning={() => {
        void navigateTo("learning");
      }}
      onOpenYkiExam={() => {
        void navigateTo("yki-exam");
      }}
      onOpenYkiPractice={() => {
        void navigateTo("yki-practice");
      }}
    />
  );
}
