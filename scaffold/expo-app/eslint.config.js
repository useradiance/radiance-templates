const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Cloud Functions are a separate package with their own dependencies and tsconfig;
    // they are checked by `yarn --cwd functions build`.
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'functions/*'],
  },
]);
