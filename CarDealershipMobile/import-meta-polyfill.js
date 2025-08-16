// Polyfill for import.meta to handle web builds
module.exports = {
  env: (typeof process !== 'undefined' && process.env) || {},
  url: (typeof window !== 'undefined' && window.location && window.location.href) || 'file://'
};