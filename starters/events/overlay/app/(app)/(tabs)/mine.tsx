import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EventCard } from '@/components/EventCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { DEMO_EVENTS } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { eventsQuery, myRsvpsQuery, type EventItem, type EventRsvp } from '@/lib/event-items';
import { useAuthStore } from '@/stores/auth';

export default function MyEventsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { containerPadding } = useResponsive();
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const { data: liveEvents } = useCollection<EventItem>(() => eventsQuery(), 'events');
  const events = withDemoFallback(liveEvents, DEMO_EVENTS);
  const { data: rsvps } = useCollection<EventRsvp>(
    () => myRsvpsQuery(uid!),
    uid ? `rsvps:${uid}` : null,
  );

  const going = useMemo(() => {
    const ids = new Set((rsvps ?? []).map((entry) => entry.eventId || entry.id));
    const matched = events.filter((event) => ids.has(event.id));
    if (matched.length > 0) return matched;
    if ((liveEvents?.length ?? 0) === 0) return DEMO_EVENTS.slice(0, 2);
    return [];
  }, [events, rsvps, liveEvents]);

  return (
    <Screen padded={false} width="full">
      <List
        data={going}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: containerPadding }}
        ListHeaderComponent={
          <AppHeader title={t('events.mine')} subtitle={t('events.mineSubtitle')} />
        }
        ListEmptyComponent={<StateView kind="empty" title={t('events.empty')} />}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => router.push(`/event/${item.id}`)} />
        )}
      />
    </Screen>
  );
}
