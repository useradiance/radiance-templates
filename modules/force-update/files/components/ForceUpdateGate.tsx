import { type ReactNode, useCallback, useState } from 'react';
import { Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SCREEN_MAX_WIDTH } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { isWeb } from '@/lib/platform';
import { useRemoteConfig } from '@/lib/remote-config-provider';
import { useTheme } from '@/lib/theme';
import {
  getInstalledVersion,
  isBelowMinVersion,
  resolveUpdateUrl,
  shouldSimulateForceUpdate,
  writeUpdateAck,
  writeWebUpdateAck,
} from '@/lib/version';

type Props = { children: ReactNode; storeUrl?: string };

function reloadWeb(): boolean {
  const location = (globalThis as { location?: { reload: () => void } }).location;
  if (!location?.reload) return false;
  location.reload();
  return true;
}

/**
 * When installed version < Remote Config min_app_version, render a blocking update screen.
 * Otherwise pass children through.
 *
 * In `__DEV__` on iOS/Android, Update now simulates a successful update (clears the gate)
 * instead of opening the store.
 */
export function ForceUpdateGate({ children, storeUrl }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { min_app_version: minVersion } = useRemoteConfig();
  const installed = getInstalledVersion();
  const [, setAckNonce] = useState(0);
  const outdated = isBelowMinVersion(installed, minVersion);

  const openUpdate = useCallback(() => {
    if (shouldSimulateForceUpdate()) {
      writeUpdateAck(minVersion);
      toast(t('forceUpdate.simulated'), 'success');
      setAckNonce((n) => n + 1);
      return;
    }

    if (isWeb) writeWebUpdateAck(minVersion);

    const url = resolveUpdateUrl(storeUrl);
    if (url) {
      void Linking.openURL(url).catch(() => toast(t('forceUpdate.openFailed'), 'danger'));
      return;
    }
    if (isWeb && reloadWeb()) return;
    toast(t('forceUpdate.missingStore'), 'danger');
  }, [minVersion, storeUrl, t]);

  if (!outdated) return <>{children}</>;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: SCREEN_MAX_WIDTH.form,
          padding: theme.spacing.xl,
          gap: theme.spacing.lg,
        }}
      >
        <Text variant="title">{t('forceUpdate.title')}</Text>
        <Text variant="body" tone="muted">
          {t('forceUpdate.description', { minVersion, installed })}
        </Text>
        {shouldSimulateForceUpdate() ? (
          <Text variant="caption" tone="muted">
            {t('forceUpdate.devHint')}
          </Text>
        ) : null}
        <Button
          title={shouldSimulateForceUpdate() ? t('forceUpdate.ctaSimulate') : t('forceUpdate.cta')}
          onPress={openUpdate}
          fullWidth
        />
      </Card>
    </View>
  );
}
