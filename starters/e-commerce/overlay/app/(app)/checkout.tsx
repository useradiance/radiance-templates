import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking as RNLinking, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { formatMinorUnits } from '@/lib/format';
import { startCheckout } from '@/lib/stripe';
import { useTheme } from '@/lib/theme';
import { cartCount, cartTotal, useCartStore } from '@/stores/cart';

/**
 * Checkout — opens Stripe Checkout for the current cart.
 * Server recomputes prices; client only sends product ids + quantities + optional discount.
 */
export default function CheckoutScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const lines = useCartStore((state) => state.lines);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');

  const total = cartTotal(lines);
  const count = cartCount(lines);
  const currency = lines[0]?.currency ?? 'USD';

  return (
    <Screen width="form" scroll>
      <Stack.Screen options={{ title: t('shop.checkout') }} />
      <SectionHeader
        title={t('shop.checkout')}
        subtitle={t('shop.checkoutHint', { count, total })}
      />

      <Card>
        {lines.map((line, index) => (
          <View
            key={line.lineKey}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderBottomWidth: index < lines.length - 1 ? 1 : 0,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="body" weight="medium">
                {line.name}
              </Text>
              <Text variant="caption" tone="muted">
                {line.variantLabel ? `${line.variantLabel} · ` : ''}
                {line.quantity} × {formatMinorUnits(line.priceInMinorUnits, line.currency)}
              </Text>
            </View>
            <Text variant="label" weight="semibold">
              {formatMinorUnits(line.priceInMinorUnits * line.quantity, line.currency)}
            </Text>
          </View>
        ))}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: theme.spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <Text variant="subtitle">{t('cart.total')}</Text>
          <Text variant="subtitle">{formatMinorUnits(total, currency)}</Text>
        </View>
      </Card>

      <TextField
        label={t('shop.discountCode')}
        value={discountCode}
        onChangeText={setDiscountCode}
        autoCapitalize="characters"
        placeholder={t('shop.discountPlaceholder')}
      />

      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}

      <Button
        title={t('shop.payWithStripe')}
        fullWidth
        loading={busy}
        disabled={count === 0 || busy}
        onPress={() => {
          setBusy(true);
          setError(null);
          void startCheckout({
            lineItems: lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              variantId: line.variantId ?? undefined,
            })),
            discountCode: discountCode.trim() || undefined,
            successUrl: Linking.createURL('/orders'),
            cancelUrl: Linking.createURL('/cart'),
          })
            .then(({ url }) => RNLinking.openURL(url))
            .catch(() => setError(t('shop.checkoutError')))
            .finally(() => setBusy(false));
        }}
      />
    </Screen>
  );
}
