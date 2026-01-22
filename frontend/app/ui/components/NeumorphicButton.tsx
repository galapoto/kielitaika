/**
 * NeumorphicButton - Neumorphic design button with rotating corner light effect
 * 
 * Based on image 8 design principles:
 * - Neumorphic soft UI with inner/outer shadows
 * - Dark grey background
 * - Rounded corners
 * - Accent color for icons/text
 * - Rotating light effect around corners every few seconds
 */

import React, { useEffect } from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  withSpring, 
  withRepeat,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerEffect from './ShimmerEffect';

type IconComponent = React.ComponentType<{ size?: number; stroke?: string; strokeWidth?: number; fill?: string }>;
type LogoComponent = React.ComponentType<{ size?: number }>;

interface NeumorphicButtonProps {
  title?: string;
  onPress?: () => void;
  icon?: IconComponent;
  logo?: LogoComponent;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
  testID?: string;
  children?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function NeumorphicButton({
  title,
  onPress,
  icon: Icon,
  logo: Logo,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  size = 'medium',
  testID,
  children,
}: NeumorphicButtonProps) {
  const scale = useSharedValue(1);
  const lightRotation = useSharedValue(0);
  const lightOpacity = useSharedValue(0);

  // Rotating light animation - rotates every few seconds
  useEffect(() => {
    // Start rotation animation
    lightRotation.value = withRepeat(
      withTiming(360, {
        duration: 3000, // 3 seconds for full rotation
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulse opacity every few seconds
    lightOpacity.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true // reverse
    );
  }, []);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.96, { damping: 18, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const lightAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      lightOpacity.value,
      [0, 0.5, 1],
      [0.3, 0.8, 0.3]
    );
    return {
      opacity,
      transform: [{ rotate: `${lightRotation.value}deg` }],
    };
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 10, paddingHorizontal: 16, minHeight: 36 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 32, minHeight: 56 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24, minHeight: 44 };
    }
  };

  const getVariantStyles = () => {
    // App-wide palette: dark blue foundation with white accents (textured/embossed feel)
    const baseBg = '#101628';
    const accentColor = '#EAF2FF'; // soft white accent (keep within ~20-25% white)
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: baseBg,
          borderColor: 'rgba(255, 255, 255, 0.12)',
          accentColor,
        };
      case 'secondary':
        return {
          backgroundColor: '#151B38',
          borderColor: 'rgba(255, 255, 255, 0.10)',
          accentColor: '#1B4EDA', // subtle blue accent
        };
      case 'tertiary':
        return {
          backgroundColor: '#0A0E27',
          borderColor: 'rgba(255, 255, 255, 0.10)',
          accentColor: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: baseBg,
          borderColor: 'rgba(255, 255, 255, 0.12)',
          accentColor,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Rotating light effect - creates a glowing border that rotates
  const RotatingLight = () => {
    const borderRadius = 16;
    
    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: borderRadius + 2,
            margin: -2,
            overflow: 'hidden',
          },
          lightAnimatedStyle,
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            variantStyles.accentColor + '00',
            variantStyles.accentColor + 'FF',
            variantStyles.accentColor + '00',
            variantStyles.accentColor + 'FF',
            variantStyles.accentColor + '00',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    );
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
      testID={testID}
    >
      <View
        style={[
          styles.button,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            ...sizeStyles,
          },
        ]}
      >
        {/* Rotating light border effect */}
        <RotatingLight />

        {/* Shimmer shine effect */}
        <ShimmerEffect
          width="100%"
          height="100%"
          borderRadius={16}
          colors={['transparent', 'rgba(255, 255, 255, 0.06)', 'transparent']}
          speed={5200}
        />

        {/* Top highlight for shine */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.4 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
        />

        {/* Neumorphic shadows - inner and outer */}
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.neumorphicShadow,
            {
              shadowColor: '#000',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            },
          ]}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.neumorphicHighlight,
            {
              shadowColor: '#FFF',
              shadowOffset: { width: -2, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
          ]}
        />

        {/* Content */}
        <View style={[styles.content, { zIndex: 1 }]}>
          {children || (
            <>
              {Logo && <Logo size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />}
              {Icon && (
                <Icon
                  size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
                  stroke={variantStyles.accentColor}
                  strokeWidth={2}
                />
              )}
              {title && (
                <Text
                  style={[
                    styles.text,
                    {
                      color: variantStyles.accentColor,
                      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
                    },
                    textStyle,
                  ]}
                >
                  {title}
                </Text>
              )}
            </>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neumorphicShadow: {
    borderRadius: 16,
    position: 'absolute',
  },
  neumorphicHighlight: {
    borderRadius: 16,
    position: 'absolute',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '500',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    letterSpacing: 0.3,
  },
});







