import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { isDesktop } = useResponsive();

  return (
    <Screen scroll width="feed">
      <Stack.Screen options={{ title: t('navigation.settings') }} />
      {isDesktop ? null : <Text variant="title">{t('navigation.settings')}</Text>}

      {/* radiance:settings:start */}
      {/* radiance:settings:end */}
    </Screen>
  );
}
