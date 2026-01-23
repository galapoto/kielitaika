import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScaleOnPress } from '../animations/useScaleOnPress';
import { useFadeIn } from '../animations/useFadeIn';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function VocabCard({ word, translation, example, imageUrl, prompt, onPlayAudio, onPress, testID }) {
  const { colors: themeColors } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = useScaleOnPress();
  const fadeInStyle = useFadeIn();

  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: themeColors.surface,
      borderRadius: radius.xl,
      padding: spacing.l,
      marginVertical: spacing.s,
      ...shadows.s,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    word: {
      ...typography.titleL,
      fontWeight: '700',
      color: themeColors.primary,
      marginBottom: spacing.s,
    },
    translation: {
      ...typography.body,
      color: themeColors.textSecondary,
      marginBottom: spacing.m,
    },
    example: {
      ...typography.bodySm,
      color: themeColors.text,
      fontStyle: 'italic',
      marginTop: spacing.s,
    },
    imageContainer: {
      width: '100%',
      height: 110,
      borderRadius: radius.xl,
      marginBottom: spacing.m,
      overflow: 'hidden',
      backgroundColor: themeColors.background,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    audioButton: {
      position: 'absolute',
      top: spacing.m,
      right: spacing.m,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.blueMain,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.m,
    },
    audioIcon: {
      fontSize: 20,
    },
    imageFallback: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.m,
      backgroundColor: themeColors.surfaceAlt || themeColors.background,
    },
    imagePrompt: {
      ...typography.bodySm,
      color: themeColors.textSecondary,
      textAlign: 'center',
    },
    fallbackInitial: {
      ...typography.titleL,
      color: themeColors.primary,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
  });

  return (
    <AnimatedTouchable
      style={[dynamicStyles.card, animatedStyle, fadeInStyle]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.9}
      testID={testID}
    >
      {(imageUrl || prompt) && (
        <View style={dynamicStyles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={dynamicStyles.image} resizeMode="cover" />
          ) : (
            <View style={dynamicStyles.imageFallback}>
              <Text style={dynamicStyles.fallbackInitial}>{word?.[0] || '📚'}</Text>
              {prompt ? <Text style={dynamicStyles.imagePrompt} numberOfLines={3}>{prompt}</Text> : null}
            </View>
          )}
        </View>
      )}
      
      <Text style={dynamicStyles.word}>{word}</Text>
      {translation && <Text style={dynamicStyles.translation}>{translation}</Text>}
      {example && <Text style={dynamicStyles.example}>"{example}"</Text>}
      
      {onPlayAudio && (
        <TouchableOpacity style={dynamicStyles.audioButton} onPress={onPlayAudio}>
          <Text style={dynamicStyles.audioIcon}>🔊</Text>
        </TouchableOpacity>
      )}
    </AnimatedTouchable>
  );
}



