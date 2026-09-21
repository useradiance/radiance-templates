import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { LocationCard } from '@/components/LocationCard';
import { MapView } from '@/components/MapView';
import { SeoHead } from '@/components/SeoHead';
import { AppHeader } from '@/components/ui/AppHeader';
import { Chip } from '@/components/ui/Chip';
import { ChipRow } from '@/components/ui/CatalogLayout';
import { List } from '@/components/ui/List';
import { MapListSplit } from '@/components/ui/MapListSplit';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { TextField } from '@/components/ui/TextField';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { DEMO_LOCATIONS } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { locationsQuery, type Location } from '@/lib/locations';
import { searchPlaces, type PlaceResult } from '@/lib/places';
import { useTheme } from '@/lib/theme';

const NEIGHBORHOODS = ['All', 'Embarcadero', 'Mission', 'Hayes Valley', 'Sunset'];

export default function LocationsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { containerPadding } = useResponsive();
  const { data: live, isLoading } = useCollection<Location>(() => locationsQuery(), 'locations');
  const [term, setTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const data = withDemoFallback(live, DEMO_LOCATIONS as Location[]).filter((item) =>
    filter === 'All' ? true : item.neighborhood === filter,
  );
  const first = data[0];

  const list = (
    <List
      data={data}
      keyExtractor={(item) => item.id}
      gap="md"
      width="full"
      contentContainerStyle={{ padding: containerPadding }}
      ListHeaderComponent={
        <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
          <AppHeader title={t('local.locations')} subtitle={t('local.locationsSubtitle')} />
          <TextField
            label={t('local.searchPlaces')}
            value={term}
            onChangeText={(value) => {
              setTerm(value);
              void searchPlaces(value).then(setPlaces);
            }}
          />
          <ChipRow>
            {NEIGHBORHOODS.map((label) => (
              <Chip
                key={label}
                label={label}
                selected={filter === label}
                onPress={() => setFilter(label)}
              />
            ))}
          </ChipRow>
          {places.slice(0, 3).map((place) => (
            <LocationCard
              key={place.id}
              location={{
                id: place.id,
                name: place.name,
                address: place.address ?? '',
                lat: place.lat,
                lng: place.lng,
              }}
            />
          ))}
        </View>
      }
      ListEmptyComponent={isLoading ? <StateView kind="loading" /> : <StateView kind="empty" />}
      renderItem={({ item }) => <LocationCard location={item} />}
    />
  );

  const map = first ? (
    <MapView
      style={{ flex: 1 }}
      region={{
        latitude: first.lat,
        longitude: first.lng,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      }}
      markers={data.map((item) => ({
        id: item.id,
        title: item.name,
        latitude: item.lat,
        longitude: item.lng,
      }))}
    />
  ) : (
    <View style={{ flex: 1, backgroundColor: theme.colors.surfaceMuted }} />
  );

  return (
    <Screen padded={false} width="full">
      <SeoHead title={t('local.locations')} description={t('local.locationsSubtitle')} path="/" />
      <MapListSplit list={list} map={map} listWidth={400} />
    </Screen>
  );
}
