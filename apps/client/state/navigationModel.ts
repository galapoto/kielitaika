export type RequestedScreen = "auth" | "learning" | "root" | "yki-practice";
export type AppScreen = "auth" | "error" | "home" | "learning" | "yki-practice";
export type GuardedScreen = Exclude<AppScreen, "error">;

export type NavigationErrorCode =
  | "AUTH_REQUIRED"
  | "LEARNING_STATE_INVALID"
  | "NAVIGATION_BLOCKED"
  | "YKI_SESSION_INVALID"
  | "YKI_SESSION_REQUIRED";

export type NavigationErrorState = {
  code: NavigationErrorCode;
  message: string;
  requestedScreen: RequestedScreen | GuardedScreen;
};

export const screenRegistry: Record<
  GuardedScreen,
  {
    path: string;
    requiresAuth: boolean;
    requiresLearningGuard?: boolean;
    requiresYkiSession?: boolean;
  }
> = {
  auth: {
    path: "/auth",
    requiresAuth: false,
  },
  home: {
    path: "/",
    requiresAuth: true,
  },
  learning: {
    path: "/learning",
    requiresAuth: true,
    requiresLearningGuard: true,
  },
  "yki-practice": {
    path: "/yki-practice",
    requiresAuth: true,
    requiresYkiSession: true,
  },
};

export function getPathForScreen(screen: GuardedScreen) {
  return screenRegistry[screen].path;
}

export function getStackForScreen(screen: GuardedScreen): GuardedScreen[] {
  if (screen === "auth") {
    return ["auth"];
  }

  if (screen === "home") {
    return ["home"];
  }

  return ["home", screen];
}
