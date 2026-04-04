import Button from "../primitives/Button";
import Card from "../primitives/Card";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

type HomeUser = {
  email: string;
  id: string;
  name: string;
};

type Props = {
  debugAvailable: boolean;
  user: HomeUser;
  onOpenDailyPractice: () => void;
  onOpenProfessionalFinnish: () => void;
  onOpenSpeakingPractice: () => void;
  onLogout: () => void;
  onOpenLearning: () => void;
  onOpenYkiExam: () => void;
  onOpenYkiPractice: () => void;
};

export default function HomeScreen({
  debugAvailable,
  user,
  onOpenDailyPractice,
  onOpenProfessionalFinnish,
  onOpenSpeakingPractice,
  onLogout,
  onOpenLearning,
  onOpenYkiExam,
  onOpenYkiPractice,
}: Props) {
  return (
    <ScreenContainer
      actions={
        <Stack gap="xs">
          <Button label="Open Learning" onPress={onOpenLearning} />
          <Button label="Open YKI Practice" onPress={onOpenYkiPractice} />
          <Button label="Daily Practice" onPress={onOpenDailyPractice} tone="surface" />
          <Button label="Professional Finnish" onPress={onOpenProfessionalFinnish} tone="surface" />
          <Button label="Speaking Practice" onPress={onOpenSpeakingPractice} tone="surface" />
          <Button
            accessibilityLabel="yki-start-button"
            label="YKI Exam"
            onPress={onOpenYkiExam}
            testID="yki-start-button"
            tone="surface"
          />
          <Button label="Log Out" onPress={onLogout} tone="surface" />
        </Stack>
      }
      center
      content={
        <Card>
          <Stack gap="xs">
            <Text variant="title">Runtime Flows</Text>
            <Text>
              Daily practice, professional Finnish, speaking, and YKI exam all resolve through
              the same governed RN UI system.
            </Text>
            {debugAvailable ? (
              <Text tone="muted">Learning debug visibility is available.</Text>
            ) : null}
          </Stack>
        </Card>
      }
      header={
        <Card>
          <Stack gap="xs">
            <Text variant="title">Home</Text>
            <Text tone="muted">Authenticated session ready.</Text>
            <Text>Name: {user.name}</Text>
            <Text>Email: {user.email}</Text>
            <Text>User ID: {user.id}</Text>
          </Stack>
        </Card>
      }
    />
  );
}
