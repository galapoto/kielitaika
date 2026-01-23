/**
 * SearchBar Component
 * Uses search service for functionality
 */

import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Text } from 'react-native';
import { useSearch } from '../hooks/useSearch';
import { designTokens } from '../styles/designTokens';
import { colors as palette } from '../styles/colors';

export default function SearchBar({ onResultSelect, style, placeholder = 'Search lessons, vocabulary...' }) {
  const { query, results, loading, recentSearches, popularSearches, search, clearSearch } = useSearch();
  const [localQuery, setLocalQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = useCallback((searchQuery) => {
    if (searchQuery && searchQuery.trim().length > 0) {
      search(searchQuery);
      setShowSuggestions(false);
    }
  }, [search]);

  const handleQueryChange = useCallback((text) => {
    setLocalQuery(text);
    if (text.length > 0) {
      setShowSuggestions(true);
      // Could trigger autocomplete here
    } else {
      setShowSuggestions(false);
    }
  }, []);

  const handleSuggestionPress = useCallback((suggestion) => {
    setLocalQuery(suggestion);
    handleSearch(suggestion);
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    clearSearch();
    setShowSuggestions(false);
  }, [clearSearch]);

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          value={localQuery}
          onChangeText={handleQueryChange}
          onSubmitEditing={() => handleSearch(localQuery)}
          returnKeyType="search"
        />
        {localQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => handleSearch(localQuery)}
          style={styles.searchButton}
          disabled={loading || localQuery.length === 0}
        >
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {showSuggestions && (recentSearches.length > 0 || popularSearches.length > 0) && (
        <View style={styles.suggestionsContainer}>
          {recentSearches.length > 0 && (
            <>
              <Text style={styles.suggestionsHeader}>Recent</Text>
              <FlatList
                data={recentSearches.slice(0, 5)}
                renderItem={renderSuggestion}
                keyExtractor={(item, index) => `recent-${index}`}
                style={styles.suggestionsList}
              />
            </>
          )}
          {popularSearches.length > 0 && (
            <>
              <Text style={styles.suggestionsHeader}>Popular</Text>
              <FlatList
                data={popularSearches.slice(0, 5)}
                renderItem={renderSuggestion}
                keyExtractor={(item, index) => `popular-${index}`}
                style={styles.suggestionsList}
              />
            </>
          )}
        </View>
      )}

      {results && results.results && results.results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>
            {results.total} result{results.total !== 1 ? 's' : ''}
          </Text>
          {/* Results would be rendered here */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette?.surface || '#0F172A',
    borderRadius: designTokens?.borderRadius?.md || 12,
    borderWidth: 1,
    borderColor: palette?.divider || 'rgba(255,255,255,0.12)',
    paddingHorizontal: designTokens?.spacing?.md || 16,
    minHeight: 44,
  },
  input: {
    flex: 1,
    color: palette?.textPrimary || '#F8F9FA',
    fontSize: designTokens?.typography?.scale?.body?.size || 16,
    paddingVertical: designTokens?.spacing?.sm || 8,
  },
  clearButton: {
    padding: designTokens?.spacing?.xs || 4,
    marginRight: designTokens?.spacing?.xs || 4,
  },
  clearText: {
    color: palette.textMuted,
    fontSize: 18,
  },
  searchButton: {
    padding: designTokens?.spacing?.xs || 4,
  },
  searchButtonText: {
    fontSize: 20,
  },
  suggestionsContainer: {
    marginTop: designTokens?.spacing?.sm || 8,
    backgroundColor: palette?.surface || '#0F172A',
    borderRadius: designTokens?.borderRadius?.md || 12,
    padding: designTokens?.spacing?.md || 16,
    maxHeight: 200,
  },
  suggestionsHeader: {
    color: palette?.textSecondary || 'rgba(248,249,250,0.8)',
    fontSize: designTokens?.typography?.scale?.small?.size || 14,
    fontWeight: '600',
    marginBottom: designTokens?.spacing?.xs || 4,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    paddingVertical: designTokens?.spacing?.xs || 4,
    paddingHorizontal: designTokens?.spacing?.sm || 8,
  },
  suggestionText: {
    color: palette?.textPrimary || '#F8F9FA',
    fontSize: designTokens?.typography?.scale?.body?.size || 16,
  },
  resultsContainer: {
    marginTop: designTokens?.spacing?.md || 16,
  },
  resultsHeader: {
    color: palette?.textSecondary || 'rgba(248,249,250,0.8)',
    fontSize: designTokens?.typography?.scale?.small?.size || 14,
  },
});



















