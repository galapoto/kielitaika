import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
// Network detection - simplified version that works without expo-network
// In production, install: expo install expo-network
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * NetworkStatus - Shows network connection status
 */
export default function NetworkStatus({ 
  showWhenOnline = false, // Only show when offline by default
  position = 'top', // 'top' or 'bottom'
}) {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Simple network check via fetch
    const checkNetwork = async () => {
      try {
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
        });
        setIsConnected(true);
        setConnectionType('online');
      } catch (e) {
        setIsConnected(false);
        setConnectionType('offline');
      }
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000); // Check every 5 seconds

    // Animate based on visibility preference
    if (!isConnected || showWhenOnline) {
      opacity.value = withSpring(1, { damping: 15 });
      translateY.value = withSpring(0, { damping: 15 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(position === 'top' ? -100 : 100, { duration: 200 });
    }

    return () => clearInterval(interval);
  }, [showWhenOnline, position, isConnected]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (isConnected && !showWhenOnline) {
    return null;
  }

  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        message: 'No internet connection',
        backgroundColor: colors.error,
        icon: '📡',
      };
    }
    
    return {
      message: connectionType === 'wifi' 
        ? 'Connected to Wi-Fi' 
        : `Connected via ${connectionType}`,
      backgroundColor: colors.success,
      icon: '✓',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <AnimatedView
      style={[
        styles.container,
        position === 'top' ? styles.top : styles.bottom,
        animatedStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={statusInfo.message}
    >
      <View style={[styles.banner, { backgroundColor: statusInfo.backgroundColor }]}>
        <Text style={styles.icon}>{statusInfo.icon}</Text>
        <Text style={styles.message}>{statusInfo.message}</Text>
      </View>
    </AnimatedView>
  );
}

/**
 * Hook to check network status
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const start = Date.now();
        await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
        });
        const duration = Date.now() - start;
        setIsConnected(true);
        setConnectionType('online');
        setIsSlowConnection(duration > 2000); // Consider slow if > 2s
      } catch (e) {
        setIsConnected(false);
        setConnectionType('offline');
        setIsSlowConnection(false);
      }
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    connectionType,
    isSlowConnection,
    isOffline: !isConnected,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9998,
    paddingHorizontal: spacing.m,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 0,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  message: {
    ...typography.bodySm,
    color: colors.white,
    fontWeight: '500',
  },
});






























