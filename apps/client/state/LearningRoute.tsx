import { useEffect } from "react";

import LearningScreen from "@ui/screens/LearningScreen";
import { useLearningSystem } from "../features/learning/hooks/useLearningSystem";
import { useNetworkStore } from "./networkStore";
import { persistLearningSession } from "./sessionPersistence";

type Props = {
  onBack: () => void;
};

export default function LearningRoute({ onBack }: Props) {
  const isOffline = useNetworkStore((state) => state.isOffline);
  const learning = useLearningSystem();

  useEffect(() => {
    if (!learning.data) {
      return;
    }

    void persistLearningSession({
      decisionVersion: learning.data.decisionVersion,
      governanceStatus: learning.data.governanceStatus,
      governanceVersion: learning.data.governanceVersion,
      policyVersion: learning.data.policyVersion,
    });
  }, [learning.data]);

  return (
    <LearningScreen
      activeLesson={learning.activeLesson}
      activeModule={learning.activeModule}
      answerDrafts={learning.answerDrafts}
      busyExerciseId={learning.busyExerciseId}
      completingLesson={learning.completingLesson}
      completedLessonCount={learning.data?.completedLessonCount ?? 0}
      errorMessage={learning.errorMessage}
      errorTraceReference={learning.errorTraceReference}
      governanceStatus={learning.data?.governanceStatus ?? "legacy_uncontrolled"}
      latestEvaluation={learning.data?.latestEvaluation ?? null}
      latestTransition={learning.data?.latestTransition ?? null}
      levels={learning.data?.levels ?? []}
      loading={learning.loading}
      offlineMessage={
        isOffline ? "Learning progression requires backend validation while offline mode is active." : null
      }
      onAnswerDraftChange={learning.setAnswerDraft}
      onBack={onBack}
      onCompleteLesson={() => {
        void learning.completeLesson();
      }}
      onRefresh={() => {
        void learning.refresh();
      }}
      onSelectLesson={learning.selectLesson}
      onSelectModule={learning.selectModule}
      onSubmitAnswer={(exerciseId, answer) => {
        void learning.submitAnswer(exerciseId, answer);
      }}
      selectedLessonId={learning.selectedLessonId}
      selectedModuleId={learning.selectedModuleId}
      totalLessonCount={learning.data?.totalLessonCount ?? 0}
    />
  );
}
