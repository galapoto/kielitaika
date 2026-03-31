import Card from "@ui/primitives/Card";
import ScreenContainer from "@ui/primitives/ScreenContainer";
import Stack from "@ui/primitives/Stack";
import Text from "@ui/primitives/Text";

import AuthRoute from "./AuthRoute";
import HomeRoute from "./HomeRoute";
import { useAuthStore } from "./authStore";

export default function AppShell() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);

  if (!hasHydrated) {
    return (
      <ScreenContainer center>
        <Stack gap="sm">
          <Card>
            <Stack gap="xs">
              <Text variant="title">KieliTaika</Text>
              <Text tone="muted">Restoring session...</Text>
            </Stack>
          </Card>
        </Stack>
      </ScreenContainer>
    );
  }

  if (user) {
    return <HomeRoute />;
  }

  return <AuthRoute />;
}
