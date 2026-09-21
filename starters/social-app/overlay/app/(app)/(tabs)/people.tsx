import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { FollowButton } from '@/components/FollowButton';
import { Avatar } from '@/components/ui/Avatar';
import { List } from '@/components/ui/List';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import {
  followersQuery,
  followingQuery,
  followeeIds,
  followerIds,
  relationTo,
  type Follow,
  type Relation,
} from '@/lib/follows';
import { peopleQuery, type Person } from '@/lib/people';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

const RELATION_ORDER: Record<Relation, number> = {
  friends: 0,
  following: 1,
  follower: 2,
  none: 3,
  self: 4,
};

export default function PeopleScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { containerPadding } = useResponsive();
  const uid = useAuthStore((state) => state.user?.uid ?? null);

  const { data: people, isLoading } = useCollection<Person>(() => peopleQuery(), 'people');
  const { data: following } = useCollection<Follow>(
    () => followingQuery(uid!),
    uid ? `following:${uid}` : null,
  );
  const { data: followers } = useCollection<Follow>(
    () => followersQuery(uid!),
    uid ? `followers:${uid}` : null,
  );

  const followingSet = followeeIds(following);
  const followerSet = followerIds(followers);
  const others = people
    .filter((person) => person.uid !== uid)
    .sort((a, b) => {
      const aRel = relationTo(uid ?? '', a.uid, followingSet, followerSet);
      const bRel = relationTo(uid ?? '', b.uid, followingSet, followerSet);
      const delta = RELATION_ORDER[aRel] - RELATION_ORDER[bRel];
      return delta !== 0 ? delta : (a.displayName ?? '').localeCompare(b.displayName ?? '');
    });

  const relationLabel = (relation: Relation) => {
    if (relation === 'friends') return t('people.friends');
    if (relation === 'following') return t('people.following');
    if (relation === 'follower') return t('people.followsYou');
    return t('people.suggested');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <List
        data={others}
        keyExtractor={(person) => person.uid}
        gap="md"
        contentContainerStyle={{ padding: containerPadding, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ marginBottom: theme.spacing.md }}>
            <SectionHeader title={t('people.title')} subtitle={t('people.subtitle')} />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <StateView kind="loading" />
          ) : (
            <StateView
              kind="empty"
              icon="people-outline"
              title={t('people.emptyTitle')}
              description={t('people.emptyDescription')}
            />
          )
        }
        renderItem={({ item }) => {
          const relation = relationTo(uid ?? '', item.uid, followingSet, followerSet);
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.md,
                padding: theme.spacing.md,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.displayName ?? t('feed.anonymous')}
                onPress={() => router.push(`/user/${item.uid}`)}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  minWidth: 0,
                  opacity: pressed ? 0.88 : 1,
                })}
              >
                <Avatar uri={item.photoURL} name={item.displayName} size="md" />
                <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
                  <Text variant="label" weight="semibold" numberOfLines={1}>
                    {item.displayName ?? t('feed.anonymous')}
                  </Text>
                  <Text variant="caption" tone="muted" numberOfLines={1}>
                    {item.bio || relationLabel(relation)}
                  </Text>
                </View>
              </Pressable>
              <FollowButton targetId={item.uid} />
            </View>
          );
        }}
      />
    </View>
  );
}
