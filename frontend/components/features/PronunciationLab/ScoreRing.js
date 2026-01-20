// ============================================================================
// ScoreRing - Pronunciation score visualization
// ============================================================================

import React from 'react';
import ProgressRing from '../../core/ProgressRing';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';

/**
 * ScoreRing
 * 
 * TODO: Codex to implement:
 * - Animated score updates
 * - Color changes based on score (red/yellow/green)
 * - Celebration animations for high scores
 * - Multiple score rings (accuracy, fluency, etc.)
 */
export default function ScoreRing({ 
  score = 0,
  label = 'Score',
  size = 120,
  style,
  ...props 
}) {
  const getColor = () => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <ProgressRing
      progress={score}
      size={size}
      color={getColor()}
      label={label}
      style={style}
      {...props}
    />
  );
}


