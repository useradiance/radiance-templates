/** Default Remote Config values — keep in sync with the Firebase console. */
export const REMOTE_CONFIG_DEFAULTS = {
  min_app_version: '1.0.0',
  feature_billing_enabled: true,
  welcome_banner: '',
};

export type RemoteConfigKey = keyof typeof REMOTE_CONFIG_DEFAULTS;
export type RemoteConfigValues = {
  min_app_version: string;
  feature_billing_enabled: boolean;
  welcome_banner: string;
};
