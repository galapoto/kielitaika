/**
 * useLearningPath Hook
 * React hook for learning path service
 */

import { useState, useEffect, useCallback } from 'react';
import { learningPathService } from '../services/learningPathService';

export function useLearningPath(pathType = 'general') {
  const [currentLevel, setCurrentLevel] = useState('A1');
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [pathType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [level, prog] = await Promise.all([
        learningPathService.getCurrentLevel(pathType),
        learningPathService.getProgress(pathType),
      ]);
      setCurrentLevel(level);
      setProgress(prog);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateLevel = useCallback(async (newLevel) => {
    try {
      await learningPathService.setCurrentLevel(pathType, newLevel);
      setCurrentLevel(newLevel);
    } catch (err) {
      setError(err.message);
    }
  }, [pathType]);

  const updateProgress = useCallback(async (updates) => {
    try {
      await learningPathService.updateProgress(pathType, updates);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }, [pathType]);

  const canAccessLevel = useCallback(async (targetLevel) => {
    return await learningPathService.canAccessLevel(pathType, targetLevel);
  }, [pathType]);

  const getNextLevel = useCallback(() => {
    return learningPathService.getNextLevel(currentLevel);
  }, [currentLevel]);

  const getPreviousLevel = useCallback(() => {
    return learningPathService.getPreviousLevel(currentLevel);
  }, [currentLevel]);

  const getAvailableLevels = useCallback(() => {
    return learningPathService.getAvailableLevels(pathType);
  }, [pathType]);

  const getPathVisualization = useCallback(async () => {
    return await learningPathService.getPathVisualization(pathType);
  }, [pathType]);

  return {
    currentLevel,
    progress,
    loading,
    error,
    updateLevel,
    updateProgress,
    canAccessLevel,
    getNextLevel,
    getPreviousLevel,
    getAvailableLevels,
    getPathVisualization,
    refresh: loadData,
  };
}



















