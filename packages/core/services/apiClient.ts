import { env } from "../config/env";

export async function apiClient(path: string, options: RequestInit = {}) {
  const url = `${env.API_URL}${path}`;

  let response;

  try {
    response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw {
      type: "TRANSPORT_ERROR",
      message: "Network request failed",
      retryable: true,
    };
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw {
      type: "PARSE_ERROR",
      message: "Invalid JSON response",
      retryable: false,
    };
  }

  if (!data || typeof data.ok !== "boolean") {
    throw {
      type: "CONTRACT_VIOLATION",
      message: "Invalid API response shape",
      retryable: false,
    };
  }

  if (!data.ok) {
    throw {
      type: data.error?.code || "API_ERROR",
      message: data.error?.message || "Unknown error",
      retryable: data.error?.retryable ?? false,
    };
  }

  return data.data;
}
