import { useTranslation } from 'react-i18next';

import { TextField } from '@/components/ui/TextField';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchField({ value, onChangeText, placeholder }: Props) {
  const { t } = useTranslation();
  return (
    <TextField
      label={t('search.label')}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder ?? t('search.placeholder')}
      autoCapitalize="none"
      autoCorrect={false}
      clearButtonMode="while-editing"
    />
  );
}
