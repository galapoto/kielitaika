import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import Center from "@ui/components/layout/Center";
import Button from "@ui/components/primitives/Button";
import Text from "@ui/components/primitives/Text";
import { colors, radius, spacing } from "@ui/theme/tokens";

import useYki from "./hooks/useYki";
import type {
  YkiCertificate,
  YkiLearningFeedback,
  YkiProgressHistory,
  YkiResumeData,
  YkiRuntime,
  YkiSectionProgress,
  YkiTask,
  YkiTaskEvaluation,
} from "./services/ykiService";

const DEVELOPMENT_INJECTOR_LABEL = [
  "Inject",
  "Audio",
  "(Dev",
  "Only)",
].join(" ");

export default function YkiFeature() {
  const router = useRouter();
  const {
    data,
    certificate,
    runtime,
    progressHistory,
    loading,
    recording,
    recordedUri,
    error,
    notice,
    currentTask,
    speakingTaskAnswered,
    remainingSeconds,
    isNearExpiry,
    examLocked,
    recordingSeconds,
    listeningPlaysRemaining,
    speakingMaxRecordingSeconds,
    startNewSession,
    startExam,
    startRecording,
    stopRecording,
    submitRecordedAudio,
    injectDevelopmentAudio,
    playListeningPrompt,
    refreshSession,
  } = useYki();

  if (loading) {
    return (
      <Center>
        <Text>Loading...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center>
        <Text>Error</Text>
        <Text>{error.message}</Text>
        <Button label="Retry" onPress={refreshSession} />
        <Button label="Open Learning" onPress={() => router.push("/learning")} />
      </Center>
    );
  }

  if (!data) {
    return (
      <Center>
        <Text size="lg">No active session</Text>
        {notice ? <Text>{notice}</Text> : null}
        <Button label="Start New Session" onPress={startNewSession} />
        <Button label="Open Learning" onPress={() => router.push("/learning")} />
      </Center>
    );
  }

  if (certificate) {
    const validation = validateCertificate(certificate);

    if (!validation.valid) {
      return (
        <Center>
          <Text size="lg">Results unavailable</Text>
          <Text>Certificate data is missing or corrupted.</Text>
          <Button label="Refresh Session" onPress={refreshSession} />
          <Button label="Start New Session" onPress={startNewSession} />
        </Center>
      );
    }

    return (
      <ResultsView
        data={data}
        certificate={certificate}
        progressHistory={progressHistory}
        notice={notice}
        refreshSession={refreshSession}
        startNewSession={startNewSession}
      />
    );
  }

  return (
    <View style={styles.featureRoot}>
      <Button label="Open Learning" onPress={() => router.push("/learning")} />
      <TimerCard
        remainingSeconds={remainingSeconds}
        isNearExpiry={isNearExpiry}
        examLocked={examLocked}
      />

      <ExamConditionsCard
        runtime={runtime}
        currentSection={data.currentSection}
      />

      {notice ? (
        <View style={styles.card}>
          <Text>{notice}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text size="lg">{data.sessionId}</Text>
        <Text>Current Section: {data.currentSection ?? "Not started"}</Text>
        <Text>Current Task: {data.currentTaskId ?? "No task selected"}</Text>
        <Text>Exam Expires: {data.timing.expiresAt}</Text>
        <Text>
          Task Index: {getTaskIndex(data.sectionProgress, data.currentSection)}
        </Text>
        {currentTask ? <Text>Task Status: {currentTask.status}</Text> : null}
      </View>

      {!data.currentSection ? <Button label="Start Exam" onPress={startExam} /> : null}

      {data.currentSection === "listening" ? (
        <ListeningControls
          currentTask={currentTask}
          listeningPlaysRemaining={listeningPlaysRemaining}
          examLocked={examLocked}
          playListeningPrompt={playListeningPrompt}
        />
      ) : null}

      {data.currentSection === "writing" ? (
        <WritingConstraints runtime={runtime} />
      ) : null}

      {data.currentSection === "speaking" ? (
        <SpeakingControls
          recording={recording}
          recordedUri={recordedUri}
          speakingTaskAnswered={speakingTaskAnswered}
          feedback={currentTask?.evaluation?.feedback ?? null}
          examLocked={examLocked}
          recordingSeconds={recordingSeconds}
          maxRecordingSeconds={speakingMaxRecordingSeconds}
          startRecording={startRecording}
          stopRecording={stopRecording}
          submitRecordedAudio={submitRecordedAudio}
          injectDevelopmentAudio={injectDevelopmentAudio}
        />
      ) : null}

      {data.currentSection ? (
        <Button label="Refresh Session" onPress={refreshSession} />
      ) : null}
    </View>
  );
}

type SpeakingControlsProps = {
  recording: boolean;
  recordedUri: string | null;
  speakingTaskAnswered: boolean;
  feedback: string | null;
  examLocked: boolean;
  recordingSeconds: number;
  maxRecordingSeconds: number;
  startRecording: () => void;
  stopRecording: () => void;
  submitRecordedAudio: () => void;
  injectDevelopmentAudio: () => void;
};

function SpeakingControls({
  recording,
  recordedUri,
  speakingTaskAnswered,
  feedback,
  examLocked,
  recordingSeconds,
  maxRecordingSeconds,
  startRecording,
  stopRecording,
  submitRecordedAudio,
  injectDevelopmentAudio,
}: SpeakingControlsProps) {
  if (speakingTaskAnswered) {
    return (
      <Center>
        <Text>Answer submitted</Text>
        <Text>{feedback ?? "Audio received"}</Text>
      </Center>
    );
  }

  if (recording) {
    return (
      <View style={styles.card}>
        <Text>Recording...</Text>
        <Text>
          Speaking Timer: {formatDuration(recordingSeconds)} /{" "}
          {formatDuration(maxRecordingSeconds)}
        </Text>
        <Button label="Stop Recording" onPress={stopRecording} />
      </View>
    );
  }

  if (recordedUri) {
    return (
      <View style={styles.card}>
        <Text>Audio ready</Text>
        <Text>{recordedUri}</Text>
        {!examLocked ? (
          <Button label="Submit Audio" onPress={submitRecordedAudio} />
        ) : (
          <Text>Time expired. Recording will be submitted automatically if possible.</Text>
        )}
        <DevelopmentAudioInjector injectDevelopmentAudio={injectDevelopmentAudio} />
      </View>
    );
  }

  if (examLocked) {
    return (
      <View style={styles.card}>
        <Text>Time expired. This speaking section is locked.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text>
        Speaking Timer: {formatDuration(recordingSeconds)} /{" "}
        {formatDuration(maxRecordingSeconds)}
      </Text>
      <Button label="Start Recording" onPress={startRecording} />
      <DevelopmentAudioInjector injectDevelopmentAudio={injectDevelopmentAudio} />
    </View>
  );
}

type TimerCardProps = {
  remainingSeconds: number | null;
  isNearExpiry: boolean;
  examLocked: boolean;
};

function TimerCard({
  remainingSeconds,
  isNearExpiry,
  examLocked,
}: TimerCardProps) {
  const displaySeconds = remainingSeconds ?? 0;
  const progressWidth =
    remainingSeconds === null
      ? ("100%" as const)
      : (`${Math.max(0, Math.min(100, (displaySeconds / 7200) * 100))}%` as const);

  return (
    <View style={styles.card}>
      <Text size="lg">Exam Timer</Text>
      <Text>
        {examLocked
          ? "Time expired"
          : `Time Remaining: ${formatDuration(displaySeconds)}`}
      </Text>
      <View style={styles.scoreTrack}>
        <View
          style={[
            styles.scoreFill,
            isNearExpiry || examLocked ? styles.urgentFill : null,
            { width: progressWidth },
          ]}
        />
      </View>
    </View>
  );
}

type ExamConditionsCardProps = {
  runtime: YkiRuntime | null;
  currentSection: string | null;
};

function ExamConditionsCard({
  runtime,
  currentSection,
}: ExamConditionsCardProps) {
  return (
    <View style={styles.card}>
      <Text size="lg">Exam Conditions</Text>
      <Text>Back navigation disabled.</Text>
      <Text>Sections are locked and move forward only.</Text>
      {currentSection === "listening" ? (
        <Text>
          Listening prompts are limited to{" "}
          {runtime?.listening.playbackLimit ?? 1} play.
        </Text>
      ) : null}
      {currentSection === "writing" ? (
        <Text>
          Writing target: minimum {runtime?.writing.minimumWords ?? 80} words,
          guidance up to {runtime?.writing.recommendedMaxWords ?? 180} words.
        </Text>
      ) : null}
      {currentSection === "speaking" ? (
        <Text>
          Speaking limit: {runtime?.speaking.maxRecordingSeconds ?? 30} seconds.
        </Text>
      ) : null}
    </View>
  );
}

type ListeningControlsProps = {
  currentTask: YkiTask | null;
  listeningPlaysRemaining: number | null;
  examLocked: boolean;
  playListeningPrompt: () => void;
};

function ListeningControls({
  currentTask,
  listeningPlaysRemaining,
  examLocked,
  playListeningPrompt,
}: ListeningControlsProps) {
  return (
    <View style={styles.card}>
      <Text size="lg">Listening Strictness</Text>
      <Text>
        Prompt plays used: {currentTask?.playbackCount ?? 0} /{" "}
        {currentTask?.playbackLimit ?? 1}
      </Text>
      {examLocked ? (
        <Text>Time expired. Listening prompt is locked.</Text>
      ) : listeningPlaysRemaining && listeningPlaysRemaining > 0 ? (
        <Button label="Play Listening Prompt" onPress={playListeningPrompt} />
      ) : (
        <Text>Replay unavailable.</Text>
      )}
    </View>
  );
}

type WritingConstraintsProps = {
  runtime: YkiRuntime | null;
};

function WritingConstraints({ runtime }: WritingConstraintsProps) {
  return (
    <View style={styles.card}>
      <Text size="lg">Writing Constraints</Text>
      <Text>Minimum length: {runtime?.writing.minimumWords ?? 80} words.</Text>
      <Text>
        Recommended maximum: {runtime?.writing.recommendedMaxWords ?? 180} words.
      </Text>
    </View>
  );
}

type ResultsViewProps = {
  data: YkiResumeData;
  certificate: YkiCertificate;
  progressHistory: YkiProgressHistory | null;
  notice: string | null;
  refreshSession: () => void;
  startNewSession: () => void;
};

function ResultsView({
  data,
  certificate,
  progressHistory,
  notice,
  refreshSession,
  startNewSession,
}: ResultsViewProps) {
  return (
    <View style={styles.featureRoot}>
      <ScrollView
        style={styles.resultsScroll}
        contentContainerStyle={styles.resultsContent}
      >
        {notice ? <Text>{notice}</Text> : null}

        <View style={styles.card}>
          <Text size="lg">Overall Result</Text>
          <Text>Level: {certificate.level}</Text>
          <Text>Status: {certificate.passed ? "PASS" : "FAIL"}</Text>
          <Text>
            Score: {certificate.overall_score} / 5
          </Text>
        </View>

        <View style={styles.card}>
          <Text size="lg">Section Breakdown</Text>
          {RESULT_SECTION_ORDER.map((sectionName) => (
            <SectionScoreRow
              key={sectionName}
              label={formatSectionName(sectionName)}
              score={certificate.section_scores[sectionName]}
            />
          ))}
        </View>

        <View style={styles.card}>
          <Text size="lg">Evaluation Transparency</Text>
          <Text>
            Evaluation: {certificate.evaluation_mode ?? "Unavailable"}
          </Text>
          <Text>Session: {data.sessionId}</Text>
        </View>

        <View style={styles.card}>
          <Text size="lg">Task-Level Feedback</Text>
          {RESULT_SECTION_ORDER.map((sectionName) => (
            <TaskFeedbackSection
              key={sectionName}
              sectionName={sectionName}
              sectionProgress={data.sectionProgress[sectionName]}
            />
          ))}
        </View>

        <AdaptiveFeedbackCard
          learningFeedback={data.learning_feedback ?? null}
        />

        <ProgressHistoryCard progressHistory={progressHistory} />
      </ScrollView>

      <View style={styles.actions}>
        <Button label="Refresh Session" onPress={refreshSession} />
        <Button label="Start New Session" onPress={startNewSession} />
      </View>
    </View>
  );
}

type ProgressHistoryCardProps = {
  progressHistory: YkiProgressHistory | null;
};

function ProgressHistoryCard({
  progressHistory,
}: ProgressHistoryCardProps) {
  if (!isValidProgressHistory(progressHistory)) {
    return (
      <View style={styles.card}>
        <Text size="lg">Your Progress</Text>
        <Text>Progress history unavailable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text size="lg">Your Progress</Text>
      <Text>
        Past Scores: {progressHistory.progression.join(" -> ")}
      </Text>
      <Text>
        Current Level: {progressHistory.current_level ?? "Unavailable"}
      </Text>
      <Text>Trend: {capitalize(progressHistory.trend)}</Text>
      <Text>
        Recurring Weaknesses:{" "}
        {formatPatternList(progressHistory.weak_patterns)}
      </Text>
      <Text>
        Strongest Sections: {formatPatternList(progressHistory.strong_patterns)}
      </Text>
      {progressHistory.sessions.slice(-3).map((session) => (
        <View key={session.session_id} style={styles.feedbackCard}>
          <Text>{session.date}</Text>
          <Text>
            Score: {session.overall_score} / 5
          </Text>
          <Text>Level: {session.level}</Text>
          <Text>Status: {session.passed ? "PASS" : "FAIL"}</Text>
        </View>
      ))}
    </View>
  );
}

type AdaptiveFeedbackCardProps = {
  learningFeedback: YkiLearningFeedback | null;
};

function AdaptiveFeedbackCard({
  learningFeedback,
}: AdaptiveFeedbackCardProps) {
  if (!isValidLearningFeedback(learningFeedback)) {
    return (
      <View style={styles.card}>
        <Text size="lg">How to Improve</Text>
        <Text>Adaptive guidance unavailable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text size="lg">How to Improve</Text>
      {learningFeedback.weak_areas.length ? (
        <View style={styles.feedbackSection}>
          <Text>Focus Areas</Text>
          {learningFeedback.weak_areas.map((area) => (
            <Text key={area}>{formatCriterionName(area)}</Text>
          ))}
        </View>
      ) : (
        <Text>No major weak areas identified.</Text>
      )}
      <View style={styles.feedbackSection}>
        <Text>Suggested Practice</Text>
        {learningFeedback.suggestions.map((suggestion) => (
          <Text key={suggestion}>{suggestion}</Text>
        ))}
      </View>
    </View>
  );
}

type SectionScoreRowProps = {
  label: string;
  score: number;
};

function SectionScoreRow({ label, score }: SectionScoreRowProps) {
  const clampedScore = clampScore(score);

  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreHeader}>
        <Text>{label}</Text>
        <Text>
          {clampedScore} / 5
        </Text>
      </View>
      <View style={styles.scoreTrack}>
        <View
          style={[
            styles.scoreFill,
            { width: `${(clampedScore / 5) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

type TaskFeedbackSectionProps = {
  sectionName: string;
  sectionProgress: YkiSectionProgress | undefined;
};

function TaskFeedbackSection({
  sectionName,
  sectionProgress,
}: TaskFeedbackSectionProps) {
  return (
    <View style={styles.feedbackSection}>
      <Text>{formatSectionName(sectionName)}</Text>
      {sectionProgress?.tasks?.length ? (
        sectionProgress.tasks.map((task) => (
          <TaskFeedbackCard key={task.id} task={task} />
        ))
      ) : (
        <Text>No task results available.</Text>
      )}
    </View>
  );
}

type TaskFeedbackCardProps = {
  task: YkiTask;
};

function TaskFeedbackCard({ task }: TaskFeedbackCardProps) {
  const evaluation = task.evaluation;

  if (!isValidTaskEvaluation(evaluation)) {
    return (
      <View style={styles.feedbackCard}>
        <Text>{task.id}</Text>
        <Text>Evaluation data unavailable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.feedbackCard}>
      <Text>{task.id}</Text>
      <Text>
        Score: {evaluation.score} / {evaluation.maxScore}
      </Text>
      {evaluation.criteria.map((criterion) => (
        <Text key={`${task.id}-${criterion.name}`}>
          {formatCriterionName(criterion.name)}: {criterion.score ?? "N/A"} / 5
        </Text>
      ))}
      <Text>{evaluation.feedback ?? "No feedback available."}</Text>
    </View>
  );
}

type DevelopmentAudioInjectorProps = {
  injectDevelopmentAudio: () => void;
};

function DevelopmentAudioInjector({
  injectDevelopmentAudio,
}: DevelopmentAudioInjectorProps) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Button
      label={DEVELOPMENT_INJECTOR_LABEL}
      onPress={injectDevelopmentAudio}
    />
  );
}

function getTaskIndex(
  sectionProgress: Record<string, { currentTaskIndex: number }>,
  sectionName: string | null,
) {
  if (!sectionName) {
    return 0;
  }

  const section = sectionProgress[sectionName];

  return section?.currentTaskIndex ?? 0;
}

const RESULT_SECTION_ORDER = ["reading", "listening", "writing", "speaking"];

function validateCertificate(certificate: YkiCertificate) {
  const hasValidScore =
    typeof certificate.overall_score === "number" &&
    certificate.overall_score >= 0 &&
    certificate.overall_score <= 5;
  const hasValidLevel = typeof certificate.level === "string" && certificate.level.length > 0;
  const hasValidPassed = typeof certificate.passed === "boolean";
  const hasValidSections = RESULT_SECTION_ORDER.every((sectionName) => {
    const score = certificate.section_scores?.[sectionName];

    return typeof score === "number" && score >= 0 && score <= 5;
  });

  return {
    valid:
      hasValidScore &&
      hasValidLevel &&
      hasValidPassed &&
      hasValidSections,
  };
}

function isValidTaskEvaluation(
  evaluation: YkiTaskEvaluation | null | undefined,
): evaluation is YkiTaskEvaluation {
  if (!evaluation) {
    return false;
  }

  if (
    typeof evaluation.score !== "number" ||
    typeof evaluation.maxScore !== "number" ||
    !Array.isArray(evaluation.criteria)
  ) {
    return false;
  }

  return evaluation.criteria.every(
    (criterion) =>
      typeof criterion.name === "string" &&
      (typeof criterion.score === "number" || criterion.score === null),
  );
}

function isValidLearningFeedback(
  learningFeedback: YkiLearningFeedback | null | undefined,
): learningFeedback is YkiLearningFeedback {
  if (!learningFeedback) {
    return false;
  }

  return (
    Array.isArray(learningFeedback.weak_areas) &&
    Array.isArray(learningFeedback.suggestions) &&
    learningFeedback.weak_areas.every((area) => typeof area === "string") &&
    learningFeedback.suggestions.every(
      (suggestion) => typeof suggestion === "string",
    )
  );
}

function isValidProgressHistory(
  progressHistory: YkiProgressHistory | null | undefined,
): progressHistory is YkiProgressHistory {
  if (!progressHistory) {
    return false;
  }

  return (
    Array.isArray(progressHistory.sessions) &&
    Array.isArray(progressHistory.progression) &&
    Array.isArray(progressHistory.weak_patterns) &&
    Array.isArray(progressHistory.strong_patterns) &&
    typeof progressHistory.trend === "string"
  );
}

function formatSectionName(sectionName: string) {
  return sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
}

function formatCriterionName(name: string) {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPatternList(items: string[]) {
  if (!items.length) {
    return "None";
  }

  return items.map(formatCriterionName).join(", ");
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clampScore(score: number) {
  return Math.max(0, Math.min(5, score));
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  featureRoot: {
    width: "100%",
    maxWidth: 920,
    gap: spacing.md,
    alignSelf: "center",
  },
  resultsScroll: {
    width: "100%",
    maxHeight: 520,
  },
  resultsContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    width: "100%",
  },
  scoreRow: {
    gap: spacing.xs,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreTrack: {
    height: 12,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  urgentFill: {
    backgroundColor: colors.error,
  },
  feedbackSection: {
    gap: spacing.sm,
  },
  feedbackCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
    width: "100%",
  },
});
