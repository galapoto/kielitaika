import { useEffect, useState } from "react";

import { audioManager } from "@core/audio/audioManager";
import {
  advanceExamSession,
  clearExamSession,
  getListeningPromptAudio,
  playExamPrompt,
  resolveExamMediaUrl,
  resumeExamSession,
  startExamSession,
  submitExamAnswer,
  submitExamAudio,
  type YkiExamSession,
} from "../services/ykiExamService";

type ErrorState = {
  code?: string;
  message: string;
  traceReference?: string | null;
} | null;

type HookState = {
  data: YkiExamSession | null;
  fatalError: ErrorState;
  loading: boolean;
  notice: string | null;
  transportError: ErrorState;
};

const initialState: HookState = {
  data: null,
  fatalError: null,
  loading: true,
  notice: null,
  transportError: null,
};

export default function useYkiExam() {
  const [state, setState] = useState<HookState>(initialState);

  function applyResponse(
    response:
      | {
          ok: boolean;
          data: YkiExamSession | null;
          error: ErrorState;
        }
      | null,
    transportNotice: string | null = null,
  ) {
    if (!response) {
      setState((current) => ({
        ...current,
        loading: false,
      }));
      return;
    }

    if (!response.ok || !response.data) {
      if (response.error?.code === "TRANSPORT_ERROR") {
        setState((current) => ({
          ...current,
          loading: false,
          notice: transportNotice,
          transportError: response.error,
        }));
        return;
      }

      setState((current) => ({
        ...current,
        fatalError: response.error ?? { message: "CONTRACT_VIOLATION" },
        loading: false,
        notice: null,
        transportError: null,
      }));
      return;
    }

    setState({
      data: response.data,
      fatalError: null,
      loading: false,
      notice: null,
      transportError: null,
    });
  }

  async function hydrate() {
    const resumed = await resumeExamSession();

    if (!resumed) {
      const started = await startExamSession();
      applyResponse(started, "Exam runtime could not reach the backend. Retry to re-establish the session.");
      return;
    }

    applyResponse(
      resumed,
      "Exam runtime lost contact with the backend. Retry to continue with engine state.",
    );
  }

  async function runAction(
    action: () => Promise<{
      ok: boolean;
      data: YkiExamSession | null;
      error: ErrorState;
    }>,
    transportNotice: string,
    options: { preserveVisibleData?: boolean } = {},
  ) {
    setState((current) => ({
      ...current,
      loading: options.preserveVisibleData && current.data ? false : true,
      notice: null,
      transportError: null,
    }));

    const response = await action();
    applyResponse(response, transportNotice);
    return response;
  }

  useEffect(() => {
    void hydrate();
  }, []);

  useEffect(() => {
    if (!state.data || state.data.navigation.read_only) {
      return;
    }

    const interval = setInterval(() => {
      void runAction(
        async () =>
          (await resumeExamSession()) ?? {
            ok: false,
            data: null,
            error: { message: "SESSION_NOT_FOUND" },
          },
        "Exam runtime lost contact with the backend. Retry to continue with engine state.",
        { preserveVisibleData: true },
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [state.data?.session_id, state.data?.current_view.view_key, state.data?.navigation.read_only]);

  return {
    ...state,
    advance: () =>
      runAction(
        advanceExamSession,
        "Advancing the exam failed because backend state could not be confirmed.",
      ),
    clearSession: clearExamSession,
    playPrompt: async () => {
      const response = await runAction(
        playExamPrompt,
        "Prompt playback could not be confirmed by the engine.",
      );

      if (!response.ok || !response.data) {
        return response;
      }

      const promptAudio = getListeningPromptAudio(response.data);
      if (!promptAudio?.ready || !promptAudio.url) {
        setState((current) => ({
          ...current,
          notice: "Pre-rendered listening audio is unavailable.",
        }));
        return response;
      }

      try {
        await audioManager.play(resolveExamMediaUrl(promptAudio.url));
        setState((current) => ({
          ...current,
          notice: "Playing cached listening prompt.",
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          notice:
            error instanceof Error
              ? error.message
              : "Pre-rendered listening audio failed to play.",
        }));
      }

      return response;
    },
    refresh: hydrate,
    submitAnswer: (answer: string) =>
      runAction(
        () => submitExamAnswer(answer),
        "Answer submission could not be confirmed by the engine.",
      ),
    submitAudio: (audio: string) =>
      runAction(
        () => submitExamAudio(audio),
        "Audio submission could not be confirmed by the engine.",
      ),
  };
}
