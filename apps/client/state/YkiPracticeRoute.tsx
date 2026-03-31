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

  const untrustedStateMessage = useMemo(() => {
    if (data?.governanceStatus === "legacy_uncontrolled") {
      return "UNTRUSTED_STATE: YKI playback metadata is legacy and not governed.";
    }

    return null;
  }, [data?.governanceStatus]);

  const trace = useMemo(() => {
    if (!data?.sessionTrace || !data.precomputedPlan) {
      return null;
    }

    return {
      decisionVersion: data.sessionTrace.decision_version,
      examMode: data.sessionTrace.exam_mode,
      governanceVersion: data.sessionTrace.governance_version,
      policyVersion: data.sessionTrace.policy_version,
      changeReference: data.sessionTrace.change_reference,
      precomputedPlanSummary: data.precomputedPlan.task_ids.join(", "),
      tasks: data.sessionTrace.tasks.slice(0, 5).map((item) => ({
        difficultyLevel: item.difficulty_level,
        reason: item.task_selection_reason,
        relatedLearningUnitId: item.relatedLearningUnitId,
        taskId: item.taskId,
      })),
    };
  }, [data]);

  const auditTimeline = useMemo(
    () =>
      data?.auditTimeline?.slice(-10).map((event) => {
        const taskId =
          (event.output_snapshot.task_id as string | undefined) ??
          (event.input_snapshot.task_id as string | undefined);
        return `${event.timestamp} | ${event.event_type} | decision ${event.decision_version} | policy ${event.policy_version}${taskId ? ` | task ${taskId}` : ""}`;
      }) ?? [],
    [data?.auditTimeline],
  );

  const auditReplaySummary = useMemo(() => {
    if (!data?.auditVerification || !data.auditReplay) {
      return [];
    }

    const integrity = data.auditVerification.integrity;
    const counts = Object.entries(data.auditReplay.eventCounts)
      .map(([key, value]) => `${key} ${value}`)
      .join(", ");

    return [
      `Integrity status: ${integrity.integrityStatus}`,
      `Governance version: ${data.governanceVersion}`,
      `Change reference: ${data.changeReference ?? "none"}`,
      `Replay verification: ${data.auditVerification.ok ? "consistent" : "issues detected"}`,
      `Hash chain length: ${integrity.chainLength}`,
      integrity.failureEventId
        ? `Failure point: ${integrity.failureEventId} at index ${integrity.failureIndex}`
        : "Failure point: none",
      counts ? `Audit counts: ${counts}` : "Audit counts unavailable.",
      integrity.failureReason ?? "Audit chain is intact.",
      ...(data.auditVerification.issues ?? []).slice(0, 4),
    ];
  }, [data]);

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
      canAdvance={Boolean(data?.currentTask?.evaluation)}
      changeReference={data?.changeReference ?? null}
      errorMessage={error?.message ?? null}
      governanceStatus={data?.governanceStatus ?? "governed"}
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
      onStart={() => {
        void startSession();
      }}
      onSubmit={() => {
        void submitAnswer(answer);
      }}
      policyVersion={data?.policyVersion ?? null}
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
      untrustedStateMessage={untrustedStateMessage}
    />
  );
}
