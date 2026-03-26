import { apiRequest } from "./apiClient";
import type { ApiEnvelope, SubscriptionStatus } from "../state/types";

export async function fetchSubscriptionStatus(): Promise<ApiEnvelope<SubscriptionStatus>> {
  return apiRequest<SubscriptionStatus>({
    method: "GET",
    path: "/api/v1/subscription/status",
    auth: true,
  });
}
