import Center from "@ui/components/layout/Center";
import Screen from "@ui/components/layout/Screen";
import Section from "@ui/components/layout/Section";
import Text from "@ui/components/primitives/Text";

import AuthRoute from "./AuthRoute";
import HomeRoute from "./HomeRoute";
import { useAuthStore } from "./authStore";

export default function AppShell() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);

  if (!hasHydrated) {
    return (
      <Screen>
        <Center>
          <Section>
            <Text variant="title">KieliTaika</Text>
            <Text tone="secondary">Restoring session...</Text>
          </Section>
        </Center>
      </Screen>
    );
  }

  if (user) {
    return <HomeRoute />;
  }

  return <AuthRoute />;
}
