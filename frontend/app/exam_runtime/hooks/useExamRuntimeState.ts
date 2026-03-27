import { useEffect, useMemo, useState } from "react";

import { useRecorder } from "../../hooks/useRecorder";
import { listYkiCaches, saveYkiCache } from "../../services/storage";
import { uploadVoiceTranscription } from "../../services/voiceService";
import { fetchYkiSession, submitYkiAnswer, submitYkiExam, submitYkiSpeaking, submitYkiWriting } from "../../services/ykiService";
import type { ExamRuntimeContract, ExamSectionItem, ObjectiveAnswerValue } from "../../types/exam";
import { validateRuntimeContract } from "../../utils/validateRuntime";

type RuntimeItem = {
  sectionType: ExamRuntimeContract["sections"][number]["section_type"];
  sectionIndex: number;
  item: ExamSectionItem;
};

type Props = {
  runtime: ExamRuntimeContract | null;
  onRuntimeChange: (runtime: ExamRuntimeContract | null) => void;
  onComplete: () => void;
};

function isLevelBand(value: unknown): value is "A1_A2" | "B1_B2" | "C1_C2" {
  return value === "A1_A2" || value === "B1_B2" || value === "C1_C2";
}

function findRuntimeCache(sessionId: string) {
  return listYkiCaches().find((cache) => cache.exam_session_id === sessionId) || null;
}

function flattenItems(runtime: ExamRuntimeContract): RuntimeItem[] {
  return runtime.sections.flatMap((section, sectionIndex) =>
    section.items.map((item) => ({
      sectionType: section.section_type,
      sectionIndex,
      item,
    })),
  );
}

function serverObjectiveAnswersForItem(runtime: ExamRuntimeContract, item: ExamSectionItem | null): Record<string, ObjectiveAnswerValue> {
  if (!item?.questions?.length) {
    return {};
  }
  const answers: Record<string, ObjectiveAnswerValue> = {};
  for (const question of item.questions) {
    if (typeof runtime.responses.objective_answers[question.answer_id] !== "undefined") {
      answers[question.answer_id] = runtime.responses.objective_answers[question.answer_id];
    }
  }
  return answers;
}

function objectiveItemAnswered(runtime: ExamRuntimeContract, item: ExamSectionItem | null): boolean {
  if (!item?.questions?.length) {
    return false;
  }
  return item.questions.every((question) => typeof runtime.responses.objective_answers[question.answer_id] !== "undefined");
}

function writingItemAnswered(runtime: ExamRuntimeContract, item: ExamSectionItem | null): boolean {
  if (!item) {
    return false;
  }
  return typeof runtime.responses.writing_answers[item.item_id] === "string" && runtime.responses.writing_answers[item.item_id].trim().length > 0;
}

function speakingItemAnswered(runtime: ExamRuntimeContract, item: ExamSectionItem | null): boolean {
  if (!item) {
    return false;
  }
  return typeof runtime.responses.audio_answers[item.item_id] === "string" && runtime.responses.audio_answers[item.item_id].trim().length > 0;
}

