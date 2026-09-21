import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { SyncBanner } from '@/components/SyncBanner';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { FeedLayout } from '@/components/ui/FeedLayout';
import { List } from '@/components/ui/List';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { DEMO_PEOPLE, DEMO_POSTS } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { feedQuery, type Post } from '@/lib/posts';
import {
  cachedSource,
  firestoreKeywordSource,
  firestorePrefixSource,
  localSource,
} from '@/lib/search-sources';
import { useTheme } from '@/lib/theme';

function FeedSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.lg }}>
      {[0, 1, 2].map((key) => (
        <Card key={key} style={{ gap: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' }}>
            <Skeleton width={40} height={40} radius="pill" />
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Skeleton width="40%" height={14} />
              <Skeleton width="25%" height={12} />
            </View>
          </View>
          <Skeleton height={16} />
          <Skeleton height={180} radius="lg" />
        </Card>
      ))}
    </View>
  );
}

export default function FeedScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { containerPadding } = useResponsive();
  const { data: live, isLoading, error } = useCollection<Post>(() => feedQuery(), 'posts:feed');
  const posts = withDemoFallback(live, DEMO_POSTS);

  const sources = useMemo(
    () => [
      localSource(
        'posts-local',
        DEMO_POSTS.map((post) => ({
          id: post.id,
          title: post.text.slice(0, 80) || t('feed.postTitle'),
          subtitle: post.authorName,
          href: `/post/${post.id}`,
        })),
        t('search.posts'),
      ),
      localSource(
        'people-local',
        DEMO_PEOPLE.map((person) => ({
          id: person.id,
          title: person.displayName,
          subtitle: person.bio,
          href: `/user/${person.id}`,
        })),
        t('search.people'),
      ),
      cachedSource(
        firestorePrefixSource({
          id: 'people',
          collection: 'users',
          field: 'nameLower',
          label: t('search.people'),
          map: (id, data) => ({
            id,
            title: String(data.displayName ?? ''),
            subtitle: data.bio ? String(data.bio) : null,
            href: `/user/${id}`,
          }),
        }),
      ),
      cachedSource(
        firestoreKeywordSource({
          id: 'posts',
          collection: 'posts',
          label: t('search.posts'),
          map: (id, data) => ({
            id,
            title: String(data.text ?? '').slice(0, 80),
            subtitle: data.authorName ? String(data.authorName) : null,
            href: `/post/${id}`,
          }),
        }),
      ),
    ],
    [t],
  );

  if (error && posts.length === 0 && !isLoading) {
    return <StateView kind="error" />;
  }

  const rail = (
    <Card>
      <Text variant="subtitle">{t('people.title')}</Text>
      <Text variant="caption" tone="muted">
        {t('feed.suggestions')}
      </Text>
      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.sm }}>
        {['Maya Chen', 'Jordan Hale', 'Priya Nair'].map((name) => (
          <View
            key={name}
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
          >
            <Avatar name={name} size="sm" />
            <Text variant="label" weight="semibold">
              {name}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SyncBanner />
      <FeedLayout rail={rail}>
        <List
          data={posts}
          keyExtractor={(post) => post.id}
          gap="lg"
          width="full"
          contentContainerStyle={{ padding: containerPadding, flexGrow: 1 }}
          ListHeaderComponent={
            <View style={{ marginBottom: theme.spacing.md }}>
              <SearchAutocomplete
                sources={sources}
                onSelect={(hit) => {
                  if (hit.href) router.push(hit.href as Href);
                }}
              />
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <FeedSkeleton />
            ) : (
              <StateView
                kind="empty"
                icon="newspaper-outline"
                title={t('feed.emptyTitle')}
                description={t('feed.emptyDescription')}
                actionLabel={t('feed.compose')}
                onAction={() => router.push('/new-post')}
              />
            )
          }
          renderItem={({ item }) => <PostCard post={item} />}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && posts.length > 0}
              onRefresh={() => undefined}
            />
          }
        />
      </FeedLayout>
    </View>
  );
}
