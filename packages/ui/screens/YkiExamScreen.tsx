import FeatureEntryScreen from "./FeatureEntryScreen";

type Props = {
  onBack: () => void;
  onOpenYkiPractice: () => void;
};

export default function YkiExamScreen({ onBack, onOpenYkiPractice }: Props) {
  return (
    <FeatureEntryScreen
      title="YKI Exam"
      subtitle="RN-governed exam entry"
      summary="The exam surface now has an RN entry inside the governed shell so there is no second UI system, even while the live exam runtime remains separate from practice playback."
      details={[
        "The screen is rendered through packages/ui and RN Web, not a separate browser app.",
        "Exam navigation stays inside the single AppShell routing system.",
        "The existing governed YKI practice runtime remains the available exam-adjacent study flow from this client.",
      ]}
      primaryAction={{ label: "Open YKI Practice", onPress: onOpenYkiPractice }}
      secondaryAction={{ label: "Back Home", onPress: onBack, tone: "surface" }}
    />
  );
}