export function useExamRuntimeState({ runtime: inputRuntime, onRuntimeChange, onComplete }: Props) {
  const recorder = useRecorder();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [objectiveDrafts, setObjectiveDrafts] = useState<Record<string, ObjectiveAnswerValue>>({});
  const [writingDraft, setWritingDraft] = useState("");

  const runtimeState = useMemo(() => {
    if (!inputRuntime) {
      return { runtime: null as ExamRuntimeContract | null, validationError: null as string | null };
    }
    try {
      return {
        runtime: validateRuntimeContract(inputRuntime),
        validationError: null,
      };
    } catch (runtimeError) {
      return {
        runtime: null,
        validationError: runtimeError instanceof Error ? runtimeError.message : "Runtime contract violation.",
      };
    }
  }, [inputRuntime]);

  const runtime = runtimeState.runtime;
  const items = useMemo(() => (runtime ? flattenItems(runtime) : []), [runtime]);
  const currentEntry = items[currentIndex] || null;
  const currentItem = currentEntry?.item || null;

  useEffect(() => {
    if (!runtime) {
      setCurrentIndex(0);
      setObjectiveDrafts({});
      setWritingDraft("");
      return;
    }

    const cache = findRuntimeCache(runtime.session_id);
    const cachedIndex = cache ? items.findIndex((entry) => entry.item.item_id === cache.current_item_id) : -1;
    setCurrentIndex(cachedIndex >= 0 ? cachedIndex : 0);
    setError(null);
  }, [items, runtime]);

  useEffect(() => {
    if (!runtime || !currentItem) {
      setObjectiveDrafts({});
      setWritingDraft("");
      return;
    }
    setObjectiveDrafts(serverObjectiveAnswersForItem(runtime, currentItem));
    setWritingDraft(runtime.responses.writing_answers[currentItem.item_id] || "");
    recorder.resetRecording();
  }, [currentItem?.item_id, runtime]);

  useEffect(() => {
    if (!runtime || !currentItem) {
      return;
    }
    saveYkiCache({
      schema_version: "4",
      exam_session_id: runtime.session_id,
      level_band: isLevelBand(runtime.level) ? runtime.level : "B1_B2",
      runtime_contract_version: runtime.runtime_schema_version,
      current_item_id: currentItem.item_id,
      saved_at: new Date().toISOString(),
    });
  }, [currentItem, runtime]);

  const displayedObjectiveAnswers = useMemo(() => {
    if (!runtime || !currentItem?.questions?.length) {
      return {};
    }
    return {
      ...serverObjectiveAnswersForItem(runtime, currentItem),
      ...objectiveDrafts,
    };
  }, [currentItem, objectiveDrafts, runtime]);

  function selectAnswer(questionId: string, value: string) {
    setObjectiveDrafts((prev) => ({ ...prev, [questionId]: value }));
    setError(null);
  }

  function updateWritingAnswer(value: string) {
    setWritingDraft(value);
    setError(null);
  }

  async function syncRuntime(): Promise<ExamRuntimeContract> {
    if (!runtime) {
      throw new Error("Runtime is not available.");
    }
    const response = await fetchYkiSession(runtime.session_id);
    if (!response.ok) {
      throw new Error(response.error.message);
    }
    const nextRuntime = validateRuntimeContract(response.data.runtime);
    onRuntimeChange(nextRuntime);
    return nextRuntime;
  }

  async function persistObjectiveItem(activeRuntime: ExamRuntimeContract, item: ExamSectionItem): Promise<ExamRuntimeContract> {
    const questions = item.questions || [];
    for (const question of questions) {
      const answer = displayedObjectiveAnswers[question.answer_id];
      if (typeof answer === "undefined") {
        throw new Error("Answer all questions before continuing.");
      }
      if (activeRuntime.responses.objective_answers[question.answer_id] === answer) {
        continue;
      }
      const response = await submitYkiAnswer(activeRuntime.session_id, {
        item_id: item.item_id,
        question_id: question.answer_id,
        answer,
      });
      if (!response.ok) {
        throw new Error(response.error.message);
      }
    }
    return syncRuntime();
  }

  async function persistWritingItem(activeRuntime: ExamRuntimeContract, item: ExamSectionItem): Promise<ExamRuntimeContract> {
    const text = writingDraft.trim();
    if (!text) {
      throw new Error("Write a response before continuing.");
    }
    if (activeRuntime.responses.writing_answers[item.item_id] === text) {
      return activeRuntime;
    }
    const response = await submitYkiWriting(activeRuntime.session_id, {
      task_id: item.item_id,
      text,
    });
    if (!response.ok) {
      throw new Error(response.error.message);
    }
    return syncRuntime();
  }

  async function submitSpeakingRecording(): Promise<void> {
    if (!runtime || !currentEntry || !currentItem || currentEntry.sectionType !== "speaking") {
      return;
    }
    if (speakingItemAnswered(runtime, currentItem)) {
      return;
    }
    if (!currentItem.recording) {
      throw new Error("Speaking item is missing recording limits.");
    }
    if (!recorder.audioBlob || !recorder.durationMs) {
      throw new Error("Record your answer before submitting.");
    }

    const durationSec = recorder.durationMs / 1000;
    if (durationSec < currentItem.recording.min_duration_sec) {
      throw new Error(`Recording must be at least ${currentItem.recording.min_duration_sec} seconds.`);
    }
    if (durationSec > currentItem.recording.max_duration_sec) {
      throw new Error(`Recording must stay under ${currentItem.recording.max_duration_sec} seconds.`);
    }

    const upload = await uploadVoiceTranscription({
      blob: recorder.audioBlob,
      fileName: "yki-speaking.webm",
      mimeType: recorder.audioBlob.type || "audio/webm",
      durationMs: recorder.durationMs,
      sessionId: runtime.session_id,
      speakingSessionId: null,
      turnId: null,
      taskId: currentItem.item_id,
      mode: "yki_exam",
      locale: "fi-FI",
    });
    if (!upload.ok) {
      throw new Error(upload.error.message);
    }
    const audioRef = upload.data?.audio_ref;
    if (typeof audioRef !== "string" || audioRef.trim().length === 0) {
      throw new Error("Voice upload did not return an audio reference.");
    }

    const response = await submitYkiSpeaking(runtime.session_id, {
      item_id: currentItem.item_id,
      audio_ref: audioRef,
      duration_sec: durationSec,
    });
    if (!response.ok) {
      throw new Error(response.error.message);
    }

    await syncRuntime();
    recorder.resetRecording();
  }

  async function persistCurrentItem(): Promise<ExamRuntimeContract> {
    if (!runtime || !currentEntry || !currentItem) {
      throw new Error("Runtime item is not available.");
    }

    if (currentEntry.sectionType === "reading" || currentEntry.sectionType === "listening") {
      const nextRuntime = await persistObjectiveItem(runtime, currentItem);
      if (!objectiveItemAnswered(nextRuntime, currentItem)) {
        throw new Error("The server did not confirm the submitted answers.");
      }
      return nextRuntime;
    }

    if (currentEntry.sectionType === "writing") {
      const nextRuntime = await persistWritingItem(runtime, currentItem);
      if (!writingItemAnswered(nextRuntime, currentItem)) {
        throw new Error("The server did not confirm the submitted writing response.");
      }
      return nextRuntime;
    }

    if (!speakingItemAnswered(runtime, currentItem)) {
      throw new Error("Submit the speaking recording before continuing.");
    }

    return runtime;
  }

  async function goNext(): Promise<void> {
    if (!runtime) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await persistCurrentItem();
      if (currentIndex >= items.length - 1) {
        const response = await submitYkiExam(runtime.session_id, { confirm_incomplete: false });
        if (!response.ok) {
          throw new Error(response.error.message);
        }
        onComplete();
        return;
      }
      setCurrentIndex((value) => Math.min(value + 1, items.length - 1));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to continue.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCurrentSpeaking(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await submitSpeakingRecording();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit the speaking recording.");
    } finally {
      setBusy(false);
    }
  }

  function goPrevious() {
    setCurrentIndex((value) => Math.max(value - 1, 0));
    setError(null);
  }

  return {
    runtime,
    validationError: runtimeState.validationError,
    items,
    currentEntry,
    currentItem,
    currentIndex,
    busy,
    error,
    objectiveAnswers: displayedObjectiveAnswers,
    writingAnswer: writingDraft,
    serverAnsweredCount: runtime?.progress.answered || 0,
    selectAnswer,
    updateWritingAnswer,
    goNext,
    goPrevious,
    canGoPrevious: currentIndex > 0,
    canGoNext: currentIndex < items.length - 1,
    recorderState: recorder.state,
    recorderAudioUrl: recorder.audioUrl,
    recorderDurationMs: recorder.durationMs,
    recorderError: recorder.error,
    startRecording: recorder.startRecording,
    stopRecording: recorder.stopRecording,
    resetRecording: recorder.resetRecording,
    submitCurrentSpeaking,
    speakingSubmitted: Boolean(runtime && currentItem && speakingItemAnswered(runtime, currentItem)),
  };
}
