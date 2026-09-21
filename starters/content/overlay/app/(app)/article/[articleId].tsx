import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { doc } from 'firebase/firestore';

import { CommentsSection } from '@/components/CommentsSection';
import { SeoHead } from '@/components/SeoHead';
import { Button } from '@/components/ui/Button';
import { MediaImage } from '@/components/ui/MediaImage';
import { ReaderLayout } from '@/components/ui/ReaderLayout';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useDocument } from '@/hooks/useDocument';
import type { Article } from '@/lib/articles';
import { DEMO_ARTICLES } from '@/lib/demo-content';
import { getDb } from '@/lib/firestore';
import { useTheme } from '@/lib/theme';
import { useBookmarksStore } from '@/stores/bookmarks';

export default function ArticleScreen() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const toggle = useBookmarksStore((s) => s.toggle);
  const bookmarked = useBookmarksStore((s) => s.ids.includes(articleId));
  const { data } = useDocument<Article>(
    () => doc(getDb(), 'articles', articleId),
    articleId ? `article:${articleId}` : null,
  );
  const article = data ?? DEMO_ARTICLES.find((entry) => entry.id === articleId) ?? null;

  return (
    <Screen padded={false} width="full" scroll>
      <Stack.Screen options={{ title: article?.title ?? t('content.articles') }} />
      <SeoHead
        title={article?.title ?? t('content.articles')}
        description={article?.excerpt}
        path={`/article/${articleId}`}
      />
      <ReaderLayout
        rail={
          <Button
            title={bookmarked ? t('content.unbookmark') : t('content.bookmark')}
            variant="secondary"
            size="sm"
            onPress={() => toggle(articleId)}
          />
        }
      >
        {article?.coverUrl ? <MediaImage uri={article.coverUrl} aspectRatio={16 / 9} /> : null}
        <View style={{ gap: theme.spacing.md, paddingTop: theme.spacing.lg }}>
          <Text variant="title">{article?.title ?? '…'}</Text>
          {article?.authorName ? (
            <Text variant="caption" tone="muted">
              {article.authorName}
              {article.readMinutes ? ` · ${article.readMinutes} min read` : ''}
            </Text>
          ) : null}
          <Text variant="body">{article?.body}</Text>
          {article && article.status !== 'draft' ? (
            <CommentsSection
              parentPath={`articles/${articleId}`}
              parentOwnerId={article.authorId}
            />
          ) : null}
          <Button
            title={bookmarked ? t('content.unbookmark') : t('content.bookmark')}
            onPress={() => toggle(articleId)}
          />
        </View>
      </ReaderLayout>
    </Screen>
  );
}
