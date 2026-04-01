import { useEffect, useState } from "react";

import { getAudioBaseUrl } from "@core/api/apiConfig";
import { audioManager } from "@core/audio/audioManager";
import SpeakingPracticeScreen from "@ui/screens/SpeakingPracticeScreen";
import useSpeakingPractice from "@ui/hooks/useSpeakingPractice";

type Props = {
  onBack: () => void;
  onOpenLearning: () => void;
};

export default function SpeakingPracticeExperience({ onBack, onOpenLearning }: Props) {
  const { data, error, loading, next, retry, submit } = useSpeakingPractice();
  const [transcriptDraft, setTranscriptDraft] = useState("");
  const [recordingState, setRecordingState] = useState<"idle" | "recorded" | "recording">("idle");
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<"idle" | "playing">("idle");
  const [recordingError, setRecordingError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.current_prompt?.answer_status === "pending") {
      setTranscriptDraft("");
      setRecordingState("idle");
      setRecordingUri(null);
      setRecordingError(null);
    }
  }, [data?.current_prompt?.id, data?.current_prompt?.answer_status]);

  useEffect(() => {
    return () => {
      void audioManager.stop();
      void audioManager.stopRecording();
    };
  }, []);

  async function playPrompt() {
    if (!data?.current_prompt?.prompt_audio.url) {
      return;
    }

    setAudioState("playing");

    try {
      await audioManager.play(`${getAudioBaseUrl()}${data.current_prompt.prompt_audio.url}`);
    } finally {
      setAudioState("idle");
    }
  }

  async function startRecording() {
    setRecordingError(null);

    try {
      await audioManager.stop();
      await audioManager.startRecording();
      setRecordingState("recording");
    } catch (error) {
      setRecordingState("idle");
      setRecordingError(error instanceof Error ? error.message : "RECORDING_FAILED");
    }
  }

  async function stopRecording() {
    try {
      const uri = await audioManager.stopRecording();
      setRecordingUri(uri);
      setRecordingState(uri ? "recorded" : "idle");
    } catch (error) {
      setRecordingState("idle");
      setRecordingError(error instanceof Error ? error.message : "RECORDING_FAILED");
    }
  }

  return (
    <SpeakingPracticeScreen
      accuracy={data?.completion_state.accuracy ?? 0}
      audioPlaying={audioState === "playing"}
      completedCount={data?.completion_state.attempts ?? 0}
      currentPrompt={data?.current_prompt ?? null}
      errorMessage={error?.message ?? null}
      latestResult={data?.latest_result ?? null}
      loading={loading}
      onBack={onBack}
      onNext={() => {
        void next();
      }}
      onOpenLearning={onOpenLearning}
      onPlayPrompt={() => {
        void playPrompt();
      }}
      onRetry={() => {
        void retry();
      }}
      onStartRecording={() => {
        void startRecording();
      }}
      onStopRecording={() => {
        void stopRecording();
      }}
      onSubmit={() => {
        void submit(transcriptDraft, Boolean(recordingUri));
      }}
      promptServed={data?.completion_state.prompts_served ?? 0}
      recordingError={recordingError}
      recordingState={recordingState}
      sessionComplete={data?.completion_state.session_complete ?? false}
      totalCount={data?.completion_state.total_count ?? 0}
      transcriptDraft={transcriptDraft}
      onTranscriptChange={setTranscriptDraft}
    />
  );
}
