import FeatureEntryScreen from "./FeatureEntryScreen";

type Props = {
  onBack: () => void;
  onOpenYkiPractice: () => void;
};

export default function SpeakingPracticeScreen({ onBack, onOpenYkiPractice }: Props) {
  return (
    <FeatureEntryScreen
      title="Speaking Practice"
      subtitle="RN-governed speaking entry"
      summary="Speaking practice is routed through the governed YKI practice runtime so spoken tasks stay inside the audited, deterministic flow."
      details={[
        "Speaking tasks use the same RN primitives and shell routing as every other screen.",
        "The client does not create a separate speaking UI stack or browser-only flow.",
        "The governed YKI runtime remains the single source of truth for speaking progression.",
      ]}
      primaryAction={{ label: "Open YKI Practice", onPress: onOpenYkiPractice }}
      secondaryAction={{ label: "Back Home", onPress: onBack, tone: "surface" }}
    />
  );
}
