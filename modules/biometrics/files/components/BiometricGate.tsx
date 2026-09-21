import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import {
  authenticateLocal,
  isAppLockEnabled,
  isBiometricHardwareAvailable,
} from '@/lib/biometrics';
import { useTheme } from '@/lib/theme';

export function BiometricGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [unlocked, setUnlocked] = useState(false);
  const [required, setRequired] = useState(false);

  useEffect(() => {
    void (async () => {
      const enabled = await isAppLockEnabled();
      setRequired(enabled);
      if (!enabled) {
        setUnlocked(true);
        return;
      }
      const okHardware = await isBiometricHardwareAvailable();
      if (!okHardware) {
        setUnlocked(true);
        return;
      }
      const ok = await authenticateLocal(t('biometrics.prompt'));
      setUnlocked(ok);
    })();
  }, [t]);

  if (!required || unlocked) return <>{children}</>;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        gap: theme.spacing.lg,
      }}
    >
      <Text variant="title">{t('biometrics.locked')}</Text>
      <Button
        title={t('biometrics.unlock')}
        onPress={async () => {
          const ok = await authenticateLocal(t('biometrics.prompt'));
          setUnlocked(ok);
        }}
        fullWidth
      />
    </View>
  );
}
