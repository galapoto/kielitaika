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
      <View style={styles.glow} />
      <View
        style={[
          styles.button,
          isRecording && styles.recording,
        ]}
      >
        <Ionicons
          name={isRecording ? "mic" : "mic-outline"}
          size={22}
          color="#f8fafc"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
  },
  glow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    shadowColor: "#0b1220",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.35)",
  },
  recording: {
    backgroundColor: "#0b1220",
    borderColor: "rgba(148, 163, 184, 0.65)",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
