import DailyPracticeExperience from "../features/daily-practice/components/DailyPracticeExperience";
import ProfessionalFinnishScreen from "@ui/screens/ProfessionalFinnishScreen";
import SpeakingPracticeExperience from "@ui/screens/speaking/SpeakingPracticeExperience";

import type { GuardedScreen } from "./navigationModel";

type Props = {
  screen: Extract<GuardedScreen, "daily-practice" | "professional-finnish" | "speaking-practice">;
  onBack: () => void;
  onOpenLearning: () => void;
  onOpenYkiPractice: () => void;
};

export default function FeatureEntryRoute({
  screen,
  onBack,
  onOpenLearning,
}: Props) {
  if (screen === "daily-practice") {
    return <DailyPracticeExperience onBack={onBack} onOpenLearning={onOpenLearning} />;
  }

  if (screen === "professional-finnish") {
    return (
      <ProfessionalFinnishScreen onBack={onBack} onOpenLearning={onOpenLearning} />
    );
  }

  if (screen === "speaking-practice") {
    return <SpeakingPracticeExperience onBack={onBack} onOpenLearning={onOpenLearning} />;
  }

  return null;
}
