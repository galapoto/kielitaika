/**
 * LearningPathVisualization Component
 * Visualizes learning path progression (A1-C2)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLearningPath } from '../hooks/useLearningPath';
import { getLevelInfo } from '../services/learningPathService';
import { designTokens } from '../styles/designTokens';
import { colors as palette } from '../styles/colors';

export default function LearningPathVisualization({ pathType = 'general', onLevelPress }) {
  const { currentLevel, getAvailableLevels, getPathVisualization } = useLearningPath(pathType);
  const [visualization, setVisualization] = React.useState([]);

  React.useEffect(() => {
    loadVisualization();
  }, [pathType, currentLevel]);

  const loadVisualization = async () => {
    const viz = await getPathVisualization();
    setVisualization(viz);
  };

  const handleLevelPress = async (level) => {
    if (onLevelPress) {
      onLevelPress(level);
    }
  };

  const getLevelStyle = (level) => {
    const baseStyle = [styles.levelCard];
    
    if (level.status === 'completed') {
      baseStyle.push(styles.levelCompleted);
    } else if (level.status === 'current') {
      baseStyle.push(styles.levelCurrent);
    } else if (level.status === 'next') {
      baseStyle.push(styles.levelNext);
    } else {
      baseStyle.push(styles.levelLocked);
    }

    return baseStyle;
  };

  const getLevelIcon = (level) => {
    switch (level.status) {
      case 'completed':
        return '✓';
      case 'current':
        return '→';
      case 'next':
        return '🔓';
      default:
        return '🔒';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Learning Path</Text>
      <View style={styles.pathContainer}>
        {visualization.map((level, index) => (
          <React.Fragment key={level.id}>
            <TouchableOpacity
              style={getLevelStyle(level)}
              onPress={() => handleLevelPress(level)}
              disabled={level.status === 'locked'}
            >
              <View style={[styles.levelIcon, { backgroundColor: level.color }]}>
                <Text style={styles.levelIconText}>{getLevelIcon(level)}</Text>
              </View>
              <Text style={styles.levelName}>{level.name}</Text>
              <Text style={styles.levelDescription}>{level.description}</Text>
              {level.progress > 0 && (
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${level.progress}%`, backgroundColor: level.color }
                    ]} 
                  />
                </View>
              )}
            </TouchableOpacity>
            {index < visualization.length - 1 && (
              <View style={styles.connector} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: designTokens.spacing.md,
  },
  title: {
    fontSize: designTokens.typography.scale.h2.size,
    fontWeight: designTokens.typography.scale.h2.weight,
    color: palette.textPrimary,
    marginBottom: designTokens.spacing.lg,
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  levelCard: {
    alignItems: 'center',
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    minWidth: 100,
    marginHorizontal: designTokens.spacing.xs,
  },
  levelCompleted: {
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.success,
  },
  levelCurrent: {
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.accentPrimary,
  },
  levelNext: {
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.accentSecondary,
    opacity: 0.8,
  },
  levelLocked: {
    backgroundColor: palette.neutralDark,
    opacity: 0.5,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  levelIconText: {
    fontSize: 24,
    color: palette.textPrimary,
  },
  levelName: {
    fontSize: designTokens.typography.scale.cardTitle.size,
    fontWeight: designTokens.typography.scale.cardTitle.weight,
    color: palette.textPrimary,
    marginBottom: designTokens.spacing.xs,
  },
  levelDescription: {
    fontSize: designTokens.typography.scale.small.size,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: palette.neutralDark,
    borderRadius: 2,
    marginTop: designTokens.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  connector: {
    width: 20,
    height: 2,
    backgroundColor: palette.divider,
    marginHorizontal: designTokens.spacing.xs,
  },
});



















