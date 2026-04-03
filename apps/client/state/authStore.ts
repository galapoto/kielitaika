import { create } from "zustand";

import { env } from "@core/config/env";
import { setAuthToken } from "@core/api/apiClient";
import { mockLogin } from "@core/services/authService";
import { storageService } from "@core/services/storageService";
import type { AuthUser } from "@core/services/authService";

const AUTH_SESSION_KEY = "auth_session";

type StoredAuthSession = {
  token: string;
  user: AuthUser;
};

type AuthState = {
  hasHydrated: boolean;
  token: string | null;
  user: AuthUser | null;
  hydrateSession: () => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: AuthUser, token: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  hasHydrated: false,
  token: null,
  user: null,
  async hydrateSession() {
    try {
      const storedSession = await storageService.get(AUTH_SESSION_KEY);

      if (isStoredAuthSession(storedSession)) {
        setAuthToken(storedSession.token);
        set({
          hasHydrated: true,
          token: storedSession.token,
          user: storedSession.user,
        });
        return;
      }
    } catch {
      // Fall through to a cleared auth state if persisted data is missing or invalid.
    }

    if (env.AUTO_MOCK_AUTH_ENABLED) {
      const mockSession = await mockLogin();
      await storageService.set(AUTH_SESSION_KEY, mockSession);
      setAuthToken(mockSession.token);
      set({
        hasHydrated: true,
        token: mockSession.token,
        user: mockSession.user,
      });
      return;
    }

    setAuthToken(null);
    set({
      hasHydrated: true,
      token: null,
      user: null,
    });
  },
  async logout() {
    await storageService.remove(AUTH_SESSION_KEY);
    setAuthToken(null);
    set({
      hasHydrated: true,
      token: null,
      user: null,
    });
  },
  async setAuth(user, token) {
    set({
      hasHydrated: true,
      token,
      user,
    });

    void storageService.set(AUTH_SESSION_KEY, {
      token,
      user,
    });
  },
}));

function isStoredAuthSession(value: unknown): value is StoredAuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<StoredAuthSession>;

  return typeof session.token === "string" && Boolean(session.token) && isAuthUser(session.user);
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Partial<AuthUser>;

  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string"
  );
}
