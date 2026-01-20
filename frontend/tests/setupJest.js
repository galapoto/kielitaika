// Ensure navigator/window exist before jest-expo setup mutates them
if (typeof navigator === 'undefined') {
  global.navigator = {};
}
if (typeof navigator.product === 'undefined') {
  navigator.product = 'ReactNative';
}
if (typeof window === 'undefined') {
  global.window = {};
}
if (typeof window.document === 'undefined') {
  window.document = {};
}

// Mock AsyncStorage for Jest environment
jest.mock('@react-native-async-storage/async-storage', () => {
  const mock = require('@react-native-async-storage/async-storage/jest/async-storage-mock');
  return {
    __esModule: true,
    default: mock,
  };
});

// Silence react-native-reanimated warning in jest
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
