import { useEffect, useState } from "react";

import {
  clearPracticeSession,
  downloadPracticeCertification,
  resumePracticeSession,
  startPracticeSession,
  submitPracticeTask,
  type YkiPracticeResult,
  type YkiPracticeSession,
} from "../services/ykiPracticeService";

type HookState = {
  data: YkiPracticeSession | null;
  loading: boolean;
  error: { code?: string; message: string; traceReference?: string | null } | null;
  notice: string | null;
};

const initialState: HookState = {
  data: null,
  loading: true,
  error: null,
  notice: null,
};

export default function useYkiPractice() {
  const [state, setState] = useState<HookState>(initialState);

  async function hydrate() {
    const res = await resumePracticeSession();

    if (!res) {
      setState({ data: null, loading: false, error: null, notice: null });
      return;
    }

    if (!res.ok || !res.data) {
      await clearPracticeSession();
      setState({
        data: null,
        loading: false,
        error: res.error ?? { message: "SESSION_NOT_FOUND" },
        notice: null,
      });
      return;
    }

    setState({
      data: res.data,
      loading: false,
      error: null,
      notice: null,
    });
  }

  async function handleStartSession() {
    setState((current) => ({ ...current, loading: true, error: null }));
    const res = await startPracticeSession();

    if (!res.ok || !res.data) {
      setState({
        data: null,
        loading: false,
        error: res.error ?? { message: "YKI_PRACTICE_START_FAILED" },
        notice: null,
      });
      return;
    }

    setState({
      data: res.data,
      loading: false,
      error: null,
      notice: "Practice session ready.",
    });
  }

  async function handleSessionAction(
    action: "submit_only" | "advance",
    answer?: string,
  ) {
    const res = await submitPracticeTask(action, answer);

    if (!res.ok || !res.data) {
      setState((current) => ({
        ...current,
        error: res.error ?? { message: "YKI_PRACTICE_UPDATE_FAILED" },
      }));
      return;
    }

    setState((current) => ({
      ...current,
      data: res.data,
      error: null,
      notice: null,
    }));
  }

  useEffect(() => {
    void hydrate();
  }, []);

  async function handleDownloadResult() {
    if (!state.data?.session_id) {
      return;
    }

    const res = await downloadPracticeCertification(state.data.session_id);
    setState((current) => ({
      ...current,
      error: !res.ok ? res.error ?? { message: "CERTIFICATION_NOT_FOUND" } : current.error,
      notice: res.ok ? "Certification export prepared." : current.notice,
    }));
  }

  const latestResult: YkiPracticeResult | null =
    state.data?.results[state.data.results.length - 1] ?? null;

  return {
    ...state,
    latestResult,
    startSession: handleStartSession,
    refreshSession: hydrate,
    submitAnswer: (answer: string) => handleSessionAction("submit_only", answer),
    advanceTask: () => handleSessionAction("advance"),
    downloadResult: handleDownloadResult,
    clearSession: clearPracticeSession,
  };
}
