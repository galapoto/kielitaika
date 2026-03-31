import HomeScreen from "@ui/screens/HomeScreen";

import { useAuthStore } from "./authStore";

type Props = {
  onOpenDailyPractice: () => void;
  onOpenProfessionalFinnish: () => void;
  onOpenSpeakingPractice: () => void;
  onLogout: () => void;
  onOpenLearning: () => void;
  onOpenYkiExam: () => void;
  onOpenYkiPractice: () => void;
};

export default function HomeRoute({
  onOpenDailyPractice,
  onOpenProfessionalFinnish,
  onOpenSpeakingPractice,
  onLogout,
  onOpenLearning,
  onOpenYkiExam,
  onOpenYkiPractice,
}: Props) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  return (
    <HomeScreen
      debugAvailable
      onOpenDailyPractice={onOpenDailyPractice}
      onOpenProfessionalFinnish={onOpenProfessionalFinnish}
      onOpenSpeakingPractice={onOpenSpeakingPractice}
      onLogout={onLogout}
      onOpenLearning={onOpenLearning}
      onOpenYkiExam={onOpenYkiExam}
      onOpenYkiPractice={onOpenYkiPractice}
      user={user}
    />
  );
}
