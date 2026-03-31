import { useState } from "react";

import { setAuthToken } from "@core/api/apiClient";
import { authService } from "@core/services/authService";
import { env } from "@core/config/env";
import AuthScreen from "@ui/screens/AuthScreen";

import { useAuthStore } from "./authStore";

export default function AuthRoute() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const session = await authService.login(email.trim(), password);
      setAuthToken(session.token);
      await setAuth(session.user, session.token);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "LOGIN_FAILED");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      email={email}
      errorMessage={errorMessage}
      fallbackEnabled={env.MOCK_AUTH_FALLBACK_ENABLED}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={() => {
        void handleSubmit();
      }}
      password={password}
      submitting={submitting}
    />
  );
}
