import { useEffect, useMemo, useState } from "react";

import ApplicationErrorScreen from "@ui/screens/ApplicationErrorScreen";
import YkiPracticeScreen from "@ui/screens/YkiPracticeScreen";

import useYkiPractice from "../features/yki-practice/hooks/useYkiPractice";
import { useNetworkStore } from "./networkStore";

type Props = {
  onBack: () => void;
};

export default function YkiPracticeRoute({ onBack }: Props) {
  const isOffline = useNetworkStore((state) => state.isOffline);
  const {
    data,
    error,
    latestResult,
    loading,
    notice,
    advanceTask,
    refreshSession,
    submitAnswer,
  } = useYkiPractice();
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setAnswer(data?.currentTask?.submittedAnswer ?? "");
  }, [data?.currentTask?.id, data?.currentTask?.submittedAnswer]);

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

  if (
    error?.message === "SESSION_CORRUPTED" ||
    error?.message === "SESSION_OUTDATED" ||
    error?.message === "CONTRACT_VIOLATION"
  ) {
    return (
      <ApplicationErrorScreen
        code={error.message}
        message="YKI runtime integrity validation failed. The session has been blocked."
        onPrimaryAction={onBack}
        primaryLabel="Return Home"
      />
    );
  }

  return (
    <YkiPracticeScreen
      answer={answer}
      auditReplaySummary={auditReplaySummary}
      auditTimeline={auditTimeline}
      canAdvance={data?.next_allowed_action === "advance"}
      changeReference={data?.changeReference ?? null}
      completionState={data?.completion_state ?? null}
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
      notice={
        isOffline
          ? "Offline mode: YKI playback is read-only until the session can be revalidated."
          : notice
      }
      offlineMessage={
        isOffline
          ? "Offline mode: YKI playback is read-only until the session can be revalidated."
          : null
      }
      onAdvance={() => {
        if (isOffline) {
          return;
        }

        void advanceTask();
      }}
      onAnswerChange={setAnswer}
      onBack={onBack}
      onRefresh={() => {
        if (isOffline) {
          return;
        }

        void refreshSession();
      }}
      onSubmit={() => {
        if (isOffline) {
          return;
        }

        void submitAnswer(answer);
      }}
      policyVersion={data?.policyVersion ?? null}
      sessionId={data?.session_id ?? null}
      task={
        data?.completion_state.status !== "completed" && data?.currentTask
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
