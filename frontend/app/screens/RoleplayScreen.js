// frontend/app/screens/RoleplayScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSpeakingSession } from "../context/SpeakingSessionContext";
import useVoiceStreaming from "../hooks/useVoiceStreaming";
import MicButton from "../components/MicButton";
import { speak } from "../services/tts";
import { startRoleplaySession } from "../utils/api";

const MAX_TURNS = 5;

export default function RoleplayScreen({ route }) {
  const {
    turns,
    activeTurnIndex,
    setActiveTurnIndex,
    setAiTranscript,
    setUserTranscript,
    completeSession,
    status,
  } = useSpeakingSession();

  const [viewIndex, setViewIndex] = useState(null);

  const { start, stop } = useVoiceStreaming({
    onPartialTranscript: (text) => {
      if (status !== "live") return;
      setUserTranscript(activeTurnIndex, text, { isFinal: false });
    },
    onFinalTranscript: (text) => {
      if (status !== "live") return;

      setUserTranscript(activeTurnIndex, text, { isFinal: true });

      const isFinalTurn = activeTurnIndex === MAX_TURNS - 1;

      if (isFinalTurn) {
        completeSession();
      } else {
        const nextTurn = activeTurnIndex + 1;
        setActiveTurnIndex(nextTurn);

        const followup = route.params?.followups?.[nextTurn];
        if (followup) {
          setAiTranscript(nextTurn, followup);
          speak(followup);
        }
      }
    },
  });

  useEffect(() => {
    const field = route?.params?.field || route?.params?.role_or_field;
    const scenarioTitle = route?.params?.scenario_identifier || route?.params?.scenarioTitle;
    const level = route?.params?.difficulty_optional || route?.params?.level;
    if (!field) {
      console.error("ROLEPLAY: missing field param");
      return;
    }
    (async () => {
      const res = await startRoleplaySession({ field, scenarioTitle, level });
      const turnIndex = typeof res?.turnIndex === "number" ? res.turnIndex - 1 : 0;
      const aiText = res?.aiText;
      if (aiText) {
        setAiTranscript(turnIndex, aiText);
        speak(aiText);
      }
    })();
  }, []);

  const handleMicPress = async () => {
    if (status !== "live") return;
    await start();
  };

  useEffect(() => {
    if (turns.length && viewIndex === null) {
      const maxIndex = Math.max(...turns.map((t) => t.turnIndex));
      setViewIndex(maxIndex);
    }
  }, [turns, viewIndex]);

  const effectiveIndex = typeof viewIndex === "number" ? viewIndex : activeTurnIndex;
  const aiTurn = useMemo(
    () => turns.find((t) => t.turnIndex === effectiveIndex && t.speaker === "ai"),
    [turns, effectiveIndex]
  );
  const userTurn = useMemo(
    () => turns.find((t) => t.turnIndex === effectiveIndex && t.speaker === "user"),
    [turns, effectiveIndex]
  );

  const canGoPrev = turns.some((t) => t.turnIndex === effectiveIndex - 1);
  const canGoNext = turns.some((t) => t.turnIndex === effectiveIndex + 1);

  const contextTitle = route?.params?.scenarioTitle || route?.params?.scenario_identifier || route?.params?.field || route?.params?.role_or_field;
  const contextLevel = route?.params?.level || route?.params?.difficulty_optional;

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.contextBlock}>
          {contextTitle ? (
            <Text style={styles.contextTitle}>{contextTitle}</Text>
          ) : null}
          {contextLevel ? (
            <Text style={styles.contextMeta}>{contextLevel}</Text>
          ) : null}
        </View>

        <View style={styles.transcriptCard}>
          <Text style={styles.transcriptLabel}>AI</Text>
          <Text style={styles.transcriptText}>
            {aiTurn?.text || ""}
          </Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.transcriptCard}>
          <Text style={styles.transcriptLabel}>User</Text>
          <Text style={styles.transcriptText}>
            {userTurn?.text || ""}
          </Text>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navButton, !canGoPrev && styles.navButtonDisabled]}
            onPress={() => canGoPrev && setViewIndex(effectiveIndex - 1)}
            disabled={!canGoPrev}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
            onPress={() => canGoNext && setViewIndex(effectiveIndex + 1)}
            disabled={!canGoNext}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.micDock}>
        <MicButton
          onPress={handleMicPress}
          disabled={status !== "live"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 28,
  },
  topSection: {
    flex: 1,
    justifyContent: "flex-start",
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 80,
  },
  contextBlock: {
    marginBottom: 18,
  },
  contextTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "600",
  },
  contextMeta: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 4,
  },
  transcriptCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    minHeight: 110,
  },
  transcriptLabel: {
    color: "#cbd5f5",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  transcriptText: {
    color: "#f8fafc",
    fontSize: 16,
    lineHeight: 22,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  navButton: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
  },
  micDock: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
