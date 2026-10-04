import { useEffect, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';
import { requestTrackingPermission } from '@/lib/tracking-permission';
import { useConsentStore } from '@/stores/consent';

export function ConsentProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const analytics = useConsentStore((s) => s.analytics);
  const setAnalytics = useConsentStore((s) => s.setAnalytics);

  useEffect(() => {
    if (Platform.OS !== 'ios' || analytics !== null) return;
    void requestTrackingPermission().then(setAnalytics);
  }, [analytics, setAnalytics]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {analytics === null && Platform.OS === 'web' ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            gap: theme.spacing.sm,
          }}
        >
          <Text variant="body">{t('consent.message')}</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Button title={t('consent.accept')} onPress={() => setAnalytics(true)} />
            <Button title={t('consent.decline')} onPress={() => setAnalytics(false)} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
