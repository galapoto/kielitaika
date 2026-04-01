import { useEffect, useState } from "react";

import DailyPracticeScreen from "@ui/screens/DailyPracticeScreen";

import useDailyPractice from "../hooks/useDailyPractice";

type Props = {
  onBack: () => void;
  onOpenLearning: () => void;
};

export default function DailyPracticeExperience({ onBack, onOpenLearning }: Props) {
  const { data, error, loading, next, retry, submit } = useDailyPractice();
  const [answerDraft, setAnswerDraft] = useState("");

  useEffect(() => {
    if (data?.current_exercise?.answer_status === "pending") {
      setAnswerDraft("");
    }
  }, [data?.current_exercise?.id, data?.current_exercise?.answer_status]);

  return (
    <DailyPracticeScreen
      accuracy={data?.completion_state.accuracy ?? 0}
      answerDraft={answerDraft}
      completedCount={data?.completion_state.completed_count ?? 0}
      currentExercise={data?.current_exercise ?? null}
      errorMessage={error?.message ?? null}
      latestResult={data?.latest_result ?? null}
      loading={loading}
      onAnswerChange={setAnswerDraft}
      onBack={onBack}
      onNext={() => {
        void next();
      }}
      onOpenLearning={onOpenLearning}
      onRetry={() => {
        void retry();
      }}
      onSubmit={() => {
        void submit(answerDraft);
      }}
      sessionComplete={data?.completion_state.session_complete ?? false}
      totalCount={data?.completion_state.total_count ?? 0}
    />
  );
}
