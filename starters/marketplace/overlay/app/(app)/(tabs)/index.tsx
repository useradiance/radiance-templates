import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ListingCard } from '@/components/ListingCard';
import { MapView } from '@/components/MapView';
import { SearchField } from '@/components/SearchField';
import { AppHeader } from '@/components/ui/AppHeader';
import { Chip } from '@/components/ui/Chip';
import { ChipRow } from '@/components/ui/CatalogLayout';
import { List } from '@/components/ui/List';
import { MapListSplit } from '@/components/ui/MapListSplit';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { DEMO_LISTINGS } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { listingsQuery, type Listing } from '@/lib/listings';
import { prefixQuery } from '@/lib/search';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

const CATEGORIES = ['Homes', 'Cabins', 'Studios', 'Lofts'];

export default function BrowseScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { containerPadding } = useResponsive();
  const uid = useAuthStore((s) => s.user?.uid ?? 'preview');
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('Homes');
  const { data: live, isLoading } = useCollection<Listing>(
    () => (term.trim() ? prefixQuery('listings', 'nameLower', term)! : listingsQuery()),
    term.trim() ? `listings:search:${term}` : 'listings:all',
  );

  const data = withDemoFallback(live, DEMO_LISTINGS(uid) as Listing[]);
  const mapped = useMemo(
    () => data.filter((item) => typeof item.lat === 'number' && typeof item.lng === 'number'),
    [data],
  );

  const list = (
    <List
      data={data}
      keyExtractor={(item) => item.id}
      gap="md"
      width="full"
      contentContainerStyle={{ padding: containerPadding }}
      ListHeaderComponent={
        <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
          <AppHeader title={t('marketplace.browse')} subtitle={t('marketplace.browseSubtitle')} />
          <SearchField value={term} onChangeText={setTerm} />
          <ChipRow>
            {CATEGORIES.map((label) => (
              <Chip
                key={label}
                label={label}
                selected={category === label}
                onPress={() => setCategory(label)}
              />
            ))}
          </ChipRow>
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <StateView kind="loading" title={t('marketplace.loading')} />
        ) : (
          <StateView kind="empty" title={t('marketplace.empty')} />
        )
      }
      renderItem={({ item }) => (
        <ListingCard listing={item} onPress={() => router.push(`/listing/${item.id}`)} />
      )}
    />
  );

  const map = mapped[0] ? (
    <MapView
      style={{ flex: 1 }}
      region={{
        latitude: mapped[0].lat!,
        longitude: mapped[0].lng!,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
      markers={mapped.map((item) => ({
        id: item.id,
        title: item.title,
        latitude: item.lat!,
        longitude: item.lng!,
      }))}
    />
  ) : (
    <View style={{ flex: 1, backgroundColor: theme.colors.surfaceMuted }} />
  );

  return (
    <Screen padded={false} width="full">
      <MapListSplit list={list} map={map} listWidth={420} />
    </Screen>
  );
}
