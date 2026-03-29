import { getApiBaseUrl } from "./apiConfig";

export async function apiClient(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, options);
    return await res.json();
  } catch {
    return {
      ok: false,
      data: null,
      error: { message: "NETWORK_ERROR" },
    };
  }
}
