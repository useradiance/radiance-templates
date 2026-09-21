import { fetchAndActivate, getRemoteConfig, getValue } from '@react-native-firebase/remote-config';

import { REMOTE_CONFIG_DEFAULTS, type RemoteConfigValues } from '@/lib/remote-config';

/** Native Remote Config — modular RNFirebase API mirrors the JS SDK shape. */
export async function fetchRemoteConfig(): Promise<RemoteConfigValues> {
  const rc = getRemoteConfig();
  rc.settings.minimumFetchIntervalMillis = __DEV__ ? 0 : 3_600_000;
  rc.defaultConfig = { ...REMOTE_CONFIG_DEFAULTS };
  await fetchAndActivate(rc);

  return {
    min_app_version:
      getValue(rc, 'min_app_version').asString() || REMOTE_CONFIG_DEFAULTS.min_app_version,
    feature_billing_enabled: getValue(rc, 'feature_billing_enabled').asBoolean(),
    welcome_banner: getValue(rc, 'welcome_banner').asString(),
  };
}
