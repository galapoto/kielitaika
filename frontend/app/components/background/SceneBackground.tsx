// SceneBackground - Base layer for all Ruka scenes with Skia aurora
import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import AuroraLayer from "./AuroraLayer";

// Use existing background images
const defaultBackground = require("../../../assets/backgrounds/revontuli.png");

interface SceneBackgroundProps {
  children: React.ReactNode;
  source?: any;
  sceneKey?: "aurora" | "forest" | "lapland";
}

export default function SceneBackground({ children, source, sceneKey = "aurora" }: SceneBackgroundProps) {
  // Select background based on sceneKey
  let backgroundSource = defaultBackground;
  if (sceneKey === "forest") {
    backgroundSource = require("../../../assets/backgrounds/metsä_talvi.png");
  } else if (sceneKey === "lapland") {
    backgroundSource = require("../../../assets/backgrounds/snow_pile.png");
  }

  return (
    <ImageBackground
      source={source || backgroundSource}
      style={styles.container}
      resizeMode="cover"
    >
      {sceneKey === "aurora" && <AuroraLayer />}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
  },
});
