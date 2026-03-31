import Button from "../components/primitives/Button";
import Input from "../components/primitives/Input";
import Text from "../components/primitives/Text";
import Center from "../components/layout/Center";
import Screen from "../components/layout/Screen";
import Section from "../components/layout/Section";
import { StyleSheet } from "react-native";

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
    <Screen>
      <Center>
        <Section style={styles.section}>
          <Text variant="title">Auth</Text>
          <Text tone="secondary">
            Sign in to switch the app shell into the authenticated home state.
          </Text>
          {fallbackEnabled ? (
            <Text tone="secondary">
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
          {errorMessage ? <Text>{errorMessage}</Text> : null}
          <Button
            disabled={submitting || !email.trim() || !password}
            label={submitting ? "Signing In..." : "Sign In"}
            onPress={onSubmit}
          />
        </Section>
      </Center>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
  },
});
