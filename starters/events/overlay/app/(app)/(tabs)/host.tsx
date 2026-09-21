import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/Toast';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { createEvent, myEventsQuery, type EventItem } from '@/lib/event-items';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function HostScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { containerPadding } = useResponsive();
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [when, setWhen] = useState('');
  const [busy, setBusy] = useState(false);
  const { data, isLoading } = useCollection<EventItem>(
    () => myEventsQuery(uid!),
    uid ? `events:host:${uid}` : null,
  );

  const publish = async () => {
    if (!uid || !title.trim()) return;
    const startsAt = when ? new Date(when) : new Date(Date.now() + 86400000);
    if (Number.isNaN(startsAt.getTime())) {
      toast(t('events.invalidWhen'), 'danger');
      return;
    }
    setBusy(true);
    try {
      const id = await createEvent({
        title,
        description,
        venue,
        startsAt,
        organizerId: uid,
      });
      setTitle('');
      setDescription('');
      setVenue('');
      setWhen('');
      toast(t('events.created'), 'success');
      router.push(`/event/${id}`);
    } catch {
      toast(t('events.createFailed'), 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padded={false} width="full">
      <List
        data={data}
        keyExtractor={(item) => item.id}
        gap="md"
        contentContainerStyle={{ padding: containerPadding }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <AppHeader
              title={t('events.host')}
              subtitle={t('events.hostSubtitle')}
              trailing={
                <Button title={t('events.door')} size="sm" onPress={() => router.push('/door')} />
              }
            />
            <Card>
              <TextField label={t('events.eventTitle')} value={title} onChangeText={setTitle} />
              <TextField
                label={t('events.eventDescription')}
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <TextField label={t('events.venue')} value={venue} onChangeText={setVenue} />
              <TextField
                label={t('events.startsAt')}
                value={when}
                onChangeText={setWhen}
                placeholder="2026-09-12T19:00"
              />
              <Button
                title={t('events.publishEvent')}
                onPress={() => void publish()}
                loading={busy}
                disabled={!uid || !title.trim()}
              />
            </Card>
            <Text variant="subtitle">{t('events.yourEvents')}</Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <StateView kind="loading" />
          ) : (
            <StateView kind="empty" title={t('events.noHosted')} />
          )
        }
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => router.push(`/event/${item.id}`)} />
        )}
      />
    </Screen>
  );
}
