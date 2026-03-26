import { useState } from "react";

import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Panel } from "../components/Panel";
import { StatusBanner } from "../components/StatusBanner";
import { fetchNextCard, startAdaptiveCardsSession, startCardsSession, submitCardAnswer } from "../services/cardsService";

function readCardKey(card: any | null): string {
  return card?.card_id || card?.word || card?.front_text || "card-runtime";
}

export function CardsScreen() {
  const [domain, setDomain] = useState("general");
  const [contentType, setContentType] = useState("vocabulary_card");
  const [level, setLevel] = useState("A1_A2");
  const [adaptive, setAdaptive] = useState(false);
  const [runtime, setRuntime] = useState<any | null>(null);
  const [card, setCard] = useState<any | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardKey = readCardKey(card);

  async function start() {
    setBusy(true);
    setError(null);
    setFeedback(null);
    const response = adaptive
      ? await startAdaptiveCardsSession({ domain, content_type: contentType, profession: "none", level, limit: 10 })
      : await startCardsSession({ domain, content_type: contentType, profession: "none", level });
    if (!response.ok) {
      setError(response.error.message);
      setBusy(false);
      return;
    }
    setRuntime(response.data.session);
    setCard(response.data.first_card);
    setBusy(false);
  }

  async function submit() {
    if (!runtime) {
      return;
    }
    setBusy(true);
    setError(null);
    const response = await submitCardAnswer(runtime.session_id, { user_answer: answer });
    if (!response.ok) {
      setError(response.error.message);
      setBusy(false);
      return;
    }
    setFeedback(response.data);
    setRuntime(response.data.session);
    setCard(response.data.next_card);
    setAnswer("");
    setBusy(false);
  }

  async function next() {
    if (!runtime) {
      return;
    }
    setBusy(true);
    const response = await fetchNextCard(runtime.session_id);
    if (response.ok) {
      setRuntime(response.data.session);
      setCard(response.data.card);
    } else {
      setError(response.error.message);
    }
    setBusy(false);
  }

  return (
    <div className="screen-stack">
      <Panel title="Cards Runtime" subtitle="Frontend renders the returned session and card payload directly.">
        <div className="grid-two">
          <Field label="Domain" value={domain} onChange={(event) => setDomain(event.target.value)} />
          <Field label="Content type" value={contentType} onChange={(event) => setContentType(event.target.value)} />
          <Field label="Level" value={level} onChange={(event) => setLevel(event.target.value)} />
          <label className="field">
            <span>Adaptive mode</span>
            <select value={adaptive ? "yes" : "no"} onChange={(event) => setAdaptive(event.target.value === "yes")}>
              <option value="no">Standard</option>
              <option value="yes">Adaptive</option>
            </select>
          </label>
        </div>
        <div className="actions-row">
          <Button onClick={start} disabled={busy}>
            {busy ? "Starting..." : "Start session"}
          </Button>
          {runtime ? (
            <Button tone="secondary" onClick={next} disabled={busy}>
              Refresh current card
            </Button>
          ) : null}
        </div>
        {error ? <StatusBanner tone="error" title="Cards error" message={error} /> : null}
      </Panel>

      {runtime ? (
        <Panel title={`Session ${runtime.session_id}`} subtitle={`Status: ${runtime.status}`}>
          <div className="meta-grid">
            <div className="meta-item">
              <span className="eyebrow">Answered</span>
              <strong>{runtime.answered_count}</strong>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Current index</span>
              <strong>{runtime.current_card_index}</strong>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Total cards</span>
              <strong>{runtime.total_cards}</strong>
            </div>
          </div>
        </Panel>
      ) : null}

      {card ? (
        <Panel title={card.front_text || card.word} subtitle={card.back_prompt}>
          <div key={cardKey} className="study-card">
            <div className="study-card-hero">
              <div>
                <span className="eyebrow">Current prompt</span>
                <h3 className="study-card-title">{card.front_text || card.word}</h3>
                {card.back_prompt ? <p className="study-card-subtitle">{card.back_prompt}</p> : null}
              </div>
              <div className="study-card-progress">
                <span className="eyebrow">Progress</span>
                <strong>
                  {runtime?.answered_count || 0}/{runtime?.total_cards || 0}
                </strong>
              </div>
            </div>
            <div className="badge-row">
              <span className="subscription-chip">{card.content_type}</span>
              <span className="subscription-chip">{card.level_band}</span>
              <span className="subscription-chip">{card.domain}</span>
            </div>
            {card.served_follow_up?.options?.length ? (
              <div className="option-grid">
                {card.served_follow_up.options.map((option: any) => (
                  <Button
                    key={option.option_id}
                    tone={answer === option.option_id ? "primary" : "secondary"}
                    className={`option-button ${answer === option.option_id ? "is-selected" : ""}`.trim()}
                    onClick={() => setAnswer(option.option_id)}
                  >
                    {option.option_id} · {option.text}
                  </Button>
                ))}
              </div>
            ) : null}
            <div className="card-response-row">
              <Field label="Answer" value={answer} onChange={(event) => setAnswer(event.target.value)} />
              <Button onClick={submit} disabled={busy || !answer}>
                {busy ? "Submitting..." : "Submit answer"}
              </Button>
            </div>
          </div>
        </Panel>
      ) : null}

      {feedback ? (
        <StatusBanner
          tone={feedback.correct ? "success" : "error"}
          title={feedback.correct ? "Correct answer" : "Incorrect answer"}
          message={`${feedback.explanation} Next action: ${feedback.next_recommended_action}.`}
        />
      ) : null}
    </div>
  );
}
