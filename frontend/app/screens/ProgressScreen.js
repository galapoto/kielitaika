import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Background from '../components/ui/Background';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../styles/spacing';
import HomeButton from '../components/HomeButton';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

export default function ProgressScreen({ navigation }) {
  const { colors: themeColors } = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const bootstrap = async () => {
      await loadUsers();
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadProgress(selectedUser);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data.users || []);
      if ((data.users || []).length > 0) {
        setSelectedUser(data.users[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users');
    }
  };

  const loadProgress = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/progress`);
      if (!res.ok) throw new Error('Failed to load progress');
      const data = await res.json();
      setProgress(data.report);
    } catch (err) {
      setError(err.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  // Transform progress data into schedule-like items
  const progressItems = progress ? [
    {
      id: '1',
      time: '8:00',
      title: 'Vocabulary Practice',
      subtitle: 'Completed 20 words',
      status: 'completed',
    },
    {
      id: '2',
      time: '10:00',
      title: 'Conversation Session',
      subtitle: `${progress.messages_count || 0} messages exchanged`,
      status: 'active',
    },
    {
      id: '3',
      time: '11:00',
      title: 'Grammar Review',
      subtitle: `CEFR Level: ${progress.predicted_cefr || 'A1'}`,
      status: 'pending',
    },
    {
      id: '4',
      time: '12:00',
      title: 'Pronunciation Practice',
      subtitle: `Score: ${progress.pronunciation_score || 0}/4`,
      status: 'pending',
    },
  ] : [];

  const currentDate = new Date();
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const currentDay = currentDate.getDate();
  const currentDayName = dayNames[currentDate.getDay()];

  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
      {/* Header - Dark Blue */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROGRESS TRACKING</Text>
        <View style={styles.headerRight}>
          <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
        </View>
      </View>

      {/* Date/Day Selection */}
      <View style={styles.dateSection}>
        <View style={styles.dateDisplay}>
          <Text style={styles.dateNumber}>{currentDay}</Text>
          <Text style={styles.dateDay}>{currentDayName}</Text>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>TODAY LIST</Text>
          </TouchableOpacity>
          <Text style={styles.taskCount}>{progressItems.length} tasks</Text>
        </View>
      </View>

      {/* Main Content - White Card */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentCard}>
          {/* Time Axis */}
          <View style={styles.timeAxis}>
            {['8:00', '10:00', '11:00', '12:00'].map((time, index) => (
              <View key={time} style={styles.timeMarker}>
                <Text style={styles.timeText}>{time}</Text>
                {index === 1 && <View style={styles.currentTimeDot} />}
              </View>
            ))}
          </View>

          {/* Progress Items List */}
          <View style={styles.itemsList}>
            {loading ? (
              <ActivityIndicator size="large" color="#1E3A8A" style={styles.loader} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : progressItems.length > 0 ? (
              progressItems.map((item) => (
                <View key={item.id} style={styles.progressItem}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.itemStatus}>
                    {item.status === 'completed' && (
                      <Text style={styles.statusIcon}>✓</Text>
                    )}
                    {item.status === 'active' && (
                      <Text style={[styles.statusIcon, styles.statusActive]}>★</Text>
                    )}
                    {item.status === 'pending' && (
                      <Text style={[styles.statusIcon, styles.statusPending]}>⚠</Text>
                    )}
                    <Text style={styles.moreIcon}>...</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No progress items yet</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeButtonHeader: {
    marginLeft: 8,
  },
  header: {
    backgroundColor: '#1E3A8A', // Dark blue
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  calendarButton: {
    padding: 8,
  },
  calendarIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  dateSection: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateDisplay: {
    alignItems: 'center',
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateDay: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  taskCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minHeight: 400,
    flexDirection: 'row',
  },
  timeAxis: {
    width: 60,
    marginRight: 16,
  },
  timeMarker: {
    marginBottom: 40,
    position: 'relative',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  currentTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E3A8A',
    position: 'absolute',
    left: -4,
    top: 4,
  },
  itemsList: {
    flex: 1,
  },
  progressItem: {
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
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  itemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    fontSize: 18,
    color: '#22C55E', // Green for completed
  },
  statusActive: {
    color: '#3B82F6', // Blue for active
  },
  statusPending: {
    color: '#F59E0B', // Orange for pending
  },
  moreIcon: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  loader: {
    marginTop: 40,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
