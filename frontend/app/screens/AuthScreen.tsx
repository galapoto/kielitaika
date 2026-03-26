import { useState } from "react";

import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Logo } from "../components/Logo";
import { Panel } from "../components/Panel";
import { StatusBanner } from "../components/StatusBanner";
import { startGoogleAuth } from "../services/authService";
import { useResolvedColorScheme } from "../theme/backgrounds";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" role="img" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7968 2.7155v2.2582h2.9086c1.7027-1.5673 2.6841-3.8741 2.6841-6.6146z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.8055 5.9564-2.1805l-2.9086-2.2582c-.8055.54-1.8359.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.0364-3.7105H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.9636 10.7091c-.18-.54-.2836-1.1168-.2836-1.7091s.1036-1.1691.2836-1.7091V4.9591H.9573C.3477 6.1732 0 7.5482 0 9s.3477 2.8268.9573 4.0409l3.0063-2.3318z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.3459l2.5814-2.5814C13.4632.8918 11.43 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9591l3.0063 2.3318C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
      />
    </svg>
  );
}

export function AuthScreen(props: {
  onLogin: (payload: { email: string; password: string }) => Promise<{ ok: boolean; message: string | null }>;
  onGoogleLogin: (payload: { oauth_result_id: string }) => Promise<{ ok: boolean; message: string | null }>;
  onRegister: (payload: { email: string; password: string; name: string }) => Promise<{ ok: boolean; message: string | null }>;
}) {
  const scheme = useResolvedColorScheme();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "neutral" | "error"; title: string; message: string } | null>(null);

  async function submit() {
    setFeedback(null);
    setSubmitting(true);
    try {
      const result =
        mode === "login"
          ? await props.onLogin({ email, password })
          : await props.onRegister({ email, password, name });
      if (!result.ok && result.message) {
        setFeedback({
          tone: "error",
          title: mode === "login" ? "We couldn't sign you in" : "We couldn't create your account",
          message: result.message,
        });
      }
    } catch {
      setFeedback({
        tone: "error",
        title: "Connection problem",
        message: "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function waitForGooglePopup(popup: Window): Promise<string> {
    return new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const poll = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(poll);
          reject(new Error("Google sign-in was cancelled."));
          return;
        }
        if (Date.now() - startedAt > 180000) {
          window.clearInterval(poll);
          popup.close();
          reject(new Error("Google sign-in timed out."));
          return;
        }
        try {
          if (popup.location.origin !== window.location.origin) {
            return;
          }
          const params = new URLSearchParams(popup.location.search);
          const error = params.get("google_auth_error");
          const resultId = params.get("oauth_result_id");
          if (error) {
            window.clearInterval(poll);
            popup.close();
            reject(new Error(error));
            return;
          }
          if (resultId) {
            window.clearInterval(poll);
            popup.close();
            resolve(resultId);
          }
        } catch {
          // The popup is still on a Google domain.
        }
      }, 250);
    });
  }

  async function submitGoogle() {
    setFeedback(null);
    setGoogleSubmitting(true);
    try {
      const startResponse = await startGoogleAuth({ redirect_origin: window.location.origin });
      if (!startResponse.ok) {
        setFeedback({
          tone: "error",
          title: "Google sign-in isn't ready",
          message: startResponse.error.message,
        });
        return;
      }

      const popup = window.open(
        startResponse.data.authorization_url,
        "kielitaika-google-auth",
        "popup=yes,width=520,height=720,resizable=yes,scrollbars=yes",
      );
      if (!popup) {
        setFeedback({
          tone: "error",
          title: "Pop-up blocked",
          message: "Allow pop-ups for this site and try again.",
        });
        return;
      }

      const oauthResultId = await waitForGooglePopup(popup);
      const result = await props.onGoogleLogin({ oauth_result_id: oauthResultId });
      if (!result.ok && result.message) {
        setFeedback({
          tone: "error",
          title: "Google sign-in failed",
          message: result.message,
        });
      }
    } catch (error) {
      setFeedback({
        tone: "error",
        title: "Google sign-in failed",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <Panel className="auth-card">
        <div className="auth-hero">
          <p className="auth-eyebrow">Welcome to</p>
          <div className="auth-brand">
            <Logo scheme={scheme} size={282} showWordmark={false} className="auth-logo" />
            <h1>KieliTaika</h1>
          </div>
          <p className="auth-message">
            {mode === "login" ? "Sign in to continue your Finnish learning journey" : "Create your account to continue your Finnish learning journey"}
          </p>
        </div>

        {feedback ? <StatusBanner tone={feedback.tone} title={feedback.title} message={feedback.message} /> : null}

        <div className="auth-form">
          {mode === "register" ? <Field label="Name" value={name} onChange={(event) => setName(event.target.value)} /> : null}
          <Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Field label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />

          <Button onClick={submit} disabled={submitting || googleSubmitting || !email || !password || (mode === "register" && !name)}>
            {submitting ? "Submitting..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>

          <Button className="auth-google-button" tone="secondary" onClick={submitGoogle} disabled={submitting || googleSubmitting}>
            <span className="auth-google-icon" aria-hidden="true">
              <GoogleIcon />
            </span>
            <span>{googleSubmitting ? "Connecting..." : "Continue with Google"}</span>
          </Button>

          <div className="auth-link-row">
            <button
              type="button"
              className="auth-text-link"
              onClick={() =>
                setFeedback({
                  tone: "neutral",
                  title: "Forgot password",
                  message: "Password reset is not available yet.",
                })
              }
            >
              Forgot password
            </button>
            <button
              type="button"
              className="auth-text-link"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setFeedback(null);
              }}
            >
              {mode === "login" ? "Sign up" : "Back to sign in"}
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
