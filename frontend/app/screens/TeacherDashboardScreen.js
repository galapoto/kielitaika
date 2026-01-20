import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import SceneBackground from '../components/SceneBackground';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:5000';

export default function TeacherDashboardScreen({ route, navigation }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCohorts();
  }, []);

  useEffect(() => {
    loadStudents(selectedCohort);
  }, [selectedCohort]);

  const loadStudents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const query = selectedCohort ? `?cohort_id=${selectedCohort}` : '';
      const response = await fetch(`${API_BASE}/admin/users${query}`);
      const data = await response.json();
      setStudents(data.users || []);
      if ((data.users || []).length > 0) {
        setSelectedStudent(data.users[0].id);
        loadStudentReport(data.users[0].id, false);
      } else {
        setSelectedStudent(null);
        setStudentReport(null);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setError('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCohorts = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/cohorts`);
      const data = await response.json();
      setCohorts(data.cohorts || []);
      if ((data.cohorts || []).length > 0) {
        setSelectedCohort(data.cohorts[0].id);
      }
    } catch (err) {
      console.error('Error loading cohorts:', err);
    }
  };

  const loadStudentReport = async (userId, toggleLoading = true) => {
    if (toggleLoading) setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/progress`);
      const data = await response.json();
      setStudentReport(data.report);
      setSelectedStudent(userId);
    } catch (error) {
      console.error('Error loading student report:', error);
    } finally {
      if (toggleLoading) setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="lapland" orbEmotion="calm" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
        <Text style={styles.title}>Teacher Dashboard</Text>
        <Text style={styles.subtitle}>Student Progress & Analytics</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cohortChips}>
        {cohorts.map((cohort) => (
          <TouchableOpacity
            key={cohort.id}
            style={[
              styles.cohortChip,
              selectedCohort === cohort.id && styles.cohortChipActive,
            ]}
            onPress={() => setSelectedCohort(cohort.id)}
          >
            <Text
              style={[
                styles.cohortChipText,
                selectedCohort === cohort.id && styles.cohortChipTextActive,
              ]}
            >
              {cohort.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.studentsSection}>
        <Text style={styles.sectionTitle}>Students</Text>
        {students.map((student) => (
          <TouchableOpacity
            key={student.id}
            style={[
              styles.studentCard,
              selectedStudent === student.id && styles.studentCardSelected,
            ]}
            onPress={() => loadStudentReport(student.id)}
          >
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentId}>ID: {student.id}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A3D62" />
        </View>
      )}

      {studentReport && (
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Student Progress Report</Text>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Predicted CEFR Level</Text>
            <Text style={styles.metricValue}>{studentReport.predicted_cefr}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Sessions</Text>
            <Text style={styles.metricValue}>{studentReport.sessions}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Messages Sent</Text>
            <Text style={styles.metricValue}>{studentReport.messages_count}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Average Accuracy</Text>
            <Text style={styles.metricValue}>
              {(studentReport.average_accuracy * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Pronunciation Score</Text>
            <Text style={styles.metricValue}>
              {studentReport.pronunciation_score}/4
            </Text>
          </View>

          {studentReport.grammar_errors && Object.keys(studentReport.grammar_errors).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Common Grammar Errors</Text>
              {Object.entries(studentReport.grammar_errors).slice(0, 5).map(([error, count]) => (
                <View key={error} style={styles.errorItem}>
                  <Text style={styles.errorText}>{error}</Text>
                  <Text style={styles.errorCount}>{count}x</Text>
                </View>
              ))}
            </View>
          )}

          {studentReport.workplace_performance && Object.keys(studentReport.workplace_performance).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Workplace Performance</Text>
              {Object.entries(studentReport.workplace_performance).map(([profession, data]) => (
                <View key={profession} style={styles.metricCard}>
                  <Text style={styles.metricLabel}>{profession}</Text>
                  <Text style={styles.metricValue}>
                    {data.average_score?.toFixed(1)}/5
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  studentsSection: {
    padding: 20,
  },
  cohortChips: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cohortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  cohortChipActive: {
    borderColor: '#0A3D62',
    backgroundColor: '#eef2ff',
  },
  cohortChipText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  cohortChipTextActive: {
    color: '#0A3D62',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  studentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  studentCardSelected: {
    borderColor: '#0A3D62',
    borderWidth: 2,
    backgroundColor: '#eef2ff',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 12,
    color: '#64748b',
  },
  error: {
    color: '#dc2626',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  reportSection: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
  },
  errorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  errorText: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  errorCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
});
