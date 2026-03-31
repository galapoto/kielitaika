import type { ApiResponse } from "../models/apiTypes";
import { getApiBaseUrl } from "./apiConfig";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers,
    });
    const payload = await res.json();

    if (!payload || typeof payload.ok !== "boolean") {
      return {
        ok: false,
        data: null,
        error: {
          code: res.status === 404 ? "NOT_FOUND" : "API_CONTRACT_ERROR",
          message: res.status === 404 ? "Endpoint not found" : "Invalid API response shape",
          retryable: false,
        },
      };
    }

    return payload as ApiResponse<T>;
  } catch {
    return {
      ok: false,
      data: null,
      error: {
        code: "NETWORK_ERROR",
        message: "NETWORK_ERROR",
        retryable: true,
      },
    };
  }
}
