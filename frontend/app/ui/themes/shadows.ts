import { Platform } from 'react-native';

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: Platform.OS === 'android' ? 10 : 0,
  },
  glow: {
    shadowColor: '#7EDBFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
};
