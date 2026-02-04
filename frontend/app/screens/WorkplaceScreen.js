import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Background from '../components/ui/Background';
import { listWorkplaceFields } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { usePath } from '../context/PathContext';
import HomeButton from '../components/HomeButton';
import ProfileImage from '../components/ProfileImage';
import RukaCard from '../components/ui/RukaCard';
import { Ionicons } from '@expo/vector-icons';
import { colors as palette } from '../styles/colors';

export default function WorkplaceScreen({ navigation }) {
  const { user } = useAuth();
  const { profession, setProfession } = usePath();
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!user) {
    return (
      <View style={styles.authGuard}>
        <Text style={styles.authGuardText}>Kirjaudu sisään jatkaaksesi.</Text>
      </View>
    );
  }

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setIsLoading(true);
      const response = await listWorkplaceFields();
      setFields(response.fields || []);
    } catch (err) {
      console.error('Error loading workplace fields:', err);
      setError(err.message || 'Failed to load professions');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedField = useMemo(() => {
    if (!fields.length) return null;
    return fields.find((f) => f.id === profession) || fields[0];
  }, [fields, profession]);

  useEffect(() => {
    if (!profession && fields.length) {
      setProfession(fields[0].id);
    }
  }, [profession, fields, setProfession]);

  const MODULES = [
    { id: 'Vocabulary', labelFi: 'Sanasto', type: 'vocabulary', descriptionFi: 'Harjoittele keskeistä sanastoa', icon: 'book-outline' },
    { id: 'Listening', labelFi: 'Kuuntelu', type: 'listening', descriptionFi: 'Virittäydy kuuntelemaan', icon: 'headset' },
    { id: 'Roleplay', labelFi: 'Roolipeli', screen: 'Roleplay', descriptionFi: 'Harjoittele työtilanteen dialogia', icon: 'chatbubble-ellipses' },
    { id: 'Grammar', labelFi: 'Kielioppi', type: 'grammar', descriptionFi: 'Hallitse rakenteet', icon: 'text' },
    { id: 'Review', labelFi: 'Kertaus', type: 'review', descriptionFi: 'Kertaa ammattialan sisältöä', icon: 'refresh-circle' },
    { id: 'Quiz', labelFi: 'Koe', type: 'reading', descriptionFi: 'Testaa ymmärtäminen', icon: 'help-circle' },
    { id: 'Resources', labelFi: 'Materiaalit', type: 'grammar', descriptionFi: 'Lisämateriaalit', icon: 'library-outline' },
  ];

  const handleModulePress = (module) => {
    if (!selectedField) return;
    const field = selectedField.id;
    const fieldName = selectedField.label;

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

  const headerTitle = selectedField?.label || 'Työelämän suomi';
  const headerSubtitle = 'Ammattikohtainen suomi ja moduulit';

  return (
    <Background module="workplace" variant="brown">
      <View style={styles.container}>
      {/* Header - From 2nd picture (Profile-like) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.settingsIcon}>
            <Text style={styles.settingsIconText}>⚙️</Text>
          </TouchableOpacity>
          <View style={styles.profileSection}>
            <ProfileImage size={40} />
            <Text style={styles.userName}>{headerTitle}</Text>
            <Text style={styles.membershipDate}>{headerSubtitle}</Text>
          </View>
        </View>
        <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {selectedField && (
          <View style={styles.professionContent}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{selectedField.label}</Text>
              <Text style={styles.infoDescription}>
                Harjoittele ammattikohtaista suomea ja etene moduuli kerrallaan.
              </Text>
            </View>

            <View style={styles.modulesSection}>
              <Text style={styles.sectionTitle}>Oppimismoduulit</Text>
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
                        name={module.icon || 'sparkles'}
                        size={26}
                        color={palette.accentPrimary}
                      />
                    </View>
                    <View style={styles.moduleText}>
                      <Text style={styles.moduleLabel}>{module.labelFi || module.id}</Text>
                      {(module.descriptionFi || module.description) && (
                        <Text style={styles.moduleDescription}>{module.descriptionFi || module.description}</Text>
                      )}
                    </View>
                  </RukaCard>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingText}>Ladataan ammatteja…</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadFields}>
              <Text style={styles.retryButtonText}>Yritä uudelleen</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </View>
    </Background>
  );
}

// Removed bottom navigation for now
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
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#1A1A1A',
  },
  settingsIcon: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  settingsIconText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImageText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  membershipDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  headerLeft: {
    flex: 1,
  },
  homeButtonHeader: {
    marginLeft: 'auto',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  professionContent: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  infoDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  modulesSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  moduleCard: {
    marginBottom: 8,
  },
  moduleInnerCard: {
    minHeight: 84,
    justifyContent: 'center',
  },
  moduleIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(27, 78, 218, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moduleText: {
    gap: 4,
  },
  moduleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  moduleDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
  loader: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
