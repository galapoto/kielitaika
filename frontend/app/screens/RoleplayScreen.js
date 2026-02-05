// frontend/app/screens/RoleplayScreen.js

import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

import {
  initSpeakingSession,
  startSpeakingSession,
  advanceSpeakingTurn,
  setSpeakingTurnAiTranscript,
  setSpeakingTurnUserTranscript,
  completeSpeakingSession,
  getSpeakingSession,
} from "../utils/speakingAttempts";

import { speak, forceStopSpeaking } from "../services/tts";
import { useVoiceStreaming } from "../hooks/useVoiceStreaming";
import MicButton from "../components/MicButton";

import { fetchRoleplayDialogue, evaluateRoleplay } from "../services/workplace";

const MAX_TURNS = 5;

export default function RoleplayScreen() {
  const route = useRoute();
  const { field, scenarioTitle, level } = route.params;

  const sessionIdRef = useRef(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const [aiText, setAiText] = useState("");
  const [phase, setPhase] = useState("INIT"); 
  // INIT → AI_SPEAKING → USER_READY → USER_RECORDING → USER_PROCESSING → COMPLETED

  const {
    startRecording,
    stopRecording,
    isRecording,
    isProcessing,
  } = useVoiceStreaming();

  /**
   * INIT SESSION (ONCE)
   */
  useEffect(() => {
    const sessionId = `roleplay:${field}:${scenarioTitle}:${Date.now()}`;
    sessionIdRef.current = sessionId;

    initSpeakingSession(sessionId, {
      maxTurns: MAX_TURNS,
      autoStart: false,
    });

    startSpeakingSession(sessionId);

    if (__DEV__) {
      console.log("[ROLEPLAY] Session started:", sessionId);
    }

    return () => {
      forceStopSpeaking();
    };
  }, []);

  /**
   * FETCH INITIAL PROMPT
   */
  useEffect(() => {
    if (phase !== "INIT") return;

    (async () => {
      const scenario = await fetchRoleplayDialogue(field, scenarioTitle, level);
      const text =
        scenario?.roleplay_prompt ||
        "Kerro tilanteesta omin sanoin.";

      setSpeakingTurnAiTranscript(
        sessionIdRef.current,
        0,
        text
      );

      setAiText(text);
      setPhase("AI_SPEAKING");

      if (__DEV__) console.log("[ROLEPLAY] Initial AI turn");
    })();
  }, [phase]);

  /**
   * SPEAK AI TURN
   */
  useEffect(() => {
    if (phase !== "AI_SPEAKING") return;

    (async () => {
      await speak(aiText, "professional");
      setPhase("USER_READY");

      if (__DEV__) console.log("[ROLEPLAY] AI finished speaking");
    })();
  }, [phase, aiText]);

  /**
   * MIC TAP HANDLER
   */
  const handleMicPress = useCallback(async () => {
    if (phase === "USER_READY") {
      setPhase("USER_RECORDING");
      await startRecording();
      return;
    }

    if (phase === "USER_RECORDING") {
      setPhase("USER_PROCESSING");
      const transcript = await stopRecording();

      if (!transcript || !transcript.trim()) {
        setPhase("USER_READY");
        return;
      }

      const sessionId = sessionIdRef.current;

      setSpeakingTurnUserTranscript(
        sessionId,
        turnIndex,
        transcript
      );

      if (__DEV__) {
        console.log(`[ROLEPLAY] User transcript (turn ${turnIndex})`, transcript);
      }

      /**
       * FINAL TURN
       */
      if (turnIndex === MAX_TURNS - 1) {
        const closing =
          "Kiitos vastauksesta. Tämä oli viimeinen vuoro.";

        setSpeakingTurnAiTranscript(
          sessionId,
          turnIndex,
          closing,
          { isConclusive: true }
        );

        await evaluateRoleplay(field, transcript);
        completeSpeakingSession(sessionId);
        setAiText(closing);
        setPhase("COMPLETED");

        return;
      }

      /**
       * NEXT TURN
       */
      const nextTurn = turnIndex + 1;
      const followup = buildFollowupPrompt(nextTurn);

      setSpeakingTurnAiTranscript(
        sessionId,
        nextTurn,
        followup
      );

      advanceSpeakingTurn(sessionId);
      setTurnIndex(nextTurn);
      setAiText(followup);
      setPhase("AI_SPEAKING");
    }
  }, [phase, turnIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.aiText}>{aiText}</Text>

      {phase !== "COMPLETED" && (
        <MicButton
          isRecording={isRecording}
          isDisabled={isProcessing || phase === "AI_SPEAKING"}
          onPress={handleMicPress}
        />
      )}

      {phase === "COMPLETED" && (
        <Text style={styles.completed}>
          Harjoitus suoritettu 🎉
        </Text>
      )}
    </View>
  );
}

/**
 * HARD-CODED PROMPTS (DETERMINISTIC)
 */
function buildFollowupPrompt(turnIndex) {
  const prompts = [
    "",
    "Hyvä. Voitko tarkentaa yhden yksityiskohdan?",
    "Selvä. Miten toimisit seuraavaksi?",
    "Kiitos. Kerro vielä lyhyesti lopuksi tärkein asia.",
    "Kiitos vastauksesta. Tämä oli viimeinen vuoro.",
  ];
  return prompts[turnIndex] || prompts[prompts.length - 1];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    backgroundColor: "#0b1c2d",
  },
  aiText: {
    color: "white",
    fontSize: 18,
    lineHeight: 26,
  },
  completed: {
    color: "#7dd3fc",
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
  },
});

