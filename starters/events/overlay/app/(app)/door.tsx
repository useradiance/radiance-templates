import { Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';

import { BarcodeScanner } from '@/components/BarcodeScanner';
import { parseTicketPayload } from '@/components/QrCode';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { getDb } from '@/lib/firestore';
import { useTheme } from '@/lib/theme';

export default function DoorScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'ok' | 'invalid' | null>(null);
  const [scanKey, setScanKey] = useState(0);

  return (
    <Screen padded={false} width="full">
      <Stack.Screen options={{ title: t('events.door') }} />
      <View style={{ flex: 1 }}>
        <BarcodeScanner
          key={scanKey}
          onScan={(value) => {
            const parsed = parseTicketPayload(value);
            if (!parsed) {
              setStatus('invalid');
              setResult(t('events.invalidTicket'));
              return;
            }
            void getDoc(doc(getDb(), 'events', parsed.eventId, 'rsvps', parsed.userId)).then(
              (snap) => {
                if (!snap.exists()) {
                  setStatus('invalid');
                  setResult(t('events.noRsvp'));
                  return;
                }
                setStatus('ok');
                setResult(t('events.admitted', { eventId: parsed.eventId }));
              },
            );
          }}
        />
        {result ? (
          <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
            <Text variant="subtitle" tone={status === 'ok' ? 'primary' : 'danger'}>
              {result}
            </Text>
            <Button
              title={t('barcode.scanAgain')}
              onPress={() => {
                setResult(null);
                setStatus(null);
                setScanKey((key) => key + 1);
              }}
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
