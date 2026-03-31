import { useRouter } from "expo-router";

import HomeScreen from "@ui/screens/HomeScreen";

import { useAuthStore } from "./authStore";

export default function HomeRoute() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return null;
  }

  return (
    <HomeScreen
      debugAvailable
      onLogout={() => {
        void logout();
      }}
      onOpenLearning={() => router.push("/learning")}
      onOpenYkiPractice={() => router.push("/yki-practice")}
      user={user}
    />
  );
}
