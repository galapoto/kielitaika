import { useEffect, useState } from "react";

import {
  getModuleProgress,
  getModulePractice,
  getRecommendedPractice,
  getUnitProgress,
  type PracticeBundle,
  submitPracticeResult,
  type ModuleProgress,
  type UnitProgress,
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
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(null);
  const [unitProgress, setUnitProgress] = useState<UnitProgress | null>(null);

  async function hydrateProgress(data: PracticeBundle) {
    const [moduleProgressRes, unitProgressRes] = await Promise.all([
      getModuleProgress(data.module.id),
      data.exercises[0] ? getUnitProgress(data.exercises[0].unit_id) : Promise.resolve(null),
    ]);

    setModuleProgress(moduleProgressRes?.ok && moduleProgressRes.data ? moduleProgressRes.data : null);
    setUnitProgress(unitProgressRes?.ok && unitProgressRes.data ? unitProgressRes.data : null);
  }

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
      await hydrateProgress(res.data);
      return;
    }

    setState({
      data: null,
      loading: false,
      error: res.error ?? { message: "PRACTICE_NOT_AVAILABLE" },
    });
    setModuleProgress(null);
    setUnitProgress(null);
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
        await hydrateProgress(res.data);
        return;
      }

      setState({
        data: null,
        loading: false,
        error: res.error ?? { message: "PRACTICE_NOT_AVAILABLE" },
      });
      setModuleProgress(null);
      setUnitProgress(null);
    }

    load();
  }, [moduleId]);

  const currentExercise = state.data?.exercises[currentIndex] ?? null;

  useEffect(() => {
    async function loadCurrentUnitProgress() {
      if (!currentExercise) {
        setUnitProgress(null);
        return;
      }

      const res = await getUnitProgress(currentExercise.unit_id);
      setUnitProgress(res.ok && res.data ? res.data : null);
    }

    loadCurrentUnitProgress();
  }, [currentExercise?.id, currentExercise?.unit_id]);

  async function submitAnswer() {
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

    const res = await submitPracticeResult(currentExercise, isCorrect);
    if (res.ok && res.data) {
      setUnitProgress(res.data.unitProgress);
      setModuleProgress(res.data.moduleProgress);
    }
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
    moduleProgress,
    unitProgress,
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
