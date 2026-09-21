import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { Chip } from '@/components/ui/Chip';
import { ChipRow } from '@/components/ui/CatalogLayout';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { DEMO_EVENTS } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { eventsQuery, type EventItem } from '@/lib/event-items';

export default function EventsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { containerPadding } = useResponsive();
  const { data: live, isLoading } = useCollection<EventItem>(() => eventsQuery(), 'events');
  const data = withDemoFallback(live, DEMO_EVENTS);

  return (
    <Screen padded={false} width="full">
      <List
        data={data}
        keyExtractor={(item) => item.id}
        gap="md"
        contentContainerStyle={{ padding: containerPadding }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 12 }}>
            <AppHeader title={t('events.title')} subtitle={t('events.subtitle')} />
            <ChipRow>
              {['All', 'Tonight', 'This week', 'Free'].map((label, index) => (
                <Chip key={label} label={label} selected={index === 0} onPress={() => undefined} />
              ))}
            </ChipRow>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <StateView kind="loading" />
          ) : (
            <StateView kind="empty" title={t('events.empty')} />
          )
        }
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => router.push(`/event/${item.id}`)} />
        )}
      />
    </Screen>
  );
}
