// ============================================================================
// MOTION SYSTEM - Animation Curves & Timing Presets
// ============================================================================

export const motion = {
  // Easing curves
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
    easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Duration presets (in milliseconds)
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1200,
  },

  // Spring configurations (for react-native-reanimated)
  spring: {
    gentle: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 200,
      mass: 1,
    },
    snappy: {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    },
  },

  // Stagger delays (for sequential animations)
  stagger: {
    fast: 50,
    normal: 100,
    slow: 200,
  },
};


