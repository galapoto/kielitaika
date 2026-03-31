import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Input from "../primitives/Input";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

type Props = {
  email: string;
  password: string;
  errorMessage: string | null;
  fallbackEnabled: boolean;
  submitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export default function AuthScreen({
  email,
  password,
  errorMessage,
  fallbackEnabled,
  submitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: Props) {
  return (
    <ScreenContainer center>
      <Stack align="center" gap="sm">
        <Card>
          <Stack gap="xs">
            <Text variant="title">Auth</Text>
            <Text tone="muted">
              Sign in to switch the app shell into the authenticated home state.
            </Text>
            {fallbackEnabled ? (
              <Text tone="muted">
                Mock auth fallback is active until the backend login endpoint is available.
              </Text>
            ) : null}
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
              onChangeText={onEmailChange}
              placeholder="Email"
              value={email}
            />
            <Input
              editable={!submitting}
              onChangeText={onPasswordChange}
              placeholder="Password"
              secureTextEntry
              value={password}
            />
            {errorMessage ? <Text tone="error">{errorMessage}</Text> : null}
            <Button
              disabled={submitting || !email.trim() || !password}
              label={submitting ? "Signing In..." : "Sign In"}
              onPress={onSubmit}
            />
          </Stack>
        </Card>
      </Stack>
    </ScreenContainer>
  );
}
