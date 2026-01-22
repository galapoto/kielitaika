import React, { useState } from 'react';
import { Pressable, Text, View, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { theme } from '../themes/theme';
import ParticleEffect from '../../components/background/layers/ParticleEffect';

type IconComponent = React.ComponentType<{ size?: number; stroke?: string; strokeWidth?: number }>;
type LogoComponent = React.ComponentType<{ size?: number }>;

type RukaButtonProps = {
  title: string;
  onPress?: () => void;
  icon?: IconComponent;
  logo?: LogoComponent;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
};

/**
 * Glassy button with neon edge glow and spring press response.
 */
export default function RukaButton({ title, onPress, icon: Icon, logo: Logo, disabled = false, style, textStyle, testID }: RukaButtonProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const [particleTrigger, setParticleTrigger] = useState(false);
  const [particleSource] = useState(() => {
    try {
      return require('../../assets/animations/login/login_particles.json');
    } catch (e) {
      return null;
    }
  });

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 12, stiffness: 220 });
    glow.value = withSpring(1, { damping: 14, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 220 });
    glow.value = withSpring(0, { damping: 16, stiffness: 240 });
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      if (particleSource) {
        setParticleTrigger(true);
        setTimeout(() => setParticleTrigger(false), 100);
      }
      onPress();
    }
  };

  // Removed glowStyle - no shadows wanted

  return (
    <Animated.View style={[{ borderRadius: 14, overflow: 'visible' }, animated, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        testID={testID}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        <View
          style={{
            paddingVertical: 15,
            paddingHorizontal: 24,
            backgroundColor: '#101628', // Completely solid - no transparency, no holes
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            // No shadows - clean design
            overflow: 'hidden',
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
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              pointerEvents: 'none',
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 1 }}>
            {Logo && <Logo size={20} />}
            {Icon && <Icon size={20} stroke="#FFFFFF" strokeWidth={2} />}
            <Text style={[{ 
              color: '#FFFFFF',
              fontSize: 16, 
              fontWeight: '500',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              letterSpacing: 0,
            }, textStyle]}>{title}</Text>
          </View>
        </View>
      </Pressable>
      {particleSource && (
        <ParticleEffect 
          trigger={particleTrigger} 
          source={particleSource}
          opacity={0.6}
        />
      )}
    </Animated.View>
  );
}
