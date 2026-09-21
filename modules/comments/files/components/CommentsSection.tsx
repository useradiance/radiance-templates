import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useCollection } from '@/hooks/useCollection';
import {
  addComment,
  commentCreatedAt,
  commentsQueryForParent,
  sortComments,
  type Comment,
} from '@/lib/comments';
import { formatRelativeTime } from '@/lib/format';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

type Props = {
  parentPath: string;
  /** Project / article / thread owner — used so cascade delete can remove comments. */
  parentOwnerId?: string | null;
  /** Tighter composer + list for embedding under a feed card. */
  compact?: boolean;
  onViewAll?: () => void;
  onCountChange?: (count: number) => void;
};

export function CommentsSection({
  parentPath,
  parentOwnerId,
  compact = false,
  onViewAll,
  onCountChange,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState('');
  const { data, error } = useCollection<Comment>(
    () => commentsQueryForParent(parentPath),
    parentPath ? `comments:${parentPath}` : null,
  );
  const comments = sortComments(data ?? []);

  useEffect(() => {
    onCountChange?.(comments.length);
  }, [comments.length, onCountChange]);

  const submit = async () => {
    if (!user) return;
    const value = text.trim();
    if (!value) return;
    setText('');
    await addComment({
      parentPath,
      authorId: user.uid,
      authorName: user.displayName,
      parentOwnerId,
      text: value,
    });
  };

  return (
    <View style={{ gap: theme.spacing.md }}>
      {compact ? null : <Text variant="label">{t('comments.title')}</Text>}
      {error ? (
        <Text variant="caption" tone="danger">
          {t('errors.generic')}
        </Text>
      ) : null}
      {comments.map((comment) => {
        const createdAt = commentCreatedAt(comment);
        return (
          <View key={comment.id} style={{ gap: theme.spacing.xs }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: theme.spacing.sm,
              }}
            >
              <Text variant="label" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
                {comment.authorName || t('comments.anonymous')}
              </Text>
              {createdAt ? (
                <Text variant="caption" tone="muted">
                  {formatRelativeTime(createdAt)}
                </Text>
              ) : (
                <Text variant="caption" tone="muted">
                  {t('comments.justNow')}
                </Text>
              )}
            </View>
            <Text variant="body">{comment.text}</Text>
          </View>
        );
      })}
      {user ? (
        compact ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <TextField
                placeholder={t('comments.placeholder')}
                value={text}
                onChangeText={setText}
                onSubmitEditing={() => void submit()}
                returnKeyType="send"
              />
            </View>
            <IconButton
              name="send"
              accessibilityLabel={t('comments.post')}
              disabled={!text.trim()}
              onPress={() => void submit()}
              color={text.trim() ? theme.colors.primary : theme.colors.textMuted}
            />
          </View>
        ) : (
          <View style={{ gap: theme.spacing.sm }}>
            <TextField label={t('comments.placeholder')} value={text} onChangeText={setText} />
            <Button
              title={t('comments.post')}
              onPress={() => void submit()}
              disabled={!text.trim()}
            />
          </View>
        )
      ) : null}
      {onViewAll ? (
        <Button title={t('comments.viewAll')} variant="ghost" onPress={onViewAll} />
      ) : null}
    </View>
  );
}
