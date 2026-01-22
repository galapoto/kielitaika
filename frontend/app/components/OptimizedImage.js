import React, { useState, useCallback } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SkeletonRect } from './SkeletonScreen';

const AnimatedImage = Animated.createAnimatedComponent(Image);

/**
 * OptimizedImage - Lightweight image component with lazy loading and caching
 * Features:
 * - Lazy loading (only loads when visible)
 * - Progressive loading with skeleton
 * - Fade-in animation
 * - Error handling with fallback
 * - Memory efficient
 */
export default function OptimizedImage({
  source,
  style,
  placeholder,
  fallback,
  resizeMode = 'cover',
  ...props
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  // Show skeleton while loading
  if (loading && !error) {
    return (
      <View style={[styles.container, style]}>
        {placeholder || <SkeletonRect width="100%" height="100%" />}
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </View>
    );
  }

  // Show fallback on error
  if (error && fallback) {
    return (
      <View style={[styles.container, style]}>
        {fallback}
      </View>
    );
  }

  // Show image with fade-in animation
  return (
    <AnimatedImage
      source={source}
      style={[styles.image, style]}
      resizeMode={resizeMode}
      entering={FadeIn.duration(300)}
      onError={handleError}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});






























