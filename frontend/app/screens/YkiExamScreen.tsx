import { ExamRuntimeScreen } from "../exam_runtime/screens/ExamRuntimeScreen";
import type { ExamRuntimeContract } from "../types/exam";

export function YkiExamScreen(props: {
  runtime: ExamRuntimeContract | null;
  onRuntimeChange: (runtime: ExamRuntimeContract | null) => void;
  onBackToIntro: () => void;
  onComplete: () => void;
}) {
  return (
    <ExamRuntimeScreen
      runtime={props.runtime}
      onRuntimeChange={props.onRuntimeChange}
      onExit={props.onBackToIntro}
      onComplete={props.onComplete}
    />
  );
}
