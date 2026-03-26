import { useEffect, useState } from "react";
import { Check, Play, RotateCcw, SendHorizontal, SkipForward, Sparkles, Volume2 } from "lucide-react";

import { Field } from "../components/Field";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { StatusBanner } from "../components/StatusBanner";
import { playTap } from "../services/audioService";
import { fetchNextCard, startAdaptiveCardsSession, startCardsSession, submitCardAnswer } from "../services/cardsService";
import type { PracticeSection } from "../state/types";
import { assertKnownBackendContentType, resolvePracticeContentType, UI_INVARIANTS } from "../system/ui_invariants";

function readCardKey(card: any | null): string {
  return card?.card_id || card?.word || card?.front_text || "card-runtime";
}

function safeCount(value: number | null | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

function sectionDefaults(section: PracticeSection): { domain: string; contentType: string; label: string } {
  if (section === "grammar") {
    return { domain: "general", contentType: resolvePracticeContentType(section), label: "Grammar" };
  }
  if (section === "phrases") {
    return { domain: "general", contentType: resolvePracticeContentType(section), label: "Phrases" };
  }
  return { domain: "general", contentType: resolvePracticeContentType(section), label: "Vocabulary" };
}

function followUpPrompt(card: any | null): string {
  return card?.served_follow_up?.prompt || card?.back_prompt || "Recall the matching Finnish answer.";
}

function statePresentation(card: any | null): { tone: "new" | "practiced" | "mastered"; icon: string; label: string } {
  if (card?.state === "mastered") {
    return { tone: "mastered", icon: "✓", label: "Mastered" };
  }
  if (card?.state === "practiced") {
    return { tone: "practiced", icon: "↻", label: "Practiced" };
  }
  return { tone: "new", icon: "↻", label: "New" };
}

function sectionDescription(section: PracticeSection): string {
  if (section === "grammar") {
    return "Review grammar patterns with one focused recall card at a time.";
  }
  if (section === "phrases") {
    return "Practice useful Finnish phrases with the same centered card flow.";
  }
  return "Build your Finnish vocabulary with a clear card-by-card learning rhythm.";
}

function practiceModeLabel(value: boolean): string {
  return value ? "Adaptive" : "Standard";
}

function sessionStatusLabel(value: string | null | undefined): string {
  if (value === "completed") {
    return "Complete";
  }
  if (value === "active") {
    return "Active";
  }
  return "In progress";
}

function buildDots(answered: number, total: number): boolean[] {
  const ratio = total > 0 ? answered / total : 0;
  const activeCount = Math.max(1, Math.min(4, Math.ceil(ratio * 4)));
  return Array.from({ length: 4 }, (_, index) => index < activeCount);
}

function assertCardStructure(card: any): void {
  const cardContent = String(card?.front_text || card?.word || "").trim();
  if (!card?.state) {
    throw new Error("Missing card.state");
  }
  if (!cardContent) {
    throw new Error("Missing card.content");
  }
  if (!card?.content_type) {
    throw new Error("Missing card.content_type");
  }
  assertKnownBackendContentType(String(card.content_type));
  if (!UI_INVARIANTS.CARD_STATES.includes(card.state)) {
    throw new Error(`Unknown card.state: ${card.state}`);
  }
}

export function CardsScreen(props: { section?: PracticeSection }) {
  const currentSection = props.section || "vocabulary";
  const defaults = sectionDefaults(currentSection);
  const [domain, setDomain] = useState(defaults.domain);
  const [contentType, setContentType] = useState(defaults.contentType);
  const [level, setLevel] = useState("A1_A2");
  const [adaptive, setAdaptive] = useState(false);
  const [runtime, setRuntime] = useState<any | null>(null);
  const [card, setCard] = useState<any | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardKey = readCardKey(card);
  const answeredCount = safeCount(runtime?.answered_count);
  const totalCards = Math.max(1, safeCount(runtime?.total_cards));
  const cardState = statePresentation(card);
  const progressRatio = Math.min(1, answeredCount / totalCards);
  const dots = buildDots(answeredCount, totalCards);

  if (card) {
    assertCardStructure(card);
  }

  useEffect(() => {
    setIsFlipped(false);
  }, [cardKey]);

  useEffect(() => {
    const nextDefaults = sectionDefaults(currentSection);
    assertKnownBackendContentType(nextDefaults.contentType);
    setDomain(nextDefaults.domain);
    setContentType(nextDefaults.contentType);
    setRuntime(null);
    setCard(null);
    setAnswer("");
    setFeedback(null);
    setError(null);
  }, [currentSection]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    setIsFlipped(false);
  }, [feedback?.session?.current_card_index]);

  async function start() {
    setBusy(true);
    setError(null);
    setFeedback(null);
    assertKnownBackendContentType(contentType);
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

  async function skip() {
    await next();
  }

  function speakFrontText() {
    const text = String(card?.front_text || card?.word || "").trim();
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    playTap();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fi-FI";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }

  function toggleFlip() {
    playTap();
    setIsFlipped((previous) => !previous);
  }

  function renderAnswerComposer() {
    const options = card?.served_follow_up?.options;
    if (Array.isArray(options) && options.length > 0) {
      return (
        <div className="practice-answer-grid">
          {options.map((option: any) => (
            <button
              key={option.option_id}
              type="button"
              className={answer === option.option_id ? "practice-answer-option active" : "practice-answer-option"}
              onClick={() => {
                playTap();
                setAnswer(option.option_id);
              }}
            >
              <span>{option.option_id}</span>
              <strong>{option.text}</strong>
            </button>
          ))}
        </div>
      );
    }

    return (
      <Field
        label="Your answer"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="Type the Finnish answer"
      />
    );
  }

  return (
    <ScreenScaffold
      className="practice-screen"
      centerContent={Boolean(runtime)}
      header={
        <div className="screen-heading">
          <span className="eyebrow">Practice</span>
          <h1 className="hero-title">{defaults.label}</h1>
          <p className="hero-subtitle">{sectionDescription(currentSection)}</p>
        </div>
      }
      actions={
        !runtime ? (
          <div className="actions-row">
            <button type="button" className="practice-primary-action" onClick={start} disabled={busy}>
              <Play size={16} aria-hidden="true" />
              {busy ? "Starting..." : "Start session"}
            </button>
          </div>
        ) : (
          <div className="actions-row practice-runtime-actions">
            {isFlipped ? (
              <button
                type="button"
                className="practice-secondary-action practice-submit-action"
                onClick={submit}
                disabled={busy || !answer}
              >
                <SendHorizontal size={16} aria-hidden="true" />
                {busy ? "Submitting..." : "Submit answer"}
              </button>
            ) : null}
            <button type="button" className="practice-skip-button" onClick={skip} disabled={busy}>
              <SkipForward size={16} aria-hidden="true" />
              Skip
            </button>
          </div>
        )
      }
    >
      {!runtime && (
        <section className="practice-intro-card primary-card">
          <div>
            <span className="eyebrow">Practice</span>
            <h2>{defaults.label}</h2>
            <p className="hero-subtitle">{sectionDescription(currentSection)}</p>
          </div>
          <div className="practice-session-grid">
            <Field label="Level" value={level} onChange={(event) => setLevel(event.target.value)} />
            <label className="field">
              <span className="field-label">
                <Sparkles size={16} aria-hidden="true" />
                <span>Learning mode</span>
              </span>
              <select value={adaptive ? "yes" : "no"} onChange={(event) => setAdaptive(event.target.value === "yes")}>
                <option value="no">Standard</option>
                <option value="yes">Adaptive</option>
              </select>
            </label>
          </div>
          <div className="practice-chip-row">
            <span className="practice-chip">8px rhythm</span>
            <span className="practice-chip">{practiceModeLabel(adaptive)} session</span>
            <span className="practice-chip">One card at a time</span>
          </div>
          {error ? <StatusBanner tone="error" title="Practice error" message={error} /> : null}
        </section>
      )}

      {runtime ? (
        <div className="practice-runtime-root">
          <div className="practice-card-stage primary-card">
            <div className="practice-topbar">
              <button type="button" className="recall-pill" onClick={toggleFlip}>
                <RotateCcw size={16} aria-hidden="true" />
                <span>Recall</span>
              </button>
              <button type="button" className="recall-pill" onClick={toggleFlip}>
                <Check size={16} aria-hidden="true" />
                <span>{isFlipped ? "Prompt" : "Answer"}</span>
              </button>
            </div>

            {card ? (
              <div key={cardKey} className="practice-card-wrapper">
                <div className={`practice-card-shell ${cardState.tone}`.trim()}>
                  <div className={`practice-card-inner ${isFlipped ? "is-flipped" : ""}`.trim()}>
                    <section className="practice-card-face">
                      <button type="button" className="practice-icon-button left" onClick={speakFrontText} aria-label="Play pronunciation">
                        <Volume2 size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={`practice-icon-button right ${cardState.tone}`.trim()}
                        onClick={toggleFlip}
                        aria-label={isFlipped ? "Show prompt side" : "Show answer side"}
                      >
                        <RotateCcw size={18} aria-hidden="true" />
                      </button>

                      <div className="practice-card-core">
                        <span className="eyebrow">{cardState.label}</span>
                        <h2 className={`practice-card-word ${cardState.tone}`.trim()}>{card.front_text || card.word}</h2>
                        {isFlipped ? (
                          <div className="practice-answer-panel">
                            <p className="practice-answer-prompt">{followUpPrompt(card)}</p>
                            {renderAnswerComposer()}
                          </div>
                        ) : (
                          <p className="practice-card-hint">Tap the recall controls to reveal the answer side and submit your response.</p>
                        )}
                      </div>

                      <div className="practice-card-footer">
                        <div className="practice-card-divider" />
                        <div className="practice-card-action-note">Use the action zone below to skip or submit.</div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            ) : (
              <div className="practice-complete-card">
                <span className="eyebrow">Session complete</span>
                <h2>All available cards in this run have been served.</h2>
                <p className="muted">Start another session to continue practice with the same isolated card layout.</p>
              </div>
            )}

            <div className="practice-progress-stack">
              <div className="practice-dot-row" aria-hidden="true">
                {dots.map((active, index) => (
                  <span key={index} className={active ? "practice-dot active" : "practice-dot"} />
                ))}
              </div>
              <div className="practice-progress-bar">
                <span style={{ width: `${Math.max(8, progressRatio * 100)}%` }} />
              </div>
              <div className="practice-progress-copy">
                <span>{answeredCount}/{totalCards} complete</span>
                <strong>{sessionStatusLabel(runtime.status)}</strong>
              </div>
            </div>
          </div>
          {error ? <StatusBanner tone="error" title="Practice error" message={error} /> : null}
        </div>
      ) : null}

      {feedback && !runtime ? (
        <StatusBanner
          tone={feedback.correct ? "success" : "error"}
          title={feedback.correct ? "Correct answer" : "Incorrect answer"}
          message={`${feedback.explanation} Next action: ${feedback.next_recommended_action}.`}
        />
      ) : null}
    </ScreenScaffold>
  );
}
