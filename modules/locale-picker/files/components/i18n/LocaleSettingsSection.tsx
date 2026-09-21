import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { supportedLocales } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useLocaleStore, type LocalePreference } from '@/stores/locale';

const DISPLAY_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  ar: 'العربية',
  nl: 'Nederlands',
  pl: 'Polski',
  sv: 'Svenska',
  tr: 'Türkçe',
};

function labelFor(code: string): string {
  return DISPLAY_NAMES[code] ?? code;
}

/** Language block for the settings screen. */
export function LocaleSettingsSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const preference = useLocaleStore((state) => state.preference);
  const setPreference = useLocaleStore((state) => state.setPreference);

  const options: LocalePreference[] = ['system', ...supportedLocales];

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="label" tone="muted">
        {t('locale.title')}
      </Text>
      <Text variant="caption" tone="muted">
        {t('locale.hint')}
      </Text>
      {options.map((option) => (
        <ListRow
          key={option}
          title={option === 'system' ? t('locale.system') : labelFor(option)}
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
