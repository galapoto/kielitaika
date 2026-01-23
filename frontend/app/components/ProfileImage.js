import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable ProfileImage component that displays user's profile picture
 * Falls back to emoji if no picture is set
 */
export default function ProfileImage({ 
  size = 40, 
  style, 
  onPress,
  showDefault = true 
}) {
  const { user } = useAuth();
  const profilePictureUrl = user?.profile_picture_url || user?.profilePictureUrl;
  
  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style
  ];

  if (profilePictureUrl) {
    return (
      <TouchableOpacity 
        style={containerStyle} 
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <Image 
          source={{ uri: profilePictureUrl }} 
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  // Fallback to emoji
  if (showDefault) {
    return (
      <TouchableOpacity 
        style={containerStyle} 
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>👤</Text>
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    textAlign: 'center',
  },
});
