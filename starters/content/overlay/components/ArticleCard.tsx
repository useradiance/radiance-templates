import { Pressable } from 'react-native';

import { Card } from '@/components/ui/Card';
import { MediaImage } from '@/components/ui/MediaImage';
import { Text } from '@/components/ui/Text';
import type { Article } from '@/lib/articles';

export function ArticleCard({ article, onPress }: { article: Article; onPress?: () => void }) {
  const body = (
    <Card>
      {article.coverUrl ? (
        <MediaImage
          uri={article.coverUrl}
          aspectRatio={16 / 9}
          accessibilityLabel={article.title}
        />
      ) : null}
      <Text variant="subtitle">{article.title}</Text>
      {article.authorName ? (
        <Text variant="caption" tone="muted">
          {article.authorName}
          {article.readMinutes ? ` · ${article.readMinutes} min read` : ''}
        </Text>
      ) : null}
      <Text variant="body" tone="muted" numberOfLines={3}>
        {article.excerpt}
      </Text>
    </Card>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      {body}
    </Pressable>
  );
}
