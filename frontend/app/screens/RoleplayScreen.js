// frontend/app/screens/RoleplayScreen.js
import React, { useEffect } from "react";
import { View } from "react-native";
import { useSpeakingSession } from "../context/SpeakingSessionContext";
import useVoiceStreaming from "../hooks/useVoiceStreaming";
import TranscriptionViewer from "../components/TranscriptionViewer";
import MicButton from "../components/MicButton";
import { speak } from "../services/tts";
import { startRoleplaySession } from "../utils/api";

const MAX_TURNS = 5;

export default function RoleplayScreen({ route }) {
  const {
    activeTurnIndex,
    setActiveTurnIndex,
    setAiTranscript,
    setUserTranscript,
    completeSession,
    status,
  } = useSpeakingSession();

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

  return (
    <View>
      <TranscriptionViewer />
      <MicButton
        onPress={handleMicPress}
        disabled={status !== "live"}
      />
    </View>
  );
}
