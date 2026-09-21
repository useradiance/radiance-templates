import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AccountSettingsSection } from '@/components/auth/AccountSettingsSection';
import { AdminSettingsSection } from '@/components/settings/AdminSettingsSection';
import { AppearanceSettingsSection } from '@/components/settings/AppearanceSettingsSection';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop } = useResponsive();

  return (
    <Screen scroll width="wide">
      {isDesktop ? null : <Text variant="title">{t('navigation.settings')}</Text>}
      <SettingsLayout aside={<AdminSettingsSection />}>
        <View style={{ gap: theme.spacing.lg }}>
          <AccountSettingsSection />
          <AppearanceSettingsSection />
        </View>
      </SettingsLayout>
    </Screen>
  );
}
