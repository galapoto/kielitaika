/**
 * useAITransparency Hook
 * React hook for AI transparency service
 */

import { useCallback } from 'react';
import { aiTransparencyService } from '../services/aiTransparencyService';

export function useAITransparency() {
  const getCorrectionExplanation = useCallback((correction) => {
    return aiTransparencyService.getCorrectionExplanation(correction);
  }, []);

  const getConfidenceIndicator = useCallback((confidence) => {
    return aiTransparencyService.getConfidenceIndicator(confidence);
  }, []);

  const explainCorrectionReason = useCallback((correction) => {
    return aiTransparencyService.explainCorrectionReason(correction);
  }, []);

  const formatFeedback = useCallback((feedback) => {
    return aiTransparencyService.formatFeedback(feedback);
  }, []);

  const shouldShowCorrection = useCallback((correction, userPreferences = {}) => {
    return aiTransparencyService.shouldShowCorrection(correction, userPreferences);
  }, []);

  return {
    getCorrectionExplanation,
    getConfidenceIndicator,
    explainCorrectionReason,
    formatFeedback,
    shouldShowCorrection,
  };
}



















