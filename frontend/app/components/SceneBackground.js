import React, { useEffect } from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import Starfield from './background/layers/Starfield';
import AuroraRipple from './background/layers/AuroraRipple';
import AuroraVoiceReactive from './background/layers/AuroraVoiceReactive';
import Snowfall from './background/layers/Snowfall';
import FogBreath from './background/layers/FogBreath';
import FrostEdges from './background/layers/FrostEdges';
import ShadowAnimals from './background/layers/ShadowAnimals';
import BreathCondensation from './background/layers/BreathCondensation';
import { getDayNightState } from '../season/DayNightCycle';

// Scene background images
const auroraImg = require('../../assets/backgrounds/revontuli.png');
const forestImg = require('../../assets/backgrounds/metsä_talvi.png');
const laplandImg = require('../../assets/backgrounds/snow_pile.png');

const emotionMap = {
  calm: 0,
  confident: 1,
  unsure: 0.4,
  overloaded: 0.2,
};

const sceneBrightness = {
  aurora: 0.35,
  forest: 0.42,
  lapland: 0.3,
};

export default function SceneBackground({
  sceneKey = 'aurora', // aurora | forest | lapland
  orbEmotion = 'calm',
  aiSpeaking = false,
  timeOfDay = 'day',
  amplitude = 0,
  season = 'winter',
  useLocalTime = true,
  style,
}) {
  const [dayState, setDayState] = React.useState(getDayNightState());
  const brightness = useSharedValue(sceneBrightness[sceneKey] ?? 0.35);
  const blurLevel = useSharedValue(2);
  const parallaxX = useSharedValue(0);
  const parallaxY = useSharedValue(0);
  const scenePhase = useSharedValue(0);
  const transition = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // looped ambient motion
  useEffect(() => {
    scenePhase.value = withRepeat(withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.quad) }), -1, false);
    parallaxY.value = withRepeat(withTiming(1, { duration: 16000, easing: Easing.inOut(Easing.quad) }), -1, true);
    parallaxX.value = withRepeat(withTiming(1, { duration: 20000, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [scenePhase, parallaxX, parallaxY]);

  // local time tint updates
  useEffect(() => {
    if (!useLocalTime) return;
    const update = () => setDayState(getDayNightState());
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [useLocalTime]);

  // scene transition
  useEffect(() => {
    transition.value = 0;
    blurLevel.value = 8;
    brightness.value = 0.1;
    transition.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    blurLevel.value = withTiming(2, { duration: 800 });
    brightness.value = withTiming(sceneBrightness[sceneKey] ?? 0.35, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [sceneKey, transition, blurLevel, brightness]);

  // emotion-driven brightness/tint
  useEffect(() => {
    const emo = orbEmotion || 'calm';
    const emoVal = emotionMap[emo] ?? 0.35;
    const target = {
      calm: 0.35,
      confident: 0.4,
      unsure: 0.3,
      overloaded: 0.25,
    }[emo] ?? 0.35;
    brightness.value = withTiming(target, { duration: 900, easing: Easing.inOut(Easing.cubic) });
  }, [orbEmotion, brightness]);

  // AI speaking glow
  useEffect(() => {
    if (aiSpeaking) {
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.15, { duration: 600 }), withTiming(0.08, { duration: 600 })),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 400 });
    }
  }, [aiSpeaking, glowOpacity]);

  // time of day mapping for forest brightness
  useEffect(() => {
    if (sceneKey !== 'forest') return;
    if (timeOfDay === 'dawn') brightness.value = withTiming(0.42, { duration: 1500 });
    else if (timeOfDay === 'day') brightness.value = withTiming(0.5, { duration: 1200 });
    else brightness.value = withTiming(0.33, { duration: 1200 });
  }, [sceneKey, timeOfDay, brightness]);

  // day/night tint override
  useEffect(() => {
    if (!useLocalTime) return;
    brightness.value = withTiming(dayState.brightness, { duration: 1200, easing: Easing.inOut(Easing.cubic) });
  }, [dayState, brightness, useLocalTime]);

  // Parallax transforms
  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: parallaxY.value * 8 },
      { translateX: parallaxX.value * 6 },
    ],
  }));

  // Scene specific animated styles
  const auroraStyle = useAnimatedStyle(() => {
    if (sceneKey !== 'aurora') return { opacity: 0 };
    const offset = interpolate(scenePhase.value, [0, 0.5, 1], [-30, 20, -30]);
    const shimmerOpacity = interpolate(scenePhase.value, [0, 0.5, 1], [0.05, 0.22, 0.05]);
    const translateX = interpolate(scenePhase.value, [0, 1], [-40, 40]);
    return {
      opacity: shimmerOpacity,
      transform: [{ translateY: offset }, { translateX }],
    };
  });

  const forestStyle = useAnimatedStyle(() => {
    if (sceneKey !== 'forest') return { opacity: 0 };
    const breathScale = interpolate(scenePhase.value, [0, 0.5, 1], [1, 1.03, 1]);
    const sparkleOpacity = interpolate(scenePhase.value, [0, 0.3, 0.6, 1], [0, 0.12, 0.05, 0]);
    return {
      opacity: 1,
      transform: [{ scale: breathScale }],
      extraSparkleOpacity: sparkleOpacity,
    };
  });

  const laplandStyle = useAnimatedStyle(() => {
    if (sceneKey !== 'lapland') return { opacity: 0 };
    const hazeOpacity = interpolate(scenePhase.value, [0, 0.5, 1], [0.06, 0.14, 0.06]);
    const hazeOffsetY = interpolate(scenePhase.value, [0, 1], [0, -15]);
    return {
      opacity: hazeOpacity,
      transform: [{ translateY: hazeOffsetY }],
    };
  });

  const tintStyle = useAnimatedStyle(() => {
    const emo = orbEmotion || 'calm';
    const emoIndex = emotionMap[emo] ?? 0;
    const tint = interpolateColor(
      emoIndex,
      [0, 0.4, 1],
      ['rgba(101,247,215,0.12)', 'rgba(78,197,255,0.15)', 'rgba(63,160,255,0.18)']
    );
    return { backgroundColor: tint, opacity: transition.value };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const imageAnimatedProps = useAnimatedProps(() => ({
    blurRadius: blurLevel.value,
  }));

  const imageBrightness = useAnimatedStyle(() => ({
    opacity: transition.value,
  }));

  const dayNightOverlay = useAnimatedStyle(() => ({
    backgroundColor: dayState.tint,
    opacity: 1,
  }));

  const chosenImg =
    sceneKey === 'forest' ? forestImg : sceneKey === 'lapland' ? laplandImg : auroraImg;

  return (
    <View style={[styles.container, style]}>
      {sceneKey === 'aurora' && (dayState.stars ?? true) && <Starfield />}
      {sceneKey === 'aurora' && <ShadowAnimals opacity={0.08} />}

      <Animated.Image
        source={chosenImg}
        resizeMode="cover"
        style={[styles.image, parallaxStyle, imageBrightness]}
        animatedProps={imageAnimatedProps}
      />

      {/* Overlays */}
      {sceneKey === 'aurora' && (
        <>
          <AuroraRipple intensity={0.6} emotion={orbEmotion} wave={amplitude} />
          <AuroraVoiceReactive amplitude={amplitude} />
        </>
      )}
      {(sceneKey === 'forest' || sceneKey === 'lapland') && (
        <FogBreath intensity={0.9} amplitude={amplitude} />
      )}
      {(sceneKey === 'forest' || sceneKey === 'lapland') && (
        <Snowfall intensity={sceneKey === 'lapland' ? 1.2 : 1} />
      )}
      {sceneKey === 'aurora' && (
        <BreathCondensation amplitude={amplitude} orbX={0} orbY={0} />
      )}
      <Animated.View pointerEvents="none" style={[styles.overlay, tintStyle]} />
      <Animated.View pointerEvents="none" style={[styles.overlay, dayNightOverlay]} />
      <Animated.View pointerEvents="none" style={[styles.overlay, styles.glow, glowStyle]} />

      {/* Aurora shimmer */}
      <Animated.View pointerEvents="none" style={[styles.overlay, auroraStyle, styles.aurora]} />
      {/* Forest sparkle */}
      <Animated.View pointerEvents="none" style={[styles.overlay, forestStyle, styles.sparkle]} />
      {/* Lapland haze */}
      <Animated.View pointerEvents="none" style={[styles.overlay, laplandStyle, styles.haze]} />

      {/* Frost edges for story mode (pass growth prop when needed) */}
      <FrostEdges growth={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    backgroundColor: 'rgba(100,255,230,0.3)',
  },
  aurora: {
    backgroundColor: 'rgba(120,255,255,0.18)',
  },
  sparkle: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  haze: {
    backgroundColor: 'rgba(180,220,255,0.08)',
  },
});
