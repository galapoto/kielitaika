import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../../context/AuthContext';
// import GoogleLogo from '../../ui/icons/GoogleLogo'; // Disabled to avoid SVG Fabric error
import RukaLogo3D from '../../components/RukaLogo3D';
import { PRODUCT_NAME } from '../../utils/constants';
import Background from '../../components/ui/Background';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, loginWithGoogle } = useAuth();
  
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '946481356194-v8t6riiihp9oetqd1fl6gc1onhi2quf1.apps.googleusercontent.com';
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: googleClientId,
    iosClientId: googleClientId,
    androidClientId: googleClientId,
    expoClientId: googleClientId,
    responseType: 'id_token',
    webClientId: googleClientId, // Required for Web platform
  });

  const withTimeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('Request timed out. Please try again.'));
        }, ms);
      }),
    ]);

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      // Use email as username for now (or update auth service to accept username)
      await withTimeout(login(email.trim(), password), 12000);
      // Navigation will be handled automatically by AppNavigator based on auth state
      // AppNavigator will route to HomeScreen (personalized) for returning users
      // or onboarding flow for new users
    } catch (error) {
      const message = error?.message || 'Please check your credentials and try again.';
      setErrorMessage(message);
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success' && response.authentication?.idToken) {
        try {
          setGoogleLoading(true);
          if (typeof loginWithGoogle !== 'function') {
            throw new Error('Google sign-in is not available right now.');
          }
          await withTimeout(loginWithGoogle(response.authentication.idToken), 12000);
          // Navigation will be handled automatically by AppNavigator based on auth state
        } catch (err) {
          const message = err?.message || 'Please try again.';
          setErrorMessage(message);
          Alert.alert('Google Sign-In Failed', message);
        } finally {
          setGoogleLoading(false);
        }
      }
    };
    handleGoogleResponse();
  }, [response]);

  return (
    <Background module="login" variant="brown">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <RukaLogo3D width={280} height={93} />
              </View>
              
              {/* Welcome Text */}
              <View style={styles.header}>
                <Text style={styles.title}>Tervetuloa {PRODUCT_NAME}iin</Text>
                <Text style={styles.subtitle}>Kirjaudu sisään jatkaaksesi suomen oppimista</Text>
              </View>

              {/* Login Form */}
              <View style={styles.form}>
                {errorMessage ? (
                  <View style={styles.errorBanner} accessibilityRole="alert">
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}
                {/* Email Field */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="sähköposti@esimerkki.fi"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                {/* Password Field */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Salasana"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                    onSubmitEditing={handleLogin}
                  />
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>Unohditko salasanan?</Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  testID="login-button"
                >
                  <Text style={styles.signInButtonText}>
                    {loading ? 'Kirjaudutaan…' : 'Kirjaudu'}
                  </Text>
                </TouchableOpacity>

                {/* Google Sign In */}
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={() => {
                    if (request && promptAsync) {
                      promptAsync().catch(err => {
                        console.error('Google sign-in error:', err);
                        setErrorMessage('Google-kirjautumista ei voitu aloittaa. Yritä uudelleen.');
                        Alert.alert('Kirjautumisvirhe', 'Google-kirjautumista ei voitu aloittaa. Yritä uudelleen.');
                      });
                    }
                  }}
                  disabled={googleLoading || !request}
                >
                  <View style={styles.googleButtonContent}>
                    <View style={styles.googleIconContainer}>
                      <Text style={styles.googleIconText}>G</Text>
                    </View>
                    <Text style={styles.googleButtonText}>
                      {googleLoading ? 'Connecting...' : 'Sign In With Google'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't Have An Account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Background>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: SCREEN_HEIGHT,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  errorBanner: {
    width: '100%',
    backgroundColor: 'rgba(220, 38, 38, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.35)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  errorText: {
    color: '#FEE2E2',
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: 'rgba(40, 40, 40, 0.8)', // Dark gray rounded rectangle
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  signInButton: {
    width: '100%',
    backgroundColor: '#4A90E2', // Medium blue
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.5)',
    marginBottom: 12,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signUpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  signUpLink: {
    fontSize: 14,
    color: '#4A90E2', // Blue link color
    fontWeight: '600',
  },
});
