// frontend/app/screens/RoleplayScreen.js
import React, { useEffect } from "react";
import { View } from "react-native";
import { useSpeakingSession } from "../context/SpeakingSessionContext";
import useVoiceStreaming from "../hooks/useVoiceStreaming";
import TranscriptionViewer from "../components/TranscriptionViewer";
import MicButton from "../components/MicButton";
import { speak } from "../services/tts";

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
    const aiText = route.params?.prompt;
    if (aiText) {
      setAiTranscript(0, aiText);
      speak(aiText);
    }
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

