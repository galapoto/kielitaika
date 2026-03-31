import HomeScreen from "@ui/screens/HomeScreen";

import { useAuthStore } from "./authStore";

type Props = {
  onLogout: () => void;
  onOpenLearning: () => void;
  onOpenYkiPractice: () => void;
};

export default function HomeRoute({
  onLogout,
  onOpenLearning,
  onOpenYkiPractice,
}: Props) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  return (
    <HomeScreen
      debugAvailable
      onLogout={onLogout}
      onOpenLearning={onOpenLearning}
      onOpenYkiPractice={onOpenYkiPractice}
      user={user}
    />
  );
}
