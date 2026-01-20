// VoiceInputIndicator - Shows voice input level
import { View, Text, StyleSheet } from "react-native";
import { useRukaStore } from "../../state/useRukaStore";

export default function VoiceInputIndicator() {
  const amplitude = useRukaStore((s) => s.amplitude);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Voice level: {Math.round(amplitude * 100)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 8,
  },
  text: {
    color: "#f1f5f9",
    fontSize: 14,
  },
});
