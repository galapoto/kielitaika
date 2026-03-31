import { useMemo } from "react";

import Center from "../components/layout/Center";
import Screen from "../components/layout/Screen";
import Section from "../components/layout/Section";
import Button from "../components/primitives/Button";
import Text from "../components/primitives/Text";
import { useAuthStore } from "../../../apps/client/state/authStore";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const identityLines = useMemo(() => {
    if (!user) {
      return [];
    }

    return [
      `Name: ${user.name}`,
      `Email: ${user.email}`,
      `User ID: ${user.id}`,
    ];
  }, [user]);

  return (
    <Screen>
      <Center>
        <Section>
          <Text variant="title">Home</Text>
          <Text tone="secondary">Authenticated session ready.</Text>
          {identityLines.map((line) => (
            <Text key={line}>{line}</Text>
          ))}
          <Button
            label="Log Out"
            onPress={() => {
              void logout();
            }}
          />
        </Section>
      </Center>
    </Screen>
  );
}
