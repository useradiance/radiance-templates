import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ChipRow } from '@/components/ui/CatalogLayout';
import { MediaDetail } from '@/components/ui/MediaDetail';
import { MediaImage } from '@/components/ui/MediaImage';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useDocument } from '@/hooks/useDocument';
import { productRef, type Product } from '@/lib/catalog';
import { DEMO_PRODUCTS } from '@/lib/demo-content';
import { formatMinorUnits } from '@/lib/format';
import { useTheme } from '@/lib/theme';
import { useCartStore } from '@/stores/cart';

export default function ProductScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const addToCart = useCartStore((state) => state.add);

  const { data: live, isLoading } = useDocument<Product>(
    () => productRef(productId),
    productId ? `products:${productId}` : null,
  );

  const product = live ?? DEMO_PRODUCTS.find((item) => item.id === productId);
  const variants = product?.variants ?? [];
  const [variantId, setVariantId] = useState<string | null>(null);
  const selected = useMemo(
    () => variants.find((entry) => entry.id === (variantId ?? variants[0]?.id)) ?? null,
    [variantId, variants],
  );
  const price = selected?.priceInMinorUnits ?? product?.priceInMinorUnits ?? 0;
  const stock = selected?.inventory ?? product?.inventory;
  const soldOut = typeof stock === 'number' && stock <= 0;

  if (isLoading && !product) {
    return (
      <>
        <Stack.Screen options={{ title: t('shop.title') }} />
        <StateView kind="loading" />
      </>
    );
  }
  if (!product) {
    return (
      <>
        <Stack.Screen options={{ title: t('shop.productNotFound') }} />
        <StateView kind="empty" title={t('shop.productNotFound')} />
      </>
    );
  }

  return (
    <Screen scroll padded={false} width="full">
      <Stack.Screen options={{ title: product.name }} />
      <MediaDetail media={<MediaImage uri={product.imageUrl} aspectRatio={1} radius="xl" />}>
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="display">{product.name}</Text>
          <Text variant="title" tone="primary">
            {formatMinorUnits(price, product.currency)}
          </Text>
          {typeof stock === 'number' ? (
            <Text variant="caption" tone="muted">
              {soldOut ? t('shop.soldOut') : t('shop.inStock', { count: stock })}
            </Text>
          ) : null}
        </View>
        <Text variant="body" tone="muted">
          {product.description}
        </Text>
        {variants.length > 0 ? (
          <ChipRow>
            {variants.map((variant) => (
              <Chip
                key={variant.id}
                label={variant.label}
                selected={(selected?.id ?? variants[0]?.id) === variant.id}
                onPress={() => setVariantId(variant.id)}
              />
            ))}
          </ChipRow>
        ) : null}
        <Button
          title={t('shop.addToCart')}
          disabled={soldOut}
          onPress={() => {
            addToCart({
              ...product,
              priceInMinorUnits: price,
              variantId: selected?.id,
              variantLabel: selected?.label,
            });
            router.push('/cart');
          }}
        />
      </MediaDetail>
    </Screen>
  );
}
