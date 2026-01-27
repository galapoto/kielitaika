/**
 * CustomDrawerContent - Custom sidebar drawer with profile, navigation, theme toggle, and logout
 * 
 * Design based on attachments:
 * - Profile picture at top with user name and email
 * - Navigation links with beautiful icons
 * - Dark/Light mode toggle at bottom
 * - Logout button at bottom
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProfileImage from './ProfileImage';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

export default function CustomDrawerContent(props) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { navigation, state } = props;

  const handleLogout = () => {
    logout();
    navigation.closeDrawer();
  };

  const handleProfilePress = () => {
    navigation.navigate('Settings');
    navigation.closeDrawer();
  };

  const navigationItems = [
    {
      name: 'Home',
      label: 'Koti',
      icon: 'home-outline',
      screen: 'Home',
      active: state.routes[state.index]?.name === 'Home',
    },
    {
      name: 'YKIPlan',
      label: 'YKI-suunnitelma',
      icon: 'school-outline',
      screen: 'YKIPlan',
      active: state.routes[state.index]?.name === 'YKIPlan',
    },
    {
      name: 'WorkPlan',
      label: 'Työvalmius-suunnitelma',
      icon: 'briefcase-outline',
      screen: 'WorkPlan',
      active: state.routes[state.index]?.name === 'WorkPlan',
    },
    {
      name: 'Practice',
      label: 'Harjoittelu',
      icon: 'fitness-outline',
      screen: 'Practice',
      active: state.routes[state.index]?.name === 'Practice',
    },
    {
      name: 'Speaking',
      label: 'Puhuminen',
      icon: 'mic-outline',
      screen: 'Conversation',
      active: state.routes[state.index]?.name === 'Conversation',
    },
    {
      name: 'Settings',
      label: 'Asetukset',
      icon: 'settings-outline',
      screen: 'Settings',
      active: state.routes[state.index]?.name === 'Settings',
    },
  ];

  const handleNavigate = (screenName) => {
    navigation.navigate(screenName);
    navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <TouchableOpacity style={styles.profileSection} onPress={handleProfilePress} activeOpacity={0.7}>
          <ProfileImage size={60} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || user?.email || 'Käyttäjä'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Navigation Links */}
        <View style={styles.navigationSection}>
          {navigationItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, item.active && styles.navItemActive]}
              onPress={() => handleNavigate(item.screen)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon}
                size={24}
                color={item.active ? '#7dd3fc' : '#94a3b8'}
                style={styles.navIcon}
              />
              <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Bottom Section - Theme Toggle and Logout */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.themeToggle}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color="#94a3b8"
            style={styles.navIcon}
          />
          <Text style={styles.navLabel}>{isDark ? 'Vaalea tila' : 'Tumma tila'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color="#ef4444"
            style={styles.navIcon}
          />
          <Text style={styles.logoutLabel}>Kirjaudu ulos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing['3xl'],
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    gap: spacing.m,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: '#f8fafc',
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...typography.bodySm,
    color: '#94a3b8',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginHorizontal: spacing.l,
    marginVertical: spacing.m,
  },
  navigationSection: {
    paddingHorizontal: spacing.m,
    gap: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderRadius: 12,
    gap: spacing.m,
  },
  navItemActive: {
    backgroundColor: 'rgba(125, 211, 252, 0.1)',
  },
  navIcon: {
    width: 24,
    textAlign: 'center',
  },
  navLabel: {
    ...typography.body,
    color: '#94a3b8',
    flex: 1,
  },
  navLabelActive: {
    color: '#7dd3fc',
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    gap: spacing.xs,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderRadius: 12,
    gap: spacing.m,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderRadius: 12,
    gap: spacing.m,
  },
  logoutLabel: {
    ...typography.body,
    color: '#ef4444',
    flex: 1,
  },
});
