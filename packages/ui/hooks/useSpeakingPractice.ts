import { useEffect, useState } from "react";

import {
  advanceSpeakingPracticeSession,
  startSpeakingPracticeSession,
  submitSpeakingPracticeResponse,
  type SpeakingPracticeSession,
} from "@core/services/speakingPracticeService";

type ErrorState = {
  code?: string;
  message: string;
  traceReference?: string | null;
} | null;

type HookState = {
  data: SpeakingPracticeSession | null;
  loading: boolean;
  error: ErrorState;
};

const initialState: HookState = {
  data: null,
  loading: true,
  error: null,
};

export default function useSpeakingPractice() {
  const [state, setState] = useState<HookState>(initialState);

  async function hydrate() {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    const response = await startSpeakingPracticeSession();

    if (!response.ok || !response.data) {
      setState({
        data: null,
        loading: false,
        error: response.error,
      });
      return response;
    }

    setState({
      data: response.data,
      loading: false,
      error: null,
    });
    return response;
  }

  useEffect(() => {
    void hydrate();
  }, []);

  async function runAction(
    action: () => Promise<{
      ok: boolean;
      data: SpeakingPracticeSession | null;
      error: ErrorState;
    }>,
  ) {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    const response = await action();

    if (!response.ok || !response.data) {
      setState((current) => ({
        ...current,
        loading: false,
        error: response.error,
      }));
      return response;
    }

    setState({
      data: response.data,
      loading: false,
      error: null,
    });
    return response;
  }

  return {
    ...state,
    next: async () => {
      if (!state.data) {
        return null;
      }

      return runAction(() => advanceSpeakingPracticeSession(state.data!.session_id));
    },
    retry: hydrate,
    submit: async (transcript: string, recordingCaptured: boolean) => {
      if (!state.data) {
        return null;
      }

      return runAction(() =>
        submitSpeakingPracticeResponse(state.data!.session_id, transcript, recordingCaptured),
      );
    },
  };
}
