import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import Screen from "@ui/components/layout/Screen";
import Section from "@ui/components/layout/Section";
import Text from "@ui/components/primitives/Text";
import YkiPracticeScreen from "@ui/screens/YkiPracticeScreen";

import useYkiPractice from "../features/yki-practice/hooks/useYkiPractice";
import { useAuthStore } from "./authStore";

export default function YkiPracticeRoute() {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const {
    data,
    error,
    latestResult,
    loading,
    notice,
    advanceTask,
    refreshSession,
    retrySection,
    retryTask,
    startSession,
    submitAnswer,
  } = useYkiPractice();
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user) {
      router.replace("/auth");
    }
  }, [hasHydrated, router, user]);

  useEffect(() => {
    setAnswer(data?.currentTask?.submittedAnswer ?? "");
  }, [data?.currentTask?.id, data?.currentTask?.submittedAnswer]);

  useEffect(() => {
    if (!loading && !error && !data) {
      void startSession();
    }
  }, [data, error, loading, startSession]);

  const trace = useMemo(() => {
    if (!data?.sessionTrace) {
      return null;
    }

    return {
      decisionVersion: data.sessionTrace.decision_version,
      examMode: data.examMode ?? data.sessionTrace.exam_mode ?? false,
      policyVersion: data.sessionTrace.policy_version ?? "legacy",
      precomputedPlanSummary: data.precomputedPlan?.task_ids.join(", ") ?? "legacy session plan",
      tasks: data.sessionTrace.tasks.slice(0, 5).map((item) => ({
        difficultyLevel: item.difficulty_level,
        reason: item.task_selection_reason,
        relatedLearningUnitId: item.relatedLearningUnitId,
        taskId: item.taskId,
      })),
    };
  }, [data?.sessionTrace]);

  const auditTimeline = useMemo(() => {
    return (
      data?.auditTimeline?.slice(-10).map((event) => {
        const taskId =
          (event.output_snapshot.task_id as string | undefined) ??
          (event.input_snapshot.task_id as string | undefined);
        return `${event.timestamp} | ${event.event_type} | decision ${event.decision_version} | policy ${event.policy_version}${taskId ? ` | task ${taskId}` : ""}`;
      }) ?? []
    );
  }, [data?.auditTimeline]);

  const auditReplaySummary = useMemo(() => {
    if (!data?.auditVerification) {
      return [];
    }

    const counts = data.auditReplay
      ? Object.entries(data.auditReplay.eventCounts)
          .map(([key, value]) => `${key} ${value}`)
          .join(", ")
      : "";

    return [
      `Replay verification: ${data.auditVerification.ok ? "consistent" : "issues detected"}`,
      counts ? `Audit counts: ${counts}` : "Audit counts unavailable.",
      ...(data.auditVerification.issues ?? []).slice(0, 4),
    ];
  }, [data?.auditReplay, data?.auditVerification]);

  if (!hasHydrated || !user) {
    return (
      <Screen>
        <Section>
          <Text variant="title">YKI Practice</Text>
          <Text tone="secondary">Preparing your practice session...</Text>
        </Section>
      </Screen>
    );
  }

  return (
    <YkiPracticeScreen
      answer={answer}
      auditReplaySummary={auditReplaySummary}
      auditTimeline={auditTimeline}
      errorMessage={error?.message ?? null}
      latestResult={
        latestResult
          ? {
              explanation: latestResult.explanation,
              score: latestResult.score,
              whyWrong: latestResult.whyWrong,
            }
          : null
      }
      loading={loading}
      notice={notice}
      onAdvance={() => {
        void advanceTask();
      }}
      onAnswerChange={setAnswer}
      onBack={() => router.push("/")}
      onRefresh={() => {
        void refreshSession();
      }}
      onRetrySection={() => {
        void retrySection();
      }}
      onRetryTask={() => {
        void retryTask();
      }}
      onStart={() => {
        void startSession();
      }}
      onSubmit={() => {
        void submitAnswer(answer);
      }}
      sessionId={data?.session_id ?? null}
      task={
        data?.currentTask
          ? {
              guidance: data.currentTask.guidance,
              id: data.currentTask.id,
              options: data.currentTask.options,
              prompt: data.currentTask.prompt,
              question: data.currentTask.question,
              section: data.currentTask.section,
              title: data.currentTask.title,
            }
          : null
      }
      trace={trace}
    />
  );
}
