import { useState } from "react";
import Button from "../components/primitives/Button";
import Input from "../components/primitives/Input";
import Text from "../components/primitives/Text";
import Center from "../components/layout/Center";
import Screen from "../components/layout/Screen";
import Section from "../components/layout/Section";
import { StyleSheet } from "react-native";
import { authService } from "@core/services/authService";
import { setAuthToken } from "@core/api/apiClient";
import { useAuthStore } from "../../../apps/client/state/authStore";

export default function AuthScreen() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const session = await authService.login(email.trim(), password);
      await setAuth(session.user, session.token);
      setAuthToken(session.token);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "LOGIN_FAILED");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Center>
        <Section style={styles.section}>
          <Text variant="title">Auth</Text>
          <Text tone="secondary">
            Sign in to switch the app shell into the authenticated home state.
          </Text>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
            onChangeText={setEmail}
            placeholder="Email"
            value={email}
          />
          <Input
            editable={!submitting}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            value={password}
          />
          {errorMessage ? <Text>{errorMessage}</Text> : null}
          <Button
            disabled={submitting || !email.trim() || !password}
            label={submitting ? "Signing In..." : "Sign In"}
            onPress={() => {
              void handleLogin();
            }}
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
