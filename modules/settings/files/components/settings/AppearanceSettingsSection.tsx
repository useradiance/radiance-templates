import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';
import { useAppearanceStore, type AppearancePreference } from '@/stores/appearance';

const OPTIONS: AppearancePreference[] = ['system', 'light', 'dark'];

export function AppearanceSettingsSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const preference = useAppearanceStore((s) => s.preference);
  const setPreference = useAppearanceStore((s) => s.setPreference);

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="label" tone="muted">
        {t('settings.appearance')}
      </Text>
      {OPTIONS.map((option) => (
        <ListRow
          key={option}
          title={t(`settings.appearance_${option}`)}
          onPress={() => setPreference(option)}
          trailing={
            preference === option ? (
              <Text variant="label" tone="primary">
                ✓
              </Text>
            ) : undefined
          }
        />
      ))}
    </View>
  );
}
