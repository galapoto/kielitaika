import { useEffect, useState } from "react";

import {
  advanceDailyPracticeSession,
  startDailyPracticeSession,
  submitDailyPracticeAnswer,
  type DailyPracticeSession,
} from "../services/dailyPracticeService";

type ErrorState = {
  code?: string;
  message: string;
  traceReference?: string | null;
} | null;

type HookState = {
  data: DailyPracticeSession | null;
  loading: boolean;
  error: ErrorState;
};

const initialState: HookState = {
  data: null,
  loading: true,
  error: null,
};

export default function useDailyPractice() {
  const [state, setState] = useState<HookState>(initialState);

  async function hydrate() {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    const response = await startDailyPracticeSession();

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

  async function runAction(action: () => Promise<{
    ok: boolean;
    data: DailyPracticeSession | null;
    error: ErrorState;
  }>) {
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
      return runAction(() => advanceDailyPracticeSession(state.data!.session_id));
    },
    retry: hydrate,
    submit: async (answer: string) => {
      if (!state.data) {
        return null;
      }
      return runAction(() => submitDailyPracticeAnswer(state.data!.session_id, answer));
    },
  };
}
