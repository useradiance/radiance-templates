import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BarcodeScanner } from '@/components/BarcodeScanner';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTheme } from '@/lib/theme';

export default function ScanScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: t('barcode.title') }} />
      <View style={{ padding: theme.spacing.lg }}>
        <SectionHeader title={t('barcode.title')} subtitle={t('barcode.subtitle')} />
      </View>
      <BarcodeScanner
        onScan={(value) => {
          router.replace({ pathname: '/', params: { scanned: value } });
        }}
      />
    </View>
  );
}
