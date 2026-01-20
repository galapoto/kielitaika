module.exports = {
  preset: 'react-native',
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/tests/setupJest.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-native-community|@testing-library|expo(nent)?|@expo(nent)?/.*|react-native-reanimated|react-native-gesture-handler|react-clone-referenced-element|expo-font)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};
