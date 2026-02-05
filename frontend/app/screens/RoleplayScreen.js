// frontend/app/screens/RoleplayScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useSpeakingSession } from "../context/SpeakingSessionContext";
import useVoiceStreaming from "../hooks/useVoiceStreaming";
import MicButton from "../components/MicButton";
import { speak } from "../services/tts";
import { startRoleplaySession } from "../utils/api";

const MAX_TURNS = 5;

function applyUserTurnAndAdvance({
  text,
  activeTurnIndex,
  setUserTranscript,
  setActiveTurnIndex,
  setAiTranscript,
  completeSession,
  followups,
  speak,
}) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return;
  setUserTranscript(activeTurnIndex, trimmed, { isFinal: true });

  const isFinalTurn = activeTurnIndex === MAX_TURNS - 1;
  if (isFinalTurn) {
    completeSession();
  } else {
    const nextTurn = activeTurnIndex + 1;
    setActiveTurnIndex(nextTurn);
    const followup = followups?.[nextTurn];
    if (followup) {
      setAiTranscript(nextTurn, followup);
      speak(followup);
    }
  }
}

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
  const [inputText, setInputText] = useState("");

  const { start } = useVoiceStreaming({
    onPartialTranscript: (text) => {
      if (status !== "live") return;
      setUserTranscript(activeTurnIndex, text, { isFinal: false });
    },
    onFinalTranscript: (text) => {
      if (status !== "live") return;
      applyUserTurnAndAdvance({
        text,
        activeTurnIndex,
        setUserTranscript,
        setActiveTurnIndex,
        setAiTranscript,
        completeSession,
        followups: route.params?.followups,
        speak,
      });
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

  const handleSendText = () => {
    if (status !== "live") return;
    applyUserTurnAndAdvance({
      text: inputText,
      activeTurnIndex,
      setUserTranscript,
      setActiveTurnIndex,
      setAiTranscript,
      completeSession,
      followups: route.params?.followups,
      speak,
    });
    setInputText("");
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

  const scenarioInstruction = route?.params?.scenarioTitle || route?.params?.scenario_identifier || route?.params?.field || route?.params?.role_or_field;
  const scenarioMeta = route?.params?.level || route?.params?.difficulty_optional;

  const aiMessageText = aiTurn?.text;
  const showAiFallback = aiMessageText === undefined || aiMessageText === null || aiMessageText === "";

  return (
    <View style={styles.container}>
      {/* 1. Scenario instruction (top) */}
      <View style={styles.scenarioBlock}>
        {scenarioInstruction ? (
          <Text style={styles.scenarioInstruction}>{scenarioInstruction}</Text>
        ) : (
          <Text style={styles.scenarioInstruction}>Roleplay</Text>
        )}
        {scenarioMeta ? (
          <Text style={styles.scenarioMeta}>{scenarioMeta}</Text>
        ) : null}
      </View>

      {/* 2. Conversation area (middle) */}
      <ScrollView
        style={styles.conversationScroll}
        contentContainerStyle={styles.conversationContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.conversationBubble}>
          <Text style={styles.conversationLabel}>AI</Text>
          <Text style={styles.conversationText}>
            {showAiFallback ? "…" : aiMessageText}
          </Text>
        </View>
        <View style={styles.conversationBubble}>
          <Text style={styles.conversationLabel}>User</Text>
          <Text style={styles.conversationText}>
            {userTurn?.text || " "}
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
      </ScrollView>

      {/* 3. Text field for writing and sending message */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask me anything..."
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          editable={status === "live"}
          multiline={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || status !== "live") && styles.sendButtonDisabled]}
          onPress={handleSendText}
          disabled={!inputText.trim() || status !== "live"}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Microphone anchored at bottom, visually large */}
      <View style={styles.micDock}>
        <View style={styles.micWrapper}>
          <MicButton
            onPress={handleMicPress}
            isDisabled={status !== "live"}
          />
        </View>
        <Text style={styles.micLabel}>{status === "live" ? "Tap to speak" : "—"}</Text>
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
    paddingBottom: 24,
  },
  scenarioBlock: {
    marginBottom: 16,
  },
  scenarioInstruction: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 28,
  },
  scenarioMeta: {
    color: "#94a3b8",
    fontSize: 16,
    marginTop: 6,
  },
  conversationScroll: {
    flex: 1,
  },
  conversationContent: {
    paddingBottom: 16,
  },
  conversationBubble: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    minHeight: 88,
  },
  conversationLabel: {
    color: "#cbd5f5",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  conversationText: {
    color: "#f8fafc",
    fontSize: 18,
    lineHeight: 26,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.25)",
  },
  textInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
  },
  micDock: {
    alignItems: "center",
    paddingBottom: 8,
  },
  micWrapper: {
    transform: [{ scale: 1.35 }],
  },
  micLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 8,
  },
});
