import { apiClient } from "./apiClient";

export const ykiService = {
  async startExam() {
    return apiClient("/api/v1/yki/start", {
      method: "POST",
    });
  },

  async getSession(sessionId: string) {
    return apiClient(`/api/v1/yki/session/${sessionId}`);
  },
};
