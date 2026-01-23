import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Background from '../components/ui/Background';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import HomeButton from '../components/HomeButton';
import ProfileImage from '../components/ProfileImage';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import LanguageSelector, { getStoredLanguage, setStoredLanguage } from '../components/LanguageSelector';

export default function SettingsScreen({ navigation }) {
  const { colors: themeColors, theme, toggleTheme } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const { backgroundsEnabled, toggleBackgrounds, animationsEnabled, toggleAnimations, speechRate, setSpeechRate } = usePreferences();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [language, setLanguage] = React.useState('en'); // 'en' or 'fi'
  const [profilePictureUrl, setProfilePictureUrl] = React.useState(user?.profile_picture_url || user?.profilePictureUrl || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [isProfileModalVisible, setProfileModalVisible] = React.useState(false);
  const [profileModalUrl, setProfileModalUrl] = React.useState(profilePictureUrl);

  React.useEffect(() => {
    setProfilePictureUrl(user?.profile_picture_url || user?.profilePictureUrl || '');
  }, [user]);

  React.useEffect(() => {
    setProfileModalUrl(profilePictureUrl);
  }, [profilePictureUrl]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Navigation will be handled by App.js auth state
          },
      },
    ]
  );
};

  const handleProfileModalClose = () => {
    setProfileModalVisible(false);
  };

  const handleProfileSave = async () => {
    const url = (profileModalUrl || '').trim();
    if (!url) {
      Alert.alert('Missing URL', 'Please enter a valid image URL.');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      await updateUser({ profile_picture_url: url });
      setProfilePictureUrl(url);
      Alert.alert('Success', 'Profile picture updated!');
      handleProfileModalClose();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to update profile picture');
    } finally {
      setIsUpdatingProfile(false);
    }
  };


  // Combine all designs: Profile header from 2nd picture, Flight booking cards from 6th picture, Settings list style
  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
        {/* Header - From 2nd picture (Profile-like) */}
        <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation?.canGoBack?.() && navigation.canGoBack()) navigation.goBack();
            else navigation?.navigate?.('Home');
          }}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.profileSection}>
          <ProfileImage
            size={50}
            onPress={() => {
              setProfileModalUrl(profilePictureUrl);
              setProfileModalVisible(true);
            }}
          />
          <Text style={styles.userName}>Settings</Text>
          <Text style={styles.membershipDate}>Customize your experience</Text>
        </View>
        <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Picture Settings */}
        <View style={styles.settingCard}>
          <View style={styles.settingCardLeft}>
            <Text style={styles.settingCardTitle}>Profile Picture</Text>
            <Text style={styles.settingCardDescription}>
              {profilePictureUrl ? 'Tap to change' : 'Add a profile picture URL'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setProfileModalUrl(profilePictureUrl);
              setProfileModalVisible(true);
            }}
            disabled={isUpdatingProfile}
          >
            <ProfileImage size={60} />
          </TouchableOpacity>
        </View>

        {/* Settings Cards - Flight Booking Style from 6th picture */}
        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemLabel}>Dark Mode</Text>
              <Text style={styles.settingItemDescription}>Switch between themes</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#1E3A8A' }}
              thumbColor={theme === 'dark' ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemLabel}>Background Images</Text>
              <Text style={styles.settingItemDescription}>
                {backgroundsEnabled ? 'Show backgrounds' : 'Hide backgrounds'}
              </Text>
            </View>
            <Switch
              value={backgroundsEnabled}
              onValueChange={toggleBackgrounds}
              trackColor={{ false: '#767577', true: '#1E3A8A' }}
              thumbColor={backgroundsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemLabel}>Animations</Text>
              <Text style={styles.settingItemDescription}>
                {animationsEnabled ? 'Enable animations' : 'Disable animations'}
              </Text>
            </View>
            <Switch
              value={animationsEnabled}
              onValueChange={toggleAnimations}
              trackColor={{ false: '#767577', true: '#1E3A8A' }}
              thumbColor={animationsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {/* Speech */}
          <View style={styles.settingCard}>
            <View style={styles.settingCardLeft}>
              <Text style={styles.settingCardTitle}>Speech speed</Text>
              <Text style={styles.settingCardDescription}>
                {speechRate === 'slow' ? 'Slow (recommended for A1)' : speechRate === 'fast' ? 'Fast' : 'Normal'}
              </Text>
            </View>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[styles.languageButton, speechRate === 'slow' && styles.languageButtonActive]}
                onPress={() => setSpeechRate('slow')}
              >
                <Text style={[styles.languageButtonText, speechRate === 'slow' && styles.languageButtonTextActive]}>
                  SLOW
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.languageButton, speechRate === 'normal' && styles.languageButtonActive]}
                onPress={() => setSpeechRate('normal')}
              >
                <Text style={[styles.languageButtonText, speechRate === 'normal' && styles.languageButtonTextActive]}>
                  NORMAL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.languageButton, speechRate === 'fast' && styles.languageButtonActive]}
                onPress={() => setSpeechRate('fast')}
              >
                <Text style={[styles.languageButtonText, speechRate === 'fast' && styles.languageButtonTextActive]}>
                  FAST
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications */}
          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.settingCardLeft}>
              <Text style={styles.settingCardTitle}>Notifications</Text>
              <Text style={styles.settingCardDescription}>Manage reminders and alerts</Text>
            </View>
            <View style={styles.settingCardRight}>
              <Text style={styles.settingCardArrow}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Privacy */}
          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => navigation.navigate('PrivacySettings')}
          >
            <View style={styles.settingCardLeft}>
              <Text style={styles.settingCardTitle}>Privacy Settings</Text>
              <Text style={styles.settingCardDescription}>Data and privacy preferences</Text>
            </View>
            <View style={styles.settingCardRight}>
              <Text style={styles.settingCardArrow}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Language */}
          <View style={styles.settingCard}>
            <View style={styles.settingCardLeft}>
              <Text style={styles.settingCardTitle}>Language</Text>
              <Text style={styles.settingCardDescription}>App interface language (English, Finnish, Swedish)</Text>
            </View>
            <LanguageSelector
              onLanguageChange={(langCode) => {
                setLanguage(langCode);
                setStoredLanguage(langCode);
              }}
            />
          </View>

          {/* Account */}
          {user?.email && (
            <View style={styles.settingCard}>
              <View style={styles.settingCardLeft}>
                <Text style={styles.settingCardTitle}>Email</Text>
                <Text style={styles.settingCardDescription}>{user.email}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => navigation.navigate('Subscription')}
          >
            <View style={styles.settingCardLeft}>
              <Text style={styles.settingCardTitle}>Subscription</Text>
              <Text style={styles.settingCardDescription}>Manage your plan</Text>
            </View>
            <View style={styles.settingCardRight}>
              <Text style={styles.settingCardArrow}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Sign Out */}
          <TouchableOpacity
            style={[styles.settingCard, styles.signOutCard]}
            onPress={handleLogout}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        visible={isProfileModalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleProfileModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Profile Picture</Text>
            <TextInput
              value={profileModalUrl}
              onChangeText={setProfileModalUrl}
              placeholder="https://example.com/avatar.jpg"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={[styles.modalInput, { borderColor: themeColors.border, color: themeColors.text }]}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isUpdatingProfile}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleProfileModalClose}
                disabled={isUpdatingProfile}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleProfileSave}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#1A1A1A',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  homeButtonHeader: {
    marginLeft: 'auto',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  settingsList: {
    gap: 12,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingCardLeft: {
    flex: 1,
  },
  settingCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  settingCardDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  settingCardRight: {
    alignItems: 'flex-end',
  },
  settingCardArrow: {
    fontSize: 20,
    color: '#1E3A8A',
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingItemLeft: {
    flex: 1,
  },
  settingItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  settingItemDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  languageButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  languageButtonTextActive: {
    color: '#FFFFFF',
  },
  signOutCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderColor: 'rgba(27,78,218,0.35)',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  modalButtonPrimary: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
  },
});
