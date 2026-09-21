import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PersonHeader } from '@/components/PersonHeader';
import { PostCard } from '@/components/PostCard';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { useCollection } from '@/hooks/useCollection';
import { useDocument } from '@/hooks/useDocument';
import { useResponsive } from '@/hooks/useResponsive';
import { authorPostsQuery, sortPostsNewestFirst, type Post } from '@/lib/posts';
import { personRef, type Person } from '@/lib/people';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop, containerPadding } = useResponsive();
  const uid = useAuthStore((state) => state.user?.uid ?? null);

  const { data: person, isLoading: personLoading } = useDocument<Person>(
    () => personRef(userId),
    userId ? `person:${userId}` : null,
  );
  const { data: posts, isLoading: postsLoading } = useCollection<Post>(
    () => authorPostsQuery(userId),
    userId ? `posts:author:${userId}` : null,
  );
  const sortedPosts = sortPostsNewestFirst(posts);

  if (uid && userId === uid) {
    return <Redirect href="/(app)/(tabs)/profile" />;
  }

  if (personLoading) {
    return (
      <Screen>
        <StateView kind="loading" />
      </Screen>
    );
  }

  if (!person) {
    return (
      <Screen>
        <StateView kind="empty" title={t('people.notFound')} />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: person.displayName ?? t('people.title') }} />
      <List
        data={sortedPosts}
        keyExtractor={(post) => post.id}
        gap="lg"
        contentContainerStyle={{ padding: containerPadding, flexGrow: 1 }}
        ListHeaderComponent={
          <View
            style={{
              gap: isDesktop ? theme.spacing.xl : theme.spacing.lg,
              marginBottom: theme.spacing.md,
            }}
          >
            <PersonHeader person={person} />
            <SectionHeader size="section" title={t('people.posts')} />
          </View>
        }
        ListEmptyComponent={
          postsLoading ? (
            <StateView kind="loading" />
          ) : (
            <StateView kind="empty" title={t('people.noPosts')} />
          )
        }
        renderItem={({ item }) => <PostCard post={item} />}
      />
    </View>
  );
}
