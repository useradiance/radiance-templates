import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <Text variant="display">{t('common.appName')}</Text>
      <Text variant="body" tone="muted">
        {t('navigation.homeIntro')}
      </Text>
    </Screen>
  );
}
