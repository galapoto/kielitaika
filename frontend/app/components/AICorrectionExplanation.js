/**
 * AICorrectionExplanation Component
 * Shows AI correction with explanation and confidence indicator
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAITransparency } from '../hooks/useAITransparency';
import { designTokens } from '../styles/designTokens';
import { colors as palette } from '../styles/colors';

export default function AICorrectionExplanation({ correction, onLearnMore }) {
  const { getCorrectionExplanation, getConfidenceIndicator, explainCorrectionReason } = useAITransparency();
  const [showDetails, setShowDetails] = useState(false);

  if (!correction) return null;

  const explanation = getCorrectionExplanation(correction);
  const confidence = getConfidenceIndicator(correction.confidence);
  const reason = showDetails ? explainCorrectionReason(correction) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.confidenceBadge, { backgroundColor: confidence.color }]}>
          <Text style={styles.confidenceIcon}>{confidence.icon}</Text>
          <Text style={styles.confidenceLabel}>{confidence.label}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.explanation}>{explanation.explanation}</Text>

        {explanation.showDetails && (
          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>
              {showDetails ? 'Hide details' : 'Why was this corrected?'}
            </Text>
          </TouchableOpacity>
        )}

        {showDetails && reason && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>{reason.title}</Text>
            <Text style={styles.detailsText}>{reason.explanation}</Text>
            {reason.examples && reason.examples.length > 0 && (
              <View style={styles.examplesContainer}>
                {reason.examples.map((example, index) => (
                  <Text key={index} style={styles.exampleText}>
                    • {example}
                  </Text>
                ))}
              </View>
            )}
            {reason.learnMore && onLearnMore && (
              <TouchableOpacity onPress={() => onLearnMore(reason.learnMore)} style={styles.learnMoreButton}>
                <Text style={styles.learnMoreText}>Learn more</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette?.surface || '#0F172A',
    borderRadius: designTokens?.borderRadius?.md || 12,
    padding: designTokens?.spacing?.md || 16,
    marginVertical: designTokens?.spacing?.sm || 8,
    borderLeftWidth: 3,
    borderLeftColor: palette?.accentPrimary || '#4ECDC4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens?.spacing?.sm || 8,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designTokens?.spacing?.sm || 8,
    paddingVertical: designTokens?.spacing?.xs || 4,
    borderRadius: designTokens?.borderRadius?.sm || 8,
  },
  confidenceIcon: {
    fontSize: 14,
    marginRight: designTokens?.spacing?.xs || 4,
  },
  confidenceLabel: {
    color: palette?.textPrimary || '#F8F9FA',
    fontSize: designTokens?.typography?.scale?.small?.size || 14,
    fontWeight: '600',
  },
  content: {
    marginTop: designTokens?.spacing?.xs || 4,
  },
  explanation: {
    color: palette?.textPrimary || '#F8F9FA',
    fontSize: designTokens?.typography?.scale?.body?.size || 16,
    lineHeight: designTokens?.typography?.scale?.body?.lineHeight || 24,
  },
  detailsButton: {
    marginTop: designTokens?.spacing?.sm || 8,
  },
  detailsButtonText: {
    color: palette?.accentSecondary || '#1B4EDA',
    fontSize: designTokens?.typography?.scale?.small?.size || 14,
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: designTokens?.spacing?.md || 16,
    paddingTop: designTokens?.spacing?.md || 16,
    borderTopWidth: 1,
    borderTopColor: palette?.divider || 'rgba(255,255,255,0.12)',
  },
  detailsTitle: {
    color: palette?.textPrimary || '#F8F9FA',
    fontSize: designTokens?.typography?.scale?.cardTitle?.size || 18,
    fontWeight: '600',
    marginBottom: designTokens?.spacing?.sm || 8,
  },
  detailsText: {
    color: palette?.textSecondary || 'rgba(248,249,250,0.8)',
    fontSize: designTokens?.typography?.scale?.body?.size || 16,
    lineHeight: designTokens?.typography?.scale?.body?.lineHeight || 24,
    marginBottom: designTokens?.spacing?.sm || 8,
  },
  examplesContainer: {
    marginTop: designTokens?.spacing?.sm || 8,
  },
  exampleText: {
    color: palette?.textSecondary || 'rgba(248,249,250,0.8)',
    fontSize: designTokens?.typography?.scale?.body?.size || 16,
    marginBottom: designTokens?.spacing?.xs || 4,
  },
  learnMoreButton: {
    marginTop: designTokens?.spacing?.sm || 8,
  },
  learnMoreText: {
    color: palette?.accentSecondary || '#1B4EDA',
    fontSize: designTokens?.typography?.scale?.small?.size || 14,
    fontWeight: '600',
  },
});



















