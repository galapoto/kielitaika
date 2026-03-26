import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

import { loginWithPassword, logout as clearLocalAuth, registerWithPassword, restoreSession } from "../services/authService";
import { refreshPersistedSession } from "../services/apiClient";
import { playWelcome, preloadAudio } from "../services/audioService";
import { fetchRoleplaySession } from "../services/roleplayService";
import { listRoleplayCaches, listYkiCaches, loadAuthSession, removeRoleplayCache, removeYkiCache, saveAuthSession } from "../services/storage";
import { fetchSubscriptionStatus } from "../services/subscriptionService";
import { fetchYkiSession } from "../services/ykiService";
import type { AuthState, PersistedAuthSession, RouteKey, SubscriptionStatus } from "./types";

type AppStateContextValue = {
  auth: AuthState;
  subscription: SubscriptionStatus | null;
  route: RouteKey;
  bootComplete: boolean;
  restoredRoleplaySession: any | null;
  restoredYkiRuntime: any | null;
  setRoute: (route: RouteKey) => void;
  login: (payload: { email: string; password: string }) => Promise<{ ok: boolean; message: string | null }>;
  register: (payload: { email: string; password: string; name: string }) => Promise<{ ok: boolean; message: string | null }>;
  logout: () => void;
  refreshSubscription: () => Promise<void>;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

function toPersistedSessionFromRestore(current: PersistedAuthSession, authUser: PersistedAuthSession["auth_user"]): PersistedAuthSession {
  return {
    ...current,
    auth_user: authUser,
    stored_at: new Date().toISOString(),
  };
}

export function AppStateProvider(props: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthState>({ status: "booting", session: null });
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [bootComplete, setBootComplete] = useState(false);
  const [route, setRoute] = useState<RouteKey>("dashboard");
  const [restoredRoleplaySession, setRestoredRoleplaySession] = useState<any | null>(null);
  const [restoredYkiRuntime, setRestoredYkiRuntime] = useState<any | null>(null);

  async function refreshSubscription() {
    const response = await fetchSubscriptionStatus();
    if (response.ok) {
      setSubscription(response.data);
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
        setRoute(restoredYki ? "yki" : restoredRoleplay ? "roleplay" : "dashboard");
      } catch {
        setAuth({ status: "unauthenticated", session: null });
      } finally {
        setBootComplete(true);
      }
    }

    bootstrap();
  }, []);

  async function login(payload: { email: string; password: string }) {
    try {
      const response = await loginWithPassword(payload);
      if (!response.ok) {
        return { ok: false, message: response.error.message };
      }
      const stored = loadAuthSession();
      if (!stored) {
        return { ok: false, message: "Session persistence failed." };
      }
      setAuth({ status: "authenticated", session: stored });
      const subscriptionResponse = await fetchSubscriptionStatus();
      if (subscriptionResponse.ok) {
        setSubscription(subscriptionResponse.data);
      }
      setRoute("dashboard");
      setBootComplete(true);
      return { ok: true, message: null };
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
      const stored = loadAuthSession();
      if (!stored) {
        return { ok: false, message: "Session persistence failed." };
      }
      setAuth({ status: "authenticated", session: stored });
      const subscriptionResponse = await fetchSubscriptionStatus();
      if (subscriptionResponse.ok) {
        setSubscription(subscriptionResponse.data);
      }
      setRoute("dashboard");
      setBootComplete(true);
      return { ok: true, message: null };
    } catch {
      return { ok: false, message: "Transport request failed." };
    }
  }

  function logout() {
    clearLocalAuth();
    setAuth({ status: "unauthenticated", session: null });
    setSubscription(null);
    setRestoredRoleplaySession(null);
    setRestoredYkiRuntime(null);
    setRoute("dashboard");
  }

  return (
    <AppStateContext.Provider
      value={{
        auth,
        subscription,
        route,
        bootComplete,
        restoredRoleplaySession,
        restoredYkiRuntime,
        setRoute,
        login,
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
