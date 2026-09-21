import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { CommentsSection } from '@/components/CommentsSection';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { MediaImage } from '@/components/ui/MediaImage';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useDocument } from '@/hooks/useDocument';
import { countCommentsForParent } from '@/lib/comments';
import { formatRelativeTime } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { postLikeRef, setLike, type Post, type PostLike } from '@/lib/posts';
import { buildShareUrl, shareText } from '@/lib/share';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export type PostCardProps = {
  post: Post;
  onPressAuthor?: (authorId: string) => void;
  /** Alias of `onPressAuthor` for generated / LLM-authored screens. */
  onPress?: (authorId: string) => void;
};

export function PostCard({ post, onPressAuthor, onPress }: PostCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  const handleAuthorPress = onPressAuthor ?? onPress;
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);

  useEffect(() => {
    setCommentCount((current) => Math.max(current, post.commentCount ?? 0));
  }, [post.commentCount]);

  useEffect(() => {
    let cancelled = false;
    void countCommentsForParent(`posts/${post.id}`)
      .then((count) => {
        if (!cancelled) setCommentCount((current) => Math.max(current, count));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [post.id]);

  const { data: likeDoc } = useDocument<PostLike>(
    () => postLikeRef(post.id, uid!),
    uid ? `like:${post.id}:${uid}` : null,
  );
  const liked = Boolean(likeDoc);

  const createdAt = post.createdAt?.toDate?.();

  const toggleLike = async () => {
    if (!uid) return;
    const next = !liked;
    void haptic('light');
    try {
      await setLike(post.id, uid, next);
    } catch {
      // Snapshot will revert the heart if the write fails.
    }
  };

  const goToAuthor = () => {
    if (handleAuthorPress) {
      handleAuthorPress(post.authorId);
      return;
    }
    if (!post.authorId) return;
    if (uid && post.authorId === uid) {
      router.push('/profile');
      return;
    }
    router.push(`/user/${post.authorId}`);
  };

  return (
    <Card>
      <Pressable
        onPress={goToAuthor}
        style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}
      >
        <Avatar uri={post.authorPhotoURL} name={post.authorName} size="md" />

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" weight="semibold">
            {post.authorName ?? t('feed.anonymous')}
          </Text>
          {createdAt ? (
            <Text variant="caption" tone="muted">
              {formatRelativeTime(createdAt)}
            </Text>
          ) : (
            <Text variant="caption" tone="muted">
              {t('feed.sending')}
            </Text>
          )}
        </View>
      </Pressable>

      <Pressable onPress={() => router.push(`/post/${post.id}`)}>
        {post.text ? <Text variant="body">{post.text}</Text> : null}
        {post.imageUrl ? <MediaImage uri={post.imageUrl} aspectRatio={4 / 3} /> : null}
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: theme.spacing.xs,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('feed.like')}
          onPress={toggleLike}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            paddingVertical: theme.spacing.sm,
            paddingRight: theme.spacing.md,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? theme.colors.danger : theme.colors.textMuted}
          />
          <Text variant="caption" tone={liked ? 'danger' : 'muted'} weight="medium">
            {post.likeCount}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('feed.comment')}
          onPress={() => setCommentsOpen((open) => !open)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            paddingVertical: theme.spacing.sm,
            paddingRight: theme.spacing.md,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons
            name={commentsOpen ? 'chatbubble' : 'chatbubble-outline'}
            size={20}
            color={theme.colors.textMuted}
          />
          <Text variant="caption" tone="muted" weight="medium">
            {commentCount}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('feed.share')}
          onPress={() => {
            void shareText(post.text || t('feed.title'), buildShareUrl(`/post/${post.id}`)).then(
              (outcome) => {
                if (outcome === 'copied') toast(t('share.copied'));
              },
            );
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            paddingVertical: theme.spacing.sm,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="share-outline" size={20} color={theme.colors.textMuted} />
          <Text variant="caption" tone="muted" weight="medium">
            {t('feed.share')}
          </Text>
        </Pressable>
      </View>

      {commentsOpen ? (
        <CommentsSection
          parentPath={`posts/${post.id}`}
          compact
          onViewAll={() => router.push(`/post/${post.id}`)}
          onCountChange={(count) => setCommentCount((current) => Math.max(current, count))}
        />
      ) : null}
    </Card>
  );
}
