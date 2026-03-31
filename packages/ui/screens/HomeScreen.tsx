import Box from "../components/primitives/Box";
import Screen from "../components/layout/Screen";
import Section from "../components/layout/Section";
import Button from "../components/primitives/Button";
import Text from "../components/primitives/Text";

type HomeUser = {
  email: string;
  id: string;
  name: string;
};

type Props = {
  debugAvailable: boolean;
  user: HomeUser;
  onLogout: () => void;
  onOpenLearning: () => void;
  onOpenYkiPractice: () => void;
};

export default function HomeScreen({
  debugAvailable,
  user,
  onLogout,
  onOpenLearning,
  onOpenYkiPractice,
}: Props) {

  return (
    <Screen>
      <Box flex={1} gap="md" justifyContent="center">
        <Section>
          <Text variant="title">Home</Text>
          <Text tone="secondary">Authenticated session ready.</Text>
          <Text>Name: {user.name}</Text>
          <Text>Email: {user.email}</Text>
          <Text>User ID: {user.id}</Text>
        </Section>

        <Section>
          <Text variant="title">Runtime Flows</Text>
          <Button label="Open Learning" onPress={onOpenLearning} />
          <Button label="Open YKI Practice" onPress={onOpenYkiPractice} />
          {debugAvailable ? <Text tone="secondary">Learning debug visibility is available.</Text> : null}
          <Button label="Log Out" onPress={onLogout} />
        </Section>
      </Box>
    </Screen>
  );
}
