const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The Firebase JS SDK ships CommonJS builds that Metro only resolves when `cjs`
// is a known source extension.
config.resolver.sourceExts = [...new Set([...config.resolver.sourceExts, 'cjs'])];

module.exports = config;
