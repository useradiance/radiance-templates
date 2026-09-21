import { Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { purchaseCurrentOffering } from '@/lib/iap';

export default function PaywallScreen() {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  return (
    <Screen width="form">
      <Stack.Screen options={{ title: t('iap.title') }} />
      <Text variant="display">{t('iap.title')}</Text>
      <Text variant="body" tone="muted">
        {Platform.OS === 'web' ? t('iap.webHint') : t('iap.body')}
      </Text>
      <Button
        title={t('iap.buy')}
        loading={busy}
        disabled={Platform.OS === 'web' || busy}
        fullWidth
        onPress={() => {
          setBusy(true);
          void purchaseCurrentOffering()
            .then((ok) =>
              toast(ok ? t('iap.thanks') : t('iap.unavailable'), ok ? 'success' : 'danger'),
            )
            .catch(() => toast(t('iap.error'), 'danger'))
            .finally(() => setBusy(false));
        }}
      />
    </Screen>
  );
}
