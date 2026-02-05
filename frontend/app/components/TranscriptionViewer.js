// frontend/app/components/TranscriptionViewer.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSpeakingSession } from "../context/SpeakingSessionContext";
import TranscriptTurnView from "./TranscriptTurnView";

export default function TranscriptionViewer() {
  const { turns } = useSpeakingSession();
  const [viewIndex, setViewIndex] = useState(null);

  useEffect(() => {
    if (turns.length && viewIndex === null) {
      setViewIndex(turns.length - 1);
    }
  }, [turns]);

  if (!turns.length || viewIndex === null) return null;

  const canGoPrev = viewIndex > 0;
  const canGoNext = viewIndex < turns.length - 1;

  return (
    <View>
      <TranscriptTurnView turn={turns[viewIndex]} />

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {canGoPrev && (
          <TouchableOpacity onPress={() => setViewIndex(viewIndex - 1)}>
            <Text>Previous</Text>
          </TouchableOpacity>
        )}

        {canGoNext && (
          <TouchableOpacity onPress={() => setViewIndex(viewIndex + 1)}>
            <Text>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

