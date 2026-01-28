import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';
import { useAuth } from '../context/AuthContext';
import ProfileImage from '../components/ProfileImage';
import HomeButton from '../components/HomeButton';
import { Ionicons } from '@expo/vector-icons';
import { colors as palette } from '../styles/colors';
import { designTokens } from '../styles/designTokens';
import RukaCard from '../components/ui/RukaCard';

const MODULES = [
  { id: 'Vocabulary', labelFi: 'Sanasto', type: 'vocabulary', descriptionFi: 'Harjoittele keskeistä sanastoa' },
  { id: 'Listening', labelFi: 'Kuuntelu', type: 'listening', descriptionFi: 'Virittäydy kuuntelemaan' },
  { id: 'Roleplay', labelFi: 'Roolipeli', screen: 'Roleplay', descriptionFi: 'Harjoittele työtilanteen dialogia' },
  { id: 'Grammar', labelFi: 'Kielioppi', type: 'grammar', descriptionFi: 'Hallitse rakenteet' },
  { id: 'Review', labelFi: 'Kertaus', type: 'review', descriptionFi: 'Kertaa ammattialan sisältöä' },
  { id: 'Quiz', labelFi: 'Koe', type: 'reading', descriptionFi: 'Testaa ymmärtäminen' },
  { id: 'Resources', labelFi: 'Materiaalit', type: 'grammar', descriptionFi: 'Lisämateriaalit' },
];

const MODULE_ICONS = {
  Vocabulary: 'book-outline',
  Listening: 'headset',
  Roleplay: 'chatbubble-ellipses',
  Grammar: 'text',
  Practice: 'mic-outline',
  Review: 'refresh-circle',
  Dashboard: 'stats-chart',
  Quiz: 'help-circle',
  Notes: 'create-outline',
  Resources: 'library-outline',
  Assessment: 'analytics-outline',
};

const { typography = {}, spacing = {}, textColor = {} } = designTokens || {};

