import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ArticleCard } from '@/components/ArticleCard';
import { SearchField } from '@/components/SearchField';
import { SeoHead } from '@/components/SeoHead';
import { AppHeader } from '@/components/ui/AppHeader';
import { Chip } from '@/components/ui/Chip';
import { ChipRow } from '@/components/ui/CatalogLayout';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { useCollection } from '@/hooks/useCollection';
import { useTheme } from '@/lib/theme';
import { articlesQuery, type Article } from '@/lib/articles';
import { DEMO_ARTICLES } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { prefixQuery } from '@/lib/search';

const SECTIONS = ['Essays', 'Culture', 'Food', 'Cities', 'Letters'] as const;

export default function ArticlesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [section, setSection] = useState<(typeof SECTIONS)[number]>('Essays');
  const { data: live, isLoading } = useCollection<Article>(
    () => (term.trim() ? prefixQuery('articles', 'nameLower', term)! : articlesQuery()),
    term.trim() ? `articles:${term}` : 'articles',
  );
  const articles = withDemoFallback(live, DEMO_ARTICLES);
  const featured = articles[0];
  const rest = useMemo(() => articles.slice(1), [articles]);

  return (
    <Screen padded={false} width="full" scroll>
      <SeoHead title={t('content.articles')} path="/" />
      <View
        style={{
          gap: theme.spacing.lg,
          padding: theme.spacing.lg,
          maxWidth: 1120,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <AppHeader title={t('content.articles')} subtitle={t('content.articlesSubtitle')} />
        <SearchField value={term} onChangeText={setTerm} />
        <ChipRow>
          {SECTIONS.map((label) => (
            <Chip
              key={label}
              label={label}
              selected={section === label}
              onPress={() => setSection(label)}
            />
          ))}
        </ChipRow>
        {featured ? (
          <ArticleCard article={featured} onPress={() => router.push(`/article/${featured.id}`)} />
        ) : null}
        {rest.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            {rest.map((article) => (
              <View key={article.id} style={{ flexGrow: 1, flexBasis: 280, maxWidth: 420 }}>
                <ArticleCard
                  article={article}
                  onPress={() => router.push(`/article/${article.id}`)}
                />
              </View>
            ))}
          </View>
        ) : null}
        {!isLoading && articles.length === 0 ? <StateView kind="empty" /> : null}
      </View>
    </Screen>
  );
}
