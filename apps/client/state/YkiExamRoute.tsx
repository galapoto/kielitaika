import { useEffect, useRef, useState } from "react";

import { audioManager } from "@core/audio/audioManager";
import { animation } from "@ui/tokens";
import ApplicationErrorScreen from "@ui/screens/ApplicationErrorScreen";
import YkiExamScreen from "@ui/screens/YkiExamScreen";

import useYkiExam from "../features/yki-exam/hooks/useYkiExam";

type Props = {
  onExit: () => void;
};

type PendingAction =
  | "advance"
  | "play_prompt"
  | "retry"
  | "start_recording"
  | "submit"
  | null;

type ViewSnapshot = {
  kind: string;
  section: string | null;
  viewKey: string;
};

function formatCountdown(totalSeconds: number) {
  const normalized = Math.max(0, totalSeconds);
  const minutes = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (normalized % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatTokenLabel(value: string | null | undefined) {
  if (!value) {
    return "pending";
  }

  return value.replace(/_/g, " ").toLowerCase();
}

function humanizeRuntimeMessage(message: string | null) {
  if (!message) {
    return null;
  }

  const knownMessages: Record<string, string> = {
    AUDIO_SUBMISSION_FAILED:
      "The recording could not be submitted. Retry once the exam runtime is stable.",
    MICROPHONE_PERMISSION_DENIED:
      "Microphone access is required before you can record the speaking response.",
    SESSION_NOT_FOUND:
      "The governed exam session could not be found.",
    TRANSPORT_ERROR:
      "The exam runtime could not confirm the latest backend state.",
  };

  if (knownMessages[message]) {
    return knownMessages[message];
  }

  if (/^[A-Z0-9_]+$/.test(message)) {
    const normalized = message.toLowerCase().replace(/_/g, " ");
    return normalized.charAt(0).toUpperCase() + normalized.slice(1) + ".";
  }

  return message;
}

function isQuestionKind(kind: string) {
  return kind === "question" || kind.endsWith("question");
}

function isPassageKind(kind: string) {
  return kind === "passage" || kind.endsWith("passage");
}

function buildTransitionLabel(previous: ViewSnapshot | null, next: ViewSnapshot) {
  if (!previous || previous.viewKey === next.viewKey) {
    return null;
  }

  if (next.kind === "exam_complete") {
    return "Finalizing the exam results.";
  }

  if (next.kind === "section_complete") {
    return "Sealing this section.";
  }

  if (previous.kind === "section_complete" && next.section) {
    return `Opening the ${formatTokenLabel(next.section)} section.`;
  }

  if (previous.section !== next.section && next.section) {
    return `Opening the ${formatTokenLabel(next.section)} section.`;
  }

  if (isPassageKind(previous.kind) && isQuestionKind(next.kind)) {
    return "Passage complete. Opening the question phase.";
  }

  if (previous.kind === "listening_prompt" && isQuestionKind(next.kind)) {
    return "Listening prompt complete. Opening the question phase.";
  }

  if (isQuestionKind(previous.kind) && isQuestionKind(next.kind)) {
    return "Loading the next question.";
  }

  return `Loading ${formatTokenLabel(next.kind)}.`;
}

function buildPlaybackStateLabel(
  playback:
    | {
        count: number;
        limit: number;
        remaining: number;
      }
    | null
    | undefined,
  activeRequest: PendingAction,
  transportErrorMessage: string | null,
) {
  if (!playback) {
    return null;
  }

  if (activeRequest === "play_prompt") {
    return "Preparing prompt playback.";
  }

  if (transportErrorMessage) {
    return "Playback confirmation is waiting for the backend runtime.";
  }

  if (playback.remaining === 0) {
    return "Playback completed. Continue to the questions when ready.";
  }

  if (playback.count > 0) {
    return `${playback.remaining} replay remaining. Continue when ready.`;
  }

  return "Prompt ready. Listen first, then continue to the questions.";
}

export default function YkiExamRoute({ onExit }: Props) {
  const {
    data,
    fatalError,
    loading,
    notice,
    transportError,
    advance,
    playPrompt,
    refresh,
    submitAnswer,
    submitAudio,
  } = useYkiExam();
  const [answerDraft, setAnswerDraft] = useState("");
  const [recording, setRecording] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [runtimeMessage, setRuntimeMessage] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] = useState<PendingAction>(null);
  const [transitionLabel, setTransitionLabel] = useState<string | null>(null);
  const previousViewRef = useRef<ViewSnapshot | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAnswerDraft(data?.current_view.submitted_answer ?? "");
  }, [data?.current_view.view_key, data?.current_view.submitted_answer]);

  useEffect(() => {
    setCountdownSeconds(data?.timing_manifest.current_section_remaining_seconds ?? 0);
  }, [data?.timing_manifest.current_section_remaining_seconds, data?.current_view.view_key]);

  useEffect(() => {
    if (!data || data.navigation.read_only) {
      return;
    }

    const timer = setInterval(() => {
      setCountdownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.session_id, data?.current_view.view_key, data?.navigation.read_only]);

  useEffect(() => {
    setRuntimeMessage(humanizeRuntimeMessage(notice));
  }, [notice]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const nextView: ViewSnapshot = {
      kind: data.current_view.kind,
      section: data.current_view.section,
      viewKey: data.current_view.view_key,
    };
    const nextTransitionLabel = buildTransitionLabel(previousViewRef.current, nextView);

    previousViewRef.current = nextView;

    if (!nextTransitionLabel) {
      return;
    }

    setTransitionLabel(nextTransitionLabel);

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = setTimeout(() => {
      setTransitionLabel(null);
      transitionTimerRef.current = null;
    }, animation.duration.normal);
  }, [data?.current_view.kind, data?.current_view.section, data?.current_view.view_key]);

  useEffect(
    () => () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    },
    [],
  );

  async function runExamAction(kind: PendingAction, action: () => Promise<unknown>) {
    setRuntimeMessage(null);
    setActiveRequest(kind);

    try {
      await action();
    } finally {
      setActiveRequest((current) => (current === kind ? null : current));
    }
  }

  async function handleStartRecording() {
    setRuntimeMessage(null);
    setActiveRequest("start_recording");

    try {
      await audioManager.startRecording();
      setRecording(true);
    } catch (error) {
      setRecording(false);
      setRuntimeMessage(
        humanizeRuntimeMessage(
          error instanceof Error ? error.message : "MICROPHONE_PERMISSION_DENIED",
        ),
      );
    } finally {
      setActiveRequest((current) => (current === "start_recording" ? null : current));
    }
  }

  async function handleStopRecording() {
    setRuntimeMessage(null);
    setActiveRequest("submit");

    try {
      const audioUri = await audioManager.stopRecording();
      setRecording(false);

      if (!audioUri) {
        setRuntimeMessage(humanizeRuntimeMessage("AUDIO_SUBMISSION_FAILED"));
        return;
      }

      await submitAudio(audioUri);
    } catch (error) {
      setRecording(false);
      setRuntimeMessage(
        humanizeRuntimeMessage(
          error instanceof Error ? error.message : "AUDIO_SUBMISSION_FAILED",
        ),
      );
    } finally {
      setActiveRequest((current) => (current === "submit" ? null : current));
    }
  }

  if (fatalError) {
    return (
      <ApplicationErrorScreen
        code={fatalError.code ?? fatalError.message}
        message="YKI exam runtime validation failed. The governed exam flow has been stopped."
        onPrimaryAction={onExit}
        primaryLabel="Return Home"
        traceReference={fatalError.traceReference ?? null}
      />
    );
  }

  if (loading && !data) {
    return (
      <YkiExamScreen
        actionStates={{
          next: "default",
          option: "default",
          playPrompt: "default",
          retry: "default",
          startRecording: "default",
          stopRecording: "default",
          submit: "default",
        }}
        answerDraft=""
        busy
        certificate={null}
        countdownLabel="00:00"
        currentView={{
          view_key: "loading",
          kind: "loading",
          title: "Preparing exam runtime",
          prompt: "Loading the engine-controlled YKI exam session.",
          input_mode: "none",
          instructions: ["The client is waiting for the backend runtime contract."],
          answer_status: "pending",
          response_locked: true,
          section: null,
          options: [],
          actions: {
            next: null,
            play_prompt: null,
            submit: null,
          },
        }}
        examStatus="loading"
        onAnswerChange={setAnswerDraft}
        onNext={() => undefined}
        onPlayPrompt={() => undefined}
        onRetry={() => {
          void refresh();
        }}
        onSelectChoice={() => undefined}
        onStartRecording={() => undefined}
        onStopRecording={() => undefined}
        onSubmitText={() => undefined}
        playbackStateLabel={null}
        progress={{
          completedSectionCount: 0,
          completedStepCount: 0,
          totalSectionCount: 4,
          totalStepCount: 0,
        }}
        readOnly={false}
        recording={false}
        runtimeMessage={runtimeMessage}
        sectionProgress={[]}
        transportErrorMessage={humanizeRuntimeMessage(transportError?.message ?? null)}
        transitionLabel={null}
      />
    );
  }

  if (!data) {
    return (
      <ApplicationErrorScreen
        code="SESSION_NOT_FOUND"
        message="The governed YKI exam session could not be established."
        onPrimaryAction={onExit}
        primaryLabel="Return Home"
        traceReference={null}
      />
    );
  }

  const transportErrorMessage = humanizeRuntimeMessage(transportError?.message ?? null);
  const playbackStateLabel = buildPlaybackStateLabel(
    data.current_view.playback,
    activeRequest,
    transportErrorMessage,
  );

  return (
    <YkiExamScreen
      actionStates={{
        next:
          activeRequest === "advance"
            ? "loading"
            : data.current_view.response_locked && !data.current_view.actions.next?.enabled
              ? "locked"
              : "default",
        option:
          activeRequest === "submit"
            ? "loading"
            : data.current_view.response_locked
              ? "locked"
              : "default",
        playPrompt:
          activeRequest === "play_prompt"
            ? "loading"
            : (data.current_view.playback?.remaining ?? 1) === 0
              ? "locked"
              : "default",
        retry: activeRequest === "retry" ? "loading" : "default",
        startRecording:
          activeRequest === "start_recording"
            ? "loading"
            : data.current_view.response_locked
              ? "locked"
              : "default",
        stopRecording:
          activeRequest === "submit"
            ? "loading"
            : data.current_view.response_locked
              ? "locked"
              : "default",
        submit:
          activeRequest === "submit"
            ? "loading"
            : data.current_view.response_locked
              ? "locked"
              : "default",
      }}
      answerDraft={answerDraft}
      busy={loading}
      certificate={data.certificate}
      countdownLabel={formatCountdown(countdownSeconds)}
      currentView={data.current_view}
      examStatus={data.status}
      onAnswerChange={setAnswerDraft}
      onNext={() => {
        if (!data.current_view.actions.next?.enabled || loading) {
          return;
        }

        void runExamAction("advance", advance);
      }}
      onPlayPrompt={() => {
        if (!data.current_view.actions.play_prompt?.enabled || loading) {
          return;
        }

        void runExamAction("play_prompt", playPrompt);
      }}
      onRetry={() => {
        void runExamAction("retry", refresh);
      }}
      onSelectChoice={(option) => {
        if (loading || data.current_view.response_locked) {
          return;
        }

        setAnswerDraft(option);
        void runExamAction("submit", async () => {
          await submitAnswer(option);
        });
      }}
      onStartRecording={() => {
        if (loading || data.current_view.response_locked) {
          return;
        }

        void handleStartRecording();
      }}
      onStopRecording={() => {
        if (loading || !recording) {
          return;
        }

        void handleStopRecording();
      }}
      onSubmitText={() => {
        if (loading || data.current_view.response_locked) {
          return;
        }

        void runExamAction("submit", async () => {
          await submitAnswer(answerDraft);
        });
      }}
      playbackStateLabel={playbackStateLabel}
      progress={{
        completedSectionCount: data.completion_state.completed_section_count,
        completedStepCount: data.completion_state.completed_step_count,
        totalSectionCount: data.completion_state.total_section_count,
        totalStepCount: data.completion_state.total_step_count,
      }}
      readOnly={data.navigation.read_only}
      recording={recording}
      runtimeMessage={runtimeMessage}
      sectionProgress={data.section_progress}
      transportErrorMessage={transportErrorMessage}
      transitionLabel={transitionLabel}
    />
  );
}
