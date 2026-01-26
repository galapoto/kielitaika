import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Background from '../components/ui/Background';
import { listWorkplaceFields, listWorkplaceFieldsV2 } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import HomeButton from '../components/HomeButton';
import ProfileImage from '../components/ProfileImage';

export default function WorkplaceScreen({ navigation }) {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setIsLoading(true);
      // Try v2 first, fallback to v1
      let response;
      try {
        response = await listWorkplaceFieldsV2();
        // Transform v2 format to match expected format
        const transformedFields = (response.fields || []).map(field => ({
          id: field.id,
          label: field.label || field.id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category: field.category || 'general',
          pack: field.pack || 'core',
          situations: field.situations || {},
          terminologyPacks: field.terminology_packs || []
        }));
        setFields(transformedFields);
      } catch (v2Err) {
        console.log('V2 endpoint failed, trying v1:', v2Err);
        response = await listWorkplaceFields();
        setFields(response.fields || []);
      }
    } catch (err) {
      console.error('Error loading workplace fields:', err);
      setError(err.message || 'Failed to load professions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldSelect = (field) => {
    navigation.navigate('ProfessionDetail', { field: field.id, fieldName: field.label });
  };

  // Combine designs: Header from 2nd picture, Card grid from 2nd picture, Schedule from 3rd picture, Flight cards from 6th picture
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
            <Text style={styles.userName}>Workplace Finnish</Text>
            <Text style={styles.membershipDate}>Choose your profession</Text>
          </View>
        </View>
        <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profession Cards Grid - From 2nd picture (3x2 grid) */}
        <View style={styles.cardGrid}>
          {fields.map((field) => (
            <TouchableOpacity
              key={field.id}
              style={styles.professionCard}
              onPress={() => handleFieldSelect(field)}
            >
              <Text style={styles.cardIcon}>{field.icon || '💼'}</Text>
              <Text style={styles.cardLabel}>{field.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Schedule Section - From 3rd picture */}
        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>RECENT PRACTICE</Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.timeAxis}>
              {['9:00', '11:00'].map((time) => (
                <View key={time} style={styles.timeMarker}>
                  <Text style={styles.timeText}>{time}</Text>
                </View>
              ))}
            </View>

            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Workplace Roleplay</Text>
                  <Text style={styles.activitySubtitle}>Completed 3 scenarios</Text>
                </View>
                <Text style={styles.statusIcon}>✓</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profession List - Flight Booking Style from 6th picture */}
        {fields.length > 0 && (
          <View style={styles.professionsList}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Available Professions</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {fields.map((field) => (
              <TouchableOpacity
                key={field.id}
                style={styles.professionListItem}
                onPress={() => handleFieldSelect(field)}
              >
                <View style={styles.professionListLeft}>
                  <Text style={styles.professionListTitle}>{field.label}</Text>
                  <Text style={styles.professionListDescription}>Workplace Finnish</Text>
                </View>
                <View style={styles.professionListRight}>
                  <Text style={styles.professionListArrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingText}>Loading professions...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadFields}>
              <Text style={styles.retryButtonText}>Retry</Text>
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
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  professionCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scheduleSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  scheduleHeader: {
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
    flexDirection: 'row',
  },
  timeAxis: {
    width: 60,
    marginRight: 16,
  },
  timeMarker: {
    marginBottom: 40,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  activityList: {
    flex: 1,
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  statusIcon: {
    fontSize: 18,
    color: '#22C55E',
  },
  professionsList: {
    marginBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  professionListItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  professionListLeft: {
    flex: 1,
  },
  professionListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  professionListDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  professionListRight: {
    alignItems: 'flex-end',
  },
  professionListArrow: {
    fontSize: 20,
    color: '#1E3A8A',
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navItemActive: {
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  navIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  navIconActive: {
    color: '#FFFFFF',
  },
  navLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
