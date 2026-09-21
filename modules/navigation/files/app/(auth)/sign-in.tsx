import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

/** Placeholder sign-in route. The `auth` module replaces it with the real screen. */
export default function SignInPlaceholder() {
  const { t } = useTranslation();

  return (
    <Screen width="form" align="center">
      <Text variant="title">{t('navigation.signInPlaceholderTitle')}</Text>
      <Text variant="body" tone="muted">
        {t('navigation.signInPlaceholderBody')}
      </Text>
    </Screen>
  );
}
