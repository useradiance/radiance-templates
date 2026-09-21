import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ChannelCard } from '@/components/ChannelCard';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { SplitView } from '@/components/ui/SplitView';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { channelsQuery, threadsQuery, type Channel, type Thread } from '@/lib/community';
import { DEMO_CHANNELS, DEMO_THREADS } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { cachedSource, firestorePrefixSource, localSource } from '@/lib/search-sources';
import { useTheme } from '@/lib/theme';

export default function ChannelsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop, containerPadding } = useResponsive();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: live, isLoading } = useCollection<Channel>(() => channelsQuery(), 'channels');
  const channels = withDemoFallback(live, DEMO_CHANNELS);
  const selected = channels.find((channel) => channel.id === selectedId) ?? channels[0];
  const { data: liveThreads } = useCollection<Thread>(
    () => threadsQuery(selected?.id ?? ''),
    selected ? `threads:${selected.id}` : null,
  );
  const threads = withDemoFallback(liveThreads, selected ? (DEMO_THREADS[selected.id] ?? []) : []);

  const sources = useMemo(
    () => [
      localSource(
        'channels-local',
        DEMO_CHANNELS.map((channel) => ({
          id: channel.id,
          title: `#${channel.name}`,
          subtitle: channel.description,
          href: `/channel/${channel.id}`,
        })),
        t('search.channels'),
      ),
      cachedSource(
        firestorePrefixSource({
          id: 'channels',
          collection: 'channels',
          field: 'nameLower',
          label: t('search.channels'),
          map: (id, data) => ({
            id,
            title: `#${String(data.name ?? id)}`,
            subtitle: data.description ? String(data.description) : null,
            href: `/channel/${id}`,
          }),
        }),
      ),
    ],
    [t],
  );

  const master = (
    <List
      data={channels}
      keyExtractor={(item) => item.id}
      gap="sm"
      width="full"
      contentContainerStyle={{ padding: containerPadding }}
      ListHeaderComponent={
        <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
          <AppHeader title={t('community.channels')} subtitle={t('community.channelsSubtitle')} />
          <SearchAutocomplete
            sources={sources}
            onSelect={(hit) => {
              if (!hit.href) return;
              if (isDesktop) setSelectedId(hit.id);
              else router.push(hit.href as Href);
            }}
          />
        </View>
      }
      ListEmptyComponent={isLoading ? <StateView kind="loading" /> : <StateView kind="empty" />}
      renderItem={({ item }) => (
        <ChannelCard
          channel={item}
          onPress={() => {
            if (isDesktop) setSelectedId(item.id);
            else router.push(`/channel/${item.id}`);
          }}
        />
      )}
    />
  );

  const detail = selected ? (
    <View style={{ flex: 1, padding: containerPadding, gap: theme.spacing.md }}>
      <Text variant="title">#{selected.name}</Text>
      <Text variant="caption" tone="muted">
        {selected.description}
      </Text>
      {threads.map((thread) => (
        <Pressable
          key={thread.id}
          accessibilityRole="button"
          onPress={() => router.push(`/thread/${selected.id}/${thread.id}`)}
        >
          <Card>
            <Text variant="subtitle">{thread.title}</Text>
          </Card>
        </Pressable>
      ))}
    </View>
  ) : (
    <StateView kind="empty" title={t('community.selectChannel')} />
  );

  return (
    <Screen padded={false} width="full">
      <SplitView master={master} detail={detail} masterWidth={300} />
    </Screen>
  );
}
