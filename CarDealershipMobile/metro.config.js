const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Custom transformer to handle import.meta
config.transformer = {
  ...config.transformer,
  babelTransformerPath: path.resolve(__dirname, 'custom-transformer.js'),
};

// Configure resolver for better module resolution
config.resolver = {
  ...config.resolver,
  alias: {
    'react-native': 'react-native-web',
  },
  resolverMainFields: ['react-native', 'browser', 'main'],
  platforms: ['ios', 'android', 'native', 'web'],
};

module.exports = config;