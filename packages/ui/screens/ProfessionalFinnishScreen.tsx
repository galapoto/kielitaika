import FeatureEntryScreen from "./FeatureEntryScreen";

type Props = {
  onBack: () => void;
  onOpenLearning: () => void;
};

export default function ProfessionalFinnishScreen({
  onBack,
  onOpenLearning,
}: Props) {
  return (
    <FeatureEntryScreen
      title="Professional Finnish"
      subtitle="RN-governed professional track entry"
      summary="Professional Finnish now resolves through the single RN shell and the governed learning runtime instead of a parallel feature surface."
      details={[
        "Uses the same packages/ui primitives and spacing rules as the rest of the application.",
        "Professional vocabulary and reinforcement stay inside the governed learning graph.",
        "No duplicate browser-specific professional study UI remains.",
      ]}
      primaryAction={{ label: "Open Learning", onPress: onOpenLearning }}
      secondaryAction={{ label: "Back Home", onPress: onBack, tone: "surface" }}
    />
  );
}
