import * as Linking from 'expo-linking';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { doc } from 'firebase/firestore';

import { QrCode, ticketPayload } from '@/components/QrCode';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useDocument } from '@/hooks/useDocument';
import { rsvp, rsvpRef, type EventItem, type EventRsvp } from '@/lib/event-items';
import { getDb } from '@/lib/firestore';
import { DEMO_EVENTS } from '@/lib/demo-content';
import { buildShareUrl, shareText } from '@/lib/share';
import { startCheckout } from '@/lib/stripe';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function EventDetail() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const uid = useAuthStore((s) => s.user?.uid);
  const [busy, setBusy] = useState(false);
  const { data: live, isLoading } = useDocument<EventItem>(
    () => doc(getDb(), 'events', eventId),
    eventId ? `event:${eventId}` : null,
  );
  const data = live ?? DEMO_EVENTS.find((entry) => entry.id === eventId) ?? null;
  const { data: myRsvp } = useDocument<EventRsvp>(
    () => rsvpRef(eventId, uid!),
    eventId && uid ? `rsvp:${eventId}:${uid}` : null,
  );

  if (isLoading && !data) return <StateView kind="loading" />;

  const priced = (data?.priceInMinorUnits ?? 0) > 0;
  const going = Boolean(myRsvp);

  return (
    <Screen scroll width="form">
      <Stack.Screen options={{ title: data?.title ?? t('events.title') }} />
      <Text variant="title">{data?.title ?? '…'}</Text>
      <Text variant="body" tone="muted">
        {data?.description}
      </Text>
      <Button
        title={going ? t('events.rsvped') : t('events.rsvp')}
        onPress={() => uid && eventId && rsvp(eventId, uid)}
        disabled={!uid || going}
        fullWidth
      />
      {going && uid && eventId ? (
        <View style={{ gap: theme.spacing.sm, alignItems: 'center' }}>
          <Text variant="caption" tone="muted">
            {t('events.ticketHint')}
          </Text>
          <QrCode value={ticketPayload(eventId, uid)} size={180} />
        </View>
      ) : null}
      {priced ? (
        <Button
          title={t('events.buyTicket')}
          loading={busy}
          disabled={!uid || busy}
          fullWidth
          onPress={() => {
            if (!data) return;
            setBusy(true);
            void startCheckout({
              lineItems: [{ productId: data.id, quantity: 1 }],
              successUrl: Linking.createURL('/'),
              cancelUrl: Linking.createURL(`/event/${data.id}`),
            })
              .then(({ url }) => Linking.openURL(url))
              .catch(() => toast(t('events.ticketError'), 'danger'))
              .finally(() => setBusy(false));
          }}
        />
      ) : null}
      <Button
        title={t('events.share')}
        onPress={() => {
          void shareText(data?.title ?? t('events.title'), buildShareUrl(`/event/${eventId}`)).then(
            (outcome) => {
              if (outcome === 'copied') toast(t('share.copied'));
            },
          );
        }}
        fullWidth
      />
    </Screen>
  );
}
