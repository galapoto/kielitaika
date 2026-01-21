import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import SceneBackground from '../components/SceneBackground';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to KieliTaika',
      subtitle: 'Your AI-powered Finnish learning companion',
      description: 'Master Finnish with personalized lessons, workplace training, and YKI exam preparation.',
      icon: '🇫🇮',
    },
    {
      title: 'Learn Your Way',
      subtitle: 'Choose your learning path',
      description: 'General Finnish, Workplace Finnish, or YKI exam prep. We adapt to your goals.',
      icon: '🎯',
    },
    {
      title: 'Practice Daily',
      subtitle: 'Build your streak',
      description: 'Complete daily recharge packs with vocabulary, grammar, and conversation practice.',
      icon: '🔥',
    },
    {
      title: 'Get Started',
      subtitle: 'Ready to begin?',
      description: 'Select your learning path and start your Finnish journey today!',
      icon: '✨',
    },
  ];

  const paths = [
    {
      id: 'general',
      title: 'General Finnish',
      description: 'A1 to B1 level Finnish for everyday life',
      icon: '🌱',
    },
    {
      id: 'workplace',
      title: 'Workplace Finnish',
      description: 'Professional Finnish for 11+ professions',
      icon: '💼',
    },
    {
      id: 'yki',
      title: 'YKI Exam Prep',
      description: 'Complete exam simulation and practice',
      icon: '🎓',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On last step, show path selection
      // This will be handled by the UI
    }
  };

  const handlePathSelect = (pathId) => {
    // TODO: Save selected path to context/state
    navigation.replace('Tabs');
  };

  const handleSkip = () => {
    navigation.replace('Tabs');
  };

  if (currentStep < steps.length - 1) {
    const step = steps[currentStep];
    return (
      <View style={styles.container}>
        <SceneBackground sceneKey="forest" orbEmotion="calm" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepContainer}>
            <Text style={styles.stepIcon}>{step.icon}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>

          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 2 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Path selection screen (last step)
  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="forest" orbEmotion="calm" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepContainer}>
          <Text style={styles.stepIcon}>{steps[steps.length - 1].icon}</Text>
          <Text style={styles.stepTitle}>{steps[steps.length - 1].title}</Text>
          <Text style={styles.stepSubtitle}>{steps[steps.length - 1].subtitle}</Text>
          <Text style={styles.stepDescription}>{steps[steps.length - 1].description}</Text>
        </View>

        <View style={styles.pathsContainer}>
          {paths.map((path) => (
            <TouchableOpacity
              key={path.id}
              style={styles.pathCard}
              onPress={() => handlePathSelect(path.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.pathIcon}>{path.icon}</Text>
              <Text style={styles.pathTitle}>{path.title}</Text>
              <Text style={styles.pathDescription}>{path.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  stepIcon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  stepTitle: {
    ...typography.titleXL,
    color: colors.textMain,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  stepSubtitle: {
    ...typography.titleM,
    color: colors.blueMain,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  stepDescription: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.l,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.s,
    marginTop: spacing['2xl'],
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.grayLine,
  },
  progressDotActive: {
    backgroundColor: colors.blueMain,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: '#10b981',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.l,
    gap: spacing.m,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.grayLine,
    ...shadows.l,
  },
  skipButton: {
    flex: 1,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.body,
    color: colors.textSoft,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.blueMain,
    paddingVertical: spacing.m,
    borderRadius: radius.l,
    alignItems: 'center',
    ...shadows.s,
  },
  nextButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  pathsContainer: {
    gap: spacing.m,
    marginTop: spacing['2xl'],
  },
  pathCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.grayLine,
    ...shadows.s,
  },
  pathIcon: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  pathTitle: {
    ...typography.titleL,
    color: colors.textMain,
    fontWeight: '700',
    marginBottom: spacing.s,
  },
  pathDescription: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: 'center',
  },
});
