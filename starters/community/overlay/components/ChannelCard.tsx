import { Pressable } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { Channel } from '@/lib/community';

export function ChannelCard({ channel, onPress }: { channel: Channel; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <Card>
        <Text variant="subtitle">#{channel.name}</Text>
        {channel.description ? (
          <Text variant="body" tone="muted" numberOfLines={2}>
            {channel.description}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}
