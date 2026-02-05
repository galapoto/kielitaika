// frontend/app/components/TranscriptTurnView.js
import React from "react";
import { View, Text } from "react-native";

export default function TranscriptTurnView({ turn }) {
  return (
    <View style={{ padding: 12 }}>
      <Text style={{ fontWeight: "600" }}>
        {turn.speaker === "ai" ? "AI" : "You"}
      </Text>
      <Text style={{ opacity: turn.isFinal ? 1 : 0.7 }}>
        {turn.text}
      </Text>
    </View>
  );
}

