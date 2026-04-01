import { useEffect, useState } from "react";

import { audioManager } from "@core/audio/audioManager";
import ApplicationErrorScreen from "@ui/screens/ApplicationErrorScreen";
import YkiExamScreen from "@ui/screens/YkiExamScreen";

import useYkiExam from "../features/yki-exam/hooks/useYkiExam";

type Props = {
  onExit: () => void;
};

function formatCountdown(totalSeconds: number) {
  const normalized = Math.max(0, totalSeconds);
  const minutes = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (normalized % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
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
    setRuntimeMessage(notice ?? null);
  }, [notice]);

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
        answerDraft=""
        busy
        countdownLabel="00:00"
        currentView={{
          view_key: "loading",
          kind: "loading",
          title: "Preparing Exam Runtime",
          prompt: "Loading the engine-controlled YKI exam session.",
          input_mode: "none",
          instructions: [
            "The client is waiting for the backend runtime contract.",
          ],
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
        progress={{
          completedSectionCount: 0,
          completedStepCount: 0,
          totalSectionCount: 4,
          totalStepCount: 0,
        }}
        recording={false}
        runtimeMessage={runtimeMessage}
        sectionProgress={[]}
        transportErrorMessage={transportError?.message ?? null}
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

  async function handleStartRecording() {
    setRuntimeMessage(null);

    try {
      await audioManager.startRecording();
      setRecording(true);
    } catch (error) {
      setRecording(false);
      setRuntimeMessage(
        error instanceof Error ? error.message : "MICROPHONE_PERMISSION_DENIED",
      );
    }
  }

  async function handleStopRecording() {
    try {
      const audioUri = await audioManager.stopRecording();
      setRecording(false);

      if (!audioUri) {
        setRuntimeMessage("AUDIO_SUBMISSION_FAILED");
        return;
      }

      void submitAudio(audioUri);
    } catch (error) {
      setRecording(false);
      setRuntimeMessage(
        error instanceof Error ? error.message : "AUDIO_SUBMISSION_FAILED",
      );
    }
  }

  return (
    <YkiExamScreen
      answerDraft={answerDraft}
      busy={loading}
      countdownLabel={formatCountdown(countdownSeconds)}
      currentView={data.current_view}
      examStatus={data.status}
      onAnswerChange={setAnswerDraft}
      onNext={() => {
        if (!data.current_view.actions.next?.enabled || loading) {
          return;
        }

        void advance();
      }}
      onPlayPrompt={() => {
        if (!data.current_view.actions.play_prompt?.enabled || loading) {
          return;
        }

        void playPrompt();
      }}
      onRetry={() => {
        void refresh();
      }}
      onSelectChoice={(option) => {
        if (loading || data.current_view.response_locked) {
          return;
        }

        setAnswerDraft(option);
        void submitAnswer(option);
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

        void submitAnswer(answerDraft);
      }}
      progress={{
        completedSectionCount: data.completion_state.completed_section_count,
        completedStepCount: data.completion_state.completed_step_count,
        totalSectionCount: data.completion_state.total_section_count,
        totalStepCount: data.completion_state.total_step_count,
      }}
      recording={recording}
      runtimeMessage={runtimeMessage}
      sectionProgress={data.section_progress}
      transportErrorMessage={transportError?.message ?? null}
    />
  );
}
