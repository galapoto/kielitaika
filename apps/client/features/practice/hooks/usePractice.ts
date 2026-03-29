import { useEffect, useState } from "react";

import {
  getModulePractice,
  getRecommendedPractice,
  type PracticeBundle,
} from "../services/practiceService";

type PracticeFeedback = {
  isCorrect: boolean;
  submittedAnswer: string;
};

type PracticeState = {
  data: PracticeBundle | null;
  loading: boolean;
  error: { message: string } | null;
};

export default function usePractice(moduleId: string | null) {
  const [state, setState] = useState<PracticeState>({
    data: null,
    loading: true,
    error: null,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);

  async function loadPractice(activeModuleId: string | null) {
    setState((current) => ({ ...current, loading: true }));

    const res = activeModuleId
      ? await getModulePractice(activeModuleId)
      : await getRecommendedPractice();

    if (res.ok && res.data) {
      setState({ data: res.data, loading: false, error: null });
      setCurrentIndex(0);
      setAnswer("");
      setSubmitted(false);
      setFeedback(null);
      return;
    }

    setState({
      data: null,
      loading: false,
      error: res.error ?? { message: "PRACTICE_NOT_AVAILABLE" },
    });
  }

  useEffect(() => {
    setState((current) => ({ ...current, loading: true }));

    async function load() {
      const res = moduleId
        ? await getModulePractice(moduleId)
        : await getRecommendedPractice();

      if (res.ok && res.data) {
        setState({ data: res.data, loading: false, error: null });
        setCurrentIndex(0);
        setAnswer("");
        setSubmitted(false);
        setFeedback(null);
        return;
      }

      setState({
        data: null,
        loading: false,
        error: res.error ?? { message: "PRACTICE_NOT_AVAILABLE" },
      });
    }

    load();
  }, [moduleId]);

  const currentExercise = state.data?.exercises[currentIndex] ?? null;

  function submitAnswer() {
    if (!currentExercise || submitted) {
      return;
    }

    const normalizedSubmittedAnswer = normalizeAnswer(answer);
    const normalizedCorrectAnswer = normalizeAnswer(currentExercise.correct_answer);
    const isCorrect = normalizedSubmittedAnswer === normalizedCorrectAnswer;

    setFeedback({
      isCorrect,
      submittedAnswer: answer.trim(),
    });
    setSubmitted(true);
  }

  function nextExercise() {
    if (!state.data) {
      return;
    }

    setCurrentIndex((index) => index + 1);
    setAnswer("");
    setSubmitted(false);
    setFeedback(null);
  }

  function restartPractice() {
    setCurrentIndex(0);
    setAnswer("");
    setSubmitted(false);
    setFeedback(null);
  }

  return {
    ...state,
    currentIndex,
    currentExercise,
    answer,
    submitted,
    feedback,
    setAnswer,
    submitAnswer,
    nextExercise,
    restartPractice,
    reloadPractice: () => loadPractice(moduleId),
  };
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase();
}
