const upstreamTransformer = require('metro-react-native-babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  // Replace import.meta usage with a polyfill
  if (src.includes('import.meta')) {
    src = src.replace(
      /import\.meta\.env/g,
      '(typeof process !== "undefined" && process.env || {})'
    );
    src = src.replace(
      /import\.meta/g,
      '({ env: (typeof process !== "undefined" && process.env || {}), url: (typeof window !== "undefined" && window.location && window.location.href || "file://") })'
    );
  }

  return upstreamTransformer.transform({ src, filename, options });
};