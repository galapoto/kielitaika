import { useState } from "react";

import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Logo } from "../components/Logo";
import { Panel } from "../components/Panel";
import { StatusBanner } from "../components/StatusBanner";
import { useResolvedColorScheme } from "../theme/backgrounds";

export function AuthScreen(props: {
  onLogin: (payload: { email: string; password: string }) => Promise<{ ok: boolean; message: string | null }>;
  onRegister: (payload: { email: string; password: string; name: string }) => Promise<{ ok: boolean; message: string | null }>;
}) {
  const scheme = useResolvedColorScheme();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    try {
      const result =
        mode === "login"
          ? await props.onLogin({ email, password })
          : await props.onRegister({ email, password, name });
      setMessage(result.message);
    } catch {
      setMessage("Transport request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <Panel className="auth-card" title="Enter The Language Field" subtitle="Auth state must settle before any protected route renders.">
        <Logo scheme={scheme} size={72} />
        <div className="tab-row">
          <Button tone={mode === "login" ? "primary" : "ghost"} onClick={() => setMode("login")}>
            Sign in
          </Button>
          <Button tone={mode === "register" ? "primary" : "ghost"} onClick={() => setMode("register")}>
            Register
          </Button>
        </div>
        {message ? <StatusBanner tone="error" title="Backend response" message={message} /> : null}
        {mode === "register" ? <Field label="Name" value={name} onChange={(event) => setName(event.target.value)} /> : null}
        <Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Field label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <Button onClick={submit} disabled={submitting || !email || !password || (mode === "register" && !name)}>
          {submitting ? "Submitting..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </Panel>
    </div>
  );
}
