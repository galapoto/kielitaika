import { env } from "../config/env";
import { apiClient, ContractViolationError } from "../api/apiClient";

export type AuthUser = {
  email: string;
  id: string;
  name: string;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export const mockToken = "mock-auth-token";

export const mockUser: AuthUser = {
  email: "learner@kielitaika.local",
  id: "mock-user",
  name: "KieliTaika Learner",
};

export async function mockLogin(email?: string): Promise<LoginResponse> {
  const normalizedEmail = email?.trim().toLowerCase() || mockUser.email;
  const localPart = normalizedEmail.split("@")[0] || "learner";
  const normalizedName = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    token: mockToken,
    user: {
      ...mockUser,
      email: normalizedEmail,
      name: normalizedName || mockUser.name,
    },
  };
}

export const authService = {
  async login(email: string, password: string) {
    let response;

    try {
      response = await apiClient<LoginResponse>("/api/v1/auth/login", {
        body: JSON.stringify({ email, password }),
        method: "POST",
      }, {
        validateData: (payload) => payload as LoginResponse,
      });
    } catch (error) {
      if (error instanceof ContractViolationError) {
        throw new Error(error.code);
      }

      throw error;
    }

    if (!response.ok || !response.data) {
      const isFallbackEligible =
        response.error?.code === "NOT_FOUND" || response.error?.code === "TRANSPORT_ERROR";

      if (env.MOCK_AUTH_FALLBACK_ENABLED && isFallbackEligible) {
        return mockLogin(email);
      }

      if (response.error?.code === "NOT_FOUND") {
        throw new Error("AUTH_LOGIN_ENDPOINT_UNAVAILABLE");
      }

      throw new Error(response.error?.message ?? "LOGIN_FAILED");
    }

    return response.data;
  },
};
