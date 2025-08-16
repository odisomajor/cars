const path = require('path');
const { createExpoWebpackConfigAsync } = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Handle import.meta for web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native': 'react-native-web'
  };

  // Add global polyfill for import.meta
  config.plugins.push(
    new webpack.ProvidePlugin({
      'import.meta': path.resolve(__dirname, 'import-meta-polyfill.js')
    })
  );

  // Define import.meta globally
  config.plugins.push(
    new webpack.DefinePlugin({
      'import.meta': '({ env: (typeof process !== "undefined" && process.env) || {} })'
    })
  );

  return config;
};