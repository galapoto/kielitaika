import { Stack } from "expo-router";

import ErrorBoundary from "@ui/system/ErrorBoundary";

export default function Layout() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
