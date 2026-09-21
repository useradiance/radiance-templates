import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_NAME = '{{radiance.appName}}';
const APP_SLUG = '{{radiance.slug}}';
const APP_SCHEME = '{{radiance.scheme}}';
const BUNDLE_ID = '{{radiance.bundleId}}';

const APP_VARIANT = process.env.APP_VARIANT ?? 'production';
const IS_DEV = APP_VARIANT === 'development';
const IS_PREVIEW = APP_VARIANT === 'preview';

function getUniqueIdentifier(): string {
  if (IS_DEV) return `${BUNDLE_ID}.dev`;
  if (IS_PREVIEW) return `${BUNDLE_ID}.preview`;
  return BUNDLE_ID;
}

function getAppName(): string {
  if (IS_DEV) return `${APP_NAME} (Dev)`;
  if (IS_PREVIEW) return `${APP_NAME} (Preview)`;
  return APP_NAME;
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: APP_SLUG,
  version: '0.1.0',
  orientation: 'portrait',
  scheme: APP_SCHEME,
  userInterfaceStyle: 'automatic',
  // Hermes is the only JS engine (Expo default). Do not add jsEngine — removed from ExpoConfig.
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    googleServicesFile: './GoogleService-Info.plist',
    // radiance:ios:start
    // radiance:ios:end
  },
  android: {
    package: getUniqueIdentifier(),
    googleServicesFile: './google-services.json',
    // radiance:android:start
    // radiance:android:end
  },
  web: {
    bundler: 'metro',
    output: 'single',
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    // radiance:plugins:start
    // radiance:plugins:end
  ],
  experiments: {
    typedRoutes: true,
    // Hosted previews serve each app under a sub-path (`/{appId}`). Expo Router
    // reads location.pathname, so without a baseUrl it treats that prefix as a
    // route, finds nothing, and renders +not-found — and every absolute asset
    // URL misses. Unset for local dev and for apps served from a domain root.
    ...(process.env.EXPO_PUBLIC_BASE_PATH
      ? { baseUrl: process.env.EXPO_PUBLIC_BASE_PATH }
      : {}),
  },
  extra: {
    appVariant: APP_VARIANT,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
