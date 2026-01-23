import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../styles/colors';

/**
 * WindGlyphs - Animated glyph strokes for grammar screens
 * 
 * Light background effect that doesn't block interaction.
 * Glyph animations tied to grammar mode (case work vs verb work).
 */
export default function WindGlyphs({ mode = 'cases', intensity = 0.3 }) {
  const animatedValues = useRef(
    Array.from({ length: 8 }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0.1),
      rotation: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Create continuous animations for each glyph
    const animations = animatedValues.map((values, index) => {
      const delay = index * 200;
      const duration = 3000 + index * 500;

      return Animated.loop(
        Animated.parallel([
          // Horizontal drift
          Animated.sequence([
            Animated.timing(values.translateX, {
              toValue: 50 + index * 20,
              duration: duration,
              delay: delay,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(values.translateX, {
              toValue: 0,
              duration: duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          // Vertical drift
          Animated.sequence([
            Animated.timing(values.translateY, {
              toValue: -30 - index * 10,
              duration: duration * 1.2,
              delay: delay,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(values.translateY, {
              toValue: 0,
              duration: duration * 1.2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          // Opacity pulse
          Animated.sequence([
            Animated.timing(values.opacity, {
              toValue: intensity,
              duration: duration * 0.8,
              delay: delay,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(values.opacity, {
              toValue: 0.05,
              duration: duration * 0.8,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          // Rotation (subtle)
          Animated.loop(
            Animated.timing(values.rotation, {
              toValue: 1,
              duration: duration * 2,
              delay: delay,
              easing: Easing.linear,
              useNativeDriver: true,
            })
          ),
        ])
      );
    });

    // Start all animations
    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [mode, intensity]);

  // Generate glyph paths based on mode
  const getGlyphPath = (index) => {
    // Different glyph styles for different modes
    if (mode === 'cases') {
      // Case endings: curved lines representing case markers
      return {
        path: `M${20 + index * 15} ${30 + index * 20} Q${40 + index * 15} ${20 + index * 20} ${60 + index * 15} ${30 + index * 20}`,
        strokeWidth: 1.5,
      };
    } else if (mode === 'verbs') {
      // Verb forms: angular lines representing conjugation
      return {
        path: `M${20 + index * 15} ${30 + index * 20} L${40 + index * 15} ${20 + index * 20} L${60 + index * 15} ${30 + index * 20}`,
        strokeWidth: 1.5,
      };
    } else {
      // Word order: flowing lines representing sentence structure
      return {
        path: `M${20 + index * 15} ${30 + index * 20} C${30 + index * 15} ${20 + index * 20} ${50 + index * 15} ${20 + index * 20} ${60 + index * 15} ${30 + index * 20}`,
        strokeWidth: 1.5,
      };
    }
  };

  // For React Native, we'll use simple View components with animated styles
  // In a web environment, you could use SVG paths
  return (
    <View style={styles.container} pointerEvents="none">
      {animatedValues.map((values, index) => {
        const glyph = getGlyphPath(index);
        const rotation = values.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.glyph,
              {
                transform: [
                  { translateX: values.translateX },
                  { translateY: values.translateY },
                  { rotate: rotation },
                ],
                opacity: values.opacity,
                left: `${10 + index * 12}%`,
                top: `${15 + index * 10}%`,
              },
            ]}
          >
            {/* Simple line representation (can be replaced with SVG in web) */}
            <View
              style={[
                styles.glyphLine,
                {
                  width: 40 + index * 5,
                  height: glyph.strokeWidth,
                  backgroundColor: mode === 'cases' ? colors.blueMain : mode === 'verbs' ? '#10b981' : '#f59e0b',
                  borderRadius: mode === 'cases' ? 2 : 0,
                },
              ]}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  glyph: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphLine: {
    position: 'absolute',
  },
});
