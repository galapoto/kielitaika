// ============================================================================
// TutorBubble - AI tutor message bubble (premium version)
// ============================================================================

import React from 'react';
import ConversationBubble from './ConversationBubble';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';

/**
 * TutorBubble
 * 
 * TODO: Codex to implement:
 * - Avatar animation
 * - Typing indicator
 * - Progressive disclosure animations
 * - Grammar highlights
 */
export default function TutorBubble({ message, timestamp, ...props }) {
  return (
    <ConversationBubble
      message={message}
      isUser={false}
      timestamp={timestamp}
      {...props}
    />
  );
}


