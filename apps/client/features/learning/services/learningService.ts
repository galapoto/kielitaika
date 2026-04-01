import { apiClient, ContractViolationError } from "@core/api/apiClient";
import { validateLearningModulesPayload } from "@core/api/governedResponseValidation";

type ApiError = {
  code?: string;
  message: string;
  traceReference?: string | null;
};

type ApiResponse<T> = {
  ok: boolean;
  data: T | null;
  error: ApiError | null;
};

export type LearningExerciseProgress = {
  exerciseId: string;
  attempted: boolean;
  lastCorrect: boolean | null;
  lastSubmittedAnswer: string | null;
};

export type LearningLessonProgress = {
  completed: boolean;
  completedAt: string | null;
  answeredExerciseIds: string[];
  allExercisesCorrect: boolean;
  exerciseProgress: LearningExerciseProgress[];
};

export type LearningLessonExercise = {
  id: string;
  title: string;
  prompt: string;
  inputMode: "choice" | "text";
  options: string[];
  explanation: string;
  deterministicKey: string;
};

export type LearningLessonItem = {
  id: string;
  label: string;
  value: string;
};

export type LearningLesson = {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  examples: string[];
  items: LearningLessonItem[];
  exercises: LearningLessonExercise[];
  progress: LearningLessonProgress;
};

export type LearningModule = {
  id: string;
  title: string;
  description: string;
  levelId: string;
  levelLabel: string;
  currentLessonId: string;
  completedLessonCount: number;
  totalLessonCount: number;
  progressPercent: number;
  lessons: LearningLesson[];
};

export type LearningLevel = {
  id: string;
  title: string;
  cefr: string;
  description: string;
  modules: LearningModule[];
};

export type LearningModuleProgress = {
  moduleId: string;
  title: string;
  completedLessonCount: number;
  totalLessonCount: number;
  currentLessonId: string;
  progressPercent: number;
};

export type LearningLatestEvaluation = {
  lessonId: string;
  exerciseId: string;
  correct: boolean;
  submittedAnswer: string;
  expectedAnswer: string;
  explanation: string;
};

export type LearningSystemData = {
  levels: LearningLevel[];
  moduleProgress: LearningModuleProgress[];
  currentLevelId: string | null;
  currentModuleId: string | null;
  currentLessonId: string | null;
  completedLessonIds: string[];
  completedLessonCount: number;
  totalLessonCount: number;
  latestEvaluation: LearningLatestEvaluation | null;
  latestTransition: string | null;
  decisionVersion: string;
  policyVersion: string;
  governanceVersion: string;
  changeReference: string | null;
  governanceStatus: "governed" | "legacy_uncontrolled";
};

function normalizeError(
  error:
    | {
        code?: string;
        event_id?: string | null;
        message?: string;
        traceReference?: string | null;
        trace_id?: string | null;
      }
    | null
    | undefined,
): ApiError {
  if (!error) {
    return {
      code: "CONTRACT_VIOLATION",
      message: "CONTRACT_VIOLATION",
      traceReference: null,
    };
  }

  return {
    code: typeof error.code === "string" ? error.code : "CONTRACT_VIOLATION",
    message: typeof error.message === "string" ? error.message : "CONTRACT_VIOLATION",
    traceReference:
      typeof error.traceReference === "string"
        ? error.traceReference
        : typeof error.trace_id === "string"
          ? error.trace_id
          : null,
  };
}

async function withLearningValidation(
  path: string,
  options: {
    body?: Record<string, unknown>;
    method?: "GET" | "POST";
  } = {},
) {
  try {
    const response = await apiClient<Record<string, unknown>>(path, {
      body: options.body ? JSON.stringify(options.body) : undefined,
      method: options.method ?? "GET",
    }, {
      validateData: (payload: Record<string, unknown>) =>
        validateLearningModulesPayload(payload),
    });

    if (!response.ok || !response.data) {
      return {
        ok: false,
        data: null,
        error: normalizeError(response.error),
      };
    }

    return {
      ok: true,
      data: response.data as LearningSystemData,
      error: null,
    };
  } catch (error) {
    if (error instanceof ContractViolationError) {
      return {
        ok: false,
        data: null,
        error: {
          code: error.code,
          message: error.code,
          traceReference: null,
        },
      };
    }

    throw error;
  }
}

export async function getLearningSystem() {
  return withLearningValidation("/api/v1/learning/modules") as Promise<
    ApiResponse<LearningSystemData>
  >;
}

export async function submitLearningLessonAnswer(
  moduleId: string,
  lessonId: string,
  exerciseId: string,
  answer: string,
) {
  return withLearningValidation(
    `/api/v1/learning/modules/${moduleId}/lessons/${lessonId}/answer`,
    {
      body: {
        answer,
        exerciseId,
      },
      method: "POST",
    },
  ) as Promise<ApiResponse<LearningSystemData>>;
}

export async function completeLearningLesson(moduleId: string, lessonId: string) {
  return withLearningValidation(
    `/api/v1/learning/modules/${moduleId}/lessons/${lessonId}/complete`,
    {
      method: "POST",
    },
  ) as Promise<ApiResponse<LearningSystemData>>;
}
