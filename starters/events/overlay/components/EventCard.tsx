import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { MediaImage } from '@/components/ui/MediaImage';
import { Text } from '@/components/ui/Text';
import type { EventItem } from '@/lib/event-items';
import { useTheme } from '@/lib/theme';

export function EventCard({ event, onPress }: { event: EventItem; onPress: () => void }) {
  const theme = useTheme();
  const when = (() => {
    const starts = event.startsAt;
    if (!starts) return '';
    const date =
      starts instanceof Date
        ? starts
        : typeof (starts as { seconds?: number }).seconds === 'number'
          ? new Date((starts as { seconds: number }).seconds * 1000)
          : null;
    if (!date) return '';
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  })();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <Card padded={false} style={{ overflow: 'hidden', gap: 0 }}>
        {event.coverUrl ? (
          <MediaImage uri={event.coverUrl} aspectRatio={16 / 9} radius="none" />
        ) : null}
        <View style={{ padding: theme.spacing.lg, gap: theme.spacing.xs }}>
          <Text variant="subtitle">{event.title}</Text>
          {event.venue ? (
            <Text variant="caption" tone="muted">
              {event.venue}
              {event.city ? ` · ${event.city}` : ''}
            </Text>
          ) : null}
          {when ? (
            <Text variant="label" tone="primary">
              {when}
            </Text>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
