import DailyPracticeScreen from "@ui/screens/DailyPracticeScreen";
import ProfessionalFinnishScreen from "@ui/screens/ProfessionalFinnishScreen";
import SpeakingPracticeScreen from "@ui/screens/SpeakingPracticeScreen";
import YkiExamScreen from "@ui/screens/YkiExamScreen";

import type { GuardedScreen } from "./navigationModel";

type Props = {
  screen: Extract<
    GuardedScreen,
    "daily-practice" | "professional-finnish" | "speaking-practice" | "yki-exam"
  >;
  onBack: () => void;
  onOpenLearning: () => void;
  onOpenYkiPractice: () => void;
};

export default function FeatureEntryRoute({
  screen,
  onBack,
  onOpenLearning,
  onOpenYkiPractice,
}: Props) {
  if (screen === "daily-practice") {
    return <DailyPracticeScreen onBack={onBack} onOpenLearning={onOpenLearning} />;
  }

  if (screen === "professional-finnish") {
    return (
      <ProfessionalFinnishScreen onBack={onBack} onOpenLearning={onOpenLearning} />
    );
  }

  if (screen === "speaking-practice") {
    return (
      <SpeakingPracticeScreen onBack={onBack} onOpenYkiPractice={onOpenYkiPractice} />
    );
  }

  return <YkiExamScreen onBack={onBack} onOpenYkiPractice={onOpenYkiPractice} />;
}
