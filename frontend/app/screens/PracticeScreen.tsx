// PracticeScreen - Practice mode screen
import { View, Text, StyleSheet } from "react-native";
import SceneBackground from "../components/background/SceneBackground";

export default function PracticeScreen() {
  return (
    <SceneBackground>
      <View style={styles.container}>
        <Text style={styles.text}>Practice coming soon...</Text>
      </View>
    </SceneBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#f1f5f9",
    fontSize: 18,
  },
});
