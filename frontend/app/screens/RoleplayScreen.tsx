import { useEffect, useState } from "react";

import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { JsonPreview } from "../components/JsonPreview";
import { Panel } from "../components/Panel";
import { StatusBanner } from "../components/StatusBanner";
import { createRoleplaySession, fetchRoleplayReview, fetchRoleplayTranscript, submitRoleplayTurn } from "../services/roleplayService";
import { removeRoleplayCache, saveRoleplayCache } from "../services/storage";

function persistRoleplaySession(session: any | null): void {
  if (!session || !session.session_id || !session.created_at || !session.expires_at || !session.status) {
    return;
  }
  if (session.status === "expired") {
    removeRoleplayCache(session.session_id);
    return;
  }
  saveRoleplayCache({
    schema_version: "1",
    roleplay_session_id: session.session_id,
    created_at: session.created_at,
    expires_at: session.expires_at,
    status: session.status,
    saved_at: new Date().toISOString(),
  });
}

export function RoleplayScreen(props: { restoredSession: any | null }) {
  const [scenarioId, setScenarioId] = useState("ajanvaraus");
  const [level, setLevel] = useState("A2");
  const [session, setSession] = useState<any | null>(props.restoredSession);
  const [message, setMessage] = useState("");
  const [transcript, setTranscript] = useState<any | null>(null);
  const [review, setReview] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSession(props.restoredSession);
  }, [props.restoredSession]);

  useEffect(() => {
    persistRoleplaySession(session);
  }, [session]);

  async function start() {
    setBusy(true);
    setError(null);
    const response = await createRoleplaySession({
      scenario_id: scenarioId,
      level,
      display_preferences: { show_translation: true },
    });
    if (!response.ok) {
      setError(response.error.message);
      setBusy(false);
      return;
    }
    setSession(response.data);
    setTranscript(null);
    setReview(null);
    setBusy(false);
  }

  async function submit() {
    if (!session) {
      return;
    }
    setBusy(true);
    setError(null);
    const response = await submitRoleplayTurn(session.session_id, { user_message: message });
    if (!response.ok) {
      setError(response.error.message);
      if (response.error.code === "SESSION_EXPIRED") {
        removeRoleplayCache(session.session_id);
        setSession((previous: any) =>
          previous
            ? {
                ...previous,
                status: "expired",
              }
            : previous,
        );
      }
      setBusy(false);
      return;
    }
    setSession((previous: any) =>
      previous
        ? {
            ...previous,
            created_at: response.data.created_at,
            expires_at: response.data.expires_at,
            status: response.data.status,
            progress: response.data.progress,
            messages: [...previous.messages, ...response.data.appended_messages],
            ui: response.data.ui,
          }
        : previous,
    );
    setMessage("");
    setBusy(false);
  }

  async function loadTranscript() {
    if (!session) {
      return;
    }
    const response = await fetchRoleplayTranscript(session.session_id);
    if (response.ok) {
      setTranscript(response.data);
    } else {
      setError(response.error.message);
    }
  }

  async function loadReview() {
    if (!session) {
      return;
    }
    const response = await fetchRoleplayReview(session.session_id);
    if (response.ok) {
      setReview(response.data);
    } else {
      setError(response.error.message);
    }
  }

  return (
    <div className="screen-stack">
      <Panel title="Roleplay Runtime" subtitle="Fixed-turn backend roleplay; frontend restores only backend-authored sessions that have not expired.">
        <div className="grid-two">
          <Field label="Scenario id" value={scenarioId} onChange={(event) => setScenarioId(event.target.value)} />
          <Field label="Level" value={level} onChange={(event) => setLevel(event.target.value)} />
        </div>
        <div className="actions-row">
          <Button onClick={start} disabled={busy}>
            {busy ? "Starting..." : "Start roleplay"}
          </Button>
          {session ? (
            <>
              <Button tone="secondary" onClick={loadTranscript}>
                Load transcript
              </Button>
              <Button tone="secondary" onClick={loadReview} disabled={session.status !== "completed"}>
                Load review
              </Button>
            </>
          ) : null}
        </div>
        {error ? <StatusBanner tone="error" title="Roleplay error" message={error} /> : null}
      </Panel>

      {session ? (
        <Panel
          title={session.scenario.title}
          subtitle={`Status ${session.status} · expires ${session.expires_at} · ${session.progress.user_turns_completed}/${session.progress.user_turns_total}`}
        >
          <div className="chat-stack">
            {session.messages.map((item: any) => (
              <div key={item.message_id} className={item.speaker === "USER" ? "chat-bubble user" : "chat-bubble"}>
                <strong>{item.speaker}</strong>
                <p>{item.text}</p>
                {item.translation ? <small className="muted">{item.translation}</small> : null}
              </div>
            ))}
          </div>
          <div className="actions-row">
            <Field label="Your turn" value={message} onChange={(event) => setMessage(event.target.value)} disabled={!session.ui.show_input} />
            <Button onClick={submit} disabled={busy || !message || !session.ui.allow_submit}>
              Submit turn
            </Button>
          </div>
        </Panel>
      ) : null}

      {transcript ? <JsonPreview title="Transcript" value={transcript} /> : null}
      {review ? <JsonPreview title="Review" value={review} /> : null}
    </div>
  );
}
