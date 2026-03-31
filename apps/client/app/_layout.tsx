import { useEffect } from "react";
import { Stack } from "expo-router";

import { useAuthStore } from "../state/authStore";

export default function Layout() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="daily-practice" />
      <Stack.Screen name="learning" />
      <Stack.Screen name="professional-finnish" />
      <Stack.Screen name="speaking-practice" />
      <Stack.Screen name="yki-exam" />
      <Stack.Screen name="yki-practice" />
    </Stack>
  );
}
