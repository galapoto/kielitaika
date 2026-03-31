import { create } from "zustand";

import type {
  AppScreen,
  GuardedScreen,
  NavigationErrorState,
  RequestedScreen,
} from "./navigationModel";
import { getStackForScreen } from "./navigationModel";

type NavigationStatus = "checking" | "idle";

type AppFlowState = {
  activeScreen: AppScreen;
  error: NavigationErrorState | null;
  navigationStatus: NavigationStatus;
  navigationStack: GuardedScreen[];
  requestedScreen: RequestedScreen;
  ykiSessionId: string | null;
  beginNavigationCheck: (requestedScreen: RequestedScreen | GuardedScreen) => void;
  clearNavigationError: () => void;
  resolveScreen: (screen: GuardedScreen, ykiSessionId?: string | null) => void;
  setNavigationError: (error: NavigationErrorState) => void;
};

export const useAppFlowStore = create<AppFlowState>((set) => ({
  activeScreen: "auth",
  error: null,
  navigationStatus: "idle",
  navigationStack: ["auth"],
  requestedScreen: "root",
  ykiSessionId: null,
  beginNavigationCheck(requestedScreen) {
    set({
      error: null,
      navigationStatus: "checking",
      requestedScreen:
        requestedScreen === "home" ? "root" : (requestedScreen as RequestedScreen),
    });
  },
  clearNavigationError() {
    set({
      error: null,
      navigationStatus: "idle",
    });
  },
  resolveScreen(screen, ykiSessionId = null) {
    set({
      activeScreen: screen,
      error: null,
      navigationStatus: "idle",
      navigationStack: getStackForScreen(screen),
      ykiSessionId,
    });
  },
  setNavigationError(error) {
    set({
      activeScreen: "error",
      error,
      navigationStatus: "idle",
      requestedScreen: error.requestedScreen as RequestedScreen,
      ykiSessionId: null,
    });
  },
}));
