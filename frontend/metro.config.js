// Expo-first Metro configuration
// This extends Expo's default Metro config, ensuring all Expo features work correctly
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Extend Expo's default config with project-specific settings
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];
config.resolver.assetExts.push('db', 'mp4', 'wav', 'mp3');
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx');
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;

