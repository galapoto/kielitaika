import { useEffect, useState } from "react";
import { ArrowRight, MessageSquareMore, Sparkles, Star } from "lucide-react";

import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Panel } from "../components/Panel";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { StatusBanner } from "../components/StatusBanner";
import { createRoleplaySession, fetchRoleplayReview, submitRoleplayTurn } from "../services/roleplayService";
import { removeRoleplayCache, saveRoleplayCache } from "../services/storage";

function roleplayCacheState(status: string): "created" | "active" | "awaiting_ai" | "completed" | "expired" | "abandoned" {
  if (status === "completed") {
    return "completed";
  }
  if (status === "expired") {
    return "expired";
  }
  return "active";
}

function persistRoleplaySession(session: any | null): void {
  if (!session || !session.session_id || !session.expires_at || !session.status) {
    return;
  }
  if (session.status === "expired") {
    removeRoleplayCache(session.session_id);
    return;
  }
  saveRoleplayCache({
    schema_version: "1",
    roleplay_session_id: session.session_id,
    speaking_session_id: `spk_${session.session_id}`,
    state: roleplayCacheState(session.status),
    turn_count: Number(session.progress?.user_turns_completed || 0),
    expires_at: session.expires_at,
    last_synced_at: new Date().toISOString(),
  });
}

function describeConversationProgress(session: any | null): string {
  if (!session) {
    return "Choose a scenario and begin a guided conversation.";
  }
  if (session.status === "completed") {
    return "Your guided conversation is complete. Review your feedback and start a new one whenever you're ready.";
  }
  return `${session.progress.user_turns_completed} of ${session.progress.user_turns_total} replies completed.`;
}

function roleLabel(value: string): string {
  if (value === "USER") {
    return "You";
  }
  if (value === "SYSTEM") {
    return "Guide";
  }
  return value;
}

function reviewHighlights(review: any): string[] {
  if (!review) {
    return [];
  }
  const directValues = [
    review.summary,
    review.feedback,
    review.overall_feedback,
    review.overview,
    review.message,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  if (directValues.length) {
    return directValues;
  }
  if (Array.isArray(review.highlights)) {
    return review.highlights.filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0);
  }
  return [];
}

export function RoleplayScreen(props: { restoredSession: any | null }) {
  const [scenarioId, setScenarioId] = useState("ajanvaraus");
  const [level, setLevel] = useState("A2");
  const [session, setSession] = useState<any | null>(props.restoredSession);
  const [message, setMessage] = useState("");
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
    setReview(null);
    setMessage("");
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

  async function loadReview() {
    if (!session) {
      return;
    }
    setBusy(true);
    setError(null);
    const response = await fetchRoleplayReview(session.session_id);
    if (response.ok) {
      setReview(response.data);
    } else {
      setError(response.error.message);
    }
    setBusy(false);
  }

  return (
    <ScreenScaffold
      className="conversation-screen"
      header={
        <div className="screen-heading">
          <span className="eyebrow">Conversation</span>
          <h1 className="hero-title">{session ? session.scenario.title : "Practice a guided conversation"}</h1>
          <p className="hero-subtitle">{describeConversationProgress(session)}</p>
        </div>
      }
      actions={
        <div className="actions-row">
          {!session ? (
            <Button onClick={start} disabled={busy}>
              <MessageSquareMore size={16} aria-hidden="true" />
              {busy ? "Starting..." : "Start conversation"}
            </Button>
          ) : session.status === "completed" ? (
            <Button tone="secondary" onClick={loadReview} disabled={busy}>
              <Star size={16} aria-hidden="true" />
              {busy ? "Loading..." : "View feedback"}
            </Button>
          ) : (
            <Button onClick={submit} disabled={busy || !message || !session.ui.allow_submit}>
              <ArrowRight size={16} aria-hidden="true" />
              Send reply
            </Button>
          )}
        </div>
      }
    >
      {!session ? (
        <Panel title="Conversation setup" subtitle="Choose a scenario and level, then start one active conversation." className="primary-card">
          <div className="grid-two">
            <Field label="Scenario id" value={scenarioId} onChange={(event) => setScenarioId(event.target.value)} />
            <Field label="Level" value={level} onChange={(event) => setLevel(event.target.value)} />
          </div>
          {error ? <StatusBanner tone="error" title="Conversation error" message={error} /> : null}
        </Panel>
      ) : (
        <Panel
          title={session.scenario.title}
          subtitle={describeConversationProgress(session)}
          className="primary-card"
        >
          {error ? <StatusBanner tone="error" title="Conversation error" message={error} /> : null}
          <div className="meta-grid">
            <div className="meta-item">
              <span className="eyebrow">Level</span>
              <strong>{session.level || level}</strong>
              <p className="muted">Stay in the same scenario until the conversation is complete.</p>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Progress</span>
              <strong>
                {session.progress.user_turns_completed}/{session.progress.user_turns_total}
              </strong>
              <p className="muted">{session.status === "completed" ? "Conversation finished." : "Keep moving forward one reply at a time."}</p>
            </div>
          </div>
          <div className="chat-stack">
            {session.messages.map((item: any) => (
              <div key={item.message_id} className={item.speaker === "USER" ? "chat-bubble user" : "chat-bubble"}>
                <strong>{roleLabel(item.speaker)}</strong>
                <p>{item.text}</p>
                {item.translation ? <small className="muted">{item.translation}</small> : null}
              </div>
            ))}
          </div>
          {session.status !== "completed" ? (
            <Field label="Your reply" value={message} onChange={(event) => setMessage(event.target.value)} disabled={!session.ui.show_input} />
          ) : null}
        </Panel>
      )}

      {review ? (
        <Panel className="secondary-card" title="Conversation feedback" subtitle="Review the main takeaways from your completed session.">
          <div className="study-card">
            <div className="badge-row">
              <span className="state-pill stopped">
                <Sparkles size={14} aria-hidden="true" />
                Review ready
              </span>
            </div>
            <div className="card-stack">
              {reviewHighlights(review).map((item) => (
                <p key={item} className="study-card-subtitle">
                  {item}
                </p>
              ))}
              {!reviewHighlights(review).length ? <p className="study-card-subtitle">Your feedback is ready. Start a new conversation to keep practicing.</p> : null}
            </div>
          </div>
        </Panel>
      ) : null}
    </ScreenScaffold>
  );
}
