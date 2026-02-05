// frontend/app/components/MicButton.js

import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MicButton({
  onPress,
  isRecording = false,
  isDisabled = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={
        isRecording ? "Stop recording" : "Start recording"
      }
      style={({ pressed }) => [
        styles.wrapper,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.button,
          isRecording && styles.recording,
        ]}
      >
        <Ionicons
          name={isRecording ? "mic" : "mic-outline"}
          size={32}
          color="white"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginBottom: 32,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  recording: {
    backgroundColor: "#dc2626",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.4,
  },
});

