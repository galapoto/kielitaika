import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

import { DEV_MODE } from "../config/devMode";
import { completeGoogleAuth, loginWithPassword, logout as logoutSession, registerWithPassword, restoreSession } from "../services/authService";
import { refreshPersistedSession } from "../services/apiClient";
import { playWelcome, preloadAudio } from "../services/audioService";
import { logDebugEvent, logNavigationEvent } from "../services/debugLogger";
import { fetchRoleplaySession } from "../services/roleplayService";
import { listRoleplayCaches, listYkiCaches, loadAuthSession, removeRoleplayCache, removeYkiCache, saveAuthSession } from "../services/storage";
import { fetchSubscriptionStatus } from "../services/subscriptionService";
import { fetchYkiSession } from "../services/ykiService";
import type { AppScreen, AuthState, PersistedAuthSession, SubscriptionStatus } from "./types";

type AppStateContextValue = {
  auth: AuthState;
  subscription: SubscriptionStatus | null;
  screen: AppScreen;
  bootComplete: boolean;
  restoredRoleplaySession: any | null;
  restoredYkiRuntime: any | null;
  setScreen: (screen: AppScreen) => void;
  login: (payload: { email: string; password: string }) => Promise<{ ok: boolean; message: string | null }>;
  loginWithGoogle: (payload: { oauth_result_id: string }) => Promise<{ ok: boolean; message: string | null }>;
  register: (payload: { email: string; password: string; name: string }) => Promise<{ ok: boolean; message: string | null }>;
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

function toPersistedSessionFromRestore(current: PersistedAuthSession, authUser: PersistedAuthSession["auth_user"]): PersistedAuthSession {
  return {
    ...current,
    auth_user: authUser,
    restored_at: new Date().toISOString(),
  };
}

function devSubscriptionStatus(user: PersistedAuthSession["auth_user"]): SubscriptionStatus {
  return {
    user_id: user.user_id,
    tier: "professional_premium",
    features: {
      general_finnish: { available: true, limit: -1, unit: "unlimited", message: "Dev mode override enabled." },
      workplace: { available: true, limit: -1, unit: "unlimited", message: "Dev mode override enabled." },
      yki: { available: true, limit: -1, unit: "unlimited", message: "Dev mode override enabled." },
    },
    expires_at: user.subscription_tier === "free" ? null : null,
    trial_ends_at: null,
    is_trial: false,
    is_active: true,
  };
}

function readRequestedScreen(pathname: string): AppScreen | null {
  if (pathname === "/debug") {
    return "debug";
  }
  if (pathname === "/settings") {
    return "settings";
  }
  if (pathname === "/practice" || pathname.startsWith("/practice/")) {
    return "practice";
  }
  if (pathname === "/conversation" || pathname.startsWith("/conversation/")) {
    return "conversation";
  }
  if (pathname === "/professional" || pathname.startsWith("/professional/")) {
    return "professional";
  }
  if (pathname === "/yki/result") {
    return "yki_result";
  }
  if (pathname === "/yki/runtime") {
    return "yki_runtime";
  }
  if (pathname === "/yki" || pathname === "/yki/intro" || pathname.startsWith("/yki/")) {
    return "yki_intro";
  }
  if (pathname === "/") {
    return null;
  }
  return "home";
}

export function AppStateProvider(props: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthState>({ status: "booting", session: null });
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [bootComplete, setBootComplete] = useState(false);
  const [screen, setScreenState] = useState<AppScreen>("home");
  const [restoredRoleplaySession, setRestoredRoleplaySession] = useState<any | null>(null);
  const [restoredYkiRuntime, setRestoredYkiRuntime] = useState<any | null>(null);

  function updateScreen(nextScreen: AppScreen, reason: string) {
    setScreenState((previous) => {
      if (previous !== nextScreen) {
        logNavigationEvent(`Screen changed to ${nextScreen}`, {
          from: previous,
          to: nextScreen,
          reason,
        });
      }
      return nextScreen;
    });
  }

  async function refreshSubscription() {
    const response = await fetchSubscriptionStatus();
    if (response.ok) {
      setSubscription(response.data);
      return;
    }
    if (DEV_MODE && auth.status === "authenticated") {
      setSubscription(devSubscriptionStatus(auth.session.auth_user));
    }
  }

  useEffect(() => {
    preloadAudio();
    playWelcome();
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const existing = loadAuthSession();
        if (!existing) {
          setAuth({ status: "unauthenticated", session: null });
          return;
        }

        setAuth({ status: "restoring", session: null });
        let current = existing;
        let sessionResponse = await restoreSession();
        if (!sessionResponse.ok && sessionResponse.error.code === "AUTH_SESSION_EXPIRED") {
          const refreshed = await refreshPersistedSession();
          if (!refreshed.ok) {
            setAuth({ status: "unauthenticated", session: null });
            return;
          }
          const reloaded = loadAuthSession();
          if (!reloaded) {
            setAuth({ status: "unauthenticated", session: null });
            return;
          }
          current = reloaded;
          sessionResponse = await restoreSession();
        }

        if (!sessionResponse.ok) {
          setAuth({ status: "unauthenticated", session: null });
          return;
        }

        const canonical = toPersistedSessionFromRestore(current, sessionResponse.data.auth_user);
        saveAuthSession(canonical);
        setAuth({ status: "authenticated", session: canonical });

        const subscriptionResponse = await fetchSubscriptionStatus();
        if (subscriptionResponse.ok) {
          setSubscription(subscriptionResponse.data);
        } else if (DEV_MODE) {
          setSubscription(devSubscriptionStatus(canonical.auth_user));
        }

        let restoredRoleplay: any | null = null;
        for (const cache of listRoleplayCaches()) {
          if (new Date(cache.expires_at).getTime() <= Date.now()) {
            removeRoleplayCache(cache.roleplay_session_id);
            continue;
          }
          const response = await fetchRoleplaySession(cache.roleplay_session_id);
          if (response.ok && response.data.status !== "expired") {
            restoredRoleplay = response.data;
            break;
          }
          removeRoleplayCache(cache.roleplay_session_id);
        }

        let restoredYki: any | null = null;
        for (const cache of listYkiCaches()) {
          const response = await fetchYkiSession(cache.exam_session_id);
          if (response.ok) {
            restoredYki = response.data.runtime;
            break;
          }
          removeYkiCache(cache.exam_session_id);
        }

        setRestoredRoleplaySession(restoredRoleplay);
        setRestoredYkiRuntime(restoredYki);
        const fallbackScreen = restoredYki ? "yki_runtime" : restoredRoleplay ? "conversation" : "home";
        const requestedScreen = typeof window !== "undefined" ? readRequestedScreen(window.location.pathname) : null;
        updateScreen(requestedScreen || fallbackScreen, "bootstrap");
      } catch {
        logDebugEvent("error", "runtime", "App bootstrap failed. Falling back to unauthenticated state.");
        setAuth({ status: "unauthenticated", session: null });
      } finally {
        setBootComplete(true);
      }
    }

    bootstrap();
  }, []);

  async function applySuccessfulAuth() {
    const stored = loadAuthSession();
    if (!stored) {
      return { ok: false, message: "Session persistence failed." };
    }
    setAuth({ status: "authenticated", session: stored });
    const subscriptionResponse = await fetchSubscriptionStatus();
    if (subscriptionResponse.ok) {
      setSubscription(subscriptionResponse.data);
    } else if (DEV_MODE) {
      setSubscription(devSubscriptionStatus(stored.auth_user));
    }
    updateScreen("home", "auth-success");
    setBootComplete(true);
    return { ok: true, message: null };
  }

  async function login(payload: { email: string; password: string }) {
    try {
      const response = await loginWithPassword(payload);
      if (!response.ok) {
        return { ok: false, message: response.error.message };
      }
      return applySuccessfulAuth();
    } catch {
      return { ok: false, message: "Transport request failed." };
    }
  }

  async function loginWithGoogle(payload: { oauth_result_id: string }) {
    try {
      const response = await completeGoogleAuth(payload);
      if (!response.ok) {
        return { ok: false, message: response.error.message };
      }
      return applySuccessfulAuth();
    } catch {
      return { ok: false, message: "Transport request failed." };
    }
  }

  async function register(payload: { email: string; password: string; name: string }) {
    try {
      const response = await registerWithPassword(payload);
      if (!response.ok) {
        return { ok: false, message: response.error.message };
      }
      return applySuccessfulAuth();
    } catch {
      return { ok: false, message: "Transport request failed." };
    }
  }

  async function logout() {
    await logoutSession();
    setAuth({ status: "unauthenticated", session: null });
    setSubscription(null);
    setRestoredRoleplaySession(null);
    setRestoredYkiRuntime(null);
    updateScreen("home", "logout");
  }

  return (
    <AppStateContext.Provider
      value={{
        auth,
        subscription,
        screen,
        bootComplete,
        restoredRoleplaySession,
        restoredYkiRuntime,
        setScreen: (nextScreen) => updateScreen(nextScreen, "ui"),
        login,
        loginWithGoogle,
        register,
        logout,
        refreshSubscription,
      }}
    >
      {props.children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider.");
  }
  return context;
}
