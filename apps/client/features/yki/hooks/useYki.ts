import { useEffect, useRef, useState } from "react";

import { audioManager } from "@core/audio/audioManager";

import {
  advanceSession,
  clearSession,
  getCertificate,
  getHistory,
  getStoredSessionId,
  playListeningPrompt,
  resumeSession,
  startSession,
  submitAudio,
  type YkiProgressHistory,
  type YkiResumeData,
  type YkiRuntime,
  type YkiTask,
} from "../services/ykiService";

type HookState = {
  data: YkiResumeData | null;
  loading: boolean;
  recording: boolean;
  recordedUri: string | null;
  error: { message: string } | null;
  notice: string | null;
};

const initialState: HookState = {
  data: null,
  loading: true,
  recording: false,
  recordedUri: null,
  error: null,
  notice: null,
};

const DEVELOPMENT_INJECTOR_NOTICE = [
  "Audio submitted",
  "(development injector)",
].join(" ");

export default function useYki() {
  const [state, setState] = useState<HookState>(initialState);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingStartedAtRef = useRef<number | null>(null);
  const handlingExpiryRef = useRef(false);
  const autoStoppingRecordingRef = useRef(false);

  async function hydrateFromResume(notice?: string | null) {
    const res = await resumeSession();

    if (!res) {
      setState({
        data: null,
        loading: false,
        recording: false,
        recordedUri: null,
        error: null,
        notice: notice ?? null,
      });
      return;
    }

    if (!res.ok) {
      if (
        res.error?.message === "SESSION_EXPIRED" ||
        res.error?.message === "SESSION_NOT_FOUND"
      ) {
        await clearSession();
        setState({
          data: null,
          loading: false,
          recording: false,
          recordedUri: null,
          error: null,
          notice:
            res.error.message === "SESSION_EXPIRED"
              ? "Session expired. Start a new exam."
              : "Session not found. Start a new exam.",
        });
        return;
      }

      setState({
        data: null,
        loading: false,
        recording: false,
        recordedUri: null,
        error: res.error,
        notice: null,
      });
      return;
    }

    const resumedData = res.data;

    if (!resumedData) {
      setState({
        data: null,
        loading: false,
        recording: false,
        recordedUri: null,
        error: { message: "CORRUPTED_SESSION_DATA" },
        notice: null,
      });
      return;
    }

    setState((current) => ({
      data: {
        ...resumedData,
        progressHistory: resumedData.progressHistory ?? current.data?.progressHistory ?? null,
      },
      loading: false,
      recording: false,
      recordedUri: shouldKeepRecordedUri(resumedData, current.recordedUri),
      error: null,
      notice: notice ?? null,
    }));

    void hydrateCertificate(resumedData);
    void hydrateProgressHistory();
  }

  async function hydrateCertificate(resumedData: YkiResumeData) {
    const res = await getCertificate(resumedData.sessionId);

    if (res.ok && res.data) {
      setState((current) => {
        if (!current.data || current.data.sessionId !== resumedData.sessionId) {
          return current;
        }

        return {
          ...current,
          data: {
            ...current.data,
            certificate: res.data,
          },
        };
      });
      return;
    }

    if (
      res.error?.message === "SESSION_EXPIRED" ||
      res.error?.message === "SESSION_NOT_FOUND"
    ) {
      await clearSession();
      setState({
        data: null,
        loading: false,
        recording: false,
        recordedUri: null,
        error: null,
        notice:
          res.error.message === "SESSION_EXPIRED"
            ? "Session expired. Start a new exam."
            : "Session not found. Start a new exam.",
      });
      return;
    }

    if (res.error?.message === "EXAM_NOT_FINISHED") {
      return;
    }

    setState((current) => {
      if (!current.data || current.data.sessionId !== resumedData.sessionId) {
        return current;
      }

      return {
        ...current,
        data: {
          ...current.data,
          certificate: current.data.certificate ?? null,
        },
        notice: current.notice ?? "Result data unavailable.",
      };
    });
  }

  async function hydrateProgressHistory() {
    const res = await getHistory();

    if (!res.ok || !res.data) {
      return;
    }

    setState((current) => {
      if (!current.data) {
        return current;
      }

      return {
        ...current,
        data: {
          ...current.data,
          progressHistory: res.data,
        },
      };
    });
  }

  async function bootstrap() {
    const sessionId = await getStoredSessionId();

    if (!sessionId) {
      setState({
        data: null,
        loading: false,
        recording: false,
        recordedUri: null,
        error: null,
        notice: null,
      });
      return;
    }

    await hydrateFromResume();
  }

  async function handleStartSession() {
    setState((current) => ({ ...current, loading: true, error: null }));

    const res = await startSession();

    if (!res.ok) {
      setState({
        data: null,
        loading: false,
        recording: false,
        recordedUri: null,
        error: res.error,
        notice: null,
      });
      return;
    }

    await hydrateFromResume("Session restored.");
  }

  async function handleStartExam() {
    setState((current) => ({ ...current, loading: true, error: null }));

    const res = await advanceSession();

    if (!res.ok) {
      if (
        res.error?.message === "SESSION_EXPIRED" ||
        res.error?.message === "SESSION_NOT_FOUND"
      ) {
        await clearSession();
        setState({
          data: null,
          loading: false,
          recording: false,
          recordedUri: null,
          error: null,
          notice:
            res.error.message === "SESSION_EXPIRED"
              ? "Session expired. Start a new exam."
              : "Session not found. Start a new exam.",
        });
        return;
      }

      setState((current) => ({
        data: current.data,
        loading: false,
        recording: false,
        recordedUri: current.recordedUri,
        error: res.error,
        notice: current.notice,
      }));
      return;
    }

    await hydrateFromResume("Session restored.");
  }

  async function handleStartRecording() {
    if (examLocked) {
      setState((current) => ({
        ...current,
        error: { message: "TIME_EXPIRED" },
        notice: "Time expired. This section is locked.",
      }));
      return;
    }

    setState((current) => ({
      ...current,
      loading: false,
      recording: false,
      recordedUri: null,
      error: null,
      notice: null,
    }));

    try {
      await audioManager.startRecording();
      recordingStartedAtRef.current = Date.now();
      autoStoppingRecordingRef.current = false;
      setRecordingSeconds(0);
      setState((current) => ({
        ...current,
        recording: true,
        recordedUri: null,
        notice: "Recording in progress.",
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        recording: false,
        recordedUri: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "RECORDING_START_FAILED",
        },
        notice: null,
      }));
    }
  }

  async function handleStopRecording() {
    try {
      const uri = await audioManager.stopRecording();
      recordingStartedAtRef.current = null;
      autoStoppingRecordingRef.current = false;
      setRecordingSeconds(0);

      if (!uri) {
        setState((current) => ({
          ...current,
          recording: false,
          recordedUri: null,
          error: { message: "NO_RECORDING_AVAILABLE" },
          notice: null,
        }));
        return;
      }

      setState((current) => ({
        ...current,
        recording: false,
        recordedUri: uri,
        error: null,
        notice: "Recording ready to submit.",
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        recording: false,
        recordedUri: null,
        error: {
          message:
            error instanceof Error ? error.message : "RECORDING_STOP_FAILED",
        },
        notice: null,
      }));
    }
  }

  async function submitProvidedAudio(audioRef: string, successNotice: string) {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    const res = await submitAudio(audioRef);

    if (!res.ok) {
      if (
        res.error?.message === "SESSION_EXPIRED" ||
        res.error?.message === "SESSION_NOT_FOUND"
      ) {
        await clearSession();
        setState({
          data: null,
          loading: false,
          recording: false,
          recordedUri: null,
          error: null,
          notice:
            res.error.message === "SESSION_EXPIRED"
              ? "Session expired. Start a new exam."
              : "Session not found. Start a new exam.",
        });
        return;
      }

      if (res.error?.message === "TASK_ALREADY_ANSWERED") {
        await hydrateFromResume("Answer already submitted.");
        return;
      }

      setState((current) => ({
        ...current,
        loading: false,
        error: res.error,
      }));
      return;
    }

    recordingStartedAtRef.current = null;
    autoStoppingRecordingRef.current = false;
    setRecordingSeconds(0);
    await hydrateFromResume(successNotice);
    setState((current) => ({
      ...current,
      recordedUri: null,
    }));
  }

  async function handleSubmitAudio() {
    if (!state.recordedUri) {
      setState((current) => ({
        ...current,
        error: { message: "NO_AUDIO_READY" },
      }));
      return;
    }

    await submitProvidedAudio(state.recordedUri, "Audio submitted.");
  }

  async function handleInjectDevelopmentAudio() {
    const audioRef = `dev-audio-${Date.now()}`;

    await submitProvidedAudio(audioRef, DEVELOPMENT_INJECTOR_NOTICE);
  }

  async function handlePlayListeningPrompt() {
    if (examLocked) {
      setState((current) => ({
        ...current,
        error: { message: "TIME_EXPIRED" },
        notice: "Time expired. This section is locked.",
      }));
      return;
    }

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    const res = await playListeningPrompt();
    if (!res.ok) {
      if (
        res.error?.message === "SESSION_EXPIRED" ||
        res.error?.message === "SESSION_NOT_FOUND"
      ) {
        await clearSession();
        setState({
          data: null,
          loading: false,
          recording: false,
          recordedUri: null,
          error: null,
          notice:
            res.error.message === "SESSION_EXPIRED"
              ? "Session expired. Start a new exam."
              : "Session not found. Start a new exam.",
        });
        return;
      }

      setState((current) => ({
        ...current,
        loading: false,
        error: res.error,
      }));
      return;
    }

    await hydrateFromResume("Listening prompt consumed.");
  }

  async function handleTimeExpiry() {
    if (handlingExpiryRef.current) {
      return;
    }

    handlingExpiryRef.current = true;

    if (state.recording) {
      try {
        const uri = await audioManager.stopRecording();
        recordingStartedAtRef.current = null;
        autoStoppingRecordingRef.current = false;
        setRecordingSeconds(0);

        if (uri) {
          await submitProvidedAudio(
            uri,
            "Recording auto-submitted when time expired.",
          );
          return;
        }
      } catch {
        // Keep the section locked even if recording teardown fails.
      }
    } else if (state.recordedUri) {
      await submitProvidedAudio(
        state.recordedUri,
        "Audio auto-submitted when time expired.",
      );
      return;
    }

    setState((current) => ({
      ...current,
      loading: false,
      recording: false,
      notice: "Time expired. This section is locked.",
      error: null,
    }));
  }

  async function handleAutoStopRecording() {
    if (autoStoppingRecordingRef.current) {
      return;
    }

    autoStoppingRecordingRef.current = true;
    await handleStopRecording();
    setState((current) => ({
      ...current,
      notice: `Recording auto-stopped at ${speakingMaxRecordingSeconds}s.`,
    }));
  }

  const currentTask = getCurrentTask(state.data);
  const runtime = state.data?.runtime ?? null;
  const progressHistory = state.data?.progressHistory ?? null;
  const speakingTaskAnswered =
    state.data?.currentSection === "speaking" &&
    currentTask?.status === "answered";
  const certificate = state.data?.certificate ?? null;
  const examLocked = remainingSeconds !== null && remainingSeconds <= 0;
  const isNearExpiry =
    remainingSeconds !== null &&
    remainingSeconds <= getWarningThresholdSeconds(runtime);
  const listeningPlaysRemaining = getListeningPlaysRemaining(currentTask);
  const speakingMaxRecordingSeconds =
    currentTask?.maxDurationSeconds ??
    runtime?.speaking.maxRecordingSeconds ??
    30;

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (!state.data || state.data.certificate) {
      setRemainingSeconds(null);
      handlingExpiryRef.current = false;
      return;
    }

    const updateRemaining = () => {
      const nextRemaining = getRemainingSeconds(state.data);
      setRemainingSeconds(nextRemaining);
      if (nextRemaining !== null && nextRemaining <= 0) {
        void handleTimeExpiry();
      } else {
        handlingExpiryRef.current = false;
      }
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);

    return () => clearInterval(timer);
  }, [state.data, state.recording, state.recordedUri]);

  useEffect(() => {
    if (!state.recording || !recordingStartedAtRef.current) {
      setRecordingSeconds(0);
      autoStoppingRecordingRef.current = false;
      return;
    }

    const updateRecordingSeconds = () => {
      if (!recordingStartedAtRef.current) {
        return;
      }

      const elapsedSeconds = Math.floor(
        (Date.now() - recordingStartedAtRef.current) / 1000,
      );
      setRecordingSeconds(elapsedSeconds);

      if (elapsedSeconds >= speakingMaxRecordingSeconds) {
        void handleAutoStopRecording();
      }
    };

    updateRecordingSeconds();
    const timer = setInterval(updateRecordingSeconds, 1000);

    return () => clearInterval(timer);
  }, [state.recording, speakingMaxRecordingSeconds]);

  return {
    ...state,
    certificate,
    runtime,
    progressHistory,
    currentTask,
    speakingTaskAnswered,
    remainingSeconds,
    isNearExpiry,
    examLocked,
    recordingSeconds,
    listeningPlaysRemaining,
    speakingMaxRecordingSeconds,
    startNewSession: handleStartSession,
    startExam: handleStartExam,
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    submitRecordedAudio: handleSubmitAudio,
    injectDevelopmentAudio: handleInjectDevelopmentAudio,
    playListeningPrompt: handlePlayListeningPrompt,
    refreshSession: bootstrap,
  };
}

