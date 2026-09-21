import { updateProfile } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { FollowButton } from '@/components/FollowButton';
import { UploadButton } from '@/components/UploadButton';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { getFirebaseAuth } from '@/lib/auth';
import { followersQuery, followingQuery, mutualIds, type Follow } from '@/lib/follows';
import type { Person } from '@/lib/people';
import { useTheme } from '@/lib/theme';

function Stat({ count, label }: { count: number; label: string }) {
  return (
    <View style={{ gap: 2, minWidth: 72 }}>
      <Text variant="subtitle">{count}</Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}

export function PersonHeader({ person, isSelf = false }: { person: Person; isSelf?: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop } = useResponsive();

  const { data: following } = useCollection<Follow>(
    () => followingQuery(person.uid),
    `following:${person.uid}`,
  );
  const { data: followers } = useCollection<Follow>(
    () => followersQuery(person.uid),
    `followers:${person.uid}`,
  );
  const friends = mutualIds(following, followers);

  const body = (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
        <Avatar uri={person.photoURL} name={person.displayName} size={isDesktop ? 'xl' : 'lg'} />
        <View style={{ flex: 1, gap: theme.spacing.xs, minWidth: 0 }}>
          <Text variant="subtitle" numberOfLines={1}>
            {person.displayName ?? t('feed.anonymous')}
          </Text>
          {person.bio ? (
            <Text variant="caption" tone="muted" numberOfLines={2}>
              {person.bio}
            </Text>
          ) : person.email && isSelf ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {person.email}
            </Text>
          ) : null}
          {isSelf ? (
            <UploadButton
              variant="button"
              label={t('profile.changePhoto')}
              pathBuilder={(fileName) => `users/${person.uid}/avatar-${fileName}`}
              onUploaded={async ({ downloadUrl }) => {
                const current = getFirebaseAuth().currentUser;
                if (current) await updateProfile(current, { photoURL: downloadUrl });
              }}
            />
          ) : (
            <FollowButton targetId={person.uid} />
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.xl }}>
        <Stat count={followers.length} label={t('people.followers')} />
        <Stat count={following.length} label={t('people.following')} />
        <Stat count={friends.length} label={t('people.friends')} />
      </View>
    </View>
  );

  if (isDesktop) {
    return <Card>{body}</Card>;
  }

  return body;
}
