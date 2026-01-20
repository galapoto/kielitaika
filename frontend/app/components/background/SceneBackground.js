import React, { useMemo } from 'react';
import { View, StyleSheet, ImageBackground, Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// Scene key to image mapping
const SCENE_IMAGES = {
  aurora: require('../../../assets/backgrounds/revontuli.png'),
  forest: require('../../../assets/backgrounds/metsä_talvi.png'),
  lapland: require('../../../assets/backgrounds/snow_pile.png'),
};

// Scene key to display name mapping
const SCENE_NAMES = {
  aurora: 'Aurora',
  forest: 'Snowy Forest',
  lapland: 'Lapland Snow Monsters',
};

/**
 * SceneBackground Component
 * 
 * Renders a scene-based background with:
 * - Blur and dim overlays
 * - Animated brightness controlled by OrbMoodLightingEngine
 * - Parallax effect support (for HomeScreen)
 * - Gradient overlays for readability
 * 
 * @param {string} sceneKey - One of: 'aurora', 'forest', 'lapland'
 * @param {number} brightness - Brightness value (0-1, default: 1)
 * @param {boolean} enableParallax - Enable parallax effect (default: false)
 * @param {number} parallaxOffset - Parallax offset for scroll (default: 0)
 * @param {boolean} enableBlur - Enable blur overlay (default: true)
 * @param {number} blurIntensity - Blur intensity (0-1, default: 0.3)
 * @param {boolean} enableDim - Enable dim overlay (default: true)
 * @param {number} dimOpacity - Dim opacity (0-1, default: 0.4)
 * @param {Array} gradientColors - Gradient overlay colors (optional)
 * @param {React.ReactNode} children - Content to render over background
 */
export default function SceneBackground({
  sceneKey = 'forest',
  brightness = 1,
  enableParallax = false,
  parallaxOffset = 0,
  enableBlur = true,
  blurIntensity = 0.3,
  enableDim = true,
  dimOpacity = 0.4,
  gradientColors,
  children,
  style,
}) {
  const imageSource = SCENE_IMAGES[sceneKey] || SCENE_IMAGES.forest;
  
  // Animated brightness value
  const brightnessValue = useSharedValue(brightness);
  
  // Update brightness when prop changes
  React.useEffect(() => {
    brightnessValue.value = withTiming(brightness, { duration: 300 });
  }, [brightness, brightnessValue]);

  // Animated style for brightness
  const brightnessStyle = useAnimatedStyle(() => {
    return {
      opacity: brightnessValue.value,
    };
  });

  // Parallax transform
  const parallaxStyle = useAnimatedStyle(() => {
    if (!enableParallax) return {};
    
    const translateY = interpolate(
      parallaxOffset,
      [-100, 0, 100],
      [-20, 0, 20],
      'clamp'
    );
    
    return {
      transform: [{ translateY }],
    };
  });

  // Default gradient colors for readability (dark overlay from top)
  const defaultGradientColors = gradientColors || [
    'rgba(0, 0, 0, 0.3)',
    'rgba(0, 0, 0, 0.1)',
    'transparent',
    'transparent',
    'rgba(0, 0, 0, 0.2)',
  ];

  return (
    <View style={[styles.container, style]}>
      <Animated.View 
        style={[
          styles.backgroundContainer,
          parallaxStyle,
        ]}
      >
        <ImageBackground
          source={imageSource}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          {/* Base brightness layer */}
          <Animated.View 
            style={[
              styles.brightnessLayer,
              brightnessStyle,
            ]}
          />
          
          {/* Blur overlay (simulated with semi-transparent overlay) */}
          {enableBlur && (
            <View 
              style={[
                styles.overlay,
                { 
                  backgroundColor: `rgba(255, 255, 255, ${blurIntensity * 0.1})`,
                  opacity: blurIntensity,
                },
              ]} 
            />
          )}
          
          {/* Dim overlay */}
          {enableDim && (
            <View 
              style={[
                styles.overlay,
                { backgroundColor: `rgba(0, 0, 0, ${dimOpacity})` },
              ]} 
            />
          )}
          
          {/* Gradient overlay for readability */}
          <LinearGradient
            colors={defaultGradientColors}
            locations={[0, 0.2, 0.4, 0.6, 1]}
            style={styles.gradientOverlay}
          />
        </ImageBackground>
      </Animated.View>
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  brightnessLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
    position: 'relative',
  },
});

// TODO: Codex to implement:
// - Animate transitions between scenes (fade/cross-fade)
// - Animate blur on screen change (smooth blur intensity transitions)
// - Sync background lighting with orb mood (integrate with OrbMoodLightingEngine)
// - Add subtle color-tint pulse during AI speaking (subtle hue shift animation)
