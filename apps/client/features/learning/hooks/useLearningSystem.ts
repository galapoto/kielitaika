import { useEffect, useMemo, useState } from "react";

import {
  completeLearningLesson,
  getLearningSystem,
  submitLearningLessonAnswer,
  type LearningLesson,
  type LearningModule,
  type LearningSystemData,
} from "../services/learningService";

type LearningRuntimeState = {
  data: LearningSystemData | null;
  errorMessage: string | null;
  errorTraceReference: string | null;
  loading: boolean;
};

function findModule(data: LearningSystemData | null, moduleId: string | null) {
  if (!data || !moduleId) {
    return null;
  }

  for (const level of data.levels) {
    const module = level.modules.find((item) => item.id === moduleId);
    if (module) {
      return module;
    }
  }

  return null;
}

function findLesson(module: LearningModule | null, lessonId: string | null) {
  if (!module || !lessonId) {
    return null;
  }

  return module.lessons.find((item) => item.id === lessonId) ?? null;
}

function resolveSelection(
  data: LearningSystemData,
  moduleId: string | null,
  lessonId: string | null,
) {
  const preferredModule = findModule(data, moduleId);
  const activeModule =
    preferredModule ??
    findModule(data, data.currentModuleId) ??
    data.levels[0]?.modules[0] ??
    null;

  if (!activeModule) {
    return {
      lessonId: null,
      moduleId: null,
    };
  }

  const preferredLesson = findLesson(activeModule, lessonId);
  const activeLesson =
    preferredLesson ??
    findLesson(activeModule, activeModule.currentLessonId) ??
    activeModule.lessons[0] ??
    null;

  return {
    lessonId: activeLesson?.id ?? null,
    moduleId: activeModule.id,
  };
}

export function useLearningSystem() {
  const [state, setState] = useState<LearningRuntimeState>({
    data: null,
    errorMessage: null,
    errorTraceReference: null,
    loading: true,
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [busyExerciseId, setBusyExerciseId] = useState<string | null>(null);
  const [completingLesson, setCompletingLesson] = useState(false);

  async function load(preferredModuleId?: string | null, preferredLessonId?: string | null) {
    setState((current) => ({
      ...current,
      errorMessage: null,
      errorTraceReference: null,
      loading: true,
    }));

    const response = await getLearningSystem();

    if (!response.ok || !response.data) {
      setState({
        data: null,
        errorMessage: response.error?.message ?? "CONTRACT_VIOLATION",
        errorTraceReference: response.error?.traceReference ?? null,
        loading: false,
      });
      return;
    }

    const nextSelection = resolveSelection(
      response.data,
      preferredModuleId ?? selectedModuleId,
      preferredLessonId ?? selectedLessonId,
    );

    setSelectedModuleId(nextSelection.moduleId);
    setSelectedLessonId(nextSelection.lessonId);
    setState({
      data: response.data,
      errorMessage: null,
      errorTraceReference: null,
      loading: false,
    });
  }

  useEffect(() => {
    void load();
  }, []);

  const activeModule = useMemo(
    () => findModule(state.data, selectedModuleId),
    [selectedModuleId, state.data],
  );
  const activeLesson = useMemo(
    () => findLesson(activeModule, selectedLessonId),
    [activeModule, selectedLessonId],
  );

  function selectModule(moduleId: string) {
    const module = findModule(state.data, moduleId);
    if (!module) {
      return;
    }

    setSelectedModuleId(module.id);
    setSelectedLessonId(module.currentLessonId ?? module.lessons[0]?.id ?? null);
  }

  function selectLesson(lessonId: string) {
    setSelectedLessonId(lessonId);
  }

  function setAnswerDraft(exerciseId: string, value: string) {
    setAnswerDrafts((current) => ({
      ...current,
      [exerciseId]: value,
    }));
  }

  async function submitAnswer(exerciseId: string, answer: string) {
    if (!activeModule || !activeLesson) {
      return;
    }

    setBusyExerciseId(exerciseId);
    const response = await submitLearningLessonAnswer(
      activeModule.id,
      activeLesson.id,
      exerciseId,
      answer,
    );
    setBusyExerciseId(null);

    if (!response.ok || !response.data) {
      setState((current) => ({
        ...current,
        errorMessage: response.error?.message ?? "CONTRACT_VIOLATION",
        errorTraceReference: response.error?.traceReference ?? null,
      }));
      return;
    }

    const nextSelection = resolveSelection(response.data, activeModule.id, activeLesson.id);

    setState({
      data: response.data,
      errorMessage: null,
      errorTraceReference: null,
      loading: false,
    });
    setSelectedModuleId(nextSelection.moduleId);
    setSelectedLessonId(nextSelection.lessonId);
    setAnswerDrafts((current) => ({
      ...current,
      [exerciseId]: "",
    }));
  }

  async function completeLesson() {
    if (!activeModule || !activeLesson) {
      return;
    }

    setCompletingLesson(true);
    const response = await completeLearningLesson(activeModule.id, activeLesson.id);
    setCompletingLesson(false);

    if (!response.ok || !response.data) {
      setState((current) => ({
        ...current,
        errorMessage: response.error?.message ?? "CONTRACT_VIOLATION",
        errorTraceReference: response.error?.traceReference ?? null,
      }));
      return;
    }

    const nextSelection = resolveSelection(response.data, activeModule.id, response.data.currentLessonId);

    setState({
      data: response.data,
      errorMessage: null,
      errorTraceReference: null,
      loading: false,
    });
    setSelectedModuleId(nextSelection.moduleId);
    setSelectedLessonId(nextSelection.lessonId);
  }

  return {
    activeLesson,
    activeModule,
    answerDrafts,
    busyExerciseId,
    completingLesson,
    data: state.data,
    errorMessage: state.errorMessage,
    errorTraceReference: state.errorTraceReference,
    loading: state.loading,
    refresh: load,
    selectLesson,
    selectModule,
    selectedLessonId,
    selectedModuleId,
    setAnswerDraft,
    submitAnswer,
    completeLesson,
  };
}
