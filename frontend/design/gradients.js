// ============================================================================
// GRADIENT SYSTEM - PUHIS 2026 Edition
// ============================================================================

export const gradients = {
  // Hero gradient (main hero section)
  hero: {
    colors: ['#0A0E27', '#151B38', '#1A1F3A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 0.5, 1],
  },

  // Card gradient (for glass cards)
  card: {
    colors: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 1],
  },

  // Accent gradient (for CTA buttons, highlights)
  accent: {
    colors: ['#00E5B0', '#00D4FF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 1],
  },

  // Royal gradient (for primary actions)
  royal: {
    colors: ['#1B4EDA', '#3A6EE8'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 1],
  },

  // Mint gradient (for success states)
  mint: {
    colors: ['#00E5B0', '#33FFD6'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
    locations: [0, 1],
  },

  // Cyan gradient (for info states)
  cyan: {
    colors: ['#00D4FF', '#33E0FF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
    locations: [0, 1],
  },

  // Overlay gradient (for modals, bottom sheets)
  overlay: {
    colors: ['rgba(10, 14, 39, 0.95)', 'rgba(10, 14, 39, 0.85)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    locations: [0, 1],
  },
};


