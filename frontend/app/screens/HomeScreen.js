/**
 * HomeScreen - Reorganized with logical structure
 * 
 * Structure:
 * 1. General Finnish (limited features)
 * 2. Workplace Finnish (all professions + Others)
 * 3. YKI Exam Preparation (Practice + Mock Exam)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Background from '../components/ui/Background';
import { useAuth } from '../context/AuthContext';
import { fetchSrsQueue } from '../utils/api';
import ProfileImage from '../components/ProfileImage';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import HomeButton from '../components/HomeButton';
import FloatingActionButton from '../components/FloatingActionButton';
import SearchBar from '../components/SearchBar';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';
import { useAnalytics } from '../hooks/useAnalytics';
import { colors as palette } from '../styles/colors';
import RukaCard from '../components/ui/RukaCard';
import OfflineIndicator from '../components/OfflineIndicator';
import { PREMIUM_BROWN } from '../styles/premiumPalette';

const QUICK_ACTION_TYPE_MAP = {
  Practice: 'speaking',
  Review: 'listening',
  Quiz: 'reading',
  Notes: 'writing',
  Resources: 'grammar',
  Assessment: 'speaking',
};

const GENERAL_FINNISH_OPTIONS = [
  { id: 'grammar', icon: '📝', label: 'Grammar' },
  { id: 'listening', icon: '👂', label: 'Listening' },
  { id: 'reading', icon: '📖', label: 'Reading' },
  { id: 'writing', icon: '✍️', label: 'Writing' },
  { id: 'speaking', icon: '🎤', label: 'Speaking' },
];

const PROFESSIONS = [
  { id: 'sairaanhoitaja', icon: '👩‍⚕️', label: 'Nurse' },
  { id: 'laakari', icon: '👨‍⚕️', label: 'Doctor' },
  { id: 'ict', icon: '💻', label: 'ICT / Software' },
  { id: 'sahkoinsinoori', icon: '⚡', label: 'Electrical Engineer' },
  { id: 'hoiva-avustaja', icon: '🤝', label: 'Care Assistant' },
  { id: 'rakennus', icon: '🏗️', label: 'Construction' },
  { id: 'siivous', icon: '🧹', label: 'Cleaning' },
  { id: 'logistiikka', icon: '🚚', label: 'Logistics' },
  { id: 'ravintola', icon: '🍽️', label: 'Restaurant/Hotel' },
  { id: 'myynti', icon: '🛒', label: 'Sales' },
  { id: 'varhaiskasvatus', icon: '👶', label: 'Early Childhood Education' },
  { id: 'others', icon: '➕', label: 'Others' },
];

const YKI_PRACTICE_OPTIONS = [
  { id: 'yki_reading', icon: '📖', label: 'Practice YKI Reading' },
  { id: 'yki_speaking', icon: '🎤', label: 'Practice YKI Speaking' },
  { id: 'yki_writing', icon: '✍️', label: 'Practice YKI Writing' },
  { id: 'yki_listening', icon: '👂', label: 'Practice YKI Listening' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { trackScreen, trackInteraction } = useAnalytics();
  const subscription = useSubscriptionStatus() || {};
  const {
    tier = 'free',
    features = {},
    loading: subscriptionLoading = false,
    hasAccess: hasAccessFromSubscription,
    requiresUpgrade: requiresUpgradeFromSubscription,
  } = subscription;
  const [snackItems, setSnackItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [streak, setStreak] = useState(0);
  const [xpToday, setXpToday] = useState(0);
  const hasFeatureAccess = (feature) => features?.[feature]?.available !== false;
  const requiresFeatureUpgrade = (feature) => features?.[feature]?.available === false;
  // Back-compat: some older codepaths expect these names.
  const hasAccess = hasAccessFromSubscription || hasFeatureAccess;
  const requiresUpgrade = requiresUpgradeFromSubscription || requiresFeatureUpgrade;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchSrsQueue([], null, 5);
        if (mounted) {
          const items = res?.items || res || [];
          setSnackItems(items);
        }
      } catch (err) {
        console.warn('HomeScreen: Failed to load vocab snack:', err?.message || err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Track screen view
  useEffect(() => {
    trackScreen?.('HomeScreen', { user_id: user?.id });
  }, [trackScreen, user?.id]);

  // Load streak and XP data
  useEffect(() => {
    // TODO: Load from API or storage
    // For now, use mock data
    setStreak(7);
    setXpToday(125);
  }, []);

  const handleGeneralFinnishPress = (optionId) => {
    if (optionId === 'speaking') {
      navigation?.navigate('GuidedTurn', {
        source: 'general_finnish',
        entrypoint: 'home_general_finnish',
      });
      return;
    }
    navigation?.navigate('LessonDetail', { type: optionId });
  };

  const handleWorkplacePress = (professionId) => {
    const professionMeta = PROFESSIONS.find((p) => p.id === professionId);
    trackInteraction?.('tap', `workplace_${professionId}`, { profession: professionId });
    if (requiresFeatureUpgrade('workplace')) {
      showUpgradePrompt('workplace');
      return;
    }
    
    if (professionId === 'others') {
      navigation?.navigate('Workplace', { profession: 'others' });
    } else {
      navigation?.navigate('ProfessionDetail', {
        field: professionId,
        fieldName: professionMeta?.label || professionId,
      });
    }
  };

  const handleYKIPracticePress = (practiceId) => {
    trackInteraction?.('tap', `yki_practice_${practiceId}`, { practice: practiceId });
    // Navigate to specific YKI practice screen
    const screenMap = {
      'yki_reading': 'YKIPracticeReading',
      'yki_speaking': 'YKIPracticeSpeaking',
      'yki_writing': 'YKIPracticeWriting',
      'yki_listening': 'YKIPracticeListening',
    };
    const screenName = screenMap[practiceId];
    if (screenName) {
      navigation?.navigate(screenName);
    }
  };

  const handleYKIMockExamPress = () => {
    trackInteraction?.('tap', 'yki_mock_exam', {});
    navigation?.navigate('YKI');
  };

  const showUpgradePrompt = (feature) => {
    trackInteraction?.('tap', 'upgrade_prompt_shown', { feature });
    Alert.alert(
      'Upgrade required',
      `The ${feature} module requires a higher tier. Please upgrade to continue.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => trackInteraction?.('tap', 'upgrade_cancelled', { feature })
        },
        { 
          text: 'Upgrade', 
          onPress: () => {
            trackInteraction?.('tap', 'upgrade_clicked', { feature });
            navigation?.navigate('Subscription');
          }
        },
      ]
    );
  };

  const handleQuickAction = (action) => {
    trackInteraction?.('tap', `quick_action_${action}`, { action });
    const type = QUICK_ACTION_TYPE_MAP[action] || 'grammar';
    navigation?.navigate('LessonDetail', { type, title: action });
  };

  const handleSearch = (query) => {
    trackInteraction?.('search', 'home_search', { query });
    setSearchQuery(query);
    // Search service is integrated in SearchBar component
  };

  return (
    <Background module="home" variant="brown" imageVariant="home">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.settingsIcon}
            onPress={() => navigation?.navigate('Settings')}
          >
            <Text style={styles.settingsIconText}>⚙️</Text>
          </TouchableOpacity>
          <View style={styles.profileSection}>
            <ProfileImage size={50} />
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <HomeButton navigation={navigation} style={styles.homeButton} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Summary Card */}
          <RukaCard style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakText}>{streak} day streak</Text>
              </View>
            </View>
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{xpToday}</Text>
                <Text style={styles.statLabel}>XP Today</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{snackItems.length}</Text>
                <Text style={styles.statLabel}>Words to Review</Text>
              </View>
            </View>
          </RukaCard>

          {/* Search Bar */}
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search lessons, vocabulary, grammar..."
          />

          {/* General Finnish Section */}
          <RukaCard style={[styles.section, styles.sectionCard]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🌱</Text>
              <Text style={styles.sectionTitle}>General Finnish</Text>
              {hasFeatureAccess('general_finnish') && (
                <View style={styles.accessBadge}>
                  <Text style={styles.accessBadgeText}>✅</Text>
                </View>
              )}
            </View>
            {features.general_finnish?.message && (
              <Text style={styles.sectionNote}>
                {features.general_finnish.message}
              </Text>
            )}
            <View style={styles.optionsGrid}>
              {GENERAL_FINNISH_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionCard}
                  onPress={() => handleGeneralFinnishPress(option.id)}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </RukaCard>

          {/* Workplace Finnish Section */}
          <RukaCard style={[styles.sectionCard, styles.section]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💼</Text>
              <Text style={styles.sectionTitle}>Workplace Finnish</Text>
            </View>
            <View style={styles.optionsGrid}>
              {PROFESSIONS.map((profession) => (
                <TouchableOpacity
                  key={profession.id}
                  style={styles.optionCard}
                  onPress={() => handleWorkplacePress(profession.id)}
                >
                  <Text style={styles.optionIcon}>{profession.icon}</Text>
                  <Text style={styles.optionLabel}>{profession.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </RukaCard>

          {/* YKI Exam Preparation Section */}
          <RukaCard style={[styles.sectionCard, styles.section, requiresFeatureUpgrade('yki') && styles.sectionLocked]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🎓</Text>
              <Text style={styles.sectionTitle}>YKI Exam Preparation</Text>
              {requiresFeatureUpgrade('yki') ? (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockBadgeText}>🔒</Text>
                </View>
              ) : (
                <View style={styles.accessBadge}>
                  <Text style={styles.accessBadgeText}>✅</Text>
                </View>
              )}
            </View>
            {requiresFeatureUpgrade('yki') ? (
              <View style={styles.upgradePrompt}>
                <Text style={styles.upgradePromptText}>
                  Requires Professional Premium subscription
                </Text>
                <PremiumEmbossedButton
                  title="Upgrade to Unlock"
                  onPress={() => navigation?.navigate('Subscription')}
                  variant="primary"
                  size="medium"
                  style={styles.upgradeButton}
                />
              </View>
            ) : (
              features.yki?.message && (
                <Text style={styles.sectionNote}>
                  {features.yki.message}
                </Text>
              )
            )}
            
            {/* YKI Practice */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>YKI Practice</Text>
              <View style={[styles.practiceList, requiresFeatureUpgrade('yki') && styles.practiceListLocked]}>
                {YKI_PRACTICE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.practiceItem, requiresFeatureUpgrade('yki') && styles.practiceItemLocked]}
                    onPress={() => handleYKIPracticePress(option.id)}
                    disabled={subscriptionLoading || requiresFeatureUpgrade('yki')}
                  >
                    <Text style={styles.practiceIcon}>{option.icon}</Text>
                    <Text style={[styles.practiceLabel, requiresFeatureUpgrade('yki') && styles.practiceLabelLocked]}>
                      {option.label}
                    </Text>
                    <Text style={styles.practiceArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* YKI Mock Exam */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>YKI Mock Exam</Text>
              <PremiumEmbossedButton
                title={requiresFeatureUpgrade('yki') ? "Upgrade to Unlock" : "Generate Full Exam"}
                onPress={handleYKIMockExamPress}
                variant={requiresFeatureUpgrade('yki') ? "secondary" : "primary"}
                size="large"
                style={styles.mockExamButton}
              />
            </View>
          </RukaCard>
        </ScrollView>
        <OfflineIndicator />
        <FloatingActionButton />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsIcon: {
    padding: 8,
  },
  settingsIconText: {
    fontSize: 20,
    color: PREMIUM_BROWN?.white || palette?.textPrimary || '#F8F9FA',
  },
  profileSection: {
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: PREMIUM_BROWN?.white || palette?.textPrimary || '#F8F9FA',
    marginTop: 8,
  },
  homeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: PREMIUM_BROWN?.white || palette?.textPrimary || '#F8F9FA',
  },
  sectionNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: PREMIUM_BROWN?.medium || palette?.backgroundSecondary || '#2D2418',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    // Embossed effect
    shadowColor: '#000000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PREMIUM_BROWN?.white || palette?.textPrimary || '#F8F9FA',
    textAlign: 'center',
  },
  subsection: {
    marginTop: 16,
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PREMIUM_BROWN?.white || palette?.textPrimary || '#F8F9FA',
    marginBottom: 12,
  },
  practiceList: {
    gap: 12,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PREMIUM_BROWN?.medium || palette?.backgroundSecondary || '#2D2418',
    borderRadius: 12,
    padding: 16,
    // Embossed effect
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  practiceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  practiceLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: PREMIUM_BROWN?.white || palette?.textPrimary || '#F8F9FA',
  },
  practiceArrow: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
  },
  mockExamButton: {
    width: '100%',
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PREMIUM_BROWN?.white || palette?.textPrimary || '#F8F9FA',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 34, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.3)',
  },
  streakIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5722',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: PREMIUM_BROWN?.white || palette?.textPrimary || '#F8F9FA',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  // Subscription status indicators
  accessBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  accessBadgeText: {
    fontSize: 12,
  },
  lockBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.4)',
  },
  lockBadgeText: {
    fontSize: 12,
  },
  // Locked section styles
  sectionLocked: {
    opacity: 0.85,
  },
  upgradePrompt: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    alignItems: 'center',
  },
  upgradePromptText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  upgradeButton: {
    width: '100%',
    maxWidth: 250,
  },
  optionsGridLocked: {
    opacity: 0.6,
  },
  optionCardLocked: {
    backgroundColor: 'rgba(58, 42, 30, 0.5)',
  },
  optionLabelLocked: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  practiceListLocked: {
    opacity: 0.6,
  },
  practiceItemLocked: {
    backgroundColor: 'rgba(58, 42, 30, 0.5)',
  },
  practiceLabelLocked: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
