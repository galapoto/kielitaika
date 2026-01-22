/**
 * useLeaderboard Hook
 * React hook for leaderboard service
 */

import { useState, useEffect, useCallback } from 'react';
import { leaderboardService } from '../services/leaderboardService';

export function useLeaderboard() {
  const [optedIn, setOptedIn] = useState(false);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optedInStatus, setOptedInStatus] = useState(null);

  useEffect(() => {
    checkOptInStatus();
  }, []);

  const checkOptInStatus = async () => {
    const status = await leaderboardService.hasOptedIn();
    setOptedIn(status);
    setOptedInStatus(status);
  };

  const optIn = useCallback(async (anonymousUsername = null) => {
    setLoading(true);
    try {
      const username = await leaderboardService.optIn(anonymousUsername);
      setOptedIn(true);
      setOptedInStatus(true);
      return username;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const optOut = useCallback(async () => {
    setLoading(true);
    try {
      await leaderboardService.optOut();
      setOptedIn(false);
      setOptedInStatus(false);
      setLeaderboard(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLeaderboard = useCallback(async (type = 'xp', period = 'weekly', limit = 100) => {
    setLoading(true);
    try {
      const data = await leaderboardService.getLeaderboard(type, period, limit);
      setLeaderboard(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateScore = useCallback(async (type, score) => {
    if (!optedIn) return;
    await leaderboardService.updateScore(type, score);
  }, [optedIn]);

  const getCategories = useCallback(() => {
    return leaderboardService.getCategories();
  }, []);

  const getPeriods = useCallback(() => {
    return leaderboardService.getPeriods();
  }, []);

  return {
    optedIn: optedInStatus,
    leaderboard,
    loading,
    optIn,
    optOut,
    getLeaderboard,
    updateScore,
    getCategories,
    getPeriods,
  };
}



















