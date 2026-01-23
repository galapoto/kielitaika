import Constants from 'expo-constants';

export const PRODUCT_NAME =
  Constants.expoConfig?.name || Constants.manifest?.name || 'Kieli Taika';
export const CORRECTION_MODES = ['light', 'medium', 'strict'];
export const LEARNING_PATHS = ['general', 'workplace', 'yki'];
