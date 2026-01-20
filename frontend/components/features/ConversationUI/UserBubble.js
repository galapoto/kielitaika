// ============================================================================
// UserBubble - User message bubble (premium version)
// ============================================================================

import React from 'react';
import ConversationBubble from './ConversationBubble';
import { colors } from '../../../design/colors';
import { gradients } from '../../../design/gradients';

/**
 * UserBubble
 * 
 * TODO: Codex to implement:
 * - Sent/delivered indicators
 * - Error state
 * - Retry button
 */
export default function UserBubble({ message, timestamp, ...props }) {
  return (
    <ConversationBubble
      message={message}
      isUser={true}
      timestamp={timestamp}
      {...props}
    />
  );
}


