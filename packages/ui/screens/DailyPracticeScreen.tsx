import FeatureEntryScreen from "./FeatureEntryScreen";

type Props = {
  onBack: () => void;
  onOpenLearning: () => void;
};

export default function DailyPracticeScreen({ onBack, onOpenLearning }: Props) {
  return (
    <FeatureEntryScreen
      title="Daily Practice"
      subtitle="RN-governed daily study entry"
      summary="Daily practice now lives inside the single RN shell and resolves through the governed learning runtime."
      details={[
        "Uses the same packages/ui layout and token system as the rest of the app.",
        "Daily practice content is sourced from the governed learning recommendations.",
        "No separate web or legacy screen path remains.",
      ]}
      primaryAction={{ label: "Open Learning", onPress: onOpenLearning }}
      secondaryAction={{ label: "Back Home", onPress: onBack, tone: "surface" }}
    />
  );
}
