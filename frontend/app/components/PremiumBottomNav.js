/**
 * PremiumBottomNav - Bottom navigation bar with premium brown embossed design
 * Matches the strategic plan requirements: Home, Practice, Progress, Profile
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useNavigationState } from '@react-navigation/native';

const PREMIUM_BROWN = {
  darkest: '#1A0F0A',
  dark: '#2A1F16',
  medium: '#3A2A1E',
  light: '#4A3A2E',
  highlight: 'rgba(255, 255, 255, 0.15)',
  shadow: 'rgba(0, 0, 0, 0.4)',
};

// Safety check to ensure PREMIUM_BROWN is defined
// Check PREMIUM_BROWN first to avoid accessing .medium on undefined
if (!PREMIUM_BROWN) {
  console.error('[PremiumBottomNav] PREMIUM_BROWN is undefined!');
} else if (!PREMIUM_BROWN.medium) {
  console.error('[PremiumBottomNav] PREMIUM_BROWN.medium is undefined!');
}

const NAV_ITEMS = [
  { id: 'Home', label: 'Home', icon: '🏠', route: 'Home' },
  { id: 'Practice', label: 'Practice', icon: '💬', route: 'Conversation' },
  { id: 'Progress', label: 'Progress', icon: '📊', route: 'Progress' },
  { id: 'Profile', label: 'Profile', icon: '👤', route: 'Settings' },
];

export default function PremiumBottomNav() {
  const navigation = useNavigation();
  
  // Safely get current route using navigation state
  const routeState = useNavigationState((state) => state);
  const currentRoute = routeState?.routes?.[routeState?.index]?.name;

  const handlePress = (item) => {
    if (item.route && navigation) {
      navigation.navigate(item.route);
    }
  };

  return (
    <View style={styles.container}>
      {/* Outer shadow layer */}
      <View style={styles.outerShadow} />
      
      {/* Main nav bar with gradient */}
      <LinearGradient
        colors={[PREMIUM_BROWN?.darkest || '#1A0F0A', PREMIUM_BROWN?.dark || '#2A1F16', PREMIUM_BROWN?.medium || '#3A2A1E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.navBar}
      >
        {/* Inner highlight (top) */}
        <View style={styles.innerHighlight} />
        
        {/* Inner shadow (bottom) */}
        <View style={styles.innerShadow} />
        
        {/* Nav items */}
        <View style={styles.navItems}>
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.route || 
                           (item.route === 'Home' && currentRoute === 'Home') ||
                           (item.route === 'Settings' && currentRoute === 'Settings') ||
                           (item.route === 'Progress' && currentRoute === 'Progress') ||
                           (item.route === 'Conversation' && currentRoute === 'Conversation');
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                  {item.icon}
                </Text>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 70,
    paddingBottom: 8,
  },
  outerShadow: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    bottom: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    zIndex: -1,
  },
  navBar: {
    flex: 1,
    borderRadius: 16,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: PREMIUM_BROWN?.highlight || 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  innerShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: PREMIUM_BROWN?.shadow || 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  navItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  navItemActive: {
    // Active state styling
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 2,
    opacity: 0.7,
  },
  navIconActive: {
    fontSize: 26,
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    opacity: 0.8,
  },
});





















