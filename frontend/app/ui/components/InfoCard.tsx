/**
 * InfoCard - Small compact info card component
 * 
 * Based on image 7 design:
 * - Small horizontal rectangle with rounded corners
 * - Dark grey background
 * - Icon on left (circular with colored background)
 * - Text in middle (title and description)
 * - Value on right
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type IconComponent = React.ComponentType<{ size?: number; stroke?: string; strokeWidth?: number; fill?: string }>;

interface InfoCardProps {
  icon?: IconComponent;
  iconBackgroundColor?: string;
  title: string;
  description?: string;
  value?: string;
  valueColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export default function InfoCard({
  icon: Icon,
  iconBackgroundColor = '#4C3F8B',
  title,
  description,
  value,
  valueColor = '#FFFFFF',
  onPress,
  style,
  testID,
}: InfoCardProps) {
  return (
    <View
      style={[styles.card, style]}
      testID={testID}
      onStartShouldSetResponder={() => !!onPress}
      onResponderRelease={onPress}
    >
      {/* Icon */}
      {Icon && (
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
          <Icon size={24} stroke="#FFFFFF" strokeWidth={2} />
        </View>
      )}

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      {/* Value */}
      {value && (
        <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292437',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    minHeight: 60,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    flexShrink: 0,
  },
});





























