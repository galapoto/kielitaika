/**
 * useAdaptiveLearning Hook
 * React hook for adaptive learning service
 */

import { useState, useCallback } from 'react';
import { adaptiveLearningService } from '../services/adaptiveLearningService';

export function useAdaptiveLearning() {
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const trackPerformance = useCallback(async (lessonId, metrics) => {
    setLoading(true);
    try {
      const result = await adaptiveLearningService.trackPerformance(lessonId, metrics);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStrengthsAndWeaknesses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adaptiveLearningService.getStrengthsAndWeaknesses();
      setStrengths(result.strengths);
      setWeaknesses(result.weaknesses);
      setRecommendation(result.recommendation);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecommendedDifficulty = useCallback(async (lessonId, performance) => {
    return await adaptiveLearningService.recommendDifficulty(lessonId, performance);
  }, []);

  const adjustDifficulty = useCallback(async (lessonId, currentDifficulty, performance) => {
    return await adaptiveLearningService.adjustDifficulty(lessonId, currentDifficulty, performance);
  }, []);

  const getSpacedRepetitionSchedule = useCallback(async (itemId, performance) => {
    return await adaptiveLearningService.getSpacedRepetitionSchedule(itemId, performance);
  }, []);

  const getItemsDueForReview = useCallback(async () => {
    return await adaptiveLearningService.getItemsDueForReview();
  }, []);

  return {
    strengths,
    weaknesses,
    recommendation,
    loading,
    trackPerformance,
    getStrengthsAndWeaknesses,
    getRecommendedDifficulty,
    adjustDifficulty,
    getSpacedRepetitionSchedule,
    getItemsDueForReview,
  };
}



















