import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { SearchField } from '@/components/SearchField';
import { SyncBanner } from '@/components/SyncBanner';
import { AppHeader } from '@/components/ui/AppHeader';
import { CatalogLayout, ChipRow } from '@/components/ui/CatalogLayout';
import { Chip } from '@/components/ui/Chip';
import { Grid } from '@/components/ui/Grid';
import { MediaImage } from '@/components/ui/MediaImage';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive, useResponsiveColumns } from '@/hooks/useResponsive';
import { productsQuery, type Product } from '@/lib/catalog';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { prefixQuery } from '@/lib/search';
import { useTheme } from '@/lib/theme';

function ShopSkeleton({ columns }: { columns: number }) {
  const theme = useTheme();
  const items = Array.from({ length: columns * 2 }, (_, i) => i);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
      {items.map((key) => (
        <View
          key={key}
          style={{ flexGrow: 1, flexBasis: `${Math.floor(100 / columns) - 4}%`, minWidth: 120 }}
        >
          <Card padded={false} style={{ gap: 0, overflow: 'hidden' }}>
            <Skeleton height={140} radius="lg" />
            <View style={{ padding: theme.spacing.md, gap: theme.spacing.xs }}>
              <Skeleton height={14} width="80%" />
              <Skeleton height={14} width="40%" />
            </View>
          </Card>
        </View>
      ))}
    </View>
  );
}

export default function ShopScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { containerPadding } = useResponsive();
  const numColumns = useResponsiveColumns();
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('All');

  const {
    data: live,
    isLoading,
    error,
  } = useCollection<Product>(
    () => (term.trim() ? prefixQuery('products', 'nameLower', term)! : productsQuery()),
    term.trim() ? `products:search:${term}` : 'products:active',
  );

  const products = useMemo(() => {
    const base = withDemoFallback(live, DEMO_PRODUCTS as Product[]);
    if (category === 'All') return base;
    return base.filter((item) => ('category' in item ? item.category === category : true));
  }, [live, category]);

  if (error && products.length === 0 && !isLoading) return <StateView kind="error" />;

  const hero = products[0];

  return (
    <CatalogLayout
      header={
        <View style={{ gap: theme.spacing.lg }}>
          <AppHeader title={t('shop.title')} subtitle={t('shop.subtitle')} />
          {hero?.imageUrl ? (
            <Card padded={false} style={{ overflow: 'hidden', gap: 0 }}>
              <MediaImage uri={hero.imageUrl} aspectRatio={21 / 9} radius="none" />
              <View style={{ padding: theme.spacing.lg, gap: theme.spacing.xs }}>
                <Text variant="caption" tone="muted">
                  {t('shop.featured')}
                </Text>
                <Text variant="title">{hero.name}</Text>
              </View>
            </Card>
          ) : null}
          <SearchField value={term} onChangeText={setTerm} />
        </View>
      }
      filters={
        <ChipRow>
          {DEMO_CATEGORIES.map((label) => (
            <Chip
              key={label}
              label={label}
              selected={category === label}
              onPress={() => setCategory(label)}
            />
          ))}
        </ChipRow>
      }
    >
      <SyncBanner />
      <Grid
        key={`shop-${numColumns}-${term}-${category}`}
        data={products}
        keyExtractor={(product) => product.id}
        numColumns={numColumns}
        gap="md"
        contentContainerStyle={{ padding: containerPadding }}
        ListEmptyComponent={
          isLoading ? (
            <ShopSkeleton columns={numColumns} />
          ) : (
            <StateView
              kind="empty"
              title={t('shop.emptyTitle')}
              description={t('shop.emptyDescription')}
            />
          )
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
        )}
      />
    </CatalogLayout>
  );
}
