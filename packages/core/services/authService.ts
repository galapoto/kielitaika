import { apiClient } from "../api/apiClient";

export type AuthUser = {
  email: string;
  id: string;
  name: string;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient<LoginResponse>("/api/v1/auth/login", {
      body: JSON.stringify({ email, password }),
      method: "POST",
    });

    if (!response.ok || !response.data) {
      if (response.error?.code === "NOT_FOUND") {
        throw new Error("AUTH_LOGIN_ENDPOINT_UNAVAILABLE");
      }

      throw new Error(response.error?.message ?? "LOGIN_FAILED");
    }

    return response.data;
  },
};
