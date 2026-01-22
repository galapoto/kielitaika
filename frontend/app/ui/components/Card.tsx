import React from 'react';
import { View, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { theme } from '../themes/theme';
import { useHaptic } from '../../hooks/useHaptic';

type IconComponent = React.ComponentType<{ size?: number; stroke?: string; strokeWidth?: number }>;

type RukaCardProps = {
  title: string;
  subtitle?: string;
  icon?: IconComponent;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  children?: React.ReactNode;
};

/**
 * Soft floating card with glow on press.
 */
function RukaCard({ title, subtitle, icon: Icon, onPress, style, titleStyle, subtitleStyle, children }: RukaCardProps) {
  const lift = useSharedValue(0);
  const glow = useSharedValue(0);
  const { light } = useHaptic();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -lift.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const glowIntensity = interpolate(glow.value, [0, 1], [0, 0.3]);
    const glowRadius = interpolate(glow.value, [0, 1], [0, 16]);
    return {
      shadowColor: `rgba(174, 226, 255, ${glowIntensity})`,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: glowRadius,
      elevation: glow.value > 0 ? 6 : 0,
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      light();
    }
    lift.value = withSpring(6, { damping: 12, stiffness: 220 });
    glow.value = withSpring(1, { damping: 14, stiffness: 210 });
  };

  const handlePressOut = () => {
    lift.value = withSpring(0, { damping: 14, stiffness: 240 });
    glow.value = withSpring(0, { damping: 16, stiffness: 240 });
  };

  return (
    <Animated.View style={[animatedStyle, glowAnimatedStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{
          padding: 20,
          marginVertical: 10,
          borderRadius: 20,
          backgroundColor: '#101628',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          gap: 8,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Inner highlight overlay for emboss effect */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            pointerEvents: 'none',
          }}
        />
        <View style={{ zIndex: 1 }}>
          {Icon && <Icon size={28} stroke={theme.dark.accent} />}
          {!!title && <Text style={[{ color: theme.dark.text, fontSize: 20, fontWeight: '700' }, titleStyle]}>{title}</Text>}
          {subtitle && (
            <Text style={[{ color: theme.dark.subtext, fontSize: 14 }, subtitleStyle]}>
              {subtitle}
            </Text>
          )}
          {children}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default React.memo(RukaCard);