function getCurrentTask(data: YkiResumeData | null): YkiTask | null {
  if (!data?.currentSection) {
    return null;
  }

  const section = data.sectionProgress[data.currentSection];

  if (!section) {
    return null;
  }

  return section.tasks[section.currentTaskIndex] ?? null;
}

function shouldKeepRecordedUri(
  data: YkiResumeData,
  recordedUri: string | null,
) {
  if (!recordedUri || data.currentSection !== "speaking") {
    return null;
  }

  const currentTask = getCurrentTask(data);

  if (!currentTask || currentTask.status === "answered") {
    return null;
  }

  return recordedUri;
}

function getRemainingSeconds(data: YkiResumeData | null) {
  if (!data) {
    return null;
  }

  const deadlines = [Date.parse(data.timing.expiresAt)];
  if (data.currentSection) {
    const sectionDeadline =
      data.sectionProgress[data.currentSection]?.expiresAt ?? null;
    if (sectionDeadline) {
      deadlines.push(Date.parse(sectionDeadline));
    }
  }

  const validDeadlines = deadlines.filter((value) => !Number.isNaN(value));
  if (!validDeadlines.length) {
    return null;
  }

  const remainingMs = Math.min(...validDeadlines) - Date.now();
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

function getWarningThresholdSeconds(runtime: YkiRuntime | null) {
  return runtime?.warningThresholdSeconds ?? 300;
}

function getListeningPlaysRemaining(task: YkiTask | null) {
  if (!task || task.type !== "listening") {
    return null;
  }

  const playbackLimit = task.playbackLimit ?? 0;
  const playbackCount = task.playbackCount ?? 0;
  return Math.max(0, playbackLimit - playbackCount);
}