export default function ProfessionDetailScreen({ route, navigation } = {}) {
  const { user } = useAuth();
  const field = route?.params?.field || route?.params?.professionId || route?.params?.professionId;
  const fieldName = route?.params?.fieldName || 'Ammatti';
  const profession = route?.params?.profession || { title: fieldName, description: 'Opiskele ammattikohtaista suomea' };
  if (!user) {
    return (
      <View style={styles.authGuard}>
        <Text style={styles.authGuardText}>Kirjaudu sisään jatkaaksesi.</Text>
      </View>
    );
  }
  const handleModulePress = (module) => {
    if (module.screen === 'Roleplay') {
      navigation?.navigate('Roleplay', { field, fieldName });
      return;
    }

    if (module.id === 'Vocabulary') {
      navigation?.navigate('Vocabulary', { path: 'workplace', field });
      return;
    }

    if (module.id === 'Quiz') {
      navigation?.navigate('Quiz', {
        path: 'workplace',
        field,
        sourceType: module.type || 'reading',
        level: module.level || 'B1',
        type: module.type || 'reading',
      });
      return;
    }

    navigation?.navigate('LessonDetail', {
      type: module.type || 'grammar',
      level: module.level || 'B1',
      path: 'workplace',
      field,
      professionLabel: fieldName,
      title: module.id,
    });
  };

  // Combine all designs: Header from 2nd picture, Flight booking cards from 6th picture, Schedule from 3rd picture
  return (
    <Background module="workplace" variant="brown" imageVariant="workplace">
      <View style={styles.container}>
      {/* Header - Dark Blue/Purple from 6th picture */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => {
              if (navigation?.canGoBack?.() && navigation.canGoBack()) navigation.goBack();
              else navigation?.navigate?.('Home');
            }}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <ProfileImage size={40} />
          <Text style={styles.headerGreeting}>{fieldName}</Text>
        </View>
        <HomeButton navigation={navigation} style={styles.homeButtonHeader} homeType="workplace" />
      </View>

      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Securely Learn {fieldName}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profession Info Card - Flight Booking Style from 6th picture */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardLeft}>
            <Text style={styles.infoCardTitle}>{profession.title || fieldName}</Text>
            <Text style={styles.infoCardDescription}>{profession.description || 'Työelämän suomen harjoittelua'}</Text>
          </View>
        </View>

        {/* Learning Modules - Card Grid from 2nd picture */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Oppimismoduulit</Text>
          <View style={styles.modulesGrid}>
            {MODULES.map((module) => (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => handleModulePress(module)}
                activeOpacity={0.85}
              >
                <RukaCard style={styles.moduleInnerCard}>
                  <View style={styles.moduleIconWrapper}>
                    <Ionicons
                      name={MODULE_ICONS[module.id] || 'sparkles'}
                      size={28}
                      color={palette.accentPrimary}
                    />
                  </View>
                  <Text style={styles.moduleLabel}>{module.labelFi || module.id}</Text>
                  {(module.descriptionFi || module.description) && (
                    <Text style={styles.moduleDescription}>{module.descriptionFi || module.description}</Text>
                  )}
                </RukaCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Removed placeholder bottom navigation */}
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  authGuard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 24,
  },
  authGuardText: {
    color: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  homeButtonHeader: {
    marginLeft: 'auto',
  },
  header: {
    backgroundColor: palette.accentSecondary,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing?.sm || 8,
  },
  backIcon: {
    fontSize: 20,
    color: textColor?.primary || palette.textPrimary,
  },
  headerGreeting: {
    fontSize: typography.scale.body.size,
    fontWeight: typography.scale.body.weight,
    color: textColor?.primary || palette.textPrimary,
    marginLeft: spacing.sm,
    fontFamily: typography.fontFamily,
  },
  titleSection: {
    backgroundColor: palette.backgroundSecondary,
    paddingHorizontal: spacing?.lg || 24,
    paddingTop: spacing?.lg || 24,
    paddingBottom: spacing?.md || 16,
  },
  mainTitle: {
    fontSize: typography?.scale?.hero?.size || 32,
    fontWeight: typography?.scale?.hero?.weight || '700',
    color: textColor?.primary || palette.textPrimary,
    fontFamily: designTokens?.typography?.displayFont || 'Inter',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing?.lg || 24,
    paddingBottom: 140,
  },
  infoCard: {
    backgroundColor: palette.surface,
    borderRadius: designTokens?.borderRadius?.lg || 16,
    padding: spacing?.lg || 24,
    marginBottom: spacing?.xl || 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.divider,
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  infoCardLeft: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: typography?.scale?.body?.weight || '400',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.xs || 4,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  infoCardDescription: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
    marginBottom: spacing?.xs || 4,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  infoCardProgress: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.muted || palette.textMuted,
  },
  infoCardRight: {
    alignItems: 'flex-end',
  },
  infoCardTime: {
    fontSize: typography?.scale?.h3?.size || 20,
    fontWeight: typography?.scale?.h3?.weight || '600',
    color: palette.accentPrimary,
  },
  modulesSection: {
    marginBottom: spacing?.xl || 32,
  },
  sectionTitle: {
    fontSize: typography?.scale?.h3?.size || 20,
    fontWeight: typography?.scale?.h3?.weight || '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.md || 16,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    width: '48%',
    marginBottom: spacing?.lg || 24,
  },
  moduleInnerCard: {
    alignItems: 'center',
    paddingVertical: spacing?.md || 16,
  },
  moduleIconWrapper: {
    marginBottom: spacing?.sm || 8,
  },
  moduleLabel: {
    fontSize: typography.scale.body.size,
    fontWeight: typography.scale.body.weight,
    color: textColor?.primary || palette.textPrimary,
    textAlign: 'center',
  },
  moduleDescription: {
    fontSize: typography.scale.small.size,
    fontWeight: typography.scale.small.weight,
    color: textColor.secondary,
    textAlign: 'center',
    marginTop: spacing?.xs || 4,
  },
  scheduleSection: {
    marginBottom: spacing?.xl || 32,
  },
  scheduleHeader: {
    marginBottom: spacing?.sm || 8,
  },
  scheduleTitle: {
    fontSize: typography?.scale?.cardTitle?.size || 18,
    fontWeight: typography?.scale?.cardTitle?.weight || '600',
    color: textColor?.primary || palette.textPrimary,
  },
  scheduleCard: {
    backgroundColor: palette.surface,
    borderRadius: designTokens?.borderRadius?.xl || 20,
    padding: spacing?.lg || 24,
    minHeight: 200,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: palette.divider,
  },
  timeAxis: {
    width: 60,
    marginRight: spacing?.md || 16,
  },
  timeMarker: {
    marginBottom: spacing?.lg || 24,
  },
  timeText: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
  },
  sessionsList: {
    flex: 1,
  },
  sessionItem: {
    backgroundColor: palette.backgroundSecondary,
    borderRadius: designTokens?.borderRadius?.lg || 16,
    padding: spacing.md,
    marginBottom: spacing?.md || 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.divider,
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: typography?.scale?.body?.weight || '400',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.xs || 4,
  },
  sessionSubtitle: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
  },
  statusIcon: {
    fontSize: 18,
    color: palette.accentWarning,
  },
});
