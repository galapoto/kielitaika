/**
 * Background Component - Theme-aware dynamic background system
 * 
 * Features:
 * - Automatic theme detection
 * - Overlay for readability
 * - Optional blur for text-heavy screens
 * - Animation support
 * - Perfect contrast enforcement
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue, 
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import WavyBackground from '../../ui/components/WavyBackground';
import { useTheme } from '../../context/ThemeContext';
import { usePreferences } from '../../context/PreferencesContext';
import { getAnimationLayers } from '../../lib/animationLayers';
import Svg, { Circle } from 'react-native-svg';
import { performanceService } from '../../services/performanceService';

type SectionVariant = "blue" | "brown" | "black";
type Gradient = readonly [string, string, ...string[]];

const PALETTE = {
  blue0: "#050813",
  blue1: "#0A0E27",
  blue2: "#0F2147", // image-7-ish blue (not too bright)
  white: "#FFFFFF",
  // Premium brown palette (deepest to lightest)
  brown0: "#1A0F0A", // Deepest premium brown
  brown1: "#2A1F16", // Medium brown
  brown2: "#3A2A1E", // Lighter brown
  black1: "#07090E",
  // Dark gray/black for conversation page (first image style)
  darkGray0: "#0A0A0A",
  darkGray1: "#1A1A1A", // Main dark gray background
  darkGray2: "#2A2A2A",
};

// Gradient definitions for each module
const getModuleGradient = (
  module: ModuleKey,
  colorScheme: string,
  variant: SectionVariant
): Gradient => {
  const g = (...colors: string[]): Gradient => colors as unknown as Gradient;

  if (colorScheme === 'light') {
    return g('#E8F4F8', '#F0F8FF', '#E0EFFF');
  }

  const byVariant: Record<SectionVariant, Record<ModuleKey, Gradient>> = {
    blue: {
      login: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
      home: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
      practice: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
      // Conversation: Dark blue to purple gradient (matching image)
      conversation: g('#0A0E27', '#1A1A3A', '#2D1B4A'), // Dark blue to purple
      workplace: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
      yki_read: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
      yki_write: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
      yki_listen: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
      yki_speak: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
    },
    // Premium brown: Deepest brown with minimal blue/white touches
    brown: {
      login: g(PALETTE.brown0, PALETTE.brown1, PALETTE.brown0),
      home: g(PALETTE.brown0, PALETTE.brown1, PALETTE.brown0),
      practice: g(PALETTE.brown0, PALETTE.brown1, PALETTE.brown0),
      conversation: g(PALETTE.blue0, PALETTE.brown2, PALETTE.blue2), // Keep blue for conversation
      workplace: g(PALETTE.brown0, PALETTE.brown1, PALETTE.brown0),
      yki_read: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2), // Keep blue for YKI
      yki_write: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
      yki_listen: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
      yki_speak: g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2),
    },
    // 30% blue, 50% black, 20% white accents (approximated)
    black: {
      login: g(PALETTE.blue0, PALETTE.black1, PALETTE.blue1),
      home: g(PALETTE.blue0, PALETTE.black1, PALETTE.blue1),
      practice: g(PALETTE.blue0, PALETTE.black1, PALETTE.blue1),
      conversation: g(PALETTE.blue0, PALETTE.black1, PALETTE.blue2),
      workplace: g(PALETTE.blue0, PALETTE.black1, PALETTE.blue1),
      yki_read: g(PALETTE.blue0, PALETTE.black1, PALETTE.blue2),
      yki_write: g(PALETTE.blue0, PALETTE.black1, PALETTE.blue2),
      yki_listen: g(PALETTE.blue0, PALETTE.black1, PALETTE.blue2),
      yki_speak: g(PALETTE.blue0, PALETTE.black1, PALETTE.blue2),
    },
  };

  return byVariant[variant]?.[module] || byVariant.blue[module] || g(PALETTE.blue0, PALETTE.blue1, PALETTE.blue2);
};

type ModuleKey = 
  | "login" 
  | "home" 
  | "conversation" 
  | "practice" 
  | "workplace" 
  | "yki_read" 
  | "yki_write" 
  | "yki_listen" 
  | "yki_speak";

type AnimationType = "snow" | "aurora" | "particles" | "convo_float" | null;
type ImageVariant = "home" | "workplace" | "lesson";

interface BackgroundProps {
  module: ModuleKey;
  variant?: SectionVariant; // blue | brown | black
  imageVariant?: ImageVariant;
  animation?: AnimationType;
  children?: React.ReactNode;
  disableAutoAnimations?: boolean; // Set to true to disable automatic animation layers
  modalBlur?: boolean; // If true, fade in a blur overlay (for modal transitions)
}

const BACKGROUND_IMAGES: Record<ImageVariant, ReturnType<typeof require>> = {
  home: require('../../../assets/backgrounds/theme1.png'),
  workplace: require('../../../assets/backgrounds/theme3.png'),
  lesson: require('../../../assets/backgrounds/theme4.png'),
};

const styles = StyleSheet.create({
  imageBackground: {
    resizeMode: 'cover',
    opacity: 0.72,
  },
  readabilityPanel: {
    borderRadius: 16,
    padding: 20,
  },
});

// Removed AnimatedImage - no longer using background images

export default function Background({ 
  module, 
  variant,
  imageVariant,
  animation = null, 
  children,
  disableAutoAnimations = false,
  modalBlur = false,
}: BackgroundProps) {
  const systemColorScheme = useColorScheme() || "dark";
  let userTheme = systemColorScheme;
  try {
    const themeContext = useTheme?.();
    if (themeContext?.theme) {
      userTheme = themeContext.theme;
    }
  } catch (e) {
    // ThemeContext not available, use system scheme
  }
  const colorScheme = userTheme || systemColorScheme;

  // Get user preferences
  let animationsEnabled = true;
  let backgroundsEnabled = true;
  try {
    const preferences = usePreferences?.();
    if (preferences) {
      animationsEnabled = preferences.animationsEnabled;
      backgroundsEnabled = preferences.backgroundsEnabled;
    }
  } catch (e) {
    // PreferencesContext not available, use defaults
  }
  const opacity = useSharedValue(1);
  const blurOpacity = useSharedValue(modalBlur ? 0 : 0);
  const effectiveVariant: SectionVariant =
    variant || (
      module === "conversation" || module.startsWith("yki_") 
        ? "blue"  // Keep blue for conversation and YKI
        : "brown" // Premium brown for everything else
    );
  const gradientColors = getModuleGradient(module, colorScheme, effectiveVariant);
  const [lowPerformanceMode, setLowPerformanceMode] = useState(false);

  // Fade transition when theme or module changes
  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [colorScheme, module, opacity]);

  // Modal blur animation
  useEffect(() => {
    if (modalBlur) {
      blurOpacity.value = 0;
      blurOpacity.value = withTiming(1, { duration: 450 });
    } else {
      blurOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [modalBlur, blurOpacity]);

  useEffect(() => {
    const handle = setInterval(() => {
      setLowPerformanceMode(performanceService.fps < 45);
    }, 1200);
    return () => clearInterval(handle);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  // Determine if blur is needed (text-heavy screens)
  const needsBlur = module === "yki_read" || module === "yki_write";

  // Animation opacity (lower to not block text)
  const animationOpacity = lowPerformanceMode ? 0 : module === "conversation" ? 0.4 : 0.25;

  // Use "cover" for all screens to fill the screen and adapt to phone sizes

  const waveColors =
    module === "conversation"
      ? ([
          "rgba(255,255,255,0.08)", // white accent
          "rgba(58,42,30,0.12)", // brown pocket
          "rgba(7,9,14,0.12)", // black pocket
        ] as const)
      : effectiveVariant === "brown"
        ? ([
            "rgba(255,255,255,0.08)",
            "rgba(27,78,218,0.10)", // always some blue
            "rgba(58,42,30,0.12)",
          ] as const)
        : effectiveVariant === "black"
          ? ([
              "rgba(255,255,255,0.08)",
              "rgba(27,78,218,0.10)", // always some blue
              "rgba(7,9,14,0.12)",
            ] as const)
    : ([
            "rgba(255,255,255,0.08)",
            "rgba(27,78,218,0.10)",
            "rgba(7,9,14,0.12)",
          ] as const);

  // Background images are optional - using gradients as primary backgrounds
  const selectedImage = null; // imageVariant ? BACKGROUND_IMAGES[imageVariant] : null;

  const TextureOverlay = () => {
    if (colorScheme !== "dark") return null;
    // Deterministic "grain" dots (subtle texture, not shiny/polished)
    const dots = Array.from({ length: 90 }).map((_, i) => {
      const x = (i * 37) % 100;
      const y = (i * 59) % 100;
      const r = 0.35 + ((i * 13) % 10) / 20;
      const o = 0.035 + (((i * 7) % 10) / 10) * 0.015;
      return { x, y, r, o };
    });
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {dots.map((d, idx) => (
            <Circle key={idx} cx={d.x} cy={d.y} r={d.r} fill={`rgba(255,255,255,${d.o})`} />
          ))}
        </Svg>
      </View>
    );
  };

  const backgroundContent = (
    <>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* White "stripes" / highlights - enhanced for conversation page */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          { opacity: module === "conversation" ? 0.35 : 0.22 }
        ]} 
        pointerEvents="none"
      >
        <LinearGradient
          colors={
            module === "conversation"
              ? [
                  "rgba(255,255,255,0.00)",
                  "rgba(255,255,255,0.15)",
                  "rgba(255,255,255,0.00)",
                  "rgba(255,255,255,0.12)",
                  "rgba(255,255,255,0.00)",
                  "rgba(255,255,255,0.10)",
                  "rgba(255,255,255,0.00)",
                ]
              : [
                  "rgba(255,255,255,0.00)",
                  "rgba(255,255,255,0.10)",
                  "rgba(255,255,255,0.00)",
                  "rgba(255,255,255,0.08)",
                  "rgba(255,255,255,0.00)",
                ]
          }
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {/* Additional diagonal stripes for conversation page */}
      {module === "conversation" && (
        <Animated.View 
          style={[StyleSheet.absoluteFill, { opacity: 0.18 }]} 
          pointerEvents="none"
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.00)",
              "rgba(255,255,255,0.08)",
              "rgba(255,255,255,0.00)",
            ]}
            start={{ x: -0.2, y: 0 }}
            end={{ x: 1.2, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
      {/* Texture overlay (image-8-inspired: not smooth, lightly embossed feel) */}
      <TextureOverlay />
      {/* Wavy motion background */}
          {!lowPerformanceMode && (
            <WavyBackground
              colors={[...waveColors]}
              waveCount={3}
              speed={5200}
              amplitude={50}
            />
          )}
    </>
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Background Gradient - No images, only gradients */}
      {backgroundsEnabled ? (
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          {selectedImage ? (
            <ImageBackground
              source={selectedImage}
              style={StyleSheet.absoluteFill}
              imageStyle={styles.imageBackground}
            >
              {backgroundContent}
            </ImageBackground>
          ) : (
            backgroundContent
          )}
        </Animated.View>
      ) : (
        // Blank mode - Solid color
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colorScheme === "dark" ? PALETTE.blue1 : "#F8FAFC",
            },
          ]}
        />
      )}

      {/* Automatic Animation Layers - Only show if animations are enabled */}
      {animationsEnabled && !disableAutoAnimations && getAnimationLayers(module).map((layer, index) => (
        <React.Fragment key={`auto-anim-${index}`}>
          {layer}
        </React.Fragment>
      ))}

      {/* NO OVERLAY LAYERS - Text goes directly on images for all screens */}

      {/* Optional Blur for text-heavy screens */}
      {needsBlur && (
        <BlurView
          intensity={25}
          tint={colorScheme}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Modal transition blur */}
      {modalBlur && (
        <Animated.View style={[StyleSheet.absoluteFill, blurStyle]} pointerEvents="none">
          <BlurView
            intensity={40}
            tint={colorScheme}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      {/* Optional Animation Overlay (Lottie) - Only if animations are enabled */}
      {animationsEnabled && animation && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: animationOpacity },
          ]}
        >
          {/* Animation will be loaded here - placeholder for Lottie */}
          {/* <LottieView
            source={getAnimationSource(animation)}
            autoPlay
            loop
            style={StyleSheet.absoluteFill}
          /> */}
        </Animated.View>
      )}

      {/* Content */}
      {children}
    </View>
  );
}

/**
 * Helper component for text-heavy areas (readability panel)
 */
export function ReadabilityPanel({ 
  children, 
  style 
}: { 
  children: React.ReactNode; 
  style?: any;
}) {
  const colorScheme = useColorScheme() || "dark";

  return (
    <View
      style={[
        styles.readabilityPanel,
        {
          backgroundColor:
            colorScheme === "dark"
              ? "rgba(0,0,0,0.45)"
              : "rgba(255,255,255,0.35)",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
