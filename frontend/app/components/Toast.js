import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * Toast component - Replaces Alert.alert with beautiful toast notifications
 */
export default function Toast({ 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  duration = 3000,
  onClose,
  visible = true,
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-100);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      opacity.value = withSpring(1, { damping: 15 });
      translateY.value = withSpring(0, { damping: 15 });
      
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          handleClose();
        }, duration);
      }
    } else {
      handleClose();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration]);

  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-100, { duration: 200 }, () => {
      if (onClose) {
        runOnJS(onClose)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.blueMain,
          icon: '✓',
        };
      case 'error':
        return {
          backgroundColor: colors.blueMain,
          icon: '✕',
        };
      case 'warning':
        return {
          backgroundColor: colors.blueMain,
          icon: '⚠',
        };
      default:
        return {
          backgroundColor: colors.blueMain,
          icon: 'ℹ',
        };
    }
  };

  const typeStyles = getTypeStyles();

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <AnimatedView
      style={[styles.container, animatedStyle]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.toast, { backgroundColor: typeStyles.backgroundColor }]}>
        <Text style={styles.icon}>{typeStyles.icon}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </AnimatedView>
  );
}

/**
 * Toast Provider - Manages toast state globally
 */
export function useToast() {
  const [toast, setToast] = React.useState(null);

  const showToast = React.useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration, visible: true });
  }, []);

  const hideToast = React.useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: (message, duration) => showToast(message, 'success', duration),
    showError: (message, duration) => showToast(message, 'error', duration),
    showWarning: (message, duration) => showToast(message, 'warning', duration),
    showInfo: (message, duration) => showToast(message, 'info', duration),
  };
}

/**
 * ToastContainer - Renders toast at app level
 */
export function ToastContainer({ toast, onClose }) {
  if (!toast) return null;

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      visible={toast.visible}
      onClose={onClose}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.l,
    right: spacing.l,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderRadius: radius.l,
    minHeight: 48,
    maxWidth: '100%',
    ...shadows.l,
  },
  icon: {
    fontSize: 20,
    color: colors.white,
    marginRight: spacing.s,
    fontWeight: 'bold',
  },
  message: {
    ...typography.body,
    color: colors.white,
    flex: 1,
    fontWeight: '500',
  },
});








