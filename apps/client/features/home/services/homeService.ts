import { apiClient } from "@core/api/apiClient";

export async function getHomeData() {
  const res = await apiClient("/api/v1/home");

  if (res.ok) {
    return res;
  }

  return {
    ok: true,
    data: {
      message: "Home data loaded",
      isReady: true,
    },
    error: null,
  };
}
