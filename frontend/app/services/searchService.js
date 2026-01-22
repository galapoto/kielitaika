/**
 * Search & Discovery Service
 * Team CU - Search & Discovery Systems
 * Provides search functionality, filters, and content recommendations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchVocab, fetchLesson, listPaths } from '../utils/api';

// ============================================
// SEARCH TYPES
// ============================================

export const SEARCH_TYPES = {
  LESSON: 'lesson',
  VOCABULARY: 'vocabulary',
  GRAMMAR: 'grammar',
  ALL: 'all',
};

// ============================================
// SEARCH FILTERS
// ============================================

export const SEARCH_FILTERS = {
  level: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  type: ['grammar', 'vocabulary', 'listening', 'reading', 'writing', 'speaking'],
  path: ['general', 'workplace', 'yki'],
  duration: ['short', 'medium', 'long'], // < 5min, 5-15min, > 15min
};

// ============================================
// SEARCH SERVICE
// ============================================

class SearchService {
  constructor() {
    this.recentSearchesKey = '@ruka_recent_searches';
    this.maxRecentSearches = 10;
    this.searchCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Perform search across all content types
   */
  async search(query, filters = {}) {
    if (!query || query.trim().length === 0) {
      return {
        results: [],
        suggestions: [],
        total: 0,
      };
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    // Check cache
    const cacheKey = `${normalizedQuery}_${JSON.stringify(filters)}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Save to recent searches
      await this.addToRecentSearches(normalizedQuery);

      // Perform search (would integrate with backend)
      const results = await this.performSearch(normalizedQuery, filters);

      // Cache results
      this.searchCache.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
      });

      return results;
    } catch (error) {
      console.error('[SearchService] Search error:', error);
      return {
        results: [],
        suggestions: this.getSuggestions(normalizedQuery),
        total: 0,
        error: error.message,
      };
    }
  }

  /**
   * Perform actual search (would integrate with backend)
   */
  async performSearch(query, filters) {
    // This would call backend search API
    // For now, return mock structure
    const results = [];

    // Search lessons
    if (!filters.type || filters.type === 'lesson' || filters.type === 'all') {
      // Would call: /api/search/lessons?q=query&level=A1&type=grammar
      results.push({
        type: 'lesson',
        id: 'lesson_1',
        title: 'Grammar Basics',
        description: 'Learn basic Finnish grammar',
        level: 'A1',
        path: 'general',
        matchScore: 0.9,
      });
    }

    // Search vocabulary
    if (!filters.type || filters.type === 'vocabulary' || filters.type === 'all') {
      // Would call: /api/search/vocabulary?q=query
      results.push({
        type: 'vocabulary',
        id: 'vocab_1',
        word: 'Hei',
        translation: 'Hello',
        level: 'A1',
        matchScore: 0.8,
      });
    }

    // Sort by relevance
    results.sort((a, b) => b.matchScore - a.matchScore);

    return {
      results,
      suggestions: this.getSuggestions(query),
      total: results.length,
    };
  }

  /**
   * Get search suggestions/autocomplete
   */
  getSuggestions(query) {
    if (!query || query.length < 2) return [];

    // Common Finnish learning terms
    const commonTerms = [
      'grammar',
      'vocabulary',
      'listening',
      'speaking',
      'reading',
      'writing',
      'YKI',
      'workplace',
      'present tense',
      'past tense',
      'cases',
      'verb conjugation',
    ];

    return commonTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(term => ({
        text: term,
        type: 'suggestion',
      }));
  }

  /**
   * Get recent searches
   */
  async getRecentSearches() {
    try {
      const data = await AsyncStorage.getItem(this.recentSearchesKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[SearchService] Error getting recent searches:', error);
      return [];
    }
  }

  /**
   * Add to recent searches
   */
  async addToRecentSearches(query) {
    try {
      const recent = await this.getRecentSearches();
      const filtered = recent.filter(q => q !== query);
      const updated = [query, ...filtered].slice(0, this.maxRecentSearches);
      await AsyncStorage.setItem(this.recentSearchesKey, JSON.stringify(updated));
    } catch (error) {
      console.error('[SearchService] Error saving recent search:', error);
    }
  }

  /**
   * Clear recent searches
   */
  async clearRecentSearches() {
    try {
      await AsyncStorage.removeItem(this.recentSearchesKey);
    } catch (error) {
      console.error('[SearchService] Error clearing recent searches:', error);
    }
  }

  /**
   * Get popular searches
   */
  async getPopularSearches() {
    // Would come from backend analytics
    return [
      'grammar',
      'YKI exam',
      'workplace vocabulary',
      'verb conjugation',
      'cases',
    ];
  }

  /**
   * Get trending content
   */
  async getTrendingContent() {
    // Would come from backend
    return {
      lessons: [],
      vocabulary: [],
      grammar: [],
    };
  }

  /**
   * Get recommended content (AI-powered)
   */
  async getRecommendedContent(userId, limit = 5) {
    try {
      // Would call: /api/recommendations?user_id=xxx&limit=5
      // Backend would use ML to suggest based on:
      // - User's current level
      // - Past performance
      // - Learning goals
      // - Time available
      
      return {
        lessons: [],
        vocabulary: [],
        practice: [],
      };
    } catch (error) {
      console.error('[SearchService] Error getting recommendations:', error);
      return { lessons: [], vocabulary: [], practice: [] };
    }
  }

  /**
   * Get "Continue Learning" content
   */
  async getContinueLearning(userId) {
    try {
      // Would call: /api/continue-learning?user_id=xxx
      // Returns last lesson, next step, etc.
      
      return {
        lastLesson: null,
        nextLesson: null,
        progress: 0,
      };
    } catch (error) {
      console.error('[SearchService] Error getting continue learning:', error);
      return { lastLesson: null, nextLesson: null, progress: 0 };
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();

// Export helper functions
export const normalizeSearchQuery = (query) => {
  return query.toLowerCase().trim();
};

export const highlightMatch = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};



















