/**
 * useSearch Hook
 * React hook for search service
 */

import { useState, useCallback, useEffect } from 'react';
import { searchService } from '../services/searchService';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);

  useEffect(() => {
    loadRecentSearches();
    loadPopularSearches();
  }, []);

  const loadRecentSearches = async () => {
    const recent = await searchService.getRecentSearches();
    setRecentSearches(recent);
  };

  const loadPopularSearches = async () => {
    const popular = await searchService.getPopularSearches();
    setPopularSearches(popular);
  };

  const search = useCallback(async (searchQuery, filters = {}) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults(null);
      return;
    }

    setQuery(searchQuery);
    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchService.search(searchQuery, filters);
      setResults(searchResults);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
  }, []);

  const clearRecentSearches = useCallback(async () => {
    await searchService.clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const getRecommendedContent = useCallback(async (userId, limit = 5) => {
    return await searchService.getRecommendedContent(userId, limit);
  }, []);

  const getContinueLearning = useCallback(async (userId) => {
    return await searchService.getContinueLearning(userId);
  }, []);

  return {
    query,
    results,
    loading,
    error,
    recentSearches,
    popularSearches,
    search,
    clearSearch,
    clearRecentSearches,
    getRecommendedContent,
    getContinueLearning,
  };
}



















