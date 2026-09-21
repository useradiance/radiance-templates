import * as Linking from 'expo-linking';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { doc } from 'firebase/firestore';

import { Button } from '@/components/ui/Button';
import { MediaImage } from '@/components/ui/MediaImage';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useDocument } from '@/hooks/useDocument';
import { useResponsive } from '@/hooks/useResponsive';
import { getDb } from '@/lib/firestore';
import type { Listing } from '@/lib/listings';
import { startCheckout } from '@/lib/stripe';

export default function ListingDetail() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { t } = useTranslation();
  const { isDesktop } = useResponsive();
  const [busy, setBusy] = useState(false);
  const { data, isLoading } = useDocument<Listing>(
    () => doc(getDb(), 'listings', listingId),
    listingId ? `listing:${listingId}` : null,
  );
  const title = data?.title ?? t('marketplace.browse');

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <StateView kind="loading" />
      </>
    );
  }
  if (!data) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <StateView kind="empty" title={t('marketplace.loading')} />
      </>
    );
  }

  const price = `${(data.priceInMinorUnits / 100).toFixed(2)} ${data.currency.toUpperCase()}`;

  return (
    <Screen scroll width="form">
      <Stack.Screen options={{ title: data.title }} />
      <MediaImage uri={data.imageUrl} aspectRatio={4 / 3} />
      <Text variant={isDesktop ? 'title' : 'display'}>{data.title}</Text>
      <Text variant="title" tone="primary">
        {price}
      </Text>
      <Text variant="body" tone="muted">
        {data.description}
      </Text>
      <Button
        title={t('marketplace.buy')}
        fullWidth={!isDesktop}
        loading={busy}
        onPress={() => {
          setBusy(true);
          void startCheckout({
            lineItems: [{ productId: data.id, quantity: 1 }],
            successUrl: Linking.createURL('/'),
            cancelUrl: Linking.createURL(`/listing/${data.id}`),
          })
            .then(({ url }) => Linking.openURL(url))
            .catch(() => toast(t('marketplace.buyError'), 'danger'))
            .finally(() => setBusy(false));
        }}
      />
    </Screen>
  );
}
