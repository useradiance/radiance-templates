import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

type Props = {
  onScan: (value: string, type: string) => void;
};

export function BarcodeScanner({ onScan }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);

  if (!permission?.granted) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        }}
      >
        <Text variant="body">{t('barcode.permission')}</Text>
        <Button title={t('barcode.allow')} onPress={() => void requestPermission()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'upc_a'] }}
        onBarcodeScanned={
          locked
            ? undefined
            : ({ data, type }) => {
                setLocked(true);
                onScan(data, type);
              }
        }
      />
      {locked ? (
        <View style={{ padding: theme.spacing.md }}>
          <Button title={t('barcode.scanAgain')} onPress={() => setLocked(false)} />
        </View>
      ) : null}
    </View>
  );
}
