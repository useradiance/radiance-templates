import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PersonHeader } from '@/components/PersonHeader';
import { PostCard } from '@/components/PostCard';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { authorPostsQuery, sortPostsNewestFirst, type Post } from '@/lib/posts';
import { personFromAuth } from '@/lib/people';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop, containerPadding } = useResponsive();
  const user = useAuthStore((state) => state.user);

  const { data: posts, isLoading } = useCollection<Post>(
    () => authorPostsQuery(user!.uid),
    user ? `posts:author:${user.uid}` : null,
  );
  const sortedPosts = sortPostsNewestFirst(posts);

  if (!user) {
    return (
      <Screen>
        <StateView kind="empty" title={t('profile.signedOutTitle')} />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <List
        data={sortedPosts}
        keyExtractor={(post) => post.id}
        gap="lg"
        contentContainerStyle={{
          padding: containerPadding,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View
            style={{
              gap: isDesktop ? theme.spacing.xl : theme.spacing.lg,
              marginBottom: theme.spacing.md,
            }}
          >
            <PersonHeader person={personFromAuth(user)} isSelf />
            <SectionHeader size="section" title={t('profile.yourPosts')} />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <StateView kind="loading" />
          ) : (
            <StateView
              kind="empty"
              icon="person-outline"
              title={t('profile.noPostsTitle')}
              description={t('profile.noPostsDescription')}
            />
          )
        }
        renderItem={({ item }) => <PostCard post={item} />}
      />
    </View>
  );
}
