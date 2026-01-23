// SceneBackground - Base layer for all Ruka scenes with advanced effects
import React, { useMemo } from "react";
import { View, StyleSheet, ImageBackground, Dimensions } from "react-native";
import AuroraLayer from "./AuroraLayer";
import AuroraRipple from "./layers/AuroraRipple";
import Snowfall from "./layers/Snowfall";
import FogBreath from "./layers/FogBreath";
import Starfield from "./layers/Starfield";
import FrostEdges from "./layers/FrostEdges";
import ShadowAnimals from "./layers/ShadowAnimals";
import BreathCondensation from "./layers/BreathCondensation";
import { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated";
import Animated from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Use existing background images
const defaultBackground = require("../../../assets/backgrounds/revontuli.png");

interface SceneBackgroundProps {
  children: React.ReactNode;
  source?: any;
  sceneKey?: "aurora" | "forest" | "lapland";
  orbEmotion?: "calm" | "confident" | "neutral" | "unsure" | "overloaded";
  aiSpeaking?: boolean;
  storyGrowth?: number; // 0-1 for story mode frost
  amplitude?: number; // For breath condensation
  orbPosition?: { x: number; y: number };
  timeOfDay?: "dawn" | "day" | "twilight" | "night";
}

export default function SceneBackground({ 
  children, 
  source, 
  sceneKey = "aurora",
  orbEmotion = "neutral",
  aiSpeaking = false,
  storyGrowth = 0,
  amplitude = 0,
  orbPosition = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
  timeOfDay = "day",
}: SceneBackgroundProps) {
  // Select background based on sceneKey
  let backgroundSource = defaultBackground;
  if (sceneKey === "forest") {
    backgroundSource = require("../../../assets/backgrounds/metsä_talvi.png");
  } else if (sceneKey === "lapland") {
    backgroundSource = require("../../../assets/backgrounds/snow_pile.png");
  }

  // Scene phase for animations
  const scenePhase = useSharedValue(0);
  React.useEffect(() => {
    scenePhase.value = withTiming(1, { duration: 12000 });
  }, [scenePhase]);

  // Brightness based on emotion and time of day
  const brightness = useMemo(() => {
    const emotionBrightness = {
      calm: 0.35,
      confident: 0.40,
      neutral: 0.35,
      unsure: 0.30,
      overloaded: 0.25,
    }[orbEmotion] || 0.35;

    const timeBrightness = {
      dawn: 0.42,
      day: 0.50,
      twilight: 0.38,
      night: 0.32,
    }[timeOfDay] || 0.35;

    return (emotionBrightness + timeBrightness) / 2;
  }, [orbEmotion, timeOfDay]);

  // AI speaking glow
  const glowOpacity = useSharedValue(0);
  React.useEffect(() => {
    glowOpacity.value = withTiming(aiSpeaking ? 0.15 : 0, { duration: 400 });
  }, [aiSpeaking, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <ImageBackground
      source={source || backgroundSource}
      style={[styles.container, { opacity: brightness }]}
      resizeMode="cover"
    >
      {/* Background layers based on scene */}
      {sceneKey === "aurora" && (
        <>
          <Starfield starCount={250} />
          <AuroraRipple intensity={1.0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />
          <ShadowAnimals enabled={timeOfDay === "night" || timeOfDay === "twilight"} scenePhase={scenePhase.value} />
        </>
      )}

      {(sceneKey === "forest" || sceneKey === "lapland") && (
        <>
          <FogBreath />
          <Snowfall particleCount={100} speedMultiplier={1.0} />
          {sceneKey === "lapland" && timeOfDay === "winter" && (
            <BreathCondensation 
              enabled={amplitude > 0.08} 
              amplitude={amplitude}
              orbX={orbPosition.x}
              orbY={orbPosition.y}
            />
          )}
        </>
      )}

      {/* Story mode frost edges */}
      {storyGrowth > 0 && (
        <FrostEdges growth={storyGrowth} enabled={true} />
      )}

      {/* AI speaking radial glow */}
      <Animated.View style={[styles.glowOverlay, glowStyle]} pointerEvents="none">
        <View style={styles.radialGradient} />
      </Animated.View>

      {/* Aurora layer for aurora scene */}
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
  glowOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  radialGradient: {
    flex: 1,
    backgroundColor: "rgba(120, 200, 255, 0.1)",
    borderRadius: SCREEN_WIDTH,
  },
});


