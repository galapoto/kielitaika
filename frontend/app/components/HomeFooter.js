import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeFooter() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const goHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return (
    <View
      style={[styles.footerContainer, { paddingBottom: insets.bottom + 8 }]}
      pointerEvents="box-none"
    >
      <TouchableOpacity style={styles.homeButton} onPress={goHome} activeOpacity={0.8}>
        <Text style={styles.buttonLabel}>Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  homeButton: {
    backgroundColor: '#1f4eda',
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 10,
    shadowColor: '#1f4eda',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
